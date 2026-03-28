'use client'

import { useState, useEffect } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { useRouter, useParams } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, CheckCircle, AlertCircle, Lock, Zap } from 'lucide-react'
import Link from 'next/link'
import QRCode from 'qrcode'
import {
  proofRequestManager,
  ReceivedProofRequest,
  isRequestRelevant,
  ProofResponse
} from '@/lib/proof-request-manager'
import { STANDARD_ATTRIBUTES, AttributeSchema } from '@/lib/attribute-schema'
import { addActivityLog } from '@/lib/activity-logger'

// Rate limiting for proof generation
const PROOF_RATE_LIMIT = {
  maxPerHour: 10,
  maxPerDay: 50,
  storageKey: 'proof-generation-timestamps'
}

function checkProofRateLimit(): { allowed: boolean; reason?: string } {
  if (typeof window === 'undefined') return { allowed: true }
  
  try {
    const stored = localStorage.getItem(PROOF_RATE_LIMIT.storageKey)
    const timestamps: number[] = stored ? JSON.parse(stored) : []
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000
    const oneDayAgo = now - 24 * 60 * 60 * 1000
    
    // Remove old timestamps
    const recentTimestamps = timestamps.filter(t => t > oneDayAgo)
    
    // Check hourly limit
    const recentHour = recentTimestamps.filter(t => t > oneHourAgo)
    if (recentHour.length >= PROOF_RATE_LIMIT.maxPerHour) {
      const nextAllowedTime = new Date(recentHour[0] + 60 * 60 * 1000)
      return { 
        allowed: false, 
        reason: `Too many proofs generated. Try again after ${nextAllowedTime.toLocaleTimeString()}` 
      }
    }
    
    // Check daily limit
    if (recentTimestamps.length >= PROOF_RATE_LIMIT.maxPerDay) {
      return { 
        allowed: false, 
        reason: 'Daily proof generation limit reached. Try again tomorrow.' 
      }
    }
    
    // Add current timestamp
    recentTimestamps.push(now)
    localStorage.setItem(PROOF_RATE_LIMIT.storageKey, JSON.stringify(recentTimestamps))
    
    return { allowed: true }
  } catch (error) {
    console.error('[v0] Rate limit check failed:', error)
    return { allowed: true } // Allow on error
  }
}

export function ProofResponsePage() {
  const router = useRouter()
  const params = useParams()
  const requestId = params?.id as string
  const { address, isConnected } = useAleoWallet()

  const [request, setRequest] = useState<ReceivedProofRequest | null>(null)
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [proofGenerated, setProofGenerated] = useState(false)
  const [qrUrl, setQrUrl] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Load stored commitment
  const storedCommitment = typeof window !== 'undefined'
    ? localStorage.getItem('shadowid-commitment')
    : null

  // Load proof request
  useEffect(() => {
    if (!isConnected || !requestId) {
      setLoading(false)
      return
    }

    try {
      const req = proofRequestManager.getRequest(requestId)
      if (!req) {
        setError('Proof request not found')
        setLoading(false)
        return
      }

      // Check if request is relevant to this user
      if (!isRequestRelevant(req, storedCommitment || '')) {
        setError('This request is not intended for you')
        setLoading(false)
        return
      }

      setRequest(req)
      // Pre-select required attributes
      const requiredAttrIds = req.requiredAttributes
        .filter(a => a.required)
        .map(a => a.attributeId)
      setSelectedAttributes(requiredAttrIds)
    } catch (err) {
      console.error('[v0] Error loading request:', err)
      setError('Failed to load proof request')
    } finally {
      setLoading(false)
    }
  }, [isConnected, requestId, storedCommitment])

  const toggleAttribute = (attrId: string) => {
    const attr = request?.requiredAttributes.find(a => a.attributeId === attrId)
    
    // Don't allow deselecting required attributes
    if (attr?.required) return

    setSelectedAttributes(prev =>
      prev.includes(attrId)
        ? prev.filter(a => a !== attrId)
        : [...prev, attrId]
    )
  }

  const generateProofResponse = async () => {
    if (!selectedAttributes.length) {
      setError('Please select at least one attribute')
      return
    }

    if (!storedCommitment) {
      setError('No identity found. Please create a ShadowID first.')
      return
    }

    if (!request) {
      setError('Proof request not found')
      return
    }

    // SECURITY: Check rate limit
    const rateCheck = checkProofRateLimit()
    if (!rateCheck.allowed) {
      setError(rateCheck.reason || 'Too many proofs generated. Please try again later.')
      addActivityLog('Generate Proof', 'security', 'Rate limit exceeded', 'warning')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() // 24 hours

      // Create the proof data specific to this request
      const proofData = {
        commitment: storedCommitment,
        selectedAttributes,
        timestamp: Math.floor(now.getTime() / 1000),
        expiresAt
      }

      // Create request link ID (unique per request, per user)
      const requestLinkId = proofRequestManager.createRequestLinkId(
        request.id,
        storedCommitment
      )

      // Create nullifier (prevents replay)
      const nullifier = proofRequestManager.createNullifier(proofData, requestLinkId)

      console.log('[v0] Generating proof response for request:', {
        requestId: request.id.substring(0, 12),
        requester: request.requesterName,
        attributes: selectedAttributes.length
      })

      // Create QR code with request link
      const qrData = JSON.stringify({
        type: 'shadowid-proof-response-v1',
        requestId: request.id,
        commitment: proofData.commitment,
        selectedAttributes: proofData.selectedAttributes,
        timestamp: proofData.timestamp,
        expiresAt: proofData.expiresAt,
        userAddress: address,
        requestLinkId,
        nullifier,
        verifyUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/verify?requestId=${request.id}&requestLinkId=${requestLinkId}`
      })

      const qr = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2
      })

      // Record the response
      const response: ProofResponse = {
        id: `resp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        requestId: request.id,
        userCommitment: storedCommitment,
        userAddress: address || '',
        proofData,
        requestLinkId,
        nullifier,
        submittedAt: now.toISOString(),
        verified: false
      }

      // Add response to request
      proofRequestManager.addResponse(request.id, response)

      setQrUrl(qr)
      setProofGenerated(true)

      // Log activity
      addActivityLog(
        'Generate Proof Response',
        'identity',
        `Generated proof response for request from ${request.requesterName}`,
        'success',
        { requestId: request.id, attributeCount: selectedAttributes.length }
      )

      console.log('[v0] Proof response generated successfully')
    } catch (err) {
      console.error('[v0] Proof generation error:', err)
      setError(`Failed to generate proof: ${err instanceof Error ? err.message : 'Unknown error'}`)
      addActivityLog(
        'Generate Proof Response',
        'identity',
        `Failed to generate proof response: ${String(err)}`,
        'error'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadProof = () => {
    const element = document.createElement('a')
    element.href = qrUrl
    element.download = `shadowid-proof-response-${request?.id.slice(0, 8)}-${Date.now()}.png`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    addActivityLog(
      'Download Proof Response',
      'identity',
      'Downloaded proof response QR code',
      'success'
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-muted-foreground">Please connect your wallet to respond to proof requests.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-muted-foreground">Loading proof request...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <Card className="border-border/40 bg-destructive/10 p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <h2 className="font-semibold text-destructive">Error</h2>
              </div>
              <p className="text-muted-foreground">{error}</p>
              <Link href="/proof-requests" className="mt-4 inline-block">
                <Button variant="outline">Back to Requests</Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Respond to Proof Request</h1>
              <p className="text-muted-foreground mt-2">Create a targeted proof for this verification</p>
            </div>
            <Link href="/proof-requests">
              <Button variant="outline" className="border-accent/40 text-accent hover:bg-accent/10 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          {proofGenerated ? (
            // Success Screen - QR Code
            <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-8">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 p-4 bg-success/10 rounded-full">
                  <CheckCircle className="h-12 w-12 text-success" />
                </div>

                <h2 className="text-2xl font-bold mb-2">Proof Generated Successfully</h2>
                <p className="text-muted-foreground mb-8">
                  Share this QR code with {request.requesterName} to verify your attributes
                </p>

                {/* QR Code Section */}
                <div className="border border-accent/30 rounded-lg p-8 bg-card shadow-lg mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold">Share Proof</h2>
                  </div>

                  <p className="text-muted-foreground mb-6">
                    Share this QR code with {request.requesterName} to verify your attributes
                  </p>

                  <div className="bg-gradient-to-br from-accent/5 to-background p-8 rounded-xl mb-8 flex flex-col items-center justify-center border-2 border-dashed border-accent/30 shadow-md">
                    <div className="bg-background p-6 rounded-lg shadow-lg">
                      <img src={qrUrl} alt="Proof Response QR Code" className="w-80 h-80" />
                    </div>
                  </div>

                  {/* Proof Details */}
                  <div className="w-full space-y-4">
                    <div className="p-4 bg-background rounded-lg border border-accent/20">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Requested By</p>
                      <p className="text-base font-semibold text-accent">{request.requesterName}</p>
                    </div>

                    <div className="p-4 bg-background rounded-lg border border-accent/20">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Attributes Provided</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedAttributes.map(attrId => {
                          const attr = STANDARD_ATTRIBUTES[attrId]
                          return (
                            <span
                              key={attrId}
                              className="text-xs px-3 py-1.5 bg-accent/10 text-accent rounded-full font-medium"
                            >
                              {attr?.name || attrId}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    <div className="p-4 bg-background rounded-lg border border-accent/20">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Your Identity Hash</p>
                      <p className="font-mono text-xs text-muted-foreground break-all">
                        {localStorage.getItem('shadowid-commitment')?.substring(0, 40)}...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Privacy Notice */}
                <Card className="border-accent/30 bg-card p-4 border-l-4 border-l-accent shadow-md">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-accent mb-1">Privacy Notice</p>
                      <p className="text-xs text-muted-foreground">
                        Your actual attribute values are stored locally. The QR code contains only your commitment hash and proof metadata. The verifier cannot see your actual values.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Actions */}
                <div className="w-full flex gap-4">
                  <Button
                    onClick={downloadProof}
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Download QR Code
                  </Button>
                  <Link href="/proof-requests" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Done
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            // Form Screen - Attribute Selection
            <>
              {/* Request Summary */}
              <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-6 mb-8">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Requested By</p>
                    <h3 className="text-lg font-semibold">{request.requesterName}</h3>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Purpose</p>
                    <p className="text-lg font-semibold">{request.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Expires</p>
                    <p className="text-lg font-semibold">
                      {new Date(request.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-foreground">{request.description}</p>
                </div>
              </Card>

              {/* Attribute Selection */}
              <Card className="border-border/40 bg-background/50 backdrop-blur-sm p-6 mb-8">
                <h2 className="text-xl font-bold mb-6">Select Attributes to Prove</h2>

                <div className="space-y-4">
                  {request.requiredAttributes.map(requirement => {
                    const schema = STANDARD_ATTRIBUTES[requirement.attributeId]
                    const isSelected = selectedAttributes.includes(requirement.attributeId)
                    const isRequired = requirement.required

                    return (
                      <div
                        key={requirement.attributeId}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-accent bg-accent/5'
                            : 'border-border/40 hover:border-accent/50'
                        } ${isRequired ? '' : ''}`}
                        onClick={() => toggleAttribute(requirement.attributeId)}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            disabled={isRequired}
                            className="mt-1 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{requirement.attributeName}</h3>
                              {isRequired && (
                                <span className="px-2 py-0.5 rounded text-xs bg-accent/10 text-accent">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{requirement.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Proof Type: <span className="font-mono">{requirement.proofType}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {error && (
                  <Card className="border-border/40 bg-destructive/10 p-4 mt-6">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-sm">{error}</p>
                    </div>
                  </Card>
                )}
              </Card>

              {/* Generate Button */}
              <div className="flex gap-4">
                <Button
                  onClick={generateProofResponse}
                  disabled={isGenerating}
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin">⚙️</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Generate Proof Response
                    </>
                  )}
                </Button>
                <Link href="/proof-requests" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
