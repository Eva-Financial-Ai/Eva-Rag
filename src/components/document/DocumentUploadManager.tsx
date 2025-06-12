import {
  CheckCircleIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  FolderIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import { CloudFile } from '../../services/mockCloudStorageService';
import { CloudStorageManager } from '../cloud/CloudStorageManager';

interface DocumentUploadManagerProps {
  onFilesUploaded?: (files: (File | CloudFile)[]) => void;
  allowCloudStorage?: boolean;
  allowLocalUpload?: boolean;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  multiple?: boolean;
}

export const DocumentUploadManager: React.FC<DocumentUploadManagerProps> = ({
  onFilesUploaded,
  allowCloudStorage = true,
  allowLocalUpload = true,
  maxFileSize = 10,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.png', '.xlsx'],
  multiple = true,
}) => {
  const [uploadMethod, setUploadMethod] = useState<'local' | 'cloud'>('local');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<(File | CloudFile)[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      setError(`File ${file.name} is too large. Maximum size is ${maxFileSize}MB.`);
      return false;
    }

    // Check file type if specified
    if (acceptedTypes.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.some(type => type.toLowerCase() === fileExtension)) {
        setError(
          `File ${file.name} is not an accepted type. Accepted types: ${acceptedTypes.join(', ')}`,
        );
        return false;
      }
    }

    return true;
  };

  const handleLocalFileUpload = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      setUploading(true);

      try {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(validateFile);

        if (validFiles.length === 0) {
          setUploading(false);
          return;
        }

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newFiles = multiple ? [...uploadedFiles, ...validFiles] : validFiles;
        setUploadedFiles(newFiles);

        if (onFilesUploaded) {
          onFilesUploaded(newFiles);
        }
      } catch (err) {
        setError('Failed to upload files. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [multiple, uploadedFiles, onFilesUploaded, maxFileSize, acceptedTypes],
  );

  const handleCloudFileSelect = useCallback(
    (cloudFiles: CloudFile[]) => {
      const newFiles = multiple ? [...uploadedFiles, ...cloudFiles] : cloudFiles;
      setUploadedFiles(newFiles);

      if (onFilesUploaded) {
        onFilesUploaded(newFiles);
      }
    },
    [multiple, uploadedFiles, onFilesUploaded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (uploadMethod === 'local' && e.dataTransfer.files) {
        handleLocalFileUpload(e.dataTransfer.files);
      }
    },
    [uploadMethod, handleLocalFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);

    if (onFilesUploaded) {
      onFilesUploaded(newFiles);
    }
  };

  const getFileIcon = (file: File | CloudFile) => {
    const fileName = file.name;
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return <DocumentTextIcon className="h-8 w-8 text-red-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <PhotoIcon className="h-8 w-8 text-blue-600" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <DocumentTextIcon className="h-8 w-8 text-green-600" />;
      default:
        return <FolderIcon className="h-8 w-8 text-gray-600" />;
    }
  };

  const getFileSize = (file: File | CloudFile): number => {
    return file.size;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white mx-auto w-full max-w-4xl rounded-lg p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Document Upload</h2>
        <p className="text-gray-600">Upload documents from your computer or cloud storage</p>
      </div>

      {/* Upload Method Selection */}
      {allowLocalUpload && allowCloudStorage && (
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setUploadMethod('local')}
              className={`rounded-md px-4 py-2 font-medium transition-colors ${
                uploadMethod === 'local'
                  ? 'text-white bg-blue-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📁 Local Upload
            </button>
            <button
              onClick={() => setUploadMethod('cloud')}
              className={`rounded-md px-4 py-2 font-medium transition-colors ${
                uploadMethod === 'cloud'
                  ? 'text-white bg-blue-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ☁️ Cloud Storage
            </button>
          </div>
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
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Upload Interface */}
      {uploadMethod === 'local' ? (
        <div className="mb-6">
          <div
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <CloudArrowUpIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-lg font-medium text-gray-900">
              Drop files here or click to upload
            </p>
            <p className="mb-4 text-sm text-gray-500">Maximum file size: {maxFileSize}MB</p>
            <p className="mb-4 text-xs text-gray-400">Accepted types: {acceptedTypes.join(', ')}</p>
            <input
              type="file"
              multiple={multiple}
              accept={acceptedTypes.join(',')}
              onChange={e => e.target.files && handleLocalFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="text-white inline-flex cursor-pointer items-center rounded-md bg-blue-600 px-4 py-2 transition-colors hover:bg-blue-700"
            >
              {uploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                'Choose Files'
              )}
            </label>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <CloudStorageManager
            onFileSelect={handleCloudFileSelect}
            allowMultiple={multiple}
            acceptedTypes={acceptedTypes.map(type => type.replace('.', ''))}
          />
        </div>
      )}

      {/* Uploaded Files Display */}
      {uploadedFiles.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Uploaded Files ({uploadedFiles.length})
          </h3>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                      {'provider' in file && (
                        <span className="bg-gray-100 ml-2 rounded-full px-2 py-1 text-xs">
                          {file.provider}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <button
                    onClick={() => removeFile(index)}
                    className="font-medium text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Summary */}
      {uploadedFiles.length > 0 && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="mr-2 h-5 w-5 text-green-600" />
            <span className="text-green-800">
              {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} ready for processing
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
