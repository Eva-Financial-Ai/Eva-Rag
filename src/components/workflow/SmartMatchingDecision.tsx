import React, { useState, useCallback, useEffect } from 'react';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useUserType } from '../../contexts/UserTypeContext';
import { UserType } from '../../types/UserTypes';
import { useNavigate } from 'react-router-dom';

export type SmartMatchingDecisionType = 'hard_approved' | 'soft_approved' | 'hard_decline' | 'soft_decline';

interface SmartMatchingDecisionProps {
  transactionId: string;
  onDecisionMade?: (decision: SmartMatchingDecisionType) => void;
  autoAdvance?: boolean;
}

interface DecisionOption {
  value: SmartMatchingDecisionType;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  requirements?: string[];
  nextSteps: string[];
}

const SmartMatchingDecision: React.FC<SmartMatchingDecisionProps> = ({
  transactionId,
  onDecisionMade,
  autoAdvance = true
}) => {
  const { currentTransaction, advanceStage } = useWorkflow();
  const { userType } = useUserType();
  const navigate = useNavigate();
  
  const [selectedDecision, setSelectedDecision] = useState<SmartMatchingDecisionType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const decisionOptions: DecisionOption[] = [
    {
      value: 'hard_approved',
      title: 'Hard Approved',
      description: 'Full approval without conditions',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      icon: '✅',
      requirements: ['All criteria met', 'Strong financials', 'Excellent credit profile'],
      nextSteps: ['Proceed to Deal Structuring', 'Generate term sheet', 'Schedule closing']
    },
    {
      value: 'soft_approved',
      title: 'Soft Approved',
      description: 'Approved with conditions or additional requirements',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      icon: '📋',
      requirements: ['Most criteria met', 'Minor conditions required', 'Additional documentation needed'],
      nextSteps: ['Collect additional requirements', 'Review conditions', 'Proceed to Deal Structuring']
    },
    {
      value: 'hard_decline',
      title: 'Hard Decline',
      description: 'Application denied - not suitable for any products',
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      icon: '❌',
      requirements: ['Significant deficiencies', 'Credit issues', 'Risk factors too high'],
      nextSteps: ['Send decline letter', 'Provide feedback', 'Archive application']
    },
    {
      value: 'soft_decline',
      title: 'Soft Decline',
      description: 'Declined for current request - may qualify for alternative products',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      icon: '⚠️',
      requirements: ['Some criteria not met', 'Alternative products available', 'Different terms possible'],
      nextSteps: ['Suggest alternatives', 'Modify terms', 'Resubmit with changes']
    }
  ];

  // Get next stage based on decision and user type
  const getNextStage = useCallback((decision: SmartMatchingDecisionType) => {
    const isApproved = decision === 'hard_approved' || decision === 'soft_approved';
    
    if (isApproved) {
      // For approved applications
      if (userType === UserType.LENDER || userType === UserType.BROKERAGE) {
        return 'deal_structuring';
      } else if (userType === UserType.BUSINESS || userType === UserType.VENDOR) {
        return 'closing';
      }
    } else {
      // For declined applications
      return 'post_closing'; // Move to post-closing to handle decline process
    }
    
    return 'deal_structuring'; // Default fallback
  }, [userType]);

  // Get next page route based on decision and user type
  const getNextRoute = useCallback((decision: SmartMatchingDecisionType) => {
    const isApproved = decision === 'hard_approved' || decision === 'soft_approved';
    
    if (isApproved) {
      if (userType === UserType.LENDER || userType === UserType.BROKERAGE) {
        return '/deal-structuring';
      } else if (userType === UserType.BUSINESS || userType === UserType.VENDOR) {
        return '/closing';
      }
    } else {
      return '/applications'; // Redirect to applications list for declined
    }
    
    return '/deal-structuring'; // Default fallback
  }, [userType]);

  // Handle decision selection
  const handleDecisionSelect = useCallback((decision: SmartMatchingDecisionType) => {
    setSelectedDecision(decision);
    setShowConfirmation(true);
  }, []);

  // Handle decision confirmation
  const handleConfirmDecision = useCallback(async () => {
    if (!selectedDecision || !currentTransaction) return;

    setIsProcessing(true);
    
    try {
      // Update transaction with decision
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const updatedTransaction = {
        ...currentTransaction,
        data: {
          ...currentTransaction.data,
          smartMatchingDecision: {
            decision: selectedDecision,
            decidedAt: new Date().toISOString(),
            decidedBy: userType,
            notes: notes.trim() || undefined,
            transactionId
          }
        }
      };

      // Store decision in localStorage for persistence
      localStorage.setItem(`smart_decision_${transactionId}`, JSON.stringify({
        decision: selectedDecision,
        decidedAt: new Date().toISOString(),
        notes: notes.trim(),
        userType
      }));

      // Advance to next stage
      const nextStage = getNextStage(selectedDecision);
      advanceStage(nextStage, transactionId);

      // Call callback if provided
      if (onDecisionMade) {
        onDecisionMade(selectedDecision);
      }

      // Auto-navigate if enabled
      if (autoAdvance) {
        const nextRoute = getNextRoute(selectedDecision);
        setTimeout(() => {
          navigate(nextRoute);
        }, 2000);
      }

    } catch (error) {
      console.error('Error processing smart matching decision:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedDecision, currentTransaction, userType, notes, transactionId, advanceStage, onDecisionMade, autoAdvance, getNextStage, getNextRoute, navigate]);

  // Load existing decision if available
  useEffect(() => {
    const savedDecision = localStorage.getItem(`smart_decision_${transactionId}`);
    if (savedDecision) {
      try {
        const parsed = JSON.parse(savedDecision);
        setSelectedDecision(parsed.decision);
        setNotes(parsed.notes || '');
      } catch (error) {
        console.error('Error loading saved decision:', error);
      }
    }
  }, [transactionId]);

  // Get user type specific messaging
  const getUserTypeContext = () => {
    switch (userType) {
      case UserType.LENDER:
        return {
          title: 'Lending Decision',
          subtitle: 'Make your lending decision for this application',
          roleNote: 'As a lender, your decision will determine the next steps in the approval process.'
        };
      case UserType.BROKERAGE:
        return {
          title: 'Broker Recommendation',
          subtitle: 'Provide your recommendation for this application',
          roleNote: 'As a broker, your recommendation helps match clients with suitable lenders.'
        };
      case UserType.BUSINESS:
        return {
          title: 'Application Status Update',
          subtitle: 'Review the decision on your application',
          roleNote: 'This decision determines your next steps in the application process.'
        };
      default:
        return {
          title: 'Smart Matching Decision',
          subtitle: 'Make a decision on this application',
          roleNote: 'Your decision will determine the workflow path forward.'
        };
    }
  };

  const contextInfo = getUserTypeContext();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{contextInfo.title}</h1>
        <p className="text-lg text-gray-600 mb-4">{contextInfo.subtitle}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">{contextInfo.roleNote}</p>
        </div>
      </div>

      {/* Transaction Summary */}
      {currentTransaction && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Application Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Applicant:</span>
              <p className="text-gray-900">{currentTransaction.applicantData?.name || 'Unknown'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Amount Requested:</span>
              <p className="text-gray-900">${currentTransaction.amount?.toLocaleString() || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Transaction Type:</span>
              <p className="text-gray-900">{currentTransaction.type || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Decision Options */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Make Your Decision</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {decisionOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDecisionSelect(option.value)}
              disabled={isProcessing}
              className={`p-6 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md ${
                selectedDecision === option.value
                  ? `${option.bgColor} ${option.borderColor} ${option.color} ring-2 ring-offset-2 ring-opacity-50`
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">Typical Requirements:</h4>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1">
                        {option.requirements?.map((req, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">Next Steps:</h4>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1">
                        {option.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Notes Section */}
        <div className="mb-6">
          <label htmlFor="decision-notes" className="block text-sm font-medium text-gray-700 mb-2">
            Decision Notes (Optional)
          </label>
          <textarea
            id="decision-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isProcessing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Add any additional notes or comments about your decision..."
          />
        </div>

        {/* Confirmation */}
        {showConfirmation && selectedDecision && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833-.23 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Confirm Your Decision</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You have selected <strong>{decisionOptions.find(opt => opt.value === selectedDecision)?.title}</strong>.
                  {autoAdvance && ' This will automatically advance the workflow to the next stage.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              setSelectedDecision(null);
              setShowConfirmation(false);
            }}
            disabled={isProcessing || !selectedDecision}
            className="px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset Selection
          </button>
          
          <button
            onClick={handleConfirmDecision}
            disabled={!selectedDecision || isProcessing}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <span>Confirm Decision</span>
            )}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {isProcessing && selectedDecision && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-800">Decision Recorded</h3>
              <p className="text-sm text-green-700 mt-1">
                Your decision has been saved and the workflow is advancing to the next stage...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartMatchingDecision; 