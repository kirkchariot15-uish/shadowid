'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Loader2, Zap } from 'lucide-react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { setSubscriptionStatus, SUBSCRIPTION_TIERS } from '@/lib/subscription-manager'
import { addActivityLog } from '@/lib/activity-logger'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  reason?: 'attribute_limit' | 'upgrade' | 'manual'
  tier?: 'standard' | 'premium' | 'custom'
}

export function SubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
  reason = 'manual',
  tier = 'standard'
}: SubscriptionModalProps) {
  const { address, isConnected, executeTransaction } = useAleoWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const tierData = SUBSCRIPTION_TIERS[tier.toUpperCase()]
  const subscriptionCost = tierData.cost
  const subscriptionToken = tierData.currency
  const subscriptionDuration = 365 // days

  const handleSubscribe = async () => {
    if (!isConnected || !address || !executeTransaction) {
      setError('Please connect your Aleo wallet first')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      console.log(`[v0] Starting ${tier} subscription payment of ${subscriptionCost} ${subscriptionToken}...`)

      // Execute real blockchain transaction to pay for subscription
      const serviceAddress = 'aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq5ll37m'
      
      const transactionId = await executeTransaction({
        transitions: [
          {
            program: 'token_v0.aleo',
            functionName: 'transfer_public_to_private',
            inputs: [
              serviceAddress,
              `${subscriptionCost}u64`
            ]
          }
        ],
        fee: 100000,
        feePrivate: false
      })

      if (!transactionId) {
        throw new Error('Transaction failed: no transaction ID returned')
      }

      console.log('[v0] Subscription payment successful:', transactionId)

      // Store subscription status with proper tier
      setSubscriptionStatus(
        tier as 'standard' | 'premium' | 'custom',
        transactionId,
        subscriptionToken as 'ALEO' | 'USDx',
        subscriptionDuration
      )

      addActivityLog(
        'Subscribe',
        'subscription',
        `Paid ${subscriptionCost} ${subscriptionToken} for ${tier} tier (${subscriptionDuration} days)`,
        'success'
      )

      setSuccess(true)
      
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 2000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Subscription payment failed'
      console.error('[v0] Subscription error:', errorMsg)
      setError(errorMsg)
      addActivityLog(
        'Subscribe',
        'subscription',
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
            {tierData.displayName} Subscription
          </DialogTitle>
          <DialogDescription>
            {reason === 'attribute_limit'
              ? `You've reached your free attribute limit. Upgrade to ${tierData.displayName}.`
              : `Subscribe to unlock ${tierData.maxAttributes} attributes for your ShadowID.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subscription Details */}
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Cost:</span>
              <span className="text-lg font-semibold text-foreground">{subscriptionCost} {subscriptionToken}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Duration:</span>
              <span className="text-sm text-foreground">{subscriptionDuration} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Standard Attributes:</span>
              <span className="text-sm font-medium text-accent">{tierData.maxAttributes}</span>
            </div>
            {tierData.maxCustomAttributes > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Custom Attributes:</span>
                <span className="text-sm font-medium text-accent">{tierData.maxCustomAttributes}</span>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">INCLUDES:</p>
            <ul className="space-y-2 text-sm">
              {[
                `${tierData.maxAttributes} standard attributes`,
                tierData.customAttributesAllowed ? `${tierData.maxCustomAttributes} custom attributes` : null,
                'Priority verification',
                'Extended credential lifetime',
                'Advanced privacy controls'
              ].filter(Boolean).map(
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
                <p className="text-xs text-muted-foreground mt-1">You can now access all {tierData.displayName} features.</p>
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
              {success ? 'Done!' : isProcessing ? 'Processing...' : `Subscribe for ${subscriptionCost} ${subscriptionToken}`}
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
