import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEVAUserContext } from '../../contexts/EVAUserContext';
import { useUserType } from '../../contexts/UserTypeContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { UserType } from '../../types/UserTypes';
import ProductionLogger from '../../utils/productionLogger';

interface Transaction {
  id: string;
  borrowerName: string;
  type: string;
  amount: number;
  status: string;
  date: string;
  customerId?: string; // Add customer association
}

interface TransactionSelectorProps {
  fixedPosition?: boolean;
  className?: string;
  selectedCustomerId?: string | null; // Add prop for customer filtering
  onTransactionChange?: (transaction: Transaction) => void; // Add callback for risk report updates
}

const TransactionSelector: React.FC<TransactionSelectorProps> = ({
  fixedPosition = false,
  className = '',
  selectedCustomerId = null,
  onTransactionChange,
}) => {
  const { currentTransaction, setCurrentTransaction } = useWorkflow();
  const { userType, hasPermission } = useUserType();
  const { selectedCustomer } = useEVAUserContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [riskReportData, setRiskReportData] = useState<any>(null);
  const [smartMatches, setSmartMatches] = useState<any[]>([]);
  const [showRiskPaywall, setShowRiskPaywall] = useState(false);
  const [showMatchPaywall, setShowMatchPaywall] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>(
    currentTransaction?.id || localStorage.getItem('currentTransactionId') || ''
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Enhanced mock transactions with more realistic data - memoized to prevent recreation
  const mockTransactions = useMemo<Transaction[]>(
    () => [
      // Johns Trucking transactions (CUST-001)
      {
        id: 'tx-johns-001',
        borrowerName: 'Johns Trucking',
        type: 'equipment',
        amount: 485000,
        status: 'active',
        date: '2024-01-15',
        customerId: 'CUST-001',
      },
      {
        id: 'tx-johns-002',
        borrowerName: 'Johns Trucking',
        type: 'equipment',
        amount: 275000,
        status: 'pending',
        date: '2024-01-10',
        customerId: 'CUST-001',
      },
      {
        id: 'tx-johns-003',
        borrowerName: 'Johns Trucking Fleet Expansion',
        type: 'equipment',
        amount: 650000,
        status: 'active',
        date: '2024-01-08',
        customerId: 'CUST-001',
      },
      {
        id: 'tx-johns-004',
        borrowerName: 'Johns Trucking Working Capital',
        type: 'unsecured',
        amount: 125000,
        status: 'complete',
        date: '2024-01-05',
        customerId: 'CUST-001',
      },

      // Smith Manufacturing transactions (CUST-002)
      {
        id: 'tx-smith-001',
        borrowerName: 'Smith Manufacturing',
        type: 'equipment',
        amount: 350000,
        status: 'active',
        date: '2024-01-20',
        customerId: 'CUST-002',
      },
      {
        id: 'tx-smith-002',
        borrowerName: 'Smith Manufacturing Corp',
        type: 'realestate',
        amount: 850000,
        status: 'pending',
        date: '2024-01-12',
        customerId: 'CUST-002',
      },

      // Green Valley Farms transactions (CUST-003)
      {
        id: 'tx-green-001',
        borrowerName: 'Green Valley Farms',
        type: 'realestate',
        amount: 2500000,
        status: 'active',
        date: '2024-01-18',
        customerId: 'CUST-003',
      },

      // Capital Finance Brokers transactions (CUST-004)
      {
        id: 'tx-capital-001',
        borrowerName: 'Capital Finance Brokers',
        type: 'brokerage',
        amount: 45000,
        status: 'active',
        date: '2024-01-22',
        customerId: 'CUST-004',
      },
      {
        id: 'tx-capital-002',
        borrowerName: 'Capital Finance Partners',
        type: 'brokerage',
        amount: 62000,
        status: 'pending',
        date: '2024-01-19',
        customerId: 'CUST-004',
      },

      // Tech Solutions Inc transactions (CUST-005) - FIXED IDs
      {
        id: 'tx-tech-001',
        borrowerName: 'Tech Solutions Inc',
        type: 'unsecured',
        amount: 100000,
        status: 'active',
        date: '2024-01-08',
        customerId: 'CUST-005',
      },
      {
        id: 'tx-tech-002',
        borrowerName: 'TechStart Solutions',
        type: 'equipment',
        amount: 180000,
        status: 'pending',
        date: '2024-01-14',
        customerId: 'CUST-005',
      },
      {
        id: 'tx-tech-003',
        borrowerName: 'Tech Solutions Inc',
        type: 'unsecured',
        amount: 75000,
        status: 'complete',
        date: '2024-01-03',
        customerId: 'CUST-005',
      },
    ],
    []
  );

  // Memoize filtered transactions to prevent unnecessary recalculations
  const filteredTransactions = useMemo(() => {
    const effectiveCustomerId = selectedCustomerId || selectedCustomer?.id;

    return effectiveCustomerId
      ? mockTransactions.filter(t => t.customerId === effectiveCustomerId)
      : mockTransactions;
  }, [mockTransactions, selectedCustomerId, selectedCustomer?.id]);

  // Load transactions on mount and when customer changes - optimized useEffect
  useEffect(() => {
    setLoading(true);
    setTransactions(filteredTransactions);
    setLoading(false);
  }, [filteredTransactions]);

  // Sync with current transaction from context - but don't override user selection
  useEffect(() => {
    if (currentTransaction?.id && !selectedTransactionId) {
      // Only sync if we don't have a local selection
      setSelectedTransactionId(currentTransaction.id);
    }
  }, [currentTransaction?.id, selectedTransactionId]);

  // Persist selected transaction to localStorage
  useEffect(() => {
    if (selectedTransactionId) {
      localStorage.setItem('currentTransactionId', selectedTransactionId);
    }
  }, [selectedTransactionId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update risk data for a specific transaction
  const updateRiskDataForTransaction = useCallback(
    async (transaction: Transaction) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock risk data based on transaction type and amount
      const mockRiskData = {
        score: transaction.amount > 200000 ? 'Medium' : 'Low',
        factors: ['Credit history analysis', 'Cash flow assessment', 'Industry risk evaluation'],
        recommendations:
          transaction.amount > 200000
            ? ['Require additional collateral', 'Monthly financial reporting']
            : ['Standard terms acceptable'],
      };

      setRiskReportData(mockRiskData);

      // Mock smart matches for broker/hybrid users
      if (userType === UserType.BROKERAGE) {
        const mockMatches = [
          { lenderId: 'lender-001', name: 'First National Bank', matchScore: 85 },
          { lenderId: 'lender-002', name: 'Community Credit Union', matchScore: 78 },
        ];
        setSmartMatches(mockMatches);
      }

      // Trigger callback if provided
      if (onTransactionChange) {
        onTransactionChange(transaction);
      }
    },
    [userType, onTransactionChange]
  );

  // Handle transaction selection with enhanced functionality
  const handleSelectTransaction = useCallback(
    async (transaction: Transaction) => {
      // First update the local state
      setSelectedTransactionId(transaction.id);
      setIsOpen(false);

      // Then update the global context
      if (setCurrentTransaction) {
        const workflowTransaction = {
          id: transaction.id,
          applicantData: {
            id: `applicant-${Date.now()}`,
            name: transaction.borrowerName,
          },
          amount: transaction.amount,
          type: transaction.type,
          status: 'active' as const,
          createdAt: transaction.date,
          stage: 'application' as const,
          data: {},
          currentStage: 'application' as const,
        };

        setCurrentTransaction(workflowTransaction);
      }

      // Update risk data and matches for the new transaction
      try {
        await updateRiskDataForTransaction(transaction);
      } catch (error) {
        // Silent error handling in production
        ProductionLogger.error('Error updating risk data', 'TransactionSelector', error);
      }
    },
    [setCurrentTransaction, updateRiskDataForTransaction]
  );

  // Get the currently selected transaction object
  const selectedTransaction = transactions.find(t => t.id === selectedTransactionId);

  // Handle paywall triggers for different user types
  const handleRiskReportPaywall = useCallback(() => {
    setShowRiskPaywall(true);
  }, []);

  const handleSmartMatchPaywall = useCallback(() => {
    setShowMatchPaywall(true);
  }, []);

  // Get user type specific features
  const getUserTypeFeatures = () => {
    switch (userType) {
      case UserType.BROKERAGE:
        return {
          primaryFeature: 'Smart Lender Matching',
          secondaryFeature: 'Risk Reports',
          pricing: 'Broker rates apply',
          icon: '🏢',
        };
      case UserType.LENDER:
        return {
          primaryFeature: 'Risk Assessment',
          secondaryFeature: 'Instrument Criteria Matching',
          pricing: 'Lender rates apply',
          icon: '🏦',
        };
      default:
        return {
          primaryFeature: 'Basic Transaction View',
          secondaryFeature: 'Limited Access',
          pricing: 'Standard rates apply',
          icon: '📊',
        };
    }
  };

  // Format currency display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'complete':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Container classes for positioning
  const containerClasses = fixedPosition ? 'fixed bottom-4 right-4 z-40' : 'relative';
  const combinedClasses = `${containerClasses} ${className}`;

  const userFeatures = getUserTypeFeatures();

  return (
    <div className={combinedClasses} ref={dropdownRef}>
      {/* Main Transaction Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 flex items-center space-x-2 transition-colors duration-200"
        disabled={loading}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex flex-col items-start">
          <span className="text-sm">
            {selectedTransaction
              ? `${selectedTransaction.borrowerName} - ${formatCurrency(selectedTransaction.amount || 0)}`
              : 'Select Transaction'}
          </span>
          {loading && <span className="text-xs opacity-75">Updating...</span>}
        </div>
        <span className="text-lg">{userFeatures.icon}</span>
      </button>

      {/* Enhanced Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900">Select Transaction</h3>
              <span className="text-xs text-gray-500">{userFeatures.primaryFeature}</span>
            </div>
          </div>

          {/* Transaction List */}
          <div className="max-h-64 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500">
                <p>No transactions available</p>
                {(selectedCustomerId || selectedCustomer?.id) && (
                  <p className="text-xs mt-1">for {selectedCustomer?.name || selectedCustomerId}</p>
                )}
              </div>
            ) : (
              transactions.map(transaction => (
                <button
                  key={transaction.id}
                  onClick={() => handleSelectTransaction(transaction)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors duration-150 ${
                    currentTransaction?.id === transaction.id
                      ? 'bg-blue-50 border-blue-200'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.borrowerName}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-600">
                          {formatCurrency(transaction.amount)}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500 capitalize">{transaction.type}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Enhanced Footer with User Type Specific Actions */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="space-y-2">
              {/* Primary Action Button */}
              <button
                onClick={handleRiskReportPaywall}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-2 text-sm font-medium transition duration-150"
                disabled={!selectedTransaction}
              >
                Generate Risk Report - {userFeatures.pricing}
              </button>

              {/* Secondary Action for Brokers/Lenders */}
              {(userType === UserType.BROKERAGE || userType === UserType.LENDER) && (
                <button
                  onClick={handleSmartMatchPaywall}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-3 py-2 text-sm font-medium transition duration-150"
                  disabled={!selectedTransaction}
                >
                  {userType === UserType.BROKERAGE
                    ? 'Find Matching Lenders'
                    : 'Match Against Criteria'}
                </button>
              )}

              {/* Hybrid Functionality Note */}
              {userType === UserType.LENDER && (
                <p className="text-xs text-gray-600 text-center">
                  Hybrid lender/broker mode available with premium features
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Risk Report Paywall Modal */}
      {showRiskPaywall && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Report Access</h3>
            <p className="text-sm text-gray-600 mb-4">
              Access comprehensive risk reports and scoring for the selected transaction.
              {userType === UserType.BROKERAGE && ' Broker rates: $250 per report.'}
              {userType === UserType.LENDER && ' Lender rates: $300 per report.'}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRiskPaywall(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRiskPaywall(false);
                  // Implement actual paywall flow
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Match Paywall Modal */}
      {showMatchPaywall && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Smart Matching Access</h3>
            <p className="text-sm text-gray-600 mb-4">
              {userType === UserType.BROKERAGE
                ? 'Access smart lender matching for approved or quick decline decisions. Broker rates: $200 per match.'
                : 'Match transactions against your instrument criteria. Lender rates: $150 per match.'}
              {userType === UserType.LENDER && (
                <span className="block mt-2 font-medium">
                  Upgrade to hybrid lender/broker mode for comprehensive matching at $400 per
                  transaction.
                </span>
              )}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowMatchPaywall(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowMatchPaywall(false);
                  // Implement actual paywall flow
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionSelector;
