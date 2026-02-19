# ShadowID Contract Deployment

## Deployed Contract Details

- **Program Name**: `shadowid_v1.aleo`
- **Transaction ID**: `at1xdv7apte46fzxakhz90kvf0s99w8e5yfn3pe9uxzxht4duggmqyskxd8z0`
- **Network**: Aleo Testnet
- **Deployment Fee**: 5.52 credits

## Contract Functions

### 1. register_commitment
Registers a new identity commitment on-chain.

**Inputs:**
- `commitment_hash` (field): Hash of identity data
- `timestamp` (u64): Unix timestamp

**Output:** IdentityCommitment record

**Security:** Prevents duplicate registration via finalize check

### 2. revoke_commitment
Revokes an existing identity commitment.

**Inputs:**
- `commitment` (IdentityCommitment record): Must be owned by caller

**Output:** New IdentityCommitment record with `is_revoked: true`

**Security:** Only owner can revoke (enforced by UTXO model)

### 3. check_revocation
Verifies if a commitment is valid and not revoked.

**Inputs:**
- `commitment_hash` (field): Hash to verify

**Security:** Fails if commitment is revoked or never registered

## Verification

View the deployed contract:
- Transaction: https://explorer.aleo.org/transaction/at1xdv7apte46fzxakhz90kvf0s99w8e5yfn3pe9uxzxht4duggmqyskxd8z0
- Program: https://explorer.aleo.org/program/shadowid_v1.aleo

## Security Enhancements

1. **Duplicate Prevention**: Cannot register same commitment twice
2. **Owner-only Revocation**: UTXO model ensures only owner can revoke
3. **Double-revocation Prevention**: Cannot revoke already revoked commitment
4. **Cost Optimization**: 14-character name avoids 10-credit namespace fee
