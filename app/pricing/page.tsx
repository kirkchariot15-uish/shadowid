'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, X } from 'lucide-react'
import { getAllSubscriptionTiers, getSubscriptionStatus } from '@/lib/subscription-manager'
import { SubscriptionCheckout } from '@/components/subscription-checkout'
import type { SubscriptionTier } from '@/lib/subscription-manager'

export default function PricingPage() {
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<SubscriptionTier | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const tiers = getAllSubscriptionTiers()
  const currentSubscription = getSubscriptionStatus()

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {showCheckout && selectedTierForCheckout ? (
          <div className="mb-12">
            <Button
              variant="ghost"
              onClick={() => setShowCheckout(false)}
              className="mb-6"
            >
              ← Back to Pricing
            </Button>
            <SubscriptionCheckout
              selectedTier={selectedTierForCheckout}
              onPaymentSuccess={() => {
                setShowCheckout(false)
                setSelectedTierForCheckout(null)
              }}
              onPaymentError={(error) => console.error(error)}
            />
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h1>
              <p className="text-xl text-muted-foreground">
                Choose the plan that fits your identity needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tiers.map((tier) => (
                <Card key={tier.name} className={`p-8 flex flex-col ${
                  currentSubscription.tier === tier.name ? 'border-accent border-2 bg-accent/5' : 'border-border'
                }`}>
                  {currentSubscription.tier === tier.name && (
                    <div className="mb-4 inline-block bg-accent/20 text-accent text-xs font-semibold px-3 py-1 rounded-full w-fit">
                      Current Plan
                    </div>
                  )}

                  <h3 className="text-xl font-bold mb-2">{tier.displayName}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

                  <div className="mb-6">
                    {tier.cost === 0 ? (
                      <span className="text-3xl font-bold">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">{tier.cost}</span>
                        <span className="text-sm text-muted-foreground ml-2">{tier.currency}/year</span>
                      </>
                    )}
                  </div>

                  <div className="space-y-3 mb-8 flex-1">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{tier.maxAttributes} standard attributes</span>
                    </div>

                    {tier.maxCustomAttributes > 0 ? (
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{tier.maxCustomAttributes} custom attributes</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">No custom attributes</span>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Peer endorsements</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Selective disclosure proofs</span>
                    </div>

                    {tier.customAttributesAllowed && (
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Priority support</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedTierForCheckout(tier)
                      setShowCheckout(true)
                    }}
                    disabled={currentSubscription.tier === tier.name || tier.cost === 0}
                    className="w-full"
                  >
                    {currentSubscription.tier === tier.name ? 'Current Plan' : tier.cost === 0 ? 'You\'re on Free' : 'Upgrade Now'}
                  </Button>
                </Card>
              ))}
            </div>

            <div className="mt-16 p-8 bg-card/50 border border-border rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Payment Methods</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-2">Aleo Testnet Token (ALEO)</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    For the Standard plan (8 attributes): Pay with 5 ALEO testnet tokens directly from your wallet.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Testnet tokens for development only. No real value.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">USDx Stablecoin (Aleo)</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    For Premium (10 USDx) and Custom (25 USDx) plans: Pay with USDx stablecoin on Aleo testnet.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Get USDx from Aleo testnet faucets or swap on DEXes.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
