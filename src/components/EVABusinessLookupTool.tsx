import React, { useCallback, useState } from 'react';
import { useEVACustomerContext } from '../contexts/EVACustomerContext';
import { useEVATools } from '../contexts/EVAToolContext';
import { EnhancedBusinessRecord } from '../services/EnhancedBusinessLookupService';

interface EVABusinessLookupToolProps {
  onResultsReady?: (results: any) => void;
  embedded?: boolean;
}

export const EVABusinessLookupTool: React.FC<EVABusinessLookupToolProps> = ({
  onResultsReady,
  embedded = false,
}) => {
  const { performBusinessLookup, getCustomerBusinessRecords } = useEVATools();
  const { selectedCustomer } = useEVACustomerContext() || { selectedCustomer: null };

  const [isSearching, setIsSearching] = useState(false);
  const [searchForm, setSearchForm] = useState({
    businessLegalName: '',
    doingBusinessAs: [''],
    tradenames: [''],
    searchAllStates: true,
    specificStates: [] as string[],
    includePublicFilings: true,
    includeContactInfo: true,
  });
  const [searchResults, setSearchResults] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [progressMessage, setProgressMessage] = useState<string>('');

  const handleSearch = useCallback(async () => {
    if (!searchForm.businessLegalName.trim()) {
      setError('Business legal name is required');
      return;
    }

    setIsSearching(true);
    setError('');
    setProgressMessage('Initializing comprehensive business search...');

    try {
      // Filter out empty DBA and tradenames
      const dbas = searchForm.doingBusinessAs.filter(dba => dba.trim());
      const tradenames = searchForm.tradenames.filter(tn => tn.trim());

      const params = {
        businessLegalName: searchForm.businessLegalName,
        doingBusinessAs: dbas.length > 0 ? dbas : undefined,
        tradenames: tradenames.length > 0 ? tradenames : undefined,
        searchAllStates: searchForm.searchAllStates,
        specificStates: searchForm.searchAllStates ? undefined : searchForm.specificStates,
        includePublicFilings: searchForm.includePublicFilings,
        includeContactInfo: searchForm.includeContactInfo,
        customerId: selectedCustomer?.id,
      };

      // Update progress messages during search
      const progressInterval = setInterval(() => {
        const messages = [
          'Searching state registries...',
          'Querying e-Secretary of State database...',
          'Checking SEC EDGAR filings...',
          'Gathering contact information...',
          'Building comprehensive business profile...',
        ];
        setProgressMessage(messages[Math.floor(Math.random() * messages.length)]);
      }, 2000);

      const results = await performBusinessLookup(params);

      clearInterval(progressInterval);
      setProgressMessage('');
      setSearchResults(results);

      if (onResultsReady) {
        onResultsReady(results);
      }
    } catch (error) {
      console.error('Business lookup error:', error);
      setError(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProgressMessage('');
    } finally {
      setIsSearching(false);
    }
  }, [searchForm, performBusinessLookup, selectedCustomer, onResultsReady]);

  const addDBA = () => {
    setSearchForm(prev => ({
      ...prev,
      doingBusinessAs: [...prev.doingBusinessAs, ''],
    }));
  };

  const removeDBA = (index: number) => {
    setSearchForm(prev => ({
      ...prev,
      doingBusinessAs: prev.doingBusinessAs.filter((_, i) => i !== index),
    }));
  };

  const addTradename = () => {
    setSearchForm(prev => ({
      ...prev,
      tradenames: [...prev.tradenames, ''],
    }));
  };

  const removeTradename = (index: number) => {
    setSearchForm(prev => ({
      ...prev,
      tradenames: prev.tradenames.filter((_, i) => i !== index),
    }));
  };

  const allStates = [
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
  ];

  if (embedded) {
    return (
      <div className="eva-business-lookup-tool-embedded">
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchForm.businessLegalName.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSearching ? 'Searching...' : 'Lookup Business'}
        </button>
      </div>
    );
  }

  return (
    <div className="eva-business-lookup-tool mx-auto max-w-6xl p-6">
      <div className="rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="rounded-t-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold">EVA Enhanced Business Lookup Tool</h2>
          <p className="mt-2 text-blue-100">
            Comprehensive business entity search across all 50 states with SEC EDGAR integration
          </p>
        </div>

        {/* Search Form */}
        <div className="space-y-6 p-6">
          {/* Business Legal Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Business Legal Name *
            </label>
            <input
              type="text"
              value={searchForm.businessLegalName}
              onChange={e =>
                setSearchForm(prev => ({ ...prev, businessLegalName: e.target.value }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the exact legal business name"
              disabled={isSearching}
            />
          </div>

          {/* DBA Names */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Doing Business As (DBA) Names
            </label>
            {searchForm.doingBusinessAs.map((dba, index) => (
              <div key={index} className="mb-2 flex">
                <input
                  type="text"
                  value={dba}
                  onChange={e => {
                    const newDBAs = [...searchForm.doingBusinessAs];
                    newDBAs[index] = e.target.value;
                    setSearchForm(prev => ({ ...prev, doingBusinessAs: newDBAs }));
                  }}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter DBA name"
                  disabled={isSearching}
                />
                {searchForm.doingBusinessAs.length > 1 && (
                  <button
                    onClick={() => removeDBA(index)}
                    className="ml-2 px-3 py-2 text-red-600 hover:text-red-800"
                    disabled={isSearching}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addDBA}
              className="text-sm text-blue-600 hover:text-blue-800"
              disabled={isSearching}
            >
              + Add another DBA
            </button>
          </div>

          {/* Trade Names */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Trade Names</label>
            {searchForm.tradenames.map((tradename, index) => (
              <div key={index} className="mb-2 flex">
                <input
                  type="text"
                  value={tradename}
                  onChange={e => {
                    const newTradenames = [...searchForm.tradenames];
                    newTradenames[index] = e.target.value;
                    setSearchForm(prev => ({ ...prev, tradenames: newTradenames }));
                  }}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter trade name"
                  disabled={isSearching}
                />
                {searchForm.tradenames.length > 1 && (
                  <button
                    onClick={() => removeTradename(index)}
                    className="ml-2 px-3 py-2 text-red-600 hover:text-red-800"
                    disabled={isSearching}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addTradename}
              className="text-sm text-blue-600 hover:text-blue-800"
              disabled={isSearching}
            >
              + Add another trade name
            </button>
          </div>

          {/* State Selection */}
          <div>
            <label className="mb-3 flex items-center">
              <input
                type="checkbox"
                checked={searchForm.searchAllStates}
                onChange={e =>
                  setSearchForm(prev => ({
                    ...prev,
                    searchAllStates: e.target.checked,
                    specificStates: e.target.checked ? [] : prev.specificStates,
                  }))
                }
                className="mr-2"
                disabled={isSearching}
              />
              <span className="text-sm font-medium text-gray-700">
                Search all 50 states (Recommended for comprehensive results)
              </span>
            </label>

            {!searchForm.searchAllStates && (
              <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200 p-4">
                <div className="grid grid-cols-5 gap-2">
                  {allStates.map(state => (
                    <label key={state} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={searchForm.specificStates.includes(state)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSearchForm(prev => ({
                              ...prev,
                              specificStates: [...prev.specificStates, state],
                            }));
                          } else {
                            setSearchForm(prev => ({
                              ...prev,
                              specificStates: prev.specificStates.filter(s => s !== state),
                            }));
                          }
                        }}
                        className="mr-1"
                        disabled={isSearching}
                      />
                      {state}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={searchForm.includePublicFilings}
                onChange={e =>
                  setSearchForm(prev => ({ ...prev, includePublicFilings: e.target.checked }))
                }
                className="mr-2"
                disabled={isSearching}
              />
              <span className="text-sm font-medium text-gray-700">
                Include SEC EDGAR public filings search
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={searchForm.includeContactInfo}
                onChange={e =>
                  setSearchForm(prev => ({ ...prev, includeContactInfo: e.target.checked }))
                }
                className="mr-2"
                disabled={isSearching}
              />
              <span className="text-sm font-medium text-gray-700">
                Gather contact information and owner details
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 rounded border border-red-200 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchForm.businessLegalName.trim()}
            className="w-full rounded-md bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-medium text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500"
          >
            {isSearching ? (
              <span className="flex items-center justify-center">
                <svg
                  className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
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
                {progressMessage || 'Searching...'}
              </span>
            ) : (
              'Search Business Entity'
            )}
          </button>
        </div>

        {/* Results Section */}
        {searchResults && (
          <div className="border-t px-6 py-4">
            <BusinessLookupResults results={searchResults} />
          </div>
        )}
      </div>
    </div>
  );
};

// Results Display Component
const BusinessLookupResults: React.FC<{ results: any }> = ({ results }) => {
  const [selectedRecord, setSelectedRecord] = useState<EnhancedBusinessRecord | null>(null);

  if (!results || !results.enhancedRecords) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="rounded-lg bg-gray-50 p-4">
        <h3 className="mb-3 text-lg font-semibold">Search Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <span className="text-gray-600">Total Records:</span>
            <span className="ml-2 font-semibold">{results.enhancedRecords.length}</span>
          </div>
          <div>
            <span className="text-gray-600">States Found:</span>
            <span className="ml-2 font-semibold">
              {
                [...new Set(results.enhancedRecords.map((r: EnhancedBusinessRecord) => r.state))]
                  .length
              }
            </span>
          </div>
          <div>
            <span className="text-gray-600">Documents:</span>
            <span className="ml-2 font-semibold">{results.documentsFoundCount || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Public Company:</span>
            <span className="ml-2 font-semibold">{results.secEdgarData ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {/* SEC EDGAR Information */}
      {results.secEdgarData && (
        <div className="rounded-lg bg-blue-50 p-4">
          <h3 className="mb-3 text-lg font-semibold text-blue-900">SEC EDGAR Public Filings</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">CIK:</span>
              <span className="font-mono ml-2">{results.secEdgarData.cik}</span>
            </div>
            {results.secEdgarData.ticker && (
              <div>
                <span className="text-blue-700">Ticker:</span>
                <span className="ml-2 font-bold">{results.secEdgarData.ticker}</span>
              </div>
            )}
          </div>
          {results.secEdgarData.filings && results.secEdgarData.filings.length > 0 && (
            <div className="mt-3">
              <h4 className="mb-2 font-medium text-blue-900">Recent Filings:</h4>
              <div className="space-y-1">
                {results.secEdgarData.filings.slice(0, 5).map((filing: any, index: number) => (
                  <div key={index} className="text-sm">
                    <span className="font-mono text-blue-700">{filing.type}</span>
                    <span className="mx-2 text-gray-500">-</span>
                    <span>{filing.date}</span>
                    <a
                      href={filing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Business Records */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Business Entity Records</h3>
        <div className="space-y-3">
          {results.enhancedRecords.map((record: EnhancedBusinessRecord, index: number) => (
            <div
              key={index}
              className="cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md"
              onClick={() => setSelectedRecord(record)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold">{record.businessName}</h4>
                  {record.dbaName && <p className="text-sm text-gray-600">DBA: {record.dbaName}</p>}
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <span
                        className={`mr-1 h-2 w-2 rounded-full ${
                          record.status === 'active'
                            ? 'bg-green-500'
                            : record.status === 'inactive'
                              ? 'bg-gray-500'
                              : 'bg-red-500'
                        }`}
                      ></span>
                      {record.status}
                    </span>
                    <span>{record.state}</span>
                    <span>{record.entityType}</span>
                    {record.dataCompleteness && (
                      <span className="text-gray-500">{record.dataCompleteness}% complete</span>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>Filing #{record.filingNumber}</div>
                  {record.formationDate && (
                    <div>Formed: {new Date(record.formationDate).toLocaleDateString()}</div>
                  )}
                </div>
              </div>

              {/* Contact Information Preview */}
              {(record.website || record.phoneNumbers?.length) && (
                <div className="mt-3 border-t pt-3 text-sm">
                  {record.website && (
                    <div className="text-blue-600">
                      <a href={record.website} target="_blank" rel="noopener noreferrer">
                        {record.website}
                      </a>
                    </div>
                  )}
                  {record.phoneNumbers && record.phoneNumbers.length > 0 && (
                    <div className="text-gray-600">Phone: {record.phoneNumbers[0].number}</div>
                  )}
                </div>
              )}

              {/* Owner Information Preview */}
              {record.owners && record.owners.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Key Personnel:</span>
                  <span className="ml-2">
                    {record.owners
                      .slice(0, 2)
                      .map(o => o.fullName)
                      .join(', ')}
                    {record.owners.length > 2 && ` +${record.owners.length - 2} more`}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information Summary */}
      {results.aggregatedData?.contactInformation && (
        <div className="rounded-lg bg-green-50 p-4">
          <h3 className="mb-3 text-lg font-semibold text-green-900">Contact Information</h3>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            {results.aggregatedData.contactInformation.websites?.length > 0 && (
              <div>
                <span className="font-medium text-green-700">Websites:</span>
                <ul className="mt-1">
                  {results.aggregatedData.contactInformation.websites.map(
                    (website: string, index: number) => (
                      <li key={index}>
                        <a
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {website}
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
            {results.aggregatedData.contactInformation.phoneNumbers?.length > 0 && (
              <div>
                <span className="font-medium text-green-700">Phone Numbers:</span>
                <ul className="mt-1">
                  {results.aggregatedData.contactInformation.phoneNumbers.map(
                    (phone: any, index: number) => (
                      <li key={index}>
                        {phone.number} ({phone.type})
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Record Modal */}
      {selectedRecord && (
        <BusinessRecordDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};

// Detail Modal Component
const formatAddress = (address: any): string => {
  if (typeof address === 'string') {
    return address;
  }
  if (typeof address === 'object' && address) {
    const parts = [
      address.street1,
      address.street2,
      address.city,
      address.state,
      address.zipCode,
      address.country,
    ].filter(Boolean);
    return parts.join(', ');
  }
  return '';
};

const BusinessRecordDetailModal: React.FC<{
  record: EnhancedBusinessRecord;
  onClose: () => void;
}> = ({ record, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white p-4">
          <h2 className="text-xl font-bold">{record.businessName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-600">Entity Type:</dt>
                <dd className="font-medium">{record.entityType}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Status:</dt>
                <dd className="font-medium">{record.status}</dd>
              </div>
              <div>
                <dt className="text-gray-600">State:</dt>
                <dd className="font-medium">{record.state}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Filing Number:</dt>
                <dd className="font-medium">{record.filingNumber}</dd>
              </div>
              {record.formationDate && (
                <div>
                  <dt className="text-gray-600">Formation Date:</dt>
                  <dd className="font-medium">
                    {new Date(record.formationDate).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Addresses */}
          {(record.additionalInfo?.principalAddress || record.additionalInfo?.mailingAddress) && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">Addresses</h3>
              {record.additionalInfo?.principalAddress && (
                <div className="mb-3">
                  <h4 className="font-medium text-gray-700">Principal Address:</h4>
                  <p className="text-sm">{formatAddress(record.additionalInfo.principalAddress)}</p>
                </div>
              )}
              {record.additionalInfo?.mailingAddress &&
                record.additionalInfo.mailingAddress !==
                  record.additionalInfo?.principalAddress && (
                  <div>
                    <h4 className="font-medium text-gray-700">Mailing Address:</h4>
                    <p className="text-sm">{formatAddress(record.additionalInfo.mailingAddress)}</p>
                  </div>
                )}
            </div>
          )}

          {/* Registered Agent */}
          {record.registeredAgent && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">Registered Agent</h3>
              <p className="font-medium">
                {typeof record.registeredAgent === 'string'
                  ? record.registeredAgent
                  : record.registeredAgent.name}
              </p>
              {typeof record.registeredAgent === 'object' && record.registeredAgent.address && (
                <p className="mt-1 text-sm text-gray-600">
                  {formatAddress(record.registeredAgent.address)}
                </p>
              )}
            </div>
          )}

          {/* Contact Information */}
          {(record.website || record.phoneNumbers?.length || record.owners?.length) && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">Contact Information</h3>
              {record.website && (
                <div className="mb-2">
                  <span className="font-medium text-gray-700">Website:</span>
                  <a
                    href={record.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    {record.website}
                  </a>
                </div>
              )}
              {record.phoneNumbers && record.phoneNumbers.length > 0 && (
                <div className="mb-2">
                  <span className="font-medium text-gray-700">Phone Numbers:</span>
                  <ul className="mt-1 space-y-1">
                    {record.phoneNumbers.map((phone, index) => (
                      <li key={index} className="text-sm">
                        {phone.number} - {phone.type}
                        {phone.verified && <span className="ml-2 text-green-600">(Verified)</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Owners/Key Personnel */}
          {record.owners && record.owners.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">Key Personnel</h3>
              <div className="space-y-3">
                {record.owners.map((owner, index) => (
                  <div key={index} className="rounded border p-3">
                    <div className="font-medium">{owner.fullName}</div>
                    {owner.title && <div className="text-sm text-gray-600">{owner.title}</div>}
                    {owner.contactInfo && (
                      <div className="mt-2 space-y-1 text-sm">
                        {owner.contactInfo.email && <div>Email: {owner.contactInfo.email}</div>}
                        {owner.contactInfo.phone && <div>Phone: {owner.contactInfo.phone}</div>}
                        {owner.contactInfo.linkedIn && (
                          <div>
                            LinkedIn:
                            <a
                              href={owner.contactInfo.linkedIn}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              View Profile
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filing Locations */}
          {record.filingLocation && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">Filing Locations</h3>
              {record.filingLocation.stateFilings &&
                record.filingLocation.stateFilings.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-700">State Filings:</h4>
                    <ul className="mt-1 space-y-1">
                      {record.filingLocation.stateFilings.map((filing, index) => (
                        <li key={index} className="text-sm">
                          {filing.state} - {filing.secretaryOfState} ({filing.status})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              {record.filingLocation.dbaFilings && record.filingLocation.dbaFilings.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700">DBA Filings:</h4>
                  <ul className="mt-1 space-y-1">
                    {record.filingLocation.dbaFilings.map((filing, index) => (
                      <li key={index} className="text-sm">
                        {filing.dbaName} - {filing.county}, {filing.state}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Data Source */}
          <div className="text-sm text-gray-500">
            <span className="font-medium">Data Source:</span> {record.source}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EVABusinessLookupTool;
