import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RiskConfigType, useRiskConfig } from '../../contexts/RiskConfigContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import useTransactionStore from '../../hooks/useTransactionStore';
import riskMapService from './RiskMapService';
import ProductionLogger from '../../utils/productionLogger';

type CreditSectionView = 'all' | 'business' | 'owner';
type RiskMapType = 'unsecured' | 'equipment' | 'realestate';

// Add these types for the credit scoring models
type PersonalCreditModel =
  | 'FICO'
  | 'Vantage2'
  | 'Vantage3'
  | 'Vantage4'
  | 'Vantage5'
  | 'Vantage6'
  | 'Vantage8'
  | 'Vantage9';
type BusinessCreditModel =
  | 'PayNetMasterScore'
  | 'EquifaxCommercialOne'
  | 'EquifaxDelinquency'
  | 'EquifaxBusinessFailure'
  | 'ExperianIntelliScore'
  | 'LexisNexisBusinessID';

// Add the type definition at the top
type CategoryType = 'credit' | 'character' | 'capacity' | 'collateral' | 'capital' | 'conditions';

interface RiskMapEvaReportProps {
  transactionId?: string;
  creditSectionView?: CreditSectionView;
  riskMapType?: RiskMapType;
  showDetailedView?: boolean;
}

// Add these near the top with other interfaces
interface Owner {
  id: string;
  name: string;
  title: string;
  creditScore: {
    score: number;
    max: number;
    rating: string;
    lastUpdated: string;
    agency: 'equifax' | 'experian' | 'transunion';
  };
}

// Loading skeleton component
const RiskMapLoadingSkeleton = () => (
  <div className="bg-white shadow rounded-lg overflow-hidden animate-pulse">
    <div className="h-12 bg-gray-200 border-b border-gray-200"></div>
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 w-48 rounded-md"></div>
        <div className="h-6 bg-gray-200 w-24 rounded-full"></div>
      </div>
      <div className="h-16 bg-gray-200 w-full rounded-md"></div>
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="h-6 bg-gray-200 w-36 rounded-md mb-4"></div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 w-32 rounded-md"></div>
              <div className="h-4 bg-gray-200 w-20 rounded-md"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 w-40 rounded-md"></div>
              <div className="h-4 bg-gray-200 w-16 rounded-md"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 w-36 rounded-md"></div>
              <div className="h-4 bg-gray-200 w-24 rounded-md"></div>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="h-6 bg-gray-200 w-40 rounded-md mb-4"></div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 w-32 rounded-md"></div>
              <div className="h-4 bg-gray-200 w-20 rounded-md"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 w-40 rounded-md"></div>
              <div className="h-4 bg-gray-200 w-16 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Category loading skeleton component - smaller for tab-specific loading
const CategoryLoadingSkeleton = () => (
  <div className="animate-pulse mt-4">
    <div className="h-6 bg-gray-200 w-48 rounded-md mb-6"></div>
    <div className="space-y-6">
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="h-6 bg-gray-200 w-36 rounded-md mb-4"></div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 w-32 rounded-md"></div>
            <div className="h-4 bg-gray-200 w-20 rounded-md"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 w-40 rounded-md"></div>
            <div className="h-4 bg-gray-200 w-16 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Error state component
const RiskMapError = ({ message }: { message: string }) => (
  <div className="bg-white shadow rounded-lg p-6 text-center">
    <div className="text-risk-red mb-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 mx-auto"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <p className="text-gray-700">{message}</p>
  </div>
);

// Extract the business credit score gauge into a memoized component
const BusinessCreditGauge = memo(
  ({
    score,
    maxScore,
    rating,
    lastUpdated,
  }: {
    score: number;
    maxScore: number;
    rating: string;
    lastUpdated: string;
  }) => {
    return (
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h5 className="text-sm text-gray-600 mb-2 text-center">Business Credit</h5>

        <div className="flex items-center justify-center mb-2">
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
              {/* Progress circle with gradient */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="url(#businessGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${339.292 * (score / maxScore)}, 339.292`}
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="businessGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">{score}</span>
              <span className="text-xs text-gray-500">/{maxScore}</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {rating}
          </div>
          <p className="mt-1 text-xs text-gray-500">Last updated: {lastUpdated}</p>
        </div>

        <div className="mt-3">
          <div className="text-xs text-gray-600 flex justify-between items-center mb-1">
            <span>Poor</span>
            <span>Fair</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              style={{
                width: `${(score / maxScore) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }
);

// Extract the owner credit score gauge into a memoized component
const OwnerCreditGauge = memo(
  ({
    owner,
    owners,
    selectedOwner,
    setSelectedOwner,
  }: {
    owner: Owner;
    owners: Owner[];
    selectedOwner: string;
    setSelectedOwner: (id: string) => void;
  }) => {
    const ownerScore = owner.creditScore;

    return (
      <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
        <div className="flex justify-between items-center mb-2">
          <h5 className="text-sm text-gray-600">Owner Credit</h5>
          <select
            className="text-xs border-gray-200 rounded-md py-1"
            value={selectedOwner}
            onChange={e => setSelectedOwner(e.target.value)}
          >
            {owners.map(owner => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.title})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-center mb-2">
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
              {/* Progress circle with gradient */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="url(#ownerGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${339.292 * (ownerScore.score / ownerScore.max)}, 339.292`}
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="ownerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">{ownerScore.score}</span>
              <span className="text-xs text-gray-500">/{ownerScore.max}</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {ownerScore.rating}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {owner.name} | Last updated: {ownerScore.lastUpdated}
          </p>
        </div>

        <div className="mt-3">
          <div className="text-xs text-gray-600 flex justify-between items-center mb-1">
            <span>Poor</span>
            <span>Fair</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
              style={{ width: `${(ownerScore.score / ownerScore.max) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }
);

// Extract the credit score history chart into a memoized component
const CreditScoreHistory = memo(() => {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-sm font-medium text-gray-700">Credit Score History</h5>
        <select className="text-xs border-gray-200 rounded-md py-1">
          <option value="6m">Last 6 months</option>
          <option value="1y">Last year</option>
          <option value="2y">Last 2 years</option>
        </select>
      </div>

      <div className="h-40 w-full">
        <div className="w-full h-full flex items-end justify-between px-2">
          {/* Sample chart bars for business score history */}
          <div className="flex flex-col items-center">
            <div className="h-20 w-4 bg-blue-500 rounded-t-sm"></div>
            <div className="mt-1 text-xs text-gray-500">Jan</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-24 w-4 bg-blue-500 rounded-t-sm"></div>
            <div className="mt-1 text-xs text-gray-500">Feb</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-28 w-4 bg-blue-500 rounded-t-sm"></div>
            <div className="mt-1 text-xs text-gray-500">Mar</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-20 w-4 bg-blue-500 rounded-t-sm"></div>
            <div className="mt-1 text-xs text-gray-500">Apr</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-24 w-4 bg-blue-500 rounded-t-sm"></div>
            <div className="mt-1 text-xs text-gray-500">May</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-32 w-4 bg-blue-500 rounded-t-sm"></div>
            <div className="mt-1 text-xs text-gray-500">Jun</div>
          </div>

          {/* Sample overlay bars for personal credit */}
          <div className="flex flex-col items-center absolute left-[calc(16.666%+40px)]">
            <div className="h-20 w-4 bg-purple-500 rounded-t-sm"></div>
          </div>
          <div className="flex flex-col items-center absolute left-[calc(33.333%+48px)]">
            <div className="h-24 w-4 bg-purple-500 rounded-t-sm"></div>
          </div>
          <div className="flex flex-col items-center absolute left-[calc(50%+56px)]">
            <div className="h-20 w-4 bg-purple-500 rounded-t-sm"></div>
          </div>
          <div className="flex flex-col items-center absolute left-[calc(66.666%+64px)]">
            <div className="h-24 w-4 bg-purple-500 rounded-t-sm"></div>
          </div>
          <div className="flex flex-col items-center absolute left-[calc(83.333%+72px)]">
            <div className="h-28 w-4 bg-purple-500 rounded-t-sm"></div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-2">
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
          <span className="text-xs text-gray-600">Business</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-sm mr-1"></div>
          <span className="text-xs text-gray-600">Owner</span>
        </div>
      </div>
    </div>
  );
});

// Extract the business credit score analysis into a memoized component
const BusinessCreditAnalysis = memo(
  ({
    businessScoreDetails,
  }: {
    businessScoreDetails: {
      score: number;
      max: number;
      rating: string;
      description: string;
      lastUpdated: string;
    };
  }) => {
    return (
      <div className="my-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center mb-4">
            <div className="mr-6">
              <div className="relative w-32 h-32 mx-auto md:mx-0">
                {/* Score gauge */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="url(#businessGradient2)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${339.292 * (businessScoreDetails.score / businessScoreDetails.max)}, 339.292`}
                  />

                  <defs>
                    <linearGradient id="businessGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800">
                    {businessScoreDetails.score}
                  </span>
                  <span className="text-xs text-gray-500">/{businessScoreDetails.max}</span>
                </div>
              </div>
              <div className="mt-2 text-center md:text-left">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {businessScoreDetails.rating}
                </span>
              </div>
            </div>

            <div className="flex-grow mt-4 md:mt-0">
              <h4 className="text-lg font-medium text-gray-800 mb-2">Business Credit Analysis</h4>
              <p className="text-sm text-gray-600 mb-3">
                This {businessScoreDetails.score} score indicates a{' '}
                {businessScoreDetails.rating.toLowerCase()} business credit profile, representing
                low risk for lenders. The business demonstrates strong payment history and
                appropriate credit utilization.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-blue-600">98%</div>
                  <div className="text-xs text-gray-500">On-Time Payments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-blue-600">42%</div>
                  <div className="text-xs text-gray-500">Credit Utilization</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-blue-600">6.3</div>
                  <div className="text-xs text-gray-500">Years History</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// Extract the Credit View Tabs into a memoized component
const CreditViewTabs = memo(
  ({
    selectedCreditView,
    setSelectedCreditView,
  }: {
    selectedCreditView: CreditSectionView;
    setSelectedCreditView: (view: CreditSectionView) => void;
  }) => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`w-1/3 py-3 px-1 text-center border-b-2 ${
                selectedCreditView === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent hover:text-gray-700 hover:border-gray-300 text-gray-500'
              } font-medium text-sm transition-colors duration-200`}
              onClick={() => setSelectedCreditView('all')}
            >
              <span className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
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
                All Reports
              </span>
            </button>
            <button
              className={`w-1/3 py-3 px-1 text-center border-b-2 ${
                selectedCreditView === 'business'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent hover:text-gray-700 hover:border-gray-300 text-gray-500'
              } font-medium text-sm transition-colors duration-200`}
              onClick={() => setSelectedCreditView('business')}
            >
              <span className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
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
                Business Credit
              </span>
            </button>
            <button
              className={`w-1/3 py-3 px-1 text-center border-b-2 ${
                selectedCreditView === 'owner'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent hover:text-gray-700 hover:border-gray-300 text-gray-500'
              } font-medium text-sm transition-colors duration-200`}
              onClick={() => setSelectedCreditView('owner')}
            >
              <span className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Owner Credit
              </span>
            </button>
          </nav>
        </div>
      </div>
    );
  }
);

// Extract the Owner Credit Report Section into a memoized component
const OwnerCreditReport = memo(
  ({
    selectedCreditView,
    selectedCreditAgency,
    setSelectedCreditAgency,
    showHistoricalReports,
    setShowHistoricalReports,
  }: {
    selectedCreditView: CreditSectionView;
    selectedCreditAgency: 'all' | 'equifax' | 'experian' | 'transunion';
    setSelectedCreditAgency: (agency: 'all' | 'equifax' | 'experian' | 'transunion') => void;
    showHistoricalReports: boolean;
    setShowHistoricalReports: (show: boolean) => void;
  }) => {
    return (
      <div
        className={`bg-white p-4 rounded-lg border ${selectedCreditView === 'owner' ? 'border-purple-300 shadow-md' : 'border-gray-200'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-gray-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Owner Credit Report
          </h4>

          {/* Credit agency selector */}
          <div className="flex items-center space-x-3">
            <div>
              <select
                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={selectedCreditAgency}
                onChange={e => setSelectedCreditAgency(e.target.value as any)}
              >
                <option value="all">Tri-Merged</option>
                <option value="equifax">Equifax</option>
                <option value="experian">Experian</option>
                <option value="transunion">TransUnion</option>
              </select>
            </div>

            <button
              onClick={() => setShowHistoricalReports(!showHistoricalReports)}
              className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {showHistoricalReports ? 'Hide History' : 'View History'}
            </button>

            <button
              onClick={() => window.open('/documents?folder=credit-reports', '_blank')}
              className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              Open in Filelock
            </button>
          </div>
        </div>

        {/* Historical reports section */}
        {showHistoricalReports && (
          <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h5 className="font-medium text-gray-700 mb-3">Historical Credit Reports</h5>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
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
                  {/* Table content would go here */}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export const RiskMapEvaReport: React.FC<RiskMapEvaReportProps> = ({
  transactionId,
  creditSectionView,
  riskMapType = 'unsecured',
  showDetailedView = false,
}) => {
  const {
    currentTransaction,
    loading,
    error: storeError,
    fetchTransactions,
  } = useTransactionStore();
  const { currentTransaction: workflowTransaction } = useWorkflow();
  const { configType, loadConfigForType } = useRiskConfig();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('credit');
  const [selectedCreditView, setSelectedCreditView] = useState<CreditSectionView>('all');
  const [selectedRiskMapType, setSelectedRiskMapType] = useState<RiskMapType>(riskMapType);
  const [selectedCreditAgency, setSelectedCreditAgency] = useState<
    'all' | 'equifax' | 'experian' | 'transunion'
  >('all');
  const [showHistoricalReports, setShowHistoricalReports] = useState(false);
  const [selectedHistoricalReport, setSelectedHistoricalReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasRiskReport, setHasRiskReport] = useState(false);
  const [checkingReport, setCheckingReport] = useState(false);

  // Ref to store timeouts for each category
  const categoryTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  const [categoriesLoading, setCategoriesLoading] = useState<Record<string, boolean>>({
    credit: false,
    capacity: false,
    character: false,
    collateral: false,
    capital: false,
    conditions: false,
  });
  const [loadedCategories, setLoadedCategories] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [personalCreditModel, setPersonalCreditModel] = useState<PersonalCreditModel>('FICO');
  const [businessCreditModel, setBusinessCreditModel] =
    useState<BusinessCreditModel>('PayNetMasterScore');
  const [showKYBModal, setShowKYBModal] = useState(false);
  const [kybVerificationStatus, setKybVerificationStatus] = useState<
    'pending' | 'verified' | 'unverified' | null
  >(null);
  const [maxLoadingTime] = useState(5000); // 5 seconds maximum loading time
  const [owners, setOwners] = useState<Owner[]>([
    {
      id: 'owner-1',
      name: 'John Smith',
      title: 'CEO',
      creditScore: {
        score: 755,
        max: 850,
        rating: 'Very Good',
        lastUpdated: '2023-08-15',
        agency: 'equifax',
      },
    },
    {
      id: 'owner-2',
      name: 'Sarah Johnson',
      title: 'CFO',
      creditScore: {
        score: 792,
        max: 850,
        rating: 'Excellent',
        lastUpdated: '2023-07-22',
        agency: 'transunion',
      },
    },
    {
      id: 'owner-3',
      name: 'Michael Chang',
      title: 'CTO',
      creditScore: {
        score: 735,
        max: 850,
        rating: 'Good',
        lastUpdated: '2023-08-05',
        agency: 'experian',
      },
    },
  ]);
  const [selectedOwner, setSelectedOwner] = useState<string>('owner-1');

  // Wrap mock data in useMemo to prevent unnecessary re-renders
  const creditScores = useMemo(
    () => ({
      equifax: {
        score: 765,
        max: 850,
        rating: 'Excellent',
        lastUpdated: '2023-08-15',
      },
      experian: {
        score: 742,
        max: 850,
        rating: 'Good',
        lastUpdated: '2023-08-12',
      },
      transunion: {
        score: 758,
        max: 850,
        rating: 'Very Good',
        lastUpdated: '2023-08-10',
      },
    }),
    []
  );

  // Wrap historical reports in useMemo to prevent unnecessary re-renders
  const historicalReports = useMemo(
    () => [
      {
        id: 'report-2023-08',
        date: '2023-08-15',
        type: 'Tri-Merged',
        scores: { equifax: 765, experian: 742, transunion: 758 },
        fileUrl: '/reports/credit-2023-08.pdf',
      },
      {
        id: 'report-2023-05',
        date: '2023-05-22',
        type: 'Tri-Merged',
        scores: { equifax: 745, experian: 738, transunion: 752 },
        fileUrl: '/reports/credit-2023-05.pdf',
      },
      {
        id: 'report-2023-02',
        date: '2023-02-10',
        type: 'Tri-Merged',
        scores: { equifax: 722, experian: 715, transunion: 730 },
        fileUrl: '/reports/credit-2023-02.pdf',
      },
      {
        id: 'report-2022-11',
        date: '2022-11-18',
        type: 'Tri-Merged',
        scores: { equifax: 695, experian: 702, transunion: 710 },
        fileUrl: '/reports/credit-2022-11.pdf',
      },
    ],
    []
  );

  // Effect to update selectedCreditView when creditSectionView prop changes
  useEffect(() => {
    if (creditSectionView) {
      setSelectedCreditView(creditSectionView);
    }
  }, [creditSectionView]);

  // Effect to ensure we start with credit category selected and load it
  useEffect(() => {
    setSelectedCategory('credit');
    // We'll load the credit category when transaction is ready
  }, []);

  // Categories for the risk map report - memoized to avoid re-renders
  const categories = React.useMemo(
    () => [
      { id: 'credit', name: 'Credit Worthiness' },
      { id: 'capacity', name: 'Capacity Analysis' },
      { id: 'character', name: 'Character Assessment' },
      { id: 'collateral', name: 'Collateral Evaluation' },
      { id: 'capital', name: 'Capital Structure' },
      { id: 'conditions', name: 'Market Conditions' },
    ],
    []
  );

  // Function to load data for a specific category - declared before it's used in useEffect
  const loadCategoryData = useCallback(
    (category: string) => {
      // If this category is already loaded or currently loading, don't reload it
      if (loadedCategories.has(category) || categoriesLoading[category]) {
        ProductionLogger.debug(`Category ${category} already loaded or loading, skipping`, 'RiskMapEvaReport');
        return;
      }

      ProductionLogger.debug(`Initiating load for category ${category}`, 'RiskMapEvaReport');

      // Set loading state for this specific category
      setCategoriesLoading(prev => ({
        ...prev,
        [category]: true,
      }));

      // Clear any existing timeout for this category to prevent conflicts
      if (categoryTimeoutsRef.current[category]) {
        clearTimeout(categoryTimeoutsRef.current[category]);
      }

      // Simulate an API call with a slight delay
      categoryTimeoutsRef.current[category] = setTimeout(() => {
        ProductionLogger.debug(`Mock API call finished for category ${category}`, 'RiskMapEvaReport');
        // Mark this category as loaded
        setLoadedCategories(prev => new Set(Array.from(prev).concat([category])));

        // Clear loading state for this category
        setCategoriesLoading(prev => ({
          ...prev,
          [category]: false,
        }));

        delete categoryTimeoutsRef.current[category]; // Clean up the stored timeout ID
        ProductionLogger.debug(`Finished loading data for category ${category}`, 'RiskMapEvaReport');
      }, 600);
    },
    [categoriesLoading, loadedCategories]
  );

  // Add a timeout to prevent infinite loading for the initial transaction fetch
  useEffect(() => {
    let initialLoadTimeoutId: NodeJS.Timeout | null = null;

    if (isLoading) {
      // This isLoading is for the initial transaction fetch
      initialLoadTimeoutId = setTimeout(() => {
        ProductionLogger.warn('Initial transaction loading timeout reached', 'RiskMapEvaReport');
        // Ensure we only set error if still loading and no transaction/error yet
        if (
          useTransactionStore.getState().loading &&
          !useTransactionStore.getState().currentTransaction &&
          !error
        ) {
          setError(
            'Loading transaction data timed out. Please check your connection or try again.'
          );
        }
        setIsLoading(false); // Stop global loading indicator
      }, maxLoadingTime);
    }

    return () => {
      if (initialLoadTimeoutId) clearTimeout(initialLoadTimeoutId);
    };
  }, [isLoading, maxLoadingTime, error]);

  // Effect to initialize data and handle loading state - optimized
  useEffect(() => {
    const loadData = async () => {
      try {
        // Only set loading if really needed
        if (!currentTransaction && loading) {
          ProductionLogger.debug(
            'Setting isLoading to true - waiting for transaction from store',
            'RiskMapEvaReport'
          );
          setIsLoading(true);
        } else if (currentTransaction && isLoading) {
          // If transaction arrived while we were in isLoading state
          setIsLoading(false);
        }

        setError(null);

        // If we still don't have a transaction, try to fetch one
        if (!currentTransaction && !loading) {
          ProductionLogger.debug('No current transaction, fetching transactions...', 'RiskMapEvaReport');
          setIsLoading(true);
          await fetchTransactions();

          // Log what we got after fetching
          ProductionLogger.debug(
            'Fetched transactions, current transaction:',
            'RiskMapEvaReport',
            useTransactionStore.getState().currentTransaction
          );
        }

        // After fetching, if we still don't have a transaction, show appropriate message
        if (!currentTransaction && !loading) {
          ProductionLogger.warn('No transaction data available after fetch', 'RiskMapEvaReport');

          // Check if there are any transactions in risk_assessment stage
          const allTransactions = useTransactionStore.getState().transactions;
          const riskTransaction = allTransactions.find(t => t.currentStage === 'risk_assessment');

          if (riskTransaction) {
            ProductionLogger.debug(
              'Found a risk_assessment transaction, setting as current:',
              'RiskMapEvaReport',
              riskTransaction.id
            );
            useTransactionStore.getState().setCurrentTransaction(riskTransaction);
          } else {
            ProductionLogger.error('No transactions in risk_assessment stage', 'RiskMapEvaReport');
            setError('No transaction found in the risk assessment stage. Please create one first.');
          }
        }

        if (currentTransaction) {
          ProductionLogger.debug(
            'Current transaction loaded successfully:',
            'RiskMapEvaReport',
            currentTransaction.id
          );
          ProductionLogger.debug('Risk profile data:', 'RiskMapEvaReport', currentTransaction.riskProfile);
          // Automatically load the 'credit' category data once transaction is available
          if (!loadedCategories.has('credit') && !categoriesLoading.credit) {
            loadCategoryData('credit');
          }
        }

        // If loading from store is finished and we still don't have a transaction,
        // and we are not already in an error state from timeout
        if (!loading && !currentTransaction && !error) {
          setIsLoading(false); // Ensure component loading is false if store loading finishes
        }
      } catch (err) {
        ProductionLogger.error('Error loading risk map data:', 'RiskMapEvaReport', err);
        setError('Failed to load risk map data. Please try again.');
        setIsLoading(false);
      }
    };

    loadData();
  }, [
    currentTransaction,
    loading,
    fetchTransactions,
    error,
    loadedCategories,
    categoriesLoading,
    loadCategoryData,
    isLoading,
  ]);

  // Add handling for store errors
  useEffect(() => {
    if (storeError) {
      setError(`Transaction store error: ${storeError.message}`);
      setIsLoading(false);
    }
  }, [storeError]);

  // Handle category selection with lazy loading
  const handleCategorySelect = useCallback(
    (category: string) => {
      ProductionLogger.debug(`Selecting category: ${category}`, 'RiskMapEvaReport');
      setSelectedCategory(category as CategoryType);

      // Load data for this category if it hasn't been loaded yet and isn't already loading
      if (!loadedCategories.has(category) && !categoriesLoading[category]) {
        loadCategoryData(category);
      }
    },
    [loadCategoryData, loadedCategories, categoriesLoading]
  );

  // Cleanup timeouts on component unmount
  useEffect(() => {
    const currentTimeouts = { ...categoryTimeoutsRef.current };

    return () => {
      ProductionLogger.debug('Unmounting, clearing all category timeouts.', 'RiskMapEvaReport');
      Object.values(currentTimeouts).forEach(clearTimeout);
    };
  }, []);

  // Direct reference to credit section handling for easier access
  const showCreditSection = selectedCategory === 'credit';

  // Display loading skeleton when appropriate - used to show a skeleton UI while data is loading
  const renderLoadingSkeleton = useCallback(() => {
    return (
      <div>
        <RiskMapLoadingSkeleton />
        {checkingReport && (
          <div className="text-center mt-4 text-gray-600">Checking for existing risk report...</div>
        )}
      </div>
    );
  }, []);

  // Add historical report selection handling - implemented to allow users to select historical reports
  const handleSelectHistoricalReport = useCallback(
    (reportId: string) => {
      setSelectedHistoricalReport(reportId);
      // Load the historical report data
      const report = historicalReports.find(r => r.id === reportId);
      if (report) {
        ProductionLogger.debug(`Loading historical report from ${report.date}`, 'RiskMapEvaReport');
        // You would typically fetch the report data here
      }
    },
    [historicalReports]
  );

  // Add personal credit model selection - implemented to allow users to switch credit models
  const handlePersonalCreditModelChange = useCallback((model: PersonalCreditModel) => {
    setPersonalCreditModel(model);
    ProductionLogger.debug(`Switched to personal credit model: ${formatModelName(model)}`, 'RiskMapEvaReport');
  }, []);

  // Get the score based on selected credit model
  const getPersonalCreditScore = (model: PersonalCreditModel) => {
    // In a real application, this would fetch based on the model selected
    switch (model) {
      case 'FICO':
        return {
          score: 755,
          max: 850,
          rating: 'Very Good',
          description: 'This score ranks highly among other consumers.',
          lastUpdated: '2023-08-15',
        };
      case 'Vantage3':
        return {
          score: 782,
          max: 850,
          rating: 'Excellent',
          description: 'This is among the top 20% of consumers.',
          lastUpdated: '2023-08-12',
        };
      default:
        return {
          score: 755,
          max: 850,
          rating: 'Very Good',
          description: 'This score ranks highly among other consumers.',
          lastUpdated: '2023-08-15',
        };
    }
  };

  // Get the score based on selected business credit model
  const getBusinessCreditScore = (model: BusinessCreditModel) => {
    // In a real application, this would fetch based on the model selected
    switch (model) {
      case 'PayNetMasterScore':
        return {
          score: 82,
          max: 100,
          rating: 'Low Risk',
          description: 'This business score indicates a low risk of delinquency or default.',
          lastUpdated: '2023-08-10',
        };
      case 'ExperianIntelliScore':
        return {
          score: 92,
          max: 100,
          rating: 'Very Low Risk',
          description: 'This score indicates minimal risk.',
          lastUpdated: '2023-08-05',
        };
      default:
        return {
          score: 82,
          max: 100,
          rating: 'Low Risk',
          description: 'This business score indicates a low risk of delinquency or default.',
          lastUpdated: '2023-08-10',
        };
    }
  };

  // KYB Request handler with implementation
  const handleKYBRequest = () => {
    setShowKYBModal(true);
    ProductionLogger.debug('Opening KYB verification modal', 'RiskMapEvaReport');
    // In a real app, you would prepare the KYB verification process here
  };

  // KYB Verification handler with implementation
  const verifyKYBOnChain = () => {
    // In a real application, this would verify the data on a private blockchain
    ProductionLogger.debug('Verifying business data on blockchain...', 'RiskMapEvaReport');
    setKybVerificationStatus('verified');
    setShowKYBModal(false);
  };

  // Format the model name for display with usage example
  const formatModelName = (model: string) => {
    if (model.startsWith('Vantage')) {
      return `VantageScore ${model.replace('Vantage', '')}`;
    }

    switch (model) {
      case 'PayNetMasterScore':
        return 'PayNet MasterScore';
      case 'EquifaxCommercialOne':
        return 'Equifax Commercial One';
      case 'EquifaxDelinquency':
        return 'Equifax Delinquency Score';
      case 'EquifaxBusinessFailure':
        return 'Equifax Business Failure';
      case 'ExperianIntelliScore':
        return 'Experian IntelliScore';
      case 'LexisNexisBusinessID':
        return 'LexisNexis Business InstantID';
      default:
        return model;
    }
  };

  // Get the current credit score details with implementation for personal score
  const personalScoreDetails = getPersonalCreditScore(personalCreditModel);
  const businessScoreDetails = getBusinessCreditScore(businessCreditModel);

  // Add ability to update owners data - implemented to allow adding new business owners
  const addNewOwner = useCallback((newOwner: Owner) => {
    setOwners(prevOwners => [...prevOwners, newOwner]);
  }, []);

  // Update risk map type based on the risk map type - optimize to only load for current type
  useEffect(() => {
    if (riskMapType) {
      ProductionLogger.debug(`Setting risk map type to: ${riskMapType}`, 'RiskMapEvaReport');
      setSelectedRiskMapType(riskMapType);

      // Reset loaded categories when risk map type changes to ensure fresh data
      setLoadedCategories(new Set());
      setCategoriesLoading({
        credit: false,
        capacity: false,
        character: false,
        collateral: false,
        capital: false,
        conditions: false,
      });
    }
  }, [riskMapType]);

  // Update risk config type based on the risk map type - optimize to only load for current type
  useEffect(() => {
    // Map the riskMapType to a RiskConfigType
    let newConfigType: RiskConfigType = 'general';

    if (riskMapType === 'equipment') {
      newConfigType = 'equipment_vehicles';
    } else if (riskMapType === 'realestate') {
      newConfigType = 'real_estate';
    }

    // Only load the config if it's different and we don't have it loaded already
    if (newConfigType !== configType) {
      ProductionLogger.debug(`Loading risk config for type: ${newConfigType}`, 'RiskMapEvaReport');
      loadConfigForType(newConfigType);
    } else {
      ProductionLogger.debug(`Using existing risk config for type: ${newConfigType}`, 'RiskMapEvaReport');
    }
  }, [riskMapType, configType, loadConfigForType]);

  // Function to display historical report data in the credit section
  const renderHistoricalReportData = useCallback(() => {
    if (!selectedHistoricalReport) return null;

    const report = historicalReports.find(r => r.id === selectedHistoricalReport);
    if (!report) return null;

    return (
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Historical Data: {report.date}</h4>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(report.scores).map(([agency, score]) => (
            <div key={agency} className="text-center">
              <div className="text-lg font-semibold">{score}</div>
              <div className="text-xs text-gray-500">{agency}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [selectedHistoricalReport, historicalReports]);

  // Add component for displaying credit score comparisons
  const renderCreditScoreComparison = useCallback(() => {
    // Use creditScores data to show comparison
    return (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Credit Bureau Comparison</h4>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(creditScores).map(([agency, data]) => (
            <div key={agency} className="text-center p-2 bg-white rounded-md shadow-sm">
              <div className="text-lg font-semibold">{data.score}</div>
              <div className="text-xs text-gray-500 capitalize">{agency}</div>
              <div className="text-xs mt-1">{data.rating}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [creditScores]);

  // Add function to update owner information - implemented to allow modifying business owner data
  const updateOwnerInfo = useCallback((ownerId: string, updates: Partial<Owner>) => {
    setOwners(prevOwners =>
      prevOwners.map(owner => (owner.id === ownerId ? { ...owner, ...updates } : owner))
    );
  }, []);

  // Add KYB modal component with useCallback and moved verifyKYBOnChain inside
  const renderKYBModal = useCallback(() => {
    if (!showKYBModal) return null;

    // Move verifyKYBOnChain inside the callback to prevent it from changing on every render
    const verifyKYBOnChainInternal = () => {
      // In a real application, this would verify the data on a private blockchain
      ProductionLogger.debug('Verifying business data on blockchain...', 'RiskMapEvaReport');
      setKybVerificationStatus('verified');
      setShowKYBModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Business Verification</h3>
          <p className="text-sm text-gray-600 mb-6">
            Verify business entity data on the blockchain for enhanced trust and security.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowKYBModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={verifyKYBOnChainInternal}
              className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700"
            >
              Verify Business
            </button>
          </div>
        </div>
      </div>
    );
  }, [showKYBModal, setKybVerificationStatus, setShowKYBModal]);

  // Modified render for the credit section to include risk map type-specific content
  const renderCreditSection = () => {
    if (selectedCategory !== 'credit') return null;

    // Use showCreditSection for better readability
    if (showCreditSection) {
      return (
        <div className="space-y-6">
          {/* Risk Type Specific Header */}
          {selectedRiskMapType === 'unsecured' && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <h4 className="font-medium text-blue-800 mb-2">Unsecured Commercial Paper Report</h4>
              <p className="text-sm text-blue-600">
                This report analyzes creditworthiness for unsecured commercial paper and general
                credit applications.
              </p>
            </div>
          )}

          {selectedRiskMapType === 'equipment' && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
              <h4 className="font-medium text-green-800 mb-2">Commercial Equipment Report</h4>
              <p className="text-sm text-green-600">
                This report evaluates risk factors for equipment, vehicles, machines, and technology
                assets.
              </p>
            </div>
          )}

          {selectedRiskMapType === 'realestate' && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
              <h4 className="font-medium text-amber-800 mb-2">Commercial Real Estate Report</h4>
              <p className="text-sm text-amber-600">
                This report assesses real estate valuation, market conditions, and property-specific
                risk factors.
              </p>
            </div>
          )}

          {/* Credit Score Summary - Enhanced Version */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-800 text-center">Credit Score Summary</h4>
              <button
                onClick={handleKYBRequest}
                className="text-xs bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium py-1 px-2 rounded-md flex items-center"
              >
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Verify Business
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Credit Score - Enhanced Gauge */}
              <BusinessCreditGauge
                score={businessScoreDetails.score}
                maxScore={businessScoreDetails.max}
                rating={businessScoreDetails.rating}
                lastUpdated={businessScoreDetails.lastUpdated}
              />

              {/* Owner Credit Score - Enhanced Gauge with Owner Selector */}
              {(() => {
                const owner = owners.find(o => o.id === selectedOwner) || owners[0];
                return (
                  <OwnerCreditGauge
                    owner={owner}
                    owners={owners}
                    selectedOwner={selectedOwner}
                    setSelectedOwner={setSelectedOwner}
                  />
                );
              })()}
            </div>

            {/* Credit score comparison panel */}
            {renderCreditScoreComparison()}

            {/* Selected historical report data */}
            {selectedHistoricalReport && renderHistoricalReportData()}

            {/* Score Timeline Chart */}
            <CreditScoreHistory />
          </div>

          {/* Personal credit score visualization */}
          <div className="my-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center mb-4">
                <div className="mr-6">
                  <div className="relative w-32 h-32 mx-auto md:mx-0">
                    {/* Score gauge */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="url(#personalGradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${339.292 * (personalScoreDetails.score / personalScoreDetails.max)}, 339.292`}
                      />

                      <defs>
                        <linearGradient id="personalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-gray-800">
                        {personalScoreDetails.score}
                      </span>
                      <span className="text-xs text-gray-500">/{personalScoreDetails.max}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-center md:text-left">
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {personalScoreDetails.rating}
                    </span>
                  </div>
                </div>

                <div className="flex-grow mt-4 md:mt-0">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-medium text-gray-800">Personal Credit Analysis</h4>
                    <select
                      className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      value={personalCreditModel}
                      onChange={e =>
                        handlePersonalCreditModelChange(e.target.value as PersonalCreditModel)
                      }
                    >
                      <option value="FICO">FICO Score</option>
                      <option value="Vantage3">VantageScore 3.0</option>
                      <option value="Vantage4">VantageScore 4.0</option>
                    </select>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {personalScoreDetails.description} This {formatModelName(personalCreditModel)}{' '}
                    indicates a {personalScoreDetails.rating.toLowerCase()} personal credit profile.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-purple-600">97%</div>
                      <div className="text-xs text-gray-500">Payment History</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-purple-600">18%</div>
                      <div className="text-xs text-gray-500">Credit Utilization</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-purple-600">12.4</div>
                      <div className="text-xs text-gray-500">Years History</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business credit score visualization */}
          <BusinessCreditAnalysis businessScoreDetails={businessScoreDetails} />

          {/* Credit View Tabs */}
          <CreditViewTabs
            selectedCreditView={selectedCreditView}
            setSelectedCreditView={setSelectedCreditView}
          />

          {/* Business Credit Report Section */}
          {(selectedCreditView === 'all' || selectedCreditView === 'business') && (
            <div
              className={`bg-white p-4 rounded-lg border ${selectedCreditView === 'business' ? 'border-primary-300 shadow-md' : 'border-gray-200'}`}
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-primary-500"
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
                  Business Credit Report
                </h4>

                {/* Model selector for business credit */}
                <div>
                  <select
                    className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={businessCreditModel}
                    onChange={e => setBusinessCreditModel(e.target.value as BusinessCreditModel)}
                  >
                    <option value="dun">Dun & Bradstreet</option>
                    <option value="experian">Experian Business</option>
                    <option value="equifax">Equifax Business</option>
                  </select>
                </div>
              </div>

              {/* Business credit score visualization */}
              <BusinessCreditAnalysis businessScoreDetails={businessScoreDetails} />
            </div>
          )}

          {/* Owner Credit Report Section */}
          {(selectedCreditView === 'all' || selectedCreditView === 'owner') && (
            <OwnerCreditReport
              selectedCreditView={selectedCreditView}
              selectedCreditAgency={selectedCreditAgency}
              setSelectedCreditAgency={setSelectedCreditAgency}
              showHistoricalReports={showHistoricalReports}
              setShowHistoricalReports={setShowHistoricalReports}
            />
          )}
        </div>
      );
    }

    return null;
  };

  // Add the renderContent function definition
  const renderContent = () => {
    if (isLoading || loading) {
      return <CategoryLoadingSkeleton />;
    }

    if (error) {
      return <RiskMapError message={error} />;
    }

    switch (selectedCategory) {
      case 'credit':
        return renderCreditSection();
      default:
        return (
          <div className="py-12 text-center text-gray-500">
            <p>Data for this category is coming soon.</p>
          </div>
        );
    }
  };

  // Use the workflow transaction if available, otherwise use the store transaction
  const activeTransaction = workflowTransaction || currentTransaction;

  // Check if the current transaction has a risk report
  useEffect(() => {
    if (activeTransaction?.id) {
      setCheckingReport(true);
      // Check if a report exists for this transaction
      const reportExists = riskMapService.isReportPurchased(
        activeTransaction.id,
        selectedRiskMapType
      );
      setHasRiskReport(reportExists);
      setCheckingReport(false);

      // If no report exists, show the paywall
      if (!reportExists && !isLoading) {
        setShowPaywall(true);
      }
    }
  }, [activeTransaction?.id, selectedRiskMapType, isLoading]);

  // Handle successful payment/credit use
  const handlePaywallSuccess = useCallback(() => {
    if (activeTransaction?.id) {
      // Purchase the report
      const success = riskMapService.purchaseReport(activeTransaction.id, selectedRiskMapType);
      if (success) {
        setHasRiskReport(true);
        setShowPaywall(false);
        // Reload the risk data
        loadCategoryData('credit');
      }
    }
  }, [activeTransaction?.id, selectedRiskMapType, loadCategoryData]);

  // Update risk map type based on transaction type
  useEffect(() => {
    if (activeTransaction?.type) {
      // Map transaction type to risk map type
      let newRiskMapType: RiskMapType = 'unsecured';

      if (
        activeTransaction.type.toLowerCase().includes('equipment') ||
        activeTransaction.type.toLowerCase().includes('vehicle')
      ) {
        newRiskMapType = 'equipment';
      } else if (
        activeTransaction.type.toLowerCase().includes('real estate') ||
        activeTransaction.type.toLowerCase().includes('property')
      ) {
        newRiskMapType = 'realestate';
      }

      if (newRiskMapType !== selectedRiskMapType) {
        setSelectedRiskMapType(newRiskMapType);
        // Reset loaded categories when risk map type changes
        setLoadedCategories(new Set());
        setCategoriesLoading({
          credit: false,
          capacity: false,
          character: false,
          collateral: false,
          capital: false,
          conditions: false,
        });
      }
    }
  }, [activeTransaction?.type, selectedRiskMapType]);

  return (
    <div className="risk-map-eva-report">
      {/* Enhanced header for detailed view */}
      {showDetailedView && (
        <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-200">
          <h2 className="text-2xl font-semibold text-indigo-900 mb-3">
            📊 Comprehensive EVA Risk Assessment Report - MVP v6.0 2025
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded border border-indigo-100">
              <h4 className="text-sm font-medium text-indigo-800">Analysis Type</h4>
              <p className="text-lg font-semibold text-indigo-600">
                {selectedRiskMapType.charAt(0).toUpperCase() + selectedRiskMapType.slice(1)}
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-indigo-100">
              <h4 className="text-sm font-medium text-indigo-800">Credit Section View</h4>
              <p className="text-lg font-semibold text-indigo-600">{creditSectionView}</p>
            </div>
            <div className="bg-white p-3 rounded border border-indigo-100">
              <h4 className="text-sm font-medium text-indigo-800">Data Sources</h4>
              <p className="text-sm text-indigo-600">
                Plaid • Accounting Software • Financial Statements • Credit Agencies
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-indigo-100">
              <h4 className="text-sm font-medium text-indigo-800">Report Generated</h4>
              <p className="text-sm text-indigo-600">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* EVA Risk Score and Report Model Summary */}
      <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          🎯 EVA Risk Score & Report Model
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">Overall Grade</h4>
            <div className="flex items-center mt-2">
              <span className="text-3xl font-bold text-blue-600">A</span>
              <span className="ml-2 text-sm text-gray-600">Grade A</span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">Total Score</h4>
            <div className="flex items-center mt-2">
              <span className="text-3xl font-bold text-green-600">87</span>
              <span className="ml-2 text-sm text-gray-600">/ 100</span>
        </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">Customization</h4>
            <div className="mt-2">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                Custom Weighted
              </span>
              <p className="text-xs text-gray-500 mt-1">By lender-001</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">Negative Factors</h4>
            <div className="mt-2 space-y-1">
              <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                Recent inquiry
              </span>
              <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                Cash flow variance
              </span>
            </div>
          </div>
        </div>

        {/* Component Scores */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">85</div>
            <div className="text-sm text-gray-600">Credit Worthiness</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">89</div>
            <div className="text-sm text-gray-600">Financial Ratios</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">88</div>
            <div className="text-sm text-gray-600">Cash Flow</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">92</div>
            <div className="text-sm text-gray-600">Compliance</div>
          </div>
          <div className="text-center">
            {selectedRiskMapType === 'unsecured' ? (
              <>
                <div className="text-2xl font-bold text-green-600">79</div>
                <div className="text-sm text-gray-600">Collateral</div>
              </>
            ) : selectedRiskMapType === 'equipment' ? (
              <>
                <div className="text-2xl font-bold text-green-600">84</div>
                <div className="text-sm text-gray-600">Equipment</div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">81</div>
                <div className="text-sm text-gray-600">Property</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Credit Worthiness Variables with Agency Toggle */}
      {showDetailedView && (
        <>
          <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              💳 Credit Worthiness Analysis
              <span
                title="Comprehensive analysis of personal and business credit across major reporting agencies"
                className="ml-2 text-sm text-gray-400 cursor-help"
              >
                ⓘ
              </span>
            </h3>

            {/* Agency Toggle */}
            <div className="mb-6">
              <div className="flex space-x-4">
                {['equifax', 'transunion', 'experian'].map(agency => (
                <button
                    key={agency}
                    onClick={() => setSelectedCreditAgency(agency as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      selectedCreditAgency === agency
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {agency.charAt(0).toUpperCase() + agency.slice(1)}
                </button>
              ))}
              </div>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">
                  FICO Score ({selectedCreditAgency})
                  <span
                    title="Fair Isaac Corporation credit score - industry standard for creditworthiness (300-850 range)"
                    className="ml-1 text-sm text-blue-600 cursor-help"
                  >
                    ⓘ
                  </span>
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Score:</span>
                    <span className="font-semibold text-blue-900">720</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Model:</span>
                    <span className="font-semibold text-blue-900">FICO 8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">
                      Grade:
                      <span
                        title="FICO score ranges: 800-850 Exceptional, 740-799 Very Good, 670-739 Good, 580-669 Fair, 300-579 Poor"
                        className="ml-1 text-blue-600 cursor-help"
                      >
                        ⓘ
                      </span>
                    </span>
                    <span className="font-semibold text-green-700">Good</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">
                  Payment History
                  <span
                    title="Track record of on-time payments - most important factor in credit scoring (35% of FICO score)"
                    className="ml-1 text-sm text-green-600 cursor-help"
                  >
                    ⓘ
                  </span>
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Overall:</span>
                    <span className="font-semibold text-green-900">Excellent</span>
        </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">
                      Late Payments:
                      <span
                        title="Number of payments made 30+ days late in the past 24 months"
                        className="ml-1 text-green-600 cursor-help"
                      >
                        ⓘ
                      </span>
                    </span>
                    <span className="font-semibold text-green-900">0</span>
            </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">
                      Delinquencies:
                      <span
                        title="Accounts currently past due or in collection status"
                        className="ml-1 text-green-600 cursor-help"
                      >
                        ⓘ
                      </span>
                    </span>
                    <span className="font-semibold text-green-900">None</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-3">
                  Credit Utilization
                  <span
                    title="Percentage of available credit being used - lower is better (under 30% recommended)"
                    className="ml-1 text-sm text-purple-600 cursor-help"
                  >
                    ⓘ
                  </span>
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700">Overall:</span>
                    <span className="font-semibold text-purple-900">18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700">Available Credit:</span>
                    <span className="font-semibold text-purple-900">$85,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700">Used Credit:</span>
                    <span className="font-semibold text-purple-900">$15,300</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Statements and Ratios */}
          <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              📈 Financial Statements & Ratios
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Plaid • Accounting Software • Financial Statements)
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Liquidity Ratios */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-900 mb-3">Liquidity Ratios</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-indigo-700">Current Ratio:</span>
                    <span className="font-semibold text-indigo-900">2.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-indigo-700">Quick Ratio:</span>
                    <span className="font-semibold text-indigo-900">1.4</span>
                  </div>
                  <div className="text-xs text-indigo-600 mt-2">
                    Formula: Current Assets / Current Liabilities
                  </div>
                </div>
              </div>

              {/* Profitability Ratios */}
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h4 className="font-medium text-emerald-900 mb-3">Profitability</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-emerald-700">Gross Margin:</span>
                    <span className="font-semibold text-emerald-900">42%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-emerald-700">Net Margin:</span>
                    <span className="font-semibold text-emerald-900">8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-emerald-700">ROA:</span>
                    <span className="font-semibold text-emerald-900">12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-emerald-700">ROE:</span>
                    <span className="font-semibold text-emerald-900">18%</span>
                  </div>
                </div>
              </div>

              {/* Leverage & Coverage */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-3">Leverage & Coverage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700">Debt/Equity:</span>
                    <span className="font-semibold text-purple-900">0.65</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700">Interest Coverage:</span>
                    <span className="font-semibold text-purple-900">5.2x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700">EBITDA:</span>
                    <span className="font-semibold text-purple-900">$285k</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Cash Flow Analysis */}
          <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              💰 Business Cash Flow Analysis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cash Flow Metrics */}
              <div className="bg-cyan-50 p-4 rounded-lg">
                <h4 className="font-medium text-cyan-900 mb-3">Cash Flow Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-cyan-700">Operating CF:</span>
                    <span className="font-semibold text-green-600">$320k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-cyan-700">Free CF:</span>
                    <span className="font-semibold text-green-600">$180k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-cyan-700">CF Growth:</span>
                    <span className="font-semibold text-green-600">+15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-cyan-700">CF Coverage:</span>
                    <span className="font-semibold text-cyan-900">2.8x</span>
                  </div>
                </div>
              </div>

              {/* Working Capital */}
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-3">Working Capital</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-amber-700">Working Capital:</span>
                    <span className="font-semibold text-amber-900">$450k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-amber-700">Cash Conversion:</span>
                    <span className="font-semibold text-amber-900">45 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-amber-700">CF Volatility:</span>
                    <span className="font-semibold text-amber-900">12%</span>
                  </div>
                </div>
              </div>

              {/* Days Analysis */}
              <div className="bg-rose-50 p-4 rounded-lg">
                <h4 className="font-medium text-rose-900 mb-3">Days Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-rose-700">Days A/R:</span>
                    <span className="font-semibold text-rose-900">42 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-rose-700">Days Payable:</span>
                    <span className="font-semibold text-rose-900">28 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-rose-700">Days Inventory:</span>
                    <span className="font-semibold text-rose-900">31 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Credit Scores Section */}
          <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🏢 Business Credit Scores</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* D&B Paydex */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">D&B Paydex Score</h4>
                <div className="text-3xl font-bold text-blue-600 mb-2">85</div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>• Payment Promptness</div>
                  <div>• Credit Risk Assessment</div>
                  <div>• Financial Stress Indicators</div>
                  <div>• Payment History Trends</div>
                </div>
              </div>

              {/* PayNet MasterScore */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">PayNet MasterScore</h4>
                <div className="text-3xl font-bold text-green-600 mb-2">785</div>
                <div className="text-xs text-green-700 space-y-1">
                  <div>• Payment Performance</div>
                  <div>• Credit Utilization</div>
                  <div>• Debt Management</div>
                  <div>• Payment Trends</div>
                </div>
              </div>

              {/* Business Intel Score */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-900 mb-2">Business Intel Score</h4>
                <div className="text-3xl font-bold text-indigo-600 mb-2">82</div>
                <div className="text-xs text-indigo-700 space-y-1">
                  <div>• Payment History</div>
                  <div>• Credit Usage Patterns</div>
                  <div>• Financial Stability</div>
                  <div>• Industry Risk Factors</div>
                </div>
              </div>

              {/* Equifax One Score */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Equifax One Score</h4>
                <div className="text-3xl font-bold text-purple-600 mb-2">78</div>
                <div className="text-xs text-purple-700 space-y-1">
                  <div>• Credit History Length</div>
                  <div>• Payment Behavior</div>
                  <div>• Credit Mix Diversity</div>
                  <div>• Recent Activity</div>
                </div>
              </div>

              {/* LexisNexis Score */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">LexisNexis Score</h4>
                <div className="text-3xl font-bold text-orange-600 mb-2">76</div>
                <div className="text-xs text-orange-700 space-y-1">
                  <div>• Legal Risk Assessment</div>
                  <div>• Financial Stability</div>
                  <div>• Compliance History</div>
                  <div>• Industry Standing</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal and Regulatory Compliance */}
          <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ⚖️ Legal & Regulatory Compliance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">Compliance Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">History:</span>
                    <span className="font-semibold text-green-900">Excellent</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Legal Type:</span>
                    <span className="font-semibold text-green-900">LLC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Disputes:</span>
                    <span className="font-semibold text-green-900">None</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">Regulatory</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Licenses:</span>
                    <span className="font-semibold text-blue-900">Met</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Industry Regs:</span>
                    <span className="font-semibold text-blue-900">Compliant</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Audits:</span>
                    <span className="font-semibold text-blue-900">No Issues</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment/Property Specific Sections (conditional) */}
          {selectedRiskMapType === 'equipment' && (
            <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🚛 Equipment Value & Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h4 className="font-medium text-emerald-900 mb-3">Equipment Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-emerald-700">Type Demand:</span>
                      <span className="font-semibold text-emerald-900">High</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-emerald-700">Age:</span>
                      <span className="font-semibold text-emerald-900">2.5 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-emerald-700">Utilization:</span>
                      <span className="font-semibold text-emerald-900">85%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-3">Valuation</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-amber-700">Residual Value:</span>
                      <span className="font-semibold text-amber-900">68%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-amber-700">Depreciation:</span>
                      <span className="font-semibold text-amber-900">15%/yr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-amber-700">Replacement:</span>
                      <span className="font-semibold text-amber-900">$850k</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-3">Maintenance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-red-700">Annual Costs:</span>
                      <span className="font-semibold text-red-900">$45k</span>
                    </div>
                    <div className="text-xs text-red-700 mt-2">
                      Based on equipment age and utilization rates
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedRiskMapType === 'realestate' && (
            <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🏢 Property Financial Health
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">Property Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">LTV Ratio:</span>
                      <span className="font-semibold text-blue-900">75%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Property Grade:</span>
                      <span className="font-semibold text-blue-900">A</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Rate Type:</span>
                      <span className="font-semibold text-blue-900">Fixed</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-3">Coverage & Liens</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Debt Service:</span>
                      <span className="font-semibold text-green-900">1.35x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Property Liens:</span>
                      <span className="font-semibold text-green-900">None</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-700">Avg Lease:</span>
                      <span className="font-semibold text-green-900">36 months</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collateral Evaluation Section for Unsecured/General Loans */}
          {selectedRiskMapType === 'unsecured' && (
            <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🔒 Collateral & Security Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-medium text-indigo-900 mb-3">Security Structure</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-indigo-700">Loan Structure:</span>
                      <span className="font-semibold text-indigo-900">Unsecured</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-indigo-700">Personal Guarantee:</span>
                      <span className="font-semibold text-indigo-900">Yes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-indigo-700">UCC Filings:</span>
                      <span className="font-semibold text-indigo-900">2 Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-indigo-700">Corporate Guarantee:</span>
                      <span className="font-semibold text-indigo-900">Yes</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-3">Collateral Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-orange-700">Business Assets:</span>
                      <span className="font-semibold text-orange-900">$420k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-orange-700">Liquid Assets:</span>
                      <span className="font-semibold text-orange-900">$185k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-orange-700">Accounts Receivable:</span>
                      <span className="font-semibold text-orange-900">$95k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-orange-700">Inventory Value:</span>
                      <span className="font-semibold text-orange-900">$140k</span>
                    </div>
                  </div>
                </div>

                <div className="bg-teal-50 p-4 rounded-lg">
                  <h4 className="font-medium text-teal-900 mb-3">Risk Mitigation</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-teal-700">Insurance Coverage:</span>
                      <span className="font-semibold text-teal-900">Adequate</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-teal-700">Credit Enhancement:</span>
                      <span className="font-semibold text-teal-900">SBA 7(a)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-teal-700">Monitoring Freq:</span>
                      <span className="font-semibold text-teal-900">Monthly</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-teal-700">Covenant Count:</span>
                      <span className="font-semibold text-teal-900">4 Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collateral Quality Assessment */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Collateral Quality Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">79%</div>
                    <div className="text-xs text-gray-600">Overall Quality</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">85%</div>
                    <div className="text-xs text-gray-600">Liquidity Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-600">72%</div>
                    <div className="text-xs text-gray-600">Recovery Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">88%</div>
                    <div className="text-xs text-gray-600">Documentation</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Score Customization (Lender Preferences) */}
          <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ⚙️ Risk Score Customization & Lender Weights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-3">Weight Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-700">Credit Worthiness:</span>
                    <span className="font-semibold text-slate-900">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-700">Financial Ratios:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedRiskMapType === 'unsecured'
                        ? '25%'
                        : selectedRiskMapType === 'equipment'
                          ? '30%'
                          : '25%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-700">Cash Flow:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedRiskMapType === 'unsecured'
                        ? '25%'
                        : selectedRiskMapType === 'equipment'
                          ? '25%'
                          : '20%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-700">Compliance:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedRiskMapType === 'unsecured' ? '15%' : '10%'}
                    </span>
                  </div>
                  {selectedRiskMapType === 'unsecured' && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-700">Collateral:</span>
                      <span className="font-semibold text-slate-900">10%</span>
                    </div>
                  )}
                  {selectedRiskMapType === 'equipment' && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-700">Equipment:</span>
                      <span className="font-semibold text-slate-900">10%</span>
                    </div>
                  )}
                  {selectedRiskMapType === 'realestate' && (
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-700">Property:</span>
                      <span className="font-semibold text-slate-900">25%</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-900 mb-3">Lender Configuration</h4>
                <div className="space-y-2">
                  <div className="text-sm text-indigo-700">
                    <strong>Custom Weighted:</strong>{' '}
                    {selectedRiskMapType === 'unsecured' ? 'No' : 'Yes'}
                  </div>
                  <div className="text-sm text-indigo-700">
                    <strong>Configured By:</strong>{' '}
                    {selectedRiskMapType === 'unsecured' ? 'Default' : 'lender-001'}
                  </div>
                  <div className="text-sm text-indigo-700">
                    <strong>Instrument Type:</strong>{' '}
                    {selectedRiskMapType === 'unsecured'
                      ? 'Unsecured Business Loan'
                      : selectedRiskMapType === 'equipment'
                        ? 'Equipment Financing'
                        : 'Commercial Real Estate'}
                  </div>
                  <div className="text-sm text-indigo-700">
                    <strong>Special Specs:</strong>{' '}
                    {selectedRiskMapType === 'unsecured'
                      ? 'Working Capital'
                      : selectedRiskMapType === 'equipment'
                        ? 'Manufacturing Equipment'
                        : 'Commercial Property'}
                  </div>
                </div>
              </div>

              {/* Risk Profile Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Risk Profile Summary</h4>
                <div className="space-y-2">
                  <div className="text-sm text-gray-700">
                    <strong>Primary Focus:</strong>{' '}
                    {selectedRiskMapType === 'unsecured'
                      ? 'Credit Quality & Cash Flow'
                      : selectedRiskMapType === 'equipment'
                        ? 'Asset Value & Utilization'
                        : 'Property Value & Income'}
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>Risk Mitigation:</strong>{' '}
                    {selectedRiskMapType === 'unsecured'
                      ? 'Personal Guarantees'
                      : selectedRiskMapType === 'equipment'
                        ? 'Asset Collateralization'
                        : 'Property Collateral'}
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>Monitoring Level:</strong>{' '}
                    {selectedRiskMapType === 'unsecured'
                      ? 'Enhanced'
                      : selectedRiskMapType === 'equipment'
                        ? 'Standard'
                        : 'Property-Based'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources & Methodology */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Data Sources & Methodology
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Financial Data</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Plaid API Integration</li>
                  <li>• QuickBooks/Xero</li>
                  <li>• Stripe Transactions</li>
                  <li>• Tax Returns</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Credit Agencies</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Equifax (FICO 8)</li>
                  <li>• TransUnion (FICO 8)</li>
                  <li>• Experian (FICO 8)</li>
                  <li>• Public Records</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Business Credit</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Dun & Bradstreet</li>
                  <li>• PayNet MasterScore</li>
                  <li>• Equifax Business</li>
                  <li>• LexisNexis</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Compliance</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Background Checks</li>
                  <li>• Legal Databases</li>
                  <li>• Regulatory Filings</li>
                  <li>• Industry Records</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Enhanced content from original report */}
      {!showDetailedView && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Standard Risk Assessment View
          </h3>
          <p className="text-gray-600">
            Use the detailed view toggle above to see the comprehensive EVA Risk Assessment Report.
          </p>
        </div>
      )}
    </div>
  );
};

// Export as memo to prevent unnecessary re-renders
const MemoizedRiskMapEvaReport = memo(RiskMapEvaReport);

// Export default with a named value
export default MemoizedRiskMapEvaReport;
