import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../api/apiClient';

// Mock types to replace deleted backend services
export interface CustomerProfile {
  id: string;
  display_name: string;
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
    tags?: string[];
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
}

interface CustomerSelectorOptions {
  active_profiles: CustomerProfile[];
  recent_profiles: CustomerProfile[];
  favorite_profiles: CustomerProfile[];
  suggested_profiles: CustomerProfile[];
}

interface CustomerContextType {
  // Current State
  activeCustomer: CustomerProfile | null;
  selectorOptions: CustomerSelectorOptions | null;
  loading: boolean;
  error: string | null;

  // Actions
  setActiveCustomer: (customerId: string) => Promise<void>;
  clearActiveCustomer: () => void;
  refreshSelectorOptions: () => Promise<void>;
  toggleFavoriteCustomer: (customerId: string) => Promise<void>;
  
  // Customer Management
  createCustomer: (request: any) => Promise<CustomerProfile>;
  updateCustomer: (customerId: string, updates: any) => Promise<CustomerProfile>;
  deleteCustomer: (customerId: string, reason?: string) => Promise<void>;
  
  // Search and Filters
  searchCustomers: (filters: any) => Promise<CustomerProfile[]>;
  getCustomerFiles: (customerId: string, bucket?: string) => Promise<any[]>;
  
  // Utilities
  refreshActiveCustomer: () => Promise<void>;
  isCustomerFavorite: (customerId: string) => boolean;

  selectedCustomer: CustomerProfile | null;
  customerHistory: any[];
  activeTransactions: any[];
  recentActivity: any[];
  
  // Actions
  selectCustomer: (customer: CustomerProfile | null) => void;
  refreshCustomerData: (customerId: string) => Promise<void>;
  getCustomerSummary: () => string;
  getCustomerContext: () => any;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

interface CustomerProviderProps {
  children: ReactNode;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({
  children
}) => {
  const [activeCustomer, setActiveCustomerState] = useState<CustomerProfile | null>(null);
  const [selectorOptions, setSelectorOptions] = useState<CustomerSelectorOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [customerHistory, setCustomerHistory] = useState<any[]>([]);
  const [activeTransactions, setActiveTransactions] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Initialize context
  useEffect(() => {
    initializeCustomerContext();
  }, []);

  const initializeCustomerContext = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load active customer and selector options in parallel
      const [activeCustomerData, selectorOptionsData] = await Promise.all([
        // Replace with actual data loading logic
        Promise.resolve(null),
        Promise.resolve(null)
      ]);

      setActiveCustomerState(activeCustomerData);
      setSelectorOptions(selectorOptionsData);
    } catch (err) {
      // console.error('Failed to initialize customer context:', err);
      setError(err instanceof Error ? err.message : 'Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const setActiveCustomer = async (customerId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Set active customer on server
      // Replace with actual implementation
      await Promise.resolve();

      // Get updated customer profile
      const customerProfile = await Promise.resolve(null);
      setActiveCustomerState(customerProfile);

      // Refresh selector options to update recent list
      await refreshSelectorOptions();

      // Store in session storage for persistence
      sessionStorage.setItem('activeCustomerId', customerId);
    } catch (err) {
      // console.error('Failed to set active customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to set active customer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearActiveCustomer = (): void => {
    setActiveCustomerState(null);
    sessionStorage.removeItem('activeCustomerId');
  };

  const refreshSelectorOptions = async (): Promise<void> => {
    try {
      const options = await Promise.resolve(null);
      setSelectorOptions(options);
    } catch (err) {
      // console.error('Failed to refresh selector options:', err);
    }
  };

  const refreshActiveCustomer = async (): Promise<void> => {
    if (!activeCustomer) return;

    try {
      const updatedCustomer = await Promise.resolve(null);
      setActiveCustomerState(updatedCustomer);
    } catch (err) {
      // console.error('Failed to refresh active customer:', err);
    }
  };

  const toggleFavoriteCustomer = async (customerId: string): Promise<void> => {
    try {
      const isFavorite = isCustomerFavorite(customerId);
      
      if (isFavorite) {
        // Remove from favorites
        // Replace with actual implementation
        await Promise.resolve();
      } else {
        // Add to favorites (find in other lists)
        // Replace with actual implementation
        await Promise.resolve();
      }

      // Update local state optimistically
      if (selectorOptions) {
        const updatedOptions = { ...selectorOptions };
        
        if (isFavorite) {
          // Remove from favorites
          updatedOptions.favorite_profiles = updatedOptions.favorite_profiles.filter(
            customer => customer.id !== customerId
          );
        } else {
          // Add to favorites (find in other lists)
          // Replace with actual implementation
          await Promise.resolve();
        }
        
        setSelectorOptions(updatedOptions);
      }
    } catch (err) {
      // console.error('Failed to toggle favorite customer:', err);
      throw err;
    }
  };

  const createCustomer = async (request: any): Promise<CustomerProfile> => {
    try {
      setLoading(true);
      setError(null);

      const newCustomer = await Promise.resolve(null);
      
      // Refresh selector options to include new customer
      await refreshSelectorOptions();
      
      return newCustomer;
    } catch (err) {
      // console.error('Failed to create customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to create customer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (customerId: string, updates: any): Promise<CustomerProfile> => {
    try {
      setLoading(true);
      setError(null);

      const updatedCustomer = await Promise.resolve(null);
      
      // Update active customer if it's the one being updated
      if (activeCustomer?.id === customerId) {
        setActiveCustomerState(updatedCustomer);
      }
      
      // Refresh selector options
      await refreshSelectorOptions();
      
      return updatedCustomer;
    } catch (err) {
      // console.error('Failed to update customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to update customer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (customerId: string, reason?: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Replace with actual implementation
      await Promise.resolve();
      
      // Clear active customer if it's the one being deleted
      if (activeCustomer?.id === customerId) {
        clearActiveCustomer();
      }
      
      // Refresh selector options
      await refreshSelectorOptions();
    } catch (err) {
      // console.error('Failed to delete customer:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (filters: any): Promise<CustomerProfile[]> => {
    try {
      const result = await Promise.resolve([]);
      return result;
    } catch (err) {
      // console.error('Failed to search customers:', err);
      throw err;
    }
  };

  const getCustomerFiles = async (customerId: string, bucket?: string): Promise<any[]> => {
    try {
      return await Promise.resolve([]);
    } catch (err) {
      // console.error('Failed to get customer files:', err);
      throw err;
    }
  };

  const isCustomerFavorite = (customerId: string): boolean => {
    return selectorOptions?.favorite_profiles.some(customer => customer.id === customerId) || false;
  };

  // Session persistence
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'activeCustomerId' && e.newValue !== e.oldValue) {
        if (e.newValue) {
          // Load the customer profile
          // Replace with actual implementation
          Promise.resolve()
            .then(() => setActiveCustomerState(null))
            .catch(console.error);
        } else {
          setActiveCustomerState(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-refresh selector options periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSelectorOptions();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, []);

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

  const contextValue: CustomerContextType = {
    // State
    activeCustomer,
    selectorOptions,
    loading,
    error,

    // Actions
    setActiveCustomer,
    clearActiveCustomer,
    refreshSelectorOptions,
    toggleFavoriteCustomer,

    // Customer Management
    createCustomer,
    updateCustomer,
    deleteCustomer,

    // Search and Filters
    searchCustomers,
    getCustomerFiles,

    // Utilities
    refreshActiveCustomer,
    isCustomerFavorite,

    selectedCustomer,
    customerHistory,
    activeTransactions,
    recentActivity,
    selectCustomer,
    refreshCustomerData,
    getCustomerSummary,
    getCustomerContext
  };

  return (
    <CustomerContext.Provider value={contextValue}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = (): CustomerContextType => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

export default CustomerContext;
