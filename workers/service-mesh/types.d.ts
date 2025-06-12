/// <reference types="@cloudflare/workers-types" />

declare global {
  interface Request {
    cf?: {
      tlsClientAuth?: {
        certPresented: boolean;
        certVerified: boolean;
        certIssuerDN?: string;
        certSubjectDN?: string;
      };
      colo?: string;
      country?: string;
    };
  }
}

export interface WorkerEnv {
  // KV Namespaces
  CIRCUIT_BREAKER_KV: KVNamespace;
  RATE_LIMIT_KV: KVNamespace;
  METRICS_KV: KVNamespace;
  HEALTH_KV: KVNamespace;
  
  // Secrets
  JWT_SECRET: string;
  
  // Service URLs
  CREDIT_BUREAU_URL?: string;
  BANKING_API_URL?: string;
  DOC_PROCESSOR_URL?: string;
  
  // Other environment variables
  ENVIRONMENT: 'development' | 'staging' | 'production';
}

export interface ScheduledEvent {
  scheduledTime: number;
  cron: string;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export type Context = ExecutionContext;