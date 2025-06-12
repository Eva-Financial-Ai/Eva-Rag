import React, { useState, useEffect } from 'react';

// Mock types to replace deleted IRS API service
interface IRSTranscriptData {
  id: string;
  year: string;
  type: string;
  data: any;
  agi?: number;
  totalTax?: number;
  businessIncome?: number;
  schedules?: string[];
}

interface TaxParsedData {
  formType: string;
  taxYear: string;
  entityName: string;
  ein: string;
  grossReceipts: number;
  totalIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  taxLiability: number;
  schedules: string[];
  confidence: number;
  validationErrors?: string[];
}

// Types for tax document parsing and IRS integration
interface TaxDocument {
  id: string;
  type: 'business' | 'personal';
  year: string;
  fileName: string;
  fileUrl: string;
  dateUploaded: string;
  fileSize: number;
  parsed: boolean;
  parsedData?: TaxParsedData;
  ownerId?: string;
  ownerName?: string;
}

interface BusinessTaxReturnsProps {
  transactionAmount?: number;
  financialInstrument?: string;
  entityType?: string;
  ownerData?: Array<{
    id: string;
    name: string;
    ownershipPercentage: number;
    type: 'individual' | 'business' | 'trust';
  }>;
  onTaxDocumentsChange?: (documents: TaxDocument[]) => void;
}

// Dynamic requirements logic based on transaction and instrument type
const getDynamicTaxRequirements = (
  transactionAmount: number = 0,
  financialInstrument: string = '',
  entityType: string = ''
) => {
  const requirements = {
    businessTaxYears: 1,
    personalTaxRequired: false,
    personalTaxYears: 1,
    irsTranscriptRequired: false,
    auditedFinancialsRequired: false,
    schedulesRequired: [] as string[],
    additionalDocuments: [] as string[],
  };

  // Base requirements by transaction amount
  if (transactionAmount >= 1000000) {
    requirements.businessTaxYears = 3;
    requirements.personalTaxRequired = true;
    requirements.personalTaxYears = 2;
    requirements.irsTranscriptRequired = true;
    requirements.auditedFinancialsRequired = true;
    requirements.schedulesRequired = ['Schedule C', 'Schedule E', 'Schedule K-1'];
  } else if (transactionAmount >= 500000) {
    requirements.businessTaxYears = 2;
    requirements.personalTaxRequired = true;
    requirements.personalTaxYears = 2;
    requirements.irsTranscriptRequired = true;
    requirements.schedulesRequired = ['Schedule C', 'Schedule E'];
  } else if (transactionAmount >= 100000) {
    requirements.businessTaxYears = 2;
    requirements.personalTaxRequired = ['sole_proprietorship', 's_corp'].includes(entityType);
    requirements.personalTaxYears = 1;
    requirements.schedulesRequired = ['Schedule C'];
  }

  // Requirements by financial instrument
  switch (financialInstrument) {
    case 'sba_loan':
      requirements.businessTaxYears = Math.max(requirements.businessTaxYears, 3);
      requirements.personalTaxRequired = true;
      requirements.personalTaxYears = 3;
      requirements.irsTranscriptRequired = true;
      requirements.additionalDocuments.push('SBA Form 912', 'SBA Form 413');
      break;

    case 'commercial_real_estate':
    case 'residential_real_estate':
      requirements.businessTaxYears = Math.max(requirements.businessTaxYears, 2);
      requirements.schedulesRequired.push('Schedule E', 'Form 4562');
      if (transactionAmount >= 500000) {
        requirements.auditedFinancialsRequired = true;
      }
      break;

    case 'equipment_finance':
    case 'equipment_lease':
      requirements.schedulesRequired.push('Form 4562', 'Section 179 Election');
      break;

    case 'working_capital':
    case 'line_of_credit':
      requirements.businessTaxYears = Math.max(requirements.businessTaxYears, 2);
      requirements.irsTranscriptRequired = transactionAmount >= 250000;
      break;
  }

  // Entity-specific requirements
  switch (entityType) {
    case 'sole_proprietorship':
      requirements.personalTaxRequired = true;
      requirements.schedulesRequired.push('Schedule C', 'Schedule SE');
      break;

    case 's_corp':
      requirements.personalTaxRequired = true;
      requirements.schedulesRequired.push('Schedule E', 'Form 1120S', 'Schedule K-1');
      break;

    case 'partnership':
      requirements.schedulesRequired.push('Form 1065', 'Schedule K-1');
      break;

    case 'c_corp':
      requirements.schedulesRequired.push('Form 1120');
      break;

    case 'llc':
      requirements.schedulesRequired.push('Form 1065', 'Schedule K-1');
      break;
  }

  return requirements;
};

const BusinessTaxReturns: React.FC<BusinessTaxReturnsProps> = ({
  transactionAmount = 0,
  financialInstrument = '',
  entityType = '',
  ownerData = [],
  onTaxDocumentsChange,
}) => {
  // State management
  const [selectedYears, setSelectedYears] = useState({
    mostRecentYear: false,
    priorYear: false,
    twoYearsPrior: false,
    taxExtension: false,
  });

  const [uploadedDocuments, setUploadedDocuments] = useState<TaxDocument[]>([]);
  const [showIRSModal, setShowIRSModal] = useState(false);
  const [showPersonalTaxModal, setShowPersonalTaxModal] = useState(false);
  const [irsCredentials, setIRSCredentials] = useState({ username: '', password: '' });
  const [irsTranscripts, setIRSTranscripts] = useState<IRSTranscriptData[]>([]);
  const [loading, setLoading] = useState(false);
  const [parseProgress, setParseProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);

  // Get dynamic requirements
  const requirements = getDynamicTaxRequirements(
    transactionAmount,
    financialInstrument,
    entityType
  );

  // Current year for tax year calculations
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (onTaxDocumentsChange) {
      onTaxDocumentsChange(uploadedDocuments);
    }
  }, [uploadedDocuments, onTaxDocumentsChange]);

  // Handle checkbox changes
  const handleCheckboxChange = (year: keyof typeof selectedYears) => {
    setSelectedYears({
      ...selectedYears,
      [year]: !selectedYears[year],
    });
  };

  // Advanced document parsing using the IRS API service
  const parseUploadedDocument = async (file: File): Promise<TaxParsedData> => {
    const documentId = file.name;
    setParseProgress(prev => ({ ...prev, [documentId]: 0 }));

    try {
      // Mock parsing implementation - replace with actual external API call
      const parsedData: TaxParsedData = {
        formType: file.name.includes('1120')
          ? 'Form 1120'
          : file.name.includes('1065')
            ? 'Form 1065'
            : file.name.includes('1040')
              ? 'Form 1040'
              : 'Unknown Form',
        taxYear: '2023',
        entityName: 'Sample Business',
        ein: '12-3456789',
        grossReceipts: 500000,
        totalIncome: 450000,
        totalDeductions: 350000,
        taxableIncome: 100000,
        taxLiability: 21000,
        schedules: ['Schedule C'],
        confidence: 0.95
      };

      // Validate the parsed document
      if (parsedData.confidence < 0.7) {
        console.warn(`Low confidence parsing for ${file.name}: ${parsedData.confidence}`);
      }

      // Remove progress after completion
      setTimeout(() => {
        setParseProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[documentId];
          return newProgress;
        });
      }, 2000);

      return parsedData;
    } catch (error) {
      console.error('Error parsing tax document:', error);
      setError(`Failed to parse ${file.name}. Please try again or contact support.`);

      // Clear progress on error
      setParseProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[documentId];
        return newProgress;
      });

      throw error;
    }
  };

  // Handle file upload with parsing
  const handleFileUpload = async (year: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Clear any previous errors
      setError(null);

      try {
        const parsedData = await parseUploadedDocument(file);

        // Mock validation - replace with actual external API call
        const validation = {
          isValid: true,
          missingSchedules: [],
          complianceIssues: [],
          warnings: []
        };

        const newDocument: TaxDocument = {
          id: `tax-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'business',
          year,
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          dateUploaded: new Date().toISOString(),
          fileSize: file.size,
          parsed: true,
          parsedData: {
            ...parsedData,
            validationErrors: validation.missingSchedules
              .map(schedule => `Missing required schedule: ${schedule}`)
              .concat(validation.warnings),
          },
        };

        setUploadedDocuments(prev => [...prev, newDocument]);

        // Show validation warnings if any
        if (validation.warnings.length > 0) {
          console.warn('Document validation warnings:', validation.warnings);
        }
      } catch (error) {
        console.error('Error uploading document:', error);
      }
    }
  };

  // Mock IRS connection - replace with actual external API call
  const connectToIRS = async () => {
    if (!irsCredentials.username || !irsCredentials.password) {
      setError('Please provide both username and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mock IRS transcript data
      const mockTranscripts: IRSTranscriptData[] = [
        {
          id: 'transcript-1',
          year: '2023',
          type: 'Return Transcript',
          data: {
            grossReceipts: 500000,
            totalIncome: 450000,
            taxableIncome: 100000,
            taxLiability: 21000
          }
        },
        {
          id: 'transcript-2',
          year: '2022',
          type: 'Return Transcript',
          data: {
            grossReceipts: 450000,
            totalIncome: 400000,
            taxableIncome: 90000,
            taxLiability: 18900
          }
        }
      ];

      setIRSTranscripts(mockTranscripts);
      setShowIRSModal(false);
      setIRSCredentials({ username: '', password: '' });
    } catch (err) {
      console.error('Error connecting to IRS:', err);
      setError('Failed to connect to IRS. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle personal tax upload for owners
  const handlePersonalTaxUpload = async (ownerId: string, files: FileList) => {
    setError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const parsedData = await parseUploadedDocument(file);
        const owner = ownerData.find(o => o.id === ownerId);

        const newDocument: TaxDocument = {
          id: `personal-tax-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'personal',
          year: parsedData.taxYear,
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          dateUploaded: new Date().toISOString(),
          fileSize: file.size,
          parsed: true,
          parsedData,
          ownerId,
          ownerName: owner?.name || 'Unknown Owner',
        };

        setUploadedDocuments(prev => [...prev, newDocument]);
      } catch (error) {
        console.error('Error uploading personal tax document:', error);
      }
    }
  };

  const renderTaxRequirements = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <svg
          className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <h4 className="text-blue-800 font-medium">Dynamic Tax Requirements</h4>
          <div className="text-blue-700 text-sm mt-2 space-y-1">
            <p>
              <strong>Transaction Amount:</strong> ${transactionAmount?.toLocaleString()}
            </p>
            <p>
              <strong>Financial Instrument:</strong>{' '}
              {financialInstrument?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
            <p>
              <strong>Entity Type:</strong>{' '}
              {entityType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
            <hr className="my-2 border-blue-300" />
            <p>
              <strong>Business Tax Years Required:</strong> {requirements.businessTaxYears}
            </p>
            {requirements.personalTaxRequired && (
              <p>
                <strong>Personal Tax Years Required:</strong> {requirements.personalTaxYears}
              </p>
            )}
            {requirements.irsTranscriptRequired && (
              <p className="text-blue-800">
                <strong>IRS Transcript Required</strong>
              </p>
            )}
            {requirements.schedulesRequired.length > 0 && (
              <p>
                <strong>Required Schedules:</strong> {requirements.schedulesRequired.join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderError = () => {
    if (!error) return null;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg
            className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h4 className="text-red-800 font-medium">Error</h4>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
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
      </div>
    );
  };

  return (
    <div className="business-tax-returns p-6 border rounded-lg bg-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Tax Returns & IRS Integration</h3>
          <p className="text-gray-600 mt-1">
            Upload documents or connect directly to IRS for faster processing
          </p>
        </div>

        {/* IRS API Integration Button */}
        <div className="flex space-x-3">
          <button
            onClick={() => setShowIRSModal(true)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            {loading ? 'Connecting...' : 'Connect to IRS'}
          </button>

          {requirements.personalTaxRequired && (
            <button
              onClick={() => setShowPersonalTaxModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Personal Tax Returns
            </button>
          )}
        </div>
      </div>

      {renderError()}
      {renderTaxRequirements()}

      {/* IRS Transcripts Display */}
      {irsTranscripts.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="text-green-800 font-medium mb-3">Retrieved IRS Transcripts</h4>
          <div className="space-y-2">
            {irsTranscripts.map((transcript, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded border"
              >
                <div>
                  <span className="font-medium">Tax Year {transcript.year}</span>
                  <div className="text-sm text-gray-600">
                    AGI: ${transcript.agi?.toLocaleString()} | Total Tax: $
                    {transcript.totalTax?.toLocaleString()}
                    {transcript.businessIncome && (
                      <span> | Business Income: ${transcript.businessIncome.toLocaleString()}</span>
                    )}
                  </div>
                  {transcript.schedules && transcript.schedules.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Schedules: {transcript.schedules.join(', ')}
                    </div>
                  )}
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Retrieved
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business Tax Returns Section */}
      <div className="mb-8">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Business Tax Returns</h4>
        <p className="text-sm text-gray-600 mb-4">
          Please select which years of business tax returns you will be providing:
        </p>

        <div className="space-y-4 mb-6">
          {/* Most Recent Year */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="mostRecentYear"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={selectedYears.mostRecentYear}
              onChange={() => handleCheckboxChange('mostRecentYear')}
            />
            <label htmlFor="mostRecentYear" className="ml-2 block text-sm text-gray-700">
              Most Recent Tax Year ({currentYear - 1})
              {requirements.businessTaxYears >= 1 && <span className="text-red-500 ml-1">*</span>}
            </label>
            {selectedYears.mostRecentYear && (
              <div className="ml-4 flex-1 flex items-center space-x-3">
                <input
                  type="file"
                  id="file-2024"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={e => handleFileUpload((currentYear - 1).toString(), e)}
                />
                <label
                  htmlFor="file-2024"
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                >
                  Upload Tax Return
                </label>
                {parseProgress[`file-${currentYear - 1}`] !== undefined && (
                  <div className="flex-1 max-w-xs">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${parseProgress[`file-${currentYear - 1}`]}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">Parsing document...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prior Year */}
          {requirements.businessTaxYears >= 2 && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="priorYear"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={selectedYears.priorYear}
                onChange={() => handleCheckboxChange('priorYear')}
              />
              <label htmlFor="priorYear" className="ml-2 block text-sm text-gray-700">
                Prior Tax Year ({currentYear - 2})<span className="text-red-500 ml-1">*</span>
              </label>
              {selectedYears.priorYear && (
                <div className="ml-4 flex-1">
                  <input
                    type="file"
                    id="file-2023"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={e => handleFileUpload((currentYear - 2).toString(), e)}
                  />
                  <label
                    htmlFor="file-2023"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                  >
                    Upload Tax Return
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Two Years Prior */}
          {requirements.businessTaxYears >= 3 && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="twoYearsPrior"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={selectedYears.twoYearsPrior}
                onChange={() => handleCheckboxChange('twoYearsPrior')}
              />
              <label htmlFor="twoYearsPrior" className="ml-2 block text-sm text-gray-700">
                Two Years Prior ({currentYear - 3})<span className="text-red-500 ml-1">*</span>
              </label>
              {selectedYears.twoYearsPrior && (
                <div className="ml-4 flex-1">
                  <input
                    type="file"
                    id="file-2022"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={e => handleFileUpload((currentYear - 3).toString(), e)}
                  />
                  <label
                    htmlFor="file-2022"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                  >
                    Upload Tax Return
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Tax Extension */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="taxExtension"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={selectedYears.taxExtension}
              onChange={() => handleCheckboxChange('taxExtension')}
            />
            <label htmlFor="taxExtension" className="ml-2 block text-sm text-gray-700">
              Last Year Tax Extension (if applicable)
            </label>
            {selectedYears.taxExtension && (
              <div className="ml-4 flex-1">
                <input
                  type="file"
                  id="file-extension"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={e => handleFileUpload('extension', e)}
                />
                <label
                  htmlFor="file-extension"
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                >
                  Upload Extension
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Uploaded Documents Display */}
      {uploadedDocuments.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Uploaded Tax Documents</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {uploadedDocuments.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between bg-white p-3 rounded border"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${doc.parsed ? 'bg-green-500' : 'bg-yellow-500'}`}
                      ></div>
                      <span className="font-medium">{doc.fileName}</span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          doc.type === 'business'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {doc.type === 'business' ? 'Business' : 'Personal'}
                      </span>
                      {doc.ownerName && (
                        <span className="text-sm text-gray-600">({doc.ownerName})</span>
                      )}
                    </div>
                    {doc.parsed && doc.parsedData && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="mr-4">Form: {doc.parsedData.formType}</span>
                        <span className="mr-4">Year: {doc.parsedData.taxYear}</span>
                        <span className="mr-4">
                          Income: ${doc.parsedData.totalIncome?.toLocaleString()}
                        </span>
                        <span className="text-green-600">
                          Confidence: {(doc.parsedData.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                    {doc.parsedData?.validationErrors &&
                      doc.parsedData.validationErrors.length > 0 && (
                        <div className="mt-2 text-xs text-red-600">
                          {doc.parsedData.validationErrors.map((error, idx) => (
                            <div key={idx}>⚠ {error}</div>
                          ))}
                        </div>
                      )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                      className="text-primary-600 hover:text-primary-800 text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() =>
                        setUploadedDocuments(prev => prev.filter(d => d.id !== doc.id))
                      }
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Required Schedules Display */}
      {requirements.schedulesRequired.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="text-yellow-800 font-medium mb-2">Required Tax Schedules</h4>
          <p className="text-yellow-700 text-sm mb-3">
            Based on your transaction type and amount, the following schedules must be included:
          </p>
          <div className="flex flex-wrap gap-2">
            {requirements.schedulesRequired.map(schedule => (
              <span
                key={schedule}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
              >
                {schedule}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <p className="text-sm text-gray-500">
          Tax returns should include all schedules and attachments. Please ensure all documents are
          complete before uploading to avoid delays in processing your application.
          {requirements.auditedFinancialsRequired && (
            <span className="block mt-1 text-orange-600 font-medium">
              Note: Audited financial statements are required for this transaction amount.
            </span>
          )}
        </p>
      </div>

      {/* IRS Connection Modal */}
      {showIRSModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">Connect to IRS</h3>
              <button
                onClick={() => setShowIRSModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              Securely connect to the IRS to retrieve your tax transcripts. This provides faster
              approval with verified information.
            </p>
            <form
              className="space-y-4"
              onSubmit={e => {
                e.preventDefault();
                connectToIRS();
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">IRS Username</label>
                <input
                  type="text"
                  value={irsCredentials.username}
                  onChange={e => setIRSCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IRS Password</label>
                <input
                  type="password"
                  value={irsCredentials.password}
                  onChange={e => setIRSCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  <strong>Will retrieve:</strong> {requirements.businessTaxYears} years of tax
                  transcripts
                  {requirements.irsTranscriptRequired && ' (Required for this transaction)'}
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowIRSModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Connecting...' : 'Connect to IRS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Personal Tax Returns Modal */}
      {showPersonalTaxModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Tax Returns</h3>
              <button
                onClick={() => setShowPersonalTaxModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              Personal tax returns are required for {requirements.personalTaxYears} year(s) based on
              your entity type and transaction amount.
            </p>

            <div className="space-y-6">
              {ownerData
                .filter(owner => owner.type === 'individual')
                .map(owner => (
                  <div key={owner.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      {owner.name} ({owner.ownershipPercentage}% ownership)
                    </h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400 mb-4"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="text-sm text-gray-600 mb-2">
                        Upload personal tax returns (Form 1040) for the last{' '}
                        {requirements.personalTaxYears} year(s)
                      </div>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx"
                        onChange={e =>
                          e.target.files && handlePersonalTaxUpload(owner.id, e.target.files)
                        }
                        className="hidden"
                        id={`personal-tax-${owner.id}`}
                      />
                      <label
                        htmlFor={`personal-tax-${owner.id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 cursor-pointer"
                      >
                        Upload Tax Returns
                      </label>
                    </div>

                    {/* Show uploaded personal documents for this owner */}
                    {uploadedDocuments.filter(doc => doc.ownerId === owner.id).length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Uploaded Documents:
                        </h5>
                        {uploadedDocuments
                          .filter(doc => doc.ownerId === owner.id)
                          .map(doc => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                            >
                              <span>{doc.fileName}</span>
                              <button
                                onClick={() =>
                                  setUploadedDocuments(prev => prev.filter(d => d.id !== doc.id))
                                }
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPersonalTaxModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessTaxReturns;
