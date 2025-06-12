import {
  BuildingOfficeIcon,
  ChevronDownIcon,
  StarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useRef, useState } from 'react';
import { useCustomer as useCustomerContext, CustomerProfile } from '../../../contexts/CustomerContext';

// Re-export the CustomerSelectorOptions type from context
interface CustomerSelectorOptions {
  active_profiles: CustomerProfile[];
  recent_profiles: CustomerProfile[];
  favorite_profiles: CustomerProfile[];
  suggested_profiles: CustomerProfile[];
}

interface CustomerSelectorProps {
  className?: string;
  onCustomerChange?: (customer: CustomerProfile) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  className = '',
  onCustomerChange,
}) => {
  const {
    activeCustomer,
    selectorOptions,
    setActiveCustomer,
    refreshSelectorOptions,
    toggleFavoriteCustomer,
  } = useCustomerContext();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<CustomerSelectorOptions | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectorOptions && searchTerm) {
      const filterCustomers = (customers: CustomerProfile[]) =>
        customers.filter(
          customer =>
            customer.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.metadata.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.metadata.tags && customer.metadata.tags.some(tag =>
              tag.toLowerCase().includes(searchTerm.toLowerCase()),
            )),
        );

      setFilteredOptions({
        active_profiles: filterCustomers(selectorOptions.active_profiles),
        recent_profiles: filterCustomers(selectorOptions.recent_profiles),
        favorite_profiles: filterCustomers(selectorOptions.favorite_profiles),
        suggested_profiles: filterCustomers(selectorOptions.suggested_profiles),
      });
    } else {
      setFilteredOptions(selectorOptions);
    }
  }, [selectorOptions, searchTerm]);

  const handleCustomerSelect = async (customer: CustomerProfile) => {
    try {
      await setActiveCustomer(customer.id);
      setIsOpen(false);
      setSearchTerm('');
      onCustomerChange?.(customer);
    } catch (error) {
      console.error('Failed to set active customer:', error);
    }
  };

  const handleToggleFavorite = async (customer: CustomerProfile, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await toggleFavoriteCustomer(customer.id);
      await refreshSelectorOptions();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const getRiskLevelColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEntityIcon = (type: CustomerProfile['type']) => {
    switch (type) {
      case 'business':
      case 'broker':
      case 'asset-seller':
      case 'service-provider':
        return BuildingOfficeIcon;
      case 'individual':
      default:
        return UserCircleIcon;
    }
  };

  const isFavorite = (customerId: string) => {
    return filteredOptions?.favorite_profiles.some(customer => customer.id === customerId) || false;
  };

  const renderCustomerItem = (customer: CustomerProfile, showFavorite = true) => {
    const EntityIcon = getEntityIcon(customer.type);

    return (
      <div
        key={customer.id}
        className={`flex cursor-pointer items-center justify-between p-3 transition-colors hover:bg-gray-50 ${
          activeCustomer?.id === customer.id ? 'border-l-4 border-blue-500 bg-blue-50' : ''
        }`}
        onClick={() => handleCustomerSelect(customer)}
      >
        <div className="flex flex-1 items-center space-x-3">
          <EntityIcon className="h-8 w-8 text-gray-400" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="truncate text-sm font-medium text-gray-900">
                {customer.display_name}
              </h4>

              {customer.metadata.risk_level && (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getRiskLevelColor(customer.metadata.risk_level)}`}
                >
                  {customer.metadata.risk_level.toUpperCase()}
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center space-x-2">
              <span className="text-xs capitalize text-gray-500">{customer.type.replace(/-/g, ' ')}</span>

              {customer.metadata.industry && (
                <>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{customer.metadata.industry}</span>
                </>
              )}

              {customer.metadata.credit_score && (
                <>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-500">
                    Credit: {customer.metadata.credit_score}
                  </span>
                </>
              )}
            </div>

            {customer.metadata.tags && customer.metadata.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {customer.metadata.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
                {customer.metadata.tags.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{customer.metadata.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {showFavorite && (
          <button
            onClick={e => handleToggleFavorite(customer, e)}
            className="ml-2 rounded-full p-1 transition-colors hover:bg-gray-200"
          >
            {isFavorite(customer.id) ? (
              <StarSolidIcon className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarIcon className="h-4 w-4 text-gray-400" />
            )}
          </button>
        )}
      </div>
    );
  };

  const renderCustomerSection = (
    title: string,
    customers: CustomerProfile[],
    showFavorite = true,
  ) => {
    if (!customers.length) return null;

    return (
      <div className="py-2">
        <h3 className="border-b border-gray-100 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          {title}
        </h3>
        <div className="max-h-48 overflow-y-auto">
          {customers.map(customer => renderCustomerItem(customer, showFavorite))}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {activeCustomer ? (
          <>
            {React.createElement(getEntityIcon(activeCustomer.type), {
              className: 'h-5 w-5 text-gray-400',
            })}
            <span className="max-w-48 truncate">{activeCustomer.display_name}</span>
          </>
        ) : (
          <>
            <UserCircleIcon className="h-5 w-5 text-gray-400" />
            <span>Select Customer</span>
          </>
        )}
        <ChevronDownIcon
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-[9999] mt-2 max-h-96 w-96 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Search */}
          <div className="border-b border-gray-100 p-3">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Customer Lists */}
          <div className="max-h-80 overflow-y-auto">
            {filteredOptions?.favorite_profiles.length > 0 &&
              renderCustomerSection('Favorites', filteredOptions.favorite_profiles, false)}

            {filteredOptions?.active_profiles.length > 0 &&
              renderCustomerSection('Active', filteredOptions.active_profiles)}

            {filteredOptions?.recent_profiles.length > 0 &&
              renderCustomerSection('Recent', filteredOptions.recent_profiles)}

            {filteredOptions?.suggested_profiles.length > 0 &&
              renderCustomerSection('Suggested', filteredOptions.suggested_profiles)}

            {/* No Results */}
            {filteredOptions &&
              !filteredOptions.active_profiles.length &&
              !filteredOptions.recent_profiles.length &&
              !filteredOptions.favorite_profiles.length &&
              !filteredOptions.suggested_profiles.length && (
                <div className="p-6 text-center text-gray-500">
                  <UserCircleIcon className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm">No customers found</p>
                  {searchTerm && <p className="mt-1 text-xs">Try adjusting your search term</p>}
                </div>
              )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-3">
            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to create customer page
                window.location.href = '/customers/create';
              }}
              className="w-full rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
            >
              + Create New Customer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
