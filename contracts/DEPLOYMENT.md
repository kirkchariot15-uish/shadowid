# ShadowID Smart Contract Deployment Guide

## Overview

The ShadowID Leo smart contract (`shadowid.aleo`) registers identity commitments on the Aleo blockchain for immutability and zero-knowledge verification.

## Prerequisites

1. **Install Leo CLI**
   ```bash
   curl -L https://raw.githubusercontent.com/AleoHQ/aleo/main/install.sh | sh
   ```

2. **Get Testnet Credits**
   - Visit: https://faucet.aleo.org
   - Request testnet credits for deployment
   - Requires ~5-10 credits for deployment

3. **Configure Wallet**
   ```bash
   leo account new
   # Save your private key securely!
   ```

## Contract Structure

```
contracts/
├── shadowid.leo          # Main contract program
├── program.json          # Program configuration
└── DEPLOYMENT.md         # This file
```

## Deployment Steps

### 1. Build the Contract

```bash
cd contracts
leo build
```

This compiles the Leo program and generates build artifacts.

### 2. Deploy to Testnet

**Option A: Using Script (Recommended)**
```bash
cd ..
chmod +x scripts/deploy-contract.sh
./scripts/deploy-contract.sh
```

**Option B: Manual Deployment**
```bash
cd contracts
leo deploy --network testnet
```

### 3. Verify Deployment

After successful deployment, you'll receive:
- **Program ID**: `shadowid.aleo`
- **Transaction ID**: `at1...` (unique deployment transaction)

Verify on Aleo Explorer:
```
https://explorer.aleo.org/program/shadowid.aleo
```

### 4. Update Environment Variables

Create or update `.env.local`:
```env
NEXT_PUBLIC_ALEO_NETWORK=testnet
NEXT_PUBLIC_ALEO_PROGRAM_ID=shadowid.aleo
NEXT_PUBLIC_ALEO_PROGRAM_DEPLOYED=true
```

## Contract Functions

### `register_commitment`
Registers a new identity commitment on-chain.

**Parameters:**
- `commitment_hash: field` - Hash of identity commitment
- `timestamp: u64` - Unix timestamp

**Returns:** `IdentityCommitment` record

**Example:**
```leo
leo run register_commitment 12345field 1704067200u64
```

### `revoke_commitment`
Revokes an existing commitment (owner only).

**Parameters:**
- `commitment: IdentityCommitment` - Commitment record to revoke

**Returns:** Revoked `IdentityCommitment` record

### `is_revoked`
Check if a commitment has been revoked.

**Parameters:**
- `commitment_hash: field` - Commitment to check

**Asserts:** Fails if revoked

## Integration with Frontend

The TypeScript integration (`lib/aleo-contract.ts`) provides:

```typescript
// Register commitment
const result = await registerCommitmentOnChain(commitment, walletAddress)

// Verify commitment
const verification = await verifyCommitmentOnChain(commitment)

// Revoke commitment
const revocation = await revokeCommitmentOnChain(commitment, walletAddress)
```

## Current Status

⚠️ **TESTNET MODE**: The contract is currently in mock/simulation mode for development.

**To enable production mode:**

1. Deploy contract to Aleo testnet using steps above
2. Install `@aleohq/sdk` package:
   ```bash
   pnpm add @aleohq/sdk
   ```
3. Update `lib/aleo-contract.ts` to use real Aleo SDK calls
4. Set environment variable `NEXT_PUBLIC_ALEO_PROGRAM_DEPLOYED=true`

## Security Considerations

1. **Private Keys**: Never commit private keys or mnemonics
2. **Gas Costs**: Monitor testnet credit usage for transactions
3. **Finality**: Transactions are final once confirmed on-chain
4. **Revocation**: Revoked commitments cannot be un-revoked

## Troubleshooting

### Build Fails
```bash
leo clean
leo build
```

### Deployment Fails - Insufficient Credits
Get more credits from faucet: https://faucet.aleo.org

### Deployment Fails - Network Issues
```bash
# Check Leo version
leo --version

# Update Leo
curl -L https://raw.githubusercontent.com/AleoHQ/aleo/main/install.sh | sh
```

### Transaction Pending
Wait 30-60 seconds for blockchain confirmation. Check status:
```
https://explorer.aleo.org/transaction/<tx_id>
```

## Production Deployment

For mainnet deployment (when ready):

1. **Audit Contract**: Get professional security audit
2. **Test Thoroughly**: Complete testnet testing
3. **Mainnet Credits**: Acquire sufficient Aleo credits
4. **Deploy**: `leo deploy --network mainnet`
5. **Update Config**: Change env to `NEXT_PUBLIC_ALEO_NETWORK=mainnet`

## Resources

- Leo Documentation: https://developer.aleo.org/leo
- Aleo Explorer: https://explorer.aleo.org
- Testnet Faucet: https://faucet.aleo.org
- Community Discord: https://discord.gg/aleo

## Support

For deployment issues, contact:
- GitHub Issues: [Your Repo]
- Discord: Aleo Developer Community
