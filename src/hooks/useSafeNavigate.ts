import { useNavigate } from 'react-router-dom';
import { useRef, useCallback, useEffect } from 'react';

import { debugLog } from '../utils/auditLogger';

export interface SafeNavigateOptions {
  force?: boolean;
  replace?: boolean;
  state?: any;
}

export function useSafeNavigate() {
  const navigate = useNavigate();
  const hasNavigated = useRef(false);
  const navigationTimer = useRef<NodeJS.Timeout | null>(null);

  // Reset navigation flag when component unmounts
  useEffect(() => {
    return () => {
      if (navigationTimer.current) {
        clearTimeout(navigationTimer.current);
      }
    };
  }, []);

  const safeNavigate = useCallback((path: string, options: SafeNavigateOptions = {}) => {
    // Prevent multiple navigation calls in quick succession
    if (hasNavigated.current && !options.force) {
      console.warn(`[useSafeNavigate] Navigation to ${path} blocked - already navigated. Use force: true to override.`);
      return false;
    }

    try {
      debugLog('general', 'log_statement', `[useSafeNavigate] Navigating to: ${path}`, options)
      navigate(path, {
        replace: options.replace,
        state: options.state
      });
      
      hasNavigated.current = true;
      
      // Reset navigation flag after a delay to allow for legitimate re-navigation
      navigationTimer.current = setTimeout(() => {
        hasNavigated.current = false;
      }, 1000);
      
      return true;
    } catch (error) {
      console.error(`[useSafeNavigate] Navigation failed:`, error);
      hasNavigated.current = false;
      return false;
    }
  }, [navigate]);

  const resetNavigation = useCallback(() => {
    debugLog('general', 'log_statement', '[useSafeNavigate] Resetting navigation flag')
    hasNavigated.current = false;
    if (navigationTimer.current) {
      clearTimeout(navigationTimer.current);
      navigationTimer.current = null;
    }
  }, []);

  const canNavigate = useCallback(() => {
    return !hasNavigated.current;
  }, []);

  return { 
    safeNavigate, 
    resetNavigation, 
    canNavigate,
    hasNavigated: hasNavigated.current 
  };
}

export default useSafeNavigate; 