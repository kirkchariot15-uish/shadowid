'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lock, Zap, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import { IDCardPreview } from '@/components/id-card-preview'

export function LandingHero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 mb-8">
          <span className="relative inline-block w-2 h-2 bg-accent rounded-full"></span>
          <span className="text-xs font-medium text-accent">Zero-Knowledge Identity</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
          Prove who you are
          <span className="text-accent"> without revealing why</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mb-10 text-balance leading-relaxed">
          ShadowID enables cryptographic proofs that verify your attributes on the blockchain, while keeping your identity completely private.
        </p>

        {/* ID Card Preview - Only render after mount to avoid SSR issues */}
        {mounted && <IDCardPreview />}
              {/* Glowing accent effect when connected */}
              {isConnected && (
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-accent rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/40 rounded-full blur-3xl" />
                </div>
              )}

              {/* Card Content */}
              <div className="relative p-8 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-xs uppercase tracking-widest font-semibold mb-1 transition-colors ${
                      isConnected ? 'text-accent/70' : 'text-muted-foreground/50'
                    }`}>
                      Private Identity Credential
                    </p>
                    <h3 className={`text-2xl font-black transition-colors ${
                      isConnected ? 'text-foreground' : 'text-muted-foreground/60'
                    }`}>
                      ShadowID
                    </h3>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                    isConnected 
                      ? 'bg-accent/20 border border-accent/40' 
                      : 'bg-muted/20 border border-border/40'
                  }`}>
                    <span className={`text-lg font-bold ${
                      isConnected ? 'text-accent' : 'text-muted-foreground/40'
                    }`}>
                      σ
                    </span>
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                {/* Identity Info */}
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground/60">
                    {isConnected ? 'Connected Wallet' : 'Connect Your Wallet'}
                  </p>
                  <p className={`font-mono text-sm font-semibold break-all ${
                    isConnected 
                      ? 'text-accent' 
                      : 'text-muted-foreground/40'
                  }`}>
                    {isConnected ? address?.substring(0, 12) + '...' : '••••••••••••••'}
                  </p>
                </div>

                <div className="h-px bg-border/50" />

                {/* Status */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="uppercase tracking-widest font-semibold">Status</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full transition-colors ${
                      isConnected ? 'bg-accent' : 'bg-muted-foreground/30'
                    }`} />
                    <span className={isConnected ? 'text-accent' : 'text-muted-foreground/50'}>
                      {isConnected ? 'Ready' : 'Waiting'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Status */}
        <div className="text-xs text-muted-foreground">
          Deployed on Aleo Testnet • shadowid_v2.aleo
        </div>
      </section>

      {/* Differentiators Section */}
      <section className="bg-card/50 py-20 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-start">
              <Shield className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-semibold text-lg mb-2">Cryptographic Privacy</h3>
              <p className="text-sm text-muted-foreground">
                Your data stays encrypted. Only commitments are verified on-chain.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <Zap className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-semibold text-lg mb-2">Selective Disclosure</h3>
              <p className="text-sm text-muted-foreground">
                Share specific attributes without revealing your complete identity.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <Lock className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-semibold text-lg mb-2">Verifiable On-Chain</h3>
              <p className="text-sm text-muted-foreground">
                Proofs are registered on Aleo blockchain for permanent verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Real Privacy, Real Use Cases</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            From journalists protecting sources to developers proving credentials, ShadowID enables privacy where it matters most.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Journalist */}
            <div className="border border-border rounded-lg p-8 bg-background/50 hover:border-accent/50 transition-colors">
              <h3 className="font-semibold text-lg mb-3">Journalists & Activists</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Prove your credentials and verify legitimate sources without exposing personal information that could put you at risk.
              </p>
              <div className="text-xs font-medium text-accent">Prove: Press credentials, employment verification</div>
            </div>

            {/* Developer */}
            <div className="border border-border rounded-lg p-8 bg-background/50 hover:border-accent/50 transition-colors">
              <h3 className="font-semibold text-lg mb-3">Developers</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Participate in DAOs and communities that require verified credentials without revealing your true identity.
              </p>
              <div className="text-xs font-medium text-accent">Prove: Skill level, past projects, community roles</div>
            </div>

            {/* Privacy Advocates */}
            <div className="border border-border rounded-lg p-8 bg-background/50 hover:border-accent/50 transition-colors">
              <h3 className="font-semibold text-lg mb-3">Privacy Advocates</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Reclaim your identity rights. Prove you meet requirements without surrendering personal data to corporations.
              </p>
              <div className="text-xs font-medium text-accent">Prove: Age, location, compliance without exposure</div>
            </div>

            {/* Enterprise */}
            <div className="border border-border rounded-lg p-8 bg-background/50 hover:border-accent/50 transition-colors">
              <h3 className="font-semibold text-lg mb-3">Enterprise & KYC</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Verify users meet regulatory requirements while minimizing data collection and compliance liability.
              </p>
              <div className="text-xs font-medium text-accent">Prove: Compliance, age verification, credentials</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12 px-4 mt-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <span className="text-sm font-bold text-accent-foreground">σ</span>
              </div>
              <span className="font-bold">ShadowID</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              © {new Date().getFullYear()} ShadowID. Zero-knowledge identity for everyone.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
