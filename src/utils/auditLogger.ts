// Removed circular import - using console.log directly for internal logging

/**
 * =============================================================================
 * FINANCIAL COMPLIANCE AUDIT LOGGER
 * =============================================================================
 *
 * Tier 1 (MANDATORY) - Critical financial security & compliance
 * - All financial operations must have audit trails
 * - Comprehensive logging for debugging financial calculations
 * - Alert systems for compliance violations or system errors
 */

interface AuditLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug' | 'audit';
  category: string;
  action: string;
  userId?: string;
  customerId?: string;
  transactionId?: string;
  data?: any;
  ip?: string;
  userAgent?: string;
  complianceFlags?: string[];
  sensitiveDataMasked?: boolean;
  stack?: string;
}

interface FinancialOperation {
  type:
    | 'loan_calculation'
    | 'payment_processing'
    | 'document_upload'
    | 'business_lookup'
    | 'risk_assessment';
  inputs: any;
  outputs: any;
  duration: number;
  success: boolean;
  complianceChecked: boolean;
}

class FinancialAuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogSize = 10000;
  private isDevelopment: boolean;
  private sensitiveFields = [
    'ssn',
    'tax_id',
    'bank_account',
    'routing_number',
    'password',
    'api_key',
  ];

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * TIER 1 MANDATORY: Log financial operations with audit trail
   */
  logFinancialOperation(operation: FinancialOperation, userId?: string, customerId?: string): void {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'audit',
      category: 'financial_operation',
      action: operation.type,
      userId,
      customerId,
      data: {
        inputs: this.maskSensitiveData(operation.inputs),
        outputs: this.maskSensitiveData(operation.outputs),
        duration: operation.duration,
        success: operation.success,
        complianceChecked: operation.complianceChecked,
      },
      complianceFlags: this.checkComplianceFlags(operation),
      sensitiveDataMasked: true,
    };

    this.addLogEntry(entry);

    // In development, also log to console for debugging
    if (this.isDevelopment) {
      console.log(`[AUDIT] ${operation.type}:`, {
        success: operation.success,
        duration: `${operation.duration}ms`,
        compliance: operation.complianceChecked ? '✓' : '❌',
      });
    }
  }

  /**
   * TIER 1 MANDATORY: Log security events
   */
  logSecurityEvent(action: string, success: boolean, userId?: string, details?: any): void {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      level: success ? 'info' : 'warn',
      category: 'security',
      action,
      userId,
      data: this.maskSensitiveData(details),
      complianceFlags: success ? [] : ['SECURITY_VIOLATION'],
      sensitiveDataMasked: true,
    };

    this.addLogEntry(entry);

    // Always log security events to console in development
    if (this.isDevelopment) {
      const status = success ? '✅' : '🚨';
      console.log(`[SECURITY] ${status} ${action}:`, userId || 'anonymous');
    }
  }

  /**
   * TIER 1 MANDATORY: Log compliance checks
   */
  logComplianceCheck(checkType: string, passed: boolean, data?: any): void {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      level: passed ? 'info' : 'error',
      category: 'compliance',
      action: checkType,
      data: this.maskSensitiveData(data),
      complianceFlags: passed ? [] : ['COMPLIANCE_VIOLATION'],
      sensitiveDataMasked: true,
    };

    this.addLogEntry(entry);

    if (this.isDevelopment) {
      const status = passed ? '✅' : '❌';
      console.log(`[COMPLIANCE] ${status} ${checkType}`);
    }
  }

  /**
   * TIER 2 IMPORTANT: Development debugging (replaces console.log)
   */
  debug(category: string, action: string, data?: any): void {
    if (!this.isDevelopment) return;

    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      category,
      action,
      data: this.maskSensitiveData(data),
      sensitiveDataMasked: true,
    };

    this.addLogEntry(entry);
    console.log(`[DEBUG] ${category}:${action}`, data);
  }

  /**
   * TIER 2 IMPORTANT: Log business process steps
   */
  logBusinessProcess(process: string, step: string, success: boolean, data?: any): void {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      level: success ? 'info' : 'warn',
      category: 'business_process',
      action: `${process}:${step}`,
      data: this.maskSensitiveData(data),
      complianceFlags: success ? [] : ['PROCESS_FAILURE'],
      sensitiveDataMasked: true,
    };

    this.addLogEntry(entry);

    if (this.isDevelopment) {
      const status = success ? '✅' : '❌';
      console.log(`[PROCESS] ${status} ${process} → ${step}`);
    }
  }

  /**
   * TIER 2 IMPORTANT: Log API interactions
   */
  logAPICall(
    endpoint: string,
    method: string,
    status: number,
    duration: number,
    userId?: string,
  ): void {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      level: status >= 400 ? 'error' : 'info',
      category: 'api',
      action: `${method} ${endpoint}`,
      userId,
      data: { status, duration },
      complianceFlags: status >= 500 ? ['SYSTEM_ERROR'] : [],
    };

    this.addLogEntry(entry);

    if (this.isDevelopment) {
      const statusColor = status >= 400 ? '🔴' : '🟢';
      console.log(`[API] ${statusColor} ${method} ${endpoint} (${status}) ${duration}ms`);
    }
  }

  /**
   * Error logging with stack traces
   */
  logError(category: string, error: Error | string, context?: any): void {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      category,
      action: 'error',
      data: {
        message: error instanceof Error ? error.message : error,
        context: this.maskSensitiveData(context),
      },
      stack: error instanceof Error ? error.stack : undefined,
      complianceFlags: ['SYSTEM_ERROR'],
      sensitiveDataMasked: true,
    };

    this.addLogEntry(entry);

    // Always log errors to console
    console.error(`[ERROR] ${category}:`, error, context);
  }

  /**
   * Warning logging
   */
  logWarning(category: string, message: string, data?: any): void {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      category,
      action: 'warning',
      data: this.maskSensitiveData(data),
      sensitiveDataMasked: true,
    };

    this.addLogEntry(entry);

    if (this.isDevelopment) {
      console.warn(`[WARNING] ${category}: ${message}`, data);
    }
  }

  /**
   * Mask sensitive data for compliance
   */
  private maskSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const masked = { ...data };

    Object.keys(masked).forEach(key => {
      if (this.sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        if (typeof masked[key] === 'string') {
          masked[key] = this.maskString(masked[key]);
        } else {
          masked[key] = '[MASKED]';
        }
      }
    });

    return masked;
  }

  private maskString(value: string): string {
    if (value.length <= 4) return '***';
    return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
  }

  private checkComplianceFlags(operation: FinancialOperation): string[] {
    const flags: string[] = [];

    if (!operation.complianceChecked) {
      flags.push('COMPLIANCE_NOT_VERIFIED');
    }

    if (!operation.success) {
      flags.push('OPERATION_FAILED');
    }

    if (operation.duration > 30000) {
      // 30 seconds
      flags.push('PERFORMANCE_DEGRADATION');
    }

    return flags;
  }

  private addLogEntry(entry: AuditLogEntry): void {
    this.logs.push(entry);

    // Maintain log size limit
    if (this.logs.length > this.maxLogSize) {
      this.logs = this.logs.slice(-this.maxLogSize);
    }
  }

  /**
   * Get audit trail for compliance reporting
   */
  getAuditTrail(
    userId?: string,
    customerId?: string,
    fromDate?: Date,
    toDate?: Date,
  ): AuditLogEntry[] {
    let filtered = this.logs;

    if (userId) {
      filtered = filtered.filter(log => log.userId === userId);
    }

    if (customerId) {
      filtered = filtered.filter(log => log.customerId === customerId);
    }

    if (fromDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= fromDate);
    }

    if (toDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= toDate);
    }

    return filtered;
  }

  /**
   * Export audit logs for compliance
   */
  exportAuditLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Clear logs (only for development/testing)
   */
  clearLogs(): void {
    if (this.isDevelopment) {
      this.logs = [];
      console.log('[AUDIT] Logs cleared (development mode)');
    }
  }
}

// Singleton instance
export const auditLogger = new FinancialAuditLogger();

// Convenience methods for common operations
export const logFinancialOperation = (
  operation: FinancialOperation,
  userId?: string,
  customerId?: string,
) => auditLogger.logFinancialOperation(operation, userId, customerId);

export const logSecurityEvent = (
  action: string,
  success: boolean,
  userId?: string,
  details?: any,
) => auditLogger.logSecurityEvent(action, success, userId, details);

export const logComplianceCheck = (checkType: string, passed: boolean, data?: any) =>
  auditLogger.logComplianceCheck(checkType, passed, data);

export const debugLog = (category: string, action: string, message?: string, data?: any) => {
  if (data !== undefined) {
    auditLogger.debug(category, `${action}: ${message}`, data);
  } else if (message !== undefined) {
    auditLogger.debug(category, action, message);
  } else {
    auditLogger.debug(category, action);
  }
};

export const logBusinessProcess = (process: string, step: string, success: boolean, data?: any) =>
  auditLogger.logBusinessProcess(process, step, success, data);

export const logAPICall = (
  endpoint: string,
  method: string,
  status: number,
  duration: number,
  userId?: string,
) => auditLogger.logAPICall(endpoint, method, status, duration, userId);

export const logError = (category: string, error: Error | string, context?: any) =>
  auditLogger.logError(category, error, context);

export const logWarning = (category: string, message: string, data?: any) =>
  auditLogger.logWarning(category, message, data);
