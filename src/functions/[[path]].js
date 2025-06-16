/**
 * Catch-all function for SPA routing
 * Handles all routes that are not API endpoints or static assets
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // ✅ Handle root "/"
  if (pathname === "/") {
    return new Response("✅ Welcome to EVA RAG API", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  // Handle API routes separately
  if (pathname.startsWith("/api/")) {
    return new Response("Not found: API endpoint is missing", { status: 404 });
  }

  // Handle static asset requests
  if (
    pathname.startsWith("/static/") ||
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json|txt|xml)$/) ||
    pathname === "/favicon.ico"
  ) {
    return env.ASSETS.fetch(request);
  }

  // Serve index.html for SPA routes
  try {
    const indexRequest = new Request(new URL("/index.html", request.url).toString(), {
      method: "GET",
      headers: request.headers,
    });

    const indexResponse = await env.ASSETS.fetch(indexRequest);
    return indexResponse;
  } catch (err) {
    return new Response("Failed to load application", { status: 500 });
  }
} 