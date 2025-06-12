// Portfolio Management Data Model

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  type?: PortfolioType;
  status?: PortfolioStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  ownerId?: string;
  organizationId?: string;
  userId?: string;
  totalValue: number;
  totalLoans?: number;
  assets?: PortfolioAsset[];
  performanceMetrics?: PerformanceMetrics;
  riskMetrics?: RiskMetrics;
  tags?: string[];
}

export interface PortfolioSummary {
  id: string;
  name: string;
  totalValue: number;
  assetCount: number;
  lastUpdated: string;
}

export interface PortfolioAsset {
  id: string;
  name: string;
  type: PortfolioAssetType;
  value: number;
  purchaseDate: string;
}

export enum PortfolioAssetType {
  EQUIPMENT = 'equipment',
  VEHICLE = 'vehicle',
  REAL_ESTATE = 'real_estate',
  FINANCIAL_INSTRUMENT = 'financial_instrument',
  INVENTORY = 'inventory',
  OTHER = 'other',
}

export enum PortfolioType {
  COMMERCIAL_REAL_ESTATE = 'commercial_real_estate',
  RESIDENTIAL_REAL_ESTATE = 'residential_real_estate',
  BUSINESS_LOANS = 'business_loans',
  EQUIPMENT_FINANCING = 'equipment_financing',
  MIXED = 'mixed',
  CUSTOM = 'custom',
}

export enum PortfolioStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  UNDER_REVIEW = 'under_review',
}

export interface Loan {
  id: string;
  portfolioId: string;
  loanNumber: string;
  borrowerName: string;
  borrowerId: string;
  loanType: LoanType;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  originationDate: Date;
  maturityDate: Date;
  paymentFrequency: PaymentFrequency;
  status: LoanStatus;
  nextPaymentDate?: Date;
  nextPaymentAmount?: number;
  collateral?: Collateral[];
  documents?: LoanDocument[];
  paymentHistory?: Payment[];
  riskRating?: RiskRating;
  lastUpdated: Date;
}

export enum LoanType {
  TERM_LOAN = 'term_loan',
  LINE_OF_CREDIT = 'line_of_credit',
  BRIDGE_LOAN = 'bridge_loan',
  CONSTRUCTION_LOAN = 'construction_loan',
  SBA_LOAN = 'sba_loan',
  EQUIPMENT_LOAN = 'equipment_loan',
  INVOICE_FINANCING = 'invoice_financing',
  MERCHANT_CASH_ADVANCE = 'merchant_cash_advance',
}

export enum PaymentFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual',
  CUSTOM = 'custom',
}

export enum LoanStatus {
  CURRENT = 'current',
  LATE = 'late',
  DEFAULT = 'default',
  PAID_OFF = 'paid_off',
  CHARGED_OFF = 'charged_off',
  IN_MODIFICATION = 'in_modification',
  FORBEARANCE = 'forbearance',
}

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercentage: number;
  averageInterestRate: number;
  weightedAverageMaturity: number; // in months
  delinquencyRate: number;
  defaultRate: number;
  recoveryRate: number;
  netChargeOffRate: number;
  yieldToMaturity: number;
  monthlyIncome: number;
  quarterlyIncome: number;
  annualIncome: number;
}

export interface RiskMetrics {
  overallRiskScore: number; // 1-100
  concentrationRisk: ConcentrationRisk;
  creditRisk: number;
  marketRisk: number;
  operationalRisk: number;
  liquidityRisk: number;
  diversificationScore: number;
  stressTestResults?: StressTestResult[];
}

export interface ConcentrationRisk {
  byBorrower: RiskConcentration[];
  byIndustry: RiskConcentration[];
  byGeography: RiskConcentration[];
  byLoanType: RiskConcentration[];
  byMaturity: RiskConcentration[];
}

export interface RiskConcentration {
  category: string;
  value: number;
  percentage: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface Collateral {
  id: string;
  type: CollateralType;
  description: string;
  estimatedValue: number;
  lastValuationDate: Date;
  ltvRatio: number;
  location?: string;
  documents?: string[];
}

export enum CollateralType {
  REAL_ESTATE = 'real_estate',
  EQUIPMENT = 'equipment',
  INVENTORY = 'inventory',
  ACCOUNTS_RECEIVABLE = 'accounts_receivable',
  SECURITIES = 'securities',
  PERSONAL_GUARANTEE = 'personal_guarantee',
  OTHER = 'other',
}

export interface Payment {
  id: string;
  loanId: string;
  paymentDate: Date;
  scheduledAmount: number;
  actualAmount: number;
  principal: number;
  interest: number;
  fees?: number;
  status: PaymentStatus;
  method?: PaymentMethod;
  referenceNumber?: string;
}

export enum PaymentStatus {
  SCHEDULED = 'scheduled',
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERSED = 'reversed',
  PARTIAL = 'partial',
}

export enum PaymentMethod {
  ACH = 'ach',
  WIRE = 'wire',
  CHECK = 'check',
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  OTHER = 'other',
}

export interface LoanDocument {
  id: string;
  loanId: string;
  type: DocumentType;
  name: string;
  uploadDate: Date;
  fileSize: number;
  mimeType: string;
  url: string;
  metadata?: Record<string, any>;
}

export enum DocumentType {
  LOAN_AGREEMENT = 'loan_agreement',
  PROMISSORY_NOTE = 'promissory_note',
  SECURITY_AGREEMENT = 'security_agreement',
  FINANCIAL_STATEMENT = 'financial_statement',
  TAX_RETURN = 'tax_return',
  BANK_STATEMENT = 'bank_statement',
  APPRAISAL = 'appraisal',
  INSURANCE = 'insurance',
  OTHER = 'other',
}

export enum RiskRating {
  AAA = 'AAA',
  AA = 'AA',
  A = 'A',
  BBB = 'BBB',
  BB = 'BB',
  B = 'B',
  CCC = 'CCC',
  CC = 'CC',
  C = 'C',
  D = 'D',
}

export interface StressTestResult {
  scenario: string;
  date: Date;
  impactOnValue: number;
  impactOnIncome: number;
  defaultRateChange: number;
  recommendations: string[];
}

// Filter and Sort Options
export interface PortfolioFilter {
  status?: PortfolioStatus[];
  type?: PortfolioType[];
  minValue?: number;
  maxValue?: number;
  riskScore?: { min: number; max: number };
  tags?: string[];
}

export interface LoanFilter {
  status?: LoanStatus[];
  type?: LoanType[];
  minBalance?: number;
  maxBalance?: number;
  borrowerId?: string;
  riskRating?: RiskRating[];
  maturityDateRange?: { start: Date; end: Date };
}

export type PortfolioSortField =
  | 'name'
  | 'totalValue'
  | 'totalLoans'
  | 'createdAt'
  | 'updatedAt'
  | 'riskScore';
export type LoanSortField =
  | 'loanNumber'
  | 'borrowerName'
  | 'currentBalance'
  | 'interestRate'
  | 'maturityDate'
  | 'status';

export interface SortOption<T> {
  field: T;
  direction: 'asc' | 'desc';
}
