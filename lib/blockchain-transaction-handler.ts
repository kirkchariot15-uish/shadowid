/**
 * Blockchain Transaction Handler
 * Provides a robust wrapper around wallet executeTransaction calls
 * Handles scope issues and ensures proper function passing
 */

export interface TransactionParams {
  program: string;
  functionName: string;
  inputs: string[];
  fee?: number;
  privateFee?: boolean;
  getTransactionStatus?: (txId: string) => Promise<string | null>; // Wallet SDK method
}

export interface TransactionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// Track pending transactions to prevent duplicates
const pendingTransactions = new Map<string, Promise<TransactionResult>>();

/**
 * Generate a transaction key to identify duplicates
 * Key = program + functionName + inputs (prevents same tx being submitted twice)
 */
function generateTransactionKey(params: TransactionParams): string {
  const inputsHash = params.inputs.join('|');
  return `${params.program}:${params.functionName}:${inputsHash}`;
}

/**
 * Wait for transaction confirmation using wallet SDK instead of explorer
 * Much more reliable than polling external API
 */
async function waitForTransactionConfirmation(
  transactionId: string,
  getStatusFn: ((txId: string) => Promise<string | null>) | undefined,
  maxWaitMs: number = 60 * 1000 // 1 minute
): Promise<{ confirmed: boolean; status?: string; error?: string }> {
  if (!getStatusFn) {
    console.warn('[v0] No getTransactionStatus function provided, skipping confirmation');
    return { confirmed: true, status: 'PENDING' };
  }

  const pollIntervalMs = 1000; // Check every 1 second
  const startTime = Date.now();

  console.log('[v0] Waiting for transaction confirmation via wallet SDK:', transactionId);

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const status = await getStatusFn(transactionId);
      console.log('[v0] Transaction status from wallet SDK:', status);
      console.log('[v0] Status type:', typeof status);
      console.log('[v0] Status stringified:', String(status));
      console.log('[v0] Status uppercase:', String(status).toUpperCase());

      if (!status) {
        // Status not available yet, keep polling
        console.log('[v0] Status is null/undefined, retrying...');
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
        continue;
      }

      // Check for confirmed states (handle various formats)
      const upperStatus = String(status).toUpperCase();
      console.log('[v0] Checking upper status:', upperStatus);
      
      if (upperStatus.includes('ACCEPTED') || upperStatus.includes('FINALIZED') || upperStatus.includes('CONFIRMED')) {
        console.log('[v0] ✅ Transaction CONFIRMED by wallet:', status);
        return { confirmed: true, status };
      }

      // Check for failed states
      if (upperStatus.includes('REJECTED') || upperStatus.includes('FAILED')) {
        console.error('[v0] ❌ Transaction FAILED:', status);
        return { confirmed: false, status, error: `Transaction ${status}` };
      }

      // Check for pending/submitted states
      if (upperStatus.includes('PENDING') || upperStatus.includes('SUBMITTED') || upperStatus.includes('PROCESSING')) {
        console.log('[v0] ⏳ Transaction still pending:', status);
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
        continue;
      }

      // Unknown status - log and keep trying
      console.log('[v0] ⚠️ Unknown status, continuing to poll:', status);
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    } catch (error) {
      console.warn('[v0] Error checking transaction status:', error);
      // Continue polling on error
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return { confirmed: false, error: 'Transaction confirmation timeout after 1 minute' };
}

/**
 * Safely execute a wallet transaction with validation, error handling, and retry logic
 * Prevents duplicate transactions and retries on failure
 */
export async function executeWalletTransaction(
  transactionFn: (params: any) => Promise<string>,
  params: TransactionParams,
  maxRetries: number = 2
): Promise<TransactionResult> {
  const txKey = generateTransactionKey(params);

  // Check for duplicate in-flight transaction
  if (pendingTransactions.has(txKey)) {
    console.warn('[v0] Duplicate transaction detected, using existing request:', txKey);
    return pendingTransactions.get(txKey)!;
  }

  // Create the transaction promise
  const txPromise = executeTransactionWithRetry(transactionFn, params, maxRetries);

  // Store it to prevent duplicates
  pendingTransactions.set(txKey, txPromise);

  try {
    const result = await txPromise;
    return result;
  } finally {
    // Remove from pending after completion
    pendingTransactions.delete(txKey);
  }
}

/**
 * Execute transaction with exponential backoff retry on failure
 */
async function executeTransactionWithRetry(
  transactionFn: (params: any) => Promise<string>,
  params: TransactionParams,
  maxRetries: number
): Promise<TransactionResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Pre-flight checks
      if (!transactionFn || typeof transactionFn !== 'function') {
        console.error('[v0] executeTransaction function is not available');
        return {
          success: false,
          error: 'Wallet executeTransaction not available. Please ensure wallet is connected.',
        };
      }

      if (!params.program || !params.functionName || !params.inputs) {
        return {
          success: false,
          error: 'Invalid transaction parameters: missing program, functionName, or inputs',
        };
      }

      console.log(`[v0] Transaction attempt ${attempt}/${maxRetries}:`, {
        program: params.program,
        functionName: params.functionName,
        inputsCount: params.inputs.length,
      });

      // Prepare transaction object matching the wallet hook API
      const txObj = {
        transitions: [
          {
            program: params.program,
            functionName: params.functionName,
            inputs: params.inputs,
          }
        ],
        fee: params.fee || 100000,
        feePrivate: params.privateFee ?? false,
      };

      // Execute transaction
      const transactionId = await transactionFn(txObj);

      if (!transactionId || transactionId.trim() === '') {
        throw new Error('Wallet returned empty transaction ID');
      }

      console.log('[v0] Transaction executed successfully:', transactionId);
      
      // CRITICAL: Wait for blockchain confirmation using wallet SDK
      const confirmationResult = await waitForTransactionConfirmation(
        transactionId,
        params.getTransactionStatus,
        60000 // 1 minute timeout
      );
      
      if (!confirmationResult.confirmed) {
        console.error('[v0] Transaction not confirmed:', confirmationResult.error);
        return {
          success: false,
          transactionId,
          error: confirmationResult.error || 'Transaction not confirmed by blockchain',
        };
      }
      
      console.log('[v0] Transaction confirmed on blockchain:', transactionId);
      return {
        success: true,
        transactionId,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errorMsg = lastError.message;

      // Check if error is retryable
      const isRetryable = errorMsg.includes('timeout') || 
                         errorMsg.includes('network') || 
                         errorMsg.includes('ECONNREFUSED') ||
                         errorMsg.includes('429'); // Rate limited

      if (isRetryable && attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = Math.pow(2, attempt - 1) * 1000;
        console.warn(`[v0] Transaction failed (attempt ${attempt}), retrying in ${delayMs}ms:`, errorMsg);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      } else {
        // Non-retryable error or max retries reached
        console.error(`[v0] Transaction failed permanently:`, errorMsg);
        return {
          success: false,
          error: errorMsg,
        };
      }
    }
  }

  // Should never reach here, but handle it
  return {
    success: false,
    error: lastError?.message || 'Transaction failed after retries',
  };
}

/**
 * Validate that a wallet function is properly available and callable
 */
export function validateWalletFunction(fn: any): boolean {
  if (!fn) {
    console.warn('[v0] Wallet function is null or undefined');
    return false;
  }

  if (typeof fn !== 'function') {
    console.warn('[v0] Wallet function is not a function:', typeof fn);
    return false;
  }

  return true;
}

/**
 * Debug helper to check wallet connection status
 */
export function debugWalletState(walletAddress: string | null, executeTransactionFn: any): void {
  console.log('[v0] Wallet State Debug:');
  console.log('[v0]   Address connected:', !!walletAddress);
  console.log('[v0]   Address value:', walletAddress);
  console.log('[v0]   executeTransaction exists:', !!executeTransactionFn);
  console.log('[v0]   executeTransaction type:', typeof executeTransactionFn);
  console.log('[v0]   executeTransaction is function:', typeof executeTransactionFn === 'function');
}
