import React, { createContext, ReactNode, useContext } from 'react';
import { apiClient } from '../api/apiClient';
import { config } from '../config/environment';

// Define the structure of the API context
interface ApiContextType {
  apiClient: typeof apiClient;
  config: typeof config;
}

// Create the API context
const ApiContext = createContext<ApiContextType | null>(null);

// Props for ApiProvider
interface ApiProviderProps {
  children: ReactNode;
}

/**
 * ApiProvider component provides access to all API services
 * throughout the application
 */
export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  // Create a value object that contains all API services
  const contextValue: ApiContextType = {
    apiClient,
    config,
  };

  return <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>;
};

/**
 * Hook to use the API context
 */
export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);

  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }

  return context;
};

export default ApiProvider;
