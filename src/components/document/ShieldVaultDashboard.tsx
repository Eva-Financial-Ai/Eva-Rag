import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { Link } from 'react-router-dom';
import DocumentSecurityService, {
  DocumentVaultRecord,
  UserType,
} from '../../services/DocumentSecurityService';
import { FileItem } from './FilelockDriveApp';

interface ShieldVaultDashboardProps {
  transactionId?: string; // Optional - if provided, filters to just this transaction
}

const ShieldVaultDashboard: React.FC<ShieldVaultDashboardProps> = ({ transactionId }) => {
  // Make context usage optional with default values
  const userContext = useContext(UserContext);
  const userName = userContext?.userName || 'User';
  const userRole = userContext?.userRole || 'viewer';

  const [loading, setLoading] = useState(true);
  const [vaultRecords, setVaultRecords] = useState<DocumentVaultRecord[]>([]);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Record<string, DocumentVaultRecord[]>>({});
  const [filter, setFilter] = useState<'all' | 'locked' | 'expiring-soon'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'expiry'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [unverifiedFiles, setUnverifiedFiles] = useState<FileItem[]>([]);
  const [verifyingFile, setVerifyingFile] = useState<string | null>(null);

  useEffect(() => {
    const loadVaultRecords = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would fetch from an API
        // Use the default exported instance instead of calling getInstance()
        const documentSecurityService = DocumentSecurityService;

        // Simulate fetching vault records
        let records: DocumentVaultRecord[] = [];

        // If transaction ID provided, filter to just that transaction
        if (transactionId) {
          records = documentSecurityService.getDocumentsInVault(transactionId);
        } else {
          // Get all transactions with vault records (simulated)
          // In a real implementation, this would be an API call
          const mockTransactionIds = ['tx-1234', 'tx-5678', 'tx-9012'];

          for (const txId of mockTransactionIds) {
            const txRecords = documentSecurityService.getDocumentsInVault(txId);
            records = [...records, ...txRecords];
          }
        }

        setVaultRecords(records);

        // Group by transaction
        const grouped: Record<string, DocumentVaultRecord[]> = {};
        records.forEach(record => {
          if (!grouped[record.transactionId]) {
            grouped[record.transactionId] = [];
          }
          grouped[record.transactionId].push(record);
        });

        setTransactions(grouped);

        // If there's only one transaction, expand it automatically
        if (Object.keys(grouped).length === 1) {
          setExpandedTransaction(Object.keys(grouped)[0]);
        }
      } catch (error) {
        console.error('Error loading vault records:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVaultRecords();

    // Simulate loading unverified files (e.g., from cloud storage)
    // In a real implementation, this would come from your file storage service
    const getUnverifiedFiles = async () => {
      try {
        // In a real implementation, this would be an API call
        // Here we're simulating files that have the 'Unverified' tag
        const mockUnverifiedFiles: FileItem[] = [
          {
            id: 'imported-google-drive-123',
            name: 'Financial Statement 2023.pdf',
            type: 'pdf',
            size: 2500000,
            lastModified: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            path: '/Financial Statement 2023.pdf',
            parentId: 'root',
            owner: 'me',
            verificationStatus: 'pending',
            tags: ['Imported from google-drive', 'Unverified'],
            downloadUrl: '#',
          },
          {
            id: 'imported-onedrive-456',
            name: 'Tax Documents 2023.pdf',
            type: 'pdf',
            size: 3200000,
            lastModified: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            path: '/Tax Documents 2023.pdf',
            parentId: 'root',
            owner: 'me',
            verificationStatus: 'pending',
            tags: ['Imported from onedrive', 'Unverified'],
            downloadUrl: '#',
          },
        ];

        setUnverifiedFiles(mockUnverifiedFiles);
      } catch (error) {
        console.error('Error loading unverified files:', error);
      }
    };

    getUnverifiedFiles();
  }, [transactionId]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format retention period for display
  const formatRetentionPeriod = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    }
  };

  // Get remaining days until expiry
  const getDaysRemaining = (expiryDate: string): number => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get status badge color based on days remaining
  const getStatusColor = (daysRemaining: number) => {
    if (daysRemaining <= 30) return 'bg-red-100 text-red-800';
    if (daysRemaining <= 90) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Toggle expanded transaction
  const toggleTransaction = (txId: string) => {
    setExpandedTransaction(expandedTransaction === txId ? null : txId);
  };

  // Filter vault records
  const filteredRecords = Object.entries(transactions).filter(([txId, records]) => {
    if (filter === 'all') return true;
    if (filter === 'locked') {
      return records.some(record => record.documentMetadata.isLocked);
    }
    if (filter === 'expiring-soon') {
      return records.some(record => {
        if (!record.retentionExpiryDate) return false;
        const daysRemaining = getDaysRemaining(record.retentionExpiryDate);
        return daysRemaining <= 90; // 3 months
      });
    }
    return true;
  });

  // Sort transactions
  const sortedTransactions = [...filteredRecords].sort(([txIdA, recordsA], [txIdB, recordsB]) => {
    if (sortBy === 'date') {
      const dateA = new Date(recordsA[0].vaultEntryDate).getTime();
      const dateB = new Date(recordsB[0].vaultEntryDate).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  // Handle file verification
  const handleVerifyFile = async (fileId: string) => {
    setVerifyingFile(fileId);

    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update the file's verification status
      setUnverifiedFiles(prevFiles =>
        prevFiles.map(file =>
          file.id === fileId
            ? {
                ...file,
                verificationStatus: 'verified',
                blockchainVerified: true,
                blockchainTxId: `tx-${Date.now()}`,
                tags: file.tags?.filter(tag => tag !== 'Unverified').concat(['Verified']) || [
                  'Verified',
                ],
              }
            : file
        )
      );

      // In a real implementation, you would also update the file in your database
    } catch (error) {
      console.error('Error verifying file:', error);
    } finally {
      setVerifyingFile(null);
    }
  };

  // Get blockchain record details
  const getBlockchainRecordDetails = (file: FileItem) => {
    if (!file.blockchainVerified || !file.blockchainTxId) return null;

    return {
      timestamp: new Date().toISOString(),
      hash: `0x${Array(64)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')}`,
      txId: file.blockchainTxId,
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-3 bg-gray-50">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex space-x-4 mb-2 sm:mb-0">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            >
              <option value="all">All Documents</option>
              <option value="locked">Locked Only</option>
              <option value="expiring-soon">Expiring Soon</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="expiry">Sort by Expiry</option>
            </select>

            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              <svg
                className={`ml-1 h-4 w-4 transform ${sortDirection === 'asc' ? '' : 'rotate-180'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </div>

          <div className="text-sm text-gray-500">
            {vaultRecords.length} {vaultRecords.length === 1 ? 'document' : 'documents'} in vault
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <svg
              className="animate-spin h-10 w-10 text-primary-500 mb-3"
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
            <p className="text-gray-500">Loading vault documents...</p>
          </div>
        ) : vaultRecords.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents in vault</h3>
            <p className="mt-1 text-sm text-gray-500">
              Documents that are locked in the Shield Escrow Vault will appear here.
            </p>
            <div className="mt-6">
              <Link
                to="/transactions"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                View Transactions
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedTransactions.map(([txId, records]) => (
              <div key={txId} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleTransaction(txId)}
                  className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-gray-400 mr-2"
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
                    <span className="font-medium text-gray-900">Transaction: {txId}</span>
                    <span className="ml-2 text-gray-500 text-sm">
                      ({records.length} {records.length === 1 ? 'document' : 'documents'})
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">
                      {formatDate(records[0].vaultEntryDate)}
                    </span>
                    <svg
                      className={`h-5 w-5 text-gray-400 transform ${expandedTransaction === txId ? 'rotate-180' : ''}`}
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
                  </div>
                </button>

                {expandedTransaction === txId && (
                  <div className="px-4 py-3">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Document
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Retention
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {records.map(record => {
                          const daysRemaining = record.retentionExpiryDate
                            ? getDaysRemaining(record.retentionExpiryDate)
                            : 0;

                          return (
                            <tr key={record.id}>
                              <td className="px-3 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center text-gray-400">
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
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {record.documentMetadata.fileName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Added on {formatDate(record.vaultEntryDate)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap">
                                {record.documentMetadata.isLocked ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    Locked
                                  </span>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Unlocked
                                  </span>
                                )}
                                {record.documentMetadata.isLocked && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    By {record.documentMetadata.lockedBy}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap">
                                {record.retentionPeriod > 0 ? (
                                  <div>
                                    <span
                                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(daysRemaining)}`}
                                    >
                                      {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                                    </span>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Keep for {formatRetentionPeriod(record.retentionPeriod)}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                    No retention required
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm">
                                <button className="text-primary-600 hover:text-primary-800 mr-3">
                                  View
                                </button>
                                {record.documentMetadata.isLocked &&
                                  userName === record.documentMetadata.lockedBy && (
                                    <button className="text-red-600 hover:text-red-800">
                                      Unlock
                                    </button>
                                  )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add this section for Unverified Files */}
      {unverifiedFiles.length > 0 && (
        <div className="border-t border-gray-200 mt-8 pt-6">
          <h3 className="text-lg font-medium text-gray-900 px-6 mb-4">
            Cloud Imported Files Pending Verification
          </h3>

          <div className="px-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    File Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Source
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Import Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unverifiedFiles.map(file => {
                  const blockchainDetails = getBlockchainRecordDetails(file);
                  const cloudSource =
                    file.tags
                      ?.find(tag => tag.includes('Imported from'))
                      ?.replace('Imported from ', '') || 'unknown';

                  return (
                    <tr key={file.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center text-gray-500">
                            {file.type === 'pdf' ? (
                              <svg
                                className="h-8 w-8 text-red-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                              </svg>
                            ) : (
                              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                              </svg>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                            <div className="text-sm text-gray-500">
                              {file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown size'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {cloudSource === 'google-drive'
                            ? 'Google Drive'
                            : cloudSource === 'onedrive'
                              ? 'Microsoft OneDrive'
                              : cloudSource === 'icloud'
                                ? 'Apple iCloud'
                                : 'Unknown Source'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(file.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {file.verificationStatus === 'pending' ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending Verification
                          </span>
                        ) : file.verificationStatus === 'verified' ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Failed Verification
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {file.verificationStatus === 'pending' ? (
                          <button
                            onClick={() => handleVerifyFile(file.id)}
                            disabled={verifyingFile === file.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {verifyingFile === file.id ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-500 inline-block"
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
                                Verifying...
                              </>
                            ) : (
                              <>Verify & Lock</>
                            )}
                          </button>
                        ) : (
                          <div className="text-green-600">
                            <svg
                              className="h-5 w-5 inline-block mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Secured on Blockchain
                            {blockchainDetails && (
                              <div className="text-xs text-gray-500 mt-1">
                                TX: {blockchainDetails.txId.substring(0, 8)}...
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShieldVaultDashboard;
