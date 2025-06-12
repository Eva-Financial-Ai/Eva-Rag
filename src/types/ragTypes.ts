export interface RAGDataSource {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'csv' | 'txt' | 'json' | 'image' | 'audio' | 'video';
  size: number; // in bytes
  uploadDate: Date;
  status: 'uploading' | 'processing' | 'ready' | 'error' | 'embedding';
  agentId: string;
  organizationId: string;
  userId: string;
  vectorChunks?: number;
  embeddingModel?: string;
  processingProgress?: number;
  errorMessage?: string;
  metadata?: {
    chunkSize: number;
    overlap: number;
    language: string;
    extractedText?: string;
    summary?: string;
    keywords?: string[];
  };
}

export interface AgentStorageQuota {
  agentId: string;
  agentName: string;
  totalStorageUsed: number; // in bytes
  totalStorageLimit: number; // 81GB = 81 * 1024 * 1024 * 1024 bytes
  dataSources: RAGDataSource[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface OrganizationRAGLimits {
  organizationId: string;
  maxCustomAgents: number; // 9 agents per organization
  currentAgentCount: number;
  totalStorageUsed: number;
  totalStorageLimit: number; // 81GB * 9 agents = 729GB total
  agents: AgentStorageQuota[];
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  costPerToken: number;
  contextWindow: number;
  category: 'premium' | 'standard' | 'economical';
  capabilities: string[];
  isActive: boolean;
  requestRequired?: boolean; // for post-MVP models
}

export interface RAGUploadProgress {
  uploadId: string;
  fileName: string;
  totalSize: number;
  uploadedSize: number;
  processingStage: 'uploading' | 'extracting' | 'chunking' | 'embedding' | 'indexing' | 'complete';
  progress: number; // 0-100
  estimatedTimeRemaining?: number;
  error?: string;
}

export interface ModelAnalysisQuestion {
  id: string;
  question: string;
  context: string;
  suggestedAnswer?: string;
  userAnswer?: string;
  isRequired: boolean;
}

export interface OrganizationalGoal {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category:
    | 'efficiency'
    | 'accuracy'
    | 'compliance'
    | 'innovation'
    | 'training'
    | 'decision-making';
  measurable: boolean;
  targetMetric?: string;
  isActive: boolean;
}

export interface PersonalizationSession {
  sessionId: string;
  agentId: string;
  uploadedDataSources: RAGDataSource[];
  modelAnalysisQuestions: ModelAnalysisQuestion[];
  organizationalGoals: OrganizationalGoal[];
  currentStep: 'analyzing' | 'questions' | 'goals' | 'complete';
  createdAt: Date;
  completedAt?: Date;
  modelInsights?: {
    dataTypes: string[];
    suggestedUseCases: string[];
    riskFactors: string[];
    complianceRequirements: string[];
  };
}

export const STORAGE_LIMITS = {
  AGENT_STORAGE_LIMIT: 81 * 1024 * 1024 * 1024, // 81GB in bytes
  MAX_AGENTS_PER_ORG: 9,
  MAX_FILE_SIZE: 15 * 1024 * 1024, // 15MB per file
  SUPPORTED_FILE_TYPES: [
    'pdf',
    'docx',
    'xlsx',
    'csv',
    'txt',
    'json',
    'png',
    'jpg',
    'jpeg',
    'gif',
    'webp',
    'mp3',
    'wav',
    'mp4',
    'avi',
    'mov',
  ],
} as const;

export const DEFAULT_MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'thor-lightning-235b',
    name: 'Thor Lightning Model',
    description:
      'Our most powerful model for deep research and analytics with finetuned data and RAG',
    costPerToken: 0.008,
    contextWindow: 200000,
    category: 'premium',
    capabilities: [
      'ultra-advanced-reasoning',
      'deep-research',
      'complex-analytics',
      'financial-modeling',
      'risk-assessment',
    ],
    isActive: true,
  },
  {
    id: 'eva-financial-risk-70b',
    name: 'EVA Financial Model Risk Model',
    description:
      'Specialized 70B model optimized for financial risk assessment with finetuned data and RAG',
    costPerToken: 0.003,
    contextWindow: 128000,
    category: 'premium',
    capabilities: [
      'financial-analysis',
      'risk-assessment',
      'compliance',
      'advanced-reasoning',
      'market-analysis',
    ],
    isActive: true,
  },
  {
    id: 'eva-general-purpose-7b',
    name: 'Eva General Purpose Model',
    description: 'Efficient 7B parameter model for everyday tasks with finetuned data and RAG',
    costPerToken: 0.0003,
    contextWindow: 32000,
    category: 'economical',
    capabilities: ['general-reasoning', 'document-processing', 'data-extraction', 'basic-analysis'],
    isActive: true,
  },
  {
    id: 'claude-4-sonnet',
    name: 'Claude 4.0 Sonnet',
    description: 'Coming Soon - Third-party source models will be supported later',
    costPerToken: 0.002,
    contextWindow: 200000,
    category: 'premium',
    capabilities: ['advanced-reasoning', 'code-analysis', 'document-analysis', 'financial-writing'],
    isActive: false,
  },
  {
    id: 'claude-4-opus',
    name: 'Claude 4.0 Opus',
    description: 'Coming Soon - Third-party source models will be supported later',
    costPerToken: 0.0045,
    contextWindow: 200000,
    category: 'premium',
    capabilities: [
      'ultra-advanced-reasoning',
      'complex-analysis',
      'strategic-planning',
      'financial-modeling',
    ],
    isActive: false,
  },
  {
    id: 'chatgpt-4-5',
    name: 'ChatGPT 4.5',
    description: 'Coming Soon - Third-party source models will be supported later',
    costPerToken: 0.0035,
    contextWindow: 128000,
    category: 'premium',
    capabilities: ['advanced-reasoning', 'multimodal', 'financial-analysis', 'data-processing'],
    isActive: false,
  },
  {
    id: 'chatgpt-4-1',
    name: 'ChatGPT 4.1',
    description: 'Coming Soon - Third-party source models will be supported later',
    costPerToken: 0.0025,
    contextWindow: 128000,
    category: 'standard',
    capabilities: [
      'reasoning',
      'business-analysis',
      'document-processing',
      'financial-calculations',
    ],
    isActive: false,
  },
  {
    id: 'chatgpt-o3',
    name: 'ChatGPT o3',
    description: 'Coming Soon - Third-party source models will be supported later',
    costPerToken: 0.004,
    contextWindow: 128000,
    category: 'premium',
    capabilities: ['advanced-reasoning', 'problem-solving', 'mathematical-analysis', 'research'],
    isActive: false,
  },
  {
    id: 'gemini-pro-2-5',
    name: 'Gemini Pro 2.5',
    description: 'Coming Soon - Third-party source models will be supported later',
    costPerToken: 0.002,
    contextWindow: 100000,
    category: 'standard',
    capabilities: ['reasoning', 'multimodal', 'data-analysis', 'financial-insights'],
    isActive: false,
  },
  {
    id: 'gemini-flash-2-5',
    name: 'Gemini Flash 2.5',
    description: 'Coming Soon - Third-party source models will be supported later',
    costPerToken: 0.0005,
    contextWindow: 100000,
    category: 'economical',
    capabilities: ['fast-processing', 'data-analysis', 'document-extraction', 'basic-reasoning'],
    isActive: false,
  },
];
