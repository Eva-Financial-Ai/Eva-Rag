import {
  BanknotesIcon,
  ChartBarIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  StarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../../contexts/CustomerContext';
import { useUserType } from '../../contexts/UserTypeContext';

interface Transaction {
  id: string;
  type: 'loan' | 'application' | 'payment' | 'document';
  title: string;
  amount?: number;
  status: 'active' | 'pending' | 'completed' | 'overdue';
  date: string;
  evaScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

interface Customer {
  id: string;
  name: string;
  businessName?: string;
  type: 'individual' | 'business';
  status: 'active' | 'inactive' | 'pending';
  totalExposure?: number;
  evaScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  lastActivity: string;
  transactionCount: number;
  isFavorite?: boolean;
  avatar?: string;
}

interface EnhancedHeaderSelectorProps {
  className?: string;
  showCustomerSelector?: boolean;
  showTransactionSelector?: boolean;
  onCustomerSelect?: (customer: Customer | null) => void;
  onTransactionSelect?: (transaction: Transaction | null) => void;
}

const EnhancedHeaderSelector: React.FC<EnhancedHeaderSelectorProps> = ({
  className = '',
  showCustomerSelector = true,
  showTransactionSelector = true,
  onCustomerSelect,
  onTransactionSelect,
}) => {
  const navigate = useNavigate();
  const { selectedCustomer, activeCustomer, toggleFavoriteCustomer } = useCustomer();
  const { userType, getUserTypeDisplayName } = useUserType();

  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isTransactionDropdownOpen, setIsTransactionDropdownOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransactionData, setSelectedTransactionData] = useState<Transaction | null>(null);

  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const transactionDropdownRef = useRef<HTMLDivElement>(null);

  const currentCustomer = selectedCustomer || activeCustomer;

  // Load customers and transactions
  useEffect(() => {
    const loadData = async () => {
      // Mock customers data
      const mockCustomers: Customer[] = [
        {
          id: 'CUST-001',
          name: 'Sarah Johnson',
          businessName: 'Johnson Manufacturing LLC',
          type: 'business',
          status: 'active',
          totalExposure: 750000,
          evaScore: 785,
          riskLevel: 'low',
          lastActivity: '2024-01-16T10:30:00Z',
          transactionCount: 8,
          isFavorite: true,
        },
        {
          id: 'CUST-002',
          name: 'David Martinez',
          businessName: 'Metro Logistics Corp',
          type: 'business',
          status: 'active',
          totalExposure: 450000,
          evaScore: 652,
          riskLevel: 'medium',
          lastActivity: '2024-01-15T14:20:00Z',
          transactionCount: 5,
          isFavorite: false,
        },
        {
          id: 'CUST-003',
          name: 'Emily Rodriguez',
          businessName: 'Green Energy Solutions',
          type: 'business',
          status: 'active',
          totalExposure: 1200000,
          evaScore: 724,
          riskLevel: 'low',
          lastActivity: '2024-01-16T09:15:00Z',
          transactionCount: 12,
          isFavorite: true,
        },
        {
          id: 'CUST-004',
          name: 'Michael Chen',
          type: 'individual',
          status: 'pending',
          evaScore: 698,
          riskLevel: 'medium',
          lastActivity: '2024-01-14T16:45:00Z',
          transactionCount: 2,
          isFavorite: false,
        },
      ];

      setCustomers(mockCustomers);

      // Load transactions for selected customer
      if (currentCustomer) {
        const mockTransactions: Transaction[] = [
          {
            id: 'TXN-001',
            type: 'loan',
            title: 'Equipment Financing Loan',
            amount: 250000,
            status: 'active',
            date: '2023-12-15T00:00:00Z',
            evaScore: 785,
            riskLevel: 'low',
          },
          {
            id: 'TXN-002',
            type: 'application',
            title: 'Working Capital Application',
            amount: 100000,
            status: 'pending',
            date: '2024-01-05T00:00:00Z',
            evaScore: 762,
            riskLevel: 'low',
          },
          {
            id: 'TXN-003',
            type: 'payment',
            title: 'Monthly Payment - Equipment Loan',
            amount: 4250,
            status: 'completed',
            date: '2024-01-01T00:00:00Z',
          },
          {
            id: 'TXN-004',
            type: 'document',
            title: 'Tax Returns Upload',
            status: 'completed',
            date: '2024-01-10T00:00:00Z',
          },
          {
            id: 'TXN-005',
            type: 'payment',
            title: 'Monthly Payment - Equipment Loan',
            amount: 4250,
            status: 'overdue',
            date: '2024-01-16T00:00:00Z',
          },
        ];
        setTransactions(mockTransactions);
      } else {
        setTransactions([]);
      }
    };

    loadData();
  }, [currentCustomer]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
      }
      if (
        transactionDropdownRef.current &&
        !transactionDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTransactionDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter customers based on search
  const filteredCustomers = customers.filter(
    customer =>
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      (customer.businessName &&
        customer.businessName.toLowerCase().includes(customerSearchTerm.toLowerCase())),
  );

  // Filter transactions based on search
  const filteredTransactions = transactions.filter(
    transaction =>
      transaction.title.toLowerCase().includes(transactionSearchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(transactionSearchTerm.toLowerCase()),
  );

  const handleCustomerSelect = (customer: Customer) => {
    if (onCustomerSelect) {
      onCustomerSelect(customer);
    }
    setIsCustomerDropdownOpen(false);
    setCustomerSearchTerm('');
  };

  const handleTransactionSelect = (transaction: Transaction) => {
    setSelectedTransactionData(transaction);
    if (onTransactionSelect) {
      onTransactionSelect(transaction);
    }
    setIsTransactionDropdownOpen(false);
    setTransactionSearchTerm('');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      case 'inactive':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'loan':
        return BanknotesIcon;
      case 'application':
        return DocumentTextIcon;
      case 'payment':
        return CurrencyDollarIcon;
      case 'document':
        return DocumentTextIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return '';
    return amount >= 1000000
      ? `$${(amount / 1000000).toFixed(1)}M`
      : amount >= 1000
        ? `$${(amount / 1000).toFixed(0)}K`
        : `$${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Customer Selector */}
      {showCustomerSelector && (
        <div className="relative" ref={customerDropdownRef}>
          <button
            onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
            className="bg-white flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <UsersIcon className="h-5 w-5 text-gray-400" />
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">
                {currentCustomer
                  ? (currentCustomer as any).businessName ||
                    currentCustomer.display_name ||
                    (currentCustomer as any).name ||
                    'Unknown Customer'
                  : 'Select Customer'}
              </div>
              {currentCustomer && (
                <div className="text-xs text-gray-500">
                  {(currentCustomer as any).transactionCount || 0} transactions
                  {(currentCustomer as any).evaScore &&
                    ` • EVA: ${(currentCustomer as any).evaScore}`}
                </div>
              )}
            </div>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </button>

          {/* Customer Dropdown */}
          {isCustomerDropdownOpen && (
            <div className="bg-white absolute left-0 top-full z-50 mt-2 w-96 rounded-lg border border-gray-200 shadow-lg">
              <div className="border-b border-gray-200 p-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearchTerm}
                    onChange={e => setCustomerSearchTerm(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {/* Favorites Section */}
                {filteredCustomers.filter(c => c.isFavorite).length > 0 && (
                  <div className="p-2">
                    <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Favorites
                    </div>
                    {filteredCustomers
                      .filter(c => c.isFavorite)
                      .map(customer => (
                        <CustomerListItem
                          key={`fav-${customer.id}`}
                          customer={customer}
                          onSelect={handleCustomerSelect}
                          onToggleFavorite={toggleFavoriteCustomer}
                          formatAmount={formatAmount}
                          getRiskColor={getRiskColor}
                          getStatusColor={getStatusColor}
                          isSelected={currentCustomer?.id === customer.id}
                        />
                      ))}
                  </div>
                )}

                {/* All Customers */}
                <div className="p-2">
                  <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                    All Customers
                  </div>
                  {filteredCustomers.map(customer => (
                    <CustomerListItem
                      key={customer.id}
                      customer={customer}
                      onSelect={handleCustomerSelect}
                      onToggleFavorite={toggleFavoriteCustomer}
                      formatAmount={formatAmount}
                      getRiskColor={getRiskColor}
                      getStatusColor={getStatusColor}
                      isSelected={currentCustomer?.id === customer.id}
                    />
                  ))}
                </div>

                {filteredCustomers.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500">No customers found</div>
                )}
              </div>

              <div className="border-t border-gray-200 p-4">
                <button
                  onClick={() => {
                    navigate('/customers/new');
                    setIsCustomerDropdownOpen(false);
                  }}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
                >
                  + Add New Customer
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction Selector */}
      {showTransactionSelector && currentCustomer && (
        <div className="relative" ref={transactionDropdownRef}>
          <button
            onClick={() => setIsTransactionDropdownOpen(!isTransactionDropdownOpen)}
            className="bg-white flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900">
                {selectedTransactionData ? selectedTransactionData.title : 'View Transactions'}
              </div>
              <div className="text-xs text-gray-500">{transactions.length} total transactions</div>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </button>

          {/* Transaction Dropdown */}
          {isTransactionDropdownOpen && (
            <div className="bg-white absolute left-0 top-full z-50 mt-2 w-96 rounded-lg border border-gray-200 shadow-lg">
              <div className="border-b border-gray-200 p-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={transactionSearchTerm}
                    onChange={e => setTransactionSearchTerm(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {filteredTransactions.map(transaction => {
                  const IconComponent = getTransactionIcon(transaction.type);
                  return (
                    <button
                      key={transaction.id}
                      onClick={() => handleTransactionSelect(transaction)}
                      className="w-full rounded-md p-3 text-left hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-100 rounded-lg p-2">
                            <IconComponent className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(transaction.date)}
                              {transaction.amount && ` • ${formatAmount(transaction.amount)}`}
                              {transaction.evaScore && ` • EVA: ${transaction.evaScore}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {transaction.riskLevel && (
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${getRiskColor(transaction.riskLevel)}`}
                            >
                              {transaction.riskLevel}
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(transaction.status)}`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filteredTransactions.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500">No transactions found</div>
                )}
              </div>

              <div className="border-t border-gray-200 p-4">
                <button
                  onClick={() => {
                    navigate(`/customers/${currentCustomer.id}/transactions`);
                    setIsTransactionDropdownOpen(false);
                  }}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
                >
                  View All Transactions →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EVA Score Quick View */}
      {currentCustomer && (currentCustomer as any).evaScore && (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/customers/${currentCustomer.id}/eva-report`)}
            className="flex items-center space-x-2 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-green-50 px-3 py-2 transition-colors hover:from-blue-100 hover:to-green-100"
          >
            <ChartBarIcon className="h-4 w-4 text-blue-600" />
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                EVA: {(currentCustomer as any).evaScore}
              </span>
              {(currentCustomer as any).riskLevel && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${getRiskColor((currentCustomer as any).riskLevel)}`}
                >
                  {(currentCustomer as any).riskLevel} risk
                </span>
              )}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

// Customer List Item Component
interface CustomerListItemProps {
  customer: Customer;
  onSelect: (customer: Customer) => void;
  onToggleFavorite: (customerId: string) => void;
  formatAmount: (amount?: number) => string;
  getRiskColor: (riskLevel?: string) => string;
  getStatusColor: (status: string) => string;
  isSelected: boolean;
}

const CustomerListItem: React.FC<CustomerListItemProps> = ({
  customer,
  onSelect,
  onToggleFavorite,
  formatAmount,
  getRiskColor,
  getStatusColor,
  isSelected,
}) => {
  return (
    <div
      className={`rounded-md p-3 hover:bg-gray-50 ${isSelected ? 'border border-blue-200 bg-blue-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <button onClick={() => onSelect(customer)} className="flex-1 text-left">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-white text-sm font-medium">
                  {customer.businessName ? customer.businessName[0] : customer.name[0]}
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-gray-900">
                {customer.businessName || customer.name}
              </div>
              {customer.businessName && (
                <div className="truncate text-xs text-gray-500">{customer.name}</div>
              )}
              <div className="mt-1 flex items-center space-x-2">
                {customer.evaScore && (
                  <span className="text-xs text-gray-500">EVA: {customer.evaScore}</span>
                )}
                {customer.totalExposure && (
                  <span className="text-xs text-gray-500">
                    {formatAmount(customer.totalExposure)}
                  </span>
                )}
                <span className="text-xs text-gray-500">{customer.transactionCount} txns</span>
              </div>
            </div>
          </div>
        </button>
        <div className="ml-2 flex items-center space-x-2">
          {customer.riskLevel && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${getRiskColor(customer.riskLevel)}`}
            >
              {customer.riskLevel}
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(customer.status)}`}
          >
            {customer.status}
          </span>
          <button
            onClick={e => {
              e.stopPropagation();
              onToggleFavorite(customer.id);
            }}
            className="rounded p-1 hover:bg-gray-200"
          >
            {customer.isFavorite ? (
              <StarIconSolid className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarIcon className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHeaderSelector;
