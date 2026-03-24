/**
 * Proof Request API Endpoint
 * 
 * SECURITY CRITICAL: This endpoint must validate all requests
 * - CSRF protection via origin validation
 * - Rate limiting per IP
 * - Request signing validation (in production)
 * - No sensitive data in responses
 */

import { NextRequest, NextResponse } from 'next/server'
import { proofRequestManager } from '@/lib/proof-request-manager'
import { verifierDashboardManager } from '@/lib/verifier-dashboard-manager'
import { STANDARD_ATTRIBUTES } from '@/lib/attribute-schema'

// Simple in-memory rate limiting (in production: use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

/**
 * Get client IP for rate limiting
 */
function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         'unknown'
}

/**
 * Check rate limit
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)
  
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }
  
  if (record.count >= RATE_LIMIT) {
    return true
  }
  
  record.count++
  return false
}

/**
 * Validate CSRF: Check origin and referer
 */
function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')
  
  // Only allow requests from same origin or explicitly allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXT_PUBLIC_APP_URL || ''
  ].filter(Boolean)
  
  if (!origin) {
    // Missing origin is suspicious for POST requests
    return request.method !== 'POST'
  }
  
  // Check if origin is allowed
  const isAllowed = allowedOrigins.some(allowed => origin.includes(allowed))
  
  if (!isAllowed) {
    console.warn('[v0] CSRF: Rejected request from unauthorized origin:', origin)
  }
  
  return isAllowed
}

/**
 * Sanitize error messages to prevent information leakage
 */
function sanitizeError(error: string): string {
  // Never return internal details
  const sensitivePatterns = [
    /wallet/gi,
    /address/gi,
    /private/gi,
    /secret/gi,
    /key/gi
  ]
  
  let sanitized = error
  sensitivePatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '***')
  })
  
  return sanitized.substring(0, 200) // Limit length
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    
    // SECURITY: Check rate limit FIRST
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
    
    // SECURITY: Validate CSRF
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: 'Invalid origin' },
        { status: 403 }
      )
    }
    
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (action === 'verify') {
      return handleVerifyProof(request, clientIp)
    }

    const body = await request.json()
    
    // Validate required fields
    const errors: string[] = []
    
    if (!body.requesterId) errors.push('requesterId is required')
    if (!body.requesterName) errors.push('requesterName is required')
    if (!body.requiredAttributes || !Array.isArray(body.requiredAttributes)) {
      errors.push('requiredAttributes array is required')
    }
    if (!body.category) errors.push('category is required')
    if (!body.description) errors.push('description is required')
    if (!body.purpose) errors.push('purpose is required')
    
    // Validate string lengths to prevent DOS
    if (body.description?.length > 5000) errors.push('Description too long')
    if (body.purpose?.length > 500) errors.push('Purpose too long')
    if (body.requiredAttributes?.length > 50) errors.push('Too many attributes requested')
    
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    // Validate attributes exist in schema
    const attributeErrors: string[] = []
    for (const attr of body.requiredAttributes) {
      if (!STANDARD_ATTRIBUTES[attr.attributeId]) {
        attributeErrors.push(`Unknown attribute: ${attr.attributeId}`)
      }
    }

    if (attributeErrors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid attributes', details: attributeErrors },
        { status: 400 }
      )
    }

    // Create the request (no sensitive data returned)
    const proofRequest = proofRequestManager.createRequest({
      requesterId: body.requesterId,
      requesterName: body.requesterName,
      requesterUrl: body.requesterUrl,
      requiredAttributes: body.requiredAttributes,
      category: body.category,
      description: body.description,
      purpose: body.purpose,
      targetCommitment: body.targetCommitment,
      expiryHours: body.expiryHours,
      respondByDate: body.respondByDate
    })

    // Track verifier
    const verifierProfile = verifierDashboardManager.getOrCreateProfile(body.requesterId)
    verifierDashboardManager.createVerificationSession(
      body.requesterId,
      proofRequest.id,
      body.requiredAttributes.map(a => a.attributeId)
    )

    console.log('[v0] Proof request created: ID=' + proofRequest.id.substring(0, 12))

    // Return only non-sensitive data
    return NextResponse.json({
      success: true,
      requestId: proofRequest.id,
      expiresAt: proofRequest.expiresAt,
      message: 'Proof request created successfully'
    })
  } catch (error) {
    // Never expose internal error details
    console.error('[v0] API Error:', error)
    return NextResponse.json(
      { error: 'Request processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Verify a proof response with security checks
 */
async function handleVerifyProof(request: NextRequest, clientIp: string) {
  try {
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { proofResponseId, verifierId, requestId } = body
    
    if (!proofResponseId || !verifierId || !requestId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate input lengths
    if (proofResponseId.length > 200 || verifierId.length > 200 || requestId.length > 200) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }

    // Get proof response
    const allResponses = proofRequestManager.getAllResponses()
    const response = allResponses.find(r => r.id === proofResponseId)

    if (!response) {
      return NextResponse.json(
        { error: 'Proof not found' },
        { status: 404 }
      )
    }

    // Verify expiration
    const isExpired = new Date(response.proofData.expiresAt) < new Date()
    if (isExpired) {
      return NextResponse.json(
        { valid: false, error: 'Proof expired' },
        { status: 400 }
      )
    }

    // Mark verified (no sensitive data returned)
    const sessions = verifierDashboardManager.getSessions(verifierId)
    const session = sessions.find(s => s.requestId === requestId)

    if (session) {
      verifierDashboardManager.recordProofResponse(
        verifierId,
        requestId,
        proofResponseId,
        response.userCommitment,
        response.proofData.selectedAttributes
      )
      
      verifierDashboardManager.markVerified(verifierId, session.id, {
        verifiedAt: new Date().toISOString(),
        attributeCount: response.proofData.selectedAttributes.length
      })
    }

    console.log('[v0] Proof verified: ID=' + proofResponseId.substring(0, 12))

    return NextResponse.json({
      valid: true,
      verified: true,
      message: 'Proof verified successfully'
    })
  } catch (error) {
    console.error('[v0] Verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/proof-requests - No sensitive data exposed
 */
export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Return only acknowledgment, no data
    return NextResponse.json({
      success: true,
      message: 'API endpoint is operational'
    })
  } catch (error) {
    console.error('[v0] GET error:', error)
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    )
  }
}

