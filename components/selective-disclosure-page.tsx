'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Lock, Eye, EyeOff, Copy, Download, ArrowLeft, CheckCircle, QrCode, Edit2, Save, X } from 'lucide-react'
import Link from 'next/link'
import { getUserProfile } from '@/lib/user-profile'
import { addActivityLog } from '@/lib/activity-logger'

export default function SelectiveDisclosurePage() {
  const { isConnected, address } = useAleoWallet()
  const [revealedAttributes, setRevealedAttributes] = useState<Record<string, boolean>>({})
  const [editingAttribute, setEditingAttribute] = useState<string | null>(null)
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [selectedQRData, setSelectedQRData] = useState<any>(null)
  const [qrUrl, setQrUrl] = useState<string>('')

  const defaultAttributes = [
    {
      key: 'full-name',
      label: 'Full Name',
      category: 'Personal',
      defaultValue: 'Your Full Name',
      description: 'Your legal identity name',
    },
    {
      key: 'role',
      label: 'Role / Title',
      category: 'Professional',
      defaultValue: 'Your Role',
      description: 'Your professional role or title',
    },
    {
      key: 'credential-type',
      label: 'Credential Type',
      category: 'Credentials',
      defaultValue: 'Your Credential',
      description: 'Your credential category',
    },
    {
      key: 'age-range',
      label: 'Age Range',
      category: 'Verification',
      defaultValue: 'Your Age Range',
      description: 'Your age category (not exact age)',
    },
    {
      key: 'dao-member',
      label: 'DAO Membership',
      category: 'Credentials',
      defaultValue: 'Member Status',
      description: 'Your DAO membership status',
    },
    {
      key: 'verification-status',
      label: 'Verification Status',
      category: 'Status',
      defaultValue: 'Your Status',
      description: 'Your verification level',
    },
  ]

  // Initialize attribute values
  useEffect(() => {
    const initialized: Record<string, string> = {}
    defaultAttributes.forEach(attr => {
      initialized[attr.key] = localStorage.getItem(`disclosure-${attr.key}`) || attr.defaultValue
    })
    setAttributeValues(initialized)
  }, [])

  // Load user profile
  useEffect(() => {
    if (!isConnected || !address) return

    const loadProfile = async () => {
      try {
        const profile = await getUserProfile(address)
        setUserProfile(profile)
      } catch (err) {
        console.error('[v0] Error loading profile:', err)
      }
    }

    loadProfile()
  }, [isConnected, address])

  // Auto-generate QR code whenever revealed attributes change
  useEffect(() => {
    const generateQR = async () => {
      const selectedAttrs = defaultAttributes.filter(attr => revealedAttributes[attr.key])
      
      if (selectedAttrs.length === 0) {
        setQrUrl('')
        setSelectedQRData(null)
        return
      }

      try {
        const disclosureData = {
          type: 'shadowid-disclosure-v1',
          timestamp: new Date().toISOString(),
          walletAddress: address,
          attributes: selectedAttrs.map(attr => ({
            key: attr.key,
            label: attr.label,
            value: attributeValues[attr.key] || attr.defaultValue,
            category: attr.category,
          })),
          profile: userProfile ? {
            username: userProfile.username,
            bio: userProfile.bio,
          } : null,
          commitmentReference: localStorage.getItem('shadowid-commitment'),
        }

        const qrData = JSON.stringify(disclosureData)
        const qrUrl = await QRCode.toDataURL(qrData, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 500,
          margin: 3,
          color: { dark: '#000000', light: '#ffffff' },
        })

        setSelectedQRData(disclosureData)
        setQrUrl(qrUrl)
      } catch (err) {
        console.error('[v0] QR generation error:', err)
      }
    }

    generateQR()
  }, [revealedAttributes, attributeValues, address, userProfile])

  const toggleAttribute = (key: string) => {
    setRevealedAttributes(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const updateAttributeValue = (key: string, value: string) => {
    setAttributeValues(prev => ({
      ...prev,
      [key]: value
    }))
    localStorage.setItem(`disclosure-${key}`, value)
  }

  const handleCopyAttribute = (key: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopied(key)
    addActivityLog('Copy disclosed attribute', 'disclosure', `Copied: ${key}`, 'success')
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadDisclosureQR = () => {
    if (!qrUrl) return
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `shadowid-disclosure-${new Date().getTime()}.png`
    link.click()
    addActivityLog('Download disclosure QR', 'disclosure', 'Downloaded disclosure QR code', 'success')
  }

  const categories = ['Personal', 'Professional', 'Credentials', 'Verification', 'Status']

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-foreground font-semibold">Wallet Connection Required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Selective Disclosure</h1>
              <p className="text-muted-foreground mt-2">Edit attributes and generate custom QR codes</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-accent/40 text-accent hover:bg-accent/10 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Attributes Section */}
            <div className="lg:col-span-2 space-y-8">
              {/* Info Banner */}
              <div className="p-4 rounded-lg border border-accent/30 bg-accent/5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Edit your information, toggle attributes to reveal, and your QR code updates instantly. Everything stays private on your device.
                </p>
              </div>

              {/* Attributes by Category */}
              {categories.map((category) => {
                const categoryAttributes = defaultAttributes.filter(attr => attr.category === category)
                if (categoryAttributes.length === 0) return null

                return (
                  <div key={category}>
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">{category}</h2>
                    <div className="space-y-3">
                      {categoryAttributes.map((attr) => {
                        const currentValue = attributeValues[attr.key] || attr.defaultValue
                        const isEditing = editingAttribute === attr.key
                        const isRevealed = revealedAttributes[attr.key]

                        return (
                          <div
                            key={attr.key}
                            className={`rounded-lg border transition-all ${
                              isRevealed 
                                ? 'border-accent/40 bg-accent/5' 
                                : 'border-border bg-card'
                            } p-6 hover:bg-muted/5`}
                          >
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-foreground">{attr.label}</h3>
                                <p className="text-xs text-muted-foreground/60">{attr.description}</p>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Edit Button */}
                                {!isEditing && (
                                  <button
                                    onClick={() => setEditingAttribute(attr.key)}
                                    className="p-2 hover:bg-accent/10 rounded transition-colors"
                                    title="Edit attribute"
                                  >
                                    <Edit2 className="h-4 w-4 text-muted-foreground/60 hover:text-accent" />
                                  </button>
                                )}

                                {/* Reveal Toggle */}
                                <button
                                  onClick={() => toggleAttribute(attr.key)}
                                  className="p-2 hover:bg-accent/10 rounded transition-colors"
                                  title={isRevealed ? 'Hide attribute' : 'Reveal attribute'}
                                >
                                  {isRevealed ? (
                                    <Eye className="h-5 w-5 text-accent" />
                                  ) : (
                                    <EyeOff className="h-5 w-5 text-muted-foreground/60" />
                                  )}
                                </button>

                                {/* Copy Button */}
                                {isRevealed && !isEditing && (
                                  <button
                                    onClick={() => handleCopyAttribute(attr.key, currentValue)}
                                    className="p-2 hover:bg-accent/10 rounded transition-colors"
                                    title="Copy value"
                                  >
                                    <Copy className={`h-5 w-5 ${copied === attr.key ? 'text-green-600' : 'text-muted-foreground/60 hover:text-accent'}`} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Display or Edit Mode */}
                            {isEditing ? (
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={currentValue}
                                  onChange={(e) => updateAttributeValue(attr.key, e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg bg-background border border-accent/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 text-sm"
                                  placeholder={attr.defaultValue}
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingAttribute(null)}
                                    className="flex-1 px-3 py-2 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                                  >
                                    <Save className="h-4 w-4" />
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingAttribute(null)}
                                    className="flex-1 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className={`text-sm font-mono transition-colors ${
                                isRevealed ? 'text-accent font-bold' : 'text-muted-foreground/50'
                              }`}>
                                {isRevealed ? currentValue : `${'•'.repeat(Math.max(10, currentValue.length))}`}
                              </div>
                            )}

                            {copied === attr.key && (
                              <p className="text-xs text-green-600 mt-3">Copied</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* QR Code Live Preview Panel */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-border bg-card p-6 sticky top-24 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-accent" />
                  Live QR Preview
                </h3>

                <div className="p-3 rounded-lg bg-muted/5 border border-border/30">
                  <p className="text-xs text-muted-foreground">
                    <strong>{Object.values(revealedAttributes).filter(Boolean).length}</strong> attribute{Object.values(revealedAttributes).filter(Boolean).length !== 1 ? 's' : ''} selected
                  </p>
                </div>

                {qrUrl && selectedQRData ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="bg-white rounded-lg p-4 border-4 border-accent/20">
                        <img
                          src={qrUrl}
                          alt="Disclosure QR Code"
                          className="w-40 h-40"
                          style={{ imageRendering: 'crisp-edges' }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-center">
                      <p className="text-muted-foreground">
                        {selectedQRData.attributes.length} attribute{selectedQRData.attributes.length !== 1 ? 's' : ''} encoded
                      </p>
                      {userProfile?.username && (
                        <p className="text-muted-foreground">
                          User: <span className="text-foreground font-semibold">{userProfile.username}</span>
                        </p>
                      )}
                      <p className="text-muted-foreground/60">
                        Updated: {new Date(selectedQRData.timestamp).toLocaleTimeString()}
                      </p>
                    </div>

                    <Button
                      onClick={downloadDisclosureQR}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download QR
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <QrCode className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="text-xs text-muted-foreground">
                      Select attributes to generate QR code
                    </p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground/70 leading-relaxed border-t border-border/50 pt-4">
                  <p><strong>Privacy:</strong> QR codes contain only your selected, custom attributes. Your original commitment is never shared.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
