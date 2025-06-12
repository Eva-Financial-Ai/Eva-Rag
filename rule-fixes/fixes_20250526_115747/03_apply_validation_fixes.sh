#!/bin/bash
echo "✔️ Applying Data Validation & Error Handling Fixes..."

# Create validation utilities if not exists
mkdir -p src/utils
cat > src/utils/validation.ts << 'VALIDATION'
/**
 * Validation utilities for EVA Platform
 * Complies with: validate-all-financial-inputs-loan-amounts-income-dates
 */

export const validateLoanAmount = (amount: string | number): boolean => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(numAmount) && numAmount > 0 && numAmount <= 10000000;
};

export const validateSSN = (ssn: string): boolean => {
  const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
  return ssnRegex.test(ssn);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateDate = (date: string): boolean => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?1?\d{10,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};
VALIDATION

echo "✅ Validation fixes applied"
