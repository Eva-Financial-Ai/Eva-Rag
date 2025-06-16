import React, { useState, useEffect, useRef } from 'react';
import { RAGChatMessage, RAGPipeline, RAGUploadResult } from '../../services/ragChatService';
import RAGChatService from '../../services/ragChatService';
import { DocumentTextIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface RAGChatWidgetProps {
  orgId: string;
  sessionId: string;
  defaultPipeline?: RAGPipeline;
  onClose?: () => void;
}

const RAGChatWidget: React.FC<RAGChatWidgetProps> = ({
  orgId,
  sessionId,
  defaultPipeline = 'general-lending-rag',
  onClose,
}) => {
  const [messages, setMessages] = useState<RAGChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<RAGPipeline>(defaultPipeline);
  const [uploadResults, setUploadResults] = useState<RAGUploadResult[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ragService = RAGChatService.getInstance();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() && uploadedFiles.length === 0) return;

    // Add user message
    const userMessage: RAGChatMessage = {
      id: `msg-${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Upload files if any
      let uploadedSources: RAGUploadResult[] = [];
      if (uploadedFiles.length > 0) {
        uploadedSources = await ragService.uploadFiles({
          files: uploadedFiles,
          sessionId,
          pipeline: selectedPipeline,
          orgId,
        });
        setUploadResults(prev => [...prev, ...uploadedSources]);
      }

      // Send message to RAG
      const aiMessage = await ragService.sendMessage({
        query: inputText,
        sessionId,
        pipeline: selectedPipeline,
        orgId,
        chatHistory: messages,
      });
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: RAGChatMessage = {
        id: `error-${Date.now()}`,
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setUploadedFiles([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/icons/eva-avatar.svg"
              alt="EVA AI"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">EVA AI Assistant</h2>
              <select
                value={selectedPipeline}
                onChange={e => setSelectedPipeline(e.target.value as RAGPipeline)}
                className="mt-1 text-sm text-gray-500 border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="equipment-vehicle-rag">Equipment & Vehicle</option>
                <option value="real-estate-rag">Real Estate</option>
                <option value="sba-rag">SBA</option>
                <option value="general-lending-rag">General Lending</option>
              </select>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.text}</div>
              
              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">Sources:</p>
                  <ul className="mt-1 space-y-1">
                    {message.sources.map(source => (
                      <li key={source.id} className="text-xs text-gray-600">
                        {source.name} (Confidence: {Math.round(source.confidence * 100)}%)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-1 text-xs opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1"
              >
                <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <button
                  onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <DocumentTextIcon className="h-6 w-6" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <button
            onClick={handleSendMessage}
            disabled={isProcessing || (!inputText.trim() && uploadedFiles.length === 0)}
            className="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RAGChatWidget; 