import React, { useState } from 'react';
import TransactionConversations from '../components/conversation/TransactionConversations';
import ConversationInterface from '../components/conversation/ConversationInterface';
import { TransactionConversation, User } from '../types/conversation';
import TopNavbar from '../components/layout/TopNavbar';

// Mock current user for the demo
const currentUser: User = {
  id: 'user-1',
  name: 'John Smith',
  email: 'john@evafi.com',
  role: 'finance_manager',
  company: 'EVA Financial',
  avatar: '/icons/user-avatar.png'
};

// Mock conversation data
const mockConversations: TransactionConversation[] = [
  {
    id: 'conv1',
    transactionId: 'trans1',
    title: 'Equipment Financing for XYZ Manufacturing',
    borrowerName: 'XYZ Manufacturing',
    dealAmount: 250000,
    dealType: 'equipment_financing',
    status: 'in_review',
    participants: [
      {
        userId: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        company: currentUser.company,
        joinedAt: new Date(),
        permissions: {
          canInviteUsers: true,
          canUploadDocuments: true,
          canAccessFinancials: true,
          canSubmitToLenders: true,
          canApproveDeal: true
        },
        isOnline: true
      },
      {
        userId: 'eva_ai',
        name: 'EVA AI',
        role: 'eva_ai',
        company: 'EVA Platform',
        joinedAt: new Date(),
        permissions: {
          canInviteUsers: false,
          canUploadDocuments: false,
          canAccessFinancials: true,
          canSubmitToLenders: false,
          canApproveDeal: false
        },
        isOnline: true
      }
    ],
    messages: [
      {
        id: 'msg1',
        conversationId: 'conv1',
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        content: 'I\'ve added a new equipment financing deal for XYZ Manufacturing. They\'re looking to finance $250,000 for new CNC machines.',
        messageType: 'text',
        timestamp: new Date(Date.now() - 3600000 * 3),
        isSystemMessage: false
      },
      {
        id: 'msg2',
        conversationId: 'conv1',
        senderId: 'eva_ai',
        senderName: 'EVA',
        senderRole: 'eva_ai',
        content: 'I\'ve analyzed the initial information for XYZ Manufacturing. Based on their industry and equipment type, I can help identify optimal lender matches once we have their credit profile and financials.',
        messageType: 'text',
        timestamp: new Date(Date.now() - 3600000 * 2.9),
        isSystemMessage: false
      }
    ],
    documents: [],
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 3600000 * 2.9),
    urgency: 'high',
    targetCloseDate: new Date(Date.now() + 86400000 * 14),
    usedSmartMatch: false
  },
  {
    id: 'conv2',
    transactionId: 'trans2',
    title: 'Working Capital Loan for ABC Retail',
    borrowerName: 'ABC Retail',
    dealAmount: 150000,
    dealType: 'working_capital',
    status: 'pre_qualified',
    participants: [
      {
        userId: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        company: currentUser.company,
        joinedAt: new Date(),
        permissions: {
          canInviteUsers: true,
          canUploadDocuments: true,
          canAccessFinancials: true,
          canSubmitToLenders: true,
          canApproveDeal: true
        },
        isOnline: true
      },
      {
        userId: 'eva_ai',
        name: 'EVA AI',
        role: 'eva_ai',
        company: 'EVA Platform',
        joinedAt: new Date(),
        permissions: {
          canInviteUsers: false,
          canUploadDocuments: false,
          canAccessFinancials: true,
          canSubmitToLenders: false,
          canApproveDeal: false
        },
        isOnline: true
      }
    ],
    messages: [],
    documents: [],
    createdAt: new Date(Date.now() - 86400000 * 1),
    updatedAt: new Date(Date.now() - 86400000 * 1),
    urgency: 'medium',
    targetCloseDate: new Date(Date.now() + 86400000 * 21)
  }
];

const EVAConversationDemoPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<TransactionConversation | undefined>(mockConversations[0]);

  const handleSelectConversation = (conversation: TransactionConversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <div className="h-screen bg-gray-100">
      {/* Use the TopNavbar component with showUserTypeSelector set to false */}
      <TopNavbar
        showUserTypeSelector={false}
        currentTransaction={selectedConversation?.transactionId}
      />

      <main className="max-w-6xl mx-auto p-4 h-[calc(100vh-4rem)]">
        <div className="h-full flex">
          {/* Sidebar with conversation list */}
          <div className="w-1/4 border-r border-gray-200 bg-white">
            <TransactionConversations
              conversations={mockConversations}
              onSelectConversation={handleSelectConversation}
              selectedConversation={selectedConversation?.id}
            />
          </div>

          {/* Main conversation interface */}
          <div className="w-3/4">
            <ConversationInterface
              conversation={selectedConversation}
              currentUser={currentUser}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EVAConversationDemoPage;
