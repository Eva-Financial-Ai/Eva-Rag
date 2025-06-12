/**
 * Production-safe logger that manages console output and prevents memory leaks
 * Automatically handles development vs production environments
 */

interface LogEntry {
  timestamp: number;
  level: string;
  message: string;
  context?: string;
}

class ProductionLogger {
  private static isDevelopment = process.env.NODE_ENV === 'development';
  private static maxLogEntries = 1000;
  private static logBuffer: LogEntry[] = [];

  /**
   * Log informational messages (only in development)
   */
  static log(message: string, context?: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`[${context || 'APP'}]`, message, ...args);
    }
    this.addToBuffer('log', message, context);
  }

  /**
   * Log warning messages (only in development)
   */
  static warn(message: string, context?: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.warn(`[${context || 'APP'}]`, message, ...args);
    }
    this.addToBuffer('warn', message, context);
  }

  /**
   * Log error messages (always shown)
   */
  static error(message: string, context?: string, ...args: any[]) {
    console.error(`[${context || 'APP'}]`, message, ...args);
    this.addToBuffer('error', message, context);
  }

  /**
   * Log info messages (alias for log)
   */
  static info(message: string, context?: string, ...args: any[]) {
    this.log(message, context, ...args);
  }

  /**
   * Log debug messages (only in development with verbose flag)
   */
  static debug(message: string, context?: string, ...args: any[]) {
    if (this.isDevelopment && this.isVerboseMode()) {
      console.debug(`[DEBUG:${context || 'APP'}]`, message, ...args);
    }
    this.addToBuffer('debug', message, context);
  }

  /**
   * Log API calls and responses (development only)
   */
  static api(method: string, url: string, data?: any, context = 'API') {
    if (this.isDevelopment) {
      console.log(`[${context}] ${method.toUpperCase()} ${url}`, data ? { data } : '');
    }
    this.addToBuffer('api', `${method.toUpperCase()} ${url}`, context);
  }

  /**
   * Log component lifecycle events (development only)
   */
  static component(componentName: string, action: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[COMPONENT:${componentName}] ${action}`, data || '');
    }
    this.addToBuffer('component', `${componentName}: ${action}`, 'COMPONENT');
  }

  /**
   * Log user interactions (development only)
   */
  static interaction(action: string, element?: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[INTERACTION] ${action}${element ? ` on ${element}` : ''}`, data || '');
    }
    this.addToBuffer('interaction', `${action}${element ? ` on ${element}` : ''}`, 'INTERACTION');
  }

  /**
   * Log performance metrics
   */
  static performance(metric: string, value: number, unit = 'ms') {
    const message = `${metric}: ${value}${unit}`;
    if (this.isDevelopment) {
      console.log(`[PERF] ${message}`);
    }
    this.addToBuffer('performance', message, 'PERF');
  }

  /**
   * Add entry to internal buffer with automatic cleanup
   */
  private static addToBuffer(level: string, message: string, context?: string) {
    this.logBuffer.push({
      timestamp: Date.now(),
      level,
      message: message.substring(0, 500), // Truncate long messages
      context: context?.substring(0, 50), // Truncate long contexts
    });

    // Keep buffer size manageable to prevent memory leaks
    if (this.logBuffer.length > this.maxLogEntries) {
      this.logBuffer = this.logBuffer.slice(-this.maxLogEntries);
    }
  }

  /**
   * Check if verbose mode is enabled
   */
  private static isVerboseMode(): boolean {
    return (
      localStorage.getItem('eva_debug_verbose') === 'true' ||
      window.location.search.includes('verbose=true')
    );
  }

  /**
   * Get recent log entries for debugging
   */
  static getRecentLogs(count = 100): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  /**
   * Get logs by level
   */
  static getLogsByLevel(level: string, count = 50): LogEntry[] {
    return this.logBuffer.filter(entry => entry.level === level).slice(-count);
  }

  /**
   * Clear the internal log buffer
   */
  static clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Export logs for debugging or error reporting
   */
  static exportLogs(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      userAgent: navigator.userAgent,
      url: window.location.href,
      logs: this.logBuffer,
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Enable verbose debugging
   */
  static enableVerbose(): void {
    localStorage.setItem('eva_debug_verbose', 'true');
    console.log('🔍 Verbose logging enabled');
  }

  /**
   * Disable verbose debugging
   */
  static disableVerbose(): void {
    localStorage.removeItem('eva_debug_verbose');
    console.log('🔇 Verbose logging disabled');
  }

  /**
   * Group related log entries
   */
  static group(label: string, callback: () => void): void {
    if (this.isDevelopment) {
      console.group(label);
      try {
        callback();
      } finally {
        console.groupEnd();
      }
    } else {
      callback();
    }
  }

  /**
   * Time a function execution
   */
  static time<T>(label: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    this.performance(label, Math.round(duration * 100) / 100);
    return result;
  }

  /**
   * Time an async function execution
   */
  static async timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    this.performance(label, Math.round(duration * 100) / 100);
    return result;
  }
}

// Add global access for debugging in development
if (ProductionLogger['isDevelopment']) {
  (window as any).__evaLogger = ProductionLogger;
  console.log('🪵 EVA Production Logger initialized. Access via window.__evaLogger');
}

export default ProductionLogger;
