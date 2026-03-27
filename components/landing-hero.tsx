'use client'

import { Shield, Zap, Lock, ChevronDown, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { WalletMultiButton } from '@/components/wallet-button'
import { IDCardPreview } from '@/components/id-card-preview'

export function LandingHero() {
  const [expandedCore, setExpandedCore] = useState<number | null>(null)
  const [expandedPrivacy, setExpandedPrivacy] = useState<number | null>(null)

  const coreFeatures = [
    {
      num: 1,
      title: 'Initialize Identity',
      desc: 'Select and activate verifiable attributes (Age Range, Jurisdiction, Professional Title, etc.). Register cryptographic commitment on Aleo blockchain.'
    },
    {
      num: 2,
      title: 'Accrue Endorsements',
      desc: 'Collect peer attestations for claimed attributes. Shadow Score increases with verified endorsements, reflecting community-validated credibility.'
    },
    {
      num: 3,
      title: 'Generate Proofs',
      desc: 'Create selective disclosure proofs encoded as QR codes. Verify targeted claims without exposing identity or extraneous information.'
    }
  ]

  const privacyFeatures = [
    {
      title: 'Zero-Knowledge Cryptography',
      desc: 'Authenticate claims without disclosing underlying data. Attributes remain encrypted on device, inaccessible to external parties.'
    },
    {
      title: 'Decentralized Reputation',
      desc: 'Community-validated credibility independent of centralized systems. Shadow Score represents peer-verified attribute claims.'
    },
    {
      title: 'Granular Disclosure Control',
      desc: 'Expose only necessary attributes for specific verification scenarios. Age confirmation, professional status, or jurisdictional claims independently.'
    },
    {
      title: 'Immutable Verification Layer',
      desc: 'All identity commitments and endorsements recorded on Aleo blockchain. Permanent audit trail without centralized intermediary.'
    }
  ]

  return (
    <main>
      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center justify-center px-4 pt-20">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
                Verifiable Identity, Zero Exposure
              </h1>
              <p className="text-xl text-muted-foreground mb-8 text-balance">
                Control your identity data. Prove what matters without exposing everything. Register cryptographic commitments on Aleo blockchain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <WalletMultiButton />
                <Link href="/pricing">
                  <Button variant="outline" className="w-full sm:w-auto gap-2">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                Aleo Testnet • Zero-Knowledge Proofs • Peer Verified
              </p>
            </div>
            <div className="flex justify-center">
              <IDCardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
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

      {/* Core Process */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Core Process</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Establish verifiable identity credentials through decentralized peer verification and zero-knowledge cryptography.
          </p>

          <div className="space-y-3 max-w-2xl mx-auto">
            {coreFeatures.map((feature, idx) => (
              <div key={idx} className="border border-border rounded-lg overflow-hidden bg-background/50">
                <button
                  onClick={() => setExpandedCore(expandedCore === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 flex-shrink-0">
                      <span className="text-base font-bold text-accent">{feature.num}</span>
                    </div>
                    <h3 className="font-semibold text-lg text-left">{feature.title}</h3>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-accent flex-shrink-0 transition-transform duration-300 ${
                      expandedCore === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    expandedCore === idx ? 'max-h-40' : 'max-h-0'
                  }`}
                >
                  <p className="px-6 pb-6 text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy by Design */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Privacy by Design</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Full user control over identity data. Verify credibility without comprehensive data exposure.
          </p>

          <div className="space-y-3 max-w-2xl mx-auto">
            {privacyFeatures.map((feature, idx) => (
              <div key={idx} className="border border-border rounded-lg overflow-hidden bg-background/50">
                <button
                  onClick={() => setExpandedPrivacy(expandedPrivacy === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 hover:bg-accent/5 transition-colors"
                >
                  <h3 className="font-semibold text-lg text-left">{feature.title}</h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-accent flex-shrink-0 transition-transform duration-300 ${
                      expandedPrivacy === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    expandedPrivacy === idx ? 'max-h-40' : 'max-h-0'
                  }`}
                >
                  <p className="px-6 pb-6 text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
