import { debugLog } from '../utils/auditLogger';

// Real-time performance monitoring system for production
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  component?: string;
  category: 'timing' | 'counter' | 'gauge' | 'user' | 'business';
  tags?: Record<string, string>;
}

export interface PerformanceThresholds {
  critical: number;
  warning: number;
  normal: number;
}

class RealTimePerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private thresholds: Map<string, PerformanceThresholds> = new Map();
  private alertCallbacks: Array<(metric: PerformanceMetric, level: 'critical' | 'warning') => void> = [];
  private bufferSize = 100;
  private flushInterval = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.setupDefaultThresholds();
    this.startPerformanceObservers();
    this.startAutoFlush();
  }

  private setupDefaultThresholds() {
    // Component render times
    this.thresholds.set('render', { critical: 100, warning: 50, normal: 16 });
    
    // Page load metrics
    this.thresholds.set('page-load', { critical: 5000, warning: 3000, normal: 1000 });
    this.thresholds.set('first-contentful-paint', { critical: 3000, warning: 1800, normal: 1000 });
    this.thresholds.set('largest-contentful-paint', { critical: 4000, warning: 2500, normal: 1500 });
    
    // API response times
    this.thresholds.set('api-response', { critical: 2000, warning: 1000, normal: 500 });
    
    // Bundle size metrics
    this.thresholds.set('bundle-size', { critical: 500000, warning: 300000, normal: 200000 });
    
    // Memory usage
    this.thresholds.set('memory', { critical: 100, warning: 75, normal: 50 });
    
    // User interactions
    this.thresholds.set('interaction', { critical: 200, warning: 100, normal: 50 });
  }

  private startPerformanceObservers() {
    // Navigation timing observer
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.trackNavigationMetrics(navEntry);
            }
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navObserver);
      } catch (e) {
        console.warn('Navigation timing observer not supported');
      }

      // Paint timing observer
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: entry.name,
              value: entry.startTime,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'timing',
              tags: { type: 'paint' }
            });
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('paint', paintObserver);
      } catch (e) {
        console.warn('Paint timing observer not supported');
      }

      // Largest Contentful Paint observer
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'largest-contentful-paint',
              value: entry.startTime,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'timing',
              tags: { type: 'lcp' }
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // Layout shift observer
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'cumulative-layout-shift',
              value: (entry as any).value,
              unit: 'score',
              timestamp: Date.now(),
              category: 'gauge',
              tags: { type: 'cls' }
            });
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // Long task observer
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'long-task',
              value: entry.duration,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'timing',
              tags: { type: 'blocking' }
            });
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (e) {
        console.warn('Long task observer not supported');
      }
    }
  }

  private trackNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics = [
      { name: 'dns-lookup', value: entry.domainLookupEnd - entry.domainLookupStart },
      { name: 'tcp-connect', value: entry.connectEnd - entry.connectStart },
      { name: 'request-response', value: entry.responseEnd - entry.requestStart },
      { name: 'dom-content-loaded', value: entry.domContentLoadedEventEnd - entry.fetchStart },
      { name: 'page-load', value: entry.loadEventEnd - entry.fetchStart },
    ];

    metrics.forEach(metric => {
      if (metric.value > 0) {
        this.recordMetric({
          name: metric.name,
          value: metric.value,
          unit: 'ms',
          timestamp: Date.now(),
          category: 'timing',
          tags: { type: 'navigation' }
        });
      }
    });
  }

  private startAutoFlush() {
    this.flushTimer = setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);
  }

  // Public API methods
  public recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    this.checkThresholds(metric);

    // Prevent memory bloat
    if (this.metrics.length > this.bufferSize) {
      this.flushMetrics();
    }
  }

  public trackComponentRender(componentName: string, duration: number) {
    this.recordMetric({
      name: 'component-render',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      component: componentName,
      category: 'timing',
      tags: { type: 'render' }
    });
  }

  public trackUserInteraction(interactionType: string, duration: number, target?: string) {
    this.recordMetric({
      name: 'user-interaction',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'user',
      tags: { 
        type: interactionType,
        target: target || 'unknown'
      }
    });
  }

  public trackAPICall(endpoint: string, method: string, duration: number, status: number) {
    this.recordMetric({
      name: 'api-call',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'timing',
      tags: {
        endpoint,
        method,
        status: status.toString(),
        type: 'api'
      }
    });
  }

  public trackBusinessMetric(name: string, value: number, unit: string = 'count') {
    this.recordMetric({
      name,
      value,
      unit,
      timestamp: Date.now(),
      category: 'business',
      tags: { type: 'business' }
    });
  }

  public trackMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.recordMetric({
        name: 'memory-used-mb',
        value: memory.usedJSHeapSize / (1024 * 1024),
        unit: 'MB',
        timestamp: Date.now(),
        category: 'gauge',
        tags: { type: 'memory' }
      });

      this.recordMetric({
        name: 'memory-limit-mb',
        value: memory.jsHeapSizeLimit / (1024 * 1024),
        unit: 'MB',
        timestamp: Date.now(),
        category: 'gauge',
        tags: { type: 'memory' }
      });
    }
  }

  public setThreshold(metricName: string, thresholds: PerformanceThresholds) {
    this.thresholds.set(metricName, thresholds);
  }

  public onAlert(callback: (metric: PerformanceMetric, level: 'critical' | 'warning') => void) {
    this.alertCallbacks.push(callback);
  }

  private checkThresholds(metric: PerformanceMetric) {
    const threshold = this.thresholds.get(metric.name);
    if (!threshold) return;

    if (metric.value >= threshold.critical) {
      this.alertCallbacks.forEach(callback => callback(metric, 'critical'));
    } else if (metric.value >= threshold.warning) {
      this.alertCallbacks.forEach(callback => callback(metric, 'warning'));
    }
  }

  private async flushMetrics() {
    if (this.metrics.length === 0) return;

    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    try {
      // Send metrics to analytics service
      if (process.env.REACT_APP_ANALYTICS_ENDPOINT) {
        await fetch(process.env.REACT_APP_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metrics: metricsToFlush,
            timestamp: Date.now(),
            sessionId: sessionStorage.getItem('sessionId'),
            userId: localStorage.getItem('userId'),
          }),
        });
      }

      // Development logging
      if (process.env.NODE_ENV === 'development') {
        console.group('📊 Performance Metrics Batch');
        metricsToFlush.forEach(metric => {
          const level = this.getMetricLevel(metric);
          const color = level === 'critical' ? 'red' : level === 'warning' ? 'orange' : 'green';
          debugLog('general', 'log_statement', `%c${metric.name}: ${metric.value}${metric.unit}`, `color: ${color}`)
        });
        console.groupEnd();
      }
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
      
      // Store failed metrics for retry
      const failedMetrics = JSON.parse(localStorage.getItem('failedMetrics') || '[]');
      failedMetrics.push(...metricsToFlush);
      localStorage.setItem('failedMetrics', JSON.stringify(failedMetrics.slice(-50))); // Keep last 50
    }
  }

  private getMetricLevel(metric: PerformanceMetric): 'critical' | 'warning' | 'normal' {
    const threshold = this.thresholds.get(metric.name);
    if (!threshold) return 'normal';

    if (metric.value >= threshold.critical) return 'critical';
    if (metric.value >= threshold.warning) return 'warning';
    return 'normal';
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getMetricsSummary() {
    const summary = {
      total: this.metrics.length,
      byCategory: {} as Record<string, number>,
      byComponent: {} as Record<string, number>,
      averages: {} as Record<string, number>,
    };

    this.metrics.forEach(metric => {
      // Count by category
      summary.byCategory[metric.category] = (summary.byCategory[metric.category] || 0) + 1;
      
      // Count by component
      if (metric.component) {
        summary.byComponent[metric.component] = (summary.byComponent[metric.component] || 0) + 1;
      }
      
      // Calculate averages
      if (!summary.averages[metric.name]) {
        summary.averages[metric.name] = metric.value;
      } else {
        summary.averages[metric.name] = (summary.averages[metric.name] + metric.value) / 2;
      }
    });

    return summary;
  }

  public destroy() {
    // Clear timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    // Flush remaining metrics
    this.flushMetrics();
  }
}

// Export singleton instance
export const realTimePerformanceMonitor = new RealTimePerformanceMonitor();

// React hook for component performance tracking
export const usePerformanceTracking = (componentName: string) => {
  return {
    trackRender: (duration: number) => realTimePerformanceMonitor.trackComponentRender(componentName, duration),
    trackInteraction: (type: string, duration: number) => realTimePerformanceMonitor.trackUserInteraction(type, duration, componentName),
  };
};

export default realTimePerformanceMonitor; 