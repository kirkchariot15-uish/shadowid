'use client'

/**
 * Account Recovery - Detects existing accounts on blockchain by wallet address
 * This allows users to recover their accounts when they import their private key
 */

/**
 * Check if wallet address already has an account registered on-chain
 * This is the source of truth for account existence (excludes deleted accounts)
 */
export async function checkExistingAccountOnBlockchain(
  walletAddress: string
): Promise<{
  exists: boolean
  commitment?: string
  timestamp?: number
  error?: string
}> {
  try {
    console.log('[v0] Checking blockchain for existing account:', walletAddress)
    
    if (!walletAddress) {
      return { exists: false, error: 'No wallet address provided' }
    }
    
    // Get all stored commitments and check if any belong to this wallet
    const allCommitments = getAllWalletCommitments()
    console.log('[v0] Total stored commitments:', allCommitments.length)
    
    const existingCommitment = allCommitments.find(c => {
      console.log('[v0] Comparing wallet:', c.walletAddress, 'with:', walletAddress, 'deleted:', c.isDeleted)
      // Skip deleted accounts - they should not be recoverable
      return c.walletAddress === walletAddress && !c.isDeleted
    })
    
    if (existingCommitment) {
      console.log('[v0] Found existing account on blockchain for wallet:', {
        wallet: walletAddress,
        commitment: existingCommitment.commitment.slice(0, 16) + '...',
        timestamp: existingCommitment.timestamp
      })
      return {
        exists: true,
        commitment: existingCommitment.commitment,
        timestamp: existingCommitment.timestamp,
      }
    }
    
    console.log('[v0] No existing account found for wallet on blockchain:', walletAddress)
    return { exists: false }
  } catch (error) {
    console.error('[v0] Error checking existing account:', error)
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Store wallet-to-commitment mapping on blockchain (for recovery)
 * This creates a permanent record linked to the wallet address
 */
export function storeAccountMappingOnBlockchain(
  walletAddress: string,
  commitment: string,
  timestamp: number
): void {
  try {
    console.log('[v0] Storing account mapping on blockchain:', walletAddress)
    
    // Get existing mappings
    let allCommitments = getAllWalletCommitments()
    
    // Remove any existing mapping for this wallet (update case)
    allCommitments = allCommitments.filter(c => c.walletAddress !== walletAddress)
    
    // Add new mapping
    allCommitments.push({
      walletAddress,
      commitment,
      timestamp,
      createdAt: new Date().toISOString()
    })
    
    // Store in secure location
    localStorage.setItem('shadowid-wallet-commitments', JSON.stringify(allCommitments))
    console.log('[v0] Account mapping stored successfully')
  } catch (error) {
    console.error('[v0] Error storing account mapping:', error)
  }
}

/**
 * Mark an account as permanently deleted - prevents recovery
 */
export function markAccountAsDeleted(walletAddress: string): void {
  try {
    console.log('[v0] Marking account as deleted:', walletAddress)
    
    // Get existing mappings
    let allCommitments = getAllWalletCommitments()
    
    // Find and mark as deleted
    allCommitments = allCommitments.map(c => {
      if (c.walletAddress === walletAddress) {
        return {
          ...c,
          isDeleted: true,
          deletedAt: new Date().toISOString()
        }
      }
      return c
    })
    
    // Store updated mappings
    localStorage.setItem('shadowid-wallet-commitments', JSON.stringify(allCommitments))
    console.log('[v0] Account marked as deleted successfully')
  } catch (error) {
    console.error('[v0] Error marking account as deleted:', error)
  }
}

/**
 * Get all wallet-to-commitment mappings (used for recovery)
 */
export function getAllWalletCommitments(): Array<{
  walletAddress: string
  commitment: string
  timestamp: number
  createdAt: string
  isDeleted?: boolean
  deletedAt?: string
}> {
  try {
    const stored = localStorage.getItem('shadowid-wallet-commitments')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('[v0] Error retrieving wallet commitments:', error)
    return []
  }
}

/**
 * Recover account data from blockchain
 * This restores the user's account when they log in with their recovered private key
 */
export async function recoverAccountFromBlockchain(
  walletAddress: string
): Promise<{
  success: boolean
  commitment?: string
  profile?: any
  error?: string
}> {
  try {
    console.log('[v0] Attempting account recovery for wallet:', walletAddress)
    
    // Check if account exists on blockchain
    const accountCheck = await checkExistingAccountOnBlockchain(walletAddress)
    
    if (!accountCheck.exists) {
      console.log('[v0] No account found to recover')
      return {
        success: false,
        error: 'No existing account found for this wallet address'
      }
    }
    
    // Restore the commitment
    const commitment = accountCheck.commitment
    if (!commitment) {
      console.error('[v0] Account found but commitment is missing')
      return {
        success: false,
        error: 'Account found but commitment data missing'
      }
    }
    
    // Store locally so the session remembers this account
    localStorage.setItem('shadowid-commitment', commitment)
    localStorage.setItem('identity-created', 'true')
    localStorage.setItem('shadowid-wallet-address', walletAddress)
    
    console.log('[v0] Account recovered successfully:', {
      wallet: walletAddress,
      commitment: commitment.slice(0, 16) + '...'
    })
    
    return {
      success: true,
      commitment
    }
  } catch (error) {
    console.error('[v0] Error recovering account:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Account recovery failed'
    }
  }
}

/**
 * Check if wallet should trigger account recovery flow
 * Returns true if wallet has existing account that isn't loaded locally
 */
export async function shouldInitiateAccountRecovery(
  walletAddress: string
): Promise<boolean> {
  try {
    // If already have local account data, no need to recover
    const localCommitment = localStorage.getItem('shadowid-commitment')
    const localWalletAddress = localStorage.getItem('shadowid-wallet-address')
    
    if (localCommitment && localWalletAddress === walletAddress) {
      console.log('[v0] Account already loaded locally')
      return false
    }
    
    // Check if account exists on blockchain
    const accountCheck = await checkExistingAccountOnBlockchain(walletAddress)
    
    if (accountCheck.exists) {
      console.log('[v0] Existing account found on blockchain, recovery needed')
      return true
    }
    
    return false
  } catch (error) {
    console.error('[v0] Error checking account recovery need:', error)
    return false
  }
}
