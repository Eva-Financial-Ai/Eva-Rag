import { v4 as uuidv4 } from 'uuid';

import { debugLog } from '../utils/auditLogger';

// Types and interfaces
export interface FileVaultDocument {
  id: string;
  fileName: string;
  fileSize: number;
  filePath: string;
  fileType: string;
  transactionId: string;
  createdAt: string;
  createdBy: string;
  tags: string[];
  isSecure: boolean;
  accessLevel: 'private' | 'transaction' | 'organization' | 'public';
  expiresAt?: string;
  versionId: string;
  versionNumber: number;
  checksum: string;
}

export interface FileUploadOptions {
  transactionId: string;
  tags?: string[];
  accessLevel?: 'private' | 'transaction' | 'organization' | 'public';
  expiresAt?: string;
  isSecure?: boolean;
  userId?: string;
}

export interface FileSearchParams {
  transactionId?: string;
  fileType?: string[];
  tags?: string[];
  createdBy?: string;
  startDate?: string;
  endDate?: string;
  accessLevel?: 'private' | 'transaction' | 'organization' | 'public';
}

// Simulate storage with localStorage
class FileVaultService {
  private static readonly STORAGE_KEY = 'fileVault_documents';
  
  /**
   * Store document in the FileVault/Filelock Drive
   */
  async storeDocument(
    fileData: Blob | string | object,
    fileName: string,
    options: FileUploadOptions
  ): Promise<FileVaultDocument> {
    debugLog('general', 'log_statement', 'Storing document in FileVault:', fileName)
    
    try {
      // Generate metadata
      const fileId = uuidv4();
      const now = new Date().toISOString();
      const fileSize = typeof fileData === 'string' 
        ? new Blob([fileData]).size 
        : typeof fileData === 'object' && !(fileData instanceof Blob)
          ? new Blob([JSON.stringify(fileData)]).size
          : (fileData as Blob).size;
      
      // Generate file extension based on filename
      const fileExtension = fileName.split('.').pop() || 'txt';
      const fileType = this.getFileTypeFromExtension(fileExtension);
      
      // Calculate simple checksum (in real implementation, this would be SHA-256 or similar)
      const checksum = `sha256-${Math.random().toString(36).substring(2, 15)}`;
      
      // Create document record
      const document: FileVaultDocument = {
        id: fileId,
        fileName,
        fileSize,
        filePath: `/fileVault/${options.transactionId}/${fileId}.${fileExtension}`,
        fileType,
        transactionId: options.transactionId,
        createdAt: now,
        createdBy: options.userId || 'current_user',
        tags: options.tags || [],
        isSecure: options.isSecure !== undefined ? options.isSecure : true,
        accessLevel: options.accessLevel || 'transaction',
        expiresAt: options.expiresAt,
        versionId: uuidv4(),
        versionNumber: 1,
        checksum
      };
      
      // Store in localStorage (in a real implementation, this would be an API call)
      const documents = this.getAllDocuments();
      documents.push(document);
      localStorage.setItem(FileVaultService.STORAGE_KEY, JSON.stringify(documents));
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return document;
    } catch (error) {
      console.error('Error storing document in FileVault:', error);
      throw new Error('Failed to store document in FileVault');
    }
  }
  
  /**
   * Get all documents from FileVault
   */
  getAllDocuments(): FileVaultDocument[] {
    try {
      const documents = localStorage.getItem(FileVaultService.STORAGE_KEY);
      return documents ? JSON.parse(documents) : [];
    } catch (error) {
      console.error('Error retrieving documents from FileVault:', error);
      return [];
    }
  }
  
  /**
   * Get document by ID
   */
  getDocumentById(documentId: string): FileVaultDocument | null {
    try {
      const documents = this.getAllDocuments();
      return documents.find(doc => doc.id === documentId) || null;
    } catch (error) {
      console.error('Error retrieving document from FileVault:', error);
      return null;
    }
  }
  
  /**
   * Search for documents based on criteria
   */
  searchDocuments(params: FileSearchParams): FileVaultDocument[] {
    try {
      const documents = this.getAllDocuments();
      
      return documents.filter(doc => {
        // Filter by transaction ID if provided
        if (params.transactionId && doc.transactionId !== params.transactionId) {
          return false;
        }
        
        // Filter by file type if provided
        if (params.fileType && params.fileType.length > 0 && !params.fileType.includes(doc.fileType)) {
          return false;
        }
        
        // Filter by tags if provided
        if (params.tags && params.tags.length > 0) {
          const hasMatchingTag = params.tags.some(tag => doc.tags.includes(tag));
          if (!hasMatchingTag) {
            return false;
          }
        }
        
        // Filter by created by if provided
        if (params.createdBy && doc.createdBy !== params.createdBy) {
          return false;
        }
        
        // Filter by date range if provided
        if (params.startDate) {
          const startDate = new Date(params.startDate);
          const docDate = new Date(doc.createdAt);
          if (docDate < startDate) {
            return false;
          }
        }
        
        if (params.endDate) {
          const endDate = new Date(params.endDate);
          const docDate = new Date(doc.createdAt);
          if (docDate > endDate) {
            return false;
          }
        }
        
        // Filter by access level if provided
        if (params.accessLevel && doc.accessLevel !== params.accessLevel) {
          return false;
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error searching documents in FileVault:', error);
      return [];
    }
  }
  
  /**
   * Get transaction documents
   */
  getTransactionDocuments(transactionId: string): FileVaultDocument[] {
    return this.searchDocuments({ transactionId });
  }
  
  /**
   * Delete document from FileVault
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const documents = this.getAllDocuments();
      const updatedDocuments = documents.filter(doc => doc.id !== documentId);
      
      if (documents.length === updatedDocuments.length) {
        // Document not found
        return false;
      }
      
      localStorage.setItem(FileVaultService.STORAGE_KEY, JSON.stringify(updatedDocuments));
      return true;
    } catch (error) {
      console.error('Error deleting document from FileVault:', error);
      return false;
    }
  }
  
  /**
   * Get file type from extension
   */
  private getFileTypeFromExtension(extension: string): string {
    const extensionMap: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'json': 'application/json',
      'html': 'text/html',
      'zip': 'application/zip'
    };
    
    return extensionMap[extension.toLowerCase()] || 'application/octet-stream';
  }
}

// Create singleton instance
const fileVaultService = new FileVaultService();
export default fileVaultService; 