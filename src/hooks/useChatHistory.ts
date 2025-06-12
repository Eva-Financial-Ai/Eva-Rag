import { useState, useEffect, useCallback } from 'react';
import ChatHistoryService, {
  ChatConversation,
  ChatMessage,
  ChatHistoryFilters,
} from '../services/chatHistoryService';

interface UseChatHistoryOptions {
  autoLoad?: boolean;
  filters?: ChatHistoryFilters;
  onConversationChange?: (conversation: ChatConversation | null) => void;
}

export const useChatHistory = (options: UseChatHistoryOptions = {}) => {
  const { autoLoad = true, filters: initialFilters = {}, onConversationChange } = options;
  
  const chatHistoryService = ChatHistoryService.getInstance();
  
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [filters, setFilters] = useState<ChatHistoryFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversations
  const loadConversations = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedConversations = chatHistoryService.getConversations(filters);
      setConversations(loadedConversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Create a new conversation
  const createConversation = useCallback((params: {
    title?: string;
    agentId?: string;
    customerId?: string;
    transactionId?: string;
    tags?: string[];
  }) => {
    try {
      const newConversation = chatHistoryService.createConversation(params);
      setCurrentConversation(newConversation);
      loadConversations(); // Reload to update list
      return newConversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      return null;
    }
  }, [loadConversations]);

  // Select a conversation
  const selectConversation = useCallback((conversationId: string) => {
    const conversation = chatHistoryService.getConversation(conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
      if (onConversationChange) {
        onConversationChange(conversation);
      }
    }
  }, [onConversationChange]);

  // Add a message to current conversation
  const addMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    if (!currentConversation) {
      setError('No conversation selected');
      return null;
    }

    try {
      const newMessage = chatHistoryService.addMessage(currentConversation.id, message);
      
      // Update current conversation with new message
      const updatedConversation = chatHistoryService.getConversation(currentConversation.id);
      if (updatedConversation) {
        setCurrentConversation(updatedConversation);
      }
      
      // Reload conversations to update list order
      loadConversations();
      
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add message');
      return null;
    }
  }, [currentConversation, loadConversations]);

  // Update current conversation
  const updateCurrentConversation = useCallback((updates: Partial<ChatConversation>) => {
    if (!currentConversation) {
      setError('No conversation selected');
      return;
    }

    try {
      chatHistoryService.updateConversation(currentConversation.id, updates);
      
      // Reload current conversation
      const updated = chatHistoryService.getConversation(currentConversation.id);
      if (updated) {
        setCurrentConversation(updated);
      }
      
      loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update conversation');
    }
  }, [currentConversation, loadConversations]);

  // Delete a conversation
  const deleteConversation = useCallback((conversationId: string) => {
    try {
      chatHistoryService.deleteConversation(conversationId);
      
      // Clear current if it was deleted
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        if (onConversationChange) {
          onConversationChange(null);
        }
      }
      
      loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation');
    }
  }, [currentConversation, loadConversations, onConversationChange]);

  // Search messages
  const searchMessages = useCallback((query: string, searchOptions?: {
    conversationId?: string;
    agentId?: string;
    dateRange?: { start: Date; end: Date };
  }) => {
    try {
      return chatHistoryService.searchMessages(query, searchOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search messages');
      return [];
    }
  }, []);

  // Export conversations
  const exportConversations = useCallback((conversationIds?: string[]) => {
    try {
      const data = chatHistoryService.exportConversations(conversationIds);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export conversations');
    }
  }, []);

  // Import conversations
  const importConversations = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        chatHistoryService.importConversations(jsonData);
        loadConversations();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to import conversations');
      }
    };
    reader.readAsText(file);
  }, [loadConversations]);

  // Get statistics
  const getStatistics = useCallback(() => {
    try {
      return chatHistoryService.getStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get statistics');
      return null;
    }
  }, []);

  // Clear all history
  const clearAllHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all chat history? Pinned conversations will be preserved.')) {
      try {
        chatHistoryService.clearAllHistory();
        setCurrentConversation(null);
        if (onConversationChange) {
          onConversationChange(null);
        }
        loadConversations();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to clear history');
      }
    }
  }, [loadConversations, onConversationChange]);

  // Auto-load conversations on mount and filter changes
  useEffect(() => {
    if (autoLoad) {
      loadConversations();
    }
  }, [autoLoad, loadConversations]);

  return {
    // State
    conversations,
    currentConversation,
    filters,
    isLoading,
    error,
    
    // Actions
    loadConversations,
    createConversation,
    selectConversation,
    addMessage,
    updateCurrentConversation,
    deleteConversation,
    searchMessages,
    exportConversations,
    importConversations,
    getStatistics,
    clearAllHistory,
    setFilters,
    
    // Utilities
    chatHistoryService,
  };
};