import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * FormField Component
 * 
 * A standardized form field component that follows the design system guidelines.
 * 
 * @param {string} label - The field label
 * @param {string} name - The field name/id
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {boolean} required - Whether the field is required
 * @param {string} error - Error message to display
 * @param {string} helperText - Helper text to provide additional information
 * @param {string} placeholder - Placeholder text
 * @param {string|number} value - Current value (for controlled components)
 * @param {function} onChange - Change handler function
 * @param {boolean} disabled - Whether the field is disabled
 * @param {string} className - Additional CSS classes
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  required = false,
  error,
  helperText,
  placeholder,
  value,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-field ${className}`}>
      <label 
        htmlFor={name} 
        className={`form-label ${required ? 'form-label-required' : ''}`}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={`form-input ${error ? 'error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-describedby={`${helperText ? `${name}-helper` : ''} ${error ? `${name}-error` : ''}`}
        {...props}
      />
      {helperText && (
        <p className="form-helper-text" id={`${name}-helper`}>{helperText}</p>
      )}
      {error && (
        <p className="form-error-message" id={`${name}-error`}>{error}</p>
      )}
    </div>
  );
};

export default FormField;
