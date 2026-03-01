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
}

export interface TransactionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * Safely execute a wallet transaction with validation and error handling
 * This function validates and wraps the executeTransaction call to prevent
 * scope-related errors during async operations
 */
export async function executeWalletTransaction(
  transactionFn: (params: any) => Promise<string>,
  params: TransactionParams
): Promise<TransactionResult> {
  try {
    // Pre-flight checks
    if (!transactionFn || typeof transactionFn !== 'function') {
      console.error('[v0] executeTransaction function is not available');
      console.error('[v0] Type:', typeof transactionFn, 'Exists:', !!transactionFn);
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

    console.log('[v0] Transaction parameters:', {
      program: params.program,
      functionName: params.functionName,
      inputsCount: params.inputs.length,
    });

    // Log each input to verify format
    params.inputs.forEach((input, idx) => {
      console.log(`[v0] Input[${idx}]:`, input);
    });

    // Prepare transaction object matching wallet API
    // The wallet expects { transitions, fee, feePrivate }
    // NOT { program, function, inputs, fee }
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

    console.log('[v0] Transaction object:', JSON.stringify(txObj));
    console.log('[v0] Executing wallet transaction...');

    // Execute transaction with error boundary
    let transactionId: string;
    try {
      console.log('[v0] Calling wallet executeTransaction with:', txObj);
      const result = await transactionFn(txObj);
      transactionId = result;
    } catch (execError) {
      console.error('[v0] Wallet execution error:', execError);
      console.error('[v0] Error message:', execError instanceof Error ? execError.message : String(execError));
      throw execError;
    }

    if (!transactionId || transactionId.trim() === '') {
      console.error('[v0] Wallet returned empty transaction ID');
      return {
        success: false,
        error: 'Wallet returned empty transaction ID',
      };
    }

    console.log('[v0] Transaction executed successfully:', transactionId);
    return {
      success: true,
      transactionId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[v0] Transaction handler error:', errorMessage);
    console.error('[v0] Error details:', error);
    return {
      success: false,
      error: errorMessage,
    };
  }
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
