'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lock, Zap, Shield, ArrowRight } from 'lucide-react'

export function LandingHero() {
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

        <div className="flex gap-4 justify-center mb-16">
          <Link href="/dashboard">
            <Button size="lg" className="h-12 px-8 gap-2">
              Create ShadowID
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="h-12 px-8">
            View Docs
          </Button>
        </div>

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

      {/* CTA Section */}
      <section className="bg-accent/10 border-t border-border py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for true privacy?</h2>
          <p className="text-muted-foreground mb-8">
            Start creating your zero-knowledge identity today. No personal data required.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="h-12 px-8">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
