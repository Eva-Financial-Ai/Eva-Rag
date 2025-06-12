import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { useWorkflow, WorkflowStage } from '../../contexts/WorkflowContext';
import { TermSheetData, TermSheetDocument } from '../../services/DocumentGenerationService';
import DocumentStatusViewer from '../document/DocumentStatusViewer';
import { useEventPublisher, useEventSubscription } from '../../hooks/useEventBus';
import { dealStructuringEvents, fileLockEvents } from '../../services/EventBusService';
import {
  ActionButtons,
  calculatePayment,
  ConfirmationMessage,
  CustomRequest,
  CustomRequestForm,
  DealOption,
  DealOptionCard,
  DealOptionsSkeleton,
  ErrorMessage,
  ProgressChecklist,
  SharedLoadingSpinner,
  SmartMatchSkeleton,
} from './DealStructuringComponents';
import TermSheetGenerator from './TermSheetGenerator';

import { debugLog } from '../../utils/auditLogger';

// Lazy load the new Smart Match Engine
const SmartMatchEngine = lazy(() => import('./SmartMatchEngine'));

// Use our own simplified Transaction interface that matches what we're using in this component
interface Transaction {
  id: string;
  borrowerName: string;
  type: string;
  amount: number;
  status: string;
  date: string;
  isSelected?: boolean;
}

// Create a fallback error component
const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-red-800">Something went wrong:</h3>
      <p className="mt-2 text-red-700">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
      >
        Try again
      </button>
    </div>
  );
};

// Wrapper component to manage options selection
const DealOptionsSelector = ({
  dealOptions,
  selectedOptionId,
  onSelectOption,
  onCustomRequest,
  isLoading,
  loadError,
  onRetry,
}: {
  dealOptions: DealOption[];
  selectedOptionId: string | null;
  onSelectOption: (id: string) => void;
  onCustomRequest: () => void;
  isLoading: boolean;
  loadError: string | null;
  onRetry: () => void;
}) => {
  if (isLoading) {
    return <DealOptionsSkeleton />;
  }

  if (loadError) {
    return <ErrorMessage message={loadError} onRetry={onRetry} />;
  }

  return (
    <div>
      <h2 className="text-xl font-medium text-gray-900 mb-4">Select Financing Option</h2>

      {dealOptions.map(option => (
        <DealOptionCard
          key={option.id}
          option={option}
          selected={selectedOptionId === option.id}
          onSelect={() => onSelectOption(option.id)}
        />
      ))}

      <button
        onClick={onCustomRequest}
        className="w-full py-2 px-4 mt-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Request Custom Terms
      </button>
    </div>
  );
};

const DealStructuring = () => {
  const { currentTransaction, fetchTransactions, updateTransaction } = useWorkflow();
  const { userRole } = React.useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { publish } = useEventPublisher();
  const [loading, setLoading] = useState(true);
  const [dealOptions, setDealOptions] = useState<DealOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showCustomRequestForm, setShowCustomRequestForm] = useState(false);
  const [customRequest, setCustomRequest] = useState<CustomRequest>({});
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [activeTransactions, setActiveTransactions] = useState<Transaction[]>([]);
  const [showTransactionSelector, setShowTransactionSelector] = useState(false);
  const [allRequirementsMet, setAllRequirementsMet] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [checklist, setChecklist] = useState([
    { id: 'deal-option', text: 'Select Deal Structure', isCompleted: false },
    { id: 'doc-review', text: 'Document Review Complete', isCompleted: false },
    { id: 'risk-assessment', text: 'Risk Assessment Complete', isCompleted: false },
    { id: 'approval', text: 'Obtain Final Approval', isCompleted: false },
  ]);
  const [showSmartMatchTool, setShowSmartMatchTool] = useState(false);

  // New state for term sheet generation
  const [showTermSheetGenerator, setShowTermSheetGenerator] = useState(false);
  const [termSheetDocument, setTermSheetDocument] = useState<TermSheetDocument | null>(null);
  const [termSheetGenerationStatus, setTermSheetGenerationStatus] = useState<
    'pending' | 'generating' | 'completed' | 'error'
  >('pending');
  const [recentlyGeneratedTermSheet, setRecentlyGeneratedTermSheet] = useState(false);

  // Add a new state for document status viewing
  const [showDocumentStatus, setShowDocumentStatus] = useState(false);

  // Check if coming from Credit Application
  useEffect(() => {
    if (location.state?.fromCreditApplication && location.state?.applicationId) {
      setApplicationId(location.state.applicationId);
      debugLog('general', 'log_statement', 'Navigated from Credit Application:', location.state);
    }
  }, [location.state]);

  // Subscribe to credit application events
  useEventSubscription(
    ['credit-application:submitted', 'credit-application:approved'],
    async (payload) => {
      if (payload.creditApplication) {
        debugLog('general', 'log_statement', 'Credit application event received:', payload.creditApplication);
        
        // If application is approved, enable deal structuring
        if (payload.creditApplication.status === 'approved') {
          // Auto-generate deal options based on application data
          generateDealOptions();
          
          // Publish deal structuring initiated event
          await dealStructuringEvents.initiateDeal({
            transactionId: currentTransaction?.id || `TX-${Date.now()}`,
            status: 'initiated'
          });
        }
      }
    },
    [currentTransaction]
  );

  // Subscribe to FileLock document events
  useEventSubscription(
    ['filelock:document-uploaded', 'filelock:document-signed'],
    async (payload) => {
      if (payload.filelock?.transactionId === currentTransaction?.id) {
        debugLog('general', 'log_statement', 'FileLock document event for current transaction:', payload.filelock);
        
        // If a document is signed, check if it's the term sheet
        if (payload.filelock.action === 'signed' && payload.filelock.documentType === 'term_sheet') {
          // Mark document review as complete
          completeChecklist('doc-review');
          
          // Update transaction status
          if (updateTransaction) {
            await updateTransaction({
              ...currentTransaction,
              status: 'active' as const
            });
          }
        }
      }
    },
    [currentTransaction, updateTransaction]
  );

  // Improved deal options generation with error handling and memoization
  const generateDealOptions = useCallback(() => {
    if (!currentTransaction) {
      console.error('Cannot generate deal options: No current transaction available');
      setLoadError('No transaction data available. Please select a transaction.');
      setLoading(false);
      return;
    }

    debugLog('general', 'log_statement', 'Generating deal options for transaction:', currentTransaction.id)

    try {
      // Generate options based on transaction type and amount
      const baseRate =
        currentTransaction.type === 'Finance Lease'
          ? 5.5
          : currentTransaction.type === 'Equipment Loan'
            ? 6.0
            : currentTransaction.type === 'Commercial Mortgage'
              ? 4.5
              : 7.0;

      // Adjust for amount (larger amounts get slightly better rates)
      const amountFactor = currentTransaction?.amount
        ? Math.min(Math.max(currentTransaction.amount / 1000000, 0), 1) * 0.5
        : 0;

      const options: DealOption[] = [
        // Option 1: Standard Term
        {
          id: 'option-1',
          name: 'Standard Term',
          term: 60,
          rate: Math.round((baseRate - amountFactor + (Math.random() * 0.3 - 0.15)) * 100) / 100,
          payment: calculatePayment(currentTransaction?.amount ?? 0, 60, baseRate - amountFactor),
          downPayment: Math.round((currentTransaction?.amount ?? 0) * 0.1),
          residual: 10,
          score: 85,
        },
        // Option 2: Extended Term
        {
          id: 'option-2',
          name: 'Extended Term',
          term: 84,
          rate:
            Math.round((baseRate - amountFactor + 0.35 + (Math.random() * 0.3 - 0.15)) * 100) / 100,
          payment: calculatePayment(
            currentTransaction?.amount ?? 0,
            84,
            baseRate - amountFactor + 0.35
          ),
          downPayment: Math.round((currentTransaction?.amount ?? 0) * 0.1),
          residual: 5,
          score: 75,
        },
        // Option 3: Low Down Payment
        {
          id: 'option-3',
          name: 'Low Down Payment',
          term: 60,
          rate:
            Math.round((baseRate - amountFactor + 0.5 + (Math.random() * 0.3 - 0.15)) * 100) / 100,
          payment: calculatePayment(
            currentTransaction?.amount ?? 0,
            60,
            baseRate - amountFactor + 0.5
          ),
          downPayment: Math.round((currentTransaction?.amount ?? 0) * 0.05),
          residual: 10,
          score: 70,
        },
        // Option 4: Balloon/Residual
        {
          id: 'option-4',
          name: 'With Balloon Payment',
          term: 48,
          rate:
            Math.round((baseRate - amountFactor + 0.25 + (Math.random() * 0.3 - 0.15)) * 100) / 100,
          payment: calculatePayment(
            (currentTransaction?.amount ?? 0) * 0.85,
            48,
            baseRate - amountFactor + 0.25
          ),
          downPayment: Math.round((currentTransaction?.amount ?? 0) * 0.1),
          residual: 20,
          score: 80,
        },
      ];

      // Sort by score
      const sortedOptions = [...options].sort((a, b) => b.score - a.score);
      debugLog('general', 'log_statement', 'Generated deal options:', sortedOptions.length)
      setDealOptions(sortedOptions);

      // Set the highest scored option as selected by default
      if (sortedOptions.length > 0) {
        setSelectedOptionId(sortedOptions[0].id);
      }

      setLoadError(null);
    } catch (error) {
      console.error('Error generating deal options:', error);
      setLoadError('Failed to generate deal options. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, [currentTransaction]);

  // Improved active transactions fetching with error handling
  const fetchActiveTransactions = useCallback(() => {
    debugLog('general', 'log_statement', 'Fetching active transactions...')

    // Simulate fetching active transactions
    setTimeout(() => {
      try {
        const mockTransactions: Transaction[] = [
          {
            id: 'TX-101',
            borrowerName: 'Acme Industries',
            type: 'Equipment Loan',
            amount: 750000,
            status: 'In Progress',
            date: '2023-08-15',
            isSelected: false,
          },
          {
            id: 'TX-102',
            borrowerName: 'Smith Enterprises',
            type: 'Finance Lease',
            amount: 1250000,
            status: 'In Progress',
            date: '2023-08-20',
            isSelected: false,
          },
          {
            id: 'TX-103',
            borrowerName: 'Tech Innovations Inc',
            type: 'Commercial Mortgage',
            amount: 2500000,
            status: 'In Progress',
            date: '2023-08-25',
            isSelected: false,
          },
        ];

        // If there's a current transaction, mark it as selected
        if (currentTransaction?.id) {
          debugLog('general', 'log_statement', 'Current transaction found, marking as selected:', currentTransaction.id)
          const updatedTransactions = mockTransactions.map(tx =>
            tx.id === currentTransaction.id ? { ...tx, isSelected: true } : tx
          );
          setActiveTransactions(updatedTransactions);
        } else {
          debugLog('general', 'log_statement', 'No current transaction, showing all active transactions')
          setActiveTransactions(mockTransactions);
        }

        // If no transactions are selected, show the selector automatically
        if (!currentTransaction) {
          setShowTransactionSelector(true);
        }
      } catch (error) {
        console.error('Error fetching active transactions:', error);
        // Still provide some data even on error
        setActiveTransactions([]);
      }
    }, 1000);
  }, [currentTransaction]);

  // Improved loading with more robust transaction handling and reduced timeout
  useEffect(() => {
    debugLog('general', 'log_statement', 'DealStructuring component mounted, initializing...')

    const loadDeals = async () => {
      debugLog('general', 'log_statement', 'Loading deal structure data...')
      setLoading(true);
      setLoadError(null);

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Use fetchTransactions (from props or context if available)
        // For now, assume it's a direct function call that updates state elsewhere
        // or it could be integrated here.
        // await fetchTransactions(); // If it's an async operation

        // Simulate generating deal options after data is fetched
        setTimeout(() => {
          generateDealOptions();
        }, 800);
      } catch (error) {
        console.error('Error loading deal structure data:', error);
        setLoadError('Failed to load deal structure data. Please try again.');
        setLoading(false);
      }
    };

    // Load the active transactions regardless of current transaction state
    fetchActiveTransactions();

    // Start the main loading process
    loadDeals();

    // Cleanup function
    return () => {
      debugLog('general', 'log_statement', 'DealStructuring component unmounting...')
    };
  }, [currentTransaction, fetchTransactions, generateDealOptions, fetchActiveTransactions]);

  const handleCustomRequestChange = useCallback(
    (field: keyof CustomRequest, value: string | number) => {
      setCustomRequest(prev => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const submitCustomRequest = useCallback(() => {
    // In a real app, this would make an API call to submit the custom request
    debugLog('general', 'log_statement', 'Submitting custom request:', customRequest)

    // Hide the form
    setShowCustomRequestForm(false);

    // Show success message
    setRequestSubmitted(true);

    // Auto hide success message after a delay
    setTimeout(() => {
      setRequestSubmitted(false);
    }, 5000);

    // In a real app, you would add the request to a list of pending requests
    // For this demo, just clear the form
    setCustomRequest({});
  }, [customRequest]);

  const completeChecklist = useCallback(
    (itemId: string) => {
      setChecklist(prevChecklist =>
        prevChecklist.map(item =>
          item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
        )
      );
    },
    [setChecklist] // Dependency is only the stable setter
  );

  // Effect to update allRequirementsMet when checklist changes
  useEffect(() => {
    const allCompleted = checklist.every(item => item.isCompleted);
    setAllRequirementsMet(allCompleted);
  }, [checklist, setAllRequirementsMet]);

  const moveToTransactionExecution = useCallback(() => {
    if (!allRequirementsMet) {
      // Show an alert or error message
      alert('Please complete all requirements before proceeding');
      return;
    }

    // In a real app, this would advance the transaction to the next stage
    // Show a loading state
    debugLog('general', 'log_statement', 'Moving to transaction execution...')

    // Simulate a delay
    setTimeout(() => {
      // Navigate to the transactions page
      navigate('/transactions');
    }, 1000);
  }, [allRequirementsMet, navigate]);

  const handleSmartMatchSelect = useCallback(
    (match: any) => {
      debugLog('general', 'log_statement', 'Selected smart match:', match)

      // Navigate to the new Deal Structure Editor
      navigate('/deal-structuring/editor', {
        state: {
          matchId: match.id,
          borrowerName: match.borrowerName,
          dealAmount: match.dealAmount,
          matchScore: match.matchScore,
          riskScore: match.riskScore,
          approvedTerms: {
            rate: match.proposedRate,
            term: match.proposedTerm,
            downPayment: match.downPaymentRequired,
          },
          contacts: match.contacts,
          instrumentType: match.instrumentType,
        },
      });
    },
    [navigate]
  );

  const handleGenerateTermSheet = useCallback(() => {
    if (!selectedOptionId) {
      alert('Please select a deal option first');
      return;
    }

    setShowTermSheetGenerator(true);
    setTermSheetGenerationStatus('generating');
  }, [selectedOptionId]);

  const prepareTermSheetData = useCallback((): TermSheetData => {
    if (!currentTransaction || !selectedOptionId) {
      throw new Error('Missing transaction or deal option data');
    }

    const selectedOption = dealOptions.find(opt => opt.id === selectedOptionId);
    if (!selectedOption) {
      throw new Error('Selected deal option not found');
    }

    // Get borrower name from current transaction
    const borrowerName = currentTransaction.applicantData?.name || 'Borrower';

    return {
      transactionId: currentTransaction.id,
      transactionType: currentTransaction.type || 'Equipment Finance',
      borrowerName,
      vendorName: 'EVA Financial Services',
      loanAmount: currentTransaction.amount ?? 0,
      downPayment: selectedOption.downPayment,
      residualValue: (currentTransaction.amount ?? 0) * (selectedOption.residual / 100),
      residualPercent: selectedOption.residual,
      term: selectedOption.term,
      rate: selectedOption.rate,
      paymentAmount: selectedOption.payment,
      financingType: currentTransaction.type || 'Equipment Financing',
      closingConditions: [
        'Subject to satisfactory credit review',
        'Subject to equipment inspection',
        'Subject to receipt of all required documentation',
      ],
    };
  }, [currentTransaction, selectedOptionId, dealOptions]);

  const handleTermSheetComplete = useCallback(
    async (document: TermSheetDocument) => {
      debugLog('general', 'log_statement', 'Term sheet generated:', document)
      setTermSheetDocument(document);
      setTermSheetGenerationStatus('completed');
      setShowTermSheetGenerator(false);
      setRecentlyGeneratedTermSheet(true);

      // Auto-hide the success message after a delay
      setTimeout(() => {
        setRecentlyGeneratedTermSheet(false);
      }, 5000);

      // Mark the document review checklist item as completed
      completeChecklist('doc-review');

      // Mark the deal as approved and other checklist items as complete
      completeChecklist('risk-assessment');
      completeChecklist('approval');

      // Publish term sheet generated event
      await dealStructuringEvents.generateTermSheet({
        transactionId: currentTransaction?.id || `TX-${Date.now()}`,
        termSheet: document,
        status: 'generated'
      });

      // Publish FileLock event for the generated term sheet
      await fileLockEvents.uploadDocument({
        documentId: document.id,
        documentName: `Term_Sheet_${currentTransaction?.id || Date.now()}.pdf`,
        documentType: 'term_sheet',
        action: 'uploaded',
        transactionId: currentTransaction?.id,
        applicationId: applicationId || undefined
      });

      // Advance the workflow to the document_execution stage if the current transaction exists
      if (currentTransaction) {
        try {
          const selectedOption = dealOptions.find(opt => opt.id === selectedOptionId);
          if (!selectedOption) throw new Error('Selected option not found');
          // Prepare the transaction for execution
          const updatedTransaction = {
            ...currentTransaction,
            approvedDeal: {
              optionId: selectedOptionId,
              approvedAt: new Date().toISOString(),
              approvedBy: 'System',
              status: 'approved',
              termSheetDocumentId: document.id,
              term: selectedOption.term,
              rate: selectedOption.rate,
              payment: selectedOption.payment,
              downPayment: selectedOption.downPayment,
              covenants: [],
            },
            // Advance to the document_execution stage
            currentStage: 'document_execution' as WorkflowStage,
          };

          // Update the transaction
          await updateTransaction?.(updatedTransaction);
          
          debugLog('general', 'log_statement', 'Transaction advanced to document_execution stage');
          
          // Publish deal approved event
          await dealStructuringEvents.approveDeal({
            transactionId: currentTransaction.id,
            selectedOption: selectedOption,
            status: 'approved'
          });

        } catch (err) {
          console.error('Error updating transaction for execution:', err);
          setLoadError('Failed to update transaction');
        } finally {
          setLoading(false);
        }
      }
    },
    [completeChecklist, currentTransaction, selectedOptionId, updateTransaction, dealOptions, applicationId, publish]
  );

  const handleViewDocumentStatus = useCallback(() => {
    setShowDocumentStatus(true);
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state that caused the error
        setLoadError(null);
        setLoading(true);
        generateDealOptions();
      }}
    >
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Deal Structure Options</h1>
            <button
              onClick={() => {
                // Navigate to the Smart Match page instead of toggling the tool
                navigate('/deal-structuring/smart-match');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Smart Match
            </button>
          </div>

          {requestSubmitted && (
            <ConfirmationMessage
              title="Custom Request Submitted"
              message="Your custom financing terms request has been submitted. A financing specialist will review your request and contact you shortly."
              onClose={() => setRequestSubmitted(false)}
            />
          )}

          {recentlyGeneratedTermSheet && (
            <ConfirmationMessage
              title="Term Sheet Generated"
              message="Your term sheet has been generated successfully. You can view and download it from the document center."
              onClose={() => setRecentlyGeneratedTermSheet(false)}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Suspense
                fallback={
                  loading ? (
                    <SharedLoadingSpinner message="Loading financing options..." />
                  ) : (
                    <DealOptionsSkeleton />
                  )
                }
              >
                {showCustomRequestForm ? (
                  <CustomRequestForm
                    customRequest={customRequest}
                    onChange={handleCustomRequestChange}
                    onSubmit={submitCustomRequest}
                    onCancel={() => setShowCustomRequestForm(false)}
                  />
                ) : (
                  <DealOptionsSelector
                    dealOptions={dealOptions}
                    selectedOptionId={selectedOptionId}
                    onSelectOption={setSelectedOptionId}
                    onCustomRequest={() => setShowCustomRequestForm(true)}
                    isLoading={loading}
                    loadError={loadError}
                    onRetry={() => {
                      setLoading(true);
                      generateDealOptions();
                    }}
                  />
                )}
              </Suspense>

              <div className="mt-6">
                <ActionButtons
                  primaryText="Generate Term Sheet"
                  primaryAction={handleGenerateTermSheet}
                  primaryDisabled={!selectedOptionId}
                  secondaryText="View Document Status"
                  secondaryAction={handleViewDocumentStatus}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              {showSmartMatchTool ? (
                <Suspense fallback={<SmartMatchSkeleton />}>
                  <SmartMatchEngine
                    userRole={
                      (userRole as 'borrower' | 'lender' | 'broker' | 'vendor' | 'admin') ||
                      'borrower'
                    }
                    onMatchSelected={handleSmartMatchSelect}
                  />
                </Suspense>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Enhanced Smart Match</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Use our AI-powered Smart Match Engine with RiskLab integration to find the
                    perfect financing structure with 4-action workflow for optimal deal processing.
                  </p>
                  <button
                    onClick={() => setShowSmartMatchTool(true)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Open Smart Match Engine
                  </button>
                </div>
              )}

              <div className="mt-4">
                <ProgressChecklist items={checklist} onComplete={completeChecklist} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Term Sheet Generator */}
      {showTermSheetGenerator && (
        <TermSheetGenerator
          isOpen={showTermSheetGenerator}
          termSheetData={prepareTermSheetData()}
          onComplete={handleTermSheetComplete}
          onClose={() => setShowTermSheetGenerator(false)}
        />
      )}

      {/* Document Status Viewer */}
      {showDocumentStatus && (
        <DocumentStatusViewer
          documentId={termSheetDocument?.id || 'default-doc'}
          onClose={() => setShowDocumentStatus(false)}
        />
      )}
    </ErrorBoundary>
  );
};

export default DealStructuring;
