import { ChevronRightIcon } from '@heroicons/react/24/outline';
import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { NavigationItem as NavItemType } from '../../config/navigationConfig';
import { UserContext } from '../../contexts/UserContext';

import { debugLog } from '../../utils/auditLogger';

interface NavigationItemProps {
  item: NavItemType;
  isActive: boolean;
  isCollapsed: boolean;
  level?: number;
  onClick: (path?: string) => void;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  isActive,
  isCollapsed,
  level = 0,
  onClick,
}) => {
  const location = useLocation();
  const { setIsEvaChatOpen } = useContext(UserContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  // Auto-expand if a child is active
  useEffect(() => {
    if (hasChildren && item.children) {
      const hasActiveChild = item.children.some(child => {
        if (!child.path) return false;
        return location.pathname === child.path || location.pathname.startsWith(child.path + '/');
      });
      if (hasActiveChild) {
        setIsExpanded(true);
      }
    }
  }, [location.pathname, hasChildren, item.children]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if this is the EVA widget trigger
    if ((item as any).isEVAWidget) {
      debugLog('general', 'log_statement', '[NavigationItem] Opening EVA widget from sidebar')
      if (setIsEvaChatOpen) {
        setIsEvaChatOpen(true);
      }
      return;
    }

    if (hasChildren && !item.path) {
      // If it has children but no path, just toggle expand
      setIsExpanded(!isExpanded);
    } else if (item.path) {
      // If it has a path, navigate
      onClick(item.path);
      // If it also has children, toggle expand
      if (hasChildren) {
        setIsExpanded(!isExpanded);
      }
    }
  };

  // Check if this specific item is active
  const isItemActive = (itemToCheck: NavItemType): boolean => {
    if (!itemToCheck.path) return false;
    const currentPath = location.pathname;
    return currentPath === itemToCheck.path || currentPath.startsWith(itemToCheck.path + '/');
  };

  const baseClasses = `
    flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md
    transition-all duration-200 cursor-pointer relative
    ${level > 0 ? 'ml-8' : ''}
  `;

  const activeClasses = isActive
    ? 'bg-primary-50 text-primary-700'
    : 'text-gray-700 hover:bg-gray-50';

  // Badge color mapping based on badge text
  const badgeColorMap: Record<string, string> = {
    New: 'bg-green-100 text-green-800',
    Beta: 'bg-blue-100 text-blue-800',
    Pro: 'bg-purple-100 text-purple-800',
    Enterprise: 'bg-indigo-100 text-indigo-800',
    Premium: 'bg-yellow-100 text-yellow-800',
    AI: 'bg-teal-100 text-teal-800',
    Updated: 'bg-orange-100 text-orange-800',
    Hot: 'bg-red-100 text-red-800',
  };

  return (
    <li className="relative">
      <button
        onClick={handleClick}
        className={`${baseClasses} ${activeClasses} group w-full`}
        title={isCollapsed ? item.name : undefined}
      >
        {/* Active indicator bar */}
        {isActive && (
          <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-md bg-primary-600" />
        )}

        <span className={`flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
          {item.icon}
        </span>

        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{item.name}</span>

            {item.badge && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeColorMap[item.badge as keyof typeof badgeColorMap] || badgeColorMap.New}`}
              >
                {item.badge}
              </span>
            )}

            {hasChildren && (
              <ChevronRightIcon
                className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              />
            )}
          </>
        )}

        {/* Tooltip for collapsed sidebar */}
        {isCollapsed && (
          <div className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-sm text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
            {item.name}
            {item.badge && <span className="ml-2 text-xs opacity-75">({item.badge})</span>}
          </div>
        )}
      </button>

      {/* Children */}
      {!isCollapsed && hasChildren && isExpanded && (
        <ul className="mt-1 space-y-1">
          {item.children!.map(child => (
            <NavigationItem
              key={child.id}
              item={child}
              isActive={isItemActive(child)}
              isCollapsed={isCollapsed}
              level={level + 1}
              onClick={onClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default NavigationItem;
