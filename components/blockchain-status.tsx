'use client'

import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BlockchainStatus() {
  // Check if contract is deployed (you'll set this env var after deployment)
  const isDeployed = process.env.NEXT_PUBLIC_ALEO_PROGRAM_ID !== undefined && 
                     process.env.NEXT_PUBLIC_ALEO_PROGRAM_ID !== ''
  
  if (isDeployed) {
    return (
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Blockchain Enabled</p>
          <p className="text-xs text-muted-foreground mt-1">
            Commitments are registered on Aleo blockchain
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">Simulation Mode</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          The smart contract is ready but not deployed. Commitments are stored locally for development. 
          Deploy the contract to enable on-chain registration.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 border-yellow-500/40 text-yellow-600 hover:bg-yellow-500/10 gap-2 text-xs"
          onClick={() => window.open('/contracts/DEPLOYMENT.md', '_blank')}
        >
          View Deployment Guide
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
