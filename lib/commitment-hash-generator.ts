/**
 * Generate a unique commitment hash for the user's ShadowID
 * Hash includes all user identity data for verifiability
 */
export async function generateCommitmentHash(identityData: {
  userAddress: string;
  attributes: string[];
  timestamp: number;
  transactionId: string;
}): Promise<string> {
  // Create a deterministic string from identity data in sorted order for consistency
  const sortedAttrs = [...identityData.attributes].sort();
  const dataString = `shadowid-v1:${identityData.userAddress}:${sortedAttrs.join(',')}:${identityData.timestamp}:${identityData.transactionId}`;
  
  // Hash using Web Crypto API (built-in, no external dependencies)
  const encoder = new TextEncoder();
  const data = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fullHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Add checksum (first 4 bytes of second hash pass) for integrity verification
  const checksumBuffer = await crypto.subtle.digest('SHA-256', hashBuffer);
  const checksumArray = Array.from(new Uint8Array(checksumBuffer));
  const checksum = checksumArray.slice(0, 2).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  
  // Return shortened hash with checksum prefix for display
  const displayHash = fullHash.substring(0, 32).toUpperCase();
  const commitmentHash = `${checksum}-${displayHash}`;
  
  console.log('[v0] Generated commitment hash:', commitmentHash);
  return commitmentHash;
}

/**
 * Store user identity commitment hash locally (scoped to wallet address)
 */
export function storeCommitmentHash(commitmentHash: string, userAddress: string): void {
  try {
    const key = `shadowid-commitment-${userAddress}`;
    localStorage.setItem(key, JSON.stringify({
      hash: commitmentHash,
      createdAt: new Date().toISOString(),
      userAddress,
      version: 'v1'
    }));
    
    // Also store in general key for quick access (will be overwritten each time)
    localStorage.setItem('shadowid-commitment', commitmentHash);
    
    console.log('[v0] Commitment hash stored:', commitmentHash);
  } catch (error) {
    console.error('[v0] Error storing commitment hash:', error);
  }
}

/**
 * Retrieve user's commitment hash from local storage
 */
export function getCommitmentHash(userAddress: string): string | null {
  try {
    const key = `shadowid-commitment-${userAddress}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    return data.hash || null;
  } catch (error) {
    console.error('[v0] Error retrieving commitment hash:', error);
    return null;
  }
}

/**
 * Verify commitment hash format (check for valid checksum structure)
 */
export function verifyCommitmentHashFormat(hash: string): boolean {
  if (!hash || typeof hash !== 'string') {
    console.log('[v0] Hash is not a string:', typeof hash);
    return false;
  }

  // Format: XXXX-XXXXXXXXXXXXXXXX (4-hex checksum + dash + 32-hex hash)
  // Also accept XX-XXXXXXXXXXXXXXXX for backwards compatibility
  const parts = hash.split('-');
  if (parts.length !== 2) {
    console.log('[v0] Hash does not have exactly one dash. Parts:', parts.length);
    return false;
  }
  
  const [checksum, displayHash] = parts;
  
  console.log('[v0] Validating - Checksum:', checksum, '(len:', checksum.length + ')', 'Hash:', displayHash, '(len:', displayHash?.length + ')');
  
  // Accept either 2 or 4 hex chars for checksum (for backwards compatibility)
  if (checksum.length !== 2 && checksum.length !== 4) {
    console.log('[v0] ✗ Checksum length mismatch:', checksum.length, 'expected 2 or 4');
    return false;
  }
  
  // Hash should be exactly 32 hex chars
  if (!displayHash || displayHash.length !== 32) {
    console.log('[v0] ✗ Hash length mismatch:', displayHash?.length, 'expected 32');
    return false;
  }
  
  // Verify hex format
  const isValidHex = /^[0-9A-F]+$/i.test(checksum + displayHash);
  if (!isValidHex) {
    console.log('[v0] ✗ Invalid hex characters detected');
    return false;
  }
  
  console.log('[v0] ✅ Commitment hash format is valid:', hash);
  return true;
}
