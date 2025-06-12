import { faker } from '@faker-js/faker';

export interface MockTransaction {
  id: string;
  type: 'loan' | 'credit_line' | 'equipment_finance' | 'real_estate';
  status: 'draft' | 'pending' | 'under_review' | 'approved' | 'rejected' | 'funded';
  amount: number;
  currency: string;
  borrowerId: string;
  lenderId?: string;
  applicationDate: string;
  lastUpdated: string;
  terms?: {
    interestRate: number;
    termMonths: number;
    paymentFrequency: 'monthly' | 'quarterly' | 'annually';
  };
  documents: Array<{
    id: string;
    name: string;
    type: string;
    status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  }>;
  metadata?: Record<string, any>;
}

// Static mock transactions
export const mockTransactions: Record<string, MockTransaction> = {
  pending: {
    id: 'tx-001',
    type: 'loan',
    status: 'pending',
    amount: 250000,
    currency: 'USD',
    borrowerId: 'borrower-001',
    applicationDate: '2024-01-15T10:00:00Z',
    lastUpdated: '2024-01-15T10:00:00Z',
    documents: [
      {
        id: 'doc-001',
        name: 'Business Plan.pdf',
        type: 'business_plan',
        status: 'uploaded',
      },
      {
        id: 'doc-002',
        name: 'Financial Statements.xlsx',
        type: 'financial_statement',
        status: 'pending',
      },
    ],
  },
  approved: {
    id: 'tx-002',
    type: 'equipment_finance',
    status: 'approved',
    amount: 150000,
    currency: 'USD',
    borrowerId: 'borrower-002',
    lenderId: 'lender-001',
    applicationDate: '2024-01-10T09:00:00Z',
    lastUpdated: '2024-01-14T15:30:00Z',
    terms: {
      interestRate: 6.5,
      termMonths: 60,
      paymentFrequency: 'monthly',
    },
    documents: [
      {
        id: 'doc-003',
        name: 'Equipment Quote.pdf',
        type: 'quote',
        status: 'verified',
      },
      {
        id: 'doc-004',
        name: 'Tax Returns 2023.pdf',
        type: 'tax_return',
        status: 'verified',
      },
    ],
  },
  rejected: {
    id: 'tx-003',
    type: 'credit_line',
    status: 'rejected',
    amount: 500000,
    currency: 'USD',
    borrowerId: 'borrower-003',
    lenderId: 'lender-002',
    applicationDate: '2024-01-05T14:00:00Z',
    lastUpdated: '2024-01-12T11:00:00Z',
    documents: [
      {
        id: 'doc-005',
        name: 'Credit Report.pdf',
        type: 'credit_report',
        status: 'verified',
      },
    ],
    metadata: {
      rejectionReason: 'Insufficient credit history',
      rejectionCode: 'CREDIT_INSUFFICIENT',
    },
  },
  funded: {
    id: 'tx-004',
    type: 'real_estate',
    status: 'funded',
    amount: 1200000,
    currency: 'USD',
    borrowerId: 'borrower-004',
    lenderId: 'lender-003',
    applicationDate: '2023-12-01T08:00:00Z',
    lastUpdated: '2024-01-03T16:00:00Z',
    terms: {
      interestRate: 7.25,
      termMonths: 360,
      paymentFrequency: 'monthly',
    },
    documents: [
      {
        id: 'doc-006',
        name: 'Property Appraisal.pdf',
        type: 'appraisal',
        status: 'verified',
      },
      {
        id: 'doc-007',
        name: 'Purchase Agreement.pdf',
        type: 'purchase_agreement',
        status: 'verified',
      },
    ],
    metadata: {
      fundingDate: '2024-01-03T16:00:00Z',
      firstPaymentDate: '2024-02-01T00:00:00Z',
    },
  },
};

// Transaction factory
export const createMockTransaction = (overrides: Partial<MockTransaction> = {}): MockTransaction => {
  const status = overrides.status || faker.helpers.arrayElement(['draft', 'pending', 'under_review', 'approved', 'rejected', 'funded']);
  const type = overrides.type || faker.helpers.arrayElement(['loan', 'credit_line', 'equipment_finance', 'real_estate']);
  
  const transaction: MockTransaction = {
    id: faker.string.uuid(),
    type,
    status,
    amount: faker.number.int({ min: 10000, max: 5000000 }),
    currency: 'USD',
    borrowerId: faker.string.uuid(),
    applicationDate: faker.date.past().toISOString(),
    lastUpdated: faker.date.recent().toISOString(),
    documents: [],
    ...overrides,
  };

  // Add lender for non-draft transactions
  if (status !== 'draft' && !transaction.lenderId) {
    transaction.lenderId = faker.string.uuid();
  }

  // Add terms for approved/funded transactions
  if ((status === 'approved' || status === 'funded') && !transaction.terms) {
    transaction.terms = {
      interestRate: faker.number.float({ min: 3, max: 15, fractionDigits: 2 }),
      termMonths: faker.helpers.arrayElement([12, 24, 36, 60, 120, 360]),
      paymentFrequency: faker.helpers.arrayElement(['monthly', 'quarterly', 'annually']),
    };
  }

  // Generate random documents
  if (transaction.documents.length === 0) {
    const docCount = faker.number.int({ min: 1, max: 5 });
    transaction.documents = Array.from({ length: docCount }, () => ({
      id: faker.string.uuid(),
      name: faker.system.fileName({ extensionCount: 1 }),
      type: faker.helpers.arrayElement(['business_plan', 'financial_statement', 'tax_return', 'bank_statement', 'credit_report']),
      status: faker.helpers.arrayElement(['pending', 'uploaded', 'verified', 'rejected']),
    }));
  }

  return transaction;
};

// Bulk transaction creation
export const createMockTransactions = (count: number, overrides: Partial<MockTransaction> = {}): MockTransaction[] => {
  return Array.from({ length: count }, () => createMockTransaction(overrides));
};

// Transaction workflow states
export const mockTransactionWorkflow = {
  states: ['draft', 'pending', 'under_review', 'approved', 'rejected', 'funded'],
  transitions: {
    draft: ['pending'],
    pending: ['under_review', 'rejected'],
    under_review: ['approved', 'rejected', 'pending'],
    approved: ['funded', 'rejected'],
    rejected: [],
    funded: [],
  },
};

// Common transaction responses
export const mockTransactionResponses = {
  createSuccess: {
    success: true,
    transaction: mockTransactions.pending,
    message: 'Transaction created successfully',
  },
  updateSuccess: {
    success: true,
    transaction: mockTransactions.approved,
    message: 'Transaction updated successfully',
  },
  validationError: {
    success: false,
    errors: [
      { field: 'amount', message: 'Amount must be greater than 0' },
      { field: 'documents', message: 'At least one document is required' },
    ],
  },
  notFound: {
    success: false,
    error: 'Transaction not found',
    code: 'TRANSACTION_NOT_FOUND',
  },
};