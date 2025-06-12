import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  StarIcon as StarIconOutline,
  TrashIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  TagIcon,
  ChartBarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import ChatHistoryService, { ChatConversation, ChatHistoryFilters } from '../../services/chatHistoryService';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

interface ChatHistoryPanelProps {
  currentConversationId?: string;
  onSelectConversation: (conversation: ChatConversation) => void;
  onCreateNewConversation: () => void;
  className?: string;
}

const ChatHistoryPanel: React.FC<ChatHistoryPanelProps> = ({
  currentConversationId,
  onSelectConversation,
  onCreateNewConversation,
  className = '',
}) => {
  const chatHistoryService = ChatHistoryService.getInstance();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ChatHistoryFilters>({});
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [showStats, setShowStats] = useState(false);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, [filters]);

  const loadConversations = () => {
    const allConversations = chatHistoryService.getConversations({
      ...filters,
      searchQuery: searchQuery || undefined,
    });
    setConversations(allConversations);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = chatHistoryService.getConversations({
        ...filters,
        searchQuery: query,
      });
      setConversations(filtered);
    } else {
      loadConversations();
    }
  };

  // Toggle star
  const toggleStar = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      chatHistoryService.updateConversation(conversationId, {
        isStarred: !conversation.isStarred,
      });
      loadConversations();
    }
  };

  // Delete conversation
  const deleteConversation = (conversationId: string) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      chatHistoryService.deleteConversation(conversationId);
      loadConversations();
    }
  };

  // Delete selected conversations
  const deleteSelectedConversations = () => {
    if (selectedConversations.size === 0) return;
    
    const message = `Are you sure you want to delete ${selectedConversations.size} conversation${selectedConversations.size > 1 ? 's' : ''}?`;
    if (window.confirm(message)) {
      chatHistoryService.deleteConversations(Array.from(selectedConversations));
      setSelectedConversations(new Set());
      loadConversations();
    }
  };

  // Export conversations
  const exportConversations = () => {
    const toExport = selectedConversations.size > 0 
      ? Array.from(selectedConversations)
      : undefined;
    
    const data = chatHistoryService.exportConversations(toExport);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eva-chat-history-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format date for grouping
  const formatGroupDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // Group conversations by date
  const groupedConversations = conversations.reduce((groups, conversation) => {
    const date = formatGroupDate(conversation.updatedAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(conversation);
    return groups;
  }, {} as Record<string, ChatConversation[]>);

  // Get sentiment color
  const getSentimentColor = (sentiment?: { label: 'positive' | 'neutral' | 'negative' }) => {
    if (!sentiment) return 'text-gray-400';
    switch (sentiment.label) {
      case 'positive': return 'text-green-500';
      case 'neutral': return 'text-yellow-500';
      case 'negative': return 'text-red-500';
    }
  };

  // Get statistics
  const stats = chatHistoryService.getStatistics();

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
          <button
            onClick={onCreateNewConversation}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-md ${showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Filters"
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className={`p-2 rounded-md ${showStats ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Statistics"
            >
              <ChartBarIcon className="h-5 w-5" />
            </button>
            <button
              onClick={exportConversations}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
              title="Export"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
            </button>
            {selectedConversations.size > 0 && (
              <button
                onClick={deleteSelectedConversations}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                title="Delete selected"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          {selectedConversations.size > 0 && (
            <span className="text-sm text-gray-500">
              {selectedConversations.size} selected
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="space-y-3">
            {/* Date range */}
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <select
                className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-1"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'all') {
                    setFilters({ ...filters, dateRange: undefined });
                  } else {
                    const days = parseInt(value);
                    const start = new Date();
                    start.setDate(start.getDate() - days);
                    setFilters({
                      ...filters,
                      dateRange: { start, end: new Date() }
                    });
                  }
                }}
              >
                <option value="all">All time</option>
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </select>
            </div>

            {/* Sentiment filter */}
            <div className="flex items-center space-x-2">
              <TagIcon className="h-5 w-5 text-gray-400" />
              <select
                className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-1"
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({
                    ...filters,
                    sentimentLabel: value === 'all' ? undefined : value as any
                  });
                }}
              >
                <option value="all">All sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>

            {/* Starred filter */}
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    isStarred: e.target.checked ? true : undefined
                  });
                }}
              />
              <span>Starred only</span>
            </label>
          </div>
        </div>
      )}

      {/* Statistics */}
      {showStats && (
        <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Total Conversations</p>
              <p className="text-xl font-semibold">{stats.totalConversations}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Messages</p>
              <p className="text-xl font-semibold">{stats.totalMessages}</p>
            </div>
            <div>
              <p className="text-gray-600">Avg Messages/Chat</p>
              <p className="text-xl font-semibold">{Math.round(stats.averageMessagesPerConversation)}</p>
            </div>
            <div>
              <p className="text-gray-600">Sentiment</p>
              <div className="flex items-center space-x-1">
                <span className="text-green-600">😊 {stats.sentimentDistribution.positive}</span>
                <span className="text-yellow-600">😐 {stats.sentimentDistribution.neutral}</span>
                <span className="text-red-600">😟 {stats.sentimentDistribution.negative}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedConversations).map(([date, convs]) => (
          <div key={date}>
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
              {date}
            </div>
            {convs.map((conversation) => (
              <div
                key={conversation.id}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                  currentConversationId === conversation.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedConversations.has(conversation.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newSelected = new Set(selectedConversations);
                          if (e.target.checked) {
                            newSelected.add(conversation.id);
                          } else {
                            newSelected.delete(conversation.id);
                          }
                          setSelectedConversations(newSelected);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.title}
                      </h3>
                      {conversation.isPinned && (
                        <span className="text-blue-500" title="Pinned">📌</span>
                      )}
                    </div>
                    <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <ChatBubbleLeftRightIcon className="h-3 w-3 mr-1" />
                        {conversation.messages.length}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(conversation.updatedAt, { addSuffix: true })}
                      </span>
                      {conversation.sentiment && (
                        <span className={`flex items-center ${getSentimentColor(conversation.sentiment)}`}>
                          {conversation.sentiment.label === 'positive' && '😊'}
                          {conversation.sentiment.label === 'neutral' && '😐'}
                          {conversation.sentiment.label === 'negative' && '😟'}
                        </span>
                      )}
                    </div>
                    {conversation.tags && conversation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {conversation.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 ml-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(conversation.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {conversation.isStarred ? (
                        <StarIconSolid className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <StarIconOutline className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <TrashIcon className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ChatBubbleLeftRightIcon className="h-12 w-12 mb-3" />
            <p className="text-sm">No conversations yet</p>
            <button
              onClick={onCreateNewConversation}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              Start a new chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistoryPanel;