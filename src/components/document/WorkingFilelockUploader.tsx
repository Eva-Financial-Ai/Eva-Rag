import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import DocumentViewer from './DocumentViewer';
import FileChatPanel from './FileChatPanel';
import { FileItem } from './FilelockDriveApp';

import { logBusinessProcess } from '../../utils/auditLogger';

// Add interface for FileItem with metadata
interface FileItemWithMetadata extends FileItem {
  metadata?: {
    extractedData?: any;
    category?: string;
    immutableHash?: string;
  };
}

export const WorkingFilelockUploader: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = useCallback(async (fileList: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const filesArray = Array.from(fileList);
      const validFiles = filesArray.filter(file => {
        // Basic validation
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          toast.error(`File ${file.name} is too large (max 10MB)`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        setIsUploading(false);
        return;
      }

      // Process files with mock blockchain integration
      const newFiles: FileItem[] = validFiles.map((file, index) => {
        const progress = ((index + 1) / validFiles.length) * 100;
        setUploadProgress(progress);

        // Determine file type
        let type = 'document';
        if (file.type.includes('pdf')) type = 'pdf';
        else if (file.type.includes('image')) type = 'image';
        else if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx'))
          type = 'spreadsheet';

        // Categorize file
        let category = 'other';
        if (file.name.toLowerCase().includes('loan')) category = 'loan';
        else if (file.name.toLowerCase().includes('financial')) category = 'financial';
        else if (file.name.toLowerCase().includes('tax')) category = 'tax';
        else if (file.name.toLowerCase().includes('legal')) category = 'legal';

        // Create mock blockchain data
        const immutableHash = `0x${Math.random().toString(16).substr(2, 64)}`;
        const timestamp = Date.now();
        const verificationProof = `verification-${timestamp}-${index}`;

        return {
          id: `file-${timestamp}-${index}`,
          name: file.name,
          type,
          size: file.size,
          lastModified: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          path: `/uploads/${file.name}`,
          parentId: 'root',
          owner: 'Current User',
          uploadedBy: 'Current User',
          category,
          status: 'completed' as const,
          downloadUrl: URL.createObjectURL(file),
          ocrProcessed: false,
          blockchainVerified: false,
          aiSummary: `This is a ${category} document named "${file.name}". It has been uploaded and is pending processing.`,
          extractedData: {
            fileName: file.name,
            fileType: file.type,
            uploadDate: new Date().toISOString(),
            size: file.size,
            category,
            mockData: `Extracted data from ${file.name}`,
          },
          immutableHash,
          ledgerTimestamp: new Date(timestamp).toISOString(),
          verificationProof,
          metadata: {
            canChat: true,
            chatEnabled: true,
            processingComplete: true,
            blockchainVerified: true,
          },
        };
      });

      // Add files to state
      setFiles(prev => [...prev, ...newFiles]);

      // Show success message
      toast.success(
        `${validFiles.length} file${validFiles.length > 1 ? 's' : ''} successfully added to immutable ledger!`,
      );

      setUploadProgress(100);

      // Reset progress after delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
    setShowViewer(true);
  };

  const handleChatWithFile = (file: FileItem) => {
    setSelectedFile(file);
    setShowChat(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'image':
        return '🖼️';
      case 'spreadsheet':
        return '📊';
      default:
        return '📁';
    }
  };

  if (showViewer && selectedFile) {
    return (
      <div className="h-full">
        <DocumentViewer
          file={selectedFile}
          onBack={() => {
            setShowViewer(false);
            setSelectedFile(null);
          }}
          onEdit={() =>
            logBusinessProcess('file_management', 'edit_file', true, {
              fileName: selectedFile.name,
            })
          }
          onSign={() =>
            logBusinessProcess('file_management', 'sign_file', true, {
              fileName: selectedFile.name,
            })
          }
          onShare={() =>
            logBusinessProcess('file_management', 'share_file', true, {
              fileName: selectedFile.name,
            })
          }
          onDelete={() => {
            setFiles(prev => prev.filter(f => f.id !== selectedFile.id));
            setShowViewer(false);
            setSelectedFile(null);
            toast.success('File deleted from ledger');
          }}
          onDownload={() => {
            const link = document.createElement('a');
            link.href = selectedFile.downloadUrl;
            link.download = selectedFile.name;
            link.click();
          }}
          onChatWithFile={() => handleChatWithFile(selectedFile)}
          onUpdateFile={updatedFile => {
            setFiles(prev => prev.map(f => (f.id === updatedFile.id ? updatedFile : f)));
            setSelectedFile(updatedFile);
          }}
        />
      </div>
    );
  }

  if (showChat && selectedFile) {
    return (
      <div className="flex h-full">
        <div className="w-1/2 border-r">
          <DocumentViewer
            file={selectedFile}
            onBack={() => {
              setShowChat(false);
              setSelectedFile(null);
            }}
            onEdit={() =>
              logBusinessProcess('file_management', 'edit_file', true, {
                fileName: selectedFile.name,
              })
            }
            onSign={() =>
              logBusinessProcess('file_management', 'sign_file', true, {
                fileName: selectedFile.name,
              })
            }
            onShare={() =>
              logBusinessProcess('file_management', 'share_file', true, {
                fileName: selectedFile.name,
              })
            }
            onDelete={() => {
              setFiles(prev => prev.filter(f => f.id !== selectedFile.id));
              setShowChat(false);
              setSelectedFile(null);
              toast.success('File deleted from ledger');
            }}
            onDownload={() => {
              const link = document.createElement('a');
              link.href = selectedFile.downloadUrl;
              link.download = selectedFile.name;
              link.click();
            }}
            onChatWithFile={() => handleChatWithFile(selectedFile)}
            onUpdateFile={updatedFile => {
              setFiles(prev => prev.map(f => (f.id === updatedFile.id ? updatedFile : f)));
              setSelectedFile(updatedFile);
            }}
          />
        </div>
        <div className="w-1/2">
          <FileChatPanel
            file={selectedFile}
            onClose={() => setShowChat(false)}
            documentData={{
              summary: selectedFile.aiSummary,
              extractedData: (selectedFile as FileItemWithMetadata).metadata?.extractedData || {},
              ocr: {
                isComplete: selectedFile.ocrProcessed,
                text: `OCR text content for ${selectedFile.name}`,
              },
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-white rounded-t-lg bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <h1 className="text-2xl font-bold">Filelock Drive - Immutable Document Ledger</h1>
          <p className="mt-2 text-blue-100">
            Securely upload and manage documents with blockchain verification
          </p>
        </div>

        {/* Upload Section */}
        <div className="border-b p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Upload Documents</h2>
            <div className="text-sm text-gray-500">
              {files.length} document{files.length !== 1 ? 's' : ''} in ledger
            </div>
          </div>

          {/* Upload Area */}
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-gray-400">
            <div className="space-y-4">
              <div className="text-6xl">📄</div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Upload files to immutable ledger
                </h3>
                <p className="text-gray-500">Drag and drop files here or click to browse</p>
              </div>

              <label className="text-white inline-flex cursor-pointer items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium shadow-sm hover:bg-blue-700">
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Add to Ledger
                <input
                  type="file"
                  multiple
                  onChange={e => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
              </label>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mx-auto mt-4 max-w-md">
                <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                  <span>Uploading files...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="bg-gray-200 h-2 w-full rounded-full">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Files List */}
        <div className="p-6">
          {files.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <div className="mb-4 text-6xl">🔒</div>
              <h3 className="mb-2 text-lg font-medium">No documents in ledger</h3>
              <p>Upload files to add them to the immutable ledger</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">My Immutable Documents</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {files.map(file => (
                  <div
                    key={file.id}
                    className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                    onClick={() => handleFileSelect(file)}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getFileIcon(file.type)}</span>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-medium text-gray-900">
                            {file.name}
                          </h4>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {file.blockchainVerified && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Category:</span>{' '}
                        {(file as FileItemWithMetadata).metadata?.category || 'document'}
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Ledger Hash:</span>{' '}
                        {(file as FileItemWithMetadata).metadata?.immutableHash ||
                          'N/A'.substring(0, 20)}
                        ...
                      </div>
                      <div className="text-xs text-gray-500">
                        Added: {new Date(file.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleFileSelect(file);
                        }}
                        className="text-white flex-1 rounded bg-blue-600 px-3 py-1.5 text-xs hover:bg-blue-700"
                      >
                        View
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleChatWithFile(file);
                        }}
                        className="text-white flex-1 rounded bg-purple-600 px-3 py-1.5 text-xs hover:bg-purple-700"
                      >
                        Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
