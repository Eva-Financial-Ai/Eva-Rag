import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../hooks/useTransactionStore';
import { useUserPermissions } from '../hooks/useUserPermissions';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  DocumentIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface TransactionFilters {
  status: string;
  type: string;
  stage: string;
  dateRange: string;
  amountRange: string;
}

const TransactionExplorer: React.FC = () => {
  const navigate = useNavigate();
  const { currentRole, hasPermission } = useUserPermissions();
  const { transactions, loading, error, fetchTransactions, setCurrentTransaction } = useTransactionStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({
    status: 'all',
    type: 'all',
    stage: 'all',
    dateRange: 'all',
    amountRange: 'all'
  });
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status' | 'stage'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = 
        transaction.applicantData?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filters.status === 'all' || 
        transaction.data?.status === filters.status;

      const matchesType = filters.type === 'all' || 
        transaction.type === filters.type;

      const matchesStage = filters.stage === 'all' || 
        transaction.currentStage === filters.stage;

      return matchesSearch && matchesStatus && matchesType && matchesStage;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.data?.status || '';
          bValue = b.data?.status || '';
          break;
        case 'stage':
          aValue = a.currentStage;
          bValue = b.currentStage;
          break;
        default:
          aValue = new Date(a.data?.submittedAt || a.createdAt || '').getTime();
          bValue = new Date(b.data?.submittedAt || b.createdAt || '').getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <ClockIcon className="w-5 h-5 text-blue-600" />;
      case 'under_review':
        return <ChartBarIcon className="w-5 h-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'document_collection':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'risk_assessment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'deal_structuring':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'approval_decision':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'document_execution':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'post_closing':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const handleViewTransaction = (transaction: any) => {
    setCurrentTransaction(transaction);
    setSelectedTransaction(transaction);
  };

  const handleEditTransaction = (transaction: any) => {
    navigate(`/credit-application?edit=${transaction.id}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-blue-600">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction Explorer</h1>
        <p className="text-gray-600">
          View and manage individual credit applications and their progress through the workflow
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <DocumentIcon className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {transactions.filter(t => t.data?.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Under Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {transactions.filter(t => t.data?.status === 'under_review').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
            </button>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="status-asc">Status A-Z</option>
              <option value="stage-asc">Stage A-Z</option>
            </select>

            <button
              onClick={fetchTransactions}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="credit_application">Credit Application</option>
                  <option value="equipment_finance">Equipment Finance</option>
                  <option value="real_estate">Real Estate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
                <select
                  value={filters.stage}
                  onChange={(e) => setFilters({...filters, stage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Stages</option>
                  <option value="document_collection">Document Collection</option>
                  <option value="risk_assessment">Risk Assessment</option>
                  <option value="deal_structuring">Deal Structuring</option>
                  <option value="approval_decision">Approval Decision</option>
                  <option value="document_execution">Document Execution</option>
                  <option value="post_closing">Post Closing</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    status: 'all',
                    type: 'all',
                    stage: 'all',
                    dateRange: 'all',
                    amountRange: 'all'
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-500">
              {searchTerm || Object.values(filters).some(f => f !== 'all') 
                ? 'Try adjusting your search or filters'
                : 'No credit applications have been submitted yet'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                          <div className="text-sm text-gray-500 capitalize">
                            {transaction.type.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.applicantData?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.applicantData?.entityType || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(transaction.data?.status)}
                        <span className="ml-2 text-sm font-medium capitalize">
                          {transaction.data?.status?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md border ${getStageColor(transaction.currentStage)}`}>
                        {transaction.currentStage?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.data?.submittedAt || transaction.createdAt || '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewTransaction(transaction)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        {hasPermission('transaction', 'edit') && (
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit Application"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Application Details: {selectedTransaction.id}
                </h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Application Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Applicant Name</label>
                      <p className="text-sm text-gray-900">{selectedTransaction.applicantData?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Entity Type</label>
                      <p className="text-sm text-gray-900">{selectedTransaction.applicantData?.entityType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Industry Code</label>
                      <p className="text-sm text-gray-900">{selectedTransaction.applicantData?.industryCode}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Request Amount</label>
                      <p className="text-sm text-gray-900">{formatCurrency(selectedTransaction.amount)}</p>
                    </div>
                  </div>
                </div>

                {/* Status & Progress */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Status & Progress</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Current Status</label>
                      <div className="flex items-center mt-1">
                        {getStatusIcon(selectedTransaction.data?.status)}
                        <span className="ml-2 text-sm font-medium capitalize">
                          {selectedTransaction.data?.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Current Stage</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md border ${getStageColor(selectedTransaction.currentStage)}`}>
                        {selectedTransaction.currentStage?.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Application Progress</label>
                      <div className="mt-1">
                        <div className="flex justify-between text-sm">
                          <span>{selectedTransaction.data?.applicationProgress || 0}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${selectedTransaction.data?.applicationProgress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Metrics */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Application Metrics</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Connected Accounts</label>
                        <p className="text-sm text-gray-900">{selectedTransaction.data?.connectedAccounts || 0}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Documents Generated</label>
                        <p className="text-sm text-gray-900">{selectedTransaction.data?.generatedDocuments || 0}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Associated Users</label>
                        <p className="text-sm text-gray-900">{selectedTransaction.data?.associatedUsers || 0}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Submitted Date</label>
                        <p className="text-sm text-gray-900">
                          {formatDate(selectedTransaction.data?.submittedAt || selectedTransaction.createdAt || '')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleEditTransaction(selectedTransaction)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Edit Application
                    </button>
                    <button
                      onClick={() => navigate(`/risk-assessment?transaction=${selectedTransaction.id}`)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Run Risk Assessment
                    </button>
                    <button
                      onClick={() => navigate(`/deal-structuring?transaction=${selectedTransaction.id}`)}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Structure Deal
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            <span className="text-sm">{error.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionExplorer;
