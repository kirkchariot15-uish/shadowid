'use client'

import { useState, useEffect } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { WalletMultiButton } from '@provablehq/aleo-wallet-adaptor-react-ui'
import { Button } from '@/components/ui/button'
import { Lock, Wallet, Copy, Download, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function QRCodesPage() {
  const { isConnected, address } = useAleoWallet()
  const [qrCodes, setQrCodes] = useState<Array<{ id: string; label: string; data: string; date: string }>>([])
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (isConnected) {
      const commitment = localStorage.getItem('shadowid-photo-commitment')
      if (commitment) {
        setQrCodes([
          {
            id: 'identity-commitment',
            label: 'Identity Commitment',
            data: commitment,
            date: new Date().toLocaleDateString(),
          },
        ])
      }
    }
  }, [isConnected])

  const handleCopyQR = (data: string, id: string) => {
    navigator.clipboard.writeText(data)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDownloadQR = (data: string, label: string) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 300
    canvas.height = 300
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, 300, 300)

    ctx.fillStyle = 'black'
    ctx.font = 'bold 14px monospace'
    ctx.fillText('QR: ' + data.slice(0, 20), 20, 150)

    const link = document.createElement('a')
    link.href = canvas.toDataURL()
    link.download = `shadowid-qr-${label.toLowerCase().replace(/\s+/g, '-')}.png`
    link.click()
  }

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
            <h1 className="text-4xl font-bold mb-4">QR Codes – Wallet Required</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect your wallet to view and share your encrypted identity as scannable QR codes.
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
        <div className="mx-auto max-w-3xl">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">QR Code Manager</h1>
            <p className="text-lg text-muted-foreground">Share your encrypted identity commitments via QR codes.</p>
          </div>

          {qrCodes.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <RefreshCw className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No QR Codes Yet</h2>
              <p className="text-muted-foreground mb-6">Create an identity first to generate QR codes.</p>
              <Link href="/create-id">
                <Button className="rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground">
                  Create Identity
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {qrCodes.map((qr) => (
                <div key={qr.id} className="rounded-lg border border-border bg-card p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{qr.label}</h3>
                      <p className="text-xs text-muted-foreground/60 mt-1">{qr.date}</p>
                    </div>
                  </div>

                  {/* QR Code Visual Placeholder */}
                  <div className="bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/30 rounded-lg p-8 flex items-center justify-center mb-6">
                    <div className="w-48 h-48 bg-accent/20 rounded flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xs font-mono text-accent/60">QR Code</p>
                        <p className="text-xs font-mono text-accent/60 mt-2">{qr.data.slice(0, 12)}...</p>
                      </div>
                    </div>
                  </div>

                  {/* Data Display */}
                  <div className="bg-muted/5 rounded-lg p-4 mb-6 break-all">
                    <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">Encoded Data</p>
                    <p className="text-sm font-mono text-accent">{qr.data}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCopyQR(qr.data, qr.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border/50 hover:bg-muted/10 transition-colors text-sm font-semibold"
                    >
                      <Copy className="h-4 w-4" />
                      {copied === qr.id ? 'Copied!' : 'Copy Data'}
                    </button>
                    <button
                      onClick={() => handleDownloadQR(qr.data, qr.label)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border/50 hover:bg-muted/10 transition-colors text-sm font-semibold"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-12 p-4 rounded-lg border border-border/50 bg-muted/5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold">Privacy Note:</span> QR codes encode encrypted commitment hashes, not personal data. They can be shared safely and scanned without revealing your identity. Each QR represents a specific proof commitment.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
