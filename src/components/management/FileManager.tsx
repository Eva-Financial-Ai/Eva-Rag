import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// Types for file management
interface FileDocument {
  id: string;
  name: string;
  originalName: string;
  type: string; // MIME type
  size: number; // in bytes
  category: 'financial' | 'legal' | 'operational' | 'compliance' | 'personal' | 'other';
  subcategory?: string;
  status: 'uploaded' | 'processing' | 'approved' | 'rejected' | 'expired';
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  lastAccessed?: string;
  tags: string[];
  description?: string;
  version: number;
  parentId?: string; // for file versions
  customerId?: string;
  dealId?: string;
  securityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  accessPermissions: Array<{
    userId: string;
    permission: 'read' | 'write' | 'delete';
  }>;
  expiryDate?: string;
  downloadCount: number;
  fileUrl?: string; // would be actual file URL in real implementation
  thumbnailUrl?: string;
  checksum?: string;
  isEncrypted: boolean;
  notes?: string;
}

interface FileManagerProps {
  onEditFile?: (file: FileDocument) => void;
  onCreateNew?: () => void;
}

// Mock data for demonstration
const mockFiles: FileDocument[] = [
  {
    id: '1',
    name: 'financial-statements-2024-q1.pdf',
    originalName: 'Financial Statements Q1 2024.pdf',
    type: 'application/pdf',
    size: 2457600, // 2.4 MB
    category: 'financial',
    subcategory: 'financial-statements',
    status: 'approved',
    uploadedBy: 'John Smith',
    uploadedAt: '2024-01-15T10:30:00Z',
    lastModified: '2024-01-15T10:30:00Z',
    lastAccessed: '2024-01-20T14:45:00Z',
    tags: ['q1-2024', 'financial', 'statements', 'approved'],
    description: 'Q1 2024 Financial Statements for loan application',
    version: 1,
    customerId: '1',
    dealId: 'deal-001',
    securityLevel: 'confidential',
    accessPermissions: [
      { userId: 'user-001', permission: 'read' },
      { userId: 'user-002', permission: 'write' },
    ],
    downloadCount: 5,
    fileUrl: '/files/financial-statements-2024-q1.pdf',
    thumbnailUrl: '/thumbnails/financial-statements-2024-q1.jpg',
    checksum: 'sha256:a1b2c3d4e5f6...',
    isEncrypted: true,
    notes: 'Reviewed and approved by finance team',
  },
  {
    id: '2',
    name: 'business-license.pdf',
    originalName: 'Business License 2024.pdf',
    type: 'application/pdf',
    size: 1024000, // 1 MB
    category: 'legal',
    subcategory: 'licenses',
    status: 'approved',
    uploadedBy: 'Sarah Johnson',
    uploadedAt: '2024-01-10T16:20:00Z',
    lastModified: '2024-01-10T16:20:00Z',
    lastAccessed: '2024-01-18T09:15:00Z',
    tags: ['license', 'legal', 'business', '2024'],
    description: 'Current business operating license',
    version: 1,
    customerId: '2',
    dealId: 'deal-002',
    securityLevel: 'internal',
    accessPermissions: [{ userId: 'user-003', permission: 'read' }],
    expiryDate: '2024-12-31T23:59:59Z',
    downloadCount: 2,
    fileUrl: '/files/business-license.pdf',
    checksum: 'sha256:f6e5d4c3b2a1...',
    isEncrypted: false,
    notes: 'Valid through 2024',
  },
];

const FileManager: React.FC<FileManagerProps> = ({ onEditFile, onCreateNew }) => {
  const [files, setFiles] = useState<FileDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'uploaded' | 'processing' | 'approved' | 'rejected' | 'expired'
  >('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSecurity, setFilterSecurity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'uploaded' | 'modified' | 'size' | 'downloads'>(
    'modified'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load files from localStorage
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = () => {
    setLoading(true);
    try {
      const savedFiles = localStorage.getItem('files');
      if (savedFiles) {
        setFiles(JSON.parse(savedFiles));
      } else {
        setFiles(mockFiles);
        localStorage.setItem('files', JSON.stringify(mockFiles));
      }
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
      setFiles(mockFiles);
    } finally {
      setLoading(false);
    }
  };

  const saveFiles = (updatedFiles: FileDocument[]) => {
    try {
      localStorage.setItem('files', JSON.stringify(updatedFiles));
      setFiles(updatedFiles);
    } catch (error) {
      console.error('Error saving files:', error);
      toast.error('Failed to save files');
    }
  };

  // Filter and sort files
  const filteredFiles = files
    .filter(file => {
      const matchesSearch =
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || file.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
      const matchesSecurity = filterSecurity === 'all' || file.securityLevel === filterSecurity;
      return matchesSearch && matchesStatus && matchesCategory && matchesSecurity;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'uploaded':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case 'modified':
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'downloads':
          comparison = a.downloadCount - b.downloadCount;
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // CRUD Operations
  const handleCreate = () => {
    onCreateNew?.();
  };

  const handleEdit = (file: FileDocument) => {
    onEditFile?.(file);
  };

  const handleDelete = (fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    saveFiles(updatedFiles);
    toast.success('File deleted successfully');
    setShowDeleteConfirm(null);
  };

  const handleDuplicate = (file: FileDocument) => {
    const newFile: FileDocument = {
      ...file,
      id: Date.now().toString(),
      name: `${file.name.split('.')[0]}-copy.${file.name.split('.').pop()}`,
      uploadedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      version: 1,
      downloadCount: 0,
      parentId: undefined,
    };
    const updatedFiles = [...files, newFile];
    saveFiles(updatedFiles);
    toast.success('File duplicated successfully');
  };

  const handleStatusChange = (
    fileId: string,
    newStatus: 'uploaded' | 'processing' | 'approved' | 'rejected' | 'expired'
  ) => {
    const updatedFiles = files.map(file =>
      file.id === fileId
        ? { ...file, status: newStatus, lastModified: new Date().toISOString() }
        : file
    );
    saveFiles(updatedFiles);
    toast.success(`File status updated to ${newStatus}`);
  };

  const handleDownload = (file: FileDocument) => {
    // Simulate download - in real app would download actual file
    const updatedFiles = files.map(f =>
      f.id === file.id
        ? { ...f, downloadCount: f.downloadCount + 1, lastAccessed: new Date().toISOString() }
        : f
    );
    saveFiles(updatedFiles);
    toast.success(`Downloaded ${file.name}`);
  };

  const handleBulkDelete = () => {
    const updatedFiles = files.filter(file => !selectedFiles.includes(file.id));
    saveFiles(updatedFiles);
    toast.success(`${selectedFiles.length} files deleted`);
    setSelectedFiles([]);
  };

  const handleBulkStatusChange = (
    status: 'uploaded' | 'processing' | 'approved' | 'rejected' | 'expired'
  ) => {
    const updatedFiles = files.map(file =>
      selectedFiles.includes(file.id)
        ? { ...file, status, lastModified: new Date().toISOString() }
        : file
    );
    saveFiles(updatedFiles);
    toast.success(`${selectedFiles.length} files updated`);
    setSelectedFiles([]);
  };

  // Export function
  const handleExport = () => {
    const selectedData =
      selectedFiles.length > 0 ? files.filter(file => selectedFiles.includes(file.id)) : files;

    const dataStr = JSON.stringify(selectedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `files-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Files exported successfully');
  };

  // Get unique values for filters
  const fileCategories = Array.from(new Set(files.map(file => file.category)));
  const securityLevels = Array.from(new Set(files.map(file => file.securityLevel)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'uploaded':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSecurityColor = (level: string) => {
    switch (level) {
      case 'public':
        return 'bg-green-100 text-green-800';
      case 'internal':
        return 'bg-blue-100 text-blue-800';
      case 'confidential':
        return 'bg-orange-100 text-orange-800';
      case 'restricted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return '💰';
      case 'legal':
        return '⚖️';
      case 'operational':
        return '⚙️';
      case 'compliance':
        return '📋';
      case 'personal':
        return '👤';
      default:
        return '📄';
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📕';
    if (type.includes('image')) return '🖼️';
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('zip') || type.includes('archive')) return '📦';
    return '📄';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-8 rounded-lg mb-8 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-3">File Manager</h1>
            <p className="text-lg opacity-90">
              Secure document management with version control and access permissions
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-colors flex items-center"
            >
              <span className="mr-2">📤</span>
              Upload New File
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">📁</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-2xl font-semibold text-gray-900">{files.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {files.filter(file => file.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">💾</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Size</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <span className="text-2xl">🔒</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Encrypted</p>
              <p className="text-2xl font-semibold text-gray-900">
                {files.filter(file => file.isEncrypted).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search files, description, tags..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="uploaded">Uploaded</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              {fileCategories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Security Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Security</label>
            <select
              value={filterSecurity}
              onChange={e => setFilterSecurity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Levels</option>
              {securityLevels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="modified">Last Modified</option>
              <option value="uploaded">Upload Date</option>
              <option value="name">Name</option>
              <option value="size">File Size</option>
              <option value="downloads">Downloads</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-purple-800">
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkStatusChange('approved')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleBulkStatusChange('rejected')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Reject
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
                  onClick={() => setSelectedFiles([])}
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
              Showing {filteredFiles.length} of {files.length} files
            </span>
            <button
              onClick={() => {
                const allIds = filteredFiles.map(file => file.id);
                setSelectedFiles(selectedFiles.length === allIds.length ? [] : allIds);
              }}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              {selectedFiles.length === filteredFiles.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
            >
              Export All
            </button>
            <button
              onClick={loadFiles}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-6xl">📁</span>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No files found</h3>
            <p className="mt-2 text-gray-600">
              {searchTerm ||
              filterStatus !== 'all' ||
              filterCategory !== 'all' ||
              filterSecurity !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by uploading your first file.'}
            </p>
            {!searchTerm &&
              filterStatus === 'all' &&
              filterCategory === 'all' &&
              filterSecurity === 'all' && (
                <button
                  onClick={handleCreate}
                  className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Upload Your First File
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
                      checked={selectedFiles.length === filteredFiles.length}
                      onChange={() => {
                        const allIds = filteredFiles.map(file => file.id);
                        setSelectedFiles(selectedFiles.length === allIds.length ? [] : allIds);
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category & Security
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Downloads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.map(file => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => {
                          setSelectedFiles(prev =>
                            prev.includes(file.id)
                              ? prev.filter(id => id !== file.id)
                              : [...prev, file.id]
                          );
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getFileIcon(file.type)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {file.name}
                            {file.isEncrypted && <span className="ml-1 text-orange-600">🔒</span>}
                          </div>
                          <div className="text-sm text-gray-500">{file.originalName}</div>
                          <div className="text-sm text-gray-500">v{file.version}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {file.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                              >
                                {tag}
                              </span>
                            ))}
                            {file.tags.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{file.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="text-lg mr-1">{getCategoryIcon(file.category)}</span>
                          <span className="text-sm text-gray-900 capitalize">{file.category}</span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSecurityColor(file.securityLevel)}`}
                        >
                          {file.securityLevel.charAt(0).toUpperCase() + file.securityLevel.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}
                        >
                          {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                        </span>
                        <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>By: {file.uploadedBy}</div>
                        <div className="text-gray-500">{formatDate(file.uploadedAt)}</div>
                        <div className="text-gray-400 text-xs">
                          Modified: {formatDate(file.lastModified)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium">{file.downloadCount}</div>
                        {file.lastAccessed && (
                          <div className="text-xs">Last: {formatDate(file.lastAccessed)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownload(file)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Download"
                        >
                          📥
                        </button>
                        <button
                          onClick={() => handleEdit(file)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDuplicate(file)}
                          className="text-green-600 hover:text-green-900"
                          title="Duplicate"
                        >
                          📋
                        </button>
                        <div className="relative">
                          <select
                            value={file.status}
                            onChange={e => handleStatusChange(file.id, e.target.value as any)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                            title="Change Status"
                          >
                            <option value="uploaded">Uploaded</option>
                            <option value="processing">Processing</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="expired">Expired</option>
                          </select>
                        </div>
                        <button
                          onClick={() => setShowDeleteConfirm(file.id)}
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
              <h3 className="text-lg font-medium text-gray-900 mt-2">Delete File</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this file? This action cannot be undone and the
                  file will be permanently removed.
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

export default FileManager;
