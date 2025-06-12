/**
 * Mock Enhanced Transaction Service
 * Replace with actual external API integration
 */

export interface TransactionProgress {
  id: string;
  status: 'pending' | 'processing' | 'approved' | 'completed' | 'rejected';
  steps: {
    name: string;
    completed: boolean;
    timestamp?: string;
  }[];
  completion_percentage: number;
  // Add alias for backward compatibility
  stages?: {
    id: string;
    name: string;
    completed: boolean;
    timestamp?: string;
  }[];
}

export interface TransactionDocument {
  id: string;
  transaction_id: string;
  name: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected' | 'submitted';
  upload_date: string;
  file_url?: string;
}

export interface EnhancedTransaction {
  id: string;
  title: string;
  type: string;
  amount: number;
  status: 'pending' | 'processing' | 'approved' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
  customer_id?: string;
  description?: string;
  // Add missing properties that are used in the dashboard
  completionPercentage?: number;
  priority?: 'low' | 'medium' | 'high';
  // Add aliases for backward compatibility
  createdAt?: string;
  updatedAt?: string;
}

class EnhancedTransactionService {
  async getTransactions(): Promise<{ status: number; success: boolean; data: EnhancedTransaction[] }> {
    // Mock implementation - replace with actual external API call
    return {
      status: 200,
      success: true,
      data: [
        {
          id: '1',
          title: 'Equipment Financing Application',
          type: 'equipment_loan',
          amount: 250000,
          status: 'processing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          customer_id: 'customer-1',
          description: 'Manufacturing equipment purchase',
          completionPercentage: 65,
          priority: 'high',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2', 
          title: 'Working Capital Line of Credit',
          type: 'line_of_credit',
          amount: 100000,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          customer_id: 'customer-1',
          description: 'Seasonal working capital needs',
          completionPercentage: 25,
          priority: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };
  }

  async getTransactionProgress(transactionId: string): Promise<{ status: number; success: boolean; data: TransactionProgress }> {
    // Mock implementation - replace with actual external API call
    return {
      status: 200,
      success: true,
      data: {
        id: transactionId,
        status: 'processing',
        steps: [
          { name: 'Application Submitted', completed: true, timestamp: new Date().toISOString() },
          { name: 'Initial Review', completed: true, timestamp: new Date().toISOString() },
          { name: 'Credit Check', completed: false },
          { name: 'Final Approval', completed: false }
        ],
        completion_percentage: 50,
        // Add stages alias for backward compatibility
        stages: [
          { id: '1', name: 'Application Submitted', completed: true, timestamp: new Date().toISOString() },
          { id: '2', name: 'Initial Review', completed: true, timestamp: new Date().toISOString() },
          { id: '3', name: 'Credit Check', completed: false },
          { id: '4', name: 'Final Approval', completed: false }
        ]
      }
    };
  }

  async getTransactionDocuments(transactionId: string): Promise<{ status: number; success: boolean; data: TransactionDocument[] }> {
    // Mock implementation - replace with actual external API call
    return {
      status: 200,
      success: true,
      data: [
        {
          id: 'doc-1',
          transaction_id: transactionId,
          name: 'Financial Statement',
          type: 'financial_document',
          status: 'approved',
          upload_date: new Date().toISOString(),
          file_url: '/mock/financial-statement.pdf'
        },
        {
          id: 'doc-2',
          transaction_id: transactionId,
          name: 'Tax Returns',
          type: 'tax_document',
          status: 'submitted',
          upload_date: new Date().toISOString()
        }
      ]
    };
  }

  async submitTransaction(transactionId: string): Promise<{ status: number; success: boolean; message: string }> {
    // Mock implementation - replace with actual external API call
    return {
      status: 200,
      success: true,
      message: `Transaction ${transactionId} submitted successfully`
    };
  }

  async approveTransaction(transactionId: string): Promise<{ status: number; success: boolean; message: string }> {
    // Mock implementation - replace with actual external API call
    return {
      status: 200,
      success: true,
      message: `Transaction ${transactionId} approved successfully`
    };
  }

  async completeTransaction(transactionId: string): Promise<{ status: number; success: boolean; message: string }> {
    // Mock implementation - replace with actual external API call
    return {
      status: 200,
      success: true,
      message: `Transaction ${transactionId} completed successfully`
    };
  }
}

const enhancedTransactionService = new EnhancedTransactionService();

export default enhancedTransactionService;
export { EnhancedTransactionService }; 