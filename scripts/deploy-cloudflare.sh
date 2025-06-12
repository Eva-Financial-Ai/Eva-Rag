#!/bin/bash

# ========================================
# EVA AI Frontend - Cloudflare Deployment Script
# ========================================

set -e  # Exit on any error

echo "🚀 Starting EVA AI Frontend Cloudflare Deployment..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler is not installed. Installing...${NC}"
    npm install -g wrangler
fi

# Login to Cloudflare (if not already logged in)
echo -e "${BLUE}🔑 Checking Cloudflare authentication...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Cloudflare. Please login:${NC}"
    wrangler login
fi

# Set environment (default to staging)
ENVIRONMENT=${1:-staging}
echo -e "${BLUE}📋 Deploying to environment: ${ENVIRONMENT}${NC}"

# Build the application
echo -e "${BLUE}🏗️  Building EVA AI Frontend...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Deploy to Cloudflare Pages
echo -e "${BLUE}📄 Deploying to Cloudflare Pages...${NC}"
wrangler pages deploy dist --project-name eva-ai-frontend-${ENVIRONMENT} --compatibility-date=2024-01-01

# Create/Update KV Namespaces
echo -e "${BLUE}🗄️  Setting up KV Namespaces...${NC}"

# EVA Cache Namespace
echo "Creating EVA_CACHE namespace..."
wrangler kv:namespace create "EVA_CACHE" --env ${ENVIRONMENT} || echo "Namespace might already exist"

# User Sessions Namespace  
echo "Creating USER_SESSIONS namespace..."
wrangler kv:namespace create "USER_SESSIONS" --env ${ENVIRONMENT} || echo "Namespace might already exist"

# Analytics Data Namespace
echo "Creating ANALYTICS_DATA namespace..."
wrangler kv:namespace create "ANALYTICS_DATA" --env ${ENVIRONMENT} || echo "Namespace might already exist"

# Create/Update R2 Buckets
echo -e "${BLUE}🪣 Setting up R2 Storage Buckets...${NC}"

# Document Storage Bucket
echo "Creating eva-documents bucket..."
wrangler r2 bucket create eva-documents-${ENVIRONMENT} || echo "Bucket might already exist"

# Static Assets Bucket
echo "Creating eva-static-assets bucket..."
wrangler r2 bucket create eva-static-assets-${ENVIRONMENT} || echo "Bucket might already exist"

# Backup Storage Bucket
echo "Creating eva-backups bucket..."
wrangler r2 bucket create eva-backups-${ENVIRONMENT} || echo "Bucket might already exist"

# Set up R2 CORS for web access
echo -e "${BLUE}🔗 Configuring R2 CORS policies...${NC}"
cat > r2-cors-policy.json << EOF
[
  {
    "AllowedOrigins": [
      "https://demo.evafi.ai",
      "https://app.evafi.ai",
      "https://evafin.ai",
      "http://localhost:3006"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
EOF

# Apply CORS to buckets
wrangler r2 bucket cors put eva-documents-${ENVIRONMENT} --file r2-cors-policy.json || echo "CORS might already be set"
wrangler r2 bucket cors put eva-static-assets-${ENVIRONMENT} --file r2-cors-policy.json || echo "CORS might already be set"

# Clean up temp file
rm -f r2-cors-policy.json

# Create D1 Database
echo -e "${BLUE}🗃️  Setting up D1 Database...${NC}"
wrangler d1 create eva-main-db-${ENVIRONMENT} || echo "Database might already exist"

# Set up security headers via Workers
echo -e "${BLUE}🛡️  Deploying security Workers...${NC}"
cat > security-headers-worker.js << 'EOF'
export default {
  async fetch(request, env, ctx) {
    const response = await fetch(request);
    
    // Clone the response to make it mutable
    const newResponse = new Response(response.body, response);
    
    // Add security headers
    newResponse.headers.set('X-Frame-Options', 'DENY');
    newResponse.headers.set('X-Content-Type-Options', 'nosniff');
    newResponse.headers.set('X-XSS-Protection', '1; mode=block');
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    newResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    newResponse.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    
    // CSP header for financial security
    const csp = "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' *.auth0.com *.stripe.com *.plaid.com; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: *.cloudflare.com; " +
                "connect-src 'self' *.evafi.ai *.auth0.com *.stripe.com *.plaid.com; " +
                "frame-src 'self' *.auth0.com *.stripe.com *.plaid.com";
    
    newResponse.headers.set('Content-Security-Policy', csp);
    
    return newResponse;
  },
};
EOF

# Deploy security worker
wrangler deploy security-headers-worker.js --name eva-security-headers-${ENVIRONMENT} --env ${ENVIRONMENT}

# Set up Durable Objects (if needed)
echo -e "${BLUE}🎯 Setting up Durable Objects...${NC}"
cat > durable-objects-worker.js << 'EOF'
export class EvaChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
  }

  async fetch(request) {
    const url = new URL(request.url);
    
    switch (url.pathname) {
      case '/websocket':
        return this.handleWebSocket(request);
      case '/api/chat/history':
        return this.getChatHistory();
      default:
        return new Response('Not found', { status: 404 });
    }
  }

  async handleWebSocket(request) {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    server.accept();
    
    // Handle real-time EVA chat functionality
    server.addEventListener('message', event => {
      const data = JSON.parse(event.data);
      // Process EVA AI chat messages
      this.broadcastMessage(data);
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  broadcastMessage(message) {
    // Broadcast to all connected clients
    this.sessions.forEach(session => {
      session.send(JSON.stringify(message));
    });
  }

  async getChatHistory() {
    const history = await this.state.storage.get('chat_history') || [];
    return new Response(JSON.stringify(history), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export class UserSessionManager {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    switch (request.method) {
      case 'GET':
        return this.getSession(sessionId);
      case 'POST':
        return this.createSession(request);
      case 'PUT':
        return this.updateSession(sessionId, request);
      case 'DELETE':
        return this.deleteSession(sessionId);
      default:
        return new Response('Method not allowed', { status: 405 });
    }
  }

  async getSession(sessionId) {
    const session = await this.state.storage.get(sessionId);
    return new Response(JSON.stringify(session || {}), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async createSession(request) {
    const sessionData = await request.json();
    const sessionId = crypto.randomUUID();
    
    await this.state.storage.put(sessionId, {
      ...sessionData,
      createdAt: Date.now(),
      lastActive: Date.now()
    });

    return new Response(JSON.stringify({ sessionId }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async updateSession(sessionId, request) {
    const updates = await request.json();
    const existing = await this.state.storage.get(sessionId) || {};
    
    await this.state.storage.put(sessionId, {
      ...existing,
      ...updates,
      lastActive: Date.now()
    });

    return new Response(JSON.stringify({ success: true }));
  }

  async deleteSession(sessionId) {
    await this.state.storage.delete(sessionId);
    return new Response(JSON.stringify({ success: true }));
  }
}

export default {
  async fetch(request, env, ctx) {
    return new Response('EVA AI Durable Objects Worker', { status: 200 });
  }
};
EOF

# Deploy Durable Objects worker
wrangler deploy durable-objects-worker.js --name eva-durable-objects-${ENVIRONMENT} --env ${ENVIRONMENT}

# Set up Analytics and Monitoring
echo -e "${BLUE}📊 Setting up Analytics Workers...${NC}"
cat > analytics-worker.js << 'EOF'
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/analytics/')) {
      return this.handleAnalytics(request, env);
    }
    
    return new Response('Analytics endpoint', { status: 200 });
  },

  async handleAnalytics(request, env) {
    const eventData = await request.json();
    
    // Store analytics data in KV
    const timestamp = Date.now();
    const key = `analytics:${timestamp}:${crypto.randomUUID()}`;
    
    await env.ANALYTICS_DATA.put(key, JSON.stringify({
      ...eventData,
      timestamp,
      userAgent: request.headers.get('User-Agent'),
      ip: request.headers.get('CF-Connecting-IP'),
      country: request.cf?.country
    }));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
EOF

# Deploy analytics worker
wrangler deploy analytics-worker.js --name eva-analytics-${ENVIRONMENT} --env ${ENVIRONMENT}

# Clean up temporary files
rm -f security-headers-worker.js durable-objects-worker.js analytics-worker.js

# Set up DNS routing (if needed)
echo -e "${BLUE}🌐 DNS and Routing configuration...${NC}"
if [ "$ENVIRONMENT" = "staging" ]; then
    echo "Staging deployment complete: https://demo.evafi.ai"
elif [ "$ENVIRONMENT" = "production" ]; then
    echo "Production deployment complete: https://app.evafi.ai"
fi

# Final security check
echo -e "${BLUE}🔒 Running post-deployment security checks...${NC}"

# Check if secrets are set
echo "Checking required secrets..."
REQUIRED_SECRETS=(
    "AUTH0_CLIENT_SECRET"
    "PLAID_SECRET_KEY" 
    "STRIPE_SECRET_KEY"
    "ENCRYPTION_KEY"
    "TWILIO_AUTH_TOKEN"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
    if ! wrangler secret list --env ${ENVIRONMENT} | grep -q "$secret"; then
        echo -e "${YELLOW}⚠️  Warning: Secret '$secret' not found. Set it with:${NC}"
        echo "   wrangler secret put $secret --env ${ENVIRONMENT}"
    fi
done

echo ""
echo -e "${GREEN}🎉 EVA AI Frontend Cloudflare Deployment Complete!${NC}"
echo "=================================================="
echo -e "${BLUE}Environment:${NC} $ENVIRONMENT"
echo -e "${BLUE}Pages URL:${NC} https://eva-ai-frontend-${ENVIRONMENT}.pages.dev"
echo -e "${BLUE}Custom Domain:${NC} $([ "$ENVIRONMENT" = "production" ] && echo "https://app.evafi.ai" || echo "https://demo.evafi.ai")"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Set up required secrets using 'wrangler secret put'"
echo "2. Configure Auth0 callback URLs"
echo "3. Test all financial integrations"
echo "4. Monitor deployment in Cloudflare Dashboard"
echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}" 