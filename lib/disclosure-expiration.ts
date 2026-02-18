import { addActivityLog } from './activity-logger'

export interface DisclosureExpiration {
  disclosureId: string
  createdAt: string
  expiresAt: string
  attributes: string[]
  expirationReason?: string
}

export interface DisclosureExpirationConfig {
  defaultExpirationHours: number
  customExpirations: DisclosureExpiration[]
}

/**
 * Get default expiration config
 */
export function getExpirationConfig(): DisclosureExpirationConfig {
  try {
    const stored = localStorage.getItem('shadowid-disclosure-expiration-config')
    if (!stored) {
      return {
        defaultExpirationHours: 72, // 3 days by default
        customExpirations: []
      }
    }
    return JSON.parse(stored)
  } catch (err) {
    console.error('[v0] Error reading expiration config:', err)
    return {
      defaultExpirationHours: 72,
      customExpirations: []
    }
  }
}

/**
 * Set default expiration duration (in hours)
 */
export function setDefaultExpirationHours(hours: number): void {
  if (hours < 1 || hours > 720) { // 1 hour to 30 days max
    throw new Error('Expiration must be between 1 and 720 hours')
  }

  const config = getExpirationConfig()
  config.defaultExpirationHours = hours
  localStorage.setItem('shadowid-disclosure-expiration-config', JSON.stringify(config))
  
  addActivityLog(
    'Expiration Duration Updated',
    'settings',
    `Default disclosure expiration set to ${hours} hours`,
    'success'
  )
}

/**
 * Create a disclosure with expiration
 */
export function createExpiringDisclosure(
  attributes: string[],
  expirationHours?: number
): DisclosureExpiration {
  const config = getExpirationConfig()
  const hoursToExpire = expirationHours || config.defaultExpirationHours
  
  const now = new Date()
  const expiresAt = new Date(now.getTime() + hoursToExpire * 60 * 60 * 1000)
  
  const disclosure: DisclosureExpiration = {
    disclosureId: `disclosure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    attributes
  }

  config.customExpirations.push(disclosure)
  localStorage.setItem('shadowid-disclosure-expiration-config', JSON.stringify(config))
  
  addActivityLog(
    'Expiring Disclosure Created',
    'disclosure',
    `Disclosure created with ${hoursToExpire}h expiration. ID: ${disclosure.disclosureId}`,
    'success'
  )

  return disclosure
}

/**
 * Check if a disclosure has expired
 */
export function isDisclosureExpired(disclosureId: string): boolean {
  const config = getExpirationConfig()
  const disclosure = config.customExpirations.find(d => d.disclosureId === disclosureId)
  
  if (!disclosure) return false
  
  return new Date() > new Date(disclosure.expiresAt)
}

/**
 * Get time remaining for a disclosure (in minutes)
 */
export function getTimeRemaining(disclosureId: string): number | null {
  const config = getExpirationConfig()
  const disclosure = config.customExpirations.find(d => d.disclosureId === disclosureId)
  
  if (!disclosure) return null
  
  const expiresAt = new Date(disclosure.expiresAt)
  const now = new Date()
  const diffMs = expiresAt.getTime() - now.getTime()
  
  return Math.floor(diffMs / 60000) // Convert to minutes
}

/**
 * Extend expiration of a disclosure
 */
export function extendDisclosureExpiration(disclosureId: string, additionalHours: number): void {
  const config = getExpirationConfig()
  const disclosure = config.customExpirations.find(d => d.disclosureId === disclosureId)
  
  if (!disclosure) {
    throw new Error('Disclosure not found')
  }

  const currentExpiry = new Date(disclosure.expiresAt)
  const newExpiry = new Date(currentExpiry.getTime() + additionalHours * 60 * 60 * 1000)
  
  disclosure.expiresAt = newExpiry.toISOString()
  localStorage.setItem('shadowid-disclosure-expiration-config', JSON.stringify(config))
  
  addActivityLog(
    'Disclosure Extended',
    'disclosure',
    `Disclosure ${disclosureId} extended by ${additionalHours} hours`,
    'success'
  )
}

/**
 * Get all active (non-expired) disclosures
 */
export function getActiveDisclosures(): DisclosureExpiration[] {
  const config = getExpirationConfig()
  return config.customExpirations.filter(d => !isDisclosureExpired(d.disclosureId))
}

/**
 * Get all expired disclosures
 */
export function getExpiredDisclosures(): DisclosureExpiration[] {
  const config = getExpirationConfig()
  return config.customExpirations.filter(d => isDisclosureExpired(d.disclosureId))
}

/**
 * Delete an expired disclosure from records
 */
export function deleteExpiredDisclosure(disclosureId: string): void {
  const config = getExpirationConfig()
  const index = config.customExpirations.findIndex(d => d.disclosureId === disclosureId)
  
  if (index === -1) {
    throw new Error('Disclosure not found')
  }

  config.customExpirations.splice(index, 1)
  localStorage.setItem('shadowid-disclosure-expiration-config', JSON.stringify(config))
  
  addActivityLog(
    'Expired Disclosure Deleted',
    'disclosure',
    `Disclosure ${disclosureId} removed from records`,
    'success'
  )
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(minutes: number): string {
  if (minutes < 0) return 'Expired'
  if (minutes < 60) return `${minutes}m left`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h left`
  return `${Math.floor(minutes / 1440)}d left`
}

/**
 * Add expiration timestamp to QR code data
 */
export function addExpirationToQRData(qrData: any, expirationHours?: number): any {
  const config = getExpirationConfig()
  const hoursToExpire = expirationHours || config.defaultExpirationHours
  
  const now = new Date()
  const expiresAt = new Date(now.getTime() + hoursToExpire * 60 * 60 * 1000)
  
  return {
    ...qrData,
    disclosureExpiration: {
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      validForHours: hoursToExpire
    }
  }
}
