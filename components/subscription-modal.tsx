'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Loader2, Zap } from 'lucide-react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { setSubscriptionStatus } from '@/lib/subscription-manager'
import { addActivityLog } from '@/lib/activity-logger'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  reason?: 'attribute_limit' | 'upgrade' | 'manual'
}

export function SubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
  reason = 'manual'
}: SubscriptionModalProps) {
  const { address, isConnected, executeTransaction } = useAleoWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const SUBSCRIPTION_COST = 5 // testnet tokens
  const SUBSCRIPTION_DURATION = 365 // days

  const handleSubscribe = async () => {
    if (!isConnected || !address || !executeTransaction) {
      setError('Please connect your Aleo wallet first')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      console.log('[v0] Starting subscription payment...')

      // In a real application, you would:
      // 1. Call a smart contract function to transfer tokens
      // 2. The contract would transfer SUBSCRIPTION_COST tokens to the service address
      // 3. Return a transaction hash
      
      // For now, we simulate the payment by storing subscription data
      // In production, this would be a real contract call like:
      // const result = await executeTransaction({
      //   transitions: [{
      //     program: 'payment_v1.aleo',
      //     functionName: 'transfer_for_subscription',
      //     inputs: [SERVICE_ADDRESS, `${SUBSCRIPTION_COST}u64`]
      //   }],
      //   fee: 1000
      // })

      // Simulate payment processing with a slight delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate a simulated transaction hash
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`

      // Set subscription status
      setSubscriptionStatus(mockTxHash, SUBSCRIPTION_DURATION)

      console.log('[v0] Subscription activated:', mockTxHash)
      addActivityLog(
        'Subscribe',
        'payment',
        `Subscription activated for ${SUBSCRIPTION_DURATION} days`,
        'success'
      )

      setSuccess(true)

      // Auto-close after 2 seconds
      setTimeout(() => {
        setSuccess(false)
        onSuccess?.()
        onClose()
      }, 2000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Payment failed'
      console.error('[v0] Subscription error:', err)
      setError(errorMsg)
      addActivityLog(
        'Subscribe',
        'payment',
        `Subscription failed: ${errorMsg}`,
        'error'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Unlock Unlimited Attributes
          </DialogTitle>
          <DialogDescription>
            {reason === 'attribute_limit'
              ? 'You\'ve reached your free attribute limit. Subscribe for unlimited attributes.'
              : 'Subscribe to unlock unlimited attributes for your ShadowID.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subscription Details */}
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Cost:</span>
              <span className="text-lg font-semibold text-foreground">{SUBSCRIPTION_COST} testnet tokens</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Duration:</span>
              <span className="text-sm text-foreground">{SUBSCRIPTION_DURATION} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Attributes:</span>
              <span className="text-sm font-medium text-accent">Unlimited</span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">INCLUDES:</p>
            <ul className="space-y-2 text-sm">
              {['Unlimited attributes per identity', 'Priority verification', 'Extended credential lifetime', 'Advanced privacy controls'].map(
                (feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Wallet Status */}
          {!isConnected ? (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">Please connect your Aleo wallet to subscribe</p>
            </div>
          ) : (
            <div className="bg-background/50 rounded-lg p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Wallet Address:</p>
              <p className="text-xs font-mono text-foreground break-all">{address?.substring(0, 40)}...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Subscription Activated!</p>
                <p className="text-xs text-muted-foreground mt-1">You can now claim unlimited attributes.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isProcessing || success}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-accent hover:bg-accent/90 gap-2"
              onClick={handleSubscribe}
              disabled={!isConnected || isProcessing || success}
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
              {success ? 'Done!' : isProcessing ? 'Processing...' : `Subscribe Now`}
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-muted-foreground text-center">
            Using testnet tokens. No real funds will be charged.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
