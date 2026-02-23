'use client'

import { useState, useEffect } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, AlertCircle, Zap, Download } from 'lucide-react'
import Link from 'next/link'
import { recordQRVerification, incrementVerificationCount } from '@/lib/aleo-sdk-integration'
import { addActivityLog } from '@/lib/activity-logger'

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
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState('')

  const handleVerifyQRCode = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter or scan a QR code')
      return
    }

    if (!isConnected || !address) {
      setError('Please connect your wallet first')
      return
    }

    setIsVerifying(true)
    setError('')
    setVerificationResult(null)

    try {
      // Parse QR code data (commitment hash)
      const commitmentHash = verificationCode.trim().toUpperCase()

      // Validate it looks like a commitment hash (16 hex chars)
      if (!/^[0-9A-F]{16}$/.test(commitmentHash)) {
        throw new Error('Invalid QR code format. Expected 16-character hex commitment hash.')
      }

      // Convert to field format for blockchain
      const proofId = `0x${commitmentHash}field`

      // Record verification on blockchain
      const verifyResult = await recordQRVerification(
        commitmentHash,
        proofId,
        address
      )

      if (!verifyResult.success) {
        throw new Error(verifyResult.error || 'Verification failed')
      }

      // Increment verification count
      await incrementVerificationCount(commitmentHash, address)

      // Record in activity log
      addActivityLog(
        'Verify QR Code',
        'verification',
        `Verified commitment: ${commitmentHash}`,
        'success'
      )

      // Set success result
      const result: VerificationResult = {
        isValid: true,
        commitmentHash,
        verifiedAt: new Date().toISOString(),
        verifierAddress: address,
        message: 'Credential verified successfully on Aleo testnet'
      }

      setVerificationResult(result)
      setVerificationCode('')

      // Auto-clear after 5 seconds
      setTimeout(() => {
        setVerificationResult(null)
      }, 5000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Verification failed'
      setError(errorMsg)
      addActivityLog(
        'Verify QR Code',
        'verification',
        `Verification failed: ${errorMsg}`,
        'error'
      )
    } finally {
      setIsVerifying(false)
    }
  }

  if (!isConnected || !address) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-accent/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Please connect your wallet to verify QR codes</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Verify QR Code</h1>
            <p className="text-muted-foreground">Scan or enter a credential QR code to verify its authenticity on the Aleo blockchain</p>
          </div>

          {/* Verification Form */}
          <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                Commitment Hash
              </label>
              <input
                type="text"
                placeholder="Enter or scan QR code (16 hex characters)"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value)
                  setError('')
                }}
                disabled={isVerifying}
                className="w-full px-4 py-3 rounded-lg border border-accent/20 bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground mt-2">Format: 16 hexadecimal characters (A-F, 0-9)</p>
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

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commitment:</span>
                    <span className="font-mono text-foreground">{verificationResult.commitmentHash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verifier:</span>
                    <span className="font-mono text-foreground">{verificationResult.verifierAddress.slice(0, 8)}...{verificationResult.verifierAddress.slice(-6)}</span>
                  </div>
                </div>
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
                <span>Scan a credential QR code or manually enter the commitment hash</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-semibold">2.</span>
                <span>The verifier checks if the commitment exists on the Aleo blockchain</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-semibold">3.</span>
                <span>Your verification is recorded on-chain as proof of authentication</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-semibold">4.</span>
                <span>Verification history is encrypted and stored locally</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
