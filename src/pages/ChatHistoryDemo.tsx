import React, { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import EnhancedChatInterface from '../components/chat/EnhancedChatInterface';
import { useChatHistory } from '../hooks/useChatHistory';
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const ChatHistoryDemo: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'eva' | 'risk' | 'communications'>('eva');
  
  const {
    conversations,
    currentConversation,
    getStatistics,
    clearAllHistory,
    exportConversations,
    isLoading,
    error,
  } = useChatHistory({
    autoLoad: true,
  });

  const stats = getStatistics() || {
    totalConversations: 0,
    totalMessages: 0,
    averageMessagesPerConversation: 0,
    sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
    agentDistribution: {},
    dateRange: { start: null, end: null },
  };

  return (
    <PageLayout title="Chat History Management Demo">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">EVA AI Chat with History Management</h1>
          <p className="text-lg text-gray-600">
            Experience the enhanced chat interface with comprehensive conversation history management,
            search capabilities, and analytics.
          </p>
        </div>

        {/* Statistics Dashboard */}
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
              Chat Analytics
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={() => exportConversations()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Export All
              </button>
              <button
                onClick={() => clearAllHistory()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Clear History
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-blue-900">{stats.totalConversations}</span>
              </div>
              <p className="text-sm text-blue-700 font-medium">Total Conversations</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span className="text-2xl font-bold text-green-900">{stats.totalMessages}</span>
              </div>
              <p className="text-sm text-green-700 font-medium">Total Messages</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <ClockIcon className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold text-purple-900">
                  {Math.round(stats.averageMessagesPerConversation)}
                </span>
              </div>
              <p className="text-sm text-purple-700 font-medium">Avg Messages/Chat</p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="mb-2">
                <p className="text-sm text-orange-700 font-medium mb-2">Sentiment Analysis</p>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">😊 {stats.sentimentDistribution.positive}</span>
                  <span className="text-yellow-600">😐 {stats.sentimentDistribution.neutral}</span>
                  <span className="text-red-600">😟 {stats.sentimentDistribution.negative}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range */}
          {stats.dateRange.start && stats.dateRange.end && (
            <div className="mt-6 text-sm text-gray-600 text-center">
              Conversations from {new Date(stats.dateRange.start).toLocaleDateString()} to{' '}
              {new Date(stats.dateRange.end).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🔍 Advanced Search</h3>
            <p className="text-gray-600">
              Search through all your conversations and messages with powerful filters including date ranges,
              agents, customers, and sentiment analysis.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">⭐ Conversation Management</h3>
            <p className="text-gray-600">
              Star important conversations, pin frequently accessed chats, and organize with custom tags
              for easy retrieval.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Analytics & Insights</h3>
            <p className="text-gray-600">
              Track conversation metrics, sentiment trends, and agent performance with comprehensive
              analytics and reporting.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💾 Export & Import</h3>
            <p className="text-gray-600">
              Export conversations for backup or analysis, and import previous chat histories to
              maintain continuity.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🤖 Multi-Agent Support</h3>
            <p className="text-gray-600">
              Switch between different AI agents seamlessly while maintaining conversation context
              and history.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🔐 Privacy & Security</h3>
            <p className="text-gray-600">
              All chat history is stored locally in your browser with options to clear or export
              data at any time.
            </p>
          </div>
        </div>

        {/* Chat Mode Selection */}
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Chat Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setSelectedMode('eva');
                setIsChatOpen(true);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedMode === 'eva'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900">EVA Assistant</h3>
              <p className="text-sm text-gray-600 mt-1">General financial AI assistant</p>
            </button>

            <button
              onClick={() => {
                setSelectedMode('risk');
                setIsChatOpen(true);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedMode === 'risk'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900">Risk Analysis</h3>
              <p className="text-sm text-gray-600 mt-1">Specialized risk assessment</p>
            </button>

            <button
              onClick={() => {
                setSelectedMode('communications');
                setIsChatOpen(true);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedMode === 'communications'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900">Team Communications</h3>
              <p className="text-sm text-gray-600 mt-1">Collaborative messaging</p>
            </button>
          </div>
        </div>

        {/* Recent Conversations Preview */}
        {conversations.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Conversations</h2>
            <div className="space-y-3">
              {conversations.slice(0, 5).map((conv) => (
                <div
                  key={conv.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setIsChatOpen(true)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{conv.title}</h3>
                      <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                        <span>{conv.messages.length} messages</span>
                        <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                        {conv.sentiment && (
                          <span className={`font-medium ${
                            conv.sentiment.label === 'positive' ? 'text-green-600' :
                            conv.sentiment.label === 'negative' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {conv.sentiment.label}
                          </span>
                        )}
                      </div>
                    </div>
                    {conv.isStarred && (
                      <span className="text-yellow-500">⭐</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Open Chat Button */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110"
          >
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Enhanced Chat Interface */}
      {isChatOpen && (
        <EnhancedChatInterface
          mode={selectedMode}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          initialContextPrompt="Welcome! I'm your AI assistant with full conversation history. How can I help you today?"
        />
      )}
    </PageLayout>
  );
};

export default ChatHistoryDemo;