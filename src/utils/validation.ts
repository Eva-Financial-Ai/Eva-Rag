/**
 * Validation utilities for EVA Platform
 * Complies with: validate-all-financial-inputs-loan-amounts-income-dates
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Loan amount validation
export const validateLoanAmount = (amount: string | number): ValidationResult => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return { isValid: false, message: 'Invalid loan amount' };
  }

  if (numAmount <= 0) {
    return { isValid: false, message: 'Loan amount must be greater than 0' };
  }

  if (numAmount > 10000000) {
    return { isValid: false, message: 'Loan amount exceeds maximum limit of $10,000,000' };
  }

  return { isValid: true };
};

// SSN validation
export const validateSSN = (ssn: string): ValidationResult => {
  if (!ssn) {
    return { isValid: false, message: 'SSN is required' };
  }

  const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
  if (!ssnRegex.test(ssn)) {
    return { isValid: false, message: 'Invalid SSN format (XXX-XX-XXXX)' };
  }

  // Additional validation: SSN should not be all zeros or sequential
  const digitsOnly = ssn.replace(/\D/g, '');
  if (digitsOnly === '000000000' || digitsOnly === '123456789') {
    return { isValid: false, message: 'Invalid SSN' };
  }

  return { isValid: true };
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Invalid email format' };
  }

  return { isValid: true };
};

// Date validation
export const validateDate = (date: string): ValidationResult => {
  if (!date) {
    return { isValid: false, message: 'Date is required' };
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return { isValid: false, message: 'Invalid date format' };
  }

  // Check if date is not in the future
  if (parsedDate > new Date()) {
    return { isValid: false, message: 'Date cannot be in the future' };
  }

  return { isValid: true };
};

// Phone number validation
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' };
  }

  const phoneRegex = /^\+?1?\d{10,14}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, message: 'Invalid phone number format' };
  }

  return { isValid: true };
};

// EIN/Tax ID validation
export const validateEIN = (ein: string): ValidationResult => {
  if (!ein) {
    return { isValid: false, message: 'EIN is required' };
  }

  const einRegex = /^\d{2}-?\d{7}$/;
  if (!einRegex.test(ein)) {
    return { isValid: false, message: 'Invalid EIN format (XX-XXXXXXX)' };
  }

  return { isValid: true };
};

// Income validation
export const validateIncome = (income: string | number): ValidationResult => {
  const numIncome = typeof income === 'string' ? parseFloat(income) : income;

  if (isNaN(numIncome)) {
    return { isValid: false, message: 'Invalid income amount' };
  }

  if (numIncome < 0) {
    return { isValid: false, message: 'Income cannot be negative' };
  }

  if (numIncome > 1000000000) {
    return { isValid: false, message: 'Income amount seems unrealistic' };
  }

  return { isValid: true };
};

// Bank account validation
export const validateBankAccount = (account: string): ValidationResult => {
  if (!account) {
    return { isValid: false, message: 'Bank account is required' };
  }

  // Basic validation - account should be numeric and reasonable length
  const accountRegex = /^\d{4,17}$/;
  if (!accountRegex.test(account)) {
    return { isValid: false, message: 'Invalid bank account number' };
  }

  return { isValid: true };
};

// Routing number validation
export const validateRoutingNumber = (routing: string): ValidationResult => {
  if (!routing) {
    return { isValid: false, message: 'Routing number is required' };
  }

  const routingRegex = /^\d{9}$/;
  if (!routingRegex.test(routing)) {
    return { isValid: false, message: 'Routing number must be 9 digits' };
  }

  // Checksum validation for routing numbers
  const digits = routing.split('').map(Number);
  const checksum =
    (3 * (digits[0] + digits[3] + digits[6]) +
      7 * (digits[1] + digits[4] + digits[7]) +
      (digits[2] + digits[5] + digits[8])) %
    10;

  if (checksum !== 0) {
    return { isValid: false, message: 'Invalid routing number' };
  }

  return { isValid: true };
};

// Percentage validation
export const validatePercentage = (percentage: string | number): ValidationResult => {
  const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;

  if (isNaN(numPercentage)) {
    return { isValid: false, message: 'Invalid percentage' };
  }

  if (numPercentage < 0 || numPercentage > 100) {
    return { isValid: false, message: 'Percentage must be between 0 and 100' };
  }

  return { isValid: true };
};

// ZIP code validation
export const validateZipCode = (zip: string): ValidationResult => {
  if (!zip) {
    return { isValid: false, message: 'ZIP code is required' };
  }

  const zipRegex = /^\d{5}(-\d{4})?$/;
  if (!zipRegex.test(zip)) {
    return { isValid: false, message: 'Invalid ZIP code format' };
  }

  return { isValid: true };
};

// State validation
export const validateState = (state: string): ValidationResult => {
  const validStates = [
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
  ];

  if (!state) {
    return { isValid: false, message: 'State is required' };
  }

  if (!validStates.includes(state.toUpperCase())) {
    return { isValid: false, message: 'Invalid state code' };
  }

  return { isValid: true };
};

// Composite validation for forms
export const validateForm = (
  fields: Record<string, any>,
  rules: Record<string, (value: any) => ValidationResult>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.entries(rules).forEach(([field, validator]) => {
    const result = validator(fields[field]);
    if (!result.isValid && result.message) {
      errors[field] = result.message;
    }
  });

  return errors;
};

// Generic validation function for schema-based validation
export const validate = <T>(data: T, schema: any): ValidationResult => {
  // For now, return a simple validation result
  // This can be enhanced with actual schema validation logic
  if (!data) {
    return { isValid: false, message: 'Data is required' };
  }
  return { isValid: true };
};

// Common validation schemas
export const CommonSchemas = {
  email: {
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: true,
  },
  phone: {
    type: 'string',
    pattern: /^\+?1?\d{10,14}$/,
    required: true,
  },
  ssn: {
    type: 'string',
    pattern: /^\d{3}-?\d{2}-?\d{4}$/,
    required: true,
  },
  ein: {
    type: 'string',
    pattern: /^\d{2}-?\d{7}$/,
    required: true,
  },
  zipCode: {
    type: 'string',
    pattern: /^\d{5}(-\d{4})?$/,
    required: true,
  },
  state: {
    type: 'string',
    enum: [
      'AL',
      'AK',
      'AZ',
      'AR',
      'CA',
      'CO',
      'CT',
      'DE',
      'FL',
      'GA',
      'HI',
      'ID',
      'IL',
      'IN',
      'IA',
      'KS',
      'KY',
      'LA',
      'ME',
      'MD',
      'MA',
      'MI',
      'MN',
      'MS',
      'MO',
      'MT',
      'NE',
      'NV',
      'NH',
      'NJ',
      'NM',
      'NY',
      'NC',
      'ND',
      'OH',
      'OK',
      'OR',
      'PA',
      'RI',
      'SC',
      'SD',
      'TN',
      'TX',
      'UT',
      'VT',
      'VA',
      'WA',
      'WV',
      'WI',
      'WY',
    ],
    required: true,
  },
  loanAmount: {
    type: 'number',
    min: 0,
    max: 10000000,
    required: true,
  },
  percentage: {
    type: 'number',
    min: 0,
    max: 100,
    required: true,
  },
};

const validationUtils = {
  validateLoanAmount,
  validateSSN,
  validateEmail,
  validateDate,
  validatePhoneNumber,
  validateEIN,
  validateIncome,
  validateBankAccount,
  validateRoutingNumber,
  validatePercentage,
  validateZipCode,
  validateState,
  validateForm,
  validate,
  CommonSchemas,
};

export default validationUtils;
