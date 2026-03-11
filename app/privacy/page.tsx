'use client'

import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Shield, Lock, Eye, Database } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Your Privacy Matters</h1>
          <p className="text-lg text-muted-foreground">
            ShadowID is built on the principle of data privacy and user control. Your identity data stays encrypted and under your control at all times.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="border border-border rounded-lg p-8 bg-card/50">
            <Shield className="w-8 h-8 text-accent mb-4" />
            <h2 className="text-xl font-semibold mb-3">Zero-Knowledge Proofs</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your attributes are never shared directly. We use cryptographic zero-knowledge proofs to verify claims without revealing the underlying data.
            </p>
          </div>

          <div className="border border-border rounded-lg p-8 bg-card/50">
            <Lock className="w-8 h-8 text-accent mb-4" />
            <h2 className="text-xl font-semibold mb-3">Local Encryption</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your credential data is encrypted locally on your device. Only encrypted commitment hashes are stored on the Aleo blockchain.
            </p>
          </div>

          <div className="border border-border rounded-lg p-8 bg-card/50">
            <Eye className="w-8 h-8 text-accent mb-4" />
            <h2 className="text-xl font-semibold mb-3">Selective Disclosure</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You decide exactly what to share. Generate QR codes proving specific attributes without revealing your full identity or other data.
            </p>
          </div>

          <div className="border border-border rounded-lg p-8 bg-card/50">
            <Database className="w-8 h-8 text-accent mb-4" />
            <h2 className="text-xl font-semibold mb-3">Blockchain Verified</h2>
            <p className="text-sm text-muted-foreground mb-4">
              All identity commitments are stored on the Aleo blockchain, making them verifiable without a central authority.
            </p>
          </div>
        </div>

        <div className="border border-border rounded-lg p-8 bg-card/30 mb-12">
          <h2 className="text-2xl font-semibold mb-6">Data You Control</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-1">
                <span className="text-xs font-bold text-accent">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Your Attributes</h3>
                <p className="text-sm text-muted-foreground">You choose which attributes to create (age range, location, job title, etc.) and which to activate.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-1">
                <span className="text-xs font-bold text-accent">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Who Endorses You</h3>
                <p className="text-sm text-muted-foreground">You control who can endorse your attributes. Build your Shadow Score through peer verification.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-1">
                <span className="text-xs font-bold text-accent">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">What You Share</h3>
                <p className="text-sm text-muted-foreground">Generate selective disclosure proofs showing only the specific attributes you want to prove.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-1">
                <span className="text-xs font-bold text-accent">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Your Wallet</h3>
                <p className="text-sm text-muted-foreground">Your private wallet keys are never shared with ShadowID. You remain in full control of your blockchain interactions.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-lg p-8 bg-background/50 mb-12">
          <h2 className="text-2xl font-semibold mb-4">We Don't Store</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent mr-2">✗</span>
              <span>Your actual personal data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mr-2">✗</span>
              <span>Login credentials</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mr-2">✗</span>
              <span>Your wallet private keys</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mr-2">✗</span>
              <span>Location history</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mr-2">✗</span>
              <span>Behavioral tracking data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mr-2">✗</span>
              <span>Marketing profiles</span>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Own Your Identity?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create your ShadowID today and start building a verifiable, private identity on the Aleo blockchain.
          </p>
          <a href="/create-identity">
            <Button size="lg">Create Your ShadowID</Button>
          </a>
        </div>
      </div>
    </main>
  )
}
