'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { WalletMultiButton } from '@/components/wallet-button'
import { Button } from '@/components/ui/button'
import { Menu, X, Home, FileText, Settings, LogOut, User, Shield, Award, CheckCircle } from 'lucide-react'
import { NavigationMenu } from '@/components/navigation-menu'

export function Navigation() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR and before hydration, render minimal placeholder
  if (!mounted) {
    return (
      <div className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto w-full flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <span className="text-sm font-bold text-accent-foreground">σ</span>
            </div>
            <span className="text-lg font-bold">ShadowID</span>
          </Link>
        </div>
      </div>
    )
  }

  return <NavigationMenu />
}
