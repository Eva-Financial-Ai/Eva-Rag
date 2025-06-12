import { Transaction } from '../contexts/WorkflowContext';
import { mockTransactions as initialMockTransactions } from './mockData';

// In-memory store for demo transactions
let mockTransactions: Transaction[] = [...initialMockTransactions];

// Get all transactions
export const getTransactions = async (): Promise<Transaction[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockTransactions;
};

// Get a single transaction by ID
export const getTransaction = async (id: string): Promise<Transaction | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  const transaction = mockTransactions.find(t => t.id === id);
  return transaction || null;
};

// Create a new transaction
export const createTransaction = async (
  transactionData: Omit<Transaction, 'id'>
): Promise<Transaction> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));

  // Generate a new ID
  const newTransaction: Transaction = {
    ...transactionData,
    id: `tx-${Date.now()}`,
    createdAt: transactionData.createdAt || new Date().toISOString(),
    // Make sure required fields are present
    data: transactionData.data || {},
    stage: transactionData.stage || 'application',
    status: transactionData.status || 'pending',
  };

  mockTransactions.push(newTransaction);
  return newTransaction;
};

// Update an existing transaction
export const updateTransaction = async (transaction: Transaction): Promise<Transaction> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));

  const index = mockTransactions.findIndex(t => t.id === transaction.id);
  if (index === -1) {
    throw new Error(`Transaction with ID ${transaction.id} not found`);
  }

  mockTransactions[index] = transaction;
  return transaction;
};

// Update a transaction's stage
export const updateTransactionStage = async (
  transactionId: string,
  stage: string
): Promise<Transaction> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 350));

  const transaction = mockTransactions.find(t => t.id === transactionId);
  if (!transaction) {
    throw new Error(`Transaction with ID ${transactionId} not found`);
  }

  const updatedTransaction = {
    ...transaction,
    stage: stage as any,
    currentStage: stage as any,
  };

  const index = mockTransactions.findIndex(t => t.id === transactionId);
  mockTransactions[index] = updatedTransaction;

  return updatedTransaction;
};

// Delete a transaction
export const deleteTransaction = async (id: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 550));

  mockTransactions = mockTransactions.filter(t => t.id !== id);
};
