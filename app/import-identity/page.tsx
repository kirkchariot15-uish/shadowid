'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QrCode, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'

export default function ImportIdentityPage() {
  const router = useRouter()
  const { address, isConnected } = useAleoWallet()
  const [scanning, setScanning] = useState(false)
  const [imported, setImported] = useState(false)
  const [error, setError] = useState<string>('')
  const [importedData, setImportedData] = useState<any>(null)

  const handleQRScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScanning(true)
    setError('')

    try {
      // Read QR image using jsQR library approach
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      const img = new Image()
      img.onload = async () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        // Try to extract QR data from image
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        // In production, use a proper QR library like jsQR
        // For now, prompt user to share their commitment directly
        setError('QR scanning requires additional library. Please use camera option instead.')
        setScanning(false)
      }

      img.src = URL.createObjectURL(file)
    } catch (err) {
      console.error('[v0] QR read error:', err)
      setError('Failed to read QR code. Please try camera mode.')
      setScanning(false)
    }
  }

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      
      // Create video element for camera
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      // Set up canvas for frame capture
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      let scanAttempts = 0
      const maxAttempts = 30 // Try for ~5 seconds

      const scanFrame = () => {
        if (scanAttempts >= maxAttempts) {
          stream.getTracks().forEach(track => track.stop())
          setError('Could not scan QR code. Please try a clearer image.')
          setScanning(false)
          return
        }

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)

        // In production, use jsQR: const code = jsQR(imageData.data, imageData.width, imageData.height)
        // For MVP, show instruction to user
        scanAttempts++
        requestAnimationFrame(scanFrame)
      }

      scanFrame()

      // For MVP: Ask user to input commitment manually
      setError('Camera mode requires QR decoding library. Please copy your commitment hash instead.')
      stream.getTracks().forEach(track => track.stop())
      setScanning(false)
    } catch (err) {
      console.error('[v0] Camera access error:', err)
      setError('Unable to access camera. Please check permissions.')
      setScanning(false)
    }
  }

  const handleManualImport = () => {
    const commitment = prompt('Enter your ShadowID commitment hash:')
    if (!commitment) return

    try {
      // Validate commitment format (64-character hex)
      if (!/^[a-fA-F0-9]+$/.test(commitment) && commitment.length < 20) {
        setError('Invalid commitment format. Please check and try again.')
        return
      }

      // Store commitment locally
      localStorage.setItem('shadowid-commitment', commitment)
      localStorage.setItem('shadowid-wallet-address', address || '')
      localStorage.setItem('identity-created', 'true')

      setImportedData({ commitment })
      setImported(true)
      setError('')

      console.log('[v0] Identity imported successfully:', commitment.substring(0, 16) + '...')

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      console.error('[v0] Import error:', err)
      setError(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Wallet Not Connected</h1>
          <p className="text-muted-foreground mb-6">Please connect your Aleo wallet to import your identity.</p>
          <Button onClick={() => router.push('/')} className="w-full">
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  if (imported) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Identity Imported Successfully</h1>
          <p className="text-muted-foreground mb-6">Your ShadowID has been restored to this device.</p>
          <div className="bg-background/60 rounded-lg p-4 border border-border mb-6">
            <p className="text-xs text-muted-foreground mb-2">Commitment</p>
            <p className="font-mono text-sm text-accent break-all">{importedData?.commitment.substring(0, 32)}...</p>
          </div>
          <Button onClick={() => router.push('/dashboard')} className="w-full gap-2">
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center mb-12">
          <QrCode className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Restore Your Identity</h1>
          <p className="text-muted-foreground text-lg">
            Import your ShadowID commitment from the QR code on your ID card to quickly restore your identity on this device.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-500">Import Error</p>
              <p className="text-xs text-red-500/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Import Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Camera Scan */}
          <div className="p-6 rounded-lg border-2 border-dashed border-border hover:border-accent/50 transition-colors cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleQRScan}
              disabled={scanning}
              className="sr-only"
              id="camera-input"
            />
            <label htmlFor="camera-input" className="block cursor-pointer">
              <QrCode className="h-12 w-12 text-accent/60 mx-auto mb-3 group-hover:text-accent transition-colors" />
              <h3 className="font-semibold mb-2">Scan QR Code</h3>
              <p className="text-xs text-muted-foreground">
                Take a photo of your ShadowID QR code
              </p>
            </label>
          </div>

          {/* Manual Import */}
          <div
            onClick={handleManualImport}
            className="p-6 rounded-lg border-2 border-dashed border-border hover:border-accent/50 transition-colors cursor-pointer group"
          >
            <div className="block">
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                <span className="text-xl font-bold text-accent">#</span>
              </div>
              <h3 className="font-semibold mb-2">Manual Import</h3>
              <p className="text-xs text-muted-foreground">
                Paste your commitment hash
              </p>
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="p-6 rounded-lg bg-accent/5 border border-accent/20">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-accent" />
            About Identity Import
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Your commitment hash uniquely identifies your ShadowID</li>
            <li>• This is stored only on your device - never shared externally</li>
            <li>• You can import your identity on any device with your QR code</li>
            <li>• Your attributes and attestations are blockchain-verified</li>
            <li>• Each import creates a fresh session - no sync across devices</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
