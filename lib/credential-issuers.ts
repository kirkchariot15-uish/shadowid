/**
 * Credential Issuers Registry
 * 
 * Registry of trusted issuers who can attest to attributes
 * Includes issuer DIDs, public keys, reputation scores, and verification methods
 */

import { AttributeCategory } from './attribute-schema'

export interface CredentialIssuer {
  id: string
  name: string
  did: string // Decentralized Identifier
  publicKey: string // For signature verification
  website?: string
  description: string
  logo?: string
  categories: AttributeCategory[] // What types of attributes they can issue
  trustScore: number // 0-100
  verificationMethod: VerificationMethod
  status: 'active' | 'suspended' | 'revoked'
  issuedCount: number // Number of credentials issued
  createdAt: string
}

export type VerificationMethod = 
  | 'automated' // API integration, instant verification
  | 'manual' // Human review required
  | 'hybrid' // Mix of automated and manual
  | 'self-attested' // User self-attests, no external verification

export interface IssuerVerificationRequirement {
  issuerId: string
  method: VerificationMethod
  estimatedTime: string // e.g., "Instant", "1-3 days", "1 week"
  documentsRequired: string[]
  cost?: string // If paid service
}

/**
 * Registry of Trusted Issuers
 */
export const TRUSTED_ISSUERS: Record<string, CredentialIssuer> = {
  // Government Issuers
  'issuer:gov-id-verify': {
    id: 'issuer:gov-id-verify',
    name: 'Government ID Verification Service',
    did: 'did:aleo:gov-id-verify',
    publicKey: '0x...',
    website: 'https://id.gov',
    description: 'Official government identity verification service',
    categories: ['government', 'personal'],
    trustScore: 95,
    verificationMethod: 'hybrid',
    status: 'active',
    issuedCount: 150000,
    createdAt: '2024-01-01T00:00:00Z'
  },

  // Professional Issuers
  'issuer:linkedin-verify': {
    id: 'issuer:linkedin-verify',
    name: 'LinkedIn Professional Verification',
    did: 'did:aleo:linkedin',
    publicKey: '0x...',
    website: 'https://linkedin.com',
    description: 'Verify professional credentials and employment history',
    categories: ['professional'],
    trustScore: 85,
    verificationMethod: 'automated',
    status: 'active',
    issuedCount: 500000,
    createdAt: '2024-02-01T00:00:00Z'
  },

  'issuer:employer-direct': {
    id: 'issuer:employer-direct',
    name: 'Direct Employer Verification',
    did: 'did:aleo:employer',
    publicKey: '0x...',
    description: 'Employers can directly issue employment credentials',
    categories: ['professional'],
    trustScore: 90,
    verificationMethod: 'manual',
    status: 'active',
    issuedCount: 25000,
    createdAt: '2024-01-15T00:00:00Z'
  },

  // Education Issuers
  'issuer:university-registrar': {
    id: 'issuer:university-registrar',
    name: 'University Registrar Network',
    did: 'did:aleo:university',
    publicKey: '0x...',
    website: 'https://registrar.edu',
    description: 'Network of university registrars for degree verification',
    categories: ['education'],
    trustScore: 92,
    verificationMethod: 'manual',
    status: 'active',
    issuedCount: 75000,
    createdAt: '2024-01-01T00:00:00Z'
  },

  // DAO/Blockchain Issuers
  'issuer:dao-member-verify': {
    id: 'issuer:dao-member-verify',
    name: 'DAO Membership Verifier',
    did: 'did:aleo:dao-verifier',
    publicKey: '0x...',
    website: 'https://dao-verify.io',
    description: 'Verify DAO membership via on-chain data',
    categories: ['membership'],
    trustScore: 88,
    verificationMethod: 'automated',
    status: 'active',
    issuedCount: 10000,
    createdAt: '2024-03-01T00:00:00Z'
  },

  // Financial Issuers
  'issuer:credit-bureau': {
    id: 'issuer:credit-bureau',
    name: 'Credit Bureau Services',
    did: 'did:aleo:credit-bureau',
    publicKey: '0x...',
    website: 'https://creditbureau.com',
    description: 'Credit score and financial history verification',
    categories: ['financial'],
    trustScore: 90,
    verificationMethod: 'automated',
    status: 'active',
    issuedCount: 200000,
    createdAt: '2024-01-01T00:00:00Z'
  },

  // Self-Attestation (for non-critical attributes)
  'issuer:self-attested': {
    id: 'issuer:self-attested',
    name: 'Self-Attested',
    did: 'did:aleo:self',
    publicKey: '0x...',
    description: 'User self-attests to non-critical attributes',
    categories: ['personal', 'professional', 'membership'],
    trustScore: 50,
    verificationMethod: 'self-attested',
    status: 'active',
    issuedCount: 1000000,
    createdAt: '2024-01-01T00:00:00Z'
  },

  // Age Verification Services
  'issuer:age-verify': {
    id: 'issuer:age-verify',
    name: 'Age Verification Service',
    did: 'did:aleo:age-verify',
    publicKey: '0x...',
    website: 'https://ageverify.io',
    description: 'Third-party age verification without revealing exact birthdate',
    categories: ['personal'],
    trustScore: 85,
    verificationMethod: 'automated',
    status: 'active',
    issuedCount: 300000,
    createdAt: '2024-02-01T00:00:00Z'
  },
}

/**
 * Get issuers by category
 */
export function getIssuersByCategory(category: AttributeCategory): CredentialIssuer[] {
  return Object.values(TRUSTED_ISSUERS).filter(issuer => 
    issuer.categories.includes(category) && issuer.status === 'active'
  ).sort((a, b) => b.trustScore - a.trustScore)
}

/**
 * Get issuer by ID
 */
export function getIssuer(issuerId: string): CredentialIssuer | undefined {
  return TRUSTED_ISSUERS[issuerId]
}

/**
 * Get recommended issuers for an attribute
 */
export function getRecommendedIssuers(
  attributeId: string,
  requiresAttestation: boolean
): CredentialIssuer[] {
  // For attributes that don't require attestation, allow self-attestation
  if (!requiresAttestation) {
    return [TRUSTED_ISSUERS['issuer:self-attested']]
  }

  // Get attribute category from schema
  const category = attributeId.split(':')[0] as AttributeCategory
  
  return getIssuersByCategory(category).filter(issuer => 
    issuer.verificationMethod !== 'self-attested'
  )
}

/**
 * Verify issuer signature on credential
 */
export async function verifyIssuerSignature(
  issuerId: string,
  credential: any,
  signature: string
): Promise<{ valid: boolean; error?: string }> {
  const issuer = getIssuer(issuerId)
  
  if (!issuer) {
    return { valid: false, error: 'Unknown issuer' }
  }

  if (issuer.status !== 'active') {
    return { valid: false, error: 'Issuer is not active' }
  }

  // TODO: Implement actual signature verification using issuer's public key
  // For now, simulation
  console.log('[v0] Verifying signature for issuer:', issuerId)
  
  try {
    // Placeholder for actual cryptographic verification
    // Should use issuer.publicKey to verify signature on credential
    const isValid = true // Simulated
    
    return { valid: isValid }
  } catch (err) {
    return { valid: false, error: 'Signature verification failed' }
  }
}

/**
 * Get issuer reputation and trust indicators
 */
export function getIssuerReputation(issuerId: string): {
  trustScore: number
  badges: string[]
  warnings: string[]
} {
  const issuer = getIssuer(issuerId)
  
  if (!issuer) {
    return {
      trustScore: 0,
      badges: [],
      warnings: ['Unknown issuer']
    }
  }

  const badges: string[] = []
  const warnings: string[] = []

  // Trust score badges
  if (issuer.trustScore >= 90) {
    badges.push('Highly Trusted')
  } else if (issuer.trustScore >= 75) {
    badges.push('Trusted')
  } else if (issuer.trustScore >= 60) {
    badges.push('Verified')
  }

  // Issuance volume badges
  if (issuer.issuedCount > 100000) {
    badges.push('High Volume')
  }

  // Verification method badges
  if (issuer.verificationMethod === 'automated') {
    badges.push('Instant Verification')
  }

  // Status warnings
  if (issuer.status === 'suspended') {
    warnings.push('Currently suspended')
  } else if (issuer.status === 'revoked') {
    warnings.push('Issuer revoked')
  }

  // Trust score warnings
  if (issuer.trustScore < 60) {
    warnings.push('Low trust score')
  }

  if (issuer.verificationMethod === 'self-attested') {
    warnings.push('Self-attested credentials have lower trust')
  }

  return {
    trustScore: issuer.trustScore,
    badges,
    warnings
  }
}

/**
 * Request attestation from issuer (simulation)
 */
export async function requestAttestation(
  issuerId: string,
  attributeId: string,
  evidence: any
): Promise<{
  success: boolean
  attestationId?: string
  estimatedCompletion?: string
  error?: string
}> {
  const issuer = getIssuer(issuerId)
  
  if (!issuer) {
    return { success: false, error: 'Unknown issuer' }
  }

  if (issuer.status !== 'active') {
    return { success: false, error: 'Issuer not active' }
  }

  // Simulated attestation request
  const attestationId = `attest-${Date.now()}-${Math.random().toString(36).slice(2)}`
  
  let estimatedCompletion = 'Unknown'
  switch (issuer.verificationMethod) {
    case 'automated':
      estimatedCompletion = 'Instant'
      break
    case 'manual':
      estimatedCompletion = '3-5 business days'
      break
    case 'hybrid':
      estimatedCompletion = '1-2 business days'
      break
    case 'self-attested':
      estimatedCompletion = 'Instant'
      break
  }

  console.log('[v0] Attestation requested:', { issuerId, attributeId, attestationId })

  return {
    success: true,
    attestationId,
    estimatedCompletion
  }
}
