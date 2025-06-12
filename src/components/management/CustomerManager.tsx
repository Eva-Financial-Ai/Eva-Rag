import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// Local Customer interface for this component (more comprehensive than the main one)
interface Customer {
  id: string;
  name: string;
  type: 'borrower' | 'lender' | 'broker' | 'vendor' | 'investor' | 'partner';
  entityType: 'individual' | 'business' | 'partnership' | 'corporation' | 'llc' | 'trust';
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'archived';
  industry?: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  taxId?: string;
  website?: string;
  creditScore?: number;
  annualRevenue?: number;
  employeeCount?: number;
  yearEstablished?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastContactDate?: string;
  notes?: string;
  assignedRepId?: string;
  riskRating: 'low' | 'medium' | 'high' | 'very-high';
  totalLoanAmount?: number;
  activeLoanCount?: number;
  relationshipManager?: string;
  contactPerson?: string;

  // Dynamic fields based on customer type
  lenderSpecific?: {
    institutionType: 'bank' | 'credit_union' | 'alternative_lender' | 'private_lender' | 'fintech';
    minimumLoanAmount: number;
    maximumLoanAmount: number;
    interestRateRange: { min: number; max: number };
    lendingProducts: string[];
    geographicFocus: string[];
    underwritingCriteria: string;
    averageTimeToClose: number;
    requiresCollateral: boolean;
  };

  brokerSpecific?: {
    licenseNumber: string;
    commissionStructure: 'percentage' | 'flat_fee' | 'hybrid';
    defaultCommissionRate: number;
    preferredLenders: string[];
    specializations: string[];
    territoryRestrictions: string[];
  };

  vendorSpecific?: {
    vendorType: 'equipment' | 'software' | 'services' | 'consulting' | 'legal';
    serviceCategories: string[];
    certifications: string[];
    preferredPaymentTerms: string;
    contractRequirements: string;
  };
}

interface CustomerManagerProps {
  onEditCustomer?: (customer: Customer) => void;
  onCreateNew?: () => void;
}

// Mock data for demonstration
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Acme Manufacturing Corp',
    type: 'borrower',
    entityType: 'corporation',
    status: 'active',
    industry: 'Manufacturing',
    email: 'contact@acmemfg.com',
    phone: '+1-555-0123',
    address: {
      street: '123 Industrial Way',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      country: 'USA',
    },
    taxId: '12-3456789',
    website: 'https://acmemfg.com',
    creditScore: 785,
    annualRevenue: 2500000,
    employeeCount: 45,
    yearEstablished: 2010,
    tags: ['manufacturing', 'high-value', 'verified'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    lastContactDate: '2024-01-18T09:15:00Z',
    notes: 'Excellent payment history, expanding operations',
    assignedRepId: 'rep-001',
    riskRating: 'low',
    totalLoanAmount: 850000,
    activeLoanCount: 2,
  },
  {
    id: '2',
    name: 'First National Bank',
    type: 'lender',
    entityType: 'corporation',
    status: 'active',
    industry: 'Financial Services',
    annualRevenue: 250000000,
    creditScore: 850,
    yearEstablished: 1952,
    totalLoanAmount: 0,
    email: 'commercial@firstnational.bank',
    phone: '+1 (555) 123-4567',
    address: {
      street: '100 Main Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
    },
    website: 'https://firstnational.bank',
    taxId: '12-3456789',
    tags: ['tier-1-bank', 'commercial-lending', 'sba-preferred'],
    notes: 'Leading commercial lender with competitive rates and fast processing',
    lastContactDate: '2024-01-20',
    riskRating: 'low',
    relationshipManager: 'Sarah Davis',
    createdAt: '2024-01-10T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    lenderSpecific: {
      institutionType: 'bank',
      minimumLoanAmount: 100000,
      maximumLoanAmount: 50000000,
      interestRateRange: { min: 4.5, max: 12.5 },
      lendingProducts: [
        'Commercial Real Estate',
        'Equipment Financing',
        'Working Capital',
        'SBA Loans',
      ],
      geographicFocus: ['Northeast', 'Mid-Atlantic'],
      underwritingCriteria: 'Minimum 2 years in business, 680+ credit score, positive cash flow',
      averageTimeToClose: 30,
      requiresCollateral: true,
    },
  },
  {
    id: '3',
    name: 'Capital Solutions Group',
    type: 'broker',
    entityType: 'llc',
    status: 'active',
    industry: 'Financial Services',
    annualRevenue: 2500000,
    creditScore: 780,
    yearEstablished: 2018,
    totalLoanAmount: 0,
    email: 'info@capitalsolutions.com',
    phone: '+1 (555) 987-6543',
    address: {
      street: '500 Business Plaza',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      country: 'USA',
    },
    contactPerson: 'Jennifer Martinez',
    website: 'https://capitalsolutions.com',
    taxId: '98-7654321',
    tags: ['commercial-broker', 'equipment-specialist', 'high-volume'],
    notes: 'Top-performing broker specializing in equipment financing and working capital',
    lastContactDate: '2024-01-22',
    riskRating: 'low',
    relationshipManager: 'Michael Chen',
    createdAt: '2024-01-12T15:20:00Z',
    updatedAt: '2024-01-22T09:15:00Z',
    brokerSpecific: {
      licenseNumber: 'BR-IL-2018-4567',
      commissionStructure: 'percentage',
      defaultCommissionRate: 3.5,
      preferredLenders: ['First National Bank', 'Capital Direct', 'Equipment Finance Corp'],
      specializations: ['Equipment Financing', 'Working Capital', 'Real Estate'],
      territoryRestrictions: ['Midwest', 'Great Lakes Region'],
    },
  },
];

const CustomerManager: React.FC<CustomerManagerProps> = ({ onEditCustomer, onCreateNew }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'inactive' | 'pending' | 'suspended'
  >('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'revenue' | 'lastContact'>(
    'updated',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load customers from localStorage or API
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    setLoading(true);
    try {
      const savedCustomers = localStorage.getItem('customers');
      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers));
      } else {
        setCustomers(mockCustomers);
        localStorage.setItem('customers', JSON.stringify(mockCustomers));
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Failed to load customers');
      setCustomers(mockCustomers);
    } finally {
      setLoading(false);
    }
  };

  const saveCustomers = (updatedCustomers: Customer[]) => {
    try {
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      setCustomers(updatedCustomers);
    } catch (error) {
      console.error('Error saving customers:', error);
      toast.error('Failed to save customers');
    }
  };

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
      const matchesType = filterType === 'all' || customer.type === filterType;
      const matchesIndustry = filterIndustry === 'all' || customer.industry === filterIndustry;
      return matchesSearch && matchesStatus && matchesType && matchesIndustry;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'revenue':
          comparison = (a.annualRevenue || 0) - (b.annualRevenue || 0);
          break;
        case 'lastContact':
          const aContact = a.lastContactDate ? new Date(a.lastContactDate).getTime() : 0;
          const bContact = b.lastContactDate ? new Date(b.lastContactDate).getTime() : 0;
          comparison = aContact - bContact;
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // CRUD Operations
  const handleCreate = () => {
    onCreateNew?.();
  };

  const handleEdit = (customer: Customer) => {
    onEditCustomer?.(customer);
  };

  const handleDelete = (customerId: string) => {
    const updatedCustomers = customers.filter(cust => cust.id !== customerId);
    saveCustomers(updatedCustomers);
    toast.success('Customer deleted successfully');
    setShowDeleteConfirm(null);
  };

  const handleDuplicate = (customer: Customer) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      name: `${customer.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      activeLoanCount: 0,
      totalLoanAmount: 0,
    };
    const updatedCustomers = [...customers, newCustomer];
    saveCustomers(updatedCustomers);
    toast.success('Customer duplicated successfully');
  };

  const handleStatusChange = (
    customerId: string,
    newStatus: 'active' | 'inactive' | 'pending' | 'suspended',
  ) => {
    const updatedCustomers = customers.map(cust =>
      cust.id === customerId
        ? { ...cust, status: newStatus, updatedAt: new Date().toISOString() }
        : cust,
    );
    saveCustomers(updatedCustomers);
    toast.success(`Customer status updated to ${newStatus}`);
  };

  const handleBulkDelete = () => {
    const updatedCustomers = customers.filter(cust => !selectedCustomers.includes(cust.id));
    saveCustomers(updatedCustomers);
    toast.success(`${selectedCustomers.length} customers deleted`);
    setSelectedCustomers([]);
  };

  const handleBulkStatusChange = (status: 'active' | 'inactive' | 'pending' | 'suspended') => {
    const updatedCustomers = customers.map(cust =>
      selectedCustomers.includes(cust.id)
        ? { ...cust, status, updatedAt: new Date().toISOString() }
        : cust,
    );
    saveCustomers(updatedCustomers);
    toast.success(`${selectedCustomers.length} customers updated`);
    setSelectedCustomers([]);
  };

  // Export/Import functions
  const handleExport = () => {
    const selectedData =
      selectedCustomers.length > 0
        ? customers.filter(cust => selectedCustomers.includes(cust.id))
        : customers;

    const dataStr = JSON.stringify(selectedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Customers exported successfully');
  };

  // Get unique values for filters
  const customerTypes = Array.from(new Set(customers.map(cust => cust.type)));
  const customerIndustries = Array.from(
    new Set(customers.map(cust => cust.industry).filter(Boolean)),
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'very-high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'individual':
        return '👤';
      case 'business':
        return '🏢';
      case 'corporation':
        return '🏛️';
      case 'llc':
        return '🔗';
      case 'partnership':
        return '🤝';
      default:
        return '📋';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="text-white mb-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-3 text-3xl font-bold">Customer Manager</h1>
            <p className="text-lg opacity-90">
              Manage your customer database with comprehensive CRM functionality
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCreate}
              className="bg-white flex items-center rounded-lg px-6 py-3 font-medium text-blue-600 transition-colors hover:bg-blue-50"
            >
              <span className="mr-2">+</span>
              Add New Customer
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-semibold text-gray-900">
                {customers.filter(cust => cust.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Loans</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(
                  customers.reduce((sum, cust) => sum + (cust.totalLoanAmount || 0), 0),
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-3">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Credit Score</p>
              <p className="text-2xl font-semibold text-gray-900">
                {customers.length > 0
                  ? Math.round(
                      customers.reduce((sum, cust) => sum + (cust.creditScore || 0), 0) /
                        customers.filter(cust => cust.creditScore).length,
                    )
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white mb-6 rounded-lg p-6 shadow">
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search customers, email, industry..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {customerTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Industry Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Industry</label>
            <select
              value={filterIndustry}
              onChange={e => setFilterIndustry(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Industries</option>
              {customerIndustries.map(industry => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Created Date</option>
              <option value="name">Name</option>
              <option value="revenue">Revenue</option>
              <option value="lastContact">Last Contact</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Order</label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCustomers.length > 0 && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                {selectedCustomers.length} customer{selectedCustomers.length > 1 ? 's' : ''}{' '}
                selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkStatusChange('active')}
                  className="text-white rounded bg-green-600 px-3 py-1 text-sm hover:bg-green-700"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkStatusChange('inactive')}
                  className="text-white rounded bg-gray-600 px-3 py-1 text-sm hover:bg-gray-700"
                >
                  Deactivate
                </button>
                <button
                  onClick={handleExport}
                  className="text-white rounded bg-blue-600 px-3 py-1 text-sm hover:bg-blue-700"
                >
                  Export
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="text-white bg-red-600 rounded px-3 py-1 text-sm hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedCustomers([])}
                  className="text-white rounded bg-gray-600 px-3 py-1 text-sm hover:bg-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="bg-white mb-6 rounded-lg p-4 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Showing {filteredCustomers.length} of {customers.length} customers
            </span>
            <button
              onClick={() => {
                const allIds = filteredCustomers.map(cust => cust.id);
                setSelectedCustomers(selectedCustomers.length === allIds.length ? [] : allIds);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedCustomers.length === filteredCustomers.length
                ? 'Deselect All'
                : 'Select All'}
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleExport}
              className="text-white rounded bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700"
            >
              Export All
            </button>
            <button
              onClick={loadCustomers}
              className="text-white rounded bg-green-600 px-4 py-2 text-sm hover:bg-green-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white overflow-hidden rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-6xl">👥</span>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No customers found</h3>
            <p className="mt-2 text-gray-600">
              {searchTerm ||
              filterStatus !== 'all' ||
              filterType !== 'all' ||
              filterIndustry !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by adding your first customer.'}
            </p>
            {!searchTerm &&
              filterStatus === 'all' &&
              filterType === 'all' &&
              filterIndustry === 'all' && (
                <button
                  onClick={handleCreate}
                  className="text-white mt-4 rounded-lg bg-blue-600 px-6 py-3 hover:bg-blue-700"
                >
                  Add Your First Customer
                </button>
              )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.length === filteredCustomers.length}
                      onChange={() => {
                        const allIds = filteredCustomers.map(cust => cust.id);
                        setSelectedCustomers(
                          selectedCustomers.length === allIds.length ? [] : allIds,
                        );
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type & Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status & Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Financial Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Last Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => {
                          setSelectedCustomers(prev =>
                            prev.includes(customer.id)
                              ? prev.filter(id => id !== customer.id)
                              : [...prev, customer.id],
                          );
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="mr-3 text-2xl">{getTypeIcon(customer.type)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {customer.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <div className="text-sm capitalize text-gray-900">{customer.type}</div>
                        <div className="text-sm text-gray-500">{customer.industry || 'N/A'}</div>
                        {customer.yearEstablished && (
                          <div className="text-xs text-gray-400">
                            Est. {customer.yearEstablished}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(customer.status)}`}
                        >
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </span>
                        <br />
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRiskColor(customer.riskRating)}`}
                        >
                          {customer.riskRating.replace('-', ' ')} risk
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      <div>
                        {customer.annualRevenue && (
                          <div>Revenue: {formatCurrency(customer.annualRevenue)}</div>
                        )}
                        {customer.creditScore && <div>Credit: {customer.creditScore}</div>}
                        {customer.totalLoanAmount ? (
                          <div>Loans: {formatCurrency(customer.totalLoanAmount)}</div>
                        ) : null}
                        {customer.employeeCount && (
                          <div className="text-xs text-gray-500">
                            {customer.employeeCount} employees
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {customer.lastContactDate ? formatDate(customer.lastContactDate) : 'Never'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDuplicate(customer)}
                          className="text-green-600 hover:text-green-900"
                          title="Duplicate"
                        >
                          📋
                        </button>
                        <div className="relative">
                          <select
                            value={customer.status}
                            onChange={e => handleStatusChange(customer.id, e.target.value as any)}
                            className="rounded border border-gray-300 px-2 py-1 text-xs"
                            title="Change Status"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>
                        <button
                          onClick={() => setShowDeleteConfirm(customer.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="bg-white relative top-20 mx-auto w-96 rounded-md border p-5 shadow-lg">
            <div className="mt-3 text-center">
              <span className="text-4xl">⚠️</span>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Delete Customer</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this customer? This action cannot be undone and
                  will affect all related transactions.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-4 px-4 py-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="text-white rounded bg-gray-500 px-4 py-2 hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="text-white bg-red-600 rounded px-4 py-2 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManager;
