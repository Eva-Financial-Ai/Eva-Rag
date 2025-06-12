import { Transaction, WorkflowStage } from '../contexts/WorkflowContext';
import { UserType } from '../types/UserTypes';

// Mock login response
export const mockLoginResponse = {
  success: true,
  token: 'mock-jwt-token',
  user: {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
  },
};

export interface MockTransaction {
  id: string;
  applicantData: {
    id: string;
    name: string;
    entityType: string;
    industryCode: string;
  };
  type: string;
  amount: number;
  details: Record<string, any>;
  currentStage: WorkflowStage;
  riskProfile?: {
    overallScore: number;
    creditScore: {
      business: number;
      personal: number;
    };
    financialRatios: {
      name: string;
      value: number;
      benchmark: string;
      status: string;
    }[];
    riskFactors: {
      category: string;
      name: string;
      value: string;
      impact: string;
    }[];
  };
}

// Helper function to generate a random date in the last 30 days
const randomDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  return date.toISOString();
};

// Create mock transactions for testing
export const mockTransactions: Transaction[] = [
  {
    id: 'tx-1689341001234',
    type: 'equipment_financing',
    data: {
      requestedAmount: 250000,
      applicantName: 'John Smith',
      businessName: 'Smith Manufacturing LLC',
      purpose: 'Purchase new CNC machine',
      term: 60,
      industry: 'Manufacturing'
    },
    createdAt: randomDate(),
    stage: 'application',
    status: 'active',
    amount: 250000,
    applicantData: {
      id: 'app-11001',
      name: 'John Smith',
      entityType: 'LLC',
      industryCode: 'MFG'
    },
    currentStage: 'application'
  },
  {
    id: 'tx-1689451112345',
    type: 'real_estate',
    data: {
      requestedAmount: 1200000,
      applicantName: 'Sarah Johnson',
      businessName: 'Johnson Properties Inc',
      purpose: 'Refinance commercial property',
      term: 240,
      industry: 'Real Estate'
    },
    createdAt: randomDate(),
    stage: 'document_collection',
    status: 'active',
    amount: 1200000,
    applicantData: {
      id: 'app-11002',
      name: 'Sarah Johnson',
      entityType: 'Corporation',
      industryCode: 'RE'
    },
    currentStage: 'document_collection'
  },
  {
    id: 'tx-1689562223456',
    type: 'working_capital',
    data: {
      requestedAmount: 100000,
      applicantName: 'David Chen',
      businessName: 'Chen Retail Group',
      purpose: 'Inventory expansion',
      term: 36,
      industry: 'Retail'
    },
    createdAt: randomDate(),
    stage: 'underwriting',
    status: 'active',
    amount: 100000,
    applicantData: {
      id: 'app-11003',
      name: 'David Chen',
      entityType: 'LLC',
      industryCode: 'RET'
    },
    currentStage: 'underwriting'
  },
  {
    id: 'tx-1689673334567',
    type: 'equipment_financing',
    data: {
      requestedAmount: 175000,
      applicantName: 'Maria Garcia',
      businessName: 'Garcia Construction',
      purpose: 'Heavy equipment purchase',
      term: 60,
      industry: 'Construction'
    },
    createdAt: randomDate(),
    stage: 'approval',
    status: 'active',
    amount: 175000,
    applicantData: {
      id: 'app-11004',
      name: 'Maria Garcia',
      entityType: 'Sole Proprietorship',
      industryCode: 'CON'
    },
    currentStage: 'approval'
  },
  {
    id: 'tx-1689784445678',
    type: 'working_capital',
    data: {
      requestedAmount: 75000,
      applicantName: 'James Wilson',
      businessName: 'Wilson Tech Solutions',
      purpose: 'Software development',
      term: 24,
      industry: 'Technology'
    },
    createdAt: randomDate(),
    stage: 'funding',
    status: 'active',
    amount: 75000,
    applicantData: {
      id: 'app-11005',
      name: 'James Wilson',
      entityType: 'LLC',
      industryCode: 'TECH'
    },
    currentStage: 'funding'
  }
];

export const mockInsights = [
  {
    category: 'critical' as 'critical',
    title: 'High Debt to Equity Ratio',
    description:
      'Your debt to equity ratio is above industry benchmarks, indicating higher financial risk.',
    ratios: ['Debt to Equity'],
    recommendation: 'Consider reducing debt or increasing equity to improve financial stability.',
  },
  {
    category: 'warning' as 'warning',
    title: 'Below Average Profit Margin',
    description:
      'Your profit margin is slightly below industry benchmarks, which may impact long-term profitability.',
    ratios: ['Profit Margin'],
    recommendation: 'Focus on cost reduction strategies or pricing adjustments to improve margins.',
  },
  {
    category: 'positive' as 'positive',
    title: 'Strong Liquidity Position',
    description:
      'Your quick ratio exceeds industry benchmarks, indicating good short-term financial health.',
    ratios: ['Quick Ratio', 'Cash Ratio'],
    recommendation: 'Maintain current liquidity management practices.',
  },
];

export interface Activity {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  userType: UserType;
  user: {
    name: string;
    avatar: string;
  };
}

export const mockActivities: Activity[] = [
  {
    id: 1,
    action: 'Document Added',
    description: 'Financial Statements Q1 2023 added to ABC Corp file',
    timestamp: '2 hours ago',
    userType: UserType.BUSINESS,
    user: {
      name: 'Jamie Smith',
      avatar: '/avatars/user2.jpg',
    },
  },
  {
    id: 2,
    action: 'Risk Assessment',
    description: 'Credit analysis completed for QRS Manufacturing',
    timestamp: '4 hours ago',
    userType: UserType.LENDER,
    user: {
      name: 'Alex Morgan',
      avatar: '/avatars/user1.jpg',
    },
  },
  {
    id: 3,
    action: 'Deal Approved',
    description: 'XYZ Properties deal terms approved by committee',
    timestamp: '1 day ago',
    userType: UserType.BROKERAGE,
    user: {
      name: 'Taylor Jones',
      avatar: '/avatars/user3.jpg',
    },
  },
  {
    id: 4,
    action: 'New Application',
    description: 'New equipment financing application received from DEF Industries',
    timestamp: '2 days ago',
    userType: UserType.BUSINESS,
    user: {
      name: 'Casey Wilson',
      avatar: '/avatars/user5.jpg',
    },
  },
  {
    id: 5,
    action: 'Equipment Listed',
    description: 'New industrial machinery listed for lease - 3 units available',
    timestamp: '3 days ago',
    userType: UserType.VENDOR,
    user: {
      name: 'Morgan Davis',
      avatar: '/avatars/user4.jpg',
    },
  },
  {
    id: 6,
    action: 'Deal Matched',
    description: 'Matched TechPro Inc. with appropriate equipment vendor for manufacturing setup',
    timestamp: '4 days ago',
    userType: UserType.BROKERAGE,
    user: {
      name: 'Jamie Rodriguez',
      avatar: '/avatars/user6.jpg',
    },
  },
  {
    id: 7,
    action: 'Payment Processed',
    description: 'Monthly payment of $4,320 received from LMN Enterprises',
    timestamp: '5 days ago',
    userType: UserType.LENDER,
    user: {
      name: 'Riley Johnson',
      avatar: '/avatars/user4.jpg',
    },
  },
  {
    id: 8,
    action: 'Inventory Update',
    description: 'Updated inventory levels for heavy machinery - 2 units sold',
    timestamp: '1 week ago',
    userType: UserType.VENDOR,
    user: {
      name: 'Morgan Davis',
      avatar: '/avatars/user4.jpg',
    },
  },
];
