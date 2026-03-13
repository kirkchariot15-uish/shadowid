/**
 * Commitment Hash Processor
 * Processes user input to extract and normalize commitment hashes
 * Handles both formatted (XX-XXXXXXXX...) and raw hex formats
 */

export interface CommitmentValidationResult {
  isValid: boolean;
  hexValue?: string;
  displayValue?: string;
  error?: string;
}

/**
 * Validate and process a commitment hash input
 * @param input - User-provided commitment hash
 * @returns Validation result with processed hex value and display value
 */
export function processCommitmentInput(input: string): CommitmentValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      error: 'Commitment hash cannot be empty'
    }
  }

  const sanitized = input.trim();

  // Pattern 1: Formatted hash (XX-XXXXXXXX...)
  const formattedPattern = /^([0-9A-F]{2,4})-([0-9A-F]{16,})$/i;
  const formattedMatch = sanitized.match(formattedPattern);

  if (formattedMatch) {
    const [, checksum, hash] = formattedMatch;
    return {
      isValid: true,
      hexValue: hash.toLowerCase(),
      displayValue: sanitized
    }
  }

  // Pattern 2: Raw hex (0x... or ...)
  const hexPattern = /^(0x)?([0-9A-F]{32,})$/i;
  const hexMatch = sanitized.match(hexPattern);

  if (hexMatch) {
    const [, prefix, hash] = hexMatch;
    return {
      isValid: true,
      hexValue: hash.toLowerCase(),
      displayValue: sanitized
    }
  }

  return {
    isValid: false,
    error: 'Invalid format. Use formatted hash (AB12-CDEF1234...) or hex (0x... or ...)'
  }
}

/**
 * Convert commitment hex to field format for blockchain operations
 * @param hexValue - The hex value (with or without 0x prefix)
 * @returns Field-formatted value for Aleo blockchain
 */
export function commitmentHexToField(hexValue: string): string {
  const hex = hexValue.replace(/^0x/i, '');
  
  // Ensure it has 0x prefix for hexToField
  if (!hex.startsWith('0x')) {
    return `0x${hex}`;
  }
  
  return hex;
}
