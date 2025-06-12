import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiskConfigType, useRiskConfig } from '../../contexts/RiskConfigContext';
import { useTransactionStore } from '../../hooks/useTransactionStore';
import '../../styles/transaction-psychology-design-system.css';
import SmartMatchInstrumentConfiguratorMVP2025 from './SmartMatchInstrumentConfiguratorMVP2025';

import { debugLog } from '../../utils/auditLogger';

// Import Tooltip component directly
const Tooltip: React.FC<{
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ children, content, position = 'top' }) => {
  return (
    <div className="tx-tooltip">
      {children}
      <div className="tx-tooltip-content">{content}</div>
    </div>
  );
};

// Type definitions
export type LoanType = 'general' | 'equipment' | 'realestate';
export type LabTab = 'general' | 'instrument'; // New type for lab navigation tabs

interface RiskLabProps {
  initialLoanType?: LoanType;
}

const RiskLab: React.FC<RiskLabProps> = ({ initialLoanType = 'general' }) => {
  const navigate = useNavigate();
  const riskContext = useRiskConfig();
  const { currentTransaction } = useTransactionStore();
  const [activeTab, setActiveTab] = useState<'risk-config' | 'smart-match' | 'instrument-manager'>(
    'risk-config'
  );
  const [loanType, setLoanType] = useState<LoanType>(initialLoanType);
  const [activeLabTab, setActiveLabTab] = useState<LabTab>('general'); // Changed from activeCategory
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [configurationTips, setConfigurationTips] = useState<string[]>([]);
  const [editingInstrument, setEditingInstrument] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  // Update loan type based on current transaction
  useEffect(() => {
    if (currentTransaction?.type) {
      const transactionType = currentTransaction.type.toLowerCase();
      if (transactionType.includes('equipment') || transactionType.includes('vehicle')) {
        setLoanType('equipment');
      } else if (transactionType.includes('real') || transactionType.includes('property')) {
        setLoanType('realestate');
      } else {
        setLoanType('general');
      }
    }
  }, [currentTransaction?.type]);

  // Update risk config context based on loan type (no longer affecting lab tab)
  useEffect(() => {
    // Update risk config context
    const configType = mapLoanTypeToConfigType(loanType);
    riskContext.loadConfigForType(configType as RiskConfigType);

    // Update configuration tips based on loan type
    updateConfigurationTips(loanType);
  }, [loanType, riskContext]);

  // Helper function to map loan type to config type
  const mapLoanTypeToConfigType = (type: LoanType): string => {
    switch (type) {
      case 'equipment':
        return 'equipment_vehicles';
      case 'realestate':
        return 'real_estate';
      default:
        return 'general';
    }
  };

  // Update configuration tips based on loan type
  const updateConfigurationTips = (type: LoanType) => {
    switch (type) {
      case 'equipment':
        setConfigurationTips([
          'Equipment financing typically requires collateral assessment',
          'Consider equipment age, condition, and resale value',
          'Verify equipment specifications and compliance requirements',
          'Review maintenance history and warranty status',
        ]);
        break;
      case 'realestate':
        setConfigurationTips([
          'Real estate loans require property appraisal and market analysis',
          'Consider location factors and local market conditions',
          'Review environmental assessments and zoning compliance',
          'Evaluate property income potential and occupancy rates',
        ]);
        break;
      default:
        setConfigurationTips([
          'General business loans focus on cash flow and creditworthiness',
          'Review business financials and payment history',
          'Consider industry risk factors and market conditions',
          'Evaluate management experience and business plan',
        ]);
    }
  };

  // Handle instrument editing from manager
  const handleEditInstrument = (instrument: any) => {
    setEditingInstrument(instrument);
    setActiveTab('smart-match');
  };

  // Handle creating new instrument from manager
  const handleCreateNewInstrument = () => {
    setEditingInstrument(null);
    setActiveTab('smart-match');
  };

  // Mock function to get current loan configuration (in a real app, this would come from context)
  const getCurrentConfiguration = () => {
    return {
      loanType,
      creditScoreMin: 650,
      debtToIncomeMax: 45,
      loanToValueMax: 80,
      // Add more configuration fields as needed
    };
  };

  // Mock function to get risk metrics (in a real app, this would come from API)
  const getRiskMetrics = () => {
    const metrics = {
      equipment: {
        dataPoints: '2,847',
        processingTime: '2.3 seconds',
        accuracy: '94.2%',
      },
      realestate: {
        dataPoints: '1,956',
        processingTime: '3.1 seconds',
        accuracy: '91.7%',
      },
      general: {
        dataPoints: '4,123',
        processingTime: '1.8 seconds',
        accuracy: '96.1%',
      },
    };
    return metrics[loanType];
  };

  const currentMetrics = getRiskMetrics();

  // Determine if advanced features should be shown (mock paywall logic)
  const hasAdvancedAccess = true; // In real app, this would check user subscription

  const handleLabTabChange = (tab: LabTab) => {
    setActiveLabTab(tab);
    if (!hasAdvancedAccess && tab === 'instrument') {
      setShowPaywall(true);
      return;
    }
    // Handle tab-specific logic here
  };

  const handleLoanTypeChange = (type: LoanType) => {
    setLoanType(type);
    // This will trigger the useEffect to update config and tips
  };

  const handleGenerateReport = () => {
    if (!hasAdvancedAccess) {
      setShowPaywall(true);
      return;
    }

    // Navigate to EVA report page with current configuration
    navigate('/risk-assessment/eva-report', {
      state: {
        fromLab: true,
        configuration: getCurrentConfiguration(),
        transaction: currentTransaction,
      },
    });
  };

  const TabNavigation = () => (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => setActiveLabTab('general')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
            activeLabTab === 'general'
              ? 'border-blue-500 text-blue-600 tx-text-trust'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Tooltip content="Configure basic risk parameters and matching rules">
            Risk Configuration
          </Tooltip>
        </button>
        <button
          onClick={() => setActiveLabTab('instrument')}
          className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 tx-btn-trust ${
            activeLabTab === 'instrument'
              ? 'border-blue-500 text-blue-600 tx-text-trust'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Tooltip content="Manage and configure financial instruments">Instrument Manager</Tooltip>
        </button>
      </nav>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section with Transaction Psychology */}
      <div className="tx-card tx-card-trust mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tx-text-trust mb-2">Assessment Laboratory</h1>
            <p className="tx-text-neutral-medium">
              Risk modeling and Smart Match configuration workspace
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="tx-badge tx-badge-premium">Lab Environment</div>
            <div className="tx-badge tx-badge-success">Active</div>
          </div>
        </div>

        {/* Configuration Tips with Enhanced Design */}
        {configurationTips.length > 0 && (
          <div className="tx-card tx-card-success p-4 mb-6">
            <h3 className="text-sm font-semibold tx-text-success mb-2">💡 Configuration Tips</h3>
            <ul className="space-y-1">
              {configurationTips.map((tip, index) => (
                <li key={index} className="text-sm tx-text-neutral-dark flex items-start">
                  <span className="tx-text-success mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Metrics Display with Psychology Colors */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(getRiskMetrics()).map(([key, value]) => (
            <div key={key} className="tx-card tx-card-trust text-center">
              <div className="text-2xl font-bold tx-text-trust mb-1">{value}</div>
              <div className="text-sm tx-text-neutral-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation with Enhanced Design */}
      <TabNavigation />

      {/* Content Area */}
      <div className="space-y-6">
        {activeLabTab === 'general' && (
          <div className="tx-card">
            <div className="mb-6">
              <h2 className="text-xl font-semibold tx-text-trust mb-4">Loan Type Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['general', 'equipment', 'realestate'] as LoanType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => handleLoanTypeChange(type)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      loanType === type ? 'tx-btn-primary' : 'tx-btn-secondary'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-2">
                        {type === 'general' && '🏢 General Business'}
                        {type === 'equipment' && '🏭 Equipment Financing'}
                        {type === 'realestate' && '🏠 Real Estate'}
                      </div>
                      <div className="text-sm opacity-80">
                        {type === 'general' && 'Standard business loans and credit'}
                        {type === 'equipment' && 'Machinery and equipment financing'}
                        {type === 'realestate' && 'Commercial real estate loans'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons with Transaction Psychology */}
            <div className="flex flex-wrap gap-4">
              <button onClick={handleCreateNewInstrument} className="tx-btn-primary">
                <span className="mr-2">✨</span>
                Create New Instrument
              </button>
              <button onClick={handleGenerateReport} className="tx-btn-action">
                <span className="mr-2">📊</span>
                Generate Risk Report
              </button>
              <button
                onClick={() => {
                  // Add reset functionality
                  setEditingInstrument(null);
                  setShowCreateForm(false);
                }}
                className="tx-btn-secondary"
              >
                <span className="mr-2">🔄</span>
                Reset Configuration
              </button>
            </div>
          </div>
        )}

        {activeLabTab === 'instrument' && (
          <div className="tx-card">
            <SmartMatchInstrumentConfiguratorMVP2025
              editingInstrument={editingInstrument}
              onSaveSuccess={() => {
                setEditingInstrument(null);
                setShowCreateForm(false);
                // Add success notification
              }}
            />
          </div>
        )}
      </div>

      {/* Enhanced Paywall Modal with better information */}
      {showPaywall && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md eva-card">
            <div className="mt-3 text-center">
              <span className="text-6xl">🔒</span>
              <h3 className="text-lg font-medium eva-text-primary mt-4">Premium Feature</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm eva-text-secondary">
                  Advanced risk configuration features require a premium subscription. Upgrade to
                  unlock advanced compliance tracking, custom risk models, and enhanced analytics.
                </p>
              </div>
              <div className="items-center px-4 py-3 flex justify-center space-x-4">
                <button
                  onClick={() => setShowPaywall(false)}
                  className="eva-button-secondary px-4 py-2 rounded"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    setShowPaywall(false);
                    // In a real app, navigate to upgrade page
                    debugLog('general', 'log_statement', 'Navigate to upgrade page')
                  }}
                  className="eva-button-primary px-4 py-2 rounded"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskLab;
