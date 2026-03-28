'use client'

import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Shield, Lock, Eye, Database, Clock, Trash2, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { 
  getExpirationConfig, 
  setDefaultExpirationHours,
  getActiveDisclosures,
  getExpiredDisclosures,
  deleteExpiredDisclosure,
  extendDisclosureExpiration,
  formatTimeRemaining,
  getTimeRemaining,
  DisclosureExpiration
} from '@/lib/disclosure-expiration'

export default function PrivacyPage() {
  const [activeDisclosures, setActiveDisclosures] = useState<DisclosureExpiration[]>([])
  const [expiredDisclosures, setExpiredDisclosures] = useState<DisclosureExpiration[]>([])
  const [defaultExpiration, setDefaultExpiration] = useState(72)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadDisclosures()
  }, [])

  const loadDisclosures = () => {
    const config = getExpirationConfig()
    setDefaultExpiration(config.defaultExpirationHours)
    setActiveDisclosures(getActiveDisclosures())
    setExpiredDisclosures(getExpiredDisclosures())
  }

  const handleExpirationChange = (hours: number) => {
    try {
      setDefaultExpirationHours(hours)
      setDefaultExpiration(hours)
    } catch (err) {
      console.error('[v0] Error updating expiration:', err)
    }
  }

  const handleExtendDisclosure = (disclosureId: string) => {
    try {
      extendDisclosureExpiration(disclosureId, 24) // Extend by 24 hours
      loadDisclosures()
    } catch (err) {
      console.error('[v0] Error extending disclosure:', err)
    }
  }

  const handleDeleteExpired = (disclosureId: string) => {
    try {
      deleteExpiredDisclosure(disclosureId)
      loadDisclosures()
    } catch (err) {
      console.error('[v0] Error deleting disclosure:', err)
    }
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Your Privacy Matters</h1>
          <p className="text-lg text-muted-foreground">
            ShadowID is built on the principle of data privacy and user control. Your identity data stays encrypted and under your control at all times.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="border border-border rounded-lg p-8 bg-card/50">
            <Shield className="w-8 h-8 text-accent mb-4" />
            <h2 className="text-xl font-semibold mb-3">Zero-Knowledge Proofs</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your attributes are never shared directly. We use cryptographic zero-knowledge proofs to verify claims without revealing the underlying data.
            </p>
          </div>

          <div className="border border-border rounded-lg p-8 bg-card/50">
            <Lock className="w-8 h-8 text-accent mb-4" />
            <h2 className="text-xl font-semibold mb-3">Local Encryption</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your credential data is encrypted locally on your device. Only encrypted commitment hashes are stored on the Aleo blockchain.
            </p>
          </div>

          <div className="border border-border rounded-lg p-8 bg-card/50">
            <Eye className="w-8 h-8 text-accent mb-4" />
            <h2 className="text-xl font-semibold mb-3">Selective Disclosure</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You decide exactly what to share. Generate QR codes proving specific attributes without revealing your full identity or other data.
            </p>
          </div>

          <div className="border border-border rounded-lg p-8 bg-card/50">
            <Database className="w-8 h-8 text-accent mb-4" />
            <h2 className="text-xl font-semibold mb-3">Blockchain Verified</h2>
            <p className="text-sm text-muted-foreground mb-4">
              All identity commitments are stored on the Aleo blockchain, making them verifiable without a central authority.
            </p>
          </div>
        </div>

        <div className="border border-border rounded-lg p-8 bg-card/30 mb-12">
          <h2 className="text-2xl font-semibold mb-6">Data You Control</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-1">
                <span className="text-xs font-bold text-accent">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Your Attributes</h3>
                <p className="text-sm text-muted-foreground">You choose which attributes to create (age range, location, job title, etc.) and which to activate.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-1">
                <span className="text-xs font-bold text-accent">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Who Endorses You</h3>
                <p className="text-sm text-muted-foreground">You control who can endorse your attributes. Build your Shadow Score through peer verification.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-1">
                <span className="text-xs font-bold text-accent">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">What You Share</h3>
                <p className="text-sm text-muted-foreground">Generate selective disclosure proofs showing only the specific attributes you want to prove.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-1">
                <span className="text-xs font-bold text-accent">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Your Wallet</h3>
                <p className="text-sm text-muted-foreground">Your private wallet keys are never shared with ShadowID. You remain in full control of your blockchain interactions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings Dashboard */}
        <div className="border border-border rounded-lg p-8 bg-card/50 mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-accent" />
            Disclosure Privacy Settings
          </h2>

          {/* Default Expiration Setting */}
          <div className="mb-8 p-6 bg-background rounded-lg border border-accent/20">
            <label className="block mb-4">
              <span className="text-sm font-semibold text-foreground block mb-2">Default QR Code Expiration</span>
              <p className="text-xs text-muted-foreground mb-3">QR codes expire after this duration. Expired codes cannot be used for verification.</p>
              <select
                value={defaultExpiration}
                onChange={(e) => handleExpirationChange(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground"
              >
                <option value={1}>1 hour</option>
                <option value={3}>3 hours</option>
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>1 day</option>
                <option value={72}>3 days</option>
                <option value={168}>1 week</option>
                <option value={720}>30 days (max)</option>
              </select>
            </label>
          </div>

          {/* Active Disclosures */}
          {activeDisclosures.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-4 text-accent">Active Disclosures ({activeDisclosures.length})</h3>
              <div className="space-y-3">
                {activeDisclosures.map((disclosure) => {
                  const timeLeft = getTimeRemaining(disclosure.disclosureId)
                  return (
                    <div key={disclosure.disclosureId} className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-xs font-mono text-muted-foreground mb-1">{disclosure.disclosureId}</p>
                          <div className="flex gap-2 mb-2">
                            {disclosure.attributes.map((attr) => (
                              <span key={attr} className="text-xs px-2 py-1 bg-accent/10 text-accent rounded">
                                {attr}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-foreground font-medium">
                            ⏱ {timeLeft ? formatTimeRemaining(timeLeft) : 'Loading...'}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleExtendDisclosure(disclosure.disclosureId)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Extend
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Created: {new Date(disclosure.createdAt).toLocaleDateString()}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Expired Disclosures */}
          {expiredDisclosures.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-4 text-muted-foreground">Expired Disclosures ({expiredDisclosures.length})</h3>
              <div className="space-y-3">
                {expiredDisclosures.map((disclosure) => (
                  <div key={disclosure.disclosureId} className="p-4 bg-muted/20 border border-muted/40 rounded-lg opacity-70">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-mono text-muted-foreground mb-1">{disclosure.disclosureId}</p>
                        <div className="flex gap-2">
                          {disclosure.attributes.map((attr) => (
                            <span key={attr} className="text-xs px-2 py-1 bg-muted/30 text-muted-foreground rounded">
                              {attr}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteExpired(disclosure.disclosureId)}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeDisclosures.length === 0 && expiredDisclosures.length === 0 && (
            <p className="text-center text-muted-foreground py-6">No disclosures yet. Create a QR code to start sharing attributes.</p>
          )}
        </div>

        <div className="border border-border rounded-lg p-8 bg-background/50 mb-12">
          <h2 className="text-2xl font-semibold mb-4">We Don't Store</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent mr-2">✗</span>
              <span>Your actual personal data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mr-2">✗</span>
              <span>Login credentials</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mr-2">✗</span>
              <span>Your wallet private keys</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mr-2">✗</span>
              <span>Location history</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mr-2">✗</span>
              <span>Behavioral tracking data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mr-2">✗</span>
              <span>Marketing profiles</span>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Own Your Identity?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create your ShadowID today and start building a verifiable, private identity on the Aleo blockchain.
          </p>
          <a href="/create-identity">
            <Button size="lg">Create Your ShadowID</Button>
          </a>
        </div>
      </div>
    </main>
  )
}

