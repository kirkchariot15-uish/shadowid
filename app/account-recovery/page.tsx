'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Lock, Zap } from 'lucide-react'
import { validateAdminAccess, setAdminSession, logAdminAction } from '@/lib/admin-system'

export default function AccountRecoveryPage() {
  const router = useRouter()
  const [commitmentInput, setCommitmentInput] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [recovered, setRecovered] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRecoverAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const trimmedInput = commitmentInput.trim()

      // Check if this is an admin access attempt
      if (trimmedInput.startsWith('Aleo2Admin')) {
        const validation = validateAdminAccess(trimmedInput, adminPassword)
        
        if (!validation.isValid) {
          setError('Invalid admin password or commitment hash format')
          setLoading(false)
          return
        }

        // Valid admin access
        const commitmentHash = validation.commitmentHash!
        
        // Determine if this is a mini-admin or global admin
        // In production, this would be verified against a database
        const isMiniAdmin = localStorage.getItem(`mini-admin-${commitmentHash}`)
        const role = isMiniAdmin ? 'mini_admin' : 'global_admin'
        const miniAdminType = isMiniAdmin ? JSON.parse(isMiniAdmin).type : undefined

        // Set admin session
        setAdminSession(commitmentHash, role, miniAdminType)

        // Log admin access
        logAdminAction(
          commitmentHash,
          role,
          'admin_login',
          undefined,
          { method: 'password', miniAdminType }
        )

        setIsAdmin(true)
        setRecovered(true)

        // Redirect to appropriate admin panel after 2 seconds
        setTimeout(() => {
          if (role === 'global_admin') {
            router.push('/admin')
          } else {
            router.push('/admin/mini-admin')
          }
        }, 2000)
      } else {
        // Regular account recovery with commitment hash
        if (!trimmedInput || trimmedInput.length < 40) {
          setError('Please enter a valid commitment hash')
          setLoading(false)
          return
        }

        // Store commitment for recovery
        localStorage.setItem('shadowid-commitment', trimmedInput)
        localStorage.setItem('account-recovery-time', new Date().toISOString())

        setRecovered(true)

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (err) {
      console.error('[v0] Recovery error:', err)
      setError('An error occurred during recovery. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-accent/30 bg-card p-8 shadow-lg">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-accent" />
              </div>
              <h1 className="text-3xl font-bold">Account Recovery</h1>
            </div>
            <p className="text-muted-foreground">
              Recover your ShadowID account or access the admin panel using your commitment hash.
            </p>
          </div>

          {recovered && (
            <div className="mb-8 p-4 rounded-lg bg-accent/10 border border-accent/30 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-accent mb-1">
                  {isAdmin ? 'Admin Access Granted' : 'Account Recovered'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isAdmin 
                    ? 'Redirecting to admin panel...' 
                    : 'Your commitment hash has been restored. Redirecting to dashboard...'}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive mb-1">Error</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleRecoverAccount} className="space-y-6">
            {/* Commitment Hash Input */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Commitment Hash
              </label>
              <input
                type="text"
                value={commitmentInput}
                onChange={(e) => setCommitmentInput(e.target.value)}
                placeholder="Enter your commitment hash or Aleo2Admin{hash} for admin access"
                className="w-full px-4 py-3 bg-background border border-accent/20 rounded-lg text-foreground placeholder-muted-foreground focus:border-accent/50 focus:outline-none transition-colors"
                disabled={loading || recovered}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Your commitment hash is a long alphanumeric string starting with your identity commitment.
              </p>
            </div>

            {/* Admin Password - Only show if Aleo2Admin prefix detected */}
            {commitmentInput.trim().startsWith('Aleo2Admin') && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Admin Access Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 bg-background border border-accent/20 rounded-lg text-foreground placeholder-muted-foreground focus:border-accent/50 focus:outline-none transition-colors"
                  disabled={loading || recovered}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Global admins can use the Aleo2Admin prefix followed by their commitment hash to access the admin panel.
                </p>
              </div>
            )}

            {/* Info Section */}
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-bold text-accent uppercase mb-1">Regular Recovery</p>
                  <p className="text-muted-foreground">Enter commitment hash to restore account</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-accent uppercase mb-1">Admin Access</p>
                  <p className="text-muted-foreground">Prefix with Aleo2Admin for secured admin panel</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!commitmentInput.trim() || (commitmentInput.trim().startsWith('Aleo2Admin') && !adminPassword) || loading || recovered}
              className="w-full bg-accent hover:bg-accent/90 gap-2"
            >
              <Zap className="h-4 w-4" />
              {loading ? 'Processing...' : 'Recover Account'}
            </Button>

            {/* Security Notice */}
            <div className="p-4 rounded-lg bg-background border border-accent/20">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-accent">Security Note:</span> Never share your commitment hash or admin password. This recovery page uses secure, local storage only. Your identity data is never transmitted.
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
