import {
  ChartBarIcon,
  CloudArrowUpIcon,
  CogIcon,
  DocumentIcon,
  HomeIcon,
  PlayIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const mainNavItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      current: isActive('/dashboard'),
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      current: isActive('/analytics'),
    },
    {
      name: 'Users',
      href: '/users',
      icon: UserGroupIcon,
      current: isActive('/users'),
    },
    {
      name: 'Documents',
      href: '/documents',
      icon: DocumentIcon,
      current: isActive('/documents'),
    },
  ];

  // Admin-only navigation items
  const adminNavItems = [
    {
      name: 'Stream Management',
      href: '/admin/stream',
      icon: VideoCameraIcon,
      current: isActive('/admin/stream'),
      children: [
        {
          name: 'Video Library',
          href: '/admin/stream/library',
          icon: PlayIcon,
          current: isActive('/admin/stream/library'),
        },
        {
          name: 'Upload Videos',
          href: '/admin/stream/upload',
          icon: CloudArrowUpIcon,
          current: isActive('/admin/stream/upload'),
        },
        {
          name: 'Stream Analytics',
          href: '/admin/stream/analytics',
          icon: ChartBarIcon,
          current: isActive('/admin/stream/analytics'),
        },
      ],
    },
    {
      name: 'System Settings',
      href: '/admin/settings',
      icon: CogIcon,
      current: isActive('/admin/settings'),
    },
  ];

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <img className="h-8 w-auto" src="/logo.svg" alt="EVA AI" />
          <span className="ml-2 text-xl font-bold text-gray-900">EVA AI</span>
        </div>

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            {/* Main Navigation */}
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {mainNavItems.map(item => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`
                        group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                        ${
                          item.current
                            ? 'bg-gray-50 text-indigo-600'
                            : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      <item.icon
                        className={`h-6 w-6 shrink-0 ${
                          item.current
                            ? 'text-indigo-600'
                            : 'text-gray-400 group-hover:text-indigo-600'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {/* Admin-Only Section */}
            {isAdmin && (
              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400 border-t border-gray-200 pt-4">
                  SYSTEM ADMINISTRATION
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {adminNavItems.map(item => (
                    <li key={item.name}>
                      <div>
                        <Link
                          to={item.href}
                          className={`
                            group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                            ${
                              item.current
                                ? 'bg-red-50 text-red-600'
                                : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                            }
                          `}
                        >
                          <item.icon
                            className={`h-6 w-6 shrink-0 ${
                              item.current
                                ? 'text-red-600'
                                : 'text-gray-400 group-hover:text-red-600'
                            }`}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>

                        {/* Sub-navigation for Stream Management */}
                        {item.children && item.current && (
                          <ul className="mt-1 ml-8 space-y-1">
                            {item.children.map(child => (
                              <li key={child.name}>
                                <Link
                                  to={child.href}
                                  className={`
                                    group flex gap-x-3 rounded-md p-2 text-sm leading-6
                                    ${
                                      child.current
                                        ? 'bg-red-100 text-red-700 font-medium'
                                        : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                                    }
                                  `}
                                >
                                  <child.icon
                                    className={`h-5 w-5 shrink-0 ${
                                      child.current
                                        ? 'text-red-600'
                                        : 'text-gray-400 group-hover:text-red-600'
                                    }`}
                                    aria-hidden="true"
                                  />
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            )}

            {/* User Info */}
            <li className="-mx-6 mt-auto">
              <div className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 border-t border-gray-200">
                <img
                  className="h-8 w-8 rounded-full bg-gray-50"
                  src={user?.picture || '/default-avatar.png'}
                  alt=""
                />
                <span className="sr-only">Your profile</span>
                <div className="flex flex-col">
                  <span aria-hidden="true">{user?.name}</span>
                  {isAdmin && (
                    <span className="text-xs text-red-600 font-medium">System Admin</span>
                  )}
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
