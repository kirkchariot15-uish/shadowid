'use client'

import { useState, useRef, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Upload, Copy, Camera, AlertCircle, CheckCircle2, Clock, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { QRCameraScanner } from '@/components/qr-camera-scanner'
import { CameraPermissionDialog } from '@/components/camera-permission-dialog'
import { decodeQRFromImage, parseAndValidateQRData, getQRTimeRemaining, QRDecodeResult, QRDisclosureProof } from '@/lib/qr-decoder'

type VerificationMethod = 'select' | 'upload' | 'camera' | 'paste'

export default function VerifyQRPage() {
  const [qrData, setQrData] = useState<QRDisclosureProof | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [error, setError] = useState('')
  const [method, setMethod] = useState<VerificationMethod>('select')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [showCameraDialog, setShowCameraDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle QR detection from all sources
  const handleQRDetected = (result: QRDecodeResult) => {
    if (result.success && result.data) {
      setQrData(result.data)
      setError('')
      setIsExpired(false)
      setMethod('select')
    } else {
      setError(result.error || 'Failed to verify QR code')
      if (result.isExpired) {
        setIsExpired(true)
      }
    }
    setIsVerifying(false)
  }

  // Handle photo upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsVerifying(true)
    setError('')

    const result = await decodeQRFromImage(file)
    handleQRDetected(result)
  }

  // Handle manual JSON paste
  const handleManualInput = () => {
    if (!manualInput.trim()) {
      setError('Please paste QR code data')
      return
    }
    
    const result = parseAndValidateQRData(manualInput)
    handleQRDetected(result)
  }

  // Format time remaining
  const getTimeRemaining = () => {
    if (!qrData) return null
    const timeInfo = getQRTimeRemaining(qrData.expiresAt)
    return timeInfo.formatted
  }

  // Render content based on verification method
  const renderMethodContent = () => {
    switch (method) {
      case 'upload':
        return (
          <div className="space-y-4">
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
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-xs text-muted-foreground">
              Image is processed locally in your browser. Never uploaded or stored anywhere.
            </div>
            <Button onClick={() => setMethod('select')} variant="outline" className="w-full">
              Back
            </Button>
          </div>
        )

      case 'camera':
        return (
          <div className="space-y-4">
            <QRCameraScanner
              onQRDetected={handleQRDetected}
              onClose={() => setMethod('select')}
            />
          </div>
        )

      case 'paste':
        return (
          <div className="space-y-4">
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Paste the QR code data (JSON format)..."
              className="w-full h-40 p-3 rounded-lg border border-border bg-background text-foreground text-xs font-mono resize-none"
            />
            <Button
              onClick={handleManualInput}
              disabled={!manualInput.trim() || isVerifying}
              className="w-full"
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-xs text-muted-foreground">
              Paste the raw JSON from a QR code for manual verification.
            </div>
            <Button onClick={() => setMethod('select')} variant="outline" className="w-full">
              Back
            </Button>
          </div>
        )

      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Camera Option */}
            <button
              onClick={() => {
                setShowCameraDialog(true)
              }}
              className="p-6 rounded-lg border-2 border-border hover:border-accent/50 hover:bg-accent/5 transition-all text-left space-y-2 group"
            >
              <Camera className="h-6 w-6 text-muted-foreground group-hover:text-accent transition-colors" />
              <h3 className="font-semibold text-sm">Scan with Camera</h3>
              <p className="text-xs text-muted-foreground">Real-time QR detection</p>
            </button>

            {/* Upload Option */}
            <button
              onClick={() => setMethod('upload')}
              className="p-6 rounded-lg border-2 border-border hover:border-accent/50 hover:bg-accent/5 transition-all text-left space-y-2 group"
            >
              <Upload className="h-6 w-6 text-muted-foreground group-hover:text-accent transition-colors" />
              <h3 className="font-semibold text-sm">Upload Image</h3>
              <p className="text-xs text-muted-foreground">Local file processing</p>
            </button>

            {/* Paste Option */}
            <button
              onClick={() => setMethod('paste')}
              className="p-6 rounded-lg border-2 border-border hover:border-accent/50 hover:bg-accent/5 transition-all text-left space-y-2 group"
            >
              <Smartphone className="h-6 w-6 text-muted-foreground group-hover:text-accent transition-colors" />
              <h3 className="font-semibold text-sm">Paste Data</h3>
              <p className="text-xs text-muted-foreground">Manual entry</p>
            </button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {!qrData ? (
            <>
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Verify QR Code</h1>
                  <p className="text-muted-foreground mt-2">Scan or upload a ShadowID disclosure proof</p>
                </div>
                <Link href="/dashboard">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </Link>
              </div>

              <Card className="p-8 bg-card/30 border-border">
                {renderMethodContent()}
              </Card>

              {error && (
                <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{error}</p>
                </div>
              )}
            </>
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
                      setMethod('select')
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
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Commitment Hash</p>
                        <p className="font-mono text-sm text-accent break-all">{qrData.commitment}</p>
                      </div>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(qrData.commitment)
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground ml-2"
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
        </div>
      </main>

      {/* Camera Permission Dialog */}
      <CameraPermissionDialog
        isOpen={showCameraDialog}
        onAllow={() => {
          setShowCameraDialog(false)
          setMethod('camera')
        }}
        onDeny={() => {
          setShowCameraDialog(false)
        }}
      />
    </div>
  )
}
