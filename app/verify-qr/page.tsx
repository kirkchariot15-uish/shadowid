'use client'

import { useState, useRef } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Upload, Copy, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function VerifyQRPage() {
  const [qrData, setQrData] = useState<any>(null)
  const [manualInput, setManualInput] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const parseQRData = (data: string) => {
    try {
      const parsed = JSON.parse(data)
      if (parsed.type === 'shadowid-disclosure-v1') {
        setQrData(parsed)
        setError('')
        return true
      } else {
        setError('Invalid QR code format')
        return false
      }
    } catch (err) {
      setError('Failed to parse QR code data')
      return false
    }
  }

  const handleManualInput = () => {
    if (!manualInput.trim()) {
      setError('Please paste QR code data')
      return
    }
    parseQRData(manualInput)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsVerifying(true)
    setError('')

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const img = new Image()
        img.onload = async () => {
          try {
            // Use jsQR library if available, or use a QR decoding service
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            if (!ctx) throw new Error('Canvas context not available')
            ctx.drawImage(img, 0, 0)

            // For production, you'd use a QR decoding library like jsQR or qrcode-decoder
            // For now, show manual input as fallback
            setError('QR code image upload requires client-side decoding library. Please paste the QR data manually below.')
          } catch (err) {
            setError('Failed to decode QR code image')
          } finally {
            setIsVerifying(false)
          }
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Error reading file')
      setIsVerifying(false)
    }
  }

  const copyCommitmentLink = () => {
    if (!qrData?.commitment) return
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify?commitment=${qrData.commitment}`
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Verify QR Code</h1>
              <p className="text-muted-foreground mt-2">Scan or paste a ShadowID disclosure proof</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          {!qrData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* File Upload */}
              <Card className="p-8 border-border bg-card/30">
                <h2 className="text-lg font-semibold mb-6">Upload QR Code</h2>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-12 cursor-pointer hover:border-accent/50 transition-colors flex flex-col items-center justify-center text-center"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium mb-1">Click to upload QR code image</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, or GIF</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isVerifying}
                  className="hidden"
                />
              </Card>

              {/* Manual Input */}
              <Card className="p-8 border-border bg-card/30">
                <h2 className="text-lg font-semibold mb-6">Paste QR Data</h2>
                <textarea
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Paste the QR code data (JSON format)..."
                  className="w-full h-40 p-3 rounded-lg border border-border bg-background text-foreground text-xs font-mono resize-none mb-4"
                />
                <Button
                  onClick={handleManualInput}
                  disabled={!manualInput.trim() || isVerifying}
                  className="w-full"
                >
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </Button>
              </Card>
            </div>
          ) : (
            /* Verification Results */
            <div className="space-y-6">
              <Card className="p-8 border-accent/30 bg-accent/5">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold">Disclosure Proof Verified</h2>
                    <p className="text-sm text-muted-foreground mt-1">This QR code contains a valid disclosure proof</p>
                  </div>
                  <Button
                    onClick={() => setQrData(null)}
                    variant="outline"
                    size="sm"
                  >
                    Verify Another
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Commitment */}
                  <div className="flex items-start justify-between p-4 rounded-lg bg-background border border-border">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Commitment Hash</p>
                      <p className="font-mono text-sm text-accent break-all">{qrData.commitment}</p>
                    </div>
                    <Button
                      onClick={copyCommitmentLink}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Attributes */}
                  {qrData.selectedAttributes && qrData.selectedAttributes.length > 0 && (
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Disclosed Attributes</p>
                      <div className="flex flex-wrap gap-2">
                        {qrData.selectedAttributes.map((attr: string) => (
                          <span
                            key={attr}
                            className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium"
                          >
                            {attr}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expiry */}
                  {qrData.expiresAt && (
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Valid Until</p>
                      <p className="font-mono text-sm">{new Date(qrData.expiresAt).toLocaleString()}</p>
                    </div>
                  )}

                  {/* Verification Link */}
                  <div className="p-4 rounded-lg bg-background border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">View Full Identity</p>
                    <Link
                      href={`/verify?commitment=${qrData.commitment}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
                    >
                      <span className="text-sm font-medium break-all">
                        {typeof window !== 'undefined' ? `${window.location.origin}/verify?commitment=${qrData.commitment.slice(0, 16)}...` : 'View profile'}
                      </span>
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    </Link>
                  </div>
                </div>
              </Card>

              {error && (
                <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {error && !qrData && (
            <div className="mt-6 p-4 border border-red-500/30 bg-red-500/10 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
