/**
 * Mock API Fallback System
 *
 * This utility provides automatic fallback to mock data when API requests fail.
 * It intercepts Axios requests and, in case of failure, returns mock data instead.
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Extend AxiosError to include our custom property
interface ExtendedAxiosError extends AxiosError {
  __isMockFallback?: boolean;
}

// Define mock data generators inline
const getMockCreditAnalysis = (data?: any) => {
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

const getMockChatResponse = (data?: any) => {
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

const getMockUsers = () => {
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

const getMockTransactions = () => {
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

// Mapping of API endpoints to their corresponding mock data
const endpointMockMap: Record<string, any> = {
  // Format: '/api/endpoint/path': mockResponseFunction,
  '/api/credit/analyze': getMockCreditAnalysis,
  '/api/eva/chat': getMockChatResponse,
  '/api/users': getMockUsers,
  '/api/transactions': getMockTransactions,
  // Add more mappings as needed
};

/**
 * Determines if a request should immediately use mock data
 * instead of making a real API call
 */
function shouldUseMockDirectly(): boolean {
  return (
    process.env.REACT_APP_FORCE_MOCKS === 'true' ||
    (process.env.REACT_APP_ENABLE_MOCKS === 'true' && !navigator.onLine)
  );
}

/**
 * Gets the appropriate mock data for a given endpoint
 */
function getMockForEndpoint(url: string, data?: any): any {
  // Find the most specific matching endpoint
  const endpoint = Object.keys(endpointMockMap)
    .filter(key => url.includes(key))
    .sort((a, b) => b.length - a.length)[0]; // Use the longest (most specific) match

  if (endpoint && typeof endpointMockMap[endpoint] === 'function') {
    return endpointMockMap[endpoint](data);
  }

  // Return a generic mock if no specific mock is found
  return {
    data: { message: 'Generic mock response', success: true },
    status: 200,
  };
}

// Create Axios instance with interceptors
const apiClient = axios.create();

// Request interceptor - optionally bypass API calls completely
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (shouldUseMockDirectly() && config.url) {
      // Cancel the real request and use mock instead
      const mockData = getMockForEndpoint(config.url, config.data);

      // This approach uses a canceled promise to prevent the actual API call
      return Promise.reject({
        isAxiosError: true,
        __isMockFallback: true,
        response: {
          data: mockData,
          status: 200,
          headers: {},
          config,
        },
      } as ExtendedAxiosError);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor - handle errors by returning mock data
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: ExtendedAxiosError) => {
    if (error.__isMockFallback) {
      // This is our mock data from the request interceptor
      console.info('Using direct mock data (API call bypassed)');
      return Promise.resolve(error.response);
    }

    // Only use mock fallback if mocks are enabled
    if (process.env.REACT_APP_ENABLE_MOCKS === 'true' && error.config?.url) {
      console.warn('API request failed. Using mock data fallback.', error.message);
      const mockData = getMockForEndpoint(error.config.url, error.config.data);

      return Promise.resolve({
        data: mockData,
        status: 200,
        statusText: 'OK (Mock Fallback)',
        headers: {},
        config: error.config,
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
