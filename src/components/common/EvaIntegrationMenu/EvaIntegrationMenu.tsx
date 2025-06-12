import React, { useEffect, useRef } from 'react';
import { Upload, Github, Cloud, Shield, BarChart, FileText } from 'lucide-react';

interface EvaIntegrationMenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

interface EvaIntegrationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (itemKey: string) => void;
  customItems?: EvaIntegrationMenuItem[];
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  maxHeight?: string;
  className?: string;
}

// Utility function for default item clicks - does nothing but prevents ESLint errors
const noop = () => {
  /* No operation */
};

const defaultMenuItems: EvaIntegrationMenuItem[] = [
  {
    key: 'upload-file',
    label: 'Upload a file',
    icon: <Upload size={18} />,
    onClick: noop,
  },
  {
    key: 'github',
    label: 'Add from GitHub',
    icon: <Github size={18} />,
    onClick: noop,
  },
  {
    key: 'onedrive',
    label: 'OneDrive Search',
    icon: <Cloud size={18} />,
    onClick: noop,
  },
  {
    key: 'filelock',
    label: 'Add Filelock Forms & Documents',
    icon: <Shield size={18} />,
    onClick: noop,
  },
  {
    key: 'credit-agency',
    label: 'Add Credit Agency Reports',
    icon: <BarChart size={18} />,
    onClick: noop,
  },
  {
    key: 'financial-accounts',
    label: 'Add Financial Accounts & Reports',
    icon: <FileText size={18} />,
    onClick: noop,
  },
];

/**
 * EvaIntegrationMenu React component for an AI chat interface.
 * This component displays a dropdown menu with file integration options.
 *
 * @component
 * @example
 * <EvaIntegrationMenu
 *   isOpen={isMenuOpen}
 *   onClose={() => setIsMenuOpen(false)}
 *   onItemClick={(itemKey) => handleItemClick(itemKey)}
 * />
 */
const EvaIntegrationMenu: React.FC<EvaIntegrationMenuProps> = ({
  isOpen,
  onClose,
  onItemClick,
  customItems,
  position = 'bottom-left',
  maxHeight = '300px',
  className = '',
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const itemsToRender = customItems || defaultMenuItems;

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        onClose();
      }
      // TODO: Implement arrow key navigation for items
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Determine position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'origin-bottom-right right-0';
      case 'top-left':
        return 'origin-top-left left-0 bottom-full mb-2';
      case 'top-right':
        return 'origin-top-right right-0 bottom-full mb-2';
      case 'bottom-left':
      default:
        return 'origin-top-left left-0';
    }
  };

  return (
    <div
      ref={menuRef}
      className={`absolute z-50 mt-2 w-72 rounded-lg shadow-lg bg-[#2a2a2a] ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in ${getPositionClasses()} ${className}`}
      style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' }}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
    >
      <div className="py-1" role="none" style={{ maxHeight: maxHeight, overflowY: 'auto' }}>
        {itemsToRender.map(item => (
          <button
            key={item.key}
            onClick={() => {
              if (item.disabled || item.isLoading) return;
              item.onClick();
              onItemClick(item.key);
            }}
            disabled={item.disabled || item.isLoading}
            className="group flex items-center w-full px-4 py-3 text-sm text-white rounded-md
                       hover:bg-[linear-gradient(135deg,#ff4d4d_0%,#ff8080_100%)]
                       focus:outline-none focus:bg-gray-700
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-150 ease-in-out"
            role="menuitem"
            aria-disabled={item.disabled || item.isLoading}
          >
            {item.isLoading ? (
              <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="mr-3 text-gray-300 group-hover:text-white transition-colors duration-150 ease-in-out">
                {item.icon}
              </span>
            )}
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EvaIntegrationMenu;
