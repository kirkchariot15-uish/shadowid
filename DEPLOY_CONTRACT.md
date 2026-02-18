# ShadowID Smart Contract Deployment Guide

## Step-by-Step Deployment Instructions

### Step 1: Install Leo CLI

Open your terminal and run:

```bash
curl -L https://raw.githubusercontent.com/AleoHQ/aleo/main/install.sh | sh
```

After installation, verify it worked:

```bash
leo --version
```

You should see something like `Leo 1.12.0` or similar.

---

### Step 2: Get Aleo Testnet Credits

1. Go to the Aleo Faucet: https://faucet.aleo.org
2. Connect your Aleo wallet (Leo Wallet or similar)
3. Request testnet credits (you need credits to deploy)
4. Wait for confirmation (usually takes 1-2 minutes)

---

### Step 3: Navigate to Contract Directory

```bash
cd contracts
```

---

### Step 4: Build the Contract

```bash
leo build
```

This compiles your `shadowid.leo` contract. You should see:

```
✅ Compiled 'shadowid.aleo'
```

If you see errors, the contract has syntax issues that need fixing.

---

### Step 5: Deploy to Testnet

```bash
leo deploy --network testnet
```

This will:
- Prompt you for your private key (from your Aleo wallet)
- Upload the compiled contract to the blockchain
- Cost testnet credits

**Save the output!** You'll see something like:

```
✅ Deployed 'shadowid.aleo' to testnet
Program ID: shadowid.aleo
Transaction ID: at1xyz...
```

---

### Step 6: Configure Your App

1. In your project root, create or edit `.env.local`:

```bash
NEXT_PUBLIC_ALEO_PROGRAM_ID=shadowid.aleo
NEXT_PUBLIC_ALEO_NETWORK=testnet
```

2. Restart your dev server:

```bash
pnpm dev
```

---

### Step 7: Update Integration Code

The current `lib/aleo-contract.ts` is using mock/localStorage. After deployment, you need to integrate the real Aleo SDK.

Install Aleo SDK:

```bash
pnpm add @aleohq/sdk
```

Then update `lib/aleo-contract.ts` to use real blockchain calls instead of localStorage simulation.

---

## Verification

After deployment, verify your contract on Aleo Explorer:

https://testnet.aleo.info/

Search for your program ID: `shadowid.aleo`

You should see:
- Contract code
- Deployment transaction
- Available functions (register_commitment, revoke_commitment, is_revoked)

---

## Troubleshooting

**"Leo not found"**: Make sure Leo CLI is installed and in your PATH. Try closing and reopening terminal.

**"Insufficient credits"**: Get more from the faucet at https://faucet.aleo.org

**"Program already exists"**: The program name is taken. Change `program shadowid.aleo` to `program shadowid_yourname.aleo` in the contract.

**Build fails**: Check the contract syntax. Run `leo build` to see specific errors.

---

## Next Steps After Deployment

1. Test the contract by creating a new identity in your app
2. Verify the commitment appears on Aleo Explorer
3. Test revocation functionality
4. Update UI to remove "Simulation Mode" banner
