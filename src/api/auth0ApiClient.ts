import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';


// Custom request config that extends AxiosRequestConfig
interface CustomRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  useMockData?: boolean;
  retryCount?: number;
}

class Auth0ApiClient {
  private instance: AxiosInstance;
  private getAccessToken: (() => Promise<string | undefined>) | null = null;

  constructor() {
    const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // Set the access token getter function
  public setAccessTokenGetter(getter: () => Promise<string | undefined>) {
    this.getAccessToken = getter;
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      async config => {
        const customConfig = config as CustomRequestConfig;

        // Skip auth for certain requests
        if (!customConfig.skipAuth && this.getAccessToken) {
          try {
            const token = await this.getAccessToken();
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error('Failed to get access token:', error);
          }
        }



        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomRequestConfig;

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest.skipAuth) {
          // Token might be expired, try to get a new one
          if (this.getAccessToken && !originalRequest.retryCount) {
            try {
              const newToken = await this.getAccessToken();
              if (newToken && originalRequest) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                originalRequest.retryCount = 1;
                return this.instance(originalRequest);
              }
            } catch (refreshError) {
              console.error('Failed to refresh token:', refreshError);
              this.handleAuthFailure();
            }
          } else {
            this.handleAuthFailure();
          }
        }

        // Handle other errors
        if (error.response?.status === 403) {
          console.error('Access forbidden:', error.response.data);
        } else if (error.response?.status === 404) {
          console.error('Resource not found:', error.response.data);
        } else if (error.response?.status >= 500) {
          console.error('Server error:', error.response.data);
        }

        return Promise.reject(error);
      }
    );
  }

  // Handle authentication failure
  private handleAuthFailure(): void {
    // Clear any cached data
    localStorage.removeItem('auth0_token_cache');

    // Redirect to login
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }

  // HTTP methods
  public async get<T = any>(url: string, config?: CustomRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  public async post<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  public async put<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T = any>(url: string, config?: CustomRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  // File upload method
  public async uploadFile(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const config: CustomRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressEvent => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    return this.post(url, formData, config);
  }
}

// Export singleton instance
export const auth0ApiClient = new Auth0ApiClient();

// Export for type usage
export type { CustomRequestConfig };

export default auth0ApiClient;
