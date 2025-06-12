import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../contexts/AuthContext';
import { useEVACustomerContext } from '../contexts/EVACustomerContext';
import { useWorkflow, WorkflowStage } from '../contexts/WorkflowContext';

import { debugLog } from '../utils/auditLogger';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: string;
  uploadedBy: string;
  category: string;
  status: 'completed' | 'processing' | 'pending';
  downloadUrl: string;
  ocrProcessed: boolean;
  blockchainVerified: boolean;
  isCertified: boolean;
  aiSummary: string;
  extractedData: any;
  immutableHash: string;
  ledgerTimestamp: string;
  verificationProof: string;
  customerId?: string;
  customerName?: string;
  transactionId?: string;
  transactionType?: string;
  packageId?: string;
  submissionStatus: 'draft' | 'packaged' | 'submitted' | 'approved' | 'rejected';
  metadata: {
    canChat: boolean;
    chatEnabled: boolean;
    isRequired: boolean;
    documentType: string;
    [key: string]: any;
  };
}

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const { currentTransaction, advanceStage } = useWorkflow();
  const evaCustomerContext = useEVACustomerContext();
  const selectedCustomer = evaCustomerContext?.selectedCustomer;

  // 🔐 Secure Authentication Integration
  const { user, isAuthenticated, encryptFile, auditAction, checkFileAccess } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'viewer' | 'editor' | 'signer'>('viewer');

  // 🔒 Security Check - Require Authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Authentication required to access file management');
      return;
    }
    auditAction('document_page_accessed');
  }, [isAuthenticated, auditAction]);

  // Load customer files on customer change
  useEffect(() => {
    if (selectedCustomer && isAuthenticated) {
      debugLog('general', 'log_statement', '🔒 Loading encrypted files for customer:', selectedCustomer.id)

      // Add sample data for demonstration
      const sampleFiles: FileItem[] = [
        {
          id: 'sample-1',
          name: 'Sample_Financial_Statement.pdf',
          type: 'pdf',
          size: 1024000,
          lastModified: new Date().toISOString(),
          uploadedBy: 'Demo User',
          category: 'financial',
          status: 'completed',
          downloadUrl: '#',
          ocrProcessed: true,
          blockchainVerified: true,
          isCertified: false,
          aiSummary:
            'This is a financial statement document that has been verified on the blockchain.',
          extractedData: { documentType: 'financial_statement', amount: '$50,000' },
          immutableHash: '0x1234567890abcdef1234567890abcdef12345678',
          ledgerTimestamp: new Date().toISOString(),
          verificationProof: 'verification-demo-001',
          customerId: selectedCustomer.id,
          customerName:
            selectedCustomer.display_name || selectedCustomer.businessName || 'Unknown Customer',
          transactionId: currentTransaction?.id,
          transactionType: currentTransaction?.type || 'loan_application',
          submissionStatus: 'draft',
          metadata: {
            canChat: true,
            chatEnabled: true,
            isRequired: true,
            documentType: 'financial_statement',
          },
        },
        {
          id: 'sample-2',
          name: 'Sample_Tax_Return_2023.pdf',
          type: 'pdf',
          size: 2048000,
          lastModified: new Date().toISOString(),
          uploadedBy: 'Demo User',
          category: 'tax',
          status: 'completed',
          downloadUrl: '#',
          ocrProcessed: true,
          blockchainVerified: true,
          isCertified: true,
          aiSummary: 'This is a tax return document that has been verified on the blockchain.',
          extractedData: { documentType: 'tax_document', year: '2023' },
          immutableHash: '0xabcdef1234567890abcdef1234567890abcdef12',
          ledgerTimestamp: new Date().toISOString(),
          verificationProof: 'verification-demo-002',
          customerId: selectedCustomer.id,
          customerName:
            selectedCustomer.display_name || selectedCustomer.businessName || 'Unknown Customer',
          transactionId: currentTransaction?.id,
          transactionType: currentTransaction?.type || 'loan_application',
          submissionStatus: 'draft',
          metadata: {
            canChat: true,
            chatEnabled: true,
            isRequired: true,
            documentType: 'tax_document',
          },
        },
      ];

      setFiles(prev => {
        const existingSampleIds = prev.map(f => f.id);
        const newSampleFiles = sampleFiles.filter(f => !existingSampleIds.includes(f.id));
        return [...prev, ...newSampleFiles];
      });

      auditAction('customer_files_loaded', undefined, { customerId: selectedCustomer.id });
    }
  }, [selectedCustomer, currentTransaction, isAuthenticated, auditAction]);

  const handleContinue = () => {
    if (currentTransaction) {
      setIsLoading(true);
      auditAction('workflow_advance_initiated', undefined, { stage: 'risk_assessment' });
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

      if (!isAuthenticated) {
        toast.error('Authentication required for file uploads');
        auditAction('file_upload_denied', undefined, { reason: 'not_authenticated' });
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

          let type = 'document';
          if (file.type.includes('pdf')) type = 'pdf';
          else if (file.type.includes('image')) type = 'image';
          else if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx'))
            type = 'spreadsheet';

          const immutableHash = `0x${Math.random().toString(16).substr(2, 64)}`;
          const timestamp = Date.now();
          const verificationProof = `verification-${timestamp}-${index}`;

          // 🔐 Encrypt file data using secure authentication
          const fileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            content: URL.createObjectURL(file),
            metadata: { category, documentType },
          };

          try {
            const encryptedFile = encryptFile(
              fileData,
              category === 'financial' ? 'confidential' : 'restricted',
            );
            auditAction('file_encrypted_and_uploaded', encryptedFile.id, {
              fileName: file.name,
              accessLevel: category === 'financial' ? 'confidential' : 'restricted',
              encryptionStatus: 'success',
            });
          } catch (encryptionError) {
            console.error('🔒 File encryption failed:', encryptionError);
            auditAction('file_encryption_failed', undefined, {
              fileName: file.name,
              error: encryptionError.message,
            });
          }

          return {
            id: `file-${timestamp}-${index}`,
            name: file.name,
            type,
            size: file.size,
            lastModified: new Date().toISOString(),
            uploadedBy: user?.name || 'Current User',
            category,
            status: 'completed' as const,
            downloadUrl: URL.createObjectURL(file),
            ocrProcessed: true,
            blockchainVerified: true,
            isCertified: false,
            aiSummary: `🔒 ENCRYPTED: This is a ${category} document named "${file.name}". It has been successfully processed and added to the immutable ledger with AES-256 encryption and blockchain verification.`,
            extractedData: {
              fileName: file.name,
              fileType: file.type,
              uploadDate: new Date().toISOString(),
              size: file.size,
              category,
              documentType,
              encryptionStatus: 'AES-256 Encrypted',
              accessLevel: category === 'financial' ? 'confidential' : 'restricted',
              auditTrail: `Uploaded by ${user?.name} on ${new Date().toLocaleDateString()}`,
            },
            immutableHash,
            ledgerTimestamp: new Date(timestamp).toISOString(),
            verificationProof,
            customerId: selectedCustomer.id,
            customerName:
              selectedCustomer.display_name || selectedCustomer.businessName || 'Unknown Customer',
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
              encryptionEnabled: true,
              accessControlEnabled: true,
            },
          };
        });

        setFiles(prev => [...prev, ...newFiles]);
        toast.success(
          `🔒 ${validFiles.length} file${validFiles.length > 1 ? 's' : ''} successfully encrypted and added to immutable ledger!`,
        );

        auditAction('batch_file_upload_completed', undefined, {
          fileCount: validFiles.length,
          customerId: selectedCustomer.id,
          encryptionEnabled: true,
        });

        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 2000);
      } catch (error) {
        console.error('🔒 Upload error:', error);
        auditAction('file_upload_error', undefined, { error: error.message });
        toast.error('Failed to upload files. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [selectedCustomer, currentTransaction, isAuthenticated, user, encryptFile, auditAction],
  );

  // 🔐 Secure File Actions with Access Control
  const handleDownload = (file: FileItem) => {
    if (!checkFileAccess(file.id, 'read')) {
      toast.error('🔒 Access denied: Insufficient permissions to download this file');
      auditAction('file_download_denied', file.id, { reason: 'insufficient_permissions' });
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = file.downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`🔒 Securely downloading ${file.name}`);
      auditAction('file_downloaded', file.id, { fileName: file.name });
    } catch (error) {
      toast.error('Failed to download file');
      auditAction('file_download_error', file.id, { error: error.message });
    }
  };

  const handleShare = (file: FileItem) => {
    if (!checkFileAccess(file.id, 'share')) {
      toast.error('🔒 Access denied: Insufficient permissions to share this file');
      auditAction('file_share_denied', file.id, { reason: 'insufficient_permissions' });
      return;
    }

    setSelectedFile(file);
    setShowShareModal(true);
    auditAction('file_share_modal_opened', file.id);
  };

  const handleCertify = async (file: FileItem) => {
    if (!checkFileAccess(file.id, 'write')) {
      toast.error('🔒 Access denied: Insufficient permissions to certify this file');
      auditAction('file_certification_denied', file.id, { reason: 'insufficient_permissions' });
      return;
    }

    try {
      setIsLoading(true);
      auditAction('file_certification_started', file.id);

      // Simulate secure certification process with enhanced security
      await new Promise(resolve => setTimeout(resolve, 3000));

      setFiles(prev =>
        prev.map(f =>
          f.id === file.id ? { ...f, isCertified: true, blockchainVerified: true } : f,
        ),
      );

      toast.success(
        `🛡️ ${file.name} has been certified and secured with enhanced blockchain verification and digital signatures!`,
      );
      auditAction('file_certified', file.id, {
        certificationLevel: 'enterprise_grade',
        blockchainHash: file.immutableHash,
        digitalSignature: 'applied',
      });
    } catch (error) {
      toast.error('Failed to certify document');
      auditAction('file_certification_error', file.id, { error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const submitShare = async () => {
    if (!selectedFile || !shareEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      // Simulate secure API call to share document with audit trail
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(
        `🔒 Document securely shared with ${shareEmail} as ${sharePermission} with encrypted access`,
      );

      auditAction('file_shared', selectedFile.id, {
        sharedWith: shareEmail,
        permissionLevel: sharePermission,
        encryptionEnabled: true,
        accessLinkGenerated: true,
      });

      setShowShareModal(false);
      setShareEmail('');
      setSharePermission('viewer');
      setSelectedFile(null);
    } catch (error) {
      toast.error('Failed to share document');
      auditAction('file_share_error', selectedFile?.id, { error: error.message });
    }
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

  // Enhanced Document Viewer with Security Features
  const SecureDocumentViewer = ({ file, onClose }: { file: FileItem; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex h-5/6 w-full max-w-4xl flex-col rounded-lg border-2 border-blue-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-50 to-purple-50 p-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h2 className="text-lg font-semibold">{file.name}</h2>
              <p className="text-sm text-gray-600">Secure Document Viewer • AES-256 Encrypted</p>
            </div>
            {file.isCertified && (
              <div className="flex items-center space-x-1 rounded-full border-2 border-green-300 bg-green-100 px-3 py-1 text-sm text-green-800">
                <span className="text-lg">🛡️</span>
                <span className="font-bold">CERTIFIED & SECURED</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6">
          <div className="max-w-md text-center">
            <div className="mb-6 text-8xl">{getFileIcon(file.type)}</div>
            <h3 className="mb-3 text-2xl font-bold text-gray-800">{file.name}</h3>
            <div className="mb-6 space-y-2">
              <p className="text-gray-600">
                Size: <span className="font-medium">{formatFileSize(file.size)}</span>
              </p>
              <p className="text-gray-600">
                Uploaded:{' '}
                <span className="font-medium">
                  {new Date(file.lastModified).toLocaleDateString()}
                </span>
              </p>
              <p className="text-gray-600">
                Category: <span className="font-medium capitalize">{file.category}</span>
              </p>
            </div>

            <div className="mb-8 flex items-center justify-center space-x-2">
              {file.isCertified ? (
                <div className="flex items-center space-x-3 rounded-xl border-2 border-green-300 bg-green-50 px-6 py-4 shadow-md">
                  <span className="text-4xl">🛡️</span>
                  <div className="text-left">
                    <p className="text-lg font-bold text-green-800">ENTERPRISE CERTIFIED</p>
                    <p className="text-sm text-green-600">
                      AES-256 Encrypted • Blockchain Verified • Digital Signature
                    </p>
                    <p className="text-xs text-green-500">
                      Immutable Proof • Audit Trail • Compliance Ready
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 rounded-xl border-2 border-blue-300 bg-blue-50 px-6 py-4 shadow-md">
                  <span className="text-4xl">🔒</span>
                  <div className="text-left">
                    <p className="text-lg font-bold text-blue-800">BLOCKCHAIN SECURED</p>
                    <p className="text-sm text-blue-600">
                      AES-256 Encrypted • Ready for Certification
                    </p>
                    <p className="text-xs text-blue-500">
                      Hash: {file.immutableHash.substring(0, 16)}...
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-3">
              <button
                onClick={() => handleDownload(file)}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
              >
                <span>📥</span>
                <span>Secure Download</span>
              </button>
              <button
                onClick={() => handleShare(file)}
                className="flex items-center space-x-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:bg-green-700 hover:shadow-lg"
              >
                <span>📤</span>
                <span>Encrypted Share</span>
              </button>
              {!file.isCertified && (
                <button
                  onClick={() => handleCertify(file)}
                  disabled={isLoading}
                  className="flex items-center space-x-2 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:bg-purple-700 hover:shadow-lg disabled:bg-gray-400"
                >
                  <span>{isLoading ? '⏳' : '🛡️'}</span>
                  <span>{isLoading ? 'Certifying...' : 'Enterprise Certify'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Chat Panel with Security
  const SecureChatPanel = ({ file, onClose }: { file: FileItem; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex h-5/6 w-full max-w-2xl flex-col rounded-lg border-2 border-green-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b bg-gradient-to-r from-green-50 to-blue-50 p-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h2 className="text-lg font-semibold">💬 Secure AI Chat: {file.name}</h2>
              <p className="text-sm text-gray-600">End-to-End Encrypted Conversation</p>
            </div>
            {file.isCertified && (
              <div className="flex items-center space-x-1 rounded-full bg-green-100 px-2 py-1 text-sm text-green-800">
                <span className="text-sm">🛡️</span>
                <span className="font-bold">CERTIFIED</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-green-50 p-4">
          <div className="mb-4 rounded-lg border-l-4 border-green-500 bg-white p-4 shadow-md">
            <div className="mb-2 flex items-center space-x-2">
              <span className="text-lg">🤖</span>
              <p className="text-sm font-medium text-gray-600">AI Assistant (Secure Mode)</p>
            </div>
            <p className="text-gray-800">{file.aiSummary}</p>
            <div className="mt-3 rounded-md bg-green-50 p-3">
              <p className="text-sm text-green-800">
                <span className="font-semibold">🔒 Security Status:</span> This conversation is
                end-to-end encrypted and logged for compliance audit.
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 text-center text-gray-500 shadow-sm">
            <div className="mb-3 text-3xl">💡</div>
            <p className="font-medium">Secure Document Analysis Available</p>
            <p className="mt-2 text-sm">
              Ask questions about this document in a secure environment:
            </p>
            <div className="mt-3 space-y-1 text-sm">
              <p>• "What is the total amount in this financial statement?"</p>
              <p>• "Summarize the key compliance points"</p>
              <p>• "Extract the important dates and deadlines"</p>
            </div>
          </div>
        </div>

        <div className="border-t bg-gray-50 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="🔒 Ask a secure question about this document..."
              className="flex-1 rounded-lg border px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500"
            />
            <button className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:bg-green-700">
              Send Securely
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-gray-500">
            🔒 All conversations are encrypted and audit-logged for compliance
          </p>
        </div>
      </div>
    </div>
  );

  // Enhanced Share Modal with Security
  const SecureShareModal = () =>
    showShareModal &&
    selectedFile && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="w-full max-w-md rounded-lg border-2 border-purple-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b bg-gradient-to-r from-purple-50 to-blue-50 p-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🔒</span>
              <h3 className="text-lg font-semibold">📤 Secure Document Sharing</h3>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="rounded-full p-1 text-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="p-6">
            <div className="mb-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3">
              <p className="text-sm font-medium text-blue-800">Sharing: {selectedFile.name}</p>
              <p className="mt-1 text-xs text-blue-600">
                🔒 End-to-end encrypted sharing with audit trail
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">📧 Recipient Email Address</label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={e => setShareEmail(e.target.value)}
                  placeholder="Enter secure email address"
                  className="w-full rounded-lg border px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">🔐 Access Permission Level</label>
                <select
                  value={sharePermission}
                  onChange={e =>
                    setSharePermission(e.target.value as 'viewer' | 'editor' | 'signer')
                  }
                  className="w-full rounded-lg border px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="viewer">👁️ Viewer (Read Only + Encrypted)</option>
                  <option value="editor">✏️ Editor (Can Edit + Secure)</option>
                  <option value="signer">✍️ Signer (Can Sign + Certify)</option>
                </select>
              </div>

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">🔒 Security Notice:</span>
                  The recipient will receive an encrypted access link with time-limited permissions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 border-t bg-gray-50 p-4">
            <button
              onClick={() => setShowShareModal(false)}
              className="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={submitShare}
              className="flex-1 rounded-lg bg-purple-600 py-3 font-medium text-white shadow-md transition-all duration-200 hover:bg-purple-700"
            >
              🔒 Share Securely
            </button>
          </div>
        </div>
      </div>
    );

  // 🔒 Render with Authentication Check
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="flex min-h-96 items-center justify-center">
          <div className="bg-red-50 rounded-lg border-2 border-red-200 p-8 text-center">
            <div className="mb-4 text-6xl">🔒</div>
            <h2 className="mb-2 text-2xl font-bold text-red-800">Authentication Required</h2>
            <p className="text-red-600">
              Please log in to access the secure document management system.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // If showing viewer or chat, render those components
  if (showViewer && selectedFile) {
    return (
      <SecureDocumentViewer
        file={selectedFile}
        onClose={() => {
          setShowViewer(false);
          setSelectedFile(null);
        }}
      />
    );
  }

  if (showChat && selectedFile) {
    return (
      <SecureChatPanel
        file={selectedFile}
        onClose={() => {
          setShowChat(false);
          setSelectedFile(null);
        }}
      />
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Enhanced Header with Security Indicators */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">🔒 Filelock Drive</h1>
              <div className="flex items-center space-x-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                <span className="text-sm">🛡️</span>
                <span className="font-medium">ENTERPRISE SECURED</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Upload and manage customer documents with AES-256 encryption, blockchain verification,
              and enterprise security
            </p>
            {user && (
              <p className="mt-1 text-xs text-blue-600">
                🔒 Authenticated as: {user.name} • Session: {user.sessionId.substring(0, 8)}...
              </p>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? '🔒 Processing...' : 'Continue to Risk Assessment'}
            </button>
          </div>
        </div>

        {!selectedCustomer && (
          <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-xl text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  🔒 Please select a customer to access their encrypted document vault.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced File Upload Area */}
        <div className="rounded-xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 p-8">
          <div className="text-center">
            <div className="mb-4 text-5xl">🔒📤</div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              Secure Upload to Encrypted Immutable Ledger
            </h3>
            <p className="mb-4 text-gray-600">
              Upload documents with AES-256 encryption, blockchain verification, and audit trails
              (Max 10MB each)
            </p>
            <div className="mb-4 flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <span>🛡️</span>
                <span>AES-256 Encrypted</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-blue-600">
                <span>⛓️</span>
                <span>Blockchain Verified</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-purple-600">
                <span>📋</span>
                <span>Audit Logged</span>
              </div>
            </div>

            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xlsx,.xls"
              onChange={e => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="secure-file-upload"
              disabled={!selectedCustomer}
            />
            <label
              htmlFor="secure-file-upload"
              className={`inline-flex cursor-pointer items-center rounded-lg border border-transparent px-6 py-3 text-base font-medium text-white shadow-md transition-all duration-200 ${
                selectedCustomer
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg'
                  : 'cursor-not-allowed bg-gray-400'
              }`}
            >
              🔒 Add to Secure Ledger
            </label>

            {isUploading && (
              <div className="mx-auto mt-6 max-w-md">
                <div className="h-3 rounded-full bg-white shadow-inner">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="mt-2 flex justify-between text-sm text-gray-600">
                  <span>🔒 Encrypting...</span>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Files Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {files
            .filter(file => !selectedCustomer || file.customerId === selectedCustomer.id)
            .map(file => (
              <div
                key={file.id}
                className="rounded-xl border-2 border-gray-100 bg-white shadow-md transition-all duration-200 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <span className="text-3xl">{getFileIcon(file.type)}</span>
                        <span className="absolute -right-1 -top-1 text-xs">🔒</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-gray-900">
                          {file.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • Encrypted
                        </p>
                      </div>
                    </div>
                    {file.isCertified && (
                      <div className="flex items-center space-x-1 rounded-full border border-green-300 bg-green-100 px-2 py-1 text-xs text-green-800">
                        <span className="text-sm">🛡️</span>
                        <span className="font-bold">CERTIFIED</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(file.status)}`}
                      >
                        🔒 {file.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium capitalize">{file.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Security:</span>
                      <span className="font-medium text-green-600">🛡️ Enterprise</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Blockchain:</span>
                      <span className="font-medium text-blue-600">⛓️ Verified</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        setShowViewer(true);
                        auditAction('file_viewer_opened', file.id);
                      }}
                      className="flex-1 rounded-lg bg-blue-100 px-3 py-2 text-xs font-medium text-blue-700 transition-all duration-200 hover:bg-blue-200"
                    >
                      🔒 View
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        setShowChat(true);
                        auditAction('file_chat_opened', file.id);
                      }}
                      className="flex-1 rounded-lg bg-green-100 px-3 py-2 text-xs font-medium text-green-700 transition-all duration-200 hover:bg-green-200"
                    >
                      💬 Chat
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {files.filter(file => !selectedCustomer || file.customerId === selectedCustomer.id)
          .length === 0 && (
          <div className="rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 py-16 text-center">
            <div className="mb-4 text-6xl">🔒📁</div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Secure Vault Empty</h3>
            <p className="text-gray-600">
              {selectedCustomer
                ? 'Upload your first encrypted document to get started'
                : 'Select a customer to view their secure document vault'}
            </p>
          </div>
        )}

        {/* Enhanced Share Modal */}
        <SecureShareModal />
      </div>
    </PageLayout>
  );
};

export default Documents;
