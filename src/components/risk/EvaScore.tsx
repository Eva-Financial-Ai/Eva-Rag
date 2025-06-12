import React, { useEffect, useState } from 'react';
import EvaScoreLoader from './EvaScoreLoader';

interface ScoreCategory {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

interface ScoreBreakdown {
  overallScore: number;
  maxScore: number;
  rating: string;
  categories: ScoreCategory[];
  lastUpdated: string;
}

interface EvaScoreProps {
  transactionId: string;
  riskMapType?: 'unsecured' | 'equipment' | 'real-estate';
  layout?: 'default' | 'compact';
  riskParameters?: any;
  onParameterChange?: (params: any) => void;
  enableParameterEditing?: boolean;
  creditData?: any;
}

// Simplified score type options
type ScoreType = 'unsecured' | 'equipment' | 'real-estate' | 'debt-equity';

const EvaScore: React.FC<EvaScoreProps> = ({
  transactionId,
  riskMapType = 'unsecured',
  layout = 'default',
  riskParameters,
  onParameterChange,
  enableParameterEditing = false,
  creditData,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'history'>('summary');
  const [loading, setLoading] = useState<boolean>(true);
  const [scoreType, setScoreType] = useState<ScoreType>('unsecured');

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Re-fetch data when score type changes
  useEffect(() => {
    setLoading(true);

    // Simulated API call based on selected score type
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [scoreType]);

  // Score type labels for display
  const scoreTypeLabels = {
    unsecured: 'Eva - Unsecured Commercial Paper Score',
    equipment: 'Eva - Commercial Equipment, Vehicles Paper Score',
    'real-estate': 'Eva - Commercial Real Estate & Land Paper Score',
    'debt-equity': 'Asset Back Collaterized Debt Equity Report',
  };

  // Mock data for Eva Score
  const scoreBreakdown: ScoreBreakdown = {
    overallScore: 725,
    maxScore: 850,
    rating: 'Good',
    lastUpdated: 'April 15, 2023',
    categories: [
      {
        id: 'credit',
        name: 'Credit History',
        score: 165,
        maxScore: 200,
        impact: 'high',
        description: 'Assessment of business and personal credit history.',
      },
      {
        id: 'capacity',
        name: 'Cash Flow Capacity',
        score: 140,
        maxScore: 200,
        impact: 'high',
        description: 'Evaluation of ability to service debt from operating cash flow.',
      },
      {
        id: 'collateral',
        name: 'Collateral Coverage',
        score: 120,
        maxScore: 150,
        impact: 'medium',
        description: 'Value and quality of assets offered as security.',
      },
      {
        id: 'capital',
        name: 'Capital Reserves',
        score: 110,
        maxScore: 150,
        impact: 'medium',
        description: 'Assessment of available capital and equity investment.',
      },
      {
        id: 'conditions',
        name: 'Market Conditions',
        score: 95,
        maxScore: 100,
        impact: 'low',
        description: 'Industry and economic factors affecting the business.',
      },
      {
        id: 'character',
        name: 'Management Experience',
        score: 95,
        maxScore: 100,
        impact: 'low',
        description: 'Assessment of management capability and character.',
      },
    ],
  };

  // Historical data for score trends
  const scoreHistory = [
    { date: 'Apr 2023', score: 725 },
    { date: 'Mar 2023', score: 715 },
    { date: 'Feb 2023', score: 705 },
    { date: 'Jan 2023', score: 690 },
    { date: 'Dec 2022', score: 675 },
    { date: 'Nov 2022', score: 670 },
  ];

  // Rating scale explanation
  const scoreRanges = [
    { range: '800-850', rating: 'Excellent', description: 'Minimal risk, highly favorable terms' },
    { range: '740-799', rating: 'Very Good', description: 'Low risk, favorable terms available' },
    { range: '670-739', rating: 'Good', description: 'Moderate risk, standard terms' },
    { range: '580-669', rating: 'Fair', description: 'Medium risk, may require additional review' },
    { range: '300-579', rating: 'Poor', description: 'High risk, limited funding options' },
  ];

  // Helper function to get color based on score
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 75) return 'text-teal-600 bg-teal-100';
    if (percentage >= 60) return 'text-blue-600 bg-blue-100';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Render selection options for score types
  const renderScoreTypeSelector = () => {
    return (
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="w-full">
          <label className="mb-3 block text-sm font-medium text-gray-700">Score Type</label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <button
              onClick={() => setScoreType('unsecured')}
              className={`rounded-md px-3 py-2 text-left text-sm ${
                scoreType === 'unsecured'
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Eva - Unsecured Commercial Paper Score
            </button>
            <button
              onClick={() => setScoreType('equipment')}
              className={`rounded-md px-3 py-2 text-left text-sm ${
                scoreType === 'equipment'
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Eva - Commercial Equipment, Vehicles Paper Score
            </button>
            <button
              onClick={() => setScoreType('real-estate')}
              className={`rounded-md px-3 py-2 text-left text-sm ${
                scoreType === 'real-estate'
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Eva - Commercial Real Estate & Land Paper Score
            </button>
            <button
              onClick={() => setScoreType('debt-equity')}
              className={`rounded-md px-3 py-2 text-left text-sm ${
                scoreType === 'debt-equity'
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Asset Back Collaterized Debt Equity Report
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render score gauge
  const renderScoreGauge = () => {
    const percentage = (scoreBreakdown.overallScore / scoreBreakdown.maxScore) * 100;

    return (
      <div className="relative px-8 pb-8 pt-5">
        <div className="flex flex-col items-center">
          {/* Score Display */}
          <div className="relative">
            <div className="text-6xl font-bold text-primary-600">{scoreBreakdown.overallScore}</div>
            <div className="absolute right-0 top-0 -mr-10 -mt-1 text-sm text-gray-400">
              /{scoreBreakdown.maxScore}
            </div>
          </div>

          <div className="mt-2 text-lg font-medium text-gray-700">
            Eva Score Rating: <span className="text-primary-600">{scoreBreakdown.rating}</span>
          </div>

          <div className="mt-1 text-sm text-gray-500">
            Last updated: {scoreBreakdown.lastUpdated}
          </div>

          {/* Score Gauge */}
          <div className="mt-6 w-full">
            <div className="mb-1 flex h-3 overflow-hidden rounded-full bg-gray-200 text-xs">
              <div
                style={{ width: `${percentage}%` }}
                className="flex flex-col justify-center whitespace-nowrap bg-primary-600 text-center text-white shadow-none"
              ></div>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>300</span>
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Very Good</span>
              <span>850</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render score breakdown
  const renderScoreBreakdown = () => {
    return (
      <div className="mt-6 px-4">
        <h3 className="mb-4 font-medium text-gray-800">Score Breakdown</h3>
        <div className="space-y-4">
          {scoreBreakdown.categories.map(category => (
            <div key={category.id} className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-medium">{category.name}</h4>
                <div
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getScoreColor(category.score, category.maxScore)}`}
                >
                  {category.score}/{category.maxScore}
                </div>
              </div>

              <div className="relative pt-1">
                <div className="mb-2 flex h-2 overflow-hidden rounded bg-gray-200 text-xs">
                  <div
                    style={{ width: `${(category.score / category.maxScore) * 100}%` }}
                    className="flex flex-col justify-center whitespace-nowrap bg-primary-600 text-center text-white shadow-none"
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{category.description}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    category.impact === 'high'
                      ? 'bg-red-100 text-red-800'
                      : category.impact === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {category.impact.charAt(0).toUpperCase() + category.impact.slice(1)} Impact
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render score history
  const renderScoreHistory = () => {
    return (
      <div className="p-4">
        <h3 className="mb-4 font-medium text-gray-800">Score History</h3>

        <div className="relative mb-6 h-64">
          {/* This would be a line chart in a real implementation */}
          <div className="absolute inset-0 flex items-end">
            {scoreHistory.map((point, index) => (
              <div key={index} className="flex flex-1 flex-col items-center">
                <div className="mb-1 text-xs text-gray-500">{point.score}</div>
                <div
                  className="mx-1 w-full rounded-t bg-primary-600"
                  style={{ height: `${(point.score / 850) * 100}%` }}
                ></div>
                <div className="mt-1 text-xs text-gray-500">{point.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-2 font-medium text-gray-700">What Affects Your Score?</h4>
          <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600">
            <li>Credit inquiries and new account applications</li>
            <li>Payment history and delinquencies</li>
            <li>Changes in debt utilization</li>
            <li>Business performance metrics</li>
            <li>Financial statement updates</li>
          </ul>
        </div>
      </div>
    );
  };

  // If loading, show the custom loader
  if (loading) {
    return <EvaScoreLoader />;
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-5 sm:px-6">
        <h2 className="text-xl font-bold text-gray-800">Eva Score</h2>
        <p className="mt-1 text-sm text-gray-600">
          Comprehensive AI-powered creditworthiness score based on the 5C's framework
        </p>
      </div>

      {/* Score Type Selector */}
      {renderScoreTypeSelector()}

      {/* Score gauge visualization */}
      <div className="bg-white p-4">
        {renderScoreGauge()}

        {/* Tab Navigation */}
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('summary')}
              className={`border-b-2 px-6 py-4 text-sm font-medium ${
                activeTab === 'summary'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`border-b-2 px-6 py-4 text-sm font-medium ${
                activeTab === 'details'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Detailed Breakdown
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`border-b-2 px-6 py-4 text-sm font-medium ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Score History
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-4">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {renderScoreBreakdown()}

              {/* Rating Scale Explanation */}
              <div className="mt-6 px-4">
                <h3 className="mb-4 font-medium text-gray-800">Eva Score Rating Scale</h3>
                <div className="overflow-hidden bg-white shadow sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {scoreRanges.map((range, index) => (
                      <li key={index}>
                        <div className="px-4 py-3 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div
                                className={`mr-3 h-4 w-4 flex-shrink-0 rounded-full ${
                                  range.rating === 'Excellent'
                                    ? 'bg-green-400'
                                    : range.rating === 'Very Good'
                                      ? 'bg-teal-400'
                                      : range.rating === 'Good'
                                        ? 'bg-blue-400'
                                        : range.rating === 'Fair'
                                          ? 'bg-yellow-400'
                                          : 'bg-red-400'
                                }`}
                              ></div>
                              <p className="text-sm font-medium text-gray-700">
                                {range.rating} ({range.range})
                              </p>
                            </div>
                            <div className="ml-2 flex-shrink-0 text-sm text-gray-500">
                              {range.description}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && renderScoreBreakdown()}
          {activeTab === 'history' && renderScoreHistory()}
        </div>
      </div>
    </div>
  );
};

export default EvaScore;
