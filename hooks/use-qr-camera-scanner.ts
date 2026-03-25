import { useState, useCallback, useRef, useEffect } from 'react'
import { decodeQRFromVideoFrame, QRDecodeResult } from '@/lib/qr-decoder'

export interface UseCameraScannerState {
  scanning: boolean
  isInitializing: boolean
  error: string | null
  permissionDenied: boolean
  permissionGranted: boolean
  qrDetected: QRDecodeResult | null
  requestCamera: () => Promise<void>
  stopCamera: () => void
  videoRef: React.RefObject<HTMLVideoElement>
}

const FRAME_INTERVAL = 100 // Process frame every 100ms (increased from 200ms) for faster detection

/**
 * Hook for real-time QR code scanning from camera
 * Privacy-first: camera only accessed after explicit user action
 */
export function useQRCameraScanner(): UseCameraScannerState {
  const [scanning, setScanning] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [qrDetected, setQrDetected] = useState<QRDecodeResult | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const processingRef = useRef(false)
  const lastProcessTimeRef = useRef(0)

  // Cleanup function
  const stopCamera = useCallback(() => {
    console.log('[v0] Stopping camera')
    
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop()
        console.log('[v0] Stopped track:', track.kind)
      })
      streamRef.current = null
    }

    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setScanning(false)
    setError(null)
    processingRef.current = false
  }, [])

  // Process video frames for QR detection
  const processVideoFrame = useCallback(() => {
    if (!scanning || !videoRef.current || processingRef.current) {
      return
    }

    // Check if video is actually playing and has dimensions
    if (!videoRef.current.srcObject || videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      console.log('[v0] Video not ready yet, retrying...')
      animationFrameRef.current = requestAnimationFrame(processVideoFrame)
      return
    }

    // Throttle frame processing to reduce CPU usage
    const now = Date.now()
    if (now - lastProcessTimeRef.current < FRAME_INTERVAL) {
      animationFrameRef.current = requestAnimationFrame(processVideoFrame)
      return
    }

    lastProcessTimeRef.current = now
    processingRef.current = true

    try {
      const result = decodeQRFromVideoFrame(videoRef.current)
      
      if (result && result.success && result.data) {
        console.log('[v0] QR code detected from camera successfully')
        setQrDetected(result)
        stopCamera()
        return
      }
      
      // Handle decode errors gracefully
      if (result && !result.success && result.error) {
        console.log('[v0] QR decode attempt - no valid code found')
      }
    } catch (err) {
      console.error('[v0] Frame processing error:', err)
      // Don't stop on error, continue trying to detect
    } finally {
      processingRef.current = false
    }

    // Continue scanning
    animationFrameRef.current = requestAnimationFrame(processVideoFrame)
  }, [scanning, stopCamera])

  // Request camera permission and start scanning
  const requestCamera = useCallback(async () => {
    console.log('[v0] Requesting camera permission')
    setIsInitializing(true)
    setError(null)
    setPermissionDenied(false)
    setQrDetected(null)

    try {
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Your browser does not support camera access. Please use a modern browser or upload a QR code image instead.')
        setIsInitializing(false)
        return
      }

      // Add timeout for camera permission request (10 seconds)
      const cameraPromise = new Promise<MediaStream>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Camera permission request timed out'))
        }, 10000)

        // Request camera permission
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: 'environment', // Back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false // No microphone needed
        }

        navigator.mediaDevices.getUserMedia(constraints)
          .then(stream => {
            clearTimeout(timeout)
            resolve(stream)
          })
          .catch(err => {
            clearTimeout(timeout)
            reject(err)
          })
      })

      const stream = await cameraPromise
      console.log('[v0] Camera permission granted')
      
      streamRef.current = stream
      setPermissionGranted(true)

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Add timeout for video playback
        const playPromise = new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Video playback timed out'))
          }, 5000)

          videoRef.current!.onloadedmetadata = () => {
            console.log('[v0] Video stream ready')
            videoRef.current!.play()
              .then(() => {
                clearTimeout(timeout)
                resolve()
              })
              .catch(err => {
                clearTimeout(timeout)
                reject(err)
              })
          }
        })

        await playPromise
        
        setScanning(true)
        setIsInitializing(false)
        
        // Start QR detection loop
        processVideoFrame()
      }
    } catch (err) {
      console.error('[v0] Camera access error:', err)
      setIsInitializing(false)
      
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          console.log('[v0] Camera permission denied by user')
          setPermissionDenied(true)
          setError('Camera access was denied. Please allow camera access in your browser settings or upload a QR code image instead.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device. Please upload a QR code image instead.')
        } else if (err.name === 'NotReadableError') {
          setError('Camera is in use by another application. Please close other apps and try again.')
        } else {
          setError(`Camera error: ${err.message}`)
        }
      } else {
        setError(`Error accessing camera: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
  }, [processVideoFrame, stopCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    scanning,
    isInitializing,
    error,
    permissionDenied,
    permissionGranted,
    qrDetected,
    requestCamera,
    stopCamera,
    videoRef
  }
}
