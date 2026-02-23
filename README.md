# ShadowID - Zero-Knowledge Privacy-Preserving Identity System

## What is ShadowID?

ShadowID is a **privacy-first, blockchain-based digital identity system** built on the Aleo network. It allows you to create a cryptographic identity commitment and selectively disclose personal attributes without revealing your actual data. Your identity is powered by zero-knowledge proofs and runs entirely on the Aleo blockchain.

**Core Philosophy:** You own your identity. Your data stays encrypted locally. You prove claims about yourself without revealing the claims.

---

## Key Features

### 1. **Zero-Knowledge Identity Creation**
- Create a cryptographic identity commitment from your wallet address
- Select personal attributes (name, age, credentials, professional info, etc.)
- All attributes are hashed and encrypted locally - nothing is stored unencrypted
- Generate a unique commitment hash that represents your identity on-chain

### 2. **Attribute System**
ShadowID supports 6 categories of attributes:

| Category | Examples |
|----------|----------|
| **Personal** | Full Name, Email, Phone Number, Country |
| **Professional** | Job Title, Employer, Years of Experience |
| **Government** | Government ID, Passport, Tax ID |
| **Financial** | Credit Score Range, Bank Account Status |
| **Education** | University Degree, Certifications, Skills |
| **Membership** | Organization Membership, Subscription Status |

Each attribute has:
- Privacy level (low, medium, high, critical)
- Data type validation
- Optional issuer verification requirement
- Multiple proof types (exact, range, membership, existence, equality)

### 3. **Selective Disclosure**
- Create QR codes that encode your identity commitment
- Share specific attributes with verifiers without revealing the rest
- Prove claims about yourself without revealing actual values
- Example: Prove you're over 21 without revealing your exact age

### 4. **Blockchain Integration (Aleo Testnet)**
- Register your identity commitment on-chain
- Immutable record of your identity
- Smart contracts verify credentials without seeing private data
- Three contracts manage the system:
  - `shadowid_v2.aleo` - Core identity and attestation management
  - `credential_registry.aleo` - Registers and tracks credentials
  - `qr_verifier.aleo` - Records QR code verifications

### 5. **End-to-End Encryption**
- All offline data encrypted with **AES-256-GCM**
- Encryption keys derived from wallet address + cryptographic salt
- Credentials stored locally in encrypted format
- Only commitment hash stored on-chain (verifiers can't see your actual attributes)

### 6. **QR Code Verification**
- Generate shareable QR codes encoding your identity commitment
- Verifiers scan QR codes to verify your credentials
- Verification events recorded on-chain as audit trail
- Each verification recorded with timestamp and verifier info

### 7. **Privacy Dashboard**
- Monitor all verification activity
- See who verified your credentials and when
- Revoke credentials at any time
- View revocation list and audit trail
- Rate-limit access to your identity
- Configure credential expiration

### 8. **Profile Management**
- Optional public profile (username + bio)
- Profile encrypted locally, never transmitted unencrypted
- Selective disclosure of profile info when sharing QR codes
- Separate from core identity commitment

---

## How It Works

### User Flow

#### Step 1: Connect Wallet
```
User → Connect Shield/Leo Wallet → Get Aleo Address
```

#### Step 2: Create ShadowID
```
Select Attributes → Choose Values → Encrypt Locally → 
Generate Commitment Hash → Register on Aleo Blockchain
```

**Behind the scenes:**
- Attributes hashed: `H(attribute_name || attribute_value)`
- Commitment created: `H(wallet_address || attribute_hashes || salt || timestamp)`
- Stored locally encrypted with AES-256-GCM
- Commitment registered on `credential_registry.aleo` contract
- User receives confirmation on-chain

#### Step 3: Set Optional Profile
```
Enter Username → Enter Bio → Encrypt → Save Locally
```

Profile is **separate** from identity commitment - optional metadata that can be disclosed separately.

#### Step 4: Generate QR Codes
```
Select attributes to share → Generate ZK Proof → Encode in QR → 
User can share QR code with verifiers
```

QR code contains:
- Your commitment hash
- Proof ID
- Timestamp
- Selected attributes (encrypted)

#### Step 5: Verifier Scans QR Code
```
Scan QR → Extract Commitment → Query Aleo Blockchain → 
Verify Commitment Exists → Check Revocation Status → ✓ Verified
```

**Verification Result:**
- ✓ Credential valid and active
- ✓ Not revoked
- ✓ Commitment matches on-chain record
- Verification event recorded on `qr_verifier.aleo` contract

#### Step 6: Revoke if Needed
```
Privacy Dashboard → Select Credential → Revoke → 
Removed from Registry → All future verifications fail
```

---

## Privacy Model

### What Gets Encrypted (Offline Storage)
- Attribute names and values
- Profile information (username, bio)
- Credential metadata
- Verification history (local copy)

**Encryption:** AES-256-GCM with key derived from wallet address + salt

### What Goes On-Chain (Aleo Blockchain)
- Commitment hash (one-way cryptographic commitment)
- Issuer address (who issued attestation)
- Registration timestamp
- Revocation status (true/false)
- Verification count

**Privacy guarantee:** Verifiers can only see commitment hash, not the actual attributes you claimed.

### What Verifiers Can See
When you share your QR code:
1. Your commitment hash
2. Which attributes you're proving (without values)
3. Proof that commitment is on-chain and active
4. Your verified/revoked status

**What they CAN'T see:**
- Your actual attribute values
- Your wallet address (optional privacy)
- Other attributes you have
- Your profile information (unless you share it)

---

## Technical Architecture

### Frontend Stack
- **Framework:** Next.js 16 (App Router)
- **Wallet Integration:** Aleo Wallet Adaptor (Shield, Leo, Fox, Puzzle, Soter)
- **Encryption:** Web Crypto API (AES-256-GCM)
- **Storage:** Browser localStorage (encrypted)
- **QR Generation:** qrcode.js

### Blockchain Stack
- **Network:** Aleo Testnet
- **Language:** Leo (Aleo's smart contract language)
- **Contracts:** 3 core programs
  - `shadowid_v2.aleo` - Identity & attestation
  - `credential_registry.aleo` - Credential tracking
  - `qr_verifier.aleo` - Verification recording

### Smart Contract Functions

#### shadowid_v2.aleo
```leo
function register_issuer(issuer_address) → Register trusted issuer
function issue_attestation(recipient, attribute_hash, commitment, expiration) → Issue credential
function revoke_attestation(credential_id) → Revoke credential
function verify_commitment(commitment_hash) → Check if commitment exists
```

#### credential_registry.aleo
```leo
function register_commitment(commitment_hash, attribute_count) → Register credential
function revoke_credential(commitment_hash) → Revoke from registry
function verify_commitment(commitment_hash) → Check registry
```

#### qr_verifier.aleo
```leo
function verify_qr_credential(commitment_hash, proof_id, verifier_address) → Record verification
function increment_verification_count(commitment_hash) → Increment counter
```

---

## Attribute Categories Explained

### Personal Attributes
- **Full Name:** Your legal name (privacy: critical)
- **Email:** Contact email (privacy: high)
- **Phone:** Phone number (privacy: high)
- **Country:** Current residence (privacy: medium)
- **Date of Birth:** Birth date (privacy: high)

### Professional Attributes
- **Job Title:** Current position (privacy: medium)
- **Employer:** Company/organization (privacy: medium)
- **Years of Experience:** Career duration (privacy: low)
- **LinkedIn Profile:** LinkedIn URL (privacy: low)
- **Professional Certifications:** Credentials (privacy: medium)

### Government Attributes
- **Government ID Number:** National ID (privacy: critical)
- **Passport Number:** Passport ID (privacy: critical)
- **Tax ID:** Tax identification (privacy: critical)

### Financial Attributes
- **Credit Score Range:** Credit rating band (privacy: high)
- **Bank Account Status:** Account verification (privacy: high)
- **Annual Income Range:** Income bracket (privacy: high)

### Education Attributes
- **University Name:** Attended institution (privacy: medium)
- **Degree Type:** Bachelor/Master/PhD (privacy: low)
- **Major/Field:** Study field (privacy: low)
- **Graduation Year:** Completion date (privacy: low)

### Membership Attributes
- **Organization:** Member organization (privacy: low)
- **Membership Type:** Tier/level (privacy: low)
- **Membership Status:** Active/inactive (privacy: low)
- **Membership Duration:** How long member (privacy: low)

---

## Proof Types

When sharing credentials, you can prove attributes different ways:

| Proof Type | Example | Use Case |
|-----------|---------|----------|
| **Exact** | "My name is John Doe" | Proving exact identity |
| **Range** | "I am between 21-65 years old" | Age verification without exact age |
| **Membership** | "My employer is in this list" | Verify employer without saying which |
| **Existence** | "I have a degree" | Prove education without major/year |
| **Equality** | "My home & work addresses are same" | Prove correlation without values |

---

## Security Model

### 1. Wallet-Based Authentication
- All actions require wallet signature
- Private keys never leave your wallet
- Aleo wallet adaptor handles key management

### 2. Cryptographic Commitments
- Commitment hash is one-way function
- Verifiers can't derive attributes from commitment
- Brute-force resistant (requires credentials to verify)

### 3. Encryption Standards
- **Algorithm:** AES-256-GCM (NIST approved)
- **Key Derivation:** PBKDF2 with 100,000 iterations
- **Salt:** 16-byte random salt per credential
- **IV:** 12-byte random initialization vector
- **Authentication Tag:** Prevents tampering

### 4. On-Chain Verification
- All credentials registered on Aleo blockchain
- Revocation immediately visible on-chain
- Verification events immutable (audit trail)
- Trusted issuer registry on-chain

### 5. Rate Limiting
- Prevent brute-force verification attempts
- Track verification frequency per credential
- Optional inactivity timeout (auto-logout)

---

## Use Cases

### Use Case 1: Proof of Employability
```
Developer wants job → Shares ShadowID with QR code → 
Employer scans → Verifies: years of experience, degree, certifications → 
All verified on-chain without seeing actual details
```

### Use Case 2: Age Verification
```
User enters bar → Shows QR code → Bouncer scans → 
Verifier: "Is this person 21+" → Prove age range without exact DOB
```

### Use Case 3: Financial Credential
```
User applies for loan → Provides QR code → Bank verifies: 
"Credit score in good range" AND "Member for 5+ years" → 
Approve without seeing actual credit score
```

### Use Case 4: Education Verification
```
Candidate applies for university → Shares QR with education ShadowID → 
University verifies degree from accredited institution → 
Proof on-chain, permanent record
```

### Use Case 5: Privacy-Preserving Membership
```
Member wants to prove membership without revealing membership tier → 
Share QR → Verifier checks: member is active → Approved
```

---

## Deployment

### Requirements
- Aleo SDK and Leo CLI installed
- Aleo testnet credits (for contract deployment)
- Node.js 18+
- npm/pnpm

### Steps
See `DEPLOYMENT.md` for complete deployment guide:
1. Deploy three Leo contracts to Aleo testnet
2. Get contract program IDs
3. Add program IDs to `.env.local`
4. Restart app
5. Connect wallet and test

---

## Activity Logging

ShadowID tracks all actions:
- **Identity Creation:** When you created your ShadowID
- **Attribute Updates:** Changes to attributes
- **QR Generation:** Each QR code created
- **Verification Events:** Who verified you and when
- **Revocation Events:** When credentials were revoked
- **Profile Updates:** Changes to profile info

All logged with:
- Timestamp
- Action type
- Status (success/failure)
- Related credential/commitment
- Additional context

---

## Limitations & Future Work

### Current Limitations
- No built-in attestation system (manual verification only)
- Profile is optional metadata (not cryptographically bound to identity)
- Revocation requires user action (no automatic expiration yet)
- QR verification records on-chain, verifier address visible

### Planned Features
- Issuer system (trusted organizations issue credentials)
- Credential expiration & automatic renewal
- Batch verification (prove multiple attributes at once)
- Integration with ID verification services
- Mobile app with offline QR scanning
- Privacy attestation (proof you didn't reveal unnecessary data)

---

## FAQ

**Q: Is my data stored on the blockchain?**
A: No. Only your commitment hash and revocation status are on-chain. Your actual attributes stay encrypted locally.

**Q: Can I create multiple identities?**
A: Yes. Each wallet address can create multiple ShadowIDs for different purposes.

**Q: What happens if I lose my wallet key?**
A: Your encrypted credentials become inaccessible. Keep your wallet key safe. Consider backup wallets.

**Q: Can verifiers see my wallet address?**
A: Only if you choose to share it. The commitment is separate from your wallet.

**Q: How long are credentials valid?**
A: By default, indefinitely until you revoke them. You can set custom expiration dates.

**Q: Is ShadowID production-ready?**
A: ShadowID is on Aleo testnet. Move to mainnet after additional security audits.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│   Landing → Dashboard → Create ID → Profile → Privacy       │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────────┐    ┌────────▼─────────┐
│  Wallet Connect  │    │  Local Storage   │
│  (Shield/Leo)    │    │  (Encrypted)     │
│                  │    │                  │
│ Private Keys     │    │ AES-256-GCM      │
│ Signatures       │    │ Credentials      │
└────────┬─────────┘    └──────────────────┘
         │
         └──────────────┬──────────────────┐
                        │                  │
           ┌────────────▼─────────┐  ┌────▼──────────────┐
           │  Aleo Blockchain     │  │  Smart Contracts │
           │  (Testnet)           │  │                   │
           │                      │  │ shadowid_v2.aleo  │
           │ • Commitments        │  │ credential_       │
           │ • Revocations        │  │   registry.aleo   │
           │ • Verifications      │  │ qr_verifier.aleo  │
           │ • Issuers            │  │                   │
           └──────────────────────┘  └───────────────────┘
```

---

## Support & Resources

- **Aleo Docs:** https://developer.aleo.org
- **Leo Language:** https://leo-lang.org
- **Wallet Adaptor:** https://github.com/provablehq/aleo-wallet-adaptor
- **GitHub:** [Your ShadowID Repo]

---

**ShadowID: Your Identity, Your Privacy, Your Control.**
