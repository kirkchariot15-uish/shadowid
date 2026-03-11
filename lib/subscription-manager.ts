/**
 * Subscription Management
 * Handles subscription state, limits, and payment via Aleo wallet
 */

export interface SubscriptionStatus {
  isSubscribed: boolean;
  tier: 'free' | 'standard' | 'premium' | 'custom';
  expiresAt: string | null;
  maxAttributes: number;
  maxCustomAttributes: number;
  transactionHash: string | null;
  subscribedAt: string | null;
  paymentToken: 'ALEO' | 'USDx';
}

export interface SubscriptionTier {
  name: string;
  displayName: string;
  maxAttributes: number;
  maxCustomAttributes: number;
  standardAttributes: boolean;
  customAttributesAllowed: boolean;
  cost: number;
  currency: 'ALEO' | 'USDx';
  description: string;
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  FREE: {
    name: 'free',
    displayName: 'Free',
    maxAttributes: 2,
    maxCustomAttributes: 0,
    standardAttributes: true,
    customAttributesAllowed: false,
    cost: 0,
    currency: 'ALEO',
    description: 'Create up to 2 attributes'
  },
  STANDARD: {
    name: 'standard',
    displayName: 'Standard',
    maxAttributes: 8,
    maxCustomAttributes: 0,
    standardAttributes: true,
    customAttributesAllowed: false,
    cost: 5,
    currency: 'ALEO',
    description: 'All 8 standard attributes'
  },
  PREMIUM: {
    name: 'premium',
    displayName: 'Premium',
    maxAttributes: 8,
    maxCustomAttributes: 5,
    standardAttributes: true,
    customAttributesAllowed: true,
    cost: 10,
    currency: 'USDx',
    description: '8 standard + 5 custom attributes'
  },
  CUSTOM: {
    name: 'custom',
    displayName: 'Custom',
    maxAttributes: 20,
    maxCustomAttributes: 20,
    standardAttributes: true,
    customAttributesAllowed: true,
    cost: 25,
    currency: 'USDx',
    description: 'Up to 20 custom attributes'
  }
};

import { getWithWalletValidation, storeWithWalletValidation } from './wallet-data-validation'

/**
 * Get user's subscription status from localStorage
 * Validates that subscription belongs to current wallet
 */
export function getSubscriptionStatus(walletAddress?: string): SubscriptionStatus {
  try {
    let stored = null
    
    if (walletAddress) {
      // If wallet provided, validate it belongs to current wallet
      stored = getWithWalletValidation('shadowid-subscription', walletAddress)
    } else {
      // Fallback: direct localStorage access (client-side only)
      const raw = localStorage.getItem('shadowid-subscription')
      stored = raw ? JSON.parse(raw) : null
    }
    
    if (!stored) {
      return {
        isSubscribed: false,
        tier: 'free',
        expiresAt: null,
        maxAttributes: SUBSCRIPTION_TIERS.FREE.maxAttributes,
        maxCustomAttributes: SUBSCRIPTION_TIERS.FREE.maxCustomAttributes,
        transactionHash: null,
        subscribedAt: null,
        paymentToken: 'ALEO'
      }
    }

    return stored
  } catch (error) {
    console.error('[v0] Error reading subscription status:', error)
    return {
      isSubscribed: false,
      tier: 'free',
      expiresAt: null,
      maxAttributes: SUBSCRIPTION_TIERS.FREE.maxAttributes,
      maxCustomAttributes: SUBSCRIPTION_TIERS.FREE.maxCustomAttributes,
      transactionHash: null,
      subscribedAt: null,
      paymentToken: 'ALEO'
    }
  }
}

/**
 * Set subscription status after successful payment
 */
export function setSubscriptionStatus(
  tier: 'standard' | 'premium' | 'custom',
  transactionHash: string,
  paymentToken: 'ALEO' | 'USDx' = 'ALEO',
  durationDays: number = 365,
  walletAddress?: string
): SubscriptionStatus {
  const tierData = SUBSCRIPTION_TIERS[tier.toUpperCase()];
  
  if (!tierData) {
    throw new Error(`Invalid subscription tier: ${tier}`);
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  const status: SubscriptionStatus = {
    isSubscribed: true,
    tier: tier as 'standard' | 'premium' | 'custom',
    expiresAt,
    maxAttributes: tierData.maxAttributes,
    maxCustomAttributes: tierData.maxCustomAttributes,
    transactionHash,
    subscribedAt: now.toISOString(),
    paymentToken
  };

  if (walletAddress) {
    // Store with wallet validation if address provided
    storeWithWalletValidation('shadowid-subscription', status, walletAddress, durationDays * 24)
  } else {
    // Fallback: direct storage
    localStorage.setItem('shadowid-subscription', JSON.stringify(status))
  }
  
  return status;
}

/**
 * Check if subscription is still valid
 */
export function isSubscriptionActive(): boolean {
  const status = getSubscriptionStatus();
  
  if (!status.isSubscribed || !status.expiresAt) {
    return false;
  }

  return new Date(status.expiresAt) > new Date();
}

/**
 * Get max attributes user can claim
 */
export function getMaxAttributesForUser(): number {
  const isActive = isSubscriptionActive();
  const status = getSubscriptionStatus();
  
  if (!isActive) {
    return SUBSCRIPTION_TIERS.FREE.maxAttributes;
  }
  
  return status.maxAttributes;
}

/**
 * Get max custom attributes user can create
 */
export function getMaxCustomAttributesForUser(): number {
  const isActive = isSubscriptionActive();
  const status = getSubscriptionStatus();
  
  if (!isActive) {
    return SUBSCRIPTION_TIERS.FREE.maxCustomAttributes;
  }
  
  return status.maxCustomAttributes;
}

/**
 * Get current subscription tier
 */
export function getCurrentSubscriptionTier(): SubscriptionTier {
  const status = getSubscriptionStatus();
  const tierKey = status.tier.toUpperCase();
  return SUBSCRIPTION_TIERS[tierKey] || SUBSCRIPTION_TIERS.FREE;
}

/**
 * Get all subscription tiers for display
 */
export function getAllSubscriptionTiers(): SubscriptionTier[] {
  return Object.values(SUBSCRIPTION_TIERS);
}

/**
 * Clear subscription status (when user disconnects or deletes account)
 */
export function clearSubscriptionStatus(): void {
  localStorage.removeItem('shadowid-subscription');
  localStorage.removeItem('shadowid-subscription-expired');
}

/**
 * Clear all user data when account is deleted/reset
 */
export function clearAllUserData(): void {
  localStorage.removeItem('shadowid-subscription');
  localStorage.removeItem('shadowid-commitment');
  localStorage.removeItem('shadowid-commitment-hex');
  localStorage.removeItem('shadowid-credential');
  localStorage.removeItem('shadowid-attributes');
  localStorage.removeItem('shadowid-created-at');
  localStorage.removeItem('shadowid-attribute-hash');
  localStorage.removeItem('shadowid-onboarding-done');
}

export function getSubscriptionInfo() {
  const status = getSubscriptionStatus();
  const isActive = isSubscriptionActive();

  if (!status.isSubscribed) {
    const freeTier = SUBSCRIPTION_TIERS.FREE;
    return {
      status: 'Free Plan',
      maxAttributes: freeTier.maxAttributes,
      remaining: freeTier.maxAttributes,
      cost: freeTier.cost,
      message: `You can activate up to ${freeTier.maxAttributes} attributes. Subscribe for all 8.`,
      isActive: false
    };
  }

  if (isActive) {
    const expiresDate = new Date(status.expiresAt!);
    const daysRemaining = Math.ceil(
      (expiresDate.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)
    );

    return {
      status: `${status.tier.charAt(0).toUpperCase()}${status.tier.slice(1)} Plan`,
      maxAttributes: status.maxAttributes,
      remaining: status.maxAttributes,
      cost: SUBSCRIPTION_TIERS[status.tier.toUpperCase()]?.cost || 0,
      message: `${status.maxAttributes} attributes unlocked. Subscription expires in ${daysRemaining} days.`,
      isActive: true,
      expiresAt: expiresDate.toLocaleDateString()
    };
  }

  // Subscription expired
  const freeTier = SUBSCRIPTION_TIERS.FREE;
  return {
    status: 'Subscription Expired',
    maxAttributes: freeTier.maxAttributes,
    remaining: freeTier.maxAttributes,
    cost: freeTier.cost,
    message: `Your subscription expired. Subscribe again to unlock attributes.`,
    isActive: false,
    expiredAt: new Date(status.expiresAt!).toLocaleDateString()
  };
}

/**
 * Clear subscription (for logout or reset)
 */
export function clearSubscription() {
  localStorage.removeItem('shadowid-subscription');
}
