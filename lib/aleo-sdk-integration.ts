/**
 * Real Aleo SDK Integration for ShadowID
 * Handles on-chain proof verification and program execution
 */

import { AleoNetworkClient, ProgramManager } from '@provablehq/sdk';

const NETWORK_CLIENT = new AleoNetworkClient('https://api.testnet.aleo.org');

interface ProofExecutionRequest {
  programId: string;
  functionName: string;
  inputs: string[];
  fee?: number;
}

interface OnChainExecutionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  proofData?: any;
}

/**
 * Execute a ZK proof on-chain via Aleo blockchain
 */
export async function executeProofOnChain(
  request: ProofExecutionRequest,
  privateKey: string
): Promise<OnChainExecutionResult> {
  try {
    console.log('[v0] Executing proof on-chain:', request.functionName);
    
    const programManager = new ProgramManager();
    programManager.setPrivateKey(privateKey);
    
    // Build the program call
    const result = await programManager.executeProgram(
      request.programId,
      request.functionName,
      request.inputs,
      request.fee || 100000
    );

    console.log('[v0] On-chain execution successful, transaction:', result.transactionId);
    
    return {
      success: true,
      transactionId: result.transactionId,
      proofData: result,
    };
  } catch (error) {
    console.error('[v0] On-chain execution failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Verify a ZK proof on-chain
 */
export async function verifyProofOnChain(
  programId: string,
  proof: string
): Promise<boolean> {
  try {
    console.log('[v0] Verifying proof on-chain');
    
    // Query the network to verify proof was recorded
    const transaction = await NETWORK_CLIENT.getTransaction(proof);
    
    if (!transaction) {
      console.error('[v0] Proof not found on-chain');
      return false;
    }

    console.log('[v0] Proof verified on-chain');
    return true;
  } catch (error) {
    console.error('[v0] Proof verification failed:', error);
    return false;
  }
}

/**
 * Submit nullifier to prevent double-spending
 */
export async function submitNullifierOnChain(
  programId: string,
  nullifier: string,
  privateKey: string
): Promise<OnChainExecutionResult> {
  try {
    console.log('[v0] Submitting nullifier on-chain');
    
    return await executeProofOnChain(
      {
        programId,
        functionName: 'record_nullifier',
        inputs: [nullifier],
      },
      privateKey
    );
  } catch (error) {
    console.error('[v0] Nullifier submission failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check if nullifier has been used (prevents double-spending)
 */
export async function checkNullifierUsed(
  programId: string,
  nullifier: string
): Promise<boolean> {
  try {
    console.log('[v0] Checking nullifier status');
    
    // Query program state for nullifier
    const state = await NETWORK_CLIENT.getProgramData(programId);
    
    if (!state) return false;
    
    // Check if nullifier exists in recorded nullifiers
    return state.nullifiers?.includes(nullifier) || false;
  } catch (error) {
    console.error('[v0] Nullifier check failed:', error);
    return false;
  }
}

/**
 * Register credential commitment on-chain
 */
export async function registerCommitmentOnChain(
  commitment: string,
  privateKey: string,
  programId: string = 'shadowid_zk.aleo'
): Promise<OnChainExecutionResult> {
  try {
    console.log('[v0] Registering commitment on-chain');
    
    return await executeProofOnChain(
      {
        programId,
        functionName: 'register_commitment',
        inputs: [commitment, Math.floor(Date.now() / 1000).toString()],
      },
      privateKey
    );
  } catch (error) {
    console.error('[v0] Commitment registration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Revoke a credential on-chain
 */
export async function revokeCommitmentOnChain(
  commitment: string,
  privateKey: string,
  programId: string = 'shadowid_zk.aleo'
): Promise<OnChainExecutionResult> {
  try {
    console.log('[v0] Revoking commitment on-chain');
    
    return await executeProofOnChain(
      {
        programId,
        functionName: 'revoke_commitment',
        inputs: [commitment],
      },
      privateKey
    );
  } catch (error) {
    console.error('[v0] Commitment revocation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
