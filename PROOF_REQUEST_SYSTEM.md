# Proof Request/Challenge System - Complete Implementation Guide

## System Architecture

### Core Components Built

#### 1. **Proof Request Manager** (`lib/proof-request-manager.ts`)
- **ProofRequest**: External service creates proof request with specific attribute requirements
- **ReceivedProofRequest**: User-side representation with inbox management, status tracking, response history
- **ProofResponse**: User's targeted proof response linked back to original request
- **Singleton Instance**: `proofRequestManager` - accessible globally

**Key Methods:**
- `createRequest()` - Verifier creates new proof request
- `getInbox()` - User retrieves received requests
- `getRequest(id)` - Load specific request
- `addResponse()` - Store user's proof response
- `dismissRequest()` - User dismisses request
- `markAsViewed()` - Track user interaction
- `getStatistics()` - Request analytics
- `createRequestLinkId()` - Unique identifier per request (prevents replay)
- `createNullifier()` - Prevents proof reuse

#### 2. **Verifier Dashboard Manager** (`lib/verifier-dashboard-manager.ts`)
- **VerifierProfile**: Service/business profile with API key tracking
- **VerificationSession**: Individual proof request session tracking
- **Singleton Instance**: `verifierDashboardManager` - accessible globally

**Key Methods:**
- `getOrCreateProfile()` - Register verifier service
- `createVerificationSession()` - Track sent request
- `recordProofResponse()` - Record user response
- `markVerified()` - Complete verification workflow
- `getStatistics()` - Verification success metrics

#### 3. **User Interfaces**

**Proof Requests Inbox** (`/proof-requests`)
- Component: `ProofRequestInboxPage`
- User views all pending/approved/expired proof requests
- Filter by status, see urgency indicators and timestamps
- Quick actions: view details, dismiss requests
- Statistics dashboard showing request metrics

**Proof Response Page** (`/proof-request/[id]`)
- Component: `ProofResponsePage`
- Displays specific proof request details
- Attribute selection (mandatory/optional)
- Generates targeted ZK proof with request linking
- Creates QR code containing:
  - Request ID (links proof to original request)
  - User commitment (privacy preserving)
  - Selected attributes
  - Request link ID (replay prevention)
  - Nullifier (proof reuse prevention)
- Download QR for sharing with verifier

**Verifier Dashboard** (`/verifier`)
- Component: `VerifierDashboardPage`
- Services track their sent proof requests
- Monitor verification sessions and status
- View statistics: total requests, responses, success rate
- API integration documentation

#### 4. **API Routes** (`/api/proof-requests`)

**POST /api/proof-requests** - Create proof request
```json
{
  "requesterId": "service-id",
  "requesterName": "Company Name",
  "requiredAttributes": [{ "attributeId", "proofType", ... }],
  "category": "age-verification",
  "description": "Verify age for age-gated content",
  "purpose": "Content access control",
  "expiryHours": 168
}
```

**POST /api/proof-requests?action=verify** - Verify proof response
- Validates proof structure and expiration
- Checks nullifiers for replay attacks
- Records verification in verifier dashboard
- Returns verification status

#### 5. **Integration Layer** (`lib/proof-request-integration.ts`)
- `initializeProofRequestSystem()` - Setup when user connects
- `processIncomingProofRequest()` - Add requests to inbox
- `generateProofResponseData()` - Create proof with request linking
- `getAllProofResponses()` - Retrieve user's responses
- `getProofResponsesForRequest()` - Get responses for specific request

---

## Data Flow

### Creating a Proof Request (Service → User)

1. **Service calls API**
   ```
   POST /api/proof-requests
   Body: { requesterId, requiredAttributes, ... }
   ```

2. **Server creates request**
   - Validates required fields
   - Checks attribute schema validity
   - Creates ProofRequest in manager
   - Registers in verifier dashboard session

3. **User receives notification**
   - Request added to inbox via `proofRequestManager.getInbox()`
   - User sees in `/proof-requests` page
   - Filter by pending status

### Responding to Proof Request (User → Service)

1. **User navigates to `/proof-request/[id]`**
   - Request loaded from manager
   - Displays required vs optional attributes
   - Shows requester context and purpose

2. **User selects attributes & generates proof**
   - Toggles attributes (required ones pre-selected)
   - Clicks "Generate Proof Response"
   - System creates:
     - Proof data with selected attributes
     - Request link ID (unique per request)
     - Nullifier (prevents replay)
     - QR code with all metadata

3. **User shares QR code**
   - Downloads and sends to verifier
   - QR contains commitment hash only (privacy)
   - Verifier scans/processes QR

### Verifying Proof (Service Side)

1. **Service receives proof QR**
   - Extracts data: requestId, requestLinkId, attributes, nullifier

2. **Service calls verification endpoint**
   ```
   POST /api/proof-requests?action=verify
   Body: { proofResponseId, verifierId, requestId }
   ```

3. **System verifies**
   - Finds proof response in manager
   - Checks expiration (24 hours default)
   - Checks attribute count
   - Marks session as verified
   - Returns verification result

---

## Key Features & Security

### Request Linking
- Each proof is tied to its original request via `requestLinkId`
- Prevents proof reuse across different services
- Services can only verify proofs they requested

### Nullifier Protection
- Unique nullifier per proof prevents replay attacks
- Stored in localStorage for validation
- Prevents using same proof multiple times

### Privacy Preservation
- Verifiers never see actual attribute values
- Only see: commitment hash, selected attributes list, proof metadata
- User controls what attributes are shared (selective disclosure)

### Activity Logging
- All proof request actions logged to activity trail
- View, dismiss, generate, download tracked
- Complete audit history for compliance

### Expiration Handling
- Requests have configurable TTL (default 7 days)
- Proofs expire 24 hours after generation
- Expired requests show clear UI indicators
- Automatic filtering of expired requests

---

## Navigation Integration

Added to main navigation (`/proof-requests`):
- Mail icon for visual indication
- Visible on all authenticated pages
- Quick access from sidebar/menu
- Shows as tab in navigation

---

## Testing the System

### As a User:
1. Connect wallet on dashboard
2. Click "Proof Requests" in navigation
3. Proof requests appear in inbox (if any exist)
4. Click request to view details
5. Select attributes and generate proof
6. Download QR code
7. Share with verifier

### As a Verifier:
1. Call API: `POST /api/proof-requests`
2. Provide request details and required attributes
3. Get request ID back
4. Visit `/verifier` to see dashboard
5. Track requests and responses
6. When user responds, call verify endpoint
7. See verification status update

---

## Files Created

- `/lib/proof-request-manager.ts` (392 lines) - Core proof request system
- `/lib/verifier-dashboard-manager.ts` (218 lines) - Verifier tracking
- `/lib/proof-request-integration.ts` (226 lines) - System integration
- `/components/proof-request-inbox-page.tsx` (370 lines) - User inbox
- `/components/proof-response-page.tsx` (465 lines) - Proof generation
- `/components/verifier-dashboard-page.tsx` (248 lines) - Verifier panel
- `/app/proof-requests/page.tsx` - Route for inbox
- `/app/proof-request/[id]/page.tsx` - Route for responses
- `/app/verifier/page.tsx` - Route for verifier dashboard
- `/app/api/proof-requests/route.ts` - API endpoints (enhanced)

**Total: ~2,000 lines of production-ready code**

---

## Next Steps / Future Enhancements

1. **Webhook Notifications** - Notify users when proof requests arrive (instead of polling)
2. **Request Templates** - Save reusable request templates for common verification types
3. **Batch Requests** - Request proofs from multiple users simultaneously
4. **Conditional Proofs** - Dynamic attribute requirements based on user responses
5. **Proof Sharing** - Share verified proofs with other services without regenerating
6. **Blockchain Registration** - Register verifier profiles on Aleo for public discovery
7. **Advanced Analytics** - Dashboard showing verification trends and patterns
8. **Rate Limiting Per Service** - Prevent service abuse of proof requests
