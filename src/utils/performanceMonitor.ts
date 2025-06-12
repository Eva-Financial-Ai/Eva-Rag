import { debugLog } from './auditLogger';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private renderCounts: Map<string, number> = new Map();
  private renderTimes: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  trackRender(componentName: string): () => void {
    const startTime = performance.now();
    const currentCount = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, currentCount + 1);

    // Warn about excessive renders
    if (currentCount > 20) {
      console.warn(`[PerformanceMonitor] Excessive renders for ${componentName}: ${currentCount}`);
    }

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      const times = this.renderTimes.get(componentName) || [];
      times.push(renderTime);
      this.renderTimes.set(componentName, times);

      // Keep only last 10 render times
      if (times.length > 10) {
        times.shift();
      }

      // Log slow renders
      if (renderTime > 100) {
        console.warn(`[PerformanceMonitor] Slow render for ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  }

  getStats(componentName: string) {
    const count = this.renderCounts.get(componentName) || 0;
    const times = this.renderTimes.get(componentName) || [];
    const avgTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;

    return {
      renderCount: count,
      averageRenderTime: avgTime,
      recentRenderTimes: times
    };
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [component] of this.renderCounts) {
      stats[component] = this.getStats(component);
    }
    return stats;
  }

  reset() {
    this.renderCounts.clear();
    this.renderTimes.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Development helper
if (process.env.NODE_ENV === 'development') {
  // Add to window for debugging
  (window as any).performanceMonitor = performanceMonitor;

  // Log stats every 30 seconds
  setInterval(() => {
    const stats = performanceMonitor.getAllStats();
    debugLog('general', 'log_statement', '[PerformanceMonitor] Component Stats:', stats)
  }, 30000);
} 