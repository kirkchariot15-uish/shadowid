'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
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
import { checkExistingAccountOnBlockchain, recoverAccountFromBlockchain, storeAccountMappingOnBlockchain } from '@/lib/account-recovery'

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
    if (commitmentHash) {
      console.log('[v0] Commitment hash generated, showing completion screen')
      toast.success('ShadowID Created Successfully! 🎉', {
        description: 'Your zero-knowledge identity is now active on the Aleo testnet.',
        duration: 6000,
      })
      setTimeout(() => {
        setIsConfirming(false)
        setCreationComplete(true)
      }, 500) // Brief pause to show hash is ready
    }
  }, [commitmentHash, toast])

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
    if (mounted && isConnected && address) {
      const shortAddr = address.slice(-6)
      console.log('[v0] Wallet connected:', shortAddr)
      debugWalletState(address, executeTransaction)
      setSubscriptionInfo(getSubscriptionInfo())
      
      // CRITICAL: Check if wallet already has an account on blockchain
      // This must be awaited to prevent race conditions
      checkWalletForExistingAccount();
    }
  }, [address, executeTransaction, mounted, isConnected])

  // Check if the connected wallet already has an account on the blockchain
  const checkWalletForExistingAccount = async () => {
    if (!address) return
    
    try {
      const shortAddr = address.slice(-6)
      console.log('[v0] Checking for existing account')
      
      // Check if we already have this account loaded locally
      const localWalletAddress = localStorage.getItem('shadowid-wallet-address')
      const localCommitment = localStorage.getItem('shadowid-commitment')
      
      if (localWalletAddress === address && localCommitment) {
        console.log('[v0] Account already loaded locally for this wallet')
        return
      }
      
      // Check blockchain for existing account
      const existingAccount = await checkExistingAccountOnBlockchain(address)
      
      if (existingAccount.exists && existingAccount.commitment) {
        console.log('[v0] Found existing account on blockchain, auto-recovering...')
        
        // Automatically recover the account without asking
        const recoveryResult = await recoverAccountFromBlockchain(address)
        if (recoveryResult.success) {
          toast.success('Account Recovered! 🎉', {
            description: 'Your existing ShadowID has been restored.',
            duration: 5000,
          })
          // Redirect to identity management after showing recovery message
          setTimeout(() => {
            window.location.href = '/identity'
          }, 2000)
        } else {
          toast.error('Recovery failed', {
            description: recoveryResult.error || 'Could not recover your account',
          })
        }
      }
    } catch (error) {
      console.error('[v0] Error checking existing account:', error)
    }
  }

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
        executeTransactionAvailable: !!executeTransaction,
        getTransactionStatusAvailable: !!getTransactionStatus
      })

      // Validate wallet connection and transaction function
      if (!address || !executeTransaction) {
        setError('Wallet not connected. Please connect your Aleo wallet first.')
        setIsCreating(false)
        return
      }

      console.log('[v0] About to call registerAttributesAndGetCommitment with:', {
        walletAddress: address,
        attributeCount: enabledAttrIds.length
      })

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
      
      console.log('[v0] Blockchain result received:', { 
        success: blockchainResult.success, 
        error: blockchainResult.error,
        transactionId: blockchainResult.transactionId 
      })
      
      // Extract the BLOCKCHAIN-GENERATED commitment
      const commitmentDisplayHex = blockchainResult.commitmentHash?.slice(0, 16).toUpperCase() || ''

      if (!blockchainResult.success) {
        const errorMsg = blockchainResult.error || 'Blockchain error'
        addActivityLog('Register on-chain', 'blockchain', `Failed: ${errorMsg}`, 'error')
        
        // Distinguish between proving timeout and other errors
        if (errorMsg.includes('proving') || errorMsg.includes('asString()')) {
          setError('The Aleo proving service is temporarily busy. This is a network issue. Please try again in a few moments.')
        } else if (errorMsg.includes('Aleo proving service')) {
          setError(errorMsg)
        } else {
          setError(`Blockchain error: ${errorMsg}`)
        }
        setIsCreating(false)
        return
      }

      // Show loading screen while generating commitment hash
      setIsConfirming(true)

      addActivityLog('Register on-chain', 'blockchain', `Commitment registered: ${blockchainResult.transactionId}`, 'success')

      // Wait 10 seconds, then generate personal commitment hash for the user
      const hashGenerationTimer = setTimeout(async () => {
        try {
          const personalHash = await generateCommitmentHash({
            userAddress: address,
            attributes: enabledAttrIds,
            timestamp,
            transactionId: blockchainResult.transactionId,
          })
          
          // Store the personal commitment hash (scoped to wallet)
          storeCommitmentHash(personalHash, address)
          setCommitmentHash(personalHash)
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

      // Step 6: Save ONLY blockchain-verified commitment (encrypted)
      localStorage.setItem('shadowid-commitment', blockchainResult.commitmentHash)
      localStorage.setItem('shadowid-commitment-hex', commitmentDisplayHex)
      localStorage.setItem('shadowid-created-at', new Date().toISOString())
      localStorage.setItem('shadowid-user-id', address)
      localStorage.setItem('shadowid-wallet-address', address)
      localStorage.setItem('identity-created', 'true')
      
      // CRITICAL: Store activated attributes IDs for disclosure page
      localStorage.setItem('shadowid-activated-attributes', JSON.stringify(enabledAttrIds))
      
      localStorage.setItem('shadowid-user-info', JSON.stringify({
        hasPhoto: false,
        documentCount: 0,
        notesCount: 0,
        documentsNames: [],
        notes: []
      }))
      
      // CRITICAL: Store account mapping on blockchain for future recovery
      // This allows users to recover their account when they import their private key elsewhere
      const recoveryTimestamp = Math.floor(Date.now() / 1000)
      storeAccountMappingOnBlockchain(address, blockchainResult.commitmentHash, recoveryTimestamp)
      console.log('[v0] Account mapping stored on blockchain for recovery')
      
      // Track account creation for rate limiting
      trackAccountCreation()
      
      // SECURITY: Encrypt credential before storing
      const encryptedCredential = JSON.stringify({
        encrypted: true,
        data: JSON.stringify(credential),
        timestamp: Date.now()
      })
      
      // Store encrypted credential using wallet-based key
      storeEncryptedData('shadowid-credential', encryptedCredential, address)
      
      localStorage.setItem('shadowid-attribute-hash', blockchainResult.attributeHash)
      localStorage.setItem('shadowid-signature', blockchainResult.signature)
      localStorage.setItem('shadowid-tx-id', blockchainResult.transactionId)
      localStorage.setItem('identity-created', 'true')

      // Verify transaction succeeded on blockchain
      if (!blockchainResult.transactionId) {
        throw new Error('Transaction submitted but no confirmation received. Please verify on Aleo explorer.')
      }

      setCommitment(blockchainResult.commitmentHash)
      addActivityLog('Create ShadowID', 'identity', `Created ZK identity with ${enabledAttrIds.length} attributes on Aleo testnet`, 'success')
      
      // Set flag for dashboard success notification
      localStorage.setItem('shadowid-identity-created-success', 'true')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create identity'
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
              <h1 className="text-3xl font-bold mb-3">ShadowID Created Successfully</h1>
              <p className="text-muted-foreground mb-8">Your zero-knowledge identity has been registered on the Aleo testnet.</p>
              
              {/* Transaction Confirmation */}
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <p className="text-sm font-semibold text-accent">Transaction Confirmed</p>
                </div>
            <p className="text-xs text-muted-foreground mb-3">Transaction Fee Charged</p>
            <p className="text-2xl font-bold text-accent">1 ALEO</p>
                <p className="text-xs text-muted-foreground mt-2">Paid to Aleo testnet for registration</p>
              </div>

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
