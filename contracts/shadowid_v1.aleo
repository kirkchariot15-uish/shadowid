program shadowid_v1.aleo;

record IdentityCommitment:
    owner as address.private;
    commitment_hash as field.private;
    timestamp as u64.private;
    is_revoked as boolean.private;

mapping commitments:
    key as field.public;
    value as address.public;

mapping revocations:
    key as field.public;
    value as boolean.public;

mapping commitment_timestamps:
    key as field.public;
    value as u64.public;

function register_commitment:
    input r0 as field.public;
    input r1 as u64.public;
    cast self.caller r0 r1 false into r2 as IdentityCommitment.record;
    async register_commitment r0 self.caller r1 into r3;
    output r2 as IdentityCommitment.record;
    output r3 as shadowid_v1.aleo/register_commitment.future;

finalize register_commitment:
    input r0 as field.public;
    input r1 as address.public;
    input r2 as u64.public;
    contains commitments[r0] into r3;
    not r3 into r4;
    assert.eq r4 true;
    set r1 into commitments[r0];
    set r2 into commitment_timestamps[r0];
    set false into revocations[r0];

function revoke_commitment:
    input r0 as IdentityCommitment.record;
    not r0.is_revoked into r1;
    assert.eq r1 true;
    cast r0.owner r0.commitment_hash r0.timestamp true into r2 as IdentityCommitment.record;
    async revoke_commitment r0.commitment_hash into r3;
    output r2 as IdentityCommitment.record;
    output r3 as shadowid_v1.aleo/revoke_commitment.future;

finalize revoke_commitment:
    input r0 as field.public;
    set true into revocations[r0];

function check_revocation:
    input r0 as field.public;
    async check_revocation r0 into r1;
    output r1 as shadowid_v1.aleo/check_revocation.future;

finalize check_revocation:
    input r0 as field.public;
    get.or_use revocations[r0] false into r1;
    not r1 into r2;
    assert.eq r2 true;
    contains commitments[r0] into r3;
    assert.eq r3 true;

constructor:
    assert.eq edition 0u16;
