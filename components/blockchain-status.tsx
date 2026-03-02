'use client'

import { CheckCircle, ExternalLink, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CONTRACTS } from '@/lib/aleo-sdk-integration'

const ZK_CONFIG = {
  programId: CONTRACTS.SHADOWID.name,
  transactionId: CONTRACTS.SHADOWID.transactionId,
  network: 'testnet',
  explorerUrl: 'https://explorer.aleo.org',
}

export function BlockchainStatus() {
  return null
}
