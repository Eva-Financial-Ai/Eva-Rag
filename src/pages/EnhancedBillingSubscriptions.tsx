import React, { useState } from 'react';
import {
  CreditCardIcon,
  BanknotesIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ScaleIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

// Types for enhanced billing
interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number;
  features: PricingFeature[];
  popular?: boolean;
  enterprise?: boolean;
  credits: number;
  apiCallsIncluded: number;
  teamSeats: number;
  color: string;
}

interface PricingFeature {
  name: string;
  included: boolean | 'limited' | 'unlimited';
  details?: string;
  tooltip?: string;
}

interface CreditPackage {
  id: string;
  credits: number;
  pricePerCredit: number;
  totalPrice: number;
  discount: number;
  popular?: boolean;
  bonusCredits?: number;
  description: string;
}

interface ServicePricing {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  description: string;
  apiEndpoint?: string;
}

const EnhancedBillingSubscriptions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'plans' | 'credits' | 'services' | 'usage' | 'payments'
  >('plans');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<string>('professional');

  // Pricing tiers based on your document
  const pricingTiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for individual brokers getting started',
      monthlyPrice: 100,
      yearlyPrice: 1000,
      yearlyDiscount: 17,
      credits: 50,
      apiCallsIncluded: 1000,
      teamSeats: 3,
      color: 'blue',
      features: [
        { name: 'Basic Risk Scoring', included: true, details: 'General application type' },
        { name: 'Smart Match', included: 'limited', details: 'Up to 10 matches/month' },
        { name: 'KYC Verification', included: true, details: 'Person verification included' },
        { name: 'Document Storage', included: 'limited', details: '100 documents' },
        { name: 'Shield Vault', included: false },
        { name: 'Advanced Analytics', included: false },
        { name: 'API Access', included: 'limited', details: '1,000 calls/month' },
        { name: 'Priority Support', included: false },
        { name: 'Custom Integrations', included: false },
        { name: 'White Label', included: false },
      ],
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'For growing teams and established brokerages',
      monthlyPrice: 350,
      yearlyPrice: 3570,
      yearlyDiscount: 15,
      credits: 200,
      apiCallsIncluded: 5000,
      teamSeats: 10,
      color: 'purple',
      popular: true,
      features: [
        { name: 'Advanced Risk Scoring', included: true, details: 'All application types' },
        { name: 'Smart Match', included: true, details: 'Unlimited matches' },
        { name: 'Full KYC/KYB Suite', included: true, details: 'All verification types' },
        { name: 'Document Storage', included: 'unlimited', details: 'Unlimited documents' },
        { name: 'Shield Vault', included: true, details: 'Basic vault features' },
        { name: 'Advanced Analytics', included: true },
        { name: 'API Access', included: true, details: '5,000 calls/month' },
        { name: 'Priority Support', included: true },
        { name: 'Custom Integrations', included: 'limited', details: '2 integrations' },
        { name: 'White Label', included: false },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with custom needs',
      monthlyPrice: 1500,
      yearlyPrice: 15300,
      yearlyDiscount: 15,
      credits: 1000,
      apiCallsIncluded: 25000,
      teamSeats: 50,
      color: 'gold',
      enterprise: true,
      features: [
        { name: 'Premium Risk Scoring', included: true, details: 'All types + custom models' },
        { name: 'Smart Match', included: 'unlimited', details: 'Unlimited + AI insights' },
        { name: 'Full KYC/KYB Suite', included: true, details: 'All + custom compliance' },
        { name: 'Document Storage', included: 'unlimited', details: 'Unlimited + backup' },
        { name: 'Shield Vault', included: true, details: 'Advanced vault + encryption' },
        { name: 'Advanced Analytics', included: true, details: 'Custom dashboards' },
        { name: 'API Access', included: 'unlimited', details: '25,000+ calls/month' },
        { name: 'Priority Support', included: true, details: '24/7 dedicated support' },
        { name: 'Custom Integrations', included: 'unlimited', details: 'Unlimited integrations' },
        { name: 'White Label', included: true, details: 'Full white label solution' },
      ],
    },
  ];

  // Credit packages with volume discounts
  const creditPackages: CreditPackage[] = [
    {
      id: 'small',
      credits: 100,
      pricePerCredit: 3.5,
      totalPrice: 350,
      discount: 0,
      description: 'Perfect for small teams',
    },
    {
      id: 'medium',
      credits: 500,
      pricePerCredit: 3.15,
      totalPrice: 1575,
      discount: 10,
      description: 'Most popular for growing businesses',
      popular: true,
    },
    {
      id: 'large',
      credits: 1000,
      pricePerCredit: 2.8,
      totalPrice: 2800,
      discount: 20,
      bonusCredits: 100,
      description: 'Best value for high-volume users',
    },
    {
      id: 'enterprise',
      credits: 5000,
      pricePerCredit: 2.4,
      totalPrice: 12000,
      discount: 31,
      bonusCredits: 500,
      description: 'Enterprise-level volume pricing',
    },
  ];

  // Individual service pricing from your document
  const servicePricing: ServicePricing[] = [
    // Primary Broker Functions
    {
      id: 'smart_match_closed',
      name: 'Smart Match Closed',
      price: 0,
      unit: '% of credit amount',
      category: 'Primary Broker Functions',
      description: 'Variable commission based on successful matches',
    },
    {
      id: 'risk_score_general',
      name: 'Risk Score & Report/Map - General',
      price: 300,
      unit: 'per report',
      category: 'Primary Broker Functions',
      description: 'Blended Biz & Personal Credit Scores - General Application Type',
    },
    {
      id: 'risk_score_equipment',
      name: 'Risk Score & Report/Map - Equipment',
      price: 335,
      unit: 'per report',
      category: 'Primary Broker Functions',
      description: 'Equipment & Vehicles Application Type',
    },
    {
      id: 'risk_score_real_estate',
      name: 'Risk Score & Report/Map - Real Estate',
      price: 335,
      unit: 'per report',
      category: 'Primary Broker Functions',
      description: 'Real Estate Application Type',
    },
    {
      id: 'smart_match_broker',
      name: 'Smart Match Decision Tool - Broker',
      price: 45,
      unit: 'per use',
      category: 'Primary Broker Functions',
      description: 'Not using Eva Lenders',
    },
    {
      id: 'smart_match_lender',
      name: 'Smart Match Decision Tool - Lender',
      price: 36,
      unit: 'per use',
      category: 'Primary Broker Functions',
      description: 'Not using Eva Lenders',
    },
    {
      id: 'asset_tokenized',
      name: 'Per Asset Pressed and Tokenized',
      price: 150,
      unit: 'per asset',
      category: 'Primary Broker Functions',
      description: 'Blockchain tokenization service',
    },
    {
      id: 'shield_vault_lock',
      name: 'Shield Vault Transaction Document Locking',
      price: 30,
      unit: 'per transaction',
      category: 'Primary Broker Functions',
      description: 'Secure document locking service',
    },

    // LeadMap Verifications
    {
      id: 'kyb_verification',
      name: 'KYB Business Verification',
      price: 20,
      unit: 'per verification',
      category: 'LeadMap Verifications',
      description: 'Know Your Business verification',
    },
    {
      id: 'kyc_verification',
      name: 'KYC Person Verification',
      price: 7.5,
      unit: 'per verification',
      category: 'LeadMap Verifications',
      description: 'Know Your Customer verification',
    },
    {
      id: 'kyp_verification',
      name: 'KYP Property Verification',
      price: 20,
      unit: 'per verification',
      category: 'LeadMap Verifications',
      description: 'Know Your Property verification',
    },
    {
      id: 'kyd_verification',
      name: 'KYD Know Your Debtor',
      price: 117.5,
      unit: 'per verification',
      category: 'LeadMap Verifications',
      description: 'Funding Verification - Vendor - 1 3rd Party of Any Type Included',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  };

  const renderFeatureValue = (feature: PricingFeature) => {
    if (feature.included === true) {
      return <CheckIcon className="h-5 w-5 text-green-500" />;
    } else if (feature.included === false) {
      return <XMarkIcon className="h-5 w-5 text-gray-300" />;
    } else if (feature.included === 'limited') {
      return <span className="text-sm text-yellow-600 font-medium">Limited</span>;
    } else if (feature.included === 'unlimited') {
      return <span className="text-sm text-green-600 font-medium">Unlimited</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">EVA Platform Pricing & Billing</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your business. Save up to 31% with volume commitments and
            annual billing.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'plans', label: 'Subscription Plans', icon: TrophyIcon },
              { id: 'credits', label: 'Credit Packages', icon: CurrencyDollarIcon },
              { id: 'services', label: 'Individual Services', icon: ScaleIcon },
              { id: 'usage', label: 'Usage Analytics', icon: ChartBarIcon },
              { id: 'payments', label: 'Payment Methods', icon: CreditCardIcon },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-8">
            {/* Billing Toggle */}
            <div className="flex justify-center items-center space-x-4">
              <span className={billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}>
                Yearly
              </span>
              {billingCycle === 'yearly' && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  Save up to 17%
                </span>
              )}
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {pricingTiers.map(tier => (
                <div
                  key={tier.id}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                    tier.popular
                      ? 'border-purple-500 ring-4 ring-purple-100'
                      : tier.enterprise
                        ? 'border-yellow-500 ring-4 ring-yellow-100'
                        : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                        <StarIcon className="h-4 w-4 mr-1" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  {tier.enterprise && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                        <TrophyIcon className="h-4 w-4 mr-1" />
                        Enterprise
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                    <p className="text-gray-600 mb-6">{tier.description}</p>

                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatCurrency(
                            billingCycle === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice / 12
                          )}
                        </span>
                        <span className="text-gray-500 ml-1">/month</span>
                      </div>
                      {billingCycle === 'yearly' && tier.yearlyDiscount > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          Save {tier.yearlyDiscount}% with annual billing
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{tier.credits}</div>
                        <div className="text-sm text-gray-500">Credits/month</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {tier.apiCallsIncluded.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">API calls</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{tier.teamSeats}</div>
                        <div className="text-sm text-gray-500">Team seats</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTier(tier.id)}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        selectedTier === tier.id
                          ? tier.popular
                            ? 'bg-purple-600 text-white'
                            : tier.enterprise
                              ? 'bg-yellow-600 text-white'
                              : 'bg-blue-600 text-white'
                          : tier.popular
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : tier.enterprise
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {selectedTier === tier.id ? 'Current Plan' : 'Choose Plan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Comparison Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Feature Comparison</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Features
                      </th>
                      {pricingTiers.map(tier => (
                        <th
                          key={tier.id}
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {tier.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pricingTiers[0].features.map((_, featureIndex) => (
                      <tr key={featureIndex} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {pricingTiers[0].features[featureIndex].name}
                            </div>
                            {pricingTiers[0].features[featureIndex].details && (
                              <div className="text-sm text-gray-500">
                                {pricingTiers[0].features[featureIndex].details}
                              </div>
                            )}
                          </div>
                        </td>
                        {pricingTiers.map(tier => (
                          <td key={tier.id} className="px-6 py-4 whitespace-nowrap text-center">
                            {renderFeatureValue(tier.features[featureIndex])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Credits Tab */}
        {activeTab === 'credits' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Credit Packages</h2>
              <p className="text-lg text-gray-600">
                Save more with larger credit packages. Credits never expire and can be used for any
                service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {creditPackages.map(pkg => (
                <div
                  key={pkg.id}
                  className={`relative bg-white rounded-lg shadow-lg border-2 p-6 transition-all hover:shadow-xl ${
                    pkg.popular ? 'border-green-500 ring-4 ring-green-100' : 'border-gray-200'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {pkg.credits.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 mb-4">Credits</div>

                    {pkg.bonusCredits && (
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                        +{pkg.bonusCredits} Bonus Credits
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(pkg.totalPrice)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(pkg.pricePerCredit)} per credit
                      </div>
                      {pkg.discount > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          {pkg.discount}% savings
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-6">{pkg.description}</p>

                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Purchase Credits
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Credit Usage Breakdown */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">How Credits Are Used</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <ShieldCheckIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-medium">Risk Scoring</div>
                  <div className="text-sm text-gray-500">30-34 credits</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <UserGroupIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-medium">KYC/KYB</div>
                  <div className="text-sm text-gray-500">1-12 credits</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <BuildingOfficeIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-medium">Smart Match</div>
                  <div className="text-sm text-gray-500">4-5 credits</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <DocumentTextIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="font-medium">Shield Vault</div>
                  <div className="text-sm text-gray-500">3 credits</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Individual Service Pricing</h2>
              <p className="text-lg text-gray-600">
                Pay as you go for individual services. Perfect for low-volume or occasional use.
              </p>
            </div>

            {/* Service Categories */}
            {['Primary Broker Functions', 'LeadMap Verifications'].map(category => (
              <div key={category} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicePricing
                      .filter(service => service.category === category)
                      .map(service => (
                        <div
                          key={service.id}
                          className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                {service.price === 0 ? 'Variable' : formatCurrency(service.price)}
                              </div>
                              <div className="text-sm text-gray-500">{service.unit}</div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                          <button className="w-full bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-200 transition-colors">
                            Use Service
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}

            {/* API Pricing */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">API Usage Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-2">$0.10</div>
                  <div className="text-sm text-gray-500 mb-2">per API call</div>
                  <div className="text-sm font-medium">Standard Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="text-2xl font-bold text-blue-900 mb-2">$0.08</div>
                  <div className="text-sm text-gray-500 mb-2">per API call</div>
                  <div className="text-sm font-medium text-blue-700">
                    Volume Discount (10K+ calls)
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-purple-50 border-purple-200">
                  <div className="text-2xl font-bold text-purple-900 mb-2">$0.06</div>
                  <div className="text-sm text-gray-500 mb-2">per API call</div>
                  <div className="text-sm font-medium text-purple-700">
                    Enterprise Rate (100K+ calls)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Usage Analytics</h2>
              <p className="text-lg text-gray-600">
                Track your monthly usage, spending patterns, and optimization opportunities.
              </p>
            </div>

            {/* Usage Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCardIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">This Month</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(2847)}</p>
                    <p className="text-sm text-green-600">+12% from last month</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Credits Used</p>
                    <p className="text-2xl font-semibold text-gray-900">1,247</p>
                    <p className="text-sm text-gray-500">of 1,500 available</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">API Calls</p>
                    <p className="text-2xl font-semibold text-gray-900">18,432</p>
                    <p className="text-sm text-orange-500">83% of limit</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg. per Day</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(94.9)}</p>
                    <p className="text-sm text-blue-600">Trending up</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage by Service */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Usage by Service</h3>
              <div className="space-y-4">
                {[
                  { service: 'Risk Scoring & Reports', usage: 45, cost: 1350, color: 'blue' },
                  { service: 'KYC/KYB Verifications', usage: 28, cost: 756, color: 'green' },
                  { service: 'Smart Match Tools', usage: 15, cost: 405, color: 'purple' },
                  { service: 'Shield Vault Operations', usage: 8, cost: 240, color: 'orange' },
                  { service: 'API Calls', usage: 4, cost: 96, color: 'gray' },
                ].map(item => (
                  <div key={item.service} className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="w-32">
                        <div className="text-sm font-medium text-gray-900">{item.service}</div>
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="relative">
                          <div className="flex mb-1 items-center justify-between">
                            <span className="text-xs font-semibold text-gray-600">
                              {item.usage}%
                            </span>
                            <span className="text-xs font-semibold text-gray-600">
                              {formatCurrency(item.cost)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`bg-${item.color}-500 h-2 rounded-full`}
                              style={{ width: `${item.usage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimization Recommendations */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg p-6 border border-blue-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <TrophyIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    💡 Optimization Recommendations
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Switch to Annual Billing
                        </div>
                        <div className="text-sm text-gray-500">
                          Save {formatCurrency(510)} per year with annual billing
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Upgrade to Enterprise
                        </div>
                        <div className="text-sm text-gray-500">
                          Get 20% more credits for only {formatCurrency(150)} more per month
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Buy Credit Package</div>
                        <div className="text-sm text-gray-500">
                          Purchase credits in bulk to save 15-31% on individual services
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Methods</h2>
              <p className="text-lg text-gray-600">
                Manage your payment methods and integrations securely.
              </p>
            </div>

            {/* Current Payment Methods */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Your Payment Methods</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add Payment Method
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Visa Card */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-sm opacity-80">Default</div>
                      <div className="text-xl font-bold">VISA</div>
                    </div>
                    <div className="mb-6">
                      <div className="text-lg font-mono tracking-wider">•••• •••• •••• 4242</div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs opacity-80">Expires</div>
                        <div className="text-sm">12/25</div>
                      </div>
                      <div className="text-xs opacity-80">Default</div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                    <div className="w-full h-full rounded-full border-4 border-white transform translate-x-8 -translate-y-8"></div>
                  </div>
                </div>

                {/* Bank Account */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-sm opacity-80">Bank Account</div>
                      <BanknotesIcon className="h-6 w-6" />
                    </div>
                    <div className="mb-6">
                      <div className="text-lg font-mono tracking-wider">•••• •••• •••• 1234</div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs opacity-80">Chase Bank</div>
                        <div className="text-sm">Checking</div>
                      </div>
                      <div className="text-xs opacity-80">Verified</div>
                    </div>
                  </div>
                </div>

                {/* Add New Card */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center hover:border-blue-400 transition-colors cursor-pointer">
                  <div className="text-center">
                    <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm font-medium text-gray-900 mb-2">Add Payment Method</p>
                    <p className="text-xs text-gray-500">Stripe, Plaid, or Coinbase</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Integrations */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Payment Integrations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    name: 'Stripe',
                    status: 'connected',
                    color: 'blue',
                    description: 'Credit card processing',
                  },
                  {
                    name: 'Plaid',
                    status: 'connected',
                    color: 'green',
                    description: 'Bank account verification',
                  },
                  {
                    name: 'Coinbase',
                    status: 'setup_required',
                    color: 'orange',
                    description: 'Cryptocurrency payments',
                  },
                  {
                    name: 'QuickBooks',
                    status: 'connected',
                    color: 'blue',
                    description: 'Accounting integration',
                  },
                ].map(integration => (
                  <div
                    key={integration.name}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-10 h-10 bg-${integration.color}-100 rounded-full flex items-center justify-center`}
                      >
                        <span className={`text-${integration.color}-600 font-bold text-sm`}>
                          {integration.name.charAt(0)}
                        </span>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          integration.status === 'connected'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {integration.status === 'connected' ? 'Connected' : 'Setup Required'}
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{integration.name}</h4>
                    <p className="text-sm text-gray-500 mb-3">{integration.description}</p>
                    <button
                      className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                        integration.status === 'connected'
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {integration.status === 'connected' ? 'Manage' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      {
                        date: '2024-01-15',
                        description: 'Professional Plan - January 2024',
                        amount: 350,
                        status: 'paid',
                        method: 'Visa ••••4242',
                      },
                      {
                        date: '2024-01-10',
                        description: 'Credit Package - 500 Credits',
                        amount: 1575,
                        status: 'paid',
                        method: 'Bank ••••1234',
                      },
                      {
                        date: '2024-01-08',
                        description: 'Risk Scoring Services',
                        amount: 900,
                        status: 'paid',
                        method: 'Visa ••••4242',
                      },
                    ].map((transaction, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.method}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedBillingSubscriptions;
