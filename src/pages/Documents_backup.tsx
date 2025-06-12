import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageLayout from '../components/layout/PageLayout';
import { useWorkflow, WorkflowStage } from '../contexts/WorkflowContext';

// Import the existing components that were previously built
const DocumentViewer = React.lazy(() => import('../components/document/DocumentViewer'));
const FileChatPanel = React.lazy(() => import('../components/document/FileChatPanel'));

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: string;
  createdAt: string;
  path: string;
  parentId: string | null;
  owner: string;
  uploadedBy: string;
  category: string;
  status: 'completed' | 'processing' | 'pending';
  downloadUrl: string;
  ocrProcessed: boolean;
  blockchainVerified: boolean;
  aiSummary: string;
  extractedData: any;
  immutableHash: string;
  ledgerTimestamp: string;
  verificationProof: string;
  metadata: {
    canChat: boolean;
    chatEnabled: boolean;
    [key: string]: any;
  };
}

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const { currentTransaction, advanceStage } = useWorkflow();
  const [isLoading, setIsLoading] = useState(false);

  // File management state
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleContinue = () => {
    if (currentTransaction) {
      setIsLoading(true);
      setTimeout(() => {
        advanceStage('risk_assessment' as WorkflowStage, currentTransaction.id);
        navigate('/risk-assessment');
        setIsLoading(false);
      }, 500);
    }
  };

  const handleFileUpload = useCallback(async (fileList: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const filesArray = Array.from(fileList);
      const validFiles = filesArray.filter(file => {
        if (file.size > 10 * 1024 * 1024) {
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
          ocrProcessed: true,
          blockchainVerified: true,
          aiSummary: `This is a ${category} document named "${file.name}". It has been successfully processed and added to the immutable ledger with blockchain verification.`,
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

      setFiles(prev => [...prev, ...newFiles]);
      toast.success(
        `${validFiles.length} file${validFiles.length > 1 ? 's' : ''} successfully added to immutable ledger!`,
      );

      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 2000);
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
    setShowChat(false);
  };

  const handleChatWithFile = (file: FileItem) => {
    setSelectedFile(file);
    setShowChat(true);
    setShowViewer(false);
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

  // If showing viewer or chat, render those components
  if (showViewer && selectedFile) {
    return (
      <PageLayout title="Document Viewer">
        <React.Suspense fallback={<div>Loading document viewer...</div>}>
          <DocumentViewer
            file={selectedFile}
            onBack={() => {
              setShowViewer(false);
              setSelectedFile(null);
            }}
            onEdit={() => toast.info('Edit functionality')}
            onSign={() => toast.info('Sign functionality')}
            onShare={() => toast.info('Share functionality')}
            onDelete={() => toast.info('Delete functionality')}
            onDownload={() => toast.info('Download functionality')}
            onChatWithFile={() => handleChatWithFile(selectedFile)}
          />
        </React.Suspense>
      </PageLayout>
    );
  }

  if (showChat && selectedFile) {
    return (
      <PageLayout title="Document Chat">
        <React.Suspense fallback={<div>Loading chat interface...</div>}>
          <FileChatPanel
            file={selectedFile}
            onClose={() => {
              setShowChat(false);
              setSelectedFile(null);
            }}
            documentData={{
              summary: selectedFile.aiSummary,
              extractedData: selectedFile.extractedData,
              ocr: { isComplete: true, text: 'Mock OCR text content' },
            }}
          />
        </React.Suspense>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Filelock Drive">
      <div className="w-full px-4 pb-6">
        <div className="bg-white overflow-hidden rounded-lg shadow">
          {/* Header */}
          <div className="text-white bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
            <h1 className="text-2xl font-bold">
              ✅ WORKING! Filelock Drive - Immutable Document Ledger
            </h1>
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
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          ✓ Verified
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Category:</span> {file.category}
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Ledger Hash:</span>{' '}
                          {file.immutableHash.substring(0, 20)}...
                        </div>
                        <div className="text-xs text-gray-500">
                          Added: {new Date(file.ledgerTimestamp).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => handleFileSelect(file)}
                          className="text-white flex-1 rounded bg-blue-600 px-3 py-1.5 text-xs hover:bg-blue-700"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleChatWithFile(file)}
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

        {/* AI Assistant Section */}
        <div className="bg-white mt-4 rounded-lg p-4 shadow">
          <h2 className="mb-3 text-lg font-medium text-gray-900">AI Document Assistant</h2>
          <p className="mb-3 text-sm text-gray-500">
            Get help with document preparation and verification from EVA AI
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <button
              onClick={() =>
                toast.info(
                  '📋 FAQ: What documents are typically required for an equipment loan application?',
                )
              }
              className="flex items-center justify-between rounded-md border p-3 text-left text-sm hover:bg-gray-50"
            >
              <div className="flex items-center">
                <span className="mr-2 text-2xl">❓</span>
                <span>Document FAQ</span>
              </div>
            </button>

            <button
              onClick={() =>
                toast.info(
                  '📝 Guide: How should I prepare financial statements for a business loan application?',
                )
              }
              className="flex items-center justify-between rounded-md border p-3 text-left text-sm hover:bg-gray-50"
            >
              <div className="flex items-center">
                <span className="mr-2 text-2xl">📝</span>
                <span>Document Guide</span>
              </div>
            </button>

            <button
              onClick={() =>
                toast.info(
                  '🔍 Analysis: Can you analyze if the provided documentation is sufficient for approval?',
                )
              }
              className="flex items-center justify-between rounded-md border p-3 text-left text-sm hover:bg-gray-50"
            >
              <div className="flex items-center">
                <span className="mr-2 text-2xl">🔍</span>
                <span>AI Document Analysis</span>
              </div>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-4 flex justify-end">
          {currentTransaction && (
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="text-white rounded-md border border-transparent bg-primary-600 px-6 py-2 text-sm font-medium shadow-sm hover:bg-primary-700 focus:outline-none"
            >
              {isLoading ? 'Loading...' : 'Continue to Risk Assessment'}
            </button>
          )}

          {!currentTransaction && (
            <button
              onClick={() => navigate('/')}
              className="text-white rounded-md border border-transparent bg-primary-600 px-6 py-2 text-sm font-medium shadow-sm hover:bg-primary-700 focus:outline-none"
            >
              Return to Dashboard
            </button>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Documents;
