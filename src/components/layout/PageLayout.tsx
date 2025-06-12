import React, { ReactNode, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

export interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  backPath?: string;
  fullWidth?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  showBackButton = false,
  backPath = '/',
  fullWidth = false,
}) => {
  const userContext = useContext(UserContext);

  // Get sidebar state
  const isSidebarCollapsed = userContext?.sidebarCollapsed || false;

  // Set CSS variable for sidebar width
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty(
        '--sidebar-width',
        isSidebarCollapsed ? '6.8rem' : '19.36rem'
      );
    }
  }, [isSidebarCollapsed]);

  return (
    <div className={`${isSidebarCollapsed ? 'main-content-collapsed' : 'main-content'}`}>
      <div className={`page-container ${fullWidth ? 'max-w-none' : ''}`}>
        {title && (
          <div className="page-header mb-6 flex items-center">
            {showBackButton && (
              <Link to={backPath} className="mr-3 text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

export default PageLayout;
