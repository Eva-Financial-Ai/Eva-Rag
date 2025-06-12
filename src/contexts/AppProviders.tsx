import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ServiceProvider from './ServiceProvider';
import ApiProvider from './ApiContext';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { config } from '../config/environment';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders combines all context providers for the application
 * in the correct order of nesting
 */
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ServiceProvider>
          <ApiProvider>
            {config.environment === 'development' && config.debug && (
              <div className="fixed bottom-0 left-0 bg-blue-100 px-2 py-1 text-xs z-50">
                {config.environment} mode
              </div>
            )}
            {children}
          </ApiProvider>
        </ServiceProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default AppProviders; 