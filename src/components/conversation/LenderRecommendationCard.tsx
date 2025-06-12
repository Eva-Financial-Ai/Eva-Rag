import React from 'react';
import { SmartMatchRecommendation } from '../../types/conversation';

interface LenderRecommendationCardProps {
  recommendation: SmartMatchRecommendation;
  rank: number;
  onSelect: () => void;
}

const LenderRecommendationCard: React.FC<LenderRecommendationCardProps> = ({
  recommendation,
  rank,
  onSelect
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
            #{rank}
          </span>
          <h4 className="font-semibold">{recommendation.lenderName}</h4>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-green-600">
            {recommendation.approvalProbability}% approval
          </div>
          <div className="text-xs text-gray-500">
            {recommendation.timeToClose} days to close
          </div>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Est. Rate:</span>
          <span className="font-medium">{recommendation.estimatedRate}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Terms:</span>
          <span className="font-medium">{recommendation.estimatedTerms}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <h5 className="text-xs font-semibold text-gray-700 mb-2">Key Advantages:</h5>
        <ul className="text-xs text-gray-600 space-y-1">
          {recommendation.advantages.slice(0, 3).map((advantage, index) => (
            <li key={index} className="flex items-center gap-1">
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              {advantage}
            </li>
          ))}
        </ul>
      </div>
      
      {recommendation.competitiveEdge && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-4">
          <div className="text-xs font-medium text-yellow-800">🚀 Competitive Edge:</div>
          <div className="text-xs text-yellow-700">{recommendation.competitiveEdge}</div>
        </div>
      )}
      
      <button
        onClick={onSelect}
        className="w-full bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
      >
        Submit to {recommendation.lenderName}
      </button>
    </div>
  );
};

export { LenderRecommendationCard };
export default LenderRecommendationCard; 