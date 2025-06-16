import { sendToRAG, RAGRequest, RAGResponse } from '../api/cloudflareAIService';

export const queryRAG = async (query: string, pipeline: string = 'document-verification'): Promise<RAGResponse> => {
  return sendToRAG({ query, pipeline });
}; 