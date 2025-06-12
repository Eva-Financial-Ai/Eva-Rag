import React from 'react';
import { ChevronLeft, Users } from '../../utils/mockIcons';
import { TransactionConversation } from '../../types/conversation';

interface ConversationHeaderProps {
  conversation: TransactionConversation;
  onInviteUser: () => void;
  onViewDeal: () => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  onInviteUser,
  onViewDeal
}) => {
  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={onViewDeal}
            className="mr-3 p-1 rounded-full hover:bg-gray-100"
            title="View Deal Details"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          
          <div>
            <h2 className="font-semibold text-gray-900">{conversation.title}</h2>
            <div className="flex items-center text-sm text-gray-500">
              <span>{conversation.participants.length} participants</span>
              <span className="mx-2">•</span>
              <span>ID: {conversation.id.substring(0, 8)}</span>
              <span className="mx-2">•</span>
              <span>Status: {conversation.status}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onInviteUser}
            className="flex items-center px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
          >
            <Users size={14} className="mr-1.5" />
            Invite
          </button>
          
          <div className="flex -space-x-1 items-center">
            {conversation.participants.slice(0, 3).map((participant, index) => (
              <div 
                key={index}
                className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center"
                title={participant.name}
              >
                <Users size={12} className="text-blue-600" />
              </div>
            ))}
            
            {conversation.participants.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700">
                +{conversation.participants.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationHeader; 