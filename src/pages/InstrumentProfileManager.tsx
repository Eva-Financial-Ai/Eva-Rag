/**
 * Instrument & Profile Management System
 * - Lenders: Create/Edit/Manage lending instruments and requirements
 * - Brokers: View available instruments and fill out required forms for approval
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { useUserPermissions } from '../hooks/useUserPermissions';
import {
  SmartMatchingInstrument,
  InstrumentType,
  CollateralType,
  RiskToleranceLevel,
  CustomerSmartMatchProfile,
} from '../types/SmartMatchingTypes';
import {
  PlusIcon,
  CogIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface LenderInstrument extends SmartMatchingInstrument {
  lenderName: string;
  lenderType: 'bank' | 'credit_union' | 'specialty_finance' | 'private_lender';
  minimumCreditScore: number;
  requiredDocuments: string[];
  applicationDeadline?: string;
  processingTime: string;
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
  };
  brokerRequirements: {
    minimumVolume?: number;
    yearsInBusiness?: number;
    requiredLicenses: string[];
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    applicationSubmitted?: boolean;
  };
  interestRateRange: { min: number; max: number };
  preferences: {
    preferredIndustries: string[];
    preferredAssetTypes: string[];
    preferredDealSize: { min: number; max: number };
    preferredTermLength: { min: number; max: number };
  };
}

// Mock data for development
const mockLenderInstruments: LenderInstrument[] = [
  {
    id: 'LEND-001',
    lenderName: 'Capital Equipment Finance',
    lenderType: 'specialty_finance',
    instrumentName: 'Commercial Equipment Financing',
    instrumentType: InstrumentType.EQUIPMENT,
    isActive: true,
    dealKillers: {
      financialInstrumentTypes: [InstrumentType.EQUIPMENT],
      collateralTypes: [CollateralType.EQUIPMENT],
      garagingLocationRequirement: [],
      minimumFleetRequirement: 1,
      geographicLendingCoverage: ['CA', 'NY', 'TX', 'FL'],
      restrictedAssetSellerTypes: [],
      restrictedIndustryCodes: ['722', '713'],
      minimumBusinessAge: 24,
      minimumBusinessRevenue: 500000,
      debtServiceCoverageRatio: 1.25,
      bankruptcyAcceptance: false,
    },
    secondStage: {
      equifaxMinScores: { 100000: 650 },
      experianMinScores: { 100000: 650 },
      transunionMinScores: { 100000: 650 },
      businessIntelscoreMin: { 100000: 600 },
      paynetMasterscoreMin: { 100000: 600 },
      equifaxOneScoreMin: { 100000: 600 },
      lexisNexisScoreMin: { 100000: 600 },
      dunnPaydexScoreMin: { 100000: 600 },
      preferredIndustryCodes: ['237', '238', '336'],
      minimumTermMonths: 24,
      maximumTermMonths: 84,
      minimumTransactionAmount: 100000,
      maximumTransactionAmount: 2000000,
      riskToleranceLevel: RiskToleranceLevel.MEDIUM,
      averageTimeToClose: 7,
    },
    preferences: {
      preferredIndustries: ['237', '238', '336'],
      preferredAssetTypes: ['Heavy Equipment', 'Manufacturing Equipment'],
      preferredDealSize: { min: 250000, max: 1000000 },
      preferredTermLength: { min: 36, max: 60 },
    },
    riskWeights: {
      creditWorthinessWeight: 30,
      financialRatioWeight: 25,
      cashFlowWeight: 20,
      complianceWeight: 15,
      equipmentWeight: 10,
      propertyWeight: 0,
    },
    minimumCreditScore: 650,
    requiredDocuments: [
      'Business Financial Statements (2 years)',
      'Personal Financial Statements',
      'Tax Returns (Business & Personal)',
      'Bank Statements (6 months)',
      'Equipment Quote/Invoice',
      'Articles of Incorporation',
    ],
    processingTime: '5-7 business days',
    contactInfo: {
      email: 'applications@capitalequipment.com',
      phone: '(555) 123-4567',
      website: 'https://capitalequipment.com',
    },
    brokerRequirements: {
      minimumVolume: 2000000,
      yearsInBusiness: 3,
      requiredLicenses: ['NMLS'],
      approvalStatus: 'approved',
      applicationSubmitted: true,
    },
    totalMatches: 45,
    successfulMatches: 38,
    averageMatchScore: 87.5,
    lastUsed: '2024-01-20T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    updatedBy: 'admin@capitalequipment.com',
    interestRateRange: { min: 5.5, max: 12.5 },
  },
  {
    id: 'LEND-002',
    lenderName: 'Commercial Real Estate Partners',
    lenderType: 'bank',
    instrumentName: 'Commercial Real Estate Loans',
    instrumentType: InstrumentType.REAL_ESTATE,
    isActive: true,
    dealKillers: {
      financialInstrumentTypes: [InstrumentType.REAL_ESTATE],
      collateralTypes: [CollateralType.REAL_ESTATE],
      garagingLocationRequirement: [],
      minimumFleetRequirement: 0,
      geographicLendingCoverage: ['CA', 'NY', 'NJ', 'CT'],
      restrictedAssetSellerTypes: [],
      restrictedIndustryCodes: ['722', '713', '721'],
      minimumBusinessAge: 36,
      minimumBusinessRevenue: 1000000,
      debtServiceCoverageRatio: 1.2,
      bankruptcyAcceptance: false,
    },
    secondStage: {
      equifaxMinScores: { 1000000: 700 },
      experianMinScores: { 1000000: 700 },
      transunionMinScores: { 1000000: 700 },
      businessIntelscoreMin: { 1000000: 650 },
      paynetMasterscoreMin: { 1000000: 650 },
      equifaxOneScoreMin: { 1000000: 650 },
      lexisNexisScoreMin: { 1000000: 650 },
      dunnPaydexScoreMin: { 1000000: 650 },
      preferredIndustryCodes: ['531', '236', '237'],
      minimumTermMonths: 60,
      maximumTermMonths: 300,
      minimumTransactionAmount: 1000000,
      maximumTransactionAmount: 50000000,
      riskToleranceLevel: RiskToleranceLevel.LOW,
      averageTimeToClose: 15,
    },
    preferences: {
      preferredIndustries: ['531', '236', '237'],
      preferredAssetTypes: ['Office Buildings', 'Industrial', 'Retail'],
      preferredDealSize: { min: 2000000, max: 10000000 },
      preferredTermLength: { min: 120, max: 240 },
    },
    riskWeights: {
      creditWorthinessWeight: 35,
      financialRatioWeight: 30,
      cashFlowWeight: 20,
      complianceWeight: 10,
      equipmentWeight: 0,
      propertyWeight: 5,
    },
    minimumCreditScore: 700,
    requiredDocuments: [
      'Business Financial Statements (3 years)',
      'Personal Financial Statements',
      'Tax Returns (3 years)',
      'Property Appraisal',
      'Environmental Report',
      'Rent Roll',
      'Operating Statements',
    ],
    processingTime: '10-15 business days',
    contactInfo: {
      email: 'cre@crepartners.com',
      phone: '(555) 987-6543',
      website: 'https://crepartners.com',
    },
    brokerRequirements: {
      minimumVolume: 5000000,
      yearsInBusiness: 5,
      requiredLicenses: ['NMLS', 'Real Estate License'],
      approvalStatus: 'pending',
      applicationSubmitted: true,
    },
    totalMatches: 23,
    successfulMatches: 19,
    averageMatchScore: 92.1,
    lastUsed: '2024-01-22T14:15:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-22T14:15:00Z',
    updatedBy: 'admin@crepartners.com',
    interestRateRange: { min: 4.5, max: 8.5 },
  },
  {
    id: 'LEND-003',
    lenderName: 'Small Business Capital',
    lenderType: 'credit_union',
    instrumentName: 'General Business Credit Line',
    instrumentType: InstrumentType.GENERAL,
    isActive: true,
    dealKillers: {
      financialInstrumentTypes: [InstrumentType.GENERAL],
      collateralTypes: [CollateralType.PERSONAL_GUARANTEE, CollateralType.UCC_BLANKET_LIEN],
      garagingLocationRequirement: [],
      minimumFleetRequirement: 0,
      geographicLendingCoverage: [],
      restrictedAssetSellerTypes: [],
      restrictedIndustryCodes: ['713'],
      minimumBusinessAge: 12,
      minimumBusinessRevenue: 250000,
      debtServiceCoverageRatio: 1.35,
      bankruptcyAcceptance: true,
    },
    secondStage: {
      equifaxMinScores: { 50000: 600 },
      experianMinScores: { 50000: 600 },
      transunionMinScores: { 50000: 600 },
      businessIntelscoreMin: { 50000: 550 },
      paynetMasterscoreMin: { 50000: 550 },
      equifaxOneScoreMin: { 50000: 550 },
      lexisNexisScoreMin: { 50000: 550 },
      dunnPaydexScoreMin: { 50000: 550 },
      preferredIndustryCodes: ['all'],
      minimumTermMonths: 12,
      maximumTermMonths: 60,
      minimumTransactionAmount: 50000,
      maximumTransactionAmount: 500000,
      riskToleranceLevel: RiskToleranceLevel.HIGH,
      averageTimeToClose: 3,
    },
    preferences: {
      preferredIndustries: ['all'],
      preferredAssetTypes: ['Working Capital', 'Business Expansion'],
      preferredDealSize: { min: 100000, max: 300000 },
      preferredTermLength: { min: 24, max: 48 },
    },
    riskWeights: {
      creditWorthinessWeight: 25,
      financialRatioWeight: 20,
      cashFlowWeight: 30,
      complianceWeight: 15,
      equipmentWeight: 5,
      propertyWeight: 5,
    },
    minimumCreditScore: 600,
    requiredDocuments: [
      'Business Financial Statements (1 year)',
      'Bank Statements (3 months)',
      'Tax Returns (1 year)',
      'Business License',
    ],
    processingTime: '2-3 business days',
    contactInfo: {
      email: 'lending@sbcapital.coop',
      phone: '(555) 456-7890',
    },
    brokerRequirements: {
      minimumVolume: 500000,
      yearsInBusiness: 1,
      requiredLicenses: [],
      approvalStatus: 'approved',
      applicationSubmitted: true,
    },
    totalMatches: 67,
    successfulMatches: 52,
    averageMatchScore: 78.3,
    lastUsed: '2024-01-25T09:45:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-25T09:45:00Z',
    updatedBy: 'admin@sbcapital.coop',
    interestRateRange: { min: 6.5, max: 15.5 },
  },
];

const InstrumentProfileManager: React.FC = () => {
  const navigate = useNavigate();
  const { getBaseUserType, currentRole, hasPermission } = useUserPermissions();
  const baseType = getBaseUserType(currentRole);
  const [userType, setUserType] = useState<'lender' | 'broker'>('lender');
  const [instruments, setInstruments] = useState<LenderInstrument[]>(mockLenderInstruments);
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<InstrumentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'available'>(
    'all'
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!['lender', 'broker'].includes(baseType)) {
      navigate('/dashboard');
      return;
    }
    setUserType(baseType as 'lender' | 'broker');
  }, [currentRole, navigate]);

  // Filter instruments based on user type and search/filter criteria
  const filteredInstruments = instruments.filter(instrument => {
    // Search filter
    if (
      searchTerm &&
      !instrument.lenderName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !instrument.instrumentName.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Type filter
    if (filterType !== 'all' && instrument.instrumentType !== filterType) {
      return false;
    }

    // Status filter for brokers
    if (userType === 'broker' && filterStatus !== 'all') {
      if (
        filterStatus === 'approved' &&
        instrument.brokerRequirements.approvalStatus !== 'approved'
      ) {
        return false;
      }
      if (
        filterStatus === 'pending' &&
        instrument.brokerRequirements.approvalStatus !== 'pending'
      ) {
        return false;
      }
      if (filterStatus === 'available' && instrument.brokerRequirements.applicationSubmitted) {
        return false;
      }
    }

    // For lenders, show only their own instruments (in real app, filter by lender ID)
    if (userType === 'lender') {
      // In real implementation, filter by current user's lender ID
      return true;
    }

    return true;
  });

  const handleCreateInstrument = () => {
    if (userType === 'lender') {
      navigate('/customer-retention/smart-matching/create');
    }
  };

  const handleApplyToInstrument = (instrumentId: string) => {
    navigate(`/instrument-application/${instrumentId}`);
  };

  const handleViewInstrument = (instrumentId: string) => {
    navigate(`/instrument-details/${instrumentId}`);
  };

  const handleEditInstrument = (instrumentId: string) => {
    navigate(`/customer-retention/smart-matching/edit/${instrumentId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <EyeIcon className="w-3 h-3 mr-1" />
            Available
          </span>
        );
    }
  };

  const getInstrumentTypeIcon = (type: InstrumentType) => {
    switch (type) {
      case InstrumentType.EQUIPMENT:
        return '🚜';
      case InstrumentType.REAL_ESTATE:
        return '🏢';
      case InstrumentType.GENERAL:
        return '💼';
      default:
        return '📄';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <PageLayout
      title={userType === 'lender' ? 'My Lending Instruments' : 'Available Lender Instruments'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {userType === 'lender' ? 'My Lending Instruments' : 'Available Lender Instruments'}
              </h1>
              <p className="mt-2 text-gray-600">
                {userType === 'lender'
                  ? 'Create and manage your lending instruments and requirements'
                  : 'Browse available lender instruments and submit applications'}
              </p>
            </div>
            {userType === 'lender' && (
              <button
                onClick={handleCreateInstrument}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create New Instrument
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search instruments..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as InstrumentType | 'all')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value={InstrumentType.EQUIPMENT}>Equipment Financing</option>
                <option value={InstrumentType.REAL_ESTATE}>Real Estate</option>
                <option value={InstrumentType.GENERAL}>General Credit</option>
              </select>
            </div>

            {/* Status Filter (Broker only) */}
            {userType === 'broker' && (
              <div>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as any)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available to Apply</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
            )}

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedView('grid')}
                className={`p-2 rounded-md ${selectedView === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setSelectedView('list')}
                className={`p-2 rounded-md ${selectedView === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredInstruments.length} of {instruments.length} instruments
          </p>
        </div>

        {/* Instruments Grid/List */}
        {selectedView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstruments.map(instrument => (
              <div
                key={instrument.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {getInstrumentTypeIcon(instrument.instrumentType)}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {instrument.instrumentName}
                        </h3>
                        <p className="text-sm text-gray-600">{instrument.lenderName}</p>
                      </div>
                    </div>
                    {userType === 'broker' &&
                      getStatusBadge(instrument.brokerRequirements.approvalStatus || 'available')}
                  </div>

                  {/* Key Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Loan Range:</span>
                      <span className="font-medium">
                        {formatCurrency(instrument.secondStage.minimumTransactionAmount)} -
                        {formatCurrency(instrument.secondStage.maximumTransactionAmount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <span className="text-sm">Interest Rate:</span>
                      <span className="font-medium">
                        {instrument.interestRateRange.min}% - {instrument.interestRateRange.max}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Min Credit Score:</span>
                      <span className="font-medium">{instrument.minimumCreditScore}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Processing Time:</span>
                      <span className="font-medium">{instrument.processingTime}</span>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-500">Success Rate</p>
                        <p className="text-lg font-semibold text-green-600">
                          {Math.round(
                            (instrument.successfulMatches / instrument.totalMatches) * 100
                          )}
                          %
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Avg Score</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {instrument.averageMatchScore.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewInstrument(instrument.id)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <EyeIcon className="w-4 h-4 inline mr-1" />
                      View Details
                    </button>
                    {userType === 'lender' ? (
                      <button
                        onClick={() => handleEditInstrument(instrument.id)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        <CogIcon className="w-4 h-4 inline mr-1" />
                        Edit
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApplyToInstrument(instrument.id)}
                        disabled={instrument.brokerRequirements.applicationSubmitted}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {instrument.brokerRequirements.applicationSubmitted ? 'Applied' : 'Apply'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instrument
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate Range
                  </th>
                  {userType === 'broker' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInstruments.map(instrument => (
                  <tr key={instrument.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">
                          {getInstrumentTypeIcon(instrument.instrumentType)}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {instrument.instrumentName}
                          </div>
                          <div className="text-sm text-gray-500">{instrument.instrumentType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {instrument.lenderName}
                      </div>
                      <div className="text-sm text-gray-500">{instrument.lenderType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(instrument.secondStage.minimumTransactionAmount)} -
                      {formatCurrency(instrument.secondStage.maximumTransactionAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {instrument.interestRateRange.min}% - {instrument.interestRateRange.max}%
                    </td>
                    {userType === 'broker' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(
                          instrument.brokerRequirements.approvalStatus || 'available'
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewInstrument(instrument.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {userType === 'lender' ? (
                          <button
                            onClick={() => handleEditInstrument(instrument.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Edit
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApplyToInstrument(instrument.id)}
                            disabled={instrument.brokerRequirements.applicationSubmitted}
                            className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                          >
                            {instrument.brokerRequirements.applicationSubmitted
                              ? 'Applied'
                              : 'Apply'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {filteredInstruments.length === 0 && (
          <div className="text-center py-12">
            <BuildingOffice2Icon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No instruments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {userType === 'lender'
                ? 'Get started by creating your first lending instrument.'
                : 'No instruments match your current filters.'}
            </p>
            {userType === 'lender' && (
              <div className="mt-6">
                <button
                  onClick={handleCreateInstrument}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create New Instrument
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default InstrumentProfileManager;
