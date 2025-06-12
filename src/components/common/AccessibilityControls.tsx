import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';
import useTranslation from '../../i18n/useTranslation';

interface AccessibilityControlsProps {
  className?: string;
}

/**
 * AccessibilityControls - Allows users to adjust UI size and contrast for better accessibility
 */
const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const userContext = useContext(UserContext);

  // Font size control
  const [fontSize, setFontSize] = useState<number>(1);

  // Apply font size to document root
  useEffect(() => {
    const html = document.documentElement;
    html.style.fontSize = `${fontSize}rem`;

    // Save to localStorage
    localStorage.setItem('accessibility_fontSize', fontSize.toString());

    return () => {
      // Clean up when component unmounts
      html.style.fontSize = '1rem';
    };
  }, [fontSize]);

  // Load saved font size on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility_fontSize');
    if (savedFontSize) {
      setFontSize(parseFloat(savedFontSize));
    }
  }, []);

  // Handle theme toggle (dark mode)
  const handleThemeToggle = () => {
    const newTheme = userContext?.theme === 'dark' ? 'light' : 'dark';
    userContext?.setTheme?.(newTheme);
  };

  // Increase font size
  const increaseFontSize = () => {
    if (fontSize < 1.5) {
      setFontSize(prev => Math.min(prev + 0.1, 1.5));
    }
  };

  // Decrease font size
  const decreaseFontSize = () => {
    if (fontSize > 0.8) {
      setFontSize(prev => Math.max(prev - 0.1, 0.8));
    }
  };

  // Reset font size
  const resetFontSize = () => {
    setFontSize(1);
  };

  return (
    <div className={`accessibility-controls ${className}`}>
      {/* Theme toggle (dark mode) - temporarily disabled */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-medium text-gray-700">{t('accessibility.theme')}</h3>

        <div className="rounded border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-sm text-yellow-800">
            <strong>Notice:</strong> Dark mode theme toggle is temporarily disabled to prevent
            configuration errors.
          </p>
        </div>
      </div>

      {/* Font size controls */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('accessibility.fontSize')}
        </h3>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={decreaseFontSize}
            disabled={fontSize <= 0.8}
            aria-label={t('accessibility.decreaseFontSize')}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={resetFontSize}
            disabled={fontSize === 1}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            {t('accessibility.resetFontSize')}
          </button>

          <button
            type="button"
            onClick={increaseFontSize}
            disabled={fontSize >= 1.5}
            aria-label={t('accessibility.increaseFontSize')}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {Math.round(fontSize * 100)}%
          </span>
        </div>

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {t('accessibility.fontSizeDescription')}
        </p>
      </div>
    </div>
  );
};

export default AccessibilityControls;
