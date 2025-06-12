// Document API client for EVA Financial Platform
// Interfaces with Cloudflare Workers backend for document management

export interface DocumentUploadResponse {
  success: boolean;
  documentId: string;
  workflowId: string;
  status: 'processing' | 'uploaded';
  error?: string;
}

export interface DocumentStatus {
  documentId: string;
  status: 'uploaded' | 'processing' | 'processed' | 'failed' | 'archived';
  metadata: Record<string, any>;
  processingResults: {
    ocrText?: string;
    ocrConfidence?: number;
    blockchainTxId?: string;
    vectorId?: string;
    searchIndexed?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSearchResult {
  answer: string;
  sources: Array<{
    documentId: string;
    confidence: number;
    snippet: string;
  }>;
  confidence: number;
}

export interface DocumentSearchRequest {
  query: string;
  transactionId?: string;
}

/**
 * Upload documents to the EVA AI platform
 */
export async function uploadDocuments(
  files: File[],
  transactionId?: string,
  metadata: Record<string, any> = {}
): Promise<DocumentUploadResponse[]> {
  const results: DocumentUploadResponse[] = [];

  for (const file of files) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('transactionId', transactionId || '');
      formData.append('metadata', JSON.stringify({
        ...metadata,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size
      }));

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        results.push(result);
      } else {
        const error = await response.text();
        results.push({
          success: false,
          documentId: '',
          workflowId: '',
          status: 'uploaded',
          error: `Upload failed: ${error}`
        });
      }
    } catch (error) {
      results.push({
        success: false,
        documentId: '',
        workflowId: '',
        status: 'uploaded',
        error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  return results;
}

/**
 * Get document processing status
 */
export async function getDocumentStatus(documentId: string): Promise<DocumentStatus | null> {
  try {
    const response = await fetch(`/api/documents/status?documentId=${documentId}`);
    
    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to get document status:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error getting document status:', error);
    return null;
  }
}

/**
 * Search and query documents using RAG
 */
export async function searchDocuments(request: DocumentSearchRequest): Promise<DocumentSearchResult | null> {
  try {
    const response = await fetch('/api/documents/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to search documents:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error searching documents:', error);
    return null;
  }
}

/**
 * Poll document status until processing is complete
 */
export async function pollDocumentProcessing(
  documentId: string,
  onProgress?: (status: DocumentStatus) => void,
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<DocumentStatus | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await getDocumentStatus(documentId);
    
    if (!status) {
      continue;
    }

    onProgress?.(status);

    if (status.status === 'processed' || status.status === 'failed') {
      return status;
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Document processing timed out after ${maxAttempts} attempts`);
}

/**
 * Download document
 */
export async function downloadDocument(documentId: string): Promise<Blob | null> {
  try {
    const response = await fetch(`/api/documents/download/${documentId}`);
    
    if (response.ok) {
      return await response.blob();
    } else {
      console.error('Failed to download document:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error downloading document:', error);
    return null;
  }
}

/**
 * Get document preview URL
 */
export function getDocumentPreviewUrl(documentId: string): string {
  return `/api/documents/preview/${documentId}`;
}

/**
 * Verify document blockchain status
 */
export async function verifyDocumentBlockchain(documentId: string): Promise<{
  verified: boolean;
  txHash?: string;
  blockNumber?: number;
  timestamp?: string;
  network?: string;
} | null> {
  try {
    const response = await fetch(`/api/documents/verify/${documentId}`);
    
    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to verify document:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error verifying document:', error);
    return null;
  }
}

/**
 * Share document with user
 */
export async function shareDocument(
  documentId: string,
  email: string,
  permission: 'view' | 'edit' | 'sign'
): Promise<boolean> {
  try {
    const response = await fetch(`/api/documents/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId,
        email,
        permission
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sharing document:', error);
    return false;
  }
}

/**
 * Get document analytics
 */
export async function getDocumentAnalytics(documentId: string): Promise<{
  views: number;
  downloads: number;
  shares: number;
  lastAccessed: string;
  accessHistory: Array<{
    user: string;
    action: string;
    timestamp: string;
  }>;
} | null> {
  try {
    const response = await fetch(`/api/documents/analytics/${documentId}`);
    
    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to get document analytics:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error getting document analytics:', error);
    return null;
  }
}

/**
 * Utility function to format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Utility function to get file type icon
 */
export function getFileTypeIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    case 'ppt':
    case 'pptx':
      return '📺';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return '🖼️';
    case 'txt':
      return '📃';
    case 'zip':
    case 'rar':
      return '📦';
    default:
      return '📄';
  }
}

/**
 * Utility function to validate file for upload
 */
export function validateFileForUpload(
  file: File,
  allowedTypes: string[] = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt'],
  maxSizeMB: number = 50
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`
    };
  }

  // Check file type
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !allowedTypes.includes(extension)) {
    return {
      valid: false,
      error: `File type not supported. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
} 