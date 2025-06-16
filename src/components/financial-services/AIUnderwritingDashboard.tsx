import React, { useState, useEffect, useCallback } from 'react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  CalculatorIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface UnderwritingApplication {
  id: string;
  borrowerName: string;
  loanAmount: number;
  loanType: string;
  submittedAt: Date;
  status: 'pending' | 'analyzing' | 'approved' | 'rejected' | 'review_required';
  aiScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  processingTime: number;
  factors: {
    creditScore: number;
    debtToIncome: number;
    income: number;
    employment: string;
    collateral: number;
  };
  aiRecommendation: string;
  humanReview?: {
    reviewer: string;
    notes: string;
    decision: string;
    reviewedAt: Date;
  };
}

interface AIModel {
  name: string;
  version: string;
  accuracy: number;
  lastTrained: Date;
  isActive: boolean;
}

const AIUnderwritingDashboard: React.FC = () => {
  const [applications, setApplications] = useState<UnderwritingApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<UnderwritingApplication | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [metrics, setMetrics] = useState({
    totalApplications: 0,
    autoApproved: 0,
    autoRejected: 0,
    needsReview: 0,
    averageProcessingTime: 0,
    accuracyRate: 0,
  });

  useEffect(() => {
    fetchApplications();
    fetchModels();
    fetchMetrics();
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/underwriting/applications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json() as { applications?: any[]; models?: any[]; metrics?: any; status?: string; aiScore?: number; recommendation?: string; review?: string };
        setApplications(data.applications || mockApplications);
      } else {
        // Use mock data for demo
        setApplications(mockApplications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications(mockApplications);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/underwriting/models`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json() as { models?: any[] };
        setModels(data.models || mockModels);
      } else {
        setModels(mockModels);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels(mockModels);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/underwriting/metrics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json() as { metrics?: any };
        setMetrics(data.metrics || mockMetrics);
      } else {
        setMetrics(mockMetrics);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setMetrics(mockMetrics);
    }
  };

  const processApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/underwriting/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          applicationId,
          useAI: true,
          complianceLevel: 'high',
        }),
      });

      if (response.ok) {
        const data = await response.json() as { status?: string; aiScore?: number; recommendation?: string };
        // Update application with AI analysis results
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: data.status as any, aiScore: data.aiScore, aiRecommendation: data.recommendation }
            : app
        ));
      }
    } catch (error) {
      console.error('Error processing application:', error);
    }
  };

  const submitHumanReview = async (applicationId: string, decision: string, notes: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/underwriting/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          applicationId,
          decision,
          notes,
          reviewer: 'Current User', // Would come from auth context
        }),
      });

      if (response.ok) {
        const data = await response.json() as { review?: string };
        // Update application with human review
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: decision as any, humanReview: { reviewer: '', notes: data.review || '', decision: '', reviewedAt: new Date() } }
            : app
        ));
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'review_required': return 'text-yellow-600 bg-yellow-100';
      case 'analyzing': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI-Powered Underwriting</h1>
            <p className="text-gray-600 mt-1">Automated loan analysis and decision support</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Active Model: EVA-Underwriting v{models.find(m => m.isActive)?.version || '2.1'}
            </div>
            <button 
              onClick={fetchApplications}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{metrics.totalApplications}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.autoApproved}</div>
            <div className="text-sm text-gray-600">Auto Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{metrics.autoRejected}</div>
            <div className="text-sm text-gray-600">Auto Rejected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{metrics.needsReview}</div>
            <div className="text-sm text-gray-600">Needs Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.averageProcessingTime}s</div>
            <div className="text-sm text-gray-600">Avg Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.accuracyRate}%</div>
            <div className="text-sm text-gray-600">AI Accuracy</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Applications List */}
        <div className="flex-1 flex flex-col">
          {/* Filters */}
          <div className="bg-white px-6 py-3 border-b border-gray-200">
            <div className="flex space-x-4">
              {[
                { value: 'all', label: 'All Applications' },
                { value: 'pending', label: 'Pending' },
                { value: 'analyzing', label: 'Analyzing' },
                { value: 'review_required', label: 'Needs Review' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filter === f.value
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Table */}
          <div className="flex-1 overflow-auto bg-white">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AI Analysis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedApp(app)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{app.borrowerName}</div>
                          <div className="text-sm text-gray-500">ID: {app.id}</div>
                          <div className="text-sm text-gray-500">{format(app.submittedAt, 'MMM d, yyyy')}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            ${app.loanAmount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">{app.loanType}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-gray-900">
                            Score: {app.aiScore}/100
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(app.riskLevel)}`}>
                            {app.riskLevel} risk
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Confidence: {app.confidence}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApp(app);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {app.status === 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                processApplication(app.id);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CpuChipIcon className="h-4 w-4" />
                            </button>
                          )}
                          {app.status === 'review_required' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApp(app);
                              }}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Application Details Sidebar */}
        {selectedApp && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Application Details</h3>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Borrower Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Borrower Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium">{selectedApp.borrowerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Credit Score:</span>
                      <span className="text-sm font-medium">{selectedApp.factors.creditScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Annual Income:</span>
                      <span className="text-sm font-medium">${selectedApp.factors.income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Debt-to-Income:</span>
                      <span className="text-sm font-medium">{selectedApp.factors.debtToIncome}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Employment:</span>
                      <span className="text-sm font-medium">{selectedApp.factors.employment}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loan Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Loan Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="text-sm font-medium">${selectedApp.loanAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm font-medium">{selectedApp.loanType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Collateral:</span>
                      <span className="text-sm font-medium">${selectedApp.factors.collateral.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">AI Analysis</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <CpuChipIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">
                      AI Score: {selectedApp.aiScore}/100
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Risk Level:</span>
                      <span className={`text-sm font-medium ${getRiskColor(selectedApp.riskLevel).replace('bg-', 'text-').replace('-100', '-600')}`}>
                        {selectedApp.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Confidence:</span>
                      <span className="text-sm font-medium text-blue-900">{selectedApp.confidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700">Processing Time:</span>
                      <span className="text-sm font-medium text-blue-900">{selectedApp.processingTime}s</span>
                    </div>
                  </div>
                  <div className="text-sm text-blue-800">
                    <strong>Recommendation:</strong> {selectedApp.aiRecommendation}
                  </div>
                </div>
              </div>

              {/* Human Review (if exists) */}
              {selectedApp.humanReview && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Human Review</h4>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Reviewer:</span>
                        <span className="text-sm font-medium text-green-900">{selectedApp.humanReview.reviewer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Decision:</span>
                        <span className="text-sm font-medium text-green-900">{selectedApp.humanReview.decision}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Reviewed:</span>
                        <span className="text-sm font-medium text-green-900">
                          {format(selectedApp.humanReview.reviewedAt, 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-green-800">
                      <strong>Notes:</strong> {selectedApp.humanReview.notes}
                    </div>
                  </div>
                </div>
              )}

              {/* Review Actions */}
              {selectedApp.status === 'review_required' && !selectedApp.humanReview && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Human Review Required</h4>
                  <div className="space-y-4">
                    <textarea
                      placeholder="Add review notes..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => submitHumanReview(selectedApp.id, 'approved', 'Approved after human review')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md text-sm font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => submitHumanReview(selectedApp.id, 'rejected', 'Rejected after human review')}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md text-sm font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data for demo
const mockApplications: UnderwritingApplication[] = [];
const mockModels: AIModel[] = [];
const mockMetrics = {
  totalApplications: 0,
  autoApproved: 0,
  autoRejected: 0,
  needsReview: 0,
  averageProcessingTime: 0,
  accuracyRate: 0,
};

export { AIUnderwritingDashboard };