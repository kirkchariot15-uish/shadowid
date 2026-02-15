'use client';

import { useCallback, useState } from 'react';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';

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

export function useAleoWallet() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    [connected, address, walletExecuteTransaction]
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
    [connected, address, signMessage]
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
