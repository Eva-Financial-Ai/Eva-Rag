import { CustomerProfile as Customer } from '../contexts/EVACustomerContext';
import { webSearchService } from './WebSearchService';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    [key: string]: any;
  };
}

export interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category:
    | 'credit'
    | 'underwriting'
    | 'compliance'
    | 'documentation'
    | 'analysis'
    | 'verification'
    | 'research';
  condition: string;
  action: string;
  requiresApproval: boolean;
  estimatedTime: string;
  icon: string;
  metadata?: {
    verificationScore?: number;
    factors?: string[];
    riskLevel?: string;
    riskFactors?: string[];
    newsCount?: number;
    searchResults?: any;
  };
}

export interface ConversationAnalysis {
  phase: 'initial' | 'gathering' | 'analysis' | 'decision' | 'completion';
  customerDataCompleteness: number;
  riskLevel: 'low' | 'medium' | 'high';
  suggestedNextActions: SuggestedAction[];
  urgentItems: string[];
  missingDocuments: string[];
  conversationSummary: string;
  nextSteps: string[];
}

interface CustomerData {
  id: string;
  businessName?: string;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
  };
  businessInfo?: {
    ein?: string;
    address?: string;
  };
  creditScore?: number;
  annualRevenue?: number;
  yearEstablished?: number;
  industry?: string;
  businessType?: string;
  numberOfEmployees?: number;
  ownerName?: string;
  ownerSSN?: string;
}

export class ConversationIntelligenceService {
  private actionTemplates: SuggestedAction[] = [
    // Credit Application Actions
    {
      id: 'send_credit_app',
      title: 'Send Credit Application',
      description: 'Send comprehensive credit application to customer and all business owners',
      priority: 'high',
      category: 'credit',
      condition: 'no_credit_application',
      action: 'SEND_CREDIT_APPLICATION',
      requiresApproval: false,
      estimatedTime: '2-3 business days',
      icon: '📄',
    },
    {
      id: 'pull_credit_background',
      title: 'Pull Credit & Background Checks',
      description: 'Run comprehensive credit and background checks for all applicants',
      priority: 'high',
      category: 'credit',
      condition: 'has_credit_application',
      action: 'PULL_CREDIT_BACKGROUND',
      requiresApproval: true,
      estimatedTime: '1-2 hours',
      icon: '🔍',
    },

    // Bank Statement Analysis
    {
      id: 'cashflow_analysis',
      title: 'Cash Flow Analysis',
      description:
        'Analyze bank statements for cash flow patterns, income stability, and expense trends',
      priority: 'high',
      category: 'underwriting',
      condition: 'has_bank_statements',
      action: 'ANALYZE_CASHFLOW',
      requiresApproval: false,
      estimatedTime: '30-45 minutes',
      icon: '💰',
    },
    {
      id: 'income_verification',
      title: 'Income Verification',
      description: 'Verify and categorize income sources from bank statement deposits',
      priority: 'medium',
      category: 'underwriting',
      condition: 'has_bank_statements',
      action: 'VERIFY_INCOME',
      requiresApproval: false,
      estimatedTime: '20-30 minutes',
      icon: '💵',
    },
    {
      id: 'expense_categorization',
      title: 'Expense Analysis',
      description: 'Categorize and analyze business expenses for debt service capacity',
      priority: 'medium',
      category: 'underwriting',
      condition: 'has_bank_statements',
      action: 'ANALYZE_EXPENSES',
      requiresApproval: false,
      estimatedTime: '15-25 minutes',
      icon: '📊',
    },

    // Financial Statement Analysis
    {
      id: 'debt_service_ratio',
      title: 'Calculate Debt Service Coverage Ratio',
      description: 'Calculate DSCR based on financial statements and existing debt obligations',
      priority: 'high',
      category: 'analysis',
      condition: 'has_financial_statements',
      action: 'CALCULATE_DSCR',
      requiresApproval: false,
      estimatedTime: '10-15 minutes',
      icon: '📈',
    },
    {
      id: 'liquidity_ratios',
      title: 'Liquidity Analysis',
      description: 'Calculate current ratio, quick ratio, and working capital analysis',
      priority: 'high',
      category: 'analysis',
      condition: 'has_financial_statements',
      action: 'CALCULATE_LIQUIDITY_RATIOS',
      requiresApproval: false,
      estimatedTime: '10-15 minutes',
      icon: '💧',
    },
    {
      id: 'profitability_ratios',
      title: 'Profitability Analysis',
      description: 'Calculate profit margins, ROA, ROE, and other profitability metrics',
      priority: 'medium',
      category: 'analysis',
      condition: 'has_financial_statements',
      action: 'CALCULATE_PROFITABILITY_RATIOS',
      requiresApproval: false,
      estimatedTime: '15-20 minutes',
      icon: '📊',
    },
    {
      id: 'leverage_ratios',
      title: 'Leverage Analysis',
      description: 'Calculate debt-to-equity, debt-to-assets, and other leverage metrics',
      priority: 'medium',
      category: 'analysis',
      condition: 'has_financial_statements',
      action: 'CALCULATE_LEVERAGE_RATIOS',
      requiresApproval: false,
      estimatedTime: '10-15 minutes',
      icon: '⚖️',
    },

    // Tax Return Audit
    {
      id: 'tax_financial_audit',
      title: 'Tax Return vs Financial Statement Audit',
      description:
        'Cross-reference tax returns with financial statements following GAAP and IRS guidelines',
      priority: 'high',
      category: 'compliance',
      condition: 'has_tax_returns_and_financials',
      action: 'RUN_TAX_FINANCIAL_AUDIT',
      requiresApproval: true,
      estimatedTime: '45-60 minutes',
      icon: '🔍',
    },
    {
      id: 'gaap_compliance_check',
      title: 'GAAP Compliance Review',
      description: 'Review financial statements for GAAP compliance and identify discrepancies',
      priority: 'medium',
      category: 'compliance',
      condition: 'has_financial_statements',
      action: 'CHECK_GAAP_COMPLIANCE',
      requiresApproval: false,
      estimatedTime: '30-40 minutes',
      icon: '📋',
    },

    // Document Collection
    {
      id: 'request_bank_statements',
      title: 'Request Bank Statements',
      description: 'Request 12 months of business bank statements from all accounts',
      priority: 'high',
      category: 'documentation',
      condition: 'no_bank_statements',
      action: 'REQUEST_BANK_STATEMENTS',
      requiresApproval: false,
      estimatedTime: '2-5 business days',
      icon: '🏦',
    },
    {
      id: 'request_financial_statements',
      title: 'Request Financial Statements',
      description: 'Request last 3 years of profit & loss statements and balance sheets',
      priority: 'high',
      category: 'documentation',
      condition: 'no_financial_statements',
      action: 'REQUEST_FINANCIAL_STATEMENTS',
      requiresApproval: false,
      estimatedTime: '3-7 business days',
      icon: '📊',
    },
    {
      id: 'request_tax_returns',
      title: 'Request Tax Returns',
      description:
        'Request last 3 years of business tax returns (1120, 1120S, 1065, or Schedule C)',
      priority: 'medium',
      category: 'documentation',
      condition: 'no_tax_returns',
      action: 'REQUEST_TAX_RETURNS',
      requiresApproval: false,
      estimatedTime: '3-7 business days',
      icon: '📄',
    },
  ];

  /**
   * Analyze conversation state and generate intelligent suggestions
   */
  analyzeConversation(
    messages: ConversationMessage[],
    customerData: CustomerData,
    availableDocuments: Array<{ name: string; type: string; uploadDate: Date }>,
  ): ConversationAnalysis {
    // Determine conversation phase based on message content and customer data
    const phase = this.determineConversationPhase(messages, customerData);

    // Calculate customer data completeness
    const customerDataCompleteness = this.calculateDataCompleteness(
      customerData,
      availableDocuments,
    );

    // Assess risk level based on available information
    const riskLevel = this.assessRiskLevel(customerData, messages);

    // Generate suggested next actions
    const suggestedNextActions = this.generateSuggestedActions(
      phase,
      customerData,
      availableDocuments,
      riskLevel,
    );

    // Identify urgent items requiring immediate attention
    const urgentItems = this.identifyUrgentItems(customerData, messages, availableDocuments);

    // Identify missing documents
    const missingDocuments = this.identifyMissingDocuments(customerData, availableDocuments);

    // Generate conversation summary
    const conversationSummary = this.generateConversationSummary(messages, phase);

    // Generate next steps
    const nextSteps = this.generateNextSteps(phase, customerData, suggestedNextActions);

    return {
      phase,
      customerDataCompleteness,
      riskLevel,
      suggestedNextActions,
      urgentItems,
      missingDocuments,
      conversationSummary,
      nextSteps,
    };
  }

  private determineConversationPhase(
    messages: ConversationMessage[],
    customerData: CustomerData,
  ): 'initial' | 'gathering' | 'analysis' | 'decision' | 'completion' {
    if (messages.length <= 2) return 'initial';

    const hasBasicInfo = customerData.businessName || customerData.personalInfo?.firstName;
    const hasDetailedInfo = customerData.businessInfo?.ein || customerData.businessInfo?.address;

    if (!hasBasicInfo) return 'gathering';
    if (!hasDetailedInfo) return 'analysis';
    if (messages.length > 10) return 'decision';

    return 'completion';
  }

  private calculateDataCompleteness(
    customerData: CustomerData,
    availableDocuments: Array<{ name: string; type: string; uploadDate: Date }>,
  ): number {
    if (!customerData.businessName && !customerData.personalInfo?.firstName) {
      return 0;
    }

    const requiredFields = [
      'businessName',
      'industry',
      'businessType',
      'yearEstablished',
      'annualRevenue',
      'numberOfEmployees',
      'ownerName',
      'ownerSSN',
    ];

    const requiredDocuments = [
      'bank_statements',
      'financial_statements',
      'tax_returns',
      'credit_application',
    ];

    const customerFieldsComplete = requiredFields.filter(
      field =>
        customerData[field as keyof CustomerData] &&
        customerData[field as keyof CustomerData] !== '',
    ).length;

    const documentsComplete = requiredDocuments.filter(doc =>
      availableDocuments.some(d => d.name === doc),
    ).length;

    const customerScore = (customerFieldsComplete / requiredFields.length) * 50;
    const documentScore = (documentsComplete / requiredDocuments.length) * 50;

    return Math.round(customerScore + documentScore);
  }

  private assessRiskLevel(
    customerData: CustomerData,
    messages: ConversationMessage[],
  ): 'low' | 'medium' | 'high' {
    let riskFactors = 0;

    // Customer risk factors
    if (customerData.creditScore && customerData.creditScore < 650) riskFactors += 2;
    if (customerData.annualRevenue && customerData.annualRevenue < 100000) riskFactors += 1;
    if (customerData.yearEstablished && new Date().getFullYear() - customerData.yearEstablished < 2)
      riskFactors += 2;

    // Conversation pattern risk
    const urgentKeywords = ['urgent', 'emergency', 'asap', 'immediately', 'crisis'];
    const hasUrgentLanguage = messages.some(msg =>
      urgentKeywords.some(keyword => msg.content.toLowerCase().includes(keyword)),
    );
    if (hasUrgentLanguage) riskFactors += 1;

    if (riskFactors >= 4) return 'high';
    if (riskFactors >= 2) return 'medium';
    return 'low';
  }

  private generateSuggestedActions(
    phase: string,
    customerData: CustomerData,
    availableDocuments: Array<{ name: string; type: string; uploadDate: Date }>,
    riskLevel: string,
  ): SuggestedAction[] {
    const actions: SuggestedAction[] = [];

    // Add web research actions with required properties
    if (customerData.businessName) {
      actions.push({
        id: `business-verify-${Date.now()}`,
        title: 'Verify Business Information',
        description: 'Conduct web research to verify business details and registration status',
        priority: 'high',
        category: 'verification',
        condition: 'Business name provided',
        action: 'web_research_business',
        requiresApproval: false,
        estimatedTime: '10 minutes',
        icon: '🔍',
        metadata: {
          verificationScore: 0,
          factors: ['Business name verification pending'],
        },
      });
    }

    // Add compliance check action
    actions.push({
      id: `compliance-check-${Date.now()}`,
      title: 'Compliance Web Search',
      description: 'Search for any regulatory issues or compliance concerns',
      priority: riskLevel === 'high' ? 'urgent' : 'medium',
      category: 'compliance',
      condition: 'Customer information available',
      action: 'web_research_compliance',
      requiresApproval: riskLevel === 'high',
      estimatedTime: '15 minutes',
      icon: '🛡️',
      metadata: {
        riskLevel,
      },
    });

    return actions;
  }

  private identifyUrgentItems(
    customerData: CustomerData,
    messages: ConversationMessage[],
    availableDocuments: Array<{ name: string; type: string; uploadDate: Date }>,
  ): string[] {
    const urgent: string[] = [];

    // Credit score urgent items
    if (customerData.creditScore && customerData.creditScore < 600) {
      urgent.push('Low credit score requires immediate attention');
    }

    // Missing critical documents
    if (!availableDocuments.some(d => d.name === 'credit_application')) {
      urgent.push('Credit application required to proceed');
    }

    // Time-sensitive items from conversation
    const recentMessages = messages.slice(-5);
    const timeKeywords = ['deadline', 'expires', 'due date', 'closing'];

    recentMessages.forEach(msg => {
      timeKeywords.forEach(keyword => {
        if (msg.content.toLowerCase().includes(keyword)) {
          urgent.push(`Time-sensitive item mentioned: ${keyword}`);
        }
      });
    });

    return urgent;
  }

  private identifyMissingDocuments(
    customerData: CustomerData,
    availableDocuments: Array<{ name: string; type: string; uploadDate: Date }>,
  ): string[] {
    const missing: string[] = [];

    // Check for missing documents
    const requiredDocuments = [
      'bank_statements',
      'financial_statements',
      'tax_returns',
      'credit_application',
    ];

    requiredDocuments.forEach(doc => {
      if (!availableDocuments.some(d => d.name === doc)) {
        missing.push(`${doc} required to proceed`);
      }
    });

    return missing;
  }

  private generateConversationSummary(messages: ConversationMessage[], phase: string): string {
    // Implement conversation summary generation logic based on the conversation phase
    return `Conversation summary based on the current phase: ${phase}`;
  }

  private generateNextSteps(
    phase: string,
    customerData: CustomerData,
    suggestedNextActions: SuggestedAction[],
  ): string[] {
    // Implement next steps generation logic based on the conversation phase and customer data
    return [];
  }

  generateContextualPrompts(analysis: ConversationAnalysis, customer: Customer | null): string[] {
    const prompts: string[] = [];

    // Generate prompts based on suggested actions
    analysis.suggestedNextActions.forEach(action => {
      switch (action.action) {
        case 'SEND_CREDIT_APPLICATION':
          prompts.push(
            `Would you like me to send a credit application to ${customer?.businessName || 'the customer'} and all business owners?`,
          );
          break;

        case 'PULL_CREDIT_BACKGROUND':
          prompts.push(
            'Should I proceed with pulling credit reports and background checks for all applicants?',
          );
          break;

        case 'ANALYZE_CASHFLOW':
          prompts.push(
            'Would you like me to analyze the bank statements for cash flow patterns and income verification?',
          );
          break;

        case 'CALCULATE_DSCR':
          prompts.push(
            'Should I calculate the debt service coverage ratio based on the available financial statements?',
          );
          break;

        case 'RUN_TAX_FINANCIAL_AUDIT':
          prompts.push(
            'Would you like me to run a comprehensive audit comparing tax returns to financial statements?',
          );
          break;
      }
    });

    // Add general guidance prompts
    if (analysis.customerDataCompleteness < 70) {
      prompts.push('What additional information do you need me to gather from this customer?');
    }

    if (analysis.riskLevel === 'high') {
      prompts.push(
        'I notice some risk factors - would you like me to recommend additional due diligence steps?',
      );
    }

    return prompts.slice(0, 3); // Return top 3 prompts
  }

  /**
   * Enhanced analysis with web research integration
   */
  async analyzeConversationWithWebSearch(
    messages: ConversationMessage[],
    customerData: CustomerData,
    availableDocuments: Array<{ name: string; type: string; uploadDate: Date }>,
    includeWebSearch = true,
  ): Promise<ConversationAnalysis> {
    const baseAnalysis = this.analyzeConversation(messages, customerData, availableDocuments);

    if (!includeWebSearch) {
      return baseAnalysis;
    }

    try {
      // Perform web research if customer/business information is available
      const webResearchResults = await this.performWebResearch(customerData as any);

      // Enhance analysis with web research findings
      if (webResearchResults) {
        // Add web research insights to suggested actions
        const webResearchActions = this.generateWebResearchActions(webResearchResults);
        baseAnalysis.suggestedNextActions.push(...webResearchActions);

        // Update risk assessment based on web findings
        if (webResearchResults.complianceCheck?.riskLevel === 'high') {
          baseAnalysis.riskLevel = 'high';
          baseAnalysis.urgentItems.push(
            'High compliance risk detected from web research - immediate review required',
          );
        }

        // Add verification score to completeness assessment
        if (webResearchResults.businessVerification?.verificationScore) {
          baseAnalysis.customerDataCompleteness = Math.max(
            baseAnalysis.customerDataCompleteness,
            webResearchResults.businessVerification.verificationScore / 100,
          );
        }
      }
    } catch (error) {
      console.warn('Web research failed, continuing with base analysis:', error);
    }

    return baseAnalysis;
  }

  /**
   * Perform comprehensive web research on customer/business
   */
  private async performWebResearch(customerData: CustomerData): Promise<{
    businessVerification?: any;
    complianceCheck?: any;
    newsResearch?: any;
  } | null> {
    if (!customerData.businessName && !customerData.personalInfo?.firstName) {
      return null;
    }

    try {
      const entityName =
        customerData.businessName ||
        `${customerData.personalInfo?.firstName} ${customerData.personalInfo?.lastName}`;

      const results: any = {};

      // Business verification (if business name exists)
      if (customerData.businessName) {
        results.businessVerification = await webSearchService.verifyBusiness(
          customerData.businessName,
          customerData.businessInfo?.ein,
          customerData.businessInfo?.address,
        );
      }

      // Compliance check
      results.complianceCheck = await webSearchService.checkCompliance(
        entityName,
        customerData.businessName ? 'business' : 'individual',
      );

      // Recent news research
      results.newsResearch = await webSearchService.searchNews(entityName, 90);

      return results;
    } catch (error) {
      console.error('Web research failed:', error);
      return null;
    }
  }

  /**
   * Generate action items based on web research findings
   */
  private generateWebResearchActions(webResearchResults: any): SuggestedAction[] {
    const actions: SuggestedAction[] = [];

    // Business verification actions
    if (webResearchResults.businessVerification) {
      const verification = webResearchResults.businessVerification;

      if (verification.verificationScore < 60) {
        actions.push({
          id: `web-verify-${Date.now()}`,
          title: 'Business Verification Required',
          description: `Verification score: ${verification.verificationScore}%. Additional documentation may be needed.`,
          priority: 'high',
          category: 'verification',
          condition: 'Low verification score detected',
          action: 'request_additional_documentation',
          requiresApproval: false,
          estimatedTime: '15 minutes',
          icon: '⚠️',
          metadata: {
            verificationScore: verification.verificationScore,
            factors: verification.verificationFactors,
          },
        });
      } else if (verification.verificationScore >= 80) {
        actions.push({
          id: `web-verified-${Date.now()}`,
          title: 'Business Well Verified',
          description: `Strong verification score: ${verification.verificationScore}%. Proceed with confidence.`,
          priority: 'low',
          category: 'verification',
          condition: 'High verification score achieved',
          action: 'mark_verified',
          requiresApproval: false,
          estimatedTime: '2 minutes',
          icon: '✅',
          metadata: {
            verificationScore: verification.verificationScore,
          },
        });
      }
    }

    // Compliance risk actions
    if (webResearchResults.complianceCheck) {
      const compliance = webResearchResults.complianceCheck;

      if (compliance.riskLevel === 'high') {
        actions.push({
          id: `web-compliance-${Date.now()}`,
          title: 'High Compliance Risk Detected',
          description:
            'Web research revealed potential compliance issues. Immediate review required.',
          priority: 'urgent',
          category: 'compliance',
          condition: 'High compliance risk detected',
          action: 'compliance_review',
          requiresApproval: true,
          estimatedTime: '30 minutes',
          icon: '🚨',
          metadata: {
            riskLevel: compliance.riskLevel,
            riskFactors: compliance.riskFactors,
          },
        });
      } else if (compliance.riskLevel === 'medium') {
        actions.push({
          id: `web-compliance-medium-${Date.now()}`,
          title: 'Medium Compliance Risk',
          description: 'Some compliance concerns found. Additional due diligence recommended.',
          priority: 'medium',
          category: 'compliance',
          condition: 'Medium compliance risk detected',
          action: 'enhanced_due_diligence',
          requiresApproval: false,
          estimatedTime: '20 minutes',
          icon: '⚠️',
          metadata: {
            riskLevel: compliance.riskLevel,
            riskFactors: compliance.riskFactors,
          },
        });
      }
    }

    // News research actions
    if (webResearchResults.newsResearch?.web?.results?.length > 0) {
      const newsCount = webResearchResults.newsResearch.web.results.length;
      actions.push({
        id: `web-news-${Date.now()}`,
        title: 'Recent News Coverage Found',
        description: `${newsCount} recent news articles found. Review for relevant information.`,
        priority: 'medium',
        category: 'research',
        condition: 'Recent news coverage available',
        action: 'review_news_coverage',
        requiresApproval: false,
        estimatedTime: '10 minutes',
        icon: '📰',
        metadata: {
          newsCount,
          searchResults: webResearchResults.newsResearch,
        },
      });
    }

    return actions;
  }

  /**
   * Generate enhanced contextual prompts including web research suggestions
   */
  generateContextualPromptsWithWebSearch(
    analysis: ConversationAnalysis,
    customerData: CustomerData,
  ): string[] {
    const basePrompts = this.generateContextualPrompts(analysis, customerData as any);

    const webResearchPrompts: string[] = [];

    // Add web research specific prompts
    if (customerData.businessName) {
      webResearchPrompts.push(
        `Can you verify the business information for ${customerData.businessName} using web research?`,
        `What recent news or developments should we know about ${customerData.businessName}?`,
        `Are there any compliance or regulatory issues we should be aware of for ${customerData.businessName}?`,
      );
    }

    if (analysis.riskLevel === 'high') {
      webResearchPrompts.push(
        'Can you perform a comprehensive compliance check using web research?',
        'What additional due diligence should we conduct based on web findings?',
      );
    }

    if (analysis.customerDataCompleteness < 0.7) {
      webResearchPrompts.push(
        'Can you help fill in missing information using web research?',
        'What publicly available information can you find about this customer?',
      );
    }

    // Combine and limit to most relevant prompts
    return [
      ...basePrompts.slice(0, 2),
      ...webResearchPrompts.slice(0, 2),
      ...basePrompts.slice(2),
    ].slice(0, 5);
  }
}

export const conversationIntelligenceService = new ConversationIntelligenceService();
