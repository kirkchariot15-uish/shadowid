# ShadowID v3 - Aleo Smart Contract

Zero-knowledge identity contract for registering commitments and recording peer attestations on the Aleo blockchain.

## Functions

### 1. `register_commitment(commitment: field, attribute_count: u8) -> CommitmentRegistry`
Registers a new identity commitment on-chain.

**Parameters:**
- `commitment` - The ZK commitment hash (field type, typically derived from SHA256 of attributes)
- `attribute_count` - Number of attributes user is activating (1-8)

**Returns:** CommitmentRegistry record containing owner, commitment, timestamp, attribute count

**Validation:**
- Commitment must not already be registered
- Attribute count must be 1-8

**On-chain State Changes:**
- Records commitment as verified
- Initializes endorsement count to 0
- Sets initial shadow score to 50 (neutral)

### 2. `verify_commitment(commitment: field) -> bool`
Public read to check if a commitment exists on-chain (used by verification page).

**Parameters:**
- `commitment` - The commitment hash to verify

**Returns:** Boolean - true if registered, false if not found

### 3. `endorse_attribute(commitment: field, endorser: address, attribute_id: u8)`
Records a peer endorsement for one specific attribute.

**Parameters:**
- `commitment` - The commitment being endorsed
- `endorser` - The Aleo address of the person endorsing
- `attribute_id` - Which attribute (0-7) is being endorsed

**Validation:**
- Commitment must exist
- Endorser cannot be the commitment owner
- Cannot endorse same attribute twice

**On-chain State Changes:**
- Stores the endorsement (prevents duplicates)
- Increments total endorsement count
- Updates shadow score (+5 per endorsement, max 100)

### 4. `get_shadow_score(commitment: field) -> u64`
Public read to get credibility score (0-100).

**Default for new identities:** 50 (neutral)
**Increases by:** 5 per valid endorsement
**Max:** 100

### 5. `get_endorsement_count(commitment: field) -> u64`
Public read to get total number of endorsements received.

## Data Structures

### CommitmentRegistry (Record)
```
owner: address          // User who registered
commitment: field       // ZK commitment hash
timestamp: u64         // Block height when registered
attribute_count: u8    // Number of activated attributes
```

### Mappings
```
commitments: field => bool                    // Is commitment registered?
endorsement_count: field => u64              // How many endorsements?
endorsements: field => bool                  // Specific endorsement exists?
shadow_scores: field => u64                  // Credibility score (0-100)
```

## Deployment Instructions

### Prerequisites
```bash
# Install Aleo CLI
curl https://sh.aleo.org | bash
source $HOME/.aleo/aleo_env

# Ensure testnet credits
aleo account new  # If first time
```

### Deploy
```bash
cd contracts/shadowid_v3

# Build the program
aleo build

# Deploy to testnet (requires credits)
aleo deploy --network testnet
```

### Output
After deployment, you'll get:
- **Program ID:** `shadowid_v3.aleo`
- **Deployment Transaction:** Save this for verification

## Integration with Frontend

Update `/lib/aleo-sdk-integration.ts`:

```typescript
const PROGRAM_ID = "shadowid_v3.aleo";  // After deployment
const REGISTER_COMMITMENT_FUNCTION = "register_commitment";
const ENDORSE_ATTRIBUTE_FUNCTION = "endorse_attribute";
```

## Contract Guarantees

1. **No Fake Commitments** - Only registered commitments can receive endorsements
2. **No Double-Endorsement** - Same person can't endorse same attribute twice
3. **Credibility Score** - Transparently calculated from endorsements only
4. **Immutable History** - All endorsements permanently recorded
5. **Privacy** - Endorsements don't reveal attribute details

## Testing on Aleo Studio

1. Go to https://studio.aleo.org
2. Import this program
3. Test transitions:
   - Call `register_commitment` with a test commitment
   - Verify with `verify_commitment`
   - Test `endorse_attribute` from different accounts
   - Check scores with `get_shadow_score`

## Security Notes

- Commitment hash should be deterministic from attributes
- Endorser address is part of uniqueness key (prevents game-able endorsements)
- Shadow scores are public (transparency builds trust)
- Records cannot be minted directly by users (immutable)
