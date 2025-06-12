import React, { useState, useCallback, useRef } from 'react';

interface DocumentUploadDropzoneProps {
  onUpload: (files: File[], transactionId?: string) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  transactionId?: string;
  className?: string;
}

interface UploadProgress {
  [key: string]: {
    progress: number;
    status: 'uploading' | 'processing' | 'completed' | 'error';
    error?: string;
  };
}

const DocumentUploadDropzone: React.FC<DocumentUploadDropzoneProps> = ({
  onUpload,
  acceptedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt'],
  maxFileSize = 50,
  transactionId,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  }, [acceptedTypes, maxFileSize]);

  const handleFiles = useCallback(async (files: FileList) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert(`Upload errors:\n${errors.join('\n')}`);
    }

    if (validFiles.length > 0) {
      setIsUploading(true);
      
      // Initialize progress tracking
      const newProgress: UploadProgress = {};
      validFiles.forEach(file => {
        newProgress[file.name] = {
          progress: 0,
          status: 'uploading'
        };
      });
      setUploadProgress(newProgress);

      try {
        // Process files one by one with simulated progress
        for (const file of validFiles) {
          await uploadFileWithProgress(file);
        }

        // Call the parent upload handler
        onUpload(validFiles, transactionId);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
        // Clear progress after 3 seconds
        setTimeout(() => setUploadProgress({}), 3000);
      }
    }
  }, [validateFile, onUpload, transactionId]);

  const uploadFileWithProgress = async (file: File): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: {
              progress: 100,
              status: 'processing'
            }
          }));

          // Simulate processing time
          setTimeout(() => {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: {
                progress: 100,
                status: 'completed'
              }
            }));
            resolve();
          }, 1000);
        } else {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: {
              progress,
              status: 'uploading'
            }
          }));
        }
      }, 200);
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return (
          <svg className="animate-spin w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'processing':
        return (
          <svg className="animate-pulse w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-primary-400 bg-primary-50'
            : isUploading
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isUploading ? triggerFileSelect : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.map(type => `.${type}`).join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">
            {isUploading ? (
              <svg className="animate-pulse w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            ) : (
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {isUploading ? 'Uploading documents...' : 'Upload Documents'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isUploading
                ? 'Please wait while we process your files'
                : 'Drag and drop files here, or click to select files'
              }
            </p>
          </div>

          <div className="text-xs text-gray-400">
            <p>Supported formats: {acceptedTypes.join(', ').toUpperCase()}</p>
            <p>Maximum file size: {maxFileSize}MB</p>
            {transactionId && (
              <p className="text-primary-600 font-medium">Transaction: {transactionId}</p>
            )}
          </div>
        </div>
      </div>

      {/* Upload progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700">Upload Progress</h4>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="flex items-center space-x-3">
              {getStatusIcon(progress.status)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progress.status === 'completed'
                        ? 'bg-green-500'
                        : progress.status === 'error'
                        ? 'bg-red-500'
                        : progress.status === 'processing'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {progress.status === 'completed'
                  ? 'Done'
                  : progress.status === 'processing'
                  ? 'Processing'
                  : progress.status === 'error'
                  ? 'Error'
                  : `${Math.round(progress.progress)}%`
                }
              </span>
            </div>
          ))}
        </div>
      )}

      {/* AI Processing Features Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">AI-Powered Document Processing</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Automatic OCR text extraction from images and PDFs</li>
                <li>Smart document categorization and metadata extraction</li>
                <li>Blockchain verification for document integrity</li>
                <li>RAG-powered document querying and analysis</li>
                <li>Compliance audit trails and version control</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadDropzone; 