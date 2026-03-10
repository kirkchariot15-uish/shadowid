/**
 * Anti-Sybil Attack Prevention
 * Prevents users from creating multiple identities and self-endorsing
 */

/**
 * Check if user is trying to self-endorse
 * @param userCommitment - User's own commitment hash
 * @param targetCommitment - Commitment being endorsed
 * @returns true if attempting self-endorsement
 */
export function isSelfEndorsement(userCommitment: string, targetCommitment: string): boolean {
  return userCommitment.toLowerCase() === targetCommitment.toLowerCase();
}

/**
 * Validate endorsement attempt
 * @param userAddress - User's wallet address
 * @param targetCommitment - Target commitment to endorse
 * @param userCommitment - User's own commitment
 * @returns Error message if invalid, null if valid
 */
export function validateEndorsementAttempt(
  userAddress: string,
  targetCommitment: string,
  userCommitment: string | null
): string | null {
  // Check if user has created an identity first
  if (!userCommitment) {
    return 'You must create a ShadowID before endorsing peers';
  }

  // Prevent self-endorsement
  if (isSelfEndorsement(userCommitment, targetCommitment)) {
    return 'You cannot endorse your own attributes';
  }

  // Validate commitment format (should be valid field hash)
  if (!isValidCommitmentFormat(targetCommitment)) {
    return 'Invalid commitment hash format';
  }

  // Check for mutual endorsement (collusion detection)
  const mutualCheck = checkMutualEndorsement(userCommitment, targetCommitment);
  if (mutualCheck.isMutual && mutualCheck.riskLevel === 'high') {
    return 'Cannot endorse: mutual endorsement pattern detected (sybil risk)';
  }

  return null;
}

/**
 * Check if commitment format is valid (16 hex chars = 8 bytes)
 */
function isValidCommitmentFormat(commitment: string): boolean {
  // Check if it's a valid hex string of appropriate length
  const hexPattern = /^[0-9A-Fa-f]+$/;
  return hexPattern.test(commitment) && commitment.length >= 16;
}

  // Prevent self-endorsement
  if (isSelfEndorsement(userCommitment, targetCommitment)) {
    return 'You cannot endorse your own attributes';
  }

  // Validate commitment format (should be valid field hash)
  if (!isValidCommitmentFormat(targetCommitment)) {
    return 'Invalid commitment hash format';
  }

  return null;
}

/**
 * Detect mutual endorsement (collusion)
 * Tracks if commitment A endorsed commitment B, and B endorsed A
 * This helps identify sybil pairs artificially inflating scores
 */
export function checkMutualEndorsement(
  userCommitment: string,
  targetCommitment: string
): { isMutual: boolean; riskLevel: 'high' | 'medium' | 'low' } {
  try {
    const key1 = `shadowid-endorsement-${userCommitment}-${targetCommitment}`;
    const key2 = `shadowid-endorsement-${targetCommitment}-${userCommitment}`;

    const userEndorsedTarget = localStorage.getItem(key1);
    const targetEndorsedUser = localStorage.getItem(key2);

    if (userEndorsedTarget && targetEndorsedUser) {
      // Both directions endorsed - high risk of collusion
      return { isMutual: true, riskLevel: 'high' };
    }

    return { isMutual: false, riskLevel: 'low' };
  } catch (error) {
    console.error('[v0] Error checking mutual endorsement:', error);
    return { isMutual: false, riskLevel: 'low' };
  }
}

/**
 * Track endorsement for both directions
 */
export function trackEndorsement(
  userCommitment: string,
  targetCommitment: string
): void {
  try {
    const key = `shadowid-endorsement-${userCommitment}-${targetCommitment}`;
    const timestamp = Date.now();
    localStorage.setItem(key, JSON.stringify({ timestamp, endorsed: true }));
  } catch (error) {
    console.error('[v0] Error tracking endorsement:', error);
  }
}

/**
 * Rate limit endorsements per commitment (prevent spam)
 * @param targetCommitment - The commitment being endorsed
 * @param maxPerDay - Max endorsements allowed per day
 * @returns true if under rate limit
 */
export function checkRateLimit(
  targetCommitment: string,
  maxPerDay: number = 10
): boolean {
  const storageKey = `shadowid-endorsement-rate-${targetCommitment}`;
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      localStorage.setItem(storageKey, JSON.stringify({ count: 1, timestamp: now }));
      return true;
    }

    const data = JSON.parse(stored);
    const isNewDay = now - data.timestamp > dayInMs;

    if (isNewDay) {
      // Reset counter for new day
      localStorage.setItem(storageKey, JSON.stringify({ count: 1, timestamp: now }));
      return true;
    }

    if (data.count >= maxPerDay) {
      return false;
    }

    // Increment counter
    data.count += 1;
    localStorage.setItem(storageKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('[v0] Error checking rate limit:', error);
    return true; // Allow on error
  }
}

/**
 * Track account creation to prevent rapid multi-account creation
 */
export function trackAccountCreation(): void {
  const storageKey = 'shadowid-account-creation-times';
  const now = Date.now();

  try {
    const stored = localStorage.getItem(storageKey);
    let times: number[] = stored ? JSON.parse(stored) : [];

    // Remove timestamps older than 1 hour
    const oneHourAgo = now - 60 * 60 * 1000;
    times = times.filter(t => t > oneHourAgo);

    times.push(now);
    localStorage.setItem(storageKey, JSON.stringify(times));
  } catch (error) {
    console.error('[v0] Error tracking account creation:', error);
  }
}

/**
 * Check if user is creating accounts too frequently
 * @returns Error message if rate limited, null if allowed
 */
export function checkAccountCreationRateLimit(): string | null {
  const storageKey = 'shadowid-account-creation-times';
  const maxAccountsPerHour = 3;

  try {
    const stored = localStorage.getItem(storageKey);
    const times: number[] = stored ? JSON.parse(stored) : [];

    if (times.length >= maxAccountsPerHour) {
      return `Too many accounts created. Maximum ${maxAccountsPerHour} per hour. Try again later.`;
    }

    return null;
  } catch (error) {
    console.error('[v0] Error checking account rate limit:', error);
    return null; // Allow on error
  }
}
