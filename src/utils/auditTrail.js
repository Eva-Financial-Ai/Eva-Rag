// Financial Audit Trail System
// Implements comprehensive audit logging for SOX and PCI DSS compliance
// Tracks all financial state changes, document access, and user actions

import { logger } from './logger.js';

import { debugLog } from './auditLogger';

class FinancialAuditTrail {
  constructor() {
    this.auditEndpoint = '/api/audit';
    this.batchSize = 10;
    this.auditQueue = [];
    this.flushInterval = 5000; // 5 seconds
    
    // Start batch processing
    this.startBatchProcessor();
    
    // Critical events that always require immediate logging
    this.criticalEvents = [
      'LOAN_APPROVED', 'LOAN_DENIED', 'PAYMENT_PROCESSED', 
      'DOCUMENT_ACCESSED', 'PII_ACCESSED', 'ADMIN_ACTION',
      'SECURITY_VIOLATION', 'LOGIN_FAILURE', 'PRIVILEGE_ESCALATION'
    ];
  }

  /**
   * Log financial state change
   * @param {string} eventType - Type of event (LOAN_STATUS_CHANGE, DOCUMENT_UPLOAD, etc.)
   * @param {object} details - Event details
   * @param {object} context - User and system context
   */
  logFinancialEvent(eventType, details, context = {}) {
    const auditEntry = this.createAuditEntry(eventType, details, context);
    
    // Immediate logging for critical events
    if (this.criticalEvents.includes(eventType)) {
      this.sendAuditEntry(auditEntry, true);
    } else {
      this.queueAuditEntry(auditEntry);
    }
    
    return auditEntry.auditId;
  }

  /**
   * Log loan application state changes
   * @param {string} loanId - Loan application ID
   * @param {string} previousState - Previous loan state
   * @param {string} newState - New loan state
   * @param {string} userId - User making the change
   * @param {object} additionalData - Additional context
   */
  logLoanStateChange(loanId, previousState, newState, userId, additionalData = {}) {
    return this.logFinancialEvent('LOAN_STATUS_CHANGE', {
      loanId,
      previousState,
      newState,
      stateChangeReason: additionalData.reason || 'Not specified',
      automatedChange: additionalData.automated || false,
      reviewerComments: additionalData.comments || null,
      riskScore: additionalData.riskScore || null,
      ...additionalData
    }, {
      userId,
      userRole: additionalData.userRole || 'unknown',
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    });
  }

  /**
   * Log document access for compliance
   * @param {string} documentId - Document ID
   * @param {string} action - ACCESS, DOWNLOAD, VIEW, DELETE
   * @param {string} userId - User accessing document
   * @param {object} documentMetadata - Document metadata
   */
  logDocumentAccess(documentId, action, userId, documentMetadata = {}) {
    return this.logFinancialEvent('DOCUMENT_ACCESS', {
      documentId,
      action,
      documentType: documentMetadata.type || 'unknown',
      documentSize: documentMetadata.size || null,
      containsPII: documentMetadata.containsPII || false,
      loanId: documentMetadata.loanId || null,
      customerId: documentMetadata.customerId || null
    }, {
      userId,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId(),
      referrer: document.referrer
    });
  }

  /**
   * Log PII data access
   * @param {string} fieldName - Name of PII field accessed
   * @param {string} action - VIEW, DECRYPT, EXPORT
   * @param {string} userId - User accessing PII
   * @param {object} context - Additional context
   */
  logPIIAccess(fieldName, action, userId, context = {}) {
    return this.logFinancialEvent('PII_ACCESS', {
      fieldName,
      action,
      dataType: this.classifyPIIType(fieldName),
      customerId: context.customerId || null,
      loanId: context.loanId || null,
      businessJustification: context.justification || 'Not provided'
    }, {
      userId,
      userRole: context.userRole || 'unknown',
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    });
  }

  /**
   * Log payment processing events
   * @param {string} paymentId - Payment ID
   * @param {string} action - INITIATED, COMPLETED, FAILED, REVERSED
   * @param {number} amount - Payment amount
   * @param {object} paymentDetails - Payment details
   */
  logPaymentEvent(paymentId, action, amount, paymentDetails = {}) {
    return this.logFinancialEvent('PAYMENT_EVENT', {
      paymentId,
      action,
      amount,
      currency: paymentDetails.currency || 'USD',
      paymentMethod: paymentDetails.method || 'unknown',
      loanId: paymentDetails.loanId || null,
      customerId: paymentDetails.customerId || null,
      processorResponse: paymentDetails.processorResponse || null,
      failureReason: paymentDetails.failureReason || null
    }, {
      userId: paymentDetails.userId || 'system',
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    });
  }

  /**
   * Log security events
   * @param {string} eventType - Type of security event
   * @param {object} details - Security event details
   * @param {string} severity - LOW, MEDIUM, HIGH, CRITICAL
   */
  logSecurityEvent(eventType, details, severity = 'MEDIUM') {
    return this.logFinancialEvent('SECURITY_EVENT', {
      securityEventType: eventType,
      severity,
      threatLevel: this.calculateThreatLevel(eventType, severity),
      ...details
    }, {
      userId: details.userId || 'unknown',
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId(),
      detectionMethod: details.detectionMethod || 'manual'
    });
  }

  /**
   * Log administrative actions
   * @param {string} action - Administrative action taken
   * @param {object} details - Action details
   * @param {string} adminUserId - Admin user ID
   */
  logAdminAction(action, details, adminUserId) {
    return this.logFinancialEvent('ADMIN_ACTION', {
      action,
      targetUserId: details.targetUserId || null,
      targetResource: details.targetResource || null,
      previousValue: details.previousValue || null,
      newValue: details.newValue || null,
      actionReason: details.reason || 'Not specified',
      ...details
    }, {
      userId: adminUserId,
      userRole: 'administrator',
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId(),
      requiresApproval: details.requiresApproval || false
    });
  }

  /**
   * Create standardized audit entry
   * @param {string} eventType - Type of event
   * @param {object} details - Event details
   * @param {object} context - Context information
   * @returns {object} - Formatted audit entry
   */
  createAuditEntry(eventType, details, context) {
    const timestamp = new Date().toISOString();
    const auditId = this.generateAuditId();
    
    return {
      auditId,
      timestamp,
      eventType,
      details: {
        ...details,
        eventVersion: '1.0' // For schema versioning
      },
      context: {
        ...context,
        applicationVersion: process.env.REACT_APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        correlationId: this.getCorrelationId()
      },
      compliance: {
        sox: this.isSOXRelevant(eventType),
        pciDss: this.isPCIDSSRelevant(eventType),
        gdpr: this.isGDPRRelevant(eventType),
        retentionPeriod: this.getRetentionPeriod(eventType)
      },
      integrity: {
        checksum: this.calculateChecksum(eventType, details, context, timestamp)
      }
    };
  }

  /**
   * Queue audit entry for batch processing
   * @param {object} auditEntry - Audit entry to queue
   */
  queueAuditEntry(auditEntry) {
    this.auditQueue.push(auditEntry);
    
    // Flush immediately if queue is full
    if (this.auditQueue.length >= this.batchSize) {
      this.flushAuditQueue();
    }
  }

  /**
   * Send audit entry immediately
   * @param {object} auditEntry - Audit entry to send
   * @param {boolean} critical - Whether this is a critical event
   */
  async sendAuditEntry(auditEntry, critical = false) {
    try {
      const response = await fetch(this.auditEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Audit-Critical': critical ? 'true' : 'false'
        },
        body: JSON.stringify({
          entries: [auditEntry],
          batch: false,
          critical
        })
      });

      if (!response.ok) {
        throw new Error(`Audit API error: ${response.status}`);
      }

      // Log successful audit entry
      if (process.env.NODE_ENV === 'development') {
        debugLog('general', 'log_statement', `[AUDIT] ${auditEntry.eventType} logged:`, auditEntry.auditId)
      }

    } catch (error) {
      console.error('Failed to send audit entry:', error);
      
      // Store failed audit entries for retry
      this.storeFailedAuditEntry(auditEntry, error);
    }
  }

  /**
   * Flush queued audit entries
   */
  async flushAuditQueue() {
    if (this.auditQueue.length === 0) return;

    const entries = [...this.auditQueue];
    this.auditQueue = [];

    try {
      const response = await fetch(this.auditEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Audit-Batch': 'true'
        },
        body: JSON.stringify({
          entries,
          batch: true,
          batchSize: entries.length
        })
      });

      if (!response.ok) {
        throw new Error(`Audit batch API error: ${response.status}`);
      }

      logger.info(`Audit batch sent: ${entries.length} entries`);

    } catch (error) {
      console.error('Failed to send audit batch:', error);
      
      // Re-queue failed entries
      entries.forEach(entry => this.storeFailedAuditEntry(entry, error));
    }
  }

  /**
   * Start batch processor
   */
  startBatchProcessor() {
    setInterval(() => {
      this.flushAuditQueue();
    }, this.flushInterval);
  }

  /**
   * Store failed audit entry for retry
   * @param {object} auditEntry - Failed audit entry
   * @param {Error} error - Error that occurred
   */
  storeFailedAuditEntry(auditEntry, error) {
    try {
      const failedEntries = JSON.parse(
        localStorage.getItem('failedAuditEntries') || '[]'
      );
      
      failedEntries.push({
        ...auditEntry,
        failureInfo: {
          error: error.message,
          failedAt: new Date().toISOString(),
          retryCount: 0
        }
      });
      
      // Keep only last 100 failed entries
      if (failedEntries.length > 100) {
        failedEntries.splice(0, failedEntries.length - 100);
      }
      
      localStorage.setItem('failedAuditEntries', JSON.stringify(failedEntries));
      
    } catch (storageError) {
      console.error('Failed to store failed audit entry:', storageError);
    }
  }

  // Utility methods
  generateAuditId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSessionId() {
    return sessionStorage.getItem('sessionId') || 'unknown';
  }

  getCorrelationId() {
    return sessionStorage.getItem('correlationId') || this.generateAuditId();
  }

  getClientIP() {
    // In a real application, this would be determined server-side
    return 'client-side-unknown';
  }

  classifyPIIType(fieldName) {
    const fieldLower = fieldName.toLowerCase();
    if (fieldLower.includes('ssn') || fieldLower.includes('social')) return 'SSN';
    if (fieldLower.includes('bank') || fieldLower.includes('account')) return 'BANK_ACCOUNT';
    if (fieldLower.includes('credit') || fieldLower.includes('card')) return 'CREDIT_CARD';
    if (fieldLower.includes('tax')) return 'TAX_ID';
    return 'OTHER_PII';
  }

  calculateThreatLevel(eventType, severity) {
    const threatMatrix = {
      'LOGIN_FAILURE': { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 },
      'DATA_BREACH': { LOW: 3, MEDIUM: 4, HIGH: 5, CRITICAL: 5 },
      'PRIVILEGE_ESCALATION': { LOW: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 }
    };
    
    return threatMatrix[eventType]?.[severity] || 1;
  }

  calculateChecksum(eventType, details, context, timestamp) {
    const data = JSON.stringify({ eventType, details, context, timestamp });
    // Simple checksum - in production, use a proper cryptographic hash
    return btoa(data).slice(0, 16);
  }

  isSOXRelevant(eventType) {
    const soxEvents = [
      'LOAN_STATUS_CHANGE', 'PAYMENT_EVENT', 'ADMIN_ACTION', 
      'FINANCIAL_RECORD_CHANGE', 'AUDIT_LOG_ACCESS'
    ];
    return soxEvents.includes(eventType);
  }

  isPCIDSSRelevant(eventType) {
    const pciEvents = [
      'PAYMENT_EVENT', 'CREDIT_CARD_ACCESS', 'PII_ACCESS', 
      'SECURITY_EVENT', 'DOCUMENT_ACCESS'
    ];
    return pciEvents.includes(eventType);
  }

  isGDPRRelevant(eventType) {
    const gdprEvents = [
      'PII_ACCESS', 'DOCUMENT_ACCESS', 'DATA_EXPORT', 
      'DATA_DELETION', 'CONSENT_CHANGE'
    ];
    return gdprEvents.includes(eventType);
  }

  getRetentionPeriod(eventType) {
    // Retention periods in days based on compliance requirements
    const retentionPeriods = {
      'LOAN_STATUS_CHANGE': 2555, // 7 years
      'PAYMENT_EVENT': 2555, // 7 years
      'DOCUMENT_ACCESS': 2190, // 6 years
      'PII_ACCESS': 2190, // 6 years
      'SECURITY_EVENT': 1095, // 3 years
      'ADMIN_ACTION': 2555 // 7 years
    };
    
    return retentionPeriods[eventType] || 1095; // Default 3 years
  }
}

// Create singleton instance
export const auditTrail = new FinancialAuditTrail();

// Export convenience functions
export const logLoanStateChange = (loanId, previousState, newState, userId, additionalData) =>
  auditTrail.logLoanStateChange(loanId, previousState, newState, userId, additionalData);

export const logDocumentAccess = (documentId, action, userId, documentMetadata) =>
  auditTrail.logDocumentAccess(documentId, action, userId, documentMetadata);

export const logPIIAccess = (fieldName, action, userId, context) =>
  auditTrail.logPIIAccess(fieldName, action, userId, context);

export const logPaymentEvent = (paymentId, action, amount, paymentDetails) =>
  auditTrail.logPaymentEvent(paymentId, action, amount, paymentDetails);

export const logSecurityEvent = (eventType, details, severity) =>
  auditTrail.logSecurityEvent(eventType, details, severity);

export const logAdminAction = (action, details, adminUserId) =>
  auditTrail.logAdminAction(action, details, adminUserId);

export default auditTrail; 