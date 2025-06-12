#!/bin/bash
echo "Enhancing financial utilities..."

# Add more financial calculation functions
cat >> src/utils/financialUtils.ts << 'FINANCIAL'

/**
 * Calculate debt service coverage ratio (DSCR)
 * Complies with: always-validate-financial-calculations-with-at-least-2-decimal-precision
 */
export const calculateDSCR = (netOperatingIncome: number, totalDebtService: number): number => {
  if (totalDebtService === 0) return 0;
  return calculateWithPrecision(netOperatingIncome / totalDebtService, 2);
};

/**
 * Calculate annual percentage rate (APR)
 * Complies with: loan-calculations-use-proper-rounding-for-interest-and-payments
 */
export const calculateAPR = (
  loanAmount: number,
  monthlyPayment: number,
  loanTermMonths: number,
  fees: number = 0
): number => {
  const totalPayments = monthlyPayment * loanTermMonths;
  const totalInterest = totalPayments - loanAmount + fees;
  const apr = (totalInterest / loanAmount / (loanTermMonths / 12)) * 100;
  return calculateWithPrecision(apr, 2);
};

/**
 * Calculate break-even point
 */
export const calculateBreakEven = (
  fixedCosts: number,
  pricePerUnit: number,
  variableCostPerUnit: number
): number => {
  const contributionMargin = pricePerUnit - variableCostPerUnit;
  if (contributionMargin <= 0) return 0;
  return Math.ceil(fixedCosts / contributionMargin);
};

/**
 * Calculate return on investment (ROI)
 */
export const calculateROI = (gain: number, cost: number): number => {
  if (cost === 0) return 0;
  const roi = ((gain - cost) / cost) * 100;
  return calculateWithPrecision(roi, 2);
};

/**
 * Format percentage with proper precision
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${calculateWithPrecision(value, decimals)}%`;
};

/**
 * Calculate compound interest
 */
export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  time: number,
  compoundingFrequency: number = 12
): number => {
  const amount = principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * time);
  return calculateWithPrecision(amount - principal, 2);
};

/**
 * Validate financial calculation inputs
 * Complies with: test-edge-cases-negative-amounts-invalid-dates-missing-documents
 */
export const validateFinancialInputs = (inputs: {
  amount?: number;
  rate?: number;
  term?: number;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (inputs.amount !== undefined && (inputs.amount < 0 || isNaN(inputs.amount))) {
    errors.push('Amount must be a positive number');
  }

  if (inputs.rate !== undefined && (inputs.rate < 0 || inputs.rate > 100 || isNaN(inputs.rate))) {
    errors.push('Rate must be between 0 and 100');
  }

  if (inputs.term !== undefined && (inputs.term <= 0 || !Number.isInteger(inputs.term))) {
    errors.push('Term must be a positive integer');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
FINANCIAL

echo "✅ Financial utilities enhanced"
