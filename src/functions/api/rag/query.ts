interface Env {
  RAG_AGENTS: DurableObjectNamespace;
  AI: any;
  VECTORIZE_INDEX: any;
}

interface RAGQueryRequest {
  query: string;
  orgId: string;
  pipeline: string;
  sessionId: string;
  chatHistory?: Array<{
    text: string;
    sender: 'user' | 'ai';
    timestamp: string;
  }>;
}

export default {
  async fetch(context: any) {
    // Handle CORS
    if (context.request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      // Parse request body
      const { query, orgId, pipeline, sessionId, chatHistory } = await context.request.json() as RAGQueryRequest;

      // Validate required fields
      if (!query || !orgId || !pipeline || !sessionId) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      // Generate embedding for query
      const queryEmbedding = await context.env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: query
      });

      // Search for relevant documents
      const searchResults = await context.env.VECTORIZE_INDEX.query(
        queryEmbedding.data[0],
        {
          topK: 5,
          returnValues: true,
          returnMetadata: true,
          filter: {
            orgId,
            pipeline,
            sessionId
          }
        }
      );

      // Get relevant context
      const searchContext = searchResults.matches
        .map(match => match.metadata.text)
        .join('\n\n');

      // Generate response using LLM with context
      const response = await context.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant for EVA Financial Platform. 
                     Use the following document context to answer user questions about 
                     commercial lending, deal submissions, and financial documents.
                     
                     Context: ${searchContext}`
          },
          ...(chatHistory || []).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          {
            role: 'user',
            content: query
          }
        ]
      });

      // Return response with sources
      return new Response(
        JSON.stringify({
          answer: response.response,
          sources: searchResults.matches.map(match => ({
            id: match.metadata.documentId,
            name: match.metadata.fileName,
            type: match.metadata.fileType,
            confidence: match.score,
            snippet: match.metadata.text.substring(0, 200)
          })),
          confidence: Math.max(...searchResults.matches.map(m => m.score))
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } catch (error) {
      console.error('RAG query error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  }
}; 