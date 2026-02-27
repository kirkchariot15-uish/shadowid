'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAleoWallet } from '@/hooks/use-aleo-wallet'
import { WalletMultiButton } from '@/components/wallet-button'
import { Button } from '@/components/ui/button'
import { Menu, X, Home, FileText, Settings, User, Shield, Award, CheckCircle } from 'lucide-react'

export function NavigationMenu() {
  const { address } = useAleoWallet()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isLandingPage = pathname === '/'

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/create-identity', label: 'Create Identity', icon: FileText },
    { href: '/selective-disclosure', label: 'Disclosure', icon: FileText },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/credentials', label: 'My Credentials', icon: Award },
    { href: '/request-attestation', label: 'Request Attestation', icon: CheckCircle },
    { href: '/privacy', label: 'Privacy Center', icon: Shield },
    { href: '/verify-qr', label: 'Verify QR Code', icon: CheckCircle },
    { href: '/dao-leader', label: 'DAO Leader Dashboard', icon: Shield },
    { href: '/logs', label: 'Activity Logs', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      {!isLandingPage && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-lg bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 transition-all"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      )}

      <div className="fixed top-6 right-6 z-40">
        <WalletMultiButton />
      </div>

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

            {navigationItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <IconComponent className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}

            {address && (
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
