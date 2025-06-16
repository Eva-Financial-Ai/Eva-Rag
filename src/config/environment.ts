/* eslint-disable no-console */
/**
 * Centralized environment and runtime configuration
 * Provides a single source of truth for API URLs, feature flags, and 3rd-party keys
 *
 * This replaces the deleted file that many parts of the codebase depend on.
 * Keeping a thin wrapper like this allows us to inject mocked values in tests
 * and avoids accessing process.env directly throughout the app.
 */

// Polyfill for process in browser (for CRA/Vite compatibility)
declare const process: any;
declare const console: any;

// ------------------------
// Environment Detection
// ------------------------
const mode = import.meta?.env?.MODE || process.env.NODE_ENV || 'development';
const isDevelopment = mode === 'development';
const isProduction = mode === 'production';

// Use either VITE_ or REACT_APP_ prefixes
// const env = import.meta.env as ImportMetaEnv & Record<string, string | undefined>; // Removed unused variable

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

// Universal environment fallback
function getSafeEnvironment() {
  return (
    (typeof process !== 'undefined' && process.env && process.env.REACT_APP_ENVIRONMENT) ||
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.REACT_APP_ENVIRONMENT || import.meta.env.VITE_ENVIRONMENT)) ||
    'development'
  );
}

function getSafeApiUrl() {
  return (
    (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL)) ||
    'http://localhost:3001'
  );
}

export const environment: Environment = {
  name: getSafeEnvironment(),
  apiUrl: getSafeApiUrl(),
  api: {
    baseUrl: getSafeApiUrl(),
    timeout: config.performance.requestTimeout,
  },
};

// ------------------------
// Utility Functions
// ------------------------
export const getEnvironment = () => config.environment;
export const isDevMode = () => config.environment === 'development';
export const isProdMode = () => config.environment === 'production';

// Legacy export for backward compatibility
export const extendedConfig = config;

// Default export
export default config;

console.log('ENVIRONMENT CHECK:', {
  REACT_APP_ENVIRONMENT: typeof process !== 'undefined' && process.env ? process.env.REACT_APP_ENVIRONMENT : undefined,
  VITE_ENVIRONMENT: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_ENVIRONMENT : undefined,
});

export const ENVIRONMENT = getSafeEnvironment(); 