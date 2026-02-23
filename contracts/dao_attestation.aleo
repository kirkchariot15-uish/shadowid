program dao_attestation.aleo;

// DAO structure
struct DAOInfo:
    dao_id as field;
    name as field;
    leader as address;
    created_at as u32;
    is_active as boolean;

// Attestation request structure
struct AttestationRequest:
    request_id as field;
    user as address;
    dao_id as field;
    created_at as u32;
    status as u8;

// Approved attestation with signature
struct ApprovedAttestation:
    attestation_id as field;
    user as address;
    dao_id as field;
    signature as field;
    approved_at as u32;
    expires_at as u64;
    is_revoked as boolean;

// Mapping for DAO registrations
mapping daos:
    key as field.public;
    value as DAOInfo.public;

// Mapping for DAO leaders (address -> dao_id)
mapping dao_leaders:
    key as address.public;
    value as field.public;

// Mapping for pending attestation requests
mapping attestation_requests:
    key as field.public;
    value as AttestationRequest.public;

// Mapping for approved attestations
mapping approved_attestations:
    key as field.public;
    value as ApprovedAttestation.public;

// Mapping for revoked attestations
mapping revoked_attestations:
    key as field.public;
    value as boolean.public;

// Register a new DAO
function register_dao:
    input r0 as field.public;
    input r1 as address.public;
    async register_dao r0 r1 into r2;
    output r2 as dao_attestation.aleo/register_dao.future;

finalize register_dao:
    input r0 as field.public;
    input r1 as address.public;
    cast r0 r0 r1 block.height true into r2 as DAOInfo;
    set r2 into daos[r0];
    set r0 into dao_leaders[r1];

// Request attestation from DAO
function request_attestation:
    input r0 as field.public;
    input r1 as field.public;
    async request_attestation r0 r1 into r2;
    output r2 as dao_attestation.aleo/request_attestation.future;

finalize request_attestation:
    input r0 as field.public;
    input r1 as field.public;
    get daos[r1] into r2;
    assert.eq r2.is_active true;
    hash.bhp256 r0 self.caller r1 block.height into r3 as field;
    cast r3 self.caller r1 block.height 0u8 into r4 as AttestationRequest;
    set r4 into attestation_requests[r3];

// Approve attestation request and sign
function approve_attestation:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as u64.public;
    async approve_attestation r0 r1 r2 into r3;
    output r3 as dao_attestation.aleo/approve_attestation.future;

finalize approve_attestation:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as u64.public;
    get attestation_requests[r0] into r3;
    get dao_leaders[self.caller] into r4;
    assert.eq r4 r3.dao_id;
    hash.bhp256 r3.user r3.dao_id r1 into r5 as field;
    cast r5 r3.user r3.dao_id r1 block.height r2 false into r6 as ApprovedAttestation;
    set r6 into approved_attestations[r5];
    set 1u8 into attestation_requests[r0].status;

// Verify attestation exists and is valid
function verify_attestation:
    input r0 as field.public;
    async verify_attestation r0 into r1;
    output r1 as dao_attestation.aleo/verify_attestation.future;

finalize verify_attestation:
    input r0 as field.public;
    get approved_attestations[r0] into r1;
    get.or_use revoked_attestations[r0] false into r2;
    not r2 into r3;
    assert.eq r3 true;
    cast block.height into r4 as u64;
    gt r1.expires_at r4 into r5;
    assert.eq r5 true;

// Revoke attestation
function revoke_attestation:
    input r0 as field.public;
    async revoke_attestation r0 into r1;
    output r1 as dao_attestation.aleo/revoke_attestation.future;

finalize revoke_attestation:
    input r0 as field.public;
    get approved_attestations[r0] into r1;
    assert.eq r1.user self.caller;
    set true into revoked_attestations[r0];

// Reject attestation request (DAO leader action)
function reject_attestation_request:
    input r0 as field.public;
    async reject_attestation_request r0 into r1;
    output r1 as dao_attestation.aleo/reject_attestation_request.future;

finalize reject_attestation_request:
    input r0 as field.public;
    get attestation_requests[r0] into r1;
    get dao_leaders[self.caller] into r2;
    assert.eq r2 r1.dao_id;
    set 2u8 into attestation_requests[r0].status;

// Check if user is DAO leader
function is_dao_leader:
    input r0 as address.public;
    async is_dao_leader r0 into r1;
    output r1 as dao_attestation.aleo/is_dao_leader.future;

finalize is_dao_leader:
    input r0 as address.public;
    get.or_use dao_leaders[r0] 0field into r1;
    not r1 == 0field into r2;
    assert.eq r2 true;

constructor:
    assert.eq edition 0u16;
