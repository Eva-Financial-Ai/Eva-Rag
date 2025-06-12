/**
 * Instrument Details Page
 * Displays comprehensive information about a lending instrument
 * - For Lenders: Shows their instrument details and broker applications
 * - For Brokers: Shows instrument requirements and application status
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { useUserPermissions } from '../hooks/useUserPermissions';
import { InstrumentType, CollateralType, RiskToleranceLevel } from '../types/SmartMatchingTypes';
import {
  CogIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface InstrumentDetails {
  id: string;
  lenderName: string;
  lenderType: string;
  instrumentName: string;
  instrumentType: InstrumentType;
  isActive: boolean;
  description: string;
  minimumCreditScore: number;
  requiredDocuments: string[];
  processingTime: string;
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
    contactPerson: string;
    address: string;
  };
  dealKillers: {
    bankruptcyLookback: number;
    minimumTimeInBusiness: number;
    minimumAnnualRevenue: number;
    maximumDebtServiceRatio: number;
    allowedCollateralTypes: CollateralType[];
    geographicRestrictions: string[];
    excludedIndustries: string[];
  };
  creditScores: {
    minimumScore: number;
    scoringModel: string;
    personalGuarantorRequired: boolean;
    acceptableScoringSources: string[];
  };
  secondStage: {
    minimumTransactionAmount: number;
    maximumTransactionAmount: number;
    minimumTermMonths: number;
    maximumTermMonths: number;
    interestRateRange: { min: number; max: number };
    riskTolerance: RiskToleranceLevel;
  };
  preferences: {
    preferredIndustries: string[];
    preferredAssetTypes: string[];
    preferredDealSize: { min: number; max: number };
    preferredTermLength: { min: number; max: number };
  };
  brokerRequirements: {
    minimumVolume?: number;
    yearsInBusiness?: number;
    requiredLicenses: string[];
    applicationProcess: string[];
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    applicationSubmitted?: boolean;
    submissionDate?: string;
    nextSteps?: string[];
  };
  performance: {
    totalMatches: number;
    successfulMatches: number;
    averageMatchScore: number;
    averageProcessingTime: string;
    brokerApplications: number;
    approvedBrokers: number;
  };
}

// Mock data
const mockInstrumentDetails: InstrumentDetails = {
  id: 'LEND-001',
  lenderName: 'Capital Equipment Finance',
  lenderType: 'Specialty Finance Company',
  instrumentName: 'Commercial Equipment Financing',
  instrumentType: InstrumentType.EQUIPMENT,
  isActive: true,
  description:
    'Comprehensive equipment financing solutions for businesses with proven cash flow and solid credit history. We specialize in heavy equipment, manufacturing machinery, and technology equipment with competitive rates and flexible terms.',
  minimumCreditScore: 650,
  requiredDocuments: [
    'Business Financial Statements (Last 2 years)',
    'Personal Financial Statements (All guarantors)',
    'Tax Returns (Business & Personal - 2 years)',
    'Bank Statements (Last 6 months)',
    'Equipment Quote/Invoice',
    'Articles of Incorporation',
    'Current Accounts Receivable/Payable Aging',
    'Business License',
    'Insurance Information',
  ],
  processingTime: '5-7 business days',
  contactInfo: {
    email: 'applications@capitalequipment.com',
    phone: '(555) 123-4567',
    website: 'https://capitalequipment.com',
    contactPerson: 'Sarah Johnson, Senior Lending Manager',
    address: '123 Finance Plaza, Suite 500, Los Angeles, CA 90210',
  },
  dealKillers: {
    bankruptcyLookback: 36,
    minimumTimeInBusiness: 24,
    minimumAnnualRevenue: 500000,
    maximumDebtServiceRatio: 1.25,
    allowedCollateralTypes: [CollateralType.EQUIPMENT],
    geographicRestrictions: ['CA', 'NY', 'TX', 'FL'],
    excludedIndustries: ['722', '713'],
  },
  creditScores: {
    minimumScore: 650,
    scoringModel: 'FICO',
    personalGuarantorRequired: true,
    acceptableScoringSources: ['Equifax', 'Experian', 'TransUnion'],
  },
  secondStage: {
    minimumTransactionAmount: 100000,
    maximumTransactionAmount: 2000000,
    minimumTermMonths: 24,
    maximumTermMonths: 84,
    interestRateRange: { min: 5.5, max: 12.5 },
    riskTolerance: RiskToleranceLevel.MODERATE,
  },
  preferences: {
    preferredIndustries: [
      '237 - Heavy Construction',
      '238 - Specialty Trade',
      '336 - Transportation Equipment',
    ],
    preferredAssetTypes: ['Heavy Equipment', 'Manufacturing Equipment', 'Construction Equipment'],
    preferredDealSize: { min: 250000, max: 1000000 },
    preferredTermLength: { min: 36, max: 60 },
  },
  brokerRequirements: {
    minimumVolume: 2000000,
    yearsInBusiness: 3,
    requiredLicenses: ['NMLS'],
    applicationProcess: [
      'Submit broker application form with business documentation',
      'Provide minimum 3 business references',
      'Complete compliance and background check',
      'Sign broker agreement and commission structure',
      'Complete product training and certification',
    ],
    approvalStatus: 'approved',
    applicationSubmitted: true,
    submissionDate: '2024-01-15',
    nextSteps: [
      'Access partner portal for deal submissions',
      'Review updated rate sheets quarterly',
      'Maintain minimum volume requirements',
    ],
  },
  performance: {
    totalMatches: 45,
    successfulMatches: 38,
    averageMatchScore: 87.5,
    averageProcessingTime: '6.2 days',
    brokerApplications: 12,
    approvedBrokers: 8,
  },
};

const InstrumentDetails: React.FC = () => {
  const { instrumentId } = useParams<{ instrumentId: string }>();
  const { getBaseUserType, currentRole } = useUserPermissions();
  const [userType, setUserType] = useState<'lender' | 'broker'>('lender');
  const [instrumentDetails, setInstrumentDetails] = useState<InstrumentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'requirements' | 'broker' | 'performance'
  >('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const baseType = getBaseUserType(currentRole);
    setUserType(baseType as 'lender' | 'broker');
    loadInstrumentDetails();
  }, [currentRole, instrumentId, getBaseUserType]);

  const loadInstrumentDetails = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const details = await instrumentService.getInstrumentDetails(instrumentId);
      setInstrumentDetails(mockInstrumentDetails);
    } catch (error) {
      console.error('Failed to load instrument details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    navigate(`/instrument-application/${instrumentId}`);
  };

  const handleEdit = () => {
    navigate(`/customer-retention/smart-matching/edit/${instrumentId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <PageLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  if (!instrumentDetails) {
    return (
      <PageLayout title="Instrument Not Found">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Instrument not found</h3>
          <p className="mt-2 text-gray-500">The requested instrument could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={instrumentDetails.instrumentName}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {instrumentDetails.instrumentName}
                  </h1>
                  <p className="mt-2 text-lg text-gray-600">{instrumentDetails.lenderName}</p>
                  <p className="text-sm text-gray-500">{instrumentDetails.lenderType}</p>
                </div>
                <div className="flex items-center space-x-4">
                  {userType === 'broker' &&
                    instrumentDetails.brokerRequirements.approvalStatus &&
                    getStatusBadge(instrumentDetails.brokerRequirements.approvalStatus)}
                  {userType === 'lender' ? (
                    <button
                      onClick={handleEdit}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <CogIcon className="w-4 h-4 mr-2" />
                      Edit Instrument
                    </button>
                  ) : !instrumentDetails.brokerRequirements.applicationSubmitted ? (
                    <button
                      onClick={handleApply}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      <DocumentTextIcon className="w-4 h-4 mr-2" />
                      Apply Now
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <CurrencyDollarIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Loan Range</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(instrumentDetails.secondStage.minimumTransactionAmount)} -
                {formatCurrency(instrumentDetails.secondStage.maximumTransactionAmount)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <ChartBarIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Rate Range</p>
              <p className="text-lg font-semibold text-gray-900">
                {instrumentDetails.secondStage.interestRateRange.min}% -{' '}
                {instrumentDetails.secondStage.interestRateRange.max}%
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <CalendarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Processing Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {instrumentDetails.processingTime}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <UserGroupIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Success Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {Math.round(
                  (instrumentDetails.performance.successfulMatches /
                    instrumentDetails.performance.totalMatches) *
                    100
                )}
                %
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'requirements', 'broker', 'performance'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'requirements' && 'Requirements'}
                {tab === 'broker' && 'Broker Info'}
                {tab === 'performance' && 'Performance'}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700">{instrumentDetails.description}</p>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Instrument Type:</span>
                    <span className="font-medium">{instrumentDetails.instrumentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Minimum Credit Score:</span>
                    <span className="font-medium">{instrumentDetails.minimumCreditScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Term Range:</span>
                    <span className="font-medium">
                      {instrumentDetails.secondStage.minimumTermMonths} -{' '}
                      {instrumentDetails.secondStage.maximumTermMonths} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Tolerance:</span>
                    <span className="font-medium">
                      {instrumentDetails.secondStage.riskTolerance}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {instrumentDetails.contactInfo.contactPerson}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <a
                      href={`mailto:${instrumentDetails.contactInfo.email}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {instrumentDetails.contactInfo.email}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <a
                      href={`tel:${instrumentDetails.contactInfo.phone}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {instrumentDetails.contactInfo.phone}
                    </a>
                  </div>
                  {instrumentDetails.contactInfo.website && (
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <a
                        href={instrumentDetails.contactInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {instrumentDetails.contactInfo.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <span className="text-gray-900">{instrumentDetails.contactInfo.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="space-y-8">
            {/* Required Documents */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instrumentDetails.requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-gray-900">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deal Killers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                Deal Killers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bankruptcy Lookback:</span>
                    <span className="font-medium">
                      {instrumentDetails.dealKillers.bankruptcyLookback} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min Time in Business:</span>
                    <span className="font-medium">
                      {instrumentDetails.dealKillers.minimumTimeInBusiness} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min Annual Revenue:</span>
                    <span className="font-medium">
                      {formatCurrency(instrumentDetails.dealKillers.minimumAnnualRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Debt Service Ratio:</span>
                    <span className="font-medium">
                      {instrumentDetails.dealKillers.maximumDebtServiceRatio}x
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 block mb-2">Geographic Restrictions:</span>
                    <div className="flex flex-wrap gap-1">
                      {instrumentDetails.dealKillers.geographicRestrictions.map((state, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {state}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-2">Excluded Industries:</span>
                    <div className="flex flex-wrap gap-1">
                      {instrumentDetails.dealKillers.excludedIndustries.map((industry, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Preferred Industries</h4>
                  <div className="space-y-1">
                    {instrumentDetails.preferences.preferredIndustries.map((industry, index) => (
                      <div key={index} className="text-sm text-gray-700">
                        • {industry}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Preferred Asset Types</h4>
                  <div className="space-y-1">
                    {instrumentDetails.preferences.preferredAssetTypes.map((asset, index) => (
                      <div key={index} className="text-sm text-gray-700">
                        • {asset}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'broker' && (
          <div className="space-y-8">
            {/* Broker Requirements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Broker Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {instrumentDetails.brokerRequirements.minimumVolume && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Minimum Annual Volume:</span>
                      <span className="font-medium">
                        {formatCurrency(instrumentDetails.brokerRequirements.minimumVolume)}
                      </span>
                    </div>
                  )}
                  {instrumentDetails.brokerRequirements.yearsInBusiness && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Years in Business:</span>
                      <span className="font-medium">
                        {instrumentDetails.brokerRequirements.yearsInBusiness} years minimum
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 block mb-2">Required Licenses:</span>
                    <div className="flex flex-wrap gap-1">
                      {instrumentDetails.brokerRequirements.requiredLicenses.map(
                        (license, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
                          >
                            {license}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  {userType === 'broker' && instrumentDetails.brokerRequirements.approvalStatus && (
                    <div className="mb-4">
                      <span className="text-gray-600 block mb-2">Application Status:</span>
                      {getStatusBadge(instrumentDetails.brokerRequirements.approvalStatus)}
                      {instrumentDetails.brokerRequirements.submissionDate && (
                        <p className="text-sm text-gray-500 mt-1">
                          Submitted:{' '}
                          {new Date(
                            instrumentDetails.brokerRequirements.submissionDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Application Process */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Application Process</h3>
              <div className="space-y-3">
                {instrumentDetails.brokerRequirements.applicationProcess.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-900">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps (for approved brokers) */}
            {userType === 'broker' &&
              instrumentDetails.brokerRequirements.approvalStatus === 'approved' &&
              instrumentDetails.brokerRequirements.nextSteps && (
                <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                  <h3 className="text-lg font-medium text-green-900 mb-4">Next Steps</h3>
                  <div className="space-y-2">
                    {instrumentDetails.brokerRequirements.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-green-800">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-8">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <ChartBarIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Total Matches</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {instrumentDetails.performance.totalMatches}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Successful Matches</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {instrumentDetails.performance.successfulMatches}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <ClockIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Avg Processing Time</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {instrumentDetails.performance.averageProcessingTime}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <UserGroupIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Approved Brokers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {instrumentDetails.performance.approvedBrokers}
                </p>
              </div>
            </div>

            {/* Performance Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Details</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-medium">
                      {Math.round(
                        (instrumentDetails.performance.successfulMatches /
                          instrumentDetails.performance.totalMatches) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.round((instrumentDetails.performance.successfulMatches / instrumentDetails.performance.totalMatches) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Broker Approval Rate</span>
                    <span className="font-medium">
                      {Math.round(
                        (instrumentDetails.performance.approvedBrokers /
                          instrumentDetails.performance.brokerApplications) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.round((instrumentDetails.performance.approvedBrokers / instrumentDetails.performance.brokerApplications) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default InstrumentDetails;
