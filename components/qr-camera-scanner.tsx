import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Camera, Stop, Maximize2 } from 'lucide-react'
import { useQRCameraScanner } from '@/hooks/use-qr-camera-scanner'

interface QRCameraScannerProps {
  onQRDetected: (qrData: any) => void
  onClose: () => void
}

export function QRCameraScanner({ onQRDetected, onClose }: QRCameraScannerProps) {
  const { scanning, isInitializing, error, permissionDenied, qrDetected, requestCamera, stopCamera, videoRef } =
    useQRCameraScanner()
  const [showGuides, setShowGuides] = useState(true)

  // Handle QR detection
  useEffect(() => {
    if (qrDetected && qrDetected.success) {
      onQRDetected(qrDetected)
    }
  }, [qrDetected, onQRDetected])

  return (
    <div className="space-y-4">
      {/* Status Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">{error}</p>
        </div>
      )}

      {permissionDenied && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Camera Permission Denied</p>
            <p className="text-xs text-muted-foreground">
              To allow camera access, click the permission prompt when it appears, or check your browser settings.
            </p>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      {!scanning && !isInitializing && (
        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Privacy Protected</p>
          <p>Camera access is only used to scan QR codes. Video is never stored, transmitted, or recorded.</p>
        </div>
      )}

      {/* Video Container */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
        <video
          ref={videoRef}
          playsInline
          className="w-full h-full object-cover"
          style={{ display: scanning ? 'block' : 'none' }}
        />

        {/* Scanning Guides */}
        {scanning && showGuides && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Corner guides */}
            <div className="absolute inset-0 border-2 border-accent/20">
              {/* Top-left corner */}
              <div className="absolute top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-accent" />
              {/* Top-right corner */}
              <div className="absolute top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-accent" />
              {/* Bottom-left corner */}
              <div className="absolute bottom-8 left-8 w-8 h-8 border-l-2 border-b-2 border-accent" />
              {/* Bottom-right corner */}
              <div className="absolute bottom-8 right-8 w-8 h-8 border-r-2 border-b-2 border-accent" />
            </div>

            {/* Center scanning line animation */}
            <div className="absolute w-48 h-1 bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse" />

            {/* Instructions */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <p className="text-sm text-accent font-medium">Position QR code within frame</p>
            </div>
          </div>
        )}

        {/* Overlay when not scanning */}
        {!scanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            {isInitializing ? (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-accent font-medium">Initializing camera...</p>
              </div>
            ) : (
              <div className="text-center">
                <Camera className="h-12 w-12 text-accent/40 mx-auto mb-3" />
                <p className="text-sm text-accent/60">Camera not active</p>
              </div>
            )}
          </div>
        )}

        {/* Privacy indicator */}
        {scanning && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/80 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-red-200 rounded-full animate-pulse" />
            <p className="text-xs font-medium text-white">Camera On</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!scanning && !isInitializing && (
          <>
            <Button onClick={requestCamera} className="flex-1 gap-2" disabled={permissionDenied}>
              <Camera className="h-4 w-4" />
              Start Camera
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
          </>
        )}

        {scanning && (
          <>
            <Button
              onClick={() => setShowGuides(!showGuides)}
              variant="outline"
              size="sm"
              className="gap-2"
              title="Toggle scanning guides"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button onClick={stopCamera} className="flex-1 gap-2 bg-destructive hover:bg-destructive/90">
              <Stop className="h-4 w-4" />
              Stop Scanning
            </Button>
          </>
        )}

        {isInitializing && (
          <Button disabled className="flex-1">
            Initializing...
          </Button>
        )}
      </div>

      {/* Info Text */}
      <p className="text-xs text-muted-foreground text-center">
        {scanning
          ? 'Hold the QR code steady for automatic detection'
          : permissionDenied
            ? 'Enable camera in browser settings and try again'
            : 'Click Start Camera to begin scanning'}
      </p>
    </div>
  )
}
