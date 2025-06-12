import {
  faChevronDown,
  faRobot,
  faTachometerAlt,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DemoContextType,
  USER_TYPE_CONFIGS,
  UserRoleTypeString,
  UserTypeConfig,
  getRoleColor,
  getRoleDescription,
  getUserRoleDisplayName,
  getUserTypeConfig,
  mapUserRoleTypeToUserRole,
} from '../../types/user';
import EnhancedHeaderSelector from './EnhancedHeaderSelector';

interface TopNavbarProps {
  currentTransaction?: string;
  demoContext?: DemoContextType;
  showUserTypeSelector?: boolean;
}

const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTransaction,
  demoContext = 'user',
  showUserTypeSelector = true,
}) => {
  const navigate = useNavigate();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isUserTypeDropdownOpen, setIsUserTypeDropdownOpen] = useState(false);
  const [isSpecificRoleDropdownOpen, setIsSpecificRoleDropdownOpen] = useState(false);
  const [currentUserType, setCurrentUserType] = useState<UserRoleTypeString>('borrower');
  const [currentSpecificRole, setCurrentSpecificRole] = useState<string>('default_role');
  const [isLoading, setIsLoading] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const userTypeDropdownRef = useRef<HTMLDivElement>(null);
  const specificRoleDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize from localStorage or route
  useEffect(() => {
    const initializeUserType = () => {
      try {
        // Try to get from localStorage first
        const savedUserType = localStorage.getItem('currentUserType') as UserRoleTypeString;
        const savedSpecificRole = localStorage.getItem('currentSpecificRole');

        if (savedUserType) {
          setCurrentUserType(savedUserType);
          if (savedSpecificRole) {
            setCurrentSpecificRole(savedSpecificRole);
          }
        } else {
          // Fallback to route-based detection
          const path = window.location.pathname;
          let detectedRole: UserRoleTypeString = 'borrower';

          if (path.includes('/admin')) detectedRole = 'admin';
          else if (path.includes('/lender')) detectedRole = 'lender';
          else if (path.includes('/broker')) detectedRole = 'broker';
          else if (path.includes('/vendor')) detectedRole = 'vendor';

          setCurrentUserType(detectedRole);
        }
      } catch (error) {
        console.warn('Error initializing user type:', error);
        setCurrentUserType('borrower');
      }
    };

    initializeUserType();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (
        userTypeDropdownRef.current &&
        !userTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserTypeDropdownOpen(false);
      }
      if (
        specificRoleDropdownRef.current &&
        !specificRoleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSpecificRoleDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter user types based on demo context
  const getFilteredUserTypes = (): UserTypeConfig[] => {
    switch (demoContext) {
      case 'core':
        return USER_TYPE_CONFIGS.filter(config => config.category === 'core');
      case 'admin':
        return USER_TYPE_CONFIGS.filter(config => config.category === 'admin');
      case 'user':
        return USER_TYPE_CONFIGS.filter(config => config.category === 'user');
      case 'all':
        return USER_TYPE_CONFIGS;
      default:
        return USER_TYPE_CONFIGS.filter(
          config => config.type === demoContext || config.category === 'user',
        );
    }
  };

  const handleUserTypeSelect = (roleString: UserRoleTypeString) => {
    setIsLoading(true);

    try {
      // Update state
      setCurrentUserType(roleString);
      setCurrentSpecificRole('default_role');

      // Save to localStorage with error handling
      try {
        localStorage.setItem('currentUserType', roleString);
        localStorage.setItem('currentSpecificRole', 'default_role');
      } catch (storageError) {
        console.warn('Failed to save to localStorage:', storageError);
      }

      // Dispatch multiple events for different components
      const events = [
        new CustomEvent('userRoleChanged', {
          detail: {
            role: roleString,
            specificRole: 'default_role',
            timestamp: Date.now(),
          },
        }),
        new CustomEvent('userTypeChanged', {
          detail: {
            userType: roleString,
            specificRole: 'default_role',
            timestamp: Date.now(),
          },
        }),
        new CustomEvent('roleSwitch', {
          detail: {
            newRole: roleString,
            oldRole: currentUserType,
            timestamp: Date.now(),
          },
        }),
        new CustomEvent('forceRefresh', {
          detail: {
            reason: 'userTypeChange',
            timestamp: Date.now(),
          },
        }),
      ];

      // Dispatch all events
      events.forEach(event => {
        try {
          window.dispatchEvent(event);
          document.dispatchEvent(event);
        } catch (eventError) {
          console.warn('Failed to dispatch event:', eventError);
        }
      });

      // Navigate to appropriate dashboard
      const coreRole = mapUserRoleTypeToUserRole(roleString);
      navigate(`/${coreRole}/dashboard`);

      // Close dropdown
      setIsUserTypeDropdownOpen(false);
    } catch (error) {
      console.error('Error changing user type:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleSpecificRoleSelect = (role: string) => {
    setCurrentSpecificRole(role);
    localStorage.setItem('currentSpecificRole', role);
    setIsSpecificRoleDropdownOpen(false);

    // Dispatch role change event
    window.dispatchEvent(
      new CustomEvent('specificRoleChanged', {
        detail: { specificRole: role, timestamp: Date.now() },
      }),
    );
  };

  const handleGoToDashboard = () => {
    const coreRole = mapUserRoleTypeToUserRole(currentUserType);
    navigate(`/${coreRole}/dashboard`);
  };

  const displayUserRole = () => {
    try {
      const config = getUserTypeConfig(currentUserType);
      return config?.displayName || getUserRoleDisplayName(currentUserType);
    } catch (error) {
      console.warn('Error getting display name:', error);
      return currentUserType.charAt(0).toUpperCase() + currentUserType.slice(1);
    }
  };

  const getSpecificRoleDisplayName = (role: string): string => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleEvaAIChatClick = () => {
    const coreRole = mapUserRoleTypeToUserRole(currentUserType);
    navigate(`/${coreRole}/eva-ai-assistant`);
  };

  const currentConfig = getUserTypeConfig(currentUserType);

  return (
    <nav className="bg-white flex items-center justify-between border-b border-gray-200 px-4 py-3">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleGoToDashboard}
          className="text-blue-600 transition-colors hover:text-blue-800"
          title="Go to Dashboard"
        >
          <FontAwesomeIcon icon={faTachometerAlt} />
        </button>

        {currentTransaction && (
          <span className="text-sm text-gray-600">
            Transaction: <span className="font-medium">{currentTransaction}</span>
          </span>
        )}
      </div>

      {/* Center - User Type Selector */}
      {showUserTypeSelector && (
        <div className="flex items-center space-x-3">
          {/* Main User Type Dropdown */}
          <div className="relative" ref={userTypeDropdownRef}>
            <button
              onClick={() => setIsUserTypeDropdownOpen(!isUserTypeDropdownOpen)}
              disabled={isLoading}
              className={`flex items-center space-x-2 rounded-lg border px-4 py-2 transition-all ${
                isLoading
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:border-gray-400 hover:shadow-sm'
              }`}
            >
              <span className={`font-medium ${getRoleColor(currentUserType)}`}>
                {displayUserRole()}
              </span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`text-gray-400 transition-transform ${
                  isUserTypeDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isUserTypeDropdownOpen && (
              <div className="bg-white absolute left-0 top-full z-50 mt-1 max-h-96 w-64 overflow-y-auto rounded-lg border border-gray-200 shadow-lg">
                {getFilteredUserTypes().map(config => (
                  <button
                    key={config.type}
                    onClick={() => handleUserTypeSelect(config.type)}
                    className={`w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 last:border-b-0 ${
                      currentUserType === config.type ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-medium ${getRoleColor(config.type)}`}>
                          {config.displayName}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {getRoleDescription(config.type)}
                        </div>
                      </div>
                      <div className="text-xs capitalize text-gray-400">{config.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specific Role Dropdown */}
          {currentConfig && currentConfig.specificRoles.length > 1 && (
            <>
              <span className="text-gray-400">→</span>
              <div className="relative" ref={specificRoleDropdownRef}>
                <button
                  onClick={() => setIsSpecificRoleDropdownOpen(!isSpecificRoleDropdownOpen)}
                  className="bg-white flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-2 transition-all hover:border-gray-400 hover:shadow-sm"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {getSpecificRoleDisplayName(currentSpecificRole)}
                  </span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-xs text-gray-400 transition-transform ${
                      isSpecificRoleDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isSpecificRoleDropdownOpen && (
                  <div className="bg-white absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 shadow-lg">
                    {currentConfig.specificRoles.map(role => (
                      <button
                        key={role}
                        onClick={() => handleSpecificRoleSelect(role)}
                        className={`w-full border-b border-gray-100 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 last:border-b-0 ${
                          currentSpecificRole === role
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700'
                        }`}
                      >
                        {getSpecificRoleDisplayName(role)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Enhanced Header Selector */}
      <EnhancedHeaderSelector
        className="mx-4 max-w-2xl flex-1"
        showCustomerSelector={true}
        showTransactionSelector={true}
      />

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Primary Dashboard Button */}
        <button
          onClick={() => navigate('/primary-dashboard')}
          className="text-white flex transform items-center space-x-2 rounded-lg bg-gradient-to-r from-green-600 to-blue-600 px-3 py-2 transition-all hover:scale-105 hover:from-green-700 hover:to-blue-700"
          title="Primary Dashboard"
        >
          <FontAwesomeIcon icon={faTachometerAlt} />
          <span className="hidden text-sm font-medium md:inline">Dashboard</span>
        </button>

        {/* EVA AI Assistant Button */}
        <button
          onClick={handleEvaAIChatClick}
          className="text-white flex transform items-center space-x-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-2 transition-all hover:scale-105 hover:from-purple-700 hover:to-blue-700"
          title="EVA AI Assistant"
        >
          <FontAwesomeIcon icon={faRobot} />
          <span className="hidden text-sm font-medium md:inline">EVA AI</span>
        </button>

        {/* User Menu */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center space-x-2 text-gray-700 transition-colors hover:text-gray-900"
          >
            <FontAwesomeIcon icon={faUser} className="text-gray-500" />
            <span className="font-medium">Demo User</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`text-gray-400 transition-transform ${
                isUserDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isUserDropdownOpen && (
            <div className="bg-white absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 shadow-lg">
              <div className="border-b border-gray-200 px-4 py-3">
                <div className="text-sm font-medium text-gray-900">Demo User</div>
                <div className="mt-1 text-xs text-gray-500">Role: {displayUserRole()}</div>
              </div>
              <button
                onClick={() => {
                  // Handle logout or settings
                  setIsUserDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
