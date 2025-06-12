/**
 * Credit Application Performance Monitoring
 * Tracks key metrics for scalability and performance optimization
 */

interface PerformanceMetrics {
  formRenderTime: number;
  validationTime: number;
  submissionTime: number;
  totalInteractionTime: number;
  memoryUsage: number;
  errorCount: number;
}

interface ApplicationMetrics {
  applicationId: string;
  timestamp: string;
  metrics: PerformanceMetrics;
  userAgent: string;
  connectionType?: string;
}

class CreditApplicationMonitor {
  private static instance: CreditApplicationMonitor;
  private metrics: ApplicationMetrics[] = [];
  private startTime: number = 0;
  private renderTime: number = 0;
  private readonly BATCH_SIZE = 10;
  private readonly CLOUDFLARE_ANALYTICS_URL = process.env.REACT_APP_CF_ANALYTICS_URL || '';

  private constructor() {
    this.initializeMonitoring();
  }

  static getInstance(): CreditApplicationMonitor {
    if (!CreditApplicationMonitor.instance) {
      CreditApplicationMonitor.instance = new CreditApplicationMonitor();
    }
    return CreditApplicationMonitor.instance;
  }

  private initializeMonitoring(): void {
    // Monitor page visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.flush();
        }
      });
    }

    // Monitor before unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }

  /**
   * Start tracking form render time
   */
  startRenderTracking(): void {
    this.startTime = performance.now();
  }

  /**
   * Complete render tracking
   */
  completeRenderTracking(): void {
    this.renderTime = performance.now() - this.startTime;
    this.reportMetric('form_render_time', this.renderTime);
  }

  /**
   * Track validation performance
   */
  trackValidation(validationTime: number): void {
    this.reportMetric('validation_time', validationTime);
  }

  /**
   * Track form submission
   */
  async trackSubmission(
    applicationId: string,
    submissionTime: number,
    success: boolean
  ): Promise<void> {
    const metrics: ApplicationMetrics = {
      applicationId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      connectionType: (navigator as any).connection?.effectiveType,
      metrics: {
        formRenderTime: this.renderTime,
        validationTime: 0, // Set by trackValidation
        submissionTime,
        totalInteractionTime: performance.now() - this.startTime,
        memoryUsage: this.getMemoryUsage(),
        errorCount: success ? 0 : 1,
      },
    };

    this.metrics.push(metrics);

    // Send to Cloudflare Analytics if batch is full
    if (this.metrics.length >= this.BATCH_SIZE) {
      await this.flush();
    }

    // Report to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Credit Application Metrics:', metrics);
    }
  }

  /**
   * Track errors
   */
  trackError(error: Error, context: string): void {
    this.reportMetric('application_error', 1, {
      error: error.message,
      context,
      stack: error.stack,
    });
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Report metric to monitoring service
   */
  private reportMetric(
    name: string,
    value: number,
    metadata?: Record<string, any>
  ): void {
    // Send to Cloudflare Analytics
    if (typeof fetch !== 'undefined' && this.CLOUDFLARE_ANALYTICS_URL) {
      fetch(`${this.CLOUDFLARE_ANALYTICS_URL}/beacon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: name,
          value,
          timestamp: Date.now(),
          metadata,
        }),
        keepalive: true,
      }).catch(console.error);
    }

    // Also report to browser performance API
    if ('performance' in window && 'measure' in performance) {
      try {
        performance.measure(name, {
          start: this.startTime,
          duration: value,
        });
      } catch (e) {
        // Ignore errors from performance API
      }
    }
  }

  /**
   * Flush metrics to analytics service
   */
  private async flush(): Promise<void> {
    if (this.metrics.length === 0) return;

    try {
      const response = await fetch(`${this.CLOUDFLARE_ANALYTICS_URL}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: this.metrics,
          sessionId: this.getSessionId(),
        }),
        keepalive: true,
      });

      if (response.ok) {
        this.metrics = [];
      }
    } catch (error) {
      console.error('Failed to send metrics:', error);
    }
  }

  /**
   * Get or create session ID
   */
  private getSessionId(): string {
    const key = 'credit_app_session_id';
    let sessionId = sessionStorage.getItem(key);
    
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(key, sessionId);
    }
    
    return sessionId;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    avgRenderTime: number;
    avgSubmissionTime: number;
    errorRate: number;
    totalApplications: number;
  } {
    if (this.metrics.length === 0) {
      return {
        avgRenderTime: 0,
        avgSubmissionTime: 0,
        errorRate: 0,
        totalApplications: 0,
      };
    }

    const totalRenderTime = this.metrics.reduce(
      (sum, m) => sum + m.metrics.formRenderTime,
      0
    );
    const totalSubmissionTime = this.metrics.reduce(
      (sum, m) => sum + m.metrics.submissionTime,
      0
    );
    const totalErrors = this.metrics.reduce(
      (sum, m) => sum + m.metrics.errorCount,
      0
    );

    return {
      avgRenderTime: totalRenderTime / this.metrics.length,
      avgSubmissionTime: totalSubmissionTime / this.metrics.length,
      errorRate: totalErrors / this.metrics.length,
      totalApplications: this.metrics.length,
    };
  }
}

// Export singleton instance
export const creditAppMonitor = CreditApplicationMonitor.getInstance();

// React hook for easy integration
export function useCreditApplicationMonitoring() {
  const monitor = CreditApplicationMonitor.getInstance();

  return {
    startTracking: () => monitor.startRenderTracking(),
    completeRender: () => monitor.completeRenderTracking(),
    trackValidation: (time: number) => monitor.trackValidation(time),
    trackSubmission: (id: string, time: number, success: boolean) =>
      monitor.trackSubmission(id, time, success),
    trackError: (error: Error, context: string) =>
      monitor.trackError(error, context),
    getPerformanceSummary: () => monitor.getPerformanceSummary(),
  };
}

// Performance optimization utilities
export const performanceUtils = {
  /**
   * Debounce function for form inputs
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function for scroll events
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Measure function execution time
   */
  measureTime: async <T>(
    fn: () => Promise<T>,
    label: string
  ): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    
    return { result, duration };
  },

  /**
   * Check if browser supports required features
   */
  checkBrowserSupport: () => {
    const required = {
      fetch: 'fetch' in window,
      formData: 'FormData' in window,
      promise: 'Promise' in window,
      sessionStorage: 'sessionStorage' in window,
      performance: 'performance' in window,
    };

    const unsupported = Object.entries(required)
      .filter(([, supported]) => !supported)
      .map(([feature]) => feature);

    if (unsupported.length > 0) {
      console.warn(
        `Browser missing required features: ${unsupported.join(', ')}`
      );
    }

    return unsupported.length === 0;
  },
};