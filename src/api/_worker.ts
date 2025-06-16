const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or specific domain in prod
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // Cache preflight for 1 day
};

function handleOptions() {
  return new Response(null, { headers: corsHeaders });
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // ... your existing logic ...
    const response = new Response('Hello from Worker!', { status: 200 }); // Temporary placeholder

    // Robust header merge
    const newHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
}; 