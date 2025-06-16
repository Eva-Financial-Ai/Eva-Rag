import { useState } from 'react';

interface UseDocumentVerificationReturn {
  verifyDocument: (file: File, pipeline?: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export function useDocumentVerification(): UseDocumentVerificationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const verifyDocument = async (file: File, pipeline = 'lender'): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pipeline', pipeline);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to verify document');
      }

      await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to verify document');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    verifyDocument,
    isLoading,
    error,
  };
} 