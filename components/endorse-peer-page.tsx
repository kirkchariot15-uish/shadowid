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

  const handleEndorse = async () => {
    if (!targetCommitment || !selectedAttribute || !address || !executeTransaction) {
      setError('Please fill in all fields and ensure wallet is connected')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      console.log('[v0] Endorsing attribute:', {
        targetCommitment,
        attributeId: selectedAttribute,
        endorser: address
      })

      // Convert commitment string to field format
      const targetField = targetCommitment.startsWith('0x') 
        ? hexToField(targetCommitment) 
        : targetCommitment

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
        const endorsement: EndorsementRequest = {
          targetCommitment,
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
          targetCommitment,
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
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-foreground">
                    Peer's Commitment Hash
                  </label>
                  <Input
                    placeholder="Enter commitment hash (0x...)"
                    value={targetCommitment}
                    onChange={(e) => setTargetCommitment(e.target.value)}
                    className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
                    disabled={!isConnected}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    The blockchain commitment hash of the peer you want to endorse
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
