/**
 * Protocol Definitions Library
 * 
 * This file establishes standard nomenclature and data structures across the EVA Platform,
 * ensuring consistent terminology between frontend displays and backend systems.
 * It standardizes financial terms, regulatory concepts, and domain-specific language
 * that may differ between organizations, systems, or regulatory frameworks.
 */

// ======================================================================
// FINANCIAL DOCUMENT STANDARDIZATION
// ======================================================================

/**
 * Financial Document Types with standardized naming across systems
 * Maps common industry terms, accounting software labels, and regulatory names
 * to a single standardized EVA Platform nomenclature
 */
export enum FinancialDocumentType {
  // Income Statement variants
  INCOME_STATEMENT = 'income_statement',     // Standard GAAP term
  PROFIT_AND_LOSS = 'income_statement',      // Common business term
  P_AND_L = 'income_statement',              // Abbreviated form
  EARNINGS_STATEMENT = 'income_statement',   // Alternative term
  REVENUE_STATEMENT = 'income_statement',    // Less common term
  
  // Balance Sheet variants
  BALANCE_SHEET = 'balance_sheet',           // Standard GAAP term
  STATEMENT_OF_FINANCIAL_POSITION = 'balance_sheet', // Formal accounting term
  FINANCIAL_POSITION = 'balance_sheet',      // Shortened form
  
  // Cash Flow Statement variants
  CASH_FLOW_STATEMENT = 'cash_flow_statement', // Standard GAAP term
  STATEMENT_OF_CASH_FLOWS = 'cash_flow_statement', // Formal accounting term
  CASH_FLOW = 'cash_flow_statement',         // Common abbreviated form
  
  // Tax documents
  TAX_RETURN_PERSONAL = 'tax_return_personal', // Personal tax return (1040)
  TAX_RETURN_BUSINESS = 'tax_return_business', // Business tax returns
  SCHEDULE_C = 'tax_return_schedule_c',      // Schedule C for sole proprietors
  FORM_1120 = 'tax_return_1120',             // Corporate tax return
  FORM_1120S = 'tax_return_1120s',           // S-Corporation tax return
  FORM_1065 = 'tax_return_1065',             // Partnership tax return
  
  // Bank statements
  BANK_STATEMENT = 'bank_statement',         // Standard bank statement
  ACCOUNT_STATEMENT = 'bank_statement',      // Alternative term
  
  // Other common documents
  ACCOUNTS_RECEIVABLE_AGING = 'accounts_receivable_aging',
  ACCOUNTS_PAYABLE_AGING = 'accounts_payable_aging',
  DEBT_SCHEDULE = 'debt_schedule',
  BUSINESS_PLAN = 'business_plan',
  BUSINESS_FORMATION = 'business_formation_documents',
}

/**
 * Financial Time Periods
 * Standardizes reporting periods across systems
 */
export enum FinancialPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
  YEAR_TO_DATE = 'ytd',
  TRAILING_TWELVE_MONTHS = 'ttm',
  CUSTOM = 'custom',
}

/**
 * Financial Statement Formats
 * Standardizes format types across accounting systems
 */
export enum FinancialFormat {
  GAAP = 'gaap',              // Generally Accepted Accounting Principles
  IFRS = 'ifrs',              // International Financial Reporting Standards
  TAX_BASIS = 'tax_basis',    // Tax-basis accounting
  CASH_BASIS = 'cash_basis',  // Cash-basis accounting
  ACCRUAL_BASIS = 'accrual_basis', // Accrual-basis accounting
  INTERNAL = 'internal',      // Internal management reporting format
}

// ======================================================================
// FINANCIAL METRICS AND RATIOS
// ======================================================================

/**
 * Financial Metric Categories
 * Standardizes financial metric types
 */
export enum FinancialMetricCategory {
  PROFITABILITY = 'profitability',
  LIQUIDITY = 'liquidity',
  SOLVENCY = 'solvency',
  EFFICIENCY = 'efficiency',
  GROWTH = 'growth',
  VALUATION = 'valuation',
  CASH_FLOW = 'cash_flow',
  DEBT_SERVICE = 'debt_service',
}

/**
 * Financial Metrics with standardized naming and formulas
 * Maps common industry terms and calculation methods
 */
export interface FinancialMetric {
  id: string;
  name: string;
  aliases: string[];          // Alternative names for this metric
  category: FinancialMetricCategory;
  description: string;
  formula: string;            // Human-readable formula description
  interpretation: string;     // How to interpret this metric
  industryBenchmarks?: Record<string, { min: number, max: number, median: number }>;
  thresholds?: {
    excellent: number;
    good: number;
    average: number;
    concern: number;
    poor: number;
  };
}

/**
 * Credit Rating Systems
 * Maps between different credit scoring systems
 */
export interface CreditRatingMapping {
  systemName: string;         // Name of credit scoring system
  scale: {                    // Maps score ranges to standardized categories
    min: number;
    max: number;
    categories: {
      excellent: { min: number, max: number },
      good: { min: number, max: number },
      fair: { min: number, max: number },
      poor: { min: number, max: number },
      verPoor: { min: number, max: number },
    }
  };
  equivalents?: {             // Optional mapping to other systems
    [systemName: string]: number | { min: number, max: number }
  };
}

// ======================================================================
// LOAN AND TRANSACTION STANDARDIZATION
// ======================================================================

/**
 * Loan Product Types
 * Standardizes loan products across lenders and systems
 */
export enum LoanProductType {
  // Working Capital
  TERM_LOAN = 'term_loan',
  LINE_OF_CREDIT = 'line_of_credit',
  MERCHANT_CASH_ADVANCE = 'merchant_cash_advance',
  REVENUE_BASED_FINANCING = 'revenue_based_financing',
  INVOICE_FACTORING = 'invoice_factoring',
  INVOICE_FINANCING = 'invoice_financing',
  PURCHASE_ORDER_FINANCING = 'purchase_order_financing',
  
  // Real Estate
  COMMERCIAL_MORTGAGE = 'commercial_mortgage',
  CONSTRUCTION_LOAN = 'construction_loan',
  BRIDGE_LOAN = 'bridge_loan',
  COMMERCIAL_REFINANCE = 'commercial_refinance',
  
  // Equipment
  EQUIPMENT_FINANCING = 'equipment_financing',
  EQUIPMENT_LEASE = 'equipment_lease',
  EQUIPMENT_LINE_OF_CREDIT = 'equipment_line_of_credit',
  VEHICLE_FINANCING = 'vehicle_financing',
  
  // SBA Loans
  SBA_7A = 'sba_7a',
  SBA_EXPRESS = 'sba_express',
  SBA_504 = 'sba_504',
  SBA_MICROLOANS = 'sba_microloans',
}

/**
 * Loan Status Standardization
 * Maps different status terms across systems
 */
export enum LoanStatus {
  // Pre-approval statuses
  INQUIRY = 'inquiry',
  PRE_QUALIFICATION = 'pre_qualification',
  APPLICATION_STARTED = 'application_started',
  APPLICATION_SUBMITTED = 'application_submitted',
  INFORMATION_NEEDED = 'information_needed',
  
  // Underwriting statuses
  IN_UNDERWRITING = 'in_underwriting',
  CONDITIONALLY_APPROVED = 'conditionally_approved',
  PENDING_DOCUMENTATION = 'pending_documentation',
  APPROVED = 'approved',
  DECLINED = 'declined',
  
  // Post-approval statuses
  PENDING_CLOSING = 'pending_closing',
  PENDING_FUNDING = 'pending_funding',
  FUNDED = 'funded',
  ACTIVE = 'active',
  PAID_OFF = 'paid_off',
  DELINQUENT = 'delinquent',
  DEFAULT = 'default',
  CHARGED_OFF = 'charged_off',
  
  // Pipeline statuses
  ON_HOLD = 'on_hold',
  CANCELED = 'canceled',
  WITHDRAWN = 'withdrawn',
}

/**
 * Repayment Frequency Standardization
 */
export enum RepaymentFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BI_WEEKLY = 'bi_weekly',
  SEMI_MONTHLY = 'semi_monthly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUALLY = 'semi_annually',
  ANNUALLY = 'annually',
  CUSTOM = 'custom',
}

/**
 * Rate Type Standardization
 */
export enum RateType {
  FIXED = 'fixed',
  VARIABLE = 'variable',
  ADJUSTABLE = 'adjustable',
  FACTOR = 'factor_rate',  // Used in merchant cash advances
  SPLIT = 'split_rate',    // Part fixed, part variable
}

// ======================================================================
// INDUSTRY CLASSIFICATION STANDARDS
// ======================================================================

/**
 * Industry Classification Systems
 * Maps between different systems for industry categorization
 */
export enum IndustryClassificationSystem {
  NAICS = 'naics',     // North American Industry Classification System
  SIC = 'sic',         // Standard Industrial Classification
  GICS = 'gics',       // Global Industry Classification Standard
  ICB = 'icb',         // Industry Classification Benchmark
  NACE = 'nace',       // Statistical Classification of Economic Activities in the EU
  ISIC = 'isic',       // International Standard Industrial Classification
  EVA = 'eva',         // EVA Platform's internal classification
}

/**
 * Entity Type Standardization
 * Maps legal entity types across jurisdictions
 */
export enum EntityType {
  // US Entity Types
  SOLE_PROPRIETORSHIP = 'sole_proprietorship',
  PARTNERSHIP = 'partnership',
  LIMITED_PARTNERSHIP = 'limited_partnership',
  LLC = 'llc',
  S_CORPORATION = 's_corporation',
  C_CORPORATION = 'c_corporation',
  NON_PROFIT = 'non_profit',
  
  // International variations
  LIMITED_COMPANY = 'limited_company',   // UK/International equivalent of LLC
  PUBLIC_LIMITED_COMPANY = 'plc',        // UK/International public company
  GMBH = 'gmbh',                         // German limited liability
  
  // Other classifications
  GOVERNMENT_ENTITY = 'government_entity',
  EDUCATIONAL_INSTITUTION = 'educational_institution',
  TRUST = 'trust',
}

// ======================================================================
// DOCUMENT GENERATION TEMPLATES
// ======================================================================

/**
 * Document Template Types
 * Standardizes document generation templates
 */
export enum DocumentTemplateType {
  // Financing Documents
  TERM_SHEET = 'term_sheet',
  COMMITMENT_LETTER = 'commitment_letter',
  LOAN_AGREEMENT = 'loan_agreement',
  PROMISSORY_NOTE = 'promissory_note',
  SECURITY_AGREEMENT = 'security_agreement',
  
  // Disclosure Documents
  TRUTH_IN_LENDING = 'truth_in_lending',
  FEE_DISCLOSURE = 'fee_disclosure',
  ADVERSE_ACTION = 'adverse_action',
  
  // Due Diligence Documents
  DOCUMENT_REQUEST_LIST = 'document_request_list',
  LOAN_SUMMARY = 'loan_summary',
  UNDERWRITING_MEMO = 'underwriting_memo',
  
  // Internal Documents
  CREDIT_MEMO = 'credit_memo',
  APPROVAL_PACKAGE = 'approval_package',
  
  // Closing Documents
  DISBURSEMENT_AUTHORIZATION = 'disbursement_authorization',
  CLOSING_CHECKLIST = 'closing_checklist',
}

// ======================================================================
// DATA EXCHANGE STANDARDS
// ======================================================================

/**
 * Data Source Integration Types
 * Standardizes how external data is integrated
 */
export enum DataSourceType {
  ACCOUNTING_SOFTWARE = 'accounting_software',
  BANK_FEED = 'bank_feed',
  PAYMENT_PROCESSOR = 'payment_processor',
  CREDIT_BUREAU = 'credit_bureau',
  TAX_PREPARATION = 'tax_preparation',
  ERP_SYSTEM = 'erp_system',
  POS_SYSTEM = 'pos_system',
  PUBLIC_RECORD = 'public_record',
  DOCUMENT_UPLOAD = 'document_upload',
  MANUAL_ENTRY = 'manual_entry',
}

/**
 * Integration Provider Standards
 * Maps specific provider names to standardized categories
 */
export interface IntegrationProvider {
  id: string;
  name: string;
  type: DataSourceType;
  category: string;
  dataPoints: string[];       // List of data points this provider can supply
  refreshFrequency: string;   // How often data can be refreshed
  credentials: {              // What credentials are needed
    type: 'oauth' | 'apikey' | 'credentials' | 'form';
    fields: string[];
  };
}

// ======================================================================
// AI ANALYSIS STANDARDIZATION
// ======================================================================

/**
 * EVA AI Analysis Types
 * Standardizes AI analysis categories and outputs
 */
export enum AIAnalysisType {
  CREDIT_RISK = 'credit_risk_analysis',
  CASH_FLOW = 'cash_flow_analysis',
  COLLATERAL_VALUATION = 'collateral_valuation',
  INDUSTRY_OUTLOOK = 'industry_outlook',
  BUSINESS_STABILITY = 'business_stability',
  FRAUD_DETECTION = 'fraud_detection',
  DOCUMENT_VERIFICATION = 'document_verification',
  MANAGEMENT_ASSESSMENT = 'management_assessment',
}

/**
 * AI Confidence Levels
 * Standardizes how confidence is expressed
 */
export enum AIConfidenceLevel {
  VERY_HIGH = 'very_high',    // 90-100% confidence
  HIGH = 'high',              // 75-90% confidence
  MEDIUM = 'medium',          // 50-75% confidence
  LOW = 'low',                // 25-50% confidence
  VERY_LOW = 'very_low',      // 0-25% confidence
  INSUFFICIENT_DATA = 'insufficient_data',
}

/**
 * AI Recommendation Types
 * Standardizes recommendation categories
 */
export enum AIRecommendationType {
  APPROVE = 'approve',
  APPROVE_WITH_CONDITIONS = 'approve_with_conditions',
  REQUEST_MORE_INFORMATION = 'request_more_information',
  DECLINE = 'decline',
  ALTERNATIVE_PRODUCT = 'alternative_product',
  REFERRAL = 'referral',
  RISK_MITIGATION = 'risk_mitigation',
}

// ======================================================================
// DISPLAY FORMAT STANDARDIZATION
// ======================================================================

/**
 * Currency Format Standards
 * Ensures consistent currency display
 */
export interface CurrencyFormat {
  code: string;              // ISO currency code
  symbol: string;            // Currency symbol
  precision: number;         // Decimal places to display
  thousandsSeparator: string; // Character for thousands
  decimalSeparator: string;  // Character for decimals
  symbolPosition: 'before' | 'after'; // Position of currency symbol
  format: string;            // Format string (e.g., "$#,##0.00")
}

/**
 * Date Format Standards
 * Ensures consistent date display
 */
export interface DateFormat {
  code: string;              // Format code
  display: string;           // Human-readable description
  format: string;            // Format string
  example: string;           // Example of formatted date
}

// Export a Protocol registry to allow dynamic registration of new standards
export const ProtocolRegistry = {
  registerFinancialDocumentType: (name: string, standardType: FinancialDocumentType) => {
    // Implementation would be added here
  },
  
  registerMetric: (metricData: FinancialMetric) => {
    // Implementation would be added here
  },
  
  mapIndustryCode: (code: string, fromSystem: IndustryClassificationSystem, toSystem: IndustryClassificationSystem) => {
    // Implementation would be added here
    return '';
  },
  
  // Additional registry methods
}; 