# ShadowID Contract Deployment

## Deployed Contract Details

- **Program Name**: `shadowid_v5.aleo`
- **Network**: Aleo Testnet
- **Status**: Deployed

## Contract Functions

### 1. register_commitment
Registers a new identity commitment on-chain with attribute hash.

**Inputs:**
- `commitment` (field): Cryptographic commitment hash
- `attribute_hash` (field): Hash of activated attributes

**Output:** bool

**Security:** Prevents duplicate registration, initializes shadow score at 50

### 2. verify_commitment
Verifies if a commitment exists and is registered on blockchain.

**Inputs:**
- `commitment` (field): Hash to verify

**Output:** bool

**Security:** Returns false for unregistered/fake commitments

### 3. verify_attribute_hash
Verifies attribute hash matches the registered commitment.

**Inputs:**
- `commitment` (field): The commitment to verify against
- `expected_hash` (field): The attribute hash to verify

**Output:** bool

**Security:** Detects tampering after registration

### 4. endorse_attribute
Peer attestation - endorses an attribute from another user.

**Inputs:**
- `target_commitment` (field): Commitment being endorsed
- `attribute_id` (u32): Attribute ID being endorsed
- `endorser_address` (address): Address of endorser

**Output:** bool

**Security:** Prevents double-endorsement, auto-updates shadow score (+5, max 100)

### 5. get_shadow_score
Retrieves credibility score (0-100) for a commitment.

**Inputs:**
- `commitment` (field): The commitment to query

**Output:** u64 (0-100)

**Initial Value:** 50 (neutral)

### 6. get_endorsement_count
Retrieves total endorsement count for a commitment.

**Inputs:**
- `commitment` (field): The commitment to query

**Output:** u64

### 7. challenge_endorsement
Dispute/challenge an endorsement (for governance).

**Inputs:**
- `target_commitment` (field): Commitment with disputed endorsement
- `endorser_address` (address): Endorser being challenged
- `attribute_id` (u32): Attribute being challenged
- `challenger_address` (address): Address of challenger

**Output:** bool

### 8. register_custom_attribute
Register custom attribute for identity (Phase 3).

**Inputs:**
- `commitment` (field): Commitment registering attribute
- `attribute_name` (field): Custom attribute name

**Output:** bool

### 9. vote_on_dispute
Vote on dispute resolution (governance voting).

**Inputs:**
- `dispute_key` (field): Dispute being voted on
- `voter_address` (address): Address of voter
- `approve` (bool): true to approve, false to reject

**Output:** bool

## Full Feature Set

- **Phase 1**: Identity commitment registration and verification
- **Phase 2**: Peer attestation, shadow scoring, dispute challenges
- **Phase 3**: Custom attributes, governance voting
