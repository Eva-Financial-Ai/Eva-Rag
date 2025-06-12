import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { immutableLedgerService, LedgerRecord, LedgerFilter } from '../../services/immutableLedgerService';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

interface FilterState {
  dateRange: 'today' | 'week' | 'month' | 'all';
  customerId: string;
  transactionId: string;
  eventTypes: string[];
  categories: string[];
  verified: boolean | undefined;
  searchQuery: string;
}

const ImmutableLedgerView: React.FC = () => {
  const userContext = useContext(UserContext);
  const user = userContext?.user || { id: 'demo', name: 'Demo User' };
  const userRole = userContext?.userRole || 'lender';
  
  // Mock data for customers and transactions if contexts not available
  const [customers] = useState([
    { id: 'cust1', name: 'ABC Corporation' },
    { id: 'cust2', name: 'XYZ Industries' },
    { id: 'cust3', name: 'Demo Customer' }
  ]);
  
  const [transactions] = useState([
    { id: 'tx1', title: 'Equipment Loan #12345' },
    { id: 'tx2', title: 'Working Capital #67890' },
    { id: 'tx3', title: 'Real Estate Loan #54321' }
  ]);
  
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<LedgerRecord | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'week',
    customerId: '',
    transactionId: '',
    eventTypes: [],
    categories: [],
    verified: undefined,
    searchQuery: ''
  });
  const [stats, setStats] = useState<any>(null);

  // Event type options
  const eventTypes = [
    { value: 'document_upload', label: 'Document Upload', icon: '📄' },
    { value: 'transaction_created', label: 'Transaction Created', icon: '💼' },
    { value: 'transaction_updated', label: 'Transaction Updated', icon: '✏️' },
    { value: 'customer_action', label: 'Customer Action', icon: '👤' },
    { value: 'loan_application', label: 'Loan Application', icon: '📋' },
    { value: 'approval_decision', label: 'Approval Decision', icon: '✅' },
    { value: 'signature_added', label: 'Signature Added', icon: '✍️' },
    { value: 'payment_processed', label: 'Payment Processed', icon: '💳' },
    { value: 'user_login', label: 'User Login', icon: '🔐' },
    { value: 'permission_change', label: 'Permission Change', icon: '🔑' },
    { value: 'data_export', label: 'Data Export', icon: '📊' },
    { value: 'system_event', label: 'System Event', icon: '⚙️' }
  ];

  // Category options
  const categories = [
    { value: 'document', label: 'Documents', color: 'blue' },
    { value: 'transaction', label: 'Transactions', color: 'green' },
    { value: 'customer', label: 'Customers', color: 'purple' },
    { value: 'loan', label: 'Loans', color: 'yellow' },
    { value: 'security', label: 'Security', color: 'red' },
    { value: 'financial', label: 'Financial', color: 'indigo' },
    { value: 'system', label: 'System', color: 'gray' }
  ];

  // Load records
  useEffect(() => {
    loadRecords();
  }, [filters]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      await immutableLedgerService.initialize();
      
      // Build filter
      const filter: LedgerFilter = {
        customerId: filters.customerId || undefined,
        transactionId: filters.transactionId || undefined,
        eventTypes: filters.eventTypes.length > 0 ? filters.eventTypes : undefined,
        categories: filters.categories.length > 0 ? filters.categories : undefined,
        verified: filters.verified,
        searchQuery: filters.searchQuery || undefined
      };

      // Apply date range
      const now = new Date();
      switch (filters.dateRange) {
        case 'today':
          filter.startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          filter.startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          filter.startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }

      const ledgerRecords = await immutableLedgerService.getRecords(filter);
      setRecords(ledgerRecords);

      // Get statistics
      const statistics = await immutableLedgerService.getStatistics(filter);
      setStats(statistics);
    } catch (error) {
      console.error('Failed to load ledger records:', error);
      toast.error('Failed to load ledger records');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRecord = async (record: LedgerRecord) => {
    try {
      const isValid = await immutableLedgerService.verifyRecord(record.id);
      if (isValid) {
        toast.success('Record verified on blockchain');
        loadRecords(); // Reload to show updated status
      } else {
        toast.error('Record verification failed');
      }
    } catch (error) {
      toast.error('Failed to verify record');
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const blob = await immutableLedgerService.exportRecords(
        {
          customerId: filters.customerId || undefined,
          transactionId: filters.transactionId || undefined,
          eventTypes: filters.eventTypes.length > 0 ? filters.eventTypes : undefined,
          categories: filters.categories.length > 0 ? filters.categories : undefined,
          verified: filters.verified,
          searchQuery: filters.searchQuery || undefined
        },
        format
      );
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ledger_export_${new Date().toISOString()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${records.length} records as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export records');
    }
  };

  const getEventIcon = (eventType: string) => {
    const event = eventTypes.find(e => e.value === eventType);
    return event?.icon || '📝';
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'gray';
  };

  const getCategoryBadgeClass = (category: string) => {
    const colorMap: Record<string, string> = {
      'document': 'bg-blue-100 text-blue-800',
      'transaction': 'bg-green-100 text-green-800',
      'customer': 'bg-purple-100 text-purple-800',
      'loan': 'bg-yellow-100 text-yellow-800',
      'security': 'bg-red-100 text-red-800',
      'financial': 'bg-indigo-100 text-indigo-800',
      'system': 'bg-gray-100 text-gray-800'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex h-full">
      {/* Filters Sidebar */}
      {showFilters && (
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-6">Filters</h2>
          
          {/* Date Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Customer Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
            <select
              value={filters.customerId}
              onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Customers</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction</label>
            <select
              value={filters.transactionId}
              onChange={(e) => setFilters({ ...filters, transactionId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Transactions</option>
              {transactions.map(tx => (
                <option key={tx.id} value={tx.id}>
                  {tx.title || `Transaction ${tx.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Event Types */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Types</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {eventTypes.map(type => (
                <label key={type.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.eventTypes.includes(type.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters({ ...filters, eventTypes: [...filters.eventTypes, type.value] });
                      } else {
                        setFilters({ ...filters, eventTypes: filters.eventTypes.filter(t => t !== type.value) });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="mr-1">{type.icon}</span>
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters({ ...filters, categories: [...filters.categories, cat.value] });
                      } else {
                        setFilters({ ...filters, categories: filters.categories.filter(c => c !== cat.value) });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    cat.value === 'document' ? 'bg-blue-500' :
                    cat.value === 'transaction' ? 'bg-green-500' :
                    cat.value === 'customer' ? 'bg-purple-500' :
                    cat.value === 'loan' ? 'bg-yellow-500' :
                    cat.value === 'security' ? 'bg-red-500' :
                    cat.value === 'financial' ? 'bg-indigo-500' :
                    'bg-gray-500'
                  }`}></span>
                  <span className="text-sm">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Verification Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification</label>
            <select
              value={filters.verified === undefined ? 'all' : filters.verified.toString()}
              onChange={(e) => setFilters({ 
                ...filters, 
                verified: e.target.value === 'all' ? undefined : e.target.value === 'true' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Records</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => setFilters({
              dateRange: 'week',
              customerId: '',
              transactionId: '',
              eventTypes: [],
              categories: [],
              verified: undefined,
              searchQuery: ''
            })}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              
              <h1 className="text-xl font-semibold">Immutable Ledger</h1>
              
              {stats && (
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{stats.totalRecords} records</span>
                  <span className="text-green-600">{stats.verifiedRecords} verified</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search records..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Export */}
              <button
                onClick={() => handleExport('csv')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>Export</span>
              </button>

              {/* Add Test Record (Development Only) */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={async () => {
                    await immutableLedgerService.recordEvent({
                      eventType: 'document_upload',
                      category: 'document',
                      actor: {
                        userId: user?.id || 'test-user',
                        userName: user?.name || 'Test User',
                        userRole: userRole || 'lender'
                      },
                      subject: {
                        type: 'document',
                        id: `test-doc-${Date.now()}`,
                        name: 'Test Document.pdf'
                      },
                      action: `Test: Uploaded document at ${new Date().toLocaleTimeString()}`,
                      customerId: 'cust1',
                      customerName: 'ABC Corporation',
                      details: { test: true, timestamp: new Date().toISOString() }
                    });
                    loadRecords();
                    toast.success('Test record added');
                  }}
                  className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg flex items-center space-x-2"
                >
                  <span>+ Test Record</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No records found</p>
            </div>
          ) : (
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((record) => (
                  <tr 
                    key={record.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{new Date(record.timestamp).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <span>{getEventIcon(record.eventType)}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryBadgeClass(record.category)}`}>
                          {record.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{record.actor.userName}</div>
                        <div className="text-xs text-gray-500">{record.actor.userRole}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.customerName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {record.verified ? (
                        <span className="flex items-center text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      ) : (
                        <span className="text-gray-500">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        {!record.verified && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerifyRecord(record);
                            }}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(record);
                          }}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Ledger Record Details</h2>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Record ID:</span>
                    <p className="font-mono text-xs mt-1">{selectedRecord.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Timestamp:</span>
                    <p className="mt-1">{new Date(selectedRecord.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Event Type:</span>
                    <p className="mt-1">{getEventIcon(selectedRecord.eventType)} {selectedRecord.eventType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <p className="mt-1">{selectedRecord.category}</p>
                  </div>
                </div>
              </div>

              {/* Actor Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Actor Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  <p><span className="text-gray-500">User:</span> {selectedRecord.actor.userName}</p>
                  <p><span className="text-gray-500">Role:</span> {selectedRecord.actor.userRole}</p>
                  <p><span className="text-gray-500">User ID:</span> <span className="font-mono text-xs">{selectedRecord.actor.userId}</span></p>
                </div>
              </div>

              {/* Action Details */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Action Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">{selectedRecord.action}</p>
                  {selectedRecord.details && Object.keys(selectedRecord.details).length > 0 && (
                    <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                      {JSON.stringify(selectedRecord.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>

              {/* Blockchain Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Blockchain Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                  <p>
                    <span className="text-gray-500">Status:</span>
                    {selectedRecord.verified ? (
                      <span className="ml-2 text-green-600">✓ Verified on Blockchain</span>
                    ) : (
                      <span className="ml-2 text-yellow-600">⏳ Pending Verification</span>
                    )}
                  </p>
                  <p>
                    <span className="text-gray-500">Immutable Hash:</span>
                    <span className="ml-2 font-mono text-xs break-all">{selectedRecord.immutableHash}</span>
                  </p>
                  {selectedRecord.transactionHash && (
                    <p>
                      <span className="text-gray-500">Transaction Hash:</span>
                      <span className="ml-2 font-mono text-xs break-all">{selectedRecord.transactionHash}</span>
                    </p>
                  )}
                  {selectedRecord.blockNumber && (
                    <p>
                      <span className="text-gray-500">Block Number:</span>
                      <span className="ml-2">{selectedRecord.blockNumber}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Related Entities */}
              {(selectedRecord.customerId || selectedRecord.transactionId || selectedRecord.documentId) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Related Entities</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedRecord.customerId && (
                      <div>
                        <span className="text-gray-500">Customer:</span>
                        <p className="mt-1">{selectedRecord.customerName || selectedRecord.customerId}</p>
                      </div>
                    )}
                    {selectedRecord.transactionId && (
                      <div>
                        <span className="text-gray-500">Transaction ID:</span>
                        <p className="mt-1 font-mono text-xs">{selectedRecord.transactionId}</p>
                      </div>
                    )}
                    {selectedRecord.documentId && (
                      <div>
                        <span className="text-gray-500">Document ID:</span>
                        <p className="mt-1 font-mono text-xs">{selectedRecord.documentId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImmutableLedgerView;