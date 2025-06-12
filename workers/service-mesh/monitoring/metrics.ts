export interface MetricData {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p50?: number;
  p95?: number;
  p99?: number;
}

export interface ServiceMetrics {
  requests: {
    total: number;
    byPath: Record<string, number>;
    byService: Record<string, number>;
    byStatus: Record<string, number>;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    byPath: Record<string, number>;
  };
  latency: {
    overall: MetricData;
    byPath: Record<string, MetricData>;
    byService: Record<string, MetricData>;
  };
  circuitBreakers: {
    [service: string]: {
      state: string;
      failures: number;
      successRate: number;
    };
  };
  rateLimits: {
    exceeded: number;
    byService: Record<string, number>;
  };
}

export class MetricsCollector {
  private serviceName: string;
  private metrics: ServiceMetrics;
  private latencyBuckets: number[] = [];

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): ServiceMetrics {
    return {
      requests: {
        total: 0,
        byPath: {},
        byService: {},
        byStatus: {}
      },
      errors: {
        total: 0,
        byType: {},
        byPath: {}
      },
      latency: {
        overall: this.createMetricData(),
        byPath: {},
        byService: {}
      },
      circuitBreakers: {},
      rateLimits: {
        exceeded: 0,
        byService: {}
      }
    };
  }

  private createMetricData(): MetricData {
    return {
      count: 0,
      sum: 0,
      min: Infinity,
      max: 0,
      avg: 0
    };
  }

  async recordRequest(path: string, serviceId: string): Promise<void> {
    this.metrics.requests.total++;
    this.metrics.requests.byPath[path] = (this.metrics.requests.byPath[path] || 0) + 1;
    this.metrics.requests.byService[serviceId] = (this.metrics.requests.byService[serviceId] || 0) + 1;
  }

  async recordResponse(path: string, status: number, duration: number): Promise<void> {
    const statusClass = `${Math.floor(status / 100)}xx`;
    this.metrics.requests.byStatus[statusClass] = (this.metrics.requests.byStatus[statusClass] || 0) + 1;

    // Update latency metrics
    this.updateLatencyMetric(this.metrics.latency.overall, duration);
    
    if (!this.metrics.latency.byPath[path]) {
      this.metrics.latency.byPath[path] = this.createMetricData();
    }
    this.updateLatencyMetric(this.metrics.latency.byPath[path], duration);

    // Store for percentile calculations
    this.latencyBuckets.push(duration);
    if (this.latencyBuckets.length > 1000) {
      this.latencyBuckets = this.latencyBuckets.slice(-1000); // Keep last 1000
    }
  }

  async recordError(path: string, errorType: string, duration: number): Promise<void> {
    this.metrics.errors.total++;
    this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;
    this.metrics.errors.byPath[path] = (this.metrics.errors.byPath[path] || 0) + 1;
  }

  async recordCircuitBreakerState(service: string, state: string, failures: number, successRate: number): Promise<void> {
    this.metrics.circuitBreakers[service] = {
      state,
      failures,
      successRate
    };
  }

  async recordRateLimitExceeded(service: string): Promise<void> {
    this.metrics.rateLimits.exceeded++;
    this.metrics.rateLimits.byService[service] = (this.metrics.rateLimits.byService[service] || 0) + 1;
  }

  private updateLatencyMetric(metric: MetricData, duration: number): void {
    metric.count++;
    metric.sum += duration;
    metric.min = Math.min(metric.min, duration);
    metric.max = Math.max(metric.max, duration);
    metric.avg = metric.sum / metric.count;
  }

  async getMetrics(env: any): Promise<any> {
    // Calculate percentiles
    if (this.latencyBuckets.length > 0) {
      const sorted = [...this.latencyBuckets].sort((a, b) => a - b);
      this.metrics.latency.overall.p50 = this.percentile(sorted, 0.5);
      this.metrics.latency.overall.p95 = this.percentile(sorted, 0.95);
      this.metrics.latency.overall.p99 = this.percentile(sorted, 0.99);
    }

    // Format for Prometheus-style output
    const prometheusMetrics = this.formatPrometheusMetrics();

    return {
      service: this.serviceName,
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      prometheus: prometheusMetrics
    };
  }

  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  private formatPrometheusMetrics(): string {
    const lines: string[] = [];

    // Request metrics
    lines.push(`# HELP eva_requests_total Total number of requests`);
    lines.push(`# TYPE eva_requests_total counter`);
    lines.push(`eva_requests_total{service="${this.serviceName}"} ${this.metrics.requests.total}`);

    // Latency metrics
    lines.push(`# HELP eva_request_duration_seconds Request duration in seconds`);
    lines.push(`# TYPE eva_request_duration_seconds histogram`);
    lines.push(`eva_request_duration_seconds_sum{service="${this.serviceName}"} ${this.metrics.latency.overall.sum / 1000}`);
    lines.push(`eva_request_duration_seconds_count{service="${this.serviceName}"} ${this.metrics.latency.overall.count}`);

    if (this.metrics.latency.overall.p50) {
      lines.push(`eva_request_duration_seconds{service="${this.serviceName}",quantile="0.5"} ${this.metrics.latency.overall.p50 / 1000}`);
      lines.push(`eva_request_duration_seconds{service="${this.serviceName}",quantile="0.95"} ${this.metrics.latency.overall.p95 / 1000}`);
      lines.push(`eva_request_duration_seconds{service="${this.serviceName}",quantile="0.99"} ${this.metrics.latency.overall.p99 / 1000}`);
    }

    // Error metrics
    lines.push(`# HELP eva_errors_total Total number of errors`);
    lines.push(`# TYPE eva_errors_total counter`);
    lines.push(`eva_errors_total{service="${this.serviceName}"} ${this.metrics.errors.total}`);

    // Circuit breaker metrics
    for (const [service, cb] of Object.entries(this.metrics.circuitBreakers)) {
      lines.push(`# HELP eva_circuit_breaker_state Circuit breaker state (0=closed, 1=open, 2=half-open)`);
      lines.push(`# TYPE eva_circuit_breaker_state gauge`);
      const stateValue = cb.state === 'CLOSED' ? 0 : cb.state === 'OPEN' ? 1 : 2;
      lines.push(`eva_circuit_breaker_state{service="${this.serviceName}",upstream="${service}"} ${stateValue}`);
    }

    return lines.join('\n');
  }

  // Persist metrics to KV for aggregation
  async persistMetrics(env: any): Promise<void> {
    if (!env.METRICS_KV) return;

    const key = `metrics:${this.serviceName}:${Date.now()}`;
    await env.METRICS_KV.put(key, JSON.stringify(this.metrics), {
      expirationTtl: 86400 // 24 hours
    });
  }

  // Aggregate metrics from multiple workers
  static async aggregateMetrics(env: any, serviceName: string, timeWindow: number = 3600000): Promise<ServiceMetrics> {
    if (!env.METRICS_KV) {
      throw new Error('METRICS_KV not configured');
    }

    const now = Date.now();
    const startTime = now - timeWindow;
    const prefix = `metrics:${serviceName}:`;

    const list = await env.METRICS_KV.list({ prefix });
    const aggregated = new MetricsCollector(serviceName).initializeMetrics();

    for (const key of list.keys) {
      const timestamp = parseInt(key.name.split(':').pop());
      if (timestamp >= startTime) {
        const data = await env.METRICS_KV.get(key.name, { type: 'json' });
        if (data) {
          // Aggregate the metrics
          this.mergeMetrics(aggregated, data as ServiceMetrics);
        }
      }
    }

    return aggregated;
  }

  private static mergeMetrics(target: ServiceMetrics, source: ServiceMetrics): void {
    // Merge request counts
    target.requests.total += source.requests.total;
    
    // Merge maps
    for (const [key, value] of Object.entries(source.requests.byPath)) {
      target.requests.byPath[key] = (target.requests.byPath[key] || 0) + value;
    }
    
    // Continue for other metrics...
    // This is a simplified version - full implementation would merge all fields
  }
}