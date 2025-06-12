import React, { useCallback, useEffect, useState } from 'react';
import '../../styles/transaction-psychology-design-system.css';
import { useFinancialPsychology, UserFinancialProfile } from './FinancialPsychologyEngine';

// =============================================
// ADVANCED CROSS-SELLING ENGINE
// =============================================

export interface CrossSellingTrigger {
  id: string;
  triggerCondition: (profile: UserFinancialProfile) => boolean;
  urgencyScore: number; // 1-10
  conversionProbability: number; // 0-1
  psychologyType:
    | 'debt_consolidation'
    | 'investment_opportunity'
    | 'credit_building'
    | 'wealth_protection'
    | 'cash_flow_optimization';
  targetProducts: string[];
  personalizedMessage: (profile: UserFinancialProfile) => string;
  callToAction: string;
  benefitCalculation: (profile: UserFinancialProfile) => { savings: number; benefit: string };
}

export interface DebtInstrumentRecommendation {
  id: string;
  type:
    | 'personal_loan'
    | 'line_of_credit'
    | 'debt_consolidation'
    | 'balance_transfer'
    | 'equipment_financing'
    | 'working_capital';
  apr: number;
  term: number; // months
  maxAmount: number;
  minimumCredit: number;
  approvalProbability: number;
  psychologyHooks: {
    lossAversion: string;
    socialProof: string;
    scarcity: string;
    authority: string;
  };
  behavioralTriggers: string[];
  targetDemographic: string[];
}

export const AdvancedCrossSellingEngine: React.FC = () => {
  const { userProfile, trackUserBehavior, triggerCrossSellingEvent } = useFinancialPsychology();
  const [activeTriggers, setActiveTriggers] = useState<CrossSellingTrigger[]>([]);
  const [recommendations, setRecommendations] = useState<DebtInstrumentRecommendation[]>([]);
  const [psychologyScore, setPsychologyScore] = useState<{ [key: string]: number }>({});

  // Advanced debt instrument catalog
  const debtInstruments: DebtInstrumentRecommendation[] = [
    {
      id: 'debt_consolidation_premium',
      type: 'debt_consolidation',
      apr: 6.99,
      term: 60,
      maxAmount: 100000,
      minimumCredit: 650,
      approvalProbability: 0.85,
      psychologyHooks: {
        lossAversion: 'Stop losing money to high-interest debt every month',
        socialProof: 'Join 94% of successful consolidators who saved thousands',
        scarcity: 'Premium rates available to first 100 applicants this month',
        authority: 'Recommended by 9 out of 10 financial advisors',
      },
      behavioralTriggers: [
        'high_debt_stress',
        'multiple_payment_fatigue',
        'credit_improvement_goal',
      ],
      targetDemographic: ['high_earners', 'debt_stressed', 'credit_builders'],
    },
    {
      id: 'working_capital_line',
      type: 'working_capital',
      apr: 8.99,
      term: 12,
      maxAmount: 250000,
      minimumCredit: 680,
      approvalProbability: 0.78,
      psychologyHooks: {
        lossAversion: 'Missed opportunities cost businesses thousands annually',
        socialProof: 'Successful entrepreneurs use capital leverage to grow 3x faster',
        scarcity: 'Business growth capital - limited funding pool available',
        authority: 'Fortune 500 companies maintain credit lines for strategic advantage',
      },
      behavioralTriggers: [
        'business_growth_ambition',
        'cash_flow_timing',
        'opportunity_recognition',
      ],
      targetDemographic: ['business_owners', 'entrepreneurs', 'high_income_professionals'],
    },
  ];

  // Advanced cross-selling triggers
  const crossSellingTriggers: CrossSellingTrigger[] = [
    {
      id: 'high_interest_debt_consolidation',
      triggerCondition: profile => profile.currentDebts > 15000 && profile.creditScore >= 650,
      urgencyScore: 9,
      conversionProbability: 0.73,
      psychologyType: 'debt_consolidation',
      targetProducts: ['debt_consolidation_premium'],
      personalizedMessage: profile =>
        `Your $${profile.currentDebts.toLocaleString()} in debt could be costing you $${Math.round((profile.currentDebts * 0.18) / 12)} monthly in interest.`,
      callToAction: 'Consolidate Now & Save Thousands',
      benefitCalculation: profile => ({
        savings: Math.round((profile.currentDebts * 0.18 - profile.currentDebts * 0.07) * 12),
        benefit: 'Lower monthly payments and faster debt payoff',
      }),
    },
  ];

  // Calculate psychology score for timing optimization
  const calculatePsychologyScore = useCallback(
    (profile: UserFinancialProfile, trigger: CrossSellingTrigger): number => {
      let score = 0;

      // Urgency factors
      if (trigger.urgencyScore >= 8) score += 30;
      else if (trigger.urgencyScore >= 6) score += 20;
      else score += 10;

      // Behavioral alignment
      if (profile.behaviorProfile.urgencyResponse === 'immediate' && trigger.urgencyScore >= 8)
        score += 25;
      if (
        profile.behaviorProfile.decisionStyle === 'analytical' &&
        trigger.conversionProbability > 0.7
      )
        score += 20;

      // Financial stress indicators
      const debtToIncomeRatio = profile.currentDebts / (profile.annualIncome / 12);
      if (debtToIncomeRatio > 0.4) score += 20;
      if (debtToIncomeRatio > 0.6) score += 35;

      return Math.min(score, 100);
    },
    []
  );

  // Process active triggers and recommendations
  useEffect(() => {
    if (!userProfile) return;

    const activeTriggersData: CrossSellingTrigger[] = [];
    const recommendedInstruments: DebtInstrumentRecommendation[] = [];
    const psychScores: { [key: string]: number } = {};

    crossSellingTriggers.forEach(trigger => {
      if (trigger.triggerCondition(userProfile)) {
        activeTriggersData.push(trigger);

        const score = calculatePsychologyScore(userProfile, trigger);
        psychScores[trigger.id] = score;

        trigger.targetProducts.forEach(productId => {
          const instrument = debtInstruments.find(di => di.id === productId);
          if (instrument && !recommendedInstruments.find(ri => ri.id === instrument.id)) {
            recommendedInstruments.push(instrument);
          }
        });
      }
    });

    activeTriggersData.sort((a, b) => psychScores[b.id] - psychScores[a.id]);

    setActiveTriggers(activeTriggersData);
    setRecommendations(recommendedInstruments);
    setPsychologyScore(psychScores);
  }, [userProfile, calculatePsychologyScore]);

  const handleTriggerAction = (trigger: CrossSellingTrigger, instrumentId: string) => {
    if (!userProfile) return;

    trackUserBehavior('cross_sell_action', {
      triggerId: trigger.id,
      instrumentId,
      psychologyScore: psychologyScore[trigger.id],
    });

    triggerCrossSellingEvent(`${trigger.psychologyType}_conversion`);
    alert(`🎯 Navigating to ${instrumentId} application with personalized offer...`);
  };

  if (!userProfile) {
    return (
      <div className="tx-card p-8 text-center">
        <span className="text-4xl mb-4 block">🤖</span>
        <h3 className="text-lg font-bold tx-text-neutral-dark mb-2">Cross-Selling Engine Ready</h3>
        <p className="tx-text-neutral-medium">
          Activate a user profile to see personalized financial product recommendations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="tx-card tx-card-premium">
        <h2 className="text-2xl font-bold tx-text-premium mb-4">
          🎯 Advanced Cross-Selling Engine
        </h2>
        <p className="tx-text-neutral-medium mb-6">
          AI-powered recommendations using behavioral psychology and optimal timing
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold tx-text-action">{activeTriggers.length}</div>
            <div className="text-sm tx-text-neutral-medium">Active Triggers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold tx-text-success">{recommendations.length}</div>
            <div className="text-sm tx-text-neutral-medium">Recommendations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold tx-text-premium">
              {Math.round(
                Object.values(psychologyScore).reduce((a, b) => a + b, 0) /
                  Object.values(psychologyScore).length
              ) || 0}
              %
            </div>
            <div className="text-sm tx-text-neutral-medium">Psychology Score</div>
          </div>
        </div>
      </div>

      {activeTriggers.length > 0 ? (
        <div className="space-y-6">
          {activeTriggers.map(trigger => {
            const score = psychologyScore[trigger.id] || 0;
            const benefit = trigger.benefitCalculation(userProfile);

            return (
              <div
                key={trigger.id}
                className={`tx-card transition-all duration-300 hover:transform hover:scale-[1.02] ${
                  score >= 80 ? 'tx-card-action' : score >= 60 ? 'tx-card-premium' : 'tx-card-trust'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold tx-text-neutral-dark">
                    💸 Debt Optimization Opportunity
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`tx-badge ${score >= 80 ? 'tx-badge-action' : 'tx-badge-premium'}`}
                    >
                      {score}% Match
                    </div>
                    <div className="tx-badge tx-badge-wealth">
                      ${benefit.savings.toLocaleString()} Savings
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="tx-text-neutral-dark mb-3">
                    {trigger.personalizedMessage(userProfile)}
                  </p>
                  <p className="text-sm tx-text-neutral-medium">{benefit.benefit}</p>
                </div>

                <div className="space-y-3">
                  {trigger.targetProducts.map(productId => {
                    const instrument = debtInstruments.find(di => di.id === productId);
                    if (!instrument) return null;

                    return (
                      <div key={productId} className="tx-card tx-card-secondary p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold tx-text-neutral-dark">
                            {instrument.type.replace('_', ' ').toUpperCase()}
                          </h4>
                          <div className="text-sm tx-text-success font-bold">
                            {instrument.apr}% APR
                          </div>
                        </div>

                        <button
                          onClick={() => handleTriggerAction(trigger, instrument.id)}
                          className="w-full tx-btn-action"
                        >
                          {trigger.callToAction}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="tx-card p-8 text-center">
          <span className="text-4xl mb-4 block">✨</span>
          <h3 className="text-lg font-bold tx-text-success mb-2">No Active Triggers</h3>
          <p className="tx-text-neutral-medium">
            Current financial profile doesn't match cross-selling criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdvancedCrossSellingEngine;
