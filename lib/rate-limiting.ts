import { addActivityLog } from './activity-logger'

export interface RateLimitConfig {
  qrGenerationPerHour: number
  credentialCreationPerDay: number
  disclosuresPerHour: number
  walletConnectionAttemptsPerHour: number
  sessionRefreshPerHour: number
  customLimits?: Record<string, number>
}

export interface RateLimitEntry {
  action: string
  timestamp: string
  count: number
  hourStart: string
}

export interface RateLimitStatus {
  action: string
  limit: number
  current: number
  remaining: number
  resetTime: string
  isLimited: boolean
}

const DEFAULT_RATE_LIMITS: RateLimitConfig = {
  qrGenerationPerHour: 100,
  credentialCreationPerDay: 10,
  disclosuresPerHour: 50,
  walletConnectionAttemptsPerHour: 10,
  sessionRefreshPerHour: 30
}

/**
 * Get rate limit configuration
 */
export function getRateLimitConfig(): RateLimitConfig {
  try {
    const stored = localStorage.getItem('shadowid-rate-limit-config')
    if (!stored) {
      return DEFAULT_RATE_LIMITS
    }
    return JSON.parse(stored)
  } catch (err) {
    console.error('[v0] Error reading rate limit config:', err)
    return DEFAULT_RATE_LIMITS
  }
}

/**
 * Update rate limit configuration
 */
export function updateRateLimitConfig(config: Partial<RateLimitConfig>): void {
  try {
    const current = getRateLimitConfig()
    const updated = { ...current, ...config }
    localStorage.setItem('shadowid-rate-limit-config', JSON.stringify(updated))
    
    addActivityLog(
      'Rate Limits Updated',
      'settings',
      'Rate limit configuration updated',
      'success'
    )
  } catch (err) {
    console.error('[v0] Error updating rate limit config:', err)
  }
}

/**
 * Check if action is rate limited
 */
export function checkRateLimit(action: string): RateLimitStatus {
  const config = getRateLimitConfig()
  const limit = getActionLimit(action, config)
  const current = getActionCount(action)
  const remaining = Math.max(0, limit - current)
  const isLimited = current >= limit

  const resetTime = calculateResetTime(action)

  if (isLimited) {
    addActivityLog(
      'Rate Limit Exceeded',
      'security',
      `Rate limit exceeded for action: ${action}`,
      'warning'
    )
  }

  return {
    action,
    limit,
    current,
    remaining,
    resetTime,
    isLimited
  }
}

/**
 * Record an action for rate limiting
 */
export function recordAction(action: string): void {
  try {
    const history = getActionHistory()
    const now = new Date()
    const hourStart = getHourStart(now)
    const dayStart = getDayStart(now)

    // Get or create entry
    const key = `${action}_${hourStart}`
    const entry: RateLimitEntry = {
      action,
      timestamp: now.toISOString(),
      count: (history[key]?.count || 0) + 1,
      hourStart
    }

    history[key] = entry
    
    // Clean up old entries (older than 7 days)
    cleanupOldEntries(history)
    
    localStorage.setItem('shadowid-action-history', JSON.stringify(history))
  } catch (err) {
    console.error('[v0] Error recording action:', err)
  }
}

/**
 * Check if action is allowed, then record if not limited
 */
export function isActionAllowed(action: string): boolean {
  const status = checkRateLimit(action)
  
  if (!status.isLimited) {
    recordAction(action)
    return true
  }

  return false
}

/**
 * Get current count for an action within the window
 */
function getActionCount(action: string): number {
  const history = getActionHistory()
  const now = new Date()
  const hourStart = getHourStart(now)
  const dayStart = getDayStart(now)

  if (action === 'credential_creation') {
    // Daily limit
    const dayKey = `${action}_${dayStart}`
    return history[dayKey]?.count || 0
  } else {
    // Hourly limit
    const hourKey = `${action}_${hourStart}`
    return history[hourKey]?.count || 0
  }
}

/**
 * Get action history from storage
 */
function getActionHistory(): Record<string, RateLimitEntry> {
  try {
    const stored = localStorage.getItem('shadowid-action-history')
    if (!stored) return {}
    return JSON.parse(stored)
  } catch (err) {
    console.error('[v0] Error reading action history:', err)
    return {}
  }
}

/**
 * Get action limit from config
 */
function getActionLimit(action: string, config: RateLimitConfig): number {
  switch (action) {
    case 'qr_generation':
      return config.qrGenerationPerHour
    case 'credential_creation':
      return config.credentialCreationPerDay
    case 'disclosure':
      return config.disclosuresPerHour
    case 'wallet_connection':
      return config.walletConnectionAttemptsPerHour
    case 'session_refresh':
      return config.sessionRefreshPerHour
    default:
      return config.customLimits?.[action] || 100
  }
}

/**
 * Calculate reset time for an action
 */
function calculateResetTime(action: string): string {
  const now = new Date()
  
  if (action === 'credential_creation') {
    // Daily reset at midnight
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow.toISOString()
  } else {
    // Hourly reset at the top of next hour
    const nextHour = new Date(now)
    nextHour.setHours(nextHour.getHours() + 1)
    nextHour.setMinutes(0, 0, 0)
    return nextHour.toISOString()
  }
}

/**
 * Get hour start timestamp (YYYY-MM-DD-HH)
 */
function getHourStart(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  return `${year}-${month}-${day}-${hour}`
}

/**
 * Get day start timestamp (YYYY-MM-DD)
 */
function getDayStart(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Clean up old entries from history
 */
function cleanupOldEntries(history: Record<string, RateLimitEntry>): void {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  Object.keys(history).forEach(key => {
    const entry = history[key]
    if (new Date(entry.timestamp) < sevenDaysAgo) {
      delete history[key]
    }
  })
}

/**
 * Get statistics for rate limiting
 */
export function getRateLimitStats(): Record<string, any> {
  const config = getRateLimitConfig()
  const history = getActionHistory()
  const stats: Record<string, any> = {}

  const actions = [
    'qr_generation',
    'credential_creation',
    'disclosure',
    'wallet_connection',
    'session_refresh'
  ]

  actions.forEach(action => {
    const status = checkRateLimit(action)
    stats[action] = {
      limit: status.limit,
      used: status.current,
      remaining: status.remaining,
      percentage: Math.round((status.current / status.limit) * 100),
      resetTime: status.resetTime
    }
  })

  return stats
}

/**
 * Reset rate limits (admin/user initiated)
 */
export function resetRateLimits(): void {
  try {
    localStorage.removeItem('shadowid-action-history')
    addActivityLog(
      'Rate Limits Reset',
      'settings',
      'All rate limit counters have been reset',
      'info'
    )
  } catch (err) {
    console.error('[v0] Error resetting rate limits:', err)
  }
}

/**
 * Get time until rate limit resets (in seconds)
 */
export function getTimeUntilReset(action: string): number {
  const resetTime = new Date(calculateResetTime(action))
  const now = new Date()
  const seconds = Math.floor((resetTime.getTime() - now.getTime()) / 1000)
  return Math.max(0, seconds)
}

/**
 * Format rate limit display message
 */
export function formatRateLimitMessage(status: RateLimitStatus): string {
  if (!status.isLimited) {
    return `${status.remaining} requests remaining`
  }

  const resetDate = new Date(status.resetTime)
  const now = new Date()
  const hoursUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60))

  return `Rate limit exceeded. Try again in ${hoursUntilReset} hour(s)`
}

/**
 * Enable/disable rate limiting globally
 */
export let rateLimitingEnabled = true

export function setRateLimitingEnabled(enabled: boolean): void {
  rateLimitingEnabled = enabled
  addActivityLog(
    'Rate Limiting Status Changed',
    'settings',
    `Rate limiting is now ${enabled ? 'enabled' : 'disabled'}`,
    'warning'
  )
}
