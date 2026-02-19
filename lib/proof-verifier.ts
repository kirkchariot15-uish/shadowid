import { GeneratedProof } from './proof-generator'

export interface VerificationResult {
  valid: boolean
  proofId: string
  verifiedClaims: string[]
  issuer: string
  errors: string[]
  warnings: string[]
  verifiedAt: string
}

export async function verifyProof(proof: GeneratedProof): Promise<VerificationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (proof.expiresAt && new Date(proof.expiresAt) < new Date()) {
    errors.push('Proof expired')
  }
  
  const nullifierUsed = checkNullifier(proof.nullifier)
  if (nullifierUsed) errors.push('Proof already used')
  
  const valid = errors.length === 0
  if (valid) recordNullifier(proof.nullifier)
  
  return {
    valid,
    proofId: proof.proofId,
    verifiedClaims: valid ? [formatClaim(proof)] : [],
    issuer: proof.publicInputs.issuer || 'Unknown',
    errors,
    warnings,
    verifiedAt: new Date().toISOString()
  }
}

function formatClaim(proof: GeneratedProof): string {
  const attr = proof.claim.attributeId.split(':')[1] || proof.claim.attributeId
  const stmt = proof.claim.statement
  
  if (stmt.type === 'range') {
    return `${attr} in range [${stmt.min || '?'}, ${stmt.max || '?'}]`
  }
  if (stmt.type === 'membership') return `${attr} verified`
  if (stmt.type === 'existence') return `${attr} exists`
  if (stmt.type === 'exact') return `${attr} = ${stmt.value}`
  return `${attr} verified`
}

const NULLIFIER_KEY = 'shadowid-nullifiers'

function checkNullifier(nullifier: string): boolean {
  const stored = localStorage.getItem(NULLIFIER_KEY)
  return stored ? JSON.parse(stored).includes(nullifier) : false
}

function recordNullifier(nullifier: string): void {
  const stored = localStorage.getItem(NULLIFIER_KEY)
  const nullifiers = stored ? JSON.parse(stored) : []
  nullifiers.push(nullifier)
  localStorage.setItem(NULLIFIER_KEY, JSON.stringify(nullifiers.slice(-1000)))
}
