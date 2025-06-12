import { RiskMapType } from '../components/risk/RiskMapNavigator';

import { debugLog } from '../utils/auditLogger';

export interface SmartMatchResult {
  id: string;
  matchScore: number;
  lenderName: string;
  lenderLogo?: string;
  product: string;
  rate: number;
  term: number;
  monthlyPayment: number;
  totalCost: number;
  processingTime: string;
  requirements: string[];
  fees?: number;
  loanAmount?: number;
  interestRate?: number;
  termMonths?: number;
  notes?: string;
  lenderId?: string;
}

export interface SmartMatchQuery {
  transactionId: string;
  loanAmount: number;
  creditScore?: number;
  riskMapType: RiskMapType;
  businessAge?: number;
  annualRevenue?: number;
}

// Mock data for development purposes
const mockSmartMatches: SmartMatchResult[] = [
  {
    id: 'sm-001',
    matchScore: 95,
    lenderName: 'First Capital Bank',
    lenderLogo: '/icons/lenders/first-capital.png',
    product: 'Express Business Loan',
    rate: 5.49,
    term: 60,
    monthlyPayment: 1896,
    totalCost: 113760,
    processingTime: '2-3 business days',
    requirements: [
      'Business Plan',
      'Last 3 bank statements',
      'Business tax returns for last 2 years',
    ],
    lenderId: 'lender-001',
    loanAmount: 100000,
    interestRate: 5.49,
    termMonths: 60,
    fees: 1500,
    notes: 'Preferred lender for businesses in your industry with strong credit profile.',
  },
  {
    id: 'sm-002',
    matchScore: 88,
    lenderName: 'Growth Fund LLC',
    lenderLogo: '/icons/lenders/growth-fund.png',
    product: 'Fast Growth Financing',
    rate: 6.24,
    term: 48,
    monthlyPayment: 2350,
    totalCost: 112800,
    processingTime: '24-48 hours',
    requirements: ['1 year in business', 'Personal credit score 680+', 'Monthly revenue $15,000+'],
    lenderId: 'lender-002',
    loanAmount: 100000,
    interestRate: 6.24,
    termMonths: 48,
    fees: 2000,
  },
  {
    id: 'sm-003',
    matchScore: 82,
    lenderName: 'Heritage Financial',
    lenderLogo: '/icons/lenders/heritage.png',
    product: 'Equipment Financing',
    rate: 4.99,
    term: 72,
    monthlyPayment: 1650,
    totalCost: 118800,
    processingTime: '3-5 business days',
    requirements: ['Equipment invoice', 'Business license', 'Balance sheet', 'Personal guarantee'],
    lenderId: 'lender-003',
    loanAmount: 100000,
    interestRate: 4.99,
    termMonths: 72,
    fees: 1750,
  },
];

/**
 * Smart Match API service
 */
const smartMatchApi = {
  /**
   * Find matching lenders based on transaction data
   */
  findMatches: async (query: SmartMatchQuery): Promise<SmartMatchResult[]> => {
    debugLog('general', 'find_matches', 'Finding matches for query', query);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return mock data with slightly modified scores based on input
    return mockSmartMatches.map(match => ({
      ...match,
      matchScore: Math.min(
        100,
        match.matchScore + (query.creditScore && query.creditScore > 720 ? 5 : 0),
      ),
    }));
  },

  /**
   * Get details for a specific match
   */
  getMatchDetails: async (matchId: string): Promise<SmartMatchResult | null> => {
    debugLog('general', 'get_match_details', `Getting details for match: ${matchId}`, { matchId });

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return mockSmartMatches.find(match => match.id === matchId) || null;
  },

  /**
   * Fetch results for a transaction
   */
  fetchResults: async (
    transactionId: string,
    riskMapType: RiskMapType,
  ): Promise<SmartMatchResult[]> => {
    debugLog('general', 'fetch_results', `Fetching results for transaction: ${transactionId}`, {
      transactionId,
      riskMapType,
    });

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Return mock data
    return mockSmartMatches;
  },
};

export default smartMatchApi;
