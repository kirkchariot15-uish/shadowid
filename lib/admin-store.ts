// Admin data store - manages admin users, flagged accounts, and audit logs
import {
  AdminUser,
  FlaggedAccount,
  AdminAuditLog,
  AdminAction,
  AdminType,
  ADMIN_STORAGE_KEY,
  FLAGGED_ACCOUNTS_KEY,
  ADMIN_AUDIT_LOG_KEY,
  ADMIN_PERMISSIONS,
  ADMIN_PASSWORD_PREFIX,
} from './admin-system';

class AdminStore {
  private adminUsers: Map<string, AdminUser> = new Map();
  private flaggedAccounts: Map<string, FlaggedAccount> = new Map();
  private auditLogs: AdminAuditLog[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    // Load admin users
    const adminData = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (adminData) {
      try {
        const admins = JSON.parse(adminData);
        admins.forEach((admin: AdminUser) => {
          this.adminUsers.set(admin.walletAddress, admin);
        });
      } catch (error) {
        console.error('[v0] Failed to load admin users:', error);
      }
    }

    // Load flagged accounts
    const flaggedData = localStorage.getItem(FLAGGED_ACCOUNTS_KEY);
    if (flaggedData) {
      try {
        const flagged = JSON.parse(flaggedData);
        flagged.forEach((flag: FlaggedAccount) => {
          this.flaggedAccounts.set(flag.id, flag);
        });
      } catch (error) {
        console.error('[v0] Failed to load flagged accounts:', error);
      }
    }

    // Load audit logs
    const auditData = localStorage.getItem(ADMIN_AUDIT_LOG_KEY);
    if (auditData) {
      try {
        this.auditLogs = JSON.parse(auditData);
      } catch (error) {
        console.error('[v0] Failed to load audit logs:', error);
      }
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;

    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(Array.from(this.adminUsers.values())));
    localStorage.setItem(FLAGGED_ACCOUNTS_KEY, JSON.stringify(Array.from(this.flaggedAccounts.values())));
    localStorage.setItem(ADMIN_AUDIT_LOG_KEY, JSON.stringify(this.auditLogs));
  }

  // Check if wallet has admin access with password
  verifyGlobalAdminPassword(commitmentHash: string, password: string): boolean {
    const expectedPassword = `${ADMIN_PASSWORD_PREFIX}${commitmentHash}`;
    return password === expectedPassword;
  }

  // Get admin user by wallet address
  getAdmin(walletAddress: string): AdminUser | undefined {
    return this.adminUsers.get(walletAddress);
  }

  // Check if wallet is an admin (any type)
  isAdmin(walletAddress: string): boolean {
    return this.adminUsers.has(walletAddress);
  }

  // Add a new admin
  addAdmin(walletAddress: string, adminType: AdminType, organization?: string): AdminUser {
    const admin: AdminUser = {
      walletAddress,
      adminType,
      createdAt: Date.now(),
      organization,
      permissions: ADMIN_PERMISSIONS[adminType],
    };

    this.adminUsers.set(walletAddress, admin);
    this.saveToStorage();

    return admin;
  }

  // Remove admin
  removeAdmin(walletAddress: string): boolean {
    const removed = this.adminUsers.delete(walletAddress);
    if (removed) {
      this.saveToStorage();
    }
    return removed;
  }

  // Update admin
  updateAdmin(walletAddress: string, updates: Partial<Omit<AdminUser, 'walletAddress'>>): AdminUser | undefined {
    const admin = this.adminUsers.get(walletAddress);
    if (!admin) return undefined;

    const updated = { ...admin, ...updates };
    this.adminUsers.set(walletAddress, updated);
    this.saveToStorage();

    return updated;
  }

  // Get all admins
  getAllAdmins(): AdminUser[] {
    return Array.from(this.adminUsers.values());
  }

  // Get admins by type
  getAdminsByType(adminType: AdminType): AdminUser[] {
    return Array.from(this.adminUsers.values()).filter((admin) => admin.adminType === adminType);
  }

  // Get admins by organization (for mini-admins)
  getAdminsByOrganization(organization: string): AdminUser[] {
    return Array.from(this.adminUsers.values()).filter((admin) => admin.organization === organization);
  }

  // Flag an account
  flagAccount(
    walletAddress: string,
    reason: string,
    severity: 'low' | 'medium' | 'high',
    flaggedBy: string,
    notes?: string
  ): FlaggedAccount {
    const id = `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const flag: FlaggedAccount = {
      id,
      walletAddress,
      reason,
      severity,
      flaggedBy,
      flaggedAt: Date.now(),
      shadowScoreRemoved: false,
      notes,
      resolved: false,
    };

    this.flaggedAccounts.set(id, flag);
    this.logAuditAction('flag_account', flaggedBy, walletAddress, { reason, severity, notes });
    this.saveToStorage();

    return flag;
  }

  // Remove shadow score from flagged account
  removeShadowScore(flagId: string, removedBy: string): FlaggedAccount | undefined {
    const flag = this.flaggedAccounts.get(flagId);
    if (!flag) return undefined;

    flag.shadowScoreRemoved = true;
    flag.shadowScoreRemovedBy = removedBy;
    flag.shadowScoreRemovedAt = Date.now();

    this.logAuditAction('remove_shadow_score', removedBy, flag.walletAddress, { flagId });
    this.saveToStorage();

    return flag;
  }

  // Get flag by ID
  getFlag(flagId: string): FlaggedAccount | undefined {
    return this.flaggedAccounts.get(flagId);
  }

  // Get all flags for a wallet
  getFlagsForWallet(walletAddress: string): FlaggedAccount[] {
    return Array.from(this.flaggedAccounts.values()).filter(
      (flag) => flag.walletAddress === walletAddress && !flag.resolved
    );
  }

  // Get all flagged accounts
  getAllFlaggedAccounts(): FlaggedAccount[] {
    return Array.from(this.flaggedAccounts.values()).filter((flag) => !flag.resolved);
  }

  // Get resolved flags
  getResolvedFlags(): FlaggedAccount[] {
    return Array.from(this.flaggedAccounts.values()).filter((flag) => flag.resolved);
  }

  // Resolve a flag
  resolveFlag(flagId: string, resolvedBy: string): FlaggedAccount | undefined {
    const flag = this.flaggedAccounts.get(flagId);
    if (!flag) return undefined;

    flag.resolved = true;
    flag.resolvedBy = resolvedBy;
    flag.resolvedAt = Date.now();

    this.logAuditAction('resolve_flag', resolvedBy, flag.walletAddress, { flagId });
    this.saveToStorage();

    return flag;
  }

  // Log audit action
  private logAuditAction(
    action: AdminAction,
    adminWallet: string,
    targetWallet: string,
    details: Record<string, any>
  ) {
    const admin = this.getAdmin(adminWallet);
    if (!admin) return;

    const log: AdminAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      adminWallet,
      adminType: admin.adminType,
      action,
      targetWallet,
      details,
      timestamp: Date.now(),
    };

    this.auditLogs.push(log);
    this.saveToStorage();
  }

  // Get audit logs
  getAuditLogs(limit?: number): AdminAuditLog[] {
    const logs = [...this.auditLogs].reverse();
    return limit ? logs.slice(0, limit) : logs;
  }

  // Get audit logs for admin
  getAuditLogsForAdmin(walletAddress: string, limit?: number): AdminAuditLog[] {
    const logs = this.auditLogs.filter((log) => log.adminWallet === walletAddress).reverse();
    return limit ? logs.slice(0, limit) : logs;
  }

  // Check if account is flagged
  isAccountFlagged(walletAddress: string): boolean {
    return Array.from(this.flaggedAccounts.values()).some(
      (flag) => flag.walletAddress === walletAddress && !flag.resolved
    );
  }

  // Check if shadow score was removed for account
  hasRemovedShadowScore(walletAddress: string): boolean {
    return Array.from(this.flaggedAccounts.values()).some(
      (flag) => flag.walletAddress === walletAddress && flag.shadowScoreRemoved && !flag.resolved
    );
  }
}

// Singleton instance
let adminStore: AdminStore | null = null;

export function getAdminStore(): AdminStore {
  if (adminStore === null) {
    if (typeof window !== 'undefined') {
      adminStore = new AdminStore();
    }
  }
  return adminStore!;
}

export function resetAdminStore() {
  adminStore = null;
}
