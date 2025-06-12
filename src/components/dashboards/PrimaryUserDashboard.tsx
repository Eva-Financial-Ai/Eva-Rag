import {
  ArrowRightIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../../contexts/CustomerContext';
import { useUserType } from '../../contexts/UserTypeContext';
import { UserType } from '../../types/UserTypes';

// Import specialized dashboard components
// Temporarily commenting out missing role dashboards
// import AdminDashboard from './roles/AdminDashboard';
// import BrokerageDashboard from './roles/BrokerageDashboard';
import BusinessBorrowerDashboard from './roles/BusinessBorrowerDashboard';
// import DeveloperDashboard from './roles/DeveloperDashboard';
// import LenderDashboard from './roles/LenderDashboard';
// import VendorDashboard from './roles/VendorDashboard';

// Use RoleBasedDashboard as fallback
import RoleBasedDashboard from './RoleBasedDashboard';

// Core dashboard data interfaces
interface DashboardMetrics {
  transactions: {
    total: number;
    pending: number;
    approved: number;
    denied: number;
    totalValue: number;
  };
  evaScores: {
    averageScore: number;
    highRiskCount: number;
    lowRiskCount: number;
    pendingAnalysis: number;
  };
  customers: {
    total: number;
    active: number;
    newThisMonth: number;
    highValue: number;
  };
  performance: {
    processingTime: number;
    approvalRate: number;
    satisfactionScore: number;
    revenue: number;
  };
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  badge?: string;
  disabled?: boolean;
}

interface DashboardAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
}

interface PrimaryUserDashboardProps {
  className?: string;
}

const PrimaryUserDashboard: React.FC<PrimaryUserDashboardProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { userType, specificRole, getUserTypeDisplayName } = useUserType();
  const { activeCustomer, selectedCustomer } = useCustomer();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Get user-specific dashboard configuration
  const dashboardConfig = useMemo(() => {
    const baseConfig = {
      title: `${getUserTypeDisplayName()} Dashboard`,
      subtitle: 'Your financial operations overview',
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
    };

    switch (userType) {
      case UserType.BUSINESS:
        return {
          ...baseConfig,
          title: 'Business Borrower Dashboard',
          subtitle: 'Manage your loan applications and credit profile',
          primaryColor: '#059669',
          features: ['applications', 'credit-monitoring', 'document-uploads', 'eva-scores'],
        };
      case UserType.LENDER:
        return {
          ...baseConfig,
          title: 'Lender Operations Dashboard',
          subtitle: 'Oversee lending portfolio and risk management',
          primaryColor: '#dc2626',
          features: [
            'portfolio-management',
            'risk-assessment',
            'eva-analytics',
            'customer-insights',
          ],
        };
      case UserType.BROKERAGE:
        return {
          ...baseConfig,
          title: 'Brokerage Dashboard',
          subtitle: 'Connect borrowers with optimal lending solutions',
          primaryColor: '#7c3aed',
          features: ['deal-pipeline', 'lender-network', 'commission-tracking', 'client-management'],
        };
      case UserType.VENDOR:
        return {
          ...baseConfig,
          title: 'Vendor Services Dashboard',
          subtitle: 'Manage asset-backed lending services',
          primaryColor: '#ea580c',
          features: ['asset-valuation', 'inspection-reports', 'vendor-network', 'service-requests'],
        };
      case UserType.ADMIN:
        return {
          ...baseConfig,
          title: 'System Administration',
          subtitle: 'Platform oversight and system management',
          primaryColor: '#1f2937',
          features: [
            'user-management',
            'system-monitoring',
            'compliance-oversight',
            'platform-analytics',
          ],
        };
      case UserType.DEVELOPER:
        return {
          ...baseConfig,
          title: 'Developer Console',
          subtitle: 'API monitoring and development tools',
          primaryColor: '#0891b2',
          features: [
            'api-metrics',
            'error-monitoring',
            'performance-analysis',
            'deployment-status',
          ],
        };
      default:
        return baseConfig;
    }
  }, [userType, getUserTypeDisplayName]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Simulate API call - replace with actual data loading
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock data based on user type and selected customer
        const mockMetrics: DashboardMetrics = {
          transactions: {
            total: userType === UserType.BUSINESS ? 5 : 247,
            pending: userType === UserType.BUSINESS ? 2 : 34,
            approved: userType === UserType.BUSINESS ? 3 : 189,
            denied: userType === UserType.BUSINESS ? 0 : 24,
            totalValue: userType === UserType.BUSINESS ? 750000 : 12450000,
          },
          evaScores: {
            averageScore: userType === UserType.BUSINESS ? 728 : 695,
            highRiskCount: userType === UserType.BUSINESS ? 0 : 15,
            lowRiskCount: userType === UserType.BUSINESS ? 3 : 142,
            pendingAnalysis: userType === UserType.BUSINESS ? 1 : 8,
          },
          customers: {
            total: userType === UserType.BUSINESS ? 1 : 89,
            active: userType === UserType.BUSINESS ? 1 : 67,
            newThisMonth: userType === UserType.BUSINESS ? 0 : 12,
            highValue: userType === UserType.BUSINESS ? 1 : 23,
          },
          performance: {
            processingTime: userType === UserType.BUSINESS ? 2.5 : 4.2,
            approvalRate: userType === UserType.BUSINESS ? 100 : 76.5,
            satisfactionScore: userType === UserType.BUSINESS ? 4.8 : 4.6,
            revenue: userType === UserType.BUSINESS ? 0 : 2450000,
          },
        };

        setMetrics(mockMetrics);

        // Set user-specific alerts
        const mockAlerts: DashboardAlert[] = [
          {
            id: '1',
            type: 'info',
            title: 'EVA Analysis Complete',
            message: selectedCustomer
              ? `Credit analysis completed for ${selectedCustomer.display_name}. Score: 742 (Excellent)`
              : 'New EVA analysis results available for review.',
            action: {
              label: 'View Report',
              onClick: () => navigate('/eva-reports'),
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          },
        ];

        if (userType === UserType.BUSINESS) {
          mockAlerts.unshift({
            id: '2',
            type: 'warning',
            title: 'Document Required',
            message: 'Please upload your recent tax returns to complete your application.',
            action: {
              label: 'Upload Now',
              onClick: () => navigate('/documents'),
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          });
        }

        setAlerts(mockAlerts);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userType, selectedCustomer, selectedTimeframe, navigate]);

  // Quick actions based on user type
  const quickActions = useMemo((): QuickAction[] => {
    const baseActions: QuickAction[] = [];

    switch (userType) {
      case UserType.BUSINESS:
        return [
          {
            id: 'new-application',
            title: 'New Loan Application',
            description: 'Start a new financing application',
            icon: PlusIcon,
            color: 'bg-green-500',
            action: () => navigate('/applications/new'),
          },
          {
            id: 'check-eva-score',
            title: 'Check EVA Score',
            description: 'View your current credit analysis',
            icon: ChartBarIcon,
            color: 'bg-blue-500',
            action: () => navigate('/eva-scores'),
            badge: 'Updated',
          },
          {
            id: 'upload-documents',
            title: 'Upload Documents',
            description: 'Submit required documentation',
            icon: DocumentTextIcon,
            color: 'bg-orange-500',
            action: () => navigate('/documents'),
            badge: '2 Pending',
          },
          {
            id: 'view-offers',
            title: 'View Loan Offers',
            description: 'See available financing options',
            icon: CurrencyDollarIcon,
            color: 'bg-purple-500',
            action: () => navigate('/offers'),
          },
        ];

      case UserType.LENDER:
        return [
          {
            id: 'review-applications',
            title: 'Review Applications',
            description: 'Process pending loan applications',
            icon: DocumentTextIcon,
            color: 'bg-red-500',
            action: () => navigate('/applications/pending'),
            badge: metrics?.transactions.pending.toString(),
          },
          {
            id: 'eva-analytics',
            title: 'EVA Analytics',
            description: 'Advanced risk assessment tools',
            icon: ChartBarIcon,
            color: 'bg-blue-500',
            action: () => navigate('/eva-analytics'),
          },
          {
            id: 'portfolio-overview',
            title: 'Portfolio Overview',
            description: 'Monitor lending portfolio',
            icon: ArrowTrendingUpIcon,
            color: 'bg-green-500',
            action: () => navigate('/portfolio'),
          },
          {
            id: 'risk-monitoring',
            title: 'Risk Monitoring',
            description: 'Track high-risk accounts',
            icon: ExclamationTriangleIcon,
            color: 'bg-yellow-500',
            action: () => navigate('/risk-monitoring'),
            badge: metrics?.evaScores.highRiskCount.toString(),
          },
        ];

      case UserType.BROKERAGE:
        return [
          {
            id: 'new-deal',
            title: 'New Deal',
            description: 'Create a new brokerage deal',
            icon: PlusIcon,
            color: 'bg-purple-500',
            action: () => navigate('/deals/new'),
          },
          {
            id: 'lender-matching',
            title: 'Lender Matching',
            description: 'Find optimal lenders for clients',
            icon: UsersIcon,
            color: 'bg-blue-500',
            action: () => navigate('/lender-matching'),
          },
          {
            id: 'commission-tracker',
            title: 'Commission Tracker',
            description: 'Track earnings and payouts',
            icon: CurrencyDollarIcon,
            color: 'bg-green-500',
            action: () => navigate('/commissions'),
          },
          {
            id: 'client-pipeline',
            title: 'Client Pipeline',
            description: 'Manage client relationships',
            icon: ArrowTrendingUpIcon,
            color: 'bg-orange-500',
            action: () => navigate('/clients'),
          },
        ];

      default:
        return baseActions;
    }
  }, [userType, navigate, metrics]);

  // Render role-specific dashboard
  const renderRoleSpecificDashboard = () => {
    const props = { metrics, alerts, quickActions, selectedCustomer, activeCustomer };

    switch (userType) {
      case UserType.BUSINESS:
        return <BusinessBorrowerDashboard {...props} />;
      case UserType.LENDER:
        return <RoleBasedDashboard />;
      case UserType.BROKERAGE:
        return <RoleBasedDashboard />;
      case UserType.VENDOR:
        return <RoleBasedDashboard />;
      case UserType.ADMIN:
        return <RoleBasedDashboard />;
      case UserType.DEVELOPER:
        return <RoleBasedDashboard />;
      default:
        return <div>Dashboard not configured for this user type</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 min-h-screen ${className}`}>
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-2xl font-bold text-gray-900"
              style={{ color: dashboardConfig.primaryColor }}
            >
              {dashboardConfig.title}
            </h1>
            <p className="text-sm text-gray-600">{dashboardConfig.subtitle}</p>
            {(selectedCustomer || activeCustomer) && (
              <div className="mt-2 flex items-center">
                <span className="text-sm text-gray-500">Active Customer:</span>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {(selectedCustomer || activeCustomer)?.display_name}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center space-x-4 sm:mt-0">
            {/* Timeframe Selector */}
            <select
              value={selectedTimeframe}
              onChange={e => setSelectedTimeframe(e.target.value as any)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            <button
              onClick={() => navigate('/settings')}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              <CogIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="p-6">
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-3">
            {alerts.slice(0, 3).map(alert => (
              <div
                key={alert.id}
                className={`rounded-lg border p-4 ${
                  alert.type === 'error'
                    ? 'bg-red-50 border-red-200'
                    : alert.type === 'warning'
                      ? 'border-yellow-200 bg-yellow-50'
                      : alert.type === 'success'
                        ? 'border-green-200 bg-green-50'
                        : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex justify-between">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {alert.type === 'error' ? (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                      ) : alert.type === 'warning' ? (
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                      ) : alert.type === 'success' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      ) : (
                        <ClockIcon className="h-5 w-5 text-blue-400" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium">{alert.title}</h3>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                  </div>
                  {alert.action && (
                    <button
                      onClick={alert.action.onClick}
                      className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      {alert.action.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={action.action}
                disabled={action.disabled}
                className="bg-white relative rounded-lg border border-gray-200 p-4 text-left hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-start">
                  <div className={`rounded-lg p-2 ${action.color}`}>
                    <action.icon className="text-white h-6 w-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                  {action.badge && (
                    <span className="text-white bg-red-500 absolute -right-2 -top-2 rounded-full px-2 py-1 text-xs">
                      {action.badge}
                    </span>
                  )}
                </div>
                <ArrowRightIcon className="absolute bottom-4 right-4 h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Role-Specific Dashboard Content */}
        {renderRoleSpecificDashboard()}
      </div>
    </div>
  );
};

export default PrimaryUserDashboard;
