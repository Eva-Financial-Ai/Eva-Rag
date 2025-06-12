import React, { useEffect, useState } from 'react';
import smartMatchApi, { SmartMatchResult } from '../../api/smartMatchApi';
import { RiskMapType } from './RiskMapCore';

interface SmartMatchDisplayProps {
  transactionId: string;
  riskMapType: RiskMapType;
}

const SmartMatchDisplay: React.FC<SmartMatchDisplayProps> = ({ transactionId, riskMapType }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState<SmartMatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedLender, setSelectedLender] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const results = await smartMatchApi.fetchResults(transactionId, riskMapType);
        setMatches(results);
        if (results.length > 0 && results[0].lenderId) {
          setSelectedLender(results[0].lenderId);
        }
      } catch (err) {
        console.error('Error fetching smart matches:', err);
        setError('Failed to load lender matches. Please try again.');
      } finally {
        setTimeout(() => setIsLoading(false), 800); // Add slight delay for better UX
      }
    };

    fetchMatches();
  }, [transactionId, riskMapType]);

  // Find the selected lender details
  const selectedLenderDetails = matches.find(match => match.lenderId === selectedLender);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format interest rate
  const formatInterestRate = (rate: number) => {
    return `${rate.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="flex justify-center mt-6">
            <div className="h-10 w-10 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
          </div>
          <div className="text-center text-primary-600 font-medium">
            Loading Smart Match results...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="bg-red-50 p-4 rounded-lg text-red-800 border border-red-200">
          <h3 className="text-lg font-medium mb-2">Error Loading Matches</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 border border-yellow-200">
          <h3 className="text-lg font-medium mb-2">No Matches Found</h3>
          <p>
            We couldn't find any lender matches for this transaction. Please try different
            parameters or contact support.
          </p>
          <button
            className="mt-3 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2 text-primary-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Smart Match Results
        </h2>
        <p className="text-gray-600 mt-1">
          We found {matches.length} lender match{matches.length !== 1 ? 'es' : ''} for your{' '}
          {riskMapType} financing request.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lender Selection */}
        <div className="col-span-1 border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium mb-4 text-gray-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Matched Lenders
          </h3>
          <div className="space-y-3">
            {matches.map(match => (
              <div
                key={match.lenderId}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedLender === match.lenderId
                    ? 'bg-primary-50 border-primary-300'
                    : 'border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => match.lenderId && setSelectedLender(match.lenderId)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{match.lenderName}</span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      match.matchScore >= 90
                        ? 'bg-green-100 text-green-800'
                        : match.matchScore >= 80
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {match.matchScore}% Match
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {formatCurrency(match.loanAmount || 0)} at{' '}
                  {formatInterestRate(match.interestRate || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Lender Details */}
        <div className="col-span-1 lg:col-span-3">
          {selectedLenderDetails && (
            <div className="border rounded-lg p-5 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold">{selectedLenderDetails.lenderName}</h3>
                  <p className="text-gray-500 mt-1">Lender ID: {selectedLenderDetails.lenderId}</p>
                </div>
                <span
                  className={`text-lg px-3 py-1 rounded-md font-medium ${
                    selectedLenderDetails.matchScore >= 90
                      ? 'bg-green-100 text-green-800'
                      : selectedLenderDetails.matchScore >= 80
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {selectedLenderDetails.matchScore}% Match Score
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border shadow-sm">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Loan Amount</h4>
                  <div className="text-2xl font-bold text-gray-800">
                    {formatCurrency(selectedLenderDetails.loanAmount || 0)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border shadow-sm">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Interest Rate</h4>
                  <div className="text-2xl font-bold text-gray-800">
                    {formatInterestRate(selectedLenderDetails.interestRate || 0)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border shadow-sm">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Term</h4>
                  <div className="text-2xl font-bold text-gray-800">
                    {selectedLenderDetails.termMonths} months
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border shadow-sm mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Fees & Costs</h4>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Origination Fee</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(selectedLenderDetails.fees || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-700">Total Financing Costs</span>
                  <span className="font-medium text-gray-800">
                    {formatCurrency(
                      (selectedLenderDetails.loanAmount || 0) *
                        ((selectedLenderDetails.interestRate || 0) / 100) *
                        ((selectedLenderDetails.termMonths || 0) / 12) +
                        (selectedLenderDetails.fees || 0)
                    )}
                  </span>
                </div>
              </div>

              {selectedLenderDetails.notes && (
                <div className="bg-primary-50 rounded-lg p-4 border border-primary-200 mb-6">
                  <h4 className="text-sm font-medium text-primary-800 mb-2">Lender Notes</h4>
                  <p className="text-primary-700 text-sm">{selectedLenderDetails.notes}</p>
                </div>
              )}

              <div className="flex justify-between space-x-4">
                <button className="bg-primary-100 text-primary-700 hover:bg-primary-200 px-4 py-2 rounded-md font-medium transition-colors">
                  Save Match
                </button>
                <button className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md font-medium transition-colors">
                  Contact Lender
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-gray-50 p-4 rounded-lg border shadow-sm">
        <h3 className="text-lg font-medium mb-2 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1 text-primary-600"
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
          Matching Algorithm Explanation
        </h3>
        <p className="text-gray-700 text-sm">
          EVA's Smart Match uses advanced AI algorithms to match your specific financing needs with
          lenders most likely to approve your application with favorable terms. The match score is
          based on lender preferences, historical approval data, and your specific business profile
          including credit history, cash flow metrics, and industry risk assessment.
        </p>
      </div>

      <div className="flex justify-center mt-6">
        <button className="bg-primary-600 text-white hover:bg-primary-700 px-6 py-2 rounded-md font-medium transition-colors">
          Run Another Smart Match Analysis
        </button>
      </div>
    </div>
  );
};

export default SmartMatchDisplay;
