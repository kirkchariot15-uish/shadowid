'use client'

import { useState, useEffect } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import {
  Shield,
  Copy,
  CheckCircle,
  Edit3,
  QrCode,
  TrendingUp,
  Users,
  Lock,
  AlertCircle,
  ArrowLeft,
  Award,
  Download
} from 'lucide-react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { STANDARD_ATTRIBUTES } from '@/lib/attribute-schema'
import { CONFIG } from '@/lib/config'

interface Identity {
  commitment: string
  attributeHash: string
  activatedAttributes: Record<string, { value: string; enabled: boolean }>
  shadowScore: number
  endorsementCount: number
  createdAt: string
  isVerified: boolean
}

export function IdentityManagementPage() {
  const { address } = useAleoWallet()
  const { address } = useAleoWallet()
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedAttributes, setEditedAttributes] = useState<Record<string, boolean>>({})
  const [qrUrl, setQrUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIdentity()
  }, [address])

  useEffect(() => {
    if (identity && !isEditing) {
      generateQR()
    }
  }, [identity, isEditing])

  const loadIdentity = () => {
    try {
      const storedCommitment = localStorage.getItem('shadowid-commitment')
      const storedCommitmentHex = localStorage.getItem('shadowid-commitment-hex')
      const storedAttributes = localStorage.getItem('shadowid-credential')
      const storedCreatedAt = localStorage.getItem('shadowid-created-at')
      const storedAttributeHash = localStorage.getItem('shadowid-attribute-hash')

      if (storedCommitment) {
        // Parse credential to get activated attributes
        let activatedAttributes: Record<string, { value: string; enabled: boolean }> = {}
        if (storedAttributes) {
          try {
            const credential = JSON.parse(storedAttributes)
            activatedAttributes = credential.attributes || {}
          } catch (e) {
            console.log('[v0] Could not parse credential attributes')
          }
        }

        setIdentity({
          commitment: storedCommitment,
          attributeHash: storedAttributeHash || '',
          activatedAttributes,
          shadowScore: 50, // Default, will be fetched from blockchain
          endorsementCount: 0, // Default, will be fetched from blockchain
          createdAt: storedCreatedAt || new Date().toISOString(),
          isVerified: true
        })
        
        setEditedAttributes(
          Object.keys(activatedAttributes).reduce((acc, key) => {
            acc[key] = activatedAttributes[key].enabled || false
            return acc
          }, {} as Record<string, boolean>)
        )
      }
      setLoading(false)
    } catch (error) {
      console.error('[v0] Error loading identity:', error)
      setLoading(false)
    }
  }

  const generateQR = async () => {
    if (identity) {
      const qrData = {
        commitment: identity.commitment,
        shadowScore: identity.shadowScore,
        endorsementCount: identity.endorsementCount,
        generatedAt: new Date().toISOString(),
        validFor: `${CONFIG.QR_PROOF_VALIDITY_SECONDS / 3600} hours`
      }
      try {
        const url = await QRCode.toDataURL(JSON.stringify(qrData))
        setQrUrl(url)
      } catch (err) {
        console.error('QR generation failed:', err)
      }
    }
  }

  const handleCopyCommitment = () => {
    if (identity) {
      navigator.clipboard.writeText(identity.commitment)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleEditToggle = (attrId: string) => {
    setEditedAttributes(prev => ({
      ...prev,
      [attrId]: !prev[attrId]
    }))
  }

  const handleSaveEdits = () => {
    if (identity) {
      const updated = { ...identity.activatedAttributes }
      Object.keys(editedAttributes).forEach(key => {
        if (updated[key]) {
          updated[key].enabled = editedAttributes[key]
        }
      })
      setIdentity({ ...identity, activatedAttributes: updated })
      localStorage.setItem('shadowid-attributes', JSON.stringify(updated))
      setIsEditing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-border rounded" />
            <div className="h-12 bg-border rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!identity) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No ShadowID Found</h2>
            <p className="text-muted-foreground mb-6">You haven't created a ShadowID yet. Create one to start building your zero-knowledge identity.</p>
            <Link href="/create-identity">
              <Button>Create ShadowID</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const activatedCount = Object.values(editedAttributes).filter(v => v).length

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex gap-2">
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit Attributes
              </Button>
            )}
            {isEditing && (
              <>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdits}>Save Changes</Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Commitment & Verification */}
          <div className="lg:col-span-2 space-y-6">
            {/* Commitment Hash */}
            <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold">Identity Commitment</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Your cryptographic commitment hash (on blockchain)</p>
              <div className="flex gap-2 mb-4">
                <div className="flex-1 bg-background rounded-lg border border-border p-3 font-mono text-sm break-all">
                  {identity.commitment}
                </div>
                <Button
                  onClick={handleCopyCommitment}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-accent">
                <CheckCircle className="h-4 w-4" />
                <span>Verified on Aleo Testnet</span>
              </div>
            </div>

            {/* Shadow Score */}
            <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold">Shadow Score</h2>
              </div>
              <div className="flex items-end gap-4">
                <div>
                  <div className="text-5xl font-bold text-accent">{identity.shadowScore}</div>
                  <p className="text-xs text-muted-foreground mt-1">/ {CONFIG.SHADOW_SCORE.MAX}</p>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-blue-500 transition-all"
                      style={{ width: `${(identity.shadowScore / CONFIG.SHADOW_SCORE.MAX) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {identity.shadowScore < 40 && 'Neutral - Build credibility with peer endorsements'}
                    {identity.shadowScore >= 40 && identity.shadowScore < 70 && 'Good - Your identity is gaining trust'}
                    {identity.shadowScore >= 70 && 'Excellent - Highly trusted identity'}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Peer Endorsements</span>
                    </div>
                    <p className="text-2xl font-bold">{identity.endorsementCount}</p>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    <p>+{CONFIG.SHADOW_SCORE.PER_ENDORSEMENT} per endorsement</p>
                    <p>Max {CONFIG.SHADOW_SCORE.MAX} score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activated Attributes */}
            <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  <h2 className="text-lg font-semibold">Activated Attributes</h2>
                </div>
                {isEditing && (
                  <span className="text-xs font-mono bg-accent/10 px-2 py-1 rounded">
                    {activatedCount} activated
                  </span>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  {Object.entries(identity.activatedAttributes).map(([attrId, data]) => {
                    const schema = STANDARD_ATTRIBUTES[attrId as keyof typeof STANDARD_ATTRIBUTES]
                    if (!schema) return null
                    const isActive = editedAttributes[attrId]
                    return (
                      <div
                        key={attrId}
                        className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all ${
                          isActive
                            ? 'border-accent bg-accent/5'
                            : 'border-border bg-background/50 hover:border-accent/50'
                        }`}
                        onClick={() => handleEditToggle(attrId)}
                      >
                        <div className={`h-5 w-5 rounded border flex items-center justify-center transition-all ${
                          isActive ? 'bg-accent border-accent' : 'border-border'
                        }`}>
                          {isActive && <CheckCircle className="h-4 w-4 text-background" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{schema.name}</p>
                          <p className="text-xs text-muted-foreground">{data.value || 'Value set'}</p>
                        </div>
                        <span className={`text-xs font-semibold ${isActive ? 'text-accent' : 'text-muted-foreground'}`}>
                          {isActive ? 'Activated' : 'Inactive'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(identity.activatedAttributes)
                    .filter(([, data]) => data.enabled)
                    .map(([attrId, data]) => {
                      const schema = STANDARD_ATTRIBUTES[attrId as keyof typeof STANDARD_ATTRIBUTES]
                      if (!schema) return null
                      return (
                        <div
                          key={attrId}
                          className="rounded-lg border border-accent/20 bg-accent/5 p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-semibold text-sm">{schema.name}</p>
                            <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{schema.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono bg-background/50 rounded px-2 py-1">{data.value}</span>
                            <span className="text-xs text-accent">Activated</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: QR & Info */}
          <div className="space-y-6">
            {/* QR Code */}
            <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold">Share Identity</h2>
              </div>
              {qrUrl && (
                <>
                  <img src={qrUrl} alt="Identity QR Code" className="w-full rounded-lg border border-border mb-4" />
                  <p className="text-xs text-muted-foreground mb-4 text-center">
                    Valid for {Math.floor(CONFIG.QR_PROOF_VALIDITY_SECONDS / 3600)} hour{CONFIG.QR_PROOF_VALIDITY_SECONDS / 3600 !== 3600 ? 's' : ''}
                  </p>
                </>
              )}
              <Button className="w-full gap-2" variant="outline">
                <Download className="h-4 w-4" />
                Download QR
              </Button>
            </div>

            {/* Identity Info */}
            <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Created</p>
                <p className="text-sm font-semibold">
                  {new Date(identity.createdAt).toLocaleDateString()} at {new Date(identity.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <p className="text-sm font-semibold">Active & Verified</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Privacy Level</p>
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="h-4 w-4 text-accent" />
                  Zero-Knowledge
                </p>
              </div>
              {address && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                  <p className="text-xs font-mono text-accent truncate">{address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
