import jsQR from 'jsqr'

export interface QRDisclosureProof {
  type: string
  commitment: string
  selectedAttributes: string[]
  timestamp: number
  expiresAt: string
  userAddress: string
  verifyUrl: string
  verifierId?: string
  verifierName?: string
  purpose?: string
  requestLinkId?: string
  nullifier?: string
}

export interface QRDecodeResult {
  success: boolean
  data?: QRDisclosureProof
  error?: string
  isExpired?: boolean
}

/**
 * Apply multiple enhancement passes for maximum QR detection reliability
 * Uses Otsu's adaptive thresholding for optimal binarization
 */
function multiPassEnhance(ctx: CanvasRenderingContext2D, width: number, height: number): ImageData {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Pass 1: Convert to grayscale and calculate histogram
  const gray = new Uint8ClampedArray(width * height);
  const histogram = new Uint32Array(256);
  
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const grayVal = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[j] = grayVal;
    histogram[Math.floor(grayVal)]++;
  }

  // Pass 2: Find optimal threshold using Otsu's method
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * histogram[i];

  let sumB = 0;
  let wB = 0;
  let maxVar = 0;
  let optThresh = 0;

  for (let i = 0; i < 256; i++) {
    wB += histogram[i];
    if (wB === 0) continue;

    const wF = gray.length - wB;
    if (wF === 0) break;

    sumB += i * histogram[i];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const varBetween = wB * wF * Math.pow(mB - mF, 2);

    if (varBetween > maxVar) {
      maxVar = varBetween;
      optThresh = i;
    }
  }

  // Pass 3: Apply adaptive threshold with edge enhancement
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const val = gray[j] > optThresh ? 255 : 0;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }

  ctx.putImageData(imageData, 0, 0);
  return ctx.getImageData(0, 0, width, height);
}

/**
 * Decode QR code from canvas with multi-strategy detection
 * Tries multiple preprocessing and decoding strategies for maximum reliability
 * Optimized for real-time camera frame detection
 */
function decodeQRFromCanvas(canvas: HTMLCanvasElement): string | null {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Strategy 1: Raw image with both inversion attempts (fastest, most compatible)
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, canvas.width, canvas.height, {
        inversionAttempts: 'attemptBoth'
      });
      if (result?.data) {
        console.log('[v0] QR detected via raw image');
        return result.data;
      }
    } catch (err) {
      console.log('[v0] Raw image strategy failed');
    }

    // Strategy 2: Otsu-thresholded enhanced image (better for poor lighting)
    try {
      const enhanced = multiPassEnhance(ctx, canvas.width, canvas.height);
      const result = jsQR(enhanced.data, canvas.width, canvas.height, {
        inversionAttempts: 'attemptBoth'
      });
      if (result?.data) {
        console.log('[v0] QR detected via Otsu thresholding');
        return result.data;
      }
    } catch (err) {
      console.log('[v0] Otsu strategy failed');
    }

    console.log('[v0] No QR code detected in frame');
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
    // Validate video dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('[v0] Video dimensions not ready')
      return null
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      console.error('[v0] Failed to get canvas context')
      return null
    }
    
    try {
      ctx.drawImage(video, 0, 0)
    } catch (err) {
      console.log('[v0] Could not draw video frame:', err)
      return null
    }
    
    const qrData = decodeQRFromCanvas(canvas)
    
    if (!qrData) {
      return null
    }
    
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
