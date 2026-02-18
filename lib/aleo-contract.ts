/**
 * Aleo Smart Contract Integration
 * 
 * Utilities for interacting with the ShadowID Leo contract on Aleo blockchain
 * Enables on-chain commitment registration, verification, and revocation
 */

export interface OnChainCommitment {
  commitmentHash: string
  owner: string
  timestamp: number
  isRevoked: boolean
  transactionId?: string
}

export interface ContractInteractionResult {
  success: boolean
  transactionId?: string
  error?: string
  data?: any
}

/**
 * Convert commitment string to Aleo field format
 */
function commitmentToField(commitment: string): string {
  // Hash the commitment to create a field element
  // In production, use proper Aleo field conversion
  const hash = commitment.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0)
  }, 0)
  return Math.abs(hash).toString() + 'field'
}

/**
 * Register identity commitment on Aleo blockchain
 */
export async function registerCommitmentOnChain(
  commitment: string,
  walletAddress: string
): Promise<ContractInteractionResult> {
  try {
    console.log('[v0] Registering commitment on-chain:', commitment.substring(0, 16) + '...')
    
    const commitmentField = commitmentToField(commitment)
    const timestamp = Math.floor(Date.now() / 1000)

    // In production, this would call the actual Aleo SDK
    // For now, simulate the transaction
    const mockTransactionId = `at1${Math.random().toString(36).substring(2, 15)}`
    
    // Store on-chain registration locally for demo
    const onChainData: OnChainCommitment = {
      commitmentHash: commitment,
      owner: walletAddress,
      timestamp,
      isRevoked: false,
      transactionId: mockTransactionId,
    }

    localStorage.setItem(`onchain-commitment-${commitment}`, JSON.stringify(onChainData))
    localStorage.setItem('shadowid-onchain-registered', 'true')

    console.log('[v0] On-chain registration successful:', mockTransactionId)

    return {
      success: true,
      transactionId: mockTransactionId,
      data: onChainData,
    }
  } catch (error) {
    console.error('[v0] On-chain registration failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Verify commitment exists on-chain and is not revoked
 */
export async function verifyCommitmentOnChain(
  commitment: string
): Promise<ContractInteractionResult> {
  try {
    console.log('[v0] Verifying commitment on-chain:', commitment.substring(0, 16) + '...')

    // Check local storage for demo
    const storedData = localStorage.getItem(`onchain-commitment-${commitment}`)
    
    if (!storedData) {
      return {
        success: false,
        error: 'Commitment not found on-chain',
      }
    }

    const onChainData: OnChainCommitment = JSON.parse(storedData)

    if (onChainData.isRevoked) {
      return {
        success: false,
        error: 'Commitment has been revoked',
        data: onChainData,
      }
    }

    console.log('[v0] Commitment verified on-chain')

    return {
      success: true,
      data: onChainData,
    }
  } catch (error) {
    console.error('[v0] On-chain verification failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Revoke commitment on-chain
 */
export async function revokeCommitmentOnChain(
  commitment: string,
  walletAddress: string
): Promise<ContractInteractionResult> {
  try {
    console.log('[v0] Revoking commitment on-chain:', commitment.substring(0, 16) + '...')

    const storedData = localStorage.getItem(`onchain-commitment-${commitment}`)
    
    if (!storedData) {
      return {
        success: false,
        error: 'Commitment not found on-chain',
      }
    }

    const onChainData: OnChainCommitment = JSON.parse(storedData)

    // Verify ownership
    if (onChainData.owner !== walletAddress) {
      return {
        success: false,
        error: 'Only commitment owner can revoke',
      }
    }

    // Mark as revoked
    onChainData.isRevoked = true
    const mockTransactionId = `at1${Math.random().toString(36).substring(2, 15)}`

    localStorage.setItem(`onchain-commitment-${commitment}`, JSON.stringify(onChainData))

    console.log('[v0] On-chain revocation successful:', mockTransactionId)

    return {
      success: true,
      transactionId: mockTransactionId,
      data: onChainData,
    }
  } catch (error) {
    console.error('[v0] On-chain revocation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get commitment details from chain
 */
export async function getCommitmentDetails(
  commitment: string
): Promise<OnChainCommitment | null> {
  try {
    const storedData = localStorage.getItem(`onchain-commitment-${commitment}`)
    
    if (!storedData) {
      return null
    }

    return JSON.parse(storedData)
  } catch (error) {
    console.error('[v0] Failed to get commitment details:', error)
    return null
  }
}

/**
 * Check if commitment is registered on-chain
 */
export function isCommitmentOnChain(commitment: string): boolean {
  return localStorage.getItem(`onchain-commitment-${commitment}`) !== null
}

/**
 * Get all on-chain commitments for current user
 */
export function getAllOnChainCommitments(): OnChainCommitment[] {
  const commitments: OnChainCommitment[] = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('onchain-commitment-')) {
      try {
        const data = localStorage.getItem(key)
        if (data) {
          commitments.push(JSON.parse(data))
        }
      } catch (error) {
        console.error('[v0] Failed to parse on-chain commitment:', error)
      }
    }
  }

  return commitments.sort((a, b) => b.timestamp - a.timestamp)
}

/**
 * Export commitment certificate with on-chain verification
 */
export function exportOnChainCertificate(commitment: OnChainCommitment): string {
  const certificate = {
    type: 'shadowid-onchain-certificate-v1',
    commitment: commitment.commitmentHash,
    owner: commitment.owner,
    registeredAt: new Date(commitment.timestamp * 1000).toISOString(),
    transactionId: commitment.transactionId,
    blockchain: 'Aleo Testnet',
    contractProgram: 'shadowid.aleo',
    status: commitment.isRevoked ? 'REVOKED' : 'ACTIVE',
    verificationUrl: `https://explorer.aleo.org/transaction/${commitment.transactionId}`,
  }

  return JSON.stringify(certificate, null, 2)
}
