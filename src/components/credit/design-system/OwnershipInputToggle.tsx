import React, { useState, useEffect } from 'react';
import { CalculatorIcon, HashtagIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { inputStyles, buttonStyles, typographyStyles } from './CreditApplicationStyles';

interface OwnershipInputToggleProps {
  mode: 'shares' | 'percentage';
  onModeChange: (mode: 'shares' | 'percentage') => void;
  value: number;
  onChange: (value: number) => void;
  totalShares?: number;
  onTotalSharesChange?: (total: number) => void;
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const OwnershipInputToggle: React.FC<OwnershipInputToggleProps> = ({
  mode,
  onModeChange,
  value,
  onChange,
  totalShares = 1000,
  onTotalSharesChange,
  label = 'Ownership',
  helpText,
  error,
  required = false,
  disabled = false,
}) => {
  const [calculatedValue, setCalculatedValue] = useState(value);
  const [showTotalSharesInput, setShowTotalSharesInput] = useState(false);

  // Calculate conversions between shares and percentage
  useEffect(() => {
    if (mode === 'percentage') {
      setCalculatedValue(value);
    } else {
      // Convert shares to percentage
      const percentage = totalShares > 0 ? (value / totalShares) * 100 : 0;
      setCalculatedValue(Math.round(percentage * 100) / 100);
    }
  }, [mode, value, totalShares]);

  const handleValueChange = (newValue: number) => {
    if (mode === 'percentage') {
      // Ensure percentage is between 0 and 100
      const clampedValue = Math.max(0, Math.min(100, newValue));
      onChange(clampedValue);
    } else {
      // For shares, ensure non-negative
      const clampedValue = Math.max(0, newValue);
      onChange(clampedValue);
    }
  };

  const handleModeToggle = (newMode: 'shares' | 'percentage') => {
    if (newMode === mode) return;

    // Convert current value to new mode
    if (newMode === 'percentage' && mode === 'shares') {
      // Convert shares to percentage
      const percentage = totalShares > 0 ? (value / totalShares) * 100 : 0;
      onChange(Math.round(percentage * 100) / 100);
    } else if (newMode === 'shares' && mode === 'percentage') {
      // Convert percentage to shares
      const shares = Math.round((value / 100) * totalShares);
      onChange(shares);
    }

    onModeChange(newMode);
  };

  return (
    <div className="space-y-4">
      {/* Label and Toggle */}
      <div className="flex items-center justify-between">
        <label className={`${typographyStyles.label} ${required ? 'after:content-["*"] after:ml-0.5 after:text-error-500' : ''}`}>
          {label}
        </label>
        
        <div className="flex items-center space-x-2">
          <span className={typographyStyles.small}>Input as:</span>
          <div className="flex rounded-lg border border-neutral-300 overflow-hidden">
            <button
              type="button"
              onClick={() => handleModeToggle('shares')}
              disabled={disabled}
              className={`
                px-3 py-1.5 text-sm font-medium transition-all duration-200
                ${mode === 'shares' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-neutral-700 hover:bg-neutral-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center space-x-1">
                <HashtagIcon className="h-4 w-4" />
                <span>Shares</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleModeToggle('percentage')}
              disabled={disabled}
              className={`
                px-3 py-1.5 text-sm font-medium transition-all duration-200
                ${mode === 'percentage' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-neutral-700 hover:bg-neutral-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center space-x-1">
                <CalculatorIcon className="h-4 w-4" />
                <span>Percent</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Input Fields */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {mode === 'percentage' ? (
            <div className="relative">
              <input
                type="number"
                value={value}
                onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
                disabled={disabled}
                min="0"
                max="100"
                step="0.01"
                className={inputStyles({ 
                  variant: error ? 'error' : 'default',
                  className: 'pr-12'
                })}
                placeholder="Enter percentage"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-neutral-500 font-medium">%</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleValueChange(parseInt(e.target.value) || 0)}
                  disabled={disabled}
                  min="0"
                  className={inputStyles({ 
                    variant: error ? 'error' : 'default',
                    className: 'pr-20'
                  })}
                  placeholder="Enter number of shares"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-neutral-500 font-medium">shares</span>
                </div>
              </div>

              {/* Total Shares Configuration */}
              <div className="flex items-center space-x-2">
                <span className={typographyStyles.small}>
                  Total shares: {totalShares.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => setShowTotalSharesInput(!showTotalSharesInput)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  {showTotalSharesInput ? 'Cancel' : 'Change'}
                </button>
              </div>

              {showTotalSharesInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="number"
                    value={totalShares}
                    onChange={(e) => onTotalSharesChange?.(parseInt(e.target.value) || 1)}
                    min="1"
                    className={inputStyles({ size: 'sm' })}
                    placeholder="Total shares"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTotalSharesInput(false)}
                    className={buttonStyles({ variant: 'primary', size: 'sm' })}
                  >
                    Update
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Display Calculation */}
      <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
        <span className={typographyStyles.small}>
          {mode === 'shares' ? 'Percentage' : 'Shares'} equivalent:
        </span>
        <span className="font-medium text-neutral-900">
          {mode === 'shares' 
            ? `${calculatedValue}%` 
            : `${Math.round((value / 100) * totalShares).toLocaleString()} shares`
          }
        </span>
      </div>

      {/* Help Text or Error */}
      {error ? (
        <p className={typographyStyles.error}>{error}</p>
      ) : helpText ? (
        <p className={typographyStyles.small}>{helpText}</p>
      ) : null}
    </div>
  );
};