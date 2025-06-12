import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import {
  CloudFile,
  mockCloudStorageService,
  MockCloudStorageService,
  UploadProgress,
} from '../../services/mockCloudStorageService';

interface CloudStorageManagerProps {
  onFileSelect?: (files: CloudFile[]) => void;
  allowMultiple?: boolean;
  acceptedTypes?: string[];
}

export const CloudStorageManager: React.FC<CloudStorageManagerProps> = ({
  onFileSelect,
  allowMultiple = true,
  acceptedTypes = [],
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ google: false, onedrive: false });
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<CloudFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProvider, setActiveProvider] = useState<'google' | 'onedrive' | 'all'>('all');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Utility function for formatting file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check connection status on mount
  useEffect(() => {
    const status = mockCloudStorageService.getConnectionStatus();
    setConnectionStatus(status);
    if (status.google || status.onedrive) {
      loadFiles();
    }
  }, []);

  // Subscribe to upload progress
  useEffect(() => {
    const unsubscribe = mockCloudStorageService.onUploadProgress(progress => {
      setUploadProgress(prev => {
        const existing = prev.find(p => p.fileId === progress.fileId);
        if (existing) {
          return prev.map(p => (p.fileId === progress.fileId ? progress : p));
        } else {
          return [...prev, progress];
        }
      });

      // Remove completed uploads after a delay
      if (progress.status === 'completed') {
        setTimeout(() => {
          setUploadProgress(prev => prev.filter(p => p.fileId !== progress.fileId));
          loadFiles(); // Refresh file list
        }, 2000);
      }
    });

    return unsubscribe;
  }, []);

  const connectToProvider = async (provider: 'google' | 'onedrive') => {
    setIsConnecting(true);
    setError(null);

    try {
      const result =
        provider === 'google'
          ? await mockCloudStorageService.connectGoogleDrive()
          : await mockCloudStorageService.connectOneDrive();

      if (result.success) {
        setConnectionStatus(prev => ({ ...prev, [provider]: true }));
        await loadFiles();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(`Failed to connect to ${provider}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allFiles: CloudFile[] = [];

      if (connectionStatus.google) {
        const googleFiles = await mockCloudStorageService.getGoogleDriveFiles();
        allFiles.push(...googleFiles);
      }

      if (connectionStatus.onedrive) {
        const oneDriveFiles = await mockCloudStorageService.getOneDriveFiles();
        allFiles.push(...oneDriveFiles);
      }

      setFiles(allFiles);
    } catch (err) {
      setError('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (
    uploadFiles: FileList | null,
    provider: 'google' | 'onedrive',
  ) => {
    if (!uploadFiles || !connectionStatus[provider]) return;

    const fileArray = Array.from(uploadFiles);

    // Filter by accepted types if specified
    const validFiles =
      acceptedTypes.length > 0
        ? fileArray.filter(file => acceptedTypes.some(type => file.type.includes(type)))
        : fileArray;

    if (validFiles.length === 0) {
      setError('No valid files selected');
      return;
    }

    try {
      await mockCloudStorageService.uploadToCloudStorage(validFiles, provider);
    } catch (err) {
      setError(`Failed to upload files to ${provider}`);
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = activeProvider === 'all' || file.provider === activeProvider;
    return matchesSearch && matchesProvider;
  });

  const toggleFileSelection = (file: CloudFile) => {
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.id === file.id);
      if (isSelected) {
        return prev.filter(f => f.id !== file.id);
      } else {
        return allowMultiple ? [...prev, file] : [file];
      }
    });
  };

  const handleSelectFiles = () => {
    if (onFileSelect && selectedFiles.length > 0) {
      onFileSelect(selectedFiles);
    }
  };

  const downloadFile = async (file: CloudFile) => {
    try {
      const blob = await mockCloudStorageService.downloadFile(file);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to download ${file.name}`);
    }
  };

  return (
    <div className="bg-white mx-auto max-w-6xl rounded-lg p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Cloud Storage Manager</h2>
        <p className="text-gray-600">Connect to your cloud storage and manage files</p>
      </div>

      {/* Connection Status */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CloudIcon className="h-6 w-6 text-blue-600" />
              <span className="font-medium">Google Drive</span>
              {connectionStatus.google && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
            </div>
            {!connectionStatus.google && (
              <button
                onClick={() => connectToProvider('google')}
                disabled={isConnecting}
                className="text-white rounded-md bg-blue-600 px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>
          {connectionStatus.google && (
            <div className="mb-3">
              <input
                type="file"
                multiple={allowMultiple}
                onChange={e => handleFileUpload(e.target.files, 'google')}
                className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          )}
        </div>

        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CloudIcon className="h-6 w-6 text-purple-600" />
              <span className="font-medium">OneDrive</span>
              {connectionStatus.onedrive && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
            </div>
            {!connectionStatus.onedrive && (
              <button
                onClick={() => connectToProvider('onedrive')}
                disabled={isConnecting}
                className="text-white rounded-md bg-purple-600 px-4 py-2 hover:bg-purple-700 disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>
          {connectionStatus.onedrive && (
            <div className="mb-3">
              <input
                type="file"
                multiple={allowMultiple}
                onChange={e => handleFileUpload(e.target.files, 'onedrive')}
                className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-purple-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="mb-6 space-y-2">
          <h3 className="text-lg font-medium">Uploading Files</h3>
          {uploadProgress.map(progress => (
            <div key={progress.fileId} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{progress.fileName}</span>
                <span className="text-sm text-gray-500">{progress.progress}%</span>
              </div>
              <div className="bg-gray-200 h-2 w-full rounded-full">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress.status === 'completed'
                      ? 'bg-green-600'
                      : progress.status === 'error'
                        ? 'bg-red-600'
                        : 'bg-blue-600'
                  }`}
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search and Filter */}
      {(connectionStatus.google || connectionStatus.onedrive) && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={activeProvider}
            onChange={e => setActiveProvider(e.target.value as 'google' | 'onedrive' | 'all')}
            className="rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Providers</option>
            <option value="google">Google Drive</option>
            <option value="onedrive">OneDrive</option>
          </select>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 mb-6 rounded-md border border-red-200 p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Files Grid */}
      {(connectionStatus.google || connectionStatus.onedrive) && (
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">Files ({filteredFiles.length})</h3>
            <button
              onClick={loadFiles}
              disabled={isLoading}
              className="bg-gray-100 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              {isLoading ? 'Loading files...' : 'No files found'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFiles.map(file => (
                <div
                  key={file.id}
                  className={`cursor-pointer rounded-lg border p-4 transition-all ${
                    selectedFiles.some(f => f.id === file.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleFileSelection(file)}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {'📄'}
                      </span>
                      <div className="bg-gray-100 rounded-full px-2 py-1 text-xs">
                        {file.provider}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedFiles.some(f => f.id === file.id)}
                      onChange={() => toggleFileSelection(file)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <h4 className="mb-2 line-clamp-2 font-medium text-gray-900">{file.name}</h4>

                  <div className="mb-3 text-xs text-gray-500">
                    <div>{`${(file.size / 1024 / 1024).toFixed(2)} MB`}</div>
                    <div>{new Date(file.modifiedTime).toLocaleDateString()}</div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        downloadFile(file);
                      }}
                      className="bg-gray-100 flex flex-1 items-center justify-center space-x-1 rounded px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-200"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selection Actions */}
      {selectedFiles.length > 0 && onFileSelect && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </span>
            <div className="space-x-2">
              <button
                onClick={() => setSelectedFiles([])}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Clear Selection
              </button>
              <button
                onClick={handleSelectFiles}
                className="text-white rounded-md bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700"
              >
                Use Selected Files
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
