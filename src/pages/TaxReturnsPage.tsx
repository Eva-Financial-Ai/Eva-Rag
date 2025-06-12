import React, { useState } from 'react';
import BusinessTaxReturns from '../components/credit/BusinessTaxReturns';

// Mock transaction data - in a real application this would come from context or props
const mockTransactionData = {
  transactionAmount: 750000,
  financialInstrument: 'sba_loan',
  entityType: 'llc',
  ownerData: [
    {
      id: 'owner-1',
      name: 'John Smith',
      ownershipPercentage: 65,
      type: 'individual' as const,
    },
    {
      id: 'owner-2',
      name: 'Jane Doe',
      ownershipPercentage: 35,
      type: 'individual' as const,
    },
  ],
};

// Sample transaction options for testing different scenarios
const transactionScenarios = [
  {
    name: 'Small Equipment Loan',
    data: {
      transactionAmount: 75000,
      financialInstrument: 'equipment_finance',
      entityType: 'sole_proprietorship',
      ownerData: [
        {
          id: 'owner-1',
          name: 'Small Business Owner',
          ownershipPercentage: 100,
          type: 'individual' as const,
        },
      ],
    },
  },
  {
    name: 'Medium SBA Loan',
    data: {
      transactionAmount: 500000,
      financialInstrument: 'sba_loan',
      entityType: 's_corp',
      ownerData: [
        {
          id: 'owner-1',
          name: 'CEO John Smith',
          ownershipPercentage: 75,
          type: 'individual' as const,
        },
        {
          id: 'owner-2',
          name: 'COO Jane Doe',
          ownershipPercentage: 25,
          type: 'individual' as const,
        },
      ],
    },
  },
  {
    name: 'Large Commercial Real Estate',
    data: {
      transactionAmount: 2000000,
      financialInstrument: 'commercial_real_estate',
      entityType: 'llc',
      ownerData: [
        {
          id: 'owner-1',
          name: 'Real Estate Group LLC',
          ownershipPercentage: 60,
          type: 'business' as const,
        },
        {
          id: 'owner-2',
          name: 'Investment Partner',
          ownershipPercentage: 40,
          type: 'individual' as const,
        },
      ],
    },
  },
  {
    name: 'Working Capital Line',
    data: {
      transactionAmount: 250000,
      financialInstrument: 'working_capital',
      entityType: 'c_corp',
      ownerData: [
        {
          id: 'owner-1',
          name: 'Manufacturing Corp',
          ownershipPercentage: 100,
          type: 'business' as const,
        },
      ],
    },
  },
];

const TaxReturnsPage: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [taxDocuments, setTaxDocuments] = useState<any[]>([]);
  const [applicationProgress, setApplicationProgress] = useState({
    creditApplication: { completed: true, status: 'Completed' },
    financialStatements: { completed: false, status: 'Not Started' },
    taxReturns: { completed: false, status: 'In Progress' },
    requiredDocuments: { completed: false, status: 'Not Started' },
  });

  const currentScenario = transactionScenarios[selectedScenario];

  const handleTaxDocumentsChange = (documents: any[]) => {
    setTaxDocuments(documents);

    // Update progress based on document completeness
    const hasBusinessTax = documents.some(doc => doc.type === 'business');
    const hasPersonalTax = documents.some(doc => doc.type === 'personal');

    // Simple progress calculation
    const progress = documents.length > 0 ? Math.min(documents.length * 25, 100) : 0;

    setApplicationProgress(prev => ({
      ...prev,
      taxReturns: {
        completed: progress >= 75,
        status: progress >= 75 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started',
      },
    }));
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600';
      case 'In Progress':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return '✓';
      case 'In Progress':
        return '●';
      default:
        return '○';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Tax Returns</h1>
          <p className="text-gray-600 mt-1">
            Complete your credit application to get started with the lending process
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Stepper */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            {/* Credit Application */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-medium text-sm mr-3">
                {getProgressIcon(applicationProgress.creditApplication.status)}
              </div>
              <div>
                <div className="font-medium text-gray-900">Credit Application</div>
                <div
                  className={`text-sm ${getProgressColor(applicationProgress.creditApplication.status)}`}
                >
                  {applicationProgress.creditApplication.status}
                </div>
              </div>
            </div>

            <div className="flex-1 h-px bg-gray-300 mx-4"></div>

            {/* Financial Statements */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-medium text-sm mr-3">
                {getProgressIcon(applicationProgress.financialStatements.status)}
              </div>
              <div>
                <div className="font-medium text-gray-900">Financial Statements</div>
                <div
                  className={`text-sm ${getProgressColor(applicationProgress.financialStatements.status)}`}
                >
                  {applicationProgress.financialStatements.status}
                </div>
              </div>
            </div>

            <div className="flex-1 h-px bg-gray-300 mx-4"></div>

            {/* Tax Returns */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-medium text-sm mr-3">
                {getProgressIcon(applicationProgress.taxReturns.status)}
              </div>
              <div>
                <div className="font-medium text-gray-900">Tax Returns</div>
                <div
                  className={`text-sm ${getProgressColor(applicationProgress.taxReturns.status)}`}
                >
                  {applicationProgress.taxReturns.status}
                </div>
              </div>
            </div>

            <div className="flex-1 h-px bg-gray-300 mx-4"></div>

            {/* Required Documents */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-medium text-sm mr-3">
                {getProgressIcon(applicationProgress.requiredDocuments.status)}
              </div>
              <div>
                <div className="font-medium text-gray-900">Required Documents</div>
                <div
                  className={`text-sm ${getProgressColor(applicationProgress.requiredDocuments.status)}`}
                >
                  {applicationProgress.requiredDocuments.status}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Selector for Testing */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Test Different Scenarios</h3>
          <p className="text-sm text-gray-600 mb-4">
            Select different transaction scenarios to see how tax requirements change dynamically:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {transactionScenarios.map((scenario, index) => (
              <button
                key={index}
                onClick={() => setSelectedScenario(index)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedScenario === index
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <div className="font-medium text-sm">{scenario.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  ${scenario.data.transactionAmount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {scenario.data.financialInstrument.replace(/_/g, ' ')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Scenario Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h4 className="text-blue-800 font-medium mb-2">
            Current Scenario: {currentScenario.name}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Amount:</span>
              <span className="text-blue-800 ml-2">
                ${currentScenario.data.transactionAmount.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Instrument:</span>
              <span className="text-blue-800 ml-2">
                {currentScenario.data.financialInstrument
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Entity:</span>
              <span className="text-blue-800 ml-2">
                {currentScenario.data.entityType
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Business Tax Returns Component */}
        <BusinessTaxReturns
          transactionAmount={currentScenario.data.transactionAmount}
          financialInstrument={currentScenario.data.financialInstrument}
          entityType={currentScenario.data.entityType}
          ownerData={currentScenario.data.ownerData}
          onTaxDocumentsChange={handleTaxDocumentsChange}
        />

        {/* Document Summary */}
        {taxDocuments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Document Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{taxDocuments.length}</div>
                <div className="text-sm text-blue-800">Total Documents</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {taxDocuments.filter(doc => doc.type === 'business').length}
                </div>
                <div className="text-sm text-green-800">Business Tax Returns</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {taxDocuments.filter(doc => doc.type === 'personal').length}
                </div>
                <div className="text-sm text-purple-800">Personal Tax Returns</div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 mr-3">
                1
              </div>
              <span className="text-gray-700">Complete tax document uploads or IRS connection</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 mr-3">
                2
              </div>
              <span className="text-gray-700">Review and submit financial statements</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 mr-3">
                3
              </div>
              <span className="text-gray-700">Upload any additional required documents</span>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              disabled={taxDocuments.length === 0}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Financial Statements
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxReturnsPage;
