import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RiskLab from '../components/risk/RiskLab';
import RiskMapCore from '../components/risk/RiskMapCore';
import { useTransactionStore } from '../hooks/useTransactionStore';

// Tooltip component following best practices
const Tooltip: React.FC<{
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        tabIndex={0}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg max-w-xs ${positionClasses[position]}`}
          role="tooltip"
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top'
                ? 'top-full left-1/2 -translate-x-1/2 -mt-1'
                : position === 'bottom'
                  ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1'
                  : position === 'left'
                    ? 'left-full top-1/2 -translate-y-1/2 -ml-1'
                    : 'right-full top-1/2 -translate-y-1/2 -mr-1'
            }`}
          />
        </div>
      )}
    </div>
  );
};

// Workflow step indicator
const WorkflowStep: React.FC<{
  step: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
}> = ({ step, title, description, isActive, isCompleted }) => {
  return (
    <div
      className={`flex items-center ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}
    >
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 mr-3 ${
          isActive
            ? 'border-blue-600 bg-blue-50'
            : isCompleted
              ? 'border-green-600 bg-green-50'
              : 'border-gray-300 bg-gray-50'
        }`}
      >
        {isCompleted ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <span className="text-sm font-semibold">{step}</span>
        )}
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
};

const RiskAssessment: React.FC = () => {
  const { transactions, currentTransaction, setCurrentTransaction, fetchTransactions, loading } =
    useTransactionStore();
  const location = useLocation();
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Check if user needs onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('riskAssessmentOnboarding');
    if (!hasSeenOnboarding && transactions.length === 0) {
      setShowOnboarding(true);
    }
  }, [transactions.length]);

  // Fetch transactions on component mount
  useEffect(() => {
    if (transactions.length === 0) {
      fetchTransactions();
    }
  }, [transactions.length, fetchTransactions]);

  useEffect(() => {
    // Smart transaction selection with better logic
    if (!currentTransaction && transactions.length > 0) {
      // Prioritize transactions in risk_assessment stage
      const riskTransactions = transactions.filter(t => t.currentStage === 'risk_assessment');
      const targetTransaction = riskTransactions.length > 0 ? riskTransactions[0] : transactions[0];

      setCurrentTransaction?.(targetTransaction);
      setSelectedCustomer(targetTransaction.applicantData?.name || '');
      setCurrentStep(2); // Move to step 2 when transaction is selected
    }
  }, [transactions, currentTransaction, setCurrentTransaction]);

  // Determine the initial view and type based on the URL path
  const getInitialViewFromPath = () => {
    const path = location.pathname;
    if (path.includes('/eva-report/full')) {
      return { view: 'eva-report' as const, showFullReport: true };
    } else if (path.includes('/eva-report')) {
      return { view: 'score' as const, showFullReport: false };
    } else if (path.includes('/lab')) {
      return { view: 'lab' as const, showFullReport: false };
    } else if (path.includes('/score')) {
      return { view: 'score' as const, showFullReport: false };
    } else {
      return { view: 'dashboard' as const, showFullReport: false };
    }
  };

  const { view: initialView, showFullReport } = getInitialViewFromPath();

  // Handle customer selection with enhanced logic
  const handleCustomerChange = (customerId: string) => {
    const selectedTransaction = transactions.find(t => t.id === customerId);
    if (selectedTransaction) {
      setCurrentTransaction(selectedTransaction);
      setSelectedCustomer(selectedTransaction.applicantData?.name || '');
      setCurrentStep(2);
    }
  };

  // Handle transaction selection with enhanced logic
  const handleTransactionChange = (transactionId: string) => {
    const selectedTransaction = transactions.find(t => t.id === transactionId);
    if (selectedTransaction) {
      setCurrentTransaction(selectedTransaction);
      setSelectedCustomer(selectedTransaction.applicantData?.name || '');
      setCurrentStep(2);
    }
  };

  // Get unique customers with enhanced grouping
  const getUniqueCustomers = () => {
    const customerMap = new Map();

    transactions.forEach(t => {
      const name = t.applicantData?.name || 'Unknown Customer';
      if (!customerMap.has(name)) {
        customerMap.set(name, {
          id: t.id,
          name,
          entityType: t.applicantData?.entityType || 'Unknown',
          transactionCount: 1,
          totalAmount: t.amount || 0,
        });
      } else {
        const existing = customerMap.get(name);
        existing.transactionCount += 1;
        existing.totalAmount += t.amount || 0;
      }
    });

    return Array.from(customerMap.values());
  };

  // Get workflow progress
  const getWorkflowProgress = () => {
    const steps = [
      {
        title: 'Select Customer',
        description: 'Choose customer for analysis',
        isCompleted: !!selectedCustomer,
      },
      {
        title: 'Select Transaction',
        description: 'Pick specific transaction',
        isCompleted: !!currentTransaction,
      },
      {
        title: 'Configure Risk Parameters',
        description: 'Pick instrument to match against',
        isCompleted: false,
      },
      {
        title: 'Generate EVA Report',
        description: 'Create comprehensive analysis',
        isCompleted: false,
      },
    ];
    return steps;
  };

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('riskAssessmentOnboarding', 'true');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Welcome to Risk Assessment</h3>
            <p className="text-gray-600 mb-6">
              EVA's Risk Assessment helps you evaluate loan applications using AI-powered analysis.
              Follow the simple 4-step process to generate comprehensive risk reports.
            </p>
            <div className="space-y-3 mb-6">
              {getWorkflowProgress().map((step, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{step.title}</div>
                    <div className="text-gray-500">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDismissOnboarding}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {initialView === 'lab' ? 'Risk Laboratory' : 'Risk Assessment'}
            </h1>
            <p className="text-gray-600 mt-1">
              {initialView === 'lab'
                ? 'Advanced risk modeling and Smart Match configuration workspace'
                : showFullReport
                  ? 'Full EVA Risk Report and Analysis'
                  : 'Evaluate transaction risk using AI-powered assessment tools'}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Toggle Buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Tooltip content="Standard risk assessment and EVA report generation">
                <a
                  href="/risk-assessment"
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    initialView !== 'lab'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Assessment
                </a>
              </Tooltip>
              <Tooltip content="Advanced risk configuration and Smart Match instrument setup">
                <a
                  href="/risk-assessment/lab"
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    initialView === 'lab'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Risk Lab
                </a>
              </Tooltip>
            </div>

            <Tooltip content="Learn how the 4-step risk assessment process works">
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                How it works?
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Workflow Progress */}
        <div className="mt-4 bg-blue-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {getWorkflowProgress().map((step, index) => (
              <WorkflowStep
                key={index}
                step={index + 1}
                title={step.title}
                description={step.description}
                isActive={currentStep === index + 1}
                isCompleted={step.isCompleted}
              />
            ))}
          </div>
        </div>

        {showFullReport && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              📊 Displaying comprehensive risk analysis with all available data points and
              recommendations.
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Customer and Transaction Selectors */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Selector with tooltip */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center mb-2">
            <label htmlFor="customer-select" className="block text-sm font-medium text-gray-700">
              Select Customer
            </label>
            <Tooltip content="Choose the customer/borrower for this risk assessment. Each customer may have multiple transactions.">
              <svg
                className="w-4 h-4 ml-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Tooltip>
          </div>

          {loading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded-md"></div>
            </div>
          ) : (
            <select
              id="customer-select"
              value={currentTransaction?.id || ''}
              onChange={e => handleCustomerChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Choose a customer...</option>
              {getUniqueCustomers().map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.entityType}) - {customer.transactionCount} transaction
                  {customer.transactionCount > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          )}

          {selectedCustomer && (
            <p className="mt-1 text-xs text-gray-500">Selected: {selectedCustomer}</p>
          )}
        </div>

        {/* Transaction Selector with tooltip */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center mb-2">
            <label htmlFor="transaction-select" className="block text-sm font-medium text-gray-700">
              Select Transaction
            </label>
            <Tooltip content="Choose the specific loan application or transaction to analyze. Transaction type affects the risk parameters used.">
              <svg
                className="w-4 h-4 ml-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Tooltip>
          </div>

          {loading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded-md"></div>
            </div>
          ) : (
            <select
              id="transaction-select"
              value={currentTransaction?.id || ''}
              onChange={e => handleTransactionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Choose a transaction...</option>
              {transactions.map(transaction => (
                <option key={transaction.id} value={transaction.id}>
                  {transaction.applicantData?.name || 'Unknown'} - $
                  {transaction.amount?.toLocaleString() || '0'} ({transaction.type})
                </option>
              ))}
            </select>
          )}

          {currentTransaction && (
            <p className="mt-1 text-xs text-gray-500">
              Selected: {currentTransaction.id} - ${currentTransaction.amount?.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Enhanced Current Transaction Info */}
      {currentTransaction && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-800">Current Transaction</h3>
              <p className="text-blue-700 font-semibold">{currentTransaction.id}</p>
              <p className="text-blue-600 text-sm">
                {currentTransaction.applicantData?.name} • $
                {currentTransaction.amount?.toLocaleString()} • {currentTransaction.type}
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Ready for EVA Analysis
              </div>
              <Tooltip content="Smart Match uses AI to automatically match this transaction with similar approved loans to provide instant pre-qualification insights.">
                <p className="text-xs text-blue-600 mt-1 cursor-help">Smart Match Available</p>
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Warning for missing data */}
      {!currentTransaction && !loading && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Customer and Transaction Required
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Please select a customer and transaction above to generate EVA Risk Reports with
                Smart Match results.
                {transactions.length === 0 && ' No transactions found - please create one first.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main risk assessment */}
      {initialView === 'lab' ? <RiskLab /> : <RiskMapCore initialView={initialView} />}
    </div>
  );
};

export default RiskAssessment;
