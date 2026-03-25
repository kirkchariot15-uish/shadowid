/**
 * Fee Formatting Utilities
 * Convert between Aleo token units and display formats
 */

// ALEO token constants
export const ALEO_UNITS = {
  MICRO_ALEO: 1,        // 1 micro-ALEO
  ALEO: 1_000_000,      // 1 ALEO = 1,000,000 micro-ALEO
}

// Standard pricing in ALEO tokens
export const STANDARD_PRICING = {
  IDENTITY_CREATION: 5, // 5 ALEO tokens
}

/**
 * Format micro-ALEO to ALEO tokens
 */
export function microAleoToAleo(microAleo: number): number {
  return microAleo / ALEO_UNITS.ALEO
}

/**
 * Format ALEO tokens to micro-ALEO
 */
export function aleoToMicroAleo(aleo: number): number {
  return aleo * ALEO_UNITS.ALEO
}

/**
 * Display ALEO amount with proper formatting
 */
export function formatAleoAmount(microAleo: number | string): string {
  const amount = typeof microAleo === 'string' ? parseInt(microAleo, 10) : microAleo
  const aleo = microAleoToAleo(amount)
  
  // Display with 6 decimal places max, trim trailing zeros
  return aleo.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  })
}

/**
 * Display transaction fee in ALEO with currency formatting
 */
export function formatTransactionFee(microAleo: number | string): string {
  const formatted = formatAleoAmount(microAleo)
  return `${formatted} ALEO`
}

/**
 * Get standard fee for operation
 */
export function getStandardFee(operation: keyof typeof STANDARD_PRICING): number {
  return STANDARD_PRICING[operation]
}

/**
 * Get standard fee in micro-ALEO
 */
export function getStandardFeeInMicroAleo(operation: keyof typeof STANDARD_PRICING): number {
  return aleoToMicroAleo(STANDARD_PRICING[operation])
}
