# End-to-End Verification Flow Test

## System Overview
The complete cryptographically-secure verification system includes:
1. Identity Creation - User creates ID with 1-4 attributes, signed and sent to blockchain
2. QR Generation - QR contains commitment + signature + attribute hash (not raw data)
3. QR Scanning - Verifier scans QR and extracts cryptographic proofs
4. Signature Validation - System validates signature matches commitment + attributes
5. Blockchain Confirmation - Verifies commitment exists on-chain
6. Profile Display - Shows verified attributes and cryptographic proofs

## Test Checklist

### Phase 1: Identity Creation
- Navigate to "Create ShadowID"
- Select 1-4 attributes from predefined list (NOT arbitrary text)
- Fill in attribute values
- Click "Create ShadowID"
- VERIFY: Full-page loading overlay appears
- VERIFY: Blockchain transaction is initiated
- VERIFY: Transaction completes successfully
- VERIFY: Console shows "Blockchain confirmed" message
- VERIFY: localStorage contains shadowid-attribute-hash, shadowid-signature, shadowid-tx-id

### Phase 2: QR Generation
- Navigate to "Your QR Codes" after identity creation
- QR code is displayed
- VERIFY: QR contains JSON with commitment, attributeHash, signature, transactionId
- VERIFY: Does NOT contain raw attribute values
- Download QR code image

### Phase 3: QR Scanning & Verification
- Navigate to "Verify QR Code" page
- Upload the downloaded QR image
- VERIFY: QR is decoded correctly
- Click "Verify Credential"
- VERIFY: Signature validation passes
- VERIFY: Blockchain verification passes
- VERIFY: Redirects to profile page

### Phase 4: Profile Display
- Profile page loads after verification
- VERIFY: Shows "Cryptographically Verified" status
- VERIFY: Shows checkmarks for all validations
- VERIFY: Shows all claimed attributes
- If owner: VERIFY: Shows cryptographic proofs section

### Phase 5: Security Tests
- Tamper test: Change commitment in QR, verify fails
- Wrong signature test: Try invalid signature, verify fails
- Non-existent commitment test: Random 16-char hex, verify fails

Success if all phases pass without errors.
