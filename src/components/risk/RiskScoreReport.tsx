import React, { useState, useEffect } from 'react';
import { RiskMapType } from './RiskMapNavigator';
import riskMapService, { RiskData } from './RiskMapService';
import evaReportApi, { CategoryData, MetricData } from '../../api/evaReportApi';
import ModularLoading from '../common/ModularLoading';
import { useLoadingStatus } from '../../services/LoadingService';
import { ArrowDownTrayIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

interface RiskScoreReportProps {
  transactionId: string;
  riskMapType: RiskMapType;
  onPurchaseSuccess?: () => void;
  onPurchaseError?: (error: string) => void;
  showFullReport?: boolean;
}

const RiskScoreReport: React.FC<RiskScoreReportProps> = ({
  transactionId,
  riskMapType,
  onPurchaseSuccess,
  onPurchaseError,
  showFullReport = false,
}) => {
  // State for the combined report
  const [combinedReport, setCombinedReport] = useState<any>(null);
  const [isPurchased, setIsPurchased] = useState<boolean>(false);
  const [availableCredits, setAvailableCredits] = useState(riskMapService.getAvailableCredits());

  // New states for download and Filelock functionality
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingToFilelock, setIsSendingToFilelock] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Loading states
  const [reportStatus, reportLoadingActions] = useLoadingStatus('risk-score', 'main');

  // Purchase loading state
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    // If showFullReport is true, we automatically treat the report as purchased
    if (showFullReport) {
      setIsPurchased(true);
      loadFullReport();
    } else {
      // Check if this report was previously purchased
      const wasPurchased = riskMapService.isReportPurchased(transactionId, riskMapType);
      setIsPurchased(wasPurchased);

      if (wasPurchased) {
        loadFullReport();
      }
    }
  }, [transactionId, riskMapType, showFullReport]);

  // Load the full report
  const loadFullReport = async () => {
    try {
      reportLoadingActions.startLoading('Generating comprehensive risk report...');

      // Get the combined report data
      const data = await riskMapService.fetchFullRiskReport(transactionId, riskMapType);
      setCombinedReport(data);

      reportLoadingActions.completeLoading('Risk report generated successfully');
    } catch (error) {
      console.error('Failed to load report:', error);
      reportLoadingActions.setError('Failed to generate report. Please try again.');
    }
  };

  // Handle purchasing the report
  const handlePurchaseReport = async () => {
    try {
      setIsPurchaseLoading(true);
      setPurchaseError(null);

      // Attempt to purchase
      const success = riskMapService.purchaseReport(transactionId, riskMapType);

      if (success) {
        setIsPurchased(true);
        setAvailableCredits(riskMapService.getAvailableCredits());
        setIsPurchaseLoading(false);

        // Load the report after purchase
        await loadFullReport();

        if (onPurchaseSuccess) {
          onPurchaseSuccess();
        }
      } else {
        const errorMsg = 'Insufficient credits. Please purchase more credits.';
        setPurchaseError(errorMsg);
        setIsPurchaseLoading(false);

        if (onPurchaseError) {
          onPurchaseError(errorMsg);
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      const errorMsg = 'Failed to process purchase. Please try again.';
      setPurchaseError(errorMsg);
      setIsPurchaseLoading(false);

      if (onPurchaseError) {
        onPurchaseError('Purchase processing failed');
      }
    }
  };

  // Function to download report
  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);
      setSuccessMessage(null);

      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // In a real implementation, this would trigger a PDF or document download
      setIsDownloading(false);
      setSuccessMessage('Report download started. Check your downloads folder.');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
    }
  };

  // Function to send report to Filelock
  const handleSendToFilelock = async () => {
    try {
      setIsSendingToFilelock(true);
      setSuccessMessage(null);

      // Simulate API call to send to Filelock
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsSendingToFilelock(false);
      setSuccessMessage(
        'Report successfully sent to Filelock Drive. You can access it in your Documents folder.'
      );

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error sending to Filelock:', error);
      setIsSendingToFilelock(false);
    }
  };

  // Render the metric items
  const renderMetricItem = (metric: MetricData) => {
    return (
      <div className="mb-3 pb-3 border-b border-gray-100">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-600">{metric.name}</span>
          <span
            className={`text-sm font-semibold ${
              metric.status === 'good'
                ? 'text-green-600'
                : metric.status === 'average'
                  ? 'text-yellow-600'
                  : 'text-red-600'
            }`}
          >
            {metric.value}
          </span>
        </div>
        {metric.description && <p className="text-xs text-gray-500 mt-1">{metric.description}</p>}
        {metric.source && <p className="text-xs text-gray-400 mt-1">Source: {metric.source}</p>}
      </div>
    );
  };

  // Purchase block component
  const renderPurchaseBlock = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Premium Report Required</h3>
          <p className="mt-1 text-sm text-gray-600">
            Access the full EVA AI risk analysis and detailed report.
          </p>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Report includes:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-start">
                <svg
                  className="h-4 w-4 text-green-500 mt-0.5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>Complete risk score breakdown</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-4 w-4 text-green-500 mt-0.5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>Detailed metrics for each risk category</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-4 w-4 text-green-500 mt-0.5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>EVA AI analysis and recommendations</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-4 w-4 text-green-500 mt-0.5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>Export to PDF and Filelock integration</span>
              </li>
            </ul>
          </div>

          <div className="mt-5">
            <div className="flex justify-center items-center mb-3">
              <span className="text-sm text-gray-600 mr-2">Available Credits:</span>
              <span className="text-sm font-semibold">{availableCredits}</span>
            </div>

            <button
              onClick={handlePurchaseReport}
              disabled={isPurchaseLoading || availableCredits <= 0}
              className={`w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isPurchaseLoading || availableCredits <= 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isPurchaseLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Processing Purchase...
                </>
              ) : availableCredits <= 0 ? (
                'Insufficient Credits'
              ) : (
                'Purchase Full Report (1 Credit)'
              )}
            </button>

            {purchaseError && <p className="mt-2 text-sm text-red-600">{purchaseError}</p>}
          </div>
        </div>
      </div>
    );
  };

  // Show purchase prompt if not purchased yet
  if (!isPurchased && !showFullReport) {
    return renderPurchaseBlock();
  }

  // Show loading state
  if (reportStatus.state === 'loading' || !combinedReport) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <ModularLoading
          status={reportStatus}
          theme="red"
          spinnerType="circle"
          size="full"
          className="py-12"
          showThoughtProcess={true}
        />
      </div>
    );
  }

  // Show error state
  if (reportStatus.state === 'error') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error Loading Report</h3>
          <p className="mt-1 text-sm text-gray-600">{reportStatus.error}</p>
          <div className="mt-4">
            <button
              onClick={loadFullReport}
              className="px-4 py-2 bg-red-600 text-sm font-medium rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the full report
  const { reportDetails } = combinedReport;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      {successMessage && (
        <div className="m-6 mb-0 bg-green-50 text-green-700 p-3 rounded-md border border-green-200">
          {successMessage}
        </div>
      )}

      {/* Report header with premium badge */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          EVA AI Risk Analysis & Detailed Report
        </h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Premium
        </span>
      </div>

      {/* Overall score section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Overall Risk Assessment</h3>
            <p className="text-gray-600 mb-4">
              Comprehensive analysis based on all available data points and EVA AI evaluation.
            </p>
          </div>

          <div className="flex items-center">
            <div className="text-center mr-8">
              <div className="text-sm font-medium text-gray-500 mb-1">Overall Score</div>
              <div className="text-3xl font-bold text-gray-900">{combinedReport.score}</div>
            </div>

            <div className="text-center mr-8">
              <div className="text-sm font-medium text-gray-500 mb-1">Industry Avg</div>
              <div className="text-3xl font-bold text-gray-900">{combinedReport.industry_avg}</div>
            </div>

            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 mb-1">Confidence</div>
              <div className="text-3xl font-bold text-gray-900">{combinedReport.confidence}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key findings section */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Key Findings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {combinedReport.findings.map((finding: any, index: number) => (
            <div key={index} className="flex items-start bg-gray-50 p-3 rounded-lg">
              <svg
                className={`h-5 w-5 ${
                  finding.type === 'positive'
                    ? 'text-green-500'
                    : finding.type === 'warning'
                      ? 'text-yellow-500'
                      : 'text-red-500'
                } mr-2 mt-0.5`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {finding.type === 'positive' ? (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                ) : finding.type === 'warning' ? (
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  ></path>
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  ></path>
                )}
              </svg>
              <span className="text-sm">{finding.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed category metrics */}
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Risk Categories</h3>

        <div className="grid grid-cols-1 gap-6">
          {Object.entries(reportDetails.categories).map(
            ([category, data]: [string, any]) =>
              category !== 'all' && (
                <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h4 className="text-md font-medium text-gray-900">{data.title}</h4>
                      <div className="flex items-center">
                        <span className="text-sm font-semibold mr-2">Score:</span>
                        <span
                          className={`text-sm font-bold ${
                            reportDetails.riskScores[category] >= 80
                              ? 'text-green-600'
                              : reportDetails.riskScores[category] >= 60
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}
                        >
                          {reportDetails.riskScores[category]}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{data.description}</p>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.metrics.map((metric: MetricData, index: number) => (
                        <div key={index}>{renderMetricItem(metric)}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )
          )}
        </div>
      </div>

      {/* Actions section */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end items-center space-x-3">
        <button
          onClick={handleDownloadReport}
          disabled={isDownloading}
          className={`px-3 py-2 ${
            isDownloading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-md flex items-center transition-colors`}
        >
          {isDownloading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Downloading...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="w-5 h-5 mr-1" />
              Download Report
            </>
          )}
        </button>

        <button
          onClick={handleSendToFilelock}
          disabled={isSendingToFilelock}
          className={`px-3 py-2 ${
            isSendingToFilelock
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          } text-white rounded-md flex items-center transition-colors`}
        >
          {isSendingToFilelock ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              <DocumentArrowUpIcon className="w-5 h-5 mr-1" />
              Send to Filelock
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default RiskScoreReport;
