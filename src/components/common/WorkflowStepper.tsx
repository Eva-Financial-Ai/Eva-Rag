import React from 'react';
import { WorkflowStage } from '../../contexts/WorkflowContext';
import { useUserType } from '../../contexts/UserTypeContext';
import { UserType } from '../../types/UserTypes';

interface WorkflowStep {
  id: number;
  stage: WorkflowStage;
  title: string;
  description: string;
  icon: string;
}

interface WorkflowStepperProps {
  currentStage: WorkflowStage;
  className?: string;
  showOnlyCurrentAndPrevious?: boolean;
}

const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStage,
  className = '',
  showOnlyCurrentAndPrevious = true
}) => {
  const { userType } = useUserType();

  // Define all workflow steps in order
  const allSteps: WorkflowStep[] = [
    {
      id: 1,
      stage: 'application',
      title: 'Application',
      description: 'Submit credit application',
      icon: '📋'
    },
    {
      id: 2,
      stage: 'document_collection',
      title: 'Documents',
      description: 'Upload required documents',
      icon: '📄'
    },
    {
      id: 3,
      stage: 'risk_assessment',
      title: 'Risk Assessment',
      description: 'Evaluate risk profile',
      icon: '📊'
    },
    {
      id: 4,
      stage: 'underwriting',
      title: 'Underwriting',
      description: 'Detailed analysis and review',
      icon: '🔍'
    },
    {
      id: 5,
      stage: 'approval',
      title: 'Initial Review',
      description: 'Preliminary approval review',
      icon: '👁️'
    },
    {
      id: 6,
      stage: 'deal_structuring',
      title: 'Deal Structuring',
      description: 'Structure loan terms',
      icon: '⚖️'
    },
    {
      id: 7,
      stage: 'approval_decision',
      title: 'Approval Decision',
      description: 'Final approval review',
      icon: '✅'
    },
    {
      id: 8,
      stage: 'document_execution',
      title: 'Document Execution',
      description: 'Execute final documents',
      icon: '📝'
    },
    {
      id: 9,
      stage: 'smart_matching_decision',
      title: 'Smart Matching Decision',
      description: 'Make approval/decline decision',
      icon: '🎯'
    },
    {
      id: 10,
      stage: 'closing',
      title: 'Closing',
      description: 'Complete documentation',
      icon: '🏁'
    },
    {
      id: 11,
      stage: 'funding',
      title: 'Funding',
      description: 'Disburse funds',
      icon: '💰'
    },
    {
      id: 12,
      stage: 'post_closing',
      title: 'Post-Closing',
      description: 'Account management',
      icon: '🎉'
    }
  ];

  // Get current step index
  const currentStepIndex = allSteps.findIndex(step => step.stage === currentStage);
  
  // Determine which steps to show
  const getVisibleSteps = () => {
    if (!showOnlyCurrentAndPrevious) {
      return allSteps;
    }

    const visibleSteps: WorkflowStep[] = [];
    
    // Always include previous step (if exists)
    if (currentStepIndex > 0) {
      visibleSteps.push(allSteps[currentStepIndex - 1]);
    }
    
    // Always include current step
    if (currentStepIndex >= 0) {
      visibleSteps.push(allSteps[currentStepIndex]);
    }

    return visibleSteps;
  };

  const visibleSteps = getVisibleSteps();

  // Get step status
  const getStepStatus = (step: WorkflowStep) => {
    const stepIndex = allSteps.findIndex(s => s.stage === step.stage);
    
    if (stepIndex < currentStepIndex) {
      return 'completed';
    } else if (stepIndex === currentStepIndex) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };

  // Get step styling
  const getStepStyling = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          container: 'bg-green-50 border-green-200',
          icon: 'bg-green-500 text-white',
          title: 'text-green-800',
          description: 'text-green-600'
        };
      case 'current':
        return {
          container: 'bg-blue-50 border-blue-300 ring-2 ring-blue-200',
          icon: 'bg-blue-500 text-white',
          title: 'text-blue-800',
          description: 'text-blue-600'
        };
      case 'upcoming':
        return {
          container: 'bg-gray-50 border-gray-200',
          icon: 'bg-gray-400 text-white',
          title: 'text-gray-700',
          description: 'text-gray-500'
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          icon: 'bg-gray-400 text-white',
          title: 'text-gray-700',
          description: 'text-gray-500'
        };
    }
  };

  // Get user-specific step customization
  const getStepCustomization = (step: WorkflowStep) => {
    if (step.stage === 'smart_matching_decision') {
      switch (userType) {
        case UserType.LENDER:
          return {
            title: 'Lending Decision',
            description: 'Make lending decision'
          };
        case UserType.BROKERAGE:
          return {
            title: 'Broker Recommendation',
            description: 'Provide recommendation'
          };
        case UserType.BUSINESS:
          return {
            title: 'Decision Review',
            description: 'Review application decision'
          };
        default:
          return {
            title: step.title,
            description: step.description
          };
      }
    }

    if (step.stage === 'deal_structuring' && (userType === UserType.BUSINESS || userType === UserType.VENDOR)) {
      return {
        title: 'Terms Review',
        description: 'Review proposed terms'
      };
    }

    return {
      title: step.title,
      description: step.description
    };
  };

  if (visibleSteps.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        {visibleSteps.map((step, index) => {
          const status = getStepStatus(step);
          const styling = getStepStyling(status);
          const customization = getStepCustomization(step);

          return (
            <React.Fragment key={step.id}>
              <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 ${styling.container}`}>
                {/* Step Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${styling.icon}`}>
                  {status === 'completed' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-lg">{step.icon}</span>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold ${styling.title}`}>
                    {customization.title}
                  </h3>
                  <p className={`text-xs ${styling.description} mt-1`}>
                    {customization.description}
                  </p>
                  
                  {/* Step Number and Status */}
                  <div className="flex items-center mt-1 space-x-2">
                    <span className={`text-xs font-medium ${styling.title} opacity-75`}>
                      Step {step.id}
                    </span>
                    {status === 'current' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Current
                      </span>
                    )}
                    {status === 'completed' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Connector Arrow (between steps) */}
              {index < visibleSteps.length - 1 && (
                <div className="flex items-center mx-2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            Progress: Step {currentStepIndex + 1} of {allSteps.length}
          </span>
          <span>
            {Math.round(((currentStepIndex + 1) / allSteps.length) * 100)}% Complete
          </span>
        </div>
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${Math.max(10, ((currentStepIndex + 1) / allSteps.length) * 100)}%`
            }}
          />
        </div>
      </div>

      {/* User Type Context */}
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-700">Role:</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {userType === UserType.LENDER ? '🏦 Lender' :
             userType === UserType.BROKERAGE ? '🏢 Broker' :
             userType === UserType.BUSINESS ? '👤 Business' :
             userType === UserType.VENDOR ? '🛠 Vendor' : '📊 User'}
          </span>
        </div>
        
        {currentStage === 'smart_matching_decision' && (
          <p className="text-xs text-gray-600 mt-1">
            {userType === UserType.LENDER || userType === UserType.BROKERAGE
              ? 'Your decision will determine the next workflow stage'
              : 'Waiting for decision from lender/broker'}
          </p>
        )}
      </div>
    </div>
  );
};

export default WorkflowStepper; 