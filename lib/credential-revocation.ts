import { addActivityLog } from './activity-logger'

export interface RevokedCredential {
  commitmentHash: string
  revokedAt: string
  reason: string
  replacementCommitment?: string
}

export interface CredentialRevocationList {
  version: number
  lastUpdated: string
  revokedCredentials: RevokedCredential[]
}

/**
 * Get the user's revocation list from encrypted storage
 */
export function getRevocationList(): CredentialRevocationList {
  try {
    const stored = localStorage.getItem('shadowid-revocation-list')
    if (!stored) {
      return {
        version: 1,
        lastUpdated: new Date().toISOString(),
        revokedCredentials: []
      }
    }
    return JSON.parse(stored)
  } catch (err) {
    console.error('[v0] Error reading revocation list:', err)
    return {
      version: 1,
      lastUpdated: new Date().toISOString(),
      revokedCredentials: []
    }
  }
}

/**
 * Revoke a credential with optional reason
 */
export function revokeCredential(
  commitmentHash: string,
  reason: string = 'User initiated revocation',
  replacementCommitment?: string
): void {
  try {
    const list = getRevocationList()
    
    // Check if already revoked
    if (list.revokedCredentials.some(c => c.commitmentHash === commitmentHash)) {
      console.warn('[v0] Credential already revoked')
      return
    }

    const revocation: RevokedCredential = {
      commitmentHash,
      revokedAt: new Date().toISOString(),
      reason,
      replacementCommitment,
    }

    list.revokedCredentials.push(revocation)
    list.lastUpdated = new Date().toISOString()
    list.version += 1

    localStorage.setItem('shadowid-revocation-list', JSON.stringify(list))
    
    // Log the revocation
    addActivityLog(
      'Credential Revoked',
      'security',
      `Commitment ${commitmentHash.substring(0, 8)}... revoked. Reason: ${reason}`,
      'warning'
    )
  } catch (err) {
    console.error('[v0] Error revoking credential:', err)
    addActivityLog('Revocation Failed', 'security', 'Failed to revoke credential', 'error')
  }
}

/**
 * Check if a credential is revoked
 */
export function isCredentialRevoked(commitmentHash: string): boolean {
  const list = getRevocationList()
  return list.revokedCredentials.some(c => c.commitmentHash === commitmentHash)
}

/**
 * Get revocation reason for a commitment
 */
export function getRevocationReason(commitmentHash: string): string | null {
  const list = getRevocationList()
  const revoked = list.revokedCredentials.find(c => c.commitmentHash === commitmentHash)
  return revoked?.reason ?? null
}

/**
 * Get replacement credential if exists
 */
export function getReplacementCredential(commitmentHash: string): string | null {
  const list = getRevocationList()
  const revoked = list.revokedCredentials.find(c => c.commitmentHash === commitmentHash)
  return revoked?.replacementCommitment ?? null
}

/**
 * Revoke all credentials and clear the current one
 */
export function revokeAllCredentials(reason: string = 'User initiated bulk revocation'): void {
  try {
    const currentCommitment = localStorage.getItem('shadowid-commitment')
    
    if (currentCommitment) {
      revokeCredential(currentCommitment, reason)
      
      // Clear all ShadowID data
      localStorage.removeItem('shadowid-commitment')
      localStorage.removeItem('shadowid-created-at')
      localStorage.removeItem('shadowid-user-info')
      localStorage.removeItem('shadowid-encrypted-materials')
      
      addActivityLog(
        'All Credentials Revoked',
        'security',
        'All credentials and identity materials cleared. Reason: ' + reason,
        'warning'
      )
    }
  } catch (err) {
    console.error('[v0] Error revoking all credentials:', err)
  }
}

/**
 * Generate revocation certificate (for future on-chain use)
 */
export function generateRevocationCertificate(commitmentHash: string): string {
  const list = getRevocationList()
  const revocation = list.revokedCredentials.find(c => c.commitmentHash === commitmentHash)
  
  if (!revocation) {
    throw new Error('Credential not found in revocation list')
  }

  return JSON.stringify({
    type: 'shadowid-revocation-certificate-v1',
    commitment: commitmentHash,
    revokedAt: revocation.revokedAt,
    reason: revocation.reason,
    replacement: revocation.replacementCommitment,
    certificateGeneratedAt: new Date().toISOString(),
  })
}
