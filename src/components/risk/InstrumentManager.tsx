import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// Types for instrument management
interface SavedInstrument {
  id: string;
  name: string;
  type: string;
  description?: string;
  config: any; // The full configuration object
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'draft';
  tags: string[];
  lender: string;
  usage: {
    totalMatches: number;
    lastUsed?: string;
    successRate: number;
  };
}

interface InstrumentManagerProps {
  onEditInstrument?: (instrument: SavedInstrument) => void;
  onCreateNew?: () => void;
}

// Mock data for demonstration
const mockInstruments: SavedInstrument[] = [
  {
    id: '1',
    name: 'Small Business Term Loan',
    type: 'term_loan',
    description:
      'Standard term loan configuration for small businesses with moderate risk tolerance',
    config: {
      instrumentName: 'Small Business Term Loan',
      instrumentType: 'term_loan',
      minGrade: 'B',
      minTotalScore: 70,
      // ... other config properties
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    status: 'active',
    tags: ['small-business', 'term-loan', 'moderate-risk'],
    lender: 'Community Bank',
    usage: {
      totalMatches: 156,
      lastUsed: '2024-01-20T09:15:00Z',
      successRate: 78.5,
    },
  },
  {
    id: '2',
    name: 'Equipment Financing Premium',
    type: 'equipment_financing',
    description: 'High-value equipment financing with strict requirements',
    config: {
      instrumentName: 'Equipment Financing Premium',
      instrumentType: 'equipment_financing',
      minGrade: 'A-',
      minTotalScore: 85,
    },
    createdAt: '2024-01-10T16:20:00Z',
    updatedAt: '2024-01-18T11:30:00Z',
    status: 'active',
    tags: ['equipment', 'premium', 'high-value'],
    lender: 'Equipment Finance Corp',
    usage: {
      totalMatches: 89,
      lastUsed: '2024-01-19T15:20:00Z',
      successRate: 92.1,
    },
  },
  {
    id: '3',
    name: 'SBA Loan Configuration',
    type: 'sba_loan',
    description: 'SBA 7(a) loan configuration with government guidelines',
    config: {
      instrumentName: 'SBA Loan Configuration',
      instrumentType: 'sba_loan',
      minGrade: 'B+',
      minTotalScore: 75,
    },
    createdAt: '2024-01-05T09:45:00Z',
    updatedAt: '2024-01-15T13:20:00Z',
    status: 'draft',
    tags: ['sba', 'government', 'guaranteed'],
    lender: 'Regional Bank',
    usage: {
      totalMatches: 23,
      lastUsed: '2024-01-12T10:45:00Z',
      successRate: 65.2,
    },
  },
];

const InstrumentManager: React.FC<InstrumentManagerProps> = ({ onEditInstrument, onCreateNew }) => {
  const [instruments, setInstruments] = useState<SavedInstrument[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'draft'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'usage'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Load instruments from localStorage or API
  useEffect(() => {
    loadInstruments();
  }, []);

  const loadInstruments = () => {
    setLoading(true);
    try {
      const savedInstruments = localStorage.getItem('smartMatchInstruments');
      if (savedInstruments) {
        setInstruments(JSON.parse(savedInstruments));
      } else {
        // Use mock data for demo
        setInstruments(mockInstruments);
        localStorage.setItem('smartMatchInstruments', JSON.stringify(mockInstruments));
      }
    } catch (error) {
      console.error('Error loading instruments:', error);
      toast.error('Failed to load instruments');
      setInstruments(mockInstruments);
    } finally {
      setLoading(false);
    }
  };

  const saveInstruments = (updatedInstruments: SavedInstrument[]) => {
    try {
      localStorage.setItem('smartMatchInstruments', JSON.stringify(updatedInstruments));
      setInstruments(updatedInstruments);
    } catch (error) {
      console.error('Error saving instruments:', error);
      toast.error('Failed to save instruments');
    }
  };

  // Filter and sort instruments
  const filteredInstruments = instruments
    .filter(instrument => {
      const matchesSearch =
        instrument.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instrument.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instrument.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || instrument.status === filterStatus;
      const matchesType = filterType === 'all' || instrument.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'usage':
          comparison = a.usage.totalMatches - b.usage.totalMatches;
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // CRUD Operations
  const handleCreate = () => {
    onCreateNew?.();
  };

  const handleEdit = (instrument: SavedInstrument) => {
    onEditInstrument?.(instrument);
  };

  const handleDelete = (instrumentId: string) => {
    const updatedInstruments = instruments.filter(inst => inst.id !== instrumentId);
    saveInstruments(updatedInstruments);
    toast.success('Instrument deleted successfully');
    setShowDeleteConfirm(null);
  };

  const handleDuplicate = (instrument: SavedInstrument) => {
    const newInstrument: SavedInstrument = {
      ...instrument,
      id: Date.now().toString(),
      name: `${instrument.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      usage: {
        totalMatches: 0,
        successRate: 0,
      },
    };
    const updatedInstruments = [...instruments, newInstrument];
    saveInstruments(updatedInstruments);
    toast.success('Instrument duplicated successfully');
  };

  const handleStatusChange = (instrumentId: string, newStatus: 'active' | 'inactive' | 'draft') => {
    const updatedInstruments = instruments.map(inst =>
      inst.id === instrumentId
        ? { ...inst, status: newStatus, updatedAt: new Date().toISOString() }
        : inst
    );
    saveInstruments(updatedInstruments);
    toast.success(
      `Instrument ${newStatus === 'active' ? 'activated' : newStatus === 'inactive' ? 'deactivated' : 'moved to draft'}`
    );
  };

  const handleBulkDelete = () => {
    const updatedInstruments = instruments.filter(inst => !selectedInstruments.includes(inst.id));
    saveInstruments(updatedInstruments);
    toast.success(`${selectedInstruments.length} instruments deleted`);
    setSelectedInstruments([]);
    setShowBulkActions(false);
  };

  const handleBulkStatusChange = (status: 'active' | 'inactive' | 'draft') => {
    const updatedInstruments = instruments.map(inst =>
      selectedInstruments.includes(inst.id)
        ? { ...inst, status, updatedAt: new Date().toISOString() }
        : inst
    );
    saveInstruments(updatedInstruments);
    toast.success(`${selectedInstruments.length} instruments updated`);
    setSelectedInstruments([]);
    setShowBulkActions(false);
  };

  // Export/Import functions
  const handleExport = () => {
    const selectedData =
      selectedInstruments.length > 0
        ? instruments.filter(inst => selectedInstruments.includes(inst.id))
        : instruments;

    const dataStr = JSON.stringify(selectedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-match-instruments-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Instruments exported successfully');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        const newInstruments = importedData.map((inst: any) => ({
          ...inst,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'draft',
        }));
        const updatedInstruments = [...instruments, ...newInstruments];
        saveInstruments(updatedInstruments);
        toast.success(`${newInstruments.length} instruments imported successfully`);
      } catch (error) {
        toast.error('Failed to import instruments. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Get unique instrument types for filter
  const instrumentTypes = Array.from(new Set(instruments.map(inst => inst.type)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'term_loan':
        return '💼';
      case 'equipment_financing':
        return '🏗️';
      case 'sba_loan':
        return '🏛️';
      case 'line_of_credit':
        return '💳';
      case 'commercial_mortgage':
        return '🏢';
      default:
        return '📋';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-lg mb-8 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-3">Instrument Manager</h1>
            <p className="text-lg opacity-90">
              Manage your Smart Match instrument configurations with full CRUD operations
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors flex items-center"
            >
              <span className="mr-2">+</span>
              Create New Instrument
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Instruments</p>
              <p className="text-2xl font-semibold text-gray-900">{instruments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-semibold text-gray-900">
                {instruments.filter(inst => inst.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {instruments.filter(inst => inst.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {instruments.length > 0
                  ? Math.round(
                      instruments.reduce((sum, inst) => sum + inst.usage.successRate, 0) /
                        instruments.length
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search instruments, descriptions, tags..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {instrumentTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Created Date</option>
              <option value="name">Name</option>
              <option value="usage">Usage</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedInstruments.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-800">
                {selectedInstruments.length} instrument{selectedInstruments.length > 1 ? 's' : ''}{' '}
                selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkStatusChange('active')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkStatusChange('inactive')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Deactivate
                </button>
                <button
                  onClick={handleExport}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Export
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedInstruments([])}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Showing {filteredInstruments.length} of {instruments.length} instruments
            </span>
            <button
              onClick={() => {
                const allIds = filteredInstruments.map(inst => inst.id);
                setSelectedInstruments(selectedInstruments.length === allIds.length ? [] : allIds);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedInstruments.length === filteredInstruments.length
                ? 'Deselect All'
                : 'Select All'}
            </button>
          </div>

          <div className="flex space-x-2">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-instruments"
            />
            <label
              htmlFor="import-instruments"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer text-sm"
            >
              Import
            </label>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Export All
            </button>
            <button
              onClick={loadInstruments}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Instruments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading instruments...</p>
          </div>
        ) : filteredInstruments.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-6xl">📋</span>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No instruments found</h3>
            <p className="mt-2 text-gray-600">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first Smart Match instrument.'}
            </p>
            {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
              <button
                onClick={handleCreate}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First Instrument
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedInstruments.length === filteredInstruments.length}
                      onChange={() => {
                        const allIds = filteredInstruments.map(inst => inst.id);
                        setSelectedInstruments(
                          selectedInstruments.length === allIds.length ? [] : allIds
                        );
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instrument
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInstruments.map(instrument => (
                  <tr key={instrument.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedInstruments.includes(instrument.id)}
                        onChange={() => {
                          setSelectedInstruments(prev =>
                            prev.includes(instrument.id)
                              ? prev.filter(id => id !== instrument.id)
                              : [...prev, instrument.id]
                          );
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getTypeIcon(instrument.type)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{instrument.name}</div>
                          <div className="text-sm text-gray-500">{instrument.description}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {instrument.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {instrument.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(instrument.status)}`}
                      >
                        {instrument.status.charAt(0).toUpperCase() + instrument.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>Matches: {instrument.usage.totalMatches}</div>
                        <div>Success: {instrument.usage.successRate}%</div>
                        {instrument.usage.lastUsed && (
                          <div className="text-xs text-gray-500">
                            Last: {formatDate(instrument.usage.lastUsed)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(instrument.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(instrument)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDuplicate(instrument)}
                          className="text-green-600 hover:text-green-900"
                          title="Duplicate"
                        >
                          📋
                        </button>
                        <div className="relative">
                          <select
                            value={instrument.status}
                            onChange={e => handleStatusChange(instrument.id, e.target.value as any)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                            title="Change Status"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="draft">Draft</option>
                          </select>
                        </div>
                        <button
                          onClick={() => setShowDeleteConfirm(instrument.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <span className="text-4xl">⚠️</span>
              <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Instrument</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this instrument? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3 flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstrumentManager;
