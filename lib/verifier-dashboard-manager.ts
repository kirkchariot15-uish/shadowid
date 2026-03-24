/**
 * Verifier Dashboard Management
 * 
 * Allows services/verifiers to:
 * - Track proof requests they've sent
 * - Monitor proof responses received
 * - View verification statistics
 * - Manage verification workflows
 */

export interface VerifierProfile {
  id: string
  name: string
  url?: string
  description?: string
  apiKey: string
  verified: boolean
  createdAt: string
  requestsCreated: number
  responsesReceived: number
}

export interface VerificationSession {
  id: string
  verifierId: string
  requestId: string
  proofResponseId?: string
  status: 'pending' | 'received' | 'verified' | 'failed'
  userCommitment: string
  requiredAttributes: string[]
  receivedAttributes: string[]
  submittedAt?: string
  verifiedAt?: string
  metadata?: Record<string, any>
}

/**
 * Verifier Dashboard Manager
 * Manages verifier sessions and verification tracking
 */
class VerifierDashboardManager {
  private storageKey = 'shadowid-verifier-sessions-v1'
  private profileKey = 'shadowid-verifier-profile-v1'

  /**
   * Create or get verifier profile
   */
  getOrCreateProfile(verifierId: string): VerifierProfile {
    try {
      const stored = localStorage.getItem(this.profileKey)
      const profiles: VerifierProfile[] = stored ? JSON.parse(stored) : []
      
      let profile = profiles.find(p => p.id === verifierId)
      if (!profile) {
        profile = {
          id: verifierId,
          name: verifierId.split(':')[1] || verifierId,
          apiKey: `api_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`,
          verified: false,
          createdAt: new Date().toISOString(),
          requestsCreated: 0,
          responsesReceived: 0
        }
        profiles.push(profile)
        localStorage.setItem(this.profileKey, JSON.stringify(profiles))
      }
      return profile
    } catch (err) {
      console.error('[v0] Error managing verifier profile:', err)
      throw err
    }
  }

  /**
   * Create a verification session (when verifier sends a proof request)
   */
  createVerificationSession(
    verifierId: string,
    requestId: string,
    requiredAttributes: string[]
  ): VerificationSession {
    const session: VerificationSession = {
      id: `vs-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      verifierId,
      requestId,
      status: 'pending',
      userCommitment: '',
      requiredAttributes,
      receivedAttributes: []
    }

    const sessions = this.getSessions(verifierId)
    sessions.push(session)
    this.storeSessions(verifierId, sessions)

    console.log('[v0] Verification session created:', session.id)
    return session
  }

  /**
   * Record proof response received
   */
  recordProofResponse(
    verifierId: string,
    requestId: string,
    proofResponseId: string,
    userCommitment: string,
    receivedAttributes: string[]
  ): void {
    const sessions = this.getSessions(verifierId)
    const session = sessions.find(s => s.requestId === requestId)

    if (session) {
      session.proofResponseId = proofResponseId
      session.status = 'received'
      session.userCommitment = userCommitment
      session.receivedAttributes = receivedAttributes
      session.submittedAt = new Date().toISOString()

      this.storeSessions(verifierId, sessions)
      console.log('[v0] Proof response recorded for session:', session.id)
    }
  }

  /**
   * Mark proof as verified
   */
  markVerified(
    verifierId: string,
    sessionId: string,
    metadata?: Record<string, any>
  ): void {
    const sessions = this.getSessions(verifierId)
    const session = sessions.find(s => s.id === sessionId)

    if (session) {
      session.status = 'verified'
      session.verifiedAt = new Date().toISOString()
      session.metadata = metadata

      this.storeSessions(verifierId, sessions)
      console.log('[v0] Session marked as verified:', sessionId)
    }
  }

  /**
   * Get all sessions for a verifier
   */
  getSessions(verifierId: string): VerificationSession[] {
    try {
      const stored = localStorage.getItem(`${this.storageKey}-${verifierId}`)
      return stored ? JSON.parse(stored) : []
    } catch (err) {
      console.error('[v0] Error loading sessions:', err)
      return []
    }
  }

  /**
   * Store sessions for a verifier
   */
  private storeSessions(verifierId: string, sessions: VerificationSession[]): void {
    localStorage.setItem(`${this.storageKey}-${verifierId}`, JSON.stringify(sessions))
  }

  /**
   * Get session statistics
   */
  getStatistics(verifierId: string): {
    totalRequests: number
    pending: number
    received: number
    verified: number
    failed: number
    verificationRate: number
  } {
    const sessions = this.getSessions(verifierId)

    const stats = {
      totalRequests: sessions.length,
      pending: sessions.filter(s => s.status === 'pending').length,
      received: sessions.filter(s => s.status === 'received').length,
      verified: sessions.filter(s => s.status === 'verified').length,
      failed: sessions.filter(s => s.status === 'failed').length,
      verificationRate: 0
    }

    if (sessions.length > 0) {
      stats.verificationRate = Math.round((stats.verified / sessions.length) * 100)
    }

    return stats
  }

  /**
   * Get pending verifications
   */
  getPendingVerifications(verifierId: string): VerificationSession[] {
    return this.getSessions(verifierId).filter(s => s.status === 'received' || s.status === 'pending')
  }

  /**
   * Get recent verifications
   */
  getRecentVerifications(verifierId: string, limit: number = 10): VerificationSession[] {
    return this.getSessions(verifierId)
      .sort((a, b) => {
        const aTime = a.verifiedAt ? new Date(a.verifiedAt).getTime() : 0
        const bTime = b.verifiedAt ? new Date(b.verifiedAt).getTime() : 0
        return bTime - aTime
      })
      .slice(0, limit)
  }
}

// Export singleton
export const verifierDashboardManager = new VerifierDashboardManager()
