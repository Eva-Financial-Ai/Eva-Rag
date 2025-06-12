import React, { useState, useEffect } from 'react';
import { useWorkflow, WorkflowStage } from '../../contexts/WorkflowContext';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface Transaction {
  id: string;
  borrowerName: string;
  type: string;
  amount: number;
  status: string;
  date: string;
  evaRiskScore?: number;
  stage?: WorkflowStage;
}

const GlobalHeader: React.FC = () => {
  const { currentTransaction, setCurrentTransaction } = useWorkflow();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Load transactions
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      // Mock transactions - in real app, fetch from API
      const mockTransactions: Transaction[] = [
        {
          id: 'TX-101',
          borrowerName: 'Acme Industries',
          type: 'Equipment Loan',
          amount: 750000,
          status: 'In Progress',
          date: '2024-01-15',
          evaRiskScore: 8.5,
          stage: 'underwriting',
        },
        {
          id: 'TX-102',
          borrowerName: 'Smith Enterprises',
          type: 'Finance Lease',
          amount: 1250000,
          status: 'In Progress',
          date: '2024-01-20',
          evaRiskScore: 7.8,
          stage: 'document_collection',
        },
        {
          id: 'TX-103',
          borrowerName: 'Tech Innovations Inc',
          type: 'Commercial Mortgage',
          amount: 2500000,
          status: 'In Progress',
          date: '2024-01-25',
          evaRiskScore: 9.2,
          stage: 'approval',
        },
        {
          id: 'TX-104',
          borrowerName: 'Global Manufacturing Co',
          type: 'Working Capital',
          amount: 500000,
          status: 'Pending',
          date: '2024-01-28',
          evaRiskScore: 6.5,
          stage: 'application',
        },
        {
          id: 'TX-105',
          borrowerName: 'Logistics Partners LLC',
          type: 'Fleet Financing',
          amount: 3200000,
          status: 'In Progress',
          date: '2024-01-30',
          evaRiskScore: 8.1,
          stage: 'risk_assessment',
        },
      ];

      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTransaction = (transaction: Transaction) => {
    if (setCurrentTransaction) {
      setCurrentTransaction({
        id: transaction.id,
        applicantData: {
          id: `applicant-${Date.now()}`,
          name: transaction.borrowerName,
        },
        amount: transaction.amount,
        type: transaction.type,
        status: 'active',
        createdAt: transaction.date,
        stage: transaction.stage || 'application',
        data: {
          evaRiskScore: transaction.evaRiskScore,
          status: transaction.status,
        },
        currentStage: transaction.stage || 'application',
      });
    }
    setIsOpen(false);

    // Store selected transaction
    localStorage.setItem('currentTransactionId', transaction.id);

    // Navigate to appropriate view based on current location
    const currentPath = window.location.pathname;
    if (currentPath.includes('risk-assessment')) {
      navigate(`/risk-assessment/eva-report?transactionId=${transaction.id}`);
    } else if (currentPath.includes('auto-originations')) {
      navigate(`/auto-originations/${transaction.id}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageIcon = (stage?: WorkflowStage) => {
    switch (stage) {
      case 'application':
        return '📝';
      case 'document_collection':
        return '📄';
      case 'underwriting':
        return '🔍';
      case 'risk_assessment':
        return '⚠️';
      case 'approval':
        return '✅';
      default:
        return '📋';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-40 pr-2">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center space-x-2 shadow-sm hover:shadow-md transition-shadow min-w-[200px] max-w-[300px]"
        >
          <div className="flex-1 text-left overflow-hidden">
            {currentTransaction ? (
              <div>
                <div className="text-sm font-medium text-gray-900 truncate">
                  {currentTransaction.applicantData?.name || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {currentTransaction.type} • {formatCurrency(currentTransaction.amount || 0)}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">Select Transaction</div>
            )}
          </div>
          <ChevronDownIcon
            className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 w-96 max-h-[500px] overflow-auto">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Active Transactions</h3>
              <p className="text-xs text-gray-500 mt-1">Select a transaction to view details</p>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="text-sm text-gray-500 mt-2">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No active transactions found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map(transaction => (
                  <button
                    key={transaction.id}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      currentTransaction?.id === transaction.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleSelectTransaction(transaction)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getStageIcon(transaction.stage)}</span>
                          <div>
                            <div className="font-medium text-gray-900">
                              {transaction.borrowerName}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {transaction.type} • {transaction.id}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center space-x-4">
                          <div className="text-sm">
                            <span className="text-gray-500">Amount:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {formatCurrency(transaction.amount)}
                            </span>
                          </div>

                          {transaction.evaRiskScore && (
                            <div className="text-sm">
                              <span className="text-gray-500">EVA Score:</span>
                              <span
                                className={`ml-1 font-medium ${
                                  transaction.evaRiskScore >= 8
                                    ? 'text-green-600'
                                    : transaction.evaRiskScore >= 6
                                      ? 'text-yellow-600'
                                      : 'text-red-600'
                                }`}
                              >
                                {transaction.evaRiskScore}/10
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="ml-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Last updated: {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalHeader;
