import { Transaction } from '../pages/TransactionSummary';

import { debugLog } from '../utils/auditLogger';

interface MockWebSocketConfig {
  url?: string;
  reconnectInterval?: number;
  messageInterval?: number;
  simulateErrors?: boolean;
  simulateLatency?: boolean;
  enableBusinessScenarios?: boolean;
  scenarioInterval?: number;
}

interface MockMessage {
  type: string;
  data: any;
  timestamp: string;
  correlationId?: string;
}

interface TransactionConflict {
  transactionId: string;
  conflictType:
    | 'duplicate_application'
    | 'credit_limit_exceeded'
    | 'document_mismatch'
    | 'compliance_hold';
  severity: 'warning' | 'error' | 'critical';
  description: string;
  resolution?: string;
}

interface BulkUpdateEvent {
  type: 'bulk_update';
  updateType: 'status_change' | 'assignment' | 'priority_update' | 'risk_reassessment';
  affectedTransactions: string[];
  changes: any;
  reason: string;
}

class MockWebSocketServer {
  private connections: Set<MockWebSocketConnection> = new Set();
  private transactions: Transaction[] = [];
  private messageInterval: number;
  private simulateErrors: boolean;
  private simulateLatency: boolean;
  private intervalId: NodeJS.Timeout | null = null;
  private scenarioIntervalId: NodeJS.Timeout | null = null;
  private enableBusinessScenarios: boolean;
  private scenarioInterval: number;
  private activeConflicts: Map<string, TransactionConflict> = new Map();
  private businessMetrics = {
    dailyVolume: 0,
    approvalRate: 0.75,
    averageProcessingTime: 3.5,
    peakHours: [9, 10, 11, 14, 15, 16],
  };

  constructor(config: MockWebSocketConfig = {}) {
    this.messageInterval = config.messageInterval || 5000; // Send updates every 5 seconds
    this.simulateErrors = config.simulateErrors || false;
    this.simulateLatency = config.simulateLatency || true;
    this.enableBusinessScenarios = config.enableBusinessScenarios ?? true;
    this.scenarioInterval = config.scenarioInterval || 15000; // Business scenarios every 15 seconds
    this.initializeTransactions();
  }

  private initializeTransactions() {
    // Initialize with more diverse mock transactions
    this.transactions = [
      {
        id: 'TX-MOCK-001',
        borrowerName: 'Mock Company A',
        type: 'Equipment Loan',
        amount: 500000,
        status: 'application',
        stage: 'application',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        assignedTo: ['Mock User'],
        priority: 'medium',
        completionPercentage: 25,
        nextAction: 'Submit documents',
        daysInStage: 2,
        documents: 5,
        messages: 2,
        riskScore: 'low',
        customerId: 'CUST-MOCK-001',
      },
      {
        id: 'TX-MOCK-002',
        borrowerName: 'Mock Company B',
        type: 'Working Capital',
        amount: 750000,
        status: 'underwriting',
        stage: 'underwriting',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        assignedTo: ['Mock Underwriter'],
        priority: 'high',
        completionPercentage: 60,
        nextAction: 'Risk assessment',
        daysInStage: 3,
        documents: 12,
        messages: 5,
        riskScore: 'medium',
        customerId: 'CUST-MOCK-002',
      },
      {
        id: 'TX-MOCK-003',
        borrowerName: 'Mock Enterprise Corp',
        type: 'Real Estate Loan',
        amount: 2500000,
        status: 'approved',
        stage: 'approved',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        assignedTo: ['Senior Underwriter', 'Loan Officer'],
        priority: 'high',
        completionPercentage: 85,
        nextAction: 'Prepare funding documents',
        daysInStage: 1,
        documents: 25,
        messages: 15,
        riskScore: 'low',
        customerId: 'CUST-MOCK-003',
      },
      {
        id: 'TX-MOCK-004',
        borrowerName: 'Mock Startup Inc',
        type: 'Working Capital',
        amount: 150000,
        status: 'underwriting',
        stage: 'underwriting',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        assignedTo: ['Risk Analyst'],
        priority: 'medium',
        completionPercentage: 45,
        nextAction: 'Financial review',
        daysInStage: 2,
        documents: 8,
        messages: 6,
        riskScore: 'high',
        customerId: 'CUST-MOCK-004',
      },
    ];
  }

  addConnection(connection: MockWebSocketConnection) {
    this.connections.add(connection);
    debugLog('general', 'log_statement', '[MockWS] Client connected. Total connections:', this.connections.size)

    // Send initial connection success message
    connection.send({
      type: 'connection',
      data: { status: 'connected', message: 'Connected to mock WebSocket server' },
      timestamp: new Date().toISOString(),
    });

    // Send current business metrics
    this.sendBusinessMetrics();

    // Start sending updates if this is the first connection
    if (this.connections.size === 1) {
      this.startSendingUpdates();
      if (this.enableBusinessScenarios) {
        this.startBusinessScenarios();
      }
    }
  }

  removeConnection(connection: MockWebSocketConnection) {
    this.connections.delete(connection);
    debugLog('general', 'log_statement', '[MockWS] Client disconnected. Total connections:', this.connections.size)

    // Stop sending updates if no connections
    if (this.connections.size === 0) {
      this.stopSendingUpdates();
      this.stopBusinessScenarios();
    }
  }

  private startSendingUpdates() {
    debugLog('general', 'log_statement', '[MockWS] Starting to send updates')

    this.intervalId = setInterval(() => {
      this.sendRandomUpdate();
    }, this.messageInterval);
  }

  private stopSendingUpdates() {
    debugLog('general', 'log_statement', '[MockWS] Stopping updates')
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private startBusinessScenarios() {
    debugLog('general', 'log_statement', '[MockWS] Starting business scenarios')

    this.scenarioIntervalId = setInterval(() => {
      this.runBusinessScenario();
    }, this.scenarioInterval);
  }

  private stopBusinessScenarios() {
    debugLog('general', 'log_statement', '[MockWS] Stopping business scenarios')
    if (this.scenarioIntervalId) {
      clearInterval(this.scenarioIntervalId);
      this.scenarioIntervalId = null;
    }
  }

  private sendRandomUpdate() {
    const updateTypes = [
      'transaction_update',
      'transaction_new',
      'stage_change',
      'transaction_update',
      'transaction_update', // Make updates more common
      'bulk_update',
      'conflict_detected',
      'metrics_update',
    ];

    if (this.simulateErrors && Math.random() < 0.1) {
      // 10% chance of error
      this.broadcast({
        type: 'error',
        data: { message: 'Simulated error for testing' },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)];

    switch (updateType) {
      case 'transaction_update':
        this.sendTransactionUpdate();
        break;
      case 'transaction_new':
        this.sendNewTransaction();
        break;
      case 'stage_change':
        this.sendStageChange();
        break;
      case 'bulk_update':
        this.sendBulkUpdate();
        break;
      case 'conflict_detected':
        this.sendConflictDetection();
        break;
      case 'metrics_update':
        this.sendBusinessMetrics();
        break;
    }
  }

  private runBusinessScenario() {
    const scenarios = [
      'morning_rush',
      'compliance_sweep',
      'month_end_processing',
      'risk_reassessment',
      'portfolio_rebalancing',
      'fraud_alert',
    ];

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    debugLog('general', 'log_statement', `[MockWS] Running business scenario: ${scenario}`)

    switch (scenario) {
      case 'morning_rush':
        this.simulateMorningRush();
        break;
      case 'compliance_sweep':
        this.simulateComplianceSweep();
        break;
      case 'month_end_processing':
        this.simulateMonthEndProcessing();
        break;
      case 'risk_reassessment':
        this.simulateRiskReassessment();
        break;
      case 'portfolio_rebalancing':
        this.simulatePortfolioRebalancing();
        break;
      case 'fraud_alert':
        this.simulateFraudAlert();
        break;
    }
  }

  private simulateMorningRush() {
    // Simulate multiple new applications coming in during morning hours
    const rushSize = Math.floor(Math.random() * 5) + 3;

    this.broadcast({
      type: 'scenario_start',
      data: {
        scenario: 'morning_rush',
        description: 'High volume of new applications',
        expectedDuration: '30 minutes',
      },
      timestamp: new Date().toISOString(),
    });

    for (let i = 0; i < rushSize; i++) {
      setTimeout(() => {
        this.sendNewTransaction();
      }, i * 2000);
    }

    // Update metrics
    this.businessMetrics.dailyVolume += rushSize;
    this.sendBusinessMetrics();
  }

  private simulateComplianceSweep() {
    // Simulate compliance checks putting transactions on hold
    const affectedTransactions = this.transactions
      .filter(t => t.status === 'underwriting' || t.status === 'approved')
      .slice(0, Math.floor(Math.random() * 3) + 1);

    if (affectedTransactions.length === 0) return;

    const bulkUpdate: BulkUpdateEvent = {
      type: 'bulk_update',
      updateType: 'status_change',
      affectedTransactions: affectedTransactions.map(t => t.id),
      changes: {
        complianceHold: true,
        holdReason: 'Routine compliance review',
        estimatedClearance: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      reason: 'Monthly compliance sweep initiated',
    };

    this.broadcast({
      type: 'bulk_update',
      data: bulkUpdate,
      timestamp: new Date().toISOString(),
      correlationId: this.generateCorrelationId(),
    });

    // Create conflicts for these transactions
    affectedTransactions.forEach(transaction => {
      const conflict: TransactionConflict = {
        transactionId: transaction.id,
        conflictType: 'compliance_hold',
        severity: 'warning',
        description: 'Transaction under compliance review',
        resolution: 'Awaiting compliance clearance',
      };
      this.activeConflicts.set(transaction.id, conflict);
    });
  }

  private simulateMonthEndProcessing() {
    // Simulate month-end batch processing
    this.broadcast({
      type: 'system_event',
      data: {
        event: 'month_end_processing',
        status: 'started',
        affectedServices: ['reporting', 'reconciliation', 'metrics'],
        estimatedDuration: '2 hours',
      },
      timestamp: new Date().toISOString(),
    });

    // Update all transaction metrics
    this.transactions.forEach(transaction => {
      transaction.daysInStage += 1;
      if (transaction.status === 'funding' && Math.random() > 0.5) {
        transaction.status = 'closed';
        transaction.stage = 'closed';
        transaction.completionPercentage = 100;
      }
    });

    // Send completion update after delay
    setTimeout(() => {
      this.broadcast({
        type: 'system_event',
        data: {
          event: 'month_end_processing',
          status: 'completed',
          summary: {
            transactionsProcessed: this.transactions.length,
            newClosings: this.transactions.filter(t => t.status === 'closed').length,
            totalVolume: this.transactions.reduce((sum, t) => sum + t.amount, 0),
          },
        },
        timestamp: new Date().toISOString(),
      });
    }, 5000);
  }

  private simulateRiskReassessment() {
    // Simulate risk score changes based on market conditions
    const affectedTransactions = this.transactions
      .filter(t => t.status !== 'closed')
      .slice(0, Math.floor(Math.random() * 4) + 2);

    const marketEvent = {
      type: 'market_update',
      indicator: ['interest_rate_change', 'credit_market_shift', 'regulatory_update'][
        Math.floor(Math.random() * 3)
      ],
      impact: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)],
    };

    this.broadcast({
      type: 'risk_reassessment',
      data: {
        trigger: marketEvent,
        affectedTransactions: affectedTransactions.map(t => ({
          id: t.id,
          oldRiskScore: t.riskScore,
          newRiskScore: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        })),
      },
      timestamp: new Date().toISOString(),
      correlationId: this.generateCorrelationId(),
    });

    // Update risk scores
    affectedTransactions.forEach(transaction => {
      transaction.riskScore = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any;
    });
  }

  private simulatePortfolioRebalancing() {
    // Simulate portfolio manager reassigning transactions
    const underwriters = [
      'Senior Underwriter',
      'Risk Analyst',
      'Loan Officer',
      'Credit Specialist',
    ];
    const reassignments: any[] = [];

    this.transactions
      .filter(t => t.status === 'underwriting' || t.status === 'application')
      .forEach(transaction => {
        if (Math.random() > 0.6) {
          const newAssignee = underwriters[Math.floor(Math.random() * underwriters.length)];
          reassignments.push({
            transactionId: transaction.id,
            from: transaction.assignedTo[0],
            to: newAssignee,
            reason: 'Workload balancing',
          });
          transaction.assignedTo = [newAssignee];
        }
      });

    if (reassignments.length > 0) {
      this.broadcast({
        type: 'portfolio_rebalancing',
        data: {
          reassignments,
          totalAffected: reassignments.length,
          objective: 'Optimize processing time and expertise matching',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  private simulateFraudAlert() {
    // Simulate fraud detection on a random transaction
    const suspiciousTransaction =
      this.transactions[Math.floor(Math.random() * this.transactions.length)];

    const fraudIndicators = [
      'Unusual transaction pattern detected',
      'Document authenticity verification failed',
      'Identity verification mismatch',
      'Suspicious financial activity',
    ];

    const alert = {
      transactionId: suspiciousTransaction.id,
      alertType: 'fraud_suspected',
      severity: 'critical',
      indicators: [fraudIndicators[Math.floor(Math.random() * fraudIndicators.length)]],
      recommendedAction: 'Immediate review required',
      autoActions: ['Transaction frozen', 'Compliance team notified'],
    };

    this.broadcast({
      type: 'security_alert',
      data: alert,
      timestamp: new Date().toISOString(),
      correlationId: this.generateCorrelationId(),
    });

    // Create a critical conflict
    const conflict: TransactionConflict = {
      transactionId: suspiciousTransaction.id,
      conflictType: 'compliance_hold',
      severity: 'critical',
      description: 'Potential fraud detected - transaction frozen',
      resolution: 'Awaiting security team investigation',
    };
    this.activeConflicts.set(suspiciousTransaction.id, conflict);

    // Update transaction priority
    suspiciousTransaction.priority = 'high';
  }

  private sendBulkUpdate() {
    // Simulate bulk status updates
    const updateTypes = ['status_change', 'assignment', 'priority_update', 'risk_reassessment'];
    const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)] as any;

    const eligibleTransactions = this.transactions.filter(t => t.status !== 'closed');
    const affectedCount = Math.min(Math.floor(Math.random() * 4) + 2, eligibleTransactions.length);
    const affectedTransactions = eligibleTransactions.slice(0, affectedCount);

    let changes: any = {};
    let reason = '';

    switch (updateType) {
      case 'status_change':
        const newStatus = ['underwriting', 'approved', 'funding'][Math.floor(Math.random() * 3)];
        changes = { status: newStatus, stage: newStatus };
        reason = 'Batch processing completed';
        affectedTransactions.forEach(t => {
          t.status = newStatus as any;
          t.stage = newStatus as any;
        });
        break;

      case 'assignment':
        const newAssignee = ['Team Lead', 'Senior Analyst', 'Specialist'][
          Math.floor(Math.random() * 3)
        ];
        changes = { assignedTo: [newAssignee] };
        reason = 'Workload redistribution';
        affectedTransactions.forEach(t => {
          t.assignedTo = [newAssignee];
        });
        break;

      case 'priority_update':
        const newPriority = ['high', 'medium', 'low'][Math.floor(Math.random() * 3)];
        changes = { priority: newPriority };
        reason = 'Priority reassessment based on business rules';
        affectedTransactions.forEach(t => {
          t.priority = newPriority as any;
        });
        break;

      case 'risk_reassessment':
        changes = { riskScoreUpdated: true };
        reason = 'Periodic risk review';
        affectedTransactions.forEach(t => {
          t.riskScore = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any;
        });
        break;
    }

    const bulkUpdate: BulkUpdateEvent = {
      type: 'bulk_update',
      updateType,
      affectedTransactions: affectedTransactions.map(t => t.id),
      changes,
      reason,
    };

    this.broadcast({
      type: 'bulk_update',
      data: bulkUpdate,
      timestamp: new Date().toISOString(),
      correlationId: this.generateCorrelationId(),
    });
  }

  private sendConflictDetection() {
    // Simulate conflict detection
    if (this.transactions.length === 0) return;

    const transaction = this.transactions[Math.floor(Math.random() * this.transactions.length)];

    const conflictTypes: TransactionConflict['conflictType'][] = [
      'duplicate_application',
      'credit_limit_exceeded',
      'document_mismatch',
      'compliance_hold',
    ];

    const conflictType = conflictTypes[Math.floor(Math.random() * conflictTypes.length)];
    const severity = ['warning', 'error', 'critical'][Math.floor(Math.random() * 3)] as any;

    const conflict: TransactionConflict = {
      transactionId: transaction.id,
      conflictType,
      severity,
      description: this.getConflictDescription(conflictType),
      resolution: severity === 'warning' ? 'Review recommended' : 'Immediate action required',
    };

    this.activeConflicts.set(transaction.id, conflict);

    this.broadcast({
      type: 'conflict_detected',
      data: conflict,
      timestamp: new Date().toISOString(),
      correlationId: this.generateCorrelationId(),
    });
  }

  private getConflictDescription(conflictType: TransactionConflict['conflictType']): string {
    switch (conflictType) {
      case 'duplicate_application':
        return 'Similar application found in system';
      case 'credit_limit_exceeded':
        return 'Total exposure exceeds approved limits';
      case 'document_mismatch':
        return 'Inconsistencies found in submitted documents';
      case 'compliance_hold':
        return 'Transaction flagged for compliance review';
      default:
        return 'Unknown conflict type';
    }
  }

  private sendBusinessMetrics() {
    // Update and send current business metrics
    const currentHour = new Date().getHours();
    const isPeakHour = this.businessMetrics.peakHours.includes(currentHour);

    const metrics = {
      timestamp: new Date().toISOString(),
      hourlyMetrics: {
        newApplications: isPeakHour
          ? Math.floor(Math.random() * 10) + 5
          : Math.floor(Math.random() * 5),
        completedReviews: Math.floor(Math.random() * 8) + 2,
        approvalRate: this.businessMetrics.approvalRate + (Math.random() - 0.5) * 0.1,
        averageProcessingTime:
          this.businessMetrics.averageProcessingTime + (Math.random() - 0.5) * 0.5,
      },
      portfolioHealth: {
        totalActive: this.transactions.filter(t => t.status !== 'closed').length,
        atRisk: this.transactions.filter(t => t.riskScore === 'high').length,
        onHold: this.activeConflicts.size,
        todaysClosed: this.transactions.filter(
          t => t.status === 'closed' && t.updatedAt === new Date().toISOString().split('T')[0]
        ).length,
      },
      systemHealth: {
        activeUsers: this.connections.size,
        queueDepth: Math.floor(Math.random() * 20),
        processingCapacity: isPeakHour ? 0.85 : 0.65,
      },
    };

    this.broadcast({
      type: 'business_metrics',
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  }

  private sendTransactionUpdate() {
    if (this.transactions.length === 0) return;

    const transaction = this.transactions[Math.floor(Math.random() * this.transactions.length)];

    // More realistic updates based on transaction stage
    const stageUpdates = this.getStageSpecificUpdates(transaction);

    // Update some fields
    transaction.completionPercentage = Math.min(
      100,
      transaction.completionPercentage + stageUpdates.progressIncrement
    );
    transaction.documents += stageUpdates.newDocuments;
    transaction.messages += stageUpdates.newMessages;
    transaction.updatedAt = new Date().toISOString().split('T')[0];

    // Update next action based on stage
    transaction.nextAction = stageUpdates.nextAction;

    const message: MockMessage = {
      type: 'transaction_update',
      data: {
        id: transaction.id,
        completionPercentage: transaction.completionPercentage,
        documents: transaction.documents,
        messages: transaction.messages,
        updatedAt: transaction.updatedAt,
        nextAction: transaction.nextAction,
        stageProgress: stageUpdates.stageProgress,
      },
      timestamp: new Date().toISOString(),
      correlationId: this.generateCorrelationId(),
    };

    this.broadcast(message);
  }

  private getStageSpecificUpdates(transaction: Transaction) {
    const baseUpdate = {
      progressIncrement: Math.floor(Math.random() * 10) + 5,
      newDocuments: Math.floor(Math.random() * 3),
      newMessages: Math.floor(Math.random() * 2),
      nextAction: transaction.nextAction,
      stageProgress: 'in_progress',
    };

    switch (transaction.status) {
      case 'application':
        return {
          ...baseUpdate,
          progressIncrement: Math.floor(Math.random() * 15) + 10,
          newDocuments: Math.floor(Math.random() * 5) + 1,
          nextAction: [
            'Complete application form',
            'Upload financial statements',
            'Verify business information',
          ][Math.floor(Math.random() * 3)],
          stageProgress:
            transaction.completionPercentage < 50 ? 'gathering_documents' : 'ready_for_review',
        };

      case 'underwriting':
        return {
          ...baseUpdate,
          progressIncrement: Math.floor(Math.random() * 8) + 3,
          newDocuments: Math.floor(Math.random() * 2),
          nextAction: [
            'Credit analysis',
            'Risk assessment',
            'Financial review',
            'Collateral evaluation',
          ][Math.floor(Math.random() * 4)],
          stageProgress:
            transaction.completionPercentage < 70 ? 'analysis_in_progress' : 'final_review',
        };

      case 'approved':
        return {
          ...baseUpdate,
          progressIncrement: Math.floor(Math.random() * 5) + 5,
          newDocuments: Math.floor(Math.random() * 2) + 1,
          nextAction: ['Generate loan documents', 'Schedule closing', 'Final compliance check'][
            Math.floor(Math.random() * 3)
          ],
          stageProgress: 'preparing_documents',
        };

      case 'funding':
        return {
          ...baseUpdate,
          progressIncrement: Math.floor(Math.random() * 10) + 5,
          newDocuments: 1,
          nextAction: ['Wire transfer pending', 'Final verification', 'Disbursement scheduled'][
            Math.floor(Math.random() * 3)
          ],
          stageProgress:
            transaction.completionPercentage < 90 ? 'funding_in_progress' : 'ready_to_close',
        };

      default:
        return baseUpdate;
    }
  }

  private sendNewTransaction() {
    const newTransaction: Transaction = {
      id: `TX-MOCK-${Date.now()}`,
      borrowerName: `Mock Company ${String.fromCharCode(67 + this.transactions.length)}`,
      type: ['Equipment Loan', 'Working Capital', 'Real Estate Loan'][
        Math.floor(Math.random() * 3)
      ],
      amount: Math.floor(Math.random() * 2000000) + 100000,
      status: 'application',
      stage: 'application',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      assignedTo: ['Mock User'],
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      completionPercentage: 0,
      nextAction: 'Initial review',
      daysInStage: 0,
      documents: 0,
      messages: 0,
      riskScore: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      customerId: `CUST-MOCK-${Math.floor(Math.random() * 10)}`,
    };

    this.transactions.push(newTransaction);

    const message: MockMessage = {
      type: 'transaction_new',
      data: newTransaction,
      timestamp: new Date().toISOString(),
      correlationId: this.generateCorrelationId(),
    };

    this.broadcast(message);
  }

  private sendStageChange() {
    if (this.transactions.length === 0) return;

    const transaction = this.transactions[Math.floor(Math.random() * this.transactions.length)];
    const stages: Array<Transaction['status']> = [
      'application',
      'underwriting',
      'approved',
      'funding',
      'closed',
    ];
    const currentIndex = stages.indexOf(transaction.status);

    if (currentIndex < stages.length - 1) {
      const newStage = stages[currentIndex + 1];
      transaction.status = newStage;
      transaction.stage = newStage;
      transaction.daysInStage = 0;
      transaction.updatedAt = new Date().toISOString().split('T')[0];

      const message: MockMessage = {
        type: 'stage_change',
        data: {
          id: transaction.id,
          oldStage: stages[currentIndex],
          newStage: newStage,
          updatedAt: transaction.updatedAt,
        },
        timestamp: new Date().toISOString(),
        correlationId: this.generateCorrelationId(),
      };

      this.broadcast(message);
    }
  }

  private broadcast(message: MockMessage) {
    const messageStr = JSON.stringify(message);

    this.connections.forEach(connection => {
      if (this.simulateLatency) {
        // Add 50-200ms latency
        const latency = Math.floor(Math.random() * 150) + 50;
        setTimeout(() => {
          connection.send(message);
        }, latency);
      } else {
        connection.send(message);
      }
    });

    debugLog('websocket', 'broadcast', '[MockWS] Broadcast message', { messageType: message.type, clientCount: this.connections.size })
  }

  handleMessage(connection: MockWebSocketConnection, data: any) {
    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data;
      debugLog('general', 'log_statement', '[MockWS] Received message:', message)

      switch (message.type) {
        case 'subscribe':
          // Handle subscription
          connection.subscriptions = message.filters || {};
          connection.send({
            type: 'subscription_confirmed',
            data: { filters: connection.subscriptions },
            timestamp: new Date().toISOString(),
          });
          break;

        case 'ping':
          // Respond with pong
          connection.send({
            type: 'pong',
            data: { timestamp: Date.now() },
            timestamp: new Date().toISOString(),
          });
          break;

        default:
          debugLog('general', 'log_statement', '[MockWS] Unknown message type:', message.type)
      }
    } catch (error) {
      console.error('[MockWS] Error handling message:', error);
    }
  }

  private generateCorrelationId(): string {
    return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

class MockWebSocketConnection {
  private ws: WebSocket;
  private server: MockWebSocketServer;
  public subscriptions: any = {};

  constructor(ws: WebSocket, server: MockWebSocketServer) {
    this.ws = ws;
    this.server = server;
  }

  send(message: MockMessage) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  close() {
    this.ws.close();
  }
}

// Global mock server instance
let mockServer: MockWebSocketServer | null = null;

// Mock WebSocket class that intercepts WebSocket connections
export class MockWebSocket extends WebSocket {
  private mockConnection?: MockWebSocketConnection;
  private messageQueue: any[] = [];
  private isOpen = false;

  constructor(url: string, protocols?: string | string[]) {
    // Call parent with a dummy URL (we'll intercept everything)
    super('ws://localhost:9999', protocols);

    debugLog('general', 'log_statement', '[MockWS] Creating mock WebSocket for URL:', url)

    // Initialize mock server if needed
    if (!mockServer) {
      mockServer = new MockWebSocketServer({
        simulateErrors: false,
        simulateLatency: true,
      });
    }

    // Simulate connection delay
    setTimeout(() => {
      this.simulateOpen();
    }, 100);
  }

  private simulateOpen() {
    this.isOpen = true;
    this.mockConnection = new MockWebSocketConnection(this as any, mockServer!);
    mockServer!.addConnection(this.mockConnection);

    // Trigger open event
    const openEvent = new Event('open');
    this.dispatchEvent(openEvent);

    // Process any queued messages
    this.messageQueue.forEach(data => {
      mockServer!.handleMessage(this.mockConnection!, data);
    });
    this.messageQueue = [];
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (!this.isOpen || !this.mockConnection) {
      this.messageQueue.push(data);
      return;
    }

    // Handle the message in the mock server
    mockServer!.handleMessage(this.mockConnection, data);
  }

  close(code?: number, reason?: string): void {
    if (this.mockConnection) {
      mockServer!.removeConnection(this.mockConnection);
    }

    this.isOpen = false;

    // Trigger close event
    const closeEvent = new CloseEvent('close', {
      code: code || 1000,
      reason: reason || 'Normal closure',
      wasClean: true,
    });
    this.dispatchEvent(closeEvent);
  }
}

// Function to enable/disable mock WebSocket
export function enableMockWebSocket() {
  debugLog('websocket', 'enable', '[MockWS] Enabling mock WebSocket');
  (window as any).OriginalWebSocket = window.WebSocket;
  (window as any).WebSocket = MockWebSocket;
}

export function disableMockWebSocket() {
  debugLog('general', 'log_statement', '[MockWS] Disabling mock WebSocket')
  if ((window as any).OriginalWebSocket) {
    window.WebSocket = (window as any).OriginalWebSocket;
    delete (window as any).OriginalWebSocket;
  }
}

// Auto-enable in development mode
if (
  process.env.NODE_ENV === 'development' &&
  process.env.REACT_APP_USE_MOCK_WEBSOCKET !== 'false'
) {
  // Only enable if explicitly requested
  if (process.env.REACT_APP_USE_MOCK_WEBSOCKET === 'true') {
    enableMockWebSocket();
    debugLog('general', 'log_statement', '[MockWS] Mock WebSocket enabled for development')
  }
}
