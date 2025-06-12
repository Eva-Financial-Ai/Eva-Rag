import {
  BaseKPI,
  SystemAdminKPIs,
  UserAdminKPIs,
  BorrowerKPIs,
  VendorKPIs,
  BrokerKPIs,
  LenderKPIs,
  KPIDashboardConfig,
  DataSourceMapping,
} from '../types/kpi';
import { UserRole } from '../hooks/useUserPermissions';

class KPIService {
  private static instance: KPIService;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  private constructor() {
    this.initializeDataSources();
  }

  public static getInstance(): KPIService {
    if (!KPIService.instance) {
      KPIService.instance = new KPIService();
    }
    return KPIService.instance;
  }

  private initializeDataSources(): void {
    // Data source configuration for backend engineers
    const dataSources: DataSourceMapping = {
      stripe: {
        endpoints: ['/api/stripe/payments', '/api/stripe/customers', '/api/stripe/subscriptions'],
        dataPoints: ['total_revenue', 'transaction_count', 'average_transaction_value', 'mrr'],
        refreshRate: 300, // 5 minutes
      },
      quickbooks: {
        endpoints: [
          '/api/quickbooks/profit-loss',
          '/api/quickbooks/balance-sheet',
          '/api/quickbooks/cash-flow',
        ],
        dataPoints: ['revenue', 'expenses', 'profit_margin', 'cash_position'],
        refreshRate: 3600, // 1 hour
      },
      plaid: {
        endpoints: ['/api/plaid/accounts', '/api/plaid/transactions', '/api/plaid/balance'],
        dataPoints: ['account_balance', 'cash_flow', 'transaction_history'],
        refreshRate: 1800, // 30 minutes
      },
      equifax: {
        endpoints: ['/api/equifax/credit-report', '/api/equifax/credit-score'],
        dataPoints: ['credit_score', 'payment_history', 'credit_inquiries'],
        refreshRate: 86400, // 24 hours
      },
      transunion: {
        endpoints: ['/api/transunion/credit-report', '/api/transunion/business-credit'],
        dataPoints: ['personal_credit_score', 'business_credit_score', 'risk_factors'],
        refreshRate: 86400, // 24 hours
      },
      experian: {
        endpoints: ['/api/experian/credit-profile', '/api/experian/business-credit'],
        dataPoints: ['credit_score', 'credit_utilization', 'payment_behavior'],
        refreshRate: 86400, // 24 hours
      },
      paynet: {
        endpoints: ['/api/paynet/payment-history', '/api/paynet/risk-assessment'],
        dataPoints: ['payment_performance', 'default_probability', 'industry_comparison'],
        refreshRate: 43200, // 12 hours
      },
      google: {
        endpoints: ['/api/google-analytics/users', '/api/google-analytics/sessions'],
        dataPoints: ['active_users', 'session_duration', 'page_views', 'conversion_rate'],
        refreshRate: 900, // 15 minutes
      },
      xero: {
        endpoints: ['/api/xero/profit-loss', '/api/xero/balance-sheet'],
        dataPoints: ['revenue', 'expenses', 'cash_flow', 'profit_margin'],
        refreshRate: 3600, // 1 hour
      },
      netsuite: {
        endpoints: ['/api/netsuite/financials', '/api/netsuite/inventory'],
        dataPoints: ['revenue', 'inventory_turnover', 'operating_expenses'],
        refreshRate: 3600, // 1 hour
      },
    };
  }

  // Get KPIs for any role type
  public async getKPIs(
    roleType: 'borrower' | 'vendor' | 'broker' | 'lender',
    viewType: 'system-admin' | 'user-admin',
    organizationId?: string
  ): Promise<any> {
    switch (roleType) {
      case 'borrower':
        return viewType === 'system-admin'
          ? this.getBorrowerSystemKPIs()
          : this.getBorrowerUserKPIs(organizationId);
      case 'vendor':
        return viewType === 'system-admin'
          ? this.getVendorSystemKPIs()
          : this.getVendorUserKPIs(organizationId);
      case 'broker':
        return viewType === 'system-admin'
          ? this.getBrokerSystemKPIs()
          : this.getBrokerUserKPIs(organizationId);
      case 'lender':
        return viewType === 'system-admin'
          ? this.getLenderSystemKPIs()
          : this.getLenderUserKPIs(organizationId);
      default:
        throw new Error(`Unsupported role type: ${roleType}`);
    }
  }

  // BORROWER KPIs
  private async getBorrowerSystemKPIs(): Promise<BorrowerKPIs['systemAdmin']> {
    return {
      // Credit Bureau Data (Equifax, TransUnion, Experian)
      averageBorrowerCreditScore: {
        id: 'avg-borrower-credit-score',
        label: 'Average Borrower Credit Score',
        value: 742,
        change: 3.2,
        changeType: 'increase',
        format: 'number',
        dataSource: 'equifax',
        description: 'Platform-wide average credit score from Equifax',
        lastUpdated: new Date(),
      },
      creditInquiries: {
        id: 'credit-inquiries',
        label: 'Credit Inquiries (30 days)',
        value: 1247,
        change: 12.5,
        changeType: 'increase',
        format: 'number',
        dataSource: 'transunion',
        description: 'Total credit inquiries across all borrowers',
        lastUpdated: new Date(),
      },
      // Banking Data (Plaid)
      averageBankBalance: {
        id: 'avg-bank-balance',
        label: 'Average Bank Balance',
        value: '$125,400',
        change: 8.7,
        changeType: 'increase',
        format: 'currency',
        dataSource: 'plaid',
        description: 'Average bank account balance from Plaid connections',
        lastUpdated: new Date(),
      },
      cashFlowStability: {
        id: 'cash-flow-stability',
        label: 'Cash Flow Stability',
        value: '78%',
        change: 5.1,
        changeType: 'increase',
        format: 'percentage',
        dataSource: 'plaid',
        description: 'Percentage of borrowers with stable cash flow patterns',
        lastUpdated: new Date(),
      },
      // Application Performance (Internal + PayNet)
      applicationApprovalRate: {
        id: 'application-approval-rate',
        label: 'Application Approval Rate',
        value: '68%',
        change: 4.3,
        changeType: 'increase',
        format: 'percentage',
        dataSource: 'paynet',
        description: 'Overall loan application approval rate',
        lastUpdated: new Date(),
      },
      averageProcessingTime: {
        id: 'avg-processing-time',
        label: 'Average Processing Time',
        value: 8.2,
        change: -15.3,
        changeType: 'decrease',
        format: 'days',
        dataSource: 'paynet',
        description: 'Average time from application to decision',
        lastUpdated: new Date(),
      },
      // Platform Usage (Google Analytics)
      activeBorrowers: {
        id: 'active-borrowers',
        label: 'Active Borrowers (30 days)',
        value: 2847,
        change: 18.9,
        changeType: 'increase',
        format: 'number',
        dataSource: 'google',
        description: 'Number of active borrowers in the last 30 days',
        lastUpdated: new Date(),
      },
      documentUploadRate: {
        id: 'document-upload-rate',
        label: 'Document Upload Success Rate',
        value: '94%',
        change: 2.1,
        changeType: 'increase',
        format: 'percentage',
        dataSource: 'google',
        description: 'Percentage of successful document uploads',
        lastUpdated: new Date(),
      },
    };
  }

  private async getBorrowerUserKPIs(organizationId?: string): Promise<BorrowerKPIs['userAdmin']> {
    return {
      // Organization Financials (QuickBooks/Xero/NetSuite)
      organizationCashFlow: {
        id: 'org-cash-flow',
        label: 'Monthly Cash Flow',
        value: '$45,200',
        change: 12.3,
        changeType: 'increase',
        format: 'currency',
        dataSource: 'quickbooks',
        description: 'Organization monthly cash flow from QuickBooks',
        lastUpdated: new Date(),
      },
      monthlyExpenses: {
        id: 'monthly-expenses',
        label: 'Monthly Operating Expenses',
        value: '$28,750',
        change: -3.2,
        changeType: 'decrease',
        format: 'currency',
        dataSource: 'quickbooks',
        description: 'Total monthly operating expenses',
        lastUpdated: new Date(),
      },
      // Credit Health (Credit Bureaus)
      businessCreditScore: {
        id: 'business-credit-score',
        label: 'Business Credit Score',
        value: 785,
        change: 8.1,
        changeType: 'increase',
        format: 'number',
        dataSource: 'experian',
        description: 'Business credit score from Experian',
        lastUpdated: new Date(),
      },
      personalCreditScore: {
        id: 'personal-credit-score',
        label: 'Personal Credit Score',
        value: 742,
        change: 2.3,
        changeType: 'increase',
        format: 'number',
        dataSource: 'equifax',
        description: 'Personal credit score of business owner',
        lastUpdated: new Date(),
      },
      // Loan Performance
      activeLoanApplications: {
        id: 'active-loan-applications',
        label: 'Active Loan Applications',
        value: 3,
        change: 0,
        changeType: 'neutral',
        format: 'number',
        dataSource: 'paynet',
        description: 'Number of active loan applications',
        lastUpdated: new Date(),
      },
      fundingSuccess: {
        id: 'funding-success',
        label: 'Funding Success Rate',
        value: '75%',
        change: 12.5,
        changeType: 'increase',
        format: 'percentage',
        dataSource: 'paynet',
        description: 'Percentage of applications that received funding',
        lastUpdated: new Date(),
      },
    };
  }

  // VENDOR KPIs
  private async getVendorSystemKPIs(): Promise<VendorKPIs['systemAdmin']> {
    return {
      // Sales Performance (Stripe + QuickBooks)
      totalVendorSales: {
        id: 'total-vendor-sales',
        label: 'Total Vendor Sales',
        value: '$2.4M',
        change: 22.3,
        changeType: 'increase',
        format: 'currency',
        dataSource: 'stripe',
        description: 'Total sales across all vendors from Stripe',
        lastUpdated: new Date(),
      },
      averageOrderValue: {
        id: 'avg-order-value',
        label: 'Average Order Value',
        value: '$1,850',
        change: 8.7,
        changeType: 'increase',
        format: 'currency',
        dataSource: 'stripe',
        description: 'Average order value across all vendor transactions',
        lastUpdated: new Date(),
      },
      // Financial Health (QuickBooks/Xero/NetSuite)
      vendorRevenue: {
        id: 'vendor-revenue',
        label: 'Monthly Vendor Revenue',
        value: '$425K',
        change: 15.2,
        changeType: 'increase',
        format: 'currency',
        dataSource: 'quickbooks',
        description: 'Total monthly revenue from all vendors',
        lastUpdated: new Date(),
      },
      profitMargins: {
        id: 'profit-margins',
        label: 'Average Profit Margin',
        value: '28%',
        change: 3.1,
        changeType: 'increase',
        format: 'percentage',
        dataSource: 'quickbooks',
        description: 'Average profit margin across vendors',
        lastUpdated: new Date(),
      },
      // Platform Engagement (Google Analytics)
      activeVendors: {
        id: 'active-vendors',
        label: 'Active Vendors (30 days)',
        value: 156,
        change: 12.9,
        changeType: 'increase',
        format: 'number',
        dataSource: 'google',
        description: 'Number of active vendors in the last 30 days',
        lastUpdated: new Date(),
      },
      listingConversionRate: {
        id: 'listing-conversion-rate',
        label: 'Listing Conversion Rate',
        value: '32%',
        change: 5.4,
        changeType: 'increase',
        format: 'percentage',
        dataSource: 'google',
        description: 'Percentage of listings that convert to sales',
        lastUpdated: new Date(),
      },
      // Payment Performance (Stripe + Plaid)
      paymentProcessingTime: {
        id: 'payment-processing-time',
        label: 'Payment Processing Time',
        value: 2.1,
        change: -18.5,
        changeType: 'decrease',
        format: 'days',
        dataSource: 'stripe',
        description: 'Average time to process vendor payments',
        lastUpdated: new Date(),
      },
      chargebackRate: {
        id: 'chargeback-rate',
        label: 'Chargeback Rate',
        value: '0.8%',
        change: -12.3,
        changeType: 'decrease',
        format: 'percentage',
        dataSource: 'stripe',
        description: 'Percentage of transactions resulting in chargebacks',
        lastUpdated: new Date(),
      },
    };
  }

  private async getVendorUserKPIs(organizationId?: string): Promise<VendorKPIs['userAdmin']> {
    return {
      // Sales Metrics (Stripe + Internal)
      monthlySales: {
        id: 'monthly-sales',
        label: 'Monthly Sales',
        value: '$85,400',
        change: 18.7,
        changeType: 'increase',
        format: 'currency',
        dataSource: 'stripe',
        description: 'Total sales for this month',
        lastUpdated: new Date(),
      },
      salesGrowth: {
        id: 'sales-growth',
        label: 'Sales Growth Rate',
        value: '24%',
        change: 6.2,
        changeType: 'increase',
        format: 'percentage',
        dataSource: 'stripe',
        description: 'Month-over-month sales growth',
        lastUpdated: new Date(),
      },
      // Inventory & Operations (QuickBooks/Xero/NetSuite)
      inventoryTurnover: {
        id: 'inventory-turnover',
        label: 'Inventory Turnover',
        value: 4.2,
        change: 8.9,
        changeType: 'increase',
        format: 'number',
        dataSource: 'netsuite',
        description: 'Inventory turnover ratio from NetSuite',
        lastUpdated: new Date(),
      },
      operatingExpenses: {
        id: 'operating-expenses',
        label: 'Monthly Operating Expenses',
        value: '$32,100',
        change: -2.1,
        changeType: 'decrease',
        format: 'currency',
        dataSource: 'quickbooks',
        description: 'Total monthly operating expenses',
        lastUpdated: new Date(),
      },
      // Customer Performance
      customerAcquisition: {
        id: 'customer-acquisition',
        label: 'New Customers (30 days)',
        value: 47,
        change: 25.3,
        changeType: 'increase',
        format: 'number',
        dataSource: 'google',
        description: 'Number of new customers acquired',
        lastUpdated: new Date(),
      },
      customerRetention: {
        id: 'customer-retention',
        label: 'Customer Retention Rate',
        value: '87%',
        change: 3.4,
        changeType: 'increase',
        format: 'percentage',
        dataSource: 'google',
        description: 'Percentage of customers retained month-over-month',
        lastUpdated: new Date(),
      },
    };
  }

  // BROKER KPIs
  private async getBrokerSystemKPIs(): Promise<BrokerKPIs['systemAdmin']> {
    return {
      // Commission Tracking (Stripe + QuickBooks)
      totalCommissions: {
        id: 'total-commissions',
        label: 'Total Commissions',
        value: '$1.2M',
        change: 28.4,
        changeType: 'increase',
        format: 'currency',
        dataSource: 'stripe',
        description: 'Total commissions paid to all brokers',
        lastUpdated: new Date(),
      },
      averageCommissionPerDeal: {
        id: 'avg-commission-per-deal',
        label: 'Average Commission per Deal',
        value: '$12,500',
        change: 15.7,
        changeType: 'increase',
        format: 'currency',
        dataSource: 'stripe',
        description: 'Average commission earned per closed deal',
        lastUpdated: new Date(),
      },
      // Deal Performance (Internal + PayNet)
      dealVolume: {
        id: 'deal-volume',
        label: 'Monthly Deal Volume',
        value: '$45M',
        change: 22.1,
        changeType: 'increase',
        format: 'currency',
        dataSource: 'paynet',
        description: 'Total value of deals processed monthly',
        lastUpdated: new Date(),
      },
      dealSuccessRate: {
        id: 'deal-success-rate',
        label: 'Deal Success Rate',
        value: '72%',
        change: 8.3,
        changeType: 'increase',
        format: 'percentage',
        dataSource: 'paynet',
        description: 'Percentage of deals that close successfully',
        lastUpdated: new Date(),
      },
      // Network Health (Google Analytics + Internal)
      activeBrokers: {
        id: 'active-brokers',
        label: 'Active Brokers (30 days)',
        value: 89,
        change: 12.6,
        changeType: 'increase',
        format: 'number',
        dataSource: 'google',
        description: 'Number of active brokers in the last 30 days',
        lastUpdated: new Date(),
      },
      lenderNetworkSize: {
        id: 'lender-network-size',
        label: 'Lender Network Size',
        value: 245,
        change: 8.9,
        changeType: 'increase',
        format: 'number',
        dataSource: 'paynet',
        description: 'Total number of active lenders in network',
        lastUpdated: new Date(),
      },
      // Financial Performance
      revenuePerBroker: {
        id: 'revenue-per-broker',
        label: 'Revenue per Broker',
        value: '$185K',
        change: 18.2,
        changeType: 'increase',
        format: 'currency',
        dataSource: 'stripe',
        description: 'Average annual revenue per broker',
        lastUpdated: new Date(),
      },
      brokerRetention: {
        id: 'broker-retention',
        label: 'Broker Retention Rate',
        value: '94%',
        change: 2.1,
        changeType: 'increase',
        format: 'percentage',
        dataSource: 'google',
        description: 'Percentage of brokers retained year-over-year',
        lastUpdated: new Date(),
      },
    };
  }

  private async getBrokerUserKPIs(organizationId?: string): Promise<BrokerKPIs['userAdmin']> {
    return {
      // Individual Performance (Internal + Stripe)
      personalCommissions: {
        id: 'personal-commissions',
        label: 'Personal Commissions (YTD)',
        value: '$125,400',
        change: 32.1,
        changeType: 'increase',
        format: 'currency',
        dataSource: 'stripe',
        description: 'Total commissions earned year-to-date',
        lastUpdated: new Date(),
      },
      dealsInPipeline: {
        id: 'deals-in-pipeline',
        label: 'Deals in Pipeline',
        value: 18,
        change: 12.5,
        changeType: 'increase',
        format: 'number',
        dataSource: 'paynet',
        description: 'Number of active deals in pipeline',
        lastUpdated: new Date(),
      },
      // Client Management
      activeClients: {
        id: 'active-clients',
        label: 'Active Clients',
        value: 42,
        change: 16.7,
        changeType: 'increase',
        format: 'number',
        dataSource: 'google',
        description: 'Number of active client relationships',
        lastUpdated: new Date(),
      },
      clientSatisfaction: {
        id: 'client-satisfaction',
        label: 'Client Satisfaction Score',
        value: '4.8',
        change: 4.3,
        changeType: 'increase',
        format: 'number',
        dataSource: 'google',
        description: 'Average client satisfaction rating (1-5 scale)',
        lastUpdated: new Date(),
      },
      // Productivity Metrics
      dealsClosedMonthly: {
        id: 'deals-closed-monthly',
        label: 'Deals Closed (Monthly)',
        value: 6,
        change: 20.0,
        changeType: 'increase',
        format: 'number',
        dataSource: 'paynet',
        description: 'Number of deals closed this month',
        lastUpdated: new Date(),
      },
      averageDealSize: {
        id: 'avg-deal-size',
        label: 'Average Deal Size',
        value: '$850K',
        change: 12.8,
        changeType: 'increase',
        format: 'currency',
        dataSource: 'paynet',
        description: 'Average size of closed deals',
        lastUpdated: new Date(),
      },
    };
  }

  // LENDER KPIs
  private async getLenderSystemKPIs(): Promise<LenderKPIs['systemAdmin']> {
    return {
      // Portfolio Performance (Internal + Credit Bureaus)
      totalPortfolioValue: {
        id: 'total-portfolio-value',
        label: 'Total Portfolio Value',
        value: '$125M',
        change: 18.5,
        changeType: 'increase',
        format: 'currency',
        dataSource: 'quickbooks',
        description: 'Total value of loan portfolio',
        lastUpdated: new Date(),
      },
      portfolioDefaultRate: {
        id: 'portfolio-default-rate',
        label: 'Portfolio Default Rate',
        value: '1.2%',
        change: -15.3,
        changeType: 'decrease',
        format: 'percentage',
        dataSource: 'paynet',
        description: 'Percentage of portfolio in default',
        lastUpdated: new Date(),
      },
      // Risk Metrics (Equifax + TransUnion + Experian + PayNet)
      averageRiskScore: {
        id: 'avg-risk-score',
        label: 'Average Risk Score',
        value: 742,
        change: 8.2,
        changeType: 'increase',
        format: 'number',
        dataSource: 'equifax',
        description: 'Average credit risk score of portfolio',
        lastUpdated: new Date(),
      },
      riskAdjustedReturn: {
        id: 'risk-adjusted-return',
        label: 'Risk-Adjusted Return',
        value: '14.8%',
        change: 5.7,
        changeType: 'increase',
        format: 'percentage',
        dataSource: 'paynet',
        description: 'Portfolio return adjusted for risk',
        lastUpdated: new Date(),
      },
      // Operational Efficiency (Internal)
      applicationProcessingTime: {
        id: 'app-processing-time',
        label: 'Application Processing Time',
        value: 3.2,
        change: -22.4,
        changeType: 'decrease',
        format: 'days',
        dataSource: 'paynet',
        description: 'Average time to process loan applications',
        lastUpdated: new Date(),
      },
      approvalRate: {
        id: 'approval-rate',
        label: 'Approval Rate',
        value: '68%',
        change: 4.1,
        changeType: 'increase',
        format: 'percentage',
        dataSource: 'paynet',
        description: 'Percentage of applications approved',
        lastUpdated: new Date(),
      },
      // Financial Performance (QuickBooks + Stripe)
      interestIncome: {
        id: 'interest-income',
        label: 'Monthly Interest Income',
        value: '$2.1M',
        change: 12.3,
        changeType: 'increase',
        format: 'currency',
        dataSource: 'stripe',
        description: 'Total monthly interest income',
        lastUpdated: new Date(),
      },
      netInterestMargin: {
        id: 'net-interest-margin',
        label: 'Net Interest Margin',
        value: '8.5%',
        change: 2.1,
        changeType: 'increase',
        format: 'percentage',
        dataSource: 'quickbooks',
        description: 'Net interest margin on loan portfolio',
        lastUpdated: new Date(),
      },
    };
  }

  private async getLenderUserKPIs(organizationId?: string): Promise<LenderKPIs['userAdmin']> {
    return {
      // Underwriting Performance (Internal + Credit Bureaus)
      decisionsPerDay: {
        id: 'decisions-per-day',
        label: 'Decisions per Day',
        value: 12,
        change: 20.0,
        changeType: 'increase',
        format: 'number',
        dataSource: 'paynet',
        description: 'Average number of underwriting decisions per day',
        lastUpdated: new Date(),
      },
      decisionAccuracy: {
        id: 'decision-accuracy',
        label: 'Decision Accuracy',
        value: '94%',
        change: 3.2,
        changeType: 'increase',
        format: 'percentage',
        dataSource: 'paynet',
        description: 'Percentage of accurate underwriting decisions',
        lastUpdated: new Date(),
      },
      // Portfolio Management (Internal)
      managedPortfolioValue: {
        id: 'managed-portfolio-value',
        label: 'Managed Portfolio Value',
        value: '$8.5M',
        change: 15.7,
        changeType: 'increase',
        format: 'currency',
        dataSource: 'quickbooks',
        description: 'Total value of personally managed portfolio',
        lastUpdated: new Date(),
      },
      portfolioYield: {
        id: 'portfolio-yield',
        label: 'Portfolio Yield',
        value: '12.4%',
        change: 2.8,
        changeType: 'increase',
        format: 'percentage',
        dataSource: 'quickbooks',
        description: 'Yield on managed loan portfolio',
        lastUpdated: new Date(),
      },
      // Risk Management
      riskAssessmentTime: {
        id: 'risk-assessment-time',
        label: 'Risk Assessment Time',
        value: 1.8,
        change: -25.0,
        changeType: 'decrease',
        format: 'days',
        dataSource: 'equifax',
        description: 'Average time to complete risk assessment',
        lastUpdated: new Date(),
      },
      escalationRate: {
        id: 'escalation-rate',
        label: 'Escalation Rate',
        value: '8%',
        change: -12.5,
        changeType: 'decrease',
        format: 'percentage',
        dataSource: 'paynet',
        description: 'Percentage of cases escalated to senior underwriter',
        lastUpdated: new Date(),
      },
    };
  }

  // Utility methods
  private async fetchData(sourceId: string): Promise<any> {
    // Simulate API call - replace with actual fetch to data sources
    return {};
  }

  public async exportKPIs(kpis: BaseKPI[], format: 'csv' | 'json'): Promise<Blob> {
    if (format === 'csv') {
      const headers = ['Label', 'Value', 'Change', 'Data Source', 'Last Updated'];
      const rows = kpis.map(kpi => [
        kpi.label,
        kpi.value,
        kpi.change || '',
        kpi.dataSource,
        kpi.lastUpdated?.toISOString() || '',
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      return new Blob([csvContent], { type: 'text/csv' });
    } else {
      const jsonContent = JSON.stringify(kpis, null, 2);
      return new Blob([jsonContent], { type: 'application/json' });
    }
  }
}

export default KPIService;
