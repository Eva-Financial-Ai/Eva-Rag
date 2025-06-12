import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../hooks/useApi';
import { extendedConfig as config } from '../config/environment';
import ErrorBoundary from '../components/common/ErrorBoundary';

interface ApiProviderProps {
  children: React.ReactNode;
}

/**
 * ApiProvider sets up the React Query context and provides error handling
 * for API-related components.
 */
const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
      
      {/* Dev tools disabled until package is installed */}
      {/* {config.environment === 'development' && <ReactQueryDevtools initialIsOpen={false} />} */}
    </QueryClientProvider>
  );
};

export default ApiProvider; 