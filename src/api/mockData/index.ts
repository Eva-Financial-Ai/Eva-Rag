import mockCustomers from './customers';

/**
 * Mock credit analysis data
 */
export const getMockCreditAnalysis = (data?: any) => {
  return {
    id: 'analysis-123',
    businessId: data?.businessId || 'business-456',
    score: 85,
    riskLevel: 'medium',
    factors: [
      { name: 'Payment History', score: 90, weight: 0.35 },
      { name: 'Debt Utilization', score: 75, weight: 0.3 },
      { name: 'Business Age', score: 80, weight: 0.15 },
      { name: 'Industry Risk', score: 65, weight: 0.1 },
      { name: 'Recent Credit Inquiries', score: 95, weight: 0.1 },
    ],
    recommendations: [
      'Consider refinancing high-interest debt',
      'Maintain current payment schedule',
      'Reduce outstanding credit balances',
    ],
    createdAt: new Date().toISOString(),
    status: 'completed',
  };
};

/**
 * Mock chat response data
 */
export const getMockChatResponse = (data?: any) => {
  const query = data?.message || 'Default query';

  return {
    id: `chat-${Date.now()}`,
    message: `This is a mock response to: "${query}"`,
    timestamp: new Date().toISOString(),
    source: 'EVA AI',
    references: [
      { title: 'Credit Policy Guide', url: '/docs/credit-policy' },
      { title: 'Risk Assessment Framework', url: '/docs/risk-assessment' },
    ],
    suggestedActions: [
      { label: 'View Credit Report', action: 'VIEW_CREDIT_REPORT' },
      { label: 'Schedule Call', action: 'SCHEDULE_CALL' },
    ],
  };
};

/**
 * Mock users data
 */
export const getMockUsers = () => {
  return [
    {
      id: 'user-001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      department: 'Credit',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      status: 'active',
    },
    {
      id: 'user-002',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'underwriter',
      department: 'Risk',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      status: 'active',
    },
    {
      id: 'user-003',
      name: 'Michael Johnson',
      email: 'michael.johnson@example.com',
      role: 'relationship_manager',
      department: 'Sales',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      status: 'active',
    },
  ];
};

/**
 * Mock transactions data
 */
export const getMockTransactions = () => {
  return [
    {
      id: 'txn-001',
      date: '2023-05-15T10:30:00Z',
      amount: 15000,
      description: 'Equipment Purchase',
      status: 'completed',
      accountId: 'acc-123',
      type: 'debit',
    },
    {
      id: 'txn-002',
      date: '2023-05-12T14:45:00Z',
      amount: 5000,
      description: 'Loan Payment',
      status: 'completed',
      accountId: 'acc-456',
      type: 'credit',
    },
    {
      id: 'txn-003',
      date: '2023-05-10T09:15:00Z',
      amount: 2500,
      description: 'Inventory Financing',
      status: 'pending',
      accountId: 'acc-789',
      type: 'debit',
    },
  ];
};

// Export mock customers
export { mockCustomers };
