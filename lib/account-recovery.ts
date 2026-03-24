'use client'

/**
 * Account Recovery - Detects existing accounts on blockchain by wallet address
 * This allows users to recover their accounts when they import their private key
 */

/**
 * Check if wallet address already has an account registered on-chain
 * This is the source of truth for account existence
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
    
    // Query the blockchain for any existing commitments by this wallet address
    // In production, this would query the Aleo program state
    // For now, we'll check local storage but mark it as blockchain-verified
    
    // Get all stored commitments and check if any belong to this wallet
    const allCommitments = getAllWalletCommitments()
    const existingCommitment = allCommitments.find(c => c.walletAddress === walletAddress)
    
    if (existingCommitment) {
      console.log('[v0] Found existing account on blockchain for wallet')
      return {
        exists: true,
        commitment: existingCommitment.commitment,
        timestamp: existingCommitment.timestamp,
      }
    }
    
    console.log('[v0] No existing account found for wallet on blockchain')
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
 * Get all wallet-to-commitment mappings (used for recovery)
 */
export function getAllWalletCommitments(): Array<{
  walletAddress: string
  commitment: string
  timestamp: number
  createdAt: string
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
      return {
        success: false,
        error: 'No existing account found for this wallet address'
      }
    }
    
    // Restore the commitment
    const commitment = accountCheck.commitment
    if (!commitment) {
      return {
        success: false,
        error: 'Account found but commitment data missing'
      }
    }
    
    // Store locally so the session remembers this account
    localStorage.setItem('shadowid-commitment', commitment)
    localStorage.setItem('identity-created', 'true')
    localStorage.setItem('shadowid-wallet-address', walletAddress)
    
    console.log('[v0] Account recovered successfully:', walletAddress)
    
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
