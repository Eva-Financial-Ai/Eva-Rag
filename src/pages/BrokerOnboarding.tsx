import React, { useState } from 'react';
import { useUserType } from '../contexts/UserTypeContext';
import TopNavigation from '../components/layout/TopNavigation';
import {
  UserGroupIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  BanknotesIcon,
  ChartBarIcon,
  CpuChipIcon,
  IdentificationIcon,
  GlobeAltIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  required: boolean;
}

interface BrokerProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    linkedIn: string;
  };
  businessInfo: {
    brokerageName: string;
    businessType: 'individual' | 'partnership' | 'corporation' | 'llc';
    licenseNumber: string;
    yearsOfExperience: number;
    specializations: string[];
    businessAddress: {
      address: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  credentials: {
    licenses: string[];
    certifications: string[];
    education: string[];
    professionalAssociations: string[];
  };
  commissionStructure: {
    preferredStructure: 'flat-fee' | 'percentage' | 'hybrid';
    commissionRate: number;
    minimumDeal: number;
    paymentTerms: string;
  };
  clientBase: {
    targetClientTypes: string[];
    dealSizeRange: {
      min: number;
      max: number;
    };
    geographicFocus: string[];
    industryFocus: string[];
  };
  references: {
    professionalReferences: Array<{
      name: string;
      company: string;
      phone: string;
      email: string;
      relationship: string;
    }>;
    clientTestimonials: Array<{
      clientName: string;
      dealSize: number;
      testimonial: string;
      date: string;
    }>;
  };
}

const BrokerOnboarding: React.FC = () => {
  const { userType } = useUserType();
  const [currentStep, setCurrentStep] = useState(0);
  const [brokerProfile, setBrokerProfile] = useState<BrokerProfile>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      linkedIn: '',
    },
    businessInfo: {
      brokerageName: '',
      businessType: 'individual',
      licenseNumber: '',
      yearsOfExperience: 0,
      specializations: [],
      businessAddress: {
        address: '',
        city: '',
        state: '',
        zipCode: '',
      },
    },
    credentials: {
      licenses: [],
      certifications: [],
      education: [],
      professionalAssociations: [],
    },
    commissionStructure: {
      preferredStructure: 'percentage',
      commissionRate: 0,
      minimumDeal: 0,
      paymentTerms: '',
    },
    clientBase: {
      targetClientTypes: [],
      dealSizeRange: { min: 0, max: 0 },
      geographicFocus: [],
      industryFocus: [],
    },
    references: {
      professionalReferences: [],
      clientTestimonials: [],
    },
  });

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to EVA Broker Network',
      description: 'Get started with your broker registration',
      completed: false,
      current: true,
      required: true,
    },
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Provide your contact details and professional info',
      completed: false,
      current: false,
      required: true,
    },
    {
      id: 'business-credentials',
      title: 'Business & Credentials',
      description: 'Set up business information and credentials',
      completed: false,
      current: false,
      required: true,
    },
    {
      id: 'commission-structure',
      title: 'Commission Structure',
      description: 'Configure your commission preferences',
      completed: false,
      current: false,
      required: true,
    },
    {
      id: 'client-profile',
      title: 'Client Profile',
      description: 'Define your target client base and specializations',
      completed: false,
      current: false,
      required: true,
    },
    {
      id: 'references',
      title: 'References & Portfolio',
      description: 'Provide references and showcase your experience',
      completed: false,
      current: false,
      required: false,
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

  const specializations = [
    'Equipment Financing',
    'Working Capital',
    'Commercial Real Estate',
    'Asset-Based Lending',
    'SBA Loans',
    'Trade Finance',
    'Invoice Factoring',
    'Merchant Cash Advances',
    'Construction Loans',
    'Healthcare Financing',
  ];

  const businessTypes = [
    { id: 'individual', name: 'Individual Broker' },
    { id: 'partnership', name: 'Partnership' },
    { id: 'corporation', name: 'Corporation' },
    { id: 'llc', name: 'Limited Liability Company (LLC)' },
  ];

  const handleStepComplete = (stepId: string) => {
    setCurrentStep(prev => Math.min(prev + 1, onboardingSteps.length - 1));
  };

  const handleInputChange = (field: string, value: any) => {
    const keys = field.split('.');
    setBrokerProfile(prev => {
      const updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return updated;
    });
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
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to EVA Broker Network</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Join our exclusive network of financial brokers and gain access to a curated 
          marketplace of lenders, borrowers, and deal opportunities with competitive commission structures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 bg-blue-50 rounded-lg">
          <UsersIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Exclusive Deal Flow</h3>
          <p className="text-sm text-gray-600">Access to premium deals from verified lenders and borrowers</p>
        </div>
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <BanknotesIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Competitive Commissions</h3>
          <p className="text-sm text-gray-600">Flexible commission structures and fast payment processing</p>
        </div>
        <div className="text-center p-6 bg-purple-50 rounded-lg">
          <ChartBarIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Analytics</h3>
          <p className="text-sm text-gray-600">Real-time tracking and analytics to optimize your business</p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <div className="flex items-start">
          <IdentificationIcon className="w-6 h-6 text-green-600 mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-green-900 mb-2">Broker Benefits</h3>
            <ul className="space-y-1 text-green-800 text-sm">
              <li>• Access to exclusive lender network with competitive rates</li>
              <li>• AI-powered matching to optimize deal success rates</li>
              <li>• Streamlined application and approval processes</li>
              <li>• Professional development and certification opportunities</li>
              <li>• Marketing support and lead generation tools</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={() => handleStepComplete('welcome')}
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Broker Registration
        </button>
      </div>
    </div>
  );

  const renderPersonalInfoStep = () => (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={brokerProfile.personalInfo.firstName}
                onChange={(e) => handleInputChange('personalInfo.firstName', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="John"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={brokerProfile.personalInfo.lastName}
                onChange={(e) => handleInputChange('personalInfo.lastName', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Smith"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={brokerProfile.personalInfo.email}
                onChange={(e) => handleInputChange('personalInfo.email', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="john@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={brokerProfile.personalInfo.phone}
                onChange={(e) => handleInputChange('personalInfo.phone', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="(555) 123-4567"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Profile
              </label>
              <input
                type="url"
                value={brokerProfile.personalInfo.linkedIn}
                onChange={(e) => handleInputChange('personalInfo.linkedIn', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Specializations</h3>
          <p className="text-sm text-gray-600 mb-4">Select your areas of expertise (choose all that apply)</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {specializations.map(spec => (
              <label key={spec} className="flex items-center">
                <input
                  type="checkbox"
                  checked={brokerProfile.businessInfo.specializations.includes(spec)}
                  onChange={(e) => {
                    const current = brokerProfile.businessInfo.specializations;
                    const updated = e.target.checked 
                      ? [...current, spec]
                      : current.filter(s => s !== spec);
                    handleInputChange('businessInfo.specializations', updated);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{spec}</span>
              </label>
            ))}
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
            onClick={() => handleStepComplete('personal-info')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={!brokerProfile.personalInfo.firstName || !brokerProfile.personalInfo.lastName || !brokerProfile.personalInfo.email}
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
        return renderPersonalInfoStep();
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
      <TopNavigation title="Broker Onboarding" />
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Broker Onboarding</h1>
            <p className="text-gray-600">Join the EVA broker network and access exclusive deal opportunities</p>
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

export default BrokerOnboarding; 