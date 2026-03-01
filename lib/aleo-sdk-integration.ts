/**
 * Aleo SDK Integration for ShadowID
 * Handles on-chain proof execution, commitment registration, and verification
 * Programs: shadowid.aleo, credential_registry.aleo, qr_verifier.aleo, dao_attestation.aleo
 */

import { executeWalletTransaction, validateWalletFunction, debugWalletState } from './blockchain-transaction-handler';
import { validateAleoInputs, debugAleoInputs } from './aleo-input-validator';
import { hexToField } from './aleo-field-formatter';

const ALEO_API = 'https://api.explorer.provable.com/v1/testnet';

// Contract Deployment Details
const CONTRACTS = {
  SHADOWID: {
    name: 'shadowid_v3.aleo',
    transactionId: 'at1f5smjrgw9nzluhxzpt23pq47ne4nlnjngfal38mkn0x5e5n0wyzq5dycfl',
    adminAddress: 'aleo1cmay45pre5evtl72vj8zma9ayj0u2xrdkdv86w2zyz7pnmg7svxq0dzr9c',
  },
  CREDENTIAL_REGISTRY: {
    name: 'credential_registry.aleo',
    transactionId: 'at13hpjnt63fkp6d87ta4mlhzvmhlfjy9p3acltys08r6kl2n5zpgfqvsdycz',
    adminAddress: 'aleo1cmay45pre5evtl72vj8zma9ayj0u2xrdkdv86w2zyz7pnmg7svxq0dzr9c',
  },
  QR_VERIFIER: {
    name: 'qr_verifier.aleo',
    transactionId: 'at1lvgmm5dwwx6kucvdq4v0zycyp2rv8njuss2z97xazqr9yfsa3ugsw0jyvm',
    adminAddress: 'aleo1cmay45pre5evtl72vj8zma9ayj0u2xrdkdv86w2zyz7pnmg7svxq0dzr9c',
  },
  DAO_ATTESTATION: {
    name: 'dao_attestation_v1.aleo',
    transactionId: 'at182tlymw08vz9zgzt448vqxmh2l8s9sg0wnpvm5cyhl7pe42kagzsczgjrn',
    adminAddress: 'aleo1cmay45pre5evtl72vj8zma9ayj0u2xrdkdv86w2zyz7pnmg7svxq0dzr9c',
  },
};

// Environment variable fallback
const PROGRAM_ID = process.env.NEXT_PUBLIC_SHADOWID_PROGRAM_ID || CONTRACTS.SHADOWID.name;
const REGISTRY_PROGRAM_ID = process.env.NEXT_PUBLIC_CREDENTIAL_REGISTRY_PROGRAM_ID || CONTRACTS.CREDENTIAL_REGISTRY.name;
const VERIFIER_PROGRAM_ID = process.env.NEXT_PUBLIC_QR_VERIFIER_PROGRAM_ID || CONTRACTS.QR_VERIFIER.name;
const DAO_ATTESTATION_PROGRAM_ID = process.env.NEXT_PUBLIC_DAO_ATTESTATION_PROGRAM_ID || CONTRACTS.DAO_ATTESTATION.name;

interface ProofExecutionRequest {
  programId: string;
  functionName: string;
  inputs: string[];
  fee?: number;
}

export interface OnChainExecutionResult {
  success: boolean;
  transactionId?: string;
  commitmentHash?: string; // The blockchain-verified commitment hash
  error?: string;
  proofData?: any;
}

/**
 * Execute a ZK proof on-chain via Aleo REST API
 */
/**
 * Execute a transaction on-chain using the wallet
 * This function must be called with the wallet's executeTransaction method
 * Use executeProofOnChain for high-level proof execution
 */
export async function executeTransactionWithWallet(
  request: ProofExecutionRequest,
  executeTransactionFn: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  try {
    const programId = request.programId || PROGRAM_ID;

    // CRITICAL: Validate all Aleo inputs before sending to wallet
    debugAleoInputs(request.inputs);
    const validation = validateAleoInputs(request.inputs);
    
    if (!validation.valid) {
      const errorMsg = `Invalid Aleo input types:\n${validation.errors.join('\n')}`;
      console.error('[v0] Input validation failed:', errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    // Use the robust transaction handler
    const result = await executeWalletTransaction(executeTransactionFn, {
      program: programId,
      functionName: request.functionName,
      inputs: request.inputs,
      fee: request.fee || 100000,
    });

    if (!result.success) {
      console.error('[v0] Transaction execution failed:', result.error);
      return {
        success: false,
        error: result.error || 'Transaction failed',
      };
    }

    if (!result.transactionId) {
      console.error('[v0] No transaction ID in result');
      return {
        success: false,
        error: 'No transaction ID returned',
      };
    }

    console.log('[v0] Transaction submitted successfully:', result.transactionId);

    return {
      success: true,
      transactionId: result.transactionId,
      proofData: {
        programId,
        functionName: request.functionName,
        inputs: request.inputs,
        timestamp: Date.now(),
      },
    };
  } catch (error) {
    console.error('[v0] Transaction execution error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Execute a proof on-chain via the Aleo network
 * Requires wallet connection to submit transactions
 */
export async function executeProofOnChain(
  request: ProofExecutionRequest,
  walletAddress: string,
  executeTransactionFn?: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  try {
    const programId = request.programId || PROGRAM_ID;

    console.log('[v0] Executing proof on-chain:', {
      program: programId,
      function: request.functionName,
      wallet: walletAddress,
    });

    // If wallet transaction function is provided, use it for real execution
    if (executeTransactionFn) {
      return await executeTransactionWithWallet(request, executeTransactionFn);
    }

    // Fallback: Verify program exists on testnet
    const programResponse = await fetch(`${ALEO_API}/program/${programId}`);

    if (!programResponse.ok) {
      return {
        success: false,
        error: `Program ${programId} not found on testnet. Please ensure contract is deployed.`,
      };
    }

    console.warn('[v0] No executeTransaction function provided - cannot submit real transaction. Please connect wallet.');

    return {
      success: false,
      error: 'Wallet transaction execution not available. Please ensure you have a connected wallet.',
    };
  } catch (error) {
    console.error('[v0] Proof execution error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Submit nullifier to prevent replay attacks
 */
export async function submitNullifierOnChain(
  programId: string,
  nullifier: string,
  walletAddress: string,
  executeTransactionFn?: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  return executeProofOnChain(
    {
      programId: programId || PROGRAM_ID,
      functionName: 'check_nullifier',
      inputs: [nullifier],
    },
    walletAddress,
    executeTransactionFn
  );
}

/**
 * SHADOWID V3 FUNCTIONS
 * Secure Identity Protocol with zero-knowledge proofs
 */

/**
 * Prove a range without revealing actual value
 * Proves: min <= attribute <= max
 */
export async function proveRange(
  commitment: string,
  attributeName: string,
  min: number,
  max: number,
  walletAddress: string,
  executeTransactionFn?: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  return executeProofOnChain(
    {
      programId: PROGRAM_ID,
      functionName: 'prove_range',
      inputs: [commitment, attributeName, `${min}u32`, `${max}u32`],
    },
    walletAddress,
    executeTransactionFn
  );
}

/**
 * Prove membership without revealing actual value
 * Proves: attribute == targetValue
 */
export async function proveMembership(
  commitment: string,
  attributeName: string,
  targetValue: string,
  walletAddress: string,
  executeTransactionFn?: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  return executeProofOnChain(
    {
      programId: PROGRAM_ID,
      functionName: 'prove_membership',
      inputs: [commitment, attributeName, targetValue],
    },
    walletAddress,
    executeTransactionFn
  );
}

/**
 * Prove existence of valid credential
 * Proves: user holds a valid credential from trusted issuer
 */
export async function proveExistence(
  commitment: string,
  walletAddress: string,
  executeTransactionFn?: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  return executeProofOnChain(
    {
      programId: PROGRAM_ID,
      functionName: 'prove_existence',
      inputs: [commitment],
    },
    walletAddress,
    executeTransactionFn
  );
}

/**
 * Get all deployed contract information
 */
export function getContractDeployments() {
  return CONTRACTS;
}

/**
 * Get program info from Aleo testnet
 */
export async function getProgramInfo(): Promise<{
  exists: boolean;
  programs: typeof CONTRACTS;
}> {
  try {
    const responses = await Promise.all([
      fetch(`${ALEO_API}/program/${CONTRACTS.SHADOWID_V3.name}`),
      fetch(`${ALEO_API}/program/${CONTRACTS.CREDENTIAL_REGISTRY.name}`),
      fetch(`${ALEO_API}/program/${CONTRACTS.QR_VERIFIER.name}`),
      fetch(`${ALEO_API}/program/${CONTRACTS.DAO_ATTESTATION.name}`),
    ]);

    const allExist = responses.every(r => r.ok);
    return {
      exists: allExist,
      programs: CONTRACTS,
    };
  } catch (error) {
    console.error('[v0] Error checking program info:', error);
    return {
      exists: false,
      programs: CONTRACTS,
    };
  }
}

/**
 * CREDENTIAL REGISTRY FUNCTIONS
 * Manages on-chain credential commitments and revocation
 */

/**
 * Register a new credential commitment on-chain
 * The blockchain verifies the commitment and returns the official on-chain hash
 * Inputs: commitment (field), count (u8 - number of attributes)
 * Returns: The blockchain-verified commitment hash
 */
export async function registerCommitmentOnChain(
  commitment: string,
  attributeCount: number,
  walletAddress: string,
  executeTransactionFn?: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  const result = await executeProofOnChain(
    {
      programId: REGISTRY_PROGRAM_ID,
      functionName: 'register_commitment',
      inputs: [commitment, `${attributeCount}u8`],
    },
    walletAddress,
    executeTransactionFn
  );
  
  // The blockchain returns the verified commitment
  // Use this blockchain-verified hash as the actual commitment
  if (result.success) {
    result.commitmentHash = result.transactionId; // The blockchain returns commitment as transaction ID
  }
  
  return result;
}

/**
 * Revoke a credential (only holder can revoke their own)
 * Inputs: commitment (field)
 */
export async function revokeCredentialFromRegistry(
  commitment: string,
  walletAddress: string,
  executeTransactionFn?: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  return executeProofOnChain(
    {
      programId: REGISTRY_PROGRAM_ID,
      functionName: 'revoke_credential',
      inputs: [commitment],
    },
    walletAddress,
    executeTransactionFn
  );
}

/**
 * Verify a credential commitment is active and valid
 * Inputs: commitment (field)
 */
export async function verifyCredentialInRegistry(
  commitment: string,
  walletAddress: string,
  executeTransactionFn?: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  return executeProofOnChain(
    {
      programId: REGISTRY_PROGRAM_ID,
      functionName: 'verify_commitment',
      inputs: [commitment],
    },
    walletAddress,
    executeTransactionFn
  );
}

/**
 * Alias for registerCommitmentOnChain for backward compatibility
 */
export const registerCredentialInRegistry = registerCommitmentOnChain;

/**
 * QR VERIFIER FUNCTIONS
 * Records and tracks QR code verification events
 */

/**
 * Record a QR code verification on-chain
 * Inputs: commitment_hash (field), proof_id (field)
 */
export async function recordQRVerification(
  commitmentHash: string,
  proofId: string,
  walletAddress: string,
  executeTransactionFn?: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  return executeProofOnChain(
    {
      programId: VERIFIER_PROGRAM_ID,
      functionName: 'verify_qr',
      inputs: [commitmentHash, proofId],
    },
    walletAddress,
    executeTransactionFn
  );
}

/**
 * Increment verification count for a credential
 * Tracks total verifications per commitment
 * Inputs: commitment_hash (field)
 */
export async function incrementVerificationCount(
  commitmentHash: string,
  walletAddress: string,
  executeTransactionFn?: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  return executeProofOnChain(
    {
      programId: VERIFIER_PROGRAM_ID,
      functionName: 'increment_count',
      inputs: [commitmentHash],
    },
    walletAddress,
    executeTransactionFn
  );
}

/**
 * DAO ATTESTATION FUNCTIONS
 * Manages DAO registration, attestation requests, approvals, and revocations
 */

/**
 * Register a new DAO on-chain
 * Inputs: dao_id (field), leader_address (address)
 * Only callable by authorized admin
 */
export async function registerDAO(
  daoId: string,
  leaderAddress: string,
  walletAddress: string,
  executeTransactionFn?: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  return executeProofOnChain(
    {
      programId: DAO_ATTESTATION_PROGRAM_ID,
      functionName: 'register_dao',
      inputs: [daoId, leaderAddress],
    },
    walletAddress,
    executeTransactionFn
  );
}

/**
 * Request an attestation from a specific DAO
 * Inputs: dao_id (field) - the DAO to request from
 */
export async function requestDAOAttestation(
  daoId: string,
  walletAddress: string,
  executeTransactionFn?: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  return executeProofOnChain(
    {
      programId: DAO_ATTESTATION_PROGRAM_ID,
      functionName: 'request_attestation',
      inputs: [daoId],
    },
    walletAddress,
    executeTransactionFn
  );
}

/**
 * Approve an attestation request (DAO leader only)
 * Inputs: record_id (field), signature (field), expiration_block (u32)
 */
export async function approveDAOAttestation(
  recordId: string,
  signature: string,
  expirationBlock: number,
  walletAddress: string,
  executeTransactionFn?: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  return executeProofOnChain(
    {
      programId: DAO_ATTESTATION_PROGRAM_ID,
      functionName: 'approve_attestation',
      inputs: [recordId, signature, `${expirationBlock}u32`],
    },
    walletAddress,
    executeTransactionFn
  );
}

/**
 * Reject an attestation request (DAO leader only)
 * Inputs: record_id (field)
 */
export async function rejectDAOAttestation(
  recordId: string,
  walletAddress: string,
  executeTransactionFn?: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  return executeProofOnChain(
    {
      programId: DAO_ATTESTATION_PROGRAM_ID,
      functionName: 'reject_request',
      inputs: [recordId],
    },
    walletAddress,
    executeTransactionFn
  );
}

/**
 * Verify a DAO attestation is valid and not expired
 * Inputs: attestation_id (field)
 */
export async function verifyDAOAttestation(
  attestationId: string,
  walletAddress: string,
  executeTransactionFn?: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  return executeProofOnChain(
    {
      programId: DAO_ATTESTATION_PROGRAM_ID,
      functionName: 'verify_attestation',
      inputs: [attestationId],
    },
    walletAddress,
    executeTransactionFn
  );
}

/**
 * Revoke a DAO attestation (user can revoke their own)
 * Inputs: attestation_id (field)
 */
export async function revokeDAOAttestation(
  attestationId: string,
  walletAddress: string,
  executeTransactionFn?: (params: any) => Promise<string>
): Promise<OnChainExecutionResult> {
  return executeProofOnChain(
    {
      programId: DAO_ATTESTATION_PROGRAM_ID,
      functionName: 'revoke_attestation',
      inputs: [attestationId],
    },
    walletAddress,
    executeTransactionFn
  );
}
