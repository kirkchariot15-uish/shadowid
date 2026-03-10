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
          Your Identity
          <span className="text-accent"> Your Control. Peer Verified.</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mb-10 text-balance leading-relaxed">
          Create a zero-knowledge identity with peer endorsements. Build credibility on the Aleo blockchain while keeping your data private. Share selective proofs without revealing everything.
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
          <h2 className="text-3xl font-bold mb-4 text-center">How It Works</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Build verifiable credibility on the blockchain through peer attestation and selective disclosure.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-border rounded-lg p-8 bg-background/50">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 mb-4">
                <span className="text-xl font-bold text-accent">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-3">Create Identity</h3>
              <p className="text-sm text-muted-foreground">
                Select attributes you want to claim (Age Range, Country, Job Title, etc.) and register your commitment on the Aleo blockchain.
              </p>
            </div>

            <div className="border border-border rounded-lg p-8 bg-background/50">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 mb-4">
                <span className="text-xl font-bold text-accent">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-3">Get Endorsed</h3>
              <p className="text-sm text-muted-foreground">
                Peers endorse your attributes. Each endorsement increases your Shadow Score (0-100). Build community-verified credibility.
              </p>
            </div>

            <div className="border border-border rounded-lg p-8 bg-background/50">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 mb-4">
                <span className="text-xl font-bold text-accent">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-3">Prove Selectively</h3>
              <p className="text-sm text-muted-foreground">
                Generate cryptographic proofs as QR codes proving specific attributes without revealing your identity or other data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Built For Real Privacy</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            ShadowID gives you control over your identity data. Prove what matters without exposing everything.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-border rounded-lg p-8 bg-background/50 hover:border-accent/50 transition-colors">
              <h3 className="font-semibold text-lg mb-3">Zero-Knowledge Proofs</h3>
              <p className="text-sm text-muted-foreground">
                Verify claims about yourself without revealing the underlying data. Your attributes stay encrypted locally.
              </p>
            </div>

            <div className="border border-border rounded-lg p-8 bg-background/50 hover:border-accent/50 transition-colors">
              <h3 className="font-semibold text-lg mb-3">Peer-Verified Credibility</h3>
              <p className="text-sm text-muted-foreground">
                Build trust through community endorsements. Shadow Score reflects your verified credibility on-chain.
              </p>
            </div>

            <div className="border border-border rounded-lg p-8 bg-background/50 hover:border-accent/50 transition-colors">
              <h3 className="font-semibold text-lg mb-3">Selective Disclosure</h3>
              <p className="text-sm text-muted-foreground">
                Share specific attributes without revealing your full identity. Perfect for age verification or employment checks.
              </p>
            </div>

            <div className="border border-border rounded-lg p-8 bg-background/50 hover:border-accent/50 transition-colors">
              <h3 className="font-semibold text-lg mb-3">Blockchain Verified</h3>
              <p className="text-sm text-muted-foreground">
                All identities and endorsements are registered on the Aleo blockchain for permanent, transparent verification.
              </p>
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
