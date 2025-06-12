import { debugLog } from './auditLogger';

/**
 * =============================================================================
 * CONSOLE ERROR SUPPRESSOR FOR FINANCIAL APPLICATIONS
 * =============================================================================
 * 
 * This utility manages console output in development while maintaining
 * audit trails required for financial compliance.
 */

interface ErrorPattern {
  pattern: RegExp;
  suppress: boolean;
  logToAudit: boolean;
  description: string;
}

interface ConsoleFilter {
  errors: ErrorPattern[];
  warnings: ErrorPattern[];
  logs: ErrorPattern[];
}

// Define patterns for console messages that should be managed
const CONSOLE_FILTERS: ConsoleFilter = {
  errors: [
    {
      pattern: /Failed to fetch|NetworkError|ERR_NETWORK/,
      suppress: false, // Keep network errors visible
      logToAudit: true,
      description: 'Network connectivity issues'
    },
    {
      pattern: /WebSocket connection failed|WebSocket is not connected/,
      suppress: true, // Suppress expected WebSocket failures in dev
      logToAudit: false,
      description: 'WebSocket connection issues in development'
    },
    {
      pattern: /ChunkLoadError|Loading chunk/,
      suppress: false, // Keep chunk loading errors visible
      logToAudit: true,
      description: 'Code splitting chunk loading issues'
    }
  ],
  warnings: [
    {
      pattern: /Warning: React Hook useEffect has a missing dependency/,
      suppress: true, // Suppress in dev, but fix systematically
      logToAudit: false,
      description: 'React Hook dependency warnings'
    },
    {
      pattern: /Warning: Each child in a list should have a unique "key"/,
      suppress: true,
      logToAudit: false,
      description: 'React key prop warnings'
    },
    {
      pattern: /WebSocket service is disabled/,
      suppress: true,
      logToAudit: false,
      description: 'Expected WebSocket disabled messages'
    },
    {
      pattern: /Could not read log file, starting fresh/,
      suppress: true,
      logToAudit: false,
      description: 'Expected log file initialization'
    },
    {
      pattern: /Source map warning|Failed to parse source map/,
      suppress: true,
      logToAudit: false,
      description: 'Source map warnings from dependencies'
    }
  ],
  logs: [
    {
      pattern: /WebSocket connected|WebSocket disconnected/,
      suppress: true,
      logToAudit: false,
      description: 'WebSocket state changes'
    },
    {
      pattern: /Mock WebSocket/,
      suppress: true,
      logToAudit: false,
      description: 'Mock WebSocket development messages'
    }
  ]
};

class ConsoleErrorSuppressor {
  private originalConsole: Console;
  private auditLog: Array<{ timestamp: string; level: string; message: string; stack?: string }> = [];
  private isEnabled: boolean = false;

  constructor() {
    this.originalConsole = { ...console };
  }

  public enable(): void {
    if (this.isEnabled) return;
    
    this.isEnabled = true;
    this.wrapConsoleMethod('error', CONSOLE_FILTERS.errors);
    this.wrapConsoleMethod('warn', CONSOLE_FILTERS.warnings);
    this.wrapConsoleMethod('log', CONSOLE_FILTERS.logs);
  }

  public disable(): void {
    if (!this.isEnabled) return;
    
    Object.assign(console, this.originalConsole);
    this.isEnabled = false;
  }

  private wrapConsoleMethod(methodName: 'error' | 'warn' | 'log', patterns: ErrorPattern[]): void {
    const originalMethod = this.originalConsole[methodName];
    
    console[methodName] = (...args: any[]) => {
      const message = args.join(' ');
      let shouldSuppress = false;
      let shouldAudit = false;

      // Check against patterns
      for (const pattern of patterns) {
        if (pattern.pattern.test(message)) {
          shouldSuppress = pattern.suppress;
          shouldAudit = pattern.logToAudit;
          break;
        }
      }

      // Always audit financial and security related messages
      if (this.isFinanciallyRelevant(message)) {
        shouldAudit = true;
        shouldSuppress = false;
      }

      // Log to audit if required
      if (shouldAudit) {
        this.auditLog.push({
          timestamp: new Date().toISOString(),
          level: methodName,
          message,
          stack: methodName === 'error' ? new Error().stack : undefined
        });
      }

      // Show console message if not suppressed
      if (!shouldSuppress) {
        originalMethod.apply(console, args);
      }
    };
  }

  private isFinanciallyRelevant(message: string): boolean {
    const financialKeywords = [
      'credit', 'loan', 'payment', 'transaction', 'bank', 'account',
      'ssn', 'tax', 'income', 'financial', 'compliance', 'audit',
      'security', 'encryption', 'authentication', 'authorization'
    ];
    
    const lowerMessage = message.toLowerCase();
    return financialKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  public getAuditLog(): Array<{ timestamp: string; level: string; message: string; stack?: string }> {
    return [...this.auditLog];
  }

  public clearAuditLog(): void {
    this.auditLog = [];
  }

  public exportAuditLog(): string {
    return JSON.stringify(this.auditLog, null, 2);
  }
}

// Create singleton instance
export const consoleErrorSuppressor = new ConsoleErrorSuppressor();

// Auto-enable in development only
if (process.env.NODE_ENV === 'development') {
  consoleErrorSuppressor.enable();
  
  // Add global access for debugging
  (window as any).__consoleErrorSuppressor = consoleErrorSuppressor;
  
  debugLog('general', 'log_statement', '🧹 Console Error Suppressor enabled for development')
  debugLog('general', 'log_statement', '💡 Access via window.__consoleErrorSuppressor for debugging')

  // Console error suppressor for development
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    
    // Suppress specific noisy warnings in development
    if (
      typeof message === 'string' &&
      (message.includes('Warning: ReactDOM.render is no longer supported') ||
       message.includes('Warning: React.createRef() is deprecated') ||
       message.includes('Warning: componentWillReceiveProps has been renamed') ||
       message.includes('Warning: componentWillMount has been renamed') ||
       message.includes('Warning: componentWillUpdate has been renamed') ||
       message.includes('ResizeObserver loop limit exceeded') ||
       message.includes('Non-serializable values were found'))
    ) {
      return;
    }
    
    originalError.apply(console, args);
  };
}

// Global error handler for chunk loading errors
window.addEventListener('error', (event) => {
  const { error } = event;
  
  // Handle chunk loading errors
  if (error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk')) {
    console.warn('Global chunk loading error detected:', error);
    
    // Prevent the error from reaching React Error Boundaries
    event.preventDefault();
    
    // Show a user-friendly message
    const shouldReload = window.confirm(
      'A loading error occurred. Would you like to reload the page to fix this?'
    );
    
    if (shouldReload) {
      window.location.reload();
    }
    
    return false;
  }
});

// Handle unhandled promise rejections (like dynamic import failures)
window.addEventListener('unhandledrejection', (event) => {
  const { reason } = event;
  
  // Handle chunk loading promise rejections
  if (reason?.name === 'ChunkLoadError' || reason?.message?.includes('Loading chunk')) {
    console.warn('Global chunk loading promise rejection:', reason);
    
    // Prevent the unhandled rejection from causing issues
    event.preventDefault();
    
    // Show a user-friendly message
    const shouldReload = window.confirm(
      'A loading error occurred. Would you like to reload the page to fix this?'
    );
    
    if (shouldReload) {
      window.location.reload();
    }
    
    return false;
  }
}); 