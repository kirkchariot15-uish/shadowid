'use client'

import { Button } from '@/components/ui/button'
import { Lock, Eye, Users, Shield } from 'lucide-react'

export default function Page() {
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
            variant="outline"
            size="sm"
            className="rounded-full border-accent/50 text-foreground hover:border-accent hover:bg-accent hover:text-accent-foreground"
          >
            Connect Wallet
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
              size="lg"
              className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              Get Started
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
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-border bg-gradient-to-b from-secondary/5 to-background">
        <div className="mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Card Display */}
            <div className="flex justify-center md:justify-end">
              <div className="relative w-full max-w-sm">
                {/* Glow effect background */}
                <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-2xl opacity-30 animate-pulse"></div>
                
                {/* Card */}
                <div className="relative bg-gradient-to-br from-card to-secondary border border-accent/20 rounded-2xl p-8 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Identity Artifact</p>
                      <h3 className="text-2xl font-bold">ShadowID</h3>
                    </div>
                    <Lock className="h-5 w-5 text-accent" />
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-accent/20 to-transparent mb-6"></div>

                  {/* Identity Info */}
                  <div className="space-y-4 mb-8">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                      <p className="text-sm font-medium text-foreground">Private Identity</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Network</p>
                      <p className="text-sm font-medium text-foreground">Aleo</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Proof Mode</p>
                      <p className="text-sm font-medium text-foreground">Zero-Knowledge</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Identifier</p>
                      <p className="text-sm font-mono font-medium text-accent">**** **** ****</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="h-px bg-gradient-to-r from-transparent to-accent/20 mb-4"></div>
                  <p className="text-xs text-muted-foreground text-center">No personal data stored · Fully encrypted</p>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div>
              <h2 className="text-3xl font-bold mb-4">Your Private Identity Card</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                ShadowID generates a cryptographic identity artifact—not an account, not a profile. It's a proof primitive that lives with you, encrypted and under your control.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                You never reveal who you are. Instead, you prove specific claims about yourself using zero-knowledge cryptography. Only the facts you choose to share are verified.
              </p>

              {/* Provable Facts */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-4">Examples of provable facts:</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Over 18', 'Verified Contributor', 'DAO Member', 'Credential Holder'].map((fact) => (
                    <div
                      key={fact}
                      className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"></div>
                      <span className="text-sm text-foreground">{fact}</span>
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
              <p className="text-muted-foreground leading-relaxed mb-4">
                Traditional identity systems require you to choose between trust and privacy. You either hand over all your data to centralized institutions, or you get treated as anonymous and unverifiable.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This creates surveillance, enables discrimination, and puts dissidents, journalists, and privacy-conscious people at risk.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">The Solution</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                ShadowID uses zero-knowledge cryptography to let you prove specific attributes about yourself without revealing unnecessary information. You control your identity. No one—not even ShadowID—holds your data.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Built on Aleo, a privacy-focused blockchain, it enables verification without surveillance. Real identity for a private world.
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
          <h2 className="text-3xl font-bold mb-12 text-center">Core Principles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Principle 1 */}
            <div className="rounded-lg border border-accent/20 bg-card p-6">
              <div className="flex items-start gap-4">
                <Lock className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2 text-lg">User-Owned Identity</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You own your identity. No central authority can revoke, modify, or censor it. Your wallet is your custody.
                  </p>
                </div>
              </div>
            </div>

            {/* Principle 2 */}
            <div className="rounded-lg border border-accent/20 bg-card p-6">
              <div className="flex items-start gap-4">
                <Eye className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Zero-Knowledge by Default</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Verification happens without data transfer. Prove claims cryptographically. Share nothing you don't choose to share.
                  </p>
                </div>
              </div>
            </div>

            {/* Principle 3 */}
            <div className="rounded-lg border border-accent/20 bg-card p-6">
              <div className="flex items-start gap-4">
                <Users className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2 text-lg">No Centralized Database</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Identity is not stored on servers. It lives with you, encrypted, immutable, and impossible to breach.
                  </p>
                </div>
              </div>
            </div>

            {/* Principle 4 */}
            <div className="rounded-lg border border-accent/20 bg-card p-6">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Safety-First Design</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Built for real-world safety. Journalists, activists, developers, and privacy-conscious people can verify themselves without exposure.
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
          <h2 className="text-3xl font-bold mb-4 text-balance">
            Take Control of Your Identity
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            ShadowID is the identity primitive for a private, decentralized future.
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
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent">
                  <span className="text-xs font-bold text-accent-foreground">σ</span>
                </div>
                <span className="font-bold">ShadowID</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Self-sovereign identity on Aleo
              </p>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p>
                Your privacy is fundamental. ShadowID proves it without compromising it.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-xs text-muted-foreground text-center">
            <p>© 2025 ShadowID. Built for privacy. Built to last.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
