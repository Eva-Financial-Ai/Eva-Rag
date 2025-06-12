import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { debugLog } from '../utils/auditLogger';

/**
 * Hook to handle first load navigation issues
 * Forces a page refresh on the first navigation action after initial load
 */
export const useFirstLoadRefresh = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasNavigated = useRef(false);
  const isFirstLoad = useRef(true);
  const initialPath = useRef(location.pathname);

  useEffect(() => {
    // Mark that we've had our first effect run
    const timer = setTimeout(() => {
      isFirstLoad.current = false;
    }, 1000); // Give React router time to initialize

    return () => clearTimeout(timer);
  }, []);

  // Override the navigate function to force refresh on first navigation
  const forceRefreshNavigate = (to, options = {}) => {
    debugLog('general', 'log_statement', '🔄 Navigation attempted:', { to, isFirstLoad: isFirstLoad.current, hasNavigated: hasNavigated.current })
    
    // If this is the first load and first navigation, force a page refresh
    if (isFirstLoad.current && !hasNavigated.current) {
      debugLog('general', 'log_statement', '🚀 First navigation detected - forcing page refresh')
      hasNavigated.current = true;
      
      // Force a full page refresh to the target URL
      if (typeof to === 'string') {
        window.location.href = to;
      } else if (to && typeof to === 'object' && to.pathname) {
        window.location.href = to.pathname + (to.search || '') + (to.hash || '');
      } else {
        // Fallback to current page refresh
        window.location.reload();
      }
      return;
    }

    // Normal navigation for subsequent actions
    hasNavigated.current = true;
    navigate(to, options);
  };

  return {
    navigate: forceRefreshNavigate,
    isFirstLoad: isFirstLoad.current,
    hasNavigated: hasNavigated.current
  };
};

/**
 * Component wrapper that forces refresh on first navigation
 */
export const FirstLoadNavigationFix = ({ children }) => {
  const location = useLocation();
  const isFirstRender = useRef(true);
  
  useEffect(() => {
    // Mark that we've completed first render
    if (isFirstRender.current) {
      debugLog('general', 'log_statement', '🎯 First render completed for path:', location.pathname)
      isFirstRender.current = false;
      
      // Set a flag in sessionStorage to track if this is truly the first load
      if (!sessionStorage.getItem('eva_first_load_complete')) {
        sessionStorage.setItem('eva_first_load_complete', 'true');
        debugLog('general', 'log_statement', '✅ Marking first load as complete')
      }
    }
  }, [location.pathname]);

  return children;
}; 