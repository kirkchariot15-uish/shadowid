'use client'

import { useState } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { WalletMultiButton } from '@/components/wallet-button'
import { Navigation } from '@/components/navigation'
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

          {/* Current Identity */}
          {localStorage.getItem('shadowid-commitment') && (
            <div className="rounded-lg border border-border bg-card p-8 mb-10">
              <h2 className="text-xl font-semibold mb-4">Your Current ShadowID</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">Commitment</p>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border">
                    <p className="font-mono font-bold text-sm text-accent break-all">
                      {localStorage.getItem('shadowid-commitment')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">Created</p>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border">
                    <p className="text-sm text-foreground">
                      {localStorage.getItem('shadowid-created-at')
                        ? new Date(localStorage.getItem('shadowid-created-at')!).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <Button
                  onClick={handleCopyID}
                  variant="outline"
                  className="gap-2"
                >
                  <Copy className={`h-4 w-4 ${copied ? 'text-green-600' : ''}`} />
                  {copied ? 'Copied!' : 'Copy Commitment'}
                </Button>
                <Link href="/create-id" className="flex-1">
                  <Button className="w-full bg-accent hover:bg-accent/90">
                    View QR Code
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
        <div className="mx-auto max-w-6xl">
          {/* Header with Navigation */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <LockOpen className="h-6 w-6 text-accent" />
              <h1 className="text-4xl font-bold">Private Identity Dashboard</h1>
            </div>
            <p className="text-lg text-muted-foreground mb-6">{`Wallet Connected \u2013 Private Mode Active`}</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/create-id">
                <Button variant="outline" size="sm" className="rounded-full font-semibold border-accent/50 text-foreground hover:border-accent hover:bg-accent/5">
                  Create ID
                </Button>
              </Link>
              <Link href="/qr-codes">
                <Button variant="outline" size="sm" className="rounded-full font-semibold border-accent/50 text-foreground hover:border-accent hover:bg-accent/5">
                  QR Codes
                </Button>
              </Link>
              <Link href="/selective-disclosure">
                <Button variant="outline" size="sm" className="rounded-full font-semibold border-accent/50 text-foreground hover:border-accent hover:bg-accent/5">
                  Selective Disclosure
                </Button>
              </Link>
            </div>
          </div>

          {/* ShadowID Card + QR */}
          <div className="mb-16 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">Your Identity Credential</h2>
              <div className="relative rounded-2xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border border-slate-700/60 shadow-2xl p-8 space-y-8">
                <div className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                }} />
                <div className="relative space-y-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-accent/70">Private Identity Credential</p>
                      <h3 className="text-2xl font-black text-foreground">ShadowID</h3>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 border border-accent/40">
                      <div className="text-xs font-bold text-accent">{'\u03C3'}</div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-700/50" />

                  <div className="flex items-center gap-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg flex-shrink-0 bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30">
                      <svg className="h-12 w-12 text-accent/60" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-accent/60">Identity ID</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-mono font-bold tracking-wider text-accent">0x38F2E4</p>
                          <button onClick={handleCopyID} className="p-1 hover:bg-accent/10 rounded transition-colors" title="Copy ID">
                            <Copy className="h-4 w-4 text-muted-foreground/60" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-accent" />
                        {copied ? 'Copied!' : 'Status: Active'}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-700/50" />

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-muted-foreground/70">Network</p>
                      <p className="text-sm font-bold text-foreground">Aleo</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-muted-foreground/70">Privacy Mode</p>
                      <p className="text-sm font-bold text-accent">Active</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-muted-foreground/70">Encryption</p>
                      <p className="text-sm font-bold text-accent">ZK-Protected</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-center text-muted-foreground/60">All operations are end-to-end encrypted</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">Identity Commitment</h2>
              <div className="rounded-lg border border-border bg-card p-8 flex flex-col items-center text-center space-y-4">
                <div className="w-40 h-40 bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/30 rounded-lg flex items-center justify-center">
                  <div className="w-32 h-32 bg-accent/20 rounded flex items-center justify-center">
                    <p className="text-xs font-mono text-accent/60 text-center px-2">QR: 0x38F2E4...</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Scannable identity commitment hash</p>
                <p className="text-xs text-muted-foreground/50">No personal data embedded</p>
              </div>
            </div>
          </div>

          {/* Audit Logs */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">Verification and Audit Logs</h2>
            <div className="rounded-lg border border-border bg-card p-8">
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                Track all zero-knowledge proof generations and credential verifications. All entries are encrypted and privacy-preserved. No personal data is logged.
              </p>
              <div className="space-y-3">
                {[
                  { date: '2025-02-15', type: 'Identity Initialized', status: 'Active' },
                  { date: '2025-02-15', type: 'Privacy Mode Activated', status: 'Active' },
                  { date: '2025-02-15', type: 'Wallet Connected', status: 'Active' },
                ].map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/5">
                    <div className="flex items-center gap-4 flex-1">
                      <Calendar className="h-4 w-4 text-muted-foreground/60" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{log.type}</p>
                        <p className="text-xs text-muted-foreground/60">{log.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent/70" />
                      <span className="text-xs font-semibold text-accent">{log.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/50 mt-6 text-center">Future proof generations and credential revocations will appear here</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
