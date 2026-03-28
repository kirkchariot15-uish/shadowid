'use client'

import React, { useState, useEffect } from 'react'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { WalletMultiButton } from '@/components/wallet-button'
import { Button } from '@/components/ui/button'
import { Lock, LogOut } from 'lucide-react'
import Link from 'next/link'
import { getAdminStore } from '@/lib/admin-store'
import { AdminPanel } from '@/components/admin-panel'
import { MiniAdminPanel } from '@/components/mini-admin-panel'
import type { AdminUser } from '@/lib/admin-system'

export default function AdminPage() {
  const { address, disconnect } = useAleoWallet()
  const isConnected = !!address
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConnected && address) {
      const adminStore = getAdminStore()
      const adminUser = adminStore.getAdmin(address)
      setAdmin(adminUser || null)
    }
    setLoading(false)
  }, [address, isConnected])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="text-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-foreground font-semibold">Access Denied</p>
          <p className="text-muted-foreground">You do not have admin privileges</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">Admin Control Panel</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {admin.adminType === 'global' || admin.adminType === 'universal' 
                ? 'Global Administrator' 
                : `${admin.adminType.charAt(0).toUpperCase() + admin.adminType.slice(1)} Administrator`}
              {admin.organization && ` • ${admin.organization}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                disconnect()
                window.location.href = '/'
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="py-8">
        {admin.adminType === 'global' || admin.adminType === 'universal' ? (
          <AdminPanel adminWallet={address!} adminType={admin.adminType} />
        ) : (
          <MiniAdminPanel
            adminWallet={address!}
            adminType={admin.adminType}
            organization={admin.organization}
          />
        )}
      </div>
    </div>
  )
}
