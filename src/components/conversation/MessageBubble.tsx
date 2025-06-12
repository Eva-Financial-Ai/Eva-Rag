import React, { useState } from 'react';
import { Plus, X } from '../../utils/mockIcons';
import { ConversationMessage } from '../../types/conversation';

interface MessageBubbleProps {
  message: ConversationMessage;
  isCurrentUser: boolean;
}

// Helper to format date to readable time
const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const bubbleClasses = isCurrentUser
    ? 'bg-blue-600 text-white ml-auto'
    : message.senderId === 'eva_ai'
      ? 'bg-purple-100 text-gray-800'
      : 'bg-gray-200 text-gray-800';
  
  const renderMessageContent = () => {
    // Plain text message
    if (message.messageType === 'text') {
      return <p className="whitespace-pre-line">{message.content}</p>;
    }
    
    // EVA recommendation message
    if (message.messageType === 'eva_recommendation' && message.metadata?.evaRecommendation) {
      const { evaRecommendation } = message.metadata;
      
      return (
        <div>
          <p className="whitespace-pre-line mb-3">{message.content}</p>
          
          <div className={`rounded-md p-3 ${
            showDetails ? 'bg-purple-200 bg-opacity-50' : ''
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="font-medium">EVA Analysis</span>
                <span className="ml-2 text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                  {evaRecommendation.confidence}% Confidence
                </span>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-purple-700 hover:text-purple-900"
              >
                {showDetails ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {showDetails && (
              <div className="mt-3 text-sm">
                {evaRecommendation.type === 'lender_match' && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Top Recommendation:</span>
                      <span className="font-medium">{evaRecommendation.data.topRecommendation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Speed Advantage:</span>
                      <span>{evaRecommendation.data.speedAdvantage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Term Advantage:</span>
                      <span>{evaRecommendation.data.termAdvantage}</span>
                    </div>
                  </div>
                )}
                
                {evaRecommendation.type === 'risk_assessment' && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Credit Score:</span>
                      <span className="font-medium">{evaRecommendation.data.creditScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">DSCR:</span>
                      <span>{evaRecommendation.data.dscr}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Risk Level:</span>
                      <span className="capitalize">{evaRecommendation.data.riskLevel}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return <p className="whitespace-pre-line">{message.content}</p>;
  };
  
  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-2">
        {message.attachments.map(attachment => (
          <div 
            key={attachment.id} 
            className="flex items-center bg-white bg-opacity-20 p-2 rounded"
          >
            <div className="mr-2">
              {attachment.fileType === 'image' ? (
                <div className="w-10 h-10 bg-black bg-opacity-10 rounded overflow-hidden">
                  <img 
                    src={attachment.url} 
                    alt="attachment" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 bg-black bg-opacity-10 rounded flex items-center justify-center">
                  <span className="text-xs uppercase font-bold">
                    {attachment.fileType || 'File'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{attachment.fileName}</div>
              <div className="text-xs opacity-80">{attachment.fileSize}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className={`mb-4 max-w-[85%] ${isCurrentUser ? 'ml-auto' : ''}`}>
      <div className="flex items-end mb-1">
        {!isCurrentUser && (
          <span className="text-xs text-gray-500 mr-2">{message.senderName}</span>
        )}
        <span className="text-xs text-gray-500">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <div className={`rounded-lg p-3 ${bubbleClasses}`}>
        <div>
          {renderMessageContent()}
          {renderAttachments()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble; 