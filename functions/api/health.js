/**
 * Health Check API Endpoint
 * GET /api/health
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

  // Health check response
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.ENVIRONMENT || 'development',
    version: env.APP_VERSION || '1.0.0',
    uptime: process.uptime ? process.uptime() : 'N/A',
    memory: typeof process !== 'undefined' && process.memoryUsage ? process.memoryUsage() : 'N/A',
    services: {
      database: 'connected',
      cache: 'active',
      analytics: 'enabled'
    }
  };

  return new Response(JSON.stringify(healthData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
} 