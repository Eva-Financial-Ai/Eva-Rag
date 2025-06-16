import { RAGAgent } from '../ai/document-processor';

export async function onRequest(context) {
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
    const { query, sessionId, pipeline, sources } = await context.request.json();

    // Validate required fields
    if (!query || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: query and sessionId' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Get RAG agent for the pipeline
    const ragAgent = context.env.RAG_AGENTS.get(pipeline || 'document-verification');
    if (!ragAgent) {
      return new Response(
        JSON.stringify({ error: 'Invalid RAG pipeline' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Query the RAG agent
    const response = await ragAgent.query(query, sessionId);

    // Return response
    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
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