export interface CloudflareR2Config {
  apiKey: string;
  accountId: string;
  bucketName: string;
  region: string;
  autoRagEnabled: boolean;
  vectorIndexId?: string;
  embeddingModel: string;
}

export interface CloudflareR2Connection {
  id: string;
  userId: string;
  agentId: string;
  organizationId: string;
  config: CloudflareR2Config;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  createdAt: Date;
  lastSync: Date;
  storageUsed: number; // in bytes
  documentsCount: number;
  autoRagStatus: {
    enabled: boolean;
    indexingProgress: number; // 0-100
    lastIndexed: Date;
    errorMessage?: string;
  };
}

export interface CloudflareAutoRAGSetup {
  bucketName: string;
  vectorDatabaseId: string;
  embeddingModel:
    | 'text-embedding-3-large'
    | 'text-embedding-3-small'
    | 'sentence-transformers/all-MiniLM-L6-v2';
  chunkSize: number;
  chunkOverlap: number;
  autoIndexing: boolean;
  webhookUrl?: string;
}

export interface R2UploadResult {
  success: boolean;
  fileKey: string;
  fileUrl: string;
  ragIndexed: boolean;
  vectorId?: string;
  errorMessage?: string;
}

export interface R2APIKeyValidation {
  isValid: boolean;
  permissions: string[];
  bucketAccess: boolean;
  vectorDBAccess: boolean;
  errorMessage?: string;
  accountInfo?: {
    accountId: string;
    accountName: string;
    region: string;
  };
}

export const CLOUDFLARE_R2_REGIONS = [
  'auto',
  'us-east-1',
  'us-west-2',
  'eu-west-1',
  'ap-southeast-1',
] as const;

export const SUPPORTED_EMBEDDING_MODELS = [
  {
    id: 'text-embedding-3-large',
    name: 'OpenAI Embedding 3 Large',
    dimensions: 3072,
    maxTokens: 8191,
    costPer1K: 0.00013,
    isOpenSource: false,
  },
  {
    id: 'text-embedding-3-small',
    name: 'OpenAI Embedding 3 Small',
    dimensions: 1536,
    maxTokens: 8191,
    costPer1K: 0.00002,
    isOpenSource: false,
  },
  {
    id: 'sentence-transformers/all-MiniLM-L6-v2',
    name: 'Sentence Transformers MiniLM',
    dimensions: 384,
    maxTokens: 512,
    costPer1K: 0.0, // Free
    isOpenSource: true,
  },
] as const;
