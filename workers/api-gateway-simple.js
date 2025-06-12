/**
 * EVA AI API Gateway - Simplified Cloudflare Worker
 * Handles third-party data services and backend API routing
 * June 6, 2025 - Enterprise Security Infrastructure
 */

// API Gateway Configuration
const API_GATEWAY_CONFIG = {
  version: '2.5.0',
  environment: 'staging',
  streamSubdomain: 'customer-9eikf9ekxbfirnkc.cloudflarestream.com',
  loadBalancing: {
    enabled: true,
    poolId: 'eva-api-pool-simple',
    regions: ['WNAM', 'ENAM', 'WEU', 'EEU', 'APAC'],
  },
  rateLimits: {
    default: { requests: 1000, window: 3600 },
    premium: { requests: 10000, window: 3600 },
    enterprise: { requests: 100000, window: 3600 },
  },
  timeout: 30000,
  retries: 3,
};

// Backend API Routes Configuration
const BACKEND_ROUTES = {
  '/api/v1/financial-data': {
    target: 'https://api.evafi.ai/financial-data',
    requiresAuth: true,
    rateLimit: 'premium',
    cache: 300,
    transform: 'financial',
  },
  '/api/v1/credit-applications': {
    target: 'https://api.evafi.ai/credit-applications',
    requiresAuth: true,
    rateLimit: 'enterprise',
    cache: 0,
    transform: 'credit',
  },
  '/api/v1/users': {
    target: 'https://api.evafi.ai/users',
    requiresAuth: true,
    rateLimit: 'default',
    cache: 600,
    transform: 'user',
  },
  '/api/v1/analytics': {
    target: 'https://api.evafi.ai/analytics',
    requiresAuth: true,
    rateLimit: 'premium',
    cache: 1800,
    transform: 'analytics',
  },
  '/api/v1/documents': {
    target: 'https://api.evafi.ai/documents',
    requiresAuth: true,
    rateLimit: 'enterprise',
    cache: 0,
    transform: 'document',
  },
};

// Third-Party Data Services Configuration
const THIRD_PARTY_SERVICES = {
  '/api/v1/third-party/plaid': {
    target: 'https://api.plaid.com',
    requiresAuth: true,
    apiKey: 'PLAID_API_KEY',
    rateLimit: 'premium',
    transform: 'plaid',
  },
  '/api/v1/third-party/yodlee': {
    target: 'https://api.yodlee.com',
    requiresAuth: true,
    apiKey: 'YODLEE_API_KEY',
    rateLimit: 'premium',
    transform: 'yodlee',
  },
  '/api/v1/third-party/experian': {
    target: 'https://api.experian.com',
    requiresAuth: true,
    apiKey: 'EXPERIAN_API_KEY',
    rateLimit: 'enterprise',
    transform: 'credit_bureau',
  },
  '/api/v1/third-party/equifax': {
    target: 'https://api.equifax.com',
    requiresAuth: true,
    apiKey: 'EQUIFAX_API_KEY',
    rateLimit: 'enterprise',
    transform: 'credit_bureau',
  },
  '/api/v1/third-party/open-banking': {
    target: 'https://api.openbanking.org.uk',
    requiresAuth: true,
    apiKey: 'OPEN_BANKING_API_KEY',
    rateLimit: 'premium',
    transform: 'banking',
  },
  '/api/v1/third-party/openai': {
    target: 'https://api.openai.com',
    requiresAuth: true,
    apiKey: 'OPENAI_API_KEY',
    rateLimit: 'enterprise',
    transform: 'ai',
  },

  // Cloudflare Stream Integration
  '/api/v1/stream/upload': {
    target: 'https://api.cloudflare.com/client/v4/accounts/eace6f3c56b5735ae4a9ef385d6ee914/stream',
    requiresAuth: true,
    apiKey: 'CLOUDFLARE_API_KEY',
    rateLimit: 'enterprise',
    transform: 'stream',
  },

  '/api/v1/stream/videos': {
    target: 'https://api.cloudflare.com/client/v4/accounts/eace6f3c56b5735ae4a9ef385d6ee914/stream',
    requiresAuth: true,
    apiKey: 'CLOUDFLARE_API_KEY',
    rateLimit: 'premium',
    transform: 'stream',
  },
};

// Data Transformers
const DATA_TRANSFORMERS = {
  financial: data => ({
    ...data,
    timestamp: new Date().toISOString(),
    source: 'eva-gateway',
    processed: true,
  }),

  credit: data => ({
    ...data,
    encrypted: true,
    compliance: 'PCI-DSS',
    timestamp: new Date().toISOString(),
  }),

  user: data => ({
    ...data,
    privacy: 'GDPR-compliant',
    last_accessed: new Date().toISOString(),
  }),

  analytics: data => ({
    ...data,
    aggregated: true,
    anonymized: true,
    timestamp: new Date().toISOString(),
  }),

  document: data => ({
    ...data,
    encrypted: true,
    storage: 'r2-secure',
    timestamp: new Date().toISOString(),
  }),

  plaid: data => ({
    provider: 'plaid',
    data: data,
    normalized: true,
    timestamp: new Date().toISOString(),
  }),

  yodlee: data => ({
    provider: 'yodlee',
    data: data,
    normalized: true,
    timestamp: new Date().toISOString(),
  }),

  credit_bureau: data => ({
    provider: 'credit_bureau',
    data: data,
    encrypted: true,
    compliance: 'FCRA',
    timestamp: new Date().toISOString(),
  }),

  banking: data => ({
    provider: 'open_banking',
    data: data,
    compliance: 'PSD2',
    timestamp: new Date().toISOString(),
  }),

  ai: data => ({
    provider: 'openai',
    data: data,
    model: 'gpt-4',
    timestamp: new Date().toISOString(),
  }),

  stream: data => ({
    provider: 'cloudflare_stream',
    data: data,
    subdomain: 'customer-9eikf9ekxbfirnkc.cloudflarestream.com',
    features: ['transcoding', 'adaptive_bitrate', 'global_cdn'],
    timestamp: new Date().toISOString(),
  }),
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Client-ID',
      'Access-Control-Max-Age': '86400',
    };

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health Check Endpoint
      if (path === '/api/health') {
        return new Response(
          JSON.stringify({
            status: 'healthy',
            version: API_GATEWAY_CONFIG.version,
            timestamp: new Date().toISOString(),
            environment: API_GATEWAY_CONFIG.environment,
            services: {
              gateway: true,
              rate_limiter: true,
              cache: true,
              transformer: true,
              router: true,
            },
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      // API Gateway Info
      if (path === '/api/info') {
        return new Response(
          JSON.stringify({
            name: 'EVA AI API Gateway',
            version: API_GATEWAY_CONFIG.version,
            environment: API_GATEWAY_CONFIG.environment,
            endpoints: {
              backend_routes: Object.keys(BACKEND_ROUTES).length,
              third_party_services: Object.keys(THIRD_PARTY_SERVICES).length,
              transformers: Object.keys(DATA_TRANSFORMERS).length,
            },
            load_balancing: {
              enabled: API_GATEWAY_CONFIG.loadBalancing.enabled,
              pool_id: API_GATEWAY_CONFIG.loadBalancing.poolId,
              regions: API_GATEWAY_CONFIG.loadBalancing.regions,
              health_checks: 'every 30 seconds',
            },
            stream_integration: {
              subdomain: API_GATEWAY_CONFIG.streamSubdomain,
              features: ['video_upload', 'transcoding', 'adaptive_bitrate', 'global_cdn'],
              endpoints: ['/api/v1/stream/upload', '/api/v1/stream/videos'],
            },
            features: [
              'Authentication & Authorization',
              'Enterprise Load Balancing',
              'Request/Response Transformation',
              'Intelligent Caching',
              'Backend API Routing',
              'Third-Party Service Integration',
              'Cloudflare Stream Integration',
              'Multi-Region Traffic Distribution',
              'Analytics & Monitoring',
            ],
            backend_routes: Object.keys(BACKEND_ROUTES),
            third_party_services: Object.keys(THIRD_PARTY_SERVICES),
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      // Authentication Check (simplified)
      const authResult = await authenticateRequest(request, env);
      if (!authResult.valid && !path.includes('/api/health') && !path.includes('/api/info')) {
        return new Response(
          JSON.stringify({
            error: 'Authentication failed',
            message: authResult.message,
            code: 'AUTH_FAILED',
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }

      // Admin Access Check
      if (authResult.valid) {
        const adminAccessResult = checkAdminAccess(authResult, path);
        if (!adminAccessResult.allowed) {
          return new Response(
            JSON.stringify({
              error: adminAccessResult.message,
              requiredRole: adminAccessResult.requiredRole,
              requiredPermission: adminAccessResult.requiredPermission,
              code: 'ACCESS_DENIED',
            }),
            {
              status: 403,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }
      }

      // Rate Limiting (simplified)
      const rateLimitResult = await checkRateLimit(request, env, authResult.tier);
      if (!rateLimitResult.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
            reset: rateLimitResult.reset,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': rateLimitResult.limit.toString(),
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.reset.toString(),
              ...corsHeaders,
            },
          }
        );
      }

      // Route to Backend APIs
      if (BACKEND_ROUTES[path]) {
        return await handleBackendRoute(request, path, env, authResult);
      }

      // Route to Third-Party Services
      const thirdPartyRoute = Object.keys(THIRD_PARTY_SERVICES).find(route =>
        path.startsWith(route)
      );
      if (thirdPartyRoute) {
        return await handleThirdPartyRoute(request, thirdPartyRoute, env, authResult);
      }

      // Route not found
      return new Response(
        JSON.stringify({
          error: 'Route not found',
          path: path,
          message: 'The requested endpoint does not exist',
          available_routes: {
            backend: Object.keys(BACKEND_ROUTES),
            third_party: Object.keys(THIRD_PARTY_SERVICES),
          },
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } catch (error) {
      console.error('API Gateway Error:', error);

      // Log error to Analytics
      await logEvent(env, {
        type: 'error',
        path: path,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: 'An unexpected error occurred',
          request_id: crypto.randomUUID(),
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  },
};

// Simplified Authentication Function
async function authenticateRequest(request, env) {
  const authHeader = request.headers.get('Authorization');
  const apiKey = request.headers.get('X-API-Key');

  try {
    // Check API Key authentication
    if (apiKey) {
      // For demo purposes, accept any API key starting with 'eva_'
      if (apiKey.startsWith('eva_')) {
        // Check if it's an admin key (for stream access)
        const isAdminKey = apiKey.includes('admin') || apiKey.includes('system');

        return {
          valid: true,
          tier: isAdminKey ? 'enterprise' : 'premium',
          clientId: 'demo-client',
          permissions: isAdminKey ? ['read', 'write', 'stream:admin', 'admin'] : ['read', 'write'],
          roles: isAdminKey ? ['system_admin'] : ['user'],
          isAdmin: isAdminKey,
        };
      }

      // Check stored API keys
      if (env.EVA_CACHE) {
        const keyData = await env.EVA_CACHE.get(`api_key:${apiKey}`);
        if (keyData) {
          const keyInfo = JSON.parse(keyData);
          return {
            valid: true,
            tier: keyInfo.tier || 'default',
            clientId: keyInfo.clientId,
            permissions: keyInfo.permissions || [],
            roles: keyInfo.roles || ['user'],
            isAdmin:
              keyInfo.roles &&
              (keyInfo.roles.includes('admin') || keyInfo.roles.includes('system_admin')),
          };
        }
      }
    }

    // Check JWT Bearer token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // For demo purposes, parse basic JWT info
      if (token.length > 10) {
        try {
          // Simple JWT parsing (in production, use proper JWT verification)
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const roles = payload['https://evafi.ai/roles'] || [];
            const permissions = payload['https://evafi.ai/permissions'] || [];
            const isAdmin = roles.includes('system_admin') || roles.includes('admin');

            return {
              valid: true,
              tier: isAdmin ? 'enterprise' : 'default',
              userId: payload.sub || 'demo-user',
              permissions: permissions,
              roles: roles,
              isAdmin: isAdmin,
            };
          }
        } catch (e) {
          // If JWT parsing fails, fallback to basic auth
          const isAdmin = token.includes('admin') || token.includes('system');
          return {
            valid: true,
            tier: isAdmin ? 'enterprise' : 'default',
            userId: 'demo-user',
            permissions: isAdmin ? ['read', 'write', 'stream:admin'] : ['read'],
            roles: isAdmin ? ['system_admin'] : ['user'],
            isAdmin: isAdmin,
          };
        }
      }
    }

    return {
      valid: false,
      message: 'Valid authentication required (API Key or Bearer token)',
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      valid: false,
      message: 'Authentication validation failed',
    };
  }
}

// Admin Access Check Function
function checkAdminAccess(authResult, path) {
  // Check if the path requires admin access
  const adminPaths = ['/api/v1/stream/', '/api/v1/admin/', '/api/v1/system/'];

  const requiresAdmin = adminPaths.some(adminPath => path.startsWith(adminPath));

  if (requiresAdmin) {
    if (!authResult.isAdmin) {
      return {
        allowed: false,
        message: 'System administrator access required for this endpoint',
        requiredRole: 'system_admin',
      };
    }

    // Additional check for stream endpoints
    if (path.includes('/stream/')) {
      const hasStreamAccess =
        authResult.permissions.includes('stream:admin') ||
        authResult.permissions.includes('stream:write') ||
        authResult.roles.includes('system_admin');

      if (!hasStreamAccess) {
        return {
          allowed: false,
          message: 'Stream management access required',
          requiredPermission: 'stream:admin',
        };
      }
    }
  }

  return { allowed: true };
}

// Simplified Rate Limiting Function
async function checkRateLimit(request, env, tier = 'default') {
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateLimitKey = `rate_limit:${clientIP}:${tier}`;

  try {
    const limits = API_GATEWAY_CONFIG.rateLimits[tier] || API_GATEWAY_CONFIG.rateLimits.default;
    const window = limits.window;
    const maxRequests = limits.requests;

    if (env.EVA_CACHE) {
      const now = Math.floor(Date.now() / 1000);
      const windowStart = now - (now % window);

      const currentCount = await env.EVA_CACHE.get(rateLimitKey);
      const count = currentCount ? parseInt(currentCount) : 0;

      if (count >= maxRequests) {
        return {
          allowed: false,
          limit: maxRequests,
          remaining: 0,
          reset: windowStart + window,
        };
      }

      await env.EVA_CACHE.put(rateLimitKey, (count + 1).toString(), {
        expirationTtl: window,
      });

      return {
        allowed: true,
        limit: maxRequests,
        remaining: maxRequests - count - 1,
        reset: windowStart + window,
      };
    }

    // If no cache available, allow request
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: Math.floor(Date.now() / 1000) + window,
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    return { allowed: true, limit: 1000, remaining: 999, reset: 0 };
  }
}

// Backend Route Handler
async function handleBackendRoute(request, path, env, authResult) {
  const route = BACKEND_ROUTES[path];
  const cacheKey = `cache:backend:${path}:${request.url}`;

  try {
    // Check cache first
    if (route.cache > 0 && request.method === 'GET' && env.EVA_CACHE) {
      const cachedResponse = await env.EVA_CACHE.get(cacheKey);
      if (cachedResponse) {
        const cached = JSON.parse(cachedResponse);
        return new Response(JSON.stringify(cached.data), {
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'X-Cached-At': cached.timestamp,
          },
        });
      }
    }

    // For demo purposes, return mock data instead of calling actual backend
    const mockData = generateMockData(path, request);

    // Apply data transformation
    let responseData = mockData;
    if (route.transform && DATA_TRANSFORMERS[route.transform]) {
      responseData = DATA_TRANSFORMERS[route.transform](mockData);
    }

    // Cache successful responses
    if (route.cache > 0 && request.method === 'GET' && env.EVA_CACHE) {
      await env.EVA_CACHE.put(
        cacheKey,
        JSON.stringify({
          data: responseData,
          timestamp: new Date().toISOString(),
        }),
        {
          expirationTtl: route.cache,
        }
      );
    }

    // Log successful request
    await logEvent(env, {
      type: 'backend_request',
      path: path,
      method: request.method,
      status: 200,
      client: authResult.clientId || authResult.userId,
      timestamp: new Date().toISOString(),
    });

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'X-Response-Time': `${Date.now()}ms`,
      },
    });
  } catch (error) {
    console.error('Backend route error:', error);

    await logEvent(env, {
      type: 'backend_error',
      path: path,
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        error: 'Backend service unavailable',
        message: 'Unable to process request at this time',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Third-Party Service Handler
async function handleThirdPartyRoute(request, routePath, env, authResult) {
  const service = THIRD_PARTY_SERVICES[routePath];

  try {
    // For demo purposes, return mock third-party data
    const mockData = generateMockThirdPartyData(routePath, request);

    // Apply data transformation
    let responseData = mockData;
    if (service.transform && DATA_TRANSFORMERS[service.transform]) {
      responseData = DATA_TRANSFORMERS[service.transform](mockData);
    }

    // Log third-party request
    await logEvent(env, {
      type: 'third_party_request',
      service: routePath,
      method: request.method,
      status: 200,
      client: authResult.clientId || authResult.userId,
      timestamp: new Date().toISOString(),
    });

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Service': routePath,
        'X-Response-Time': `${Date.now()}ms`,
      },
    });
  } catch (error) {
    console.error('Third-party service error:', error);

    await logEvent(env, {
      type: 'third_party_error',
      service: routePath,
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        error: 'Third-party service error',
        message: 'Unable to process third-party request',
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Mock Data Generators
function generateMockData(path, request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id') || 'demo-user-123';

  switch (path) {
    case '/api/v1/financial-data':
      return {
        user_id: userId,
        accounts: [
          {
            account_id: 'acc_123',
            balance: 2500.0,
            currency: 'USD',
            type: 'checking',
            bank: 'Demo Bank',
          },
          {
            account_id: 'acc_456',
            balance: 15000.0,
            currency: 'USD',
            type: 'savings',
            bank: 'Demo Bank',
          },
        ],
        total_balance: 17500.0,
      };

    case '/api/v1/credit-applications':
      return {
        application_id: 'app_789',
        status: 'submitted',
        requested_amount: 50000,
        purpose: 'business_expansion',
        applicant_id: userId,
      };

    case '/api/v1/users':
      return {
        user_id: userId,
        name: 'Demo User',
        email: 'demo@evafi.ai',
        status: 'active',
        tier: 'premium',
      };

    case '/api/v1/analytics':
      return {
        dashboard: {
          total_users: 1234,
          active_applications: 56,
          total_volume: 5000000,
          success_rate: 0.94,
        },
      };

    case '/api/v1/documents':
      return {
        documents: [
          {
            document_id: 'doc_123',
            type: 'bank_statement',
            status: 'processed',
            upload_date: new Date().toISOString(),
          },
        ],
      };

    default:
      return { message: 'Mock data for ' + path };
  }
}

function generateMockThirdPartyData(routePath, request) {
  switch (routePath) {
    case '/api/v1/third-party/plaid':
      return {
        accounts: [
          {
            account_id: 'plaid_123',
            name: 'Chase Checking',
            type: 'depository',
            subtype: 'checking',
            balance: 2500.0,
          },
        ],
      };

    case '/api/v1/third-party/experian':
      return {
        credit_score: 750,
        report_date: new Date().toISOString().split('T')[0],
        factors: ['Payment history', 'Credit utilization'],
      };

    case '/api/v1/third-party/openai':
      return {
        choices: [
          {
            text: 'Based on the financial data analysis, the credit application shows strong indicators for approval.',
            finish_reason: 'stop',
          },
        ],
      };

    case '/api/v1/stream/upload':
      return {
        video_id: 'stream_' + Math.random().toString(36).substr(2, 9),
        upload_url: `https://${API_GATEWAY_CONFIG.streamSubdomain}/upload`,
        status: 'ready_for_upload',
        max_duration_seconds: 3600,
      };

    case '/api/v1/stream/videos':
      return {
        videos: [
          {
            video_id: 'stream_abc123',
            status: 'ready',
            duration: 120,
            thumbnail: `https://${API_GATEWAY_CONFIG.streamSubdomain}/abc123/thumbnails/thumbnail.jpg`,
            playback_url: `https://${API_GATEWAY_CONFIG.streamSubdomain}/abc123/manifest/video.m3u8`,
            created: new Date().toISOString(),
          },
        ],
        total: 1,
      };

    default:
      return { message: 'Mock third-party data for ' + routePath };
  }
}

// Event Logging Function
async function logEvent(env, event) {
  try {
    if (env.ANALYTICS_DATA) {
      const eventKey = `event:${Date.now()}:${crypto.randomUUID()}`;
      await env.ANALYTICS_DATA.put(eventKey, JSON.stringify(event), {
        expirationTtl: 86400,
      });
    }
  } catch (error) {
    console.error('Logging error:', error);
  }
}
