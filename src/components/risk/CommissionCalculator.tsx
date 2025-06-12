import React, { useState, useMemo } from 'react';
import { RiskMapType } from './RiskMapNavigator';
import { SmartMatchResult } from '../../api/smartMatchApi';

interface CommissionCalculatorProps {
  selectedMatch?: SmartMatchResult;
  riskMapType: RiskMapType;
  transactionId: string;
}

// Define commission rate structure
const BASE_COMMISSION_RATES = {
  originator: {
    unsecured: 0.0200, // 2.00%
    equipment: 0.0175, // 1.75%
    realestate: 0.0150, // 1.50%
  },
  broker: {
    unsecured: 0.0250, // 2.50%
    equipment: 0.0225, // 2.25%
    realestate: 0.0175, // 1.75%
  }
};

// Define tier-based commission adjustments
const COMMISSION_TIERS = [
  { min: 0, max: 50000, adjustment: 0.0025 }, // +0.25% for small loans
  { min: 50000, max: 250000, adjustment: 0 }, // No adjustment for standard loans
  { min: 250000, max: 1000000, adjustment: -0.0025 }, // -0.25% for large loans
  { min: 1000000, max: Infinity, adjustment: -0.0050 } // -0.50% for very large loans
];

// Define score-based commission adjustments
const SCORE_ADJUSTMENTS = [
  { min: 90, max: 100, adjustment: 0.0025 }, // +0.25% for high-scoring matches
  { min: 80, max: 89.99, adjustment: 0 }, // No adjustment for average matches
  { min: 0, max: 79.99, adjustment: -0.0025 } // -0.25% for lower-scoring matches
];

const CommissionCalculator: React.FC<CommissionCalculatorProps> = ({
  selectedMatch,
  riskMapType,
  transactionId
}) => {
  // Commission mode is now fixed based on user's role from the TopNavbar
  // We don't need to let the user toggle it here anymore
  // Default to true for originator role (not broker)
  const originatorMode = true;
  
  const [advancedSettings, setAdvancedSettings] = useState<boolean>(false);
  const [customCommissionRate, setCustomCommissionRate] = useState<number | null>(null);

  // Calculate base commission rate based on loan type and role
  const baseRate = useMemo(() => {
    const role = originatorMode ? 'originator' : 'broker';
    return BASE_COMMISSION_RATES[role][riskMapType];
  }, [originatorMode, riskMapType]);

  // Calculate tier adjustment if we have a match
  const tierAdjustment = useMemo(() => {
    if (!selectedMatch || selectedMatch.loanAmount === undefined) return 0;
    
    const loanAmount = selectedMatch.loanAmount;
    const tier = COMMISSION_TIERS.find(t => loanAmount >= t.min && loanAmount < t.max);
    return tier ? tier.adjustment : 0;
  }, [selectedMatch]);

  // Calculate score adjustment if we have a match
  const scoreAdjustment = useMemo(() => {
    if (!selectedMatch) return 0;
    
    const score = selectedMatch.matchScore;
    const adjustment = SCORE_ADJUSTMENTS.find(a => score >= a.min && score < a.max);
    return adjustment ? adjustment.adjustment : 0;
  }, [selectedMatch]);

  // Calculate effective commission rate
  const effectiveRate = useMemo(() => {
    if (customCommissionRate !== null) return customCommissionRate;
    return Math.max(0.005, baseRate + tierAdjustment + scoreAdjustment); // Minimum 0.5%
  }, [baseRate, tierAdjustment, scoreAdjustment, customCommissionRate]);

  // Calculate commission amount
  const commissionAmount = useMemo(() => {
    if (!selectedMatch || selectedMatch.loanAmount === undefined) return 0;
    return selectedMatch.loanAmount * effectiveRate;
  }, [selectedMatch, effectiveRate]);

  // Format as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format as percentage
  const formatPercentage = (decimal: number) => {
    return (decimal * 100).toFixed(2) + '%';
  };

  if (!selectedMatch) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center text-gray-500 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="font-medium">Select a lender match to calculate potential commission</p>
        <p className="text-sm mt-2">Commission calculations will display here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border">
      <div className="p-4 border-b bg-gradient-to-r from-primary-50 to-primary-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Commission Calculator
        </h3>
        <p className="text-sm text-gray-600">
          Estimate your commission when acting as {originatorMode ? 'originator' : 'broker'} for transaction {transactionId}
        </p>
      </div>

      <div className="p-4">
        {/* Commission Calculation */}
        <div className="mt-2 pt-2">
          <div className="flex justify-between mb-3">
            <span className="text-gray-600">Loan Amount:</span>
            <span className="font-medium">{formatCurrency(selectedMatch.loanAmount || 0)}</span>
          </div>

          <div className="flex justify-between mb-3">
            <span className="text-gray-600">Base Commission Rate:</span>
            <span className="font-medium">{formatPercentage(baseRate)}</span>
          </div>

          {advancedSettings && (
            <>
              <div className="flex justify-between mb-3">
                <span className="text-gray-600">Adjustment (Loan Size):</span>
                <span className={`font-medium ${tierAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tierAdjustment >= 0 ? '+' : ''}{formatPercentage(tierAdjustment)}
                </span>
              </div>

              <div className="flex justify-between mb-3">
                <span className="text-gray-600">Adjustment (Match Score):</span>
                <span className={`font-medium ${scoreAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {scoreAdjustment >= 0 ? '+' : ''}{formatPercentage(scoreAdjustment)}
                </span>
              </div>
            </>
          )}

          {advancedSettings && (
            <div className="mb-4 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Commission Rate (Override)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  placeholder="Enter custom rate %"
                  value={customCommissionRate !== null ? (customCommissionRate * 100) : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setCustomCommissionRate(null);
                    } else {
                      setCustomCommissionRate(parseFloat(value) / 100);
                    }
                  }}
                  className="w-48 p-2 border rounded-md mr-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <span className="text-gray-500">%</span>
                {customCommissionRate !== null && (
                  <button
                    className="ml-2 text-red-600 hover:text-red-800 text-sm transition-colors"
                    onClick={() => setCustomCommissionRate(null)}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-4 pt-4 border-t">
            <span className="text-lg font-semibold text-gray-700">Effective Commission Rate:</span>
            <span className="text-lg font-bold">{formatPercentage(effectiveRate)}</span>
          </div>

          <div className="flex justify-between mt-2 mb-6">
            <span className="text-lg font-semibold text-gray-700">Estimated Commission:</span>
            <span className="text-lg font-bold text-primary-700">{formatCurrency(commissionAmount)}</span>
          </div>

          <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800 mb-4 border border-yellow-200">
            <p className="font-medium">Commission Notes:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Final commission rates are subject to lender agreement</li>
              <li>Commissions are paid upon successful funding</li>
              <li>Higher match scores typically result in faster approvals</li>
            </ul>
          </div>

          <button
            onClick={() => setAdvancedSettings(!advancedSettings)}
            className="w-full py-2 text-center text-primary-600 hover:text-primary-800 text-sm font-medium border border-primary-200 hover:bg-primary-50 rounded-md transition-colors"
          >
            {advancedSettings ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommissionCalculator; 