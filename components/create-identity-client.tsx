'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Lock, Sparkles, CheckCircle2, ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { addActivityLog } from '@/lib/activity-logger'
import { STANDARD_ATTRIBUTES } from '@/lib/attribute-schema'
import { registerCommitmentOnChain } from '@/lib/aleo-sdk-integration'
import { storeEncryptedCredential } from '@/lib/encrypted-storage'

export function CreateIdentityClient() {
  const { address } = useWallet()
  const isConnected = !!address
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [creationComplete, setCreationComplete] = useState(false)
  const [commitment, setCommitment] = useState<string>('')

  const handleCreateIdentity = async () => {
    if (selectedAttributes.length === 0) {
      alert('Select at least one attribute to claim')
      return
    }

    setIsCreating(true)
    try {
      const data = `${address}-${selectedAttributes.join(',')}-${Date.now()}`
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
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

      await storeEncryptedCredential(commitmentHash, credential, address)

      try {
        const result = await registerCommitmentOnChain(commitmentHash, address)
        if (result.success) {
          addActivityLog('Register on-chain', 'blockchain', `Commitment on-chain: ${result.transactionId}`, 'success')
        }
      } catch (error) {
        console.error('[v0] Blockchain registration error:', error)
      }

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
                Selected attributes: {selectedAttributes.join(', ')}
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
                      <p className="text-xs text-accent mt-2">Privacy: {attr.privacyLevel}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-8 border-t border-border">
              <Button
                onClick={handleCreateIdentity}
                disabled={isCreating || selectedAttributes.length === 0}
                className="flex-1 gap-2"
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
