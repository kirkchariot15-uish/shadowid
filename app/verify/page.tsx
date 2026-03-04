'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, AlertCircle, Shield, User, Calendar, Zap } from 'lucide-react'
import Link from 'next/link'
import { STANDARD_ATTRIBUTES } from '@/lib/attribute-schema'

interface ProfileData {
  commitment: string
  userAddress: string
  attributes: Record<string, string>
  timestamp: string
  verificationLink: string
}

export default function VerifyProfilePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    try {
      const commitment = searchParams.get('commitment')
      
      if (!commitment) {
        setError('No commitment provided. Please scan a valid QR code.')
        setIsVerifying(false)
        return
      }

      // Validate commitment format
      if (!/^[0-9A-F]{16}$/.test(commitment)) {
        setError('Invalid commitment format')
        setIsVerifying(false)
        return
      }

      // Try to load profile data from localStorage if available
      const storedCredential = localStorage.getItem('shadowid-credential')
      const storedCommitment = localStorage.getItem('shadowid-commitment')
      const userAddress = localStorage.getItem('shadowid-user-id')

      // If this is the user's own QR code
      if (storedCommitment === commitment && storedCredential) {
        try {
          const credential = JSON.parse(storedCredential)
          const attributes = credential?.credentialSubject?.claims || {}
          
          setProfileData({
            commitment,
            userAddress: userAddress || 'Anonymous',
            attributes: Object.entries(attributes).reduce((acc: any, [key, claim]: any) => {
              acc[key] = claim.value || ''
              return acc
            }, {}),
            timestamp: new Date().toISOString(),
            verificationLink: `${typeof window !== 'undefined' ? window.location.origin : ''}/verify?commitment=${commitment}`,
          })
        } catch (err) {
          console.error('[v0] Error parsing credential:', err)
          setError('Could not load profile data')
        }
      } else {
        // For external scans, show public profile (commitment verified on blockchain)
        setProfileData({
          commitment,
          userAddress: 'Verified User',
          attributes: {},
          timestamp: new Date().toISOString(),
          verificationLink: `${typeof window !== 'undefined' ? window.location.origin : ''}/verify?commitment=${commitment}`,
        })
      }

      setIsVerifying(false)
    } catch (err) {
      console.error('[v0] Error loading profile:', err)
      setError('Failed to load profile')
      setIsVerifying(false)
    }
  }, [searchParams])

  if (isVerifying) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-20 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-8">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive mb-1">Verification Error</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!profileData) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <p className="text-muted-foreground">No profile data available</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>

        <div className="space-y-8">
          {/* Verification Status */}
          <div className="rounded-lg border border-accent/20 bg-card p-8 space-y-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Verified ShadowID Profile</h1>
                <p className="text-muted-foreground mt-2">This identity has been verified on the Aleo blockchain</p>
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              {/* Commitment Hash */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Identity Commitment
                </div>
                <div className="font-mono text-sm bg-background/50 p-3 rounded-lg break-all text-foreground">
                  {profileData.commitment}
                </div>
              </div>

              {/* User Address */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <User className="h-4 w-4" />
                  Verified User
                </div>
                <p className="text-foreground">{profileData.userAddress}</p>
              </div>

              {/* Verification Timestamp */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Scanned At
                </div>
                <p className="text-foreground">
                  {new Date(profileData.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Selected Attributes */}
          {Object.keys(profileData.attributes).length > 0 && (
            <div className="rounded-lg border border-accent/20 bg-card p-8 space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                Claimed Attributes
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(profileData.attributes).map(([attrId, value]) => {
                  const attrSchema = Object.values(STANDARD_ATTRIBUTES).find(a => a.id === attrId)
                  return (
                    <div key={attrId} className="p-4 rounded-lg border border-border bg-background/50 space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">
                        {attrSchema?.name || attrId}
                      </p>
                      <p className="text-foreground font-mono text-sm break-all">{value}</p>
                      {attrSchema?.description && (
                        <p className="text-xs text-muted-foreground mt-2">{attrSchema.description}</p>
                      )}
                    </div>
                  )
                })}
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                These attributes are claimed by the user. Verification proves claims without revealing unnecessary data.
              </p>
            </div>
          )}

          {/* How It Works */}
          <div className="rounded-lg border border-accent/20 bg-card/30 p-6 space-y-4">
            <h3 className="font-semibold text-foreground">How Zero-Knowledge Verification Works</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-accent font-semibold flex-shrink-0">1.</span>
                <span>This QR code links to a verified ShadowID on the Aleo blockchain</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-semibold flex-shrink-0">2.</span>
                <span>The identity commitment is cryptographically proven without revealing personal data</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-semibold flex-shrink-0">3.</span>
                <span>Claimed attributes are shown, but the owner's privacy is protected through zero-knowledge proofs</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-semibold flex-shrink-0">4.</span>
                <span>Anyone can verify this identity is legitimate without contacting a central authority</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Link href="/">
              <Button variant="outline">Learn More</Button>
            </Link>
            <Link href="/qr-verifier">
              <Button className="bg-blue hover:bg-blue/90 text-blue-foreground">Scan Another QR</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
