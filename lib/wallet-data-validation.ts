'use client'

/**
 * Data Integrity & Wallet Validation
 * Ensures stored data belongs to current wallet address
 * Prevents data leakage between different wallet accounts
 */

export interface StoredDataMetadata {
  walletAddress: string
  storedAt: string
  expiresAt?: string
}

/**
 * Store data with wallet address metadata
 * Only allow retrieval if wallet address matches
 */
export function storeWithWalletValidation(key: string, data: any, walletAddress: string, expiryHours?: number) {
  const expiresAt = expiryHours 
    ? new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()
    : undefined

  const wrapped = {
    walletAddress,
    storedAt: new Date().toISOString(),
    expiresAt,
    data
  }

  try {
    localStorage.setItem(key, JSON.stringify(wrapped))
  } catch (error) {
    console.error(`[v0] Error storing ${key}:`, error)
    throw error
  }
}

/**
 * Retrieve data only if wallet address matches current wallet
 * Returns null if wallet doesn't match or data expired
 */
export function getWithWalletValidation(key: string, currentWalletAddress: string): any | null {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return null

    const wrapped = JSON.parse(stored)

    // Validate wallet address matches
    if (wrapped.walletAddress !== currentWalletAddress) {
      console.warn(`[v0] Data wallet mismatch for ${key}. Clearing stale data.`)
      localStorage.removeItem(key)
      return null
    }

    // Check expiration
    if (wrapped.expiresAt && new Date() > new Date(wrapped.expiresAt)) {
      console.warn(`[v0] Data expired for ${key}. Clearing stale data.`)
      localStorage.removeItem(key)
      return null
    }

    return wrapped.data
  } catch (error) {
    console.error(`[v0] Error retrieving ${key}:`, error)
    return null
  }
}

/**
 * Clear data without validation (for logout/delete scenarios)
 */
export function clearDataWithoutValidation(key: string) {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`[v0] Error clearing ${key}:`, error)
  }
}
