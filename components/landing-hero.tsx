'use client'

// Force cache invalidation - v2.1
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lock, Zap, Shield } from 'lucide-react'
import { WalletMultiButton } from '@/components/wallet-button'
import { IDCardPreview } from '@/components/id-card-preview'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { ArrowRight } from 'lucide-react'

export function LandingHero() {
  const { address } = useAleoWallet()
  const isConnected = !!address

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Wallet Button - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <WalletMultiButton />
      </div>

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

        {/* ID Card Preview - Interactive with wallet connection */}
        <IDCardPreview />

        {/* Show text when not connected, button when connected */}
        <div className="mt-8">
          {!isConnected ? (
            <p className="text-xs text-muted-foreground">
              Zero-knowledge secured via Aleo Testnet
            </p>
          ) : (
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>

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

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Real Privacy, Real Use Cases</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            From journalists protecting sources to developers proving credentials, ShadowID enables privacy where it matters most.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-border rounded-lg p-8 bg-background/50 hover:border-accent/50 transition-colors">
              <h3 className="font-semibold text-lg mb-3">Journalists & Activists</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Prove your credentials and verify legitimate sources without exposing personal information that could put you at risk.
              </p>
              <div className="text-xs font-medium text-accent">Prove: Press credentials, employment verification</div>
            </div>

            <div className="border border-border rounded-lg p-8 bg-background/50 hover:border-accent/50 transition-colors">
              <h3 className="font-semibold text-lg mb-3">Developers</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Participate in DAOs and communities that require verified credentials without revealing your true identity.
              </p>
              <div className="text-xs font-medium text-accent">Prove: Skill level, past projects, community roles</div>
            </div>

            <div className="border border-border rounded-lg p-8 bg-background/50 hover:border-accent/50 transition-colors">
              <h3 className="font-semibold text-lg mb-3">Privacy Advocates</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Reclaim your identity rights. Prove you meet requirements without surrendering personal data to corporations.
              </p>
              <div className="text-xs font-medium text-accent">Prove: Age, location, compliance without exposure</div>
            </div>

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

      <footer className="border-t border-border bg-gradient-to-b from-background to-card/30 py-16 px-4 mt-auto">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                  <span className="text-sm font-bold text-accent-foreground">σ</span>
                </div>
                <span className="font-bold text-lg">ShadowID</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Privacy-first zero-knowledge identity on Aleo blockchain.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-semibold text-sm mb-4 text-foreground">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-xs text-muted-foreground hover:text-accent transition-colors">Features</a></li>
                <li><a href="#" className="text-xs text-muted-foreground hover:text-accent transition-colors">How It Works</a></li>
                <li><a href="#" className="text-xs text-muted-foreground hover:text-accent transition-colors">Use Cases</a></li>
                <li><a href="#" className="text-xs text-muted-foreground hover:text-accent transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Developers Links */}
            <div>
              <h3 className="font-semibold text-sm mb-4 text-foreground">Developers</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-xs text-muted-foreground hover:text-accent transition-colors">Documentation</a></li>
                <li><a href="#" className="text-xs text-muted-foreground hover:text-accent transition-colors">GitHub</a></li>
                <li><a href="#" className="text-xs text-muted-foreground hover:text-accent transition-colors">Contracts</a></li>
                <li><a href="#" className="text-xs text-muted-foreground hover:text-accent transition-colors">API Reference</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold text-sm mb-4 text-foreground">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-xs text-muted-foreground hover:text-accent transition-colors">About</a></li>
                <li><a href="#" className="text-xs text-muted-foreground hover:text-accent transition-colors">Blog</a></li>
                <li><a href="#" className="text-xs text-muted-foreground hover:text-accent transition-colors">Privacy</a></li>
                <li><a href="#" className="text-xs text-muted-foreground hover:text-accent transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/50 my-8"></div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} ShadowID. Zero-knowledge identity for everyone.
            </p>
            
            {/* Social Links / Status */}
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs text-muted-foreground hover:text-accent transition-colors flex items-center gap-1">
                <span>Status</span>
              </a>
              <a href="#" className="text-xs text-muted-foreground hover:text-accent transition-colors flex items-center gap-1">
                <span>Twitter</span>
              </a>
              <a href="#" className="text-xs text-muted-foreground hover:text-accent transition-colors flex items-center gap-1">
                <span>Discord</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
