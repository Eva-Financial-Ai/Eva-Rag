import React from 'react';

export interface ButtonGroupProps {
  /** Buttons to display in the group */
  children: React.ReactNode;
  /** Orientation of the button group */
  orientation?: 'horizontal' | 'vertical';
  /** Spacing between buttons */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Alignment of buttons */
  alignment?: 'start' | 'center' | 'end' | 'between' | 'around';
  /** Additional CSS classes */
  className?: string;
}

/**
 * ButtonGroup Component
 * 
 * A container for grouping related buttons with consistent spacing and alignment.
 */
const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  spacing = 'md',
  alignment = 'start',
  className = '',
}) => {
  const getFlexDirection = () => {
    return orientation === 'vertical' ? 'flex-col' : 'flex-row';
  };

  const getSpacingClasses = () => {
    if (spacing === 'none') return '';
    
    if (orientation === 'vertical') {
      switch (spacing) {
        case 'sm': return 'space-y-2';
        case 'lg': return 'space-y-4';
        case 'md':
        default: return 'space-y-3';
      }
    } else {
      switch (spacing) {
        case 'sm': return 'space-x-2';
        case 'lg': return 'space-x-4';
        case 'md':
        default: return 'space-x-3';
      }
    }
  };

  const getAlignmentClasses = () => {
    if (orientation === 'vertical') {
      switch (alignment) {
        case 'center': return 'items-center';
        case 'end': return 'items-end';
        case 'between': return 'items-stretch';
        case 'around': return 'items-stretch';
        case 'start':
        default: return 'items-start';
      }
    } else {
      switch (alignment) {
        case 'center': return 'justify-center';
        case 'end': return 'justify-end';
        case 'between': return 'justify-between';
        case 'around': return 'justify-around';
        case 'start':
        default: return 'justify-start';
      }
    }
  };

  return (
    <div className={`flex ${getFlexDirection()} ${getSpacingClasses()} ${getAlignmentClasses()} ${className}`}>
      {children}
    </div>
  );
};

export default ButtonGroup; 