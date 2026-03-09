// ShadowID v3 - Zero-Knowledge Identity with Peer Attestation
// Aleo Program for registering identity commitments and peer endorsements

program shadowid_v3.aleo;

// Record to store commitment registration
record CommitmentRegistry:
    owner as address,
    commitment as field,
    timestamp as u64,
    attribute_count as u8;

// Mapping to track registered commitments
mapping commitments: field => bool;

// Mapping to track endorsements (commitment => endorser_count)
mapping endorsement_count: field => u64;

// Mapping to track if specific endorsement exists (commitment + endorser_hash => bool)
mapping endorsements: field => bool;

// Mapping to store shadow scores (commitment => score)
mapping shadow_scores: field => u64;

/**
 * Register a new identity commitment on-chain
 * @param commitment - The zero-knowledge commitment hash
 * @param attribute_count - Number of attributes being activated
 */
transition register_commitment(commitment: field, attribute_count: u8) -> CommitmentRegistry {
    assert(attribute_count > 0u8 && attribute_count <= 8u8, "Attribute count must be between 1 and 8");
    
    // Check commitment is not already registered
    assert(!commitments.get(commitment).unwrap_or(false), "Commitment already registered");
    
    // Register the commitment
    return CommitmentRegistry {
        owner: self.caller,
        commitment: commitment,
        timestamp: block.height,
        attribute_count: attribute_count,
    } then finalize(commitment, attribute_count);
}

finalize register_commitment(commitment: field, attribute_count: u8) {
    // Store commitment as registered
    commitments.set(commitment, true);
    
    // Initialize endorsement count to 0
    endorsement_count.set(commitment, 0u64);
    
    // Initialize shadow score to 50 (neutral for new identity)
    shadow_scores.set(commitment, 50u64);
}

/**
 * Verify if a commitment is registered on-chain
 * @param commitment - The commitment hash to verify
 */
transition verify_commitment(commitment: field) -> bool {
    return commitments.get(commitment).unwrap_or(false);
}

/**
 * Record a peer endorsement for an attribute
 * @param commitment - The commitment being endorsed
 * @param endorser - The address endorsing (used for deduplication)
 * @param attribute_id - Which attribute is being endorsed (0-7)
 */
transition endorse_attribute(commitment: field, endorser: address, attribute_id: u8) {
    assert(attribute_id < 8u8, "Invalid attribute ID");
    assert(commitments.get(commitment).unwrap_or(false), "Commitment not registered");
    assert(endorser != self.caller, "Cannot endorse yourself");
    
    // Create unique key for this endorsement to prevent duplicates
    // Hash: commitment + endorser_address + attribute_id
    let endorsement_key: field = (commitment + endorser.to_field() + attribute_id.to_field());
    
    finalize(commitment, endorser, attribute_id, endorsement_key);
}

finalize endorse_attribute(commitment: field, endorser: address, attribute_id: u8, endorsement_key: field) {
    // Check if this endorsement already exists
    let already_endorsed: bool = endorsements.get(endorsement_key).unwrap_or(false);
    assert(!already_endorsed, "Already endorsed this attribute");
    
    // Record the endorsement
    endorsements.set(endorsement_key, true);
    
    // Increment endorsement count
    let current_count: u64 = endorsement_count.get(commitment).unwrap_or(0u64);
    endorsement_count.set(commitment, current_count + 1u64);
    
    // Update shadow score (max 100)
    let current_score: u64 = shadow_scores.get(commitment).unwrap_or(50u64);
    let new_score: u64 = if current_score < 95u64 {
        current_score + 5u64
    } else {
        100u64
    };
    shadow_scores.set(commitment, new_score);
}

/**
 * Get the shadow score (credibility) for a commitment
 * This is a public read - anyone can check someone's score
 * @param commitment - The commitment to check
 */
transition get_shadow_score(commitment: field) -> u64 {
    return shadow_scores.get(commitment).unwrap_or(50u64);
}

/**
 * Get the endorsement count for a commitment
 * This is a public read - transparency on how many people verified claims
 * @param commitment - The commitment to check
 */
transition get_endorsement_count(commitment: field) -> u64 {
    return endorsement_count.get(commitment).unwrap_or(0u64);
}
