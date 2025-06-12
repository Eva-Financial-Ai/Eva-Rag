import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  GlobeAltIcon,
  TruckIcon,
  HomeIcon,
  ComputerDesktopIcon,
  CogIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
  ComposedChart,
} from 'recharts';

interface VendorMetrics {
  totalApplicationsSubmitted: number;
  totalCommissionsPaid: number;
  averageCommissionPercentage: number;
  lookToBookRatio: number;
  bookToCloseRatio: number;
  collateralDistribution: any[];
  geographicalDistribution: any[];
  averageCreditGrade: string;
  creditGradeDistribution: any[];
  buyRatesByCollateral: any[];
  revenueByCollateral: any[];
  applicationTrend: any[];
  vendorPerformance: any[];
}

interface TimeframeOption {
  value: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  label: string;
}

const VendorAnalyticsDashboard: React.FC = () => {
  const _navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    'weekly' | 'monthly' | 'quarterly' | 'yearly'
  >('monthly');
  const [metrics, setMetrics] = useState<VendorMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const timeframeOptions: TimeframeOption[] = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadVendorMetrics = async () => {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockMetrics: VendorMetrics = {
        totalApplicationsSubmitted: 1847,
        totalCommissionsPaid: 2850000,
        averageCommissionPercentage: 3.35,
        lookToBookRatio: 72.3,
        bookToCloseRatio: 89.1,
        collateralDistribution: [
          { name: 'Equipment', value: 45, revenue: 1350000 },
          { name: 'Vehicles', value: 28, revenue: 798000 },
          { name: 'Real Estate', value: 18, revenue: 513000 },
          { name: 'Technology', value: 6, revenue: 171000 },
          { name: 'Other Assets', value: 3, revenue: 85500 },
        ],
        geographicalDistribution: [
          { state: 'California', applications: 425, revenue: 850000 },
          { state: 'Texas', applications: 318, revenue: 636000 },
          { state: 'Florida', applications: 287, revenue: 574000 },
          { state: 'New York', applications: 245, revenue: 490000 },
          { state: 'Illinois', applications: 198, revenue: 396000 },
          { state: 'Pennsylvania', applications: 174, revenue: 348000 },
          { state: 'Ohio', applications: 145, revenue: 290000 },
          { state: 'North Carolina', applications: 132, revenue: 264000 },
        ],
        averageCreditGrade: 'B+',
        creditGradeDistribution: [
          { grade: 'A+', count: 85 },
          { grade: 'A', count: 145 },
          { grade: 'A-', count: 198 },
          { grade: 'B+', count: 287 },
          { grade: 'B', count: 425 },
          { grade: 'B-', count: 318 },
          { grade: 'C+', count: 245 },
          { grade: 'C', count: 144 },
        ],
        buyRatesByCollateral: [
          { type: 'Equipment', buyRate: 4.85, costOfMoney: 2.95, margin: 1.9 },
          { type: 'Vehicles', buyRate: 5.15, costOfMoney: 3.25, margin: 1.9 },
          { type: 'Real Estate', buyRate: 6.85, costOfMoney: 4.15, margin: 2.7 },
          { type: 'Technology', buyRate: 7.25, costOfMoney: 4.85, margin: 2.4 },
          { type: 'Other Assets', buyRate: 8.15, costOfMoney: 5.45, margin: 2.7 },
        ],
        revenueByCollateral: generateRevenueByCollateralData(selectedTimeframe),
        applicationTrend: generateApplicationTrendData(selectedTimeframe),
        vendorPerformance: [
          { name: 'Top Tier Vendors', applications: 485, commissions: 850000, avgCommission: 3.85 },
          {
            name: 'Mid Tier Vendors',
            applications: 742,
            commissions: 1200000,
            avgCommission: 3.25,
          },
          { name: 'New Vendors', applications: 620, commissions: 800000, avgCommission: 2.95 },
        ],
      };

      setMetrics(mockMetrics);
      setLoading(false);
    };

    loadVendorMetrics();
  }, [selectedTimeframe]);

  const generateApplicationTrendData = (timeframe: string) => {
    const dataPoints =
      timeframe === 'weekly'
        ? 12
        : timeframe === 'monthly'
          ? 12
          : timeframe === 'quarterly'
            ? 8
            : 5;
    const data = [];

    for (let i = 0; i < dataPoints; i++) {
      const baseValue = 120 + Math.random() * 80;
      data.push({
        period:
          timeframe === 'weekly'
            ? `Week ${i + 1}`
            : timeframe === 'monthly'
              ? `Month ${i + 1}`
              : timeframe === 'quarterly'
                ? `Q${i + 1}`
                : `Year ${2020 + i}`,
        applications: Math.round(baseValue),
        approved: Math.round(baseValue * 0.723),
        funded: Math.round(baseValue * 0.723 * 0.891),
        commissions: Math.round(baseValue * 0.723 * 0.891 * 15000),
      });
    }

    return data;
  };

  const generateRevenueByCollateralData = (timeframe: string) => {
    const dataPoints =
      timeframe === 'weekly'
        ? 12
        : timeframe === 'monthly'
          ? 12
          : timeframe === 'quarterly'
            ? 8
            : 5;
    const data = [];

    for (let i = 0; i < dataPoints; i++) {
      data.push({
        period:
          timeframe === 'weekly'
            ? `Week ${i + 1}`
            : timeframe === 'monthly'
              ? `Month ${i + 1}`
              : timeframe === 'quarterly'
                ? `Q${i + 1}`
                : `Year ${2020 + i}`,
        Equipment: Math.round(80000 + Math.random() * 40000),
        Vehicles: Math.round(65000 + Math.random() * 35000),
        RealEstate: Math.round(120000 + Math.random() * 60000),
        Technology: Math.round(30000 + Math.random() * 20000),
        Other: Math.round(15000 + Math.random() * 10000),
      });
    }

    return data;
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Vendor Analytics Dashboard</h1>
            <p className="mt-1 text-green-100">
              Comprehensive vendor performance and commission analytics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={e => setSelectedTimeframe(e.target.value as any)}
              className="bg-green-800 bg-opacity-60 border border-green-700 rounded-md px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {timeframeOptions.map(option => (
                <option key={option.value} value={option.value} className="text-gray-900">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Applications Submitted</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.totalApplicationsSubmitted.toLocaleString()}
              </p>
              <p className="text-sm text-green-600">↑ 15.2% vs last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Commissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(metrics.totalCommissionsPaid)}
              </p>
              <p className="text-sm text-green-600">↑ 22.8% vs last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Commission %</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(metrics.averageCommissionPercentage)}
              </p>
              <p className="text-sm text-purple-600">All funded transactions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Look-to-Book Ratio</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(metrics.lookToBookRatio)}
              </p>
              <p className="text-sm text-orange-600">Applications to Approved</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CreditCardIcon className="h-8 w-8 text-emerald-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Book-to-Close Ratio</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(metrics.bookToCloseRatio)}
              </p>
              <p className="text-sm text-emerald-600">Approved to Funded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Trends and Commission Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Application & Commission Trends</h2>
            <div className="text-sm text-gray-500">Showing {selectedTimeframe} data</div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={metrics.applicationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="applications" fill="#3B82F6" name="Applications" />
                <Bar yAxisId="left" dataKey="funded" fill="#10B981" name="Funded" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="commissions"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  name="Commissions ($)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Collateral Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Collateral Type</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.revenueByCollateral}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Equipment"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                />
                <Area
                  type="monotone"
                  dataKey="Vehicles"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                />
                <Area
                  type="monotone"
                  dataKey="RealEstate"
                  stackId="1"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                />
                <Area
                  type="monotone"
                  dataKey="Technology"
                  stackId="1"
                  stroke="#EF4444"
                  fill="#EF4444"
                />
                <Area type="monotone" dataKey="Other" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Collateral Distribution and Geographical Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collateral Asset Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Collateral Asset Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.collateralDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.collateralDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2">
            {metrics.collateralDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                  <span className="text-xs text-gray-500 ml-2">{formatCurrency(item.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographical Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Geographical Distribution</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {metrics.geographicalDistribution.map((location, index) => (
              <div
                key={location.state}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{location.state}</p>
                    <p className="text-xs text-gray-500">{location.applications} applications</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(location.revenue)}
                  </p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Credit Grade Distribution and Buy Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit Grade Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Borrower Credit Grade Distribution
          </h2>
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Average Credit Grade</span>
              <span className="text-lg font-bold text-green-600">{metrics.averageCreditGrade}</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.creditGradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Buy Rates by Collateral Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Buy Rates & Cost of Money by Collateral
          </h2>
          <div className="space-y-4">
            {metrics.buyRatesByCollateral.map((item, index) => (
              <div key={item.type} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">{item.type}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {formatPercentage(item.margin)} margin
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Buy Rate</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatPercentage(item.buyRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cost of Money</p>
                    <p className="text-lg font-bold text-red-600">
                      {formatPercentage(item.costOfMoney)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor Performance Tiers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Vendor Performance Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.vendorPerformance.map((tier, index) => (
            <div
              key={tier.name}
              className={`rounded-lg p-6 ${
                index === 0
                  ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200'
                  : index === 1
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'
                    : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                {index === 0 && <TrophyIcon className="h-6 w-6 text-yellow-600" />}
                {index === 1 && <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />}
                {index === 2 && <UserGroupIcon className="h-6 w-6 text-green-600" />}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Applications</span>
                  <span className="text-sm font-bold text-gray-900">{tier.applications}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Commissions</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(tier.commissions)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Commission</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatPercentage(tier.avgCommission)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => _navigate('/vendor-onboarding')}
            className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserGroupIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <span className="block text-sm font-medium text-gray-900">Onboard Vendor</span>
          </button>
          <button
            onClick={() => _navigate('/vendor-reports')}
            className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChartBarIcon className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <span className="block text-sm font-medium text-gray-900">Detailed Reports</span>
          </button>
          <button
            onClick={() => _navigate('/commission-management')}
            className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CurrencyDollarIcon className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <span className="block text-sm font-medium text-gray-900">Commission Mgmt</span>
          </button>
          <button
            onClick={() => _navigate('/vendor-settings')}
            className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CogIcon className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <span className="block text-sm font-medium text-gray-900">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalyticsDashboard;
