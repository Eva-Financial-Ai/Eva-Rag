// Sales Product Types
export type ProductCategory =
  | 'broker_function'
  | 'underwriting_risk'
  | 'smart_match'
  | 'asset_tokenization'
  | 'shield_vault'
  | 'leadmap_verification'
  | 'platform_features';

export type ProductType =
  | 'smart_match_closed'
  | 'risk_score_general'
  | 'risk_score_equipment'
  | 'risk_score_real_estate'
  | 'smart_match_broker'
  | 'smart_match_lender'
  | 'asset_tokenized'
  | 'shield_vault_locking'
  | 'kyb_verification'
  | 'kyc_verification'
  | 'kyp_verification'
  | 'kyd_verification'
  | 'platform_subscription'
  | 'cc_bar_local';

export interface ProductDefinition {
  id: string;
  type: ProductType;
  category: ProductCategory;
  name: string;
  description: string;
  pricingModel: 'fixed' | 'variable' | 'subscription' | 'percentage';
  basePrice?: number;
  variableRate?: number; // For percentage-based pricing
  subscriptionType?: 'monthly' | 'annual';
  isActive: boolean;
}

export interface SaleTransaction {
  id: string;
  productId: string;
  productType: ProductType;
  customerId: string;
  customerName: string;
  customerType: 'broker' | 'lender' | 'borrower' | 'vendor';
  organizationId?: string;

  // Transaction Details
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  commission?: number;
  discountApplied?: number;

  // Timing
  saleDate: string;
  processedDate: string;
  billingPeriod?: string; // For subscriptions

  // Status
  status: 'pending' | 'completed' | 'refunded' | 'disputed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';

  // Metadata
  salesRep?: string;
  leadSource?: string;
  campaignId?: string;
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface SalesMetrics {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;

  // Revenue Metrics
  totalRevenue: number;
  recurringRevenue: number; // MRR/ARR
  oneTimeRevenue: number;
  commission: number;

  // Volume Metrics
  totalTransactions: number;
  uniqueCustomers: number;
  newCustomers: number;
  returningCustomers: number;

  // Product Performance
  topPerformingProducts: Array<{
    productId: string;
    productName: string;
    revenue: number;
    quantity: number;
    growth: number;
  }>;

  // Customer Metrics
  averageOrderValue: number;
  customerLifetimeValue: number;
  churnRate: number;
  conversionRate: number;

  // Growth Metrics
  revenueGrowth: number;
  customerGrowth: number;
  productGrowth: Record<ProductType, number>;
}

export interface SalesForecast {
  period: string;
  predictedRevenue: number;
  confidence: number;
  assumptions: string[];
  risks: string[];
}

export interface CustomerAnalytics {
  customerId: string;
  customerName: string;
  customerType: 'broker' | 'lender' | 'borrower' | 'vendor';

  // Financial Metrics
  totalSpent: number;
  averageOrderValue: number;
  lastPurchaseDate: string;
  firstPurchaseDate: string;

  // Product Usage
  favoriteProducts: ProductType[];
  productUsageHistory: Array<{
    productType: ProductType;
    usageCount: number;
    totalSpent: number;
  }>;

  // Engagement
  loginFrequency: number;
  supportTickets: number;
  riskScore: number;
  healthScore: number;
}

export interface SalesTarget {
  id: string;
  name: string;
  period: 'monthly' | 'quarterly' | 'annual';
  targetType: 'revenue' | 'transactions' | 'customers';
  targetValue: number;
  currentValue: number;
  progress: number;
  status: 'on_track' | 'at_risk' | 'exceeded' | 'missed';
  assignedTo?: string;
  dueDate: string;
  createdAt: string;
}

export interface SalesFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  productTypes?: ProductType[];
  customerTypes?: ('broker' | 'lender' | 'borrower' | 'vendor')[];
  status?: ('pending' | 'completed' | 'refunded' | 'disputed' | 'cancelled')[];
  paymentStatus?: ('pending' | 'paid' | 'failed' | 'refunded')[];
  salesRep?: string;
  minAmount?: number;
  maxAmount?: number;
  organizationId?: string;
}
