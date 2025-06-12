import React, { useState } from 'react';
import { useUserType } from '../contexts/UserTypeContext';
import { UserType } from '../types/UserTypes';
import TopNavigation from '../components/layout/TopNavigation';
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BellIcon,
  ChartBarIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface RiskAlert {
  id: string;
  type: 'high' | 'medium' | 'low';
  category: 'market' | 'credit' | 'operational' | 'liquidity' | 'concentration';
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  severity: number; // 1-10 scale
  actionRequired: boolean;
}

interface RiskMetric {
  name: string;
  value: number;
  threshold: number;
  status: 'safe' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface AssetRisk {
  id: string;
  name: string;
  category: string;
  riskScore: number;
  volatility: number;
  concentration: number;
  liquidity: string;
  creditRating?: string;
}

const RiskMonitoring: React.FC = () => {
  const { userType } = useUserType();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'assets' | 'settings'>('dashboard');
  const [selectedAlert, setSelectedAlert] = useState<RiskAlert | null>(null);

  const riskAlerts: RiskAlert[] = [
    {
      id: '1',
      type: 'high',
      category: 'concentration',
      title: 'High Concentration Risk',
      description: 'Real estate allocation exceeds 35% threshold (currently 42%)',
      timestamp: '2024-12-25T10:30:00Z',
      status: 'active',
      severity: 8,
      actionRequired: true,
    },
    {
      id: '2',
      type: 'medium',
      category: 'market',
      title: 'Market Volatility Increase',
      description: 'Portfolio VaR increased by 15% over the last week',
      timestamp: '2024-12-24T15:45:00Z',
      status: 'acknowledged',
      severity: 6,
      actionRequired: false,
    },
    {
      id: '3',
      type: 'low',
      category: 'liquidity',
      title: 'Liquidity Buffer Below Target',
      description: 'Cash position at 2.8%, target is 5%',
      timestamp: '2024-12-23T09:15:00Z',
      status: 'active',
      severity: 4,
      actionRequired: false,
    },
    {
      id: '4',
      type: 'medium',
      category: 'credit',
      title: 'Credit Rating Downgrade',
      description: 'Corporate bonds issuer XYZ Corp downgraded to BBB-',
      timestamp: '2024-12-22T14:20:00Z',
      status: 'resolved',
      severity: 5,
      actionRequired: false,
    },
  ];

  const riskMetrics: RiskMetric[] = [
    {
      name: 'Portfolio VaR (95%)',
      value: 2.8,
      threshold: 3.0,
      status: 'safe',
      trend: 'up',
      lastUpdated: '2024-12-25T16:00:00Z',
    },
    {
      name: 'Maximum Drawdown',
      value: 12.5,
      threshold: 15.0,
      status: 'warning',
      trend: 'up',
      lastUpdated: '2024-12-25T16:00:00Z',
    },
    {
      name: 'Sharpe Ratio',
      value: 1.12,
      threshold: 1.0,
      status: 'safe',
      trend: 'stable',
      lastUpdated: '2024-12-25T16:00:00Z',
    },
    {
      name: 'Beta',
      value: 0.87,
      threshold: 1.2,
      status: 'safe',
      trend: 'down',
      lastUpdated: '2024-12-25T16:00:00Z',
    },
    {
      name: 'Concentration Index',
      value: 0.42,
      threshold: 0.35,
      status: 'critical',
      trend: 'up',
      lastUpdated: '2024-12-25T16:00:00Z',
    },
    {
      name: 'Liquidity Ratio',
      value: 2.8,
      threshold: 5.0,
      status: 'warning',
      trend: 'down',
      lastUpdated: '2024-12-25T16:00:00Z',
    },
  ];

  const assetRisks: AssetRisk[] = [
    {
      id: '1',
      name: 'Downtown Office Building',
      category: 'Real Estate',
      riskScore: 7.2,
      volatility: 18.5,
      concentration: 15.2,
      liquidity: 'Low',
      creditRating: 'A-',
    },
    {
      id: '2',
      name: 'Tech Growth ETF',
      category: 'Equities',
      riskScore: 8.5,
      volatility: 28.3,
      concentration: 12.8,
      liquidity: 'High',
    },
    {
      id: '3',
      name: 'Corporate Bond Portfolio',
      category: 'Fixed Income',
      riskScore: 4.1,
      volatility: 8.7,
      concentration: 18.6,
      liquidity: 'Medium',
      creditRating: 'BBB+',
    },
    {
      id: '4',
      name: 'Gold Futures',
      category: 'Commodities',
      riskScore: 6.8,
      volatility: 22.1,
      concentration: 8.3,
      liquidity: 'High',
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'acknowledged': return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'resolved': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      default: return <InformationCircleIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return 'text-red-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-blue-600';
    return 'text-green-600';
  };

  const renderDashboardTab = () => (
    <div className="space-y-8">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Active Alerts</h3>
            <BellIcon className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-600 mb-2">
            {riskAlerts.filter(alert => alert.status === 'active').length}
          </div>
          <p className="text-sm text-gray-500">
            {riskAlerts.filter(alert => alert.actionRequired).length} require action
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Risk Score</h3>
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-2">6.5</div>
          <p className="text-sm text-gray-500">Medium risk level</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Compliance</h3>
            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">94%</div>
          <p className="text-sm text-gray-500">Risk limits compliance</p>
        </div>
      </div>

      {/* Risk Metrics Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Key Risk Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {riskMetrics.map((metric, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{metric.name}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(metric.status)}`}>
                  {metric.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  {metric.value}{metric.name.includes('Ratio') || metric.name.includes('Index') ? '' : '%'}
                </span>
                <span className="text-sm text-gray-500">
                  Limit: {metric.threshold}{metric.name.includes('Ratio') || metric.name.includes('Index') ? '' : '%'}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Updated: {formatDate(metric.lastUpdated)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
          <button
            onClick={() => setActiveTab('alerts')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {riskAlerts.slice(0, 3).map(alert => (
            <div key={alert.id} className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  {getStatusIcon(alert.status)}
                  <div className="ml-3">
                    <h4 className="text-sm font-medium">{alert.title}</h4>
                    <p className="text-sm mt-1">{alert.description}</p>
                    <p className="text-xs mt-2 opacity-75">{formatDate(alert.timestamp)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium">Severity: {alert.severity}/10</span>
                  {alert.actionRequired && (
                    <p className="text-xs mt-1 font-medium">Action Required</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAlertsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Risk Alerts</h3>
        <div className="flex space-x-2">
          <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
            <option value="">All Categories</option>
            <option value="market">Market Risk</option>
            <option value="credit">Credit Risk</option>
            <option value="operational">Operational Risk</option>
            <option value="liquidity">Liquidity Risk</option>
            <option value="concentration">Concentration Risk</option>
          </select>
          <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {riskAlerts.map(alert => (
          <div key={alert.id} className={`border rounded-lg p-6 ${getAlertColor(alert.type)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                {getStatusIcon(alert.status)}
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium">{alert.title}</h4>
                    <span className="text-sm font-medium">
                      {alert.category.charAt(0).toUpperCase() + alert.category.slice(1)} Risk
                    </span>
                  </div>
                  <p className="text-sm mt-2">{alert.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm">
                      <span className="font-medium">Severity:</span> {alert.severity}/10
                      {alert.actionRequired && (
                        <span className="ml-4 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                          Action Required
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-600">{formatDate(alert.timestamp)}</span>
                  </div>
                  
                  <div className="flex space-x-3 mt-4">
                    {alert.status === 'active' && (
                      <>
                        <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">
                          Acknowledge
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                          Resolve
                        </button>
                      </>
                    )}
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAssetsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Asset Risk Analysis</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Generate Risk Report
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volatility
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Concentration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Liquidity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assetRisks.map(asset => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                    {asset.creditRating && (
                      <div className="text-sm text-gray-500">Rating: {asset.creditRating}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {asset.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getRiskScoreColor(asset.riskScore)}`}>
                    {asset.riskScore}/10
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {asset.volatility}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {asset.concentration}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    asset.liquidity === 'High' ? 'bg-green-100 text-green-800' :
                    asset.liquidity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {asset.liquidity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    View Details
                  </button>
                  <button className="text-purple-600 hover:text-purple-900">
                    Risk Analysis
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Risk Thresholds</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {riskMetrics.map((metric, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {metric.name}
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  step="0.1"
                  defaultValue={metric.threshold}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">
                  Current: {metric.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Alert Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Email Notifications</span>
              <p className="text-sm text-gray-500">Receive alerts via email</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">SMS Alerts</span>
              <p className="text-sm text-gray-500">High severity alerts via SMS</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Real-time Dashboard</span>
              <p className="text-sm text-gray-500">Live updates on dashboard</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Save Settings
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <TopNavigation title="Risk Monitoring" />
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk Monitoring</h1>
            <p className="text-gray-600">Real-time portfolio risk monitoring and alert management</p>
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
            { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
            { id: 'alerts', name: 'Alerts', icon: BellIcon },
            { id: 'assets', name: 'Asset Analysis', icon: EyeIcon },
            { id: 'settings', name: 'Settings', icon: InformationCircleIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.name}
              {tab.id === 'alerts' && riskAlerts.filter(a => a.status === 'active').length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  {riskAlerts.filter(a => a.status === 'active').length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboardTab()}
      {activeTab === 'alerts' && renderAlertsTab()}
      {activeTab === 'assets' && renderAssetsTab()}
      {activeTab === 'settings' && renderSettingsTab()}
    </div>
  );
};

export default RiskMonitoring; 