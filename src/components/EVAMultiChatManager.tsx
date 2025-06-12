import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import EVAAssistantWithMCP from './EVAAssistantWithMCP';
import EVAAssistantWithCustomerContext from './EVAAssistantWithCustomerContext';
import EVAWithTransactionContext from './EVAWithTransactionContext';
import EVAToolManager, { Tool } from './EVAToolManager';
import EVAToolOrchestrator, { Workflow } from './EVAToolOrchestrator';
import { useEVACustomer } from '../contexts/EVACustomerContext';
import { useEventSubscription } from '../hooks/useEventBus';

import { debugLog } from '../utils/auditLogger';
import { Customer } from '../types/Customer';

interface ChatSession {
  id: string;
  title: string;
  context?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  hasUnreadMessages?: boolean;
  lastActivity?: Date;
}

interface Transaction {
  id?: string;
  [key: string]: unknown;
}

interface EVAMultiChatManagerProps {
  currentTransaction?: Transaction;
  currentCustomer?: Customer;
}

const EVAMultiChatManager: React.FC<EVAMultiChatManagerProps> = ({
  currentTransaction,
  currentCustomer,
}) => {
  const { isEvaChatOpen, setIsEvaChatOpen } = useContext(UserContext);
  const { selectedCustomer } = useEVACustomer();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: 'main',
      title: 'EVA Assistant',
      isActive: true,
      createdAt: new Date(),
      hasUnreadMessages: false,
      lastActivity: new Date(),
    },
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('main');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);
  const [currentView, setCurrentView] = useState<'chat' | 'tools' | 'workflows' | 'transaction'>('chat');
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);

  // All hooks must be called before any conditional returns
  // Cloudflare Browser Cache for session persistence
  useEffect(() => {
    if (!isEvaChatOpen) return; // Only run when chat is open
    
    const savedSessions = localStorage.getItem('eva-chat-sessions');
    const savedActiveId = localStorage.getItem('eva-active-session');
    const savedMinimized = localStorage.getItem('eva-chat-minimized');

    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions);
        setChatSessions(sessions);
        if (savedActiveId && sessions.find((s: ChatSession) => s.id === savedActiveId)) {
          setActiveSessionId(savedActiveId);
        }
      } catch (error) {
        console.error('Failed to load chat sessions from cache:', error);
      }
    }

    if (savedMinimized) {
      setIsMinimized(savedMinimized === 'true');
    }
  }, [isEvaChatOpen]);

  // Save to cache whenever sessions change
  useEffect(() => {
    if (!isEvaChatOpen) return; // Only save when chat is open
    
    localStorage.setItem('eva-chat-sessions', JSON.stringify(chatSessions));
    localStorage.setItem('eva-active-session', activeSessionId);
    localStorage.setItem('eva-chat-minimized', isMinimized.toString());

    // Calculate total unread messages
    const unreadCount = chatSessions.reduce((count, session) => {
      return count + (session.hasUnreadMessages ? 1 : 0);
    }, 0);
    setTotalUnreadCount(unreadCount);
  }, [chatSessions, activeSessionId, isMinimized, isEvaChatOpen]);

  // Subscribe to workflow events to create contextual chat sessions
  useEventSubscription(
    ['credit-application:submitted', 'deal-structuring:initiated', 'filelock:document-uploaded'],
    (payload) => {
      // Create contextual chat session based on event
      if (payload.creditApplication && payload.creditApplication.status === 'submitted') {
        const newSession: ChatSession = {
          id: `app-${payload.creditApplication.id}`,
          title: `Credit App - ${payload.creditApplication.applicantName}`,
          context: {
            type: 'credit-application',
            applicationId: payload.creditApplication.id,
            amount: payload.creditApplication.amount
          },
          isActive: false,
          createdAt: new Date(),
          hasUnreadMessages: true,
          lastActivity: new Date(),
        };
        
        // Check if session already exists
        if (!chatSessions.find(s => s.id === newSession.id)) {
          setChatSessions(prev => [...prev, newSession]);
          
          // Show notification
          debugLog('general', 'log_statement', 'Created chat session for credit application:', newSession.id);
        }
      }
      
      if (payload.dealStructuring && payload.dealStructuring.status === 'initiated') {
        const newSession: ChatSession = {
          id: `deal-${payload.dealStructuring.transactionId}`,
          title: `Deal Structuring`,
          context: {
            type: 'deal-structuring',
            transactionId: payload.dealStructuring.transactionId
          },
          isActive: false,
          createdAt: new Date(),
          hasUnreadMessages: true,
          lastActivity: new Date(),
        };
        
        if (!chatSessions.find(s => s.id === newSession.id)) {
          setChatSessions(prev => [...prev, newSession]);
        }
      }
      
      if (payload.filelock && payload.filelock.action === 'uploaded') {
        // Update existing session with document notification
        const sessionId = payload.filelock.applicationId ? 
          `app-${payload.filelock.applicationId}` : 
          `deal-${payload.filelock.transactionId}`;
          
        setChatSessions(prev => prev.map(session => 
          session.id === sessionId ? 
            { ...session, hasUnreadMessages: true, lastActivity: new Date() } : 
            session
        ));
      }
    },
    [chatSessions]
  );

  const createNewChatSession = () => {
    if (chatSessions.length >= 6) {
      // Increased to 6 max sessions
      alert('Maximum 6 chat sessions allowed');
      return;
    }

    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: `Chat ${chatSessions.length + 1}`,
      isActive: false,
      createdAt: new Date(),
      hasUnreadMessages: false,
      lastActivity: new Date(),
    };

    setChatSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    setIsMinimized(false); // Auto-expand when creating new session
  };

  const closeChatSession = (sessionId: string) => {
    if (chatSessions.length === 1) {
      // If this is the last session, close the entire chat
      setIsEvaChatOpen(false);
      return;
    }

    const newSessions = chatSessions.filter(session => session.id !== sessionId);
    setChatSessions(newSessions);

    // If we closed the active session, switch to the first available
    if (sessionId === activeSessionId) {
      setActiveSessionId(newSessions[0]?.id || 'main');
    }
  };

  const switchToSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setIsMinimized(false); // Auto-expand when switching sessions

    // Mark session as read
    setChatSessions(prev =>
      prev.map(session =>
        session.id === sessionId ? { ...session, hasUnreadMessages: false } : session
      )
    );
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const closeEntireChat = () => {
    setIsEvaChatOpen(false);
  };

  const handleToolSelect = (tool: Tool) => {
    // Pass tool information to the active chat session
    debugLog('general', 'log_statement', 'Tool selected: ' + tool.name)
    // You could send a message to the chat about the selected tool
    // or integrate it with the MCP system
  };

  const handleWorkflowComplete = (workflow: Workflow, results: Record<string, unknown>) => {
    debugLog('general', 'log_statement', `Workflow completed: ${workflow.name}`, results);
    // Handle workflow completion - could send results to chat
  };

  const handleToolExecute = async (toolId: string, inputs: Record<string, unknown>): Promise<Record<string, unknown>> => {
    // Mock tool execution - in real implementation, this would call your MCP endpoints
    debugLog('general', 'log_statement', `Executing tool ${toolId}`, inputs);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Return mock results
    return {
      toolId,
      status: 'success',
      result: `Mock result from ${toolId}`,
      timestamp: new Date(),
      processingTime: Math.random() * 2000,
      data: {
        score: Math.random() * 100,
        recommendation: 'Sample recommendation',
        confidence: Math.random()
      }
    };
  };

  const activeSession = chatSessions.find(session => session.id === activeSessionId);

  // Now safe to have conditional returns after all hooks are called
  // If chat is not open, show the floating button (positioned to avoid navigation overlap)
  if (!isEvaChatOpen) {
    return (
      <div
        className="fixed bottom-5 z-[9999]"
        style={{ 
          right: '20px', // Position away from navigation
          left: 'auto' // Ensure it doesn't interfere with left navigation
        }}
      >
        <button
          onClick={() => setIsEvaChatOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 animate-pulse"
          title="Open EVA AI Assistant"
        >
          <div className="flex items-center justify-center">
            <span className="text-2xl">🧠</span>
          </div>
        </button>
      </div>
    );
  }

  // If minimized, show only the minimized header
  if (isMinimized) {
    return (
      <div
        className="fixed bottom-0 bg-blue-600 rounded-t-lg shadow-lg border-t-2 border-blue-500 z-[9999]"
        style={{ 
          width: '585px', // 33% bigger: 440px * 1.33 = 585px (proportional to main interface)
          right: '20px',
          left: 'auto'
        }}
      >
        <div
          className="flex items-center justify-between bg-blue-600 text-white px-4 py-3 rounded-t-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200"
          onClick={toggleMinimize}
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">🧠</span>
            <span className="text-base font-medium">EVA Assistant</span>
            {totalUnreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm px-3 py-1.5 rounded-full font-semibold">
                {totalUnreadCount}
              </span>
            )}
            <span className="text-sm opacity-75">({chatSessions.length} chats)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-white hover:bg-blue-800 px-3 py-1.5 rounded text-sm font-medium">
              ▲
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                closeEntireChat();
              }}
              className="text-white hover:bg-red-600 px-3 py-1.5 rounded text-sm font-medium"
              title="Close Chat"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-0 bg-white rounded-t-lg shadow-2xl border border-gray-200 z-[9999] eva-multi-chat-manager"
      style={{ 
        width: '1755px', // 33% bigger: 1320px * 1.33 = 1755px
        height: '1277px', // 33% bigger: 960px * 1.33 = 1277px
        maxHeight: 'calc(100vh - 30px)', // More aggressive height usage for larger interface
        right: '20px',
        left: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Tab Bar with Action Buttons */}
      <div className="flex items-center bg-gray-100 rounded-t-lg border-b border-gray-200 px-6 py-4 flex-shrink-0">
        {/* View Tabs */}
        <div className="flex space-x-1 mr-4">
          <button
            onClick={() => setCurrentView('chat')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              currentView === 'chat' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setCurrentView('tools')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              currentView === 'tools' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            🛠️ Tools
          </button>
          <button
            onClick={() => setCurrentView('workflows')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              currentView === 'workflows' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ⚙️ Workflows
          </button>
          <button
            onClick={() => setCurrentView('transaction')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
              currentView === 'transaction' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            💰 Chat with Transaction
          </button>
        </div>

        {/* Chat Tabs - Only show when in chat view */}
        {currentView === 'chat' && (
          <div className="flex flex-1 space-x-2 overflow-x-auto">
          {chatSessions.map(session => (
            <div
              key={session.id}
              className={`flex items-center min-w-0 relative ${
                session.id === activeSessionId
                  ? 'bg-white border-t-2 border-blue-500'
                  : 'bg-gray-200 hover:bg-gray-300'
              } rounded-t-md px-4 py-3 cursor-pointer transition-all duration-200`}
              onClick={() => switchToSession(session.id)}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className="text-lg">🧠</span>
                <span className="text-base font-medium truncate max-w-40">{session.title}</span>
                {session.hasUnreadMessages && (
                  <span className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></span>
                )}
                {chatSessions.length > 1 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      closeChatSession(session.id);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-2 py-1 rounded transition-colors duration-200 font-medium flex-shrink-0 ml-2"
                    title="Close Tab"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
          {/* New Chat Button */}
          {currentView === 'chat' && chatSessions.length < 6 && (
            <button
              onClick={createNewChatSession}
              className="bg-blue-600 hover:bg-blue-700 text-white text-base px-4 py-3 rounded transition-colors duration-200 font-medium"
              title="New Chat Session"
            >
              + New Chat
            </button>
          )}

          {/* Minimize Button */}
          <button
            onClick={toggleMinimize}
            className="bg-yellow-600 hover:bg-yellow-700 text-white text-base px-4 py-3 rounded transition-colors duration-200 font-medium"
            title="Minimize Chat"
          >
            ▼ Minimize
          </button>

          {/* Close Button */}
          <button
            onClick={closeEntireChat}
            className="bg-red-600 hover:bg-red-700 text-white text-base px-4 py-3 rounded transition-colors duration-200 font-medium"
            title="Close Chat"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Dynamic Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {currentView === 'chat' && activeSession && (
          selectedCustomer ? (
            <EVAAssistantWithCustomerContext
              key={`${activeSession.id}-${selectedCustomer.id}`}
              sessionId={activeSession.id}
            />
          ) : (
            <EVAAssistantWithMCP
              key={activeSession.id}
              sessionId={activeSession.id}
              sessionTitle={activeSession.title}
              currentTransaction={currentTransaction}
              currentCustomer={currentCustomer}
            />
          )
        )}

        {currentView === 'tools' && (
          <div className="h-full overflow-auto">
            <EVAToolManager
              onToolSelect={handleToolSelect}
              currentRole="universal"
              compactMode={false}
            />
          </div>
        )}

        {currentView === 'workflows' && (
          <div className="h-full overflow-auto">
            <EVAToolOrchestrator
              tools={availableTools}
              onWorkflowComplete={handleWorkflowComplete}
              onToolExecute={handleToolExecute}
            />
          </div>
        )}

        {currentView === 'transaction' && (
          <div className="h-full overflow-auto">
            <EVAWithTransactionContext />
          </div>
        )}
      </div>
    </div>
  );
};

export default EVAMultiChatManager;
