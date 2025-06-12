import React, { useState } from 'react';
import { useUserType } from '../contexts/UserTypeContext';
import { UserType } from '../types/UserTypes';
import TopNavigation from '../components/layout/TopNavigation';
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface PortfolioMetric {
  label: string;
  value: string;
  change: number;
  period: string;
  positive: boolean;
}

interface AssetAllocation {
  category: string;
  percentage: number;
  value: number;
  color: string;
}

interface PerformanceData {
  period: string;
  return: number;
  benchmark: number;
}

const PortfolioAnalytics: React.FC = () => {
  const { userType } = useUserType();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('1Y');
  const [selectedView, setSelectedView] = useState<'overview' | 'allocation' | 'performance' | 'risk'>('overview');

  const portfolioMetrics: PortfolioMetric[] = [
    {
      label: 'Total Portfolio Value',
      value: '$2,847,650',
      change: 8.4,
      period: '1M',
      positive: true,
    },
    {
      label: 'Total Return',
      value: '12.7%',
      change: 2.1,
      period: '1Y',
      positive: true,
    },
    {
      label: 'Monthly Return',
      value: '3.2%',
      change: 0.8,
      period: '1M',
      positive: true,
    },
    {
      label: 'Risk Score',
      value: '6.5/10',
      change: -0.3,
      period: '1M',
      positive: false,
    },
  ];

  const assetAllocation: AssetAllocation[] = [
    { category: 'Real Estate', percentage: 35, value: 996700, color: '#3B82F6' },
    { category: 'Equities', percentage: 25, value: 711912, color: '#10B981' },
    { category: 'Fixed Income', percentage: 20, value: 569530, color: '#F59E0B' },
    { category: 'Commodities', percentage: 10, value: 284765, color: '#8B5CF6' },
    { category: 'Alternative Assets', percentage: 7, value: 199335, color: '#EF4444' },
    { category: 'Cash', percentage: 3, value: 85407, color: '#6B7280' },
  ];

  const performanceData: PerformanceData[] = [
    { period: 'Jan', return: 2.1, benchmark: 1.8 },
    { period: 'Feb', return: -1.3, benchmark: -0.9 },
    { period: 'Mar', return: 4.2, benchmark: 3.1 },
    { period: 'Apr', return: 1.8, benchmark: 2.2 },
    { period: 'May', return: 3.7, benchmark: 2.9 },
    { period: 'Jun', return: -0.8, benchmark: -1.2 },
    { period: 'Jul', return: 2.9, benchmark: 2.1 },
    { period: 'Aug', return: 1.4, benchmark: 1.9 },
    { period: 'Sep', return: -2.1, benchmark: -1.8 },
    { period: 'Oct', return: 3.8, benchmark: 2.7 },
    { period: 'Nov', return: 2.3, benchmark: 1.9 },
    { period: 'Dec', return: 1.9, benchmark: 2.4 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderMetricsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {portfolioMetrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
            </div>
            <div className={`flex items-center text-sm ${
              metric.positive ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.positive ? (
                <ArrowUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 mr-1" />
              )}
              {Math.abs(metric.change)}%
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{metric.period} period</p>
        </div>
      ))}
    </div>
  );

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {renderMetricsGrid()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Asset Allocation Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Asset Allocation</h3>
            <ChartPieIcon className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {assetAllocation.map((allocation, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-3"
                    style={{ backgroundColor: allocation.color }}
                  />
                  <span className="text-sm text-gray-700">{allocation.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">{allocation.percentage}%</span>
                  <p className="text-xs text-gray-500">{formatCurrency(allocation.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Performance vs Benchmark</h3>
            <ChartBarIcon className="w-5 h-5 text-gray-500" />
          </div>
          
          <div className="space-y-3">
            {performanceData.slice(-6).map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 w-12">{data.period}</span>
                <div className="flex-1 mx-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${data.return >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(Math.abs(data.return) * 10, 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${data.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.return > 0 ? '+' : ''}{data.return}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">
                  {data.benchmark > 0 ? '+' : ''}{data.benchmark}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Real Estate Portfolio Rebalanced</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
            <span className="text-sm text-green-600">+2.3%</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <ArrowUpIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Dividend Payment Received</p>
                <p className="text-xs text-gray-500">5 days ago</p>
              </div>
            </div>
            <span className="text-sm text-gray-900">$3,420</span>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <EyeIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Portfolio Review Completed</p>
                <p className="text-xs text-gray-500">1 week ago</p>
              </div>
            </div>
            <span className="text-sm text-blue-600">View Report</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAllocationTab = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Detailed Asset Allocation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assetAllocation.map((allocation, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-3"
                    style={{ backgroundColor: allocation.color }}
                  />
                  <span className="text-sm font-medium text-gray-900">{allocation.category}</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{allocation.percentage}%</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Value:</span>
                  <span className="font-medium">{formatCurrency(allocation.value)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      backgroundColor: allocation.color,
                      width: `${allocation.percentage}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex items-start">
          <InformationCircleIcon className="w-6 h-6 text-blue-600 mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">Allocation Recommendations</h3>
            <ul className="space-y-2 text-blue-800">
              <li>• Consider increasing alternative assets allocation to 10-15% for better diversification</li>
              <li>• Real estate exposure is above recommended 30% threshold</li>
              <li>• Cash position could be optimized for better returns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Performance Analysis</h3>
          <div className="flex space-x-2">
            {['1M', '3M', '6M', '1Y', 'ALL'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe as any)}
                className={`px-3 py-1 text-sm rounded ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Total Return</p>
            <p className="text-2xl font-bold text-green-600">+12.7%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Benchmark Return</p>
            <p className="text-2xl font-bold text-blue-600">+8.9%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Alpha</p>
            <p className="text-2xl font-bold text-purple-600">+3.8%</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Monthly Returns</h4>
          {performanceData.map((data, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 w-12">{data.period}</span>
              <div className="flex-1 mx-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Portfolio</span>
                  <span className={`text-sm font-medium ${data.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.return > 0 ? '+' : ''}{data.return}%
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-500">Benchmark</span>
                  <span className={`text-sm ${data.benchmark >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {data.benchmark > 0 ? '+' : ''}{data.benchmark}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRiskTab = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Risk Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Risk Metrics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overall Risk Score</span>
                <span className="text-lg font-bold text-yellow-600">6.5/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Volatility (1Y)</span>
                <span className="text-sm font-medium">14.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sharpe Ratio</span>
                <span className="text-sm font-medium">1.12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Max Drawdown</span>
                <span className="text-sm font-medium text-red-600">-8.4%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Beta</span>
                <span className="text-sm font-medium">0.87</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Risk Distribution</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Low Risk</span>
                  <span>25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Medium Risk</span>
                  <span>55%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '55%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>High Risk</span>
                  <span>20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-lg p-6">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-yellow-900 mb-2">Risk Recommendations</h3>
            <ul className="space-y-2 text-yellow-800">
              <li>• Consider reducing concentration risk in real estate sector</li>
              <li>• Add more fixed income securities to reduce overall volatility</li>
              <li>• Review correlation between asset classes for better diversification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <TopNavigation title="Portfolio Analytics" />
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Analytics</h1>
            <p className="text-gray-600">Comprehensive analysis and insights into your portfolio performance</p>
          </div>
          <div className="flex items-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Beta
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'allocation', name: 'Asset Allocation', icon: ChartPieIcon },
            { id: 'performance', name: 'Performance', icon: ArrowTrendingUpIcon },
            { id: 'risk', name: 'Risk Analysis', icon: InformationCircleIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                selectedView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedView === 'overview' && renderOverviewTab()}
      {selectedView === 'allocation' && renderAllocationTab()}
      {selectedView === 'performance' && renderPerformanceTab()}
      {selectedView === 'risk' && renderRiskTab()}
    </div>
  );
};

export default PortfolioAnalytics; 