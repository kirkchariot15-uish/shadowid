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
    async transition register_commitment(
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

    async function register_commitment_finalize(
        public commitment_hash: field,
        public owner: address,
        public timestamp: u64
    ) {
        // Store commitment in public mappings
        commitments.set(commitment_hash, owner);
        commitment_timestamps.set(commitment_hash, timestamp);
        revocations.set(commitment_hash, false);
    }

    // Revoke an existing identity commitment
    // Only the owner can revoke their commitment
    async transition revoke_commitment(
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

    async function revoke_commitment_finalize(
        public commitment_hash: field
    ) {
        // Mark commitment as revoked
        revocations.set(commitment_hash, true);
    }

    // Check if commitment is revoked
    async transition is_revoked(
        public commitment_hash: field
    ) {
        return then finalize(commitment_hash);
    }

    async function is_revoked_finalize(
        public commitment_hash: field
    ) {
        // Check revocation status - will assert if revoked
        let revoked: bool = revocations.get_or_use(commitment_hash, false);
        assert(!revoked);
    }
}
