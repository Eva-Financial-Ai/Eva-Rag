import React, { useState } from 'react';
import { useUserType } from '../contexts/UserTypeContext';
import TopNavigation from '../components/layout/TopNavigation';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  BanknotesIcon,
  ScaleIcon,
  UserGroupIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  required: boolean;
}

interface InstrumentProfile {
  instrumentType: string;
  instrumentName: string;
  minimumAmount: number;
  maximumAmount: number;
  termRange: {
    min: number;
    max: number;
  };
  interestRateRange: {
    min: number;
    max: number;
  };
  collateralRequirements: string[];
  targetMarket: string[];
  compliance: {
    regulations: string[];
    jurisdictions: string[];
  };
  riskProfile: 'low' | 'medium' | 'high';
  liquidityFeatures: string[];
}

const InstrumentOnboarding: React.FC = () => {
  const { userType } = useUserType();
  const [currentStep, setCurrentStep] = useState(0);
  const [instrumentProfile, setInstrumentProfile] = useState<InstrumentProfile>({
    instrumentType: '',
    instrumentName: '',
    minimumAmount: 0,
    maximumAmount: 0,
    termRange: { min: 0, max: 0 },
    interestRateRange: { min: 0, max: 0 },
    collateralRequirements: [],
    targetMarket: [],
    compliance: {
      regulations: [],
      jurisdictions: []
    },
    riskProfile: 'medium',
    liquidityFeatures: []
  });

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Instrument Registration',
      description: 'Get started with setting up your financial instrument',
      completed: false,
      current: true,
      required: true,
    },
    {
      id: 'instrument-details',
      title: 'Instrument Details',
      description: 'Define your instrument type, terms, and basic parameters',
      completed: false,
      current: false,
      required: true,
    },
    {
      id: 'risk-compliance',
      title: 'Risk & Compliance',
      description: 'Set risk parameters and compliance requirements',
      completed: false,
      current: false,
      required: true,
    },
    {
      id: 'market-config',
      title: 'Market Configuration',
      description: 'Configure target markets and distribution channels',
      completed: false,
      current: false,
      required: true,
    },
    {
      id: 'verification',
      title: 'Verification & Approval',
      description: 'Submit for regulatory review and platform approval',
      completed: false,
      current: false,
      required: true,
    },
    {
      id: 'launch',
      title: 'Launch Instrument',
      description: 'Activate your instrument for trading and distribution',
      completed: false,
      current: false,
      required: true,
    },
  ];

  const instrumentTypes = [
    { id: 'equipment-finance', name: 'Equipment Financing', icon: CpuChipIcon },
    { id: 'working-capital', name: 'Working Capital', icon: BanknotesIcon },
    { id: 'commercial-real-estate', name: 'Commercial Real Estate', icon: ScaleIcon },
    { id: 'asset-based-lending', name: 'Asset-Based Lending', icon: ShieldCheckIcon },
    { id: 'trade-finance', name: 'Trade Finance', icon: CurrencyDollarIcon },
    { id: 'structured-product', name: 'Structured Product', icon: DocumentTextIcon },
  ];

  const handleStepComplete = (stepId: string) => {
    setCurrentStep(prev => Math.min(prev + 1, onboardingSteps.length - 1));
  };

  const handleInputChange = (field: string, value: any) => {
    setInstrumentProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {onboardingSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              index < currentStep 
                ? 'bg-green-500 border-green-500' 
                : index === currentStep 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'bg-gray-200 border-gray-300'
            }`}>
              {index < currentStep ? (
                <CheckCircleIcon className="w-6 h-6 text-white" />
              ) : (
                <span className={`text-sm font-medium ${
                  index === currentStep ? 'text-white' : 'text-gray-500'
                }`}>
                  {index + 1}
                </span>
              )}
            </div>
            <div className="ml-3 text-sm min-w-0">
              <p className={`font-medium ${
                index === currentStep ? 'text-blue-600' : 
                index < currentStep ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
              <p className="text-gray-500 text-xs">{step.description}</p>
            </div>
            {index < onboardingSteps.length - 1 && (
              <ArrowRightIcon className="w-5 h-5 text-gray-400 mx-4 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderWelcomeStep = () => (
    <div className="bg-white rounded-lg shadow p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Instrument Onboarding</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Set up your financial instrument on the EVA platform with our guided onboarding process. 
          We'll help you configure everything from basic parameters to compliance requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 bg-blue-50 rounded-lg">
          <DocumentTextIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Smart Documentation</h3>
          <p className="text-sm text-gray-600">Automated document generation and compliance checking</p>
        </div>
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <ShieldCheckIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Regulatory Compliance</h3>
          <p className="text-sm text-gray-600">Built-in compliance frameworks and monitoring</p>
        </div>
        <div className="text-center p-6 bg-purple-50 rounded-lg">
          <UserGroupIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Market Access</h3>
          <p className="text-sm text-gray-600">Instant access to borrowers, brokers, and investors</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-yellow-900 mb-2">Before You Begin</h3>
            <ul className="space-y-1 text-yellow-800 text-sm">
              <li>• Ensure you have necessary regulatory approvals</li>
              <li>• Prepare instrument documentation and legal frameworks</li>
              <li>• Review risk management and compliance requirements</li>
              <li>• Have your target market and distribution strategy ready</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={() => handleStepComplete('welcome')}
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Instrument Setup
        </button>
      </div>
    </div>
  );

  const renderInstrumentDetailsStep = () => (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Instrument Details</h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Instrument Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {instrumentTypes.map(type => (
              <div 
                key={type.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  instrumentProfile.instrumentType === type.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('instrumentType', type.id)}
              >
                <type.icon className="w-8 h-8 text-gray-600 mb-2" />
                <h4 className="font-medium text-gray-900">{type.name}</h4>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instrument Name
            </label>
            <input
              type="text"
              value={instrumentProfile.instrumentName}
              onChange={(e) => handleInputChange('instrumentName', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter instrument name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Profile
            </label>
            <select
              value={instrumentProfile.riskProfile}
              onChange={(e) => handleInputChange('riskProfile', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Amount ($)
            </label>
            <input
              type="number"
              value={instrumentProfile.minimumAmount}
              onChange={(e) => handleInputChange('minimumAmount', Number(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="50000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Amount ($)
            </label>
            <input
              type="number"
              value={instrumentProfile.maximumAmount}
              onChange={(e) => handleInputChange('maximumAmount', Number(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="5000000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Term Range (Months)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={instrumentProfile.termRange.min}
                onChange={(e) => handleInputChange('termRange', { 
                  ...instrumentProfile.termRange, 
                  min: Number(e.target.value) 
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="12"
              />
              <input
                type="number"
                value={instrumentProfile.termRange.max}
                onChange={(e) => handleInputChange('termRange', { 
                  ...instrumentProfile.termRange, 
                  max: Number(e.target.value) 
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="84"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interest Rate Range (%)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="0.01"
                value={instrumentProfile.interestRateRange.min}
                onChange={(e) => handleInputChange('interestRateRange', { 
                  ...instrumentProfile.interestRateRange, 
                  min: Number(e.target.value) 
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="5.00"
              />
              <input
                type="number"
                step="0.01"
                value={instrumentProfile.interestRateRange.max}
                onChange={(e) => handleInputChange('interestRateRange', { 
                  ...instrumentProfile.interestRateRange, 
                  max: Number(e.target.value) 
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="12.00"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button 
            onClick={() => setCurrentStep(0)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Previous
          </button>
          <button 
            onClick={() => handleStepComplete('instrument-details')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={!instrumentProfile.instrumentType || !instrumentProfile.instrumentName}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderInstrumentDetailsStep();
      default:
        return (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Step Under Development</h2>
            <p className="text-gray-600">This onboarding step is currently being developed.</p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <TopNavigation title="Instrument Onboarding" />
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Instrument Onboarding</h1>
            <p className="text-gray-600">Set up and configure your financial instrument on the EVA platform</p>
          </div>
          <div className="flex items-center">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              New
            </span>
          </div>
        </div>
      </div>

      {renderProgressBar()}
      {renderStepContent()}
    </div>
  );
};

export default InstrumentOnboarding; 