'use client';

import { useCallback, useState, useRef } from 'react';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';

/**
 * Aleo Wallet Hook - uses @provablehq/aleo-wallet-adaptor-react v0.3.0-alpha.3
 *
 * The correct API is:
 *   executeTransaction({ program, function, inputs, fee?, privateFee? })
 *   => Promise<{ transactionId: string } | undefined>
 *
 * Inputs must be typed Aleo strings like "123u64", "456field", "aleo1...address"
 * Fee is in microcredits (1 ALEO = 1_000_000 microcredits)
 */

export interface AleoTransition {
  program: string;
  functionName: string;
  inputs: string[];
}

export interface AleoTransactionRequest {
  transitions: AleoTransition[];
  fee: number; // in microcredits
  feePrivate?: boolean;
}

export function useAleoWallet() {
  const {
    wallet,
    address,
    wallets,
    connected,
    connecting,
    reconnecting,
    network,
    switchNetwork,
    signMessage: walletSignMessage,
    requestRecords,
    decrypt,
    executeTransaction: walletExecuteTransaction,
    transactionStatus,
  } = useWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track in-flight transaction to prevent double-submissions
  const transactionInFlightRef = useRef(false);

  /**
   * Execute a transaction on the Aleo network.
   * Uses executeTransaction(TransactionOptions) from @provablehq/aleo-wallet-adaptor-react.
   * TransactionOptions: { program, function, inputs, fee?, privateFee? }
   * Returns: Promise<{ transactionId: string } | undefined>
   * Works with ALL wallets: Leo, Shield, Puzzle, Fox, Soter.
   */
  const executeTransaction = useCallback(
    async (params: AleoTransactionRequest): Promise<string> => {
      // Prevent double-submission - return existing promise if already in flight
      if (transactionInFlightRef.current) {
        throw new Error('Transaction already in progress');
      }

      if (!walletExecuteTransaction) {
        throw new Error('Wallet not connected or does not support transactions');
      }

      transactionInFlightRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const transition = params.transitions[0];
        if (!transition) {
          throw new Error('No transition provided');
        }

        // TransactionOptions per @provablehq/aleo-types
        const result = await walletExecuteTransaction({
          program: transition.program,
          function: transition.functionName,
          inputs: transition.inputs,
          fee: params.fee,
          privateFee: params.feePrivate ?? false,
        });

        if (!result || !result.transactionId) {
          throw new Error('No transaction ID returned from wallet');
        }

        return result.transactionId;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Transaction failed';
        console.error('[v0] Transaction error:', errorMsg);
        setError(errorMsg);
        throw err;
      } finally {
        transactionInFlightRef.current = false;
        setIsLoading(false);
      }
    },
    [wallet, walletExecuteTransaction]
  );

  /**
   * Sign a message with the wallet
   */
  const signMessage = useCallback(
    async (message: string): Promise<Uint8Array> => {
      if (!walletSignMessage) {
        throw new Error('Wallet does not support signMessage');
      }

      setIsLoading(true);
      setError(null);

      try {
        const bytes = new TextEncoder().encode(message);
        const signature = await walletSignMessage(bytes);
        return signature;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Signing failed';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [walletSignMessage]
  );

  /**
   * Get actual transaction hash from wallet's shield transaction ID
   * The wallet returns "shield_..." ID, but we need the real Aleo TX hash
   * The real hash is available via the transactionStatus API
   */
  const getActualTxHash = useCallback(
    async (shieldTxId: string): Promise<string> => {
      try {
        // If it's already a proper transaction hash (starts with "at1"), return it
        if (shieldTxId && shieldTxId.startsWith('at1')) {
          return shieldTxId;
        }
        
        // If it's a shield ID, check immediately first, then wait if needed
        if (shieldTxId && shieldTxId.startsWith('shield_')) {
          // Try up to 3 times max (9 seconds total instead of 30)
          for (let i = 0; i < 3; i++) {
            try {
              const status = await transactionStatus(shieldTxId);
              
              if (status && typeof status === 'object') {
                // Look for the actual blockchain transaction ID
                const possibleHash = (status as any).transactionId || 
                                    (status as any).txId ||
                                    (status as any).txHash || 
                                    (status as any).hash ||
                                    (status as any).tx;
                
                if (possibleHash && possibleHash.startsWith('at1')) {
                  return possibleHash;
                }
              }
            } catch (checkErr) {
              // Continue to next attempt
            }
            
            // Only wait if not the last iteration
            if (i < 2) {
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          }
        }
        
        return shieldTxId;
      } catch (err) {
        return shieldTxId;
      }
    },
    [transactionStatus]
  );

  const getTransactionStatus = useCallback(
    async (transactionId: string): Promise<string | null> => {
      if (!transactionStatus) {
        console.log('[v0] Wallet does not support transactionStatus');
        return null;
      }
      try {
        const result = await transactionStatus(transactionId);
        console.log('[v0] Raw transactionStatus result:', result, typeof result);
        // Normalize: could be a string or an object depending on wallet
        if (typeof result === 'string') return result;
        if (result && typeof result === 'object' && 'status' in result) return (result as any).status;
        return String(result);
      } catch (err) {
        console.log('[v0] transactionStatus error:', err);
        return null;
      }
    },
    [transactionStatus]
  );

  return {
    isConnected: connected,
    connecting,
    reconnecting,
    address,
    publicKey: address,
    wallet: wallet?.adapter?.name || null,
    wallets,
    selectedWallet: wallet,
    network,
    isLoading,
    error,

    // Actions
    switchNetwork,
    executeTransaction,
    signMessage,
    requestRecords,
    decrypt,
    getTransactionStatus,
    getActualTxHash,
    disconnect: () => {
      // Disconnect from the wallet adapter
      console.log('[v0] Wallet disconnecting...')
      // This will trigger reconnection logic to reset the wallet state
      window.location.href = '/'
    },
  };
}
