import React, { useState, useEffect, useCallback } from 'react';
import ChatWidget from '../communications/ChatWidget';
import ChatHistoryPanel from './ChatHistoryPanel';
import ChatHistoryService, { ChatConversation, ChatMessage } from '../../services/chatHistoryService';
import { AgentModel } from '../communications/CustomAgentManager';
import { DEFAULT_AGENTS } from '../communications/AgentSelector';
import { Message } from '../communications/ChatWidget';

interface EnhancedChatInterfaceProps {
  mode?: 'eva' | 'risk' | 'communications';
  isOpen?: boolean;
  onClose?: () => void;
  initialContextPrompt?: string;
  currentCustomerId?: string;
  currentTransactionId?: string;
}

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  mode = 'eva',
  isOpen = false,
  onClose,
  initialContextPrompt = '',
  currentCustomerId,
  currentTransactionId,
}) => {
  const chatHistoryService = ChatHistoryService.getInstance();
  
  // State
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentModel>(DEFAULT_AGENTS[0]);
  const [showHistory, setShowHistory] = useState(true);
  const [agents] = useState<AgentModel[]>(DEFAULT_AGENTS);

  // Initialize or load conversation
  useEffect(() => {
    if (isOpen && !currentConversation) {
      // Check if there's an existing conversation for this context
      const existingConversations = chatHistoryService.getConversations({
        customerId: currentCustomerId,
        transactionId: currentTransactionId,
      });

      if (existingConversations.length > 0) {
        // Load the most recent conversation
        loadConversation(existingConversations[0]);
      } else {
        // Create a new conversation
        createNewConversation();
      }
    }
  }, [isOpen, currentCustomerId, currentTransactionId]);

  // Create a new conversation
  const createNewConversation = useCallback(() => {
    const conversation = chatHistoryService.createConversation({
      title: 'New Conversation',
      agentId: selectedAgent.id,
      customerId: currentCustomerId,
      transactionId: currentTransactionId,
      tags: mode ? [mode] : [],
    });

    setCurrentConversation(conversation);
    setMessages([]);

    // Add initial message if provided
    if (initialContextPrompt) {
      const initialMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: initialContextPrompt,
        timestamp: new Date(),
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
      };
      
      chatHistoryService.addMessage(conversation.id, initialMessage);
      setMessages([convertToWidgetMessage(initialMessage)]);
    }
  }, [selectedAgent, currentCustomerId, currentTransactionId, mode, initialContextPrompt]);

  // Load a conversation
  const loadConversation = useCallback((conversation: ChatConversation) => {
    setCurrentConversation(conversation);
    
    // Convert chat history messages to widget messages
    const widgetMessages = conversation.messages.map(convertToWidgetMessage);
    setMessages(widgetMessages);

    // Set the agent if specified
    if (conversation.agentId) {
      const agent = agents.find(a => a.id === conversation.agentId);
      if (agent) {
        setSelectedAgent(agent);
      }
    }
  }, [agents]);

  // Convert ChatMessage to Widget Message
  const convertToWidgetMessage = (chatMessage: ChatMessage): Message => {
    return {
      id: chatMessage.id,
      sender: chatMessage.sender,
      text: chatMessage.text,
      timestamp: chatMessage.timestamp,
      attachment: chatMessage.attachment,
      bulletPoints: chatMessage.bulletPoints,
      isSuggestion: chatMessage.isSuggestion,
    };
  };

  // Handle sending a message
  const handleSendMessage = useCallback((text: string, files: File[]) => {
    if (!currentConversation) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date(),
      attachment: files.length > 0 ? {
        type: 'document',
        name: files[0].name,
        url: URL.createObjectURL(files[0]),
      } : undefined,
    };

    // Add to history
    chatHistoryService.addMessage(currentConversation.id, userMessage);
    
    // Update local messages
    setMessages(prev => [...prev, convertToWidgetMessage(userMessage)]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: generateAIResponse(text, selectedAgent),
        timestamp: new Date(),
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        bulletPoints: generateSuggestions(text, selectedAgent),
      };

      chatHistoryService.addMessage(currentConversation.id, aiResponse);
      setMessages(prev => [...prev, convertToWidgetMessage(aiResponse)]);
    }, 1000);
  }, [currentConversation, selectedAgent]);

  // Generate AI response based on agent
  const generateAIResponse = (userMessage: string, agent: AgentModel): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Agent-specific responses
    switch (agent.id) {
      case 'eva-fin-risk':
        if (lowerMessage.includes('risk')) {
          return "I've analyzed the risk factors in your query. Based on current market conditions and the available data, here are my findings...";
        }
        return "I can help you assess financial risks and provide detailed risk analysis. What specific risk factors would you like me to evaluate?";

      case 'eva-loan-specialist':
        if (lowerMessage.includes('loan') || lowerMessage.includes('credit')) {
          return "I can assist with loan applications and credit analysis. Let me review the relevant information for you...";
        }
        return "As your loan specialist, I can help with loan applications, credit assessments, and financing options. How can I assist you today?";

      case 'eva-compliance':
        if (lowerMessage.includes('compliance') || lowerMessage.includes('regulation')) {
          return "I'll review the compliance requirements and regulatory framework applicable to your situation...";
        }
        return "I ensure all activities meet regulatory requirements. What compliance matters can I help you with?";

      case 'eva-market-analyst':
        if (lowerMessage.includes('market') || lowerMessage.includes('trend')) {
          return "Let me analyze the current market trends and provide insights relevant to your query...";
        }
        return "I provide market analysis and trend insights. What market information are you looking for?";

      default:
        return "I'm here to help with your financial needs. Could you provide more details about what you're looking for?";
    }
  };

  // Generate suggestions based on context
  const generateSuggestions = (userMessage: string, agent: AgentModel): string[] => {
    const suggestions: string[] = [];

    switch (agent.id) {
      case 'eva-fin-risk':
        suggestions.push(
          "Analyze portfolio risk exposure",
          "Generate risk assessment report",
          "Review risk mitigation strategies"
        );
        break;

      case 'eva-loan-specialist':
        suggestions.push(
          "Check loan eligibility",
          "Calculate loan terms",
          "Review application status"
        );
        break;

      case 'eva-compliance':
        suggestions.push(
          "Review compliance checklist",
          "Check regulatory updates",
          "Generate compliance report"
        );
        break;

      case 'eva-market-analyst':
        suggestions.push(
          "Show market trends",
          "Analyze competitor data",
          "Generate market report"
        );
        break;

      default:
        suggestions.push(
          "Tell me more about your needs",
          "View available services",
          "Connect with a specialist"
        );
    }

    return suggestions;
  };

  // Handle agent switch
  const handleSwitchAgent = useCallback((agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setSelectedAgent(agent);
      
      // Update conversation with new agent
      if (currentConversation) {
        chatHistoryService.updateConversation(currentConversation.id, {
          agentId: agent.id,
        });
      }
    }
  }, [agents, currentConversation]);

  // Handle conversation selection from history
  const handleSelectConversation = useCallback((conversation: ChatConversation) => {
    loadConversation(conversation);
  }, [loadConversation]);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Chat History Sidebar */}
      {showHistory && isOpen && (
        <div className="w-80 bg-white shadow-lg">
          <ChatHistoryPanel
            currentConversationId={currentConversation?.id}
            onSelectConversation={handleSelectConversation}
            onCreateNewConversation={createNewConversation}
          />
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="flex-1">
        <ChatWidget
          mode={mode}
          isOpen={isOpen}
          onClose={onClose}
          activeConversationMessages={messages}
          currentSelectedAgent={selectedAgent}
          allAgents={agents}
          onSendMessage={handleSendMessage}
          onSwitchAgent={handleSwitchAgent}
          title={currentConversation?.title || 'EVA AI Assistant'}
          zIndexBase={40} // Lower than the parent container
        />
      </div>

      {/* Toggle History Button */}
      {isOpen && (
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-r-lg p-2 hover:bg-gray-50"
          style={{ left: showHistory ? '320px' : '0' }}
        >
          <svg
            className={`w-5 h-5 text-gray-600 transform transition-transform ${showHistory ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default EnhancedChatInterface;