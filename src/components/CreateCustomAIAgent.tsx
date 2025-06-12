import React, { useState, useRef } from 'react';
import { FormatType, ToneType, LengthType, DataOption } from './AIAgentCustomizationOptions';

import { debugLog } from '../utils/auditLogger';

interface CustomAIAgentProps {
  isOpen?: boolean;
  onCancel: () => void;
  onSave: (agentConfig: any) => void;
}

interface KnowledgeBaseFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

const CreateCustomAIAgent: React.FC<CustomAIAgentProps> = ({ isOpen = true, onCancel, onSave }) => {
  debugLog('general', 'log_statement', '🎭 CreateCustomAIAgent component rendered with isOpen:', isOpen)

  const [modelName, setModelName] = useState('Test AI');
  const [fullName, setFullName] = useState('');
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  // Updated state for custom models instead of formats
  const [selectedCustomModel, setSelectedCustomModel] = useState('eva-nemotron-70b');
  const [selectedTone, setSelectedTone] = useState<ToneType>('Professional');
  const [selectedLength, setSelectedLength] = useState<LengthType>('Adaptive');
  const [conversationContext, setConversationContext] = useState('shared');
  const [userRole, setUserRole] = useState('lender');
  const [transactionType, setTransactionType] = useState('commercial-lending');

  // RAG Database options
  const [enableRAG, setEnableRAG] = useState(true);
  const [ragDatabases, setRagDatabases] = useState<string[]>([
    'platform-knowledge',
    'regulatory-data',
  ]);

  const [priorityFeatures, setPriorityFeatures] = useState('');
  const [performanceGoals, setPerformanceGoals] = useState('');
  const [knowledgeFiles] = useState<KnowledgeBaseFile[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom model options with internal agent names
  const customModels = [
    {
      id: 'eva-nemotron-70b',
      name: 'EVA Nemotron 70B (Primary)',
      description: 'Our main financial AI model',
    },
    {
      id: 'eva-risk-specialist',
      name: 'EVA Risk Specialist',
      description: 'Specialized for risk assessment',
    },
    {
      id: 'eva-compliance-expert',
      name: 'EVA Compliance Expert',
      description: 'Regulatory and compliance focused',
    },
    {
      id: 'eva-deal-structurer',
      name: 'EVA Deal Structurer',
      description: 'Commercial deal analysis',
    },
    {
      id: 'eva-credit-analyst',
      name: 'EVA Credit Analyst',
      description: 'Credit evaluation and scoring',
    },
    {
      id: 'eva-document-processor',
      name: 'EVA Document Processor',
      description: 'Document analysis and extraction',
    },
    {
      id: 'eva-market-analyst',
      name: 'EVA Market Analyst',
      description: 'Market trends and insights',
    },
  ];

  // RAG Database options for knowledge enrichment
  const ragDatabaseOptions = [
    {
      id: 'platform-knowledge',
      name: 'Platform Knowledge Base',
      description: 'Core EVA platform documentation',
    },
    {
      id: 'regulatory-data',
      name: 'Regulatory Database',
      description: 'Financial regulations and compliance',
    },
    {
      id: 'market-data',
      name: 'Market Intelligence',
      description: 'Real-time market data and trends',
    },
    {
      id: 'customer-insights',
      name: 'Customer Intelligence',
      description: 'Customer behavior and preferences',
    },
    {
      id: 'transaction-history',
      name: 'Transaction Patterns',
      description: 'Historical transaction analysis',
    },
    {
      id: 'risk-models',
      name: 'Risk Assessment Models',
      description: 'Advanced risk calculation models',
    },
    {
      id: 'industry-benchmarks',
      name: 'Industry Benchmarks',
      description: 'Sector-specific performance data',
    },
  ];

  // Dynamic prompts based on context
  const getDynamicPrompts = () => {
    const basePrompts = {
      lender: [
        'Analyze the creditworthiness of this borrower based on financial statements',
        'What are the key risk factors I should consider for this loan application?',
        'Generate a loan pricing recommendation based on market conditions',
        'Review this collateral valuation for accuracy and market alignment',
      ],
      broker: [
        'Help me structure this deal to meet both borrower and lender requirements',
        'What documentation do I need from the borrower for this transaction?',
        'Compare financing options across our lender network for this deal',
        'Generate a borrower presentation summarizing deal highlights',
      ],
      borrower: [
        'What financing options are available for my business expansion?',
        'Help me prepare my financial package for lender presentation',
        'Explain the terms and conditions of this loan proposal',
        'What can I do to improve my chances of loan approval?',
      ],
      vendor: [
        'Analyze the market demand for this equipment type',
        'What financing programs are available for my customers?',
        'Help me create a competitive pricing strategy',
        'Generate a vendor financing proposal template',
      ],
    };

    const contextualPrompts = {
      shared: [
        'Create a cross-departmental summary of this transaction status',
        'Generate a stakeholder update for this deal progression',
        'What approvals are needed from each department for this transaction?',
      ],
      private: [
        'Provide confidential analysis for internal decision making',
        'Generate internal risk assessment notes',
        'What sensitive information should be highlighted for management?',
      ],
    };

    return [
      ...(basePrompts[userRole as keyof typeof basePrompts] || []),
      ...(contextualPrompts[conversationContext as keyof typeof contextualPrompts] || []),
    ];
  };

  // Transaction-specific prompts based on transaction type
  const getTransactionSpecificPrompts = () => {
    const transactionPrompts = {
      'commercial-lending': [
        'Analyze this commercial property for lending suitability',
        'Calculate debt service coverage ratios for this business',
        'Review cash flow projections for loan underwriting',
        'Assess collateral value for commercial loan security',
      ],
      'asset-financing': [
        'Evaluate equipment depreciation schedules for financing',
        'Analyze asset utilization rates and market demand',
        'Calculate residual values for equipment financing',
        'Review vendor financing program terms and conditions',
      ],
      'real-estate': [
        'Perform comparative market analysis for property valuation',
        'Analyze rental income potential and cap rates',
        'Review environmental and title reports for lending',
        'Calculate loan-to-value ratios for real estate financing',
      ],
      'working-capital': [
        'Analyze accounts receivable aging for credit decisions',
        'Review inventory turnover and seasonal patterns',
        'Calculate working capital requirements and projections',
        'Assess cash conversion cycles and liquidity needs',
      ],
      'equipment-leasing': [
        'Evaluate equipment useful life and technology obsolescence',
        'Analyze lease vs. buy scenarios for customer decision',
        'Calculate equipment financing rates and terms',
        'Review maintenance and service agreements for leased assets',
      ],
      'trade-finance': [
        'Analyze letter of credit requirements and documentation',
        'Review international trade documentation for compliance',
        'Calculate foreign exchange exposure and hedging needs',
        'Assess country risk and political considerations',
      ],
    };

    return transactionPrompts[transactionType as keyof typeof transactionPrompts] || [];
  };

  // Data options
  const [dataOptions /* setDataOptions */] = useState<DataOption[]>([
    { id: 'customer-data', name: 'Customer Data', isSelected: false },
    { id: 'financial-data', name: 'Financial Data', isSelected: false },
    { id: 'central-bank-reporting', name: 'Central Bank Reporting', isSelected: false },
    { id: 'legal-compliance-data', name: 'Legal Compliance Data', isSelected: false },
    { id: 'mortgage-data', name: 'Mortgage Data', isSelected: false },
    { id: 'image-document-parsing', name: 'Image/Document Parsing', isSelected: false },
    { id: 'predictive-lead-generation', name: 'Predictive Lead Generation', isSelected: false },
  ]);

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    onCancel();
  };

  const handleCreate = () => {
    const agentConfig = {
      id: `custom-agent-${Date.now()}`,
      name: modelName,
      fullName: fullName || modelName,
      icon: iconPreview,
      customModel: selectedCustomModel,
      tone: selectedTone,
      length: selectedLength,
      conversationContext,
      userRole,
      transactionType,
      enableRAG,
      ragDatabases,
      priorityFeatures,
      performanceGoals,
      dataOptions: dataOptions.filter(option => option.isSelected).map(option => option.id),
      knowledgeBase: knowledgeFiles.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
      })),
      dynamicPrompts: getDynamicPrompts(),
    };

    debugLog('general', 'log_statement', '🚀 Creating custom agent with config:', agentConfig)
    onSave(agentConfig);
  };

  const handleRAGToggle = (dbId: string) => {
    setRagDatabases(prev =>
      prev.includes(dbId) ? prev.filter(id => id !== dbId) : [...prev, dbId]
    );
  };

  const toggleCustomizationOptions = () => {
    setIsExpanded(!isExpanded);
  };

  // Add send handler for chat preview
  const handleSendChat = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, chatInput]);
      setChatInput('');
    }
  };

  if (!isOpen) return null;

  debugLog('general', 'log_statement', '✅ CreateCustomAIAgent is rendering the modal UI')

  return (
    <div className="fixed inset-0 z-[10000] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div
          className="inline-block align-bottom bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-[7.2xl] sm:w-full"
          style={{ width: '95%', maxWidth: '2180px' }}
        >
          <div className="bg-white px-6 pt-6 pb-4 sm:p-8 sm:pb-6">
            {/* Header */}
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-3xl leading-6 font-bold text-gray-900">
                    🤖 Create Custom AI Agent
                  </h3>
                  <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Enhanced Subtitle */}
                <p className="text-gray-600 text-xl mb-8">
                  Configure your specialized AI agent with advanced capabilities and context-aware
                  intelligence.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content - Increased height to 840px (21% larger than 700px) */}
          <div className="flex h-[850px]">
            {/* Left side - Configuration */}
            <div className="w-1/2 p-8 overflow-y-auto border-r border-gray-200">
              {/* Agent Icon & Name - Fixed icon container */}
              <div className="flex flex-col items-center mb-10">
                <div
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center mb-6 overflow-hidden cursor-pointer hover:from-blue-200 hover:to-indigo-300 transition-all duration-300 border-4 border-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {iconPreview ? (
                    <img
                      src={iconPreview}
                      alt="Agent Icon"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-20 h-20 text-indigo-600">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V18C3 19.1 3.9 20 5 20H11V18H5V8H12V3H13.5L19 8.5V9H21ZM12.5 11.5C12.5 10.67 13.17 10 14 10S15.5 10.67 15.5 11.5 14.83 13 14 13 12.5 12.33 12.5 11.5ZM17 16.25C17 14.75 15.25 13.75 14 13.75S11 14.75 11 16.25V17H17V16.25Z" />
                      </svg>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="agent-icon"
                  className="hidden"
                  accept="image/*"
                  onChange={handleIconUpload}
                  ref={fileInputRef}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-base text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  📸 Upload Custom Icon
                </button>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Recommended: 256x256px, PNG or JPG format
                </p>
              </div>

              {/* Agent Name and Full Name - Increased spacing */}
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Agent Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={e => setModelName(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="e.g. Risk Specialist, Deal Analyzer"
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Full Display Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="e.g. Advanced Risk Assessment Specialist"
                  />
                </div>
              </div>

              {/* Context Configuration - Enhanced spacing */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    User Role
                  </label>
                  <select
                    value={userRole}
                    onChange={e => setUserRole(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  >
                    <option value="lender">Lender</option>
                    <option value="broker">Broker</option>
                    <option value="borrower">Borrower</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Conversation Type
                  </label>
                  <select
                    value={conversationContext}
                    onChange={e => setConversationContext(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  >
                    <option value="shared">Shared (Cross-Department)</option>
                    <option value="private">Private (Internal Only)</option>
                  </select>
                </div>
              </div>

              {/* Transaction Type */}
              <div className="mb-8">
                <label className="block text-base font-medium text-gray-700 mb-3">
                  Transaction Context
                </label>
                <select
                  value={transactionType}
                  onChange={e => setTransactionType(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                >
                  <option value="commercial-lending">Commercial Lending</option>
                  <option value="equipment-financing">Equipment Financing</option>
                  <option value="real-estate">Real Estate Financing</option>
                  <option value="working-capital">Working Capital</option>
                  <option value="asset-based-lending">Asset-Based Lending</option>
                  <option value="trade-finance">Trade Finance</option>
                </select>
              </div>

              {/* Expandable Advanced Options - Enhanced */}
              <div className="border-t border-gray-200 pt-8">
                <button
                  onClick={toggleCustomizationOptions}
                  className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <span className="font-medium text-gray-700 text-lg">
                    ⚙️ Advanced Configuration
                  </span>
                  <svg
                    className={`w-6 h-6 text-gray-500 transform transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="space-y-8 mt-8">
                    {/* Custom Model Selection */}
                    <div>
                      <h4 className="text-base font-medium mb-4 text-gray-700">🤖 Base AI Model</h4>
                      <select
                        value={selectedCustomModel}
                        onChange={e => setSelectedCustomModel(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      >
                        {customModels.map(model => (
                          <option key={model.id} value={model.id}>
                            {model.name} - {model.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* RAG Database Configuration */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-medium text-gray-700">
                          🧠 Knowledge Enhancement (RAG)
                        </h4>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={enableRAG}
                            onChange={e => setEnableRAG(e.target.checked)}
                            className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-base text-gray-600">Enable Cloudflare AutoRAG</span>
                        </label>
                      </div>

                      {enableRAG && (
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                          <p className="text-base text-blue-700 mb-4 font-medium">
                            Select knowledge databases to enhance your agent:
                          </p>
                          <div className="grid grid-cols-1 gap-4">
                            {ragDatabaseOptions.map(db => (
                              <label
                                key={db.id}
                                className="flex items-start p-3 hover:bg-blue-100 rounded-lg cursor-pointer border border-blue-200 bg-white"
                              >
                                <input
                                  type="checkbox"
                                  checked={ragDatabases.includes(db.id)}
                                  onChange={() => handleRAGToggle(db.id)}
                                  className="mr-4 mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <div>
                                  <span className="text-base font-medium text-gray-700">
                                    {db.name}
                                  </span>
                                  <p className="text-sm text-gray-600 mt-1">{db.description}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tone and Length Configuration */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-3">
                          Response Tone
                        </label>
                        <select
                          value={selectedTone}
                          onChange={e => setSelectedTone(e.target.value as ToneType)}
                          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                        >
                          <option value="Professional">Professional</option>
                          <option value="Formal">Formal</option>
                          <option value="Casual">Casual</option>
                          <option value="Technical">Technical</option>
                          <option value="Friendly">Friendly</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-3">
                          Response Length
                        </label>
                        <select
                          value={selectedLength}
                          onChange={e => setSelectedLength(e.target.value as LengthType)}
                          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                        >
                          <option value="Concise">Concise</option>
                          <option value="Standard">Standard</option>
                          <option value="Detailed">Detailed</option>
                          <option value="Adaptive">Adaptive</option>
                        </select>
                      </div>
                    </div>

                    {/* Additional Configuration */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-3">
                          Priority Features
                        </label>
                        <textarea
                          value={priorityFeatures}
                          onChange={e => setPriorityFeatures(e.target.value)}
                          rows={4}
                          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                          placeholder="Describe key features this agent should prioritize..."
                        />
                      </div>

                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-3">
                          Performance Goals
                        </label>
                        <textarea
                          value={performanceGoals}
                          onChange={e => setPerformanceGoals(e.target.value)}
                          rows={4}
                          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                          placeholder="Define expected performance metrics and goals..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Preview and Test Chat */}
            <div className="w-1/2 p-8 bg-gray-50">
              <h4 className="text-xl font-semibold text-gray-800 mb-6">📋 Agent Preview</h4>

              {/* Agent Preview Card - Enhanced */}
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center mr-6 overflow-hidden border-3 border-white shadow-lg">
                    {iconPreview ? (
                      <img
                        src={iconPreview}
                        alt="Agent Preview"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 text-indigo-600">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V18C3 19.1 3.9 20 5 20H11V18H5V8H12V3H13.5L19 8.5V9H21ZM12.5 11.5C12.5 10.67 13.17 10 14 10S15.5 10.67 15.5 11.5 14.83 13 14 13 12.5 12.33 12.5 11.5ZM17 16.25C17 14.75 15.25 13.75 14 13.75S11 14.75 11 16.25V17H17V16.25Z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h5 className="text-xl font-semibold text-gray-900">
                      {modelName || 'Your AI Agent'}
                    </h5>
                    <p className="text-base text-gray-600">
                      {fullName || modelName || 'Custom AI Assistant'}
                    </p>
                    <div className="flex items-center mt-3 space-x-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {selectedCustomModel
                          .split('-')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {selectedTone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Context Information */}
                <div className="space-y-3 text-base">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role Context:</span>
                    <span className="font-medium text-gray-900 capitalize">{userRole}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Type:</span>
                    <span className="font-medium text-gray-900">
                      {transactionType
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">RAG Enhanced:</span>
                    <span
                      className={`font-medium ${enableRAG ? 'text-green-600' : 'text-gray-500'}`}
                    >
                      {enableRAG ? `Yes (${ragDatabases.length} databases)` : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Prompts Preview */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h5 className="font-medium text-gray-800 mb-4 text-lg">🎯 Suggested Prompts</h5>
                <div className="space-y-3">
                  {getDynamicPrompts()
                    .slice(0, 4)
                    .map((prompt, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                        <p className="text-base text-gray-700">{prompt}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Enhanced */}
          <div className="bg-gray-50 px-8 py-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-8 py-4 bg-blue-600 text-lg font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={handleCreate}
              disabled={!modelName.trim()}
            >
              ✨ Create Agent
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-8 py-4 bg-white text-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto transition-colors"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomAIAgent;
