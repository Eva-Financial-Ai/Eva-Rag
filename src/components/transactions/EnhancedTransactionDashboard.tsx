import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import enhancedTransactionService from '../../api/services/enhancedTransactionService';
import {
  EnhancedTransaction,
  TransactionProgress,
  TransactionDocument,
} from '../../api/services/enhancedTransactionService';

// Use TransactionDocument directly instead of separate DocumentStatus
type DocumentStatus = TransactionDocument;

const EnhancedTransactionDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<EnhancedTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<EnhancedTransaction | null>(null);
  const [progress, setProgress] = useState<TransactionProgress | null>(null);
  const [documents, setDocuments] = useState<DocumentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    if (selectedTransaction) {
      loadTransactionDetails(selectedTransaction.id);
    }
  }, [selectedTransaction]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await enhancedTransactionService.getTransactions();

      if (response.success && response.data) {
        setTransactions(response.data);
        if (response.data.length > 0 && !selectedTransaction) {
          setSelectedTransaction(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionDetails = async (transactionId: string | number) => {
    try {
      // Load transaction progress
      const progressResponse = await enhancedTransactionService.getTransactionProgress(
        String(transactionId)
      );
      if (progressResponse.success && progressResponse.data) {
        setProgress(progressResponse.data);
      }

      // Load transaction documents
      const documentsResponse = await enhancedTransactionService.getTransactionDocuments(
        String(transactionId)
      );
      if (documentsResponse.success && documentsResponse.data) {
        setDocuments(documentsResponse.data);
      }
    } catch (error) {
      console.error('Error loading transaction details:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadTransactions();
    if (selectedTransaction) {
      await loadTransactionDetails(selectedTransaction.id);
    }
    setRefreshing(false);
  };

  const updateTransactionStatus = async (
    transactionId: string | number,
    action: 'submit' | 'approve' | 'complete'
  ) => {
    try {
      let response;
      switch (action) {
        case 'submit':
          response = await enhancedTransactionService.submitTransaction(String(transactionId));
          break;
        case 'approve':
          response = await enhancedTransactionService.approveTransaction(String(transactionId));
          break;
        case 'complete':
          response = await enhancedTransactionService.completeTransaction(String(transactionId));
          break;
      }

      if (response?.success) {
        // Refresh the transactions list and details
        await refreshData();
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      // Keep backward compatibility
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Dashboard</h1>
          <p className="text-gray-600">Real-time transaction tracking and management</p>
        </div>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-lg font-semibold text-gray-900">{transactions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-lg font-semibold text-gray-900">
                {transactions.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-lg font-semibold text-gray-900">
                {transactions.filter(t => t.status === 'processing').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-lg font-semibold text-gray-900">
                ${transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Transactions</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {transactions.map(transaction => (
                <div
                  key={transaction.id}
                  onClick={() => setSelectedTransaction(transaction)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedTransaction?.id === transaction.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {typeof transaction.id === 'string'
                        ? transaction.id
                        : `TXN-${transaction.id}`}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />${transaction.amount.toLocaleString()}
                    </div>
                    <div className="flex items-center mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {transaction.completionPercentage !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{transaction.completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(transaction.completionPercentage)}`}
                          style={{ width: `${transaction.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTransaction ? (
            <>
              {/* Transaction Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Transaction Details</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTransaction.status)}`}
                  >
                    {selectedTransaction.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ID:</span>
                    <span className="ml-2 font-mono">{selectedTransaction.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2">{selectedTransaction.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <span className="ml-2 font-semibold">
                      ${selectedTransaction.amount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <span className="ml-2">{selectedTransaction.priority}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-2">
                      {new Date(selectedTransaction.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Updated:</span>
                    <span className="ml-2">
                      {new Date(selectedTransaction.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {selectedTransaction.description && (
                  <div className="mt-4">
                    <span className="text-gray-600 block">Description:</span>
                    <p className="mt-1 text-gray-900">{selectedTransaction.description}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex space-x-3">
                  {selectedTransaction.status === 'pending' && (
                    <button
                      onClick={() => updateTransactionStatus(selectedTransaction.id, 'submit')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Submit for Review
                    </button>
                  )}
                  {selectedTransaction.status === 'processing' && (
                    <button
                      onClick={() => updateTransactionStatus(selectedTransaction.id, 'approve')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Approve
                    </button>
                  )}
                  {selectedTransaction.status === 'approved' && (
                    <button
                      onClick={() => updateTransactionStatus(selectedTransaction.id, 'complete')}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Tracking */}
              {progress && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Progress Tracking</h3>
                  <div className="space-y-4">
                    {(progress.stages || progress.steps).map((stage, index) => {
                      // Type-safe access to stage properties
                      const isCompleted = 'completed' in stage ? stage.completed : (stage as any).status === 'completed';
                      const stageStatus = 'status' in stage ? (stage as any).status : (stage.completed ? 'completed' : 'pending');
                      const stageId = 'id' in stage ? (stage as any).id : index;
                      const timestamp = 'timestamp' in stage ? stage.timestamp : (stage as any).completedAt;
                      
                      return (
                        <div key={stageId} className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : stageStatus === 'in_progress'
                                  ? 'bg-blue-500 text-white'
                                  : stageStatus === 'failed'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : stageStatus === 'failed' ? (
                              <AlertCircle className="w-5 h-5" />
                            ) : (
                              <span className="text-xs">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{stage.name}</span>
                              {timestamp && (
                                <span className="text-xs text-gray-500">
                                  {new Date(timestamp).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-sm ${
                                isCompleted
                                  ? 'text-green-600'
                                  : stageStatus === 'in_progress'
                                    ? 'text-blue-600'
                                    : stageStatus === 'failed'
                                      ? 'text-red-600'
                                      : 'text-gray-500'
                              }`}
                            >
                              {stageStatus}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">
                  <FileText className="w-5 h-5 inline mr-2" />
                  Documents
                </h3>
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{doc.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({doc.type})</span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          doc.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : doc.status === 'submitted'
                              ? 'bg-blue-100 text-blue-800'
                              : doc.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">Select a transaction to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedTransactionDashboard;
