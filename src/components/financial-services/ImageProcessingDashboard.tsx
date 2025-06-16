import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PhotoIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  TrashIcon,
  ArrowDownTrayIcon as DownloadIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface ProcessedImage {
  id: string;
  fileName: string;
  originalUrl: string;
  processedUrl?: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  processedAt?: Date;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  documentType: 'tax_return' | 'bank_statement' | 'financial_statement' | 'id_document' | 'other';
  piiLevel: 'none' | 'low' | 'medium' | 'high';
  extractedData?: {
    text: string;
    entities: Array<{
      type: string;
      value: string;
      confidence: number;
    }>;
    tables?: Array<{
      headers: string[];
      rows: string[][];
    }>;
  };
  compliance: {
    watermarked: boolean;
    encrypted: boolean;
    accessLevel: 'public' | 'restricted' | 'confidential';
  };
  fileSize: number;
  dimensions?: {
    width: number;
    height: number;
  };
  loanApplicationId?: string;
}

interface ProcessingJob {
  id: string;
  imageId: string;
  type: 'ocr' | 'watermark' | 'thumbnail' | 'enhancement';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

const ImageProcessingDashboard: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [metrics, setMetrics] = useState({
    totalImages: 0,
    processingQueue: 0,
    completedToday: 0,
    storageUsed: 0,
    averageProcessingTime: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_IMAGES_URL}/api/v1/images`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json() as { images?: any[]; jobs?: any[]; metrics?: any; id?: string; url?: string };
        setImages(data.images || mockImages);
      } else {
        setImages(mockImages);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages(mockImages);
    }
  }, []);

  const fetchProcessingJobs = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_IMAGES_URL}/api/v1/processing/jobs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json() as { jobs?: any[] };
        setProcessingJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching processing jobs:', error);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_IMAGES_URL}/api/v1/metrics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json() as { metrics?: any };
        setMetrics(data.metrics || mockMetrics);
      } else {
        setMetrics(mockMetrics);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setMetrics(mockMetrics);
    }
  }, []);

  useEffect(() => {
    fetchImages();
    fetchProcessingJobs();
    fetchMetrics();
    
    // Poll for job updates every 5 seconds
    const interval = setInterval(() => {
      fetchProcessingJobs();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchImages, fetchProcessingJobs, fetchMetrics]);

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', 'other');
        formData.append('piiLevel', 'medium');
        formData.append('accessLevel', 'restricted');
        
        const response = await fetch(`${process.env.REACT_APP_IMAGES_URL}/api/v1/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json() as { id?: string; url?: string };
          const newImage: ProcessedImage = {
            id: data.id || Date.now().toString(),
            fileName: file.name,
            originalUrl: data.url || URL.createObjectURL(file),
            uploadedAt: new Date(),
            status: 'processing',
            documentType: 'other',
            piiLevel: 'medium',
            fileSize: file.size,
            compliance: {
              watermarked: false,
              encrypted: true,
              accessLevel: 'restricted',
            },
          };
          
          setImages(prev => [newImage, ...prev]);
          
          // Start processing
          startImageProcessing(newImage.id);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    
    setIsUploading(false);
  };

  const startImageProcessing = async (imageId: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_IMAGES_URL}/api/v1/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          imageId,
          operations: ['ocr', 'watermark', 'thumbnail'],
          complianceLevel: 'high',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update image status and add processing jobs
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, status: 'processing' }
            : img
        ));
      }
    } catch (error) {
      console.error('Error starting image processing:', error);
    }
  };

  const downloadImage = async (image: ProcessedImage) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_IMAGES_URL}/api/v1/download/${image.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = image.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_IMAGES_URL}/api/v1/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId));
        if (selectedImage?.id === imageId) {
          setSelectedImage(null);
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPiiLevelColor = (level: string) => {
    switch (level) {
      case 'none': return 'text-green-600 bg-green-100';
      case 'low': return 'text-yellow-600 bg-yellow-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredImages = images.filter(image => {
    const matchesFilter = filter === 'all' || image.status === filter || image.documentType === filter;
    const matchesSearch = searchTerm === '' || 
      image.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.extractedData?.text.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Image Processing</h1>
            <p className="text-gray-600 mt-1">OCR, watermarking, and secure document management</p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium flex items-center"
            >
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Images'}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{metrics.totalImages}</div>
            <div className="text-sm text-gray-600">Total Images</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.processingQueue}</div>
            <div className="text-sm text-gray-600">In Queue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.completedToday}</div>
            <div className="text-sm text-gray-600">Completed Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.storageUsed} MB</div>
            <div className="text-sm text-gray-600">Storage Used</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.averageProcessingTime}s</div>
            <div className="text-sm text-gray-600">Avg Processing</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Images List */}
        <div className="flex-1 flex flex-col">
          {/* Filters and Search */}
          <div className="bg-white px-6 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                {[
                  { value: 'all', label: 'All Images' },
                  { value: 'processing', label: 'Processing' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'failed', label: 'Failed' },
                  { value: 'tax_return', label: 'Tax Returns' },
                  { value: 'bank_statement', label: 'Bank Statements' },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      filter === f.value
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search images or extracted text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Images Grid */}
          <div className="flex-1 overflow-auto bg-white p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  {/* Image Thumbnail */}
                  <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                    {image.thumbnailUrl || image.originalUrl ? (
                      <img
                        src={image.thumbnailUrl || image.originalUrl}
                        alt={image.fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Image Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {image.fileName}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(image.status)}`}>
                        {image.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="capitalize">{image.documentType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{formatFileSize(image.fileSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PII Level:</span>
                        <span className={`px-1 rounded ${getPiiLevelColor(image.piiLevel)}`}>
                          {image.piiLevel.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uploaded:</span>
                        <span>{format(image.uploadedAt, 'MMM d')}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex space-x-1">
                        {image.compliance.watermarked && (
                          <ShieldCheckIcon className="h-4 w-4 text-green-500" title="Watermarked" />
                        )}
                        {image.compliance.encrypted && (
                          <ShieldCheckIcon className="h-4 w-4 text-blue-500" title="Encrypted" />
                        )}
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(image);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(image);
                          }}
                          className="p-1 text-gray-400 hover:text-green-600"
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(image.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Image Details Sidebar */}
        {selectedImage && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Image Details</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Image Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Preview</h4>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {selectedImage.originalUrl && (
                    <img
                      src={selectedImage.originalUrl}
                      alt={selectedImage.fileName}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>

              {/* File Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">File Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium">{selectedImage.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Size:</span>
                      <span className="text-sm font-medium">{formatFileSize(selectedImage.fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm font-medium capitalize">
                        {selectedImage.documentType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`text-sm font-medium ${getStatusColor(selectedImage.status).replace('bg-', 'text-').replace('-100', '-600')}`}>
                        {selectedImage.status}
                      </span>
                    </div>
                    {selectedImage.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Dimensions:</span>
                        <span className="text-sm font-medium">
                          {selectedImage.dimensions.width} × {selectedImage.dimensions.height}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Compliance & Security */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Compliance & Security</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">PII Level:</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded ${getPiiLevelColor(selectedImage.piiLevel)}`}>
                        {selectedImage.piiLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Access Level:</span>
                      <span className="text-sm font-medium text-blue-900 capitalize">
                        {selectedImage.compliance.accessLevel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Watermarked:</span>
                      <span className={`text-sm font-medium ${selectedImage.compliance.watermarked ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedImage.compliance.watermarked ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Encrypted:</span>
                      <span className={`text-sm font-medium ${selectedImage.compliance.encrypted ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedImage.compliance.encrypted ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extracted Data */}
              {selectedImage.extractedData && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Extracted Data</h4>
                  <div className="bg-green-50 rounded-lg p-4">
                    {/* Entities */}
                    {selectedImage.extractedData.entities && selectedImage.extractedData.entities.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-green-800 mb-2">Entities Found:</h5>
                        <div className="space-y-1">
                          {selectedImage.extractedData.entities.map((entity, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-green-700">{entity.type}:</span>
                              <span className="text-green-900 font-medium">{entity.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Text Content */}
                    <div>
                      <h5 className="text-sm font-medium text-green-800 mb-2">Extracted Text:</h5>
                      <div className="text-sm text-green-800 max-h-32 overflow-y-auto">
                        {selectedImage.extractedData.text.substring(0, 500)}
                        {selectedImage.extractedData.text.length > 500 && '...'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing History */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Processing History</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Uploaded: {format(selectedImage.uploadedAt, 'MMM d, yyyy h:mm a')}
                  </div>
                  {selectedImage.processedAt && (
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                      Processed: {format(selectedImage.processedAt, 'MMM d, yyyy h:mm a')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data for demo purposes
const mockImages: ProcessedImage[] = [
  {
    id: 'img-001',
    fileName: 'tax_return_2023.pdf',
    originalUrl: '/api/placeholder/400/300',
    thumbnailUrl: '/api/placeholder/400/300',
    uploadedAt: new Date('2024-01-15'),
    processedAt: new Date('2024-01-15'),
    status: 'completed',
    documentType: 'tax_return',
    piiLevel: 'high',
    fileSize: 2048576,
    dimensions: { width: 1200, height: 1600 },
    extractedData: {
      text: 'Form 1040 U.S. Individual Income Tax Return...',
      entities: [
        { type: 'SSN', value: '***-**-1234', confidence: 0.98 },
        { type: 'Income', value: '$85,000', confidence: 0.95 },
        { type: 'Name', value: 'John Smith', confidence: 0.99 },
      ],
    },
    compliance: {
      watermarked: true,
      encrypted: true,
      accessLevel: 'confidential',
    },
  },
  {
    id: 'img-002',
    fileName: 'bank_statement_jan.pdf',
    originalUrl: '/api/placeholder/400/300',
    uploadedAt: new Date('2024-01-16'),
    status: 'processing',
    documentType: 'bank_statement',
    piiLevel: 'medium',
    fileSize: 1536000,
    compliance: {
      watermarked: false,
      encrypted: true,
      accessLevel: 'restricted',
    },
  },
];

const mockMetrics = {
  totalImages: 1247,
  processingQueue: 23,
  completedToday: 156,
  storageUsed: 4832,
  averageProcessingTime: 8.4,
};

export default ImageProcessingDashboard; 