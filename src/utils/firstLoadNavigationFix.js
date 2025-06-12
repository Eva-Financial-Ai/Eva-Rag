import { debugLog } from './auditLogger';

/**
 * First Load Navigation Fix
 * Handles the issue where React Router doesn't properly initialize on first load
 * Forces a page refresh on the first navigation action to ensure proper routing
 */

let hasFirstNavigationOccurred = false;
let isFirstLoad = true;

// Initialize on DOM load
if (typeof window !== 'undefined') {
  // Check if this is truly the first load
  isFirstLoad = !sessionStorage.getItem('eva_navigation_initialized');
  
  if (isFirstLoad) {
    sessionStorage.setItem('eva_navigation_initialized', 'true');
    debugLog('general', 'log_statement', '🎯 First load detected - navigation fix activated')
  }
}

/**
 * Force refresh navigation for first load
 */
export const forceRefreshNavigation = (targetPath) => {
  if (isFirstLoad && !hasFirstNavigationOccurred) {
    debugLog('general', 'log_statement', '🚀 First navigation detected - forcing page refresh to:', targetPath)
    hasFirstNavigationOccurred = true;
    
    // Force a full page refresh
    setTimeout(() => {
      window.location.href = targetPath;
    }, 100);
    
    return true; // Indicates we handled the navigation
  }
  
  return false; // Let normal navigation proceed
};

/**
 * Enhanced click handler for navigation elements
 */
export const handleFirstLoadNavigation = (event, targetPath) => {
  if (forceRefreshNavigation(targetPath)) {
    event.preventDefault();
    event.stopPropagation();
    return true;
  }
  
  return false;
};

/**
 * Initialize the first load navigation fix
 * This should be called once when the app starts
 */
export const initializeFirstLoadFix = () => {
  if (typeof window === 'undefined') return;
  
  debugLog('general', 'log_statement', '🔧 Initializing first load navigation fix')
  
  // Global click handler to catch any navigation
  document.addEventListener('click', (event) => {
    if (!isFirstLoad || hasFirstNavigationOccurred) return;
    
    const target = event.target.closest('a, button, [role="button"]');
    if (!target) return;
    
    // Check if this looks like a navigation element
    const isNavElement = (
      target.tagName === 'A' ||
      target.closest('.sidebar') ||
      target.closest('[class*="nav"]') ||
      target.closest('[data-testid*="nav"]') ||
      target.hasAttribute('data-navigation')
    );
    
    if (isNavElement) {
      let targetUrl = null;
      
      // Get the target URL
      if (target.tagName === 'A' && target.href) {
        targetUrl = target.href;
      } else if (target.getAttribute('data-href')) {
        targetUrl = target.getAttribute('data-href');
      }
      
      if (targetUrl && targetUrl !== window.location.href) {
        if (handleFirstLoadNavigation(event, targetUrl)) {
          debugLog('general', 'log_statement', '🎯 First load navigation intercepted and handled')
        }
      }
    }
  }, true);
  
  // Backup timer to disable the fix after a reasonable time
  setTimeout(() => {
    if (isFirstLoad) {
      debugLog('general', 'log_statement', '⏰ First load navigation fix timeout - disabling')
      isFirstLoad = false;
    }
  }, 10000); // 10 seconds should be enough for any legitimate first navigation
};

/**
 * Reset the navigation state (useful for testing)
 */
export const resetNavigationState = () => {
  hasFirstNavigationOccurred = false;
  isFirstLoad = true;
  sessionStorage.removeItem('eva_navigation_initialized');
  debugLog('general', 'log_statement', '🔄 Navigation state reset')
};

/**
 * Check if we should force refresh for this navigation
 */
export const shouldForceRefresh = () => {
  return isFirstLoad && !hasFirstNavigationOccurred;
}; 