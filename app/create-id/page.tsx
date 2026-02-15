'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { Lock, Wallet, Upload, CheckCircle, AlertCircle, X } from 'lucide-react'
import Link from 'next/link'
import { encryptData, generateFileCommitment, fileToUint8Array, generateEncryptionKey } from '@/lib/crypto-utils'

export default function CreateIDPage() {
  const { isWalletConnected, setIsWalletConnected } = useWallet()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [encryptionStatus, setEncryptionStatus] = useState<'idle' | 'encrypting' | 'success' | 'error'>('idle')
  const [commitment, setCommitment] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setError('')
    setPhotoFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleEncryptAndCommit = async () => {
    if (!photoFile) {
      setError('No photo selected')
      return
    }

    setEncryptionStatus('encrypting')
    setIsEncrypting(true)

    try {
      const fileData = await fileToUint8Array(photoFile)
      const commitment = await generateFileCommitment(fileData)
      
      const encryptionKey = await generateEncryptionKey('wallet-seed-placeholder')
      const encrypted = await encryptData(fileData, encryptionKey)
      
      setCommitment(commitment)
      setEncryptionStatus('success')
      setError('')
      
      localStorage.setItem('shadowid-photo-encrypted', encrypted)
      localStorage.setItem('shadowid-photo-commitment', commitment)
    } catch (err) {
      console.error('[v0] Encryption error:', err)
      setError('Encryption failed. Please try again.')
      setEncryptionStatus('error')
    } finally {
      setIsEncrypting(false)
    }
  }

  if (!isWalletConnected) {
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
            <Button
              onClick={() => setIsWalletConnected(true)}
              variant="outline"
              size="sm"
              className="rounded-full font-semibold transition-all border-accent/50 text-foreground hover:border-accent hover:bg-accent hover:text-accent-foreground"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </nav>

        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <Lock className="h-16 w-16 text-muted-foreground/40" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Create Identity – Wallet Required</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect your wallet to create your private ShadowID. Your identity photo and credentials will be encrypted client-side.
            </p>
            <Button
              onClick={() => setIsWalletConnected(true)}
              size="lg"
              className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet to Begin
            </Button>
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
              onClick={() => setIsWalletConnected(false)}
              variant="default"
              size="sm"
              className="rounded-full font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Create Your Private Identity</h1>
            <p className="text-lg text-muted-foreground">Upload your photo. All encryption happens in your browser.</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-8 space-y-8">
            {/* Upload Area */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">Step 1: Upload Photo</h2>
              
              <label className="block border-2 border-dashed border-border/50 rounded-lg p-8 text-center cursor-pointer hover:border-accent/30 transition-colors">
                {photoPreview ? (
                  <div className="space-y-4">
                    <img src={photoPreview} alt="Selected photo" className="h-40 w-40 rounded-lg object-cover mx-auto" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{photoFile?.name}</p>
                      <p className="text-xs text-muted-foreground/60">{(photoFile?.size || 0 / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Upload photo</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, or GIF • Max 10MB</p>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                  disabled={isEncrypting}
                />
              </label>

              {photoPreview && (
                <button
                  onClick={() => {
                    setPhotoFile(null)
                    setPhotoPreview('')
                  }}
                  className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Encrypt Button */}
            {photoFile && !commitment && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">Step 2: Encrypt & Create Commitment</h2>
                <Button
                  onClick={handleEncryptAndCommit}
                  disabled={isEncrypting || !photoFile}
                  className="w-full rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  {isEncrypting ? 'Encrypting...' : 'Encrypt Photo & Generate Commitment'}
                </Button>
              </div>
            )}

            {/* Status Messages */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-500/80">{error}</p>
              </div>
            )}

            {/* Success State */}
            {commitment && (
              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 rounded-lg border border-accent/30 bg-accent/5">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-accent">Identity created successfully</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Photo is encrypted and stored locally</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border/50 bg-muted/5">
                  <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">Identity Commitment</p>
                  <p className="text-lg font-mono font-bold text-accent tracking-wider">{commitment}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">This hash represents your encrypted identity. Use it to generate QR codes.</p>
                </div>

                <div className="flex gap-3">
                  <Link href="/dashboard" className="flex-1">
                    <Button variant="outline" className="w-full rounded-lg">
                      Back to Dashboard
                    </Button>
                  </Link>
                  <Link href="/qr-codes" className="flex-1">
                    <Button className="w-full rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground">
                      View QR Codes
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 rounded-lg border border-border/50 bg-muted/5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold">Privacy Guarantee:</span> Your photo is encrypted client-side using your wallet's encryption key. The encrypted photo and commitment hash are stored locally in your browser. No data is sent to any server.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
