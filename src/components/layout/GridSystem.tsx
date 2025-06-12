import React, { ReactNode } from 'react';
import clsx from 'clsx';

// Spacing scale based on 8px base unit
export const SPACING = {
  xs: '0.5rem', // 8px
  sm: '1rem', // 16px
  md: '1.5rem', // 24px
  lg: '2rem', // 32px
  xl: '3rem', // 48px
  '2xl': '4rem', // 64px
} as const;

type SpacingSize = keyof typeof SPACING;
type ColumnSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto' | 'full';

interface GridProps {
  children: ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: SpacingSize;
  rowGap?: SpacingSize;
  colGap?: SpacingSize;
  className?: string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

interface GridItemProps {
  children: ReactNode;
  span?: {
    default?: ColumnSpan;
    sm?: ColumnSpan;
    md?: ColumnSpan;
    lg?: ColumnSpan;
    xl?: ColumnSpan;
  };
  className?: string;
}

/**
 * Grid - A flexible 12-column grid system
 *
 * Features:
 * - 12-column grid layout
 * - Responsive column spans
 * - Standardized gap spacing
 * - Alignment and justification options
 */
export const Grid: React.FC<GridProps> = ({
  children,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  rowGap,
  colGap,
  className,
  align = 'stretch',
  justify = 'start',
}) => {
  const gridClasses = clsx(
    'grid',
    // Column configuration
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    // Alignment
    align === 'start' && 'items-start',
    align === 'center' && 'items-center',
    align === 'end' && 'items-end',
    align === 'stretch' && 'items-stretch',
    // Justification
    justify === 'start' && 'justify-start',
    justify === 'center' && 'justify-center',
    justify === 'end' && 'justify-end',
    justify === 'between' && 'justify-between',
    justify === 'around' && 'justify-around',
    justify === 'evenly' && 'justify-evenly',
    className
  );

  const gapStyle = {
    gap: gap ? SPACING[gap] : undefined,
    rowGap: rowGap ? SPACING[rowGap] : undefined,
    columnGap: colGap ? SPACING[colGap] : undefined,
  };

  return (
    <div className={gridClasses} style={gapStyle}>
      {children}
    </div>
  );
};

/**
 * GridItem - A grid item that can span multiple columns
 */
export const GridItem: React.FC<GridItemProps> = ({
  children,
  span = { default: 1 },
  className,
}) => {
  const spanClasses = clsx(
    // Default span
    span.default === 'full' && 'col-span-full',
    span.default === 'auto' && 'col-auto',
    typeof span.default === 'number' && `col-span-${span.default}`,
    // Responsive spans
    span.sm === 'full' && 'sm:col-span-full',
    span.sm === 'auto' && 'sm:col-auto',
    typeof span.sm === 'number' && `sm:col-span-${span.sm}`,
    span.md === 'full' && 'md:col-span-full',
    span.md === 'auto' && 'md:col-auto',
    typeof span.md === 'number' && `md:col-span-${span.md}`,
    span.lg === 'full' && 'lg:col-span-full',
    span.lg === 'auto' && 'lg:col-auto',
    typeof span.lg === 'number' && `lg:col-span-${span.lg}`,
    span.xl === 'full' && 'xl:col-span-full',
    span.xl === 'auto' && 'xl:col-auto',
    typeof span.xl === 'number' && `xl:col-span-${span.xl}`,
    className
  );

  return <div className={spanClasses}>{children}</div>;
};

/**
 * Container - A responsive container with max-width constraints
 */
interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  noPadding?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'xl',
  className,
  noPadding = false,
}) => {
  const containerClasses = clsx(
    'mx-auto',
    size === 'sm' && 'max-w-3xl',
    size === 'md' && 'max-w-5xl',
    size === 'lg' && 'max-w-7xl',
    size === 'xl' && 'max-w-[1440px]',
    size === 'full' && 'max-w-full',
    !noPadding && 'px-4 sm:px-6 lg:px-8',
    className
  );

  return <div className={containerClasses}>{children}</div>;
};

/**
 * Stack - A vertical stack layout with consistent spacing
 */
interface StackProps {
  children: ReactNode;
  spacing?: SpacingSize;
  className?: string;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

export const Stack: React.FC<StackProps> = ({
  children,
  spacing = 'md',
  className,
  align = 'stretch',
}) => {
  const stackClasses = clsx(
    'flex flex-col',
    align === 'start' && 'items-start',
    align === 'center' && 'items-center',
    align === 'end' && 'items-end',
    align === 'stretch' && 'items-stretch',
    className
  );

  const stackStyle = {
    gap: SPACING[spacing],
  };

  return (
    <div className={stackClasses} style={stackStyle}>
      {children}
    </div>
  );
};

/**
 * Row - A horizontal row layout with consistent spacing
 */
interface RowProps {
  children: ReactNode;
  spacing?: SpacingSize;
  className?: string;
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

export const Row: React.FC<RowProps> = ({
  children,
  spacing = 'md',
  className,
  align = 'center',
  justify = 'start',
  wrap = false,
}) => {
  const rowClasses = clsx(
    'flex',
    wrap && 'flex-wrap',
    // Alignment
    align === 'start' && 'items-start',
    align === 'center' && 'items-center',
    align === 'end' && 'items-end',
    align === 'baseline' && 'items-baseline',
    align === 'stretch' && 'items-stretch',
    // Justification
    justify === 'start' && 'justify-start',
    justify === 'center' && 'justify-center',
    justify === 'end' && 'justify-end',
    justify === 'between' && 'justify-between',
    justify === 'around' && 'justify-around',
    justify === 'evenly' && 'justify-evenly',
    className
  );

  const rowStyle = {
    gap: SPACING[spacing],
  };

  return (
    <div className={rowClasses} style={rowStyle}>
      {children}
    </div>
  );
};
