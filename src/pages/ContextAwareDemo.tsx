import React, { useState } from 'react';
import ContextAwareDashboard from '../components/dashboard/ContextAwareDashboard';
import { useTransactionContext } from '../contexts/TransactionContextProvider';
import { useUserType } from '../contexts/UserTypeContext';

const ContextAwareDemo: React.FC = () => {
  const { currentTransaction, currentCustomer } = useTransactionContext();

  const { getUserTypeDisplayName } = useUserType();
  const [selectedModule, setSelectedModule] = useState<string>('deal-structure');

  const modules = [
    {
      id: 'deal-structure',
      name: 'Deal Structure',
      icon: '🏗️',
      description: 'Analyze deal terms and structure',
    },
    {
      id: 'transaction-execution',
      name: 'Transaction Execution',
      icon: '⚡',
      description: 'Execute and monitor workflows',
    },
    { id: 'risk-map', name: 'Risk Map', icon: '⚠️', description: 'Risk assessment and analysis' },
    { id: 'filelock', name: 'Filelock', icon: '🔒', description: 'Document management system' },
    {
      id: 'smart-match',
      name: 'Smart Match',
      icon: '🎯',
      description: 'Intelligent lender matching',
    },
    {
      id: 'transaction-explorer',
      name: 'Transaction Explorer',
      icon: '🔍',
      description: 'Explore and filter transactions',
    },
  ];

  const availableTools: string[] = []; // getAvailableTools();
  const relatedTransactions: any[] = []; // getRelatedTransactions();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mx-auto mb-8 max-w-7xl">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                🧠 Context-Aware Transaction Ecosystem
              </h1>
              <p className="text-gray-600">
                Comprehensive demonstration of the integrated transaction processing system where
                every module is context-aware and EVA AI has access to all features as MCP tools.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Role</div>
              <div className="text-lg font-semibold text-blue-600">{getUserTypeDisplayName()}</div>
            </div>
          </div>

          {/* Context Overview */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center">
                <span className="mr-3 text-2xl">📊</span>
                <div>
                  <div className="text-sm font-medium text-blue-900">Current Transaction</div>
                  <div className="text-blue-700">
                    {currentTransaction ? currentTransaction.borrowerName : 'None selected'}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded border border-green-200 bg-green-50 p-4">
              <div className="flex items-center">
                <span className="mr-3 text-2xl">👤</span>
                <div>
                  <div className="text-sm font-medium text-green-900">Current Customer</div>
                  <div className="text-green-700">
                    {currentCustomer ? currentCustomer.name : 'None selected'}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded border border-purple-200 bg-purple-50 p-4">
              <div className="flex items-center">
                <span className="mr-3 text-2xl">🔧</span>
                <div>
                  <div className="text-sm font-medium text-purple-900">EVA Tools Available</div>
                  <div className="text-purple-700">{availableTools.length} tools</div>
                </div>
              </div>
            </div>

            <div className="rounded border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-center">
                <span className="mr-3 text-2xl">🔗</span>
                <div>
                  <div className="text-sm font-medium text-yellow-900">Related Transactions</div>
                  <div className="text-yellow-700">{relatedTransactions.length} found</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {currentTransaction && (
            <div className="mb-6 rounded border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">Transaction Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                <div>
                  <span className="font-medium text-blue-800">ID:</span>
                  <span className="ml-2 text-blue-700">{currentTransaction.id}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Type:</span>
                  <span className="ml-2 text-blue-700">{currentTransaction.type}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Amount:</span>
                  <span className="ml-2 text-blue-700">
                    ${currentTransaction.amount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Stage:</span>
                  <span className="ml-2 text-blue-700">{currentTransaction.stage}</span>
                </div>
              </div>
            </div>
          )}

          {/* Available EVA Tools */}
          <div className="mb-6">
            <h3 className="mb-3 font-semibold text-gray-900">
              🤖 EVA AI Assistant - Available MCP Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableTools.map(tool => (
                <span
                  key={tool}
                  className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                >
                  🔧 {tool}
                </span>
              ))}
              {availableTools.length === 0 && (
                <span className="text-sm text-gray-500">
                  Select a transaction to enable AI tools
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Module Selection */}
      <div className="mx-auto mb-6 max-w-7xl">
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-4 font-semibold text-gray-900">
            Select Module to Demonstrate Context Awareness
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {modules.map(module => (
              <button
                key={module.id}
                onClick={() => setSelectedModule(module.id)}
                className={`rounded-lg border-2 p-3 transition-all ${
                  selectedModule === module.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="mb-1 text-2xl">{module.icon}</div>
                <div className="text-sm font-medium">{module.name}</div>
                <div className="mt-1 text-xs text-gray-500">{module.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Context-Aware Module Demo */}
      <div className="mx-auto max-w-7xl">
        <ContextAwareDashboard module={selectedModule as any} />
      </div>

      {/* Integration Guide */}
      <div className="mx-auto mt-8 max-w-7xl">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            🚀 How This Context-Aware System Works
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 font-semibold text-blue-900">📊 Transaction Context</h4>
              <p className="text-sm text-blue-700">
                The transaction selector broadcasts context to all modules. When you select a
                transaction, every feature automatically adapts to show relevant data.
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <h4 className="mb-2 font-semibold text-green-900">🤖 EVA AI Integration</h4>
              <p className="text-sm text-green-700">
                EVA AI assistant has access to all modules as MCP tools. It can query transactions,
                analyze risk, find matches, manage documents, and execute workflows.
              </p>
            </div>

            <div className="rounded-lg bg-purple-50 p-4">
              <h4 className="mb-2 font-semibold text-purple-900">🔗 Real-time Updates</h4>
              <p className="text-sm text-purple-700">
                All modules subscribe to context updates. When data changes in one module, related
                modules automatically refresh their displays.
              </p>
            </div>

            <div className="rounded-lg bg-yellow-50 p-4">
              <h4 className="mb-2 font-semibold text-yellow-900">🎯 Smart Filtering</h4>
              <p className="text-sm text-yellow-700">
                Each module filters its data based on the current transaction and customer context,
                showing only relevant information.
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="mb-2 font-semibold text-red-900">🛡️ Permission-Based</h4>
              <p className="text-sm text-red-700">
                All features respect role-based permissions. Users only see actions and data they're
                authorized to access.
              </p>
            </div>

            <div className="rounded-lg bg-indigo-50 p-4">
              <h4 className="mb-2 font-semibold text-indigo-900">⚡ High Performance</h4>
              <p className="text-sm text-indigo-700">
                Context updates use optimized broadcasting and smart caching to ensure fast
                performance even with complex data relationships.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 font-semibold text-gray-900">💡 Usage Instructions</h4>
            <ol className="list-inside list-decimal space-y-1 text-sm text-gray-700">
              <li>Use the transaction selector in the top navigation to choose a transaction</li>
              <li>Watch how all modules automatically update with contextual data</li>
              <li>Open the EVA AI assistant (🧠 button) to see available MCP tools</li>
              <li>
                Ask EVA questions about the current transaction, customer, or any related data
              </li>
              <li>Switch between modules to see how each one presents context-aware information</li>
              <li>Try changing user roles to see how permissions affect available features</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextAwareDemo;
