/**
 * Client-side encryption and hashing utilities for ShadowID
 * All operations are performed locally in the browser
 * No data is sent to any server unencrypted
 */

/**
 * Generate SHA-256 hash of data
 * Used for creating commitment hashes for QR codes and verification
 */
export async function generateHash(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Generate a random encryption key using PBKDF2
 * Derived from wallet-specific data (will be provided by wallet connection)
 */
export async function generateEncryptionKey(seed: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const data = encoder.encode(seed)
  
  const baseKey = await crypto.subtle.importKey(
    'raw',
    data,
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encoder.encode('shadowid-encryption-salt'),
      iterations: 100000,
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt data using AES-GCM
 * Returns base64-encoded ciphertext with IV prepended
 */
export async function encryptData(
  data: Uint8Array,
  key: CryptoKey
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )

  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encryptedBuffer), iv.length)

  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypt AES-GCM encrypted data
 * Expects base64-encoded input with IV prepended
 */
export async function decryptData(
  encryptedBase64: string,
  key: CryptoKey
): Promise<Uint8Array> {
  const combined = new Uint8Array(
    atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
  )

  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )

  return new Uint8Array(decrypted)
}

/**
 * Generate a commitment hash from file data in Aleo field format
 * Converts hex to decimal field type required by Aleo
 */
export async function generateFileCommitment(fileData: Uint8Array): Promise<string> {
  const hash = await generateHash(fileData)
  const hexTruncated = hash.slice(0, 16)
  // Convert hex to decimal and add 'field' type suffix for Aleo
  const decimal = BigInt('0x' + hexTruncated).toString()
  return decimal + 'field'
}

/**
 * Generate a commitment hash display value (hex format for UI)
 */
export async function generateFileCommitmentHex(fileData: Uint8Array): Promise<string> {
  const hash = await generateHash(fileData)
  return hash.slice(0, 16).toUpperCase()
}

/**
 * Convert file to Uint8Array for processing
 */
export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer())
}
