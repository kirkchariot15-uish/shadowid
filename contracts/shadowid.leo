// ShadowID Identity Commitment Registry
// Aleo Leo Smart Contract v1.0
//
// This contract registers identity commitments on-chain for immutability
// and enables verification without revealing identity data.

program shadowid.aleo {
    // Identity commitment record stored on-chain
    record IdentityCommitment {
        owner: address,
        commitment_hash: field,
        timestamp: u64,
        is_revoked: bool,
    }

    // Public mapping of commitments for verification
    mapping commitments: field => address;
    mapping revocations: field => bool;
    mapping commitment_timestamps: field => u64;

    // Register a new identity commitment on-chain
    // Returns an IdentityCommitment record owned by the caller
    transition register_commitment(
        public commitment_hash: field,
        public timestamp: u64
    ) -> IdentityCommitment {
        // Create the commitment record
        let commitment_record: IdentityCommitment = IdentityCommitment {
            owner: self.caller,
            commitment_hash: commitment_hash,
            timestamp: timestamp,
            is_revoked: false,
        };

        return commitment_record then finalize(commitment_hash, self.caller, timestamp);
    }

    finalize register_commitment(
        public commitment_hash: field,
        public owner: address,
        public timestamp: u64
    ) {
        // Store commitment in public mappings
        Mapping::set(commitments, commitment_hash, owner);
        Mapping::set(commitment_timestamps, commitment_hash, timestamp);
        Mapping::set(revocations, commitment_hash, false);
    }

    // Revoke an existing identity commitment
    // Only the owner can revoke their commitment
    transition revoke_commitment(
        commitment: IdentityCommitment,
    ) -> IdentityCommitment {
        // Create revoked commitment record
        let revoked_commitment: IdentityCommitment = IdentityCommitment {
            owner: commitment.owner,
            commitment_hash: commitment.commitment_hash,
            timestamp: commitment.timestamp,
            is_revoked: true,
        };

        return revoked_commitment then finalize(commitment.commitment_hash);
    }

    finalize revoke_commitment(
        public commitment_hash: field
    ) {
        // Mark commitment as revoked
        Mapping::set(revocations, commitment_hash, true);
    }

    // Verify if a commitment exists and is not revoked
    transition verify_commitment(
        public commitment_hash: field
    ) -> bool {
        return true then finalize(commitment_hash);
    }

    finalize verify_commitment(
        public commitment_hash: field
    ) -> bool {
        // Check if commitment exists
        let owner: address = Mapping::get(commitments, commitment_hash);
        
        // Check if revoked
        let is_revoked: bool = Mapping::get_or_use(revocations, commitment_hash, false);
        
        // Valid if exists and not revoked
        return !is_revoked;
    }

    // Get commitment owner (public verification)
    transition get_owner(
        public commitment_hash: field
    ) -> address {
        return self.caller then finalize(commitment_hash);
    }

    finalize get_owner(
        public commitment_hash: field
    ) -> address {
        return Mapping::get(commitments, commitment_hash);
    }

    // Get commitment timestamp
    transition get_timestamp(
        public commitment_hash: field
    ) -> u64 {
        return 0u64 then finalize(commitment_hash);
    }

    finalize get_timestamp(
        public commitment_hash: field
    ) -> u64 {
        return Mapping::get(commitment_timestamps, commitment_hash);
    }
}
