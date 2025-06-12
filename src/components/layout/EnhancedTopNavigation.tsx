import {
  ArrowLeftIcon,
  Bars3Icon,
  DocumentTextIcon,
  FolderOpenIcon,
  HomeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTransactionContext } from '../../contexts/TransactionContextProvider';
import { UserContext } from '../../contexts/UserContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { Customer } from '../common/CustomerSelector';
import EnhancedUserTypeSelector from '../common/EnhancedUserTypeSelector';
import EVACustomerSelector from '../EVACustomerSelector';

import { debugLog } from '../../utils/auditLogger';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description?: string;
}

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const EnhancedTopNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTransaction, setCurrentTransaction } = useWorkflow();
  const [isTransactionDropdownOpen, setIsTransactionDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [currentPageTitle, setCurrentPageTitle] = useState('');
  const [previousPageTitle, setPreviousPageTitle] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const transactionDropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useContext(UserContext);

  // NEW: Use enhanced transaction context instead of basic workflow
  const {
    currentTransaction: selectedTransaction,
    transactions: filteredTransactions,
    customers,
    setCurrentTransaction: setSelectedTransaction,
    loading: transactionLoading,
  } = useTransactionContext();

  // Mock the missing properties that don't exist in the context
  const userRole = 'admin'; // Default role
  const canViewAllTransactions = true; // Default permission
  const refreshTransactions = useCallback(async () => {
    // This would need to be implemented in the context
    debugLog('general', 'log_statement', 'Refresh transactions called')
  }, []);

  // Handle click outside for transaction dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        transactionDropdownRef.current &&
        !transactionDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTransactionDropdownOpen(false);
      }
    };

    if (isTransactionDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTransactionDropdownOpen, setIsTransactionDropdownOpen]);

  // Main navigation items
  const navigationItems: NavigationItem[] = [];

  // Generate breadcrumbs and page titles based on current location
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const newBreadcrumbs: BreadcrumbItem[] = [{ label: 'Home', path: '/' }];

    // Build breadcrumbs
    pathSegments.forEach((segment, index) => {
      const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
      let label = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      // Special case handling for known routes
      if (segment === 'auto-originations') label = 'Auto Originations Dashboard';
      if (segment === 'credit-application') label = 'Credit Application';
      if (segment === 'documents') label = 'Filelock Drive';

      newBreadcrumbs.push({ label, path });
    });

    setBreadcrumbs(newBreadcrumbs);

    // Persist breadcrumbs
    localStorage.setItem('navigationBreadcrumbs', JSON.stringify(newBreadcrumbs));

    // Set current and previous page titles
    if (newBreadcrumbs.length > 1) {
      setCurrentPageTitle(newBreadcrumbs[newBreadcrumbs.length - 1].label);
      if (newBreadcrumbs.length > 2) {
        setPreviousPageTitle(newBreadcrumbs[newBreadcrumbs.length - 2].label);
      }
    }
  }, [location, setBreadcrumbs, setCurrentPageTitle, setPreviousPageTitle]);

  // This useEffect will be defined after loadTransactions function
  // Moved below to fix "used before declaration" error

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      // Mock transactions - replace with actual API call
      const mockTransactions = [
        {
          id: 'TX-101',
          borrowerName: 'Acme Industries',
          type: 'Equipment Loan',
          amount: 750000,
          status: 'In Progress',
          date: '2024-01-15',
          customerId: 'CUST-001', // Johns Trucking
        },
        {
          id: 'TX-102',
          borrowerName: 'Smith Enterprises',
          type: 'Finance Lease',
          amount: 1250000,
          status: 'In Progress',
          date: '2024-01-20',
          customerId: 'CUST-002', // Smith Manufacturing
        },
        {
          id: 'TX-103',
          borrowerName: 'Tech Innovations Inc',
          type: 'Commercial Mortgage',
          amount: 2500000,
          status: 'In Progress',
          date: '2024-01-25',
          customerId: 'CUST-005', // Tech Solutions Inc
        },
        {
          id: 'TX-104',
          borrowerName: 'Johns Trucking',
          type: 'Working Capital',
          amount: 500000,
          status: 'Active',
          date: '2024-01-28',
          customerId: 'CUST-001', // Johns Trucking
        },
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setTransactions]);

  // Handle customer selection changes
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    // Auto-select first transaction for the customer if available
    if (customer) {
      const customerTransactions = filteredTransactions.filter(t => t.customerId === customer.id);
      if (customerTransactions.length > 0) {
        setSelectedTransaction(customerTransactions[0]);
      } else {
        setSelectedTransaction(null);
      }
    } else {
      setSelectedTransaction(null);
    }
  };

  // Handle transaction selection with context awareness
  const handleSelectTransaction = useCallback(
    (transaction: any) => {
      // Set in new context system
      setSelectedTransaction(transaction);
      setIsTransactionDropdownOpen(false);

      // Auto-select customer if not already selected
      if (!selectedCustomer || selectedCustomer.id !== transaction.customerId) {
        const customer = customers.find(c => c.id === transaction.customerId);
        if (customer) {
          // Convert CustomerData to Customer type
          const convertedCustomer: Customer = {
            id: customer.id,
            name: customer.name,
            type: 'businesses', // Default type since CustomerData doesn't have the same type values
            email: '', // CustomerData doesn't have email
            phone: '', // CustomerData doesn't have phone
            status: 'active', // Default status
            createdAt: new Date().toISOString(), // Default createdAt
          };
          setSelectedCustomer(convertedCustomer);
        }
      }

      // Legacy workflow compatibility
      if (setCurrentTransaction) {
        setCurrentTransaction({
          id: transaction.id,
          applicantData: {
            id: `applicant-${Date.now()}`,
            name: transaction.borrowerName || transaction.customerName,
          },
          amount: transaction.amount,
          type: transaction.type,
          status: 'active',
          createdAt: transaction.applicationDate || transaction.date,
          stage: transaction.stage || 'application',
          data: {},
          currentStage: transaction.stage || 'application',
        });
      }

      localStorage.setItem('currentTransactionId', transaction.id);
    },
    [
      setSelectedTransaction,
      setIsTransactionDropdownOpen,
      selectedCustomer,
      customers,
      setCurrentTransaction,
    ],
  );

  // Load mock transactions - NOW SAFE TO USE loadTransactions
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Load persisted transaction on mount - NOW SAFE TO USE handleSelectTransaction
  useEffect(() => {
    const savedTransactionId = localStorage.getItem('currentTransactionId');
    const savedBreadcrumbs = localStorage.getItem('navigationBreadcrumbs');

    if (savedBreadcrumbs) {
      try {
        const parsedBreadcrumbs = JSON.parse(savedBreadcrumbs);
        setBreadcrumbs(parsedBreadcrumbs);
      } catch (e) {
        console.error('Failed to parse saved breadcrumbs');
      }
    }

    if (savedTransactionId && transactions.length > 0) {
      const savedTransaction = transactions.find(t => t.id === savedTransactionId);
      if (savedTransaction) {
        handleSelectTransaction(savedTransaction);
      }
    }
  }, [transactions, setBreadcrumbs, handleSelectTransaction]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // Transaction quick actions
  const handleEditTransaction = (transaction: any, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/credit-application?edit=${transaction.id}`);
    setIsTransactionDropdownOpen(false);
  };

  const handleViewTransaction = (transaction: any, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/transaction/${transaction.id}`);
    setIsTransactionDropdownOpen(false);
  };

  const handleCloseTransaction = (transaction: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to close transaction ${transaction.id}?`)) {
      // Handle transaction closure
      debugLog('general', 'log_statement', 'Closing transaction:', transaction.id)
    }
  };

  return (
    <div
      className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white"
      style={{ overflow: 'visible' }}
    >
      {/* Main Navigation Bar */}
      <div className="px-4 sm:px-6 lg:px-8" style={{ overflow: 'visible' }}>
        <div className="flex h-20 items-center justify-between" style={{ overflow: 'visible' }}>
          {/* Left Section: User Type Selector and Main Navigation */}
          <div className="flex items-center space-x-4" style={{ overflow: 'visible' }}>
            {/* User Type Selector (DEMO ONLY) */}
            <EnhancedUserTypeSelector />

            {/* Divider */}
            <div className="h-8 w-px bg-gray-300"></div>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-1 md:flex">
              {navigationItems.map(item => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={item.description}
                >
                  <span className="mr-2 flex-shrink-0">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-md p-3 text-gray-700 hover:bg-gray-100 md:hidden"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Right Section: Customer and Transaction Selector */}
          <div className="flex items-center space-x-3" style={{ overflow: 'visible' }}>
            {/* EVA Customer Selector */}
            <EVACustomerSelector />
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 border-t border-gray-200 bg-white px-4 pb-3 pt-2">
            {navigationItems.map(item => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center rounded-md px-3 py-2 text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation - Enhanced styling */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="flex h-12 items-center">
          <button
            onClick={handleBack}
            className="mr-4 rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>

          <nav className="flex items-center text-sm">
            {previousPageTitle && (
              <>
                <span className="text-gray-500">{previousPageTitle}</span>
                <span className="mx-2 text-gray-400">/</span>
              </>
            )}
            <span className="font-medium text-gray-900">{currentPageTitle}</span>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTopNavigation;
