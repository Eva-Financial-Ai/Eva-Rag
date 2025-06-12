import { useEffect, useRef, useCallback, MutableRefObject } from 'react';

import { debugLog } from '../utils/auditLogger';

// Type for cleanup functions
type CleanupFunction = () => void;

// Enhanced memory management hook
export const useMemoryOptimization = () => {
  const cleanupFunctions = useRef<CleanupFunction[]>([]);
  const timers = useRef<(NodeJS.Timeout | number)[]>([]);
  const intervals = useRef<(NodeJS.Timeout | number)[]>([]);
  const eventListeners = useRef<Array<{ element: EventTarget; event: string; handler: EventListener }>>([]);
  const observers = useRef<Array<IntersectionObserver | MutationObserver | ResizeObserver>>([]);

  // Add a cleanup function to be called on unmount
  const addCleanup = useCallback((cleanup: CleanupFunction) => {
    cleanupFunctions.current.push(cleanup);
  }, []);

  // Enhanced setTimeout with automatic cleanup
  const addTimeout = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      callback();
      // Remove from tracking after execution
      timers.current = timers.current.filter(t => t !== timer);
    }, delay);
    
    timers.current.push(timer);
    return timer;
  }, []);

  // Enhanced setInterval with automatic cleanup  
  const addInterval = useCallback((callback: () => void, delay: number) => {
    const interval = setInterval(callback, delay);
    intervals.current.push(interval);
    return interval;
  }, []);

  // Add event listener with automatic cleanup
  const addEventListener = useCallback((element: EventTarget, event: string, handler: EventListener, options?: AddEventListenerOptions) => {
    element.addEventListener(event, handler, options);
    eventListeners.current.push({ element, event, handler });
  }, []);

  // Add observer with automatic cleanup
  const addObserver = useCallback((observer: IntersectionObserver | MutationObserver | ResizeObserver) => {
    observers.current.push(observer);
    return observer;
  }, []);

  // Manual cleanup function for specific cases
  const manualCleanup = useCallback(() => {
    // Clear all timers
    timers.current.forEach(timer => clearTimeout(timer as NodeJS.Timeout));
    timers.current = [];

    // Clear all intervals
    intervals.current.forEach(interval => clearInterval(interval as NodeJS.Timeout));
    intervals.current = [];

    // Remove all event listeners
    eventListeners.current.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    eventListeners.current = [];

    // Disconnect all observers
    observers.current.forEach(observer => {
      observer.disconnect();
    });
    observers.current = [];

    // Execute custom cleanup functions
    cleanupFunctions.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
    });
    cleanupFunctions.current = [];
  }, []);

  // Automatic cleanup on component unmount
  useEffect(() => {
    return manualCleanup;
  }, [manualCleanup]);

  return {
    addCleanup,
    addTimeout,
    addInterval,
    addEventListener,
    addObserver,
    manualCleanup
  };
};

// Hook for optimized fetch requests with automatic cancellation
export const useOptimizedFetch = () => {
  const abortControllers = useRef<AbortController[]>([]);

  const fetchWithCleanup = useCallback(async (url: string, options: RequestInit = {}) => {
    const controller = new AbortController();
    abortControllers.current.push(controller);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      // Remove controller from tracking after successful completion
      abortControllers.current = abortControllers.current.filter(c => c !== controller);
      
      return response;
    } catch (error) {
      // Remove controller from tracking even on error
      abortControllers.current = abortControllers.current.filter(c => c !== controller);
      
      if (error instanceof Error && error.name === 'AbortError') {
        debugLog('general', 'log_statement', 'Fetch was aborted')
        return null;
      }
      throw error;
    }
  }, []);

  // Cleanup function to abort all pending requests
  const abortAllRequests = useCallback(() => {
    abortControllers.current.forEach(controller => {
      controller.abort();
    });
    abortControllers.current = [];
  }, []);

  useEffect(() => {
    return abortAllRequests;
  }, [abortAllRequests]);

  return { fetchWithCleanup, abortAllRequests };
};

// Hook for optimized state management with debouncing
export const useOptimizedState = <T>(initialValue: T, debounceMs = 300) => {
  const valueRef = useRef<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbacksRef = useRef<Array<(value: T) => void>>([]);

  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    const value = typeof newValue === 'function' ? (newValue as (prev: T) => T)(valueRef.current) : newValue;
    valueRef.current = value;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce callbacks
    timeoutRef.current = setTimeout(() => {
      callbacksRef.current.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.warn('Error in state callback:', error);
        }
      });
    }, debounceMs);
  }, [debounceMs]);

  const subscribe = useCallback((callback: (value: T) => void) => {
    callbacksRef.current.push(callback);
    
    // Return unsubscribe function
    return () => {
      callbacksRef.current = callbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);

  const getValue = useCallback(() => valueRef.current, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      callbacksRef.current = [];
    };
  }, []);

  return { setValue, subscribe, getValue };
};

// Hook for tracking component render performance
export const useRenderPerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    lastRenderTime.current = currentTime;

    if (process.env.NODE_ENV === 'development') {
      debugLog('general', 'log_statement', `🎯 ${componentName} - Render #${renderCount.current} - Time since last: ${timeSinceLastRender.toFixed(2)}ms`);
      
      // Warn about frequent re-renders
      if (timeSinceLastRender < 16) { // More than 60fps
        console.warn(`⚠️ ${componentName} is re-rendering very frequently (${timeSinceLastRender.toFixed(2)}ms). Consider optimization.`);
      }
    }
  });

  return {
    renderCount: renderCount.current,
    resetRenderCount: () => { renderCount.current = 0; }
  };
};

export default useMemoryOptimization; 