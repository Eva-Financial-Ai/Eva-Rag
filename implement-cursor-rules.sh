#!/bin/bash

# Comprehensive Implementation of Cursor Rules
# This script applies all cursor rules to specific components and pages

echo "🚀 EVA Platform - Implementing Cursor Rules"
echo "=========================================="
echo ""

# Create implementation directory
mkdir -p cursor-rules-implementation
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
IMPL_DIR="cursor-rules-implementation/impl_${TIMESTAMP}"
mkdir -p "$IMPL_DIR"

# Section 1: Critical Security Fixes
echo "🔐 Section 1: Implementing Security Fixes"
echo "----------------------------------------"

# Fix 1.1: Update components with sensitive data handling
cat > "$IMPL_DIR/01_secure_credit_application.sh" << 'SCRIPT1'
#!/bin/bash
echo "Securing CreditApplication component..."

# Update CreditApplication to use secure storage
cat > src/components/credit/SafeForms/CreditApplicationSecure.tsx << 'COMPONENT'
import React, { useState, useEffect, useCallback } from 'react';
import { encryptSensitiveData, decryptSensitiveData, maskSensitiveData, secureStorage } from '../../../utils/security';
import { auditTrailService } from '../../../services/auditTrailService';
import { validateSSN, validateEmail, validatePhoneNumber } from '../../../utils/validation';
import { calculateWithPrecision, formatCurrency } from '../../../utils/financialUtils';

interface SecureCreditApplicationProps {
  loanId: string;
  onSubmit: (data: any) => void;
}

/**
 * Secure Credit Application Component
 * Complies with:
 * - always-encrypt-pii-ssn-tax-id-bank-account-numbers
 * - add-compliance-checks-at-every-data-validation-step
 * - include-audit-trails-for-all-loan-application-state-changes
 */
const SecureCreditApplication: React.FC<SecureCreditApplicationProps> = ({ loanId, onSubmit }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    taxId: '',
    ssn: '',
    loanAmount: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Load encrypted data from secure storage
  useEffect(() => {
    const savedData = secureStorage.getItem(`credit_app_${loanId}`);
    if (savedData) {
      try {
        const decrypted = JSON.parse(savedData);
        setFormData(decrypted);
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, [loanId]);

  // Save form data securely on change
  const handleInputChange = useCallback((field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    // Save to secure storage
    secureStorage.setItem(`credit_app_${loanId}`, JSON.stringify(newData));

    // Log field change for audit
    auditTrailService.logLoanApplicationChange({
      loanId,
      field,
      action: 'field_updated',
      timestamp: new Date().toISOString(),
    });

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [formData, loanId, errors]);

  // Validate form with compliance checks
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Business name validation
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    // Tax ID validation with compliance check
    if (!formData.taxId.trim()) {
      newErrors.taxId = 'Tax ID is required';
    } else if (!/^\d{2}-?\d{7}$/.test(formData.taxId)) {
      newErrors.taxId = 'Invalid Tax ID format (XX-XXXXXXX)';
    }

    // SSN validation
    const ssnValidation = validateSSN(formData.ssn);
    if (!ssnValidation.isValid) {
      newErrors.ssn = ssnValidation.message || 'Invalid SSN';
    }

    // Loan amount validation with financial precision
    const amount = parseFloat(formData.loanAmount);
    if (isNaN(amount) || amount <= 0) {
      newErrors.loanAmount = 'Valid loan amount is required';
    } else if (amount > 10000000) {
      newErrors.loanAmount = 'Loan amount exceeds maximum limit';
    }

    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message || 'Invalid email';
    }

    // Phone validation
    const phoneValidation = validatePhoneNumber(formData.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.message || 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission with encryption
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Encrypt sensitive data before submission
      const encryptedData = {
        ...formData,
        taxId: encryptSensitiveData(formData.taxId),
        ssn: encryptSensitiveData(formData.ssn),
        loanAmount: calculateWithPrecision(parseFloat(formData.loanAmount), 2),
      };

      // Log submission for audit
      auditTrailService.logLoanApplicationChange({
        loanId,
        action: 'application_submitted',
        data: {
          businessName: formData.businessName,
          loanAmount: formatCurrency(formData.loanAmount),
        },
        timestamp: new Date().toISOString(),
      });

      // Submit encrypted data
      await onSubmit(encryptedData);

      // Clear secure storage after successful submission
      secureStorage.removeItem(`credit_app_${loanId}`);

    } catch (error) {
      console.error('Submission failed:', error);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [formData, loanId, onSubmit, validateForm]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

            {/* Business Name */}
            <div className="sm:col-span-4">
              <label htmlFor="businessName" className="block text-sm font-medium leading-6 text-gray-900">
                Business Name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                    errors.businessName ? 'ring-red-300' : 'ring-gray-300'
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                  aria-invalid={!!errors.businessName}
                  aria-describedby={errors.businessName ? 'businessName-error' : undefined}
                />
                {errors.businessName && (
                  <p className="mt-2 text-sm text-red-600" id="businessName-error">
                    {errors.businessName}
                  </p>
                )}
              </div>
            </div>

            {/* Tax ID */}
            <div className="sm:col-span-3">
              <label htmlFor="taxId" className="block text-sm font-medium leading-6 text-gray-900">
                Tax ID / EIN
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  placeholder="XX-XXXXXXX"
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                    errors.taxId ? 'ring-red-300' : 'ring-gray-300'
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                  aria-invalid={!!errors.taxId}
                  aria-describedby={errors.taxId ? 'taxId-error' : undefined}
                />
                {errors.taxId && (
                  <p className="mt-2 text-sm text-red-600" id="taxId-error">
                    {errors.taxId}
                  </p>
                )}
              </div>
            </div>

            {/* SSN */}
            <div className="sm:col-span-3">
              <label htmlFor="ssn" className="block text-sm font-medium leading-6 text-gray-900">
                SSN (Owner)
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="ssn"
                  value={maskSensitiveData(formData.ssn, 'ssn')}
                  onChange={(e) => handleInputChange('ssn', e.target.value)}
                  placeholder="XXX-XX-XXXX"
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                    errors.ssn ? 'ring-red-300' : 'ring-gray-300'
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                  aria-invalid={!!errors.ssn}
                  aria-describedby={errors.ssn ? 'ssn-error' : undefined}
                />
                {errors.ssn && (
                  <p className="mt-2 text-sm text-red-600" id="ssn-error">
                    {errors.ssn}
                  </p>
                )}
              </div>
            </div>

            {/* Loan Amount */}
            <div className="sm:col-span-3">
              <label htmlFor="loanAmount" className="block text-sm font-medium leading-6 text-gray-900">
                Loan Amount
              </label>
              <div className="mt-2">
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="text"
                    id="loanAmount"
                    value={formData.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                    className={`block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ${
                      errors.loanAmount ? 'ring-red-300' : 'ring-gray-300'
                    } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                    placeholder="0.00"
                    aria-invalid={!!errors.loanAmount}
                    aria-describedby={errors.loanAmount ? 'loanAmount-error' : undefined}
                  />
                </div>
                {errors.loanAmount && (
                  <p className="mt-2 text-sm text-red-600" id="loanAmount-error">
                    {errors.loanAmount}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                    errors.email ? 'ring-red-300' : 'ring-gray-300'
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">
                Phone
              </label>
              <div className="mt-2">
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                    errors.phone ? 'ring-red-300' : 'ring-gray-300'
                  } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600" id="phone-error">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          {errors.submit && (
            <p className="text-sm text-red-600">{errors.submit}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SecureCreditApplication;
COMPONENT

echo "✅ Credit Application secured"
SCRIPT1

# Fix 1.2: Create validation utilities
cat > "$IMPL_DIR/02_create_validation_utils.sh" << 'SCRIPT2'
#!/bin/bash
echo "Creating comprehensive validation utilities..."

cat > src/utils/validation.ts << 'VALIDATION'
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
  const checksum = (3 * (digits[0] + digits[3] + digits[6]) +
                   7 * (digits[1] + digits[4] + digits[7]) +
                   (digits[2] + digits[5] + digits[8])) % 10;

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
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
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
export const validateForm = (fields: Record<string, any>, rules: Record<string, (value: any) => ValidationResult>): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.entries(rules).forEach(([field, validator]) => {
    const result = validator(fields[field]);
    if (!result.isValid && result.message) {
      errors[field] = result.message;
    }
  });

  return errors;
};

export default {
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
};
VALIDATION

echo "✅ Validation utilities created"
SCRIPT2

# Section 2: Financial Calculations Implementation
echo -e "\n💰 Section 2: Implementing Financial Calculations"
echo "-----------------------------------------------"

cat > "$IMPL_DIR/03_enhance_financial_utils.sh" << 'SCRIPT3'
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
SCRIPT3

# Section 3: API Client Enhancement
echo -e "\n🌐 Section 3: Implementing API Client Enhancements"
echo "-------------------------------------------------"

cat > "$IMPL_DIR/04_enhance_api_client.sh" << 'SCRIPT4'
#!/bin/bash
echo "Enhancing API client with timeout and retry logic..."

cat > src/api/apiClientEnhanced.ts << 'APICLIENT'
import { auth0ApiClient } from './auth0ApiClient';
import { auditTrailService } from '../services/auditTrailService';
import { CacheManager } from '../utils/performance';

// Create cache instance
const apiCache = new CacheManager(5); // 5 minute TTL

interface ApiConfig {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  skipAuth?: boolean;
}

/**
 * Enhanced API client with comprehensive error handling
 * Complies with:
 * - add-timeout-handling-for-slow-external-apis
 * - implement-circuit-breakers-for-unreliable-third-party-services
 * - retry-logic-for-transient-api-failures
 */
class EnhancedApiClient {
  private circuitBreaker: Map<string, { failures: number; lastFailure: Date }> = new Map();
  private readonly maxFailures = 5;
  private readonly resetTimeout = 60000; // 1 minute

  async request<T>(url: string, options: RequestInit & ApiConfig = {}): Promise<T> {
    const {
      timeout = 30000,
      retries = 3,
      cache = false,
      skipAuth = false,
      ...fetchOptions
    } = options;

    // Check circuit breaker
    if (this.isCircuitOpen(url)) {
      throw new Error(`Circuit breaker open for ${url}`);
    }

    // Check cache
    if (cache && fetchOptions.method === 'GET') {
      const cached = apiCache.get(url);
      if (cached) {
        return cached as T;
      }
    }

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const startTime = Date.now();

        // Log API request
        auditTrailService.logAPIIntegration({
          endpoint: url,
          method: fetchOptions.method || 'GET',
          attempt: attempt + 1,
          timestamp: new Date().toISOString(),
        });

        // Make request
        const response = await auth0ApiClient.request({
          url,
          ...fetchOptions,
          signal: controller.signal,
        });

        // Clear timeout
        clearTimeout(timeoutId);

        // Log successful response
        auditTrailService.logAPIIntegration({
          endpoint: url,
          method: fetchOptions.method || 'GET',
          status: response.status,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        });

        // Reset circuit breaker on success
        this.circuitBreaker.delete(url);

        // Parse response
        const data = await response.json();

        // Cache if enabled
        if (cache && fetchOptions.method === 'GET') {
          apiCache.set(url, data);
        }

        return data as T;

      } catch (error: any) {
        lastError = error;

        // Handle timeout
        if (error.name === 'AbortError') {
          lastError = new Error(`Request timeout after ${timeout}ms`);
        }

        // Log failure
        auditTrailService.logAPIIntegration({
          endpoint: url,
          method: fetchOptions.method || 'GET',
          error: lastError.message,
          attempt: attempt + 1,
          timestamp: new Date().toISOString(),
        });

        // Don't retry on certain errors
        if (error.status === 401 || error.status === 403 || error.status === 404) {
          throw error;
        }

        // Wait before retry with exponential backoff
        if (attempt < retries) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // Record circuit breaker failure
    this.recordFailure(url);

    throw lastError || new Error('Request failed');
  }

  private isCircuitOpen(url: string): boolean {
    const circuit = this.circuitBreaker.get(url);
    if (!circuit) return false;

    // Check if circuit should be reset
    if (Date.now() - circuit.lastFailure.getTime() > this.resetTimeout) {
      this.circuitBreaker.delete(url);
      return false;
    }

    return circuit.failures >= this.maxFailures;
  }

  private recordFailure(url: string): void {
    const circuit = this.circuitBreaker.get(url) || { failures: 0, lastFailure: new Date() };
    circuit.failures++;
    circuit.lastFailure = new Date();
    this.circuitBreaker.set(url, circuit);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Convenience methods
  async get<T>(url: string, config?: ApiConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, data: any, config?: ApiConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });
  }

  async put<T>(url: string, data: any, config?: ApiConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });
  }

  async delete<T>(url: string, config?: ApiConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }
}

export const apiClient = new EnhancedApiClient();
export default apiClient;
APICLIENT

echo "✅ API client enhanced"
SCRIPT4

# Section 4: Accessibility Implementation
echo -e "\n♿ Section 4: Implementing Accessibility Features"
echo "-----------------------------------------------"

cat > "$IMPL_DIR/05_create_accessible_form.sh" << 'SCRIPT5'
#!/bin/bash
echo "Creating accessible form component..."

cat > src/components/common/AccessibleForm.tsx << 'FORM'
import React, { useRef, useEffect } from 'react';
import { announceToScreenReader, trapFocus } from '../../utils/accessibility';

interface AccessibleFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  description?: string;
  errors?: Record<string, string>;
}

/**
 * Accessible form component with screen reader support
 * Complies with: accessible-design-for-screen-readers-financial-forms-are-critical
 */
const AccessibleForm: React.FC<AccessibleFormProps> = ({
  children,
  onSubmit,
  title,
  description,
  errors,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // Announce errors to screen readers
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const errorCount = Object.keys(errors).length;
      const message = `Form has ${errorCount} error${errorCount > 1 ? 's' : ''}. Please review and correct.`;
      announceToScreenReader(message);

      // Focus error summary
      errorSummaryRef.current?.focus();
    }
  }, [errors]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Announce submission to screen reader
    announceToScreenReader('Form is being submitted. Please wait.');

    onSubmit(e);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-label={title}
      className="accessible-form"
    >
      <div className="form-header mb-6">
        <h2 className="text-2xl font-bold text-gray-900" id="form-title">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-gray-600" id="form-description">
            {description}
          </p>
        )}
      </div>

      {/* Error Summary */}
      {errors && Object.keys(errors).length > 0 && (
        <div
          ref={errorSummaryRef}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          tabIndex={-1}
          className="mb-6 rounded-md bg-red-50 p-4"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                There {Object.keys(errors).length === 1 ? 'is' : 'are'} {Object.keys(errors).length} error
                {Object.keys(errors).length > 1 ? 's' : ''} in this form
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul role="list" className="list-disc space-y-1 pl-5">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>
                      <a href={`#${field}`} className="underline hover:no-underline">
                        {error}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div
        role="group"
        aria-labelledby="form-title"
        aria-describedby={description ? 'form-description' : undefined}
      >
        {children}
      </div>

      {/* Skip to submit button for keyboard users */}
      <a href="#submit-button" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
        Skip to submit button
      </a>
    </form>
  );
};

export default AccessibleForm;
FORM

echo "✅ Accessible form component created"
SCRIPT5

# Section 5: Performance Optimization
echo -e "\n⚡ Section 5: Implementing Performance Optimizations"
echo "--------------------------------------------------"

cat > "$IMPL_DIR/06_optimize_large_list.sh" << 'SCRIPT6'
#!/bin/bash
echo "Creating optimized list component..."

cat > src/components/common/OptimizedList.tsx << 'LIST'
import React, { useMemo, useCallback } from 'react';
import { useVirtualScroll, useDebounce } from '../../utils/performance';

interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  searchable?: boolean;
  onItemClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
}

/**
 * Optimized list component with virtual scrolling
 * Complies with:
 * - lazy-load-document-previews-and-large-datasets
 * - paginate-loan-lists-and-search-results
 * - optimize-database-queries-with-proper-indexing
 */
function OptimizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  searchable = false,
  onItemClick,
  keyExtractor,
}: OptimizedListProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchable || !debouncedSearchTerm) return items;

    return items.filter(item => {
      const searchableText = JSON.stringify(item).toLowerCase();
      return searchableText.includes(debouncedSearchTerm.toLowerCase());
    });
  }, [items, debouncedSearchTerm, searchable]);

  // Virtual scrolling
  const { visibleItems, onScroll } = useVirtualScroll(
    filteredItems,
    itemHeight,
    containerHeight
  );

  // Memoized item renderer
  const renderMemoizedItem = useCallback(
    (item: T, index: number) => {
      const actualIndex = visibleItems.startIndex + index;
      return (
        <div
          key={keyExtractor(item)}
          style={{
            position: 'absolute',
            top: actualIndex * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
          }}
          onClick={() => onItemClick?.(item)}
          role="listitem"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onItemClick?.(item);
            }
          }}
          className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
        >
          {renderItem(item, actualIndex)}
        </div>
      );
    },
    [visibleItems.startIndex, itemHeight, onItemClick, renderItem, keyExtractor]
  );

  return (
    <div className="optimized-list">
      {searchable && (
        <div className="mb-4">
          <label htmlFor="list-search" className="sr-only">
            Search items
          </label>
          <input
            id="list-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            aria-label="Search items"
          />
        </div>
      )}

      <div
        className="relative overflow-auto border border-gray-200 rounded-md"
        style={{ height: containerHeight }}
        onScroll={onScroll}
        role="list"
        aria-label={`List of ${filteredItems.length} items`}
      >
        <div
          style={{
            height: visibleItems.totalHeight,
            position: 'relative',
          }}
        >
          {visibleItems.items.map((item, index) => renderMemoizedItem(item, index))}
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-500" aria-live="polite">
        Showing {visibleItems.items.length} of {filteredItems.length} items
      </div>
    </div>
  );
}

export default React.memo(OptimizedList);
LIST

echo "✅ Optimized list component created"
SCRIPT6

# Create master execution script
echo -e "\n📋 Creating Master Execution Script"
echo "-----------------------------------"

cat > "$IMPL_DIR/execute_implementation.sh" << 'EXECUTE'
#!/bin/bash

echo "🚀 Executing Cursor Rules Implementation"
echo "======================================="

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Execute each implementation script
for script in "$SCRIPT_DIR"/*.sh; do
    if [ -f "$script" ] && [ "$script" != "$SCRIPT_DIR/execute_implementation.sh" ]; then
        echo -e "\n▶️  Executing: $(basename "$script")"
        bash "$script"
    fi
done

echo -e "\n✅ Implementation complete!"
echo "Please run tests to verify all changes work correctly:"
echo "  npm test"
echo ""
echo "To check for any remaining issues, run:"
echo "  ./comprehensive-audit.sh"
EXECUTE

chmod +x "$IMPL_DIR"/*.sh

echo -e "\n✅ Implementation scripts generated!"
echo "📁 Scripts saved in: $IMPL_DIR"
echo ""
echo "To implement all cursor rules, run:"
echo "  $IMPL_DIR/execute_implementation.sh"
