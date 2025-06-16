/**
 * @component DocumentVerificationChat
 * @description An AI-powered chat interface for document verification and analysis
 *
 * @userStories
 * 1. As a lender, I want to interact with Eva's AI to analyze borrower documents so that I can quickly assess risk factors without manual review.
 * 2. As a borrower, I want to upload my financial documents to an interactive AI so that I can understand what information is being extracted and what it means for my application.
 * 3. As a broker, I want to facilitate document verification via an AI assistant so that I can streamline the intake process and focus on client relationships.
 * 4. As a compliance officer, I want to review AI-extracted document insights so that I can ensure regulatory requirements are met without reviewing each document manually.
 *
 * @userJourney Lender Using Document Verification
 * 1. Trigger: Lender needs to verify financial statements for a new loan application
 * 2. Entry Point: Clicks "Document Verification" in the main dashboard
 * 3. AI Greeting: Receives welcome message from Eva Financial Model AKA
 * 4. Initial Question: Selects or types in a question about borrower creditworthiness
 * 5. Document Request: AI requests relevant documents if not already uploaded
 * 6. Document Upload: Lender uploads financial statements
 * 7. Processing Indicator: Sees AI processing animation while documents are analyzed
 * 8. AI Analysis: Receives structured analysis of key financial data points
 * 9. Follow-up Questions: Asks clarifying questions about specific metrics
 * 10. Risk Assessment: Gets a risk assessment summary from the AI
 * 11. Action Recommendations: Receives recommended next steps from AI
 * 12. Export/Save: Saves analysis to loan application file
 * 13. Close: Closes the chat interface to continue loan processing
 */

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useChat } from '@/hooks/useChat';
import { useDocumentVerification } from '@/hooks/useDocumentVerification';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Paperclip, Send, FileText, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'document' | 'error';
  documentName?: string;
  documentStatus?: 'processing' | 'success' | 'error';
}

export interface DocumentVerificationChatProps {
  profile: string;
  className?: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  pipeline?: 'lender' | 'equipment' | 'realestate' | 'sba' | 'lenderlist';
}

export function DocumentVerificationChat({
  profile,
  className,
  onComplete,
  onError,
  pipeline = 'lender',
}: DocumentVerificationChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue } = useForm();
  const { sendMessage, isLoading: isChatLoading } = useChat();
  const { verifyDocument, isLoading: isVerifying } = useDocumentVerification();

  // Add debug message on component mount
  useEffect(() => {
    console.log('Chat component mounted');
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Add document message to chat
    const documentMessage: Message = {
      id: Date.now().toString(),
      content: 'Document uploaded',
      role: 'user',
      timestamp: new Date(),
      type: 'document',
      documentName: file.name,
      documentStatus: 'processing',
    };

    setMessages(prev => [...prev, documentMessage]);

    try {
      const formData = new FormData();
      formData.append('file', file as Blob);
      formData.append('pipeline', pipeline);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process document');
      }

      const result = await response.json();

      // Update document status
      setMessages(prev => prev.map(msg => 
        msg.id === documentMessage.id 
          ? { ...msg, documentStatus: 'success' }
          : msg
      ));

      // Add RAG processing message
      const ragMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Document processed successfully. ${(result as { chunks: number }).chunks} chunks indexed.`,
        role: 'assistant',
          timestamp: new Date(),
        type: 'text',
      };

      setMessages(prev => [...prev, ragMessage]);
      toast({
        title: 'Success',
        description: 'Document processed and indexed successfully',
      });

    } catch (error) {
      console.error('Document processing error:', error);
      
      // Update document status to error
      setMessages(prev => prev.map(msg => 
        msg.id === documentMessage.id 
          ? { ...msg, documentStatus: 'error' }
          : msg
      ));

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Failed to process document. Please try again.',
        role: 'assistant',
          timestamp: new Date(),
        type: 'error',
      };

      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: 'Error',
        description: 'Failed to process document',
        variant: 'destructive',
      });

      if (onError) {
        onError(error as Error);
      }
    }
  };

  const onSubmit = async (data: { message: string }) => {
    console.log('Form submitted with message:', data.message);
    
    if (!data.message.trim()) {
      console.log('Empty message, returning');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: data.message,
      role: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    console.log('Adding user message:', userMessage);
    setMessages(prev => [...prev, userMessage]);
    reset();

    try {
      setIsProcessing(true);
      console.log('Sending message to API...');
      const response = await sendMessage(data.message, pipeline);
      console.log('Received API response:', response);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
        type: 'text',
      };

      console.log('Adding assistant message:', assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Failed to send message. Please try again.',
        role: 'assistant',
          timestamp: new Date(),
        type: 'error',
      };

      console.log('Adding error message:', errorMessage);
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });

      if (onError) {
        onError(error as Error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Add debug log for messages state changes
  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
              <div
                key={message.id}
            className={cn(
              'flex items-start gap-2',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
              >
            {message.type === 'document' ? (
              <Card className="p-4 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">{message.documentName}</span>
                  {message.documentStatus === 'processing' && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {message.documentStatus === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {message.documentStatus === 'error' && (
                    <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
              </Card>
            ) : (
              <Card
                className={cn(
                  'p-4 max-w-[80%]',
                  message.type === 'error' ? 'bg-red-50' : 'bg-white'
                )}
                            >
                <p className="text-sm">{message.content}</p>
              </Card>
            )}
          </div>
        ))}
          </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 border-t">
        <div className="flex gap-2">
              <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx"
              />
          <Button
                type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            {...register('message')}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isProcessing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(onSubmit)();
              }
            }}
          />
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default DocumentVerificationChat;
