import { TransactionProfile } from '../contexts/EVATransactionContext';

export interface RoleSpecificGoal {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expectedOutcome: string;
  timeframe: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  estimatedTime: string;
}

export interface RoleSpecificResponse {
  message: string;
  nextSteps: WorkflowStep[];
  suggestedActions: string[];
  expectedTimeframe: string;
  confidence: number;
}

export class RoleSpecificEVAService {
  // Borrower-specific tools (different from lenders)
  private borrowerTools: string[] = [
    'credit-check',
    'lender-match',
    'rate-comparison',
    'document-upload',
    'application-status',
    'pre-approval-calculator',
    'credit-improvement-tips',
    'loan-affordability-analysis',
    'collateral-evaluation',
    'fast-decline-detection',
  ];

  // Vendor-specific tools (different from lenders and borrowers)
  private vendorTools: string[] = [
    'pipeline-analysis',
    'deal-acceleration',
    'vendor-network-expansion',
    'commission-tracker',
    'deal-matching-ai',
    'performance-analytics',
    'market-insights',
    'lender-relationship-manager',
    'territory-optimization',
    'vendor-scorecard',
  ];

  // Lender-specific tools (for comparison)
  private lenderTools: string[] = [
    'underwriting-assistant',
    'risk-assessment',
    'portfolio-analysis',
    'compliance-checker',
    'document-verification',
    'credit-decision-engine',
    'regulatory-reporting',
    'loan-pricing-optimizer',
    'borrower-communication',
    'audit-trail-generator',
  ];

  // Borrower-specific goals: Get lender results and/or fast declines
  private borrowerGoals: RoleSpecificGoal[] = [
    {
      id: 'fast-approval',
      title: 'Fast Loan Approval',
      description: 'Get quick pre-approval or decline decision',
      priority: 'high',
      expectedOutcome: 'Approval/Decline within 24 hours',
      timeframe: '1-3 business days',
    },
    {
      id: 'lender-matching',
      title: 'Find Best Lenders',
      description: 'Match with lenders offering best terms',
      priority: 'high',
      expectedOutcome: '3-5 qualified lender options',
      timeframe: '2-5 business days',
    },
    {
      id: 'rate-optimization',
      title: 'Optimize Interest Rates',
      description: 'Find lowest possible rates',
      priority: 'medium',
      expectedOutcome: 'Rate improvement of 0.5-2%',
      timeframe: '3-7 business days',
    },
  ];

  // Vendor-specific goals: Fast decisions and more deals funded
  private vendorGoals: RoleSpecificGoal[] = [
    {
      id: 'deal-acceleration',
      title: 'Accelerate Deal Closure',
      description: 'Speed up funding process for pending deals',
      priority: 'high',
      expectedOutcome: '40% faster funding timeline',
      timeframe: '1-2 business days',
    },
    {
      id: 'volume-increase',
      title: 'Increase Deal Volume',
      description: 'Get more deals funded through optimal matching',
      priority: 'high',
      expectedOutcome: '25% increase in funded deals',
      timeframe: '1-4 weeks',
    },
    {
      id: 'lender-network',
      title: 'Expand Lender Network',
      description: 'Access to broader lender marketplace',
      priority: 'medium',
      expectedOutcome: '10+ new lender partnerships',
      timeframe: '2-6 weeks',
    },
  ];

  // Get role-specific goals
  public getRoleGoals(userType: string): RoleSpecificGoal[] {
    switch (userType?.toLowerCase()) {
      case 'borrower':
        return this.borrowerGoals;
      case 'vendor':
        return this.vendorGoals;
      default:
        return [...this.borrowerGoals, ...this.vendorGoals];
    }
  }

  // Get role-specific tools
  public getRoleTools(userType: string): string[] {
    switch (userType?.toLowerCase()) {
      case 'borrower':
        return this.borrowerTools;
      case 'vendor':
        return this.vendorTools;
      case 'lender':
        return this.lenderTools;
      default:
        return [...this.borrowerTools, ...this.vendorTools];
    }
  }

  // Get detailed tool information
  public getToolDetails(toolName: string, userType: string): any {
    const toolDefinitions = {
      // Borrower Tools
      'credit-check': {
        name: 'Quick Credit Check',
        description: 'Instant soft credit pull and score analysis',
        category: 'assessment',
        estimatedTime: '2 minutes',
        outcome: 'Credit score and eligibility status',
        userTypes: ['borrower'],
      },
      'lender-match': {
        name: 'Smart Lender Matching',
        description: 'AI-powered matching with best lenders for your profile',
        category: 'matching',
        estimatedTime: '5 minutes',
        outcome: '3-5 qualified lender options',
        userTypes: ['borrower'],
      },
      'rate-comparison': {
        name: 'Rate Shopping Engine',
        description: 'Compare rates across multiple lenders simultaneously',
        category: 'analysis',
        estimatedTime: '3 minutes',
        outcome: 'Rate comparison with savings potential',
        userTypes: ['borrower'],
      },
      'fast-decline-detection': {
        name: 'Fast Decline Prevention',
        description: 'Pre-screen for automatic declines before application',
        category: 'prevention',
        estimatedTime: '1 minute',
        outcome: 'Decline risk assessment and recommendations',
        userTypes: ['borrower'],
      },

      // Vendor Tools
      'pipeline-analysis': {
        name: 'Deal Pipeline Analytics',
        description: 'Comprehensive analysis of your deal pipeline health',
        category: 'analytics',
        estimatedTime: '5 minutes',
        outcome: 'Pipeline insights and optimization recommendations',
        userTypes: ['vendor'],
      },
      'deal-acceleration': {
        name: 'Deal Acceleration Engine',
        description: 'Identify and fast-track high-potential deals',
        category: 'acceleration',
        estimatedTime: '3 minutes',
        outcome: '40% faster deal closure times',
        userTypes: ['vendor'],
      },
      'vendor-network-expansion': {
        name: 'Network Expansion Tool',
        description: 'Discover new lender partnerships and opportunities',
        category: 'networking',
        estimatedTime: '10 minutes',
        outcome: '10+ new potential partnerships',
        userTypes: ['vendor'],
      },
      'commission-tracker': {
        name: 'Commission Analytics',
        description: 'Track and optimize commission rates across deals',
        category: 'financial',
        estimatedTime: '2 minutes',
        outcome: 'Commission optimization insights',
        userTypes: ['vendor'],
      },
      'deal-matching-ai': {
        name: 'AI Deal Matching',
        description: 'Match deals with optimal lenders using AI',
        category: 'matching',
        estimatedTime: '4 minutes',
        outcome: 'Higher approval rates and better terms',
        userTypes: ['vendor'],
      },
      'performance-analytics': {
        name: 'Vendor Performance Dashboard',
        description: 'Comprehensive performance metrics and trends',
        category: 'analytics',
        estimatedTime: '5 minutes',
        outcome: 'Performance insights and improvement areas',
        userTypes: ['vendor'],
      },

      // Lender Tools
      'underwriting-assistant': {
        name: 'AI Underwriting Assistant',
        description: 'Automated underwriting support and decision assistance',
        category: 'underwriting',
        estimatedTime: '10 minutes',
        outcome: 'Faster, more accurate underwriting decisions',
        userTypes: ['lender'],
      },
      'risk-assessment': {
        name: 'Advanced Risk Assessment',
        description: 'Comprehensive risk analysis and scoring',
        category: 'risk',
        estimatedTime: '8 minutes',
        outcome: 'Detailed risk profile and recommendations',
        userTypes: ['lender'],
      },
    };

    return (
      toolDefinitions[toolName] || {
        name: toolName,
        description: 'Tool description not available',
        category: 'general',
        estimatedTime: 'Unknown',
        outcome: 'Processing result',
        userTypes: [userType],
      }
    );
  }

  // Generate role-specific EVA response
  public generateRoleSpecificResponse(
    userType: string,
    message: string,
    transaction?: TransactionProfile,
  ): RoleSpecificResponse {
    const userTypeNormalized = userType?.toLowerCase();

    if (userTypeNormalized === 'borrower') {
      return this.generateBorrowerResponse(message, transaction);
    } else if (userTypeNormalized === 'vendor') {
      return this.generateVendorResponse(message, transaction);
    } else {
      return this.generateGenericResponse(message, transaction);
    }
  }

  private generateBorrowerResponse(
    message: string,
    transaction?: TransactionProfile,
  ): RoleSpecificResponse {
    const lowerMessage = message.toLowerCase();

    // Fast approval/decline workflow
    if (
      lowerMessage.includes('loan') ||
      lowerMessage.includes('approval') ||
      lowerMessage.includes('funding')
    ) {
      return {
        message: `I'll help you get a fast loan decision! Based on your request, I'm analyzing your profile for quick pre-approval or decline. Let me check your eligibility across our lender network.`,
        nextSteps: [
          {
            id: 'credit-check',
            title: 'Quick Credit Assessment',
            description: 'Soft credit pull to determine eligibility',
            required: true,
            status: 'pending',
            estimatedTime: '2 minutes',
          },
          {
            id: 'lender-match',
            title: 'Lender Matching',
            description: 'Find 3-5 best lender options',
            required: true,
            status: 'pending',
            estimatedTime: '5 minutes',
          },
          {
            id: 'pre-approval',
            title: 'Pre-Approval Decision',
            description: 'Get approval or decline decision',
            required: true,
            status: 'pending',
            estimatedTime: '10 minutes',
          },
        ],
        suggestedActions: [
          'Provide income verification documents',
          'Submit bank statements for faster processing',
          'Confirm loan amount and purpose',
        ],
        expectedTimeframe: 'Decision within 15 minutes',
        confidence: 0.92,
      };
    }

    // Rate shopping workflow
    if (
      lowerMessage.includes('rate') ||
      lowerMessage.includes('interest') ||
      lowerMessage.includes('better terms')
    ) {
      return {
        message: `I'll help you find the best rates available! Let me shop your loan across multiple lenders to get you the lowest possible rate.`,
        nextSteps: [
          {
            id: 'rate-comparison',
            title: 'Multi-Lender Rate Check',
            description: 'Compare rates from 10+ lenders',
            required: true,
            status: 'pending',
            estimatedTime: '3 minutes',
          },
          {
            id: 'term-optimization',
            title: 'Optimize Loan Terms',
            description: 'Find best combination of rate and terms',
            required: true,
            status: 'pending',
            estimatedTime: '5 minutes',
          },
        ],
        suggestedActions: [
          'Compare multiple rate options',
          'Consider different loan terms',
          'Lock in your preferred rate',
        ],
        expectedTimeframe: 'Rate quotes in 8 minutes',
        confidence: 0.88,
      };
    }

    return this.generateGenericBorrowerResponse(transaction);
  }

  private generateVendorResponse(
    message: string,
    transaction?: TransactionProfile,
  ): RoleSpecificResponse {
    const lowerMessage = message.toLowerCase();

    // Deal acceleration workflow
    if (
      lowerMessage.includes('close') ||
      lowerMessage.includes('fund') ||
      lowerMessage.includes('deal')
    ) {
      return {
        message: `I'll help you close more deals faster! Let me optimize your current pipeline and identify quick-close opportunities with our lender network.`,
        nextSteps: [
          {
            id: 'pipeline-analysis',
            title: 'Pipeline Assessment',
            description: 'Analyze current deals for closure potential',
            required: true,
            status: 'pending',
            estimatedTime: '5 minutes',
          },
          {
            id: 'lender-optimization',
            title: 'Lender Route Optimization',
            description: 'Match deals to best-fit lenders',
            required: true,
            status: 'pending',
            estimatedTime: '8 minutes',
          },
          {
            id: 'closure-acceleration',
            title: 'Accelerate Funding',
            description: 'Fast-track high-probability deals',
            required: true,
            status: 'pending',
            estimatedTime: '12 minutes',
          },
        ],
        suggestedActions: [
          'Upload current deal pipeline',
          'Prioritize high-value transactions',
          'Set up automated lender matching',
        ],
        expectedTimeframe: 'Deal optimization in 25 minutes',
        confidence: 0.94,
      };
    }

    // Volume increase workflow
    if (
      lowerMessage.includes('volume') ||
      lowerMessage.includes('more deals') ||
      lowerMessage.includes('increase')
    ) {
      return {
        message: `I'll help you increase your deal volume! Let me connect you with additional lenders and optimize your approval rates.`,
        nextSteps: [
          {
            id: 'lender-expansion',
            title: 'Expand Lender Network',
            description: 'Connect with 5+ new lender partners',
            required: true,
            status: 'pending',
            estimatedTime: '10 minutes',
          },
          {
            id: 'approval-optimization',
            title: 'Optimize Approval Rates',
            description: 'Improve deal structuring for higher approvals',
            required: true,
            status: 'pending',
            estimatedTime: '15 minutes',
          },
        ],
        suggestedActions: [
          'Review successful deal patterns',
          'Identify new lender opportunities',
          'Set up volume-based partnerships',
        ],
        expectedTimeframe: 'Network expansion in 25 minutes',
        confidence: 0.9,
      };
    }

    return this.generateGenericVendorResponse(transaction);
  }

  private generateGenericBorrowerResponse(transaction?: TransactionProfile): RoleSpecificResponse {
    return {
      message: `As a borrower, I'm here to help you get fast loan decisions and find the best lenders for your needs. What type of financing are you looking for?`,
      nextSteps: [
        {
          id: 'needs-assessment',
          title: 'Assess Financing Needs',
          description: 'Determine loan type and amount',
          required: true,
          status: 'pending',
          estimatedTime: '3 minutes',
        },
        {
          id: 'eligibility-check',
          title: 'Quick Eligibility Check',
          description: 'Preliminary qualification assessment',
          required: true,
          status: 'pending',
          estimatedTime: '5 minutes',
        },
      ],
      suggestedActions: [
        'Specify loan amount needed',
        'Provide business/personal information',
        'Upload required documents',
      ],
      expectedTimeframe: 'Initial assessment in 8 minutes',
      confidence: 0.85,
    };
  }

  private generateGenericVendorResponse(transaction?: TransactionProfile): RoleSpecificResponse {
    return {
      message: `As a vendor, I'm here to help you close more deals and increase your funding volume. Let's optimize your current pipeline and find new opportunities.`,
      nextSteps: [
        {
          id: 'portfolio-review',
          title: 'Review Current Portfolio',
          description: 'Analyze current deals and success rates',
          required: true,
          status: 'pending',
          estimatedTime: '5 minutes',
        },
        {
          id: 'opportunity-identification',
          title: 'Identify Opportunities',
          description: 'Find quick-close and high-value deals',
          required: true,
          status: 'pending',
          estimatedTime: '8 minutes',
        },
      ],
      suggestedActions: [
        'Upload current deal pipeline',
        'Set closure targets',
        'Connect with new lenders',
      ],
      expectedTimeframe: 'Portfolio optimization in 13 minutes',
      confidence: 0.87,
    };
  }

  private generateGenericResponse(
    message: string,
    transaction?: TransactionProfile,
  ): RoleSpecificResponse {
    return {
      message: `I'll help you achieve your financing goals. Please let me know if you're looking to borrow funds or if you're a vendor seeking to close more deals.`,
      nextSteps: [
        {
          id: 'role-clarification',
          title: 'Clarify Your Role',
          description: "Determine if you're a borrower or vendor",
          required: true,
          status: 'pending',
          estimatedTime: '1 minute',
        },
        {
          id: 'goal-setting',
          title: 'Set Objectives',
          description: 'Define what you want to accomplish',
          required: true,
          status: 'pending',
          estimatedTime: '3 minutes',
        },
      ],
      suggestedActions: [
        'Select your user type',
        'Describe your financing needs',
        'Set your timeline',
      ],
      expectedTimeframe: 'Personalized workflow in 4 minutes',
      confidence: 0.8,
    };
  }

  // Generate contextual prompts based on user type and transaction
  public generateContextualPrompts(userType: string, transaction?: TransactionProfile): string[] {
    const userTypeNormalized = userType?.toLowerCase();

    if (userTypeNormalized === 'borrower') {
      return [
        'Can you help me get pre-approved for a loan?',
        'What lenders would be best for my credit profile?',
        'How quickly can I get a funding decision?',
        'What documents do I need for approval?',
        'Can you find me better interest rates?',
      ];
    } else if (userTypeNormalized === 'vendor') {
      return [
        'How can I close my current deals faster?',
        'Which lenders should I prioritize for quick funding?',
        'Can you help me increase my deal volume?',
        "What's the fastest path to funding for this deal?",
        'How can I optimize my approval rates?',
      ];
    } else {
      return [
        'I need help with loan approval',
        'I want to close more deals',
        'Can you help me find the right lenders?',
        "What's the fastest way to get funding?",
        'How can I optimize my financing process?',
      ];
    }
  }

  // Get transaction-specific insights
  public getTransactionInsights(userType: string, transaction: TransactionProfile): string {
    const userTypeNormalized = userType?.toLowerCase();

    if (userTypeNormalized === 'borrower') {
      const riskLevel = transaction.financialSummary?.riskScore
        ? transaction.financialSummary.riskScore > 700
          ? 'low'
          : transaction.financialSummary.riskScore > 500
            ? 'medium'
            : 'high'
        : 'medium';
      const amount = transaction.requestedAmount || 'requested amount';

      return `Based on your ${transaction.type} for ${amount}, I see a ${riskLevel} risk profile. I can help you get approved by matching you with lenders who specialize in ${transaction.type} and work with ${riskLevel} risk borrowers.`;
    } else if (userTypeNormalized === 'vendor') {
      const completionRate = transaction.completedTasks || 0;
      const totalTasks = transaction.totalTasks || 0;
      const progressPercent = totalTasks > 0 ? Math.round((completionRate / totalTasks) * 100) : 0;

      return `This ${transaction.type} is ${progressPercent}% complete. I can help accelerate the remaining tasks and connect with lenders who have fast turnaround times for this deal type.`;
    }

    return `I can help optimize this ${transaction.type} transaction for faster processing and better outcomes.`;
  }
}

export const roleSpecificEVAService = new RoleSpecificEVAService();
