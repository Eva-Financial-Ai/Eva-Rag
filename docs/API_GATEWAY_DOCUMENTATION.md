# 🚀 EVA AI API Gateway Documentation

## Enterprise Security Infrastructure - June 6, 2025

---

## 📋 **Overview**

The EVA AI API Gateway provides a centralized entry point for all backend services and third-party integrations. Built on Cloudflare Workers, it offers enterprise-grade security, intelligent routing, rate limiting, and data transformation capabilities.

### **🌐 Gateway URLs**

- **Staging**: https://api-staging.evafi.ai
- **Production**: https://api.evafi.ai

### **🏗️ Architecture Features**

- **Authentication**: API Key + JWT Bearer tokens
- **Rate Limiting**: Tiered limits (1K/10K/100K requests/hour)
- **Data Transformation**: Automatic normalization and compliance formatting
- **Intelligent Caching**: Route-specific TTL with cache invalidation
- **Security**: WAF protection, SQL injection prevention, geo-blocking
- **Analytics**: Real-time monitoring and performance tracking

---

## 🔐 **Authentication**

### **API Key Authentication**

```bash
curl -H "X-API-Key: [YOUR_API_KEY]" \
     -H "X-Client-ID: your_client_id" \
     https://api-staging.evafi.ai/api/v1/users
```

### **JWT Bearer Token**

```bash
curl -H "Authorization: Bearer your_jwt_token_here" \
     https://api-staging.evafi.ai/api/v1/financial-data
```

### **Authentication Tiers**

| Tier           | Requests/Hour | Features                    |
| -------------- | ------------- | --------------------------- |
| **Default**    | 1,000         | Basic API access            |
| **Premium**    | 10,000        | Financial data, analytics   |
| **Enterprise** | 100,000       | Credit bureaus, AI services |

---

## ⚡ **Rate Limiting**

Rate limits are enforced per client IP and authentication tier:

### **Rate Limit Headers**

```http
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9999
X-RateLimit-Reset: 1717574400
```

### **Rate Limit Response (429)**

```json
{
  "error": "Rate limit exceeded",
  "limit": 10000,
  "remaining": 0,
  "reset": 1717574400
}
```

---

## 🏥 **Health Check & Info**

### **Health Check**

```bash
GET /api/health
```

**Response:**

```json
{
  "status": "healthy",
  "version": "2.5.0",
  "timestamp": "2025-06-06T10:30:00.000Z",
  "services": {
    "gateway": true,
    "rate_limiter": true,
    "cache": true,
    "transformer": true,
    "router": true
  }
}
```

### **Gateway Information**

```bash
GET /api/info
```

**Response:**

```json
{
  "name": "EVA AI API Gateway",
  "version": "2.5.0",
  "environment": "staging",
  "endpoints": {
    "backend_routes": 5,
    "third_party_services": 6,
    "transformers": 10
  },
  "features": [
    "Authentication & Authorization",
    "Rate Limiting with Durable Objects",
    "Request/Response Transformation",
    "Intelligent Caching",
    "Circuit Breaker Pattern",
    "Request/Response Logging",
    "Analytics & Monitoring"
  ]
}
```

---

## 🔗 **Backend API Routes**

### **1. Financial Data Services**

```bash
GET /api/v1/financial-data
```

- **Authentication**: Required
- **Rate Limit**: Premium (10K/hour)
- **Cache**: 5 minutes
- **Transformation**: Financial data normalization

**Example Request:**

```bash
curl -H "X-API-Key: eva_your_key" \
     https://api-staging.evafi.ai/api/v1/financial-data?user_id=12345
```

**Response:**

```json
{
  "user_id": "12345",
  "accounts": [
    {
      "account_id": "acc_123",
      "balance": 2500.0,
      "currency": "USD",
      "type": "checking"
    }
  ],
  "timestamp": "2025-06-06T10:30:00.000Z",
  "source": "eva-gateway",
  "processed": true
}
```

### **2. Credit Applications**

```bash
POST /api/v1/credit-applications
GET /api/v1/credit-applications/{id}
PUT /api/v1/credit-applications/{id}
```

- **Authentication**: Required
- **Rate Limit**: Enterprise (100K/hour)
- **Cache**: None (sensitive data)
- **Transformation**: PCI-DSS compliance formatting

**Example Request:**

```bash
curl -X POST \
     -H "X-API-Key: eva_your_key" \
     -H "Content-Type: application/json" \
     -d '{
       "applicant_id": "user_123",
       "requested_amount": 50000,
       "purpose": "business_expansion"
     }' \
     https://api-staging.evafi.ai/api/v1/credit-applications
```

**Response:**

```json
{
  "application_id": "app_789",
  "status": "submitted",
  "requested_amount": 50000,
  "encrypted": true,
  "compliance": "PCI-DSS",
  "timestamp": "2025-06-06T10:30:00.000Z"
}
```

### **3. User Management**

```bash
GET /api/v1/users/{id}
PUT /api/v1/users/{id}
POST /api/v1/users
```

- **Authentication**: Required
- **Rate Limit**: Default (1K/hour)
- **Cache**: 10 minutes
- **Transformation**: GDPR compliance

### **4. Analytics & Reporting**

```bash
GET /api/v1/analytics/dashboard
GET /api/v1/analytics/reports/{type}
```

- **Authentication**: Required
- **Rate Limit**: Premium (10K/hour)
- **Cache**: 30 minutes
- **Transformation**: Anonymized aggregation

### **5. Document Processing**

```bash
POST /api/v1/documents/upload
GET /api/v1/documents/{id}
DELETE /api/v1/documents/{id}
```

- **Authentication**: Required
- **Rate Limit**: Enterprise (100K/hour)
- **Cache**: None
- **Transformation**: Secure R2 storage

---

## 🌐 **Third-Party Service Integrations**

### **1. Plaid (Financial Data)**

```bash
GET /api/v1/third-party/plaid/accounts
POST /api/v1/third-party/plaid/transactions
```

**Example Request:**

```bash
curl -H "X-API-Key: eva_your_key" \
     https://api-staging.evafi.ai/api/v1/third-party/plaid/accounts?access_token=your_token
```

**Response:**

```json
{
  "provider": "plaid",
  "data": {
    "accounts": [
      {
        "account_id": "plaid_123",
        "name": "Chase Checking",
        "type": "depository",
        "subtype": "checking"
      }
    ]
  },
  "normalized": true,
  "timestamp": "2025-06-06T10:30:00.000Z"
}
```

### **2. Yodlee (Financial Aggregation)**

```bash
GET /api/v1/third-party/yodlee/accounts
GET /api/v1/third-party/yodlee/transactions
```

### **3. Experian (Credit Bureau)**

```bash
POST /api/v1/third-party/experian/credit-report
GET /api/v1/third-party/experian/score
```

**Example Request:**

```bash
curl -X POST \
     -H "X-API-Key: eva_your_key" \
     -H "Content-Type: application/json" \
     -d '{
       "ssn": "encrypted_ssn",
       "first_name": "John",
       "last_name": "Doe"
     }' \
     https://api-staging.evafi.ai/api/v1/third-party/experian/credit-report
```

**Response:**

```json
{
  "provider": "credit_bureau",
  "data": {
    "credit_score": 750,
    "report_date": "2025-06-06"
  },
  "encrypted": true,
  "compliance": "FCRA",
  "timestamp": "2025-06-06T10:30:00.000Z"
}
```

### **4. Equifax (Credit Bureau)**

```bash
POST /api/v1/third-party/equifax/credit-check
GET /api/v1/third-party/equifax/monitoring
```

### **5. Open Banking (PSD2 Compliance)**

```bash
GET /api/v1/third-party/open-banking/accounts
POST /api/v1/third-party/open-banking/payments
```

**Response:**

```json
{
  "provider": "open_banking",
  "data": {
    "accounts": [...]
  },
  "compliance": "PSD2",
  "timestamp": "2025-06-06T10:30:00.000Z"
}
```

### **6. OpenAI (AI Services)**

```bash
POST /api/v1/third-party/openai/completions
POST /api/v1/third-party/openai/embeddings
```

**Example Request:**

```bash
curl -X POST \
     -H "X-API-Key: eva_your_key" \
     -H "Content-Type: application/json" \
     -d '{
       "model": "gpt-4",
       "prompt": "Analyze this financial data...",
       "max_tokens": 150
     }' \
     https://api-staging.evafi.ai/api/v1/third-party/openai/completions
```

**Response:**

```json
{
  "provider": "openai",
  "data": {
    "choices": [
      {
        "text": "Based on the financial data analysis...",
        "finish_reason": "stop"
      }
    ]
  },
  "model": "gpt-4",
  "timestamp": "2025-06-06T10:30:00.000Z"
}
```

---

## 🔄 **Data Transformations**

### **Financial Data Transformation**

```javascript
// Input
{ "balance": 1000, "currency": "USD" }

// Output
{
  "balance": 1000,
  "currency": "USD",
  "timestamp": "2025-06-06T10:30:00.000Z",
  "source": "eva-gateway",
  "processed": true
}
```

### **Credit Data Transformation**

```javascript
// Input
{ "score": 750, "report_date": "2025-06-06" }

// Output
{
  "score": 750,
  "report_date": "2025-06-06",
  "encrypted": true,
  "compliance": "PCI-DSS",
  "timestamp": "2025-06-06T10:30:00.000Z"
}
```

### **User Data Transformation**

```javascript
// Input
{ "name": "John Doe", "email": "john@example.com" }

// Output
{
  "name": "John Doe",
  "email": "john@example.com",
  "privacy": "GDPR-compliant",
  "last_accessed": "2025-06-06T10:30:00.000Z"
}
```

---

## 🛡️ **Security Features**

### **WAF Protection**

- **SQL Injection**: Automatic detection and blocking
- **XSS Prevention**: Script injection mitigation
- **Rate Limiting**: Configurable per endpoint
- **Geo-blocking**: Country-level restrictions

### **Data Encryption**

- **In Transit**: TLS 1.3 encryption
- **At Rest**: AES-256 encryption
- **API Keys**: Secure storage in KV namespace
- **Secrets**: Cloudflare secrets management

### **Compliance**

- **PCI DSS**: Credit card data handling
- **GDPR**: European data protection
- **CCPA**: California privacy compliance
- **FCRA**: Fair Credit Reporting Act
- **PSD2**: Payment Services Directive

---

## 📊 **Caching Strategy**

### **Cache Headers**

```http
X-Cache: HIT
X-Cached-At: 2025-06-06T10:25:00.000Z
X-Cache-TTL: 300
```

### **Cache Configuration**

| Route               | TTL   | Strategy             |
| ------------------- | ----- | -------------------- |
| Financial Data      | 300s  | Route-specific       |
| Credit Applications | 0s    | No cache (sensitive) |
| User Data           | 600s  | User-specific        |
| Analytics           | 1800s | Aggregated cache     |
| Documents           | 0s    | No cache             |

---

## 📈 **Analytics & Monitoring**

### **Performance Metrics**

- **Response Time**: <100ms average
- **Uptime**: 99.9% SLA
- **Cache Hit Rate**: >85%
- **Error Rate**: <0.1%

### **Monitoring Endpoints**

```bash
GET /api/metrics
GET /api/analytics/real-time
GET /api/health/detailed
```

### **Log Events**

- API requests and responses
- Authentication attempts
- Rate limit violations
- Error tracking
- Performance metrics

---

## 🚨 **Error Handling**

### **Standard Error Response**

```json
{
  "error": "Authentication failed",
  "message": "Valid authentication required (API Key or Bearer token)",
  "code": "AUTH_FAILED",
  "timestamp": "2025-06-06T10:30:00.000Z",
  "request_id": "req_123456"
}
```

### **Error Codes**

| Code                  | Status | Description             |
| --------------------- | ------ | ----------------------- |
| `AUTH_FAILED`         | 401    | Authentication required |
| `RATE_LIMITED`        | 429    | Rate limit exceeded     |
| `INVALID_REQUEST`     | 400    | Malformed request       |
| `NOT_FOUND`           | 404    | Route not found         |
| `SERVICE_UNAVAILABLE` | 503    | Backend service down    |
| `INTERNAL_ERROR`      | 500    | Unexpected error        |

---

## 🛠️ **Development & Testing**

### **Local Development**

```bash
# Clone and setup
git clone <repository>
cd workers
wrangler dev api-gateway-worker.js
```

### **Testing Endpoints**

```bash
# Health check
curl https://api-staging.evafi.ai/api/health

# Authentication test
curl -H "X-API-Key: demo_key" \
     https://api-staging.evafi.ai/api/v1/users

# Rate limit test
for i in {1..10}; do
  curl -H "X-API-Key: demo_key" \
       https://api-staging.evafi.ai/api/health
done
```

### **Deployment**

```bash
# Deploy to staging
./scripts/deploy-api-gateway.sh staging

# Deploy to production
./scripts/deploy-api-gateway.sh production
```

---

## 📚 **Integration Examples**

### **JavaScript/Node.js**

```javascript
const EvaAPIClient = {
  baseURL: 'https://api-staging.evafi.ai',
  apiKey: '[YOUR_API_KEY]',

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (response.status === 429) {
      throw new Error('Rate limit exceeded');
    }

    return response.json();
  },

  async getFinancialData(userId) {
    return this.request(`/api/v1/financial-data?user_id=${userId}`);
  },

  async createCreditApplication(data) {
    return this.request('/api/v1/credit-applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Usage
const financialData = await EvaAPIClient.getFinancialData('user_123');
console.log(financialData);
```

### **Python**

```python
import requests

class EvaAPIClient:
    def __init__(self, auth_token, base_url='https://api-staging.evafi.ai'):
        self.auth_token = auth_token
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'X-API-Key': auth_token,
            'Content-Type': 'application/json'
        })

    def request(self, endpoint, method='GET', data=None):
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(method, url, json=data)

        if response.status_code == 429:
            raise Exception('Rate limit exceeded')

        response.raise_for_status()
        return response.json()

    def get_financial_data(self, user_id):
        return self.request(f"/api/v1/financial-data?user_id={user_id}")

    def create_credit_application(self, application_data):
        return self.request("/api/v1/credit-applications",
                          method='POST',
                          data=application_data)

# Usage
client = EvaAPIClient('[YOUR_API_KEY]')
financial_data = client.get_financial_data('user_123')
print(financial_data)
```

### **React Frontend Integration**

```jsx
import React, { useState, useEffect } from 'react';

const useEvaAPI = apiKey => {
  const [client] = useState(() => new EvaAPIClient(apiKey));

  return {
    async getFinancialData(userId) {
      return client.getFinancialData(userId);
    },
    async createCreditApplication(data) {
      return client.createCreditApplication(data);
    },
  };
};

const FinancialDashboard = ({ userId, apiKey }) => {
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = useEvaAPI(apiKey);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getFinancialData(userId);
        setFinancialData(data);
      } catch (error) {
        console.error('Failed to load financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, api]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Financial Dashboard</h2>
      {financialData && (
        <div>
          <p>Total Balance: ${financialData.total_balance}</p>
          <p>Last Updated: {financialData.timestamp}</p>
        </div>
      )}
    </div>
  );
};
```

---

## 🔧 **Configuration Management**

### **Environment Variables**

```toml
[vars]
ENVIRONMENT = "staging"
GATEWAY_VERSION = "2.5.0"
MAX_REQUEST_SIZE = "10485760"
DEFAULT_TIMEOUT = "30000"
ENABLE_ANALYTICS = "true"
ENABLE_CACHING = "true"
```

### **Secret Management**

```bash
# Third-party API keys
wrangler secret put PLAID_API_KEY
wrangler secret put YODLEE_API_KEY
wrangler secret put OPENAI_API_KEY

# Security keys
wrangler secret put JWT_SECRET_KEY
wrangler secret put ENCRYPTION_KEY
```

---

## 📞 **Support & Contact**

### **Technical Support**

- **Phone**: 702-576-2013 (24/7)
- **Email**: support@evafi.ai
- **Emergency**: Critical infrastructure issues

### **API Support**

- **Documentation**: https://docs.evafi.ai
- **Status Page**: https://status.evafi.ai
- **Developer Portal**: https://developers.evafi.ai

---

**🎉 EVA AI API Gateway - Powering Enterprise Financial Services**

_Last Updated: June 6, 2025_  
_Version: 2.5.0_  
_Infrastructure: Cloudflare Enterprise Security_
