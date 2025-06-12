import React, { useEffect, useState } from 'react';
import { useEVACustomer } from '../contexts/EVACustomerContext';
import { EVATransactionProvider, useEVATransaction } from '../contexts/EVATransactionContext';
import UnderwritingWorkflowService, {
  WorkflowPrompt,
} from '../services/UnderwritingWorkflowService';
import EnhancedEVAWithIntelligence from './EnhancedEVAWithIntelligence';
import EVACustomerSelector from './EVACustomerSelector';
import EVATransactionSelector from './EVATransactionSelector';

interface EVAWithTransactionContextProps {
  className?: string;
}

// Inner component that has access to transaction context
const EVAWithTransactionContextInner: React.FC<EVAWithTransactionContextProps> = ({
  className = '',
}) => {
  const { selectedCustomer } = useEVACustomer();
  const { selectedTransaction, getTransactionSummary, getTransactionContext } = useEVATransaction();
  const [workflowPrompts, setWorkflowPrompts] = useState<WorkflowPrompt[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessingWorkflow, setIsProcessingWorkflow] = useState(false);

  // Generate workflow prompts when transaction is selected
  useEffect(() => {
    if (selectedTransaction) {
      setIsProcessingWorkflow(true);
      UnderwritingWorkflowService.generateWorkflowPrompts(selectedTransaction)
        .then(prompts => {
          setWorkflowPrompts(prompts);
          setCurrentStep(0);
        })
        .catch(error => {
          console.error('Error generating workflow prompts:', error);
        })
        .finally(() => {
          setIsProcessingWorkflow(false);
        });
    } else {
      setWorkflowPrompts([]);
      setCurrentStep(0);
    }
  }, [selectedTransaction]);

  // Enhanced context for EVA
  const getEnhancedContext = () => {
    const customerContext = selectedCustomer
      ? {
          customer: {
            id: selectedCustomer.id,
            name: selectedCustomer.display_name,
            type: selectedCustomer.type,
            creditScore: selectedCustomer.metadata.credit_score,
            riskLevel: selectedCustomer.metadata.risk_level,
            businessInfo: selectedCustomer.metadata.business_info,
          },
        }
      : {};

    const transactionContext = selectedTransaction
      ? {
          transaction: {
            id: selectedTransaction.id,
            type: selectedTransaction.type,
            amount: selectedTransaction.requestedAmount,
            status: selectedTransaction.status,
            progress: selectedTransaction.progress,
            financialSummary: selectedTransaction.financialSummary,
            alerts: selectedTransaction.alerts,
            riskFactors: selectedTransaction.metadata.risk_factors,
          },
        }
      : {};

    const workflowContext =
      workflowPrompts.length > 0
        ? {
            workflow: {
              currentStep: currentStep + 1,
              totalSteps: workflowPrompts.length,
              currentPrompt: workflowPrompts[currentStep],
              isProcessing: isProcessingWorkflow,
              nextActions: getNextActions(),
            },
          }
        : {};

    return {
      ...customerContext,
      ...transactionContext,
      ...workflowContext,
      contextSummary: getContextSummary(),
    };
  };

  const getNextActions = () => {
    if (!selectedTransaction) {
      return ['Select a customer and transaction to begin underwriting workflow'];
    }

    if (workflowPrompts.length === 0) {
      return ['Generating workflow prompts...'];
    }

    const currentPrompt = workflowPrompts[currentStep];
    if (!currentPrompt) {
      return ['Workflow completed. Review final decision.'];
    }

    return [
      `Execute Step ${currentStep + 1}: ${currentPrompt.title}`,
      currentPrompt.description,
      'Auto-execute available tasks',
      'Review and approve next step',
    ];
  };

  const getContextSummary = () => {
    let summary = 'EVA Financial Assistant Ready\n\n';

    if (selectedCustomer) {
      summary += `📋 Customer: ${selectedCustomer.display_name} (${selectedCustomer.type})\n`;
      summary += `💳 Credit Score: ${selectedCustomer.metadata.credit_score || 'N/A'}\n`;
      summary += `⚠️ Risk Level: ${selectedCustomer.metadata.risk_level || 'N/A'}\n\n`;
    }

    if (selectedTransaction) {
      summary += `💰 Transaction: ${selectedTransaction.id}\n`;
      summary += `📊 Type: ${selectedTransaction.type}\n`;
      summary += `💵 Amount: $${selectedTransaction.requestedAmount.toLocaleString()}\n`;
      summary += `📈 Status: ${selectedTransaction.status}\n`;
      summary += `✅ Progress: ${Math.max(...Object.values(selectedTransaction.progress))}%\n\n`;
    }

    if (workflowPrompts.length > 0) {
      summary += `🔄 Workflow: Step ${currentStep + 1} of ${workflowPrompts.length}\n`;
      summary += `📝 Current: ${workflowPrompts[currentStep]?.title || 'Completed'}\n`;
      summary += `🤖 Automation: ${workflowPrompts[currentStep]?.automationLevel || 'N/A'}\n\n`;
    }

    summary += 'Ready to assist with underwriting, compliance, and decision support.';

    return summary;
  };

  const handleWorkflowStepComplete = () => {
    if (currentStep < workflowPrompts.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className={`grid h-full grid-cols-12 gap-4 ${className}`}>
      {/* Left Side - Selectors */}
      <div className="col-span-3 space-y-4">
        <EVACustomerSelector />
        <EVATransactionSelector />

        {/* Workflow Progress */}
        {workflowPrompts.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-medium text-gray-900">Underwriting Workflow</h3>

            <div className="space-y-2">
              {workflowPrompts.map((prompt, index) => (
                <div
                  key={prompt.id}
                  className={`rounded p-2 text-xs ${
                    index === currentStep
                      ? 'border border-blue-300 bg-blue-100'
                      : index < currentStep
                        ? 'border border-green-300 bg-green-100'
                        : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      Step {index + 1}: {prompt.title}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        index === currentStep
                          ? 'bg-blue-200 text-blue-800'
                          : index < currentStep
                            ? 'bg-green-200 text-green-800'
                            : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index === currentStep ? 'Current' : index < currentStep ? 'Done' : 'Pending'}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-600">{prompt.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-gray-500">{prompt.automationLevel}</span>
                    {index === currentStep && (
                      <button
                        onClick={handleWorkflowStepComplete}
                        className="text-white rounded bg-blue-600 px-2 py-1 text-xs hover:bg-blue-700"
                      >
                        Complete Step
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Side - EVA Chat Interface */}
      <div className="col-span-9">
        <EnhancedEVAWithIntelligence />
      </div>
    </div>
  );
};

// Outer component that provides transaction context
const EVAWithTransactionContext: React.FC<EVAWithTransactionContextProps> = props => {
  const { selectedCustomer } = useEVACustomer();

  return (
    <EVATransactionProvider selectedCustomer={selectedCustomer}>
      <EVAWithTransactionContextInner {...props} />
    </EVATransactionProvider>
  );
};

export default EVAWithTransactionContext;
