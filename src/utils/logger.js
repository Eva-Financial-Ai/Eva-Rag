import { debugLog } from './auditLogger';

// Production Logger - Replaces console statements
// Uses structured logging for production environments

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

class Logger {
  constructor() {
    this.logLevel = isProduction ? 'error' : 'info';
  }

  info(message, data = {}) {
    if (isDevelopment) {
      debugLog('general', 'log_statement', `[INFO] ${message}`, data)
    } else {
      // In production, send to logging service
      this.sendToLoggingService('info', message, data);
    }
  }

  warn(message, data = {}) {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, data);
    } else {
      this.sendToLoggingService('warn', message, data);
    }
  }

  error(message, error = null, data = {}) {
    const errorData = {
      ...data,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : null
    };

    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, errorData);
    } else {
      this.sendToLoggingService('error', message, errorData);
    }
  }

  sendToLoggingService(level, message, data) {
    // In production, integrate with your logging service
    // For now, we'll use a minimal approach
    if (level === 'error') {
      // Only log errors in production to reduce noise
      try {
        fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level,
            message,
            data,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          })
        });
      } catch (e) {
        // Fallback - don't break the app if logging fails
      }
    }
  }
}

export const logger = new Logger();

// For backward compatibility during transition
export const replaceConsole = () => {
  if (isProduction) {
    console.log = () => {}; // Disable console.log in production
    console.warn = (message, ...args) => logger.warn(message, args);
    console.error = (message, ...args) => logger.error(message, args[0], { args: args.slice(1) });
  }
};
