import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import {
  RoleBasedCustomerView,
  CustomerData,
} from '../../components/customerRetention/RoleBasedCustomerView';
import { useUserPermissions } from '../../hooks/useUserPermissions';

import { debugLog } from '../../utils/auditLogger';

// Mock customer data
const mockCustomersData: CustomerData[] = [
  {
    id: 'CUST-001',
    name: 'Acme Industries LLC',
    type: 'business',
    category: 'borrower',
    status: 'active',
    creditScore: 720,
    annualRevenue: 5000000,
    loanBalance: 750000,
    paymentHistory: 'excellent',
    riskScore: 'low',
    defaultProbability: 0.02,
    relationshipLength: 36,
    totalTransactions: 12,
    totalVolume: 2500000,
    lastContactDate: '2024-01-15',
    primaryContact: 'John Smith',
    email: 'john@acmeindustries.com',
    phone: '(555) 123-4567',
  },
  {
    id: 'CUST-002',
    name: 'TechStart Solutions',
    type: 'business',
    category: 'borrower',
    status: 'at-risk',
    creditScore: 650,
    annualRevenue: 2000000,
    loanBalance: 450000,
    paymentHistory: 'fair',
    riskScore: 'high',
    defaultProbability: 0.15,
    relationshipLength: 18,
    totalTransactions: 6,
    totalVolume: 800000,
    lastContactDate: '2024-01-20',
    primaryContact: 'Sarah Johnson',
    email: 'sarah@techstart.com',
    phone: '(555) 234-5678',
  },
  {
    id: 'VEND-001',
    name: 'Premium Equipment Co',
    type: 'vendor',
    category: 'vendor',
    status: 'active',
    assetType: 'Heavy Equipment',
    inventoryValue: 3500000,
    avgDealSize: 125000,
    totalTransactions: 42,
    totalVolume: 5250000,
    relationshipLength: 48,
    lastContactDate: '2024-01-25',
    primaryContact: 'Mike Davis',
    email: 'mike@premiumequip.com',
    phone: '(555) 345-6789',
  },
  {
    id: 'BROK-001',
    name: 'Capital Connect Partners',
    type: 'broker',
    category: 'broker',
    status: 'active',
    dealsSubmitted: 28,
    approvalRate: 0.75,
    avgCommission: 12500,
    totalTransactions: 21,
    totalVolume: 4200000,
    relationshipLength: 24,
    lastContactDate: '2024-01-22',
    primaryContact: 'Lisa Chen',
    email: 'lisa@capitalconnect.com',
    phone: '(555) 456-7890',
  },
  {
    id: 'CUST-003',
    name: 'Green Valley Farms',
    type: 'business',
    category: 'borrower',
    status: 'prospect',
    creditScore: 680,
    annualRevenue: 3500000,
    relationshipLength: 0,
    primaryContact: 'Robert Wilson',
    email: 'robert@greenvalley.com',
    phone: '(555) 567-8901',
  },
  {
    id: 'LEND-001',
    name: 'Capital Finance Corp',
    type: 'business',
    category: 'lender',
    status: 'active',
    creditScore: 800,
    annualRevenue: 10000000,
    loanBalance: 0,
    paymentHistory: 'excellent',
    riskScore: 'low',
    defaultProbability: 0.01,
    relationshipLength: 60,
    totalTransactions: 100,
    totalVolume: 50000000,
    lastContactDate: '2024-02-01',
    primaryContact: 'George Miller',
    email: 'gmiller@capitalfinance.com',
    phone: '(555) 678-9876',
  },
  {
    id: 'SERV-001',
    name: 'Compliance Solutions Inc',
    type: 'vendor',
    category: 'service_provider',
    status: 'active',
    assetType: 'Compliance Software',
    inventoryValue: 0,
    avgDealSize: 20000,
    totalTransactions: 15,
    totalVolume: 300000,
    relationshipLength: 12,
    lastContactDate: '2024-01-28',
    primaryContact: 'Lisa Wong',
    email: 'lisa@compliancesolutions.com',
    phone: '(555) 321-4567',
  },
  {
    id: 'BLH-001',
    name: 'Hybrid Financial Group',
    type: 'business',
    category: 'broker_lender_hybrid',
    status: 'active',
    creditScore: 750,
    annualRevenue: 7000000,
    loanBalance: 2000000,
    paymentHistory: 'good',
    riskScore: 'medium',
    defaultProbability: 0.06,
    relationshipLength: 30,
    totalTransactions: 25,
    totalVolume: 8000000,
    lastContactDate: '2024-02-05',
    primaryContact: 'Henry Adams',
    email: 'hadams@hybridfinancial.com',
    phone: '(555) 789-0123',
  },
];

const CustomerRetentionCustomers: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getBaseUserType, currentRole, hasPermission } = useUserPermissions();
  const [customerType, setCustomerType] = useState<string>('all');
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>([]);
  const [showCRMHint, setShowCRMHint] = useState(true);

  const mockCustomers = useMemo(() => mockCustomersData, []);

  // Extract the customer type from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type') || 'all';
    setCustomerType(typeParam);
  }, [location.search]);

  // Filter customers based on selected type and user permissions
  useEffect(() => {
    const baseType = getBaseUserType(currentRole);
    let filtered = [...mockCustomers];

    // Filter by customer type
    if (customerType !== 'all') {
      switch (customerType) {
        case 'borrowers':
          filtered = filtered.filter(c => c.category === 'borrower');
          break;
        case 'vendors':
          filtered = filtered.filter(c => c.category === 'vendor');
          break;
        case 'brokers':
          filtered = filtered.filter(c => c.category === 'broker');
          break;
        case 'lenders':
          filtered = filtered.filter(c => c.category === 'lender');
          break;
        case 'service-providers':
          filtered = filtered.filter(c => c.category === 'service_provider');
          break;
        case 'broker-lender-hybrid':
          filtered = filtered.filter(c => c.category === 'broker_lender_hybrid');
          break;
        case 'businesses':
          filtered = filtered.filter(c => c.type === 'business');
          break;
        case 'prospects':
          filtered = filtered.filter(c => c.status === 'prospect');
          break;
        case 'at-risk':
          filtered = filtered.filter(c => c.status === 'at-risk');
          break;
      }
    }

    // Apply role-based filtering
    switch (baseType) {
      case 'borrower':
        // Borrowers can only see their own data and some vendor data
        filtered = filtered.filter(c => c.type === 'vendor' || c.id === 'CUST-001');
        break;
      case 'vendor':
        // Vendors can see potential customers
        filtered = filtered.filter(c => c.type === 'business' || c.type === 'broker');
        break;
      case 'broker':
        // Brokers can see businesses and vendors
        filtered = filtered.filter(c => c.type === 'business' || c.type === 'vendor');
        break;
      case 'lender':
        // Lenders can see all customer types
        break;
      case 'admin':
        // Admins can see everything
        break;
    }

    setFilteredCustomers(filtered);
  }, [customerType, currentRole, getBaseUserType, mockCustomers]);

  // Handler for type change
  const handleTypeChange = (type: string) => {
    navigate(`/customer-retention/customers?type=${type}`);
  };

  // Handler for customer actions
  const handleCustomerAction = (action: string, customerId: string) => {
    debugLog('general', 'log_statement', `Action: ${action} for customer: ${customerId}`)

    switch (action) {
      case 'create_application':
        navigate(`/credit-application?customerId=${customerId}`);
        break;
      case 'view_details':
        navigate(`/customer/${customerId}`);
        break;
      case 'manage_listings':
        navigate(`/vendor/listings?vendorId=${customerId}`);
        break;
      case 'risk_assessment':
        navigate(`/risk-assessment?customerId=${customerId}`);
        break;
      case 'schedule_meeting':
        navigate(`/calendar?action=schedule&customerId=${customerId}`);
        break;
      default:
        debugLog('general', 'log_statement', `Unhandled action: ${action}`)
    }
  };

  // Get customer type options based on user role
  const getCustomerTypeOptions = () => {
    const baseType = getBaseUserType(currentRole);
    const allOptions = [
      { value: 'all', label: 'All Customers' },
      { value: 'borrowers', label: 'Borrowers' },
      { value: 'vendors', label: 'Vendors' },
      { value: 'brokers', label: 'Brokers' },
      { value: 'lenders', label: 'Lenders' },
      { value: 'service-providers', label: 'Service Providers' },
      { value: 'broker-lender-hybrid', label: 'Broker/Lender Hybrid' },
      { value: 'businesses', label: 'Businesses' },
      { value: 'prospects', label: 'Prospects' },
      { value: 'at-risk', label: 'At Risk' },
    ];

    // Filter options based on user type
    switch (baseType) {
      case 'borrower':
        return allOptions.filter(opt => ['all', 'vendors'].includes(opt.value));
      case 'vendor':
        return allOptions.filter(opt =>
          ['all', 'businesses', 'brokers', 'prospects'].includes(opt.value)
        );
      case 'broker':
        return allOptions.filter(opt =>
          ['all', 'businesses', 'vendors', 'prospects'].includes(opt.value)
        );
      default:
        return allOptions;
    }
  };

  return (
    <PageLayout title="Customer Retention - Customers">
      <div className="w-full">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Customer Management</h1>
            <p className="text-gray-600">
              View and manage customer relationships based on your role and permissions
            </p>
          </div>

          {/* Customer Retention Platform Hint */}
          {showCRMHint && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                    <span className="mr-2">🚀</span>
                    Customer Retention Platform - Your Finance CRM
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Access the unified Customer Retention Platform (CRP) - our comprehensive finance-specific CRM with integrated 
                    FileLock document management, customer-transaction associations, and advanced analytics.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-blue-600">
                    <span className="flex items-center gap-1">
                      <span>📊</span> Unified CRM Dashboard
                    </span>
                    <span className="flex items-center gap-1">
                      <span>📄</span> Document-Customer-Transaction Links
                    </span>
                    <span className="flex items-center gap-1">
                      <span>📅</span> Calendar Integration
                    </span>
                    <span className="flex items-center gap-1">
                      <span>🤝</span> Post-Closing Commitments
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <button
                    onClick={() => navigate('/customer-retention')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Open CRP Dashboard
                  </button>
                  <button
                    onClick={() => setShowCRMHint(false)}
                    className="text-blue-500 hover:text-blue-700 text-xl"
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Customer Type Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {getCustomerTypeOptions().map(option => (
              <button
                key={option.value}
                onClick={() => handleTypeChange(option.value)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  customerType === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Customer Grid */}
          {filteredCustomers.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-500">No customers found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {filteredCustomers.map(customer => (
                <RoleBasedCustomerView
                  key={customer.id}
                  customer={customer}
                  onAction={handleCustomerAction}
                />
              ))}
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Summary Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Customers</p>
                <p className="text-2xl font-bold">{filteredCustomers.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredCustomers.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">At Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredCustomers.filter(c => c.status === 'at-risk').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Prospects</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredCustomers.filter(c => c.status === 'prospect').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CustomerRetentionCustomers;
