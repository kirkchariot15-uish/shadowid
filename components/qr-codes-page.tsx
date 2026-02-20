'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react'
import { WalletMultiButton } from '@/components/wallet-button'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Lock, ArrowLeft, Download, Eye, EyeOff, Copy, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { addActivityLog } from '@/lib/activity-logger'

interface StoredQRCode {
  commitment: string
  createdAt: string
  userInfo: {
    hasPhoto: boolean
    documentCount: number
    notesCount: number
    documentsNames: string[]
    notes: string[]
  }
  qrDataUrl?: string
}

export default function QRCodesPage() {
  const { isConnected } = useAleoWallet()
  const [qrCodes, setQrCodes] = useState<StoredQRCode[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [loadedQRs, setLoadedQRs] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isConnected) return

    const commitment = localStorage.getItem('shadowid-commitment')
    const createdAt = localStorage.getItem('shadowid-created-at')
    const userInfoStr = localStorage.getItem('shadowid-user-info')

    if (commitment && createdAt && userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr)
        const qrData = {
          commitment,
          createdAt,
          userInfo,
        }

        setQrCodes([qrData])

        // Generate QR code
        generateQRCode(commitment, userInfo)
        addActivityLog('View QR codes', 'qrcode', `Viewed ${commitment.substring(0, 8)}...`, 'success')
      } catch (err) {
        console.error('[v0] Error loading QR codes:', err)
      }
    }
  }, [isConnected])

  const generateQRCode = async (commitment: string, userInfo: any) => {
    try {
      const qrData = JSON.stringify({
        commitment,
        type: 'shadowid-v1',
        timestamp: new Date().toISOString(),
        userInfo,
      })

      const qrUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 500,
        margin: 3,
        color: { dark: '#000000', light: '#ffffff' },
      })

      setLoadedQRs(prev => ({
        ...prev,
        [commitment]: qrUrl
      }))
    } catch (err) {
      console.error('[v0] QR generation error:', err)
    }
  }

  const handleDownloadQR = (commitment: string, qrUrl: string) => {
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `shadowid-qr-${commitment.substring(0, 8)}.png`
    link.click()
    addActivityLog('Download QR code', 'qrcode', `Downloaded QR: ${commitment.substring(0, 8)}...`, 'success')
  }

  const handleCopyCommitment = (commitment: string) => {
    navigator.clipboard.writeText(commitment)
    setCopied(commitment)
    addActivityLog('Copy commitment', 'qrcode', `Copied: ${commitment.substring(0, 8)}...`, 'success')
    setTimeout(() => setCopied(null), 2000)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-foreground font-semibold">Connect Wallet Required</p>
          <WalletMultiButton />
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Your QR Codes</h1>
                <p className="text-muted-foreground mt-1">View, download, and share your ShadowID verification codes</p>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" className="border-blue-500/40 text-blue-600 hover:bg-blue-500/10 gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>
          </div>

          {qrCodes.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-16 text-center">
              <Lock className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-foreground font-semibold mb-2">No QR Codes Created</p>
              <p className="text-sm text-muted-foreground mb-6">Create a ShadowID to generate your first QR code</p>
              <Link href="/create-identity">
                <Button className="bg-accent hover:bg-accent/90">
                  Create ShadowID
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {qrCodes.map((qr, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-card overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-border/50 bg-muted/20">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">ShadowID #{idx + 1}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(qr.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => setExpandedId(expandedId === qr.commitment ? null : qr.commitment)}
                        className="p-2 hover:bg-muted/40 rounded transition-colors"
                      >
                        {expandedId === qr.commitment ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {expandedId === qr.commitment && (
                    <div className="p-8 space-y-8">
                      {/* Commitment */}
                      <div>
                        <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">Identity Commitment</p>
                        <div className="bg-muted/20 rounded-lg p-4 border border-border">
                          <div className="flex items-center gap-3">
                            <p className="font-mono font-bold text-sm text-accent flex-1 break-all">{qr.commitment}</p>
                            <button
                              onClick={() => handleCopyCommitment(qr.commitment)}
                              className="p-2 hover:bg-muted/40 rounded transition-colors flex-shrink-0"
                            >
                              {copied === qr.commitment ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Identity Summary */}
                      <div>
                        <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">Identity Contents</p>
                        <div className="grid grid-cols-3 gap-4 bg-muted/10 rounded-lg p-4 border border-border/20">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-accent">{qr.userInfo.hasPhoto ? '✓' : '–'}</p>
                            <p className="text-xs text-muted-foreground mt-1">Photo</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-accent">{qr.userInfo.documentCount}</p>
                            <p className="text-xs text-muted-foreground mt-1">Documents</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-accent">{qr.userInfo.notesCount}</p>
                            <p className="text-xs text-muted-foreground mt-1">Notes</p>
                          </div>
                        </div>
                      </div>

                      {/* QR Code Display */}
                      <div>
                        <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-4">Scannable QR Code</p>
                        <div className="flex justify-center">
                          <div className="bg-white rounded-lg p-6 border-4 border-accent/20 shadow-lg">
                            {loadedQRs[qr.commitment] ? (
                              <img
                                src={loadedQRs[qr.commitment]}
                                alt="ShadowID QR Code"
                                className="w-64 h-64"
                                style={{ imageRendering: 'crisp-edges' }}
                              />
                            ) : (
                              <div className="w-64 h-64 bg-muted/10 rounded flex items-center justify-center">
                                <p className="text-xs text-muted-foreground">Generating...</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground/70 mt-4 text-center">
                          Scan this QR code to verify identity claims without revealing personal details
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4 border-t border-border/50">
                        {loadedQRs[qr.commitment] && (
                          <Button
                            onClick={() => handleDownloadQR(qr.commitment, loadedQRs[qr.commitment])}
                            className="flex-1 bg-accent hover:bg-accent/90 gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download QR Code
                          </Button>
                        )}
                        <Link href="/create-identity" className="flex-1">
                          <Button variant="outline" className="w-full">
                            Create Another
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
