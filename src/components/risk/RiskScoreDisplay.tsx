import React, { useState, useEffect } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { formatPercentage } from '../../utils/formatters';

interface RiskScoreDisplayProps {
  applicationId?: string;
  loanAmount?: number;
  onScoreUpdate?: (score: RiskScore) => void;
  showFullReport?: boolean;
}

export interface RiskScore {
  overallScore: number;
  rating: string;
  factors: RiskFactor[];
  alerts: RiskAlert[];
  trends: RiskTrend[];
  recommendations: string[];
  timestamp: string;
}

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  category: 'financial' | 'business' | 'market' | 'operational' | 'compliance';
  trend: 'improving' | 'stable' | 'declining';
  details?: string;
}

export interface RiskAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  actionRequired?: boolean;
  suggestedAction?: string;
}

export interface RiskTrend {
  date: string;
  score: number;
  factors: {
    financial: number;
    business: number;
    market: number;
    operational: number;
    compliance: number;
  };
}

const RiskScoreDisplay: React.FC<RiskScoreDisplayProps> = ({
  applicationId,
  loanAmount,
  onScoreUpdate,
  showFullReport = false,
}) => {
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState<RiskFactor | null>(null);
  const [showAlerts, setShowAlerts] = useState(true);

  // Fetch risk score
  useEffect(() => {
    fetchRiskScore();
    // Set up polling for real-time updates
    const interval = setInterval(fetchRiskScore, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [applicationId]);

  const fetchRiskScore = async () => {
    try {
      setRefreshing(true);
      // Mock API call - replace with actual API
      const response = await fetch(`/api/risk/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, loanAmount }),
      });

      if (!response.ok) throw new Error('Failed to fetch risk score');

      const data = await response.json();

      // Mock data for demo
      const mockScore: RiskScore = {
        overallScore: 72,
        rating: 'BBB',
        factors: [
          {
            name: 'Credit History',
            score: 85,
            weight: 0.3,
            category: 'financial',
            trend: 'stable',
            details: 'Strong payment history with minor late payments',
          },
          {
            name: 'Financial Health',
            score: 70,
            weight: 0.25,
            category: 'financial',
            trend: 'improving',
            details: 'Improving cash flow and debt ratios',
          },
          {
            name: 'Business Stability',
            score: 65,
            weight: 0.2,
            category: 'business',
            trend: 'stable',
            details: '5+ years in business with steady growth',
          },
          {
            name: 'Market Conditions',
            score: 75,
            weight: 0.15,
            category: 'market',
            trend: 'declining',
            details: 'Industry facing headwinds but manageable',
          },
          {
            name: 'Collateral Quality',
            score: 80,
            weight: 0.1,
            category: 'operational',
            trend: 'stable',
            details: 'High-quality assets with good liquidity',
          },
        ],
        alerts: [
          {
            id: 'alert-1',
            type: 'warning',
            message: 'Debt-to-income ratio approaching threshold (currently 42%)',
            severity: 'medium',
            timestamp: new Date().toISOString(),
            actionRequired: true,
            suggestedAction: 'Consider debt consolidation or revenue improvement strategies',
          },
          {
            id: 'alert-2',
            type: 'info',
            message: 'Credit score improved by 15 points in the last quarter',
            severity: 'low',
            timestamp: new Date().toISOString(),
          },
        ],
        trends: generateMockTrends(),
        recommendations: [
          'Maintain current payment schedule to improve credit score',
          'Consider diversifying revenue streams to reduce market risk',
          'Update financial statements quarterly for better monitoring',
          'Explore refinancing options if rates decrease',
        ],
        timestamp: new Date().toISOString(),
      };

      setRiskScore(mockScore);
      if (onScoreUpdate) onScoreUpdate(mockScore);
    } catch (error) {
      console.error('Error fetching risk score:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateMockTrends = (): RiskTrend[] => {
    const trends: RiskTrend[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    months.forEach((month, index) => {
      trends.push({
        date: month,
        score: 68 + Math.random() * 8,
        factors: {
          financial: 70 + Math.random() * 15,
          business: 65 + Math.random() * 10,
          market: 70 + Math.random() * 12,
          operational: 75 + Math.random() * 10,
          compliance: 80 + Math.random() * 8,
        },
      });
    });

    return trends;
  };

  const getRatingColor = (rating: string) => {
    const colors: Record<string, string> = {
      AAA: '#10B981',
      AA: '#34D399',
      A: '#6EE7B7',
      BBB: '#FCD34D',
      BB: '#FBBF24',
      B: '#F59E0B',
      CCC: '#F97316',
      CC: '#EF4444',
      C: '#DC2626',
      D: '#991B1B',
    };
    return colors[rating] || '#6B7280';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 70) return '#FCD34D';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading && !riskScore) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!riskScore) return null;

  // Prepare data for radar chart
  const radarData = riskScore.factors.map(factor => ({
    factor: factor.name,
    score: factor.score,
    fullMark: 100,
  }));

  // Prepare data for factor breakdown
  const factorBreakdown = riskScore.factors.map(factor => ({
    name: factor.name,
    score: factor.score,
    weighted: factor.score * factor.weight,
    weight: factor.weight * 100,
  }));

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Risk Assessment Score</h2>
          <button
            onClick={fetchRiskScore}
            disabled={refreshing}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
              refreshing ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            {refreshing ? (
              <>
                <ArrowTrendingUpIcon className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
                Refresh Score
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32">
                <circle
                  className="text-gray-200"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
                <circle
                  className="transform -rotate-90 origin-center"
                  style={{ color: getScoreColor(riskScore.overallScore) }}
                  strokeWidth="10"
                  strokeDasharray={`${(riskScore.overallScore / 100) * 352} 352`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
              </svg>
              <span className="absolute text-3xl font-bold">{riskScore.overallScore}</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Overall Score</p>
          </div>

          {/* Credit Rating */}
          <div className="text-center flex flex-col justify-center">
            <div className="text-5xl font-bold" style={{ color: getRatingColor(riskScore.rating) }}>
              {riskScore.rating}
            </div>
            <p className="mt-2 text-sm text-gray-500">Credit Rating</p>
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Trend</span>
              <span className="flex items-center text-sm font-medium text-green-600">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                Improving
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Last Updated</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(riskScore.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Active Alerts</span>
              <span className="text-sm font-medium text-gray-900">
                {riskScore.alerts.filter(a => a.actionRequired).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Alerts */}
      {riskScore.alerts.length > 0 && showAlerts && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Risk Alerts</h3>
            <button
              onClick={() => setShowAlerts(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Dismiss alerts</span>×
            </button>
          </div>
          <div className="space-y-3">
            {riskScore.alerts.map(alert => (
              <div
                key={alert.id}
                className={`rounded-lg p-4 ${
                  alert.type === 'critical'
                    ? 'bg-red-50 border border-red-200'
                    : alert.type === 'warning'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">{getAlertIcon(alert.type)}</div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    {alert.suggestedAction && (
                      <p className="mt-1 text-sm text-gray-600">
                        <strong>Suggested Action:</strong> {alert.suggestedAction}
                      </p>
                    )}
                  </div>
                  {alert.actionRequired && (
                    <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Action Required
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showFullReport && (
        <>
          {/* Risk Factor Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Factor Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="factor" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#6366F1"
                    fill="#6366F1"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Factor Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Weighted Factor Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={factorBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#6366F1" name="Raw Score" />
                  <Bar dataKey="weighted" fill="#10B981" name="Weighted Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Score Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={riskScore.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[60, 85]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366F1"
                  name="Overall Score"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="factors.financial"
                  stroke="#10B981"
                  name="Financial"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="factors.business"
                  stroke="#F59E0B"
                  name="Business"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="factors.market"
                  stroke="#EF4444"
                  name="Market"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Factor Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Factor Analysis</h3>
            <div className="space-y-4">
              {riskScore.factors.map(factor => (
                <div
                  key={factor.name}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedFactor(factor)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{factor.name}</h4>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          factor.trend === 'improving'
                            ? 'bg-green-100 text-green-800'
                            : factor.trend === 'declining'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {factor.trend === 'improving' && (
                          <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                        )}
                        {factor.trend === 'declining' && (
                          <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                        )}
                        {factor.trend}
                      </span>
                      <span
                        className="text-2xl font-bold"
                        style={{ color: getScoreColor(factor.score) }}
                      >
                        {factor.score}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Weight: {formatPercentage(factor.weight * 100)}</span>
                    <span>Category: {factor.category}</span>
                  </div>
                  {factor.details && <p className="mt-2 text-sm text-gray-600">{factor.details}</p>}
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${factor.score}%`,
                        backgroundColor: getScoreColor(factor.score),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-3">
              {riskScore.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Selected Factor Modal */}
      {selectedFactor && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500"
                  onClick={() => setSelectedFactor(null)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedFactor.name} Analysis
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Score</p>
                    <p
                      className="text-3xl font-bold"
                      style={{ color: getScoreColor(selectedFactor.score) }}
                    >
                      {selectedFactor.score}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Weight in Overall Score</p>
                    <p className="text-lg font-medium">
                      {formatPercentage(selectedFactor.weight * 100)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trend</p>
                    <p
                      className={`text-lg font-medium ${
                        selectedFactor.trend === 'improving'
                          ? 'text-green-600'
                          : selectedFactor.trend === 'declining'
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }`}
                    >
                      {selectedFactor.trend.charAt(0).toUpperCase() + selectedFactor.trend.slice(1)}
                    </p>
                  </div>
                  {selectedFactor.details && (
                    <div>
                      <p className="text-sm text-gray-500">Details</p>
                      <p className="text-sm text-gray-700 mt-1">{selectedFactor.details}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskScoreDisplay;
