# Deploy ShadowID ZK Smart Contract

## Contract: `shadowid_zk.leo`

This is the production zero-knowledge verifiable credentials contract with proper ZK circuits for:
- Attestation issuance by trusted parties
- Range proofs (age >= 21 without revealing exact age)
- Membership proofs (value in set without revealing which)
- Existence proofs (attribute exists without revealing value)
- Nullifiers to prevent double-spending
- On-chain proof verification

## Prerequisites

1. **Leo CLI installed**
   ```bash
   curl -L https://raw.githubusercontent.com/AleoHQ/aleo/main/install.sh | sh
   leo --version
   ```

2. **Aleo testnet credits**
   - Visit: https://faucet.aleo.org
   - Enter your wallet address
   - Wait 2-5 minutes for credits

## Deployment Steps

### 1. Navigate to contracts folder
```bash
cd contracts
```

### 2. Build the contract
```bash
leo build shadowid_zk.leo
```

This will:
- Compile the Leo program
- Generate proving and verifying keys
- Create build artifacts in `build/`

### 3. Deploy to Aleo Testnet
```bash
leo deploy shadowid_zk --network testnet
```

You'll be prompted:
- Confirm deployment (y/n)
- Sign the transaction with your wallet

### 4. Save the Program ID

After deployment, you'll see output like:
```
✅ Successfully deployed program shadowid_zk.aleo
Transaction ID: at1abc...xyz789
```

**Copy the Transaction ID!**

### 5. Configure Your App

Create or update `.env.local` in project root:

```env
# Aleo ZK Contract Configuration
NEXT_PUBLIC_ALEO_PROGRAM_ID=shadowid_zk.aleo
NEXT_PUBLIC_ALEO_TRANSACTION_ID=at1abc...xyz789
NEXT_PUBLIC_ALEO_NETWORK=testnet
```

### 6. Register Initial Trusted Issuers

After deployment, register trusted issuers who can attest credentials:

```bash
# Register government issuer
leo run register_issuer <government_address> --network testnet

# Register university issuer  
leo run register_issuer <university_address> --network testnet

# Register professional issuer
leo run register_issuer <professional_address> --network testnet
```

## Verify Deployment

Check your deployment on Aleo Explorer:
```
https://explorer.aleo.org/transaction/<your-transaction-id>
https://explorer.aleo.org/program/shadowid_zk.aleo
```

## Next Steps

After deployment:

1. **Update Integration Code**
   - The app will automatically detect `NEXT_PUBLIC_ALEO_PROGRAM_ID`
   - Blockchain status will show "Deployed" with contract links

2. **Test Attestation Flow**
   - Navigate to "Request Attestation" in the app
   - Request an attestation from a registered issuer
   - Generate ZK proofs from your credentials

3. **Generate ZK Proofs**
   - Go to "My Credentials"
   - Select credential
   - Generate proofs (range, membership, existence)
   - Share proofs via QR code

## Contract Functions Reference

### For Trusted Issuers:
- `issue_attestation` - Issue a credential to a user
- `revoke_attestation` - Revoke a previously issued credential

### For Users:
- `prove_range` - Prove value is in range (e.g., age >= 21)
- `prove_membership` - Prove value is in a set (e.g., country is EU member)
- `prove_existence` - Prove attribute exists without revealing value
- `verify_proof` - Verify a ZK proof on-chain

### Governance:
- `register_issuer` - Add trusted issuer (requires admin rights)

## Troubleshooting

**Build fails:**
- Check Leo CLI version: `leo --version` (should be latest)
- Verify syntax: Review error messages for line numbers
- Check imports: Ensure all dependencies are correct

**Deployment fails:**
- Insufficient credits: Get more from faucet
- Network issues: Try again or check Aleo network status
- Transaction timeout: Increase gas limit in leo.toml

**Integration issues:**
- Verify `.env.local` variables are set correctly
- Restart Next.js dev server after env changes
- Check browser console for integration errors

## Cost Estimate

Deployment costs (approximate):
- Build: Free (local)
- Deploy program: ~10-20 testnet credits
- Register issuers: ~1-2 credits per issuer
- Issue attestation: ~2-3 credits per attestation
- Generate proof: Free (client-side)
- Verify proof on-chain: ~1-2 credits

Total initial setup: ~15-30 testnet credits

## Security Notes

1. **Private Keys**: Never commit private keys to version control
2. **Issuer Trust**: Only register verified, trusted issuers
3. **Nullifiers**: System prevents proof reuse automatically
4. **Revocation**: Issuers can revoke compromised credentials
5. **Auditing**: All on-chain operations are publicly auditable

## Support

- Aleo Documentation: https://developer.aleo.org
- Leo Language Guide: https://developer.aleo.org/leo
- Discord: https://discord.gg/aleo
- GitHub Issues: Report bugs in ShadowID repo
