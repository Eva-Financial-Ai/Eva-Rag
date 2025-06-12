import React, { createContext, useContext, useEffect, useState } from 'react';
import { debugLog } from '../../utils/auditLogger';

import '../../styles/transaction-psychology-design-system.css';

// =============================================
// ADVANCED FINANCIAL PSYCHOLOGY ENGINE
// =============================================

// Behavioral Psychology Triggers
export interface PsychologyTrigger {
  id: string;
  type:
    | 'scarcity'
    | 'social_proof'
    | 'loss_aversion'
    | 'anchoring'
    | 'reciprocity'
    | 'authority'
    | 'commitment';
  intensity: 1 | 2 | 3 | 4 | 5; // 1 = subtle, 5 = aggressive
  message: string;
  actionText: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Financial Product Cross-Selling Engine
export interface FinancialProduct {
  id: string;
  name: string;
  type:
    | 'credit_card'
    | 'personal_loan'
    | 'mortgage'
    | 'line_of_credit'
    | 'investment'
    | 'insurance'
    | 'savings';
  category: 'debt_instrument' | 'investment' | 'protection' | 'savings';
  recommendationScore: number; // 0-100
  psychologyTriggers: PsychologyTrigger[];
  benefits: string[];
  urgencyFactors: string[];
  trustIndicators: string[];
  valueProposition: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedROI?: number;
  timeframe: string;
  minimumRequirement: number;
}

// User Financial Profile for Advanced Recommendations
export interface UserFinancialProfile {
  creditScore: number;
  annualIncome: number;
  monthlyExpenses: number;
  currentDebts: number;
  savingsBalance: number;
  investmentExperience: 'novice' | 'intermediate' | 'advanced';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  financialGoals: string[];
  lifestage:
    | 'young_professional'
    | 'family_building'
    | 'peak_earning'
    | 'pre_retirement'
    | 'retired';
  behaviorProfile: {
    spendingPattern: 'saver' | 'spender' | 'balanced';
    decisionStyle: 'analytical' | 'intuitive' | 'social';
    urgencyResponse: 'immediate' | 'considered' | 'resistant';
    trustFactors: string[];
  };
}

// Advanced Recommendation Engine with Behavioral Triggers
export interface RecommendationEngine {
  generateRecommendations(profile: UserFinancialProfile): FinancialProduct[];
  applyPsychologyTriggers(
    products: FinancialProduct[],
    profile: UserFinancialProfile
  ): FinancialProduct[];
  calculateUrgencyScore(product: FinancialProduct, profile: UserFinancialProfile): number;
  createCrossSellingOpportunity(
    existingProducts: string[],
    profile: UserFinancialProfile
  ): FinancialProduct[];
}

// Psychology Context for Application-Wide Use
interface PsychologyContextType {
  userProfile: UserFinancialProfile | null;
  recommendedProducts: FinancialProduct[];
  activeTriggers: PsychologyTrigger[];
  updateProfile: (profile: UserFinancialProfile) => void;
  triggerCrossSellingEvent: (context: string) => void;
  trackUserBehavior: (action: string, context: any) => void;
}

const PsychologyContext = createContext<PsychologyContextType | null>(null);

// Advanced Recommendation Engine Implementation
class AdvancedRecommendationEngine implements RecommendationEngine {
  private behaviorDatabase: FinancialProduct[] = [
    {
      id: 'premium_credit_card',
      name: 'Platinum Rewards Credit Card',
      type: 'credit_card',
      category: 'debt_instrument',
      recommendationScore: 85,
      benefits: ['2x cashback on all purchases', '0% APR for 15 months', 'Premium travel benefits'],
      urgencyFactors: ['Limited time 0% APR offer', 'Only 500 spots remaining this month'],
      trustIndicators: ['Used by 1M+ successful professionals', 'A+ rating from financial experts'],
      valueProposition: 'Maximize your spending power while building credit history',
      riskLevel: 'medium',
      timeframe: '15 months promotional period',
      minimumRequirement: 700,
      psychologyTriggers: [
        {
          id: 'scarcity_cc',
          type: 'scarcity',
          intensity: 3,
          message: 'Only 500 premium cards available this month',
          actionText: 'Secure Your Spot Now',
          urgencyLevel: 'high',
        },
        {
          id: 'social_proof_cc',
          type: 'social_proof',
          intensity: 4,
          message: '87% of high earners in your area chose this card',
          actionText: 'Join Successful Professionals',
          urgencyLevel: 'medium',
        },
      ],
    },
    {
      id: 'debt_consolidation_loan',
      name: 'Smart Debt Consolidation Loan',
      type: 'personal_loan',
      category: 'debt_instrument',
      recommendationScore: 92,
      benefits: [
        'Reduce monthly payments by up to 40%',
        'Fixed low rate',
        'Simplify multiple payments',
      ],
      urgencyFactors: [
        'Interest rates rising next month',
        'Current debt costing $200+ monthly in interest',
      ],
      trustIndicators: ['Helped 500K+ users save money', 'Recommended by financial advisors'],
      valueProposition: 'Stop bleeding money on high-interest debt',
      riskLevel: 'low',
      timeframe: '3-7 years',
      minimumRequirement: 600,
      psychologyTriggers: [
        {
          id: 'loss_aversion_debt',
          type: 'loss_aversion',
          intensity: 5,
          message: "You're losing $247 every month to high-interest debt",
          actionText: 'Stop The Bleeding Now',
          urgencyLevel: 'critical',
        },
        {
          id: 'anchoring_savings',
          type: 'anchoring',
          intensity: 4,
          message: 'Save $2,964 annually compared to your current payments',
          actionText: 'Lock In These Savings',
          urgencyLevel: 'high',
        },
      ],
    },
    {
      id: 'high_yield_investment',
      name: 'Wealth Builder Investment Account',
      type: 'investment',
      category: 'investment',
      recommendationScore: 78,
      benefits: ['Historical 8.5% annual returns', 'Professional management', 'Tax advantages'],
      urgencyFactors: ['Market conditions favorable', 'Inflation eroding cash savings'],
      trustIndicators: ['Managed $50B+ for 2M+ investors', 'Award-winning investment team'],
      valueProposition: 'Turn your savings into wealth-building power',
      riskLevel: 'medium',
      expectedROI: 8.5,
      timeframe: '5+ years recommended',
      minimumRequirement: 1000,
      psychologyTriggers: [
        {
          id: 'authority_investment',
          type: 'authority',
          intensity: 3,
          message: 'Recommended by 9 out of 10 financial advisors',
          actionText: 'Follow Expert Advice',
          urgencyLevel: 'medium',
        },
        {
          id: 'loss_aversion_inflation',
          type: 'loss_aversion',
          intensity: 4,
          message: 'Inflation is eating 3.2% of your savings yearly',
          actionText: 'Protect Your Money',
          urgencyLevel: 'high',
        },
      ],
    },
  ];

  generateRecommendations(profile: UserFinancialProfile): FinancialProduct[] {
    return this.behaviorDatabase
      .filter(product => this.meetsEligibility(product, profile))
      .map(product => ({
        ...product,
        recommendationScore: this.calculateRecommendationScore(product, profile),
      }))
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);
  }

  applyPsychologyTriggers(
    products: FinancialProduct[],
    profile: UserFinancialProfile
  ): FinancialProduct[] {
    return products.map(product => ({
      ...product,
      psychologyTriggers: this.customizeTriggers(product.psychologyTriggers, profile),
    }));
  }

  calculateUrgencyScore(product: FinancialProduct, profile: UserFinancialProfile): number {
    let score = 0;

    // Debt-to-income ratio urgency
    const debtRatio = profile.currentDebts / (profile.annualIncome / 12);
    if (debtRatio > 0.4) score += 30;

    // Credit utilization urgency
    if (profile.creditScore < 680) score += 25;

    // Market timing factors
    if (product.category === 'investment' && profile.savingsBalance > profile.monthlyExpenses * 6) {
      score += 20;
    }

    // Behavioral urgency
    if (profile.behaviorProfile.urgencyResponse === 'immediate') score += 15;

    return Math.min(score, 100);
  }

  createCrossSellingOpportunity(
    existingProducts: string[],
    profile: UserFinancialProfile
  ): FinancialProduct[] {
    const hasCredit = existingProducts.some(p => p.includes('credit') || p.includes('card'));
    const hasInvestment = existingProducts.some(
      p => p.includes('investment') || p.includes('savings')
    );
    const hasLoan = existingProducts.some(p => p.includes('loan'));

    const opportunities: FinancialProduct[] = [];

    // If they have debt, recommend consolidation
    if ((hasCredit || hasLoan) && profile.currentDebts > profile.monthlyExpenses * 2) {
      opportunities.push(this.behaviorDatabase.find(p => p.id === 'debt_consolidation_loan')!);
    }

    // If they have savings but no investments
    if (profile.savingsBalance > 10000 && !hasInvestment) {
      opportunities.push(this.behaviorDatabase.find(p => p.id === 'high_yield_investment')!);
    }

    // If they have good credit but no premium card
    if (profile.creditScore > 750 && !hasCredit) {
      opportunities.push(this.behaviorDatabase.find(p => p.id === 'premium_credit_card')!);
    }

    return opportunities;
  }

  private meetsEligibility(product: FinancialProduct, profile: UserFinancialProfile): boolean {
    return profile.creditScore >= product.minimumRequirement;
  }

  private calculateRecommendationScore(
    product: FinancialProduct,
    profile: UserFinancialProfile
  ): number {
    let score = product.recommendationScore;

    // Adjust based on profile matching
    if (
      product.category === 'debt_instrument' &&
      profile.currentDebts > profile.monthlyExpenses * 3
    ) {
      score += 15;
    }

    if (product.category === 'investment' && profile.riskTolerance === 'aggressive') {
      score += 10;
    }

    // Behavioral matching
    if (
      profile.behaviorProfile.decisionStyle === 'analytical' &&
      product.trustIndicators.length > 2
    ) {
      score += 5;
    }

    return Math.min(score, 100);
  }

  private customizeTriggers(
    triggers: PsychologyTrigger[],
    profile: UserFinancialProfile
  ): PsychologyTrigger[] {
    return triggers.map(trigger => {
      // Customize intensity based on user behavior profile
      if (profile.behaviorProfile.urgencyResponse === 'resistant' && trigger.intensity > 3) {
        return { ...trigger, intensity: Math.max(trigger.intensity - 1, 1) as 1 | 2 | 3 | 4 | 5 };
      }

      if (profile.behaviorProfile.urgencyResponse === 'immediate' && trigger.intensity < 4) {
        return { ...trigger, intensity: Math.min(trigger.intensity + 1, 5) as 1 | 2 | 3 | 4 | 5 };
      }

      return trigger;
    });
  }
}

// Financial Psychology Provider Component
export const FinancialPsychologyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userProfile, setUserProfile] = useState<UserFinancialProfile | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<FinancialProduct[]>([]);
  const [activeTriggers, setActiveTriggers] = useState<PsychologyTrigger[]>([]);
  const recommendationEngine = new AdvancedRecommendationEngine();

  useEffect(() => {
    if (userProfile) {
      const recommendations = recommendationEngine.generateRecommendations(userProfile);
      const triggeredRecommendations = recommendationEngine.applyPsychologyTriggers(
        recommendations,
        userProfile
      );
      setRecommendedProducts(triggeredRecommendations);

      // Extract active triggers
      const allTriggers = triggeredRecommendations.flatMap(p => p.psychologyTriggers);
      setActiveTriggers(allTriggers);
    }
  }, [userProfile]);

  const updateProfile = (profile: UserFinancialProfile) => {
    setUserProfile(profile);
  };

  const triggerCrossSellingEvent = (context: string) => {
    if (userProfile) {
      const existingProducts = ['existing_checking', 'existing_savings']; // Mock existing products
      const crossSellOpportunities = recommendationEngine.createCrossSellingOpportunity(
        existingProducts,
        userProfile
      );
      setRecommendedProducts(prev => [...crossSellOpportunities, ...prev].slice(0, 5));
    }
  };

  const trackUserBehavior = (action: string, context: any) => {
    // Analytics tracking for behavioral optimization
    debugLog('general', 'log_statement', 'User behavior tracked:', { action, context, timestamp: new Date().toISOString() });
  };

  const value: PsychologyContextType = {
    userProfile,
    recommendedProducts,
    activeTriggers,
    updateProfile,
    triggerCrossSellingEvent,
    trackUserBehavior,
  };

  return <PsychologyContext.Provider value={value}>{children}</PsychologyContext.Provider>;
};

// Hook to use Financial Psychology
export const useFinancialPsychology = (): PsychologyContextType => {
  const context = useContext(PsychologyContext);
  if (!context) {
    throw new Error('useFinancialPsychology must be used within FinancialPsychologyProvider');
  }
  return context;
};

// Psychology Trigger Component with Enhanced Design
export const PsychologyTriggerCard: React.FC<{
  trigger: PsychologyTrigger;
  product: FinancialProduct;
  onAction: () => void;
}> = ({ trigger, product, onAction }) => {
  const getIntensityClass = (intensity: number) => {
    switch (intensity) {
      case 5:
        return 'tx-btn-action'; // Critical urgency
      case 4:
        return 'tx-btn-premium'; // High value
      case 3:
        return 'tx-btn-trust'; // Medium trust
      case 2:
        return 'tx-btn-primary'; // Standard appeal
      default:
        return 'tx-btn-secondary'; // Subtle
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'scarcity':
        return '⏰';
      case 'social_proof':
        return '👥';
      case 'loss_aversion':
        return '⚠️';
      case 'anchoring':
        return '⚓';
      case 'reciprocity':
        return '🤝';
      case 'authority':
        return '🏆';
      case 'commitment':
        return '📋';
      default:
        return '💡';
    }
  };

  return (
    <div className="tx-card tx-card-premium p-6 mb-4 border-l-4 border-orange-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTriggerIcon(trigger.type)}</span>
          <div>
            <h3 className="font-bold tx-text-premium text-lg">{product.name}</h3>
            <p className="tx-text-neutral-medium text-sm capitalize">
              {trigger.type.replace('_', ' ')} trigger
            </p>
          </div>
        </div>
        <div
          className={`tx-badge tx-badge-${trigger.urgencyLevel === 'critical' ? 'action' : 'wealth'}`}
        >
          {trigger.urgencyLevel.toUpperCase()}
        </div>
      </div>

      <div className="mb-4">
        <p className="tx-text-neutral-dark text-lg font-medium mb-2">{trigger.message}</p>
        <p className="tx-text-neutral-medium">{product.valueProposition}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-semibold tx-text-success mb-2">Benefits:</h4>
          <ul className="space-y-1">
            {product.benefits.slice(0, 2).map((benefit, index) => (
              <li key={index} className="text-sm tx-text-neutral-dark flex items-start">
                <span className="tx-text-success mr-2">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold tx-text-trust mb-2">Trust Indicators:</h4>
          <ul className="space-y-1">
            {product.trustIndicators.slice(0, 2).map((indicator, index) => (
              <li key={index} className="text-sm tx-text-neutral-dark flex items-start">
                <span className="tx-text-trust mr-2">🛡️</span>
                {indicator}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <span className="tx-badge tx-badge-success">{product.riskLevel.toUpperCase()} RISK</span>
          {product.expectedROI && (
            <span className="tx-badge tx-badge-wealth">{product.expectedROI}% ROI</span>
          )}
        </div>
        <button onClick={onAction} className={`${getIntensityClass(trigger.intensity)} px-6 py-3`}>
          <span className="mr-2">💰</span>
          {trigger.actionText}
        </button>
      </div>

      {trigger.urgencyLevel === 'critical' && (
        <div className="mt-4 p-3 tx-bg-action-light rounded-lg border border-orange-300">
          <div className="flex items-center text-sm tx-text-action-dark">
            <span className="mr-2 animate-pulse">🔥</span>
            <span className="font-semibold">Limited Time: </span>
            <span>{product.urgencyFactors[0]}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialPsychologyProvider;
