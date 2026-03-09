/**
 * System Configuration
 * Centralized configuration for QR proof validity, attribute limits, and other settings
 */

export const CONFIG = {
  // QR Proof Validity - Time in seconds before QR proof expires
  QR_PROOF_VALIDITY_SECONDS: 3600, // 1 hour - Update this value to change QR expiry globally
  
  // Subscription Tiers
  SUBSCRIPTION: {
    FREE_ATTRIBUTES: 2,
    SUBSCRIBED_ATTRIBUTES: 8,
    CUSTOM_ATTRIBUTES_LIMIT: 5 // Phase 3
  },
  
  // Shadow Score Settings
  SHADOW_SCORE: {
    INITIAL: 50, // New identities start at 50
    MAX: 100,
    PER_ENDORSEMENT: 5,
    ENDORSEMENT_EXPIRY_DAYS: 365 // 1 year before endorsements decay
  },
  
  // Blockchain
  BLOCKCHAIN: {
    NETWORK: 'testnet',
    TESTNET_RPC: 'https://api.testnet.aleo.org' // Update when contract deployed
  }
};

// Helper function to get QR validity in hours
export function getQRValidityHours(): number {
  return CONFIG.QR_PROOF_VALIDITY_SECONDS / 3600;
}

// Helper function to get QR validity in minutes
export function getQRValidityMinutes(): number {
  return CONFIG.QR_PROOF_VALIDITY_SECONDS / 60;
}
