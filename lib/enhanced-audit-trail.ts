import { addActivityLog } from './activity-logger'

export interface DisclosureRecord {
  recordId: string
  timestamp: string
  attributes: Array<{
    key: string
    label: string
    disclosed: boolean
  }>
  recipientInfo?: {
    identifierHash: string
    context?: string
  }
  disclosureMethod: 'qr_code' | 'direct_share' | 'api'
  status: 'shared' | 'viewed' | 'verified' | 'expired'
  metadata: {
    userAgent?: string
    ipHash?: string
    deviceId?: string
  }
}

export interface AuditTrail {
  userId: string
  disclosures: DisclosureRecord[]
  totalDisclosures: number
  lastDisclosureAt?: string
}

/**
 * Get the audit trail from encrypted storage
 */
export function getAuditTrail(): AuditTrail {
  try {
    const stored = localStorage.getItem('shadowid-audit-trail')
    if (!stored) {
      return {
        userId: localStorage.getItem('shadowid-user-id') || 'unknown',
        disclosures: [],
        totalDisclosures: 0
      }
    }
    return JSON.parse(stored)
  } catch (err) {
    console.error('[v0] Error reading audit trail:', err)
    return {
      userId: 'unknown',
      disclosures: [],
      totalDisclosures: 0
    }
  }
}

/**
 * Record a disclosure event
 */
export function recordDisclosure(
  attributes: Array<{ key: string; label: string; disclosed: boolean }>,
  method: 'qr_code' | 'direct_share' | 'api' = 'qr_code',
  recipientInfo?: { identifierHash: string; context?: string }
): DisclosureRecord {
  try {
    const trail = getAuditTrail()
    
    const record: DisclosureRecord = {
      recordId: `disclosure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      attributes,
      recipientInfo,
      disclosureMethod: method,
      status: 'shared',
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        deviceId: localStorage.getItem('shadowid-device-id')
      }
    }

    trail.disclosures.push(record)
    trail.totalDisclosures = trail.disclosures.length
    trail.lastDisclosureAt = new Date().toISOString()

    localStorage.setItem('shadowid-audit-trail', JSON.stringify(trail))
    
    const disclosedCount = attributes.filter(a => a.disclosed).length
    addActivityLog(
      'Disclosure Recorded',
      'audit',
      `${disclosedCount} attribute(s) disclosed via ${method}. Record: ${record.recordId}`,
      'info'
    )

    return record
  } catch (err) {
    console.error('[v0] Error recording disclosure:', err)
    throw err
  }
}

/**
 * Get all disclosure records
 */
export function getDisclosureRecords(): DisclosureRecord[] {
  const trail = getAuditTrail()
  return trail.disclosures
}

/**
 * Get disclosures by date range
 */
export function getDisclosuresByDateRange(startDate: Date, endDate: Date): DisclosureRecord[] {
  const trail = getAuditTrail()
  const startTime = startDate.getTime()
  const endTime = endDate.getTime()
  
  return trail.disclosures.filter(d => {
    const disclosureTime = new Date(d.timestamp).getTime()
    return disclosureTime >= startTime && disclosureTime <= endTime
  })
}

/**
 * Get disclosures by disclosure method
 */
export function getDisclosuresByMethod(method: 'qr_code' | 'direct_share' | 'api'): DisclosureRecord[] {
  const trail = getAuditTrail()
  return trail.disclosures.filter(d => d.disclosureMethod === method)
}

/**
 * Get most frequently disclosed attributes
 */
export function getMostDisclosedAttributes(): Array<{ key: string; label: string; count: number }> {
  const trail = getAuditTrail()
  const attributeMap = new Map<string, { label: string; count: number }>()

  trail.disclosures.forEach(disclosure => {
    disclosure.attributes.forEach(attr => {
      if (attr.disclosed) {
        const existing = attributeMap.get(attr.key) || { label: attr.label, count: 0 }
        existing.count += 1
        attributeMap.set(attr.key, existing)
      }
    })
  })

  return Array.from(attributeMap.entries())
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Update disclosure status (e.g., when verified or expired)
 */
export function updateDisclosureStatus(
  recordId: string,
  status: 'shared' | 'viewed' | 'verified' | 'expired'
): void {
  try {
    const trail = getAuditTrail()
    const record = trail.disclosures.find(d => d.recordId === recordId)
    
    if (!record) {
      throw new Error('Disclosure record not found')
    }

    record.status = status
    localStorage.setItem('shadowid-audit-trail', JSON.stringify(trail))
    
    addActivityLog(
      'Disclosure Status Updated',
      'audit',
      `Record ${recordId} status changed to: ${status}`,
      'info'
    )
  } catch (err) {
    console.error('[v0] Error updating disclosure status:', err)
  }
}

/**
 * Delete a disclosure record (user initiated privacy cleanup)
 */
export function deleteDisclosureRecord(recordId: string): void {
  try {
    const trail = getAuditTrail()
    const index = trail.disclosures.findIndex(d => d.recordId === recordId)
    
    if (index === -1) {
      throw new Error('Disclosure record not found')
    }

    const record = trail.disclosures[index]
    trail.disclosures.splice(index, 1)
    trail.totalDisclosures = trail.disclosures.length

    localStorage.setItem('shadowid-audit-trail', JSON.stringify(trail))
    
    addActivityLog(
      'Disclosure Record Deleted',
      'audit',
      `Deleted disclosure record ${recordId} from audit trail`,
      'warning'
    )
  } catch (err) {
    console.error('[v0] Error deleting disclosure record:', err)
  }
}

/**
 * Generate audit report for date range
 */
export function generateAuditReport(startDate: Date, endDate: Date): {
  period: string
  totalDisclosures: number
  methods: Record<string, number>
  mostDisclosed: Array<{ key: string; label: string; count: number }>
  records: DisclosureRecord[]
} {
  const records = getDisclosuresByDateRange(startDate, endDate)
  const mostDisclosed = getMostDisclosedAttributes()
  
  const methods: Record<string, number> = {
    qr_code: 0,
    direct_share: 0,
    api: 0
  }

  records.forEach(r => {
    methods[r.disclosureMethod]++
  })

  return {
    period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    totalDisclosures: records.length,
    methods,
    mostDisclosed: mostDisclosed.slice(0, 5),
    records
  }
}

/**
 * Export audit trail as JSON (for user download)
 */
export function exportAuditTrail(): string {
  const trail = getAuditTrail()
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    userId: trail.userId,
    totalRecords: trail.totalDisclosures,
    data: trail.disclosures
  }, null, 2)
}

/**
 * Clear all audit records (with user confirmation)
 */
export function clearAuditTrail(): void {
  try {
    const trail = getAuditTrail()
    trail.disclosures = []
    trail.totalDisclosures = 0
    delete trail.lastDisclosureAt

    localStorage.setItem('shadowid-audit-trail', JSON.stringify(trail))
    
    addActivityLog(
      'Audit Trail Cleared',
      'security',
      'All disclosure records have been permanently deleted',
      'warning'
    )
  } catch (err) {
    console.error('[v0] Error clearing audit trail:', err)
  }
}

/**
 * Get disclosure statistics
 */
export function getDisclosureStats() {
  const trail = getAuditTrail()
  const records = trail.disclosures
  
  if (records.length === 0) {
    return {
      totalDisclosures: 0,
      averageAttributesPerDisclosure: 0,
      firstDisclosure: null,
      lastDisclosure: null,
      totalAttributesDisclosed: 0
    }
  }

  const totalAttributes = records.reduce((sum, r) => {
    return sum + r.attributes.filter(a => a.disclosed).length
  }, 0)

  return {
    totalDisclosures: records.length,
    averageAttributesPerDisclosure: Math.round((totalAttributes / records.length) * 100) / 100,
    firstDisclosure: records[0].timestamp,
    lastDisclosure: records[records.length - 1].timestamp,
    totalAttributesDisclosed: totalAttributes
  }
}
