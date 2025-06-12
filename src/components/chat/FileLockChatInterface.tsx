import {
  CloudArrowUpIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';
import { useCustomer as useCustomerContext } from '../../contexts/CustomerContext';

// Mock types to replace deleted backend services
interface SubmissionPackage {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'locked' | 'submitted' | 'reviewed';
  created_at: string;
}

interface SmartMatchingResult {
  id: string;
  match_score: number;
  confidence: number;
  reasoning: string[];
  lender_profile: {
    name: string;
  };
  estimated_terms?: {
    interest_rate: number;
    term_months: number;
  };
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    suggested_files?: Array<{
      id: string;
      filename: string;
      document_type: string;
      relevance_score: number;
      reasoning: string;
    }>;
    submission_package?: SubmissionPackage;
    smart_matching_results?: SmartMatchingResult[];
  };
}

interface SelectedFile {
  id: string;
  filename: string;
  document_type: string;
  selected: boolean;
  relevance_score?: number;
}

interface FileLockChatInterfaceProps {
  onPackageCreated?: (packageData: SubmissionPackage) => void;
  onFilesSelected?: (files: SelectedFile[]) => void;
}

// Mock service functions to replace deleted backend services
const getAISuggestedFiles = async (message: string, customerId: string) => {
  // Mock implementation - replace with actual external API call
  return {
    suggested_files: [
      {
        id: '1',
        filename: 'financial_statement.pdf',
        document_type: 'financial_statement',
        relevance_score: 0.95,
        reasoning: 'High relevance based on loan application context',
      },
    ],
    confidence: 0.8,
  };
};

const createSubmissionPackage = async (packageRequest: any) => {
  // Mock implementation - replace with actual external API call
  return {
    id: 'pkg_' + Date.now(),
    name: packageRequest.name,
    description: packageRequest.description,
    status: 'draft' as const,
    created_at: new Date().toISOString(),
  };
};

const analyzeSmartMatching = async (request: any) => {
  // Mock implementation - replace with actual external API call
  return [
    {
      id: 'match_' + Date.now(),
      match_score: 0.85,
      confidence: 0.9,
      reasoning: ['Strong financial profile', 'Good credit history', 'Appropriate loan amount'],
      lender_profile: {
        name: 'First National Bank',
      },
      estimated_terms: {
        interest_rate: 5.25,
        term_months: 60,
      },
    },
  ];
};

const FileLockChatInterface: React.FC<FileLockChatInterfaceProps> = ({
  onPackageCreated,
  onFilesSelected,
}) => {
  const { activeCustomer } = useCustomerContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<SubmissionPackage[]>([]);
  const [packageName, setPackageName] = useState('');
  const [showPackageCreator, setShowPackageCreator] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeCustomer) {
      initializeChat();
    }
  }, [activeCustomer]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'ai',
      content: `Hello! I'm your AI assistant for creating submission packages. I can help you select the right documents for your loan application. What type of financing are you looking for?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeCustomer) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get AI suggestions for files based on chat context
      const suggestions = await getAISuggestedFiles(inputMessage, activeCustomer.id);

      const aiResponse: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        type: 'ai',
        content: generateAIResponse(inputMessage, suggestions),
        timestamp: new Date(),
        metadata: {
          suggested_files: suggestions.suggested_files,
        },
      };

      setMessages(prev => [...prev, aiResponse]);

      // Update available files for selection
      if (suggestions.suggested_files.length > 0) {
        setShowFileSelector(true);
        // Convert suggestions to SelectedFile format
        const fileSelections = suggestions.suggested_files.map(file => ({
          id: file.id,
          filename: file.filename,
          document_type: file.document_type,
          selected: file.relevance_score > 0.7, // Auto-select high relevance files
          relevance_score: file.relevance_score,
        }));
        setSelectedFiles(fileSelections);
      }
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);

      const errorMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        type: 'ai',
        content:
          'I apologize, but I encountered an error while analyzing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userInput: string, suggestions: any): string => {
    if (suggestions.suggested_files.length === 0) {
      return `I understand you're looking for ${userInput}. However, I don't see any matching documents in your file repository. You may need to upload additional documents before creating a submission package.`;
    }

    const highRelevanceFiles = suggestions.suggested_files.filter(
      (f: any) => f.relevance_score > 0.7,
    );
    const mediumRelevanceFiles = suggestions.suggested_files.filter(
      (f: any) => f.relevance_score >= 0.4 && f.relevance_score <= 0.7,
    );

    let response = `Based on your request for ${userInput}, I've identified ${suggestions.suggested_files.length} relevant documents:\n\n`;

    if (highRelevanceFiles.length > 0) {
      response += `**Highly Recommended:**\n`;
      highRelevanceFiles.forEach((file: any) => {
        response += `• ${file.filename} - ${file.reasoning}\n`;
      });
      response += '\n';
    }

    if (mediumRelevanceFiles.length > 0) {
      response += `**Additional Options:**\n`;
      mediumRelevanceFiles.forEach((file: any) => {
        response += `• ${file.filename} - ${file.reasoning}\n`;
      });
      response += '\n';
    }

    response += `I've pre-selected the most relevant files for you. Review the selections below and click "Create Package" when ready.`;

    return response;
  };

  const handleFileToggle = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.map(file => (file.id === fileId ? { ...file, selected: !file.selected } : file)),
    );
  };

  const handleCreatePackage = async () => {
    if (!activeCustomer || selectedFiles.filter(f => f.selected).length === 0) return;

    setShowPackageCreator(true);
  };

  const submitPackageCreation = async () => {
    if (!packageName.trim() || !activeCustomer) return;

    try {
      setIsLoading(true);

      const selectedFileIds = selectedFiles.filter(file => file.selected).map(file => file.id);

      const packageRequest = {
        name: packageName,
        customer_profile_id: activeCustomer.id,
        file_ids: selectedFileIds,
        description: `AI-assisted submission package created via chat interface`,
      };

      const newPackage = await createSubmissionPackage(packageRequest);

      // Get smart matching results for the package
      const matchingResults = await analyzeSmartMatching({
        customer_profile_id: activeCustomer.id,
        document_ids: selectedFileIds,
      });

      const successMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'system',
        content: `✅ Submission package "${packageName}" created successfully with ${selectedFileIds.length} documents. Found ${matchingResults.length} potential lender matches.`,
        timestamp: new Date(),
        metadata: {
          submission_package: newPackage,
          smart_matching_results: matchingResults,
        },
      };

      setMessages(prev => [...prev, successMessage]);
      setShowPackageCreator(false);
      setPackageName('');
      setSelectedFiles([]);
      setShowFileSelector(false);

      // Notify parent components
      onPackageCreated?.(newPackage);
      onFilesSelected?.(selectedFiles.filter(f => f.selected));
    } catch (error) {
      console.error('Failed to create package:', error);

      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        type: 'system',
        content: '❌ Failed to create submission package. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRelevanceColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-700';
    if (score > 0.7) return 'bg-green-100 text-green-700';
    if (score > 0.4) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const formatRelevanceScore = (score?: number) => {
    if (!score) return 'N/A';
    return `${Math.round(score * 100)}%`;
  };

  if (!activeCustomer) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No Customer Selected</h3>
          <p className="text-gray-500">
            Please select a customer to start creating submission packages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <LockClosedIcon className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">FileLock Assistant</h2>
            <p className="text-sm text-gray-500">Customer: {activeCustomer.display_name}</p>
          </div>
        </div>

        {selectedFiles.filter(f => f.selected).length > 0 && (
          <button
            onClick={handleCreatePackage}
            className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <LockClosedIcon className="h-4 w-4" />
            <span>Create Package ({selectedFiles.filter(f => f.selected).length})</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-lg px-4 py-2 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'system'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-gray-50 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-line">{message.content}</div>

              {/* Show suggested files if available */}
              {message.metadata?.suggested_files && (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <p className="mb-2 text-sm font-medium">Suggested Files:</p>
                  <div className="space-y-2">
                    {message.metadata.suggested_files.map(file => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded border bg-white p-2"
                      >
                        <div className="flex items-center space-x-3">
                          <DocumentIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{file.filename}</p>
                            <p className="text-xs text-gray-500">{file.document_type}</p>
                          </div>
                        </div>
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${getRelevanceColor(file.relevance_score)}`}
                        >
                          {formatRelevanceScore(file.relevance_score)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show smart matching results */}
              {message.metadata?.smart_matching_results && (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <p className="mb-2 text-sm font-medium">
                    Found {message.metadata.smart_matching_results.length} Lender Matches:
                  </p>
                  <div className="space-y-2">
                    {message.metadata.smart_matching_results.slice(0, 3).map(result => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between rounded border bg-white p-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{result.lender_profile.name}</p>
                          <p className="text-xs text-gray-500">
                            {result.estimated_terms?.interest_rate}% •{' '}
                            {result.estimated_terms?.term_months}mo
                          </p>
                        </div>
                        <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          {Math.round(result.match_score)}% match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 rounded-lg bg-gray-50 px-4 py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <span className="text-gray-600">AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* File Selector */}
      {showFileSelector && selectedFiles.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-sm font-medium text-gray-900">Select Documents for Package:</h3>
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {selectedFiles.map(file => (
              <label key={file.id} className="flex cursor-pointer items-center space-x-3">
                <input
                  type="checkbox"
                  checked={file.selected}
                  onChange={() => handleFileToggle(file.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <DocumentIcon className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.filename}</p>
                  <p className="text-xs text-gray-500">{file.document_type}</p>
                </div>
                {file.relevance_score && (
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${getRelevanceColor(file.relevance_score)}`}
                  >
                    {formatRelevanceScore(file.relevance_score)}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Package Creator Modal */}
      {showPackageCreator && (
        <div className="border-t border-gray-200 bg-blue-50 p-4">
          <h3 className="mb-3 text-sm font-medium text-gray-900">Create Submission Package</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Package name (e.g., Equipment Financing - Q1 2024)"
              value={packageName}
              onChange={e => setPackageName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex space-x-2">
              <button
                onClick={submitPackageCreation}
                disabled={!packageName.trim() || isLoading}
                className="flex flex-1 items-center justify-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CloudArrowUpIcon className="h-4 w-4" />
                <span>Create Package</span>
              </button>
              <button
                onClick={() => setShowPackageCreator(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Describe what type of financing you need..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileLockChatInterface;
