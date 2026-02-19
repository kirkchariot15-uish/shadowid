'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/lib/wallet-context'
import { ArrowRight } from 'lucide-react'

export function LandingHeroContent() {
  const { isConnected } = useWallet()

  return (
    <>
      {!isConnected ? (
        <p className="text-xs text-muted-foreground">
          Zero-knowledge secured via Aleo Testnet
        </p>
      ) : (
        <Link href="/dashboard">
          <Button size="lg" className="h-12 px-8 gap-2">
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      )}
    </>
  )
}
