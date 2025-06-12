/**
 * Financial calculation utilities
 * Consolidated from multiple components to reduce code duplication
 */

export interface PaymentCalculationParams {
  principal: number;
  termMonths: number;
  annualInterestRate: number;
  downPayment?: number;
  residualPercent?: number;
}

export interface PaymentResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayments: number;
  loanAmount: number;
  residualAmount: number;
}

/**
 * Calculates monthly payment for a loan or lease
 * @param params - Payment calculation parameters
 * @returns Payment calculation results
 */
export const calculatePayment = (params: PaymentCalculationParams): PaymentResult => {
  const {
    principal,
    termMonths,
    annualInterestRate,
    downPayment = 0,
    residualPercent = 0,
  } = params;

  // Calculate loan amount after down payment and residual
  const residualAmount = principal * (residualPercent / 100);
  const loanAmount = principal - downPayment - residualAmount;

  // Convert annual interest rate to monthly
  const monthlyRate = annualInterestRate / 100 / 12;

  let monthlyPayment: number;

  // Calculate payment using the loan formula
  if (monthlyRate === 0) {
    // No interest case
    monthlyPayment = loanAmount / termMonths;
  } else {
    // Standard loan payment formula
    monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  // Round to 2 decimal places
  monthlyPayment = Math.round(monthlyPayment * 100) / 100;

  // Calculate total payments and interest
  const totalPayments = monthlyPayment * termMonths;
  const totalInterest = totalPayments - loanAmount;

  return {
    monthlyPayment,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPayments: Math.round(totalPayments * 100) / 100,
    loanAmount: Math.round(loanAmount * 100) / 100,
    residualAmount: Math.round(residualAmount * 100) / 100,
  };
};

/**
 * Simplified payment calculation (backward compatibility)
 * @param amount - Principal amount
 * @param term - Term in months
 * @param rate - Annual interest rate as percentage
 * @param downPayment - Down payment amount
 * @param residualPercent - Residual value as percentage
 * @returns Monthly payment amount
 */
export const calculateMonthlyPayment = (
  amount: number,
  term: number,
  rate: number,
  downPayment: number = 0,
  residualPercent: number = 0
): number => {
  const result = calculatePayment({
    principal: amount,
    termMonths: term,
    annualInterestRate: rate,
    downPayment,
    residualPercent,
  });

  return result.monthlyPayment;
};

/**
 * Calculate loan affordability based on monthly income and debt-to-income ratio
 * @param monthlyIncome - Gross monthly income
 * @param existingDebtPayments - Existing monthly debt payments
 * @param maxDebtToIncomeRatio - Maximum allowed debt-to-income ratio (as decimal, e.g., 0.43 for 43%)
 * @returns Maximum affordable monthly payment
 */
export const calculateAffordablePayment = (
  monthlyIncome: number,
  existingDebtPayments: number,
  maxDebtToIncomeRatio: number = 0.43
): number => {
  const maxTotalDebtPayments = monthlyIncome * maxDebtToIncomeRatio;
  const availableForNewPayment = maxTotalDebtPayments - existingDebtPayments;

  return Math.max(0, Math.round(availableForNewPayment * 100) / 100);
};

/**
 * Calculate the maximum loan amount based on affordable payment
 * @param affordablePayment - Maximum affordable monthly payment
 * @param termMonths - Loan term in months
 * @param annualInterestRate - Annual interest rate as percentage
 * @param downPayment - Available down payment
 * @param residualPercent - Residual value as percentage
 * @returns Maximum loan amount
 */
export const calculateMaxLoanAmount = (
  affordablePayment: number,
  termMonths: number,
  annualInterestRate: number,
  downPayment: number = 0,
  residualPercent: number = 0
): number => {
  const monthlyRate = annualInterestRate / 100 / 12;

  let maxLoanAmount: number;

  if (monthlyRate === 0) {
    maxLoanAmount = affordablePayment * termMonths;
  } else {
    // Reverse loan payment formula to find principal
    maxLoanAmount =
      (affordablePayment * (Math.pow(1 + monthlyRate, termMonths) - 1)) /
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths));
  }

  // Add back down payment and residual to get total asset value
  const residualAmount = maxLoanAmount * (residualPercent / 100);
  const totalAssetValue = maxLoanAmount + downPayment + residualAmount;

  return Math.round(totalAssetValue * 100) / 100;
};

/**
 * Format currency amount for display
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Calculate effective annual rate (APR) including fees
 * @param principal - Loan amount
 * @param monthlyPayment - Monthly payment amount
 * @param termMonths - Term in months
 * @param fees - Total fees and charges
 * @returns Effective annual percentage rate
 */
export const calculateAPR = (
  principal: number,
  monthlyPayment: number,
  termMonths: number,
  fees: number = 0
): number => {
  const totalPayments = monthlyPayment * termMonths;
  const totalCost = totalPayments + fees;
  const totalInterest = totalCost - principal;

  // Simple APR calculation (more complex calculations would use IRR)
  const apr = (totalInterest / principal / (termMonths / 12)) * 100;

  return Math.round(apr * 100) / 100;
};
