// =============================================================================
// POLYFILLS FOR CROSS-BROWSER COMPATIBILITY
// =============================================================================

/**
 * CRITICAL FIX #1: Missing polyfills.ts file
 * This file is imported first but was missing, causing immediate failure
 */

// Polyfill for older browsers
if (!globalThis) {
  (window as any).globalThis = window;
}

// Fix for process.env in browser environment
if (typeof process === 'undefined') {
  (window as any).process = {
    env: {
      NODE_ENV: 'development',
      REACT_APP_ENVIRONMENT: 'staging',
    },
  };
}

// Fix for Buffer in browser environment
if (typeof Buffer === 'undefined') {
  (window as any).Buffer = {};
}

// Fix for global in browser environment
if (typeof global === 'undefined') {
  (window as any).global = globalThis;
}

// Intersection Observer polyfill check
if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
  console.warn('IntersectionObserver not supported, features may be limited');
}

// Resize Observer polyfill check
if (typeof window !== 'undefined' && !('ResizeObserver' in window)) {
  console.warn('ResizeObserver not supported, features may be limited');
}

// Promise polyfill check
if (typeof Promise === 'undefined') {
  throw new Error('Promise polyfill required for this application');
}

// Fetch polyfill check
if (typeof fetch === 'undefined') {
  console.warn('Fetch API not supported, network requests may fail');
}

// URL polyfill for older browsers
if (typeof URL === 'undefined') {
  console.warn('URL API not supported, some features may be limited');
}

// Web Workers check
if (typeof Worker === 'undefined') {
  console.warn('Web Workers not supported, background processing disabled');
}

// Local/Session Storage check with graceful fallback
const checkStorage = (storageType: 'localStorage' | 'sessionStorage') => {
  try {
    const storage = window[storageType];
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn(`${storageType} not available, using memory fallback`);
    return false;
  }
};

// Create memory storage fallback if needed
if (typeof window !== 'undefined') {
  const localStorageAvailable = checkStorage('localStorage');
  const sessionStorageAvailable = checkStorage('sessionStorage');
  
  if (!localStorageAvailable || !sessionStorageAvailable) {
    const memoryStorage = {
      _data: {} as Record<string, string>,
      setItem(key: string, value: string) {
        this._data[key] = value;
      },
      getItem(key: string) {
        return this._data[key] || null;
      },
      removeItem(key: string) {
        delete this._data[key];
      },
      clear() {
        this._data = {};
      },
      get length() {
        return Object.keys(this._data).length;
      },
      key(index: number) {
        const keys = Object.keys(this._data);
        return keys[index] || null;
      },
    };
    
    if (!localStorageAvailable) {
      (window as any).localStorage = memoryStorage;
    }
    if (!sessionStorageAvailable) {
      (window as any).sessionStorage = { ...memoryStorage, _data: {} };
    }
  }
}

// Console polyfill for environments without console
if (typeof console === 'undefined') {
  (window as any).console = {
    log: () => {},
    warn: () => {},
    error: () => {},
    info: () => {},
    debug: () => {},
  };
}

// Export to make this a module and fix isolatedModules error
export {}; 