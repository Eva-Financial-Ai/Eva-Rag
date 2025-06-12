import { useState, useCallback, useEffect } from 'react';
import { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from './useApiQuery';
import { ApiResponse, ApiError } from '../api/apiClient';
import { config } from '../config/environment';

/**
 * Custom hook for easier data fetching using React Query and our API client
 * 
 * @param key React Query key
 * @param fetchFn Function to fetch data with proper typing
 * @param options React Query options
 */
export function useApiData<TData>(
  key: readonly unknown[],
  fetchFn: () => Promise<ApiResponse<TData>>,
  options: Omit<UseQueryOptions<TData, ApiError>, 'queryKey' | 'queryFn'> = {}
) {
  const [error, setError] = useState<ApiError | null>(null);
  
  // Use the core useApiQuery hook
  const queryResult = useApiQuery<TData, ApiError>(key, fetchFn, options);
  
  // Update error state when query error changes
  useEffect(() => {
    if (queryResult.error) {
      setError(queryResult.error);
      
      // Log error in development
      if (config.environment === 'development' && config.debug) {
        console.error(`[useApiData] Error fetching:`, queryResult.error);
      }
    }
  }, [queryResult.error]);
  
  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Simplified result object with additional helper properties
  return {
    ...queryResult,
    error,
    clearError,
    isSuccess: queryResult.isSuccess,
    isError: !!error,
    isEmpty: !queryResult.data || (Array.isArray(queryResult.data) && queryResult.data.length === 0),
  };
}

/**
 * Custom hook for easier mutations using React Query and our API client
 * 
 * @param mutationFn Function to perform the mutation with proper typing
 * @param options React Query mutation options
 */
export function useApiMutate<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options: Omit<UseQueryOptions<TData, ApiError>, 'queryKey' | 'queryFn'> = {}
) {
  const [error, setError] = useState<ApiError | null>(null);
  
  // Use the core useApiMutation hook directly
  const mutationResult = useApiMutation<TData, TVariables, ApiError>(
    mutationFn,
    options as UseMutationOptions<TData, ApiError, TVariables>
  );
  
  // Update error state when mutation error changes
  useEffect(() => {
    if (mutationResult.error) {
      setError(mutationResult.error);
      
      // Log error in development
      if (config.environment === 'development' && config.debug) {
        console.error('[useApiMutate] Error:', mutationResult.error);
      }
    }
  }, [mutationResult.error]);
  
  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Simplified result object
  return {
    ...mutationResult,
    error,
    clearError,
  };
}

const apiDataHooks = {
  useApiData,
  useApiMutate,
};

export default apiDataHooks; 