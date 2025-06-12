import '../../styles/transaction-psychology-design-system.css';
import { UserFinancialProfile } from './FinancialPsychologyEngine';

// =============================================
// ENHANCED CROSS-SELLING CATALOG
// Comprehensive Financial Product Ecosystem
// =============================================

export interface EnhancedFinancialProduct {
  id: string;
  name: string;
  category: 'foundation' | 'growth' | 'wealth' | 'enterprise';
  productType:
    | 'checking'
    | 'savings'
    | 'credit_card'
    | 'personal_loan'
    | 'auto_loan'
    | 'mortgage'
    | 'business_loan'
    | 'investment'
    | 'insurance'
    | 'premium_service';
  tier: 1 | 2 | 3 | 4; // Foundation → Growth → Wealth → Enterprise
  apr?: number;
  apy?: number;
  fees: {
    monthly?: number;
    annual?: number;
    transaction?: number;
  };
  minimumRequirement: {
    creditScore?: number;
    income?: number;
    balance?: number;
  };
  benefits: string[];
  psychologyHooks: {
    primary: 'loss_aversion' | 'social_proof' | 'scarcity' | 'authority' | 'reciprocity';
    message: string;
    urgencyTrigger: string;
  };
  crossSellTriggers: string[];
  revenueModel: {
    type: 'fee' | 'interest' | 'subscription' | 'commission';
    monthlyValue: number; // Expected monthly revenue per customer
    cltv: number; // Customer Lifetime Value
  };
  conversionRate: number; // Expected conversion rate
  targetDemographics: string[];
}

// Comprehensive Product Catalog
export const ENHANCED_PRODUCT_CATALOG: EnhancedFinancialProduct[] = [
  // ========== TIER 1: FOUNDATION PRODUCTS (Customer Acquisition) ==========
  {
    id: 'basic_checking',
    name: 'Essential Checking Account',
    category: 'foundation',
    productType: 'checking',
    tier: 1,
    fees: { monthly: 0, transaction: 0 },
    minimumRequirement: { creditScore: 500 },
    benefits: [
      'No monthly fees',
      'Free online banking',
      'Mobile check deposit',
      'Debit card included',
    ],
    psychologyHooks: {
      primary: 'reciprocity',
      message: 'Start your financial journey with zero fees and full digital access',
      urgencyTrigger: 'Open account in 5 minutes - no hidden fees ever',
    },
    crossSellTriggers: ['first_deposit', 'direct_deposit_setup', '30_day_activity'],
    revenueModel: { type: 'fee', monthlyValue: 5, cltv: 450 },
    conversionRate: 0.78,
    targetDemographics: ['young_adults', 'students', 'first_time_bankers'],
  },
  {
    id: 'starter_credit_card',
    name: 'Starter Credit Card',
    category: 'foundation',
    productType: 'credit_card',
    tier: 1,
    apr: 18.99,
    fees: { annual: 0 },
    minimumRequirement: { creditScore: 580 },
    benefits: [
      'Build credit history',
      'No annual fee',
      '1% cashback on purchases',
      'Credit monitoring',
    ],
    psychologyHooks: {
      primary: 'social_proof',
      message: '94% of users improved their credit score within 6 months',
      urgencyTrigger: 'Limited approval window - apply now for instant decision',
    },
    crossSellTriggers: ['credit_utilization_low', 'payment_history_good', 'income_increase'],
    revenueModel: { type: 'interest', monthlyValue: 45, cltv: 1650 },
    conversionRate: 0.65,
    targetDemographics: ['credit_builders', 'young_professionals', 'new_customers'],
  },
  {
    id: 'basic_savings',
    name: 'Smart Savings Account',
    category: 'foundation',
    productType: 'savings',
    tier: 1,
    apy: 0.5,
    fees: { monthly: 0 },
    minimumRequirement: { balance: 25 },
    benefits: ['0.5% APY', 'No minimum balance', 'Automatic savings tools', 'Goal tracking'],
    psychologyHooks: {
      primary: 'loss_aversion',
      message: 'Your money loses 3.2% annually to inflation in regular checking',
      urgencyTrigger: 'Start earning interest today - every day counts',
    },
    crossSellTriggers: ['balance_growth', 'savings_goal_reached', 'emergency_fund_complete'],
    revenueModel: { type: 'commission', monthlyValue: 8, cltv: 580 },
    conversionRate: 0.82,
    targetDemographics: ['savers', 'goal_oriented', 'financial_beginners'],
  },

  // ========== TIER 2: GROWTH PRODUCTS (Revenue Optimization) ==========
  {
    id: 'premium_credit_card',
    name: 'Platinum Rewards Card',
    category: 'growth',
    productType: 'credit_card',
    tier: 2,
    apr: 14.99,
    fees: { annual: 95 },
    minimumRequirement: { creditScore: 700, income: 50000 },
    benefits: [
      '2x points on dining & travel',
      '1.5x points on all purchases',
      'Travel insurance included',
      'Priority customer service',
      '$200 annual travel credit',
    ],
    psychologyHooks: {
      primary: 'social_proof',
      message: 'Join 1.2M successful professionals earning 3x more rewards',
      urgencyTrigger: 'Exclusive invitation expires in 72 hours',
    },
    crossSellTriggers: ['high_spending_pattern', 'travel_transactions', 'premium_eligibility'],
    revenueModel: { type: 'fee', monthlyValue: 125, cltv: 4200 },
    conversionRate: 0.52,
    targetDemographics: ['high_earners', 'frequent_travelers', 'reward_seekers'],
  },
  {
    id: 'debt_consolidation_loan',
    name: 'Smart Debt Consolidation Loan',
    category: 'growth',
    productType: 'personal_loan',
    tier: 2,
    apr: 6.99,
    fees: { monthly: 0 },
    minimumRequirement: { creditScore: 650, income: 40000 },
    benefits: [
      'Lower your monthly payments by 40%',
      'Fixed rate for entire term',
      'No prepayment penalties',
      'Debt payoff calculator included',
    ],
    psychologyHooks: {
      primary: 'loss_aversion',
      message: 'High-interest debt costs you $2,847 annually in unnecessary interest',
      urgencyTrigger: 'Interest rates rising next month - lock in 6.99% today',
    },
    crossSellTriggers: ['high_debt_ratio', 'multiple_payments', 'credit_improvement_goal'],
    revenueModel: { type: 'interest', monthlyValue: 180, cltv: 6500 },
    conversionRate: 0.73,
    targetDemographics: ['debt_stressed', 'multiple_card_holders', 'payment_strugglers'],
  },
  {
    id: 'high_yield_savings',
    name: 'Performance Savings Account',
    category: 'growth',
    productType: 'savings',
    tier: 2,
    apy: 2.75,
    fees: { monthly: 5 },
    minimumRequirement: { balance: 10000 },
    benefits: [
      '2.75% APY',
      'No withdrawal limits',
      'Premium mobile app',
      'Financial advisor access',
    ],
    psychologyHooks: {
      primary: 'scarcity',
      message: 'Earn $275 more annually vs basic savings on $10K balance',
      urgencyTrigger: 'Rate guaranteed for 12 months - limited time offer',
    },
    crossSellTriggers: ['balance_threshold', 'rate_shopping', 'savings_optimization'],
    revenueModel: { type: 'fee', monthlyValue: 25, cltv: 1850 },
    conversionRate: 0.68,
    targetDemographics: ['high_balance_savers', 'rate_sensitive', 'wealth_builders'],
  },
  {
    id: 'auto_loan',
    name: 'Smart Auto Financing',
    category: 'growth',
    productType: 'auto_loan',
    tier: 2,
    apr: 4.49,
    fees: { monthly: 0 },
    minimumRequirement: { creditScore: 680, income: 35000 },
    benefits: [
      'Rates as low as 4.49% APR',
      'Pre-approval in minutes',
      'Gap insurance available',
      'Flexible payment options',
    ],
    psychologyHooks: {
      primary: 'scarcity',
      message: 'Promotional rates ending soon - dealers paying 6.9% average',
      urgencyTrigger: 'Lock in lowest rate before increase next week',
    },
    crossSellTriggers: ['car_shopping_behavior', 'lease_expiration', 'transportation_need'],
    revenueModel: { type: 'interest', monthlyValue: 150, cltv: 7200 },
    conversionRate: 0.61,
    targetDemographics: ['car_buyers', 'lease_expiring', 'transportation_upgraders'],
  },

  // ========== TIER 3: WEALTH PRODUCTS (CLTV Maximization) ==========
  {
    id: 'investment_account',
    name: 'Wealth Builder Investment Account',
    category: 'wealth',
    productType: 'investment',
    tier: 3,
    fees: { annual: 0.75 }, // 0.75% AUM fee
    minimumRequirement: { balance: 25000, income: 75000 },
    benefits: [
      'Professional portfolio management',
      'Tax-loss harvesting',
      'Dedicated investment advisor',
      'Quarterly portfolio reviews',
      'Historical 8.2% annual returns',
    ],
    psychologyHooks: {
      primary: 'authority',
      message: 'Portfolios managed by award-winning team with $50B+ AUM',
      urgencyTrigger: 'Market timing favorable - advisor consultation this week only',
    },
    crossSellTriggers: ['high_savings_balance', 'investment_readiness', 'wealth_accumulation_goal'],
    revenueModel: { type: 'commission', monthlyValue: 325, cltv: 15600 },
    conversionRate: 0.42,
    targetDemographics: ['wealth_builders', 'investment_ready', 'high_net_worth'],
  },
  {
    id: 'business_line_credit',
    name: 'Business Growth Capital Line',
    category: 'wealth',
    productType: 'business_loan',
    tier: 3,
    apr: 8.99,
    fees: { annual: 150 },
    minimumRequirement: { creditScore: 720, income: 100000 },
    benefits: [
      'Up to $500K available credit',
      'Pay interest only on used funds',
      'Business credit building',
      'Cash flow management tools',
    ],
    psychologyHooks: {
      primary: 'loss_aversion',
      message: 'Businesses without capital access miss 67% of growth opportunities',
      urgencyTrigger: "SBA rate increases coming - secure today's rates",
    },
    crossSellTriggers: ['business_owner', 'revenue_growth', 'cash_flow_needs'],
    revenueModel: { type: 'interest', monthlyValue: 450, cltv: 18200 },
    conversionRate: 0.38,
    targetDemographics: ['business_owners', 'entrepreneurs', 'growth_companies'],
  },
  {
    id: 'mortgage_loan',
    name: 'Premier Home Mortgage',
    category: 'wealth',
    productType: 'mortgage',
    tier: 3,
    apr: 6.25,
    fees: { monthly: 0 },
    minimumRequirement: { creditScore: 740, income: 80000 },
    benefits: [
      'Competitive fixed rates',
      'No PMI options available',
      'Fast 21-day closing',
      'Local underwriting team',
    ],
    psychologyHooks: {
      primary: 'scarcity',
      message: 'Mortgage rates at 20-year lows - likely to rise Q2',
      urgencyTrigger: 'Rate lock expires in 60 days - secure your dream home',
    },
    crossSellTriggers: ['home_shopping', 'rent_vs_buy_threshold', 'family_expansion'],
    revenueModel: { type: 'interest', monthlyValue: 850, cltv: 32000 },
    conversionRate: 0.29,
    targetDemographics: ['home_buyers', 'refinancers', 'family_builders'],
  },
  {
    id: 'life_insurance',
    name: 'Family Protection Life Insurance',
    category: 'wealth',
    productType: 'insurance',
    tier: 3,
    fees: { monthly: 45 },
    minimumRequirement: { income: 60000 },
    benefits: [
      '$500K coverage starting at $45/month',
      'No medical exam up to $250K',
      'Living benefits included',
      'Cash value accumulation',
    ],
    psychologyHooks: {
      primary: 'loss_aversion',
      message: '73% of families financially devastated by unexpected loss',
      urgencyTrigger: 'Health questionnaire expires - apply within 30 days',
    },
    crossSellTriggers: ['family_milestone', 'mortgage_approval', 'income_increase'],
    revenueModel: { type: 'commission', monthlyValue: 85, cltv: 4850 },
    conversionRate: 0.34,
    targetDemographics: ['family_providers', 'mortgage_holders', 'wealth_protectors'],
  },

  // ========== TIER 4: ENTERPRISE SOLUTIONS (Premium ARR) ==========
  {
    id: 'private_banking',
    name: 'Elite Private Banking',
    category: 'enterprise',
    productType: 'premium_service',
    tier: 4,
    fees: { monthly: 150 },
    minimumRequirement: { balance: 250000, income: 500000 },
    benefits: [
      'Dedicated private banker',
      'Concierge financial services',
      'Exclusive investment opportunities',
      'Estate planning assistance',
      'Tax optimization strategies',
    ],
    psychologyHooks: {
      primary: 'social_proof',
      message: 'Exclusive service for top 3% of successful individuals',
      urgencyTrigger: 'Invitation-only membership - limited availability',
    },
    crossSellTriggers: ['ultra_high_net_worth', 'complex_financial_needs', 'exclusivity_seeker'],
    revenueModel: { type: 'subscription', monthlyValue: 750, cltv: 45000 },
    conversionRate: 0.15,
    targetDemographics: ['ultra_wealthy', 'executives', 'entrepreneurs'],
  },
  {
    id: 'corporate_banking',
    name: 'Corporate Treasury Solutions',
    category: 'enterprise',
    productType: 'business_loan',
    tier: 4,
    fees: { monthly: 500 },
    minimumRequirement: { income: 5000000 }, // $5M annual revenue
    benefits: [
      'Cash management solutions',
      'Multi-million dollar credit facilities',
      'International banking services',
      'Risk management tools',
      'Dedicated relationship manager',
    ],
    psychologyHooks: {
      primary: 'authority',
      message: 'Trusted by 89% of Fortune 1000 companies for treasury management',
      urgencyTrigger: 'Q4 credit facility planning deadline approaching',
    },
    crossSellTriggers: ['large_business', 'complex_banking_needs', 'growth_capital'],
    revenueModel: { type: 'fee', monthlyValue: 2500, cltv: 125000 },
    conversionRate: 0.08,
    targetDemographics: ['large_corporations', 'cfos', 'treasury_managers'],
  },
];

// Advanced Cross-Selling Algorithm
export class EnhancedCrossSellingEngine {
  static calculateProductRecommendationScore(
    product: EnhancedFinancialProduct,
    profile: UserFinancialProfile,
  ): number {
    let score = 0;

    // Credit Score Matching
    if (product.minimumRequirement.creditScore) {
      if (profile.creditScore >= product.minimumRequirement.creditScore) {
        const scoreBonus = Math.min(
          (profile.creditScore - product.minimumRequirement.creditScore) / 10,
          30,
        );
        score += scoreBonus;
      } else {
        return 0; // Disqualified
      }
    }

    // Income Matching
    if (product.minimumRequirement.income) {
      if (profile.annualIncome >= product.minimumRequirement.income) {
        const incomeRatio = profile.annualIncome / product.minimumRequirement.income;
        score += Math.min(incomeRatio * 15, 40);
      } else {
        return 0; // Disqualified
      }
    }

    // Behavioral Alignment
    const behaviorMultiplier = this.getBehaviorMultiplier(product, profile);
    score *= behaviorMultiplier;

    // Psychology Hook Effectiveness
    const psychologyScore = this.calculatePsychologyEffectiveness(product, profile);
    score += psychologyScore;

    // Life Stage Matching
    const lifeStageBonus = this.getLifeStageBonus(product, profile);
    score += lifeStageBonus;

    return Math.min(score, 100);
  }

  private static getBehaviorMultiplier(
    product: EnhancedFinancialProduct,
    profile: UserFinancialProfile,
  ): number {
    let multiplier = 1.0;

    // Decision style alignment
    if (
      product.psychologyHooks.primary === 'authority' &&
      profile.behaviorProfile.decisionStyle === 'analytical'
    ) {
      multiplier += 0.3;
    }
    if (
      product.psychologyHooks.primary === 'social_proof' &&
      profile.behaviorProfile.decisionStyle === 'social'
    ) {
      multiplier += 0.3;
    }

    // Urgency response alignment
    if (profile.behaviorProfile.urgencyResponse === 'immediate' && product.tier <= 2) {
      multiplier += 0.2;
    }
    if (profile.behaviorProfile.urgencyResponse === 'considered' && product.tier >= 3) {
      multiplier += 0.2;
    }

    return multiplier;
  }

  private static calculatePsychologyEffectiveness(
    product: EnhancedFinancialProduct,
    profile: UserFinancialProfile,
  ): number {
    switch (product.psychologyHooks.primary) {
      case 'loss_aversion':
        return profile.currentDebts > profile.monthlyExpenses * 3 ? 25 : 10;
      case 'social_proof':
        return profile.behaviorProfile.decisionStyle === 'social' ? 20 : 10;
      case 'scarcity':
        return profile.behaviorProfile.urgencyResponse === 'immediate' ? 20 : 5;
      case 'authority':
        return profile.behaviorProfile.decisionStyle === 'analytical' ? 20 : 8;
      case 'reciprocity':
        return profile.savingsBalance < profile.monthlyExpenses * 2 ? 15 : 8;
      default:
        return 10;
    }
  }

  private static getLifeStageBonus(
    product: EnhancedFinancialProduct,
    profile: UserFinancialProfile,
  ): number {
    const bonusMapping: { [key: string]: { [key: string]: number } } = {
      young_professional: {
        starter_credit_card: 15,
        basic_checking: 10,
        debt_consolidation_loan: 20,
      },
      family_building: {
        auto_loan: 20,
        mortgage_loan: 25,
        life_insurance: 30,
      },
      peak_earning: {
        investment_account: 25,
        business_line_credit: 20,
        premium_credit_card: 15,
      },
      pre_retirement: {
        investment_account: 30,
        high_yield_savings: 20,
        private_banking: 15,
      },
    };

    return bonusMapping[profile.lifestage]?.[product.id] || 0;
  }

  static getOptimalCrossSellingSequence(profile: UserFinancialProfile): EnhancedFinancialProduct[] {
    // Calculate scores for all products
    const scoredProducts = ENHANCED_PRODUCT_CATALOG.map(product => ({
      product,
      score: this.calculateProductRecommendationScore(product, profile),
    }));

    // Filter qualified products and sort by score
    const qualifiedProducts = scoredProducts
      .filter(sp => sp.score > 0)
      .sort((a, b) => b.score - a.score);

    // Select optimal sequence (max 5 products)
    return qualifiedProducts.slice(0, 5).map(sp => sp.product);
  }

  static calculateExpectedRevenueImpact(
    products: EnhancedFinancialProduct[],
    profile: UserFinancialProfile,
  ): {
    monthlyRevenue: number;
    totalCltv: number;
    weightedConversionRate: number;
  } {
    let monthlyRevenue = 0;
    let totalCltv = 0;
    let weightedConversionSum = 0;

    products.forEach(product => {
      const score = this.calculateProductRecommendationScore(product, profile) / 100;
      const adjustedConversionRate = product.conversionRate * score;

      monthlyRevenue += product.revenueModel.monthlyValue * adjustedConversionRate;
      totalCltv += product.revenueModel.cltv * adjustedConversionRate;
      weightedConversionSum += adjustedConversionRate;
    });

    return {
      monthlyRevenue,
      totalCltv,
      weightedConversionRate: weightedConversionSum / products.length,
    };
  }
}

export default EnhancedCrossSellingEngine;
