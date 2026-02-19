'use client';
import { useCallback, useState } from 'react';

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

let useWalletHook: any = null;

// Safely import the wallet hook only when needed
try {
  const module = require('@provablehq/aleo-wallet-adaptor-react');
  useWalletHook = module.useWallet;
} catch (e) {
  console.warn('[v0] Wallet adaptor not available:', e);
}

export function useAleoWallet() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback values if wallet is not available
  let walletState = {
    wallet: null,
    address: null,
    publicKey: null,
    wallets: [],
    connected: false,
    connecting: false,
    reconnecting: false,
    network: 'testnet',
    switchNetwork: async () => {},
    signMessage: async () => new Uint8Array(),
    requestRecords: async () => ({}),
    decrypt: async () => new Uint8Array(),
    executeTransaction: async () => ({ transactionId: '' }),
    transactionStatus: async () => ({}),
  };

  // Try to use the real wallet hook if available
  if (useWalletHook) {
    try {
      walletState = useWalletHook();
    } catch (hookError) {
      console.error('[v0] Error using wallet hook:', hookError);
      setError('Wallet connection unavailable');
    }
  }

  const executeTransaction = useCallback(
    async (params: ExecuteTransactionParams): Promise<TransactionResult> => {
      if (!walletState.connected || !walletState.address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        if (!walletState.executeTransaction) {
          throw new Error('Transaction execution not supported');
        }

        const tx = await walletState.executeTransaction({
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
    [walletState.connected, walletState.address, walletState.executeTransaction]
  );

  const signMessageRequest = useCallback(
    async (message: string): Promise<Uint8Array> => {
      if (!walletState.connected || !walletState.address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const bytes = new TextEncoder().encode(message);
        const signature = await walletState.signMessage(bytes);
        return signature;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Signing failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [walletState.connected, walletState.address, walletState.signMessage]
  );

  return {
    isConnected: walletState.connected,
    connecting: walletState.connecting,
    reconnecting: walletState.reconnecting,
    address: walletState.address,
    publicKey: walletState.publicKey,
    wallet: walletState.wallet?.adapter?.name || null,
    wallets: walletState.wallets,
    selectedWallet: walletState.wallet,
    network: walletState.network,
    isLoading,
    error,
    switchNetwork: walletState.switchNetwork,
    executeTransaction,
    signMessage: signMessageRequest,
    requestRecords: walletState.requestRecords,
    decrypt: walletState.decrypt,
    getTransactionStatus: async (txId: string) => {
      if (!walletState.transactionStatus) throw new Error('Wallet does not support transaction status');
      return walletState.transactionStatus(txId);
    },
  };
}
