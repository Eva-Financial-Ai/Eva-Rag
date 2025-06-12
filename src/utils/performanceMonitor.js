// Financial Application Performance Monitor
// Tracks performance metrics, detects degradation, and provides alerts
// Designed specifically for financial applications requiring high reliability

import { logger } from './logger.js';

class FinancialPerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.thresholds = {
      pageLoad: 3000, // 3 seconds max for financial apps
      apiResponse: 2000, // 2 seconds max for API calls
      documentUpload: 30000, // 30 seconds max for document uploads
      renderTime: 100, // 100ms max for component renders
      memoryUsage: 100 * 1024 * 1024, // 100MB max memory usage
      networkLatency: 1000 // 1 second max network latency
    };
    
    this.performanceQueue = [];
    this.alertQueue = [];
    this.isMonitoring = false;
    
    // Critical operations that require immediate alerts
    this.criticalOperations = [
      'loan-application-submit', 'payment-processing', 
      'document-upload', 'authentication', 'pii-access'
    ];
    
    this.init();
  }

  /**
   * Initialize performance monitoring
   */
  init() {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    this.isMonitoring = true;
    this.setupPerformanceObservers();
    this.startMetricsCollection();
    this.monitorMemoryUsage();
    this.trackNavigationTiming();
    
    logger.info('Performance monitoring initialized');
  }

  /**
   * Setup performance observers for various metrics
   */
  setupPerformanceObservers() {
    try {
      // Observe page load metrics
      if ('PerformanceObserver' in window) {
        // Long Task Observer (for main thread blocking)
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            this.recordMetric('longTask', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
            
            if (entry.duration > 50) { // Tasks over 50ms
              this.createAlert('LONG_TASK', `Main thread blocked for ${entry.duration}ms`, 'HIGH');
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });

        // Layout Shift Observer (for CLS)
        const layoutShiftObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (!entry.hadRecentInput) {
              this.recordMetric('layoutShift', {
                value: entry.value,
                startTime: entry.startTime
              });
              
              if (entry.value > 0.1) { // CLS threshold
                this.createAlert('LAYOUT_SHIFT', `High cumulative layout shift: ${entry.value}`, 'MEDIUM');
              }
            }
          });
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

        // Largest Contentful Paint Observer
        const lcpObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            this.recordMetric('largestContentfulPaint', {
              value: entry.startTime,
              element: entry.element?.tagName || 'unknown'
            });
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      }
    } catch (error) {
      logger.error('Failed to setup performance observers:', error);
    }
  }

  /**
   * Track navigation timing
   */
  trackNavigationTiming() {
    if (!window.performance || !window.performance.timing) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = window.performance.timing;
        const navigationStart = timing.navigationStart;

        const metrics = {
          domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
          windowLoad: timing.loadEventEnd - navigationStart,
          firstPaint: this.getFirstPaint(),
          timeToInteractive: this.calculateTimeToInteractive()
        };

        this.recordMetric('pageLoad', metrics);

        // Check against thresholds
        if (metrics.windowLoad > this.thresholds.pageLoad) {
          this.createAlert('SLOW_PAGE_LOAD', 
            `Page load took ${metrics.windowLoad}ms (threshold: ${this.thresholds.pageLoad}ms)`, 
            'HIGH'
          );
        }
      }, 0);
    });
  }

  /**
   * Monitor API performance
   * @param {string} url - API endpoint
   * @param {string} method - HTTP method
   * @param {number} startTime - Request start time
   * @param {number} endTime - Request end time
   * @param {number} status - HTTP status code
   * @param {string} operation - Operation identifier
   */
  trackAPICall(url, method, startTime, endTime, status, operation = 'unknown') {
    const duration = endTime - startTime;
    
    const metric = {
      url,
      method,
      duration,
      status,
      operation,
      timestamp: new Date().toISOString()
    };

    this.recordMetric('apiCall', metric);

    // Check performance threshold
    if (duration > this.thresholds.apiResponse) {
      const severity = this.criticalOperations.includes(operation) ? 'CRITICAL' : 'HIGH';
      this.createAlert('SLOW_API_RESPONSE', 
        `${operation} API call took ${duration}ms (threshold: ${this.thresholds.apiResponse}ms)`, 
        severity, metric
      );
    }

    // Check for API errors
    if (status >= 400) {
      const severity = status >= 500 ? 'CRITICAL' : 'HIGH';
      this.createAlert('API_ERROR', 
        `${operation} API call failed with status ${status}`, 
        severity, metric
      );
    }
  }

  /**
   * Monitor component render performance
   * @param {string} componentName - Name of the component
   * @param {number} renderTime - Time taken to render
   * @param {object} props - Component props (for context)
   */
  trackComponentRender(componentName, renderTime, props = {}) {
    const metric = {
      componentName,
      renderTime,
      propsSize: JSON.stringify(props).length,
      timestamp: new Date().toISOString()
    };

    this.recordMetric('componentRender', metric);

    if (renderTime > this.thresholds.renderTime) {
      this.createAlert('SLOW_COMPONENT_RENDER', 
        `${componentName} rendered in ${renderTime}ms (threshold: ${this.thresholds.renderTime}ms)`, 
        'MEDIUM', metric
      );
    }
  }

  /**
   * Monitor document upload performance
   * @param {string} fileId - File identifier
   * @param {number} fileSize - File size in bytes
   * @param {number} uploadTime - Upload time in milliseconds
   * @param {boolean} success - Whether upload was successful
   */
  trackDocumentUpload(fileId, fileSize, uploadTime, success) {
    const metric = {
      fileId,
      fileSize,
      uploadTime,
      success,
      uploadSpeed: fileSize / (uploadTime / 1000), // bytes per second
      timestamp: new Date().toISOString()
    };

    this.recordMetric('documentUpload', metric);

    if (uploadTime > this.thresholds.documentUpload) {
      this.createAlert('SLOW_DOCUMENT_UPLOAD', 
        `Document upload took ${uploadTime}ms for ${fileSize} bytes`, 
        'HIGH', metric
      );
    }

    if (!success) {
      this.createAlert('DOCUMENT_UPLOAD_FAILURE', 
        `Document upload failed for file ${fileId}`, 
        'CRITICAL', metric
      );
    }
  }

  /**
   * Monitor memory usage
   */
  monitorMemoryUsage() {
    if (!window.performance.memory) return;

    setInterval(() => {
      const memory = window.performance.memory;
      const metric = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        timestamp: new Date().toISOString()
      };

      this.recordMetric('memoryUsage', metric);

      if (memory.usedJSHeapSize > this.thresholds.memoryUsage) {
        this.createAlert('HIGH_MEMORY_USAGE', 
          `Memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`, 
          'HIGH', metric
        );
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Track financial calculation performance
   * @param {string} calculationType - Type of calculation
   * @param {number} calculationTime - Time taken
   * @param {object} inputs - Calculation inputs
   * @param {boolean} success - Whether calculation succeeded
   */
  trackFinancialCalculation(calculationType, calculationTime, inputs, success) {
    const metric = {
      calculationType,
      calculationTime,
      inputComplexity: Object.keys(inputs).length,
      success,
      timestamp: new Date().toISOString()
    };

    this.recordMetric('financialCalculation', metric);

    // Financial calculations should be fast and accurate
    if (calculationTime > 1000) { // 1 second threshold
      this.createAlert('SLOW_FINANCIAL_CALCULATION', 
        `${calculationType} calculation took ${calculationTime}ms`, 
        'HIGH', metric
      );
    }

    if (!success) {
      this.createAlert('FINANCIAL_CALCULATION_ERROR', 
        `${calculationType} calculation failed`, 
        'CRITICAL', metric
      );
    }
  }

  /**
   * Record a performance metric
   * @param {string} type - Metric type
   * @param {object} data - Metric data
   */
  recordMetric(type, data) {
    if (!this.metrics[type]) {
      this.metrics[type] = [];
    }

    const metric = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
      id: this.generateMetricId()
    };

    this.metrics[type].push(metric);
    this.performanceQueue.push({ type, metric });

    // Keep only last 1000 metrics per type
    if (this.metrics[type].length > 1000) {
      this.metrics[type].shift();
    }

    // Batch send metrics
    if (this.performanceQueue.length >= 50) {
      this.flushMetrics();
    }
  }

  /**
   * Create performance alert
   * @param {string} alertType - Type of alert
   * @param {string} message - Alert message
   * @param {string} severity - Alert severity (LOW, MEDIUM, HIGH, CRITICAL)
   * @param {object} context - Additional context
   */
  createAlert(alertType, message, severity, context = {}) {
    const alert = {
      id: this.generateAlertId(),
      alertType,
      message,
      severity,
      context,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.alertQueue.push(alert);
    
    // Send critical alerts immediately
    if (severity === 'CRITICAL') {
      this.sendAlert(alert);
    }

    logger.warn(`[PERFORMANCE_ALERT] ${alertType}: ${message}`, context);
  }

  /**
   * Get performance summary
   * @returns {object} - Performance summary
   */
  getPerformanceSummary() {
    const summary = {};
    
    for (const [type, metrics] of Object.entries(this.metrics)) {
      if (metrics.length === 0) continue;
      
      const values = this.extractValues(metrics, type);
      summary[type] = {
        count: metrics.length,
        average: this.calculateAverage(values),
        median: this.calculateMedian(values),
        p95: this.calculatePercentile(values, 95),
        min: Math.min(...values),
        max: Math.max(...values),
        lastRecorded: metrics[metrics.length - 1].timestamp
      };
    }

    return {
      summary,
      alerts: this.alertQueue.filter(alert => !alert.resolved),
      thresholds: this.thresholds,
      isMonitoring: this.isMonitoring
    };
  }

  /**
   * Start periodic metrics collection
   */
  startMetricsCollection() {
    // Flush metrics every 10 seconds
    setInterval(() => {
      this.flushMetrics();
    }, 10000);

    // Send alerts every 5 seconds
    setInterval(() => {
      this.flushAlerts();
    }, 5000);
  }

  /**
   * Flush performance metrics to server
   */
  async flushMetrics() {
    if (this.performanceQueue.length === 0) return;

    const metrics = [...this.performanceQueue];
    this.performanceQueue = [];

    try {
      await fetch('/api/performance/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (error) {
      logger.error('Failed to send performance metrics:', error);
    }
  }

  /**
   * Flush performance alerts to server
   */
  async flushAlerts() {
    const unsentAlerts = this.alertQueue.filter(alert => !alert.sent);
    if (unsentAlerts.length === 0) return;

    try {
      await fetch('/api/performance/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alerts: unsentAlerts,
          timestamp: new Date().toISOString()
        })
      });

      // Mark alerts as sent
      unsentAlerts.forEach(alert => alert.sent = true);
    } catch (error) {
      logger.error('Failed to send performance alerts:', error);
    }
  }

  /**
   * Send critical alert immediately
   */
  async sendAlert(alert) {
    try {
      await fetch('/api/performance/alerts/critical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
      alert.sent = true;
    } catch (error) {
      logger.error('Failed to send critical alert:', error);
    }
  }

  // Utility methods
  generateMetricId() {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getFirstPaint() {
    if (window.performance.getEntriesByType) {
      const paintEntries = window.performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      return firstPaint ? firstPaint.startTime : null;
    }
    return null;
  }

  calculateTimeToInteractive() {
    // Simplified TTI calculation
    if (window.performance.timing) {
      return window.performance.timing.domInteractive - window.performance.timing.navigationStart;
    }
    return null;
  }

  extractValues(metrics, type) {
    switch (type) {
      case 'apiCall':
        return metrics.map(m => m.duration);
      case 'componentRender':
        return metrics.map(m => m.renderTime);
      case 'documentUpload':
        return metrics.map(m => m.uploadTime);
      case 'pageLoad':
        return metrics.map(m => m.windowLoad);
      default:
        return metrics.map(m => m.value || m.duration || 0);
    }
  }

  calculateAverage(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }
}

// Create singleton instance
export const performanceMonitor = new FinancialPerformanceMonitor();

// Export convenience functions
export const trackAPICall = (url, method, startTime, endTime, status, operation) =>
  performanceMonitor.trackAPICall(url, method, startTime, endTime, status, operation);

export const trackComponentRender = (componentName, renderTime, props) =>
  performanceMonitor.trackComponentRender(componentName, renderTime, props);

export const trackDocumentUpload = (fileId, fileSize, uploadTime, success) =>
  performanceMonitor.trackDocumentUpload(fileId, fileSize, uploadTime, success);

export const trackFinancialCalculation = (calculationType, calculationTime, inputs, success) =>
  performanceMonitor.trackFinancialCalculation(calculationType, calculationTime, inputs, success);

export const getPerformanceSummary = () =>
  performanceMonitor.getPerformanceSummary();

export default performanceMonitor; 