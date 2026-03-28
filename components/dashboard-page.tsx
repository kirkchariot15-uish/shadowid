'use client'

import { useState, useEffect } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { useSessionTimeout } from '@/hooks/use-session-timeout'
import { WalletMultiButton } from '@/components/wallet-button'
import { Navigation } from '@/components/navigation'
import { BlockchainStatus } from '@/components/blockchain-status'
import { OnboardingModal } from '@/components/onboarding-modal'
import { Button } from '@/components/ui/button'
import { Lock, Award, Plus, FileText, Activity, Shield, CheckCircle, AlertCircle, Key } from 'lucide-react'
import Link from 'next/link'
import { addActivityLog } from '@/lib/activity-logger'
import { initializeProofRequestSystem } from '@/lib/proof-request-integration'
import { getAdminStore } from '@/lib/admin-store'

export default function DashboardPage() {
  const { address } = useAleoWallet()
  const isConnected = !!address
  const [credentials, setCredentials] = useState<number>(0)
  const [proofs, setProofs] = useState<number>(0)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Enforce session timeout on this page
  useSessionTimeout()

  useEffect(() => {
    // Check if first time user
    const onboardingDone = localStorage.getItem('shadowid-onboarding-done')
    if (!onboardingDone) {
      setShowOnboarding(true)
    }

    // Load credentials count
    const attrs = localStorage.getItem('shadowid-attributes')
    if (attrs) {
      setCredentials(JSON.parse(attrs).length)
    }

    // Check for successful identity creation
    const identityCreatedFlag = localStorage.getItem('shadowid-identity-created-success')
    if (identityCreatedFlag === 'true') {
      setShowSuccessNotification(true)
      // Clear the flag after showing
      localStorage.removeItem('shadowid-identity-created-success')
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => setShowSuccessNotification(false), 5000)
      return () => clearTimeout(timer)
    }

    // CRITICAL: Verify wallet matches the ShadowID owner before initializing
    const storedWallet = localStorage.getItem('shadowid-wallet-address')
    const userCommitment = localStorage.getItem('shadowid-commitment')
    
    // Only initialize proof request system if:
    // 1. User has an address connected
    // 2. User has a ShadowID created
    // 3. The ShadowID belongs to this wallet (or no wallet was stored - first user)
    if (address && userCommitment) {
      if (storedWallet === undefined || storedWallet === address) {
        initializeProofRequestSystem(userCommitment, address)
      } else if (storedWallet !== address) {
        console.warn('[v0] Wallet mismatch: cannot access ShadowID from different wallet')
      }
    }

    // Check if user has admin privileges
    if (address) {
      const adminStore = getAdminStore()
      const admin = adminStore.getAdmin(address)
      setIsAdmin(!!admin)
    }
  }, [address])

  const handleCopyID = () => {
    navigator.clipboard.writeText(address || '')
    addActivityLog('Copy wallet address', 'security', `Copied address: ${address?.slice(0, 8)}...`, 'success')
  }

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <span className="text-sm font-bold text-accent-foreground">{'\u03C3'}</span>
              </div>
              <span className="text-lg font-bold">ShadowID</span>
            </Link>
            <div className="wallet-button-wrapper">
              <WalletMultiButton />
            </div>
          </div>
        </nav>

        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <Lock className="h-16 w-16 text-muted-foreground/40" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Dashboard Locked</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect your wallet to access your ShadowID dashboard. Create identities, request peer endorsements, and generate selective disclosure proofs.
            </p>
            <div className="flex justify-center">
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      {showOnboarding && <OnboardingModal onComplete={() => setShowOnboarding(false)} />}
      
      {/* Success Notification Banner */}
      {showSuccessNotification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40 max-w-md mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 shadow-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Identity Created Successfully</h3>
              <p className="text-sm text-green-700 mt-1">Your ShadowID has been registered on the Aleo blockchain.</p>
            </div>
            <button
              onClick={() => setShowSuccessNotification(false)}
              className="text-green-600 hover:text-green-700 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Main Content - with top padding for navigation */}
      <div className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header Section */}
          <div className="mb-16">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Your ShadowID</h1>
                <p className="text-muted-foreground text-lg">Manage your identity, endorsements, and credentials</p>
              </div>
            </div>
          </div>

          {/* Blockchain Status Banner */}
          <div className="mb-8">
            <BlockchainStatus />
          </div>

          {/* Quick Stats - Cleaner Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
              <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-3">Wallet Status</p>
              <p className="text-2xl font-bold text-foreground">Connected</p>
              <p className="text-xs text-muted-foreground mt-2">{address?.slice(0, 10)}...</p>
            </div>
            
            <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
              <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-3">Privacy Mode</p>
              <p className="text-2xl font-bold text-foreground">Active</p>
              <p className="text-xs text-muted-foreground mt-2">Zero-knowledge enabled</p>
            </div>
            
            <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6">
              <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-3">Credentials</p>
              <p className="text-2xl font-bold text-foreground">{credentials}</p>
              <p className="text-xs text-muted-foreground mt-2">Activated attributes</p>
            </div>
          </div>

          {/* Action Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Main Actions */}
            <div className="lg:col-span-2 space-y-12">
              {/* Primary Actions */}
              <div>
                <h2 className="text-lg font-semibold mb-6 uppercase tracking-widest">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Link href="/create-identity" className="group">
                    <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8 hover:border-accent/40 transition-all cursor-pointer">
                      <Plus className="h-8 w-8 text-accent mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Create ShadowID</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Start a zero-knowledge identity with verifiable credentials.
                      </p>
                    </div>
                  </Link>

                  <Link href="/proof-requests" className="group">
                    <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8 hover:border-accent/40 transition-all cursor-pointer">
                      <Award className="h-8 w-8 text-accent mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Proof Requests</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        View and respond to incoming proof requests from services.
                      </p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Secondary Actions */}
              <div>
                <h2 className="text-lg font-semibold mb-6 uppercase tracking-widest">Verification & Sharing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Link href="/selective-disclosure" className="group">
                    <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8 hover:border-accent/40 transition-all cursor-pointer">
                      <FileText className="h-8 w-8 text-accent mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Generate Proofs</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Create selective disclosure proofs to share specific attributes.
                      </p>
                    </div>
                  </Link>

                  <Link href="/verify-qr" className="group">
                    <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8 hover:border-accent/40 transition-all cursor-pointer">
                      <CheckCircle className="h-8 w-8 text-accent mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Verify Proofs</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Scan and verify zero-knowledge proofs from other users.
                      </p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Engagement */}
              <div>
                <h2 className="text-lg font-semibold mb-6 uppercase tracking-widest">Community</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Link href="/endorse-peer" className="group">
                    <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8 hover:border-accent/40 transition-all cursor-pointer">
                      <Award className="h-8 w-8 text-accent mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Endorse Peers</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Strengthen peers' credibility by endorsing their attributes.
                      </p>
                    </div>
                  </Link>

                  <Link href="/logs" className="group">
                    <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8 hover:border-accent/40 transition-all cursor-pointer">
                      <Activity className="h-8 w-8 text-accent mb-4" />
                      <h3 className="font-semibold text-lg mb-2">Activity Logs</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Review all security events and account activity history.
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Identity Overview */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold uppercase tracking-widest">Identity Overview</h2>
              
              {localStorage.getItem('shadowid-commitment') ? (
                <>
                  {/* Quick Info */}
                  <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-2">Status</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-success rounded-full"></div>
                        <p className="text-sm font-medium">Identity Created</p>
                      </div>
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-2">Credentials</p>
                      <p className="text-2xl font-bold">{credentials}</p>
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-2">Wallet</p>
                      <p className="text-xs font-mono text-muted-foreground truncate">{address?.slice(0, 12)}...</p>
                    </div>
                  </div>

                  {/* View Full Profile Link */}
                  <Link href="/identity" className="w-full">
                    <Button className="w-full gap-2 bg-accent/10 hover:bg-accent/20 text-accent">
                      <Shield className="h-4 w-4" />
                      View My ShadowID
                    </Button>
                  </Link>

                  {/* Admin Panel Button - Only shows for admins */}
                  {isAdmin && (
                    <Link href="/admin" className="w-full">
                      <Button className="w-full gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600">
                        <Key className="h-4 w-4" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-6 text-center space-y-4">
                  <Lock className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                  <div>
                    <p className="text-sm font-medium mb-2">No Identity Yet</p>
                    <p className="text-xs text-muted-foreground">Create your first ShadowID to get started</p>
                  </div>
                  <Link href="/create-identity" className="w-full">
                    <Button className="w-full gap-2" size="sm">
                      <Plus className="h-4 w-4" />
                      Create Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
