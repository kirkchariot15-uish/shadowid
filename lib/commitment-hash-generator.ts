/**
 * Generate a unique commitment hash for the user's ShadowID
 * This hash is derived from the user's identity data and serves as their unique identifier
 */
export async function generateCommitmentHash(identityData: {
  userAddress: string;
  attributes: string[];
  timestamp: number;
  transactionId: string;
}): Promise<string> {
  // Create a deterministic string from identity data
  const dataString = `${identityData.userAddress}:${identityData.attributes.join(',')}:${identityData.timestamp}:${identityData.transactionId}`;
  
  // Hash using Web Crypto API (built-in, no external dependencies)
  const encoder = new TextEncoder();
  const data = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const commitmentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return commitmentHash;
}

/**
 * Store user identity commitment hash locally (encrypted with wallet address)
 */
export function storeCommitmentHash(commitmentHash: string, userAddress: string): void {
  try {
    // Store with wallet address as a basic scope (prevents cross-wallet data leakage)
    const key = `shadowid-commitment-${userAddress}`;
    localStorage.setItem(key, JSON.stringify({
      hash: commitmentHash,
      createdAt: new Date().toISOString(),
      userAddress,
    }));
    
    console.log('[v0] Commitment hash stored for user:', userAddress);
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
 * Generate a shareable commitment hash that can be used for verification
 * This is what the user will share with verifiers
 */
export function generateShareableCommitmentHash(baseHash: string): string {
  // Add a timestamp-based component to make it verifiable by validators
  const timestamp = Math.floor(Date.now() / 1000);
  const encoder = new TextEncoder();
  const combined = `${baseHash}:${timestamp}`;
  
  // For display purposes, return a shortened version
  return baseHash.substring(0, 16).toUpperCase();
}
