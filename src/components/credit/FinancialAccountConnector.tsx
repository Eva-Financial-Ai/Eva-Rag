import React, { useState, useRef } from 'react';
import PlaidBankVerification from './PlaidBankVerification';

// Define interface for connected accounts
interface ConnectedAccount {
  id: string;
  accountName: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment' | 'loan' | 'other';
  institutionName: string;
  balance: number;
  mask?: string; // Last 4 digits of account number
  isVerified: boolean;
}

// Define interface for uploaded financial statements
interface UploadedFinancialStatement {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  documentType:
    | 'bank_statement'
    | 'tax_return'
    | 'financial_statement'
    | 'balance_sheet'
    | 'income_statement'
    | 'other';
  period?: string; // e.g., "Q1 2023", "2022", "Jan 2023"
  isProcessed: boolean;
  parsedData?: any;
}

interface FinancialAccountConnectorProps {
  onAccountsConnected?: (accounts: ConnectedAccount[]) => void;
  onDocumentsUploaded?: (documents: UploadedFinancialStatement[]) => void;
  applicationId?: string;
}

const FinancialAccountConnector: React.FC<FinancialAccountConnectorProps> = ({
  onAccountsConnected,
  onDocumentsUploaded,
  applicationId,
}) => {
  const [activeTab, setActiveTab] = useState<'connect' | 'upload'>('connect');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedFinancialStatement[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('bank_statement');
  const [documentPeriod, setDocumentPeriod] = useState<string>('');
  const [showPlaidVerification, setShowPlaidVerification] = useState(false);
  const [ownershipPercentage, setOwnershipPercentage] = useState(25); // Default 25% ownership
  const fileInputRef = useRef<HTMLInputElement>(null);

  const financialProviders = [
    {
      id: 'plaid',
      name: 'Plaid',
      logo: '/icons/plaid-logo.svg',
      description: 'Connect your bank accounts securely',
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      logo: '/icons/quickbooks-logo.svg',
      description: 'Import your accounting data',
    },
    {
      id: 'netsuite',
      name: 'NetSuite',
      logo: '/icons/netsuite-logo.svg',
      description: 'Connect your NetSuite account',
    },
    {
      id: 'xero',
      name: 'Xero',
      logo: '/icons/xero-logo.svg',
      description: 'Connect your Xero account',
    },
    {
      id: 'sage',
      name: 'Sage',
      logo: '/icons/sage-logo.svg',
      description: 'Import from Sage accounting',
    },
    {
      id: 'myob',
      name: 'MYOB',
      logo: '/icons/myob-logo.svg',
      description: 'Connect MYOB business accounting',
    },
  ];

  const documentTypes = [
    { id: 'bank_statement', name: 'Bank Statement' },
    { id: 'tax_return', name: 'Tax Return' },
    { id: 'financial_statement', name: 'Financial Statement' },
    { id: 'balance_sheet', name: 'Balance Sheet' },
    { id: 'income_statement', name: 'Income Statement' },
    { id: 'other', name: 'Other Financial Document' },
  ];

  // Connect with Plaid or other financial provider
  const handleConnectProvider = (providerId: string) => {
    setSelectedProvider(providerId);
    if (providerId === 'plaid') {
      setShowPlaidVerification(true);
    } else {
      setIsConnecting(true);
      setShowModal(true);
    }
  };

  // Handle Plaid verification completion
  const handlePlaidVerificationComplete = (data: any) => {
    const plaidAccounts: ConnectedAccount[] = data.accounts.map((account: any) => ({
      id: account.id,
      accountName: account.name,
      accountType: account.type,
      institutionName: account.institution.name,
      balance: account.balance.available,
      mask: account.mask,
      isVerified: true,
    }));

    setConnectedAccounts(prev => [...prev, ...plaidAccounts]);
    setShowPlaidVerification(false);

    if (onAccountsConnected) {
      onAccountsConnected(plaidAccounts);
    }
  };

  // Connect with QuickBooks or Xero
  const connectWithAccountingSoftware = (providerId: string) => {
    // Simulate integration with accounting software APIs
    setTimeout(() => {
      const providerName = financialProviders.find(p => p.id === providerId)?.name || providerId;

      // Mock accounts based on accounting provider
      const mockAccounts: ConnectedAccount[] = [
        {
          id: `${providerId}-acc-1`,
          accountName: `${providerName} Operating Account`,
          accountType: 'checking',
          institutionName: providerName,
          balance: 75000 + Math.random() * 50000,
          isVerified: true,
        },
        {
          id: `${providerId}-acc-2`,
          accountName: `${providerName} Payroll Account`,
          accountType: 'checking',
          institutionName: providerName,
          balance: 25000 + Math.random() * 15000,
          isVerified: true,
        },
        {
          id: `${providerId}-acc-3`,
          accountName: `${providerName} Tax Reserve`,
          accountType: 'savings',
          institutionName: providerName,
          balance: 45000 + Math.random() * 25000,
          isVerified: true,
        },
      ];

      setConnectedAccounts(prev => [...prev, ...mockAccounts]);
      setIsConnecting(false);
      setShowModal(false);

      if (onAccountsConnected) {
        onAccountsConnected(mockAccounts);
      }
    }, 2000);
  };

  // Generic function to connect with any provider
  const connectWithProvider = (providerId: string) => {
    if (providerId === 'plaid') {
      // Plaid is handled by the PlaidBankVerification component
      return;
    } else if (['quickbooks', 'xero', 'sage', 'myob', 'netsuite'].includes(providerId)) {
      connectWithAccountingSoftware(providerId);
    } else {
      // Handle other providers
      setTimeout(() => {
        // Mock other provider connections
        const mockAccounts: ConnectedAccount[] = [
          {
            id: `${providerId}-acc-1`,
            accountName: `${providerId.charAt(0).toUpperCase() + providerId.slice(1)} Account`,
            accountType: 'other',
            institutionName: providerId.charAt(0).toUpperCase() + providerId.slice(1),
            balance: 50000 + Math.random() * 100000,
            isVerified: true,
          },
        ];

        setConnectedAccounts(prev => [...prev, ...mockAccounts]);
        setIsConnecting(false);
        setShowModal(false);

        if (onAccountsConnected) {
          onAccountsConnected(mockAccounts);
        }
      }, 2000);
    }
  };

  // Handle document file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);

      // Process each file
      Array.from(e.target.files).forEach(file => {
        // In a real implementation, you would upload to a server here
        // For this example, we'll just create a mock object

        setTimeout(() => {
          const newDocument: UploadedFinancialStatement = {
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadDate: new Date().toISOString(),
            documentType: selectedDocumentType as any,
            period: documentPeriod,
            isProcessed: true,
            parsedData: {
              // Mock parsed data based on document type
              totalAssets: selectedDocumentType === 'balance_sheet' ? '$1,245,000' : undefined,
              totalLiabilities: selectedDocumentType === 'balance_sheet' ? '$675,000' : undefined,
              netIncome: selectedDocumentType === 'income_statement' ? '$358,000' : undefined,
              accountBalance: selectedDocumentType === 'bank_statement' ? '$25,430.21' : undefined,
            },
          };

          setUploadedDocuments(prev => [...prev, newDocument]);
          setIsUploading(false);

          if (onDocumentsUploaded) {
            onDocumentsUploaded([...uploadedDocuments, newDocument]);
          }
        }, 1500);
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle drag and drop
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsUploading(true);

      Array.from(e.dataTransfer.files).forEach(file => {
        setTimeout(() => {
          const newDocument: UploadedFinancialStatement = {
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadDate: new Date().toISOString(),
            documentType: selectedDocumentType as any,
            period: documentPeriod,
            isProcessed: true,
            parsedData: {
              // Mock parsed data based on document type
              totalAssets: selectedDocumentType === 'balance_sheet' ? '$1,245,000' : undefined,
              totalLiabilities: selectedDocumentType === 'balance_sheet' ? '$675,000' : undefined,
              netIncome: selectedDocumentType === 'income_statement' ? '$358,000' : undefined,
              accountBalance: selectedDocumentType === 'bank_statement' ? '$25,430.21' : undefined,
            },
          };

          setUploadedDocuments(prev => [...prev, newDocument]);
          setIsUploading(false);

          if (onDocumentsUploaded) {
            onDocumentsUploaded([...uploadedDocuments, newDocument]);
          }
        }, 1500);
      });
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Remove a connected account
  const removeAccount = (accountId: string) => {
    setConnectedAccounts(prev => prev.filter(account => account.id !== accountId));
  };

  // Remove an uploaded document
  const removeDocument = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Financial Account Information</h2>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('connect')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'connect'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Connect Accounts
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upload Financial Documents
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'connect' && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connect Your Financial Accounts
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Connect your bank accounts, accounting software, or other financial services to
              automatically import financial data.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {financialProviders.map(provider => (
                <div
                  key={provider.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 flex-shrink-0 mr-3">
                      <svg
                        className="h-10 w-10 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{provider.name}</h4>
                      <p className="text-xs text-gray-500">{provider.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnectProvider(provider.id)}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>

          {connectedAccounts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Connected Accounts</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Institution
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Account Name
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
                          Balance
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
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
                      {connectedAccounts.map(account => (
                        <tr key={account.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {account.institutionName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {account.accountName} {account.mask ? `••••${account.mask}` : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {account.accountType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {account.balance < 0 ? '-' : ''}$
                            {Math.abs(account.balance).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${account.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                            >
                              {account.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => removeAccount(account.id)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Disconnect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'upload' && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Financial Documents</h3>
            <p className="text-sm text-gray-500 mb-4">
              Upload bank statements, tax returns, or other financial documents to provide financial
              information for your application.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="documentType"
                >
                  Document Type
                </label>
                <select
                  id="documentType"
                  value={selectedDocumentType}
                  onChange={e => setSelectedDocumentType(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {documentTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="documentPeriod"
                >
                  Time Period (Optional)
                </label>
                <input
                  type="text"
                  id="documentPeriod"
                  value={documentPeriod}
                  onChange={e => setDocumentPeriod(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Jan 2023, Q1 2023, 2022"
                />
              </div>
            </div>

            <div className="mt-2">
              <div
                className={`border-2 border-dashed ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'} rounded-lg p-6 text-center transition-colors duration-200`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                  accept=".pdf,.csv,.xls,.xlsx,.doc,.docx,.txt"
                />
                <svg
                  className={`mx-auto h-12 w-12 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`}
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
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {isDragging ? (
                      <span className="font-medium text-primary-600">
                        Drop files here to upload
                      </span>
                    ) : (
                      <>
                        Drag and drop files here, or{' '}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-primary-600 hover:text-primary-500"
                        >
                          browse
                        </button>{' '}
                        to select files
                      </>
                    )}
                  </p>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: PDF, CSV, Excel, Word, TXT (Max 25MB per file)
                </p>
              </div>
            </div>
          </div>

          {isUploading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-sm text-gray-500">Uploading and processing document...</p>
            </div>
          )}

          {uploadedDocuments.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Document Name
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
                          Period
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Size
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
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
                      {uploadedDocuments.map(doc => (
                        <tr key={doc.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {doc.fileName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {doc.documentType.replace(/_/g, ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doc.period || 'Not specified'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatFileSize(doc.fileSize)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.isProcessed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                            >
                              {doc.isProcessed ? 'Processed' : 'Processing'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => removeDocument(doc.id)}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              Remove
                            </button>
                            <button className="text-primary-600 hover:text-primary-900">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Connection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              {isConnecting ? (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
                  </div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                    Connecting to{' '}
                    {financialProviders.find(p => p.id === selectedProvider)?.name ||
                      selectedProvider}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Please wait while we establish a secure connection...
                  </p>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-primary-600 rounded-full animate-pulse"
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
                    <svg
                      className="h-6 w-6 text-primary-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>

                  <h3 className="text-lg text-center leading-6 font-medium text-gray-900 mb-4">
                    Connect to{' '}
                    {financialProviders.find(p => p.id === selectedProvider)?.name ||
                      selectedProvider}
                  </h3>

                  {selectedProvider === 'plaid' && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Select your bank to securely connect your accounts:
                      </p>

                      <div className="space-y-2">
                        {['Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'Other...'].map(
                          bank => (
                            <button
                              key={bank}
                              onClick={() => connectWithProvider(selectedProvider)}
                              className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              <span>{bank}</span>
                              <svg
                                className="h-4 w-4 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {['quickbooks', 'xero', 'sage', 'myob', 'netsuite'].includes(
                    selectedProvider
                  ) && (
                    <div>
                      <p className="text-sm text-gray-500 mb-4">
                        Enter your credentials to connect your{' '}
                        {financialProviders.find(p => p.id === selectedProvider)?.name} account:
                      </p>

                      <form className="space-y-4">
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="your-email@example.com"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Password
                          </label>
                          <input
                            type="password"
                            id="password"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="••••••••"
                          />
                        </div>

                        {selectedProvider === 'netsuite' && (
                          <div>
                            <label
                              htmlFor="account-id"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Account ID
                            </label>
                            <input
                              type="text"
                              id="account-id"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              placeholder="1234567"
                            />
                          </div>
                        )}

                        <div className="flex items-center">
                          <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                            Remember me
                          </label>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}

              <div className="mt-5 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                {!isConnecting && (
                  <>
                    <button
                      type="button"
                      onClick={() => connectWithProvider(selectedProvider)}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
                    >
                      Connect
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {isConnecting && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsConnecting(false);
                      setShowModal(false);
                    }}
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm col-span-2"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plaid Bank Verification Modal */}
      {showPlaidVerification && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => setShowPlaidVerification(false)}
                >
                  <span className="sr-only">Close</span>
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

              <PlaidBankVerification
                onVerificationComplete={handlePlaidVerificationComplete}
                onError={error => {
                  console.error('Plaid verification error:', error);
                  setShowPlaidVerification(false);
                }}
                ownershipPercentage={ownershipPercentage}
                businessName="Your Business Name" // This should come from the credit application data
                ownerName="Business Owner" // This should come from the credit application data
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialAccountConnector;
