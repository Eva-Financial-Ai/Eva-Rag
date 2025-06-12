import { withZeroTrust, AuthConfig } from './auth/zero-trust-middleware';
import { CircuitBreaker, createFinancialServiceCircuitBreaker } from './circuit-breaker/circuit-breaker';
import { RetryPolicy, withRetry } from './retry/retry-policy';
import { MetricsCollector } from './monitoring/metrics';
import { WorkerEnv, ExecutionContext } from './types';
import { EnvValidator } from './utils/env-validator';

export interface ServiceMeshConfig {
  serviceName: string;
  auth: AuthConfig;
  upstreamServices: Map<string, string>;
  circuitBreakers: Map<string, CircuitBreaker>;
  retryPolicy: RetryPolicy;
}

export class ServiceMeshWorker {
  private config: ServiceMeshConfig;
  private metrics: MetricsCollector;

  constructor(config: ServiceMeshConfig) {
    this.config = config;
    this.metrics = new MetricsCollector(config.serviceName);
  }

  async handleRequest(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const startTime = Date.now();

    try {
      // Apply zero-trust authentication
      return await withZeroTrust(request, env, ctx, this.config.auth, async (identity) => {
        // Route to appropriate handler based on path
        const url = new URL(request.url);
        const path = url.pathname;

        // Log the request
        await this.metrics.recordRequest(path, identity.serviceId);

        // Handle health checks
        if (path === '/health' || path === '/_health') {
          return this.handleHealthCheck(env);
        }

        // Handle metrics endpoint
        if (path === '/metrics') {
          return this.handleMetrics(env);
        }

        // Route to upstream service
        const response = await this.routeToUpstream(request, env, identity);
        
        // Record metrics
        const duration = Date.now() - startTime;
        await this.metrics.recordResponse(path, response.status, duration);

        return response;
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.metrics.recordError(request.url, error.message, duration);
      
      return new Response(JSON.stringify({
        error: 'Service mesh error',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  private async routeToUpstream(
    request: Request,
    env: WorkerEnv,
    identity: any
  ): Promise<Response> {
    const url = new URL(request.url);
    const serviceName = this.extractServiceName(url.pathname);
    
    if (!serviceName || !this.config.upstreamServices.has(serviceName)) {
      return new Response('Service not found', { status: 404 });
    }

    const upstreamUrl = this.config.upstreamServices.get(serviceName);
    const circuitBreaker = this.config.circuitBreakers.get(serviceName) || 
                          createFinancialServiceCircuitBreaker(serviceName);

    // Apply circuit breaker and retry policy
    return await circuitBreaker.execute(async () => {
      return await withRetry(async () => {
        const upstreamRequest = new Request(upstreamUrl + url.pathname, {
          method: request.method,
          headers: this.prepareUpstreamHeaders(request.headers, identity),
          body: request.body
        });

        const response = await fetch(upstreamRequest);
        
        if (!response.ok && response.status >= 500) {
          throw new Error(`Upstream service error: ${response.status}`);
        }

        return response;
      }, this.config.retryPolicy, env);
    }, env);
  }

  private prepareUpstreamHeaders(headers: Headers, identity: any): Headers {
    const upstreamHeaders = new Headers(headers);
    
    // Add service mesh headers
    upstreamHeaders.set('X-Service-Mesh', 'eva-finance');
    upstreamHeaders.set('X-Forwarded-Service', this.config.serviceName);
    upstreamHeaders.set('X-Request-ID', identity.requestId);
    upstreamHeaders.set('X-Service-Identity', identity.serviceId);
    
    // Remove sensitive headers that shouldn't be forwarded
    upstreamHeaders.delete('cf-connecting-ip');
    upstreamHeaders.delete('cf-ray');
    
    return upstreamHeaders;
  }

  private extractServiceName(pathname: string): string {
    // Extract service name from path (e.g., /api/credit-bureau/score -> credit-bureau)
    const parts = pathname.split('/').filter(p => p);
    return parts.length > 1 ? parts[1] : '';
  }

  private async handleHealthCheck(env: WorkerEnv): Promise<Response> {
    const health = {
      status: 'healthy',
      service: this.config.serviceName,
      timestamp: new Date().toISOString(),
      upstreams: {}
    };

    // Check upstream service health
    for (const [name, url] of this.config.upstreamServices) {
      try {
        const response = await fetch(`${url}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000)
        });
        health.upstreams[name] = {
          status: response.ok ? 'healthy' : 'unhealthy',
          statusCode: response.status
        };
      } catch (error) {
        health.upstreams[name] = {
          status: 'unreachable',
          error: error.message
        };
      }
    }

    // Check circuit breaker states
    const circuitStates = {};
    for (const [name, breaker] of this.config.circuitBreakers) {
      circuitStates[name] = breaker.getState();
    }

    return new Response(JSON.stringify({
      ...health,
      circuitBreakers: circuitStates
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async handleMetrics(env: WorkerEnv): Promise<Response> {
    const metrics = await this.metrics.getMetrics(env);
    
    return new Response(JSON.stringify(metrics), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Example usage for credit bureau gateway
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    // Validate environment variables
    try {
      EnvValidator.assertValid(env);
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Configuration error',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const config: ServiceMeshConfig = {
      serviceName: 'eva-api-gateway',
      auth: {
        serviceId: 'eva-api-gateway',
        allowedServices: ['eva-frontend', 'eva-admin', 'eva-mobile'],
        requireMTLS: true,
        jwtSecret: env.JWT_SECRET
      },
      upstreamServices: new Map([
        ['credit-bureau', env.CREDIT_BUREAU_URL || ''],
        ['banking', env.BANKING_API_URL || ''],
        ['document-processor', env.DOC_PROCESSOR_URL || '']
      ].filter(([_, url]) => url !== '')),
      circuitBreakers: new Map([
        ['credit-bureau', createFinancialServiceCircuitBreaker('credit-bureau', {
          failureThreshold: 3,
          resetTimeout: 60000,
          timeout: 10000
        })],
        ['banking', createFinancialServiceCircuitBreaker('banking', {
          failureThreshold: 5,
          resetTimeout: 30000,
          timeout: 15000
        })]
      ]),
      retryPolicy: {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        retryableStatuses: [502, 503, 504],
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED']
      }
    };

    const worker = new ServiceMeshWorker(config);
    return worker.handleRequest(request, env, ctx);
  }
};