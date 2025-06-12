import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, TrendingUp, Plus, Database, Camera, Image, File } from '../../utils/mockIcons';
import ConversationHeader from './ConversationHeader';
import MessageBubble from './MessageBubble';
import SmartMatchPanel from './SmartMatchPanel';
import TypingIndicator from './TypingIndicator';
import { FileUploadControls } from './FileUploadControls';
import { 
  ConversationMessage, 
  TransactionConversation, 
  SmartMatchRecommendation,
  User,
  IntelligenceTool,
  MessageMetadata,
  MessageAttachment
} from '../../types/conversation';
import { generateId, handleFileSelection } from '../../utils/fileUtils';

interface ConversationInterfaceProps {
  conversation?: TransactionConversation;
  currentUser: User;
}

// Mock intelligence tools
const intelligenceTools: IntelligenceTool[] = [
  {
    id: '1',
    name: 'Credit Analysis',
    description: 'Analyze borrower credit profile',
    type: 'credit_analysis',
    icon: '📊'
  },
  {
    id: '2',
    name: 'Smart Lender Match',
    description: 'Find optimal lenders for this deal',
    type: 'lender_match',
    icon: '🎯'
  },
  {
    id: '3',
    name: 'Risk Assessment',
    description: 'Evaluate deal risk factors',
    type: 'risk_assessment',
    icon: '⚠️'
  },
  {
    id: '4',
    name: 'Document Analysis',
    description: 'Extract insights from financial documents',
    type: 'document_analysis',
    icon: '📑'
  }
];

export const ConversationInterface: React.FC<ConversationInterfaceProps> = ({
  conversation,
  currentUser
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>(conversation?.messages || []);
  const [inputMessage, setInputMessage] = useState('');
  const [isEvaTyping, setIsEvaTyping] = useState(false);
  const [showIntelligenceMenu, setShowIntelligenceMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<MessageAttachment[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending a message
  const sendMessage = async (content: string, attachments?: MessageAttachment[]) => {
    if (!conversation || (!content.trim() && (!attachments || attachments.length === 0))) return;
    
    const message: ConversationMessage = {
      id: generateId(),
      conversationId: conversation.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content: content.trim() || "Attachment",
      messageType: 'text',
      timestamp: new Date(),
      isSystemMessage: false,
      attachments
    };
    
    setMessages(prev => [...prev, message]);
    setInputMessage('');
    
    // Check if EVA should respond
    if (shouldEvaRespond(content, conversation)) {
      setIsEvaTyping(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const evaResponse = getEvaResponse(content, conversation);
      setMessages(prev => [...prev, evaResponse]);
      setIsEvaTyping(false);
    }
  };
  
  // Determine if EVA should respond based on message content
  const shouldEvaRespond = (content: string, conversation: TransactionConversation) => {
    const lowerContent = content.toLowerCase();
    return (
      lowerContent.includes('eva') ||
      lowerContent.includes('match') ||
      lowerContent.includes('lender') ||
      lowerContent.includes('recommend') ||
      lowerContent.includes('analyze') ||
      lowerContent.includes('help')
    );
  };
  
  // Generate EVA response based on message content
  const getEvaResponse = (content: string, conversation: TransactionConversation): ConversationMessage => {
    const lowerContent = content.toLowerCase();
    let responseContent = '';
    let metadata: MessageMetadata | undefined = undefined;
    
    if (lowerContent.includes('match') || lowerContent.includes('lender')) {
      responseContent = "I've analyzed this deal and found 3 optimal lender matches. Based on the borrower's profile, I recommend prioritizing Lender A for speed (5-day close) or Lender B for best terms (0.25% lower rate).";
      metadata = {
        evaRecommendation: {
          type: 'lender_match',
          confidence: 92,
          data: {
            topRecommendation: 'lender_a',
            speedAdvantage: '60% faster than traditional',
            termAdvantage: 'Best rate in market'
          }
        }
      };
    } else if (lowerContent.includes('analyze') || lowerContent.includes('credit')) {
      responseContent = "I've analyzed the borrower's credit profile. They have a strong payment history with a 720 FICO score. Their debt service coverage ratio is 1.4x, which meets most lender requirements.";
      metadata = {
        evaRecommendation: {
          type: 'risk_assessment',
          confidence: 88,
          data: {
            creditScore: 720,
            dscr: 1.4,
            riskLevel: 'low'
          }
        }
      };
    } else {
      responseContent = "I'm here to help with this deal. I can provide lender matching, risk assessment, or document analysis. What specific aspects would you like me to assist with?";
    }
    
    return {
      id: generateId(),
      conversationId: conversation.id,
      senderId: 'eva_ai',
      senderName: 'EVA',
      senderRole: 'eva_ai',
      content: responseContent,
      messageType: metadata ? 'eva_recommendation' : 'text',
      timestamp: new Date(),
      isSystemMessage: false,
      metadata
    };
  };
  
  // Handle intelligence tool selection
  const handleIntelligenceToolSelect = (tool: IntelligenceTool) => {
    setShowIntelligenceMenu(false);
    setInputMessage(`Eva, please provide ${tool.name.toLowerCase()} for this deal.`);
  };
  
  // Handle submitting to a lender
  const handleSelectLender = (recommendation: SmartMatchRecommendation) => {
    const message: ConversationMessage = {
      id: generateId(),
      conversationId: conversation!.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content: `I'm submitting this deal to ${recommendation.lenderName} based on EVA's recommendation.`,
      messageType: 'text',
      timestamp: new Date(),
      isSystemMessage: false
    };
    
    setMessages(prev => [...prev, message]);
    
    // EVA confirmation message
    setTimeout(() => {
      const evaResponse: ConversationMessage = {
        id: generateId(),
        conversationId: conversation!.id,
        senderId: 'eva_ai',
        senderName: 'EVA',
        senderRole: 'eva_ai',
        content: `Great choice! I've prepared the submission package for ${recommendation.lenderName}. This lender typically responds within 24 hours, which is 60% faster than industry average.`,
        messageType: 'text',
        timestamp: new Date(),
        isSystemMessage: false
      };
      
      setMessages(prev => [...prev, evaResponse]);
    }, 1000);
  };
  
  // Handle file selection
  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;
    
    const newAttachments = await handleFileSelection(files, 'file');
    setSelectedFiles(prev => [...prev, ...newAttachments]);
  };
  
  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.capture = 'environment';
      fileInputRef.current.click();
    }
  };
  
  const handleImageSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };
  
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = '*/*';
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };
  
  const handleRemoveFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
  };
  
  const handleSendMessage = (message: string, files: MessageAttachment[] = []) => {
    const allFiles = [...selectedFiles, ...files];
    sendMessage(message, allFiles.length > 0 ? allFiles : undefined);
    setSelectedFiles([]);
  };
  
  // If no conversation is selected
  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Select a Deal Conversation</h2>
          <p className="text-gray-600">Choose a deal from the list to view the conversation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Conversation Header */}
      <ConversationHeader
        conversation={conversation}
        onInviteUser={() => {}}
        onViewDeal={() => {}}
      />
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
          {messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={message.senderId === currentUser.id}
            />
          ))}
          {isEvaTyping && <TypingIndicator sender="EVA" />}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Smart Match Panel - conditionally shown */}
      {conversation.status === 'in_review' && (
        <SmartMatchPanel
          conversation={conversation}
          onSelectLender={handleSelectLender}
        />
      )}
      
      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto">
          {/* File Upload Controls */}
          {selectedFiles.length > 0 ? (
            <FileUploadControls
              onCameraCapture={handleCameraCapture}
              onImageSelect={handleImageSelect}
              onFileSelect={handleFileSelect}
              selectedFiles={selectedFiles}
              onRemoveFile={handleRemoveFile}
            />
          ) : (
            <div className="flex space-x-3 mb-3">
              <button 
                onClick={handleCameraCapture}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm flex items-center"
              >
                <Camera size={14} className="mr-1" /> Camera
              </button>
              <button 
                onClick={handleImageSelect}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm flex items-center"
              >
                <Image size={14} className="mr-1" /> Image
              </button>
              <button 
                onClick={handleFileSelect}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm flex items-center"
              >
                <File size={14} className="mr-1" /> File
              </button>
            </div>
          )}
          
          {/* Hidden file input for uploads */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            multiple
          />
          
          {/* Message input with intelligence menu */}
          <div className="relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputMessage);
                }
              }}
              placeholder="Ask EVA about lender matching, or update the team..."
              className="w-full resize-none bg-gray-100 border border-gray-300 rounded-lg py-3 px-4 pr-20 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            
            {/* Add Intelligence button */}
            <div className="absolute right-16 bottom-3">
              <button
                onClick={() => setShowIntelligenceMenu(!showIntelligenceMenu)}
                className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700"
                title="Add Intelligence"
              >
                <Zap size={20} />
              </button>
              
              {/* Intelligence Tools Dropdown */}
              {showIntelligenceMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  <div className="border-b border-gray-200 px-4 py-2 bg-purple-50">
                    <h3 className="font-semibold text-purple-800">Add Intelligence</h3>
                  </div>
                  <div className="py-2">
                    {intelligenceTools.map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => handleIntelligenceToolSelect(tool)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                      >
                        <span className="text-lg mr-2">{tool.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{tool.name}</div>
                          <div className="text-xs text-gray-500">{tool.description}</div>
                        </div>
                      </button>
                    ))}
                    <div className="border-t border-gray-200 mt-2 pt-2 px-4">
                      <button className="text-sm text-blue-600 flex items-center">
                        <Database size={12} className="mr-1" />
                        Manage data sources
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Send button */}
            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim()}
              className="absolute right-3 bottom-3 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
          
          {/* Input suggestions */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => setInputMessage("EVA, what are the best lender matches for this deal?")}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-xs text-gray-700"
            >
              Find lender matches
            </button>
            <button
              onClick={() => setInputMessage("EVA, analyze the borrower's credit profile")}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-xs text-gray-700"
            >
              Analyze credit profile
            </button>
            <button
              onClick={() => setInputMessage("EVA, what's the estimated closing timeline?")}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full text-xs text-gray-700"
            >
              Estimate closing timeline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationInterface; 