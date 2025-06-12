import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { UserRole } from '../../types/user';

// === TYPES AND INTERFACES ===

export type TransactionRole = 'facilitator' | 'originator' | 'secondary';
export type MatchAction = 'hard_decline' | 'info_request' | 'soft_approval' | 'hard_approval';
export type InstrumentType =
  | 'term_loan'
  | 'line_of_credit'
  | 'equipment_finance'
  | 'real_estate'
  | 'working_capital'
  | 'trade_finance';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface RiskLabCriteria {
  id: string;
  name: string;
  weight: number; // 0-100
  category: 'creditworthiness' | 'financial' | 'cashflow' | 'legal' | 'collateral' | 'industry';
  threshold: {
    hard_approval: number; // Score needed for immediate approval
    soft_approval: number; // Score needed for conditional approval
    info_request: number; // Score requiring additional info
    hard_decline: number; // Score triggering decline
  };
  dataSource:
    | 'credit_bureau'
    | 'financial_statements'
    | 'bank_statements'
    | 'documents'
    | 'ai_analysis';
  isCustom: boolean;
}

export interface MatchResult {
  id: string;
  borrowerName: string;
  dealAmount: number;
  instrumentType: InstrumentType;
  matchScore: number; // 0-100 overall match score
  riskScore: number; // 0-100 risk assessment score
  recommendedAction: MatchAction;
  confidence: number; // 0-100 confidence in recommendation

  // Financial terms
  proposedRate: number;
  proposedTerm: number; // months
  downPaymentRequired: number;
  monthlyPayment: number;

  // Risk breakdown by category
  riskBreakdown: {
    creditworthiness: number;
    financial: number;
    cashflow: number;
    legal: number;
    collateral: number;
    industry: number;
  };

  // Supporting information
  strengths: string[];
  concerns: string[];
  requiredDocuments: string[];
  contingencies: string[];

  // Transaction roles
  facilitator?: string; // Assigned facilitator ID
  contacts: {
    borrower: string;
    originator: string;
    facilitator?: string;
  };

  // Timestamps
  submittedAt: string;
  lastUpdated: string;
  expiresAt: string;
}

interface SmartMatchConfig {
  instrumentTypes: InstrumentType[];
  riskCriteria: RiskLabCriteria[];
  customWeights: { [category: string]: number };
  autoApprovalThreshold: number; // Score for automatic hard approval
  declineThreshold: number; // Score for automatic hard decline
  maxDealSize: number;
  requiresManualReview: string[]; // Industry codes requiring manual review
}

interface SmartMatchEngineProps {
  userRole: UserRole;
  onMatchSelected?: (match: MatchResult) => void;
  onConfigChanged?: (config: SmartMatchConfig) => void;
  className?: string;
}

// === DEFAULT CONFIGURATIONS ===

const DEFAULT_RISK_CRITERIA: RiskLabCriteria[] = [
  {
    id: 'credit_score',
    name: 'Personal Credit Score',
    weight: 25,
    category: 'creditworthiness',
    threshold: { hard_approval: 750, soft_approval: 680, info_request: 620, hard_decline: 580 },
    dataSource: 'credit_bureau',
    isCustom: false,
  },
  {
    id: 'business_credit',
    name: 'Business Credit Profile',
    weight: 15,
    category: 'creditworthiness',
    threshold: { hard_approval: 80, soft_approval: 65, info_request: 50, hard_decline: 30 },
    dataSource: 'credit_bureau',
    isCustom: false,
  },
  {
    id: 'debt_service_coverage',
    name: 'Debt Service Coverage Ratio',
    weight: 20,
    category: 'financial',
    threshold: { hard_approval: 1.5, soft_approval: 1.25, info_request: 1.0, hard_decline: 0.8 },
    dataSource: 'financial_statements',
    isCustom: false,
  },
  {
    id: 'operating_cashflow',
    name: 'Operating Cash Flow Trend',
    weight: 15,
    category: 'cashflow',
    threshold: { hard_approval: 85, soft_approval: 70, info_request: 55, hard_decline: 40 },
    dataSource: 'bank_statements',
    isCustom: false,
  },
  {
    id: 'time_in_business',
    name: 'Years in Business',
    weight: 10,
    category: 'legal',
    threshold: { hard_approval: 5, soft_approval: 3, info_request: 2, hard_decline: 1 },
    dataSource: 'documents',
    isCustom: false,
  },
  {
    id: 'collateral_coverage',
    name: 'Collateral Coverage Ratio',
    weight: 15,
    category: 'collateral',
    threshold: { hard_approval: 150, soft_approval: 120, info_request: 100, hard_decline: 80 },
    dataSource: 'ai_analysis',
    isCustom: false,
  },
];

const MOCK_MATCH_RESULTS: MatchResult[] = [
  {
    id: 'match_001',
    borrowerName: 'Sage Technologies LLC',
    dealAmount: 1500000,
    instrumentType: 'equipment_finance',
    matchScore: 92,
    riskScore: 88,
    recommendedAction: 'hard_approval',
    confidence: 94,
    proposedRate: 5.75,
    proposedTerm: 60,
    downPaymentRequired: 150000,
    monthlyPayment: 23500,
    riskBreakdown: {
      creditworthiness: 90,
      financial: 88,
      cashflow: 85,
      legal: 92,
      collateral: 95,
      industry: 87,
    },
    strengths: [
      'Excellent credit profile (780 FICO)',
      'Strong cash flow history (3+ years)',
      'High-value equipment collateral',
      'Established business (8 years)',
    ],
    concerns: ['Industry cyclical trends', 'Geographic concentration risk'],
    requiredDocuments: ['Equipment appraisal', 'Insurance certificate'],
    contingencies: ['Final equipment inspection', 'UCC filing'],
    contacts: {
      borrower: 'John Smith, CFO',
      originator: 'Sarah Wilson, Broker',
      facilitator: 'Mike Chen, Senior Lender',
    },
    submittedAt: '2024-01-20T10:30:00Z',
    lastUpdated: '2024-01-20T14:15:00Z',
    expiresAt: '2024-01-27T10:30:00Z',
  },
  {
    id: 'match_002',
    borrowerName: 'Malhi Trucking LLC',
    dealAmount: 850000,
    instrumentType: 'equipment_finance',
    matchScore: 78,
    riskScore: 72,
    recommendedAction: 'soft_approval',
    confidence: 82,
    proposedRate: 7.25,
    proposedTerm: 72,
    downPaymentRequired: 127500,
    monthlyPayment: 14200,
    riskBreakdown: {
      creditworthiness: 75,
      financial: 68,
      cashflow: 72,
      legal: 85,
      collateral: 80,
      industry: 65,
    },
    strengths: [
      'Good payment history',
      'Strong collateral value',
      'Essential industry (transportation)',
    ],
    concerns: [
      'Moderate credit score (695 FICO)',
      'Seasonal cash flow variations',
      'High fuel cost exposure',
    ],
    requiredDocuments: ['3 years tax returns', 'Truck appraisals', 'Insurance certificates'],
    contingencies: ['Fuel hedging agreement', 'Monthly financial reporting'],
    contacts: {
      borrower: 'Harpreet Malhi, Owner',
      originator: 'David Park, Broker',
    },
    submittedAt: '2024-01-20T09:45:00Z',
    lastUpdated: '2024-01-20T13:22:00Z',
    expiresAt: '2024-01-27T09:45:00Z',
  },
  {
    id: 'match_003',
    borrowerName: 'Aroma 360 LLC',
    dealAmount: 500000,
    instrumentType: 'working_capital',
    matchScore: 65,
    riskScore: 58,
    recommendedAction: 'info_request',
    confidence: 71,
    proposedRate: 9.5,
    proposedTerm: 36,
    downPaymentRequired: 100000,
    monthlyPayment: 18750,
    riskBreakdown: {
      creditworthiness: 62,
      financial: 55,
      cashflow: 58,
      legal: 70,
      collateral: 45,
      industry: 68,
    },
    strengths: ['Growing market segment', 'Unique product offering', 'Strong brand recognition'],
    concerns: [
      'Limited operating history (2 years)',
      'Inconsistent monthly revenues',
      'Limited collateral available',
      'High customer concentration',
    ],
    requiredDocuments: [
      'Detailed business plan',
      '2 years monthly P&L',
      'Customer contracts',
      'Inventory reports',
      'Personal guarantor information',
    ],
    contingencies: [
      'Personal guarantee required',
      'Monthly reporting covenant',
      'Revenue diversification plan',
    ],
    contacts: {
      borrower: 'Alex Chen, Founder',
      originator: 'Lisa Rodriguez, Loan Officer',
    },
    submittedAt: '2024-01-20T11:15:00Z',
    lastUpdated: '2024-01-20T15:30:00Z',
    expiresAt: '2024-01-27T11:15:00Z',
  },
  {
    id: 'match_004',
    borrowerName: 'Coastal Construction LLC',
    dealAmount: 250000,
    instrumentType: 'line_of_credit',
    matchScore: 45,
    riskScore: 38,
    recommendedAction: 'hard_decline',
    confidence: 89,
    proposedRate: 0,
    proposedTerm: 0,
    downPaymentRequired: 0,
    monthlyPayment: 0,
    riskBreakdown: {
      creditworthiness: 42,
      financial: 35,
      cashflow: 38,
      legal: 45,
      collateral: 30,
      industry: 40,
    },
    strengths: ['Local market presence', 'Experienced management'],
    concerns: [
      'Poor credit history (580 FICO)',
      'Negative cash flow (6 months)',
      'High debt-to-income ratio',
      'Industry downturn exposure',
      'Limited collateral value',
      'Recent payment defaults',
    ],
    requiredDocuments: [],
    contingencies: [],
    contacts: {
      borrower: 'Tom Wilson, Owner',
      originator: 'Jennifer Adams, Broker',
    },
    submittedAt: '2024-01-20T08:30:00Z',
    lastUpdated: '2024-01-20T16:45:00Z',
    expiresAt: '2024-01-27T08:30:00Z',
  },
];

// === MAIN COMPONENT ===

const SmartMatchEngine: React.FC<SmartMatchEngineProps> = ({
  userRole,
  onMatchSelected,
  onConfigChanged,
  className = '',
}) => {
  const navigate = useNavigate();

  // State management
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'matches' | 'config' | 'analytics'>('matches');
  const [selectedAction, setSelectedAction] = useState<MatchAction | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  // Configuration state
  const [config, setConfig] = useState<SmartMatchConfig>({
    instrumentTypes: ['equipment_finance', 'working_capital', 'term_loan'],
    riskCriteria: DEFAULT_RISK_CRITERIA,
    customWeights: {
      creditworthiness: 40,
      financial: 20,
      cashflow: 15,
      legal: 10,
      collateral: 10,
      industry: 5,
    },
    autoApprovalThreshold: 85,
    declineThreshold: 50,
    maxDealSize: 5000000,
    requiresManualReview: ['construction', 'hospitality', 'retail'],
  });

  const loadMatches = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMatches(MOCK_MATCH_RESULTS);
    } catch (error) {
      toast.error('Failed to load matches');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load matches on component mount
  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Calculate match statistics
  const matchStats = useMemo(() => {
    const total = matches.length;
    const hardApprovals = matches.filter(m => m.recommendedAction === 'hard_approval').length;
    const softApprovals = matches.filter(m => m.recommendedAction === 'soft_approval').length;
    const infoRequests = matches.filter(m => m.recommendedAction === 'info_request').length;
    const hardDeclines = matches.filter(m => m.recommendedAction === 'hard_decline').length;

    const totalVolume = matches.reduce((sum, m) => sum + m.dealAmount, 0);
    const avgMatchScore = matches.reduce((sum, m) => sum + m.matchScore, 0) / total || 0;

    return {
      total,
      hardApprovals,
      softApprovals,
      infoRequests,
      hardDeclines,
      totalVolume,
      avgMatchScore: Math.round(avgMatchScore),
    };
  }, [matches]);

  // Handle match action
  const handleMatchAction = async (match: MatchResult, action: MatchAction) => {
    setSelectedMatch(match);
    setSelectedAction(action);
    setShowActionModal(true);
  };

  // Process the selected action
  const processAction = async () => {
    if (!selectedMatch || !selectedAction) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      switch (selectedAction) {
        case 'hard_decline':
          toast.error(`Deal ${selectedMatch.borrowerName} has been declined`);
          break;
        case 'info_request':
          toast.info(`Information request sent to ${selectedMatch.borrowerName}`);
          break;
        case 'soft_approval':
          toast.success(`Soft approval issued for ${selectedMatch.borrowerName}`);
          break;
        case 'hard_approval':
          toast.success(`Hard approval granted for ${selectedMatch.borrowerName}`);
          // Navigate to structure editor
          navigate('/deal-structuring/editor', {
            state: {
              matchId: selectedMatch.id,
              dealAmount: selectedMatch.dealAmount,
              approvedTerms: {
                rate: selectedMatch.proposedRate,
                term: selectedMatch.proposedTerm,
                downPayment: selectedMatch.downPaymentRequired,
              },
            },
          });
          break;
      }

      // Update match status
      setMatches(prev =>
        prev.map(m =>
          m.id === selectedMatch.id
            ? { ...m, recommendedAction: selectedAction, lastUpdated: new Date().toISOString() }
            : m,
        ),
      );

      setShowActionModal(false);
      setSelectedMatch(null);
      setSelectedAction(null);
    } catch (error) {
      toast.error('Failed to process action');
    } finally {
      setIsLoading(false);
    }
  };

  // Get action button color
  const getActionColor = (action: MatchAction) => {
    switch (action) {
      case 'hard_decline':
        return 'bg-red-600 hover:bg-red-700';
      case 'info_request':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'soft_approval':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'hard_approval':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  // Get risk level color
  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-green-800 bg-green-50';
    if (score >= 65) return 'text-gray-800 bg-blue-50';
    if (score >= 50) return 'text-yellow-800 bg-yellow-50';
    return 'text-red-800 bg-red-50';
  };

  // Render match card
  const renderMatchCard = (match: MatchResult) => (
    <div
      key={match.id}
      className="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{match.borrowerName}</h3>
            <p className="text-sm text-gray-600">
              ${match.dealAmount.toLocaleString()} • {match.instrumentType.replace('_', ' ')}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`inline-flex items-center rounded px-2 py-1 text-sm font-medium ${getRiskColor(match.riskScore)}`}
            >
              Risk: {match.riskScore}
            </div>
          </div>
        </div>

        {/* Match Score and Confidence */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-gray-800">{match.matchScore}%</div>
            <div className="text-sm text-gray-600">Match Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-700">{match.confidence}%</div>
            <div className="text-sm text-gray-600">Confidence</div>
          </div>
        </div>

        {/* Risk Breakdown */}
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium text-gray-700">Risk Breakdown</h4>
          <div className="space-y-1">
            {Object.entries(match.riskBreakdown).map(([category, score]) => (
              <div key={category} className="flex items-center justify-between text-sm">
                <span className="capitalize text-gray-600">{category}</span>
                <span
                  className={`font-medium ${score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}
                >
                  {score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Proposed Terms */}
        {match.recommendedAction !== 'hard_decline' && (
          <div className="mb-4 rounded bg-gray-50 p-3">
            <h4 className="mb-2 text-sm font-medium text-gray-700">Proposed Terms</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Rate: {match.proposedRate}%</div>
              <div>Term: {match.proposedTerm} months</div>
              <div>Down: ${match.downPaymentRequired.toLocaleString()}</div>
              <div>Payment: ${match.monthlyPayment.toLocaleString()}/mo</div>
            </div>
          </div>
        )}

        {/* Strengths and Concerns */}
        <div className="mb-4">
          {match.strengths.length > 0 && (
            <div className="mb-2">
              <h4 className="mb-1 text-sm font-medium text-green-700">Strengths</h4>
              <ul className="space-y-1 text-xs text-gray-600">
                {match.strengths.slice(0, 2).map((strength, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-1 text-green-500">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {match.concerns.length > 0 && (
            <div>
              <h4 className="mb-1 text-sm font-medium text-red-700">Concerns</h4>
              <ul className="space-y-1 text-xs text-gray-600">
                {match.concerns.slice(0, 2).map((concern, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-1 text-red-500">•</span>
                    {concern}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleMatchAction(match, 'hard_decline')}
            className="bg-red-600 flex-1 rounded px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Hard Decline
          </button>
          <button
            onClick={() => handleMatchAction(match, 'info_request')}
            className="flex-1 rounded bg-yellow-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700"
          >
            Request Info
          </button>
          <button
            onClick={() => handleMatchAction(match, 'soft_approval')}
            className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Soft Approval
          </button>
          <button
            onClick={() => handleMatchAction(match, 'hard_approval')}
            className="flex-1 rounded bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            Hard Approval
          </button>
        </div>

        {/* Contact Information */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="space-y-1 text-xs text-gray-500">
            <div>Borrower: {match.contacts.borrower}</div>
            <div>Originator: {match.contacts.originator}</div>
            {match.contacts.facilitator && <div>Facilitator: {match.contacts.facilitator}</div>}
          </div>
        </div>
      </div>
    </div>
  );

  // Render dashboard stats
  const renderStats = () => (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="text-2xl font-bold text-gray-900">{matchStats.total}</div>
        <div className="text-sm text-gray-600">Total Deals</div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="text-2xl font-bold text-green-700">{matchStats.hardApprovals}</div>
        <div className="text-sm text-gray-600">Hard Approvals</div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="text-2xl font-bold text-gray-800">{matchStats.softApprovals}</div>
        <div className="text-sm text-gray-600">Soft Approvals</div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="text-2xl font-bold text-gray-900">
          ${(matchStats.totalVolume / 1000000).toFixed(1)}M
        </div>
        <div className="text-sm text-gray-600">Total Volume</div>
      </div>
    </div>
  );

  // Render configuration panel
  const renderConfigPanel = () => (
    <div className="space-y-6">
      {/* RiskLab Configuration Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">RiskLab Configuration</h3>
          <span className="inline-flex items-center rounded bg-green-100 px-2 py-1 text-sm font-medium text-green-800">
            EVA RiskLab v2.4
          </span>
        </div>
        <p className="mb-4 text-sm text-gray-600">
          Configure AI-powered risk assessment with multi-source data integration, LLM analysis, and
          custom weighting algorithms.
        </p>
      </div>

      {/* Risk Criteria Configuration */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h4 className="text-md mb-4 font-semibold text-gray-900">Risk Assessment Criteria</h4>
        <div className="space-y-4">
          {config.riskCriteria.map(criteria => (
            <div key={criteria.id} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">{criteria.name}</h5>
                  <p className="text-sm capitalize text-gray-600">
                    {criteria.category} • {criteria.dataSource.replace('_', ' ')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{criteria.weight}%</span>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={criteria.weight}
                    onChange={e => {
                      const newWeight = parseInt(e.target.value);
                      setConfig(prev => ({
                        ...prev,
                        riskCriteria: prev.riskCriteria.map(c =>
                          c.id === criteria.id ? { ...c, weight: newWeight } : c,
                        ),
                      }));
                    }}
                    className="w-20"
                  />
                </div>
              </div>

              {/* Threshold Configuration */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Hard Approval
                  </label>
                  <input
                    type="number"
                    value={criteria.threshold.hard_approval}
                    onChange={e => {
                      const value = parseFloat(e.target.value);
                      setConfig(prev => ({
                        ...prev,
                        riskCriteria: prev.riskCriteria.map(c =>
                          c.id === criteria.id
                            ? { ...c, threshold: { ...c.threshold, hard_approval: value } }
                            : c,
                        ),
                      }));
                    }}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Soft Approval
                  </label>
                  <input
                    type="number"
                    value={criteria.threshold.soft_approval}
                    onChange={e => {
                      const value = parseFloat(e.target.value);
                      setConfig(prev => ({
                        ...prev,
                        riskCriteria: prev.riskCriteria.map(c =>
                          c.id === criteria.id
                            ? { ...c, threshold: { ...c.threshold, soft_approval: value } }
                            : c,
                        ),
                      }));
                    }}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Info Request
                  </label>
                  <input
                    type="number"
                    value={criteria.threshold.info_request}
                    onChange={e => {
                      const value = parseFloat(e.target.value);
                      setConfig(prev => ({
                        ...prev,
                        riskCriteria: prev.riskCriteria.map(c =>
                          c.id === criteria.id
                            ? { ...c, threshold: { ...c.threshold, info_request: value } }
                            : c,
                        ),
                      }));
                    }}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Hard Decline
                  </label>
                  <input
                    type="number"
                    value={criteria.threshold.hard_decline}
                    onChange={e => {
                      const value = parseFloat(e.target.value);
                      setConfig(prev => ({
                        ...prev,
                        riskCriteria: prev.riskCriteria.map(c =>
                          c.id === criteria.id
                            ? { ...c, threshold: { ...c.threshold, hard_decline: value } }
                            : c,
                        ),
                      }));
                    }}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Data Source Configuration */}
              <div className="mt-3">
                <label className="mb-1 block text-xs font-medium text-gray-700">Data Source</label>
                <select
                  value={criteria.dataSource}
                  onChange={e => {
                    setConfig(prev => ({
                      ...prev,
                      riskCriteria: prev.riskCriteria.map(c =>
                        c.id === criteria.id
                          ? { ...c, dataSource: e.target.value as RiskLabCriteria['dataSource'] }
                          : c,
                      ),
                    }));
                  }}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                >
                  <option value="credit_bureau">Credit Bureau</option>
                  <option value="financial_statements">Financial Statements</option>
                  <option value="bank_statements">Bank Statements</option>
                  <option value="documents">Document Analysis</option>
                  <option value="ai_analysis">AI/LLM Analysis</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Criteria */}
        <div className="mt-4">
          <button
            onClick={() => {
              const newCriteria: RiskLabCriteria = {
                id: `custom_${Date.now()}`,
                name: 'Custom Criteria',
                weight: 5,
                category: 'financial',
                threshold: {
                  hard_approval: 80,
                  soft_approval: 65,
                  info_request: 50,
                  hard_decline: 30,
                },
                dataSource: 'ai_analysis',
                isCustom: true,
              };
              setConfig(prev => ({
                ...prev,
                riskCriteria: [...prev.riskCriteria, newCriteria],
              }));
            }}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            + Add Custom Risk Criteria
          </button>
        </div>
      </div>

      {/* Category Weight Distribution */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h4 className="text-md mb-4 font-semibold text-gray-900">Category Weight Distribution</h4>
        <div className="space-y-4">
          {Object.entries(config.customWeights).map(([category, weight]) => (
            <div key={category} className="flex items-center">
              <div className="w-40 text-sm font-medium capitalize text-gray-900">
                {category.replace('_', ' ')}:
              </div>
              <div className="mx-4 flex-1">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weight}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      customWeights: {
                        ...prev.customWeights,
                        [category]: parseInt(e.target.value),
                      },
                    }))
                  }
                  className="w-full"
                />
              </div>
              <div className="w-16 text-center">
                <input
                  type="number"
                  value={weight}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      customWeights: {
                        ...prev.customWeights,
                        [category]: parseInt(e.target.value) || 0,
                      },
                    }))
                  }
                  className="w-full rounded border border-gray-300 px-2 py-1 text-center text-xs"
                  min="0"
                  max="50"
                />
              </div>
              <div className="w-8 text-sm text-gray-600">%</div>
            </div>
          ))}
        </div>

        {/* Weight Distribution Validation */}
        <div className="mt-4 rounded bg-gray-50 p-3">
          <div className="text-sm text-gray-700">
            Total Weight: {Object.values(config.customWeights).reduce((sum, w) => sum + w, 0)}%
            {Object.values(config.customWeights).reduce((sum, w) => sum + w, 0) !== 100 && (
              <span className="ml-2 text-red-600">⚠ Should total 100%</span>
            )}
          </div>
        </div>
      </div>

      {/* AI/LLM Configuration */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h4 className="text-md mb-4 font-semibold text-gray-900">AI/LLM Model Configuration</h4>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Primary LLM Model
            </label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2">
              <option value="eva-nemotron-70b">EVA Nemotron 70B (Recommended)</option>
              <option value="gpt-4">GPT-4</option>
              <option value="claude-3">Claude 3</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confidence Threshold
            </label>
            <input
              type="number"
              value="85"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Vector Database</label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2">
              <option value="pinecone">Pinecone (Primary)</option>
              <option value="chroma">Chroma DB (Secondary)</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Time Decay Factor
            </label>
            <input
              type="number"
              value="0.95"
              step="0.01"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              min="0"
              max="1"
            />
          </div>
        </div>

        {/* Multi-modal Data Sources */}
        <div className="mt-6">
          <h5 className="mb-3 text-sm font-medium text-gray-900">Multi-Modal Data Sources</h5>
          <div className="grid grid-cols-2 gap-3">
            {[
              'Financial Statements',
              'Credit Bureau Data',
              'Bank Statements',
              'Earnings Call Transcripts',
              'News Sentiment Analysis',
              'Market Time Series',
              'Document OCR/Analysis',
              'Voice/Audio Analysis',
            ].map(source => (
              <label key={source} className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-700">{source}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Decision Thresholds */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h4 className="text-md mb-4 font-semibold text-gray-900">Advanced Decision Parameters</h4>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Auto Approval Threshold
            </label>
            <input
              type="number"
              value={config.autoApprovalThreshold}
              onChange={e =>
                setConfig(prev => ({
                  ...prev,
                  autoApprovalThreshold: parseInt(e.target.value),
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              min="0"
              max="100"
            />
            <p className="mt-1 text-xs text-gray-500">Minimum score for automatic hard approval</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Auto Decline Threshold
            </label>
            <input
              type="number"
              value={config.declineThreshold}
              onChange={e =>
                setConfig(prev => ({
                  ...prev,
                  declineThreshold: parseInt(e.target.value),
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              min="0"
              max="100"
            />
            <p className="mt-1 text-xs text-gray-500">Maximum score for automatic hard decline</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Maximum Deal Size ($)
            </label>
            <input
              type="number"
              value={config.maxDealSize}
              onChange={e =>
                setConfig(prev => ({
                  ...prev,
                  maxDealSize: parseInt(e.target.value),
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              min="0"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Manual Review Industries
            </label>
            <textarea
              value={config.requiresManualReview.join(', ')}
              onChange={e =>
                setConfig(prev => ({
                  ...prev,
                  requiresManualReview: e.target.value
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s),
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              rows={2}
              placeholder="construction, hospitality, retail"
            />
            <p className="mt-1 text-xs text-gray-500">
              Industries requiring manual review (comma-separated)
            </p>
          </div>
        </div>
      </div>

      {/* Instrument Type Configuration */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h4 className="text-md mb-4 font-semibold text-gray-900">Supported Instrument Types</h4>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            'term_loan',
            'line_of_credit',
            'equipment_finance',
            'real_estate',
            'working_capital',
            'trade_finance',
          ].map(type => (
            <label key={type} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.instrumentTypes.includes(type as InstrumentType)}
                onChange={e => {
                  if (e.target.checked) {
                    setConfig(prev => ({
                      ...prev,
                      instrumentTypes: [...prev.instrumentTypes, type as InstrumentType],
                    }));
                  } else {
                    setConfig(prev => ({
                      ...prev,
                      instrumentTypes: prev.instrumentTypes.filter(t => t !== type),
                    }));
                  }
                }}
                className="rounded"
              />
              <span className="text-sm capitalize text-gray-700">{type.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Save Configuration */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-md font-semibold text-gray-900">Configuration Status</h4>
            <p className="text-sm text-gray-600">Last saved: {new Date().toLocaleString()}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                // Reset to defaults
                setConfig({
                  instrumentTypes: ['equipment_finance', 'working_capital', 'term_loan'],
                  riskCriteria: DEFAULT_RISK_CRITERIA,
                  customWeights: {
                    creditworthiness: 40,
                    financial: 20,
                    cashflow: 15,
                    legal: 10,
                    collateral: 10,
                    industry: 5,
                  },
                  autoApprovalThreshold: 85,
                  declineThreshold: 50,
                  maxDealSize: 5000000,
                  requiresManualReview: ['construction', 'hospitality', 'retail'],
                });
                toast.info('Configuration reset to defaults');
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Reset to Defaults
            </button>
            <button
              onClick={() => {
                onConfigChanged?.(config);
                toast.success('RiskLab configuration saved successfully');
              }}
              className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render action confirmation modal
  const renderActionModal = () => {
    if (!showActionModal || !selectedMatch || !selectedAction) return null;

    const actionLabels = {
      hard_decline: 'Hard Decline',
      info_request: 'Request Information',
      soft_approval: 'Soft Approval',
      hard_approval: 'Hard Approval',
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Confirm {actionLabels[selectedAction]}
          </h3>

          <div className="mb-4">
            <p className="mb-2 text-sm text-gray-600">
              Deal: <strong>{selectedMatch.borrowerName}</strong>
            </p>
            <p className="mb-2 text-sm text-gray-600">
              Amount: <strong>${selectedMatch.dealAmount.toLocaleString()}</strong>
            </p>

            {selectedAction === 'info_request' && selectedMatch.requiredDocuments.length > 0 && (
              <div className="mt-3">
                <p className="mb-1 text-sm font-medium text-gray-700">Required Documents:</p>
                <ul className="space-y-1 text-xs text-gray-600">
                  {selectedMatch.requiredDocuments.map((doc, idx) => (
                    <li key={idx}>• {doc}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedAction === 'soft_approval' && selectedMatch.contingencies.length > 0 && (
              <div className="mt-3">
                <p className="mb-1 text-sm font-medium text-gray-700">Contingencies:</p>
                <ul className="space-y-1 text-xs text-gray-600">
                  {selectedMatch.contingencies.map((contingency, idx) => (
                    <li key={idx}>• {contingency}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowActionModal(false)}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={processAction}
              disabled={isLoading}
              className={`flex-1 rounded-md px-4 py-2 font-medium text-white transition-colors ${getActionColor(selectedAction)} ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {isLoading ? 'Processing...' : `Confirm ${actionLabels[selectedAction]}`}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Smart Match Engine</h2>
          <p className="text-sm text-gray-600">AI-powered deal matching with RiskLab integration</p>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveView('matches')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeView === 'matches'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Matches
          </button>
          <button
            onClick={() => setActiveView('config')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeView === 'config'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Configuration
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeView === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      {activeView === 'matches' && renderStats()}

      {/* Main Content */}
      {activeView === 'matches' && (
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading matches...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {matches.map(renderMatchCard)}
            </div>
          )}
        </div>
      )}

      {activeView === 'config' && renderConfigPanel()}

      {activeView === 'analytics' && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
          <p className="text-gray-600">Coming soon: Advanced analytics and reporting features</p>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {renderActionModal()}
    </div>
  );
};

export default SmartMatchEngine;
