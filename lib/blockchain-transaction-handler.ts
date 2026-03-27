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
 * Wait for transaction confirmation using wallet SDK with proper status normalization
 * Handles different wallet response formats by normalizing to lowercase
 */
async function waitForTransactionConfirmation(
  transactionId: string,
  getStatusFn: ((txId: string) => Promise<string | null>) | undefined,
  maxWaitMs: number = 300 * 1000 // 5 minutes max (increased from 3 for fee calculation timeout)
): Promise<{ confirmed: boolean; status?: string; error?: string }> {
  if (!getStatusFn) {
    return { confirmed: true, status: 'PENDING' };
  }
  
  // Check immediately first
  try {
    const initialStatus = await getStatusFn(transactionId);
    if (initialStatus) {
      const normalized = (initialStatus || '').toString().toLowerCase();
      
      if (normalized.includes('finalize') || normalized.includes('complete') || normalized.includes('accept')) {
        return { confirmed: true, status: initialStatus };
      }
      
      if (normalized.includes('reject') || normalized.includes('fail') || normalized.includes('abort')) {
        return { confirmed: false, status: initialStatus, error: `Transaction rejected: ${initialStatus}` };
      }
    }
  } catch (err) {
    // Continue to polling on error
  }

  // Poll every 2 seconds for up to 2 minutes (60 attempts)
  let pollCount = 0;
  const pollInterval = setInterval(() => {
    pollCount++;
  }, 1);

  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls

    try {
      const status = await getStatusFn(transactionId);
      
      // Normalize response to handle different wallet formats
      const statusStr = (status || '').toString().toLowerCase();

      if (!status) {
        continue;
      }

      // Check for CONFIRMED states
      if (statusStr.includes('finalize') || statusStr.includes('complete') || statusStr.includes('accept')) {
        clearInterval(pollInterval);
        return { confirmed: true, status };
      }

      // Check for REJECTED states
      if (statusStr.includes('reject') || statusStr.includes('fail') || statusStr.includes('abort')) {
        clearInterval(pollInterval);
        return { confirmed: false, status, error: `Transaction rejected: ${status}` };
      }

      // Still pending, continue polling
    } catch (error) {
      // Continue polling on error
      continue;
    }
  }

  clearInterval(pollInterval);
  return { confirmed: false, error: 'Transaction confirmation timeout after 2 minutes' };
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
  console.log('[v0] executeWalletTransaction called with:', { program: params.program, functionName: params.functionName });
  
  // Validate inputs
  if (!transactionFn || typeof transactionFn !== 'function') {
    console.error('[v0] Transaction function not available');
    return { success: false, error: 'Transaction function not available' };
  }

  const txKey = `${params.program}::${params.functionName}::${params.inputs.join('|')}`;

  // Check for duplicate in-flight transaction
  if (pendingTransactions.has(txKey)) {
    return pendingTransactions.get(txKey)!;
  }

  // Create the transaction promise
  const txPromise = executeTransactionWithRetry(transactionFn, params, maxRetries);

  // Store it to prevent duplicates
  pendingTransactions.set(txKey, txPromise);

  try {
    const result = await txPromise;
    console.log('[v0] Transaction result:', { success: result.success, error: result.error });
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
        fee: params.fee
      });

      // Prepare transaction object matching the wallet hook API
      // Fee should be 1 ALEO (1,000,000 microcredits) unless explicitly set
      const txObj = {
        transitions: [
          {
            program: params.program,
            functionName: params.functionName,
            inputs: params.inputs,
          }
        ],
        fee: params.fee || 1000000, // Default fee: 1 ALEO = 1,000,000 microcredits
        feePrivate: params.privateFee ?? false,
      };

      console.log('[v0] Calling wallet.executeTransaction with:', { program: params.program, functionName: params.functionName, fee: txObj.fee });

      // Execute transaction
      const transactionId = await transactionFn(txObj);
      
      console.log('[v0] Wallet returned transaction ID:', transactionId);

      if (!transactionId || transactionId.trim() === '') {
        throw new Error('Wallet returned empty transaction ID');
      }

      console.log('[v0] Transaction executed successfully:', transactionId);
      
      // CRITICAL: Wait for blockchain confirmation using wallet SDK
      const confirmationResult = await waitForTransactionConfirmation(
        transactionId,
        params.getTransactionStatus,
        300000 // 5 minute timeout (increased to allow wallet time for fee record calculation)
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
