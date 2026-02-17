'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Lock, Eye, EyeOff, Copy, Download, ArrowLeft, Loader, CheckCircle, QrCode } from 'lucide-react'
import Link from 'next/link'
import { getUserProfile } from '@/lib/user-profile'
import { addActivityLog } from '@/lib/activity-logger'

export default function SelectiveDisclosurePage() {
  const { isConnected, address } = useAleoWallet()
  const [revealedAttributes, setRevealedAttributes] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [selectedQRData, setSelectedQRData] = useState<any>(null)
  const [qrUrl, setQrUrl] = useState<string>('')

  const attributes = [
    {
      key: 'full-name',
      label: 'Full Name',
      category: 'Personal',
      value: 'Alex Morgan',
      masked: '••••••••••••',
      description: 'Your legal identity name',
    },
    {
      key: 'role',
      label: 'Role / Title',
      category: 'Professional',
      value: 'Software Engineer',
      masked: '•••••••••••••••',
      description: 'Your professional role or title',
    },
    {
      key: 'credential-type',
      label: 'Credential Type',
      category: 'Credentials',
      value: 'Verified Contributor',
      masked: '•••••••••',
      description: 'Your credential category',
    },
    {
      key: 'age-range',
      label: 'Age Range',
      category: 'Verification',
      value: '25-35',
      masked: '••',
      description: 'Your age category (not exact age)',
    },
    {
      key: 'dao-member',
      label: 'DAO Membership',
      category: 'Credentials',
      value: 'Active Member',
      masked: '••••••••',
      description: 'Your DAO membership status',
    },
    {
      key: 'verification-status',
      label: 'Verification Status',
      category: 'Status',
      value: 'Verified',
      masked: '••••••••',
      description: 'Your verification level',
    },
  ]

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

  const toggleAttribute = (key: string) => {
    setRevealedAttributes(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleCopyAttribute = (key: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopied(key)
    addActivityLog('Copy disclosed attribute', 'disclosure', `Copied: ${key}`, 'success')
    setTimeout(() => setCopied(null), 2000)
  }

  const generateDisclosureQR = async () => {
    const selectedAttrs = attributes.filter(attr => revealedAttributes[attr.key])
    if (selectedAttrs.length === 0) return

    setIsGeneratingQR(true)
    try {
      const disclosureData = {
        type: 'shadowid-disclosure-v1',
        timestamp: new Date().toISOString(),
        walletAddress: address,
        attributes: selectedAttrs.map(attr => ({
          key: attr.key,
          label: attr.label,
          value: attr.value,
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
      addActivityLog('Generate disclosure QR', 'disclosure', `Generated QR with ${selectedAttrs.length} attribute(s)`, 'success')
    } catch (err) {
      console.error('[v0] QR generation error:', err)
      addActivityLog('Generate disclosure QR', 'disclosure', 'Failed to generate QR', 'error')
    } finally {
      setIsGeneratingQR(false)
    }
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

      {/* QR Generation Loading Overlay */}
      {isGeneratingQR && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-background border border-border rounded-xl p-8 shadow-2xl space-y-4">
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <Loader className="w-full h-full text-accent animate-spin" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Generating Disclosure QR</p>
              <p className="text-xs text-muted-foreground mt-1">Encoding selected attributes...</p>
            </div>
          </div>
        </div>
      )}

      <main className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Selective Disclosure</h1>
              <p className="text-muted-foreground mt-1">Reveal only the attributes you want to share</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-blue-500/40 text-blue-600 hover:bg-blue-500/10 gap-2">
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
                  Click the eye icon to reveal attributes. Select multiple attributes and generate a QR code that shares only what you choose. All operations happen locally in your browser.
                </p>
              </div>

              {/* Attributes by Category */}
              {categories.map((category) => {
                const categoryAttributes = attributes.filter(attr => attr.category === category)
                if (categoryAttributes.length === 0) return null

                return (
                  <div key={category}>
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">{category}</h2>
                    <div className="space-y-3">
                      {categoryAttributes.map((attr) => (
                        <div
                          key={attr.key}
                          className="rounded-lg border border-border bg-card p-6 hover:bg-muted/5 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-foreground mb-1">{attr.label}</h3>
                              <p className="text-xs text-muted-foreground/60 mb-3">{attr.description}</p>
                              <p className={`text-sm font-mono transition-colors ${
                                revealedAttributes[attr.key] ? 'text-accent font-bold' : 'text-muted-foreground/50'
                              }`}>
                                {revealedAttributes[attr.key] ? attr.value : attr.masked}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Reveal Toggle */}
                              <button
                                onClick={() => toggleAttribute(attr.key)}
                                className="p-2 hover:bg-accent/10 rounded transition-colors"
                                title={revealedAttributes[attr.key] ? 'Hide attribute' : 'Reveal attribute'}
                              >
                                {revealedAttributes[attr.key] ? (
                                  <Eye className="h-5 w-5 text-accent" />
                                ) : (
                                  <EyeOff className="h-5 w-5 text-muted-foreground/60" />
                                )}
                              </button>

                              {/* Copy Button */}
                              {revealedAttributes[attr.key] && (
                                <button
                                  onClick={() => handleCopyAttribute(attr.key, attr.value)}
                                  className="p-2 hover:bg-accent/10 rounded transition-colors"
                                  title="Copy value"
                                >
                                  <Copy className={`h-5 w-5 ${copied === attr.key ? 'text-green-600' : 'text-muted-foreground/60 hover:text-accent'}`} />
                                </button>
                              )}
                            </div>
                          </div>

                          {copied === attr.key && (
                            <p className="text-xs text-green-600 mt-3">Copied</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* QR Code Generation Panel */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-border bg-card p-6 sticky top-24 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-accent" />
                  Generate QR Code
                </h3>

                <div className="p-3 rounded-lg bg-muted/5 border border-border/30">
                  <p className="text-xs text-muted-foreground">
                    <strong>{Object.values(revealedAttributes).filter(Boolean).length}</strong> attribute{Object.values(revealedAttributes).filter(Boolean).length !== 1 ? 's' : ''} selected
                  </p>
                </div>

                <Button
                  onClick={generateDisclosureQR}
                  disabled={Object.values(revealedAttributes).filter(Boolean).length === 0 || isGeneratingQR}
                  className="w-full bg-accent hover:bg-accent/90 gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  Generate QR Code
                </Button>

                {qrUrl && selectedQRData && (
                  <div className="space-y-4 border-t border-border/50 pt-4">
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

                    <div className="space-y-2 text-xs">
                      <p className="text-muted-foreground text-center">
                        {selectedQRData.attributes.length} attribute{selectedQRData.attributes.length !== 1 ? 's' : ''} encoded
                      </p>
                      {userProfile?.username && (
                        <p className="text-muted-foreground text-center">
                          Username: <span className="text-foreground font-semibold">{userProfile.username}</span>
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={downloadDisclosureQR}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download QR
                    </Button>
                  </div>
                )}

                <div className="text-xs text-muted-foreground/70 leading-relaxed">
                  <p><strong>Privacy:</strong> QR codes contain only selected attributes + your profile metadata. Your original commitment remains unchanged.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
