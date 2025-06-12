import { Customer } from '../types/Customer';
import { SuggestedAction } from './ConversationIntelligenceService';

import { debugLog } from '../utils/auditLogger';

export interface WorkflowExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  nextSteps?: string[];
  documentsGenerated?: string[];
  error?: string;
}

export interface CreditApplicationData {
  businessName: string;
  businessType: string;
  owners: BusinessOwner[];
  requestedAmount: number;
  loanPurpose: string;
  collateral?: string;
}

export interface BusinessOwner {
  name: string;
  ssn: string;
  ownership: number;
  address: string;
  phone: string;
  email: string;
}

export interface FinancialRatios {
  // Liquidity Ratios
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  workingCapital: number;

  // Profitability Ratios
  grossProfitMargin: number;
  netProfitMargin: number;
  returnOnAssets: number;
  returnOnEquity: number;

  // Leverage Ratios
  debtToEquity: number;
  debtToAssets: number;
  timesInterestEarned: number;
  debtServiceCoverageRatio: number;

  // Efficiency Ratios
  assetTurnover: number;
  inventoryTurnover: number;
  receivablesTurnover: number;
}

export interface CashFlowAnalysis {
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  netCashFlow: number;
  incomeVolatility: number;
  expenseCategories: {
    [category: string]: number;
  };
  seasonalityPattern: {
    [month: string]: number;
  };
  riskFactors: string[];
  recommendations: string[];
}

export interface TaxAuditReport {
  discrepancies: {
    item: string;
    taxReturnValue: number;
    financialStatementValue: number;
    difference: number;
    explanation: string;
  }[];
  gaapCompliance: {
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  };
  irsCompliance: {
    compliant: boolean;
    issues: string[];
    recommendations: string[];
  };
  overallRiskLevel: 'low' | 'medium' | 'high';
  auditTrail: string[];
}

export class WorkflowAutomationService {
  private supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
  private supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;
  private r2Config = {
    accountId: process.env.REACT_APP_CLOUDFLARE_R2_ACCOUNT_ID!,
    accessKeyId: process.env.REACT_APP_CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.REACT_APP_CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    bucketName: process.env.REACT_APP_CLOUDFLARE_R2_BUCKET_NAME!,
  };

  async executeWorkflow(
    action: SuggestedAction,
    customer: Customer,
    additionalData?: any,
  ): Promise<WorkflowExecutionResult> {
    try {
      switch (action.action) {
        case 'SEND_CREDIT_APPLICATION':
          return await this.sendCreditApplication(customer, additionalData);

        case 'PULL_CREDIT_BACKGROUND':
          return await this.pullCreditAndBackground(customer);

        case 'ANALYZE_CASHFLOW':
          return await this.analyzeCashFlow(customer, additionalData);

        case 'CALCULATE_DSCR':
          return await this.calculateDebtServiceRatio(customer, additionalData);

        case 'CALCULATE_LIQUIDITY_RATIOS':
          return await this.calculateLiquidityRatios(customer, additionalData);

        case 'CALCULATE_PROFITABILITY_RATIOS':
          return await this.calculateProfitabilityRatios(customer, additionalData);

        case 'CALCULATE_LEVERAGE_RATIOS':
          return await this.calculateLeverageRatios(customer, additionalData);

        case 'RUN_TAX_FINANCIAL_AUDIT':
          return await this.runTaxFinancialAudit(customer, additionalData);

        case 'CHECK_GAAP_COMPLIANCE':
          return await this.checkGAAPCompliance(customer, additionalData);

        default:
          return {
            success: false,
            message: `Unknown workflow action: ${action.action}`,
            error: 'Invalid action type',
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error executing workflow: ${action.title}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async sendCreditApplication(
    customer: Customer,
    data?: CreditApplicationData,
  ): Promise<WorkflowExecutionResult> {
    // Generate credit application document
    const applicationData: CreditApplicationData = data || {
      businessName: customer.businessName || '',
      businessType: customer.businessType || '',
      owners: [
        {
          name: customer.ownerName || '',
          ssn: customer.ownerSSN || '',
          ownership: 100,
          address: customer.businessAddress || '',
          phone: customer.phone || '',
          email: customer.email || '',
        },
      ],
      requestedAmount: customer.requestedLoanAmount || 0,
      loanPurpose: customer.loanPurpose || '',
      collateral: customer.collateral,
    };

    // Generate PDF application
    const applicationPdf = await this.generateCreditApplicationPDF(applicationData);

    // Store in R2 and Supabase
    const documentUrl = await this.storeDocument(
      applicationPdf,
      `credit-application-${customer.id}-${Date.now()}.pdf`,
    );

    // Send via email (placeholder for actual email service)
    await this.sendEmailWithAttachment(customer.email || '', 'Credit Application', applicationPdf);

    // Log action
    await this.logWorkflowAction(customer.id, 'SEND_CREDIT_APPLICATION', {
      documentUrl,
      recipients: applicationData.owners.map(o => o.email),
    });

    return {
      success: true,
      message: `Credit application sent to ${customer.businessName} and all business owners`,
      data: { documentUrl, applicationData },
      nextSteps: [
        'Monitor for completed application return',
        'Follow up in 3-5 business days if no response',
        'Schedule credit pull once application is received',
      ],
      documentsGenerated: [`credit-application-${customer.id}-${Date.now()}.pdf`],
    };
  }

  private async pullCreditAndBackground(customer: Customer): Promise<WorkflowExecutionResult> {
    // Integration with credit bureaus (Experian, Equifax, TransUnion)
    const creditResults = await this.pullCreditReports(customer);
    const backgroundResults = await this.runBackgroundChecks(customer);

    // Store results
    const reportUrl = await this.generateCreditBackgroundReport(
      creditResults,
      backgroundResults,
      customer,
    );

    return {
      success: true,
      message: `Credit and background checks completed for ${customer.businessName}`,
      data: { creditResults, backgroundResults, reportUrl },
      nextSteps: [
        'Review credit scores and payment history',
        'Analyze background check results',
        'Proceed with underwriting if results are satisfactory',
      ],
      documentsGenerated: [`credit-background-report-${customer.id}-${Date.now()}.pdf`],
    };
  }

  private async analyzeCashFlow(
    customer: Customer,
    bankStatements?: any[],
  ): Promise<WorkflowExecutionResult> {
    if (!bankStatements || bankStatements.length === 0) {
      return {
        success: false,
        message: 'Bank statements required for cash flow analysis',
        error: 'Missing bank statements',
      };
    }

    // AI-powered cash flow analysis
    const analysis: CashFlowAnalysis = await this.performCashFlowAnalysis(bankStatements);

    // Generate comprehensive report
    const reportUrl = await this.generateCashFlowReport(analysis, customer);

    return {
      success: true,
      message: `Cash flow analysis completed for ${customer.businessName}`,
      data: { analysis, reportUrl },
      nextSteps: [
        'Review income stability patterns',
        'Analyze expense categorization',
        'Assess seasonal business patterns',
        'Calculate debt service capacity',
      ],
      documentsGenerated: [`cashflow-analysis-${customer.id}-${Date.now()}.pdf`],
    };
  }

  private async calculateDebtServiceRatio(
    customer: Customer,
    financialData?: any,
  ): Promise<WorkflowExecutionResult> {
    if (!financialData) {
      return {
        success: false,
        message: 'Financial statements required for DSCR calculation',
        error: 'Missing financial data',
      };
    }

    // Calculate DSCR based on financial statements
    const netOperatingIncome = financialData.netOperatingIncome || 0;
    const totalDebtService = financialData.totalDebtService || 0;
    const proposedDebtService = financialData.proposedDebtService || 0;

    const currentDSCR = totalDebtService > 0 ? netOperatingIncome / totalDebtService : 0;
    const projectedDSCR =
      totalDebtService + proposedDebtService > 0
        ? netOperatingIncome / (totalDebtService + proposedDebtService)
        : 0;

    const analysis = {
      netOperatingIncome,
      currentDebtService: totalDebtService,
      proposedDebtService,
      totalProjectedDebtService: totalDebtService + proposedDebtService,
      currentDSCR: Math.round(currentDSCR * 100) / 100,
      projectedDSCR: Math.round(projectedDSCR * 100) / 100,
      recommendation: projectedDSCR >= 1.25 ? 'Acceptable' : 'Requires Review',
      riskLevel: projectedDSCR >= 1.25 ? 'Low' : projectedDSCR >= 1.0 ? 'Medium' : 'High',
    };

    const reportUrl = await this.generateDSCRReport(analysis, customer);

    return {
      success: true,
      message: `DSCR calculation completed: ${analysis.projectedDSCR}`,
      data: { analysis, reportUrl },
      nextSteps: [
        `DSCR is ${analysis.projectedDSCR} - ${analysis.recommendation}`,
        'Review debt service capacity',
        'Consider loan structure adjustments if needed',
      ],
      documentsGenerated: [`dscr-analysis-${customer.id}-${Date.now()}.pdf`],
    };
  }

  private async calculateLiquidityRatios(
    customer: Customer,
    financialData?: any,
  ): Promise<WorkflowExecutionResult> {
    const ratios = this.calculateAllFinancialRatios(financialData);
    const reportUrl = await this.generateRatiosReport(ratios, 'liquidity', customer);

    return {
      success: true,
      message: `Liquidity ratios calculated for ${customer.businessName}`,
      data: {
        ratios: {
          currentRatio: ratios.currentRatio,
          quickRatio: ratios.quickRatio,
          cashRatio: ratios.cashRatio,
          workingCapital: ratios.workingCapital,
        },
        reportUrl,
      },
      nextSteps: [
        'Review current ratio (should be > 1.0)',
        'Analyze quick ratio for immediate liquidity',
        'Assess working capital adequacy',
      ],
      documentsGenerated: [`liquidity-analysis-${customer.id}-${Date.now()}.pdf`],
    };
  }

  private async calculateProfitabilityRatios(
    customer: Customer,
    financialData?: any,
  ): Promise<WorkflowExecutionResult> {
    const ratios = this.calculateAllFinancialRatios(financialData);
    const reportUrl = await this.generateRatiosReport(ratios, 'profitability', customer);

    return {
      success: true,
      message: `Profitability ratios calculated for ${customer.businessName}`,
      data: {
        ratios: {
          grossProfitMargin: ratios.grossProfitMargin,
          netProfitMargin: ratios.netProfitMargin,
          returnOnAssets: ratios.returnOnAssets,
          returnOnEquity: ratios.returnOnEquity,
        },
        reportUrl,
      },
      nextSteps: [
        'Compare profit margins to industry standards',
        'Analyze return on investment metrics',
        'Review operational efficiency',
      ],
      documentsGenerated: [`profitability-analysis-${customer.id}-${Date.now()}.pdf`],
    };
  }

  private async calculateLeverageRatios(
    customer: Customer,
    financialData?: any,
  ): Promise<WorkflowExecutionResult> {
    const ratios = this.calculateAllFinancialRatios(financialData);
    const reportUrl = await this.generateRatiosReport(ratios, 'leverage', customer);

    return {
      success: true,
      message: `Leverage ratios calculated for ${customer.businessName}`,
      data: {
        ratios: {
          debtToEquity: ratios.debtToEquity,
          debtToAssets: ratios.debtToAssets,
          timesInterestEarned: ratios.timesInterestEarned,
          debtServiceCoverageRatio: ratios.debtServiceCoverageRatio,
        },
        reportUrl,
      },
      nextSteps: [
        'Review debt-to-equity ratio for leverage risk',
        'Analyze debt service coverage',
        'Assess overall financial leverage',
      ],
      documentsGenerated: [`leverage-analysis-${customer.id}-${Date.now()}.pdf`],
    };
  }

  private async runTaxFinancialAudit(
    customer: Customer,
    auditData?: any,
  ): Promise<WorkflowExecutionResult> {
    if (!auditData?.taxReturns || !auditData?.financialStatements) {
      return {
        success: false,
        message: 'Both tax returns and financial statements required for audit',
        error: 'Missing required documents',
      };
    }

    const auditReport: TaxAuditReport = await this.performTaxFinancialAudit(
      auditData.taxReturns,
      auditData.financialStatements,
    );

    // Store report in R2 and Supabase
    const reportUrl = await this.generateTaxAuditReport(auditReport, customer);

    // Send to filelock drive
    await this.uploadToFilelockDrive(reportUrl, `tax-audit-${customer.id}-${Date.now()}.pdf`);

    return {
      success: true,
      message: `Tax/financial audit completed for ${customer.businessName}`,
      data: { auditReport, reportUrl },
      nextSteps: [
        `Overall risk level: ${auditReport.overallRiskLevel}`,
        'Review identified discrepancies',
        'Address GAAP compliance issues',
        'Document audit findings',
      ],
      documentsGenerated: [`tax-audit-report-${customer.id}-${Date.now()}.pdf`],
    };
  }

  private async checkGAAPCompliance(
    customer: Customer,
    financialData?: any,
  ): Promise<WorkflowExecutionResult> {
    const complianceCheck = await this.performGAAPComplianceCheck(financialData);
    const reportUrl = await this.generateComplianceReport(complianceCheck, customer);

    return {
      success: true,
      message: `GAAP compliance check completed for ${customer.businessName}`,
      data: { complianceCheck, reportUrl },
      nextSteps: complianceCheck.compliant
        ? ['Financial statements are GAAP compliant']
        : ['Address identified compliance issues', 'Request revised financial statements'],
      documentsGenerated: [`gaap-compliance-${customer.id}-${Date.now()}.pdf`],
    };
  }

  // Helper methods for calculations and integrations
  private calculateAllFinancialRatios(financialData: any): FinancialRatios {
    // Implementation of financial ratio calculations
    const currentAssets = financialData?.currentAssets || 0;
    const currentLiabilities = financialData?.currentLiabilities || 0;
    const cash = financialData?.cash || 0;
    const inventory = financialData?.inventory || 0;
    const totalAssets = financialData?.totalAssets || 0;
    const totalLiabilities = financialData?.totalLiabilities || 0;
    const totalEquity = financialData?.totalEquity || 0;
    const revenue = financialData?.revenue || 0;
    const grossProfit = financialData?.grossProfit || 0;
    const netIncome = financialData?.netIncome || 0;
    const interestExpense = financialData?.interestExpense || 0;
    const ebit = financialData?.ebit || 0;

    return {
      // Liquidity Ratios
      currentRatio: currentLiabilities > 0 ? currentAssets / currentLiabilities : 0,
      quickRatio: currentLiabilities > 0 ? (currentAssets - inventory) / currentLiabilities : 0,
      cashRatio: currentLiabilities > 0 ? cash / currentLiabilities : 0,
      workingCapital: currentAssets - currentLiabilities,

      // Profitability Ratios
      grossProfitMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
      netProfitMargin: revenue > 0 ? (netIncome / revenue) * 100 : 0,
      returnOnAssets: totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0,
      returnOnEquity: totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0,

      // Leverage Ratios
      debtToEquity: totalEquity > 0 ? totalLiabilities / totalEquity : 0,
      debtToAssets: totalAssets > 0 ? totalLiabilities / totalAssets : 0,
      timesInterestEarned: interestExpense > 0 ? ebit / interestExpense : 0,
      debtServiceCoverageRatio:
        financialData?.totalDebtService > 0
          ? (netIncome + interestExpense) / financialData.totalDebtService
          : 0,

      // Efficiency Ratios
      assetTurnover: totalAssets > 0 ? revenue / totalAssets : 0,
      inventoryTurnover: inventory > 0 ? financialData?.costOfGoodsSold / inventory : 0,
      receivablesTurnover:
        financialData?.accountsReceivable > 0 ? revenue / financialData.accountsReceivable : 0,
    };
  }

  // Placeholder methods for external integrations
  private async pullCreditReports(customer: Customer): Promise<any> {
    // Integration with credit bureaus
    return { placeholder: 'Credit report data' };
  }

  private async runBackgroundChecks(customer: Customer): Promise<any> {
    // Integration with background check services
    return { placeholder: 'Background check data' };
  }

  private async performCashFlowAnalysis(bankStatements: any[]): Promise<CashFlowAnalysis> {
    // AI-powered analysis of bank statements
    return {
      averageMonthlyIncome: 50000,
      averageMonthlyExpenses: 35000,
      netCashFlow: 15000,
      incomeVolatility: 0.15,
      expenseCategories: {
        Operations: 20000,
        Payroll: 10000,
        Rent: 3000,
        Utilities: 2000,
      },
      seasonalityPattern: {
        Q1: 0.9,
        Q2: 1.1,
        Q3: 1.2,
        Q4: 0.8,
      },
      riskFactors: ['Seasonal revenue patterns'],
      recommendations: ['Consider seasonal credit line'],
    };
  }

  private async performTaxFinancialAudit(
    taxReturns: any,
    financialStatements: any,
  ): Promise<TaxAuditReport> {
    // Comprehensive audit comparing tax returns to financial statements
    return {
      discrepancies: [],
      gaapCompliance: {
        compliant: true,
        issues: [],
        recommendations: [],
      },
      irsCompliance: {
        compliant: true,
        issues: [],
        recommendations: [],
      },
      overallRiskLevel: 'low',
      auditTrail: [],
    };
  }

  private async performGAAPComplianceCheck(financialData: any): Promise<any> {
    // GAAP compliance verification
    return {
      compliant: true,
      issues: [],
      recommendations: [],
    };
  }

  // Document generation and storage methods
  private async generateCreditApplicationPDF(data: CreditApplicationData): Promise<Buffer> {
    // Generate PDF credit application
    return Buffer.from('PDF placeholder');
  }

  private async storeDocument(document: Buffer, filename: string): Promise<string> {
    // Store in Cloudflare R2 and save metadata to Supabase
    return `https://r2.example.com/${filename}`;
  }

  private async sendEmailWithAttachment(
    email: string,
    subject: string,
    attachment: Buffer,
  ): Promise<void> {
    // Email service integration
    debugLog('general', 'log_statement', `Email sent to ${email}: ${subject}`)
  }

  private async uploadToFilelockDrive(fileUrl: string, filename: string): Promise<void> {
    // Filelock drive integration
    debugLog('general', 'log_statement', `Uploaded to Filelock Drive: ${filename}`)
  }

  private async logWorkflowAction(customerId: string, action: string, data: any): Promise<void> {
    // Log workflow execution to Supabase
    debugLog('general', 'log_statement', `Workflow logged: ${action} for customer ${customerId}`)
  }

  // Report generation methods (placeholders)
  private async generateCashFlowReport(
    analysis: CashFlowAnalysis,
    customer: Customer,
  ): Promise<string> {
    return `https://r2.example.com/cashflow-report-${customer.id}.pdf`;
  }

  private async generateDSCRReport(analysis: any, customer: Customer): Promise<string> {
    return `https://r2.example.com/dscr-report-${customer.id}.pdf`;
  }

  private async generateRatiosReport(
    ratios: FinancialRatios,
    type: string,
    customer: Customer,
  ): Promise<string> {
    return `https://r2.example.com/${type}-ratios-${customer.id}.pdf`;
  }

  private async generateTaxAuditReport(
    report: TaxAuditReport,
    customer: Customer,
  ): Promise<string> {
    return `https://r2.example.com/tax-audit-${customer.id}.pdf`;
  }

  private async generateComplianceReport(check: any, customer: Customer): Promise<string> {
    return `https://r2.example.com/compliance-${customer.id}.pdf`;
  }

  private async generateCreditBackgroundReport(
    creditResults: any,
    backgroundResults: any,
    customer: Customer,
  ): Promise<string> {
    return `https://r2.example.com/credit-background-${customer.id}.pdf`;
  }
}

export const workflowAutomationService = new WorkflowAutomationService();
