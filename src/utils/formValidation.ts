/**
 * Form Validation Utility
 *
 * This utility provides form validation using Zod schemas
 */

import { z } from 'zod';

/**
 * Wrapper around Zod validation that provides standardized error handling
 */
export const validateForm = <T>(
  data: unknown,
  schema: z.ZodType<T>
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert Zod error format to a more usable format for form errors
      const errors: Record<string, string> = {};

      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });

      return { success: false, errors };
    }

    // If it's not a Zod error, throw it again
    throw error;
  }
};

/**
 * Common validation schemas
 */

// Email validation
export const emailSchema = z.string().email('Please enter a valid email address');

// Password validation with at least 8 characters, 1 uppercase, 1 lowercase, and 1 number
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Phone number validation (US format)
export const phoneSchema = z
  .string()
  .regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, 'Please enter a valid phone number');

// Common validation with error messages
export const commonValidators = {
  required: (field: string) => z.string().min(1, `${field} is required`),
  minLength: (field: string, length: number) =>
    z.string().min(length, `${field} must be at least ${length} characters`),
  maxLength: (field: string, length: number) =>
    z.string().max(length, `${field} must be at most ${length} characters`),
  numeric: (field: string) => z.string().regex(/^\d+$/, `${field} must contain only numbers`),
  decimal: (field: string) => z.string().regex(/^\d+(\.\d+)?$/, `${field} must be a valid number`),
  positive: (field: string) => z.number().positive(`${field} must be a positive number`),
};

// Custom hook for form validation
export const useFormValidation = () => {
  return {
    validateForm,
    validators: {
      ...commonValidators,
      email: emailSchema,
      password: passwordSchema,
      phone: phoneSchema,
    },
  };
};

/**
 * Form validation utilities
 * Consolidated from multiple components to reduce code duplication
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns Validation result
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Validates phone number format
 * @param phone - Phone number string to validate
 * @returns Validation result
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' };
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length !== 10) {
    return { isValid: false, message: 'Phone number must be 10 digits' };
  }

  return { isValid: true };
};

/**
 * Validates SSN format - must be XXX-XX-XXXX
 * @param ssn - SSN string to validate
 * @returns Validation result
 */
export const validateSSN = (ssn: string): ValidationResult => {
  if (!ssn) {
    return { isValid: false, message: 'SSN is required' };
  }

  // Check for XXX-XX-XXXX format (exactly 11 characters with dashes)
  const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
  if (!ssnRegex.test(ssn)) {
    return { isValid: false, message: 'SSN must be in XXX-XX-XXXX format' };
  }

  // Remove dashes for additional validation
  const digitsOnly = ssn.replace(/\D/g, '');

  // Check for invalid SSN patterns
  const invalidPatterns = [
    '000000000',
    '111111111',
    '222222222',
    '333333333',
    '444444444',
    '555555555',
    '666666666',
    '777777777',
    '888888888',
    '999999999',
    '123456789',
  ];

  if (invalidPatterns.includes(digitsOnly)) {
    return { isValid: false, message: 'Please enter a valid SSN' };
  }

  // Check for area number starting with 9 (invalid)
  if (digitsOnly.startsWith('9')) {
    return { isValid: false, message: 'Please enter a valid SSN' };
  }

  return { isValid: true };
};

/**
 * Validates date of birth - must be 18+ and not in future
 * @param dateString - Birth date string
 * @returns Validation result
 */
export const validateDateOfBirth = (dateString: string): ValidationResult => {
  if (!dateString) {
    return { isValid: false, message: 'Date of birth is required' };
  }

  const birthDate = new Date(dateString);
  
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, message: 'Please enter a valid date' };
  }

  const today = new Date();
  
  // Check if date is in the future
  if (birthDate > today) {
    return { isValid: false, message: 'Date of birth cannot be in the future' };
  }

  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Check minimum age requirement
  if (age < 18) {
    return { isValid: false, message: 'Must be at least 18 years old' };
  }

  return { isValid: true };
};

/**
 * Validates EIN format
 * @param ein - EIN string to validate
 * @returns Validation result
 */
export const validateEIN = (ein: string): ValidationResult => {
  if (!ein) {
    return { isValid: false, message: 'EIN is required' };
  }

  // Remove all non-digit characters
  const digitsOnly = ein.replace(/\D/g, '');

  if (digitsOnly.length !== 9) {
    return { isValid: false, message: 'EIN must be 9 digits' };
  }

  return { isValid: true };
};

/**
 * Validates required field
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @returns Validation result
 */
export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }

  return { isValid: true };
};

/**
 * Validates numeric input
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @param min - Minimum value (optional)
 * @param max - Maximum value (optional)
 * @returns Validation result
 */
export const validateNumeric = (
  value: string | number,
  fieldName: string,
  min?: number,
  max?: number
): ValidationResult => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return { isValid: false, message: `${fieldName} must be a valid number` };
  }

  if (min !== undefined && numValue < min) {
    return { isValid: false, message: `${fieldName} must be at least ${min}` };
  }

  if (max !== undefined && numValue > max) {
    return { isValid: false, message: `${fieldName} must be no more than ${max}` };
  }

  return { isValid: true };
};

/**
 * Validates percentage input (0-100)
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @returns Validation result
 */
export const validatePercentage = (value: string | number, fieldName: string): ValidationResult => {
  return validateNumeric(value, fieldName, 0, 100);
};

/**
 * Validates currency amount
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @param min - Minimum value (optional)
 * @param max - Maximum value (optional)
 * @returns Validation result
 */
export const validateCurrency = (
  value: string | number,
  fieldName: string,
  min?: number,
  max?: number
): ValidationResult => {
  // Remove currency symbols and commas
  const cleanValue = typeof value === 'string' ? value.replace(/[$,]/g, '') : value.toString();

  const result = validateNumeric(cleanValue, fieldName, min, max);

  if (!result.isValid) {
    return result;
  }

  const numValue = parseFloat(cleanValue);

  // Check for reasonable decimal places (max 2 for currency)
  if (cleanValue.includes('.')) {
    const decimalPlaces = cleanValue.split('.')[1].length;
    if (decimalPlaces > 2) {
      return { isValid: false, message: `${fieldName} cannot have more than 2 decimal places` };
    }
  }

  return { isValid: true };
};

/**
 * Validates ZIP code format
 * @param zipCode - ZIP code string to validate
 * @returns Validation result
 */
export const validateZipCode = (zipCode: string): ValidationResult => {
  if (!zipCode) {
    return { isValid: false, message: 'ZIP code is required' };
  }

  // US ZIP code patterns: 12345 or 12345-6789
  const zipRegex = /^\d{5}(-\d{4})?$/;

  if (!zipRegex.test(zipCode)) {
    return { isValid: false, message: 'Please enter a valid ZIP code (12345 or 12345-6789)' };
  }

  return { isValid: true };
};

/**
 * Validates multiple fields and returns all errors
 * @param validations - Array of validation functions to run
 * @returns Object with isValid flag and array of error messages
 */
export const validateMultiple = (
  validations: (() => ValidationResult)[]
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  validations.forEach(validation => {
    const result = validation();
    if (!result.isValid && result.message) {
      errors.push(result.message);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Formats phone number for display
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }

  return phone;
};

/**
 * Formats SSN for display
 * @param ssn - SSN string
 * @returns Formatted SSN
 */
export const formatSSN = (ssn: string): string => {
  const digitsOnly = ssn.replace(/\D/g, '');

  if (digitsOnly.length === 9) {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 5)}-${digitsOnly.slice(5)}`;
  }

  return ssn;
};

/**
 * Formats EIN for display
 * @param ein - EIN string
 * @returns Formatted EIN
 */
export const formatEIN = (ein: string): string => {
  const digitsOnly = ein.replace(/\D/g, '');

  if (digitsOnly.length === 9) {
    return `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2)}`;
  }

  return ein;
};
