import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Camera, Lock, CheckCircle2 } from 'lucide-react'

interface CameraPermissionDialogProps {
  isOpen: boolean
  onAllow: () => void
  onDeny: () => void
}

export function CameraPermissionDialog({ isOpen, onAllow, onDeny }: CameraPermissionDialogProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-accent" />
            Camera Access Requested
          </DialogTitle>
          <DialogDescription>
            ShadowID needs permission to scan QR codes with your camera
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Privacy Explanation */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Your Privacy Is Protected</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Not stored:</strong> Camera feed is never saved or recorded
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Not transmitted:</strong> QR data stays on your device, never sent to any server
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Local only:</strong> All QR processing happens in your browser
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                <span>
                  <strong>You control it:</strong> Camera is destroyed immediately after use
                </span>
              </div>
            </div>
          </div>

          {/* What Camera Will Be Used For */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Camera Will Be Used To:</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">•</span>
                <span>Scan QR codes from your device camera</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">•</span>
                <span>Detect and read disclosure proofs</span>
              </li>
            </ul>
          </div>

          {/* Browser Permissions Info */}
          <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 flex items-start gap-2">
            <Lock className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Your browser will show a permission prompt. You can revoke camera access at any time in your browser settings.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button onClick={onDeny} variant="outline" className="flex-1">
              Not Now
            </Button>
            <Button onClick={onAllow} className="flex-1 bg-accent hover:bg-accent/90 gap-2">
              <Camera className="h-4 w-4" />
              Allow Camera
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
