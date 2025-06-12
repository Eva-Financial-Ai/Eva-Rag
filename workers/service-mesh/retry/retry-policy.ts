import { WorkerEnv } from '../types';

export interface RetryPolicy {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatuses?: number[];
  retryableErrors?: string[];
}

export interface RetryContext {
  attempt: number;
  totalAttempts: number;
  lastError?: Error;
  nextDelay: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  policy: RetryPolicy,
  env: WorkerEnv
): Promise<T> {
  let lastError: Error;
  let delay = policy.initialDelay;

  for (let attempt = 0; attempt <= policy.maxRetries; attempt++) {
    try {
      // Log retry attempt if not the first
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt}/${policy.maxRetries} after ${delay}ms delay`);
      }

      const result = await operation();
      
      // If successful, return the result
      return result;
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (!isRetryable(error, policy)) {
        throw error;
      }

      // Check if we've exhausted retries
      if (attempt === policy.maxRetries) {
        throw new Error(`Operation failed after ${policy.maxRetries} retries: ${error.message}`);
      }

      // Wait before next retry
      await sleep(delay);

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * policy.backoffMultiplier, policy.maxDelay);
    }
  }

  throw lastError!;
}

function isRetryable(error: any, policy: RetryPolicy): boolean {
  // Check if it's a fetch error with a status code
  if (error.status && policy.retryableStatuses) {
    return policy.retryableStatuses.includes(error.status);
  }

  // Check if it's a network error
  if (error.code && policy.retryableErrors) {
    return policy.retryableErrors.includes(error.code);
  }

  // Check for specific error messages
  const errorMessage = error.message?.toLowerCase() || '';
  const retryableMessages = [
    'network',
    'timeout',
    'connection',
    'econnreset',
    'econnrefused',
    'etimedout'
  ];

  return retryableMessages.some(msg => errorMessage.includes(msg));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Specialized retry policies for financial services
export const RetryPolicies = {
  // For critical financial transactions - fewer retries, longer delays
  FINANCIAL_TRANSACTION: {
    maxRetries: 2,
    initialDelay: 2000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableStatuses: [502, 503, 504],
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT']
  } as RetryPolicy,

  // For read-only operations - more aggressive retries
  READ_ONLY: {
    maxRetries: 5,
    initialDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 1.5,
    retryableStatuses: [502, 503, 504, 429],
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED']
  } as RetryPolicy,

  // For idempotent operations
  IDEMPOTENT: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 8000,
    backoffMultiplier: 2,
    retryableStatuses: [502, 503, 504, 409],
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED']
  } as RetryPolicy,

  // For external API calls with rate limiting
  EXTERNAL_API: {
    maxRetries: 4,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 3,
    retryableStatuses: [429, 502, 503, 504],
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED']
  } as RetryPolicy
};

// Retry with circuit breaker integration
export async function withRetryAndCircuitBreaker<T>(
  operation: () => Promise<T>,
  policy: RetryPolicy,
  circuitBreaker: any,
  env: WorkerEnv
): Promise<T> {
  return circuitBreaker.execute(async () => {
    return await withRetry(operation, policy, env);
  }, env);
}