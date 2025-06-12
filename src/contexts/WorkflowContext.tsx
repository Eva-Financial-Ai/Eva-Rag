import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import * as transactionService from '../api/transactionService';
import { Metrics, TimeMetrics, TransactionTimeTracking } from '../types/transaction';
import { useLocation, useNavigate } from 'react-router-dom';
import performanceMonitor from '../utils/performance';

// Define the workflow stage type
export type WorkflowStage = 
  | 'application' 
  | 'document_collection' 
  | 'underwriting' 
  | 'smart_matching_decision'  // New step 9
  | 'approval' 
  | 'deal_structuring'
  | 'closing' 
  | 'funding' 
  | 'post_closing'
  // Additional stages for compatibility
  | 'risk_assessment'
  | 'approval_decision'
  | 'document_execution';

// Define transaction types
export interface Transaction {
  id: string;
  type: string;
  data: any;
  createdAt: string;
  stage: WorkflowStage;
  status: 'active' | 'complete' | 'pending';
  // Additional properties needed by other components
  amount?: number;
  applicantData?: {
    id: string;
    name: string;
    entityType?: string;
    industryCode?: string;
    financials?: any;
  };
  currentStage?: WorkflowStage;
  // Additional properties needed for Transactions page
  approvedDeal?: {
    term: number;
    rate: number;
    payment: number;
    downPayment: number;
    covenants?: any[];
    approvedAt?: string;
  };
  // Properties for blockchain verification
  blockchainVerified?: boolean;
  blockchainTxId?: string;
  verificationTimestamp?: string;
  // Risk profile data
  riskProfile?: {
    overallScore: number;
    creditScore?: {
      business: number;
      personal: number;
    };
    financialRatios?: any[];
    riskFactors?: any[];
    aiInsights?: string[];
  };
}

// Define the workflow context interface
interface WorkflowContextType {
  currentTransaction: Transaction | null;
  transactions: Transaction[];
  addTransaction: (type: string, data: any) => string;
  advanceStage: (stage: WorkflowStage, transactionId?: string) => void;
  getTransactionsByStage: (stage: WorkflowStage) => Transaction[];
  // Additional properties needed by other components
  loading?: boolean;
  error?: string | null;
  fetchTransactions?: () => Promise<void>;
  updateTransaction?: (transaction: Transaction) => Promise<Transaction | null>;
  setCurrentTransaction?: (transaction: Transaction | null) => void;
  getTimeElapsedFormatted?: (transactionIdOrObject: string | Transaction) => string;
  getTimeInStageFormatted?: (transactionIdOrObject: string | Transaction) => string;
  navigateToRiskAssessment?: () => Transaction | null;
}

// Create the context with default values
const WorkflowContext = createContext<WorkflowContextType>({
  currentTransaction: null,
  transactions: [],
  addTransaction: () => '',
  advanceStage: () => {},
  getTransactionsByStage: () => [],
  // Additional defaults
  loading: false,
  error: null,
  fetchTransactions: async () => {},
  updateTransaction: async () => null,
  setCurrentTransaction: () => {},
  getTimeElapsedFormatted: () => '0d 0h 0m',
  getTimeInStageFormatted: () => '0d 0h 0m',
  navigateToRiskAssessment: () => null,
});

// Provider component
interface WorkflowProviderProps {
  children: ReactNode;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get the current transaction
  const currentTransaction = transactions.find(t => t.id === currentTransactionId) || null;

  // Add a new transaction
  const addTransaction = useCallback((type: string, data: any): string => {
    const id = `tx-${Date.now()}`;
    const newTransaction: Transaction = {
      id,
      type,
      data,
      createdAt: new Date().toISOString(),
      stage: 'application',
      status: 'active',
      // Set amount if provided in data
      amount: data.requestedAmount,
      // Set applicantData if provided
      applicantData: {
        id: `applicant-${Date.now()}`,
        name: data.applicantName || data.businessName || 'Demo Applicant',
        entityType: data.industry || 'Business',
        industryCode: data.industry || 'MISC',
      },
      currentStage: 'application'
    };

    setTransactions(prev => [...prev, newTransaction]);
    setCurrentTransactionId(id);
    return id;
  }, []);

  // Advance a transaction to the next stage
  const advanceStage = useCallback((stage: WorkflowStage, transactionId?: string): void => {
    const txId = transactionId || currentTransactionId;
    if (!txId) return;

    setTransactions(prev => prev.map(tx => 
      tx.id === txId ? { ...tx, stage, currentStage: stage } : tx
    ));
  }, [currentTransactionId]);

  // Get transactions by stage
  const getTransactionsByStage = useCallback((stage: WorkflowStage): Transaction[] => {
    return transactions.filter(tx => tx.stage === stage);
  }, [transactions]);

  // Set current transaction
  const setCurrentTransaction = useCallback((transaction: Transaction | null) => {
    if (transaction) {
      setCurrentTransactionId(transaction.id);
    } else {
      setCurrentTransactionId(null);
    }
  }, []);

  // Mock implementation of fetch transactions
  const fetchTransactions = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // In a real implementation, this would call an API
      // For demo, we'll just wait a bit to simulate network activity
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // If no transactions exist, create a mock one
      if (transactions.length === 0) {
        const mockTransaction: Transaction = {
          id: `tx-${Date.now()}`,
          type: 'loan',
          data: {
            requestedAmount: 250000,
            applicantName: 'Demo Applicant',
            businessName: 'Demo Business LLC',
            purpose: 'Equipment Purchase',
            term: 60
          },
          createdAt: new Date().toISOString(),
          stage: 'application',
          status: 'active',
          amount: 250000,
          applicantData: {
            id: `applicant-${Date.now()}`,
            name: 'Demo Applicant',
            entityType: 'Business',
            industryCode: 'MISC',
          },
          currentStage: 'application'
        };
        setTransactions([mockTransaction]);
        setCurrentTransactionId(mockTransaction.id);
      }
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  // Mock implementation of update transaction
  const updateTransaction = useCallback(async (transaction: Transaction): Promise<Transaction | null> => {
    try {
      // Update the transactions array with the new transaction data
      setTransactions(prev => 
        prev.map(tx => tx.id === transaction.id ? transaction : tx)
      );
      return transaction;
    } catch (err) {
      setError('Failed to update transaction');
      return null;
    }
  }, []);

  // Basic formatted time representations
  const formatTimeElapsed = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;
    return `${days}d ${remainingHours}h ${remainingMinutes}m`;
  };

  // Get formatted time elapsed
  const getTimeElapsedFormatted = useCallback((transactionIdOrObject: string | Transaction): string => {
    let transaction: Transaction | undefined;
    
    if (typeof transactionIdOrObject === 'string') {
      transaction = transactions.find(t => t.id === transactionIdOrObject);
    } else {
      transaction = transactionIdOrObject;
    }
    
    if (!transaction || !transaction.createdAt) return '0d 0h 0m';
    
    const createdTime = new Date(transaction.createdAt).getTime();
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - createdTime;
    
    return formatTimeElapsed(elapsedTime);
  }, [transactions]);

  // Get formatted time in stage - simple implementation
  const getTimeInStageFormatted = useCallback((): string => {
    return '0d 0h 0m'; // Simplified for demo
  }, []);

  // Navigate to risk assessment
  const navigateToRiskAssessment = useCallback((): Transaction | null => {
    navigate('/risk-assessment');
    return currentTransaction;
  }, [currentTransaction, navigate]);

  return (
    <WorkflowContext.Provider
      value={{
        currentTransaction,
        transactions,
        addTransaction,
        advanceStage,
        getTransactionsByStage,
        // Additional properties
        loading,
        error,
        fetchTransactions,
        updateTransaction,
        setCurrentTransaction,
        getTimeElapsedFormatted,
        getTimeInStageFormatted,
        navigateToRiskAssessment
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

// Hook for using the workflow context
export const useWorkflow = () => useContext(WorkflowContext);

export default WorkflowContext;
