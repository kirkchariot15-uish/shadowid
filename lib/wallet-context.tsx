'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  loading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const aleo = (window as any).aleo;
        if (aleo?.getAccounts) {
          const accounts = await aleo.getAccounts();
          if (accounts?.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          }
        }
      } catch (err) {
        console.log('[v0] No wallet connection on startup');
      }
    };

    checkWalletConnection();
  }, []);

  const connect = async () => {
    setLoading(true);
    setError(null);
    try {
      const aleo = (window as any).aleo;
      if (!aleo) {
        setError('Aleo wallet not installed');
        setLoading(false);
        return;
      }

      console.log('[v0] Requesting wallet connection...');
      const accounts = await aleo.requestAccounts();
      console.log('[v0] Wallet response:', accounts);
      
      if (accounts?.length > 0) {
        const firstAccount = accounts[0];
        console.log('[v0] Connected account:', firstAccount);
        setAddress(firstAccount);
        setIsConnected(true);
      } else {
        setError('No accounts returned from wallet');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      setError(msg);
      console.error('[v0] Wallet connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setError(null);
  };

  return (
    <WalletContext.Provider value={{ address, isConnected, connect, disconnect, loading, error }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used inside WalletProvider');
  }
  return context;
}
