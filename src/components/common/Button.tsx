import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'success'
    | 'warning'
    | 'info';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Button component with improved text contrast
 * This component ensures text is always visible against its background
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled = false,
  ...props
}) => {
  // Determine text color based on variant for proper contrast
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'success':
      case 'danger':
      case 'warning':
      case 'info':
        return 'text-white'; // White text on dark background
      case 'secondary':
      case 'outline':
      case 'ghost':
        return 'text-gray-900'; // Dark text on light background
      default:
        return 'text-gray-900';
    }
  };

  const baseClasses = `rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${getTextColor()}`;

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-white border border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
    outline:
      'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    ghost: 'bg-transparent hover:bg-gray-100 focus:ring-blue-500',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400',
    info: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
  };

  const sizeClasses = {
    small: 'py-1 px-3 text-sm',
    medium: 'py-2 px-4 text-base',
    large: 'py-3 px-6 text-lg',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const loadingClasses = isLoading ? 'relative !text-transparent' : '';
  const hasIconsClasses = leftIcon || rightIcon ? 'inline-flex items-center' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${loadingClasses} ${hasIconsClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {leftIcon && <span className="mr-2 -ml-1">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2 -mr-1">{rightIcon}</span>}
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 text-current"
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
        </span>
      )}
    </button>
  );
};

export default Button;
