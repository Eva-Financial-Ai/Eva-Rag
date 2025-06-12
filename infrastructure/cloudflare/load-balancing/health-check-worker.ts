interface HealthCheckConfig {
  services: {
    name: string;
    url: string;
    timeout: number;
    expectedStatus: number[];
    criticalService: boolean;
  }[];
  checkInterval: number;
}

interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastCheck: string;
  consecutiveFailures: number;
  details?: any;
}

export class HealthCheckWorker {
  private config: HealthCheckConfig;
  
  constructor(config: HealthCheckConfig) {
    this.config = config;
  }
  
  async performHealthChecks(env: any): Promise<ServiceHealth[]> {
    const results: ServiceHealth[] = [];
    
    for (const service of this.config.services) {
      const health = await this.checkServiceHealth(service, env);
      results.push(health);
      
      // Store health status in KV
      await this.storeHealthStatus(service.name, health, env);
    }
    
    return results;
  }
  
  private async checkServiceHealth(
    service: any,
    env: any
  ): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(service.url, {
        method: 'GET',
        headers: {
          'X-Health-Check': 'true',
          'User-Agent': 'EVA-HealthCheck/1.0'
        },
        signal: AbortSignal.timeout(service.timeout)
      });
      
      const responseTime = Date.now() - startTime;
      const isHealthy = service.expectedStatus.includes(response.status);
      
      // Get previous failure count
      const previousHealth = await this.getPreviousHealth(service.name, env);
      const consecutiveFailures = isHealthy ? 0 : (previousHealth?.consecutiveFailures || 0) + 1;
      
      // Parse response body for additional health details
      let details = {};
      try {
        if (response.headers.get('content-type')?.includes('application/json')) {
          details = await response.json();
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
      
      return {
        service: service.name,
        status: this.determineStatus(isHealthy, consecutiveFailures, service.criticalService),
        responseTime,
        lastCheck: new Date().toISOString(),
        consecutiveFailures,
        details
      };
    } catch (error) {
      const previousHealth = await this.getPreviousHealth(service.name, env);
      const consecutiveFailures = (previousHealth?.consecutiveFailures || 0) + 1;
      
      return {
        service: service.name,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        consecutiveFailures,
        details: { error: error.message }
      };
    }
  }
  
  private determineStatus(
    isHealthy: boolean,
    consecutiveFailures: number,
    isCritical: boolean
  ): 'healthy' | 'degraded' | 'unhealthy' {
    if (isHealthy) {
      return 'healthy';
    }
    
    if (isCritical || consecutiveFailures >= 3) {
      return 'unhealthy';
    }
    
    return 'degraded';
  }
  
  private async getPreviousHealth(
    serviceName: string,
    env: any
  ): Promise<ServiceHealth | null> {
    if (!env.HEALTH_KV) return null;
    
    try {
      return await env.HEALTH_KV.get(
        `health:${serviceName}`,
        { type: 'json' }
      );
    } catch {
      return null;
    }
  }
  
  private async storeHealthStatus(
    serviceName: string,
    health: ServiceHealth,
    env: any
  ): Promise<void> {
    if (!env.HEALTH_KV) return;
    
    await env.HEALTH_KV.put(
      `health:${serviceName}`,
      JSON.stringify(health),
      { expirationTtl: 300 } // 5 minutes TTL
    );
    
    // Store historical data for trending
    const historyKey = `health-history:${serviceName}:${Date.now()}`;
    await env.HEALTH_KV.put(
      historyKey,
      JSON.stringify(health),
      { expirationTtl: 86400 } // 24 hours TTL
    );
  }
  
  async getAggregatedHealth(env: any): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: ServiceHealth[];
    criticalServicesHealthy: boolean;
    lastCheck: string;
  }> {
    const services: ServiceHealth[] = [];
    
    for (const service of this.config.services) {
      const health = await this.getPreviousHealth(service.name, env);
      if (health) {
        services.push(health);
      }
    }
    
    const criticalServicesHealthy = services
      .filter(s => this.config.services.find(cs => cs.name === s.service)?.criticalService)
      .every(s => s.status === 'healthy');
    
    const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;
    
    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (!criticalServicesHealthy || unhealthyCount > 0) {
      overall = 'unhealthy';
    } else if (degradedCount > 0) {
      overall = 'degraded';
    }
    
    return {
      overall,
      services,
      criticalServicesHealthy,
      lastCheck: new Date().toISOString()
    };
  }
}

// Scheduled worker for periodic health checks
export default {
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    const config: HealthCheckConfig = {
      services: [
        {
          name: 'eva-api-gateway',
          url: 'https://eva-api-gateway.workers.dev/health',
          timeout: 5000,
          expectedStatus: [200],
          criticalService: true
        },
        {
          name: 'credit-bureau-gateway',
          url: 'https://eva-credit-gateway.workers.dev/health',
          timeout: 10000,
          expectedStatus: [200],
          criticalService: true
        },
        {
          name: 'banking-api',
          url: 'https://eva-banking-gateway.workers.dev/health',
          timeout: 10000,
          expectedStatus: [200],
          criticalService: true
        },
        {
          name: 'document-processor',
          url: 'https://eva-doc-processor.workers.dev/health',
          timeout: 15000,
          expectedStatus: [200],
          criticalService: false
        },
        {
          name: 'ai-chat',
          url: 'https://eva-ai-chat.workers.dev/health',
          timeout: 8000,
          expectedStatus: [200],
          criticalService: false
        }
      ],
      checkInterval: 60000 // 1 minute
    };
    
    const healthChecker = new HealthCheckWorker(config);
    const results = await healthChecker.performHealthChecks(env);
    
    // Check if any critical services are unhealthy
    const criticalUnhealthy = results.filter(r => 
      config.services.find(s => s.name === r.service)?.criticalService && 
      r.status === 'unhealthy'
    );
    
    if (criticalUnhealthy.length > 0) {
      // Trigger alerts
      await this.sendAlert(criticalUnhealthy, env);
    }
  },
  
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/health/aggregate') {
      const config: HealthCheckConfig = {
        services: [
          {
            name: 'eva-api-gateway',
            url: 'https://eva-api-gateway.workers.dev/health',
            timeout: 5000,
            expectedStatus: [200],
            criticalService: true
          },
          // ... other services
        ],
        checkInterval: 60000
      };
      
      const healthChecker = new HealthCheckWorker(config);
      const aggregated = await healthChecker.getAggregatedHealth(env);
      
      return new Response(JSON.stringify(aggregated), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Health Check Worker', { status: 200 });
  },
  
  async sendAlert(unhealthyServices: ServiceHealth[], env: any) {
    // Implementation would send alerts via email, Slack, PagerDuty, etc.
    console.error('Critical services unhealthy:', unhealthyServices);
  }
};