import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CRPDashboard from '../crp/CRPDashboard';
import CRPDashboardTest from '../crp/CRPDashboardTest';
import ContactManager from '../management/ContactManager';
import CustomerManager from '../management/CustomerManager';
import FileManager from '../management/FileManager';
import SafeFormsManager from '../management/SafeFormsManager';

import { logBusinessProcess } from '../../utils/auditLogger';

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CRP Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 m-4 flex min-h-[400px] items-center justify-center rounded-lg">
          <div className="p-6 text-center">
            <div className="mb-4 text-6xl text-red-600">⚠️</div>
            <h2 className="mb-2 text-xl font-semibold text-red-800">CRP Dashboard Error</h2>
            <p className="mb-4 text-red-600">
              {this.state.error?.message || 'Something went wrong loading the CRP Dashboard'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="text-white bg-red-600 rounded px-4 py-2 hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface DashboardStats {
  customers: { total: number; active: number; avgCredit: number; totalLoans: number };
  contacts: { total: number; decisionMakers: number; companies: number };
  files: { total: number; approved: number; totalSize: number; encrypted: number };
  forms: { total: number; active: number; pendingSignatures: number; submissions: number };
}

type ActiveTab =
  | 'dashboard'
  | 'customers'
  | 'contacts'
  | 'files'
  | 'forms'
  | 'crp-dashboard'
  | 'crp-test'
  | 'risk-lab';

const CRUDNavigationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const navigate = useNavigate();

  // Debug logging for activeTab changes
  useEffect(() => {
    console.log('🔧 CRUDNavigationHub activeTab changed to:', activeTab);
  }, [activeTab]);
  const [stats, setStats] = useState<DashboardStats>({
    customers: { total: 0, active: 0, avgCredit: 0, totalLoans: 0 },
    contacts: { total: 0, decisionMakers: 0, companies: 0 },
    files: { total: 0, approved: 0, totalSize: 0, encrypted: 0 },
    forms: { total: 0, active: 0, pendingSignatures: 0, submissions: 0 },
  });

  // Load stats from localStorage
  useEffect(() => {
    const loadStats = () => {
      try {
        // Load customers
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        const customerStats = {
          total: customers.length,
          active: customers.filter((c: any) => c.status === 'active').length,
          avgCredit:
            customers.length > 0
              ? Math.round(
                  customers.reduce((sum: number, c: any) => sum + (c.creditScore || 0), 0) /
                    customers.filter((c: any) => c.creditScore).length,
                )
              : 0,
          totalLoans: customers.reduce((sum: number, c: any) => sum + (c.totalLoanAmount || 0), 0),
        };

        // Load contacts
        const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
        const contactStats = {
          total: contacts.length,
          decisionMakers: contacts.filter((c: any) => c.isDecisionMaker).length,
          companies: new Set(contacts.map((c: any) => c.companyId).filter(Boolean)).size,
        };

        // Load files
        const files = JSON.parse(localStorage.getItem('files') || '[]');
        const fileStats = {
          total: files.length,
          approved: files.filter((f: any) => f.status === 'approved').length,
          totalSize: files.reduce((sum: number, f: any) => sum + (f.size || 0), 0),
          encrypted: files.filter((f: any) => f.isEncrypted).length,
        };

        // Load forms
        const forms = JSON.parse(localStorage.getItem('safeForms') || '[]');
        const formStats = {
          total: forms.length,
          active: forms.filter((f: any) => f.status === 'active').length,
          pendingSignatures: forms.reduce(
            (sum: number, f: any) =>
              sum + f.signatures.filter((s: any) => s.status === 'pending').length,
            0,
          ),
          submissions: forms.reduce((sum: number, f: any) => sum + (f.submissionCount || 0), 0),
        };

        setStats({
          customers: customerStats,
          contacts: contactStats,
          files: fileStats,
          forms: formStats,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTabIcon = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return '📊';
      case 'customers':
        return '🏢';
      case 'contacts':
        return '📇';
      case 'files':
        return '📁';
      case 'forms':
        return '📝';
      case 'crp-dashboard':
        return '🤝';
      case 'crp-test':
        return '🤖';
      case 'risk-lab':
        return '🧪';
      default:
        return '📋';
    }
  };

  const getTabColor = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return 'from-slate-600 to-gray-700';
      case 'customers':
        return 'from-blue-600 to-indigo-700';
      case 'contacts':
        return 'from-green-600 to-teal-700';
      case 'files':
        return 'from-purple-600 to-indigo-700';
      case 'forms':
        return 'from-indigo-600 to-purple-700';
      case 'crp-dashboard':
        return 'from-cyan-600 to-blue-700';
      case 'crp-test':
        return 'from-pink-600 to-purple-700';
      case 'risk-lab':
        return 'from-orange-600 to-red-700';
      default:
        return 'from-gray-600 to-slate-700';
    }
  };

  const renderDashboard = () => (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6">
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${getTabColor('dashboard')} text-white mb-8 rounded-lg p-6 shadow-lg lg:p-8`}
      >
        <div className="text-center">
          <h1 className="mb-3 text-2xl font-bold lg:text-4xl">
            EVA AI Commercial Lending Platform
          </h1>
          <p className="text-lg opacity-90 lg:text-xl">
            Comprehensive CRUD Management for Lenders & Brokers
          </p>
          <div className="mt-4 text-sm opacity-80 lg:text-base">
            Unified dashboard for customer management, document processing, and financial workflows
          </div>
        </div>
      </div>

      {/* Quick CRP Access Banner */}
      <div className="mb-6 rounded-lg border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="mb-2 flex items-center text-lg font-semibold text-cyan-900">
              <span className="mr-2">🤝</span>
              Customer Retention Platform (CRP) Dashboard
            </h3>
            <p className="text-sm text-cyan-700">
              Access your dedicated CRP Dashboard with unified customer management, calendar
              integration, and post-closing commitments.
            </p>
          </div>
          <div className="flex flex-col space-y-2 lg:flex-row lg:space-x-2 lg:space-y-0">
            <button
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔧 CRP Dashboard Button Clicked - Navigating to /crp-dashboard');
                navigate('/crp-dashboard');
              }}
              className="text-white whitespace-nowrap rounded-lg bg-cyan-600 px-6 py-2 font-medium transition-colors hover:bg-cyan-700"
            >
              Open CRP Dashboard
            </button>
            <button
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔧 Direct CRP Test - Force showing CRP Test Component');
                setActiveTab('crp-test');
              }}
              className="text-white whitespace-nowrap rounded-lg bg-green-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-green-700"
            >
              🧪 Test CRP Direct
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Customers Card */}
        <div
          className="bg-white cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          onClick={() => setActiveTab('customers')}
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg font-semibold">Customers</h3>
                <p className="text-sm text-blue-100">Business Management</p>
              </div>
              <span className="text-3xl">🏢</span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 lg:text-2xl">
                  {stats.customers.total}
                </div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600 lg:text-2xl">
                  {stats.customers.active}
                </div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {stats.customers.avgCredit}
                </div>
                <div className="text-xs text-gray-600">Avg Credit</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-purple-600">
                  {formatCurrency(stats.customers.totalLoans)}
                </div>
                <div className="text-xs text-gray-600">Loans</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contacts Card */}
        <div
          className="bg-white cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          onClick={() => setActiveTab('contacts')}
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg font-semibold">Contacts</h3>
                <p className="text-sm text-green-100">Relationship Mapping</p>
              </div>
              <span className="text-3xl">📇</span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 lg:text-2xl">
                  {stats.contacts.total}
                </div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600 lg:text-2xl">
                  {stats.contacts.decisionMakers}
                </div>
                <div className="text-xs text-gray-600">Decision Makers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {stats.contacts.companies}
                </div>
                <div className="text-xs text-gray-600">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-green-600">
                  {stats.contacts.total > 0
                    ? Math.round((stats.contacts.decisionMakers / stats.contacts.total) * 100)
                    : 0}
                  %
                </div>
                <div className="text-xs text-gray-600">Key Contacts</div>
              </div>
            </div>
          </div>
        </div>

        {/* CRP Dashboard Card */}
        <div
          className="bg-white cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔧 CRP Card Clicked - Navigating to /crp-dashboard');
            navigate('/crp-dashboard');
          }}
        >
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg font-semibold">CRP Dashboard</h3>
                <p className="text-sm text-cyan-100">Customer Retention</p>
              </div>
              <span className="text-3xl">🤝</span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 lg:text-2xl">24</div>
                <div className="text-xs text-gray-600">Commitments</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600 lg:text-2xl">18</div>
                <div className="text-xs text-gray-600">On Track</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-orange-600">6</div>
                <div className="text-xs text-gray-600">Follow-ups</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-blue-600">95%</div>
                <div className="text-xs text-gray-600">Retention</div>
              </div>
            </div>
          </div>
        </div>

        {/* Files Card */}
        <div
          className="bg-white cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          onClick={() => setActiveTab('files')}
        >
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-lg font-semibold">Files</h3>
                <p className="text-sm text-purple-100">Document Management</p>
              </div>
              <span className="text-3xl">📁</span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 lg:text-2xl">
                  {stats.files.total}
                </div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600 lg:text-2xl">
                  {stats.files.approved}
                </div>
                <div className="text-xs text-gray-600">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {formatFileSize(stats.files.totalSize)}
                </div>
                <div className="text-xs text-gray-600">Total Size</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-orange-600">{stats.files.encrypted}</div>
                <div className="text-xs text-gray-600">Encrypted</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Responsive */}
      <div className="bg-white mb-6 rounded-lg p-4 shadow lg:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <button
            onClick={() => setActiveTab('customers')}
            className="rounded-lg border border-blue-200 p-3 transition-colors hover:bg-blue-50 lg:p-4"
          >
            <div className="mb-2 text-2xl">🏢</div>
            <div className="text-xs font-medium lg:text-sm">Add Customer</div>
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className="rounded-lg border border-green-200 p-3 transition-colors hover:bg-green-50 lg:p-4"
          >
            <div className="mb-2 text-2xl">📇</div>
            <div className="text-xs font-medium lg:text-sm">Add Contact</div>
          </button>
          <button
            onClick={() => setActiveTab('crp-dashboard')}
            className="rounded-lg border border-cyan-200 p-3 transition-colors hover:bg-cyan-50 lg:p-4"
          >
            <div className="mb-2 text-2xl">🤝</div>
            <div className="text-xs font-medium lg:text-sm">CRP Dashboard</div>
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className="rounded-lg border border-purple-200 p-3 transition-colors hover:bg-purple-50 lg:p-4"
          >
            <div className="mb-2 text-2xl">📤</div>
            <div className="text-xs font-medium lg:text-sm">Upload File</div>
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className="rounded-lg border border-indigo-200 p-3 transition-colors hover:bg-indigo-50 lg:p-4"
          >
            <div className="mb-2 text-2xl">📝</div>
            <div className="text-xs font-medium lg:text-sm">Create Form</div>
          </button>
          <button
            onClick={() => setActiveTab('risk-lab')}
            className="rounded-lg border border-orange-200 p-3 transition-colors hover:bg-orange-50 lg:p-4"
          >
            <div className="mb-2 text-2xl">🧪</div>
            <div className="text-xs font-medium lg:text-sm">Risk Lab</div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-4 shadow lg:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="space-y-3">
          <div className="bg-gray-50 flex items-center space-x-3 rounded p-3">
            <span className="text-blue-600">🏢</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                New customer "Acme Manufacturing" added
              </div>
              <div className="text-xs text-gray-500">2 hours ago</div>
            </div>
          </div>
          <div className="bg-gray-50 flex items-center space-x-3 rounded p-3">
            <span className="text-green-600">📝</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                Loan application form signed by John Smith
              </div>
              <div className="text-xs text-gray-500">4 hours ago</div>
            </div>
          </div>
          <div className="bg-gray-50 flex items-center space-x-3 rounded p-3">
            <span className="text-purple-600">📁</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                Financial statements approved for Green Energy LLC
              </div>
              <div className="text-xs text-gray-500">6 hours ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Navigation Tabs - Responsive */}
      <div className="bg-white border-b shadow-sm">
        <div className="mx-auto max-w-7xl">
          <nav className="flex space-x-1 overflow-x-auto p-2 lg:p-4">
            {(
              [
                'dashboard',
                'customers',
                'contacts',
                'files',
                'forms',
                'crp-dashboard',
                'crp-test',
                'risk-lab',
              ] as ActiveTab[]
            ).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  if (tab === 'crp-dashboard') {
                    console.log('🔧 CRP Dashboard Tab Clicked - Navigating to /crp-dashboard');
                    navigate('/crp-dashboard');
                  } else {
                    setActiveTab(tab);
                  }
                }}
                className={`flex items-center space-x-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 lg:px-6 lg:py-3 lg:text-sm ${
                  activeTab === tab
                    ? 'text-white bg-gradient-to-r shadow-md ' + getTabColor(tab)
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } `}
              >
                <span className="text-base lg:text-lg">{getTabIcon(tab)}</span>
                <span className="capitalize">
                  {tab === 'risk-lab'
                    ? 'Risk Lab'
                    : tab === 'crp-dashboard'
                      ? 'CRP Dashboard'
                      : tab === 'crp-test'
                        ? 'CRP Test'
                        : tab}
                </span>
                {tab !== 'dashboard' && tab !== 'risk-lab' && tab !== 'crp-dashboard' && (
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${activeTab === tab ? 'bg-white/20' : 'bg-gray-200'} `}
                  >
                    {tab === 'customers' && stats.customers.total}
                    {tab === 'contacts' && stats.contacts.total}
                    {tab === 'files' && stats.files.total}
                    {tab === 'forms' && stats.forms.total}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Debug Panel */}
      <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-yellow-800">🔧 Debug Panel</h3>
            <p className="text-xs text-yellow-700">
              Current activeTab: <strong>{activeTab}</strong>
            </p>
          </div>
          <button
            onClick={() => {
              console.log('🔧 Force CRP Dashboard - Navigating to /crp-dashboard');
              navigate('/crp-dashboard');
            }}
            className="text-white rounded bg-yellow-600 px-3 py-1 text-xs hover:bg-yellow-700"
          >
            Force CRP Dashboard
          </button>
        </div>
      </div>

      {/* Content Area - Responsive */}
      <div className="min-h-screen flex-1">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'customers' && (
          <div className="p-4 lg:p-6">
            <CustomerManager
              onEditCustomer={customer => {
                /* debugLog("general", "log_statement", "Edit customer:", customer) */
              }}
              onCreateNew={() => {
                /* debugLog("general", "log_statement", "Create new customer") */
              }}
            />
          </div>
        )}
        {activeTab === 'contacts' && (
          <div className="p-4 lg:p-6">
            <ContactManager
              onEditContact={contact => {
                /* debugLog("general", "log_statement", "Edit contact:", contact) */
              }}
              onCreateNew={() => {
                /* debugLog("general", "log_statement", "Create new contact") */
              }}
            />
          </div>
        )}
        {activeTab === 'files' && (
          <div className="p-4 lg:p-6">
            <FileManager
              onEditFile={file =>
                logBusinessProcess('file_management', 'edit_file', true, { fileName: file.name })
              }
              onCreateNew={() => {
                /* debugLog("general", "log_statement", "Upload new file") */
              }}
            />
          </div>
        )}
        {activeTab === 'forms' && (
          <div className="p-4 lg:p-6">
            <SafeFormsManager
              onEditForm={form => {
                /* debugLog("general", "log_statement", "Edit form:", form) */
              }}
              onCreateNew={() => {
                /* debugLog("general", "log_statement", "Create new form") */
              }}
            />
          </div>
        )}
        {activeTab === 'crp-dashboard' && (
          <div className="crp-dashboard-container">
            <ErrorBoundary>
              <div className="p-4">
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h2 className="text-lg font-semibold text-blue-800">🔧 CRP Dashboard Debug</h2>
                  <p className="text-blue-600">Active Tab: {activeTab}</p>
                  <p className="text-blue-600">CRP Dashboard Component Loading...</p>
                </div>
                <CRPDashboard />
              </div>
            </ErrorBoundary>
          </div>
        )}
        {activeTab === 'crp-test' && (
          <div className="crp-test-container">
            <ErrorBoundary>
              <div className="p-4">
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h2 className="text-lg font-semibold text-blue-800">🔧 CRP Test Debug</h2>
                  <p className="text-blue-600">Active Tab: {activeTab}</p>
                  <p className="text-blue-600">CRP Test Component Loading...</p>
                </div>
                <CRPDashboardTest />
              </div>
            </ErrorBoundary>
          </div>
        )}
        {activeTab === 'risk-lab' && (
          <div className="bg-gray-50 min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-6">
              <div className="text-white mb-8 rounded-lg bg-gradient-to-r from-orange-600 to-red-700 p-6 shadow-lg lg:p-8">
                <div className="text-center">
                  <h1 className="mb-3 text-2xl font-bold lg:text-3xl">
                    🧪 Risk Assessment Laboratory
                  </h1>
                  <p className="text-lg opacity-90 lg:text-xl">
                    Advanced risk modeling and Smart Match configuration workspace
                  </p>
                  <div className="mt-4 text-sm opacity-80">
                    Configure risk parameters, scoring models, and instrument matching criteria
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg">
                <iframe
                  src="/risk-lab"
                  className="h-[600px] w-full rounded-lg border-0 lg:h-[800px]"
                  title="Risk Lab"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRUDNavigationHub;
