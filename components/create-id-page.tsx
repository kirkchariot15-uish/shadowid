'use client'

import { useState } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { WalletMultiButton } from '@/components/wallet-button'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Lock, Sparkles, CheckCircle2, ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { addActivityLog } from '@/lib/activity-logger'
import { STANDARD_ATTRIBUTES } from '@/lib/attribute-schema'

export default function CreateIDPage() {
  const { isConnected, address } = useAleoWallet()
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [creationComplete, setCreationComplete] = useState(false)
  const [commitment, setCommitment] = useState<string>('')

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <span className="text-sm font-bold text-accent-foreground">σ</span>
              </div>
              <span className="text-lg font-bold">ShadowID</span>
            </Link>
            <WalletMultiButton />
          </div>
        </nav>

        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 flex justify-center">
              <Lock className="h-16 w-16 text-muted-foreground/40" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Create ShadowID</h1>
            <p className="text-muted-foreground mb-8">Connect your wallet to create your zero-knowledge identity with verifiable credentials.</p>
            <WalletMultiButton />
          </div>
        </div>
      </div>
    )
  }

  const handleCreateIdentity = async () => {
    if (selectedAttributes.length === 0) {
      alert('Select at least one attribute to claim')
      return
    }

    setIsCreating(true)
    try {
      console.log('[v0] Creating ShadowID with attributes:', selectedAttributes)

      // Generate commitment hash
      const data = `${address}-${selectedAttributes.join(',')}-${Date.now()}`
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const commitmentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16).toUpperCase()

      console.log('[v0] Commitment generated:', commitmentHash)

      // Store in localStorage
      localStorage.setItem('shadowid-commitment', commitmentHash)
      localStorage.setItem('shadowid-created-at', new Date().toISOString())
      localStorage.setItem('shadowid-attributes', JSON.stringify(selectedAttributes))
      localStorage.setItem('shadowid-address', address)

      setCommitment(commitmentHash)
      addActivityLog('Create ShadowID', 'identity', `Created ZK identity with ${selectedAttributes.length} attributes`, 'success')
      setCreationComplete(true)
    } catch (err) {
      console.error('[v0] Identity creation error:', err)
      alert('Failed to create identity. Please try again.')
      addActivityLog('Create ShadowID', 'identity', 'Failed to create identity', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  if (creationComplete) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <Link href="/dashboard">
              <Button variant="outline" className="mb-6 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>

            <div className="text-center py-12">
              <div className="mb-6 flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-accent" />
              </div>
              <h1 className="text-3xl font-bold mb-3">ShadowID Created</h1>
              <p className="text-muted-foreground mb-4">Your zero-knowledge identity is ready.</p>
              <div className="bg-card/50 border border-accent/20 rounded-lg p-6 mb-6">
                <p className="text-xs uppercase tracking-widest text-accent mb-2">Identity Commitment</p>
                <p className="text-xl font-mono font-bold text-foreground break-all">{commitment}</p>
              </div>
              <p className="text-sm text-muted-foreground mb-8">
                Selected attributes: {selectedAttributes.join(', ')}. Request attestations from trusted issuers to activate these claims.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/request-attestation">
                  <Button className="gap-2 bg-accent hover:bg-accent/90">
                    <Plus className="h-4 w-4" />
                    Request Attestations
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">Continue</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-8 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>

          <div className="mb-12">
            <h1 className="text-3xl font-bold mb-2">Create Your ShadowID</h1>
            <p className="text-muted-foreground">Select attributes you want to claim. Request attestations from trusted issuers to verify each claim.</p>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Zero-knowledge credentials prove claims without revealing the underlying data. Select attributes, then request attestations from verifiers.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Available Attributes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STANDARD_ATTRIBUTES.map(attr => (
                  <label key={attr.id} className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-accent/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedAttributes.includes(attr.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAttributes([...selectedAttributes, attr.id])
                        } else {
                          setSelectedAttributes(selectedAttributes.filter(id => id !== attr.id))
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{attr.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{attr.description}</p>
                      <p className="text-xs text-accent mt-2">Privacy Level: {attr.privacyLevel}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-8 border-t border-border">
              <Button
                onClick={handleCreateIdentity}
                disabled={isCreating || selectedAttributes.length === 0}
                className="flex-1 bg-accent hover:bg-accent/90 gap-2"
              >
                {isCreating ? 'Creating...' : 'Create ShadowID'}
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">Cancel</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
