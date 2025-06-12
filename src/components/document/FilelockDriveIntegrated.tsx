import React, { useState, useRef, useEffect } from 'react';
import FileExplorer from './FileExplorer';
import DocumentViewer from './DocumentViewer';
import { FileItem } from './FilelockDriveApp';
import ShareDocumentModal from './ShareDocumentModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileAlt,
  faFolder,
} from '@fortawesome/free-solid-svg-icons';
import CloudStorageConnector from './CloudStorageConnector';
import { useEventPublisher, useEventSubscription } from '../../hooks/useEventBus';
import { fileLockEvents } from '../../services/EventBusService';

import { debugLog } from '../../utils/auditLogger';

// Mock implementation of toast from react-toastify
const toast = {
  success: (message: string) => {
    debugLog('general', 'log_statement', 'Toast success:', message)
    // In a real app, this would show a toast notification
  },
  error: (message: string) => {
    console.error('Toast error:', message);
    // In a real app, this would show an error toast
  },
  info: (message: string) => {
    console.info('Toast info:', message);
    // In a real app, this would show an info toast
  },
  warning: (message: string) => {
    console.warn('Toast warning:', message);
    // In a real app, this would show a warning toast
  },
};

// Helper function to get icon based on file type
const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return faFilePdf;
    case 'document':
    case 'docx':
    case 'doc':
      return faFileWord;
    case 'spreadsheet':
    case 'xlsx':
    case 'xls':
      return faFileExcel;
    case 'folder':
      return faFolder;
    default:
      return faFileAlt;
  }
};

interface FilelockDriveIntegratedProps {
  transactionId?: string;
  applicationId?: string;
}

const FilelockDriveIntegrated: React.FC<FilelockDriveIntegratedProps> = ({
  transactionId,
  applicationId
}) => {
  const { publish } = useEventPublisher();
  const [currentView, setCurrentView] = useState<'explorer' | 'viewer'>('explorer');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [isGridView, setIsGridView] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCloudStorageModal, setShowCloudStorageModal] = useState(false);

  // Sample files data
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: 'file-1',
      name: 'Loan Application.pdf',
      type: 'pdf',
      size: 1542000, // 1.5MB
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      path: '/Loan Application.pdf',
      parentId: 'root',
      owner: 'me',
      thumbnailIcon: getFileIcon('pdf'),
      downloadUrl: '/sample-documents/loan-application.html',
      permissions: {
        canView: true,
        canEdit: true,
        canDelete: true,
        canShare: true,
        canDownload: true,
        canComment: true,
      },
    },
    {
      id: 'folder-1',
      name: 'Personal Documents',
      type: 'folder',
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      path: '/Personal Documents',
      parentId: 'root',
      owner: 'me',
      thumbnailIcon: getFileIcon('folder'),
      permissions: {
        canView: true,
        canEdit: true,
        canDelete: true,
        canShare: true,
        canDownload: true,
        canComment: true,
      },
    },
  ]);

  // Subscribe to document request events
  useEventSubscription(
    ['filelock:documents-requested', 'deal-structuring:term-sheet-generated'],
    async (payload) => {
      if (payload.filelock?.transactionId === transactionId || 
          payload.filelock?.applicationId === applicationId) {
        debugLog('general', 'log_statement', 'Document request received:', payload.filelock);
        
        // Show notification about requested documents
        toast.info(`Document requested: ${payload.filelock.documentType || 'Unknown'}`);
      }
      
      // If term sheet was generated, add it to files
      if (payload.dealStructuring?.termSheet) {
        const termSheet: FileItem = {
          id: payload.dealStructuring.termSheet.id,
          name: `Term_Sheet_${payload.dealStructuring.transactionId}.pdf`,
          type: 'pdf',
          size: 1024000, // 1MB estimated
          lastModified: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          path: `/Term_Sheet_${payload.dealStructuring.transactionId}.pdf`,
          parentId: 'root',
          owner: 'system',
          thumbnailIcon: getFileIcon('pdf'),
          downloadUrl: `/api/documents/download/${payload.dealStructuring.termSheet.id}`,
          transactionId: payload.dealStructuring.transactionId,
          permissions: {
            canView: true,
            canEdit: false,
            canDelete: false,
            canShare: true,
            canDownload: true,
            canComment: true,
          },
        };
        
        setFiles(prevFiles => [...prevFiles, termSheet]);
        toast.success('Term sheet has been added to your documents');
      }
    },
    [transactionId, applicationId]
  );

  // Handle file selection
  const handleFileSelect = (file: FileItem) => {
    if (file.type === 'folder') {
      // Navigate into folder (in a real app)
      debugLog('general', 'log_statement', 'Navigating into folder:', file.name)
    } else {
      setSelectedFile(file);
      setCurrentView('viewer');
    }
  };

  // Handle back to explorer
  const handleBackToExplorer = () => {
    setCurrentView('explorer');
    setSelectedFile(null);
  };

  // Handle share document
  const handleShareDocument = async (
    fileId: string,
    recipients: Array<{
      email: string;
      phoneNumber?: string;
      permission: string;
      needsPassword: boolean;
      notificationMethods: string[];
    }>
  ) => {
    debugLog('general', 'log_statement', 'Sharing document with ID:', fileId)
    debugLog('general', 'log_statement', 'With recipients:', recipients)

    // In a real implementation, this would make an API call to share the document

    // Update file to show it's shared
    const updatedFiles = files.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          isShared: true,
          sharedWith: recipients.map(r => ({
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: r.email.split('@')[0],
            email: r.email,
            permission: r.permission as 'viewer' | 'editor' | 'signer' | 'commenter',
            needsPassword: r.needsPassword,
          })),
        };
      }
      return file;
    });

    setFiles(updatedFiles);

    // Send notifications based on methods selected
    recipients.forEach(recipient => {
      recipient.notificationMethods.forEach(method => {
        switch (method) {
          case 'email':
            debugLog('general', 'log_statement', `Sending email notification to ${recipient.email}`)
            // In a real app, this would call an API endpoint to send an email
            break;
          case 'sms':
            if (recipient.phoneNumber) {
              debugLog('general', 'log_statement', `Sending SMS notification to ${recipient.phoneNumber}`)
              // In a real app, this would call an API endpoint to send an SMS
            }
            break;
          case 'app':
            debugLog('general', 'log_statement', `Sending in-app notification to user associated with ${recipient.email}`)
            // In a real app, this would store a notification in the database
            break;
        }
      });
    });

    // Display success message
    toast.success(
      `Document shared with ${recipients.length} recipient${recipients.length !== 1 ? 's' : ''}`
    );
    
    // Publish document shared event
    await fileLockEvents.shareDocument({
      documentId: fileId,
      documentName: files.find(f => f.id === fileId)?.name || 'Unknown',
      documentType: files.find(f => f.id === fileId)?.type || 'document',
      action: 'shared',
      transactionId: transactionId,
      applicationId: applicationId
    });
  };

  // Handle document actions from document viewer
  const handleEditDocument = () => {
    debugLog('general', 'log_statement', 'Edit document', selectedFile?.name)
    // Would open document editor in a real implementation
  };

  const handleSignDocument = () => {
    debugLog('general', 'log_statement', 'Sign document', selectedFile?.name)
    // Would open signature workflow in a real implementation
  };

  // Handle delete document
  const handleDeleteDocument = () => {
    if (selectedFile) {
      setFiles(prevFiles => prevFiles.filter(file => file.id !== selectedFile.id));
      setCurrentView('explorer');
      setSelectedFile(null);

      // Show success notification
      toast.success(`${selectedFile.name} deleted successfully`);
    }
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    const totalFiles = files.length;
    let uploadedCount = 0;
    
    try {
      // Convert FileList to array for easier processing
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        try {
          // Validate file before upload
          if (file.size === 0) {
            toast.error(`Cannot upload empty file: ${file.name}`);
            continue;
          }
          
          // Create FormData for upload
          const formData = new FormData();
          formData.append('file', file);
          formData.append('transactionId', `transaction-${Date.now()}`);
          formData.append('metadata', JSON.stringify({
            uploadedBy: 'current-user',
            uploadedAt: new Date().toISOString(),
            source: 'filelock-drive'
          }));
          
          // Make API call to upload file
          const response = await fetch('/api/documents/upload', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
          }
          
          const result = await response.json();
          
          // Create new file item with proper structure
          const newFile: FileItem = {
            id: result.documentId || `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: file.name,
            type: file.name.split('.').pop()?.toLowerCase() || 'document',
            size: file.size,
            lastModified: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            path: `/${file.name}`,
            parentId: 'root',
            owner: 'me',
            thumbnailIcon: getFileIcon(file.name.split('.').pop()?.toLowerCase() || 'document'),
            downloadUrl: `/api/documents/download/${result.documentId}`,
            transactionId: result.transactionId,
            permissions: {
              canView: true,
              canEdit: true,
              canDelete: true,
              canShare: true,
              canDownload: true,
              canComment: true,
            },
          };
          
          // Add the new file to the files array
          setFiles(prevFiles => [...prevFiles, newFile]);
          uploadedCount++;
          
          // Update progress
          const progress = Math.round((uploadedCount / totalFiles) * 100);
          setUploadProgress(progress);
          
          // Publish document uploaded event
          await fileLockEvents.uploadDocument({
            documentId: newFile.id,
            documentName: newFile.name,
            documentType: file.name.split('.').pop()?.toLowerCase() || 'document',
            action: 'uploaded',
            transactionId: transactionId,
            applicationId: applicationId
          });
          
        } catch (fileError) {
          console.error(`Failed to upload ${file.name}:`, fileError);
          toast.error(`Failed to upload ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
        }
      }
      
      if (uploadedCount > 0) {
        toast.success(`${uploadedCount} file${uploadedCount !== 1 ? 's' : ''} uploaded successfully`);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle folder creation
  const handleCreateFolder = (name: string) => {
    const newFolder: FileItem = {
      id: `folder-${Date.now()}`,
      name,
      type: 'folder',
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      path: `/${name}`,
      parentId: 'root',
      owner: 'me',
      thumbnailIcon: getFileIcon('folder'),
      permissions: {
        canView: true,
        canEdit: true,
        canDelete: true,
        canShare: true,
        canDownload: true,
        canComment: true,
      },
    };
    setFiles(prevFiles => [...prevFiles, newFolder]);

    // Show success notification
    toast.success(`Folder "${name}" created successfully`);
  };

  // Handle delete files
  const handleDeleteFiles = (fileIds: string[]) => {
    setFiles(prevFiles => prevFiles.filter(file => !fileIds.includes(file.id)));
    setSelectedFiles([]);

    // Show success notification
    toast.success(`${fileIds.length} item${fileIds.length !== 1 ? 's' : ''} deleted successfully`);
  };

  // Handle file download
  const handleDownloadFile = (file: FileItem) => {
    debugLog('general', 'log_statement', 'Downloading file:', file.name)

    // Create a download link
    const link = document.createElement('a');
    link.href = file.downloadUrl || '#';
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success notification
    toast.success(`Downloading ${file.name}`);
  };

  // Handle share button from document viewer
  const handleShareButton = () => {
    if (selectedFile) {
      setShowShareModal(true);
    }
  };

  // After handleFileUpload method, add the cloud file import handler
  const handleCloudFileImport = (importedFiles: FileItem[]) => {
    debugLog('general', 'log_statement', `Importing ${importedFiles.length} files from cloud storage`)

    // Create a copy of the files array to modify
    const updatedFiles = [...files];

    // Add the imported files
    importedFiles.forEach(file => {
      // Check if the file already exists (by name)
      const existingFileIndex = updatedFiles.findIndex(f => f.name === file.name);

      if (existingFileIndex !== -1) {
        // Replace the existing file
        updatedFiles[existingFileIndex] = {
          ...file,
          id: updatedFiles[existingFileIndex].id, // Preserve the original ID
        };
      } else {
        // Add as a new file
        updatedFiles.push({
          ...file,
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        });
      }
    });

    // Update state with new files
    setFiles(updatedFiles);

    // Show success message
    toast.success(
      `${importedFiles.length} file${importedFiles.length !== 1 ? 's' : ''} imported successfully!`
    );
  };

  return (
    <div className="h-full flex flex-col">
      {currentView === 'explorer' ? (
        <FileExplorer
          files={files}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          onFileSelect={handleFileSelect}
          onUpload={handleFileUpload}
          onCreateFolder={handleCreateFolder}
          onDelete={handleDeleteFiles}
          onShare={(fileId, recipients) => {
            const file = files.find(f => f.id === fileId);
            if (file) {
              setSelectedFile(file);
              setShowShareModal(true);
            }
          }}
          isGridView={isGridView}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onCloudFileImport={handleCloudFileImport}
        />
      ) : (
        selectedFile && (
          <DocumentViewer
            file={selectedFile}
            onBack={handleBackToExplorer}
            onEdit={handleEditDocument}
            onSign={handleSignDocument}
            onShare={handleShareButton}
            onDelete={handleDeleteDocument}
            onDownload={() => handleDownloadFile(selectedFile)}
            onUpdateFile={updatedFile => {
              // Update the file in our state
              setSelectedFile(updatedFile);
              // Also update the file in the files list
              const updatedFiles = files.map(f => (f.id === updatedFile.id ? updatedFile : f));
              setFiles(updatedFiles);
            }}
          />
        )
      )}

      {/* ShareDocumentModal */}
      {showShareModal && selectedFile && (
        <ShareDocumentModal
          file={selectedFile}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onShare={recipients => {
            handleShareDocument(selectedFile.id, recipients);
            setShowShareModal(false);
          }}
        />
      )}

      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={e => e.target.files && handleFileUpload(e.target.files)}
        multiple
      />

      {/* Add cloud storage modal */}
      {showCloudStorageModal && (
        <CloudStorageConnector
          files={files}
          currentFolder="root"
          onFileSelect={() => {}}
          onFileImport={handleCloudFileImport}
          onClose={() => setShowCloudStorageModal(false)}
        />
      )}
    </div>
  );
};

export default FilelockDriveIntegrated;
