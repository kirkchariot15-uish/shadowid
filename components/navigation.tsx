'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { WalletMultiButton } from '@/components/wallet-button'
import { Button } from '@/components/ui/button'
import { Menu, X, Home, FileText, Settings, LogOut, User, Shield } from 'lucide-react'

export function Navigation() {
  const { isConnected, address } = useAleoWallet()
  const [isOpen, setIsOpen] = useState(false)

  // If wallet not connected, show minimal nav with wallet button only
  if (!isConnected) {
    return (
      <div className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto w-full flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-accent-foreground">σ</span>
            </div>
            <span className="text-lg font-bold">ShadowID</span>
          </Link>
          
          <WalletMultiButton />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 md:hidden p-3 rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 transition-all"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl p-6 space-y-3 max-h-[70vh] overflow-y-auto">
            <h3 className="text-sm uppercase tracking-wide font-semibold text-muted-foreground mb-4">Navigation</h3>
            
            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Home className="h-4 w-4 mr-3" />
                Dashboard
              </Button>
            </Link>

            <Link href="/create-id" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-3" />
                Create ID
              </Button>
            </Link>

            <Link href="/selective-disclosure" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-3" />
                Disclosure
              </Button>
            </Link>

            <Link href="/profile" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <User className="h-4 w-4 mr-3" />
                Profile
              </Button>
            </Link>

            <Link href="/privacy" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-3" />
                Privacy Center
              </Button>
            </Link>

            <Link href="/logs" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-3" />
                Activity Logs
              </Button>
            </Link>

            <Link href="/settings" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </Button>
            </Link>

            <div className="border-t border-border pt-3 mt-3">
              <p className="text-xs text-muted-foreground mb-2">
                Wallet: {address?.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation Bar (Top) */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto w-full flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-accent-foreground">σ</span>
            </div>
            <span className="text-lg font-bold">ShadowID</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="rounded-full">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/create-id">
              <Button variant="ghost" size="sm" className="rounded-full">
                Create ID
              </Button>
            </Link>
            <Link href="/logs">
              <Button variant="ghost" size="sm" className="rounded-full">
                Logs
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="rounded-full">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <WalletMultiButton />
        </div>
      </div>
    </>
  )
}
