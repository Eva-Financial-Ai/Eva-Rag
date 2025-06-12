import React, { useState } from 'react';
import {
  MessageCircle,
  Users,
  Clock,
  TrendingUp,
  FileText,
  Zap,
  Target,
} from '../../utils/mockIcons';
import { TransactionConversation, User } from '../../types/conversation';
import ConversationInterface from './ConversationInterface';
import { generateId } from '../../utils/fileUtils';
import './Conversation.css';

interface TransactionConversationsProps {
  conversations: TransactionConversation[];
  selectedConversation?: string;
  onSelectConversation: (conversation: TransactionConversation) => void;
}

// Helper function to format time ago
const formatTimeAgo = (date?: Date): string => {
  if (!date) return 'Never';

  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

// Helper to create demo conversations
const createDemoConversations = (): TransactionConversation[] => {
  const now = new Date();

  // Create a current user
  const demoUser: User = {
    id: 'user-1',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'finance_manager',
    company: 'ABC Financial',
  };

  // Create some mock participants
  const participants = [
    {
      userId: demoUser.id,
      name: demoUser.name,
      role: demoUser.role,
      company: demoUser.company,
      joinedAt: new Date(now.getTime() - 86400000 * 2), // 2 days ago
      permissions: {
        canInviteUsers: true,
        canUploadDocuments: true,
        canAccessFinancials: true,
        canSubmitToLenders: true,
        canApproveDeal: false,
      },
      isOnline: true,
    },
    {
      userId: 'user-2',
      name: 'Sarah Jones',
      role: 'broker' as const,
      company: 'Elite Brokers LLC',
      joinedAt: new Date(now.getTime() - 86400000), // 1 day ago
      permissions: {
        canInviteUsers: true,
        canUploadDocuments: true,
        canAccessFinancials: true,
        canSubmitToLenders: true,
        canApproveDeal: false,
      },
      isOnline: false,
      lastSeen: new Date(now.getTime() - 3600000), // 1 hour ago
    },
    {
      userId: 'eva',
      name: 'EVA',
      role: 'eva_ai' as const,
      company: 'EVA Platform',
      joinedAt: new Date(now.getTime() - 86400000 * 2), // 2 days ago
      permissions: {
        canInviteUsers: false,
        canUploadDocuments: false,
        canAccessFinancials: true,
        canSubmitToLenders: false,
        canApproveDeal: false,
      },
      isOnline: true,
    },
  ];

  // Create some mock conversations
  return [
    {
      id: 'conv-1',
      transactionId: 'deal-1',
      title: 'XYZ Manufacturing Equipment Loan',
      borrowerName: 'XYZ Manufacturing',
      dealAmount: 750000,
      dealType: 'equipment_financing',
      status: 'in_review',
      participants,
      messages: [
        {
          id: generateId(),
          conversationId: 'conv-1',
          senderId: 'user-2',
          senderName: 'Sarah Jones',
          senderRole: 'broker',
          content:
            'I have a new equipment financing opportunity for XYZ Manufacturing. They need $750,000 for new production equipment.',
          messageType: 'text',
          timestamp: new Date(now.getTime() - 86400000), // 1 day ago
          isSystemMessage: false,
        },
        {
          id: generateId(),
          conversationId: 'conv-1',
          senderId: 'eva',
          senderName: 'EVA',
          senderRole: 'eva_ai',
          content:
            "I've analyzed the initial information for XYZ Manufacturing. Based on their industry and amount needed, I'll need their last 2 years financials and equipment details to provide lender recommendations.",
          messageType: 'text',
          timestamp: new Date(now.getTime() - 86400000 + 300000), // 1 day ago + 5 minutes
          isSystemMessage: false,
        },
        {
          id: generateId(),
          conversationId: 'conv-1',
          senderId: 'user-1',
          senderName: 'John Smith',
          senderRole: 'finance_manager',
          content:
            "I've reviewed their credit profile and they have a strong history. EVA, can you suggest the best lenders for this equipment financing deal?",
          messageType: 'text',
          timestamp: new Date(now.getTime() - 43200000), // 12 hours ago
          isSystemMessage: false,
        },
      ],
      documents: [],
      createdAt: new Date(now.getTime() - 86400000 * 2), // 2 days ago
      updatedAt: new Date(now.getTime() - 43200000), // 12 hours ago
      urgency: 'high',
      targetCloseDate: new Date(now.getTime() + 86400000 * 10), // 10 days from now
    },
    {
      id: 'conv-2',
      transactionId: 'deal-2',
      title: 'ABC Retail Working Capital',
      borrowerName: 'ABC Retail',
      dealAmount: 250000,
      dealType: 'working_capital',
      status: 'pre_qualified',
      participants: participants.slice(0, 2), // Only include the first two participants
      messages: [
        {
          id: generateId(),
          conversationId: 'conv-2',
          senderId: 'user-1',
          senderName: 'John Smith',
          senderRole: 'finance_manager',
          content: 'ABC Retail needs $250,000 in working capital for inventory expansion.',
          messageType: 'text',
          timestamp: new Date(now.getTime() - 604800000), // 7 days ago
          isSystemMessage: false,
        },
      ],
      documents: [],
      createdAt: new Date(now.getTime() - 604800000), // 7 days ago
      updatedAt: new Date(now.getTime() - 604800000), // 7 days ago
      urgency: 'medium',
    },
    {
      id: 'conv-3',
      transactionId: 'deal-3',
      title: 'Johnson Law Office Building',
      borrowerName: 'Johnson Law',
      dealAmount: 1200000,
      dealType: 'commercial_mortgage',
      status: 'prospecting',
      participants: [participants[0], participants[2]], // Include the first and third participants
      messages: [
        {
          id: generateId(),
          conversationId: 'conv-3',
          senderId: 'user-1',
          senderName: 'John Smith',
          senderRole: 'finance_manager',
          content:
            'Johnson Law is looking to purchase their office building for $1.2M. Need to discuss options.',
          messageType: 'text',
          timestamp: new Date(now.getTime() - 259200000), // 3 days ago
          isSystemMessage: false,
        },
      ],
      documents: [],
      createdAt: new Date(now.getTime() - 259200000), // 3 days ago
      updatedAt: new Date(now.getTime() - 259200000), // 3 days ago
      urgency: 'low',
    },
  ];
};

// Status Badge Component
interface StatusBadgeProps {
  status: TransactionConversation['status'];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case 'prospecting':
        return 'bg-gray-200 text-gray-800';
      case 'pre_qualified':
        return 'bg-blue-200 text-blue-800';
      case 'in_review':
        return 'bg-yellow-200 text-yellow-800';
      case 'submitted':
        return 'bg-purple-200 text-purple-800';
      case 'approved':
        return 'bg-green-200 text-green-800';
      case 'funded':
        return 'bg-green-300 text-green-900';
      case 'closed':
        return 'bg-gray-300 text-gray-900';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getLabel = () => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return <span className={`text-xs px-2 py-0.5 rounded-full ${getColor()}`}>{getLabel()}</span>;
};

// Conversation List Item Component
interface ConversationListItemProps {
  conversation: TransactionConversation;
  isSelected: boolean;
  onSelect: () => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  isSelected,
  onSelect,
}) => {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const isUrgent = conversation.urgency === 'high' || conversation.urgency === 'critical';

  return (
    <div
      onClick={onSelect}
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
        isSelected
          ? 'bg-blue-50 border-l-4 border-l-blue-500'
          : isUrgent
            ? 'border-l-4 border-l-red-500'
            : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{conversation.title}</h3>
          <p className="text-xs text-gray-500">
            {conversation.borrowerName} • ${conversation.dealAmount.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isUrgent && <Target className="w-4 h-4 text-red-500" />}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{conversation.participants.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(lastMessage?.timestamp)}</span>
        </div>
        <StatusBadge status={conversation.status} />
      </div>

      {lastMessage && (
        <p className="text-xs text-gray-600 mt-2 truncate">
          <span className="font-medium">{lastMessage.senderName}:</span> {lastMessage.content}
        </p>
      )}
    </div>
  );
};

const TransactionConversations: React.FC<TransactionConversationsProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'urgent' | 'my_deals'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'amount' | 'urgency'>('recent');

  // Get filtered conversations
  const filteredConversations = conversations.filter(conv => {
    switch (filter) {
      case 'active':
        return ['pre_qualified', 'in_review', 'submitted'].includes(conv.status);
      case 'urgent':
        return ['high', 'critical'].includes(conv.urgency);
      case 'my_deals':
        return true; // We don't have currentUser here, so show all
      default:
        return true;
    }
  });

  // Sort conversations
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return b.dealAmount - a.dealAmount;
      case 'urgency':
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return (
          urgencyOrder[a.urgency as keyof typeof urgencyOrder] -
          urgencyOrder[b.urgency as keyof typeof urgencyOrder]
        );
      case 'recent':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Deal Conversations</h2>
          <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700">
            New Deal
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['all', 'active', 'urgent', 'my_deals'].map(filterOption => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption as any)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                filter === filterOption
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Sort options */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-gray-100 border border-gray-200 rounded px-2 py-1 text-xs"
          >
            <option value="recent">Most Recent</option>
            <option value="amount">Amount</option>
            <option value="urgency">Urgency</option>
          </select>
        </div>
      </div>

      {/* Conversation List */}
      <div className="overflow-y-auto flex-1">
        {sortedConversations.map(conversation => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            isSelected={selectedConversation === conversation.id}
            onSelect={() => onSelectConversation(conversation)}
          />
        ))}
      </div>
    </div>
  );
};

export default TransactionConversations;
