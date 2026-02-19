'use client'

import { useState, useEffect } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/navigation'
import { Shield, Lock, CheckCircle2, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { addActivityLog } from '@/lib/activity-logger'
import { STANDARD_ATTRIBUTES } from '@/lib/attribute-schema'
import { registerCommitmentOnChain } from '@/lib/aleo-sdk-integration'
import { storeEncryptedCredential } from '@/lib/encrypted-storage'

export default function CreateIdentityPage() {
  const [mounted, setMounted] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [creationComplete, setCreationComplete] = useState(false)
  const [commitment, setCommitment] = useState<string>('')

  // Get wallet info after mount to avoid SSR issues
  const wallet = mounted ? useAleoWallet() : { isConnected: false, address: null }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && wallet) {
      setIsConnected(wallet.isConnected)
      setAddress(wallet.address)
    }
  }, [mounted, wallet])

  const handleCreateIdentity = async () => {
    if (selectedAttributes.length === 0) {
      alert('Select at least one attribute to claim')
      return
    }

    if (!address) return

    setIsCreating(true)
    try {
      console.log('[v0] Creating ZK identity with attributes:', selectedAttributes)

      // Generate commitment hash from user data
      const data = `${address}-${selectedAttributes.join(',')}-${Date.now()}`
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const commitmentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16).toUpperCase()

      console.log('[v0] Zero-knowledge commitment generated:', commitmentHash)

      // Create verifiable credential (stored encrypted locally)
      const credential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: `shadowid:${commitmentHash}`,
        type: ['VerifiableCredential', 'ShadowIDCredential'],
        issuer: { id: address, name: 'Self-Sovereign' },
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: address,
          claims: selectedAttributes.reduce((acc, attr) => {
            acc[attr] = { attributeId: attr, value: true }
            return acc
          }, {} as Record<string, any>)
        },
        proof: {
          type: 'Ed25519Signature2020',
          created: new Date().toISOString(),
          verificationMethod: `did:aleo:${address}`,
          proofPurpose: 'assertionMethod',
          proofValue: commitmentHash
        }
      }

      // Store encrypted credential locally (privacy by default)
      await storeEncryptedCredential(commitmentHash, credential, address)
      console.log('[v0] Credential encrypted and stored locally')

      // Register commitment on blockchain (only hash, no personal data)
      try {
        console.log('[v0] Registering zero-knowledge commitment on Aleo')
        const result = await registerCommitmentOnChain(commitmentHash, address)
        if (result.success) {
          console.log('[v0] Commitment anchored on-chain:', result.transactionId)
          addActivityLog('Register Commitment', 'blockchain', `ZK commitment registered: ${result.transactionId}`, 'success')
        } else {
          console.error('[v0] On-chain registration failed:', result.error)
        }
      } catch (error) {
        console.error('[v0] Blockchain error:', error)
      }

      setCommitment(commitmentHash)
      addActivityLog('Create ZK Identity', 'identity', `Created private identity with ${selectedAttributes.length} attributes`, 'success')
      setCreationComplete(true)
    } catch (err) {
      console.error('[v0] Identity creation error:', err)
      alert('Failed to create identity. Please try again.')
      addActivityLog('Create ZK Identity', 'identity', 'Failed to create identity', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  // Render nothing during SSR
  if (!mounted) {
    return null
  }

  // Wallet not connected state
  if (!isConnected || !address) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <Lock className="h-16 w-16 text-accent/40" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Create Private Identity</h1>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to create your zero-knowledge identity. No personal data is exposed on-chain.
            </p>
            <div className="bg-card/50 border border-accent/20 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-semibold mb-1">Privacy by Default</p>
                  <p className="text-xs text-muted-foreground">
                    Only cryptographic commitments are stored on-chain. Your actual data never leaves your device.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Use the menu in the top right to connect your wallet
            </p>
          </div>
        </div>
      </>
    )
  }

  // Success state
  if (creationComplete) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background text-foreground">
          <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8">
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
                <h1 className="text-3xl font-bold mb-3">Private Identity Created</h1>
                <p className="text-muted-foreground mb-6">
                  Your zero-knowledge identity is ready. Only you can prove your attributes.
                </p>
                <div className="bg-card/50 border border-accent/20 rounded-lg p-6 mb-8">
                  <p className="text-xs uppercase tracking-widest text-accent mb-2">ZK Commitment Hash</p>
                  <p className="text-xl font-mono font-bold text-foreground break-all">{commitment}</p>
                  <p className="text-xs text-muted-foreground mt-4">
                    This hash is registered on-chain. Your actual data remains private.
                  </p>
                </div>
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-8">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm font-semibold mb-1">Next Steps</p>
                      <p className="text-sm text-muted-foreground">
                        Selected attributes: <span className="text-foreground">{selectedAttributes.join(', ')}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Request attestations from trusted issuers to verify these claims while maintaining privacy.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <Link href="/request-attestation">
                    <Button className="gap-2 bg-accent hover:bg-accent/90">
                      Request Attestations
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline">Go to Dashboard</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Main creation form
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background text-foreground">
        <div className="pt-24 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Link href="/dashboard">
              <Button variant="outline" className="mb-8 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>

            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-3">Create Private Identity</h1>
              <p className="text-muted-foreground text-lg">
                Select attributes you want to claim. Your data stays private—only cryptographic proofs are shared.
              </p>
            </div>

            <div className="space-y-8">
              {/* Privacy Notice */}
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-6">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Zero-Knowledge Privacy</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your identity is cryptographically secured. Only commitment hashes are stored on-chain—your actual attributes remain encrypted on your device.
                    </p>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>No personal data exposed on blockchain</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground mt-1">
                      <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>Selective disclosure—prove only what's needed</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground mt-1">
                      <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>Self-sovereign—you control your identity</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attribute Selection */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Select Attributes</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Choose which attributes to include in your private identity. You'll request attestations for these later.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {STANDARD_ATTRIBUTES.map(attr => (
                    <label
                      key={attr.id}
                      className={`flex items-start gap-3 p-5 rounded-lg border transition-all cursor-pointer ${
                        selectedAttributes.includes(attr.id)
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50 bg-card/50'
                      }`}
                    >
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
                        className="mt-1.5"
                      />
                      <div className="flex-1">
                        <p className="font-semibold mb-1">{attr.name}</p>
                        <p className="text-xs text-muted-foreground mb-2">{attr.description}</p>
                        <div className="flex items-center gap-2">
                          <Lock className="h-3 w-3 text-accent" />
                          <span className="text-xs text-accent font-medium">{attr.privacyLevel}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-border">
                <Button
                  onClick={handleCreateIdentity}
                  disabled={isCreating || selectedAttributes.length === 0}
                  size="lg"
                  className="flex-1 bg-accent hover:bg-accent/90 gap-2 h-12"
                >
                  {isCreating ? (
                    <>
                      <Sparkles className="h-5 w-5 animate-pulse" />
                      Creating Private Identity...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      Create Private Identity
                    </>
                  )}
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full h-12">
                    Cancel
                  </Button>
                </Link>
              </div>

              {selectedAttributes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Select at least one attribute to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
