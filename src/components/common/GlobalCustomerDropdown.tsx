import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';
import { useEVAUserContext } from '../../contexts/EVAUserContext';

const GlobalCustomerDropdown: React.FC = () => {
  const { selectedCustomer, customers, selectCustomer, searchCustomers, loadCustomers } =
    useEVAUserContext();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredCustomers = searchQuery ? searchCustomers(searchQuery) : customers;

  const getIcon = (type: string) => {
    switch (type) {
      case 'borrower':
        return <UserIcon className="w-4 h-4" />;
      case 'lender':
        return <BuildingOfficeIcon className="w-4 h-4" />;
      case 'broker':
        return <BriefcaseIcon className="w-4 h-4" />;
      case 'vendor':
        return <BriefcaseIcon className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'borrower':
        return 'bg-blue-100 text-blue-800';
      case 'lender':
        return 'bg-green-100 text-green-800';
      case 'broker':
        return 'bg-purple-100 text-purple-800';
      case 'vendor':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
      >
        <div className="flex items-center space-x-2">
          {selectedCustomer ? (
            <>
              <div className={`p-1 rounded ${getTypeColor(selectedCustomer.type)}`}>
                {getIcon(selectedCustomer.type)}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">{selectedCustomer.name}</div>
                {selectedCustomer.company && (
                  <div className="text-xs text-gray-500">{selectedCustomer.company}</div>
                )}
              </div>
            </>
          ) : (
            <>
              <UserIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">Select Customer</span>
            </>
          )}
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Clear Selection Option */}
          {selectedCustomer && (
            <button
              onClick={() => {
                selectCustomer(null);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 flex items-center space-x-3"
            >
              <div className="p-1 rounded bg-gray-100">
                <UserIcon className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">All Customers</div>
                <div className="text-xs text-gray-500">View data for all customers</div>
              </div>
            </button>
          )}

          {/* Customer List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => {
                    selectCustomer(customer);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                    selectedCustomer?.id === customer.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className={`p-1 rounded ${getTypeColor(customer.type)}`}>
                    {getIcon(customer.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      {customer.totalTransactions && (
                        <span className="text-xs text-gray-500">
                          Transactions: {customer.totalTransactions}
                        </span>
                      )}
                    </div>
                    {customer.company && (
                      <div className="text-xs text-gray-600">{customer.company}</div>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(customer.type)}`}
                      >
                        {customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}
                      </span>
                      {customer.accountNumber && (
                        <span className="text-xs text-gray-500">{customer.accountNumber}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                {searchQuery ? 'No customers found' : 'No customers available'}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{filteredCustomers.length} customers</span>
              {selectedCustomer && (
                <span className="font-medium text-primary-600">
                  Viewing: {selectedCustomer.name}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalCustomerDropdown;
