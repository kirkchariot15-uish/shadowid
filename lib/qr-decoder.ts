import jsQR from 'jsqr'

export interface QRDisclosureProof {
  type: string
  commitment: string
  selectedAttributes: string[]
  timestamp: number
  expiresAt: string
  userAddress: string
  verifyUrl: string
}

export interface QRDecodeResult {
  success: boolean
  data?: QRDisclosureProof
  error?: string
  isExpired?: boolean
}

/**
 * Enhance image for better QR code detection
 * Improves contrast and clarity before processing
 */
function enhanceImageForQRDetection(ctx: CanvasRenderingContext2D, width: number, height: number): ImageData {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Apply histogram equalization for better contrast
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Convert to grayscale
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Apply contrast enhancement (stretch values)
    const enhanced = (gray - 128) * 1.5 + 128;
    const clamped = Math.max(0, Math.min(255, enhanced));
    
    // Apply threshold to make QR patterns more distinct
    const threshold = clamped > 127 ? 255 : 0;
    
    data[i] = threshold;
    data[i + 1] = threshold;
    data[i + 2] = threshold;
  }
  
  ctx.putImageData(imageData, 0, 0);
  return ctx.getImageData(0, 0, width, height);
}

/**
 * Decode QR code from canvas image data
 * Uses jsQR library for client-side decoding with enhanced preprocessing
 */
function decodeQRFromCanvas(canvas: HTMLCanvasElement): string | null {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Enhance image for better detection
    const enhancedImageData = enhanceImageForQRDetection(ctx, canvas.width, canvas.height);
    
    // Try jsQR decode
    const qrCode = jsQR(enhancedImageData.data, canvas.width, canvas.height, {
      inversionAttempts: 'dontInvert' // Try normal and inverted
    });
    
    if (qrCode?.data) {
      console.log('[v0] QR code detected successfully');
      return qrCode.data;
    }
    
    console.log('[v0] No QR code found in frame');
    return null;
  } catch (error) {
    console.error('[v0] QR decode error:', error);
    return null;
  }
}

/**
 * Decode QR code from image file
 * Converts image to canvas and extracts QR data
 */
export async function decodeQRFromImage(file: File): Promise<QRDecodeResult> {
  try {
    const reader = new FileReader()
    
    return new Promise((resolve) => {
      reader.onload = (e) => {
        try {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            
            if (!ctx) {
              resolve({
                success: false,
                error: 'Canvas context not available'
              })
              return
            }
            
            ctx.drawImage(img, 0, 0)
            const qrData = decodeQRFromCanvas(canvas)
            
            if (!qrData) {
              resolve({
                success: false,
                error: 'No QR code found in image. Make sure the image is clear and contains a valid QR code.'
              })
              return
            }
            
            // Parse and validate QR data
            const result = parseAndValidateQRData(qrData)
            resolve(result)
          }
          
          img.onerror = () => {
            resolve({
              success: false,
              error: 'Failed to load image'
            })
          }
          
          img.src = e.target?.result as string
        } catch (error) {
          resolve({
            success: false,
            error: `Error processing image: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
        }
      }
      
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file'
        })
      }
      
      reader.readAsDataURL(file)
    })
  } catch (error) {
    return {
      success: false,
      error: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Decode QR code from video frame
 * Used by camera scanner for real-time detection
 */
export function decodeQRFromVideoFrame(video: HTMLVideoElement): QRDecodeResult | null {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return null
    
    ctx.drawImage(video, 0, 0)
    const qrData = decodeQRFromCanvas(canvas)
    
    if (!qrData) return null
    
    return parseAndValidateQRData(qrData)
  } catch (error) {
    console.error('[v0] Video frame decode error:', error)
    return null
  }
}

/**
 * Parse QR data string and validate format + expiry
 */
export function parseAndValidateQRData(qrDataString: string): QRDecodeResult {
  try {
    // Parse JSON
    let data: any
    try {
      data = JSON.parse(qrDataString)
    } catch {
      return {
        success: false,
        error: 'QR code contains invalid data format'
      }
    }

    // Validate type
    if (data.type !== 'shadowid-disclosure-v1') {
      return {
        success: false,
        error: 'Invalid QR code type. This is not a ShadowID disclosure proof.'
      }
    }

    // Validate required fields
    const requiredFields = ['commitment', 'selectedAttributes', 'timestamp', 'expiresAt', 'userAddress', 'verifyUrl']
    for (const field of requiredFields) {
      if (!(field in data)) {
        return {
          success: false,
          error: `QR code missing required field: ${field}`
        }
      }
    }

    // Validate selectedAttributes is array
    if (!Array.isArray(data.selectedAttributes)) {
      return {
        success: false,
        error: 'Invalid attributes format in QR code'
      }
    }

    // Check expiry
    const expiryTime = new Date(data.expiresAt).getTime()
    const nowTime = new Date().getTime()
    
    if (nowTime > expiryTime) {
      return {
        success: false,
        error: 'This QR code has expired and is no longer valid',
        isExpired: true
      }
    }

    // Validate timestamp is number
    if (typeof data.timestamp !== 'number') {
      return {
        success: false,
        error: 'Invalid timestamp in QR code'
      }
    }

    const proof: QRDisclosureProof = {
      type: data.type,
      commitment: data.commitment,
      selectedAttributes: data.selectedAttributes,
      timestamp: data.timestamp,
      expiresAt: data.expiresAt,
      userAddress: data.userAddress,
      verifyUrl: data.verifyUrl
    }

    return {
      success: true,
      data: proof
    }
  } catch (error) {
    return {
      success: false,
      error: `Error validating QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Calculate time remaining until QR expiry
 */
export function getQRTimeRemaining(expiresAt: string): {
  isExpired: boolean
  milliseconds: number
  formatted: string
} {
  const expiryTime = new Date(expiresAt).getTime()
  const nowTime = new Date().getTime()
  const msRemaining = expiryTime - nowTime
  
  if (msRemaining <= 0) {
    return {
      isExpired: true,
      milliseconds: 0,
      formatted: 'Expired'
    }
  }
  
  const hours = Math.floor(msRemaining / (1000 * 60 * 60))
  const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000)
  
  let formatted = ''
  if (hours > 0) formatted = `${hours}h ${minutes}m`
  else if (minutes > 0) formatted = `${minutes}m ${seconds}s`
  else formatted = `${seconds}s`
  
  return {
    isExpired: false,
    milliseconds: msRemaining,
    formatted
  }
}
