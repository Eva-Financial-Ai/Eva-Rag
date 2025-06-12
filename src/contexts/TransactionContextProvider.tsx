import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface TransactionData {
  id: string;
  borrowerName: string;
  type: string;
  amount: number;
  status: string;
  date: string;
  customerId?: string;
  stage: string;
  // Additional properties for ContextAwareDashboard
  dealStructure?: any;
  smartMatches?: any[];
  executionData?: any;
  documents?: any[];
  complianceStatus?: string;
  riskProfile?: any;
}

export interface CustomerData {
  id: string;
  name: string;
  type: 'business' | 'individual';
}

export interface TransactionContextType {
  currentCustomer: CustomerData | null;
  currentTransaction: TransactionData | null;
  transactions: TransactionData[];
  customers: CustomerData[];
  loading: boolean;
  error: string | null;
  setCurrentCustomer: (customer: CustomerData | null) => void;
  setCurrentTransaction: (transaction: TransactionData | null) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTransaction, setCurrentTransaction] = useState<TransactionData | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerData | null>(null);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const value: TransactionContextType = {
    currentCustomer,
    currentTransaction,
    transactions: [],
    customers: [],
    loading,
    error,
    setCurrentCustomer,
    setCurrentTransaction,
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};

export const useTransactionContext = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactionContext must be used within a TransactionContextProvider');
  }
  return context;
};

export default TransactionContext;
