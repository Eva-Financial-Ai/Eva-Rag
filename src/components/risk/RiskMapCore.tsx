import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTransactionStore } from '../../hooks/useTransactionStore';
import RiskLab from './RiskLab';
import RiskMapEvaReport from './RiskMapEvaReport';
import RiskScoreDisplay from './RiskScoringModel';

import { debugLog } from '../../utils/auditLogger';

export type RiskMapType = 'unsecured' | 'equipment' | 'realestate';
export type RiskView = 'dashboard' | 'score' | 'eva-report' | 'lab';

interface RiskMapCoreProps {
  initialView?: RiskView;
  initialType?: RiskMapType;
}

const RiskMapCore: React.FC<RiskMapCoreProps> = ({
  initialView = 'dashboard',
  initialType = 'unsecured',
}) => {
  const { currentTransaction, transactions } = useTransactionStore();
  const location = useLocation();
  const [activeView, setActiveView] = useState<RiskView>(initialView);
  const [riskMapType, setRiskMapType] = useState<RiskMapType>(initialType);
  const [isLoading, setIsLoading] = useState(false);

  // Check if we're in full report mode based on URL
  const isFullReportMode = location.pathname.includes('/eva-report/full');

  // Update active view when URL changes
  useEffect(() => {
    const path = location.pathname;
    debugLog('general', 'log_statement', 'RiskMapCore: Current path:', path)

    if (path.includes('/eva-report/full')) {
      debugLog('general', 'log_statement', 'RiskMapCore: Setting view to eva-report (full)');
      setActiveView('eva-report');
    } else if (path.includes('/eva-report')) {
      debugLog('general', 'log_statement', 'RiskMapCore: Setting view to score (eva-report)');
      setActiveView('score');
    } else if (path.includes('/lab')) {
      debugLog('general', 'log_statement', 'RiskMapCore: Setting view to lab')
      setActiveView('lab');
    } else if (path.includes('/score')) {
      debugLog('general', 'log_statement', 'RiskMapCore: Setting view to score')
      setActiveView('score');
    } else {
      debugLog('general', 'log_statement', 'RiskMapCore: Setting view to dashboard (default)');
      setActiveView('dashboard');
    }
  }, [location.pathname]);

  // Also update view based on initialView prop
  useEffect(() => {
    if (initialView && initialView !== activeView) {
      debugLog('general', 'log_statement', 'RiskMapCore: Setting view from initialView prop:', initialView)
      setActiveView(initialView);
    }
  }, [initialView, activeView]);

  // Comprehensive mock data matching EVA Risk Report MVP database schema
  const getTransactionsWithRiskMaps = () => {
    return [
      {
        id: 'tx-168934001234',
        companyName: 'Smith Manufacturing',
        amount: 750000,
        type: 'equipment',
        status: 'active',
        lastUpdated: '2024-01-15',

        // EVA Risk Score and Report Model
        grade: 'A',
        totalScore: 87,
        creditWorthinessScore: 85,
        financialRatioScore: 89,
        cashFlowScore: 88,
        complianceScore: 92,
        equipmentScore: 84,
        propertyScore: null,
        collateralScore: null, // For general/unsecured loans
        negativeFactors: ['Recent credit inquiry', 'Seasonal cash flow variance'],
        isCustomWeighted: true,
        customizedBy: 'lender-001',

        // Credit Worthiness Variables - Business Credit
        blendedCreditScore: 720,
        equifaxFico: { score: 722, model: 'FICO 8' },
        transUnionFico: { score: 718, model: 'FICO 8' },
        experianFico: { score: 720, model: 'FICO 8' },
        blendedPaymentHistory: 'Excellent',
        publicRecords: 'None',
        ageOfCreditHistory: 12,
        recentInquiries: 2,
        typesOfCredit: ['Term Loans', 'Business Credit Cards', 'Equipment Financing'],
        averageLengthOfCredit: 8.5,
        paymentTrends: 'Improving',
        totalTrades: 15,

        // Financial Statements and Ratios
        debtToEquityRatio: 0.65,
        currentRatio: 2.1,
        quickRatio: 1.4,
        grossMargin: 0.42,
        netMargin: 0.08,
        returnOnAssets: 0.12,
        returnOnEquity: 0.18,
        interestCoverageRatio: 5.2,
        ebitda: 285000,

        // Business Cash Flow Variables
        operatingCashFlow: 320000,
        operatingCashFlowGrowth: 0.15,
        freeCashFlow: 180000,
        cashFlowCoverageRatio: 2.8,
        cashConversionCycle: 45,
        daysAccountsReceivable: 42,
        daysPayableOutstanding: 28,
        daysInventoryOutstanding: 31,
        workingCapital: 450000,
        cashFlowVolatility: 0.12,

        // Legal and Regulatory Compliance
        complianceHistory: 'Excellent',
        legalType: 'LLC',
        legalDisputes: 'None',
        licenseRequirements: 'Met',
        industrySpecificRegs: 'Compliant',
        regulatoryAudits: 'No issues',

        // Equipment Value and Type
        equipmentTypeDemand: 'High',
        equipmentAge: 2.5,
        residualValue: 0.68,
        depreciationRate: 0.15,
        replacementCost: 850000,
        utilizationRate: 0.85,
        maintenanceCosts: 45000,

        // Risk Score Customization
        creditWorthinessWeight: 0.25,
        financialRatioWeight: 0.3,
        cashFlowWeight: 0.25,
        complianceWeight: 0.1,
        equipmentWeight: 0.1,
        propertyWeight: 0.0,
        collateralWeight: 0.0,

        // Business Credit Scores
        businessIntelScore: {
          score: 82,
          factors: ['Payment History', 'Credit Usage', 'Financial Stability', 'Industry Risk'],
        },
        paynetMasterScore: {
          score: 785,
          factors: [
            'Payment Performance',
            'Credit Utilization',
            'Debt Management',
            'Payment Trends',
          ],
        },
        equifaxOneScore: {
          score: 78,
          factors: ['Credit History Length', 'Payment Behavior', 'Credit Mix', 'Recent Activity'],
        },
        lexisNexisScore: {
          score: 76,
          factors: ['Legal Risk', 'Financial Stability', 'Compliance History', 'Industry Standing'],
        },
        dunnPaydexScore: {
          score: 85,
          factors: ['Payment Promptness', 'Credit Risk', 'Financial Stress', 'Payment History'],
        },

        smartMatchStatus: 'approved',
        riskScore: 87,
      },
      {
        id: 'tx-168934001235',
        companyName: 'ABC Properties LLC',
        amount: 1200000,
        type: 'realestate',
        status: 'pending',
        lastUpdated: '2024-01-14',

        // EVA Risk Score and Report Model
        grade: 'B',
        totalScore: 76,
        creditWorthinessScore: 78,
        financialRatioScore: 74,
        cashFlowScore: 72,
        complianceScore: 85,
        equipmentScore: null,
        propertyScore: 79,
        negativeFactors: ['High debt-to-equity ratio', 'Property in secondary market'],
        isCustomWeighted: false,
        customizedBy: null,

        // Credit Worthiness Variables
        blendedCreditScore: 685,
        equifaxFico: { score: 688, model: 'FICO 8' },
        transUnionFico: { score: 682, model: 'FICO 8' },
        experianFico: { score: 685, model: 'FICO 8' },
        blendedPaymentHistory: 'Good',
        publicRecords: 'Minor tax lien (resolved)',
        ageOfCreditHistory: 8,
        recentInquiries: 4,
        typesOfCredit: ['Mortgages', 'Business Lines of Credit', 'SBA Loans'],
        averageLengthOfCredit: 6.2,
        paymentTrends: 'Stable',
        totalTrades: 12,

        // Financial Statements and Ratios
        debtToEquityRatio: 1.2,
        currentRatio: 1.6,
        quickRatio: 0.9,
        grossMargin: 0.65,
        netMargin: 0.12,
        returnOnAssets: 0.08,
        returnOnEquity: 0.15,
        interestCoverageRatio: 3.8,
        ebitda: 420000,

        // Business Cash Flow Variables
        operatingCashFlow: 380000,
        operatingCashFlowGrowth: 0.08,
        freeCashFlow: 220000,
        cashFlowCoverageRatio: 2.1,
        cashConversionCycle: 35,
        daysAccountsReceivable: 15,
        daysPayableOutstanding: 35,
        daysInventoryOutstanding: 0, // Real estate doesn't have inventory
        workingCapital: 280000,
        cashFlowVolatility: 0.18,

        // Legal and Regulatory Compliance
        complianceHistory: 'Good',
        legalType: 'LLC',
        legalDisputes: 'One resolved dispute',
        licenseRequirements: 'Met',
        industrySpecificRegs: 'Compliant',
        regulatoryAudits: 'Minor findings (resolved)',

        // Property Financial Health
        loanToValueRatio: 0.75,
        debtServiceCoverage: 1.35,
        propertyGrade: 'B',
        loanRateType: 'Fixed',
        propertyLiens: 'None',
        averageLeaseLength: 36,

        // Risk Score Customization
        creditWorthinessWeight: 0.2,
        financialRatioWeight: 0.25,
        cashFlowWeight: 0.2,
        complianceWeight: 0.1,
        equipmentWeight: 0.0,
        propertyWeight: 0.25,
        collateralWeight: 0.0,

        // Business Credit Scores
        businessIntelScore: {
          score: 74,
          factors: ['Payment History', 'Credit Usage', 'Financial Stability', 'Industry Risk'],
        },
        paynetMasterScore: {
          score: 702,
          factors: [
            'Payment Performance',
            'Credit Utilization',
            'Debt Management',
            'Payment Trends',
          ],
        },
        equifaxOneScore: {
          score: 71,
          factors: ['Credit History Length', 'Payment Behavior', 'Credit Mix', 'Recent Activity'],
        },
        lexisNexisScore: {
          score: 68,
          factors: ['Legal Risk', 'Financial Stability', 'Compliance History', 'Industry Standing'],
        },
        dunnPaydexScore: {
          score: 78,
          factors: ['Payment Promptness', 'Credit Risk', 'Financial Stress', 'Payment History'],
        },

        smartMatchStatus: 'review',
        riskScore: 76,
      },
      {
        id: 'tx-168934001236',
        companyName: 'TechStart Innovation',
        amount: 500000,
        type: 'general',
        status: 'rejected',
        lastUpdated: '2024-01-13',

        // EVA Risk Score and Report Model
        grade: 'D',
        totalScore: 65,
        creditWorthinessScore: 62,
        financialRatioScore: 68,
        cashFlowScore: 58,
        complianceScore: 75,
        equipmentScore: null,
        propertyScore: null,
        collateralScore: 58, // For general/unsecured loans
        negativeFactors: [
          'Limited credit history',
          'Negative cash flow quarters',
          'High industry risk',
          'Weak collateral position',
        ],
        isCustomWeighted: false,
        customizedBy: null,

        // Credit Worthiness Variables
        blendedCreditScore: 640,
        equifaxFico: { score: 642, model: 'FICO 8' },
        transUnionFico: { score: 638, model: 'FICO 8' },
        experianFico: { score: 640, model: 'FICO 8' },
        blendedPaymentHistory: 'Fair',
        publicRecords: 'None',
        ageOfCreditHistory: 3,
        recentInquiries: 6,
        typesOfCredit: ['Business Credit Cards', 'Short-term Loans'],
        averageLengthOfCredit: 2.1,
        paymentTrends: 'Declining',
        totalTrades: 8,

        // Financial Statements and Ratios
        debtToEquityRatio: 2.1,
        currentRatio: 1.1,
        quickRatio: 0.6,
        grossMargin: 0.38,
        netMargin: -0.02,
        returnOnAssets: 0.04,
        returnOnEquity: 0.08,
        interestCoverageRatio: 1.8,
        ebitda: 45000,

        // Business Cash Flow Variables
        operatingCashFlow: -25000,
        operatingCashFlowGrowth: -0.35,
        freeCashFlow: -85000,
        cashFlowCoverageRatio: 0.8,
        cashConversionCycle: 68,
        daysAccountsReceivable: 65,
        daysPayableOutstanding: 42,
        daysInventoryOutstanding: 45,
        workingCapital: 75000,
        cashFlowVolatility: 0.45,

        // Legal and Regulatory Compliance
        complianceHistory: 'Good',
        legalType: 'Corporation',
        legalDisputes: 'None',
        licenseRequirements: 'Met',
        industrySpecificRegs: 'Compliant',
        regulatoryAudits: 'No issues',

        // Risk Score Customization (default weights)
        creditWorthinessWeight: 0.25,
        financialRatioWeight: 0.25,
        cashFlowWeight: 0.25,
        complianceWeight: 0.15,
        equipmentWeight: 0.0,
        propertyWeight: 0.0,
        collateralWeight: 0.1,

        // Business Credit Scores
        businessIntelScore: {
          score: 58,
          factors: ['Payment History', 'Credit Usage', 'Financial Stability', 'Industry Risk'],
        },
        paynetMasterScore: {
          score: 625,
          factors: [
            'Payment Performance',
            'Credit Utilization',
            'Debt Management',
            'Payment Trends',
          ],
        },
        equifaxOneScore: {
          score: 61,
          factors: ['Credit History Length', 'Payment Behavior', 'Credit Mix', 'Recent Activity'],
        },
        lexisNexisScore: {
          score: 64,
          factors: ['Legal Risk', 'Financial Stability', 'Compliance History', 'Industry Standing'],
        },
        dunnPaydexScore: {
          score: 68,
          factors: ['Payment Promptness', 'Credit Risk', 'Financial Stress', 'Payment History'],
        },

        smartMatchStatus: 'declined',
        riskScore: 65,
      },
      {
        id: 'tx-168934001237',
        companyName: 'Green Energy Solutions',
        amount: 950000,
        type: 'equipment',
        status: 'active',
        lastUpdated: '2024-01-12',

        // EVA Risk Score and Report Model
        grade: 'A',
        totalScore: 82,
        creditWorthinessScore: 80,
        financialRatioScore: 84,
        cashFlowScore: 85,
        complianceScore: 88,
        equipmentScore: 81,
        propertyScore: null,
        collateralScore: null, // For general/unsecured loans
        negativeFactors: ['Equipment depreciation risk'],
        isCustomWeighted: true,
        customizedBy: 'lender-002',

        // Credit Worthiness Variables
        blendedCreditScore: 710,
        equifaxFico: { score: 712, model: 'FICO 8' },
        transUnionFico: { score: 708, model: 'FICO 8' },
        experianFico: { score: 710, model: 'FICO 8' },
        blendedPaymentHistory: 'Excellent',
        publicRecords: 'None',
        ageOfCreditHistory: 9,
        recentInquiries: 1,
        typesOfCredit: ['Equipment Financing', 'Business Credit Lines', 'SBA Loans'],
        averageLengthOfCredit: 7.8,
        paymentTrends: 'Stable',
        totalTrades: 13,

        // Financial Statements and Ratios
        debtToEquityRatio: 0.8,
        currentRatio: 1.9,
        quickRatio: 1.2,
        grossMargin: 0.45,
        netMargin: 0.11,
        returnOnAssets: 0.14,
        returnOnEquity: 0.22,
        interestCoverageRatio: 4.5,
        ebitda: 325000,

        // Business Cash Flow Variables
        operatingCashFlow: 365000,
        operatingCashFlowGrowth: 0.22,
        freeCashFlow: 195000,
        cashFlowCoverageRatio: 2.6,
        cashConversionCycle: 38,
        daysAccountsReceivable: 35,
        daysPayableOutstanding: 25,
        daysInventoryOutstanding: 28,
        workingCapital: 385000,
        cashFlowVolatility: 0.08,

        // Legal and Regulatory Compliance
        complianceHistory: 'Excellent',
        legalType: 'Corporation',
        legalDisputes: 'None',
        licenseRequirements: 'Met',
        industrySpecificRegs: 'Compliant',
        regulatoryAudits: 'No issues',

        // Equipment Value and Type
        equipmentTypeDemand: 'Very High',
        equipmentAge: 1.2,
        residualValue: 0.75,
        depreciationRate: 0.12,
        replacementCost: 1100000,
        utilizationRate: 0.92,
        maintenanceCosts: 38000,

        // Risk Score Customization
        creditWorthinessWeight: 0.2,
        financialRatioWeight: 0.25,
        cashFlowWeight: 0.3,
        complianceWeight: 0.1,
        equipmentWeight: 0.15,
        propertyWeight: 0.0,
        collateralWeight: 0.0,

        // Business Credit Scores
        businessIntelScore: {
          score: 79,
          factors: ['Payment History', 'Credit Usage', 'Financial Stability', 'Industry Risk'],
        },
        paynetMasterScore: {
          score: 765,
          factors: [
            'Payment Performance',
            'Credit Utilization',
            'Debt Management',
            'Payment Trends',
          ],
        },
        equifaxOneScore: {
          score: 75,
          factors: ['Credit History Length', 'Payment Behavior', 'Credit Mix', 'Recent Activity'],
        },
        lexisNexisScore: {
          score: 73,
          factors: ['Legal Risk', 'Financial Stability', 'Compliance History', 'Industry Standing'],
        },
        dunnPaydexScore: {
          score: 82,
          factors: ['Payment Promptness', 'Credit Risk', 'Financial Stress', 'Payment History'],
        },

        smartMatchStatus: 'approved',
        riskScore: 82,
      },
    ];
  };

  // Simple view renderer with enhanced dashboard
  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          <p className="ml-3 text-gray-600">Loading...</p>
        </div>
      );
    }

    switch (activeView) {
      case 'eva-report':
        return (
          <div className="space-y-6">
            {isFullReportMode && (
              <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                <h2 className="mb-2 text-xl font-semibold text-blue-900">
                  📊 Comprehensive EVA Risk Assessment Report
                </h2>
                <p className="text-sm text-blue-700">
                  This is the complete risk analysis with all available data points,
                  recommendations, and detailed insights.
                </p>
              </div>
            )}
            <RiskMapEvaReport
              transactionId={currentTransaction?.id || 'demo'}
              riskMapType={riskMapType}
              showDetailedView={isFullReportMode}
            />
          </div>
        );
      case 'score':
        return (
          <RiskScoreDisplay
            companyId={currentTransaction?.id || 'demo'}
            loanType={
              riskMapType === 'equipment'
                ? 'equipment'
                : riskMapType === 'realestate'
                  ? 'realestate'
                  : 'general'
            }
          />
        );
      case 'lab':
        return <RiskLab initialLoanType={riskMapType as any} />;
      case 'dashboard':
        const transactionsWithRiskMaps = getTransactionsWithRiskMaps();
        return (
          <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
              <h2 className="mb-2 text-2xl font-bold">Risk Assessment Dashboard</h2>
              <p className="opacity-90">
                Monitor all transactions with risk maps and smart match results
              </p>
            </div>

            {/* Risk Level Overview Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Approved</p>
                    <p className="text-2xl font-semibold text-gray-900">2</p>
                    <p className="text-xs text-gray-500">Active transactions</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-yellow-100 p-3">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Under Review</p>
                    <p className="text-2xl font-semibold text-gray-900">1</p>
                    <p className="text-xs text-gray-500">Pending decisions</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center">
                  <div className="bg-red-100 rounded-full p-3">
                    <span className="text-2xl">❌</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Declined</p>
                    <p className="text-2xl font-semibold text-gray-900">1</p>
                    <p className="text-xs text-gray-500">Rejected applications</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
                    <p className="text-2xl font-semibold text-gray-900">77.5</p>
                    <p className="text-xs text-gray-500">Portfolio average</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions Table with more detailed view */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Transactions with Risk Maps & Smart Match Results
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Click on any transaction to view detailed risk assessment
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Risk Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Smart Match
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">Smith Manufacturing</div>
                        <div className="text-sm text-gray-500">tx-1689341001234</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          equipment
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        $750,000
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-green-600">87/100</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            approved
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          active
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => debugLog('general', 'log_statement', 'View Score')}
                          className="mr-4 text-blue-600 hover:text-blue-900"
                        >
                          View Score
                        </button>
                        <button
                          onClick={() => debugLog('general', 'log_statement', 'Full Report')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Full Report
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">ABC Properties LLC</div>
                        <div className="text-sm text-gray-500">tx-1689341001235</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                          real-estate
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        $1,200,000
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-yellow-600">76/100</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            review
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          pending
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => debugLog('general', 'log_statement', 'View Score')}
                          className="mr-4 text-blue-600 hover:text-blue-900"
                        >
                          View Score
                        </button>
                        <button
                          onClick={() => debugLog('general', 'log_statement', 'Full Report')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Full Report
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <button
                  onClick={() => setActiveView('score')}
                  className="rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50"
                >
                  <h4 className="font-medium text-gray-900">Run Risk Score</h4>
                  <p className="mt-1 text-sm text-gray-500">Generate new risk assessment</p>
                </button>
                <button
                  onClick={() => setActiveView('eva-report')}
                  className="rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50"
                >
                  <h4 className="font-medium text-gray-900">Generate EVA Report</h4>
                  <p className="mt-1 text-sm text-gray-500">Create comprehensive risk analysis</p>
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>View not found</div>;
    }
  };

  // Don't show navigation tabs in full report mode
  if (isFullReportMode) {
    return (
      <div className="h-full">
        {/* Type selector */}
        <div className="mb-4 flex space-x-2">
          <select
            value={riskMapType}
            onChange={e => setRiskMapType(e.target.value as RiskMapType)}
            className="rounded border px-3 py-1 text-sm"
          >
            <option value="unsecured">Unsecured</option>
            <option value="equipment">Equipment</option>
            <option value="realestate">Real Estate</option>
          </select>
        </div>

        {/* Content */}
        {renderView()}
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Navigation - Dashboard first, removed Lab tab */}
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`rounded px-3 py-1 text-sm ${
            activeView === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveView('score')}
          className={`rounded px-3 py-1 text-sm ${
            activeView === 'score' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Score
        </button>
      </div>

      {/* Type selector - only show on non-dashboard views */}
      {activeView !== 'dashboard' && (
        <div className="mb-4 flex space-x-2">
          <select
            value={riskMapType}
            onChange={e => setRiskMapType(e.target.value as RiskMapType)}
            className="rounded border px-3 py-1 text-sm"
          >
            <option value="unsecured">Unsecured</option>
            <option value="equipment">Equipment</option>
            <option value="realestate">Real Estate</option>
          </select>
        </div>
      )}

      {/* Content */}
      {renderView()}
    </div>
  );
};

export default RiskMapCore;
