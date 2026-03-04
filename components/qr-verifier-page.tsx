'use client'

import { useState, useEffect, useRef } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { hexToField } from '@/lib/aleo-field-formatter'
import { Navigation } from '@/components/navigation'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, AlertCircle, Zap, Upload, Camera, QrCode } from 'lucide-react'
import Link from 'next/link'
import { recordQRVerification, incrementVerificationCount, validateCommitmentSignature, commitmentExistsOnBlockchain } from '@/lib/aleo-sdk-integration'
import { addActivityLog } from '@/lib/activity-logger'
import jsQR from 'jsqr'

interface VerificationResult {
  isValid: boolean
  commitmentHash: string
  verifiedAt: string
  verifierAddress: string
  message: string
}

export default function QRVerifierPage() {
  const { address } = useAleoWallet()
  const isConnected = !!address

  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCheckingBlockchain, setIsCheckingBlockchain] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  /**
   * Verify commitment actually exists on blockchain
   */
  const commitmentExistsOnBlockchain = async (commitmentHash: string): Promise<boolean> => {
    try {
      // Convert hex to field format
      const commitmentField = hexToField(commitmentHash)
      
      // Call blockchain verification
      const result = await verifyCommitmentOnChain(commitmentField, address || '')
      
      return result.success
    } catch (err) {
      console.error('[v0] Blockchain verification failed:', err)
      return false
    }
  }

  const handleVerifyQRCode = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter or scan a QR code')
      return
    }

    setIsVerifying(true)
    setIsCheckingBlockchain(true)
    setError('')
    setVerificationResult(null)

    try {
      let qrData: any;
      let commitmentHash: string;
      let attributeHash: string | null = null;
      let signature: string | null = null;
      let transactionId: string | null = null;
      let ownerAddress: string | null = null;
      let timestamp: number | null = null;

      // Try to parse as JSON (new cryptographic format)
      try {
        qrData = JSON.parse(verificationCode);
        commitmentHash = qrData.commitment;
        attributeHash = qrData.attributeHash;
        signature = qrData.signature;
        transactionId = qrData.transactionId;
        ownerAddress = qrData.ownerAddress;
        timestamp = qrData.timestamp ? new Date(qrData.timestamp).getTime() / 1000 : null;
        
        console.log('[v0] Parsed cryptographic QR data:', { commitmentHash, hasSignature: !!signature, hasAttributeHash: !!attributeHash });
      } catch {
        // Fall back to simple hex string format (legacy)
        commitmentHash = verificationCode.trim().toUpperCase();
        console.log('[v0] Parsed legacy hex format:', commitmentHash);
      }

      // Validate commitment hash format
      if (!/^[0-9A-F]{16}$/.test(commitmentHash)) {
        throw new Error('Invalid commitment hash format. Expected 16 hex characters.')
      }

      // Check if commitment exists on blockchain
      setIsCheckingBlockchain(true)
      const existsOnBlockchain = await commitmentExistsOnBlockchain(commitmentHash)
      
      if (!existsOnBlockchain) {
        throw new Error(`Commitment ${commitmentHash} is not registered on the blockchain. This ShadowID does not exist.`)
      }

      setIsCheckingBlockchain(false)

      // Validate cryptographic proofs if present
      if (signature && attributeHash && timestamp) {
        console.log('[v0] Validating cryptographic signature and attribute hash...');
        
        const signatureValid = await validateCommitmentSignature(
          commitmentHash,
          attributeHash,
          signature,
          Math.floor(timestamp),
          ownerAddress || 'unknown'
        )

        if (!signatureValid.isValid) {
          throw new Error(`Signature validation failed: ${signatureValid.reason}`)
        }

        console.log('[v0] Cryptographic validation passed. Signature and attributes verified.');
      }

      // Record verification if connected
      if (isConnected && address) {
        const hexToFieldValue = require('@/lib/aleo-field-formatter').hexToField;
        const proofId = hexToFieldValue(commitmentHash)
        
        try {
          const recordResult = await recordQRVerification(
            commitmentHash,
            proofId,
            address
          )

          if (recordResult.success) {
            await incrementVerificationCount(commitmentHash, address)
            addActivityLog(
              'Verify QR Code',
              'verification',
              `Verified commitment: ${commitmentHash}`,
              'success'
            )
          }
        } catch (blockchainErr) {
          console.log('[v0] Blockchain recording failed, but verification confirmed:', blockchainErr)
        }
      }

      // Set success result with verification info
      const result: VerificationResult = {
        isValid: true,
        commitmentHash,
        verifiedAt: new Date().toISOString(),
        verifierAddress: isConnected && address ? address : 'Guest',
        message: signature ? 'Credential verified with cryptographic proofs on Aleo blockchain' : 'Credential verified on Aleo blockchain'
      }

      setVerificationResult(result)
      setVerificationCode('')

      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        window.location.href = `/verify?commitment=${commitmentHash}`
      }, 2000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Verification failed'
      console.error('[v0] Verification error:', err)
      setError(errorMsg)
      if (isConnected) {
        addActivityLog(
          'Verify QR Code',
          'verification',
          `Verification failed: ${errorMsg}`,
          'error'
        )
      }
    } finally {
      setIsVerifying(false)
      setIsCheckingBlockchain(false)
    }
  }

  /**
   * Parse and decode QR code from image file using jsQR
   */
  const parseQRImage = async (file: File) => {
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = async () => {
            try {
              // Create canvas and draw image
              const canvas = document.createElement('canvas')
              canvas.width = img.width
              canvas.height = img.height
              const ctx = canvas.getContext('2d')
              if (!ctx) throw new Error('Canvas context not available')
              ctx.drawImage(img, 0, 0)
              
              // Extract image data
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
              
              // Decode QR code using jsQR
              const qrCode = jsQR(imageData.data, imageData.width, imageData.height)
              
              if (!qrCode) {
                setError('No QR code found in the image. Please try another image or scan with camera.')
                return
              }
              
              // QR data can be either JSON (new format) or hex string (legacy format)
              const qrRawData = qrCode.data.trim()
              
              // Try to parse as JSON first
              try {
                const jsonData = JSON.parse(qrRawData);
                // Valid JSON QR - set it directly for verification
                setVerificationCode(qrRawData)
                setError('')
                console.log('[v0] QR code decoded (JSON format):', jsonData.commitment);
              } catch {
                // Not JSON, treat as hex string
                const commitmentHash = qrRawData.toUpperCase()
                if (!/^[0-9A-F]{16}$/.test(commitmentHash)) {
                  setError(`Invalid QR code format. Expected either JSON with commitment or 16-char hex, got: ${qrRawData.substring(0, 50)}...`)
                  return
                }
                setVerificationCode(commitmentHash)
                setError('')
                console.log('[v0] QR code decoded (hex format):', commitmentHash)
              }
            } catch (canvasErr) {
              console.error('[v0] Canvas error:', canvasErr)
              setError('Failed to process QR image. Please try another image.')
            }
          }
          img.onerror = () => {
            setError('Failed to load image. Please try another file.')
          }
          img.src = e.target?.result as string
        } catch (err) {
          console.error('[v0] Image loading error:', err)
          setError('Failed to load image file')
        }
      }
      reader.onerror = () => {
        setError('Failed to read file')
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('[v0] File read error:', err)
      setError('Failed to read QR image file')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    parseQRImage(file)
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    parseQRImage(file)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      {/* Full-page loading overlay */}
      {isVerifying && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-8 max-w-md w-full mx-4 shadow-lg">
            <LoadingSpinner size="lg" text="Verifying commitment on blockchain..." />
            <p className="text-xs text-muted-foreground text-center mt-6">
              {isCheckingBlockchain ? 'Checking if commitment exists on-chain...' : 'Recording verification...'}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Verify QR Code</h1>
            <p className="text-muted-foreground">
              {isConnected 
                ? 'Scan or upload a credential QR code to verify it exists on the Aleo blockchain'
                : 'Scan or upload a credential QR code to verify its authenticity (read-only mode)'
              }
            </p>
          </div>

          {/* Mode Badge */}
          <div className={`p-3 rounded-lg flex items-center gap-2 ${isConnected ? 'bg-accent/10 border border-accent/20' : 'bg-muted/30 border border-border'}`}>
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-accent' : 'bg-muted-foreground'}`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'Full Verification Mode (Wallet Connected)' : 'Read-Only Mode (No Wallet)'}
            </span>
          </div>

          {/* Verification Form */}
          <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8 space-y-6">
            {/* Upload Methods */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="p-4 rounded-lg border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors flex flex-col items-center gap-2"
              >
                <Camera className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">Scan Camera</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-lg border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors flex flex-col items-center gap-2"
              >
                <Upload className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">Upload Image</span>
              </button>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or enter manually</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                Commitment Hash
              </label>
              <input
                type="text"
                placeholder="Enter commitment hash (16 hex characters)"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value)
                  setError('')
                }}
                disabled={isVerifying}
                className="w-full px-4 py-3 rounded-lg border border-accent/20 bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground mt-2">Format: 16 hexadecimal characters (A-F, 0-9). Must be registered on blockchain.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                <p className="text-sm text-destructive flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  {error}
                </p>
              </div>
            )}

            {/* Verification Result */}
            {verificationResult && (
              <div className="p-6 rounded-lg bg-accent/10 border border-accent/30 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{verificationResult.message}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Verified at: {new Date(verificationResult.verifiedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm border-t border-accent/20 pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commitment:</span>
                    <span className="font-mono text-foreground">{verificationResult.commitmentHash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-accent font-medium">Blockchain Verified</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground italic">Redirecting to profile page...</p>
              </div>
            )}

            {/* Verify Button */}
            <Button
              onClick={handleVerifyQRCode}
              disabled={isVerifying || !verificationCode.trim()}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold gap-2"
            >
              {isVerifying ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-accent-foreground border-t-transparent animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Verify Credential
                </>
              )}
            </Button>
          </div>

          {/* Info Box */}
          <div className="p-6 rounded-lg border border-accent/20 bg-card/30 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              How Verification Works
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-accent font-semibold">1.</span>
                <span>Scan a credential QR code using camera or upload an image</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-semibold">2.</span>
                <span>The app queries the Aleo blockchain to verify commitment exists</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-semibold">3.</span>
                <span>Invalid commitments are rejected - only blockchain-registered IDs verify</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-semibold">4.</span>
                <span>{isConnected ? 'Your verification is recorded on-chain as proof of authentication' : 'Connect a wallet to record verification on-chain'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
