import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { navigationConfig } from '../../config/navigationConfig';
import { UserContext } from '../../contexts/UserContext';
import NavigationItem from './NavigationItem';

import { debugLog } from '../../utils/auditLogger';

interface SideNavigationProps {
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  orientation?: 'portrait' | 'landscape';
}

const SideNavigation: React.FC<SideNavigationProps> = ({
  deviceType = 'desktop',
  orientation = 'landscape',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, setSidebarCollapsed, userRole } = useContext(UserContext);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isSmallScreen = isMobile || (isTablet && orientation === 'portrait');

  // Dynamic navigation config that updates dashboard path based on user role
  const dynamicNavigationConfig = React.useMemo(() => {
    const dashboardPath = userRole ? `/dashboard/${userRole.replace('_', '-')}` : '/dashboard';
    debugLog('general', 'log_statement', `🧭 Dynamic dashboard path: ${dashboardPath} for role: ${userRole}`)

    return navigationConfig.map(item => {
      if (item.id === 'dashboard') {
        return {
          ...item,
          path: dashboardPath,
        };
      }
      return item;
    });
  }, [userRole]);

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    if (isSmallScreen && setSidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [isSmallScreen, setSidebarCollapsed]);

  // Auto-expand parent items based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const newExpandedItems = new Set<string>();

    // Find parent items that should be expanded
    dynamicNavigationConfig.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          child =>
            child.path && (currentPath === child.path || currentPath.startsWith(child.path + '/')),
        );
        if (hasActiveChild) {
          newExpandedItems.add(item.id);
        }
      }
    });

    setExpandedItems(newExpandedItems);
  }, [location.pathname, dynamicNavigationConfig]);

  // Handle navigation click - simplified to use React Router directly
  const handleNavClick = useCallback(
    (path?: string) => {
      if (path) {
        debugLog('general', 'log_statement', `[SideNavigation] Navigating to: ${path}`)
        try {
          navigate(path);

          // Close sidebar on mobile after navigation
          if (isMobile && !sidebarCollapsed) {
            setSidebarCollapsed?.(true);
            setIsOverlayVisible(false);
          }
        } catch (error) {
          console.error('[SideNavigation] Navigation error:', error);
        }
      }
    },
    [navigate, isMobile, sidebarCollapsed, setSidebarCollapsed],
  );

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    if (setSidebarCollapsed) {
      setSidebarCollapsed(!sidebarCollapsed);
      setIsOverlayVisible(!sidebarCollapsed && isMobile);
    }
  }, [sidebarCollapsed, setSidebarCollapsed, isMobile]);

  // Check if path is active
  const isPathActive = (path: string): boolean => {
    const currentPath = location.pathname;
    if (path === '/dashboard' && currentPath === '/') return true;
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  // Check if item is active (including children)
  const isItemActive = (item: any): boolean => {
    if (item.path && isPathActive(item.path)) return true;
    if (item.children) {
      return item.children.some((child: any) => child.path && isPathActive(child.path));
    }
    return false;
  };

  // Sidebar width based on state
  const sidebarWidth = sidebarCollapsed
    ? isMobile
      ? 'w-16'
      : 'w-20'
    : isMobile
      ? 'w-full'
      : 'w-64';

  return (
    <>
      {/* Sidebar */}
      <nav
        className={`fixed left-0 z-30 h-full border-r border-gray-200 bg-white transition-all duration-300 ease-in-out ${sidebarWidth} ${isMobile && !sidebarCollapsed ? 'translate-x-0' : ''} ${isMobile && sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'} `}
        style={{
          top: '0', // Start from the very top of the page
          height: '100vh', // Full viewport height
        }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div className={`flex items-center ${sidebarCollapsed ? 'w-full justify-center' : ''}`}>
              {sidebarCollapsed ? (
                <Link to="/" className="flex-shrink-0">
                  <img
                    className="h-8 w-8"
                    src={`${process.env.PUBLIC_URL}/eva-favicon.png`}
                    alt="EVA"
                  />
                </Link>
              ) : (
                <Link to="/" className="flex-shrink-0">
                  <img
                    className="h-10 w-auto"
                    src={`${process.env.PUBLIC_URL}/eva-logo.png`}
                    alt="EVA Platform"
                  />
                </Link>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {dynamicNavigationConfig.map(item => (
                <NavigationItem
                  key={item.id}
                  item={item}
                  isActive={isItemActive(item)}
                  isCollapsed={sidebarCollapsed}
                  onClick={handleNavClick}
                />
              ))}
            </ul>
          </div>

          {/* Toggle Button */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={toggleSidebar}
              className="flex w-full items-center justify-center rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronDoubleRightIcon className="h-5 w-5" />
              ) : (
                <ChevronDoubleLeftIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMobile && !sidebarCollapsed && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50" onClick={toggleSidebar} />
      )}

      {/* Main Content Padding */}
      <div className={`${sidebarWidth} flex-shrink-0 transition-all duration-300 ease-in-out`} />
    </>
  );
};

export default SideNavigation;
