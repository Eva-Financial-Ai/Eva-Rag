import { uploadDocument as originalUploadDocument, batchUploadDocuments as originalBatchUploadDocuments } from './enhancedDocumentAPI';
import { immutableLedgerService } from '../services/immutableLedgerService';

// Enhanced upload function that records to ledger
export const uploadDocument = async (
  file: File,
  options: {
    transactionId?: string;
    category?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    customerId?: string;
    customerName?: string;
    onProgress?: (progress: number) => void;
  } = {}
): Promise<any> => {
  // First, perform the original upload
  const result = await originalUploadDocument(file, options);
  
  // If successful, record to ledger
  if (result.success && result.documentId) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = localStorage.getItem('userRole') || 'user';
      
      await immutableLedgerService.recordEvent({
        eventType: 'document_upload',
        category: 'document',
        actor: {
          userId: user.id || 'anonymous',
          userName: user.name || 'Anonymous User',
          userRole: userRole
        },
        subject: {
          type: 'document',
          id: result.documentId,
          name: file.name,
          metadata: {
            size: file.size,
            type: file.type,
            category: options.category
          }
        },
        action: `Uploaded document: ${file.name}`,
        customerId: options.customerId,
        customerName: options.customerName,
        transactionId: options.transactionId,
        documentId: result.documentId,
        details: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          category: options.category,
          tags: options.tags,
          uploadTime: new Date().toISOString(),
          ...options.metadata
        },
        tags: options.tags || []
      });
    } catch (ledgerError) {
      console.error('Failed to record document upload to ledger:', ledgerError);
      // Don't fail the upload if ledger recording fails
    }
  }
  
  return result;
};

// Enhanced batch upload function that records to ledger
export const batchUploadDocuments = async (
  files: File[],
  options: {
    transactionId?: string;
    category?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    customerId?: string;
    customerName?: string;
    onProgress?: (progress: number) => void;
  } = {}
): Promise<any[]> => {
  // First, perform the original batch upload
  const results = await originalBatchUploadDocuments(files, options);
  
  // Record successful uploads to ledger
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = localStorage.getItem('userRole') || 'user';
  
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const file = files[i];
    
    if (result.success && result.documentId) {
      try {
        await immutableLedgerService.recordEvent({
          eventType: 'document_upload',
          category: 'document',
          actor: {
            userId: user.id || 'anonymous',
            userName: user.name || 'Anonymous User',
            userRole: userRole
          },
          subject: {
            type: 'document',
            id: result.documentId,
            name: file.name,
            metadata: {
              size: file.size,
              type: file.type,
              category: options.category,
              batchIndex: i,
              batchSize: files.length
            }
          },
          action: `Uploaded document: ${file.name} (batch ${i + 1}/${files.length})`,
          customerId: options.customerId,
          customerName: options.customerName,
          transactionId: options.transactionId,
          documentId: result.documentId,
          details: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            category: options.category,
            tags: options.tags,
            batchIndex: i,
            batchSize: files.length,
            uploadTime: new Date().toISOString(),
            ...options.metadata
          },
          tags: options.tags || []
        });
      } catch (ledgerError) {
        console.error(`Failed to record document upload to ledger for ${file.name}:`, ledgerError);
        // Don't fail the upload if ledger recording fails
      }
    }
  }
  
  return results;
};

// Export all other functions from the original API
export * from './enhancedDocumentAPI';