import React, { useState, useCallback, useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import CloudflareR2Service, { R2PubSubEventType } from '../../services/cloudflareR2Service';
import { uploadDocument, batchUploadDocuments, getUploadQueueStatus } from '../../api/enhancedDocumentAPI';
import { STORAGE_CONFIG, getRolePermissions, isValidFileType, isValidFileSize, autoTagFile } from '../../config/storageConfig';
import { toast } from 'react-toastify';

// Types
interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'pdf' | 'document' | 'spreadsheet' | 'image' | 'presentation';
  size?: number;
  lastModified: string;
  uploadedBy: string;
  category: 'loan' | 'financial' | 'legal' | 'tax' | 'compliance' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  syncStatus: 'synced' | 'syncing' | 'error' | 'pending';
  cloudflareId?: string;
  supabaseId?: string;
  parentId: string | null;
  tags: string[];
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canShare: boolean;
    canApprove: boolean;
  };
  metadata?: {
    loanId?: string;
    customerId?: string;
    transactionId?: string;
    documentType?: string;
    expiryDate?: string;
  };
}

interface FinanceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  requiredDocs: string[];
}

const FINANCE_CATEGORIES: FinanceCategory[] = Object.entries(STORAGE_CONFIG.categories).map(([id, config]) => ({
  id,
  name: config.name,
  icon: config.icon,
  color: `bg-${config.color}-100 text-${config.color}-800`,
  requiredDocs: config.requiredDocs
}));

const FileLockDriveEnhanced: React.FC = () => {
  const { user, userRole } = useContext(UserContext) || {};
  const { currentTransaction } = useWorkflow();
  const r2Service = CloudflareR2Service.getInstance();

  // State
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Initialize R2 PubSub for real-time sync
  useEffect(() => {
    r2Service.initializePubSub();

    // Subscribe to file events
    const unsubscribe = r2Service.onPubSubEvent('*', (event) => {
      if (event.type === R2PubSubEventType.FILE_UPLOADED) {
        handleFileSync(event.payload);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle file sync from backend
  const handleFileSync = useCallback((payload: any) => {
    const newFile: FileItem = {
      id: payload.fileKey,
      name: payload.fileName,
      type: getFileType(payload.fileName),
      size: payload.fileSize,
      lastModified: new Date().toISOString(),
      uploadedBy: user?.name || 'System',
      category: categorizeFile(payload.fileName),
      status: 'processing',
      syncStatus: 'synced',
      cloudflareId: payload.fileKey,
      parentId: null,
      tags: payload.metadata?.tags || [],
      permissions: getPermissionsByRole(userRole),
      metadata: payload.metadata
    };

    setFiles(prev => [...prev, newFile]);
    toast.success(`File ${payload.fileName} synced successfully`);
  }, [user, userRole]);

  // Get file type from extension
  const getFileType = (fileName: string): FileItem['type'] => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'pdf';
      case 'doc':
      case 'docx': return 'document';
      case 'xls':
      case 'xlsx': return 'spreadsheet';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'image';
      case 'ppt':
      case 'pptx': return 'presentation';
      default: return 'document';
    }
  };

  // Auto-categorize files based on name/content
  const categorizeFile = (fileName: string): FileItem['category'] => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('loan') || lowerName.includes('application')) return 'loan';
    if (lowerName.includes('financial') || lowerName.includes('statement')) return 'financial';
    if (lowerName.includes('tax') || lowerName.includes('return')) return 'tax';
    if (lowerName.includes('legal') || lowerName.includes('agreement')) return 'legal';
    if (lowerName.includes('kyc') || lowerName.includes('compliance')) return 'compliance';
    return 'other';
  };

  // Get permissions based on user role
  const getPermissionsByRole = (role?: string) => {
    switch (role) {
      case 'lender':
        return { canView: true, canEdit: true, canDelete: true, canShare: true, canApprove: true };
      case 'broker':
        return { canView: true, canEdit: true, canDelete: false, canShare: true, canApprove: false };
      case 'borrower':
        return { canView: true, canEdit: false, canDelete: false, canShare: false, canApprove: false };
      default:
        return { canView: true, canEdit: false, canDelete: false, canShare: false, canApprove: false };
    }
  };

  // Handle file upload with backend sync
  const handleFileUpload = async (fileList: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);
    setSyncStatus('syncing');

    try {
      const filesArray = Array.from(fileList);
      
      // Validate files before upload
      for (const file of filesArray) {
        if (!isValidFileType(file)) {
          toast.error(`Invalid file type: ${file.name}`);
          continue;
        }
        
        if (!isValidFileSize(file, userRole || 'borrower')) {
          toast.error(`File too large: ${file.name}`);
          continue;
        }
      }

      // Use batch upload for better performance
      const results = await batchUploadDocuments(filesArray, {
        transactionId: currentTransaction?.id,
        category: 'auto', // Will be auto-categorized
        tags: [],
        metadata: {
          uploadedBy: user?.id,
          userRole: userRole,
          source: 'filelock-drive'
        },
        onProgress: (progress) => {
          setUploadProgress(progress);
        }
      });

      // Process results
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      // Update local file list with successful uploads
      const newFiles: FileItem[] = results
        .filter(r => r.success)
        .map((result, index) => {
          const file = filesArray[index];
          const category = categorizeFile(file.name);
          const tags = autoTagFile(file.name);
          
          return {
            id: result.documentId,
            name: file.name,
            type: getFileType(file.name),
            size: file.size,
            lastModified: new Date().toISOString(),
            uploadedBy: user?.name || 'Unknown',
            category,
            status: 'processing',
            syncStatus: 'synced',
            cloudflareId: result.documentId,
            supabaseId: result.supabaseId,
            parentId: null,
            tags,
            permissions: getPermissionsByRole(userRole),
            metadata: {
              transactionId: currentTransaction?.id,
              documentType: category,
              processingResults: result.processingResults
            }
          };
        });

      setFiles(prev => [...prev, ...newFiles]);

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}`);
      }
      if (failCount > 0) {
        toast.error(`Failed to upload ${failCount} file${failCount > 1 ? 's' : ''}`);
      }

      setSyncStatus('idle');
    } catch (error) {
      console.error('Upload error:', error);
      setSyncStatus('error');
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Filter files based on category and search
  const filteredFiles = files.filter(file => {
    const categoryMatch = selectedCategory === 'all' || file.category === selectedCategory;
    const searchMatch = !searchQuery || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return categoryMatch && searchMatch;
  });

  // Role-specific dashboard header
  const renderRoleHeader = () => {
    const roleConfig = {
      lender: { title: 'Lender Document Hub', icon: '🏦' },
      broker: { title: 'Broker File Manager', icon: '🤝' },
      borrower: { title: 'My Documents', icon: '📁' },
      vendor: { title: 'Vendor Portal', icon: '🏢' }
    };

    const config = roleConfig[userRole as keyof typeof roleConfig] || { title: 'Document Manager', icon: '📄' };

    return (
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{config.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
              <p className="text-sm text-gray-500">
                {syncStatus === 'syncing' && '🔄 Syncing with cloud...'}
                {syncStatus === 'error' && '⚠️ Sync error - working offline'}
                {syncStatus === 'idle' && '✅ All files synced'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* View mode toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Upload button */}
            <label className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload Files</span>
              <input
                type="file"
                multiple
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
            </label>
          </div>
        </div>
      </div>
    );
  };

  // Render category sidebar
  const renderCategorySidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Categories</h3>
      
      <button
        onClick={() => setSelectedCategory('all')}
        className={`w-full text-left px-4 py-2 rounded-lg mb-2 flex items-center space-x-3 ${
          selectedCategory === 'all' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
        }`}
      >
        <span>📁</span>
        <span>All Documents</span>
        <span className="ml-auto text-sm text-gray-500">{files.length}</span>
      </button>

      {FINANCE_CATEGORIES.map(category => {
        const count = files.filter(f => f.category === category.id).length;
        return (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`w-full text-left px-4 py-2 rounded-lg mb-2 flex items-center space-x-3 ${
              selectedCategory === category.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
            <span className="ml-auto text-sm text-gray-500">{count}</span>
          </button>
        );
      })}

      {/* Role-specific actions */}
      {userRole === 'lender' && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Quick Actions</h3>
          <button className="w-full text-left px-4 py-2 rounded-lg mb-2 bg-green-50 text-green-700 hover:bg-green-100">
            ✅ Approve Selected
          </button>
          <button className="w-full text-left px-4 py-2 rounded-lg mb-2 bg-red-50 text-red-700 hover:bg-red-100">
            ❌ Reject Selected
          </button>
        </div>
      )}
    </div>
  );

  // Render file grid
  const renderFileGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
      {filteredFiles.map(file => (
        <div
          key={file.id}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer ${
            selectedFiles.some(f => f.id === file.id) ? 'ring-2 ring-primary-500' : ''
          }`}
          onClick={() => {
            if (selectedFiles.some(f => f.id === file.id)) {
              setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
            } else {
              setSelectedFiles([...selectedFiles, file]);
            }
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">{getFileIcon(file.type)}</div>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(file.status)}`}>
              {file.status}
            </span>
          </div>
          
          <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">{file.name}</h4>
          <p className="text-xs text-gray-500 mb-3">
            {file.size ? formatFileSize(file.size) : 'Unknown size'} • {new Date(file.lastModified).toLocaleDateString()}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {file.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {file.permissions.canView && (
                <button className="p-1 hover:bg-gray-100 rounded" title="View">
                  👁️
                </button>
              )}
              {file.permissions.canShare && (
                <button className="p-1 hover:bg-gray-100 rounded" title="Share">
                  🔗
                </button>
              )}
              {file.permissions.canEdit && (
                <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                  ✏️
                </button>
              )}
            </div>
            
            <div className={`w-2 h-2 rounded-full ${
              file.syncStatus === 'synced' ? 'bg-green-500' :
              file.syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} title={`Sync: ${file.syncStatus}`} />
          </div>
        </div>
      ))}
    </div>
  );

  // Render file list
  const renderFileList = () => (
    <div className="p-6">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left pb-3 text-sm font-medium text-gray-600">Name</th>
            <th className="text-left pb-3 text-sm font-medium text-gray-600">Category</th>
            <th className="text-left pb-3 text-sm font-medium text-gray-600">Status</th>
            <th className="text-left pb-3 text-sm font-medium text-gray-600">Modified</th>
            <th className="text-left pb-3 text-sm font-medium text-gray-600">Size</th>
            <th className="text-left pb-3 text-sm font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFiles.map(file => (
            <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.type)}</span>
                  <span className="font-medium text-gray-900">{file.name}</span>
                </div>
              </td>
              <td className="py-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  FINANCE_CATEGORIES.find(c => c.id === file.category)?.color || 'bg-gray-100 text-gray-800'
                }`}>
                  {FINANCE_CATEGORIES.find(c => c.id === file.category)?.name || 'Other'}
                </span>
              </td>
              <td className="py-3">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(file.status)}`}>
                  {file.status}
                </span>
              </td>
              <td className="py-3 text-sm text-gray-600">
                {new Date(file.lastModified).toLocaleDateString()}
              </td>
              <td className="py-3 text-sm text-gray-600">
                {file.size ? formatFileSize(file.size) : '-'}
              </td>
              <td className="py-3">
                <div className="flex space-x-2">
                  {file.permissions.canView && (
                    <button className="text-blue-600 hover:text-blue-800">View</button>
                  )}
                  {file.permissions.canEdit && (
                    <button className="text-gray-600 hover:text-gray-800">Edit</button>
                  )}
                  {file.permissions.canDelete && (
                    <button className="text-red-600 hover:text-red-800">Delete</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Helper functions
  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'document': return '📝';
      case 'spreadsheet': return '📊';
      case 'image': return '🖼️';
      case 'presentation': return '📺';
      case 'folder': return '📁';
      default: return '📎';
    }
  };

  const getStatusColor = (status: FileItem['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {renderRoleHeader()}
      
      <div className="flex-1 flex overflow-hidden">
        {renderCategorySidebar()}
        
        <div className="flex-1 overflow-auto">
          {/* Upload progress */}
          {isUploading && (
            <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Uploading files...</span>
                <span className="text-sm text-blue-600">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Selected files actions */}
          {selectedFiles.length > 0 && (
            <div className="bg-gray-100 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50">
                  Download
                </button>
                <button className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50">
                  Share
                </button>
                {userRole === 'lender' && (
                  <>
                    <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                      Approve
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* File display */}
          {viewMode === 'grid' ? renderFileGrid() : renderFileList()}
          
          {/* Empty state */}
          {filteredFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium">No documents found</p>
              <p className="text-sm mt-1">Upload files to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileLockDriveEnhanced;