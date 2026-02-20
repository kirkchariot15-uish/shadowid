'use client'

import { useState } from 'react'
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react'
import { WalletMultiButton } from '@/components/wallet-button'
import { Button } from '@/components/ui/button'
import { Lock, ArrowLeft, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { clearActivityLogs } from '@/lib/activity-logger'

export default function SettingsPage() {
  const { isConnected, address } = useAleoWallet()
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteComplete, setDeleteComplete] = useState(false)

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-foreground font-semibold">Connect Wallet Required</p>
          <WalletMultiButton />
        </div>
      </div>
    )
  }

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') {
      alert('Please type DELETE to confirm')
      return
    }

    setIsDeleting(true)

    try {
      // Clear all local data
      localStorage.removeItem('shadowid-encrypted-bundle')
      localStorage.removeItem('shadowid-commitment')
      localStorage.removeItem('shadowid-created-at')
      localStorage.removeItem('shadowid-user-info')
      localStorage.removeItem('shadowid-photo-encrypted')
      localStorage.removeItem('shadowid-photo-commitment')
      clearActivityLogs()

      setDeleteComplete(true)
      setDeleteConfirm(false)
      setDeleteInput('')

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (error) {
      console.error('[v0] Error deleting account:', error)
      alert('Error deleting account. Please try again.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-20 pb-32">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your ShadowID account</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-blue-500/40 text-blue-600 hover:bg-blue-500/10 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        {deleteComplete && (
          <div className="mb-6 p-4 rounded-lg border border-green-500/30 bg-green-500/5 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-600">Account Deleted</p>
              <p className="text-sm text-green-600/80 mt-1">All your data has been securely deleted. Redirecting to home...</p>
            </div>
          </div>
        )}

        {/* Account Information */}
        <div className="rounded-lg border border-border bg-card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-1">Wallet Address</p>
              <p className="font-mono text-sm break-all bg-muted/20 p-3 rounded-lg border border-border">{address}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-1">Account Status</p>
              <p className="text-sm text-foreground">Active · Connected</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-1">Created</p>
              <p className="text-sm text-foreground">
                {localStorage.getItem('shadowid-created-at') 
                  ? new Date(localStorage.getItem('shadowid-created-at')!).toLocaleDateString()
                  : 'Not yet created'}
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-600">Danger Zone</h3>
              <p className="text-sm text-red-600/80 mt-1">Irreversible actions. Proceed with caution.</p>
            </div>
          </div>

          {!deleteConfirm ? (
            <Button
              onClick={() => setDeleteConfirm(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account & All Data
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                <h4 className="font-semibold text-red-600 mb-2">Delete Account?</h4>
                <p className="text-sm text-red-600/80 mb-4 leading-relaxed">
                  This action will permanently delete:
                </p>
                <ul className="text-sm text-red-600/80 space-y-1 mb-4 list-disc list-inside">
                  <li>All encrypted identity data</li>
                  <li>All QR codes and commitments</li>
                  <li>All activity logs and history</li>
                  <li>All local stored information</li>
                </ul>
                <p className="text-sm text-red-600 font-semibold mb-4">
                  This action CANNOT be undone.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  To confirm, type <span className="font-mono font-bold text-foreground">DELETE</span> below:
                </p>
                <input
                  type="text"
                  placeholder="Type DELETE to confirm"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground mb-4 text-sm"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setDeleteConfirm(false)
                      setDeleteInput('')
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={deleteInput !== 'DELETE' || isDeleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 rounded-lg border border-border bg-muted/20">
          <p className="text-xs text-muted-foreground leading-relaxed">
            ShadowID stores all data locally in your browser. Deleting your account clears all local storage. Since everything is encrypted and client-side, no data is stored on external servers.
          </p>
        </div>
      </div>
    </div>
  )
}
