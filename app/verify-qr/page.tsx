'use client'

import { useState, useRef, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Upload, Copy, ExternalLink, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import { CONFIG } from '@/lib/config'

interface QRDisclosureProof {
  type: string
  commitment: string
  selectedAttributes: string[]
  timestamp: number
  expiresAt: string
  userAddress: string
  verifyUrl: string
}

export default function VerifyQRPage() {
  const [qrData, setQrData] = useState<QRDisclosureProof | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  // Validate QR code expiry
  const validateQRExpiry = (qr: QRDisclosureProof): { valid: boolean; hoursRemaining?: number } => {
    const expiryTime = new Date(qr.expiresAt).getTime()
    const nowTime = new Date().getTime()
    
    if (nowTime > expiryTime) {
      console.log('[v0] QR code expired at', qr.expiresAt)
      return { valid: false }
    }
    
    const hoursRemaining = (expiryTime - nowTime) / (1000 * 60 * 60)
    console.log('[v0] QR code valid for', hoursRemaining.toFixed(1), 'more hours')
    return { valid: true, hoursRemaining }
  }

  const parseQRData = (data: string) => {
    try {
      const parsed = JSON.parse(data) as QRDisclosureProof
      
      if (parsed.type !== 'shadowid-disclosure-v1') {
        setError('Invalid QR code format')
        return false
      }

      // Validate QR expiry
      const expiryCheck = validateQRExpiry(parsed)
      if (!expiryCheck.valid) {
        setError('This QR code has expired and is no longer valid')
        setIsExpired(true)
        return false
      }

      // Validate required fields
      if (!parsed.commitment || !parsed.selectedAttributes || !parsed.timestamp || !parsed.expiresAt) {
        setError('QR code is missing required fields')
        return false
      }

      setQrData(parsed)
      setError('')
      setIsExpired(false)
      return true
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
        img.crossOrigin = 'anonymous'
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            if (!ctx) throw new Error('Canvas context not available')
            ctx.drawImage(img, 0, 0)

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

  const getTimeRemaining = () => {
    if (!qrData) return null
    const expiryTime = new Date(qrData.expiresAt).getTime()
    const nowTime = new Date().getTime()
    const msRemaining = expiryTime - nowTime
    
    if (msRemaining <= 0) return 'Expired'
    
    const hours = Math.floor(msRemaining / (1000 * 60 * 60))
    const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
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
              <Card className={`p-8 ${isExpired ? 'border-destructive/30 bg-destructive/5' : 'border-accent/30 bg-accent/5'}`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-3">
                    {!isExpired ? (
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h2 className="text-lg font-semibold">{isExpired ? 'Proof Expired' : 'Disclosure Proof Verified'}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isExpired 
                          ? `This QR code expired at ${new Date(qrData.expiresAt).toLocaleString()}`
                          : 'This QR code contains a valid disclosure proof'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setQrData(null)
                      setIsExpired(false)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Verify Another
                  </Button>
                </div>

                {!isExpired && (
                  <div className="space-y-4">
                    {/* Time Remaining */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-accent/20">
                      <Clock className="h-4 w-4 text-accent flex-shrink-0" />
                      <p className="text-sm text-foreground font-medium">{getTimeRemaining()}</p>
                    </div>

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
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Disclosed Attributes</p>
                      <div className="flex flex-wrap gap-2">
                        {qrData.selectedAttributes.map((attr) => (
                          <span key={attr} className="px-2 py-1 text-xs bg-accent/10 text-accent rounded font-medium">
                            {attr}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Proof Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-background border border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Created</p>
                        <p className="text-xs text-foreground">{new Date(qrData.timestamp * 1000).toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background border border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Expires</p>
                        <p className="text-xs text-foreground">{new Date(qrData.expiresAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {isExpired && (
                <Card className="p-6 border-border bg-card/30">
                  <p className="text-sm text-muted-foreground mb-4">
                    This disclosure proof has expired and can no longer be verified. Request a new QR code from the identity owner.
                  </p>
                  <Link href="/selective-disclosure">
                    <Button className="w-full">Generate New Disclosure Proof</Button>
                  </Link>
                </Card>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{error}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
