'use client'

// Admin types and roles
export type MiniAdminType = 'university' | 'governmental' | 'dao' | 'universal'

export interface AdminUser {
  commitmentHash: string
  role: 'global_admin' | 'mini_admin'
  miniAdminType?: MiniAdminType
  organizationName?: string
  organizationId?: string
  permissions: AdminPermission[]
  createdAt: Date
  lastAccessAt: Date
}

export type AdminPermission = 
  | 'flag_account'
  | 'manage_shadow_score'
  | 'verify_credentials'
  | 'suspend_account'
  | 'manage_mini_admins'
  | 'view_audit_logs'
  | 'escalate_issue'
  | 'bulk_approve_credentials'

export interface FlaggedAccount {
  commitmentHash: string
  flaggedBy: string
  reason: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  evidence: string[]
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  createdAt: Date
  resolvedAt?: Date
  resolution?: string
}

export interface AdminAuditLog {
  id: string
  adminCommitment: string
  adminType: string
  action: string
  targetCommitment?: string
  details: Record<string, any>
  timestamp: Date
  ipAddress?: string
}

export interface MiniAdminOrganization {
  id: string
  name: string
  type: MiniAdminType
  adminCommitmentHash: string
  scopedCredentials: string[] // Credential types this org can verify
  approvedUsers: Set<string> // Users verified by this org
  flaggedUsers: Set<string> // Users flagged by this org
  createdAt: Date
  activeUntil: Date
}

export interface CredentialVerification {
  credentialId: string
  userCommitment: string
  organizationId: string
  organizationType: MiniAdminType
  credentialType: string
  status: 'pending' | 'verified' | 'rejected' | 'expired'
  verifiedAt?: Date
  expiresAt: Date
  notes?: string
}

// Admin authentication
const ADMIN_PASSWORD_PREFIX = 'Aleo2Admin'

export function validateAdminAccess(input: string, adminPassword: string): { isValid: boolean; commitmentHash?: string } {
  if (!input.startsWith(ADMIN_PASSWORD_PREFIX)) {
    return { isValid: false }
  }

  const parts = input.split(ADMIN_PASSWORD_PREFIX)
  if (parts.length !== 2 || !parts[1]) {
    return { isValid: false }
  }

  const commitmentHash = parts[1].trim()
  
  // Verify the password
  if (adminPassword !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    return { isValid: false }
  }

  return { isValid: true, commitmentHash }
}

// Local storage helpers for admin session
export function setAdminSession(commitmentHash: string, role: 'global_admin' | 'mini_admin', miniAdminType?: MiniAdminType) {
  if (typeof window !== 'undefined') {
    const sessionData = {
      commitmentHash,
      role,
      miniAdminType,
      loginTime: Date.now(),
      sessionId: Math.random().toString(36).substring(7)
    }
    localStorage.setItem('admin-session', JSON.stringify(sessionData))
  }
}

export function getAdminSession(): { commitmentHash: string; role: string; miniAdminType?: MiniAdminType } | null {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('admin-session')
    if (session) {
      return JSON.parse(session)
    }
  }
  return null
}

export function clearAdminSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin-session')
  }
}

// Admin utilities
export function getAdminPermissions(role: 'global_admin' | 'mini_admin', miniAdminType?: MiniAdminType): AdminPermission[] {
  if (role === 'global_admin') {
    return [
      'flag_account',
      'manage_shadow_score',
      'verify_credentials',
      'suspend_account',
      'manage_mini_admins',
      'view_audit_logs',
      'escalate_issue',
      'bulk_approve_credentials'
    ]
  }

  // Mini-admin permissions based on type
  switch (miniAdminType) {
    case 'universal':
      return ['flag_account', 'verify_credentials', 'view_audit_logs', 'escalate_issue', 'bulk_approve_credentials']
    case 'university':
    case 'governmental':
    case 'dao':
      return ['verify_credentials', 'bulk_approve_credentials', 'flag_account']
    default:
      return []
  }
}

export function logAdminAction(
  adminCommitment: string,
  adminType: string,
  action: string,
  targetCommitment?: string,
  details?: Record<string, any>
) {
  const log: AdminAuditLog = {
    id: Math.random().toString(36).substring(7),
    adminCommitment,
    adminType,
    action,
    targetCommitment,
    details: details || {},
    timestamp: new Date()
  }

  // Store in localStorage (in production, would be sent to backend)
  if (typeof window !== 'undefined') {
    const existingLogs = localStorage.getItem('admin-audit-logs')
    const logs = existingLogs ? JSON.parse(existingLogs) : []
    logs.push(log)
    localStorage.setItem('admin-audit-logs', JSON.stringify(logs.slice(-1000))) // Keep last 1000 logs
  }

  return log
}

export function getAdminAuditLogs(): AdminAuditLog[] {
  if (typeof window !== 'undefined') {
    const logs = localStorage.getItem('admin-audit-logs')
    return logs ? JSON.parse(logs) : []
  }
  return []
}
