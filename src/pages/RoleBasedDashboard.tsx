import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserPermissions, UserRole } from '../hooks/useUserPermissions';
import { useRenderTracker } from '../hooks/useDebugEffect';
import { useSafeNavigate } from '../hooks/useSafeNavigate';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

interface DashboardMetric {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

interface Transaction {
  id: string;
  name: string;
  amount: number;
  status: string;
  date: string;
  type: string;
  progress: number;
}

// Define role-specific data structure
interface RoleData {
  metrics: DashboardMetric[];
  recentTransactions: Transaction[];
}

// Role-specific dashboard data
const ROLE_SPECIFIC_DATA: Record<string, RoleData> = {
  borrower: {
    metrics: [
            {
              label: 'Active Applications',
        value: '3',
        change: 2,
              icon: <DocumentTextIcon className="h-6 w-6" />,
        color: 'blue'
      },
      {
        label: 'Approved Amount',
        value: '$250,000',
        change: 15,
              icon: <CurrencyDollarIcon className="h-6 w-6" />,
        color: 'green'
      },
      {
        label: 'Credit Score',
        value: '742',
        change: 5,
              icon: <ChartBarIcon className="h-6 w-6" />,
        color: 'purple'
      },
      {
        label: 'Pending Reviews',
        value: '2',
        change: -1,
              icon: <ClockIcon className="h-6 w-6" />,
        color: 'yellow'
      }
    ],
    recentTransactions: [
      {
        id: 'TX-001',
        name: 'Equipment Financing',
        amount: 150000,
        status: 'Under Review',
        date: '2024-01-15',
        type: 'Equipment Loan',
        progress: 75
      },
      {
        id: 'TX-002',
        name: 'Working Capital',
        amount: 100000,
        status: 'Documentation',
        date: '2024-01-10',
        type: 'Line of Credit',
        progress: 45
      }
    ]
  },
  lender: {
    metrics: [
      {
        label: 'Total Portfolio',
        value: '$2.5M',
              change: 8,
              icon: <CurrencyDollarIcon className="h-6 w-6" />,
        color: 'green'
            },
            {
              label: 'Active Loans',
        value: '24',
        change: 3,
              icon: <DocumentTextIcon className="h-6 w-6" />,
        color: 'blue'
            },
            {
              label: 'Default Rate',
        value: '2.1%',
        change: -0.5,
              icon: <ExclamationTriangleIcon className="h-6 w-6" />,
        color: 'red'
      },
      {
        label: 'Monthly Yield',
        value: '8.5%',
        change: 1.2,
              icon: <ArrowTrendingUpIcon className="h-6 w-6" />,
        color: 'emerald'
      }
    ],
    recentTransactions: [
      {
        id: 'TX-003',
        name: 'Tech Startup Funding',
        amount: 500000,
        status: 'Underwriting',
        date: '2024-01-18',
        type: 'Term Loan',
        progress: 60
      },
      {
        id: 'TX-004',
        name: 'Real Estate Bridge',
        amount: 750000,
        status: 'Credit Review',
        date: '2024-01-16',
        type: 'Bridge Loan',
        progress: 30
      }
    ]
  },
  broker: {
    metrics: [
      {
        label: 'Active Deals',
        value: '12',
        change: 4,
        icon: <BriefcaseIcon className="h-6 w-6" />,
        color: 'blue'
      },
      {
        label: 'Commission Earned',
        value: '$45,600',
        change: 12,
        icon: <CurrencyDollarIcon className="h-6 w-6" />,
        color: 'green'
      },
      {
        label: 'Success Rate',
        value: '87%',
        change: 3,
              icon: <CheckCircleIcon className="h-6 w-6" />,
        color: 'emerald'
      },
      {
        label: 'Avg. Deal Size',
        value: '$185K',
        change: 8,
              icon: <ChartBarIcon className="h-6 w-6" />,
        color: 'purple'
      }
    ],
    recentTransactions: [
      {
        id: 'TX-005',
        name: 'Manufacturing Expansion',
        amount: 300000,
        status: 'Risk Assessment',
        date: '2024-01-20',
        type: 'SBA Loan',
        progress: 85
      },
      {
        id: 'TX-006',
        name: 'Retail Acquisition',
        amount: 200000,
        status: 'Lender Matching',
        date: '2024-01-17',
        type: 'Acquisition Loan',
        progress: 50
      }
    ]
  },
  vendor: {
    metrics: [
      {
        label: 'Active Partnerships',
        value: '8',
        change: 2,
              icon: <UserGroupIcon className="h-6 w-6" />,
        color: 'blue'
      },
      {
        label: 'Monthly Revenue',
        value: '$18,500',
        change: 15,
              icon: <CurrencyDollarIcon className="h-6 w-6" />,
        color: 'green'
      },
      {
        label: 'Service Rating',
              value: '4.8/5',
              change: 0.2,
              icon: <CheckCircleIcon className="h-6 w-6" />,
        color: 'emerald'
      },
      {
        label: 'Completion Rate',
        value: '94%',
        change: 1,
        icon: <ChartBarIcon className="h-6 w-6" />,
        color: 'purple'
      }
    ],
    recentTransactions: [
      {
        id: 'TX-007',
        name: 'Document Verification',
        amount: 2500,
        status: 'Term Negotiation',
        date: '2024-01-19',
        type: 'Service Fee',
        progress: 90
      },
      {
        id: 'TX-008',
        name: 'Risk Assessment Report',
        amount: 1800,
        status: 'Finance Pending',
        date: '2024-01-14',
        type: 'Consulting Fee',
        progress: 95
      }
    ]
  }
};

const RoleBasedDashboard: React.FC = () => {
  // Add render tracking for debugging
  const renderStats = useRenderTracker('RoleBasedDashboard');
  
  const navigate = useNavigate();
  const { safeNavigate } = useSafeNavigate();
  const { currentRole, getBaseUserType, getRoleDisplayName } = useUserPermissions();
  
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardTitle, setDashboardTitle] = useState('Dashboard');
  const [dashboardSubtitle, setDashboardSubtitle] = useState('');
  const [roleUpdateKey, setRoleUpdateKey] = useState(0);

  // Memoize expensive computations
  const dashboardTitleMemo = useMemo(() => {
    const roleDisplayName = getRoleDisplayName(currentRole);
    return `${roleDisplayName} Dashboard`;
  }, [currentRole, getRoleDisplayName]);

  // Memoize data fetching functions
  const getMetrics = useCallback((): DashboardMetric[] => {
    
    
    const baseType = getBaseUserType(currentRole);
    const roleSpecificData = ROLE_SPECIFIC_DATA[baseType] || ROLE_SPECIFIC_DATA.borrower;
    
    return roleSpecificData.metrics;
  }, [currentRole, getBaseUserType]);

  const getTransactions = useCallback((): Transaction[] => {
    

      const baseType = getBaseUserType(currentRole);
    const roleSpecificData = ROLE_SPECIFIC_DATA[baseType] || ROLE_SPECIFIC_DATA.borrower;
    
    return roleSpecificData.recentTransactions;
  }, [currentRole, getBaseUserType]);

  // Handle role changes with proper cleanup
  useEffect(() => {
    let isMounted = true;
    
    const handleRoleChange = (event?: any) => {
      if (!isMounted) return;
      
      
      setRoleUpdateKey(prev => prev + 1);
      setLoading(true);
    };

    // Listen for both custom events and storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (!isMounted) return;
      
      if (e.key === 'userRole') {
        
        handleRoleChange();
      }
    };

    window.addEventListener('userRoleChange', handleRoleChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener('userRoleChange', handleRoleChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Only run once on mount

  // Load data when role changes
  useEffect(() => {
    let isMounted = true;
    
    const loadDashboardData = async () => {
      if (!isMounted) return;
      
      
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!isMounted) return;
      
      // Get new metrics and transactions
      const newMetrics = getMetrics();
      const newTransactions = getTransactions();

      
      

      setMetrics(newMetrics);
      setRecentTransactions(newTransactions);
      
      // Small delay for UX
      setTimeout(() => {
        if (isMounted) {
      setLoading(false);
    }
      }, 200);
    };

    loadDashboardData();
    
    return () => {
      isMounted = false;
    };
  }, [currentRole, getMetrics, getTransactions, roleUpdateKey]);

  // Memoize the metric click handler
  const handleMetricClick = useCallback((id: string) => {
    
    
    const routes: Record<string, string> = {
      'total-applications': '/credit-application',
      'pending-approvals': '/credit-application?tab=pending',
      'approved-loans': '/credit-application?tab=approved',
      'portfolio-value': '/portfolio-wallet',
      'active-deals': '/deal-structuring',
      'risk-score': '/risk-assessment',
      'monthly-volume': '/transaction-explorer',
      'client-satisfaction': '/customer-retention',
      'revenue-growth': '/portfolio-analytics',
      'market-performance': '/commercial-market'
    };
    
    const targetRoute = routes[id];
    if (targetRoute) {
      safeNavigate(targetRoute);
    }
  }, [safeNavigate]);

  // Memoize the transaction click handler  
  const handleTransactionClick = useCallback((id: string) => {
    
    safeNavigate(`/transaction-explorer?id=${id}`);
  }, [safeNavigate]);

  const getMetricColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
      purple: 'bg-purple-100 text-purple-800',
      emerald: 'bg-emerald-100 text-emerald-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    return colorMap[color] || colorMap.gray;
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      'Under Review': 'bg-blue-100 text-blue-800',
      Documentation: 'bg-yellow-100 text-yellow-800',
      Underwriting: 'bg-purple-100 text-purple-800',
      'Credit Review': 'bg-indigo-100 text-indigo-800',
      'Risk Assessment': 'bg-orange-100 text-orange-800',
      'Lender Matching': 'bg-cyan-100 text-cyan-800',
      'Term Negotiation': 'bg-teal-100 text-teal-800',
      'Finance Pending': 'bg-amber-100 text-amber-800',
      'Contract Review': 'bg-lime-100 text-lime-800',
      Approved: 'bg-green-100 text-green-800',
      Funded: 'bg-emerald-100 text-emerald-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  const baseUserType = getBaseUserType(currentRole);

  return (
    <div className="space-y-6">
      {/* Debug Section - can be removed after fixing */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm">
            <strong>Debug Info:</strong> Role: {currentRole || 'None'} | 
            Title: {dashboardTitle} | 
            Update Key: {roleUpdateKey} | 
            Loading: {loading ? 'Yes' : 'No'}
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{dashboardTitle}</h1>
            <p className="mt-2 text-gray-600">{dashboardSubtitle}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Welcome back!</p>
            <p className="text-lg font-semibold text-gray-900">
              {getRoleDisplayName(currentRole || UserRole.BORROWER)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${getMetricColorClasses(metric.color)}`}>
                {metric.icon}
              </div>
              {metric.change !== undefined && (
                <span
                  className={`text-sm font-medium ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {metric.change > 0 ? '+' : ''}
                  {metric.change}%
                </span>
              )}
            </div>
            <p className="mt-4 text-2xl font-semibold text-gray-900">{metric.value}</p>
            <p className="text-sm text-gray-500">{metric.label}</p>
          </div>
        ))}
      </div>

      {recentTransactions.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTransactions.map(transaction => (
              <div
                key={transaction.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleTransactionClick(transaction.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{transaction.name}</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${transaction.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">{transaction.id}</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{transaction.date}</span>
                    </div>
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${transaction.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-gray-50 text-center">
            <button
              onClick={() => handleTransactionClick('all')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all transactions →
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {baseUserType === 'borrower' && (
            <>
              <button
                onClick={() => handleMetricClick('total-applications')}
                className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <DocumentTextIcon className="h-8 w-8 mx-auto text-primary-600" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  New Application
                </span>
              </button>
              <button
                onClick={() => handleMetricClick('pending-approvals')}
                className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <DocumentTextIcon className="h-8 w-8 mx-auto text-primary-600" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Pending Approvals
                </span>
              </button>
            </>
          )}
          {baseUserType === 'lender' && (
            <>
              <button
                onClick={() => handleMetricClick('risk-score')}
                className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <ChartBarIcon className="h-8 w-8 mx-auto text-primary-600" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Risk Assessment
                </span>
              </button>
              <button
                onClick={() => handleMetricClick('portfolio-value')}
                className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <BriefcaseIcon className="h-8 w-8 mx-auto text-primary-600" />
                <span className="mt-2 block text-sm font-medium text-gray-900">Portfolio</span>
              </button>
            </>
          )}
          {baseUserType === 'broker' && (
            <>
              <button
                onClick={() => handleMetricClick('active-deals')}
                className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <BuildingOfficeIcon className="h-8 w-8 mx-auto text-primary-600" />
                <span className="mt-2 block text-sm font-medium text-gray-900">Smart Match</span>
              </button>
              <button
                onClick={() => handleMetricClick('client-satisfaction')}
                className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <UserGroupIcon className="h-8 w-8 mx-auto text-primary-600" />
                <span className="mt-2 block text-sm font-medium text-gray-900">Customers</span>
              </button>
            </>
          )}
          {baseUserType === 'vendor' && (
            <>
              <button
                onClick={() => handleMetricClick('market-performance')}
                className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <BuildingOfficeIcon className="h-8 w-8 mx-auto text-primary-600" />
                <span className="mt-2 block text-sm font-medium text-gray-900">List Asset</span>
              </button>
              <button
                onClick={() => handleMetricClick('revenue-growth')}
                className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <ChartBarIcon className="h-8 w-8 mx-auto text-primary-600" />
                <span className="mt-2 block text-sm font-medium text-gray-900">Marketplace</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Your Access Level</h3>
            <p className="mt-1 text-sm text-blue-700">
              As a {getRoleDisplayName(currentRole)}, you have access to {baseUserType}-specific
              features and data. Your permissions are tailored to your role within the organization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedDashboard;
