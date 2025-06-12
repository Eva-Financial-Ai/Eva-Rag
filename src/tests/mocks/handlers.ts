import { http, HttpResponse } from 'msw';

export const handlers = [
  // Plaid API handlers
  http.post('/api/plaid/create-link-token', () => {
    return HttpResponse.json({
      linkToken: 'link-sandbox-test-token',
      expiration: new Date(Date.now() + 3600000).toISOString(),
    });
  }),

  http.post('/api/plaid/exchange-token', () => {
    return HttpResponse.json({
      accessToken: 'access-sandbox-test-token',
      itemId: 'item-sandbox-test-id',
    });
  }),

  http.post('/api/plaid/accounts', () => {
    return HttpResponse.json({
      accounts: [
        {
          id: 'test-account-1',
          name: 'Test Business Checking',
          type: 'checking',
          subtype: 'business_checking',
          mask: '1234',
          balance: {
            available: 50000,
            current: 52000,
          },
          institution: {
            name: 'Test Bank',
            institutionId: 'test-bank',
          },
        },
      ],
    });
  }),

  // Risk Assessment API handlers
  http.post('/api/risk/score', () => {
    return HttpResponse.json({
      score: 72,
      rating: 'BBB',
      factors: [
        { name: 'Credit History', score: 85, weight: 0.3 },
        { name: 'Financial Health', score: 70, weight: 0.25 },
        { name: 'Business Stability', score: 65, weight: 0.2 },
        { name: 'Market Conditions', score: 75, weight: 0.15 },
        { name: 'Collateral Quality', score: 80, weight: 0.1 },
      ],
      alerts: [],
      timestamp: new Date().toISOString(),
    });
  }),

  http.get('/api/risk/alerts', () => {
    return HttpResponse.json({
      alerts: [
        {
          id: 'alert-1',
          type: 'warning',
          message: 'Debt-to-income ratio approaching threshold',
          severity: 'medium',
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }),

  // Portfolio API handlers
  http.get('/api/portfolios', () => {
    return HttpResponse.json({
      portfolios: [
        {
          id: 'portfolio-1',
          name: 'Test Portfolio',
          totalValue: 1000000,
          totalLoans: 10,
          performanceMetrics: {
            totalReturn: 70000,
            totalReturnPercentage: 7.0,
            monthlyIncome: 5833,
          },
        },
      ],
    });
  }),

  http.get('/api/portfolios/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      name: 'Test Portfolio',
      totalValue: 1000000,
      totalLoans: 10,
      performanceMetrics: {
        totalReturn: 70000,
        totalReturnPercentage: 7.0,
        averageInterestRate: 6.5,
        monthlyIncome: 5833,
      },
      riskMetrics: {
        overallRiskScore: 72,
        creditRisk: 68,
        marketRisk: 75,
      },
    });
  }),

  // Credit Application API handlers
  http.post('/api/credit-applications', () => {
    return HttpResponse.json(
      {
        id: 'app-123',
        status: 'submitted',
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.get('/api/credit-applications/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      status: 'in_review',
      businessInfo: {
        name: 'Test Business',
        taxId: '12-3456789',
      },
      createdAt: new Date().toISOString(),
    });
  }),
];
