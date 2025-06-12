import { WorkerEnv } from '../../../workers/service-mesh/types';

export interface RateLimitConfig {
  // Global rate limits
  global: {
    requestsPerMinute: number;
    requestsPerHour: number;
    burstSize: number;
  };
  
  // Service-specific limits
  services: {
    [serviceName: string]: {
      requestsPerMinute: number;
      requestsPerHour: number;
      requestsPerDay?: number;
      costPerRequest?: number; // For financial API cost tracking
    };
  };
  
  // User-based limits
  userLimits: {
    anonymous: {
      requestsPerMinute: number;
      requestsPerHour: number;
    };
    authenticated: {
      requestsPerMinute: number;
      requestsPerHour: number;
      requestsPerDay: number;
    };
    premium: {
      requestsPerMinute: number;
      requestsPerHour: number;
      requestsPerDay: number;
    };
  };
  
  // DDoS protection thresholds
  ddosProtection: {
    enabled: boolean;
    challengeThreshold: number;
    blockThreshold: number;
    ipReputationCheck: boolean;
  };
}

// Financial services rate limiting configuration
export const financialServicesRateLimit: RateLimitConfig = {
  global: {
    requestsPerMinute: 1000,
    requestsPerHour: 30000,
    burstSize: 50
  },
  
  services: {
    'credit-bureau': {
      requestsPerMinute: 10,
      requestsPerHour: 300,
      requestsPerDay: 5000,
      costPerRequest: 0.25 // Track API costs
    },
    'banking-api': {
      requestsPerMinute: 30,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      costPerRequest: 0.10
    },
    'document-processor': {
      requestsPerMinute: 20,
      requestsPerHour: 500,
      costPerRequest: 0.05
    },
    'ai-chat': {
      requestsPerMinute: 50,
      requestsPerHour: 1500,
      costPerRequest: 0.02
    }
  },
  
  userLimits: {
    anonymous: {
      requestsPerMinute: 5,
      requestsPerHour: 50
    },
    authenticated: {
      requestsPerMinute: 30,
      requestsPerHour: 500,
      requestsPerDay: 5000
    },
    premium: {
      requestsPerMinute: 100,
      requestsPerHour: 2000,
      requestsPerDay: 20000
    }
  },
  
  ddosProtection: {
    enabled: true,
    challengeThreshold: 100, // Requests per minute before challenge
    blockThreshold: 500,     // Requests per minute before blocking
    ipReputationCheck: true
  }
};

// Cloudflare rate limiting rules generator
export function generateCloudflareRules(config: RateLimitConfig): any[] {
  const rules = [];
  
  // Global rate limit rule
  rules.push({
    description: "Global rate limit",
    match: {
      request: {
        url_path: {
          prefix: "/api/"
        }
      }
    },
    action: "challenge",
    ratelimit: {
      characteristics: ["cf.colo.id", "ip.src"],
      period: 60,
      requests_per_period: config.global.requestsPerMinute,
      mitigation_timeout: 300
    }
  });
  
  // Service-specific rules
  for (const [service, limits] of Object.entries(config.services)) {
    rules.push({
      description: `Rate limit for ${service}`,
      match: {
        request: {
          url_path: {
            prefix: `/api/${service}/`
          }
        }
      },
      action: "challenge",
      ratelimit: {
        characteristics: ["cf.colo.id", "ip.src", "http.request.headers[\"x-api-key\"]"],
        period: 60,
        requests_per_period: limits.requestsPerMinute,
        mitigation_timeout: 600,
        counting_expression: "http.request.headers[\"x-service-id\"]"
      }
    });
  }
  
  // DDoS protection rule
  if (config.ddosProtection.enabled) {
    rules.push({
      description: "DDoS protection",
      match: {
        request: {
          url_path: {
            prefix: "/"
          }
        }
      },
      action: "block",
      ratelimit: {
        characteristics: ["ip.src"],
        period: 60,
        requests_per_period: config.ddosProtection.blockThreshold,
        mitigation_timeout: 3600 // 1 hour block
      }
    });
  }
  
  return rules;
}

// Rate limiting middleware for Workers
export class RateLimiter {
  private config: RateLimitConfig;
  
  constructor(config: RateLimitConfig) {
    this.config = config;
  }
  
  async checkLimit(
    request: Request,
    env: WorkerEnv,
    userType: 'anonymous' | 'authenticated' | 'premium' = 'anonymous',
    service?: string
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const userId = request.headers.get('X-User-ID') || ip;
    const now = Date.now();
    
    // Check service-specific limits
    if (service && this.config.services[service]) {
      const serviceKey = `ratelimit:service:${service}:${userId}`;
      const serviceLimits = this.config.services[service];
      
      const serviceCheck = await this.checkServiceLimit(
        serviceKey,
        serviceLimits,
        now,
        env
      );
      
      if (!serviceCheck.allowed) {
        return serviceCheck;
      }
    }
    
    // Check user-type limits
    const userLimits = this.config.userLimits[userType];
    const userKey = `ratelimit:user:${userType}:${userId}`;
    
    return await this.checkUserLimit(userKey, userLimits, now, env);
  }
  
  private async checkServiceLimit(
    key: string,
    limits: any,
    now: number,
    env: WorkerEnv
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const window = 60000; // 1 minute window
    const resetAt = Math.ceil(now / window) * window;
    
    // Get current count from KV
    const current = await env.RATE_LIMIT_KV?.get(key, { type: 'json' }) || { count: 0, resetAt: 0 };
    
    // Reset if window expired
    if (current.resetAt < now) {
      current.count = 0;
      current.resetAt = resetAt;
    }
    
    // Check if limit exceeded
    if (current.count >= limits.requestsPerMinute) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: current.resetAt
      };
    }
    
    // Increment count
    current.count++;
    await env.RATE_LIMIT_KV?.put(key, JSON.stringify(current), {
      expirationTtl: 120 // 2 minutes TTL
    });
    
    return {
      allowed: true,
      remaining: limits.requestsPerMinute - current.count,
      resetAt: current.resetAt
    };
  }
  
  private async checkUserLimit(
    key: string,
    limits: any,
    now: number,
    env: WorkerEnv
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    // Similar implementation to checkServiceLimit
    const window = 60000; // 1 minute window
    const resetAt = Math.ceil(now / window) * window;
    
    const current = await env.RATE_LIMIT_KV?.get(key, { type: 'json' }) || { count: 0, resetAt: 0 };
    
    if (current.resetAt < now) {
      current.count = 0;
      current.resetAt = resetAt;
    }
    
    if (current.count >= limits.requestsPerMinute) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: current.resetAt
      };
    }
    
    current.count++;
    await env.RATE_LIMIT_KV?.put(key, JSON.stringify(current), {
      expirationTtl: 120
    });
    
    return {
      allowed: true,
      remaining: limits.requestsPerMinute - current.count,
      resetAt: current.resetAt
    };
  }
}

// Export rate limiting middleware
export async function withRateLimiting(
  request: Request,
  env: WorkerEnv,
  handler: () => Promise<Response>
): Promise<Response> {
  const rateLimiter = new RateLimiter(financialServicesRateLimit);
  
  // Determine user type from auth headers
  const authHeader = request.headers.get('Authorization');
  const userType = authHeader ? 'authenticated' : 'anonymous';
  
  // Extract service from path
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(p => p);
  const service = pathParts[1]; // Assuming /api/{service}/...
  
  const limitCheck = await rateLimiter.checkLimit(request, env, userType, service);
  
  if (!limitCheck.allowed) {
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((limitCheck.resetAt - Date.now()) / 1000)
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((limitCheck.resetAt - Date.now()) / 1000)),
        'X-RateLimit-Limit': String(financialServicesRateLimit.userLimits[userType].requestsPerMinute),
        'X-RateLimit-Remaining': String(limitCheck.remaining),
        'X-RateLimit-Reset': String(limitCheck.resetAt)
      }
    });
  }
  
  // Add rate limit headers to response
  const response = await handler();
  response.headers.set('X-RateLimit-Limit', String(financialServicesRateLimit.userLimits[userType].requestsPerMinute));
  response.headers.set('X-RateLimit-Remaining', String(limitCheck.remaining));
  response.headers.set('X-RateLimit-Reset', String(limitCheck.resetAt));
  
  return response;
}