import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FileItem as BaseFileItem } from '../components/document/FilelockDriveApp';
import PageLayout from '../components/layout/PageLayout';
import { useEVACustomerContext } from '../contexts/EVACustomerContext';
import { useWorkflow, WorkflowStage } from '../contexts/WorkflowContext';

import { logBusinessProcess } from '../utils/auditLogger';

// Import the existing components that were previously built
const DocumentViewer = React.lazy(() => import('../components/document/DocumentViewer'));
const FileChatPanel = React.lazy(() => import('../components/document/FileChatPanel'));

// Extended FileItem interface with metadata
interface FileItem extends BaseFileItem {
  metadata?: {
    customerId?: string;
    transactionId?: string;
    documentType?: string;
    uploadedBy?: string;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
    immutableHash?: string;
    verificationProof?: string;
    packageId?: string;
    customerName?: string;
    submissionStatus?: string;
    isRequired?: boolean;
  };
  extractedData?: Record<string, any>;
  customerId?: string;
}

interface FilePackage {
  id: string;
  name: string;
  description: string;
  customerId: string;
  customerName: string;
  transactionId: string;
  transactionType: string;
  files: FileItem[];
  status: 'draft' | 'ready' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  submittedAt?: string;
  submissionReference?: string;
}

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const { currentTransaction, advanceStage } = useWorkflow();
  const evaCustomerContext = useEVACustomerContext();
  const selectedCustomer = evaCustomerContext?.selectedCustomer;

  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [packages, setPackages] = useState<FilePackage[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentView, setCurrentView] = useState<'files' | 'packages' | 'submissions'>('files');
  const [_selectedPackage, setSelectedPackage] = useState<FilePackage | null>(null);
  const [_showPackageModal, _setShowPackageModal] = useState(false);

  // Load customer files on customer change
  useEffect(() => {
    if (selectedCustomer) {
      // In a real app, this would load files from an API
      logBusinessProcess('file_management', 'load_customer_files', true, {
        customerId: selectedCustomer.id,
      });
    }
  }, [selectedCustomer]);

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

  const handleFileUpload = useCallback(
    async (fileList: FileList) => {
      if (!selectedCustomer) {
        toast.error('Please select a customer before uploading files');
        return;
      }

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

        const newFiles: FileItem[] = validFiles.map((file, index) => {
          const progress = ((index + 1) / validFiles.length) * 100;
          setUploadProgress(progress);

          // Enhanced file categorization with document types
          let category = 'other';
          let documentType = 'general';
          let isRequired = false;

          const fileName = file.name.toLowerCase();
          if (fileName.includes('loan') || fileName.includes('application')) {
            category = 'loan';
            documentType = 'loan_application';
            isRequired = true;
          } else if (fileName.includes('financial') || fileName.includes('statement')) {
            category = 'financial';
            documentType = 'financial_statement';
            isRequired = true;
          } else if (
            fileName.includes('tax') ||
            fileName.includes('1040') ||
            fileName.includes('w2')
          ) {
            category = 'tax';
            documentType = 'tax_document';
            isRequired = true;
          } else if (fileName.includes('legal') || fileName.includes('contract')) {
            category = 'legal';
            documentType = 'legal_document';
          } else if (fileName.includes('bank') || fileName.includes('statement')) {
            category = 'financial';
            documentType = 'bank_statement';
            isRequired = true;
          }

          // Determine file type
          let type = 'document';
          if (file.type.includes('pdf')) type = 'pdf';
          else if (file.type.includes('image')) type = 'image';
          else if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx'))
            type = 'spreadsheet';

          // Create blockchain verification data
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
            downloadUrl: URL.createObjectURL(file as Blob),
            ocrProcessed: true,
            blockchainVerified: true,
            aiSummary: `This is a ${category} document named "${file.name}". It has been successfully processed and added to the immutable ledger with blockchain verification.`,
            extractedData: {
              fileName: file.name,
              fileType: file.type,
              uploadDate: new Date().toISOString(),
              size: file.size,
              category,
              documentType,
              mockData: `Extracted data from ${file.name}`,
            },
            immutableHash,
            ledgerTimestamp: new Date(timestamp).toISOString(),
            verificationProof,
            // Customer and transaction association
            customerId: selectedCustomer.id,
            customerName: selectedCustomer.display_name,
            transactionId: currentTransaction?.id,
            transactionType: currentTransaction?.type || 'loan_application',
            submissionStatus: 'draft' as const,
            metadata: {
              canChat: true,
              chatEnabled: true,
              isRequired,
              documentType,
              processingComplete: true,
              blockchainVerified: true,
            },
          };
        });

        setFiles(prev => [...prev, ...newFiles]);
        toast.success(
          `${validFiles.length} file${validFiles.length > 1 ? 's' : ''} uploaded and associated with ${selectedCustomer.display_name}!`,
        );

        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 2000);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload files. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [selectedCustomer, currentTransaction],
  );

  const createFilePackage = useCallback(() => {
    if (!selectedCustomer || !currentTransaction) {
      toast.error('Please ensure a customer and transaction are selected');
      return;
    }

    const customerFiles = files.filter(file => file.metadata?.customerId === selectedCustomer.id);
    if (customerFiles.length === 0) {
      toast.error('No files available for this customer to package');
      return;
    }

    const newPackage: FilePackage = {
      id: `package-${Date.now()}`,
      name: `${selectedCustomer.display_name} - ${currentTransaction.type} Package`,
      description: `Document package for ${selectedCustomer.display_name} ${currentTransaction.type}`,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.display_name,
      transactionId: currentTransaction.id,
      transactionType: currentTransaction.type,
      files: customerFiles,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    setPackages(prev => [...prev, newPackage]);

    // Update file status to packaged
    setFiles(prev =>
      prev.map(file =>
        customerFiles.includes(file)
          ? { ...file, packageId: newPackage.id, submissionStatus: 'packaged' as const }
          : file,
      ),
    );

    toast.success(`Package created with ${customerFiles.length} files`);
    setCurrentView('packages');
  }, [selectedCustomer, currentTransaction, files]);

  const submitPackageToLender = useCallback(async (packageItem: FilePackage) => {
    setIsLoading(true);

    try {
      // Mock API call to FileLock submission API
      const submissionData = {
        packageId: packageItem.id,
        customerId: packageItem.customerId,
        transactionId: packageItem.transactionId,
        files: packageItem.files.map(file => ({
          fileId: file.id,
          fileName: file.name,
          immutableHash: file.metadata?.immutableHash || "N/A",
          verificationProof: file.metadata?.verificationProof || "N/A",
          documentType: file.metadata?.documentType || "Document",
          blockchainVerified: file.blockchainVerified,
        })),
        submissionMetadata: {
          customerName: packageItem.customerName,
          transactionType: packageItem.transactionType,
          totalFiles: packageItem.files.length,
          submittedAt: new Date().toISOString(),
        },
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const submissionReference = `SUB-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Update package status
      setPackages(prev =>
        prev.map(pkg =>
          pkg.id === packageItem.id
            ? {
                ...pkg,
                status: 'submitted' as const,
                submittedAt: new Date().toISOString(),
                submissionReference,
              }
            : pkg,
        ),
      );

      // Update file status
      setFiles(prev =>
        prev.map(file =>
          file.metadata?.packageId === packageItem.id
            ? { ...file, submissionStatus: 'submitted' as const }
            : file,
        ),
      );

      toast.success(`Package submitted successfully! Reference: ${submissionReference}`);

      logBusinessProcess('file_management', 'submit_package', true, { submissionData });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit package. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'ready':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'draft':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            onChatWithFile={() => {
              setShowViewer(false);
              setShowChat(true);
            }}
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
        {/* Customer/Transaction Info Bar */}
        {selectedCustomer && (
          <div className="mb-4 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  📋 Customer: {selectedCustomer.display_name}
                </h3>
                {currentTransaction && (
                  <p className="text-sm text-gray-600">
                    💼 Transaction: {currentTransaction.type} ({currentTransaction.id})
                  </p>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {files.filter(f => f.customerId === selectedCustomer.id).length} files
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['files', 'packages', 'submissions'].map(tab => (
              <button
                key={tab}
                onClick={() => setCurrentView(tab as 'files' | 'packages' | 'submissions')}
                className={`border-b-2 px-1 py-2 text-sm font-medium capitalize ${
                  currentView === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab}
                {tab === 'files' && ` (${files.length})`}
                {tab === 'packages' && ` (${packages.length})`}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white overflow-hidden rounded-lg shadow">
          {/* Header */}
          <div className="text-white bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
            <h1 className="text-2xl font-bold">
              {currentView === 'files' && '📄 File Management'}
              {currentView === 'packages' && '📦 Submission Packages'}
              {currentView === 'submissions' && '🚀 Lender Submissions'}
            </h1>
            <p className="mt-2 text-blue-100">
              {currentView === 'files' &&
                'Upload and manage customer documents with blockchain verification'}
              {currentView === 'packages' && 'Create file packages for lender submissions'}
              {currentView === 'submissions' && 'Track submission status and lender responses'}
            </p>
          </div>

          {/* Files View */}
          {currentView === 'files' && (
            <>
              {/* Upload Section */}
              <div className="border-b p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Upload Documents</h2>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={createFilePackage}
                      disabled={
                        !selectedCustomer ||
                        files.filter(f => f.customerId === selectedCustomer?.id).length === 0
                      }
                      className="text-white rounded-md bg-green-600 px-4 py-2 text-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      📦 Create Package
                    </button>
                    <div className="text-sm text-gray-500">
                      {files.length} document{files.length !== 1 ? 's' : ''} in ledger
                    </div>
                  </div>
                </div>

                {!selectedCustomer && (
                  <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-4">
                    <p className="text-yellow-800">⚠️ Please select a customer to upload files</p>
                  </div>
                )}

                <div
                  className={`rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-gray-400 ${!selectedCustomer ? 'opacity-50' : ''}`}
                >
                  <div className="space-y-4">
                    <div className="text-6xl">📄</div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Upload files to immutable ledger
                      </h3>
                      <p className="text-gray-500">Drag and drop files here or click to browse</p>
                      {selectedCustomer && (
                        <p className="mt-1 text-sm text-blue-600">
                          Files will be associated with {selectedCustomer.display_name}
                        </p>
                      )}
                    </div>

                    <label
                      className={`text-white inline-flex cursor-pointer items-center rounded-md border border-transparent px-6 py-3 text-base font-medium shadow-sm ${selectedCustomer ? 'bg-blue-600 hover:bg-blue-700' : 'cursor-not-allowed bg-gray-400'}`}
                    >
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
                        disabled={!selectedCustomer}
                      />
                    </label>
                  </div>

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
                    <h3 className="text-lg font-medium text-gray-900">Customer Documents</h3>
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
                                <p className="text-xs text-blue-600">{file.metadata?.customerName || "Unknown"}</p>
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(file.metadata?.submissionStatus || "draft")}`}
                            >
                              {file.metadata?.submissionStatus || "draft"}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Type:</span>{' '}
                              {file.metadata?.documentType || "Document"}
                              {file.metadata?.isRequired || false && <span className="text-red-500"> *</span>}
                            </div>
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Hash:</span>{' '}
                              {file.metadata?.immutableHash || "N/A".substring(0, 20)}...
                            </div>
                            <div className="text-xs text-gray-500">
                              Added: {new Date(file.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="mt-3 flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedFile(file);
                                setShowViewer(true);
                              }}
                              className="text-white flex-1 rounded bg-blue-600 px-3 py-1.5 text-xs hover:bg-blue-700"
                            >
                              View
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFile(file);
                                setShowChat(true);
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
            </>
          )}

          {/* Packages View */}
          {currentView === 'packages' && (
            <div className="p-6">
              {packages.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <div className="mb-4 text-6xl">📦</div>
                  <h3 className="mb-2 text-lg font-medium">No packages created</h3>
                  <p>Create file packages for lender submissions from the Files tab</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Submission Packages</h3>
                  <div className="grid grid-cols-1 gap-6">
                    {packages.map(pkg => (
                      <div
                        key={pkg.id}
                        className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{pkg.name}</h4>
                            <p className="text-sm text-gray-600">{pkg.description}</p>
                            <p className="mt-1 text-xs text-gray-500">
                              Created: {new Date(pkg.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(pkg.status)}`}
                          >
                            {pkg.status}
                          </span>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Files:</span> {pkg.files.length}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {pkg.files.slice(0, 5).map(file => (
                              <span
                                key={file.id}
                                className="bg-gray-100 inline-flex items-center rounded-md px-2 py-1 text-xs text-gray-700"
                              >
                                {getFileIcon(file.type)} {file.name}
                              </span>
                            ))}
                            {pkg.files.length > 5 && (
                              <span className="text-xs text-gray-500">
                                +{pkg.files.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>

                        {pkg.submissionReference && (
                          <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3">
                            <p className="text-sm text-blue-800">
                              <span className="font-medium">Submission Reference:</span>{' '}
                              {pkg.submissionReference}
                            </p>
                            {pkg.submittedAt && (
                              <p className="text-xs text-blue-600">
                                Submitted: {new Date(pkg.submittedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex space-x-3">
                          <button
                            onClick={() => setSelectedPackage(pkg)}
                            className="text-white rounded-md bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700"
                          >
                            📋 View Details
                          </button>
                          {pkg.status === 'draft' || pkg.status === 'ready' ? (
                            <button
                              onClick={() => submitPackageToLender(pkg)}
                              disabled={isLoading}
                              className="text-white rounded-md bg-green-600 px-4 py-2 text-sm hover:bg-green-700 disabled:bg-gray-400"
                            >
                              {isLoading ? '⏳ Submitting...' : '🚀 Submit to Lender'}
                            </button>
                          ) : (
                            <span className="px-4 py-2 text-sm text-gray-500">
                              {pkg.status === 'submitted' && '✅ Submitted'}
                              {pkg.status === 'approved' && '✅ Approved'}
                              {pkg.status === 'rejected' && '❌ Rejected'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submissions View */}
          {currentView === 'submissions' && (
            <div className="p-6">
              <div className="py-12 text-center text-gray-500">
                <div className="mb-4 text-6xl">🚀</div>
                <h3 className="mb-2 text-lg font-medium">Submission Tracking</h3>
                <p>Track the status of your lender submissions here</p>
                <p className="mt-2 text-sm">
                  Submitted packages: {packages.filter(p => p.status === 'submitted').length}
                </p>
              </div>
            </div>
          )}
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
        </div>
      </div>
    </PageLayout>
  );
};

export default Documents;
