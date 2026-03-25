/**
 * QR Verification API Endpoint
 * Confirms that QR codes are valid and not yet expired
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commitment, expiresAt, selectedAttributes } = body

    // Validate required fields
    if (!commitment || !expiresAt || !Array.isArray(selectedAttributes)) {
      return NextResponse.json(
        { error: 'Missing required QR code data' },
        { status: 400 }
      )
    }

    // Check expiration server-side
    const expiryTime = new Date(expiresAt).getTime()
    const nowTime = Date.now()

    if (nowTime > expiryTime) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'QR code has expired',
          isExpired: true
        },
        { status: 410 }
      )
    }

    // Calculate time remaining
    const msRemaining = expiryTime - nowTime
    const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60))
    const minutesRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60))

    console.log('[v0] QR verification successful:', {
      commitment: commitment.substring(0, 16) + '...',
      expiresAt,
      hoursRemaining,
      minutesRemaining
    })

    return NextResponse.json({
      valid: true,
      verified: true,
      expiresAt,
      timeRemaining: {
        hours: hoursRemaining,
        minutes: minutesRemaining,
        milliseconds: msRemaining
      },
      verifiedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('[v0] QR verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
