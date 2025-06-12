import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import PageLayout from '../components/layout/PageLayout';
import { useUserPermissions } from '../hooks/useUserPermissions';
import CustomerSelector, { Customer } from '../components/common/CustomerSelector';
import { useWebSocket, WebSocketMessage } from '../services/websocketService';
import { toast } from 'react-toastify';
import { exportToCSV, exportToPDF, exportToJSON } from '../utils/exportUtils';
import {
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  FunnelIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  ChevronDownIcon,
  PencilIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

export interface Transaction {
  id: string;
  borrowerName: string;
  type: string;
  amount: number;
  status: 'application' | 'underwriting' | 'approved' | 'funding' | 'closed' | 'declined';
  stage: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completionPercentage: number;
  nextAction: string;
  daysInStage: number;
  documents: number;
  messages: number;
  riskScore?: 'low' | 'medium' | 'high';
  estimatedCloseDate?: string;
  loanOfficer?: string;
  underwriter?: string;
  processor?: string;
  customerId?: string;
}

interface StageColumn {
  id: string;
  title: string;
  color: string;
  icon: React.ReactNode;
  transactions: Transaction[];
}

const TransactionSummary: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission, currentRole, tierLevel } = useUserPermissions();
  const [viewMode, setViewMode] = useState<'kanban' | 'grid' | 'list'>('kanban');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stages, setStages] = useState<StageColumn[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Mock transaction data
  const mockTransactions: Transaction[] = [
    {
      id: 'TX-001',
      borrowerName: 'Acme Industries LLC',
      type: 'Equipment Loan',
      amount: 750000,
      status: 'application',
      stage: 'application',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      assignedTo: ['John Smith', 'Sarah Johnson'],
      priority: 'high',
      completionPercentage: 25,
      nextAction: 'Complete financial documents',
      daysInStage: 5,
      documents: 8,
      messages: 3,
      riskScore: 'low',
      estimatedCloseDate: '2024-02-15',
      loanOfficer: 'John Smith',
      processor: 'Emily Davis',
      customerId: 'CUST-001', // Johns Trucking
    },
    {
      id: 'TX-002',
      borrowerName: 'TechStart Solutions',
      type: 'Working Capital',
      amount: 450000,
      status: 'underwriting',
      stage: 'underwriting',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-22',
      assignedTo: ['Mike Wilson', 'Lisa Chen'],
      priority: 'urgent',
      completionPercentage: 60,
      nextAction: 'Risk assessment review',
      daysInStage: 3,
      documents: 15,
      messages: 7,
      riskScore: 'medium',
      estimatedCloseDate: '2024-02-05',
      loanOfficer: 'Mike Wilson',
      underwriter: 'Lisa Chen',
      processor: 'David Brown',
      customerId: 'CUST-005', // Tech Solutions Inc
    },
    {
      id: 'TX-003',
      borrowerName: 'Green Valley Farms',
      type: 'Real Estate Loan',
      amount: 2500000,
      status: 'approved',
      stage: 'approved',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-23',
      assignedTo: ['Robert Taylor', 'Jennifer White'],
      priority: 'medium',
      completionPercentage: 75,
      nextAction: 'Prepare closing documents',
      daysInStage: 2,
      documents: 22,
      messages: 12,
      riskScore: 'low',
      estimatedCloseDate: '2024-01-30',
      loanOfficer: 'Robert Taylor',
      underwriter: 'Jennifer White',
      processor: 'Mark Anderson',
      customerId: 'CUST-003', // Capital Properties
    },
    {
      id: 'TX-004',
      borrowerName: 'Metro Construction Co',
      type: 'Equipment Finance',
      amount: 1200000,
      status: 'funding',
      stage: 'funding',
      createdAt: '2024-01-08',
      updatedAt: '2024-01-24',
      assignedTo: ['Chris Martinez', 'Amanda Lee'],
      priority: 'high',
      completionPercentage: 90,
      nextAction: 'Wire transfer confirmation',
      daysInStage: 1,
      documents: 28,
      messages: 15,
      riskScore: 'medium',
      estimatedCloseDate: '2024-01-26',
      loanOfficer: 'Chris Martinez',
      underwriter: 'Amanda Lee',
      processor: 'Patricia Garcia',
      customerId: 'CUST-002', // Smith Manufacturing
    },
    // Additional transactions for Johns Trucking
    {
      id: 'TX-101',
      borrowerName: 'Johns Trucking',
      type: 'Working Capital',
      amount: 500000,
      status: 'application',
      stage: 'application',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-25',
      assignedTo: ['John Smith'],
      priority: 'medium',
      completionPercentage: 15,
      nextAction: 'Submit bank statements',
      daysInStage: 7,
      documents: 4,
      messages: 2,
      riskScore: 'low',
      estimatedCloseDate: '2024-02-20',
      loanOfficer: 'John Smith',
      customerId: 'CUST-001', // Johns Trucking
    },
    {
      id: 'TX-104',
      borrowerName: 'Johns Trucking',
      type: 'Equipment Refinance',
      amount: 900000,
      status: 'underwriting',
      stage: 'underwriting',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-24',
      assignedTo: ['Sarah Johnson', 'Mike Wilson'],
      priority: 'high',
      completionPercentage: 55,
      nextAction: 'Complete risk analysis',
      daysInStage: 2,
      documents: 12,
      messages: 5,
      riskScore: 'medium',
      estimatedCloseDate: '2024-02-10',
      loanOfficer: 'Sarah Johnson',
      underwriter: 'Mike Wilson',
      customerId: 'CUST-001', // Johns Trucking
    },
  ];

  useEffect(() => {
    // Load transactions based on user permissions
    loadTransactions();
  }, [currentRole]);

  // Filter transactions when customer selection changes
  useEffect(() => {
    if (selectedCustomer) {
      // Filter transactions by selected customer
      const filtered = transactions.filter(t => t.customerId === selectedCustomer.id);
      setFilteredTransactions(filtered);
      organizeByStage(filtered);
    } else {
      // Show all transactions when no customer is selected
      setFilteredTransactions(transactions);
      organizeByStage(transactions);
    }
  }, [selectedCustomer, transactions]);

  const loadTransactions = () => {
    // Filter transactions based on user permissions
    let filteredTransactions = [...mockTransactions];

    // Apply role-based filtering
    if (!hasPermission('loan_application', 'read', { ownership: false })) {
      // Filter to only show assigned transactions
      const userId = localStorage.getItem('userId') || 'John Smith';
      filteredTransactions = filteredTransactions.filter(
        t =>
          t.assignedTo.includes(userId) ||
          t.loanOfficer === userId ||
          t.underwriter === userId ||
          t.processor === userId
      );
    }

    setTransactions(filteredTransactions);
    setFilteredTransactions(filteredTransactions);
    organizeByStage(filteredTransactions);
  };

  const organizeByStage = (txns: Transaction[]) => {
    const stageConfig: StageColumn[] = [
      {
        id: 'application',
        title: 'Application',
        color: 'bg-blue-100 border-blue-300',
        icon: <DocumentTextIcon className="w-5 h-5 text-blue-600" />,
        transactions: [],
      },
      {
        id: 'underwriting',
        title: 'Underwriting',
        color: 'bg-yellow-100 border-yellow-300',
        icon: <ClockIcon className="w-5 h-5 text-yellow-600" />,
        transactions: [],
      },
      {
        id: 'approved',
        title: 'Approved',
        color: 'bg-green-100 border-green-300',
        icon: <CheckCircleIcon className="w-5 h-5 text-green-600" />,
        transactions: [],
      },
      {
        id: 'funding',
        title: 'Funding',
        color: 'bg-purple-100 border-purple-300',
        icon: <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />,
        transactions: [],
      },
      {
        id: 'closed',
        title: 'Closed',
        color: 'bg-gray-100 border-gray-300',
        icon: <CheckCircleIcon className="w-5 h-5 text-gray-600" />,
        transactions: [],
      },
      {
        id: 'declined',
        title: 'Declined',
        color: 'bg-red-100 border-red-300',
        icon: <XCircleIcon className="w-5 h-5 text-red-600" />,
        transactions: [],
      },
    ];

    // Organize transactions by stage
    txns.forEach(txn => {
      const stage = stageConfig.find(s => s.id === txn.status);
      if (stage) {
        stage.transactions.push(txn);
      }
    });

    setStages(stageConfig);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Don't allow moving if user doesn't have permission
    if (!hasPermission('loan_application', 'update')) {
      alert('You do not have permission to move transactions');
      return;
    }

    const newStages = [...stages];
    const sourceStage = newStages.find(s => s.id === source.droppableId);
    const destStage = newStages.find(s => s.id === destination.droppableId);

    if (sourceStage && destStage) {
      const [movedTransaction] = sourceStage.transactions.splice(source.index, 1);
      movedTransaction.status = destination.droppableId as any;
      movedTransaction.stage = destination.droppableId;
      movedTransaction.updatedAt = new Date().toISOString().split('T')[0];
      movedTransaction.daysInStage = 0;

      destStage.transactions.splice(destination.index, 0, movedTransaction);
      setStages(newStages);

      // Update the main transactions array
      const updatedTransactions = transactions.map(t =>
        t.id === movedTransaction.id ? movedTransaction : t
      );
      setTransactions(updatedTransactions);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    navigate(`/credit-application?edit=${transaction.id}`);
  };

  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer);
  };

  // WebSocket message handler
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'transaction_update':
        setTransactions(prev => {
          const updated = prev.map(t => (t.id === message.data.id ? { ...t, ...message.data } : t));
          return updated;
        });
        toast.info(`Transaction ${message.data.id} updated`);
        break;

      case 'transaction_new':
        setTransactions(prev => [...prev, message.data]);
        toast.success(`New transaction: ${message.data.borrowerName}`);
        break;

      case 'transaction_delete':
        setTransactions(prev => prev.filter(t => t.id !== message.data.id));
        toast.warning(`Transaction ${message.data.id} removed`);
        break;

      case 'stage_change':
        setTransactions(prev => {
          const updated = prev.map(t =>
            t.id === message.data.id
              ? {
                  ...t,
                  status: message.data.newStage,
                  stage: message.data.newStage,
                  daysInStage: 0,
                }
              : t
          );
          return updated;
        });
        toast.info(`Transaction ${message.data.id} moved to ${message.data.newStage}`);
        break;
    }
  }, []);

  // Use WebSocket hook
  const { isConnected } = useWebSocket(
    ['transaction_update', 'transaction_new', 'transaction_delete', 'stage_change'],
    handleWebSocketMessage
  );

  useEffect(() => {
    setWsConnected(isConnected);
  }, [isConnected]);

  const renderTransactionCard = (transaction: Transaction, isDragging?: boolean) => (
    <div
      className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={() => handleTransactionClick(transaction)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{transaction.borrowerName}</h4>
          <p className="text-sm text-gray-500">{transaction.id}</p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(transaction.priority)}`}
        >
          {transaction.priority}
        </span>
      </div>

      {/* Amount and Type */}
      <div className="mb-3">
        <p className="text-lg font-bold text-gray-900">{formatCurrency(transaction.amount)}</p>
        <p className="text-sm text-gray-600">{transaction.type}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{transaction.completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${transaction.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Next Action */}
      <div className="mb-3 p-2 bg-yellow-50 rounded text-sm">
        <p className="text-yellow-800 font-medium">Next: {transaction.nextAction}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <p className="text-gray-500">Days</p>
          <p className="font-semibold">{transaction.daysInStage}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Docs</p>
          <p className="font-semibold">{transaction.documents}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Msgs</p>
          <p className="font-semibold">{transaction.messages}</p>
        </div>
      </div>

      {/* Team */}
      <div className="mt-3 pt-3 border-t">
        <div className="flex -space-x-2">
          {transaction.assignedTo.slice(0, 3).map((person, idx) => (
            <div
              key={idx}
              className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700"
              title={person}
            >
              {person
                .split(' ')
                .map(n => n[0])
                .join('')}
            </div>
          ))}
          {transaction.assignedTo.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
              +{transaction.assignedTo.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Risk Score */}
      {transaction.riskScore && (
        <div className="mt-2 flex items-center text-xs">
          <ExclamationCircleIcon
            className={`w-4 h-4 mr-1 ${getRiskColor(transaction.riskScore)}`}
          />
          <span className={getRiskColor(transaction.riskScore)}>{transaction.riskScore} risk</span>
        </div>
      )}
    </div>
  );

  const renderKanbanView = () => {
    return (
      <DragDropContext onDragEnd={handleDragEnd} {...({} as any)}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => (
            <div key={stage.id} className="flex-shrink-0 w-96">
              <div className={`rounded-lg border-2 ${stage.color} p-4`}>
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {stage.icon}
                    <h3 className="ml-2 font-semibold text-gray-900">{stage.title}</h3>
                    <span className="ml-2 text-sm text-gray-500">
                      ({stage.transactions.length})
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    {formatCurrency(stage.transactions.reduce((sum, t) => sum + t.amount, 0))}
                  </div>
                </div>

                {/* Transactions */}
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[200px] ${
                        snapshot.isDraggingOver ? 'bg-gray-50 rounded' : ''
                      }`}
                    >
                      {stage.transactions.map((transaction, index) => (
                        <Draggable
                          key={transaction.id}
                          draggableId={transaction.id}
                          index={index}
                          isDragDisabled={!hasPermission('loan_application', 'update')}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              {renderTransactionCard(transaction, snapshot.isDragging)}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    );
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredTransactions
        .filter(t => filterStatus === 'all' || t.status === filterStatus)
        .filter(
          t =>
            searchTerm === '' ||
            t.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(transaction => (
          <div key={transaction.id}>{renderTransactionCard(transaction)}</div>
        ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transaction
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Team
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredTransactions
            .filter(t => filterStatus === 'all' || t.status === filterStatus)
            .filter(
              t =>
                searchTerm === '' ||
                t.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.id.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(transaction => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.borrowerName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.id} • {transaction.type}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'declined'
                          ? 'bg-red-100 text-red-800'
                          : transaction.status === 'funding'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1 mr-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${transaction.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {transaction.completionPercentage}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex -space-x-2">
                    {transaction.assignedTo.slice(0, 3).map((person, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700"
                        title={person}
                      >
                        {person
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTransactionClick(transaction)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    {hasPermission('loan_application', 'update') && (
                      <button
                        onClick={() => handleEditTransaction(transaction)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button className="text-purple-600 hover:text-purple-900" title="Messages">
                      <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  const renderDetailModal = () => {
    if (!selectedTransaction) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedTransaction.borrowerName}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedTransaction.id} • {selectedTransaction.type}
              </p>
            </div>
            <button
              onClick={() => setSelectedTransaction(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Loan Amount</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(selectedTransaction.amount)}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Progress</p>
                <p className="text-2xl font-bold text-green-900">
                  {selectedTransaction.completionPercentage}%
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Est. Close Date</p>
                <p className="text-2xl font-bold text-purple-900">
                  {selectedTransaction.estimatedCloseDate || 'TBD'}
                </p>
              </div>
            </div>

            {/* Team Members */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Team Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedTransaction.loanOfficer && (
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-gray-500">Loan Officer</p>
                    <p className="font-medium">{selectedTransaction.loanOfficer}</p>
                  </div>
                )}
                {selectedTransaction.underwriter && (
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-gray-500">Underwriter</p>
                    <p className="font-medium">{selectedTransaction.underwriter}</p>
                  </div>
                )}
                {selectedTransaction.processor && (
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-gray-500">Processor</p>
                    <p className="font-medium">{selectedTransaction.processor}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">Application Started</p>
                    <p className="text-sm text-gray-500">{selectedTransaction.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">Current Stage: {selectedTransaction.stage}</p>
                    <p className="text-sm text-gray-500">
                      {selectedTransaction.daysInStage} days • Last updated{' '}
                      {selectedTransaction.updatedAt}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {hasPermission('loan_application', 'update') && (
                <button
                  onClick={() => handleEditTransaction(selectedTransaction)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Transaction
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Summary statistics
  const stats = {
    total: filteredTransactions.length,
    totalAmount: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
    avgDaysToClose:
      filteredTransactions.length > 0
        ? Math.round(
            filteredTransactions.reduce((sum, t) => sum + t.daysInStage, 0) /
              filteredTransactions.length
          )
        : 0,
    highPriority: filteredTransactions.filter(t => t.priority === 'high' || t.priority === 'urgent')
      .length,
  };

  return (
    <PageLayout title="Transaction Summary">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transaction Summary</h1>
              <p className="mt-2 text-gray-600">
                {selectedCustomer
                  ? `Showing transactions for ${selectedCustomer.name}`
                  : 'Overview of all active credit transactions with real-time status tracking'}
              </p>
            </div>
            {/* WebSocket Connection Status */}
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}
                data-testid="ws-indicator"
              ></div>
              <span className="text-sm text-gray-600">
                {wsConnected ? 'Live Updates' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6" data-testid="stats-total">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-10 w-10 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Deals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6" data-testid="stats-pipeline">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-10 w-10 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Pipeline</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6" data-testid="stats-avg-days">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-10 w-10 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Days in Stage</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgDaysToClose}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6" data-testid="stats-high-priority">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-10 w-10 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">{stats.highPriority}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Customer Selector */}
            <div className="flex-1 max-w-xs">
              <CustomerSelector
                onCustomerSelect={handleCustomerSelect}
                placeholder="All Customers"
              />
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Kanban View"
              >
                <ViewColumnsIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Grid View"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="List View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="ml-4 p-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                <FunnelIcon className="w-5 h-5" />
              </button>

              {/* Export Menu */}
              <div className="relative ml-2">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded flex items-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <ChevronDownIcon className="w-4 h-4 ml-1" />
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <button
                      onClick={() => {
                        exportToCSV(filteredTransactions);
                        setShowExportMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => {
                        exportToPDF(
                          filteredTransactions,
                          selectedCustomer
                            ? `${selectedCustomer.name} Transactions`
                            : 'All Transactions'
                        );
                        setShowExportMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as PDF
                    </button>
                    <button
                      onClick={() => {
                        exportToJSON(filteredTransactions);
                        setShowExportMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as JSON
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="application">Application</option>
                  <option value="underwriting">Underwriting</option>
                  <option value="approved">Approved</option>
                  <option value="funding">Funding</option>
                  <option value="closed">Closed</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Full Width */}
        <div className="bg-gray-50 rounded-lg p-4">
          {viewMode === 'kanban' && renderKanbanView()}
          {viewMode === 'grid' && renderGridView()}
          {viewMode === 'list' && renderListView()}
        </div>

        {/* Detail Modal */}
        {renderDetailModal()}
      </div>
    </PageLayout>
  );
};

export default TransactionSummary;
