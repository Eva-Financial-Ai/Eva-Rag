import CryptoJS from 'crypto-js';
import {
  RAGDataSource,
  AgentStorageQuota,
  OrganizationRAGLimits,
  RAGUploadProgress,
  STORAGE_LIMITS,
} from '../types/ragTypes';

interface ChunkUploadOptions {
  chunkSize?: number;
  overlap?: number;
  language?: string;
  embeddingModel?: string;
}

interface RAGUploadOptions extends ChunkUploadOptions {
  onProgress?: (progress: RAGUploadProgress) => void;
  validateFinancialData?: boolean;
  encryptSensitiveData?: boolean;
}

class RAGStorageService {
  private static instance: RAGStorageService;
  private baseUrl = process.env.REACT_APP_RAG_API_URL || '/api/rag';
  private encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY || 'default-dev-key';

  public static getInstance(): RAGStorageService {
    if (!RAGStorageService.instance) {
      RAGStorageService.instance = new RAGStorageService();
    }
    return RAGStorageService.instance;
  }

  /**
   * Get organization storage limits and current usage
   */
  async getOrganizationLimits(organizationId: string): Promise<OrganizationRAGLimits> {
    try {
      const response = await fetch(`${this.baseUrl}/organizations/${organizationId}/limits`, {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch organization limits');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching organization limits:', error);
      // Return mock data for development
      return this.getMockOrganizationLimits(organizationId);
    }
  }

  /**
   * Get agent storage quota and usage
   */
  async getAgentStorageQuota(agentId: string): Promise<AgentStorageQuota> {
    try {
      const response = await fetch(`${this.baseUrl}/agents/${agentId}/quota`, {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agent quota');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching agent quota:', error);
      // Return mock data for development
      return this.getMockAgentQuota(agentId);
    }
  }

  /**
   * Validate if file upload is within limits
   */
  async validateUpload(
    agentId: string,
    fileSize: number,
    organizationId: string
  ): Promise<{
    isValid: boolean;
    reason?: string;
    currentUsage: number;
    remainingSpace: number;
  }> {
    const agentQuota = await this.getAgentStorageQuota(agentId);
    const orgLimits = await this.getOrganizationLimits(organizationId);

    // Check file size limit
    if (fileSize > STORAGE_LIMITS.MAX_FILE_SIZE) {
      return {
        isValid: false,
        reason: `File size exceeds maximum limit of ${this.formatBytes(STORAGE_LIMITS.MAX_FILE_SIZE)}`,
        currentUsage: agentQuota.totalStorageUsed,
        remainingSpace: agentQuota.totalStorageLimit - agentQuota.totalStorageUsed,
      };
    }

    // Check agent storage limit
    const newTotalUsage = agentQuota.totalStorageUsed + fileSize;
    if (newTotalUsage > agentQuota.totalStorageLimit) {
      return {
        isValid: false,
        reason: `Upload would exceed agent storage limit of ${this.formatBytes(agentQuota.totalStorageLimit)}`,
        currentUsage: agentQuota.totalStorageUsed,
        remainingSpace: agentQuota.totalStorageLimit - agentQuota.totalStorageUsed,
      };
    }

    // Check organization limits
    if (orgLimits.currentAgentCount >= STORAGE_LIMITS.MAX_AGENTS_PER_ORG) {
      return {
        isValid: false,
        reason: `Organization has reached maximum of ${STORAGE_LIMITS.MAX_AGENTS_PER_ORG} custom agents`,
        currentUsage: agentQuota.totalStorageUsed,
        remainingSpace: agentQuota.totalStorageLimit - agentQuota.totalStorageUsed,
      };
    }

    return {
      isValid: true,
      currentUsage: agentQuota.totalStorageUsed,
      remainingSpace: agentQuota.totalStorageLimit - agentQuota.totalStorageUsed,
    };
  }

  /**
   * Upload file to RAG database with encryption and processing
   */
  async uploadRAGFile(
    file: File,
    agentId: string,
    organizationId: string,
    userId: string,
    options: RAGUploadOptions = {}
  ): Promise<RAGDataSource> {
    // Validate upload first
    const validation = await this.validateUpload(agentId, file.size, organizationId);
    if (!validation.isValid) {
      throw new Error(validation.reason);
    }

    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Initialize progress tracking
    const progress: RAGUploadProgress = {
      uploadId,
      fileName: file.name,
      totalSize: file.size,
      uploadedSize: 0,
      processingStage: 'uploading',
      progress: 0,
    };

    try {
      // Step 1: Upload file
      options.onProgress?.(progress);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('agentId', agentId);
      formData.append('organizationId', organizationId);
      formData.append('userId', userId);
      formData.append('uploadId', uploadId);

      // Add processing options
      if (options.chunkSize) formData.append('chunkSize', options.chunkSize.toString());
      if (options.overlap) formData.append('overlap', options.overlap.toString());
      if (options.language) formData.append('language', options.language);
      if (options.embeddingModel) formData.append('embeddingModel', options.embeddingModel);
      if (options.validateFinancialData) formData.append('validateFinancialData', 'true');
      if (options.encryptSensitiveData) formData.append('encryptSensitiveData', 'true');

      // Step 2: Upload with progress tracking
      const response = await this.uploadWithProgress(formData, options.onProgress);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result: RAGDataSource = await response.json();

      // Step 3: Start processing pipeline
      await this.processRAGFile(result.id, options);

      return result;
    } catch (error) {
      console.error('RAG upload error:', error);

      // Update progress with error
      const errorProgress: RAGUploadProgress = {
        ...progress,
        processingStage: 'complete',
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
      options.onProgress?.(errorProgress);

      throw error;
    }
  }

  /**
   * Process uploaded file through RAG pipeline
   */
  private async processRAGFile(dataSourceId: string, options: RAGUploadOptions): Promise<void> {
    const stages = ['extracting', 'chunking', 'embedding', 'indexing'] as const;

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const progress = Math.round(((i + 1) / stages.length) * 100);

      // Simulate processing time for each stage
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      if (options.onProgress) {
        const uploadProgress: RAGUploadProgress = {
          uploadId: dataSourceId,
          fileName: '',
          totalSize: 0,
          uploadedSize: 0,
          processingStage: stage,
          progress,
        };
        options.onProgress(uploadProgress);
      }
    }

    // Final completion
    if (options.onProgress) {
      const completeProgress: RAGUploadProgress = {
        uploadId: dataSourceId,
        fileName: '',
        totalSize: 0,
        uploadedSize: 0,
        processingStage: 'complete',
        progress: 100,
      };
      options.onProgress(completeProgress);
    }
  }

  /**
   * Upload with progress tracking
   */
  private async uploadWithProgress(
    formData: FormData,
    onProgress?: (progress: RAGUploadProgress) => void
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', event => {
        if (event.lengthComputable && onProgress) {
          const progress: RAGUploadProgress = {
            uploadId: formData.get('uploadId') as string,
            fileName: (formData.get('file') as File)?.name || '',
            totalSize: event.total,
            uploadedSize: event.loaded,
            processingStage: 'uploading',
            progress: Math.round((event.loaded / event.total) * 100),
          };
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(
            new Response(xhr.responseText, {
              status: xhr.status,
              statusText: xhr.statusText,
            })
          );
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.open('POST', `${this.baseUrl}/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${this.getAuthToken()}`);
      xhr.send(formData);
    });
  }

  /**
   * Delete RAG data source
   */
  async deleteRAGDataSource(dataSourceId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/datasources/${dataSourceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete data source');
      }
    } catch (error) {
      console.error('Error deleting data source:', error);
      throw error;
    }
  }

  /**
   * Get agent's data sources
   */
  async getAgentDataSources(agentId: string): Promise<RAGDataSource[]> {
    try {
      const response = await fetch(`${this.baseUrl}/agents/${agentId}/datasources`, {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data sources');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching data sources:', error);
      return [];
    }
  }

  /**
   * Format bytes to human readable string
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get percentage of storage used
   */
  getStorageUsagePercentage(used: number, total: number): number {
    return Math.round((used / total) * 100);
  }

  /**
   * Encrypt sensitive data before storage
   */
  private encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string {
    return localStorage.getItem('eva_auth_token') || 'dev-token';
  }

  /**
   * Mock data for development
   */
  private getMockOrganizationLimits(organizationId: string): OrganizationRAGLimits {
    return {
      organizationId,
      maxCustomAgents: STORAGE_LIMITS.MAX_AGENTS_PER_ORG,
      currentAgentCount: 3,
      totalStorageUsed: 245 * 1024 * 1024 * 1024, // 245GB used
      totalStorageLimit: STORAGE_LIMITS.AGENT_STORAGE_LIMIT * STORAGE_LIMITS.MAX_AGENTS_PER_ORG,
      agents: [],
    };
  }

  private getMockAgentQuota(agentId: string): AgentStorageQuota {
    return {
      agentId,
      agentName: 'Test Agent',
      totalStorageUsed: 45 * 1024 * 1024 * 1024, // 45GB used
      totalStorageLimit: STORAGE_LIMITS.AGENT_STORAGE_LIMIT,
      dataSources: [],
      createdAt: new Date('2024-01-01'),
      lastUpdated: new Date(),
    };
  }
}

export default RAGStorageService;
