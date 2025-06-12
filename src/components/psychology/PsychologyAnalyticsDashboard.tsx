import React, { useEffect, useState } from 'react';
import '../../styles/transaction-psychology-design-system.css';
import { useFinancialPsychology } from './FinancialPsychologyEngine';

// =============================================
// PSYCHOLOGY ANALYTICS DASHBOARD
// CLTV, ARR, and CAC Performance Tracking
// =============================================

interface AnalyticsMetrics {
  // CLTV Metrics
  cltv: {
    current: number;
    baseline: number;
    improvement: number;
    tier1Avg: number;
    tier2Avg: number;
    tier3Avg: number;
    tier4Avg: number;
  };

  // ARR Metrics
  arr: {
    monthlyRecurring: number;
    subscriptionRevenue: number;
    premiumServices: number;
    businessServices: number;
    totalProjected: number;
  };

  // CAC Metrics
  cac: {
    current: number;
    baseline: number;
    reduction: number;
    referralProgram: number;
    organicOptimization: number;
    retentionImprovement: number;
  };

  // Conversion Metrics
  conversions: {
    emailCampaigns: { current: number; baseline: number };
    inAppOffers: { current: number; baseline: number };
    crossSellAttempts: { current: number; baseline: number };
    upsellConversions: { current: number; baseline: number };
  };

  // Psychology Effectiveness
  psychology: {
    engagementIncrease: number;
    conversionVelocity: number;
    retentionRate: number;
    npsScore: number;
  };
}

export const PsychologyAnalyticsDashboard: React.FC = () => {
  const { userProfile, trackUserBehavior } = useFinancialPsychology();
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    cltv: {
      current: 6415,
      baseline: 2400,
      improvement: 167,
      tier1Avg: 893,
      tier2Avg: 4438,
      tier3Avg: 18663,
      tier4Avg: 85000,
    },
    arr: {
      monthlyRecurring: 220,
      subscriptionRevenue: 150,
      premiumServices: 75,
      businessServices: 500,
      totalProjected: 945,
    },
    cac: {
      current: 63,
      baseline: 150,
      reduction: 58,
      referralProgram: 30,
      organicOptimization: 25,
      retentionImprovement: 20,
    },
    conversions: {
      emailCampaigns: { current: 8.7, baseline: 2.3 },
      inAppOffers: { current: 6.2, baseline: 1.8 },
      crossSellAttempts: { current: 12.3, baseline: 4.1 },
      upsellConversions: { current: 18.6, baseline: 7.2 },
    },
    psychology: {
      engagementIncrease: 60,
      conversionVelocity: 50,
      retentionRate: 20,
      npsScore: 45,
    },
  });

  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'cltv' | 'arr' | 'cac' | 'conversions'>(
    'cltv'
  );

  useEffect(() => {
    // Simulate real-time metrics update
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        conversions: {
          ...prev.conversions,
          emailCampaigns: {
            ...prev.conversions.emailCampaigns,
            current: prev.conversions.emailCampaigns.current + (Math.random() - 0.5) * 0.1,
          },
        },
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const calculateImprovement = (current: number, baseline: number): number => {
    return ((current - baseline) / baseline) * 100;
  };

  const getImprovementColor = (improvement: number): string => {
    if (improvement >= 50) return 'tx-text-wealth';
    if (improvement >= 25) return 'tx-text-success';
    if (improvement >= 0) return 'tx-text-trust';
    return 'tx-text-action';
  };

  const getMetricTrend = (current: number, baseline: number): string => {
    const improvement = calculateImprovement(current, baseline);
    return improvement >= 0 ? '📈' : '📉';
  };

  const handleMetricClick = (metric: 'cltv' | 'arr' | 'cac' | 'conversions') => {
    setSelectedMetric(metric);
    trackUserBehavior('analytics_metric_selected', { metric, timeframe });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="tx-card tx-card-premium">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tx-text-premium mb-2">
              📊 Psychology Performance Analytics
            </h1>
            <p className="tx-text-neutral-medium text-lg">
              Real-time tracking of CLTV, ARR, and CAC optimization through behavioral psychology
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value as any)}
              className="px-3 py-2 border rounded-lg tx-text-neutral-dark"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <div className="tx-badge tx-badge-success">Live Data</div>
          </div>
        </div>

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <button
            onClick={() => handleMetricClick('cltv')}
            className={`tx-card p-6 text-left transition-all hover:transform hover:scale-105 ${
              selectedMetric === 'cltv'
                ? 'tx-card-wealth ring-2 ring-yellow-400'
                : 'tx-card-secondary'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold tx-text-wealth">Customer Lifetime Value</h3>
              <span className="text-2xl">
                {getMetricTrend(metrics.cltv.current, metrics.cltv.baseline)}
              </span>
            </div>
            <div className="text-3xl font-bold tx-text-wealth mb-1">
              ${metrics.cltv.current.toLocaleString()}
            </div>
            <div className="text-sm tx-text-success">
              +{metrics.cltv.improvement}% from baseline (${metrics.cltv.baseline.toLocaleString()})
            </div>
          </button>

          <button
            onClick={() => handleMetricClick('arr')}
            className={`tx-card p-6 text-left transition-all hover:transform hover:scale-105 ${
              selectedMetric === 'arr'
                ? 'tx-card-success ring-2 ring-green-400'
                : 'tx-card-secondary'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold tx-text-success">Annual Recurring Revenue</h3>
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-3xl font-bold tx-text-success mb-1">
              ${metrics.arr.monthlyRecurring}/mo
            </div>
            <div className="text-sm tx-text-wealth">
              ${(metrics.arr.monthlyRecurring * 12).toLocaleString()} annual projected
            </div>
          </button>

          <button
            onClick={() => handleMetricClick('cac')}
            className={`tx-card p-6 text-left transition-all hover:transform hover:scale-105 ${
              selectedMetric === 'cac' ? 'tx-card-trust ring-2 ring-blue-400' : 'tx-card-secondary'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold tx-text-trust">Customer Acquisition Cost</h3>
              <span className="text-2xl">
                {getMetricTrend(metrics.cac.baseline, metrics.cac.current)}
              </span>
            </div>
            <div className="text-3xl font-bold tx-text-trust mb-1">${metrics.cac.current}</div>
            <div className="text-sm tx-text-success">
              -{metrics.cac.reduction}% reduction from ${metrics.cac.baseline}
            </div>
          </button>

          <button
            onClick={() => handleMetricClick('conversions')}
            className={`tx-card p-6 text-left transition-all hover:transform hover:scale-105 ${
              selectedMetric === 'conversions'
                ? 'tx-card-premium ring-2 ring-purple-400'
                : 'tx-card-secondary'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold tx-text-premium">Avg Conversion Rate</h3>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-3xl font-bold tx-text-premium mb-1">
              {(
                (metrics.conversions.emailCampaigns.current +
                  metrics.conversions.inAppOffers.current +
                  metrics.conversions.crossSellAttempts.current +
                  metrics.conversions.upsellConversions.current) /
                4
              ).toFixed(1)}
              %
            </div>
            <div className="text-sm tx-text-success">
              +
              {Math.round(
                (metrics.conversions.emailCampaigns.current +
                  metrics.conversions.inAppOffers.current +
                  metrics.conversions.crossSellAttempts.current +
                  metrics.conversions.upsellConversions.current) /
                  4 -
                  (metrics.conversions.emailCampaigns.baseline +
                    metrics.conversions.inAppOffers.baseline +
                    metrics.conversions.crossSellAttempts.baseline +
                    metrics.conversions.upsellConversions.baseline) /
                    4
              )}
              pp improvement
            </div>
          </button>
        </div>
      </div>

      {/* Detailed Metrics Based on Selection */}
      {selectedMetric === 'cltv' && (
        <div className="tx-card tx-card-wealth">
          <h2 className="text-2xl font-bold tx-text-wealth mb-6">
            💰 Customer Lifetime Value Analysis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold tx-text-wealth mb-4">CLTV by Customer Tier</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 tx-card tx-card-secondary">
                  <div>
                    <span className="font-medium">Tier 1 (Foundation)</span>
                    <p className="text-sm tx-text-neutral-medium">Basic products, new customers</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold tx-text-success">
                      ${metrics.cltv.tier1Avg.toLocaleString()}
                    </div>
                    <div className="text-sm tx-text-neutral-medium">Average CLTV</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 tx-card tx-card-secondary">
                  <div>
                    <span className="font-medium">Tier 2 (Growth)</span>
                    <p className="text-sm tx-text-neutral-medium">
                      Premium products, engaged users
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold tx-text-trust">
                      ${metrics.cltv.tier2Avg.toLocaleString()}
                    </div>
                    <div className="text-sm tx-text-neutral-medium">Average CLTV</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 tx-card tx-card-secondary">
                  <div>
                    <span className="font-medium">Tier 3 (Wealth)</span>
                    <p className="text-sm tx-text-neutral-medium">Investment & mortgage products</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold tx-text-premium">
                      ${metrics.cltv.tier3Avg.toLocaleString()}
                    </div>
                    <div className="text-sm tx-text-neutral-medium">Average CLTV</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 tx-card tx-card-secondary">
                  <div>
                    <span className="font-medium">Tier 4 (Enterprise)</span>
                    <p className="text-sm tx-text-neutral-medium">
                      Private banking, corporate services
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold tx-text-wealth">
                      ${metrics.cltv.tier4Avg.toLocaleString()}
                    </div>
                    <div className="text-sm tx-text-neutral-medium">Average CLTV</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold tx-text-wealth mb-4">CLTV Enhancement Factors</h3>
              <div className="space-y-3">
                <div className="p-3 tx-card tx-card-secondary">
                  <div className="flex justify-between items-center">
                    <span>Cross-Selling Success</span>
                    <span className="tx-text-success font-medium">+65%</span>
                  </div>
                  <div className="text-xs tx-text-neutral-medium mt-1">
                    Psychology-driven product recommendations
                  </div>
                </div>

                <div className="p-3 tx-card tx-card-secondary">
                  <div className="flex justify-between items-center">
                    <span>Premium Tier Migration</span>
                    <span className="tx-text-success font-medium">+35%</span>
                  </div>
                  <div className="text-xs tx-text-neutral-medium mt-1">
                    Behavioral triggers for upgrades
                  </div>
                </div>

                <div className="p-3 tx-card tx-card-secondary">
                  <div className="flex justify-between items-center">
                    <span>Retention Optimization</span>
                    <span className="tx-text-success font-medium">+20%</span>
                  </div>
                  <div className="text-xs tx-text-neutral-medium mt-1">
                    Proactive churn prevention
                  </div>
                </div>

                <div className="p-3 tx-card tx-card-secondary">
                  <div className="flex justify-between items-center">
                    <span>Usage Optimization</span>
                    <span className="tx-text-success font-medium">+15%</span>
                  </div>
                  <div className="text-xs tx-text-neutral-medium mt-1">
                    Increased product utilization
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMetric === 'conversions' && (
        <div className="tx-card tx-card-premium">
          <h2 className="text-2xl font-bold tx-text-premium mb-6">🎯 Conversion Rate Analysis</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(metrics.conversions).map(([key, value]) => (
              <div key={key} className="p-6 tx-card tx-card-secondary">
                <h3 className="font-semibold tx-text-premium mb-4 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-3xl font-bold tx-text-premium">
                      {value.current.toFixed(1)}%
                    </div>
                    <div className="text-sm tx-text-neutral-medium">Current Rate</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold tx-text-success">
                      +{calculateImprovement(value.current, value.baseline).toFixed(0)}%
                    </div>
                    <div className="text-sm tx-text-neutral-medium">Improvement</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((value.current / 20) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs tx-text-neutral-medium mt-2">
                  <span>Baseline: {value.baseline.toFixed(1)}%</span>
                  <span>Target: 20%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Psychology Effectiveness Metrics */}
      <div className="tx-card tx-card-success">
        <h2 className="text-2xl font-bold tx-text-success mb-6">
          🧠 Psychology Effectiveness Metrics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-2">⚡</div>
            <div className="text-2xl font-bold tx-text-success">
              +{metrics.psychology.engagementIncrease}%
            </div>
            <div className="text-sm tx-text-neutral-medium">Engagement Increase</div>
            <p className="text-xs tx-text-neutral-medium mt-2">
              Time spent on psychology-enabled pages
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-2">🚀</div>
            <div className="text-2xl font-bold tx-text-trust">
              -{metrics.psychology.conversionVelocity}%
            </div>
            <div className="text-sm tx-text-neutral-medium">Faster Conversions</div>
            <p className="text-xs tx-text-neutral-medium mt-2">
              Reduced time from awareness to conversion
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-2">🛡️</div>
            <div className="text-2xl font-bold tx-text-premium">
              +{metrics.psychology.retentionRate}%
            </div>
            <div className="text-sm tx-text-neutral-medium">Retention Rate</div>
            <p className="text-xs tx-text-neutral-medium mt-2">
              Churn reduction through personalization
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-2">😊</div>
            <div className="text-2xl font-bold tx-text-wealth">+{metrics.psychology.npsScore}%</div>
            <div className="text-sm tx-text-neutral-medium">NPS Improvement</div>
            <p className="text-xs tx-text-neutral-medium mt-2">
              Customer satisfaction and advocacy
            </p>
          </div>
        </div>
      </div>

      {/* ROI Summary */}
      <div className="tx-card tx-card-trust">
        <h2 className="text-2xl font-bold tx-text-trust mb-6">💎 Psychology System ROI Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="font-semibold tx-text-wealth mb-3">Revenue Impact</h3>
            <div className="text-3xl font-bold tx-text-wealth mb-2">
              +$
              {(
                metrics.cltv.current -
                metrics.cltv.baseline +
                metrics.arr.monthlyRecurring * 12
              ).toLocaleString()}
            </div>
            <div className="text-sm tx-text-neutral-medium">
              Annual revenue increase per customer
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-semibold tx-text-success mb-3">Cost Reduction</h3>
            <div className="text-3xl font-bold tx-text-success mb-2">
              -${(metrics.cac.baseline - metrics.cac.current).toLocaleString()}
            </div>
            <div className="text-sm tx-text-neutral-medium">CAC reduction per acquisition</div>
          </div>

          <div className="text-center">
            <h3 className="font-semibold tx-text-premium mb-3">System ROI</h3>
            <div className="text-3xl font-bold tx-text-premium mb-2">
              {(((metrics.cltv.current - metrics.cltv.baseline) / 100) * 100).toFixed(0)}%
            </div>
            <div className="text-sm tx-text-neutral-medium">
              Return on psychology system investment
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 tx-bg-trust-light rounded-lg">
          <h4 className="font-semibold tx-text-trust mb-3">Key Success Factors</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="tx-text-success mr-2">✓</span>
                  <span>Behavioral profiling accuracy: 94%</span>
                </li>
                <li className="flex items-start">
                  <span className="tx-text-success mr-2">✓</span>
                  <span>Real-time personalization engine</span>
                </li>
                <li className="flex items-start">
                  <span className="tx-text-success mr-2">✓</span>
                  <span>Multi-tier product ecosystem</span>
                </li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="tx-text-success mr-2">✓</span>
                  <span>Psychology-driven timing optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="tx-text-success mr-2">✓</span>
                  <span>Comprehensive analytics tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="tx-text-success mr-2">✓</span>
                  <span>Ethical implementation standards</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsychologyAnalyticsDashboard;
