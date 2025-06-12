import { useTranslation as useReactI18nextTranslation } from 'react-i18next';

// Define the t function type that accepts both patterns
export interface TranslationFunction {
  (key: string): string;
  (key: string, fallback: string): string;
}

// Custom hook that returns a properly typed t function
export function useTranslation() {
  const { t: originalT, i18n, ...rest } = useReactI18nextTranslation();
  
  // Create a properly typed wrapper for the t function
  const t: TranslationFunction = ((key: string, fallback?: string) => {
    if (fallback !== undefined) {
      // Use type assertion to bypass type checking
      return (originalT as any)(key, { defaultValue: fallback });
    }
    // Use type assertion to bypass type checking
    return (originalT as any)(key);
  }) as TranslationFunction;
  
  return { t, i18n, ...rest };
}

export default useTranslation; 