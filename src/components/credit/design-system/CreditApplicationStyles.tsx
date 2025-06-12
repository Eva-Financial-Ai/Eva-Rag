import { cva, type VariantProps } from 'class-variance-authority';

// Professional color palette for financial applications
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
};

// Card variants for different sections
export const cardStyles = cva(
  'rounded-xl border bg-white transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-neutral-200 shadow-sm hover:shadow-md',
        elevated: 'border-neutral-200 shadow-md hover:shadow-lg',
        outlined: 'border-neutral-300 shadow-none',
        success: 'border-success-200 bg-success-50/50',
        warning: 'border-warning-200 bg-warning-50/50',
        error: 'border-error-200 bg-error-50/50',
      },
      status: {
        active: 'ring-2 ring-primary-500 ring-offset-2',
        completed: 'border-success-500 bg-success-50/30',
        error: 'border-error-500 bg-error-50/30',
        disabled: 'opacity-60 cursor-not-allowed',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Button styles
export const buttonStyles = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-500',
        outline: 'border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:ring-neutral-500',
        success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
        danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
        ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus:ring-neutral-500',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

// Input field styles
export const inputStyles = cva(
  'w-full rounded-lg border bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
        error: 'border-error-500 focus:border-error-500 focus:ring-error-500',
        success: 'border-success-500 focus:border-success-500 focus:ring-success-500',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Progress bar styles
export const progressStyles = cva(
  'relative overflow-hidden rounded-full bg-neutral-200',
  {
    variants: {
      size: {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
      },
      variant: {
        default: '',
        striped: 'progress-striped',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

// Section header styles
export const sectionHeaderStyles = cva(
  'flex items-center justify-between border-b pb-4',
  {
    variants: {
      variant: {
        default: 'border-neutral-200',
        primary: 'border-primary-200',
        success: 'border-success-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Typography styles
export const typographyStyles = {
  h1: 'text-3xl font-bold text-neutral-900',
  h2: 'text-2xl font-semibold text-neutral-900',
  h3: 'text-xl font-semibold text-neutral-800',
  h4: 'text-lg font-medium text-neutral-800',
  body: 'text-base text-neutral-700',
  small: 'text-sm text-neutral-600',
  caption: 'text-xs text-neutral-500',
  label: 'text-sm font-medium text-neutral-700',
  error: 'text-sm text-error-600',
  success: 'text-sm text-success-600',
};

// Animation classes
export const animations = {
  fadeIn: 'animate-fadeIn',
  slideIn: 'animate-slideIn',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
};

// Spacing system (8px grid)
export const spacing = {
  xs: '0.5rem', // 8px
  sm: '1rem',   // 16px
  md: '1.5rem', // 24px
  lg: '2rem',   // 32px
  xl: '3rem',   // 48px
  '2xl': '4rem', // 64px
  '3xl': '6rem', // 96px
};

// Shadow system
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

// Export type helpers
export type CardProps = VariantProps<typeof cardStyles>;
export type ButtonProps = VariantProps<typeof buttonStyles>;
export type InputProps = VariantProps<typeof inputStyles>;
export type ProgressProps = VariantProps<typeof progressStyles>;