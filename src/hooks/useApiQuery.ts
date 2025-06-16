import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, QueryClient } from '@tanstack/react-query';
import { ApiResponse, ApiError } from '../api/apiClient';
import { config } from '../config/environment';

// Create a singleton query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: !config.debug,
      retry: config.performance.maxRetries,
      staleTime: config.performance.cacheTTL * 1000,
      cacheTime: config.performance.cacheTTL * 2000,
    },
  },
});

/**
 * Generic hook to wrap API calls with React Query's useQuery
 * 
 * @param queryKey Unique key for the query
 * @param queryFn Function that returns a promise with ApiResponse
 * @param options Additional options for useQuery
 */
export function useApiQuery<TData, TError = ApiError>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<ApiResponse<TData>>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      const response = await queryFn();
      if (!response.success || !response.data) {
        throw response.error || new ApiError('No data returned', response.status);
      }
      return response.data;
    },
    ...options,
  });
}

/**
 * Generic hook to wrap API mutation calls with React Query's useMutation
 * 
 * @param mutationFn Function that accepts variables and returns a promise with ApiResponse
 * @param options Additional options for useMutation
 */
export function useApiMutation<TData, TVariables, TError = ApiError>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>,
) {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      const response = await mutationFn(variables);
      if (!response.success || !response.data) {
        throw response.error || new ApiError('API mutation failed', 500);
      }
      return response.data;
    },
    ...options,
  });
}

/**
 * Hook to invalidate queries based on prefix
 * 
 * @param prefix The query key prefix to invalidate
 */
export function useInvalidateQueries(prefix: string) {
  return () => {
    return queryClient.invalidateQueries({ queryKey: [prefix] });
  };
}

// Change the default export to use a named variable
const apiQueryHooks = {
  useApiQuery,
  useApiMutation,
  useInvalidateQueries,
  queryClient,
};

export default apiQueryHooks; 