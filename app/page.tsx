'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, Eye, Users, Shield, Wallet, LockOpen } from 'lucide-react'

export default function Page() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)

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
                {/* Glow only when connected */}
                {isWalletConnected && (
                  <div className="absolute -inset-6 bg-gradient-to-r from-accent/40 to-accent/20 blur-2xl rounded-3xl opacity-40 animate-pulse"></div>
                )}

                {/* Card */}
                <div
                  className={`relative rounded-3xl p-10 shadow-2xl transition-all duration-300 ${
                    isWalletConnected
                      ? 'bg-gradient-to-b from-slate-900 to-slate-950 border border-accent/40'
                      : 'bg-card border border-border/50 opacity-60'
                  }`}
                >
                  {/* Top accent bar */}
                  {isWalletConnected && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent rounded-t-3xl"></div>
                  )}

                  {/* Branding */}
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <p className={`text-xs uppercase tracking-widest font-semibold ${
                        isWalletConnected ? 'text-accent/60' : 'text-muted-foreground/50'
                      }`}>
                        {isWalletConnected ? 'Private Identity' : 'Locked'}
                      </p>
                      <h3 className="text-3xl font-black text-foreground mt-1">ShadowID</h3>
                    </div>
                    {isWalletConnected ? (
                      <LockOpen className="h-6 w-6 text-accent/80" />
                    ) : (
                      <Lock className="h-6 w-6 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Main identifier display */}
                  <div
                    className={`mb-10 p-6 rounded-xl transition-all ${
                      isWalletConnected
                        ? 'bg-accent/5 border border-accent/30'
                        : 'bg-muted/30 border border-border/30'
                    }`}
                  >
                    <p className={`text-xs uppercase tracking-widest font-semibold mb-3 ${
                      isWalletConnected ? 'text-accent/70' : 'text-muted-foreground/50'
                    }`}>
                      Identity Hash
                    </p>
                    {isWalletConnected ? (
                      <p className="text-4xl font-black text-accent tracking-wider font-mono">
                        σ••••••••
                      </p>
                    ) : (
                      <p className="text-4xl font-black text-muted-foreground/30 tracking-wider font-mono">
                        ••••••••
                      </p>
                    )}
                  </div>

                  {/* Compact metadata */}
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className={isWalletConnected ? 'text-muted-foreground' : 'text-muted-foreground/50'}>
                        Network
                      </span>
                      <span className={`font-semibold ${
                        isWalletConnected ? 'text-foreground' : 'text-muted-foreground/40'
                      }`}>
                        {isWalletConnected ? 'Aleo' : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className={isWalletConnected ? 'text-muted-foreground' : 'text-muted-foreground/50'}>
                        Privacy Mode
                      </span>
                      <span className={`font-semibold ${
                        isWalletConnected ? 'text-accent' : 'text-muted-foreground/40'
                      }`}>
                        {isWalletConnected ? 'Active' : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom message */}
                  <div className="h-px bg-gradient-to-r from-accent/10 to-transparent mb-4"></div>
                  <p className={`text-xs text-center ${
                    isWalletConnected
                      ? 'text-muted-foreground/60'
                      : 'text-muted-foreground/40'
                  }`}>
                    {isWalletConnected
                      ? 'Fully encrypted · No personal data'
                      : 'Connect wallet to activate'}
                  </p>
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
                          ? 'border-accent/30 bg-accent/10 hover:border-accent/60 hover:bg-accent/15'
                          : 'border-border/50 bg-muted/20 opacity-50'
                      }`}
                    >
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                        isWalletConnected ? 'bg-accent' : 'bg-muted-foreground/30'
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        isWalletConnected ? 'text-foreground' : 'text-muted-foreground/50'
                      }`}>
                        {fact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wallet requirement message */}
              {!isWalletConnected && (
                <div className="mt-8 p-4 rounded-lg border border-accent/20 bg-accent/5">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-accent">Wallet required</span> to activate private identity features. Connect a wallet to proceed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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
          <p className="text-lg text-muted-foreground mb-8">
            {isWalletConnected ? 'Your private identity is ready.' : 'Private. Verifiable. Yours.'}
          </p>
          {!isWalletConnected && (
            <Button
              onClick={() => setIsWalletConnected(true)}
              size="lg"
              className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              Connect Wallet
            </Button>
          )}
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
              © 2025. Built for privacy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
              <div className="relative w-full max-w-md">
                {/* Enhanced glow */}
                <div className="absolute -inset-6 bg-gradient-to-r from-accent/40 to-accent/20 blur-2xl rounded-3xl opacity-40 animate-pulse"></div>
                
                {/* Card */}
                <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border border-accent/40 rounded-3xl p-10 shadow-2xl">
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent rounded-t-3xl"></div>

                  {/* Branding */}
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <p className="text-xs text-accent/60 uppercase tracking-widest font-semibold">Private Identity</p>
                      <h3 className="text-3xl font-black text-foreground mt-1">ShadowID</h3>
                    </div>
                    <Lock className="h-6 w-6 text-accent/80" />
                  </div>

                  {/* Main identifier display - the hero */}
                  <div className="mb-10 p-6 bg-accent/5 border border-accent/30 rounded-xl">
                    <p className="text-xs text-accent/70 uppercase tracking-widest font-semibold mb-3">Identity Hash</p>
                    <p className="text-4xl font-black text-accent tracking-wider font-mono">
                      σ••••••••
                    </p>
                  </div>

                  {/* Compact metadata */}
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Network</span>
                      <span className="text-foreground font-semibold">Aleo</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Proof Mode</span>
                      <span className="text-accent font-semibold">Zero-Knowledge</span>
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div className="h-px bg-gradient-to-r from-accent/10 to-transparent mb-4"></div>
                  <p className="text-xs text-muted-foreground/60 text-center">Fully encrypted · No personal data</p>
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
                <p className="text-sm font-semibold text-accent uppercase tracking-widest mb-5">You can prove:</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Over 18', 'Verified Contributor', 'DAO Member', 'Credential Holder'].map((fact) => (
                    <div
                      key={fact}
                      className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 hover:border-accent/60 hover:bg-accent/15 transition-colors"
                    >
                      <div className="h-2 w-2 rounded-full bg-accent flex-shrink-0"></div>
                      <span className="text-sm font-medium text-foreground">{fact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            {/* Step 1 */}
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 border border-accent/30 mb-4">
                <span className="text-lg font-bold text-accent">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect your Aleo wallet to begin. This becomes your identity foundation—completely private.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 border border-accent/30 mb-4">
                <span className="text-lg font-bold text-accent">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Generate Private Identity</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create attributes tied to your wallet. Your data stays encrypted locally. Nothing is broadcast.
              </p>
            </div>

            {/* Step 3 */}
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
          <p className="text-lg text-muted-foreground mb-8">
            Private. Verifiable. Yours.
          </p>
          <Button
            size="lg"
            className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
          >
            Get Started Today
          </Button>
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
              © 2025. Built for privacy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
