import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTransactionContext } from '../contexts/TransactionContextProvider';
import { UserContext } from '../contexts/UserContext';
import { useUserType } from '../contexts/UserTypeContext';
import { roleSpecificEVAService } from '../services/RoleSpecificEVAService';

import { debugLog } from '../utils/auditLogger';

interface MCPMessage {
  id: string;
  type: 'user' | 'assistant' | 'tool-call' | 'tool-result';
  content: string;
  tool?: string;
  toolData?: any;
  timestamp: Date;
  context?: any;
}

interface MCPTool {
  name: string;
  description: string;
  category:
    | 'transaction'
    | 'customer'
    | 'risk'
    | 'documents'
    | 'matching'
    | 'execution'
    | 'analysis';
  icon: string;
  available: boolean;
}

interface EVAAssistantProps {
  sessionId?: string;
  sessionTitle?: string;
  currentTransaction?: any;
  currentCustomer?: any;
}

const EVAAssistantWithMCP: React.FC<EVAAssistantProps> = ({
  sessionId = 'default',
  sessionTitle = 'EVA Assistant',
  currentTransaction: propTransaction,
  currentCustomer: propCustomer,
}) => {
  // Get user role for role-specific logic
  const { userRole } = useContext(UserContext);

  // Context-aware transaction data
  const { currentTransaction: selectedTransaction, currentCustomer: selectedCustomer } =
    useTransactionContext();

  const { getUserTypeDisplayName } = useUserType();

  const [messages, setMessages] = useState<MCPMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableTools, setAvailableTools] = useState<string[]>([]);
  const [activeTools, setActiveTools] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Session-specific message storage
  const [sessionMessages, setSessionMessages] = useState<Record<string, MCPMessage[]>>({});

  // Voice and Speech functionality
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);

  // Use props if provided, otherwise fallback to context
  const currentTransaction = propTransaction || selectedTransaction;
  const currentCustomer = propCustomer || selectedCustomer;

  // Get messages for current session
  const currentMessages = sessionMessages[sessionId] || [];

  // Role-specific state
  const [roleSpecificPrompts, setRoleSpecificPrompts] = useState<string[]>([]);
  const [contextualPrompts, setContextualPrompts] = useState<string[]>([]);

  // Mock the missing properties that don't exist in the context
  const getTransactionContext = useCallback(() => {
    return {
      transaction: selectedTransaction,
      customer: selectedCustomer,
    };
  }, [selectedTransaction, selectedCustomer]);

  const getPredictedPrompts = useCallback(() => {
    // Mock implementation - would need to be implemented in the context
    return [
      'What is the status of this transaction?',
      'Show me the customer details',
      'What documents are needed?',
    ];
  }, []);

  const refreshTransactions = useCallback(async () => {
    // Mock implementation - would need to be implemented in the context
    debugLog('general', 'log_statement', 'Refresh transactions called')
  }, []);

  // Update contextual prompts based on user role and transaction context
  useEffect(() => {
    // Get role-specific prompts
    const rolePrompts = roleSpecificEVAService.generateContextualPrompts(
      userRole || '',
      currentTransaction,
    );
    setRoleSpecificPrompts(rolePrompts);

    if (currentTransaction || currentCustomer) {
      const contextualPrompts = getPredictedPrompts();
      // Combine role-specific and contextual prompts
      setContextualPrompts([...rolePrompts.slice(0, 3), ...contextualPrompts.slice(0, 2)]);
    } else {
      // Use role-specific prompts when no transaction context
      setContextualPrompts(
        rolePrompts.length > 0
          ? rolePrompts
          : [
              'What transactions need my attention today?',
              'Show me customers with active applications',
              'What are the latest market trends?',
              'Help me analyze portfolio performance',
            ],
      );
    }
  }, [currentTransaction?.id, currentCustomer?.id, userRole, getPredictedPrompts]);

  // Update messages for current session
  const updateSessionMessages = (newMessages: MCPMessage[]) => {
    setSessionMessages(prev => ({
      ...prev,
      [sessionId]: newMessages,
    }));
  };

  // Initialize speech recognition
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    ) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => prev + ' ' + transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setSpeechRecognition(recognition);
    }
  }, []);

  // Voice input functions
  const startListening = () => {
    if (speechRecognition && !isListening) {
      setIsListening(true);
      speechRecognition.start();
    }
  };

  const stopListening = () => {
    if (speechRecognition && isListening) {
      speechRecognition.stop();
      setIsListening(false);
    }
  };

  // Text-to-speech function
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // MCP Tool definitions
  const mcpTools: MCPTool[] = useMemo(
    () => [
      {
        name: 'transaction-query',
        description: 'Analyze deal metrics, payment terms, and transaction status',
        category: 'transaction',
        icon: '💰',
        available: availableTools.includes('transaction-query'),
      },
      {
        name: 'customer-lookup',
        description: 'Review credit profile, payment history, and relationship data',
        category: 'customer',
        icon: '👤',
        available: availableTools.includes('customer-lookup'),
      },
      {
        name: 'risk-analysis',
        description: 'Calculate risk scores, DSC ratios, and compliance factors',
        category: 'risk',
        icon: '⚠️',
        available: availableTools.includes('risk-analysis'),
      },
      {
        name: 'smart-match',
        description: 'Find lenders with optimal rates and deal preferences',
        category: 'matching',
        icon: '🎯',
        available: availableTools.includes('smart-match'),
      },
      {
        name: 'deal-structure',
        description: 'Optimize loan terms, rates, and payment structures',
        category: 'transaction',
        icon: '🏗️',
        available: availableTools.includes('deal-structure'),
      },
      {
        name: 'transaction-execution',
        description: 'Process workflows, approvals, and funding coordination',
        category: 'execution',
        icon: '⚡',
        available: availableTools.includes('transaction-execution'),
      },
      {
        name: 'document-search',
        description: 'Access contracts, statements, and compliance documents',
        category: 'documents',
        icon: '📄',
        available: availableTools.includes('document-search'),
      },
      {
        name: 'web-search-brave',
        description: 'Search the web with Brave Pro for real-time data and news',
        category: 'analysis',
        icon: '🔍',
        available: availableTools.includes('web-search-brave'),
      },
      {
        name: 'web-search-profile',
        description: 'Build comprehensive profiles using AI-powered web data',
        category: 'analysis',
        icon: '🧑‍💼',
        available: availableTools.includes('web-search-profile'),
      },
    ],
    [availableTools],
  );

  // Update available tools
  useEffect(() => {
    // Mock available tools for now - replace with actual context data
    setAvailableTools([
      'transaction-query',
      'customer-lookup',
      'risk-analysis',
      'smart-match',
      'deal-structure',
      'transaction-execution',
      'document-search',
      'web-search-brave',
      'web-search-profile',
    ]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Enhanced context message generation
  useEffect(() => {
    if (currentTransaction || currentCustomer) {
      const contextData = getTransactionContext();

      if (contextData && currentMessages.length === 0) {
        // Generate role-specific welcome message
        let welcomeContent = '';

        if (userRole === 'borrower') {
          welcomeContent = `Welcome! I'm EVA, your AI lending assistant. I see you have an active ${currentTransaction?.type || 'application'}. I'm here to help you get fast loan approvals and find the best lenders for your needs. My goal is to get you either approved or a clear decline decision as quickly as possible.`;
        } else if (userRole === 'vendor') {
          welcomeContent = `Welcome! I'm EVA, your AI deal acceleration assistant. I see you have a ${currentTransaction?.type || 'transaction'} in progress. I'm here to help you close this deal faster and optimize your funding pipeline for maximum success.`;
        } else {
          welcomeContent = `I can see you're working on a ${currentTransaction?.type || 'transaction'}. Let me help you with context-aware insights and recommendations.`;
        }

        // Add transaction insights for role-specific users
        if (userRole && currentTransaction && (userRole === 'borrower' || userRole === 'vendor')) {
          const insights = roleSpecificEVAService.getTransactionInsights(
            userRole,
            currentTransaction,
          );
          welcomeContent += `\n\n${insights}`;
        }

        const contextMessage: MCPMessage = {
          id: 'context-' + sessionId,
          type: 'assistant',
          content: welcomeContent,
          timestamp: new Date(),
          context: {
            userRole,
            transaction: currentTransaction,
            customer: currentCustomer,
            contextData,
            roleSpecific: userRole === 'borrower' || userRole === 'vendor',
          },
        };

        updateSessionMessages([contextMessage]);
      }
    }
  }, [currentTransaction?.id, currentCustomer?.id, userRole, getUserTypeDisplayName, sessionId]);

  // Intelligent tool detection
  const detectRequiredTools = (message: string): string[] => {
    const messageWords = message.toLowerCase().split(' ');
    const roleSpecificTools = roleSpecificEVAService.getRoleTools(userRole || 'borrower');

    // Start with role-specific tools
    const selectedTools: string[] = [];

    // Get detailed tool information for better matching
    roleSpecificTools.forEach(tool => {
      const toolDetails = roleSpecificEVAService.getToolDetails(tool, userRole || 'borrower');
      const toolKeywords = [
        toolDetails.name.toLowerCase(),
        toolDetails.description.toLowerCase(),
        toolDetails.category.toLowerCase(),
        tool.toLowerCase(),
      ].join(' ');

      // Check if message contains tool-related keywords
      const hasMatch = messageWords.some(
        word => toolKeywords.includes(word) || word.includes(tool.replace('-', '').toLowerCase()),
      );

      if (hasMatch) {
        selectedTools.push(tool);
      }
    });

    // Role-specific intelligent tool selection
    if (userRole === 'borrower') {
      if (messageWords.some(word => ['loan', 'credit', 'borrow', 'funding'].includes(word))) {
        selectedTools.push('credit-check', 'lender-match');
      }
      if (messageWords.some(word => ['rate', 'interest', 'terms', 'better'].includes(word))) {
        selectedTools.push('rate-comparison');
      }
      if (messageWords.some(word => ['fast', 'quick', 'urgent', 'immediate'].includes(word))) {
        selectedTools.push('fast-decline-detection', 'pre-approval-calculator');
      }
    } else if (userRole === 'vendor') {
      if (
        messageWords.some(word => ['deals', 'pipeline', 'volume', 'acceleration'].includes(word))
      ) {
        selectedTools.push('pipeline-analysis', 'deal-acceleration');
      }
      if (
        messageWords.some(word =>
          ['performance', 'analytics', 'metrics', 'insights'].includes(word),
        )
      ) {
        selectedTools.push('performance-analytics');
      }
      if (
        messageWords.some(word => ['commission', 'revenue', 'profit', 'earnings'].includes(word))
      ) {
        selectedTools.push('commission-tracker');
      }
      if (
        messageWords.some(word => ['network', 'partners', 'lenders', 'expansion'].includes(word))
      ) {
        selectedTools.push('vendor-network-expansion');
      }
    }

    // Remove duplicates and limit to 3 most relevant tools
    return [...new Set(selectedTools)].slice(0, 3);
  };

  // Mock tool execution function
  const executeContextualQuery = async (tool: string, query: string): Promise<any> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    switch (tool) {
      case 'transaction-query':
        return {
          currentTransaction,
          relatedTransactions: [],
          context: 'financial-transaction-analysis',
        };

      case 'customer-lookup':
        return {
          currentCustomer,
          customerTransactions: [],
          context: 'customer-relationship-management',
        };

      case 'risk-analysis':
        return {
          riskProfile: currentTransaction?.riskProfile || {
            score: 'Medium',
            factors: ['Credit History'],
          },
          complianceStatus: 'compliant',
          context: 'risk-assessment',
        };

      case 'smart-match':
        return {
          matches: [
            { name: 'First National Bank', score: 85 },
            { name: 'Community Credit Union', score: 78 },
          ],
          dealStructure: currentTransaction?.dealStructure,
          context: 'lender-matching',
        };

      case 'web-search-brave':
        return {
          searchResults: [
            {
              title: 'Current Market Interest Rates',
              snippet: 'Federal Reserve announces latest interest rate decision...',
              url: 'https://example.com/rates',
              date: new Date().toISOString(),
            },
            {
              title: 'Industry News: Finance Sector Update',
              snippet: 'Latest developments in commercial lending...',
              url: 'https://example.com/news',
              date: new Date().toISOString(),
            },
          ],
          context: 'web-search-brave-pro',
          searchType: 'brave-pro',
          resultsCount: 2,
        };

      case 'web-search-profile':
        return {
          profileData: {
            companyName: currentCustomer?.name || 'Unknown Company',
            industry: currentCustomer?.industry || 'General Business',
            foundedYear: 2010,
            headquarters: 'New York, NY',
            employeeCount: '100-500',
            revenue: '$10-50M',
            keyPeople: ['John CEO', 'Jane CFO'],
            recentNews: ['Expansion announced', 'New product launch'],
          },
          sources: ['LinkedIn', 'Company Website', 'News Articles'],
          context: 'profile-builder-ai',
          confidence: 0.85,
        };

      default:
        return { error: 'Tool not found', availableTools };
    }
  };

  // Enhanced message processing with role-specific logic
  const processMessage = async (message: string): Promise<void> => {
    setIsProcessing(true);
    const messageId = Date.now().toString();

    try {
      // Get role-specific response
      const roleResponse = await roleSpecificEVAService.generateRoleSpecificResponse(
        userRole || 'borrower',
        message,
        currentTransaction,
      );

      // Detect required tools
      const requiredTools = detectRequiredTools(message);

      // Get tool details for better response
      const toolDetails = requiredTools.map(tool =>
        roleSpecificEVAService.getToolDetails(tool, userRole || 'borrower'),
      );

      // Create enhanced response with tool integration
      let enhancedMessage = roleResponse.message;

      if (toolDetails.length > 0) {
        enhancedMessage += '\n\n**Available Tools:**\n';
        toolDetails.forEach(tool => {
          enhancedMessage += `• **${tool.name}**: ${tool.description} (${tool.estimatedTime})\n`;
        });

        enhancedMessage += '\n**Next Steps:**\n';
        roleResponse.nextSteps.forEach((step, index) => {
          enhancedMessage += `${index + 1}. ${step.title} - ${step.description}\n`;
        });
      }

      // Add role-specific contextual information
      if (userRole === 'borrower') {
        enhancedMessage +=
          '\n\n**For Borrowers:** I can help you get fast loan decisions, find the best lenders, and optimize your rates. Just ask!';
      } else if (userRole === 'vendor') {
        enhancedMessage +=
          '\n\n**For Vendors:** I can accelerate your deals, expand your network, and optimize your performance. What would you like to work on?';
      }

      // Simulate tool execution results
      if (requiredTools.length > 0) {
        setTimeout(async () => {
          const toolResults = await Promise.all(
            requiredTools.map(async tool => {
              const details = roleSpecificEVAService.getToolDetails(tool, userRole || 'borrower');
              return {
                tool,
                result: `${details.name} completed successfully: ${details.outcome}`,
                success: true,
              };
            }),
          );

          const resultsMessage =
            'Tool Execution Results:\n' + toolResults.map(r => `✅ ${r.result}`).join('\n');

          const toolResultMessage: MCPMessage = {
            id: (Date.now() + 1).toString(),
            type: 'tool-result',
            content: resultsMessage,
            timestamp: new Date(),
            tool: requiredTools[0], // Use first tool for the tool result
          };

          updateSessionMessages([...currentMessages, toolResultMessage]);
        }, 2000);
      }

      // Create the response message
      const responseMessage: MCPMessage = {
        id: messageId,
        type: 'assistant',
        content: enhancedMessage,
        timestamp: new Date(),
        context: {
          tools: requiredTools,
          confidence: roleResponse.confidence,
          nextSteps: roleResponse.nextSteps,
          expectedTimeframe: roleResponse.expectedTimeframe,
          userRole: userRole,
        },
      };

      updateSessionMessages([...currentMessages, responseMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: MCPMessage = {
        id: messageId,
        type: 'assistant',
        content: `I apologize, but I encountered an error processing your request. As a ${userRole || 'user'}, you can try asking about ${userRole === 'borrower' ? 'loan applications, credit checks, or rate comparisons' : userRole === 'vendor' ? 'deal acceleration, pipeline analysis, or performance metrics' : 'available services'}. Please try again.`,
        timestamp: new Date(),
      };
      updateSessionMessages([...currentMessages, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate contextual response
  const generateContextualResponse = (query: string, toolResults: any): string => {
    const lowerQuery = query.toLowerCase();

    // Transaction analysis
    if (toolResults['transaction-query']) {
      const data = toolResults['transaction-query'];
      if (lowerQuery.includes('summary') || lowerQuery.includes('overview')) {
        return `📊 **Transaction Analysis**\n\n**Current Transaction**: ${data.currentTransaction?.borrowerName}\n**Type**: ${data.currentTransaction?.type}\n**Amount**: $${data.currentTransaction?.amount?.toLocaleString()}\n**Status**: ${data.currentTransaction?.status}\n**Stage**: ${data.currentTransaction?.stage}\n\n**Related Transactions**: ${data.relatedTransactions?.length || 0} found\n\nWould you like me to analyze any specific aspect?`;
      }
    }

    // Customer analysis
    if (toolResults['customer-lookup']) {
      const data = toolResults['customer-lookup'];
      if (lowerQuery.includes('customer') || lowerQuery.includes('profile')) {
        return `👤 **Customer Profile**\n\n**Name**: ${data.currentCustomer?.name}\n**Industry**: ${data.currentCustomer?.industry}\n**Credit Score**: ${data.currentCustomer?.creditScore}\n**Risk Level**: ${data.currentCustomer?.riskLevel}\n**KYC Status**: ${data.currentCustomer?.kycStatus}\n\n**Transaction History**: ${data.customerTransactions?.length || 0} transactions\n\nWhat specific information would you like to know?`;
      }
    }

    // Risk analysis
    if (toolResults['risk-analysis']) {
      const data = toolResults['risk-analysis'];
      if (data.riskProfile) {
        return `⚠️ **Risk Analysis**\n\n**Risk Score**: ${data.riskProfile.score}\n**Risk Factors**:\n${data.riskProfile.factors?.map(f => `• ${f}`).join('\n')}\n\n**Mitigations**:\n${data.riskProfile.mitigations?.map(m => `• ${m}`).join('\n')}\n\n**Compliance**: ${data.complianceStatus}\n\nWould you like me to suggest risk mitigation strategies?`;
      }
    }

    // Smart matching
    if (toolResults['smart-match']) {
      const data = toolResults['smart-match'];
      if (data.matches?.length > 0) {
        return `🎯 **Smart Matching Results**\n\n**Top Matches**:\n${data.matches.map(m => `• ${m.name} - Score: ${m.score}%`).join('\n')}\n\n**Deal Structure**:\n• Loan Type: ${data.dealStructure?.loanType}\n• Term: ${data.dealStructure?.term} months\n• Rate: ${data.dealStructure?.rate}%\n\nShould I initiate contact with any of these lenders?`;
      }
    }

    // Default response
    return `I understand you're asking about "${query}". Based on the current context:\n\n${
      currentTransaction
        ? `📊 Transaction: ${currentTransaction.borrowerName} - ${currentTransaction.type}`
        : '📊 No transaction selected'
    }\n${
      currentCustomer ? `👤 Customer: ${currentCustomer.name}` : '👤 No customer selected'
    }\n\nI have ${Object.keys(toolResults).length} tools providing data. Could you be more specific about what you'd like to know?`;
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && !isProcessing) {
      processMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Tool Status Bar */}
      {activeTools.size > 0 && (
        <div className="border-b bg-blue-50 p-3">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium text-blue-700">🔧 Processing with tools:</div>
            {Array.from(activeTools).map(tool => {
              const toolInfo = mcpTools.find(t => t.name === tool);
              return (
                <span
                  key={tool}
                  className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                >
                  {toolInfo?.icon} {tool.replace('-', ' ')}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Context Bar */}
      <div className="border-b bg-gray-50 p-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <span>📊</span>
              <span className="font-medium">
                {currentTransaction
                  ? `${currentTransaction.borrowerName} - ${currentTransaction.type}`
                  : 'No transaction selected'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span>👤</span>
              <span className="font-medium">
                {currentCustomer
                  ? `${currentCustomer.name} (${currentCustomer.industry || 'Unknown'})`
                  : 'No customer selected'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <span>🎭</span>
            <span className="text-xs">{getUserTypeDisplayName()}</span>
          </div>
        </div>
      </div>

      {/* Messages - Optimized for vertical space */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {currentMessages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'tool-call'
                    ? 'border border-yellow-200 bg-yellow-100 text-yellow-800'
                    : message.type === 'tool-result'
                      ? 'border border-green-200 bg-green-100 text-green-800'
                      : 'border border-gray-200 bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              <div className="mt-2 flex items-center justify-between text-xs opacity-70">
                <span>{message.timestamp.toLocaleTimeString()}</span>
                <div className="flex items-center space-x-2">
                  {message.tool && (
                    <span className="rounded bg-black/10 px-2 py-1">• {message.tool}</span>
                  )}
                  {message.type === 'assistant' && (
                    <button
                      onClick={() => speakMessage(message.content)}
                      className="rounded bg-blue-600 px-2 py-1 text-xs text-white transition-colors duration-200 hover:bg-blue-700"
                      title="Read aloud"
                      disabled={isSpeaking}
                    >
                      {isSpeaking ? '🔊' : '🔉'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="rounded-lg border border-gray-200 bg-gray-100 p-3 text-gray-800">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <span className="text-sm">EVA is analyzing with specialized tools...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Enhanced with Voice Controls */}
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 flex space-x-3">
          <div className="relative flex-1">
            <textarea
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about deal analysis, risk assessment, lender matching, compliance, or transaction execution..."
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 pr-24 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              disabled={isProcessing}
            />

            {/* Voice Controls */}
            <div className="absolute right-2 top-2 flex space-x-1">
              {speechRecognition && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`${
                    isListening
                      ? 'bg-red-600 animate-pulse hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } rounded px-2 py-1 text-xs text-white transition-colors duration-200`}
                  title={isListening ? 'Stop listening' : 'Voice input'}
                  disabled={isProcessing}
                >
                  {isListening ? '⏹️' : '🎤'}
                </button>
              )}

              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="bg-red-600 rounded px-2 py-1 text-xs text-white transition-colors duration-200 hover:bg-red-700"
                  title="Stop speaking"
                >
                  🔇
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isProcessing}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? '...' : 'Send'}
          </button>
        </div>

        {/* Available Tools Quick Access */}
        <div className="mt-3 space-y-2">
          <div className="text-xs font-medium text-gray-600">Quick Finance Tools:</div>
          <div className="flex flex-wrap gap-2">
            {mcpTools
              .filter(tool => tool.available)
              .map(tool => (
                <button
                  key={tool.name}
                  onClick={() => {
                    const prompts = {
                      'transaction-query':
                        'Analyze the current transaction metrics including loan amount, terms, and payment structure',
                      'customer-lookup':
                        'Review the customer credit profile, payment history, and business relationship',
                      'risk-analysis':
                        'Calculate the risk score and debt service coverage ratio for this transaction',
                      'smart-match':
                        'Find the best lender matches based on deal size, industry, and current market rates',
                      'deal-structure':
                        'Optimize the loan terms and payment structure for maximum approval probability',
                      'transaction-execution':
                        'Show me the next steps in the transaction workflow and required approvals',
                      'document-search':
                        'Find all required documents and check compliance status for this transaction',
                    };
                    setInputMessage(prompts[tool.name] || `Use ${tool.name} for analysis`);
                  }}
                  className="flex items-center space-x-1 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 text-xs text-blue-700 transition-all duration-200 hover:from-blue-100 hover:to-indigo-100"
                  title={tool.description}
                >
                  <span>{tool.icon}</span>
                  <span className="font-medium">{tool.name.replace('-', ' ')}</span>
                </button>
              ))}
          </div>

          {/* Professional Finance Prompts */}
          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-gray-600">Professional Prompts:</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: '💹',
                  text: 'Calculate loan-to-value and debt coverage ratios',
                  prompt:
                    'Calculate the loan-to-value ratio, debt service coverage ratio, and other key financial metrics for this transaction',
                },
                {
                  icon: '📊',
                  text: 'Generate deal summary report',
                  prompt:
                    'Generate a comprehensive deal summary including borrower profile, collateral analysis, and risk assessment',
                },
                {
                  icon: '🏦',
                  text: 'Compare lender options',
                  prompt:
                    'Compare available lenders by rates, terms, and approval criteria for this transaction type and amount',
                },
                {
                  icon: '⚖️',
                  text: 'Review compliance requirements',
                  prompt:
                    'Review all compliance requirements, regulatory considerations, and required documentation for this transaction',
                },
                {
                  icon: '🔍',
                  text: 'Analyze cash flow projections',
                  prompt:
                    'Analyze the borrower cash flow projections and assess sustainability of proposed payment terms',
                },
                {
                  icon: '💼',
                  text: 'Check market comparables',
                  prompt:
                    'Find comparable transactions in the market for similar deal size, industry, and structure',
                },
              ].map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(prompt.prompt)}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs text-gray-700 transition-all duration-200 hover:bg-gray-100"
                  title="Click to use this prompt"
                >
                  <div className="flex items-center space-x-2">
                    <span>{prompt.icon}</span>
                    <span className="flex-1">{prompt.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EVAAssistantWithMCP;
