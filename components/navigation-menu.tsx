'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAleoWallet } from '@/lib/wallet-provider'
import { WalletMultiButton } from '@/components/wallet-button'
import { Button } from '@/components/ui/button'
import { Menu, X, Home, FileText, Settings, User, Shield, Award, CheckCircle } from 'lucide-react'

export function NavigationMenu() {
  const { isConnected, address } = useAleoWallet()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  
  // Hide hamburger on landing page (when pathname is '/')
  const isLandingPage = pathname === '/'

  return (
    <>
      {/* Hamburger Menu Button - Bottom Right (hidden on landing page) */}
      {!isLandingPage && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-lg bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 transition-all"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      )}

      {/* Wallet Button - Top Right */}
      <div className="fixed top-6 right-6 z-40">
        <WalletMultiButton />
      </div>

      {/* Navigation Menu - Visible on all devices */}
      {isOpen && (
        <div className="fixed inset-0 z-30">
          <div className="fixed inset-0 bg-black/20" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-full sm:w-80 bg-background border-l border-border p-6 space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">Navigation</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Home className="h-4 w-4 mr-3" />
                Dashboard
              </Button>
            </Link>

            <Link href="/create-identity" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-3" />
                Create Identity
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

            <Link href="/credentials" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Award className="h-4 w-4 mr-3" />
                My Credentials
              </Button>
            </Link>

            <Link href="/request-attestation" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-3" />
                Request Attestation
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

            {isConnected && address && (
              <div className="border-t border-border pt-4 mt-4">
                <p className="text-xs text-muted-foreground">
                  Connected: {address?.slice(0, 8)}...{address?.slice(-6)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

      {/* Navigation Menu - Visible on all devices */}
      {isOpen && (
        <div className="fixed inset-0 z-30">
          <div className="fixed inset-0 bg-black/20" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-full sm:w-80 bg-background border-l border-border p-6 space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm uppercase tracking-wide font-semibold text-muted-foreground">Navigation</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Home className="h-4 w-4 mr-3" />
                Dashboard
              </Button>
            </Link>

            <Link href="/create-identity" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-3" />
                Create Identity
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

            <Link href="/credentials" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <Award className="h-4 w-4 mr-3" />
                My Credentials
              </Button>
            </Link>

            <Link href="/request-attestation" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-3" />
                Request Attestation
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

            {isConnected && address && (
              <div className="border-t border-border pt-4 mt-4">
                <p className="text-xs text-muted-foreground">
                  Connected: {address?.slice(0, 8)}...{address?.slice(-6)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
