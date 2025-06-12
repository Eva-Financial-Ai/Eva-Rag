/**
 * AI Query API Endpoint
 * POST /api/ai/query
 */
export async function onRequest(context) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const body = await request.json();
    const { query, model = '@cf/meta/llama-2-7b-chat-int8' } = body;

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Use Workers AI if available
    if (env.AI) {
      const aiResponse = await env.AI.run(model, {
        messages: [
          {
            role: 'system',
            content: 'You are Eva AI, a helpful financial assistant for loan and credit applications.'
          },
          {
            role: 'user',
            content: query
          }
        ]
      });

      return new Response(JSON.stringify({
        success: true,
        response: aiResponse.response,
        model: model,
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Fallback response if AI is not available
    return new Response(JSON.stringify({
      success: true,
      response: `I'm Eva AI, your financial assistant. You asked: "${query}". I'm currently in demo mode. In production, I would provide personalized financial guidance for your loan and credit needs.`,
      model: 'demo-mode',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('AI Query Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
} 