'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AleoWalletContextType {
  isConnected: boolean
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
  isLoading: boolean
  error: string | null
}

const AleoWalletContext = createContext<AleoWalletContextType | undefined>(undefined)

export function AleoWalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const connect = async () => {
    if (!mounted || !window.aleo) {
      setError('Aleo wallet not detected. Please install an Aleo wallet extension.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const accounts = await window.aleo.requestAccounts()
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)
        console.log('[v0] Wallet connected:', accounts[0])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet'
      setError(errorMessage)
      console.error('[v0] Wallet connection error:', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setError(null)
    console.log('[v0] Wallet disconnected')
  }

  return (
    <AleoWalletContext.Provider value={{ isConnected, address, connect, disconnect, isLoading, error }}>
      {children}
    </AleoWalletContext.Provider>
  )
}

export function useAleoWallet() {
  const context = useContext(AleoWalletContext)
  if (!context) {
    throw new Error('useAleoWallet must be used inside AleoWalletProvider')
  }
  return context
}

// Extend window object for Aleo wallet injection
declare global {
  interface Window {
    aleo?: {
      requestAccounts: () => Promise<string[]>
      getAccount: () => Promise<string | null>
      disconnect: () => Promise<void>
      on: (event: string, callback: (account: string) => void) => void
      requestViewKey: () => Promise<string>
      requestPrivateKey: () => Promise<string>
    }
  }
}
