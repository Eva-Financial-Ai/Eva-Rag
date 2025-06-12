import {
  CheckCircleIcon,
  CloudArrowUpIcon,
  DocumentMagnifyingGlassIcon,
  ExclamationTriangleIcon,
  MicrophoneIcon,
  PlayIcon,
  SpeakerWaveIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEVACustomerContext } from '../contexts/EVACustomerContext';
import { cloudStorageService, UploadResult } from '../services/CloudStorageService';
import {
  ConversationAnalysis,
  conversationIntelligenceService,
  ConversationMessage,
  SuggestedAction,
} from '../services/ConversationIntelligenceService';
import { SpeechRecognitionResult, speechService } from '../services/SpeechService';
import {
  workflowAutomationService,
  WorkflowExecutionResult,
} from '../services/WorkflowAutomationService';

interface EnhancedEVAProps {
  customerId?: string;
  initialMessage?: string;
  onWorkflowExecuted?: (result: WorkflowExecutionResult) => void;
  onFileUploaded?: (result: UploadResult[]) => void;
}

export function EnhancedEVAWithIntelligence({
  customerId,
  initialMessage,
  onWorkflowExecuted,
  onFileUploaded,
}: EnhancedEVAProps) {
  const { selectedCustomer, availableDocuments } = useEVACustomerContext();

  // Conversation state
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [analysis, setAnalysis] = useState<ConversationAnalysis | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);

  // Input and interaction state
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // File upload state
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Workflow execution state
  const [executingWorkflows, setExecutingWorkflows] = useState<{ [key: string]: boolean }>({});
  const [workflowResults, setWorkflowResults] = useState<{
    [key: string]: WorkflowExecutionResult;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (selectedCustomer && messages.length === 0) {
      const welcomeMessage: ConversationMessage = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content:
          initialMessage ||
          `Hello! I'm EVA, your intelligent financial assistant. I'm here to help you with ${selectedCustomer.businessName}. How can I assist you today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [selectedCustomer, messages.length, initialMessage]);

  // Analyze conversation after each message
  useEffect(() => {
    if (messages.length >= 1 && selectedCustomer) {
      const newAnalysis = conversationIntelligenceService.analyzeConversation(
        messages,
        selectedCustomer,
        availableDocuments,
      );
      setAnalysis(newAnalysis);

      // Generate contextual prompts after 3 messages
      if (messages.length > 3) {
        const prompts = conversationIntelligenceService.generateContextualPrompts(
          newAnalysis,
          selectedCustomer,
        );
        setSuggestedPrompts(prompts);
      }
    }
  }, [messages, selectedCustomer, availableDocuments]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle text input
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response (replace with actual EVA integration)
    setTimeout(() => {
      const assistantMessage: ConversationMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `I understand you're asking about "${inputMessage}". Let me help you with that based on the current context for ${selectedCustomer?.businessName || 'this customer'}.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  }, [inputMessage, isLoading, selectedCustomer]);

  // Speech recognition handlers
  const handleStartListening = useCallback(() => {
    const success = speechService.startListening({
      onResult: (result: SpeechRecognitionResult) => {
        if (result.isFinal) {
          setInputMessage(result.transcript);
        }
      },
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onError: error => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
      },
    });

    if (!success) {
      alert('Speech recognition is not supported in this browser');
    }
  }, []);

  const handleStopListening = useCallback(() => {
    speechService.stopListening();
    setIsListening(false);
  }, []);

  // Text-to-speech handlers
  const handleSpeak = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);
      await speechService.speak(text, { rate: 0.9, language: 'en-US' });
    } catch (error) {
      console.error('Speech synthesis error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const handleStopSpeaking = useCallback(() => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  // File upload handlers
  const handleFileUpload = useCallback(
    async (files: FileList) => {
      if (!selectedCustomer) return;

      const uploadPromises = Array.from(files).map(async file => {
        const uploadId = `upload-${Date.now()}-${Math.random()}`;
        setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));

        try {
          // Determine document type based on file name
          const documentType = determineDocumentType(file.name);

          const results = await cloudStorageService.uploadFinancialDocument(
            file,
            documentType,
            selectedCustomer.id,
          );

          setUploadProgress(prev => ({ ...prev, [uploadId]: 100 }));
          onFileUploaded?.(results);

          // Add message about successful upload
          const uploadMessage: ConversationMessage = {
            id: `upload-${Date.now()}`,
            role: 'assistant',
            content: `Successfully uploaded ${file.name} to secure storage. The document has been processed and is now available for analysis.`,
            timestamp: new Date(),
            metadata: {
              documentTypes: [documentType],
              actions: ['FILE_UPLOAD'],
            },
          };
          setMessages(prev => [...prev, uploadMessage]);

          return results;
        } catch (error) {
          console.error('Upload error:', error);
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[uploadId];
            return newProgress;
          });
          return null;
        }
      });

      await Promise.all(uploadPromises);
    },
    [selectedCustomer, onFileUploaded],
  );

  // Workflow execution handlers
  const handleExecuteWorkflow = useCallback(
    async (action: SuggestedAction) => {
      if (!selectedCustomer) return;

      const workflowId = action.id;
      setExecutingWorkflows(prev => ({ ...prev, [workflowId]: true }));

      try {
        // Convert CustomerProfile to Customer type for service compatibility
        const customerForWorkflow = {
          ...selectedCustomer,
          businessName: selectedCustomer.display_name,
          type: 'borrower' as 'borrower' | 'lender' | 'broker' | 'vendor', // Map to expected type
        };

        const result = await workflowAutomationService.executeWorkflow(action, customerForWorkflow);

        setWorkflowResults(prev => ({ ...prev, [workflowId]: result }));
        onWorkflowExecuted?.(result);

        // Add workflow result message
        const workflowMessage: ConversationMessage = {
          id: `workflow-${Date.now()}`,
          role: 'assistant',
          content: result.success
            ? `✅ ${result.message}\n\nNext steps:\n${result.nextSteps?.map(step => `• ${step}`).join('\n') || 'No additional steps required.'}`
            : `❌ Workflow failed: ${result.error || result.message}`,
          timestamp: new Date(),
          metadata: {
            actions: [action.action],
          },
        };
        setMessages(prev => [...prev, workflowMessage]);
      } catch (error) {
        console.error('Workflow execution error:', error);
        const errorMessage: ConversationMessage = {
          id: `workflow-error-${Date.now()}`,
          role: 'assistant',
          content: `❌ Failed to execute ${action.title}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setExecutingWorkflows(prev => ({ ...prev, [workflowId]: false }));
      }
    },
    [selectedCustomer, onWorkflowExecuted],
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files);
      }
    },
    [handleFileUpload],
  );

  // Utility functions
  const determineDocumentType = (
    fileName: string,
  ):
    | 'credit_application'
    | 'bank_statements'
    | 'financial_statements'
    | 'tax_returns'
    | 'audit_report' => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('credit') || lowerName.includes('application'))
      return 'credit_application';
    if (lowerName.includes('bank') || lowerName.includes('statement')) return 'bank_statements';
    if (
      lowerName.includes('financial') ||
      lowerName.includes('balance') ||
      lowerName.includes('income')
    )
      return 'financial_statements';
    if (lowerName.includes('tax') || lowerName.includes('1120') || lowerName.includes('1065'))
      return 'tax_returns';
    if (lowerName.includes('audit')) return 'audit_report';
    return 'financial_statements'; // Default
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!selectedCustomer) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        <div className="text-center">
          <DocumentMagnifyingGlassIcon className="text-gray-300 mx-auto mb-4 h-12 w-12" />
          <p>Please select a customer to start a conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col">
      {/* Header with customer info and analysis */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              EVA - {selectedCustomer.businessName}
            </h2>
            <p className="text-sm text-gray-500">Intelligent Financial Assistant</p>
          </div>

          {analysis && (
            <div className="flex items-center space-x-4">
              <div
                className={`rounded-full px-3 py-1 text-xs font-medium ${getRiskLevelColor(analysis.riskLevel)}`}
              >
                Risk: {analysis.riskLevel.toUpperCase()}
              </div>
              <div className="text-xs text-gray-500">
                {analysis.customerDataCompleteness}% Complete
              </div>
              <div className="text-xs text-gray-500">Phase: {analysis.phase}</div>
            </div>
          )}
        </div>

        {/* Urgent items */}
        {analysis?.urgentItems && analysis.urgentItems.length > 0 && (
          <div className="bg-red-50 mt-3 rounded-md border border-red-200 p-3">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">Urgent Items:</span>
            </div>
            <ul className="mt-1 text-sm text-red-700">
              {analysis.urgentItems.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main conversation area */}
        <div className="flex flex-1 flex-col">
          {/* Messages */}
          <div
            className={`flex-1 space-y-4 overflow-y-auto p-4 ${isDragOver ? 'border-2 border-dashed border-blue-300 bg-blue-50' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg px-4 py-3 ${
                    message.role === 'user' ? 'text-white bg-blue-600' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.role === 'assistant' && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs opacity-75">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => handleSpeak(message.content)}
                        disabled={isSpeaking}
                        className="ml-2 rounded p-1 hover:bg-gray-200 disabled:opacity-50"
                        title="Read aloud"
                      >
                        {isSpeaking ? (
                          <StopIcon className="h-4 w-4" />
                        ) : (
                          <SpeakerWaveIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">EVA is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested prompts (shown after 3 messages) */}
          {suggestedPrompts.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 p-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700">Suggested next questions:</h4>
              <div className="space-y-2">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(prompt)}
                    className="bg-white block w-full rounded-md border border-gray-200 p-2 text-left text-sm transition-colors hover:bg-gray-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask EVA anything about this customer..."
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                {inputMessage && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 transform">
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading}
                      className="p-1 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      <PlayIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Speech controls */}
              <button
                onClick={isListening ? handleStopListening : handleStartListening}
                className={`rounded-md p-2 transition-colors ${
                  isListening
                    ? 'text-white bg-red-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                <MicrophoneIcon className="h-5 w-5" />
              </button>

              {/* File upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-200 rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-300"
                title="Upload documents"
              >
                <CloudArrowUpIcon className="h-5 w-5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                onChange={e => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Upload progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="mt-2 space-y-1">
                {Object.entries(uploadProgress).map(([id, progress]) => (
                  <div key={id} className="flex items-center space-x-2">
                    <div className="bg-gray-200 h-2 flex-1 rounded-full">
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{progress}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar with suggested actions */}
        {analysis?.suggestedNextActions && analysis.suggestedNextActions.length > 0 && (
          <div className="bg-gray-50 w-80 overflow-y-auto border-l border-gray-200 p-4">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Suggested Actions</h3>

            <div className="space-y-3">
              {analysis.suggestedNextActions.map(action => (
                <div
                  key={action.id}
                  className={`bg-white rounded-lg border p-4 ${getPriorityColor(action.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{action.icon}</span>
                        <h4 className="font-medium">{action.title}</h4>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{action.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>⏱️ {action.estimatedTime}</span>
                        <span>🏷️ {action.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {action.requiresApproval && (
                        <span className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-800">
                          Requires Approval
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleExecuteWorkflow(action)}
                      disabled={executingWorkflows[action.id]}
                      className="text-white rounded bg-blue-600 px-3 py-1 text-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {executingWorkflows[action.id] ? (
                        <div className="flex items-center space-x-1">
                          <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-white"></div>
                          <span>Running...</span>
                        </div>
                      ) : (
                        'Execute'
                      )}
                    </button>
                  </div>

                  {/* Show workflow results */}
                  {workflowResults[action.id] && (
                    <div
                      className={`mt-3 rounded p-2 text-sm ${
                        workflowResults[action.id].success
                          ? 'border border-green-200 bg-green-50 text-green-800'
                          : 'bg-red-50 border border-red-200 text-red-800'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        {workflowResults[action.id].success ? (
                          <CheckCircleIcon className="h-4 w-4" />
                        ) : (
                          <ExclamationTriangleIcon className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {workflowResults[action.id].success ? 'Completed' : 'Failed'}
                        </span>
                      </div>
                      <p className="mt-1">{workflowResults[action.id].message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedEVAWithIntelligence;
