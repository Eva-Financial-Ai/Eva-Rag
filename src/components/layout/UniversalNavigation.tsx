import {
  ArrowLeftIcon, // For loading
  ArrowPathIcon, // Placeholder for avatar if no image
  ArrowRightOnRectangleIcon, // Placeholder for Logo, replace with actual ModernEVALogo
  Bars3Icon,
  BellIcon,
  ChevronDownIcon,
  Cog6ToothIcon, // Hamburger menu icon
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'; // Using outline style, can be solid if preferred
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useCustomer } from '../../contexts/CustomerContext';
import { Transaction, TransactionFilters, useTransaction } from '../../contexts/TransactionContext';
import { debugLog } from '../../utils/auditLogger';

import { UserContext } from '../../contexts/UserContext'; // Import UserContextType
import ModernEVALogo from '../common/EVALogo'; // Assuming this is the correct path
import NotificationCenter from '../NotificationCenter'; // Path confirmed or to be adjusted
import SearchBar from '../search/SearchBar'; // Assuming this is the correct path and props are compatible
// import { NotificationSystem } from '../../services/NotificationService'; // Service doesn't exist yet

// Mock NotificationSystem until the real service is implemented
const NotificationSystem = {
  getUnreadCount: () => 0,
  subscribe: (callback: (count: number) => void) => {
    // Mock implementation - return unsubscribe function
    return () => {};
  },
};

// Mock types to replace deleted backend services
interface Customer {
  id: string;
  name: string;
  email: string;
  type: 'business' | 'person';
  status: 'active' | 'inactive' | 'pending';
}

// Define DisplayUser type
interface DisplayUser {
  name: string;
  email: string;
  avatarUrl?: string;
}

// UserProfile might come from UserContext, define here if not
interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

const UniversalNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    activeCustomer,
    selectorOptions,
    loading: isLoadingCustomers,
    error: customerError,
    searchCustomers,
    setActiveCustomer,
  } = useCustomer();
  const {
    selectedTransaction,
    setSelectedTransaction,
    transactions,
    isLoadingTransactions,
    transactionError,
    fetchTransactions,
  } = useTransaction();

  const userContext = useContext(UserContext);
  const currentUserDisplay: DisplayUser | null = userContext.user
    ? {
        name: userContext.user.displayName || userContext.userName || 'User',
        email: userContext.user.email || '-',
        avatarUrl: userContext.user.photoURL,
      }
    : userContext.userName
      ? { name: userContext.userName, email: '-' }
      : null;
  const theme = userContext.theme;
  const sidebarCollapsed = userContext.sidebarCollapsed;
  const setSidebarCollapsed = userContext.setSidebarCollapsed;

  // Local UI state for dropdowns/panels
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0); // Placeholder, get from NotificationSystem
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isTransactionDropdownOpen, setIsTransactionDropdownOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const [activeTransactionFilters, setActiveTransactionFilters] = useState<TransactionFilters>({});

  // Add missing state variables
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Memoize the debounce utility to avoid recreation
  const debounce = useCallback(<F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
      new Promise(resolve => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
  }, []);

  // Memoize debounced fetch for customers
  const debouncedFetchCustomers = useMemo(() => {
    return debounce((searchTerm: string) => {
      searchCustomers({ search: searchTerm });
    }, 300);
  }, [debounce, searchCustomers]);

  // Fixed useEffects with proper dependencies
  useEffect(() => {
    if (isCustomerDropdownOpen) {
      searchCustomers({ search: customerSearchTerm });
    }
  }, [isCustomerDropdownOpen, customerSearchTerm, searchCustomers]);

  useEffect(() => {
    if (customerSearchTerm) {
      debouncedFetchCustomers(customerSearchTerm);
    } else if (isCustomerDropdownOpen) {
      searchCustomers({});
    }
  }, [customerSearchTerm, isCustomerDropdownOpen, debouncedFetchCustomers, searchCustomers]);

  useEffect(() => {
    if (activeCustomer) {
      fetchTransactions(activeCustomer.id, activeTransactionFilters, transactionSearchTerm);
    }
  }, [activeCustomer, activeTransactionFilters, transactionSearchTerm, fetchTransactions]);

  // Memoize event handlers
  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const handleLogout = useCallback(() => {
    debugLog('general', 'log_statement', 'Logout clicked')
    setIsProfileDropdownOpen(false);
    navigate('/login');
  }, [navigate]);

  const handleCustomerSelect = useCallback(
    (customer: Customer) => {
      debugLog('general', 'log_statement', 'Customer selected:', customer)
      setActiveCustomer(customer.id);
      setSelectedCustomer(customer);
      setIsCustomerDropdownOpen(false);
    },
    [setActiveCustomer],
  );

  const handleTransactionSelect = useCallback(
    (transaction: Transaction) => {
      setSelectedTransaction(transaction);
      setIsTransactionDropdownOpen(false);
      setTransactionSearchTerm(transaction.id);
    },
    [setSelectedTransaction],
  );

  const toggleSidebar = useCallback(() => {
    if (setSidebarCollapsed) {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  }, [setSidebarCollapsed, sidebarCollapsed]);

  // Memoize breadcrumbs generation
  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Home', path: '/' }];
    pathSegments.forEach((segment, index) => {
      const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
      const label = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      crumbs.push({ label, path });
    });
    return crumbs;
  }, [location.pathname]);

  const pageTitle = useMemo(() => {
    return breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1].label : 'Dashboard';
  }, [breadcrumbs]);

  // Memoize transaction filter handlers
  const handleTransactionFilterChange = useCallback(
    <K extends keyof TransactionFilters>(filterName: K, value: TransactionFilters[K]) => {
      setActiveTransactionFilters(prevFilters => {
        const newFilters = { ...prevFilters };
        if (
          value === '' ||
          value === null ||
          value === undefined ||
          (typeof value === 'number' && isNaN(value))
        ) {
          delete newFilters[filterName];
        } else {
          (newFilters as any)[filterName] = value;
        }
        return newFilters;
      });
    },
    [],
  );

  const clearTransactionFilters = useCallback(() => {
    setActiveTransactionFilters({});
    setTransactionSearchTerm('');
  }, []);

  // Update notification count with proper cleanup
  useEffect(() => {
    let isMounted = true;

    const updateCount = () => {
      if (isMounted) {
        try {
          const count = NotificationSystem.getUnreadCount ? NotificationSystem.getUnreadCount() : 0;
          setUnreadNotifications(count);
        } catch (e) {
          console.error('Failed to get unread notification count:', e);
          setUnreadNotifications(0);
        }
      }
    };

    updateCount();

    const unsubscribe = NotificationSystem.subscribe
      ? NotificationSystem.subscribe(newCountOrNotification => {
          if (typeof newCountOrNotification === 'number') {
            if (isMounted) setUnreadNotifications(newCountOrNotification);
          } else {
            updateCount();
          }
        })
      : () => {};

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []); // This useEffect only needs to run once

  // --- Render ---
  return (
    <nav
      className={`fixed left-0 right-0 top-0 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'bg-white border-gray-200'} z-30 flex h-16 items-center justify-between border-b px-4 shadow-md sm:px-6`}
    >
      {/* Left Section */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Sidebar Toggle Button (Hamburger Menu) */}
        {setSidebarCollapsed && ( // Only show if function is available from context
          <button
            onClick={toggleSidebar}
            className={`rounded-md p-2 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        )}

        <Link to="/" className="flex-shrink-0">
          <ModernEVALogo width={100} height={32} />
        </Link>

        <button
          onClick={handleBack}
          className={`hidden rounded-md p-2 sm:inline-flex ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
          aria-label="Go back"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

        <div className="hidden items-center space-x-1 overflow-hidden whitespace-nowrap text-sm md:flex">
          {breadcrumbs.slice(0, breadcrumbs.length > 3 ? 1 : -1).map(
            (
              crumb,
              index, // Show first and last 2, or just first if too many
            ) => (
              <React.Fragment key={index}>
                <Link
                  to={crumb.path}
                  className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} truncate hover:underline`}
                >
                  {crumb.label}
                </Link>
                <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>/</span>
              </React.Fragment>
            ),
          )}
          {breadcrumbs.length > 3 && (
            <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>... /</span>
          )}
          <span
            className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} truncate font-medium`}
          >
            {pageTitle}
          </span>
        </div>

        <h1 className="${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} truncate text-lg font-semibold capitalize md:hidden">
          {pageTitle}
        </h1>
      </div>

      {/* Center Section */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Customer Selector */}
        <div className="relative">
          <button
            onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
            className={`rounded-md px-3 py-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} flex max-w-[150px] items-center truncate focus:outline-none sm:max-w-[200px]`}
          >
            <span className="truncate">
              {activeCustomer ? activeCustomer.display_name : 'Select Customer'}
            </span>
            <ChevronDownIcon
              className={`ml-2 inline-block h-4 w-4 flex-shrink-0 transition-transform duration-200 ${isCustomerDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {isCustomerDropdownOpen && (
            <div
              className={`absolute mt-2 w-72 rounded-md shadow-lg ${theme === 'dark' ? 'bg-gray-700 ring-gray-600' : 'bg-white ring-black'} z-50 origin-top-left ring-1 ring-opacity-5 sm:origin-top`}
            >
              <div className="p-2">
                <input
                  type="search"
                  placeholder="Search customers..."
                  value={customerSearchTerm}
                  onChange={e => setCustomerSearchTerm(e.target.value)}
                  className={`mb-2 w-full border px-3 py-2 ${theme === 'dark' ? 'text-gray-200 border-gray-500 bg-gray-600 placeholder-gray-400' : 'border-gray-300 placeholder-gray-400'} rounded-md text-sm focus:border-primary-500 focus:ring-primary-500`}
                />
              </div>
              <div
                className="max-h-60 overflow-y-auto py-1"
                role="menu"
                aria-orientation="vertical"
              >
                {isLoadingCustomers && (
                  <div className="flex items-center justify-center p-4">
                    <ArrowPathIcon className="h-6 w-6 animate-spin" />
                  </div>
                )}
                {customerError && (
                  <div className="flex items-center px-4 py-2 text-sm text-red-500">
                    <ExclamationCircleIcon className="mr-1 h-5 w-5" /> Error: {customerError}
                  </div>
                )}
                {!isLoadingCustomers && !customerError && filteredCustomers.length === 0 && (
                  <p
                    className={`px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    No customers found.
                  </p>
                )}
                {!isLoadingCustomers &&
                  !customerError &&
                  customers.map(c => (
                    <a
                      key={c.id}
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        handleCustomerSelect(c);
                      }}
                      className={`block px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} ${selectedCustomer?.id === c.id ? (theme === 'dark' ? 'text-white bg-primary-700' : 'bg-primary-100 text-primary-700') : ''}`}
                      role="menuitem"
                    >
                      {c.name}
                    </a>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Transaction Selector (conditional) */}
        {selectedCustomer && (
          <div className="relative">
            <button
              onClick={() => setIsTransactionDropdownOpen(!isTransactionDropdownOpen)}
              className={`rounded-md px-3 py-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} flex max-w-[150px] items-center truncate focus:outline-none sm:max-w-[200px]`}
            >
              <span className="truncate">
                {selectedTransaction ? selectedTransaction.id : 'Select Transaction'}
              </span>
              <ChevronDownIcon
                className={`ml-2 inline-block h-4 w-4 flex-shrink-0 transition-transform duration-200 ${isTransactionDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isTransactionDropdownOpen && (
              <div
                className={`absolute mt-2 w-80 rounded-md shadow-lg md:w-96 ${theme === 'dark' ? 'bg-gray-700 ring-gray-600' : 'bg-white ring-black'} z-50 origin-top-left ring-1 ring-opacity-5 sm:origin-top`}
              >
                <div className="p-2">
                  <input
                    type="search"
                    placeholder="Search transactions..."
                    value={transactionSearchTerm}
                    onChange={e => setTransactionSearchTerm(e.target.value)}
                    className={`mb-2 w-full border px-3 py-2 ${theme === 'dark' ? 'text-gray-200 border-gray-500 bg-gray-600 placeholder-gray-400' : 'border-gray-300 placeholder-gray-400'} rounded-md text-sm focus:border-primary-500 focus:ring-primary-500`}
                  />
                  <div className="mt-2 border-t border-gray-300 p-2">
                    <h4 className="mb-1 text-xs font-semibold text-gray-700">Filters:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <label htmlFor="dateFrom" className="block text-xs text-gray-600">
                          Date From:
                        </label>
                        <input
                          type="date"
                          id="dateFrom"
                          value={activeTransactionFilters.dateFrom || ''}
                          onChange={e => handleTransactionFilterChange('dateFrom', e.target.value)}
                          className={`mt-0.5 w-full border p-1 ${theme === 'dark' ? 'text-gray-200 border-gray-500 bg-gray-600' : 'border-gray-300'} rounded-md text-xs`}
                        />
                      </div>
                      <div>
                        <label htmlFor="dateTo" className="block text-xs text-gray-600">
                          Date To:
                        </label>
                        <input
                          type="date"
                          id="dateTo"
                          value={activeTransactionFilters.dateTo || ''}
                          onChange={e => handleTransactionFilterChange('dateTo', e.target.value)}
                          className={`mt-0.5 w-full border p-1 ${theme === 'dark' ? 'text-gray-200 border-gray-500 bg-gray-600' : 'border-gray-300'} rounded-md text-xs`}
                        />
                      </div>
                      <div>
                        <label htmlFor="minAmount" className="block text-xs text-gray-600">
                          Min Amount:
                        </label>
                        <input
                          type="number"
                          id="minAmount"
                          placeholder="Min"
                          value={activeTransactionFilters.minAmount || ''}
                          onChange={e =>
                            handleTransactionFilterChange('minAmount', parseFloat(e.target.value))
                          }
                          className={`mt-0.5 w-full border p-1 ${theme === 'dark' ? 'text-gray-200 border-gray-500 bg-gray-600' : 'border-gray-300'} rounded-md text-xs`}
                        />
                      </div>
                      <div>
                        <label htmlFor="maxAmount" className="block text-xs text-gray-600">
                          Max Amount:
                        </label>
                        <input
                          type="number"
                          id="maxAmount"
                          placeholder="Max"
                          value={activeTransactionFilters.maxAmount || ''}
                          onChange={e =>
                            handleTransactionFilterChange('maxAmount', parseFloat(e.target.value))
                          }
                          className={`mt-0.5 w-full border p-1 ${theme === 'dark' ? 'text-gray-200 border-gray-500 bg-gray-600' : 'border-gray-300'} rounded-md text-xs`}
                        />
                      </div>
                      <div>
                        <label htmlFor="statusFilter" className="block text-xs text-gray-600">
                          Status:
                        </label>
                        <select
                          id="statusFilter"
                          value={activeTransactionFilters.status || ''}
                          onChange={e => handleTransactionFilterChange('status', e.target.value)}
                          className={`mt-0.5 w-full border p-1 ${theme === 'dark' ? 'text-gray-200 border-gray-500 bg-gray-600' : 'border-gray-300'} rounded-md text-xs`}
                        >
                          <option value="">All</option>
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Failed">Failed</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Active">Active</option> // From mock data
                        </select>
                      </div>
                      <div>
                        <label htmlFor="typeFilter" className="block text-xs text-gray-600">
                          Type:
                        </label>
                        <input
                          type="text"
                          id="typeFilter"
                          placeholder="e.g., Loan"
                          value={activeTransactionFilters.type || ''}
                          onChange={e => handleTransactionFilterChange('type', e.target.value)}
                          className={`mt-0.5 w-full border p-1 ${theme === 'dark' ? 'text-gray-200 border-gray-500 bg-gray-600' : 'border-gray-300'} rounded-md text-xs`}
                        />
                      </div>
                    </div>
                    <button
                      onClick={clearTransactionFilters}
                      className="mt-2 w-full text-xs text-blue-600 hover:text-blue-500"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
                <div
                  className="max-h-80 overflow-y-auto py-1"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {isLoadingTransactions && (
                    <div className="flex items-center justify-center p-4">
                      <ArrowPathIcon className="h-6 w-6 animate-spin" />
                    </div>
                  )}
                  {transactionError && (
                    <div className="flex items-center px-4 py-2 text-sm text-red-500">
                      <ExclamationCircleIcon className="mr-1 h-5 w-5" /> Error:{' '}
                      {transactionError.message}
                    </div>
                  )}
                  {!isLoadingTransactions && !transactionError && transactions.length === 0 && (
                    <p className="px-4 py-2 text-sm text-gray-500">No transactions found.</p>
                  )}
                  {!isLoadingTransactions &&
                    !transactionError &&
                    transactions.map(t => (
                      <a
                        key={t.id}
                        href="#"
                        onClick={e => {
                          e.preventDefault();
                          handleTransactionSelect(t);
                        }}
                        className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                        role="menuitem"
                      >
                        <div>
                          {t.id} - {t.borrowerName} ({t.status})
                        </div>
                        <div className="text-xs opacity-75">
                          {t.type}: {t.description} - Amount: {t.amount}
                        </div>
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Universal Search Bar - Using SearchBar component from Navbar.tsx */}
        <div className="hidden sm:block">
          <SearchBar
            placeholder="Search EVA Platform..."
            deviceType={theme === 'dark' ? 'desktop' : 'desktop'} // deviceType prop might need re-evaluation for SearchBar or make it optional
          />
        </div>
        {/* Mobile search icon - Toggles a dedicated search modal/view or expands search input */}
        <button
          className={`rounded-md p-2 sm:hidden ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'} `}
        >
          <MagnifyingGlassIcon className="h-6 w-6" />
        </button>

        {/* Notification Icon */}
        <button
          onClick={() => setIsNotificationPanelOpen(true)}
          className={`relative rounded-md p-2 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
          aria-label="Notifications"
        >
          <BellIcon className="h-6 w-6" />
          {unreadNotifications > 0 && (
            <span
              className={`absolute right-1 top-1 block h-4 w-4 -translate-y-1/2 translate-x-1/2 transform rounded-full ${theme === 'dark' ? 'bg-red-500' : 'bg-red-500'} text-white flex items-center justify-center p-0.5 text-xs font-medium`}
            >
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>
        {/* TODO: Actual NotificationCenter panel popup/modal integration */}

        {/* Settings Icon */}
        <Link
          to="/settings"
          className={`rounded-md p-2 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
          aria-label="Settings"
        >
          <Cog6ToothIcon className="h-6 w-6" />
        </Link>

        {/* Profile Avatar/Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-expanded={isProfileDropdownOpen}
            aria-haspopup="true"
          >
            <span className="sr-only">Open user menu</span>
            {currentUserDisplay?.avatarUrl ? (
              <img
                className="h-8 w-8 rounded-full"
                src={currentUserDisplay.avatarUrl}
                alt="User avatar"
              />
            ) : (
              <UserCircleIcon
                className={`h-8 w-8 rounded-full ${theme === 'dark' ? 'text-gray-400' : 'text-gray-300'}`}
              />
            )}
          </button>
          {isProfileDropdownOpen && (
            <div
              className={`absolute right-0 mt-2 w-56 origin-top-right rounded-md shadow-lg ${theme === 'dark' ? 'text-gray-200 bg-gray-700 ring-gray-600' : 'bg-white text-gray-700 ring-black'} z-50 ring-1 ring-opacity-5`}
            >
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
              >
                {currentUserDisplay && (
                  <div
                    className={`border-b px-4 py-3 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                    <p
                      className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}
                    >
                      {currentUserDisplay.name}
                    </p>
                    <p
                      className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}
                    >
                      {currentUserDisplay.email}
                    </p>
                  </div>
                )}
                <Link
                  to="/account-settings" // TODO: Update route if different
                  className={`block px-4 py-2 text-sm ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                  role="menuitem"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  Account Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className={`block w-full px-4 py-2 text-left text-sm ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                  role="menuitem"
                >
                  <ArrowRightOnRectangleIcon className="mr-2 inline-block h-5 w-5 align-text-bottom" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Notification Panel - Rendered conditionally based on isNotificationPanelOpen */}
      {isNotificationPanelOpen && (
        <NotificationCenter
          isOpen={isNotificationPanelOpen}
          onClose={() => setIsNotificationPanelOpen(false)}
        />
      )}
    </nav>
  );
};

export default UniversalNavigation;
