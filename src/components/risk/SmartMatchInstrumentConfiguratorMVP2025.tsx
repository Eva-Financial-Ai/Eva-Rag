import React, { useEffect, useState } from 'react';
import '../../styles/transaction-psychology-design-system.css';

// =============================================
// MVP 2025 - COMPREHENSIVE DATA MODEL (70 Fields)
// =============================================

// Enhanced interfaces for MVP 2025 with all 70 data points
interface CreditAgencyConfiguration {
  equifax: {
    enabled: boolean;
    ficoModel: '2' | '5' | '8' | '9';
    minimumScore: number;
  };
  transunion: {
    enabled: boolean;
    ficoModel: '2' | '5' | '8' | '9';
    minimumScore: number;
  };
  experian: {
    enabled: boolean;
    ficoModel: '2' | '5' | '8' | '9';
    minimumScore: number;
  };
}

interface DetailedCreditMetrics {
  blendedCreditScore: number;
  blendedPaymentHistory: 'excellent' | 'good' | 'fair' | 'poor';
  publicRecords: number;
  ageOfCreditHistory: number;
  recentInquiries: number;
  typesOfCredit: string[];
  averageLengthOfCredit: number;
  paymentTrends: 'improving' | 'stable' | 'declining';
  totalTrades: number;
}

interface ComprehensiveFinancialRatios {
  debtToEquityRatio: number;
  currentRatio: number;
  quickRatio: number;
  grossMargin: number;
  netMargin: number;
  returnOnAssets: number;
  returnOnEquity: number;
  interestCoverageRatio: number;
  ebitda: number;
}

interface DetailedCashFlowMetrics {
  operatingCashFlow: number;
  operatingCashFlowGrowth: number;
  freeCashFlow: number;
  cashFlowCoverageRatio: number;
  cashConversionCycle: number;
  daysAccountsReceivable: number;
  daysPayableOutstanding: number;
  daysInventoryOutstanding: number;
  workingCapital: number;
  cashFlowVolatility: number;
}

interface LegalComplianceMetrics {
  complianceHistory: 'excellent' | 'good' | 'fair' | 'poor';
  legalType: 'llc' | 'corporation' | 'partnership' | 'sole_proprietorship';
  legalDisputes: number;
  licenseRequirements: 'compliant' | 'pending' | 'non_compliant';
  industrySpecificRegs: 'compliant' | 'pending' | 'non_compliant';
  regulatoryAudits: 'clean' | 'minor_issues' | 'major_issues';
}

interface ComprehensiveEquipmentMetrics {
  equipmentTypeDemand: 'high' | 'medium' | 'low';
  equipmentAge: number;
  residualValue: number;
  depreciationRate: number;
  replacementCost: number;
  utilizationRate: number;
  maintenanceCosts: number;
}

interface ComprehensivePropertyMetrics {
  loanToValueRatio: number;
  debtServiceCoverage: number;
  propertyGrade: 'A' | 'B' | 'C' | 'D';
  loanRateType: 'fixed' | 'hybrid' | 'variable';
  propertyLiens: number;
  averageLeaseLength: number;
}

interface BusinessCreditScores {
  businessIntelScore: { enabled: boolean; minimumScore: number };
  paynetMasterScore: { enabled: boolean; minimumScore: number };
  equifaxOneScore: { enabled: boolean; minimumScore: number };
  lexisNexisScore: { enabled: boolean; minimumScore: number };
  dunnPaydexScore: { enabled: boolean; minimumScore: number };
}

interface RiskScoreWeights {
  creditWorthinessWeight: number;
  financialRatioWeight: number;
  cashFlowWeight: number;
  complianceWeight: number;
  equipmentWeight?: number;
  propertyWeight?: number;
}

// Main configuration interface with all 70 MVP 2025 fields
interface SmartMatchConfigurationMVP2025 {
  // 1-4: Core identification and scoring
  id: string;
  instrumentName: string;
  instrumentType: string;
  minimumRiskGrade: string;
  minimumTotalScore: number;

  // 5-12: EVA Risk Model Core Scores
  creditWorthinessScore: number;
  financialRatioScore: number;
  cashFlowScore: number;
  complianceScore: number;
  equipmentScore?: number;
  propertyScore?: number;
  isCustomWeighted: boolean;
  customizedBy?: string;

  // 13-21: Credit Worthiness (Personal & Business with Agency Toggle)
  creditAgencies: CreditAgencyConfiguration;
  detailedCreditMetrics: DetailedCreditMetrics;

  // 22-30: Financial Statements and Ratios (Plaid, Accounting Software, Stripe, Taxes)
  comprehensiveFinancialRatios: ComprehensiveFinancialRatios;

  // 31-40: Business Cash Flow Variables
  detailedCashFlowMetrics: DetailedCashFlowMetrics;

  // 41-46: Legal and Regulatory Compliance
  legalAndCompliance: LegalComplianceMetrics;

  // 47-53: Equipment Value and Type (for equipment loans)
  comprehensiveEquipmentMetrics?: ComprehensiveEquipmentMetrics;

  // 54-59: Property Financial Health (for real estate loans)
  comprehensivePropertyMetrics?: ComprehensivePropertyMetrics;

  // 60-65: Risk Score Customization (Lender Preferences)
  riskWeights: RiskScoreWeights;

  // 66-70: Business Credit Scores
  businessCreditScores: BusinessCreditScores;
}

// Data source mapping for each field
const DATA_SOURCE_MAPPING = {
  // Credit Agencies - Direct API Integration
  equifaxFICO: { source: 'Equifax API', endpoint: '/credit/fico', formula: 'Direct Score' },
  transunionFICO: { source: 'TransUnion API', endpoint: '/credit/fico', formula: 'Direct Score' },
  experianFICO: { source: 'Experian API', endpoint: '/credit/fico', formula: 'Direct Score' },

  // Financial Ratios - Multiple Sources
  currentRatio: {
    source: 'Plaid/QuickBooks/Stripe',
    formula: 'Current Assets / Current Liabilities',
  },
  debtToEquity: { source: 'Financial Statements', formula: 'Total Debt / Total Equity' },
  quickRatio: {
    source: 'Balance Sheet',
    formula: '(Current Assets - Inventory) / Current Liabilities',
  },
  returnOnAssets: { source: 'Financial Statements', formula: 'Net Income / Total Assets' },
  returnOnEquity: { source: 'Financial Statements', formula: 'Net Income / Shareholder Equity' },

  // Cash Flow - Bank/Accounting Integration
  operatingCashFlow: { source: 'Plaid/Bank Statements', formula: 'Cash from Operating Activities' },
  freeCashFlow: {
    source: 'Cash Flow Statement',
    formula: 'Operating Cash Flow - Capital Expenditures',
  },
  daysReceivable: { source: 'A/R Aging', formula: '(Accounts Receivable / Revenue) * 365' },
  daysPayable: { source: 'A/P Reports', formula: '(Accounts Payable / COGS) * 365' },

  // Tax Data - Tax Return Integration
  ebitda: {
    source: 'Tax Returns/P&L',
    formula: 'Earnings + Interest + Taxes + Depreciation + Amortization',
  },
  grossMargin: { source: 'P&L Statement', formula: '(Revenue - COGS) / Revenue * 100' },
  netMargin: { source: 'P&L Statement', formula: 'Net Income / Revenue * 100' },

  // Business Credit - Bureau APIs
  businessIntelScore: { source: 'Business Intelligence Bureau', endpoint: '/business/score' },
  paynetMasterScore: { source: 'PayNet API', endpoint: '/master-score' },
  dunnPaydexScore: { source: 'D&B API', endpoint: '/paydex-score' },
};

// Static data for form options
const INSTRUMENT_TYPES = [
  { value: 'business_loan', label: 'Business Loan' },
  { value: 'equipment_financing', label: 'Equipment Financing' },
  { value: 'commercial_mortgage', label: 'Commercial Mortgage' },
  { value: 'working_capital', label: 'Working Capital' },
  { value: 'sba_loan', label: 'SBA Loan' },
];

const RISK_GRADES = [
  { value: 'A', label: 'A - Excellent (Low Risk)' },
  { value: 'B', label: 'B - Good (Moderate Risk)' },
  { value: 'C', label: 'C - Fair (Higher Risk)' },
  { value: 'D', label: 'D - Poor (High Risk)' },
];

// Default configuration function for all 70 MVP 2025 fields
const getDefaultConfiguration = (): SmartMatchConfigurationMVP2025 => ({
  // 1-4: Core identification and scoring
  id: '',
  instrumentName: '',
  instrumentType: 'business_loan',
  minimumRiskGrade: 'B',
  minimumTotalScore: 70,

  // 5-12: EVA Risk Model Core Scores
  creditWorthinessScore: 0,
  financialRatioScore: 0,
  cashFlowScore: 0,
  complianceScore: 0,
  equipmentScore: 0,
  propertyScore: 0,
  isCustomWeighted: false,
  customizedBy: undefined,

  // 13-21: Credit Worthiness
  creditAgencies: {
    equifax: { enabled: true, ficoModel: '8', minimumScore: 650 },
    transunion: { enabled: true, ficoModel: '8', minimumScore: 650 },
    experian: { enabled: true, ficoModel: '8', minimumScore: 650 },
  },
  detailedCreditMetrics: {
    blendedCreditScore: 650,
    blendedPaymentHistory: 'good',
    publicRecords: 0,
    ageOfCreditHistory: 5,
    recentInquiries: 3,
    typesOfCredit: ['credit_cards', 'auto_loan', 'mortgage'],
    averageLengthOfCredit: 8,
    paymentTrends: 'stable',
    totalTrades: 10,
  },

  // 22-30: Financial Statements and Ratios
  comprehensiveFinancialRatios: {
    debtToEquityRatio: 0.5,
    currentRatio: 1.5,
    quickRatio: 1.2,
    grossMargin: 0.3,
    netMargin: 0.1,
    returnOnAssets: 0.08,
    returnOnEquity: 0.15,
    interestCoverageRatio: 3.0,
    ebitda: 100000,
  },

  // 31-40: Business Cash Flow Variables
  detailedCashFlowMetrics: {
    operatingCashFlow: 100000,
    operatingCashFlowGrowth: 0.1,
    freeCashFlow: 80000,
    cashFlowCoverageRatio: 1.5,
    cashConversionCycle: 45,
    daysAccountsReceivable: 30,
    daysPayableOutstanding: 30,
    daysInventoryOutstanding: 15,
    workingCapital: 200000,
    cashFlowVolatility: 0.15,
  },

  // 41-46: Legal and Regulatory Compliance
  legalAndCompliance: {
    complianceHistory: 'good',
    legalType: 'llc',
    legalDisputes: 0,
    licenseRequirements: 'compliant',
    industrySpecificRegs: 'compliant',
    regulatoryAudits: 'clean',
  },

  // 47-53: Equipment Value and Type
  comprehensiveEquipmentMetrics: {
    equipmentTypeDemand: 'medium',
    equipmentAge: 3,
    residualValue: 0.6,
    depreciationRate: 0.15,
    replacementCost: 500000,
    utilizationRate: 0.8,
    maintenanceCosts: 25000,
  },

  // 54-59: Property Financial Health
  comprehensivePropertyMetrics: {
    loanToValueRatio: 0.75,
    debtServiceCoverage: 1.25,
    propertyGrade: 'B',
    loanRateType: 'fixed',
    propertyLiens: 0,
    averageLeaseLength: 60,
  },

  // 60-65: Risk Score Customization
  riskWeights: {
    creditWorthinessWeight: 25,
    financialRatioWeight: 25,
    cashFlowWeight: 25,
    complianceWeight: 15,
    equipmentWeight: 5,
    propertyWeight: 5,
  },

  // 66-70: Business Credit Scores
  businessCreditScores: {
    businessIntelScore: { enabled: true, minimumScore: 70 },
    paynetMasterScore: { enabled: true, minimumScore: 70 },
    equifaxOneScore: { enabled: true, minimumScore: 70 },
    lexisNexisScore: { enabled: true, minimumScore: 70 },
    dunnPaydexScore: { enabled: true, minimumScore: 70 },
  },
});

interface Props {
  editingInstrument?: SmartMatchConfigurationMVP2025;
  onSaveSuccess?: () => void;
}

// Enhanced Tooltip Component with Transaction Psychology
const TransactionTooltip: React.FC<{ children: React.ReactNode; content: string }> = ({
  children,
  content,
}) => {
  return (
    <div className="tx-tooltip">
      {children}
      <div className="tx-tooltip-content">{content}</div>
    </div>
  );
};

const SmartMatchInstrumentConfiguratorMVP2025: React.FC<Props> = ({
  editingInstrument,
  onSaveSuccess,
}) => {
  const [configuration, setConfiguration] =
    useState<SmartMatchConfigurationMVP2025>(getDefaultConfiguration);
  const [activeSection, setActiveSection] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load editing instrument data when component mounts
  useEffect(() => {
    if (editingInstrument) {
      setConfiguration(editingInstrument);
    } else {
      setConfiguration(getDefaultConfiguration());
    }
  }, [editingInstrument]);

  // Handle field changes
  const handleFieldChange = (field: keyof SmartMatchConfigurationMVP2025, value: any) => {
    setConfiguration(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle nested object updates
  const handleNestedChange = (
    section: keyof SmartMatchConfigurationMVP2025,
    field: string,
    value: any
  ) => {
    setConfiguration(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  // Validation function for weights
  const validateWeights = () => {
    const weights = configuration.riskWeights;
    const total =
      weights.creditWorthinessWeight +
      weights.financialRatioWeight +
      weights.cashFlowWeight +
      weights.complianceWeight +
      (weights.equipmentWeight || 0) +
      (weights.propertyWeight || 0);
    return Math.abs(total - 100) < 0.01;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!configuration.instrumentName.trim()) {
      console.error('Instrument name is required');
      alert('Instrument name is required');
      return;
    }

    if (!validateWeights()) {
      console.error('Risk weights must total exactly 100%');
      alert('Risk weights must total exactly 100%');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const savedConfig = {
        ...configuration,
        id: configuration.id || `instrument_${Date.now()}`,
        customizedBy: 'current_user_id',
        isCustomWeighted: true,
      };

      console.log('Saving MVP 2025 configuration:', savedConfig);
      console.log(
        `✅ Smart Match instrument "${configuration.instrumentName}" saved successfully!`
      );

      setIsSubmitting(false);
      if (onSaveSuccess) onSaveSuccess();
    }, 1000);
  };

  const sectionTabs = [
    { id: 'general', label: 'General Configuration', icon: '⚙️', color: 'trust' },
    { id: 'credit', label: 'Credit Agencies & Metrics', icon: '💳', color: 'success' },
    { id: 'financial', label: 'Financial Ratios', icon: '📊', color: 'premium' },
    { id: 'cashflow', label: 'Cash Flow Metrics', icon: '💰', color: 'wealth' },
    { id: 'compliance', label: 'Legal & Compliance', icon: '⚖️', color: 'trust' },
    { id: 'equipment', label: 'Equipment Metrics', icon: '🏭', color: 'action' },
    { id: 'property', label: 'Property Metrics', icon: '🏢', color: 'premium' },
    { id: 'business-credit', label: 'Business Credit Scores', icon: '🎯', color: 'success' },
    { id: 'weights', label: 'Risk Score Weights', icon: '⚖️', color: 'wealth' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Card with Transaction Psychology */}
      <div className="tx-card tx-card-premium mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tx-text-premium mb-2">
              Smart Match Instrument Configuration
            </h2>
            <p className="tx-text-neutral-medium">
              MVP 2025 • Configure all 70 data points for comprehensive risk assessment and smart
              matching
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="tx-badge tx-badge-premium">MVP 2025</div>
            <div className="tx-badge tx-badge-wealth">70 Fields</div>
            <div className="tx-badge tx-badge-success">Active</div>
          </div>
        </div>

        {/* Section Navigation with Enhanced Psychology */}
        <div className="border-b border-gray-200 mb-6">
          <div className="overflow-x-auto">
            <nav className="flex space-x-1 min-w-max pb-4">
              {sectionTabs.map(tab => (
                <TransactionTooltip
                  key={tab.id}
                  content={`Configure ${tab.label.toLowerCase()} settings for comprehensive risk assessment`}
                >
                  <button
                    onClick={() => setActiveSection(tab.id)}
                    className={`
                      px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap
                      flex items-center space-x-2 min-w-max
                      ${
                        activeSection === tab.id
                          ? `tx-btn-${tab.color} transform scale-105`
                          : 'tx-btn-secondary hover:transform hover:scale-102'
                      }
                    `}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                </TransactionTooltip>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Configuration Section */}
        {activeSection === 'general' && (
          <div className="tx-card tx-card-trust">
            <div className="mb-6">
              <h3 className="text-xl font-bold tx-text-trust mb-2 flex items-center">
                <span className="mr-3 text-2xl">⚙️</span>
                General Configuration
              </h3>
              <p className="tx-text-neutral-medium">
                Set up basic matching parameters and risk grade thresholds
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">
                  <TransactionTooltip content="Enter a descriptive name for this financial instrument">
                    Instrument Name *
                  </TransactionTooltip>
                </label>
                <input
                  type="text"
                  value={configuration.instrumentName}
                  onChange={e => handleFieldChange('instrumentName', e.target.value)}
                  className="tx-input"
                  placeholder="e.g., Small Business Term Loan, Equipment Financing..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <TransactionTooltip content="Select the type of financial instrument for specialized matching">
                    Instrument Type
                  </TransactionTooltip>
                </label>
                <select
                  value={configuration.instrumentType}
                  onChange={e => handleFieldChange('instrumentType', e.target.value)}
                  className="tx-input"
                >
                  {INSTRUMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <TransactionTooltip content="Set the minimum acceptable risk grade for this instrument">
                    Minimum Risk Grade
                  </TransactionTooltip>
                </label>
                <select
                  value={configuration.minimumRiskGrade}
                  onChange={e => handleFieldChange('minimumRiskGrade', e.target.value)}
                  className="tx-input"
                >
                  {RISK_GRADES.map(grade => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <TransactionTooltip content="Set the minimum total score percentage required (0-100)">
                    Minimum Total Score (%)
                  </TransactionTooltip>
                </label>
                <input
                  type="number"
                  value={configuration.minimumTotalScore}
                  onChange={e => handleFieldChange('minimumTotalScore', parseInt(e.target.value))}
                  className="tx-input"
                  min="0"
                  max="100"
                  placeholder="70"
                />
                <div className="mt-2 text-xs tx-text-neutral-medium">
                  Recommended: 70-85% for balanced risk/opportunity
                </div>
              </div>
            </div>

            {/* Configuration Preview */}
            <div className="mt-6 p-4 tx-bg-trust-light rounded-lg">
              <h4 className="font-semibold tx-text-trust mb-2">Configuration Preview</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="tx-text-neutral-medium">Name:</span>
                  <div className="font-medium">{configuration.instrumentName || 'Not set'}</div>
                </div>
                <div>
                  <span className="tx-text-neutral-medium">Type:</span>
                  <div className="font-medium">
                    {INSTRUMENT_TYPES.find(t => t.value === configuration.instrumentType)?.label}
                  </div>
                </div>
                <div>
                  <span className="tx-text-neutral-medium">Min Grade:</span>
                  <div className="font-medium tx-text-trust">{configuration.minimumRiskGrade}</div>
                </div>
                <div>
                  <span className="tx-text-neutral-medium">Min Score:</span>
                  <div className="font-medium tx-text-success">
                    {configuration.minimumTotalScore}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add other sections with similar psychology-driven design patterns */}
        {/* ... (other sections would follow similar patterns) ... */}

        {/* Action Buttons with Transaction Psychology */}
        <div className="tx-card">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setConfiguration(getDefaultConfiguration())}
                className="tx-btn-secondary"
              >
                <span className="mr-2">🔄</span>
                Reset to Defaults
              </button>
              <button type="button" className="tx-btn-trust">
                <span className="mr-2">💾</span>
                Save as Draft
              </button>
            </div>

            <div className="flex space-x-3">
              <button type="button" className="tx-btn-action">
                <span className="mr-2">👁️</span>
                Preview Configuration
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`tx-btn-premium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✨</span>
                    Save Configuration
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Success Indicator */}
          {!isSubmitting && configuration.instrumentName && (
            <div className="mt-4 p-3 tx-bg-success-light rounded-lg">
              <div className="flex items-center text-sm tx-text-success-dark">
                <span className="mr-2">✅</span>
                Configuration ready for "{configuration.instrumentName}"
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default SmartMatchInstrumentConfiguratorMVP2025;
