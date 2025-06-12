import React, { useEffect, useState } from 'react';
import { RiskConfigType, useRiskConfig } from '../../contexts/RiskConfigContext';
import RiskRangesConfigEditor, { DEFAULT_RANGES, RiskRange } from './RiskRangesConfigEditor';
import { mapLoanTypeToConfigType } from './RiskScoringModel';

import { debugLog } from '../../utils/auditLogger';

// Type definitions
export type LoanType = 'general' | 'equipment' | 'realestate';
type RiskScoringCategory =
  | 'creditworthiness'
  | 'financial'
  | 'cashflow'
  | 'legal'
  | 'equipment'
  | 'property'
  | 'guarantors';

// Define a type for mock config when the real one isn't available
interface RiskConfig {
  categoryWeights?: Record<string, number>;
  [key: string]: any;
}

interface ConfiguratorProps {
  loanType: LoanType;
  onLoanTypeChange?: (type: LoanType) => void;
  expanded?: boolean; // Add prop to control expanded state
}

const RiskLabConfigurator: React.FC<ConfiguratorProps> = ({
  loanType: initialLoanType = 'general',
  onLoanTypeChange,
  expanded = true, // Default to expanded
}) => {
  // Get the context
  const riskContext = useRiskConfig();
  const [loanType, setLoanType] = useState<LoanType>(initialLoanType);

  // State for configurator values
  const [activeCategory, setActiveCategory] = useState<RiskScoringCategory>('creditworthiness');
  const [recalculate, setRecalculate] = useState<boolean>(true);
  const [activeSlider, setActiveSlider] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(expanded);

  // Update expanded state when prop changes
  useEffect(() => {
    setIsExpanded(expanded);
  }, [expanded]);

  // State for credit score ranges
  const [creditRanges, setCreditRanges] = useState({
    positive: 850,
    average: 719,
    negative: 649,
  });

  // State for payment history options
  const [paymentOptions, setPaymentOptions] = useState({
    positive: 'No Missed payment',
    average: '1-2 Missed payment',
    negative: '3+ Missed payment',
  });

  // State for weight distribution
  const [categoryWeights, setCategoryWeights] = useState({
    creditworthiness: 40,
    financial: 20,
    cashflow: 20,
    legal: 20,
    equipment: initialLoanType === 'equipment' ? 20 : 0,
    property: initialLoanType === 'realestate' ? 20 : 0,
    guarantors: 0,
  });

  // State for custom ranges configuration
  const [customRanges, setCustomRanges] = useState<{ [key: string]: RiskRange[] }>({
    creditworthiness: [...DEFAULT_RANGES.creditworthiness.metrics],
    financial: [...DEFAULT_RANGES.financial.metrics],
    cashflow: [...DEFAULT_RANGES.cashflow.metrics],
    legal: [...DEFAULT_RANGES.legal.metrics],
    equipment: [...DEFAULT_RANGES.equipment.metrics],
    property: [...DEFAULT_RANGES.property.metrics],
  });

  // Get title based on loan type
  const getTitle = () => {
    switch (loanType) {
      case 'equipment':
        return 'For Equipment & Vehicles Credit App';
      case 'realestate':
        return 'For Real Estate Credit App';
      default:
        return 'General';
    }
  };

  // Update weights when loan type changes
  useEffect(() => {
    debugLog('general', 'log_statement', `RiskLabConfigurator: Loan type changed to ${loanType}`)

    // For this demo, we'll implement a mock loader function
    const getMockConfig = (type: LoanType): RiskConfig => {
      // These are default values based on loan type
      return {
        categoryWeights: {
          creditworthiness: type === 'general' ? 40 : 40,
          financial: type === 'general' ? 20 : 15,
          cashflow: type === 'general' ? 20 : 15,
          legal: type === 'general' ? 20 : 10,
          equipment: type === 'equipment' ? 20 : 0,
          property: type === 'realestate' ? 20 : 0,
          guarantors: 0,
        },
      };
    };

    // Get configuration from our mock (avoids type issues with the real context)
    const config = getMockConfig(loanType);

    // Apply the config
    if (config.categoryWeights) {
      setCategoryWeights(prev => ({
        ...prev,
        ...config.categoryWeights,
      }));
    }

    // Adjust weights based on loan type
    setCategoryWeights(prev => {
      const updatedWeights = { ...prev };

      // Reset specialized categories
      updatedWeights.equipment = 0;
      updatedWeights.property = 0;

      // Adjust based on loan type
      if (loanType === 'equipment') {
        // For equipment loans: reduce other categories to make room for equipment
        const reductionPerCategory = 20 / 3; // 20% total reduction spread across 3 categories
        updatedWeights.financial = Math.max(0, prev.financial - reductionPerCategory);
        updatedWeights.cashflow = Math.max(0, prev.cashflow - reductionPerCategory);
        updatedWeights.legal = Math.max(0, prev.legal - reductionPerCategory);
        updatedWeights.equipment = 20;
      } else if (loanType === 'realestate') {
        // For real estate loans: reduce other categories to make room for property
        const reductionPerCategory = 20 / 3; // 20% total reduction spread across 3 categories
        updatedWeights.financial = Math.max(0, prev.financial - reductionPerCategory);
        updatedWeights.cashflow = Math.max(0, prev.cashflow - reductionPerCategory);
        updatedWeights.legal = Math.max(0, prev.legal - reductionPerCategory);
        updatedWeights.property = 20;
      } else {
        // For general loans: distribute evenly among the 4 main categories
        updatedWeights.creditworthiness = 40;
        updatedWeights.financial = 20;
        updatedWeights.cashflow = 20;
        updatedWeights.legal = 20;
      }

      return updatedWeights;
    });

    // Set the active category to the most relevant one for the loan type
    if (loanType === 'equipment') {
      setActiveCategory('equipment');
    } else if (loanType === 'realestate') {
      setActiveCategory('property');
    } else {
      setActiveCategory('creditworthiness');
    }

    // Update risk config context with the appropriate config type
    const configType = mapLoanTypeToConfigType(loanType);
    riskContext.loadConfigForType(configType as RiskConfigType);
  }, [loanType, riskContext]);

  // Function to check if total weights equal 100%
  const checkTotalWeights = (): boolean => {
    const total = Object.values(categoryWeights).reduce((sum, weight) => sum + weight, 0);
    return total === 100;
  };

  // Handle weight slider changes
  const handleWeightChange = (category: RiskScoringCategory, newValue: number) => {
    setActiveSlider(category);

    // Calculate the difference to distribute
    const difference = newValue - categoryWeights[category];

    setCategoryWeights(prev => {
      const updated = { ...prev, [category]: newValue };

      // Get categories that can be adjusted (non-zero weights excluding the active one)
      const adjustableCategories = Object.entries(prev)
        .filter(([key, value]) => key !== category && value > 0)
        .map(([key]) => key as RiskScoringCategory);

      if (adjustableCategories.length === 0) return updated;

      // Distribute the difference proportionally
      const totalAdjustableWeight = adjustableCategories.reduce((sum, key) => sum + prev[key], 0);

      adjustableCategories.forEach(key => {
        const proportion = prev[key] / totalAdjustableWeight;
        updated[key] = Math.max(0, Math.round(prev[key] - difference * proportion));
      });

      // Ensure the total is exactly 100%
      const currentTotal = Object.values(updated).reduce((sum, val) => sum + val, 0);
      if (currentTotal !== 100) {
        // Find the largest category (excluding active) to adjust
        const largestCategory = adjustableCategories.reduce(
          (largest, key) => (updated[key] > updated[largest] ? key : largest),
          adjustableCategories[0],
        );
        updated[largestCategory] += 100 - currentTotal;
      }

      return updated;
    });
  };

  // Handle custom ranges changes
  const handleRangesChange = (category: RiskScoringCategory, ranges: RiskRange[]) => {
    setCustomRanges(prev => ({
      ...prev,
      [category]: ranges,
    }));
  };

  // Function to handle credit range changes
  const handleCreditRangeChange = (type: 'positive' | 'average' | 'negative', value: number) => {
    setCreditRanges(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  // Function to handle payment option changes
  const handlePaymentOptionChange = (type: 'positive' | 'average' | 'negative', value: string) => {
    setPaymentOptions(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  // Handle loan type change
  const handleLoanTypeChange = (type: LoanType) => {
    setLoanType(type);
    onLoanTypeChange?.(type);
  };

  // Get the total weight
  const getTotalWeight = () => {
    return Object.values(categoryWeights).reduce((sum, weight) => sum + weight, 0);
  };

  // Calculate if weights are valid (total 100%)
  const areWeightsValid = () => {
    return getTotalWeight() === 100;
  };

  // Handle saving the configuration
  const handleSaveConfig = () => {
    // Show the paywall modal to purchase credits
    setShowPaywall(true);
  };

  // Update the credit score input fields
  const renderCreditRangeInputs = () => {
    return (
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-xs text-gray-500">POSITIVE</label>
          <input
            type="number"
            value={creditRanges.positive}
            onChange={e => handleCreditRangeChange('positive', parseInt(e.target.value))}
            className="w-full rounded border border-gray-300 p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">AVERAGE</label>
          <input
            type="number"
            value={creditRanges.average}
            onChange={e => handleCreditRangeChange('average', parseInt(e.target.value))}
            className="w-full rounded border border-gray-300 p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">NEGATIVE</label>
          <input
            type="number"
            value={creditRanges.negative}
            onChange={e => handleCreditRangeChange('negative', parseInt(e.target.value))}
            className="w-full rounded border border-gray-300 p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    );
  };

  // Render payment option inputs
  const renderPaymentOptions = () => {
    return (
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-xs text-gray-500">POSITIVE</label>
          <input
            type="text"
            value={paymentOptions.positive}
            onChange={e => handlePaymentOptionChange('positive', e.target.value)}
            className="w-full rounded border border-gray-300 p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">AVERAGE</label>
          <input
            type="text"
            value={paymentOptions.average}
            onChange={e => handlePaymentOptionChange('average', e.target.value)}
            className="w-full rounded border border-gray-300 p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">NEGATIVE</label>
          <input
            type="text"
            value={paymentOptions.negative}
            onChange={e => handlePaymentOptionChange('negative', e.target.value)}
            className="w-full rounded border border-gray-300 p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    );
  };

  // Get the tab text for loan type selection
  const getLoanTypeTabText = (type: LoanType) => {
    switch (type) {
      case 'equipment':
        return 'Equipment & Vehicles';
      case 'realestate':
        return 'Real Estate';
      default:
        return 'General';
    }
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-lg">
      {/* Header with tabs for loan type selection */}
      <div className="flex border-b border-gray-200">
        {['general', 'realestate', 'equipment'].map(type => (
          <button
            key={type}
            data-loan-type={type}
            className={`flex-1 px-4 py-3 text-center font-medium ${
              loanType === type
                ? 'border-b-2 border-blue-500 bg-blue-50 text-blue-700'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
            onClick={() => handleLoanTypeChange(type as LoanType)}
          >
            {getLoanTypeTabText(type as LoanType)}
          </button>
        ))}
      </div>

      {/* Main content area */}
      <div className="p-4">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Risk Lab Configurator for {getLoanTypeTabText(loanType)}
        </h2>

        {/* Category tabs */}
        <div className="mb-6 flex flex-wrap border-b border-gray-200">
          {Object.entries(categoryWeights)
            .filter(([_, weight]) => weight > 0)
            .map(([category]) => (
              <button
                key={category}
                className={`mr-2 border-b-2 px-4 py-2 text-sm font-medium ${
                  activeCategory === category
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
                onClick={() => setActiveCategory(category as RiskScoringCategory)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
        </div>

        {/* Weight distribution sliders */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Weight Distribution</h3>
          <p className="mb-4 text-sm text-gray-500">
            Adjust the importance of each category in the overall risk assessment. Total must equal
            100%.
          </p>

          <div className="space-y-4">
            {Object.entries(categoryWeights)
              .filter(([_, weight]) => weight > 0)
              .map(([category, weight]) => (
                <div key={category} className="flex items-center">
                  <div className="w-40 text-sm font-medium text-gray-700">
                    {category.charAt(0).toUpperCase() + category.slice(1)}:
                  </div>
                  <div className="mx-4 flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weight}
                      onChange={e =>
                        handleWeightChange(
                          category as RiskScoringCategory,
                          parseInt(e.target.value),
                        )
                      }
                      className={`w-full ${activeSlider === category ? 'accent-blue-600' : ''}`}
                    />
                  </div>
                  <div className="w-16 text-center">
                    <span
                      className={`font-semibold ${
                        activeSlider === category ? 'text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {weight}%
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {/* Validation message */}
          <div className={`mt-2 text-sm ${areWeightsValid() ? 'text-green-600' : 'text-red-600'}`}>
            {areWeightsValid()
              ? '✓ Valid configuration (100%)'
              : `⚠ Total must equal 100% (current: ${getTotalWeight()}%)`}
          </div>
        </div>

        {/* Range configuration for the selected category */}
        <div className="mt-6">
          <RiskRangesConfigEditor
            category={activeCategory}
            initialRanges={customRanges[activeCategory]}
            onChange={ranges => handleRangesChange(activeCategory, ranges)}
          />
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSaveConfig}
            disabled={!areWeightsValid()}
            className={`rounded-md px-4 py-2 font-medium ${
              areWeightsValid()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'cursor-not-allowed bg-gray-300 text-gray-500'
            }`}
          >
            Save Configuration & Run Assessment
          </button>
        </div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-md bg-white p-6">
            <h3 className="mb-4 text-lg font-medium">Purchase Report Credits</h3>
            <p className="mb-6 text-gray-600">
              To run this risk assessment with your custom configuration, you need to purchase
              credits.
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setShowPaywall(false)}
                className="mr-2 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // In a real app, this would integrate with the PaywallModal component
                  setShowPaywall(false);
                  alert('Redirecting to payment screen...');
                }}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Purchase Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskLabConfigurator;
