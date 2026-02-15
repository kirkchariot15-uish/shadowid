'use client'

import { useState } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { WalletMultiButton } from '@/components/wallet-button'
import { Button } from '@/components/ui/button'
import { Lock, Wallet, Eye, EyeOff, Copy, Share2 } from 'lucide-react'
import Link from 'next/link'

export default function SelectiveDisclosurePage() {
  const { isConnected, address } = useAleoWallet()
  const [revealedAttributes, setRevealedAttributes] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const attributes = [
    {
      key: 'full-name',
      label: 'Full Name',
      category: 'Personal',
      value: 'Alex Morgan',
      masked: '••••••••••••',
      description: 'Your legal identity name',
    },
    {
      key: 'role',
      label: 'Role / Title',
      category: 'Professional',
      value: 'Software Engineer',
      masked: '•••••••••••••••',
      description: 'Your professional role or title',
    },
    {
      key: 'credential-type',
      label: 'Credential Type',
      category: 'Credentials',
      value: 'Verified Contributor',
      masked: '•••••••••',
      description: 'Your credential category',
    },
    {
      key: 'age-range',
      label: 'Age Range',
      category: 'Verification',
      value: '25-35',
      masked: '••',
      description: 'Your age category (not exact age)',
    },
    {
      key: 'dao-member',
      label: 'DAO Membership',
      category: 'Credentials',
      value: 'Active Member',
      masked: '••••••••',
      description: 'Your DAO membership status',
    },
    {
      key: 'verification-status',
      label: 'Verification Status',
      category: 'Status',
      value: 'Verified',
      masked: '••••••••',
      description: 'Your verification level',
    },
  ]

  const toggleAttribute = (key: string) => {
    setRevealedAttributes(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleCopyAttribute = (key: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const categories = ['Personal', 'Professional', 'Credentials', 'Verification', 'Status']

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <span className="text-sm font-bold text-accent-foreground">σ</span>
              </div>
              <span className="text-lg font-bold">ShadowID</span>
            </Link>
            <div className="wallet-button-wrapper">
              <WalletMultiButton />
            </div>
          </div>
        </nav>

        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <Lock className="h-16 w-16 text-muted-foreground/40" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Selective Disclosure – Wallet Required</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect your wallet to selectively reveal identity attributes without exposing unnecessary information.
            </p>
            <div className="flex justify-center">
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-accent-foreground">σ</span>
            </div>
            <span className="text-lg font-bold">ShadowID</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full font-semibold border-accent/50 text-foreground hover:border-accent hover:bg-accent/5"
              >
                Dashboard
              </Button>
            </Link>
            <Button
              disabled
              size="sm"
              className="rounded-full font-semibold bg-accent/50 text-accent-foreground cursor-not-allowed"
            >
              Connected: {address?.slice(0, 8)}...
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Selective Disclosure</h1>
            <p className="text-lg text-muted-foreground">Reveal individual attributes without exposing your complete identity. All operations happen locally in your browser.</p>
          </div>

          {/* Info Banner */}
          <div className="mb-8 p-4 rounded-lg border border-accent/30 bg-accent/5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Click the eye icon to reveal any attribute locally. Your data never leaves your browser. Each revealed attribute can be copied independently or shared via QR code.
            </p>
          </div>

          {/* Attributes by Category */}
          {categories.map((category) => {
            const categoryAttributes = attributes.filter(attr => attr.category === category)
            if (categoryAttributes.length === 0) return null

            return (
              <div key={category} className="mb-12">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">{category}</h2>
                <div className="space-y-3">
                  {categoryAttributes.map((attr) => (
                    <div
                      key={attr.key}
                      className="rounded-lg border border-border bg-card p-6 hover:bg-muted/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground mb-1">{attr.label}</h3>
                          <p className="text-xs text-muted-foreground/60 mb-3">{attr.description}</p>
                          <p className={`text-sm font-mono transition-colors ${
                            revealedAttributes[attr.key] ? 'text-accent font-bold' : 'text-muted-foreground/50'
                          }`}>
                            {revealedAttributes[attr.key] ? attr.value : attr.masked}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Reveal Toggle */}
                          <button
                            onClick={() => toggleAttribute(attr.key)}
                            className="p-2 hover:bg-accent/10 rounded transition-colors"
                            title={revealedAttributes[attr.key] ? 'Hide attribute' : 'Reveal attribute'}
                          >
                            {revealedAttributes[attr.key] ? (
                              <Eye className="h-5 w-5 text-accent" />
                            ) : (
                              <EyeOff className="h-5 w-5 text-muted-foreground/60" />
                            )}
                          </button>

                          {/* Copy Button - Only enabled when revealed */}
                          {revealedAttributes[attr.key] && (
                            <button
                              onClick={() => handleCopyAttribute(attr.key, attr.value)}
                              className="p-2 hover:bg-accent/10 rounded transition-colors"
                              title="Copy value"
                            >
                              <Copy className="h-5 w-5 text-muted-foreground/60 hover:text-accent" />
                            </button>
                          )}

                          {/* Share QR - Only enabled when revealed */}
                          {revealedAttributes[attr.key] && (
                            <button
                              className="p-2 hover:bg-accent/10 rounded transition-colors"
                              title="Share as QR code"
                            >
                              <Share2 className="h-5 w-5 text-muted-foreground/60 hover:text-accent" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Copy Confirmation */}
                      {copied === attr.key && (
                        <p className="text-xs text-accent mt-3">Copied to clipboard</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Privacy Explanation */}
          <div className="mt-16 p-6 rounded-lg border border-border/50 bg-card space-y-4">
            <h3 className="text-sm font-semibold text-foreground">How Selective Disclosure Works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold mt-0.5">1.</span>
                <span>Click the eye icon to reveal any attribute. Revelation happens only in your browser.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold mt-0.5">2.</span>
                <span>Copy individual attributes to share with third parties securely.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold mt-0.5">3.</span>
                <span>Generate QR codes for each attribute to share without exposing other data.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold mt-0.5">4.</span>
                <span>All operations are zero-knowledge compliant. Verifiers see only what you choose to reveal.</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
