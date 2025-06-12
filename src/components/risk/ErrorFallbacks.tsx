import React from 'react';
import { FallbackProps } from 'react-error-boundary';

export const RiskDashboardFallback: React.FC<FallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="bg-white shadow rounded-lg overflow-hidden p-6">
    <h2 className="text-xl font-medium text-gray-900 mb-6">
      Error Loading Risk Dashboard
    </h2>
    <p className="text-red-500 mb-4">
      {error.message || 'There was a problem loading the risk dashboard data.'}
    </p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Try Again
    </button>
  </div>
);

export const RiskAssessmentFallback: React.FC<FallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="bg-white shadow rounded-lg overflow-hidden p-6">
    <h2 className="text-xl font-medium text-gray-900 mb-6">
      Error Loading Risk Assessment
    </h2>
    <p className="text-red-500 mb-4">
      {error.message || 'There was a problem loading the risk assessment data.'}
    </p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Try Again
    </button>
  </div>
);

export const CreditApplicationFallback: React.FC<FallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="p-8 text-center">
    <h2 className="text-xl font-medium text-gray-900 mb-4">
      Error Loading Origination Creator Tool
    </h2>
    <p className="text-red-500 mb-4">
      {error.message || 'There was a problem loading the Origination Creator Tool.'}
    </p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Try Again
    </button>
  </div>
); 