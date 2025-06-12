/**
 * Performance monitoring utilities for the EVA platform
 * These utilities help track and analyze performance metrics across the application
 */

// Performance data store
// React hooks for performance optimization
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  category: 'render' | 'api' | 'computation' | 'interaction' | 'load';
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private activeMetrics: Record<string, PerformanceMetric> = {};
  private listeners: Array<(metrics: PerformanceMetric[]) => void> = [];
  private isEnabled: boolean = true;

  constructor() {
    // Initialize performance observer if available
    if (typeof PerformanceObserver !== 'undefined') {
      this.setupPerformanceObservers();
    }

    // Check if performance monitoring should be disabled
    const disableMonitoring = localStorage.getItem('disablePerformanceMonitoring');
    if (disableMonitoring === 'true') {
      this.isEnabled = false;
    }
  }

  /**
   * Set up performance observers to track browser metrics
   */
  private setupPerformanceObservers() {
    try {
      // Long task observer
      const longTaskObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          this.addMetric({
            name: 'long-task',
            startTime: entry.startTime,
            endTime: entry.startTime + entry.duration,
            duration: entry.duration,
            category: 'computation',
            metadata: {
              entryType: entry.entryType,
              attribution: (entry as any).attribution,
            },
          });
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });

      // Resource timing observer
      const resourceObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          // Only track resource loads that take longer than 500ms
          if (entry.duration > 500) {
            this.addMetric({
              name: `resource-${entry.name.split('/').pop()}`,
              startTime: entry.startTime,
              endTime: entry.startTime + entry.duration,
              duration: entry.duration,
              category: 'load',
              metadata: {
                resourceType: entry.initiatorType,
                url: entry.name,
              },
            });
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Navigation timing observer
      const navigationObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          this.addMetric({
            name: 'page-load',
            startTime: 0,
            endTime: (entry as PerformanceNavigationTiming).loadEventEnd,
            duration: (entry as PerformanceNavigationTiming).loadEventEnd,
            category: 'load',
            metadata: {
              domInteractive: (entry as PerformanceNavigationTiming).domInteractive,
              domContentLoaded: (entry as PerformanceNavigationTiming).domContentLoadedEventEnd,
              loadEvent: (entry as PerformanceNavigationTiming).loadEventEnd,
            },
          });
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.warn('Performance observer setup failed:', error);
    }
  }

  /**
   * Start timing a performance metric
   * @param name Name of the metric to track
   * @param category Category of the metric
   * @param metadata Additional metadata to store with the metric
   * @returns Unique ID for the started metric
   */
  startMetric(
    name: string,
    category: PerformanceMetric['category'],
    metadata?: Record<string, any>
  ): string {
    if (!this.isEnabled) return name;

    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      category,
      metadata,
    };

    this.activeMetrics[name] = metric;
    return name;
  }

  /**
   * End timing a performance metric and save the results
   * @param id ID of the metric to end (returned from startMetric)
   * @param additionalMetadata Additional metadata to add to the metric
   * @returns Duration of the metric in milliseconds
   */
  endMetric(id: string, additionalMetadata?: Record<string, any>): number | undefined {
    if (!this.isEnabled) return;

    const metric = this.activeMetrics[id];
    if (!metric) {
      console.warn(`No active metric found with id: ${id}`);
      return;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    if (additionalMetadata) {
      metric.metadata = {
        ...metric.metadata,
        ...additionalMetadata,
      };
    }

    this.addMetric(metric);
    delete this.activeMetrics[id];

    return metric.duration;
  }

  /**
   * Add a completed metric to the metrics store
   * @param metric The metric to add
   */
  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    this.notifyListeners();

    // Log slow operations to console in development
    if (process.env.NODE_ENV === 'development' && metric.duration && metric.duration > 100) {
      console.warn(
        `Slow operation detected: ${metric.name} (${metric.duration.toFixed(2)}ms)`,
        metric.metadata
      );
    }

    // Keep only the last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Measure the execution time of a function
   * @param fn Function to measure
   * @param name Name of the metric
   * @param category Category of the metric
   * @param metadata Additional metadata
   * @returns The result of the function
   */
  measure<T>(
    fn: () => T,
    name: string,
    category: PerformanceMetric['category'],
    metadata?: Record<string, any>
  ): T {
    if (!this.isEnabled) return fn();

    const metricId = this.startMetric(name, category, metadata);
    try {
      const result = fn();
      this.endMetric(metricId);
      return result;
    } catch (error) {
      this.endMetric(metricId, { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Measure the execution time of an async function
   * @param fn Async function to measure
   * @param name Name of the metric
   * @param category Category of the metric
   * @param metadata Additional metadata
   * @returns Promise resolving to the result of the function
   */
  async measureAsync<T>(
    fn: () => Promise<T>,
    name: string,
    category: PerformanceMetric['category'],
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.isEnabled) return fn();

    const metricId = this.startMetric(name, category, metadata);
    try {
      const result = await fn();
      this.endMetric(metricId);
      return result;
    } catch (error) {
      this.endMetric(metricId, { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Get all stored metrics
   * @returns Array of all performance metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics filtered by category
   * @param category Category to filter by
   * @returns Filtered metrics
   */
  getMetricsByCategory(category: PerformanceMetric['category']): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.category === category);
  }

  /**
   * Get metrics filtered by name
   * @param name Name to filter by
   * @returns Filtered metrics
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  /**
   * Clear all stored metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.notifyListeners();
  }

  /**
   * Subscribe to metric updates
   * @param listener Function to call when metrics are updated
   * @returns Unsubscribe function
   */
  subscribe(listener: (metrics: PerformanceMetric[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of metric updates
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.metrics]);
      } catch (error) {
        console.error('Error in performance listener:', error);
      }
    });
  }

  /**
   * Enable or disable performance monitoring
   * @param enabled Whether monitoring should be enabled
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('disablePerformanceMonitoring', enabled ? 'false' : 'true');
  }

  /**
   * Check if performance monitoring is enabled
   * @returns Whether monitoring is enabled
   */
  isMonitoringEnabled(): boolean {
    return this.isEnabled;
  }
}

// Create a singleton instance
const performanceMonitor = new PerformanceMonitor();

// Cache Manager for API responses
export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number;

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

/**
 * Hook for virtual scrolling large lists
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 3
) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = useMemo(
    () => items.slice(startIndex, endIndex + 1),
    [items, startIndex, endIndex]
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex,
  };
}

/**
 * Hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default performanceMonitor;
