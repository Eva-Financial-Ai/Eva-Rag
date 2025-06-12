import React, { useEffect, useState } from 'react';
import '../../styles/transaction-psychology-design-system.css';
import ComprehensiveCrossSellingDashboard from './ComprehensiveCrossSellingDashboard';
import {
  PsychologyTriggerCard,
  useFinancialPsychology,
  UserFinancialProfile,
} from './FinancialPsychologyEngine';
import IntelligentNotificationSystem from './IntelligentNotificationSystem';
import PsychologyAnalyticsDashboard from './PsychologyAnalyticsDashboard';

// =============================================
// PSYCHOLOGY DASHBOARD - APPLICATION SHOWCASE
// =============================================

export const PsychologyDashboard: React.FC = () => {
  const {
    userProfile,
    recommendedProducts,
    updateProfile,
    triggerCrossSellingEvent,
    trackUserBehavior,
  } = useFinancialPsychology();
  const [activeDemo, setActiveDemo] = useState<
    'profile' | 'recommendations' | 'notifications' | 'psychology' | 'crossselling' | 'analytics'
  >('profile');
  const [demoProfile, setDemoProfile] = useState<UserFinancialProfile | null>(null);

  // Demo user profiles for testing psychological triggers
  const demoProfiles: { [key: string]: UserFinancialProfile } = {
    high_debt: {
      creditScore: 650,
      annualIncome: 75000,
      monthlyExpenses: 4500,
      currentDebts: 25000,
      savingsBalance: 2000,
      investmentExperience: 'novice',
      riskTolerance: 'conservative',
      financialGoals: ['pay off debt', 'emergency fund'],
      lifestage: 'young_professional',
      behaviorProfile: {
        spendingPattern: 'spender',
        decisionStyle: 'intuitive',
        urgencyResponse: 'immediate',
        trustFactors: ['peer recommendations', 'expert advice'],
      },
    },
    wealthy_saver: {
      creditScore: 780,
      annualIncome: 120000,
      monthlyExpenses: 6000,
      currentDebts: 5000,
      savingsBalance: 50000,
      investmentExperience: 'intermediate',
      riskTolerance: 'moderate',
      financialGoals: ['wealth building', 'retirement planning'],
      lifestage: 'peak_earning',
      behaviorProfile: {
        spendingPattern: 'saver',
        decisionStyle: 'analytical',
        urgencyResponse: 'considered',
        trustFactors: ['financial data', 'professional recommendations'],
      },
    },
    young_professional: {
      creditScore: 720,
      annualIncome: 65000,
      monthlyExpenses: 3200,
      currentDebts: 12000,
      savingsBalance: 8000,
      investmentExperience: 'novice',
      riskTolerance: 'aggressive',
      financialGoals: ['house down payment', 'investment growth'],
      lifestage: 'young_professional',
      behaviorProfile: {
        spendingPattern: 'balanced',
        decisionStyle: 'social',
        urgencyResponse: 'immediate',
        trustFactors: ['social proof', 'innovation'],
      },
    },
  };

  useEffect(() => {
    // Initialize with demo profile if none exists
    if (!userProfile && !demoProfile) {
      const defaultProfile = demoProfiles.high_debt;
      setDemoProfile(defaultProfile);
      updateProfile(defaultProfile);
    }
  }, [userProfile, demoProfile, updateProfile]);

  const handleProfileSwitch = (profileKey: string) => {
    const profile = demoProfiles[profileKey];
    setDemoProfile(profile);
    updateProfile(profile);
    trackUserBehavior('demo_profile_switched', { profileType: profileKey });
  };

  const renderProfileDemo = () => (
    <div className="space-y-6">
      <div className="tx-card tx-card-trust">
        <h3 className="text-xl font-bold tx-text-trust mb-4">🧠 User Psychology Profile Demo</h3>
        <p className="tx-text-neutral-medium mb-6">
          Select different user profiles to see how psychological triggers adapt to user behavior
          patterns.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(demoProfiles).map(([key, profile]) => (
            <button
              key={key}
              onClick={() => handleProfileSwitch(key)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                demoProfile === profile
                  ? 'tx-btn-premium transform scale-105'
                  : 'tx-btn-secondary hover:tx-btn-trust'
              }`}
            >
              <div className="mb-2">
                <h4 className="font-semibold tx-text-neutral-dark">
                  {key === 'high_debt' && '💸 High Debt User'}
                  {key === 'wealthy_saver' && '💰 Wealthy Saver'}
                  {key === 'young_professional' && '🚀 Young Professional'}
                </h4>
                <p className="text-sm tx-text-neutral-medium">
                  {key === 'high_debt' && 'High debt, needs consolidation'}
                  {key === 'wealthy_saver' && 'High savings, investment ready'}
                  {key === 'young_professional' && 'Growth mindset, risk tolerant'}
                </p>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Credit Score:</span>
                  <span className="tx-text-trust font-medium">{profile.creditScore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Income:</span>
                  <span className="tx-text-success font-medium">
                    ${profile.annualIncome.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Current Debt:</span>
                  <span className="tx-text-action font-medium">
                    ${profile.currentDebts.toLocaleString()}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {demoProfile && (
          <div className="tx-card tx-card-success p-4">
            <h4 className="font-semibold tx-text-success mb-3">
              Active Profile Psychology Analysis:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="tx-text-neutral-medium">Spending Pattern:</span>
                <div className="font-medium tx-text-neutral-dark capitalize">
                  {demoProfile.behaviorProfile.spendingPattern}
                </div>
              </div>
              <div>
                <span className="tx-text-neutral-medium">Decision Style:</span>
                <div className="font-medium tx-text-neutral-dark capitalize">
                  {demoProfile.behaviorProfile.decisionStyle}
                </div>
              </div>
              <div>
                <span className="tx-text-neutral-medium">Urgency Response:</span>
                <div className="font-medium tx-text-neutral-dark capitalize">
                  {demoProfile.behaviorProfile.urgencyResponse}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderRecommendationsDemo = () => (
    <div className="space-y-6">
      <div className="tx-card tx-card-premium">
        <h3 className="text-xl font-bold tx-text-premium mb-4">🎯 Personalized Recommendations</h3>
        <p className="tx-text-neutral-medium mb-6">
          AI-powered financial product recommendations based on user psychology and financial
          profile.
        </p>

        {recommendedProducts.length > 0 ? (
          <div className="space-y-4">
            {recommendedProducts.map((product, index) => (
              <div key={product.id} className="space-y-3">
                {product.psychologyTriggers.map(trigger => (
                  <PsychologyTriggerCard
                    key={trigger.id}
                    trigger={trigger}
                    product={product}
                    onAction={() => {
                      trackUserBehavior('recommendation_clicked', {
                        productId: product.id,
                        triggerType: trigger.type,
                      });
                      alert(`🎉 Navigating to ${product.name} application...`);
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="tx-card p-8 text-center">
            <span className="text-4xl mb-4 block">🤖</span>
            <p className="tx-text-neutral-medium">
              Select a user profile to see personalized recommendations
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotificationsDemo = () => (
    <div className="space-y-6">
      <div className="tx-card tx-card-trust">
        <h3 className="text-xl font-bold tx-text-trust mb-4">🔔 Intelligent Notifications</h3>
        <p className="tx-text-neutral-medium mb-6">
          Smart, behavioral-triggered notifications that appear at optimal times for maximum
          engagement.
        </p>

        <div className="mb-6">
          <button
            onClick={() => triggerCrossSellingEvent('dashboard_demo')}
            className="tx-btn-action mr-4"
          >
            <span className="mr-2">⚡</span>
            Trigger Cross-Selling Event
          </button>
          <button
            onClick={() => {
              trackUserBehavior('manual_notification_trigger', { source: 'dashboard' });
              alert('🔔 Notification engine activated! Check the notification panel.');
            }}
            className="tx-btn-trust"
          >
            <span className="mr-2">🧠</span>
            Activate Psychology Engine
          </button>
        </div>

        <IntelligentNotificationSystem />
      </div>
    </div>
  );

  const renderCrossSellingDemo = () => (
    <div className="space-y-6">
      <ComprehensiveCrossSellingDashboard />
    </div>
  );

  const renderPsychologyPrinciples = () => (
    <div className="space-y-6">
      <div className="tx-card tx-card-wealth">
        <h3 className="text-xl font-bold tx-text-wealth mb-4">
          🧠 Psychology Principles in Action
        </h3>
        <p className="tx-text-neutral-medium mb-6">
          Behavioral economics principles implemented throughout the financial application.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="tx-card tx-card-success p-4">
              <h4 className="font-semibold tx-text-success mb-2">💸 Loss Aversion</h4>
              <p className="text-sm tx-text-neutral-dark mb-3">
                People feel losses more strongly than equivalent gains. Used to highlight debt
                costs.
              </p>
              <div className="tx-badge tx-badge-action text-xs">
                "You're losing $247 monthly to high-interest debt"
              </div>
            </div>

            <div className="tx-card tx-card-trust p-4">
              <h4 className="font-semibold tx-text-trust mb-2">👥 Social Proof</h4>
              <p className="text-sm tx-text-neutral-dark mb-3">
                People follow others' behavior. Shows what similar users choose.
              </p>
              <div className="tx-badge tx-badge-trust text-xs">
                "87% of professionals like you chose this option"
              </div>
            </div>

            <div className="tx-card tx-card-premium p-4">
              <h4 className="font-semibold tx-text-premium mb-2">⏰ Scarcity</h4>
              <p className="text-sm tx-text-neutral-dark mb-3">
                Limited availability increases perceived value and urgency.
              </p>
              <div className="tx-badge tx-badge-action text-xs">
                "Only 500 premium cards available this month"
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="tx-card tx-card-wealth p-4">
              <h4 className="font-semibold tx-text-wealth mb-2">⚓ Anchoring</h4>
              <p className="text-sm tx-text-neutral-dark mb-3">
                First number influences perception of value. Sets reference points.
              </p>
              <div className="tx-badge tx-badge-wealth text-xs">
                "Save $2,964 annually vs current payments"
              </div>
            </div>

            <div className="tx-card tx-card-trust p-4">
              <h4 className="font-semibold tx-text-trust mb-2">🏆 Authority</h4>
              <p className="text-sm tx-text-neutral-dark mb-3">
                Expert recommendations increase trust and decision confidence.
              </p>
              <div className="tx-badge tx-badge-trust text-xs">
                "Recommended by 9 out of 10 financial advisors"
              </div>
            </div>

            <div className="tx-card tx-card-success p-4">
              <h4 className="font-semibold tx-text-success mb-2">🎁 Reciprocity</h4>
              <p className="text-sm tx-text-neutral-dark mb-3">
                People return favors. Offering value first builds loyalty.
              </p>
              <div className="tx-badge tx-badge-success text-xs">
                "Free credit score + personalized advice"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with Transaction Psychology */}
      <div className="tx-card tx-card-premium mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tx-text-premium mb-2">
              🧠 Financial Psychology Dashboard
            </h1>
            <p className="tx-text-neutral-medium">
              Comprehensive demonstration of behavioral economics and psychology in financial UX
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="tx-badge tx-badge-premium">Psychology Engine</div>
            <div className="tx-badge tx-badge-success">Active</div>
            <div className="tx-badge tx-badge-wealth">Advanced Cross-Selling</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profile', label: 'User Profiles', icon: '👤' },
              { id: 'recommendations', label: 'Smart Recommendations', icon: '🎯' },
              { id: 'crossselling', label: 'Cross-Selling Engine', icon: '💰' },
              { id: 'notifications', label: 'Intelligent Notifications', icon: '🔔' },
              { id: 'psychology', label: 'Psychology Principles', icon: '🧠' },
              { id: 'analytics', label: 'Analytics', icon: '📊' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDemo(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  activeDemo === tab.id
                    ? 'border-purple-500 text-purple-600 tx-text-premium'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Demo Content */}
      {activeDemo === 'profile' && renderProfileDemo()}
      {activeDemo === 'recommendations' && renderRecommendationsDemo()}
      {activeDemo === 'crossselling' && renderCrossSellingDemo()}
      {activeDemo === 'notifications' && renderNotificationsDemo()}
      {activeDemo === 'psychology' && renderPsychologyPrinciples()}
      {activeDemo === 'analytics' && <PsychologyAnalyticsDashboard />}

      {/* Footer with Statistics */}
      <div className="mt-12 tx-card tx-card-trust">
        <h3 className="text-lg font-bold tx-text-trust mb-4">📊 Psychology Engine Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold tx-text-success">7</div>
            <div className="text-sm tx-text-neutral-medium">Psychology Principles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold tx-text-premium">12</div>
            <div className="text-sm tx-text-neutral-medium">Trigger Variations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold tx-text-trust">3</div>
            <div className="text-sm tx-text-neutral-medium">User Profiles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold tx-text-action">85%</div>
            <div className="text-sm tx-text-neutral-medium">Conversion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold tx-text-wealth">∞</div>
            <div className="text-sm tx-text-neutral-medium">Combinations</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsychologyDashboard;
