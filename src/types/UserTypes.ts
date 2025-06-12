/**
 * Business Logic User Types for User Stories, Journeys, and Flows
 * This file defines user personas and their business contexts for UX design and development
 */

import { UserSpecificRoleType } from './user';

// Business Logic User Types for User Stories and Journey Mapping
export enum BusinessUserType {
  SMALL_BUSINESS_OWNER = 'SMALL_BUSINESS_OWNER',
  GROWING_BUSINESS_OWNER = 'GROWING_BUSINESS_OWNER', 
  ENTERPRISE_BUSINESS_OWNER = 'ENTERPRISE_BUSINESS_OWNER',
  FIRST_TIME_BORROWER = 'FIRST_TIME_BORROWER',
  REPEAT_BORROWER = 'REPEAT_BORROWER',
  EQUIPMENT_BUYER = 'EQUIPMENT_BUYER',
  REAL_ESTATE_INVESTOR = 'REAL_ESTATE_INVESTOR',
  WORKING_CAPITAL_SEEKER = 'WORKING_CAPITAL_SEEKER',
  EXPANSION_FOCUSED_BUSINESS = 'EXPANSION_FOCUSED_BUSINESS',
  CASH_FLOW_CONSTRAINED_BUSINESS = 'CASH_FLOW_CONSTRAINED_BUSINESS'
}

// Legacy User Type Enums - Maintained for technical compatibility
export enum UserType {
  BUSINESS = 'BUSINESS',
  VENDOR = 'VENDOR', 
  BROKERAGE = 'BROKERAGE',
  LENDER = 'LENDER',
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
  FINANCE_MANAGER = 'FINANCE_MANAGER',
}

// Add UserRoleType back for backward compatibility
export type UserRoleType = 'borrower' | 'lender' | 'broker' | 'vendor' | 'admin' | 'developer' | 
  'sales_manager' | 'loan_processor' | 'credit_underwriter' | 'credit_committee' | 'portfolio_manager' |
  'finance_manager';

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

// Business User Persona Definitions for User Stories
export interface BusinessUserPersona {
  userType: BusinessUserType;
  displayName: string;
  description: string;
  businessContext: {
    industry?: string;
    businessSize: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
    annualRevenue?: string;
    employeeCount?: string;
    yearsInBusiness?: string;
  };
  painPoints: string[];
  goals: string[];
  typicalJourney: string[];
  keyFeatures: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  techSavviness: 'low' | 'medium' | 'high';
  preferredChannels: string[];
}

// Business User Personas Data
export const businessUserPersonas: Record<BusinessUserType, BusinessUserPersona> = {
  [BusinessUserType.SMALL_BUSINESS_OWNER]: {
    userType: BusinessUserType.SMALL_BUSINESS_OWNER,
    displayName: 'Small Business Owner',
    description: 'Owner of a small business (1-10 employees) seeking financing for growth or operations',
    businessContext: {
      businessSize: 'small',
      annualRevenue: '$100K - $1M',
      employeeCount: '1-10',
      yearsInBusiness: '2-10 years'
    },
    painPoints: [
      'Limited access to capital',
      'Complex application processes', 
      'Lack of business credit history',
      'Time constraints for lengthy applications'
    ],
    goals: [
      'Secure working capital quickly',
      'Simple application process',
      'Competitive rates',
      'Flexible repayment terms'
    ],
    typicalJourney: [
      'Identify funding need',
      'Research lenders',
      'Compare options',
      'Submit application',
      'Provide documentation',
      'Await decision',
      'Receive funding'
    ],
    keyFeatures: ['Quick application', 'Document upload', 'Status tracking', 'Rate comparison'],
    urgencyLevel: 'high',
    techSavviness: 'medium',
    preferredChannels: ['Online platform', 'Phone support', 'Email']
  },
  
  [BusinessUserType.GROWING_BUSINESS_OWNER]: {
    userType: BusinessUserType.GROWING_BUSINESS_OWNER,
    displayName: 'Growing Business Owner',
    description: 'Owner of an expanding business seeking significant capital for growth initiatives',
    businessContext: {
      businessSize: 'medium',
      annualRevenue: '$1M - $10M',
      employeeCount: '10-50',
      yearsInBusiness: '5-15 years'
    },
    painPoints: [
      'Need for substantial funding',
      'Complex growth planning',
      'Managing cash flow during expansion',
      'Balancing multiple financing options'
    ],
    goals: [
      'Secure growth capital',
      'Optimize financing structure',
      'Maintain cash flow stability',
      'Scale operations efficiently'
    ],
    typicalJourney: [
      'Develop growth strategy',
      'Assess funding requirements',
      'Explore financing options',
      'Prepare comprehensive application',
      'Negotiate terms',
      'Secure funding',
      'Execute growth plan'
    ],
    keyFeatures: ['Advanced analytics', 'Multi-product comparison', 'Financial modeling', 'Expert consultation'],
    urgencyLevel: 'medium',
    techSavviness: 'high',
    preferredChannels: ['Online platform', 'In-person meetings', 'Video calls']
  },
  
  [BusinessUserType.ENTERPRISE_BUSINESS_OWNER]: {
    userType: BusinessUserType.ENTERPRISE_BUSINESS_OWNER,
    displayName: 'Enterprise Business Owner',
    description: 'Owner/executive of large enterprise requiring complex financing solutions',
    businessContext: {
      businessSize: 'enterprise',
      annualRevenue: '$10M+',
      employeeCount: '50+',
      yearsInBusiness: '10+ years'
    },
    painPoints: [
      'Complex financing requirements',
      'Multiple stakeholder coordination',
      'Compliance and regulatory requirements',
      'Integration with existing systems'
    ],
    goals: [
      'Optimize capital structure',
      'Streamline financing processes',
      'Ensure regulatory compliance',
      'Maintain strategic flexibility'
    ],
    typicalJourney: [
      'Strategic planning',
      'Market analysis',
      'RFP process',
      'Due diligence',
      'Term negotiation',
      'Legal review',
      'Execution and monitoring'
    ],
    keyFeatures: ['Custom solutions', 'API integrations', 'Advanced reporting', 'Dedicated support'],
    urgencyLevel: 'low',
    techSavviness: 'high',
    preferredChannels: ['Dedicated portal', 'Account management', 'API access']
  },
  
  [BusinessUserType.FIRST_TIME_BORROWER]: {
    userType: BusinessUserType.FIRST_TIME_BORROWER,
    displayName: 'First-Time Borrower',
    description: 'Business owner seeking financing for the first time, needs guidance and education',
    businessContext: {
      businessSize: 'micro',
      annualRevenue: '$50K - $500K',
      employeeCount: '1-5',
      yearsInBusiness: '1-3 years'
    },
    painPoints: [
      'Unfamiliar with financing process',
      'Uncertainty about qualification',
      'Fear of rejection',
      'Overwhelming options'
    ],
    goals: [
      'Understand financing options',
      'Get pre-qualified',
      'Receive guidance',
      'Complete first successful application'
    ],
    typicalJourney: [
      'Research financing basics',
      'Use educational resources',
      'Take eligibility quiz',
      'Get pre-qualified',
      'Submit guided application',
      'Receive support',
      'Get approved'
    ],
    keyFeatures: ['Educational content', 'Eligibility checker', 'Guided application', 'Live chat support'],
    urgencyLevel: 'medium',
    techSavviness: 'low',
    preferredChannels: ['Educational content', 'Live chat', 'Phone support']
  },
  
  [BusinessUserType.REPEAT_BORROWER]: {
    userType: BusinessUserType.REPEAT_BORROWER,
    displayName: 'Repeat Borrower',
    description: 'Experienced borrower with established relationship, values efficiency and loyalty benefits',
    businessContext: {
      businessSize: 'small',
      annualRevenue: '$500K - $5M',
      employeeCount: '5-25',
      yearsInBusiness: '5+ years'
    },
    painPoints: [
      'Repetitive application processes',
      'Lack of relationship recognition',
      'No preferential treatment',
      'Limited loyalty benefits'
    ],
    goals: [
      'Streamlined repeat applications',
      'Loyalty rewards and benefits',
      'Preferential rates',
      'Expedited processing'
    ],
    typicalJourney: [
      'Access customer portal',
      'Review pre-approved offers',
      'Submit streamlined application',
      'Auto-populate from history',
      'Fast-track approval',
      'Receive funding'
    ],
    keyFeatures: ['Customer portal', 'Pre-approved offers', 'Application history', 'Loyalty rewards'],
    urgencyLevel: 'medium',
    techSavviness: 'high',
    preferredChannels: ['Customer portal', 'Mobile app', 'Direct contact']
  },
  
  [BusinessUserType.EQUIPMENT_BUYER]: {
    userType: BusinessUserType.EQUIPMENT_BUYER,
    displayName: 'Equipment Buyer',
    description: 'Business owner specifically seeking equipment financing or leasing solutions',
    businessContext: {
      businessSize: 'small',
      annualRevenue: '$200K - $2M',
      employeeCount: '2-20',
      yearsInBusiness: '2+ years'
    },
    painPoints: [
      'Equipment-specific financing needs',
      'Vendor relationship coordination',
      'Lease vs buy decisions',
      'Equipment depreciation concerns'
    ],
    goals: [
      'Secure equipment financing',
      'Optimize lease/buy decision',
      'Coordinate with equipment vendors',
      'Maintain cash flow for operations'
    ],
    typicalJourney: [
      'Identify equipment need',
      'Research financing options',
      'Get vendor quotes',
      'Compare lease vs buy',
      'Apply for financing',
      'Coordinate delivery',
      'Begin payments'
    ],
    keyFeatures: ['Equipment catalogs', 'Lease calculator', 'Vendor network', 'Payment scheduling'],
    urgencyLevel: 'high',
    techSavviness: 'medium',
    preferredChannels: ['Online platform', 'Vendor referrals', 'Phone support']
  },
  
  [BusinessUserType.REAL_ESTATE_INVESTOR]: {
    userType: BusinessUserType.REAL_ESTATE_INVESTOR,
    displayName: 'Real Estate Investor',
    description: 'Investor focused on commercial real estate financing and property development',
    businessContext: {
      businessSize: 'medium',
      annualRevenue: '$1M - $10M',
      employeeCount: '5-30',
      yearsInBusiness: '3+ years'
    },
    painPoints: [
      'Property-specific financing requirements',
      'Market timing pressures',
      'Complex deal structures',
      'Due diligence coordination'
    ],
    goals: [
      'Secure property financing',
      'Optimize deal structures',
      'Fast closing capabilities',
      'Portfolio growth'
    ],
    typicalJourney: [
      'Identify investment opportunity',
      'Assess financing needs',
      'Get pre-approval',
      'Submit property application',
      'Complete due diligence',
      'Close financing',
      'Manage portfolio'
    ],
    keyFeatures: ['Property analysis tools', 'Market data', 'Fast pre-approval', 'Portfolio management'],
    urgencyLevel: 'urgent',
    techSavviness: 'high',
    preferredChannels: ['Specialized platform', 'Direct relationships', 'Mobile tools']
  },
  
  [BusinessUserType.WORKING_CAPITAL_SEEKER]: {
    userType: BusinessUserType.WORKING_CAPITAL_SEEKER,
    displayName: 'Working Capital Seeker',
    description: 'Business owner needing short-term working capital for operations and cash flow',
    businessContext: {
      businessSize: 'small',
      annualRevenue: '$300K - $3M',
      employeeCount: '3-15',
      yearsInBusiness: '2+ years'
    },
    painPoints: [
      'Seasonal cash flow gaps',
      'Unexpected expenses',
      'Growth investment needs',
      'Payroll and operational costs'
    ],
    goals: [
      'Bridge cash flow gaps',
      'Access quick funding',
      'Flexible repayment terms',
      'Maintain operations'
    ],
    typicalJourney: [
      'Identify cash flow need',
      'Apply for working capital',
      'Provide financial documents',
      'Get quick approval',
      'Receive funding',
      'Manage repayment'
    ],
    keyFeatures: ['Quick application', 'Fast funding', 'Flexible terms', 'Cash flow analysis'],
    urgencyLevel: 'urgent',
    techSavviness: 'medium',
    preferredChannels: ['Online application', 'Phone support', 'Mobile app']
  },
  
  [BusinessUserType.EXPANSION_FOCUSED_BUSINESS]: {
    userType: BusinessUserType.EXPANSION_FOCUSED_BUSINESS,
    displayName: 'Expansion-Focused Business',
    description: 'Established business seeking capital for expansion, new locations, or market entry',
    businessContext: {
      businessSize: 'medium',
      annualRevenue: '$2M - $20M',
      employeeCount: '15-100',
      yearsInBusiness: '5+ years'
    },
    painPoints: [
      'Large capital requirements',
      'Complex expansion planning',
      'Risk management',
      'Multiple financing needs'
    ],
    goals: [
      'Fund expansion projects',
      'Manage expansion risks',
      'Optimize financing mix',
      'Achieve growth targets'
    ],
    typicalJourney: [
      'Develop expansion strategy',
      'Calculate funding needs',
      'Explore financing options',
      'Submit comprehensive proposal',
      'Negotiate terms',
      'Execute expansion plan',
      'Monitor performance'
    ],
    keyFeatures: ['Business planning tools', 'Risk assessment', 'Multi-product solutions', 'Performance tracking'],
    urgencyLevel: 'medium',
    techSavviness: 'high',
    preferredChannels: ['Business platform', 'Advisory services', 'In-person meetings']
  },
  
  [BusinessUserType.CASH_FLOW_CONSTRAINED_BUSINESS]: {
    userType: BusinessUserType.CASH_FLOW_CONSTRAINED_BUSINESS,
    displayName: 'Cash Flow Constrained Business',
    description: 'Business experiencing cash flow challenges, needs financing to stabilize operations',
    businessContext: {
      businessSize: 'small',
      annualRevenue: '$200K - $2M',
      employeeCount: '2-20',
      yearsInBusiness: '1+ years'
    },
    painPoints: [
      'Irregular cash flow',
      'Difficulty meeting obligations',
      'Limited financing options',
      'Time-sensitive needs'
    ],
    goals: [
      'Stabilize cash flow',
      'Meet immediate obligations',
      'Improve financial position',
      'Build credit history'
    ],
    typicalJourney: [
      'Assess cash flow crisis',
      'Explore emergency funding',
      'Submit urgent application',
      'Provide detailed financials',
      'Negotiate flexible terms',
      'Implement cash flow management',
      'Work toward stability'
    ],
    keyFeatures: ['Emergency funding', 'Flexible terms', 'Cash flow tools', 'Financial counseling'],
    urgencyLevel: 'urgent',
    techSavviness: 'low',
    preferredChannels: ['Direct phone line', 'Emergency portal', 'In-person consultation']
  }
};

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
  businessUserType?: BusinessUserType; // New field for business logic user type
}
