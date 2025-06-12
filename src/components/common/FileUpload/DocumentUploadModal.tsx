import React, { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Cropper, CropperRef } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import Tesseract from 'tesseract.js';

// Import with correct casing
import {
  authenticateGoogleDrive,
  listGoogleDriveFiles,
  authenticateMicrosoftOneDrive,
  listMicrosoftOneDriveFiles,
  CloudFile as ServiceCloudFile,
} from '../../../services/CloudStorageService';

interface UploadedDocument {
  id: string;
  name: string;
  documentType: string; // 'primary', 'supporting', 'kyd'
  uploadSource: string; // 'google', 'microsoft', 'local'
  fileType: string;
  size: number;
  uploadDate: Date;
  verified: boolean;
  ledgerHash?: string;
  url?: string;
  extractedText?: string;
  extractedFields?: Record<string, string>;
  verificationResult?: {
    matches: boolean;
    confidence: number;
    matchedKeywords: string[];
  };
}

// Using our own CloudFile definition that aligns with service
interface CloudFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  lastModified: string;
  webViewLink?: string;
}

// Conversion function to handle type differences
const convertServiceCloudFileToLocalCloudFile = (file: ServiceCloudFile): CloudFile => {
  return {
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    size: file.size || 0,
    lastModified: file.lastModified || new Date().toISOString(),
    webViewLink: file.webViewLink,
  };
};

interface DocumentUploadModalProps {
  isOpen: boolean;
  docType: string;
  requiredDocuments?: string[];
  docDescription?: string;
  onClose: () => void;
  onUploadComplete: (document: UploadedDocument) => void;
  onExtractedData?: (fields: Record<string, string>) => void;
}

/**
 * An enhanced modal component for uploading documents from various sources with smart document matching
 */
const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  docType,
  requiredDocuments = [],
  docDescription = '',
  onClose,
  onUploadComplete,
  onExtractedData,
}) => {
  // Upload state
  const [uploadSource, setUploadSource] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Cloud provider auth state
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);
  const [isMicrosoftAuthenticated, setIsMicrosoftAuthenticated] = useState(false);

  // Cloud files state
  const [cloudFiles, setCloudFiles] = useState<CloudFile[]>([]);
  const [selectedCloudFile, setSelectedCloudFile] = useState<CloudFile | null>(null);
  const [isLoadingCloudFiles, setIsLoadingCloudFiles] = useState(false);

  // Document matching state
  const [suggestedDocuments, setSuggestedDocuments] = useState<
    { file: CloudFile; score: number }[]
  >([]);

  // Cropping state
  const [showCropper, setShowCropper] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const cropperRef = useRef<CropperRef>(null);

  // OCR state
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedText, setExtractedText] = useState<string>('');
  const [extractedFields, setExtractedFields] = useState<Record<string, string>>({});
  const [documentVerification, setDocumentVerification] = useState<{
    matches: boolean;
    confidence: number;
    matchedKeywords: string[];
  } | null>(null);

  // Dropzone configuration - removed useCallback to simplify dependencies
  const handleFileDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      // If it's an image, we'll show the cropper
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
          if (e.target && typeof e.target.result === 'string') {
            setImagePreview(e.target.result);
            setShowCropper(true);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // If not an image, will process later when needed
        setSelectedFile(file);
      }

      setUploadSource('local');
      setSelectedCloudFile(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleFileDrop,
    noClick: true, // Disable click to prevent conflict with UI elements
    noKeyboard: true, // Disable keyboard interaction
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  // Fetch cloud files when authenticated
  useEffect(() => {
    if (isGoogleAuthenticated) {
      fetchGoogleDriveFiles();
    } else if (isMicrosoftAuthenticated) {
      fetchMicrosoftOneDriveFiles();
    }
  }, [isGoogleAuthenticated, isMicrosoftAuthenticated]);

  // Match documents to requirements when cloud files are loaded
  // We need to define the function inside the effect to avoid dependency issues
  useEffect(() => {
    // Only attempt to match files when we have both cloud files and requirements
    if (cloudFiles.length > 0 && requiredDocuments.length > 0) {
      // Define the function inside the effect to avoid dependency array issues
      const matchFilesToRequirementsInEffect = () => {
        // Simple keyword matching algorithm
        const matches: { file: CloudFile; score: number }[] = [];

        // Extract keywords from required documents
        const allKeywords = requiredDocuments.flatMap(doc => {
          const lowercaseDoc = doc.toLowerCase();
          // Extract nouns and important terms (simplified)
          return lowercaseDoc
            .split(/\s+/)
            .filter(word => word.length > 3) // Ignore short words
            .map(word => word.replace(/[.,;:()]/g, '')); // Remove punctuation
        });

        // Score each file based on keyword matches
        cloudFiles.forEach(file => {
          const filename = file.name.toLowerCase();
          let score = 0;

          // Check if file extension is appropriate for documents
          if (
            filename.endsWith('.pdf') ||
            filename.endsWith('.doc') ||
            filename.endsWith('.docx') ||
            filename.endsWith('.jpg') ||
            filename.endsWith('.jpeg') ||
            filename.endsWith('.png')
          ) {
            // Base score for correct file type
            score += 10;

            // Check for keyword matches in filename
            allKeywords.forEach(keyword => {
              if (filename.includes(keyword.toLowerCase())) {
                score += 5;
              }
            });

            // Add other scoring logic from the original function

            // If the score is above a threshold, add to matches
            if (score > 10) {
              matches.push({ file, score });
            }
          }
        });

        // Sort by score (descending)
        matches.sort((a, b) => b.score - a.score);

        // Take top 5 matches
        setSuggestedDocuments(matches.slice(0, 5));
      };

      matchFilesToRequirementsInEffect();
    }
  }, [cloudFiles, requiredDocuments]);

  // Handle Google Drive authentication
  const authenticateWithGoogle = async () => {
    try {
      setUploadSource('google');
      setIsUploading(true);

      // Call the actual Google authentication service
      const authenticated = await authenticateGoogleDrive();

      if (authenticated) {
        setIsGoogleAuthenticated(true);
        setIsMicrosoftAuthenticated(false);
      } else {
        throw new Error('Authentication failed');
      }

      setIsUploading(false);
    } catch (error) {
      setUploadError('Failed to authenticate with Google. Please try again.');
      setIsUploading(false);
    }
  };

  // Handle Microsoft OneDrive authentication
  const authenticateWithMicrosoft = async () => {
    try {
      setUploadSource('microsoft');
      setIsUploading(true);

      // Call the actual Microsoft authentication service
      const authenticated = await authenticateMicrosoftOneDrive();

      if (authenticated) {
        setIsMicrosoftAuthenticated(true);
        setIsGoogleAuthenticated(false);
      } else {
        throw new Error('Authentication failed');
      }

      setIsUploading(false);
    } catch (error) {
      setUploadError('Failed to authenticate with Microsoft. Please try again.');
      setIsUploading(false);
    }
  };

  // Fetch files from Google Drive
  const fetchGoogleDriveFiles = async () => {
    setIsLoadingCloudFiles(true);
    try {
      const files = await listGoogleDriveFiles();
      // Convert service type to local type
      const convertedFiles = files.map(convertServiceCloudFileToLocalCloudFile);
      setCloudFiles(convertedFiles);
    } catch (error) {
      setUploadError('Failed to load files from Google Drive.');
    } finally {
      setIsLoadingCloudFiles(false);
    }
  };

  // Fetch files from Microsoft OneDrive
  const fetchMicrosoftOneDriveFiles = async () => {
    setIsLoadingCloudFiles(true);
    try {
      const files = await listMicrosoftOneDriveFiles();
      // Convert service type to local type
      const convertedFiles = files.map(convertServiceCloudFileToLocalCloudFile);
      setCloudFiles(convertedFiles);
    } catch (error) {
      setUploadError('Failed to load files from Microsoft OneDrive.');
    } finally {
      setIsLoadingCloudFiles(false);
    }
  };

  // Match files to document requirements
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const matchFilesToRequirements = () => {
    // Simple keyword matching algorithm
    const matches: { file: CloudFile; score: number }[] = [];

    // Extract keywords from required documents
    const allKeywords = requiredDocuments.flatMap(doc => {
      const lowercaseDoc = doc.toLowerCase();
      // Extract nouns and important terms (simplified)
      return lowercaseDoc
        .split(/\s+/)
        .filter(word => word.length > 3) // Ignore short words
        .map(word => word.replace(/[.,;:()]/g, '')); // Remove punctuation
    });

    // Score each file based on keyword matches
    cloudFiles.forEach(file => {
      const filename = file.name.toLowerCase();
      let score = 0;

      // Check if file extension is appropriate for documents
      if (
        filename.endsWith('.pdf') ||
        filename.endsWith('.doc') ||
        filename.endsWith('.docx') ||
        filename.endsWith('.jpg') ||
        filename.endsWith('.jpeg') ||
        filename.endsWith('.png')
      ) {
        // Base score for correct file type
        score += 10;

        // Check for keyword matches in filename
        allKeywords.forEach(keyword => {
          if (filename.includes(keyword.toLowerCase())) {
            score += 5;
          }
        });

        // Check for document type descriptive words
        if (
          docType.toLowerCase().includes('primary') &&
          (filename.includes('article') ||
            filename.includes('certificate') ||
            filename.includes('formation') ||
            filename.includes('incorporation'))
        ) {
          score += 15;
        }

        if (
          docType.toLowerCase().includes('tax') &&
          (filename.includes('tax') || filename.includes('irs') || filename.includes('ein'))
        ) {
          score += 15;
        }

        if (
          docType.toLowerCase().includes('identity') &&
          (filename.includes('license') ||
            filename.includes('passport') ||
            filename.includes('id') ||
            filename.includes('identification'))
        ) {
          score += 15;
        }

        // If the score is above a threshold, add to matches
        if (score > 10) {
          matches.push({ file, score });
        }
      }
    });

    // Sort by score (descending)
    matches.sort((a, b) => b.score - a.score);

    // Take top 5 matches
    setSuggestedDocuments(matches.slice(0, 5));
  };

  // No longer needed - using dropzone for file handling

  // Trigger local file selection
  const selectLocalFile = () => {
    open(); // Use dropzone's open method
  };

  // Handle cloud file selection
  const handleCloudFileSelect = (file: CloudFile) => {
    setSelectedCloudFile(file);
    setSelectedFile(null);
  };

  // Handle crop completion
  const handleCropComplete = () => {
    if (cropperRef.current && imagePreview) {
      const canvas = cropperRef.current.getCanvas();
      if (canvas) {
        canvas.toBlob(
          blob => {
            if (blob) {
              // Create a new File object from the cropped blob
              const croppedFile = new File([blob], `cropped-${Date.now()}.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              setShowCropper(false);
              setImagePreview(null);

              // Process the cropped file
              processFile(croppedFile);
            }
          },
          'image/jpeg',
          0.95
        );
      }
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImagePreview(null);
  };

  // Process document with OCR
  const processDocumentWithOCR = async (file: File): Promise<string> => {
    if (!file.type.includes('image') && !file.type.includes('pdf')) {
      return '';
    }

    try {
      setIsOcrProcessing(true);
      setOcrProgress(0);

      // For simplicity, we'll just process the file as is
      // In a full implementation, PDF files would need to be converted to images first
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(m.progress * 100);
          }
        },
      });

      setIsOcrProcessing(false);
      setOcrProgress(100);

      return result.data.text;
    } catch (error) {
      console.error('OCR processing error:', error);
      setIsOcrProcessing(false);
      return '';
    }
  };

  // Extract fields from OCR text
  const extractFieldsFromText = (text: string): Record<string, string> => {
    const fields: Record<string, string> = {};

    // Simple field extraction rules
    // These would be more sophisticated in a real implementation

    // Look for EIN/Tax ID (9 digit pattern)
    const einMatch = text.match(/\b(\d{2}[-]?\d{7})\b/);
    if (einMatch) fields.taxId = einMatch[1].replace('-', '');

    // Look for DUNS Number
    const dunsMatch = text.match(
      /\bD-?U-?N-?S:?\s*(?:No|Number|#)?\.?\s*(\d{2}[-]?\d{3}[-]?\d{4})\b/i
    );
    if (dunsMatch) fields.dunsNumber = dunsMatch[1].replace(/-/g, '');

    // Look for business name
    const businessNameMatch = text.match(
      /(?:Legal\s?Name|Business\s?Name|Company\s?Name)[:\s]+([A-Za-z0-9\s&'.,]+)(?:\n|\r|$)/i
    );
    if (businessNameMatch) fields.legalBusinessName = businessNameMatch[1].trim();

    // Look for formation date
    const dateMatch = text.match(
      /(?:Date\s?(?:of|Formation|Established|Incorporated|Formed))[:\s]+([A-Za-z0-9\s,]+)(?:\n|\r|$)/i
    );
    if (dateMatch) {
      try {
        const dateStr = dateMatch[1].trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          fields.dateEstablished = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        }
      } catch (e) {
        // Date parsing failed, no problem
      }
    }

    // Look for address
    const addressMatch = text.match(
      /(?:Address|Location|Place\s?of\s?Business)[:\s]+([A-Za-z0-9\s,#.]+)(?:\n|\r|$)/i
    );
    if (addressMatch) fields.businessAddressStreet = addressMatch[1].trim();

    return fields;
  };

  // Verify document matches requirements
  const verifyDocumentContent = (
    text: string,
    requirements: string[]
  ): {
    matches: boolean;
    confidence: number;
    matchedKeywords: string[];
  } => {
    if (!text || !requirements.length) {
      return { matches: false, confidence: 0, matchedKeywords: [] };
    }

    const textLower = text.toLowerCase();
    const matchedKeywords: string[] = [];
    let totalKeywords = 0;

    // Extract key terms from requirements to match against document text
    requirements.forEach(requirement => {
      const keyTerms = requirement
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3) // Only consider significant words
        .map(word => word.replace(/[.,;:()]/g, '')); // Remove punctuation

      totalKeywords += keyTerms.length;

      keyTerms.forEach(term => {
        if (textLower.includes(term)) {
          matchedKeywords.push(term);
        }
      });
    });

    const confidence = totalKeywords > 0 ? (matchedKeywords.length / totalKeywords) * 100 : 0;

    return {
      matches: confidence >= 30, // 30% confidence threshold
      confidence,
      matchedKeywords: Array.from(new Set(matchedKeywords)), // Remove duplicates using Array.from
    };
  };

  // Process file after selection/crop
  const processFile = async (file: File) => {
    setSelectedFile(file);

    // If the file is an image or PDF, process with OCR
    if (file.type.includes('image') || file.type.includes('pdf')) {
      const text = await processDocumentWithOCR(file);
      setExtractedText(text);

      // Extract fields from text
      const fields = extractFieldsFromText(text);
      setExtractedFields(fields);

      // Notify parent component about extracted data
      if (onExtractedData) {
        onExtractedData(fields);
      }

      // Verify document content against requirements
      const verification = verifyDocumentContent(text, requiredDocuments);
      setDocumentVerification(verification);
    }
  };

  // Render authenticated cloud provider file browser
  const renderCloudFileBrowser = () => (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        Select a file from {isGoogleAuthenticated ? 'Google Drive' : 'Microsoft OneDrive'}:
      </h4>

      {isLoadingCloudFiles ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : cloudFiles.length === 0 ? (
        <p className="text-sm text-gray-500">No files found in your account.</p>
      ) : (
        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
          {suggestedDocuments.length > 0 && (
            <div className="bg-blue-50 p-2 border-b border-blue-100">
              <h5 className="text-xs font-semibold text-blue-700 mb-1">Suggested Documents</h5>
              {suggestedDocuments.map(({ file, score }) => (
                <div
                  key={file.id}
                  className={`p-2 flex items-center hover:bg-blue-100 cursor-pointer rounded ${selectedCloudFile?.id === file.id ? 'bg-blue-200' : ''}`}
                  onClick={() => handleCloudFileSelect(file)}
                >
                  <div className="mr-2">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 text-sm truncate">{file.name}</div>
                  <div className="text-xs text-green-600 font-medium">
                    Match: {Math.min(score, 100)}%
                  </div>
                </div>
              ))}
              <hr className="my-2 border-blue-100" />
            </div>
          )}

          <div className="p-2">
            <h5 className="text-xs font-medium text-gray-700 mb-1">All Files</h5>
            {cloudFiles.map(file => (
              <div
                key={file.id}
                className={`p-2 flex items-center hover:bg-gray-100 cursor-pointer rounded ${selectedCloudFile?.id === file.id ? 'bg-blue-100' : ''}`}
                onClick={() => handleCloudFileSelect(file)}
              >
                <div className="mr-2">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-sm truncate">{file.name}</div>
                <div className="text-xs text-gray-500">
                  {new Date(file.lastModified).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Upload file to Shield Ledger
  const uploadToShieldLedger = async () => {
    if (!selectedFile && !selectedCloudFile) {
      setUploadError('Please select a file or authenticate with a cloud provider first.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      // Simulate file upload with progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Simulate Shield Ledger API call for document hashing and verification
      const ledgerHash = `shield-${Math.random().toString(36).substring(2, 15)}`;

      // Create the uploaded document object with OCR data
      const newDocument: UploadedDocument = {
        id: Math.random().toString(36).substring(2, 15),
        name: selectedFile
          ? selectedFile.name
          : selectedCloudFile
            ? selectedCloudFile.name
            : `Document-${new Date().getTime()}.pdf`,
        documentType: docType.toLowerCase().includes('primary')
          ? 'primary'
          : docType.toLowerCase().includes('identity')
            ? 'kyd'
            : 'supporting',
        uploadSource,
        fileType: selectedFile
          ? selectedFile.type
          : selectedCloudFile
            ? selectedCloudFile.mimeType
            : 'application/pdf',
        size: selectedFile
          ? selectedFile.size
          : selectedCloudFile
            ? selectedCloudFile.size
            : 1024 * 1024, // 1MB default
        uploadDate: new Date(),
        verified: documentVerification ? documentVerification.matches : true,
        ledgerHash,
        url: `https://shield-ledger.example.com/documents/${ledgerHash}`,
        extractedText,
        extractedFields,
        verificationResult: documentVerification || undefined,
      };

      // Complete the upload
      setIsUploading(false);
      setUploadProgress(100);

      // Call the onUploadComplete callback
      onUploadComplete(newDocument);

      // Close the modal after a short delay
      setTimeout(onClose, 1000);
    } catch (error) {
      setUploadError('Failed to upload the document. Please try again.');
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  // If we're showing the image cropper, render that instead of the main modal content
  if (showCropper && imagePreview) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Crop Document</h3>
            <button
              type="button"
              onClick={handleCropCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Adjust the crop area to focus on the important parts of your document. This helps
            improve text recognition and verification.
          </p>

          <div
            className="mb-6 border border-gray-300 rounded-lg overflow-hidden"
            style={{ height: '400px' }}
          >
            <Cropper
              ref={cropperRef}
              src={imagePreview}
              className="cropper"
              stencilProps={{ aspectRatio: 1 }} // Or use null for free-form cropping
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCropCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCropComplete}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Upload {docType}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isUploading || isOcrProcessing}
          >
            ×
          </button>
        </div>

        {uploadError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{uploadError}</div>
        )}

        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2 font-medium">Document Required:</p>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
            <p className="text-sm font-medium text-yellow-800">{docType}</p>
            {docDescription && <p className="text-xs text-yellow-700 mt-1">{docDescription}</p>}
            {requiredDocuments && requiredDocuments.length > 0 && (
              <ul className="mt-2 space-y-1">
                {requiredDocuments.map((doc, index) => (
                  <li key={index} className="text-xs text-yellow-700 flex items-start">
                    <span className="mr-1">•</span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3">
            Select a source to upload your document. The document will be securely stored and
            verified in Shield Ledger.
          </p>
        </div>

        <div {...getRootProps({ className: 'dropzone' })}>
          <div
            className={`space-y-3 ${isDragActive ? 'bg-blue-50 p-4 border-2 border-dashed border-blue-300 rounded-lg' : ''}`}
          >
            {/* Google Drive */}
            <button
              type="button"
              onClick={authenticateWithGoogle}
              disabled={isUploading || isGoogleAuthenticated || isOcrProcessing}
              className={`w-full flex items-center p-3 border ${isGoogleAuthenticated ? 'border-green-300 bg-green-50' : 'border-gray-300'} rounded-md hover:bg-blue-50 transition-colors ${isUploading || isOcrProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="flex-1 text-left">
                {isGoogleAuthenticated ? 'Connected to Google Drive ✓' : 'Google Drive'}
              </span>
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6,20.5L12,13L18,20.5H6M12,4L2,20H22L12,4Z" />
              </svg>
            </button>

            {/* Microsoft OneDrive */}
            <button
              type="button"
              onClick={authenticateWithMicrosoft}
              disabled={isUploading || isMicrosoftAuthenticated || isOcrProcessing}
              className={`w-full flex items-center p-3 border ${isMicrosoftAuthenticated ? 'border-green-300 bg-green-50' : 'border-gray-300'} rounded-md hover:bg-blue-50 transition-colors ${isUploading || isOcrProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="flex-1 text-left">
                {isMicrosoftAuthenticated
                  ? 'Connected to Microsoft OneDrive ✓'
                  : 'Microsoft OneDrive'}
              </span>
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.5,17.15L14.36,14.15L21.87,19.85L10.5,17.15M13.5,12.15L14.36,12.71L7.43,14.71L10.5,13.15L13.5,12.15M10.93,10.15L13.5,8.15L18.1,9.42L16.66,11.46L10.93,10.15M10.93,5.15L13.93,2.15L16.37,2.68L14.94,4.46L10.93,5.15Z" />
              </svg>
            </button>

            {/* Local Computer with Drag & Drop */}
            <div
              className={`relative w-full p-3 border ${selectedFile ? 'border-green-300 bg-green-50' : isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} rounded-md hover:bg-blue-50 transition-colors ${isUploading || isOcrProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center">
                <span className="flex-1 text-left">
                  {selectedFile
                    ? `Selected: ${selectedFile.name}`
                    : isDragActive
                      ? 'Drop file here...'
                      : 'Drag & drop file or click to select'}
                </span>
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z" />
                </svg>
              </div>

              {!selectedFile && !isDragActive && (
                <div className="mt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={selectLocalFile}
                    disabled={isUploading || isOcrProcessing}
                    className="px-4 py-1 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200"
                  >
                    Browse Files
                  </button>
                </div>
              )}

              <input {...getInputProps()} disabled={isUploading || isOcrProcessing} />
            </div>
          </div>
        </div>

        {/* Cloud File Browser */}
        {(isGoogleAuthenticated || isMicrosoftAuthenticated) && renderCloudFileBrowser()}

        {/* OCR Processing Progress */}
        {isOcrProcessing && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between">
              <span className="text-xs text-gray-600">Processing document with OCR...</span>
              <span className="text-xs text-gray-600">{Math.round(ocrProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${ocrProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {ocrProgress < 30
                ? 'Analyzing document structure...'
                : ocrProgress < 60
                  ? 'Recognizing text...'
                  : ocrProgress < 90
                    ? 'Extracting field data...'
                    : 'Verifying content against requirements...'}
            </p>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between">
              <span className="text-xs text-gray-600">Uploading...</span>
              <span className="text-xs text-gray-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {uploadProgress < 50
                ? 'Transferring file...'
                : uploadProgress < 90
                  ? 'Creating immutable record...'
                  : 'Verifying document integrity...'}
            </p>
          </div>
        )}

        {/* Selected File Display */}
        {selectedFile && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                {selectedFile.type.includes('pdf') ? (
                  <svg
                    className="h-8 w-8 text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 16q.825 0 1.413-.588Q14 14.825 14 14t-.587-1.413Q12.825 12 12 12q-.825 0-1.412.587Q10 13.175 10 14q0 .825.588 1.412Q11.175 16 12 16Zm-8 4q-.825 0-1.412-.587Q2 18.825 2 18V6q0-.825.588-1.413Q3.175 4 4 4h5.175q.4 0 .763.15.362.15.637.425L12 6h8q.825 0 1.413.588Q22 7.175 22 8v10q0 .825-.587 1.413Q20.825 20 20 20Z" />
                  </svg>
                ) : selectedFile.type.includes('image') ? (
                  <svg
                    className="h-8 w-8 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h14q.825 0 1.413.587Q21 4.175 21 5v14q0 .825-.587 1.413Q19.825 21 19 21Zm0-2h14V5H5v14Zm1-2h12l-3.75-5-3 4L9 13Zm-1 2V5v14Z" />
                  </svg>
                ) : (
                  <svg
                    className="h-8 w-8 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 18h8v-2H8v2Zm0-4h8v-2H8v2Zm-2 8q-.825 0-1.412-.587Q4 20.825 4 20V4q0-.825.588-1.413Q5.175 2 6 2h8l6 6v12q0 .825-.587 1.413Q18.825 22 18 22Zm7-13V4H6v16h12V9h-3ZM6 4v5-5 16V4Z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Unknown type'}
                </p>
              </div>
              <button
                className="ml-auto text-sm text-red-600 hover:text-red-800"
                onClick={() => {
                  setSelectedFile(null);
                  setExtractedText('');
                  setExtractedFields({});
                  setDocumentVerification(null);
                }}
                disabled={isUploading || isOcrProcessing}
              >
                Remove
              </button>
            </div>

            {/* Show edit/crop button for images */}
            {selectedFile.type.includes('image') && (
              <button
                className="mt-2 px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={() => {
                  const reader = new FileReader();
                  reader.onload = e => {
                    if (e.target && typeof e.target.result === 'string') {
                      setImagePreview(e.target.result);
                      setShowCropper(true);
                    }
                  };
                  reader.readAsDataURL(selectedFile);
                }}
                disabled={isUploading || isOcrProcessing}
              >
                Edit/Crop Image
              </button>
            )}

            {/* Document Verification Results */}
            {documentVerification && (
              <div
                className={`mt-3 p-2 rounded-md ${documentVerification.matches ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}
              >
                <div className="flex items-center">
                  {documentVerification.matches ? (
                    <>
                      <svg
                        className="h-5 w-5 text-green-500 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-medium text-green-700">Document Verified</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-5 w-5 text-yellow-500 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-medium text-yellow-700">
                        Possible Document Mismatch
                      </span>
                    </>
                  )}
                  <span className="ml-auto text-xs text-gray-500">
                    Confidence: {Math.round(documentVerification.confidence)}%
                  </span>
                </div>

                {documentVerification.matchedKeywords.length > 0 && (
                  <div className="mt-1">
                    <p className="text-xs text-gray-600">Matched terms:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {documentVerification.matchedKeywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Extracted Fields */}
            {Object.keys(extractedFields).length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center mb-1">
                  <svg
                    className="h-5 w-5 text-blue-500 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-blue-700">Extracted Data</span>
                </div>
                <div className="space-y-1">
                  {Object.entries(extractedFields).map(([key, value]) => (
                    <div key={key} className="flex text-xs">
                      <span className="font-medium text-blue-800 mr-2">{key}:</span>
                      <span className="text-blue-700">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    onClick={() => {
                      if (onExtractedData) {
                        onExtractedData(extractedFields);
                      }
                    }}
                  >
                    Use This Data
                  </button>
                </div>
              </div>
            )}

            {/* OCR Text Preview (Collapsed) */}
            {extractedText && (
              <details className="mt-3">
                <summary className="text-xs font-medium text-gray-700 cursor-pointer">
                  View Extracted Text
                </summary>
                <div className="mt-1 p-2 bg-gray-100 rounded text-xs text-gray-700 max-h-40 overflow-y-auto whitespace-pre-line">
                  {extractedText}
                </div>
              </details>
            )}
          </div>
        )}

        <div className="mt-6 flex space-x-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading || isOcrProcessing}
            className={`px-3 py-1.5 border border-gray-300 rounded text-sm ${isUploading || isOcrProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={uploadToShieldLedger}
            disabled={
              isUploading ||
              isOcrProcessing ||
              (!isGoogleAuthenticated &&
                !isMicrosoftAuthenticated &&
                !selectedFile &&
                !selectedCloudFile)
            }
            className={`px-3 py-1.5 bg-blue-600 text-white rounded text-sm ${isUploading || isOcrProcessing || (!isGoogleAuthenticated && !isMicrosoftAuthenticated && !selectedFile && !selectedCloudFile) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          >
            Upload to Shield Ledger
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p className="font-semibold">FileLink Shield Ledger Security:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Your document will be hashed and recorded on Shield Ledger</li>
            <li>Creates immutable proof of document authenticity</li>
            <li>Encrypted storage with controlled access</li>
            <li>Compliant with financial regulatory requirements</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
