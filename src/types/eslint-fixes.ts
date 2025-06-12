// Type definitions to replace 'any' types across the codebase

// CloudflareR2Service types
export interface R2PubSubEventPayload {
  applicationId?: string;
  documentKey?: string;
  metadata?: Record<string, unknown>;
  error?: string;
  message?: string;
  [key: string]: unknown;
}

export interface DocumentMetadata {
  fileName?: string;
  fileType?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  size?: number;
  tags?: string[];
  [key: string]: unknown;
}

export interface CloudflareAccount {
  id: string;
  name: string;
  type: string;
  [key: string]: unknown;
}

// Component types
export interface FileItemIcon {
  type: 'font-awesome' | 'heroicon' | 'custom';
  name: string;
  className?: string;
}

export interface EventLogEntry {
  time: string;
  event: string;
  details: Record<string, unknown>;
}

// API types
export interface ApiErrorData {
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ApiRequestParams {
  [key: string]: string | number | boolean | undefined;
}

export interface ApiRequestData {
  [key: string]: unknown;
}

// Document types
export interface BlockchainInfo {
  transactionHash?: string;
  blockNumber?: number;
  timestamp?: string;
  network?: string;
  [key: string]: unknown;
}

export interface ExtractedDocumentData {
  documentType?: string;
  extractedFields?: Record<string, string | number | boolean>;
  confidence?: number;
  [key: string]: unknown;
}

export interface CollaboratorInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  [key: string]: unknown;
}

// Credit analysis types
export interface FinancialData {
  revenue?: number;
  expenses?: number;
  netIncome?: number;
  assets?: number;
  liabilities?: number;
  equity?: number;
  cashFlow?: number;
  [key: string]: unknown;
}

export interface CollateralInfo {
  type?: string;
  value?: number;
  description?: string;
  location?: string;
  [key: string]: unknown;
}

export interface GuarantorInfo {
  name?: string;
  relationship?: string;
  creditScore?: number;
  income?: number;
  [key: string]: unknown;
}

// Test types
export interface MockCallback {
  (...args: unknown[]): void;
}

export interface LazyComponentModule<T> {
  default: T;
}

// Worker types
export interface WorkerAssets {
  fetch(request: Request): Promise<Response>;
}

export interface ExecutionPromise extends Promise<unknown> {
  // Promise extension for worker execution context
}

// Report types
export interface ComplianceCheckResults {
  [category: string]: {
    status: 'pass' | 'fail' | 'warning';
    details: Record<string, unknown>;
    recommendations?: string[];
  };
}

export interface SignatureRequestData {
  id: string;
  fileId: string;
  fileName: string;
  requestedBy: string;
  requestedAt: string;
  signers: Array<{
    id: string;
    name: string;
    email: string;
    status: 'pending' | 'signed' | 'declined';
  }>;
  [key: string]: unknown;
}