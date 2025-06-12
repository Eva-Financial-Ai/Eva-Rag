import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  backLink?: string;
  showBackButton?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * PageHeader - A consistent header component for all pages
 * 
 * This component provides a standardized header with title, optional
 * description, back button, and action buttons.
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  backLink,
  showBackButton = false,
  className = '',
  children,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backLink) {
      navigate(backLink);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`bg-white shadow rounded-md ${className}`}>
      <div className="px-4 py-4 sm:px-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
          <div className="flex items-center">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="mr-3 p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              {description && (
                <p className="mt-1 text-sm text-gray-500 max-w-2xl">{description}</p>
              )}
            </div>
          </div>
          
          {actions && <div className="flex items-center space-x-3">{actions}</div>}
        </div>
        
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
};

export default PageHeader; 