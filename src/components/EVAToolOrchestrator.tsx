import React, { useState, useEffect, useCallback } from 'react';
import { Tool, ToolCategory, FinancialRole } from './EVAToolManager';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  ArrowRightIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export interface WorkflowStep {
  id: string;
  toolId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  dependencies?: string[];
  timeout?: number;
  retryCount?: number;
  startTime?: Date;
  endTime?: Date;
  errorMessage?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  role: FinancialRole;
  steps: WorkflowStep[];
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  successRate?: number;
}

export type WorkflowCategory = 
  | 'loan_processing'
  | 'risk_assessment' 
  | 'portfolio_management'
  | 'compliance_check'
  | 'customer_onboarding'
  | 'decision_pipeline'
  | 'monitoring_suite';

interface EVAToolOrchestratorProps {
  tools: Tool[];
  onWorkflowComplete: (workflow: Workflow, results: any) => void;
  onToolExecute: (toolId: string, inputs: any) => Promise<any>;
}

const EVAToolOrchestrator: React.FC<EVAToolOrchestratorProps> = ({
  tools,
  onWorkflowComplete,
  onToolExecute
}) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [workflowResults, setWorkflowResults] = useState<Record<string, any>>({});

  // Pre-defined workflow templates
  const workflowTemplates: Workflow[] = [
    {
      id: 'complete_loan_process',
      name: 'Complete Loan Processing Pipeline',
      description: 'End-to-end loan processing from application to decision',
      category: 'loan_processing',
      role: 'universal',
      status: 'draft',
      priority: 'critical',
      createdAt: new Date(),
      estimatedDuration: 15000, // 15 seconds
      steps: [
        {
          id: 'step_1',
          toolId: 'loan_origination',
          name: 'Initial Application Processing',
          status: 'pending',
          inputs: { applicationType: 'mortgage' }
        },
        {
          id: 'step_2', 
          toolId: 'document_verification',
          name: 'Document Authentication',
          status: 'pending',
          dependencies: ['step_1']
        },
        {
          id: 'step_3',
          toolId: 'credit_analysis',
          name: 'Credit Score Analysis',
          status: 'pending',
          dependencies: ['step_1']
        },
        {
          id: 'step_4',
          toolId: 'income_verification',
          name: 'Income Verification',
          status: 'pending',
          dependencies: ['step_2']
        },
        {
          id: 'step_5',
          toolId: 'automated_underwriting',
          name: 'Final Underwriting Decision',
          status: 'pending',
          dependencies: ['step_3', 'step_4']
        }
      ]
    },
    {
      id: 'risk_assessment_suite',
      name: 'Comprehensive Risk Assessment',
      description: 'Multi-layered risk analysis for portfolio management',
      category: 'risk_assessment',
      role: 'risk_analyst',
      status: 'draft',
      priority: 'high',
      createdAt: new Date(),
      estimatedDuration: 10000,
      steps: [
        {
          id: 'step_1',
          toolId: 'real_time_monitoring',
          name: 'Current Risk Scan',
          status: 'pending'
        },
        {
          id: 'step_2',
          toolId: 'stress_testing',
          name: 'Stress Test Analysis',
          status: 'pending',
          dependencies: ['step_1']
        },
        {
          id: 'step_3',
          toolId: 'predictive_analytics',
          name: 'Predictive Risk Modeling',
          status: 'pending',
          dependencies: ['step_1']
        },
        {
          id: 'step_4',
          toolId: 'decision_engine',
          name: 'Risk Mitigation Recommendations',
          status: 'pending',
          dependencies: ['step_2', 'step_3']
        }
      ]
    },
    {
      id: 'portfolio_optimization',
      name: 'Portfolio Optimization Workflow',
      description: 'Automated portfolio analysis and rebalancing',
      category: 'portfolio_management',
      role: 'portfolio_manager',
      status: 'draft',
      priority: 'high',
      createdAt: new Date(),
      estimatedDuration: 12000,
      steps: [
        {
          id: 'step_1',
          toolId: 'portfolio_analytics',
          name: 'Current Performance Analysis',
          status: 'pending'
        },
        {
          id: 'step_2',
          toolId: 'risk_modeling',
          name: 'Risk-Return Optimization',
          status: 'pending',
          dependencies: ['step_1']
        },
        {
          id: 'step_3',
          toolId: 'market_intelligence',
          name: 'Market Conditions Analysis',
          status: 'pending'
        },
        {
          id: 'step_4',
          toolId: 'rebalancing_engine',
          name: 'Execute Rebalancing',
          status: 'pending',
          dependencies: ['step_2', 'step_3']
        }
      ]
    },
    {
      id: 'compliance_audit',
      name: 'Regulatory Compliance Audit',
      description: 'Comprehensive compliance check and reporting',
      category: 'compliance_check',
      role: 'compliance_officer',
      status: 'draft',
      priority: 'critical',
      createdAt: new Date(),
      estimatedDuration: 8000,
      steps: [
        {
          id: 'step_1',
          toolId: 'compliance_scanner',
          name: 'Regulatory Scan',
          status: 'pending'
        },
        {
          id: 'step_2',
          toolId: 'document_verification',
          name: 'Documentation Review',
          status: 'pending',
          dependencies: ['step_1']
        },
        {
          id: 'step_3',
          toolId: 'decision_engine',
          name: 'Compliance Assessment',
          status: 'pending',
          dependencies: ['step_1', 'step_2']
        }
      ]
    }
  ];

  useEffect(() => {
    setWorkflows(workflowTemplates);
  }, []);

  // Execute workflow step by step
  const executeWorkflow = useCallback(async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    setActiveWorkflow(workflowId);
    
    // Update workflow status
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, status: 'active' }
        : w
    ));

    try {
      const results: Record<string, any> = {};
      const completedSteps = new Set<string>();

      // Execute steps in dependency order
      while (completedSteps.size < workflow.steps.length) {
        const readySteps = workflow.steps.filter(step => 
          step.status === 'pending' &&
          (!step.dependencies || step.dependencies.every(dep => completedSteps.has(dep)))
        );

        if (readySteps.length === 0) {
          // Check for circular dependencies or failed prerequisites
          const pendingSteps = workflow.steps.filter(step => step.status === 'pending');
          if (pendingSteps.length > 0) {
            throw new Error('Workflow execution blocked - check dependencies');
          }
          break;
        }

        // Execute ready steps in parallel
        await Promise.all(readySteps.map(async (step) => {
          try {
            // Update step status to running
            setWorkflows(prev => prev.map(w => 
              w.id === workflowId 
                ? {
                    ...w,
                    steps: w.steps.map(s =>
                      s.id === step.id
                        ? { ...s, status: 'running', startTime: new Date() }
                        : s
                    )
                  }
                : w
            ));

            // Execute the tool
            const tool = tools.find(t => t.id === step.toolId);
            if (!tool) {
              throw new Error(`Tool ${step.toolId} not found`);
            }

            // Prepare inputs (including outputs from previous steps)
            const inputs = {
              ...step.inputs,
              ...Object.fromEntries(
                (step.dependencies || []).map(depId => [
                  depId,
                  results[depId]
                ])
              )
            };

            const result = await onToolExecute(step.toolId, inputs);
            results[step.id] = result;

            // Update step status to completed
            setWorkflows(prev => prev.map(w => 
              w.id === workflowId 
                ? {
                    ...w,
                    steps: w.steps.map(s =>
                      s.id === step.id
                        ? { 
                            ...s, 
                            status: 'completed', 
                            endTime: new Date(),
                            outputs: result 
                          }
                        : s
                    )
                  }
                : w
            ));

            completedSteps.add(step.id);

          } catch (error) {
            // Update step status to failed
            setWorkflows(prev => prev.map(w => 
              w.id === workflowId 
                ? {
                    ...w,
                    steps: w.steps.map(s =>
                      s.id === step.id
                        ? { 
                            ...s, 
                            status: 'failed', 
                            endTime: new Date(),
                            errorMessage: error instanceof Error ? error.message : 'Unknown error'
                          }
                        : s
                    )
                  }
                : w
            ));
            throw error;
          }
        }));
      }

      // Mark workflow as completed
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'completed' }
          : w
      ));

      setWorkflowResults(prev => ({ ...prev, [workflowId]: results }));
      onWorkflowComplete(workflow, results);

    } catch (error) {
      // Mark workflow as failed
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'failed' }
          : w
      ));
    } finally {
      setActiveWorkflow(null);
    }
  }, [workflows, tools, onToolExecute, onWorkflowComplete]);

  const pauseWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, status: 'paused' }
        : w
    ));
    setActiveWorkflow(null);
  };

  const resetWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? {
            ...w,
            status: 'draft',
            steps: w.steps.map(s => ({
              ...s,
              status: 'pending',
              outputs: undefined,
              errorMessage: undefined,
              startTime: undefined,
              endTime: undefined
            }))
          }
        : w
    ));
  };

  const getStepStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4 text-gray-500" />;
      case 'running': return <Cog6ToothIcon className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed': return <ExclamationCircleIcon className="h-4 w-4 text-red-500" />;
      case 'skipped': return <ArrowRightIcon className="h-4 w-4 text-yellow-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getWorkflowStatusColor = (status: Workflow['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">EVA Tool Orchestrator</h2>
            <p className="text-sm text-gray-600 mt-1">
              Automated workflows for complex financial operations
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              {workflows.filter(w => w.status === 'active').length} Active
            </span>
          </div>
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workflows.map(workflow => (
            <div 
              key={workflow.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
            >
              {/* Workflow Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {workflow.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {workflow.description}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getWorkflowStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                      {workflow.role.replace('_', ' ')}
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {workflow.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-3 mb-4">
                {workflow.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getStepStatusIcon(step.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {step.name}
                        </span>
                        {step.errorMessage && (
                          <span className="text-xs text-red-600 truncate">
                            ({step.errorMessage})
                          </span>
                        )}
                      </div>
                      {step.dependencies && step.dependencies.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Depends on: {step.dependencies.join(', ')}
                        </div>
                      )}
                    </div>
                    {index < workflow.steps.length - 1 && (
                      <ArrowRightIcon className="h-4 w-4 text-gray-300" />
                    )}
                  </div>
                ))}
              </div>

              {/* Workflow Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {workflow.estimatedDuration && (
                    <span>Est. {Math.round(workflow.estimatedDuration / 1000)}s</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {workflow.status === 'draft' || workflow.status === 'paused' || workflow.status === 'failed' ? (
                    <button
                      onClick={() => executeWorkflow(workflow.id)}
                      disabled={activeWorkflow !== null}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <PlayIcon className="h-4 w-4" />
                      <span>Start</span>
                    </button>
                  ) : workflow.status === 'active' ? (
                    <button
                      onClick={() => pauseWorkflow(workflow.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors duration-200"
                    >
                      <PauseIcon className="h-4 w-4" />
                      <span>Pause</span>
                    </button>
                  ) : null}
                  
                  {(workflow.status === 'completed' || workflow.status === 'failed') && (
                    <button
                      onClick={() => resetWorkflow(workflow.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors duration-200"
                    >
                      <StopIcon className="h-4 w-4" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Workflow Results */}
              {workflowResults[workflow.id] && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Results</h4>
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(workflowResults[workflow.id], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EVAToolOrchestrator; 