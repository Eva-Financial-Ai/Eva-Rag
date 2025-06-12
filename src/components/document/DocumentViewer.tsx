import React, { useState, useEffect, useCallback } from 'react';
import { FileItem } from './FilelockDriveApp';
import FileChatPanel from './FileChatPanel';
import ShareDocumentModal from './ShareDocumentModal';
import { verifyDocument } from '../../api/documentVerificationApi';

import { debugLog } from '../../utils/auditLogger';

// Interface for FilelockBlockchainService props
interface FilelockBlockchainServiceProps {
  file: FileItem;
  onComplete: (updatedFile: FileItem) => void;
  onCancel: () => void;
}

// Convert to a proper React component
const FilelockBlockchainService: React.FC<FilelockBlockchainServiceProps> = ({
  file,
  onComplete,
  onCancel,
}) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleCertify = async () => {
    setProcessing(true);

    // Simulate blockchain certification process
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);

          // Generate mock blockchain data
          const blockchainData = {
            transactionHash: '0x' + Math.random().toString(36).substring(2, 15),
            blockNumber: Math.floor(Math.random() * 10000000),
            timestamp: new Date().toISOString(),
            network: 'Polygon',
          };

          // Complete the process
          setTimeout(() => {
            onComplete({
              ...file,
              blockchainVerified: true,
              blockchainTxId: blockchainData.transactionHash,
            });
          }, 500);
        }
        return newProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  };

  return (
    <div className="p-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Blockchain Verification</h3>

        {processing ? (
          <>
            <div className="mb-4">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {progress < 100 ? 'Processing...' : 'Completed!'}
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Certify this document on the blockchain to ensure its authenticity and prevent
              unauthorized modifications.
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCertify}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Certify Document
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface DocumentViewerProps {
  file: FileItem;
  onBack: () => void;
  onEdit: () => void;
  onSign: () => void;
  onShare: (file: FileItem) => void;
  onDelete: () => void;
  onDownload: (file: FileItem) => void;
  onUpdateFile?: (updatedFile: FileItem) => void;
  onChatWithFile?: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  file,
  onBack,
  onEdit,
  onSign,
  onShare,
  onDelete,
  onDownload,
  onUpdateFile,
  onChatWithFile: _onChatWithFile,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(10);
  const [zoom, setZoom] = useState(100);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history' | 'security'>(
    'details'
  );
  const [isCertifying, setIsCertifying] = useState(false);
  const [blockchainInfo] = useState<{ transactionHash?: string; blockNumber?: number } | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [documentSummary, setDocumentSummary] = useState<string>('');
  const [extractedData, setExtractedData] = useState<Record<string, unknown>>({});
  const [ocr, setOcr] = useState<{ isComplete: boolean; text: string }>({
    isComplete: false,
    text: '',
  });
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [blockchainVerification, setBlockchainVerification] = useState<{ verified: boolean; hash?: string } | null>(null);
  const [selectedPrompt, _setSelectedPrompt] = useState<string>('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<
    Array<{
      id: string;
      text: string;
      user: string;
      timestamp: string;
    }>
  >([]);

  const getDocumentTypeFromExtension = useCallback((fileType: string): string => {
    switch (fileType) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'xls':
      case 'xlsx':
        return 'Spreadsheet';
      case 'ppt':
      case 'pptx':
        return 'Presentation';
      case 'txt':
        return 'Text Document';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'Image';
      default:
        return 'Document';
    }
  }, []);

  // Process document with AI capabilities
  const processDocumentWithAI = useCallback(async () => {
    if (!file || processingStatus === 'processing') return;

    setProcessingStatus('processing');
    try {
      // Check if document is already processed
      const statusResponse = await fetch(`/api/documents/status?documentId=${file.id}`);
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        
        if (statusData.status === 'processed') {
          setExtractedData({
            ocrText: statusData.processingResults?.ocrText || '',
            confidence: statusData.processingResults?.ocrConfidence || 0
          });
          setBlockchainVerification({
            verified: true,
            txId: statusData.processingResults?.blockchainTxId
          });
          setProcessingStatus('completed');
          return;
        }
      }

      // If not processed, start AI processing workflow
      if (file.downloadUrl) {
        const fileResponse = await fetch(file.downloadUrl);
        const fileBlob = await fileResponse.blob();
        
        const formData = new FormData();
        formData.append('file', fileBlob, file.name);
        formData.append('transactionId', file.transactionId || '');
        formData.append('metadata', JSON.stringify({
          originalViewer: true,
          fileType: file.type,
          fileSize: file.size
        }));

        const uploadResponse = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData
        });

        if (uploadResponse.ok) {
          const result = await uploadResponse.json();
          
          // Poll for completion
          const pollStatus = async () => {
            const statusCheck = await fetch(`/api/documents/status?documentId=${result.documentId}`);
            const statusData = await statusCheck.json();
            
            if (statusData.status === 'processed') {
              setExtractedData({
                ocrText: statusData.processingResults?.ocrText || '',
                confidence: statusData.processingResults?.ocrConfidence || 0
              });
              setBlockchainVerification({
                verified: true,
                txId: statusData.processingResults?.blockchainTxId
              });
              setProcessingStatus('completed');
            } else if (statusData.status === 'failed') {
              setProcessingStatus('error');
            } else {
              setTimeout(pollStatus, 2000); // Poll every 2 seconds
            }
          };
          
          setTimeout(pollStatus, 1000);
        }
      }
    } catch (error) {
      console.error('AI processing failed:', error);
      setProcessingStatus('error');
    }
  }, [file, processingStatus]);

  // Query document using RAG
  const _queryDocument = useCallback(async (query: string) => {
    try {
      const response = await fetch('/api/documents/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          transactionId: file.transactionId
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      }
    } catch (error) {
      console.error('Document query failed:', error);
    }
    return null;
  }, [file?.transactionId]);

  const generateSummary = useCallback(
    (result: { documentType?: string; extractedData?: Record<string, unknown> }, file: FileItem): string => {
      const documentType = result.documentType || getDocumentTypeFromExtension(file.type);
      if (result.extractedData) {
        if (documentType === 'Financial Statement') {
          return `This ${documentType} contains financial information with ${
            result.extractedData.recordCount || 'multiple'
          } records covering ${result.extractedData.dateRange || 'recent periods'}. Total revenue reported: ${
            result.extractedData.totalRevenue || 'Not specified'
          }.`;
        } else if (documentType === 'Contract') {
          return `This ${documentType} is a ${
            result.extractedData.contractType || 'legal agreement'
          } between ${result.extractedData.parties || 'multiple parties'}. Effective date: ${
            result.extractedData.effectiveDate || 'Not specified'
          }. Termination date: ${result.extractedData.terminationDate || 'Not specified'}.`;
        } else if (documentType === 'Tax Document') {
          return `This tax document contains information for tax period ${
            result.extractedData.taxPeriod || 'unspecified'
          }. Total tax amount: ${result.extractedData.totalTax || 'Not specified'}.`;
        }
      }
      const fileSizeInMB = file.size ? (file.size / 1024 / 1024).toFixed(2) : 'unknown';
      return `This ${documentType} was uploaded on ${new Date(
        file.createdAt
      ).toLocaleDateString()} and is ${fileSizeInMB} MB in size. The document has been processed for quick analysis.`;
    },
    [getDocumentTypeFromExtension]
  );

  const generateSuggestedPrompts = useCallback(
    (result: { documentType?: string; extractedData?: Record<string, unknown> }, file: FileItem) => {
      const documentType = result.documentType || getDocumentTypeFromExtension(file.type);
      const prompts: string[] = [];
      prompts.push('Summarize this document in bullet points');
      prompts.push('What are the key takeaways from this document?');
      if (documentType.includes('Financial') || file.name.toLowerCase().includes('financial')) {
        prompts.push('Extract all financial figures from this document');
        prompts.push('Calculate key financial ratios based on this document');
        prompts.push('Identify financial risk areas in this document');
      } else if (
        documentType.includes('Contract') ||
        file.name.toLowerCase().includes('agreement')
      ) {
        prompts.push('Highlight important clauses in this contract');
        prompts.push('What are the termination conditions in this agreement?');
        prompts.push('Explain the legal obligations in simple terms');
      } else if (documentType.includes('Tax') || file.name.toLowerCase().includes('tax')) {
        prompts.push('Extract tax deductions from this document');
        prompts.push('Identify tax compliance issues in this document');
        prompts.push('Summarize tax liabilities mentioned in this document');
      }
      debugLog('general', 'log_statement', 'Generated prompts (not setting state):', prompts);
    },
    [getDocumentTypeFromExtension]
  );

  useEffect(() => {
    const processDocumentInternal = async () => {
      try {
        // Call the document verification API which includes OCR processing
        const result = await verifyDocument(file);

        // Generate an executive summary
        const summary = generateSummary(result, file);
        setDocumentSummary(summary);

        // Store extracted data
        setExtractedData(result.extractedData || {});

        // Set OCR text if available
        setOcr({
          isComplete: true,
          text: result.extractedText || 'Document content processed successfully',
        });

        // Generate suggested prompts based on document content
        generateSuggestedPrompts(result, file);
      } catch (error) {
        console.error('Error processing document:', error);
        setDocumentSummary('Unable to generate summary for this document.');
      }
    };

    processDocumentInternal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    file,
    generateSummary,
    generateSuggestedPrompts,
    setDocumentSummary,
    setExtractedData,
    setOcr,
  ]);


  // Handle adding a comment
  const handleAddComment = () => {
    if (!comment.trim()) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      text: comment,
      user: 'You',
      timestamp: new Date().toISOString(),
    };

    setComments([...comments, newComment]);
    setComment('');
  };

  // Certify document on blockchain
  const handleCertifyDocument = async () => {
    setIsCertifying(true);

    try {
      // In a proper implementation, we would call a blockchain service API
      // For now, we'll show the blockchain verification modal
      setShowBlockchainLockModal(true);
    } catch (error) {
      console.error('Error certifying document:', error);
      setIsCertifying(false);
    }
  };

  // Get appropriate file icon based on type
  const getFileIcon = () => {
    if (file.type === 'pdf') {
      return (
        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else if (file.type === 'excel') {
      return (
        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a2 2 0 00-2 2v1H7a2 2 0 00-2 2v1H4a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V7a2 2 0 00-2-2h-1V4a2 2 0 00-2-2h-2zM8 8V7h4v1H8z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
  };

  // Add state for blockchain locking
  const [showBlockchainLockModal, setShowBlockchainLockModal] = useState(false);

  // Handle file update from blockchain service
  const handleFileUpdate = (updatedFile: FileItem) => {
    setShowBlockchainLockModal(false);
    if (onUpdateFile) {
      onUpdateFile(updatedFile);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden">
      {/* Document header */}
      <div className="px-6 py-4 bg-white border-b flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-1 rounded-full hover:bg-gray-100"
            aria-label="Go back"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex items-center">
            {getFileIcon()}
            <h1 className="ml-2 text-lg font-medium text-gray-900">{file.name}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Exit/Close button */}
          <button
            onClick={onBack}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm flex items-center"
            title="Exit viewer"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Exit
          </button>
          
          {file.signatureStatus === 'awaiting' && (
            <button
              onClick={onSign}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
            >
              Sign
            </button>
          )}
          
          <button
            onClick={handleCertifyDocument}
            disabled={isCertifying || file.blockchainVerified}
            className={`px-3 py-1.5 rounded-md text-sm ${
              file.blockchainVerified
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {file.blockchainVerified ? 'Certified' : 'Certify on Blockchain'}
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm"
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat with Document
          </button>

          <button
            onClick={onEdit}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm"
          >
            Edit
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm"
          >
            Share
          </button>

          <button
            onClick={() => onDownload(file)}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm"
          >
            Download
          </button>

          <button
            onClick={onDelete}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Document content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Document viewer */}
          <div className="flex-1 bg-gray-100 overflow-auto p-4">
            <div className="max-w-4xl mx-auto bg-white shadow-lg">
              {/* Document content based on file type */}
              {file.type === 'pdf' ? (
                <div className="h-full">
                  {/* PDF Viewer */}
                  {file.downloadUrl ? (
                    <iframe
                      src={`${file.downloadUrl}#view=FitH`}
                      className="w-full h-screen"
                      title={file.name}
                      style={{ border: 'none', minHeight: '800px' }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-96 bg-gray-50">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">PDF preview not available</p>
                        <button
                          onClick={() => onDownload(file)}
                          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          Download to view
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : file.type === 'jpg' || file.type === 'jpeg' || file.type === 'png' ? (
                <div className="p-8">
                  {/* Image Viewer */}
                  {file.downloadUrl ? (
                    <img
                      src={file.downloadUrl}
                      alt={file.name}
                      className="max-w-full h-auto mx-auto"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-96 bg-gray-50">
                      <p className="text-gray-500">Image preview not available</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8">
                  {/* Text/Document Content */}
                  {ocr.isComplete && ocr.text ? (
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-gray-800">{ocr.text}</pre>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Document Summary */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">Document Summary</h3>
                        <p className="text-blue-800">{documentSummary || 'Processing document...'}</p>
                      </div>

                      {/* Processing Status */}
                      {processingStatus === 'processing' && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-yellow-900 mb-2">AI Processing</h3>
                          <p className="text-yellow-800">Document is being processed for OCR and analysis...</p>
                          <div className="mt-2 h-2 bg-yellow-200 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-600 rounded-full animate-pulse" style={{ width: '50%' }}></div>
                          </div>
                        </div>
                      )}

                      {/* Blockchain Verification */}
                      {blockchainVerification && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-green-900 mb-2">Blockchain Verified</h3>
                          <p className="text-green-800">Transaction ID: {blockchainVerification.txId}</p>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => processDocumentWithAI()}
                            disabled={processingStatus === 'processing'}
                            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                          >
                            Process with AI
                          </button>
                          <button
                            onClick={() => setShowChat(true)}
                            className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            Ask Questions
                          </button>
                          <button
                            onClick={() => onDownload(file)}
                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            Download Original
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Document controls */}
          <div className="px-6 py-3 bg-gray-50 border-t flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {file.type === 'pdf' && (
                <>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-1 rounded hover:bg-gray-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <span className="text-sm text-gray-600">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="p-1 rounded hover:bg-gray-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {showDetails && (
          <div className="w-80 border-l bg-gray-50 overflow-auto">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'details' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'comments' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('comments')}
              >
                Comments
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'history' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('history')}
              >
                History
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'security' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('security')}
              >
                Security
              </button>
            </div>

            {/* Tab content */}
            <div className="p-4">
              {/* Details tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">File Information</h3>
                    <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Type</span>
                        <span className="text-sm font-medium text-gray-900">
                          {file.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Size</span>
                        <span className="text-sm font-medium text-gray-900">
                          {file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Created</span>
                        <span className="text-sm font-medium text-gray-900">
                          {file.createdAt
                            ? new Date(file.createdAt).toLocaleDateString()
                            : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Modified</span>
                        <span className="text-sm font-medium text-gray-900">
                          {file.lastModified
                            ? new Date(file.lastModified).toLocaleDateString()
                            : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Owner</span>
                        <span className="text-sm font-medium text-gray-900">{file.owner}</span>
                      </div>
                      {file.signatureStatus && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Signature Status</span>
                          <span
                            className={`text-sm font-medium ${file.signatureStatus === 'awaiting' ? 'text-yellow-600' : 'text-green-600'}`}
                          >
                            {file.signatureStatus === 'awaiting' ? 'Awaiting Signature' : 'Signed'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {file.sharedWith && file.sharedWith.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Shared With</h3>
                      <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
                        {file.sharedWith.map(user => (
                          <div key={user.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                              {user.permission}
                            </span>
                          </div>
                        ))}
                        <button className="w-full mt-2 flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-700 p-2 border border-dashed border-gray-300 rounded-md">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Share with more people
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Comments tab */}
              {activeTab === 'comments' && (
                <div>
                  <div className="mb-4">
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full p-3 border rounded-lg text-sm"
                      rows={3}
                    ></textarea>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleAddComment}
                        disabled={!comment.trim()}
                        className={`px-3 py-1.5 rounded-md text-sm ${comment.trim() ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-100 text-gray-400'}`}
                      >
                        Add Comment
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {comments.length > 0 ? (
                      comments.map(comment => (
                        <div key={comment.id} className="bg-white rounded-lg shadow-sm p-4">
                          <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 flex-shrink-0">
                              {comment.user.charAt(0) || '?'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {comment.user}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-700">{comment.text}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-6">
                        <svg
                          className="w-10 h-10 text-gray-300 mx-auto"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">No comments yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* History tab - Immutable Ledger Trail */}
              {activeTab === 'history' && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
                    Immutable Ledger Trail
                  </h4>

                  {/* Blockchain verification status */}
                  {file.blockchainVerified && file.blockchainTxId && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center text-green-800">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Verified on Blockchain</span>
                      </div>
                      <div className="mt-2 text-xs text-green-700">
                        <p>Transaction: {file.blockchainTxId?.substring(0, 10)}...</p>
                      </div>
                    </div>
                  )}

                  {/* Version History with Ledger Info */}
                  {file.versionHistory && file.versionHistory.length > 0 ? (
                    <ul className="space-y-4">
                      {file.versionHistory.map((version, index) => (
                        <li key={index} className="relative flex items-start space-x-3">
                          {/* Connection line */}
                          {index < file.versionHistory.length - 1 && (
                            <div className="absolute top-6 left-3 w-0.5 h-full bg-gray-300" />
                          )}
                          
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center z-10">
                            <span className="text-xs font-medium">{index + 1}</span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                              <p className="text-sm font-medium text-gray-900">
                                {version.createdBy === 'You' ? 'You' : version.createdBy}{' '}
                                <span className="font-normal text-gray-600">
                                  {version.notes || 'Updated document'}
                                </span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(version.createdAt).toLocaleString()}
                              </p>
                              
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">No ledger history available</p>
                      <p className="text-xs text-gray-400 mt-1">Upload and verify documents to create an immutable trail</p>
                    </div>
                  )}
                  
                  {/* Auto-sync status */}
                  <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-600 text-center">
                    <span className="inline-flex items-center">
                      <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Auto-sync enabled • Real-time ledger updates
                    </span>
                  </div>
                </div>
              )}

              {/* Security tab */}
              {activeTab === 'security' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Security & Verification
                  </h4>

                  {blockchainInfo ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-green-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            Blockchain Verified
                          </h3>
                          <div className="mt-2 text-xs text-green-700">
                            <p>Transaction: {blockchainInfo.transactionHash.substr(0, 10)}...</p>
                            <p className="mt-1">Block: {blockchainInfo.blockNumber}</p>
                            <p className="mt-1">Network: {blockchainInfo.network}</p>
                            <p className="mt-1">
                              Timestamp: {new Date(blockchainInfo.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">
                        Certify this document on blockchain to ensure its authenticity and
                        integrity.
                      </p>
                      <button
                        onClick={handleCertifyDocument}
                        disabled={isCertifying}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {isCertifying ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Certifying...
                          </>
                        ) : (
                          <>
                            <svg
                              className="-ml-1 mr-2 h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                            Certify on Blockchain
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Access Control
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span className="text-sm text-gray-600">Password Protected</span>
                        <span className="text-sm font-medium text-gray-900">
                          {file.isPasswordProtected ? 'Yes' : 'No'}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-sm text-gray-600">Encryption</span>
                        <span className="text-sm font-medium text-gray-900">
                          {file.encryptionStatus || 'None'}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-sm text-gray-600">Expiration</span>
                        <span className="text-sm font-medium text-gray-900">
                          {file.expirationDate
                            ? new Date(file.expirationDate).toLocaleDateString()
                            : 'Never'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Document toolbar */}
      <div className="px-6 py-3 bg-gray-100 border-t flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`px-3 py-1.5 rounded-md text-sm flex items-center ${showDetails ? 'bg-primary-600 text-white' : 'bg-white border text-gray-700'}`}
          >
            <svg
              className={`-ml-0.5 mr-2 h-4 w-4 ${showDetails ? 'text-primary-500' : 'text-gray-400'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>

          <button
            onClick={processDocumentWithAI}
            disabled={processingStatus === 'processing'}
            className={`px-3 py-1.5 rounded-md text-sm flex items-center ${
              processingStatus === 'processing' 
                ? 'bg-gray-100 text-gray-400' 
                : processingStatus === 'completed'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
            }`}
          >
            {processingStatus === 'processing' ? (
              <>
                <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : processingStatus === 'completed' ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                AI Processed
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Process
              </>
            )}
          </button>

          <button className="px-3 py-1.5 bg-white border rounded-md text-sm text-gray-700 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          {file.type === 'pdf' && <span>Page 1 of 1</span>}
        </div>
      </div>

      {/* Blockchain lock modal */}
      {showBlockchainLockModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-3/4 max-w-4xl">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setShowBlockchainLockModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <FilelockBlockchainService
                file={file}
                onComplete={handleFileUpdate}
                onCancel={() => setShowBlockchainLockModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Share modal */}
      <ShareDocumentModal
        file={file}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={(recipients) => {
          // Call the parent onShare with the file
          onShare(file);
          setShowShareModal(false);
          // You could also handle the recipients here if needed
          // Recipients: recipients
        }}
      />

      {/* Chat panel - Made larger for better visibility */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-4/5 max-w-5xl h-5/6 bg-white rounded-lg shadow-2xl flex flex-col">
            <FileChatPanel
              file={file}
              onClose={() => setShowChat(false)}
            initialPrompt={selectedPrompt}
            documentData={{
              summary: documentSummary,
              extractedData: extractedData,
              ocr: ocr,
            }}
          />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
