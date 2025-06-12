import { useState, useEffect, useCallback } from 'react';

import { debugLog } from '../utils/auditLogger';

// Define the complete user type hierarchy
export enum UserRole {
  // Borrower roles
  BORROWER = 'borrower',
  BORROWER_OWNER = 'borrower-owner',
  BORROWER_CFO = 'borrower-cfo',
  BORROWER_CONTROLLER = 'borrower-controller',
  BORROWER_ACCOUNTING = 'borrower-accounting',
  BORROWER_OPERATIONS = 'borrower-operations',
  BORROWER_ADMIN = 'borrower-admin',

  // Vendor roles
  VENDOR = 'vendor',
  VENDOR_OWNER = 'vendor-owner',
  VENDOR_SALES_DIRECTOR = 'vendor-sales-director',
  VENDOR_SALES_MANAGER = 'vendor-sales-manager',
  VENDOR_SENIOR_SALES = 'vendor-senior-sales',
  VENDOR_JUNIOR_SALES = 'vendor-junior-sales',
  VENDOR_SUPPORT = 'vendor-support',

  // Lender roles
  LENDER = 'lender',
  LENDER_CCO = 'lender-cco',
  LENDER_SENIOR_UNDERWRITER = 'lender-senior-underwriter',
  LENDER_UNDERWRITER = 'lender-underwriter',
  LENDER_PROCESSOR = 'lender-processor',
  LENDER_CSR = 'lender-csr',
  LENDER_ADMIN = 'lender-admin',

  // Broker roles
  BROKER = 'broker',
  BROKER_PRINCIPAL = 'broker-principal',
  BROKER_MANAGING = 'broker-managing',
  BROKER_SENIOR_OFFICER = 'broker-senior-officer',
  BROKER_OFFICER = 'broker-officer',
  BROKER_PROCESSOR = 'broker-processor',
  BROKER_ADMIN = 'broker-admin',

  // System roles
  SYSTEM_ADMIN = 'system-admin',
  EVA_ADMIN = 'eva-admin',
  COMPLIANCE_OFFICER = 'compliance-officer',
  SUPPORT_REP = 'support-rep',
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'execute')[];
  conditions?: {
    ownership?: boolean;
    status?: string[];
    timeframe?: string;
    monetaryLimit?: number;
  };
}

export interface UserPermissions {
  role: UserRole;
  permissions: Permission[];
  tierLevel: number;
  canManageTeam: boolean;
  monetaryLimits?: {
    maxTransactionAmount?: number;
    maxDailyAmount?: number;
    requiresApprovalAbove?: number;
  };
  dataAccessScope: 'all' | 'team' | 'assigned' | 'own';
}

// Define role hierarchies and permissions
const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  // Borrower roles
  [UserRole.BORROWER]: {
    role: UserRole.BORROWER,
    tierLevel: 6,
    canManageTeam: false,
    dataAccessScope: 'own',
    permissions: [
      {
        resource: 'loan_application',
        actions: ['create', 'read', 'update'],
        conditions: { ownership: true, status: ['draft', 'in_review'] },
      },
      {
        resource: 'documents',
        actions: ['create', 'read', 'delete'],
        conditions: { ownership: true },
      },
    ],
  },
  [UserRole.BORROWER_OWNER]: {
    role: UserRole.BORROWER_OWNER,
    tierLevel: 1,
    canManageTeam: true,
    dataAccessScope: 'all',
    permissions: [
      {
        resource: 'loan_application',
        actions: ['create', 'read', 'update', 'delete', 'execute'],
      },
      {
        resource: 'team_management',
        actions: ['create', 'read', 'update', 'delete'],
      },
      {
        resource: 'financial_documents',
        actions: ['create', 'read', 'update', 'delete'],
      },
      {
        resource: 'banking_integration',
        actions: ['execute'],
      },
    ],
  },
  [UserRole.BORROWER_CFO]: {
    role: UserRole.BORROWER_CFO,
    tierLevel: 2,
    canManageTeam: false,
    dataAccessScope: 'all',
    monetaryLimits: {
      maxTransactionAmount: 5000000,
      requiresApprovalAbove: 5000000,
    },
    permissions: [
      {
        resource: 'loan_application',
        actions: ['create', 'read', 'update'],
        conditions: { monetaryLimit: 5000000 },
      },
      {
        resource: 'financial_documents',
        actions: ['create', 'read', 'update'],
      },
    ],
  },

  // Vendor roles
  [UserRole.VENDOR]: {
    role: UserRole.VENDOR,
    tierLevel: 6,
    canManageTeam: false,
    dataAccessScope: 'own',
    permissions: [
      {
        resource: 'asset_listing',
        actions: ['read'],
        conditions: { ownership: true },
      },
      {
        resource: 'transaction',
        actions: ['read'],
        conditions: { ownership: true },
      },
    ],
  },
  [UserRole.VENDOR_OWNER]: {
    role: UserRole.VENDOR_OWNER,
    tierLevel: 1,
    canManageTeam: true,
    dataAccessScope: 'all',
    permissions: [
      {
        resource: 'asset_listing',
        actions: ['create', 'read', 'update', 'delete'],
      },
      {
        resource: 'vendor_profile',
        actions: ['create', 'read', 'update'],
      },
      {
        resource: 'transaction',
        actions: ['read', 'execute'],
      },
      {
        resource: 'team_management',
        actions: ['create', 'read', 'update', 'delete'],
      },
    ],
  },

  // Lender roles
  [UserRole.LENDER]: {
    role: UserRole.LENDER,
    tierLevel: 6,
    canManageTeam: false,
    dataAccessScope: 'assigned',
    permissions: [
      {
        resource: 'loan_application',
        actions: ['read'],
        conditions: { status: ['submitted', 'in_review'] },
      },
    ],
  },
  [UserRole.LENDER_CCO]: {
    role: UserRole.LENDER_CCO,
    tierLevel: 1,
    canManageTeam: true,
    dataAccessScope: 'all',
    permissions: [
      {
        resource: 'loan_application',
        actions: ['read', 'update', 'execute'],
      },
      {
        resource: 'lending_policies',
        actions: ['create', 'read', 'update', 'delete'],
      },
      {
        resource: 'portfolio',
        actions: ['read', 'execute'],
      },
      {
        resource: 'team_management',
        actions: ['create', 'read', 'update', 'delete'],
      },
    ],
  },

  // Broker roles
  [UserRole.BROKER]: {
    role: UserRole.BROKER,
    tierLevel: 6,
    canManageTeam: false,
    dataAccessScope: 'own',
    permissions: [
      {
        resource: 'loan_application',
        actions: ['create', 'read'],
        conditions: { ownership: true },
      },
    ],
  },
  [UserRole.BROKER_PRINCIPAL]: {
    role: UserRole.BROKER_PRINCIPAL,
    tierLevel: 1,
    canManageTeam: true,
    dataAccessScope: 'all',
    permissions: [
      {
        resource: 'loan_application',
        actions: ['create', 'read', 'update', 'delete'],
      },
      {
        resource: 'lender_network',
        actions: ['read', 'execute'],
      },
      {
        resource: 'commission_structure',
        actions: ['read', 'update'],
      },
      {
        resource: 'team_management',
        actions: ['create', 'read', 'update', 'delete'],
      },
    ],
  },

  // System roles
  [UserRole.SYSTEM_ADMIN]: {
    role: UserRole.SYSTEM_ADMIN,
    tierLevel: 0,
    canManageTeam: true,
    dataAccessScope: 'all',
    permissions: [
      {
        resource: '*',
        actions: ['create', 'read', 'update', 'delete', 'execute'],
      },
    ],
  },
  [UserRole.EVA_ADMIN]: {
    role: UserRole.EVA_ADMIN,
    tierLevel: 0,
    canManageTeam: true,
    dataAccessScope: 'all',
    permissions: [
      {
        resource: '*',
        actions: ['create', 'read', 'update', 'delete', 'execute'],
      },
    ],
  },

  // Add remaining roles with appropriate permissions...
  [UserRole.BORROWER_CONTROLLER]: {
    role: UserRole.BORROWER_CONTROLLER,
    tierLevel: 3,
    canManageTeam: false,
    dataAccessScope: 'team',
    monetaryLimits: {
      maxTransactionAmount: 1000000,
      requiresApprovalAbove: 1000000,
    },
    permissions: [
      {
        resource: 'loan_application',
        actions: ['create', 'read', 'update'],
        conditions: { monetaryLimit: 1000000, status: ['draft'] },
      },
    ],
  },
  [UserRole.BORROWER_ACCOUNTING]: {
    role: UserRole.BORROWER_ACCOUNTING,
    tierLevel: 4,
    canManageTeam: false,
    dataAccessScope: 'assigned',
    permissions: [
      {
        resource: 'documents',
        actions: ['create', 'read'],
        conditions: { ownership: false },
      },
    ],
  },
  [UserRole.BORROWER_OPERATIONS]: {
    role: UserRole.BORROWER_OPERATIONS,
    tierLevel: 5,
    canManageTeam: false,
    dataAccessScope: 'own',
    permissions: [
      {
        resource: 'loan_application',
        actions: ['read'],
        conditions: { ownership: false },
      },
    ],
  },
  [UserRole.BORROWER_ADMIN]: {
    role: UserRole.BORROWER_ADMIN,
    tierLevel: 6,
    canManageTeam: false,
    dataAccessScope: 'own',
    permissions: [
      {
        resource: 'loan_timeline',
        actions: ['read'],
      },
    ],
  },
  [UserRole.VENDOR_SALES_DIRECTOR]: {
    role: UserRole.VENDOR_SALES_DIRECTOR,
    tierLevel: 2,
    canManageTeam: true,
    dataAccessScope: 'all',
    permissions: [
      {
        resource: 'asset_listing',
        actions: ['create', 'read', 'update', 'delete'],
      },
      {
        resource: 'sales_team',
        actions: ['read', 'update'],
      },
    ],
  },
  [UserRole.VENDOR_SALES_MANAGER]: {
    role: UserRole.VENDOR_SALES_MANAGER,
    tierLevel: 3,
    canManageTeam: true,
    dataAccessScope: 'team',
    permissions: [
      {
        resource: 'asset_listing',
        actions: ['create', 'read', 'update'],
        conditions: { ownership: false },
      },
    ],
  },
  [UserRole.VENDOR_SENIOR_SALES]: {
    role: UserRole.VENDOR_SENIOR_SALES,
    tierLevel: 4,
    canManageTeam: false,
    dataAccessScope: 'assigned',
    permissions: [
      {
        resource: 'asset_listing',
        actions: ['create', 'read', 'update'],
        conditions: { ownership: true },
      },
    ],
  },
  [UserRole.VENDOR_JUNIOR_SALES]: {
    role: UserRole.VENDOR_JUNIOR_SALES,
    tierLevel: 5,
    canManageTeam: false,
    dataAccessScope: 'assigned',
    permissions: [
      {
        resource: 'asset_listing',
        actions: ['read', 'update'],
        conditions: { ownership: true },
      },
    ],
  },
  [UserRole.VENDOR_SUPPORT]: {
    role: UserRole.VENDOR_SUPPORT,
    tierLevel: 6,
    canManageTeam: false,
    dataAccessScope: 'own',
    permissions: [
      {
        resource: 'asset_inventory',
        actions: ['read', 'update'],
      },
    ],
  },
  [UserRole.LENDER_SENIOR_UNDERWRITER]: {
    role: UserRole.LENDER_SENIOR_UNDERWRITER,
    tierLevel: 2,
    canManageTeam: true,
    dataAccessScope: 'all',
    monetaryLimits: {
      maxTransactionAmount: 10000000,
      requiresApprovalAbove: 10000000,
    },
    permissions: [
      {
        resource: 'loan_application',
        actions: ['read', 'update', 'execute'],
        conditions: { monetaryLimit: 10000000 },
      },
    ],
  },
  [UserRole.LENDER_UNDERWRITER]: {
    role: UserRole.LENDER_UNDERWRITER,
    tierLevel: 3,
    canManageTeam: false,
    dataAccessScope: 'assigned',
    monetaryLimits: {
      maxTransactionAmount: 2000000,
      requiresApprovalAbove: 2000000,
    },
    permissions: [
      {
        resource: 'loan_application',
        actions: ['read', 'update'],
        conditions: { monetaryLimit: 2000000 },
      },
    ],
  },
  [UserRole.LENDER_PROCESSOR]: {
    role: UserRole.LENDER_PROCESSOR,
    tierLevel: 4,
    canManageTeam: false,
    dataAccessScope: 'assigned',
    permissions: [
      {
        resource: 'loan_application',
        actions: ['read', 'update'],
        conditions: { status: ['processing'] },
      },
    ],
  },
  [UserRole.LENDER_CSR]: {
    role: UserRole.LENDER_CSR,
    tierLevel: 5,
    canManageTeam: false,
    dataAccessScope: 'assigned',
    permissions: [
      {
        resource: 'loan_application',
        actions: ['read'],
        conditions: { status: ['active'] },
      },
    ],
  },
  [UserRole.LENDER_ADMIN]: {
    role: UserRole.LENDER_ADMIN,
    tierLevel: 6,
    canManageTeam: false,
    dataAccessScope: 'own',
    permissions: [
      {
        resource: 'documents',
        actions: ['create', 'read'],
      },
    ],
  },
  [UserRole.BROKER_MANAGING]: {
    role: UserRole.BROKER_MANAGING,
    tierLevel: 2,
    canManageTeam: true,
    dataAccessScope: 'all',
    permissions: [
      {
        resource: 'loan_application',
        actions: ['create', 'read', 'update'],
      },
      {
        resource: 'broker_team',
        actions: ['read', 'update'],
      },
    ],
  },
  [UserRole.BROKER_SENIOR_OFFICER]: {
    role: UserRole.BROKER_SENIOR_OFFICER,
    tierLevel: 3,
    canManageTeam: false,
    dataAccessScope: 'own',
    permissions: [
      {
        resource: 'loan_application',
        actions: ['create', 'read', 'update'],
        conditions: { ownership: true },
      },
    ],
  },
  [UserRole.BROKER_OFFICER]: {
    role: UserRole.BROKER_OFFICER,
    tierLevel: 4,
    canManageTeam: false,
    dataAccessScope: 'assigned',
    permissions: [
      {
        resource: 'loan_application',
        actions: ['create', 'read'],
        conditions: { ownership: true, status: ['draft'] },
      },
    ],
  },
  [UserRole.BROKER_PROCESSOR]: {
    role: UserRole.BROKER_PROCESSOR,
    tierLevel: 5,
    canManageTeam: false,
    dataAccessScope: 'assigned',
    permissions: [
      {
        resource: 'loan_application',
        actions: ['read', 'update'],
        conditions: { ownership: false },
      },
    ],
  },
  [UserRole.BROKER_ADMIN]: {
    role: UserRole.BROKER_ADMIN,
    tierLevel: 6,
    canManageTeam: false,
    dataAccessScope: 'own',
    permissions: [
      {
        resource: 'loan_pipeline',
        actions: ['read'],
      },
    ],
  },
  [UserRole.COMPLIANCE_OFFICER]: {
    role: UserRole.COMPLIANCE_OFFICER,
    tierLevel: 1,
    canManageTeam: false,
    dataAccessScope: 'all',
    permissions: [
      {
        resource: '*',
        actions: ['read'],
      },
      {
        resource: 'compliance_reports',
        actions: ['create', 'read', 'execute'],
      },
    ],
  },
  [UserRole.SUPPORT_REP]: {
    role: UserRole.SUPPORT_REP,
    tierLevel: 5,
    canManageTeam: false,
    dataAccessScope: 'assigned',
    permissions: [
      {
        resource: 'user_profile',
        actions: ['read', 'update'],
        conditions: { ownership: false },
      },
      {
        resource: 'support_tickets',
        actions: ['create', 'read', 'update'],
      },
    ],
  },
};

export const useUserPermissions = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.BORROWER_OWNER);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);

  useEffect(() => {
    // Get the current role from localStorage
    const storedRole = localStorage.getItem('userRole') as UserRole;
    if (storedRole && ROLE_PERMISSIONS[storedRole]) {
      setCurrentRole(storedRole);
      setPermissions(ROLE_PERMISSIONS[storedRole]);
    } else {
      // Default to borrower owner if no role is set
      setCurrentRole(UserRole.BORROWER_OWNER);
      setPermissions(ROLE_PERMISSIONS[UserRole.BORROWER_OWNER]);
    }
  }, []);

  // Listen for role changes
  useEffect(() => {
    const handleRoleChange = (event: CustomEvent) => {
      const newRole = event.detail.role as UserRole;
      debugLog('general', 'log_statement', '[useUserPermissions] Role change event received:', {
        newRole,
        oldRole: currentRole,
        hasPermissions: !!ROLE_PERMISSIONS[newRole]
      })
      
      if (ROLE_PERMISSIONS[newRole]) {
        setCurrentRole(newRole);
        setPermissions(ROLE_PERMISSIONS[newRole]);
        debugLog('general', 'log_statement', '[useUserPermissions] Role and permissions updated successfully')
      } else {
        console.warn('[useUserPermissions] Invalid role received:', newRole);
      }
    };

    const handleStorageChange = () => {
      const storedRole = localStorage.getItem('userRole') as UserRole;
      debugLog('general', 'log_statement', '[useUserPermissions] Storage change detected:', {
        storedRole,
        currentRole,
        hasPermissions: !!ROLE_PERMISSIONS[storedRole]
      })
      
      if (storedRole && ROLE_PERMISSIONS[storedRole] && storedRole !== currentRole) {
        setCurrentRole(storedRole);
        setPermissions(ROLE_PERMISSIONS[storedRole]);
        debugLog('general', 'log_statement', '[useUserPermissions] Role updated from storage')
      }
    };

    // Add event listeners
    window.addEventListener('userRoleChange', handleRoleChange as any);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('userRoleChange', handleRoleChange as any);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentRole]); // Added currentRole to dependencies

  const hasPermission = (resource: string, action: string, conditions?: any): boolean => {
    if (!permissions) return false;

    // System admins have all permissions
    if (permissions.role === UserRole.SYSTEM_ADMIN || permissions.role === UserRole.EVA_ADMIN) {
      return true;
    }

    // Check if user has permission for the resource and action
    const permission = permissions.permissions.find(
      p => (p.resource === resource || p.resource === '*') && p.actions.includes(action as any)
    );

    if (!permission) return false;

    // Check conditions if provided
    if (permission.conditions && conditions) {
      // Check ownership
      if (
        permission.conditions.ownership !== undefined &&
        permission.conditions.ownership !== conditions.ownership
      ) {
        return false;
      }

      // Check status
      if (
        permission.conditions.status &&
        conditions.status &&
        !permission.conditions.status.includes(conditions.status)
      ) {
        return false;
      }

      // Check monetary limit
      if (
        permission.conditions.monetaryLimit &&
        conditions.amount &&
        conditions.amount > permission.conditions.monetaryLimit
      ) {
        return false;
      }
    }

    return true;
  };

  const canAccessData = (dataOwner: string, dataTeam?: string): boolean => {
    if (!permissions) return false;

    switch (permissions.dataAccessScope) {
      case 'all':
        return true;
      case 'team':
        return dataTeam === localStorage.getItem('userTeam');
      case 'assigned':
        return localStorage.getItem('assignedData')?.includes(dataOwner) || false;
      case 'own':
        return dataOwner === localStorage.getItem('userId');
      default:
        return false;
    }
  };

  const getRoleDisplayName = (role: UserRole): string => {
    const roleMap: Record<UserRole, string> = {
      [UserRole.BORROWER]: 'Borrower',
      [UserRole.BORROWER_OWNER]: 'Borrower - Owner/CEO',
      [UserRole.BORROWER_CFO]: 'Borrower - CFO',
      [UserRole.BORROWER_CONTROLLER]: 'Borrower - Controller',
      [UserRole.BORROWER_ACCOUNTING]: 'Borrower - Accounting Staff',
      [UserRole.BORROWER_OPERATIONS]: 'Borrower - Operations Manager',
      [UserRole.BORROWER_ADMIN]: 'Borrower - Admin Assistant',
      [UserRole.VENDOR]: 'Vendor',
      [UserRole.VENDOR_OWNER]: 'Vendor - Owner/President',
      [UserRole.VENDOR_SALES_DIRECTOR]: 'Vendor - Sales Director',
      [UserRole.VENDOR_SALES_MANAGER]: 'Vendor - Sales Manager',
      [UserRole.VENDOR_SENIOR_SALES]: 'Vendor - Senior Sales Rep',
      [UserRole.VENDOR_JUNIOR_SALES]: 'Vendor - Junior Sales Rep',
      [UserRole.VENDOR_SUPPORT]: 'Vendor - Sales Support',
      [UserRole.LENDER]: 'Lender',
      [UserRole.LENDER_CCO]: 'Lender - Chief Credit Officer',
      [UserRole.LENDER_SENIOR_UNDERWRITER]: 'Lender - Senior Underwriter',
      [UserRole.LENDER_UNDERWRITER]: 'Lender - Underwriter',
      [UserRole.LENDER_PROCESSOR]: 'Lender - Loan Processor',
      [UserRole.LENDER_CSR]: 'Lender - Customer Service Rep',
      [UserRole.LENDER_ADMIN]: 'Lender - Admin Support',
      [UserRole.BROKER]: 'Broker',
      [UserRole.BROKER_PRINCIPAL]: 'Broker - Principal/Owner',
      [UserRole.BROKER_MANAGING]: 'Broker - Managing Broker',
      [UserRole.BROKER_SENIOR_OFFICER]: 'Broker - Senior Loan Officer',
      [UserRole.BROKER_OFFICER]: 'Broker - Loan Officer',
      [UserRole.BROKER_PROCESSOR]: 'Broker - Loan Processor',
      [UserRole.BROKER_ADMIN]: 'Broker - Admin Assistant',
      [UserRole.SYSTEM_ADMIN]: 'System Administrator',
      [UserRole.EVA_ADMIN]: 'EVA Administrator',
      [UserRole.COMPLIANCE_OFFICER]: 'Compliance Officer',
      [UserRole.SUPPORT_REP]: 'Customer Support Representative',
    };

    return roleMap[role] || role;
  };

  const getBaseUserType = useCallback(
    (
      role: UserRole | string | undefined
    ): 'borrower' | 'vendor' | 'lender' | 'broker' | 'admin' | 'unknown' => {
      if (typeof role !== 'string' || !role) {
        // console.warn('[useUserPermissions] getBaseUserType called with invalid role:', role);
        return 'unknown'; // Or a sensible default like 'admin' or handle as an error
      }
      if (role.startsWith('borrower')) return 'borrower';
      if (role.startsWith('vendor')) return 'vendor';
      if (role.startsWith('lender')) return 'lender';
      if (role.startsWith('broker')) return 'broker';
      // Fallback for roles like 'system-admin', 'eva-admin', 'compliance-officer', 'support-rep'
      if (role.includes('admin') || role.includes('officer') || role.includes('support'))
        return 'admin';
      return 'admin'; // Default fallback if no other category matches
    },
    []
  );

  return {
    currentRole,
    permissions,
    hasPermission,
    canAccessData,
    getRoleDisplayName,
    getBaseUserType,
    tierLevel: permissions?.tierLevel || 6,
    canManageTeam: permissions?.canManageTeam || false,
    monetaryLimits: permissions?.monetaryLimits,
    dataAccessScope: permissions?.dataAccessScope || 'own',
  };
};
