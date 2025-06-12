import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../config/environment';
import ProductionLogger from '../utils/productionLogger';

// Error classes for better error handling
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string, status: number = 401, data?: unknown) {
    super(message, status, data);
    this.name = 'AuthenticationError';
  }
}

// API response type with proper error handling
export interface ApiResponse<T> {
  data?: T;
  error?: Error;
  status: number;
  success: boolean;
  refreshToken?: string;
}

// Request tracking for debugging
interface PendingRequest {
  url: string;
  method: string;
  startTime: number;
}

// Interface to extend the Axios request config with custom properties
interface CustomRequestConfig extends AxiosRequestConfig {
  environment?: string;
  _retryCount?: number;
  _isRetryAuth?: boolean;
}

class ApiClient {
  private instance: AxiosInstance;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private isNetworkIssue: boolean = false;
  private retryDelayMs: number = 1000; // Base retry delay

  constructor() {
    // Create axios instance with configuration
    this.instance = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.performance.requestTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Configure request interceptor
    this.instance.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleRequestError.bind(this),
    );

    // Configure response interceptor
    this.instance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleResponseError.bind(this),
    );
  }

  // Request interceptor
  private handleRequest(config: CustomRequestConfig): CustomRequestConfig {
    // Add request tracking
    const requestId = `${config.method}-${config.url}-${Date.now()}`;
    this.pendingRequests.set(requestId, {
      url: config.url || '',
      method: config.method || 'GET',
      startTime: Date.now(),
    });

    // Create headers if they don't exist (fixing the TypeScript error)
    if (!config.headers) {
      config.headers = {};
    }

    // Add request ID to headers for tracking
    config.headers['X-Request-ID'] = requestId;

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (config.environment === 'development') {
      ProductionLogger.debug(`Request: ${config.method?.toUpperCase()} ${config.url}`, 'ApiClient');
    }

    return config;
  }

  // Request error interceptor
  private handleRequestError(error: AxiosError): Promise<AxiosError> {
    ProductionLogger.error('Request configuration error:', 'ApiClient', error);
    return Promise.reject(error);
  }

  // Response interceptor
  private handleResponse(response: AxiosResponse): AxiosResponse {
    // Remove from pending requests
    const requestId = response.config.headers?.['X-Request-ID'] as string;
    if (requestId && this.pendingRequests.has(requestId)) {
      const pendingRequest = this.pendingRequests.get(requestId);
      if (pendingRequest) {
        const duration = Date.now() - pendingRequest.startTime;

        if (config.debug) {
          ProductionLogger.debug(
            `Response from ${pendingRequest.method.toUpperCase()} ${pendingRequest.url} in ${duration}ms`,
            'ApiClient',
            { status: response.status }
          );
        }

        this.pendingRequests.delete(requestId);
      }
    }

    // Reset network issue flag
    if (this.isNetworkIssue) {
      ProductionLogger.debug('Network connectivity restored', 'ApiClient');
      this.isNetworkIssue = false;
      this.retryDelayMs = 1000; // Reset retry delay
    }

    return response;
  }

  // Response error interceptor
  private async handleResponseError(error: AxiosError): Promise<any> {
    const originalRequest = error.config as CustomRequestConfig;
    if (!originalRequest) {
      return Promise.reject(new Error('No request configuration available'));
    }

    // Remove from pending requests
    const requestId = originalRequest.headers?.['X-Request-ID'] as string;
    if (requestId) {
      this.pendingRequests.delete(requestId);
    }

    // Handle network errors (no response)
    if (!error.response) {
      this.isNetworkIssue = true;

      // Retry logic for network errors
      const retryCount = originalRequest._retryCount || 0;
      if (retryCount < config.performance.maxRetries) {
        // Increment retry count
        originalRequest._retryCount = retryCount + 1;

        // Exponential backoff
        const delay = this.retryDelayMs * Math.pow(2, retryCount);
        this.retryDelayMs = delay; // Update for next potential retry

        ProductionLogger.debug(
          `Network error. Retrying in ${delay}ms (${retryCount + 1}/${config.performance.maxRetries})`,
          'ApiClient',
          { url: originalRequest.url }
        );

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry the request
        return this.instance(originalRequest);
      }

      // Max retries reached
      ProductionLogger.error('[ApiClient] Max retries reached for network error');
      return Promise.reject(
        new NetworkError('Network connectivity issue. Please check your connection.'),
      );
    }

    // Handle authentication errors (401)
    if (error.response.status === 401) {
      // Check if token refresh already attempted
      if (!originalRequest._isRetryAuth) {
        originalRequest._isRetryAuth = true;

        // Try to refresh the token
        try {
          const refreshed = await this.refreshAuthToken();
          if (refreshed) {
            // Get new token
            const newToken = localStorage.getItem('auth_token');

            // Update authorization header
            if (originalRequest.headers && newToken) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            }

            // Retry with new token
            return this.instance(originalRequest);
          }
        } catch (refreshError) {
          ProductionLogger.error('[ApiClient] Token refresh failed:', refreshError);

          // Force logout on auth failure
          this.handleAuthFailure();

          return Promise.reject(
            new AuthenticationError('Your session has expired. Please log in again.'),
          );
        }
      }

      // Auth retry already attempted or failed
      this.handleAuthFailure();
      return Promise.reject(new AuthenticationError('Authentication failed. Please log in again.'));
    }

    // Handle server errors (500+)
    if (error.response.status >= 500) {
      ProductionLogger.error('[ApiClient] Server error:', {
        status: error.response.status,
        url: originalRequest.url,
        data: error.response.data,
      });

      return Promise.reject(
        new ApiError(
          'Server error occurred. Our team has been notified.',
          error.response.status,
          error.response.data,
        ),
      );
    }

    // Handle other status errors (4xx)
    ProductionLogger.error('[ApiClient] API error:', {
      status: error.response.status,
      url: originalRequest.url,
      data: error.response.data,
    });

    // Extract error message from response if available
    let errorMessage = 'An error occurred with your request.';
    const responseData = error.response.data;

    if (responseData) {
      if (typeof responseData === 'string') {
        errorMessage = responseData;
      } else if (typeof responseData === 'object' && responseData !== null) {
        const data = responseData as Record<string, unknown>;
        if (data.message && typeof data.message === 'string') {
          errorMessage = data.message;
        } else if (data.error && typeof data.error === 'string') {
          errorMessage = data.error;
        }
      }
    }

    return Promise.reject(new ApiError(errorMessage, error.response.status, error.response.data));
  }

  // Try to refresh authentication token
  private async refreshAuthToken(): Promise<boolean> {
    try {
      // Import only when needed to avoid circular dependencies
      const { refreshToken } = await import('./authService');
      const response = await refreshToken();
      // Store the new token
      if (response && response.token) {
        localStorage.setItem('auth_token', response.token);
        return true;
      }
      return false;
    } catch (error) {
      ProductionLogger.error('[ApiClient] Error refreshing token:', error);
      return false;
    }
  }

  // Handle authentication failure
  private handleAuthFailure(): void {
    // Clear auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');

    // Redirect to login
    // Use timeout to avoid interrupting current execution flow
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }

  // Generic request method with proper typing
  async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.request<T>(config);

      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      // Handle already processed errors
      if (error instanceof ApiError || error instanceof NetworkError) {
        return {
          error,
          status: error instanceof ApiError ? error.status : 0,
          success: false,
        };
      }

      // Handle unexpected errors
      ProductionLogger.error('[ApiClient] Unexpected error:', error);
      return {
        error: new Error('An unexpected error occurred'),
        status: 0,
        success: false,
      };
    }
  }

  // GET request
  async get<T>(
    url: string,
    params?: any,
    requestConfig?: Partial<AxiosRequestConfig>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      ...requestConfig,
    });
  }

  // POST request
  async post<T>(
    url: string,
    data?: any,
    requestConfig?: Partial<AxiosRequestConfig>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...requestConfig,
    });
  }

  // PUT request
  async put<T>(
    url: string,
    data?: any,
    requestConfig?: Partial<AxiosRequestConfig>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...requestConfig,
    });
  }

  // PATCH request
  async patch<T>(
    url: string,
    data?: any,
    requestConfig?: Partial<AxiosRequestConfig>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...requestConfig,
    });
  }

  // DELETE request
  async delete<T>(
    url: string,
    requestConfig?: Partial<AxiosRequestConfig>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...requestConfig,
    });
  }

  // Health check API endpoint
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.get<{ status: string }>('/health');
      return response.success;
    } catch (error) {
      return false;
    }
  }

  // Get network status
  isOffline(): boolean {
    return this.isNetworkIssue;
  }
}

const apiClient = new ApiClient();
export { apiClient };
export default ApiClient;
