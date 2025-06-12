import React, { useState } from 'react';
import { useUserType } from '../contexts/UserTypeContext';
import TopNavigation from '../components/layout/TopNavigation';
import {
  BuildingStorefrontIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  BanknotesIcon,
  ScaleIcon,
  UserGroupIcon,
  CpuChipIcon,
  IdentificationIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  required: boolean;
}

interface LenderProfile {
  companyName: string;
  lenderType: string;
  businessStructure: string;
  federalTaxId: string;
  registrationNumber: string;
  establishedYear: number;
  headquarters: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    primaryContact: string;
    email: string;
    phone: string;
    website: string;
  };
  financialCapacity: {
    totalAssets: number;
    availableFunds: number;
    minimumDealSize: number;
    maximumDealSize: number;
    preferredSectors: string[];
  };
  compliance: {
    licenses: string[];
    regulations: string[];
    certifications: string[];
  };
  preferences: {
    geographicFocus: string[];
    industryPreferences: string[];
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    decisionTimeline: string;
  };
}

const LenderOnboarding: React.FC = () => {
  const { userType } = useUserType();
  const [currentStep, setCurrentStep] = useState(0);
  const [lenderProfile, setLenderProfile] = useState<LenderProfile>({
    companyName: '',
    lenderType: '',
    businessStructure: '',
    federalTaxId: '',
    registrationNumber: '',
    establishedYear: 0,
    headquarters: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
    contact: {
      primaryContact: '',
      email: '',
      phone: '',
      website: '',
    },
    financialCapacity: {
      totalAssets: 0,
      availableFunds: 0,
      minimumDealSize: 0,
      maximumDealSize: 0,
      preferredSectors: [],
    },
    compliance: {
      licenses: [],
      regulations: [],
      certifications: [],
    },
    preferences: {
      geographicFocus: [],
      industryPreferences: [],
      riskTolerance: 'moderate',
      decisionTimeline: '',
    },
  });

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to EVA Lender Network',
      description: 'Get started with your lender registration',
      completed: false,
      current: true,
      required: true,
    },
    {
      id: 'company-info',
      title: 'Company Information',
      description: 'Provide your organization details and structure',
      completed: false,
      current: false,
      required: true,
    },
    {
      id: 'financial-capacity',
      title: 'Financial Capacity',
      description: 'Define your lending capacity and parameters',
      completed: false,
      current: false,
      required: true,
    },
    {
      id: 'compliance-licensing',
      title: 'Compliance & Licensing',
      description: 'Submit regulatory compliance documentation',
      completed: false,
      current: false,
      required: true,
    },
    {
      id: 'preferences',
      title: 'Lending Preferences',
      description: 'Set your lending criteria and preferences',
      completed: false,
      current: false,
      required: true,
    },
    {
      id: 'integration',
      title: 'Platform Integration',
      description: 'Connect your systems and configure settings',
      completed: false,
      current: false,
      required: true,
    },
    {
      id: 'verification',
      title: 'Verification & Approval',
      description: 'Complete verification and platform approval',
      completed: false,
      current: false,
      required: true,
    },
  ];

  const lenderTypes = [
    { id: 'traditional-bank', name: 'Traditional Bank', icon: BuildingStorefrontIcon },
    { id: 'credit-union', name: 'Credit Union', icon: UserGroupIcon },
    { id: 'alternative-lender', name: 'Alternative Lender', icon: CpuChipIcon },
    { id: 'asset-based-lender', name: 'Asset-Based Lender', icon: ScaleIcon },
    { id: 'equipment-finance', name: 'Equipment Finance Company', icon: CpuChipIcon },
    { id: 'private-fund', name: 'Private Investment Fund', icon: BanknotesIcon },
  ];

  const businessStructures = [
    'Corporation (C-Corp)',
    'S Corporation',
    'Limited Liability Company (LLC)',
    'Limited Partnership (LP)',
    'General Partnership',
    'Sole Proprietorship',
    'Non-Profit Organization',
  ];

  const handleStepComplete = (stepId: string) => {
    setCurrentStep(prev => Math.min(prev + 1, onboardingSteps.length - 1));
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [section, subfield] = field.split('.');
      setLenderProfile(prev => {
        const sectionData = prev[section as keyof LenderProfile];
        if (typeof sectionData === 'object' && sectionData !== null) {
          return {
            ...prev,
            [section]: {
              ...sectionData,
              [subfield]: value,
            },
          };
        }
        return prev;
      });
    } else {
      setLenderProfile(prev => ({
        ...prev,
        [field]: value,
      }));
    }
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
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to EVA Lender Network</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Join our growing network of lenders and access qualified borrowers, streamlined 
          processes, and advanced AI-powered risk assessment tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 bg-blue-50 rounded-lg">
          <UserGroupIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Quality Deal Flow</h3>
          <p className="text-sm text-gray-600">Access pre-screened, qualified borrowers and deal opportunities</p>
        </div>
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <CpuChipIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI-Powered Analytics</h3>
          <p className="text-sm text-gray-600">Advanced risk assessment and decision support tools</p>
        </div>
        <div className="text-center p-6 bg-purple-50 rounded-lg">
          <ShieldCheckIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Management</h3>
          <p className="text-sm text-gray-600">Automated compliance monitoring and reporting</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-start">
          <IdentificationIcon className="w-6 h-6 text-blue-600 mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">What You'll Need</h3>
            <ul className="space-y-1 text-blue-800 text-sm">
              <li>• Company registration and tax identification documents</li>
              <li>• Current financial statements and proof of funds</li>
              <li>• Lending licenses and regulatory compliance certificates</li>
              <li>• Contact information for primary decision makers</li>
              <li>• Lending criteria and risk tolerance parameters</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={() => handleStepComplete('welcome')}
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Lender Registration
        </button>
      </div>
    </div>
  );

  const renderCompanyInfoStep = () => (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Information</h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lender Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lenderTypes.map(type => (
              <div 
                key={type.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  lenderProfile.lenderType === type.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('lenderType', type.id)}
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
              Company Name *
            </label>
            <input
              type="text"
              value={lenderProfile.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter company name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Structure *
            </label>
            <select
              value={lenderProfile.businessStructure}
              onChange={(e) => handleInputChange('businessStructure', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select business structure</option>
              {businessStructures.map(structure => (
                <option key={structure} value={structure}>{structure}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Federal Tax ID *
            </label>
            <input
              type="text"
              value={lenderProfile.federalTaxId}
              onChange={(e) => handleInputChange('federalTaxId', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="XX-XXXXXXX"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Number
            </label>
            <input
              type="text"
              value={lenderProfile.registrationNumber}
              onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="State registration number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Established *
            </label>
            <input
              type="number"
              value={lenderProfile.establishedYear || ''}
              onChange={(e) => handleInputChange('establishedYear', Number(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="2020"
              min="1800"
              max="2024"
              required
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Headquarters Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={lenderProfile.headquarters.address}
                onChange={(e) => handleInputChange('headquarters.address', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="123 Main Street"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={lenderProfile.headquarters.city}
                onChange={(e) => handleInputChange('headquarters.city', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="New York"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                value={lenderProfile.headquarters.state}
                onChange={(e) => handleInputChange('headquarters.state', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="NY"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                value={lenderProfile.contact.primaryContact}
                onChange={(e) => handleInputChange('contact.primaryContact', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="John Smith"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={lenderProfile.contact.email}
                onChange={(e) => handleInputChange('contact.email', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="john@company.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                value={lenderProfile.contact.phone}
                onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="(555) 123-4567"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={lenderProfile.contact.website}
                onChange={(e) => handleInputChange('contact.website', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://www.company.com"
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
            onClick={() => handleStepComplete('company-info')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={!lenderProfile.companyName || !lenderProfile.lenderType}
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
        return renderCompanyInfoStep();
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
      <TopNavigation title="Lender Onboarding" />
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lender Onboarding</h1>
            <p className="text-gray-600">Join the EVA lending network and access qualified borrowers</p>
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

export default LenderOnboarding; 