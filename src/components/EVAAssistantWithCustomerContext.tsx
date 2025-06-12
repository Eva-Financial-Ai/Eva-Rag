import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useEVACustomer } from '../contexts/EVACustomerContext';
import { UserContext } from '../contexts/UserContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'eva';
  timestamp: Date;
  type?: 'protocol' | 'regular' | 'summary' | 'confirmation';
  metadata?: any;
}

interface ConversationState {
  phase: 'initial' | 'goal-setting' | 'resource-assessment' | 'summary-review' | 'active-chat';
  goalEstablished: boolean;
  resourcesAssessed: boolean;
  summaryConfirmed: boolean;
  userGoal?: string;
  availableResources?: string[];
  evaResponseStyle?: string;
}

interface EVAAssistantWithCustomerContextProps {
  sessionId?: string;
  onNewMessage?: (message: Message) => void;
}

const EVAAssistantWithCustomerContext: React.FC<EVAAssistantWithCustomerContextProps> = ({
  sessionId = 'default',
  onNewMessage,
}) => {
  const { selectedCustomer, getCustomerSummary, getCustomerContext } = useEVACustomer();
  const { userRole: userType } = useContext(UserContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>({
    phase: 'initial',
    goalEstablished: false,
    resourcesAssessed: false,
    summaryConfirmed: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation when customer is selected
  useEffect(() => {
    if (selectedCustomer && conversationState.phase === 'initial') {
      if (selectedCustomer) {
        initializeConversation();
      }
    }
  }, [selectedCustomer]);

  const getResponseStyle = () => {
    switch (userType) {
      case 'broker':
        return 'professional broker-focused';
      case 'lender':
        return 'investment-focused';
      case 'vendor':
        return 'strategic vendor-focused';
      case 'borrower':
        return 'supportive customer-focused';
      case 'admin':
        return 'administrative system-focused';
      default:
        return 'professional financial services';
    }
  };

  const initializeConversation = async () => {
    if (!selectedCustomer) return;

    const customerSummary = getCustomerSummary();
    const responseStyle = getResponseStyle();

    const welcomeMessage: Message = {
      id: `msg-${Date.now()}`,
      text: `Hello! I'm EVA, your AI financial assistant. I can see you've selected ${selectedCustomer.display_name} as the customer context for our conversation.

I already know your user type (${userType}) and will adapt my responses in a ${responseStyle} style.

Here's the customer context I have:
${customerSummary}

Before we start with EVA assistance, I need to understand:`,
      sender: 'eva',
      timestamp: new Date(),
      type: 'protocol',
    };

    const goalQuestion: Message = {
      id: `msg-${Date.now() + 1}`,
      text: "1. What's the end goal of this conversation? (e.g., loan application review, risk assessment, customer inquiry, etc.)",
      sender: 'eva',
      timestamp: new Date(),
      type: 'protocol',
    };

    setMessages([welcomeMessage, goalQuestion]);
    setConversationState(prev => ({
      ...prev,
      phase: 'goal-setting',
      evaResponseStyle: responseStyle,
    }));

    if (onNewMessage) {
      onNewMessage(welcomeMessage);
      onNewMessage(goalQuestion);
    }
  };

  const handleGoalResponse = (goal: string) => {
    const resourceQuestion: Message = {
      id: `msg-${Date.now()}`,
      text: `2. Tell me what resources are available to achieve this goal (${goal})?

For example:
- Customer documents (tax returns, bank statements, etc.)
- Internal tools (underwriting systems, risk models, etc.)
- External data sources (credit bureaus, market data, etc.)
- Team members or departments that can assist
- Time constraints or deadlines

Please describe what you have access to.`,
      sender: 'eva',
      timestamp: new Date(),
      type: 'protocol',
    };

    setMessages(prev => [...prev, resourceQuestion]);
    setConversationState(prev => ({
      ...prev,
      phase: 'resource-assessment',
      goalEstablished: true,
      userGoal: goal,
    }));

    if (onNewMessage) {
      onNewMessage(resourceQuestion);
    }
  };

  const handleResourceResponse = (resources: string) => {
    const customerContext = getCustomerContext();

    const summary = `Thank you! Here's my full summary of our conversation setup:

**Customer Context:**
- ${selectedCustomer?.display_name} (${selectedCustomer?.type})
- Credit Score: ${selectedCustomer?.metadata.credit_score || 'N/A'}
- Risk Level: ${selectedCustomer?.metadata.risk_level?.toUpperCase() || 'UNKNOWN'}
- Active Transactions: ${customerContext.transactions?.length || 0}

**Your Goal:** ${conversationState.userGoal}

**Available Resources:** ${resources}

**My Response Style:** ${conversationState.evaResponseStyle} approach optimized for ${userType} users

**Conversation Plan:**
Based on your goal and available resources, I will:
- Provide ${conversationState.evaResponseStyle} guidance
- Focus on ${conversationState.userGoal}
- Leverage the resources you've identified
- Consider ${selectedCustomer?.display_name}'s specific profile and risk factors
- Maintain compliance with financial regulations

Are we on the right path? Please respond with:
- "Yes" to continue with this plan
- "No" and tell me what needs to be corrected`;

    const summaryMessage: Message = {
      id: `msg-${Date.now()}`,
      text: summary,
      sender: 'eva',
      timestamp: new Date(),
      type: 'summary',
    };

    setMessages(prev => [...prev, summaryMessage]);
    setConversationState(prev => ({
      ...prev,
      phase: 'summary-review',
      resourcesAssessed: true,
      availableResources: resources.split('\n').filter(r => r.trim()),
    }));

    if (onNewMessage) {
      onNewMessage(summaryMessage);
    }
  };

  const handleSummaryConfirmation = (confirmed: boolean, correction?: string) => {
    if (confirmed) {
      const startMessage: Message = {
        id: `msg-${Date.now()}`,
        text: `Perfect! I'm now ready to assist you with ${conversationState.userGoal} for ${selectedCustomer?.display_name}. 

I have all the context I need and will provide ${conversationState.evaResponseStyle} guidance throughout our conversation. What would you like to start with?`,
        sender: 'eva',
        timestamp: new Date(),
        type: 'confirmation',
      };

      setMessages(prev => [...prev, startMessage]);
      setConversationState(prev => ({
        ...prev,
        phase: 'active-chat',
        summaryConfirmed: true,
      }));

      if (onNewMessage) {
        onNewMessage(startMessage);
      }
    } else {
      const correctionMessage: Message = {
        id: `msg-${Date.now()}`,
        text: `I understand you'd like to make corrections: ${correction}

Let me adjust my approach. Please clarify:
1. What should be the actual goal of our conversation?
2. What resources are actually available?
3. Is there anything else I should know about ${selectedCustomer?.display_name}'s situation?`,
        sender: 'eva',
        timestamp: new Date(),
        type: 'protocol',
      };

      setMessages(prev => [...prev, correctionMessage]);
      setConversationState(prev => ({
        ...prev,
        phase: 'goal-setting',
        goalEstablished: false,
        resourcesAssessed: false,
      }));

      if (onNewMessage) {
        onNewMessage(correctionMessage);
      }
    }
  };

  const handleRegularChat = async (message: string) => {
    // Simulate EVA's intelligent response based on customer context
    setIsLoading(true);

    // Mock intelligent response - in production this would call your AI/MCP backend
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const customerContext = getCustomerContext();
    const responseStyle = conversationState.evaResponseStyle;

    let response = '';

    // Generate contextual response based on customer profile and user type
    if (message.toLowerCase().includes('loan') || message.toLowerCase().includes('credit')) {
      response = `Based on ${selectedCustomer?.display_name}'s profile (Credit Score: ${selectedCustomer?.metadata.credit_score}, Risk Level: ${selectedCustomer?.metadata.risk_level}), here's my ${responseStyle} analysis:

• Credit Profile: ${selectedCustomer?.metadata.credit_score ? 'Strong' : 'Needs Assessment'} (Score: ${selectedCustomer?.metadata.credit_score || 'TBD'})
• Risk Assessment: ${selectedCustomer?.metadata.risk_level?.toUpperCase() || 'PENDING'} risk level
• Recommended Next Steps: Based on your ${userType} role, I suggest [specific actions]

Would you like me to run a detailed analysis or access specific tools for this customer?`;
    } else if (message.toLowerCase().includes('risk')) {
      response = `Risk Assessment for ${selectedCustomer?.display_name}:

Current Risk Level: ${selectedCustomer?.metadata.risk_level?.toUpperCase() || 'PENDING EVALUATION'}
Key Risk Factors:
• Credit Score: ${selectedCustomer?.metadata.credit_score || 'Not Available'}
• Industry: ${selectedCustomer?.metadata.industry || 'Not Specified'}
• Loan History: ${selectedCustomer?.metadata.loan_history?.length || 0} previous loans

As a ${userType}, you should focus on [specific risk mitigation strategies]. Would you like me to run our risk assessment tools?`;
    } else {
      response = `I understand your question about "${message}". 

Given ${selectedCustomer?.display_name}'s profile and your role as ${userType}, here's my ${responseStyle} response:

[This would be an intelligent response from EVA based on the customer context, your goal (${conversationState.userGoal}), and available resources]

Is there a specific aspect you'd like me to dive deeper into or any tools you'd like me to activate?`;
    }

    const evaResponse: Message = {
      id: `msg-${Date.now()}`,
      text: response,
      sender: 'eva',
      timestamp: new Date(),
      type: 'regular',
      metadata: {
        customerContext: customerContext,
        userGoal: conversationState.userGoal,
        responseStyle: responseStyle,
      },
    };

    setMessages(prev => [...prev, evaResponse]);
    setIsLoading(false);

    if (onNewMessage) {
      onNewMessage(evaResponse);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      type: 'regular',
    };

    setMessages(prev => [...prev, userMessage]);

    if (onNewMessage) {
      onNewMessage(userMessage);
    }

    const messageText = inputText;
    setInputText('');

    // Route message based on conversation phase
    switch (conversationState.phase) {
      case 'goal-setting':
        handleGoalResponse(messageText);
        break;
      case 'resource-assessment':
        handleResourceResponse(messageText);
        break;
      case 'summary-review':
        const isConfirmed =
          messageText.toLowerCase().includes('yes') ||
          messageText.toLowerCase().includes('correct') ||
          messageText.toLowerCase().includes('right path');
        const correction = isConfirmed ? undefined : messageText;
        handleSummaryConfirmation(isConfirmed, correction);
        break;
      case 'active-chat':
        await handleRegularChat(messageText);
        break;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedCustomer) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="p-8 text-center">
          <div className="mb-4 text-6xl">🧠</div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">EVA AI Assistant</h3>
          <p className="mb-4 text-gray-500">Select a customer to start a contextual conversation</p>
          <p className="text-sm text-gray-400">
            Customer data will provide EVA with context for personalized assistance
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Customer Context Header */}
      <div className="border-b border-blue-200 bg-blue-50 p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-blue-900">
              EVA Chat: {selectedCustomer.display_name}
            </div>
            <div className="text-xs text-blue-700">
              {selectedCustomer.type} • Credit: {selectedCustomer.metadata.credit_score || 'N/A'} •
              Risk: {selectedCustomer.metadata.risk_level?.toUpperCase() || 'PENDING'}
            </div>
          </div>
          <div className="text-xs text-blue-600">
            Phase: {conversationState.phase.replace('-', ' ').toUpperCase()}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md xl:max-w-lg ${
                message.sender === 'user'
                  ? 'text-white bg-blue-600'
                  : message.type === 'protocol'
                    ? 'border border-amber-200 bg-amber-100 text-amber-900'
                    : message.type === 'summary'
                      ? 'border border-purple-200 bg-purple-100 text-purple-900'
                      : message.type === 'confirmation'
                        ? 'border border-green-200 bg-green-100 text-green-900'
                        : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{message.text}</div>
              <div className="mt-1 text-xs opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-900">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <span className="text-sm">EVA is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              conversationState.phase === 'goal-setting'
                ? 'Describe your goal for this conversation...'
                : conversationState.phase === 'resource-assessment'
                  ? 'List the resources available to you...'
                  : conversationState.phase === 'summary-review'
                    ? "Type 'yes' if on the right path, or describe corrections..."
                    : 'Type your message...'
            }
            className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="text-white rounded-md bg-blue-600 p-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EVAAssistantWithCustomerContext;
