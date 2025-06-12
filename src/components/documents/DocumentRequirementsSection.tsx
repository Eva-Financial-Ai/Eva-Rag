/**
 * Enhanced Document Requirements Section
 * Now supports package-based requirements, credit profiles, and risk assessments
 * Displays dynamic document requirements based on sophisticated matching logic
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  DocumentRequirements,
  DocumentRequirement,
  DocumentCategory,
  CreditProfile,
  DealStage,
  DocumentSource,
  documentAutoRequestEngine,
} from '../../services/DocumentAutoRequestEngine';
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ExclamationCircleIcon as ErrorIcon,
  LinkIcon,
  CloudIcon,
} from '@heroicons/react/24/outline';

interface DocumentRequirementsSectionProps {
  requirements: DocumentRequirements;
  uploadedDocuments: Record<string, UploadedDocument>;
  loanAmount: number;
  onUpload: (documentType: string, file: File) => void;
  onRemoveDocument: (documentType: string) => void;
  loading?: boolean;
}

interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  status: 'uploading' | 'uploaded' | 'processing' | 'approved' | 'rejected';
  rejectionReason?: string;
}

const DocumentRequirementsSection: React.FC<DocumentRequirementsSectionProps> = ({
  requirements,
  uploadedDocuments,
  loanAmount,
  onUpload,
  onRemoveDocument,
  loading = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showHelper, setShowHelper] = useState(false);
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set());
  const [showRiskDetails, setShowRiskDetails] = useState(false);

  // Categorize documents
  const categorizedDocs = useMemo(() => {
    const categories: Record<string, DocumentRequirement[]> = {};

    // Initialize categories
    Object.values(DocumentCategory).forEach(cat => {
      categories[cat] = [];
    });

    // Sort documents into categories
    requirements.required.forEach(doc => {
      categories[doc.category].push(doc);
    });

    // Remove empty categories
    return Object.fromEntries(Object.entries(categories).filter(([_, docs]) => docs.length > 0));
  }, [requirements.required]);

  // Calculate completion stats
  const completionStats = useMemo(() => {
    const approvedCount = Object.values(uploadedDocuments).filter(
      doc => doc.status === 'approved'
    ).length;
    const uploadedCount = Object.values(uploadedDocuments).length;

    return {
      uploadedCount,
      requiredCount: requirements.required.length,
      approvedCount,
      uploadPercentage: Math.round((uploadedCount / Math.max(requirements.required.length, 1)) * 100),
      approvalPercentage: Math.round((approvedCount / Math.max(requirements.required.length, 1)) * 100),
    };
  }, [uploadedDocuments, requirements.required]);

  // Get documents for active category
  const displayedDocuments = useMemo(() => {
    if (activeCategory === 'all') {
      return requirements.required;
    }
    return categorizedDocs[activeCategory] || [];
  }, [activeCategory, requirements.required, categorizedDocs]);
  const toggleDocumentExpansion = (docId: string) => {
    const newExpandedSet = new Set(expandedDocuments);
    if (newExpandedSet.has(docId)) {
      newExpandedSet.delete(docId);
    } else {
      newExpandedSet.add(docId);
    }
    setExpandedDocuments(newExpandedSet);
  };



  const getCreditProfileBadge = (profile: CreditProfile) => {
    const profiles = {
      [CreditProfile.PRIME]: { color: 'bg-green-100 text-green-800', label: 'Prime Credit' },
      [CreditProfile.NEAR_PRIME]: { color: 'bg-blue-100 text-blue-800', label: 'Near Prime' },
      [CreditProfile.SUBPRIME]: { color: 'bg-red-100 text-red-800', label: 'Subprime' },
      [CreditProfile.NEW_BUSINESS]: {
        color: 'bg-yellow-100 text-yellow-800',
        label: 'New Business',
      },
      [CreditProfile.ESTABLISHED]: { color: 'bg-purple-100 text-purple-800', label: 'Established' },
    };

    const config = profiles[profile];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getPackageBadge = (packageLevel: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-orange-100 text-orange-800',
      4: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[packageLevel as keyof typeof colors]}`}
      >
        Package {packageLevel}
      </span>
    );
  };

  const getRiskBadge = (risk: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[risk]}`}
      >
        {risk.toUpperCase()} RISK
      </span>
    );
  };

  const getSourceIcon = (source: DocumentSource) => {
    switch (source) {
      case DocumentSource.PLAID_CONNECT:
        return <LinkIcon className="h-4 w-4 text-blue-600" />;
      case DocumentSource.API_REPORT:
        return <CloudIcon className="h-4 w-4 text-purple-600" />;
      case DocumentSource.BOOKKEEPING_SOFTWARE:
        return <ChartBarIcon className="h-4 w-4 text-green-600" />;
      default:
        return <DocumentIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="document-requirements-section space-y-6">
      {/* Enhanced Header with Package and Credit Profile Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DocumentIcon className="h-5 w-5 mr-2 text-blue-600" />
              Required Documents
            </h3>
            <div className="flex items-center space-x-2 mt-2">
              {getPackageBadge(requirements.packageLevel)}
              {getCreditProfileBadge(requirements.creditProfile)}
              {getRiskBadge(requirements.riskAssessment.overallRisk)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {requirements.total} documents required for ${loanAmount.toLocaleString()} loan
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Estimated Review Time</div>
            <div className="text-lg font-semibold text-gray-900 flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              {requirements.estimatedReviewTime} hours
            </div>
            <button
              onClick={() => setShowRiskDetails(!showRiskDetails)}
              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
            >
              View Risk Assessment
            </button>
          </div>
        </div>

        {/* Risk Assessment Details */}
        {showRiskDetails && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Risk Assessment Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Credit Score:</span>
                <span className="ml-2 font-medium">
                  {Math.round(requirements.riskAssessment.creditScore)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Business Age:</span>
                <span className="ml-2 font-medium">
                  {requirements.riskAssessment.businessAge} months
                </span>
              </div>
              <div>
                <span className="text-gray-500">Revenue Stability:</span>
                <span className="ml-2 font-medium capitalize">
                  {requirements.riskAssessment.revenueStability}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Industry Risk:</span>
                <span className="ml-2 font-medium capitalize">
                  {requirements.riskAssessment.industryRisk}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Collateral Strength:</span>
                <span className="ml-2 font-medium capitalize">
                  {requirements.riskAssessment.collateralStrength}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Recommended Package:</span>
                <span className="ml-2 font-medium">
                  Package {requirements.riskAssessment.recommendedPackage}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bars */}
        <div className="space-y-3 mt-4">
          {/* Upload Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Upload Progress</span>
              <span className="font-medium">{completionStats.uploadPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionStats.uploadPercentage}%` }}
              />
            </div>
          </div>

          {/* Approval Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Approval Progress</span>
              <span className="font-medium">{completionStats.approvalPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionStats.approvalPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-6 text-sm">
            <span className="text-gray-600">
              <span className="font-medium text-gray-900">{completionStats.uploadedCount}</span>{' '}
              uploaded
            </span>
            <span className="text-gray-600">
              <span className="font-medium text-green-600">{completionStats.approvedCount}</span>{' '}
              approved
            </span>
            <span className="text-gray-600">
              <span className="font-medium text-orange-600">
                {completionStats.uploadedCount - completionStats.approvedCount}
              </span>{' '}
              pending
            </span>
          </div>
          <div className="text-xs text-gray-500">Package Level: {requirements.packageLevel}/4</div>
        </div>
      </div>

      {/* Package-Level Information Banner */}
      {requirements.packageLevel >= 3 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Enhanced Documentation Required</strong> - This application requires Package{' '}
                {requirements.packageLevel} documentation due to credit profile (
                {requirements.creditProfile}) and risk assessment (
                {requirements.riskAssessment.overallRisk} risk).
              </p>
              {requirements.specialRequirements.length > 0 && (
                <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
                  {requirements.specialRequirements.map(req => (
                    <li key={req} className="capitalize">
                      {req.replace(/_/g, ' ')}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Document categories">
            <button
              onClick={() => setActiveCategory('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeCategory === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Documents
              <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                {requirements.total}
              </span>
            </button>
            {Object.entries(categorizedDocs).map(([category, docs]) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeCategory === category
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category}
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                  {docs.length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Document List */}
        <div className="p-6">
          <div className="space-y-4">
            {displayedDocuments.map(doc => {
              const uploadedDoc = uploadedDocuments[doc.id];
              const isExpanded = expandedDocuments.has(doc.id);

              return (
                <EnhancedDocumentRequirementItem
                  key={doc.id}
                  document={doc}
                  uploadedDocument={uploadedDoc}
                  isExpanded={isExpanded}
                  onToggleExpansion={() => toggleDocumentExpansion(doc.id)}
                  onUpload={file => onUpload(doc.id, file)}
                  onRemove={() => onRemoveDocument(doc.id)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Conditional Requirements */}
      {requirements.conditional.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-3">Additional Requirements</h4>
          <div className="space-y-2">
            {requirements.conditional.map((req, index) => (
              <div key={index} className="flex items-start">
                <InformationCircleIcon className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-yellow-800">{req.document}:</span>
                  <span className="text-yellow-700 ml-1">{req.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Helper Toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowHelper(!showHelper)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <InformationCircleIcon className="h-4 w-4 mr-2" />
          {showHelper ? 'Hide' : 'Show'} Document Helper
        </button>
      </div>

      {/* Enhanced Document Helper */}
      {showHelper && (
        <EnhancedDocumentHelper
          documents={displayedDocuments}
          packageLevel={requirements.packageLevel}
          creditProfile={requirements.creditProfile}
          onClose={() => setShowHelper(false)}
        />
      )}
    </div>
  );
};

// Enhanced Individual Document Requirement Item Component
interface EnhancedDocumentRequirementItemProps {
  document: DocumentRequirement;
  uploadedDocument?: UploadedDocument;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

const EnhancedDocumentRequirementItem: React.FC<EnhancedDocumentRequirementItemProps> = ({
  document,
  uploadedDocument,
  isExpanded,
  onToggleExpansion,
  onUpload,
  onRemove,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const getSourceIcon = (source: DocumentSource) => {
    switch (source) {
      case DocumentSource.PLAID_CONNECT:
        return <LinkIcon className="h-4 w-4 text-blue-600" />;
      case DocumentSource.API_REPORT:
        return <CloudIcon className="h-4 w-4 text-purple-600" />;
      case DocumentSource.BOOKKEEPING_SOFTWARE:
        return <ChartBarIcon className="h-4 w-4 text-green-600" />;
      default:
        return <DocumentIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleFileSelect = async (file: File) => {
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const getStatusIcon = () => {
    if (!uploadedDocument) return null;

    switch (uploadedDocument.status) {
      case 'uploading':
        return (
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
        );
      case 'uploaded':
      case 'processing':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    if (!uploadedDocument) return 'border-gray-200';

    switch (uploadedDocument.status) {
      case 'uploading':
      case 'processing':
        return 'border-yellow-200 bg-yellow-50';
      case 'uploaded':
        return 'border-blue-200 bg-blue-50';
      case 'approved':
        return 'border-green-200 bg-green-50';
      case 'rejected':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div className={`border rounded-lg transition-all ${getStatusColor()}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            {getSourceIcon(document.source)}
            <div>
              <h5 className="font-medium text-gray-900">{document.name}</h5>
              <p className="text-sm text-gray-600">{document.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Package {document.packageLevel}
                </span>
                {document.dealStage.map(stage => (
                  <span key={stage} className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {stage}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {document.estimatedProcessingTime && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {document.estimatedProcessingTime}h review
              </span>
            )}
            <button
              onClick={onToggleExpansion}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {uploadedDocument && (
          <div className="mt-3 p-3 bg-white rounded border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DocumentIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">{uploadedDocument.fileName}</span>
                <span className="text-xs text-gray-500">
                  ({(uploadedDocument.fileSize / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
              <button onClick={onRemove} className="text-red-600 hover:text-red-800 text-sm">
                Remove
              </button>
            </div>
            {uploadedDocument.status === 'rejected' && uploadedDocument.rejectionReason && (
              <p className="text-sm text-red-600 mt-2">{uploadedDocument.rejectionReason}</p>
            )}
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {!uploadedDocument && (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDrop={handleDrop}
              onDragOver={e => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
            >
              <ArrowUpTrayIcon className="mx-auto h-8 w-8 text-gray-400" />
              <div className="mt-2">
                <label className="cursor-pointer">
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Click to upload
                  </span>
                  <span className="text-sm text-gray-600"> or drag and drop</span>
                  <input
                    type="file"
                    className="hidden"
                    accept={document.acceptedFormats.map(f => `.${f.toLowerCase()}`).join(',')}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    disabled={uploading}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Accepted: {document.acceptedFormats.join(', ')}
              </p>
            </div>
          )}

          {/* Enhanced Help Text with Source Information */}
          <div className="mt-4">
            <h6 className="text-sm font-medium text-gray-900 mb-2">Document Requirements:</h6>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
              <div className="flex items-center">
                {getSourceIcon(document.source)}
                <span className="ml-2 text-sm font-medium text-blue-900">
                  Source: {document.source}
                </span>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              {document.helpText.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Validation Rules */}
          {document.validationRules.length > 0 && (
            <div className="mt-4">
              <h6 className="text-sm font-medium text-gray-900 mb-2">Validation Rules:</h6>
              <ul className="text-sm space-y-1">
                {document.validationRules.map((rule, index) => (
                  <li
                    key={index}
                    className={`flex items-start ${
                      rule.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
                    }`}
                  >
                    <span className="mr-2">{rule.severity === 'error' ? '⚠️' : '💡'}</span>
                    {rule.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced Document Helper Component
interface EnhancedDocumentHelperProps {
  documents: DocumentRequirement[];
  packageLevel: number;
  creditProfile: CreditProfile;
  onClose: () => void;
}

const EnhancedDocumentHelper: React.FC<EnhancedDocumentHelperProps> = ({
  documents,
  packageLevel,
  creditProfile,
  onClose,
}) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-blue-900">Enhanced Document Helper</h4>
        <button onClick={onClose} className="text-blue-600 hover:text-blue-800">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded p-3">
            <h5 className="font-medium text-gray-900 mb-2">Your Profile</h5>
            <div className="space-y-1 text-sm">
              <div>
                Package Level: <span className="font-medium">Level {packageLevel}</span>
              </div>
              <div>
                Credit Profile: <span className="font-medium">{creditProfile}</span>
              </div>
              <div>
                Total Documents: <span className="font-medium">{documents.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded p-3">
            <h5 className="font-medium text-gray-900 mb-2">Integration Sources</h5>
            <div className="space-y-1 text-sm text-gray-700">
              <div className="flex items-center">
                <LinkIcon className="h-4 w-4 text-blue-600 mr-2" />
                Plaid Connect for bank data
              </div>
              <div className="flex items-center">
                <CloudIcon className="h-4 w-4 text-purple-600 mr-2" />
                API reports for credit/UCC data
              </div>
              <div className="flex items-center">
                <ChartBarIcon className="h-4 w-4 text-green-600 mr-2" />
                Accounting software integration
              </div>
            </div>
          </div>
        </div>

        <div>
          <h5 className="font-medium text-blue-900 mb-2">General Tips:</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Higher package levels require more comprehensive documentation</li>
            <li>• Some documents can be automatically retrieved through integrations</li>
            <li>• Upload all pages - partial documents will delay processing</li>
            <li>• Files should be clear and under 10MB for best performance</li>
            <li>• API-generated reports are processed instantly</li>
          </ul>
        </div>

        <div>
          <h5 className="font-medium text-blue-900 mb-2">Need Help?</h5>
          <p className="text-sm text-blue-800">
            Contact our document specialists at <strong>(555) 123-4567</strong> or email{' '}
            <strong>docs@example.com</strong> for assistance with package requirements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentRequirementsSection;
