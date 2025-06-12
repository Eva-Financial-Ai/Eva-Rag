import React, { useState } from 'react';
import { useApiData } from '../../hooks/useApiData';

// Mock types and service - replace with external API calls
export interface Deal {
  id: string;
  title: string;
  status: DealStatus;
  type: DealType;
  amount: number;
  created_at: string;
  updated_at: string;
}

export type DealStatus = 'active' | 'pending' | 'completed' | 'cancelled';
export type DealType = 'loan' | 'credit_line' | 'equipment_finance' | 'real_estate';

// Mock service functions
const mockDealService = {
  getDeals: async (filters: any) => {
    // Mock implementation - replace with actual external API call
    return {
      status: 200,
      success: true,
      data: [
        {
          id: '1',
          title: 'Small Business Loan Application',
          status: 'active' as DealStatus,
          type: 'loan' as DealType,
          amount: 150000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
  },
  getDealStatuses: () => ['active', 'pending', 'completed', 'cancelled'] as DealStatus[],
  getDealTypes: () => ['loan', 'credit_line', 'equipment_finance', 'real_estate'] as DealType[]
};

interface DealListProps {
  initialFilters?: {
    status?: DealStatus;
    type?: DealType;
  };
}

/**
 * DealList component that demonstrates API integration with the deal service
 */
const DealList: React.FC<DealListProps> = ({ initialFilters }) => {
  // State for filters
  const [filters, setFilters] = useState(initialFilters || {});
  
  // Fetch deals with API data hook
  const { 
    data: deals, 
    isLoading, 
    error, 
    refetch,
    isEmpty 
  } = useApiData<Deal[]>(
    ['deals', filters], // Query key includes filters for proper cache invalidation
    () => mockDealService.getDeals(filters),
    {
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
    }
  );

  // Handle filter changes
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      status: value === 'all' ? undefined : value as DealStatus,
    }));
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      type: value === 'all' ? undefined : value as DealType,
    }));
  };

  // Get available statuses and types
  const dealStatuses = mockDealService.getDealStatuses();
  const dealTypes = mockDealService.getDealTypes();
  
  // Calculate total value of deals
  const totalValue = deals?.reduce((total, deal) => total + deal.amount, 0) || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Financing Deals</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => refetch()}
            className="px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || 'all'}
            onChange={handleStatusChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
          >
            <option value="all">All Statuses</option>
            {dealStatuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deal Type
          </label>
          <select
            value={filters.type || 'all'}
            onChange={handleTypeChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
          >
            <option value="all">All Types</option>
            {dealTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
          <p className="text-red-600">Error: {error.message}</p>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && isEmpty && !error && (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No deals found matching your filters.</p>
        </div>
      )}
      
      {/* Deal list */}
      {!isLoading && !isEmpty && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {deals?.length} deals with total value ${totalValue.toLocaleString()}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deals?.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                      <div className="text-xs text-gray-500">ID: {deal.id}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{deal.title}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${deal.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {deal.title}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${getStatusColor(deal.status)}`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {deal.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// Helper functions for displaying status and type labels
const getStatusColor = (status: DealStatus): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default DealList; 