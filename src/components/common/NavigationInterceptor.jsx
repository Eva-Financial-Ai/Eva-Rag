import React, { useEffect, useRef } from 'react';

import { debugLog } from '../../utils/auditLogger';

/**
 * NavigationInterceptor - Handles first load navigation issues
 * Intercepts navigation clicks and forces page refresh on first action
 */
export const NavigationInterceptor = ({ children }) => {
  const hasIntercepted = useRef(false);
  const isFirstSession = useRef(!sessionStorage.getItem('eva_navigation_initialized'));

  useEffect(() => {
    // Mark navigation as initialized
    if (isFirstSession.current) {
      sessionStorage.setItem('eva_navigation_initialized', 'true');
    }

    const handleClick = (event) => {
      // Only intercept on first load and first navigation
      if (!isFirstSession.current || hasIntercepted.current) {
        return;
      }

      const target = event.target.closest('a, button, [role="button"], [data-navigation]');
      if (!target) return;

      // Check if this is a navigation element
      const isNavigation = (
        target.tagName === 'A' ||
        target.getAttribute('role') === 'button' ||
        target.hasAttribute('data-navigation') ||
        target.closest('[data-testid*="nav"]') ||
        target.closest('.navigation') ||
        target.closest('.sidebar') ||
        target.closest('.menu')
      );

      if (isNavigation) {
        debugLog('general', 'log_statement', '🎯 First navigation click intercepted:', target)
        hasIntercepted.current = true;

        // Get the target URL
        let targetUrl = null;
        
        if (target.tagName === 'A' && target.href) {
          targetUrl = target.href;
        } else if (target.getAttribute('data-href')) {
          targetUrl = target.getAttribute('data-href');
        } else if (target.getAttribute('data-navigation')) {
          targetUrl = target.getAttribute('data-navigation');
        }

        if (targetUrl && targetUrl !== window.location.href) {
          event.preventDefault();
          event.stopPropagation();
          
          debugLog('general', 'log_statement', '🚀 Forcing page refresh to:', targetUrl)
          
          // Add a small delay to ensure any state updates complete
          setTimeout(() => {
            window.location.href = targetUrl;
          }, 100);
          
          return false;
        }
      }
    };

    // Attach click listener to document
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  return (
    <div data-navigation-interceptor="true">
      {children}
    </div>
  );
};

/**
 * Enhanced Link component that handles first load navigation
 */
export const FirstLoadLink = ({ to, children, className, onClick, ...props }) => {
  const isFirstLoad = useRef(!sessionStorage.getItem('eva_first_navigation_complete'));

  const handleClick = (event) => {
    if (isFirstLoad.current) {
      debugLog('general', 'log_statement', '🔄 FirstLoadLink clicked - forcing refresh to:', to)
      sessionStorage.setItem('eva_first_navigation_complete', 'true');
      
      event.preventDefault();
      
      // Force page refresh
      setTimeout(() => {
        window.location.href = to;
      }, 50);
      
      return false;
    }

    // Normal click handling for subsequent navigations
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <a
      href={to}
      className={className}
      onClick={handleClick}
      data-navigation={to}
      {...props}
    >
      {children}
    </a>
  );
}; 