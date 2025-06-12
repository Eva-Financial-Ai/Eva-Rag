import React, { useState, useEffect, useCallback, ErrorInfo, Component } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { debugLog } from '../../utils/auditLogger';

import {
  NavigationService,
  NavigationModule,
  NavigationRoute,
} from '../../services/navigationService';

// Error Boundary for navigation items
class NavigationErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[NavigationErrorBoundary] Navigation component crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-amber-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Navigation Error</h3>
                <div className="mt-2 text-sm text-amber-700">
                  This navigation item encountered an error. Please try refreshing the page.
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => this.setState({ hasError: false })}
                    className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-md hover:bg-amber-200 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Individual navigation item component with error handling
interface NavigationItemProps {
  route: NavigationRoute;
  isActive: boolean;
  level: number;
  onNavigate: (route: NavigationRoute) => void;
  className?: string;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  route,
  isActive,
  level,
  onNavigate,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (route.children && route.children.length > 0) {
        setIsExpanded(!isExpanded);
      } else {
        await onNavigate(route);
      }
    } catch (err) {
      console.error('[NavigationItem] Click error:', err);
      setError('Failed to navigate');
    } finally {
      setIsLoading(false);
    }
  }, [route, isExpanded, onNavigate]);

  const baseClasses = `
    flex items-center w-full px-3 py-2 text-sm font-medium rounded-md
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const activeClasses = isActive
    ? 'bg-blue-600 text-white shadow-md'
    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';

  const levelPadding = `pl-${Math.min(level * 4 + 3, 12)}`;

  return (
    <NavigationErrorBoundary>
      <div className={`${className}`}>
        <button
          onClick={handleClick}
          disabled={isLoading || !route.isActive}
          className={`${baseClasses} ${activeClasses} ${levelPadding}`}
          title={route.description}
          aria-expanded={route.children ? isExpanded : undefined}
        >
          {/* Icon */}
          {route.icon && (
            <span className="mr-3 flex-shrink-0 text-lg" aria-hidden="true">
              {typeof route.icon === 'string' ? route.icon : '📄'}
            </span>
          )}

          {/* Name */}
          <span className="flex-1 text-left truncate">{route.name}</span>

          {/* Loading indicator */}
          {isLoading && (
            <span className="ml-2 flex-shrink-0">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            </span>
          )}

          {/* Expand/collapse indicator */}
          {route.children && route.children.length > 0 && !isLoading && (
            <span className="ml-2 flex-shrink-0">
              <svg
                className={`h-4 w-4 transform transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          )}
        </button>

        {/* Error display */}
        {error && (
          <div className="mt-1 px-3">
            <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-800 hover:text-red-900"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Children */}
        {isExpanded && route.children && (
          <div className="mt-1 space-y-1">
            {route.children.map(childRoute => (
              <NavigationItem
                key={childRoute.id}
                route={childRoute}
                isActive={false} // Child active state would be determined by location
                level={level + 1}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </NavigationErrorBoundary>
  );
};

// Module section component
interface NavigationModuleProps {
  module: NavigationModule;
  userType: string;
  currentPath: string;
  onNavigate: (route: NavigationRoute) => void;
  isCollapsed?: boolean;
}

const NavigationModuleSection: React.FC<NavigationModuleProps> = ({
  module,
  userType,
  currentPath,
  onNavigate,
  isCollapsed = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(!isCollapsed);

  // Filter routes for current user type
  const filteredRoutes = module.routes.filter(
    route =>
      route.isActive &&
      (!route.userTypes || route.userTypes.length === 0 || route.userTypes.includes(userType))
  );

  if (filteredRoutes.length === 0) {
    return null;
  }

  return (
    <NavigationErrorBoundary>
      <div className="mb-6">
        {/* Module header */}
        {!isCollapsed && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
          >
            <span>{module.name.replace(' Module', '')}</span>
            <svg
              className={`h-4 w-4 transform transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Module routes */}
        {(isExpanded || isCollapsed) && (
          <div className="space-y-1">
            {filteredRoutes.map(route => {
              const isActive =
                currentPath === route.path || currentPath.startsWith(route.path + '/');

              return (
                <NavigationItem
                  key={route.id}
                  route={route}
                  isActive={isActive}
                  level={0}
                  onNavigate={onNavigate}
                />
              );
            })}
          </div>
        )}
      </div>
    </NavigationErrorBoundary>
  );
};

// Main modular navigation component
interface ModularNavigationProps {
  userType: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

const ModularNavigation: React.FC<ModularNavigationProps> = ({
  userType,
  isCollapsed = false,
  onToggleCollapse,
  className = '',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [modules, setModules] = useState<NavigationModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Initialize navigation service and load modules
  const loadModules = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const navigationService = NavigationService.getInstance();
      const hierarchy = navigationService.getNavigationHierarchy(userType);

      // Validate the configuration
      const validation = navigationService.validateConfiguration();
      if (!validation.isValid) {
        console.warn('[ModularNavigation] Configuration validation failed:', validation.errors);
      }

      setModules(hierarchy);
      debugLog('general', 'log_statement', '[ModularNavigation] Loaded modules:', hierarchy.length)
    } catch (err) {
      console.error('[ModularNavigation] Failed to load modules:', err);
      setError('Failed to load navigation. Please try refreshing the page.');

      // Auto-retry with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadModules();
        }, delay);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userType, retryCount]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  // Safe navigation handler
  const handleNavigate = useCallback(
    async (route: NavigationRoute) => {
      try {
        debugLog('general', 'log_statement', '[ModularNavigation] Navigating to:', route.path)

        if (route.path.startsWith('http')) {
          // External link
          window.open(route.path, '_blank', 'noopener,noreferrer');
        } else {
          // Internal navigation
          navigate(route.path);
        }
      } catch (err) {
        console.error('[ModularNavigation] Navigation failed:', err);
        // Fallback to window.location
        try {
          window.location.href = route.path;
        } catch (fallbackErr) {
          console.error('[ModularNavigation] Fallback navigation failed:', fallbackErr);
        }
      }
    },
    [navigate]
  );

  // Loading state
  if (isLoading && modules.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error && modules.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Navigation Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-3">
                <button
                  onClick={() => {
                    setRetryCount(0);
                    loadModules();
                  }}
                  className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <nav className={`h-full overflow-y-auto ${className}`} aria-label="Main navigation">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center">
            <img src="/eva-logo.svg" alt="EVA Platform" className="h-8 w-auto" />
            <span className="ml-2 text-lg font-bold text-blue-600">EVA</span>
          </div>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            <svg
              className={`h-5 w-5 transform transition-transform duration-200 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation modules */}
      <div className="p-4 space-y-2">
        {modules.map(module => (
          <NavigationModuleSection
            key={module.id}
            module={module}
            userType={userType}
            currentPath={location.pathname}
            onNavigate={handleNavigate}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="mt-auto p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            {modules.length} modules loaded
            {error && <div className="mt-1 text-amber-600">⚠️ Some features may be limited</div>}
          </div>
        </div>
      )}
    </nav>
  );
};

export default ModularNavigation;
