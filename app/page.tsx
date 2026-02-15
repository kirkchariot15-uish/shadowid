'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, Eye, Users, Shield, Wallet, LockOpen, X } from 'lucide-react'

export default function Page() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [showPrivacyGuarantees, setShowPrivacyGuarantees] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-accent-foreground">σ</span>
            </div>
            <span className="text-lg font-bold">ShadowID</span>
          </div>
          <Button
            onClick={() => setIsWalletConnected(!isWalletConnected)}
            variant={isWalletConnected ? 'default' : 'outline'}
            size="sm"
            className={`rounded-full font-semibold transition-all ${
              isWalletConnected
                ? 'bg-accent hover:bg-accent/90 text-accent-foreground border-accent'
                : 'border-accent/50 text-foreground hover:border-accent hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Wallet className="h-4 w-4 mr-2" />
            {isWalletConnected ? 'Wallet Connected' : 'Connect Wallet'}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-block mb-6 px-4 py-2 rounded-full border border-accent/30 bg-accent/5 text-sm text-muted-foreground">
            Built on Aleo · Zero-Knowledge Proofs
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-balance mb-6">
            Your Identity,{' '}
            <span className="text-accent">Not Your Data</span>
          </h1>
          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto leading-relaxed">
            ShadowID is a self-sovereign identity layer that lets you prove who you are without revealing your personal information or activity history.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {
                if (!isWalletConnected) {
                  setIsWalletConnected(true)
                }
              }}
              size="lg"
              className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              {isWalletConnected ? 'Generate Identity' : 'Get Started'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-accent/50 text-foreground hover:border-accent hover:bg-accent/5"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* ShadowID Card Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Card Display */}
            <div className="flex justify-center lg:justify-end order-2 lg:order-1">
              <div className="relative w-full max-w-md">
                {/* Physical card replica */}
                <div className={`relative rounded-2xl transition-all duration-300 ${
                  isWalletConnected
                    ? 'bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border border-slate-700/60 shadow-2xl'
                    : 'bg-gradient-to-br from-card to-card border border-border/60 shadow-lg'
                }`}>
                  {/* Subtle texture overlay */}
                  <div className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                  }} />

                  {/* Card Content */}
                  <div className="relative p-8 space-y-8">
                    {/* Header Section */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-xs uppercase tracking-widest font-semibold mb-1 transition-colors ${
                          isWalletConnected ? 'text-accent/70' : 'text-muted-foreground/50'
                        }`}>
                          Private Identity Credential
                        </p>
                        <h3 className={`text-2xl font-black transition-colors ${
                          isWalletConnected ? 'text-foreground' : 'text-muted-foreground/60'
                        }`}>
                          ShadowID
                        </h3>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                        isWalletConnected 
                          ? 'bg-accent/20 border border-accent/40' 
                          : 'bg-muted/20 border border-border/40'
                      }`}>
                        <div className={`text-xs font-bold ${
                          isWalletConnected ? 'text-accent' : 'text-muted-foreground/40'
                        }`}>
                          σ
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className={`h-px transition-colors ${
                      isWalletConnected ? 'bg-slate-700/50' : 'bg-border/30'
                    }`} />

                    {/* Avatar Placeholder & Main Identity */}
                    <div className="flex items-center gap-6">
                      {/* Silhouetted Avatar */}
                      <div className={`flex h-20 w-20 items-center justify-center rounded-lg flex-shrink-0 transition-colors ${
                        isWalletConnected
                          ? 'bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30'
                          : 'bg-muted/20 border border-border/30'
                      }`}>
                        <svg className={`h-12 w-12 transition-colors ${
                          isWalletConnected ? 'text-accent/60' : 'text-muted-foreground/30'
                        }`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>

                      {/* Identity Info */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className={`text-xs uppercase tracking-widest font-semibold mb-1 transition-colors ${
                            isWalletConnected ? 'text-accent/60' : 'text-muted-foreground/40'
                          }`}>
                            Identity ID
                          </p>
                          <p className={`text-lg font-mono font-bold tracking-wider transition-colors ${
                            isWalletConnected ? 'text-accent' : 'text-muted-foreground/40'
                          }`}>
                            {isWalletConnected ? '0x38F2E4' : '\u2022\u2022\u2022\u2022\u2022\u2022'}
                          </p>
                        </div>
                        <p className={`text-xs transition-colors ${
                          isWalletConnected ? 'text-muted-foreground/70' : 'text-muted-foreground/40'
                        }`}>
                          Status: {isWalletConnected ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className={`h-px transition-colors ${
                      isWalletConnected ? 'bg-slate-700/50' : 'bg-border/30'
                    }`} />

                    {/* Footer Metadata */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className={`text-xs uppercase tracking-widest font-semibold mb-1 transition-colors ${
                          isWalletConnected ? 'text-muted-foreground/70' : 'text-muted-foreground/40'
                        }`}>
                          Network
                        </p>
                        <p className={`text-sm font-bold transition-colors ${
                          isWalletConnected ? 'text-foreground' : 'text-muted-foreground/40'
                        }`}>
                          {isWalletConnected ? 'Aleo' : '\u2014'}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs uppercase tracking-widest font-semibold mb-1 transition-colors ${
                          isWalletConnected ? 'text-muted-foreground/70' : 'text-muted-foreground/40'
                        }`}>
                          Mode
                        </p>
                        <p className={`text-sm font-bold transition-colors ${
                          isWalletConnected ? 'text-accent' : 'text-muted-foreground/40'
                        }`}>
                          {isWalletConnected ? 'Private' : '\u2014'}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs uppercase tracking-widest font-semibold mb-1 transition-colors ${
                          isWalletConnected ? 'text-muted-foreground/70' : 'text-muted-foreground/40'
                        }`}>
                          Verification
                        </p>
                        <p className={`text-sm font-bold transition-colors ${
                          isWalletConnected ? 'text-accent' : 'text-muted-foreground/40'
                        }`}>
                          {isWalletConnected ? 'ZK' : '\u2014'}
                        </p>
                      </div>
                    </div>

                    {/* Status Note */}
                    <div className={`pt-4 border-t transition-colors ${
                      isWalletConnected ? 'border-slate-700/50' : 'border-border/30'
                    }`}>
                      <p className={`text-xs text-center transition-colors ${
                        isWalletConnected ? 'text-muted-foreground/60' : 'text-muted-foreground/40'
                      }`}>
                        {isWalletConnected ? 'Encryption active' : 'Connect a wallet to activate identity features'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl lg:text-5xl font-black mb-6 text-balance">
                Your Private Identity Artifact
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                No account. No profile. No personal information stored anywhere. ShadowID is a cryptographic identity primitive that lives with you, controlled entirely by your wallet.
              </p>

              {/* Prove facts */}
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest mb-5">
                  {isWalletConnected ? 'You can prove:' : 'Provable attributes'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {['Over 18', 'Verified Contributor', 'DAO Member', 'Credential Holder'].map((fact) => (
                    <div
                      key={fact}
                      className={`flex items-center gap-2 rounded-lg border px-4 py-3 transition-all ${
                        isWalletConnected
                          ? 'border-accent/30 bg-accent/10'
                          : 'border-border/50 bg-muted/20 opacity-50'
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full flex-shrink-0 ${
                          isWalletConnected ? 'bg-accent' : 'bg-muted-foreground/30'
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isWalletConnected ? 'text-foreground' : 'text-muted-foreground/50'
                        }`}
                      >
                        {fact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wallet requirement message */}
              {!isWalletConnected && (
                <div className="mt-8 p-4 rounded-lg border border-border/50 bg-muted/10">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Connect a wallet to activate identity features. Your private identity will be initialized on the Aleo network.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Identity Layer Initialized Section */}
      {isWalletConnected && (
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-border bg-accent/3">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-3 mb-12">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 border border-accent/40">
                <LockOpen className="h-5 w-5 text-accent" />
              </div>
              <h2 className="text-2xl font-bold">Identity Layer Initialized</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Available Actions */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">Available Actions</h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => setShowPrivacyGuarantees(true)}
                    variant="outline"
                    className="w-full justify-start rounded-lg border-accent/30 text-foreground hover:border-accent hover:bg-accent/5 transition-all"
                  >
                    <Eye className="h-4 w-4 mr-3" />
                    View Privacy Guarantees
                  </Button>
                </div>
              </div>

              {/* Restricted Capabilities */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">Restricted Capabilities</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Create Private Identity', reason: 'Requires identity layer activation' },
                    { name: 'Generate Verification Proof', reason: 'Requires identity layer activation' },
                    { name: 'Selective Disclosure', reason: 'Requires identity layer activation' },
                  ].map((capability) => (
                    <div
                      key={capability.name}
                      className="rounded-lg border border-border/50 bg-card/50 p-3 cursor-not-allowed opacity-60"
                    >
                      <div className="flex items-start gap-3">
                        <Lock className="h-4 w-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-muted-foreground/60">{capability.name}</p>
                          <p className="text-xs text-muted-foreground/40 mt-1">{capability.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Privacy Guarantees Modal */}
      {showPrivacyGuarantees && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-accent/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card/95">
              <h2 className="text-xl font-bold">Privacy Guarantees</h2>
              <button
                onClick={() => setShowPrivacyGuarantees(false)}
                className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-accent" />
                  End-to-End Encryption
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All identity data is encrypted locally on your device. No unencrypted personal information ever leaves your wallet.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-accent" />
                  Zero-Knowledge Architecture
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Verification occurs through cryptographic proofs without revealing underlying identity attributes. No third party sees your claims.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  No Central Database
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your identity is never stored on centralized servers. It resides solely with you, bound to your wallet and inaccessible to any third party.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" />
                  Aleo Privacy Layer
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Built on Aleo, a privacy-focused blockchain that provides mathematical guarantees against surveillance, data correlation, and linkage attacks.
                </p>
              </div>

              <div className="h-px bg-border" />

              <p className="text-xs text-muted-foreground/60">
                These privacy guarantees are enforced by design through cryptographic protocols and distributed architecture. No manual processes or trust assumptions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Problem Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">The Problem</h2>
              <p className="text-muted-foreground leading-relaxed">
                Traditional identity systems force a false choice: surrender your data to institutions, or remain anonymous and unverifiable. This enables surveillance, discrimination, and puts dissidents, journalists, and activists at existential risk.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">The Solution</h2>
              <p className="text-muted-foreground leading-relaxed">
                ShadowID uses zero-knowledge cryptography to let you prove specific claims without revealing unnecessary information. Built on Aleo, you maintain complete custody. No central database. No breach possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-12 text-center">How ShadowID Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 border border-accent/30 mb-4">
                <span className="text-lg font-bold text-accent">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect your Aleo wallet to begin. This becomes your identity foundation—completely private.
              </p>
            </div>

            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 border border-accent/30 mb-4">
                <span className="text-lg font-bold text-accent">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Generate Private Identity</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create attributes tied to your wallet. Your data stays encrypted locally. Nothing is broadcast.
              </p>
            </div>

            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 border border-accent/30 mb-4">
                <span className="text-lg font-bold text-accent">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Zero-Knowledge Proof</h3>
              <p className="text-muted-foreground leading-relaxed">
                Prove specific claims cryptographically without revealing the underlying data. Verification without disclosure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-border bg-secondary/5">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Built on Four Principles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-lg border border-accent/20 bg-card p-6">
              <div className="flex items-start gap-4">
                <Lock className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">User-Owned</h3>
                  <p className="text-sm text-muted-foreground">
                    You own your identity. No authority can revoke, modify, or censor it.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-accent/20 bg-card p-6">
              <div className="flex items-start gap-4">
                <Eye className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Zero-Knowledge</h3>
                  <p className="text-sm text-muted-foreground">
                    Prove claims cryptographically. Share only what you choose.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-accent/20 bg-card p-6">
              <div className="flex items-start gap-4">
                <Users className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Decentralized</h3>
                  <p className="text-sm text-muted-foreground">
                    No central database. Identity lives with you, encrypted and immutable.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-accent/20 bg-card p-6">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Safety-First</h3>
                  <p className="text-sm text-muted-foreground">
                    For journalists, activists, developers, and anyone requiring real privacy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Take Control of Your Identity</h2>
          <p className="text-lg text-muted-foreground">
            {isWalletConnected ? 'Your private identity layer is initialized.' : 'Private. Verifiable. Yours.'}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/5">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent">
                <span className="text-xs font-bold text-accent-foreground">σ</span>
              </div>
              <span className="font-bold">ShadowID</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {'© 2025. Built for privacy.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
