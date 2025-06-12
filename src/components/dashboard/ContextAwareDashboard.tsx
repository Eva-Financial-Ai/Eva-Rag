import React, { useEffect, useState } from 'react';
import { useTransactionContext } from '../../contexts/TransactionContextProvider';
import { useUserType } from '../../contexts/UserTypeContext';

interface ContextAwareDashboardProps {
  module:
    | 'deal-structure'
    | 'transaction-execution'
    | 'risk-map'
    | 'filelock'
    | 'smart-match'
    | 'transaction-explorer';
}

const ContextAwareDashboard: React.FC<ContextAwareDashboardProps> = ({ module }) => {
  const { currentTransaction, currentCustomer } =
    useTransactionContext();

  const { getUserTypeDisplayName } = useUserType();
  const [moduleContext, setModuleContext] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Get context for specific module
  useEffect(() => {
    let context;
    switch (module) {
      case 'deal-structure':
        context = {
          transaction: currentTransaction,
          dealStructure: currentTransaction?.dealStructure,
          smartMatches: currentTransaction?.smartMatches,
          stage: currentTransaction?.stage,
          customer: currentCustomer,
        };
        break;
      case 'transaction-execution':
        context = {
          transaction: currentTransaction,
          executionData: currentTransaction?.executionData,
          documents: currentTransaction?.documents,
          complianceStatus: currentTransaction?.complianceStatus,
        };
        break;
      case 'risk-map':
        context = {
          transaction: currentTransaction,
          customer: currentCustomer,
          riskProfile: currentTransaction?.riskProfile,
          relatedRisks: [], // This would require more logic to get related transactions
        };
        break;
      case 'filelock':
        context = {
          transaction: currentTransaction,
          documents: currentTransaction?.documents || [],
          relatedDocuments: [], // This would require more logic
        };
        break;
      case 'smart-match':
        context = {
          transaction: currentTransaction,
          dealStructure: currentTransaction?.dealStructure,
          currentMatches: currentTransaction?.smartMatches || [],
          customer: currentCustomer,
        };
        break;
      case 'transaction-explorer':
        context = {
          allTransactions: [], // This would require access to all transactions
          currentFilter: null,
          relatedTransactions: [],
        };
        break;
      default:
        context = null;
    }
    setModuleContext(context);
  }, [module, currentTransaction, currentCustomer]);

  // Subscribe to context updates - This is now simplified as the component re-renders on context change
  useEffect(() => {
    if (currentTransaction || currentCustomer) {
      setLastUpdate(new Date().toLocaleTimeString());
    }
  }, [currentTransaction, currentCustomer]);

  const getModuleIcon = () => {
    switch (module) {
      case 'deal-structure':
        return '🏗️';
      case 'transaction-execution':
        return '⚡';
      case 'risk-map':
        return '⚠️';
      case 'filelock':
        return '🔒';
      case 'smart-match':
        return '🎯';
      case 'transaction-explorer':
        return '🔍';
      default:
        return '📊';
    }
  };

  const getModuleName = () => {
    return module
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!moduleContext) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="text-center text-gray-500">
          <div className="mb-2 text-4xl">{getModuleIcon()}</div>
          <h3 className="mb-2 text-lg font-semibold">{getModuleName()}</h3>
          <p>No transaction context available</p>
          <p className="mt-2 text-sm">Select a transaction to see contextual data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      {/* Module Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-3 text-2xl">{getModuleIcon()}</span>
            <div>
              <h3 className="text-lg font-semibold">{getModuleName()}</h3>
              <p className="text-sm opacity-90">Context-Aware Module</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <div>Role: {getUserTypeDisplayName()}</div>
            {lastUpdate && (
              <div className="text-xs opacity-75">Last update: {lastUpdate.split(' ')[0]}</div>
            )}
          </div>
        </div>
      </div>

      {/* Context Information */}
      <div className="border-b bg-gray-50 p-4">
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div>
            <span className="font-medium text-gray-700">📊 Transaction:</span>
            <span className="ml-2 text-gray-900">
              {currentTransaction
                ? `${currentTransaction.borrowerName} - ${currentTransaction.type}`
                : 'None selected'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">👤 Customer:</span>
            <span className="ml-2 text-gray-900">
              {currentCustomer
                ? `${currentCustomer.name} (${currentCustomer.type})`
                : 'None selected'}
            </span>
          </div>
        </div>
      </div>

      {/* Module-Specific Content */}
      <div className="p-6">
        {module === 'deal-structure' && moduleContext && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Deal Structure Analysis</h4>
            {moduleContext.dealStructure ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded bg-blue-50 p-3">
                  <div className="text-sm font-medium text-blue-900">Loan Type</div>
                  <div className="text-lg text-blue-700">
                    {moduleContext.dealStructure.loanType}
                  </div>
                </div>
                <div className="rounded bg-green-50 p-3">
                  <div className="text-sm font-medium text-green-900">Term</div>
                  <div className="text-lg text-green-700">
                    {moduleContext.dealStructure.term} months
                  </div>
                </div>
                <div className="rounded bg-purple-50 p-3">
                  <div className="text-sm font-medium text-purple-900">Rate</div>
                  <div className="text-lg text-purple-700">{moduleContext.dealStructure.rate}%</div>
                </div>
                <div className="rounded bg-yellow-50 p-3">
                  <div className="text-sm font-medium text-yellow-900">Stage</div>
                  <div className="text-lg text-yellow-700">{moduleContext.stage}</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No deal structure data available</p>
            )}

            {moduleContext.smartMatches && moduleContext.smartMatches.length > 0 && (
              <div>
                <h5 className="mb-2 font-medium">Smart Matches</h5>
                <div className="space-y-2">
                  {moduleContext.smartMatches.map((match: any, index: number) => (
                    <div key={index} className="flex justify-between rounded bg-gray-50 p-2">
                      <span>{match.name}</span>
                      <span className="font-medium text-green-600">{match.score}% match</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {module === 'transaction-execution' && moduleContext && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Transaction Execution Status</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">Compliance Status</span>
                  <span
                    className={`rounded px-2 py-1 text-sm ${
                      moduleContext.complianceStatus === 'compliant'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {moduleContext.complianceStatus}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Documents: {moduleContext.documents?.length || 0} items
                </div>
              </div>
            </div>
          </div>
        )}

        {module === 'risk-map' && moduleContext && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Risk Assessment</h4>
            {moduleContext.riskProfile ? (
              <div>
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">Risk Score</span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        moduleContext.riskProfile.score === 'Low'
                          ? 'bg-green-100 text-green-800'
                          : moduleContext.riskProfile.score === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {moduleContext.riskProfile.score}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h5 className="mb-2 font-medium text-red-700">Risk Factors</h5>
                    <ul className="space-y-1 text-sm">
                      {moduleContext.riskProfile.factors?.map((factor: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <span className="bg-red-400 mr-2 h-2 w-2 rounded-full"></span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="mb-2 font-medium text-green-700">Mitigations</h5>
                    <ul className="space-y-1 text-sm">
                      {moduleContext.riskProfile.mitigations?.map(
                        (mitigation: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <span className="mr-2 h-2 w-2 rounded-full bg-green-400"></span>
                            {mitigation}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No risk data available</p>
            )}
          </div>
        )}

        {module === 'filelock' && moduleContext && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Document Management</h4>
            <div className="space-y-2">
              {moduleContext.documents && moduleContext.documents.length > 0 ? (
                moduleContext.documents.map((doc: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded bg-gray-50 p-3"
                  >
                    <div>
                      <div className="font-medium">{doc.name}</div>
                      <div className="text-sm text-gray-500">ID: {doc.id}</div>
                    </div>
                    <span
                      className={`rounded px-2 py-1 text-sm ${
                        doc.status === 'received'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No documents found</p>
              )}

              {moduleContext.relatedDocuments && moduleContext.relatedDocuments.length > 0 && (
                <div className="mt-4">
                  <h5 className="mb-2 font-medium">Related Documents</h5>
                  <div className="text-sm text-gray-600">
                    {moduleContext.relatedDocuments.length} documents from related transactions
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {module === 'smart-match' && moduleContext && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Smart Matching Engine</h4>
            {moduleContext.currentMatches && moduleContext.currentMatches.length > 0 ? (
              <div className="space-y-3">
                {moduleContext.currentMatches.map((match: any, index: number) => (
                  <div
                    key={index}
                    className="rounded border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-blue-900">{match.name}</div>
                        <div className="text-sm text-blue-700">Lender ID: {match.lenderId}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-800">{match.score}%</div>
                        <div className="text-xs text-blue-600">Match Score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No matches available</p>
            )}
          </div>
        )}

        {module === 'transaction-explorer' && moduleContext && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Transaction Explorer</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded bg-blue-50 p-3 text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {moduleContext.allTransactions?.length || 0}
                </div>
                <div className="text-sm text-blue-600">Total Transactions</div>
              </div>
              <div className="rounded bg-green-50 p-3 text-center">
                <div className="text-2xl font-bold text-green-700">
                  {moduleContext.relatedTransactions?.length || 0}
                </div>
                <div className="text-sm text-green-600">Related Transactions</div>
              </div>
              <div className="rounded bg-purple-50 p-3 text-center">
                <div className="text-2xl font-bold text-purple-700">
                  {moduleContext.currentFilter ? 'Filtered' : 'All'}
                </div>
                <div className="text-sm text-purple-600">View Mode</div>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Display */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h5 className="mb-2 font-medium text-gray-700">Available Actions</h5>
          <div className="flex flex-wrap gap-2">
            {moduleContext.permissions &&
              Object.entries(moduleContext.permissions).map(([key, value]) => (
                <span
                  key={key}
                  className={`rounded px-2 py-1 text-xs ${
                    value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {key
                    .replace('can', '')
                    .replace(/([A-Z])/g, ' $1')
                    .trim()}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextAwareDashboard;
