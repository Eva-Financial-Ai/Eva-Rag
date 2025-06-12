import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  RAGDataSource,
  AgentStorageQuota,
  RAGUploadProgress,
  ModelOption,
  DEFAULT_MODEL_OPTIONS,
  STORAGE_LIMITS,
  PersonalizationSession,
} from '../../types/ragTypes';
import RAGStorageService from '../../services/ragStorageService';
import PersonalizationModal from './PersonalizationModal';

interface RAGUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  organizationId: string;
  userId: string;
  onUploadComplete: (dataSources: RAGDataSource[]) => void;
  onModelChange?: (modelId: string) => void;
  selectedModel?: string;
  onPersonalizationComplete?: (session: PersonalizationSession) => void;
}

const RAGUploadModal: React.FC<RAGUploadModalProps> = ({
  isOpen,
  onClose,
  agentId,
  agentName,
  organizationId,
  userId,
  onUploadComplete,
  onModelChange,
  selectedModel = 'eva-financial-risk-70b',
  onPersonalizationComplete,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, RAGUploadProgress>>({});
  const [storageQuota, setStorageQuota] = useState<AgentStorageQuota | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(selectedModel);
  const [uploadOptions, setUploadOptions] = useState({
    chunkSize: 1000,
    overlap: 200,
    language: 'en',
    embeddingModel: 'text-embedding-3-large',
    validateFinancialData: true,
    encryptSensitiveData: true,
  });
  const [activeTab, setActiveTab] = useState<'upload' | 'model' | 'settings'>('upload');
  const [requestedModels, setRequestedModels] = useState<string[]>([]);

  // Personalization flow state
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [completedUploadSources, setCompletedUploadSources] = useState<RAGDataSource[]>([]);

  const ragService = RAGStorageService.getInstance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load storage quota on modal open
  useEffect(() => {
    if (isOpen && agentId) {
      loadStorageQuota();
    }
  }, [isOpen, agentId]);

  const loadStorageQuota = async () => {
    try {
      const quota = await ragService.getAgentStorageQuota(agentId);
      setStorageQuota(quota);
    } catch (error) {
      console.error('Failed to load storage quota:', error);
    }
  };

  // File dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      setFiles(prev => [...prev, ...acceptedFiles]);
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'application/json': ['.json'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'audio/*': ['.mp3', '.wav'],
      'video/*': ['.mp4', '.avi', '.mov'],
    },
    maxSize: STORAGE_LIMITS.MAX_FILE_SIZE,
    multiple: true,
  });

  // Calculate total size of selected files
  const totalSelectedSize = files.reduce((total, file) => total + file.size, 0);
  const remainingSpace = storageQuota
    ? storageQuota.totalStorageLimit - storageQuota.totalStorageUsed
    : 0;
  const canUpload = totalSelectedSize <= remainingSpace;

  // Handle file upload
  const handleUpload = async () => {
    if (!canUpload || files.length === 0) return;

    setIsUploading(true);
    const uploadedSources: RAGDataSource[] = [];

    try {
      for (const file of files) {
        const fileId = `${file.name}-${Date.now()}`;

        await ragService.uploadRAGFile(file, agentId, organizationId, userId, {
          ...uploadOptions,
          onProgress: progress => {
            setUploadProgress(prev => ({
              ...prev,
              [fileId]: progress,
            }));
          },
        });

        // Simulate successful upload result
        const dataSource: RAGDataSource = {
          id: fileId,
          name: file.name,
          type: file.name.split('.').pop() as any,
          size: file.size,
          uploadDate: new Date(),
          status: 'ready',
          agentId,
          organizationId,
          userId,
          vectorChunks: Math.ceil(file.size / uploadOptions.chunkSize),
          embeddingModel: uploadOptions.embeddingModel,
        };

        uploadedSources.push(dataSource);
      }

      onUploadComplete(uploadedSources);
      setFiles([]);
      setUploadProgress({});

      // Store completed upload sources and trigger personalization
      setCompletedUploadSources(uploadedSources);
      setShowPersonalization(true);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Remove file from list
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Get available models (active models + requested models)
  const getAvailableModels = (): ModelOption[] => {
    return DEFAULT_MODEL_OPTIONS.filter(
      model => model.isActive || requestedModels.includes(model.id)
    );
  };

  // Request new model
  const requestModel = (modelId: string) => {
    if (!requestedModels.includes(modelId)) {
      setRequestedModels(prev => [...prev, modelId]);
      // TODO: Implement actual model request API call
      alert(
        `Model request submitted for: ${DEFAULT_MODEL_OPTIONS.find(m => m.id === modelId)?.name}`
      );
    }
  };

  // Calculate estimated cost
  const getEstimatedCost = (): number => {
    const model = DEFAULT_MODEL_OPTIONS.find(m => m.id === selectedModelId);
    if (!model) return 0;

    // Rough estimation: 1 token per 4 characters
    const estimatedTokens = totalSelectedSize / 4;
    return estimatedTokens * model.costPerToken;
  };

  // Handle personalization completion
  const handlePersonalizationComplete = (session: PersonalizationSession) => {
    setShowPersonalization(false);
    onPersonalizationComplete?.(session);
    onClose(); // Close the upload modal after personalization is complete
  };

  // Handle personalization modal close
  const handlePersonalizationClose = () => {
    setShowPersonalization(false);
    onClose(); // Close the upload modal if user cancels personalization
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10100] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">📚 Upload Knowledge Base</h2>
              <p className="text-sm text-gray-600 mt-1">Agent: {agentName} • Max 81GB per agent</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          {/* Storage Usage Bar */}
          {storageQuota && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Storage Usage</span>
                <span className="text-sm text-gray-600">
                  {ragService.formatBytes(storageQuota.totalStorageUsed)} /{' '}
                  {ragService.formatBytes(storageQuota.totalStorageLimit)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    ragService.getStorageUsagePercentage(
                      storageQuota.totalStorageUsed,
                      storageQuota.totalStorageLimit
                    ) > 80
                      ? 'bg-red-500'
                      : ragService.getStorageUsagePercentage(
                            storageQuota.totalStorageUsed,
                            storageQuota.totalStorageLimit
                          ) > 60
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{
                    width: `${ragService.getStorageUsagePercentage(storageQuota.totalStorageUsed, storageQuota.totalStorageLimit)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {ragService.getStorageUsagePercentage(
                  storageQuota.totalStorageUsed,
                  storageQuota.totalStorageLimit
                )}
                % used
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            {[
              { id: 'upload', label: '📁 Upload Files', icon: '📁' },
              { id: 'model', label: '🤖 Model Selection', icon: '🤖' },
              { id: 'settings', label: '⚙️ Processing Settings', icon: '⚙️' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* File Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <div className="space-y-3">
                  <div className="text-4xl">📁</div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Drop files here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PDF, DOCX, XLSX, CSV, TXT, JSON, Images, Audio, Video
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Max file size: {ragService.formatBytes(STORAGE_LIMITS.MAX_FILE_SIZE)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Selected Files ({files.length})</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">📄</span>
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {ragService.formatBytes(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Total Size and Space Check */}
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">
                        Total Size: {ragService.formatBytes(totalSelectedSize)}
                      </p>
                      <p className="text-sm text-blue-700">
                        Available Space: {ragService.formatBytes(remainingSpace)}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        canUpload ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {canUpload ? '✅ Can Upload' : '❌ Exceeds Limit'}
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Upload Progress</h3>
                  {Object.entries(uploadProgress).map(([fileId, progress]) => (
                    <div key={fileId} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{progress.fileName}</span>
                        <span className="text-sm text-gray-600">{progress.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 capitalize">
                        {progress.processingStage.replace('-', ' ')}...
                      </p>
                      {progress.error && (
                        <p className="text-xs text-red-600 mt-1">{progress.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Model Selection Tab */}
          {activeTab === 'model' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Choose AI Model</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select the AI model for processing your uploaded data. Economical models are
                  better for simple tasks.
                </p>
              </div>

              <div className="grid gap-4">
                {getAvailableModels().map(model => (
                  <div
                    key={model.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedModelId === model.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedModelId(model.id);
                      onModelChange?.(model.id);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{model.name}</h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              model.category === 'premium'
                                ? 'bg-purple-100 text-purple-800'
                                : model.category === 'standard'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {model.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>💰 ${model.costPerToken.toFixed(4)}/token</span>
                          <span>📝 {model.contextWindow.toLocaleString()} context</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {model.capabilities.map(capability => (
                            <span
                              key={capability}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              {capability.replace('-', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={selectedModelId === model.id}
                        onChange={() => {}}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}

                {/* Request New Models */}
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Request Additional Models</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Need a specific model not listed above? Request it for post-MVP consideration.
                  </p>
                  <div className="grid gap-2">
                    {DEFAULT_MODEL_OPTIONS.filter(
                      m => m.requestRequired && !requestedModels.includes(m.id)
                    ).map(model => (
                      <button
                        key={model.id}
                        onClick={() => requestModel(model.id)}
                        className="flex items-center justify-between p-2 text-left text-sm border border-gray-200 rounded hover:bg-gray-50"
                      >
                        <span>{model.name}</span>
                        <span className="text-blue-600">Request</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cost Estimation */}
                {totalSelectedSize > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-1">
                      Estimated Processing Cost
                    </h4>
                    <p className="text-sm text-yellow-800">
                      Approximate cost for processing {ragService.formatBytes(totalSelectedSize)} of
                      data:
                      <span className="font-medium ml-1">${getEstimatedCost().toFixed(4)}</span>
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      *Actual cost may vary based on content complexity and processing requirements.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Processing Configuration</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure how your documents will be processed and embedded for optimal RAG
                  performance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chunking Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Document Chunking</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chunk Size (characters)
                    </label>
                    <select
                      value={uploadOptions.chunkSize}
                      onChange={e =>
                        setUploadOptions(prev => ({ ...prev, chunkSize: parseInt(e.target.value) }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={500}>500 (Small - Better for Q&A)</option>
                      <option value={1000}>1000 (Medium - Balanced)</option>
                      <option value={2000}>2000 (Large - Better for context)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Overlap (characters)
                    </label>
                    <select
                      value={uploadOptions.overlap}
                      onChange={e =>
                        setUploadOptions(prev => ({ ...prev, overlap: parseInt(e.target.value) }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={100}>100 (Minimal)</option>
                      <option value={200}>200 (Standard)</option>
                      <option value={400}>400 (High overlap)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <select
                      value={uploadOptions.language}
                      onChange={e =>
                        setUploadOptions(prev => ({ ...prev, language: e.target.value }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="auto">Auto-detect</option>
                    </select>
                  </div>
                </div>

                {/* Security & Compliance Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Security & Compliance</h4>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={uploadOptions.validateFinancialData}
                        onChange={e =>
                          setUploadOptions(prev => ({
                            ...prev,
                            validateFinancialData: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          Financial Data Validation
                        </span>
                        <p className="text-xs text-gray-500">
                          Validate financial data for accuracy and compliance
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={uploadOptions.encryptSensitiveData}
                        onChange={e =>
                          setUploadOptions(prev => ({
                            ...prev,
                            encryptSensitiveData: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          Encrypt Sensitive Data
                        </span>
                        <p className="text-xs text-gray-500">
                          Encrypt PII, SSN, and financial account numbers
                        </p>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Embedding Model
                    </label>
                    <select
                      value={uploadOptions.embeddingModel}
                      onChange={e =>
                        setUploadOptions(prev => ({ ...prev, embeddingModel: e.target.value }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="text-embedding-3-large">OpenAI Text Embedding 3 Large</option>
                      <option value="text-embedding-3-small">OpenAI Text Embedding 3 Small</option>
                      <option value="text-embedding-ada-002">OpenAI Ada 002 (Legacy)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {files.length > 0 && (
                <span>
                  {files.length} file{files.length > 1 ? 's' : ''} selected •
                  {ragService.formatBytes(totalSelectedSize)} total
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!canUpload || files.length === 0 || isUploading}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  canUpload && files.length > 0 && !isUploading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isUploading ? 'Uploading...' : 'Upload to Knowledge Base'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personalization Modal */}
      {showPersonalization && (
        <PersonalizationModal
          isOpen={showPersonalization}
          onClose={handlePersonalizationClose}
          onComplete={handlePersonalizationComplete}
          agentId={agentId}
          agentName={agentName}
          uploadedDataSources={completedUploadSources}
          selectedModel={selectedModelId}
        />
      )}
    </div>
  );
};

export default RAGUploadModal;
