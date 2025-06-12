import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { CustomerProfile } from './EVACustomerContext';

import { debugLog } from '../utils/auditLogger';

export interface TransactionDocument {
  id: string;
  name: string;
  type:
    | 'credit_application'
    | 'bank_statements'
    | 'tax_returns'
    | 'financial_statements'
    | 'collateral_documents'
    | 'identity_verification'
    | 'business_license'
    | 'appraisal';
  status: 'pending' | 'received' | 'verified' | 'incomplete';
  uploadDate?: string;
  verifiedDate?: string;
  size?: number;
  url?: string;
}

export interface UnderwritingTask {
  id: string;
  title: string;
  description: string;
  category: 'verification' | 'analysis' | 'compliance' | 'documentation' | 'approval';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'requires_review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string; // 'eva' | 'human' | specific user ID
  automationAvailable: boolean;
  estimatedTime: number; // in minutes
  dependencies?: string[]; // IDs of other tasks that must complete first
  dueDate?: string;
  completedDate?: string;
  notes?: string;
  result?: any; // Task completion result/data
}

export interface LenderOption {
  id: string;
  name: string;
  category:
    | 'general'
    | 'equipment_vehicle'
    | 'real_estate'
    | 'sba'
    | 'rapheal'
    | 'chaise'
    | 'austins';
  description: string;
  minCreditScore: number;
  maxLoanAmount: number;
  minLoanAmount: number;
  interestRateRange: string;
  typicalTerms: string[];
  specializations: string[];
  processingTime: string;
  approvalRate: number;
  fees: {
    origination?: number;
    processing?: number;
    underwriting?: number;
  };
  requirements: string[];
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface TransactionProfile {
  id: string;
  customerId: string;
  customerName: string;
  type:
    | 'equipment_loan'
    | 'vehicle_loan'
    | 'real_estate_loan'
    | 'working_capital'
    | 'business_expansion'
    | 'debt_consolidation'
    | 'sba_loan'
    | 'line_of_credit';
  status:
    | 'initial'
    | 'documentation'
    | 'underwriting'
    | 'approval'
    | 'funded'
    | 'declined'
    | 'withdrawn'
    | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Loan Details
  requestedAmount: number;
  proposedTerms: number; // months
  purpose: string;
  collateralType?: string;
  collateralValue?: number;

  // Dates
  createdAt: string;
  lastUpdated: string;
  targetCloseDate?: string;
  actualCloseDate?: string;

  // Progress Tracking
  progress: {
    documentation: number; // percentage complete
    verification: number;
    underwriting: number;
    approval: number;
  };

  // Documents
  documents: TransactionDocument[];
  requiredDocuments: string[];

  // Tasks & Workflow
  underwritingTasks: UnderwritingTask[];
  completedTasks: number;
  totalTasks: number;

  // Financial Analysis
  financialSummary: {
    debtToIncomeRatio?: number;
    creditScore?: number;
    cashFlow?: number;
    dscr?: number; // Debt Service Coverage Ratio
    ltv?: number; // Loan to Value
    riskScore?: number;
    decisonScore?: number;
  };

  // Lender Matching
  matchedLenders: LenderOption[];
  selectedLender?: string;
  lenderFeedback?: string;

  // Communication
  lastContact?: string;
  nextFollowUp?: string;
  notes: string[];
  alerts: string[];

  // Metadata
  metadata: {
    source?: string; // How the lead came in
    referrer?: string;
    campaignId?: string;
    risk_factors?: string[];
    special_conditions?: string[];
  };
}

interface EVATransactionContextType {
  selectedTransaction: TransactionProfile | null;
  customerTransactions: TransactionProfile[];
  allActiveTransactions: TransactionProfile[];
  underwritingQueue: TransactionProfile[];

  // Actions
  selectTransaction: (transaction: TransactionProfile | null) => void;
  refreshTransactionData: (transactionId: string) => Promise<void>;
  updateTransactionStatus: (
    transactionId: string,
    status: TransactionProfile['status'],
  ) => Promise<void>;
  updateUnderwritingTask: (
    transactionId: string,
    taskId: string,
    updates: Partial<UnderwritingTask>,
  ) => Promise<void>;
  generateUnderwritingChecklist: (transactionId: string) => Promise<UnderwritingTask[]>;
  autoExecuteTasks: (transactionId: string) => Promise<void>;
  getTransactionSummary: () => string;
  getTransactionContext: () => any;

  // Lender Management
  getLendersByCategory: (category: LenderOption['category']) => LenderOption[];
  matchLenders: (transactionId: string) => Promise<LenderOption[]>;
  selectLender: (transactionId: string, lenderId: string) => Promise<void>;
}

const EVATransactionContext = createContext<EVATransactionContextType | undefined>(undefined);

interface EVATransactionProviderProps {
  children: ReactNode;
  selectedCustomer?: CustomerProfile | null;
}

export const EVATransactionProvider: React.FC<EVATransactionProviderProps> = ({
  children,
  selectedCustomer,
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionProfile | null>(null);
  const [allActiveTransactions, setAllActiveTransactions] = useState<TransactionProfile[]>([]);
  const [customerTransactions, setCustomerTransactions] = useState<TransactionProfile[]>([]);
  const [underwritingQueue, setUnderwritingQueue] = useState<TransactionProfile[]>([]);

  // Mock lender data
  const mockLenders: LenderOption[] = [
    // General Lenders
    {
      id: 'GEN-001',
      name: 'First Capital Bank',
      category: 'general',
      description: 'Full-service commercial lending with competitive rates',
      minCreditScore: 650,
      maxLoanAmount: 5000000,
      minLoanAmount: 25000,
      interestRateRange: '6.5% - 12.5%',
      typicalTerms: ['12', '24', '36', '60'],
      specializations: ['Working Capital', 'Business Expansion', 'Debt Consolidation'],
      processingTime: '7-14 days',
      approvalRate: 78,
      fees: { origination: 1.5, processing: 500, underwriting: 750 },
      requirements: ['2 years tax returns', 'Bank statements', 'Financial statements'],
      contactInfo: {
        phone: '1-800-CAPITAL',
        email: 'commercial@firstcapital.com',
        website: 'www.firstcapitalbank.com',
      },
    },

    // Equipment & Vehicle Lenders
    {
      id: 'EQP-001',
      name: 'Equipment Finance Pro',
      category: 'equipment_vehicle',
      description: 'Specialized equipment and vehicle financing',
      minCreditScore: 600,
      maxLoanAmount: 2000000,
      minLoanAmount: 10000,
      interestRateRange: '5.9% - 15.9%',
      typicalTerms: ['24', '36', '48', '60', '72'],
      specializations: ['Heavy Equipment', 'Commercial Vehicles', 'Manufacturing Equipment'],
      processingTime: '3-7 days',
      approvalRate: 85,
      fees: { origination: 2.0, processing: 300 },
      requirements: ['Equipment invoice', 'Credit application', 'Bank statements'],
      contactInfo: {
        phone: '1-877-EQUIP-FIN',
        email: 'funding@equipmentfinancepro.com',
        website: 'www.equipmentfinancepro.com',
      },
    },

    // Real Estate Lenders
    {
      id: 'RE-001',
      name: 'Commercial Realty Capital',
      category: 'real_estate',
      description: 'Commercial real estate acquisition and refinancing',
      minCreditScore: 700,
      maxLoanAmount: 20000000,
      minLoanAmount: 100000,
      interestRateRange: '4.5% - 8.5%',
      typicalTerms: ['60', '120', '180', '240', '300'],
      specializations: ['Office Buildings', 'Retail Properties', 'Industrial'],
      processingTime: '21-45 days',
      approvalRate: 65,
      fees: { origination: 1.0, processing: 1500, underwriting: 2500 },
      requirements: ['Appraisal', 'Environmental report', 'Rent rolls', 'Operating statements'],
      contactInfo: {
        phone: '1-888-CRE-FUND',
        email: 'originations@crcapital.com',
        website: 'www.commercialrealtycapital.com',
      },
    },

    // SBA Lenders
    {
      id: 'SBA-001',
      name: 'SBA Direct Partners',
      category: 'sba',
      description: 'SBA 7(a) and 504 loan specialist',
      minCreditScore: 680,
      maxLoanAmount: 5000000,
      minLoanAmount: 50000,
      interestRateRange: 'Prime + 2.75% - 6.5%',
      typicalTerms: ['84', '120', '240', '300'],
      specializations: ['SBA 7(a)', 'SBA 504', 'Express Loans'],
      processingTime: '30-60 days',
      approvalRate: 72,
      fees: { origination: 0.5, processing: 1000, underwriting: 1500 },
      requirements: ['SBA forms', 'Business plan', 'Personal financial statements'],
      contactInfo: {
        phone: '1-800-SBA-LOAN',
        email: 'sba@sbadirectpartners.com',
        website: 'www.sbadirectpartners.com',
      },
    },

    // Rapheal Lenders
    {
      id: 'RAP-001',
      name: 'Rapheal Capital Solutions',
      category: 'rapheal',
      description: 'Alternative lending with fast approvals',
      minCreditScore: 550,
      maxLoanAmount: 1000000,
      minLoanAmount: 15000,
      interestRateRange: '8.9% - 24.9%',
      typicalTerms: ['6', '12', '18', '24', '36'],
      specializations: ['Revenue-based financing', 'Merchant cash advances', 'Bridge loans'],
      processingTime: '1-3 days',
      approvalRate: 88,
      fees: { origination: 3.0, processing: 250 },
      requirements: ['Bank statements', 'Credit application'],
      contactInfo: {
        phone: '1-855-RAPHEAL',
        email: 'funding@raphealcapital.com',
        website: 'www.raphealcapital.com',
      },
    },

    // Chaise Lenders
    {
      id: 'CHA-001',
      name: 'Chaise Financial Group',
      category: 'chaise',
      description: 'Boutique lending for established businesses',
      minCreditScore: 720,
      maxLoanAmount: 3000000,
      minLoanAmount: 50000,
      interestRateRange: '5.5% - 11.5%',
      typicalTerms: ['24', '36', '48', '60'],
      specializations: ['Growth capital', 'Acquisition financing', 'Refinancing'],
      processingTime: '10-21 days',
      approvalRate: 65,
      fees: { origination: 1.25, processing: 750, underwriting: 1000 },
      requirements: ['3 years financials', 'Business plan', 'Management team bios'],
      contactInfo: {
        phone: '1-800-CHAISE-1',
        email: 'originations@chaisefinancial.com',
        website: 'www.chaisefinancial.com',
      },
    },

    // Austins Lenders
    {
      id: 'AUS-001',
      name: 'Austins Business Finance',
      category: 'austins',
      description: 'Regional business lending with personal service',
      minCreditScore: 640,
      maxLoanAmount: 2500000,
      minLoanAmount: 25000,
      interestRateRange: '6.9% - 14.9%',
      typicalTerms: ['12', '24', '36', '48', '60'],
      specializations: ['Local businesses', 'Family-owned enterprises', 'Startups'],
      processingTime: '5-10 days',
      approvalRate: 75,
      fees: { origination: 2.0, processing: 400, underwriting: 600 },
      requirements: ['Personal guarantee', 'Business tax returns', 'Personal tax returns'],
      contactInfo: {
        phone: '1-877-AUSTINS',
        email: 'loans@austinsbusinessfinance.com',
        website: 'www.austinsbusinessfinance.com',
      },
    },
  ];

  // Mock transaction data
  const mockTransactions: TransactionProfile[] = [
    {
      id: 'TXN-001',
      customerId: 'CUST-001',
      customerName: 'John Smith',
      type: 'vehicle_loan',
      status: 'underwriting',
      priority: 'medium',
      requestedAmount: 45000,
      proposedTerms: 60,
      purpose: 'Commercial vehicle purchase',
      collateralType: 'Vehicle',
      collateralValue: 50000,
      createdAt: '2024-01-15',
      lastUpdated: '2024-01-20',
      targetCloseDate: '2024-02-15',
      progress: {
        documentation: 85,
        verification: 70,
        underwriting: 40,
        approval: 0,
      },
      documents: [
        {
          id: 'DOC-001',
          name: 'Credit Application',
          type: 'credit_application',
          status: 'verified',
          uploadDate: '2024-01-15',
          verifiedDate: '2024-01-16',
        },
        {
          id: 'DOC-002',
          name: 'Bank Statements',
          type: 'bank_statements',
          status: 'received',
          uploadDate: '2024-01-17',
        },
      ],
      requiredDocuments: [
        'credit_application',
        'bank_statements',
        'identity_verification',
        'collateral_documents',
      ],
      underwritingTasks: [],
      completedTasks: 8,
      totalTasks: 12,
      financialSummary: {
        creditScore: 720,
        debtToIncomeRatio: 0.35,
        cashFlow: 8500,
        ltv: 0.9,
        riskScore: 65,
        decisonScore: 78,
      },
      matchedLenders: [],
      notes: ['Customer has excellent payment history', 'Vehicle is for business expansion'],
      alerts: ['Awaiting insurance verification'],
      metadata: {
        source: 'Website',
        risk_factors: ['High LTV ratio'],
      },
    },
    {
      id: 'TXN-002',
      customerId: 'CUST-002',
      customerName: 'Smith Manufacturing LLC',
      type: 'equipment_loan',
      status: 'documentation',
      priority: 'high',
      requestedAmount: 250000,
      proposedTerms: 84,
      purpose: 'Manufacturing equipment upgrade',
      collateralType: 'Equipment',
      collateralValue: 300000,
      createdAt: '2024-01-18',
      lastUpdated: '2024-01-22',
      targetCloseDate: '2024-03-01',
      progress: {
        documentation: 40,
        verification: 0,
        underwriting: 0,
        approval: 0,
      },
      documents: [
        {
          id: 'DOC-003',
          name: 'Equipment Quote',
          type: 'collateral_documents',
          status: 'received',
          uploadDate: '2024-01-18',
        },
      ],
      requiredDocuments: [
        'credit_application',
        'financial_statements',
        'tax_returns',
        'collateral_documents',
      ],
      underwritingTasks: [],
      completedTasks: 2,
      totalTasks: 15,
      financialSummary: {
        creditScore: 680,
        debtToIncomeRatio: 0.42,
        dscr: 1.35,
        ltv: 0.83,
        riskScore: 72,
      },
      matchedLenders: [],
      notes: ['Long-term customer', 'Equipment critical for production'],
      alerts: ['Missing financial statements'],
      metadata: {
        source: 'Referral',
        risk_factors: ['Seasonal business'],
      },
    },
  ];

  // Initialize transactions
  useEffect(() => {
    setAllActiveTransactions(mockTransactions);

    if (selectedCustomer) {
      const filtered = mockTransactions.filter(t => t.customerId === selectedCustomer.id);
      setCustomerTransactions(filtered);
    } else {
      setCustomerTransactions(mockTransactions);
    }

    // Set underwriting queue
    const underwriting = mockTransactions.filter(
      t => t.status === 'underwriting' || t.status === 'documentation',
    );
    setUnderwritingQueue(underwriting);
  }, [selectedCustomer]);

  const selectTransaction = (transaction: TransactionProfile | null) => {
    setSelectedTransaction(transaction);
  };

  const refreshTransactionData = async (transactionId: string) => {
    // Implementation for refreshing transaction data
    debugLog('general', 'log_statement', 'Refreshing transaction data for:', transactionId)
  };

  const updateTransactionStatus = async (
    transactionId: string,
    status: TransactionProfile['status'],
  ) => {
    // Implementation for updating transaction status
    debugLog('transaction', 'status_update', 'Updating transaction status', { transactionId, status })
  };

  const updateUnderwritingTask = async (
    transactionId: string,
    taskId: string,
    updates: Partial<UnderwritingTask>,
  ) => {
    // Implementation for updating underwriting tasks
    debugLog('underwriting', 'task_update', 'Updating underwriting task', { transactionId, taskId, updates })
  };

  const generateUnderwritingChecklist = async (
    transactionId: string,
  ): Promise<UnderwritingTask[]> => {
    // Generate comprehensive underwriting checklist based on transaction type
    const transaction = allActiveTransactions.find(t => t.id === transactionId);
    if (!transaction) return [];

    const baseTasks: UnderwritingTask[] = [
      {
        id: 'UW-001',
        title: 'Document Collection Verification',
        description: 'Verify all required documents are received and complete',
        category: 'documentation',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 15,
        assignedTo: 'eva',
      },
      {
        id: 'UW-002',
        title: 'Credit Score Analysis',
        description: 'Pull and analyze credit report and score',
        category: 'verification',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 10,
        assignedTo: 'eva',
      },
      {
        id: 'UW-003',
        title: 'Income Verification',
        description: 'Verify income through bank statements and tax returns',
        category: 'verification',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 20,
        assignedTo: 'eva',
      },
      {
        id: 'UW-004',
        title: 'Debt-to-Income Calculation',
        description: 'Calculate and verify debt-to-income ratio',
        category: 'analysis',
        status: 'pending',
        priority: 'medium',
        automationAvailable: true,
        estimatedTime: 15,
        assignedTo: 'eva',
        dependencies: ['UW-003'],
      },
      {
        id: 'UW-005',
        title: 'Collateral Valuation',
        description: 'Verify collateral value and condition',
        category: 'verification',
        status: 'pending',
        priority: 'high',
        automationAvailable: false,
        estimatedTime: 30,
        assignedTo: 'human',
      },
      {
        id: 'UW-006',
        title: 'Risk Assessment',
        description: 'Complete comprehensive risk analysis',
        category: 'analysis',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 25,
        assignedTo: 'eva',
        dependencies: ['UW-002', 'UW-004'],
      },
      {
        id: 'UW-007',
        title: 'Compliance Check',
        description: 'Verify compliance with lending regulations',
        category: 'compliance',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 20,
        assignedTo: 'eva',
      },
      {
        id: 'UW-008',
        title: 'Final Decision Recommendation',
        description: 'Generate final approval/decline recommendation',
        category: 'approval',
        status: 'pending',
        priority: 'urgent',
        automationAvailable: true,
        estimatedTime: 30,
        assignedTo: 'eva',
        dependencies: ['UW-006', 'UW-007'],
      },
    ];

    return baseTasks;
  };

  const autoExecuteTasks = async (transactionId: string) => {
    // Implementation for auto-executing tasks via EVA
    debugLog('general', 'log_statement', 'Auto-executing tasks for transaction:', transactionId)
  };

  const getLendersByCategory = (category: LenderOption['category']): LenderOption[] => {
    return mockLenders.filter(lender => lender.category === category);
  };

  const matchLenders = async (transactionId: string): Promise<LenderOption[]> => {
    const transaction = allActiveTransactions.find(t => t.id === transactionId);
    if (!transaction) return [];

    // Simple matching logic - in production this would be more sophisticated
    const creditScore = transaction.financialSummary.creditScore || 0;
    const loanAmount = transaction.requestedAmount;

    const matched = mockLenders.filter(
      lender =>
        lender.minCreditScore <= creditScore &&
        lender.minLoanAmount <= loanAmount &&
        lender.maxLoanAmount >= loanAmount,
    );

    return matched;
  };

  const selectLender = async (transactionId: string, lenderId: string) => {
    // Implementation for selecting a lender
    debugLog('lender', 'selection', 'Selecting lender for transaction', { lenderId, transactionId })
  };

  const getTransactionSummary = (): string => {
    if (!selectedTransaction) return 'No transaction selected';

    return `Transaction ${selectedTransaction.id}: ${selectedTransaction.type} for ${selectedTransaction.customerName} - $${selectedTransaction.requestedAmount.toLocaleString()} at ${selectedTransaction.status} stage`;
  };

  const getTransactionContext = () => {
    return {
      selectedTransaction,
      customerTransactions,
      allActiveTransactions,
      underwritingQueue,
    };
  };

  const value: EVATransactionContextType = {
    selectedTransaction,
    customerTransactions,
    allActiveTransactions,
    underwritingQueue,
    selectTransaction,
    refreshTransactionData,
    updateTransactionStatus,
    updateUnderwritingTask,
    generateUnderwritingChecklist,
    autoExecuteTasks,
    getTransactionSummary,
    getTransactionContext,
    getLendersByCategory,
    matchLenders,
    selectLender,
  };

  return <EVATransactionContext.Provider value={value}>{children}</EVATransactionContext.Provider>;
};

export const useEVATransaction = (): EVATransactionContextType => {
  const context = useContext(EVATransactionContext);
  if (context === undefined) {
    throw new Error('useEVATransaction must be used within an EVATransactionProvider');
  }
  return context;
};

export default EVATransactionContext;
