import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorkflow } from '../../contexts/WorkflowContext';

export interface Customer {
  id: string;
  name: string;
  type:
    | 'businesses'
    | 'business-owners'
    | 'asset-sellers'
    | 'brokers-originators'
    | 'service-providers';
  email?: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface CustomerSelectorProps {
  onCustomerSelect?: (customer: Customer | null) => void;
  className?: string;
  placeholder?: string;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  onCustomerSelect,
  className = '',
  placeholder = 'Select Customer',
}) => {
  const { currentTransaction } = useWorkflow();
  const [isOpen, setIsOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock customers data - in production this would come from an API
  const mockCustomers: Customer[] = useMemo(
    () => [
      {
        id: 'CUST-001',
        name: 'Johns Trucking',
        type: 'businesses',
        email: 'contact@johnstrucking.com',
        phone: '555-0123',
        status: 'active',
        createdAt: '2023-01-15',
      },
      {
        id: 'CUST-002',
        name: 'Smith Manufacturing',
        type: 'businesses',
        email: 'info@smithmfg.com',
        phone: '555-0124',
        status: 'active',
        createdAt: '2023-02-20',
      },
      {
        id: 'CUST-003',
        name: 'Johnson Properties LLC',
        type: 'asset-sellers',
        email: 'sales@johnsonprop.com',
        phone: '555-0125',
        status: 'active',
        createdAt: '2023-03-10',
      },
      {
        id: 'CUST-004',
        name: 'Capital Finance Brokers',
        type: 'brokers-originators',
        email: 'deals@capitalfinance.com',
        phone: '555-0126',
        status: 'active',
        createdAt: '2023-04-05',
      },
      {
        id: 'CUST-005',
        name: 'Tech Solutions Inc',
        type: 'service-providers',
        email: 'support@techsolutions.com',
        phone: '555-0127',
        status: 'active',
        createdAt: '2023-05-12',
      },
    ],
    []
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Load customers
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setCustomers(mockCustomers);
      setFilteredCustomers(mockCustomers);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  }, [mockCustomers]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Filter customers based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(
        customer =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setIsOpen(false);
    setSearchTerm('');

    // Notify parent component
    if (onCustomerSelect) {
      onCustomerSelect(customer);
    }

    // Store in localStorage for persistence
    if (customer) {
      localStorage.setItem('selectedCustomerId', customer.id);
    } else {
      localStorage.removeItem('selectedCustomerId');
    }
  };

  // Load previously selected customer from localStorage
  useEffect(() => {
    const savedCustomerId = localStorage.getItem('selectedCustomerId');
    if (savedCustomerId && customers.length > 0) {
      const savedCustomer = customers.find(c => c.id === savedCustomerId);
      if (savedCustomer) {
        setSelectedCustomer(savedCustomer);
        if (onCustomerSelect) {
          onCustomerSelect(savedCustomer);
        }
      }
    }
  }, [customers, onCustomerSelect]);

  // Get customer type label
  const getCustomerTypeLabel = (type: Customer['type']) => {
    const labels = {
      businesses: 'Business',
      'business-owners': 'Business Owner',
      'asset-sellers': 'Asset Seller',
      'brokers-originators': 'Broker/Originator',
      'service-providers': 'Service Provider',
    };
    return labels[type] || type;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <span className="truncate">{selectedCustomer ? selectedCustomer.name : placeholder}</span>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-[99999] mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
          {/* Search input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Customer list */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-600"></div>
                <p className="text-sm text-gray-500 mt-1">Loading customers...</p>
              </div>
            ) : (
              <>
                {/* Option to clear selection */}
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100"
                  onClick={() => handleSelectCustomer(null)}
                >
                  <div className="font-medium text-gray-600">All Customers</div>
                  <div className="text-xs text-gray-400">Show transactions from all customers</div>
                </button>

                {filteredCustomers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No customers found</div>
                ) : (
                  filteredCustomers.map(customer => (
                    <button
                      key={customer.id}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        selectedCustomer?.id === customer.id ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {getCustomerTypeLabel(customer.type)}
                            {customer.email && ` • ${customer.email}`}
                          </div>
                        </div>
                        <span
                          className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            customer.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {customer.status}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
