import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import DashboardCard from './DashboardCard';

interface User {
  id: string;
  role: 'borrower' | 'vendor' | 'broker' | 'lender' | 'admin';
  name: string;
  email: string;
}

interface BrokerDashboardProps {
  user: User;
}

// Mock active deals data
const mockActiveDeals = [
  {
    id: 'deal-123',
    applicant: 'ABC Manufacturing',
    type: 'Equipment Financing',
    amount: 350000,
    status: 'In Progress',
    submitted: '2023-10-22',
    progress: 60,
  },
  {
    id: 'deal-124',
    applicant: 'XYZ Retail',
    type: 'Working Capital',
    amount: 125000,
    status: 'Decision Pending',
    submitted: '2023-10-20',
    progress: 80,
  },
  {
    id: 'deal-125',
    applicant: 'Johnson Law',
    type: 'Office Building Purchase',
    amount: 950000,
    status: 'Team Due Diligence',
    submitted: '2023-10-18',
    progress: 40,
  },
];

// Mock lender network data
const mockLenders = [
  {
    name: 'First National Bank',
    type: 'SBA',
    matchScore: 90,
  },
  {
    name: 'Equipment Capital Partners',
    type: 'Alternative',
    matchScore: 85,
  },
  {
    name: 'Growth Fund Inc.',
    type: 'Alternative',
    matchScore: 82,
  },
];

// Mock commission data
const mockCommissions = {
  mtd: 7850,
  ytd: 95240,
  status: {
    pending: true,
    projected: true,
  },
  recentPayments: [
    { deal: 'Tech Solutions Equipment Loan', amount: 3250 },
    { deal: 'Lakeside Realty Building Purchase', amount: 9600 },
  ],
};

// Mock performance metrics
const mockPerformanceMetrics = {
  totalDeals: 28,
  approved: 21,
  closeRate: 75,
  averageDeal: 183333,
  totalVolume: 3850000,
  yearlyGoalProgress: 90,
};

// Mock smart match data
const mockSmartMatchData = [
  {
    company: 'ABC Manufacturing',
    matchesFound: 2,
  },
  {
    company: 'XYZ Retail',
    matchesFound: 3,
  },
];

const BrokerDashboard: React.FC<BrokerDashboardProps> = ({ user }) => {
  const navigate = useNavigate();

  // Define navigation items
  const navigation = [
    {
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      href: '/dashboard',
      active: true,
    },
    {
      label: 'Deals',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      href: '/deals',
      active: false,
    },
    {
      label: 'Lenders',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      href: '/lenders',
      active: false,
    },
    {
      label: 'Commissions',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      href: '/commissions',
      active: false,
    },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout
      user={user}
      title="Broker Dashboard"
      subtitle="Manage your deals, monitor commissions, and connect with lenders"
    >
      <div className="flex flex-wrap -mx-3">
        {' '}
        {/* Flex container with negative margin to counteract padding */}
        {/* First row - 3 cards with equal width */}
        <div className="w-full md:w-1/3 px-3 mb-6">
          {' '}
          {/* Flex item with padding and bottom margin */}
          <DashboardCard
            title="Active Deals"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
          >
            <div className="space-y-2">
              {mockActiveDeals.map(deal => (
                <div
                  key={deal.id}
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/deals/${deal.id}`)}
                >
                  <div className="flex justify-between">
                    <div className="font-medium text-gray-900">{deal.applicant}</div>
                    <div className="text-xs text-gray-500">{deal.status}</div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <div>{deal.type}</div>
                    <div>{formatCurrency(deal.amount)}</div>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Progress</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          deal.progress >= 60
                            ? 'bg-green-500'
                            : deal.progress >= 30
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${deal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <button
                onClick={() => navigate('/deals')}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                View all deals →
              </button>
            </div>
          </DashboardCard>
        </div>
        <div className="w-full md:w-1/3 px-3 mb-6">
          <DashboardCard
            title="Lender Network"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          >
            <div className="grid grid-cols-1 gap-3 mb-3">
              {mockLenders.map((lender, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-blue-700 mb-1">{lender.name}</div>
                      <div className="text-xs text-gray-500">{lender.type}</div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                      {lender.matchScore}% Match
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-3">
              <button
                onClick={() => navigate('/lenders')}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                Browse all lenders →
              </button>
            </div>
          </DashboardCard>
        </div>
        <div className="w-full md:w-1/3 px-3 mb-6">
          <DashboardCard
            title="Commission Summary"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
            }
          >
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="text-xs text-green-700 mb-1">MTD Commissions</div>
                <div className="text-xl font-bold text-green-900">
                  {formatCurrency(mockCommissions.mtd)}
                </div>
                <div className="text-xs mt-1 text-green-600">Pending</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-xs text-purple-700 mb-1">YTD Commissions</div>
                <div className="text-xl font-bold text-purple-900">
                  {formatCurrency(mockCommissions.ytd)}
                </div>
                <div className="text-xs mt-1 text-purple-600">Projected</div>
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="text-xs font-medium text-gray-500 mb-2">Recent Payments</h4>
              <div className="space-y-2">
                {mockCommissions.recentPayments.map((payment, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{payment.deal}</span>
                    <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <button
                onClick={() => navigate('/commissions')}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                View commission details →
              </button>
            </div>
          </DashboardCard>
        </div>
        {/* Second row - Smart Match, Performance Metrics, and Quick Actions */}
        <div className="w-full md:w-1/3 px-3 mb-6">
          <DashboardCard
            title="Smart Match"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            }
          >
            <div className="p-6 bg-blue-50 rounded-lg text-center">
              <h3 className="text-lg font-bold text-blue-900 mb-2">Smart Match</h3>
              <p className="text-sm text-blue-700 mb-4">Find the perfect lender for your deal</p>

              <button
                onClick={() => navigate('/smart-match')}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-4 text-sm font-medium"
              >
                Run Smart Match
              </button>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Recent Matches</h4>

              <div className="space-y-2">
                {mockSmartMatchData.map((match, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="text-sm">{match.company}</div>
                    <div className="text-xs text-gray-500">{match.matchesFound} matches found</div>
                    <button className="text-xs text-blue-600 font-medium">View</button>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>
        </div>
        <div className="w-full md:w-1/3 px-3 mb-6">
          <DashboardCard
            title="Performance Metrics"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          >
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Total Deals</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {mockPerformanceMetrics.totalDeals}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Approved</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {mockPerformanceMetrics.approved}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-gray-500">Close Rate</div>
                <div className="text-sm font-semibold">{mockPerformanceMetrics.closeRate}%</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${mockPerformanceMetrics.closeRate}%` }}
                ></div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-gray-500">Average Deal</div>
                <div className="text-sm font-semibold">
                  {formatCurrency(mockPerformanceMetrics.averageDeal)}
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-gray-500">Total Volume</div>
                <div className="text-sm font-semibold">
                  {formatCurrency(mockPerformanceMetrics.totalVolume)}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {mockPerformanceMetrics.yearlyGoalProgress}% of yearly goal
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${mockPerformanceMetrics.yearlyGoalProgress}%` }}
                ></div>
              </div>
            </div>
          </DashboardCard>
        </div>
        <div className="w-full md:w-1/3 px-3 mb-6">
          <DashboardCard
            title="Quick Actions"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
          >
            <div className="space-y-3">
              <button
                onClick={() => navigate('/new-deal')}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium"
              >
                Create New Deal
              </button>

              <button
                onClick={() => navigate('/smart-match')}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
              >
                Run Smart Match
              </button>

              <button
                onClick={() => navigate('/browse-lenders')}
                className="w-full py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium"
              >
                Browse Lenders
              </button>

              <button
                onClick={() => navigate('/commission-calculator')}
                className="w-full py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium"
              >
                Commission Calculator
              </button>
            </div>
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BrokerDashboard;
