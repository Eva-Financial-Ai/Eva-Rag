import React, { useState, useEffect } from 'react';
import {
  RAGDataSource,
  ModelAnalysisQuestion,
  OrganizationalGoal,
  PersonalizationSession,
} from '../../types/ragTypes';

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  uploadedDataSources: RAGDataSource[];
  selectedModel: string;
  onComplete: (session: PersonalizationSession) => void;
}

const PersonalizationModal: React.FC<PersonalizationModalProps> = ({
  isOpen,
  onClose,
  agentId,
  agentName,
  uploadedDataSources,
  selectedModel,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<'analyzing' | 'questions' | 'goals' | 'complete'>(
    'analyzing'
  );
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [modelQuestions, setModelQuestions] = useState<ModelAnalysisQuestion[]>([]);
  const [organizationalGoals, setOrganizationalGoals] = useState<OrganizationalGoal[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Simulate model analysis of uploaded data
  useEffect(() => {
    if (isOpen && currentStep === 'analyzing') {
      performModelAnalysis();
    }
  }, [isOpen, currentStep]);

  const performModelAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          generatePersonalizationQuestions();
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const generatePersonalizationQuestions = () => {
    // Generate 6 questions based on uploaded data analysis
    const questions: ModelAnalysisQuestion[] = [
      {
        id: 'q1',
        question: 'What is the primary business use case for this uploaded data?',
        context:
          'Understanding your main objective helps me optimize responses for your specific needs.',
        suggestedAnswer: 'Risk assessment and compliance monitoring',
        userAnswer: '',
        isRequired: true,
      },
      {
        id: 'q2',
        question: 'What types of financial decisions will employees make using this information?',
        context: 'This helps me prioritize the most relevant insights and recommendations.',
        suggestedAnswer: 'Loan approvals, risk ratings, and compliance reviews',
        userAnswer: '',
        isRequired: true,
      },
      {
        id: 'q3',
        question: 'What is the typical experience level of users who will access this data?',
        context: 'I can adjust my explanations and recommendations based on user expertise.',
        suggestedAnswer: 'Mix of senior analysts and junior staff',
        userAnswer: '',
        isRequired: true,
      },
      {
        id: 'q4',
        question: 'What are the most critical compliance requirements for your organization?',
        context: 'This ensures I highlight relevant regulatory considerations in my responses.',
        suggestedAnswer: 'SOX compliance, banking regulations, and audit requirements',
        userAnswer: '',
        isRequired: true,
      },
      {
        id: 'q5',
        question: 'How frequently will this data be referenced in daily operations?',
        context: 'Understanding usage patterns helps me optimize response speed and accuracy.',
        suggestedAnswer: 'Multiple times daily for various financial analyses',
        userAnswer: '',
        isRequired: true,
      },
      {
        id: 'q6',
        question: 'What specific financial metrics or KPIs are most important to your team?',
        context: 'I can emphasize these metrics in my analysis and recommendations.',
        suggestedAnswer: 'Risk ratios, profitability margins, and compliance scores',
        userAnswer: '',
        isRequired: true,
      },
    ];

    setModelQuestions(questions);
    setCurrentStep('questions');
    setIsAnalyzing(false);
  };

  const handleQuestionAnswer = (questionId: string, answer: string) => {
    setModelQuestions(prev =>
      prev.map(q => (q.id === questionId ? { ...q, userAnswer: answer } : q))
    );
  };

  const proceedToGoals = () => {
    // Initialize 6 organizational goals based on answers
    const goals: OrganizationalGoal[] = [
      {
        id: 'goal1',
        title: 'Improve Decision Speed',
        description:
          'Reduce time required to make financial decisions by providing instant access to relevant data',
        priority: 'high',
        category: 'efficiency',
        measurable: true,
        targetMetric: '50% reduction in decision time',
        isActive: true,
      },
      {
        id: 'goal2',
        title: 'Enhance Risk Assessment Accuracy',
        description: 'Improve accuracy of risk evaluations through comprehensive data analysis',
        priority: 'high',
        category: 'accuracy',
        measurable: true,
        targetMetric: '25% improvement in risk prediction accuracy',
        isActive: true,
      },
      {
        id: 'goal3',
        title: 'Ensure Regulatory Compliance',
        description: 'Maintain 100% compliance with financial regulations and audit requirements',
        priority: 'high',
        category: 'compliance',
        measurable: true,
        targetMetric: 'Zero compliance violations',
        isActive: true,
      },
      {
        id: 'goal4',
        title: 'Accelerate Employee Training',
        description:
          'Help new employees learn financial analysis faster through guided recommendations',
        priority: 'medium',
        category: 'training',
        measurable: true,
        targetMetric: '40% reduction in training time',
        isActive: true,
      },
      {
        id: 'goal5',
        title: 'Standardize Analysis Methods',
        description: 'Ensure consistent analytical approaches across all team members',
        priority: 'medium',
        category: 'decision-making',
        measurable: true,
        targetMetric: '90% consistency in analysis methodology',
        isActive: true,
      },
      {
        id: 'goal6',
        title: 'Drive Innovation in Financial Analysis',
        description:
          'Discover new insights and patterns in financial data that were previously hidden',
        priority: 'low',
        category: 'innovation',
        measurable: false,
        targetMetric: 'Monthly discovery of new insights',
        isActive: true,
      },
    ];

    setOrganizationalGoals(goals);
    setCurrentStep('goals');
  };

  const updateGoal = (goalId: string, updates: Partial<OrganizationalGoal>) => {
    setOrganizationalGoals(prev =>
      prev.map(goal => (goal.id === goalId ? { ...goal, ...updates } : goal))
    );
  };

  const completePersonalization = () => {
    const session: PersonalizationSession = {
      sessionId: `session-${Date.now()}`,
      agentId,
      uploadedDataSources,
      modelAnalysisQuestions: modelQuestions,
      organizationalGoals,
      currentStep: 'complete',
      createdAt: new Date(),
      completedAt: new Date(),
      modelInsights: {
        dataTypes: ['Financial Statements', 'Risk Reports', 'Compliance Documents'],
        suggestedUseCases: ['Risk Assessment', 'Compliance Monitoring', 'Financial Analysis'],
        riskFactors: ['Market Volatility', 'Regulatory Changes', 'Credit Risk'],
        complianceRequirements: ['SOX', 'Banking Regulations', 'Audit Requirements'],
      },
    };

    onComplete(session);
  };

  const canProceedFromQuestions = () => {
    return modelQuestions.every(q => !q.isRequired || q.userAnswer.trim().length > 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10200] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🧠 AI Agent Personalization</h2>
              <p className="text-sm text-gray-600 mt-1">
                Agent: {agentName} • Personalizing for your organization
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            <div
              className={`flex items-center space-x-2 ${currentStep === 'analyzing' ? 'text-blue-600' : currentStep === 'questions' || currentStep === 'goals' || currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'analyzing' ? 'bg-blue-100' : currentStep === 'questions' || currentStep === 'goals' || currentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}
              >
                {currentStep === 'analyzing' ? '1' : '✓'}
              </div>
              <span className="text-sm font-medium">Analyzing Data</span>
            </div>

            <div className="w-12 h-px bg-gray-300"></div>

            <div
              className={`flex items-center space-x-2 ${currentStep === 'questions' ? 'text-blue-600' : currentStep === 'goals' || currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'questions' ? 'bg-blue-100' : currentStep === 'goals' || currentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}
              >
                {currentStep === 'questions'
                  ? '2'
                  : currentStep === 'goals' || currentStep === 'complete'
                    ? '✓'
                    : '2'}
              </div>
              <span className="text-sm font-medium">Understanding Use Case</span>
            </div>

            <div className="w-12 h-px bg-gray-300"></div>

            <div
              className={`flex items-center space-x-2 ${currentStep === 'goals' ? 'text-blue-600' : currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'goals' ? 'bg-blue-100' : currentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}
              >
                {currentStep === 'goals' ? '3' : currentStep === 'complete' ? '✓' : '3'}
              </div>
              <span className="text-sm font-medium">Setting Goals</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Analyzing Data */}
          {currentStep === 'analyzing' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div
                    className={`w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full ${isAnalyzing ? 'animate-spin' : ''}`}
                  ></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Analyzing Your Uploaded Data
                </h3>
                <p className="text-gray-600 mb-6">
                  Our AI model is reading and understanding your documents to provide personalized
                  recommendations...
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-900">Analysis Progress</span>
                  <span className="text-sm text-blue-700">{analysisProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Processing {uploadedDataSources.length} files for optimal performance...
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-1">📄 Documents Indexed</h4>
                  <p className="text-sm text-green-700">
                    {uploadedDataSources.length} files processed
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-900 mb-1">🧠 Knowledge Extracted</h4>
                  <p className="text-sm text-yellow-700">Financial patterns identified</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-1">🎯 Use Cases Detected</h4>
                  <p className="text-sm text-purple-700">Risk analysis, compliance</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Model Questions */}
          {currentStep === 'questions' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  📝 Help Me Understand Your Use Case
                </h3>
                <p className="text-gray-600">
                  I've analyzed your data. Now I need to understand how your team will use this
                  information to provide the best possible assistance.
                </p>
              </div>

              <div className="space-y-4">
                {modelQuestions.map((question, index) => (
                  <div key={question.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{question.question}</h4>
                        <p className="text-sm text-gray-600 mb-3">{question.context}</p>

                        <div className="space-y-2">
                          <textarea
                            value={question.userAnswer}
                            onChange={e => handleQuestionAnswer(question.id, e.target.value)}
                            placeholder={question.suggestedAnswer}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                            rows={2}
                          />
                          {question.suggestedAnswer && (
                            <button
                              onClick={() =>
                                handleQuestionAnswer(question.id, question.suggestedAnswer!)
                              }
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              💡 Use suggested answer
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Organizational Goals */}
          {currentStep === 'goals' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  🎯 Set Your Organizational Goals
                </h3>
                <p className="text-gray-600">
                  Define what success looks like when your employees use this AI agent. These goals
                  will shape how I prioritize and deliver insights.
                </p>
              </div>

              <div className="grid gap-4">
                {organizationalGoals.map((goal, index) => (
                  <div
                    key={goal.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-600">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={goal.title}
                            onChange={e => updateGoal(goal.id, { title: e.target.value })}
                            className="w-full font-medium text-gray-900 bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                          />
                          <textarea
                            value={goal.description}
                            onChange={e => updateGoal(goal.id, { description: e.target.value })}
                            className="w-full text-sm text-gray-600 bg-transparent border-none p-0 mt-1 focus:outline-none focus:ring-0 resize-none"
                            rows={2}
                          />

                          <div className="flex items-center space-x-4 mt-3">
                            <select
                              value={goal.priority}
                              onChange={e =>
                                updateGoal(goal.id, {
                                  priority: e.target.value as 'high' | 'medium' | 'low',
                                })
                              }
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="high">High Priority</option>
                              <option value="medium">Medium Priority</option>
                              <option value="low">Low Priority</option>
                            </select>

                            <select
                              value={goal.category}
                              onChange={e =>
                                updateGoal(goal.id, { category: e.target.value as any })
                              }
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="efficiency">Efficiency</option>
                              <option value="accuracy">Accuracy</option>
                              <option value="compliance">Compliance</option>
                              <option value="innovation">Innovation</option>
                              <option value="training">Training</option>
                              <option value="decision-making">Decision Making</option>
                            </select>

                            <label className="flex items-center space-x-1 text-xs">
                              <input
                                type="checkbox"
                                checked={goal.measurable}
                                onChange={e =>
                                  updateGoal(goal.id, { measurable: e.target.checked })
                                }
                                className="w-3 h-3"
                              />
                              <span>Measurable</span>
                            </label>
                          </div>

                          {goal.measurable && (
                            <input
                              type="text"
                              value={goal.targetMetric || ''}
                              onChange={e => updateGoal(goal.id, { targetMetric: e.target.value })}
                              placeholder="Target metric (e.g., 25% improvement)"
                              className="w-full text-xs text-gray-600 border border-gray-300 rounded px-2 py-1 mt-2"
                            />
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => updateGoal(goal.id, { isActive: !goal.isActive })}
                        className={`ml-2 p-1 rounded ${goal.isActive ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {goal.isActive ? '✅' : '⭕'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {currentStep === 'analyzing' && 'Analyzing your uploaded documents...'}
              {currentStep === 'questions' &&
                `${modelQuestions.filter(q => q.userAnswer.trim().length > 0).length} of ${modelQuestions.length} questions answered`}
              {currentStep === 'goals' &&
                `${organizationalGoals.filter(g => g.isActive).length} active goals configured`}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              {currentStep === 'questions' && (
                <button
                  onClick={proceedToGoals}
                  disabled={!canProceedFromQuestions()}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    canProceedFromQuestions()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Set Organizational Goals
                </button>
              )}
              {currentStep === 'goals' && (
                <button
                  onClick={completePersonalization}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Complete Personalization
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationModal;
