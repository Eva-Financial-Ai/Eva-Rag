import React from 'react';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepNames?: string[]; // Optional array of step names
  className?: string;
}

const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps,
  stepNames = [],
  className = '',
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className={`step-progress-container w-full ${className}`}>
      {/* Progress Bar */}
      <div className="relative pt-1">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
          <div
            style={{ width: `${progressPercentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500 ease-out"
          ></div>
        </div>
      </div>

      {/* Step Information */}
      <div className="flex justify-between text-xs text-gray-600">
        {stepNames.length === totalSteps ? (
          <span>
            Step {currentStep}: {stepNames[currentStep - 1]}
          </span>
        ) : (
          <span>
            Step {currentStep} of {totalSteps}
          </span>
        )}
        <span>{Math.round(progressPercentage)}% Complete</span>
      </div>
    </div>
  );
};

export default StepProgress;
