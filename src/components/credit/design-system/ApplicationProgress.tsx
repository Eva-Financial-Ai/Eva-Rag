import React from 'react';
import { CheckCircleIcon, ClockIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { progressStyles, buttonStyles, typographyStyles } from './CreditApplicationStyles';

export interface ApplicationSection {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'locked' | 'available';
  completedFields?: number;
  totalFields?: number;
  errors?: number;
}

interface ApplicationProgressProps {
  currentStep: number;
  totalSteps: number;
  sections: ApplicationSection[];
  onStepClick: (stepIndex: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  canNavigateNext: boolean;
  canNavigatePrevious: boolean;
  lastSaved?: Date;
  onSave: () => void;
  isSaving?: boolean;
}

export const ApplicationProgress: React.FC<ApplicationProgressProps> = ({
  currentStep,
  totalSteps,
  sections,
  onStepClick,
  onNext,
  onPrevious,
  canNavigateNext,
  canNavigatePrevious,
  lastSaved,
  onSave,
  isSaving = false,
}) => {
  const completedSteps = sections.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const getStepIcon = (status: ApplicationSection['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-success-600" />;
      case 'in-progress':
        return <ClockIcon className="h-5 w-5 text-primary-600" />;
      case 'locked':
        return <LockClosedIcon className="h-5 w-5 text-neutral-400" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-neutral-300" />;
    }
  };

  const getStepColor = (status: ApplicationSection['status'], isCurrent: boolean) => {
    if (isCurrent) return 'border-primary-600 bg-primary-50';
    switch (status) {
      case 'completed':
        return 'border-success-600 bg-success-50';
      case 'in-progress':
        return 'border-primary-400 bg-primary-50';
      case 'locked':
        return 'border-neutral-300 bg-neutral-50 opacity-50';
      default:
        return 'border-neutral-300 bg-white hover:bg-neutral-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className={typographyStyles.h4}>Application Progress</h3>
          <span className={typographyStyles.small}>
            {completedSteps} of {totalSteps} sections completed
          </span>
        </div>
        <div className={progressStyles({ size: 'lg' })}>
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="mt-1 text-right">
          <span className={`${typographyStyles.caption} font-medium`}>
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {sections.map((section, index) => {
          const isCurrent = index === currentStep;
          const isClickable = section.status !== 'locked';

          return (
            <motion.button
              key={section.id}
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200
                ${getStepColor(section.status, isCurrent)}
                ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
              `}
              whileHover={isClickable ? { scale: 1.02 } : {}}
              whileTap={isClickable ? { scale: 0.98 } : {}}
            >
              <div className="flex flex-col items-center space-y-1">
                {getStepIcon(section.status)}
                <span className="text-xs font-medium text-neutral-700 text-center">
                  {section.name}
                </span>
                {section.completedFields !== undefined && (
                  <span className="text-xs text-neutral-500">
                    {section.completedFields}/{section.totalFields}
                  </span>
                )}
                {section.errors && section.errors > 0 && (
                  <span className="absolute -top-1 -right-1 bg-error-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {section.errors}
                  </span>
                )}
              </div>
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-lg ring-2 ring-primary-600 ring-offset-2"
                  layoutId="activeStep"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevious}
          disabled={!canNavigatePrevious}
          className={buttonStyles({ 
            variant: 'outline', 
            size: 'md',
            className: 'flex items-center space-x-2'
          })}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-4">
          <button
            onClick={onSave}
            disabled={isSaving}
            className={buttonStyles({ 
              variant: 'secondary', 
              size: 'md',
              className: 'flex items-center space-x-2'
            })}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-300 border-t-primary-600" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Progress</span>
            )}
          </button>
          {lastSaved && (
            <span className={typographyStyles.caption}>
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        <button
          onClick={onNext}
          disabled={!canNavigateNext}
          className={buttonStyles({ 
            variant: 'primary', 
            size: 'md',
            className: 'flex items-center space-x-2'
          })}
        >
          <span>Next</span>
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};