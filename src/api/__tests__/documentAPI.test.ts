import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as documentAPI from '../documentAPI';
import { DocumentSearchResult, DocumentStatus, DocumentUploadResponse } from '../documentAPI';

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('DocumentAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('uploadDocuments', () => {
    it('successfully uploads a single document', async () => {
      const mockFile = new File(['test content'], 'test-document.pdf', {
        type: 'application/pdf',
      });
      const mockResponse: DocumentUploadResponse[] = [
        {
          success: true,
          documentId: 'doc-123',
          workflowId: 'wf-456',
          status: 'processing',
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse[0],
      });

      const result = await documentAPI.uploadDocuments([mockFile], 'txn-789');

      expect(mockFetch).toHaveBeenCalledWith('/api/documents/upload', {
        method: 'POST',
        body: expect.any(FormData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles upload failure', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      mockFetch.mockResolvedValue({
        ok: false,
        text: async () => 'Upload failed: Server error',
      });

      const result = await documentAPI.uploadDocuments([mockFile]);

      expect(result[0].success).toBe(false);
      expect(result[0].error).toContain('Upload failed: Server error');
    });
  });

  describe('getDocumentStatus', () => {
    it('retrieves document status by ID', async () => {
      const mockStatus: DocumentStatus = {
        documentId: 'doc-123',
        status: 'processed',
        metadata: { pageCount: 10 },
        processingResults: { ocrText: 'some text', searchIndexed: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockStatus,
      });

      const result = await documentAPI.getDocumentStatus('doc-123');

      expect(mockFetch).toHaveBeenCalledWith('/api/documents/status?documentId=doc-123');
      expect(result).toEqual(mockStatus);
    });

    it('handles document status not found', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      const result = await documentAPI.getDocumentStatus('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('searchDocuments', () => {
    it('successfully searches documents', async () => {
      const mockSearchRequest = { query: 'What is the interest rate?' };
      const mockSearchResult: DocumentSearchResult = {
        answer: 'The interest rate is 5%.',
        sources: [
          {
            documentId: 'doc-abc',
            confidence: 0.98,
            snippet: '...the interest rate is 5%...',
          },
        ],
        confidence: 0.95,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockSearchResult,
      });

      const result = await documentAPI.searchDocuments(mockSearchRequest);

      expect(mockFetch).toHaveBeenCalledWith('/api/documents/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockSearchRequest),
      });
      expect(result).toEqual(mockSearchResult);
    });
  });

  describe('pollDocumentProcessing', () => {
    it('polls until processing is complete', async () => {
      const onProgress = vi.fn();
      const finalStatus: DocumentStatus = {
        documentId: 'doc-poll',
        status: 'processed',
        metadata: {},
        processingResults: {},
        createdAt: '',
        updatedAt: '',
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...finalStatus, status: 'processing' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => finalStatus,
        });

      const result = await documentAPI.pollDocumentProcessing('doc-poll', onProgress, 5, 10);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(onProgress).toHaveBeenCalledTimes(2);
      expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ status: 'processing' }));
      expect(result).toEqual(finalStatus);
    });

    it('times out if processing takes too long', async () => {
      const pendingStatus: DocumentStatus = {
        documentId: 'doc-timeout',
        status: 'processing',
        metadata: {},
        processingResults: {},
        createdAt: '',
        updatedAt: '',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => pendingStatus,
      });

      await expect(
        documentAPI.pollDocumentProcessing('doc-timeout', undefined, 2, 10),
      ).rejects.toThrow('Document processing timed out');
    });
  });

  describe('downloadDocument', () => {
    it('successfully downloads a document', async () => {
      const mockBlob = new Blob(['file content']);
      mockFetch.mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      });

      const result = await documentAPI.downloadDocument('doc-789');

      expect(mockFetch).toHaveBeenCalledWith('/api/documents/download/doc-789');
      expect(result).toEqual(mockBlob);
    });
  });

  describe('verifyDocumentBlockchain', () => {
    it('successfully verifies a document on the blockchain', async () => {
      const mockVerification = {
        verified: true,
        txHash: '0x123abc',
        blockNumber: 123456,
        timestamp: new Date().toISOString(),
        network: 'sepolia',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockVerification,
      });

      const result = await documentAPI.verifyDocumentBlockchain('doc-xyz');

      expect(mockFetch).toHaveBeenCalledWith('/api/documents/verify/doc-xyz');
      expect(result).toEqual(mockVerification);
    });
  });

  describe('shareDocument', () => {
    it('successfully shares a document', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const result = await documentAPI.shareDocument('doc-abc', 'test@example.com', 'view');

      expect(mockFetch).toHaveBeenCalledWith('/api/documents/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: 'doc-abc',
          email: 'test@example.com',
          permission: 'view',
        }),
      });
      expect(result).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    it('formats file size correctly', () => {
      expect(documentAPI.formatFileSize(1024)).toBe('1.0 KB');
      expect(documentAPI.formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB');
    });

    it('gets the correct file type icon', () => {
      expect(documentAPI.getFileTypeIcon('test.pdf')).toContain('FileText');
      expect(documentAPI.getFileTypeIcon('image.jpg')).toContain('FileImage');
      expect(documentAPI.getFileTypeIcon('archive.zip')).toContain('FileArchive');
    });

    it('validates files for upload', () => {
      const validFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      const largeFile = new File([new ArrayBuffer(60 * 1024 * 1024)], 'large.pdf');
      const invalidType = new File([''], 'test.exe', { type: 'application/x-msdownload' });

      expect(documentAPI.validateFileForUpload(validFile).valid).toBe(true);
      expect(documentAPI.validateFileForUpload(largeFile).valid).toBe(false);
      expect(documentAPI.validateFileForUpload(invalidType).valid).toBe(false);
    });
  });
});
