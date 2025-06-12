import {
  Activity,
  Calendar,
  CheckSquare,
  Clock,
  DollarSign,
  Mail,
  Phone,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, color }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div
              className={`mt-2 flex items-center text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}
            >
              <TrendingUp
                className={`mr-1 h-4 w-4 ${!trend.isPositive ? 'rotate-180 transform' : ''}`}
              />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 ${color} rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
};

interface ActivityItem {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task';
  title: string;
  time: string;
  customer: string;
}

const CRPDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'activities'>('overview');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Sample data - in production, this would come from API
  const metrics = {
    totalCustomers: 247,
    activeEngagements: 183,
    scheduledCalls: 42,
    pendingTasks: 18,
    revenue: '$2.4M',
    retention: '94%',
  };

  const recentActivities: ActivityItem[] = [
    { id: '1', type: 'call', title: 'Follow-up call', time: '10:30 AM', customer: 'Johnson LLC' },
    { id: '2', type: 'email', title: 'Proposal sent', time: '11:45 AM', customer: 'Smith Corp' },
    { id: '3', type: 'meeting', title: 'Review meeting', time: '2:00 PM', customer: 'Davis Inc' },
    { id: '4', type: 'task', title: 'Contract renewal', time: '3:30 PM', customer: 'Miller & Co' },
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'task':
        return <CheckSquare className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">CRP Dashboard</h1>
        <p className="text-gray-600">Customer Retention Platform Overview</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'customers', 'activities'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-1 py-2 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Total Customers"
              value={metrics.totalCustomers}
              icon={<Users className="text-white h-6 w-6" />}
              trend={{ value: 12, isPositive: true }}
              color="bg-blue-500"
            />
            <MetricCard
              title="Active Engagements"
              value={metrics.activeEngagements}
              icon={<Activity className="text-white h-6 w-6" />}
              trend={{ value: 8, isPositive: true }}
              color="bg-green-500"
            />
            <MetricCard
              title="Scheduled Calls"
              value={metrics.scheduledCalls}
              icon={<Phone className="text-white h-6 w-6" />}
              color="bg-purple-500"
            />
            <MetricCard
              title="Pending Tasks"
              value={metrics.pendingTasks}
              icon={<CheckSquare className="text-white h-6 w-6" />}
              trend={{ value: 3, isPositive: false }}
              color="bg-orange-500"
            />
            <MetricCard
              title="Total Revenue"
              value={metrics.revenue}
              icon={<DollarSign className="text-white h-6 w-6" />}
              trend={{ value: 18, isPositive: true }}
              color="bg-indigo-500"
            />
            <MetricCard
              title="Retention Rate"
              value={metrics.retention}
              icon={<TrendingUp className="text-white h-6 w-6" />}
              trend={{ value: 2, isPositive: true }}
              color="bg-teal-500"
            />
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activities</h2>
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 rounded-lg p-2">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="mr-1 h-4 w-4" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access Cards */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => navigate('/customer-retention/customers')}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-300"
            >
              <Users className="mb-2 h-8 w-8 text-blue-500" />
              <h3 className="font-medium text-gray-900">Customer List</h3>
              <p className="text-sm text-gray-500">Manage all customers</p>
            </button>

            <button
              onClick={() => navigate('/customer-retention/contacts')}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-green-300"
            >
              <Phone className="mb-2 h-8 w-8 text-green-500" />
              <h3 className="font-medium text-gray-900">Contacts</h3>
              <p className="text-sm text-gray-500">Contact management</p>
            </button>

            <button
              onClick={() => navigate('/customer-retention/calendar')}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-purple-300"
            >
              <Calendar className="mb-2 h-8 w-8 text-purple-500" />
              <h3 className="font-medium text-gray-900">Calendar</h3>
              <p className="text-sm text-gray-500">Schedule & sync</p>
            </button>

            <button
              onClick={() => navigate('/customer-retention/commitments')}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm transition-all hover:shadow-md hover:border-orange-300"
            >
              <CheckSquare className="mb-2 h-8 w-8 text-orange-500" />
              <h3 className="font-medium text-gray-900">Commitments</h3>
              <p className="text-sm text-gray-500">Track commitments</p>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Customer Management</h2>
            <button
              onClick={() => navigate('/customer-retention/customers')}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              View All Customers
            </button>
          </div>
          <div className="py-12 text-center text-gray-500">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-4">Quick customer overview and stats will be displayed here</p>
            <button
              onClick={() => navigate('/customer-retention/customers')}
              className="text-blue-600 hover:text-blue-800"
            >
              Go to Customer List →
            </button>
          </div>
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Activity Timeline</h2>
          <div className="py-12 text-center text-gray-500">
            <Activity className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p>Activity timeline will be displayed here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRPDashboard;
