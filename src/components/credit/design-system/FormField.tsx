import React, { ReactNode } from 'react';
import { ExclamationCircleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { inputStyles, typographyStyles } from './CreditApplicationStyles';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea';
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  helpText?: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  autoComplete?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
  prefix?: ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  helpText,
  error,
  success,
  required = false,
  disabled = false,
  readOnly = false,
  options = [],
  rows = 3,
  min,
  max,
  step,
  autoComplete,
  icon,
  suffix,
  prefix,
  className = '',
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);

  const getInputVariant = () => {
    if (error) return 'error';
    if (success) return 'success';
    return 'default';
  };

  const renderInput = () => {
    const baseInputClass = inputStyles({ 
      variant: getInputVariant(),
      className: `${prefix ? 'pl-10' : ''} ${suffix ? 'pr-10' : ''}`
    });

    switch (type) {
      case 'select':
        return (
          <div className="relative">
            <select
              name={name}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              onFocus={() => setIsFocused(true)}
              onBlurCapture={() => setIsFocused(false)}
              disabled={disabled}
              required={required}
              className={`${baseInputClass} appearance-none cursor-pointer`}
            >
              <option value="">Select an option</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        );

      case 'textarea':
        return (
          <textarea
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={() => setIsFocused(true)}
            onBlurCapture={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            rows={rows}
            className={`${baseInputClass} resize-none`}
          />
        );

      default:
        return (
          <input
            type={type}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={() => setIsFocused(true)}
            onBlurCapture={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            min={min}
            max={max}
            step={step}
            autoComplete={autoComplete}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label htmlFor={name} className={typographyStyles.label}>
          {label}
          {required && <span className="ml-1 text-error-500">*</span>}
        </label>
        {helpText && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <InformationCircleIcon className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-6 z-10 w-64 p-2 bg-neutral-900 text-white text-xs rounded-lg shadow-lg"
                >
                  {helpText}
                  <div className="absolute -top-1 right-2 w-2 h-2 bg-neutral-900 transform rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Input Container */}
      <div className="relative">
        {/* Prefix */}
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {prefix}
          </div>
        )}

        {/* Icon */}
        {icon && !prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <div className="text-neutral-400">{icon}</div>
          </div>
        )}

        {/* Input */}
        {renderInput()}

        {/* Suffix */}
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {suffix}
          </div>
        )}

        {/* Status Icons */}
        {!suffix && (error || success) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {error && <ExclamationCircleIcon className="h-5 w-5 text-error-500" />}
            {success && !error && <CheckCircleIcon className="h-5 w-5 text-success-500" />}
          </div>
        )}
      </div>

      {/* Error or Help Text */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={typographyStyles.error}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Success Message */}
      {success && !error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={typographyStyles.success}
        >
          ✓ Looks good!
        </motion.p>
      )}

      {/* Focus Line */}
      <motion.div
        className="h-0.5 bg-primary-600 rounded-full"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isFocused ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ originX: 0 }}
      />
    </div>
  );
};