'use client'

import { ReactNode } from 'react'
import { WalletProvider, useWallet } from '@/lib/wallet-context'

export function WalletProviderComponent({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>
}

// Re-export useWallet as useAleoWallet for backward compatibility
export const useAleoWallet = useWallet
export { useWallet }
