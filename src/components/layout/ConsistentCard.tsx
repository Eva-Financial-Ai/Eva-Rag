import React, { ReactNode } from 'react';
import clsx from 'clsx';

interface ConsistentCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  footer?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

/**
 * ConsistentCard - A standardized card component for consistent UI
 *
 * Features:
 * - Consistent padding options
 * - Standardized shadows
 * - Optional hover effects
 * - Header with title and actions
 * - Optional footer
 */
const ConsistentCard: React.FC<ConsistentCardProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  footer,
  padding = 'md',
  shadow = 'sm',
  hover = false,
  onClick,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
}) => {
  const cardClasses = clsx(
    'consistent-card bg-white rounded-lg border border-gray-200',
    // Shadow options
    shadow === 'sm' && 'shadow-sm',
    shadow === 'md' && 'shadow-md',
    shadow === 'lg' && 'shadow-lg',
    // Hover effect
    hover && 'transition-all duration-200 hover:shadow-md hover:border-gray-300',
    // Clickable state
    onClick && 'cursor-pointer',
    className
  );

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const headerPaddingClasses = {
    none: '',
    sm: 'px-4 py-3',
    md: 'px-6 py-4',
    lg: 'px-8 py-5',
  };

  const footerPaddingClasses = {
    none: '',
    sm: 'px-4 py-3',
    md: 'px-6 py-4',
    lg: 'px-8 py-5',
  };

  const hasHeader = title || subtitle || headerActions;

  return (
    <div className={cardClasses} onClick={onClick}>
      {hasHeader && (
        <div
          className={clsx(
            'consistent-card-header border-b border-gray-200',
            headerPaddingClasses[padding],
            headerClassName
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
              {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
            {headerActions && <div className="flex items-center space-x-2">{headerActions}</div>}
          </div>
        </div>
      )}

      <div
        className={clsx(
          'consistent-card-body',
          !hasHeader && !footer && paddingClasses[padding],
          hasHeader && !footer && `${paddingClasses[padding]} pt-0`,
          !hasHeader && footer && `${paddingClasses[padding]} pb-0`,
          hasHeader && footer && `${paddingClasses[padding]} py-0`,
          bodyClassName
        )}
      >
        {children}
      </div>

      {footer && (
        <div
          className={clsx(
            'consistent-card-footer border-t border-gray-200',
            footerPaddingClasses[padding],
            footerClassName
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default ConsistentCard;

/**
 * CardGrid - A wrapper component for consistent card grids
 */
interface CardGridProps {
  children: ReactNode;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns = { default: 1, sm: 2, md: 3, lg: 3 },
  gap = 'md',
  className,
}) => {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  const gridClasses = clsx(
    'grid',
    columns.default && `grid-cols-${columns.default}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    gapClasses[gap],
    className
  );

  return <div className={gridClasses}>{children}</div>;
};
