import { WorkerEnv } from '../types';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenRequests: number;
  timeout: number;
}

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  lastFailureTime: number;
  successCount: number;
  requestCount: number;
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitBreakerState;
  private serviceName: string;

  constructor(serviceName: string, config: CircuitBreakerConfig) {
    this.serviceName = serviceName;
    this.config = config;
    this.state = {
      state: CircuitState.CLOSED,
      failures: 0,
      lastFailureTime: 0,
      successCount: 0,
      requestCount: 0
    };
  }

  async execute<T>(
    operation: () => Promise<T>,
    env: WorkerEnv
  ): Promise<T> {
    // Load state from KV if available
    await this.loadState(env);

    if (this.state.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state.state = CircuitState.HALF_OPEN;
        this.state.requestCount = 0;
      } else {
        throw new Error(`Circuit breaker is OPEN for service: ${this.serviceName}`);
      }
    }

    if (this.state.state === CircuitState.HALF_OPEN && 
        this.state.requestCount >= this.config.halfOpenRequests) {
      throw new Error(`Circuit breaker is testing with limited requests for service: ${this.serviceName}`);
    }

    try {
      // Add timeout protection
      const result = await this.withTimeout(operation(), this.config.timeout);
      
      this.onSuccess();
      await this.saveState(env);
      
      return result;
    } catch (error) {
      this.onFailure();
      await this.saveState(env);
      
      throw error;
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs);
    });

    return Promise.race([promise, timeout]);
  }

  private onSuccess(): void {
    this.state.failures = 0;
    this.state.successCount++;

    if (this.state.state === CircuitState.HALF_OPEN) {
      this.state.requestCount++;
      
      // If we've had enough successful requests in half-open state, close the circuit
      if (this.state.requestCount >= this.config.halfOpenRequests) {
        this.state.state = CircuitState.CLOSED;
        this.state.requestCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();

    if (this.state.state === CircuitState.HALF_OPEN) {
      this.state.state = CircuitState.OPEN;
    } else if (this.state.failures >= this.config.failureThreshold) {
      this.state.state = CircuitState.OPEN;
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.state.lastFailureTime >= this.config.resetTimeout;
  }

  private async loadState(env: WorkerEnv): Promise<void> {
    if (!env.CIRCUIT_BREAKER_KV) return;

    try {
      const savedState = await env.CIRCUIT_BREAKER_KV.get(
        `circuit-breaker:${this.serviceName}`,
        { type: 'json' }
      );

      if (savedState) {
        this.state = savedState as CircuitBreakerState;
      }
    } catch (error) {
      console.error('Failed to load circuit breaker state:', error);
    }
  }

  private async saveState(env: WorkerEnv): Promise<void> {
    if (!env.CIRCUIT_BREAKER_KV) return;

    try {
      await env.CIRCUIT_BREAKER_KV.put(
        `circuit-breaker:${this.serviceName}`,
        JSON.stringify(this.state),
        { expirationTtl: 3600 } // 1 hour TTL
      );
    } catch (error) {
      console.error('Failed to save circuit breaker state:', error);
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }
}

// Factory for creating circuit breakers with financial service defaults
export function createFinancialServiceCircuitBreaker(
  serviceName: string,
  customConfig?: Partial<CircuitBreakerConfig>
): CircuitBreaker {
  const defaultConfig: CircuitBreakerConfig = {
    failureThreshold: 5,        // Open circuit after 5 failures
    resetTimeout: 30000,        // Try again after 30 seconds
    halfOpenRequests: 3,        // Test with 3 requests in half-open state
    timeout: 5000               // 5 second timeout for financial APIs
  };

  return new CircuitBreaker(serviceName, { ...defaultConfig, ...customConfig });
}