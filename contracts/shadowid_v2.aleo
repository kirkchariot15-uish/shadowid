program shadowid_v2.aleo;

record Credential:
    owner as address.private;
    issuer as address.private;
    attribute_hash as field.private;
    salt as scalar.private;
    expiration as u64.private;
    nonce as field.private;

record Attestation:
    owner as address.private;
    issuer as address.private;
    attribute_type as field.private;
    commitment as field.private;
    issued_at as u32.private;
    expiration as u64.private;

mapping attestations:
    key as field.public;
    value as address.public;

mapping revocations:
    key as field.public;
    value as boolean.public;

mapping nullifiers:
    key as field.public;
    value as boolean.public;

mapping trusted_issuers:
    key as address.public;
    value as boolean.public;

function register_issuer:
    input r0 as address.public;
    async register_issuer r0 into r1;
    output r1 as shadowid_v2.aleo/register_issuer.future;

finalize register_issuer:
    input r0 as address.public;
    set true into trusted_issuers[r0];

function issue_attestation:
    input r0 as address.public;
    input r1 as field.public;
    input r2 as field.public;
    input r3 as u64.public;
    input r4 as u32.public;
    cast r0 self.caller r1 r2 r4 r3 into r5 as Attestation.record;
    async issue_attestation r2 self.caller r4 into r6;
    output r5 as Attestation.record;
    output r6 as shadowid_v2.aleo/issue_attestation.future;

finalize issue_attestation:
    input r0 as field.public;
    input r1 as address.public;
    input r2 as u32.public;
    assert.eq r2 block.height;
    get.or_use trusted_issuers[r1] false into r3;
    assert.eq r3 true;
    set r1 into attestations[r0];
    set false into revocations[r0];

function revoke_attestation:
    input r0 as Attestation.record;
    assert.eq r0.issuer self.caller;
    async revoke_attestation r0.commitment into r1;
    output r1 as shadowid_v2.aleo/revoke_attestation.future;

finalize revoke_attestation:
    input r0 as field.public;
    set true into revocations[r0];

function prove_range:
    input r0 as Credential.record;
    input r1 as u64.public;
    input r2 as u64.public;
    input r3 as field.public;
    hash.bhp256 r0.nonce into r4 as field;
    commit.bhp256 r0.attribute_hash r0.salt into r5 as field;
    async prove_range r4 r5 into r6;
    output r4 as field.private;
    output r6 as shadowid_v2.aleo/prove_range.future;

finalize prove_range:
    input r0 as field.public;
    input r1 as field.public;
    get.or_use nullifiers[r0] false into r2;
    not r2 into r3;
    assert.eq r3 true;
    set true into nullifiers[r0];

function prove_membership:
    input r0 as Credential.record;
    input r1 as field.public;
    input r2 as field.public;
    hash.bhp256 r0.nonce into r3 as field;
    commit.bhp256 r0.attribute_hash r0.salt into r4 as field;
    async prove_membership r3 r4 r1 into r5;
    output r3 as field.private;
    output r5 as shadowid_v2.aleo/prove_membership.future;

finalize prove_membership:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as field.public;
    get.or_use nullifiers[r0] false into r3;
    not r3 into r4;
    assert.eq r4 true;
    set true into nullifiers[r0];

function prove_existence:
    input r0 as Attestation.record;
    input r1 as field.public;
    hash.bhp256 r0.commitment into r2 as field;
    async prove_existence r0.commitment r0.expiration into r3;
    output r2 as field.private;
    output r3 as shadowid_v2.aleo/prove_existence.future;

finalize prove_existence:
    input r0 as field.public;
    input r1 as u64.public;
    cast block.height into r2 as u64;
    gt r1 r2 into r3;
    assert.eq r3 true;
    get attestations[r0] into r4;
    get.or_use revocations[r0] false into r5;
    not r5 into r6;
    assert.eq r6 true;

function verify_proof:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as field.public;
    async verify_proof r0 into r3;
    output true as boolean.private;
    output r3 as shadowid_v2.aleo/verify_proof.future;

finalize verify_proof:
    input r0 as field.public;
    get.or_use nullifiers[r0] false into r1;
    not r1 into r2;
    assert.eq r2 true;

function check_nullifier:
    input r0 as field.public;
    async check_nullifier r0 into r1;
    output r1 as shadowid_v2.aleo/check_nullifier.future;

finalize check_nullifier:
    input r0 as field.public;
    get.or_use nullifiers[r0] false into r1;
    assert.eq r1 true;

constructor:
    assert.eq edition 0u16;
