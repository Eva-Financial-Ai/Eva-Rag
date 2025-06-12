import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  MapIcon,
  CogIcon,
  TrophyIcon,
  FireIcon,
  LightBulbIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface ExecutiveMetric {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
  category: 'revenue' | 'growth' | 'operations' | 'risk';
  priority: 'critical' | 'high' | 'medium';
  description: string;
  target?: number;
  benchmark?: number;
}

interface BusinessUnit {
  name: string;
  revenue: number;
  growth: number;
  users: number;
  conversionRate: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

const CEOExecutiveDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'revenue' | 'growth' | 'operations' | 'risk'
  >('all');

  // Key Business Metrics - The metrics that matter to CEO and investors
  const executiveMetrics: ExecutiveMetric[] = [
    // REVENUE GENERATION METRICS
    {
      id: 'total-platform-revenue',
      label: 'Total Platform Revenue',
      value: '$12.8M',
      change: 28.4,
      changeType: 'increase',
      icon: <CurrencyDollarIcon className="h-6 w-6" />,
      color: 'emerald',
      category: 'revenue',
      priority: 'critical',
      description: 'Total revenue generated across all business units',
      target: 15000000,
      benchmark: 10000000,
    },
    {
      id: 'monthly-recurring-revenue',
      label: 'Monthly Recurring Revenue',
      value: '$2.1M',
      change: 22.1,
      changeType: 'increase',
      icon: <ArrowTrendingUpIcon className="h-6 w-6" />,
      color: 'emerald',
      category: 'revenue',
      priority: 'critical',
      description: 'Predictable monthly revenue from subscriptions and recurring services',
      target: 2500000,
    },
    {
      id: 'revenue-per-user',
      label: 'Revenue per User',
      value: '$4,250',
      change: 15.7,
      changeType: 'increase',
      icon: <UserGroupIcon className="h-6 w-6" />,
      color: 'blue',
      category: 'revenue',
      priority: 'high',
      description: 'Average revenue generated per active user',
      target: 5000,
    },

    // GROWTH & EXPANSION METRICS
    {
      id: 'multi-product-adoption',
      label: 'Multi-Product Users',
      value: '68%',
      change: 12.3,
      changeType: 'increase',
      icon: <TrophyIcon className="h-6 w-6" />,
      color: 'purple',
      category: 'growth',
      priority: 'critical',
      description: 'Percentage of users using more than one EVA financial product',
      target: 75,
    },
    {
      id: 'customer-lifetime-value',
      label: 'Customer Lifetime Value',
      value: '$45,200',
      change: 18.9,
      changeType: 'increase',
      icon: <FireIcon className="h-6 w-6" />,
      color: 'orange',
      category: 'growth',
      priority: 'critical',
      description: 'Average total revenue expected from a customer relationship',
      target: 50000,
    },
    {
      id: 'user-growth-rate',
      label: 'User Growth Rate',
      value: '24.5%',
      change: 8.2,
      changeType: 'increase',
      icon: <ChartBarIcon className="h-6 w-6" />,
      color: 'green',
      category: 'growth',
      priority: 'high',
      description: 'Month-over-month user acquisition growth',
      target: 25,
    },

    // KEY PRODUCT METRICS (What you specifically mentioned)
    {
      id: 'risk-maps-sold',
      label: 'Risk Maps Sold',
      value: '1,247',
      change: 34.2,
      changeType: 'increase',
      icon: <MapIcon className="h-6 w-6" />,
      color: 'red',
      category: 'operations',
      priority: 'critical',
      description: 'Number of risk assessment maps sold to lenders and brokers',
      target: 1500,
    },
    {
      id: 'assets-pressed',
      label: 'Assets Pressed',
      value: '2,847',
      change: 28.7,
      changeType: 'increase',
      icon: <BuildingOfficeIcon className="h-6 w-6" />,
      color: 'blue',
      category: 'operations',
      priority: 'critical',
      description: 'Number of assets processed through Asset Press platform',
      target: 3000,
    },
    {
      id: 'smart-matches-closed',
      label: 'Smart Matches Closed',
      value: '892',
      change: 42.1,
      changeType: 'increase',
      icon: <LightBulbIcon className="h-6 w-6" />,
      color: 'yellow',
      category: 'operations',
      priority: 'critical',
      description: 'Number of successful AI-powered borrower-lender matches',
      target: 1000,
    },

    // OPERATIONAL EXCELLENCE
    {
      id: 'platform-uptime',
      label: 'Platform Uptime',
      value: '99.98%',
      change: 0.1,
      changeType: 'increase',
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      color: 'green',
      category: 'operations',
      priority: 'high',
      description: 'System availability and reliability',
      target: 99.9,
    },
    {
      id: 'average-deal-size',
      label: 'Average Deal Size',
      value: '$850K',
      change: 15.3,
      changeType: 'increase',
      icon: <BriefcaseIcon className="h-6 w-6" />,
      color: 'indigo',
      category: 'revenue',
      priority: 'high',
      description: 'Average value of completed financial transactions',
      target: 1000000,
    },
    {
      id: 'time-to-funding',
      label: 'Average Time to Funding',
      value: '8.2 days',
      change: -22.4,
      changeType: 'decrease',
      icon: <ClockIcon className="h-6 w-6" />,
      color: 'green',
      category: 'operations',
      priority: 'high',
      description: 'Average time from application to funding completion',
      target: 7,
    },

    // RISK & COMPLIANCE
    {
      id: 'portfolio-default-rate',
      label: 'Portfolio Default Rate',
      value: '1.2%',
      change: -15.3,
      changeType: 'decrease',
      icon: <ExclamationTriangleIcon className="h-6 w-6" />,
      color: 'green',
      category: 'risk',
      priority: 'critical',
      description: 'Percentage of loans in default across platform',
      target: 1.0,
    },
  ];

  // Business Units Performance
  const businessUnits: BusinessUnit[] = [
    {
      name: 'Borrower Services',
      revenue: 5200000,
      growth: 28.4,
      users: 2847,
      conversionRate: 68.2,
      status: 'excellent',
    },
    {
      name: 'Vendor Marketplace',
      revenue: 3100000,
      growth: 22.1,
      users: 1456,
      conversionRate: 45.7,
      status: 'good',
    },
    {
      name: 'Broker Network',
      revenue: 2800000,
      growth: 35.6,
      users: 892,
      conversionRate: 72.3,
      status: 'excellent',
    },
    {
      name: 'Lender Platform',
      revenue: 1700000,
      growth: 18.9,
      users: 245,
      conversionRate: 84.1,
      status: 'good',
    },
  ];

  // Filter metrics based on selected category
  const filteredMetrics =
    selectedCategory === 'all'
      ? executiveMetrics
      : executiveMetrics.filter(metric => metric.category === selectedCategory);

  // Get metric color classes
  const getMetricColorClasses = (color: string, priority: string) => {
    const baseColors = {
      emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };

    const priorityBorder = priority === 'critical' ? 'border-l-4' : 'border-l-2';
    return `${baseColors[color]} ${priorityBorder}`;
  };

  // Get business unit status color
  const getBusinessUnitStatusColor = (status: string) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.good;
  };

  // Format currency values
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CEO Executive Dashboard</h1>
            <p className="mt-2 text-blue-100">
              Strategic overview of EVA Platform performance and key business drivers
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{new Date().toLocaleDateString()}</div>
            <div className="text-blue-100">Last updated: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Key Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-emerald-500">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-emerald-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Platform Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$12.8M</p>
              <p className="text-sm text-emerald-600">↑ 28.4% vs last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Multi-Product Users</p>
              <p className="text-2xl font-bold text-gray-900">68%</p>
              <p className="text-sm text-purple-600">↑ 12.3% vs last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Active Users</p>
              <p className="text-2xl font-bold text-gray-900">5,440</p>
              <p className="text-sm text-blue-600">↑ 24.5% vs last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Platform Uptime</p>
              <p className="text-2xl font-bold text-gray-900">99.98%</p>
              <p className="text-sm text-green-600">↑ 0.1% vs last month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Product Performance - What You Specifically Asked For */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Key Product Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <MapIcon className="h-8 w-8 text-red-600 mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Risk Maps Sold</h3>
                <p className="text-3xl font-bold text-red-600">1,247</p>
                <p className="text-sm text-red-600">↑ 34.2% vs last month</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Target: 1,500</p>
                <div className="w-16 bg-red-200 rounded-full h-2 mt-1">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '83%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <LightBulbIcon className="h-8 w-8 text-yellow-600 mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Smart Matches Closed</h3>
                <p className="text-3xl font-bold text-yellow-600">892</p>
                <p className="text-sm text-yellow-600">↑ 42.1% vs last month</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Target: 1,000</p>
                <div className="w-16 bg-yellow-200 rounded-full h-2 mt-1">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="text-lg font-semibold text-gray-900">Assets Pressed</h3>
                <p className="text-3xl font-bold text-blue-600">2,847</p>
                <p className="text-sm text-blue-600">↑ 28.7% vs last month</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Target: 3,000</p>
                <div className="w-16 bg-blue-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Units Performance */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Business Units Performance</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {businessUnits.map((unit, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{unit.name}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getBusinessUnitStatusColor(unit.status)}`}
                >
                  {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(unit.revenue)}</p>
                  <p className="text-sm text-green-600">↑ {unit.growth}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Users</p>
                  <p className="text-xl font-bold text-gray-900">{unit.users.toLocaleString()}</p>
                  <p className="text-sm text-blue-600">{unit.conversionRate}% conversion</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'revenue', 'growth', 'operations', 'risk'].map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category as any)}
            className={`px-4 py-2 text-sm font-medium rounded-full ${
              selectedCategory === category
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMetrics.map(metric => (
          <div
            key={metric.id}
            className={`bg-white rounded-lg shadow p-6 ${getMetricColorClasses(metric.color, metric.priority)}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {metric.icon}
                {metric.priority === 'critical' && (
                  <FireIcon className="h-4 w-4 text-red-500 ml-1" />
                )}
              </div>
              <div className="text-right">
                {metric.change !== undefined && (
                  <div className="flex items-center text-sm">
                    {metric.changeType === 'increase' ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                    ) : metric.changeType === 'decrease' ? (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                    ) : null}
                    <span
                      className={`ml-1 ${
                        metric.changeType === 'increase'
                          ? 'text-green-600'
                          : metric.changeType === 'decrease'
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }`}
                    >
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{metric.label}</h3>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-xs text-gray-600 mt-2">{metric.description}</p>

              {metric.target && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress to Target</span>
                    <span>
                      Target:{' '}
                      {typeof metric.target === 'number' && metric.target > 1000
                        ? formatCurrency(metric.target)
                        : metric.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (parseFloat(metric.value.toString().replace(/[^0-9.-]/g, '')) / metric.target) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions for CEO */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Executive Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/analytics')}
            className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChartBarIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <span className="block text-sm font-medium text-gray-900">Advanced Analytics</span>
          </button>
          <button
            onClick={() => navigate('/user-management-overview')}
            className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserGroupIcon className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <span className="block text-sm font-medium text-gray-900">User Management</span>
          </button>
          <button
            onClick={() => navigate('/financial-reports')}
            className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentTextIcon className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <span className="block text-sm font-medium text-gray-900">Financial Reports</span>
          </button>
          <button
            onClick={() => navigate('/system-health')}
            className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CogIcon className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <span className="block text-sm font-medium text-gray-900">System Health</span>
          </button>
        </div>
      </div>

      {/* Investor-Ready Summary */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Investor Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Revenue Growth</h3>
            <p className="text-3xl font-bold">28.4%</p>
            <p className="text-purple-100">Month-over-month growth</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Multi-Product Adoption</h3>
            <p className="text-3xl font-bold">68%</p>
            <p className="text-purple-100">Users with 2+ products</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Platform Efficiency</h3>
            <p className="text-3xl font-bold">8.2 days</p>
            <p className="text-purple-100">Average time to funding</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEOExecutiveDashboard;
