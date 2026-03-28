# SHADOWID - COMPREHENSIVE PRESENTATION SCRIPT
## For Screen Recording & Live Demo

---

## LANDING PAGE (Brief Overview)
*You'll be showing this visually, so keep it brief*

The landing page introduces ShadowID's core value proposition: "Your Identity. Your Control. Peer Verified." It features an interactive ID card preview and three pillar information cards highlighting cryptographic privacy, selective attribute disclosure, and blockchain attestation. Users can connect their wallet here to access the full dashboard. The page visually communicates that this is a decentralized identity solution built on peer trust and cryptography.

---

## DASHBOARD - THE HOME HUB
### What It Is & Why It Matters
The dashboard is the central command center for every user's ShadowID experience. It's where you see your entire identity profile at a glance and navigate to all key functions.

### Key Sections You'll See:

**Left Sidebar Statistics:**
- **My Credentials**: Total number of attributes you've claimed in your ShadowID
- **Endorsements Received**: How many peers have verified your claimed attributes
- **Shadow Score**: Your reputation metric (calculated from diverse endorsement sources)

**Right Sidebar Quick Actions:**
- **Create ShadowID**: Start building your zero-knowledge identity (if you haven't already)
- **View My ShadowID**: See your current identity status and commitment hash
- **Endorse Peers**: Navigate to peer verification system
- **Admin Panel**: Access the administrative tools (only visible if you have admin privileges)

**Welcome Message:**
Displays your connected wallet address, personalizing the experience and confirming your session is active.

### How This Fits the Flow:
The dashboard is your launchpad. After connecting your wallet, you land here. From here, you can create your identity, manage endorsements, verify others, or—if authorized—access admin controls.

---

## CREATE SHADOWID - BUILDING YOUR ZERO-KNOWLEDGE IDENTITY
### Purpose & Philosophy
This is where users create their cryptographic commitment to claimed attributes. It's NOT a traditional profile—it's a zero-knowledge proof commitment that protects privacy while enabling verification.

### The 4-Step Process:

**Step 1: Attribute Selection**
Users choose which attributes to claim. Available options include:
- Age Range (18-25, 26-35, 36-50, 50+)
- Jurisdiction (US, EU, APAC, etc.)
- Professional Title (Software Engineer, Product Manager, Designer, etc.)
- Educational Background (Bachelor's, Master's, PhD, Bootcamp)
- DAO Member Status
- Accredited Investor Status
- And more custom attributes

You can select multiple attributes—think of this as building a mosaic of your professional and personal credentials without revealing unnecessary details.

**Step 2: Cryptographic Commitment Generation**
Once you select attributes, the system generates a cryptographic commitment hash. This hash is the core of your ShadowID—it's a mathematical proof that you claimed these attributes without revealing what they actually are (at this stage).

**Step 3: Local Encryption & Storage**
Your claimed attribute values are encrypted and stored locally in your browser. The system shows you the commitment hash in format: `XXXX-YYYYYYYYYY...` This hash is your public identity marker—it's what others will use to find and endorse you.

**Step 4: Confirmation & QR Code**
You get a confirmation screen showing your commitment hash with a QR code. This is your backup. You can scan this QR code anytime to recover your identity if needed.

### Subscription Tiers (Explained):
- **Free Tier**: 3 attributes, 5 proofs per month
- **Premium Tier** ($9.99/mo): 10 attributes, 50 proofs per month
- **Professional Tier** ($29.99/mo): Unlimited attributes and proofs, custom attributes, API access

### Why This Matters:
This step creates your on-chain identity marker. You haven't revealed anything publicly yet—just committed to attributes in a privacy-preserving way. This is the foundation for everything that follows.

---

## MY SHADOWID - IDENTITY MANAGEMENT & MONITORING
### What You'll See Here
This is your identity dashboard. It shows everything about your current ShadowID status, your endorsements, and your reputation score.

### Main Display:

**Commitment Hash & QR Code**
Your public identity identifier displayed prominently. Anyone who wants to endorse you or verify you will use this commitment hash.

**Status Badges**
Show whether your identity is activated, pending, or flagged by administrators.

**Activated Attributes Table**
A table showing:
- Your claimed attributes
- The values you claimed for each (encrypted, only you can see them)
- **Endorsement Count**: How many different people have verified each attribute (color-coded: Red = 0, Yellow = 1-2, Green = 3+)
- Trust indicator showing if the attribute is well-endorsed or needs more verification

**Shadow Score Section**
This is your reputation metric. It shows:
- Your overall score (0-100)
- Breakdown: How it's calculated from diverse endorser trust scores
- The more endorsements from diverse, trusted sources, the higher your score
- This score can't be gamed because it requires actual peer verification

### Recovery Section
If you lose your credentials:
- You can recover your commitment hash
- You can restore from QR code backup

### Admin Access Section
A text field where admins enter 'Aleo2Admin' + their commitment hash to access the admin panel. This is a secondary authentication for admin functions.

### Why This Matters:
This is where you monitor your growing reputation. Every endorsement increases your Shadow Score. This visibility shows users the value of being endorsable and maintaining good standing in the community.

---

## ENDORSE PEERS - THE PEER VERIFICATION SYSTEM
### What This Feature Does
Peer endorsement is the backbone of ShadowID's decentralized trust network. Instead of centralized entities verifying you, the community does. When you endorse a peer's attribute, you're saying: "I verify that this person has this attribute."

### How the Endorsement Flow Works:

**Step 1: Input the Target Commitment Hash**
You enter the commitment hash of the person you want to endorse. This is their public identity marker (they share this with you or you find them through a search).

**Step 2: Select the Attribute to Endorse**
You choose which attribute of theirs you want to verify:
- "I verify they are in the 26-35 age range"
- "I verify they're a Software Engineer"
- "I verify they have a Master's degree"

You can only endorse attributes they claim—not make up new ones.

**Step 3: Validation Checks (Behind the Scenes)**
The system performs several security checks:
- **Self-Endorsement Prevention**: You can't endorse yourself (no Sybil attacks)
- **Account Status Check**: Verify the target account isn't flagged
- **Format Validation**: Confirm the commitment hash is valid
- **Rate Limiting**: Prevent spam by limiting endorsements per user per time period

**Step 4: Confirmation Screen**
You review before submitting. The system shows:
- Who you're endorsing (their commitment hash)
- Which attribute you're verifying
- A confirmation button to proceed

**Step 5: Blockchain Transaction**
When you confirm, an endorsement record is permanently recorded on the Aleo blockchain. This creates:
- An immutable proof of your endorsement
- A permanent record of trust between you and the peer
- One data point in their Shadow Score calculation

### Key Properties of Endorsements:
- **Anonymous but Traceable**: Others know someone endorsed but not necessarily who
- **Permanent**: Once on blockchain, it can't be deleted
- **Cryptographically Verified**: Can be independently verified as legitimate
- **Used to Build Reputation**: Multiple endorsements from diverse sources increase Shadow Score

### Why This Matters:
This is where true decentralized trust is built. Unlike traditional systems where one authority vouches for you, ShadowID lets the community validate each other. It's resistant to Sybil attacks and encourages genuine peer networks.

---

## SELECTIVE DISCLOSURE - GENERATING PROOF QR CODES
### The Core Innovation
Selective disclosure is how you prove claims without revealing everything. You can generate a zero-knowledge proof showing "I have attribute X with value Y" without revealing your other attributes or your identity.

### How It Works in Practice:

**Step 1: Choose Which Attributes to Disclose**
You see a checklist of all your claimed attributes. You select only the ones you want to prove:
- ✓ Age Range (but not your professional title)
- ✓ Educational Background (but not your jurisdiction)
- Unchecked attributes aren't proven at all

**Step 2: Enter Specific Values**
For each selected attribute, you specify the exact value you're proving:
- "I'm proving I'm in the 26-35 age range"
- "I'm proving I have a Master's degree in Computer Science"

**Step 3: Generate Zero-Knowledge Proof**
The system creates a cryptographic proof that:
- Shows these specific attributes are true
- Doesn't reveal your commitment hash permanently
- Doesn't reveal other attributes
- Can't be reused (one-time use through nullifier)
- Has an expiration time (prevents indefinite use if stolen)

**Step 4: QR Code Generation**
The proof is encoded into a QR code that contains:
- The zero-knowledge proof
- Your commitment hash (temporary reference)
- The attributes being proven
- Timestamp of generation
- Expiration time
- A nullifier (prevents replay attacks)

### Common Use Cases:
- **Age Verification**: Prove you're 21+ without revealing exact age
- **Professional Credentials**: Prove you're a Software Engineer without revealing employer
- **Jurisdiction**: Prove you're in the EU for regulatory purposes
- **DAO Membership**: Prove you're a DAO member without revealing which DAO
- **Educational Background**: Prove you have a degree without revealing the specific school

### Security Features:
- **One-Time Use**: The nullifier ensures the same proof can't be reused
- **Time-Limited**: The expiration (typically 24-48 hours) prevents indefinite proof validity
- **Cryptographic Verification**: The proof can be mathematically verified without trusting intermediaries

### Why This Matters:
This is where the "zero-knowledge" in ShadowID comes alive. You prove what matters for a specific context without oversharing. This is privacy-by-design for the modern digital age.

---

## VERIFY PAGE - THIRD-PARTY VERIFICATION INTERFACE
### What This Page Does
The verify page is how third parties (services, DAOs, companies) can verify claims made by users. It's the consumer side of selective disclosure proofs.

### How Third Parties Use This:

**Two Input Methods:**
1. **Scan QR Code**: Use a camera to scan the proof QR code generated by the user
2. **Paste Proof Code**: Manually paste the proof string if scanning fails

### The Verification Process:

**Step 1: Input Reception**
The verifier (third party) receives the QR code from the user proving a claim.

**Step 2: Cryptographic Validation**
The system checks:
- Is the cryptographic proof mathematically valid?
- Has the proof expired? (Checks timestamp + expiration window)
- Has this proof already been used? (Checks nullifier against registry)
- Is the committer flagged? (Checks if the user is banned/suspicious)

**Step 3: Success or Failure**
- **✓ VERIFIED**: Green screen showing the proven attributes and the prover's Shadow Score
- **✗ INVALID**: The proof failed cryptographic verification
- **✗ EXPIRED**: The proof is older than its expiration time
- **✗ ALREADY USED**: Someone tried to reuse a one-time proof
- **✗ USER FLAGGED**: The user claiming the attribute is suspended

### What the Verifier Sees:
- The attributes being proven (e.g., "Age Range: 26-35")
- The prover's Shadow Score (reputation metric)
- A timestamp showing when verification occurred
- A verification certificate they can download

### Why This Matters:
This is where the system creates real utility. Services can make real decisions based on verified claims. The Shadow Score provides context—a claim verified by someone with high Shadow Score is more trustworthy than one with low score.

---

## PROOF REQUESTS - STRUCTURED VERIFICATION WORKFLOW
### What This Feature Adds
Rather than ad-hoc verification, proof requests create a formal workflow where verifiers can initiate verification requests that users respond to.

### Two Flows:

**Flow 1: Verifier Initiates Request**
1. Verifier specifies what attributes they want proven
2. A request is created and sent to the user's inbox
3. User sees the request with context about what's needed
4. User generates a matching proof
5. Verifier receives the proof and validates it

**Flow 2: User Initiates Proof**
1. User creates a selective disclosure proof
2. User sends it to a verifier
3. Verifier processes it through the verify page

### Dashboard Features:
- **Verifier Dashboard**: Shows active sessions, pending requests, completed verifications
- **Request Inbox**: Users see incoming verification requests with context
- **Verification Metrics**: Track total verifications, pending requests, success rate

### Why This Matters:
This creates a structured trust framework. Services can request specific proofs in a standard format. Users have a clear record of what they've proven to whom and when.

---

## ATTESTATION SYSTEM - PERMANENT VERIFICATION RECORDS
### What Attestations Are
After successful verification, users can earn attestation badges—permanent, on-chain records that they've been verified for specific attributes.

### Attestation Components:
- **Attribute Being Attested**: What was verified (e.g., "Professional Title")
- **Verified Value**: The specific claim that was verified (e.g., "Software Engineer")
- **Verifier Identity**: Who verified this (with their reputation score)
- **Date Verified**: When verification occurred
- **Verifier Trust Score**: The reputation of whoever verified this

### How Attestations Build Reputation:
- Each attestation is a data point in your Shadow Score
- Attestations from high-trust verifiers worth more than from low-trust verifiers
- Multiple attestations for same attribute increase credibility
- Attestations are immutable on blockchain

### Why This Matters:
Attestations create a cumulative reputation system. The more verified you are, the more trustworthy you become. This incentivizes users to get verified and maintains the integrity of the network.

---

## ACTIVITY LOGS & AUDIT TRAIL - TRANSPARENCY & COMPLIANCE
### What Gets Logged
Every significant action in the system is recorded:
- **Identity Creation**: When you created your ShadowID
- **Endorsements**: Both given and received
- **Proof Requests**: Incoming and outgoing verification requests
- **Attestations**: Each attestation received
- **Account Modifications**: Changes to privacy settings, subscriptions, etc.
- **Admin Actions**: If you're an admin, all your actions are logged

### Log Features:
- **Timeline View**: See actions in chronological order
- **Action Types**: Filter by what type of activity (identity, endorsements, proofs, etc.)
- **Detailed Descriptions**: Each log entry shows exactly what happened
- **Timestamps**: Precise record of when each action occurred
- **Search Capability**: Find specific actions quickly

### Why This Matters:
**Transparency**: Users see exactly what's happening with their identity
**Fraud Detection**: Suspicious patterns become visible (e.g., sudden spike in endorsements)
**Regulatory Compliance**: Financial services can audit identity verification trails
**Immutability**: All logs stored on blockchain = can't be tampered with

---

## PRIVACY & SETTINGS - USER CONTROL
### Account Section
- View your connected wallet address
- See your ShadowID status (active, pending, inactive)
- Check creation date of your identity

### Privacy Controls:
- **Attribute Visibility**: Control who can see which of your attributes
- **Endorsement Visibility**: Hide or show endorsements you receive
- **Search Indexing**: Prevent your commitment hash from appearing in search results
- **Profile Public/Private**: Make your profile visible to everyone or just authenticated users

### Notification Settings:
- **Email Notifications**: Enable/disable email alerts for endorsements, proof requests, etc.
- **In-App Notifications**: Customize what notifications appear in your dashboard

### Data Management:
- **Download Your Data**: Export all your personal data in standard formats (GDPR compliance)
- **View Full Activity Log**: See complete history of all actions
- **Clear Activity History**: Remove old logs (with confirmation)

### Account Recovery:
- **Backup Commitment Hash**: Store your identity marker securely
- **Recovery Seed**: Generate a seed phrase to recover your account
- This prevents permanent loss if you lose access to your wallet

### Danger Zone:
- **Delete ShadowID**: Permanently remove your identity (with multiple confirmations)
- Cannot be undone—this is irreversible

### Why This Matters:
Privacy controls are fundamental to ShadowID's philosophy. Users have complete control over their data and what they share. GDPR and privacy law compliance is built-in.

---

## ADMIN PANEL - GOVERNANCE & MODERATION
### Access & Authorization
Admin panel is accessed by authenticated admins only. There are multiple admin tiers:

**Global Admins**: 
- Full system access
- Can flag/unflag any account globally
- Can assign mini-admins
- See all admin activity logs

**Universal Admins**:
- System-wide moderation rights
- Can manage flagged accounts across all organizations
- Support role

**Mini-Admins** (Organization-Specific):
- **University Admins**: Manage student identities on your campus
- **Government Admins**: Manage citizens in your jurisdiction
- **DAO Admins**: Manage DAO member identities
- Only moderate within their organization

### Four Main Functions:

**1. Flagged Accounts Management**
View all accounts that have been flagged for violation:
- Shows commitment hash of flagged account
- Severity level: Low, Medium, High
- Reason for flag
- Who flagged it
- Timestamp
- Action buttons: Remove Flag, Increase Severity, Contact User

**2. Flag New Account**
Flag an account for violation:
- Input commitment hash of account to flag
- Select reason (Spam, Fake Identity, Fraud, Hate Speech, etc.)
- Choose severity (Low, Medium, High)
- Add notes about why flagging
- Confirm action
- Creates immutable record on blockchain

**3. Assign Mini-Admin**
Create mini-admin roles for specific organizations:
- Input wallet address of new mini-admin
- Select admin type (University, Government, DAO)
- Specify organization/jurisdiction they manage
- Set permissions (what they can and can't do)
- Generate invite link or email

**4. Manage Admins**
Global admins can:
- See all current admins and their permissions
- Remove admin access
- Promote admins to higher tiers
- View admin activity log
- Edit admin organization assignments

### Audit Log Features:
- Every admin action is recorded
- Shows: Admin wallet, action type, affected account, timestamp, reason
- Cannot be deleted
- All stored on blockchain for immutability
- Used for compliance and accountability

### Anti-Abuse Mechanisms:
- Rate limiting prevents rapid-fire flags
- Multi-admin approval for high-severity actions (depending on implementation)
- All flagging reasons are logged and auditable
- Flagged accounts can't participate in endorsements (can't game reputation)

### Why This Matters:
Moderation is decentralized but not anarchic. Multiple admin tiers allow organizations to manage their own communities while maintaining global standards. The immutable audit trail ensures admins are accountable for their actions.

---

## PRICING & SUBSCRIPTION - MONETIZATION & TIER SYSTEM
### Three Subscription Tiers:

**Free Tier**
- 3 custom attributes
- 5 selective disclosure proofs per month
- Basic verification
- No API access
- Community verification only
- Good for: Trying the platform, low-volume users

**Premium Tier** ($9.99/month)
- 10 custom attributes
- 50 selective disclosure proofs per month
- Priority verification processing
- No API access yet
- Enhanced analytics
- Good for: Active professionals, regular verifications

**Professional Tier** ($29.99/month)
- Unlimited custom attributes
- Unlimited selective disclosure proofs
- API access for developers
- Priority support
- Advanced analytics and reporting
- Custom integration support
- Good for: Enterprises, high-volume verification services

### How Upgrades Work:
- When you exceed your tier limit, you're prompted with upgrade modal
- Can upgrade mid-month (prorated billing)
- Downgrade anytime (takes effect next billing cycle)
- Free tier users never forced to pay, just limited functionality

### Why This Matters:
Freemium model lets users understand the value before paying. Unlimited tier enables enterprise integration and API access. Pricing supports platform sustainability.

---

## PUBLIC IDENTITY PROFILE - PROFILE VIEWING
### What Others See:

**When viewing someone's public profile (by commitment hash):**

**Commitment Hash Display**
- Shows as QR code + text
- Confirms this is the official identity

**Public Attributes Table**
- Lists all claimed attributes
- Shows verification status for each (color-coded)
- Displays endorsement count
- Indicates if attribute is well-verified or needs work

**Shadow Score Display**
- Shows overall reputation score (0-100)
- Includes breakdown chart showing score composition
- Explains how score is calculated

**Recent Endorsements**
- Shows recent endorsements received (if privacy settings allow)
- Shows who endorsed (can be anonymous based on privacy)
- Shows timestamp

**Verification History**
- Recent attestations from verified organizations
- Shows which organizations verified what attributes
- Creates trust indicators

**Trust Indicators**
- Account age: How long has this identity existed?
- Activity status: Is this an active account?
- Verification status: Have claims been verified?
- Flag status: Is the account in good standing?

**Action Buttons**
- **Endorse an Attribute**: Start endorsing one of their claims
- **Request Verification**: Send them a proof request

### Privacy Variations:
- What's public depends on each user's privacy settings
- Some users might show full profile, others minimal
- Commitment hash always visible (it's public)

### Why This Matters:
Public profiles create transparency and enable discovery. People can find and endorse each other. It's how trust networks form in a decentralized system.

---

## MINI-ADMIN PANEL - ORGANIZATION-SPECIFIC GOVERNANCE
### Access
Mini-admins see a specialized dashboard scoped to their organization only. They can't see accounts from other organizations.

### Functions Available:

**1. View Organization Members**
- See all identities created within their organization
- Filter by status, verification level, created date
- Search by commitment hash

**2. Verify Organization Members**
- Pre-verify claims about members (e.g., "This person is a student at our university")
- Creates attestations that members didn't have to request
- Streamlines verification for organizations

**3. Manage Organization Admins**
- Add or remove admins for their organization
- Assign different permission levels

**4. Flag Organization Members**
- Can flag members for organization-specific violations
- Cannot flag globally (limited scope)
- Flagged users limited to organization interactions

**5. Organization Statistics**
- Total members in organization
- Verification completion rate
- Recent activity
- Endorsement trends

### Why This Matters:
Mini-admins let large organizations (universities, governments, DAOs) manage their communities within ShadowID. It's decentralized governance at scale—each organization maintains its own standards while participating in the global trust network.

---

## OVERALL SYSTEM FLOW - HOW IT ALL CONNECTS

```
1. User Connects Wallet
   ↓
2. Goes to Dashboard (home base)
   ↓
3. Creates ShadowID (generates cryptographic commitment)
   ↓
4. Identity is now on-chain (commitment hash created)
   ↓
5. User Can Now:
   A) Get Endorsed (peers endorse their attributes) → Builds Shadow Score
   B) Endorse Peers (verify others' attributes)
   C) Create Selective Disclosure Proofs (prove claims without revealing everything)
   ↓
6. Third Parties Can:
   A) Verify proofs via Verify page
   B) Send proof requests
   ↓
7. After Verification:
   - User gets Attestations (permanent records)
   - Both parties see activity in logs
   ↓
8. Long-term:
   - Shadow Score grows through diverse endorsements
   - Identity becomes valuable reputation asset
   - Can be used across Web3 and Web2 services
```

---

## KEY TALKING POINTS FOR SCREEN RECORDING

**1. Zero-Knowledge at Its Core**
"The commitment hash is the cryptographic anchor of your identity. It proves you claimed attributes without ever revealing what they are until you choose to with selective disclosure."

**2. Decentralized Trust**
"Unlike traditional systems where a company verifies you, ShadowID lets the community verify each other. But it's not anarchic—we have anti-Sybil protections and admin oversight."

**3. Shadow Score - The Real Innovation**
"Your reputation can't be bought or faked. It's built from endorsements by diverse peers. The more different people verify you, the higher your score. One person endorsing you repeatedly doesn't help—diversity matters."

**4. Privacy by Default**
"You control what you share and with whom. Selective disclosure means you only prove what's necessary for each context. It's privacy-preserving identity."

**5. Immutable Audit Trail**
"Everything is on-chain. You can see your entire verification history. Admins are accountable. Users have transparency. Nothing can be deleted retroactively."

**6. Ready for Enterprise**
"Professional tier includes API access for services to integrate verification. Imagine financial apps, DAOs, and platforms all using the same trusted identity layer."

**7. Roadmap to Full Decentralization**
"We start centralized for speed, then move to hybrid, then full decentralization with DAO governance. This isn't a forever-centralized service—it's heading toward community control."

---

## DEMO WALKTHROUGH (Suggested Screen Recording Sequence)

1. **Start at Dashboard** - Show the home hub
2. **Create ShadowID** - Walk through attribute selection to QR code
3. **Navigate to My ShadowID** - Show identity management and Shadow Score
4. **Endorse a Peer** - Demonstrate peer verification
5. **Create Selective Disclosure Proof** - Show QR code generation
6. **Verify the Proof** - Scan the QR code to verify
7. **Check Activity Logs** - Show immutable audit trail
8. **Admin Panel** (if applicable) - Show governance
9. **Settings Page** - Highlight privacy controls
10. **End at Public Profile** - Show how others see your identity

---

## CONCLUSION TALKING POINTS

"ShadowID solves a fundamental problem: How do you prove credibility without sacrificing privacy? Traditional identity systems make you hand over everything. Web3 had no identity at all. ShadowID is the middle path—selective disclosure with decentralized reputation. You control what you share. The community verifies claims. Everything is transparent and immutable. And it's built to scale from startup to enterprise adoption."

