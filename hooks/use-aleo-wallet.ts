'use client';

import { useCallback, useState, useEffect } from 'react';

interface ExecuteTransactionParams {
  program: string;
  function: string;
  inputs: string[];
  fee: number;
  privateFee?: boolean;
}

interface TransactionResult {
  transactionId: string;
  error?: string;
}

// Default return value for SSR / before the Aleo provider is mounted
const SSR_DEFAULTS = {
  isConnected: false,
  connecting: false,
  reconnecting: false,
  address: null as string | null,
  publicKey: null as string | null,
  wallet: null as string | null,
  wallets: [] as unknown[],
  selectedWallet: null,
  network: null,
  isLoading: false,
  error: null as string | null,
  switchNetwork: async () => {},
  executeTransaction: async () => {
    throw new Error('Wallet not connected');
  },
  signMessage: async () => {
    throw new Error('Wallet not connected');
  },
  requestRecords: async () => {
    throw new Error('Wallet not connected');
  },
  decrypt: async () => {
    throw new Error('Wallet not connected');
  },
  getTransactionStatus: async () => {
    throw new Error('Wallet not connected');
  },
} as const;

export function useAleoWallet() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track mounted state so we only access the Aleo context client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or before mount, the Aleo provider isn't available
  if (!mounted || typeof window === 'undefined') {
    return SSR_DEFAULTS;
  }

  // Dynamically require the hook only on the client after mount
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useAleoWalletClient(isLoading, setIsLoading, error, setError);
}

// This function is ONLY called client-side after mount, so useWallet() is safe
function useAleoWalletClient(
  isLoading: boolean,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  error: string | null,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useWallet } = require('@provablehq/aleo-wallet-adaptor-react');

  const {
    wallet,
    address,
    publicKey,
    wallets,
    connected,
    connecting,
    reconnecting,
    network,
    switchNetwork,
    signMessage,
    requestRecords,
    decrypt,
    executeTransaction: walletExecuteTransaction,
    transactionStatus: walletTransactionStatus,
  } = useWallet();

  const executeTransaction = useCallback(
    async (params: ExecuteTransactionParams): Promise<TransactionResult> => {
      if (!connected || !address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const tx = await walletExecuteTransaction({
          program: params.program,
          function: params.function,
          inputs: params.inputs,
          fee: params.fee,
          privateFee: params.privateFee ?? false,
        });

        if (tx?.transactionId) {
          return { transactionId: tx.transactionId };
        }

        throw new Error('Failed to get transaction ID');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Transaction failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [connected, address, walletExecuteTransaction, setIsLoading, setError]
  );

  const signMessageRequest = useCallback(
    async (message: string): Promise<Uint8Array> => {
      if (!connected || !address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const bytes = new TextEncoder().encode(message);
        const signature = await signMessage(bytes);
        return signature;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Signing failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [connected, address, signMessage, setIsLoading, setError]
  );

  return {
    isConnected: connected,
    connecting,
    reconnecting,
    address,
    publicKey,
    wallet: wallet?.adapter.name || null,
    wallets,
    selectedWallet: wallet,
    network,
    isLoading,
    error,
    switchNetwork,
    executeTransaction,
    signMessage: signMessageRequest,
    requestRecords,
    decrypt,
    getTransactionStatus: async (txId: string) => {
      if (!walletTransactionStatus) throw new Error('Wallet does not support transaction status');
      return walletTransactionStatus(txId);
    },
  };
}
