import {
  BanknotesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import {
  LenderOption,
  TransactionProfile,
  useEVATransaction,
} from '../contexts/EVATransactionContext';

interface EVATransactionSelectorProps {
  className?: string;
}

interface LenderCategoryOption {
  id: LenderOption['category'];
  label: string;
  description: string;
  icon: React.ComponentType<any>;
}

const EVATransactionSelector: React.FC<EVATransactionSelectorProps> = ({ className = '' }) => {
  const {
    selectedTransaction,
    customerTransactions,
    allActiveTransactions,
    selectTransaction,
    getLendersByCategory,
    matchLenders,
    generateUnderwritingChecklist,
    autoExecuteTasks,
  } = useEVATransaction();

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLenderCategory, setSelectedLenderCategory] = useState<
    LenderOption['category'] | null
  >(null);
  const [availableLenders, setAvailableLenders] = useState<LenderOption[]>([]);
  const [isProcessingWorkflow, setIsProcessingWorkflow] = useState(false);

  // Lender category options
  const lenderCategories: LenderCategoryOption[] = [
    {
      id: 'general',
      label: 'General Lenders',
      description: 'Full-service commercial lending',
      icon: BanknotesIcon,
    },
    {
      id: 'equipment_vehicle',
      label: 'Equipment & Vehicle Lenders',
      description: 'Specialized equipment and vehicle financing',
      icon: ChartBarIcon,
    },
    {
      id: 'real_estate',
      label: 'Real Estate Lenders',
      description: 'Commercial real estate financing',
      icon: DocumentTextIcon,
    },
    {
      id: 'sba',
      label: 'SBA Lenders',
      description: 'SBA guaranteed loan programs',
      icon: CheckCircleIcon,
    },
    {
      id: 'rapheal',
      label: 'Rapheal Lenders',
      description: 'Alternative lending solutions',
      icon: ClockIcon,
    },
    {
      id: 'chaise',
      label: 'Chaise Lenders',
      description: 'Boutique lending for established businesses',
      icon: UsersIcon,
    },
    {
      id: 'austins',
      label: 'Austins Lenders',
      description: 'Regional business lending',
      icon: ExclamationTriangleIcon,
    },
  ];

  // Update available lenders when category changes
  useEffect(() => {
    if (selectedLenderCategory) {
      const lenders = getLendersByCategory(selectedLenderCategory);
      setAvailableLenders(lenders);
    } else {
      setAvailableLenders([]);
    }
  }, [selectedLenderCategory, getLendersByCategory]);

  // Auto-match lenders when transaction is selected
  useEffect(() => {
    if (selectedTransaction) {
      matchLenders(selectedTransaction.id).then(matched => {
        setAvailableLenders(matched);
      });
    }
  }, [selectedTransaction, matchLenders]);

  const getStatusColor = (status: TransactionProfile['status']) => {
    switch (status) {
      case 'initial':
        return 'bg-gray-100 text-gray-800';
      case 'documentation':
        return 'bg-yellow-100 text-yellow-800';
      case 'underwriting':
        return 'bg-blue-100 text-blue-800';
      case 'approval':
        return 'bg-purple-100 text-purple-800';
      case 'funded':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: TransactionProfile['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500';
      case 'high':
        return 'border-l-4 border-orange-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  const handleTransactionSelect = async (transaction: TransactionProfile) => {
    selectTransaction(transaction);
    setIsProcessingWorkflow(true);

    try {
      // Auto-generate underwriting checklist
      await generateUnderwritingChecklist(transaction.id);

      // Auto-execute available tasks
      await autoExecuteTasks(transaction.id);

      // Match lenders based on transaction profile
      const matched = await matchLenders(transaction.id);
      setAvailableLenders(matched);
    } catch (error) {
      console.error('Error processing transaction workflow:', error);
    } finally {
      setIsProcessingWorkflow(false);
    }
  };

  const handleLenderCategorySelect = (category: LenderOption['category']) => {
    setSelectedLenderCategory(category);
    const lenders = getLendersByCategory(category);
    setAvailableLenders(lenders);
  };

  const transactionsToShow =
    customerTransactions.length > 0 ? customerTransactions : allActiveTransactions;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between border-b border-gray-200 px-4 py-3 hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-900">Transaction Selector</h3>
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
            {transactionsToShow.length}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {selectedTransaction && (
            <span className="text-xs text-gray-500">{selectedTransaction.id}</span>
          )}
          <ChevronDownIcon
            className={`h-4 w-4 transform text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Transaction List */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-2 p-2">
            {transactionsToShow.map(transaction => (
              <div
                key={transaction.id}
                className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-gray-50 ${
                  selectedTransaction?.id === transaction.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                } ${getPriorityColor(transaction.priority)}`}
                onClick={() => handleTransactionSelect(transaction)}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{transaction.id}</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(transaction.status)}`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    ${transaction.requestedAmount.toLocaleString()}
                  </span>
                </div>

                <div className="mb-2 text-xs text-gray-600">
                  <p className="font-medium">{transaction.customerName}</p>
                  <p>{transaction.type.replace('_', ' ').toUpperCase()}</p>
                  <p className="truncate">{transaction.purpose}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-2 flex items-center space-x-2">
                  <div className="bg-gray-200 h-2 flex-1 rounded-full">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                      style={{
                        width: `${Math.max(
                          transaction.progress.documentation,
                          transaction.progress.verification,
                          transaction.progress.underwriting,
                          transaction.progress.approval,
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round(
                      Math.max(
                        transaction.progress.documentation,
                        transaction.progress.verification,
                        transaction.progress.underwriting,
                        transaction.progress.approval,
                      ),
                    )}
                    %
                  </span>
                </div>

                {/* Task Progress */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {transaction.completedTasks}/{transaction.totalTasks} tasks
                  </span>
                  {transaction.alerts.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <ExclamationTriangleIcon className="h-3 w-3 text-amber-500" />
                      <span className="text-amber-600">{transaction.alerts.length}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Transaction Details */}
      {selectedTransaction && (
        <div className="border-t border-gray-200 p-4">
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-gray-900">
              Selected Transaction: {selectedTransaction.id}
            </h4>

            {isProcessingWorkflow && (
              <div className="mb-3 flex items-center space-x-2 text-sm text-blue-600">
                <ClockIcon className="h-4 w-4 animate-spin" />
                <span>Processing workflow automation...</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500">Amount:</span>
                <span className="ml-2 font-medium">
                  ${selectedTransaction.requestedAmount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Terms:</span>
                <span className="ml-2 font-medium">{selectedTransaction.proposedTerms} months</span>
              </div>
              <div>
                <span className="text-gray-500">Credit Score:</span>
                <span className="ml-2 font-medium">
                  {selectedTransaction.financialSummary.creditScore || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Risk Score:</span>
                <span className="ml-2 font-medium">
                  {selectedTransaction.financialSummary.riskScore || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Lender Category Selector */}
          <div className="mb-4">
            <h5 className="mb-2 text-sm font-medium text-gray-900">Auto RAG Lender Selection</h5>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {lenderCategories.map(category => {
                return (
                  <button
                    key={category.id}
                    onClick={() => handleLenderCategorySelect(category.id)}
                    className={`rounded-lg border p-2 text-left transition-colors ${
                      selectedLenderCategory === category.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="mb-1 flex items-center space-x-2">
                      {React.createElement(category.icon, { className: 'h-4 w-4' })}
                      <span className="text-xs font-medium">{category.label}</span>
                    </div>
                    <p className="truncate text-xs text-gray-500">{category.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Available Lenders */}
            {availableLenders.length > 0 && (
              <div className="max-h-32 overflow-y-auto">
                <h6 className="mb-2 text-xs font-medium text-gray-700">
                  Available Lenders ({availableLenders.length})
                </h6>
                {availableLenders.map(lender => (
                  <div
                    key={lender.id}
                    className="mb-2 cursor-pointer rounded border border-gray-200 p-2 hover:bg-gray-50"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-900">{lender.name}</span>
                      <span className="text-xs text-green-600">
                        {lender.approvalRate}% approval
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>Rate: {lender.interestRateRange}</p>
                      <p>Processing: {lender.processingTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction Summary for EVA */}
          <div className="rounded-lg bg-blue-50 p-3">
            <h6 className="mb-1 text-xs font-medium text-blue-900">EVA Context Ready</h6>
            <p className="text-xs text-blue-700">
              Transaction {selectedTransaction.id} selected. EVA will now provide context-aware
              assistance for underwriting, document processing, and lender matching.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EVATransactionSelector;
