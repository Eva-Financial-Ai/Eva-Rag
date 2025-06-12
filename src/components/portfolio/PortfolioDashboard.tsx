import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Portfolio,
  PortfolioStatus,
  PortfolioType,
  PortfolioFilter,
  PortfolioSortField,
  SortOption,
} from '../../types/portfolio';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface PortfolioDashboardProps {
  userRole?: string;
}

const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({ userRole = 'lender' }) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PortfolioFilter>({});
  const [sortOption, setSortOption] = useState<SortOption<PortfolioSortField>>({
    field: 'totalValue',
    direction: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with API call
  useEffect(() => {
    const mockPortfolios: Portfolio[] = [
      {
        id: '1',
        name: 'Commercial Real Estate Portfolio',
        description: 'Prime commercial properties in major metros',
        type: PortfolioType.COMMERCIAL_REAL_ESTATE,
        status: PortfolioStatus.ACTIVE,
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
            byBorrower: [],
            byIndustry: [],
            byGeography: [],
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
      },
      {
        id: '2',
        name: 'Small Business Loan Portfolio',
        description: 'SBA and conventional small business loans',
        type: PortfolioType.BUSINESS_LOANS,
        status: PortfolioStatus.ACTIVE,
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2025-05-25'),
        ownerId: 'user-1',
        organizationId: 'org-1',
        totalValue: 45000000,
        totalLoans: 120,
        performanceMetrics: {
          totalReturn: 3600000,
          totalReturnPercentage: 8.0,
          averageInterestRate: 8.5,
          weightedAverageMaturity: 60,
          delinquencyRate: 4.5,
          defaultRate: 1.2,
          recoveryRate: 70,
          netChargeOffRate: 0.8,
          yieldToMaturity: 8.3,
          monthlyIncome: 318750,
          quarterlyIncome: 956250,
          annualIncome: 3825000,
        },
        riskMetrics: {
          overallRiskScore: 65,
          concentrationRisk: {
            byBorrower: [],
            byIndustry: [],
            byGeography: [],
            byLoanType: [],
            byMaturity: [],
          },
          creditRisk: 72,
          marketRisk: 68,
          operationalRisk: 55,
          liquidityRisk: 60,
          diversificationScore: 75,
        },
        tags: ['growth', 'sba', 'small-business'],
      },
      {
        id: '3',
        name: 'Equipment Finance Portfolio',
        description: 'Construction and manufacturing equipment loans',
        type: PortfolioType.EQUIPMENT_FINANCING,
        status: PortfolioStatus.UNDER_REVIEW,
        createdAt: new Date('2024-06-10'),
        updatedAt: new Date('2025-05-24'),
        ownerId: 'user-1',
        organizationId: 'org-1',
        totalValue: 32000000,
        totalLoans: 85,
        performanceMetrics: {
          totalReturn: 2240000,
          totalReturnPercentage: 7.0,
          averageInterestRate: 7.5,
          weightedAverageMaturity: 48,
          delinquencyRate: 3.2,
          defaultRate: 0.8,
          recoveryRate: 80,
          netChargeOffRate: 0.5,
          yieldToMaturity: 7.3,
          monthlyIncome: 200000,
          quarterlyIncome: 600000,
          annualIncome: 2400000,
        },
        riskMetrics: {
          overallRiskScore: 58,
          concentrationRisk: {
            byBorrower: [],
            byIndustry: [],
            byGeography: [],
            byLoanType: [],
            byMaturity: [],
          },
          creditRisk: 62,
          marketRisk: 70,
          operationalRisk: 48,
          liquidityRisk: 65,
          diversificationScore: 68,
        },
        tags: ['equipment', 'secured', 'short-term'],
      },
    ];

    setTimeout(() => {
      setPortfolios(mockPortfolios);
      setLoading(false);
    }, 1000);
  }, []);

  // Calculate aggregate metrics
  const aggregateMetrics = useMemo(() => {
    const activePortfolios = portfolios.filter(p => p.status === PortfolioStatus.ACTIVE);
    return {
      totalValue: portfolios.reduce((sum, p) => sum + p.totalValue, 0),
      totalLoans: portfolios.reduce((sum, p) => sum + (p.totalLoans || 0), 0),
      activePortfolios: activePortfolios.length,
      averageReturn:
        activePortfolios.length > 0
          ? activePortfolios.reduce(
              (sum, p) => sum + (p.performanceMetrics?.totalReturnPercentage || 0),
              0
            ) / activePortfolios.length
          : 0,
      monthlyIncome: portfolios.reduce(
        (sum, p) => sum + (p.performanceMetrics?.monthlyIncome || 0),
        0
      ),
      averageRiskScore:
        portfolios.length > 0
          ? portfolios.reduce((sum, p) => sum + (p.riskMetrics?.overallRiskScore || 0), 0) /
            portfolios.length
          : 0,
    };
  }, [portfolios]);

  // Helper function to convert date to timestamp
  const getDateValue = (date: Date | string): number => {
    return typeof date === 'string' ? new Date(date).getTime() : date.getTime();
  };

  // Filter and sort portfolios
  const filteredAndSortedPortfolios = useMemo(() => {
    let filtered = [...portfolios];

    // Apply filters
    if (filter.status && filter.status.length > 0) {
      filtered = filtered.filter(p => filter.status!.includes(p.status!));
    }
    if (filter.type && filter.type.length > 0) {
      filtered = filtered.filter(p => filter.type!.includes(p.type!));
    }
    if (filter.minValue !== undefined) {
      filtered = filtered.filter(p => p.totalValue >= filter.minValue!);
    }
    if (filter.maxValue !== undefined) {
      filtered = filtered.filter(p => p.totalValue <= filter.maxValue!);
    }
    if (filter.riskScore) {
      filtered = filtered.filter(
        p =>
          p.riskMetrics!.overallRiskScore >= filter.riskScore!.min &&
          p.riskMetrics!.overallRiskScore <= filter.riskScore!.max
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortOption.field) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'totalValue':
          aValue = a.totalValue;
          bValue = b.totalValue;
          break;
        case 'totalLoans':
          aValue = a.totalLoans || 0;
          bValue = b.totalLoans || 0;
          break;
        case 'createdAt':
          aValue = getDateValue(a.createdAt);
          bValue = getDateValue(b.createdAt);
          break;
        case 'updatedAt':
          aValue = getDateValue(a.updatedAt);
          bValue = getDateValue(b.updatedAt);
          break;
        case 'riskScore':
          aValue = a.riskMetrics?.overallRiskScore || 0;
          bValue = b.riskMetrics?.overallRiskScore || 0;
          break;
        default:
          aValue = a.totalValue;
          bValue = b.totalValue;
      }

      if (sortOption.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [portfolios, filter, sortOption]);

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: PortfolioStatus) => {
    const statusConfig = {
      [PortfolioStatus.ACTIVE]: { color: 'bg-green-100 text-green-800', label: 'Active' },
      [PortfolioStatus.INACTIVE]: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      [PortfolioStatus.ARCHIVED]: { color: 'bg-gray-100 text-gray-600', label: 'Archived' },
      [PortfolioStatus.UNDER_REVIEW]: {
        color: 'bg-yellow-100 text-yellow-800',
        label: 'Under Review',
      },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Management</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor and manage your loan portfolios</p>
        </div>
        <Link
          to="/portfolio/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Portfolio
        </Link>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Portfolio Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(aggregateMetrics.totalValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Loans</p>
              <p className="text-2xl font-semibold text-gray-900">
                {aggregateMetrics.totalLoans.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Average Return</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatPercentage(aggregateMetrics.averageReturn)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Average Risk Score</p>
              <p
                className={`text-2xl font-semibold ${getRiskScoreColor(aggregateMetrics.averageRiskScore)}`}
              >
                {Math.round(aggregateMetrics.averageRiskScore)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Portfolios</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
              </button>
              <select
                value={`${sortOption.field}-${sortOption.direction}`}
                onChange={e => {
                  const [field, direction] = e.target.value.split('-');
                  setSortOption({
                    field: field as PortfolioSortField,
                    direction: direction as 'asc' | 'desc',
                  });
                }}
                className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="totalValue-desc">Value (High to Low)</option>
                <option value="totalValue-asc">Value (Low to High)</option>
                <option value="name-asc">Name (A to Z)</option>
                <option value="name-desc">Name (Z to A)</option>
                <option value="riskScore-desc">Risk Score (High to Low)</option>
                <option value="riskScore-asc">Risk Score (Low to High)</option>
                <option value="updatedAt-desc">Recently Updated</option>
                <option value="createdAt-desc">Recently Created</option>
              </select>
            </div>
          </div>
        </div>

        {/* Portfolio List */}
        <div className="divide-y divide-gray-200">
          {filteredAndSortedPortfolios.map(portfolio => (
            <div key={portfolio.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">{portfolio.name}</h3>
                    <div className="ml-4">{getStatusBadge(portfolio.status)}</div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{portfolio.description}</p>
                  <div className="mt-2 flex items-center space-x-6 text-sm">
                    <span className="text-gray-500">
                      Type:{' '}
                      <span className="font-medium text-gray-900">
                        {portfolio.type?.replace(/_/g, ' ') || 'N/A'}
                      </span>
                    </span>
                    <span className="text-gray-500">
                      Loans:{' '}
                      <span className="font-medium text-gray-900">{portfolio.totalLoans || 0}</span>
                    </span>
                    <span className="text-gray-500">
                      Return:{' '}
                      <span className="font-medium text-gray-900">
                        {formatPercentage(portfolio.performanceMetrics?.totalReturnPercentage || 0)}
                      </span>
                    </span>
                    <span className="text-gray-500">
                      Risk:{' '}
                      <span
                        className={`font-medium ${getRiskScoreColor(portfolio.riskMetrics?.overallRiskScore || 0)}`}
                      >
                        {portfolio.riskMetrics?.overallRiskScore || 0}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(portfolio.totalValue)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Monthly Income:{' '}
                      {formatCurrency(portfolio.performanceMetrics?.monthlyIncome || 0)}
                    </p>
                  </div>
                  <Link
                    to={`/portfolio/${portfolio.id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
