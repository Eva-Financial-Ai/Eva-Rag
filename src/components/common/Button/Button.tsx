import React from 'react';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'danger' 
  | 'warning' 
  | 'info' 
  | 'light' 
  | 'dark' 
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-success'
  | 'outline-danger'
  | 'outline-warning'
  | 'outline-info'
  | 'outline-light'
  | 'outline-dark'
  | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Button text content */
  children: React.ReactNode;
  /** Button variant/style */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Icon to display before button text */
  startIcon?: React.ReactNode;
  /** Icon to display after button text */
  endIcon?: React.ReactNode;
  /** Button loading state */
  isLoading?: boolean;
  /** Aria label for accessibility */
  ariaLabel?: string;
}

/**
 * Button Component
 * 
 * A standardized button component that follows the design system guidelines
 * with appropriate text contrast based on background colors.
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  startIcon,
  endIcon,
  isLoading = false,
  ariaLabel,
  ...props
}) => {
  const getBaseClasses = () => {
    return [
      'inline-flex items-center justify-center',
      'font-medium rounded focus:outline-none focus-visible:ring-2',
      'transition-colors duration-fast',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      fullWidth ? 'w-full' : '',
    ].join(' ');
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs py-1.5 px-3.5 min-h-[36px]';
      case 'lg':
        return 'text-base py-3.5 px-7 min-h-[58px]';
      case 'md':
      default:
        return 'text-sm py-2.5 px-5 min-h-[48px]';
    }
  };

  // Base variants with appropriate text contrast
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 hover:bg-primary-700 text-white border border-primary-600 focus-visible:ring-primary-300';
      case 'secondary':
        return 'bg-secondary-600 hover:bg-secondary-700 text-white border border-secondary-600 focus-visible:ring-secondary-300';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white border border-green-600 focus-visible:ring-green-300';
      case 'danger':
        return 'bg-error-600 hover:bg-error-700 text-white border border-error-600 focus-visible:ring-error-300';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-black border border-yellow-500 focus-visible:ring-yellow-300';
      case 'info':
        return 'bg-blue-500 hover:bg-blue-600 text-white border border-blue-500 focus-visible:ring-blue-300';
      case 'light':
        return 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 focus-visible:ring-gray-300';
      case 'dark':
        return 'bg-gray-800 hover:bg-gray-900 text-white border border-gray-800 focus-visible:ring-gray-400';
      
      // Outline variants with contrast adjustment on hover
      case 'outline-primary':
        return 'bg-transparent hover:bg-primary-600 text-primary-600 hover:text-white border border-primary-600 focus-visible:ring-primary-300';
      case 'outline-secondary':
        return 'bg-transparent hover:bg-secondary-600 text-secondary-600 hover:text-white border border-secondary-600 focus-visible:ring-secondary-300';
      case 'outline-success':
        return 'bg-transparent hover:bg-green-600 text-green-600 hover:text-white border border-green-600 focus-visible:ring-green-300';
      case 'outline-danger':
        return 'bg-transparent hover:bg-error-600 text-error-600 hover:text-white border border-error-600 focus-visible:ring-error-300';
      case 'outline-warning':
        return 'bg-transparent hover:bg-yellow-500 text-yellow-600 hover:text-black border border-yellow-500 focus-visible:ring-yellow-300';
      case 'outline-info':
        return 'bg-transparent hover:bg-blue-500 text-blue-500 hover:text-white border border-blue-500 focus-visible:ring-blue-300';
      case 'outline-light':
        return 'bg-transparent hover:bg-gray-200 text-gray-500 hover:text-gray-800 border border-gray-300 focus-visible:ring-gray-300';
      case 'outline-dark':
        return 'bg-transparent hover:bg-gray-800 text-gray-800 hover:text-white border border-gray-800 focus-visible:ring-gray-400';
      
      case 'link':
        return 'bg-transparent text-primary-600 hover:text-primary-800 hover:underline border-none focus-visible:ring-primary-300 p-0 min-h-0';
      
      default:
        return 'bg-primary-600 hover:bg-primary-700 text-white border border-primary-600 focus-visible:ring-primary-300';
    }
  };

  return (
    <button
      type={type}
      className={`${getBaseClasses()} ${getSizeClasses()} ${getVariantClasses()} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      {...props}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-5 w-5" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {startIcon && !isLoading && (
        <span className="mr-2">{startIcon}</span>
      )}
      
      {children}
      
      {endIcon && (
        <span className="ml-2">{endIcon}</span>
      )}
    </button>
  );
};

export default Button;
