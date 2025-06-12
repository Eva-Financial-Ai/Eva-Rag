import {
  ArrowTopRightOnSquareIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CreditCardIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface BusinessBorrowerDashboardProps {
  metrics: any;
  alerts: any[];
  quickActions: any[];
  selectedCustomer?: any;
  activeCustomer?: any;
}

interface LoanApplication {
  id: string;
  type: string;
  amount: number;
  status: 'pending' | 'approved' | 'denied' | 'in-review' | 'documents-needed';
  submittedDate: string;
  lender: string;
  progress: number;
  nextStep?: string;
  evaScore?: number;
}

interface CreditMetric {
  label: string;
  value: string | number;
  change?: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

interface FinancingOption {
  id: string;
  lender: string;
  type: string;
  amount: number;
  rate: number;
  term: string;
  monthlyPayment: number;
  evaRequirement: number;
  status: 'available' | 'qualified' | 'not-qualified';
}

const BusinessBorrowerDashboard: React.FC<BusinessBorrowerDashboardProps> = ({
  metrics,
  selectedCustomer,
  activeCustomer,
}) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [creditMetrics, setCreditMetrics] = useState<CreditMetric[]>([]);
  const [financingOptions, setFinancingOptions] = useState<FinancingOption[]>([]);
  const [evaScore, setEvaScore] = useState<number>(728);
  const [creditTrend, setCreditTrend] = useState<'improving' | 'stable' | 'declining'>('improving');

  const customer = selectedCustomer || activeCustomer;

  useEffect(() => {
    // Load business borrower specific data
    const loadBorrowerData = async () => {
      // Mock loan applications
      const mockApplications: LoanApplication[] = [
        {
          id: 'app-001',
          type: 'Equipment Financing',
          amount: 250000,
          status: 'in-review',
          submittedDate: '2024-01-10',
          lender: 'Capital Plus Bank',
          progress: 75,
          nextStep: 'Awaiting final underwriting approval',
          evaScore: 742,
        },
        {
          id: 'app-002',
          type: 'Working Capital',
          amount: 100000,
          status: 'documents-needed',
          submittedDate: '2024-01-05',
          lender: 'Business Credit Solutions',
          progress: 45,
          nextStep: 'Upload recent tax returns',
          evaScore: 728,
        },
        {
          id: 'app-003',
          type: 'Real Estate',
          amount: 500000,
          status: 'approved',
          submittedDate: '2023-12-20',
          lender: 'Commercial Lending Corp',
          progress: 100,
          evaScore: 755,
        },
      ];

      // Mock credit metrics
      const mockCreditMetrics: CreditMetric[] = [
        {
          label: 'Business Credit Score',
          value: 742,
          change: +15,
          trend: 'up',
          icon: ChartBarIcon,
          color: 'text-green-600',
        },
        {
          label: 'Payment History',
          value: '100%',
          change: 0,
          trend: 'stable',
          icon: CheckCircleIcon,
          color: 'text-green-600',
        },
        {
          label: 'Credit Utilization',
          value: '23%',
          change: -5,
          trend: 'up',
          icon: CreditCardIcon,
          color: 'text-blue-600',
        },
        {
          label: 'Years in Business',
          value: 12,
          change: 0,
          trend: 'stable',
          icon: BuildingOfficeIcon,
          color: 'text-gray-600',
        },
      ];

      // Mock financing options
      const mockFinancingOptions: FinancingOption[] = [
        {
          id: 'option-001',
          lender: 'Premier Business Capital',
          type: 'Term Loan',
          amount: 300000,
          rate: 6.5,
          term: '5 years',
          monthlyPayment: 5847,
          evaRequirement: 700,
          status: 'qualified',
        },
        {
          id: 'option-002',
          lender: 'Capital Boost Lending',
          type: 'Line of Credit',
          amount: 150000,
          rate: 8.2,
          term: 'Revolving',
          monthlyPayment: 0,
          evaRequirement: 680,
          status: 'qualified',
        },
        {
          id: 'option-003',
          lender: 'Equipment Finance Solutions',
          type: 'Equipment Loan',
          amount: 200000,
          rate: 5.8,
          term: '7 years',
          monthlyPayment: 2945,
          evaRequirement: 720,
          status: 'qualified',
        },
      ];

      setApplications(mockApplications);
      setCreditMetrics(mockCreditMetrics);
      setFinancingOptions(mockFinancingOptions);
    };

    loadBorrowerData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'documents-needed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'denied':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQualificationColor = (status: string) => {
    switch (status) {
      case 'qualified':
        return 'text-green-600';
      case 'available':
        return 'text-blue-600';
      case 'not-qualified':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* EVA Score & Credit Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* EVA Score Card */}
        <div className="lg:col-span-1">
          <div className="bg-white h-full rounded-lg border border-gray-200 p-6">
            <div className="text-center">
              <h3 className="mb-2 text-sm font-medium text-gray-500">EVA Credit Score</h3>
              <div className="relative mb-4">
                <div className="mx-auto h-32 w-32">
                  <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      stroke="#059669"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={`${(evaScore / 850) * 339.292} 339.292`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{evaScore}</div>
                      <div className="text-xs text-gray-500">of 850</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-lg font-semibold text-green-600">Excellent</span>
                {creditTrend === 'improving' && (
                  <ArrowTrendingUpIcon className="ml-2 h-5 w-5 text-green-600" />
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {creditTrend === 'improving'
                  ? 'Your score increased by 15 points this month'
                  : 'Your score is stable'}
              </p>
              <button
                onClick={() => navigate('/eva-reports')}
                className="text-white mt-4 w-full rounded-md bg-green-600 px-4 py-2 transition-colors hover:bg-green-700"
              >
                View Full Report
              </button>
            </div>
          </div>
        </div>

        {/* Credit Metrics Grid */}
        <div className="lg:col-span-2">
          <div className="grid h-full grid-cols-2 gap-4">
            {creditMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`bg-gray-50 rounded-md p-2`}>
                      <metric.icon className={`h-5 w-5 ${metric.color}`} />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{metric.value}</p>
                      <p className="text-xs text-gray-500">{metric.label}</p>
                    </div>
                  </div>
                  {metric.change !== 0 && (
                    <span
                      className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {metric.change > 0 ? '+' : ''}
                      {metric.change}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Applications */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Active Loan Applications</h3>
            <button
              onClick={() => navigate('/applications/new')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              New Application
            </button>
          </div>
        </div>
        <div className="p-6">
          {applications.length === 0 ? (
            <div className="py-8 text-center">
              <DocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first loan application.
              </p>
              <button
                onClick={() => navigate('/applications/new')}
                className="text-white mt-4 rounded-md bg-blue-600 px-4 py-2 hover:bg-blue-700"
              >
                Start Application
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-gray-900">{app.type}</h4>
                        <span
                          className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(app.status)}`}
                        >
                          {app.status.replace('-', ' ')}
                        </span>
                        {app.evaScore && (
                          <span className="text-xs text-gray-500">EVA Score: {app.evaScore}</span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="font-medium">${app.amount.toLocaleString()}</span>
                        <span>•</span>
                        <span>{app.lender}</span>
                        <span>•</span>
                        <span>Submitted {new Date(app.submittedDate).toLocaleDateString()}</span>
                      </div>
                      {app.nextStep && (
                        <p className="mt-2 text-sm text-gray-600">
                          <strong>Next:</strong> {app.nextStep}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center space-x-4 lg:ml-6 lg:mt-0">
                      <div className="flex-shrink-0">
                        <div className="text-sm text-gray-500">Progress</div>
                        <div className="bg-gray-200 mt-1 h-2 w-24 rounded-full">
                          <div
                            className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                            style={{ width: `${app.progress}%` }}
                          ></div>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">{app.progress}%</div>
                      </div>
                      <button
                        onClick={() => navigate(`/applications/${app.id}`)}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Available Financing Options */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Available Financing Options</h3>
          <p className="text-sm text-gray-500">Based on your EVA score and business profile</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {financingOptions.map(option => (
              <div key={option.id} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{option.lender}</h4>
                    <p className="text-xs text-gray-500">{option.type}</p>
                  </div>
                  <span className={`text-sm font-medium ${getQualificationColor(option.status)}`}>
                    {option.status === 'qualified'
                      ? 'Qualified'
                      : option.status === 'available'
                        ? 'Available'
                        : 'Not Qualified'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">${option.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-medium">{option.rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Term:</span>
                    <span className="font-medium">{option.term}</span>
                  </div>
                  {option.monthlyPayment > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly:</span>
                      <span className="font-medium">${option.monthlyPayment.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min EVA Score:</span>
                    <span
                      className={`font-medium ${evaScore >= option.evaRequirement ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {option.evaRequirement}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/financing-options/${option.id}`)}
                  disabled={option.status === 'not-qualified'}
                  className="text-white mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {option.status === 'qualified'
                    ? 'Apply Now'
                    : option.status === 'available'
                      ? 'Check Eligibility'
                      : 'Not Available'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Health Summary */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Financial Health Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">A+</div>
              <div className="text-sm text-gray-600">Credit Grade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">$2.4M</div>
              <div className="text-sm text-gray-600">Available Credit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">23%</div>
              <div className="text-sm text-gray-600">Debt-to-Income</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">$45K</div>
              <div className="text-sm text-gray-600">Monthly Cash Flow</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessBorrowerDashboard;
