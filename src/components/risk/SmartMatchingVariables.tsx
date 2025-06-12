import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  PlayIcon,
  PauseIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Define types for smart matching variables
interface DealType {
  id: string;
  name: string;
  isActive: boolean;
}

interface DealSizeRange {
  min: number;
  max: number;
  sweetSpot: number;
}

interface GeographicPreference {
  state: string;
  isActive: boolean;
}

interface IndustryPreference {
  industry: string;
  strength: number;
}

interface MatchingPreferences {
  dealTypes: DealType[];
  dealSizeRange: DealSizeRange;
  geographicPreferences: GeographicPreference[];
  industryPreferences: IndustryPreference[];
  dealComplexityTolerance: 'Low' | 'Medium' | 'High';
  speedPriority: number;
  pricingCompetitiveness: number;
  documentationFlexibility: number;
}

interface RelationshipMatchingAlgorithm {
  relationshipWeightingFactor: number;
  performanceThreshold: number;
  recentSuccessBoost: boolean;
  relationshipLongevityFactor: {
    new: number;
    established: number;
    longTerm: number;
  };
  issueResolutionImpact: number;
  relationshipStatusMultipliers: {
    preferred: number;
    active: number;
    probation: number;
    inactive: number;
    terminated: number;
  };
}

interface TransactionHistoryAnalysis {
  similarDealSuccessFactor: number;
  transactionRecencyDecay: {
    last30Days: number;
    last90Days: number;
    last180Days: number;
    lastYear: number;
    older: number;
  };
  volumeBasedScoring: {
    highVolume: number;
    mediumVolume: number;
    lowVolume: number;
  };
  transactionSizeMatch: boolean;
  geographicPerformance: boolean;
}

interface FeedbackIntegrationSystem {
  clientFeedbackWeight: number;
  feedbackRecencyDecay: {
    last30Days: number;
    last90Days: number;
    last180Days: number;
    older: number;
  };
  specificDealTypeFeedback: boolean;
  continuousFeedbackThreshold: number;
  negativeFeedbackImpact: {
    severe: number;
    moderate: number;
    minor: number;
  };
}

// New comprehensive EVA Risk Assessment interfaces
interface CreditAgencyScores {
  equifaxFico: {
    enabled: boolean;
    score: number;
    model: string; // "FICO 2, 5, 8, 9"
    weight: number;
  };
  transUnionFico: {
    enabled: boolean;
    score: number;
    model: string;
    weight: number;
  };
  experianFico: {
    enabled: boolean;
    score: number;
    model: string;
    weight: number;
  };
}

interface PersonalCreditWorthiness {
  creditAgencyScores: CreditAgencyScores;
  blendedCreditScore: number;
  blendedPaymentHistory: number;
  publicRecords: string[];
  ageOfCreditHistory: number;
  recentInquiries: number;
  typesOfCredit: string[];
  averageLengthOfCredit: number;
  paymentTrends: number;
  totalTrades: number;
}

interface BusinessCreditScores {
  businessIntelScore: number;
  paynetMasterScore: number;
  equifaxOneScore: number;
  lexisNexisScore: number;
  dunnPaydexScore: number;
}

interface FinancialStatementsRatios {
  // Data sources configuration
  dataSources: {
    plaid: { enabled: boolean; apiKey: string; };
    quickbooks: { enabled: boolean; apiKey: string; };
    stripe: { enabled: boolean; apiKey: string; };
    manualUpload: { enabled: boolean; };
  };
  
  // Financial ratios
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

interface BusinessCashFlowVariables {
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

interface LegalRegulatoryCompliance {
  complianceHistory: string;
  legalType: 'LLC' | 'Corporation' | 'Partnership' | 'Sole Proprietorship' | 'Other';
  legalDisputes: string[];
  licenseRequirements: string[];
  industrySpecificRegs: string[];
  regulatoryAudits: string[];
}

interface EquipmentFactors {
  equipmentTypeDemand: number;
  equipmentAge: number;
  residualValue: number;
  depreciationRate: number;
  replacementCost: number;
  utilizationRate: number;
  maintenanceCosts: number;
}

interface PropertyFactors {
  loanToValueRatio: number;
  debtServiceCoverage: number;
  propertyGrade: 'A' | 'B' | 'C';
  loanRateType: 'Fixed' | 'Hybrid' | 'Variable';
  propertyLiens: string[];
  averageLeaseLength: number;
}

interface RiskScoreCustomization {
  creditWorthinessWeight: number;
  financialRatioWeight: number;
  cashFlowWeight: number;
  complianceWeight: number;
  equipmentWeight: number;
  propertyWeight: number;
}

interface EVARiskAssessment {
  // Core risk scoring
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  totalScore: number;
  creditWorthinessScore: number;
  financialRatioScore: number;
  cashFlowScore: number;
  complianceScore: number;
  equipmentScore: number;
  propertyScore: number;
  negativeFactors: string[];
  isCustomWeighted: boolean;
  customizedBy: string;

  // Credit assessment
  personalCreditWorthiness: PersonalCreditWorthiness;
  businessCreditScores: BusinessCreditScores;
  
  // Financial analysis
  financialStatementsRatios: FinancialStatementsRatios;
  businessCashFlowVariables: BusinessCashFlowVariables;
  
  // Compliance and legal
  legalRegulatoryCompliance: LegalRegulatoryCompliance;
  
  // Asset-specific factors
  equipmentFactors: EquipmentFactors;
  propertyFactors: PropertyFactors;
  
  // Customization
  riskScoreCustomization: RiskScoreCustomization;
}

interface FinancialInstrumentConfiguration {
  id: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  lastModified: string;
  matchingPreferences: MatchingPreferences;
  relationshipMatchingAlgorithm: RelationshipMatchingAlgorithm;
  transactionHistoryAnalysis: TransactionHistoryAnalysis;
  feedbackIntegrationSystem: FeedbackIntegrationSystem;
  evaRiskAssessment: EVARiskAssessment; // New comprehensive risk assessment
}

// Simplified interfaces for instrument configuration
interface MinimumRequirement {
  id: string;
  name: string;
  type: 'credit_score' | 'revenue' | 'time_in_business' | 'cash_flow' | 'debt_ratio' | 'collateral_value';
  minimumValue: number;
  weight: number;
  isRequired: boolean;
}

interface RequiredDocument {
  id: string;
  name: string;
  category: 'financial' | 'legal' | 'operational' | 'collateral';
  isRequired: boolean;
  description: string;
}

interface RiskFactor {
  id: string;
  name: string;
  category: 'credit' | 'financial' | 'operational' | 'market';
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

interface InstrumentConfiguration {
  id: string;
  name: string;
  instrumentType: 'equipment_financing' | 'commercial_real_estate' | 'working_capital' | 'invoice_factoring' | 'term_loan' | 'construction';
  isActive: boolean;
  isDefault: boolean;
  
  // Core configuration
  minimumRequirements: MinimumRequirement[];
  requiredDocuments: RequiredDocument[];
  riskFactors: RiskFactor[];
  
  // Loan parameters
  minLoanAmount: number;
  maxLoanAmount: number;
  minTerm: number;
  maxTerm: number;
  baseInterestRate: number;
  
  // Metadata
  createdAt: string;
  lastModified: string;
}

const SmartMatchingVariables: React.FC = () => {
  // Simplified default configuration
  const createSimpleConfiguration = (id: string, name: string, type: InstrumentConfiguration['instrumentType']): InstrumentConfiguration => ({
    id,
    name,
    instrumentType: type,
    isActive: true,
    isDefault: false,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    
    minimumRequirements: [
      {
        id: 'min_credit_score',
        name: 'Minimum Credit Score',
        type: 'credit_score',
        minimumValue: 650,
        weight: 30,
        isRequired: true,
      },
      {
        id: 'min_revenue',
        name: 'Minimum Annual Revenue',
        type: 'revenue',
        minimumValue: 500000,
        weight: 25,
        isRequired: true,
      },
      {
        id: 'time_in_business',
        name: 'Minimum Time in Business (months)',
        type: 'time_in_business',
        minimumValue: 24,
        weight: 20,
        isRequired: true,
      },
    ],
    
    requiredDocuments: [
      {
        id: 'financial_statements',
        name: 'Financial Statements (Last 2 Years)',
        category: 'financial',
        isRequired: true,
        description: 'Audited or reviewed financial statements for the past 2 years',
      },
      {
        id: 'bank_statements',
        name: 'Bank Statements (Last 6 Months)',
        category: 'financial',
        isRequired: true,
        description: 'Business bank statements for the last 6 months',
      },
      {
        id: 'business_license',
        name: 'Business License',
        category: 'legal',
        isRequired: true,
        description: 'Current business license and registration documents',
      },
    ],
    
    riskFactors: [
      {
        id: 'industry_risk',
        name: 'Industry Risk Assessment',
        category: 'market',
        weight: 20,
        impact: 'negative',
        description: 'Assessment of industry stability and growth prospects',
      },
      {
        id: 'cash_flow_stability',
        name: 'Cash Flow Stability',
        category: 'financial',
        weight: 25,
        impact: 'positive',
        description: 'Consistency and predictability of cash flows',
      },
      {
        id: 'debt_service_coverage',
        name: 'Debt Service Coverage Ratio',
        category: 'financial',
        weight: 30,
        impact: 'positive',
        description: 'Ability to service debt obligations',
      },
    ],
    
    minLoanAmount: 50000,
    maxLoanAmount: 2000000,
    minTerm: 12,
    maxTerm: 84,
    baseInterestRate: 6.5,
  });

  // State management
  const [configurations, setConfigurations] = useState<InstrumentConfiguration[]>([
    { ...createSimpleConfiguration('equipment_financing', 'Equipment Financing', 'equipment_financing'), isDefault: true },
    createSimpleConfiguration('commercial_real_estate', 'Commercial Real Estate', 'commercial_real_estate'),
    createSimpleConfiguration('working_capital', 'Working Capital', 'working_capital'),
    createSimpleConfiguration('term_loan', 'Term Loan', 'term_loan'),
  ]);

  const [selectedConfigId, setSelectedConfigId] = useState<string>('equipment_financing');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newConfigName, setNewConfigName] = useState('');
  const [newConfigType, setNewConfigType] = useState<InstrumentConfiguration['instrumentType']>('equipment_financing');
  const [activeTab, setActiveTab] = useState<'requirements' | 'documents' | 'risks' | 'parameters'>('requirements');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);

  // Load configurations from localStorage on mount
  useEffect(() => {
    const savedConfigs = localStorage.getItem('instrument_configurations');
    if (savedConfigs) {
      try {
        const parsed = JSON.parse(savedConfigs);
        setConfigurations(parsed);
      } catch (error) {
        console.error('Error loading saved configurations:', error);
      }
    }
  }, []);

  // Save configurations to localStorage
  const saveConfigurationsToStorage = (configs: InstrumentConfiguration[]) => {
    try {
      localStorage.setItem('instrument_configurations', JSON.stringify(configs));
    } catch (error) {
      console.error('Error saving configurations:', error);
    }
  };

  // Get current selected configuration
  const getCurrentConfig = (): InstrumentConfiguration => {
    return configurations.find(config => config.id === selectedConfigId) || configurations[0];
  };

  // Update current configuration
  const updateCurrentConfig = (updates: Partial<InstrumentConfiguration>) => {
    setConfigurations(prev => {
      const updated = prev.map(config => 
        config.id === selectedConfigId 
          ? { ...config, ...updates, lastModified: new Date().toISOString() }
          : config
      );
      saveConfigurationsToStorage(updated);
      return updated;
    });
  };

  // CRUD Operations
  const createNewConfiguration = () => {
    if (!newConfigName.trim()) return;
    
    const newId = newConfigName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const newConfig = createSimpleConfiguration(newId, newConfigName, newConfigType);
    
    setConfigurations(prev => {
      const updated = [...prev, newConfig];
      saveConfigurationsToStorage(updated);
      return updated;
    });
    
    setSelectedConfigId(newId);
    setNewConfigName('');
    setShowCreateModal(false);
  };

  const deleteConfiguration = (configId: string) => {
    const configToDelete = configurations.find(config => config.id === configId);
    if (!configToDelete || configToDelete.isDefault) return;

    if (window.confirm(`Are you sure you want to delete "${configToDelete.name}"?`)) {
      setConfigurations(prev => {
        const updated = prev.filter(config => config.id !== configId);
        saveConfigurationsToStorage(updated);
        return updated;
      });
      
      if (selectedConfigId === configId) {
        setSelectedConfigId(configurations[0]?.id || '');
      }
    }
  };

  const toggleConfigurationStatus = (configId: string) => {
    setConfigurations(prev => {
      const updated = prev.map(config =>
        config.id === configId
          ? { ...config, isActive: !config.isActive, lastModified: new Date().toISOString() }
          : config
      );
      saveConfigurationsToStorage(updated);
      return updated;
    });
  };

  // Render configuration management header
  const renderConfigurationHeader = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Financial Instrument Configurator</h2>
          <p className="text-sm text-gray-600">Configure minimum requirements, risk factors, and document requirements for different financial instruments to match borrower applications.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create New Configuration
        </button>
      </div>

      {/* Configuration Selection and Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-md font-medium text-gray-800 mb-3">Select Financial Instrument Configuration</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {configurations.map(config => (
            <div
              key={config.id}
              className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all ${
                selectedConfigId === config.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedConfigId(config.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900">{config.name}</h4>
                    {config.isDefault && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Default</span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded ${
                      config.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {config.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Modified: {new Date(config.lastModified).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleConfigurationStatus(config.id); }}
                    className={`p-1 rounded hover:bg-gray-100 ${
                      config.isActive ? 'text-orange-600' : 'text-green-600'
                    }`}
                    title={config.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {config.isActive ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteConfiguration(config.id); }}
                    className="p-1 rounded hover:bg-gray-100 text-gray-600"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {selectedConfigId === config.id && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create New Configuration Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configuration Name
                </label>
                <input
                  type="text"
                  value={newConfigName}
                  onChange={(e) => setNewConfigName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g., Custom Equipment Financing"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instrument Type
                </label>
                <select
                  value={newConfigType}
                  onChange={(e) => setNewConfigType(e.target.value as InstrumentConfiguration['instrumentType'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="equipment_financing">Equipment Financing</option>
                  <option value="commercial_real_estate">Commercial Real Estate</option>
                  <option value="working_capital">Working Capital</option>
                  <option value="invoice_factoring">Invoice Factoring</option>
                  <option value="term_loan">Term Loan</option>
                  <option value="construction">Construction</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => { setShowCreateModal(false); setNewConfigName(''); }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createNewConfiguration}
                  disabled={!newConfigName.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Render the Requirements tab
  const renderRequirementsTab = () => {
    const currentConfig = getCurrentConfig();
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Minimum Requirements for {currentConfig.name}
        </h3>

        <div className="space-y-6">
          {currentConfig.minimumRequirements.map((requirement, index) => (
            <div key={requirement.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{requirement.name}</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={requirement.isRequired}
                    onChange={e => {
                      const updatedRequirements = [...currentConfig.minimumRequirements];
                      updatedRequirements[index] = { ...requirement, isRequired: e.target.checked };
                      updateCurrentConfig({ minimumRequirements: updatedRequirements });
                    }}
                    className="rounded border-gray-300 text-primary-600"
                  />
                  <span className="ml-2 text-sm">Required</span>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Value: {requirement.type === 'credit_score' ? requirement.minimumValue : 
                                   requirement.type === 'revenue' ? formatCurrency(requirement.minimumValue) :
                                   requirement.minimumValue}
                  </label>
                  <input
                    type="range"
                    min={requirement.type === 'credit_score' ? '300' : requirement.type === 'revenue' ? '50000' : '0'}
                    max={requirement.type === 'credit_score' ? '850' : requirement.type === 'revenue' ? '10000000' : '120'}
                    step={requirement.type === 'revenue' ? '25000' : '1'}
                    value={requirement.minimumValue}
                    onChange={e => {
                      const updatedRequirements = [...currentConfig.minimumRequirements];
                      updatedRequirements[index] = { ...requirement, minimumValue: parseInt(e.target.value) };
                      updateCurrentConfig({ minimumRequirements: updatedRequirements });
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight: {requirement.weight}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={requirement.weight}
                    onChange={e => {
                      const updatedRequirements = [...currentConfig.minimumRequirements];
                      updatedRequirements[index] = { ...requirement, weight: parseInt(e.target.value) };
                      updateCurrentConfig({ minimumRequirements: updatedRequirements });
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the Documents tab
  const renderDocumentsTab = () => {
    const currentConfig = getCurrentConfig();
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Required Documents for {currentConfig.name}
        </h3>

        <div className="space-y-4">
          {currentConfig.requiredDocuments.map((document, index) => (
            <div key={document.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{document.name}</h4>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded ${
                    document.category === 'financial' ? 'bg-green-100 text-green-800' :
                    document.category === 'legal' ? 'bg-blue-100 text-blue-800' :
                    document.category === 'operational' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {document.category}
                  </span>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={document.isRequired}
                      onChange={e => {
                        const updatedDocuments = [...currentConfig.requiredDocuments];
                        updatedDocuments[index] = { ...document, isRequired: e.target.checked };
                        updateCurrentConfig({ requiredDocuments: updatedDocuments });
                      }}
                      className="rounded border-gray-300 text-primary-600"
                    />
                    <span className="ml-2 text-sm">Required</span>
                  </label>
                </div>
              </div>
              <p className="text-sm text-gray-600">{document.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the Risk Factors tab
  const renderRisksTab = () => {
    const currentConfig = getCurrentConfig();
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Risk Factors for {currentConfig.name}
        </h3>

        <div className="space-y-4">
          {currentConfig.riskFactors.map((factor, index) => (
            <div key={factor.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{factor.name}</h4>
                  <p className="text-sm text-gray-600">{factor.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    factor.impact === 'positive' ? 'bg-green-100 text-green-800' :
                    factor.impact === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {factor.impact}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    factor.category === 'credit' ? 'bg-blue-100 text-blue-800' :
                    factor.category === 'financial' ? 'bg-green-100 text-green-800' :
                    factor.category === 'operational' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {factor.category}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight: {factor.weight}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={factor.weight}
                  onChange={e => {
                    const updatedFactors = [...currentConfig.riskFactors];
                    updatedFactors[index] = { ...factor, weight: parseInt(e.target.value) };
                    updateCurrentConfig({ riskFactors: updatedFactors });
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the Loan Parameters tab
  const renderParametersTab = () => {
    const currentConfig = getCurrentConfig();
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Loan Parameters for {currentConfig.name}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Loan Amount: {formatCurrency(currentConfig.minLoanAmount)}
            </label>
            <input
              type="range"
              min="10000"
              max="1000000"
              step="10000"
              value={currentConfig.minLoanAmount}
              onChange={e => {
                updateCurrentConfig({ minLoanAmount: parseInt(e.target.value) });
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Loan Amount: {formatCurrency(currentConfig.maxLoanAmount)}
            </label>
            <input
              type="range"
              min="100000"
              max="10000000"
              step="100000"
              value={currentConfig.maxLoanAmount}
              onChange={e => {
                updateCurrentConfig({ maxLoanAmount: parseInt(e.target.value) });
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Term: {currentConfig.minTerm} months
            </label>
            <input
              type="range"
              min="6"
              max="60"
              value={currentConfig.minTerm}
              onChange={e => {
                updateCurrentConfig({ minTerm: parseInt(e.target.value) });
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Term: {currentConfig.maxTerm} months
            </label>
            <input
              type="range"
              min="12"
              max="120"
              value={currentConfig.maxTerm}
              onChange={e => {
                updateCurrentConfig({ maxTerm: parseInt(e.target.value) });
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Interest Rate: {currentConfig.baseInterestRate.toFixed(2)}%
            </label>
            <input
              type="range"
              min="2"
              max="15"
              step="0.1"
              value={currentConfig.baseInterestRate}
              onChange={e => {
                updateCurrentConfig({ baseInterestRate: parseFloat(e.target.value) });
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>
        </div>
      </div>
    );
  };

  // Handle save configuration
  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      setSaveSuccess(false);
      setTimeout(() => setSaveSuccess(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Main render return
  return (
    <div className="space-y-6">
      {renderConfigurationHeader()}

      {/* Configuration Tabs */}
      <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap" aria-label="Tabs">
          <button
              onClick={() => setActiveTab('requirements')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'requirements'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Requirements
          </button>
          <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'documents'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Documents
          </button>
          <button
              onClick={() => setActiveTab('risks')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'risks'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Risks
          </button>
          <button
              onClick={() => setActiveTab('parameters')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'parameters'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Parameters
          </button>
        </nav>
      </div>

        <div className="p-6">
        {activeTab === 'requirements' && renderRequirementsTab()}
        {activeTab === 'documents' && renderDocumentsTab()}
        {activeTab === 'risks' && renderRisksTab()}
        {activeTab === 'parameters' && renderParametersTab()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          {saveSuccess !== null && (
            <div
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                saveSuccess 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Configuration saved successfully!
                </>
              ) : (
                <>
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Failed to save configuration
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex space-x-3">
        <button
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          onClick={() => {
              if (window.confirm('Are you sure you want to reset to defaults? This will discard all changes.')) {
                const currentConfig = getCurrentConfig();
                const defaultConfig = createSimpleConfiguration(currentConfig.id, currentConfig.name, currentConfig.instrumentType);
                updateCurrentConfig({
                  ...defaultConfig,
                  id: currentConfig.id,
                  name: currentConfig.name,
                  isDefault: currentConfig.isDefault,
                  createdAt: currentConfig.createdAt,
                });
            }
          }}
        >
          Reset to Defaults
        </button>

        <button
            className={`px-6 py-2 rounded-md transition-colors ${
              isSaving
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          onClick={handleSaveConfiguration}
          disabled={isSaving}
        >
            {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
        </div>
      </div>
    </div>
  );
};

export default SmartMatchingVariables;
