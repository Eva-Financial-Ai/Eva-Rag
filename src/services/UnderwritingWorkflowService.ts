import { TransactionProfile, UnderwritingTask } from '../contexts/EVATransactionContext';

export interface WorkflowPrompt {
  id: string;
  step: number;
  title: string;
  description: string;
  prompt: string;
  expectedOutput: string;
  automationLevel: 'full' | 'assisted' | 'manual';
  dependencies: string[];
}

export interface UnderwritingDecision {
  recommendation: 'approve' | 'decline' | 'conditional' | 'review_required';
  confidence: number;
  reasoning: string[];
  conditions?: string[];
  requiredActions?: string[];
  riskFactors: string[];
  mitigatingFactors: string[];
  financialRatios: {
    dscr: number;
    ltv: number;
    debtToIncome: number;
    cashFlow: number;
  };
}

export interface TaskAutomationResult {
  taskId: string;
  status: 'completed' | 'failed' | 'requires_human';
  result?: any;
  duration: number;
  confidence: number;
  notes: string;
}

class UnderwritingWorkflowService {
  /**
   * Step 1: Breakdown all information in summary collected so far on transaction
   */
  async generateTransactionSummary(transaction: TransactionProfile): Promise<WorkflowPrompt> {
    const summaryPrompt: WorkflowPrompt = {
      id: 'STEP1_SUMMARY',
      step: 1,
      title: 'Transaction Information Breakdown',
      description: 'Comprehensive summary of all collected transaction data',
      prompt: `
        Analyze and summarize the following transaction:
        
        **Transaction Details:**
        - ID: ${transaction.id}
        - Customer: ${transaction.customerName}
        - Type: ${transaction.type}
        - Requested Amount: $${transaction.requestedAmount.toLocaleString()}
        - Terms: ${transaction.proposedTerms} months
        - Purpose: ${transaction.purpose}
        - Status: ${transaction.status}
        
        **Financial Summary:**
        - Credit Score: ${transaction.financialSummary.creditScore || 'N/A'}
        - Debt-to-Income: ${transaction.financialSummary.debtToIncomeRatio || 'N/A'}
        - Cash Flow: $${transaction.financialSummary.cashFlow || 'N/A'}
        - DSCR: ${transaction.financialSummary.dscr || 'N/A'}
        - LTV: ${transaction.financialSummary.ltv || 'N/A'}
        - Risk Score: ${transaction.financialSummary.riskScore || 'N/A'}
        
        **Documentation Status:**
        - Required Documents: ${transaction.requiredDocuments.length}
        - Received Documents: ${transaction.documents.length}
        - Documentation Progress: ${transaction.progress.documentation}%
        
        **Current Alerts:**
        ${transaction.alerts.map(alert => `- ${alert}`).join('\n')}
        
        **Risk Factors:**
        ${transaction.metadata.risk_factors?.map(factor => `- ${factor}`).join('\n') || 'None identified'}
        
        Please provide:
        1. Executive summary of transaction viability
        2. Key strengths and weaknesses
        3. Missing information that needs to be gathered
        4. Initial risk assessment
        5. Recommended next steps
      `,
      expectedOutput:
        'Structured transaction analysis with executive summary, risk assessment, and action items',
      automationLevel: 'full',
      dependencies: [],
    };

    return summaryPrompt;
  }

  /**
   * Step 2: Create underwriting processing checklist
   */
  async generateUnderwritingChecklist(
    transaction: TransactionProfile,
  ): Promise<UnderwritingTask[]> {
    const baseTasks: UnderwritingTask[] = [
      // Documentation Tasks
      {
        id: 'UW-DOC-001',
        title: 'Credit Application Verification',
        description: 'Verify credit application is complete and signed',
        category: 'documentation',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 10,
        assignedTo: 'eva',
      },
      {
        id: 'UW-DOC-002',
        title: 'Financial Document Collection',
        description: 'Ensure all required financial documents are received',
        category: 'documentation',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 15,
        assignedTo: 'eva',
      },
      {
        id: 'UW-DOC-003',
        title: 'Collateral Documentation',
        description: 'Verify collateral documents and valuation reports',
        category: 'documentation',
        status: 'pending',
        priority: 'medium',
        automationAvailable: false,
        estimatedTime: 30,
        assignedTo: 'human',
      },

      // Verification Tasks
      {
        id: 'UW-VER-001',
        title: 'Credit Bureau Analysis',
        description: 'Pull and analyze credit reports from all three bureaus',
        category: 'verification',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 15,
        assignedTo: 'eva',
        dependencies: ['UW-DOC-001'],
      },
      {
        id: 'UW-VER-002',
        title: 'Income Verification',
        description: 'Verify income through bank statements, tax returns, and paystubs',
        category: 'verification',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 25,
        assignedTo: 'eva',
        dependencies: ['UW-DOC-002'],
      },
      {
        id: 'UW-VER-003',
        title: 'Employment Verification',
        description: 'Verify current employment status and history',
        category: 'verification',
        status: 'pending',
        priority: 'medium',
        automationAvailable: false,
        estimatedTime: 20,
        assignedTo: 'human',
        dependencies: ['UW-DOC-002'],
      },
      {
        id: 'UW-VER-004',
        title: 'Bank Account Verification',
        description: 'Verify bank accounts and analyze cash flow patterns',
        category: 'verification',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 20,
        assignedTo: 'eva',
        dependencies: ['UW-DOC-002'],
      },

      // Analysis Tasks
      {
        id: 'UW-ANA-001',
        title: 'Debt-to-Income Calculation',
        description: 'Calculate and verify debt-to-income ratio',
        category: 'analysis',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 15,
        assignedTo: 'eva',
        dependencies: ['UW-VER-002'],
      },
      {
        id: 'UW-ANA-002',
        title: 'Cash Flow Analysis',
        description: 'Analyze cash flow patterns and stability',
        category: 'analysis',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 25,
        assignedTo: 'eva',
        dependencies: ['UW-VER-004'],
      },
      {
        id: 'UW-ANA-003',
        title: 'DSCR Calculation',
        description: 'Calculate Debt Service Coverage Ratio',
        category: 'analysis',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 20,
        assignedTo: 'eva',
        dependencies: ['UW-ANA-002'],
      },
      {
        id: 'UW-ANA-004',
        title: 'Loan-to-Value Assessment',
        description: 'Calculate and verify LTV ratio',
        category: 'analysis',
        status: 'pending',
        priority: 'medium',
        automationAvailable: true,
        estimatedTime: 15,
        assignedTo: 'eva',
        dependencies: ['UW-DOC-003'],
      },

      // Compliance Tasks
      {
        id: 'UW-COM-001',
        title: 'Regulatory Compliance Check',
        description: 'Verify compliance with federal and state lending regulations',
        category: 'compliance',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 20,
        assignedTo: 'eva',
      },
      {
        id: 'UW-COM-002',
        title: 'Anti-Money Laundering (AML) Check',
        description: 'Perform AML and know-your-customer verification',
        category: 'compliance',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 15,
        assignedTo: 'eva',
      },
      {
        id: 'UW-COM-003',
        title: 'OFAC Screening',
        description: 'Screen against OFAC and sanctions lists',
        category: 'compliance',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 10,
        assignedTo: 'eva',
      },

      // Risk Assessment
      {
        id: 'UW-RISK-001',
        title: 'Credit Risk Analysis',
        description: 'Comprehensive credit risk assessment',
        category: 'analysis',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 30,
        assignedTo: 'eva',
        dependencies: ['UW-VER-001', 'UW-ANA-001', 'UW-ANA-002'],
      },
      {
        id: 'UW-RISK-002',
        title: 'Fraud Detection',
        description: 'Screen for potential fraud indicators',
        category: 'verification',
        status: 'pending',
        priority: 'high',
        automationAvailable: true,
        estimatedTime: 20,
        assignedTo: 'eva',
        dependencies: ['UW-VER-002', 'UW-VER-004'],
      },

      // Final Decision
      {
        id: 'UW-DEC-001',
        title: 'Underwriting Decision',
        description: 'Generate final underwriting recommendation',
        category: 'approval',
        status: 'pending',
        priority: 'urgent',
        automationAvailable: true,
        estimatedTime: 30,
        assignedTo: 'eva',
        dependencies: ['UW-RISK-001', 'UW-COM-001', 'UW-COM-002', 'UW-COM-003'],
      },
    ];

    // Add loan-type specific tasks
    const loanSpecificTasks = this.getLoanSpecificTasks(transaction.type);

    return [...baseTasks, ...loanSpecificTasks];
  }

  /**
   * Step 3: Auto-execute tasks that EVA can complete without human intervention
   */
  async autoExecuteTasks(
    transaction: TransactionProfile,
    tasks: UnderwritingTask[],
  ): Promise<TaskAutomationResult[]> {
    const automationResults: TaskAutomationResult[] = [];
    const autoTasks = tasks.filter(task => task.automationAvailable && task.assignedTo === 'eva');

    for (const task of autoTasks) {
      try {
        const startTime = Date.now();
        const result = await this.executeAutomatedTask(task, transaction);
        const duration = Date.now() - startTime;

        automationResults.push({
          taskId: task.id,
          status: result.success ? 'completed' : 'failed',
          result: result.data,
          duration,
          confidence: result.confidence,
          notes: result.notes,
        });
      } catch (error) {
        automationResults.push({
          taskId: task.id,
          status: 'failed',
          duration: 0,
          confidence: 0,
          notes: `Automation failed: ${error}`,
        });
      }
    }

    return automationResults;
  }

  /**
   * Step 4: Generate final underwriting decision
   */
  async generateUnderwritingDecision(
    transaction: TransactionProfile,
    taskResults: TaskAutomationResult[],
  ): Promise<UnderwritingDecision> {
    const completedTasks = taskResults.filter(r => r.status === 'completed');
    const failedTasks = taskResults.filter(r => r.status === 'failed');

    // Calculate risk factors
    const riskFactors = [
      ...(transaction.metadata.risk_factors || []),
      ...failedTasks.map(t => `Failed task: ${t.taskId}`),
    ];

    // Financial ratios from task results
    const financialRatios = {
      dscr: transaction.financialSummary.dscr || 0,
      ltv: transaction.financialSummary.ltv || 0,
      debtToIncome: transaction.financialSummary.debtToIncomeRatio || 0,
      cashFlow: transaction.financialSummary.cashFlow || 0,
    };

    // Decision logic
    let recommendation: UnderwritingDecision['recommendation'] = 'review_required';
    let confidence = 0;
    const reasoning: string[] = [];

    // Basic approval criteria
    const creditScore = transaction.financialSummary.creditScore || 0;
    const hasAllDocs = completedTasks.length >= 10; // Minimum required tasks
    const hasRiskFactors = riskFactors.length > 0;

    if (
      creditScore >= 720 &&
      financialRatios.dscr >= 1.25 &&
      financialRatios.ltv <= 0.8 &&
      hasAllDocs &&
      !hasRiskFactors
    ) {
      recommendation = 'approve';
      confidence = 0.9;
      reasoning.push('Strong credit profile with excellent financial ratios');
      reasoning.push('All documentation requirements met');
      reasoning.push('No significant risk factors identified');
    } else if (
      creditScore >= 650 &&
      financialRatios.dscr >= 1.15 &&
      financialRatios.ltv <= 0.85 &&
      hasAllDocs
    ) {
      recommendation = 'conditional';
      confidence = 0.75;
      reasoning.push('Good credit profile with acceptable financial ratios');
      reasoning.push('Approval subject to additional conditions');
    } else if (creditScore < 600 || financialRatios.dscr < 1.0 || financialRatios.ltv > 0.9) {
      recommendation = 'decline';
      confidence = 0.8;
      reasoning.push('Credit score or financial ratios below minimum requirements');
    } else {
      recommendation = 'review_required';
      confidence = 0.6;
      reasoning.push('Complex case requiring human review');
    }

    return {
      recommendation,
      confidence,
      reasoning,
      conditions:
        recommendation === 'conditional'
          ? [
              'Additional collateral may be required',
              'Personal guarantee required',
              'Quarterly financial reporting',
            ]
          : undefined,
      requiredActions:
        recommendation === 'review_required'
          ? [
              'Senior underwriter review',
              'Additional documentation review',
              'Credit committee evaluation',
            ]
          : undefined,
      riskFactors,
      mitigatingFactors: ['Strong business history', 'Stable industry', 'Experienced management'],
      financialRatios,
    };
  }

  /**
   * Generate all workflow prompts for EVA
   */
  async generateWorkflowPrompts(transaction: TransactionProfile): Promise<WorkflowPrompt[]> {
    const prompts: WorkflowPrompt[] = [];

    // Step 1: Transaction Summary
    prompts.push(await this.generateTransactionSummary(transaction));

    // Step 2: Underwriting Checklist Prompt
    prompts.push({
      id: 'STEP2_CHECKLIST',
      step: 2,
      title: 'Underwriting Processing Checklist',
      description: 'Generate comprehensive underwriting task list',
      prompt: `
        Based on the transaction analysis, create a detailed underwriting checklist for:
        
        **Transaction Type:** ${transaction.type}
        **Loan Amount:** $${transaction.requestedAmount.toLocaleString()}
        **Customer Type:** ${transaction.customerName}
        
        Focus on:
        1. Documentation requirements specific to ${transaction.type}
        2. Verification tasks needed for this loan amount
        3. Compliance checks required
        4. Risk assessment procedures
        5. Tasks that can be automated vs. require human review
        
        For each task, specify:
        - Priority level (urgent/high/medium/low)
        - Estimated completion time
        - Automation capability
        - Dependencies on other tasks
      `,
      expectedOutput: 'Prioritized task list with automation assignments',
      automationLevel: 'full',
      dependencies: ['STEP1_SUMMARY'],
    });

    // Step 3: Automation Execution Prompt
    prompts.push({
      id: 'STEP3_AUTOMATION',
      step: 3,
      title: 'Task Automation Execution',
      description: 'Execute automated underwriting tasks',
      prompt: `
        Execute the following automated tasks for transaction ${transaction.id}:
        
        **High Priority Automated Tasks:**
        1. Credit bureau analysis and scoring
        2. Bank statement cash flow analysis
        3. Financial ratio calculations (DSCR, DTI, LTV)
        4. Compliance screening (AML, OFAC)
        5. Document completeness verification
        
        **For each task:**
        - Provide detailed analysis
        - Calculate confidence scores
        - Identify any red flags or concerns
        - Note any tasks requiring human intervention
        
        **Data Sources Available:**
        - Credit bureau APIs
        - Bank statement analysis tools
        - Document verification systems
        - Compliance databases
      `,
      expectedOutput: 'Completed task results with confidence scores and recommendations',
      automationLevel: 'full',
      dependencies: ['STEP2_CHECKLIST'],
    });

    // Step 4: Final Decision Prompt
    prompts.push({
      id: 'STEP4_DECISION',
      step: 4,
      title: 'Final Underwriting Decision',
      description: 'Generate final approval recommendation',
      prompt: `
        Based on all completed analysis, provide a final underwriting decision for:
        
        **Transaction:** ${transaction.id}
        **Amount:** $${transaction.requestedAmount.toLocaleString()}
        **Purpose:** ${transaction.purpose}
        
        **Decision Framework:**
        1. Review all completed tasks and their results
        2. Assess overall credit quality and risk profile
        3. Consider mitigating factors and conditions
        4. Evaluate loan structure and terms
        5. Check policy compliance
        
        **Provide:**
        - Clear recommendation (Approve/Decline/Conditional/Review Required)
        - Confidence level (0-100%)
        - Detailed reasoning for decision
        - Any required conditions or modifications
        - Risk factors and mitigating factors
        - Next steps for loan processing
        
        **If human review required:**
        - Specify what aspects need human evaluation
        - Recommend timeline for review
        - Suggest additional information needed
      `,
      expectedOutput: 'Final underwriting decision with detailed rationale and next steps',
      automationLevel: 'assisted',
      dependencies: ['STEP3_AUTOMATION'],
    });

    return prompts;
  }

  private getLoanSpecificTasks(loanType: TransactionProfile['type']): UnderwritingTask[] {
    switch (loanType) {
      case 'equipment_loan':
      case 'vehicle_loan':
        return [
          {
            id: 'UW-EQP-001',
            title: 'Equipment Valuation',
            description: 'Verify equipment value and condition through appraisal',
            category: 'verification',
            status: 'pending',
            priority: 'high',
            automationAvailable: false,
            estimatedTime: 45,
            assignedTo: 'human',
          },
          {
            id: 'UW-EQP-002',
            title: 'UCC Filing Search',
            description: 'Search for existing UCC filings on equipment',
            category: 'verification',
            status: 'pending',
            priority: 'medium',
            automationAvailable: true,
            estimatedTime: 15,
            assignedTo: 'eva',
          },
        ];

      case 'real_estate_loan':
        return [
          {
            id: 'UW-RE-001',
            title: 'Property Appraisal',
            description: 'Order and review professional property appraisal',
            category: 'verification',
            status: 'pending',
            priority: 'high',
            automationAvailable: false,
            estimatedTime: 60,
            assignedTo: 'human',
          },
          {
            id: 'UW-RE-002',
            title: 'Environmental Assessment',
            description: 'Review environmental assessment report',
            category: 'verification',
            status: 'pending',
            priority: 'medium',
            automationAvailable: false,
            estimatedTime: 30,
            assignedTo: 'human',
          },
        ];

      case 'sba_loan':
        return [
          {
            id: 'UW-SBA-001',
            title: 'SBA Eligibility Check',
            description: 'Verify borrower and business meet SBA requirements',
            category: 'compliance',
            status: 'pending',
            priority: 'high',
            automationAvailable: true,
            estimatedTime: 25,
            assignedTo: 'eva',
          },
          {
            id: 'UW-SBA-002',
            title: 'SBA Form Completion',
            description: 'Complete and verify SBA required forms',
            category: 'documentation',
            status: 'pending',
            priority: 'high',
            automationAvailable: false,
            estimatedTime: 40,
            assignedTo: 'human',
          },
        ];

      default:
        return [];
    }
  }

  private async executeAutomatedTask(
    task: UnderwritingTask,
    transaction: TransactionProfile,
  ): Promise<{ success: boolean; data: any; confidence: number; notes: string }> {
    // Simulate task execution with realistic processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    switch (task.id) {
      case 'UW-VER-001': // Credit Bureau Analysis
        return {
          success: true,
          data: {
            creditScore: transaction.financialSummary.creditScore,
            bureauScores: { experian: 722, equifax: 718, transunion: 725 },
            tradeLines: 12,
            derogatory: 0,
          },
          confidence: 0.95,
          notes: 'Credit analysis completed successfully',
        };

      case 'UW-ANA-001': // DTI Calculation
        return {
          success: true,
          data: {
            dti: transaction.financialSummary.debtToIncomeRatio,
            monthlyIncome: transaction.financialSummary.cashFlow,
            monthlyDebt:
              transaction.financialSummary.cashFlow *
              (transaction.financialSummary.debtToIncomeRatio || 0.3),
          },
          confidence: 0.88,
          notes: 'DTI calculation completed based on available financial data',
        };

      case 'UW-COM-001': // Compliance Check
        return {
          success: true,
          data: {
            regulatoryCompliance: true,
            checks: ['Fair Lending', 'TILA', 'State Licensing'],
            violations: [],
          },
          confidence: 0.92,
          notes: 'All compliance checks passed',
        };

      default:
        return {
          success: true,
          data: { processed: true },
          confidence: 0.8,
          notes: `Task ${task.id} completed successfully`,
        };
    }
  }
}

export default new UnderwritingWorkflowService();
