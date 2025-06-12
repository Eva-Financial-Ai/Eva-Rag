import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CustomerProfile {
  id: string;
  display_name: string;
  businessName?: string; // Added for compatibility
  type: 'individual' | 'business' | 'broker' | 'asset-seller' | 'service-provider';
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  
  // Financial Information
  metadata: {
    credit_score?: number;
    annual_income?: number;
    industry?: string;
    risk_level?: 'low' | 'medium' | 'high';
    loan_history?: LoanHistory[];
    assets?: AssetInfo[];
    liabilities?: LiabilityInfo[];
    business_info?: BusinessInfo;
  };
  
  // Profile Details
  profile: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    date_of_birth?: string;
    ssn_last_four?: string;
    employment_status?: string;
    employer?: string;
    job_title?: string;
    years_at_job?: number;
  };
  
  // Preferences & Settings
  preferences: {
    communication_method: 'email' | 'phone' | 'text' | 'portal';
    language: string;
    timezone: string;
    loan_purposes?: string[];
    preferred_loan_terms?: string[];
  };
}

interface LoanHistory {
  id: string;
  type: string;
  amount: number;
  status: 'current' | 'paid-off' | 'defaulted';
  payment_history: 'excellent' | 'good' | 'fair' | 'poor';
  originated_date: string;
}

interface AssetInfo {
  type: 'real-estate' | 'vehicle' | 'equipment' | 'investment' | 'cash';
  description: string;
  value: number;
  verified: boolean;
}

interface LiabilityInfo {
  type: 'credit-card' | 'loan' | 'mortgage' | 'line-of-credit';
  creditor: string;
  balance: number;
  monthly_payment: number;
  verified: boolean;
}

interface BusinessInfo {
  legal_name: string;
  dba_name?: string;
  tax_id: string;
  entity_type: 'llc' | 'corporation' | 'partnership' | 'sole-proprietorship';
  years_in_business: number;
  annual_revenue: number;
  employees: number;
  industry_code: string;
  business_address: string;
  business_records?: any[];
  last_lookup_date?: string;
}

interface EVACustomerContextType {
  selectedCustomer: CustomerProfile | null;
  customerHistory: any[];
  activeTransactions: any[];
  recentActivity: any[];
  availableDocuments?: any[]; // Added for compatibility
  
  // Actions
  selectCustomer: (customer: CustomerProfile | null) => void;
  refreshCustomerData: (customerId: string) => Promise<void>;
  updateCustomerBusinessRecords: (customerId: string, businessRecords: any[]) => Promise<void>;
  getCustomerSummary: () => string;
  getCustomerContext: () => any;
}

const EVACustomerContext = createContext<EVACustomerContextType | undefined>(undefined);

interface EVACustomerProviderProps {
  children: ReactNode;
}

export const EVACustomerProvider: React.FC<EVACustomerProviderProps> = ({ children }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [customerHistory, setCustomerHistory] = useState<any[]>([]);
  const [activeTransactions, setActiveTransactions] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Mock customer data - in production this would come from API
  const mockCustomers: CustomerProfile[] = [
    {
      id: 'CUST-001',
      display_name: 'John Smith',
      type: 'individual',
      email: 'john.smith@email.com',
      phone: '555-0123',
      status: 'active',
      createdAt: '2023-01-15',
      metadata: {
        credit_score: 720,
        annual_income: 85000,
        risk_level: 'low',
        loan_history: [
          {
            id: 'LOAN-001',
            type: 'Auto Loan',
            amount: 35000,
            status: 'current',
            payment_history: 'excellent',
            originated_date: '2022-06-15'
          }
        ],
        assets: [
          {
            type: 'real-estate',
            description: 'Primary residence',
            value: 450000,
            verified: true
          },
          {
            type: 'vehicle',
            description: '2022 Honda Accord',
            value: 28000,
            verified: true
          }
        ],
        liabilities: [
          {
            type: 'mortgage',
            creditor: 'First National Bank',
            balance: 280000,
            monthly_payment: 1850,
            verified: true
          }
        ]
      },
      profile: {
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
        date_of_birth: '1985-03-15',
        ssn_last_four: '1234',
        employment_status: 'employed',
        employer: 'Tech Solutions Inc',
        job_title: 'Senior Developer',
        years_at_job: 5
      },
      preferences: {
        communication_method: 'email',
        language: 'en',
        timezone: 'America/Chicago',
        loan_purposes: ['home-improvement', 'debt-consolidation'],
        preferred_loan_terms: ['36-months', '60-months']
      }
    },
    {
      id: 'CUST-002',
      display_name: 'Smith Manufacturing LLC',
      type: 'business',
      email: 'info@smithmfg.com',
      phone: '555-0124',
      status: 'active',
      createdAt: '2023-02-20',
      metadata: {
        credit_score: 680,
        annual_income: 2500000,
        industry: 'Manufacturing',
        risk_level: 'medium',
        business_info: {
          legal_name: 'Smith Manufacturing LLC',
          tax_id: '12-3456789',
          entity_type: 'llc',
          years_in_business: 8,
          annual_revenue: 2500000,
          employees: 45,
          industry_code: 'NAICS-336',
          business_address: '456 Industrial Blvd, Chicago, IL 60601'
        },
        assets: [
          {
            type: 'equipment',
            description: 'Manufacturing equipment',
            value: 850000,
            verified: true
          },
          {
            type: 'real-estate',
            description: 'Manufacturing facility',
            value: 1200000,
            verified: true
          }
        ]
      },
      profile: {
        address: '456 Industrial Blvd',
        city: 'Chicago',
        state: 'IL',
        zip: '60601'
      },
      preferences: {
        communication_method: 'email',
        language: 'en',
        timezone: 'America/Chicago',
        loan_purposes: ['equipment-financing', 'working-capital'],
        preferred_loan_terms: ['12-months', '24-months', '36-months']
      }
    }
  ];

  const selectCustomer = (customer: CustomerProfile | null) => {
    setSelectedCustomer(customer);
    if (customer) {
      // Load customer-specific data
      loadCustomerData(customer.id);
    } else {
      // Clear customer-specific data
      setCustomerHistory([]);
      setActiveTransactions([]);
      setRecentActivity([]);
    }
  };

  const loadCustomerData = async (customerId: string) => {
    // Mock loading customer history and transactions
    // In production, this would be API calls
    
    const mockHistory = [
      {
        id: 'HIST-001',
        type: 'loan_application',
        description: 'Applied for personal loan',
        amount: 15000,
        status: 'approved',
        date: '2023-08-15',
        outcome: 'Approved with 6.5% APR'
      },
      {
        id: 'HIST-002',
        type: 'payment',
        description: 'Auto loan payment',
        amount: 485,
        status: 'completed',
        date: '2023-09-01'
      }
    ];

    const mockTransactions = [
      {
        id: 'TXN-001',
        type: 'loan_application',
        status: 'in_review',
        amount: 25000,
        purpose: 'home improvement',
        submitted_date: '2023-09-20',
        estimated_decision: '2023-09-25'
      }
    ];

    const mockActivity = [
      {
        id: 'ACT-001',
        type: 'document_upload',
        description: 'Uploaded tax returns',
        timestamp: '2023-09-22T10:30:00Z'
      },
      {
        id: 'ACT-002',
        type: 'chat_session',
        description: 'Chatted with EVA about loan options',
        timestamp: '2023-09-21T14:15:00Z'
      }
    ];

    setCustomerHistory(mockHistory);
    setActiveTransactions(mockTransactions);
    setRecentActivity(mockActivity);
  };

  const refreshCustomerData = async (customerId: string) => {
    await loadCustomerData(customerId);
  };

  const updateCustomerBusinessRecords = async (customerId: string, businessRecords: any[]) => {
    try {
      // Update the selected customer's business records
      if (selectedCustomer && selectedCustomer.id === customerId) {
        const updatedCustomer = {
          ...selectedCustomer,
          metadata: {
            ...selectedCustomer.metadata,
            business_info: {
              ...selectedCustomer.metadata.business_info!,
              business_records: businessRecords,
              last_lookup_date: new Date().toISOString()
            }
          }
        };
        setSelectedCustomer(updatedCustomer);
      }

      // Store in local storage for persistence
      if (businessRecords.length > 0) {
        localStorage.setItem(`business_records_${customerId}`, JSON.stringify(businessRecords));
      }
    } catch (error) {
      console.error('Failed to update customer business records:', error);
      throw error;
    }
  };

  const getCustomerSummary = (): string => {
    if (!selectedCustomer) return 'No customer selected';

    const customer = selectedCustomer;
    const riskLevel = customer.metadata.risk_level || 'unknown';
    const creditScore = customer.metadata.credit_score || 'N/A';
    const income = customer.metadata.annual_income || 0;
    
    let summary = `Customer: ${customer.display_name} (${customer.type})\n`;
    summary += `Credit Score: ${creditScore} | Risk Level: ${riskLevel.toUpperCase()}\n`;
    summary += `Annual Income: $${income.toLocaleString()}\n`;
    
    if (customer.metadata.business_info) {
      const biz = customer.metadata.business_info;
      summary += `Business: ${biz.legal_name} | ${biz.years_in_business} years | ${biz.employees} employees\n`;
      summary += `Industry: ${customer.metadata.industry} | Revenue: $${biz.annual_revenue.toLocaleString()}\n`;
    }
    
    if (customer.profile.employment_status) {
      summary += `Employment: ${customer.profile.job_title} at ${customer.profile.employer} (${customer.profile.years_at_job} years)\n`;
    }
    
    summary += `Active Transactions: ${activeTransactions.length}\n`;
    summary += `Communication Preference: ${customer.preferences.communication_method}\n`;
    
    if (customer.metadata.loan_history && customer.metadata.loan_history.length > 0) {
      summary += `Loan History: ${customer.metadata.loan_history.length} previous loans\n`;
    }

    return summary;
  };

  const getCustomerContext = () => {
    return {
      profile: selectedCustomer,
      history: customerHistory,
      transactions: activeTransactions,
      activity: recentActivity,
      summary: getCustomerSummary()
    };
  };

  const contextValue: EVACustomerContextType = {
    selectedCustomer,
    customerHistory,
    activeTransactions,
    recentActivity,
    availableDocuments: [], // Added empty array for compatibility
    selectCustomer,
    refreshCustomerData,
    updateCustomerBusinessRecords,
    getCustomerSummary,
    getCustomerContext
  };

  return (
    <EVACustomerContext.Provider value={contextValue}>
      {children}
    </EVACustomerContext.Provider>
  );
};

export const useEVACustomer = (): EVACustomerContextType => {
  const context = useContext(EVACustomerContext);
  if (!context) {
    throw new Error('useEVACustomer must be used within an EVACustomerProvider');
  }
  return context;
};

// Alias for convenience
export const useEVACustomerContext = useEVACustomer;

export default EVACustomerContext; 