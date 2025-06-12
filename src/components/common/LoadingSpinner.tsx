import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  transparent?: boolean;
}

/**
 * A reusable loading spinner component
 * @param message Optional message to display below the spinner
 * @param size Size of the spinner (small, medium, large)
 * @param fullScreen Whether the spinner should take the full screen
 * @param transparent Whether the background should be transparent
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'medium',
  fullScreen = false,
  transparent = false,
}) => {
  // Determine spinner size
  const spinnerSizeClass = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-2',
    large: 'w-16 h-16 border-3',
  }[size];

  // Determine container class
  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center z-50'
    : 'flex flex-col items-center justify-center min-h-[200px]';

  // Determine background class
  const bgClass = transparent 
    ? '' 
    : fullScreen 
      ? 'bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80'
      : '';

  return (
    <div className={`${containerClass} ${bgClass}`}>
      <div className={`${spinnerSizeClass} border-t-primary-600 border-b-primary-600 rounded-full animate-spin`}></div>
      {message && <p className="mt-4 text-gray-700 dark:text-gray-300">{message}</p>}
    </div>
  );
};

export default LoadingSpinner; 