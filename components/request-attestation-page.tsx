'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, Clock, Shield } from 'lucide-react'
import Link from 'next/link'
import { 
  STANDARD_ATTRIBUTES, 
  getAttributesByCategory, 
  type AttributeCategory 
} from '@/lib/attribute-schema'
import { 
  getRecommendedIssuers, 
  requestAttestation,
  type CredentialIssuer 
} from '@/lib/credential-issuers'

export default function RequestAttestationPage() {
  const [selectedCategory, setSelectedCategory] = useState<AttributeCategory>('personal')
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null)
  const [selectedIssuer, setSelectedIssuer] = useState<string | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestResult, setRequestResult] = useState<any>(null)

  const categories: AttributeCategory[] = ['personal', 'professional', 'government', 'membership', 'financial', 'education']
  const attributes = getAttributesByCategory(selectedCategory)
  
  const selectedAttrSchema = selectedAttribute ? STANDARD_ATTRIBUTES[selectedAttribute] : null
  const recommendedIssuers = selectedAttrSchema 
    ? getRecommendedIssuers(selectedAttribute, selectedAttrSchema.issuerRequired) 
    : []

  const handleRequestAttestation = async () => {
    if (!selectedAttribute || !selectedIssuer) return

    setIsRequesting(true)
    try {
      const result = await requestAttestation(selectedIssuer, selectedAttribute, {})
      setRequestResult(result)
    } catch (err) {
      console.error('[v0] Attestation request error:', err)
      setRequestResult({ success: false, error: 'Request failed' })
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Request Attestation</h1>
              <p className="text-muted-foreground mt-2">Get verified credentials from trusted issuers</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-accent/40 text-accent hover:bg-accent/10 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          {!requestResult ? (
            <div className="space-y-8">
              {/* Step 1: Select Category */}
              <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
                <h2 className="text-lg font-semibold mb-4">Step 1: Choose Attribute Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat)
                        setSelectedAttribute(null)
                        setSelectedIssuer(null)
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedCategory === cat
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <p className="text-sm font-semibold capitalize">{cat}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Attribute */}
              <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
                <h2 className="text-lg font-semibold mb-4">Step 2: Choose Attribute</h2>
                <div className="space-y-3">
                  {attributes.map(attr => (
                    <button
                      key={attr.id}
                      onClick={() => {
                        setSelectedAttribute(attr.id)
                        setSelectedIssuer(null)
                      }}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedAttribute === attr.id
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{attr.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{attr.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {attr.issuerRequired && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                                Requires Issuer
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              attr.privacyLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
                              attr.privacyLevel === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              attr.privacyLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {attr.privacyLevel} privacy
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Select Issuer */}
              {selectedAttribute && (
                <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
                  <h2 className="text-lg font-semibold mb-4">Step 3: Choose Issuer</h2>
                  <div className="space-y-3">
                    {recommendedIssuers.map(issuer => (
                      <button
                        key={issuer.id}
                        onClick={() => setSelectedIssuer(issuer.id)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedIssuer === issuer.id
                            ? 'border-accent bg-accent/10'
                            : 'border-border hover:border-accent/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">{issuer.name}</p>
                              <Shield className="h-4 w-4 text-accent" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{issuer.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-muted-foreground">
                                Trust Score: <span className="text-accent font-semibold">{issuer.trustScore}/100</span>
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                                {issuer.verificationMethod}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Request Button */}
              {selectedIssuer && (
                <Button
                  onClick={handleRequestAttestation}
                  disabled={isRequesting}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6"
                >
                  {isRequesting ? 'Requesting...' : 'Request Attestation'}
                </Button>
              )}
            </div>
          ) : (
            // Result Screen
            <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8 text-center">
              {requestResult.success ? (
                <>
                  <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Attestation Requested</h2>
                  <p className="text-muted-foreground mb-6">
                    Your attestation request has been submitted successfully
                  </p>
                  <div className="bg-muted/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-muted-foreground">Request ID</p>
                    <p className="text-sm font-mono font-semibold mt-1">{requestResult.attestationId}</p>
                    <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-2">
                      <Clock className="h-3 w-3" />
                      Estimated completion: {requestResult.estimatedCompletion}
                    </p>
                  </div>
                  <Button
                    onClick={() => setRequestResult(null)}
                    variant="outline"
                    className="border-accent/40 text-accent hover:bg-accent/10"
                  >
                    Request Another
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-red-400 mb-4">Request failed: {requestResult.error}</p>
                  <Button
                    onClick={() => setRequestResult(null)}
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
