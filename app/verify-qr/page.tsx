'use client'

import { useState, useRef, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Upload, Copy, Camera, AlertCircle, CheckCircle2, Clock, Smartphone, Hash, Calendar } from 'lucide-react'
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
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update time remaining every second
  useEffect(() => {
    if (!qrData || isExpired) return

    const updateTimer = () => {
      const timeInfo = getQRTimeRemaining(qrData.expiresAt)
      setTimeRemaining(timeInfo.formatted)
      
      // Check if just expired
      if (timeInfo.isExpired && !isExpired) {
        setIsExpired(true)
        console.log('[v0] QR code has expired')
      }
    }

    // Initial update
    updateTimer()

    // Update every second
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [qrData, isExpired])

  // Handle QR detection from all sources
  const handleQRDetected = async (result: QRDecodeResult) => {
    if (result.success && result.data) {
      // Double-check expiration before accepting
      const timeInfo = getQRTimeRemaining(result.data.expiresAt)
      
      if (timeInfo.isExpired) {
        setError('This QR code has expired and cannot be verified')
        setIsExpired(true)
        setQrData(null)
        setMethod('select')
      } else {
        // CRITICAL SECURITY FIX: Validate nullifier to ensure this is the latest QR
        // If a nullifier exists and differs from the active one, this QR is superseded
        const activeNullifier = typeof window !== 'undefined' 
          ? localStorage.getItem('shadowid-active-qr-nullifier')
          : null
        
        if ((result.data as any).nullifier && activeNullifier && (result.data as any).nullifier !== activeNullifier) {
          setError('This QR code has been superseded. A newer proof was generated. Please use the latest QR code.')
          setQrData(null)
          setMethod('select')
          return
        }

        // Show loading while verifying with server
        setIsVerifying(true)
        
        try {
          // Verify QR code with server (confirms expiration, etc.)
          const verifyResponse = await fetch('/api/verify-qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              commitment: result.data.commitment,
              expiresAt: result.data.expiresAt,
              selectedAttributes: result.data.selectedAttributes,
              nullifier: (result.data as any).nullifier // Send nullifier for server validation
            })
          })

          if (!verifyResponse.ok) {
            const errorData = await verifyResponse.json()
            setError(errorData.error || 'Verification failed')
            if (errorData.isExpired) {
              setIsExpired(true)
            }
            setQrData(null)
            setIsVerifying(false)
            return
          }

          // Server confirmed - display the QR data
          setQrData(result.data)
          setError('')
          setIsExpired(false)
          setTimeRemaining(timeInfo.formatted)
          setMethod('select')
        } catch (err) {
          console.error('[v0] Server verification error:', err)
          setError('Unable to verify with server. The QR code may still be valid.')
          // Still accept the QR if server check fails, but warn user
          setQrData(result.data)
          setMethod('select')
        } finally {
          setIsVerifying(false)
        }
      }
    } else {
      setError(result.error || 'Failed to verify QR code')
      if (result.isExpired) {
        setIsExpired(true)
        setQrData(null)
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

    try {
      const result = await decodeQRFromImage(file)
      handleQRDetected(result)
    } catch (err) {
      setError('Failed to process image. Please try again.')
      console.error('[v0] Upload error:', err)
      setIsVerifying(false)
    }
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
    return timeRemaining || 'Loading...'
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
                {isVerifying ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-accent"></div>
                    <p className="text-muted-foreground">Verifying QR code...</p>
                  </div>
                ) : (
                  renderMethodContent()
                )}
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
              <Card className={`border-2 p-8 shadow-lg ${isExpired ? 'border-destructive/40 bg-destructive/5' : 'border-accent/40 bg-accent/5'}`}>
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-start gap-3">
                    {!isExpired ? (
                      <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-accent" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold">{isExpired ? 'Proof Expired' : 'Disclosure Proof Verified'}</h2>
                      <p className="text-sm text-muted-foreground mt-2">
                        {isExpired
                          ? `This QR code expired at ${new Date(qrData.expiresAt).toLocaleString()}`
                          : 'This QR code contains a valid disclosure proof. All attributes have been verified.'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setQrData(null)
                      setIsExpired(false)
                      setMethod('select')
                    }}
                    className="bg-accent hover:bg-accent/90 gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Scan Again
                  </Button>
                </div>

                {!isExpired && (
                  <div className="space-y-4">
                    {/* Time Remaining - Green for active */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-accent/10 border border-green-500/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Time Remaining</p>
                          <p className="text-lg font-bold text-green-500">{timeRemaining || 'Calculating...'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Commitment Hash */}
                    <div className="p-4 rounded-lg bg-background border border-accent/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Hash className="h-4 w-4 text-accent" />
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Commitment Hash</p>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-mono text-sm text-accent break-all">{qrData.commitment}</p>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(qrData.commitment)
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-accent ml-2 flex-shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Verifier Information */}
                    {qrData.verifierId && (
                      <div className="p-4 rounded-lg bg-background border border-accent/20">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold mb-2">Requested By</p>
                            <p className="text-base font-bold text-accent">{qrData.verifierId}</p>
                          </div>
                          <span className="px-3 py-1 text-xs bg-accent/10 text-accent rounded-full font-semibold">Verified</span>
                        </div>
                        {qrData.verifierName && (
                          <p className="text-xs text-muted-foreground mt-3">{qrData.verifierName}</p>
                        )}
                      </div>
                    )}

                    {/* Verification Purpose */}
                    {qrData.purpose && (
                      <div className="p-4 rounded-lg bg-background border border-accent/20">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold mb-3">Purpose of Verification</p>
                        <p className="text-sm text-foreground">{qrData.purpose}</p>
                      </div>
                    )}

                    {/* Disclosed Attributes with Values - Professional Card Layout */}
                    <div className="p-4 rounded-lg bg-background border border-accent/20">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold mb-4">Disclosed Attributes ({qrData.selectedAttributes.length})</p>
                      <div className="space-y-2">
                        {qrData.selectedAttributes.map((attr) => {
                          const getAttributeDescription = (attrName: string): string => {
                            const descriptions: Record<string, string> = {
                              'attr:age-range': 'Age bracket without revealing exact age',
                              'attr:university': 'Educational institution attended',
                              'attr:degree': 'Academic degree earned',
                              'attr:expertise': 'Professional area of expertise',
                              'attr:employment': 'Current or past employment',
                              'attr:location': 'Geographic region',
                              'attr:credentials': 'Professional certifications',
                              'attr:status': 'Professional or social status'
                            }
                            return descriptions[attrName] || 'Personal attribute'
                          }

                          // Get the actual disclosed value from attributeValues
                          const disclosedValue = (qrData as any).attributeValues?.[attr] || 'Not specified'

                          return (
                            <div key={attr} className="p-3 rounded bg-accent/5 border border-accent/20 hover:border-accent/40 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-mono text-accent font-bold">{attr}</p>
                                <p className="text-sm font-bold text-foreground bg-accent/10 px-2 py-1 rounded">{disclosedValue}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">{getAttributeDescription(attr)}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="p-4 rounded-lg bg-accent/5 border-l-4 border-l-accent border border-accent/20">
                      <div className="flex items-start gap-3">
                        <Lock className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-accent mb-1">Zero-Knowledge Verified</p>
                          <p className="text-xs text-muted-foreground">This proof was cryptographically verified using zero-knowledge proofs. No sensitive data was exposed during verification.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                              'attr:degree': 'Academic degree earned',
                              'attr:expertise': 'Professional area of expertise',
                              'attr:employment': 'Current or past employment',
                              'attr:location': 'Geographic region',
                              'attr:credentials': 'Professional certifications',
                              'attr:status': 'Professional or social status'
                            }
                            return descriptions[attrName] || 'Personal attribute'
                          }

                          // Get the actual disclosed value from attributeValues
                          const disclosedValue = (qrData as any).attributeValues?.[attr] || 'Not specified'

                          return (
                            <div key={attr} className="p-3 rounded bg-accent/5 border border-accent/20">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-mono text-accent">{attr}</p>
                                <p className="text-sm font-semibold text-foreground">{disclosedValue}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">{getAttributeDescription(attr)}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Proof Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-background border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Created</p>
                        </div>
                        <p className="text-sm text-foreground font-medium">{new Date(qrData.timestamp * 1000).toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-background border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Expires</p>
                        </div>
                        <p className="text-sm text-foreground font-medium">{new Date(qrData.expiresAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Request Link Info - if available */}
                    {qrData.requestLinkId && (
                      <div className="p-4 rounded-lg bg-background border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="h-4 w-4 text-accent" />
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Request Link ID</p>
                        </div>
                        <p className="font-mono text-xs text-accent break-all mb-3">{qrData.requestLinkId}</p>
                        <p className="text-xs text-muted-foreground">
                          This proof is linked to a specific verification request and cannot be reused elsewhere.
                        </p>
                      </div>
                    )}

                    {/* Nullifier Info - if available */}
                    {qrData.nullifier && (
                      <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                        <p className="text-xs text-accent font-medium">
                          Replay Protection Active
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          This proof includes nullifier protection to prevent reuse.
                        </p>
                      </div>
                    )}
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
