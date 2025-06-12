import React from 'react';
import EVAWithTransactionContext from '../components/EVAWithTransactionContext';

const TransactionWorkflowPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">EVA Transaction Workflow</h1>
          <p className="text-gray-600">
            Intelligent underwriting assistant with automated workflow processing
          </p>
        </div>

        {/* Workflow Instructions */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h2 className="mb-2 text-lg font-semibold text-blue-900">
            How the Transaction Workflow Works
          </h2>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
            <div className="rounded border border-blue-100 bg-white p-3">
              <div className="mb-1 font-medium text-blue-800">Step 1: Information Breakdown</div>
              <p className="text-blue-700">
                EVA analyzes all collected transaction data and provides comprehensive summary
              </p>
            </div>
            <div className="rounded border border-blue-100 bg-white p-3">
              <div className="mb-1 font-medium text-blue-800">Step 2: Underwriting Checklist</div>
              <p className="text-blue-700">
                Creates detailed task list with automation assignments and priorities
              </p>
            </div>
            <div className="rounded border border-blue-100 bg-white p-3">
              <div className="mb-1 font-medium text-blue-800">Step 3: Auto Task Execution</div>
              <p className="text-blue-700">
                EVA completes automated tasks using APIs and data analysis tools
              </p>
            </div>
            <div className="rounded border border-blue-100 bg-white p-3">
              <div className="mb-1 font-medium text-blue-800">Step 4: Final Decision</div>
              <p className="text-blue-700">
                Presents approval/decline recommendation with detailed reasoning
              </p>
            </div>
          </div>
        </div>

        {/* Lender Categories Overview */}
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <h2 className="mb-2 text-lg font-semibold text-green-900">
            Auto RAG Lender Categories Available
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4 lg:grid-cols-7">
            <div className="rounded border border-green-100 bg-white p-2 text-center">
              <div className="font-medium text-green-800">General</div>
              <div className="text-green-600">Full-service</div>
            </div>
            <div className="rounded border border-green-100 bg-white p-2 text-center">
              <div className="font-medium text-green-800">Equipment</div>
              <div className="text-green-600">Specialized</div>
            </div>
            <div className="rounded border border-green-100 bg-white p-2 text-center">
              <div className="font-medium text-green-800">Real Estate</div>
              <div className="text-green-600">Commercial</div>
            </div>
            <div className="rounded border border-green-100 bg-white p-2 text-center">
              <div className="font-medium text-green-800">SBA</div>
              <div className="text-green-600">Government</div>
            </div>
            <div className="rounded border border-green-100 bg-white p-2 text-center">
              <div className="font-medium text-green-800">Rapheal</div>
              <div className="text-green-600">Alternative</div>
            </div>
            <div className="rounded border border-green-100 bg-white p-2 text-center">
              <div className="font-medium text-green-800">Chaise</div>
              <div className="text-green-600">Boutique</div>
            </div>
            <div className="rounded border border-green-100 bg-white p-2 text-center">
              <div className="font-medium text-green-800">Austins</div>
              <div className="text-green-600">Regional</div>
            </div>
          </div>
        </div>

        {/* Main Workflow Interface */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <EVAWithTransactionContext className="h-[calc(100vh-24rem)]" />
        </div>

        {/* Usage Instructions */}
        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="mb-2 font-medium text-yellow-800">Getting Started:</h3>
          <ol className="list-inside list-decimal space-y-1 text-sm text-yellow-700">
            <li>Select a customer from the Customer Selector on the left</li>
            <li>
              Choose a transaction from the Transaction Selector (shows customer's transactions)
            </li>
            <li>Watch as EVA automatically generates the 4-step underwriting workflow</li>
            <li>Review workflow progress and interact with EVA for context-aware assistance</li>
            <li>Use the Auto RAG Lender Selection to find matching lenders</li>
            <li>Complete the workflow to get final underwriting decision</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TransactionWorkflowPage;
