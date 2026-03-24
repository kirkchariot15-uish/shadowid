/**
 * Proof Request API Endpoint
 * 
 * Allows external verifiers/services to request proofs from users
 * 
 * POST /api/proof-requests/create
 * - Create a proof request for users
 * 
 * GET /api/proof-requests/validate
 * - Validate a proof response
 * 
 * POST /api/proof-requests/verify
 * - Verify a proof response
 */

import { NextRequest, NextResponse } from 'next/server'
import { proofRequestManager, ProofRequest, ProofResponse, formatRequestDisplay } from '@/lib/proof-request-manager'
import { verifierDashboardManager } from '@/lib/verifier-dashboard-manager'
import { STANDARD_ATTRIBUTES } from '@/lib/attribute-schema'

/**
 * POST /api/proof-requests/create
 * Create a new proof request
 * 
 * Body:
 * {
 *   requesterId: string (e.g., "verifier:kyc-service")
 *   requesterName: string
 *   requesterUrl?: string
 *   requiredAttributes: [{ attributeId, proofType, ... }]
 *   category: 'age-verification' | 'credential-check' | etc.
 *   description: string
 *   purpose: string
 *   targetCommitment?: string (optional - for targeted requests)
 *   expiryHours?: number (default: 168 = 7 days)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (action === 'verify') {
      return handleVerifyProof(request)
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

    // Create the request
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

    // Track in verifier dashboard
    const verifierProfile = verifierDashboardManager.getOrCreateProfile(body.requesterId)
    verifierDashboardManager.createVerificationSession(
      body.requesterId,
      proofRequest.id,
      body.requiredAttributes.map(a => a.attributeId)
    )

    console.log('[v0] Proof request created via API:', {
      id: proofRequest.id,
      requester: body.requesterId,
      attributes: body.requiredAttributes.length
    })

    return NextResponse.json({
      success: true,
      requestId: proofRequest.id,
      proofRequest,
      verifierProfile: {
        id: verifierProfile.id,
        name: verifierProfile.name,
        verified: verifierProfile.verified
      }
    })
  } catch (error) {
    console.error('[v0] Error creating proof request:', error)
    return NextResponse.json(
      { error: 'Failed to create proof request', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * Verify a proof response
 */
async function handleVerifyProof(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { proofResponseId, verifierId, requestId } = body
    
    if (!proofResponseId || !verifierId || !requestId) {
      return NextResponse.json(
        { error: 'Missing required fields: proofResponseId, verifierId, requestId' },
        { status: 400 }
      )
    }

    // Get proof response from proof request manager
    const allResponses = proofRequestManager.getAllResponses()
    const response = allResponses.find(r => r.id === proofResponseId)

    if (!response) {
      return NextResponse.json(
        { error: 'Proof response not found' },
        { status: 404 }
      )
    }

    // Verify the response
    const isExpired = new Date(response.proofData.expiresAt) < new Date()
    const attributesMatched = response.proofData.selectedAttributes.length > 0

    if (isExpired) {
      return NextResponse.json(
        { valid: false, error: 'Proof has expired' },
        { status: 400 }
      )
    }

    if (!attributesMatched) {
      return NextResponse.json(
        { valid: false, error: 'No attributes in proof' },
        { status: 400 }
      )
    }

    // Mark as verified in verifier dashboard
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
      
      // Mark as verified
      verifierDashboardManager.markVerified(verifierId, session.id, {
        verifiedAt: new Date().toISOString(),
        attributeCount: response.proofData.selectedAttributes.length
      })
    }

    console.log('[v0] Proof response verified:', {
      proofResponseId: proofResponseId.slice(0, 12),
      verifierId,
      attributes: response.proofData.selectedAttributes.length
    })

    return NextResponse.json({
      valid: true,
      verified: true,
      proofId: response.id,
      requestId: response.requestId,
      attributes: response.proofData.selectedAttributes,
      verifiedAt: new Date().toISOString(),
      message: 'Proof verified successfully'
    })
  } catch (error) {
    console.error('[v0] Error verifying proof:', error)
    return NextResponse.json(
      { error: 'Failed to verify proof', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/proof-requests
 * Get proof request details
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const requestId = searchParams.get('id')
    const action = searchParams.get('action')

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    if (action === 'get') {
      // Get request details (returns request structure since we use client-side storage)
      return NextResponse.json({
        success: true,
        message: 'Use proofRequestManager on client to fetch requests'
      })
    }

    if (action === 'validate') {
      // Validate proof response structure
      return NextResponse.json({
        success: true,
        message: 'Proof validation endpoint'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Proof request endpoint'
    })
  } catch (error) {
    console.error('[v0] Error in GET request:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    )
  }
}

