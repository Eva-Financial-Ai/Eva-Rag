import React from 'react';

export interface BadgeProps {
  /**
   * Badge contents
   */
  children: React.ReactNode;
  /**
   * Badge variant/color scheme
   */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /**
   * Badge size
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /**
   * Optional additional className
   */
  className?: string;
  /**
   * Whether the badge is outlined instead of filled
   */
  outlined?: boolean;
  /**
   * Make the badge pill-shaped (more rounded corners)
   */
  pill?: boolean;
  /**
   * Optional icon to display before content
   */
  icon?: React.ReactNode;
  /**
   * Whether to use dark theme styling
   */
  darkMode?: boolean;
}

/**
 * Badge component for statuses, counts, and labels
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  outlined = false,
  pill = false,
  icon,
  darkMode = false,
  ...props
}: BadgeProps) => {
  // Base classes shared by all badges
  const baseClasses = 'inline-flex items-center justify-center font-medium';

  // Size-specific styling
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm',
  };

  // Border radius based on pill prop
  const radiusClasses = pill ? 'rounded-full' : 'rounded';

  // Variant-specific styling for filled badges
  const filledVariantClasses = {
    default: darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-800',
    primary: darkMode ? 'bg-secondary-700 text-white' : 'bg-secondary-500 text-white',
    success: darkMode ? 'bg-green-700 text-white' : 'bg-green-500 text-white',
    warning: darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-gray-900',
    danger: darkMode ? 'bg-error-700 text-white' : 'bg-error-500 text-white',
    info: darkMode ? 'bg-secondary-700 text-white' : 'bg-secondary-500 text-white',
  };

  // Variant-specific styling for outlined badges
  const outlinedVariantClasses = {
    default: darkMode
      ? 'bg-transparent border border-gray-600 text-gray-300'
      : 'bg-transparent border border-gray-300 text-gray-700',
    primary: darkMode
      ? 'bg-transparent border border-secondary-600 text-secondary-400'
      : 'bg-transparent border border-secondary-500 text-secondary-600',
    success: darkMode
      ? 'bg-transparent border border-green-600 text-green-400'
      : 'bg-transparent border border-green-500 text-green-600',
    warning: darkMode
      ? 'bg-transparent border border-yellow-600 text-yellow-400'
      : 'bg-transparent border border-yellow-500 text-yellow-600',
    danger: darkMode
      ? 'bg-transparent border border-error-700 text-error-400'
      : 'bg-transparent border border-error-500 text-error-600',
    info: darkMode
      ? 'bg-transparent border border-secondary-600 text-secondary-400'
      : 'bg-transparent border border-secondary-500 text-secondary-600',
  };

  // Choose between filled and outlined variant
  const variantClasses = outlined ? outlinedVariantClasses[variant] : filledVariantClasses[variant];

  // Add icon spacing if icon is present
  const iconSpacing = icon ? 'gap-1.5' : '';

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${radiusClasses} ${variantClasses} ${iconSpacing} ${className}`}
      {...props}
    >
      {icon && icon}
      {children}
    </span>
  );
};

export default Badge;
