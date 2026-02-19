'use client'

import { ReactNode } from 'react'
import { AleoWalletProvider, useAleoWallet } from '@/hooks/use-aleo-wallet'

export function WalletProviderComponent({ children }: { children: ReactNode }) {
  return <AleoWalletProvider>{children}</AleoWalletProvider>
}

export { useAleoWallet }
