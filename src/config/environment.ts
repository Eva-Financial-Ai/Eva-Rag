/**
 * Centralized environment and runtime configuration
 * Provides a single source of truth for API URLs, feature flags, and 3rd-party keys
 *
 * This replaces the deleted file that many parts of the codebase depend on.
 * Keeping a thin wrapper like this allows us to inject mocked values in tests
 * and avoids accessing process.env directly throughout the app.
 */

// ------------------------
// Environment Detection
// ------------------------
const NODE_ENV = import.meta.env.MODE || process.env.NODE_ENV || 'development';

// Use either VITE_ or REACT_APP_ prefixes ‑ both are supported by vite.config.mts
const env = import.meta.env as ImportMetaEnv & Record<string, string | undefined>;

// ------------------------
// Core Configuration Shape
// ------------------------
export interface Environment {
  name: string;
  apiUrl: string;
  braveSearch: {
    apiKey?: string;
    publicApiKey?: string;
  };
}

export const environment: Environment = {
  name: env.REACT_APP_ENVIRONMENT || NODE_ENV,
  apiUrl: env.REACT_APP_API_URL || 'http://localhost:3001',
  braveSearch: {
    apiKey: env.REACT_APP_BRAVE_SEARCH_API_KEY,
    publicApiKey: env.REACT_APP_BRAVE_SEARCH_PUBLIC_API_KEY,
  },
};

// ------------------------
// Extended Config used across hooks / services
// ------------------------
export interface ExtendedConfig {
  api: {
    baseUrl: string;
  };
  performance: {
    /** global request timeout in ms */
    requestTimeout: number;
    /** how many times to retry transient failures */
    maxRetries: number;
  };
  debug: boolean;
}

export const extendedConfig: ExtendedConfig = {
  api: {
    baseUrl: environment.apiUrl,
  },
  performance: {
    requestTimeout: 15_000, // 15s
    maxRetries: 3,
  },
  debug: environment.name !== 'production',
};

// ------------------------
// Helper: Brave Search API headers
// ------------------------
export const getBraveSearchHeaders = (usePublicApi: boolean = false): Record<string, string> => {
  const key = usePublicApi ? environment.braveSearch.publicApiKey : environment.braveSearch.apiKey;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (key) {
    headers['X-Subscription-Token'] = key;
  }
  return headers;
};

// Environment configuration for EVA AI Platform
// This file contains environment-specific settings and should be customized per deployment

// Detect environment
const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';
const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';

// Extended configuration interface
export interface ExtendedConfig {
  baseUrl: string;
  environment: 'development' | 'production' | 'staging';
  debug: boolean;
  performance: {
    requestTimeout: number;
    maxRetries: number;
    cacheTTL: number;
  };
  auth: {
    tokenKey: string;
    refreshTokenKey: string;
  };
}

// Environment configuration
export interface Environment {
  api: {
    baseUrl: string;
    timeout: number;
  };
  braveSearch: {
    apiUrl: string;
    apiKey: string;
  };
}

// Main configuration object
export const config: ExtendedConfig = {
  baseUrl: isDevelopment 
    ? 'http://localhost:3001' 
    : 'https://api.evafin.ai',
  environment: isDevelopment ? 'development' : 'production',
  debug: isDevelopment,
  performance: {
    requestTimeout: 30000,
    maxRetries: 3,
    cacheTTL: 300, // 5 minutes
  },
  auth: {
    tokenKey: 'eva_auth_token',
    refreshTokenKey: 'eva_refresh_token',
  },
};

// Environment-specific settings
export const environment: Environment = {
  api: {
    baseUrl: config.baseUrl,
    timeout: config.performance.requestTimeout,
  },
  braveSearch: {
    apiUrl: 'https://api.search.brave.com/res/v1/web/search',
    apiKey: import.meta.env.VITE_BRAVE_SEARCH_API_KEY || '',
  },
};

// Utility function for Brave Search headers
export const getBraveSearchHeaders = () => ({
  'Accept': 'application/json',
  'Accept-Encoding': 'gzip',
  'X-Subscription-Token': environment.braveSearch.apiKey,
});

// Export environment detection utilities
export const getEnvironment = () => config.environment;
export const isDevMode = () => config.environment === 'development';
export const isProdMode = () => config.environment === 'production';

// Default export
export default config; 