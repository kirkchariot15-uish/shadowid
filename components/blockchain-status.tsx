'use client'

import { CheckCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ALEO_CONFIG } from '@/lib/aleo-contract'

export function BlockchainStatus() {
  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
      <div className="flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Blockchain Enabled</p>
          <p className="text-xs text-muted-foreground mt-1">
            Commitments are registered on Aleo Testnet via {ALEO_CONFIG.programId}
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="border-accent/40 text-accent hover:bg-accent/10 gap-2 text-xs"
              onClick={() => window.open(`${ALEO_CONFIG.explorerUrl}/transaction/${ALEO_CONFIG.transactionId}`, '_blank')}
            >
              View Deployment
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-accent/40 text-accent hover:bg-accent/10 gap-2 text-xs"
              onClick={() => window.open(`${ALEO_CONFIG.explorerUrl}/program/${ALEO_CONFIG.programId}`, '_blank')}
            >
              View Contract
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
