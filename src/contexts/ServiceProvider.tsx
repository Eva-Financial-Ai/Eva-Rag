import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import { extendedConfig as config } from '../config/environment';
import { queryClient } from '../hooks/useApiQuery';

interface ServiceProviderProps {
  children: React.ReactNode;
}

/**
 * ServiceProvider wraps the application with React Query context
 * and provides devtools in development mode
 */
export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {config.environment === 'development' && config.debug && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
};

export default ServiceProvider;
