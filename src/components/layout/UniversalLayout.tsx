import React, { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';

interface UniversalLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backPath?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
  className?: string;
  headerActions?: ReactNode;
  breadcrumbs?: Array<{ label: string; path?: string }>;
}

/**
 * UniversalLayout - A consistent layout wrapper for all pages
 *
 * Features:
 * - Consistent max-width container (1440px)
 * - Standardized padding and margins
 * - Responsive breakpoints
 * - Consistent header with optional back button
 * - Breadcrumb support
 * - Grid system integration
 */
const UniversalLayout: React.FC<UniversalLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  backPath,
  fullWidth = false,
  noPadding = false,
  className,
  headerActions,
  breadcrumbs,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackClick = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="universal-layout min-h-screen bg-gray-50">
      {/* Page Header */}
      {(title || breadcrumbs) && (
        <div className="universal-layout-header bg-white border-b border-gray-200">
          <div
            className={clsx(
              'universal-container',
              fullWidth ? 'max-w-full' : 'max-w-[1440px]',
              'mx-auto px-4 sm:px-6 lg:px-8'
            )}
          >
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="py-3" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm">
                  {breadcrumbs.map((crumb, index) => (
                    <li key={index} className="flex items-center">
                      {index > 0 && (
                        <svg
                          className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {crumb.path ? (
                        <a
                          href={crumb.path}
                          onClick={e => {
                            e.preventDefault();
                            navigate(crumb.path!);
                          }}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {crumb.label}
                        </a>
                      ) : (
                        <span className="text-gray-900 font-medium">{crumb.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* Title Section */}
            {title && (
              <div className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {showBackButton && (
                      <button
                        onClick={handleBackClick}
                        className="inline-flex items-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        aria-label="Go back"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                    )}
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
                    </div>
                  </div>
                  {headerActions && (
                    <div className="flex items-center space-x-3">{headerActions}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={clsx('universal-layout-main', className)}>
        <div
          className={clsx(
            'universal-container',
            fullWidth ? 'max-w-full' : 'max-w-[1440px]',
            'mx-auto',
            !noPadding && 'px-4 sm:px-6 lg:px-8 py-6 sm:py-8'
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default UniversalLayout;
