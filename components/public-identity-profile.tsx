'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Lock, CheckCircle2, Shield, Clock, Hash } from 'lucide-react'
import Link from 'next/link'
import { STANDARD_ATTRIBUTES } from '@/lib/attribute-schema'

interface IdentityProfile {
  commitment: string
  userAddress: string
  attributes: Record<string, string>
  createdAt: string
  verificationLink?: string
}

interface PublicIdentityProfileProps {
  commitment?: string
}

export default function PublicIdentityProfile({ commitment }: PublicIdentityProfileProps) {
  const [profile, setProfile] = useState<IdentityProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      if (!commitment) {
        setError('No commitment hash provided')
        setLoading(false)
        return
      }

      try {
        // Get credential data - in a real app, this would query a backend
        // For now, we check localStorage if this is the owner's identity
        const credentialStr = localStorage.getItem('shadowid-credential')
        const savedCommitment = localStorage.getItem('shadowid-commitment')
        const userAddress = localStorage.getItem('shadowid-user-id')

        // Check if this is the owner viewing their own profile
        if (savedCommitment === commitment && credentialStr) {
          const credential = JSON.parse(credentialStr)
          const attributes = credential?.credentialSubject?.claims ? 
            Object.entries(credential.credentialSubject.claims).reduce((acc: any, [key, claim]: any) => {
              acc[key] = claim.value
              return acc
            }, {}) : {}

          setProfile({
            commitment,
            userAddress: userAddress || 'Anonymous',
            attributes,
            createdAt: localStorage.getItem('shadowid-created-at') || new Date().toISOString(),
            verificationLink: typeof window !== 'undefined' ? window.location.href : '',
          })
        } else {
          // For non-owner viewing, show anonymized profile
          // In production, commitment details would come from blockchain
          setProfile({
            commitment,
            userAddress: 'Anonymous',
            attributes: {},
            createdAt: new Date().toISOString(),
          })
        }
      } catch (err) {
        console.error('[v0] Error loading identity profile:', err)
        setError('Failed to load identity profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [commitment])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading identity...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
            <Lock className="h-12 w-12 text-destructive/40 mx-auto mb-4" />
            <p className="text-foreground font-semibold">{error || 'Identity not found'}</p>
            <p className="text-sm text-muted-foreground mt-2">This identity may not exist or may be revoked.</p>
          </div>
        </div>
      </main>
    )
  }

  const isOwner = localStorage.getItem('shadowid-commitment') === commitment
  const attributesList = Object.entries(profile.attributes)

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-foreground">ShadowID Verification</h1>
              <CheckCircle2 className="h-8 w-8 text-accent flex-shrink-0" />
            </div>
            <p className="text-muted-foreground">
              {isOwner 
                ? 'This is your public identity profile' 
                : 'Verified identity with zero-knowledge credentials'}
            </p>
          </div>

          {/* Identity Card */}
          <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8 space-y-6">
            {/* Commitment Hash */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-accent" />
                <label className="text-sm font-semibold text-foreground">Commitment Hash</label>
              </div>
              <div className="flex items-center justify-between bg-background/50 rounded-lg p-4 border border-border">
                <span className="font-mono text-sm text-foreground break-all">{profile.commitment}</span>
                <Shield className="h-5 w-5 text-accent flex-shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground">Blockchain-verified commitment hash for this identity</p>
            </div>

            {/* Creation Date */}
            <div className="space-y-3 border-t border-border pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" />
                <label className="text-sm font-semibold text-foreground">Identity Created</label>
              </div>
              <p className="text-foreground">{new Date(profile.createdAt).toLocaleString()}</p>
            </div>

            {/* Claimed Attributes */}
            {attributesList.length > 0 ? (
              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" />
                  <label className="text-sm font-semibold text-foreground">Claimed Attributes ({attributesList.length})</label>
                </div>
                <p className="text-xs text-muted-foreground">These attributes were claimed by the identity owner</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {attributesList.map(([attrId, value]) => {
                    const schema = STANDARD_ATTRIBUTES[attrId as keyof typeof STANDARD_ATTRIBUTES]
                    return (
                      <div key={attrId} className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                        <p className="font-semibold text-sm text-foreground">{schema?.name || attrId}</p>
                        <p className="text-xs text-muted-foreground mt-1">{schema?.description}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-accent/10">
                          <span className="text-xs font-mono bg-background/50 rounded px-2 py-1">{value}</span>
                          <span className="text-xs text-accent">Claimed</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="border-t border-border pt-6">
                <p className="text-sm text-muted-foreground italic">No public attributes claimed</p>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="rounded-lg border border-accent/20 bg-card/30 p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              About Zero-Knowledge Identities
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-accent font-semibold">•</span>
                <span>This identity is verified on the Aleo blockchain without revealing personal data</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-semibold">•</span>
                <span>The commitment hash is immutable and can be used to verify authenticity</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-semibold">•</span>
                <span>Claimed attributes are cryptographically bound to this commitment</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-semibold">•</span>
                <span>Only the owner can prove their identity corresponds to this commitment</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center pt-4">
            {isOwner ? (
              <>
                <Link href="/qr-codes">
                  <Button className="bg-blue hover:bg-blue/90 text-blue-foreground">View My QR Codes</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">Back to Dashboard</Button>
                </Link>
              </>
            ) : (
              <Link href="/">
                <Button className="bg-blue hover:bg-blue/90 text-blue-foreground">Create Your Own Identity</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
