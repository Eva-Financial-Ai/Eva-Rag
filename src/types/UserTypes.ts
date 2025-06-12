/**
 * User type definitions for the application
 */

import { UserSpecificRoleType } from './user';

// Add UserRoleType back for backward compatibility
export type UserRoleType = 'borrower' | 'lender' | 'broker' | 'vendor' | 'admin' | 'developer' | 
  'sales_manager' | 'loan_processor' | 'credit_underwriter' | 'credit_committee' | 'portfolio_manager' |
  'finance_manager';

// User Type Enums - Core system categorization
export enum UserType {
  BUSINESS = 'BUSINESS', // Borrowers
  VENDOR = 'VENDOR',
  BROKERAGE = 'BROKERAGE',
  LENDER = 'LENDER',
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
  FINANCE_MANAGER = 'FINANCE_MANAGER', // Added as core type
}

// Role hierarchy within organizations (used for permission checks)
export enum EmployeeRole {
  VIEWER = 'VIEWER',
  CONTRIBUTOR = 'CONTRIBUTOR',
  EDITOR = 'EDITOR',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

// Core internal staff roles
export enum CoreRole {
  SALES_MANAGER = 'sales_manager',
  LOAN_PROCESSOR = 'loan_processor',
  CREDIT_UNDERWRITER = 'credit_underwriter',
  CREDIT_COMMITTEE = 'credit_committee',
  PORTFOLIO_MANAGER = 'portfolio_manager',
}

// Enhanced role definitions mapped to user types with hierarchical structure
// VENDOR ROLES
export enum VendorRole {
  SALES_REP = 'sales_rep',
  ACCOUNT_MANAGER = 'account_manager',
  FINANCE_SPECIALIST = 'finance_specialist',
  BRANCH_MANAGER = 'branch_manager',
  OPERATIONS_COORDINATOR = 'operations_coordinator',
  REGIONAL_DIRECTOR = 'regional_director',
}

// FINANCE MANAGER ROLES
export enum FinanceManagerRole {
  FINANCE_MANAGER = 'finance_manager',
  SENIOR_FINANCE_MANAGER = 'senior_finance_manager',
  OPERATIONS_MANAGER = 'operations_manager',
  CREDIT_ANALYST = 'credit_analyst',
  COMPLIANCE_OFFICER = 'compliance_officer',
  FINANCE_DIRECTOR = 'finance_director',
}

// BROKER ROLES
export enum BrokerRole {
  COMMERCIAL_BROKER = 'commercial_broker',
  SENIOR_COMMERCIAL_BROKER = 'senior_commercial_broker',
  EQUIPMENT_FINANCE_BROKER = 'equipment_finance_broker',
  REAL_ESTATE_FINANCE_BROKER = 'real_estate_finance_broker',
  TEAM_LEAD = 'team_lead',
  PRINCIPAL_BROKER = 'principal_broker',
}

// LENDER ROLES
export enum LenderRole {
  ACCOUNT_EXECUTIVE = 'account_executive',
  UNDERWRITER = 'underwriter',
  PORTFOLIO_MANAGER = 'portfolio_manager',
  CREDIT_ADMINISTRATOR = 'credit_administrator',
  RELATIONSHIP_MANAGER = 'relationship_manager',
  LENDING_DIRECTOR = 'lending_director',
}

// BORROWER ROLES
export enum BorrowerRole {
  BUSINESS_OWNER = 'business_owner',
  CFO = 'cfo',
  CONTROLLER = 'controller',
  OPERATIONS_MANAGER = 'operations_manager',
  LEGAL_COUNSEL = 'legal_counsel',
  AUTHORIZED_REPRESENTATIVE = 'authorized_representative',
}

// Legacy roles for backward compatibility
export enum LegacyRoles {
  DEFAULT_ROLE = 'default_role',
  OWNERS = 'owners',
  EMPLOYEES = 'employees',
  CPA_BOOKKEEPER = 'cpa_bookkeeper',
  AUTHORIZED_PROXY = 'authorized_proxy',
  FINANCE_DEPARTMENT = 'finance_department',
  SALES_DEPARTMENT = 'sales_department',
  MARKETING = 'marketing',
  MAINTENANCE_SERVICE = 'maintenance_service',
  MANAGERS = 'managers',
}

// Map user types to their available specific roles
export const userTypeToRolesMap: Record<string, string[]> = {
  // User types
  'borrower': Object.values(BorrowerRole),
  'lender': Object.values(LenderRole),
  'broker': Object.values(BrokerRole),
  'vendor': Object.values(VendorRole),
  'finance_manager': Object.values(FinanceManagerRole),
  
  // Core roles (self-mapped)
  'sales_manager': ['sales_manager'],
  'loan_processor': ['loan_processor'],
  'credit_underwriter': ['credit_underwriter'],
  'credit_committee': ['credit_committee'],
  'portfolio_manager': ['portfolio_manager'],
  
  // Admin roles
  'admin': ['admin'],
  'developer': ['developer'],
};

// Human-readable display names for roles and user types
export const roleDisplayNames: Record<string, string> = {
  // User Types
  'borrower': 'Borrower',
  'lender': 'Lender',
  'broker': 'Broker',
  'vendor': 'Vendor',
  'admin': 'Admin',
  'developer': 'Developer',
  
  // Core Roles
  'sales_manager': 'Sales Manager',
  'loan_processor': 'Loan Processor',
  'credit_underwriter': 'Credit Underwriter',
  'credit_committee': 'Credit Committee',
  'portfolio_manager': 'Portfolio Manager',
  
  // Vendor Roles
  'sales_rep': 'Sales Representative',
  'account_manager': 'Account Manager',
  'finance_specialist': 'Finance Specialist',
  'branch_manager': 'Branch Manager',
  'operations_coordinator': 'Operations Coordinator',
  'regional_director': 'Regional Director',
  
  // Finance Manager Roles
  'finance_manager_role': 'Finance Manager',
  'senior_finance_manager': 'Senior Finance Manager',
  'operations_manager': 'Operations Manager',
  'credit_analyst': 'Credit Analyst',
  'compliance_officer': 'Compliance Officer',
  'finance_director': 'Finance Director',
  
  // Broker Roles
  'commercial_broker': 'Commercial Broker',
  'senior_commercial_broker': 'Senior Commercial Broker',
  'equipment_finance_broker': 'Equipment Finance Broker',
  'real_estate_finance_broker': 'Real Estate Finance Broker',
  'team_lead': 'Team Lead',
  'principal_broker': 'Principal Broker',
  
  // Lender Roles
  'account_executive': 'Account Executive',
  'underwriter': 'Underwriter',
  'credit_administrator': 'Credit Administrator',
  'relationship_manager': 'Relationship Manager',
  'lending_director': 'Lending Director',
  
  // Borrower Roles
  'business_owner': 'Business Owner',
  'cfo': 'CFO',
  'controller': 'Controller',
  'legal_counsel': 'Legal Counsel',
  'authorized_representative': 'Authorized Representative',
  
  // Legacy roles for backward compatibility
  'default_role': 'Default Role',
  'owners': 'Owner',
  'employees': 'Employee',
  'cpa_bookkeeper': 'CPA/Bookkeeper',
  'authorized_proxy': 'Authorized Proxy',
  'finance_department': 'Finance Department',
  'sales_department': 'Sales Department',
  'marketing': 'Marketing',
  'maintenance_service': 'Maintenance Service',
  'managers': 'Manager',
};

// Role hierarchy for permission checks (higher value = more access)
export const roleHierarchy: Record<EmployeeRole, number> = {
  [EmployeeRole.VIEWER]: 1,
  [EmployeeRole.CONTRIBUTOR]: 2,
  [EmployeeRole.EDITOR]: 3,
  [EmployeeRole.MANAGER]: 4,
  [EmployeeRole.ADMIN]: 5,
};

// Feature access level definitions
export interface FeatureAccess {
  dashboard: number;
  transactions: number;
  reporting: number;
  messaging: number;
  settings: number;
  admin: number;
  eva_ai: number;
  documents: number;
  smartMatch: number;
  analytics: number;
  dataIntegration: number;
  compliance: number;
}

// Default permissions for each user type
export const defaultPermissions: Record<UserType, FeatureAccess> = {
  [UserType.BUSINESS]: {
    dashboard: 3,
    transactions: 2,
    reporting: 2,
    messaging: 3,
    settings: 1,
    admin: 0,
    eva_ai: 2,
    documents: 3,
    smartMatch: 0,
    analytics: 1,
    dataIntegration: 1,
    compliance: 1,
  },
  [UserType.VENDOR]: {
    dashboard: 3,
    transactions: 2,
    reporting: 2,
    messaging: 3,
    settings: 1,
    admin: 0,
    eva_ai: 2,
    documents: 2,
    smartMatch: 1,
    analytics: 1,
    dataIntegration: 1,
    compliance: 1,
  },
  [UserType.BROKERAGE]: {
    dashboard: 3,
    transactions: 3,
    reporting: 3,
    messaging: 3,
    settings: 2,
    admin: 0,
    eva_ai: 3,
    documents: 3,
    smartMatch: 3,
    analytics: 2,
    dataIntegration: 2,
    compliance: 2,
  },
  [UserType.LENDER]: {
    dashboard: 3,
    transactions: 3,
    reporting: 3,
    messaging: 3,
    settings: 2,
    admin: 0,
    eva_ai: 3,
    documents: 3,
    smartMatch: 3,
    analytics: 3,
    dataIntegration: 3,
    compliance: 3,
  },
  [UserType.FINANCE_MANAGER]: {
    dashboard: 3,
    transactions: 3,
    reporting: 3,
    messaging: 3,
    settings: 2,
    admin: 0,
    eva_ai: 3,
    documents: 3,
    smartMatch: 2,
    analytics: 3,
    dataIntegration: 2,
    compliance: 3,
  },
  [UserType.ADMIN]: {
    dashboard: 3,
    transactions: 3,
    reporting: 3,
    messaging: 3,
    settings: 3,
    admin: 3,
    eva_ai: 3,
    documents: 3,
    smartMatch: 3,
    analytics: 3,
    dataIntegration: 3,
    compliance: 3,
  },
  [UserType.DEVELOPER]: {
    dashboard: 3,
    transactions: 3,
    reporting: 3,
    messaging: 3,
    settings: 3,
    admin: 3,
    eva_ai: 3,
    documents: 3,
    smartMatch: 3,
    analytics: 3,
    dataIntegration: 3,
    compliance: 3,
  },
};

// Permission levels from most restricted to most permissive
export enum PermissionLevel {
  NONE = 0,
  VIEW = 1,
  INTERACT = 2,
  MODIFY = 3,
  ADMIN = 4,
}

// User interface for application-wide use
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  profilePhoto?: string;
  type?: UserType;
  specificRole?: string;
  businessName?: string;
  taxId?: string;
  profileData?: Record<string, any>;
}
