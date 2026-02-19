/**
 * Encrypted Off-Chain Storage
 * All sensitive data stored locally is encrypted with AES-256-GCM
 */

import { crypto } from 'crypto';

interface EncryptedData {
  ciphertext: string;
  iv: string;
  tag: string;
  salt: string;
}

/**
 * Derive encryption key from wallet private key + additional salt
 */
async function deriveEncryptionKey(walletPrivateKey: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(walletPrivateKey + salt),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt sensitive data for off-chain storage
 */
export async function encryptOffChainData(
  data: any,
  walletPrivateKey: string
): Promise<EncryptedData> {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await deriveEncryptionKey(walletPrivateKey, Buffer.from(salt).toString('hex'));
    
    const encoder = new TextEncoder();
    const plaintext = encoder.encode(JSON.stringify(data));
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      plaintext
    );

    const ciphertextArray = new Uint8Array(ciphertext);
    const tag = ciphertextArray.slice(-16);
    const encrypted = ciphertextArray.slice(0, -16);

    return {
      ciphertext: Buffer.from(encrypted).toString('hex'),
      iv: Buffer.from(iv).toString('hex'),
      tag: Buffer.from(tag).toString('hex'),
      salt: Buffer.from(salt).toString('hex'),
    };
  } catch (error) {
    console.error('[v0] Encryption failed:', error);
    throw error;
  }
}

/**
 * Decrypt off-chain stored data
 */
export async function decryptOffChainData(
  encrypted: EncryptedData,
  walletPrivateKey: string
): Promise<any> {
  try {
    const salt = Buffer.from(encrypted.salt, 'hex');
    const iv = Buffer.from(encrypted.iv, 'hex');
    const ciphertext = Buffer.from(encrypted.ciphertext, 'hex');
    const tag = Buffer.from(encrypted.tag, 'hex');
    
    const key = await deriveEncryptionKey(walletPrivateKey, encrypted.salt);
    
    // Combine ciphertext + tag for decryption
    const encryptedData = Buffer.concat([ciphertext, tag]);
    
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(plaintext));
  } catch (error) {
    console.error('[v0] Decryption failed:', error);
    throw error;
  }
}

/**
 * Store encrypted credential data in localStorage
 */
export async function storeEncryptedCredential(
  credentialId: string,
  credential: any,
  walletPrivateKey: string
): Promise<void> {
  try {
    const encrypted = await encryptOffChainData(credential, walletPrivateKey);
    const storageKey = `shadowid-credential-${credentialId}`;
    localStorage.setItem(storageKey, JSON.stringify(encrypted));
    console.log('[v0] Credential encrypted and stored:', credentialId);
  } catch (error) {
    console.error('[v0] Failed to store encrypted credential:', error);
    throw error;
  }
}

/**
 * Retrieve and decrypt credential from localStorage
 */
export async function getDecryptedCredential(
  credentialId: string,
  walletPrivateKey: string
): Promise<any> {
  try {
    const storageKey = `shadowid-credential-${credentialId}`;
    const encrypted = localStorage.getItem(storageKey);
    
    if (!encrypted) {
      throw new Error('Credential not found');
    }

    const decrypted = await decryptOffChainData(JSON.parse(encrypted), walletPrivateKey);
    console.log('[v0] Credential decrypted:', credentialId);
    return decrypted;
  } catch (error) {
    console.error('[v0] Failed to retrieve credential:', error);
    throw error;
  }
}

/**
 * Encrypt and store proof data
 */
export async function storeEncryptedProof(
  proofId: string,
  proof: any,
  walletPrivateKey: string
): Promise<void> {
  try {
    const encrypted = await encryptOffChainData(proof, walletPrivateKey);
    const storageKey = `shadowid-proof-${proofId}`;
    localStorage.setItem(storageKey, JSON.stringify(encrypted));
    console.log('[v0] Proof encrypted and stored:', proofId);
  } catch (error) {
    console.error('[v0] Failed to store encrypted proof:', error);
    throw error;
  }
}

/**
 * Retrieve and decrypt proof
 */
export async function getDecryptedProof(
  proofId: string,
  walletPrivateKey: string
): Promise<any> {
  try {
    const storageKey = `shadowid-proof-${proofId}`;
    const encrypted = localStorage.getItem(storageKey);
    
    if (!encrypted) {
      throw new Error('Proof not found');
    }

    const decrypted = await decryptOffChainData(JSON.parse(encrypted), walletPrivateKey);
    console.log('[v0] Proof decrypted:', proofId);
    return decrypted;
  } catch (error) {
    console.error('[v0] Failed to retrieve proof:', error);
    throw error;
  }
}

/**
 * Clear all encrypted data (on logout)
 */
export function clearAllEncryptedData(): void {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('shadowid-credential-') || key.startsWith('shadowid-proof-')) {
      localStorage.removeItem(key);
    }
  });
  console.log('[v0] All encrypted data cleared');
}
