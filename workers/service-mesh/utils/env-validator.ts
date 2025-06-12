import { WorkerEnv } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class EnvValidator {
  static validate(env: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required environment variables
    const required = [
      'JWT_SECRET',
      'CIRCUIT_BREAKER_KV',
      'RATE_LIMIT_KV',
      'METRICS_KV',
      'HEALTH_KV'
    ];
    
    for (const key of required) {
      if (!env[key]) {
        errors.push(`Missing required environment variable: ${key}`);
      }
    }
    
    // Validate JWT_SECRET strength
    if (env.JWT_SECRET && env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long');
    }
    
    // Validate environment type
    if (env.ENVIRONMENT && !['development', 'staging', 'production'].includes(env.ENVIRONMENT)) {
      errors.push(`Invalid ENVIRONMENT value: ${env.ENVIRONMENT}. Must be development, staging, or production`);
    }
    
    // Optional but recommended variables
    const recommended = [
      'CREDIT_BUREAU_URL',
      'BANKING_API_URL',
      'DOC_PROCESSOR_URL'
    ];
    
    for (const key of recommended) {
      if (!env[key]) {
        warnings.push(`Missing recommended environment variable: ${key}`);
      }
    }
    
    // Validate URLs
    const urlKeys = ['CREDIT_BUREAU_URL', 'BANKING_API_URL', 'DOC_PROCESSOR_URL'];
    for (const key of urlKeys) {
      if (env[key]) {
        try {
          new URL(env[key]);
        } catch {
          errors.push(`Invalid URL for ${key}: ${env[key]}`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  static assertValid(env: any): asserts env is WorkerEnv {
    const result = this.validate(env);
    if (!result.valid) {
      throw new Error(`Environment validation failed:\n${result.errors.join('\n')}`);
    }
  }
  
  static getDefaults(env: Partial<WorkerEnv>): WorkerEnv {
    return {
      JWT_SECRET: env.JWT_SECRET || '',
      CIRCUIT_BREAKER_KV: env.CIRCUIT_BREAKER_KV!,
      RATE_LIMIT_KV: env.RATE_LIMIT_KV!,
      METRICS_KV: env.METRICS_KV!,
      HEALTH_KV: env.HEALTH_KV!,
      CREDIT_BUREAU_URL: env.CREDIT_BUREAU_URL,
      BANKING_API_URL: env.BANKING_API_URL,
      DOC_PROCESSOR_URL: env.DOC_PROCESSOR_URL,
      ENVIRONMENT: env.ENVIRONMENT || 'development'
    };
  }
}