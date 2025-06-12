import React, { useState, useEffect } from 'react';
import {
  CloudflareR2Config,
  CloudflareR2Connection,
  R2APIKeyValidation,
  CLOUDFLARE_R2_REGIONS,
  SUPPORTED_EMBEDDING_MODELS,
} from '../../types/cloudflareR2Types';
import CloudflareR2Service from '../../services/cloudflareR2Service';

interface CloudflareR2ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  selectedModel: string;
  onConfigComplete: (config: CloudflareR2Config) => void;
}

const CloudflareR2ConfigModal: React.FC<CloudflareR2ConfigModalProps> = ({
  isOpen,
  onClose,
  agentId,
  agentName,
  selectedModel,
  onConfigComplete,
}) => {
  const [step, setStep] = useState<'api-key' | 'setup' | 'testing' | 'complete'>('api-key');
  const [apiKey, setApiKey] = useState('');
  const [accountId, setAccountId] = useState('');
  const [bucketName, setBucketName] = useState(`eva-agent-${agentId.slice(-8)}`);
  const [region, setRegion] = useState<string>('auto');
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-3-small');
  const [autoRagEnabled, setAutoRagEnabled] = useState(true);
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(200);

  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<R2APIKeyValidation | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [connection, setConnection] = useState<CloudflareR2Connection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const r2Service = CloudflareR2Service.getInstance();

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setStep('api-key');
      setError(null);
      setValidation(null);
      setConnection(null);
      setBucketName(`eva-agent-${agentId.slice(-8)}`);
    }
  }, [isOpen, agentId]);

  const handleValidateAPIKey = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Cloudflare API key');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await r2Service.validateAPIKey(apiKey, accountId || undefined);
      setValidation(result);

      if (result.isValid) {
        if (result.accountInfo) {
          setAccountId(result.accountInfo.accountId);
        }
        setStep('setup');
      } else {
        setError(result.errorMessage || 'API key validation failed');
      }
    } catch (err) {
      setError('Failed to validate API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSetupConfiguration = async () => {
    if (!validation?.isValid) return;

    setIsConfiguring(true);
    setError(null);
    setStep('testing');

    try {
      // Setup Auto RAG if enabled
      let vectorIndexId: string | undefined;

      if (autoRagEnabled && validation.vectorDBAccess) {
        const ragSetup = await r2Service.setupAutoRAG(apiKey, accountId, {
          bucketName,
          vectorDatabaseId: 'auto-create',
          embeddingModel: embeddingModel as any,
          chunkSize,
          chunkOverlap,
          autoIndexing: true,
        });

        if (ragSetup.success) {
          vectorIndexId = ragSetup.vectorIndexId;
        } else {
          setError(`Auto RAG setup failed: ${ragSetup.errorMessage}`);
          setStep('setup');
          setIsConfiguring(false);
          return;
        }
      }

      // Create final configuration
      const config: CloudflareR2Config = {
        apiKey,
        accountId,
        bucketName,
        region,
        autoRagEnabled,
        vectorIndexId,
        embeddingModel,
      };

      // Test the connection
      const connectionTest = await r2Service.testConnection(config);

      if (connectionTest.r2Connected) {
        setStep('complete');
        setTimeout(() => {
          onConfigComplete(config);
          onClose();
        }, 2000);
      } else {
        setError(connectionTest.errorMessage || 'Connection test failed');
        setStep('setup');
      }
    } catch (err) {
      setError('Configuration setup failed. Please try again.');
      setStep('setup');
    } finally {
      setIsConfiguring(false);
    }
  };

  const getSelectedEmbeddingModel = () => {
    return SUPPORTED_EMBEDDING_MODELS.find(model => model.id === embeddingModel);
  };

  const calculateEstimatedCost = () => {
    const model = getSelectedEmbeddingModel();
    if (!model || model.costPer1K === 0) return 'Free';

    // Rough estimation for 1GB of text data
    const estimatedTokens = 250000; // ~1GB of text
    const cost = (estimatedTokens / 1000) * model.costPer1K;
    return `~$${cost.toFixed(4)}/GB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                🌩️ Cloudflare R2 + Auto RAG Setup
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Agent: {agentName} • Model: {selectedModel}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            {[
              { id: 'api-key', label: 'API Key', icon: '🔑' },
              { id: 'setup', label: 'Configuration', icon: '⚙️' },
              { id: 'testing', label: 'Testing', icon: '🧪' },
              { id: 'complete', label: 'Complete', icon: '✅' },
            ].map((stepItem, index) => (
              <div key={stepItem.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === stepItem.id
                      ? 'bg-blue-600 text-white'
                      : ['api-key', 'setup', 'testing', 'complete'].indexOf(step) >
                          ['api-key', 'setup', 'testing', 'complete'].indexOf(stepItem.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepItem.icon}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{stepItem.label}</span>
                {index < 3 && <div className="w-8 h-0.5 bg-gray-300 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: API Key */}
          {step === 'api-key' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Enter Your Cloudflare API Key
                </h3>
                <p className="text-gray-600 mb-4">
                  Your API key will be used to create and manage your R2 storage bucket with Auto
                  RAG functionality. We never store your API key on our servers.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cloudflare API Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="Enter your Cloudflare API key"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Need an API key?{' '}
                    <a
                      href="https://dash.cloudflare.com/profile/api-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Create one here
                    </a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={accountId}
                    onChange={e => setAccountId(e.target.value)}
                    placeholder="Auto-detected from API key"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Will be auto-detected if not provided
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Required Permissions</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• R2 Object Storage (read/write)</li>
                  <li>• Vectorize Database (for Auto RAG)</li>
                  <li>• Account Information (read-only)</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Setup Configuration */}
          {step === 'setup' && validation?.isValid && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Configure Your R2 + Auto RAG Setup
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✅</span>
                    <span className="text-green-800 font-medium">
                      API Key Validated Successfully
                    </span>
                  </div>
                  {validation.accountInfo && (
                    <p className="text-green-700 text-sm mt-1">
                      Account: {validation.accountInfo.accountName} (
                      {validation.accountInfo.accountId})
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Storage Configuration */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Storage Configuration</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bucket Name
                    </label>
                    <input
                      type="text"
                      value={bucketName}
                      onChange={e => setBucketName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be globally unique across all Cloudflare R2
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                    <select
                      value={region}
                      onChange={e => setRegion(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {CLOUDFLARE_R2_REGIONS.map(r => (
                        <option key={r} value={r}>
                          {r === 'auto' ? 'Auto (Recommended)' : r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Auto RAG Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Auto RAG Settings</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={autoRagEnabled}
                        onChange={e => setAutoRagEnabled(e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Enable Auto RAG</span>
                    </label>
                  </div>

                  {autoRagEnabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Embedding Model
                        </label>
                        <select
                          value={embeddingModel}
                          onChange={e => setEmbeddingModel(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {SUPPORTED_EMBEDDING_MODELS.map(model => (
                            <option key={model.id} value={model.id}>
                              {model.name} {model.isOpenSource && '(Free)'}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Cost: {calculateEstimatedCost()} • Dimensions:{' '}
                          {getSelectedEmbeddingModel()?.dimensions}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chunk Size
                          </label>
                          <select
                            value={chunkSize}
                            onChange={e => setChunkSize(parseInt(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value={500}>500 (Small)</option>
                            <option value={1000}>1000 (Medium)</option>
                            <option value={2000}>2000 (Large)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Overlap
                          </label>
                          <select
                            value={chunkOverlap}
                            onChange={e => setChunkOverlap(parseInt(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value={100}>100 (Low)</option>
                            <option value={200}>200 (Medium)</option>
                            <option value={400}>400 (High)</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {!validation.vectorDBAccess && autoRagEnabled && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Your API key doesn't have Vectorize access. Auto RAG will be disabled.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Testing */}
          {step === 'testing' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Setting Up Your Configuration
                </h3>
                <p className="text-gray-600">
                  We're configuring your R2 bucket and Auto RAG functionality...
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Creating R2 bucket...</span>
                  <span className="text-green-600">✅</span>
                </div>
                {autoRagEnabled && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Setting up Vectorize index...</span>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Testing connection...</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <span className="text-2xl text-green-600">✅</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Configuration Complete!
                </h3>
                <p className="text-gray-600">
                  Your agent is now connected to Cloudflare R2 with Auto RAG enabled.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">What's Next?</h4>
                <ul className="text-sm text-green-800 space-y-1 text-left">
                  <li>• Upload documents to your custom knowledge base</li>
                  <li>• Files will be automatically processed and indexed</li>
                  <li>• Your agent will use this data for enhanced responses</li>
                  <li>• Monitor usage in your Cloudflare dashboard</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {step === 'api-key' && 'Step 1 of 4: API Key Validation'}
              {step === 'setup' && 'Step 2 of 4: Configuration Setup'}
              {step === 'testing' && 'Step 3 of 4: Testing Connection'}
              {step === 'complete' && 'Step 4 of 4: Setup Complete'}
            </div>
            <div className="flex space-x-3">
              {step !== 'testing' && step !== 'complete' && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              )}
              {step === 'api-key' && (
                <button
                  onClick={handleValidateAPIKey}
                  disabled={!apiKey.trim() || isValidating}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    apiKey.trim() && !isValidating
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isValidating ? 'Validating...' : 'Validate API Key'}
                </button>
              )}
              {step === 'setup' && (
                <button
                  onClick={handleSetupConfiguration}
                  disabled={!bucketName.trim() || isConfiguring}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    bucketName.trim() && !isConfiguring
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isConfiguring ? 'Setting Up...' : 'Setup Configuration'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudflareR2ConfigModal;
