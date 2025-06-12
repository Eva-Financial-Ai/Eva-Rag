/**
 * =============================================================================
 * REACT HOOK DEPENDENCY FIXER
 * =============================================================================
 * 
 * Utility to help identify and fix React Hook dependency issues
 * following financial application best practices.
 */

import { useEffect, useCallback, useMemo, DependencyList } from 'react';

import { debugLog } from './auditLogger';

// Custom hook to safely handle useEffect with comprehensive dependency tracking
export function useSafeEffect(
  effect: React.EffectCallback,
  deps: DependencyList,
  debugName?: string
): void {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && debugName) {
      debugLog('general', 'log_statement', `🔍 Effect "${debugName}" executing with deps:`, deps)
    }
    return effect();
  }, deps);
}

// Custom hook for memoized callbacks with proper dependency tracking
export function useSafeCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList,
  debugName?: string
): T {
  return useCallback((...args: any[]) => {
    if (process.env.NODE_ENV === 'development' && debugName) {
      debugLog('general', 'log_statement', `📞 Callback "${debugName}" executing`)
    }
    return callback(...args);
  }, deps) as T;
}

// Custom hook for memoized values with proper dependency tracking
export function useSafeMemo<T>(
  factory: () => T,
  deps: DependencyList,
  debugName?: string
): T {
  return useMemo(() => {
    if (process.env.NODE_ENV === 'development' && debugName) {
      debugLog('general', 'log_statement', `💭 Memo "${debugName}" computing with deps:`, deps)
    }
    return factory();
  }, deps);
}

// Utility to extract dependencies from a function (development helper)
export function analyzeDependencies(
  fn: Function,
  availableVars: Record<string, any>
): string[] {
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }

  const fnString = fn.toString();
  const dependencies: string[] = [];
  
  // Simple regex to find variable references
  const varPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
  let match;
  
  while ((match = varPattern.exec(fnString)) !== null) {
    const varName = match[1];
    // Skip keywords and check if variable exists in available vars
    if (
      varName in availableVars &&
      !['true', 'false', 'null', 'undefined', 'function', 'return', 'if', 'else', 'for', 'while'].includes(varName) &&
      !dependencies.includes(varName)
    ) {
      dependencies.push(varName);
    }
  }
  
  return dependencies;
}

// Hook to validate dependencies in development
export function useEffectWithValidation(
  effect: React.EffectCallback,
  deps: DependencyList,
  expectedDeps: string[],
  debugName?: string
): void {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (deps.length !== expectedDeps.length) {
        console.warn(
          `⚠️ useEffect "${debugName || 'unnamed'}" dependency mismatch:`,
          `Expected ${expectedDeps.length} deps, got ${deps.length}`
        );
      }
    }
    return effect();
  }, deps);
}

// Development-only hook to track effect executions
export function useEffectTracker(
  effect: React.EffectCallback,
  deps: DependencyList,
  name: string
): void {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      debugLog('general', 'log_statement', `🔄 Effect "${name}" executing at ${new Date().toISOString()}`);
      debugLog('general', 'log_statement', `📋 Dependencies:`, deps)
    }
    
    const cleanup = effect();
    
    return () => {
      if (process.env.NODE_ENV === 'development') {
        debugLog('general', 'log_statement', `🧹 Effect "${name}" cleaning up`)
      }
      if (cleanup) {
        cleanup();
      }
    };
  }, deps);
}

// Utility to create stable object references
export function useStableObject<T extends Record<string, any>>(obj: T): T {
  return useMemo(() => obj, Object.values(obj));
}

// Utility to create stable array references
export function useStableArray<T>(arr: T[]): T[] {
  return useMemo(() => arr, arr);
}

// Development utility to log dependency changes
export function useDependencyLogger(deps: DependencyList, name: string): void {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      debugLog('general', 'log_statement', `📊 Dependencies changed for "${name}":`, deps)
    }
  }, deps);
}

// Hook to safely handle async effects
export function useAsyncEffect(
  effect: () => Promise<void | (() => void)>,
  deps: DependencyList,
  debugName?: string
): void {
  useEffect(() => {
    let isCancelled = false;
    
    const runEffect = async () => {
      try {
        if (process.env.NODE_ENV === 'development' && debugName) {
          debugLog('general', 'log_statement', `🔄 Async effect "${debugName}" starting`)
        }
        
        const cleanup = await effect();
        
        if (!isCancelled && cleanup) {
          return cleanup;
        }
      } catch (error) {
        if (!isCancelled) {
          console.error(`❌ Async effect "${debugName || 'unnamed'}" error:`, error);
        }
      }
    };
    
    const cleanupPromise = runEffect();
    
    return () => {
      isCancelled = true;
      cleanupPromise.then(cleanup => {
        if (cleanup && typeof cleanup === 'function') {
          cleanup();
        }
      });
    };
  }, deps);
} 