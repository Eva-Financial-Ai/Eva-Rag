# EVA Platform Backend Architecture

## 🏗️ System Overview

This document outlines the complete backend architecture for the EVA Platform, designed for secure, scalable commercial lending with AI-powered matching and comprehensive file management.

## 🎯 Core Requirements Addressed

- **Isolated File Storage**: Separate buckets for credit applications, KYB documents, and KYC profiles
- **Permission-Based Access**: RBAC with Cloudflare Access + Zero Trust
- **AI-Powered Matching**: RAG with fine-tuned model for 70+ lenders
- **Universal Customer Profiles**: Aggregated view with role-based switching
- **FileLock Submission Package**: Chat-based file selection and packaging
- **Edge Performance**: Cloudflare Workers, R2, D1, and RAGe integration

## 📊 Data Architecture

### Core Entities

```typescript
// Universal Customer Profile
interface CustomerProfile {
  id: string;                    // UUID
  type: 'business' | 'person';   // Entity type
  entity_id: string;             // Links to Business or Person entity
  display_name: string;          // For customer selector
  status: 'active' | 'inactive' | 'pending';
  created_at: Date;
  updated_at: Date;
  metadata: {
    industry?: string;
    risk_level?: 'low' | 'medium' | 'high';
    credit_score?: number;
    tags: string[];
  };
}

// Business Entity
interface BusinessEntity {
  id: string;
  legal_name: string;
  dba_name?: string;
  ein: string;
  industry_code: string;
  founded_year: number;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  annual_revenue?: number;
  employee_count?: number;
  kyb_status: 'pending' | 'verified' | 'rejected';
  kyb_completed_at?: Date;
}

// Person Entity
interface PersonEntity {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  ssn_hash: string;             // Encrypted SSN
  date_of_birth: Date;
  address: Address;
  phone: string;
  email: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  kyc_completed_at?: Date;
  relationship_to_business?: string; // Owner, guarantor, etc.
}

// File Management
interface SecureFile {
  id: string;
  r2_path: string;              // Full R2 object path
  bucket: FileBucket;
  original_filename: string;
  content_type: string;
  file_size: number;
  checksum: string;
  encrypted: boolean;
  uploaded_by: string;          // User ID
  entity_id: string;            // Business or Person ID
  document_type: DocumentType;
  classification: 'public' | 'confidential' | 'restricted';
  retention_policy: string;
  created_at: Date;
  expires_at?: Date;
  metadata: {
    ocr_text?: string;
    extracted_data?: Record<string, any>;
    virus_scan_status?: 'pending' | 'clean' | 'infected';
    processing_status?: 'pending' | 'processed' | 'failed';
  };
}

// File Buckets
enum FileBucket {
  CREDIT_APPLICATIONS = 'eva-credit-applications',
  KYB_DOCUMENTS = 'eva-kyb-documents',
  KYC_PROFILES = 'eva-kyc-profiles',
  TRANSACTION_EXECUTION = 'eva-transaction-execution',
  SUBMISSION_PACKAGES = 'eva-submission-packages'
}

// Document Types
enum DocumentType {
  // Credit Application Documents
  FINANCIAL_STATEMENTS = 'financial_statements',
  TAX_RETURNS = 'tax_returns',
  BANK_STATEMENTS = 'bank_statements',
  CREDIT_APPLICATION = 'credit_application',
  BUSINESS_PLAN = 'business_plan',
  
  // KYB Documents
  ARTICLES_OF_INCORPORATION = 'articles_of_incorporation',
  OPERATING_AGREEMENT = 'operating_agreement',
  BUSINESS_LICENSE = 'business_license',
  EIN_LETTER = 'ein_letter',
  CERTIFICATE_OF_GOOD_STANDING = 'certificate_of_good_standing',
  
  // KYC Documents
  DRIVERS_LICENSE = 'drivers_license',
  PASSPORT = 'passport',
  UTILITY_BILL = 'utility_bill',
  PERSONAL_FINANCIAL_STATEMENT = 'personal_financial_statement',
  
  // Transaction Execution
  LOAN_AGREEMENT = 'loan_agreement',
  PROMISSORY_NOTE = 'promissory_note',
  SECURITY_AGREEMENT = 'security_agreement',
  UCC_FILING = 'ucc_filing',
  CLOSING_DOCUMENTS = 'closing_documents'
}

// Permission System
interface FileAccessPermission {
  id: string;
  file_id: string;
  user_id: string;
  role: UserRole;
  access_level: 'read' | 'read_write' | 'admin';
  granted_by: string;
  granted_at: Date;
  expires_at?: Date;
  conditions?: {
    ip_ranges?: string[];
    device_verified?: boolean;
    mfa_required?: boolean;
  };
}

enum UserRole {
  ADMIN = 'admin',
  LENDER = 'lender',
  BROKER = 'broker',
  BORROWER = 'borrower',
  VENDOR = 'vendor',
  AUDITOR = 'auditor'
}

// FileLock Submission Package
interface SubmissionPackage {
  id: string;
  name: string;
  description?: string;
  file_ids: string[];
  created_by: string;
  customer_profile_id: string;
  target_lender_id?: string;
  status: 'draft' | 'locked' | 'submitted' | 'reviewed';
  locked_at?: Date;
  submitted_at?: Date;
  expires_at: Date;
  package_metadata: {
    total_files: number;
    total_size: number;
    document_types: DocumentType[];
    completeness_score: number;
    missing_documents?: DocumentType[];
  };
  smart_matching_results?: SmartMatchingResult[];
}

// Smart Matching System
interface LenderProfile {
  id: string;
  name: string;
  institution_type: 'bank' | 'credit_union' | 'online_lender' | 'alternative_lender';
  products: LenderProduct[];
  credit_requirements: CreditRequirements;
  geographic_coverage: string[];
  industry_preferences: string[];
  ai_model_training_data: boolean; // Consent for model training
  api_integration: {
    enabled: boolean;
    webhook_url?: string;
    api_key_hash?: string;
  };
}

interface LenderProduct {
  id: string;
  product_type: 'term_loan' | 'line_of_credit' | 'equipment_financing' | 'real_estate' | 'working_capital';
  min_amount: number;
  max_amount: number;
  min_term_months: number;
  max_term_months: number;
  interest_rate_range: {
    min: number;
    max: number;
  };
  origination_fee?: number;
  requirements: {
    min_credit_score: number;
    min_time_in_business: number;
    min_annual_revenue: number;
    max_debt_to_income: number;
    collateral_required: boolean;
    personal_guarantee_required: boolean;
  };
}

interface SmartMatchingDocument {
  id: string;
  file_id: string;
  customer_profile_id: string;
  vector_embedding: number[];     // AI-generated embeddings
  extracted_entities: {
    loan_amount?: number;
    business_name?: string;
    credit_score?: number;
    annual_revenue?: number;
    industry?: string;
    purpose?: string;
  };
  processing_status: 'pending' | 'processed' | 'failed';
  processed_at?: Date;
  model_version: string;
}

interface SmartMatchingResult {
  id: string;
  submission_package_id: string;
  lender_id: string;
  match_score: number;           // 0-100
  confidence: number;            // 0-1
  reasoning: string[];
  estimated_approval_probability: number;
  estimated_terms?: {
    interest_rate: number;
    term_months: number;
    amount: number;
  };
  generated_at: Date;
  model_version: string;
}
```

## 🔧 Cloudflare Infrastructure

### File Storage Architecture (R2)

```
eva-platform-files/
├── credit-applications/
│   ├── {customer_id}/
│   │   ├── {year}/
│   │   │   ├── {month}/
│   │   │   │   └── {file_id}.{ext}
├── kyb-documents/
│   ├── {business_id}/
│   │   ├── incorporation/
│   │   ├── licenses/
│   │   └── financial/
├── kyc-profiles/
│   ├── {person_id}/
│   │   ├── identity/
│   │   ├── address/
│   │   └── financial/
├── transaction-execution/
│   ├── {transaction_id}/
│   │   ├── agreements/
│   │   ├── security/
│   │   └── closing/
└── submission-packages/
    ├── {package_id}/
    │   ├── bundle.pdf
    │   └── metadata.json
```

### Workers Architecture

```typescript
// File Access Worker
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Extract file ID and validate access
    const fileId = path.split('/').pop();
    const user = await authenticateUser(request);
    
    if (!await hasFileAccess(user.id, fileId)) {
      return new Response('Unauthorized', { status: 403 });
    }
    
    // Fetch from R2 with proper headers
    const object = await R2_BUCKET.get(fileId);
    if (!object) {
      return new Response('File not found', { status: 404 });
    }
    
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'private, max-age=3600',
        'X-Access-Level': await getUserAccessLevel(user.id, fileId)
      }
    });
  }
};
```

### AI Integration (Workers AI + Hugging Face)

```typescript
// Smart Matching Worker
interface SmartMatchingRequest {
  customer_profile_id: string;
  document_ids: string[];
  target_amount?: number;
  loan_purpose?: string;
}

export async function handleSmartMatching(request: SmartMatchingRequest): Promise<SmartMatchingResult[]> {
  // Extract document content and metadata
  const documents = await Promise.all(
    request.document_ids.map(id => extractDocumentData(id))
  );
  
  // Generate embeddings using Workers AI
  const embeddings = await Promise.all(
    documents.map(doc => 
      ai.run('@cf/baai/bge-base-en-v1.5', {
        text: doc.extracted_text
      })
    )
  );
  
  // Query vector database for similar lender matches
  const lenderMatches = await queryLenderVectorDB(embeddings);
  
  // Use fine-tuned model for scoring
  const matchingResults = await ai.run('@hf/meta-llama/Llama-3.3-70B-Instruct', {
    messages: [
      {
        role: 'system',
        content: SMART_MATCHING_SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: JSON.stringify({
          customer_data: documents,
          potential_lenders: lenderMatches,
          request_parameters: request
        })
      }
    ]
  });
  
  return parseMatchingResults(matchingResults);
}

const SMART_MATCHING_SYSTEM_PROMPT = `
You are an expert commercial lending advisor with access to 70+ lender profiles.
Analyze the customer's financial documents and match them with the most suitable lenders.

Consider:
- Credit profile and financial strength
- Loan amount and purpose
- Industry and business type
- Lender preferences and requirements
- Geographic constraints
- Interest rates and terms

Provide match scores (0-100), confidence levels, and detailed reasoning.
`;
```

## 🔐 Security & Access Control

### Cloudflare Access Integration

```yaml
# Access Policy Configuration
access_policies:
  - name: "KYC Document Access"
    decision: "allow"
    rules:
      - require:
          - email_domain: ["evafi.ai", "authorized-partners.com"]
          - mfa: true
          - device_posture: "managed"
    applications:
      - "*.eva-platform.com/api/files/kyc/*"
  
  - name: "Credit Application Access"
    decision: "allow"
    rules:
      - require:
          - group: ["lenders", "brokers", "admin"]
          - certificate_verification: true
    applications:
      - "*.eva-platform.com/api/files/credit-applications/*"
```

### Zero Trust Device Verification

```typescript
// Device Verification Middleware
async function verifyDeviceAccess(request: Request): Promise<boolean> {
  const cfAccess = request.headers.get('CF-Access-Jwt-Assertion');
  if (!cfAccess) return false;
  
  const claims = await verifyJWT(cfAccess);
  
  // Check device posture
  const deviceInfo = claims['device_posture'];
  return deviceInfo?.managed === true && deviceInfo?.os_version_current === true;
}
```

## 📡 API Structure

### File Management APIs

```typescript
// File Upload API
POST /api/v1/files/upload
{
  "bucket": "credit_applications",
  "entity_id": "business_123",
  "document_type": "financial_statements",
  "classification": "confidential",
  "file": "<base64_data>",
  "metadata": {
    "year": 2024,
    "quarter": "Q3"
  }
}

// File Access API
GET /api/v1/files/{file_id}
Headers:
  Authorization: Bearer <jwt_token>
  CF-Access-Client-Id: <client_id>

// File Permissions API
POST /api/v1/files/{file_id}/permissions
{
  "user_id": "user_123",
  "access_level": "read",
  "expires_at": "2024-12-31T23:59:59Z",
  "conditions": {
    "mfa_required": true,
    "device_verified": true
  }
}
```

### Customer Profile APIs

```typescript
// Customer Profile API
GET /api/v1/customers/profiles
Response: CustomerProfile[]

POST /api/v1/customers/profiles
{
  "type": "business",
  "entity_data": BusinessEntity,
  "initial_files": string[]
}

// Customer Selector API
GET /api/v1/customers/selector-options
Response: {
  "active_profiles": CustomerProfile[],
  "recent_profiles": CustomerProfile[],
  "favorite_profiles": CustomerProfile[]
}
```

### Smart Matching APIs

```typescript
// Smart Matching API
POST /api/v1/smart-matching/analyze
{
  "customer_profile_id": "customer_123",
  "document_ids": ["doc_1", "doc_2"],
  "preferences": {
    "max_interest_rate": 8.5,
    "preferred_term_months": 60,
    "target_amount": 500000
  }
}

// Lender Database API
GET /api/v1/lenders/search
Query: ?product_type=term_loan&min_amount=100000&max_amount=1000000

// Model Training API (Admin only)
POST /api/v1/ai/retrain-model
{
  "training_data_ids": string[],
  "model_version": "v2.1",
  "validation_split": 0.2
}
```

### FileLock Submission Package APIs

```typescript
// Package Creation API
POST /api/v1/submission-packages
{
  "name": "ABC Corp - Equipment Financing",
  "customer_profile_id": "customer_123",
  "file_ids": ["file_1", "file_2", "file_3"],
  "target_lender_id": "lender_456"
}

// Package Locking API
POST /api/v1/submission-packages/{package_id}/lock
{
  "confirmation": true,
  "digital_signature": "<signature_data>"
}

// Package Submission API
POST /api/v1/submission-packages/{package_id}/submit
{
  "lender_id": "lender_456",
  "submission_method": "api" | "email" | "portal",
  "additional_notes": "Expedited review requested"
}
```

## 🧠 AI & ML Integration

### Vector Database Schema (D1 + External)

```sql
-- D1 Metadata Storage
CREATE TABLE smart_matching_vectors (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  customer_profile_id TEXT NOT NULL,
  vector_hash TEXT NOT NULL,
  extracted_entities JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  model_version TEXT NOT NULL
);

CREATE INDEX idx_customer_vectors ON smart_matching_vectors(customer_profile_id);
CREATE INDEX idx_model_version ON smart_matching_vectors(model_version);
```

### Hugging Face Integration

```typescript
// Hugging Face Model Interface
class HuggingFaceAI {
  private apiKey: string;
  private baseUrl = 'https://api-inference.huggingface.co';
  
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/models/sentence-transformers/all-MiniLM-L6-v2`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ inputs: text })
    });
    
    return await response.json();
  }
  
  async analyzeCreditDocument(document: string): Promise<CreditAnalysis> {
    const response = await fetch(`${this.baseUrl}/models/microsoft/DialoGPT-medium`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: `Analyze this credit document and extract key financial metrics: ${document}`,
        parameters: {
          max_length: 1000,
          temperature: 0.3
        }
      })
    });
    
    return await response.json();
  }
}
```

## 📊 Caching Strategy

### Cloudflare KV (Session Data)

```typescript
// Session Management
interface UserSession {
  user_id: string;
  active_customer_profile_id?: string;
  selected_files: string[];
  chat_context: ChatMessage[];
  permissions_cache: Record<string, boolean>;
  expires_at: number;
}

// KV Operations
async function saveUserSession(sessionId: string, session: UserSession): Promise<void> {
  await KV_SESSIONS.put(sessionId, JSON.stringify(session), {
    expirationTtl: 3600 // 1 hour
  });
}

async function getUserSession(sessionId: string): Promise<UserSession | null> {
  const data = await KV_SESSIONS.get(sessionId);
  return data ? JSON.parse(data) : null;
}
```

### Redis Caching Strategy

```typescript
// Cache Keys Structure
const CACHE_KEYS = {
  USER_PERMISSIONS: (userId: string) => `perms:${userId}`,
  FILE_METADATA: (fileId: string) => `file:${fileId}`,
  CUSTOMER_PROFILE: (profileId: string) => `customer:${profileId}`,
  SMART_MATCHING: (profileId: string) => `matching:${profileId}`,
  LENDER_PRODUCTS: (lenderId: string) => `lender:${lenderId}:products`
};

// Cache TTL Settings
const CACHE_TTL = {
  USER_PERMISSIONS: 900,      // 15 minutes
  FILE_METADATA: 3600,        // 1 hour
  CUSTOMER_PROFILE: 1800,     // 30 minutes
  SMART_MATCHING: 7200,       // 2 hours
  LENDER_PRODUCTS: 86400      // 24 hours
};
```

## 🚀 Deployment Architecture

```yaml
# Cloudflare Services Configuration
services:
  workers:
    - name: "file-access-worker"
      route: "files.eva-platform.com/*"
      bindings:
        - R2_BUCKET: "eva-platform-files"
        - KV_SESSIONS: "eva-sessions"
        - D1_DATABASE: "eva-metadata"
    
    - name: "smart-matching-worker"
      route: "api.eva-platform.com/smart-matching/*"
      bindings:
        - AI: "@cf/meta-llama/llama-3.3-70b-instruct"
        - VECTORIZE: "eva-lender-vectors"
    
    - name: "api-gateway-worker"
      route: "api.eva-platform.com/*"
      bindings:
        - D1_DATABASE: "eva-metadata"
        - KV_CACHE: "eva-cache"

  r2_buckets:
    - eva-platform-files
    - eva-submission-packages
    - eva-model-artifacts

  d1_databases:
    - eva-metadata
    - eva-audit-logs

  kv_namespaces:
    - eva-sessions
    - eva-cache
    - eva-feature-flags
```

This architecture provides a secure, scalable, and AI-powered backend system that meets all your requirements while leveraging Cloudflare's edge infrastructure for optimal performance. 