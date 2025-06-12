import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  Filter,
  Download,
} from 'lucide-react';
import salesAnalyticsService from '../../services/salesAnalyticsService';
import {
  SalesMetrics,
  SaleTransaction,
  ProductDefinition,
  SalesTarget,
} from '../../types/salesTypes';

interface SalesDashboardProps {
  className?: string;
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ className = '' }) => {
  const [dashboardData, setDashboardData] = useState<{
    todayMetrics: SalesMetrics | null;
    recentTransactions: SaleTransaction[];
    topProducts: Array<{
      product: ProductDefinition;
      revenue: number;
      transactions: number;
      growth: number;
    }>;
    salesTargets: SalesTarget[];
  }>({
    todayMetrics: null,
    recentTransactions: [],
    topProducts: [],
    salesTargets: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<
    'today' | 'week' | 'month' | 'quarter' | 'year'
  >('today');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await salesAnalyticsService.getDashboardData();

      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error loading sales dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number): string => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUpRight className="w-4 h-4" />;
    if (growth < 0) return <ArrowDownRight className="w-4 h-4" />;
    return null;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'on_track':
        return 'bg-green-100 text-green-800';
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'exceeded':
        return 'bg-blue-100 text-blue-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { todayMetrics, recentTransactions, topProducts, salesTargets } = dashboardData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Performance Dashboard</h2>
          <p className="text-gray-600">Real-time tracking of all product sales and revenue</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Export Button */}
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(todayMetrics?.totalRevenue || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div
            className={`flex items-center mt-2 ${getGrowthColor(todayMetrics?.revenueGrowth || 0)}`}
          >
            {getGrowthIcon(todayMetrics?.revenueGrowth || 0)}
            <span className="text-sm font-medium ml-1">
              {formatPercentage(todayMetrics?.revenueGrowth || 0)} from last period
            </span>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {todayMetrics?.totalTransactions?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-blue-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium ml-1">
              {todayMetrics?.newCustomers || 0} new customers
            </span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(todayMetrics?.averageOrderValue || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-gray-600">
            <span className="text-sm">
              {((todayMetrics?.conversionRate || 0) * 100).toFixed(1)}% conversion rate
            </span>
          </div>
        </div>

        {/* Commission Earned */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commission</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(todayMetrics?.commission || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-gray-600">
            <span className="text-sm">
              {(
                ((todayMetrics?.commission || 0) / (todayMetrics?.totalRevenue || 1)) *
                100
              ).toFixed(1)}
              % of revenue
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
          <div className="space-y-4">
            {topProducts.slice(0, 5).map((item, index) => (
              <div key={item.product.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-500">{item.transactions} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(item.revenue)}</p>
                  <div className={`flex items-center ${getGrowthColor(item.growth)}`}>
                    {getGrowthIcon(item.growth)}
                    <span className="text-sm ml-1">{formatPercentage(item.growth)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Targets */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Targets</h3>
          <div className="space-y-4">
            {salesTargets.map(target => (
              <div key={target.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{target.name}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(target.status)}`}
                  >
                    {target.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>
                    {target.targetType === 'revenue'
                      ? formatCurrency(target.currentValue)
                      : target.currentValue.toLocaleString()}{' '}
                    /{' '}
                    {target.targetType === 'revenue'
                      ? formatCurrency(target.targetValue)
                      : target.targetValue.toLocaleString()}
                  </span>
                  <span>{target.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      target.progress >= 100
                        ? 'bg-green-500'
                        : target.progress >= 80
                          ? 'bg-blue-500'
                          : target.progress >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(target.progress, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
            <Filter className="w-4 h-4 mr-1" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.slice(0, 10).map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.id.slice(0, 12)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {salesAnalyticsService
                      .getProductDefinitions()
                      .find(p => p.id === transaction.productId)?.name || 'Unknown Product'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.customerName}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {transaction.customerType}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(transaction.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.saleDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Categories Performance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance by Product Category
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { category: 'Underwriting & Risk', icon: '🔍', color: 'bg-blue-100 text-blue-800' },
            { category: 'Smart Match Tools', icon: '🎯', color: 'bg-green-100 text-green-800' },
            {
              category: 'Verification Services',
              icon: '✅',
              color: 'bg-purple-100 text-purple-800',
            },
            { category: 'Platform Features', icon: '⚙️', color: 'bg-orange-100 text-orange-800' },
            { category: 'Asset Services', icon: '💎', color: 'bg-indigo-100 text-indigo-800' },
            { category: 'Security Services', icon: '🛡️', color: 'bg-red-100 text-red-800' },
          ].map((category, index) => (
            <div key={category.category} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{category.icon}</span>
                <h4 className="font-medium text-gray-900">{category.category}</h4>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(Math.random() * 50000 + 10000)}
              </div>
              <div
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.color}`}
              >
                <TrendingUp className="w-3 h-3 mr-1" />+{(Math.random() * 20 + 5).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
