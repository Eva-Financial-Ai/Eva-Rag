// Team Role Types and Permissions System

export type OrganizationType = 'borrower' | 'vendor' | 'broker' | 'lender';

export interface TierPermission {
  tier: number;
  name: string;
  description: string;
  monetaryLimit?: number;
  dataAccessScope: string[];
  communicationRights: string[];
  approvalAuthority: string[];
  restrictions: {
    geographic?: string[];
    timeAccess?: {
      startHour: number;
      endHour: number;
      daysOfWeek: number[];
    };
    requiresApproval?: string[];
  };
}

export interface TeamRole {
  organizationType: OrganizationType;
  tiers: TierPermission[];
}

// Borrower Team Roles (Companies seeking loans)
export const BORROWER_ROLES: TeamRole = {
  organizationType: 'borrower',
  tiers: [
    {
      tier: 1,
      name: 'Owner/CEO',
      description: 'Full control over all loan applications and company financial decisions',
      monetaryLimit: undefined, // No limit
      dataAccessScope: ['all'],
      communicationRights: ['all'],
      approvalAuthority: [
        'loan_application',
        'financial_statements',
        'legal_documents',
        'team_management',
      ],
      restrictions: {},
    },
    {
      tier: 2,
      name: 'CFO',
      description: 'Financial decisions and loan approvals up to $5M',
      monetaryLimit: 5000000,
      dataAccessScope: ['financial', 'loans', 'banking', 'team_financial'],
      communicationRights: ['lenders', 'brokers', 'internal_all'],
      approvalAuthority: ['loan_application_under_5m', 'financial_statements', 'banking_changes'],
      restrictions: {
        requiresApproval: ['loans_over_5m', 'equity_decisions'],
      },
    },
    {
      tier: 3,
      name: 'Controller',
      description: 'Create and manage loan drafts up to $1M',
      monetaryLimit: 1000000,
      dataAccessScope: ['financial_reports', 'loan_drafts', 'accounting'],
      communicationRights: ['brokers', 'internal_finance'],
      approvalAuthority: ['draft_creation', 'document_upload', 'minor_corrections'],
      restrictions: {
        requiresApproval: ['loan_submission', 'loans_over_1m'],
      },
    },
    {
      tier: 4,
      name: 'Accounting Staff',
      description: 'Support documentation and data entry',
      monetaryLimit: 0,
      dataAccessScope: ['financial_documents', 'basic_loan_info'],
      communicationRights: ['internal_finance'],
      approvalAuthority: ['document_upload'],
      restrictions: {
        requiresApproval: ['loan_creation', 'financial_changes'],
        timeAccess: {
          startHour: 8,
          endHour: 18,
          daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        },
      },
    },
    {
      tier: 5,
      name: 'Operations Manager',
      description: 'View-only access to loan status and basic information',
      monetaryLimit: 0,
      dataAccessScope: ['loan_status', 'basic_company_info'],
      communicationRights: ['internal_ops'],
      approvalAuthority: [],
      restrictions: {
        requiresApproval: ['any_modification'],
      },
    },
    {
      tier: 6,
      name: 'Admin Assistant',
      description: 'Minimal access for scheduling and basic administrative tasks',
      monetaryLimit: 0,
      dataAccessScope: ['calendar', 'contact_info'],
      communicationRights: ['internal_admin'],
      approvalAuthority: [],
      restrictions: {
        requiresApproval: ['any_data_access'],
        timeAccess: {
          startHour: 9,
          endHour: 17,
          daysOfWeek: [1, 2, 3, 4, 5],
        },
      },
    },
  ],
};

// Vendor Team Roles (Asset sellers)
export const VENDOR_ROLES: TeamRole = {
  organizationType: 'vendor',
  tiers: [
    {
      tier: 1,
      name: 'Owner/President',
      description: 'Full control over all vendor operations and pricing',
      monetaryLimit: undefined,
      dataAccessScope: ['all'],
      communicationRights: ['all'],
      approvalAuthority: ['pricing', 'inventory', 'contracts', 'team_management'],
      restrictions: {},
    },
    {
      tier: 2,
      name: 'Sales Director',
      description: 'Strategic sales management and major deal approval',
      monetaryLimit: 10000000,
      dataAccessScope: ['sales', 'inventory', 'pricing', 'customer_data', 'team_sales'],
      communicationRights: ['all_customers', 'brokers', 'lenders'],
      approvalAuthority: ['pricing_changes', 'major_deals', 'sales_team_management'],
      restrictions: {
        requiresApproval: ['exclusive_contracts'],
      },
    },
    {
      tier: 3,
      name: 'Sales Manager',
      description: 'Day-to-day sales operations and standard deal approval',
      monetaryLimit: 2000000,
      dataAccessScope: ['sales_pipeline', 'inventory', 'standard_pricing', 'team_reports'],
      communicationRights: ['assigned_customers', 'brokers'],
      approvalAuthority: ['standard_deals', 'discount_up_to_10_percent'],
      restrictions: {
        requiresApproval: ['pricing_changes', 'deals_over_2m'],
      },
    },
    {
      tier: 4,
      name: 'Senior Sales Rep',
      description: 'Handle complex deals and customer relationships',
      monetaryLimit: 500000,
      dataAccessScope: ['assigned_accounts', 'inventory', 'pricing_view'],
      communicationRights: ['assigned_customers'],
      approvalAuthority: ['quote_generation', 'standard_terms'],
      restrictions: {
        requiresApproval: ['custom_pricing', 'deals_over_500k'],
        geographic: ['assigned_territory'],
      },
    },
    {
      tier: 5,
      name: 'Junior Sales Rep',
      description: 'Basic sales transactions and customer inquiries',
      monetaryLimit: 100000,
      dataAccessScope: ['basic_inventory', 'list_pricing'],
      communicationRights: ['customer_inquiries'],
      approvalAuthority: ['information_requests'],
      restrictions: {
        requiresApproval: ['any_deal_closure', 'pricing_exceptions'],
        timeAccess: {
          startHour: 8,
          endHour: 18,
          daysOfWeek: [1, 2, 3, 4, 5],
        },
      },
    },
    {
      tier: 6,
      name: 'Sales Support',
      description: 'Data entry and administrative support',
      monetaryLimit: 0,
      dataAccessScope: ['data_entry_forms'],
      communicationRights: ['internal_sales'],
      approvalAuthority: [],
      restrictions: {
        requiresApproval: ['customer_contact', 'data_modification'],
        timeAccess: {
          startHour: 9,
          endHour: 17,
          daysOfWeek: [1, 2, 3, 4, 5],
        },
      },
    },
  ],
};

// Broker Team Roles (Loan intermediaries)
export const BROKER_ROLES: TeamRole = {
  organizationType: 'broker',
  tiers: [
    {
      tier: 1,
      name: 'Principal/Owner',
      description: 'Full brokerage control and compliance oversight',
      monetaryLimit: undefined,
      dataAccessScope: ['all'],
      communicationRights: ['all'],
      approvalAuthority: ['all_loans', 'compliance', 'team_management', 'commission_structure'],
      restrictions: {},
    },
    {
      tier: 2,
      name: 'Managing Broker',
      description: 'Office operations and loan approval oversight',
      monetaryLimit: 20000000,
      dataAccessScope: ['all_loans', 'team_performance', 'compliance_reports'],
      communicationRights: ['all_lenders', 'all_clients', 'team'],
      approvalAuthority: ['loan_submission', 'team_assignments', 'commission_approval'],
      restrictions: {
        requiresApproval: ['compliance_changes', 'partnership_agreements'],
      },
    },
    {
      tier: 3,
      name: 'Senior Loan Officer',
      description: 'Independent loan portfolio management',
      monetaryLimit: 5000000,
      dataAccessScope: ['own_portfolio', 'lender_programs', 'market_rates'],
      communicationRights: ['own_clients', 'all_lenders'],
      approvalAuthority: ['own_loan_submission', 'client_agreements'],
      restrictions: {
        requiresApproval: ['loans_over_5m', 'new_lender_relationships'],
      },
    },
    {
      tier: 4,
      name: 'Loan Officer',
      description: 'Supervised loan origination and client management',
      monetaryLimit: 2000000,
      dataAccessScope: ['assigned_loans', 'basic_lender_info'],
      communicationRights: ['assigned_clients', 'approved_lenders'],
      approvalAuthority: ['loan_preparation'],
      restrictions: {
        requiresApproval: ['loan_submission', 'loans_over_2m', 'rate_exceptions'],
      },
    },
    {
      tier: 5,
      name: 'Processor',
      description: 'Documentation handling and compliance checking',
      monetaryLimit: 0,
      dataAccessScope: ['assigned_files', 'document_checklists'],
      communicationRights: ['internal_team', 'document_requests'],
      approvalAuthority: ['document_collection'],
      restrictions: {
        requiresApproval: ['client_communication', 'lender_communication'],
        timeAccess: {
          startHour: 8,
          endHour: 18,
          daysOfWeek: [1, 2, 3, 4, 5],
        },
      },
    },
    {
      tier: 6,
      name: 'Marketing Assistant',
      description: 'Basic administrative and marketing tasks',
      monetaryLimit: 0,
      dataAccessScope: ['marketing_materials', 'contact_lists'],
      communicationRights: ['internal_marketing'],
      approvalAuthority: [],
      restrictions: {
        requiresApproval: ['client_data_access', 'external_communication'],
        timeAccess: {
          startHour: 9,
          endHour: 17,
          daysOfWeek: [1, 2, 3, 4, 5],
        },
      },
    },
  ],
};

// Lender Team Roles (Financial institutions)
export const LENDER_ROLES: TeamRole = {
  organizationType: 'lender',
  tiers: [
    {
      tier: 1,
      name: 'Chief Credit Officer',
      description: 'All lending decisions and policy setting',
      monetaryLimit: undefined,
      dataAccessScope: ['all'],
      communicationRights: ['all'],
      approvalAuthority: ['all_loans', 'credit_policy', 'team_management', 'risk_parameters'],
      restrictions: {},
    },
    {
      tier: 2,
      name: 'Senior Underwriter',
      description: 'Complex loan approval up to $10M',
      monetaryLimit: 10000000,
      dataAccessScope: ['all_applications', 'risk_models', 'portfolio_analytics'],
      communicationRights: ['brokers', 'borrowers', 'internal_all'],
      approvalAuthority: ['loan_approval_under_10m', 'exception_requests', 'team_decisions'],
      restrictions: {
        requiresApproval: ['loans_over_10m', 'policy_exceptions'],
      },
    },
    {
      tier: 3,
      name: 'Underwriter',
      description: 'Standard loan approval up to $2M',
      monetaryLimit: 2000000,
      dataAccessScope: ['assigned_applications', 'credit_reports', 'risk_guidelines'],
      communicationRights: ['assigned_brokers', 'internal_credit'],
      approvalAuthority: ['loan_approval_under_2m', 'standard_conditions'],
      restrictions: {
        requiresApproval: ['loans_over_2m', 'guideline_exceptions'],
      },
    },
    {
      tier: 4,
      name: 'Loan Analyst',
      description: 'Application processing and initial review',
      monetaryLimit: 0,
      dataAccessScope: ['application_data', 'basic_credit_info'],
      communicationRights: ['internal_underwriting'],
      approvalAuthority: ['document_verification', 'initial_review'],
      restrictions: {
        requiresApproval: ['credit_decisions', 'external_communication'],
        timeAccess: {
          startHour: 8,
          endHour: 18,
          daysOfWeek: [1, 2, 3, 4, 5],
        },
      },
    },
    {
      tier: 5,
      name: 'Customer Service',
      description: 'Basic loan status inquiries and support',
      monetaryLimit: 0,
      dataAccessScope: ['loan_status', 'payment_info'],
      communicationRights: ['customer_support'],
      approvalAuthority: ['information_provision'],
      restrictions: {
        requiresApproval: ['account_changes', 'sensitive_info_access'],
        timeAccess: {
          startHour: 8,
          endHour: 20,
          daysOfWeek: [1, 2, 3, 4, 5, 6], // Including Saturday
        },
      },
    },
    {
      tier: 6,
      name: 'Data Entry',
      description: 'Administrative support and data management',
      monetaryLimit: 0,
      dataAccessScope: ['data_entry_screens'],
      communicationRights: ['internal_admin'],
      approvalAuthority: [],
      restrictions: {
        requiresApproval: ['any_data_modification', 'report_generation'],
        timeAccess: {
          startHour: 9,
          endHour: 17,
          daysOfWeek: [1, 2, 3, 4, 5],
        },
      },
    },
  ],
};

// Helper function to get role configuration
export function getRoleConfiguration(organizationType: OrganizationType): TeamRole {
  switch (organizationType) {
    case 'borrower':
      return BORROWER_ROLES;
    case 'vendor':
      return VENDOR_ROLES;
    case 'broker':
      return BROKER_ROLES;
    case 'lender':
      return LENDER_ROLES;
    default:
      throw new Error(`Unknown organization type: ${organizationType}`);
  }
}

// Helper function to check if a user can perform an action based on tier
export function canPerformAction(
  userTier: number,
  organizationType: OrganizationType,
  action: string,
  amount?: number
): boolean {
  const roleConfig = getRoleConfiguration(organizationType);
  const tierPermission = roleConfig.tiers.find(t => t.tier === userTier);

  if (!tierPermission) return false;

  // Check monetary limit if applicable
  if (
    amount &&
    tierPermission.monetaryLimit !== undefined &&
    amount > tierPermission.monetaryLimit
  ) {
    return false;
  }

  // Check if action is in approval authority
  return (
    tierPermission.approvalAuthority.includes(action) ||
    tierPermission.approvalAuthority.includes('all')
  );
}

// Helper function to get users who can approve an action
export function getApproversForAction(
  organizationType: OrganizationType,
  action: string,
  amount?: number
): number[] {
  const roleConfig = getRoleConfiguration(organizationType);
  const approverTiers: number[] = [];

  roleConfig.tiers.forEach(tier => {
    // Check if this tier can approve the action
    if (tier.approvalAuthority.includes(action) || tier.approvalAuthority.includes('all')) {
      // Check monetary limit if applicable
      if (!amount || tier.monetaryLimit === undefined || amount <= tier.monetaryLimit) {
        approverTiers.push(tier.tier);
      }
    }
  });

  return approverTiers;
}
