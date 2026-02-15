'use client'

import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { Lock, Wallet, LockOpen, Shield, Network, Info, Copy, CheckCircle, Circle } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { isWalletConnected, setIsWalletConnected } = useWallet()

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Navigation */}
        <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <span className="text-sm font-bold text-accent-foreground">σ</span>
              </div>
              <span className="text-lg font-bold">ShadowID</span>
            </Link>
            <Button
              onClick={() => setIsWalletConnected(true)}
              variant="outline"
              size="sm"
              className="rounded-full font-semibold transition-all border-accent/50 text-foreground hover:border-accent hover:bg-accent hover:text-accent-foreground"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </nav>

        {/* Locked State */}
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <Lock className="h-16 w-16 text-muted-foreground/40" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Dashboard Locked</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect your wallet to access your private identity dashboard. Your zero-knowledge identity layer will be initialized on the Aleo network.
            </p>
            <Button
              onClick={() => setIsWalletConnected(true)}
              size="lg"
              className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet to Continue
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-accent-foreground">σ</span>
            </div>
            <span className="text-lg font-bold">ShadowID</span>
          </Link>
          <Button
            onClick={() => setIsWalletConnected(false)}
            variant="default"
            size="sm"
            className="rounded-full font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <LockOpen className="h-6 w-6 text-accent" />
              <h1 className="text-4xl font-bold">Private Identity Dashboard</h1>
            </div>
            <p className="text-lg text-muted-foreground">Wallet Connected – Private Mode Active</p>
          </div>

          {/* ShadowID Card */}
          <div className="mb-16">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">Your Identity Credential</h2>
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border border-slate-700/60 shadow-2xl p-8 space-y-8">
              {/* Subtle texture */}
              <div className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              }} />

              {/* Card Content */}
              <div className="relative space-y-8">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-accent/70">
                      Private Identity Credential
                    </p>
                    <h3 className="text-2xl font-black text-foreground">ShadowID</h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 border border-accent/40">
                    <div className="text-xs font-bold text-accent">σ</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-700/50" />

                {/* Avatar & Identity */}
                <div className="flex items-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg flex-shrink-0 bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30">
                    <svg className="h-12 w-12 text-accent/60" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-accent/60">
                        Identity ID
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-mono font-bold tracking-wider text-accent">0x38F2E4</p>
                        <button className="p-1 hover:bg-accent/10 rounded transition-colors">
                          <Copy className="h-4 w-4 text-muted-foreground/60" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-accent" />
                      Status: Active
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-700/50" />

                {/* Metadata */}
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

                {/* Status */}
                <div className="pt-4 border-t border-slate-700/50">
                  <p className="text-xs text-center text-muted-foreground/60">All operations are end-to-end encrypted</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Information Sections */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Privacy Guarantees */}
            <div className="rounded-lg border border-border bg-card p-8">
              <div className="flex items-start gap-4 mb-6">
                <Shield className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold">Privacy Guarantees</h3>
                  <p className="text-xs text-muted-foreground mt-1">How your data is protected</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Circle className="h-1.5 w-1.5 text-accent mt-1.5 flex-shrink-0" />
                  <span>Identity stored locally, encrypted with your wallet</span>
                </li>
                <li className="flex items-start gap-2">
                  <Circle className="h-1.5 w-1.5 text-accent mt-1.5 flex-shrink-0" />
                  <span>Zero-knowledge proofs reveal only what you choose</span>
                </li>
                <li className="flex items-start gap-2">
                  <Circle className="h-1.5 w-1.5 text-accent mt-1.5 flex-shrink-0" />
                  <span>No central server, no data breach risk</span>
                </li>
                <li className="flex items-start gap-2">
                  <Circle className="h-1.5 w-1.5 text-accent mt-1.5 flex-shrink-0" />
                  <span>Aleo blockchain enforces cryptographic privacy</span>
                </li>
              </ul>
            </div>

            {/* Network & Protocol */}
            <div className="rounded-lg border border-border bg-card p-8">
              <div className="flex items-start gap-4 mb-6">
                <Network className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold">Network & Protocol</h3>
                  <p className="text-xs text-muted-foreground mt-1">Technical details</p>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-foreground mb-1">Blockchain</p>
                  <p className="text-muted-foreground">Aleo – Privacy-first blockchain</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Proof System</p>
                  <p className="text-muted-foreground">Zero-Knowledge (ZK) proofs</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Identity Type</p>
                  <p className="text-muted-foreground">Self-Sovereign (wallet-controlled)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Capability Status */}
          <div className="rounded-lg border border-border bg-card p-8">
            <div className="flex items-start gap-4 mb-6">
              <Info className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold">Available Capabilities</h3>
                <p className="text-xs text-muted-foreground mt-1">What you can do with your ShadowID</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Generate Zero-Knowledge Proofs</p>
                    <p className="text-muted-foreground text-xs mt-1">Prove claims cryptographically without revealing data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Selective Disclosure</p>
                    <p className="text-muted-foreground text-xs mt-1">Share only specific attributes you choose</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Verify Credentials</p>
                    <p className="text-muted-foreground text-xs mt-1">Prove membership, status, or attributes privately</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Privacy-Preserved Logging</p>
                    <p className="text-muted-foreground text-xs mt-1">Track proofs and interactions without exposure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

