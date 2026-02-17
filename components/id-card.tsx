'use client'

import { useState } from 'react'
import { Copy, CheckCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import QRCode from 'qrcode'

interface IDCardProps {
  commitment: string
  walletAddress?: string
  createdAt: string
  userInfo: {
    hasPhoto: boolean
    documentCount: number
    notesCount: number
  }
  showActions?: boolean
}

export function IDCard({ commitment, walletAddress, createdAt, userInfo, showActions = true }: IDCardProps) {
  const [copied, setCopied] = useState(false)
  const [qrUrl, setQrUrl] = useState<string>('')

  useState(() => {
    // Generate QR code for the ID card
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          commitment,
          type: 'shadowid-v1',
          timestamp: createdAt,
          walletAddress,
          userInfo,
        })

        const url = await QRCode.toDataURL(qrData, {
          errorCorrectionLevel: 'H',
          width: 200,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
        })
        setQrUrl(url)
      } catch (err) {
        console.error('[v0] QR generation error:', err)
      }
    }
    generateQR()
  })

  const handleCopy = () => {
    navigator.clipboard.writeText(commitment)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    // Create a canvas to render the ID card
    const canvas = document.createElement('canvas')
    canvas.width = 1000
    canvas.height = 630
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1000, 630)
    gradient.addColorStop(0, '#1e293b')
    gradient.addColorStop(1, '#0f172a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1000, 630)

    // Border
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 4
    ctx.strokeRect(20, 20, 960, 590)

    // Logo area
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(40, 40, 80, 80)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('σ', 80, 95)

    // Title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 42px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('ShadowID', 140, 85)

    ctx.font = '18px sans-serif'
    ctx.fillStyle = '#94a3b8'
    ctx.fillText('Private Identity Credential', 140, 110)

    // Line separator
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(40, 160)
    ctx.lineTo(960, 160)
    ctx.stroke()

    // Commitment section
    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText('IDENTITY COMMITMENT', 40, 200)

    ctx.fillStyle = '#3b82f6'
    ctx.font = 'bold 24px monospace'
    ctx.fillText(commitment, 40, 240)

    // Stats
    const statsY = 300
    ctx.fillStyle = '#64748b'
    ctx.font = 'bold 14px sans-serif'
    ctx.fillText('PHOTO', 40, statsY)
    ctx.fillText('DOCUMENTS', 250, statsY)
    ctx.fillText('NOTES', 460, statsY)

    ctx.fillStyle = '#3b82f6'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText(userInfo.hasPhoto ? '✓' : '–', 40, statsY + 50)
    ctx.fillText(userInfo.documentCount.toString(), 250, statsY + 50)
    ctx.fillText(userInfo.notesCount.toString(), 460, statsY + 50)

    // Footer info
    ctx.fillStyle = '#64748b'
    ctx.font = '14px sans-serif'
    ctx.fillText(`Created: ${new Date(createdAt).toLocaleDateString()}`, 40, 570)
    ctx.fillText('Zero-Knowledge Privacy • End-to-End Encrypted', 600, 570)

    // Download
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `shadowid-card-${commitment.substring(0, 8)}.png`
    link.click()
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* ID Card */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border-2 border-accent/30 shadow-2xl overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/50 rounded-full blur-3xl" />
        </div>

        <div className="relative p-8 md:p-12">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent/20 border-2 border-accent/40">
                <span className="text-3xl font-bold text-accent">σ</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">ShadowID</h2>
                <p className="text-sm text-accent/70 uppercase tracking-widest">Private Identity Credential</p>
              </div>
            </div>

            {qrUrl && (
              <div className="bg-white p-3 rounded-lg">
                <img src={qrUrl} alt="ID QR Code" className="w-24 h-24" style={{ imageRendering: 'crisp-edges' }} />
              </div>
            )}
          </div>

          <div className="h-px bg-slate-700/50 mb-8" />

          {/* Commitment */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest font-semibold text-accent/60 mb-3">Identity Commitment</p>
            <div className="bg-slate-900/60 rounded-lg p-4 border border-accent/20">
              <p className="font-mono font-bold text-lg text-accent break-all">{commitment}</p>
            </div>
          </div>

          {/* Identity Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest font-semibold text-slate-400 mb-2">Photo</p>
              <p className="text-3xl font-bold text-accent">{userInfo.hasPhoto ? '✓' : '–'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest font-semibold text-slate-400 mb-2">Documents</p>
              <p className="text-3xl font-bold text-accent">{userInfo.documentCount}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest font-semibold text-slate-400 mb-2">Notes</p>
              <p className="text-3xl font-bold text-accent">{userInfo.notesCount}</p>
            </div>
          </div>

          <div className="h-px bg-slate-700/50 mb-6" />

          {/* Footer info */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <div>
                <span className="font-semibold">Network:</span> Aleo Testnet
              </div>
              <div>
                <span className="font-semibold">Created:</span> {new Date(createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-accent" />
              <span>Zero-Knowledge Privacy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="mt-6 flex gap-3">
          <Button onClick={handleCopy} variant="outline" className="flex-1 gap-2">
            {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Commitment'}
          </Button>
          <Button onClick={handleDownload} className="flex-1 bg-accent hover:bg-accent/90 gap-2">
            <Download className="h-4 w-4" />
            Download ID Card
          </Button>
        </div>
      )}
    </div>
  )
}
