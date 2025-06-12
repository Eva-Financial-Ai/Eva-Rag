import React, { ReactNode } from 'react';

interface DashboardCardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  isLoading?: boolean;
  colSpan?: 'default' | 'full' | 'half' | 'third';
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  children,
  isLoading = false,
  colSpan = 'default',
}) => {
  // Determine the CSS class based on colSpan prop
  const getColSpanClass = () => {
    switch (colSpan) {
      case 'full':
        return 'col-span-1 md:col-span-2 lg:col-span-3';
      case 'half':
        return 'col-span-1 lg:col-span-2';
      case 'third':
        return 'col-span-1';
      default:
        return '';
    }
  };

  return (
    <div className={`dashboard-card h-full ${getColSpanClass()}`}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center">
            {icon && <div className="flex-shrink-0 p-1.5 bg-gray-100 rounded-md mr-3">{icon}</div>}
            <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          </div>
          <div className="flex space-x-2">{/* Add any card header actions here */}</div>
        </div>
      )}

      <div className="flex-1 p-5">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
