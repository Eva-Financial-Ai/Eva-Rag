/// <reference types="@cloudflare/workers-types" />

interface Env {
  R2_BUCKET: R2Bucket;
  Ai: any;
  equipment_vector: any;
  Lender_vector: any;
  Realestate_vector: any;
  Sba_vector: any;
  // RAG_AGENTS: DurableObjectNamespace; // Uncomment if you add Durable Objects
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

function getVectorIndexForPipeline(env: Env, pipeline: string) {
  switch (pipeline) {
    case "equipment-vehicle-rag":
      return env.equipment_vector;
    case "general-lending-rag":
      return env.Lender_vector;
    case "real-estate-rag":
      return env.Realestate_vector;
    case "sba-rag":
      return env.Sba_vector;
    default:
      throw new Error("Unknown pipeline");
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // File upload endpoint
    if (url.pathname === '/api/rag/upload' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];
        const sessionId = formData.get('sessionId') as string;
        const pipeline = formData.get('pipeline') as string;
        const orgId = formData.get('orgId') as string;

        if (!files || files.length === 0 || !sessionId || !pipeline || !orgId) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            }
          );
        }

        let vectorIndex;
        try {
          vectorIndex = getVectorIndexForPipeline(env, pipeline);
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown pipeline' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            }
          );
        }

        const results = [];
        for (const file of files) {
          try {
            const fileKey = `uploads/${orgId}/${sessionId}/${Date.now()}-${file.name}`;
            await env.R2_BUCKET.put(fileKey, file);
            const text = await file.text();
            const embedding = await env.Ai.run('@cf/baai/bge-base-en-v1.5', { text });
            const vectorId = await vectorIndex.insert({
              values: embedding.data[0],
              metadata: {
                text,
                documentId: fileKey,
                fileName: file.name,
                fileType: file.type,
                orgId,
                pipeline,
                sessionId,
                uploadDate: new Date().toISOString(),
              },
            });
            results.push({
              id: vectorId,
              name: file.name,
              type: file.type,
              size: file.size,
              status: 'ready',
            });
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            results.push({
              id: `error-${Date.now()}`,
              name: file.name,
              type: file.type,
              size: file.size,
              status: 'error',
              error: 'Failed to process file',
            });
          }
        }
        return new Response(JSON.stringify(results), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      } catch (error) {
        console.error('RAG upload error:', error);
        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        );
      }
    }

    // Query endpoint
    if (url.pathname === '/api/rag/query' && request.method === 'POST') {
      try {
        const { query, orgId, pipeline, sessionId, chatHistory } = await request.json() as RAGQueryRequest;
        if (!query || !orgId || !pipeline || !sessionId) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            }
          );
        }
        let vectorIndex;
        try {
          vectorIndex = getVectorIndexForPipeline(env, pipeline);
        } catch (err) {
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown pipeline' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            }
          );
        }
        const queryEmbedding = await env.Ai.run('@cf/baai/bge-base-en-v1.5', { text: query });
        const searchResults = await vectorIndex.query(
          queryEmbedding.data[0],
          {
            topK: 5,
            returnValues: true,
            returnMetadata: true,
            filter: { orgId, pipeline, sessionId },
          }
        );
        const contextText = searchResults.matches
          .map(match => match.metadata.text)
          .join('\n\n');
        const response = await env.Ai.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant for EVA Financial Platform. \nUse the following document context to answer user questions about commercial lending, deal submissions, and financial documents.\n\nContext: ${contextText}`
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
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        );
      } catch (error) {
        console.error('RAG query error:', error);
        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        );
      }
    }

    // Not found
    return new Response('Not found', { status: 404 });
  }
}; 