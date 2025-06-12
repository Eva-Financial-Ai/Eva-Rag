import CloudflareR2Service from './cloudflareR2Service';
import { uploadDocuments, getDocumentStatus, DocumentUploadResponse } from '../api/documentAPI';

import { debugLog } from '../utils/auditLogger';

export interface UnifiedUploadOptions {
  transactionId?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
}

export interface UnifiedUploadResult {
  success: boolean;
  fileId: string;
  cloudflareId?: string;
  supabaseId?: string;
  fileUrl?: string;
  error?: string;
}

export interface StorageProvider {
  name: 'cloudflare' | 'supabase' | 'local';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
}

class UnifiedStorageService {
  private static instance: UnifiedStorageService;
  private r2Service: CloudflareR2Service;
  private providers: Map<string, StorageProvider>;
  private syncQueue: Map<string, any>;

  private constructor() {
    this.r2Service = CloudflareR2Service.getInstance();
    this.providers = new Map();
    this.syncQueue = new Map();
    this.initializeProviders();
  }

  public static getInstance(): UnifiedStorageService {
    if (!UnifiedStorageService.instance) {
      UnifiedStorageService.instance = new UnifiedStorageService();
    }
    return UnifiedStorageService.instance;
  }

  private async initializeProviders() {
    // Initialize Cloudflare R2
    try {
      const r2Config = await this.r2Service.getConnectionStatus('default');
      if (r2Config) {
        this.providers.set('cloudflare', {
          name: 'cloudflare',
          status: 'connected',
          lastSync: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to initialize Cloudflare R2:', error);
      this.providers.set('cloudflare', {
        name: 'cloudflare',
        status: 'error'
      });
    }

    // Initialize Supabase (mock for now)
    this.providers.set('supabase', {
      name: 'supabase',
      status: 'connected',
      lastSync: new Date()
    });

    // Local storage as fallback
    this.providers.set('local', {
      name: 'local',
      status: 'connected'
    });
  }

  /**
   * Upload file to all configured storage providers
   */
  async uploadFile(
    file: File,
    options: UnifiedUploadOptions = {}
  ): Promise<UnifiedUploadResult> {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const results: Partial<UnifiedUploadResult> = {
      fileId,
      success: false
    };

    try {
      // Step 1: Upload to Cloudflare R2
      if (this.providers.get('cloudflare')?.status === 'connected') {
        const r2Config = await this.r2Service.getConnectionStatus('default');
        if (r2Config) {
          const r2Result = await this.r2Service.uploadFileWithSync(
            file,
            r2Config.config,
            options.transactionId || 'default',
            'filelock',
            {
              ...options.metadata,
              category: options.category,
              tags: options.tags
            },
            options.onProgress
          );

          if (r2Result.success) {
            results.cloudflareId = r2Result.fileKey;
            results.fileUrl = r2Result.fileUrl;
          }
        }
      }

      // Step 2: Upload metadata to Supabase
      if (this.providers.get('supabase')?.status === 'connected') {
        const supabaseResult = await this.uploadToSupabase(file, {
          ...options,
          cloudflareId: results.cloudflareId
        });
        
        if (supabaseResult.success) {
          results.supabaseId = supabaseResult.id;
        }
      }

      // Step 3: Register with document API
      const docResult = await uploadDocuments(
        [file],
        options.transactionId,
        {
          ...options.metadata,
          cloudflareId: results.cloudflareId,
          supabaseId: results.supabaseId,
          fileUrl: results.fileUrl
        }
      );

      if (docResult[0]?.success) {
        results.success = true;
      }

      // Step 4: Add to sync queue if any provider failed
      if (!results.cloudflareId || !results.supabaseId) {
        this.addToSyncQueue(fileId, file, options, results);
      }

      return results as UnifiedUploadResult;
    } catch (error) {
      console.error('Unified upload error:', error);
      
      // Fallback to local storage
      await this.saveToLocalStorage(fileId, file, options);
      this.addToSyncQueue(fileId, file, options, results);

      return {
        ...results,
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      } as UnifiedUploadResult;
    }
  }

  /**
   * Upload to Supabase (mock implementation)
   */
  private async uploadToSupabase(
    file: File,
    options: UnifiedUploadOptions & { cloudflareId?: string }
  ): Promise<{ success: boolean; id: string }> {
    // Mock Supabase upload
    // In real implementation, this would use Supabase client
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          id: `supabase-${Date.now()}`
        });
      }, 500);
    });
  }

  /**
   * Save file to local storage as fallback
   */
  private async saveToLocalStorage(
    fileId: string,
    file: File,
    options: UnifiedUploadOptions
  ): Promise<void> {
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = {
          fileId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          data: e.target?.result,
          options,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(`filelock-${fileId}`, JSON.stringify(data));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to save to local storage:', error);
    }
  }

  /**
   * Add failed upload to sync queue
   */
  private addToSyncQueue(
    fileId: string,
    file: File,
    options: UnifiedUploadOptions,
    partialResults: Partial<UnifiedUploadResult>
  ): void {
    this.syncQueue.set(fileId, {
      file,
      options,
      partialResults,
      retryCount: 0,
      lastAttempt: new Date()
    });

    // Start retry process
    this.startSyncRetry();
  }

  /**
   * Retry failed uploads
   */
  private async startSyncRetry(): Promise<void> {
    // Implement exponential backoff retry logic
    for (const [fileId, item] of this.syncQueue.entries()) {
      if (item.retryCount >= 3) {
        console.error(`Max retries reached for file ${fileId}`);
        continue;
      }

      const timeSinceLastAttempt = Date.now() - item.lastAttempt.getTime();
      const backoffTime = Math.pow(2, item.retryCount) * 1000; // Exponential backoff

      if (timeSinceLastAttempt >= backoffTime) {
        item.retryCount++;
        item.lastAttempt = new Date();

        try {
          const result = await this.uploadFile(item.file, item.options);
          if (result.success) {
            this.syncQueue.delete(fileId);
            debugLog('general', 'log_statement', `Successfully synced file ${fileId}`)
          }
        } catch (error) {
          console.error(`Retry failed for file ${fileId}:`, error);
        }
      }
    }

    // Schedule next retry check
    if (this.syncQueue.size > 0) {
      setTimeout(() => this.startSyncRetry(), 5000);
    }
  }

  /**
   * Get storage provider status
   */
  getProviderStatus(): StorageProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get sync queue status
   */
  getSyncQueueStatus(): { pending: number; failed: number } {
    let pending = 0;
    let failed = 0;

    for (const item of this.syncQueue.values()) {
      if (item.retryCount >= 3) {
        failed++;
      } else {
        pending++;
      }
    }

    return { pending, failed };
  }

  /**
   * Download file from any available source
   */
  async downloadFile(fileId: string): Promise<Blob | null> {
    try {
      // Try Cloudflare R2 first
      if (this.providers.get('cloudflare')?.status === 'connected') {
        // Implement R2 download
      }

      // Try Supabase
      if (this.providers.get('supabase')?.status === 'connected') {
        // Implement Supabase download
      }

      // Try local storage
      const localData = localStorage.getItem(`filelock-${fileId}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        const response = await fetch(parsed.data);
        return await response.blob();
      }

      return null;
    } catch (error) {
      console.error('Download error:', error);
      return null;
    }
  }

  /**
   * Search files across all providers
   */
  async searchFiles(query: string): Promise<any[]> {
    const results: any[] = [];

    // Search in each provider
    // Implementation would aggregate results from all sources

    return results;
  }

  /**
   * Sync files between providers
   */
  async syncProviders(): Promise<void> {
    debugLog('general', 'log_statement', 'Starting provider sync...')
    
    // Implement logic to sync files between Cloudflare R2 and Supabase
    // This ensures data consistency across platforms
  }
}

export default UnifiedStorageService;