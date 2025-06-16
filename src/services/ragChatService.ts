import { RAGResponse } from '../api/cloudflareAIService';

export type RAGPipeline = 'equipment-vehicle-rag' | 'real-estate-rag' | 'sba-rag' | 'general-lending-rag';

export interface RAGChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  sources?: RAGSource[];
  confidence?: number;
}

export interface RAGSource {
  id: string;
  name: string;
  type: string;
  confidence: number;
  snippet?: string;
}

export interface RAGUploadResult {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'processing' | 'ready' | 'error';
  error?: string;
}

export interface RAGMessageRequest {
  query: string;
  sessionId: string;
  pipeline: RAGPipeline;
  orgId: string;
  chatHistory?: RAGChatMessage[];
}

export interface RAGUploadRequest {
  files: File[];
  sessionId: string;
  pipeline: RAGPipeline;
  orgId: string;
}

class RAGChatService {
  private static instance: RAGChatService;
  private baseUrl = process.env.REACT_APP_RAG_API_URL || '/api/rag';

  public static getInstance(): RAGChatService {
    if (!RAGChatService.instance) {
      RAGChatService.instance = new RAGChatService();
    }
    return RAGChatService.instance;
  }

  async sendMessage(request: RAGMessageRequest): Promise<RAGChatMessage> {
    try {
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to get RAG response');
      }

      const ragResponse: RAGResponse = await response.json();

      let sources: RAGSource[] | undefined = undefined;
      if (Array.isArray(ragResponse.sources)) {
        sources = ragResponse.sources.map((src: any) => ({
          id: src.id || '',
          name: src.name || '',
          type: src.type || '',
          confidence: src.confidence || 0,
          snippet: src.snippet,
        }));
      }

      return {
        id: `msg-${Date.now()}`,
        text: ragResponse.result,
        sender: 'ai',
        timestamp: new Date(),
        sources,
        confidence: undefined,
      };
    } catch (error) {
      console.error('Error in RAG chat:', error);
      throw error;
    }
  }

  async uploadFiles(request: RAGUploadRequest): Promise<RAGUploadResult[]> {
    const formData = new FormData();
    request.files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('sessionId', request.sessionId);
    formData.append('pipeline', request.pipeline);
    formData.append('orgId', request.orgId);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload files');
    }

    return await response.json();
  }

  private getAuthToken(): string {
    return localStorage.getItem('eva_auth_token') || 'dev-token';
  }
}

export default RAGChatService; 