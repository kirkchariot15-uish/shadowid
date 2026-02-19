'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/lib/wallet-provider'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Lock, User, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { getUserProfile, saveUserProfile, UserProfile } from '@/lib/user-profile'
import { addActivityLog } from '@/lib/activity-logger'

export default function ProfilePage() {
  const { isConnected, address } = useAleoWallet()
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    bio: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isConnected || !address) return

    const loadProfile = async () => {
      try {
        const data = await getUserProfile(address)
        setProfile(data)
      } catch (err) {
        console.error('[v0] Error loading profile:', err)
        setError('Failed to load profile')
      }
    }

    loadProfile()
  }, [isConnected, address])

  const handleSaveProfile = async () => {
    if (!address) return

    setIsSaving(true)
    setError('')
    setSaveSuccess(false)

    try {
      const updatedProfile: UserProfile = {
        ...profile,
        updatedAt: new Date().toISOString(),
      }

      await saveUserProfile(address, updatedProfile)
      setProfile(updatedProfile)
      setSaveSuccess(true)
      addActivityLog('Update profile', 'profile', `Updated username: ${profile.username}`, 'success')

      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError('Failed to save profile. Please try again.')
      addActivityLog('Update profile', 'profile', `Failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error')
      console.error('[v0] Error saving profile:', err)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-foreground font-semibold">Wallet Connection Required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 md:pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
              <p className="text-muted-foreground mt-2">Optional public profile information for disclosures</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-accent/40 text-accent hover:bg-accent/10 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/5 text-red-600 text-sm">
              {error}
            </div>
          )}

          {saveSuccess && (
            <div className="mb-6 p-4 rounded-lg border border-green-500/30 bg-green-500/5 text-green-600 text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Profile saved successfully
            </div>
          )}

          {/* Profile Form */}
          <div className="rounded-xl border border-accent/20 bg-card/50 backdrop-blur p-8 space-y-8">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-accent" />
                Username (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                maxLength={30}
                className="w-full px-4 py-3 rounded-lg border border-accent/20 bg-background text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all"
              />
              <div className="flex justify-between items-start mt-3">
                <p className="text-xs text-muted-foreground/70">
                  Displayed in disclosures only if you choose to share it.
                </p>
                <p className="text-xs text-accent/60">{profile.username.length}/30</p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                Bio (Optional)
              </label>
              <textarea
                placeholder="Tell us about yourself..."
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                maxLength={280}
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-accent/20 bg-background text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 resize-none transition-all"
              />
              <div className="flex justify-between items-start mt-3">
                <p className="text-xs text-muted-foreground/70">
                  Encrypted and included in selective disclosures.
                </p>
                <p className="text-xs text-accent/60">{profile.bio.length}/280</p>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="p-4 rounded-lg border border-accent/20 bg-accent/5">
              <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                <Lock className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                <span>
                  Your profile is encrypted locally and never transmitted unencrypted. Your identity commitment stays unchanged.
                </span>
              </p>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4 border-t border-border/30">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground gap-2 font-semibold"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 rounded-lg border border-border/50 bg-muted/5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>How Profile Works:</strong> Your username and bio are optional metadata that you can selectively disclose when sharing QR codes. They do not affect your core identity commitment, which remains immutable and linked to your wallet.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
