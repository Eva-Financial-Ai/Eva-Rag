import React, { useState, useCallback, useEffect } from 'react';
import {
  ApplicationType,
  DocumentRequirement,
  DocumentRequirementsService,
} from '../../services/DocumentRequirements';
import { CloudIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useR2Integration } from '../../hooks/useR2Integration';

import { debugLog } from '../../utils/auditLogger';

interface DocumentRequirementsListProps {
  applicationType: ApplicationType;
  onDocumentStatusChange?: (requirements: DocumentRequirement[]) => void;
  applicationId?: string;
}

const DocumentRequirementsList: React.FC<DocumentRequirementsListProps> = ({
  applicationType,
  onDocumentStatusChange,
  applicationId = `APP-${Date.now()}`,
}) => {
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [uploadedFiles, setUploadedFiles] = useState<Map<string, { name: string; size: number; type: string; url: string }>>(new Map());

  // R2 Integration for document uploads with sync to filelock
  const {
    isConnected,
    isInitializing,
    uploadFile,
    syncDocument,
    getSyncedDocuments,
    uploadProgress,
    error: r2Error,
    clearError: clearR2Error
  } = useR2Integration({
    applicationId,
    documentType: 'credit_application',
    autoSync: true,
    enableCache: true
  });

  useEffect(() => {
    try {
      const reqs = DocumentRequirementsService.getRequiredDocuments(applicationType);
      
      // Check for synced documents from filelock
      const syncedDocs = getSyncedDocuments();
      
      // Update requirements with synced documents
      const updatedReqs = reqs.map(req => {
        const syncedDoc = syncedDocs.find(doc => 
          doc.metadata?.documentType === req.name || 
          doc.metadata?.category === req.category
        );
        
        if (syncedDoc) {
          // Store file metadata
          setUploadedFiles(prev => {
            const newMap = new Map(prev);
            newMap.set(req.id, {
              name: syncedDoc.fileName,
              size: syncedDoc.fileSize,
              type: syncedDoc.fileType,
              url: syncedDoc.fileUrl,
            });
            return newMap;
          });
          
          return {
            ...req,
            status: 'uploaded' as const,
            uploadedFileId: syncedDoc.fileKey,
          };
        }
        
        return req;
      });
      
      setRequirements(updatedReqs);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requirements');
      setIsLoading(false);
    }
  }, [applicationType, getSyncedDocuments]);

  useEffect(() => {
    if (onDocumentStatusChange) {
      onDocumentStatusChange(requirements);
    }
  }, [requirements, onDocumentStatusChange]);

  const handleFileUpload = useCallback(async (
    requirementId: string,
    file: File
  ) => {
    const requirement = requirements.find(r => r.id === requirementId);
    if (!requirement) return;

    // Add to uploading set
    setUploadingFiles(prev => new Set(prev).add(requirementId));

    try {
      // Clear any previous errors
      clearR2Error();
      setError(null);

      // Upload file with R2 integration
      const result = await uploadFile(file, {
        documentType: requirement.name,
        category: requirement.category,
        isRequired: requirement.required,
        applicationId,
        uploadedAt: new Date().toISOString(),
      });

      if (result.success) {
        // Store file metadata
        setUploadedFiles(prev => {
          const newMap = new Map(prev);
          newMap.set(requirementId, {
            name: file.name,
            size: file.size,
            type: file.type,
            url: result.fileUrl,
          });
          return newMap;
        });
        
        // Update requirement status
        setRequirements(prevReqs =>
          prevReqs.map(req =>
            req.id === requirementId
              ? {
                  ...req,
                  status: 'uploaded' as const,
                  uploadedFileId: result.fileKey,
                }
              : req
          )
        );

        // Sync to filelock automatically happens through PubSub
        debugLog('general', 'log_statement', '[DocumentRequirements] File uploaded and synced:', {
          file: file.name,
          fileKey: result.fileKey,
          ragIndexed: result.ragIndexed,
        })
      } else {
        throw new Error(result.errorMessage || 'Upload failed');
      }
    } catch (err) {
      console.error('[DocumentRequirements] Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      // Remove from uploading set
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(requirementId);
        return newSet;
      });
    }
  }, [requirements, uploadFile, clearR2Error, applicationId]);

  const handleFileRemove = useCallback((requirementId: string) => {
    // Remove from uploaded files map
    setUploadedFiles(prev => {
      const newMap = new Map(prev);
      newMap.delete(requirementId);
      return newMap;
    });
    
    // Update requirement status
    setRequirements(prevReqs =>
      prevReqs.map(req =>
        req.id === requirementId
          ? { ...req, status: 'pending' as const, uploadedFileId: undefined }
          : req
      )
    );
  }, []);

  const getStatusIcon = (status: DocumentRequirement['status']) => {
    switch (status) {
      case 'uploaded':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'verified':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'pending':
      default:
        return <CloudIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'financial_statements': 'Financial Statements',
      'tax_returns': 'Tax Returns',
      'bank_statements': 'Bank Statements',
      'legal_documents': 'Legal Documents',
      'business_documents': 'Business Documents',
      'collateral_documents': 'Collateral Documents',
      'personal_documents': 'Personal Documents',
      'application': 'Application Documents',
      'financial': 'Financial Documents',
      'collateral': 'Collateral Documents',
      'entity': 'Entity Documents',
      'tax': 'Tax Documents',
      'other': 'Other Documents',
    };
    return labels[category] || category;
  };

  if (isLoading || isInitializing) {
  return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isInitializing ? 'Connecting to document sync service...' : 'Loading document requirements...'}
          </p>
        </div>
            </div>
    );
  }

  if (error || r2Error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <XCircleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error || r2Error}</p>
          </div>
        </div>
      </div>
    );
  }

  const groupedRequirements = requirements.reduce((acc, req) => {
    if (!acc[req.category]) {
      acc[req.category] = [];
    }
    acc[req.category].push(req);
    return acc;
  }, {} as Record<string, DocumentRequirement[]>);

  return (
    <div className="space-y-8">
      {/* R2 Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-sm text-yellow-800">
            Document sync service is connecting. Documents may not sync to FileLock automatically.
          </p>
        </div>
      )}

      {Object.entries(groupedRequirements).map(([category, categoryReqs]) => (
        <div key={category} className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{getCategoryLabel(category)}</h3>
      </div>

          <div className="divide-y divide-gray-200">
            {categoryReqs.map(req => {
              const isUploading = uploadingFiles.has(req.id);
              const uploadedFile = uploadedFiles.get(req.id);
              const uploadProgressValue = uploadedFile ? (uploadProgress.get(uploadedFile.name) || 0) : 0;
              
              return (
                <div key={req.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(req.status)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{req.name}</h4>
                        <p className="text-sm text-gray-500">{req.description}</p>
                        {req.uploadedFileId && uploadedFile && (
                          <p className="text-xs text-green-600 mt-1">
                            Uploaded: {uploadedFile.name} • Synced to FileLock
                          </p>
                    )}
                  </div>
                </div>
                    
                    <div className="flex items-center space-x-2">
                      {req.required && (
                        <span className="text-xs text-red-600 font-medium">Required</span>
                      )}
                      
                      {req.status === 'uploaded' ? (
                    <button
                          onClick={() => handleFileRemove(req.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                          disabled={isUploading}
                    >
                          Remove
                    </button>
                      ) : (
                        <label className="relative cursor-pointer">
                          <input
                            type="file"
                            className="sr-only"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(req.id, file);
                              }
                            }}
                            accept={req.fileTypes?.map(type => `.${type}`).join(',')}
                            disabled={isUploading}
                          />
                          <span className={`text-sm font-medium ${
                            isUploading 
                              ? 'text-gray-400' 
                              : 'text-blue-600 hover:text-blue-800'
                          }`}>
                            {isUploading ? `Uploading... ${uploadProgressValue}%` : 'Upload'}
                      </span>
                        </label>
                      )}
                    </div>
                  </div>
                  
                  {/* Upload Progress Bar */}
                  {isUploading && uploadProgressValue > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgressValue}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentRequirementsList;
