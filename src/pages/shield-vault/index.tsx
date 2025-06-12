import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkflow } from '../../contexts/WorkflowContext';
import ShieldVaultDashboard from '../../components/document/ShieldVaultDashboard';
import TopNavigation from '../../components/layout/TopNavigation';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  DocumentTextIcon,
  DocumentMagnifyingGlassIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  PlusIcon,
  ChartBarIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

// Document types that can be stored in Shield Vault
interface DocumentType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const ShieldVaultPage: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  // const { currentTransaction } = useWorkflow();

  // State for the selected vault view
  const [activeView, setActiveView] = useState<'dashboard' | 'documents' | 'requests'>('dashboard');

  // Mock document types
  const documentTypes: DocumentType[] = [
    {
      id: 'financial',
      name: 'Financial Documents',
      icon: <DocumentTextIcon className="w-6 h-6" />,
      description: 'Tax returns, financial statements, bank statements',
    },
    {
      id: 'legal',
      name: 'Legal Documents',
      icon: <DocumentTextIcon className="w-6 h-6" />,
      description: 'Contracts, agreements, legal filings',
    },
    {
      id: 'identity',
      name: 'Identity Documents',
      icon: <DocumentTextIcon className="w-6 h-6" />,
      description: 'ID verification, licenses, certificates',
    },
    {
      id: 'business',
      name: 'Business Documents',
      icon: <DocumentTextIcon className="w-6 h-6" />,
      description: 'Business licenses, articles of incorporation',
    },
  ];

  return (
    <div className="pl-20 sm:pl-72 w-full">
      <div className="container mx-auto px-2 py-6 max-w-full">
        <TopNavigation title="Shield Vault" />

        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Shield Vault</h1>
                <p className="text-gray-600">
                  Secure blockchain-verified storage for sensitive documents
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center transition-colors duration-150"
                onClick={() => window.location.reload()}
              >
                <ArrowPathIcon className="w-4 h-4 mr-1.5" />
                Refresh
              </button>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center transition-colors duration-150">
                <PlusIcon className="w-5 h-5 mr-1.5" />
                Add Document
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`mr-6 py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                  activeView === 'dashboard'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShieldCheckIcon
                  className={`-ml-0.5 mr-2 h-5 w-5 ${
                    activeView === 'dashboard' ? 'text-primary-500' : 'text-gray-400'
                  }`}
                />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveView('documents')}
                className={`mr-6 py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                  activeView === 'documents'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DocumentTextIcon
                  className={`-ml-0.5 mr-2 h-5 w-5 ${
                    activeView === 'documents' ? 'text-primary-500' : 'text-gray-400'
                  }`}
                />
                <span>My Documents</span>
              </button>

              <button
                onClick={() => setActiveView('requests')}
                className={`mr-6 py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                  activeView === 'requests'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DocumentMagnifyingGlassIcon
                  className={`-ml-0.5 mr-2 h-5 w-5 ${
                    activeView === 'requests' ? 'text-primary-500' : 'text-gray-400'
                  }`}
                />
                <span>Document Requests</span>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  1
                </span>
              </button>
            </nav>
          </div>

          {/* Content based on selected view */}
          {activeView === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Shield Vault Dashboard (existing component) */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <ChartBarIcon className="w-5 h-5 mr-2 text-primary-600" />
                    Document Security Overview
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Secured Documents</span>
                        <span className="text-lg font-semibold text-gray-800">12</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-green-600">100% protected</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Blockchain Verified</span>
                        <span className="text-lg font-semibold text-gray-800">10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: '83%' }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-blue-600">83% verified</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Pending Requests</span>
                        <span className="text-lg font-semibold text-gray-800">1</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: '25%' }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-yellow-600">1 action needed</div>
                    </div>
                  </div>
                </div>

                <ShieldVaultDashboard transactionId={transactionId} />
              </div>

              {/* Vault Security Status */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                    <LockClosedIcon className="w-5 h-5 mr-2 text-primary-600" />
                    Vault Security Status
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Encryption</span>
                        <span className="text-green-600 font-medium">Active</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Blockchain Verification</span>
                        <span className="text-green-600 font-medium">Verified</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Access Control</span>
                        <span className="text-green-600 font-medium">Enforced</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Audit Trails</span>
                        <span className="text-green-600 font-medium">Enabled</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button className="flex items-center text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors duration-150">
                      <ArrowPathIcon className="w-4 h-4 mr-1" />
                      Run Security Scan
                    </button>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Quick Actions</h3>

                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                      <PlusIcon className="w-6 h-6 text-primary-600 mb-2" />
                      <span className="text-sm font-medium text-gray-800">Add Document</span>
                    </button>

                    <button className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                      <DocumentMagnifyingGlassIcon className="w-6 h-6 text-primary-600 mb-2" />
                      <span className="text-sm font-medium text-gray-800">Request Document</span>
                    </button>

                    <button className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                      <CloudArrowUpIcon className="w-6 h-6 text-primary-600 mb-2" />
                      <span className="text-sm font-medium text-gray-800">Upload to Vault</span>
                    </button>

                    <button className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                      <ShieldCheckIcon className="w-6 h-6 text-primary-600 mb-2" />
                      <span className="text-sm font-medium text-gray-800">Verify Documents</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'documents' && (
            <div>
              {/* Document category selectors */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-3">Document Categories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {documentTypes.map(type => (
                    <div
                      key={type.id}
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-150 hover:shadow-md"
                    >
                      <div className="flex items-center mb-2">
                        <div className="bg-primary-100 p-2 rounded-md mr-3">{type.icon}</div>
                        <h3 className="font-medium text-gray-800">{type.name}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{type.description}</p>
                      <div className="mt-3 flex justify-end">
                        <button className="text-primary-600 text-sm flex items-center hover:text-primary-700 transition-colors duration-150">
                          View <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent documents section */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-primary-600" />
                  Recent Documents
                </h3>

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
                          Date Added
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Verification
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
                      <tr className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                          Tax Return 2022.pdf
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Financial
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          May 15, 2023
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              View
                            </button>
                            <button className="text-primary-600 hover:text-primary-900">
                              Download
                            </button>
                            <button className="text-primary-600 hover:text-primary-900">
                              Share
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                          Bank Statement Q1.pdf
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Financial
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          April 10, 2023
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              View
                            </button>
                            <button className="text-primary-600 hover:text-primary-900">
                              Download
                            </button>
                            <button className="text-primary-600 hover:text-primary-900">
                              Share
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                          Business License.pdf
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Business
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          March 22, 2023
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              View
                            </button>
                            <button className="text-primary-600 hover:text-primary-900">
                              Download
                            </button>
                            <button className="text-primary-600 hover:text-primary-900">
                              Share
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeView === 'requests' && (
            <div className="space-y-6">
              {/* Document Requests Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <DocumentMagnifyingGlassIcon className="w-5 h-5 mr-2 text-primary-600" />
                  Document Requests
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:shadow-md transition-shadow duration-150">
                    <div className="flex items-start">
                      <div className="bg-yellow-100 p-2 rounded-md mr-3">
                        <DocumentMagnifyingGlassIcon className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Income Verification Documents
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              We need your last 3 months of bank statements and proof of income for
                              loan verification.
                            </p>
                          </div>
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </div>
                        <div className="mt-3 text-sm text-gray-500">
                          Requested by: EVA Financial • Due by: June 15, 2023
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <button className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors duration-150">
                            Upload Documents
                          </button>
                          <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors duration-150">
                            Request Extension
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow duration-150">
                    <div className="flex items-start">
                      <div className="bg-green-100 p-2 rounded-md mr-3">
                        <DocumentTextIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Business Registration Documents
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Your business registration documents have been received and verified.
                            </p>
                          </div>
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        </div>
                        <div className="mt-3 text-sm text-gray-500">
                          Requested by: EVA Financial • Completed on: May 28, 2023
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors duration-150">
                            View Documents
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShieldVaultPage;
