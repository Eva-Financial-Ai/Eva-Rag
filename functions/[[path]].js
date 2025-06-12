/**
 * Catch-all function for SPA routing
 * Handles all routes that are not API endpoints or static assets
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip API routes - let them go to their specific functions
  if (pathname.startsWith('/api/')) {
    return new Response(null, { status: 404 });
  }

  // Skip static assets - let them go to Cloudflare's static serving
  if (pathname.startsWith('/static/') || 
      pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json|txt|xml)$/) ||
      pathname === '/favicon.ico' ||
      pathname === '/manifest.json' ||
      pathname === '/robots.txt') {
    // Return early to let Cloudflare handle static files
    return env.ASSETS.fetch(request);
  }

  // For all other routes, serve index.html to enable SPA routing
  try {
    // Get index.html from the static assets
    const indexRequest = new Request(
      new URL('/index.html', request.url).toString(),
      {
        method: 'GET',
        headers: request.headers,
      }
    );

    // Fetch index.html from the static assets
    const indexResponse = await env.ASSETS.fetch(indexRequest);
    
    if (indexResponse.status === 200) {
      // Create a new response with the index.html content
      const response = new Response(indexResponse.body, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      });
      
      return response;
    }
  } catch (error) {
    console.error('SPA routing error:', error);
  }

  // Fallback if index.html cannot be served
  return new Response('Application not found', { 
    status: 404,
    headers: {
      'Content-Type': 'text/html',
    }
  });
} 