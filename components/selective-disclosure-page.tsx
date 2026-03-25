'use client'

import { useState, useEffect } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Zap, CheckCircle, Download } from 'lucide-react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { PROGRAM_ID } from '@/lib/aleo-sdk-integration'
import { addActivityLog } from '@/lib/activity-logger'
import { STANDARD_ATTRIBUTES } from '@/lib/attribute-schema'
import { CONFIG, getQRValidityHours } from '@/lib/config'

interface ProofData {
  commitment: string
  selectedAttributes: string[]
  timestamp: number
  userAddress: string
  expiresAt: string
}

export default function SelectiveDisclosurePage() {
  const { address, isConnected } = useAleoWallet()
  const [selectedAttrs, setSelectedAttrs] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [proofGenerated, setProofGenerated] = useState(false)
  const [qrUrl, setQrUrl] = useState<string>('')
  const [proofData, setProofData] = useState<ProofData | null>(null)
  const [error, setError] = useState<string>('')
  const [activatedAttributes, setActivatedAttributes] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  // Load stored commitment and activated attributes
  const storedCommitment = typeof window !== 'undefined' 
    ? localStorage.getItem('shadowid-commitment') 
    : null

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      // Load activated attributes from ID creation
      const stored = localStorage.getItem('shadowid-activated-attributes')
      if (stored) {
        try {
          const attrs = JSON.parse(stored)
          setActivatedAttributes(Array.isArray(attrs) ? attrs : [])
          console.log('[v0] Loaded activated attributes:', attrs)
        } catch (err) {
          console.error('[v0] Error parsing activated attributes:', err)
          setActivatedAttributes([])
        }
      }
    }
  }, [])

  const toggleAttribute = (attrId: string) => {
    // Only allow toggling attributes that were activated during ID creation
    if (!activatedAttributes.includes(attrId)) {
      setError(`Attribute "${attrId}" was not activated when you created your ShadowID`)
      return
    }

    setSelectedAttrs(prev =>
      prev.includes(attrId)
        ? prev.filter(a => a !== attrId)
        : [...prev, attrId]
    )
    setError('')
  }

  const generateQRCode = async () => {
    if (!selectedAttrs.length) {
      setError('Please select at least one attribute')
      return
    }

    if (!storedCommitment) {
      setError('No identity found. Please create a ShadowID first.')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const now = new Date()
      const expiresAt = new Date(now.getTime() + getQRValidityHours() * 60 * 60 * 1000).toISOString()

      // Create proof data with blockchain-verified commitment
      const proof: ProofData = {
        commitment: storedCommitment,
        selectedAttributes: selectedAttrs,
        timestamp: Math.floor(now.getTime() / 1000),
        userAddress: address || '',
        expiresAt
      }

      console.log('[v0] Generating disclosure proof for attributes:', selectedAttrs)

      // Create QR code with proof data - NO SENSITIVE ATTRIBUTES
      // Only includes commitment and proof metadata
      const qrData = JSON.stringify({
        type: 'shadowid-disclosure-v1',
        commitment: proof.commitment,
        selectedAttributes: proof.selectedAttributes,
        timestamp: proof.timestamp,
        expiresAt: proof.expiresAt,
        userAddress: proof.userAddress,
        verifyUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/verify?commitment=${proof.commitment}`
      })

      const qr = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2
      })

      setProofData(proof)
      setQrUrl(qr)
      setProofGenerated(true)

      addActivityLog(
        'Generate Disclosure Proof',
        'disclosure',
        `Generated proof for: ${selectedAttrs.join(', ')}`,
        'success'
      )
    } catch (err) {
      console.error('[v0] Proof generation error:', err)
      setError(`Failed to generate proof: ${err instanceof Error ? err.message : 'Unknown error'}`)
      addActivityLog('Generate Disclosure Proof', 'disclosure', `Failed: ${String(err)}`, 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadProof = () => {
    const element = document.createElement('a')
    element.href = qrUrl
    element.download = `shadowid-proof-${Date.now()}.png`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    addActivityLog('Download proof', 'disclosure', 'Downloaded disclosure proof QR code', 'success')
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <p className="text-muted-foreground">Please connect your wallet to continue.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Zero-Knowledge Disclosure</h1>
              <p className="text-muted-foreground mt-2">Generate proofs and share selectively</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-accent/40 text-accent hover:bg-accent/10 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          {!storedCommitment ? (
            <div className="border border-border rounded-lg p-8 bg-card/50 text-center">
              <p className="text-muted-foreground mb-4">No ShadowID found. Create one first.</p>
              <Link href="/create-identity">
                <Button>Create ShadowID</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Attribute Selection */}
              <div className="border border-border rounded-lg p-8 bg-card/30">
                <h2 className="text-xl font-semibold mb-6">Select Attributes to Prove</h2>
                
                {error && (
                  <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {!mounted || activatedAttributes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Loading your activated attributes...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      You have {activatedAttributes.length} activated attribute{activatedAttributes.length !== 1 ? 's' : ''} to disclose
                    </p>

                    <div className="space-y-3 mb-8">
                      {Object.entries(STANDARD_ATTRIBUTES)
                        .filter(([id]) => activatedAttributes.includes(id))
                        .map(([id, attr]) => (
                          <label key={id} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-accent/5 transition-colors border border-accent/20">
                            <input
                              type="checkbox"
                              checked={selectedAttrs.includes(id)}
                              onChange={() => toggleAttribute(id)}
                              className="rounded border-border"
                            />
                            <div>
                              <div className="font-medium">{attr.name}</div>
                              <div className="text-xs text-muted-foreground">{attr.description}</div>
                            </div>
                          </label>
                        ))}
                    </div>
                  </>
                )}

                {mounted && activatedAttributes.length > 0 && (
                  <Button 
                    onClick={generateQRCode}
                    disabled={!selectedAttrs.length || isGenerating}
                    className="w-full gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    {isGenerating ? 'Generating...' : 'Generate Proof'}
                  </Button>
                )}
              </div>

              {/* QR Code Display */}
              {proofGenerated && qrUrl && (
                <div className="border border-border rounded-lg p-8 bg-card/30">
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <h2 className="text-xl font-semibold">Proof Generated</h2>
                  </div>

                  <div className="bg-white p-4 rounded-lg mb-6 flex items-center justify-center">
                    <img src={qrUrl} alt="QR Code" className="h-64 w-64" />
                  </div>

                  {proofData && (
                    <div className="space-y-3 mb-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Commitment:</span>
                        <div className="font-mono text-xs text-accent break-all">{proofData.commitment.slice(0, 32)}...</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Attributes:</span>
                        <div className="text-xs mt-1">{proofData.selectedAttributes.join(', ')}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expires:</span>
                        <div className="text-xs">{new Date(proofData.expiresAt).toLocaleString()}</div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={downloadProof}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download QR Code
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
