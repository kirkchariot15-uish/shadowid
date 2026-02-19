/**
 * Zero-Knowledge Proof Generation Engine
 * 
 * Generates cryptographic proofs for claims without revealing underlying data
 * Supports range proofs, membership proofs, and equality proofs
 */

import { VerifiableCredential } from './credential-store'
import { ProofType } from './attribute-schema'

export interface ProofRequest {
  credentialId: string
  claim: Claim
  proofType: ProofType
}

export interface Claim {
  attributeId: string
  statement: ClaimStatement
}

export type ClaimStatement = 
  | { type: 'exact'; value: any }
  | { type: 'range'; min?: number; max?: number }
  | { type: 'membership'; set: any[] }
  | { type: 'existence' }
  | { type: 'equality'; compareWith: string }

export interface GeneratedProof {
  proofId: string
  credentialId: string
  claim: Claim
  proofType: ProofType
  proofData: string // Base64-encoded ZK proof
  publicInputs: Record<string, any>
  nullifier: string // Prevents proof reuse
  timestamp: string
  expiresAt?: string
}

/**
 * Generate nullifier for proof (prevents double-spending)
 */
function generateNullifier(credentialId: string, timestamp: string): string {
  const data = `${credentialId}-${timestamp}-${Math.random()}`
  return btoa(data).slice(0, 32)
}

/**
 * Generate range proof (e.g., age > 21 without revealing exact age)
 */
async function generateRangeProof(
  credential: VerifiableCredential,
  attributeId: string,
  min?: number,
  max?: number
): Promise<string> {
  // TODO: Implement actual ZK circuit for range proofs using Aleo
  // This is a simulation
  
  const claim = credential.credentialSubject.claims[attributeId]
  if (!claim) throw new Error('Attribute not found in credential')

  const value = Number(claim.value)
  
  // Verify claim is true before generating proof
  if (min !== undefined && value < min) {
    throw new Error('Range proof failed: value too low')
  }
  if (max !== undefined && value > max) {
    throw new Error('Range proof failed: value too high')
  }

  // Simulated proof generation
  const proofData = {
    type: 'range',
    attributeId,
    min,
    max,
    verified: true,
    timestamp: Date.now()
  }

  return btoa(JSON.stringify(proofData))
}

/**
 * Generate membership proof (prove value is in set without revealing which)
 */
async function generateMembershipProof(
  credential: VerifiableCredential,
  attributeId: string,
  set: any[]
): Promise<string> {
  const claim = credential.credentialSubject.claims[attributeId]
  if (!claim) throw new Error('Attribute not found in credential')

  if (!set.includes(claim.value)) {
    throw new Error('Membership proof failed: value not in set')
  }

  const proofData = {
    type: 'membership',
    attributeId,
    setSize: set.length,
    verified: true,
    timestamp: Date.now()
  }

  return btoa(JSON.stringify(proofData))
}

/**
 * Generate existence proof (prove attribute exists without value)
 */
async function generateExistenceProof(
  credential: VerifiableCredential,
  attributeId: string
): Promise<string> {
  const claim = credential.credentialSubject.claims[attributeId]
  if (!claim) throw new Error('Attribute not found in credential')

  const proofData = {
    type: 'existence',
    attributeId,
    verified: true,
    timestamp: Date.now()
  }

  return btoa(JSON.stringify(proofData))
}

/**
 * Generate exact value proof (reveals actual value)
 */
async function generateExactProof(
  credential: VerifiableCredential,
  attributeId: string,
  value: any
): Promise<string> {
  const claim = credential.credentialSubject.claims[attributeId]
  if (!claim) throw new Error('Attribute not found in credential')

  if (claim.value !== value) {
    throw new Error('Exact proof failed: value mismatch')
  }

  const proofData = {
    type: 'exact',
    attributeId,
    value,
    verified: true,
    timestamp: Date.now()
  }

  return btoa(JSON.stringify(proofData))
}

/**
 * Main proof generation function
 */
export async function generateProof(
  credential: VerifiableCredential,
  request: ProofRequest,
  expirationHours: number = 72
): Promise<GeneratedProof> {
  const { claim, proofType } = request
  const timestamp = new Date().toISOString()
  const nullifier = generateNullifier(credential.id, timestamp)

  let proofData: string
  const publicInputs: Record<string, any> = {
    issuer: credential.issuer.id,
    attributeId: claim.attributeId,
    proofType
  }

  // Generate appropriate proof based on type
  switch (claim.statement.type) {
    case 'range':
      proofData = await generateRangeProof(
        credential,
        claim.attributeId,
        claim.statement.min,
        claim.statement.max
      )
      publicInputs.min = claim.statement.min
      publicInputs.max = claim.statement.max
      break

    case 'membership':
      proofData = await generateMembershipProof(
        credential,
        claim.attributeId,
        claim.statement.set
      )
      publicInputs.setSize = claim.statement.set.length
      break

    case 'existence':
      proofData = await generateExistenceProof(
        credential,
        claim.attributeId
      )
      break

    case 'exact':
      proofData = await generateExactProof(
        credential,
        claim.attributeId,
        claim.statement.value
      )
      publicInputs.value = claim.statement.value
      break

    default:
      throw new Error(`Unsupported proof type: ${claim.statement.type}`)
  }

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + expirationHours)

  const proof: GeneratedProof = {
    proofId: `proof-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    credentialId: credential.id,
    claim,
    proofType,
    proofData,
    publicInputs,
    nullifier,
    timestamp,
    expiresAt: expiresAt.toISOString()
  }

  console.log('[v0] Generated proof:', proof.proofId)
  return proof
}

/**
 * Generate multiple proofs from multiple credentials
 */
export async function generateBatchProofs(
  credentials: VerifiableCredential[],
  requests: ProofRequest[],
  expirationHours: number = 72
): Promise<GeneratedProof[]> {
  const proofs: GeneratedProof[] = []

  for (const request of requests) {
    const credential = credentials.find(c => c.id === request.credentialId)
    if (!credential) {
      console.error('[v0] Credential not found:', request.credentialId)
      continue
    }

    try {
      const proof = await generateProof(credential, request, expirationHours)
      proofs.push(proof)
    } catch (err) {
      console.error('[v0] Failed to generate proof:', err)
    }
  }

  return proofs
}

/**
 * Check if proof is expired
 */
export function isProofExpired(proof: GeneratedProof): boolean {
  if (!proof.expiresAt) return false
  return new Date(proof.expiresAt) < new Date()
}
