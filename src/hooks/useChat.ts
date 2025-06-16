import { useState } from 'react';

interface UseChatReturn {
  sendMessage: (message: string, pipeline?: string) => Promise<string>;
  isLoading: boolean;
  error: Error | null;
}

export function useChat(): UseChatReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = async (message: string, pipeline = 'lender'): Promise<string> => {
    console.log('useChat: Sending message:', { message, pipeline });
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/rag-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          pipeline,
        }),
      });

      console.log('useChat: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null) as { message?: string } | null;
        console.error('useChat: API error:', errorData);
        throw new Error(errorData?.message || 'Failed to get response');
      }

      const data = await response.json() as { result: any };
      console.log('useChat: Response data:', data);

      if (!data.result) {
        throw new Error('Invalid response format');
      }

      return data.result;
    } catch (err) {
      console.error('useChat: Error:', err);
      const error = err instanceof Error ? err : new Error('Failed to send message');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    error,
  };
} 