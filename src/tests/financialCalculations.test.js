// Financial Calculations Test Suite
// Comprehensive tests for loan calculations, interest computations, and payment schedules
// Ensures accuracy and compliance for financial operations

import { 
  calculateLoanPayment,
  calculateInterest,
  calculateAPR,
  calculateAmortizationSchedule,
  calculateRiskScore,
  validateFinancialInputs
} from '../utils/financialCalculations';

describe('Financial Calculations', () => {
  
  describe('Loan Payment Calculations', () => {
    test('should calculate monthly payment correctly for standard loan', () => {
      const principal = 100000; // $100,000
      const annualRate = 0.05; // 5%
      const termYears = 30;
      
      const payment = calculateLoanPayment(principal, annualRate, termYears);
      
      // Expected payment: $536.82 (standard mortgage calculation)
      expect(payment).toBeCloseTo(536.82, 2);
    });

    test('should handle edge case: zero interest rate', () => {
      const principal = 100000;
      const annualRate = 0;
      const termYears = 30;
      
      const payment = calculateLoanPayment(principal, annualRate, termYears);
      
      // With 0% interest, payment should be principal / total months
      expect(payment).toBeCloseTo(100000 / (30 * 12), 2);
    });

    test('should handle short-term loans correctly', () => {
      const principal = 50000;
      const annualRate = 0.08; // 8%
      const termYears = 1;
      
      const payment = calculateLoanPayment(principal, annualRate, termYears);
      
      expect(payment).toBeCloseTo(4344.16, 2);
    });

    test('should throw error for invalid inputs', () => {
      expect(() => calculateLoanPayment(-100000, 0.05, 30)).toThrow();
      expect(() => calculateLoanPayment(100000, -0.05, 30)).toThrow();
      expect(() => calculateLoanPayment(100000, 0.05, 0)).toThrow();
    });
  });

  describe('Interest Calculations', () => {
    test('should calculate simple interest correctly', () => {
      const principal = 10000;
      const rate = 0.05;
      const time = 2; // 2 years
      
      const interest = calculateSimpleInterest(principal, rate, time);
      
      expect(interest).toBe(1000); // 10000 * 0.05 * 2
    });

    test('should calculate compound interest correctly', () => {
      const principal = 10000;
      const rate = 0.05;
      const time = 2;
      const compoundingFrequency = 12; // Monthly
      
      const interest = calculateInterest(principal, rate, time, 'compound', compoundingFrequency);
      
      // A = P(1 + r/n)^(nt) - P
      const expected = 10000 * Math.pow(1 + 0.05/12, 12*2) - 10000;
      expect(interest).toBeCloseTo(expected, 2);
    });

    test('should handle daily compounding', () => {
      const principal = 5000;
      const rate = 0.04;
      const time = 1;
      const compoundingFrequency = 365;
      
      const interest = calculateInterest(principal, rate, time, 'compound', compoundingFrequency);
      
      expect(interest).toBeGreaterThan(200); // Should be more than simple interest
      expect(interest).toBeLessThan(210); // But not too much more
    });
  });

  describe('APR Calculations', () => {
    test('should calculate APR with fees correctly', () => {
      const loanAmount = 100000;
      const interestRate = 0.05;
      const termYears = 30;
      const fees = 2000; // $2,000 in fees
      
      const apr = calculateAPR(loanAmount, interestRate, termYears, fees);
      
      // APR should be higher than interest rate due to fees
      expect(apr).toBeGreaterThan(interestRate);
      expect(apr).toBeCloseTo(0.0521, 4); // Approximately 5.21%
    });

    test('should equal interest rate when no fees', () => {
      const loanAmount = 100000;
      const interestRate = 0.05;
      const termYears = 30;
      const fees = 0;
      
      const apr = calculateAPR(loanAmount, interestRate, termYears, fees);
      
      expect(apr).toBeCloseTo(interestRate, 6);
    });
  });

  describe('Amortization Schedule', () => {
    test('should generate correct amortization schedule', () => {
      const principal = 100000;
      const annualRate = 0.06;
      const termYears = 30;
      
      const schedule = calculateAmortizationSchedule(principal, annualRate, termYears);
      
      expect(schedule).toHaveLength(360); // 30 years * 12 months
      
      // First payment
      const firstPayment = schedule[0];
      expect(firstPayment.payment).toBeCloseTo(599.55, 2);
      expect(firstPayment.interest).toBeCloseTo(500, 2); // 100000 * 0.06 / 12
      expect(firstPayment.principal).toBeCloseTo(99.55, 2);
      expect(firstPayment.balance).toBeCloseTo(99900.45, 2);
      
      // Last payment
      const lastPayment = schedule[359];
      expect(lastPayment.balance).toBeCloseTo(0, 2);
      
      // Total payments should equal principal + total interest
      const totalPayments = schedule.reduce((sum, payment) => sum + payment.payment, 0);
      expect(totalPayments).toBeCloseTo(215838.19, 2);
    });

    test('should handle extra principal payments', () => {
      const principal = 50000;
      const annualRate = 0.05;
      const termYears = 15;
      const extraPrincipal = 100; // $100 extra per month
      
      const schedule = calculateAmortizationSchedule(principal, annualRate, termYears, extraPrincipal);
      
      // Should pay off earlier than 15 years
      const finalPayment = schedule[schedule.length - 1];
      expect(schedule.length).toBeLessThan(180); // Less than 15 years
      expect(finalPayment.balance).toBeCloseTo(0, 2);
    });
  });

  describe('Risk Score Calculations', () => {
    test('should calculate risk score for low-risk borrower', () => {
      const borrowerData = {
        creditScore: 750,
        debtToIncomeRatio: 0.25,
        loanToValueRatio: 0.80,
        employmentHistory: 5, // years
        liquidAssets: 50000,
        loanAmount: 200000
      };
      
      const riskScore = calculateRiskScore(borrowerData);
      
      expect(riskScore).toBeGreaterThan(0);
      expect(riskScore).toBeLessThan(0.3); // Low risk
    });

    test('should calculate risk score for high-risk borrower', () => {
      const borrowerData = {
        creditScore: 580,
        debtToIncomeRatio: 0.45,
        loanToValueRatio: 0.95,
        employmentHistory: 0.5, // 6 months
        liquidAssets: 5000,
        loanAmount: 300000
      };
      
      const riskScore = calculateRiskScore(borrowerData);
      
      expect(riskScore).toBeGreaterThan(0.7); // High risk
      expect(riskScore).toBeLessThanOrEqual(1);
    });

    test('should handle missing data gracefully', () => {
      const borrowerData = {
        creditScore: 700,
        debtToIncomeRatio: 0.30,
        // Missing other fields
      };
      
      const riskScore = calculateRiskScore(borrowerData);
      
      expect(riskScore).toBeGreaterThan(0);
      expect(riskScore).toBeLessThanOrEqual(1);
    });
  });

  describe('Input Validation', () => {
    test('should validate loan amount', () => {
      expect(validateFinancialInputs({ loanAmount: 100000 })).toBe(true);
      expect(validateFinancialInputs({ loanAmount: -100000 })).toBe(false);
      expect(validateFinancialInputs({ loanAmount: 0 })).toBe(false);
      expect(validateFinancialInputs({ loanAmount: 'invalid' })).toBe(false);
    });

    test('should validate interest rate', () => {
      expect(validateFinancialInputs({ interestRate: 0.05 })).toBe(true);
      expect(validateFinancialInputs({ interestRate: -0.01 })).toBe(false);
      expect(validateFinancialInputs({ interestRate: 1.5 })).toBe(false); // 150% is unrealistic
    });

    test('should validate term length', () => {
      expect(validateFinancialInputs({ termYears: 30 })).toBe(true);
      expect(validateFinancialInputs({ termYears: 0 })).toBe(false);
      expect(validateFinancialInputs({ termYears: 100 })).toBe(false); // Too long
    });

    test('should validate debt-to-income ratio', () => {
      expect(validateFinancialInputs({ debtToIncomeRatio: 0.28 })).toBe(true);
      expect(validateFinancialInputs({ debtToIncomeRatio: -0.1 })).toBe(false);
      expect(validateFinancialInputs({ debtToIncomeRatio: 1.5 })).toBe(false);
    });
  });

  describe('Precision and Rounding', () => {
    test('should maintain precision in calculations', () => {
      const principal = 123456.789;
      const rate = 0.0456789;
      const term = 25.5;
      
      const payment = calculateLoanPayment(principal, rate, term);
      
      // Should be calculated to at least 2 decimal places
      expect(payment).toEqual(expect.any(Number));
      expect(payment.toString()).toMatch(/^\d+\.\d{2}$/);
    });

    test('should round monetary values correctly', () => {
      const principal = 100000;
      const rate = 0.0333333; // Repeating decimal
      const term = 30;
      
      const payment = calculateLoanPayment(principal, rate, term);
      
      // Should round to nearest cent
      expect(payment % 0.01).toBeCloseTo(0, 10);
    });
  });

  describe('Regulatory Compliance', () => {
    test('should enforce maximum loan-to-value ratio', () => {
      const loanAmount = 950000;
      const propertyValue = 1000000;
      const ltvRatio = loanAmount / propertyValue;
      
      // Most conventional loans require LTV <= 0.97
      expect(ltvRatio).toBeLessThanOrEqual(0.97);
    });

    test('should enforce maximum debt-to-income ratio', () => {
      const monthlyDebt = 3000;
      const monthlyIncome = 8000;
      const dtiRatio = monthlyDebt / monthlyIncome;
      
      // Most lenders require DTI <= 0.43
      expect(dtiRatio).toBeLessThanOrEqual(0.43);
    });

    test('should calculate TRID-compliant APR', () => {
      const loanAmount = 200000;
      const interestRate = 0.045;
      const termYears = 30;
      const fees = 3000;
      
      const apr = calculateAPR(loanAmount, interestRate, termYears, fees);
      
      // APR should be within reasonable range for TRID compliance
      expect(apr).toBeGreaterThan(interestRate);
      expect(apr - interestRate).toBeLessThan(0.01); // Difference should be reasonable
    });
  });

  describe('Performance Tests', () => {
    test('should calculate loan payment quickly', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        calculateLoanPayment(100000, 0.05, 30);
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete 1000 calculations in under 100ms
      expect(duration).toBeLessThan(100);
    });

    test('should generate amortization schedule efficiently', () => {
      const start = performance.now();
      
      calculateAmortizationSchedule(500000, 0.06, 30);
      
      const end = performance.now();
      const duration = end - start;
      
      // Should generate 360-payment schedule in under 50ms
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle very small loan amounts', () => {
      const payment = calculateLoanPayment(100, 0.05, 1);
      expect(payment).toBeGreaterThan(0);
      expect(payment).toBeLessThan(10);
    });

    test('should handle very large loan amounts', () => {
      const payment = calculateLoanPayment(10000000, 0.05, 30);
      expect(payment).toBeGreaterThan(50000);
      expect(payment).toBeLessThan(60000);
    });
    test('should handle very short terms', () => {
      const payment = calculateLoanPayment(100000, 0.05, 0.25); // 3 months
      expect(payment).toBeGreaterThan(33000);
    });

    test('should handle very long terms', () => {
      const payment = calculateLoanPayment(100000, 0.05, 50);
      expect(payment).toBeLessThan(600);
    });
  });
}); 