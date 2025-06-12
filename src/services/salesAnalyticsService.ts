import {
  SaleTransaction,
  SalesMetrics,
  ProductDefinition,
  ProductType,
  CustomerAnalytics,
  SalesTarget,
  SalesFilters,
  SalesForecast,
} from '../types/salesTypes';
import { ApiResponse } from '../api/apiClient';

// Product definitions based on pricing table
const PRODUCT_DEFINITIONS: ProductDefinition[] = [
  // Primary (Broker Function) Products
  {
    id: 'smart-match-closed',
    type: 'smart_match_closed',
    category: 'broker_function',
    name: 'Smart Match Closed',
    description: 'Charged as % Fee of credit amount',
    pricingModel: 'percentage',
    variableRate: 0.05, // 5% example
    isActive: true,
  },

  // Underwriting Score & Risk Map
  {
    id: 'risk-score-general',
    type: 'risk_score_general',
    category: 'underwriting_risk',
    name: 'Risk Score & Report/Map - General Application',
    description: 'Blended Biz & Personal Credit Scores - Not Collateralized',
    pricingModel: 'fixed',
    basePrice: 300.0,
    isActive: true,
  },
  {
    id: 'risk-score-equipment',
    type: 'risk_score_equipment',
    category: 'underwriting_risk',
    name: 'Risk Score & Report/Map - Equipment & Vehicles',
    description: 'Blended Biz & Personal Credit Scores - Equipment & Vehicles Application',
    pricingModel: 'fixed',
    basePrice: 335.0,
    isActive: true,
  },
  {
    id: 'risk-score-real-estate',
    type: 'risk_score_real_estate',
    category: 'underwriting_risk',
    name: 'Risk Score & Report/Map - Real Estate',
    description: 'Blended Biz & Personal Credit Scores - Real Estate Application',
    pricingModel: 'fixed',
    basePrice: 335.0,
    isActive: true,
  },
  {
    id: 'smart-match-broker',
    type: 'smart_match_broker',
    category: 'smart_match',
    name: 'Smart Match Decision Tool - Broker',
    description: 'Not Using Eva Lenders',
    pricingModel: 'fixed',
    basePrice: 45.0,
    isActive: true,
  },
  {
    id: 'smart-match-lender',
    type: 'smart_match_lender',
    category: 'smart_match',
    name: 'Smart Match Decision Tool - Lender',
    description: 'Not Using Eva Lenders',
    pricingModel: 'fixed',
    basePrice: 35.0,
    isActive: true,
  },

  // Asset Tokenization
  {
    id: 'asset-tokenized',
    type: 'asset_tokenized',
    category: 'asset_tokenization',
    name: 'Per Asset Pressed and Tokenized',
    description: 'Asset tokenization service',
    pricingModel: 'fixed',
    basePrice: 150.0,
    isActive: true,
  },

  // Shield Vault
  {
    id: 'shield-vault-locking',
    type: 'shield_vault_locking',
    category: 'shield_vault',
    name: 'Shield Vault Transaction Document Locking',
    description: 'Document security and locking service',
    pricingModel: 'fixed',
    basePrice: 30.0,
    isActive: true,
  },

  // LeadMap Verifications
  {
    id: 'kyb-verification',
    type: 'kyb_verification',
    category: 'leadmap_verification',
    name: 'KYB Business Verification',
    description: 'Know Your Business verification',
    pricingModel: 'fixed',
    basePrice: 20.0,
    isActive: true,
  },
  {
    id: 'kyc-verification',
    type: 'kyc_verification',
    category: 'leadmap_verification',
    name: 'KYC Person Verification',
    description: 'Know Your Customer verification',
    pricingModel: 'fixed',
    basePrice: 7.5,
    isActive: true,
  },
  {
    id: 'kyp-verification',
    type: 'kyp_verification',
    category: 'leadmap_verification',
    name: 'KYP Property Verification',
    description: 'Know Your Property verification',
    pricingModel: 'fixed',
    basePrice: 20.0,
    isActive: true,
  },
  {
    id: 'kyd-verification',
    type: 'kyd_verification',
    category: 'leadmap_verification',
    name: 'KYD Funding Verification',
    description:
      'Know Your Debtor - Funding Verification - Vendor - 1 3rd Party of Any Type Included',
    pricingModel: 'fixed',
    basePrice: 117.5,
    isActive: true,
  },

  // Platform Features
  {
    id: 'platform-subscription',
    type: 'platform_subscription',
    category: 'platform_features',
    name: 'Monthly Platform Subscription',
    description: 'FileLock, Advisor Bar, Safe Forms, Customer Retention Platform, etc',
    pricingModel: 'subscription',
    basePrice: 100.0,
    subscriptionType: 'monthly',
    isActive: true,
  },
  {
    id: 'cc-bar-local',
    type: 'cc_bar_local',
    category: 'platform_features',
    name: 'CC Bar - Local',
    description: 'Local web phone & call transcription with sentiment analysis',
    pricingModel: 'subscription',
    basePrice: 60.0,
    subscriptionType: 'monthly',
    isActive: true,
  },
];

class SalesAnalyticsService {
  private static instance: SalesAnalyticsService;
  private mockEnabled: boolean = true; // Set to false when backend is ready

  public static getInstance(): SalesAnalyticsService {
    if (!SalesAnalyticsService.instance) {
      SalesAnalyticsService.instance = new SalesAnalyticsService();
    }
    return SalesAnalyticsService.instance;
  }

  /**
   * Get product definitions
   */
  getProductDefinitions(): ProductDefinition[] {
    return PRODUCT_DEFINITIONS;
  }

  /**
   * Get sales metrics for a specific period
   */
  async getSalesMetrics(
    period: 'today' | 'week' | 'month' | 'quarter' | 'year'
  ): Promise<ApiResponse<SalesMetrics>> {
    if (this.mockEnabled) {
      await this.simulateDelay(500, 1000);
      return {
        data: this.generateMockSalesMetrics(period),
        status: 200,
        success: true,
      };
    }

    // TODO: Implement real API call
    return {
      error: new Error('API not implemented'),
      status: 501,
      success: false,
    };
  }

  /**
   * Get sales transactions with filtering
   */
  async getSalesTransactions(filters: SalesFilters = {}): Promise<ApiResponse<SaleTransaction[]>> {
    if (this.mockEnabled) {
      await this.simulateDelay(300, 800);
      return {
        data: this.generateMockTransactions(filters),
        status: 200,
        success: true,
      };
    }

    // TODO: Implement real API call
    return {
      error: new Error('API not implemented'),
      status: 501,
      success: false,
    };
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(customerId?: string): Promise<ApiResponse<CustomerAnalytics[]>> {
    if (this.mockEnabled) {
      await this.simulateDelay(400, 900);
      return {
        data: this.generateMockCustomerAnalytics(),
        status: 200,
        success: true,
      };
    }

    // TODO: Implement real API call
    return {
      error: new Error('API not implemented'),
      status: 501,
      success: false,
    };
  }

  /**
   * Get sales targets
   */
  async getSalesTargets(): Promise<ApiResponse<SalesTarget[]>> {
    if (this.mockEnabled) {
      await this.simulateDelay(300, 600);
      return {
        data: this.generateMockSalesTargets(),
        status: 200,
        success: true,
      };
    }

    // TODO: Implement real API call
    return {
      error: new Error('API not implemented'),
      status: 501,
      success: false,
    };
  }

  /**
   * Get sales forecast
   */
  async getSalesForecast(months: number = 6): Promise<ApiResponse<SalesForecast[]>> {
    if (this.mockEnabled) {
      await this.simulateDelay(600, 1200);
      return {
        data: this.generateMockForecast(months),
        status: 200,
        success: true,
      };
    }

    // TODO: Implement real API call
    return {
      error: new Error('API not implemented'),
      status: 501,
      success: false,
    };
  }

  /**
   * Get real-time sales dashboard data
   */
  async getDashboardData(): Promise<
    ApiResponse<{
      todayMetrics: SalesMetrics;
      recentTransactions: SaleTransaction[];
      topProducts: Array<{
        product: ProductDefinition;
        revenue: number;
        transactions: number;
        growth: number;
      }>;
      salesTargets: SalesTarget[];
    }>
  > {
    if (this.mockEnabled) {
      await this.simulateDelay(400, 800);

      const todayMetrics = this.generateMockSalesMetrics('today');
      const recentTransactions = this.generateMockTransactions({}).slice(0, 10);
      const salesTargets = this.generateMockSalesTargets();

      return {
        data: {
          todayMetrics,
          recentTransactions,
          topProducts: this.generateMockTopProducts(),
          salesTargets,
        },
        status: 200,
        success: true,
      };
    }

    // TODO: Implement real API call
    return {
      error: new Error('API not implemented'),
      status: 501,
      success: false,
    };
  }

  // Private helper methods for generating mock data
  private generateMockSalesMetrics(period: string): SalesMetrics {
    const multipliers = {
      today: 1,
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
    };

    const mult = multipliers[period as keyof typeof multipliers] || 1;
    const baseRevenue = 15000 * mult;

    return {
      period: period as any,
      startDate: new Date(Date.now() - mult * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),

      totalRevenue: baseRevenue + Math.random() * baseRevenue * 0.3,
      recurringRevenue: baseRevenue * 0.4,
      oneTimeRevenue: baseRevenue * 0.6,
      commission: baseRevenue * 0.15,

      totalTransactions: Math.floor(150 * mult + Math.random() * 50),
      uniqueCustomers: Math.floor(45 * mult + Math.random() * 15),
      newCustomers: Math.floor(12 * mult + Math.random() * 8),
      returningCustomers: Math.floor(33 * mult + Math.random() * 10),

      topPerformingProducts: [
        {
          productId: 'risk-score-general',
          productName: 'Risk Score - General',
          revenue: 8500 * mult,
          quantity: 28 * mult,
          growth: 15.2,
        },
        {
          productId: 'platform-subscription',
          productName: 'Platform Subscription',
          revenue: 6000 * mult,
          quantity: 60 * mult,
          growth: 22.1,
        },
        {
          productId: 'smart-match-closed',
          productName: 'Smart Match Closed',
          revenue: 4500 * mult,
          quantity: 15 * mult,
          growth: 8.7,
        },
      ],

      averageOrderValue: 285.5,
      customerLifetimeValue: 2850.0,
      churnRate: 0.03,
      conversionRate: 0.12,

      revenueGrowth: 18.5,
      customerGrowth: 12.3,
      productGrowth: {} as any, // Would be populated with actual data
    };
  }

  private generateMockTransactions(filters: SalesFilters): SaleTransaction[] {
    const transactions: SaleTransaction[] = [];
    const customerTypes = ['broker', 'lender', 'borrower', 'vendor'] as const;
    const statuses = ['completed', 'pending', 'refunded'] as const;

    for (let i = 0; i < 50; i++) {
      const product = PRODUCT_DEFINITIONS[Math.floor(Math.random() * PRODUCT_DEFINITIONS.length)];
      const customerType = customerTypes[Math.floor(Math.random() * customerTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const unitPrice = product.basePrice || 100;
      const quantity = Math.floor(Math.random() * 5) + 1;

      transactions.push({
        id: `txn_${Date.now()}_${i}`,
        productId: product.id,
        productType: product.type,
        customerId: `customer_${i}`,
        customerName: `Customer ${i + 1}`,
        customerType,
        organizationId: `org_${Math.floor(i / 10)}`,

        quantity,
        unitPrice,
        totalAmount: unitPrice * quantity,
        commission: product.category === 'broker_function' ? unitPrice * quantity * 0.15 : 0,

        saleDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        processedDate: new Date(
          Date.now() - Math.random() * 29 * 24 * 60 * 60 * 1000
        ).toISOString(),

        status,
        paymentStatus: status === 'completed' ? 'paid' : 'pending',

        salesRep: `Sales Rep ${Math.floor(Math.random() * 5) + 1}`,
        leadSource: ['website', 'referral', 'cold_call', 'social_media'][
          Math.floor(Math.random() * 4)
        ],

        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return transactions;
  }

  private generateMockCustomerAnalytics(): CustomerAnalytics[] {
    // Implementation for mock customer analytics
    return [];
  }

  private generateMockSalesTargets(): SalesTarget[] {
    return [
      {
        id: 'target_monthly_revenue',
        name: 'Monthly Revenue Target',
        period: 'monthly',
        targetType: 'revenue',
        targetValue: 450000,
        currentValue: 387500,
        progress: 86,
        status: 'on_track',
        dueDate: new Date(2024, 11, 31).toISOString(),
        createdAt: new Date(2024, 11, 1).toISOString(),
      },
      {
        id: 'target_quarterly_customers',
        name: 'Quarterly New Customers',
        period: 'quarterly',
        targetType: 'customers',
        targetValue: 150,
        currentValue: 142,
        progress: 95,
        status: 'exceeded',
        dueDate: new Date(2024, 11, 31).toISOString(),
        createdAt: new Date(2024, 9, 1).toISOString(),
      },
    ];
  }

  private generateMockTopProducts() {
    return PRODUCT_DEFINITIONS.slice(0, 5).map(product => ({
      product,
      revenue: Math.random() * 50000 + 10000,
      transactions: Math.floor(Math.random() * 100) + 20,
      growth: (Math.random() - 0.5) * 40, // -20% to +20%
    }));
  }

  private generateMockForecast(months: number): SalesForecast[] {
    const forecasts: SalesForecast[] = [];
    const baseRevenue = 450000;

    for (let i = 1; i <= months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);

      forecasts.push({
        period: date.toISOString().slice(0, 7), // YYYY-MM format
        predictedRevenue: baseRevenue * (1 + (Math.random() - 0.3) * 0.2), // ±20% variance
        confidence: 0.7 + Math.random() * 0.25, // 70-95% confidence
        assumptions: [
          'Current growth trend continues',
          'No major market disruptions',
          'New product launches on schedule',
        ],
        risks: ['Economic uncertainty', 'Increased competition', 'Regulatory changes'],
      });
    }

    return forecasts;
  }

  private async simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Export singleton instance
const salesAnalyticsService = SalesAnalyticsService.getInstance();
export default salesAnalyticsService;
