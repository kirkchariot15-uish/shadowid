'use client'

import { useState, useEffect } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Send, CheckCircle, AlertCircle, Users, Award } from 'lucide-react'
import Link from 'next/link'
import { STANDARD_ATTRIBUTES } from '@/lib/attribute-schema'
import { hexToField } from '@/lib/aleo-field-formatter'
import { executeTransactionWithWallet, CONTRACTS } from '@/lib/aleo-sdk-integration'
import { addActivityLog } from '@/lib/activity-logger'
import { validateEndorsementAttempt, checkRateLimit, trackEndorsement } from '@/lib/anti-sybil'
import { getCommitmentHash, verifyCommitmentHashFormat } from '@/lib/commitment-hash-generator'

interface EndorsementRequest {
  targetCommitment: string
  targetAddress: string
  attributeId: string
  attributeName: string
  status: 'pending' | 'success' | 'error'
  message?: string
}

export function EndorsePeerPage() {
  const { address, executeTransaction } = useAleoWallet()
  const isConnected = !!address

  const [step, setStep] = useState<'input' | 'confirm' | 'result'>('input')
  const [targetCommitment, setTargetCommitment] = useState('')
  const [selectedAttribute, setSelectedAttribute] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [endorsementResult, setEndorsementResult] = useState<EndorsementRequest | null>(null)
  const [error, setError] = useState('')

  const attributes = Object.entries(STANDARD_ATTRIBUTES).map(([id, attr]) => ({
    id,
    name: attr.name,
    description: attr.description
  }))

  // Helper function to load user's own commitment hash for testing
  const loadMyCommitmentHash = () => {
    if (address) {
      const myHash = localStorage.getItem('shadowid-commitment');
      if (myHash) {
        console.log('[v0] Loaded my commitment hash:', myHash);
        setTargetCommitment(myHash);
        setError('');
      } else {
        setError('No commitment hash found in your profile');
      }
    }
  }

  const handleEndorse = async () => {
    if (!targetCommitment?.trim() || !selectedAttribute || !address || !executeTransaction) {
      setError('Please fill in all fields and ensure wallet is connected')
      return
    }

    // Sanitize commitment hash
    const sanitizedCommitment = targetCommitment.trim();
    
    console.log('[v0] Input commitment hash:', sanitizedCommitment);
    console.log('[v0] Input length:', sanitizedCommitment.length);
    
    // Accept both formats:
    // 1. New format with checksum: "XXXX-XXXXXXXX..." (4-char checksum + 16+ char hash)
    // 2. Legacy hex format: "0x..." or pure hex
    const isNewFormat = verifyCommitmentHashFormat(sanitizedCommitment);
    const hexFormatPattern = /^(0x)?[0-9a-f]{32,}$/i;
    const isHexFormat = hexFormatPattern.test(sanitizedCommitment);
    
    console.log('[v0] Format validation:', { 
      isNewFormat, 
      isHexFormat,
      formatChecksum: sanitizedCommitment.split('-')[0],
      formatHash: sanitizedCommitment.split('-')[1]
    });
    
    if (!isNewFormat && !isHexFormat) {
      console.error('[v0] Invalid format - neither new format nor hex');
      console.error('[v0] Format details:');
      console.error('  - Input:', sanitizedCommitment);
      console.error('  - Length:', sanitizedCommitment.length);
      console.error('  - Has dash:', sanitizedCommitment.includes('-'));
      if (sanitizedCommitment.includes('-')) {
        const [checksum, hash] = sanitizedCommitment.split('-');
        console.error('  - Checksum length:', checksum.length);
        console.error('  - Hash length:', hash?.length);
      }
      setError('Invalid commitment hash format. Expected: AB12-CAFEA1B2C3D4E5F6 (checksum-hash) or 0xHEX')
      return
    }

    // Extract the actual hash part (remove checksum prefix if present)
    let hashForBlockchain = sanitizedCommitment;
    if (isNewFormat && sanitizedCommitment.includes('-')) {
      // Extract hash part after the checksum (format: "XXXX-HASH")
      const parts = sanitizedCommitment.split('-');
      if (parts.length === 2) {
        hashForBlockchain = parts[1]; // Use just the hash part
        console.log('[v0] Extracted hash from checksum format:', hashForBlockchain);
      }
    }

    // Get user's own commitment
    const userCommitment = localStorage.getItem('shadowid-commitment')
    // For comparison, extract hash if it's in new format
    let userHashForComparison = userCommitment;
    if (userCommitment && userCommitment.includes('-')) {
      const parts = userCommitment.split('-');
      userHashForComparison = parts[1] || userCommitment;
    }

    // Validate against self-endorsement and sybil attacks
    const validationError = validateEndorsementAttempt(
      address,
      hashForBlockchain,
      userHashForComparison
    )

    if (validationError) {
      setError(validationError)
      return
    }

    // Check rate limiting
    if (!checkRateLimit(hashForBlockchain)) {
      setError('Too many endorsements for this commitment today. Try again tomorrow.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      console.log('[v0] Endorsing attribute:', {
        targetCommitment: hashForBlockchain,
        originalInput: sanitizedCommitment,
        attributeId: selectedAttribute,
        endorser: address
      })

      // Convert commitment string to field format
      const targetField = hashForBlockchain.startsWith('0x') 
        ? hexToField(hashForBlockchain) 
        : hashForBlockchain

      // Parse attribute ID to u32
      const attrIdMatch = selectedAttribute.match(/\d+/)
      const attributeIdU32 = attrIdMatch ? parseInt(attrIdMatch[0]) : 0

      // Call endorse_attribute on shadowid_v5.aleo
      const result = await executeTransactionWithWallet(
        {
          programId: CONTRACTS.SHADOWID.name,
          functionName: 'endorse_attribute',
          inputs: [
            targetField,           // target_commitment
            `${attributeIdU32}u32`, // attribute_id
            address               // endorser_address
          ],
          fee: 100000
        },
        executeTransaction
      )

      if (result.success) {
        // Track endorsement for collusion detection
        trackEndorsement(userCommitment || '', sanitizedCommitment)

        const endorsement: EndorsementRequest = {
          targetCommitment: sanitizedCommitment,
          targetAddress: address,
          attributeId: selectedAttribute,
          attributeName: STANDARD_ATTRIBUTES[selectedAttribute as keyof typeof STANDARD_ATTRIBUTES]?.name || selectedAttribute,
          status: 'success',
          message: `Successfully endorsed! Transaction: ${result.transactionId}`
        }

        setEndorsementResult(endorsement)
        addActivityLog('Endorse Peer', 'attestation', `Endorsed ${endorsement.attributeName}`, 'success')
        
        // Reset form after success
        setTimeout(() => {
          setTargetCommitment('')
          setSelectedAttribute('')
          setStep('input')
        }, 3000)
      } else {
        const endorsement: EndorsementRequest = {
          targetCommitment: sanitizedCommitment,
          targetAddress: address,
          attributeId: selectedAttribute,
          attributeName: STANDARD_ATTRIBUTES[selectedAttribute as keyof typeof STANDARD_ATTRIBUTES]?.name || selectedAttribute,
          status: 'error',
          message: result.error || 'Failed to submit endorsement'
        }
        setEndorsementResult(endorsement)
        addActivityLog('Endorse Peer', 'attestation', `Failed to endorse: ${result.error}`, 'error')
      }

      setStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('[v0] Endorsement error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Award className="w-8 h-8 text-accent" />
              Endorse a Peer
            </h1>
            <p className="text-muted-foreground">Help strengthen your peer's credibility by endorsing their attributes</p>
          </div>

          {/* Connection Check */}
          {!isConnected && (
            <Card className="bg-red-500/10 border-red-500/20 p-6 mb-8">
              <div className="flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-500">Wallet Not Connected</p>
                  <p className="text-sm text-red-500/70">Please connect your wallet to endorse peers</p>
                </div>
              </div>
            </Card>
          )}

          {/* Input Step */}
          {step === 'input' && (
            <Card className="bg-card/50 border-accent/20 p-8">
              {/* Display user's own commitment hash for reference */}
              {isConnected && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <p className="text-xs font-semibold text-blue-600 mb-2">Your Commitment Hash</p>
                  {(() => {
                    const myHash = localStorage.getItem('shadowid-commitment');
                    return (
                      <div className="space-y-2">
                        <p className="font-mono text-sm text-foreground break-all bg-background/50 p-2 rounded">
                          {myHash || 'No hash stored. Create an identity first.'}
                        </p>
                        {myHash && (
                          <p className="text-xs text-muted-foreground">
                            Format: {verifyCommitmentHashFormat(myHash) ? '✓ Valid' : '✗ Invalid'} | Length: {myHash.length}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-foreground">
                    Peer's Commitment Hash
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter commitment hash (e.g., AB12-CAFE1234... or 0xABC...)"
                      value={targetCommitment}
                      onChange={(e) => setTargetCommitment(e.target.value)}
                      className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground font-mono text-sm flex-1"
                      disabled={!isConnected}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadMyCommitmentHash}
                      disabled={!isConnected}
                      className="whitespace-nowrap"
                    >
                      Use My Hash
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Format: Checksum-Hash (e.g., AB12-CAFE...) from ShadowID profile or hex format (0x...)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-foreground">
                    Select Attribute to Endorse
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {attributes.map((attr) => (
                      <button
                        key={attr.id}
                        onClick={() => setSelectedAttribute(attr.id)}
                        disabled={!isConnected}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          selectedAttribute === attr.id
                            ? 'border-accent bg-accent/10'
                            : 'border-border/50 hover:border-border'
                        } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="font-semibold text-foreground">{attr.name}</div>
                        <div className="text-xs text-muted-foreground">{attr.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <Card className="bg-red-500/10 border-red-500/20 p-4">
                    <p className="text-sm text-red-500">{error}</p>
                  </Card>
                )}

                <Button
                  onClick={handleEndorse}
                  disabled={!isConnected || !targetCommitment || !selectedAttribute || isSubmitting}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 rounded-lg transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Endorsement
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Result Step */}
          {step === 'result' && endorsementResult && (
            <Card className={`p-8 border-2 ${endorsementResult.status === 'success' ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
              <div className="text-center space-y-4">
                {endorsementResult.status === 'success' ? (
                  <>
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">Endorsement Submitted!</h2>
                      <p className="text-muted-foreground">
                        You successfully endorsed <span className="font-semibold text-foreground">{endorsementResult.attributeName}</span>
                      </p>
                      {endorsementResult.message && (
                        <p className="text-xs text-green-500/70 mt-2 break-all">{endorsementResult.message}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">Endorsement Failed</h2>
                      <p className="text-muted-foreground">{endorsementResult.message}</p>
                    </div>
                  </>
                )}

                <div className="flex gap-3 justify-center pt-4">
                  <Button
                    onClick={() => setStep('input')}
                    variant="outline"
                    className="px-6"
                  >
                    Endorse Another
                  </Button>
                  <Link href="/dashboard">
                    <Button className="bg-accent hover:bg-accent/90 text-accent-foreground px-6">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
