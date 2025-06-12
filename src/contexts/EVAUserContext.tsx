import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Types
export interface EVACustomer {
  id: string;
  name: string;
  type: 'borrower' | 'lender' | 'broker' | 'vendor';
  company?: string;
  email?: string;
  phone?: string;
  accountNumber?: string;
  status: 'active' | 'inactive' | 'pending';
  lastActivity?: string;
  totalTransactions?: number;
  totalVolume?: number;
}

export interface EVAUserContextType {
  selectedCustomer: EVACustomer | null;
  customers: EVACustomer[];
  selectCustomer: (customer: EVACustomer | null) => void;
  loadCustomers: () => Promise<void>;
  isLoading: boolean;
  searchCustomers: (query: string) => EVACustomer[];
  getCustomerContext: () => any;
  clearSelection: () => void;
}

// Create context
const EVAUserContext = createContext<EVAUserContextType | null>(null);

export const useEVAUserContext = () => {
  const context = useContext(EVAUserContext);
  if (!context) {
    throw new Error('useEVAUserContext must be used within EVAUserProvider');
  }
  return context;
};

interface EVAUserProviderProps {
  children: React.ReactNode;
}

export const EVAUserProvider: React.FC<EVAUserProviderProps> = ({ children }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<EVACustomer | null>(null);
  const [customers, setCustomers] = useState<EVACustomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load customers from localStorage or initialize with demo data
  useEffect(() => {
    const savedCustomerId = localStorage.getItem('eva_selected_customer_id');
    const savedCustomers = localStorage.getItem('eva_customers_cache');

    if (savedCustomers) {
      try {
        const parsedCustomers = JSON.parse(savedCustomers);
        setCustomers(parsedCustomers);

        if (savedCustomerId) {
          const savedCustomer = parsedCustomers.find((c: EVACustomer) => c.id === savedCustomerId);
          if (savedCustomer) {
            setSelectedCustomer(savedCustomer);
          }
        }
      } catch (error) {
        // console.error('Error loading saved data:', error);
        // Load demo customers if parsing fails
        loadDemoCustomers();
      }
    } else {
      // Load demo customers if none exist
      loadDemoCustomers();
    }
  }, []);

  // Load demo customers
  const loadDemoCustomers = useCallback(() => {
    const demoCustomers: EVACustomer[] = [
      {
        id: 'CUST-001',
        name: 'Johns Trucking',
        type: 'borrower',
        company: 'Johns Trucking LLC',
        email: 'info@johnstrucking.com',
        phone: '(555) 123-4567',
        accountNumber: 'BRW-001234',
        status: 'active',
        lastActivity: '2024-01-25',
        totalTransactions: 4,
        totalVolume: 1535000,
      },
      {
        id: 'CUST-002',
        name: 'Smith Manufacturing',
        type: 'borrower',
        company: 'Smith Manufacturing Corp',
        email: 'contact@smithmfg.com',
        phone: '(555) 234-5678',
        accountNumber: 'BRW-002345',
        status: 'active',
        lastActivity: '2024-01-24',
        totalTransactions: 2,
        totalVolume: 1200000,
      },
      {
        id: 'CUST-003',
        name: 'Green Valley Farms',
        type: 'borrower',
        company: 'Green Valley Farms LLC',
        email: 'admin@greenvalley.com',
        phone: '(555) 345-6789',
        accountNumber: 'BRW-003456',
        status: 'active',
        lastActivity: '2024-01-23',
        totalTransactions: 1,
        totalVolume: 2500000,
      },
      {
        id: 'CUST-004',
        name: 'Capital Finance Brokers',
        type: 'broker',
        company: 'Capital Finance Partners',
        email: 'deals@capitalfinance.com',
        phone: '(555) 456-7890',
        accountNumber: 'BRK-009012',
        status: 'active',
        lastActivity: '2024-01-22',
        totalTransactions: 2,
        totalVolume: 107000,
      },
      {
        id: 'CUST-005',
        name: 'Tech Solutions Inc',
        type: 'borrower',
        company: 'TechStart Solutions',
        email: 'support@techsolutions.com',
        phone: '(555) 567-8901',
        accountNumber: 'BRW-004567',
        status: 'active',
        lastActivity: '2024-01-21',
        totalTransactions: 3,
        totalVolume: 355000,
      },
    ];

    setCustomers(demoCustomers);
    localStorage.setItem('eva_customers_cache', JSON.stringify(demoCustomers));
  }, []);

  // Select customer
  const selectCustomer = useCallback((customer: EVACustomer | null) => {
    setSelectedCustomer(customer);
    if (customer) {
      localStorage.setItem('eva_selected_customer_id', customer.id);
    } else {
      localStorage.removeItem('eva_selected_customer_id');
    }
  }, []);

  // Load customers from API
  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/customers');
      // const data = await response.json();
      // setCustomers(data);

      // For now, use demo data
      if (customers.length === 0) {
        loadDemoCustomers();
      }
    } catch (error) {
      // console.error('Error loading customers:', error);
      // Fall back to demo data
      loadDemoCustomers();
    } finally {
      setIsLoading(false);
    }
  }, [customers.length, loadDemoCustomers]);

  // Search customers
  const searchCustomers = useCallback(
    (query: string) => {
      if (!query.trim()) return customers;

      const lowercaseQuery = query.toLowerCase();
      return customers.filter(
        customer =>
          customer.name.toLowerCase().includes(lowercaseQuery) ||
          customer.company?.toLowerCase().includes(lowercaseQuery) ||
          customer.email?.toLowerCase().includes(lowercaseQuery) ||
          customer.accountNumber?.toLowerCase().includes(lowercaseQuery)
      );
    },
    [customers]
  );

  // Get customer context for EVA AI
  const getCustomerContext = useCallback(() => {
    if (!selectedCustomer) return null;

    return {
      customer: selectedCustomer,
      recentActivity: `Last activity: ${selectedCustomer.lastActivity}`,
      totalTransactions: selectedCustomer.totalTransactions,
      totalVolume: selectedCustomer.totalVolume,
      accountType: selectedCustomer.type,
    };
  }, [selectedCustomer]);

  // Clear selection
  const clearSelection = useCallback(() => {
    selectCustomer(null);
  }, [selectCustomer]);

  const value: EVAUserContextType = {
    selectedCustomer,
    customers,
    selectCustomer,
    loadCustomers,
    isLoading,
    searchCustomers,
    getCustomerContext,
    clearSelection,
  };

  return <EVAUserContext.Provider value={value}>{children}</EVAUserContext.Provider>;
};
