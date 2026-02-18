import { addActivityLog } from './activity-logger'

export interface SessionData {
  sessionId: string
  walletAddress: string
  createdAt: string
  lastActivityAt: string
  expiresAt: string
  isActive: boolean
  ipHash?: string
  deviceId?: string
}

export interface SessionConfig {
  inactivityTimeoutMinutes: number
  maxSessionDurationHours: number
  trackActivity: boolean
}

const DEFAULT_INACTIVITY_TIMEOUT = 30 // minutes
const DEFAULT_MAX_SESSION_DURATION = 24 // hours

/**
 * Get current session configuration
 */
export function getSessionConfig(): SessionConfig {
  try {
    const stored = localStorage.getItem('shadowid-session-config')
    if (!stored) {
      return {
        inactivityTimeoutMinutes: DEFAULT_INACTIVITY_TIMEOUT,
        maxSessionDurationHours: DEFAULT_MAX_SESSION_DURATION,
        trackActivity: true
      }
    }
    return JSON.parse(stored)
  } catch (err) {
    console.error('[v0] Error reading session config:', err)
    return {
      inactivityTimeoutMinutes: DEFAULT_INACTIVITY_TIMEOUT,
      maxSessionDurationHours: DEFAULT_MAX_SESSION_DURATION,
      trackActivity: true
    }
  }
}

/**
 * Create a new session
 */
export function createSession(walletAddress: string): SessionData {
  try {
    const config = getSessionConfig()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + config.maxSessionDurationHours * 60 * 60 * 1000)

    const session: SessionData = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      walletAddress,
      createdAt: now.toISOString(),
      lastActivityAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive: true,
      deviceId: generateDeviceId()
    }

    localStorage.setItem('shadowid-current-session', JSON.stringify(session))
    
    addActivityLog(
      'Session Created',
      'session',
      `New session created for wallet: ${walletAddress.slice(0, 8)}...`,
      'info'
    )

    return session
  } catch (err) {
    console.error('[v0] Error creating session:', err)
    throw err
  }
}

/**
 * Get current active session
 */
export function getCurrentSession(): SessionData | null {
  try {
    const stored = localStorage.getItem('shadowid-current-session')
    if (!stored) return null

    const session = JSON.parse(stored) as SessionData
    
    // Check if session has expired
    if (new Date() > new Date(session.expiresAt)) {
      endSession(session.sessionId)
      return null
    }

    // Check inactivity timeout
    if (isSessionInactive(session)) {
      endSession(session.sessionId)
      addActivityLog(
        'Session Expired',
        'session',
        'Session ended due to inactivity',
        'warning'
      )
      return null
    }

    return session
  } catch (err) {
    console.error('[v0] Error getting current session:', err)
    return null
  }
}

/**
 * Check if session is inactive
 */
function isSessionInactive(session: SessionData): boolean {
  const config = getSessionConfig()
  const lastActivity = new Date(session.lastActivityAt)
  const now = new Date()
  const minutesInactive = (now.getTime() - lastActivity.getTime()) / (1000 * 60)
  
  return minutesInactive > config.inactivityTimeoutMinutes
}

/**
 * Update session activity timestamp
 */
export function updateSessionActivity(): void {
  try {
    const session = getCurrentSession()
    if (!session) return

    session.lastActivityAt = new Date().toISOString()
    localStorage.setItem('shadowid-current-session', JSON.stringify(session))
  } catch (err) {
    console.error('[v0] Error updating session activity:', err)
  }
}

/**
 * End current session
 */
export function endSession(sessionId?: string): void {
  try {
    const session = getCurrentSession()
    if (!session) return

    if (sessionId && session.sessionId !== sessionId) {
      return
    }

    session.isActive = false
    localStorage.setItem('shadowid-current-session', JSON.stringify(session))
    
    addActivityLog(
      'Session Ended',
      'session',
      `Session ${session.sessionId.slice(0, 12)}... ended`,
      'info'
    )
  } catch (err) {
    console.error('[v0] Error ending session:', err)
  }
}

/**
 * Force logout (end session and clear identity data)
 */
export function forceLogout(reason: string = 'User initiated logout'): void {
  try {
    const session = getCurrentSession()
    if (session) {
      endSession(session.sessionId)
    }

    // Keep audit trail but clear sensitive data
    localStorage.removeItem('shadowid-current-session')
    
    addActivityLog(
      'Force Logout',
      'session',
      reason,
      'warning'
    )
  } catch (err) {
    console.error('[v0] Error forcing logout:', err)
  }
}

/**
 * Get session duration (in minutes)
 */
export function getSessionDuration(session: SessionData): number {
  const created = new Date(session.createdAt)
  const now = new Date()
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60))
}

/**
 * Get time remaining in session (in minutes)
 */
export function getSessionTimeRemaining(session: SessionData): number {
  const expiresAt = new Date(session.expiresAt)
  const now = new Date()
  const remaining = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60))
  return Math.max(0, remaining)
}

/**
 * Get inactivity time remaining (in minutes)
 */
export function getInactivityTimeRemaining(session: SessionData): number {
  const config = getSessionConfig()
  const lastActivity = new Date(session.lastActivityAt)
  const now = new Date()
  const minutesInactive = (now.getTime() - lastActivity.getTime()) / (1000 * 60)
  const remaining = config.inactivityTimeoutMinutes - minutesInactive
  
  return Math.max(0, Math.floor(remaining))
}

/**
 * Refresh session expiration
 */
export function refreshSessionExpiration(): SessionData | null {
  try {
    const session = getCurrentSession()
    if (!session) return null

    const config = getSessionConfig()
    const now = new Date()
    const newExpiry = new Date(now.getTime() + config.maxSessionDurationHours * 60 * 60 * 1000)
    
    session.expiresAt = newExpiry.toISOString()
    session.lastActivityAt = now.toISOString()

    localStorage.setItem('shadowid-current-session', JSON.stringify(session))
    
    addActivityLog(
      'Session Refreshed',
      'session',
      'Session expiration extended',
      'info'
    )

    return session
  } catch (err) {
    console.error('[v0] Error refreshing session:', err)
    return null
  }
}

/**
 * Set custom inactivity timeout (in minutes)
 */
export function setInactivityTimeout(minutes: number): void {
  if (minutes < 5 || minutes > 480) {
    throw new Error('Inactivity timeout must be between 5 and 480 minutes')
  }

  const config = getSessionConfig()
  config.inactivityTimeoutMinutes = minutes
  localStorage.setItem('shadowid-session-config', JSON.stringify(config))
  
  addActivityLog(
    'Inactivity Timeout Updated',
    'settings',
    `Inactivity timeout set to ${minutes} minutes`,
    'success'
  )
}

/**
 * Generate or retrieve device ID
 */
function generateDeviceId(): string {
  let deviceId = localStorage.getItem('shadowid-device-id')
  
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('shadowid-device-id', deviceId)
  }

  return deviceId
}

/**
 * Check if user is authenticated (has active session)
 */
export function isAuthenticated(): boolean {
  const session = getCurrentSession()
  return session !== null && session.isActive
}

/**
 * Get session summary for display
 */
export function getSessionSummary(): {
  isActive: boolean
  sessionDuration: number
  timeRemaining: number
  inactivityWarning: boolean
} | null {
  const session = getCurrentSession()
  if (!session) return null

  const inactivityRemaining = getInactivityTimeRemaining(session)
  
  return {
    isActive: session.isActive,
    sessionDuration: getSessionDuration(session),
    timeRemaining: getSessionTimeRemaining(session),
    inactivityWarning: inactivityRemaining < 5 // Warn if less than 5 minutes
  }
}
