// ========================================
// UNIFIED USER TYPES SYSTEM - SINGLE SOURCE OF TRUTH
// ========================================

// Core user roles (primary roles)
export type UserRole = 'borrower' | 'lender' | 'broker' | 'vendor' | 'admin' | 'investor';

// Extended role types for specific contexts
export type UserRoleTypeString =
  | 'borrower'
  | 'lender'
  | 'broker'
  | 'vendor'
  | 'admin'
  | 'developer'
  | 'sales_manager'
  | 'loan_processor'
  | 'credit_underwriter'
  | 'credit_committee'
  | 'portfolio_manager'
  | 'finance_manager';

// User type enum for backwards compatibility
export enum UserType {
  BORROWER = 'borrower',
  LENDER = 'lender',
  BROKER = 'broker',
  VENDOR = 'vendor',
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  SALES_MANAGER = 'sales_manager',
  LOAN_PROCESSOR = 'loan_processor',
  CREDIT_UNDERWRITER = 'credit_underwriter',
  CREDIT_COMMITTEE = 'credit_committee',
  PORTFOLIO_MANAGER = 'portfolio_manager',
  FINANCE_MANAGER = 'finance_manager',
}

// Specific role types by category
export type CoreRoleType =
  | 'sales_manager'
  | 'loan_processor'
  | 'credit_underwriter'
  | 'credit_committee'
  | 'portfolio_manager';

export type BusinessRoleType =
  | 'business_owner'
  | 'finance_department'
  | 'sales_department'
  | 'marketing'
  | 'maintenance_service'
  | 'managers';

export type BorrowerRoleType = 'owners' | 'employees' | 'cpa_bookkeeper' | 'authorized_proxy';

export type LenderBrokerRoleType = 'default_role' | 'cpa_bookkeeper';

export type UserSpecificRoleType =
  | 'default_role'
  | 'owners'
  | 'employees'
  | 'cpa_bookkeeper'
  | 'authorized_proxy'
  | 'business_owner'
  | 'finance_department'
  | 'sales_department'
  | 'marketing'
  | 'maintenance_service'
  | 'managers';

// Demo context types
export type DemoContextType =
  | 'user'
  | 'all'
  | 'lender'
  | 'broker'
  | 'borrower'
  | 'vendor'
  | 'admin'
  | 'core';

// User profile interface
export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  entityType: 'individual' | 'business' | 'corporation' | 'llc' | 'partnership';
  permissions: string[];
  lastLogin: string;
  isActive: boolean;
  specificRole?: UserSpecificRoleType;
}

// User type configuration
export interface UserTypeConfig {
  type: UserRoleTypeString;
  specificRoles: UserSpecificRoleType[];
  displayName: string;
  category: 'core' | 'user' | 'admin';
}

// User type selector props
export interface UserTypeSelectorProps {
  currentUserType: UserRoleTypeString;
  onUserTypeChange: (roleType: UserRoleTypeString, specificRole?: string) => void;
  demoContext?: DemoContextType;
  showSpecificRoles?: boolean;
  className?: string;
}

// Role mapping utilities
export const mapStringToUserTypeEnum = (
  roleString: UserRoleTypeString | string | null,
): UserType => {
  if (!roleString) return UserType.BORROWER;

  switch (roleString.toLowerCase()) {
    case 'borrower':
      return UserType.BORROWER;
    case 'lender':
      return UserType.LENDER;
    case 'broker':
      return UserType.BROKER;
    case 'vendor':
      return UserType.VENDOR;
    case 'admin':
      return UserType.ADMIN;
    case 'developer':
      return UserType.DEVELOPER;
    case 'sales_manager':
      return UserType.SALES_MANAGER;
    case 'loan_processor':
      return UserType.LOAN_PROCESSOR;
    case 'credit_underwriter':
      return UserType.CREDIT_UNDERWRITER;
    case 'credit_committee':
      return UserType.CREDIT_COMMITTEE;
    case 'portfolio_manager':
      return UserType.PORTFOLIO_MANAGER;
    case 'finance_manager':
      return UserType.FINANCE_MANAGER;
    default:
      return UserType.BORROWER;
  }
};

export const mapUserTypeEnumToString = (userTypeEnum: UserType): UserRoleTypeString => {
  return userTypeEnum.toString() as UserRoleTypeString;
};

export const mapUserRoleTypeToUserRole = (role: UserRoleTypeString): UserRole => {
  switch (role) {
    case 'borrower':
      return 'borrower';
    case 'lender':
      return 'lender';
    case 'broker':
      return 'broker';
    case 'vendor':
      return 'vendor';
    case 'admin':
      return 'admin';
    case 'developer':
      return 'admin';
    case 'sales_manager':
      return 'lender';
    case 'loan_processor':
      return 'lender';
    case 'credit_underwriter':
      return 'lender';
    case 'credit_committee':
      return 'lender';
    case 'portfolio_manager':
      return 'lender';
    case 'finance_manager':
      return 'admin';
    default:
      return 'borrower';
  }
};

// Role display configurations
export const USER_TYPE_CONFIGS: UserTypeConfig[] = [
  {
    type: 'borrower',
    specificRoles: ['owners', 'employees', 'cpa_bookkeeper', 'authorized_proxy'],
    displayName: 'Borrower',
    category: 'user',
  },
  {
    type: 'lender',
    specificRoles: ['default_role', 'cpa_bookkeeper'],
    displayName: 'Lender',
    category: 'user',
  },
  {
    type: 'broker',
    specificRoles: ['default_role', 'cpa_bookkeeper'],
    displayName: 'Broker',
    category: 'user',
  },
  {
    type: 'vendor',
    specificRoles: [
      'business_owner',
      'finance_department',
      'sales_department',
      'marketing',
      'maintenance_service',
      'managers',
    ],
    displayName: 'Vendor',
    category: 'user',
  },
  {
    type: 'admin',
    specificRoles: ['default_role'],
    displayName: 'Admin',
    category: 'admin',
  },
  {
    type: 'sales_manager',
    specificRoles: ['default_role'],
    displayName: 'Sales Manager',
    category: 'core',
  },
  {
    type: 'loan_processor',
    specificRoles: ['default_role'],
    displayName: 'Loan Processor',
    category: 'core',
  },
  {
    type: 'credit_underwriter',
    specificRoles: ['default_role'],
    displayName: 'Credit Underwriter',
    category: 'core',
  },
  {
    type: 'credit_committee',
    specificRoles: ['default_role'],
    displayName: 'Credit Committee',
    category: 'core',
  },
  {
    type: 'portfolio_manager',
    specificRoles: ['default_role'],
    displayName: 'Portfolio Manager',
    category: 'core',
  },
  {
    type: 'finance_manager',
    specificRoles: ['default_role'],
    displayName: 'Finance Manager',
    category: 'core',
  },
];

// Helper functions
export const getUserTypeConfig = (type: UserRoleTypeString): UserTypeConfig | undefined => {
  return USER_TYPE_CONFIGS.find(config => config.type === type);
};

export const getUserRoleDisplayName = (role: UserRole | UserRoleTypeString): string => {
  const config = getUserTypeConfig(role as UserRoleTypeString);
  return config?.displayName || role.charAt(0).toUpperCase() + role.slice(1);
};

export const getRoleColor = (role: UserRole | UserRoleTypeString): string => {
  switch (role) {
    case 'borrower':
      return 'text-blue-600';
    case 'lender':
      return 'text-green-600';
    case 'broker':
      return 'text-purple-600';
    case 'vendor':
      return 'text-orange-600';
    case 'admin':
      return 'text-red-600';
    case 'developer':
      return 'text-gray-600';
    default:
      return 'text-gray-500';
  }
};

export const getRoleDescription = (role: UserRole | UserRoleTypeString): string => {
  switch (role) {
    case 'borrower':
      return 'Individual or business seeking financing';
    case 'lender':
      return 'Financial institution providing loans';
    case 'broker':
      return 'Intermediary connecting borrowers and lenders';
    case 'vendor':
      return 'Service provider in the ecosystem';
    case 'admin':
      return 'System administrator with full access';
    case 'developer':
      return 'Development team member';
    case 'sales_manager':
      return 'Sales team manager';
    case 'loan_processor':
      return 'Loan processing specialist';
    case 'credit_underwriter':
      return 'Credit risk assessment specialist';
    case 'credit_committee':
      return 'Credit approval committee member';
    case 'portfolio_manager':
      return 'Portfolio management specialist';
    case 'finance_manager':
      return 'Finance department manager';
    default:
      return 'Platform user';
  }
};
