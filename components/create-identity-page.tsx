'use client'

import { useState, useEffect } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { debugWalletState } from '@/lib/blockchain-transaction-handler'
import { Navigation } from '@/components/navigation'
import { ProgressIndicator } from '@/components/progress-indicator'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ShadowIDLoading } from '@/components/shadowid-loading'
import { Button } from '@/components/ui/button'
import { Lock, Sparkles, CheckCircle2, ArrowLeft, Plus, AlertCircle, Copy } from 'lucide-react'
import Link from 'next/link'
import { addActivityLog } from '@/lib/activity-logger'
import { STANDARD_ATTRIBUTES } from '@/lib/attribute-schema'
import { registerAttributesAndGetCommitment } from '@/lib/aleo-sdk-integration'
import { validateAttributeValue, validateAllAttributes, hasValidationErrors } from '@/lib/attribute-validator'
import { getMaxAttributesForUser, getSubscriptionInfo } from '@/lib/subscription-manager'
import { SubscriptionModal } from '@/components/subscription-modal'
import { checkAccountCreationRateLimit, trackAccountCreation } from '@/lib/anti-sybil'
import { generateCommitmentHash, storeCommitmentHash } from '@/lib/commitment-hash-generator'
import { storeEncryptedData } from '@/lib/storage-encryption'

export function CreateIdentityPage() {
  const { address, executeTransaction, getTransactionStatus, disconnect } = useAleoWallet()
  const isConnected = !!address
  const [mounted, setMounted] = useState(false)
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, { value: string; enabled: boolean }>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [creationComplete, setCreationComplete] = useState(false)
  const [commitment, setCommitment] = useState<string>('')
  const [commitmentHash, setCommitmentHash] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [subscriptionInfo, setSubscriptionInfo] = useState(getSubscriptionInfo())

  // When commitment hash is generated, show completion after brief pause
  useEffect(() => {
    if (commitmentHash && isConfirming) {
      console.log('[v0] Commitment hash generated, showing completion screen')
      setTimeout(() => {
        setIsConfirming(false)
        setCreationComplete(true)
      }, 500) // Brief pause to show hash is ready
    }
  }, [commitmentHash, isConfirming])

  // Ensure component only renders on client with crypto available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.crypto) {
      if (typeof (globalThis as any).crypto === 'undefined') {
        (globalThis as any).crypto = window.crypto
      }
      setMounted(true)
    }
  }, [])

  // Debug wallet state when address or executeTransaction changes
  useEffect(() => {
    if (mounted && isConnected) {
      console.log('[v0] Wallet state updated');
      debugWalletState(address, executeTransaction);
      setSubscriptionInfo(getSubscriptionInfo());
    }
  }, [address, executeTransaction, mounted, isConnected])

  const handleAttributeChange = (attrId: string, value: string) => {
    // Ensure value is a string and safe to use
    if (typeof value !== 'string') {
      console.warn('[v0] Invalid value type for attribute:', attrId, typeof value);
      return;
    }

    // Update the attribute value (users can fill any attribute)
    setSelectedAttributes(prev => ({
      ...prev,
      [attrId]: {
        value,
        enabled: prev[attrId]?.enabled ?? false
      }
    }))

    // Validate the input
    if (value.trim()) {
      const error = validateAttributeValue(attrId, value, STANDARD_ATTRIBUTES)
      if (error) {
        setValidationErrors(prev => ({
          ...prev,
          [attrId]: error.message
        }))
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[attrId]
          return newErrors
        })
      }
    }
  }

  const handleAttributeToggle = (attrId: string) => {
    const maxAttributes = getMaxAttributesForUser()
    const currentEnabledCount = Object.values(selectedAttributes).filter(attr => attr.enabled).length
    
    // Check if we're trying to enable a new attribute beyond the limit
    if (!selectedAttributes[attrId]?.enabled && currentEnabledCount >= maxAttributes) {
      setError(`Maximum ${maxAttributes} attributes allowed to claim. ${!subscriptionInfo.isActive ? 'Subscribe for unlimited.' : ''}`)
      setShowSubscriptionModal(true)
      return
    }

    setSelectedAttributes(prev => ({
      ...prev,
      [attrId]: {
        ...prev[attrId],
        enabled: !prev[attrId]?.enabled
      }
    }))
    
    setError(null)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  const handleCreateIdentity = async () => {
    // Check account creation rate limit (prevent sybil multi-account)
    const rateLimitError = checkAccountCreationRateLimit()
    if (rateLimitError) {
      setError(rateLimitError)
      return
    }

    // Get ENABLED attributes only (not all filled attributes)
    const enabledAttrIds = Object.keys(selectedAttributes)
      .filter(key => selectedAttributes[key].enabled && selectedAttributes[key].value.trim())
    
    if (enabledAttrIds.length === 0) {
      setError('Toggle and enable at least one attribute to activate')
      return
    }

    // Validate all ENABLED attributes before creating identity
    const enabledAttrs = enabledAttrIds.reduce((acc, key) => {
      acc[key] = selectedAttributes[key].value
      return acc
    }, {} as Record<string, string>)

    const validationErrors = validateAllAttributes(enabledAttrs, STANDARD_ATTRIBUTES)

    if (hasValidationErrors(validationErrors)) {
      const errorMap = validationErrors.reduce((acc, err) => {
        acc[err.field] = err.message
        return acc
      }, {} as Record<string, string>)
      setValidationErrors(errorMap)
      setError('Please fix validation errors in enabled attributes')
      return
    }

    const maxAttributes = getMaxAttributesForUser()
    if (enabledAttrIds.length > maxAttributes) {
      setError(`Maximum ${maxAttributes} attributes allowed. Subscribe for unlimited.`)
      setShowSubscriptionModal(true)
      return
    }

    if (!address) {
      setError('Wallet not connected')
      return
    }

    // Check if user already has a valid, completed identity
    const existingCommitment = localStorage.getItem('shadowid-commitment')
    const identityCreationComplete = localStorage.getItem('identity-created')
    
    // Only block if identity was actually created (not just a leftover key)
    if (existingCommitment && identityCreationComplete === 'true') {
      setError('You already have a ShadowID. Redirecting to your identity management...')
      setTimeout(() => {
        window.location.href = '/identity'
      }, 2000)
      return
    }

    if (!isConnected || !executeTransaction) {
      setError('Wallet not connected. Please connect your wallet first.');
      return
    }

    setIsCreating(true)
    try {
      if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
        throw new Error('Cryptographic functions not available in this browser. Please use a modern browser.')
      }

      const timestamp = Math.floor(Date.now() / 1000);
      
      // Prepare attributes to send to blockchain
      const attributeMap: Record<string, string> = {}
      enabledAttrIds.forEach(attr => {
        attributeMap[attr] = selectedAttributes[attr].value
      })

      console.log('[v0] Starting identity creation:', {
        attributes: Object.keys(attributeMap),
        walletConnected: !!address,
        executeTransactionAvailable: !!executeTransaction
      })

      // Validate wallet connection and transaction function
      if (!address || !executeTransaction) {
        setError('Wallet not connected. Please connect your Aleo wallet first.')
        setIsCreating(false)
        return
      }

      // Send directly to blockchain with wallet SDK status function
      const blockchainResult = await registerAttributesAndGetCommitment(
        JSON.stringify(attributeMap), // Actual attributes as JSON string
        '', // Empty signature
        timestamp,
        address,
        enabledAttrIds.length,
        executeTransaction,
        getTransactionStatus // Pass wallet SDK method for confirmation
      )
      
      // Extract the BLOCKCHAIN-GENERATED commitment
      const commitmentDisplayHex = blockchainResult.commitmentHash?.slice(0, 16).toUpperCase() || ''

      if (!blockchainResult.success) {
        console.error('[v0] Blockchain registration failed:', blockchainResult.error)
        addActivityLog('Register on-chain', 'blockchain', `Failed: ${blockchainResult.error}`, 'error')
        setError(`Blockchain error: ${blockchainResult.error}`)
        setIsCreating(false)
        return
      }

      // Show loading screen while generating commitment hash
      setIsConfirming(true)

      console.log('[v0] Blockchain confirmed:', {
        transactionId: blockchainResult.transactionId,
        commitment: blockchainResult.commitmentHash,
        attributeHash: blockchainResult.attributeHash
      })
      addActivityLog('Register on-chain', 'blockchain', `Commitment registered: ${blockchainResult.transactionId}`, 'success')

      // Wait 10 seconds, then generate personal commitment hash for the user
      console.log('[v0] Transaction successful, starting 10-second timer for hash generation')
      const hashGenerationTimer = setTimeout(async () => {
        try {
          console.log('[v0] 10 seconds elapsed, generating commitment hash now')
          const personalHash = await generateCommitmentHash({
            userAddress: address,
            attributes: enabledAttrIds,
            timestamp,
            transactionId: blockchainResult.transactionId,
          })
          
          console.log('[v0] Commitment hash generated:', personalHash)
          // Store the personal commitment hash (scoped to wallet)
          storeCommitmentHash(personalHash, address)
          setCommitmentHash(personalHash)

          console.log('[v0] Commitment hash state updated:', personalHash)
        } catch (hashError) {
          console.error('[v0] Error generating commitment hash:', hashError)
        }
      }, 10000)

      // Step 5: ONLY NOW create credential with blockchain-verified data
      const credential = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: `shadowid:${commitmentDisplayHex}`,
        type: ['VerifiableCredential', 'ShadowIDCredential'],
        issuer: { id: address, name: 'User' },
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: address,
          claims: enabledAttrIds.reduce((acc, attr) => {
            acc[attr] = { attributeId: attr, value: selectedAttributes[attr].value }
            return acc
          }, {} as Record<string, any>)
        },
        proof: {
          type: 'Ed25519Signature2020',
          created: new Date().toISOString(),
          verificationMethod: `did:aleo:${address}`,
          proofPurpose: 'assertionMethod',
          proofValue: commitmentDisplayHex,
          // Add blockchain verification proof
          blockchainCommitment: blockchainResult.commitmentHash,
          attributeHash: blockchainResult.attributeHash,
          blockchainSignature: blockchainResult.signature,
          blockchainTimestamp: blockchainResult.timestamp,
          transactionId: blockchainResult.transactionId
        }
      }

      // Step 6: Save ONLY blockchain-verified commitment
      localStorage.setItem('shadowid-commitment', blockchainResult.commitmentHash)
      localStorage.setItem('shadowid-commitment-hex', commitmentDisplayHex)
      localStorage.setItem('shadowid-created-at', new Date().toISOString())
      localStorage.setItem('shadowid-user-id', address)
      localStorage.setItem('shadowid-user-info', JSON.stringify({
        hasPhoto: false,
        documentCount: 0,
        notesCount: 0,
        documentsNames: [],
        notes: []
      }))
      localStorage.setItem('shadowid-credential', JSON.stringify(credential))
      localStorage.setItem('shadowid-attribute-hash', blockchainResult.attributeHash)
      localStorage.setItem('shadowid-signature', blockchainResult.signature)
      localStorage.setItem('shadowid-tx-id', blockchainResult.transactionId)
      localStorage.setItem('identity-created', 'true') // Flag to indicate identity creation is complete

      await storeEncryptedData(blockchainResult.commitmentHash, JSON.stringify(credential), address)

      // Verify transaction succeeded on blockchain
      if (!blockchainResult.transactionId) {
        throw new Error('Transaction submitted but no confirmation received. Please verify on Aleo explorer.')
      }

      console.log('[v0] Transaction verified on Aleo testnet:', blockchainResult.transactionId)

      // Track account creation for sybil prevention
      trackAccountCreation()

      setCommitment(blockchainResult.commitmentHash)
      addActivityLog('Create ShadowID', 'identity', `Created ZK identity with ${enabledAttrIds.length} attributes on Aleo testnet`, 'success')
      
      // Hide loading after hash is generated (11 seconds total)
      // Loading will automatically hide when hash is set
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create identity'
      console.error('[v0] Identity creation error:', err)
      setError(errorMsg)
      addActivityLog('Create ShadowID', 'identity', `Failed to create identity: ${errorMsg}`, 'error')
    } finally {
      setIsCreating(false)
      setIsConfirming(false)
    }
  }

  const handleRetry = async () => {
    setError(null)
    setRetryCount(retryCount + 1)
    await handleCreateIdentity()
  }

  if (!isConnected || !address) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background text-foreground pt-32 pb-20 px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Lock className="h-16 w-16 text-muted-foreground/40 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3">Create ShadowID</h1>
            <p className="text-muted-foreground">Connect your wallet using the button in the top right corner to create your zero-knowledge identity.</p>
          </div>
        </div>
      </>
    )
  }

  if (creationComplete) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="pt-24 pb-32 px-4">
          <div className="mx-auto max-w-2xl">
            <Link href="/dashboard">
              <Button variant="outline" className="mb-6 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-3">ShadowID Created</h1>
              <p className="text-muted-foreground mb-4">Your zero-knowledge identity is ready.</p>
              
              {/* Blockchain Commitment */}
              <div className="bg-card/50 border border-accent/20 rounded-lg p-6 mb-6">
                <p className="text-xs uppercase tracking-widest text-accent mb-2">Blockchain Commitment</p>
                <p className="text-sm font-mono font-bold break-all mb-3">{commitment}</p>
              </div>

              {/* Personal Identity Hash */}
              {commitmentHash && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-6">
                  <p className="text-xs uppercase tracking-widest text-blue-400 mb-2">Your Identity Hash</p>
                  <p className="text-2xl font-mono font-bold text-blue-300 mb-3">{commitmentHash}</p>
                  <p className="text-xs text-blue-300/70 mb-4">Share this hash with verifiers to prove your identity</p>
                  <Button
                    onClick={() => navigator.clipboard.writeText(commitmentHash)}
                    variant="outline"
                    className="gap-2 text-xs"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Identity Hash
                  </Button>
                </div>
              )}

              <p className="text-sm text-muted-foreground mb-8">
                Activated attributes: {Object.keys(selectedAttributes).filter(k => selectedAttributes[k].enabled).map(k => selectedAttributes[k].value || k).join(', ')}
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/request-attestation">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Request Attestations
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Go to Dashboard</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShadowIDLoading isVisible={isConfirming} />
      <Navigation />
      <div className="pt-24 pb-32 px-4">
        <div className="mx-auto max-w-2xl">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-8 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="mb-12">
            <h1 className="text-3xl font-bold mb-2">Create Your ShadowID</h1>
            <p className="text-muted-foreground">Select and activate attributes to create your zero-knowledge identity. Request endorsements from trusted peers to verify your claims.</p>
          </div>

            {/* Progress Indicator */}
            <div className="mb-12">
              <ProgressIndicator steps={[
                { id: 'select', label: 'Select Attributes', status: Object.keys(selectedAttributes).length > 0 ? 'completed' : 'in-progress' },
                { id: 'fill', label: 'Fill Attribute Values', status: Object.keys(selectedAttributes).filter(k => selectedAttributes[k].value?.trim()).length > 0 ? 'completed' : 'pending' },
                { id: 'create', label: 'Create Identity', status: creationComplete ? 'completed' : 'pending' }
              ]} />
            </div>

          <div className="space-y-6">
            {/* Subscription Status */}
            <div className={`rounded-lg p-4 flex items-start gap-3 border ${subscriptionInfo.isActive ? 'border-accent/30 bg-accent/10' : 'border-border bg-card/50'}`}>
              <Sparkles className={`h-5 w-5 flex-shrink-0 mt-0.5 ${subscriptionInfo.isActive ? 'text-accent' : 'text-muted-foreground'}`} />
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {subscriptionInfo.isActive ? `Subscribed - Unlimited attributes` : `Free Plan - ${subscriptionInfo.maxAttributes} attributes max`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{subscriptionInfo.message}</p>
              </div>
              {!subscriptionInfo.isActive && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSubscriptionModal(true)}
                  className="flex-shrink-0 border-accent/40 text-accent hover:bg-accent/10"
                >
                  Subscribe
                </Button>
              )}
            </div>

            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Select up to {getMaxAttributesForUser()} attributes to activate. Zero-knowledge credentials prove claims without revealing the underlying data.
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Available Attributes</h2>
                <span className="text-xs font-mono bg-accent/10 px-2 py-1 rounded">
                  {Object.values(selectedAttributes).filter(attr => attr.enabled).length}/{getMaxAttributesForUser()} Activated
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Fill in any attributes you want. Toggle ON/OFF to activate the ones you want to prove. Free plan: {getMaxAttributesForUser()} activations max.</p>
              
              <div className="space-y-3">
                {Object.values(STANDARD_ATTRIBUTES).map(attr => {
                  const attrData = selectedAttributes[attr.id] || { value: '', enabled: false }
                  const isEnabled = attrData.enabled
                  const currentEnabledCount = Object.values(selectedAttributes).filter(a => a.enabled).length
                  const canEnable = isEnabled || currentEnabledCount < getMaxAttributesForUser()
                  
                  return (
                    <div key={attr.id} className={`p-4 rounded-lg border transition-all ${isEnabled ? 'border-accent bg-accent/5' : 'border-border'}`}>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{attr.name}</p>
                          <p className="text-xs text-muted-foreground">{attr.description}</p>
                        </div>
                        {/* Toggle Switch */}
                        <button
                          onClick={() => handleAttributeToggle(attr.id)}
                          disabled={!canEnable}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                            isEnabled
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-border text-muted-foreground hover:bg-accent/20'
                          } ${!canEnable ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isEnabled ? 'Activated' : 'Activate'}
                        </button>
                      </div>
                      
                      {/* Always show input fields */}
                      <div className="space-y-2">
                        {attr.dataType === 'date' ? (
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={attrData.value ? new Date(attrData.value).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                              placeholder={`Enter ${attr.name}...`}
                              className="flex-1 px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:border-accent"
                            />
                            <input
                              type="text"
                              placeholder="YYYY-MM-DD"
                              value={attrData.value || ''}
                              onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                              className="flex-1 px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:border-accent"
                            />
                          </div>
                        ) : attr.dataType === 'enum' && attr.enumValues ? (
                          <select
                            value={attrData.value || ''}
                            onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                            className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:border-accent"
                          >
                            <option value="">Select {attr.name}...</option>
                            {attr.enumValues.map((option: string) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : attr.dataType === 'number' ? (
                          <input
                            type="number"
                            placeholder={`Enter ${attr.name}...`}
                            value={attrData.value || ''}
                            onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                            className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:border-accent"
                          />
                        ) : (
                          <input
                            type="text"
                            placeholder={`Enter ${attr.name}...`}
                            value={attrData.value || ''}
                            onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                            className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:border-accent"
                          />
                        )}
                        
                        {/* Validation Error Display */}
                        {validationErrors[attr.id] && (
                          <p className="text-xs text-red-400 flex items-start gap-1">
                            <span className="mt-0.5">⚠</span>
                            <span>{validationErrors[attr.id]}</span>
                          </p>
                        )}
                        
                        {/* Success Indicator */}
                        {!validationErrors[attr.id] && attrData.value && (
                          <p className="text-xs text-accent flex items-start gap-1">
                            <span className="mt-0.5">✓</span>
                            <span>Valid {attr.name}</span>
                          </p>
                        )}
                        
                        {attr.dataType === 'date' && (
                          <p className="text-xs text-muted-foreground">Format: YYYY-MM-DD</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {error && (
              <div className="p-4 rounded-lg border border-red-400/30 bg-red-400/5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-400">Error Creating Identity</p>
                    <p className="text-xs text-red-400/80 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            {isCreating && (
              <div className="p-8 rounded-lg border border-accent/20 bg-card/50 flex flex-col items-center justify-center">
                <LoadingSpinner size="md" text="Creating your ShadowID..." />
              </div>
            )}
            {!isCreating && (
              <>
                <Button
                  onClick={handleCreateIdentity}
                  disabled={isCreating || Object.keys(selectedAttributes).length === 0}
                  className="flex-1 gap-2 bg-blue hover:bg-blue/90 text-blue-foreground"
                >
                  Create ShadowID
                </Button>
                {error && (
                  <Button
                    onClick={handleRetry}
                    disabled={isCreating}
                    variant="outline"
                    className="px-6 border-accent/40 text-accent hover:bg-accent/10"
                  >
                    Retry
                  </Button>
                )}
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">Cancel</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSuccess={() => {
          setSubscriptionInfo(getSubscriptionInfo())
          setError(null)
        }}
        reason="attribute_limit"
      />
    </div>
  )
}
