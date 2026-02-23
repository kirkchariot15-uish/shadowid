program credential_registry.aleo;

// Store commitment registrations
mapping credential_commitments:
    key as field.public;
    value as CredentialData.public;

struct CredentialData:
    owner as address;
    created_at as u32;
    attribute_count as u8;
    is_active as boolean;

// Register a new commitment on-chain
function register_commitment:
    input r0 as field.public;
    input r1 as u8.public;
    async register_commitment r0 r1 into r2;
    output r2 as credential_registry.aleo/register_commitment.future;

finalize register_commitment:
    input r0 as field.public;
    input r1 as u8.public;
    cast self.caller block.height r1 true into r2 as CredentialData;
    set r2 into credential_commitments[r0];

// Revoke a commitment
function revoke_credential:
    input r0 as field.public;
    async revoke_credential r0 into r1;
    output r1 as credential_registry.aleo/revoke_credential.future;

finalize revoke_credential:
    input r0 as field.public;
    get credential_commitments[r0] into r1;
    assert.eq r1.owner self.caller;
    cast r1.owner r1.created_at r1.attribute_count false into r2 as CredentialData;
    set r2 into credential_commitments[r0];

// Verify commitment exists and is active
function verify_commitment:
    input r0 as field.public;
    async verify_commitment r0 into r1;
    output r1 as credential_registry.aleo/verify_commitment.future;

finalize verify_commitment:
    input r0 as field.public;
    get credential_commitments[r0] into r1;
    assert.eq r1.is_active true;

constructor:
    assert.eq edition 0u16;
