import { useEffect, useRef, useCallback } from 'react';
import { reportMetric } from '../utils/errorReporter';

interface PerformanceOptions {
  componentName: string;
  trackRenders?: boolean;
  trackEffects?: boolean;
  trackMounts?: boolean;
  trackUnmounts?: boolean;
  trackInteractions?: boolean;
}

/**
 * Hook to measure and report component performance metrics
 */
export function usePerformance(options: PerformanceOptions) {
  const { 
    componentName, 
    trackRenders = true, 
    trackEffects = true,
    trackMounts = true,
    trackUnmounts = true,
    trackInteractions = false
  } = options;
  
  // References to store timing information
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number | null>(null);
  const renderCount = useRef<number>(0);
  const effectStartTime = useRef<number>(0);
  
  // Track initial render (mount)
  useEffect(() => {
    if (trackMounts) {
      const mountDuration = performance.now() - renderStartTime.current;
      mountTime.current = mountDuration;
      
      reportMetric(`${componentName}.mount`, mountDuration, {
        unit: 'ms',
        componentName,
        context: { renderCount: renderCount.current }
      }).catch(console.error);
    }
    
    // Track unmount
    return () => {
      if (trackUnmounts) {
        reportMetric(`${componentName}.unmount`, performance.now(), {
          unit: 'ms',
          componentName,
          context: { 
            mountTime: mountTime.current,
            totalLifetime: mountTime.current ? performance.now() - mountTime.current : null,
            // eslint-disable-next-line react-hooks/exhaustive-deps
            renderCount: renderCount.current 
          }
        }).catch(console.error);
      }
    };
  }, [componentName, trackMounts, trackUnmounts]);
  
  // Track effect execution time
  useEffect(() => {
    if (trackEffects) {
      effectStartTime.current = performance.now();
      
      return () => {
        const effectDuration = performance.now() - effectStartTime.current;
        
        reportMetric(`${componentName}.effect`, effectDuration, {
          unit: 'ms',
          componentName,
          // eslint-disable-next-line react-hooks/exhaustive-deps
          context: { renderCount: renderCount.current }
        }).catch(console.error);
      };
    }
  });
  
  // Track render performance
  useEffect(() => {
    if (trackRenders) {
      const renderDuration = performance.now() - renderStartTime.current;
      
      // Only report non-mount renders (mount is tracked separately)
      if (renderCount.current > 0) {
        reportMetric(`${componentName}.render`, renderDuration, {
          unit: 'ms',
          componentName,
          context: { renderCount: renderCount.current }
        }).catch(console.error);
      }
      
      renderCount.current++;
      renderStartTime.current = performance.now();
    }
  });
  
  // Track interactions (clicks, inputs, etc.)
  const trackInteraction = useCallback((interactionType: string, duration: number = 0) => {
    if (trackInteractions) {
      reportMetric(`${componentName}.interaction.${interactionType}`, duration, {
        unit: 'ms',
        componentName,
        context: { renderCount: renderCount.current }
      }).catch(console.error);
    }
  }, [componentName, trackInteractions]);
  
  // Wrapper for event handlers to track interaction performance
  const withTracking = useCallback(<T extends (...args: any[]) => any>(
    fn: T, 
    interactionName: string
  ): (...args: Parameters<T>) => ReturnType<T> => {
    return (...args: Parameters<T>): ReturnType<T> => {
      if (!trackInteractions) return fn(...args);
      
      const startTime = performance.now();
      try {
        return fn(...args);
      } finally {
        const duration = performance.now() - startTime;
        trackInteraction(`${interactionName}`, duration);
      }
    };
  }, [trackInteractions, trackInteraction]);
  
  // Initialize timing reference for the first render
  if (renderCount.current === 0) {
    renderStartTime.current = performance.now();
  }
  
  return {
    trackInteraction,
    withTracking,
    renderCount: renderCount.current,
  };
}

export default usePerformance; 