import React, { useState } from 'react';
import { Zap, TrendingUp } from '../../utils/mockIcons';
import { TransactionConversation, SmartMatchRecommendation } from '../../types/conversation';

interface SmartMatchPanelProps {
  conversation: TransactionConversation;
  onSelectLender: (recommendation: SmartMatchRecommendation) => void;
}

// Mock recommendations for demo purposes
const mockRecommendations: SmartMatchRecommendation[] = [
  {
    id: '1',
    lenderName: 'First National Bank',
    approvalProbability: 92,
    estimatedRate: 5.25,
    estimatedTerms: '60 months, no prepayment penalty',
    timeToClose: 5,
    advantages: [
      'Fastest closing time',
      'Simple documentation requirements',
      'Quick credit decision process'
    ],
    requirements: ['Personal guarantee', '2 years tax returns', 'Current financial statements'],
    competitiveEdge: 'Their process is 60% faster than industry average'
  },
  {
    id: '2',
    lenderName: 'Capital Funding Partners',
    approvalProbability: 88,
    estimatedRate: 4.95,
    estimatedTerms: '60 months, 1% prepayment penalty',
    timeToClose: 7,
    advantages: [
      'Lowest rate available',
      'Flexible collateral requirements',
      'Higher approval amount potential'
    ],
    requirements: ['Personal guarantee', '3 years tax returns', 'Business plan'],
    competitiveEdge: 'Rate is 0.25% lower than nearest competitor'
  },
  {
    id: '3',
    lenderName: 'Growth Point Lending',
    approvalProbability: 82,
    estimatedRate: 5.15,
    estimatedTerms: '72 months, flexible payment structure',
    timeToClose: 8,
    advantages: [
      'Longest term available',
      'Seasonal payment options',
      'Lower monthly payments'
    ],
    requirements: ['Personal guarantee', '2 years tax returns', 'Collateral'],
    competitiveEdge: 'Only lender offering seasonal payment flexibility'
  }
];

// Internal component for lender recommendation cards
const LenderRecommendationCard: React.FC<{
  recommendation: SmartMatchRecommendation;
  rank: number;
  onSelect: (recommendation: SmartMatchRecommendation) => void;
}> = ({ recommendation, rank, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColor(rank)}`}>
            Match #{rank} - {recommendation.approvalProbability}% Match
          </span>
          <span className="text-sm text-gray-500">
            {recommendation.timeToClose} days to close
          </span>
        </div>
        
        <h3 className="text-lg font-semibold mb-1">{recommendation.lenderName}</h3>
        <div className="text-sm text-gray-700 mb-3">
          <div className="flex justify-between mt-1">
            <span>Est. Rate:</span>
            <span className="font-medium">{recommendation.estimatedRate}%</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Terms:</span>
            <span className="font-medium">{recommendation.estimatedTerms}</span>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <div className="mb-3">
              <h4 className="text-sm font-medium mb-1">Key Advantages</h4>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {recommendation.advantages.map((advantage, index) => (
                  <li key={index}>{advantage}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Requirements</h4>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {recommendation.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
            
            <div className="mt-3 bg-blue-50 text-blue-800 p-2 rounded-md text-sm">
              <strong>Competitive Edge:</strong> {recommendation.competitiveEdge}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex border-t border-gray-200">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 py-2 px-3 text-sm text-gray-600 hover:bg-gray-50"
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
        <button
          onClick={() => onSelect(recommendation)}
          className="flex-1 py-2 px-3 text-sm bg-blue-600 text-white hover:bg-blue-700"
        >
          Submit to Lender
        </button>
      </div>
    </div>
  );
};

const SmartMatchPanel: React.FC<SmartMatchPanelProps> = ({
  conversation,
  onSelectLender
}) => {
  const [recommendations, setRecommendations] = useState<SmartMatchRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getSmartMatches = async () => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, we would call an API here
    setRecommendations(mockRecommendations);
    setIsLoading(false);
  };

  return (
    <div className="border-t border-gray-200 bg-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">EVA Smart Match</h3>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Competitive Advantage
            </span>
          </div>
          <button
            onClick={getSmartMatches}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Finding Matches...' : 'Get Smart Matches'}
          </button>
        </div>
        
        {recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {recommendations.map((recommendation, index) => (
              <LenderRecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                rank={index + 1}
                onSelect={() => onSelectLender(recommendation)}
              />
            ))}
          </div>
        )}
        
        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">Speed Advantage:</span>
            <span>EVA's AI matching reduces deal time by 60% on average</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SmartMatchPanel };
export default SmartMatchPanel; 