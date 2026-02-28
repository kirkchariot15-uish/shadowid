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
 * Get Aleo credit balance by querying wallet records
 * Must be called with wallet context (from use-aleo-wallet hook)
 */
export async function getCreditsBalance(
  address: string,
  requestRecordsFn?: (filter?: string) => Promise<any>
): Promise<CreditBalance | null> {
  try {
    // If wallet requestRecords function is available, use it to query actual credits
    if (requestRecordsFn) {
      try {
        const records = await requestRecordsFn('credits')
        
        if (records && Array.isArray(records)) {
          // Sum up all credit records
          const totalCredits = records.reduce((sum: number, record: any) => {
            const amount = record.gates || record.amount || 0
            return sum + (typeof amount === 'number' ? amount : 0)
          }, 0)
          
          // Convert gates to credits (1 credit = 1,000,000 gates)
          const creditsAmount = totalCredits / 1_000_000
          
          return {
            address,
            balance: creditsAmount,
            unit: 'Aleo Credits'
          }
        }
      } catch (err) {
        console.log('[v0] Wallet requestRecords not available, falling back to testnet API')
      }
    }

    // Fallback: Try testnet API for public balance info
    try {
      const response = await fetch(`${TESTNET_API}/account/${address}`)
      
      if (!response.ok) {
        console.log('[v0] Address not found on testnet API')
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
    } catch (apiErr) {
      console.log('[v0] Testnet API unavailable:', apiErr)
      return {
        address,
        balance: 0,
        unit: 'Aleo Credits'
      }
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
  requiredCredits: number = 2,
  requestRecordsFn?: (filter?: string) => Promise<any>
): Promise<boolean> {
  const balance = await getCreditsBalance(address, requestRecordsFn)
  if (!balance) return false
  return balance.balance >= requiredCredits
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
  return credits.toFixed(2)
}
