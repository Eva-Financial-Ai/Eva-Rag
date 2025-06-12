import React from 'react';
import { DocumentTextIcon, TableCellsIcon, LightBulbIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { RiskData, EvaReportData } from './RiskMapService'; // Assuming RiskData and EvaReportData are defined here

interface FullEvaReportProps {
  reportData: (RiskData | EvaReportData) & { reportDetails?: any; isPremium?: boolean }; // Combined type
  smartMatchResults?: any[]; // Optional Smart Match results
}

const FullEvaReport: React.FC<FullEvaReportProps> = ({ reportData, smartMatchResults }) => {
  const { score, industry_avg, confidence, categories, findings, reportDetails, isPremium } = reportData;
  const filelockInfo = (reportData as EvaReportData).filelockInfo;

  const getCategoryScore = (catKey: string) => {
    return categories[catKey]?.score || 0;
  };

  const getCategoryStatusColor = (catKey: string) => {
    const status = categories[catKey]?.status;
    if (status === 'green') return 'bg-green-500';
    if (status === 'yellow') return 'bg-yellow-500';
    if (status === 'red') return 'bg-red-500';
    return 'bg-gray-300';
  };

  // PDF Download Button
  const PdfDownloadButton = () => {
    if (filelockInfo && filelockInfo.viewUrl) {
      return (
        <div className="mt-8 text-center">
          <a
            href={filelockInfo.viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            download // Suggests to the browser to download the linked URL
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <DocumentArrowDownIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
            Download Full PDF Report
          </a>
        </div>
      );
    } else {
      return (
        <div className="mt-8 text-center">
          <button
            type="button"
            disabled
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-400 bg-gray-100 cursor-not-allowed"
          >
            <DocumentTextIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
            PDF Report Not Available
          </button>
          <p className="mt-2 text-sm text-gray-500">The PDF report is not yet available for download.</p>
        </div>
      );
    }
  };

  const SmartMatchResultsDisplay = () => {
    if (!smartMatchResults || smartMatchResults.length === 0) {
      return <p className="text-gray-600 italic">No Smart Match results available for this transaction.</p>;
    }
    return (
      <div className="space-y-4">
        {smartMatchResults.map((match, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <h4 className="font-semibold text-primary-700">{match.lenderName}</h4>
            <p className="text-sm text-gray-600">Match Score: {match.matchScore}% - Interest Rate: {match.interestRate}% - Loan Amount: ${match.loanAmount.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{match.notes}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-primary-50 rounded-lg text-center">
          <div className="text-5xl font-bold text-primary-600">{score}</div>
          <div className="text-sm text-primary-700">Overall EVA Score</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <div className="text-3xl font-semibold text-gray-700">{industry_avg}</div>
          <div className="text-sm text-gray-500">Industry Average</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <div className="text-3xl font-semibold text-gray-700">{confidence}%</div>
          <div className="text-sm text-gray-500">Confidence Level</div>
        </div>
      </div>

      {isPremium && (
        <div className="mb-6 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
          This is a Premium Full EVA Report. All details are unlocked.
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
          <TableCellsIcon className="w-6 h-6 mr-2 text-primary-600" />
          Risk Categories Breakdown
        </h3>
        <div className="space-y-3">
          {Object.keys(categories).map(catKey => (
            <div key={catKey} className="p-3 border border-gray-200 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 capitalize">{catKey.replace('_', ' ')}</span>
                <span className={`px-2 py-0.5 text-xs font-semibold text-white rounded-full ${getCategoryStatusColor(catKey)}`}>
                  {categories[catKey].status.toUpperCase()}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-800 mt-1">{getCategoryScore(catKey)} / 100</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
          <LightBulbIcon className="w-6 h-6 mr-2 text-yellow-500" />
          Key Findings & Insights
        </h3>
        {findings && findings.length > 0 ? (
          <ul className="space-y-2">
            {findings.map((finding, index) => (
              <li key={index} className={`p-3 rounded-md text-sm flex items-start ${
                finding.type === 'positive' ? 'bg-green-50 text-green-700' :
                finding.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                'bg-red-50 text-red-700'
              }`}>
                <span className="font-bold mr-2">{finding.type.toUpperCase()}:</span>
                <span>{finding.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 italic">No specific findings for this report.</p>
        )}
      </div>

      {reportDetails && reportDetails.categories && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Report Sections</h3>
          <div className="space-y-6">
            {Object.entries(reportDetails.categories).map(([categoryKey, categoryValue]: [string, any]) => {
              // Skip the 'all' category if it's just a summary or doesn't have metrics
              if (categoryKey === 'all' && (!categoryValue.metrics || categoryValue.metrics.length === 0)) {
                return null;
              }
              return (
                <div key={categoryKey} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <h4 className="text-lg font-semibold text-primary-700 mb-1 capitalize">
                    {categoryValue.title || categoryKey.replace(/_/g, ' ')}
                  </h4>
                  {categoryValue.description && (
                    <p className="text-sm text-gray-600 mb-3">{categoryValue.description}</p>
                  )}
                  {categoryValue.metrics && Array.isArray(categoryValue.metrics) && categoryValue.metrics.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Metric Name
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Value
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Source
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {categoryValue.metrics.map((metric: any, index: number) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{metric.name || '-'}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{metric.value || '-'}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                {metric.status ? (
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    metric.status.toLowerCase() === 'good' ? 'bg-green-100 text-green-800' :
                                    metric.status.toLowerCase() === 'average' || metric.status.toLowerCase() === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                    metric.status.toLowerCase() === 'negative' || metric.status.toLowerCase() === 'bad' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {metric.status}
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{metric.source || '-'}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{metric.description || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {(!categoryValue.metrics || categoryValue.metrics.length === 0) && (
                     <p className="text-sm text-gray-500 italic">No detailed metrics available for this category.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <PdfDownloadButton />

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
          <LightBulbIcon className="w-6 h-6 mr-2 text-blue-500" />
          Smart Match Results
        </h3>
        <SmartMatchResultsDisplay />
      </div>

    </div>
  );
};

export default FullEvaReport; 