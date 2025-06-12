import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  userType: 'borrower' | 'vendor' | 'broker' | 'lender' | 'admin';
  organization: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  revenue: number;
  deals: number;
  joinDate: string;
  tier: 'basic' | 'premium' | 'enterprise';
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalRevenue: number;
  averageRevenuePerUser: number;
  userGrowthRate: number;
}

const UserManagementOverview: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserType, setSelectedUserType] = useState<
    'all' | 'borrower' | 'vendor' | 'broker' | 'lender' | 'admin'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    totalRevenue: 0,
    averageRevenuePerUser: 0,
    userGrowthRate: 0,
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockUsers: User[] = [
      // Borrowers
      {
        id: 'B001',
        name: 'ABC Manufacturing Corp',
        email: 'cfo@abcmanufacturing.com',
        role: 'CFO',
        userType: 'borrower',
        organization: 'ABC Manufacturing Corp',
        status: 'active',
        lastLogin: '2024-01-20',
        revenue: 125000,
        deals: 3,
        joinDate: '2023-08-15',
        tier: 'enterprise',
      },
      {
        id: 'B002',
        name: 'XYZ Logistics Inc',
        email: 'owner@xyzlogistics.com',
        role: 'Owner',
        userType: 'borrower',
        organization: 'XYZ Logistics Inc',
        status: 'active',
        lastLogin: '2024-01-19',
        revenue: 85000,
        deals: 2,
        joinDate: '2023-11-02',
        tier: 'premium',
      },
      // Vendors
      {
        id: 'V001',
        name: 'Industrial Equipment Solutions',
        email: 'sales@iesequipment.com',
        role: 'Sales Manager',
        userType: 'vendor',
        organization: 'Industrial Equipment Solutions',
        status: 'active',
        lastLogin: '2024-01-20',
        revenue: 450000,
        deals: 12,
        joinDate: '2023-06-10',
        tier: 'enterprise',
      },
      {
        id: 'V002',
        name: 'Tech Solutions Pro',
        email: 'director@techsolutionspro.com',
        role: 'Sales Director',
        userType: 'vendor',
        organization: 'Tech Solutions Pro',
        status: 'active',
        lastLogin: '2024-01-18',
        revenue: 280000,
        deals: 8,
        joinDate: '2023-09-22',
        tier: 'premium',
      },
      // Brokers
      {
        id: 'BR001',
        name: 'Capital Bridge Partners',
        email: 'principal@capitalbridge.com',
        role: 'Principal',
        userType: 'broker',
        organization: 'Capital Bridge Partners',
        status: 'active',
        lastLogin: '2024-01-20',
        revenue: 320000,
        deals: 15,
        joinDate: '2023-05-18',
        tier: 'enterprise',
      },
      {
        id: 'BR002',
        name: 'Midwest Financial Brokers',
        email: 'senior@midwestfinancial.com',
        role: 'Senior Officer',
        userType: 'broker',
        organization: 'Midwest Financial Brokers',
        status: 'active',
        lastLogin: '2024-01-19',
        revenue: 185000,
        deals: 9,
        joinDate: '2023-07-30',
        tier: 'premium',
      },
      // Lenders
      {
        id: 'L001',
        name: 'First National Lending',
        email: 'cco@firstnationallending.com',
        role: 'Chief Credit Officer',
        userType: 'lender',
        organization: 'First National Lending',
        status: 'active',
        lastLogin: '2024-01-20',
        revenue: 850000,
        deals: 45,
        joinDate: '2023-04-12',
        tier: 'enterprise',
      },
      {
        id: 'L002',
        name: 'Regional Credit Union',
        email: 'underwriter@regionalcu.com',
        role: 'Senior Underwriter',
        userType: 'lender',
        organization: 'Regional Credit Union',
        status: 'active',
        lastLogin: '2024-01-19',
        revenue: 420000,
        deals: 28,
        joinDate: '2023-08-05',
        tier: 'premium',
      },
    ];

    setUsers(mockUsers);
    setFilteredUsers(mockUsers);

    // Calculate stats
    const totalUsers = mockUsers.length;
    const activeUsers = mockUsers.filter(u => u.status === 'active').length;
    const totalRevenue = mockUsers.reduce((sum, user) => sum + user.revenue, 0);
    const averageRevenuePerUser = totalRevenue / totalUsers;

    setStats({
      totalUsers,
      activeUsers,
      newUsersThisMonth: 12,
      totalRevenue,
      averageRevenuePerUser,
      userGrowthRate: 24.5,
    });
  }, []);

  // Filter users based on type and search term
  useEffect(() => {
    let filtered = users;

    if (selectedUserType !== 'all') {
      filtered = filtered.filter(user => user.userType === selectedUserType);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.organization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, selectedUserType, searchTerm]);

  const getUserTypeColor = (userType: string) => {
    const colors = {
      borrower: 'bg-blue-100 text-blue-800',
      vendor: 'bg-green-100 text-green-800',
      broker: 'bg-purple-100 text-purple-800',
      lender: 'bg-orange-100 text-orange-800',
      admin: 'bg-red-100 text-red-800',
    };
    return colors[userType] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTierColor = (tier: string) => {
    const colors = {
      basic: 'bg-gray-100 text-gray-800',
      premium: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800',
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const userTypeStats = [
    {
      type: 'borrower',
      label: 'Borrowers',
      count: users.filter(u => u.userType === 'borrower').length,
      revenue: users.filter(u => u.userType === 'borrower').reduce((sum, u) => sum + u.revenue, 0),
      icon: <UserGroupIcon className="h-6 w-6" />,
      color: 'blue',
    },
    {
      type: 'vendor',
      label: 'Vendors',
      count: users.filter(u => u.userType === 'vendor').length,
      revenue: users.filter(u => u.userType === 'vendor').reduce((sum, u) => sum + u.revenue, 0),
      icon: <BuildingOfficeIcon className="h-6 w-6" />,
      color: 'green',
    },
    {
      type: 'broker',
      label: 'Brokers',
      count: users.filter(u => u.userType === 'broker').length,
      revenue: users.filter(u => u.userType === 'broker').reduce((sum, u) => sum + u.revenue, 0),
      icon: <BriefcaseIcon className="h-6 w-6" />,
      color: 'purple',
    },
    {
      type: 'lender',
      label: 'Lenders',
      count: users.filter(u => u.userType === 'lender').length,
      revenue: users.filter(u => u.userType === 'lender').reduce((sum, u) => sum + u.revenue, 0),
      icon: <CurrencyDollarIcon className="h-6 w-6" />,
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management Overview</h1>
            <p className="mt-1 text-sm text-gray-500">
              Comprehensive view of all users, employees, and business partners
            </p>
          </div>
          <button
            onClick={() => navigate('/user-management/add')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600">↑ {stats.userGrowthRate}% growth</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              <p className="text-sm text-green-600">
                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% active
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-sm text-purple-600">From all users</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Revenue/User</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.averageRevenuePerUser)}
              </p>
              <p className="text-sm text-orange-600">Per user</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Type Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">User Type Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {userTypeStats.map(stat => (
            <div key={stat.type} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                  {stat.icon}
                </div>
                <button
                  onClick={() => setSelectedUserType(stat.type as any)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View All
                </button>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900">{stat.label}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                <p className="text-sm text-gray-500">Revenue: {formatCurrency(stat.revenue)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={selectedUserType}
              onChange={e => setSelectedUserType(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All User Types</option>
              <option value="borrower">Borrowers</option>
              <option value="vendor">Vendors</option>
              <option value="broker">Brokers</option>
              <option value="lender">Lenders</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Users & Business Partners</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserTypeColor(user.userType)}`}
                      >
                        {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.organization}</div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(user.tier)}`}
                      >
                        {user.tier}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(user.revenue)}</div>
                    <div className="text-sm text-gray-500">{user.deals} deals</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}
                      >
                        {user.status}
                      </span>
                      <span className="text-xs text-gray-500">Last: {user.lastLogin}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/user-management/${user.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/user-management/${user.id}/edit`)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementOverview;
