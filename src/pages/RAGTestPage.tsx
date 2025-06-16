import React from 'react';
import RAGChatWidget from '../components/chat/RAGChatWidget';

const RAGTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">RAG Chatbot Test</h1>
          <p className="text-gray-600">
            This is a test page for the RAG chatbot. You can interact with the chatbot below.
          </p>
        </div>
        
        <div className="h-[600px]">
          <RAGChatWidget
            orgId="test-org"
            sessionId={`session-${Date.now()}`}
            defaultPipeline="general-lending-rag"
          />
        </div>
      </div>
    </div>
  );
};

export default RAGTestPage; 