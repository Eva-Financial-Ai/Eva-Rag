import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Portfolio, Loan, LoanStatus, Payment, PaymentStatus } from '../../types/portfolio';
import {
  BaseAsset,
  AssetClass,
  isRealEstateAsset,
  isEquipmentAsset,
  isVehicleAsset,
  RealEstateAsset,
  EquipmentAsset,
  VehicleAsset,
} from '../../types/assetClasses';
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDuration,
} from '../../utils/formatters';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PortfolioDetailViewProps {
  portfolioId?: string;
}

const PortfolioDetailView: React.FC<PortfolioDetailViewProps> = ({ portfolioId: propId }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const portfolioId = propId || paramId;

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [assets, setAssets] = useState<BaseAsset[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<BaseAsset | null>(null);
  const [paymentSchedule, setPaymentSchedule] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'assets' | 'analytics'>(
    'overview'
  );

  // Mock data loading - replace with API calls
  useEffect(() => {
    if (!portfolioId) return;

    // Mock portfolio data
    const mockPortfolio: Portfolio = {
      id: portfolioId,
      name: 'Commercial Real Estate Portfolio',
      description: 'Prime commercial properties in major metros',
      type: 'commercial_real_estate' as any,
      status: 'active' as any,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2025-05-26'),
      ownerId: 'user-1',
      organizationId: 'org-1',
      totalValue: 125000000,
      totalLoans: 45,
      performanceMetrics: {
        totalReturn: 8750000,
        totalReturnPercentage: 7.0,
        averageInterestRate: 6.5,
        weightedAverageMaturity: 84,
        delinquencyRate: 2.1,
        defaultRate: 0.5,
        recoveryRate: 85,
        netChargeOffRate: 0.3,
        yieldToMaturity: 7.2,
        monthlyIncome: 677083,
        quarterlyIncome: 2031250,
        annualIncome: 8125000,
      },
      riskMetrics: {
        overallRiskScore: 72,
        concentrationRisk: {
          byBorrower: [
            { category: 'ABC Corp', value: 15000000, percentage: 12, riskLevel: 'medium' },
            { category: 'XYZ LLC', value: 10000000, percentage: 8, riskLevel: 'low' },
          ],
          byIndustry: [
            { category: 'Office', value: 50000000, percentage: 40, riskLevel: 'medium' },
            { category: 'Retail', value: 30000000, percentage: 24, riskLevel: 'high' },
          ],
          byGeography: [
            { category: 'California', value: 40000000, percentage: 32, riskLevel: 'medium' },
            { category: 'New York', value: 35000000, percentage: 28, riskLevel: 'low' },
          ],
          byLoanType: [],
          byMaturity: [],
        },
        creditRisk: 68,
        marketRisk: 75,
        operationalRisk: 45,
        liquidityRisk: 55,
        diversificationScore: 82,
      },
      tags: ['high-yield', 'diversified', 'stable'],
    };

    // Mock loans data
    const mockLoans: Loan[] = [
      {
        id: '1',
        portfolioId: portfolioId,
        loanNumber: 'CRE-2024-001',
        borrowerName: 'ABC Corporation',
        borrowerId: 'borrower-1',
        loanType: 'term_loan' as any,
        originalAmount: 15000000,
        currentBalance: 14250000,
        interestRate: 6.5,
        originationDate: new Date('2024-01-15'),
        maturityDate: new Date('2031-01-15'),
        paymentFrequency: 'monthly' as any,
        status: 'current' as any,
        nextPaymentDate: new Date('2025-06-01'),
        nextPaymentAmount: 97500,
        riskRating: 'BBB' as any,
        lastUpdated: new Date('2025-05-26'),
      },
      {
        id: '2',
        portfolioId: portfolioId,
        loanNumber: 'CRE-2024-002',
        borrowerName: 'XYZ Properties LLC',
        borrowerId: 'borrower-2',
        loanType: 'construction_loan' as any,
        originalAmount: 10000000,
        currentBalance: 8500000,
        interestRate: 7.0,
        originationDate: new Date('2024-03-20'),
        maturityDate: new Date('2027-03-20'),
        paymentFrequency: 'monthly' as any,
        status: 'current' as any,
        nextPaymentDate: new Date('2025-06-01'),
        nextPaymentAmount: 58333,
        riskRating: 'BB' as any,
        lastUpdated: new Date('2025-05-25'),
      },
    ];

    // Mock assets data
    const mockAssets: BaseAsset[] = [
      {
        id: 'asset-1',
        assetClass: AssetClass.COMMERCIAL_REAL_ESTATE,
        name: 'Downtown Office Tower',
        description: '20-story Class A office building',
        acquisitionDate: new Date('2024-01-15'),
        acquisitionCost: 75000000,
        currentValue: 78000000,
        lastValuationDate: new Date('2025-05-01'),
        status: 'active' as any,
      } as RealEstateAsset,
      {
        id: 'asset-2',
        assetClass: AssetClass.CONSTRUCTION_EQUIPMENT,
        name: 'CAT 336 Excavator',
        description: 'Heavy construction excavator',
        acquisitionDate: new Date('2024-03-20'),
        acquisitionCost: 450000,
        currentValue: 425000,
        lastValuationDate: new Date('2025-05-01'),
        status: 'active' as any,
      } as EquipmentAsset,
    ];

    setTimeout(() => {
      setPortfolio(mockPortfolio);
      setLoans(mockLoans);
      setAssets(mockAssets);
      setLoading(false);
    }, 1000);
  }, [portfolioId]);

  // Generate payment schedule for selected loan
  useEffect(() => {
    if (!selectedLoan) return;

    const schedule: Payment[] = [];
    const monthlyPayment = selectedLoan.nextPaymentAmount || 0;
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
      const paymentDate = new Date(currentDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      schedule.push({
        id: `payment-${i}`,
        loanId: selectedLoan.id,
        paymentDate,
        scheduledAmount: monthlyPayment,
        actualAmount: i < 3 ? monthlyPayment : 0,
        principal: monthlyPayment * 0.7,
        interest: monthlyPayment * 0.3,
        status: i < 3 ? PaymentStatus.COMPLETED : PaymentStatus.SCHEDULED,
      });
    }

    setPaymentSchedule(schedule);
  }, [selectedLoan]);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    if (!portfolio || !loans) return null;

    // Performance over time
    const performanceData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (11 - i));
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        value: portfolio.totalValue * (1 + (Math.random() * 0.02 - 0.01)),
        income: portfolio.performanceMetrics.monthlyIncome * (0.95 + Math.random() * 0.1),
      };
    });

    // Loan status distribution
    const statusDistribution = [
      {
        name: 'Current',
        value: loans.filter(l => l.status === LoanStatus.CURRENT).length,
        color: '#10B981',
      },
      {
        name: 'Late',
        value: loans.filter(l => l.status === LoanStatus.LATE).length,
        color: '#F59E0B',
      },
      {
        name: 'Default',
        value: loans.filter(l => l.status === LoanStatus.DEFAULT).length,
        color: '#EF4444',
      },
    ];

    // Asset class distribution
    const assetDistribution = [
      { name: 'Real Estate', value: 60, color: '#6366F1' },
      { name: 'Equipment', value: 25, color: '#8B5CF6' },
      { name: 'Vehicles', value: 10, color: '#EC4899' },
      { name: 'Other', value: 5, color: '#14B8A6' },
    ];

    return {
      performanceData,
      statusDistribution,
      assetDistribution,
    };
  }, [portfolio, loans]);

  const renderAssetDetails = (asset: BaseAsset) => {
    if (isRealEstateAsset(asset)) {
      const reAsset = asset as RealEstateAsset;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Property Type</p>
              <p className="font-medium">{reAsset.propertyType || 'Office Building'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Square Footage</p>
              <p className="font-medium">
                {(reAsset.squareFootage || 50000).toLocaleString()} sq ft
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Year Built</p>
              <p className="font-medium">{reAsset.yearBuilt || 2010}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Occupancy Rate</p>
              <p className="font-medium">{formatPercentage(reAsset.occupancyRate || 92)}</p>
            </div>
          </div>
        </div>
      );
    }

    if (isEquipmentAsset(asset)) {
      const eqAsset = asset as EquipmentAsset;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Manufacturer</p>
              <p className="font-medium">{eqAsset.manufacturer || 'Caterpillar'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Model</p>
              <p className="font-medium">{eqAsset.model || '336 Excavator'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Serial Number</p>
              <p className="font-medium">{eqAsset.serialNumber || 'CAT336-2024-001'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Operating Hours</p>
              <p className="font-medium">{(eqAsset.operatingHours || 1250).toLocaleString()}</p>
            </div>
          </div>
        </div>
      );
    }

    // Default for other asset types
    return (
      <div className="text-sm text-gray-500">
        Asset details for {asset.assetClass.replace(/_/g, ' ')}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Portfolio not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/portfolio"
            className="inline-flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Portfolios
          </Link>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Export Report
          </button>
          <button className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
            Edit Portfolio
          </button>
        </div>
      </div>

      {/* Portfolio Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{portfolio.name}</h1>
            <p className="mt-1 text-gray-500">{portfolio.description}</p>
            <div className="mt-4 flex items-center space-x-6">
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(portfolio.totalValue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Income</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(portfolio.performanceMetrics.monthlyIncome)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Return</p>
                <p className="text-xl font-semibold text-green-600">
                  {formatPercentage(portfolio.performanceMetrics.totalReturnPercentage)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Risk Score</p>
                <p className="text-xl font-semibold text-yellow-600">
                  {portfolio.riskMetrics.overallRiskScore}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'loans', 'assets', 'analytics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Average Interest Rate</span>
                <span className="font-medium">
                  {formatPercentage(portfolio.performanceMetrics.averageInterestRate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Weighted Average Maturity</span>
                <span className="font-medium">
                  {formatDuration(portfolio.performanceMetrics.weightedAverageMaturity)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delinquency Rate</span>
                <span className="font-medium text-yellow-600">
                  {formatPercentage(portfolio.performanceMetrics.delinquencyRate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Default Rate</span>
                <span className="font-medium text-red-600">
                  {formatPercentage(portfolio.performanceMetrics.defaultRate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Recovery Rate</span>
                <span className="font-medium text-green-600">
                  {formatPercentage(portfolio.performanceMetrics.recoveryRate)}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Analysis</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Credit Risk</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${portfolio.riskMetrics.creditRisk}%` }}
                    />
                  </div>
                  <span className="font-medium">{portfolio.riskMetrics.creditRisk}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Market Risk</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${portfolio.riskMetrics.marketRisk}%` }}
                    />
                  </div>
                  <span className="font-medium">{portfolio.riskMetrics.marketRisk}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Liquidity Risk</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${portfolio.riskMetrics.liquidityRisk}%` }}
                    />
                  </div>
                  <span className="font-medium">{portfolio.riskMetrics.liquidityRisk}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Diversification Score</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${portfolio.riskMetrics.diversificationScore}%` }}
                    />
                  </div>
                  <span className="font-medium">{portfolio.riskMetrics.diversificationScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'loans' && (
        <div className="space-y-6">
          {/* Loans List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Active Loans</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {loans.map(loan => (
                <div
                  key={loan.id}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLoan(loan)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium text-gray-900">{loan.loanNumber}</h4>
                        <span
                          className={`ml-3 px-2 py-1 text-xs rounded-full ${
                            loan.status === LoanStatus.CURRENT
                              ? 'bg-green-100 text-green-800'
                              : loan.status === LoanStatus.LATE
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{loan.borrowerName}</p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Current Balance</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(loan.currentBalance)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Interest Rate</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatPercentage(loan.interestRate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Next Payment</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(loan.nextPaymentDate!)}
                        </p>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Loan Details */}
          {selectedLoan && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Loan Details - {selectedLoan.loanNumber}
                </h3>
                <button
                  onClick={() => setSelectedLoan(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>

              {/* Payment Schedule */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Schedule</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Principal
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Interest
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paymentSchedule.map(payment => (
                        <tr key={payment.id}>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {formatDate(payment.paymentDate)}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {formatCurrency(payment.scheduledAmount)}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {formatCurrency(payment.principal)}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {formatCurrency(payment.interest)}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            {payment.status === PaymentStatus.COMPLETED ? (
                              <span className="flex items-center text-green-600">
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Paid
                              </span>
                            ) : (
                              <span className="flex items-center text-gray-500">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                Scheduled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="space-y-6">
          {/* Assets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map(asset => (
              <div
                key={asset.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{asset.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {asset.assetClass.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      asset.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {asset.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Current Value</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(asset.currentValue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Acquisition Cost</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(asset.acquisitionCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Appreciation</span>
                    <span
                      className={`text-sm font-medium ${
                        asset.currentValue > asset.acquisitionCost
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatPercentage(
                        ((asset.currentValue - asset.acquisitionCost) / asset.acquisitionCost) * 100
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Asset Details */}
          {selectedAsset && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedAsset.name}</h3>
                  <p className="text-sm text-gray-500">{selectedAsset.description}</p>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>
              {renderAssetDetails(selectedAsset)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && analyticsData && (
        <div className="space-y-6">
          {/* Performance Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="value"
                  stroke="#6366F1"
                  name="Portfolio Value"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  name="Monthly Income"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loan Status Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analyticsData.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Asset Class Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Class Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analyticsData.assetDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Bar dataKey="value" fill="#8884d8">
                    {analyticsData.assetDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDetailView;
