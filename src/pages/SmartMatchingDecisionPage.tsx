import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkflow } from '../contexts/WorkflowContext';
import SmartMatchingDecision, { SmartMatchingDecisionType } from '../components/workflow/SmartMatchingDecision';
import WorkflowStepper from '../components/common/WorkflowStepper';

import { debugLog } from '../utils/auditLogger';

const SmartMatchingDecisionPage: React.FC = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId?: string }>();
  const { currentTransaction, setCurrentTransaction, advanceStage } = useWorkflow();
  const [isLoading, setIsLoading] = useState(true);

  // Get transaction ID from params or current transaction
  const activeTransactionId = transactionId || currentTransaction?.id;

  useEffect(() => {
    // If we have a transaction ID but no current transaction, try to set it
    if (transactionId && !currentTransaction) {
      // In a real app, you'd fetch the transaction by ID
      // For now, we'll just show a loading state
      setIsLoading(false);
    } else if (currentTransaction) {
      setIsLoading(false);
      
      // Ensure we're on the correct stage
      if (currentTransaction.currentStage !== 'smart_matching_decision') {
        advanceStage('smart_matching_decision', currentTransaction.id);
      }
    } else {
      // No transaction available, redirect to applications
      navigate('/applications');
    }
  }, [transactionId, currentTransaction, setCurrentTransaction, advanceStage, navigate]);

  const handleDecisionMade = (decision: SmartMatchingDecisionType) => {
    debugLog('general', 'log_statement', 'Smart matching decision made:', decision)
    
    // The component handles the workflow advancement internally
    // This callback can be used for additional logging or analytics
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Smart Matching Decision</h2>
          <p className="text-gray-600">Please wait while we prepare your decision interface...</p>
        </div>
      </div>
    );
  }

  if (!activeTransactionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Transaction Found</h2>
          <p className="text-gray-600 mb-4">
            No active transaction was found for smart matching decision. Please select a transaction from your applications.
          </p>
          <button
            onClick={() => navigate('/applications')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Smart Matching Decision</h1>
              <p className="text-sm text-gray-600 mt-1">
                Step 9 of 12 - Make your decision on this application
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/applications')}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to Applications
              </button>
              
              {currentTransaction && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Transaction: {currentTransaction.id}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <WorkflowStepper 
          currentStage="smart_matching_decision"
          showOnlyCurrentAndPrevious={true}
          className="mb-6"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <SmartMatchingDecision
          transactionId={activeTransactionId}
          onDecisionMade={handleDecisionMade}
          autoAdvance={true}
        />
      </div>

      {/* Help Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Decision Guidelines</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Hard Approved:</strong> All criteria met, proceed immediately</li>
                <li>• <strong>Soft Approved:</strong> Minor conditions, collect additional info</li>
                <li>• <strong>Hard Decline:</strong> Application not suitable for any products</li>
                <li>• <strong>Soft Decline:</strong> Consider alternative products or terms</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">What Happens Next?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>If Approved:</strong> Moves to Deal Structuring or Closing</li>
                <li>• <strong>If Declined:</strong> Sends notification and archives</li>
                <li>• <strong>User Type:</strong> Routing depends on your role (Lender/Broker)</li>
                <li>• <strong>Notes:</strong> Your comments help with future decisions</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Your decision will automatically advance the workflow to the appropriate next stage based on your user type and the decision made.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartMatchingDecisionPage; 