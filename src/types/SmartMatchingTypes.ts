/**
 * Smart Matching Instrument Types for EVA Platform
 * Used for dynamic lender-borrower matching within customer retention platform
 * Only visible to lender and broker user types
 */

// Enums for standardized values
export enum InstrumentType {
  EQUIPMENT = 'equipment',
  REAL_ESTATE = 'real_estate',
  GENERAL = 'general',
}

export enum CollateralType {
  EQUIPMENT = 'equipment',
  REAL_ESTATE = 'real_estate',
  INVENTORY = 'inventory',
  ACCOUNTS_RECEIVABLE = 'accounts_receivable',
  PERSONAL_GUARANTEE = 'personal_guarantee',
  UCC_BLANKET_LIEN = 'ucc_blanket_lien',
}

export enum RiskToleranceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  MODERATE = "MODERATE",
}

export enum BankruptcyType {
  CHAPTER_7 = 'chapter_7',
  CHAPTER_11 = 'chapter_11',
  CHAPTER_13 = 'chapter_13',
  NONE = 'none',
}

export enum MatchStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  UNDER_REVIEW = 'under_review',
}

// Score ranges by loan amount
export interface ScoreByAmount {
  [loanAmount: number]: number; // Key: loan amount threshold, Value: minimum score
}

// Deal Killer Matching Variables (11 fields)
export interface DealKillerVariables {
  financialInstrumentTypes: InstrumentType[];
  collateralTypes: CollateralType[];
  garagingLocationRequirement: string[];
  minimumFleetRequirement: number;
  geographicLendingCoverage: string[]; // State codes
  restrictedAssetSellerTypes: string[];
  restrictedIndustryCodes: string[];
  minimumBusinessAge: number; // months
  minimumBusinessRevenue: number;
  debtServiceCoverageRatio: number;
  bankruptcyAcceptance: boolean;
}

// Second Stage Matching Variables (15 fields)
export interface SecondStageVariables {
  equifaxMinScores: ScoreByAmount;
  experianMinScores: ScoreByAmount;
  transunionMinScores: ScoreByAmount;
  businessIntelscoreMin: ScoreByAmount;
  paynetMasterscoreMin: ScoreByAmount;
  equifaxOneScoreMin: ScoreByAmount;
  lexisNexisScoreMin: ScoreByAmount;
  dunnPaydexScoreMin: ScoreByAmount;
  preferredIndustryCodes: string[];
  minimumTermMonths: number;
  maximumTermMonths: number;
  minimumTransactionAmount: number;
  maximumTransactionAmount: number;
  riskToleranceLevel: RiskToleranceLevel;
  averageTimeToClose: number; // days
}

// Risk Score Customization (6 fields) - Lender Preferences
export interface RiskScoreWeights {
  creditWorthinessWeight: number; // 0-100
  financialRatioWeight: number; // 0-100
  cashFlowWeight: number; // 0-100
  complianceWeight: number; // 0-100
  equipmentWeight: number; // 0-100 (for equipment loans)
  propertyWeight: number; // 0-100 (for real estate loans)
}

// Equipment/Real Estate Specific Details
export interface EquipmentDetails {
  equipmentTypes: string[];
  manufacturerPreferences: string[];
  ageRestrictions: number; // maximum equipment age in years
  valueRange: { min: number; max: number };
}

export interface RealEstateDetails {
  propertyTypes: string[];
  locationPreferences: string[];
  occupancyRequirements: string[];
  appraisalRequirements: string[];
}

export interface GeneralCreditDetails {
  purposeOfFunds: string[];
  documentationRequirements: string[];
  guarantorRequirements: string[];
}

// Complete Smart Matching Instrument Profile
export interface SmartMatchingInstrument {
  id: string;
  instrumentName: string;
  instrumentType: InstrumentType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;

  // Deal Killer Variables
  dealKillers: DealKillerVariables;

  // Second Stage Variables
  secondStage: SecondStageVariables;

  // Risk Score Customization
  riskWeights: RiskScoreWeights;

  // Instrument-specific details
  equipmentDetails?: EquipmentDetails;
  realEstateDetails?: RealEstateDetails;
  generalCreditDetails?: GeneralCreditDetails;

  // Performance metrics
  totalMatches: number;
  successfulMatches: number;
  averageMatchScore: number;
  lastUsed?: string;
}

// Borrower Application Fields Used in Matching (16 fields)
export interface BorrowerApplicationData {
  applicationType: InstrumentType;
  businessState: string;
  businessAgeMonths: number;
  currentYearGrossRevenue: number;
  requestedAmount: number;
  requestedTermMonths: number;
  debtServiceCoverageRatio: number;
  hasBankruptcy: boolean;
  bankruptcyType: BankruptcyType;
  equifax: number;
  experian: number;
  transunion: number;
  industryCode: string;
  riskLevel: RiskToleranceLevel;
  secondaryCollaterals: CollateralType[];
  guarantorTypes: string[];
}

// Business Credit Scores (5 fields)
export interface BusinessCreditScores {
  businessIntelScore: number;
  paynetMasterScore: number;
  equifaxOneScore: number;
  lexisNexisScore: number;
  dunnPaydexScore: number;
}

// Match Results (4 fields)
export interface MatchResult {
  matchScore: number; // 0-100
  matchedVariables: number;
  totalVariables: number;
  status: MatchStatus;
  matchedAt: string;
  lenderId: string;
  borrowerId: string;
  instrumentId: string;
  notes?: string;
}

// Complete Borrower Profile for Matching
export interface BorrowerMatchingProfile {
  id: string;
  businessName: string;
  applicationData: BorrowerApplicationData;
  businessCreditScores?: BusinessCreditScores;
  equipmentDetails?: EquipmentDetails;
  realEstateDetails?: RealEstateDetails;
  generalCreditDetails?: GeneralCreditDetails;
  createdAt: string;
  updatedAt: string;
}

// Customer/Lender Profile with Smart Matching Instruments
export interface CustomerSmartMatchProfile {
  customerId: string;
  customerName: string;
  customerType: 'lender' | 'broker';
  instruments: SmartMatchingInstrument[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

// API Request/Response types
export interface CreateInstrumentRequest {
  instrumentName: string;
  instrumentType: InstrumentType;
  dealKillers: DealKillerVariables;
  secondStage: SecondStageVariables;
  riskWeights: RiskScoreWeights;
  equipmentDetails?: EquipmentDetails;
  realEstateDetails?: RealEstateDetails;
  generalCreditDetails?: GeneralCreditDetails;
}

export interface UpdateInstrumentRequest extends Partial<CreateInstrumentRequest> {
  id: string;
}

export interface MatchingRequest {
  borrowerProfile: BorrowerMatchingProfile;
  lenderIds?: string[]; // Optional: specific lenders to match against
  instrumentTypes?: InstrumentType[]; // Optional: specific instrument types
}

export interface MatchingResponse {
  matches: MatchResult[];
  totalMatches: number;
  processingTime: number;
  timestamp: string;
}

// Form validation schemas
export interface ValidationResult {
  isValid: boolean;
  errors: { [field: string]: string };
  warnings: { [field: string]: string };
}

// Constants for validation
export const VALIDATION_CONSTANTS = {
  MIN_BUSINESS_AGE: 0,
  MAX_BUSINESS_AGE: 1200, // 100 years in months
  MIN_REVENUE: 0,
  MAX_REVENUE: 1000000000, // 1 billion
  MIN_LOAN_AMOUNT: 1000,
  MAX_LOAN_AMOUNT: 100000000, // 100 million
  MIN_TERM_MONTHS: 1,
  MAX_TERM_MONTHS: 360, // 30 years
  MIN_CREDIT_SCORE: 300,
  MAX_CREDIT_SCORE: 850,
  MIN_DSCR: 0.1,
  MAX_DSCR: 10.0,
  WEIGHT_TOTAL: 100, // Sum of all weights should equal 100
};

// Default instrument templates
export const DEFAULT_EQUIPMENT_INSTRUMENT: Partial<SmartMatchingInstrument> = {
  instrumentType: InstrumentType.EQUIPMENT,
  dealKillers: {
    financialInstrumentTypes: [InstrumentType.EQUIPMENT],
    collateralTypes: [CollateralType.EQUIPMENT],
    garagingLocationRequirement: [],
    minimumFleetRequirement: 1,
    geographicLendingCoverage: ['US'],
    restrictedAssetSellerTypes: [],
    restrictedIndustryCodes: [],
    minimumBusinessAge: 12,
    minimumBusinessRevenue: 100000,
    debtServiceCoverageRatio: 1.25,
    bankruptcyAcceptance: false,
  },
  riskWeights: {
    creditWorthinessWeight: 30,
    financialRatioWeight: 25,
    cashFlowWeight: 20,
    complianceWeight: 15,
    equipmentWeight: 10,
    propertyWeight: 0,
  },
};

export const DEFAULT_REAL_ESTATE_INSTRUMENT: Partial<SmartMatchingInstrument> = {
  instrumentType: InstrumentType.REAL_ESTATE,
  dealKillers: {
    financialInstrumentTypes: [InstrumentType.REAL_ESTATE],
    collateralTypes: [CollateralType.REAL_ESTATE],
    garagingLocationRequirement: [],
    minimumFleetRequirement: 0,
    geographicLendingCoverage: ['US'],
    restrictedAssetSellerTypes: [],
    restrictedIndustryCodes: [],
    minimumBusinessAge: 24,
    minimumBusinessRevenue: 500000,
    debtServiceCoverageRatio: 1.35,
    bankruptcyAcceptance: false,
  },
  riskWeights: {
    creditWorthinessWeight: 25,
    financialRatioWeight: 30,
    cashFlowWeight: 20,
    complianceWeight: 15,
    equipmentWeight: 0,
    propertyWeight: 10,
  },
};

export const DEFAULT_GENERAL_INSTRUMENT: Partial<SmartMatchingInstrument> = {
  instrumentType: InstrumentType.GENERAL,
  dealKillers: {
    financialInstrumentTypes: [InstrumentType.GENERAL],
    collateralTypes: [CollateralType.PERSONAL_GUARANTEE, CollateralType.UCC_BLANKET_LIEN],
    garagingLocationRequirement: [],
    minimumFleetRequirement: 0,
    geographicLendingCoverage: ['US'],
    restrictedAssetSellerTypes: [],
    restrictedIndustryCodes: [],
    minimumBusinessAge: 6,
    minimumBusinessRevenue: 50000,
    debtServiceCoverageRatio: 1.2,
    bankruptcyAcceptance: true,
  },
  riskWeights: {
    creditWorthinessWeight: 35,
    financialRatioWeight: 30,
    cashFlowWeight: 25,
    complianceWeight: 10,
    equipmentWeight: 0,
    propertyWeight: 0,
  },
};
