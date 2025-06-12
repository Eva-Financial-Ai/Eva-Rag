import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { mockActivities } from '../api/mockData';
import TransactionSelector from '../components/common/TransactionSelector';
import { DealProgressCard } from '../components/dashboard/DealProgressCard';
import { DueDiligenceProgress } from '../components/dashboard/DueDiligenceProgress';
import FundingTrendsChart from '../components/dashboard/FundingTrendsChart';
import { MetricCard } from '../components/dashboard/MetricCard';
import { useUserType } from '../contexts/UserTypeContext';
import { useWorkflow } from '../contexts/WorkflowContext';
import { useUserPermissions } from '../hooks/useUserPermissions';
import { UserType } from '../types/UserTypes';

import { debugLog } from '../utils/auditLogger';

// Enhanced Mock Data with Deal Types
enum DealType {
  GENERAL = 'general_purpose',
  EQUIPMENT_VEHICLES = 'equipment_vehicles',
  REAL_ESTATE = 'real_estate',
  WORKING_CAPITAL = 'working_capital',
  INVENTORY_FINANCING = 'inventory_financing',
}

// Type for Trend
type Trend = 'up' | 'down' | 'stable';

// Mock metrics data for dashboard - now properly typed for different user types
const getUserTypeMetrics = (userType: UserType) => {
  switch (userType) {
    case UserType.LENDER:
      return {
        activeDeals: 24,
        dealVolume: 5250000,
        avgProcessingTime: 15.2,
        completedDeals: 18,
        monthlyChange: 22,
        title: 'Lender Dashboard',
        subtitle: 'Manage your lending portfolio and applications',
      };
    case UserType.BUSINESS:
      return {
        activeDeals: 3,
        dealVolume: 750000,
        avgProcessingTime: 22.5,
        completedDeals: 2,
        monthlyChange: 10,
        title: 'Business Dashboard',
        subtitle: 'Track your applications and funding opportunities',
      };
    case UserType.BROKERAGE:
      return {
        activeDeals: 18,
        dealVolume: 3850000,
        avgProcessingTime: 16.8,
        completedDeals: 12,
        monthlyChange: 18,
        title: 'Broker Dashboard',
        subtitle: 'Manage client applications and lender connections',
      };
    case UserType.VENDOR:
      return {
        activeDeals: 9,
        dealVolume: 1250000,
        avgProcessingTime: 19.3,
        completedDeals: 5,
        monthlyChange: 14,
        title: 'Vendor Dashboard',
        subtitle: 'Track vendor financing and partnership opportunities',
      };
    default:
      return {
        activeDeals: 12,
        dealVolume: 2750000,
        avgProcessingTime: 18.5,
        completedDeals: 8,
        monthlyChange: 15,
        title: 'Dashboard',
        subtitle: 'Overview of your activities',
      };
  }
};

// Mock transaction data
const baseMockTransactions = [
  {
    id: 'TX-12345',
    name: 'Equipment Financing - QRS Manufacturing',
    amount: 250000,
    date: '2023-04-15',
    status: 'Document Collection',
    statusColor: 'blue',
    progress: 20,
    type: DealType.EQUIPMENT_VEHICLES,
    assignee: {
      name: 'Alex Morgan',
      avatar: '/avatars/user1.jpg',
    },
  },
  {
    id: 'TX-12346',
    name: 'Working Capital - ABC Corp',
    amount: 100000,
    date: '2023-04-10',
    status: 'Risk Assessment',
    statusColor: 'yellow',
    progress: 40,
    type: DealType.WORKING_CAPITAL,
    assignee: {
      name: 'Jamie Smith',
      avatar: '/avatars/user2.jpg',
    },
  },
  {
    id: 'TX-12347',
    name: 'Real Estate - XYZ Properties',
    amount: 750000,
    date: '2023-04-05',
    status: 'Transaction Structuring',
    statusColor: 'purple',
    progress: 60,
    type: DealType.REAL_ESTATE,
    assignee: {
      name: 'Taylor Jones',
      avatar: '/avatars/user3.jpg',
    },
  },
  {
    id: 'TX-12348',
    name: 'Expansion Loan - LMN Enterprises',
    amount: 500000,
    date: '2023-03-28',
    status: 'Document Execution',
    statusColor: 'green',
    progress: 80,
    type: DealType.GENERAL,
    assignee: {
      name: 'Riley Johnson',
      avatar: '/avatars/user4.jpg',
    },
  },
  {
    id: 'TX-12349',
    name: 'Inventory Financing - EFG Retail',
    amount: 175000,
    date: '2023-03-20',
    status: 'Funding',
    statusColor: 'indigo',
    progress: 90,
    type: DealType.INVENTORY_FINANCING,
    assignee: {
      name: 'Casey Wilson',
      avatar: '/avatars/user5.jpg',
    },
  },
];

// Get user-specific transaction data
const getUserTypeTransactions = (userType: UserType) => {
  switch (userType) {
    case UserType.LENDER:
      return [
        ...baseMockTransactions,
        {
          id: 'TX-12350',
          name: 'Commercial Mortgage - Office Complex',
          amount: 1250000,
          date: '2023-04-18',
          status: 'Underwriting',
          statusColor: 'indigo',
          progress: 45,
          type: DealType.REAL_ESTATE,
          assignee: {
            name: 'Taylor Wilson',
            avatar: '/avatars/user6.jpg',
          },
        },
      ];
    case UserType.BUSINESS:
      return [
        {
          id: 'TX-12352',
          name: 'Equipment Lease - CNC Machine',
          amount: 120000,
          date: '2023-04-14',
          status: 'Application Review',
          statusColor: 'blue',
          progress: 15,
          type: DealType.EQUIPMENT_VEHICLES,
          assignee: {
            name: 'Morgan Chase',
            avatar: '/avatars/user8.jpg',
          },
        },
        {
          id: 'TX-12353',
          name: 'Working Capital Loan',
          amount: 75000,
          date: '2023-04-12',
          status: 'Approved',
          statusColor: 'green',
          progress: 95,
          type: DealType.WORKING_CAPITAL,
          assignee: {
            name: 'Jamie Rivers',
            avatar: '/avatars/user9.jpg',
          },
        },
      ];
    case UserType.BROKERAGE:
      return baseMockTransactions.slice(0, 4); // Show first 4 transactions
    case UserType.VENDOR:
      return baseMockTransactions.slice(1, 3); // Show middle 2 transactions
    default:
      return baseMockTransactions;
  }
};

// Mock due diligence data with proper Trend type
const mockDueDiligence = [
  { category: 'Financial', completed: 8, total: 10, trend: 'up' as Trend },
  { category: 'Legal', completed: 5, total: 6, trend: 'stable' as Trend },
  { category: 'Operational', completed: 7, total: 12, trend: 'down' as Trend },
  { category: 'Market', completed: 4, total: 8, trend: 'up' as Trend },
  { category: 'Management', completed: 6, total: 6, trend: 'up' as Trend },
];

// Enhanced mock chart data with deal types
const mockChartDataByMonth = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Equipment & Vehicles',
      data: [350000, 580000, 420000, 620000, 790000, 680000],
      backgroundColor: 'rgba(16, 185, 129, 0.2)', // green
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 2,
      tension: 0.4,
    },
    {
      label: 'Real Estate',
      data: [650000, 980000, 820000, 1100000, 1350000, 1250000],
      backgroundColor: 'rgba(79, 70, 229, 0.2)', // indigo
      borderColor: 'rgba(79, 70, 229, 1)',
      borderWidth: 2,
      tension: 0.4,
    },
    {
      label: 'General Funding',
      data: [200000, 340000, 260000, 480000, 560000, 570000],
      backgroundColor: 'rgba(245, 158, 11, 0.2)', // amber
      borderColor: 'rgba(245, 158, 11, 1)',
      borderWidth: 2,
      tension: 0.4,
    },
  ],
};

// Mock chart data by year quarters
const mockChartDataByQuarter = {
  labels: ['Q1 2022', 'Q2 2022', 'Q3 2022', 'Q4 2022', 'Q1 2023', 'Q2 2023'],
  datasets: [
    {
      label: 'Equipment & Vehicles',
      data: [1350000, 1580000, 1720000, 1950000, 2100000, 2250000],
      backgroundColor: 'rgba(16, 185, 129, 0.2)', // green
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 2,
      tension: 0.4,
    },
    {
      label: 'Real Estate',
      data: [2450000, 2580000, 2620000, 2800000, 3100000, 3250000],
      backgroundColor: 'rgba(79, 70, 229, 0.2)', // indigo
      borderColor: 'rgba(79, 70, 229, 1)',
      borderWidth: 2,
      tension: 0.4,
    },
    {
      label: 'General Funding',
      data: [800000, 940000, 1060000, 1180000, 1250000, 1350000],
      backgroundColor: 'rgba(245, 158, 11, 0.2)', // amber
      borderColor: 'rgba(245, 158, 11, 1)',
      borderWidth: 2,
      tension: 0.4,
    },
  ],
};

// Mock chart data by year
const mockChartDataByYear = {
  labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
  datasets: [
    {
      label: 'Equipment & Vehicles',
      data: [4500000, 5200000, 4800000, 6100000, 7200000, 8100000],
      backgroundColor: 'rgba(16, 185, 129, 0.2)', // green
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 2,
      tension: 0.4,
    },
    {
      label: 'Real Estate',
      data: [8200000, 8900000, 8100000, 9500000, 10500000, 12000000],
      backgroundColor: 'rgba(79, 70, 229, 0.2)', // indigo
      borderColor: 'rgba(79, 70, 229, 1)',
      borderWidth: 2,
      tension: 0.4,
    },
    {
      label: 'General Funding',
      data: [3100000, 3400000, 3200000, 3800000, 4200000, 4600000],
      backgroundColor: 'rgba(245, 158, 11, 0.2)', // amber
      borderColor: 'rgba(245, 158, 11, 1)',
      borderWidth: 2,
      tension: 0.4,
    },
  ],
};

// Dashboard component implementation
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams<{ userId?: string }>();
  const { permissions } = useUserPermissions();
  const { userType } = useUserType(); // Get current user type
  const { currentTransaction } = useWorkflow();

  // State for dashboard data that updates based on user type
  const [metrics, setMetrics] = useState(() => getUserTypeMetrics(userType));
  const [transactions, setTransactions] = useState(() => getUserTypeTransactions(userType));
  const [activities] = useState(mockActivities);
  const [dueDiligenceData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedTransactionType, setSelectedTransactionType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Update metrics and transactions when user type changes
  useEffect(() => {
    debugLog('general', 'log_statement', 'Dashboard: User type changed to:', userType)
    const newMetrics = getUserTypeMetrics(userType);
    const newTransactions = getUserTypeTransactions(userType);

    setMetrics(newMetrics);
    setTransactions(newTransactions);
  }, [userType]);

  // Listen for storage changes (user type changes from other components)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userType' && e.newValue) {
        const newUserType = e.newValue as UserType;
        setMetrics(getUserTypeMetrics(newUserType));
        setTransactions(getUserTypeTransactions(newUserType));
      }
    };

    const handleRoleChange = (e: CustomEvent) => {
      debugLog('general', 'log_statement', 'Dashboard: Role change event received:', e.detail)
      if (e.detail && e.detail.userType) {
        setMetrics(getUserTypeMetrics(e.detail.userType));
        setTransactions(getUserTypeTransactions(e.detail.userType));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userTypeChanged', handleRoleChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userTypeChanged', handleRoleChange as EventListener);
    };
  }, []);

  // Render the dashboard content based on user type
  return (
    <div className="eva-dashboard-container eva-no-large-gaps">
      {isLoading && (
        <div className="eva-card-container text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p>Loading dashboard data...</p>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Dashboard Header with Transaction Selector */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{metrics.title}</h1>
              <p className="text-gray-600">{metrics.subtitle}</p>
            </div>
            <div className="flex items-center space-x-4">
              <TransactionSelector />
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="eva-dashboard-metrics">
            <MetricCard
              title={metrics.title}
              subtitle={metrics.subtitle}
              value={metrics.activeDeals.toString()}
              trend={{
                direction: metrics.monthlyChange > 0 ? 'up' : 'down',
                value: Math.abs(metrics.monthlyChange).toString(),
                text: `${Math.abs(metrics.monthlyChange)}% from last month`,
              }}
              icon="📊"
            />
            <MetricCard
              title="Deal Volume"
              subtitle="Total funding processed"
              value={`$${(metrics.dealVolume / 1000000).toFixed(1)}M`}
              trend={{
                direction: metrics.monthlyChange > 0 ? 'up' : 'down',
                value: Math.abs(metrics.monthlyChange).toString(),
                text: `${Math.abs(metrics.monthlyChange)}% from last month`,
              }}
              icon="💰"
            />
            <MetricCard
              title="Avg Processing Time"
              subtitle="From application to funding"
              value={`${metrics.avgProcessingTime} days`}
              trend={{
                direction: 'down',
                value: '5',
                text: '5 days improvement',
              }}
              icon="⏱️"
            />
            <MetricCard
              title="Completed Deals"
              subtitle="Successfully funded transactions"
              value={metrics.completedDeals.toString()}
              trend={{
                direction: 'up',
                value: '12',
                text: '12% increase',
              }}
              icon="✅"
            />
          </div>

          {/* Main Dashboard Content */}
          <div className="eva-dashboard-content">
            <div className="eva-dashboard-main">
              {/* Due Diligence Progress */}
              <div className="eva-card-container">
                <h2 className="mb-4 text-lg font-semibold">Due Diligence Progress</h2>
                <DueDiligenceProgress
                  title="Due Diligence Progress"
                  categories={mockDueDiligence}
                />
              </div>

              {/* Funding Trends Chart */}
              <div className="eva-card-container">
                <h2 className="mb-4 text-lg font-semibold">Funding Trends</h2>
                <FundingTrendsChart />
              </div>

              {/* Recent Transactions */}
              <div className="eva-card-container">
                <h2 className="mb-4 text-lg font-semibold">Recent Transactions</h2>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map(transaction => (
                    <DealProgressCard
                      key={transaction.id}
                      id={transaction.id}
                      name={transaction.name}
                      amount={transaction.amount}
                      status={transaction.status}
                      progress={transaction.progress}
                      assignee={transaction.assignee}
                      onClick={() => navigate(`/transactions/${transaction.id}`)}
                    />
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => navigate('/transactions')}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    View All Transactions →
                  </button>
                </div>
              </div>
            </div>

            <div className="eva-dashboard-sidebar">
              {/* Activity Feed */}
              <div className="eva-card-container">
                <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
                <div className="space-y-3">
                  {activities.slice(0, 8).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 text-sm">
                      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="eva-card-container">
                <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/credit-application')}
                    className="w-full rounded bg-blue-50 px-3 py-2 text-left text-sm transition-colors hover:bg-blue-100"
                  >
                    📝 New Credit Application
                  </button>
                  <button
                    onClick={() => navigate('/documents')}
                    className="w-full rounded bg-green-50 px-3 py-2 text-left text-sm transition-colors hover:bg-green-100"
                  >
                    📄 Upload Documents
                  </button>
                  <button
                    onClick={() => navigate('/risk-assessment')}
                    className="w-full rounded bg-yellow-50 px-3 py-2 text-left text-sm transition-colors hover:bg-yellow-100"
                  >
                    🎯 Risk Assessment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Export the dashboard component
export default Dashboard;
