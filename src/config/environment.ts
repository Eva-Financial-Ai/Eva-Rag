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
const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';
const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';

// Use either VITE_ or REACT_APP_ prefixes ‑ both are supported by vite.config.mts
const env = import.meta.env as ImportMetaEnv & Record<string, string | undefined>;

// ------------------------
// Configuration Interfaces
// ------------------------
export interface ExtendedConfig {
  baseUrl: string;
  environment: 'development' | 'production' | 'staging';
  debug: boolean;
  api: {
    baseUrl: string;
  };
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

export interface Environment {
  name: string;
  apiUrl: string;
  api: {
    baseUrl: string;
    timeout: number;
  };
  braveSearch: {
    apiKey?: string;
    publicApiKey?: string;
    apiUrl: string;
  };
}

// ------------------------
// Main Configuration
// ------------------------
export const config: ExtendedConfig = {
  baseUrl: isDevelopment 
    ? 'http://localhost:3001' 
    : 'https://api.evafin.ai',
  environment: isDevelopment ? 'development' : isProduction ? 'production' : 'staging',
  debug: isDevelopment,
  api: {
    baseUrl: isDevelopment 
      ? 'http://localhost:3001' 
      : 'https://api.evafin.ai',
  },
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

// ------------------------
// Environment Settings
// ------------------------
export const environment: Environment = {
  name: env.REACT_APP_ENVIRONMENT || NODE_ENV,
  apiUrl: env.REACT_APP_API_URL || config.baseUrl,
  api: {
    baseUrl: config.baseUrl,
    timeout: config.performance.requestTimeout,
  },
  braveSearch: {
    apiKey: env.REACT_APP_BRAVE_SEARCH_API_KEY || env.VITE_BRAVE_SEARCH_API_KEY,
    publicApiKey: env.REACT_APP_BRAVE_SEARCH_PUBLIC_API_KEY,
    apiUrl: 'https://api.search.brave.com/res/v1/web/search',
  },
};

// ------------------------
// Utility Functions
// ------------------------
export const getBraveSearchHeaders = (usePublicApi: boolean = false): Record<string, string> => {
  const key = usePublicApi 
    ? environment.braveSearch.publicApiKey 
    : environment.braveSearch.apiKey;
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip',
    'Content-Type': 'application/json',
  };
  
  if (key) {
    headers['X-Subscription-Token'] = key;
  }
  
  return headers;
};

// Export environment detection utilities
export const getEnvironment = () => config.environment;
export const isDevMode = () => config.environment === 'development';
export const isProdMode = () => config.environment === 'production';

// Legacy export for backward compatibility
export const extendedConfig = config;

// Default export
export default config; 