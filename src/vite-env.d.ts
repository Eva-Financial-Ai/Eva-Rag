/// <reference types="vite/client" />

interface ImportMetaEnv {
  // CRA-compatible environment variables
  readonly NODE_ENV: string
  readonly REACT_APP_ENVIRONMENT: string
  readonly REACT_APP_VERSION: string
  readonly REACT_APP_BUILD_TIME: string
  readonly REACT_APP_API_URL: string
  readonly REACT_APP_API_VERSION: string
  readonly REACT_APP_AUTH0_DOMAIN: string
  readonly REACT_APP_AUTH0_CLIENT_ID: string
  readonly REACT_APP_AUTH0_AUDIENCE: string
  readonly REACT_APP_MONITOR_URL: string
  readonly REACT_APP_SENTRY_DSN: string
  readonly REACT_APP_CLOUDFLARE_ANALYTICS: string
  readonly REACT_APP_CLOUDFLARE_DOMAIN: string
  readonly REACT_APP_ENABLE_ANALYTICS: string
  readonly REACT_APP_ENABLE_SERVICE_WORKER: string
  readonly REACT_APP_ENABLE_PWA: string
  readonly REACT_APP_ENABLE_DEBUG: string
  readonly REACT_APP_GRAPHQL_ENDPOINT: string
  readonly REACT_APP_WEBSOCKET_URL: string
  
  // Vite-specific environment variables
  readonly VITE_API_URL: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_ENABLE_DEVTOOLS: string
  
  // Build configuration
  readonly DISABLE_ESLINT_PLUGIN: string
  readonly GENERATE_SOURCEMAP: string
  readonly FAST_REFRESH: string
  
  // Public URL (Vite equivalent of PUBLIC_URL)
  readonly BASE_URL: string
  
  // Development flags
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Global type augmentation for better compatibility
declare global {
  interface Window {
    REACT_APP_DOMAIN?: string;
  }
  
  // Ensure process.env exists for CRA compatibility
  namespace NodeJS {
    interface ProcessEnv extends ImportMetaEnv {
      // Additional process.env specific variables
      [key: string]: string | undefined;
    }
  }
}

export {}; 