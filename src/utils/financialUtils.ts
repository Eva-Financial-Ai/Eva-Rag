/**
 * Financial Utilities
 * Complies with: always-validate-financial-calculations-with-at-least-2-decimal-precision
 */

import { auditTrailService } from '../services/auditTrailService';

/**
 * Ensures a number has exactly 2 decimal places
 */
export const toFinancialPrecision = (value: number): number => {
  return Math.round(value * 100) / 100;
};

/**
 * Calculate with specific decimal precision
 */
export const calculateWithPrecision = (value: number, decimals: number = 2): number => {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};

/**
 * Formats a number as currency with proper precision
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  const preciseAmount = toFinancialPrecision(amount);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(preciseAmount);
};

/**
 * Parses a currency string to number with validation
 */
export const parseCurrency = (value: string): number => {
  // Remove currency symbols and commas
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    throw new Error('Invalid currency value');
  }

  return toFinancialPrecision(parsed);
};

/**
 * Calculates percentage with financial precision
 */
export const calculatePercentage = (
  value: number,
  percentage: number,
  decimalPlaces: number = 2
): number => {
  const result = (value * percentage) / 100;
  const multiplier = Math.pow(10, decimalPlaces);
  return Math.round(result * multiplier) / multiplier;
};

/**
 * Calculates compound interest
 */
export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  time: number,
  compoundingFrequency: number = 12
): { total: number; interest: number } => {
  // Validate inputs
  if (principal < 0 || rate < 0 || time < 0 || compoundingFrequency < 1) {
    throw new Error('Invalid input values for compound interest calculation');
  }

  // Convert rate to decimal
  const rateDecimal = rate / 100;

  // Calculate compound interest: A = P(1 + r/n)^(nt)
  const total =
    principal * Math.pow(1 + rateDecimal / compoundingFrequency, compoundingFrequency * time);
  const interest = total - principal;

  // Log calculation for audit
  auditTrailService.logFinancialCalculation(
    'compound_interest',
    { principal, rate, time, compoundingFrequency },
    { total: toFinancialPrecision(total), interest: toFinancialPrecision(interest) },
    'system'
  );

  return {
    total: toFinancialPrecision(total),
    interest: toFinancialPrecision(interest),
  };
};

/**
 * Calculates loan payment (PMT)
 */
export const calculateLoanPayment = (
  principal: number,
  annualRate: number,
  termMonths: number
): number => {
  // Validate inputs
  if (principal <= 0 || annualRate < 0 || termMonths <= 0) {
    throw new Error('Invalid input values for loan payment calculation');
  }

  // Convert annual rate to monthly
  const monthlyRate = annualRate / 100 / 12;

  // If rate is 0, payment is simply principal divided by term
  if (monthlyRate === 0) {
    return toFinancialPrecision(principal / termMonths);
  }

  // Calculate payment using PMT formula
  const payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  // Log calculation for audit
  auditTrailService.logFinancialCalculation(
    'loan_payment',
    { principal, annualRate, termMonths },
    toFinancialPrecision(payment),
    'system'
  );

  return toFinancialPrecision(payment);
};

/**
 * Calculates amortization schedule
 */
export interface AmortizationEntry {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export const calculateAmortizationSchedule = (
  principal: number,
  annualRate: number,
  termMonths: number
): AmortizationEntry[] => {
  const monthlyPayment = calculateLoanPayment(principal, annualRate, termMonths);
  const monthlyRate = annualRate / 100 / 12;
  const schedule: AmortizationEntry[] = [];

  let balance = principal;

  for (let period = 1; period <= termMonths; period++) {
    const interestPayment = toFinancialPrecision(balance * monthlyRate);
    const principalPayment = toFinancialPrecision(monthlyPayment - interestPayment);
    balance = toFinancialPrecision(balance - principalPayment);

    // Handle rounding on final payment
    if (period === termMonths && Math.abs(balance) < 0.01) {
      balance = 0;
    }

    schedule.push({
      period,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: balance,
    });
  }

  return schedule;
};

/**
 * Validates financial calculation result
 */
export const validateFinancialResult = (result: number, expectedPrecision: number = 2): boolean => {
  const str = result.toString();
  const decimalIndex = str.indexOf('.');

  if (decimalIndex === -1) {
    return true; // No decimal places
  }

  const decimalPlaces = str.length - decimalIndex - 1;
  return decimalPlaces <= expectedPrecision;
};

/**
 * Calculates debt-to-income ratio
 */
export const calculateDebtToIncomeRatio = (
  monthlyDebtPayments: number,
  monthlyGrossIncome: number
): number => {
  if (monthlyGrossIncome <= 0) {
    throw new Error('Monthly gross income must be greater than 0');
  }

  const ratio = (monthlyDebtPayments / monthlyGrossIncome) * 100;

  // Log calculation for audit
  auditTrailService.logFinancialCalculation(
    'debt_to_income_ratio',
    { monthlyDebtPayments, monthlyGrossIncome },
    toFinancialPrecision(ratio),
    'system'
  );

  return toFinancialPrecision(ratio);
};

/**
 * Calculates loan-to-value ratio
 */
export const calculateLoanToValueRatio = (loanAmount: number, propertyValue: number): number => {
  if (propertyValue <= 0) {
    throw new Error('Property value must be greater than 0');
  }

  const ratio = (loanAmount / propertyValue) * 100;

  // Log calculation for audit
  auditTrailService.logFinancialCalculation(
    'loan_to_value_ratio',
    { loanAmount, propertyValue },
    toFinancialPrecision(ratio),
    'system'
  );

  return toFinancialPrecision(ratio);
};

/**
 * Rounds to nearest cent (0.01)
 */
export const roundToCent = (value: number): number => {
  return Math.round(value * 100) / 100;
};

/**
 * Adds multiple financial values with precision
 */
export const sumFinancialValues = (...values: number[]): number => {
  const sum = values.reduce((acc, val) => acc + val, 0);
  return toFinancialPrecision(sum);
};

/**
 * Calculates tax amount
 */
export const calculateTax = (amount: number, taxRate: number): { tax: number; total: number } => {
  const tax = toFinancialPrecision(amount * (taxRate / 100));
  const total = toFinancialPrecision(amount + tax);

  return { tax, total };
};

/**
 * Validates if a value is a valid financial amount
 */
export const isValidFinancialAmount = (value: any): boolean => {
  if (typeof value !== 'number') return false;
  if (isNaN(value) || !isFinite(value)) return false;
  if (value < 0) return false;

  // Check decimal places
  const str = value.toString();
  const decimalIndex = str.indexOf('.');
  if (decimalIndex !== -1) {
    const decimalPlaces = str.length - decimalIndex - 1;
    if (decimalPlaces > 2) return false;
  }

  return true;
};

const financialUtils = {
  toFinancialPrecision,
  formatCurrency,
  parseCurrency,
  calculatePercentage,
  calculateCompoundInterest,
  calculateLoanPayment,
  calculateAmortizationSchedule,
  validateFinancialResult,
  calculateDebtToIncomeRatio,
  calculateLoanToValueRatio,
  roundToCent,
  sumFinancialValues,
  calculateTax,
  isValidFinancialAmount,
  calculateWithPrecision,
};

export default financialUtils;

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
