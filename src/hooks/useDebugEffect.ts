import { useEffect, useRef, DependencyList, EffectCallback } from 'react';

export interface DebugEffectOptions {
  name?: string;
  logLevel?: 'info' | 'warn' | 'error';
  maxRenderThreshold?: number;
}

export function useDebugEffect(
  effect: EffectCallback, 
  deps?: DependencyList, 
  options: DebugEffectOptions = {}
) {
  const { 
    name = 'Unknown Effect', 
    logLevel = 'info',
    maxRenderThreshold = 10 
  } = options;
  
  const prevDeps = useRef<DependencyList | undefined>(deps);
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current++;
    const currentTime = Date.now();
    const timeSinceMount = currentTime - mountTime.current;
    
    // Log excessive re-renders
    if (renderCount.current > maxRenderThreshold) {
      console.error(
        `[${name}] Excessive re-renders detected! (${renderCount.current} times in ${timeSinceMount}ms)`,
        'Dependencies:', deps
      );
    }
    
    // Compare dependencies and log changes
    if (prevDeps.current && deps) {
      const changedDeps: { index: number; old: any; new: any }[] = [];
      
      deps.forEach((dep, index) => {
        if (dep !== prevDeps.current![index]) {
          changedDeps.push({
            index,
            old: prevDeps.current![index],
            new: dep
          });
        }
      });
      
      if (changedDeps.length > 0) {
        const logMethod = console[logLevel];
        logMethod(
          `[${name}] Effect triggered by dependency changes:`,
          changedDeps.map(change => 
            `Index ${change.index}: ${JSON.stringify(change.old)} → ${JSON.stringify(change.new)}`
          )
        );
      } else if (renderCount.current > 1) {
        console.log(`[${name}] Effect re-triggered with same dependencies (render #${renderCount.current})`);
      }
    } else if (renderCount.current === 1) {
      console.log(`[${name}] Effect initial run`);
    }
    
    prevDeps.current = deps;
    
    // Execute the actual effect
    return effect();
  }, deps);
  
  // Return render stats for debugging
  return {
    renderCount: renderCount.current,
    timeSinceMount: Date.now() - mountTime.current
  };
}

// Hook for monitoring component re-renders
export function useRenderTracker(componentName: string) {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());
  const lastRenderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    if (renderCount.current > 1) {
      console.log(
        `[${componentName}] Render #${renderCount.current} (${timeSinceLastRender}ms since last render)`
      );
    } else {
      console.log(`[${componentName}] Initial render`);
    }
    
    lastRenderTime.current = now;
  });
  
  // Warn about excessive renders
  useEffect(() => {
    if (renderCount.current > 20) {
      console.warn(
        `[${componentName}] Excessive renders detected! (${renderCount.current} times)`
      );
    }
  });
  
  return {
    renderCount: renderCount.current,
    totalTime: Date.now() - mountTime.current
  };
}

export default useDebugEffect; 