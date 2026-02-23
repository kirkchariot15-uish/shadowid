program qr_verifier.aleo;

// Store verification proofs
mapping verification_proofs:
    key as field.public;
    value as VerificationRecord.public;

struct VerificationRecord:
    verifier as address;
    verified_at as u32;
    commitment_hash as field;
    is_valid as boolean;

// Verify a QR code credential
function verify_qr_credential:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as field.public;
    async verify_qr_credential r0 r1 into r3;
    output true as boolean.private;
    output r3 as qr_verifier.aleo/verify_qr_credential.future;

finalize verify_qr_credential:
    input r0 as field.public;
    input r1 as field.public;
    cast self.caller block.height r0 true into r2 as VerificationRecord;
    set r2 into verification_proofs[r1];

// Store verification history
mapping verification_history:
    key as field.public;
    value as u32.public;

// Track verification count per credential
function increment_verification_count:
    input r0 as field.public;
    async increment_verification_count r0 into r1;
    output r1 as qr_verifier.aleo/increment_verification_count.future;

finalize increment_verification_count:
    input r0 as field.public;
    get.or_use verification_history[r0] 0u32 into r1;
    add r1 1u32 into r2;
    set r2 into verification_history[r0];

constructor:
    assert.eq edition 0u16;
