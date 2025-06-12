/**
 * Enhanced Document Auto-Request Engine
 * Sophisticated package-based document requirements with credit profile assessment
 * Integrates with Plaid, credit reports, and lender database for optimal matching
 */

import { InstrumentType, SmartMatchingInstrument } from '../types/SmartMatchingTypes';

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  category: DocumentCategory;
  required: boolean;
  conditionalReason?: string;
  acceptedFormats: string[];
  validationRules: ValidationRule[];
  helpText: string[];
  estimatedProcessingTime?: number; // in hours
  source: DocumentSource;
  packageLevel: number; // 1-4 based on complexity
  businessAgeRequirement?: 'under_2_years' | '3_plus_years' | 'any';
  dealStage: DealStage[];
  creditProfileRequirement?: CreditProfile[];
}

export interface ConditionalRequirement {
  document: string;
  reason: string;
  condition: (data: any) => boolean;
}

export interface DocumentRequirements {
  required: DocumentRequirement[];
  conditional: ConditionalRequirement[];
  total: number;
  estimatedReviewTime: number; // total hours
  specialRequirements: string[];
  packageLevel: number;
  creditProfile: CreditProfile;
  riskAssessment: RiskAssessment;
}

export enum DocumentCategory {
  FINANCIAL_STATEMENTS = 'Financial Statements',
  TAX_DOCUMENTS = 'Tax Documents',
  BUSINESS_DOCUMENTS = 'Business Documents',
  COLLATERAL_DOCUMENTS = 'Collateral Documents',
  PERSONAL_DOCUMENTS = 'Personal Documents',
  COMPLIANCE_DOCUMENTS = 'Compliance Documents',
  PLAID_INTEGRATION = 'Plaid Integration',
  API_REPORTS = 'API Reports',
  OTHER = 'Other',
}

export enum DocumentSource {
  APPLICANT_BUSINESS = 'Applicant Business Must be UNZIPP Applications',
  APPLICANT_UPLOAD = 'Applicant Business / Uploaded to the Partner',
  BOOKKEEPING_SOFTWARE = 'API to bookkeeping Software of Applicant',
  PLAID_CONNECT = 'Plaid Connect / Uploaded to the Partner',
  CES_REPORT = 'CES Deal Kant, Paynet, Secretary of State, Public Funder',
  API_REPORT = 'API Report',
  COLLATERAL_SELLER = 'From Collateral Seller / Applicant Business',
  FUNDING_SOURCE = 'Funding Source',
  SIGNED_NOTARIZED = 'The Signed & Notarized by Applicant Business',
  THIRD_PARTY = 'Third Party External',
}

export enum DealStage {
  SUBMIT = 'Submit',
  FUND = 'Fund',
  CLOSE = 'Close',
}

export enum CreditProfile {
  PRIME = 'Prime', // 720+ scores, strong financials
  NEAR_PRIME = 'Near Prime', // 650-719 scores
  SUBPRIME = 'Subprime', // <650 scores, requires more docs
  NEW_BUSINESS = 'New Business', // <24 months in business
  ESTABLISHED = 'Established', // 24+ months with good financials
}

export interface RiskAssessment {
  creditScore: number;
  businessAge: number;
  revenueStability: 'high' | 'medium' | 'low';
  industryRisk: 'low' | 'medium' | 'high';
  collateralStrength: 'strong' | 'moderate' | 'weak';
  overallRisk: 'low' | 'medium' | 'high';
  recommendedPackage: number;
}

export interface ValidationRule {
  type: 'size' | 'format' | 'content' | 'date' | 'signature';
  value: any;
  message: string;
  severity: 'error' | 'warning';
}

export interface ApplicationData {
  loanAmount: number;
  loanType: InstrumentType;
  collateralType?: string;
  businessAgeMonths: number;
  currentYearGrossRevenue: number;
  requestedTermMonths: number;
  debtServiceCoverageRatio: number;
  hasBankruptcy: boolean;
  equifax: number;
  experian: number;
  transunion: number;
  industryCode: string;
  propertyType?: string;
  equipmentAge?: number;
  seasonalBusiness?: boolean;
  requestDate: Date;
  smartMatchingInstrument?: SmartMatchingInstrument;

  // Enhanced credit assessment data
  plaidConnected?: boolean;
  bankStatementAnalysis?: PlaidAnalysis;
  taxReturnData?: TaxReturnAnalysis;
  existingDebt?: number;
  cashFlow?: MonthlyCashFlow[];
  isRepeatBorrower?: boolean;
  previousLoanPerformance?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface PlaidAnalysis {
  averageBalance: number;
  monthlyInflow: number;
  monthlyOutflow: number;
  overdraftFrequency: number;
  depositConsistency: 'high' | 'medium' | 'low';
  accountAge: number;
}

export interface TaxReturnAnalysis {
  grossIncome: number;
  netIncome: number;
  depreciation: number;
  addBacks: number;
  yearOverYearGrowth: number;
}

export interface MonthlyCashFlow {
  month: string;
  revenue: number;
  expenses: number;
  netCashFlow: number;
}

class DocumentAutoRequestEngine {
  private rules: Map<string, any>;
  private documentDefinitions: Map<string, DocumentRequirement>;
  private packageMatrix: Map<number, string[]>;

  constructor() {
    this.rules = new Map();
    this.documentDefinitions = new Map();
    this.packageMatrix = new Map();
    this.loadDocumentMatrix();
    this.loadPackageMatrix();
    this.loadRules();
  }

  private loadDocumentMatrix(): void {
    const definitions: Record<string, Omit<DocumentRequirement, 'id'>> = {
      // Package 1 - Basic Documents
      unzipp_lease_loan_credit_application: {
        name: 'Unzipp Lease-Loan Credit Application',
        description: 'Key details on lessee, amount, terms. Also called in income statement',
        category: DocumentCategory.BUSINESS_DOCUMENTS,
        required: true,
        acceptedFormats: ['PDF'],
        validationRules: [
          { type: 'signature', value: true, message: 'Must be signed', severity: 'error' },
        ],
        helpText: ['Complete all required fields', 'Must be signed and dated'],
        estimatedProcessingTime: 1,
        source: DocumentSource.APPLICANT_BUSINESS,
        packageLevel: 1,
        businessAgeRequirement: 'any',
        dealStage: [DealStage.SUBMIT],
        creditProfileRequirement: [
          CreditProfile.PRIME,
          CreditProfile.NEAR_PRIME,
          CreditProfile.SUBPRIME,
          CreditProfile.NEW_BUSINESS,
          CreditProfile.ESTABLISHED,
        ],
      },

      profit_loss_statement: {
        name: 'Profit & Loss Statement',
        description:
          'Shows revenues, expenses, and the resulting profit or loss over a period of time',
        category: DocumentCategory.FINANCIAL_STATEMENTS,
        required: true,
        acceptedFormats: ['PDF', 'Excel'],
        validationRules: [
          {
            type: 'content',
            value: 'profit_loss',
            message: 'Must show revenue and expenses',
            severity: 'error',
          },
        ],
        helpText: [
          "Used to assess owner's personal and operating results of a business",
          'Must cover required time period',
          'Can be from accounting software',
        ],
        estimatedProcessingTime: 2,
        source: DocumentSource.BOOKKEEPING_SOFTWARE,
        packageLevel: 1,
        businessAgeRequirement: 'any',
        dealStage: [DealStage.SUBMIT],
        creditProfileRequirement: [
          CreditProfile.NEAR_PRIME,
          CreditProfile.SUBPRIME,
          CreditProfile.NEW_BUSINESS,
        ],
      },

      business_bank_statements: {
        name: 'Business Bank Statements',
        description: 'Validates cash balances',
        category: DocumentCategory.FINANCIAL_STATEMENTS,
        required: true,
        acceptedFormats: ['PDF', 'CSV'],
        validationRules: [
          { type: 'size', value: 10485760, message: 'File must be under 10MB', severity: 'error' },
          {
            type: 'content',
            value: 'bank_statement',
            message: 'Must be valid bank statement',
            severity: 'error',
          },
        ],
        helpText: [
          'Include all pages of each statement',
          'Must be consecutive months',
          'All business accounts required',
        ],
        estimatedProcessingTime: 2,
        source: DocumentSource.PLAID_CONNECT,
        packageLevel: 1,
        businessAgeRequirement: 'any',
        dealStage: [DealStage.SUBMIT],
        creditProfileRequirement: [
          CreditProfile.PRIME,
          CreditProfile.NEAR_PRIME,
          CreditProfile.SUBPRIME,
          CreditProfile.NEW_BUSINESS,
          CreditProfile.ESTABLISHED,
        ],
      },

      // Package 2 - Enhanced Documentation
      federal_tax_returns: {
        name: 'Federal Tax Returns',
        description: 'Shows revenue, expenses, net income, and tax details at a federal level',
        category: DocumentCategory.TAX_DOCUMENTS,
        required: true,
        acceptedFormats: ['PDF'],
        validationRules: [
          { type: 'signature', value: true, message: 'Must be signed', severity: 'error' },
          {
            type: 'content',
            value: 'tax_return',
            message: 'Must be complete tax return',
            severity: 'error',
          },
        ],
        helpText: [
          'Filed annually with the government to report sales and taxes owed',
          'Include all schedules',
          'Must be for required tax years',
        ],
        estimatedProcessingTime: 3,
        source: DocumentSource.APPLICANT_UPLOAD,
        packageLevel: 2,
        businessAgeRequirement: 'any',
        dealStage: [DealStage.SUBMIT],
        creditProfileRequirement: [
          CreditProfile.NEAR_PRIME,
          CreditProfile.SUBPRIME,
          CreditProfile.ESTABLISHED,
        ],
      },

      state_tax_returns: {
        name: 'State Tax Returns',
        description:
          'Filed annually with the government to report individual state income, deductions, and taxes',
        category: DocumentCategory.TAX_DOCUMENTS,
        required: true,
        acceptedFormats: ['PDF'],
        validationRules: [
          {
            type: 'content',
            value: 'state_tax',
            message: 'Must be state tax return',
            severity: 'error',
          },
        ],
        helpText: [
          'Filed annually with state for income and tax liability',
          'Must match federal returns',
          'Include all state jurisdictions',
        ],
        estimatedProcessingTime: 2,
        source: DocumentSource.APPLICANT_UPLOAD,
        packageLevel: 2,
        businessAgeRequirement: 'any',
        dealStage: [DealStage.SUBMIT],
        creditProfileRequirement: [CreditProfile.SUBPRIME],
      },

      // Package 3 - Comprehensive Analysis
      business_credit_report: {
        name: 'Business Credit Report',
        description: 'Inputs for credit models like bureau scores',
        category: DocumentCategory.API_REPORTS,
        required: true,
        acceptedFormats: ['PDF', 'JSON'],
        validationRules: [
          {
            type: 'content',
            value: 'credit_report',
            message: 'Must be valid credit report',
            severity: 'error',
          },
        ],
        helpText: [
          'Generated automatically via API',
          'Shows business credit history',
          'Used for underwriting decisions',
        ],
        estimatedProcessingTime: 1,
        source: DocumentSource.API_REPORT,
        packageLevel: 3,
        businessAgeRequirement: 'any',
        dealStage: [DealStage.SUBMIT],
        creditProfileRequirement: [CreditProfile.SUBPRIME, CreditProfile.NEW_BUSINESS],
      },

      ucc_filings_report: {
        name: 'UCC Filings Report on Applicant Business',
        description: 'Demonstrates applicant business as clear of existing liens',
        category: DocumentCategory.API_REPORTS,
        required: true,
        acceptedFormats: ['PDF'],
        validationRules: [
          {
            type: 'content',
            value: 'ucc_filing',
            message: 'Must show UCC filing status',
            severity: 'error',
          },
        ],
        helpText: [
          'Shows existing liens and encumbrances',
          'Generated via API integration',
          'Critical for collateral assessment',
        ],
        estimatedProcessingTime: 0.5,
        source: DocumentSource.CES_REPORT,
        packageLevel: 3,
        businessAgeRequirement: 'any',
        dealStage: [DealStage.SUBMIT, DealStage.FUND],
        creditProfileRequirement: [CreditProfile.NEAR_PRIME, CreditProfile.SUBPRIME],
      },

      // Package 4 - Maximum Documentation
      personal_financial_statement: {
        name: 'Personal Financial Statement',
        description: "Form detailing an individual's assets, liabilities, and net worth",
        category: DocumentCategory.PERSONAL_DOCUMENTS,
        required: true,
        acceptedFormats: ['PDF'],
        validationRules: [
          { type: 'signature', value: true, message: 'Must be signed', severity: 'error' },
        ],
        helpText: [
          'Assets include cash, real estate, investments, etc.',
          'Liabilities include loans, mortgages, credit card debt',
          'Calculate net worth',
        ],
        estimatedProcessingTime: 2,
        source: DocumentSource.APPLICANT_UPLOAD,
        packageLevel: 4,
        businessAgeRequirement: 'any',
        dealStage: [DealStage.SUBMIT],
        creditProfileRequirement: [CreditProfile.SUBPRIME, CreditProfile.NEW_BUSINESS],
      },

      equipment_appraisals: {
        name: 'Equipment Appraisals / Comparable Equipment Data',
        description: 'Third party validation inputs for residential market values',
        category: DocumentCategory.COLLATERAL_DOCUMENTS,
        required: false,
        acceptedFormats: ['PDF'],
        validationRules: [
          {
            type: 'content',
            value: 'appraisal',
            message: 'Must be certified appraisal',
            severity: 'error',
          },
        ],
        helpText: [
          'Must be from certified appraiser',
          'Include fair market and liquidation values',
          'Photos of equipment required',
        ],
        estimatedProcessingTime: 2,
        source: DocumentSource.THIRD_PARTY,
        packageLevel: 4,
        businessAgeRequirement: 'any',
        dealStage: [DealStage.SUBMIT, DealStage.FUND],
        creditProfileRequirement: [CreditProfile.SUBPRIME, CreditProfile.NEW_BUSINESS],
      },

      // Collateral Specific Documents
      collateral_details: {
        name: 'Collateral Details',
        description:
          'Equipment Descriptions, serial numbers, VIN Numbers, Make, Model, Year, Miles / Hours',
        category: DocumentCategory.COLLATERAL_DOCUMENTS,
        required: true,
        acceptedFormats: ['PDF', 'Excel'],
        validationRules: [
          {
            type: 'content',
            value: 'equipment_details',
            message: 'Must include all equipment details',
            severity: 'error',
          },
        ],
        helpText: [
          'Complete equipment specifications',
          'Serial numbers and VIN required',
          'Current condition assessment',
        ],
        estimatedProcessingTime: 1,
        source: DocumentSource.COLLATERAL_SELLER,
        packageLevel: 2,
        businessAgeRequirement: 'any',
        dealStage: [DealStage.SUBMIT, DealStage.FUND],
        creditProfileRequirement: [
          CreditProfile.PRIME,
          CreditProfile.NEAR_PRIME,
          CreditProfile.SUBPRIME,
        ],
      },

      // Business Age Specific Documents
      proof_business_ownership_2_years: {
        name: 'Proof of Business Ownership Document 1',
        description:
          'This proves when the business was started, principals of the business are who they say they are etc.',
        category: DocumentCategory.BUSINESS_DOCUMENTS,
        required: true,
        acceptedFormats: ['PDF'],
        validationRules: [
          {
            type: 'date',
            value: 'business_age_verification',
            message: 'Must verify business age',
            severity: 'error',
          },
        ],
        helpText: [
          'Articles of Incorporation or Formation Certificate',
          'Business License with start date',
          'Operating Agreement with dates',
        ],
        estimatedProcessingTime: 0.5,
        source: DocumentSource.APPLICANT_BUSINESS,
        packageLevel: 2,
        businessAgeRequirement: 'under_2_years',
        dealStage: [DealStage.SUBMIT],
        creditProfileRequirement: [CreditProfile.NEW_BUSINESS, CreditProfile.SUBPRIME],
      },

      // Personal Guarantor Documents
      personal_guarantor_info: {
        name: 'Personal Guarantor Information',
        description: 'IF WE HAVE A PERSONAL GUARANTOR',
        category: DocumentCategory.PERSONAL_DOCUMENTS,
        required: false,
        acceptedFormats: ['PDF'],
        validationRules: [
          {
            type: 'signature',
            value: true,
            message: 'Must be signed by guarantor',
            severity: 'error',
          },
        ],
        helpText: [
          'Required only if personal guarantee needed',
          'Complete financial information',
          'Credit authorization',
        ],
        estimatedProcessingTime: 2,
        source: DocumentSource.APPLICANT_BUSINESS,
        packageLevel: 3,
        businessAgeRequirement: 'any',
        dealStage: [DealStage.SUBMIT],
        creditProfileRequirement: [CreditProfile.SUBPRIME, CreditProfile.NEW_BUSINESS],
      },
    };

    // Convert to DocumentRequirement objects
    Object.entries(definitions).forEach(([id, def]) => {
      this.documentDefinitions.set(id, {
        id,
        ...def,
      });
    });
  }

  private loadPackageMatrix(): void {
    // Package 1: Basic Requirements (Prime Credit, Established Business)
    this.packageMatrix.set(1, [
      'unzipp_lease_loan_credit_application',
      'business_bank_statements',
      'collateral_details',
    ]);

    // Package 2: Standard Requirements (Near Prime, Some Documentation)
    this.packageMatrix.set(2, [
      'unzipp_lease_loan_credit_application',
      'profit_loss_statement',
      'business_bank_statements',
      'federal_tax_returns',
      'collateral_details',
    ]);

    // Package 3: Enhanced Requirements (Subprime, New Business)
    this.packageMatrix.set(3, [
      'unzipp_lease_loan_credit_application',
      'profit_loss_statement',
      'business_bank_statements',
      'federal_tax_returns',
      'state_tax_returns',
      'business_credit_report',
      'ucc_filings_report',
      'collateral_details',
      'proof_business_ownership_2_years',
    ]);

    // Package 4: Maximum Requirements (High Risk, Complex Transactions)
    this.packageMatrix.set(4, [
      'unzipp_lease_loan_credit_application',
      'profit_loss_statement',
      'business_bank_statements',
      'federal_tax_returns',
      'state_tax_returns',
      'business_credit_report',
      'ucc_filings_report',
      'personal_financial_statement',
      'equipment_appraisals',
      'collateral_details',
      'proof_business_ownership_2_years',
      'personal_guarantor_info',
    ]);
  }

  private loadRules(): void {
    // Enhanced rules based on matrix logic
    this.rules.set('packageDetermination', {
      calculatePackage: (data: ApplicationData): number => {
        // Calculate average credit score
        const avgCreditScore = Math.round(
          ((data.equifax || 0) + (data.experian || 0) + (data.transunion || 0)) / 3
        );

        // Base package on risk factors
        let package_level = 1;

        // Credit score impact
        if (avgCreditScore < 650) package_level = Math.max(package_level, 3);
        else if (avgCreditScore < 680) package_level = Math.max(package_level, 2);

        // Business age impact
        if (data.businessAgeMonths < 24) package_level = Math.max(package_level, 3);

        // Loan amount impact
        if (data.loanAmount > 1000000) package_level = Math.max(package_level, 4);
        else if (data.loanAmount > 500000) package_level = Math.max(package_level, 3);
        else if (data.loanAmount > 250000) package_level = Math.max(package_level, 2);

        // Revenue stability impact
        if (data.currentYearGrossRevenue < data.loanAmount * 1.5) {
          package_level = Math.max(package_level, 3);
        }

        // DSCR impact
        if (data.debtServiceCoverageRatio < 1.25) {
          package_level = Math.max(package_level, 3);
        }

        // Bankruptcy impact
        if (data.hasBankruptcy) {
          package_level = 4;
        }

        // Industry risk impact
        const highRiskIndustries = ['722', '713', '512']; // Food Service, Entertainment, Motion Pictures
        const mediumRiskIndustries = ['531', '236']; // Real Estate, Construction

        let industryRisk: 'low' | 'medium' | 'high' = 'low';
        if (highRiskIndustries.includes(data.industryCode)) {
          industryRisk = 'high';
          package_level = Math.max(package_level, 3);
        } else if (mediumRiskIndustries.includes(data.industryCode)) {
          industryRisk = 'medium';
        }

        // Repeat borrower benefit
        if (data.isRepeatBorrower && data.previousLoanPerformance === 'excellent') {
          package_level = Math.max(1, package_level - 1);
        }

        return Math.min(4, package_level);
      },
    });
  }

  private assessRisk(data: ApplicationData): RiskAssessment {
    // Calculate average credit score
    const avgCreditScore = Math.round(
      ((data.equifax || 0) + (data.experian || 0) + (data.transunion || 0)) / 3
    );

    // High risk industries
    const highRiskIndustries = ['722', '713', '512']; // Food Service, Entertainment, Motion Pictures

    // Credit score assessment
    let creditRisk: 'low' | 'medium' | 'high' = 'low';
    if (avgCreditScore < 650) creditRisk = 'high';
    else if (avgCreditScore < 680) creditRisk = 'medium';

    // Business age assessment
    let ageRisk: 'low' | 'medium' | 'high' = 'low';
    if (data.businessAgeMonths < 12) ageRisk = 'high';
    else if (data.businessAgeMonths < 24) ageRisk = 'medium';

    // Revenue stability (simplified)
    let revenueStability: 'high' | 'medium' | 'low' = 'high';
    if (data.seasonalBusiness) revenueStability = 'medium';
    if (data.currentYearGrossRevenue < data.loanAmount * 2) revenueStability = 'low';

    // Industry risk assessment
    const mediumRiskIndustries = ['531', '236']; // Real Estate, Construction

    let industryRisk: 'low' | 'medium' | 'high' = 'low';
    if (highRiskIndustries.includes(data.industryCode)) {
      industryRisk = 'high';
    } else if (mediumRiskIndustries.includes(data.industryCode)) {
      industryRisk = 'medium';
    }

    // Collateral strength (simplified)
    let collateralStrength: 'strong' | 'moderate' | 'weak' = 'strong';
    if (data.loanType === InstrumentType.GENERAL) collateralStrength = 'weak';
    if (data.equipmentAge && data.equipmentAge > 10) collateralStrength = 'moderate';

    // Overall risk calculation
    const riskScore =
      (creditRisk === 'high' ? 3 : creditRisk === 'medium' ? 2 : 1) +
      (ageRisk === 'high' ? 3 : ageRisk === 'medium' ? 2 : 1) +
      (revenueStability === 'low' ? 3 : revenueStability === 'medium' ? 2 : 1) +
      (industryRisk === 'high' ? 3 : industryRisk === 'medium' ? 2 : 1) +
      (collateralStrength === 'weak' ? 3 : collateralStrength === 'moderate' ? 2 : 1);

    const overallRisk: 'low' | 'medium' | 'high' =
      riskScore >= 12 ? 'high' : riskScore >= 8 ? 'medium' : 'low';

    // Recommended package based on risk
    const recommendedPackage =
      overallRisk === 'high' ? 4 : overallRisk === 'medium' ? 3 : data.loanAmount > 500000 ? 2 : 1;

    return {
      creditScore: avgCreditScore,
      businessAge: data.businessAgeMonths,
      revenueStability,
      industryRisk,
      collateralStrength,
      overallRisk,
      recommendedPackage,
    };
  }

  private determineCreditProfile(data: ApplicationData): CreditProfile {
    // Calculate average credit score
    const avgCreditScore = Math.round(
      ((data.equifax || 0) + (data.experian || 0) + (data.transunion || 0)) / 3
    );

    if (data.businessAgeMonths < 24) {
      return CreditProfile.NEW_BUSINESS;
    }

    if (avgCreditScore >= 720 && data.currentYearGrossRevenue >= data.loanAmount * 3) {
      return CreditProfile.PRIME;
    }

    if (avgCreditScore >= 650) {
      return CreditProfile.NEAR_PRIME;
    }

    if (avgCreditScore >= 600 && data.businessAgeMonths >= 24) {
      return CreditProfile.ESTABLISHED;
    }

    return CreditProfile.SUBPRIME;
  }

  public generateRequirements(applicationData: ApplicationData): DocumentRequirements {
    // Determine package level and credit profile
    const packageLevel =
      this.rules.get('packageDetermination')?.calculatePackage(applicationData) || 1;
    const creditProfile = this.determineCreditProfile(applicationData);
    const riskAssessment = this.assessRisk(applicationData);

    // Get base documents for package level
    const packageDocuments = this.packageMatrix.get(packageLevel) || [];
    const requiredDocIds = new Set<string>(packageDocuments);

    const conditionalRequirements: ConditionalRequirement[] = [];
    const specialRequirements: string[] = [];

    // Add conditional documents based on business age
    if (applicationData.businessAgeMonths < 24) {
      requiredDocIds.add('proof_business_ownership_2_years');
    }

    // Add equipment-specific documents
    if (applicationData.loanType === InstrumentType.EQUIPMENT) {
      requiredDocIds.add('collateral_details');
      if (applicationData.loanAmount > 100000 || packageLevel >= 3) {
        requiredDocIds.add('equipment_appraisals');
      }
    }

    // Add personal guarantor if high risk
    if (riskAssessment.overallRisk === 'high' || packageLevel >= 3) {
      requiredDocIds.add('personal_guarantor_info');
      conditionalRequirements.push({
        document: 'personal_guarantor_info',
        reason: 'Required for high-risk applications or when credit score is below 650',
        condition: (data: ApplicationData) => this.assessRisk(data).overallRisk === 'high',
      });
    }

    // Add state tax returns for subprime
    if (creditProfile === CreditProfile.SUBPRIME) {
      requiredDocIds.add('state_tax_returns');
      specialRequirements.push('Enhanced documentation required for credit profile');
    }

    // Add special requirements based on loan amount
    if (applicationData.loanAmount >= 1000000) {
      specialRequirements.push('third_party_audit');
      specialRequirements.push('enhanced_due_diligence');
    } else if (applicationData.loanAmount >= 500000) {
      specialRequirements.push('gaap_reviewed_financials');
    }

    // Convert document IDs to full DocumentRequirement objects
    const required: DocumentRequirement[] = [];
    Array.from(requiredDocIds).forEach(docId => {
      const docDef = this.documentDefinitions.get(docId);
      if (docDef) {
        // Filter by credit profile requirement
        if (
          !docDef.creditProfileRequirement ||
          docDef.creditProfileRequirement.includes(creditProfile)
        ) {
          required.push(docDef);
        }
      }
    });

    // Calculate total estimated processing time
    const totalProcessingTime = required.reduce(
      (sum, doc) => sum + (doc.estimatedProcessingTime || 1),
      0
    );

    // Base review time increases with package complexity
    const baseReviewTime = packageLevel * 24; // 24h per package level

    return {
      required,
      conditional: conditionalRequirements,
      total: required.length,
      estimatedReviewTime: baseReviewTime + totalProcessingTime,
      specialRequirements,
      packageLevel,
      creditProfile,
      riskAssessment,
    };
  }

  private formatDocumentName(docId: string): string {
    return docId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Integration with Smart Matching system
  public generateRequirementsForInstrument(
    instrumentId: string,
    applicationData: Partial<ApplicationData>
  ): DocumentRequirements {
    const fullApplicationData: ApplicationData = {
      loanAmount: applicationData.loanAmount || 0,
      loanType: applicationData.loanType || InstrumentType.GENERAL,
      businessAgeMonths: applicationData.businessAgeMonths || 0,
      currentYearGrossRevenue: applicationData.currentYearGrossRevenue || 0,
      requestedTermMonths: applicationData.requestedTermMonths || 60,
      debtServiceCoverageRatio: applicationData.debtServiceCoverageRatio || 1.0,
      hasBankruptcy: applicationData.hasBankruptcy || false,
      equifax: applicationData.equifax || 0,
      experian: applicationData.experian || 0,
      transunion: applicationData.transunion || 0,
      industryCode: applicationData.industryCode || '',
      requestDate: applicationData.requestDate || new Date(),
      ...applicationData,
    };

    return this.generateRequirements(fullApplicationData);
  }

  // Plaid integration helper
  public async enhanceWithPlaidData(
    applicationData: ApplicationData,
    plaidToken: string
  ): Promise<ApplicationData> {
    // This would integrate with actual Plaid API
    // For now, return enhanced mock data

    const mockPlaidAnalysis: PlaidAnalysis = {
      averageBalance: 45000,
      monthlyInflow: 85000,
      monthlyOutflow: 78000,
      overdraftFrequency: 0,
      depositConsistency: 'high',
      accountAge: 36,
    };

    return {
      ...applicationData,
      plaidConnected: true,
      bankStatementAnalysis: mockPlaidAnalysis,
    };
  }

  // Credit report integration
  public async enhanceWithCreditData(
    applicationData: ApplicationData,
    creditReportData: any
  ): Promise<ApplicationData> {
    // This would integrate with actual credit bureau APIs
    // Enhanced credit analysis would adjust package requirements

    return {
      ...applicationData,
      // Enhanced credit data would be added here
    };
  }
}

// Export singleton instance
export const documentAutoRequestEngine = new DocumentAutoRequestEngine();
export default DocumentAutoRequestEngine;
