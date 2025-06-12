#!/bin/bash
echo "Enhancing API client with timeout and retry logic..."

cat > src/api/apiClientEnhanced.ts << 'APICLIENT'
import { auth0ApiClient } from './auth0ApiClient';
import { auditTrailService } from '../services/auditTrailService';
import { CacheManager } from '../utils/performance';

// Create cache instance
const apiCache = new CacheManager(5); // 5 minute TTL

interface ApiConfig {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  skipAuth?: boolean;
}

/**
 * Enhanced API client with comprehensive error handling
 * Complies with:
 * - add-timeout-handling-for-slow-external-apis
 * - implement-circuit-breakers-for-unreliable-third-party-services
 * - retry-logic-for-transient-api-failures
 */
class EnhancedApiClient {
  private circuitBreaker: Map<string, { failures: number; lastFailure: Date }> = new Map();
  private readonly maxFailures = 5;
  private readonly resetTimeout = 60000; // 1 minute

  async request<T>(url: string, options: RequestInit & ApiConfig = {}): Promise<T> {
    const {
      timeout = 30000,
      retries = 3,
      cache = false,
      skipAuth = false,
      ...fetchOptions
    } = options;

    // Check circuit breaker
    if (this.isCircuitOpen(url)) {
      throw new Error(`Circuit breaker open for ${url}`);
    }

    // Check cache
    if (cache && fetchOptions.method === 'GET') {
      const cached = apiCache.get(url);
      if (cached) {
        return cached as T;
      }
    }

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const startTime = Date.now();

        // Log API request
        auditTrailService.logAPIIntegration({
          endpoint: url,
          method: fetchOptions.method || 'GET',
          attempt: attempt + 1,
          timestamp: new Date().toISOString(),
        });

        // Make request
        const response = await auth0ApiClient.request({
          url,
          ...fetchOptions,
          signal: controller.signal,
        });

        // Clear timeout
        clearTimeout(timeoutId);

        // Log successful response
        auditTrailService.logAPIIntegration({
          endpoint: url,
          method: fetchOptions.method || 'GET',
          status: response.status,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        });

        // Reset circuit breaker on success
        this.circuitBreaker.delete(url);

        // Parse response
        const data = await response.json();

        // Cache if enabled
        if (cache && fetchOptions.method === 'GET') {
          apiCache.set(url, data);
        }

        return data as T;

      } catch (error: any) {
        lastError = error;

        // Handle timeout
        if (error.name === 'AbortError') {
          lastError = new Error(`Request timeout after ${timeout}ms`);
        }

        // Log failure
        auditTrailService.logAPIIntegration({
          endpoint: url,
          method: fetchOptions.method || 'GET',
          error: lastError.message,
          attempt: attempt + 1,
          timestamp: new Date().toISOString(),
        });

        // Don't retry on certain errors
        if (error.status === 401 || error.status === 403 || error.status === 404) {
          throw error;
        }

        // Wait before retry with exponential backoff
        if (attempt < retries) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // Record circuit breaker failure
    this.recordFailure(url);

    throw lastError || new Error('Request failed');
  }

  private isCircuitOpen(url: string): boolean {
    const circuit = this.circuitBreaker.get(url);
    if (!circuit) return false;

    // Check if circuit should be reset
    if (Date.now() - circuit.lastFailure.getTime() > this.resetTimeout) {
      this.circuitBreaker.delete(url);
      return false;
    }

    return circuit.failures >= this.maxFailures;
  }

  private recordFailure(url: string): void {
    const circuit = this.circuitBreaker.get(url) || { failures: 0, lastFailure: new Date() };
    circuit.failures++;
    circuit.lastFailure = new Date();
    this.circuitBreaker.set(url, circuit);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Convenience methods
  async get<T>(url: string, config?: ApiConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, data: any, config?: ApiConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });
  }

  async put<T>(url: string, data: any, config?: ApiConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });
  }

  async delete<T>(url: string, config?: ApiConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }
}

export const apiClient = new EnhancedApiClient();
export default apiClient;
APICLIENT

echo "✅ API client enhanced"
