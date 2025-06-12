import React, { useState, useEffect } from 'react';
import { useWorkflow } from '../contexts/WorkflowContext';
import RiskMapEvaReport from '../components/risk/RiskMapEvaReport';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

// Mock transactions for demo
const mockTransactions = [
  {
    id: 'TX-001',
    type: 'Equipment Loan',
    amount: 250000,
    applicantData: {
      id: 'app-001',
      name: 'ABC Manufacturing Inc.',
      entityType: 'Corporation',
      industryCode: 'MFG',
    },
    stage: 'risk_assessment' as const,
    status: 'active' as const,
    data: {
      requestedAmount: 250000,
      purpose: 'Equipment Purchase',
      term: 60,
    },
    createdAt: new Date().toISOString(),
    currentStage: 'risk_assessment' as const,
  },
  {
    id: 'TX-002',
    type: 'Real Estate Loan',
    amount: 1500000,
    applicantData: {
      id: 'app-002',
      name: 'XYZ Properties LLC',
      entityType: 'LLC',
      industryCode: 'RE',
    },
    stage: 'risk_assessment' as const,
    status: 'active' as const,
    data: {
      requestedAmount: 1500000,
      purpose: 'Property Acquisition',
      term: 120,
    },
    createdAt: new Date().toISOString(),
    currentStage: 'risk_assessment' as const,
  },
  {
    id: 'TX-003',
    type: 'Working Capital',
    amount: 100000,
    applicantData: {
      id: 'app-003',
      name: 'Demo Business Corp',
      entityType: 'Corporation',
      industryCode: 'RETAIL',
    },
    stage: 'risk_assessment' as const,
    status: 'active' as const,
    data: {
      requestedAmount: 100000,
      purpose: 'Working Capital',
      term: 36,
    },
    createdAt: new Date().toISOString(),
    currentStage: 'risk_assessment' as const,
  },
];

const TransactionRiskMapDemo: React.FC = () => {
  const { currentTransaction, setCurrentTransaction } = useWorkflow();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(currentTransaction);

  // Initialize with first transaction if none selected
  useEffect(() => {
    if (!currentTransaction && mockTransactions.length > 0) {
      setCurrentTransaction(mockTransactions[0]);
      setSelectedTransaction(mockTransactions[0]);
    }
  }, [currentTransaction, setCurrentTransaction]);

  const handleTransactionSelect = (transaction: any) => {
    setSelectedTransaction(transaction);
    setCurrentTransaction(transaction);
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pl-20 sm:pl-72">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transaction Risk Map</h1>
          <p className="mt-2 text-gray-600">
            Select a transaction to view its risk assessment. The risk map will automatically adjust
            based on the transaction type.
          </p>
        </div>

        {/* Transaction Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Transaction</label>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full md:w-96 bg-white border border-gray-300 rounded-lg px-4 py-3 text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div>
                {selectedTransaction ? (
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedTransaction.id} - {selectedTransaction.type}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedTransaction.applicantData?.name} • $
                      {selectedTransaction.amount.toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">Select a transaction...</span>
                )}
              </div>
              <ChevronDownIcon
                className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                {mockTransactions.map(transaction => (
                  <button
                    key={transaction.id}
                    onClick={() => handleTransactionSelect(transaction)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">
                      {transaction.id} - {transaction.type}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.applicantData.name} • ${transaction.amount.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Select a transaction from the dropdown above</li>
            <li>• The risk map will check if a report exists for that transaction</li>
            <li>• If no report exists, you'll see a paywall to purchase or use credits</li>
            <li>
              • The risk map type (General, Equipment, Real Estate) is automatically determined by
              the transaction type
            </li>
            <li>• Once purchased, the full risk assessment will be displayed</li>
          </ul>
        </div>

        {/* Risk Map Component */}
        <div className="bg-white rounded-lg shadow">
          {selectedTransaction ? (
            <RiskMapEvaReport
              transactionId={selectedTransaction.id}
              // The risk map type will be automatically determined based on transaction type
            />
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p>Please select a transaction to view its risk assessment.</p>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default TransactionRiskMapDemo;
