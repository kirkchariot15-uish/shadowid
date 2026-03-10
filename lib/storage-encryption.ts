/**
 * Secure Storage Encryption
 * Encrypts sensitive data before storing in localStorage
 * Uses basic XOR with session key for browser-level protection
 */

// Generate a session key from wallet address
function generateSessionKey(walletAddress: string): string {
  // Create a hash from wallet address for this session
  let hash = 0;
  for (let i = 0; i < walletAddress.length; i++) {
    const char = walletAddress.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
}

// Simple XOR encryption (not cryptographically secure, but prevents casual reading)
function encryptData(data: string, key: string): string {
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    encrypted += String.fromCharCode(charCode);
  }
  return btoa(encrypted); // Base64 encode
}

// Decrypt data
function decryptData(encrypted: string, key: string): string {
  try {
    const data = atob(encrypted); // Base64 decode
    let decrypted = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch (error) {
    console.error('[v0] Decryption failed:', error);
    return '';
  }
}

/**
 * Store sensitive data encrypted in localStorage
 */
export function storeEncryptedData(
  key: string,
  value: string,
  walletAddress: string
): void {
  try {
    const sessionKey = generateSessionKey(walletAddress);
    const encrypted = encryptData(value, sessionKey);
    localStorage.setItem(`enc_${key}`, encrypted);
    // Store encryption metadata (but not the key)
    localStorage.setItem(`enc_meta_${key}`, walletAddress);
  } catch (error) {
    console.error('[v0] Error storing encrypted data:', error);
  }
}

/**
 * Retrieve and decrypt sensitive data from localStorage
 */
export function getDecryptedData(
  key: string,
  walletAddress: string
): string | null {
  try {
    const encrypted = localStorage.getItem(`enc_${key}`);
    const storedAddress = localStorage.getItem(`enc_meta_${key}`);

    // Verify data belongs to current wallet
    if (!encrypted || storedAddress !== walletAddress) {
      return null;
    }

    const sessionKey = generateSessionKey(walletAddress);
    return decryptData(encrypted, sessionKey);
  } catch (error) {
    console.error('[v0] Error retrieving encrypted data:', error);
    return null;
  }
}

/**
 * Clear encrypted data
 */
export function clearEncryptedData(key: string): void {
  localStorage.removeItem(`enc_${key}`);
  localStorage.removeItem(`enc_meta_${key}`);
}

/**
 * Secure store for commitment hash and attributes
 */
export const SecureStorage = {
  setCommitment: (commitment: string, walletAddress: string) => {
    storeEncryptedData('shadowid-commitment', commitment, walletAddress);
  },
  
  getCommitment: (walletAddress: string): string | null => {
    return getDecryptedData('shadowid-commitment', walletAddress);
  },

  setCredential: (credential: string, walletAddress: string) => {
    storeEncryptedData('shadowid-credential', credential, walletAddress);
  },

  getCredential: (walletAddress: string): string | null => {
    return getDecryptedData('shadowid-credential', walletAddress);
  },

  clearAll: () => {
    clearEncryptedData('shadowid-commitment');
    clearEncryptedData('shadowid-credential');
    localStorage.removeItem('shadowid-commitment-hex');
    localStorage.removeItem('shadowid-attribute-hash');
    localStorage.removeItem('shadowid-created-at');
  }
};
