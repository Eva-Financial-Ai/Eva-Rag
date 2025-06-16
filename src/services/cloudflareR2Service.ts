import { debugLog } from '../utils/auditLogger';
import ProductionLogger from '../utils/productionLogger';

import {
  CloudflareR2Config,
  CloudflareR2Connection,
  R2APIKeyValidation,
  R2UploadResult,
  CloudflareAutoRAGSetup,
  SUPPORTED_EMBEDDING_MODELS,
} from '../types/cloudflareR2Types';
import { R2PubSubEventPayload, DocumentMetadata, CloudflareAccount } from '../types/eslint-fixes';

// PubSub Event Types
export enum R2PubSubEventType {
  FILE_UPLOADED = 'file_uploaded',
  FILE_DELETED = 'file_deleted',
  FILE_PROCESSED = 'file_processed',
  CREDIT_APP_DOCUMENT_ADDED = 'credit_app_document_added',
  FILELOCK_REQUEST_CREATED = 'filelock_request_created',
  DOCUMENT_SYNCED = 'document_synced',
}

export interface R2PubSubEvent {
  id: string;
  type: R2PubSubEventType;
  timestamp: Date;
  payload: R2PubSubEventPayload;
  source: 'credit_application' | 'filelock' | 'r2_service';
  targetAgentId?: string;
  targetApplicationId?: string;
}

class CloudflareR2Service {
  private static instance: CloudflareR2Service;
  private baseUrl =
    process.env.REACT_APP_CLOUDFLARE_API_URL || 'https://api.cloudflare.com/client/v4';
  
  // PubSub WebSocket connection
  private pubSubConnection: WebSocket | null = null;
  private pubSubListeners: Map<string, ((event: R2PubSubEvent) => void)[]> = new Map();
  private browserCache: Map<string, unknown> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  public static getInstance(): CloudflareR2Service {
    if (!CloudflareR2Service.instance) {
      CloudflareR2Service.instance = new CloudflareR2Service();
    }
    return CloudflareR2Service.instance;
  }

  /**
   * Initialize PubSub connection for real-time sync
   */
  async initializePubSub(): Promise<void> {
    try {
      const wsUrl = process.env.REACT_APP_WEBSOCKET_URL || 'wss://api.eva-platform.eace6f3c56b5735ae4a9ef385d6ee914.workers.dev/ws';
      
      this.pubSubConnection = new WebSocket(wsUrl);
      
      this.pubSubConnection.onopen = () => {
        debugLog('general', 'log_statement', '[R2 PubSub] Connected to real-time sync')
        this.subscribe('credit_application/*');
        this.subscribe('filelock/*');
      };
      
      this.pubSubConnection.onmessage = (event) => {
        try {
          const pubSubEvent: R2PubSubEvent = JSON.parse(event.data);
          this.handlePubSubEvent(pubSubEvent);
        } catch (error) {
          ProductionLogger.error('Error parsing message:', 'R2 PubSub', error);
        }
      };
      
      this.pubSubConnection.onerror = (error) => {
        ProductionLogger.error('WebSocket error:', 'R2 PubSub', error);
      };
      
      this.pubSubConnection.onclose = () => {
        debugLog('general', 'log_statement', '[R2 PubSub] Connection closed, attempting reconnect in 5s...')
        setTimeout(() => this.initializePubSub(), 5000);
      };
    } catch (error) {
      ProductionLogger.error('Failed to initialize:', 'R2 PubSub', error);
    }
  }

  /**
   * Subscribe to PubSub channel
   */
  private subscribe(channel: string): void {
    if (this.pubSubConnection?.readyState === WebSocket.OPEN) {
      this.pubSubConnection.send(JSON.stringify({
        action: 'subscribe',
        channel
      }));
    }
  }

  /**
   * Publish event to PubSub
   */
  async publishEvent(event: Omit<R2PubSubEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: R2PubSubEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date()
    };
    
    // Send via WebSocket if connected
    if (this.pubSubConnection?.readyState === WebSocket.OPEN) {
      this.pubSubConnection.send(JSON.stringify({
        action: 'publish',
        event: fullEvent
      }));
    }
    
    // Also handle locally for immediate response
    this.handlePubSubEvent(fullEvent);
  }

  /**
   * Handle incoming PubSub events
   */
  private handlePubSubEvent(event: R2PubSubEvent): void {
    // Update browser cache
    this.updateBrowserCache(event);
    
    // Notify listeners
    const listeners = this.pubSubListeners.get(event.type) || [];
    const wildcardListeners = this.pubSubListeners.get('*') || [];
    
    [...listeners, ...wildcardListeners].forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        ProductionLogger.error('Listener error:', 'R2 PubSub', error);
      }
    });
  }

  /**
   * Subscribe to PubSub events
   */
  onPubSubEvent(eventType: R2PubSubEventType | '*', listener: (event: R2PubSubEvent) => void): () => void {
    const listeners = this.pubSubListeners.get(eventType) || [];
    listeners.push(listener);
    this.pubSubListeners.set(eventType, listeners);
    
    // Return unsubscribe function
    return () => {
      const updatedListeners = (this.pubSubListeners.get(eventType) || []).filter(l => l !== listener);
      this.pubSubListeners.set(eventType, updatedListeners);
    };
  }

  /**
   * Update browser cache based on PubSub events
   */
  private updateBrowserCache(event: R2PubSubEvent): void {
    const cacheKey = `${event.type}:${event.targetAgentId || event.targetApplicationId || 'global'}`;
    const cacheTTL = 3600000; // 1 hour in milliseconds
    
    this.browserCache.set(cacheKey, event);
    this.cacheExpiry.set(cacheKey, Date.now() + cacheTTL);
    
    // Clean expired cache entries
    this.cleanExpiredCache();
  }

  /**
   * Get cached data
   */
  getCachedData<T = unknown>(key: string): T | null {
    const expiry = this.cacheExpiry.get(key);
    
    if (expiry && expiry > Date.now()) {
      return this.browserCache.get(key) as T;
    }
    
    // Remove expired entry
    this.browserCache.delete(key);
    this.cacheExpiry.delete(key);
    
    return null;
  }

  /**
   * Clean expired cache entries
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (expiry <= now) {
        this.browserCache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  /**
   * Sync credit application document to Filelock
   */
  async syncCreditApplicationToFilelock(
    applicationId: string,
    documentKey: string,
    metadata: DocumentMetadata
  ): Promise<boolean> {
    try {
      // Publish sync event
      await this.publishEvent({
        type: R2PubSubEventType.DOCUMENT_SYNCED,
        source: 'credit_application',
        targetApplicationId: applicationId,
        payload: {
          documentKey,
          metadata,
          syncedAt: new Date().toISOString()
        }
      });
      
      return true;
    } catch (error) {
      ProductionLogger.error('Failed to sync document:', 'R2 Sync', error);
      return false;
    }
  }

  /**
   * Upload file with sync to credit application and filelock
   */
  async uploadFileWithSync(
    file: File,
    config: CloudflareR2Config,
    applicationId: string,
    documentType: 'credit_application' | 'filelock',
    metadata?: DocumentMetadata,
    onProgress?: (progress: number) => void
  ): Promise<R2UploadResult> {
    try {
      // Upload file
      const result = await this.uploadFileWithRAG(
        file,
        config,
        applicationId,
        onProgress
      );
      
      if (result.success) {
        // Publish upload event
        await this.publishEvent({
          type: R2PubSubEventType.FILE_UPLOADED,
          source: documentType,
          targetApplicationId: applicationId,
          payload: {
            fileKey: result.fileKey,
            fileUrl: result.fileUrl,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            metadata,
            ragIndexed: result.ragIndexed,
            vectorId: result.vectorId
          }
        });
        
        // Auto-sync between credit application and filelock
        if (documentType === 'credit_application') {
          await this.syncCreditApplicationToFilelock(applicationId, result.fileKey, metadata);
        }
      }
      
      return result;
    } catch (error) {
      ProductionLogger.error('Error uploading file with sync:', 'R2 Upload', error);
      return {
        success: false,
        fileKey: '',
        fileUrl: '',
        ragIndexed: false,
        errorMessage: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Validate Cloudflare R2 API key and check permissions
   */
  async validateAPIKey(apiKey: string, accountId?: string): Promise<R2APIKeyValidation> {
    try {
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };

      // Validate API key by testing account access
      const response = await fetch(`${this.baseUrl}/accounts`, { headers });

      if (!response.ok) {
        return {
          isValid: false,
          permissions: [],
          bucketAccess: false,
          vectorDBAccess: false,
          errorMessage: 'Invalid API key or insufficient permissions',
        };
      }

      const data = await response.json() as { result?: any[] };
      const account = accountId
        ? data.result.find((acc: CloudflareAccount) => acc.id === accountId)
        : data.result[0];

      if (!account) {
        return {
          isValid: false,
          permissions: [],
          bucketAccess: false,
          vectorDBAccess: false,
          errorMessage: 'Account not found or no access',
        };
      }

      // Test R2 bucket access
      const bucketResponse = await fetch(`${this.baseUrl}/accounts/${account.id}/r2/buckets`, {
        headers,
      });
      const bucketAccess = bucketResponse.ok;

      // Test Vectorize access (for Auto RAG)
      const vectorResponse = await fetch(
        `${this.baseUrl}/accounts/${account.id}/vectorize/indexes`,
        { headers }
      );
      const vectorDBAccess = vectorResponse.ok;

      return {
        isValid: true,
        permissions: ['r2:read', 'r2:write', vectorDBAccess ? 'vectorize:read' : ''].filter(
          Boolean
        ),
        bucketAccess,
        vectorDBAccess,
        accountInfo: {
          accountId: account.id,
          accountName: account.name,
          region: 'auto', // Cloudflare handles this automatically
        },
      };
    } catch (error) {
      return {
        isValid: false,
        permissions: [],
        bucketAccess: false,
        vectorDBAccess: false,
        errorMessage: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }

  /**
   * Setup Auto RAG with Cloudflare Vectorize
   */
  async setupAutoRAG(
    apiKey: string,
    accountId: string,
    setup: CloudflareAutoRAGSetup
  ): Promise<{ success: boolean; vectorIndexId?: string; errorMessage?: string }> {
    try {
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };

      // Get embedding model configuration
      const embeddingModel = SUPPORTED_EMBEDDING_MODELS.find(
        model => model.id === setup.embeddingModel
      );

      if (!embeddingModel) {
        return {
          success: false,
          errorMessage: 'Unsupported embedding model',
        };
      }

      // Create Vectorize index for Auto RAG
      const vectorizePayload = {
        name: `eva-rag-${setup.bucketName}-${Date.now()}`,
        description: `Auto RAG index for bucket: ${setup.bucketName}`,
        config: {
          dimensions: embeddingModel.dimensions,
          metric: 'cosine',
          metadata_indexed: ['source', 'chunk_index', 'agent_id', 'file_type'],
        },
      };

      const vectorResponse = await fetch(
        `${this.baseUrl}/accounts/${accountId}/vectorize/indexes`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(vectorizePayload),
        }
      );

      if (!vectorResponse.ok) {
        const error = await vectorResponse.json();
        return {
          success: false,
          errorMessage: `Failed to create vector index: ${(error as { errors?: { message?: string }[] }).errors?.[0]?.message || 'Unknown error'}`,
        };
      }

      const vectorData = await vectorResponse.json() as { result: { id: string } };
      const vectorIndexId = vectorData.result.id;

      // Configure R2 bucket with Auto RAG webhook (if needed)
      if (setup.webhookUrl) {
        await this.configureBucketWebhook(apiKey, accountId, setup.bucketName, setup.webhookUrl);
      }

      return {
        success: true,
        vectorIndexId,
      };
    } catch (error) {
      ProductionLogger.error('Error setting up Auto RAG:', 'cloudflareR2Service', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Setup failed',
      };
    }
  }

  /**
   * Upload file to R2 with Auto RAG processing
   */
  async uploadFileWithRAG(
    file: File,
    config: CloudflareR2Config,
    agentId: string,
    onProgress?: (progress: number) => void
  ): Promise<R2UploadResult> {
    try {
      const fileKey = `agents/${agentId}/${Date.now()}-${file.name}`;

      // Upload to R2
      const uploadUrl = await this.getSignedUploadUrl(config, fileKey);

      // Upload file with progress tracking
      const uploadResult = await this.uploadWithProgress(file, uploadUrl, onProgress);

      if (!uploadResult.success) {
        return {
          success: false,
          fileKey,
          fileUrl: '',
          ragIndexed: false,
          errorMessage: 'File upload failed',
        };
      }

      const fileUrl = `https://${config.bucketName}.${config.accountId}.r2.cloudflarestorage.com/${fileKey}`;

      // Process with Auto RAG if enabled
      let ragIndexed = false;
      let vectorId: string | undefined;

      if (config.autoRagEnabled && config.vectorIndexId) {
        const ragResult = await this.processFileForRAG(config, fileKey, file.type, agentId);
        ragIndexed = ragResult.success;
        vectorId = ragResult.vectorId;
      }

      return {
        success: true,
        fileKey,
        fileUrl,
        ragIndexed,
        vectorId,
      };
    } catch (error) {
      ProductionLogger.error('Error uploading file with RAG:', 'cloudflareR2Service', error);
      return {
        success: false,
        fileKey: '',
        fileUrl: '',
        ragIndexed: false,
        errorMessage: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Get signed URL for R2 upload
   */
  private async getSignedUploadUrl(config: CloudflareR2Config, fileKey: string): Promise<string> {
    try {
      // Use actual Cloudflare R2 API with correct account ID
      const accountId = 'eace6f3c56b5735ae4a9ef385d6ee914';
      const bucketName = config.bucketName || 'eva-fin-b-test-r2-frontend-services';
      
      // Generate presigned URL for R2 upload
      const response = await fetch(`/api/r2/presigned-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          bucketName,
          fileKey,
          expiresIn: 3600, // 1 hour
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get presigned URL: ${response.statusText}`);
      }

      const { uploadUrl } = await response.json() as { uploadUrl: string };
      return uploadUrl;
    } catch (error) {
      ProductionLogger.error('Error getting signed upload URL:', 'cloudflareR2Service', error);
      // Fallback to direct R2 endpoint
      const accountId = 'eace6f3c56b5735ae4a9ef385d6ee914';
      const bucketName = config.bucketName || 'eva-fin-b-test-r2-frontend-services';
      return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${fileKey}`;
    }
  }

  /**
   * Upload file with progress tracking
   */
  private async uploadWithProgress(
    file: File,
    uploadUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; errorMessage?: string }> {
    return new Promise((resolve, _reject) => {
      const xhr = new XMLHttpRequest();

      // Configure for browser compatibility (especially Brave)
      xhr.withCredentials = false;
      xhr.timeout = 300000; // 5 minutes timeout

      xhr.upload.addEventListener('progress', event => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ success: true });
        } else {
          resolve({
            success: false,
            errorMessage: `Upload failed with status ${xhr.status}: ${xhr.statusText}`,
          });
        }
      });

      xhr.addEventListener('error', (event) => {
        ProductionLogger.error('XHR upload error:', 'cloudflareR2Service', event);
        resolve({
          success: false,
          errorMessage: `Network error during upload: ${xhr.statusText || 'Unknown error'}`,
        });
      });

      xhr.addEventListener('timeout', () => {
        resolve({
          success: false,
          errorMessage: 'Upload timeout - file may be too large or connection too slow',
        });
      });

      // Use FormData for better browser compatibility
      const formData = new FormData();
      formData.append('file', file, file.name);

      try {
        xhr.open('PUT', uploadUrl, true);
        
        // Add headers for R2 compatibility
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.setRequestHeader('Content-Length', file.size.toString());
        
        xhr.send(file); // Send file directly for R2
      } catch (error) {
        ProductionLogger.error('Error initiating upload:', 'cloudflareR2Service', error);
        resolve({
          success: false,
          errorMessage: `Failed to start upload: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    });
  }

  /**
   * Process file for RAG indexing
   */
  private async processFileForRAG(
    _config: CloudflareR2Config,
    _fileKey: string,
    _fileType: string,
    _agentId: string
  ): Promise<{ success: boolean; vectorId?: string; errorMessage?: string }> {
    try {
      // This would typically involve:
      // 1. Extract text from file (using Cloudflare AI or external service)
      // 2. Chunk the text appropriately
      // 3. Generate embeddings
      // 4. Store in Vectorize

      // Mock implementation for now
      const vectorId = `vec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        vectorId,
      };
    } catch (error) {
      ProductionLogger.error('Error processing file for RAG:', 'cloudflareR2Service', error);
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'RAG processing failed',
      };
    }
  }

  /**
   * Configure bucket webhook for auto-processing
   */
  private async configureBucketWebhook(
    _apiKey: string,
    _accountId: string,
    bucketName: string,
    _webhookUrl: string
  ): Promise<void> {
    // Implementation would configure R2 bucket notifications
    // to trigger Auto RAG processing on file uploads
    debugLog('general', 'log_statement', 'Configuring webhook for bucket:', bucketName)
  }

  /**
   * Get R2 connection status
   */
  async getConnectionStatus(agentId: string): Promise<CloudflareR2Connection | null> {
    try {
      // This would fetch from your backend API
      // Mock implementation
      return {
        id: `conn-${agentId}`,
        userId: 'user-demo',
        agentId,
        organizationId: 'org-demo',
        config: {
          apiKey: '***masked***',
          accountId: 'demo-account',
          bucketName: `eva-agent-${agentId}`,
          region: 'auto',
          autoRagEnabled: true,
          vectorIndexId: 'vector-index-demo',
          embeddingModel: 'text-embedding-3-small',
        },
        status: 'connected',
        createdAt: new Date(),
        lastSync: new Date(),
        storageUsed: 1024 * 1024 * 500, // 500MB
        documentsCount: 25,
        autoRagStatus: {
          enabled: true,
          indexingProgress: 100,
          lastIndexed: new Date(),
        },
      };
    } catch (error) {
      ProductionLogger.error('Error getting connection status:', 'cloudflareR2Service', error);
      return null;
    }
  }

  /**
   * Test connection to R2 and Vectorize
   */
  async testConnection(config: CloudflareR2Config): Promise<{
    r2Connected: boolean;
    vectorizeConnected: boolean;
    errorMessage?: string;
  }> {
    try {
      const validation = await this.validateAPIKey(config.apiKey, config.accountId);

      return {
        r2Connected: validation.bucketAccess,
        vectorizeConnected: validation.vectorDBAccess,
        errorMessage: validation.errorMessage,
      };
    } catch (error) {
      return {
        r2Connected: false,
        vectorizeConnected: false,
        errorMessage: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }

  /**
   * Format storage size for display
   */
  formatStorageSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(size < 10 ? 1 : 0)} ${units[unitIndex]}`;
  }
}

export default CloudflareR2Service;
