import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions, QueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse, ApiError } from '../api/apiClient';

// Create a queryClient instance to be used across the app
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes - renamed from cacheTime
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Custom hook to fetch data from API with React Query
 */
export function useApiQuery<TData>(
  queryKey: string | string[],
  queryFn: () => Promise<ApiResponse<TData>>,
  options?: Omit<UseQueryOptions<TData, ApiError, TData, readonly unknown[]>, 'queryKey' | 'queryFn'>
) {
  const normalizedQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey];
  
  return useQuery<TData, ApiError, TData, readonly unknown[]>({
    queryKey: normalizedQueryKey as readonly unknown[],
    queryFn: async () => {
      const response = await queryFn();
      if (!response.success) {
        throw response.error || new ApiError('Unknown error', response.status);
      }
      return response.data as TData;
    },
    ...options,
  });
}

/**
 * Custom hook to perform mutations (create/update/delete) with React Query
 */
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: UseMutationOptions<TData, ApiError, TVariables>
) {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      const response = await mutationFn(variables);
      if (!response.success) {
        throw response.error || new ApiError('Unknown error', response.status);
      }
      return response.data as TData;
    },
    ...options,
  });
}

/**
 * Clear all query cache
 */
export function clearQueryCache() {
  return queryClient.clear();
}

/**
 * Invalidate specific queries by key
 */
export function invalidateQueries(queryKey: string | string[]) {
  const normalizedQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey];
  return queryClient.invalidateQueries({ queryKey: normalizedQueryKey as readonly unknown[] });
}

/**
 * Prefetch data for a specific query
 */
export async function prefetchQuery<TData>(
  queryKey: string | string[],
  queryFn: () => Promise<ApiResponse<TData>>
) {
  const normalizedQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey];
  
  return queryClient.prefetchQuery({
    queryKey: normalizedQueryKey as readonly unknown[],
    queryFn: async () => {
      const response = await queryFn();
      if (!response.success) {
        throw response.error || new ApiError('Unknown error', response.status);
      }
      return response.data as TData;
    },
  });
}

/**
 * Custom hook for fetching a single entity by ID
 * 
 * @param baseUrl The base URL for the API endpoint
 * @param id The entity ID
 * @param options Additional query options
 */
export function useEntity<TEntity, TError = Error>(
  baseUrl: string,
  id: string | number | null | undefined,
  options?: Omit<UseQueryOptions<TEntity, TError, TEntity, readonly unknown[]>, 'queryKey' | 'queryFn'>
) {
  const queryKey = [`entity:${baseUrl}:${id}`] as const;
  
  return useQuery<TEntity, TError, TEntity, readonly unknown[]>({
    queryKey: queryKey as readonly unknown[],
    queryFn: async () => {
      if (!id) {
        throw new Error('ID is required');
      }
      
      const response = await apiClient.get<TEntity>(`${baseUrl}/${id}`);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch entity');
      }
      
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
}

/**
 * Custom hook for fetching a list of entities
 * 
 * @param baseUrl The base URL for the API endpoint
 * @param params Query parameters
 * @param options Additional query options
 */
export function useEntityList<TEntity, TParams, TError = Error>(
  baseUrl: string,
  params?: TParams,
  options?: Omit<UseQueryOptions<TEntity[], TError, TEntity[], readonly unknown[]>, 'queryKey' | 'queryFn'>
) {
  // Use JSON.stringify to create a stable key from params
  const paramsKey = params ? JSON.stringify(params) : 'all';
  const queryKey = [`entityList:${baseUrl}:${paramsKey}`] as const;
  
  return useQuery<TEntity[], TError, TEntity[], readonly unknown[]>({
    queryKey: queryKey as readonly unknown[],
    queryFn: async () => {
      const response = await apiClient.get<TEntity[]>(baseUrl, params);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch entity list');
      }
      
      return response.data;
    },
    ...options
  });
}

/**
 * Generic hook for making a custom API call
 * 
 * @param key Query cache key
 * @param apiFn Function that makes the API call
 * @param options Additional query options
 */
export function useApiCall<TData, TError = Error>(
  key: readonly unknown[],
  apiFn: () => Promise<ApiResponse<TData>>,
  options?: Omit<UseQueryOptions<TData, TError, TData, readonly unknown[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError, TData, readonly unknown[]>({
    queryKey: key,
    queryFn: async () => {
      const response = await apiFn();
      
      if (!response.success || !response.data) {
        throw new Error('API call failed');
      }
      
      return response.data;
    },
    ...options
  });
}

const apiHooks = {
  useApiQuery,
  useApiMutation,
  useEntity,
  useEntityList,
  useApiCall,
  clearQueryCache,
  invalidateQueries,
  prefetchQuery,
  queryClient,
};

export default apiHooks; 