'use client'

import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { Lock, Wallet, LockOpen, CheckCircle2, AlertCircle, Info } from 'lucide-react'
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
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect your wallet to access your private identity dashboard and manage your zero-knowledge identity layer.
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
            Wallet Connected
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
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">Identity Credential</h2>
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
                      <p className="text-lg font-mono font-bold tracking-wider text-accent">0x38F2E4</p>
                    </div>
                    <p className="text-xs text-muted-foreground/70">Status: Active</p>
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
                    <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-muted-foreground/70">Mode</p>
                    <p className="text-sm font-bold text-accent">Private</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-semibold mb-1 text-muted-foreground/70">Verification</p>
                    <p className="text-sm font-bold text-accent">ZK</p>
                  </div>
                </div>

                {/* Status */}
                <div className="pt-4 border-t border-slate-700/50">
                  <p className="text-xs text-center text-muted-foreground/60">Encryption active · Zero-knowledge protected</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Verification Status */}
            <div className="rounded-lg border border-border bg-card p-8">
              <div className="flex items-start gap-4 mb-6">
                <CheckCircle2 className="h-6 w-6 text-accent/70 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold">Verification Status</h3>
                  <p className="text-xs text-muted-foreground mt-1">Zero-knowledge proofs</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your identity credentials are stored locally and encrypted. When you generate a verification proof, it will appear here as a zero-knowledge attestation. No personal data is revealed during verification.
              </p>
            </div>

            {/* Network Info */}
            <div className="rounded-lg border border-border bg-card p-8">
              <div className="flex items-start gap-4 mb-6">
                <Info className="h-6 w-6 text-accent/70 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold">Network Information</h3>
                  <p className="text-xs text-muted-foreground mt-1">Aleo blockchain</p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">Network</p>
                  <p>Aleo (Privacy-Focused Blockchain)</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Mode</p>
                  <p>Private – All transactions and identity operations use zero-knowledge proofs</p>
                </div>
              </div>
            </div>

            {/* Verification Logs */}
            <div className="md:col-span-2 rounded-lg border border-border bg-card p-8">
              <div className="flex items-start gap-4 mb-6">
                <AlertCircle className="h-6 w-6 text-accent/70 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold">Zero-Knowledge Verification Logs</h3>
                  <p className="text-xs text-muted-foreground mt-1">Privacy-protected proofs</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When you generate zero-knowledge proofs to verify claims (age, DAO membership, credentials, etc.), they will appear here as encrypted records. Each proof is tamper-proof and cryptographically bound to your identity, but reveals no underlying data.
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-12 p-6 rounded-lg border border-accent/20 bg-accent/5">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-accent">Privacy by Design:</span> All identity operations are encrypted locally. Your private identity layer communicates with the Aleo blockchain using zero-knowledge proofs only. No personal data ever leaves your wallet.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
