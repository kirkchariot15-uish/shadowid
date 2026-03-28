'use client'

// Account moderation and shadow score system
export interface UserAccount {
  commitmentHash: string
  createdAt: Date
  shadowScore: number
  status: 'active' | 'suspended' | 'flagged' | 'under_review'
  flags: AccountFlag[]
  suspensionReason?: string
  suspendedUntil?: Date
}

export interface AccountFlag {
  id: string
  reason: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  flaggedBy: string
  flaggedAt: Date
  evidence: string[]
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  adminNotes?: string
  resolvedAt?: Date
  resolution?: string
}

export interface ShadowScoreBreakdown {
  baseScore: number
  attestationBonus: number
  flagPenalty: number
  suspensionPenalty: number
  finalScore: number
  lastUpdated: Date
}

// Shadow Score System
export function calculateShadowScore(account: UserAccount): ShadowScoreBreakdown {
  const baseScore = 100
  
  // Count attestations (each adds 2 points, max 30)
  const attestations = parseInt(localStorage.getItem(`attestations-${account.commitmentHash}`) || '0')
  const attestationBonus = Math.min(attestations * 2, 30)
  
  // Count critical flags (each removes 15 points)
  const criticalFlags = account.flags.filter(f => f.severity === 'critical' && f.status !== 'dismissed').length
  // Count high flags (each removes 8 points)
  const highFlags = account.flags.filter(f => f.severity === 'high' && f.status !== 'dismissed').length
  // Count medium flags (each removes 3 points)
  const mediumFlags = account.flags.filter(f => f.severity === 'medium' && f.status !== 'dismissed').length
  
  const flagPenalty = (criticalFlags * 15) + (highFlags * 8) + (mediumFlags * 3)
  
  // Suspension penalty
  const suspensionPenalty = account.status === 'suspended' ? 50 : 0
  
  const finalScore = Math.max(0, baseScore + attestationBonus - flagPenalty - suspensionPenalty)
  
  return {
    baseScore,
    attestationBonus,
    flagPenalty,
    suspensionPenalty,
    finalScore,
    lastUpdated: new Date(),
  }
}

export function getAccountStatus(account: UserAccount): { status: string; color: string; description: string } {
  const breakdown = calculateShadowScore(account)
  
  if (account.status === 'suspended') {
    return {
      status: 'Suspended',
      color: 'text-red-500',
      description: `Account suspended. Score: ${breakdown.finalScore}`
    }
  }
  
  if (breakdown.finalScore >= 80) {
    return {
      status: 'Excellent',
      color: 'text-green-500',
      description: 'High reputation with minimal flags'
    }
  }
  
  if (breakdown.finalScore >= 60) {
    return {
      status: 'Good',
      color: 'text-blue-500',
      description: 'Solid reputation, some minor issues'
    }
  }
  
  if (breakdown.finalScore >= 40) {
    return {
      status: 'Caution',
      color: 'text-yellow-500',
      description: 'Multiple flags detected, under review'
    }
  }
  
  return {
    status: 'At Risk',
    color: 'text-orange-500',
    description: 'Critical issues detected'
  }
}

export function suspendAccount(
  commitmentHash: string,
  reason: string,
  durationHours: number = 24
): UserAccount {
  const stored = localStorage.getItem(`account-${commitmentHash}`)
  const account = stored ? JSON.parse(stored) : {
    commitmentHash,
    createdAt: new Date(),
    shadowScore: 100,
    status: 'active',
    flags: [],
  }
  
  const suspendedUntil = new Date()
  suspendedUntil.setHours(suspendedUntil.getHours() + durationHours)
  
  account.status = 'suspended'
  account.suspensionReason = reason
  account.suspendedUntil = suspendedUntil.toISOString()
  
  localStorage.setItem(`account-${commitmentHash}`, JSON.stringify(account))
  
  return account
}

export function unsuspendAccount(commitmentHash: string): UserAccount {
  const stored = localStorage.getItem(`account-${commitmentHash}`)
  const account = stored ? JSON.parse(stored) : {
    commitmentHash,
    createdAt: new Date(),
    shadowScore: 100,
    status: 'active',
    flags: [],
  }
  
  account.status = 'active'
  account.suspensionReason = undefined
  account.suspendedUntil = undefined
  
  localStorage.setItem(`account-${commitmentHash}`, JSON.stringify(account))
  
  return account
}

export function flagAccount(
  commitmentHash: string,
  reason: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  flaggedBy: string,
  evidence: string[] = []
): AccountFlag {
  const stored = localStorage.getItem(`account-${commitmentHash}`)
  const account = stored ? JSON.parse(stored) : {
    commitmentHash,
    createdAt: new Date(),
    shadowScore: 100,
    status: 'active',
    flags: [],
  }
  
  const newFlag: AccountFlag = {
    id: Math.random().toString(36).substring(7),
    reason,
    severity,
    flaggedBy,
    flaggedAt: new Date(),
    evidence,
    status: 'pending',
  }
  
  if (!account.flags) account.flags = []
  account.flags.push(newFlag)
  
  // Update account status if critical severity
  if (severity === 'critical') {
    account.status = 'under_review'
  }
  
  localStorage.setItem(`account-${commitmentHash}`, JSON.stringify(account))
  
  return newFlag
}

export function resolveFlag(
  commitmentHash: string,
  flagId: string,
  resolution: string,
  adminNotes: string
): AccountFlag | null {
  const stored = localStorage.getItem(`account-${commitmentHash}`)
  if (!stored) return null
  
  const account = JSON.parse(stored)
  const flag = account.flags?.find(f => f.id === flagId)
  
  if (!flag) return null
  
  flag.status = 'resolved'
  flag.resolvedAt = new Date().toISOString()
  flag.resolution = resolution
  flag.adminNotes = adminNotes
  
  localStorage.setItem(`account-${commitmentHash}`, JSON.stringify(account))
  
  return flag
}

export function dismissFlag(commitmentHash: string, flagId: string): AccountFlag | null {
  const stored = localStorage.getItem(`account-${commitmentHash}`)
  if (!stored) return null
  
  const account = JSON.parse(stored)
  const flag = account.flags?.find(f => f.id === flagId)
  
  if (!flag) return null
  
  flag.status = 'dismissed'
  
  localStorage.setItem(`account-${commitmentHash}`, JSON.stringify(account))
  
  return flag
}

export function getAccountByCommitment(commitmentHash: string): UserAccount | null {
  const stored = localStorage.getItem(`account-${commitmentHash}`)
  if (!stored) {
    // Create new account if doesn't exist
    const newAccount: UserAccount = {
      commitmentHash,
      createdAt: new Date(),
      shadowScore: 100,
      status: 'active',
      flags: [],
    }
    localStorage.setItem(`account-${commitmentHash}`, JSON.stringify(newAccount))
    return newAccount
  }
  
  return JSON.parse(stored)
}

export function getAllFlaggedAccounts(): UserAccount[] {
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith('account-'))
  return allKeys
    .map(key => {
      const account = JSON.parse(localStorage.getItem(key) || '{}')
      return account
    })
    .filter(acc => acc.flags && acc.flags.length > 0)
}

export function getMostFlaggedAccounts(limit: number = 10): UserAccount[] {
  return getAllFlaggedAccounts()
    .sort((a, b) => (b.flags?.length || 0) - (a.flags?.length || 0))
    .slice(0, limit)
}
