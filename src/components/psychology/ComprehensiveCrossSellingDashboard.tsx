import React, { useEffect, useState } from 'react';
import '../../styles/transaction-psychology-design-system.css';
import {
  ENHANCED_PRODUCT_CATALOG,
  EnhancedCrossSellingEngine,
  EnhancedFinancialProduct,
} from './EnhancedCrossSellingCatalog';
import { useFinancialPsychology } from './FinancialPsychologyEngine';

// =============================================
// COMPREHENSIVE CROSS-SELLING DASHBOARD
// Revenue Optimization & CLTV Maximization
// =============================================

export const ComprehensiveCrossSellingDashboard: React.FC = () => {
  const { userProfile, trackUserBehavior } = useFinancialPsychology();
  const [recommendedProducts, setRecommendedProducts] = useState<EnhancedFinancialProduct[]>([]);
  const [revenueProjections, setRevenueProjections] = useState<{
    monthlyRevenue: number;
    totalCltv: number;
    weightedConversionRate: number;
  }>({ monthlyRevenue: 0, totalCltv: 0, weightedConversionRate: 0 });
  const [selectedTier, setSelectedTier] = useState<'all' | 1 | 2 | 3 | 4>('all');

  useEffect(() => {
    if (userProfile) {
      const recommendations =
        EnhancedCrossSellingEngine.getOptimalCrossSellingSequence(userProfile);
      setRecommendedProducts(recommendations);

      const projections = EnhancedCrossSellingEngine.calculateExpectedRevenueImpact(
        recommendations,
        userProfile
      );
      setRevenueProjections(projections);
    }
  }, [userProfile]);

  const handleProductAction = (product: EnhancedFinancialProduct) => {
    if (!userProfile) return;

    const score = EnhancedCrossSellingEngine.calculateProductRecommendationScore(
      product,
      userProfile
    );

    trackUserBehavior('enhanced_cross_sell_action', {
      productId: product.id,
      tier: product.tier,
      category: product.category,
      expectedRevenue: product.revenueModel.monthlyValue,
      cltv: product.revenueModel.cltv,
      score,
    });

    // Simulate navigation to product application
    alert(`🚀 Navigating to ${product.name} application with ${score.toFixed(1)}% match score!`);
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1:
        return 'tx-text-success';
      case 2:
        return 'tx-text-trust';
      case 3:
        return 'tx-text-premium';
      case 4:
        return 'tx-text-wealth';
      default:
        return 'tx-text-neutral-dark';
    }
  };

  const getTierBadge = (tier: number) => {
    switch (tier) {
      case 1:
        return 'tx-badge-success';
      case 2:
        return 'tx-badge-trust';
      case 3:
        return 'tx-badge-premium';
      case 4:
        return 'tx-badge-wealth';
      default:
        return 'tx-badge-neutral';
    }
  };

  const getPsychologyIcon = (type: string) => {
    switch (type) {
      case 'loss_aversion':
        return '💸';
      case 'social_proof':
        return '👥';
      case 'scarcity':
        return '⏰';
      case 'authority':
        return '🏆';
      case 'reciprocity':
        return '🎁';
      default:
        return '💡';
    }
  };

  const getProductIcon = (productType: string) => {
    switch (productType) {
      case 'checking':
        return '🏦';
      case 'savings':
        return '💰';
      case 'credit_card':
        return '💳';
      case 'personal_loan':
        return '💵';
      case 'auto_loan':
        return '🚗';
      case 'mortgage':
        return '🏠';
      case 'business_loan':
        return '🏢';
      case 'investment':
        return '📈';
      case 'insurance':
        return '🛡️';
      case 'premium_service':
        return '👑';
      default:
        return '🔧';
    }
  };

  const filteredProducts =
    selectedTier === 'all'
      ? ENHANCED_PRODUCT_CATALOG
      : ENHANCED_PRODUCT_CATALOG.filter(p => p.tier === selectedTier);

  if (!userProfile) {
    return (
      <div className="tx-card p-8 text-center">
        <span className="text-6xl mb-4 block">🎯</span>
        <h3 className="text-2xl font-bold tx-text-neutral-dark mb-4">
          Enhanced Cross-Selling Engine
        </h3>
        <p className="tx-text-neutral-medium text-lg">
          Activate a user profile to see comprehensive product recommendations and revenue
          projections
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Revenue Projections */}
      <div className="tx-card tx-card-premium">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tx-text-premium mb-2">
              📊 Comprehensive Cross-Selling Dashboard
            </h1>
            <p className="tx-text-neutral-medium text-lg">
              Advanced revenue optimization with {ENHANCED_PRODUCT_CATALOG.length} financial
              products
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="tx-badge tx-badge-premium">Enhanced Engine</div>
            <div className="tx-badge tx-badge-wealth">Revenue Optimized</div>
            <div className="tx-badge tx-badge-success">AI-Powered</div>
          </div>
        </div>

        {/* Revenue Projections */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold tx-text-success">
              ${revenueProjections.monthlyRevenue.toFixed(0)}
            </div>
            <div className="text-sm tx-text-neutral-medium">Monthly Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold tx-text-wealth">
              ${revenueProjections.totalCltv.toLocaleString()}
            </div>
            <div className="text-sm tx-text-neutral-medium">Total CLTV</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold tx-text-premium">
              {(revenueProjections.weightedConversionRate * 100).toFixed(1)}%
            </div>
            <div className="text-sm tx-text-neutral-medium">Avg Conversion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold tx-text-trust">{recommendedProducts.length}</div>
            <div className="text-sm tx-text-neutral-medium">Recommended Products</div>
          </div>
        </div>

        {/* Tier Filter */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setSelectedTier('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedTier === 'all' ? 'tx-btn-premium' : 'tx-btn-secondary'
            }`}
          >
            All Tiers ({ENHANCED_PRODUCT_CATALOG.length})
          </button>
          {[1, 2, 3, 4].map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier as 1 | 2 | 3 | 4)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedTier === tier
                  ? `tx-btn-${tier === 1 ? 'success' : tier === 2 ? 'trust' : tier === 3 ? 'premium' : 'wealth'}`
                  : 'tx-btn-secondary'
              }`}
            >
              Tier {tier} ({ENHANCED_PRODUCT_CATALOG.filter(p => p.tier === tier).length})
            </button>
          ))}
        </div>
      </div>

      {/* Personalized Recommendations */}
      {recommendedProducts.length > 0 && (
        <div className="tx-card tx-card-success">
          <h2 className="text-2xl font-bold tx-text-success mb-4">
            🎯 Personalized Recommendations
          </h2>
          <p className="tx-text-neutral-medium mb-6">
            AI-selected products based on your financial profile and behavioral patterns
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendedProducts.map(product => {
              const score = EnhancedCrossSellingEngine.calculateProductRecommendationScore(
                product,
                userProfile!
              );
              return (
                <div
                  key={product.id}
                  className={`tx-card transition-all duration-300 hover:transform hover:scale-[1.02] ${
                    score >= 80
                      ? 'tx-card-wealth'
                      : score >= 60
                        ? 'tx-card-premium'
                        : 'tx-card-trust'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getProductIcon(product.productType)}</span>
                      <div>
                        <h3 className="font-bold tx-text-neutral-dark">{product.name}</h3>
                        <p className="text-sm tx-text-neutral-medium capitalize">
                          {product.category} • {product.productType.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`tx-badge ${getTierBadge(product.tier)}`}>
                        Tier {product.tier}
                      </div>
                      <div className="tx-badge tx-badge-success">{score.toFixed(1)}% Match</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">
                        {getPsychologyIcon(product.psychologyHooks.primary)}
                      </span>
                      <p className="tx-text-neutral-dark">{product.psychologyHooks.message}</p>
                    </div>
                    <p className="text-sm tx-text-action font-medium">
                      {product.psychologyHooks.urgencyTrigger}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold tx-text-success mb-2">Benefits:</h4>
                      <ul className="space-y-1">
                        {product.benefits.slice(0, 3).map((benefit, index) => (
                          <li key={index} className="text-sm tx-text-neutral-dark flex items-start">
                            <span className="tx-text-success mr-2">✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold tx-text-wealth mb-2">Revenue Model:</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Monthly Value:</span>
                          <span className="tx-text-wealth font-medium">
                            ${product.revenueModel.monthlyValue}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>CLTV:</span>
                          <span className="tx-text-wealth font-medium">
                            ${product.revenueModel.cltv.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversion:</span>
                          <span className="tx-text-success font-medium">
                            {(product.conversionRate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleProductAction(product)}
                    className={`w-full ${
                      score >= 80
                        ? 'tx-btn-wealth'
                        : score >= 60
                          ? 'tx-btn-premium'
                          : 'tx-btn-trust'
                    }`}
                  >
                    <span className="mr-2">🚀</span>
                    Apply Now - {score.toFixed(1)}% Match
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Complete Product Catalog */}
      <div className="tx-card tx-card-trust">
        <h2 className="text-2xl font-bold tx-text-trust mb-4">🏦 Complete Product Catalog</h2>
        <p className="tx-text-neutral-medium mb-6">
          Comprehensive financial product ecosystem across all customer tiers
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const score = userProfile
              ? EnhancedCrossSellingEngine.calculateProductRecommendationScore(product, userProfile)
              : 0;
            const isRecommended = recommendedProducts.some(rp => rp.id === product.id);

            return (
              <div
                key={product.id}
                className={`tx-card tx-card-secondary hover:shadow-lg transition-all duration-200 ${
                  isRecommended ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getProductIcon(product.productType)}</span>
                    <div>
                      <h3 className="font-semibold tx-text-neutral-dark text-sm">{product.name}</h3>
                      <p className="text-xs tx-text-neutral-medium capitalize">
                        {product.productType.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div className={`tx-badge ${getTierBadge(product.tier)} text-xs`}>
                      T{product.tier}
                    </div>
                    {isRecommended && (
                      <div className="tx-badge tx-badge-success text-xs">Recommended</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-sm">
                      {getPsychologyIcon(product.psychologyHooks.primary)}
                    </span>
                    <p className="text-xs tx-text-neutral-medium">
                      {product.psychologyHooks.primary.replace('_', ' ')}
                    </p>
                  </div>

                  {product.apr && <p className="text-xs tx-text-action">APR: {product.apr}%</p>}
                  {product.apy && <p className="text-xs tx-text-success">APY: {product.apy}%</p>}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div>
                    <span className="tx-text-neutral-medium">Monthly Rev:</span>
                    <div className="font-medium tx-text-wealth">
                      ${product.revenueModel.monthlyValue}
                    </div>
                  </div>
                  <div>
                    <span className="tx-text-neutral-medium">CLTV:</span>
                    <div className="font-medium tx-text-wealth">
                      ${(product.revenueModel.cltv / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs">
                    <span className="tx-text-neutral-medium">Conv Rate:</span>
                    <span className="tx-text-success font-medium ml-1">
                      {(product.conversionRate * 100).toFixed(0)}%
                    </span>
                  </div>
                  {userProfile && score > 0 && (
                    <div className="text-xs">
                      <span className="tx-text-neutral-medium">Match:</span>
                      <span className="tx-text-premium font-medium ml-1">{score.toFixed(0)}%</span>
                    </div>
                  )}
                </div>

                {userProfile && score > 0 && (
                  <button
                    onClick={() => handleProductAction(product)}
                    className="w-full mt-3 px-3 py-1 text-xs tx-btn-secondary hover:tx-btn-trust transition-all"
                  >
                    Learn More
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Business Impact Summary */}
      <div className="tx-card tx-card-wealth">
        <h2 className="text-2xl font-bold tx-text-wealth mb-4">📈 Business Impact Projections</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold tx-text-wealth">CLTV Optimization</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tier 1 Avg CLTV:</span>
                <span className="font-medium">
                  $
                  {Math.round(
                    ENHANCED_PRODUCT_CATALOG.filter(p => p.tier === 1).reduce(
                      (sum, p) => sum + p.revenueModel.cltv,
                      0
                    ) / ENHANCED_PRODUCT_CATALOG.filter(p => p.tier === 1).length
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tier 2 Avg CLTV:</span>
                <span className="font-medium">
                  $
                  {Math.round(
                    ENHANCED_PRODUCT_CATALOG.filter(p => p.tier === 2).reduce(
                      (sum, p) => sum + p.revenueModel.cltv,
                      0
                    ) / ENHANCED_PRODUCT_CATALOG.filter(p => p.tier === 2).length
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tier 3 Avg CLTV:</span>
                <span className="font-medium">
                  $
                  {Math.round(
                    ENHANCED_PRODUCT_CATALOG.filter(p => p.tier === 3).reduce(
                      (sum, p) => sum + p.revenueModel.cltv,
                      0
                    ) / ENHANCED_PRODUCT_CATALOG.filter(p => p.tier === 3).length
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tier 4 Avg CLTV:</span>
                <span className="font-medium">
                  $
                  {Math.round(
                    ENHANCED_PRODUCT_CATALOG.filter(p => p.tier === 4).reduce(
                      (sum, p) => sum + p.revenueModel.cltv,
                      0
                    ) / ENHANCED_PRODUCT_CATALOG.filter(p => p.tier === 4).length
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold tx-text-wealth">Revenue Streams</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Interest Revenue:</span>
                <span className="font-medium">
                  {ENHANCED_PRODUCT_CATALOG.filter(p => p.revenueModel.type === 'interest').length}{' '}
                  Products
                </span>
              </div>
              <div className="flex justify-between">
                <span>Fee Revenue:</span>
                <span className="font-medium">
                  {ENHANCED_PRODUCT_CATALOG.filter(p => p.revenueModel.type === 'fee').length}{' '}
                  Products
                </span>
              </div>
              <div className="flex justify-between">
                <span>Subscription ARR:</span>
                <span className="font-medium">
                  {
                    ENHANCED_PRODUCT_CATALOG.filter(p => p.revenueModel.type === 'subscription')
                      .length
                  }{' '}
                  Products
                </span>
              </div>
              <div className="flex justify-between">
                <span>Commission:</span>
                <span className="font-medium">
                  {
                    ENHANCED_PRODUCT_CATALOG.filter(p => p.revenueModel.type === 'commission')
                      .length
                  }{' '}
                  Products
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold tx-text-wealth">Conversion Metrics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Avg Conversion Rate:</span>
                <span className="font-medium">
                  {(
                    (ENHANCED_PRODUCT_CATALOG.reduce((sum, p) => sum + p.conversionRate, 0) /
                      ENHANCED_PRODUCT_CATALOG.length) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span>High Conv Products:</span>
                <span className="font-medium">
                  {ENHANCED_PRODUCT_CATALOG.filter(p => p.conversionRate > 0.6).length} Products
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Monthly Rev:</span>
                <span className="font-medium">
                  $
                  {ENHANCED_PRODUCT_CATALOG.reduce(
                    (sum, p) => sum + p.revenueModel.monthlyValue,
                    0
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Catalog CLTV:</span>
                <span className="font-medium">
                  $
                  {Math.round(
                    ENHANCED_PRODUCT_CATALOG.reduce((sum, p) => sum + p.revenueModel.cltv, 0) / 1000
                  )}
                  K
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveCrossSellingDashboard;
