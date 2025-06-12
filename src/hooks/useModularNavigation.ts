import { useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavigationService } from '../services/navigationService';
import NavigationRouterService from '../services/NavigationRouterService';
import { UserContext } from '../contexts/UserContext';
import { useUserType } from '../contexts/UserTypeContext';

import { debugLog } from '../utils/auditLogger';

export const useModularNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userContext = useContext(UserContext);
  const { userType } = useUserType();

  // Initialize services
  const navigationService = NavigationService.getInstance();
  const routerService = NavigationRouterService.getInstance();

  // Configure router service with React Router navigate function
  useEffect(() => {
    routerService.configure({
      navigate,
      fallbackRedirect: '/dashboard',
      enableLogging: process.env.NODE_ENV === 'development',
    });

    debugLog('general', 'log_statement', '[useModularNavigation] Services configured')

    // Cleanup on unmount
    return () => {
      // Don't destroy services as they might be used elsewhere
      debugLog('general', 'log_statement', '[useModularNavigation] Hook unmounted')
    };
  }, [navigate, routerService]);

  // Safe navigation function
  const safeNavigate = useCallback(
    (path: string, options?: { replace?: boolean; state?: any }) => {
      try {
        // Validate path
        if (!routerService.validatePath(path)) {
          console.warn('[useModularNavigation] Invalid path blocked:', path);
          return;
        }

        routerService.safeNavigate(path, options);
      } catch (error) {
        console.error('[useModularNavigation] Navigation error:', error);
      }
    },
    [routerService]
  );

  // Get navigation hierarchy for current user
  const getNavigationHierarchy = useCallback(() => {
    try {
      const currentUserType = userType || 'lender'; // Default fallback
      return navigationService.getNavigationHierarchy(currentUserType);
    } catch (error) {
      console.error('[useModularNavigation] Failed to get navigation hierarchy:', error);
      return [];
    }
  }, [navigationService, userType]);

  // Check if current path requires authentication
  const requiresAuth = useCallback(
    (path?: string) => {
      try {
        const targetPath = path || location.pathname;
        return navigationService.requiresAuth(targetPath);
      } catch (error) {
        console.error('[useModularNavigation] Auth check failed:', error);
        return true; // Fail secure - require auth by default
      }
    },
    [navigationService, location.pathname]
  );

  // Get route information
  const getRouteInfo = useCallback(
    (path?: string) => {
      try {
        const targetPath = path || location.pathname;
        const route = navigationService.getRouteByPath(targetPath);
        const module = navigationService.getModuleByPath(targetPath);
        return { route, module };
      } catch (error) {
        console.error('[useModularNavigation] Failed to get route info:', error);
        return { route: null, module: null };
      }
    },
    [navigationService, location.pathname]
  );

  // Validate current route
  const validateCurrentRoute = useCallback(() => {
    try {
      return navigationService.validateRoute(location.pathname);
    } catch (error) {
      console.error('[useModularNavigation] Route validation failed:', error);
      return false;
    }
  }, [navigationService, location.pathname]);

  // Navigation utilities
  const goBack = useCallback(() => {
    routerService.goBack();
  }, [routerService]);

  const goForward = useCallback(() => {
    routerService.goForward();
  }, [routerService]);

  const refresh = useCallback(() => {
    routerService.refresh();
  }, [routerService]);

  // URL utilities
  const buildUrl = useCallback(
    (basePath: string, params?: Record<string, string>) => {
      return routerService.buildUrl(basePath, params);
    },
    [routerService]
  );

  const parseUrlParams = useCallback(
    (url?: string) => {
      return routerService.parseUrlParams(url);
    },
    [routerService]
  );

  const addQueryParam = useCallback(
    (key: string, value: string) => {
      routerService.addQueryParam(key, value);
    },
    [routerService]
  );

  const removeQueryParam = useCallback(
    (key: string) => {
      routerService.removeQueryParam(key);
    },
    [routerService]
  );

  // Get sidebar state from user context
  const sidebarState = {
    isCollapsed: userContext?.sidebarCollapsed || false,
    toggle: userContext?.setSidebarCollapsed
      ? () => userContext.setSidebarCollapsed(!userContext.sidebarCollapsed)
      : undefined,
  };

  // Service status
  const serviceStatus = {
    navigationConfigured: true,
    routerConfigured: routerService.isConfigured(),
    userAuthenticated: !!userContext?.user,
    userType: userType || 'unknown',
  };

  return {
    // Navigation functions
    navigate: safeNavigate,
    goBack,
    goForward,
    refresh,

    // Route information
    currentPath: location.pathname,
    currentRoute: getRouteInfo().route,
    currentModule: getRouteInfo().module,
    requiresAuth: requiresAuth(),
    isValidRoute: validateCurrentRoute(),

    // Navigation data
    navigationHierarchy: getNavigationHierarchy(),
    userType: userType || 'lender',

    // URL utilities
    buildUrl,
    parseUrlParams,
    addQueryParam,
    removeQueryParam,
    currentParams: parseUrlParams(),

    // UI state
    sidebar: sidebarState,

    // Service status
    status: serviceStatus,

    // Raw services (for advanced usage)
    services: {
      navigation: navigationService,
      router: routerService,
    },
  };
};

export default useModularNavigation;
