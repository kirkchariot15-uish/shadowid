'use client'

import { useState, useEffect } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Zap, CheckCircle, Download } from 'lucide-react'
import Link from 'next/link'
import QRCode from 'qrcode'
import { generateProof, ProofRequest } from '@/lib/proof-generator'
import { PROGRAM_ID } from '@/lib/aleo-sdk-integration'
import { addActivityLog } from '@/lib/activity-logger'
import { getDecryptedCredential } from '@/lib/encrypted-storage'

export default function SelectiveDisclosurePage() {
  const { address } = useAleoWallet()
  const isConnected = !!address
  const [attributes, setAttributes] = useState<string[]>([])
  const [selectedAttrs, setSelectedAttrs] = useState<string[]>([])
  const [proofGenerated, setProofGenerated] = useState(false)
  const [proofData, setProofData] = useState<string>('')
  const [qrUrl, setQrUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // Check if shadowid-commitment exists (ID was created)
    const commitment = localStorage.getItem('shadowid-commitment')
    if (!commitment) {
      // ID not created yet
      setAttributes([])
      return
    }

    // Get attributes from the credential
    const credentialStr = localStorage.getItem('shadowid-credential')
    if (credentialStr) {
      const credential = JSON.parse(credentialStr)
      const attributeIds = Object.keys(credential.credentialSubject.claims || {})
      setAttributes(attributeIds)
    }
  }, [])

  const generateZKProof = async () => {
    if (selectedAttrs.length === 0) {
      alert('Select at least one attribute to disclose')
      return
    }

    setIsGenerating(true)
    try {
      console.log('[v0] Generating ZK proof for attributes:', selectedAttrs)
      console.log('[v0] Using shadowid_v2.aleo contract')

      // Get encrypted credential
      const commitmentId = localStorage.getItem('shadowid-commitment') || 'unknown'
      const credential = await getDecryptedCredential(commitmentId, address || '')

      const proofRequest: ProofRequest = {
        credentialId: credential.id,
        claim: {
          attributeId: selectedAttrs.join(','),
          statement: { type: 'existence' }
        },
        proofType: 'existence'
      }

      // Generate and submit proof on-chain via shadowid_v3 prove_existence function
      const proof = await generateProof(
        credential,
        proofRequest,
        address || '',
        PROGRAM_ID
      )

      console.log('[v0] ZK proof generated and submitted:', proof.proofId)

      // Create QR code with proof data
      const qrData = JSON.stringify({
        type: 'shadowid-proof',
        proofId: proof.proofId,
        attributes: selectedAttrs,
        expiresAt: proof.expiresAt,
        nullifier: proof.nullifier
      })

      const qr = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2
      })

      setProofData(JSON.stringify(proof))
      setQrUrl(qr)
      setProofGenerated(true)

      addActivityLog(
        'Generate ZK proof',
        'disclosure',
        `Generated proof for: ${selectedAttrs.join(', ')}`,
        'success'
      )
    } catch (err) {
      console.error('[v0] Proof generation error:', err)
      alert('Failed to generate proof')
      addActivityLog('Generate ZK Proof', 'disclosure', `Failed: ${String(err)}`, 'error')
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
    addActivityLog('Download proof', 'disclosure', 'Downloaded ZK proof QR code', 'success')
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-4 rounded-lg border border-accent/30 bg-accent/5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Generate zero-knowledge proofs that prove your claims without revealing underlying data. Select attributes to include in your proof.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Select Attributes to Disclose</h2>
                <div className="space-y-2">
                  {attributes.length > 0 ? (
                    attributes.map(attr => (
                      <label key={attr} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-accent/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAttrs.includes(attr)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAttrs([...selectedAttrs, attr])
                            } else {
                              setSelectedAttrs(selectedAttrs.filter(a => a !== attr))
                            }
                          }}
                        />
                        <span className="flex-1 font-medium text-sm">{attr}</span>
                        {selectedAttrs.includes(attr) && <CheckCircle className="h-4 w-4 text-accent" />}
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No attributes found. Create a ShadowID first.</p>
                  )}
                </div>
              </div>

              <Button
                onClick={generateZKProof}
                disabled={isGenerating || selectedAttrs.length === 0 || attributes.length === 0}
                className="w-full bg-accent hover:bg-accent/90 gap-2"
              >
                <Zap className="h-4 w-4" />
                {isGenerating ? 'Generating Proof...' : 'Generate ZK Proof'}
              </Button>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-accent/20 bg-card/50 backdrop-blur p-6 sticky top-24">
                <h3 className="font-semibold mb-4">Proof QR Code</h3>
                {proofGenerated && qrUrl ? (
                  <>
                    <img src={qrUrl} alt="ZK Proof QR" className="w-full rounded-lg mb-4 border border-border" />
                    <p className="text-xs text-muted-foreground mb-4">
                      This QR code contains a cryptographic proof of your selected attributes, valid for 1 hour.
                    </p>
                    <Button
                      onClick={downloadProof}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Proof
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Select attributes and generate a proof</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
