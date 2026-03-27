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
                Personal data remains encrypted locally. Blockchain verification operates exclusively on cryptographic commitments, not raw attributes.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <Zap className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-semibold text-lg mb-2">Selective Attribute Disclosure</h3>
              <p className="text-sm text-muted-foreground">
                Prove specific claims without exposing complete identity. Share only the information required for verification.
              </p>
            </div>

            <div className="flex flex-col items-start">
              <Lock className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-semibold text-lg mb-2">Blockchain Attestation</h3>
              <p className="text-sm text-muted-foreground">
                All identity commitments are recorded on the Aleo blockchain for immutable, transparent verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Core Process</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Establish verifiable identity credentials through decentralized peer verification and zero-knowledge cryptography.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-border rounded-lg p-8 bg-background/50">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 mb-4">
                <span className="text-xl font-bold text-accent">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-3">Initialize Identity</h3>
              <p className="text-sm text-muted-foreground">
                Select and activate verifiable attributes (Age Range, Jurisdiction, Professional Title, etc.). Register cryptographic commitment on Aleo blockchain.
              </p>
            </div>

            <div className="border border-border rounded-lg p-8 bg-background/50">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 mb-4">
                <span className="text-xl font-bold text-accent">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-3">Accrue Endorsements</h3>
              <p className="text-sm text-muted-foreground">
                Collect peer attestations for claimed attributes. Shadow Score increases with verified endorsements, reflecting community-validated credibility.
              </p>
            </div>

            <div className="border border-border rounded-lg p-8 bg-background/50">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 mb-4">
                <span className="text-xl font-bold text-accent">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-3">Generate Proofs</h3>
              <p className="text-sm text-muted-foreground">
                Create selective disclosure proofs encoded as QR codes. Verify targeted claims without exposing identity or extraneous information.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Privacy by Design</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Full user control over identity data. Verify credibility without comprehensive data exposure.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-border rounded-lg p-8 bg-background/50 hover:border-accent/50 transition-colors">
              <h3 className="font-semibold text-lg mb-3">Zero-Knowledge Cryptography</h3>
              <p className="text-sm text-muted-foreground">
                Authenticate claims without disclosing underlying data. Attributes remain encrypted on device, inaccessible to external parties.
              </p>
            </div>

            <div className="border border-border rounded-lg p-8 bg-background/50 hover:border-accent/50 transition-colors">
              <h3 className="font-semibold text-lg mb-3">Decentralized Reputation</h3>
              <p className="text-sm text-muted-foreground">
                Community-validated credibility independent of centralized systems. Shadow Score represents peer-verified attribute claims.
              </p>
            </div>

            <div className="border border-border rounded-lg p-8 bg-background/50 hover:border-accent/50 transition-colors">
              <h3 className="font-semibold text-lg mb-3">Granular Disclosure Control</h3>
              <p className="text-sm text-muted-foreground">
                Expose only necessary attributes for specific verification scenarios. Age confirmation, professional status, or jurisdictional claims independently.
              </p>
            </div>

            <div className="border border-border rounded-lg p-8 bg-background/50 hover:border-accent/50 transition-colors">
              <h3 className="font-semibold text-lg mb-3">Immutable Verification Layer</h3>
              <p className="text-sm text-muted-foreground">
                All identity commitments and endorsements recorded on Aleo blockchain. Permanent audit trail without centralized intermediary.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
