/**
 * Aleo Input Type Validator and Converter
 * Ensures all inputs match strict Aleo type requirements
 * 
 * Aleo requires typed inputs like: "123field", "100u64", "aleo1address..."
 * NOT raw hex strings like: "50EC52E85674AFDB"
 */

/**
 * Convert hex string to Aleo field type
 * Example: "50EC52E85674AFDB" -> "5827219492148704987field"
 */
export function hexToAleoField(hexString: string): string {
  // Remove 0x prefix if present
  const cleanHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString
  
  // Convert hex to decimal
  const decimal = BigInt('0x' + cleanHex).toString()
  
  // Return with field type suffix
  return `${decimal}field`
}

/**
 * Convert hex string to Aleo u64 type
 * Example: "50EC52E85674AFDB" -> "5827219492148704987u64"
 */
export function hexToAleoU64(hexString: string): string {
  const cleanHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString
  const decimal = BigInt('0x' + cleanHex).toString()
  
  // Check if value fits in u64 (max: 18446744073709551615)
  const MAX_U64 = 18446744073709551615n
  const value = BigInt(decimal)
  
  if (value > MAX_U64) {
    throw new Error(`Value ${decimal} exceeds u64 maximum (${MAX_U64})`)
  }
  
  return `${value}u64`
}

/**
 * Validate that a value is a valid Aleo field input
 */
export function isValidAleoField(input: string): boolean {
  // Must end with 'field'
  if (!input.endsWith('field')) return false
  
  // Must have digits before 'field'
  const numPart = input.slice(0, -5) // Remove 'field'
  
  // Must be a valid decimal number
  try {
    BigInt(numPart)
    return true
  } catch {
    return false
  }
}

/**
 * Validate that a value is a valid Aleo u64 input
 */
export function isValidAleoU64(input: string): boolean {
  if (!input.endsWith('u64')) return false
  
  const numPart = input.slice(0, -3) // Remove 'u64'
  
  try {
    const value = BigInt(numPart)
    const MAX_U64 = 18446744073709551615n
    return value >= 0n && value <= MAX_U64
  } catch {
    return false
  }
}

/**
 * Validate that a value is a valid Aleo address
 * Format: aleo1 + 58 characters
 */
export function isValidAleoAddress(input: string): boolean {
  return /^aleo1[a-z0-9]{58}$/.test(input)
}

/**
 * Validate all inputs for a transaction before sending to Aleo
 */
export function validateAleoInputs(inputs: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  inputs.forEach((input, index) => {
    // Check if it's a raw hex string (INVALID - this is the bug we're fixing!)
    if (/^[0-9A-Fa-f]+$/.test(input) && !input.includes('field') && !input.includes('u') && !input.startsWith('aleo')) {
      errors.push(
        `Input ${index}: Raw hex string detected "${input.slice(0, 20)}...". ` +
        `Aleo requires typed inputs like "${hexToAleoField(input)}" or "${hexToAleoU64(input)}"`
      )
    }
    
    // Check for quoted numbers (INVALID)
    if (/^"[0-9]+"$/.test(input)) {
      errors.push(`Input ${index}: Quoted number detected "${input}". Remove quotes and add type suffix (field, u64, etc)`)
    }
    
    // Validate specific types
    if (input.endsWith('field')) {
      if (!isValidAleoField(input)) {
        errors.push(`Input ${index}: Invalid field format "${input}". Expected format: "123field"`)
      }
    } else if (input.endsWith('u64')) {
      if (!isValidAleoU64(input)) {
        errors.push(`Input ${index}: Invalid u64 format "${input}". Value must be 0-${18446744073709551615}`)
      }
    } else if (input.startsWith('aleo')) {
      if (!isValidAleoAddress(input)) {
        errors.push(`Input ${index}: Invalid Aleo address "${input}". Expected format: aleo1[58 alphanumeric chars]`)
      }
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Format and validate inputs before passing to Aleo program
 * Automatically converts common error patterns
 */
export function formatAleoInputs(inputs: any[]): string[] {
  return inputs.map((input, index) => {
    // If already a string, validate it
    if (typeof input === 'string') {
      // Check if it's a raw hex string that needs conversion
      if (/^[0-9A-Fa-f]{8,16}$/.test(input) && !input.includes('field') && !input.includes('u')) {
        console.log(`[v0] Auto-converting raw hex to field: ${input}`)
        return hexToAleoField(input)
      }
      return input
    }
    
    // If number, convert to field
    if (typeof input === 'number') {
      return `${input}field`
    }
    
    // If BigInt, convert to field
    if (typeof input === 'bigint') {
      return `${input.toString()}field`
    }
    
    throw new Error(`Input ${index}: Unsupported type ${typeof input}`)
  })
}

/**
 * Debug helper to show what's wrong with inputs
 */
export function debugAleoInputs(inputs: string[]): void {
  console.log('[v0] === Aleo Input Debug ===')
  inputs.forEach((input, index) => {
    console.log(`[v0] Input ${index}: "${input}"`)
    
    if (/^[0-9A-Fa-f]+$/.test(input) && !input.includes('field') && !input.includes('u') && !input.startsWith('aleo')) {
      console.warn(`[v0]   ⚠️  Raw hex detected! Should be: "${hexToAleoField(input)}"`)
    } else if (/^"[0-9]+"$/.test(input)) {
      console.warn(`[v0]   ⚠️  Quoted number! Remove quotes: "${input.slice(1, -1)}field"`)
    } else if (input.endsWith('field')) {
      if (isValidAleoField(input)) {
        console.log(`[v0]   ✓ Valid field type`)
      } else {
        console.error(`[v0]   ✗ Invalid field format`)
      }
    } else if (input.endsWith('u64')) {
      if (isValidAleoU64(input)) {
        console.log(`[v0]   ✓ Valid u64 type`)
      } else {
        console.error(`[v0]   ✗ Invalid u64 format`)
      }
    } else if (input.startsWith('aleo')) {
      if (isValidAleoAddress(input)) {
        console.log(`[v0]   ✓ Valid address`)
      } else {
        console.error(`[v0]   ✗ Invalid address format`)
      }
    }
  })
  console.log('[v0] === End Debug ===')
}
