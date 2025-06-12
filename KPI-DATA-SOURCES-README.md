# KPI Data Sources Implementation Guide for Backend Engineers

## Overview

This document provides backend engineers with detailed information about data sources and API endpoints needed to implement the KPI dashboard. All KPIs are based on real integrations we have with external services.

## Data Source Integrations

### 1. Stripe (Payment Processing)

**Purpose**: Financial transactions, revenue tracking, commission payments
**Refresh Rate**: 5 minutes
**Authentication**: API Key

#### Endpoints:

- `/api/stripe/payments` - Payment transactions
- `/api/stripe/customers` - Customer data
- `/api/stripe/subscriptions` - Subscription revenue
- `/api/stripe/charges` - Individual charges and fees

#### Data Points:

- `total_revenue` - Sum of successful payments
- `transaction_count` - Number of transactions
- `average_transaction_value` - Revenue / transaction count
- `mrr` - Monthly recurring revenue
- `commission_payments` - Payments to brokers/vendors
- `chargeback_rate` - Disputed transactions percentage

#### KPIs Using Stripe:

- **Vendor**: Total Vendor Sales, Average Order Value, Payment Processing Time, Chargeback Rate
- **Broker**: Total Commissions, Average Commission per Deal, Personal Commissions
- **Lender**: Interest Income

---

### 2. QuickBooks (Accounting & Financial Data)

**Purpose**: Business financials, profit/loss, cash flow
**Refresh Rate**: 1 hour
**Authentication**: OAuth 2.0

#### Endpoints:

- `/api/quickbooks/profit-loss` - P&L statements
- `/api/quickbooks/balance-sheet` - Balance sheet data
- `/api/quickbooks/cash-flow` - Cash flow statements
- `/api/quickbooks/expenses` - Operating expenses

#### Data Points:

- `revenue` - Total revenue from accounting records
- `expenses` - Operating expenses
- `profit_margin` - (Revenue - Expenses) / Revenue
- `cash_position` - Current cash on hand

#### KPIs Using QuickBooks:

- **Borrower**: Organization Cash Flow, Monthly Expenses
- **Vendor**: Vendor Revenue, Profit Margins, Operating Expenses
- **Lender**: Total Portfolio Value, Net Interest Margin, Managed Portfolio Value, Portfolio Yield

---

### 3. Plaid (Banking & Cash Flow)

**Purpose**: Bank account data, transaction history, cash flow analysis
**Refresh Rate**: 30 minutes
**Authentication**: API Key + Link Token

#### Endpoints:

- `/api/plaid/accounts` - Bank account information
- `/api/plaid/transactions` - Transaction history
- `/api/plaid/balance` - Current account balances
- `/api/plaid/cash-flow` - Cash flow analysis

#### Data Points:

- `account_balance` - Current bank account balance
- `cash_flow` - Monthly cash flow patterns
- `transaction_history` - Historical transaction data
- `cash_flow_stability` - Consistency of cash flow

#### KPIs Using Plaid:

- **Borrower**: Average Bank Balance, Cash Flow Stability
- **Vendor**: Payment Processing Time (via bank transfers)

---

### 4. Equifax (Credit Bureau)

**Purpose**: Personal and business credit scores, credit reports
**Refresh Rate**: 24 hours (daily)
**Authentication**: API Key + Certificate

#### Endpoints:

- `/api/equifax/credit-report` - Full credit report
- `/api/equifax/credit-score` - Credit score only
- `/api/equifax/credit-monitoring` - Credit changes

#### Data Points:

- `credit_score` - FICO credit score
- `payment_history` - Payment behavior patterns
- `credit_inquiries` - Recent credit inquiries
- `credit_utilization` - Credit usage percentage

#### KPIs Using Equifax:

- **Borrower**: Average Borrower Credit Score, Personal Credit Score
- **Lender**: Average Risk Score, Risk Assessment Time

---

### 5. TransUnion (Credit Bureau)

**Purpose**: Business credit scores, commercial credit reports
**Refresh Rate**: 24 hours (daily)
**Authentication**: API Key + OAuth

#### Endpoints:

- `/api/transunion/credit-report` - Personal credit report
- `/api/transunion/business-credit` - Business credit report
- `/api/transunion/risk-assessment` - Risk scoring

#### Data Points:

- `personal_credit_score` - Personal credit score
- `business_credit_score` - Business credit score
- `risk_factors` - Risk assessment factors
- `payment_behavior` - Payment history analysis

#### KPIs Using TransUnion:

- **Borrower**: Credit Inquiries, Business Credit Score

---

### 6. Experian (Credit Bureau)

**Purpose**: Credit profiles, business credit monitoring
**Refresh Rate**: 24 hours (daily)
**Authentication**: API Key

#### Endpoints:

- `/api/experian/credit-profile` - Complete credit profile
- `/api/experian/business-credit` - Business credit information
- `/api/experian/credit-monitoring` - Credit monitoring alerts

#### Data Points:

- `credit_score` - Experian credit score
- `credit_utilization` - Credit usage patterns
- `payment_behavior` - Payment history
- `business_credit_score` - Business credit rating

#### KPIs Using Experian:

- **Borrower**: Business Credit Score

---

### 7. PayNet (Commercial Credit & Risk)

**Purpose**: Commercial loan data, payment performance, risk assessment
**Refresh Rate**: 12 hours
**Authentication**: API Key + OAuth

#### Endpoints:

- `/api/paynet/payment-history` - Commercial payment history
- `/api/paynet/risk-assessment` - Risk scoring models
- `/api/paynet/loan-performance` - Loan performance data
- `/api/paynet/industry-benchmarks` - Industry comparison data

#### Data Points:

- `payment_performance` - Commercial payment behavior
- `default_probability` - Risk of default
- `industry_comparison` - Benchmarking data
- `loan_performance` - Historical loan data

#### KPIs Using PayNet:

- **Borrower**: Application Approval Rate, Average Processing Time, Active Loan Applications, Funding Success
- **Broker**: Deal Volume, Deal Success Rate, Lender Network Size, Deals in Pipeline, Deals Closed Monthly, Average Deal Size
- **Lender**: Portfolio Default Rate, Risk Adjusted Return, Application Processing Time, Approval Rate, Decisions Per Day, Decision Accuracy, Escalation Rate

---

### 8. Google Analytics (User Behavior)

**Purpose**: Platform usage, user engagement, conversion tracking
**Refresh Rate**: 15 minutes
**Authentication**: OAuth 2.0 + Service Account

#### Endpoints:

- `/api/google-analytics/users` - User activity data
- `/api/google-analytics/sessions` - Session information
- `/api/google-analytics/events` - Custom event tracking
- `/api/google-analytics/conversions` - Conversion funnel data

#### Data Points:

- `active_users` - Number of active users
- `session_duration` - Average session length
- `page_views` - Page view statistics
- `conversion_rate` - Goal completion rates

#### KPIs Using Google Analytics:

- **Borrower**: Active Borrowers, Document Upload Rate
- **Vendor**: Active Vendors, Listing Conversion Rate, Customer Acquisition, Customer Retention
- **Broker**: Active Brokers, Broker Retention, Active Clients, Client Satisfaction

---

### 9. Xero (Accounting Alternative)

**Purpose**: Alternative accounting data for organizations using Xero
**Refresh Rate**: 1 hour
**Authentication**: OAuth 2.0

#### Endpoints:

- `/api/xero/profit-loss` - Profit and loss statements
- `/api/xero/balance-sheet` - Balance sheet data
- `/api/xero/cash-flow` - Cash flow reports

#### Data Points:

- `revenue` - Revenue from Xero accounting
- `expenses` - Expense tracking
- `cash_flow` - Cash flow analysis
- `profit_margin` - Calculated profit margins

#### KPIs Using Xero:

- **Borrower**: Organization Cash Flow, Monthly Expenses (alternative to QuickBooks)

---

### 10. NetSuite (Enterprise Accounting)

**Purpose**: Enterprise-level financial and inventory data
**Refresh Rate**: 1 hour
**Authentication**: OAuth 2.0 + Token-based

#### Endpoints:

- `/api/netsuite/financials` - Financial statements
- `/api/netsuite/inventory` - Inventory management data
- `/api/netsuite/operations` - Operational metrics

#### Data Points:

- `revenue` - Enterprise revenue data
- `inventory_turnover` - Inventory turnover ratios
- `operating_expenses` - Detailed expense tracking

#### KPIs Using NetSuite:

- **Vendor**: Inventory Turnover (for vendors with inventory)

---

## Implementation Guidelines

### 1. API Rate Limiting

Each data source has different rate limits:

- **Stripe**: 100 requests/second
- **QuickBooks**: 500 requests/minute
- **Plaid**: 600 requests/minute
- **Credit Bureaus**: 10 requests/minute (due to cost)
- **Google Analytics**: 10,000 requests/day
- **Xero**: 60 requests/minute
- **NetSuite**: 1,000 requests/hour

### 2. Error Handling

Implement robust error handling for each integration:

```javascript
// Example error handling pattern
try {
  const data = await fetchFromDataSource(endpoint);
  return processKPIData(data);
} catch (error) {
  if (error.status === 429) {
    // Rate limit exceeded - implement backoff
    await delay(calculateBackoffTime(error));
    return retryRequest(endpoint);
  } else if (error.status >= 500) {
    // Server error - use cached data if available
    return getCachedData(endpoint) || getDefaultValue();
  } else {
    // Client error - log and return default
    logError(error);
    return getDefaultValue();
  }
}
```

### 3. Data Caching Strategy

Implement caching based on data source refresh rates:

- **Real-time data** (Stripe, Google): 5-15 minute cache
- **Daily data** (Credit bureaus): 24-hour cache
- **Financial data** (QuickBooks, Xero): 1-hour cache

### 4. Data Transformation

Each KPI requires specific data transformation:

#### Example: Average Credit Score Calculation

```javascript
// From Equifax API response
const calculateAverageCreditScore = creditReports => {
  const validScores = creditReports
    .filter(report => report.credit_score && report.credit_score > 0)
    .map(report => report.credit_score);

  return validScores.length > 0
    ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
    : 0;
};
```

#### Example: Cash Flow Stability from Plaid

```javascript
// From Plaid transaction data
const calculateCashFlowStability = transactions => {
  const monthlyFlows = groupTransactionsByMonth(transactions);
  const flowVariance = calculateVariance(monthlyFlows);
  const avgFlow = calculateAverage(monthlyFlows);

  // Stability = 1 - (variance / average)
  return Math.max(0, Math.min(100, (1 - flowVariance / avgFlow) * 100));
};
```

### 5. Security Considerations

- Store API keys in environment variables
- Use OAuth refresh tokens where applicable
- Implement request signing for sensitive data sources
- Log all API requests for audit purposes
- Encrypt sensitive data in transit and at rest

### 6. Monitoring & Alerting

Set up monitoring for:

- API response times
- Error rates by data source
- Data freshness (last successful update)
- Rate limit usage
- Cost tracking (especially for credit bureau APIs)

## KPI Calculation Examples

### Borrower KPIs

#### System Admin - Average Borrower Credit Score

```javascript
// Data Source: Equifax
const getAverageBorrowerCreditScore = async () => {
  const creditReports = await equifaxAPI.getCreditReports({
    role: 'borrower',
    timeframe: 'last_30_days',
  });

  return {
    id: 'avg-borrower-credit-score',
    label: 'Average Borrower Credit Score',
    value: calculateAverageCreditScore(creditReports),
    change: calculateMonthOverMonthChange(creditReports),
    dataSource: 'equifax',
    lastUpdated: new Date(),
  };
};
```

#### User Admin - Organization Cash Flow

```javascript
// Data Source: QuickBooks
const getOrganizationCashFlow = async organizationId => {
  const cashFlowData = await quickbooksAPI.getCashFlow({
    organizationId,
    period: 'current_month',
  });

  return {
    id: 'org-cash-flow',
    label: 'Monthly Cash Flow',
    value: cashFlowData.net_cash_flow,
    change: calculateMonthOverMonthChange(cashFlowData),
    format: 'currency',
    dataSource: 'quickbooks',
    lastUpdated: new Date(),
  };
};
```

### Vendor KPIs

#### System Admin - Total Vendor Sales

```javascript
// Data Source: Stripe
const getTotalVendorSales = async () => {
  const payments = await stripeAPI.getPayments({
    customer_type: 'vendor',
    timeframe: 'current_month',
  });

  const totalSales = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return {
    id: 'total-vendor-sales',
    label: 'Total Vendor Sales',
    value: totalSales,
    change: calculateMonthOverMonthChange(payments),
    format: 'currency',
    dataSource: 'stripe',
    lastUpdated: new Date(),
  };
};
```

### Broker KPIs

#### System Admin - Deal Success Rate

```javascript
// Data Source: PayNet
const getDealSuccessRate = async () => {
  const deals = await paynetAPI.getDeals({
    timeframe: 'current_month',
  });

  const successfulDeals = deals.filter(deal => deal.status === 'closed_won');
  const successRate = (successfulDeals.length / deals.length) * 100;

  return {
    id: 'deal-success-rate',
    label: 'Deal Success Rate',
    value: Math.round(successRate),
    change: calculateMonthOverMonthChange(deals),
    format: 'percentage',
    dataSource: 'paynet',
    lastUpdated: new Date(),
  };
};
```

### Lender KPIs

#### System Admin - Portfolio Default Rate

```javascript
// Data Source: PayNet
const getPortfolioDefaultRate = async () => {
  const portfolio = await paynetAPI.getPortfolioData({
    status: 'all',
  });

  const defaultedLoans = portfolio.filter(loan => loan.status === 'default');
  const defaultRate = (defaultedLoans.length / portfolio.length) * 100;

  return {
    id: 'portfolio-default-rate',
    label: 'Portfolio Default Rate',
    value: defaultRate.toFixed(1),
    change: calculateMonthOverMonthChange(portfolio),
    format: 'percentage',
    dataSource: 'paynet',
    lastUpdated: new Date(),
  };
};
```

## Testing Strategy

### 1. Unit Tests

Test each KPI calculation function with mock data:

```javascript
describe('KPI Calculations', () => {
  test('calculates average credit score correctly', () => {
    const mockCreditReports = [{ credit_score: 750 }, { credit_score: 720 }, { credit_score: 680 }];

    expect(calculateAverageCreditScore(mockCreditReports)).toBe(717);
  });
});
```

### 2. Integration Tests

Test API integrations with sandbox environments:

```javascript
describe('Data Source Integrations', () => {
  test('fetches Stripe payment data', async () => {
    const payments = await stripeAPI.getPayments({
      limit: 10,
      test_mode: true,
    });

    expect(payments).toHaveLength(10);
    expect(payments[0]).toHaveProperty('amount');
  });
});
```

### 3. End-to-End Tests

Test complete KPI pipeline from data source to dashboard:

```javascript
describe('KPI Pipeline', () => {
  test('generates borrower KPIs successfully', async () => {
    const kpis = await kpiService.getBorrowerSystemKPIs();

    expect(kpis).toHaveProperty('averageBorrowerCreditScore');
    expect(kpis.averageBorrowerCreditScore.value).toBeGreaterThan(0);
  });
});
```

## Deployment Checklist

- [ ] All API keys configured in environment variables
- [ ] Rate limiting implemented for each data source
- [ ] Error handling and fallback mechanisms in place
- [ ] Caching strategy implemented
- [ ] Monitoring and alerting configured
- [ ] Security measures implemented
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Performance benchmarks established

## Support & Troubleshooting

### Common Issues

1. **Rate Limit Exceeded**

   - Implement exponential backoff
   - Use caching to reduce API calls
   - Consider upgrading API plan if needed

2. **Authentication Failures**

   - Check API key validity
   - Refresh OAuth tokens
   - Verify certificate installation (Equifax)

3. **Data Inconsistencies**

   - Implement data validation
   - Use multiple data sources for cross-verification
   - Set up data quality monitoring

4. **Performance Issues**
   - Optimize database queries
   - Implement parallel API calls where possible
   - Use CDN for static data

### Contact Information

- **Backend Team Lead**: [Contact Info]
- **DevOps Support**: [Contact Info]
- **Data Integration Specialist**: [Contact Info]

---

This implementation guide provides the foundation for building a robust, data-driven KPI system that leverages our existing integrations to provide valuable insights across all user roles in the EVA Platform.
