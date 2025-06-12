import React, { createContext, useState, useContext, ReactNode } from 'react';
// import { TransactionFilters, getTransactionsForCustomer } from '../services/TransactionService'; // Import service and types

// Define TransactionFilters locally since it's not exported from TransactionService
export interface TransactionFilters {
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Mock implementation of getTransactionsForCustomer
const getTransactionsForCustomer = async (
  customerId: string,
  filters?: TransactionFilters,
  searchTerm?: string
): Promise<Transaction[]> => {
  // Mock implementation - replace with actual API call
  return [];
};

// Updated Transaction interface to include more details from the mock service
export interface Transaction {
  id: string;
  customerId: string; // Added customerId for linking
  borrowerName?: string;
  type?: string;
  amount?: number;
  status?: string;
  date?: string;
  evaRiskScore?: number;
  stage?: string;
  description?: string;
}

interface TransactionContextType {
  selectedTransaction: Transaction | null;
  setSelectedTransaction: (transaction: Transaction | null) => void;
  transactions: Transaction[];
  // setTransactions: (transactions: Transaction[]) => void; // Phasing out
  isLoadingTransactions: boolean;
  transactionError: Error | null;
  fetchTransactions: (
    customerId: string,
    filters?: TransactionFilters,
    searchTerm?: string
  ) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTransaction, setSelectedTransactionState] = useState<Transaction | null>(null);
  const [transactions, setTransactionsState] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false);
  const [transactionError, setTransactionError] = useState<Error | null>(null);

  const fetchTransactions = async (
    customerId: string,
    filters?: TransactionFilters,
    searchTerm?: string
  ) => {
    if (!customerId) {
      setTransactionsState([]); // Clear transactions if no customerId
      setSelectedTransactionState(null); // Clear selected transaction too
      return;
    }
    setIsLoadingTransactions(true);
    setTransactionError(null);
    try {
      const data = await getTransactionsForCustomer(customerId, filters, searchTerm);
      setTransactionsState(data);
    } catch (err) {
      setTransactionError(err as Error);
      setTransactionsState([]); // Clear transactions on error
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const setSelectedTransaction = (transaction: Transaction | null) => {
    setSelectedTransactionState(transaction);
  };

  // Direct setter for transactions, if needed for other purposes (e.g., optimistic updates, though not used here yet)
  // For now, fetchTransactions is the main way to populate this.
  // const setTransactions = (transactionList: Transaction[]) => {
  //   setTransactionsState(transactionList);
  // };

  return (
    <TransactionContext.Provider
      value={{
        selectedTransaction,
        setSelectedTransaction,
        transactions,
        // setTransactions, // Phasing out direct setter
        isLoadingTransactions,
        transactionError,
        fetchTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};
