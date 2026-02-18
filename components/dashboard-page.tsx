'use client'

import { useState, useEffect } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { WalletMultiButton } from '@/components/wallet-button'
import { Navigation } from '@/components/navigation'
import { IDCard } from '@/components/id-card'
import { Button } from '@/components/ui/button'
import { Lock, Wallet, LockOpen, Copy, CheckCircle, Calendar, Plus, FileText, Activity } from 'lucide-react'
import Link from 'next/link'
import { addActivityLog } from '@/lib/activity-logger'

export default function DashboardPage() {
  const { isConnected, address } = useAleoWallet()
  const [copied, setCopied] = useState(false)

  const handleCopyID = () => {
    navigator.clipboard.writeText(address || '')
    setCopied(true)
    addActivityLog('Copy wallet address', 'security', `Copied address: ${address?.slice(0, 8)}...`, 'success')
    setTimeout(() => setCopied(false), 2000)
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
              Connect your wallet to access your private identity dashboard. Your zero-knowledge identity layer will be initialized on the Aleo network.
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
      
      {/* Main Content - with top padding for navigation */}
      <div className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header Section */}
          <div className="mb-16">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Your ShadowID</h1>
                <p className="text-muted-foreground text-lg">Manage your private identity and disclosures</p>
              </div>
            </div>
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
              <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-3">Network</p>
              <p className="text-2xl font-bold text-foreground">Aleo</p>
              <p className="text-xs text-muted-foreground mt-2">Testnet</p>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="mb-16">
            <h2 className="text-lg font-semibold mb-6 uppercase tracking-widest">Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/create-id" className="group">
                <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8 hover:border-accent/40 transition-all cursor-pointer">
                  <Plus className="h-8 w-8 text-accent mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Create New Identity</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Create a ShadowID with encrypted identity materials.
                  </p>
                </div>
              </Link>

              <Link href="/logs" className="group">
                <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8 hover:border-accent/40 transition-all cursor-pointer">
                  <FileText className="h-8 w-8 text-accent mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Activity Logs</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    View your identity creation and security events.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Your ID Card */}
          {localStorage.getItem('shadowid-commitment') && (() => {
            const commitment = localStorage.getItem('shadowid-commitment')!
            const createdAt = localStorage.getItem('shadowid-created-at')!
            const userInfoStr = localStorage.getItem('shadowid-user-info')
            const userInfo = userInfoStr ? JSON.parse(userInfoStr) : { hasPhoto: false, documentCount: 0, notesCount: 0 }

            return (
              <div className="mt-24 pt-16 border-t border-border">
                <h2 className="text-lg font-semibold mb-8 uppercase tracking-widest">Your Identity Card</h2>
                <IDCard
                  commitment={commitment}
                  walletAddress={address}
                  createdAt={createdAt}
                  userInfo={userInfo}
                  showActions={true}
                />
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
