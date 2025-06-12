import React, { useContext } from 'react';
import { ColorScheme, UserContext } from '../../contexts/UserContext';
import useTranslation from '../../i18n/useTranslation';

interface ThemePreferencesProps {
  className?: string;
}

const ThemePreferences: React.FC<ThemePreferencesProps> = ({ className = '' }) => {
  const { colorScheme, setColorScheme, highContrast, setHighContrast } = useContext(UserContext);
  const { t } = useTranslation();

  const handleColorSchemeChange = (scheme: ColorScheme) => {
    setColorScheme(scheme);
  };

  const handleHighContrastChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHighContrast(e.target.checked);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="mb-3 text-base font-medium text-gray-900 dark:text-gray-100">
          {t('theme.colorScheme')}
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center">
            <input
              id="light-mode"
              name="color-scheme"
              type="radio"
              checked={colorScheme === 'light'}
              onChange={() => handleColorSchemeChange('light')}
              className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label
              htmlFor="light-mode"
              className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('theme.light')}
            </label>
          </div>

          {/* Dark mode and system mode temporarily disabled */}
          {/*
          <div className="flex items-center">
            <input
              id="dark-mode"
              name="color-scheme"
              type="radio"
              checked={colorScheme === 'dark'}
              onChange={() => handleColorSchemeChange('dark')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <label
              htmlFor="dark-mode"
              className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('theme.dark')}
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="system-mode"
              name="color-scheme"
              type="radio"
              checked={colorScheme === 'system'}
              onChange={() => handleColorSchemeChange('system')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <label
              htmlFor="system-mode"
              className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('theme.system')}
            </label>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {t('theme.systemHint')}
            </span>
          </div>
          */}

          <div className="rounded border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-sm text-yellow-800">
              <strong>Notice:</strong> Dark mode is temporarily disabled to prevent configuration
              errors. It will be re-enabled in a future update.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-5 dark:border-gray-700">
        <h3 className="mb-3 text-base font-medium text-gray-900 dark:text-gray-100">
          {t('theme.accessibility')}
        </h3>

        <div className="flex items-center">
          <div className="flex h-5 items-center">
            <input
              id="high-contrast"
              name="high-contrast"
              type="checkbox"
              checked={highContrast}
              onChange={handleHighContrastChange}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          <div className="ml-3 flex w-full items-center justify-between">
            <label
              htmlFor="high-contrast"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('theme.highContrast')}
            </label>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {t('theme.highContrastHint')}
            </span>
          </div>
        </div>

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {t('theme.accessibilityNote')}
        </p>
      </div>

      <div className="border-t border-gray-200 pt-5 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="h-6 w-6 rounded-full bg-gray-900 dark:bg-white" aria-hidden="true" />
          <div className="h-6 w-6 rounded-full bg-primary-600" aria-hidden="true" />
          <div className="h-6 w-6 rounded-full bg-green-500" aria-hidden="true" />
          <div className="bg-red-500 h-6 w-6 rounded-full" aria-hidden="true" />
          <div className="h-6 w-6 rounded-full bg-yellow-500" aria-hidden="true" />
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('theme.previewNote')}</p>
      </div>
    </div>
  );
};

export default ThemePreferences;
