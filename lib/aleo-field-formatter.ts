/**
 * Aleo Field Formatting Utility
 * Ensures all hex values are properly converted to decimal field format
 * Required by Aleo's strict Rust parser
 */

/**
 * Convert a hex string to Aleo field format
 * Pattern: hex → decimal using BigInt → add 'field' suffix
 * 
 * Example:
 * "F4DCC1CB932D9E71" → BigInt("0xF4DCC1CB932D9E71").toString() → "17760476956843249009" → "17760476956843249009field"
 */
export function hexToField(hexValue: string): string {
  // Remove '0x' prefix if present
  const cleanHex = hexValue.startsWith('0x') ? hexValue.slice(2) : hexValue
  
  // Validate hex format
  if (!/^[0-9A-Fa-f]+$/.test(cleanHex)) {
    throw new Error(`Invalid hex value: ${hexValue}. Must contain only hex characters.`)
  }
  
  // Convert hex to decimal
  const decimal = BigInt('0x' + cleanHex).toString()
  
  // Add field suffix
  return decimal + 'field'
}

/**
 * Convert a number to Aleo u64 format
 */
export function numberToU64(value: number | string): string {
  return `${value}u64`
}

/**
 * Convert a number to Aleo u32 format
 */
export function numberToU32(value: number | string): string {
  return `${value}u32`
}

/**
 * Convert a number to Aleo u8 format
 */
export function numberToU8(value: number | string): string {
  return `${value}u8`
}

/**
 * Format an Aleo address
 * Addresses should be in format: aleo1...@public or aleo1...@private
 */
export function formatAleoAddress(address: string, visibility: 'public' | 'private' = 'public'): string {
  if (!address.startsWith('aleo1')) {
    throw new Error(`Invalid Aleo address: ${address}. Must start with 'aleo1'`)
  }
  
  // If already has visibility suffix, return as-is
  if (address.includes('@')) {
    return address
  }
  
  return `${address}@${visibility}`
}

/**
 * Validate Aleo input format
 */
export function validateAleoInput(input: string, expectedType: 'field' | 'u64' | 'u32' | 'u8' | 'address' | 'bool'): boolean {
  const typePatterns: Record<string, RegExp> = {
    field: /^\d+field$/,
    u64: /^\d+u64$/,
    u32: /^\d+u32$/,
    u8: /^\d+u8$/,
    address: /^aleo1[a-z0-9]+(@(public|private))?$/,
    bool: /^(true|false)$/,
  }
  
  const pattern = typePatterns[expectedType]
  if (!pattern) {
    throw new Error(`Unknown type: ${expectedType}`)
  }
  
  return pattern.test(input)
}

/**
 * Automatically detect and convert hex strings to field format
 * Use this when you're unsure if a value is already formatted
 */
export function ensureFieldFormat(value: string): string {
  // If it's already in field format, return as-is
  if (/^\d+field$/.test(value)) {
    return value
  }
  
  // If it's hex (with or without 0x prefix), convert it
  if (/^(0x)?[0-9A-Fa-f]+$/.test(value)) {
    return hexToField(value)
  }
  
  // Otherwise assume it's already correctly formatted
  return value
}
