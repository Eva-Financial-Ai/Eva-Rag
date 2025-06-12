/**
 * Cloudflare Worker Entry Point for EVA Platform
 * Handles static asset serving, SPA routing, and API requests
 */

// Type definitions for Cloudflare Workers
declare global {
  interface KVNamespace {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
  }
  
  interface ExecutionContext {
    waitUntil(promise: Promise<unknown>): void;
    passThroughOnException(): void;
  }
}

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  EVA_CACHE?: KVNamespace;
  ENVIRONMENT?: string;
  APP_VERSION?: string;
}

interface CFModuleWorker {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
}

// Main Worker Handler
const worker: CFModuleWorker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    try {
      // Handle API requests
      if (url.pathname.startsWith('/api/')) {
        return handleAPIRequest(request, env);
      }

      // Handle static assets
      if (url.pathname.includes('.')) {
        return handleStaticAsset(request, env, ctx);
      }

      // Handle SPA routing - serve index.html for all other routes
      return handleSPARouting(request, env, ctx);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};

/**
 * Handle API requests with caching and security
 */
async function handleAPIRequest(request: Request, env: Env): Promise<Response> {
  const _url = new URL(request.url);
  
  // CORS headers for API requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Mock API responses for demo purposes
  const apiResponse = {
    success: true,
    data: { message: 'EVA Platform API Response', environment: env.ENVIRONMENT },
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(apiResponse), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

/**
 * Handle static assets with caching
 */
async function handleStaticAsset(
  request: Request, 
  env: Env, 
  _ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  
  try {
    // Try to get the asset from Cloudflare Assets
    const asset = await env.ASSETS.fetch(request);
    
    if (asset.status === 200) {
      // Add caching headers for static assets
      const response = new Response(asset.body, asset);
      
      // Cache static assets for 1 year
      if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      }
      
      return response;
    }
  } catch (error) {
    console.error('Asset serving error:', error);
  }
  
  return new Response('Asset not found', { status: 404 });
}

/**
 * Handle SPA routing - serve index.html for all routes
 */
async function handleSPARouting(
  request: Request, 
  env: Env, 
  _ctx: ExecutionContext
): Promise<Response> {
  try {
    // Create a new request for index.html
    const indexRequest = new Request(
      new URL('/index.html', request.url).toString(),
      {
        method: 'GET',
        headers: request.headers,
      }
    );

    // Get index.html from assets
    const indexResponse = await env.ASSETS.fetch(indexRequest);
    
    if (indexResponse.status === 200) {
      // Clone the response to modify headers
      const response = new Response(indexResponse.body, {
        status: indexResponse.status,
        statusText: indexResponse.statusText,
        headers: indexResponse.headers,
      });
      
      // Set proper headers for SPA
      response.headers.set('Content-Type', 'text/html');
      response.headers.set('Cache-Control', 'public, max-age=300'); // 5 minutes
      
      // Add security headers
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      return response;
    }
  } catch (error) {
    console.error('SPA routing error:', error);
  }
  
  return new Response('Application not found', { status: 404 });
}

// Export the worker
export default worker; 