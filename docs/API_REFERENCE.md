# 📚 API Reference

## 📋 Overview

This document provides comprehensive API documentation for the EVA Platform, including all endpoints for RAG (Retrieval-Augmented Generation), AI agent management, personalization, and Cloudflare integration.

## 🔐 Authentication

All API requests require authentication via JWT tokens or API keys.

### Authentication Headers

```http
Authorization: Bearer <jwt_token>
X-API-Key: <api_key>
Content-Type: application/json
```

### Authentication Flow

```typescript
// Login request
POST /api/auth/login
{
  "email": "user@eva-platform.com",
  "password": "secure_password"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "expiresIn": 3600,
  "user": {
    "id": "user-123",
    "email": "user@eva-platform.com",
    "role": "lender"
  }
}
```

## 🤖 AI Agent Management

### Create Custom AI Agent

```http
POST /api/agents
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Risk Assessment Specialist",
  "fullName": "Advanced Risk Assessment Specialist",
  "model": "eva-financial-risk-70b",
  "userRole": "lender",
  "transactionType": "commercial-lending",
  "tone": "Professional",
  "length": "Adaptive",
  "enableRAG": true,
  "ragDatabases": ["platform-knowledge", "regulatory-data"],
  "icon": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "priorityFeatures": "Focus on risk assessment and compliance",
  "performanceGoals": "Reduce decision time by 50%"
}
```

### Response

```json
{
  "id": "agent-123",
  "name": "Risk Assessment Specialist",
  "fullName": "Advanced Risk Assessment Specialist",
  "model": "eva-financial-risk-70b",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "storageQuota": {
    "used": 0,
    "limit": 87960930222,
    "percentage": 0
  },
  "capabilities": ["financial-analysis", "risk-assessment", "compliance", "advanced-reasoning"]
}
```

### List Agents

```http
GET /api/agents?page=1&limit=10&role=lender
Authorization: Bearer <token>
```

### Response

```json
{
  "agents": [
    {
      "id": "agent-123",
      "name": "Risk Assessment Specialist",
      "model": "eva-financial-risk-70b",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z",
      "storageUsed": 1234567890,
      "documentCount": 15
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Update Agent

```http
PUT /api/agents/{agentId}
Authorization: Bearer <token>

{
  "name": "Updated Agent Name",
  "priorityFeatures": "Updated features"
}
```

### Delete Agent

```http
DELETE /api/agents/{agentId}
Authorization: Bearer <token>
```

## 📚 RAG Document Management

### Upload Document

```http
POST /api/agents/{agentId}/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file_data>
chunkSize: 1000
overlap: 200
language: en
embeddingModel: text-embedding-3-large
validateFinancialData: true
encryptSensitiveData: true
```

### Response

```json
{
  "uploadId": "upload-123",
  "documentId": "doc-456",
  "fileName": "financial-report-2024.pdf",
  "fileSize": 2048576,
  "status": "processing",
  "estimatedProcessingTime": 120,
  "processingStages": ["uploading", "extracting", "chunking", "embedding", "indexing"]
}
```

### Get Upload Status

```http
GET /api/agents/{agentId}/documents/{uploadId}/status
Authorization: Bearer <token>
```

### Response

```json
{
  "uploadId": "upload-123",
  "status": "complete",
  "progress": 100,
  "currentStage": "complete",
  "processingTime": 95,
  "vectorsStored": 48,
  "error": null,
  "result": {
    "documentId": "doc-456",
    "chunks": 48,
    "embeddingModel": "text-embedding-3-large",
    "storageUsed": 2048576
  }
}
```

### List Documents

```http
GET /api/agents/{agentId}/documents?page=1&limit=20
Authorization: Bearer <token>
```

### Response

```json
{
  "documents": [
    {
      "id": "doc-456",
      "name": "financial-report-2024.pdf",
      "size": 2048576,
      "status": "ready",
      "uploadDate": "2024-01-15T10:30:00Z",
      "vectorChunks": 48,
      "embeddingModel": "text-embedding-3-large",
      "metadata": {
        "pageCount": 12,
        "wordCount": 3456,
        "language": "en"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  },
  "storageQuota": {
    "used": 10485760,
    "limit": 87960930222,
    "percentage": 0.01
  }
}
```

### Delete Document

```http
DELETE /api/agents/{agentId}/documents/{documentId}
Authorization: Bearer <token>
```

### Query RAG Knowledge

```http
POST /api/agents/{agentId}/query
Authorization: Bearer <token>

{
  "query": "What are the key risk factors in commercial lending?",
  "maxResults": 10,
  "relevanceThreshold": 0.7,
  "includeMetadata": true
}
```

### Response

```json
{
  "query": "What are the key risk factors in commercial lending?",
  "context": "Based on your uploaded documents, the key risk factors in commercial lending include: credit risk, market risk, operational risk...",
  "sources": [
    {
      "documentId": "doc-456",
      "documentName": "risk-assessment-guide.pdf",
      "chunkIndex": 5,
      "relevanceScore": 0.89,
      "pageNumber": 12,
      "text": "Credit risk is the primary concern in commercial lending..."
    }
  ],
  "totalMatches": 8,
  "processingTime": 234
}
```

## 🎯 Personalization API

### Start Personalization Session

```http
POST /api/agents/{agentId}/personalization
Authorization: Bearer <token>

{
  "uploadedDataSources": ["doc-123", "doc-456"],
  "selectedModel": "eva-financial-risk-70b"
}
```

### Response

```json
{
  "sessionId": "session-789",
  "status": "analyzing",
  "progress": 0,
  "estimatedTime": 60,
  "analysisInsights": {
    "documentTypes": ["Financial Statements", "Risk Reports"],
    "suggestedUseCases": ["Risk Assessment", "Compliance Monitoring"],
    "riskFactors": ["Market Volatility", "Credit Risk"]
  }
}
```

### Get Personalization Questions

```http
GET /api/agents/{agentId}/personalization/{sessionId}/questions
Authorization: Bearer <token>
```

### Response

```json
{
  "sessionId": "session-789",
  "questions": [
    {
      "id": "q1",
      "question": "What is the primary business use case for this uploaded data?",
      "context": "Understanding your main objective helps me optimize responses for your specific needs.",
      "suggestedAnswer": "Risk assessment and compliance monitoring",
      "category": "business-objective",
      "isRequired": true,
      "userAnswer": null
    },
    {
      "id": "q2",
      "question": "What types of financial decisions will employees make using this information?",
      "context": "This helps me prioritize the most relevant insights and recommendations.",
      "suggestedAnswer": "Loan approvals, risk ratings, and compliance reviews",
      "category": "operational-context",
      "isRequired": true,
      "userAnswer": null
    }
  ]
}
```

### Submit Question Answers

```http
PUT /api/agents/{agentId}/personalization/{sessionId}/questions
Authorization: Bearer <token>

{
  "answers": [
    {
      "questionId": "q1",
      "answer": "Primary use case is risk assessment and regulatory compliance"
    },
    {
      "questionId": "q2",
      "answer": "Loan approvals, risk ratings, portfolio analysis"
    }
  ]
}
```

### Get Organizational Goals

```http
GET /api/agents/{agentId}/personalization/{sessionId}/goals
Authorization: Bearer <token>
```

### Response

```json
{
  "sessionId": "session-789",
  "goals": [
    {
      "id": "goal1",
      "title": "Improve Decision Speed",
      "description": "Reduce time required to make financial decisions by providing instant access to relevant data",
      "priority": "high",
      "category": "efficiency",
      "measurable": true,
      "targetMetric": "50% reduction in decision time",
      "isActive": true
    },
    {
      "id": "goal2",
      "title": "Enhance Risk Assessment Accuracy",
      "description": "Improve accuracy of risk evaluations through comprehensive data analysis",
      "priority": "high",
      "category": "accuracy",
      "measurable": true,
      "targetMetric": "25% improvement in risk prediction accuracy",
      "isActive": true
    }
  ]
}
```

### Update Organizational Goals

```http
PUT /api/agents/{agentId}/personalization/{sessionId}/goals
Authorization: Bearer <token>

{
  "goals": [
    {
      "id": "goal1",
      "title": "Improve Decision Speed",
      "description": "Reduce time required to make financial decisions",
      "priority": "high",
      "targetMetric": "60% reduction in decision time",
      "isActive": true
    }
  ]
}
```

### Complete Personalization

```http
POST /api/agents/{agentId}/personalization/{sessionId}/complete
Authorization: Bearer <token>
```

### Response

```json
{
  "sessionId": "session-789",
  "status": "complete",
  "completedAt": "2024-01-15T11:45:00Z",
  "personalizationSummary": {
    "questionsAnswered": 6,
    "goalsConfigured": 6,
    "activeGoals": 5,
    "modelOptimizations": [
      "Enhanced risk assessment focus",
      "Compliance-first recommendations",
      "Technical depth adjusted for mixed experience levels"
    ]
  }
}
```

## 🌩️ Cloudflare R2 Integration

### Setup R2 Configuration

```http
POST /api/agents/{agentId}/storage/r2/setup
Authorization: Bearer <token>

{
  "apiToken": "cloudflare_api_token",
  "accountId": "cloudflare_account_id",
  "bucketName": "eva-agent-storage",
  "autoRAG": true,
  "encryption": true,
  "region": "WNAM"
}
```

### Response

```json
{
  "configId": "r2-config-123",
  "status": "validating",
  "bucketName": "eva-agent-storage",
  "region": "WNAM",
  "autoRAG": true,
  "encryption": true,
  "validationSteps": [
    {
      "step": "api_validation",
      "status": "complete",
      "message": "API token validated successfully"
    },
    {
      "step": "bucket_creation",
      "status": "in_progress",
      "message": "Creating storage bucket"
    },
    {
      "step": "vectorize_setup",
      "status": "pending",
      "message": "Waiting for bucket creation"
    }
  ]
}
```

### Get R2 Configuration Status

```http
GET /api/agents/{agentId}/storage/r2/status
Authorization: Bearer <token>
```

### Response

```json
{
  "configId": "r2-config-123",
  "status": "ready",
  "bucketName": "eva-agent-storage",
  "region": "WNAM",
  "autoRAG": true,
  "encryption": true,
  "storageUsed": 1048576,
  "storageLimit": 87960930222,
  "vectorizeIndex": "eva-knowledge-base-123",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Test R2 Connection

```http
POST /api/agents/{agentId}/storage/r2/test
Authorization: Bearer <token>
```

### Response

```json
{
  "connectionTest": {
    "status": "success",
    "latency": 45,
    "region": "WNAM",
    "timestamp": "2024-01-15T12:00:00Z"
  },
  "bucketTest": {
    "status": "success",
    "readable": true,
    "writable": true
  },
  "vectorizeTest": {
    "status": "success",
    "indexExists": true,
    "vectorCount": 1234
  }
}
```

## 🔍 AI Model Management

### List Available Models

```http
GET /api/models?category=all&active=true
Authorization: Bearer <token>
```

### Response

```json
{
  "models": [
    {
      "id": "thor-lightning-235b",
      "name": "Thor Lightning Model",
      "description": "Our most powerful model for deep research and analytics",
      "costPerToken": 0.008,
      "contextWindow": 200000,
      "category": "premium",
      "capabilities": ["ultra-advanced-reasoning", "deep-research", "complex-analytics"],
      "isActive": true,
      "requiresR2": false
    },
    {
      "id": "eva-general-purpose-7b",
      "name": "Eva General Purpose Model",
      "description": "Efficient 7B parameter model for everyday tasks with finetuned data and RAG",
      "costPerToken": 0.0003,
      "contextWindow": 32000,
      "category": "economical",
      "capabilities": ["general-reasoning", "document-processing"],
      "isActive": true,
      "requiresR2": true
    }
  ]
}
```

### Get Model Details

```http
GET /api/models/{modelId}
Authorization: Bearer <token>
```

### Response

```json
{
  "id": "eva-financial-risk-70b",
  "name": "EVA Financial Model Risk Model",
  "description": "Specialized 70B model optimized for financial risk assessment",
  "costPerToken": 0.003,
  "contextWindow": 128000,
  "category": "premium",
  "capabilities": ["financial-analysis", "risk-assessment", "compliance"],
  "isActive": true,
  "requiresR2": false,
  "performance": {
    "averageResponseTime": 1200,
    "accuracy": 0.94,
    "uptime": 99.9
  },
  "pricing": {
    "tierPricing": [
      {
        "tier": "basic",
        "tokensIncluded": 100000,
        "costPerAdditionalToken": 0.003
      }
    ]
  }
}
```

### Query AI Model

```http
POST /api/models/{modelId}/query
Authorization: Bearer <token>

{
  "prompt": "Analyze the risk factors in this commercial loan application",
  "context": "Borrower has 5 years in business, $2M annual revenue, requesting $500K loan",
  "agentId": "agent-123",
  "useRAG": true,
  "temperature": 0.7,
  "maxTokens": 1000
}
```

### Response

```json
{
  "id": "query-456",
  "model": "eva-financial-risk-70b",
  "response": "Based on the information provided and your uploaded risk assessment guidelines, here are the key risk factors to consider for this commercial loan application...",
  "sources": [
    {
      "documentId": "doc-123",
      "relevanceScore": 0.89,
      "excerpt": "Commercial loans to businesses with 3-7 years of operation..."
    }
  ],
  "usage": {
    "promptTokens": 150,
    "completionTokens": 400,
    "totalTokens": 550,
    "cost": 0.00165
  },
  "processingTime": 1234,
  "timestamp": "2024-01-15T12:00:00Z"
}
```

## 📊 Analytics & Monitoring

### Get Agent Analytics

```http
GET /api/agents/{agentId}/analytics?timeRange=7d&metrics=usage,performance,storage
Authorization: Bearer <token>
```

### Response

```json
{
  "agentId": "agent-123",
  "timeRange": "7d",
  "analytics": {
    "usage": {
      "totalQueries": 245,
      "averageQueriesPerDay": 35,
      "uniqueUsers": 12,
      "topQueryTypes": [
        {
          "type": "risk-assessment",
          "count": 89,
          "percentage": 36.3
        },
        {
          "type": "compliance-check",
          "count": 67,
          "percentage": 27.3
        }
      ]
    },
    "performance": {
      "averageResponseTime": 1456,
      "p95ResponseTime": 2340,
      "successRate": 99.2,
      "errorRate": 0.8,
      "cacheHitRate": 23.5
    },
    "storage": {
      "documentsUploaded": 3,
      "storageUsed": 15728640,
      "storagePercentage": 0.018,
      "vectorsStored": 156,
      "mostUsedDocuments": [
        {
          "documentId": "doc-123",
          "name": "risk-guidelines.pdf",
          "queryCount": 45
        }
      ]
    },
    "goalAlignment": {
      "overallScore": 0.87,
      "goalScores": [
        {
          "goalId": "goal1",
          "title": "Improve Decision Speed",
          "score": 0.92,
          "trend": "improving"
        }
      ]
    }
  }
}
```

### Get System Health

```http
GET /api/system/health
Authorization: Bearer <token>
```

### Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "services": [
    {
      "name": "api",
      "status": "healthy",
      "responseTime": 45,
      "uptime": 99.99
    },
    {
      "name": "database",
      "status": "healthy",
      "responseTime": 12,
      "connections": 15
    },
    {
      "name": "cloudflare-r2",
      "status": "healthy",
      "responseTime": 89,
      "region": "WNAM"
    },
    {
      "name": "vectorize",
      "status": "healthy",
      "responseTime": 156,
      "vectorCount": 12456
    }
  ],
  "metrics": {
    "requestsPerMinute": 145,
    "averageResponseTime": 234,
    "errorRate": 0.002
  }
}
```

## ⚠️ Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid file type. Only PDF, DOCX, XLSX, CSV, and TXT files are supported.",
    "details": {
      "field": "file",
      "receivedType": "image/jpeg",
      "allowedTypes": [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ]
    },
    "timestamp": "2024-01-15T12:00:00Z",
    "requestId": "req-123456"
  }
}
```

### Error Codes

| Code                  | HTTP Status | Description                    |
| --------------------- | ----------- | ------------------------------ |
| `VALIDATION_ERROR`    | 400         | Request validation failed      |
| `UNAUTHORIZED`        | 401         | Authentication required        |
| `FORBIDDEN`           | 403         | Insufficient permissions       |
| `NOT_FOUND`           | 404         | Resource not found             |
| `QUOTA_EXCEEDED`      | 429         | Storage or rate limit exceeded |
| `PROCESSING_ERROR`    | 422         | Document processing failed     |
| `INTERNAL_ERROR`      | 500         | Server error                   |
| `SERVICE_UNAVAILABLE` | 503         | External service unavailable   |

### Rate Limiting

```http
# Rate limit headers included in all responses
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248600
```

## 🔧 Development & Testing

### Webhook Endpoints

```http
# Document processing completion
POST /webhooks/document-processed
{
  "agentId": "agent-123",
  "documentId": "doc-456",
  "status": "complete",
  "processingTime": 95,
  "vectorsStored": 48
}

# Personalization session completion
POST /webhooks/personalization-complete
{
  "agentId": "agent-123",
  "sessionId": "session-789",
  "status": "complete",
  "goalCount": 6
}
```

### API Testing

```bash
# Health check
curl -X GET "https://api.eva-platform.com/health" \
  -H "Authorization: Bearer $TOKEN"

# Upload document
curl -X POST "https://api.eva-platform.com/api/agents/agent-123/documents" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@document.pdf" \
  -F "chunkSize=1000" \
  -F "embeddingModel=text-embedding-3-large"

# Query RAG
curl -X POST "https://api.eva-platform.com/api/agents/agent-123/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the key risk factors?",
    "maxResults": 5
  }'
```

## 📝 SDK Examples

### TypeScript SDK

```typescript
import { EVAPlatformSDK } from '@eva-platform/sdk';

const eva = new EVAPlatformSDK({
  apiKey: 'your-api-key',
  baseURL: 'https://api.eva-platform.com',
});

// Create agent
const agent = await eva.agents.create({
  name: 'Risk Specialist',
  model: 'eva-financial-risk-70b',
  userRole: 'lender',
});

// Upload document
const document = await eva.documents.upload(agent.id, {
  file: fileData,
  chunkSize: 1000,
  embeddingModel: 'text-embedding-3-large',
});

// Query knowledge
const response = await eva.query(agent.id, {
  query: 'What are the compliance requirements?',
  maxResults: 10,
});
```

### Python SDK

```python
from eva_platform import EVAPlatformClient

client = EVAPlatformClient(
    api_key="your-api-key",
    base_url="https://api.eva-platform.com"
)

# Create agent
agent = client.agents.create(
    name="Risk Specialist",
    model="eva-financial-risk-70b",
    user_role="lender"
)

# Upload document
with open("document.pdf", "rb") as f:
    document = client.documents.upload(
        agent_id=agent.id,
        file=f,
        chunk_size=1000,
        embedding_model="text-embedding-3-large"
    )

# Query knowledge
response = client.query(
    agent_id=agent.id,
    query="What are the compliance requirements?",
    max_results=10
)
```

---

For more information, see:

- [Developer Guide](DEVELOPER_GUIDE.md)
- [Cloudflare Infrastructure](CLOUDFLARE_INFRASTRUCTURE.md)
- [RAG Implementation](RAG_IMPLEMENTATION.md)
- [Security Guide](SECURITY_GUIDE.md)
