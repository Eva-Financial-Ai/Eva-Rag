# Business Lookup & Verification System
## Complete Implementation Guide

### 🎯 Overview

The Business Lookup & Verification System is a comprehensive solution that searches business records across all 50 US states using AI-powered tools. It integrates with EVA to provide instant access to business information, documents, and compliance status.

### 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   EVA Chat      │───▶│  Business Lookup │───▶│  Cloudflare AI  │
│   Interface     │    │  Tool            │    │  + Brave Search │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Customer      │◀───│  State Registry  │───▶│  Document       │
│   Vector DB     │    │  APIs/Scrapers   │    │  Storage (R2)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Supabase        │
                       │  Metadata Store  │
                       └──────────────────┘
```

### 🚀 Quick Setup

#### 1. Environment Configuration

Create a `.env.local` file with the following variables:

```bash
# Business Lookup System - Cloudflare Workers AI
REACT_APP_CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
REACT_APP_CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
REACT_APP_CLOUDFLARE_WORKERS_ENDPOINT=https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/ai/run

# Business Lookup System - Brave Search
REACT_APP_BRAVE_SEARCH_API_KEY=your-brave-search-api-key
REACT_APP_BRAVE_SEARCH_ENDPOINT=https://api.search.brave.com/res/v1/web/search

# Business Lookup System - Cloudflare R2 Storage
REACT_APP_CLOUDFLARE_R2_ACCOUNT_ID=your-cloudflare-r2-account-id
REACT_APP_CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key-id
REACT_APP_CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
REACT_APP_CLOUDFLARE_R2_BUCKET_NAME=business-documents
REACT_APP_CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# Database Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Vector Database (for EVA RAG)
REACT_APP_VECTOR_DB_ENDPOINT=http://localhost:8081/vector
REACT_APP_VECTOR_DB_API_KEY=your-vector-db-api-key

# Feature Flags
REACT_APP_ENABLE_BUSINESS_LOOKUP=true
REACT_APP_ENABLE_STATE_MONITORING=true
REACT_APP_ENABLE_AUTO_COMPLIANCE_CHECK=true
```

#### 2. Service Account Setup

**Cloudflare Setup:**
1. Create Cloudflare account
2. Generate API token with Workers AI permissions
3. Set up R2 bucket for document storage
4. Configure CORS for browser access

**Brave Search Setup:**
1. Sign up for Brave Search API
2. Get API key from developer dashboard
3. Configure rate limits (recommended: 1000 requests/day)

**Supabase Setup:**
1. Create new Supabase project
2. Run the provided SQL schema
3. Configure Row Level Security (RLS)
4. Set up API keys

#### 3. Database Schema

```sql
-- Business Records Table
CREATE TABLE business_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  business_name TEXT NOT NULL,
  dba_name TEXT,
  state TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  status TEXT NOT NULL,
  formation_date DATE,
  filing_number TEXT NOT NULL,
  registered_agent JSONB,
  address JSONB,
  additional_info JSONB,
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  search_vector tsvector
);

-- Document References Table
CREATE TABLE business_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_record_id UUID REFERENCES business_records(id),
  document_type TEXT NOT NULL,
  r2_path TEXT NOT NULL,
  original_url TEXT,
  filing_date DATE,
  size_bytes INTEGER,
  content_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector Embeddings for EVA RAG
CREATE TABLE business_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  business_record_id UUID REFERENCES business_records(id),
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_business_records_customer_id ON business_records(customer_id);
CREATE INDEX idx_business_records_state ON business_records(state);
CREATE INDEX idx_business_records_search ON business_records USING gin(search_vector);
CREATE INDEX idx_business_vectors_customer_id ON business_vectors(customer_id);
CREATE INDEX idx_business_vectors_embedding ON business_vectors USING ivfflat (embedding vector_cosine_ops);
```

### 🔧 Usage Guide

#### Basic Business Lookup

```typescript
import { BusinessLookupTool } from '../tools/BusinessLookupTool';

// In your React component
const handleBusinessLookup = () => {
  return (
    <BusinessLookupTool
      onResultsReady={(results) => {
        console.log(`Found ${results.businessRecords.length} records`);
        // Results automatically stored in customer context
      }}
      onError={(error) => {
        console.error('Lookup failed:', error);
      }}
    />
  );
};
```

#### EVA Integration

```typescript
import { EVABusinessLookupIntegration } from '../components/EVABusinessLookupIntegration';

// EVA can trigger business lookups
const handleEVALookup = () => {
  return (
    <EVABusinessLookupIntegration
      isVisible={showLookup}
      onLookupComplete={(results) => {
        // Results formatted for EVA conversation
        addMessageToEVA(results.evaContext.summary);
      }}
      onLookupError={(error) => {
        addMessageToEVA(`❌ Business lookup failed: ${error}`);
      }}
      onClose={() => setShowLookup(false)}
    />
  );
};
```

### 📊 State-by-State Coverage

The system provides comprehensive coverage across all 50 states with three different access methods:

#### API-Based States (Direct Integration)
- **Delaware**: Direct API access to corporate registry
- **Nevada**: API access to business search
- **Wyoming**: Limited API access

#### Web Scraping States (Automated)
- **California**: BizFile Online system
- **Florida**: Sunbiz registry
- **Texas**: SOSDirect system
- **New York**: Department of State database
- **Illinois**: SNAP system
- And 35+ other states

#### AI-Assisted States (Manual + AI)
- States with complex or protected systems
- AI navigates forms and extracts data
- Human verification when required

### 🔍 Document Types Retrieved

**Required Documents (All States):**
- Certificate/Articles of Incorporation
- Annual Reports/Statements
- Registered Agent Information

**Optional Documents (State-Specific):**
- Amendments and Mergers
- Assumed Name Certificates (DBAs)
- Certificates of Good Standing
- Franchise Tax Records
- Operating Agreements (if filed)

**Compliance Documents:**
- Filing Status Reports
- State Tax Information
- License Requirements
- Publication Requirements (NY LLCs)

### 🤖 AI Features

#### Cloudflare Workers AI Integration

**Web Search Enhancement:**
```javascript
// Brave Search through Cloudflare AI
const searchQuery = `"${businessName}" secretary of state filing`;
const response = await fetch(`${CLOUDFLARE_ENDPOINT}/ai/search`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CLOUDFLARE_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: '@cf/brave/web-search',
    messages: [{ role: 'user', content: searchQuery }],
    search_params: { count: 10, country: 'US' }
  })
});
```

**Document Analysis:**
```javascript
// AI-powered document extraction
const documentAnalysis = await fetch(`${CLOUDFLARE_ENDPOINT}/ai/analyze`, {
  method: 'POST',
  body: JSON.stringify({
    model: '@cf/meta/llama-3.2-90b-vision-instruct',
    messages: [{
      role: 'user',
      content: `Extract business information from this document: ${documentText}`
    }]
  })
});
```

### 📈 EVA RAG Integration

#### Automatic Vector Database Population

When business records are found, they're automatically processed for EVA's vector database:

```typescript
// Vector processing for EVA
const processForVectorDB = async (record: BusinessRecord, documents: string[]) => {
  const documentContents = await Promise.all(
    documents.map(doc => extractDocumentText(doc))
  );

  return {
    id: record.id,
    content: [
      `Business Name: ${record.businessName}`,
      `State: ${record.state}`,
      `Entity Type: ${record.entityType}`,
      `Status: ${record.status}`,
      ...documentContents
    ].join('\n'),
    metadata: {
      type: 'business_record',
      state: record.state,
      entityType: record.entityType,
      status: record.status
    },
    customerId: customer.id
  };
};
```

#### EVA Conversation Enhancement

EVA uses business lookup data to provide contextual assistance:

```
User: "Tell me about this business"
EVA: Based on the business lookup I just performed:

📋 **Smith Manufacturing LLC** (Illinois)
• Entity Type: Limited Liability Company
• Status: Active and in Good Standing
• Formation: March 15, 2015
• Filing #: LLC-2015-003847

📄 **Documents Found:**
• Articles of Organization ✓
• 2023 Annual Report ✓ 
• Registered Agent: Smith Business Services

⚠️ **Compliance Notes:**
• Annual report due March 15, 2024
• No outstanding fees or penalties
• Illinois business license current

Would you like me to review any specific documents or check compliance in other states where they might operate?
```

### 🔒 Security & Compliance

#### Data Protection
- All PII encrypted at rest and in transit
- Document access logs maintained
- GDPR/CCPA compliant data handling
- Secure document deletion after retention period

#### Financial Compliance
- Audit trails for all lookups
- Compliance checking built into workflows
- Regulatory requirement tracking per state
- BSA/AML integration ready

#### Access Control
- Role-based permissions
- Customer data segregation
- API rate limiting
- Secure token management

### 🛠️ Development & Testing

#### Running Tests
```bash
# Unit tests for business lookup
npm test -- --testPathPattern=BusinessLookup

# Integration tests with mock state APIs
npm run test:integration

# E2E tests with staging environment
npm run test:e2e
```

#### Debugging Commands
```bash
# Enable debug logging
REACT_APP_DEBUG_BUSINESS_LOOKUP=true npm start

# Test specific state lookup
curl -X POST localhost:3002/api/business-lookup \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Test Corp", "states": ["DE"]}'

# Check vector database integration
curl localhost:8081/vector/search \
  -H "Authorization: Bearer ${VECTOR_DB_TOKEN}" \
  -d '{"query": "manufacturing company", "customerId": "123"}'
```

### 📚 API Reference

#### BusinessLookupService Methods

```typescript
class BusinessLookupService {
  // Main lookup method
  async lookupBusiness(
    businessName: string,
    dbaName?: string,
    states?: string[]
  ): Promise<BusinessLookupResult>

  // State-specific searches
  async searchStateAPI(state: string, name: string): Promise<BusinessRecord[]>
  async searchStateWebsite(state: string, name: string): Promise<BusinessRecord[]>
  async aiAssistedLookup(state: string, name: string): Promise<BusinessRecord[]>

  // Document management
  async downloadStateDocuments(state: string, record: BusinessRecord): Promise<string[]>
  async storeInR2(documentUrl: string, metadata: DocumentMetadata): Promise<string>
  
  // Vector database integration
  async processForVectorDB(record: BusinessRecord): Promise<VectorDBEntry>
  async storeInVectorDB(entry: VectorDBEntry): Promise<void>
}
```

### 🚀 Deployment

#### Production Checklist
- [ ] All environment variables configured
- [ ] Cloudflare Workers deployed
- [ ] R2 bucket created with proper CORS
- [ ] Supabase schema deployed
- [ ] Vector database initialized
- [ ] Rate limiting configured
- [ ] Monitoring alerts set up
- [ ] Backup procedures documented

#### Performance Optimization
- API request caching (24 hour TTL)
- Document compression for R2 storage
- Vector database indexing
- Async processing for large searches
- Rate limit management across services

### 📞 Support & Troubleshooting

#### Common Issues

**"No results found" for known business:**
- Check business name spelling variations
- Verify state of incorporation
- Try searching with DBA name
- Check if business recently formed

**"API rate limit exceeded":**
- Implement exponential backoff
- Use caching for repeated searches
- Contact API provider for limit increase
- Implement request queuing

**"Document download failed":**
- Verify R2 bucket permissions
- Check file size limits
- Validate document URLs
- Retry with exponential backoff

#### Getting Help

1. Check the debug logs: `REACT_APP_DEBUG=true`
2. Review API response codes and error messages
3. Test with curl commands provided above
4. Contact support with specific error details

### 🔮 Future Enhancements

#### Planned Features
- Real-time compliance monitoring
- Automated document updates
- International business registry support
- Advanced fraud detection
- Integration with additional data sources

#### Roadmap
- **Q1 2024**: Enhanced AI document analysis
- **Q2 2024**: International expansion (Canada, UK)
- **Q3 2024**: Real-time monitoring dashboard
- **Q4 2024**: Advanced compliance automation

---

## 🎉 Conclusion

The Business Lookup & Verification System provides EVA with comprehensive business intelligence capabilities, enabling instant access to critical business information across all US states. With AI-powered search, automated document retrieval, and seamless integration with customer profiles, it transforms how financial institutions verify and understand their business customers.

The system's integration with EVA's conversational AI ensures that business information is immediately available in context, enhancing decision-making and customer service quality while maintaining the highest standards of security and compliance. 