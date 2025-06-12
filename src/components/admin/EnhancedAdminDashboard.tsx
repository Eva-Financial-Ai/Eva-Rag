import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  Database,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  RefreshCw,
  Settings,
  Shield,
  Server,
  Globe,
} from 'lucide-react';
import SalesDashboard from './SalesDashboard';
import salesAnalyticsService from '../../services/salesAnalyticsService';

interface SystemMetrics {
  systemUptime: number;
  activeUsers: number;
  apiCallsToday: number;
  errorRate: number;
  databaseSize: number;
  pendingUpdates: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
}

interface SalesOverview {
  todayRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  activeSubscriptions: number;
  conversionRate: number;
  avgOrderValue: number;
}

const EnhancedAdminDashboard: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    systemUptime: 99.86,
    activeUsers: 1234,
    apiCallsToday: 125000,
    errorRate: 0.02,
    databaseSize: 2.41,
    pendingUpdates: 3,
    cpuUsage: 45.2,
    memoryUsage: 67.8,
    diskUsage: 34.5,
    networkLatency: 23,
  });

  const [salesOverview, setSalesOverview] = useState<SalesOverview>({
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    activeSubscriptions: 0,
    conversionRate: 0,
    avgOrderValue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentView, setCurrentView] = useState<'overview' | 'sales' | 'system'>('overview');

  useEffect(() => {
    loadDashboardData();
    // Set up real-time updates
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(false); // Keep system metrics loading instant for demo

      // Load sales data
      const salesResponse = await salesAnalyticsService.getDashboardData();
      if (salesResponse.success && salesResponse.data) {
        const { todayMetrics } = salesResponse.data;
        setSalesOverview({
          todayRevenue: todayMetrics.totalRevenue,
          monthlyRevenue: todayMetrics.totalRevenue * 30, // Estimate monthly
          totalTransactions: todayMetrics.totalTransactions,
          activeSubscriptions: Math.floor(todayMetrics.recurringRevenue / 100), // Estimate subscriptions
          conversionRate: todayMetrics.conversionRate,
          avgOrderValue: todayMetrics.averageOrderValue,
        });
      }

      // Simulate system metrics updates
      setSystemMetrics(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor((Math.random() - 0.5) * 20),
        apiCallsToday: prev.apiCallsToday + Math.floor(Math.random() * 100),
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        networkLatency: Math.max(0, prev.networkLatency + (Math.random() - 0.5) * 10),
      }));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
    return `${value.toFixed(2)}%`;
  };

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }): string => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricBgColor = (
    value: number,
    thresholds: { good: number; warning: number }
  ): string => {
    if (value >= thresholds.good) return 'bg-green-100';
    if (value >= thresholds.warning) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! You're logged in as EVA Administrator</p>
          <p className="text-sm text-gray-500">Today at {new Date().toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* View Selector */}
          <div className="flex bg-white rounded-lg shadow-sm border">
            <button
              onClick={() => setCurrentView('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                currentView === 'overview'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCurrentView('sales')}
              className={`px-4 py-2 text-sm font-medium ${
                currentView === 'sales'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Sales Analytics
            </button>
            <button
              onClick={() => setCurrentView('system')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                currentView === 'system'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              System Health
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Last Login */}
          <div className="text-right">
            <div className="text-sm text-gray-500">Last login</div>
            <div className="text-sm font-medium text-gray-900">Today at 9:15 AM</div>
          </div>
        </div>
      </div>

      {/* Overview Dashboard */}
      {currentView === 'overview' && (
        <div className="space-y-6">
          {/* Combined Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* System Uptime */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Uptime</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPercentage(systemMetrics.systemUptime)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-green-600">
                <span className="text-sm">+0.2% from last month</span>
              </div>
            </div>

            {/* Today's Revenue */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(salesOverview.todayRevenue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-blue-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+15.2% from yesterday</span>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {systemMetrics.activeUsers.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-purple-600">
                <span className="text-sm">+12.3% from last week</span>
              </div>
            </div>

            {/* Error Rate */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPercentage(systemMetrics.errorRate)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-2 text-green-600">
                <span className="text-sm">-0.1% improvement</span>
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* API Calls Today */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">API Calls Today</p>
                  <p className="text-xl font-bold text-gray-900">
                    {systemMetrics.apiCallsToday.toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-1">+12.3% from yesterday</div>
            </div>

            {/* Database Size */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Database Size</p>
                  <p className="text-xl font-bold text-gray-900">
                    {systemMetrics.databaseSize.toFixed(2)}B
                  </p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Database className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-1">+8.5% growth this month</div>
            </div>

            {/* Pending Updates */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Updates</p>
                  <p className="text-xl font-bold text-orange-600">
                    {systemMetrics.pendingUpdates}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-1">Schedule maintenance</div>
            </div>
          </div>

          {/* Sales Overview Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
              <button
                onClick={() => setCurrentView('sales')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Detailed Analytics →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(salesOverview.monthlyRevenue)}
                </div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
                <div className="text-xs text-green-600 mt-1">+18.5% from last month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {salesOverview.totalTransactions.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Transactions</div>
                <div className="text-xs text-blue-600 mt-1">+12.3% this month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(salesOverview.avgOrderValue)}
                </div>
                <div className="text-sm text-gray-600">Avg Order Value</div>
                <div className="text-xs text-purple-600 mt-1">+5.7% improvement</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Settings className="w-6 h-6 text-gray-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">System Settings</div>
                  <div className="text-sm text-gray-500">Configure platform</div>
                </div>
              </button>
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Users className="w-6 h-6 text-gray-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">User Management</div>
                  <div className="text-sm text-gray-500">Manage accounts</div>
                </div>
              </button>
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Shield className="w-6 h-6 text-gray-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Security Center</div>
                  <div className="text-sm text-gray-500">Monitor threats</div>
                </div>
              </button>
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Database className="w-6 h-6 text-gray-600 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Database Admin</div>
                  <div className="text-sm text-gray-500">Manage data</div>
                </div>
              </button>
            </div>
          </div>

          {/* Your Access Level */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Your Access Level</h3>
                <p className="text-blue-800">
                  As an EVA Administrator, you have access to admin-specific features and data. Your
                  permissions are tailored to your role within the organization.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Analytics View */}
      {currentView === 'sales' && <SalesDashboard />}

      {/* System Health View */}
      {currentView === 'system' && (
        <div className="space-y-6">
          {/* System Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CPU Usage */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                  <p
                    className={`text-2xl font-bold ${getMetricColor(100 - systemMetrics.cpuUsage, { good: 50, warning: 30 })}`}
                  >
                    {formatPercentage(systemMetrics.cpuUsage)}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${getMetricBgColor(100 - systemMetrics.cpuUsage, { good: 50, warning: 30 })}`}
                >
                  <Server className="w-6 h-6" />
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemMetrics.cpuUsage}%` }}
                ></div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                  <p
                    className={`text-2xl font-bold ${getMetricColor(100 - systemMetrics.memoryUsage, { good: 30, warning: 20 })}`}
                  >
                    {formatPercentage(systemMetrics.memoryUsage)}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${getMetricBgColor(100 - systemMetrics.memoryUsage, { good: 30, warning: 20 })}`}
                >
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemMetrics.memoryUsage}%` }}
                ></div>
              </div>
            </div>

            {/* Disk Usage */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Disk Usage</p>
                  <p
                    className={`text-2xl font-bold ${getMetricColor(100 - systemMetrics.diskUsage, { good: 50, warning: 30 })}`}
                  >
                    {formatPercentage(systemMetrics.diskUsage)}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${getMetricBgColor(100 - systemMetrics.diskUsage, { good: 50, warning: 30 })}`}
                >
                  <Database className="w-6 h-6" />
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${systemMetrics.diskUsage}%` }}
                ></div>
              </div>
            </div>

            {/* Network Latency */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Network Latency</p>
                  <p
                    className={`text-2xl font-bold ${getMetricColor(100 - systemMetrics.networkLatency, { good: 70, warning: 50 })}`}
                  >
                    {systemMetrics.networkLatency.toFixed(0)}ms
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${getMetricBgColor(100 - systemMetrics.networkLatency, { good: 70, warning: 50 })}`}
                >
                  <Globe className="w-6 h-6" />
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">Cloudflare CDN: Active</div>
            </div>
          </div>

          {/* Cloudflare Infrastructure Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cloudflare Infrastructure Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">CDN</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Active
                  </span>
                </div>
                <div className="text-xs text-gray-500">Global edge caching enabled</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">WARP</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Connected
                  </span>
                </div>
                <div className="text-xs text-gray-500">Zero Trust network access</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Firewall</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Protected
                  </span>
                </div>
                <div className="text-xs text-gray-500">WAF rules active</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Load Balancer</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Balanced
                  </span>
                </div>
                <div className="text-xs text-gray-500">Traffic distributed</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAdminDashboard;
