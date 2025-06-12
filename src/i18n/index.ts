import i18n from 'i18next';
import { initReactI18next, UseTranslationResponse } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language files
import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';
import frTranslation from './locales/fr.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  es: {
    translation: esTranslation,
  },
  fr: {
    translation: frTranslation,
  },
};

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    react: {
      useSuspense: true,
    },
    // Ensure compatibility with different versions
    compatibilityJSON: 'v4',
    // Use an empty string for missing translations
    returnEmptyString: false,
    // Allow nesting of translations
    nsSeparator: ':',
    keySeparator: '.',
    // Return key if value is empty
    returnNull: false,
  });

// Define custom type for the t function that allows a key and an optional fallback
export type TFunction = {
  (key: string): string;
  (key: string, fallback: string): string;
};

// Export enhanced hook
export function useTypedTranslation(): { t: TFunction; i18n: typeof i18n } {
  // Just re-export the original hook but with better types
  return i18n as unknown as { t: TFunction; i18n: typeof i18n };
}

export default i18n;
