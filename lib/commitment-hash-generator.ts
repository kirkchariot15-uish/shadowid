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
  // Format: XX-XXXXXXXXXXXXXXXX... (checksum-hash)
  const parts = hash.split('-');
  if (parts.length !== 2) return false;
  
  const [checksum, displayHash] = parts;
  if (checksum.length !== 4) return false; // 2 bytes = 4 hex chars
  if (displayHash.length < 16) return false; // At least 16 hex chars
  
  // Verify hex format
  if (!/^[0-9A-F]+$/i.test(checksum + displayHash)) return false;
  
  return true;
}
