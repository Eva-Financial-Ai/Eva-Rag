import { Context, WorkerEnv } from '../types';

export interface AuthConfig {
  serviceId: string;
  allowedServices: string[];
  requireMTLS: boolean;
  jwtSecret: string;
}

export interface ServiceIdentity {
  serviceId: string;
  requestId: string;
  timestamp: number;
  permissions: string[];
}

export class ZeroTrustMiddleware {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  async authenticate(request: Request, env: WorkerEnv): Promise<ServiceIdentity | null> {
    // Check for mTLS certificate if required
    if (this.config.requireMTLS) {
      const tlsInfo = request.cf?.tlsClientAuth;
      if (!tlsInfo?.certPresented || !tlsInfo?.certVerified) {
        throw new Error('mTLS certificate required but not provided or invalid');
      }
    }

    // Verify service-to-service JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    try {
      const identity = await this.verifyServiceToken(token, env);
      
      // Verify service is allowed to communicate
      if (!this.config.allowedServices.includes(identity.serviceId)) {
        throw new Error(`Service ${identity.serviceId} not allowed to access ${this.config.serviceId}`);
      }

      return identity;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  private async verifyServiceToken(token: string, env: WorkerEnv): Promise<ServiceIdentity> {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    
    if (!headerB64 || !payloadB64 || !signatureB64) {
      throw new Error('Invalid token format');
    }

    // Decode header and payload
    const header = JSON.parse(atob(headerB64));
    const payload = JSON.parse(atob(payloadB64));
    
    // Verify algorithm
    if (header.alg !== 'HS256') {
      throw new Error('Unsupported algorithm');
    }
    
    // Verify signature using Web Crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(env.JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signatureData = `${headerB64}.${payloadB64}`;
    const signatureBuffer = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      encoder.encode(signatureData)
    );
    
    if (!isValid) {
      throw new Error('Invalid signature');
    }
    
    // Verify expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }

    // Verify issuer is a known service
    if (!payload.serviceId) {
      throw new Error('Missing service identifier');
    }

    return {
      serviceId: payload.serviceId,
      requestId: payload.requestId || crypto.randomUUID(),
      timestamp: Date.now(),
      permissions: payload.permissions || []
    };
  }

  async authorize(identity: ServiceIdentity, resource: string, action: string): Promise<boolean> {
    // Implement fine-grained authorization based on service permissions
    const requiredPermission = `${resource}:${action}`;
    return identity.permissions.includes(requiredPermission) || 
           identity.permissions.includes('*:*'); // Super admin permission
  }
}

// Middleware function for Cloudflare Workers
export async function withZeroTrust(
  request: Request,
  env: WorkerEnv,
  ctx: Context,
  config: AuthConfig,
  handler: (identity: ServiceIdentity) => Promise<Response>
): Promise<Response> {
  const middleware = new ZeroTrustMiddleware(config);
  
  try {
    const identity = await middleware.authenticate(request, env);
    if (!identity) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Add security headers
    const response = await handler(identity);
    response.headers.set('X-Service-ID', config.serviceId);
    response.headers.set('X-Request-ID', identity.requestId);
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    
    return response;
  } catch (error) {
    console.error('Zero Trust authentication failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Authentication failed',
      details: error.message 
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}