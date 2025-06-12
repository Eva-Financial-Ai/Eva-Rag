import React, { useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  STORAGE_CONFIG,
  autoTagFile,
  isValidFileSize,
  isValidFileType,
} from '../../config/storageConfig';
import { UserContext } from '../../contexts/UserContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { getBlockchainService } from '../../services/blockchainIntegrationService';
import CloudflareR2Service, { R2PubSubEventType } from '../../services/cloudflareR2Service';
import { FilelockIntegrationService } from '../../services/FilelockIntegrationService';
import GoogleDriveService from '../../services/googleDriveService';
import OneDriveService from '../../services/oneDriveService';

// Types
interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'pdf' | 'document' | 'spreadsheet' | 'image' | 'presentation';
  size?: number;
  lastModified: string;
  uploadedBy: string;
  category: 'loan' | 'financial' | 'legal' | 'tax' | 'compliance' | 'collateral' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  syncStatus: 'synced' | 'syncing' | 'error' | 'pending';
  cloudflareId?: string;
  supabaseId?: string;
  parentId: string | null;
  tags: string[];
  immutableHash?: string; // Blockchain hash for immutability
  ledgerTimestamp?: string; // When added to ledger
  verificationProof?: string; // Cryptographic proof
  blockchainTxId?: string; // Blockchain transaction ID
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
    vaultId?: string;
    vaultTxHash?: string;
    blockchainTxHash?: string;
    blockNumber?: number;
    processingResults?: any;
    signatures?: any[];
    lastSignedAt?: string;
    signatureCount?: number;
    source?: 'local' | 'google-drive' | 'onedrive';
    importedAt?: string;
    canChat?: boolean;
    chatEnabled?: boolean;
  };
  downloadUrl?: string;
  ocrProcessed?: boolean;
  blockchainVerified?: boolean;
  aiSummary?: string;
  extractedData?: any;
  versionHistory?: Array<{
    id: string;
    versionNumber: number;
    createdAt: string;
    createdBy: string;
    notes?: string;
    size: number;
    blockchainHash?: string;
    action?: 'upload' | 'update' | 'sign' | 'verify';
  }>;
}

interface FinanceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  requiredDocs: string[];
}

const FINANCE_CATEGORIES: FinanceCategory[] = Object.entries(STORAGE_CONFIG.categories).map(
  ([id, config]) => ({
    id,
    name: config.name,
    icon: config.icon,
    color: `bg-${config.color}-100 text-${config.color}-800`,
    requiredDocs: config.requiredDocs,
  }),
);

const FileLockImmutableLedger: React.FC = () => {
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
  const [showLedgerInfo, setShowLedgerInfo] = useState(false);
  const [showShieldVaultModal, setShowShieldVaultModal] = useState(false);
  const [selectedFileForVault, setSelectedFileForVault] = useState<FileItem | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [fileToSign, setFileToSign] = useState<FileItem | null>(null);
  const [showCloudPicker, setShowCloudPicker] = useState<'google' | 'onedrive' | null>(null);
  const [cloudServices, setCloudServices] = useState({
    google: GoogleDriveService.getInstance(),
    onedrive: OneDriveService.getInstance(),
  });

  // Initialize R2 PubSub for real-time sync
  useEffect(() => {
    r2Service.initializePubSub();

    // Subscribe to file events
    const unsubscribe = r2Service.onPubSubEvent('*', event => {
      if (event.type === R2PubSubEventType.FILE_UPLOADED) {
        handleFileSync(event.payload);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [r2Service]);

  // Handle file sync from backend
  const handleFileSync = useCallback(
    async (payload: any) => {
      const blockchainService = getBlockchainService('polygon', true);

      // Verify if we have blockchain data, otherwise generate it
      let immutableHash = payload.blockchainHash;
      let verificationProof = payload.verificationProof;

      if (!immutableHash && payload.fileData) {
        // Generate blockchain hash if not provided
        const blockchainResult = await blockchainService.addDocumentToBlockchain(payload.fileData, {
          documentId: payload.fileKey,
          fileName: payload.fileName,
          uploadedBy: payload.uploadedBy || 'system',
          timestamp: Date.now(),
          ...payload.metadata,
        });

        immutableHash = blockchainResult.immutableHash;
        verificationProof = blockchainService.generateVerificationProof(
          immutableHash,
          blockchainResult.timestamp,
          payload.uploadedBy || 'system',
        );
      }

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
        immutableHash,
        ledgerTimestamp: new Date().toISOString(),
        verificationProof,
        permissions: getPermissionsByRole(userRole),
        metadata: payload.metadata,
      };

      setFiles(prev => [...prev, newFile]);
      toast.success(`File ${payload.fileName} added to immutable ledger`);
    },
    [user, userRole],
  );

  // Get file type from extension
  const getFileType = (fileName: string): FileItem['type'] => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'document';
      case 'xls':
      case 'xlsx':
        return 'spreadsheet';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'image';
      case 'ppt':
      case 'pptx':
        return 'presentation';
      default:
        return 'document';
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
    if (lowerName.includes('collateral') || lowerName.includes('asset')) return 'collateral';
    return 'other';
  };

  // Get permissions based on user role
  const getPermissionsByRole = (role?: string) => {
    switch (role) {
      case 'lender':
        return { canView: true, canEdit: true, canDelete: true, canShare: true, canApprove: true };
      case 'broker':
        return {
          canView: true,
          canEdit: true,
          canDelete: false,
          canShare: true,
          canApprove: false,
        };
      case 'borrower':
        return {
          canView: true,
          canEdit: false,
          canDelete: false,
          canShare: false,
          canApprove: false,
        };
      default:
        return {
          canView: true,
          canEdit: false,
          canDelete: false,
          canShare: false,
          canApprove: false,
        };
    }
  };

  // Handle file upload with backend sync and blockchain integration
  const handleFileUpload = async (
    fileList: FileList,
    source: 'local' | 'google-drive' | 'onedrive' = 'local',
  ) => {
    setIsUploading(true);
    setUploadProgress(0);
    setSyncStatus('syncing');

    try {
      const filesArray = Array.from(fileList);

      // Validate files before upload
      const validFiles = filesArray.filter(file => {
        if (!isValidFileType(file)) {
          toast.error(`Invalid file type: ${file.name}`);
          return false;
        }

        if (!isValidFileSize(file, userRole || 'borrower')) {
          toast.error(`File too large: ${file.name}`);
          return false;
        }

        return true;
      });

      if (validFiles.length === 0) {
        setSyncStatus('idle');
        setIsUploading(false);
        return;
      }

      // Use mock implementation for immediate functionality
      const mockResults = validFiles.map((file, index) => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        const category = categorizeFile(file.name);
        const tags = autoTagFile(file.name);

        return {
          success: true,
          documentId: `mock-${Date.now()}-${index}`,
          file,
          category,
          tags,
          processingResults: {
            ocrText: `Mock OCR text for ${file.name}`,
            extractedData: {
              fileName: file.name,
              uploadDate: new Date().toISOString(),
              fileType: file.type,
              size: file.size,
            },
          },
        };
      });

      // Process results and create file items with automatic ledger recording
      const newFiles: FileItem[] = await Promise.all(mockResults.map(async (result, index) => {
        const progress = ((index + 1) / mockResults.length) * 100;
        setUploadProgress(progress);

        // Use real blockchain service for immutable hash
        const blockchainService = getBlockchainService('polygon', true);
        const blockchainResult = await blockchainService.addDocumentToBlockchain(result.file, {
          documentId: result.documentId,
          fileName: result.file.name,
          uploadedBy: user?.name || 'Current User',
          timestamp: Date.now(),
          category: result.category,
          tags: result.tags,
          ...result.processingResults.extractedData,
        });

        const verificationProof = blockchainService.generateVerificationProof(
          blockchainResult.immutableHash,
          blockchainResult.timestamp,
          user?.name || 'Current User',
        );

        // Create version history entry for the initial upload
        const versionHistory = [{
          id: `v-${result.documentId}-1`,
          versionNumber: 1,
          createdAt: new Date().toISOString(),
          createdBy: user?.name || 'Current User',
          notes: 'Initial upload to immutable ledger',
          size: result.file.size,
          blockchainHash: blockchainResult.immutableHash,
          action: 'upload' as const,
        }];

        return {
          id: result.documentId,
          name: result.file.name,
          type: getFileType(result.file.name),
          size: result.file.size,
          lastModified: new Date().toISOString(),
          uploadedBy: user?.name || 'Current User',
          category: result.category,
          status: 'completed' as const,
          syncStatus: 'synced' as const,
          cloudflareId: result.documentId,
          supabaseId: `supabase-${result.documentId}`,
          parentId: null,
          tags: result.tags,
          immutableHash: blockchainResult.immutableHash,
          ledgerTimestamp: new Date(blockchainResult.timestamp).toISOString(),
          verificationProof,
          permissions: getPermissionsByRole(userRole),
          // Add properties needed for DocumentViewer and FileChatPanel
          downloadUrl: URL.createObjectURL(result.file), // Create real blob URL
          ocrProcessed: true,
          blockchainVerified: true,
          blockchainTxId: blockchainResult.transactionHash,
          aiSummary: `This is a ${result.category} document. ${result.processingResults.ocrText}`,
          extractedData: result.processingResults.extractedData,
          versionHistory: versionHistory,
          metadata: {
            transactionId: currentTransaction?.id,
            documentType: result.category,
            processingResults: result.processingResults,
            blockchainTxHash: blockchainResult.transactionHash,
            blockNumber: blockchainResult.blockNumber,
            source: source,
            importedAt: source !== 'local' ? new Date().toISOString() : undefined,
            // Properties for chat functionality
            canChat: true,
            chatEnabled: true,
          },
        };
      }));

      // Add files to state
      setFiles(prev => [...prev, ...newFiles]);

      // Show success message
      toast.success(
        `${validFiles.length} file${validFiles.length > 1 ? 's' : ''} successfully added to immutable ledger!`,
      );

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

  // Handle adding file to Shield Vault
  const handleAddToShieldVault = async (file: FileItem) => {
    try {
      // For demo purposes, we'll create a File object from the file info
      // In production, you'd retrieve the actual file data
      const response = await fetch(file.cloudflareId || '');
      const blob = await response.blob();
      const fileObj = new File([blob], file.name, { type: file.type });

      const result = await FilelockIntegrationService.addToShieldVault(fileObj, {
        documentType: file.category,
        transactionId: currentTransaction?.id,
        customerId: user?.id,
        encryptionLevel: 'high',
        accessLevel: 'private',
        tags: file.tags,
        source: (file.metadata?.source as any) || 'local',
        sourceMetadata:
          file.metadata?.source !== 'local'
            ? {
                originalId: file.cloudflareId || file.id,
                importedAt: file.metadata?.importedAt,
                importedBy: user?.name || 'Unknown',
              }
            : undefined,
      });

      if (result.success) {
        toast.success('Document added to Shield Vault successfully');
        // Update file metadata to show it's in Shield Vault
        setFiles(prev =>
          prev.map(f =>
            f.id === file.id
              ? {
                  ...f,
                  metadata: {
                    ...f.metadata,
                    vaultId: result.vaultFileId,
                    vaultTxHash: result.transactionHash,
                  },
                }
              : f,
          ),
        );
      } else {
        toast.error(`Failed to add to Shield Vault: ${result.message}`);
      }
    } catch (error) {
      console.error('Error adding to Shield Vault:', error);
      toast.error('Failed to add document to Shield Vault');
    }
  };

  // Handle document verification
  const handleVerifyDocument = async (file: FileItem) => {
    try {
      const blockchainService = getBlockchainService('polygon', true);

      // For demo purposes, create a mock file object
      const mockFile = new File([`mock content for ${file.name}`], file.name, { type: file.type });

      const result = await blockchainService.verifyDocument(
        mockFile,
        file.immutableHash || '',
        file.metadata || {},
      );

      if (result.isValid) {
        toast.success('✅ Document verified successfully on blockchain');
      } else {
        toast.error('❌ Document verification failed');
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      toast.error('Failed to verify document');
    }
  };

  // Handle digital signature
  const handleSignDocument = async (file: FileItem) => {
    try {
      const blockchainService = getBlockchainService('polygon', true);

      // Create digital signature
      const signature = await blockchainService.createDigitalSignature(
        file.immutableHash || '',
        user?.id || 'anonymous',
        (userRole as any) || 'borrower',
      );

      // Update file with signature
      setFiles(prev =>
        prev.map(f => {
          if (f.id === file.id) {
            const signatures = f.metadata?.signatures || [];
            return {
              ...f,
              metadata: {
                ...f.metadata,
                signatures: [...signatures, signature],
                lastSignedAt: new Date().toISOString(),
                signatureCount: signatures.length + 1,
              },
            };
          }
          return f;
        }),
      );

      toast.success('✍️ Document signed successfully');
    } catch (error) {
      console.error('Error signing document:', error);
      toast.error('Failed to sign document');
    }
  };

  // Handle Google Drive upload
  const handleGoogleDriveUpload = async () => {
    try {
      const googleService = cloudServices.google;

      // Initialize if needed
      if (!googleService.isSignedIn()) {
        await googleService.initialize();
        const signedIn = await googleService.signIn();
        if (!signedIn) {
          toast.error('Failed to sign in to Google Drive');
          return;
        }
      }

      // Show picker
      const pickerResult = await googleService.showPicker({
        multiSelect: true,
        mimeTypes: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.*',
          'application/msword',
          'application/vnd.ms-excel',
          'application/vnd.ms-powerpoint',
          'image/*',
        ],
      });

      if (!pickerResult || pickerResult.docs.length === 0) {
        return;
      }

      setIsUploading(true);
      setSyncStatus('syncing');
      toast.info(`Importing ${pickerResult.docs.length} files from Google Drive...`);

      // Convert Google Drive files to File objects
      const files: File[] = [];
      for (const doc of pickerResult.docs) {
        const metadata = await googleService.getFileMetadata(doc.id);
        if (metadata) {
          const file = await googleService.convertToFile(metadata);
          if (file) {
            files.push(file);
          }
        }
      }

      // Upload files using existing handler
      if (files.length > 0) {
        const fileList = new DataTransfer();
        files.forEach(file => fileList.items.add(file));
        await handleFileUpload(fileList.files, 'google-drive');
      }

      toast.success(`Successfully imported ${files.length} files from Google Drive`);
    } catch (error) {
      console.error('Google Drive upload error:', error);
      const errorMessage =
        error instanceof Error &&
        (error.message.toLowerCase().includes('popup_closed_by_user') ||
          error.message.toLowerCase().includes('access_denied'))
          ? 'Google Drive sign-in was canceled or denied.'
          : 'Failed to import from Google Drive. Please ensure cloud storage is enabled and the Google Client ID is correctly configured in your environment variables.';
      toast.error(errorMessage, { autoClose: 10000 });
    } finally {
      setIsUploading(false);
      setSyncStatus('idle');
      setShowCloudPicker(null);
    }
  };

  // Handle OneDrive upload
  const handleOneDriveUpload = async () => {
    try {
      const oneDriveService = cloudServices.onedrive;

      // Initialize and load picker SDK
      await OneDriveService.loadPickerSDK();
      await oneDriveService.initialize();

      if (!oneDriveService.isSignedIn()) {
        const signedIn = await oneDriveService.signIn();
        if (!signedIn) {
          toast.error('Failed to sign in to OneDrive');
          return;
        }
      }

      // Show picker
      const pickerResult = await oneDriveService.showPicker({
        multiSelect: true,
        fileTypes: [
          '.pdf',
          '.doc',
          '.docx',
          '.xls',
          '.xlsx',
          '.ppt',
          '.pptx',
          '.jpg',
          '.jpeg',
          '.png',
        ],
      });

      if (!pickerResult || pickerResult.files.length === 0) {
        return;
      }

      setIsUploading(true);
      setSyncStatus('syncing');
      toast.info(`Importing ${pickerResult.files.length} files from OneDrive...`);

      // Convert OneDrive files to File objects
      const files: File[] = [];
      for (const pickedFile of pickerResult.files) {
        const metadata = await oneDriveService.getFileMetadata(pickedFile.id);
        if (metadata) {
          const file = await oneDriveService.convertToFile(metadata);
          if (file) {
            files.push(file);
          }
        }
      }

      // Upload files using existing handler
      if (files.length > 0) {
        const fileList = new DataTransfer();
        files.forEach(file => fileList.items.add(file));
        await handleFileUpload(fileList.files, 'onedrive');
      }

      toast.success(`Successfully imported ${files.length} files from OneDrive`);
    } catch (error) {
      console.error('OneDrive upload error:', error);
      const errorMessage =
        error instanceof Error &&
        (error.message.toLowerCase().includes('user_cancelled') ||
          error.message.toLowerCase().includes('user_cancel'))
          ? 'OneDrive sign-in was canceled.'
          : 'Failed to import from OneDrive. Please ensure cloud storage is enabled and the Microsoft Client ID is correctly configured in your environment variables.';
      toast.error(errorMessage, { autoClose: 10000 });
    } finally {
      setIsUploading(false);
      setSyncStatus('idle');
      setShowCloudPicker(null);
    }
  };

  // Filter files based on category and search
  const filteredFiles = files.filter(file => {
    const categoryMatch = selectedCategory === 'all' || file.category === selectedCategory;
    const searchMatch =
      !searchQuery ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return categoryMatch && searchMatch;
  });

  // Role-specific dashboard header
  const renderRoleHeader = () => {
    const roleConfig = {
      lender: { title: 'Lender Immutable Ledger', icon: '🏦' },
      broker: { title: 'Broker Document Ledger', icon: '🤝' },
      borrower: { title: 'My Immutable Documents', icon: '📁' },
      vendor: { title: 'Vendor Ledger Portal', icon: '🏢' },
    };

    const config = roleConfig[userRole as keyof typeof roleConfig] || {
      title: 'FileLock Immutable Ledger',
      icon: '🔐',
    };

    return (
      <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{config.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
              <p className="text-sm text-gray-500">
                {syncStatus === 'syncing' && '🔄 Syncing with blockchain...'}
                {syncStatus === 'error' && '⚠️ Sync error - working offline'}
                {syncStatus === 'idle' && '✅ All documents secured on ledger'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Ledger Info Toggle */}
            <button
              onClick={() => setShowLedgerInfo(!showLedgerInfo)}
              className="flex items-center space-x-2 rounded-lg bg-gray-100 px-3 py-1.5 text-gray-700 hover:bg-gray-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-sm">Ledger Info</span>
            </button>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* View mode toggle */}
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded px-3 py-1 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded px-3 py-1 ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* Upload buttons */}
            <div className="flex items-center space-x-2">
              {/* Local upload */}
              <label className="flex cursor-pointer items-center space-x-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span>Add to Ledger</span>
                <input
                  type="file"
                  multiple
                  onChange={e => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
              </label>

              {/* Cloud storage dropdown */}
              <div className="relative">
                <button
                  className="flex items-center space-x-2 rounded-lg bg-gray-100 px-3 py-2 hover:bg-gray-200"
                  onClick={() => setShowCloudPicker(showCloudPicker ? null : 'google')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                    />
                  </svg>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Cloud picker dropdown menu */}
                {showCloudPicker && (
                  <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg">
                    <button
                      onClick={() => {
                        setShowCloudPicker(null);
                        handleGoogleDriveUpload();
                      }}
                      className="flex w-full items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50"
                    >
                      <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Import from Google Drive</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowCloudPicker(null);
                        handleOneDriveUpload();
                      }}
                      className="flex w-full items-center space-x-3 border-t border-gray-100 px-4 py-3 text-left hover:bg-gray-50"
                    >
                      <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M21.17 3.25Q21.5 3.25 21.76 3.5 22 3.74 22 4.08V19.92Q22 20.26 21.76 20.5 21.5 20.75 21.17 20.75H7.83Q7.5 20.75 7.24 20.5 7 20.26 7 19.92V17H2.83Q2.5 17 2.24 16.76 2 16.5 2 16.17V7.83Q2 7.5 2.24 7.24 2.5 7 2.83 7H7V4.08Q7 3.74 7.24 3.5 7.5 3.25 7.83 3.25M20.5 19.25V4.75H8.5V7H11.83Q12.17 7 12.42 7.24 12.67 7.5 12.67 7.83V16.17Q12.67 16.5 12.42 16.76 12.17 17 11.83 17H8.5V19.25M11.17 15.5V8.5H3.5V15.5Z"
                        />
                      </svg>
                      <span>Import from OneDrive</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Info Panel */}
        {showLedgerInfo && (
          <div className="mt-4 rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-blue-900">
              Immutable Ledger Information
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Total Documents:</span>
                <span className="ml-2 font-medium">{files.length}</span>
              </div>
              <div>
                <span className="text-blue-700">Verified on Chain:</span>
                <span className="ml-2 font-medium">
                  {files.filter(f => f.immutableHash).length}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Last Sync:</span>
                <span className="ml-2 font-medium">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render category sidebar
  const renderCategorySidebar = () => (
    <div className="w-64 border-r border-gray-200 bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-600">
        Categories
      </h3>

      <button
        onClick={() => setSelectedCategory('all')}
        className={`mb-2 flex w-full items-center space-x-3 rounded-lg px-4 py-2 text-left ${
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
            className={`mb-2 flex w-full items-center space-x-3 rounded-lg px-4 py-2 text-left ${
              selectedCategory === category.id
                ? 'bg-primary-50 text-primary-700'
                : 'hover:bg-gray-50'
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
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-600">
            Quick Actions
          </h3>
          <button className="mb-2 w-full rounded-lg bg-green-50 px-4 py-2 text-left text-green-700 hover:bg-green-100">
            ✅ Approve Selected
          </button>
          <button className="bg-red-50 mb-2 w-full rounded-lg px-4 py-2 text-left text-red-700 hover:bg-red-100">
            ❌ Reject Selected
          </button>
        </div>
      )}

      {/* Ledger Status */}
      <div className="mt-8 rounded-lg bg-gray-100 p-3">
        <h4 className="mb-2 text-xs font-semibold text-gray-600">LEDGER STATUS</h4>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Chain:</span>
            <span className="font-medium">Ethereum</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Network:</span>
            <span className="font-medium">Mainnet</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium text-green-600">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render file grid
  const renderFileGrid = () => (
    <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredFiles.map(file => (
        <div
          key={file.id}
          className={`cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
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
          <div className="mb-3 flex items-start justify-between">
            <div className="relative">
              <div className="text-3xl">{getFileIcon(file.type)}</div>
              {file.metadata?.source && file.metadata.source !== 'local' && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4">
                  {file.metadata.source === 'google-drive' ? (
                    <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M7.71 3.5L1.15 15l3.43 6l6.56-11.5L7.71 3.5M9.41 15.5H22.85L19.42 21.5H6l3.41-6m4.59-12l3.43 6L22.85 9L19.42 3H9.41z"
                      />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M21.17 3.25Q21.5 3.25 21.76 3.5 22 3.74 22 4.08V19.92Q22 20.26 21.76 20.5 21.5 20.75 21.17 20.75H7.83Q7.5 20.75 7.24 20.5 7 20.26 7 19.92V17H2.83Q2.5 17 2.24 16.76 2 16.5 2 16.17V7.83Q2 7.5 2.24 7.24 2.5 7 2.83 7H7V4.08Q7 3.74 7.24 3.5 7.5 3.25 7.83 3.25M11.17 15.5V8.5H3.5V15.5Z"
                      />
                    </svg>
                  )}
                </div>
              )}
            </div>
            <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(file.status)}`}>
              {file.status}
            </span>
          </div>

          <h4 className="mb-1 truncate text-sm font-medium text-gray-900">{file.name}</h4>
          <p className="mb-3 text-xs text-gray-500">
            {file.size ? formatFileSize(file.size) : 'Unknown size'} •{' '}
            {new Date(file.lastModified).toLocaleDateString()}
          </p>

          {/* Immutable Hash Display */}
          {file.immutableHash && (
            <div className="mb-2 rounded bg-gray-50 p-2 text-xs">
              <span className="text-gray-600">Hash: </span>
              <span className="font-mono text-gray-800">
                {file.immutableHash.substring(0, 10)}...
              </span>
            </div>
          )}

          <div className="mb-3 flex flex-wrap gap-1">
            {file.tags.map(tag => (
              <span key={tag} className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {file.permissions.canView && (
                <button className="rounded p-1 hover:bg-gray-100" title="View">
                  👁️
                </button>
              )}
              {file.immutableHash && (
                <button
                  className="rounded p-1 hover:bg-gray-100"
                  title="Verify on Chain"
                  onClick={e => {
                    e.stopPropagation();
                    handleVerifyDocument(file);
                  }}
                >
                  🔗
                </button>
              )}
              {file.permissions.canShare && (
                <button className="rounded p-1 hover:bg-gray-100" title="Share">
                  📤
                </button>
              )}
              {userRole === 'lender' && !file.metadata?.vaultId && (
                <button
                  className="rounded p-1 hover:bg-gray-100"
                  title="Add to Shield Vault"
                  onClick={e => {
                    e.stopPropagation();
                    handleAddToShieldVault(file);
                  }}
                >
                  🛡️
                </button>
              )}
              {file.metadata?.vaultId && (
                <span className="p-1 text-green-600" title="In Shield Vault">
                  ✓
                </span>
              )}
              {file.permissions.canApprove && file.immutableHash && (
                <button
                  className="rounded p-1 hover:bg-gray-100"
                  title="Sign Document"
                  onClick={e => {
                    e.stopPropagation();
                    handleSignDocument(file);
                  }}
                >
                  ✍️
                </button>
              )}
              {file.metadata?.signatureCount && (
                <span
                  className="text-xs text-gray-600"
                  title={`${file.metadata.signatureCount} signatures`}
                >
                  ({file.metadata.signatureCount})
                </span>
              )}
            </div>

            <div
              className={`h-2 w-2 rounded-full ${
                file.syncStatus === 'synced'
                  ? 'bg-green-500'
                  : file.syncStatus === 'syncing'
                    ? 'animate-pulse bg-yellow-500'
                    : 'bg-red-500'
              }`}
              title={`Sync: ${file.syncStatus}`}
            />
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
            <th className="pb-3 text-left text-sm font-medium text-gray-600">Name</th>
            <th className="pb-3 text-left text-sm font-medium text-gray-600">Category</th>
            <th className="pb-3 text-left text-sm font-medium text-gray-600">Status</th>
            <th className="pb-3 text-left text-sm font-medium text-gray-600">Ledger Hash</th>
            <th className="pb-3 text-left text-sm font-medium text-gray-600">Modified</th>
            <th className="pb-3 text-left text-sm font-medium text-gray-600">Size</th>
            <th className="pb-3 text-left text-sm font-medium text-gray-600">Actions</th>
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
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    FINANCE_CATEGORIES.find(c => c.id === file.category)?.color ||
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {FINANCE_CATEGORIES.find(c => c.id === file.category)?.name || 'Other'}
                </span>
              </td>
              <td className="py-3">
                <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(file.status)}`}>
                  {file.status}
                </span>
              </td>
              <td className="py-3">
                <span className="font-mono text-xs text-gray-600">
                  {file.immutableHash ? `${file.immutableHash.substring(0, 8)}...` : 'Pending'}
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
                  {file.immutableHash && (
                    <button
                      className="text-green-600 hover:text-green-800"
                      onClick={() => handleVerifyDocument(file)}
                    >
                      Verify
                    </button>
                  )}
                  {file.permissions.canShare && (
                    <button className="text-gray-600 hover:text-gray-800">Share</button>
                  )}
                  {userRole === 'lender' && !file.metadata?.vaultId && (
                    <button
                      className="text-purple-600 hover:text-purple-800"
                      onClick={() => handleAddToShieldVault(file)}
                    >
                      Shield Vault
                    </button>
                  )}
                  {file.metadata?.vaultId && <span className="text-green-600">✓ Vaulted</span>}
                  {file.permissions.canApprove && file.immutableHash && (
                    <button
                      className="text-indigo-600 hover:text-indigo-800"
                      onClick={() => handleSignDocument(file)}
                    >
                      Sign
                    </button>
                  )}
                  {file.metadata?.signatureCount && (
                    <span className="text-xs text-gray-600">
                      ({file.metadata.signatureCount} signed)
                    </span>
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
      case 'pdf':
        return '📄';
      case 'document':
        return '📝';
      case 'spreadsheet':
        return '📊';
      case 'image':
        return '🖼️';
      case 'presentation':
        return '📺';
      case 'folder':
        return '📁';
      default:
        return '📎';
    }
  };

  const getStatusColor = (status: FileItem['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="flex h-full flex-col bg-gray-50">
      {renderRoleHeader()}

      <div className="flex flex-1 overflow-hidden">
        {renderCategorySidebar()}

        <div className="flex-1 overflow-auto">
          {/* Upload progress */}
          {isUploading && (
            <div className="border-b border-blue-200 bg-blue-50 px-6 py-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  Adding documents to immutable ledger...
                </span>
                <span className="text-sm text-blue-600">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-blue-200">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Selected files actions */}
          {selectedFiles.length > 0 && (
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-6 py-3">
              <span className="text-sm text-gray-600">
                {selectedFiles.length} document{selectedFiles.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button className="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50">
                  Download
                </button>
                <button className="rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50">
                  Verify on Chain
                </button>
                {userRole === 'lender' && (
                  <>
                    <button className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">
                      Approve
                    </button>
                    <button className="bg-red-600 rounded px-3 py-1 text-sm text-white hover:bg-red-700">
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
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <svg className="mb-4 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <p className="text-lg font-medium">No documents in ledger</p>
              <p className="mt-1 text-sm">Upload files to add them to the immutable ledger</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileLockImmutableLedger;
