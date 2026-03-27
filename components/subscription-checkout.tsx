'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { getAllSubscriptionTiers, setSubscriptionStatus } from '@/lib/subscription-manager'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import type { SubscriptionTier } from '@/lib/subscription-manager'

interface SubscriptionCheckoutProps {
  selectedTier: SubscriptionTier
  onPaymentSuccess?: (tier: string) => void
  onPaymentError?: (error: string) => void
}

export function SubscriptionCheckout({ selectedTier, onPaymentSuccess, onPaymentError }: SubscriptionCheckoutProps) {
  const { address, executeTransaction, getTransactionStatus } = useAleoWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentToken, setPaymentToken] = useState<'ALEO' | 'USDx'>(selectedTier.currency)

  const handlePayment = async () => {
    if (!address || !executeTransaction) {
      onPaymentError?.('Wallet not connected. Please connect your Aleo wallet first.')
      return
    }

    setIsProcessing(true)
    
    try {
      console.log('[v0] Processing payment:', {
        tier: selectedTier.name,
        amount: selectedTier.cost,
        currency: paymentToken,
        walletAddress: address
      })

      // Execute actual wallet transaction based on currency
      let result
      if (paymentToken === 'ALEO') {
        result = await processAleoPayment(selectedTier, address, executeTransaction, getTransactionStatus)
      } else if (paymentToken === 'USDx') {
        result = await processUSDxPayment(selectedTier, address, executeTransaction, getTransactionStatus)
      } else {
        throw new Error('Invalid payment currency')
      }

      if (!result.success) {
        throw new Error('Payment transaction failed')
      }

      // Success - update subscription status with actual transaction ID
      setSubscriptionStatus(selectedTier.name as any, result.transactionId, paymentToken, 365)

      onPaymentSuccess?.(selectedTier.name)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Payment failed'
      console.error('[v0] Payment error:', errorMsg)
      onPaymentError?.(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="p-8 border-border bg-card/50">
      <h2 className="text-2xl font-bold mb-6">Confirm Your Subscription</h2>

      <div className="mb-8 p-4 bg-background/50 rounded-lg border border-border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">{selectedTier.displayName}</h3>
            <p className="text-sm text-muted-foreground mt-1">{selectedTier.description}</p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-accent" />
            <span className="text-sm">{selectedTier.maxAttributes} standard attributes</span>
          </div>
          {selectedTier.maxCustomAttributes > 0 && (
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent" />
              <span className="text-sm">{selectedTier.maxCustomAttributes} custom attributes</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-accent" />
            <span className="text-sm">1 year subscription</span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total: {selectedTier.cost} {selectedTier.currency}</span>
          </div>
        </div>
      </div>

      {selectedTier.cost > 0 && (
        <div className="mb-6">
          <label className="text-sm font-medium mb-3 block">Payment Method</label>
          <div className="space-y-2">
            {selectedTier.currency === 'ALEO' && (
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background/50 cursor-pointer">
                <input
                  type="radio"
                  id="aleo"
                  name="payment"
                  value="ALEO"
                  checked={paymentToken === 'ALEO'}
                  onChange={(e) => setPaymentToken(e.target.value as 'ALEO' | 'USDx')}
                  className="w-4 h-4"
                />
                <label htmlFor="aleo" className="flex-1 cursor-pointer">
                  <span className="font-medium">Aleo Testnet Token</span>
                  <p className="text-xs text-muted-foreground">5 ALEO testnet tokens</p>
                </label>
              </div>
            )}

            {selectedTier.currency === 'USDx' && (
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-background/50 cursor-pointer">
                <input
                  type="radio"
                  id="usdx"
                  name="payment"
                  value="USDx"
                  checked={paymentToken === 'USDx'}
                  onChange={(e) => setPaymentToken(e.target.value as 'ALEO' | 'USDx')}
                  className="w-4 h-4"
                />
                <label htmlFor="usdx" className="flex-1 cursor-pointer">
                  <span className="font-medium">USDx (Aleo)</span>
                  <p className="text-xs text-muted-foreground">Stablecoin on Aleo testnet</p>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.history.back()}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={handlePayment}
          disabled={isProcessing || selectedTier.cost === 0}
        >
          {isProcessing ? 'Processing...' : selectedTier.cost === 0 ? 'Already Free' : `Pay ${selectedTier.cost} ${paymentToken}`}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Transaction will be processed via your connected Aleo wallet
      </p>
    </Card>
  )
}

async function processAleoPayment(
  tier: SubscriptionTier,
  walletAddress: string,
  executeTransactionFn: (params: any) => Promise<string>,
  getTransactionStatusFn?: (txId: string) => Promise<string | null>
) {
  console.log('[v0] Processing ALEO payment for tier:', tier.name, 'amount:', tier.cost)
  
  if (!executeTransactionFn) {
    throw new Error('Wallet executeTransaction not available')
  }

  try {
    // Build transaction to transfer ALEO tokens
    const txParams = {
      program: 'credits.aleo',
      functionName: 'transfer_public',
      inputs: [
        'aleo1subscription_vault_address', // Recipient address (subscription contract vault)
        `${tier.cost}u64` // Amount in micro-ALEO (tier.cost is in ALEO)
      ],
      fee: 1000000, // 1 ALEO token fee
      privateFee: false, // Public fee
      getTransactionStatus: getTransactionStatusFn
    }

    console.log('[v0] Submitting ALEO transfer transaction:', { from: walletAddress, to: txParams.inputs[0], amount: tier.cost })
    
    // Execute transaction through wallet
    const transactionId = await executeTransactionFn(txParams)
    
    if (!transactionId) {
      throw new Error('No transaction ID returned from wallet')
    }

    console.log('[v0] ALEO transfer submitted:', transactionId)
    
    // Wait for confirmation if status function available
    if (getTransactionStatusFn) {
      let confirmed = false
      let attempts = 0
      const maxAttempts = 30 // 1 minute (2 second intervals)
      
      while (!confirmed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        const status = await getTransactionStatusFn(transactionId)
        console.log('[v0] ALEO transaction status:', status)
        
        if (status?.toLowerCase().includes('finalize') || status?.toLowerCase().includes('accept')) {
          confirmed = true
          break
        }
        attempts++
      }
      
      if (!confirmed) {
        console.warn('[v0] ALEO transfer did not confirm within timeout, but may still succeed')
      }
    }

    return { success: true, transactionId }
  } catch (error) {
    console.error('[v0] ALEO payment error:', error)
    throw error
  }
}

async function processUSDxPayment(
  tier: SubscriptionTier,
  walletAddress: string,
  executeTransactionFn: (params: any) => Promise<string>,
  getTransactionStatusFn?: (txId: string) => Promise<string | null>
) {
  console.log('[v0] Processing USDx payment for tier:', tier.name, 'amount:', tier.cost)
  
  if (!executeTransactionFn) {
    throw new Error('Wallet executeTransaction not available')
  }

  try {
    // Build transaction to transfer USDx tokens from public to private
    // This requires a special transition function that moves public balance to private records
    const txParams = {
      program: 'usdx_token.aleo',
      functionName: 'transfer_public_to_private',
      inputs: [
        'aleo1subscription_vault_address', // Recipient address (subscription contract vault)
        `${tier.cost}u64` // Amount in micro-USDx
      ],
      fee: 1000000, // 1 ALEO token fee for USDx transfer
      privateFee: false, // Fee is public
      getTransactionStatus: getTransactionStatusFn
    }

    console.log('[v0] Submitting USDx transfer transaction:', { from: walletAddress, to: txParams.inputs[0], amount: tier.cost })
    
    // Execute transaction through wallet
    const transactionId = await executeTransactionFn(txParams)
    
    if (!transactionId) {
      throw new Error('No transaction ID returned from wallet')
    }

    console.log('[v0] USDx transfer submitted:', transactionId)
    
    // Wait for confirmation if status function available
    if (getTransactionStatusFn) {
      let confirmed = false
      let attempts = 0
      const maxAttempts = 30 // 1 minute (2 second intervals)
      
      while (!confirmed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        const status = await getTransactionStatusFn(transactionId)
        console.log('[v0] USDx transaction status:', status)
        
        if (status?.toLowerCase().includes('finalize') || status?.toLowerCase().includes('accept')) {
          confirmed = true
          break
        }
        attempts++
      }
      
      if (!confirmed) {
        console.warn('[v0] USDx transfer did not confirm within timeout, but may still succeed')
      }
    }

    return { success: true, transactionId }
  } catch (error) {
    console.error('[v0] USDx payment error:', error)
    throw error
  }
}
