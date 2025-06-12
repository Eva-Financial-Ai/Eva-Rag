# 📋 EVA Financial Platform - API Documentation

## 🚀 **Overview**

The EVA Financial Platform provides a comprehensive REST API for document management with AI-powered processing, blockchain verification, and enterprise-grade security.

**Base URL**: `https://your-worker.your-subdomain.workers.dev` (Production)  
**Local URL**: `http://localhost:8787` (Development)

---

## 🔐 **Authentication**

All API endpoints require authentication via JWT tokens or API keys.

### **Headers**

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-API-Key: <api_key> (optional alternative)
```

---

## 📄 **Document Management**

### **Upload Documents**

Upload one or more documents for AI processing.

```http
POST /api/documents/upload
```

#### **Request**

**Content-Type**: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Document file (PDF, DOC, XLS, images) |
| `transactionId` | String | No | Associated transaction ID |
| `metadata` | JSON String | No | Additional document metadata |

#### **Example Request**

```bash
curl -X POST http://localhost:8787/api/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@loan-application.pdf" \
  -F "transactionId=txn_12345" \
  -F "metadata={\"department\":\"lending\",\"priority\":\"high\"}"
```

#### **Response**

```json
{
  "success": true,
  "documentId": "doc_abc123",
  "workflowId": "wf_xyz789",
  "status": "processing",
  "message": "Document uploaded successfully and processing started"
}
```

#### **Error Response**

```json
{
  "success": false,
  "error": "File size exceeds 50MB limit",
  "code": "FILE_TOO_LARGE"
}
```

---

### **Get Document Status**

Check the processing status of an uploaded document.

```http
GET /api/documents/status?documentId={documentId}
```

#### **Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `documentId` | String | Yes | Unique document identifier |

#### **Example Request**

```bash
curl -X GET "http://localhost:8787/api/documents/status?documentId=doc_abc123" \
  -H "Authorization: Bearer <token>"
```

#### **Response**

```json
{
  "documentId": "doc_abc123",
  "status": "processed",
  "metadata": {
    "originalName": "loan-application.pdf",
    "fileType": "application/pdf",
    "fileSize": 2048576
  },
  "processingResults": {
    "ocrText": "Extracted text content...",
    "ocrConfidence": 0.94,
    "blockchainTxId": "0x1234567890abcdef",
    "vectorId": "vec_789xyz",
    "searchIndexed": true
  },
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:32:15Z"
}
```

#### **Status Values**

| Status | Description |
|--------|-------------|
| `uploaded` | File uploaded, awaiting processing |
| `processing` | AI processing in progress |
| `processed` | Processing completed successfully |
| `failed` | Processing failed |
| `archived` | Document archived |

---

### **Search Documents**

Perform RAG-powered semantic search across documents.

```http
POST /api/documents/search
```

#### **Request Body**

```json
{
  "query": "What are the key financial metrics in loan applications?",
  "transactionId": "txn_12345", // optional
  "limit": 10, // optional, default 5
  "threshold": 0.7 // optional confidence threshold
}
```

#### **Example Request**

```bash
curl -X POST http://localhost:8787/api/documents/search \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "loan terms and conditions",
    "transactionId": "txn_12345"
  }'
```

#### **Response**

```json
{
  "answer": "Based on the documents, the key loan terms include a 5-year term with 4.5% interest rate...",
  "sources": [
    {
      "documentId": "doc_abc123",
      "confidence": 0.92,
      "snippet": "Term: 5 years, Interest Rate: 4.5% APR..."
    },
    {
      "documentId": "doc_def456",
      "confidence": 0.87,
      "snippet": "Loan conditions specify monthly payments..."
    }
  ],
  "confidence": 0.89,
  "responseTime": "1.2s"
}
```

---

### **Download Document**

Download the original document file.

```http
GET /api/documents/download/{documentId}
```

#### **Example Request**

```bash
curl -X GET http://localhost:8787/api/documents/download/doc_abc123 \
  -H "Authorization: Bearer <token>" \
  -o downloaded-document.pdf
```

#### **Response**

Returns the original file with appropriate `Content-Type` and `Content-Disposition` headers.

---

### **Share Document**

Share a document with another user.

```http
POST /api/documents/share
```

#### **Request Body**

```json
{
  "documentId": "doc_abc123",
  "email": "user@company.com",
  "permission": "view" // "view", "edit", or "sign"
}
```

#### **Response**

```json
{
  "success": true,
  "shareId": "share_xyz789",
  "message": "Document shared successfully"
}
```

---

### **Verify Document**

Verify document integrity using blockchain records.

```http
GET /api/documents/verify/{documentId}
```

#### **Response**

```json
{
  "verified": true,
  "txHash": "0x1234567890abcdef",
  "blockNumber": 12345678,
  "timestamp": "2025-01-15T10:32:15Z",
  "network": "Ethereum",
  "integrity": "intact"
}
```

---

## 📊 **Analytics & Reporting**

### **Document Analytics**

Get usage analytics for a specific document.

```http
GET /api/documents/analytics/{documentId}
```

#### **Response**

```json
{
  "views": 45,
  "downloads": 12,
  "shares": 3,
  "lastAccessed": "2025-01-15T14:30:00Z",
  "accessHistory": [
    {
      "user": "john.doe@company.com",
      "action": "view",
      "timestamp": "2025-01-15T14:30:00Z"
    }
  ]
}
```

### **Audit Trail**

Get complete audit trail for a document.

```http
GET /api/documents/audit/{documentId}
```

#### **Response**

```json
{
  "documentId": "doc_abc123",
  "auditTrail": [
    {
      "timestamp": "2025-01-15T10:30:00Z",
      "action": "upload",
      "user": "system",
      "details": "Document uploaded via API"
    },
    {
      "timestamp": "2025-01-15T10:32:00Z",
      "action": "ocr_complete",
      "user": "system",
      "details": "OCR processing completed with 94% confidence"
    }
  ]
}
```

---

## 🔄 **Webhook Events**

The API supports webhooks for real-time notifications.

### **Event Types**

| Event | Description |
|-------|-------------|
| `document.uploaded` | Document successfully uploaded |
| `document.processed` | AI processing completed |
| `document.failed` | Processing failed |
| `document.shared` | Document shared with user |
| `document.accessed` | Document viewed or downloaded |

### **Webhook Payload**

```json
{
  "event": "document.processed",
  "timestamp": "2025-01-15T10:32:15Z",
  "data": {
    "documentId": "doc_abc123",
    "status": "processed",
    "processingResults": {
      "ocrConfidence": 0.94,
      "blockchainTxId": "0x1234567890abcdef"
    }
  }
}
```

---

## ⚡ **Rate Limits**

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| Upload | 10 requests | 1 minute |
| Search | 100 requests | 1 minute |
| Status | 200 requests | 1 minute |
| Download | 50 requests | 1 minute |

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

---

## 🚨 **Error Codes**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_FILE_TYPE` | 400 | Unsupported file format |
| `FILE_TOO_LARGE` | 400 | File exceeds size limit |
| `DOCUMENT_NOT_FOUND` | 404 | Document ID not found |
| `PROCESSING_FAILED` | 500 | AI processing error |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `INSUFFICIENT_PERMISSIONS` | 403 | Insufficient access rights |

### **Error Response Format**

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "additional": "context if applicable"
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## 📝 **SDK Examples**

### **JavaScript/TypeScript**

```typescript
import { 
  uploadDocuments, 
  getDocumentStatus, 
  searchDocuments 
} from './api/documentAPI';

// Upload document
const files = [document.getElementById('file').files[0]];
const results = await uploadDocuments(files, 'txn_12345');

// Check status
const status = await getDocumentStatus(results[0].documentId);

// Search documents
const searchResult = await searchDocuments({
  query: "loan application requirements",
  transactionId: "txn_12345"
});
```

### **Python**

```python
import requests

# Upload document
files = {'file': open('document.pdf', 'rb')}
data = {'transactionId': 'txn_12345'}
response = requests.post(
    'http://localhost:8787/api/documents/upload',
    files=files,
    data=data,
    headers={'Authorization': 'Bearer <token>'}
)

# Search documents
search_data = {
    'query': 'loan application requirements',
    'transactionId': 'txn_12345'
}
response = requests.post(
    'http://localhost:8787/api/documents/search',
    json=search_data,
    headers={'Authorization': 'Bearer <token>'}
)
```

### **cURL Examples**

```bash
# Upload with metadata
curl -X POST http://localhost:8787/api/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf" \
  -F "transactionId=txn_12345" \
  -F "metadata={\"priority\":\"high\"}"

# Check processing status
curl -X GET "http://localhost:8787/api/documents/status?documentId=doc_123" \
  -H "Authorization: Bearer <token>"

# Semantic search
curl -X POST http://localhost:8787/api/documents/search \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"query": "financial statements", "limit": 5}'
```

---

## 🔧 **Testing**

### **Health Check**

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "storage": "connected",
    "ai": "connected",
    "vectorize": "connected"
  }
}
```

### **Test Endpoints**

For development and testing purposes:

```http
POST /api/test/upload-sample
GET /api/test/status
POST /api/test/search-sample
```

---

*Last Updated: January 15, 2025*  
*API Version: 1.0.0*  
*Documentation Status: Complete* ✅ 