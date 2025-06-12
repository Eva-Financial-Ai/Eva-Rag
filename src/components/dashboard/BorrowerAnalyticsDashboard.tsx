import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import {
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
} from 'recharts';

interface BorrowerMetrics {
  totalApplications: number;
  averageCreditGrade: string;
  lookToBookRatio: number;
  bookToCloseRatio: number;
  transactionsFunded: number;
  applicationTrend: any[];
  originationSources: any[];
  commissionAverages: {
    general: number;
    equipmentVehicles: number;
    realEstate: number;
  };
}

interface TimeframeOption {
  value: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  label: string;
}

const BorrowerAnalyticsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    'weekly' | 'monthly' | 'quarterly' | 'yearly'
  >('monthly');
  const [metrics, setMetrics] = useState<BorrowerMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const timeframeOptions: TimeframeOption[] = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadBorrowerMetrics = async () => {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockMetrics: BorrowerMetrics = {
        totalApplications: 247,
        averageCreditGrade: 'B+',
        lookToBookRatio: 68.5,
        bookToCloseRatio: 84.2,
        transactionsFunded: 142,
        applicationTrend: generateApplicationTrendData(selectedTimeframe),
        originationSources: [
          { name: 'Direct Website', value: 35, color: '#3B82F6' },
          { name: 'Broker Referrals', value: 28, color: '#10B981' },
          { name: 'Vendor Partners', value: 22, color: '#F59E0B' },
          { name: 'Marketing Campaigns', value: 10, color: '#EF4444' },
          { name: 'Word of Mouth', value: 5, color: '#8B5CF6' },
        ],
        commissionAverages: {
          general: 2.85,
          equipmentVehicles: 3.25,
          realEstate: 4.15,
        },
      };

      setMetrics(mockMetrics);
      setLoading(false);
    };

    loadBorrowerMetrics();
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
      const baseValue = 15 + Math.random() * 25;
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
        approved: Math.round(baseValue * 0.685),
        funded: Math.round(baseValue * 0.685 * 0.842),
      });
    }

    return data;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Borrower Analytics Dashboard</h1>
            <p className="mt-1 text-blue-100">
              Comprehensive view of application performance and borrower insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={e => setSelectedTimeframe(e.target.value as any)}
              className="bg-blue-800 bg-opacity-60 border border-blue-700 rounded-md px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
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
              <p className="text-sm font-medium text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalApplications}</p>
              <p className="text-sm text-green-600">↑ 12.5% vs last period</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CreditCardIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Credit Grade</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.averageCreditGrade}</p>
              <p className="text-sm text-green-600">↑ Improved from B</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Look-to-Book Ratio</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(metrics.lookToBookRatio)}
              </p>
              <p className="text-sm text-purple-600">Applications to Approved</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Book-to-Close Ratio</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(metrics.bookToCloseRatio)}
              </p>
              <p className="text-sm text-orange-600">Approved to Funded</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-emerald-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Transactions Funded</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.transactionsFunded}</p>
              <p className="text-sm text-emerald-600">↑ 18.3% vs last period</p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Application Trends</h2>
          <div className="text-sm text-gray-500">Showing {selectedTimeframe} data</div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.applicationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="#3B82F6"
                strokeWidth={3}
                name="Applications Submitted"
              />
              <Line
                type="monotone"
                dataKey="approved"
                stroke="#10B981"
                strokeWidth={3}
                name="Applications Approved"
              />
              <Line
                type="monotone"
                dataKey="funded"
                stroke="#F59E0B"
                strokeWidth={3}
                name="Transactions Funded"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Origination Sources and Commission Averages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Origination Sources Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Borrower Origination Sources</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.originationSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.originationSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2">
            {metrics.originationSources.map((source, index) => (
              <div key={source.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm text-gray-700">{source.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{source.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Commission Averages by Application Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Average Commission by Application Type
          </h2>
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">General Applications</h3>
                  <p className="text-sm text-blue-600">Working capital, lines of credit, etc.</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">
                    {formatPercentage(metrics.commissionAverages.general)}
                  </p>
                  <p className="text-sm text-blue-600">Average Commission</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Equipment & Vehicles</h3>
                  <p className="text-sm text-green-600">Equipment financing, vehicle loans</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-900">
                    {formatPercentage(metrics.commissionAverages.equipmentVehicles)}
                  </p>
                  <p className="text-sm text-green-600">Average Commission</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">Real Estate</h3>
                  <p className="text-sm text-purple-600">Commercial mortgages, property loans</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-900">
                    {formatPercentage(metrics.commissionAverages.realEstate)}
                  </p>
                  <p className="text-sm text-purple-600">Average Commission</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Application Conversion Funnel</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Applications Submitted</h3>
            <p className="text-3xl font-bold text-blue-600">{metrics.totalApplications}</p>
            <p className="text-sm text-gray-500">100% of pipeline</p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Applications Approved</h3>
            <p className="text-3xl font-bold text-green-600">
              {Math.round((metrics.totalApplications * metrics.lookToBookRatio) / 100)}
            </p>
            <p className="text-sm text-gray-500">
              {formatPercentage(metrics.lookToBookRatio)} conversion
            </p>
          </div>

          <div className="text-center">
            <div className="bg-emerald-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <CurrencyDollarIcon className="h-12 w-12 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Transactions Funded</h3>
            <p className="text-3xl font-bold text-emerald-600">{metrics.transactionsFunded}</p>
            <p className="text-sm text-gray-500">
              {formatPercentage((metrics.lookToBookRatio * metrics.bookToCloseRatio) / 100)} overall
              conversion
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/credit-application')}
            className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentTextIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <span className="block text-sm font-medium text-gray-900">New Application</span>
          </button>
          <button
            onClick={() => navigate('/borrower-reports')}
            className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChartBarIcon className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <span className="block text-sm font-medium text-gray-900">Detailed Reports</span>
          </button>
          <button
            onClick={() => navigate('/borrower-pipeline')}
            className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ClockIcon className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <span className="block text-sm font-medium text-gray-900">Pipeline View</span>
          </button>
          <button
            onClick={() => navigate('/borrower-settings')}
            className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserGroupIcon className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <span className="block text-sm font-medium text-gray-900">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BorrowerAnalyticsDashboard;
