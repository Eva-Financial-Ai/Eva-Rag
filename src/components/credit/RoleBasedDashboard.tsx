import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRoleTypeString } from '../../types/user';
import TopNavbar from '../layout/TopNavbar';
import CreditCommitteeDashboard from './CreditCommitteeDashboard';
import CreditUnderwriterDashboard from './CreditUnderwriterDashboard';
import LoanProcessorDashboard from './LoanProcessorDashboard';
import RoleBasedHeader, { UserRole, ViewMode } from './RoleBasedHeader';
import SalesManagerDashboard from './SalesManagerDashboard';

// Define statistics type
interface DashboardStats {
  totalApplications: number;
  pendingDocuments: number;
  approvedApplications: number;
  totalValue: number;
  changeFromLastMonth: {
    applications: number;
    documents: number;
    approvals: number;
    value: number;
  };
}

interface RoleBasedDashboardProps {
  initialRole?: UserRole;
  initialViewMode?: ViewMode;
  useTopNavbar?: boolean;
  currentTransaction?: string;
  currentRole: UserRoleTypeString;
}

const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({
  initialRole = 'sales_manager',
  initialViewMode = 'macro',
  useTopNavbar = false,
  currentTransaction,
  currentRole,
}) => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>((currentRole as UserRole) || initialRole);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingDocuments: 0,
    approvedApplications: 0,
    totalValue: 0,
    changeFromLastMonth: {
      applications: 0,
      documents: 0,
      approvals: 0,
      value: 0,
    },
  });

  useEffect(() => {
    if (currentRole) {
      setUserRole(currentRole as UserRole);
    }
  }, [currentRole]);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchDashboardData = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Sample data - adjust values based on role
      const roleBasedStats = {
        sales_manager: {
          totalApplications: 65,
          pendingDocuments: 22,
          approvedApplications: 15,
          totalValue: 3650000,
          changeFromLastMonth: {
            applications: 12.5,
            documents: 3.2,
            approvals: 7.8,
            value: 15.3,
          },
        },
        loan_processor: {
          totalApplications: 94,
          pendingDocuments: 38,
          approvedApplications: 24,
          totalValue: 5280000,
          changeFromLastMonth: {
            applications: 8.2,
            documents: -5.3, // Negative change is good for pending docs
            approvals: 12.1,
            value: 10.5,
          },
        },
        credit_underwriter: {
          totalApplications: 42,
          pendingDocuments: 17,
          approvedApplications: 28,
          totalValue: 4125000,
          changeFromLastMonth: {
            applications: 5.8,
            documents: -2.1,
            approvals: 9.3,
            value: 7.6,
          },
        },
        credit_committee: {
          totalApplications: 37,
          pendingDocuments: 5,
          approvedApplications: 32,
          totalValue: 6750000,
          changeFromLastMonth: {
            applications: 3.9,
            documents: -8.5,
            approvals: 11.2,
            value: 14.8,
          },
        },
        portfolio_manager: {
          totalApplications: 128,
          pendingDocuments: 41,
          approvedApplications: 87,
          totalValue: 12450000,
          changeFromLastMonth: {
            applications: 7.6,
            documents: -1.8,
            approvals: 5.4,
            value: 18.2,
          },
        },
        portfolio_servicer: {
          totalApplications: 168,
          pendingDocuments: 32,
          approvedApplications: 136,
          totalValue: 18750000,
          changeFromLastMonth: {
            applications: 4.2,
            documents: -4.7,
            approvals: 6.8,
            value: 9.3,
          },
        },
        portfolio_monitor: {
          totalApplications: 210,
          pendingDocuments: 28,
          approvedApplications: 175,
          totalValue: 22850000,
          changeFromLastMonth: {
            applications: 2.5,
            documents: -7.3,
            approvals: 4.5,
            value: 6.8,
          },
        },
        developer: {
          totalApplications: 315,
          pendingDocuments: 120,
          approvedApplications: 195,
          totalValue: 35780000,
          changeFromLastMonth: {
            applications: 15.4,
            documents: 8.7,
            approvals: 12.9,
            value: 23.4,
          },
        },
        admin: {
          totalApplications: 420,
          pendingDocuments: 150,
          approvedApplications: 270,
          totalValue: 48250000,
          changeFromLastMonth: {
            applications: 11.2,
            documents: -2.8,
            approvals: 8.7,
            value: 17.5,
          },
        },
      };

      // Set stats based on current internal userRole
      setStats(roleBasedStats[userRole] || roleBasedStats['admin']);

      setLoading(false);
    };

    if (userRole) {
      fetchDashboardData();
    }
  }, [userRole]);

  const handleRoleChange = useCallback((role: UserRole) => {
    setUserRole(role);
  }, []);

  const handleTopNavbarRoleChange = useCallback((role: UserRoleTypeString) => {
    setUserRole(role as UserRole);
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleNewOrigination = () => {
    navigate('/credit-application');
  };

  const renderStatsCards = () => (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow">
        <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
        <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
        <div
          className={`mt-1 text-sm ${stats.changeFromLastMonth.applications > 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {stats.changeFromLastMonth.applications > 0 ? '↑' : '↓'}{' '}
          {Math.abs(stats.changeFromLastMonth.applications)}% from last month
        </div>
      </div>

      <div className="rounded-lg border-l-4 border-yellow-500 bg-white p-4 shadow">
        <h3 className="text-sm font-medium text-gray-500">Pending Documents</h3>
        <p className="text-3xl font-bold text-gray-900">{stats.pendingDocuments}</p>
        <div
          className={`mt-1 text-sm ${stats.changeFromLastMonth.documents > 0 ? 'text-red-600' : 'text-green-600'}`}
        >
          {stats.changeFromLastMonth.documents > 0 ? '↑' : '↓'}{' '}
          {Math.abs(stats.changeFromLastMonth.documents)}% from last month
        </div>
      </div>

      <div className="rounded-lg border-l-4 border-green-500 bg-white p-4 shadow">
        <h3 className="text-sm font-medium text-gray-500">Approved</h3>
        <p className="text-3xl font-bold text-green-600">{stats.approvedApplications}</p>
        <div
          className={`mt-1 text-sm ${stats.changeFromLastMonth.approvals > 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {stats.changeFromLastMonth.approvals > 0 ? '↑' : '↓'}{' '}
          {Math.abs(stats.changeFromLastMonth.approvals)}% from last month
        </div>
      </div>

      <div className="rounded-lg border-l-4 border-purple-500 bg-white p-4 shadow">
        <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
        <p className="text-3xl font-bold text-primary-600">${stats.totalValue.toLocaleString()}</p>
        <div
          className={`mt-1 text-sm ${stats.changeFromLastMonth.value > 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {stats.changeFromLastMonth.value > 0 ? '↑' : '↓'}{' '}
          {Math.abs(stats.changeFromLastMonth.value)}% from last month
        </div>
      </div>
    </div>
  );

  const renderRoleDashboard = () => {
    if (loading) {
      return (
        <div className="flex h-64 flex-col items-center justify-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      );
    }

    switch (userRole) {
      case 'sales_manager':
        return <SalesManagerDashboard viewMode={viewMode} />;

      case 'loan_processor':
        return <LoanProcessorDashboard viewMode={viewMode} />;

      case 'credit_underwriter':
        return <CreditUnderwriterDashboard viewMode={viewMode} />;

      case 'credit_committee':
        return <CreditCommitteeDashboard viewMode={viewMode} />;

      // For other roles, we'd add their specific components
      default:
        return (
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900">Dashboard for {userRole}</h3>
            <p className="mt-2 text-gray-600">
              This role-specific dashboard is under development. Please check back soon.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {useTopNavbar && (
        <TopNavbar currentTransaction={currentTransaction || 'TX-123'} demoContext="all" />
      )}

      <div className="w-full">
        <RoleBasedHeader
          userRole={userRole}
          viewMode={viewMode}
          onRoleChange={handleRoleChange}
          onViewModeChange={handleViewModeChange}
          onNewOrigination={handleNewOrigination}
        />

        <div className="w-full">
          {renderStatsCards()}
          {renderRoleDashboard()}
        </div>
      </div>
    </div>
  );
};

export default RoleBasedDashboard;
