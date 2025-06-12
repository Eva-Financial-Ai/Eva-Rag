import { apiClient } from '../api/apiClient';
import { getBlockchainService } from './blockchainIntegrationService';

import { debugLog } from '../utils/auditLogger';

export interface LedgerRecord {
  id: string;
  timestamp: Date;
  blockNumber?: number;
  transactionHash?: string;
  eventType:
    | 'document_upload'
    | 'transaction_created'
    | 'transaction_updated'
    | 'customer_action'
    | 'loan_application'
    | 'approval_decision'
    | 'signature_added'
    | 'payment_processed'
    | 'user_login'
    | 'permission_change'
    | 'data_export'
    | 'system_event';
  category: 'document' | 'transaction' | 'customer' | 'loan' | 'security' | 'financial' | 'system';
  actor: {
    userId: string;
    userName: string;
    userRole: string;
    ipAddress?: string;
  };
  subject: {
    type: 'customer' | 'transaction' | 'document' | 'loan' | 'user' | 'system';
    id: string;
    name: string;
    metadata?: Record<string, any>;
  };
  action: string; // Human-readable action description
  details: Record<string, any>;
  customerId?: string;
  customerName?: string;
  transactionId?: string;
  documentId?: string;
  previousState?: any;
  newState?: any;
  verified: boolean;
  immutableHash: string;
  chainId?: string;
  tags: string[];
}

export interface LedgerFilter {
  startDate?: Date;
  endDate?: Date;
  customerId?: string;
  transactionId?: string;
  eventTypes?: string[];
  categories?: string[];
  userIds?: string[];
  verified?: boolean;
  searchQuery?: string;
}

export interface LedgerStatistics {
  totalRecords: number;
  verifiedRecords: number;
  recordsByCategory: Record<string, number>;
  recordsByEventType: Record<string, number>;
  recentActivity: LedgerRecord[];
  topActors: Array<{ userId: string; userName: string; count: number }>;
}

class ImmutableLedgerService {
  private static instance: ImmutableLedgerService;
  private records: Map<string, LedgerRecord> = new Map();
  private blockchainService = getBlockchainService('polygon', true);
  private isInitialized = false;
  private recordQueue: LedgerRecord[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): ImmutableLedgerService {
    if (!ImmutableLedgerService.instance) {
      ImmutableLedgerService.instance = new ImmutableLedgerService();
    }
    return ImmutableLedgerService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load existing records from backend
      const response = await apiClient.get<{ records: LedgerRecord[] }>('/api/ledger/records');
      if (response.success && response.data) {
        response.data.records.forEach(record => {
          this.records.set(record.id, record);
        });
      }
    } catch (error) {
      console.error('[ImmutableLedger] Initialization error:', error);
      // Add demo records if backend fails
      await this.initializeDemoRecords();
    }

    this.isInitialized = true;
    debugLog('immutable_ledger', 'initialization', '[ImmutableLedger] Initialized', { recordCount: this.records.size })
  }

  private async initializeDemoRecords(): Promise<void> {
    const demoRecords: LedgerRecord[] = [
      {
        id: 'demo_1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        eventType: 'document_upload',
        category: 'document',
        actor: { userId: 'user1', userName: 'John Smith', userRole: 'lender' },
        subject: { type: 'document', id: 'doc1', name: 'Financial Statement Q4 2023.pdf' },
        action: 'Uploaded document: Financial Statement Q4 2023.pdf',
        customerId: 'cust1',
        customerName: 'ABC Corporation',
        transactionId: 'tx1',
        documentId: 'doc1',
        verified: true,
        immutableHash: '0x' + 'a'.repeat(64),
        blockNumber: 12345678,
        transactionHash: '0x' + 'b'.repeat(64),
        details: { fileSize: 2048000, fileType: 'application/pdf' },
        tags: ['financial', 'quarterly'],
      },
      {
        id: 'demo_2',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        eventType: 'transaction_created',
        category: 'transaction',
        actor: { userId: 'user2', userName: 'Jane Doe', userRole: 'broker' },
        subject: { type: 'transaction', id: 'tx2', name: 'Working Capital Loan #67890' },
        action: 'Created transaction: Working Capital Loan #67890',
        customerId: 'cust2',
        customerName: 'XYZ Industries',
        transactionId: 'tx2',
        verified: true,
        immutableHash: '0x' + 'c'.repeat(64),
        details: { amount: 250000, loanType: 'Working Capital' },
        tags: ['loan', 'working-capital'],
      },
      {
        id: 'demo_3',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        eventType: 'approval_decision',
        category: 'loan',
        actor: { userId: 'user1', userName: 'John Smith', userRole: 'lender' },
        subject: { type: 'loan', id: 'loan1', name: 'Equipment Loan Application' },
        action: 'Approved loan: Equipment Loan Application',
        customerId: 'cust1',
        customerName: 'ABC Corporation',
        transactionId: 'tx1',
        verified: false,
        immutableHash: '0x' + 'd'.repeat(64),
        details: { decision: 'approved', amount: 150000 },
        tags: ['approval', 'equipment-loan'],
      },
      {
        id: 'demo_4',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        eventType: 'signature_added',
        category: 'document',
        actor: { userId: 'user3', userName: 'Bob Johnson', userRole: 'borrower' },
        subject: { type: 'document', id: 'doc2', name: 'Loan Agreement.pdf' },
        action: 'Added electronic signature to: Loan Agreement.pdf',
        customerId: 'cust3',
        customerName: 'Demo Customer',
        transactionId: 'tx3',
        documentId: 'doc2',
        verified: true,
        immutableHash: '0x' + 'e'.repeat(64),
        blockNumber: 12345680,
        details: { signatureType: 'electronic' },
        tags: ['signature', 'agreement'],
      },
      {
        id: 'demo_5',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        eventType: 'customer_action',
        category: 'customer',
        actor: { userId: 'user4', userName: 'Alice Brown', userRole: 'vendor' },
        subject: { type: 'customer', id: 'cust2', name: 'XYZ Industries' },
        action: 'Updated customer profile information',
        customerId: 'cust2',
        customerName: 'XYZ Industries',
        verified: false,
        immutableHash: '0x' + 'f'.repeat(64),
        details: { fieldsUpdated: ['phone', 'address'] },
        tags: ['profile', 'update'],
      },
      {
        id: 'demo_6',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        eventType: 'payment_processed',
        category: 'financial',
        actor: { userId: 'system', userName: 'System', userRole: 'system' },
        subject: { type: 'transaction', id: 'pay1', name: 'Loan Payment - $5,000' },
        action: 'Processed loan payment: $5,000',
        customerId: 'cust1',
        customerName: 'ABC Corporation',
        transactionId: 'tx1',
        verified: true,
        immutableHash: '0x' + '1'.repeat(64),
        blockNumber: 12345682,
        details: { amount: 5000, paymentMethod: 'ACH' },
        tags: ['payment', 'loan-payment'],
      },
    ];

    demoRecords.forEach(record => {
      this.records.set(record.id, record);
    });
  }

  // Record a new event to the ledger
  async recordEvent(params: {
    eventType: LedgerRecord['eventType'];
    category: LedgerRecord['category'];
    actor: LedgerRecord['actor'];
    subject: LedgerRecord['subject'];
    action: string;
    details?: Record<string, any>;
    customerId?: string;
    customerName?: string;
    transactionId?: string;
    documentId?: string;
    previousState?: any;
    newState?: any;
    tags?: string[];
  }): Promise<LedgerRecord> {
    const record: LedgerRecord = {
      id: `ledger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      eventType: params.eventType,
      category: params.category,
      actor: params.actor,
      subject: params.subject,
      action: params.action,
      details: params.details || {},
      customerId: params.customerId,
      customerName: params.customerName,
      transactionId: params.transactionId,
      documentId: params.documentId,
      previousState: params.previousState,
      newState: params.newState,
      verified: false,
      immutableHash: '',
      tags: params.tags || [],
    };

    // Generate immutable hash
    const hashData = {
      timestamp: record.timestamp.toISOString(),
      eventType: record.eventType,
      actor: record.actor,
      subject: record.subject,
      action: record.action,
      details: record.details,
    };

    record.immutableHash = await this.generateHash(JSON.stringify(hashData));

    // Add to local store immediately
    this.records.set(record.id, record);

    // Queue for blockchain recording
    this.recordQueue.push(record);
    this.scheduleBatchBlockchainRecording();

    // Persist to backend
    this.persistRecord(record).catch(console.error);

    return record;
  }

  // Get records with filtering
  async getRecords(filter?: LedgerFilter): Promise<LedgerRecord[]> {
    await this.initialize();

    let records = Array.from(this.records.values());

    if (filter) {
      records = records.filter(record => {
        // Date filtering
        if (filter.startDate && record.timestamp < filter.startDate) return false;
        if (filter.endDate && record.timestamp > filter.endDate) return false;

        // Customer filtering
        if (filter.customerId && record.customerId !== filter.customerId) return false;

        // Transaction filtering
        if (filter.transactionId && record.transactionId !== filter.transactionId) return false;

        // Event type filtering
        if (filter.eventTypes && filter.eventTypes.length > 0) {
          if (!filter.eventTypes.includes(record.eventType)) return false;
        }

        // Category filtering
        if (filter.categories && filter.categories.length > 0) {
          if (!filter.categories.includes(record.category)) return false;
        }

        // User filtering
        if (filter.userIds && filter.userIds.length > 0) {
          if (!filter.userIds.includes(record.actor.userId)) return false;
        }

        // Verification filtering
        if (filter.verified !== undefined && record.verified !== filter.verified) return false;

        // Search query
        if (filter.searchQuery) {
          const query = filter.searchQuery.toLowerCase();
          const searchableText = [
            record.action,
            record.actor.userName,
            record.subject.name,
            record.customerName,
            ...record.tags,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          if (!searchableText.includes(query)) return false;
        }

        return true;
      });
    }

    // Sort by timestamp (newest first)
    return records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get statistics
  async getStatistics(filter?: LedgerFilter): Promise<LedgerStatistics> {
    const records = await this.getRecords(filter);

    const stats: LedgerStatistics = {
      totalRecords: records.length,
      verifiedRecords: records.filter(r => r.verified).length,
      recordsByCategory: {},
      recordsByEventType: {},
      recentActivity: records.slice(0, 10),
      topActors: [],
    };

    // Count by category
    records.forEach(record => {
      stats.recordsByCategory[record.category] =
        (stats.recordsByCategory[record.category] || 0) + 1;
      stats.recordsByEventType[record.eventType] =
        (stats.recordsByEventType[record.eventType] || 0) + 1;
    });

    // Top actors
    const actorCounts = new Map<string, { userName: string; count: number }>();
    records.forEach(record => {
      const key = record.actor.userId;
      if (!actorCounts.has(key)) {
        actorCounts.set(key, { userName: record.actor.userName, count: 0 });
      }
      actorCounts.get(key)!.count++;
    });

    stats.topActors = Array.from(actorCounts.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return stats;
  }

  // Verify a record on blockchain
  async verifyRecord(recordId: string): Promise<boolean> {
    const record = this.records.get(recordId);
    if (!record) return false;

    try {
      const verificationData = {
        recordId: record.id,
        timestamp: record.timestamp.toISOString(),
        immutableHash: record.immutableHash,
        eventType: record.eventType,
        actor: record.actor.userId,
      };

      const result = await this.blockchainService.verifyDocument(
        new File([JSON.stringify(verificationData)], 'record.json'),
        record.immutableHash,
        { recordId: record.id },
      );

      return result.isValid;
    } catch (error) {
      console.error('[ImmutableLedger] Verification error:', error);
      return false;
    }
  }

  // Export records
  async exportRecords(filter?: LedgerFilter, format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const records = await this.getRecords(filter);

    if (format === 'json') {
      const data = JSON.stringify(records, null, 2);
      return new Blob([data], { type: 'application/json' });
    } else {
      // CSV export
      const headers = [
        'ID',
        'Timestamp',
        'Event Type',
        'Category',
        'Actor',
        'Action',
        'Customer',
        'Transaction ID',
        'Verified',
        'Hash',
      ];

      const rows = records.map(record => [
        record.id,
        record.timestamp.toISOString(),
        record.eventType,
        record.category,
        record.actor.userName,
        record.action,
        record.customerName || '',
        record.transactionId || '',
        record.verified ? 'Yes' : 'No',
        record.immutableHash,
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      return new Blob([csv], { type: 'text/csv' });
    }
  }

  // Private methods
  private async generateHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private scheduleBatchBlockchainRecording(): void {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(() => {
      this.batchRecordToBlockchain();
      this.batchTimer = null;
    }, 5000); // Batch every 5 seconds
  }

  private async batchRecordToBlockchain(): Promise<void> {
    if (this.recordQueue.length === 0) return;

    const batch = this.recordQueue.splice(0, 10); // Process up to 10 at a time

    try {
      for (const record of batch) {
        const result = await this.blockchainService.addDocumentToBlockchain(
          new File([JSON.stringify(record)], `record_${record.id}.json`),
          {
            recordId: record.id,
            eventType: record.eventType,
            timestamp: record.timestamp.toISOString(),
          },
        );

        if (result.success) {
          record.verified = true;
          record.blockNumber = result.blockNumber;
          record.transactionHash = result.transactionHash;
          if ((result as any).chainId) {
            record.chainId = String((result as any).chainId);
          }

          this.records.set(record.id, record);
          this.persistRecord(record).catch(console.error);
        }
      }
    } catch (error) {
      console.error('[ImmutableLedger] Blockchain recording error:', error);
      // Re-queue failed records
      this.recordQueue.unshift(...batch);
    }
  }

  private async persistRecord(record: LedgerRecord): Promise<void> {
    try {
      await apiClient.post('/api/ledger/records', record);
    } catch (error) {
      console.error('[ImmutableLedger] Failed to persist record:', error);
    }
  }
}

export const immutableLedgerService = ImmutableLedgerService.getInstance();
export default ImmutableLedgerService;
