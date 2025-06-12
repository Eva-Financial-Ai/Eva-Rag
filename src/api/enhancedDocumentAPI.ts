import { STORAGE_CONFIG } from '../config/storageConfig';
import CloudflareR2Service from '../services/cloudflareR2Service';
import UnifiedStorageService from '../services/unifiedStorageService';

export interface EnhancedUploadOptions {
  transactionId?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
  priority?: 'high' | 'normal' | 'low';
}

export interface EnhancedDocumentResponse {
  success: boolean;
  documentId: string;
  cloudflareUrl?: string;
  supabaseId?: string;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  processingResults?: {
    ocrText?: string;
    extractedData?: Record<string, any>;
    aiSummary?: string;
    riskScore?: number;
  };
  error?: string;
}

class EnhancedDocumentAPI {
  private r2Service: CloudflareR2Service;
  private unifiedStorage: UnifiedStorageService;
  private uploadQueue: Map<string, any>;

  constructor() {
    this.r2Service = CloudflareR2Service.getInstance();
    this.unifiedStorage = UnifiedStorageService.getInstance();
    this.uploadQueue = new Map();
  }

  /**
   * Upload document with enhanced error handling and retry logic
   */
  async uploadDocument(
    file: File,
    options: EnhancedUploadOptions = {}
  ): Promise<EnhancedDocumentResponse> {
    try {
      // Validate file
      const validation = this.validateFile(file, options);
      if (!validation.valid) {
        return {
          success: false,
          documentId: '',
          status: 'failed',
          error: validation.error
        };
      }

      // Generate document ID
      const documentId = this.generateDocumentId(file, options);

      // Add to upload queue
      this.uploadQueue.set(documentId, {
        file,
        options,
        status: 'pending',
        attempts: 0
      });

      // Start upload process
      const result = await this.processUpload(documentId, file, options);
      
      // Remove from queue
      this.uploadQueue.delete(documentId);

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        documentId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Process the actual upload with retry logic
   */
  private async processUpload(
    documentId: string,
    file: File,
    options: EnhancedUploadOptions
  ): Promise<EnhancedDocumentResponse> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Update queue status
        const queueItem = this.uploadQueue.get(documentId);
        if (queueItem) {
          queueItem.status = 'uploading';
          queueItem.attempts = attempt + 1;
        }

        // Upload using unified storage service
        const uploadResult = await this.unifiedStorage.uploadFile(file, {
          ...options,
          metadata: {
            ...options.metadata,
            documentId,
            uploadAttempt: attempt + 1,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        });

        if (uploadResult.success) {
          // Process document (OCR, AI analysis, etc.)
          const processingResult = await this.processDocument(
            documentId,
            uploadResult.fileUrl || '',
            file,
            options
          );

          return {
            success: true,
            documentId,
            cloudflareUrl: uploadResult.fileUrl,
            supabaseId: uploadResult.supabaseId,
            status: 'processed',
            processingResults: processingResult
          };
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`Upload attempt ${attempt + 1} failed:`, error);
        
        // Wait before retry with exponential backoff
        if (attempt < maxRetries - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All retries failed
    return {
      success: false,
      documentId,
      status: 'failed',
      error: lastError?.message || 'Upload failed after multiple attempts'
    };
  }

  /**
   * Process document with AI/OCR
   */
  private async processDocument(
    documentId: string,
    fileUrl: string,
    file: File,
    options: EnhancedUploadOptions
  ): Promise<any> {
    try {
      // For finance documents, extract key information
      if (options.category && ['financial', 'tax', 'loan'].includes(options.category)) {
        return await this.processFinancialDocument(file, options);
      }

      // Default processing
      return {
        aiSummary: `Document ${file.name} uploaded successfully`,
        extractedData: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          category: options.category
        }
      };
    } catch (error) {
      console.error('Document processing error:', error);
      return null;
    }
  }

  /**
   * Process financial documents with specialized extraction
   */
  private async processFinancialDocument(
    file: File,
    options: EnhancedUploadOptions
  ): Promise<any> {
    // Mock financial data extraction
    // In production, this would use OCR and AI services
    const mockData: Record<string, any> = {
      financial: {
        totalAssets: '$1,234,567',
        totalLiabilities: '$567,890',
        netIncome: '$123,456',
        cashFlow: '$456,789',
        debtToEquity: '0.46',
        currentRatio: '2.3'
      },
      tax: {
        taxableIncome: '$234,567',
        taxPaid: '$45,678',
        effectiveRate: '19.5%',
        filingStatus: 'Corporation',
        taxYear: '2023'
      },
      loan: {
        requestedAmount: '$500,000',
        purpose: 'Equipment Purchase',
        term: '60 months',
        proposedRate: '6.5%',
        collateral: 'Equipment and Real Estate'
      }
    };

    return {
      aiSummary: `Processed ${options.category} document: ${file.name}`,
      extractedData: mockData[options.category || 'financial'] || {},
      riskScore: Math.random() * 100,
      ocrConfidence: 0.95
    };
  }

  /**
   * Validate file before upload
   */
  private validateFile(
    file: File,
    options: EnhancedUploadOptions
  ): { valid: boolean; error?: string } {
    // Check file type
    if (!STORAGE_CONFIG.cloudflare.allowedFileTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    // Check file size
    const maxSize = STORAGE_CONFIG.cloudflare.maxFileSize;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
      };
    }

    // Check file name
    if (!/^[\w\-. ]+$/.test(file.name)) {
      return {
        valid: false,
        error: 'File name contains invalid characters'
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique document ID
   */
  private generateDocumentId(file: File, options: EnhancedUploadOptions): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const category = options.category || 'general';
    return `${category}-${timestamp}-${random}`;
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get upload queue status
   */
  getUploadQueueStatus(): any[] {
    return Array.from(this.uploadQueue.entries()).map(([id, item]) => ({
      documentId: id,
      fileName: item.file.name,
      status: item.status,
      attempts: item.attempts,
      progress: item.progress || 0
    }));
  }

  /**
   * Cancel upload
   */
  cancelUpload(documentId: string): boolean {
    if (this.uploadQueue.has(documentId)) {
      this.uploadQueue.delete(documentId);
      return true;
    }
    return false;
  }

  /**
   * Batch upload multiple files
   */
  async batchUpload(
    files: File[],
    options: EnhancedUploadOptions = {}
  ): Promise<EnhancedDocumentResponse[]> {
    const results: EnhancedDocumentResponse[] = [];
    
    // Process files in parallel batches
    const batchSize = 3;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(file => this.uploadDocument(file, {
          ...options,
          onProgress: (progress) => {
            const overallProgress = ((i + batch.indexOf(file)) / files.length) * 100 + 
                                  (progress / files.length);
            options.onProgress?.(overallProgress);
          }
        }))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Search documents
   */
  async searchDocuments(query: string, filters?: {
    category?: string;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
    status?: string;
  }): Promise<any[]> {
    // Implement search across storage providers
    // This would integrate with Cloudflare R2 and Supabase search capabilities
    return [];
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<any> {
    // Implement document retrieval
    return null;
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    // Implement document deletion across all storage providers
    return false;
  }
}

// Export singleton instance
export const enhancedDocumentAPI = new EnhancedDocumentAPI();

// Export convenient methods
export const uploadDocument = (file: File, options?: EnhancedUploadOptions) => 
  enhancedDocumentAPI.uploadDocument(file, options);

export const batchUploadDocuments = (files: File[], options?: EnhancedUploadOptions) =>
  enhancedDocumentAPI.batchUpload(files, options);

export const searchDocuments = (query: string, filters?: any) =>
  enhancedDocumentAPI.searchDocuments(query, filters);

export const getUploadQueueStatus = () =>
  enhancedDocumentAPI.getUploadQueueStatus();

export default enhancedDocumentAPI;