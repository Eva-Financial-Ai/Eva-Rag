import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'user';
  status: 'active' | 'inactive' | 'pending';
  lastActive: Date;
  aiAgentsAccess: string[];
  permissions: {
    canCreateCustomAI: boolean;
    canAccessMCP: boolean;
    canUseCustomTools: boolean;
    canViewAnalytics: boolean;
    canManageUsers: boolean;
  };
  usage: {
    totalInteractions: number;
    monthlyInteractions: number;
    favoriteAgent: string;
  };
}

interface AIAgent {
  id: string;
  name: string;
  type: 'default' | 'custom';
  category: 'risk' | 'documentation' | 'analysis' | 'general';
  activeUsers: number;
  status: 'active' | 'inactive' | 'maintenance';
}

const AIUserManagementDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [aiAgents] = useState<AIAgent[]>([
    {
      id: 'eva-risk',
      name: 'EVA Risk',
      type: 'default',
      category: 'risk',
      activeUsers: 24,
      status: 'active',
    },
    {
      id: 'doc-easy',
      name: 'Doc Easy',
      type: 'default',
      category: 'documentation',
      activeUsers: 18,
      status: 'active',
    },
    {
      id: 'steve-branding',
      name: 'Steve Branding',
      type: 'default',
      category: 'analysis',
      activeUsers: 12,
      status: 'active',
    },
    {
      id: 'neo',
      name: 'Neo Matrix Master',
      type: 'default',
      category: 'general',
      activeUsers: 8,
      status: 'maintenance',
    },
  ]);
  const [activeTab, setActiveTab] = useState<'users' | 'agents' | 'analytics' | 'settings'>(
    'users'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Initialize sample users
  useEffect(() => {
    const sampleUsers: User[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@company.com',
        role: 'admin',
        status: 'active',
        lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        aiAgentsAccess: ['eva-risk', 'doc-easy', 'steve-branding', 'neo'],
        permissions: {
          canCreateCustomAI: true,
          canAccessMCP: true,
          canUseCustomTools: true,
          canViewAnalytics: true,
          canManageUsers: true,
        },
        usage: {
          totalInteractions: 1250,
          monthlyInteractions: 187,
          favoriteAgent: 'eva-risk',
        },
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        role: 'manager',
        status: 'active',
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        aiAgentsAccess: ['eva-risk', 'doc-easy'],
        permissions: {
          canCreateCustomAI: true,
          canAccessMCP: false,
          canUseCustomTools: true,
          canViewAnalytics: true,
          canManageUsers: false,
        },
        usage: {
          totalInteractions: 850,
          monthlyInteractions: 124,
          favoriteAgent: 'doc-easy',
        },
      },
      {
        id: '3',
        name: 'Mike Chen',
        email: 'mike.chen@company.com',
        role: 'analyst',
        status: 'active',
        lastActive: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
        aiAgentsAccess: ['eva-risk', 'steve-branding'],
        permissions: {
          canCreateCustomAI: false,
          canAccessMCP: false,
          canUseCustomTools: true,
          canViewAnalytics: true,
          canManageUsers: false,
        },
        usage: {
          totalInteractions: 420,
          monthlyInteractions: 89,
          favoriteAgent: 'eva-risk',
        },
      },
      {
        id: '4',
        name: 'Lisa Rodriguez',
        email: 'lisa.rodriguez@company.com',
        role: 'user',
        status: 'pending',
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        aiAgentsAccess: [],
        permissions: {
          canCreateCustomAI: false,
          canAccessMCP: false,
          canUseCustomTools: false,
          canViewAnalytics: false,
          canManageUsers: false,
        },
        usage: {
          totalInteractions: 0,
          monthlyInteractions: 0,
          favoriteAgent: '',
        },
      },
    ];
    setUsers(sampleUsers);
  }, []);

  const filteredUsers = users.filter(
    user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'analyst':
        return 'bg-green-100 text-green-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const updateUserPermissions = (userId: string, permissions: Partial<User['permissions']>) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId
          ? { ...user, permissions: { ...user.permissions, ...permissions } }
          : user
      )
    );
  };

  const updateUserStatus = (userId: string, status: User['status']) => {
    setUsers(prev => prev.map(user => (user.id === userId ? { ...user, status } : user)));
  };

  const getTotalStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const totalInteractions = users.reduce((sum, u) => sum + u.usage.totalInteractions, 0);
    const monthlyInteractions = users.reduce((sum, u) => sum + u.usage.monthlyInteractions, 0);

    return { totalUsers, activeUsers, totalInteractions, monthlyInteractions };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🤖 AI User Management Dashboard</h1>
            <p className="mt-2 text-blue-100">
              Manage user access and permissions for EVA AI platform
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.activeUsers}</div>
            <div className="text-blue-100">Active Users</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">💬</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Interactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalInteractions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.monthlyInteractions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'agents', label: 'AI Agents', icon: '🤖' },
              { id: 'analytics', label: 'Analytics', icon: '📊' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search and Actions */}
              <div className="flex justify-between items-center">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <span className="text-gray-400">🔍</span>
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search users..."
                    />
                  </div>
                </div>
                <button
                  onClick={() => setShowUserModal(true)}
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ➕ Add User
                </button>
              </div>

              {/* Users Table */}
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        AI Agents
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
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
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.name
                                    .split(' ')
                                    .map(n => n[0])
                                    .join('')
                                    .toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex space-x-1">
                            {user.aiAgentsAccess.slice(0, 3).map(agentId => {
                              const agent = aiAgents.find(a => a.id === agentId);
                              return agent ? (
                                <span
                                  key={agentId}
                                  className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                                >
                                  {agent.name.split(' ')[0]}
                                </span>
                              ) : null;
                            })}
                            {user.aiAgentsAccess.length > 3 && (
                              <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{user.aiAgentsAccess.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{user.usage.monthlyInteractions} this month</div>
                          <div className="text-xs text-gray-500">
                            {user.usage.totalInteractions} total
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastActive.toLocaleDateString()}{' '}
                          {user.lastActive.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              ✏️ Edit
                            </button>
                            {user.status === 'pending' && (
                              <button
                                onClick={() => updateUserStatus(user.id, 'active')}
                                className="text-green-600 hover:text-green-900"
                              >
                                ✅ Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiAgents.map(agent => (
                  <div key={agent.id} className="bg-gray-50 rounded-lg p-6 border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          agent.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : agent.status === 'maintenance'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="text-sm font-medium">{agent.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="text-sm font-medium">{agent.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active Users:</span>
                        <span className="text-sm font-medium">{agent.activeUsers}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                        ⚙️ Configure
                      </button>
                      <button className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                        📊 Analytics
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">📈 Usage Trends</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Daily Active Users</span>
                      <span className="text-sm font-medium">32 ↑ 12%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Session Duration</span>
                      <span className="text-sm font-medium">18 min ↑ 5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Interactions Today</span>
                      <span className="text-sm font-medium">247 ↑ 8%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">🤖 Popular AI Agents</h3>
                  <div className="space-y-3">
                    {aiAgents.map((agent, index) => (
                      <div key={agent.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 mr-2">
                            #{index + 1}
                          </span>
                          <span className="text-sm text-gray-600">{agent.name}</span>
                        </div>
                        <span className="text-sm font-medium">{agent.activeUsers} users</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">🔧 Platform Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Auto-approve new users
                      </div>
                      <div className="text-sm text-gray-500">
                        Automatically approve users with company email
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Enable usage analytics
                      </div>
                      <div className="text-sm text-gray-500">
                        Track user interactions for insights
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Require MFA for admin users
                      </div>
                      <div className="text-sm text-gray-500">
                        Enhance security with multi-factor authentication
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Permission Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-900">Standard User</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Basic AI access with limited permissions
                    </p>
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                      Apply Template
                    </button>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-900">Power User</h4>
                    <p className="text-sm text-gray-500 mt-1">Full AI access with custom tools</p>
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                      Apply Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedUser ? 'Edit User' : 'Add New User'}
                </h3>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    defaultValue={selectedUser?.name || ''}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    defaultValue={selectedUser?.email || ''}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    defaultValue={selectedUser?.role || 'user'}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="analyst">Analyst</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {selectedUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permissions
                    </label>
                    <div className="space-y-2">
                      {Object.entries(selectedUser.permissions).map(([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={e =>
                              updateUserPermissions(selectedUser.id, { [key]: e.target.checked })
                            }
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle save logic here
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {selectedUser ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIUserManagementDashboard;
