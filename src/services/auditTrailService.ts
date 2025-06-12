import { debugLog } from '../utils/auditLogger';

/**
 * Audit Trail Service
 * Complies with: include-audit-trails-for-all-loan-application-state-changes
 */

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

class AuditTrailService {
  private auditQueue: AuditEntry[] = [];
  private flushInterval: number | null = null;

  constructor() {
    // Start the flush interval
    this.startFlushInterval();
  }

  /**
   * Log an audit entry
   */
  public log(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void {
    const auditEntry: AuditEntry = {
      ...entry,
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      ipAddress: this.getClientIpAddress(),
      userAgent: navigator.userAgent,
    };

    // Add to queue
    this.auditQueue.push(auditEntry);

    // Store locally for immediate persistence
    this.storeLocally(auditEntry);

    // If queue is getting large, flush immediately
    if (this.auditQueue.length >= 10) {
      this.flush();
    }
  }

  /**
   * Log a loan application state change
   */
  public logLoanApplicationChange(
    applicationId: string,
    oldState: string,
    newState: string,
    userId: string,
    additionalData?: Record<string, any>
  ): void {
    this.log({
      userId,
      action: 'LOAN_APPLICATION_STATE_CHANGE',
      entityType: 'LoanApplication',
      entityId: applicationId,
      changes: [
        {
          field: 'state',
          oldValue: oldState,
          newValue: newState,
        },
      ],
      metadata: {
        ...additionalData,
        stateTransition: `${oldState} -> ${newState}`,
      },
    });
  }

  /**
   * Log financial calculation
   */
  public logFinancialCalculation(
    calculationType: string,
    inputs: Record<string, any>,
    result: any,
    userId: string
  ): void {
    this.log({
      userId,
      action: 'FINANCIAL_CALCULATION',
      entityType: 'Calculation',
      entityId: calculationType,
      metadata: {
        inputs,
        result,
        precision: this.getDecimalPrecision(result),
      },
    });
  }

  /**
   * Log document processing
   */
  public logDocumentProcessing(
    documentId: string,
    documentType: string,
    action: string,
    userId: string,
    metadata?: Record<string, any>
  ): void {
    this.log({
      userId,
      action: `DOCUMENT_${action.toUpperCase()}`,
      entityType: 'Document',
      entityId: documentId,
      metadata: {
        documentType,
        ...metadata,
      },
    });
  }

  /**
   * Log API integration call
   */
  public logApiIntegration(
    apiName: string,
    endpoint: string,
    method: string,
    userId: string,
    success: boolean,
    responseTime?: number
  ): void {
    this.log({
      userId,
      action: 'API_INTEGRATION_CALL',
      entityType: 'ApiIntegration',
      entityId: apiName,
      metadata: {
        endpoint,
        method,
        success,
        responseTime,
      },
    });
  }

  /**
   * Log security event
   */
  public logSecurityEvent(eventType: string, userId: string, details: Record<string, any>): void {
    this.log({
      userId,
      action: `SECURITY_${eventType.toUpperCase()}`,
      entityType: 'Security',
      entityId: eventType,
      metadata: details,
    });
  }

  /**
   * Get audit trail for an entity
   */
  public async getAuditTrail(
    entityType: string,
    entityId: string,
    limit: number = 100
  ): Promise<AuditEntry[]> {
    // In production, this would query the backend
    // For now, get from local storage
    const stored = localStorage.getItem(`audit_${entityType}_${entityId}`);
    if (stored) {
      const entries = JSON.parse(stored) as AuditEntry[];
      return entries.slice(-limit);
    }
    return [];
  }

  /**
   * Get user activity
   */
  public async getUserActivity(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditEntry[]> {
    // In production, this would query the backend
    const stored = localStorage.getItem(`audit_user_${userId}`);
    if (stored) {
      let entries = JSON.parse(stored) as AuditEntry[];

      // Filter by date range if provided
      if (startDate || endDate) {
        entries = entries.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          if (startDate && entryDate < startDate) return false;
          if (endDate && entryDate > endDate) return false;
          return true;
        });
      }

      return entries;
    }
    return [];
  }

  /**
   * Private methods
   */

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIpAddress(): string {
    // In production, this would be obtained from the server
    return 'client-ip';
  }

  private getDecimalPrecision(value: any): number {
    if (typeof value !== 'number') return 0;
    const str = value.toString();
    const decimal = str.split('.')[1];
    return decimal ? decimal.length : 0;
  }

  private storeLocally(entry: AuditEntry): void {
    // Store by entity
    const entityKey = `audit_${entry.entityType}_${entry.entityId}`;
    const existing = localStorage.getItem(entityKey);
    const entries = existing ? JSON.parse(existing) : [];
    entries.push(entry);

    // Keep only last 1000 entries per entity
    if (entries.length > 1000) {
      entries.splice(0, entries.length - 1000);
    }

    localStorage.setItem(entityKey, JSON.stringify(entries));

    // Also store by user
    const userKey = `audit_user_${entry.userId}`;
    const userExisting = localStorage.getItem(userKey);
    const userEntries = userExisting ? JSON.parse(userExisting) : [];
    userEntries.push(entry);

    // Keep only last 1000 entries per user
    if (userEntries.length > 1000) {
      userEntries.splice(0, userEntries.length - 1000);
    }

    localStorage.setItem(userKey, JSON.stringify(userEntries));
  }

  private startFlushInterval(): void {
    // Flush every 30 seconds
    this.flushInterval = setInterval(() => {
      if (this.auditQueue.length > 0) {
        this.flush();
      }
    }, 30000) as any as number;
  }

  private async flush(): Promise<void> {
    if (this.auditQueue.length === 0) return;

    const entriesToFlush = [...this.auditQueue];
    this.auditQueue = [];

    try {
      // In production, send to backend API
      debugLog('general', 'log_statement', 'Flushing audit entries to backend:', entriesToFlush)

      // Simulate API call
      await this.sendToBackend(entriesToFlush);
    } catch (error) {
      console.error('Failed to flush audit entries:', error);
      // Re-add to queue for retry
      this.auditQueue.unshift(...entriesToFlush);
    }
  }

  private async sendToBackend(entries: AuditEntry[]): Promise<void> {
    // In production, this would be an actual API call
    // For now, just log
    debugLog('general', 'log_statement', 'Audit entries sent to backend:', entries)
  }

  /**
   * Cleanup method
   */
  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    // Flush any remaining entries
    this.flush();
  }
}

// Export singleton instance
export const auditTrailService = new AuditTrailService();

// Export for use in React hooks
export const useAuditTrail = () => {
  return auditTrailService;
};

export default auditTrailService;
