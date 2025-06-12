# EVA Finance Service Mesh API Documentation

## Overview

The EVA Finance Service Mesh provides a unified API gateway for all backend services with built-in security, reliability, and monitoring features.

## Base URL

```
Production: https://api.evafi.ai
Staging: https://api-staging.evafi.ai
```

## Authentication

All requests must include a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt-token>
```

### JWT Token Structure

```json
{
  "serviceId": "eva-frontend",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "permissions": ["credit:read", "documents:write"],
  "exp": 1234567890
}
```

## Common Headers

### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token for authentication |
| `X-Request-ID` | No | Unique request identifier (auto-generated if not provided) |
| `X-Service-ID` | Yes | Identifier of the calling service |
| `Content-Type` | Yes | Usually `application/json` |

### Response Headers

| Header | Description |
|--------|-------------|
| `X-Request-ID` | Request tracking identifier |
| `X-Response-Time` | Processing time in milliseconds |
| `X-RateLimit-Limit` | Rate limit for current tier |
| `X-RateLimit-Remaining` | Remaining requests in current window |
| `X-RateLimit-Reset` | Unix timestamp when rate limit resets |

## Endpoints

### Health Check

Check service health and upstream dependencies.

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "eva-api-gateway",
  "timestamp": "2024-01-15T10:30:00Z",
  "upstreams": {
    "credit-bureau": {
      "status": "healthy",
      "statusCode": 200
    },
    "banking": {
      "status": "healthy",
      "statusCode": 200
    }
  },
  "circuitBreakers": {
    "credit-bureau": {
      "state": "CLOSED",
      "failures": 0,
      "successCount": 1523
    }
  }
}
```

### Metrics

Get service metrics in JSON or Prometheus format.

```http
GET /metrics
```

**Response:**
```json
{
  "service": "eva-api-gateway",
  "timestamp": "2024-01-15T10:30:00Z",
  "metrics": {
    "requests": {
      "total": 15234,
      "byStatus": {
        "2xx": 14890,
        "4xx": 320,
        "5xx": 24
      }
    },
    "latency": {
      "overall": {
        "avg": 45.2,
        "p50": 35,
        "p95": 120,
        "p99": 250
      }
    }
  }
}
```

### Credit Bureau Integration

#### Get Credit Report

```http
POST /api/credit-bureau/report
```

**Request Body:**
```json
{
  "ssn": "XXX-XX-1234",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "consentId": "consent-123456"
}
```

**Response:**
```json
{
  "reportId": "rpt-123456",
  "score": 750,
  "scoreRange": {
    "min": 300,
    "max": 850
  },
  "accounts": [...],
  "inquiries": [...],
  "publicRecords": []
}
```

#### Get Credit Score Only

```http
GET /api/credit-bureau/score/{ssn}
```

**Response:**
```json
{
  "score": 750,
  "scoreDate": "2024-01-15",
  "factors": [
    "Payment history",
    "Credit utilization"
  ]
}
```

### Banking API Integration

#### Connect Bank Account

```http
POST /api/banking/connect
```

**Request Body:**
```json
{
  "institutionId": "ins_109508",
  "credentials": {
    "username": "user123",
    "password": "encrypted_password"
  }
}
```

**Response:**
```json
{
  "connectionId": "conn-123456",
  "accounts": [
    {
      "accountId": "acc-789",
      "name": "Checking",
      "type": "depository",
      "subtype": "checking",
      "balance": {
        "available": 1500.00,
        "current": 1500.00
      }
    }
  ]
}
```

#### Get Account Transactions

```http
GET /api/banking/accounts/{accountId}/transactions
```

**Query Parameters:**
- `startDate` (required): ISO 8601 date
- `endDate` (required): ISO 8601 date
- `limit` (optional): Max results (default: 100)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "transactions": [
    {
      "transactionId": "txn-123",
      "accountId": "acc-789",
      "amount": -50.00,
      "date": "2024-01-14",
      "name": "Coffee Shop",
      "category": ["Food and Drink", "Restaurants"]
    }
  ],
  "total": 245,
  "hasMore": true
}
```

### Document Processing

#### Upload Document

```http
POST /api/documents/upload
```

**Request:** Multipart form data
- `file`: Document file (PDF, JPG, PNG)
- `type`: Document type (bank_statement, tax_return, etc.)
- `metadata`: JSON metadata

**Response:**
```json
{
  "documentId": "doc-123456",
  "status": "processing",
  "uploadedAt": "2024-01-15T10:30:00Z",
  "estimatedProcessingTime": 30
}
```

#### Get Document Status

```http
GET /api/documents/{documentId}/status
```

**Response:**
```json
{
  "documentId": "doc-123456",
  "status": "completed",
  "processedAt": "2024-01-15T10:31:00Z",
  "extractedData": {
    "documentType": "bank_statement",
    "accountNumber": "****1234",
    "statementPeriod": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "transactions": 145,
    "totalDeposits": 5000.00,
    "totalWithdrawals": 3500.00
  }
}
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error type",
  "details": "Detailed error message",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Invalid or missing authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 502 | Bad Gateway | Upstream service error |
| 503 | Service Unavailable | Circuit breaker open |

## Rate Limiting

Rate limits are applied per service and user tier:

### Service Limits

| Service | Requests/Minute | Requests/Hour | Cost/Request |
|---------|----------------|---------------|--------------|
| Credit Bureau | 10 | 300 | $0.25 |
| Banking API | 30 | 1000 | $0.10 |
| Document Processor | 20 | 500 | $0.05 |

### User Tier Limits

| Tier | Requests/Minute | Requests/Hour | Requests/Day |
|------|----------------|---------------|--------------|
| Anonymous | 5 | 50 | - |
| Authenticated | 30 | 500 | 5000 |
| Premium | 100 | 2000 | 20000 |

## Circuit Breaker States

Services are protected by circuit breakers with three states:

1. **CLOSED**: Normal operation
2. **OPEN**: Service is failing, requests are blocked
3. **HALF_OPEN**: Testing if service has recovered

### Circuit Breaker Configuration

| Service | Failure Threshold | Reset Timeout | Timeout |
|---------|------------------|---------------|---------|
| Credit Bureau | 3 failures | 60 seconds | 10 seconds |
| Banking API | 5 failures | 30 seconds | 15 seconds |
| Document Processor | 5 failures | 45 seconds | 20 seconds |

## WebSocket Support (Coming Soon)

Real-time updates for long-running operations:

```javascript
const ws = new WebSocket('wss://api.evafi.ai/ws');

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    documentId: 'doc-123456'
  }));
});

ws.on('message', (data) => {
  const update = JSON.parse(data);
  console.log('Processing update:', update);
});
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { EvaServiceMesh } from '@eva-finance/service-mesh-sdk';

const client = new EvaServiceMesh({
  baseURL: 'https://api.evafi.ai',
  serviceId: 'eva-frontend',
  apiKey: process.env.EVA_API_KEY
});

// Get credit report
const report = await client.creditBureau.getReport({
  ssn: 'XXX-XX-1234',
  consentId: 'consent-123'
});

// Handle circuit breaker
try {
  const data = await client.banking.getTransactions(accountId);
} catch (error) {
  if (error.code === 'CIRCUIT_BREAKER_OPEN') {
    // Service temporarily unavailable
    console.log('Banking service is down, try again later');
  }
}
```

### Python

```python
from eva_service_mesh import EvaClient

client = EvaClient(
    base_url="https://api.evafi.ai",
    service_id="eva-frontend",
    api_key=os.environ["EVA_API_KEY"]
)

# Upload document with retry
document = client.documents.upload(
    file_path="bank_statement.pdf",
    document_type="bank_statement",
    retry_policy={"max_retries": 3}
)

# Poll for completion
while document.status == "processing":
    time.sleep(5)
    document.refresh()
```

## Changelog

### Version 1.0.0 (January 2025)
- Initial service mesh implementation
- Zero-trust authentication
- Circuit breakers for all external services
- Rate limiting and monitoring

---

For additional support, contact the platform team or refer to the [Service Mesh Setup Guide](./SERVICE_MESH_SETUP.md).