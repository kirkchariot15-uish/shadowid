'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { Navigation } from '@/components/navigation'
import { ProgressIndicator } from '@/components/progress-indicator'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Button } from '@/components/ui/button'
import { addActivityLog } from '@/lib/activity-logger'
import { STANDARD_ATTRIBUTES } from '@/lib/attribute-schema'
import { registerCommitmentOnChain } from '@/lib/aleo-sdk-integration'
import { storeEncryptedCredential } from '@/lib/encrypted-storage'

export function CreateIdentityPage() {
  const { address } = useAleoWallet()
  const isConnected = !!address
  const [mounted, setMounted] = useState(false)
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [creationComplete, setCreationComplete] = useState(false)
  const [commitment, setCommitment] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Ensure component only renders on client with crypto available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.crypto) {
      // Make crypto globally available for Aleo SDK IMMEDIATELY on mount
      if (typeof (globalThis as any).crypto === 'undefined') {
        (globalThis as any).crypto = window.crypto
      }
      setMounted(true)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  const handleCreateIdentity = async () => {
    const selectedAttrIds = Object.keys(selectedAttributes).filter(key => selectedAttributes[key].trim())
    
    if (selectedAttrIds.length === 0) {
      alert('Select and fill at least one attribute to claim')
      return
    }

    // Check wallet is connected
    if (!address) {
      setError('Wallet not connected')
      return
    }

    setIsCreating(true)
    try {
      // Ensure crypto is available before proceeding
      if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
        throw new Error('Cryptographic functions not available in this browser. Please use a modern browser.')
      }

      const data = `${address}-${selectedAttrIds.join(',')}-${Date.now()}`
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const commitmentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16).toUpperCase()

      const credential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: `shadowid:${commitmentHash}`,
        type: ['VerifiableCredential', 'ShadowIDCredential'],
        issuer: { id: address, name: 'User' },
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: address,
          claims: selectedAttrIds.reduce((acc, attr) => {
            acc[attr] = { attributeId: attr, value: selectedAttributes[attr] }
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

      // Save to localStorage for QR code page
      localStorage.setItem('shadowid-commitment', commitmentHash)
      localStorage.setItem('shadowid-created-at', new Date().toISOString())
      localStorage.setItem('shadowid-user-info', JSON.stringify({
        hasPhoto: false,
        documentCount: 0,
        notesCount: 0,
        documentsNames: [],
        notes: []
      }))
      localStorage.setItem('shadowid-credential', JSON.stringify(credential))

      await storeEncryptedCredential(commitmentHash, credential, address)

      try {
        // Register on main shadowid contract
        const mainResult = await registerCommitmentOnChain(commitmentHash, address)
        if (mainResult.success) {
          addActivityLog('Register on-chain', 'blockchain', `Commitment registered: ${mainResult.transactionId}`, 'success')
        }

        // Register in credential registry
        const registryResult = await registerCredentialInRegistry(commitmentHash, selectedAttrIds.length, address)
        if (registryResult.success) {
          addActivityLog('Register registry', 'blockchain', `Credential registered: ${registryResult.transactionId}`, 'success')
        }
      } catch (error) {
        console.error('[v0] Blockchain registration error:', error)
      }

      setCommitment(commitmentHash)
      addActivityLog('Create ShadowID', 'identity', `Created ZK identity with ${selectedAttrIds.length} attributes`, 'success')
      setCreationComplete(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create identity'
      console.error('[v0] Identity creation error:', err)
      setError(errorMsg)
      addActivityLog('Create ShadowID', 'identity', `Failed to create identity: ${errorMsg}`, 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const handleRetry = async () => {
    setError(null)
    setRetryCount(retryCount + 1)
    await handleCreateIdentity()
  }

  if (!isConnected || !address) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background text-foreground pt-32 pb-20 px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Lock className="h-16 w-16 text-muted-foreground/40 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3">Create ShadowID</h1>
            <p className="text-muted-foreground">Connect your wallet using the button in the top right corner to create your zero-knowledge identity.</p>
          </div>
        </div>
      </>
    )
  }

  if (creationComplete) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="pt-24 pb-32 px-4">
          <div className="mx-auto max-w-2xl">
            <Link href="/dashboard">
              <Button variant="outline" className="mb-6 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-3">ShadowID Created</h1>
              <p className="text-muted-foreground mb-4">Your zero-knowledge identity is ready.</p>
              <div className="bg-card/50 border border-accent/20 rounded-lg p-6 mb-6">
                <p className="text-xs uppercase tracking-widest text-accent mb-2">Identity Commitment</p>
                <p className="text-xl font-mono font-bold break-all">{commitment}</p>
              </div>
              <p className="text-sm text-muted-foreground mb-8">
                Selected attributes: {Object.keys(selectedAttributes).join(', ')}
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/request-attestation">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
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
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-24 pb-32 px-4">
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

          {/* Progress Indicator */}
          <div className="mb-12">
            <ProgressIndicator steps={[
              { id: 'select', label: 'Select Attributes', status: Object.keys(selectedAttributes).length > 0 ? 'completed' : 'in-progress' },
              { id: 'fill', label: 'Fill Attribute Values', status: Object.keys(selectedAttributes).filter(k => selectedAttributes[k].trim()).length > 0 ? 'completed' : 'pending' },
              { id: 'create', label: 'Create Identity', status: creationComplete ? 'completed' : 'pending' }
            ]} />
          </div>
          <div className="space-y-6">
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Zero-knowledge credentials prove claims without revealing the underlying data. Your identity stays private on your device.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Available Attributes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(STANDARD_ATTRIBUTES).map(attr => (
                  <div key={attr.id} className="p-4 rounded-lg border border-border hover:border-accent/50 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={!!selectedAttributes[attr.id]}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAttributes({...selectedAttributes, [attr.id]: ''})
                          } else {
                            const {[attr.id]: _, ...rest} = selectedAttributes
                            setSelectedAttributes(rest)
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{attr.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{attr.description}</p>
                        <p className="text-xs text-accent mt-2">Privacy: {attr.privacyLevel}</p>
                      </div>
                    </div>
                    {selectedAttributes[attr.id] !== undefined && (
                      <input
                        type="text"
                        placeholder={`Enter ${attr.name}...`}
                        value={selectedAttributes[attr.id] || ''}
                        onChange={(e) => {
                          setSelectedAttributes({...selectedAttributes, [attr.id]: e.target.value})
                        }}
                        className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:border-accent"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            {error && (
              <div className="p-4 rounded-lg border border-red-400/30 bg-red-400/5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-400">Error Creating Identity</p>
                    <p className="text-xs text-red-400/80 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            {isCreating && (
              <div className="p-8 rounded-lg border border-accent/20 bg-card/50 flex flex-col items-center justify-center">
                <LoadingSpinner size="md" text="Creating your ShadowID..." />
              </div>
            )}
            {!isCreating && (
              <>
                <Button
                  onClick={handleCreateIdentity}
                  disabled={isCreating || Object.keys(selectedAttributes).length === 0}
                  className="flex-1 gap-2"
                >
                  Create ShadowID
                </Button>
                {error && (
                  <Button
                    onClick={handleRetry}
                    disabled={isCreating}
                    variant="outline"
                    className="px-6 border-accent/40 text-accent hover:bg-accent/10"
                  >
                    Retry
                  </Button>
                )}
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">Cancel</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
