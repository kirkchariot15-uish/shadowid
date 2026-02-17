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
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your ShadowID private identity space</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">Wallet Status</p>
                  <p className="text-2xl font-bold text-accent">Connected</p>
                </div>
                <Wallet className="h-8 w-8 text-accent/40" />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {address?.slice(0, 8)}...{address?.slice(-6)}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">IDs Created</p>
                  <p className="text-2xl font-bold text-accent">
                    {localStorage.getItem('shadowid-commitment') ? '1' : '0'}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-accent/40" />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-2">Recent Activity</p>
                  <p className="text-2xl font-bold text-accent">Active</p>
                </div>
                <Activity className="h-8 w-8 text-accent/40" />
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Link href="/create-id" className="group">
              <div className="rounded-lg border border-border bg-card p-8 hover:border-accent/50 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <Plus className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Create New Identity</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Create a new ShadowID with encrypted identity materials. Upload photos, documents, or text.
                </p>
                <div className="mt-4 flex items-center gap-2 text-accent text-sm font-medium group-hover:gap-3 transition-all">
                  Start Creating
                  <span>→</span>
                </div>
              </div>
            </Link>

            <Link href="/logs" className="group">
              <div className="rounded-lg border border-border bg-card p-8 hover:border-accent/50 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <Activity className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Activity Logs</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  View detailed activity history of all identity creation, wallet connections, and security events.
                </p>
                <div className="mt-4 flex items-center gap-2 text-accent text-sm font-medium group-hover:gap-3 transition-all">
                  View Logs
                  <span>→</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Your ID Card */}
          {localStorage.getItem('shadowid-commitment') && (() => {
            const commitment = localStorage.getItem('shadowid-commitment')!
            const createdAt = localStorage.getItem('shadowid-created-at')!
            const userInfoStr = localStorage.getItem('shadowid-user-info')
            const userInfo = userInfoStr ? JSON.parse(userInfoStr) : { hasPhoto: false, documentCount: 0, notesCount: 0 }

            return (
              <div className="mb-10">
                <h2 className="text-xl font-semibold mb-6">Your ShadowID Card</h2>
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
