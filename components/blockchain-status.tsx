'use client'

import { CheckCircle, ExternalLink, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ZK_CONFIG = {
  programId: 'shadowid_v2.aleo',
  transactionId: 'at1kqn24hdqxqq0u5nmu4xgq7usjy2lcv8e2ksdl5ufnfay5mde258q8rwa90',
  network: 'testnet',
  explorerUrl: 'https://explorer.aleo.org',
}

export function BlockchainStatus() {
  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Zero-Knowledge Proofs Enabled</p>
          <p className="text-xs text-muted-foreground mt-1">
            Advanced ZK verifiable credentials via {ZK_CONFIG.programId}
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="border-accent/40 text-accent hover:bg-accent/10 gap-2 text-xs"
              onClick={() => window.open(`${ZK_CONFIG.explorerUrl}/transaction/${ZK_CONFIG.transactionId}`, '_blank')}
            >
              View Deployment
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-accent/40 text-accent hover:bg-accent/10 gap-2 text-xs"
              onClick={() => window.open(`${ZK_CONFIG.explorerUrl}/program/${ZK_CONFIG.programId}`, '_blank')}
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
