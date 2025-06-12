// React Hook for performance monitoring
import { useEffect, useState } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface WebSocketMetrics {
  connectionAttempts: number;
  successfulConnections: number;
  failedConnections: number;
  messagesReceived: number;
  messagesSent: number;
  reconnections: number;
  averageLatency: number;
  connectionDuration: number;
  lastError?: string;
  lastErrorTime?: number;
}

interface ExportMetrics {
  totalExports: number;
  exportsByType: Record<string, number>;
  averageExportTime: number;
  largestExportSize: number;
  failedExports: number;
  lastExportTime?: number;
}

class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private wsMetrics: WebSocketMetrics = {
    connectionAttempts: 0,
    successfulConnections: 0,
    failedConnections: 0,
    messagesReceived: 0,
    messagesSent: 0,
    reconnections: 0,
    averageLatency: 0,
    connectionDuration: 0,
  };
  private exportMetrics: ExportMetrics = {
    totalExports: 0,
    exportsByType: {},
    averageExportTime: 0,
    largestExportSize: 0,
    failedExports: 0,
  };

  private latencyMeasurements: number[] = [];
  private exportTimeMeasurements: number[] = [];
  private wsConnectionStartTime?: number;

  // Configuration
  private readonly MAX_METRICS_HISTORY = 1000;
  private readonly METRICS_FLUSH_INTERVAL = 60000; // 1 minute
  private readonly ANALYTICS_ENDPOINT =
    process.env.REACT_APP_ANALYTICS_ENDPOINT || '/api/analytics';

  constructor() {
    // Start periodic metrics flush
    this.startMetricsFlush();

    // Listen for page unload to send final metrics
    window.addEventListener('beforeunload', () => {
      this.flushMetrics();
    });
  }

  // WebSocket Monitoring
  trackWebSocketConnection(success: boolean) {
    this.wsMetrics.connectionAttempts++;
    if (success) {
      this.wsMetrics.successfulConnections++;
      this.wsConnectionStartTime = Date.now();
    } else {
      this.wsMetrics.failedConnections++;
    }
    this.recordMetric('websocket.connection', success ? 1 : 0, {
      success: success.toString(),
    });
  }

  trackWebSocketDisconnection() {
    if (this.wsConnectionStartTime) {
      const duration = Date.now() - this.wsConnectionStartTime;
      this.wsMetrics.connectionDuration += duration;
      this.recordMetric('websocket.connection.duration', duration);
      this.wsConnectionStartTime = undefined;
    }
  }

  trackWebSocketReconnection() {
    this.wsMetrics.reconnections++;
    this.recordMetric('websocket.reconnection', 1);
  }

  trackWebSocketMessage(direction: 'sent' | 'received', messageType: string) {
    if (direction === 'sent') {
      this.wsMetrics.messagesSent++;
    } else {
      this.wsMetrics.messagesReceived++;
    }
    this.recordMetric(`websocket.message.${direction}`, 1, {
      type: messageType,
    });
  }

  trackWebSocketLatency(latency: number) {
    this.latencyMeasurements.push(latency);
    if (this.latencyMeasurements.length > 100) {
      this.latencyMeasurements.shift();
    }
    this.wsMetrics.averageLatency = this.calculateAverage(this.latencyMeasurements);
    this.recordMetric('websocket.latency', latency);
  }

  trackWebSocketError(error: string) {
    this.wsMetrics.lastError = error;
    this.wsMetrics.lastErrorTime = Date.now();
    this.recordMetric('websocket.error', 1, {
      error: error.substring(0, 100), // Limit error message length
    });
  }

  // Export Monitoring
  trackExport(type: 'csv' | 'pdf' | 'json', size: number, duration: number, success: boolean) {
    this.exportMetrics.totalExports++;
    this.exportMetrics.exportsByType[type] = (this.exportMetrics.exportsByType[type] || 0) + 1;

    if (success) {
      this.exportTimeMeasurements.push(duration);
      if (this.exportTimeMeasurements.length > 100) {
        this.exportTimeMeasurements.shift();
      }
      this.exportMetrics.averageExportTime = this.calculateAverage(this.exportTimeMeasurements);

      if (size > this.exportMetrics.largestExportSize) {
        this.exportMetrics.largestExportSize = size;
      }
    } else {
      this.exportMetrics.failedExports++;
    }

    this.exportMetrics.lastExportTime = Date.now();

    this.recordMetric('export.operation', success ? 1 : 0, {
      type,
      size: size.toString(),
      duration: duration.toString(),
      success: success.toString(),
    });
  }

  // General Metrics
  private recordMetric(name: string, value: number, tags?: Record<string, string>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    };

    this.metrics.push(metric);

    // Limit metrics history
    if (this.metrics.length > this.MAX_METRICS_HISTORY) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS_HISTORY);
    }
  }

  // Analytics Dashboard Data
  getWebSocketHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    score: number;
    details: WebSocketMetrics;
  } {
    const successRate =
      this.wsMetrics.connectionAttempts > 0
        ? this.wsMetrics.successfulConnections / this.wsMetrics.connectionAttempts
        : 0;

    const reconnectionRate =
      this.wsMetrics.successfulConnections > 0
        ? this.wsMetrics.reconnections / this.wsMetrics.successfulConnections
        : 0;

    let score = successRate * 50; // 50 points for connection success
    score += (1 - Math.min(reconnectionRate, 1)) * 30; // 30 points for low reconnection rate
    score += (Math.max(0, 100 - this.wsMetrics.averageLatency) / 100) * 20; // 20 points for low latency

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (score >= 80) status = 'healthy';
    else if (score >= 50) status = 'degraded';
    else status = 'unhealthy';

    return {
      status,
      score: Math.round(score),
      details: { ...this.wsMetrics },
    };
  }

  getExportPerformance(): {
    successRate: number;
    averageTime: number;
    popularFormat: string;
    details: ExportMetrics;
  } {
    const successRate =
      this.exportMetrics.totalExports > 0
        ? (this.exportMetrics.totalExports - this.exportMetrics.failedExports) /
          this.exportMetrics.totalExports
        : 0;

    const popularFormat =
      Object.entries(this.exportMetrics.exportsByType).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      'none';

    return {
      successRate: Math.round(successRate * 100),
      averageTime: Math.round(this.exportMetrics.averageExportTime),
      popularFormat,
      details: { ...this.exportMetrics },
    };
  }

  // Utility Methods
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private startMetricsFlush() {
    setInterval(() => {
      this.flushMetrics();
    }, this.METRICS_FLUSH_INTERVAL);
  }

  private async flushMetrics() {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    try {
      await fetch(this.ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          metrics: metricsToSend,
          summary: {
            websocket: this.getWebSocketHealth(),
            export: this.getExportPerformance(),
          },
          timestamp: Date.now(),
          sessionId: this.getSessionId(),
        }),
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
      // Re-add metrics to queue if send failed
      this.metrics = [...metricsToSend, ...this.metrics];
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('performance-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('performance-session-id', sessionId);
    }
    return sessionId;
  }

  // Public API for React components
  generateReport() {
    return {
      websocket: this.getWebSocketHealth(),
      export: this.getExportPerformance(),
      recentMetrics: this.metrics.slice(-100),
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitoringService();

export function usePerformanceMonitoring() {
  const [report, setReport] = useState(performanceMonitor.generateReport());

  useEffect(() => {
    const interval = setInterval(() => {
      setReport(performanceMonitor.generateReport());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    report,
    trackWebSocketConnection: performanceMonitor.trackWebSocketConnection.bind(performanceMonitor),
    trackWebSocketMessage: performanceMonitor.trackWebSocketMessage.bind(performanceMonitor),
    trackWebSocketLatency: performanceMonitor.trackWebSocketLatency.bind(performanceMonitor),
    trackWebSocketError: performanceMonitor.trackWebSocketError.bind(performanceMonitor),
    trackExport: performanceMonitor.trackExport.bind(performanceMonitor),
  };
}
