import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import RiskMapEvaReport from '../../../components/risk/RiskMapEvaReport';
import riskMapService from '../../../components/risk/RiskMapService';
import RiskScoreReport from '../../../components/risk/RiskScoreReport';
import { useWorkflow } from '../../../contexts/WorkflowContext';

// Demo-only component to show analysis in progress
const AnalysisInProgress = ({ currentStage, progress, mappedScores = {} }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-medium text-gray-900">Analysis in Progress</h3>
        <div className="mb-4 h-2.5 w-full rounded-full bg-gray-200">
          <div className="h-2.5 rounded-full bg-blue-600" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-sm text-gray-600">{currentStage}</p>
      </div>

      {Object.keys(mappedScores).length > 0 && (
        <div className="mt-4">
          <h4 className="text-md mb-3 font-medium text-gray-800">Parameters Analyzed:</h4>
          <div className="space-y-4">
            {Object.entries(mappedScores).map(([key, value]) => {
              // Ensure value is treated as a number
              const scoreValue = typeof value === 'number' ? value : 0;

              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{key}</span>
                  <div className="flex items-center">
                    <div className="mr-2 h-2 w-32 rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full ${
                          scoreValue > 70
                            ? 'bg-green-500'
                            : scoreValue > 40
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${scoreValue}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">{scoreValue}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// The combined EVA Risk Report & Score component
const EvaRiskReportAndScore: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const location = useLocation();
  const { currentTransaction } = useWorkflow();

  // Extract navigation state if available
  const navigationState = location.state as any;

  // State to track which tab is active
  const [activeTab, setActiveTab] = useState<'report' | 'score'>('report');

  // Track the risk map type (but don't allow user to change it here)
  const [riskMapType, setRiskMapType] = useState<'unsecured' | 'equipment' | 'realestate'>(
    navigationState?.targetType || 'unsecured',
  );

  // State to track if full analysis is being shown
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  // State to track loading state
  const [isLoading, setIsLoading] = useState(false);

  // State to track any error messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State to track available credits
  const [availableCredits, setAvailableCredits] = useState(riskMapService.getAvailableCredits());

  // State to track if sending to Filelock
  const [isSendingToFilelock, setIsSendingToFilelock] = useState(false);

  // State to track success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Demo-specific states for simulating analysis
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [analyzedParameters, setAnalyzedParameters] = useState<Record<string, number>>({});
  const [demoAnalysisActive, setDemoAnalysisActive] = useState(false);

  // Verify risk map type on component mount and from navigation state
  useEffect(() => {
    // If navigation state includes riskMapType, update our state
    if (navigationState?.targetType) {
      const validTypes: ('unsecured' | 'equipment' | 'realestate')[] = [
        'unsecured',
        'equipment',
        'realestate',
      ];
      if (validTypes.includes(navigationState.targetType)) {
        setRiskMapType(navigationState.targetType);
      }
    }
  }, [navigationState]);

  // Cleanup function for notifications
  useEffect(() => {
    return () => {
      // Clear any pending timeouts when component unmounts
      if (successMessage) {
        setSuccessMessage(null);
      }
      if (errorMessage) {
        setErrorMessage(null);
      }
    };
  }, [successMessage, errorMessage]);

  // Simulation function for demo
  const simulateAnalysis = useCallback(async () => {
    setDemoAnalysisActive(true);
    setAnalysisProgress(0);
    setAnalyzedParameters({});

    try {
      // Get analysis sequence from service
      const analysisSequence = await riskMapService.getDemoAnalysisSequence(riskMapType);

      for (const step of analysisSequence) {
        setAnalysisStage(step.stage);
        setAnalysisProgress(step.progress);

        if (step.param && step.score !== undefined) {
          await new Promise(resolve => setTimeout(resolve, step.duration / 2));
          setAnalyzedParameters(prev => ({
            ...prev,
            [step.param]: step.score,
          }));
          await new Promise(resolve => setTimeout(resolve, step.duration / 2));
        } else {
          await new Promise(resolve => setTimeout(resolve, step.duration));
        }
      }

      // Complete the demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDemoAnalysisActive(false);
      setShowFullAnalysis(true);

      // Deduct a credit
      const newCredits = riskMapService.getAvailableCredits() - 1;
      riskMapService.setAvailableCredits(newCredits);
      setAvailableCredits(newCredits);

      // Show success notification
      setSuccessMessage(
        'EVA Risk Analysis completed successfully! View the detailed results below.',
      );

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Error in analysis simulation:', error);
      setErrorMessage('An error occurred during analysis. Please try again.');
      setDemoAnalysisActive(false);
    }
  }, [riskMapType]);

  // Function to generate the full analysis
  const handleGenerateFullAnalysis = useCallback(async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsLoading(true);

      // Check if we have enough credits
      const credits = riskMapService.getAvailableCredits();
      if (credits <= 0) {
        setErrorMessage(
          'Insufficient credits. Please purchase more credits to generate a full analysis.',
        );
        setIsLoading(false);
        return;
      }

      // For demo purposes, run the simulation instead of actual API call
      await simulateAnalysis();

      // Analysis simulation handles credit deduction and setting showFullAnalysis to true
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating full analysis:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'An error occurred while generating the full analysis. Please try again.',
      );
      setIsLoading(false);
      setDemoAnalysisActive(false);
    }
  }, [simulateAnalysis]);

  // Check for auto-generate request
  useEffect(() => {
    // If navigation state includes autoGenerateFullReport flag, attempt to auto-generate
    if (navigationState?.autoGenerateFullReport && !showFullAnalysis && availableCredits > 0) {
      handleGenerateFullAnalysis();
    }
  }, [navigationState, showFullAnalysis, availableCredits, handleGenerateFullAnalysis]);

  // Function to handle risk map type change
  const handleRiskMapTypeChange = (type: 'unsecured' | 'equipment' | 'realestate') => {
    setRiskMapType(type);
    setShowFullAnalysis(false); // Reset analysis when type changes
    setDemoAnalysisActive(false);
    setAnalyzedParameters({});
  };

  // Function to send report to Filelock
  const handleSendToFilelock = async () => {
    try {
      setIsSendingToFilelock(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      // Simulate API call to send to Filelock
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsSendingToFilelock(false);
      setSuccessMessage(
        'Report successfully sent to Filelock Drive. You can access it in your Documents folder.',
      );
    } catch (error) {
      console.error('Error sending to Filelock:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'An error occurred while sending to Filelock. Please try again.',
      );
      setIsSendingToFilelock(false);
    }
  };

  // Function to download full report
  const handleDownloadReport = () => {
    // In a real application, this would generate a PDF or other document format
    // For now, we'll just show a success message
    setSuccessMessage('Report download started. Check your downloads folder.');

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Render the action button for the header
  const renderHeaderActions = () => (
    <div className="flex items-center">
      <div className="mr-4 text-sm text-gray-600">
        Available Credits: <span className="font-semibold">{availableCredits}</span>
      </div>

      {!showFullAnalysis && !demoAnalysisActive ? (
        <button
          onClick={handleGenerateFullAnalysis}
          disabled={isLoading || availableCredits <= 0}
          className={`px-4 py-2 ${
            isLoading || availableCredits <= 0
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-primary-600 hover:bg-primary-700'
          } flex items-center rounded-md text-white transition-colors`}
        >
          {isLoading ? (
            <>
              <svg
                className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <DocumentMagnifyingGlassIcon className="mr-2 h-5 w-5" />
              Generate Full Analysis
            </>
          )}
        </button>
      ) : showFullAnalysis ? (
        <div className="flex space-x-2">
          <button
            onClick={handleDownloadReport}
            className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <ArrowDownTrayIcon className="mr-1 h-5 w-5" />
            Download
          </button>

          <button
            onClick={handleSendToFilelock}
            disabled={isSendingToFilelock}
            className={`px-3 py-2 ${
              isSendingToFilelock
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-green-600 hover:bg-green-700'
            } flex items-center rounded-md text-white transition-colors`}
          >
            {isSendingToFilelock ? (
              <>
                <svg
                  className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg
                  className="mr-1 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Send to Filelock
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="w-full pl-20 sm:pl-72">
      <div className="container mx-auto max-w-full px-2 py-6">
        {/* Use the consistent PageHeader component */}
        <PageHeader
          title="EVA Risk Report & Score"
          description="AI-powered risk assessment and scoring for your transaction"
          actions={renderHeaderActions()}
        >
          {/* Risk Map Type Selector Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => handleRiskMapTypeChange('unsecured')}
                className={`mr-8 inline-flex items-center border-b-2 py-3 text-sm font-medium ${
                  riskMapType === 'unsecured'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <span className="mr-2 inline-block h-3 w-3 rounded-full bg-primary-100"></span>
                General
              </button>
              <button
                onClick={() => handleRiskMapTypeChange('realestate')}
                className={`mr-8 inline-flex items-center border-b-2 py-3 text-sm font-medium ${
                  riskMapType === 'realestate'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <span className="mr-2 inline-block h-3 w-3 rounded-full bg-blue-100"></span>
                Real Estate
              </button>
              <button
                onClick={() => handleRiskMapTypeChange('equipment')}
                className={`mr-8 inline-flex items-center border-b-2 py-3 text-sm font-medium ${
                  riskMapType === 'equipment'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <span className="mr-2 inline-block h-3 w-3 rounded-full bg-green-100"></span>
                Equipment & Vehicles
              </button>
            </nav>
          </div>
        </PageHeader>

        <div className="mb-6 mt-4 rounded-lg bg-white p-4 shadow">
          {errorMessage && (
            <div className="bg-red-50 mb-6 rounded-md border border-red-200 p-3 text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-green-700">
              {successMessage}
            </div>
          )}

          {/* Show analysis in progress */}
          {demoAnalysisActive && (
            <div className="mb-6">
              <AnalysisInProgress
                currentStage={analysisStage}
                progress={analysisProgress}
                mappedScores={analyzedParameters}
              />
            </div>
          )}

          {/* Show full analysis if requested */}
          {showFullAnalysis && !demoAnalysisActive ? (
            <div>
              <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Full analysis report is now available. You can download this report or send it
                      directly to Filelock Drive.
                    </p>
                  </div>
                </div>
              </div>

              <RiskScoreReport
                transactionId={transactionId || currentTransaction?.id || 'TX-123'}
                riskMapType={riskMapType}
                onPurchaseSuccess={() => setShowFullAnalysis(true)}
                onPurchaseError={error => {
                  setErrorMessage(error);
                  setShowFullAnalysis(false);
                }}
                showFullReport={true}
              />
            </div>
          ) : !demoAnalysisActive ? (
            <>
              {/* Tabs for switching between report and score views */}
              <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('report')}
                    className={`mr-4 inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium ${
                      activeTab === 'report'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <ClipboardDocumentListIcon
                      className={`-ml-0.5 mr-2 h-5 w-5 ${
                        activeTab === 'report' ? 'text-primary-500' : 'text-gray-400'
                      }`}
                    />
                    <span>Detailed Report</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('score')}
                    className={`mr-4 inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium ${
                      activeTab === 'score'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <ChartBarIcon
                      className={`-ml-0.5 mr-2 h-5 w-5 ${
                        activeTab === 'score' ? 'text-primary-500' : 'text-gray-400'
                      }`}
                    />
                    <span>Risk Score</span>
                  </button>
                </nav>
              </div>

              {/* Content based on active tab */}
              <div className="mt-6">
                {activeTab === 'report' && (
                  <div>
                    <div className="mb-6 border-l-4 border-yellow-400 bg-gray-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-yellow-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            This is a preview report. To view the complete analysis with all risk
                            variables, generate the full analysis.
                          </p>
                        </div>
                      </div>
                    </div>

                    <RiskMapEvaReport
                      transactionId={transactionId || currentTransaction?.id}
                      riskMapType={riskMapType}
                      creditSectionView="all"
                    />
                  </div>
                )}

                {activeTab === 'score' && (
                  <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <div className="mb-8 flex flex-col items-center justify-center">
                      <h2 className="mb-4 text-xl font-semibold text-gray-800">EVA Risk Score</h2>

                      {/* Risk Score Gauge - Simplified View */}
                      <div className="relative h-60 w-60">
                        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 120 120">
                          <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="12"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="url(#scoreGradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray="254.469, 339.292" // 75% of the circle (score of 75/100)
                          />
                          <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10B981" /> {/* Green */}
                              <stop offset="100%" stopColor="#3B82F6" /> {/* Blue */}
                            </linearGradient>
                          </defs>
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-5xl font-bold text-gray-800">75</span>
                          <span className="text-base text-gray-500">/100</span>
                          <div className="mt-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                            Low Risk
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Key Risk Factors */}
                    <div className="mt-8">
                      <h3 className="mb-4 text-lg font-medium text-gray-800">Key Risk Factors</h3>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-medium text-gray-700">Credit History</h4>
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                              Strong
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: '85%' }}
                            ></div>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">
                            85/100 - Excellent payment history
                          </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-medium text-gray-700">Cash Flow</h4>
                            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                              Moderate
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-yellow-500"
                              style={{ width: '65%' }}
                            ></div>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">
                            65/100 - Adequate for obligations
                          </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-medium text-gray-700">Collateral</h4>
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                              Strong
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: '90%' }}
                            ></div>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">90/100 - High quality assets</p>
                        </div>
                      </div>
                    </div>

                    {/* Risk Score Summary */}
                    <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <h3 className="mb-3 text-lg font-medium text-gray-800">
                        Risk Assessment Summary
                      </h3>
                      <p className="mb-4 text-gray-600">
                        This transaction is classified as <strong>Low Risk</strong> based on EVA's
                        analysis of credit history, financial statements, collateral quality, and
                        market conditions. The borrower demonstrates strong repayment capacity with
                        adequate cash flow to service the proposed debt.
                      </p>
                      <div className="flex justify-end">
                        <button
                          onClick={() => setActiveTab('report')}
                          className="rounded-md bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700"
                        >
                          View Full Report
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EvaRiskReportAndScore;
