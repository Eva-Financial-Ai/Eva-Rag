import { useState, useEffect, useCallback } from 'react';
import CloudflareR2Service, { R2PubSubEvent, R2PubSubEventType } from '../services/cloudflareR2Service';
import { CloudflareR2Config, R2UploadResult } from '../types/cloudflareR2Types';

import { debugLog } from '../utils/auditLogger';

interface UseR2IntegrationOptions {
  applicationId: string;
  documentType: 'credit_application' | 'filelock';
  autoSync?: boolean;
  enableCache?: boolean;
}

interface R2IntegrationState {
  isConnected: boolean;
  isInitializing: boolean;
  syncedDocuments: Map<string, any>;
  uploadProgress: Map<string, number>;
  error: string | null;
}

export const useR2Integration = (options: UseR2IntegrationOptions) => {
  const r2Service = CloudflareR2Service.getInstance();
  
  const [state, setState] = useState<R2IntegrationState>({
    isConnected: false,
    isInitializing: true,
    syncedDocuments: new Map(),
    uploadProgress: new Map(),
    error: null
  });

  // R2 Configuration
  const r2Config: CloudflareR2Config = {
    apiKey: process.env.REACT_APP_CLOUDFLARE_API_TOKEN || '',
    accountId: 'eace6f3c56b5735ae4a9ef385d6ee914',
    bucketName: 'eva-fin-b-test-r2-frontend-services',
    region: 'auto',
    autoRagEnabled: true,
    embeddingModel: 'text-embedding-3-small'
  };

  // Initialize PubSub connection
  useEffect(() => {
    const initializeR2 = async () => {
      try {
        setState(prev => ({ ...prev, isInitializing: true, error: null }));
        
        // Initialize PubSub
        await r2Service.initializePubSub();
        
        // Subscribe to relevant events
        const unsubscribers: (() => void)[] = [];
        
        // Listen for file uploads
        unsubscribers.push(
          r2Service.onPubSubEvent(R2PubSubEventType.FILE_UPLOADED, (event) => {
            if (event.targetApplicationId === options.applicationId) {
              setState(prev => {
                const newDocs = new Map(prev.syncedDocuments);
                newDocs.set(event.payload.fileKey as string, event.payload);
                return { ...prev, syncedDocuments: newDocs };
              });
            }
          })
        );
        
        // Listen for sync events
        if (options.autoSync) {
          unsubscribers.push(
            r2Service.onPubSubEvent(R2PubSubEventType.DOCUMENT_SYNCED, (event) => {
              if (event.targetApplicationId === options.applicationId) {
                debugLog('general', 'log_statement', '[R2 Integration] Document synced:', event.payload)
              }
            })
          );
        }
        
        setState(prev => ({ ...prev, isConnected: true, isInitializing: false }));
        
        // Cleanup function
        return () => {
          unsubscribers.forEach(unsub => unsub());
        };
      } catch (error) {
        console.error('[R2 Integration] Initialization failed:', error);
        setState(prev => ({
          ...prev,
          isInitializing: false,
          error: error instanceof Error ? error.message : 'Failed to initialize R2'
        }));
      }
    };
    
    initializeR2();
  }, [options.applicationId, options.autoSync]);

  // Upload file with progress tracking
  const uploadFile = useCallback(async (
    file: File,
    metadata?: any
  ): Promise<R2UploadResult> => {
    const fileId = `${file.name}-${Date.now()}`;
    
    try {
      // Update progress
      setState(prev => {
        const newProgress = new Map(prev.uploadProgress);
        newProgress.set(fileId, 0);
        return { ...prev, uploadProgress: newProgress };
      });
      
      // Upload with sync
      const result = await r2Service.uploadFileWithSync(
        file,
        r2Config,
        options.applicationId,
        options.documentType,
        metadata,
        (progress) => {
          setState(prev => {
            const newProgress = new Map(prev.uploadProgress);
            newProgress.set(fileId, progress);
            return { ...prev, uploadProgress: newProgress };
          });
        }
      );
      
      // Clear progress on completion
      setState(prev => {
        const newProgress = new Map(prev.uploadProgress);
        newProgress.delete(fileId);
        return { ...prev, uploadProgress: newProgress };
      });
      
      return result;
    } catch (error) {
      console.error('[R2 Integration] Upload failed:', error);
      
      // Clear progress and set error
      setState(prev => {
        const newProgress = new Map(prev.uploadProgress);
        newProgress.delete(fileId);
        return {
          ...prev,
          uploadProgress: newProgress,
          error: error instanceof Error ? error.message : 'Upload failed'
        };
      });
      
      return {
        success: false,
        fileKey: '',
        fileUrl: '',
        ragIndexed: false,
        errorMessage: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }, [options.applicationId, options.documentType, r2Config]);

  // Get cached data
  const getCachedDocument = useCallback((key: string) => {
    if (options.enableCache) {
      return r2Service.getCachedData(key);
    }
    return null;
  }, [options.enableCache]);

  // Sync document between credit app and filelock
  const syncDocument = useCallback(async (
    documentKey: string,
    metadata?: any
  ): Promise<boolean> => {
    if (options.documentType === 'credit_application') {
      return r2Service.syncCreditApplicationToFilelock(
        options.applicationId,
        documentKey,
        metadata
      );
    }
    return false;
  }, [options.applicationId, options.documentType]);

  // Get all synced documents
  const getSyncedDocuments = useCallback(() => {
    return Array.from(state.syncedDocuments.values());
  }, [state.syncedDocuments]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    isConnected: state.isConnected,
    isInitializing: state.isInitializing,
    error: state.error,
    uploadProgress: state.uploadProgress,
    
    // Methods
    uploadFile,
    syncDocument,
    getSyncedDocuments,
    getCachedDocument,
    clearError,
    
    // Service instance (for advanced usage)
    r2Service
  };
}; 