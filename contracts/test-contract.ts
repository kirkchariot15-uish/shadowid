/**
 * ShadowID Aleo Contract Test Suite
 * 
 * Tests contract integration using the new aleo-sdk-integration module
 * These tests verify wallet-integrated blockchain transactions
 */

import { 
  registerCommitmentOnChain, 
  verifyCredentialInRegistry,
  revokeCredentialFromRegistry,
  proveExistence,
  proveRangeAttribute,
  proveMembershipAttribute
} from '../lib/aleo-sdk-integration'

export async function runContractTests(walletAddress: string, executeTransaction?: (params: any) => Promise<string>) {
  console.log('=== ShadowID Aleo Contract Test Suite ===\n')

  if (!walletAddress) {
    console.error('✗ Wallet address required for tests')
    return
  }

  const testCommitment = 'test_commitment_' + Date.now()
  const attributeCount = 3

  try {
    // Test 1: Register commitment on-chain
    console.log('Test 1: Register Commitment On-Chain')
    const registerResult = await registerCommitmentOnChain(
      testCommitment, 
      attributeCount, 
      walletAddress,
      executeTransaction
    )
    console.log('✓ Result:', registerResult.success ? 'PASS' : 'FAIL')
    if (registerResult.success) {
      console.log('  Transaction ID:', registerResult.transactionId)
    } else {
      console.log('  Error:', registerResult.error)
    }
    console.log()

    // Test 2: Verify credential in registry
    console.log('Test 2: Verify Credential In Registry')
    const verifyResult = await verifyCredentialInRegistry(
      testCommitment, 
      walletAddress,
      executeTransaction
    )
    console.log('✓ Result:', verifyResult.success ? 'PASS' : 'FAIL')
    if (verifyResult.error) {
      console.log('  Error:', verifyResult.error)
    }
    console.log()

    // Test 3: Prove existence
    console.log('Test 3: Prove Existence')
    const existenceResult = await proveExistence(
      testCommitment, 
      walletAddress,
      executeTransaction
    )
    console.log('✓ Result:', existenceResult.success ? 'PASS' : 'FAIL')
    if (existenceResult.error) {
      console.log('  Error:', existenceResult.error)
    }
    console.log()

    // Test 4: Prove range attribute
    console.log('Test 4: Prove Range Attribute')
    const rangeResult = await proveRangeAttribute(
      testCommitment,
      'age',
      18,
      65,
      walletAddress,
      executeTransaction
    )
    console.log('✓ Result:', rangeResult.success ? 'PASS' : 'FAIL')
    if (rangeResult.error) {
      console.log('  Error:', rangeResult.error)
    }
    console.log()

    // Test 5: Prove membership attribute
    console.log('Test 5: Prove Membership Attribute')
    const membershipResult = await proveMembershipAttribute(
      testCommitment,
      'country',
      'USA',
      walletAddress,
      executeTransaction
    )
    console.log('✓ Result:', membershipResult.success ? 'PASS' : 'FAIL')
    if (membershipResult.error) {
      console.log('  Error:', membershipResult.error)
    }
    console.log()

    // Test 6: Revoke credential (optional if executeTransaction provided)
    if (executeTransaction) {
      console.log('Test 6: Revoke Credential')
      const revokeResult = await revokeCredentialFromRegistry(
        testCommitment,
        walletAddress,
        executeTransaction
      )
      console.log('✓ Result:', revokeResult.success ? 'PASS' : 'FAIL')
      if (revokeResult.error) {
        console.log('  Error:', revokeResult.error)
      }
      console.log()
    }

    console.log('=== Test Suite Complete ===')
  } catch (error) {
    console.error('✗ Test suite error:', error)
  }
}
