import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiData } from '../../hooks/useApiData';
import ErrorBoundary from '../common/ErrorBoundary';

// Mock types to replace deleted service
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  type: 'business' | 'business-owner' | 'asset-seller' | 'broker-originator' | 'service-provider';
  status: 'active' | 'inactive' | 'pending';
  dateAdded: string;
  lastContact?: string;
  customerScore?: number;
  avatar?: string;
  assignedTo?: string;
  notes?: string;
  industry?: string;
  tags?: string[];
}

interface CustomerListParams {
  page?: number;
  limit?: number;
  type?: Customer['type'];
  status?: Customer['status'];
  query?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  assignedTo?: string;
  tags?: string[];
}

// Mock service functions
const mockCustomerService = {
  getCustomers: async (params: CustomerListParams) => {
    // Mock implementation - replace with actual API call
    return Promise.resolve({
      status: 200,
      success: true,
      data: [
        {
          id: 'cust-001',
          name: 'Sample Customer',
          email: 'customer@example.com',
          type: 'business' as const,
          status: 'active' as const,
          dateAdded: '2023-01-01',
          customerScore: 85
        }
      ]
    });
  },
  getCustomerTypes: () => [
    { id: 'business', label: 'Business' },
    { id: 'business-owner', label: 'Business Owner' },
    { id: 'asset-seller', label: 'Asset Seller' },
    { id: 'broker-originator', label: 'Broker/Originator' },
    { id: 'service-provider', label: 'Service Provider' }
  ]
};

interface CustomerListProps {
  customerType?: Customer['type'];
  maxItems?: number;
  showHeader?: boolean;
  showFilters?: boolean;
  onCustomerSelect?: (customer: Customer) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customerType = 'business',
  maxItems = 10,
  showHeader = true,
  showFilters = true,
  onCustomerSelect,
}) => {
  const navigate = useNavigate();

  // State for filters and pagination
  const [params, setParams] = useState<CustomerListParams>({
    type: customerType,
    status: 'active',
    page: 1,
    limit: maxItems,
    sortBy: 'dateAdded',
    sortOrder: 'desc',
  });

  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Update params when type prop changes
  useEffect(() => {
    setParams(prev => ({ ...prev, type: customerType }));
  }, [customerType]);

  // Fetch customers with API data hook
  const {
    data: customers,
    isLoading,
    error,
    refetch,
    isEmpty,
  } = useApiData<Customer[]>(
    ['customers', params],
    () => mockCustomerService.getCustomers(params),
    {
      staleTime: 30000, // Consider data fresh for 30 seconds
    }
  );

  // Handle search query changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setParams(prev => ({
      ...prev,
      query: query || undefined,
    }));
  };

  // Submit search
  const submitSearch = () => {
    setParams(prev => ({ ...prev, query: searchQuery, page: 1 }));
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setParams(prev => ({ ...prev, query: undefined, page: 1 }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof CustomerListParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setParams(prev => ({ ...prev, page: newPage }));
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    setParams(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle customer click
  const handleCustomerClick = useCallback(
    (customer: Customer) => {
      if (onCustomerSelect) {
        onCustomerSelect(customer);
      } else {
        navigate(`/customer-retention/customers/${customer.id}`);
      }
    },
    [onCustomerSelect, navigate]
  );

  // Get customer types for filter dropdown
  const customerTypes = mockCustomerService.getCustomerTypes();

  // Render error state
  const renderError = (error: Error) => (
    <div className="p-4 bg-red-50 rounded-md border border-red-200">
      <p className="text-red-700 font-medium">Error loading customers</p>
      <p className="text-red-600 text-sm">{error.message}</p>
      <button
        className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
        onClick={() => refetch()}
      >
        Try again
      </button>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {showHeader && (
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Customers</h3>
              <div className="mt-3 sm:mt-0 flex space-x-2">
                <button
                  onClick={() => refetch()}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  id="type-filter"
                  value={params.type || 'all'}
                  onChange={(e) => handleFilterChange('type', e.target.value === 'all' ? undefined : e.target.value as Customer['type'])}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="all">All Types</option>
                  {customerTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={params.status || 'all'}
                  onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value as Customer['status'])}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  value={params.query || ''}
                  onChange={handleSearch}
                  placeholder="Search customers..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-5 sm:p-6">
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
          )}

          {error && renderError(error)}

          {!isLoading && !error && isEmpty && (
            <div className="text-center py-8 text-gray-500">
              <p>No customers found matching your criteria.</p>
            </div>
          )}

          {!isLoading && !error && !isEmpty && (
            <div className="mt-2 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Email
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Type
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {customers?.map(customer => (
                        <tr
                          key={customer.id}
                          onClick={() => handleCustomerClick(customer)}
                          className={onCustomerSelect ? "cursor-pointer hover:bg-gray-50" : ""}
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                            <div className="flex items-center">
                              {customer.avatar && (
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img className="h-10 w-10 rounded-full" src={customer.avatar} alt="" />
                                </div>
                              )}
                              <div className={customer.avatar ? "ml-4" : ""}>
                                <div className="font-medium text-gray-900">{customer.name}</div>
                                {customer.companyName && (
                                  <div className="text-gray-500">{customer.companyName}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="text-gray-900">{customer.email}</div>
                            {customer.phone && (
                              <div className="text-gray-500">{customer.phone}</div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {getCustomerTypeLabel(customer.type)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(customer.status)}`}>
                              {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && customers && customers.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((params.page || 1) - 1) * (params.limit || maxItems) + 1}</span> to{' '}
                <span className="font-medium">{Math.min((params.page || 1) * (params.limit || maxItems), customers.length)}</span> of{' '}
                <span className="font-medium">{customers.length}</span> results
              </div>
              <div className="flex space-x-2 text-sm">
                <button
                  onClick={() => handlePageChange(Math.max(1, (params.page || 1) - 1))}
                  disabled={(params.page || 1) <= 1}
                  className={`px-3 py-1 rounded ${
                    (params.page || 1) <= 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange((params.page || 1) + 1)}
                  disabled={!customers || customers.length < (params.limit || maxItems)}
                  className={`px-3 py-1 rounded ${
                    !customers || customers.length < (params.limit || maxItems)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Helper function to get the status class
const getStatusClass = (status: Customer['status']): string => {
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

// Helper function to get the customer type label
const getCustomerTypeLabel = (type: Customer['type']): string => {
  switch (type) {
    case 'business':
      return 'Business';
    case 'business-owner':
      return 'Business Owner';
    case 'asset-seller':
      return 'Asset Seller';
    case 'broker-originator':
      return 'Broker / Originator';
    case 'service-provider':
      return 'Service Provider';
    default:
      return type;
  }
};

export default CustomerList;
