/**
 * Subscription Management
 * Handles subscription state, limits, and payment via Aleo wallet
 */

export interface SubscriptionStatus {
  isSubscribed: boolean;
  expiresAt: string | null;
  maxAttributes: number;
  transactionHash: string | null;
  subscribedAt: string | null;
}

const SUBSCRIPTION_LIMITS = {
  FREE: 2,
  SUBSCRIBED: 8 // All 8 standard attributes
};

const SUBSCRIPTION_COST = 5; // testnet tokens

/**
 * Get user's subscription status from localStorage
 */
export function getSubscriptionStatus(): SubscriptionStatus {
  const stored = localStorage.getItem('shadowid-subscription');
  
  if (!stored) {
    return {
      isSubscribed: false,
      expiresAt: null,
      maxAttributes: SUBSCRIPTION_LIMITS.FREE,
      transactionHash: null,
      subscribedAt: null
    };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return {
      isSubscribed: false,
      expiresAt: null,
      maxAttributes: SUBSCRIPTION_LIMITS.FREE,
      transactionHash: null,
      subscribedAt: null
    };
  }
}

/**
 * Set subscription status after successful payment
 */
export function setSubscriptionStatus(
  transactionHash: string,
  durationDays: number = 365
): SubscriptionStatus {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  const status: SubscriptionStatus = {
    isSubscribed: true,
    expiresAt,
    maxAttributes: SUBSCRIPTION_LIMITS.SUBSCRIBED,
    transactionHash,
    subscribedAt: now.toISOString()
  };

  localStorage.setItem('shadowid-subscription', JSON.stringify(status));
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
  return isActive ? SUBSCRIPTION_LIMITS.SUBSCRIBED : SUBSCRIPTION_LIMITS.FREE;
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
 */
export function getSubscriptionInfo() {
  const status = getSubscriptionStatus();
  const isActive = isSubscriptionActive();

  if (!status.isSubscribed) {
    return {
      status: 'Free Plan',
      maxAttributes: SUBSCRIPTION_LIMITS.FREE,
      remaining: SUBSCRIPTION_LIMITS.FREE,
      cost: SUBSCRIPTION_COST,
      message: `You can activate up to ${SUBSCRIPTION_LIMITS.FREE} attributes. Subscribe for all 8.`,
      isActive: false
    };
  }

  if (isActive) {
    const expiresDate = new Date(status.expiresAt!);
    const daysRemaining = Math.ceil(
      (expiresDate.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)
    );

    return {
      status: 'Subscribed',
      maxAttributes: SUBSCRIPTION_LIMITS.SUBSCRIBED,
      remaining: SUBSCRIPTION_LIMITS.SUBSCRIBED,
      cost: SUBSCRIPTION_COST,
      message: `All 8 attributes unlocked. Subscription expires in ${daysRemaining} days.`,
      isActive: true,
      expiresAt: expiresDate.toLocaleDateString()
    };
  }

  // Subscription expired
  return {
    status: 'Subscription Expired',
    maxAttributes: SUBSCRIPTION_LIMITS.FREE,
    remaining: SUBSCRIPTION_LIMITS.FREE,
    cost: SUBSCRIPTION_COST,
    message: `Your subscription expired. Subscribe again to activate all 8 attributes.`,
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
