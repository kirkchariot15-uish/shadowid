'use client'

/**
 * Aleo Testnet Faucet Integration
 * Handles credit balance checking and requesting free testnet credits
 */

const FAUCET_API = 'https://faucet.aleo.org/api'
const TESTNET_API = 'https://api.explorer.provable.com/v1/testnet'

export interface CreditBalance {
  address: string
  balance: number
  unit: string
}

export interface FaucetRequest {
  address: string
  amount: number
}

/**
 * Get Aleo credit balance for an address
 */
export async function getCreditsBalance(address: string): Promise<CreditBalance | null> {
  try {
    const response = await fetch(`${TESTNET_API}/account/${address}`)
    
    if (!response.ok) {
      console.log('[v0] Address not found on testnet - no credits yet')
      return {
        address,
        balance: 0,
        unit: 'Aleo Credits'
      }
    }

    const data = await response.json()
    
    return {
      address,
      balance: data.balance || 0,
      unit: 'Aleo Credits'
    }
  } catch (err) {
    console.error('[v0] Failed to fetch credit balance:', err)
    return null
  }
}

/**
 * Request free credits from Aleo testnet faucet
 * Returns transaction hash for tracking
 */
export async function requestFaucetCredits(
  address: string,
  amount: number = 10
): Promise<{ success: boolean; txHash?: string; message?: string }> {
  try {
    const response = await fetch(`${FAUCET_API}/faucet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        amount,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        message: errorData.message || 'Faucet request failed. Try again later.',
      }
    }

    const data = await response.json()

    return {
      success: true,
      txHash: data.tx_hash || data.transaction_id,
      message: `Successfully requested ${amount} Aleo Credits. Credits should arrive within 1-2 minutes.`,
    }
  } catch (err) {
    console.error('[v0] Faucet request error:', err)
    return {
      success: false,
      message: 'Failed to connect to faucet. Check your internet connection.',
    }
  }
}

/**
 * Check if address has enough credits for identity creation
 * Estimated cost: 2-3 Aleo Credits
 */
export async function hasEnoughCredits(
  address: string,
  requiredCredits: number = 2
): Promise<boolean> {
  const balance = await getCreditsBalance(address)
  if (!balance) return false
  return balance.balance >= requiredCredits
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
  return credits.toFixed(2)
}
