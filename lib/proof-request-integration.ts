/**
 * Proof Request Integration Utilities
 * 
 * Bridges proof requests with the proof generation system
 * Ensures proofs are linked to requests and tracked properly
 */

import { ProofRequest, ProofResponse, proofRequestManager } from './proof-request-manager'
import { addActivityLog } from './activity-logger'

/**
 * Initialize proof request system
 * Call this when user connects wallet
 */
export function initializeProofRequestSystem(userCommitment: string, userAddress: string): void {
  try {
    // Check for any new proof requests (in production, would sync from backend)
    console.log('[v0] Proof request system initialized for user:', userAddress.slice(0, 8))
    
    // Log initialization
    addActivityLog(
      'Initialize Proof Requests',
      'identity',
      'Proof request system ready',
      'success'
    )
  } catch (error) {
    console.error('[v0] Error initializing proof requests:', error)
  }
}

/**
 * Process incoming proof request
 * Called when a request is received via webhook or poll
 */
export async function processIncomingProofRequest(
  request: ProofRequest,
  userCommitment: string
): Promise<boolean> {
  try {
    // Check if request is relevant to this user
    if (request.targetCommitment && request.targetCommitment !== userCommitment) {
      return false
    }

    // Add to user's inbox
    proofRequestManager.addToInbox(request)

    console.log('[v0] Added proof request to inbox:', request.id)

    // Log activity
    addActivityLog(
      'Received Proof Request',
      'identity',
      `Received proof request from ${request.requesterName}`,
      'success',
      { requestId: request.id, requester: request.requesterId }
    )

    return true
  } catch (error) {
    console.error('[v0] Error processing proof request:', error)
    return false
  }
}

/**
 * Link a proof to a request
 * Called when user generates a proof response
 */
export function linkProofToRequest(
  requestId: string,
  proofData: any,
  userCommitment: string,
  userAddress: string
): { requestLinkId: string; nullifier: string } {
  try {
    // Create unique link ID
    const requestLinkId = proofRequestManager.createRequestLinkId(requestId, userCommitment)

    // Create nullifier for replay protection
    const nullifier = proofRequestManager.createNullifier(proofData, requestLinkId)

    console.log('[v0] Proof linked to request:', {
      requestId: requestId.slice(0, 12),
      linkId: requestLinkId.slice(0, 16),
      nullifier: nullifier.slice(0, 16)
    })

    // Log activity
    addActivityLog(
      'Link Proof to Request',
      'identity',
      `Linked proof response to request ${requestId.slice(0, 8)}`,
      'success',
      { requestId, linkId: requestLinkId.slice(0, 16) }
    )

    return { requestLinkId, nullifier }
  } catch (error) {
    console.error('[v0] Error linking proof:', error)
    throw error
  }
}

/**
 * Get proof statistics
 * Summary of requests and responses
 */
export function getProofStatistics(): {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  totalResponses: number
  responseRate: number
} {
  try {
    const stats = proofRequestManager.getStatistics()

    return {
      totalRequests: stats.total,
      pendingRequests: stats.pending,
      approvedRequests: stats.approved,
      totalResponses: stats.totalResponses,
      responseRate: stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0
    }
  } catch (error) {
    console.error('[v0] Error getting proof statistics:', error)
    return {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      totalResponses: 0,
      responseRate: 0
    }
  }
}

/**
 * Create a shareable proof request link
 * For manual sharing outside of QR codes
 */
export function createProofRequestLink(requestId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  return `${baseUrl}/proof-request/${requestId}`
}

/**
 * Create a proof verification link
 * For verifiers to check proof responses
 */
export function createProofVerificationLink(
  requestLinkId: string,
  requestId: string
): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  return `${baseUrl}/verify?requestId=${requestId}&requestLinkId=${requestLinkId}`
}

/**
 * Validate proof request before responding
 */
export function validateProofRequest(request: ProofRequest): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check if expired
  if (new Date(request.expiresAt) < new Date()) {
    errors.push('This proof request has expired')
  }

  // Check if has required attributes
  if (!request.requiredAttributes || request.requiredAttributes.length === 0) {
    errors.push('No attributes required in this request')
  }

  // Check if any required attributes are marked as required: true
  const hasRequiredAttrs = request.requiredAttributes.some(a => a.required)
  if (!hasRequiredAttrs && request.requiredAttributes.every(a => !a.required)) {
    errors.push('No required attributes specified')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Export proof data for sharing
 * Creates a portable proof that can be stored or transmitted
 */
export function exportProofResponse(response: ProofResponse): string {
  try {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      proofResponse: response
    }, null, 2)
  } catch (error) {
    console.error('[v0] Error exporting proof:', error)
    throw error
  }
}

/**
 * Import proof data from export
 * Restores a previously exported proof
 */
export function importProofResponse(data: string): ProofResponse | null {
  try {
    const parsed = JSON.parse(data)
    
    if (parsed.version !== '1.0') {
      throw new Error('Unsupported export version')
    }

    return parsed.proofResponse
  } catch (error) {
    console.error('[v0] Error importing proof:', error)
    return null
  }
}
