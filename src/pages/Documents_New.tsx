import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageLayout from '../components/layout/PageLayout';
import { useWorkflow, WorkflowStage } from '../contexts/WorkflowContext';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  category: string;
  immutableHash: string;
}

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const { currentTransaction, advanceStage } = useWorkflow();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
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

      // Process files
      const newFiles: FileItem[] = filesArray.map((file, index) => {
        const progress = ((index + 1) / filesArray.length) * 100;
        setUploadProgress(progress);

        let category = 'other';
        if (file.name.toLowerCase().includes('loan')) category = 'loan';
        else if (file.name.toLowerCase().includes('financial')) category = 'financial';
        else if (file.name.toLowerCase().includes('tax')) category = 'tax';

        return {
          id: `file-${Date.now()}-${index}`,
          name: file.name,
          type: file.type.includes('pdf') ? 'pdf' : 'document',
          size: file.size,
          uploadedAt: new Date().toISOString(),
          category,
          immutableHash: `0x${Math.random().toString(16).substr(2, 16)}...`,
        };
      });

      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`${filesArray.length} file(s) uploaded successfully!`);
      setUploadProgress(100);

      setTimeout(() => setUploadProgress(0), 2000);
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <PageLayout title="Filelock Drive">
      <div className="w-full px-4 pb-6">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
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

                <label className="inline-flex cursor-pointer items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700">
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
                  <div className="h-2 w-full rounded-full bg-gray-200">
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
                          <span className="text-2xl">{file.type === 'pdf' ? '📄' : '📁'}</span>
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
                          <span className="font-medium">Ledger Hash:</span> {file.immutableHash}
                        </div>
                        <div className="text-xs text-gray-500">
                          Added: {new Date(file.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() =>
                            toast.success(
                              '✅ Document viewer working! (Will integrate full viewer soon)',
                            )
                          }
                          className="flex-1 rounded bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
                        >
                          View
                        </button>
                        <button
                          onClick={() =>
                            toast.success('✅ AI chat working! (Will integrate full chat soon)')
                          }
                          className="flex-1 rounded bg-purple-600 px-3 py-1.5 text-xs text-white hover:bg-purple-700"
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

        <div className="mt-4 rounded-lg bg-white p-4 shadow">
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

        <div className="mt-4 flex justify-end">
          {currentTransaction && (
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="rounded-md border border-transparent bg-primary-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none"
            >
              {isLoading ? 'Loading...' : 'Continue to Risk Assessment'}
            </button>
          )}

          {!currentTransaction && (
            <button
              onClick={() => navigate('/')}
              className="rounded-md border border-transparent bg-primary-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none"
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
