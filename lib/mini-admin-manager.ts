// Mini-admin manager for handling organization-specific admins
import { AdminType } from './admin-system';
import { getAdminStore } from './admin-store';

export interface MiniAdminOrganization {
  id: string;
  name: string;
  type: 'university' | 'government' | 'dao';
  adminWallet: string;
  createdAt: number;
  isActive: boolean;
}

export interface MiniAdminVerification {
  id: string;
  userWallet: string;
  organizationId: string;
  organizationType: 'university' | 'government' | 'dao';
  organizationName: string;
  credentialClaimed: string;
  verifiedBy?: string;
  verifiedAt?: number;
  isVerified: boolean;
  createdAt: number;
}

const MINI_ADMIN_ORGS_KEY = 'shadow_mini_admin_orgs';
const MINI_ADMIN_VERIFICATIONS_KEY = 'shadow_mini_admin_verifications';

class MiniAdminManager {
  private organizations: Map<string, MiniAdminOrganization> = new Map();
  private verifications: Map<string, MiniAdminVerification> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    // Load organizations
    const orgsData = localStorage.getItem(MINI_ADMIN_ORGS_KEY);
    if (orgsData) {
      try {
        const orgs = JSON.parse(orgsData);
        orgs.forEach((org: MiniAdminOrganization) => {
          this.organizations.set(org.id, org);
        });
      } catch (error) {
        console.error('[v0] Failed to load mini-admin organizations:', error);
      }
    }

    // Load verifications
    const verificationsData = localStorage.getItem(MINI_ADMIN_VERIFICATIONS_KEY);
    if (verificationsData) {
      try {
        const verifications = JSON.parse(verificationsData);
        verifications.forEach((verification: MiniAdminVerification) => {
          this.verifications.set(verification.id, verification);
        });
      } catch (error) {
        console.error('[v0] Failed to load mini-admin verifications:', error);
      }
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;

    localStorage.setItem(
      MINI_ADMIN_ORGS_KEY,
      JSON.stringify(Array.from(this.organizations.values()))
    );
    localStorage.setItem(
      MINI_ADMIN_VERIFICATIONS_KEY,
      JSON.stringify(Array.from(this.verifications.values()))
    );
  }

  // Create a new mini-admin organization
  createOrganization(
    name: string,
    type: 'university' | 'government' | 'dao',
    adminWallet: string
  ): MiniAdminOrganization {
    const id = `org_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const org: MiniAdminOrganization = {
      id,
      name,
      type,
      adminWallet,
      createdAt: Date.now(),
      isActive: true,
    };

    this.organizations.set(id, org);

    // Add the admin to the admin store
    const adminStore = getAdminStore();
    adminStore.addAdmin(adminWallet, type, name);

    this.saveToStorage();
    return org;
  }

  // Get organization by ID
  getOrganization(id: string): MiniAdminOrganization | undefined {
    return this.organizations.get(id);
  }

  // Get all organizations
  getAllOrganizations(): MiniAdminOrganization[] {
    return Array.from(this.organizations.values());
  }

  // Get active organizations
  getActiveOrganizations(): MiniAdminOrganization[] {
    return Array.from(this.organizations.values()).filter((org) => org.isActive);
  }

  // Get organizations by type
  getOrganizationsByType(type: 'university' | 'government' | 'dao'): MiniAdminOrganization[] {
    return Array.from(this.organizations.values()).filter(
      (org) => org.type === type && org.isActive
    );
  }

  // Deactivate organization
  deactivateOrganization(id: string): MiniAdminOrganization | undefined {
    const org = this.organizations.get(id);
    if (!org) return undefined;

    org.isActive = false;
    this.saveToStorage();
    return org;
  }

  // Activate organization
  activateOrganization(id: string): MiniAdminOrganization | undefined {
    const org = this.organizations.get(id);
    if (!org) return undefined;

    org.isActive = true;
    this.saveToStorage();
    return org;
  }

  // Create verification request
  createVerification(
    userWallet: string,
    organizationId: string,
    credentialClaimed: string
  ): MiniAdminVerification | null {
    const org = this.organizations.get(organizationId);
    if (!org) return null;

    const id = `verif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const verification: MiniAdminVerification = {
      id,
      userWallet,
      organizationId,
      organizationType: org.type,
      organizationName: org.name,
      credentialClaimed,
      isVerified: false,
      createdAt: Date.now(),
    };

    this.verifications.set(id, verification);
    this.saveToStorage();
    return verification;
  }

  // Get verification by ID
  getVerification(id: string): MiniAdminVerification | undefined {
    return this.verifications.get(id);
  }

  // Get all verifications for organization
  getVerificationsForOrganization(organizationId: string): MiniAdminVerification[] {
    return Array.from(this.verifications.values()).filter(
      (v) => v.organizationId === organizationId
    );
  }

  // Get pending verifications for organization
  getPendingVerifications(organizationId: string): MiniAdminVerification[] {
    return Array.from(this.verifications.values()).filter(
      (v) => v.organizationId === organizationId && !v.isVerified
    );
  }

  // Get verifications for user
  getVerificationsForUser(userWallet: string): MiniAdminVerification[] {
    return Array.from(this.verifications.values()).filter((v) => v.userWallet === userWallet);
  }

  // Approve verification
  approveVerification(id: string, approvedBy: string): MiniAdminVerification | undefined {
    const verification = this.verifications.get(id);
    if (!verification) return undefined;

    verification.isVerified = true;
    verification.verifiedBy = approvedBy;
    verification.verifiedAt = Date.now();

    this.saveToStorage();
    return verification;
  }

  // Reject verification (delete it)
  rejectVerification(id: string): boolean {
    return this.verifications.delete(id);
  }

  // Check if user is verified for organization
  isUserVerifiedForOrganization(
    userWallet: string,
    organizationId: string
  ): boolean {
    return Array.from(this.verifications.values()).some(
      (v) => v.userWallet === userWallet && v.organizationId === organizationId && v.isVerified
    );
  }

  // Get all verified users for organization
  getVerifiedUsersForOrganization(organizationId: string): MiniAdminVerification[] {
    return Array.from(this.verifications.values()).filter(
      (v) => v.organizationId === organizationId && v.isVerified
    );
  }
}

// Singleton instance
let miniAdminManager: MiniAdminManager | null = null;

export function getMiniAdminManager(): MiniAdminManager {
  if (miniAdminManager === null) {
    if (typeof window !== 'undefined') {
      miniAdminManager = new MiniAdminManager();
    }
  }
  return miniAdminManager!;
}

export function resetMiniAdminManager() {
  miniAdminManager = null;
}
