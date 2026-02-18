/**
 * ShadowID Leo Contract Test Suite
 * 
 * Tests contract integration and functionality
 */

import { 
  registerCommitmentOnChain, 
  verifyCommitmentOnChain,
  revokeCommitmentOnChain,
  getCommitmentDetails,
  isCommitmentOnChain,
  exportOnChainCertificate
} from '../lib/aleo-contract'

export async function runContractTests() {
  console.log('=== ShadowID Contract Test Suite ===\n')

  const testCommitment = 'test_commitment_' + Date.now()
  const testWallet = 'aleo1test' + Math.random().toString(36).substring(2, 15)

  // Test 1: Register commitment
  console.log('Test 1: Register Commitment')
  const registerResult = await registerCommitmentOnChain(testCommitment, testWallet)
  console.log('✓ Result:', registerResult.success ? 'PASS' : 'FAIL')
  console.log('  Transaction ID:', registerResult.transactionId)
  console.log()

  // Test 2: Verify commitment
  console.log('Test 2: Verify Commitment')
  const verifyResult = await verifyCommitmentOnChain(testCommitment)
  console.log('✓ Result:', verifyResult.success ? 'PASS' : 'FAIL')
  console.log('  Status:', verifyResult.data?.isRevoked ? 'REVOKED' : 'ACTIVE')
  console.log()

  // Test 3: Check commitment exists
  console.log('Test 3: Check Commitment Exists')
  const exists = isCommitmentOnChain(testCommitment)
  console.log('✓ Result:', exists ? 'PASS' : 'FAIL')
  console.log('  Exists:', exists)
  console.log()

  // Test 4: Get commitment details
  console.log('Test 4: Get Commitment Details')
  const details = await getCommitmentDetails(testCommitment)
  console.log('✓ Result:', details !== null ? 'PASS' : 'FAIL')
  console.log('  Owner:', details?.owner)
  console.log('  Timestamp:', details?.timestamp)
  console.log()

  // Test 5: Export certificate
  console.log('Test 5: Export Certificate')
  if (details) {
    const certificate = exportOnChainCertificate(details)
    console.log('✓ Result: PASS')
    console.log('  Certificate:', certificate.substring(0, 100) + '...')
  } else {
    console.log('✗ Result: FAIL - No details available')
  }
  console.log()

  // Test 6: Revoke commitment
  console.log('Test 6: Revoke Commitment')
  const revokeResult = await revokeCommitmentOnChain(testCommitment, testWallet)
  console.log('✓ Result:', revokeResult.success ? 'PASS' : 'FAIL')
  console.log('  Transaction ID:', revokeResult.transactionId)
  console.log()

  // Test 7: Verify revoked commitment fails
  console.log('Test 7: Verify Revoked Commitment')
  const verifyRevokedResult = await verifyCommitmentOnChain(testCommitment)
  console.log('✓ Result:', !verifyRevokedResult.success ? 'PASS' : 'FAIL')
  console.log('  Error:', verifyRevokedResult.error)
  console.log()

  // Test 8: Revoke with wrong owner
  console.log('Test 8: Revoke with Wrong Owner (should fail)')
  const wrongWallet = 'aleo1wrong' + Math.random().toString(36).substring(2, 15)
  const wrongRevokeResult = await revokeCommitmentOnChain(testCommitment, wrongWallet)
  console.log('✓ Result:', !wrongRevokeResult.success ? 'PASS' : 'FAIL')
  console.log('  Error:', wrongRevokeResult.error)
  console.log()

  console.log('=== Test Suite Complete ===')
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).runContractTests = runContractTests
}
