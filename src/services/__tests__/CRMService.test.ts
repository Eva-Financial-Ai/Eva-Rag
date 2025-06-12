import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import crmService, {
  DocumentAssociation,
  CustomerDocument,
  TransactionDocument,
  CRMActivity,
  CustomerNote,
  CustomerCommunication,
  CustomerRelationship
} from '../CRMService';
import { FilelockIntegrationService } from '../FilelockIntegrationService';

// Mock FileLock integration
vi.mock('../FilelockIntegrationService', () => ({
  FilelockIntegrationService: {
    addToShieldVault: vi.fn()
  }
}));

describe('CRMService - Full CRUD Operations Test Suite', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorage.clear();
    // Reset the service instance
    (crmService as any).documentAssociations = new Map();
    (crmService as any).customerDocuments = new Map();
    (crmService as any).transactionDocuments = new Map();
    (crmService as any).activities = [];
    (crmService as any).relationships = [];
    (crmService as any).notes = [];
    (crmService as any).communications = [];
    
    // Setup default mock return value
    vi.mocked(FilelockIntegrationService.addToShieldVault).mockResolvedValue({
      success: true,
      vaultFileId: 'vault-123',
      message: 'Document uploaded successfully',
      transactionHash: 'hash-123'
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Document Association CRUD Operations', () => {
    it('should CREATE document association for customer', async () => {
      const customerId = 'CUST-001';
      const documentInfo = {
        documentName: 'Test Document.pdf',
        documentType: 'financial',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        tags: ['test', 'financial']
      };

      const association = await crmService.associateDocumentToCustomer(
        'DOC-001',
        customerId,
        documentInfo
      );

      expect(association).toBeDefined();
      expect(association.documentId).toBe('DOC-001');
      expect(association.associatedId).toBe(customerId);
      expect(association.associationType).toBe('customer');
      expect(association.documentName).toBe('Test Document.pdf');
      expect(association.status).toBe('active');
    });

    it('should READ document associations for customer', async () => {
      const customerId = 'CUST-001';
      
      // Create some associations first
      await crmService.associateDocumentToCustomer('DOC-001', customerId, {
        documentName: 'Doc1.pdf'
      });
      await crmService.associateDocumentToCustomer('DOC-002', customerId, {
        documentName: 'Doc2.pdf'
      });

      const associations = await crmService.getDocumentAssociations(customerId);
      
      expect(associations).toHaveLength(2);
      expect(associations[0].documentName).toBe('Doc1.pdf');
      expect(associations[1].documentName).toBe('Doc2.pdf');
    });

    it('should CREATE document association for transaction', async () => {
      const transactionId = 'TXN-001';
      const customerId = 'CUST-001';
      
      const transactionDoc = await crmService.associateDocumentToTransaction(
        'DOC-003',
        transactionId,
        customerId,
        {
          documentType: 'loan-agreement',
          purpose: 'closing',
          required: true
        }
      );

      expect(transactionDoc).toBeDefined();
      expect(transactionDoc.documentId).toBe('DOC-003');
      expect(transactionDoc.transactionId).toBe(transactionId);
      expect(transactionDoc.customerId).toBe(customerId);
      expect(transactionDoc.purpose).toBe('closing');
      expect(transactionDoc.required).toBe(true);
      expect(transactionDoc.status).toBe('submitted');
    });

    it('should handle bulk document associations', async () => {
      const customerId = 'CUST-001';
      const documentIds = ['DOC-001', 'DOC-002', 'DOC-003'];
      
      const associations = await crmService.bulkAssociateDocuments(
        documentIds,
        customerId
      );

      expect(associations).toHaveLength(3);
      associations.forEach((assoc, index) => {
        expect(assoc.documentId).toBe(documentIds[index]);
        expect(assoc.associatedId).toBe(customerId);
      });
    });
  });

  describe('Activity Management CRUD Operations', () => {
    it('should CREATE new activity', async () => {
      const activity = await crmService.logActivity({
        customerId: 'CUST-001',
        type: 'note',
        subject: 'Initial contact',
        description: 'Discussed loan requirements',
        priority: 'high'
      });

      expect(activity).toBeDefined();
      expect(activity.id).toMatch(/^act-/);
      expect(activity.customerId).toBe('CUST-001');
      expect(activity.type).toBe('note');
      expect(activity.priority).toBe('high');
    });

    it('should READ customer activities', async () => {
      const customerId = 'CUST-001';
      
      // Create multiple activities
      await crmService.logActivity({
        customerId,
        type: 'call',
        subject: 'Follow-up call'
      });
      await crmService.logActivity({
        customerId,
        type: 'email',
        subject: 'Document request'
      });
      await crmService.logActivity({
        customerId: 'CUST-002', // Different customer
        type: 'note',
        subject: 'Other customer note'
      });

      const activities = await crmService.getCustomerActivities(customerId);
      
      expect(activities).toHaveLength(2);
      expect(activities.every(act => act.customerId === customerId)).toBe(true);
    });

    it('should READ transaction activities', async () => {
      const transactionId = 'TXN-001';
      
      await crmService.logActivity({
        customerId: 'CUST-001',
        transactionId,
        type: 'document',
        subject: 'Document uploaded'
      });

      const activities = await crmService.getTransactionActivities(transactionId);
      
      expect(activities).toHaveLength(1);
      expect(activities[0].transactionId).toBe(transactionId);
    });
  });

  describe('Customer Notes CRUD Operations', () => {
    it('should CREATE customer note', async () => {
      const note = await crmService.addCustomerNote({
        customerId: 'CUST-001',
        note: 'Customer has excellent payment history',
        category: 'credit',
        isPrivate: false
      });

      expect(note).toBeDefined();
      expect(note.id).toMatch(/^note-/);
      expect(note.customerId).toBe('CUST-001');
      expect(note.category).toBe('credit');
      expect(note.isPrivate).toBe(false);
    });

    it('should READ customer notes', async () => {
      const customerId = 'CUST-001';
      
      await crmService.addCustomerNote({
        customerId,
        note: 'Note 1',
        category: 'general'
      });
      await crmService.addCustomerNote({
        customerId,
        note: 'Note 2',
        category: 'compliance',
        isPrivate: true
      });

      const notes = await crmService.getCustomerNotes(customerId);
      
      expect(notes).toHaveLength(2);
      expect(notes[0].note).toBe('Note 1');
      expect(notes[1].isPrivate).toBe(true);
    });
  });

  describe('Communication Tracking CRUD Operations', () => {
    it('should CREATE communication log', async () => {
      const comm = await crmService.logCommunication({
        customerId: 'CUST-001',
        type: 'email',
        direction: 'outbound',
        subject: 'Loan approval notification',
        content: 'Your loan has been approved',
        from: 'lender@eva.ai',
        to: 'customer@example.com'
      });

      expect(comm).toBeDefined();
      expect(comm.id).toMatch(/^comm-/);
      expect(comm.type).toBe('email');
      expect(comm.direction).toBe('outbound');
      expect(comm.status).toBe('sent');
    });

    it('should READ customer communications', async () => {
      const customerId = 'CUST-001';
      
      await crmService.logCommunication({
        customerId,
        type: 'phone',
        direction: 'inbound',
        content: 'Customer called about rates'
      });
      await crmService.logCommunication({
        customerId,
        type: 'sms',
        direction: 'outbound',
        content: 'Payment reminder'
      });

      const comms = await crmService.getCustomerCommunications(customerId);
      
      expect(comms).toHaveLength(2);
      expect(comms[0].type).toBe('phone');
      expect(comms[1].type).toBe('sms');
    });
  });

  describe('Relationship Management CRUD Operations', () => {
    it('should CREATE customer relationship', async () => {
      const relationship = await crmService.addCustomerRelationship({
        customerId: 'CUST-001',
        relatedCustomerId: 'CUST-002',
        relationshipType: 'spouse'
      });

      expect(relationship).toBeDefined();
      expect(relationship.customerId).toBe('CUST-001');
      expect(relationship.relatedCustomerId).toBe('CUST-002');
      expect(relationship.relationshipType).toBe('spouse');
      expect(relationship.status).toBe('active');
    });

    it('should READ customer relationships', async () => {
      const customerId = 'CUST-001';
      
      await crmService.addCustomerRelationship({
        customerId,
        relatedCustomerId: 'CUST-002',
        relationshipType: 'partner'
      });
      await crmService.addCustomerRelationship({
        customerId: 'CUST-003',
        relatedCustomerId: customerId,
        relationshipType: 'guarantor'
      });

      const relationships = await crmService.getCustomerRelationships(customerId);
      
      expect(relationships).toHaveLength(2);
      // Should return relationships where customer is either primary or related
      expect(relationships.some(r => r.relationshipType === 'partner')).toBe(true);
      expect(relationships.some(r => r.relationshipType === 'guarantor')).toBe(true);
    });
  });

  describe('Document Search Operations', () => {
    it('should search documents by query', async () => {
      const customerId = 'CUST-001';
      
      // Create test documents
      await crmService.associateDocumentToCustomer('DOC-001', customerId, {
        documentName: 'Financial Statement 2023.pdf',
        documentType: 'financial'
      });
      await crmService.associateDocumentToCustomer('DOC-002', customerId, {
        documentName: 'Tax Return 2023.pdf',
        documentType: 'tax'
      });

      const results = await crmService.searchDocuments('2023');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(doc => JSON.stringify(doc).includes('2023'))).toBe(true);
    });

    it('should search documents with filters', async () => {
      const customerId = 'CUST-001';
      const transactionId = 'TXN-001';
      
      await crmService.associateDocumentToCustomer('DOC-001', customerId, {
        documentName: 'ID Document.pdf'
      });
      await crmService.associateDocumentToTransaction(
        'DOC-002',
        transactionId,
        customerId,
        { documentType: 'contract' }
      );

      const results = await crmService.searchDocuments('', {
        customerId,
        documentType: 'identity'
      });
      
      expect(results).toBeDefined();
    });
  });

  describe('FileLock Integration', () => {
    it('should upload document with FileLock integration', async () => {
      const mockFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf'
      });
      const customerId = 'CUST-001';
      const transactionId = 'TXN-001';

      const result = await crmService.uploadDocumentWithFileLock(
        mockFile,
        customerId,
        transactionId,
        {
          documentType: 'financial-statement',
          purpose: 'verification',
          required: true
        }
      );

      expect(result.documentAssociation).toBeDefined();
      expect(result.transactionDocument).toBeDefined();
      expect(result.shieldVaultResult).toBeDefined();
      expect(FilelockIntegrationService.addToShieldVault).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({
          customerId,
          transactionId,
          documentType: 'financial-statement'
        })
      );
    });
  });

  describe('Dashboard and Analytics', () => {
    it('should retrieve dashboard data', async () => {
      const dashboardData = await crmService.getDashboardData();

      expect(dashboardData).toBeDefined();
      expect(dashboardData.totalCustomers).toBeGreaterThanOrEqual(0);
      expect(dashboardData.activeCustomers).toBeGreaterThanOrEqual(0);
      expect(dashboardData.totalTransactions).toBeGreaterThanOrEqual(0);
      expect(dashboardData.totalDocuments).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(dashboardData.recentActivities)).toBe(true);
      expect(Array.isArray(dashboardData.upcomingTasks)).toBe(true);
    });

    it('should export customer data', async () => {
      const customerId = 'CUST-001';
      
      // Create some test data
      await crmService.addCustomerNote({
        customerId,
        note: 'Test note',
        category: 'general'
      });
      await crmService.logActivity({
        customerId,
        type: 'note',
        subject: 'Test activity'
      });

      const exportData = await crmService.exportCustomerData(customerId);

      expect(exportData).toBeDefined();
      expect(exportData.documents).toBeDefined();
      expect(exportData.activities).toBeDefined();
      expect(exportData.notes).toBeDefined();
      expect(exportData.relationships).toBeDefined();
      expect(exportData.communications).toBeDefined();
    });
  });

  describe('Data Persistence', () => {
    it('should persist data to localStorage', async () => {
      await crmService.addCustomerNote({
        customerId: 'CUST-001',
        note: 'Persistent note',
        category: 'general'
      });

      const savedData = localStorage.getItem('crmServiceData');
      expect(savedData).toBeDefined();
      
      const parsedData = JSON.parse(savedData!);
      expect(parsedData.notes).toHaveLength(1);
      expect(parsedData.notes[0].note).toBe('Persistent note');
    });

    it('should persist and retrieve data across service operations', async () => {
      // Save some data using the service
      await crmService.logActivity({
        customerId: 'CUST-001',
        type: 'note',
        subject: 'Test activity'
      });
      
      await crmService.addCustomerNote({
        customerId: 'CUST-001',
        note: 'Test note',
        category: 'general'
      });
      
      // Verify data is saved to localStorage
      const savedData = localStorage.getItem('crmServiceData');
      expect(savedData).toBeDefined();
      
      const parsedData = JSON.parse(savedData!);
      expect(parsedData.activities).toHaveLength(1);
      expect(parsedData.notes).toHaveLength(1);
      
      // Verify data can be retrieved
      const activities = await crmService.getCustomerActivities('CUST-001');
      const notes = await crmService.getCustomerNotes('CUST-001');
      
      expect(activities).toHaveLength(1);
      expect(activities[0].subject).toBe('Test activity');
      expect(notes).toHaveLength(1);
      expect(notes[0].note).toBe('Test note');
    });
  });

  describe('Cleanup and Maintenance Operations', () => {
    it('should archive old documents', async () => {
      const customerId = 'CUST-001';
      
      // Create an old document (manually set old date)
      const association = await crmService.associateDocumentToCustomer(
        'DOC-OLD',
        customerId,
        { documentName: 'Old Document.pdf' }
      );
      
      // Manually set old upload date
      association.uploadDate = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000); // 400 days ago
      
      const archivedCount = await crmService.archiveOldDocuments(365);
      
      expect(archivedCount).toBeGreaterThan(0);
      
      const associations = await crmService.getDocumentAssociations(customerId);
      const oldDoc = associations.find(a => a.documentId === 'DOC-OLD');
      expect(oldDoc?.status).toBe('archived');
    });

    it('should cleanup expired documents', async () => {
      const customerId = 'CUST-001';
      
      // Create document with expiry date
      await crmService.associateDocumentToCustomer('DOC-EXP', customerId, {
        documentName: 'Expiring Document.pdf'
      });
      
      // Manually add to customer documents with past expiry
      const customerDocs = (crmService as any).customerDocuments.get(customerId) || [];
      customerDocs.push({
        documentId: 'DOC-EXP-2',
        customerId,
        transactionIds: [],
        category: 'identity',
        uploadedBy: 'test',
        uploadedAt: new Date(),
        verificationStatus: 'verified',
        expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        metadata: {}
      });
      (crmService as any).customerDocuments.set(customerId, customerDocs);
      
      const cleanedCount = await crmService.cleanupExpiredDocuments();
      
      expect(cleanedCount).toBeGreaterThan(0);
      
      const docs = await crmService.getCustomerDocuments(customerId);
      const expiredDoc = docs.find(d => d.documentId === 'DOC-EXP-2');
      expect(expiredDoc?.verificationStatus).toBe('expired');
    });
  });
});

describe('CRMService Error Handling', () => {
  it('should handle document upload failures gracefully', async () => {
    // Mock FileLock failure
    vi.mocked(FilelockIntegrationService.addToShieldVault).mockRejectedValueOnce(
      new Error('Upload failed')
    );

    const mockFile = new File(['test'], 'test.pdf');
    
    await expect(
      crmService.uploadDocumentWithFileLock(mockFile, 'CUST-001')
    ).rejects.toThrow('Upload failed');
  });

  it('should return empty arrays for non-existent customers', async () => {
    const documents = await crmService.getCustomerDocuments('NON-EXISTENT');
    const activities = await crmService.getCustomerActivities('NON-EXISTENT');
    const notes = await crmService.getCustomerNotes('NON-EXISTENT');
    
    expect(documents).toEqual([]);
    expect(activities).toEqual([]);
    expect(notes).toEqual([]);
  });
});