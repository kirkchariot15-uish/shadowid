import { verifyCommitmentHashFormat } from './commitment-hash-generator'

/**
 * Normalize a commitment hash to hex format
 * Handles both formatted (XX-XXXXXXXX...) and raw hex formats
 */
export function normalizeCommitmentToHex(commitment: string): { hex: string; isValid: boolean; error?: string } {
  if (!commitment || !commitment.trim()) {
    return { hex: '', isValid: false, error: 'Commitment hash cannot be empty' }
  }

  const sanitized = commitment.trim();
  
  // Check if it's the formatted hash (XX-XXXXXXXX...)
  const isFormattedHash = verifyCommitmentHashFormat(sanitized);
  
  if (isFormattedHash) {
    // Extract hex part from formatted hash
    const parts = sanitized.split('-');
    if (parts.length === 2) {
      const hexPart = parts[1];
      const normalized = hexPart.toLowerCase();
      
      // Validate that the extracted hex is valid
      if (/^[0-9a-f]{16,}$/i.test(normalized)) {
        return { hex: normalized, isValid: true }
      }
      
      return { hex: '', isValid: false, error: 'Invalid hex format in commitment hash' }
    }
  }

  // Check if it's raw hex format
  const isRawHex = /^(0x)?[0-9a-f]{32,}$/i.test(sanitized);
  if (isRawHex) {
    // Remove 0x prefix if present
    const normalized = sanitized.replace(/^0x/i, '').toLowerCase();
    return { hex: normalized, isValid: true }
  }

  return {
    hex: '',
    isValid: false,
    error: 'Invalid commitment hash format. Expected formatted hash (XX-XXXXXXXX...) or hex string'
  }
}

/**
 * Normalize a commitment for comparison
 * Returns lowercase version for safe comparison
 */
export function normalizeCommitmentForComparison(commitment: string | null): string {
  if (!commitment) return '';
  
  const sanitized = commitment.trim();
  
  // If it's formatted hash, extract hex part
  if (verifyCommitmentHashFormat(sanitized)) {
    const parts = sanitized.split('-');
    if (parts.length === 2) {
      return parts[1].toLowerCase();
    }
  }

  // Otherwise return as-is but lowercase
  return sanitized.toLowerCase();
}
