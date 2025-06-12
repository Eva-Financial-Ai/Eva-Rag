import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LenderDashboardProps {
  metrics: any;
  alerts: any[];
  quickActions: any[];
  selectedCustomer?: any;
  activeCustomer?: any;
}

interface PortfolioStats {
  totalLoans: number;
  totalValue: number;
  avgLoanSize: number;
  activeLoans: number;
  portfolioYield: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  monthlyPerformance: {
    month: string;
    value: number;
    defaultRate: number;
  }[];
}

interface LoanApplication {
  id: string;
  borrowerName: string;
  businessName: string;
  loanType: string;
  requestedAmount: number;
  evaScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'pending' | 'under-review' | 'approved' | 'denied';
  submittedDate: string;
  processor: string;
  nextAction: string;
  timeInQueue: number; // hours
}

interface RiskAlert {
  id: string;
  type: 'default' | 'late-payment' | 'covenant-breach' | 'score-decline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  borrowerName: string;
  description: string;
  amount: number;
  daysOverdue?: number;
  recommendedAction: string;
  timestamp: Date;
}

interface CustomerInsight {
  customerId: string;
  customerName: string;
  totalExposure: number;
  avgEvaScore: number;
  scoreChange: number;
  riskTrend: 'improving' | 'stable' | 'declining';
  totalTransactions: number;
  lastActivity: string;
  creditUtilization: number;
}

const LenderDashboard: React.FC<LenderDashboardProps> = ({
  metrics,
  selectedCustomer,
  activeCustomer,
}) => {
  const navigate = useNavigate();
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [pendingApplications, setPendingApplications] = useState<LoanApplication[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsight[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>(
    'month',
  );

  useEffect(() => {
    const loadLenderData = async () => {
      // Mock portfolio statistics
      const mockPortfolioStats: PortfolioStats = {
        totalLoans: 1247,
        totalValue: 125400000,
        avgLoanSize: 100563,
        activeLoans: 1189,
        portfolioYield: 8.4,
        riskDistribution: {
          low: 72,
          medium: 23,
          high: 5,
        },
        monthlyPerformance: [
          { month: 'Jan', value: 118500000, defaultRate: 1.2 },
          { month: 'Feb', value: 120100000, defaultRate: 1.1 },
          { month: 'Mar', value: 122800000, defaultRate: 0.9 },
          { month: 'Apr', value: 125400000, defaultRate: 1.0 },
        ],
      };

      // Mock pending applications
      const mockApplications: LoanApplication[] = [
        {
          id: 'APP-2024-001',
          borrowerName: 'Sarah Johnson',
          businessName: 'Johnson Manufacturing LLC',
          loanType: 'Equipment Financing',
          requestedAmount: 450000,
          evaScore: 785,
          riskLevel: 'low',
          status: 'under-review',
          submittedDate: '2024-01-15',
          processor: 'Mike Chen',
          nextAction: 'Financial statement verification',
          timeInQueue: 18,
        },
        {
          id: 'APP-2024-002',
          borrowerName: 'David Martinez',
          businessName: 'Metro Logistics Corp',
          loanType: 'Working Capital',
          requestedAmount: 200000,
          evaScore: 652,
          riskLevel: 'medium',
          status: 'pending',
          submittedDate: '2024-01-16',
          processor: 'Lisa Wang',
          nextAction: 'Initial underwriting review',
          timeInQueue: 6,
        },
        {
          id: 'APP-2024-003',
          borrowerName: 'Emily Rodriguez',
          businessName: 'Green Energy Solutions',
          loanType: 'Commercial Real Estate',
          requestedAmount: 1200000,
          evaScore: 724,
          riskLevel: 'low',
          status: 'under-review',
          submittedDate: '2024-01-14',
          processor: 'Tom Anderson',
          nextAction: 'Property appraisal review',
          timeInQueue: 32,
        },
      ];

      // Mock risk alerts
      const mockRiskAlerts: RiskAlert[] = [
        {
          id: 'RISK-001',
          type: 'late-payment',
          severity: 'medium',
          borrowerName: 'ABC Construction LLC',
          description: 'Payment 15 days overdue on equipment loan',
          amount: 12500,
          daysOverdue: 15,
          recommendedAction: 'Contact borrower for payment plan',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        },
        {
          id: 'RISK-002',
          type: 'score-decline',
          severity: 'high',
          borrowerName: 'TechStart Innovations',
          description: 'EVA score dropped 45 points to 615',
          amount: 350000,
          recommendedAction: 'Request updated financial statements',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
        },
        {
          id: 'RISK-003',
          type: 'covenant-breach',
          severity: 'critical',
          borrowerName: 'Retail Plus Inc',
          description: 'Debt-to-equity ratio exceeds 3.5x limit',
          amount: 750000,
          recommendedAction: 'Immediate borrower contact required',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        },
      ];

      // Mock customer insights
      const mockCustomerInsights: CustomerInsight[] = [
        {
          customerId: 'CUST-001',
          customerName: 'Advanced Manufacturing Corp',
          totalExposure: 2400000,
          avgEvaScore: 742,
          scoreChange: +18,
          riskTrend: 'improving',
          totalTransactions: 8,
          lastActivity: '2024-01-16',
          creditUtilization: 67,
        },
        {
          customerId: 'CUST-002',
          customerName: 'ServicePro Solutions',
          totalExposure: 890000,
          avgEvaScore: 695,
          scoreChange: -12,
          riskTrend: 'declining',
          totalTransactions: 4,
          lastActivity: '2024-01-14',
          creditUtilization: 85,
        },
        {
          customerId: 'CUST-003',
          customerName: 'Innovation Hub LLC',
          totalExposure: 1650000,
          avgEvaScore: 758,
          scoreChange: +3,
          riskTrend: 'stable',
          totalTransactions: 6,
          lastActivity: '2024-01-15',
          creditUtilization: 45,
        },
      ];

      setPortfolioStats(mockPortfolioStats);
      setPendingApplications(mockApplications);
      setRiskAlerts(mockRiskAlerts);
      setCustomerInsights(mockCustomerInsights);
    };

    loadLenderData();
  }, [selectedTimeframe]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'critical':
        return 'text-red-700 bg-red-100 border-red-300';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'under-review':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'denied':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400"></div>;
    }
  };

  if (!portfolioStats) {
    return <div className="animate-pulse">Loading lender dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="rounded-lg bg-blue-50 p-2">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Portfolio</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(portfolioStats.totalValue / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm text-green-600">+2.4% this month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="rounded-lg bg-green-50 p-2">
              <DocumentTextIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Loans</p>
              <p className="text-2xl font-bold text-gray-900">
                {portfolioStats.activeLoans.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600">+47 this month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="rounded-lg bg-purple-50 p-2">
              <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Portfolio Yield</p>
              <p className="text-2xl font-bold text-gray-900">{portfolioStats.portfolioYield}%</p>
              <p className="text-sm text-green-600">+0.3% vs target</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-50 rounded-lg p-2">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Risk Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{riskAlerts.length}</p>
              <p className="text-sm text-red-600">2 critical</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution & Performance Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Risk Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Risk Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low Risk</span>
              <span className="text-sm font-medium text-green-600">
                {portfolioStats.riskDistribution.low}%
              </span>
            </div>
            <div className="bg-gray-200 h-2 w-full rounded-full">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{ width: `${portfolioStats.riskDistribution.low}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medium Risk</span>
              <span className="text-sm font-medium text-yellow-600">
                {portfolioStats.riskDistribution.medium}%
              </span>
            </div>
            <div className="bg-gray-200 h-2 w-full rounded-full">
              <div
                className="h-2 rounded-full bg-yellow-500"
                style={{ width: `${portfolioStats.riskDistribution.medium}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High Risk</span>
              <span className="text-sm font-medium text-red-600">
                {portfolioStats.riskDistribution.high}%
              </span>
            </div>
            <div className="bg-gray-200 h-2 w-full rounded-full">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${portfolioStats.riskDistribution.high}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Monthly Performance</h3>
          <div className="space-y-3">
            {portfolioStats.monthlyPerformance.map((month, index) => (
              <div
                key={index}
                className="bg-gray-50 flex items-center justify-between rounded-lg p-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{month.month}</p>
                  <p className="text-xs text-gray-500">Default: {month.defaultRate}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${(month.value / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-green-600">
                    {index > 0 && portfolioStats.monthlyPerformance[index - 1]
                      ? `+${(((month.value - portfolioStats.monthlyPerformance[index - 1].value) / portfolioStats.monthlyPerformance[index - 1].value) * 100).toFixed(1)}%`
                      : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Risk Alerts */}
      {riskAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high')
        .length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-red-600">Critical Risk Alerts</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {riskAlerts
                .filter(alert => alert.severity === 'critical' || alert.severity === 'high')
                .slice(0, 3)
                .map(alert => (
                  <div key={alert.id} className="bg-red-50 rounded-lg border border-red-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 text-red-600" />
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-red-900">{alert.borrowerName}</h4>
                          <p className="text-sm text-red-700">{alert.description}</p>
                          <p className="mt-1 text-xs text-red-600">
                            Amount: ${alert.amount.toLocaleString()}
                            {alert.daysOverdue && ` • ${alert.daysOverdue} days overdue`}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => navigate(`/risk-management/${alert.id}`)}
                          className="text-white bg-red-600 rounded px-3 py-1 text-xs hover:bg-red-700"
                        >
                          Take Action
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 pl-8">
                      <p className="text-xs text-red-600">
                        <strong>Recommended:</strong> {alert.recommendedAction}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Pending Applications */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Pending Applications</h3>
            <button
              onClick={() => navigate('/applications/pending')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View All ({pendingApplications.length})
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {pendingApplications.slice(0, 5).map(app => (
              <div key={app.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-medium text-gray-900">{app.businessName}</h4>
                      <span
                        className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(app.status)}`}
                      >
                        {app.status.replace('-', ' ')}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-1 text-xs font-medium ${getRiskLevelColor(app.riskLevel)}`}
                      >
                        {app.riskLevel} risk
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="font-medium">${app.requestedAmount.toLocaleString()}</span>
                      <span>•</span>
                      <span>{app.loanType}</span>
                      <span>•</span>
                      <span>EVA Score: {app.evaScore}</span>
                      <span>•</span>
                      <span>Processor: {app.processor}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Next:</strong> {app.nextAction}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center space-x-4 lg:ml-6 lg:mt-0">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Queue Time</div>
                      <div className="text-sm font-medium text-gray-900">{app.timeInQueue}h</div>
                    </div>
                    <button
                      onClick={() => navigate(`/applications/${app.id}/review`)}
                      className="text-white rounded bg-blue-600 px-3 py-1 text-sm hover:bg-blue-700"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Top Customer Insights</h3>
            <button
              onClick={() => navigate('/customers/insights')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View All Customers
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {customerInsights.slice(0, 5).map(customer => (
              <div key={customer.customerId} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-medium text-gray-900">{customer.customerName}</h4>
                      {getTrendIcon(customer.riskTrend)}
                      <span className="text-xs text-gray-500">
                        EVA: {customer.avgEvaScore}
                        <span
                          className={customer.scoreChange >= 0 ? 'text-green-600' : 'text-red-600'}
                        >
                          {customer.scoreChange >= 0 ? ' (+' : ' ('}
                          {customer.scoreChange})
                        </span>
                      </span>
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-4 text-sm text-gray-500 lg:grid-cols-4">
                      <div>
                        <span className="font-medium">Exposure:</span> $
                        {(customer.totalExposure / 1000).toFixed(0)}K
                      </div>
                      <div>
                        <span className="font-medium">Transactions:</span>{' '}
                        {customer.totalTransactions}
                      </div>
                      <div>
                        <span className="font-medium">Utilization:</span>{' '}
                        {customer.creditUtilization}%
                      </div>
                      <div>
                        <span className="font-medium">Last Activity:</span>{' '}
                        {new Date(customer.lastActivity).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => navigate(`/customers/${customer.customerId}`)}
                      className="text-blue-600 hover:text-blue-500"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/customers/${customer.customerId}/eva-report`)}
                      className="text-green-600 hover:text-green-500"
                    >
                      <ChartBarIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick EVA Analytics */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">EVA Analytics Summary</h3>
            <button
              onClick={() => navigate('/eva-analytics')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Full Analytics
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">695</div>
              <div className="text-sm text-gray-600">Average EVA Score</div>
              <div className="mt-1 text-xs text-green-600">+8 this quarter</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">23</div>
              <div className="text-sm text-gray-600">Reports Generated Today</div>
              <div className="mt-1 text-xs text-blue-600">12% above average</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">94%</div>
              <div className="text-sm text-gray-600">Prediction Accuracy</div>
              <div className="mt-1 text-xs text-green-600">Industry leading</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LenderDashboard;
