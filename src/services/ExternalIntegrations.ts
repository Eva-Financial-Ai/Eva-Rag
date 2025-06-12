import CloudflareR2Service, { R2PubSubEventType } from './cloudflareR2Service';

import { debugLog } from '../utils/auditLogger';

const r2Service = CloudflareR2Service.getInstance();

// Initialize R2 PubSub connection
r2Service.initializePubSub();

const FilelockService = {
  async upload(transactionId: string, pdfBlob: Blob): Promise<{ fileId: string; viewUrl: string }> {
    debugLog('general', 'log_statement', `[FilelockService] Uploading PDF for txId: ${transactionId}`,
                  `Blob size: ${pdfBlob.size}`)
    
    try {
      // Convert Blob to File for R2 upload
      const file = new File([pdfBlob], `${transactionId}-document.pdf`, { type: 'application/pdf' });
      
      // Upload to R2 with sync
      const r2Config = {
        apiKey: process.env.REACT_APP_CLOUDFLARE_API_TOKEN || '',
        accountId: 'eace6f3c56b5735ae4a9ef385d6ee914',
        bucketName: 'eva-fin-b-test-r2-frontend-services',
        region: 'auto',
        autoRagEnabled: true,
        embeddingModel: 'text-embedding-3-small'
      };
      
      const result = await r2Service.uploadFileWithSync(
        file,
        r2Config,
        transactionId,
        'filelock',
        {
          source: 'filelock',
          transactionId,
          uploadedAt: new Date().toISOString(),
          documentType: 'transaction-summary'
        }
      );
      
      if (result.success) {
        const fileId = `fl_${transactionId}_${Date.now()}`;
        
        // Publish filelock event
        await r2Service.publishEvent({
          type: R2PubSubEventType.FILELOCK_REQUEST_CREATED,
          source: 'filelock',
          targetApplicationId: transactionId,
          payload: {
            fileId,
            fileKey: result.fileKey,
            fileUrl: result.fileUrl,
            viewUrl: `/filelock/view/${fileId}`,
            ragIndexed: result.ragIndexed
          }
        });
        
        debugLog('general', 'log_statement', `[FilelockService] Upload success. File ID: ${fileId}, R2 Key: ${result.fileKey}`)
        return { fileId, viewUrl: `/filelock/view/${fileId}` };
      } else {
        throw new Error(result.errorMessage || 'Upload to R2 failed');
      }
    } catch (error) {
      console.error('[FilelockService] Upload error:', error);
      // Fallback to mock response
    const fileId = `fl_${transactionId}_${Date.now()}`;
    const viewUrl = `/filelock/view/${fileId}`;
    return { fileId, viewUrl };
    }
  },
  
  async getDocumentsForTransaction(transactionId: string): Promise<any[]> {
    // Get cached documents from R2
    const cachedDocs = r2Service.getCachedData(`filelock:${transactionId}`);
    if (cachedDocs && Array.isArray(cachedDocs)) {
      return cachedDocs;
    }
    
    // In real implementation, fetch from R2 bucket
    return [];
  },
  
  async syncWithCreditApplication(transactionId: string): Promise<boolean> {
    try {
      // Subscribe to credit application events for this transaction
      const unsubscribe = r2Service.onPubSubEvent(
        R2PubSubEventType.CREDIT_APP_DOCUMENT_ADDED,
        (event) => {
          if (event.targetApplicationId === transactionId) {
            debugLog('general', 'log_statement', '[FilelockService] Received document from credit application:', event.payload)
            // Process and store the document
          }
        }
      );
      
      // Clean up after 24 hours
      setTimeout(() => unsubscribe(), 24 * 60 * 60 * 1000);
      
      return true;
    } catch (error) {
      console.error('[FilelockService] Sync error:', error);
      return false;
    }
  }
};

const ShieldVaultService = {
  async recordEvent(transactionId: string, eventType: string, eventData: any): Promise<void> {
    debugLog('general', 'log_statement', `[ShieldVaultService] Recording event for txId: ${transactionId}, Type: ${eventType}`, eventData)
    
    try {
      // Record event in R2 audit log
      const auditEntry = {
        transactionId,
        eventType,
        eventData,
        timestamp: new Date().toISOString(),
        source: 'shield-vault'
      };
      
      // Convert to file for R2 storage
      const auditFile = new File(
        [JSON.stringify(auditEntry, null, 2)],
        `audit-${transactionId}-${Date.now()}.json`,
        { type: 'application/json' }
      );
      
      const r2Config = {
        apiKey: process.env.REACT_APP_CLOUDFLARE_API_TOKEN || '',
        accountId: 'eace6f3c56b5735ae4a9ef385d6ee914',
        bucketName: 'eva-fin-b-test-r2-frontend-services',
        region: 'auto',
        autoRagEnabled: false, // No RAG needed for audit logs
        embeddingModel: 'text-embedding-3-small'
      };
      
      await r2Service.uploadFileWithRAG(
        auditFile,
        r2Config,
        `audit-${transactionId}`,
        (progress) => {
          debugLog('general', 'log_statement', `[ShieldVaultService] Audit upload progress: ${progress}%`)
        }
      );
      
      debugLog('general', 'log_statement', `[ShieldVaultService] Event recorded successfully in R2.`)
    } catch (error) {
      console.error('[ShieldVaultService] Failed to record event:', error);
      // Continue without throwing - audit failures shouldn't break the flow
    }
  },
  
  async getAuditLog(transactionId: string): Promise<any[]> {
    // Get cached audit entries
    const cachedAudit = r2Service.getCachedData(`audit:${transactionId}`);
    if (cachedAudit && Array.isArray(cachedAudit)) {
      return cachedAudit;
    }
    
    // In real implementation, fetch from R2 bucket
    return [];
  }
};

export { FilelockService, ShieldVaultService }; 