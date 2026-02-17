export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'identity' | 'wallet' | 'qrcode' | 'security' | 'settings';
  details: string;
  status: 'success' | 'error' | 'pending';
  metadata?: Record<string, any>;
}

const STORAGE_KEY = 'shadowid-activity-logs';

export function addActivityLog(
  action: string,
  category: ActivityLog['category'],
  details: string,
  status: ActivityLog['status'] = 'success',
  metadata?: Record<string, any>
): ActivityLog {
  const log: ActivityLog = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    category,
    details,
    status,
    metadata,
  };

  const existingLogs = getActivityLogs();
  const updatedLogs = [log, ...existingLogs].slice(0, 500); // Keep last 500 logs
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));

  return log;
}

export function getActivityLogs(): ActivityLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const logs = localStorage.getItem(STORAGE_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('[v0] Failed to parse activity logs:', error);
    return [];
  }
}

export function clearActivityLogs(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getActivityLogsByCategory(category: ActivityLog['category']): ActivityLog[] {
  return getActivityLogs().filter(log => log.category === category);
}

export function getActivityLogsForDateRange(startDate: Date, endDate: Date): ActivityLog[] {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return getActivityLogs().filter(log => {
    const logTime = new Date(log.timestamp).getTime();
    return logTime >= start && logTime <= end;
  });
}
