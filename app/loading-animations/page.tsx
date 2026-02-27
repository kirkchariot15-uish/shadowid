'use client'

import { LoadingAnimationsShowcase } from '@/components/loading-animations'
import { Navigation } from '@/components/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function LoadingAnimationsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="border-accent/40 gap-2 mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <LoadingAnimationsShowcase />
      </main>
    </div>
  )
}
