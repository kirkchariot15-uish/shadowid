# ShadowID Aleo Smart Contract

Zero-knowledge identity commitment registry built on Aleo blockchain.

## Quick Start

```bash
# Build contract
leo build

# Run tests (requires Leo CLI)
leo test

# Deploy to testnet
../scripts/deploy-contract.sh
```

## Contract Overview

**Program:** `shadowid_v5.aleo`

The ShadowID contract enables peer-to-peer attestation and identity credibility scoring on the Aleo blockchain.

### Key Features

- ✅ **On-Chain Immutability**: Commitments stored permanently on Aleo blockchain
- ✅ **Zero-Knowledge Privacy**: No personal data revealed on-chain
- ✅ **Owner-Only Revocation**: Only commitment owners can revoke
- ✅ **Public Verification**: Anyone can verify commitment validity
- ✅ **Timestamp Tracking**: Track when commitments were registered

### Data Structures

**IdentityCommitment Record:**
```leo
record IdentityCommitment {
    owner: address,           // Wallet that owns this commitment
    commitment_hash: field,   // Cryptographic commitment hash
    timestamp: u64,           // Registration timestamp
    is_revoked: bool,         // Revocation status
}
```

**Public Mappings:**
- `commitments`: Maps commitment hash → owner address
- `revocations`: Maps commitment hash → revocation status
- `commitment_timestamps`: Maps commitment hash → registration time

### Functions

#### `register_commitment`
Register a new identity commitment on-chain.

```leo
transition register_commitment(
    public commitment_hash: field,
    public timestamp: u64
) -> IdentityCommitment
```

#### `revoke_commitment`
Revoke an existing commitment (owner only).

```leo
transition revoke_commitment(
    commitment: IdentityCommitment
) -> IdentityCommitment
```

#### `is_revoked`
Verify commitment is not revoked (asserts on failure).

```leo
transition is_revoked(
    public commitment_hash: field
)
```

## Deployment Status

**Current:** Mock/Simulation Mode (Development)

The contract is written and ready for deployment but currently uses localStorage simulation for development. To deploy to Aleo testnet, follow the [Deployment Guide](./DEPLOYMENT.md).

## Development

### Prerequisites
- Leo CLI installed
- Aleo wallet with testnet credits

### Local Testing
```bash
# Run all tests
leo test

# Run specific test
leo test register_commitment
```

### Build
```bash
leo build
```

Output in `build/` directory.

## Integration

The contract integrates with the ShadowID frontend via `lib/aleo-contract.ts`:

```typescript
import { registerCommitmentOnChain } from '@/lib/aleo-contract'

// Register commitment
const result = await registerCommitmentOnChain(
  commitment,
  walletAddress
)

console.log('Transaction:', result.transactionId)
```

## Security

- **Audited:** Not yet (pending testnet deployment)
- **Network:** Aleo Testnet (when deployed)
- **Gas Costs:** ~5-10 credits per registration

## Next Steps

1. Deploy to Aleo testnet using deployment guide
2. Integrate real Aleo SDK (replace mock calls)
3. Complete security audit
4. Test with live users on testnet
5. Prepare for mainnet deployment

## License

MIT - See LICENSE file

## Resources

- [Deployment Guide](./DEPLOYMENT.md)
- [Leo Documentation](https://developer.aleo.org/leo)
- [Aleo Explorer](https://explorer.aleo.org)
