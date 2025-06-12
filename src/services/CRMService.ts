import { CustomerProfile } from '../contexts/CustomerContext';
import { FilelockIntegrationService } from './FilelockIntegrationService';
import { apiClient } from '../api/apiClient';

export interface DocumentAssociation {
  id: string;
  documentId: string;
  documentName: string;
  documentType: string;
  associationType: 'customer' | 'transaction' | 'both';
  associatedId: string; // customerId or transactionId
  uploadDate: Date;
  lastModified: Date;
  fileSize: number;
  mimeType: string;
  status: 'active' | 'archived' | 'deleted';
  tags: string[];
  shieldVaultId?: string;
  blockchainHash?: string;
  accessHistory: AccessRecord[];
}

export interface AccessRecord {
  userId: string;
  userName: string;
  accessType: 'view' | 'download' | 'edit' | 'share';
  timestamp: Date;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface CustomerDocument {
  documentId: string;
  customerId: string;
  transactionIds: string[]; // Documents can be associated with multiple transactions
  category: 'identity' | 'financial' | 'legal' | 'business' | 'collateral' | 'other';
  subcategory?: string;
  uploadedBy: string;
  uploadedAt: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'expired';
  verifiedBy?: string;
  verifiedAt?: Date;
  expiryDate?: Date;
  metadata: Record<string, any>;
}

export interface TransactionDocument {
  documentId: string;
  transactionId: string;
  customerId: string;
  documentType: string;
  purpose: 'application' | 'verification' | 'approval' | 'closing' | 'post-closing';
  required: boolean;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  dueDate?: Date;
  submittedDate?: Date;
  reviewedDate?: Date;
  reviewedBy?: string;
  comments?: string[];
}

export interface CRMActivity {
  id: string;
  customerId: string;
  transactionId?: string;
  type: 'note' | 'call' | 'email' | 'meeting' | 'document' | 'task' | 'status_change';
  subject: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  attachments?: DocumentAssociation[];
}

export interface CRMDashboardData {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  totalTransactions: number;
  activeTransactions: number;
  completedTransactions: number;
  totalDocuments: number;
  pendingDocuments: number;
  recentActivities: CRMActivity[];
  upcomingTasks: CRMActivity[];
  customersByType: Record<string, number>;
  transactionsByStatus: Record<string, number>;
  documentsByCategory: Record<string, number>;
}

export interface CustomerRelationship {
  customerId: string;
  relatedCustomerId: string;
  relationshipType: 'spouse' | 'partner' | 'guarantor' | 'co-applicant' | 'referral' | 'business_partner';
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'inactive';
  metadata?: Record<string, any>;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  transactionId?: string;
  note: string;
  category: 'general' | 'credit' | 'collection' | 'service' | 'compliance';
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  isPrivate: boolean;
  attachments?: string[];
}

export interface CustomerCommunication {
  id: string;
  customerId: string;
  transactionId?: string;
  type: 'email' | 'phone' | 'sms' | 'chat' | 'letter';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  from: string;
  to: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: Record<string, any>;
}

class CRMService {
  private static instance: CRMService;
  private documentAssociations: Map<string, DocumentAssociation[]> = new Map();
  private customerDocuments: Map<string, CustomerDocument[]> = new Map();
  private transactionDocuments: Map<string, TransactionDocument[]> = new Map();
  private activities: CRMActivity[] = [];
  private relationships: CustomerRelationship[] = [];
  private notes: CustomerNote[] = [];
  private communications: CustomerCommunication[] = [];

  private constructor() {
    this.loadFromLocalStorage();
  }

  static getInstance(): CRMService {
    if (!CRMService.instance) {
      CRMService.instance = new CRMService();
    }
    return CRMService.instance;
  }

  private loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem('crmServiceData');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.documentAssociations = new Map(data.documentAssociations || []);
        this.customerDocuments = new Map(data.customerDocuments || []);
        this.transactionDocuments = new Map(data.transactionDocuments || []);
        this.activities = data.activities || [];
        this.relationships = data.relationships || [];
        this.notes = data.notes || [];
        this.communications = data.communications || [];
      }
    } catch (error) {
      console.error('Error loading CRM data from localStorage:', error);
    }
  }

  private saveToLocalStorage() {
    try {
      const data = {
        documentAssociations: Array.from(this.documentAssociations.entries()),
        customerDocuments: Array.from(this.customerDocuments.entries()),
        transactionDocuments: Array.from(this.transactionDocuments.entries()),
        activities: this.activities,
        relationships: this.relationships,
        notes: this.notes,
        communications: this.communications
      };
      localStorage.setItem('crmServiceData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving CRM data to localStorage:', error);
    }
  }

  // Document Association Methods
  async associateDocumentToCustomer(
    documentId: string,
    customerId: string,
    documentInfo: Partial<DocumentAssociation>
  ): Promise<DocumentAssociation> {
    const association: DocumentAssociation = {
      id: `assoc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      documentId,
      documentName: documentInfo.documentName || 'Untitled Document',
      documentType: documentInfo.documentType || 'general',
      associationType: 'customer',
      associatedId: customerId,
      uploadDate: new Date(),
      lastModified: new Date(),
      fileSize: documentInfo.fileSize || 0,
      mimeType: documentInfo.mimeType || 'application/octet-stream',
      status: 'active',
      tags: documentInfo.tags || [],
      shieldVaultId: documentInfo.shieldVaultId,
      blockchainHash: documentInfo.blockchainHash,
      accessHistory: []
    };

    const customerAssociations = this.documentAssociations.get(customerId) || [];
    customerAssociations.push(association);
    this.documentAssociations.set(customerId, customerAssociations);

    // Create customer document record
    const customerDoc: CustomerDocument = {
      documentId,
      customerId,
      transactionIds: [],
      category: this.categorizeDocument(documentInfo.documentType || ''),
      uploadedBy: 'current-user', // Should come from auth context
      uploadedAt: new Date(),
      verificationStatus: 'pending',
      metadata: documentInfo
    };

    const customerDocs = this.customerDocuments.get(customerId) || [];
    customerDocs.push(customerDoc);
    this.customerDocuments.set(customerId, customerDocs);

    // Log activity
    await this.logActivity({
      customerId,
      type: 'document',
      subject: `Document uploaded: ${documentInfo.documentName}`,
      description: `Uploaded ${documentInfo.documentType} document`,
      priority: 'medium'
    });

    this.saveToLocalStorage();
    return association;
  }

  async associateDocumentToTransaction(
    documentId: string,
    transactionId: string,
    customerId: string,
    documentInfo: Partial<TransactionDocument>
  ): Promise<TransactionDocument> {
    const transactionDoc: TransactionDocument = {
      documentId,
      transactionId,
      customerId,
      documentType: documentInfo.documentType || 'general',
      purpose: documentInfo.purpose || 'application',
      required: documentInfo.required || false,
      status: 'submitted',
      submittedDate: new Date(),
      ...documentInfo
    };

    const transactionDocs = this.transactionDocuments.get(transactionId) || [];
    transactionDocs.push(transactionDoc);
    this.transactionDocuments.set(transactionId, transactionDocs);

    // Also associate with customer
    const customerDoc = this.customerDocuments.get(customerId)?.find(doc => doc.documentId === documentId);
    if (customerDoc && !customerDoc.transactionIds.includes(transactionId)) {
      customerDoc.transactionIds.push(transactionId);
    }

    // Log activity
    await this.logActivity({
      customerId,
      transactionId,
      type: 'document',
      subject: `Document submitted for transaction: ${transactionDoc.documentType}`,
      priority: 'high'
    });

    this.saveToLocalStorage();
    return transactionDoc;
  }

  async getCustomerDocuments(customerId: string): Promise<CustomerDocument[]> {
    return this.customerDocuments.get(customerId) || [];
  }

  async getTransactionDocuments(transactionId: string): Promise<TransactionDocument[]> {
    return this.transactionDocuments.get(transactionId) || [];
  }

  async getDocumentAssociations(entityId: string): Promise<DocumentAssociation[]> {
    return this.documentAssociations.get(entityId) || [];
  }

  // Activity Management
  async logActivity(activity: Partial<CRMActivity>): Promise<CRMActivity> {
    const newActivity: CRMActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      customerId: activity.customerId!,
      transactionId: activity.transactionId,
      type: activity.type || 'note',
      subject: activity.subject || '',
      description: activity.description,
      createdBy: 'current-user', // Should come from auth context
      createdAt: new Date(),
      priority: activity.priority || 'medium',
      tags: activity.tags || [],
      attachments: activity.attachments,
      ...activity
    };

    this.activities.push(newActivity);
    this.saveToLocalStorage();
    return newActivity;
  }

  async getCustomerActivities(customerId: string): Promise<CRMActivity[]> {
    return this.activities.filter(activity => activity.customerId === customerId);
  }

  async getTransactionActivities(transactionId: string): Promise<CRMActivity[]> {
    return this.activities.filter(activity => activity.transactionId === transactionId);
  }

  // Relationship Management
  async addCustomerRelationship(relationship: Partial<CustomerRelationship>): Promise<CustomerRelationship> {
    const newRelationship: CustomerRelationship = {
      customerId: relationship.customerId!,
      relatedCustomerId: relationship.relatedCustomerId!,
      relationshipType: relationship.relationshipType!,
      startDate: new Date(),
      status: 'active',
      ...relationship
    };

    this.relationships.push(newRelationship);
    this.saveToLocalStorage();
    return newRelationship;
  }

  async getCustomerRelationships(customerId: string): Promise<CustomerRelationship[]> {
    return this.relationships.filter(
      rel => rel.customerId === customerId || rel.relatedCustomerId === customerId
    );
  }

  // Notes Management
  async addCustomerNote(note: Partial<CustomerNote>): Promise<CustomerNote> {
    const newNote: CustomerNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      customerId: note.customerId!,
      transactionId: note.transactionId,
      note: note.note || '',
      category: note.category || 'general',
      createdBy: 'current-user', // Should come from auth context
      createdAt: new Date(),
      isPrivate: note.isPrivate || false,
      attachments: note.attachments || [],
      ...note
    };

    this.notes.push(newNote);
    
    // Log as activity
    await this.logActivity({
      customerId: newNote.customerId,
      transactionId: newNote.transactionId,
      type: 'note',
      subject: `Note added: ${newNote.category}`,
      description: newNote.note,
      priority: 'low'
    });

    this.saveToLocalStorage();
    return newNote;
  }

  async getCustomerNotes(customerId: string): Promise<CustomerNote[]> {
    return this.notes.filter(note => note.customerId === customerId);
  }

  // Communication Tracking
  async logCommunication(communication: Partial<CustomerCommunication>): Promise<CustomerCommunication> {
    const newComm: CustomerCommunication = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      customerId: communication.customerId!,
      transactionId: communication.transactionId,
      type: communication.type!,
      direction: communication.direction!,
      subject: communication.subject,
      content: communication.content || '',
      from: communication.from || 'system',
      to: communication.to || '',
      timestamp: new Date(),
      status: 'sent',
      metadata: communication.metadata,
      ...communication
    };

    this.communications.push(newComm);
    
    // Log as activity
    await this.logActivity({
      customerId: newComm.customerId,
      transactionId: newComm.transactionId,
      type: newComm.type as any,
      subject: `${newComm.direction} ${newComm.type}: ${newComm.subject || 'No subject'}`,
      priority: 'medium'
    });

    this.saveToLocalStorage();
    return newComm;
  }

  async getCustomerCommunications(customerId: string): Promise<CustomerCommunication[]> {
    return this.communications.filter(comm => comm.customerId === customerId);
  }

  // Dashboard Data
  async getDashboardData(): Promise<CRMDashboardData> {
    // This would normally aggregate from a database
    const mockData: CRMDashboardData = {
      totalCustomers: 150,
      activeCustomers: 120,
      newCustomersThisMonth: 15,
      totalTransactions: 450,
      activeTransactions: 35,
      completedTransactions: 415,
      totalDocuments: 1250,
      pendingDocuments: 45,
      recentActivities: this.activities.slice(-10).reverse(),
      upcomingTasks: this.activities
        .filter(act => act.type === 'task' && act.dueDate && !act.completedAt)
        .sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0))
        .slice(0, 10),
      customersByType: {
        individual: 80,
        business: 40,
        broker: 20,
        'asset-seller': 10
      },
      transactionsByStatus: {
        pending: 15,
        'in-review': 10,
        approved: 8,
        active: 2,
        completed: 415
      },
      documentsByCategory: {
        identity: 250,
        financial: 450,
        legal: 300,
        business: 150,
        collateral: 100
      }
    };

    return mockData;
  }

  // Search functionality
  async searchDocuments(query: string, filters?: {
    customerId?: string;
    transactionId?: string;
    documentType?: string;
    dateRange?: { start: Date; end: Date };
  }): Promise<(CustomerDocument | TransactionDocument)[]> {
    let results: (CustomerDocument | TransactionDocument)[] = [];

    // Search customer documents
    for (const [customerId, docs] of this.customerDocuments.entries()) {
      if (filters?.customerId && customerId !== filters.customerId) continue;
      
      results.push(...docs.filter(doc => {
        if (filters?.documentType && doc.category !== filters.documentType) return false;
        if (filters?.dateRange) {
          const uploadDate = new Date(doc.uploadedAt);
          if (uploadDate < filters.dateRange.start || uploadDate > filters.dateRange.end) return false;
        }
        // Simple text search in metadata
        if (query && !JSON.stringify(doc).toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }));
    }

    // Search transaction documents
    for (const [transactionId, docs] of this.transactionDocuments.entries()) {
      if (filters?.transactionId && transactionId !== filters.transactionId) continue;
      
      results.push(...docs.filter(doc => {
        if (filters?.customerId && doc.customerId !== filters.customerId) return false;
        if (filters?.documentType && doc.documentType !== filters.documentType) return false;
        if (filters?.dateRange && doc.submittedDate) {
          const submitDate = new Date(doc.submittedDate);
          if (submitDate < filters.dateRange.start || submitDate > filters.dateRange.end) return false;
        }
        // Simple text search
        if (query && !JSON.stringify(doc).toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }));
    }

    return results;
  }

  // Utility methods
  private categorizeDocument(documentType: string): CustomerDocument['category'] {
    const typeMap: Record<string, CustomerDocument['category']> = {
      'drivers-license': 'identity',
      'passport': 'identity',
      'ssn': 'identity',
      'tax-return': 'financial',
      'bank-statement': 'financial',
      'income-verification': 'financial',
      'articles-incorporation': 'legal',
      'operating-agreement': 'legal',
      'business-license': 'business',
      'property-deed': 'collateral',
      'vehicle-title': 'collateral'
    };

    return typeMap[documentType.toLowerCase()] || 'other';
  }

  // FileLock Integration
  async uploadDocumentWithFileLock(
    file: File,
    customerId: string,
    transactionId?: string,
    options?: {
      documentType?: string;
      purpose?: 'application' | 'verification' | 'approval' | 'closing' | 'post-closing';
      required?: boolean;
    }
  ): Promise<{
    documentAssociation: DocumentAssociation;
    transactionDocument?: TransactionDocument;
    shieldVaultResult?: any;
  }> {
    try {
      // Upload to Shield Vault via FileLock integration
      const vaultResult = await FilelockIntegrationService.addToShieldVault(file, {
        documentType: options?.documentType || 'general',
        customerId,
        transactionId,
        encryptionLevel: 'high',
        accessLevel: 'private',
        tags: ['crm-upload', `customer-${customerId}`],
        source: 'filelock'
      });

      if (!vaultResult.success) {
        throw new Error(vaultResult.message);
      }

      // Create document association
      const association = await this.associateDocumentToCustomer(
        vaultResult.vaultFileId!,
        customerId,
        {
          documentName: file.name,
          documentType: options?.documentType || 'general',
          fileSize: file.size,
          mimeType: file.type,
          shieldVaultId: vaultResult.vaultFileId,
          blockchainHash: vaultResult.transactionHash,
          tags: ['uploaded-via-crm']
        }
      );

      let transactionDoc;
      if (transactionId) {
        transactionDoc = await this.associateDocumentToTransaction(
          vaultResult.vaultFileId!,
          transactionId,
          customerId,
          {
            documentType: options?.documentType || 'general',
            purpose: options?.purpose || 'application',
            required: options?.required || false
          }
        );
      }

      return {
        documentAssociation: association,
        transactionDocument: transactionDoc,
        shieldVaultResult: vaultResult
      };
    } catch (error) {
      console.error('Error uploading document with FileLock:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkAssociateDocuments(
    documentIds: string[],
    customerId: string,
    transactionId?: string
  ): Promise<DocumentAssociation[]> {
    const associations: DocumentAssociation[] = [];
    
    for (const documentId of documentIds) {
      const association = await this.associateDocumentToCustomer(documentId, customerId, {
        documentName: `Document ${documentId}`,
        documentType: 'general'
      });
      associations.push(association);
      
      if (transactionId) {
        await this.associateDocumentToTransaction(
          documentId,
          transactionId,
          customerId,
          {
            documentType: 'general',
            purpose: 'application'
          }
        );
      }
    }
    
    return associations;
  }

  // Export functionality
  async exportCustomerData(customerId: string): Promise<{
    profile: CustomerProfile | null;
    documents: CustomerDocument[];
    activities: CRMActivity[];
    relationships: CustomerRelationship[];
    notes: CustomerNote[];
    communications: CustomerCommunication[];
  }> {
    // This would fetch the customer profile from CustomerContext
    const profile = null; // Should be fetched from CustomerContext
    
    return {
      profile,
      documents: await this.getCustomerDocuments(customerId),
      activities: await this.getCustomerActivities(customerId),
      relationships: await this.getCustomerRelationships(customerId),
      notes: await this.getCustomerNotes(customerId),
      communications: await this.getCustomerCommunications(customerId)
    };
  }

  // Cleanup and maintenance
  async archiveOldDocuments(daysOld: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    let archivedCount = 0;
    
    for (const [entityId, associations] of this.documentAssociations.entries()) {
      associations.forEach(assoc => {
        if (assoc.uploadDate < cutoffDate && assoc.status === 'active') {
          assoc.status = 'archived';
          archivedCount++;
        }
      });
    }
    
    this.saveToLocalStorage();
    return archivedCount;
  }

  async cleanupExpiredDocuments(): Promise<number> {
    let cleanedCount = 0;
    const now = new Date();
    
    for (const [customerId, docs] of this.customerDocuments.entries()) {
      const activeDocs = docs.filter(doc => {
        if (doc.expiryDate && new Date(doc.expiryDate) < now) {
          doc.verificationStatus = 'expired';
          cleanedCount++;
          return true;
        }
        return true;
      });
      this.customerDocuments.set(customerId, activeDocs);
    }
    
    this.saveToLocalStorage();
    return cleanedCount;
  }
}

export const crmService = CRMService.getInstance();
export default crmService;