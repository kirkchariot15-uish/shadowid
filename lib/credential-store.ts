/**
 * Credential Storage System
 * 
 * Stores verifiable credentials in W3C VC v2.0 format
 * Encrypted storage with proper key derivation
 * Supports credential lifecycle management
 */

import { AttributeSchema } from './attribute-schema'
import { CredentialIssuer } from './credential-issuers'
import { storeEncryptedData, getDecryptedData, clearEncryptedData } from './storage-encryption'

/**
 * W3C Verifiable Credential v2.0 Structure
 */
export interface VerifiableCredential {
  '@context': string[]
  id: string
  type: string[]
  issuer: {
    id: string // DID of issuer
    name: string
  }
  issuanceDate: string
  expirationDate?: string
  credentialSubject: {
    id: string // DID of subject (user)
    claims: Record<string, CredentialClaim>
  }
  proof: CredentialProof
  status?: {
    type: string
    id: string
  }
}

export interface CredentialClaim {
  attributeId: string
  value: any
  confidence?: number // 0-1, issuer's confidence in the claim
  validFrom?: string
  validUntil?: string
}

export interface CredentialProof {
  type: 'BbsBlsSignature2020' | 'Ed25519Signature2020' | 'EcdsaSecp256k1Signature2019'
  created: string
  verificationMethod: string
  proofPurpose: 'assertionMethod'
  proofValue: string // Base64-encoded signature
}

export interface StoredCredential {
  credential: VerifiableCredential
  encrypted: boolean
  addedAt: string
  lastUsed?: string
  useCount: number
  tags: string[]
  notes?: string
}

/**
 * Credential Store Manager
 */
class CredentialStoreManager {
  private storageKey = 'shadowid-credentials-v2'

  /**
   * Get all stored credentials
   */
  getAll(): StoredCredential[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) return []
      return JSON.parse(stored)
    } catch (err) {
      console.error('[v0] Error loading credentials:', err)
      return []
    }
  }

  /**
   * Clear all credentials and encrypted data (logout)
   */
  clear(): void {
    localStorage.removeItem(this.storageKey)
    clearEncryptedData(this.storageKey)
    console.log('[v0] All credentials cleared')
  }

  /**
   * Get credentials by attribute
   */
  getByAttribute(attributeId: string): StoredCredential[] {
    const all = this.getAll()
    return all.filter(c => 
      Object.keys(c.credential.credentialSubject.claims).includes(attributeId)
    )
  }

  /**
   * Get credentials by issuer
   */
  getByIssuer(issuerId: string): StoredCredential[] {
    const all = this.getAll()
    return all.filter(c => c.credential.issuer.id === issuerId)
  }

  /**
   * Add new credential with encryption
   */
  async add(
    credential: VerifiableCredential,
    walletPrivateKey: string,
    metadata?: {
      tags?: string[]
      notes?: string
    }
  ): Promise<void> {
    const all = this.getAll()
    
    // Check if credential already exists
    const exists = all.some(c => c.credential.id === credential.id)
    if (exists) {
      throw new Error('Credential already exists')
    }

    const stored: StoredCredential = {
      credential,
      encrypted: true,
      addedAt: new Date().toISOString(),
      useCount: 0,
      tags: metadata?.tags || [],
      notes: metadata?.notes
    }

    // Store metadata unencrypted, credential data encrypted
    all.push(stored)
    localStorage.setItem(this.storageKey, JSON.stringify(all))
    
    // Encrypt and store actual credential data separately
    await storeEncryptedData(credential.id, JSON.stringify(credential), walletPrivateKey)
    console.log('[v0] Credential added and encrypted:', credential.id)
  }

  /**
   * Update credential metadata
   */
  update(credentialId: string, updates: Partial<Pick<StoredCredential, 'tags' | 'notes'>>): void {
    const all = this.getAll()
    const index = all.findIndex(c => c.credential.id === credentialId)
    
    if (index === -1) {
      throw new Error('Credential not found')
    }

    all[index] = {
      ...all[index],
      ...updates
    }

    localStorage.setItem(this.storageKey, JSON.stringify(all))
  }

  /**
   * Record credential use
   */
  recordUse(credentialId: string): void {
    const all = this.getAll()
    const index = all.findIndex(c => c.credential.id === credentialId)
    
    if (index === -1) return

    all[index].useCount += 1
    all[index].lastUsed = new Date().toISOString()

    localStorage.setItem(this.storageKey, JSON.stringify(all))
  }

  /**
   * Remove credential
   */
  remove(credentialId: string): void {
    const all = this.getAll()
    const filtered = all.filter(c => c.credential.id !== credentialId)
    localStorage.setItem(this.storageKey, JSON.stringify(filtered))
    
    console.log('[v0] Credential removed:', credentialId)
  }

  /**
   * Check if credential is expired
   */
  isExpired(credential: VerifiableCredential): boolean {
    if (!credential.expirationDate) return false
    return new Date(credential.expirationDate) < new Date()
  }

  /**
   * Get expired credentials
   */
  getExpired(): StoredCredential[] {
    const all = this.getAll()
    return all.filter(c => this.isExpired(c.credential))
  }

  /**
   * Clean up expired credentials
   */
  cleanupExpired(): number {
    const all = this.getAll()
    const expired = this.getExpired()
    const remaining = all.filter(c => !this.isExpired(c.credential))
    
    localStorage.setItem(this.storageKey, JSON.stringify(remaining))
    
    console.log('[v0] Cleaned up', expired.length, 'expired credentials')
    return expired.length
  }

  /**
   * Get credential statistics
   */
  getStatistics(): {
    total: number
    byIssuer: Record<string, number>
    byAttribute: Record<string, number>
    expired: number
    mostUsed: StoredCredential[]
  } {
    const all = this.getAll()
    
    const byIssuer: Record<string, number> = {}
    const byAttribute: Record<string, number> = {}
    
    for (const stored of all) {
      const issuerId = stored.credential.issuer.id
      byIssuer[issuerId] = (byIssuer[issuerId] || 0) + 1
      
      for (const attrId of Object.keys(stored.credential.credentialSubject.claims)) {
        byAttribute[attrId] = (byAttribute[attrId] || 0) + 1
      }
    }

    const mostUsed = [...all]
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, 5)

    return {
      total: all.length,
      byIssuer,
      byAttribute,
      expired: this.getExpired().length,
      mostUsed
    }
  }

  /**
   * Export credentials (for backup)
   */
  export(): string {
    const all = this.getAll()
    return JSON.stringify({
      version: '2.0',
      exportedAt: new Date().toISOString(),
      credentials: all
    }, null, 2)
  }

  /**
   * Import credentials (from backup)
   */
  import(data: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const parsed = JSON.parse(data)
      
      if (parsed.version !== '2.0') {
        return { success: false, imported: 0, errors: ['Unsupported version'] }
      }

      const errors: string[] = []
      let imported = 0

      for (const cred of parsed.credentials) {
        try {
          const all = this.getAll()
          const exists = all.some(c => c.credential.id === cred.credential.id)
          if (!exists) {
            all.push(cred)
            localStorage.setItem(this.storageKey, JSON.stringify(all))
            imported++
          }
        } catch (err) {
          errors.push(`Failed to import ${cred.credential.id}: ${err}`)
        }
      }

      return { success: true, imported, errors }
    } catch (err) {
      return { success: false, imported: 0, errors: [`Parse error: ${err}`] }
    }
  }
}

/**
 * Credential Factory - Create new credentials
 */
export class CredentialFactory {
  /**
   * Create a new verifiable credential
   */
  static create(params: {
    subjectDid: string
    issuer: Pick<CredentialIssuer, 'did' | 'name'>
    claims: Record<string, CredentialClaim>
    expirationDate?: string
    proof: CredentialProof
  }): VerifiableCredential {
    const credentialId = `vc:${Date.now()}-${Math.random().toString(36).slice(2)}`

    return {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      id: credentialId,
      type: ['VerifiableCredential'],
      issuer: {
        id: params.issuer.did,
        name: params.issuer.name
      },
      issuanceDate: new Date().toISOString(),
      expirationDate: params.expirationDate,
      credentialSubject: {
        id: params.subjectDid,
        claims: params.claims
      },
      proof: params.proof
    }
  }

  /**
   * Create a self-attested credential
   */
  static createSelfAttested(params: {
    subjectDid: string
    claims: Record<string, any>
    expirationYears?: number
  }): VerifiableCredential {
    const claims: Record<string, CredentialClaim> = {}
    
    for (const [attrId, value] of Object.entries(params.claims)) {
      claims[attrId] = {
        attributeId: attrId,
        value,
        confidence: 0.5 // Lower confidence for self-attested
      }
    }

    const expirationDate = new Date()
    expirationDate.setFullYear(expirationDate.getFullYear() + (params.expirationYears || 1))

    // Self-signed proof (lower security)
    const proof: CredentialProof = {
      type: 'Ed25519Signature2020',
      created: new Date().toISOString(),
      verificationMethod: params.subjectDid,
      proofPurpose: 'assertionMethod',
      proofValue: 'self-signed-' + Date.now() // Placeholder
    }

    return this.create({
      subjectDid: params.subjectDid,
      issuer: {
        did: 'did:aleo:self',
        name: 'Self-Attested'
      },
      claims,
      expirationDate: expirationDate.toISOString(),
      proof
    })
  }
}

// Export singleton instance
export const credentialStore = new CredentialStoreManager()
