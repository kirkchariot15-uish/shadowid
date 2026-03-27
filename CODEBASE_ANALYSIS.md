# ShadowID Codebase Analysis

**Last Updated:** March 2026  
**Version:** v41 (restored from v32)  
**Framework:** Next.js 16 with React 19.2 + TypeScript  
**Blockchain:** Aleo Testnet  

---

## 1. PROJECT OVERVIEW

**Purpose:** ShadowID is a decentralized identity platform built on the Aleo blockchain that enables users to create and manage zero-knowledge identity credentials with selective disclosure capabilities.

**Key Features:**
- Zero-knowledge identity creation with cryptographic commitments
- Selective attribute disclosure without revealing full identity
- Peer endorsement system for trust building
- QR-based proof requests and verification
- Subscription tiers with attribute limits
- Anti-sybil attack detection
- Activity audit trails
- Multi-wallet support (Shield, Leo, Fox, Puzzle, Soter)

**Tech Stack:**
- **Frontend:** Next.js 16, React 19.2, TypeScript, Tailwind CSS 4.1
- **Blockchain Integration:** @provablehq/aleo-wallet-adaptor v0.3.0-alpha.3
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** React hooks + localStorage with wallet validation
- **Cryptography:** Native Web Crypto API + custom ZK proof handling

---

## 2. DIRECTORY STRUCTURE

```
/vercel/share/v0-project/
├── app/                          # Next.js app router pages
│   ├── api/                       # API routes
│   │   ├── proof-requests/
│   │   └── verify-qr/
│   ├── create-identity/           # Identity creation flow
│   ├── dashboard/                 # Main user dashboard
│   ├── identity/                  # Identity management (My ShadowID)
│   ├── settings/                  # Account settings
│   ├── selective-disclosure/      # Proof disclosure UI
│   ├── proof-requests/            # Inbox for proof requests
│   ├── verifier/                  # QR verification interface
│   ├── pricing/                   # Subscription pricing page
│   ├── privacy/                   # Privacy policy
│   └── layout.tsx                 # Root layout with security headers
│
├── components/                    # React components
│   ├── ui/                        # Shadcn/ui components (60+ components)
│   ├── create-identity-page.tsx   # Identity creation workflow
│   ├── identity-management-page.tsx
│   ├── subscription-checkout.tsx  # Payment processing
│   ├── dashboard-page.tsx         # Main dashboard
│   ├── proof-response-page.tsx    # Proof generation
│   ├── qr-camera-scanner.tsx      # QR scanning
│   ├── wallet-button.tsx          # Wallet connection UI
│   ├── navigation.tsx             # Main navigation
│   └── [other components].tsx
│
├── lib/                           # Business logic & utilities (34 files)
│   ├── aleo-sdk-integration.ts    # Blockchain interaction
│   ├── blockchain-transaction-handler.ts
│   ├── wallet-provider.tsx        # Aleo wallet setup
│   ├── subscription-manager.ts    # Subscription logic
│   ├── attribute-schema.ts        # Attribute definitions
│   ├── account-recovery.ts        # Account recovery logic
│   ├── proof-verifier.ts          # Zero-knowledge verification
│   ├── storage-encryption.ts      # LocalStorage encryption
│   ├── session-management.ts      # Session handling
│   ├── anti-sybil.ts              # Sybil attack prevention
│   ├── activity-logger.ts         # Audit trail
│   └── [many other utilities]
│
├── hooks/                         # Custom React hooks
│   ├── use-aleo-wallet.ts         # Main wallet hook
│   ├── use-qr-camera-scanner.ts
│   ├── use-session-timeout.ts
│   └── use-mobile.tsx
│
├── contracts/                     # Aleo smart contracts
│   ├── program.json               # Main contract deployment info
│   ├── zk-program.json
│   └── test-contract.ts
│
└── config files (tsconfig.json, tailwind.config.ts, etc.)
```

---

## 3. CORE ARCHITECTURE PATTERNS

### 3.1 State Management Flow

```
Browser Storage (Encrypted)
    ↓
useAleoWallet Hook (wallet state)
    ↓
Components (React state)
    ↓
Library Functions (business logic)
    ↓
Blockchain (Aleo network)
```

**Key Principle:** All user data is stored locally with optional encryption. No backend server - everything is client-side or on-chain.

### 3.2 Authentication & Wallet Integration

- **Provider:** `WalletProviderComponent` wraps entire app
- **Network:** Aleo Testnet (via Network.TESTNET enum)
- **Wallets Supported:** 5 wallet adapters (Shield, Leo, Fox, Puzzle, Soter)
- **Auto-connect:** Enabled by default
- **Permissions:** DecryptPermission.UponRequest

### 3.3 Identity Creation Flow

```
1. User connects wallet → Gets address
2. Selects attributes to include
3. Validates attribute values (lib/attribute-validator.ts)
4. Generates commitment hash locally (crypto-utils.ts)
5. Creates on-chain transaction:
   - Program: shadowid_v5.aleo
   - Function: registerAttributesAndGetCommitment()
   - Inputs: JSON serialized attributes
6. Transaction executes on Aleo testnet
7. Commitment stored on-chain
8. Commitment hash displayed to user
9. Account mapping stored locally & on blockchain
```

### 3.4 Attribute System

**Standard Attributes (8 types):**
- `attr:age-range` (enum: 13-17, 18-24, 25-34, 35-44, 45-54, 55-64, 65+)
- `attr:country` (2-letter country code)
- `attr:education-level` (enum)
- `attr:industry` (enum)
- `attr:company` (text)
- `attr:occupation` (text)
- `attr:linkedin-verified` (boolean)
- `attr:email-verified` (boolean)

**Custom Attributes:** Users can define unlimited custom key-value attributes (with subscription)

**Schema Structure:**
```typescript
interface AttributeSchema {
  id: string
  name: string
  category: 'personal' | 'professional' | 'government' | 'membership' | 'financial' | 'education'
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'enum'
  allowedProofTypes: 'exact' | 'range' | 'membership' | 'existence' | 'equality'
  privacyLevel: 'low' | 'medium' | 'high' | 'critical'
}
```

### 3.5 Subscription Model

**Tiers:**
| Tier | Max Attributes | Custom Attrs | Cost | Currency |
|------|----------------|--------------|------|----------|
| Free | 2 | 0 | 0 | - |
| Standard | 8 | 0 | 5 | ALEO |
| Premium | 8 | 5 | 10 | USDx |
| Custom | 20 | 20 | 25 | USDx |

**Payment Flow:**
1. User selects tier in `subscription-checkout.tsx`
2. Choose payment token (ALEO or USDx stablecoin)
3. Execute blockchain transaction via wallet
4. Poll for confirmation (30 attempts, 2-second intervals)
5. Update subscription status on confirmation
6. Update UI with new attribute limits

**Key Issue (v32 state):** Previous versions had USDx references that should be USDCx (the correct Aleo stablecoin program)

### 3.6 Transaction Execution

**Pattern used throughout:**
```typescript
// 1. Prepare transaction
const txParams = {
  program: 'program.aleo',
  functionName: 'function_name',
  inputs: ['typed', 'inputs'],
  fee: 1000000 // 1 ALEO in microcredits
}

// 2. Execute via wallet
const transactionId = await executeTransaction(txParams)

// 3. Poll for confirmation
const status = await getTransactionStatus(transactionId)

// 4. Update app state on confirmation
```

**Fee Structure:**
- Standard transaction fee: 1 ALEO (1,000,000 microcredits)
- Must match what's shown to user - no hidden charges
- Fee is always paid in ALEO, even for token transfers

---

## 4. CRITICAL BUSINESS LOGIC

### 4.1 Zero-Knowledge Proof Generation

**Location:** `lib/aleo-sdk-integration.ts` → `registerAttributesAndGetCommitment()`

**Process:**
1. Serialize selected attributes to JSON
2. Hash with SHA-256 to create commitment
3. Execute contract function with typed inputs
4. Receive commitment hash from blockchain
5. Store mapping: wallet → commitment locally

### 4.2 Proof Requests & Disclosure

**Location:** `lib/proof-request-manager.ts`

**Flow:**
1. Verifier creates proof request (QR code)
2. QR contains: required attributes + proof types
3. User scans QR → sees what they need to prove
4. User selects which attributes to disclose
5. Generates selective disclosure proof
6. Submits proof to verifier
7. Verifier validates cryptographically

### 4.3 Account Recovery

**Location:** `lib/account-recovery.ts`

**Features:**
- Recover existing identity by wallet address
- Check blockchain for previous commitments
- Prevent duplicate account creation
- Account deletion with permanent marking

**Critical:** Deleted accounts marked with `isDeleted: true` flag to prevent recovery

### 4.4 Anti-Sybil Protection

**Location:** `lib/anti-sybil.ts`

**Mechanisms:**
- Rate limiting: 1 identity per wallet per 24 hours
- Shadow score system: 0-100 (starts at 50)
- Endorsement tracking: peer verification
- Endorsement expiry: 365 days
- Activity logging: all actions audited

### 4.5 Session Management

**Location:** `lib/session-management.ts`

**Features:**
- 30-minute session timeout (can be configured)
- Automatic logout on tab close
- Session validation with wallet address
- Encrypted session data in localStorage

---

## 5. DATA STORAGE STRATEGY

### 5.1 LocalStorage Keys

```typescript
// Identity data
'shadowid-encrypted-bundle'      // Full encrypted identity
'shadowid-commitment'            // Commitment hash
'shadowid-created-at'            // Creation timestamp
'shadowid-user-info'             // User profile
'shadowid-photo-encrypted'       // Encrypted avatar

// Attributes
'shadowid-credentials-v2'        // Attribute store
'shadowid-activated-attributes'  // Enabled attributes
'shadowid-custom-attributes'     // User-defined attributes

// Proofs & Verification
'shadowid-disclosure-proofs'     // Generated proofs
'shadowid-verification-history'  // Verification records

// Social
'shadowid-endorsements'          // Peer endorsements
'shadowid-anti-sybil-tokens'     // Anti-sybil score

// Blockchain
'shadowid-wallet-commitments'    // Wallet → commitment mapping
'shadow-id-wallet-address'       // Current wallet

// Session & Config
'shadowid-current-session'       // Active session
'shadowid-session-config'        // Session settings
'shadowid-subscription'          // Subscription status
'shadowid-activity-logs'         // Audit trail
'identity-created'               // Flag for UI
```

### 5.2 Encryption Strategy

**Location:** `lib/storage-encryption.ts`

- Uses Web Crypto API (AES-GCM)
- Encryption key derived from wallet address
- Sensitive data: encrypted, non-sensitive: plain
- Validation on retrieve to ensure data integrity

---

## 6. WALLET INTEGRATION DETAILS

### 6.1 Hook API: `useAleoWallet()`

```typescript
const {
  address,              // Connected wallet address
  connected,            // Boolean connection state
  executeTransaction,   // (params) => Promise<transactionId>
  getTransactionStatus, // (txId) => Promise<status>
  disconnect,           // () => void
  wallet,               // Current wallet adapter
  wallets,              // Available wallets
  network,              // Current network
  signMessage,          // Message signing
  requestRecords,       // Request records
  decrypt,              // Decrypt permissions
} = useAleoWallet()
```

### 6.2 Transaction Structure

**Input Parameters:**
```typescript
interface AleoTransactionRequest {
  transitions: [
    {
      program: string        // 'program_name.aleo'
      functionName: string   // 'function_name'
      inputs: string[]       // Typed: "123u64", "field", "address"
    }
  ]
  fee: number             // In microcredits (1 ALEO = 1,000,000)
  feePrivate?: boolean    // Private vs public fee
}
```

**Supported Wallet Adapters:**
- Shield Mobile Wallet (iOS/Android)
- Leo Wallet (Browser extension)
- Fox Wallet
- Puzzle Wallet
- Soter Wallet

---

## 7. CRITICAL FILES & THEIR PURPOSES

| File | Lines | Purpose |
|------|-------|---------|
| `app/create-identity/page.tsx` | 500+ | Full identity creation wizard |
| `components/create-identity-page.tsx` | 800+ | Core identity creation logic |
| `lib/aleo-sdk-integration.ts` | 1000+ | Blockchain interaction layer |
| `lib/subscription-manager.ts` | 300+ | Subscription & tier management |
| `lib/account-recovery.ts` | 400+ | Account recovery & deletion |
| `hooks/use-aleo-wallet.ts` | 200+ | Wallet connection hook |
| `lib/storage-encryption.ts` | 300+ | Data encryption/decryption |
| `lib/proof-verifier.ts` | 400+ | ZK proof validation |
| `components/subscription-checkout.tsx` | 400+ | Payment processing UI |
| `lib/attribute-schema.ts` | 500+ | Attribute definitions |

---

## 8. SECURITY CONSIDERATIONS

### 8.1 Implemented Protections

✅ **Content Security Policy (CSP)** - Strict headers in layout.tsx  
✅ **XSS Prevention** - No unsafe inline scripts beyond React  
✅ **Clickjacking Prevention** - X-Frame-Options headers  
✅ **MIME Sniffing Prevention** - X-Content-Type-Options  
✅ **Encrypted Storage** - AES-GCM for sensitive data  
✅ **Session Validation** - Wallet address verification  
✅ **Anti-Sybil** - Rate limiting + scoring  
✅ **Input Validation** - Type checking for Aleo inputs  
✅ **Activity Audit Trail** - All user actions logged  

### 8.2 Potential Vulnerabilities

⚠️ **No Backend Validation** - All logic client-side  
⚠️ **LocalStorage Exposure** - If device compromised, all data accessible  
⚠️ **Testnet Only** - Contract not audited/deployed to mainnet  
⚠️ **No Rate Limiting** (server-side) - Could spam transactions  
⚠️ **Recovery System** - Deleted accounts could theoretically be recovered if commitment hash known  

---

## 9. KEY DEVELOPMENT PATTERNS

### 9.1 Error Handling

**Pattern:**
```typescript
try {
  // Business logic
} catch (error) {
  console.error('[v0] Context:', error)
  setError(error.message)
  toast.error('User friendly message')
  addActivityLog('action', 'error', errorDetails)
}
```

### 9.2 Async Operations

**Pattern:**
```typescript
const [isLoading, setIsLoading] = useState(false)

const handleAction = async () => {
  setIsLoading(true)
  try {
    const result = await blockchainAction()
    // Success
  } catch (error) {
    // Error handling
  } finally {
    setIsLoading(false)
  }
}
```

### 9.3 Wallet Validation

**Before every transaction:**
1. Check wallet connected
2. Validate address exists
3. Verify executeTransaction function available
4. Check network is testnet
5. Validate user has sufficient balance (estimated)

---

## 10. KNOWN ISSUES & TECHNICAL DEBT

### v32 State (Current)

1. **USDx vs USDCx:** References to "USDx" should be "USDCx" (Aleo stablecoin program)
2. **Transaction Confirmation:** No reliable way to confirm balance after payment
3. **QR Expiry:** Not properly enforced on verifier side
4. **Account Deletion:** Soft delete only - doesn't remove from blockchain
5. **No Backend State:** Impossible to migrate data if contract changes
6. **Testnet Only:** Contract not ready for mainnet
7. **Fee Estimation:** No pre-flight to estimate fees before transaction

---

## 11. DEPLOYMENT & CONFIGURATION

### Environment Variables (if needed)

```env
NEXT_PUBLIC_SHADOWID_PROGRAM_ID=shadowid_v5.aleo
NEXT_PUBLIC_CREDENTIAL_REGISTRY_PROGRAM_ID=credential_registry.aleo
NEXT_PUBLIC_QR_VERIFIER_PROGRAM_ID=qr_verifier.aleo
NEXT_PUBLIC_DAO_ATTESTATION_PROGRAM_ID=dao_attestation_v1.aleo
```

### Build Info

- **Package Manager:** pnpm
- **Node Version:** 22+
- **Next.js Build:** `pnpm run build`
- **Dev Server:** `pnpm run dev --turbo` (Turbopack enabled)

---

## 12. SUGGESTED IMPROVEMENTS

### High Priority

1. **Add Backend State** - Server-side subscription/user data
2. **Contract Audit** - Security review before mainnet
3. **Fee Simulation** - Pre-flight checks for transaction fees
4. **Error Recovery** - Better error handling for blockchain failures
5. **Balance Checking** - Real-time wallet balance display

### Medium Priority

1. **Mobile Optimization** - Better QR scanning on mobile
2. **Proof Caching** - Cache generated proofs locally
3. **Batch Operations** - Group multiple attributes into single transaction
4. **Analytics** - Track user flows and drop-off points
5. **Rate Limiting** - Server-side rate limiting for API calls

### Low Priority

1. **Dark Mode Toggle** - Currently hardcoded to dark
2. **Multi-language** - Only English supported
3. **Accessibility Audit** - WCAG compliance review
4. **Performance Profiling** - Optimize re-renders
5. **Component Library** - Extract sharable components

---

## 13. TESTING CHECKLIST

- [ ] Identity creation with all attribute types
- [ ] Subscription upgrade flow
- [ ] QR proof request generation & verification
- [ ] Account deletion & recovery blocking
- [ ] Session timeout enforcement
- [ ] Wallet disconnection handling
- [ ] Transaction failure recovery
- [ ] Attribute editing & validation
- [ ] Cross-wallet compatibility (5 wallets)
- [ ] Browser storage encryption/decryption
- [ ] Anti-sybil rate limiting
- [ ] Activity log persistence
- [ ] Mobile responsiveness
- [ ] Network switching (if applicable)

---

**End of Analysis**
