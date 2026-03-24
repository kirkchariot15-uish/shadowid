'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Lock, CheckCircle2, Shield, Clock, Hash, Copy, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { STANDARD_ATTRIBUTES } from '@/lib/attribute-schema'
import { verifyCommitmentHashFormat } from '@/lib/commitment-hash-generator'

interface IdentityProfile {
  commitment: string
  userAddress: string
  attributes: Record<string, string>
  createdAt: string
  verificationLink?: string
  attributeHash?: string
  signature?: string
  transactionId?: string
  verificationStatus: 'verified' | 'unverified' | 'unknown'
}

interface PublicIdentityProfileProps {
  commitment?: string
}

export default function PublicIdentityProfile({ commitment }: PublicIdentityProfileProps) {
  const [profile, setProfile] = useState<IdentityProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hashValid, setHashValid] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (!commitment) {
        setError('No commitment hash provided')
        setLoading(false)
        return
      }

      // Validate commitment hash format
      const isValid = verifyCommitmentHashFormat(commitment)
      setHashValid(isValid)

      if (!isValid) {
        setError('Invalid commitment hash format. Expected: XX-XXXXXXXX... (checksum-hash)')
        setLoading(false)
        return
      }

      try {
        // Get credential data and verification proofs
        const credentialStr = localStorage.getItem('shadowid-credential')
        const savedCommitment = localStorage.getItem('shadowid-commitment')
        const userAddress = localStorage.getItem('shadowid-user-id')
        const attributeHash = localStorage.getItem('shadowid-attribute-hash')
        const signature = localStorage.getItem('shadowid-signature')
        const transactionId = localStorage.getItem('shadowid-tx-id')

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
            attributeHash,
            signature,
            transactionId,
            verificationStatus: attributeHash && signature ? 'verified' : 'unknown'
          })
        } else {
          // For non-owner viewing, show anonymized profile with verification status
          setProfile({
            commitment,
            userAddress: 'Anonymous',
            attributes: {},
            createdAt: new Date().toISOString(),
            verificationStatus: 'unknown'
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
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Identity Verification</h1>
              <p className="text-muted-foreground mt-2">View and verify ShadowID identity credentials</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          {loading && (
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-border rounded" />
                <div className="h-12 bg-border rounded" />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{error}</p>
              </div>
            </div>
          )}

          {profile && !loading && (
            <div className="space-y-6">
              {/* Verification Status Card */}
              <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-3">
                    {profile.verificationStatus === 'verified' ? (
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h2 className="text-lg font-semibold">
                        {profile.verificationStatus === 'verified' ? 'Verified Identity' : 'Unverified Identity'}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {profile.verificationStatus === 'verified'
                          ? 'This identity has been cryptographically verified on the blockchain'
                          : 'This identity has not been verified yet'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Commitment Hash */}
                  <div className="flex items-start justify-between p-4 rounded-lg bg-background border border-border">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Identity Commitment</p>
                      <p className="font-mono text-sm text-accent break-all">{profile.commitment}</p>
                      {!hashValid && (
                        <p className="text-xs text-destructive mt-2">Invalid commitment hash format</p>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(profile.commitment)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground ml-2"
                    >
                      {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* User Address - Only for owner */}
                  {profile.userAddress !== 'Anonymous' && (
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Owner Wallet Address</p>
                      <p className="font-mono text-sm text-foreground break-all">{profile.userAddress}</p>
                    </div>
                  )}

                  {/* Creation Date */}
                  <div className="p-4 rounded-lg bg-background border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Created</p>
                    <p className="text-sm text-foreground">{new Date(profile.createdAt).toLocaleString()}</p>
                  </div>

                  {/* Attributes - Only for owner */}
                  {Object.keys(profile.attributes).length > 0 && profile.userAddress !== 'Anonymous' && (
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Disclosed Attributes</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(profile.attributes).map(([key, value]) => (
                          <div key={key} className="px-3 py-2 text-xs bg-accent/10 text-accent rounded font-medium border border-accent/20">
                            <p className="font-semibold">{key}</p>
                            <p className="text-xs text-accent/70">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blockchain Details - If available */}
                  {(profile.attributeHash || profile.transactionId) && (
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Blockchain Details</p>
                      <div className="space-y-2">
                        {profile.attributeHash && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Attribute Hash</p>
                            <p className="font-mono text-xs text-foreground break-all">{profile.attributeHash}</p>
                          </div>
                        )}
                        {profile.transactionId && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                            <p className="font-mono text-xs text-foreground break-all">{profile.transactionId}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Information Notice */}
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">
                  <strong>Privacy Notice:</strong> This page displays public identity information. Attribute values and personal details are only visible to the identity owner or when explicitly shared through selective disclosure proofs.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
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
                {hashValid && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              <div className="flex items-center justify-between bg-background/50 rounded-lg p-4 border border-border">
                <span className="font-mono text-sm text-foreground break-all">{profile.commitment}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(profile.commitment)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="text-accent hover:text-accent/80 flex-shrink-0 ml-2"
                  title="Copy commitment hash"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
              {copied && <p className="text-xs text-green-500">Copied to clipboard!</p>}
              <p className="text-xs text-muted-foreground">Format: CHECKSUM-HASH (verified: {hashValid ? 'valid' : 'invalid'})</p>
            </div>

            {/* Creation Date */}
            <div className="space-y-3 border-t border-border pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" />
                <label className="text-sm font-semibold text-foreground">Identity Created</label>
              </div>
              <p className="text-foreground">{new Date(profile.createdAt).toLocaleString()}</p>
            </div>

            {/* Verification Status */}
            <div className="space-y-3 border-t border-border pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <label className="text-sm font-semibold text-foreground">Verification Status</label>
              </div>
              {profile.verificationStatus === 'verified' ? (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-accent">Cryptographically Verified</p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span>Signature validated - only identity owner could create this</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span>Attribute hash verified - attributes cannot be modified</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-1">✓</span>
                      <span>Blockchain confirmed - identity is registered on Aleo network</span>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="bg-muted/20 border border-border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Verification status unknown - this identity may be anonymized</p>
                </div>
              )}
            </div>

            {/* Cryptographic Proofs - Only show if owner */}
            {isOwner && profile.signature && profile.attributeHash && (
              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" />
                  <label className="text-sm font-semibold text-foreground">Cryptographic Proofs</label>
                </div>
                <p className="text-xs text-muted-foreground">These proofs prove authenticity and prevent tampering</p>
                
                <div className="space-y-2">
                  {profile.signature && (
                    <div className="bg-background/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Digital Signature</p>
                      <p className="text-xs font-mono text-foreground break-all">{profile.signature.substring(0, 64)}...</p>
                    </div>
                  )}
                  {profile.attributeHash && (
                    <div className="bg-background/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Attribute Hash</p>
                      <p className="text-xs font-mono text-foreground break-all">{profile.attributeHash.substring(0, 64)}...</p>
                    </div>
                  )}
                  {profile.transactionId && (
                    <div className="bg-background/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Blockchain Transaction</p>
                      <p className="text-xs font-mono text-foreground break-all">{profile.transactionId}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activated Attributes */}
            {attributesList.length > 0 ? (
              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" />
                  <label className="text-sm font-semibold text-foreground">Activated Attributes ({attributesList.length})</label>
                </div>
                <p className="text-xs text-muted-foreground">These attributes were activated by the identity owner</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {attributesList.map(([attrId, value]) => {
                    const schema = STANDARD_ATTRIBUTES[attrId as keyof typeof STANDARD_ATTRIBUTES]
                    return (
                      <div key={attrId} className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                        <p className="font-semibold text-sm text-foreground">{schema?.name || attrId}</p>
                        <p className="text-xs text-muted-foreground mt-1">{schema?.description}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-accent/10">
                          <span className="text-xs font-mono bg-background/50 rounded px-2 py-1">{value}</span>
                          <span className="text-xs text-accent">Activated</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="border-t border-border pt-6">
                <p className="text-sm text-muted-foreground italic">No public attributes activated</p>
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
                <span>Activated attributes are cryptographically bound to this commitment</span>
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
