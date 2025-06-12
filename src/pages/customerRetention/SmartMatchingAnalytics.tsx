import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { useUserPermissions } from '../../hooks/useUserPermissions';
import { SmartMatchingInstrument } from '../../types/SmartMatchingTypes';
import smartMatchingService from '../../services/smartMatchingService';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const SmartMatchingAnalytics: React.FC = () => {
  const { instrumentId } = useParams<{ instrumentId: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useUserPermissions();

  const [instrument, setInstrument] = useState<SmartMatchingInstrument | null>(null);
  const [, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange] = useState({ from: '', to: '' });

  // Define loadAnalytics with useCallback to prevent unnecessary re-renders
  const loadAnalytics = useCallback(async () => {
    if (!instrumentId) return;

    try {
      setLoading(true);

      // Load instrument details and analytics
      const [instrumentData, analyticsData] = await Promise.all([
        smartMatchingService.getInstrument(instrumentId),
        smartMatchingService.getInstrumentAnalytics(
          instrumentId,
          dateRange.from && dateRange.to ? dateRange : undefined
        ),
      ]);

      setInstrument(instrumentData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [instrumentId, dateRange.from, dateRange.to]); // Dependencies that loadAnalytics uses

  useEffect(() => {
    if (!hasPermission('smartMatch', 'MODIFY')) {
      navigate('/customer-retention/customers');
      return;
    }

    if (instrumentId) {
      loadAnalytics();
    }
  }, [instrumentId, hasPermission, navigate, loadAnalytics]); // Added loadAnalytics to dependencies

  const mockAnalytics = {
    totalMatches: 245,
    successfulMatches: 187,
    successRate: 76.3,
    averageMatchScore: 82.5,
    averageTimeToClose: 14,
    monthlyTrends: [
      { month: 'Jan', matches: 18, successes: 14 },
      { month: 'Feb', matches: 22, successes: 17 },
      { month: 'Mar', matches: 25, successes: 19 },
      { month: 'Apr', matches: 28, successes: 21 },
      { month: 'May', matches: 31, successes: 24 },
      { month: 'Jun', matches: 35, successes: 28 },
    ],
    topMatchedIndustries: [
      { industry: 'Construction', count: 45, percentage: 18.4 },
      { industry: 'Transportation', count: 38, percentage: 15.5 },
      { industry: 'Manufacturing', count: 32, percentage: 13.1 },
    ],
    creditScoreDistribution: [
      { range: '700-750', count: 68 },
      { range: '750-800', count: 52 },
      { range: '650-700', count: 41 },
      { range: '600-650', count: 26 },
    ],
  };

  if (loading) {
    return (
      <PageLayout title="Instrument Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  if (!instrument) {
    return (
      <PageLayout title="Instrument Analytics">
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Instrument not found</h3>
          <p className="mt-1 text-sm text-gray-500">The requested instrument could not be found.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/customer-retention/smart-matching')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Smart Matching
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Instrument Analytics">
      <div className="w-full">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/customer-retention/smart-matching')}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{instrument.instrumentName}</h1>
                <p className="mt-2 text-gray-600">Performance analytics and matching insights</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Matches</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {mockAnalytics.totalMatches}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Successful</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {mockAnalytics.successfulMatches}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUpIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Success Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {mockAnalytics.successRate}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Match Score</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {mockAnalytics.averageMatchScore}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Close Time</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {mockAnalytics.averageTimeToClose} days
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Trends */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {mockAnalytics.monthlyTrends.map(month => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">{month.matches} matches</span>
                        <span className="text-sm text-green-600">{month.successes} successful</span>
                        <span className="text-xs text-gray-400">
                          {((month.successes / month.matches) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Industries */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top Matched Industries</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {mockAnalytics.topMatchedIndustries.map((industry, index) => (
                    <div key={industry.industry} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {industry.industry}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">{industry.count} matches</span>
                        <span className="text-xs text-gray-500">({industry.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Credit Score Distribution */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Credit Score Distribution</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {mockAnalytics.creditScoreDistribution.map(score => (
                    <div key={score.range} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{score.range}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(score.count / Math.max(...mockAnalytics.creditScoreDistribution.map(s => s.count))) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900 w-8">{score.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Matches */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Matches</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Acme Construction LLC</p>
                      <p className="text-xs text-gray-500">Match Score: 89 • 2 hours ago</p>
                    </div>
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Metro Transport Inc</p>
                      <p className="text-xs text-gray-500">Match Score: 76 • 1 day ago</p>
                    </div>
                    <ClockIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Small Business Co</p>
                      <p className="text-xs text-gray-500">Match Score: 45 • 2 days ago</p>
                    </div>
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => navigate(`/customer-retention/smart-matching/edit/${instrumentId}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Instrument
            </button>
            <button
              onClick={() => navigate('/customer-retention/smart-matching')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SmartMatchingAnalytics;
