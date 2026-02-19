'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface WalletContextType {
  isWalletConnected: boolean
  setIsWalletConnected: (connected: boolean) => void
}

const WalletContext = createContext<WalletContextType>({
  isWalletConnected: false,
  setIsWalletConnected: () => {},
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  return (
    <WalletContext.Provider value={{ isWalletConnected, setIsWalletConnected }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}
