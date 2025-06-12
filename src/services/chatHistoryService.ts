import { debugLog } from '../utils/auditLogger';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  agentId?: string;
  agentName?: string;
  attachment?: {
    type: 'image' | 'pdf' | 'document';
    name: string;
    url: string;
  };
  bulletPoints?: string[];
  isSuggestion?: boolean;
  metadata?: Record<string, any>;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  agentId?: string;
  customerId?: string;
  transactionId?: string;
  tags?: string[];
  isStarred?: boolean;
  isPinned?: boolean;
  summary?: string;
  sentiment?: {
    score: number;
    label: 'positive' | 'neutral' | 'negative';
  };
}

export interface ChatHistoryFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  agentIds?: string[];
  customerId?: string;
  transactionId?: string;
  searchQuery?: string;
  tags?: string[];
  isStarred?: boolean;
  sentimentLabel?: 'positive' | 'neutral' | 'negative';
}

class ChatHistoryService {
  private static instance: ChatHistoryService;
  private readonly STORAGE_KEY = 'eva-chat-history';
  private readonly MAX_CONVERSATIONS = 100;
  private readonly MAX_MESSAGES_PER_CONVERSATION = 1000;
  private conversations: Map<string, ChatConversation> = new Map();

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): ChatHistoryService {
    if (!ChatHistoryService.instance) {
      ChatHistoryService.instance = new ChatHistoryService();
    }
    return ChatHistoryService.instance;
  }

  // Load conversations from localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Convert dates back to Date objects
        data.forEach((conv: any) => {
          conv.createdAt = new Date(conv.createdAt);
          conv.updatedAt = new Date(conv.updatedAt);
          conv.messages.forEach((msg: any) => {
            msg.timestamp = new Date(msg.timestamp);
          });
          this.conversations.set(conv.id, conv);
        });
      }
    } catch (error) {
      debugLog('error', 'chat_history', 'Failed to load chat history from storage', { error });
    }
  }

  // Save conversations to localStorage
  private saveToStorage(): void {
    try {
      const data = Array.from(this.conversations.values());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      debugLog('error', 'chat_history', 'Failed to save chat history to storage', { error });
    }
  }

  // Create a new conversation
  createConversation(params: {
    title?: string;
    agentId?: string;
    customerId?: string;
    transactionId?: string;
    tags?: string[];
  }): ChatConversation {
    const conversation: ChatConversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: params.title || 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      agentId: params.agentId,
      customerId: params.customerId,
      transactionId: params.transactionId,
      tags: params.tags || [],
      isStarred: false,
      isPinned: false,
    };

    // Limit total conversations
    if (this.conversations.size >= this.MAX_CONVERSATIONS) {
      // Remove oldest unpinned conversation
      const oldestUnpinned = Array.from(this.conversations.values())
        .filter(conv => !conv.isPinned)
        .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())[0];
      
      if (oldestUnpinned) {
        this.conversations.delete(oldestUnpinned.id);
      }
    }

    this.conversations.set(conversation.id, conversation);
    this.saveToStorage();
    
    debugLog('info', 'chat_history', 'Created new conversation', { conversationId: conversation.id });
    
    return conversation;
  }

  // Add a message to a conversation
  addMessage(conversationId: string, message: Omit<ChatMessage, 'id'>): ChatMessage {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Limit messages per conversation
    if (conversation.messages.length >= this.MAX_MESSAGES_PER_CONVERSATION) {
      conversation.messages.shift(); // Remove oldest message
    }

    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date();

    // Auto-generate title from first user message if not set
    if (conversation.title === 'New Conversation' && message.sender === 'user' && conversation.messages.length === 1) {
      conversation.title = this.generateTitle(message.text);
    }

    // Update sentiment analysis
    if (message.sender === 'user') {
      this.updateSentiment(conversation);
    }

    this.conversations.set(conversationId, conversation);
    this.saveToStorage();

    return newMessage;
  }

  // Generate a title from message text
  private generateTitle(text: string): string {
    const maxLength = 50;
    const cleanText = text.replace(/\n/g, ' ').trim();
    if (cleanText.length <= maxLength) {
      return cleanText;
    }
    return cleanText.substring(0, maxLength - 3) + '...';
  }

  // Update sentiment analysis for a conversation
  private updateSentiment(conversation: ChatConversation): void {
    // Simple sentiment analysis (in production, use a proper NLP service)
    const userMessages = conversation.messages
      .filter(msg => msg.sender === 'user')
      .map(msg => msg.text.toLowerCase());

    const positiveWords = ['good', 'great', 'excellent', 'helpful', 'thank', 'thanks', 'appreciate', 'perfect', 'wonderful'];
    const negativeWords = ['bad', 'poor', 'terrible', 'useless', 'waste', 'confusing', 'difficult', 'wrong', 'problem', 'issue'];

    let score = 50; // Neutral start
    userMessages.forEach(text => {
      positiveWords.forEach(word => {
        if (text.includes(word)) score += 5;
      });
      negativeWords.forEach(word => {
        if (text.includes(word)) score -= 5;
      });
    });

    score = Math.max(0, Math.min(100, score));
    
    conversation.sentiment = {
      score,
      label: score >= 70 ? 'positive' : score <= 30 ? 'negative' : 'neutral'
    };
  }

  // Get a conversation by ID
  getConversation(conversationId: string): ChatConversation | undefined {
    return this.conversations.get(conversationId);
  }

  // Get all conversations with optional filters
  getConversations(filters?: ChatHistoryFilters): ChatConversation[] {
    let conversations = Array.from(this.conversations.values());

    if (filters) {
      // Date range filter
      if (filters.dateRange) {
        conversations = conversations.filter(conv => 
          conv.updatedAt >= filters.dateRange!.start && 
          conv.updatedAt <= filters.dateRange!.end
        );
      }

      // Agent filter
      if (filters.agentIds && filters.agentIds.length > 0) {
        conversations = conversations.filter(conv => 
          filters.agentIds!.includes(conv.agentId || '')
        );
      }

      // Customer filter
      if (filters.customerId) {
        conversations = conversations.filter(conv => 
          conv.customerId === filters.customerId
        );
      }

      // Transaction filter
      if (filters.transactionId) {
        conversations = conversations.filter(conv => 
          conv.transactionId === filters.transactionId
        );
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        conversations = conversations.filter(conv => 
          conv.title.toLowerCase().includes(query) ||
          conv.messages.some(msg => msg.text.toLowerCase().includes(query)) ||
          conv.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        conversations = conversations.filter(conv => 
          conv.tags?.some(tag => filters.tags!.includes(tag))
        );
      }

      // Starred filter
      if (filters.isStarred !== undefined) {
        conversations = conversations.filter(conv => 
          conv.isStarred === filters.isStarred
        );
      }

      // Sentiment filter
      if (filters.sentimentLabel) {
        conversations = conversations.filter(conv => 
          conv.sentiment?.label === filters.sentimentLabel
        );
      }
    }

    // Sort by updated date (most recent first) with pinned items at top
    return conversations.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }

  // Update conversation metadata
  updateConversation(conversationId: string, updates: Partial<ChatConversation>): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    Object.assign(conversation, updates, { updatedAt: new Date() });
    this.conversations.set(conversationId, conversation);
    this.saveToStorage();
  }

  // Delete a conversation
  deleteConversation(conversationId: string): void {
    if (this.conversations.delete(conversationId)) {
      this.saveToStorage();
      debugLog('info', 'chat_history', 'Deleted conversation', { conversationId });
    }
  }

  // Delete multiple conversations
  deleteConversations(conversationIds: string[]): void {
    conversationIds.forEach(id => this.conversations.delete(id));
    this.saveToStorage();
    debugLog('info', 'chat_history', 'Deleted multiple conversations', { count: conversationIds.length });
  }

  // Clear all conversations
  clearAllHistory(): void {
    const pinnedConversations = Array.from(this.conversations.values()).filter(conv => conv.isPinned);
    this.conversations.clear();
    
    // Restore pinned conversations
    pinnedConversations.forEach(conv => {
      this.conversations.set(conv.id, conv);
    });
    
    this.saveToStorage();
    debugLog('info', 'chat_history', 'Cleared all non-pinned chat history');
  }

  // Export conversations
  exportConversations(conversationIds?: string[]): string {
    const conversationsToExport = conversationIds 
      ? conversationIds.map(id => this.conversations.get(id)).filter(Boolean)
      : Array.from(this.conversations.values());

    return JSON.stringify(conversationsToExport, null, 2);
  }

  // Import conversations
  importConversations(jsonData: string): void {
    try {
      const conversations = JSON.parse(jsonData);
      conversations.forEach((conv: any) => {
        // Convert dates
        conv.createdAt = new Date(conv.createdAt);
        conv.updatedAt = new Date(conv.updatedAt);
        conv.messages.forEach((msg: any) => {
          msg.timestamp = new Date(msg.timestamp);
        });
        
        // Add with new ID to avoid conflicts
        const newId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        conv.id = newId;
        this.conversations.set(newId, conv);
      });
      
      this.saveToStorage();
      debugLog('info', 'chat_history', 'Imported conversations', { count: conversations.length });
    } catch (error) {
      debugLog('error', 'chat_history', 'Failed to import conversations', { error });
      throw new Error('Failed to import conversations');
    }
  }

  // Get conversation statistics
  getStatistics(): {
    totalConversations: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
    sentimentDistribution: Record<string, number>;
    agentDistribution: Record<string, number>;
    dateRange: { start: Date | null; end: Date | null };
  } {
    const conversations = Array.from(this.conversations.values());
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
    
    const sentimentDistribution: Record<string, number> = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };
    
    const agentDistribution: Record<string, number> = {};
    
    conversations.forEach(conv => {
      if (conv.sentiment) {
        sentimentDistribution[conv.sentiment.label]++;
      }
      
      if (conv.agentId) {
        agentDistribution[conv.agentId] = (agentDistribution[conv.agentId] || 0) + 1;
      }
    });
    
    const dates = conversations.map(conv => conv.updatedAt);
    const dateRange = {
      start: dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null,
      end: dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null,
    };
    
    return {
      totalConversations: conversations.length,
      totalMessages,
      averageMessagesPerConversation: conversations.length > 0 ? totalMessages / conversations.length : 0,
      sentimentDistribution,
      agentDistribution,
      dateRange,
    };
  }

  // Search messages across all conversations
  searchMessages(query: string, options?: {
    conversationId?: string;
    agentId?: string;
    dateRange?: { start: Date; end: Date };
  }): Array<{ conversation: ChatConversation; message: ChatMessage; matchedText: string }> {
    const results: Array<{ conversation: ChatConversation; message: ChatMessage; matchedText: string }> = [];
    const searchQuery = query.toLowerCase();
    
    const conversations = options?.conversationId 
      ? [this.conversations.get(options.conversationId)].filter(Boolean)
      : Array.from(this.conversations.values());
    
    conversations.forEach(conversation => {
      if (!conversation) return;
      
      // Apply filters
      if (options?.agentId && conversation.agentId !== options.agentId) return;
      
      conversation.messages.forEach(message => {
        // Date filter
        if (options?.dateRange && (
          message.timestamp < options.dateRange.start || 
          message.timestamp > options.dateRange.end
        )) {
          return;
        }
        
        const messageText = message.text.toLowerCase();
        if (messageText.includes(searchQuery)) {
          // Extract matched context
          const index = messageText.indexOf(searchQuery);
          const contextStart = Math.max(0, index - 50);
          const contextEnd = Math.min(message.text.length, index + searchQuery.length + 50);
          const matchedText = message.text.substring(contextStart, contextEnd);
          
          results.push({
            conversation,
            message,
            matchedText: contextStart > 0 ? '...' + matchedText : matchedText + (contextEnd < message.text.length ? '...' : ''),
          });
        }
      });
    });
    
    return results;
  }
}

export default ChatHistoryService;