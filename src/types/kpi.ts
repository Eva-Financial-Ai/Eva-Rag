// Simplified KPI Framework Types for EVA Platform
// Based on actual data integrations: Stripe, QuickBooks, Plaid, Equifax, TransUnion, PayNet, Google, Experian, Xero, NetSuite

export interface BaseKPI {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'currency' | 'percentage' | 'number' | 'days';
  dataSource:
    | 'stripe'
    | 'quickbooks'
    | 'plaid'
    | 'equifax'
    | 'transunion'
    | 'paynet'
    | 'google'
    | 'experian'
    | 'xero'
    | 'netsuite';
  lastUpdated?: Date;
  description?: string;
}

// System Admin KPIs - Platform-wide metrics
export interface SystemAdminKPIs {
  // Financial Health (Stripe + QuickBooks)
  totalRevenue: BaseKPI;
  monthlyRecurringRevenue: BaseKPI;
  averageTransactionValue: BaseKPI;

  // Credit & Risk (Equifax + TransUnion + Experian + PayNet)
  averageCreditScore: BaseKPI;
  defaultRate: BaseKPI;
  riskDistribution: BaseKPI;

  // Banking & Cash Flow (Plaid)
  totalBankConnections: BaseKPI;
  averageCashFlow: BaseKPI;

  // Platform Usage (Google Analytics)
  activeUsers: BaseKPI;
  sessionDuration: BaseKPI;
}

// User Admin KPIs - Organization-specific metrics
export interface UserAdminKPIs {
  // Organization Financial (QuickBooks + Xero + NetSuite)
  organizationRevenue: BaseKPI;
  profitMargin: BaseKPI;
  cashPosition: BaseKPI;

  // Credit Performance (Equifax + TransUnion + Experian)
  organizationCreditScore: BaseKPI;
  paymentHistory: BaseKPI;

  // Transaction Performance (Stripe + Plaid)
  monthlyTransactions: BaseKPI;
  averageTransactionSize: BaseKPI;
}

// Role-specific KPI sets
export interface BorrowerKPIs {
  systemAdmin: {
    // Credit Bureau Data (Equifax, TransUnion, Experian)
    averageBorrowerCreditScore: BaseKPI;
    creditInquiries: BaseKPI;

    // Banking Data (Plaid)
    averageBankBalance: BaseKPI;
    cashFlowStability: BaseKPI;

    // Application Performance (Internal + PayNet)
    applicationApprovalRate: BaseKPI;
    averageProcessingTime: BaseKPI;

    // Platform Usage (Google Analytics)
    activeBorrowers: BaseKPI;
    documentUploadRate: BaseKPI;
  };
  userAdmin: {
    // Organization Financials (QuickBooks/Xero/NetSuite)
    organizationCashFlow: BaseKPI;
    monthlyExpenses: BaseKPI;

    // Credit Health (Credit Bureaus)
    businessCreditScore: BaseKPI;
    personalCreditScore: BaseKPI;

    // Loan Performance
    activeLoanApplications: BaseKPI;
    fundingSuccess: BaseKPI;
  };
}

export interface VendorKPIs {
  systemAdmin: {
    // Sales Performance (Stripe + QuickBooks)
    totalVendorSales: BaseKPI;
    averageOrderValue: BaseKPI;

    // Financial Health (QuickBooks/Xero/NetSuite)
    vendorRevenue: BaseKPI;
    profitMargins: BaseKPI;

    // Platform Engagement (Google Analytics)
    activeVendors: BaseKPI;
    listingConversionRate: BaseKPI;

    // Payment Performance (Stripe + Plaid)
    paymentProcessingTime: BaseKPI;
    chargebackRate: BaseKPI;
  };
  userAdmin: {
    // Sales Metrics (Stripe + Internal)
    monthlySales: BaseKPI;
    salesGrowth: BaseKPI;

    // Inventory & Operations (QuickBooks/Xero/NetSuite)
    inventoryTurnover: BaseKPI;
    operatingExpenses: BaseKPI;

    // Customer Performance
    customerAcquisition: BaseKPI;
    customerRetention: BaseKPI;
  };
}

export interface BrokerKPIs {
  systemAdmin: {
    // Commission Tracking (Stripe + QuickBooks)
    totalCommissions: BaseKPI;
    averageCommissionPerDeal: BaseKPI;

    // Deal Performance (Internal + PayNet)
    dealVolume: BaseKPI;
    dealSuccessRate: BaseKPI;

    // Network Health (Google Analytics + Internal)
    activeBrokers: BaseKPI;
    lenderNetworkSize: BaseKPI;

    // Financial Performance
    revenuePerBroker: BaseKPI;
    brokerRetention: BaseKPI;
  };
  userAdmin: {
    // Individual Performance (Internal + Stripe)
    personalCommissions: BaseKPI;
    dealsInPipeline: BaseKPI;

    // Client Management
    activeClients: BaseKPI;
    clientSatisfaction: BaseKPI;

    // Productivity Metrics
    dealsClosedMonthly: BaseKPI;
    averageDealSize: BaseKPI;
  };
}

export interface LenderKPIs {
  systemAdmin: {
    // Portfolio Performance (Internal + Credit Bureaus)
    totalPortfolioValue: BaseKPI;
    portfolioDefaultRate: BaseKPI;

    // Risk Metrics (Equifax + TransUnion + Experian + PayNet)
    averageRiskScore: BaseKPI;
    riskAdjustedReturn: BaseKPI;

    // Operational Efficiency (Internal)
    applicationProcessingTime: BaseKPI;
    approvalRate: BaseKPI;

    // Financial Performance (QuickBooks + Stripe)
    interestIncome: BaseKPI;
    netInterestMargin: BaseKPI;
  };
  userAdmin: {
    // Underwriting Performance (Internal + Credit Bureaus)
    decisionsPerDay: BaseKPI;
    decisionAccuracy: BaseKPI;

    // Portfolio Management (Internal)
    managedPortfolioValue: BaseKPI;
    portfolioYield: BaseKPI;

    // Risk Management
    riskAssessmentTime: BaseKPI;
    escalationRate: BaseKPI;
  };
}

// Data source mapping for backend engineers
export interface DataSourceMapping {
  stripe: {
    endpoints: string[];
    dataPoints: string[];
    refreshRate: number;
  };
  quickbooks: {
    endpoints: string[];
    dataPoints: string[];
    refreshRate: number;
  };
  plaid: {
    endpoints: string[];
    dataPoints: string[];
    refreshRate: number;
  };
  equifax: {
    endpoints: string[];
    dataPoints: string[];
    refreshRate: number;
  };
  transunion: {
    endpoints: string[];
    dataPoints: string[];
    refreshRate: number;
  };
  paynet: {
    endpoints: string[];
    dataPoints: string[];
    refreshRate: number;
  };
  google: {
    endpoints: string[];
    dataPoints: string[];
    refreshRate: number;
  };
  experian: {
    endpoints: string[];
    dataPoints: string[];
    refreshRate: number;
  };
  xero: {
    endpoints: string[];
    dataPoints: string[];
    refreshRate: number;
  };
  netsuite: {
    endpoints: string[];
    dataPoints: string[];
    refreshRate: number;
  };
}

export interface KPIDashboardConfig {
  roleType: 'borrower' | 'vendor' | 'broker' | 'lender';
  viewType: 'system-admin' | 'user-admin';
  timeframe: 'daily' | 'weekly' | 'monthly';
  refreshInterval: number;
}
