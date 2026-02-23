# Aleo Smart Contract Deployment Guide

This guide walks you through deploying the ShadowID smart contracts to Aleo testnet.

## Prerequisites

1. **Leo CLI** - Install from https://github.com/AleoHQ/leo
2. **Aleo SDK** - Already included in the project
3. **Testnet Credits** - Get from Aleo testnet faucet
4. **Wallet** - Shield or Leo wallet connected to the app

## Deployment Steps

### 1. Install Leo (if not already installed)

```bash
# macOS/Linux
curl https://install.leo.app | sh

# or use script in project
bash scripts/install-leo.sh
```

### 2. Deploy Contracts

```bash
# Deploy all three contracts
bash scripts/deploy-contract.sh

# Or deploy individually:
leo deploy --path contracts/shadowid_v2.aleo --network testnet
leo deploy --path contracts/credential_registry.aleo --network testnet
leo deploy --path contracts/qr_verifier.aleo --network testnet
```

### 3. Collect Program IDs

After deployment, Leo will output transaction IDs. Keep these safe - you need them for the app.

Example output:
```
Program shadowid_v2.aleo deployed successfully
Transaction ID: at1kqn24hdqxqq0u5nmu4xgq7usjy2lcv8e2ksdl5ufnfay5mde258q8rwa90

Program credential_registry.aleo deployed successfully
Transaction ID: at1xxxxx...

Program qr_verifier.aleo deployed successfully
Transaction ID: at1yyyyy...
```

### 4. Configure Environment Variables

Copy `.env.contracts.example` to `.env.local` and add your deployed program IDs:

```bash
cp .env.contracts.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SHADOWID_PROGRAM_ID=shadowid_v2.aleo
NEXT_PUBLIC_CREDENTIAL_REGISTRY_PROGRAM_ID=credential_registry.aleo
NEXT_PUBLIC_QR_VERIFIER_PROGRAM_ID=qr_verifier.aleo
NEXT_PUBLIC_ALEO_NETWORK=testnet
ALEO_ENCRYPTION_SALT=generate_a_random_string_here
```

For `ALEO_ENCRYPTION_SALT`, generate a random string:
```bash
# On macOS/Linux
openssl rand -hex 16

# Output example: 3f8a1d2e9c4b6e7f
```

### 5. Restart the App

```bash
npm run dev
# or
pnpm dev
```

## Testing the Contracts

### Test Identity Creation

1. Connect your Shield/Leo wallet
2. Go to "Create ID" 
3. Fill in attributes with values
4. Click "Create ShadowID"
5. Check that commitment hash is saved and blockchain registration succeeds

### Test QR Code Verification

1. Go to "Verify QR Code"
2. Enter the commitment hash from a created identity
3. Click "Verify Credential"
4. Verify the transaction is recorded on Aleo testnet

### Test Credential Revocation

1. Go to "Privacy Control Center"
2. Find your credential
3. Click "Revoke"
4. Confirm the revocation on blockchain

## Troubleshooting

### "Program not found on testnet"
- Double-check your program IDs in `.env.local`
- Verify deployment was successful
- Check testnet explorer: https://explorer.provable.com

### "Crypto API not available"
- Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Clear browser cache and reload
- Try in a private/incognito window

### "Transaction failed"
- Ensure you have testnet credits
- Check wallet has enough balance
- Try again - testnet can be slow

### "Commitment not found on registry"
- Wait a few seconds for blockchain confirmation
- Verify the commitment hash is correct
- Check on testnet explorer

## Contract Functions

### shadowid_v2.aleo
- `register_issuer(address)` - Register as trusted issuer
- `issue_attestation(...)` - Issue credential attestation
- `revoke_attestation(commitment)` - Revoke credential
- `prove_range(...)` - Prove attribute in range
- `prove_membership(...)` - Prove membership in set
- `prove_existence(...)` - Prove credential exists and is valid

### credential_registry.aleo
- `register_commitment(field, u8)` - Register credential commitment
- `revoke_credential(field)` - Revoke credential from registry
- `verify_commitment(field)` - Verify credential is active

### qr_verifier.aleo
- `verify_qr_credential(field, field, field)` - Record QR verification
- `increment_verification_count(field)` - Track verification count

## Security Notes

1. **Private Keys**: Never share your wallet's private key
2. **Salt**: Keep `ALEO_ENCRYPTION_SALT` secret
3. **Credentials**: Are encrypted locally with AES-256-GCM before any storage
4. **Blockchain**: All commitments are on-chain and immutable
5. **Revocation**: Once revoked, credential cannot be used for proofs

## Next Steps

1. Deploy contracts to testnet
2. Add program IDs to `.env.local`
3. Test identity creation
4. Test QR verification
5. Test credential revocation
6. Deploy app to production (Vercel)

For issues or questions, check:
- Aleo docs: https://developer.aleo.org
- Leo documentation: https://leo-lang.org
- Project issues: GitHub issues
