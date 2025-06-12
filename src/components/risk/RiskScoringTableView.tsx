import React from 'react';
import { DEFAULT_RANGES } from './RiskRangesConfigEditor';

interface RiskScoringTableViewProps {
  loanType?: 'general' | 'equipment' | 'realestate';
}

const RiskScoringTableView: React.FC<RiskScoringTableViewProps> = ({ 
  loanType = 'general' 
}) => {
  // Get relevant categories based on loan type
  const getRelevantCategories = () => {
    const categories = Object.entries(DEFAULT_RANGES);
    return categories.filter(([key, config]) => {
      const weight = config.weight[loanType] || config.weight.general || 0;
      return weight > 0;
    });
  };

  const relevantCategories = getRelevantCategories();

  return (
    <div className="space-y-8">
      {relevantCategories.map(([categoryId, config]) => (
        <div key={categoryId} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              Equifax One Score, Paynet API, Dunns & Bradstreet, Experian, LexisNexis
            </p>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900"></th>
                    <th className="text-center py-3 px-4 font-medium text-green-600">Good</th>
                    <th className="text-center py-3 px-4 font-medium text-yellow-600">Average</th>
                    <th className="text-center py-3 px-4 font-medium text-red-600">Negative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {config.metrics.map((metric) => (
                    <React.Fragment key={metric.id}>
                      {/* Min Value Row */}
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">Min Value</td>
                        <td className="text-center py-3 px-4 text-sm text-gray-700">
                          {metric.good.min}
                        </td>
                        <td className="text-center py-3 px-4 text-sm text-gray-700">
                          {metric.average.min}
                        </td>
                        <td className="text-center py-3 px-4 text-sm text-gray-700">
                          {metric.negative.min}
                        </td>
                      </tr>
                      
                      {/* Max Value Row */}
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">Max Value</td>
                        <td className="text-center py-3 px-4 text-sm text-gray-700">
                          {metric.good.max === 999 ? '999' : metric.good.max}
                        </td>
                        <td className="text-center py-3 px-4 text-sm text-gray-700">
                          {metric.average.max === 999 ? '999' : metric.average.max}
                        </td>
                        <td className="text-center py-3 px-4 text-sm text-gray-700">
                          {metric.negative.max === 999 ? '999' : metric.negative.max}
                        </td>
                      </tr>
                      
                      {/* Points Row */}
                      <tr className="hover:bg-gray-50 border-b-2 border-gray-200">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">Points</td>
                        <td className="text-center py-3 px-4 text-sm font-semibold text-green-600">
                          {metric.points.good}
                        </td>
                        <td className="text-center py-3 px-4 text-sm font-semibold text-yellow-600">
                          {metric.points.average}
                        </td>
                        <td className="text-center py-3 px-4 text-sm font-semibold text-red-600">
                          {metric.points.negative}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
      
      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-8">
        <button className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
          Approve & Continue to Transaction Structuring
        </button>
        <button className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
          Human in the Loop - Request Call
        </button>
        <button className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
          Hard Decline
        </button>
        <button className="px-6 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors">
          Soft Decline
        </button>
      </div>
      
      {/* Save Configuration Button */}
      <div className="flex justify-end mt-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Save Configuration & Run Assessment
        </button>
      </div>
    </div>
  );
};

export default RiskScoringTableView; 