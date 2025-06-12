import React, { useState, useEffect, useCallback } from 'react';

// Define interface for parsed financial document data
export interface ParsedFinancialData {
  id: string;
  documentName: string;
  documentType: string;
  extractedData: {
    totalAssets?: number;
    totalLiabilities?: number;
    netWorth?: number;
    cashAndEquivalents?: number;
    accountsReceivable?: number;
    revenue?: number;
    grossProfit?: number;
    netIncome?: number;
    operatingExpenses?: number;
    dateRange?: string;
    averageMonthlyRevenue?: number;
    averageMonthlyExpenses?: number;
    debtToIncomeRatio?: number;
    creditScore?: number;
    outstandingLoans?: number;
    [key: string]: any;
  };
  confidenceScore: number;
  processingTime: number; // in ms
  processingDate: string;
}

interface UploadedDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  documentType: string;
  file?: File;
}

interface FinancialDocumentParserProps {
  documents?: UploadedDocument[];
  onParsingComplete?: (parsedData: ParsedFinancialData[]) => void;
  applicationId?: string;
}

const FinancialDocumentParser: React.FC<FinancialDocumentParserProps> = ({
  documents = [],
  onParsingComplete,
  applicationId,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [parsedDocuments, setParsedDocuments] = useState<ParsedFinancialData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  // Generate mock parsed data based on document type
  const createMockParsedData = useCallback((document: UploadedDocument): ParsedFinancialData => {
    // Generate realistic mock financial data based on document type
    const currentDate = new Date();
    const processingTime = 1000 + Math.random() * 4000; // Between 1-5 seconds
    let extractedData: any = {};

    // Base confidence score between 0.7 and 0.95
    const confidenceScore = 0.7 + Math.random() * 0.25;

    switch (document.documentType) {
      case 'balance_sheet':
        extractedData = {
          totalAssets: Math.round(500000 + Math.random() * 5000000),
          totalLiabilities: Math.round(300000 + Math.random() * 3000000),
          netWorth: 0, // Will calculate below
          cashAndEquivalents: Math.round(50000 + Math.random() * 500000),
          accountsReceivable: Math.round(75000 + Math.random() * 250000),
          dateRange: `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`,
        };
        extractedData.netWorth = extractedData.totalAssets - extractedData.totalLiabilities;
        break;

      case 'income_statement':
        extractedData = {
          revenue: Math.round(1000000 + Math.random() * 10000000),
          grossProfit: Math.round(400000 + Math.random() * 3000000),
          netIncome: Math.round(100000 + Math.random() * 1000000),
          operatingExpenses: Math.round(300000 + Math.random() * 2000000),
          dateRange: `1/1/${currentDate.getFullYear()} - ${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`,
          averageMonthlyRevenue: 0, // Will calculate below
          averageMonthlyExpenses: 0, // Will calculate below
        };

        // Calculate monthly averages
        const monthsElapsed = currentDate.getMonth() + 1; // 1-12
        extractedData.averageMonthlyRevenue = Math.round(extractedData.revenue / monthsElapsed);
        extractedData.averageMonthlyExpenses = Math.round(
          extractedData.operatingExpenses / monthsElapsed
        );
        break;

      case 'tax_return':
        extractedData = {
          reportedIncome: Math.round(250000 + Math.random() * 2000000),
          taxesPaid: Math.round(50000 + Math.random() * 500000),
          deductions: Math.round(20000 + Math.random() * 100000),
          taxYear: currentDate.getFullYear() - 1,
          filingStatus: 'Business',
          entityType: 'LLC',
        };
        break;

      case 'bank_statement':
        extractedData = {
          accountBalance: Math.round(25000 + Math.random() * 250000),
          startingBalance: Math.round(20000 + Math.random() * 200000),
          endingBalance: 0, // Will calculate below
          deposits: Math.round(15000 + Math.random() * 150000),
          withdrawals: Math.round(10000 + Math.random() * 100000),
          accountNumber: `XXXX${Math.floor(1000 + Math.random() * 9000)}`,
          statementPeriod: `${currentDate.getMonth()}/${1}/${currentDate.getFullYear()} - ${currentDate.getMonth() + 1}/${1}/${currentDate.getFullYear()}`,
        };
        extractedData.endingBalance =
          extractedData.startingBalance + extractedData.deposits - extractedData.withdrawals;
        break;

      case 'financial_statement':
      default:
        extractedData = {
          totalAssets: Math.round(500000 + Math.random() * 5000000),
          totalLiabilities: Math.round(300000 + Math.random() * 3000000),
          netWorth: 0, // Will calculate below
          revenue: Math.round(1000000 + Math.random() * 10000000),
          netIncome: Math.round(100000 + Math.random() * 1000000),
          debtToIncomeRatio: (0.3 + Math.random() * 0.5).toFixed(2),
          dateRange: `${currentDate.getFullYear() - 1} - ${currentDate.getFullYear()}`,
        };
        extractedData.netWorth = extractedData.totalAssets - extractedData.totalLiabilities;
        break;
    }

    return {
      id: `parsed-${document.id}`,
      documentName: document.fileName,
      documentType: document.documentType,
      extractedData,
      confidenceScore,
      processingTime,
      processingDate: new Date().toISOString(),
    };
  }, []);

  // Mock function to simulate document parsing
  const parseDocuments = useCallback(async () => {
    if (documents.length === 0) {
      setError('No documents to process');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setParsedDocuments([]);

    const parsedResults: ParsedFinancialData[] = [];
    const totalDocuments = documents.length;

    for (let i = 0; i < totalDocuments; i++) {
      const doc = documents[i];
      // Update progress
      setProcessingProgress(Math.round(((i + 0.5) / totalDocuments) * 100));

      // Simulate API call to parse document
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create mock parsed data based on document type
      const parsedData = createMockParsedData(doc);
      parsedResults.push(parsedData);

      // Update progress again
      setProcessingProgress(Math.round(((i + 1) / totalDocuments) * 100));
    }

    setParsedDocuments(parsedResults);
    setIsProcessing(false);
    setProcessingProgress(100);

    if (onParsingComplete) {
      onParsingComplete(parsedResults);
    }
  }, [documents, setError, setParsedDocuments, setIsProcessing, setProcessingProgress, createMockParsedData, onParsingComplete]);

  useEffect(() => {
    // Auto-process documents when they are provided
    if (documents.length > 0 && parsedDocuments.length === 0) {
      parseDocuments();
    }
  }, [documents, parsedDocuments.length, parseDocuments]);

  // Format currency values for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // View detailed data for a specific document
  const viewDocumentDetails = (documentId: string) => {
    setSelectedDocumentId(documentId);
  };

  // Close the details modal
  const closeDetails = () => {
    setSelectedDocumentId(null);
  };

  // Get the selected document data
  const getSelectedDocument = () => {
    return parsedDocuments.find(doc => doc.id === selectedDocumentId);
  };

  // Determine if a value needs attention (potentially problematic)
  const needsAttention = (key: string, value: any): boolean => {
    // These are just example thresholds, would be customized for real applications
    if (key === 'debtToIncomeRatio' && parseFloat(value) > 0.5) return true;
    if (key === 'netWorth' && value < 0) return true;
    if (key === 'confidenceScore' && value < 0.75) return true;
    return false;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Financial Document Analysis</h2>

      {documents.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents to analyze</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload financial documents first to enable analysis.
          </p>
        </div>
      ) : (
        <>
          {isProcessing ? (
            <div className="text-center py-8">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className="bg-primary-600 h-2.5 rounded-full"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-2"></div>
              <p className="mt-2 text-sm font-medium text-gray-900">
                Processing Documents ({processingProgress}%)
              </p>
              <p className="text-sm text-gray-500">
                Please wait while we analyze your financial documents...
              </p>
            </div>
          ) : (
            <div>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {parsedDocuments.length > 0 ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Document Analysis Results
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Document
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Type
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Key Findings
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Confidence
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {parsedDocuments.map(doc => (
                            <tr key={doc.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {doc.documentName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                {doc.documentType.replace(/_/g, ' ')}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                <div className="space-y-1">
                                  {doc.documentType === 'balance_sheet' && (
                                    <>
                                      <p>
                                        Total Assets:{' '}
                                        {formatCurrency(doc.extractedData.totalAssets || 0)}
                                      </p>
                                      <p>
                                        Total Liabilities:{' '}
                                        {formatCurrency(doc.extractedData.totalLiabilities || 0)}
                                      </p>
                                      <p
                                        className={`font-medium ${(doc.extractedData.netWorth || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}
                                      >
                                        Net Worth: {formatCurrency(doc.extractedData.netWorth || 0)}
                                      </p>
                                    </>
                                  )}

                                  {doc.documentType === 'income_statement' && (
                                    <>
                                      <p>
                                        Revenue: {formatCurrency(doc.extractedData.revenue || 0)}
                                      </p>
                                      <p>
                                        Operating Expenses:{' '}
                                        {formatCurrency(doc.extractedData.operatingExpenses || 0)}
                                      </p>
                                      <p
                                        className={`font-medium ${(doc.extractedData.netIncome || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}
                                      >
                                        Net Income:{' '}
                                        {formatCurrency(doc.extractedData.netIncome || 0)}
                                      </p>
                                    </>
                                  )}

                                  {doc.documentType === 'tax_return' && (
                                    <>
                                      <p>
                                        Reported Income:{' '}
                                        {formatCurrency(doc.extractedData.reportedIncome || 0)}
                                      </p>
                                      <p>
                                        Taxes Paid:{' '}
                                        {formatCurrency(doc.extractedData.taxesPaid || 0)}
                                      </p>
                                      <p>Tax Year: {doc.extractedData.taxYear}</p>
                                    </>
                                  )}

                                  {doc.documentType === 'bank_statement' && (
                                    <>
                                      <p>
                                        Account Balance:{' '}
                                        {formatCurrency(doc.extractedData.accountBalance || 0)}
                                      </p>
                                      <p>
                                        Deposits: {formatCurrency(doc.extractedData.deposits || 0)}
                                      </p>
                                      <p>
                                        Withdrawals:{' '}
                                        {formatCurrency(doc.extractedData.withdrawals || 0)}
                                      </p>
                                    </>
                                  )}

                                  {(doc.documentType === 'financial_statement' ||
                                    ![
                                      'balance_sheet',
                                      'income_statement',
                                      'tax_return',
                                      'bank_statement',
                                    ].includes(doc.documentType)) && (
                                    <>
                                      <p>
                                        Assets: {formatCurrency(doc.extractedData.totalAssets || 0)}
                                      </p>
                                      <p>
                                        Revenue: {formatCurrency(doc.extractedData.revenue || 0)}
                                      </p>
                                      <p>
                                        Net Income:{' '}
                                        {formatCurrency(doc.extractedData.netIncome || 0)}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2.5">
                                    <div
                                      className={`h-2.5 rounded-full ${
                                        doc.confidenceScore > 0.85
                                          ? 'bg-green-600'
                                          : doc.confidenceScore > 0.7
                                            ? 'bg-yellow-500'
                                            : 'bg-red-600'
                                      }`}
                                      style={{ width: `${doc.confidenceScore * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="ml-2 text-sm text-gray-700">
                                    {Math.round(doc.confidenceScore * 100)}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => viewDocumentDetails(doc.id)}
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-yellow-400"
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
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          The extracted financial data will be used in your credit application. You
                          can verify and modify this information before final submission.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <button
                    onClick={parseDocuments}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Process Documents
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Document Details Modal */}
      {selectedDocumentId && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              {getSelectedDocument() && (
                <>
                  <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                    <button
                      type="button"
                      onClick={closeDetails}
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div>
                    <div className="mt-3 text-left sm:mt-5">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                        {getSelectedDocument()?.documentName}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {getSelectedDocument()?.documentType.replace(/_/g, ' ')} • Processed{' '}
                        {new Date(getSelectedDocument()?.processingDate || '').toLocaleDateString()}{' '}
                        • Confidence:{' '}
                        {Math.round((getSelectedDocument()?.confidenceScore || 0) * 100)}%
                      </p>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Extracted Financial Data</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(getSelectedDocument()?.extractedData || {}).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between border-b border-gray-200 py-2"
                              >
                                <span className="text-sm text-gray-600 capitalize">
                                  {key
                                    .replace(/([A-Z])/g, ' $1')
                                    .replace(/^./, str => str.toUpperCase())}
                                </span>
                                <span
                                  className={`text-sm font-medium ${needsAttention(key, value) ? 'text-red-600' : 'text-gray-900'}`}
                                >
                                  {typeof value === 'number' &&
                                  key.toLowerCase().includes('date') === false
                                    ? formatCurrency(value)
                                    : value}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Document Processing Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex justify-between border-b border-gray-200 py-2">
                            <span className="text-sm text-gray-600">Processing Time</span>
                            <span className="text-sm text-gray-900">
                              {(getSelectedDocument()?.processingTime || 0).toFixed(0)}ms
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-gray-200 py-2">
                            <span className="text-sm text-gray-600">Confidence Score</span>
                            <span
                              className={`text-sm font-medium ${(getSelectedDocument()?.confidenceScore || 0) < 0.75 ? 'text-red-600' : 'text-green-600'}`}
                            >
                              {Math.round((getSelectedDocument()?.confidenceScore || 0) * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-gray-200 py-2">
                            <span className="text-sm text-gray-600">Document ID</span>
                            <span className="text-sm text-gray-900">
                              {getSelectedDocument()?.id}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-gray-200 py-2">
                            <span className="text-sm text-gray-600">Processed Date</span>
                            <span className="text-sm text-gray-900">
                              {new Date(
                                getSelectedDocument()?.processingDate || ''
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {(() => {
                        const selectedDoc = getSelectedDocument();
                        return (
                          selectedDoc &&
                          selectedDoc.confidenceScore !== undefined &&
                          selectedDoc.confidenceScore < 0.8 && (
                            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <svg
                                    className="h-5 w-5 text-yellow-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm text-yellow-700">
                                    Low confidence score. Some data might be inaccurate. Please
                                    review the extracted information carefully.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        );
                      })()}
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      onClick={closeDetails}
                      className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialDocumentParser;
