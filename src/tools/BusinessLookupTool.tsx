import React, { useEffect, useState } from 'react';
import { useEVACustomerContext } from '../contexts/EVACustomerContext';
import { BusinessLookupService } from '../services/BusinessLookupService';
import {
  BusinessLookupResult,
  BusinessRecord,
  StateConfigurations,
  VectorDBEntry,
} from '../types/businessLookup';

interface BusinessLookupToolProps {
  onResultsReady: (results: BusinessLookupResult) => void;
  onError: (error: string) => void;
  businessName?: string;
  dbaName?: string;
  states?: string[];
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
}

export const BusinessLookupTool: React.FC<BusinessLookupToolProps> = ({
  onResultsReady,
  onError,
  businessName: initialBusinessName,
  dbaName: initialDbaName,
  states: initialStates,
  showCloseButton,
  onClose,
  className,
}) => {
  const { selectedCustomer, updateCustomerBusinessRecords } = useEVACustomerContext();
  const [isSearching, setIsSearching] = useState(false);
  const [searchForm, setSearchForm] = useState({
    businessName: initialBusinessName || '',
    dbaName: initialDbaName || '',
    selectedStates: initialStates || [],
    searchAllStates: !initialStates || initialStates.length === 0,
  });
  const [searchResults, setSearchResults] = useState<BusinessLookupResult | null>(null);
  const [businessLookupService] = useState(
    () =>
      new BusinessLookupService(
        {
          accountId: process.env.REACT_APP_CLOUDFLARE_ACCOUNT_ID!,
          apiToken: process.env.REACT_APP_CLOUDFLARE_API_TOKEN!,
          endpoint: process.env.REACT_APP_CLOUDFLARE_WORKERS_ENDPOINT!,
        },
        {
          apiKey: process.env.REACT_APP_BRAVE_SEARCH_API_KEY!,
          endpoint: process.env.REACT_APP_BRAVE_SEARCH_ENDPOINT!,
        },
        {
          url: process.env.REACT_APP_SUPABASE_URL!,
          apiKey: process.env.REACT_APP_SUPABASE_ANON_KEY!,
        },
        {
          accountId: process.env.REACT_APP_CLOUDFLARE_R2_ACCOUNT_ID!,
          accessKeyId: process.env.REACT_APP_CLOUDFLARE_R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.REACT_APP_CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
          bucketName: process.env.REACT_APP_CLOUDFLARE_R2_BUCKET_NAME!,
        },
      ),
  );

  // Pre-populate with customer data if available and props are not provided
  useEffect(() => {
    const customerBusinessName =
      selectedCustomer?.businessName || selectedCustomer?.metadata?.business_info?.legal_name;
    const customerDbaName = selectedCustomer?.metadata?.business_info?.dba_name;

    setSearchForm(prev => ({
      ...prev,
      businessName: initialBusinessName || customerBusinessName || '',
      dbaName: initialDbaName || customerDbaName || '',
      selectedStates: initialStates || prev.selectedStates,
      searchAllStates: (!initialStates || initialStates.length === 0) && prev.searchAllStates,
    }));
  }, [selectedCustomer, initialBusinessName, initialDbaName, initialStates]);

  const handleSearch = async () => {
    if (!searchForm.businessName.trim()) {
      onError('Business name is required');
      return;
    }

    setIsSearching(true);
    try {
      const startTime = Date.now();

      const results = await businessLookupService.lookupBusiness(
        searchForm.businessName,
        searchForm.dbaName || undefined,
        searchForm.searchAllStates ? undefined : searchForm.selectedStates,
      );

      const lookupResult: BusinessLookupResult = {
        success: true,
        businessRecords: results.businessRecords,
        documents: results.businessRecords.flatMap(record => record.documents),
        vectorDbEntries: results.vectorDbData as unknown as VectorDBEntry[], // Type assertion for mock data
        errors: results.errors,
        searchMetadata: {
          searchTerms: [searchForm.businessName, searchForm.dbaName].filter(Boolean),
          statesSearched: searchForm.searchAllStates
            ? Object.keys(StateConfigurations)
            : searchForm.selectedStates,
          totalResults: results.businessRecords.length,
          searchDuration: Date.now() - startTime,
          braveSearchResults: 0, // Would be populated by service
          stateApiResults: 0,
          webScrapingResults: 0,
          manualLookupResults: 0,
        },
      };

      setSearchResults(lookupResult);
      onResultsReady(lookupResult);

      // If customer is selected, update their business records
      if (selectedCustomer) {
        await updateCustomerBusinessRecords(selectedCustomer.id, results.businessRecords);
      }
    } catch (error) {
      console.error('Business lookup error:', error);
      onError(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStateToggle = (stateCode: string) => {
    setSearchForm(prev => ({
      ...prev,
      selectedStates: prev.selectedStates.includes(stateCode)
        ? prev.selectedStates.filter(s => s !== stateCode)
        : [...prev.selectedStates, stateCode],
    }));
  };

  const allStates = Object.keys(StateConfigurations).sort();

  return (
    <div className={`bg-white rounded-lg p-6 shadow-lg ${className}`}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Business Lookup Tool</h2>
        <div className="flex items-center space-x-2">
          {showCloseButton && onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <span className="text-sm text-gray-500">Powered by</span>
          <span className="text-sm font-semibold text-blue-600">Cloudflare AI + Brave Search</span>
        </div>
      </div>

      {/* Search Form */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Business Legal Name *
          </label>
          <input
            type="text"
            value={searchForm.businessName}
            onChange={e =>
              setSearchForm(prev => ({
                ...prev,
                businessName: e.target.value,
              }))
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the legal business name"
            disabled={isSearching}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            DBA / Trade Name (Optional)
          </label>
          <input
            type="text"
            value={searchForm.dbaName}
            onChange={e =>
              setSearchForm(prev => ({
                ...prev,
                dbaName: e.target.value,
              }))
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter DBA or trade name if applicable"
            disabled={isSearching}
          />
        </div>

        <div>
          <label className="mb-3 flex items-center space-x-2">
            <input
              type="checkbox"
              checked={searchForm.searchAllStates}
              onChange={e =>
                setSearchForm(prev => ({
                  ...prev,
                  searchAllStates: e.target.checked,
                  selectedStates: e.target.checked ? [] : prev.selectedStates,
                }))
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={isSearching}
            />
            <span className="text-sm font-medium text-gray-700">Search all 50 states</span>
          </label>

          {!searchForm.searchAllStates && (
            <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200 p-4">
              <div className="grid grid-cols-3 gap-2">
                {allStates.map(stateCode => (
                  <label key={stateCode} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={searchForm.selectedStates.includes(stateCode)}
                      onChange={() => handleStateToggle(stateCode)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSearching}
                    />
                    <span>{stateCode}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={isSearching || !searchForm.businessName.trim()}
        className="text-white flex w-full items-center justify-center space-x-2 rounded-md bg-blue-600 px-4 py-3 transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isSearching ? (
          <>
            <svg
              className="text-white -ml-1 mr-3 h-5 w-5 animate-spin"
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
            <span>
              Searching{' '}
              {searchForm.searchAllStates
                ? '50 states'
                : `${searchForm.selectedStates.length} states`}
              ...
            </span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Search Business Records</span>
          </>
        )}
      </button>

      {/* Search Results */}
      {searchResults && (
        <div className="mt-8">
          <BusinessLookupResults results={searchResults} />
        </div>
      )}
    </div>
  );
};

interface BusinessLookupResultsProps {
  results: BusinessLookupResult;
}

const BusinessLookupResults: React.FC<BusinessLookupResultsProps> = ({ results }) => {
  const [selectedRecord, setSelectedRecord] = useState<BusinessRecord | null>(null);

  return (
    <div className="space-y-6">
      {/* Search Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Search Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <span className="text-gray-600">Total Results:</span>
            <span className="ml-2 font-semibold">{results.searchMetadata.totalResults}</span>
          </div>
          <div>
            <span className="text-gray-600">States Searched:</span>
            <span className="ml-2 font-semibold">
              {results.searchMetadata.statesSearched.length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Documents Found:</span>
            <span className="ml-2 font-semibold">{results.documents.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Search Time:</span>
            <span className="ml-2 font-semibold">
              {(results.searchMetadata.searchDuration / 1000).toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      {/* Business Records */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Business Records Found</h3>
        <div className="space-y-4">
          {results.businessRecords.map(record => (
            <div
              key={record.id}
              className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
              onClick={() => setSelectedRecord(record)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">{record.businessName}</h4>
                  {record.dbaName && <p className="text-sm text-gray-600">DBA: {record.dbaName}</p>}
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <svg
                        className="mr-1 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {record.state}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="mr-1 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      {record.entityType}
                    </span>
                    <span className="flex items-center">
                      <span
                        className={`mr-1 h-2 w-2 rounded-full ${
                          record.status === 'active'
                            ? 'bg-green-500'
                            : record.status === 'inactive'
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                        }`}
                      ></span>
                      {record.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Filing #{record.filingNumber}</div>
                  <div className="text-sm text-gray-600">{record.documents.length} documents</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Errors */}
      {results.errors.length > 0 && (
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <h3 className="mb-2 text-lg font-semibold text-red-900">Search Errors</h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
            {results.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Record Modal */}
      {selectedRecord && (
        <BusinessRecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </div>
  );
};

interface BusinessRecordModalProps {
  record: BusinessRecord;
  onClose: () => void;
}

const BusinessRecordModal: React.FC<BusinessRecordModalProps> = ({ record, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-lg">
        <div className="bg-white sticky top-0 flex items-center justify-between border-b p-6">
          <h2 className="text-2xl font-bold text-gray-900">{record.businessName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Basic Information */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Entity Type:</span>
                <span className="ml-2 font-medium">{record.entityType}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-medium">{record.status}</span>
              </div>
              <div>
                <span className="text-gray-600">Formation Date:</span>
                <span className="ml-2 font-medium">{record.formationDate || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Filing Number:</span>
                <span className="ml-2 font-medium">{record.filingNumber}</span>
              </div>
            </div>
          </div>

          {/* Address Information */}
          {record.address && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">Address</h3>
              <p className="text-sm">
                {record.address.street1}
                <br />
                {record.address.street2 && (
                  <>
                    {record.address.street2}
                    <br />
                  </>
                )}
                {record.address.city}, {record.address.state} {record.address.zipCode}
              </p>
            </div>
          )}

          {/* Registered Agent */}
          {record.registeredAgent && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">Registered Agent</h3>
              <p className="text-sm font-medium">{record.registeredAgent.name}</p>
              <p className="text-sm text-gray-600">
                {record.registeredAgent.address.street1}
                <br />
                {record.registeredAgent.address.street2 && (
                  <>
                    {record.registeredAgent.address.street2}
                    <br />
                  </>
                )}
                {record.registeredAgent.address.city}, {record.registeredAgent.address.state}{' '}
                {record.registeredAgent.address.zipCode}
              </p>
            </div>
          )}

          {/* Documents */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">
              Available Documents ({record.documents.length})
            </h3>
            <div className="space-y-2">
              {record.documents.map((doc, index) => (
                <div
                  key={index}
                  className="bg-gray-50 flex items-center justify-between rounded p-3"
                >
                  <div>
                    <span className="font-medium">{doc.type.replace(/_/g, ' ').toUpperCase()}</span>
                    {doc.filingDate && (
                      <span className="ml-2 text-sm text-gray-600">Filed: {doc.filingDate}</span>
                    )}
                  </div>
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Document
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessLookupTool;
