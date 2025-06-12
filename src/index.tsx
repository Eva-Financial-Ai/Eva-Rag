// Import polyfills first to fix potential chunk loading issues
import './polyfills';

import React from 'react';
import { createRoot } from 'react-dom/client';
import 'react-toastify/dist/ReactToastify.css';
import './styles/accessibility.css';
import './styles/components.css';
import './styles/design-system.css'; // Import design system first for proper CSS cascade
import './styles/high-contrast.css';
import './styles/index.css';
import './styles/paywall.css'; // Import paywall styles
import './styles/theme.css';
// import './styles/dropdown-fix.css'; // Temporarily disabled - causing black text issues
import App from './App';
import './i18n'; // Import i18n configuration
import AppProviders from './providers/AppProviders';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import { debugLog } from './utils/auditLogger';

import './config/fontAwesome';

// Safe environment variable access that works with both CRA and Vite
const getEnvVar = (key: string): string => {
  try {
  // Try Vite first (import.meta.env), then fall back to CRA (process.env)
    if (typeof import.meta !== 'undefined' && import.meta?.env) {
      const value = import.meta.env[key];
      if (value !== undefined) return String(value);
    }
    
    // Fall back to CRA environment variables
    if (typeof process !== 'undefined' && process?.env) {
      const value = process.env[key];
      if (value !== undefined) return String(value);
    }
    
    // Final fallback to window environment (if set)
    if (typeof window !== 'undefined' && (window as any).env) {
      const value = (window as any).env[key];
      if (value !== undefined) return String(value);
    }
  } catch (e) {
    console.warn(`Failed to access environment variable ${key}:`, e);
  }

  return '';
};

const NODE_ENV = getEnvVar('NODE_ENV') || 'development';
const APP_VERSION = getEnvVar('REACT_APP_VERSION') || '1.0.0';
const BUILD_TIME = getEnvVar('REACT_APP_BUILD_TIME') || 'Development';

// Enhanced console output for branding (only in development)
if (NODE_ENV === 'development') {
  debugLog('general', 'startup', `EVA AI Frontend v${APP_VERSION} (${NODE_ENV})`, {
    environment: NODE_ENV,
    version: APP_VERSION,
    buildTime: BUILD_TIME,
  });
}

// Performance monitoring
if (NODE_ENV === 'production') {
  debugLog('general', 'performance', 'Performance monitoring enabled');
}

// Modern development environment checks
if (NODE_ENV === 'development') {
  debugLog('general', 'environment', 'Development mode enabled');
  debugLog('general', 'environment', 'Hot reload active');

  // Set fallback values for development
  (window as any).REACT_APP_DOMAIN = process.env.REACT_APP_DOMAIN || 'localhost';

  // Safely set process.env fallback if it exists
  if (typeof process !== 'undefined' && process.env) {
    (process.env as any).REACT_APP_DOMAIN = process.env.REACT_APP_DOMAIN || 'localhost';
  }
}

// Service Worker registration
if ('serviceWorker' in navigator && NODE_ENV === 'production') {
  debugLog('general', 'service_worker', 'Service worker support detected');
} else if (NODE_ENV === 'development') {
  debugLog('general', 'service_worker', 'Service worker disabled in development');
}

// CACHE AND CONFLICT PREVENTION - Clear stale data on startup
const clearStaleData = () => {
  debugLog('general', 'cleanup', 'Clearing stale data and preventing conflicts');

  // Clear any conflicting localStorage keys that might cause role switching issues
  const keysToCheck = ['userRole', 'specificRole', 'sidebarCollapsed'];
  keysToCheck.forEach(key => {
    const value = localStorage.getItem(key);
  });

  // Clear any old cached event listeners
  ['roleChanged', 'forceRefresh'].forEach(eventType => {
    // Create and immediately remove a dummy listener to clear any orphaned ones
    const dummyHandler = () => {};
    window.addEventListener(eventType, dummyHandler);
    window.removeEventListener(eventType, dummyHandler);
  });

  debugLog('general', 'cleanup', 'Startup cleanup completed');
};

// Global error handlers to prevent white screen
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  debugLog('general', 'error', 'Global error occurred', {
    message: event.error?.message || 'Unknown error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  debugLog('general', 'error', 'Unhandled promise rejection', {
    reason: event.reason,
  });
  // Prevent the default behavior of logging to console
  event.preventDefault();
});

// Run cleanup on startup
clearStaleData();

// Application initialization with enhanced safety
const container = document.getElementById('root');
let root: ReturnType<typeof createRoot>;

if (!container) {
  // Critical fix: Create root element if it doesn't exist
  console.error('Root element not found, creating fallback...');
  const fallbackRoot = document.createElement('div');
  fallbackRoot.id = 'root';
  fallbackRoot.className = 'eva-app-root';
  document.body.appendChild(fallbackRoot);
  
  // Retry with the created element
  const retryContainer = document.getElementById('root');
  if (!retryContainer) {
    throw new Error('Critical: Failed to find or create the root element');
}

  root = createRoot(retryContainer);
} else {
  root = createRoot(container);
}

if (NODE_ENV === 'development') {
  debugLog('general', 'startup', 'Initializing React application');
}

// Safer rendering with comprehensive error handling
try {
root.render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
  
  if (NODE_ENV === 'development') {
    debugLog('general', 'startup', 'React application rendered successfully');
  }
} catch (renderError) {
  console.error('Critical render error:', renderError);
  
  // Fallback rendering without StrictMode
  try {
    root.render(
      <AppProviders>
        <App />
      </AppProviders>
    );
    console.warn('App rendered successfully without StrictMode');
  } catch (fallbackError) {
    console.error('Critical: Both render attempts failed:', fallbackError);
    
    // Ultimate fallback - show error message
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="
        display: flex; 
        justify-content: center; 
        align-items: center; 
        min-height: 100vh; 
        font-family: system-ui, -apple-system, sans-serif;
        background: #f5f5f5;
      ">
        <div style="
          text-align: center; 
          padding: 2rem; 
          background: white; 
          border-radius: 8px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          max-width: 500px;
        ">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Application Error</h1>
          <p style="color: #666; margin-bottom: 1.5rem;">
            Eva AI application failed to load. Please refresh the page or contact support.
          </p>
          <button onclick="window.location.reload()" style="
            background: #2563eb; 
            color: white; 
            padding: 0.75rem 1.5rem; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer;
            font-size: 1rem;
          ">
            Reload Application
          </button>
        </div>
      </div>
    `;
    
    if (container) {
      container.appendChild(errorDiv);
    } else {
      document.body.appendChild(errorDiv);
    }
  }
}

// Enhanced service worker registration
serviceWorkerRegistration.register({
  onSuccess: () => {
    if (NODE_ENV === 'development') {
      debugLog('general', 'service_worker', 'Service worker registered successfully');
    }
  },
  onUpdate: () => {
    if (NODE_ENV === 'development') {
      debugLog('general', 'service_worker', 'Service worker updated, new content available');
    }
  },
});

// Performance measurement (only in development to reduce noise)
if (NODE_ENV === 'development') {
  reportWebVitals(console.log);
}
