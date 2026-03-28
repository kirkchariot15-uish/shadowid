// Admin system for managing accounts, flags, and admin roles

export type AdminType = 'global' | 'university' | 'government' | 'dao' | 'universal';

export interface AdminUser {
  walletAddress: string;
  adminType: AdminType;
  createdAt: number;
  organization?: string; // For mini-admins: university name, government entity, DAO name, etc.
  permissions: AdminPermission[];
}

export interface FlaggedAccount {
  id: string;
  walletAddress: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  flaggedBy: string; // Admin wallet who flagged
  flaggedAt: number;
  shadowScoreRemoved: boolean;
  shadowScoreRemovedBy?: string;
  shadowScoreRemovedAt?: number;
  notes?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: number;
}

export interface AdminAuditLog {
  id: string;
  adminWallet: string;
  adminType: AdminType;
  action: AdminAction;
  targetWallet: string;
  details: Record<string, any>;
  timestamp: number;
}

export type AdminAction = 
  | 'flag_account' 
  | 'remove_shadow_score' 
  | 'unflag_account' 
  | 'add_mini_admin' 
  | 'remove_mini_admin' 
  | 'update_mini_admin' 
  | 'view_flagged_accounts' 
  | 'resolve_flag';

export type AdminPermission = 
  | 'flag_accounts' 
  | 'remove_shadow_score' 
  | 'manage_mini_admins' 
  | 'view_all_accounts' 
  | 'resolve_flags'
  | 'manage_university_admins'
  | 'manage_government_admins'
  | 'manage_dao_admins';

// Permissions map for each admin type
export const ADMIN_PERMISSIONS: Record<AdminType, AdminPermission[]> = {
  global: [
    'flag_accounts',
    'remove_shadow_score',
    'manage_mini_admins',
    'view_all_accounts',
    'resolve_flags',
    'manage_university_admins',
    'manage_government_admins',
    'manage_dao_admins',
  ],
  universal: [
    'flag_accounts',
    'remove_shadow_score',
    'manage_mini_admins',
    'view_all_accounts',
    'resolve_flags',
    'manage_university_admins',
    'manage_government_admins',
    'manage_dao_admins',
  ],
  university: [
    'flag_accounts',
    'remove_shadow_score',
    'view_all_accounts',
  ],
  government: [
    'flag_accounts',
    'remove_shadow_score',
    'view_all_accounts',
  ],
  dao: [
    'flag_accounts',
    'remove_shadow_score',
    'view_all_accounts',
  ],
};

// Storage key for admin data
export const ADMIN_STORAGE_KEY = 'shadow_admin_system';
export const FLAGGED_ACCOUNTS_KEY = 'shadow_flagged_accounts';
export const ADMIN_AUDIT_LOG_KEY = 'shadow_admin_audit';
export const MINI_ADMINS_KEY = 'shadow_mini_admins';

// Admin password prefix - must be appended to commitment hash
export const ADMIN_PASSWORD_PREFIX = 'Aleo2Admin';

export function hasPermission(admin: AdminUser, permission: AdminPermission): boolean {
  return admin.permissions.includes(permission);
}

export function canManageMiniAdminType(adminType: AdminType, miniAdminType: AdminType): boolean {
  if (adminType === 'global' || adminType === 'universal') {
    return true;
  }
  return false;
}

export function getAdminTypeLabel(adminType: AdminType): string {
  const labels: Record<AdminType, string> = {
    global: 'Global Administrator',
    university: 'University Admin',
    government: 'Government Admin',
    dao: 'DAO Admin',
    universal: 'Universal Administrator',
  };
  return labels[adminType];
}
