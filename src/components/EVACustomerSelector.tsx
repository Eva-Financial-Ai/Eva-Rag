import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, UserCircleIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useEVACustomer, CustomerProfile } from '../contexts/EVACustomerContext';

interface EVACustomerSelectorProps {
  className?: string;
}

const EVACustomerSelector: React.FC<EVACustomerSelectorProps> = ({ className = '' }) => {
  const { selectedCustomer, selectCustomer } = useEVACustomer();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock customers - in production this would come from API
  const mockCustomers: CustomerProfile[] = [
    {
      id: 'CUST-001',
      display_name: 'John Smith',
      type: 'individual',
      email: 'john.smith@email.com',
      phone: '555-0123',
      status: 'active',
      createdAt: '2023-01-15',
      metadata: {
        credit_score: 720,
        annual_income: 85000,
        risk_level: 'low',
        loan_history: [],
        assets: [],
        liabilities: []
      },
      profile: {
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
        employment_status: 'employed',
        employer: 'Tech Solutions Inc',
        job_title: 'Senior Developer',
        years_at_job: 5
      },
      preferences: {
        communication_method: 'email',
        language: 'en',
        timezone: 'America/Chicago',
        loan_purposes: ['home-improvement', 'debt-consolidation'],
        preferred_loan_terms: ['36-months', '60-months']
      }
    },
    {
      id: 'CUST-002',
      display_name: 'Smith Manufacturing LLC',
      type: 'business',
      email: 'info@smithmfg.com',
      phone: '555-0124',
      status: 'active',
      createdAt: '2023-02-20',
      metadata: {
        credit_score: 680,
        annual_income: 2500000,
        industry: 'Manufacturing',
        risk_level: 'medium',
        business_info: {
          legal_name: 'Smith Manufacturing LLC',
          tax_id: '12-3456789',
          entity_type: 'llc',
          years_in_business: 8,
          annual_revenue: 2500000,
          employees: 45,
          industry_code: 'NAICS-336',
          business_address: '456 Industrial Blvd, Chicago, IL 60601'
        },
        loan_history: [],
        assets: [],
        liabilities: []
      },
      profile: {
        address: '456 Industrial Blvd',
        city: 'Chicago',
        state: 'IL',
        zip: '60601'
      },
      preferences: {
        communication_method: 'email',
        language: 'en',
        timezone: 'America/Chicago',
        loan_purposes: ['equipment-financing', 'working-capital'],
        preferred_loan_terms: ['12-months', '24-months', '36-months']
      }
    },
    {
      id: 'CUST-003',
      display_name: 'Johnson Properties LLC',
      type: 'asset-seller',
      email: 'sales@johnsonprop.com',
      phone: '555-0125',
      status: 'active',
      createdAt: '2023-03-10',
      metadata: {
        credit_score: 750,
        annual_income: 1200000,
        industry: 'Real Estate',
        risk_level: 'low',
        loan_history: [],
        assets: [],
        liabilities: []
      },
      profile: {
        address: '789 Property Ave',
        city: 'Chicago',
        state: 'IL',
        zip: '60602'
      },
      preferences: {
        communication_method: 'phone',
        language: 'en',
        timezone: 'America/Chicago',
        loan_purposes: ['asset-acquisition'],
        preferred_loan_terms: ['24-months', '36-months']
      }
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomerSelect = (customer: CustomerProfile | null) => {
    selectCustomer(customer);
    setIsOpen(false);
  };

  const getCustomerIcon = (type: string) => {
    switch (type) {
      case 'business':
      case 'asset-seller':
      case 'service-provider':
        return BuildingOfficeIcon;
      default:
        return UserCircleIcon;
    }
  };

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        title={selectedCustomer ? `Selected: ${selectedCustomer.display_name}` : 'Select Customer'}
      >
        {selectedCustomer ? (
          <>
            {React.createElement(getCustomerIcon(selectedCustomer.type), {
              className: 'h-5 w-5 text-gray-400',
            })}
            <span className="truncate max-w-32 sm:max-w-48">{selectedCustomer.display_name}</span>
            {selectedCustomer.metadata.risk_level && (
              <span className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getRiskColor(selectedCustomer.metadata.risk_level)}`}>
                {selectedCustomer.metadata.risk_level.toUpperCase()}
              </span>
            )}
          </>
        ) : (
          <>
            <UserCircleIcon className="h-5 w-5 text-gray-400" />
            <span className="hidden sm:inline">Select Customer</span>
          </>
        )}
        <ChevronDownIcon
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">Select Customer for EVA Chat</p>
            <p className="text-xs text-gray-500">Choose a customer to provide context to EVA</p>
          </div>

          {/* Clear Selection */}
          <button
            onClick={() => handleCustomerSelect(null)}
            className="block w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <UserCircleIcon className="h-6 w-6 text-gray-400" />
              <div>
                <div className="font-medium">No Customer Selected</div>
                <div className="text-xs text-gray-500">General EVA assistance</div>
              </div>
            </div>
          </button>

          {/* Customer List */}
          <div className="max-h-80 overflow-y-auto">
            {mockCustomers.map((customer) => {
              const CustomerIcon = getCustomerIcon(customer.type);
              return (
                <button
                  key={customer.id}
                  onClick={() => handleCustomerSelect(customer)}
                  className={`block w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                    selectedCustomer?.id === customer.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <CustomerIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <div className="font-medium text-gray-900 truncate">
                            {customer.display_name}
                          </div>
                          {customer.metadata.risk_level && (
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getRiskColor(customer.metadata.risk_level)}`}>
                              {customer.metadata.risk_level.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500 capitalize">{customer.type.replace('-', ' ')}</span>
                          {customer.metadata.credit_score && (
                            <>
                              <span className="text-xs text-gray-300">•</span>
                              <span className="text-xs text-gray-500">Credit: {customer.metadata.credit_score}</span>
                            </>
                          )}
                          {customer.metadata.industry && (
                            <>
                              <span className="text-xs text-gray-300">•</span>
                              <span className="text-xs text-gray-500">{customer.metadata.industry}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Customer data will be shared with EVA for personalized assistance
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EVACustomerSelector; 