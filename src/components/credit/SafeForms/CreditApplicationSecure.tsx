import React, { useState, useEffect, useCallback } from 'react';
import {
  encryptSensitiveData,
  decryptSensitiveData,
  maskSensitiveData,
  secureStorage,
} from '../../../utils/security';
import { auditTrailService } from '../../../services/auditTrailService';
import { validateSSN, validateEmail, validatePhoneNumber } from '../../../utils/validation';
import { calculateWithPrecision } from '../../../utils/financialUtils';
import { formatCurrency } from '../../../utils/financialCalculations';

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
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Save to secure storage
    secureStorage.setItem(`credit_app_${loanId}`, JSON.stringify(formData));

    // Log field change for audit
    auditTrailService.logLoanApplicationChange(
      loanId,
      'draft',
      'draft',
      'user',
      { field, value: '***' } // Mask the actual value
    );

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

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
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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
        auditTrailService.logLoanApplicationChange(loanId, 'draft', 'submitted', 'user', {
          businessName: formData.businessName,
          loanAmount: formatCurrency(parseFloat(formData.loanAmount)),
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
    },
    [formData, loanId, onSubmit, validateForm]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* Business Name */}
            <div className="sm:col-span-4">
              <label
                htmlFor="businessName"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Business Name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="businessName"
                  value={formData.businessName}
                  onChange={e => handleFieldChange('businessName', e.target.value)}
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
                  onChange={e => handleFieldChange('taxId', e.target.value)}
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
                  onChange={e => handleFieldChange('ssn', e.target.value)}
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
              <label
                htmlFor="loanAmount"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
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
                    onChange={e => handleFieldChange('loanAmount', e.target.value)}
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
                  onChange={e => handleFieldChange('email', e.target.value)}
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
                  onChange={e => handleFieldChange('phone', e.target.value)}
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
          {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}
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
