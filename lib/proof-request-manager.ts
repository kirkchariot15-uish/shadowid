/**
 * Proof Request Management System
 * 
 * Manages requests for users to provide proof of specific attributes.
 * This is the critical bridge between verifiers (services) and provers (users).
 * 
 * Architecture:
 * - Requests are created by verifiers with specific attribute requirements
 * - Users receive requests and can generate targeted proofs
 * - Proofs are linked back to requests for audit trail
 * - Nullifiers prevent proof reuse across requests
 */

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'revoked'
export type ProofRequestCategory = 'age-verification' | 'credential-check' | 'membership-proof' | 'custom'

export interface AttributeRequirement {
  attributeId: string
  attributeName: string
  proofType: 'exact' | 'range' | 'membership' | 'existence'
  description: string
  required: boolean
  
  // For range proofs (e.g., age > 18)
  minValue?: any
  maxValue?: any
  
  // For membership proofs
  allowedValues?: any[]
}

/**
 * Proof Request - Created by a verifier (service)
 * Represents a request for a user to prove specific attributes
 */
export interface ProofRequest {
  id: string
  requesterId: string
  requesterName: string
  requesterUrl?: string
  
  // What attributes are being requested
  requiredAttributes: AttributeRequirement[]
  
  // Request metadata
  category: ProofRequestCategory
  description: string
  purpose: string
  
  // Targeting
  targetCommitment?: string // Empty = all users, specific = targeted request
  
  // Timeline
  createdAt: string
  expiresAt: string
  respondByDate?: string
  
  // Status
  status: RequestStatus
  
  // Audit trail
  statusChanges: Array<{
    timestamp: string
    oldStatus: RequestStatus
    newStatus: RequestStatus
    reason?: string
  }>
}

/**
 * User-side record of a proof request received
 */
export interface ReceivedProofRequest extends ProofRequest {
  // User perspective
  receivedAt: string
  viewedAt?: string
  
  // Responses
  responses: ProofResponse[]
  
  // UI state
  dismissed: boolean
}

/**
 * Proof Response - User's response to a proof request
 * Links a proof back to the original request
 */
export interface ProofResponse {
  id: string
  requestId: string
  userCommitment: string
  userAddress: string
  
  // The actual proof
  proofData: {
    commitment: string
    selectedAttributes: string[]
    timestamp: number
    expiresAt: string
  }
  
  // Linking the proof to the request
  requestLinkId: string // Unique ID to prevent proof reuse
  nullifier: string // Prevents replay attacks
  
  // Metadata
  submittedAt: string
  verifiedAt?: string
  verified: boolean
  verifierFeedback?: string
}

/**
 * Proof Request Manager - Client-side storage
 * Uses localStorage for user proof request inbox
 */
class ProofRequestManager {
  private storageKey = 'shadowid-proof-requests-v1'
  private responseStorageKey = 'shadowid-proof-responses-v1'
  
  /**
   * Create a new proof request
   * Called by verifier services via API
   */
  createRequest(params: {
    requesterId: string
    requesterName: string
    requesterUrl?: string
    requiredAttributes: AttributeRequirement[]
    category: ProofRequestCategory
    description: string
    purpose: string
    targetCommitment?: string
    expiryHours?: number
    respondByDate?: string
  }): ProofRequest {
    const now = new Date()
    const expiryHours = params.expiryHours || 24 * 7 // Default 7 days
    const expiresAt = new Date(now.getTime() + expiryHours * 60 * 60 * 1000).toISOString()
    
    const request: ProofRequest = {
      id: `pr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      requesterId: params.requesterId,
      requesterName: params.requesterName,
      requesterUrl: params.requesterUrl,
      requiredAttributes: params.requiredAttributes,
      category: params.category,
      description: params.description,
      purpose: params.purpose,
      targetCommitment: params.targetCommitment,
      createdAt: now.toISOString(),
      expiresAt,
      respondByDate: params.respondByDate,
      status: 'pending',
      statusChanges: [
        {
          timestamp: now.toISOString(),
          oldStatus: 'pending' as RequestStatus,
          newStatus: 'pending',
          reason: 'Request created'
        }
      ]
    }
    
    console.log('[v0] Created proof request:', request.id)
    return request
  }

  /**
   * Add a received proof request to user's inbox
   */
  addToInbox(request: ProofRequest): void {
    const requests = this.getInbox()
    const received: ReceivedProofRequest = {
      ...request,
      receivedAt: new Date().toISOString(),
      responses: [],
      dismissed: false
    }
    
    requests.push(received)
    localStorage.setItem(this.storageKey, JSON.stringify(requests))
    console.log('[v0] Proof request added to inbox:', request.id)
  }

  /**
   * Get all proof requests in user's inbox
   */
  getInbox(): ReceivedProofRequest[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) return []
      return JSON.parse(stored)
    } catch (err) {
      console.error('[v0] Error loading proof requests:', err)
      return []
    }
  }

  /**
   * Get pending requests (not expired, not responded)
   */
  getPendingRequests(): ReceivedProofRequest[] {
    const inbox = this.getInbox()
    return inbox.filter(r => {
      const isExpired = new Date(r.expiresAt) < new Date()
      const hasResponse = r.responses.length > 0
      return !isExpired && !hasResponse && !r.dismissed && r.status === 'pending'
    })
  }

  /**
   * Get request by ID
   */
  getRequest(requestId: string): ReceivedProofRequest | undefined {
    return this.getInbox().find(r => r.id === requestId)
  }

  /**
   * Mark request as viewed
   */
  markAsViewed(requestId: string): void {
    const inbox = this.getInbox()
    const index = inbox.findIndex(r => r.id === requestId)
    
    if (index !== -1 && !inbox[index].viewedAt) {
      inbox[index].viewedAt = new Date().toISOString()
      localStorage.setItem(this.storageKey, JSON.stringify(inbox))
    }
  }

  /**
   * Dismiss a request (don't want to respond)
   */
  dismissRequest(requestId: string): void {
    const inbox = this.getInbox()
    const index = inbox.findIndex(r => r.id === requestId)
    
    if (index !== -1) {
      inbox[index].dismissed = true
      localStorage.setItem(this.storageKey, JSON.stringify(inbox))
    }
  }

  /**
   * Add a proof response to a request
   */
  addResponse(requestId: string, response: ProofResponse): void {
    const inbox = this.getInbox()
    const index = inbox.findIndex(r => r.id === requestId)
    
    if (index === -1) {
      throw new Error('Request not found')
    }
    
    inbox[index].responses.push(response)
    inbox[index].status = 'approved'
    localStorage.setItem(this.storageKey, JSON.stringify(inbox))
    
    // Also store response for verification tracking
    this.storeResponse(response)
    console.log('[v0] Response added to request:', requestId)
  }

  /**
   * Store proof response for audit trail
   */
  private storeResponse(response: ProofResponse): void {
    try {
      const stored = localStorage.getItem(this.responseStorageKey)
      const responses = stored ? JSON.parse(stored) : []
      responses.push(response)
      // Keep last 1000 responses
      localStorage.setItem(
        this.responseStorageKey,
        JSON.stringify(responses.slice(-1000))
      )
    } catch (err) {
      console.error('[v0] Error storing response:', err)
    }
  }

  /**
   * Get all proof responses
   */
  getAllResponses(): ProofResponse[] {
    try {
      const stored = localStorage.getItem(this.responseStorageKey)
      return stored ? JSON.parse(stored) : []
    } catch (err) {
      console.error('[v0] Error loading responses:', err)
      return []
    }
  }

  /**
   * Get responses for a specific request
   */
  getResponses(requestId: string): ProofResponse[] {
    return this.getAllResponses().filter(r => r.requestId === requestId)
  }

  /**
   * Get statistics on requests
   */
  getStatistics(): {
    total: number
    pending: number
    approved: number
    rejected: number
    expired: number
    totalResponses: number
  } {
    const inbox = this.getInbox()
    const now = new Date()
    
    return {
      total: inbox.length,
      pending: inbox.filter(r => r.status === 'pending' && new Date(r.expiresAt) > now).length,
      approved: inbox.filter(r => r.status === 'approved').length,
      rejected: inbox.filter(r => r.status === 'rejected').length,
      expired: inbox.filter(r => new Date(r.expiresAt) < now).length,
      totalResponses: this.getAllResponses().length
    }
  }

  /**
   * Create a request link ID to prevent proof reuse
   * Each response to a request gets a unique link ID
   */
  createRequestLinkId(requestId: string, userCommitment: string): string {
    return `link-${requestId}-${userCommitment}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }

  /**
   * Create a nullifier for proof response
   * Prevents the same proof from being used multiple times
   */
  createNullifier(proofData: any, requestLinkId: string): string {
    const combined = `${proofData.commitment}${requestLinkId}${proofData.timestamp}`
    return `nul-${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${combined.slice(0, 16)}`
  }

  /**
   * Clear all requests (for testing or logout)
   */
  clear(): void {
    localStorage.removeItem(this.storageKey)
    localStorage.removeItem(this.responseStorageKey)
  }
}

// Export singleton instance
export const proofRequestManager = new ProofRequestManager()

/**
 * Helper function to check if a request is relevant to a user
 */
export function isRequestRelevant(request: ProofRequest, userCommitment: string): boolean {
  // If no target commitment, request is for all users
  if (!request.targetCommitment) return true
  
  // If target commitment specified, only relevant to that user
  return request.targetCommitment === userCommitment
}

/**
 * Helper function to format request for display
 */
export function formatRequestDisplay(request: ReceivedProofRequest): {
  title: string
  subtitle: string
  urgency: 'low' | 'medium' | 'high'
  daysRemaining: number
} {
  const now = new Date()
  const expiry = new Date(request.expiresAt)
  const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  let urgency: 'low' | 'medium' | 'high' = 'low'
  if (daysRemaining <= 1) urgency = 'high'
  else if (daysRemaining <= 3) urgency = 'medium'
  
  return {
    title: request.description,
    subtitle: `${request.requesterName} is requesting proof of your attributes`,
    urgency,
    daysRemaining: Math.max(0, daysRemaining)
  }
}
