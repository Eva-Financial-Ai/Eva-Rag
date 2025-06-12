import React, { useState, useRef, useEffect } from 'react';
import { useUserType } from '../../contexts/UserTypeContext';
import { UserType, roleDisplayNames, userTypeToRolesMap } from '../../types/UserTypes';

interface EnhancedUserTypeSelectorProps {
  className?: string;
  compact?: boolean;
}

const EnhancedUserTypeSelector: React.FC<EnhancedUserTypeSelectorProps> = ({
  className = '',
  compact = false
}) => {
  const {
    userType,
    specificRole,
    setUserType,
    setSpecificRole,
    getUserTypeDisplayName,
    getSpecificRoleDisplayName,
  } = useUserType();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Available user types with metadata
  const userTypeOptions = [
    {
      type: UserType.BUSINESS,
      label: 'Business Owner',
      icon: '🏢',
      description: 'Apply for financing',
      color: 'green'
    },
    {
      type: UserType.LENDER,
      label: 'Lender',
      icon: '🏦',
      description: 'Underwrite loans',
      color: 'blue'
    },
    {
      type: UserType.BROKERAGE,
      label: 'Broker',
      icon: '🤝',
      description: 'Connect clients',
      color: 'purple'
    },
    {
      type: UserType.VENDOR,
      label: 'Vendor',
      icon: '📦',
      description: 'Manage inventory',
      color: 'red'
    },
    {
      type: UserType.ADMIN,
      label: 'Administrator',
      icon: '⚙️',
      description: 'System admin',
      color: 'gray'
    },
    {
      type: UserType.DEVELOPER,
      label: 'Developer',
      icon: '💻',
      description: 'Platform dev',
      color: 'indigo'
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserTypeSelect = (newUserType: UserType) => {
    setUserType(newUserType);
    
    // Get available roles for the new user type
    const userTypeString = Object.keys(userTypeToRolesMap).find(key => 
      (key === newUserType.toLowerCase()) || 
      (key === 'borrower' && newUserType === UserType.BUSINESS) ||
      (key === 'lender' && newUserType === UserType.LENDER) ||
      (key === 'broker' && newUserType === UserType.BROKERAGE) ||
      (key === 'vendor' && newUserType === UserType.VENDOR)
    );
    
    const availableRoles = userTypeToRolesMap[userTypeString || 'borrower'] || [];
    
    // Auto-select first available role
    if (availableRoles.length > 0) {
      setSpecificRole(availableRoles[0]);
    }
    
    setIsOpen(false);
  };

  const currentUserTypeOption = userTypeOptions.find(option => option.type === userType);

  if (compact) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <span className="mr-2">{currentUserTypeOption?.icon}</span>
          <span>{getUserTypeDisplayName()}</span>
          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div 
            className="bg-white rounded-md shadow-lg border border-gray-200 z-[9999]"
            style={{
              position: 'fixed',
              top: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().bottom + 8 : 'auto',
              left: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().left : 'auto',
              width: '280px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
          >
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Switch Role</h3>
              
              <div className="space-y-2">
                {userTypeOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleUserTypeSelect(option.type)}
                    className={`w-full text-left p-3 rounded-md border transition-colors duration-200 ${
                      userType === option.type
                        ? 'bg-primary-50 text-primary-700 border-primary-200'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-3">{option.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                      {userType === option.type && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Show specific role if available */}
              {getSpecificRoleDisplayName() && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Current Role:</div>
                  <div className="text-sm font-medium text-gray-900">{getSpecificRoleDisplayName()}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full mode is simplified but still comprehensive
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <span className="mr-2">{currentUserTypeOption?.icon}</span>
        <div className="flex flex-col items-start">
          <span>{getUserTypeDisplayName()}</span>
          {getSpecificRoleDisplayName() && (
            <span className="text-xs text-gray-500">{getSpecificRoleDisplayName()}</span>
          )}
        </div>
        <svg
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]"
          style={{
            position: 'fixed',
            top: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().bottom + 8 : 'auto',
            left: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().left : 'auto',
            width: '320px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Switch User Role</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Type Selection */}
            <div className="space-y-2">
              {userTypeOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleUserTypeSelect(option.type)}
                  className={`w-full text-left p-3 rounded-md border transition-colors duration-200 ${
                    userType === option.type
                      ? 'bg-primary-50 text-primary-700 border-primary-200'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{option.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                    {userType === option.type && (
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Current Role Display */}
            {getSpecificRoleDisplayName() && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Current Specific Role:</div>
                <div className="text-sm font-medium text-gray-900">{getSpecificRoleDisplayName()}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedUserTypeSelector; 