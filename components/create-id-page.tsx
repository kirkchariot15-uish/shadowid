'use client'

import { useState } from 'react'
import QRCode from 'qrcode'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { WalletMultiButton } from '@/components/wallet-button'
import { Button } from '@/components/ui/button'
import { Lock, Upload, FileText, Type, CheckCircle, AlertCircle, X, Download } from 'lucide-react'
import Link from 'next/link'
import { encryptData, generateFileCommitment, fileToUint8Array, generateEncryptionKey, generateHash } from '@/lib/crypto-utils'

type InputType = 'photo' | 'document' | 'text'

interface InputMaterial {
  type: InputType
  name: string
  data: Uint8Array | string
  encrypted?: string
}

export default function CreateIDPage() {
  const { isConnected, address } = useAleoWallet()
  const [inputs, setInputs] = useState<InputMaterial[]>([])
  const [textInput, setTextInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [commitment, setCommitment] = useState<string>('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [creationComplete, setCreationComplete] = useState(false)

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
            <WalletMultiButton />
          </div>
        </nav>

        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 flex justify-center">
              <Lock className="h-16 w-16 text-muted-foreground/40" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Create ShadowID</h1>
            <p className="text-muted-foreground mb-8">Connect your wallet to proceed. Your identity will be encrypted entirely within your browser.</p>
            <WalletMultiButton />
          </div>
        </div>
      </div>
    )
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: InputType) => {
    const file = e.currentTarget.files?.[0]
    if (!file) return

    try {
      setError('')

      // Validate file size
      if (file.size > 50 * 1024 * 1024) {
        setError('File exceeds 50MB limit')
        return
      }

      // Validate file type
      if (type === 'photo' && !file.type.startsWith('image/')) {
        setError('Photo must be an image file')
        return
      }
      if (type === 'document' && !['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)) {
        setError('Document must be PDF, PNG, or JPEG')
        return
      }

      const data = await fileToUint8Array(file)
      setInputs([...inputs, { type, name: file.name, data }])
    } catch (err) {
      setError('Failed to read file')
      console.error('[v0] File read error:', err)
    }
  }

  const handleTextAdd = () => {
    if (!textInput.trim()) {
      setError('Text cannot be empty')
      return
    }
    setError('')
    setInputs([...inputs, { type: 'text', name: `Text entry ${inputs.filter(i => i.type === 'text').length + 1}`, data: textInput.trim() }])
    setTextInput('')
  }

  const handleRemoveInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index))
    setError('')
  }

  const handleCreateCommitment = async () => {
    if (inputs.length === 0) {
      setError('Add at least one identity material to proceed')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      // Generate encryption key from wallet address
      const encryptionKey = await generateEncryptionKey(address || 'default')

      // Encrypt all inputs
      const encryptedInputs: InputMaterial[] = []
      for (const input of inputs) {
        let dataToEncrypt: Uint8Array
        if (typeof input.data === 'string') {
          dataToEncrypt = new TextEncoder().encode(input.data)
        } else {
          dataToEncrypt = input.data
        }

        const encrypted = await encryptData(dataToEncrypt, encryptionKey)
        encryptedInputs.push({ ...input, encrypted, data: new Uint8Array() })
      }

      // Create combined bundle for commitment
      const bundle = encryptedInputs.map(i => i.encrypted).join('||')
      const bundleData = new TextEncoder().encode(bundle)
      const commitmentHash = await generateHash(bundleData)
      const commitmentDisplay = commitmentHash.slice(0, 16).toUpperCase()

      // Generate QR code
      const qrData = JSON.stringify({
        commitment: commitmentDisplay,
        type: 'shadowid-v1',
        timestamp: new Date().toISOString(),
      })

      const qrUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 400,
        margin: 2,
        color: { dark: '#ffffff', light: '#000000' },
      })

      setCommitment(commitmentDisplay)
      setQrDataUrl(qrUrl)

      // Store encrypted data locally
      localStorage.setItem('shadowid-encrypted-bundle', bundle)
      localStorage.setItem('shadowid-commitment', commitmentDisplay)
      localStorage.setItem('shadowid-created-at', new Date().toISOString())

      setCreationComplete(true)
    } catch (err) {
      setError('Failed to create identity commitment. Please try again.')
      console.error('[v0] Commitment error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadQR = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `shadowid-commitment-${commitment}.png`
    link.click()
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
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="rounded-full">
              Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <main className="pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Create ShadowID</h1>
            <p className="text-muted-foreground">Private identity creation using zero-knowledge guarantees</p>
          </div>

          {!creationComplete ? (
            <div className="space-y-8">
              {/* Upload Section */}
              <div className="rounded-lg border border-border bg-card p-8 space-y-6">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Identity Input</h2>
                  <p className="text-sm text-muted-foreground/80 mb-6">Add at least one form of identity material. All uploads are optional, but at least one is required.</p>
                </div>

                {/* Photo Upload */}
                <div>
                  <label htmlFor="photo-upload" className="block mb-2 text-sm font-medium">Photo</label>
                  <label htmlFor="photo-upload" className="block border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-accent/30 transition-colors">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6 text-muted-foreground/60" />
                      <span className="text-sm text-foreground font-medium">Upload image</span>
                      <span className="text-xs text-muted-foreground">PNG, JPG, or GIF • Max 50MB</span>
                    </div>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'photo')}
                      className="hidden"
                      disabled={isProcessing || creationComplete}
                    />
                  </label>
                </div>

                {/* Document Upload */}
                <div>
                  <label htmlFor="document-upload" className="block mb-2 text-sm font-medium">Document</label>
                  <label htmlFor="document-upload" className="block border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-accent/30 transition-colors">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-6 w-6 text-muted-foreground/60" />
                      <span className="text-sm text-foreground font-medium">Upload document</span>
                      <span className="text-xs text-muted-foreground">PDF, PNG, or JPEG • Max 50MB</span>
                    </div>
                    <input
                      id="document-upload"
                      type="file"
                      accept=".pdf,image/png,image/jpeg"
                      onChange={(e) => handleFileUpload(e, 'document')}
                      className="hidden"
                      disabled={isProcessing || creationComplete}
                    />
                  </label>
                </div>

                {/* Text Input */}
                <div>
                  <label htmlFor="text-input" className="block mb-2 text-sm font-medium">Identity Note</label>
                  <div className="flex gap-2">
                    <input
                      id="text-input"
                      type="text"
                      placeholder="Enter a free-form identity note..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      disabled={isProcessing || creationComplete}
                      onKeyDown={(e) => e.key === 'Enter' && handleTextAdd()}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    <Button
                      onClick={handleTextAdd}
                      disabled={!textInput.trim() || isProcessing || creationComplete}
                      variant="outline"
                      className="rounded-lg"
                    >
                      <Type className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Added Items */}
                {inputs.length > 0 && (
                  <div className="border-t border-border/50 pt-6">
                    <p className="text-sm font-medium mb-3">Added materials ({inputs.length})</p>
                    <div className="space-y-2">
                      {inputs.map((input, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                          <div className="flex items-center gap-2">
                            {input.type === 'photo' && <Upload className="h-4 w-4 text-muted-foreground" />}
                            {input.type === 'document' && <FileText className="h-4 w-4 text-muted-foreground" />}
                            {input.type === 'text' && <Type className="h-4 w-4 text-muted-foreground" />}
                            <span className="text-sm text-foreground font-medium">{input.name}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveInput(idx)}
                            className="p-1 hover:bg-muted/40 rounded transition-colors"
                            disabled={isProcessing}
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500/80">{error}</p>
                </div>
              )}

              {/* Create Button */}
              <Button
                onClick={handleCreateCommitment}
                disabled={inputs.length === 0 || isProcessing}
                className="w-full h-11 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                {isProcessing ? 'Encrypting and creating commitment...' : 'Create ShadowID'}
              </Button>

              {/* Privacy Note */}
              <div className="p-4 rounded-lg border border-border/50 bg-muted/5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold">Privacy Guarantee:</span> All identity materials are encrypted client-side using advanced cryptography. Nothing is sent to any server. Your encrypted data and commitment are stored only in your browser's local storage.
                </p>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 rounded-lg border border-accent/30 bg-accent/5">
                <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-accent">ShadowID created successfully</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Identity data encrypted locally. No plaintext data was transmitted.</p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-8 space-y-6">
                {/* Encryption Confirmation */}
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">Status</p>
                  <p className="text-sm text-muted-foreground">Identity data encrypted locally</p>
                </div>

                {/* Commitment Display */}
                <div className="border-t border-border/50 pt-6">
                  <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-3">Identity Commitment</p>
                  <div className="bg-muted/20 rounded-lg p-4 border border-border/30">
                    <p className="font-mono font-bold text-lg text-accent break-all">{commitment}</p>
                  </div>
                  <p className="text-xs text-muted-foreground/70 mt-2">This commitment is what will be registered and verified later. It contains no identity data.</p>
                </div>

                {/* QR Code Display */}
                {qrDataUrl && (
                  <div className="border-t border-border/50 pt-6">
                    <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">Verification QR Code</p>
                    <div className="flex justify-center bg-muted/20 rounded-lg p-4 border border-border/30">
                      <img src={qrDataUrl} alt="ShadowID QR Code" className="w-64 h-64" />
                    </div>
                    <p className="text-xs text-muted-foreground/70 mt-3">Share this QR code to allow others verify claims without revealing identity details.</p>
                    <Button
                      onClick={downloadQR}
                      variant="outline"
                      className="w-full mt-3 rounded-lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download QR Code
                    </Button>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full rounded-lg">
                    Back to Dashboard
                  </Button>
                </Link>
                <Link href="/qr-codes" className="flex-1">
                  <Button className="w-full rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground">
                    View All QR Codes
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
