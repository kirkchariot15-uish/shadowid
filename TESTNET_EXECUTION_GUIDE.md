# Aleo Testnet Execution Guide - ShadowID Blockchain Operations

## Quick Start: Transaction Debugging

### 1. Enable Debug Logging
All blockchain operations now include detailed logging. Open your browser DevTools Console:

```javascript
// You'll see patterns like:
[v0] Registering commitment on-chain: 5827219492148704987field
[v0] Validating Aleo input types...
[v0] === Aleo Input Debug ===
[v0] Input 0: "5827219492148704987field"
[v0]   ✓ Valid field type
[v0] Input 1: "3u64"
[v0]   ✓ Valid u64 type
[v0] === End Debug ===
[v0] Transaction submitted: at1...
```

### 2. Common Issues & Solutions

#### Issue: "Invalid input 'XXXXX'"
**Cause**: Raw hex being passed to Aleo  
**Fix**: Now automatic via `aleo-input-validator.ts`  
**Check Console**: Look for `[v0] Auto-converting raw hex to field`

#### Issue: "Failed to parse string"
**Cause**: Input missing type suffix (like `field`, `u64`)  
**Fix**: Validator catches this and provides clear error  
**Example**: `50EC52E85674AFDB` → `5827219492148704987field`

#### Issue: "Transaction not submitted"
**Cause**: Wallet not connected or executeTransaction unavailable  
**Fix**: Component now validates wallet before starting async operations  
**Check**: Browser console for `[v0] executeTransaction available: true/false`

---

## Input Type Reference for Your Programs

### ShadowID Main Contract (`shadowid_v3.aleo`)

```leo
transition register_commitment:
  input r0 as field.public;      // Commitment hash
  input r1 as u8.public;         // Attribute count
```

**Correct Usage**:
```javascript
await registerCommitmentOnChain(
  "5827219492148704987field",  // ✓ Field with type suffix
  3                              // ✓ Number (auto-converted to "3u8")
)
```

### QR Verifier (`qr_verifier.aleo`)

```leo
transition verify_qr_code:
  input r0 as field.public;      // Commitment hash
  input r1 as field.public;      // Proof ID
```

**Correct Usage**:
```javascript
await recordQRVerification(
  "5827219492148704987field",  // ✓ Field type
  "1234567890123456field",     // ✓ Field type
  walletAddress
)
```

### Credential Registry (`credential_registry.aleo`)

```leo
function register_commitment:
  input r0 as field.public;      // Commitment
  input r1 as u8.public;         // Attribute count

function verify_commitment:
  input r0 as field.public;      // Commitment to check

function revoke_credential:
  input r0 as field.public;      // Commitment to revoke
```

---

## Validator API Reference

### Import the Validator
```javascript
import {
  hexToAleoField,
  hexToAleoU64,
  validateAleoInputs,
  debugAleoInputs,
  isValidAleoField,
  isValidAleoU64,
  isValidAleoAddress
} from '@/lib/aleo-input-validator'
```

### Convert Hex to Field
```javascript
import { hexToAleoField } from '@/lib/aleo-input-validator'

const hex = "50EC52E85674AFDB"
const field = hexToAleoField(hex)
console.log(field)  // "5827219492148704987field"
```

### Validate Inputs Before Sending
```javascript
import { validateAleoInputs } from '@/lib/aleo-input-validator'

const inputs = [
  "5827219492148704987field",
  "3u64",
  "aleo1vwls2ete8dk8uu2kmkmzumd7q38fvshrht8hlc0a5362uq8ftgyqnm3w08"
]

const result = validateAleoInputs(inputs)
if (result.valid) {
  console.log("✓ All inputs are valid")
} else {
  console.error("✗ Validation errors:", result.errors)
}
```

### Debug Individual Inputs
```javascript
import { debugAleoInputs } from '@/lib/aleo-input-validator'

debugAleoInputs([
  "50EC52E85674AFDB",           // Will warn: "Raw hex detected!"
  "5827219492148704987field",   // Will confirm: "✓ Valid field type"
  "invalid",                      // Will error: "✗ Invalid format"
])

// Console output:
// [v0] === Aleo Input Debug ===
// [v0] Input 0: "50EC52E85674AFDB"
// [v0]   ⚠️  Raw hex detected! Should be: "5827219492148704987field"
// [v0] Input 1: "5827219492148704987field"
// [v0]   ✓ Valid field type
// [v0] Input 2: "invalid"
// [v0]   ✗ Invalid format
// [v0] === End Debug ===
```

---

## Testnet Transaction Flow

### Step 1: User Creates Identity
```
↓ handleCreateIdentity() triggered
↓ Generate SHA-256 hash
↓ Convert to Aleo field type
↓ Create commitment hash (5827219492148704987field)
↓ Validate input types
↓ Get wallet connection + executeTransaction
↓ Call registerCommitmentOnChain()
```

### Step 2: SDK Processes Commitment
```
↓ validateAleoInputs() checks format
↓ debugAleoInputs() logs for console review
↓ executeProofOnChain() prepares transaction
↓ executeWalletTransaction() sends to wallet
↓ Wallet signs and submits to Testnet
```

### Step 3: Authorization Building
```
✓ Input: 5827219492148704987field
✓ Parser accepts: Field type confirmed
✓ Build Authorization: Success
✓ Broadcast Transaction: Submitted to Testnet
```

---

## Monitoring Transactions

### Enable All Debug Logs
```javascript
// In browser console
localStorage.setItem('shadowid-debug-level', 'verbose')
// Reload page - now see all [v0] logs
```

### Watch Wallet Execution
```javascript
// Monitor executeTransaction calls
console.log('[v0] Wallet function:', typeof executeTransaction)
console.log('[v0] Callable:', typeof executeTransaction === 'function')
console.log('[v0] Connected:', !!address)
```

### Verify Input Conversion
```javascript
// Check what's actually being sent
[v0] Validating Aleo input types...
[v0] === Aleo Input Debug ===
[v0] Input 0: "5827219492148704987field"
[v0]   ✓ Valid field type
```

---

## Error Escalation Path

### Level 1: Input Validation (Caught Before Wallet)
```
Error: Invalid Aleo input types:
Input 0: Raw hex string detected "50EC52E85674AFDB"
→ Solution: Automatically converted to "5827219492148704987field"
```

### Level 2: Authorization Building (Caught by Aleo SDK)
```
Error: Failed to build authorization:
VerboseError { errors: ... }
→ Solution: Inputs now pre-validated, won't reach this point
```

### Level 3: Network Submission (Rare - Network Issues)
```
Error: Transaction rejected by network
→ Check: Transaction ID logged, network status, fee amount
```

---

## Best Practices

✓ **DO**:
- Always use typed values: `"123field"`, `"100u64"`
- Validate inputs before user confirmation
- Log all transaction submissions
- Handle wallet connection gracefully
- Provide clear error messages to users

✗ **DON'T**:
- Pass raw hex strings (now caught by validator)
- Use quoted numbers: `"123"` instead of `123field`
- Rely on automatic type inference
- Skip input validation for "trusted" data
- Hide Aleo parser errors from users

---

## Next Steps

1. **Test on Testnet**: Create a new ShadowID identity
2. **Monitor Console**: Watch for validation logs
3. **Verify Transaction**: Check Aleo explorer for on-chain record
4. **Review Logs**: Look for `[v0] Transaction submitted: at1...`
5. **Debug if Needed**: Use `debugAleoInputs()` helper

---

## Support Resources

- **Aleo Docs**: https://developer.aleo.org
- **Testnet Explorer**: Check transaction status
- **Input Validator**: `lib/aleo-input-validator.ts`
- **SDK Integration**: `lib/aleo-sdk-integration.ts`
- **Error Logs**: Browser DevTools Console (filter by `[v0]`)
