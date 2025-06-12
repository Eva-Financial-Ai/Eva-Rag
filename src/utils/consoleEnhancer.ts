/**
 * Console Enhancer - Improves development experience
 * 
 * This utility provides enhanced console functionality with better formatting
 * and noise reduction for development environments.
 */

import { getEnvVar } from './assetUtils';

import { debugLog } from './auditLogger';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface ConsoleEnhancerConfig {
  enableColors: boolean;
  enableTimestamps: boolean;
  minLogLevel: LogLevel;
  groupRelatedLogs: boolean;
}

class ConsoleEnhancer {
  private config: ConsoleEnhancerConfig;
  private originalConsole: Console;
  private isProduction: boolean;

  constructor() {
    this.originalConsole = { ...console };
    this.isProduction = (getEnvVar('NODE_ENV') || 'development') === 'production';
    
    this.config = {
      enableColors: !this.isProduction,
      enableTimestamps: !this.isProduction,
      minLogLevel: this.isProduction ? 'warn' : 'debug',
      groupRelatedLogs: !this.isProduction,
    };

    if (!this.isProduction) {
      this.enhance();
    }
  }

  private enhance(): void {
    // Enhanced console.log with better formatting
    console.log = (...args: any[]) => {
      if (this.shouldLog('info')) {
        this.originalConsole.log(this.formatMessage('info', ...args));
      }
    };

    // Enhanced console.warn
    console.warn = (...args: any[]) => {
      if (this.shouldLog('warn')) {
        this.originalConsole.warn(this.formatMessage('warn', ...args));
      }
    };

    // Enhanced console.error (always show errors)
    console.error = (...args: any[]) => {
      this.originalConsole.error(this.formatMessage('error', ...args));
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    return levels[level] >= levels[this.config.minLogLevel];
  }

  private formatMessage(level: LogLevel, ...args: any[]): string {
    let message = args.join(' ');

    // Add timestamp if enabled
    if (this.config.enableTimestamps) {
      const timestamp = new Date().toLocaleTimeString();
      message = `[${timestamp}] ${message}`;
    }

    // Add color coding if enabled
    if (this.config.enableColors) {
      const colors: Record<LogLevel, string> = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
      };
      const reset = '\x1b[0m';
      message = `${colors[level]}${message}${reset}`;
    }

    return message;
  }

  // Utility methods for better organized logging
  public logGroup(title: string, callback: () => void): void {
    if (!this.isProduction && this.config.groupRelatedLogs) {
      console.group(`🔍 ${title}`);
      callback();
      console.groupEnd();
    } else {
      callback();
    }
  }

  public logPerformance(label: string, startTime: number): void {
    if (!this.isProduction) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      debugLog('general', 'log_statement', `⚡ ${label}: ${duration}ms`)
    }
  }

  public logApiCall(method: string, url: string, status?: number): void {
    if (!this.isProduction) {
      const statusEmoji = status ? (status < 400 ? '✅' : '❌') : '🔄';
      debugLog('general', 'log_statement', `${statusEmoji} ${method.toUpperCase()} ${url}${status ? ` (${status})` : ''}`);
    }
  }

  public restore(): void {
    Object.assign(console, this.originalConsole);
  }
}

// Create and export singleton instance
export const consoleEnhancer = new ConsoleEnhancer();

// Utility functions for common console operations
export const logGroup = (title: string, callback: () => void) => {
  consoleEnhancer.logGroup(title, callback);
};

export const logPerformance = (label: string, startTime: number) => {
  consoleEnhancer.logPerformance(label, startTime);
};

export const logApiCall = (method: string, url: string, status?: number) => {
  consoleEnhancer.logApiCall(method, url, status);
};

// Development-only console utilities
export const devLog = (...args: any[]) => {
  const isDev = (getEnvVar('NODE_ENV') || 'development') === 'development';
  if (isDev) {
    debugLog('general', 'log_statement', '🔧', ...args)
  }
};

export const perfLog = (label: string, fn: () => any) => {
  const isDev = (getEnvVar('NODE_ENV') || 'development') === 'development';
  if (isDev) {
    const start = performance.now();
    const result = fn();
    logPerformance(label, start);
    return result;
  }
  return fn();
};

export default consoleEnhancer; 