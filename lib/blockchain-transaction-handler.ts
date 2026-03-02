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

    // Prepare transaction object matching wallet adapter API
    // The @provablehq/aleo-wallet-adaptor-react expects:
    // { program, function, inputs, fee, privateFee }
    // NOT { transitions, ... }
    const txObj = {
      program: params.program,
      function: params.functionName,
      inputs: params.inputs,
      fee: params.fee || 100000,
      privateFee: params.privateFee ?? false,
    };

    // Execute transaction with error boundary
    let transactionId: string;
    try {
      const result = await transactionFn(txObj);
      transactionId = result;
    } catch (execError) {
      console.error('[v0] Wallet execution error:', execError instanceof Error ? execError.message : String(execError));
      throw execError;
    }

    if (!transactionId || transactionId.trim() === '') {
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
    console.error('[v0] Transaction error:', errorMessage);
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
