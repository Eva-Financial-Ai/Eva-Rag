import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { useUserPermissions } from '../../hooks/useUserPermissions';
import {
  SmartMatchingInstrument,
  InstrumentType,
  CollateralType,
  RiskToleranceLevel,
  CustomerSmartMatchProfile,
  DEFAULT_EQUIPMENT_INSTRUMENT,
  DEFAULT_REAL_ESTATE_INSTRUMENT,
  DEFAULT_GENERAL_INSTRUMENT,
} from '../../types/SmartMatchingTypes';
import {
  PlusIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

// Mock data for development
const mockCustomerProfile: CustomerSmartMatchProfile = {
  customerId: 'CUST-001',
  customerName: 'Capital Finance Corp',
  customerType: 'lender',
  instruments: [
    {
      id: 'INST-001',
      instrumentName: 'Equipment Financing - Heavy Machinery',
      instrumentType: InstrumentType.EQUIPMENT,
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      updatedBy: 'gmiller@capitalfinance.com',
      dealKillers: {
        financialInstrumentTypes: [InstrumentType.EQUIPMENT],
        collateralTypes: [CollateralType.EQUIPMENT],
        garagingLocationRequirement: ['Secure Facility'],
        minimumFleetRequirement: 3,
        geographicLendingCoverage: ['CA', 'TX', 'FL', 'NY'],
        restrictedAssetSellerTypes: ['Individual Seller'],
        restrictedIndustryCodes: ['722', '713'],
        minimumBusinessAge: 24,
        minimumBusinessRevenue: 500000,
        debtServiceCoverageRatio: 1.35,
        bankruptcyAcceptance: false,
      },
      secondStage: {
        equifaxMinScores: { 50000: 680, 100000: 700, 250000: 720 },
        experianMinScores: { 50000: 675, 100000: 695, 250000: 715 },
        transunionMinScores: { 50000: 670, 100000: 690, 250000: 710 },
        businessIntelscoreMin: { 50000: 650, 100000: 675, 250000: 700 },
        paynetMasterscoreMin: { 50000: 600, 100000: 625, 250000: 650 },
        equifaxOneScoreMin: { 50000: 680, 100000: 700, 250000: 720 },
        lexisNexisScoreMin: { 50000: 650, 100000: 675, 250000: 700 },
        dunnPaydexScoreMin: { 50000: 70, 100000: 75, 250000: 80 },
        preferredIndustryCodes: ['237', '238', '336'],
        minimumTermMonths: 24,
        maximumTermMonths: 84,
        minimumTransactionAmount: 50000,
        maximumTransactionAmount: 2000000,
        riskToleranceLevel: RiskToleranceLevel.MEDIUM,
        averageTimeToClose: 14,
      },
      riskWeights: {
        creditWorthinessWeight: 30,
        financialRatioWeight: 25,
        cashFlowWeight: 20,
        complianceWeight: 15,
        equipmentWeight: 10,
        propertyWeight: 0,
      },
      totalMatches: 245,
      successfulMatches: 187,
      averageMatchScore: 82.5,
      lastUsed: '2024-01-25T09:15:00Z',
    },
    {
      id: 'INST-002',
      instrumentName: 'Commercial Real Estate',
      instrumentType: InstrumentType.REAL_ESTATE,
      isActive: true,
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-22T16:45:00Z',
      updatedBy: 'gmiller@capitalfinance.com',
      dealKillers: {
        financialInstrumentTypes: [InstrumentType.REAL_ESTATE],
        collateralTypes: [CollateralType.REAL_ESTATE],
        garagingLocationRequirement: [],
        minimumFleetRequirement: 0,
        geographicLendingCoverage: ['CA', 'TX', 'FL'],
        restrictedAssetSellerTypes: [],
        restrictedIndustryCodes: ['722', '713', '512'],
        minimumBusinessAge: 36,
        minimumBusinessRevenue: 1000000,
        debtServiceCoverageRatio: 1.5,
        bankruptcyAcceptance: false,
      },
      secondStage: {
        equifaxMinScores: { 250000: 720, 500000: 740, 1000000: 760 },
        experianMinScores: { 250000: 715, 500000: 735, 1000000: 755 },
        transunionMinScores: { 250000: 710, 500000: 730, 1000000: 750 },
        businessIntelscoreMin: { 250000: 700, 500000: 725, 1000000: 750 },
        paynetMasterscoreMin: { 250000: 650, 500000: 675, 1000000: 700 },
        equifaxOneScoreMin: { 250000: 720, 500000: 740, 1000000: 760 },
        lexisNexisScoreMin: { 250000: 700, 500000: 720, 1000000: 740 },
        dunnPaydexScoreMin: { 250000: 75, 500000: 80, 1000000: 85 },
        preferredIndustryCodes: ['531', '236', '561'],
        minimumTermMonths: 60,
        maximumTermMonths: 300,
        minimumTransactionAmount: 250000,
        maximumTransactionAmount: 10000000,
        riskToleranceLevel: RiskToleranceLevel.LOW,
        averageTimeToClose: 45,
      },
      riskWeights: {
        creditWorthinessWeight: 25,
        financialRatioWeight: 30,
        cashFlowWeight: 20,
        complianceWeight: 15,
        equipmentWeight: 0,
        propertyWeight: 10,
      },
      totalMatches: 89,
      successfulMatches: 72,
      averageMatchScore: 88.2,
      lastUsed: '2024-01-23T11:30:00Z',
    },
  ],
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-25T12:00:00Z',
  updatedBy: 'gmiller@capitalfinance.com',
};

const SmartMatchingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getBaseUserType, currentRole, hasPermission } = useUserPermissions();
  const [customerProfile, setCustomerProfile] = useState<CustomerSmartMatchProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);

  // Check permissions on component mount
  useEffect(() => {
    const baseType = getBaseUserType(currentRole);

    // Only lenders and brokers can access Smart Matching
    if (!['lender', 'broker'].includes(baseType)) {
      navigate('/customer-retention/customers');
      return;
    }

    // Check specific Smart Matching permission
    if (!hasPermission('smartMatch', 'MODIFY')) {
      navigate('/customer-retention/customers');
      return;
    }

    // Load customer profile data
    loadCustomerProfile();
  }, [currentRole, navigate, hasPermission, getBaseUserType]);

  const loadCustomerProfile = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const profile = await smartMatchingService.getCustomerProfile();
      setCustomerProfile(mockCustomerProfile);
    } catch (error) {
      console.error('Failed to load customer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInstrument = (type: InstrumentType) => {
    navigate(`/customer-retention/smart-matching/create?type=${type}`);
  };

  const handleEditInstrument = (instrumentId: string) => {
    navigate(`/customer-retention/smart-matching/edit/${instrumentId}`);
  };

  const handleViewAnalytics = (instrumentId: string) => {
    navigate(`/customer-retention/smart-matching/analytics/${instrumentId}`);
  };

  const handleToggleInstrument = async (instrumentId: string) => {
    if (!customerProfile) return;

    try {
      // TODO: Replace with actual API call
      // await smartMatchingService.toggleInstrument(instrumentId);

      const updatedInstruments = customerProfile.instruments.map(instrument =>
        instrument.id === instrumentId
          ? { ...instrument, isActive: !instrument.isActive }
          : instrument
      );

      setCustomerProfile({
        ...customerProfile,
        instruments: updatedInstruments,
      });
    } catch (error) {
      console.error('Failed to toggle instrument:', error);
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

  const getPerformanceColor = (successRate: number) => {
    if (successRate >= 80) return 'text-green-600';
    if (successRate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <PageLayout title="Smart Matching Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  if (!customerProfile) {
    return (
      <PageLayout title="Smart Matching Dashboard">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No profile found</h3>
          <p className="mt-1 text-sm text-gray-500">Unable to load your Smart Matching profile.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Smart Matching Dashboard">
      <div className="w-full">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Smart Matching Dashboard</h1>
                <p className="mt-2 text-gray-600">
                  Manage your underwriting preferences and risk parameters for{' '}
                  {customerProfile.customerName}
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    customerProfile.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {customerProfile.isActive ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Active Profile
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                      Inactive Profile
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Instruments</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {customerProfile.instruments.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Instruments</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {customerProfile.instruments.filter(i => i.isActive).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Matches</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {customerProfile.instruments.reduce((sum, i) => sum + i.totalMatches, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Success Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Math.round(
                      (customerProfile.instruments.reduce(
                        (sum, i) => sum + i.successfulMatches,
                        0
                      ) /
                        Math.max(
                          customerProfile.instruments.reduce((sum, i) => sum + i.totalMatches, 0),
                          1
                        )) *
                        100
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleCreateInstrument(InstrumentType.EQUIPMENT)}
                className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🚜</span>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Equipment Financing</h3>
                    <p className="text-sm text-gray-500">Create new equipment instrument</p>
                  </div>
                  <PlusIcon className="h-5 w-5 text-blue-600 ml-auto" />
                </div>
              </button>

              <button
                onClick={() => handleCreateInstrument(InstrumentType.REAL_ESTATE)}
                className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🏢</span>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Real Estate</h3>
                    <p className="text-sm text-gray-500">Create new real estate instrument</p>
                  </div>
                  <PlusIcon className="h-5 w-5 text-blue-600 ml-auto" />
                </div>
              </button>

              <button
                onClick={() => handleCreateInstrument(InstrumentType.GENERAL)}
                className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💼</span>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">General Credit</h3>
                    <p className="text-sm text-gray-500">Create new general instrument</p>
                  </div>
                  <PlusIcon className="h-5 w-5 text-blue-600 ml-auto" />
                </div>
              </button>
            </div>
          </div>

          {/* Instruments List */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Instruments</h2>
            <div className="space-y-4">
              {customerProfile.instruments.map(instrument => {
                const successRate =
                  (instrument.successfulMatches / Math.max(instrument.totalMatches, 1)) * 100;

                return (
                  <div
                    key={instrument.id}
                    className="bg-white rounded-lg shadow border border-gray-200"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-4">
                            {getInstrumentTypeIcon(instrument.instrumentType)}
                          </span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {instrument.instrumentName}
                            </h3>
                            <p className="text-sm text-gray-500 capitalize">
                              {instrument.instrumentType.replace('_', ' ')} • Updated{' '}
                              {new Date(instrument.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleInstrument(instrument.id)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              instrument.isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {instrument.isActive ? 'Active' : 'Inactive'}
                          </button>

                          <button
                            onClick={() => handleViewAnalytics(instrument.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Analytics"
                          >
                            <ChartBarIcon className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => handleEditInstrument(instrument.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit Instrument"
                          >
                            <CogIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Total Matches</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {instrument.totalMatches}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Success Rate</p>
                          <p
                            className={`text-lg font-semibold ${getPerformanceColor(successRate)}`}
                          >
                            {successRate.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Avg Match Score</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {instrument.averageMatchScore.toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Loan Range</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ${instrument.secondStage.minimumTransactionAmount / 1000}K - $
                            {instrument.secondStage.maximumTransactionAmount / 1000}K
                          </p>
                        </div>
                      </div>

                      {/* Quick Settings Preview */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Min Revenue: $
                            {(instrument.dealKillers.minimumBusinessRevenue / 1000).toFixed(0)}K
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            DSCR: {instrument.dealKillers.debtServiceCoverageRatio}+
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Risk: {instrument.secondStage.riskToleranceLevel}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            States: {instrument.dealKillers.geographicLendingCoverage.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">
                      Equipment Financing instrument matched with 3 new borrowers
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">
                      Real Estate instrument updated by gmiller@capitalfinance.com
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900">
                      EVA underwriting model updated with new parameters
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SmartMatchingDashboard;
