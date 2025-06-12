import { useContext, useCallback } from 'react';
import { UserContext } from '../contexts/UserContext';
import { immutableLedgerService } from '../services/immutableLedgerService';

export const useLedgerRecorder = () => {
  const { user, userRole } = useContext(UserContext) || {};

  const recordDocumentUpload = useCallback(async (params: {
    documentId: string;
    documentName: string;
    customerId?: string;
    customerName?: string;
    transactionId?: string;
    metadata?: Record<string, any>;
  }) => {
    if (!user) return;

    await immutableLedgerService.recordEvent({
      eventType: 'document_upload',
      category: 'document',
      actor: {
        userId: user.id,
        userName: user.name,
        userRole: userRole || 'user'
      },
      subject: {
        type: 'document',
        id: params.documentId,
        name: params.documentName,
        metadata: params.metadata
      },
      action: `Uploaded document: ${params.documentName}`,
      customerId: params.customerId,
      customerName: params.customerName,
      transactionId: params.transactionId,
      documentId: params.documentId,
      details: {
        fileName: params.documentName,
        uploadTime: new Date().toISOString(),
        ...params.metadata
      }
    });
  }, [user, userRole]);

  const recordTransactionCreated = useCallback(async (params: {
    transactionId: string;
    transactionTitle: string;
    customerId?: string;
    customerName?: string;
    amount?: number;
    metadata?: Record<string, any>;
  }) => {
    if (!user) return;

    await immutableLedgerService.recordEvent({
      eventType: 'transaction_created',
      category: 'transaction',
      actor: {
        userId: user.id,
        userName: user.name,
        userRole: userRole || 'user'
      },
      subject: {
        type: 'transaction',
        id: params.transactionId,
        name: params.transactionTitle,
        metadata: params.metadata
      },
      action: `Created transaction: ${params.transactionTitle}`,
      customerId: params.customerId,
      customerName: params.customerName,
      transactionId: params.transactionId,
      details: {
        title: params.transactionTitle,
        amount: params.amount,
        createdAt: new Date().toISOString(),
        ...params.metadata
      }
    });
  }, [user, userRole]);

  const recordTransactionUpdated = useCallback(async (params: {
    transactionId: string;
    transactionTitle: string;
    customerId?: string;
    customerName?: string;
    changes: Record<string, any>;
    previousState?: any;
    newState?: any;
  }) => {
    if (!user) return;

    await immutableLedgerService.recordEvent({
      eventType: 'transaction_updated',
      category: 'transaction',
      actor: {
        userId: user.id,
        userName: user.name,
        userRole: userRole || 'user'
      },
      subject: {
        type: 'transaction',
        id: params.transactionId,
        name: params.transactionTitle
      },
      action: `Updated transaction: ${params.transactionTitle}`,
      customerId: params.customerId,
      customerName: params.customerName,
      transactionId: params.transactionId,
      previousState: params.previousState,
      newState: params.newState,
      details: {
        changes: params.changes,
        updatedAt: new Date().toISOString()
      }
    });
  }, [user, userRole]);

  const recordLoanApplication = useCallback(async (params: {
    applicationId: string;
    customerId: string;
    customerName: string;
    loanAmount: number;
    loanType: string;
    metadata?: Record<string, any>;
  }) => {
    if (!user) return;

    await immutableLedgerService.recordEvent({
      eventType: 'loan_application',
      category: 'loan',
      actor: {
        userId: user.id,
        userName: user.name,
        userRole: userRole || 'user'
      },
      subject: {
        type: 'loan',
        id: params.applicationId,
        name: `${params.loanType} - ${params.loanAmount}`,
        metadata: params.metadata
      },
      action: `Submitted loan application for ${params.loanType} - $${params.loanAmount.toLocaleString()}`,
      customerId: params.customerId,
      customerName: params.customerName,
      details: {
        loanType: params.loanType,
        loanAmount: params.loanAmount,
        applicationDate: new Date().toISOString(),
        ...params.metadata
      }
    });
  }, [user, userRole]);

  const recordApprovalDecision = useCallback(async (params: {
    entityType: 'loan' | 'transaction' | 'document';
    entityId: string;
    entityName: string;
    decision: 'approved' | 'rejected' | 'pending';
    reason?: string;
    customerId?: string;
    customerName?: string;
    transactionId?: string;
  }) => {
    if (!user) return;

    await immutableLedgerService.recordEvent({
      eventType: 'approval_decision',
      category: params.entityType === 'document' ? 'document' : params.entityType === 'loan' ? 'loan' : 'transaction',
      actor: {
        userId: user.id,
        userName: user.name,
        userRole: userRole || 'user'
      },
      subject: {
        type: params.entityType as any,
        id: params.entityId,
        name: params.entityName
      },
      action: `${params.decision.charAt(0).toUpperCase() + params.decision.slice(1)} ${params.entityType}: ${params.entityName}`,
      customerId: params.customerId,
      customerName: params.customerName,
      transactionId: params.transactionId,
      details: {
        decision: params.decision,
        reason: params.reason,
        decisionDate: new Date().toISOString()
      }
    });
  }, [user, userRole]);

  const recordSignature = useCallback(async (params: {
    documentId: string;
    documentName: string;
    signatureType: 'electronic' | 'digital';
    customerId?: string;
    customerName?: string;
    transactionId?: string;
  }) => {
    if (!user) return;

    await immutableLedgerService.recordEvent({
      eventType: 'signature_added',
      category: 'document',
      actor: {
        userId: user.id,
        userName: user.name,
        userRole: userRole || 'user'
      },
      subject: {
        type: 'document',
        id: params.documentId,
        name: params.documentName
      },
      action: `Added ${params.signatureType} signature to: ${params.documentName}`,
      customerId: params.customerId,
      customerName: params.customerName,
      transactionId: params.transactionId,
      documentId: params.documentId,
      details: {
        signatureType: params.signatureType,
        signedAt: new Date().toISOString(),
        signerName: user.name,
        signerRole: userRole
      }
    });
  }, [user, userRole]);

  const recordPayment = useCallback(async (params: {
    paymentId: string;
    amount: number;
    paymentType: 'loan_payment' | 'fee' | 'deposit' | 'withdrawal';
    customerId: string;
    customerName: string;
    transactionId?: string;
    metadata?: Record<string, any>;
  }) => {
    if (!user) return;

    await immutableLedgerService.recordEvent({
      eventType: 'payment_processed',
      category: 'financial',
      actor: {
        userId: user.id,
        userName: user.name,
        userRole: userRole || 'user'
      },
      subject: {
        type: 'transaction',
        id: params.paymentId,
        name: `${params.paymentType} - $${params.amount.toLocaleString()}`,
        metadata: params.metadata
      },
      action: `Processed ${params.paymentType.replace('_', ' ')}: $${params.amount.toLocaleString()}`,
      customerId: params.customerId,
      customerName: params.customerName,
      transactionId: params.transactionId,
      details: {
        amount: params.amount,
        paymentType: params.paymentType,
        processedAt: new Date().toISOString(),
        ...params.metadata
      }
    });
  }, [user, userRole]);

  const recordCustomerAction = useCallback(async (params: {
    customerId: string;
    customerName: string;
    action: string;
    details?: Record<string, any>;
  }) => {
    if (!user) return;

    await immutableLedgerService.recordEvent({
      eventType: 'customer_action',
      category: 'customer',
      actor: {
        userId: user.id,
        userName: user.name,
        userRole: userRole || 'user'
      },
      subject: {
        type: 'customer',
        id: params.customerId,
        name: params.customerName
      },
      action: params.action,
      customerId: params.customerId,
      customerName: params.customerName,
      details: {
        timestamp: new Date().toISOString(),
        ...params.details
      }
    });
  }, [user, userRole]);

  const recordSecurityEvent = useCallback(async (params: {
    eventType: 'user_login' | 'permission_change' | 'data_export';
    action: string;
    targetUserId?: string;
    targetUserName?: string;
    details?: Record<string, any>;
  }) => {
    if (!user) return;

    await immutableLedgerService.recordEvent({
      eventType: params.eventType,
      category: 'security',
      actor: {
        userId: user.id,
        userName: user.name,
        userRole: userRole || 'user'
      },
      subject: {
        type: 'user',
        id: params.targetUserId || user.id,
        name: params.targetUserName || user.name
      },
      action: params.action,
      details: {
        timestamp: new Date().toISOString(),
        ipAddress: (window as any).clientIP || 'unknown',
        userAgent: navigator.userAgent,
        ...params.details
      }
    });
  }, [user, userRole]);

  return {
    recordDocumentUpload,
    recordTransactionCreated,
    recordTransactionUpdated,
    recordLoanApplication,
    recordApprovalDecision,
    recordSignature,
    recordPayment,
    recordCustomerAction,
    recordSecurityEvent
  };
};

export default useLedgerRecorder;