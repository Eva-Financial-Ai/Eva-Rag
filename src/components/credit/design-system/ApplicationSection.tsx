import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { cardStyles, sectionHeaderStyles, typographyStyles } from './CreditApplicationStyles';

interface ApplicationSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  status?: 'not-started' | 'in-progress' | 'completed' | 'error';
  completedFields?: number;
  totalFields?: number;
  errors?: string[];
  children: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export const ApplicationSection: React.FC<ApplicationSectionProps> = ({
  title,
  description,
  icon,
  status = 'not-started',
  completedFields,
  totalFields,
  errors = [],
  children,
  collapsible = false,
  defaultExpanded = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-success-600 bg-success-50';
      case 'error':
        return 'text-error-600 bg-error-50';
      case 'in-progress':
        return 'text-primary-600 bg-primary-50';
      default:
        return 'text-neutral-600 bg-neutral-50';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-success-600" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-error-600" />;
      default:
        return null;
    }
  };

  const progressPercentage = totalFields 
    ? Math.round((completedFields || 0) / totalFields * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${cardStyles({ 
        variant: status === 'error' ? 'error' : status === 'completed' ? 'success' : 'default',
        status: status === 'in-progress' ? 'active' : undefined
      })} ${className}`}
    >
      {/* Section Header */}
      <div
        className={`p-6 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className={sectionHeaderStyles({ variant: 'default' })}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {icon && (
                <div className={`p-2 rounded-lg ${getStatusColor()}`}>
                  {icon}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className={typographyStyles.h3}>{title}</h3>
                  {getStatusIcon()}
                </div>
                {description && (
                  <p className={`${typographyStyles.body} mt-1`}>{description}</p>
                )}
              </div>
            </div>

            <div className="text-right">
              {totalFields && (
                <div className="space-y-1">
                  <span className={typographyStyles.small}>
                    {completedFields || 0} of {totalFields} fields
                  </span>
                  <div className="w-32 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Summary */}
        {errors.length > 0 && (
          <div className="mt-4 p-3 bg-error-50 border border-error-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <ExclamationCircleIcon className="h-5 w-5 text-error-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-error-900">
                  Please fix the following errors:
                </p>
                <ul className="mt-1 text-sm text-error-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section Content */}
      {(!collapsible || isExpanded) && (
        <motion.div
          initial={collapsible ? { height: 0, opacity: 0 } : undefined}
          animate={{ height: 'auto', opacity: 1 }}
          exit={collapsible ? { height: 0, opacity: 0 } : undefined}
          transition={{ duration: 0.3 }}
          className="px-6 pb-6"
        >
          <div className="space-y-4">
            {children}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};