import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import DashboardCard from './DashboardCard';

interface User {
  id: string;
  role: 'borrower' | 'vendor' | 'broker' | 'lender' | 'admin';
  name: string;
  email: string;
}

interface BorrowerDashboardProps {
  user: User;
}

// Mock application data
const mockApplications = [
  {
    id: 'app-123',
    name: 'Working Capital Loan',
    status: 'In Review',
    amount: 150000,
    date: '2023-10-15',
  },
  {
    id: 'app-124',
    name: 'Equipment Financing',
    status: 'Approved',
    amount: 75000,
    date: '2023-09-28',
  },
];

// Mock status data
const mockStatus = [
  { id: 1, step: 'Application Submitted', status: 'completed', date: '2023-10-15' },
  { id: 2, step: 'Initial Review', status: 'completed', date: '2023-10-17' },
  { id: 3, step: 'Credit Analysis', status: 'active', date: null },
  { id: 4, step: 'Final Approval', status: 'pending', date: null },
  { id: 5, step: 'Funding', status: 'pending', date: null },
];

// Mock documents needed
const mockDocuments = [
  { id: 'doc1', name: 'Last 3 months bank statements', status: 'uploaded', required: true },
  { id: 'doc2', name: 'Business financial statements', status: 'uploaded', required: true },
  { id: 'doc3', name: 'Equipment invoice', status: 'required', required: true },
  { id: 'doc4', name: 'Business plan', status: 'optional', required: false },
];

const BorrowerDashboard: React.FC<BorrowerDashboardProps> = ({ user }) => {
  const navigate = useNavigate();

  // Define navigation for borrower
  const navigation = [
    {
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      href: '/dashboard',
      active: true,
    },
    {
      label: 'Applications',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      href: '/applications',
      active: false,
    },
    {
      label: 'Documents',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
          />
        </svg>
      ),
      href: '/documents',
      active: false,
    },
    {
      label: 'Messages',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
      href: '/messages',
      active: false,
    },
  ];

  // Function to get status badge style
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'in review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'uploaded':
        return 'bg-green-100 text-green-800';
      case 'required':
        return 'bg-red-100 text-red-800';
      case 'optional':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout
      user={user}
      title="Borrower Dashboard"
      subtitle="Track your loan applications and manage your documents"
    >
      {/* My Applications Card */}
      <DashboardCard
        title="My Applications"
        colSpan="half"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
      >
        <div className="space-y-3">
          {mockApplications.map(app => (
            <div
              key={app.id}
              className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
            >
              <div>
                <div className="font-medium text-gray-900">{app.name}</div>
                <div className="text-sm text-gray-500">{app.date}</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium">{formatCurrency(app.amount)}</div>
                  <div
                    className={`inline-flex text-xs px-2 py-1 rounded-full ${getStatusBadge(app.status)}`}
                  >
                    {app.status}
                  </div>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/applications')}
            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
          >
            View all applications →
          </button>
        </div>
      </DashboardCard>

      {/* Application Status Card */}
      <DashboardCard
        title="Application Status"
        colSpan="half"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        }
      >
        <div className="relative">
          {/* Timeline */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          <div className="space-y-6 relative pl-10">
            {mockStatus.map(step => (
              <div key={step.id} className="relative">
                {/* Timeline dot */}
                <div
                  className={`absolute -left-6 rounded-full h-4 w-4 flex items-center justify-center ${
                    step.status === 'completed'
                      ? 'bg-green-500'
                      : step.status === 'active'
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-gray-300'
                  }`}
                >
                  {step.status === 'completed' && (
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{step.step}</h4>
                    {step.date && <p className="text-xs text-gray-500">{step.date}</p>}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(step.status)}`}>
                    {step.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>

      {/* Required Documents Card */}
      <DashboardCard
        title="Required Documents"
        colSpan="third"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
      >
        <div className="space-y-3">
          {mockDocuments.map(doc => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                    doc.status === 'uploaded'
                      ? 'bg-green-100 text-green-700'
                      : doc.status === 'required'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {doc.status === 'uploaded' ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                  <div
                    className={`text-xs ${
                      doc.required ? 'text-red-600 font-medium' : 'text-gray-500'
                    }`}
                  >
                    {doc.required ? 'Required' : 'Optional'}
                  </div>
                </div>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(doc.status)}`}>
                {doc.status}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/documents/upload')}
            className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium"
          >
            Upload Documents
          </button>
        </div>
      </DashboardCard>

      {/* Quick Actions Card */}
      <DashboardCard
        title="Quick Actions"
        colSpan="third"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        }
      >
        <div className="space-y-2">
          <button
            onClick={() => navigate('/application/new')}
            className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium"
          >
            Start New Application
          </button>
          <button
            onClick={() => navigate('/documents/upload')}
            className="w-full py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium"
          >
            Upload Documents
          </button>
          <button
            onClick={() => navigate('/application/status')}
            className="w-full py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium"
          >
            Check Application Status
          </button>
          <button
            onClick={() => navigate('/messages')}
            className="w-full py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium"
          >
            Contact Support
          </button>
        </div>
      </DashboardCard>

      {/* Recent Activity Card */}
      <DashboardCard
        title="Recent Activity"
        colSpan="third"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      >
        <div className="space-y-4">
          <div className="flex">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">Application submitted</div>
              <div className="text-xs text-gray-500">Today at 10:23 AM</div>
              <div className="text-xs text-gray-700 mt-1">
                Your application for Working Capital Loan has been submitted successfully.
              </div>
            </div>
          </div>

          <div className="flex">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">Document reminder</div>
              <div className="text-xs text-gray-500">Yesterday at 4:45 PM</div>
              <div className="text-xs text-gray-700 mt-1">
                Please upload your equipment invoice to complete your application.
              </div>
            </div>
          </div>

          <div className="flex">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">New message</div>
              <div className="text-xs text-gray-500">Oct 25, 2023 at 9:30 AM</div>
              <div className="text-xs text-gray-700 mt-1">
                You have a new message from Sarah regarding your loan application.
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Loan Summary Card */}
      <DashboardCard
        title="Loan Summary"
        colSpan="full"
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        }
      >
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-lg font-semibold text-gray-900">Equipment Financing</div>
          <div className="text-sm text-gray-500 mb-4">Approved on Sep 28, 2023</div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">Loan Amount</div>
              <div className="text-base font-medium text-gray-900">{formatCurrency(75000)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Term</div>
              <div className="text-base font-medium text-gray-900">60 months</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Rate</div>
              <div className="text-base font-medium text-gray-900">5.25%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Monthly Payment</div>
              <div className="text-base font-medium text-gray-900">{formatCurrency(1415)}</div>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => navigate('/loans/details/123')}
              className="text-sm text-primary-600 hover:text-primary-800 font-medium"
            >
              View loan details →
            </button>
          </div>
        </div>
      </DashboardCard>
    </DashboardLayout>
  );
};

export default BorrowerDashboard;
