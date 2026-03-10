program shadowid_v5.aleo;

// Identity commitment storage with registration timestamp
mapping commitments: field => u64;

// Attribute hash verification (commitment -> attribute_hash)
mapping attribute_hashes: field => field;

// Endorsement deduplication (dedup_key -> bool)
mapping endorsements: field => bool;

// Shadow score tracking (commitment -> score 0-100)
mapping shadow_scores: field => u64;

// Endorsement count per commitment
mapping endorsement_counts: field => u64;

// Endorsement timestamp tracking for decay calculations
mapping endorsement_timestamps: field => u64;

// Custom attribute registration (key -> attribute_name)
mapping custom_attributes: field => field;

// Dispute tracking (dispute_key -> bool)
mapping disputes: field => bool;

// Governance votes (dispute_key -> vote_count)
mapping governance_votes: field => u64;

/**
 * Register a new identity commitment on the blockchain
 * @param commitment - The cryptographic commitment hash of the identity
 * @param attribute_hash - Hash of the activated attributes
 * @return true if registration successful
 */
transition register_commitment(
    commitment: field,
    attribute_hash: field
) -> bool {
    let block_height: u64 = block.height;
    
    async {
        commitments.set(commitment, block_height);
        attribute_hashes.set(commitment, attribute_hash);
        shadow_scores.set(commitment, 50u64);
        endorsement_counts.set(commitment, 0u64);
    } then finalize(commitment, attribute_hash, block_height);
}

finalize register_commitment(commitment: field, attribute_hash: field, block_height: u64) {
    commitments.set(commitment, block_height);
    attribute_hashes.set(commitment, attribute_hash);
    shadow_scores.set(commitment, 50u64);
    endorsement_counts.set(commitment, 0u64);
}

/**
 * Verify if a commitment exists and is registered
 * @param commitment - The commitment hash to verify
 * @return true if commitment is registered
 */
transition verify_commitment(commitment: field) -> bool {
    let exists: u64 = commitments.get_or_use(commitment, 0u64);
    let is_registered: bool = exists > 0u64;
    return is_registered;
}

finalize verify_commitment(commitment: field) {
    let registered: u64 = commitments.get_or_use(commitment, 0u64);
    assert(registered > 0u64);
}

/**
 * Verify attribute hash matches the registered commitment
 * @param commitment - The commitment to verify against
 * @param expected_hash - The attribute hash to verify
 * @return true if hashes match
 */
transition verify_attribute_hash(
    commitment: field,
    expected_hash: field
) -> bool {
    let stored_hash: field = attribute_hashes.get_or_use(commitment, 0field);
    let hash_matches: bool = stored_hash == expected_hash;
    return hash_matches;
}

finalize verify_attribute_hash(commitment: field, expected_hash: field) {
    let stored_hash: field = attribute_hashes.get_or_use(commitment, 0field);
    assert(stored_hash == expected_hash);
}

/**
 * Endorse an attribute from a peer (peer attestation)
 * Prevents double-endorsement and automatically updates shadow score
 * @param target_commitment - The commitment being endorsed
 * @param attribute_id - The attribute ID being endorsed
 * @param endorser_address - The address of the endorser
 * @return true if endorsement successful
 */
transition endorse_attribute(
    target_commitment: field,
    attribute_id: u32,
    endorser_address: address
) -> bool {
    let dedup_key: field = Poseidon8::hash_to_field(
        endorser_address,
        target_commitment,
        attribute_id
    );
    
    let current_time: u64 = block.height;
    
    async {
        endorsements.set(dedup_key, true);
        endorsement_timestamps.set(dedup_key, current_time);
        
        let current_count: u64 = endorsement_counts.get_or_use(target_commitment, 0u64);
        endorsement_counts.set(target_commitment, current_count + 1u64);
        
        let current_score: u64 = shadow_scores.get_or_use(target_commitment, 50u64);
        let new_score: u64 = current_score + 5u64;
        let final_score: u64 = new_score > 100u64 ? 100u64 : new_score;
        shadow_scores.set(target_commitment, final_score);
    } then finalize(target_commitment, dedup_key, current_time);
}

finalize endorse_attribute(
    target_commitment: field,
    dedup_key: field,
    current_time: u64
) {
    let registered: u64 = commitments.get_or_use(target_commitment, 0u64);
    assert(registered > 0u64);
    
    let already_endorsed: bool = endorsements.contains(dedup_key);
    assert(!already_endorsed);
    
    endorsements.set(dedup_key, true);
    endorsement_timestamps.set(dedup_key, current_time);
    
    let current_count: u64 = endorsement_counts.get_or_use(target_commitment, 0u64);
    endorsement_counts.set(target_commitment, current_count + 1u64);
    
    let current_score: u64 = shadow_scores.get_or_use(target_commitment, 50u64);
    let new_score: u64 = current_score + 5u64;
    let final_score: u64 = new_score > 100u64 ? 100u64 : new_score;
    shadow_scores.set(target_commitment, final_score);
}

/**
 * Get the shadow score (credibility score 0-100) for a commitment
 * Starts at 50, increases by 5 per endorsement (max 100)
 * @param commitment - The commitment to query
 * @return shadow score value
 */
transition get_shadow_score(commitment: field) -> u64 {
    let score: u64 = shadow_scores.get_or_use(commitment, 50u64);
    return score;
}

finalize get_shadow_score(commitment: field) {
    let score: u64 = shadow_scores.get_or_use(commitment, 50u64);
}

/**
 * Get total endorsement count for a commitment
 * @param commitment - The commitment to query
 * @return total endorsement count
 */
transition get_endorsement_count(commitment: field) -> u64 {
    let count: u64 = endorsement_counts.get_or_use(commitment, 0u64);
    return count;
}

finalize get_endorsement_count(commitment: field) {
    let count: u64 = endorsement_counts.get_or_use(commitment, 0u64);
}

/**
 * Challenge an endorsement (dispute a false claim)
 * @param target_commitment - The commitment being challenged
 * @param endorser_address - The endorser being challenged
 * @param attribute_id - The attribute being challenged
 * @param challenger_address - The address challenging the endorsement
 * @return true if challenge recorded
 */
transition challenge_endorsement(
    target_commitment: field,
    endorser_address: address,
    attribute_id: u32,
    challenger_address: address
) -> bool {
    let dedup_key: field = Poseidon8::hash_to_field(
        endorser_address,
        target_commitment,
        attribute_id
    );
    
    let dispute_key: field = Poseidon8::hash_to_field(
        dedup_key,
        challenger_address
    );
    
    async {
        disputes.set(dispute_key, true);
    } then finalize(dispute_key);
}

finalize challenge_endorsement(dispute_key: field) {
    disputes.set(dispute_key, true);
}

/**
 * Register a custom attribute for an identity
 * @param commitment - The commitment registering the attribute
 * @param attribute_name - The custom attribute name
 * @return true if registration successful
 */
transition register_custom_attribute(
    commitment: field,
    attribute_name: field
) -> bool {
    let attribute_key: field = Poseidon8::hash_to_field(
        commitment,
        attribute_name
    );
    
    async {
        custom_attributes.set(attribute_key, attribute_name);
    } then finalize(attribute_key);
}

finalize register_custom_attribute(attribute_key: field) {
    custom_attributes.set(attribute_key, 0field);
}

/**
 * Vote on a dispute (governance)
 * @param dispute_key - The dispute being voted on
 * @param voter_address - The address voting
 * @param approve - true to approve, false to reject
 * @return true if vote recorded
 */
transition vote_on_dispute(
    dispute_key: field,
    voter_address: address,
    approve: bool
) -> bool {
    let vote_key: field = Poseidon8::hash_to_field(
        dispute_key,
        voter_address
    );
    
    async {
        let current_votes: u64 = governance_votes.get_or_use(dispute_key, 0u64);
        let new_votes: u64 = current_votes + 1u64;
        governance_votes.set(dispute_key, new_votes);
    } then finalize(dispute_key, vote_key);
}

finalize vote_on_dispute(dispute_key: field, vote_key: field) {
    let current_votes: u64 = governance_votes.get_or_use(dispute_key, 0u64);
    governance_votes.set(dispute_key, current_votes + 1u64);
}
