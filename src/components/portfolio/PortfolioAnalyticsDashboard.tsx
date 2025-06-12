import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  ScatterChart,
  Treemap,
} from 'recharts';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatPercentage, formatDate } from '../../utils/formatters';
import { Portfolio, PortfolioType } from '../../types/portfolio';

interface PortfolioAnalyticsDashboardProps {
  userRole?: string;
  onPortfolioSelect?: (portfolioId: string) => void;
}

interface AggregatedMetrics {
  totalPortfolios: number;
  totalValue: number;
  totalLoans: number;
  totalIncome: number;
  averageReturn: number;
  riskExposure: RiskExposure;
  performanceTrends: PerformanceTrend[];
  portfolioDistribution: PortfolioDistribution[];
  topPerformers: Portfolio[];
  riskAlerts: RiskAlert[];
}

interface RiskExposure {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

interface PerformanceTrend {
  date: string;
  totalValue: number;
  totalIncome: number;
  averageReturn: number;
  newLoans: number;
}

interface PortfolioDistribution {
  type: string;
  count: number;
  value: number;
  percentage: number;
}

interface RiskAlert {
  portfolioId: string;
  portfolioName: string;
  alertType: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

const PortfolioAnalyticsDashboard: React.FC<PortfolioAnalyticsDashboardProps> = ({
  userRole = 'lender',
  onPortfolioSelect,
}) => {
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>(
    '6M'
  );
  const [selectedMetric, setSelectedMetric] = useState<'value' | 'income' | 'return'>('value');

  useEffect(() => {
    fetchAggregatedData();
  }, [selectedTimeRange]);

  const fetchAggregatedData = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual API
      const response = await fetch(`/api/portfolios/analytics?timeRange=${selectedTimeRange}`);

      // Mock data for demo
      const mockMetrics: AggregatedMetrics = {
        totalPortfolios: 12,
        totalValue: 450000000,
        totalLoans: 234,
        totalIncome: 2875000,
        averageReturn: 7.2,
        riskExposure: {
          low: 45,
          medium: 35,
          high: 15,
          critical: 5,
        },
        performanceTrends: generatePerformanceTrends(),
        portfolioDistribution: [
          { type: 'Commercial Real Estate', count: 4, value: 180000000, percentage: 40 },
          { type: 'Residential Real Estate', count: 3, value: 90000000, percentage: 20 },
          { type: 'Business Loans', count: 3, value: 135000000, percentage: 30 },
          { type: 'Equipment Financing', count: 2, value: 45000000, percentage: 10 },
        ],
        topPerformers: generateTopPerformers(),
        riskAlerts: [
          {
            portfolioId: 'p1',
            portfolioName: 'High-Yield CRE Portfolio',
            alertType: 'Concentration Risk',
            message: 'Single borrower exposure exceeds 15% threshold',
            severity: 'high',
          },
          {
            portfolioId: 'p2',
            portfolioName: 'Diversified Business Loans',
            alertType: 'Payment Delay',
            message: '3 loans showing 30+ days delinquency',
            severity: 'medium',
          },
        ],
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePerformanceTrends = (): PerformanceTrend[] => {
    const trends: PerformanceTrend[] = [];
    const months =
      selectedTimeRange === '1M'
        ? 30
        : selectedTimeRange === '3M'
          ? 90
          : selectedTimeRange === '6M'
            ? 180
            : selectedTimeRange === '1Y'
              ? 365
              : 730;

    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));

      trends.push({
        date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        totalValue: 400000000 + Math.random() * 50000000,
        totalIncome: 2500000 + Math.random() * 375000,
        averageReturn: 6.5 + Math.random() * 1.5,
        newLoans: Math.floor(15 + Math.random() * 10),
      });
    }

    return trends;
  };

  const generateTopPerformers = (): Portfolio[] => {
    return [
      {
        id: 'p1',
        name: 'High-Yield CRE Portfolio',
        type: PortfolioType.COMMERCIAL_REAL_ESTATE,
        status: 'active' as any,
        totalValue: 125000000,
        totalLoans: 45,
        performanceMetrics: {
          totalReturn: 11250000,
          totalReturnPercentage: 9.0,
          monthlyIncome: 937500,
        } as any,
      } as Portfolio,
      {
        id: 'p2',
        name: 'Prime Residential Portfolio',
        type: PortfolioType.RESIDENTIAL_REAL_ESTATE,
        status: 'active' as any,
        totalValue: 85000000,
        totalLoans: 62,
        performanceMetrics: {
          totalReturn: 6800000,
          totalReturnPercentage: 8.0,
          monthlyIncome: 566667,
        } as any,
      } as Portfolio,
      {
        id: 'p3',
        name: 'Diversified Business Loans',
        type: PortfolioType.BUSINESS_LOANS,
        status: 'active' as any,
        totalValue: 95000000,
        totalLoans: 38,
        performanceMetrics: {
          totalReturn: 7125000,
          totalReturnPercentage: 7.5,
          monthlyIncome: 593750,
        } as any,
      } as Portfolio,
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!metrics) return null;

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Prepare data for risk exposure donut chart
  const riskData = [
    { name: 'Low Risk', value: metrics.riskExposure.low, color: '#10B981' },
    { name: 'Medium Risk', value: metrics.riskExposure.medium, color: '#F59E0B' },
    { name: 'High Risk', value: metrics.riskExposure.high, color: '#F97316' },
    { name: 'Critical Risk', value: metrics.riskExposure.critical, color: '#EF4444' },
  ];

  // Calculate period changes
  const periodChange = {
    value:
      ((metrics.performanceTrends[11]?.totalValue - metrics.performanceTrends[0]?.totalValue) /
        metrics.performanceTrends[0]?.totalValue) *
      100,
    income:
      ((metrics.performanceTrends[11]?.totalIncome - metrics.performanceTrends[0]?.totalIncome) /
        metrics.performanceTrends[0]?.totalIncome) *
      100,
    return:
      metrics.performanceTrends[11]?.averageReturn - metrics.performanceTrends[0]?.averageReturn,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portfolio Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Comprehensive overview of all {metrics.totalPortfolios} portfolios
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map(range => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  selectedTimeRange === range
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.totalValue)}
                </p>
              </div>
              <div
                className={`flex items-center ${periodChange.value >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {periodChange.value >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(periodChange.value).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monthly Income</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.totalIncome)}
                </p>
              </div>
              <div
                className={`flex items-center ${periodChange.income >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {periodChange.income >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(periodChange.income).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Return</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(metrics.averageReturn)}
                </p>
              </div>
              <div
                className={`flex items-center ${periodChange.return >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {periodChange.return >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(periodChange.return).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div>
              <p className="text-sm text-gray-500">Active Loans</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalLoans}</p>
              <p className="text-xs text-gray-500 mt-1">
                Across {metrics.totalPortfolios} portfolios
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Performance Trends</h3>
          <div className="flex items-center space-x-2">
            {(['value', 'income', 'return'] as const).map(metric => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  selectedMetric === metric
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {metric === 'value'
                  ? 'Portfolio Value'
                  : metric === 'income'
                    ? 'Monthly Income'
                    : 'Return Rate'}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={metrics.performanceTrends}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              tickFormatter={value =>
                selectedMetric === 'return' ? `${value}%` : `$${(value / 1000000).toFixed(0)}M`
              }
            />
            <Tooltip
              formatter={(value: number) =>
                selectedMetric === 'return' ? formatPercentage(value) : formatCurrency(value)
              }
            />
            {selectedMetric === 'value' && (
              <Area
                type="monotone"
                dataKey="totalValue"
                stroke="#6366F1"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            )}
            {selectedMetric === 'income' && (
              <Area
                type="monotone"
                dataKey="totalIncome"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorIncome)"
              />
            )}
            {selectedMetric === 'return' && (
              <Line
                type="monotone"
                dataKey="averageReturn"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ fill: '#F59E0B' }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.portfolioDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {metrics.portfolioDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {metrics.portfolioDistribution.map((item, index) => (
              <div key={item.type} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-700">{item.type}</span>
                </div>
                <span className="text-gray-900 font-medium">
                  {item.count} portfolios • {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Exposure */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Exposure Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-2 gap-4">
            {riskData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Portfolios</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Portfolio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Income
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metrics.topPerformers.map((portfolio, index) => (
                <tr
                  key={portfolio.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onPortfolioSelect?.(portfolio.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{portfolio.name}</div>
                      {index === 0 && (
                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Top Performer
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {portfolio.type.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(portfolio.totalValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-green-600">
                      {formatPercentage(portfolio.performanceMetrics.totalReturnPercentage)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(portfolio.performanceMetrics.monthlyIncome)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(portfolio.performanceMetrics.totalReturnPercentage / 10) * 100}%`,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Alerts */}
      {metrics.riskAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Active Risk Alerts</h3>
          </div>
          <div className="space-y-3">
            {metrics.riskAlerts.map((alert, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 border ${
                  alert.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : alert.severity === 'medium'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{alert.portfolioName}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  </div>
                  <span
                    className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      alert.severity === 'high'
                        ? 'bg-red-100 text-red-800'
                        : alert.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {alert.alertType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioAnalyticsDashboard;
