'use client'

import { CheckCircle, ExternalLink, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ALEO_CONFIG } from '@/lib/aleo-contract'

export function BlockchainStatus() {
  // Check if ZK contract is deployed
  const zkProgramId = process.env.NEXT_PUBLIC_ALEO_PROGRAM_ID
  const zkTransactionId = process.env.NEXT_PUBLIC_ALEO_TRANSACTION_ID
  const isZKDeployed = zkProgramId === 'shadowid_zk.aleo' && zkTransactionId
  
  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
      <div className="flex items-start gap-3">
        {isZKDeployed ? (
          <Sparkles className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
        ) : (
          <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            {isZKDeployed ? 'Zero-Knowledge Proofs Enabled' : 'Blockchain Enabled'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isZKDeployed 
              ? `Advanced ZK verifiable credentials via ${zkProgramId}`
              : `Commitments registered on Aleo Testnet via ${ALEO_CONFIG.programId}`
            }
          </p>
          <div className="flex gap-2 mt-3">
            {isZKDeployed && zkTransactionId ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-accent/40 text-accent hover:bg-accent/10 gap-2 text-xs"
                  onClick={() => window.open(`${ALEO_CONFIG.explorerUrl}/transaction/${zkTransactionId}`, '_blank')}
                >
                  View ZK Deployment
                  <ExternalLink className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-accent/40 text-accent hover:bg-accent/10 gap-2 text-xs"
                  onClick={() => window.open(`${ALEO_CONFIG.explorerUrl}/program/${zkProgramId}`, '_blank')}
                >
                  View ZK Contract
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
