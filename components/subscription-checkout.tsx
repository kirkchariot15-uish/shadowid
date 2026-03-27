'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { getAllSubscriptionTiers, setSubscriptionStatus } from '@/lib/subscription-manager'
import type { SubscriptionTier } from '@/lib/subscription-manager'

interface SubscriptionCheckoutProps {
  selectedTier: SubscriptionTier
  onPaymentSuccess?: (tier: string) => void
  onPaymentError?: (error: string) => void
}

export function SubscriptionCheckout({ selectedTier, onPaymentSuccess, onPaymentError }: SubscriptionCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentToken, setPaymentToken] = useState<'ALEO' | 'USDx'>(selectedTier.currency)

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      console.log('[v0] Processing payment:', {
        tier: selectedTier.name,
        amount: selectedTier.cost,
        currency: paymentToken
      })

      // For testnet ALEO: send raw transaction
      // For USDx: send contract transfer
      if (paymentToken === 'ALEO') {
        await processAleoPayment(selectedTier)
      } else if (paymentToken === 'USDx') {
        await processUSDxPayment(selectedTier)
      }

      // Success - update subscription status
      const txHash = `tx_${Date.now()}_${Math.random().toString(36).slice(2)}`
      setSubscriptionStatus(selectedTier.name as any, txHash, paymentToken, 365)

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

async function processAleoPayment(tier: SubscriptionTier) {
  // Send 5 ALEO tokens to subscription contract address
  console.log('[v0] Processing ALEO payment for tier:', tier.name)
  
  // In production: call executeTransaction with proper contract params
  // For now: simulate successful payment
  await new Promise(resolve => setTimeout(resolve, 1000))
}

async function processUSDxPayment(tier: SubscriptionTier) {
  // Send USDx tokens to subscription contract address
  // USDx contract on Aleo testnet: aleo1...
  console.log('[v0] Processing USDx payment for tier:', tier.name)
  
  // In production: call executeTransaction with USDx transfer contract
  // For now: simulate successful payment
  await new Promise(resolve => setTimeout(resolve, 1000))
}
