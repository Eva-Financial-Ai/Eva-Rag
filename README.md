# 🚀 EVA AI Platform - Enterprise Security Infrastructure

# ================================================

**Enterprise-Grade AI-Powered Financial Platform with Triple-Redundant Security**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://demo.evafi.ai)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Enterprise-orange.svg)](https://cloudflare.com)
[![Security](https://img.shields.io/badge/Security-Triple--Firewall-red.svg)](https://docs.evafi.ai/security)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://typescriptlang.org)
[![Node](https://img.shields.io/badge/Node.js-18.x_|_20.x-green.svg)](https://nodejs.org)

## 🎯 **Project Overview**

EVA (Enterprise Virtual Assistant) is a sophisticated AI-powered broker system with **enterprise-grade security infrastructure**. Our platform features triple-redundant firewalls, real-time database synchronization, and advanced threat detection for commercial finance operations.

## 📅 **RELEASE TIMELINE & ROADMAP**

### **🚀 Phase 1: Core Platform Launch**

**Target: June 15th, 2025 | Live Beta: June 7th, 2025**

#### **Beta Testing (June 7-14, 2025)**

- **Risk Map Navigator** with owners credit analysis
- **FileLock Drive** secure document management
- **Credit Application** processing system
- **EVA AI Interface** with conversational AI
- **Auto unit and QA testing** framework implementation

#### **Production Release (June 15th, 2025)**

- ✅ Risk Map release with owners credit integration
- ✅ FileLock Drive with blockchain verification
- ✅ Credit Application with compliance tracking
- ✅ EVA AI interface with multi-model support
- ✅ Customer Retention Platform (CRP) Dashboard
- ✅ Calendar Integration (Google + Microsoft)

### **🏢 Phase 2: Business Credit Expansion**

**Target: July 15th, 2025**

- **Business Credit Support** module
- **Enhanced credit analysis** for corporate entities
- **Multi-entity relationship** mapping
- **Advanced risk scoring** for commercial applications
- **Automated underwriting** workflows

### **📰 Phase 3: Asset Management**

**Target: August 1st, 2025**

- **Asset Press** news and market intelligence
- **Portfolio Navigator** with real-time tracking
- **Market analysis** and trend reporting
- **Asset performance** dashboard
- **Investment opportunity** scoring

### **🎥 POST-MVP: CLOUDFLARE STREAM INTEGRATION**

**Target: End of July 2025**

#### **EVA Stream Features**

- **Real-time video communication** via Cloudflare Stream
- **Meeting recording** and transcription
- **AI-powered meeting** insights and summaries
- **Secure video storage** with encryption
- **Multi-participant** conference support
- **Screen sharing** capabilities

#### **Technical Implementation**

```javascript
// Cloudflare Stream Integration
const streamConfig = {
  streamId: process.env.CLOUDFLARE_STREAM_ID,
  apiToken: process.env.CLOUDFLARE_STREAM_TOKEN,
  webhookSecret: process.env.STREAM_WEBHOOK_SECRET,
  features: {
    recording: true,
    transcription: true,
    aiInsights: true,
    encryptionAtRest: true,
  },
};

// Workers Integration
export default {
  async fetch(request, env) {
    // Handle stream events, recording, and AI processing
    return handleStreamRequest(request, env.STREAM_API);
  },
};
```

## 👥 **Business User Types & Journey Mapping**

### **Business Logic User Types**

EVA AI is designed around business-focused user personas that represent real-world financing scenarios. These user types drive personalized experiences and user journey flows.

#### **Primary Business User Types**

1. **🏪 Small Business Owner**
   - **Profile**: 1-10 employees, $100K-$1M revenue
   - **Needs**: Quick working capital, simple processes
   - **Journey**: Fast application → Document upload → Quick decision
   - **Key Features**: Streamlined forms, instant pre-qualification

2. **📈 Growing Business Owner**  
   - **Profile**: 10-50 employees, $1M-$10M revenue
   - **Needs**: Growth capital, strategic planning
   - **Journey**: Strategy → Multi-product comparison → Expert consultation
   - **Key Features**: Advanced analytics, financial modeling

3. **🏢 Enterprise Business Owner**
   - **Profile**: 50+ employees, $10M+ revenue  
   - **Needs**: Complex financing, compliance, integrations
   - **Journey**: RFP → Due diligence → Custom solutions
   - **Key Features**: API access, dedicated support, custom terms

4. **🆕 First-Time Borrower**
   - **Profile**: New to business financing
   - **Needs**: Education, guidance, confidence building
   - **Journey**: Learn → Assess eligibility → Guided application
   - **Key Features**: Educational content, step-by-step guidance

5. **🔄 Repeat Borrower**
   - **Profile**: Existing customer with funding history
   - **Needs**: Streamlined process, loyalty benefits
   - **Journey**: Login → Pre-approved offers → Fast-track approval
   - **Key Features**: Customer portal, relationship pricing

6. **🚛 Equipment Buyer**
   - **Profile**: Seeking equipment-specific financing
   - **Needs**: Equipment selection, vendor coordination
   - **Journey**: Equipment search → Financing options → Vendor coordination
   - **Key Features**: Equipment catalogs, vendor partnerships

7. **🏘️ Real Estate Investor**
   - **Profile**: Commercial property focused
   - **Needs**: Fast closings, market analysis, portfolio tracking
   - **Journey**: Property analysis → Pre-approval → Fast closing
   - **Key Features**: Market data, portfolio management

8. **💰 Working Capital Seeker**
   - **Profile**: Immediate cash flow needs
   - **Needs**: Quick funding, flexible terms
   - **Journey**: Apply → Upload docs → Same-day decision
   - **Key Features**: Express processing, cash flow tools

9. **🚀 Expansion-Focused Business**
   - **Profile**: Scaling operations or entering new markets
   - **Needs**: Strategic capital, growth planning
   - **Journey**: Strategy → Financial modeling → Multi-stage funding
   - **Key Features**: Growth planning tools, milestone tracking

10. **⚠️ Cash Flow Constrained Business**
    - **Profile**: Experiencing cash flow challenges
    - **Needs**: Emergency funding, financial counseling
    - **Journey**: Emergency application → Flexible terms → Recovery planning
    - **Key Features**: Emergency processing, financial coaching

### **User Journey Flows**

Each business user type has a tailored journey optimized for their specific needs:

- **Awareness**: Targeted content and education
- **Consideration**: Personalized product recommendations  
- **Application**: Role-appropriate forms and processes
- **Decision**: Customized approval workflows
- **Onboarding**: User type-specific setup and training
- **Ongoing**: Relationship management and cross-selling

### **Implementation in Code**

```typescript
// Business user types are defined in src/types/UserTypes.ts
export enum BusinessUserType {
  SMALL_BUSINESS_OWNER = 'SMALL_BUSINESS_OWNER',
  GROWING_BUSINESS_OWNER = 'GROWING_BUSINESS_OWNER', 
  ENTERPRISE_BUSINESS_OWNER = 'ENTERPRISE_BUSINESS_OWNER',
  // ... additional types
}

// Each type includes detailed persona data
export interface BusinessUserPersona {
  userType: BusinessUserType;
  displayName: string;
  description: string;
  businessContext: BusinessContext;
  painPoints: string[];
  goals: string[];
  typicalJourney: string[];
  keyFeatures: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  techSavviness: 'low' | 'medium' | 'high';
  preferredChannels: string[];
}
```

## 🔐 **Authentication & User Management**

### **Auth0-Based User Type Determination**

**Important Notice**: The manual user type selector (EnhancedUserTypeSelector) will be removed at the end of staging. User types are now determined automatically during the Auth0 authentication process.

#### **How User Types Are Assigned**

1. **During Signup/Login**: User type is determined based on:

   - Email domain mapping (e.g., @lender.com → Lender role)
   - Organization affiliation in Auth0
   - Pre-configured Auth0 rules and metadata
   - System admin manual assignment (for special cases)

2. **Role Assignment Process**:

   - Initial role assignment via Auth0 rules
   - System administrators can modify roles post-registration
   - Roles are stored in Auth0 user metadata
   - JWT tokens include role claims for authorization

3. **Available User Types**:
   - **Borrower**: Default role for general users
   - **Lender**: Financial institution representatives
   - **Broker**: Deal facilitators and intermediaries
   - **Vendor**: Service providers and partners
   - **Admin**: System administrators with full access

#### **Migration Timeline**

- **Current State**: User type selector visible for testing
- **End of Staging**: User type selector removed
- **Production**: Full Auth0-based authentication only

## 🛡️ **Security Infrastructure**

### **🔥 Triple Firewall Architecture**

#### **Layer 1: DNS Firewall (3-Layer Protection)**

- **Primary**: Cloudflare Gateway (malware, phishing, cryptomining)
- **Secondary**: Quad9 (9.9.9.9) - privacy-focused DNS filtering
- **Tertiary**: OpenDNS (208.67.222.222) - content filtering

#### **Layer 2: Web Application Firewall (WAF)**

- **SQL Injection Protection**: Automated query analysis and blocking
- **XSS Prevention**: Script injection detection and mitigation
- **Geographic Restrictions**: IP-based country blocking
- **Rate Limiting**: 100 requests/minute with challenge responses
- **Bot Protection**: JS challenges and behavioral analysis

#### **Layer 3: Application-Level Security**

- **Auth0 Integration**: Enterprise SSO with MFA support
- **JWT Authentication**: Secure token-based access control with role claims
- **Row-Level Security**: Supabase RLS policies based on user roles
- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Audit Logging**: Comprehensive activity tracking with user role context

### **🗄️ Database Redundancy Architecture**

#### **Primary Database: Supabase (PostgreSQL)**

```sql
-- Real-time subscriptions enabled
CREATE PUBLICATION eva_realtime FOR ALL TABLES;

-- Tables: users, credit_applications, transactions,
--         chat_sessions, storage_locks, digital_assets
--         audit_logs, payment_methods, feature_flags
```

#### **Backup Database: Cloudflare D1**

- **Automatic Synchronization**: Real-time replication from Supabase
- **Disaster Recovery**: 15-minute RTO, 1-hour RPO
- **15 Tables**: Complete schema replication with indexes

### **☁️ Real-time Content Distribution**

#### **R2 Storage Systems**

- **eva-documents**: Secure document storage with AES-256 encryption
- **eva-static-assets**: CDN-optimized static file hosting
- **eva-backups**: Automated daily backups with 30-day retention

#### **KV Stores for High-Performance Caching**

- **EVA_CACHE**: Application-level caching (86,400s TTL)
- **USER_SESSIONS**: Session management and persistence
- **ANALYTICS_DATA**: Real-time user behavior tracking

## 🚀 **Advanced Cloudflare Services**

### **⚡ Hyperdrive Database Acceleration**

```toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "your-hyperdrive-id"
localConnectionString = "postgresql://username:password@localhost:5432/eva_db"
```

### **📬 Queue System for Async Processing**

- **eva-processing-queue**: Credit applications, document processing
- **eva-dlq**: Dead letter queue for failed operations
- **Concurrency**: 10 batch size, 30s timeout, 3 retries

### **🎥 Cloudflare Stream Integration (Post-MVP)**

```toml
# Stream Configuration for EVA Video Services
[streams]
stream_id = "eva-main-stream"
webhook_url = "https://api.evafi.ai/webhooks/stream"
features = ["recording", "transcription", "ai-insights"]

[stream.security]
encryption = "AES-256"
access_control = "jwt-based"
geographic_restrictions = ["US", "CA", "UK", "EU"]
```

### **📊 Analytics Engine**

```javascript
// Real-time analytics tracking
const analyticsEvents = {
  userLogin: userId => ({ event: 'user_login', userId, timestamp: Date.now() }),
  creditApplicationSubmitted: (userId, applicationId) => ({
    event: 'credit_application_submitted',
    userId,
    applicationId,
    timestamp: Date.now(),
  }),
  videoMeetingStarted: (userId, meetingId) => ({
    event: 'video_meeting_started',
    userId,
    meetingId,
    timestamp: Date.now(),
  }),
};
```

## 🧪 **Testing & Quality Assurance**

### **Automated Testing Framework**

```javascript
// Auto Unit Testing
describe('Credit Application Processing', () => {
  test('validates loan amount limits', () => {
    expect(validateLoanAmount(50000)).toBe(true);
    expect(validateLoanAmount(10000000)).toBe(false);
  });
});

// QA Testing Pipeline
const qaChecklist = {
  unitTests: 'Jest + React Testing Library',
  integrationTests: 'Cypress end-to-end',
  performanceTests: 'Lighthouse CI',
  securityTests: 'OWASP ZAP',
  accessibilityTests: 'axe-core',
};
```

## 📋 **Environment Configuration**

### **🔐 Secure Configuration**

⚠️ **SECURITY**: All sensitive credentials are stored in Cloudflare Workers secrets, not environment variables.

```bash
# Public Configuration (Safe to expose)
CLOUDFLARE_ACCOUNT_ID=eace6f3c56b5735ae4a9ef385d6ee914
CLOUDFLARE_ZONE_ID_STAGING=79cbd8176057c91e2e2329ffd8b386a5
CLOUDFLARE_ZONE_ID_PRODUCTION=913680b4428f2f4d1c078dd841cd8cdb
CLOUDFLARE_EMAIL=support@evafi.ai

# Secrets (Use: wrangler secret put SECRET_NAME)
# Updated 2024 - Consolidated & Secured
# - CLOUDFLARE_API_TOKEN (includes Images permissions)
# - CLOUDFLARE_STREAM_TOKEN (Post-MVP)
# - PLAID_CLIENT_ID
# - PLAID_PUBLIC_KEY
# - SENDGRID_API_KEY
# - TWILIO_ACCOUNT_SID
# - TWILIO_AUTH_TOKEN
# - AUTH0_CLIENT_SECRET
# - GEOAPIFY_API_KEY
# - ENCRYPTION_KEY
# - SENTRY_DSN
```

### **📞 Support Configuration**

```bash
# Public Configuration
SUPPORT_PHONE=702-576-2013

# Secrets (Use: wrangler secret put SECRET_NAME)
# - TWILIO_ACCOUNT_SID
# - TWILIO_AUTH_TOKEN
```

### **🗄️ Database Configuration**

```bash
# Public Configuration
QUEUE_NAME=eva-processing-queue
ANALYTICS_DATASET=eva-analytics

# Secrets (Use: wrangler secret put SECRET_NAME)
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - HYPERDRIVE_ID
```

🔐 **Security Implementation**: Following [Google Cloud API security best practices](https://cloud.google.com/docs/authentication/api-keys-best-practices) and [Node.js security standards](https://www.nodejs-security.com/blog/do-not-use-secrets-in-environment-variables-and-here-is-how-to-do-it-better)

## 🌐 **Live Infrastructure URLs**

### **🎯 Staging Environment**

- **Primary Domain**: https://demo.evafi.ai
- **Direct URL**: https://4cf2bcb9.eva-ai-frontend.pages.dev
- **API Endpoint**: https://api-staging.evafi.ai
- **Support Phone**: 702-576-2013

### **🚀 Production Environment**

- **Primary Domain**: https://app.evafi.ai
- **Direct URL**: https://cf3b6f51.eva-ai-frontend-production.pages.dev
- **API Endpoint**: https://api.evafi.ai

## 🚀 **Quick Start Guide**

### **🔓 DEVELOPMENT MODE (Auth0 DISABLED)**

> **Update 2025-06-12** – The Vite dev server now runs on the default port **5173** (was 3000).  If port 5173 is already in use the server will exit immediately (see `vite.config.mts` → `strictPort: true`).
>
> Additionally, a lightweight `src/config/environment.ts` wrapper has been restored.  All services/hooks import from this file instead of accessing `process.env` directly. **Do not store secrets in this file** – it only reads from `import.meta.env`/`.env`.

```bash
# Quick Start - No Authentication Required
npm run dev            # opens http://localhost:5173
```

**✅ Full Access**: All platform features available without login during development.

### **🔐 Auth0 Production Setup (AFTER Development)**

**When ready for staging/production:**

1. **Enable Auth0 in Feature Flags:**

   ```typescript
   // src/config/featureFlags.ts
   export const featureFlags = {
     auth0: { enabled: true }, // Change from false to true
   };
   ```

2. **Set Production Environment Variables:**

   ```bash
   REACT_APP_DEMO_MODE=false
   REACT_APP_BYPASS_AUTH=false
   REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com
   REACT_APP_AUTH0_CLIENT_ID=your-client-id
   REACT_APP_AUTH0_AUDIENCE=https://your-api-audience
   ```

3. **Deploy with Authentication:**
   ```bash
   npm run build:production
   npm run deploy:production
   ```

### **Prerequisites**

- **Node.js**: 18.x or 20.x (required - see .nvmrc)
- **npm**: Latest version with --legacy-peer-deps support
- **Cloudflare Account**: Enterprise-level access
- **Auth0 Account**: For authentication (see AUTH0-SETUP.md)

### **Installation**

```bash
# Clone repository
git clone <repository-url>
cd evafi-ai-fe-demo

# Use correct Node version
nvm use 20.11.0

# Install dependencies
npm install --legacy-peer-deps

# Set up secure credentials in Cloudflare Workers
npm install -g wrangler
wrangler login
./scripts/setup-new-credentials.sh

# Set up frontend environment
cp .env.example .env
# Edit .env with your credentials (NEVER commit this file)

# Start development server
npm run dev

# Deploy infrastructure
./scripts/deploy-advanced-infrastructure.sh
```

### **Environment Variables Setup**

The application requires environment variables with `VITE_` prefix for Vite and `REACT_APP_` prefix for backward compatibility:

```bash
# Copy the example file
cp .env.example .env

# Required variables:
# - VITE_AUTH0_DOMAIN (Auth0 domain: evafi.us.auth0.com)
# - VITE_AUTH0_CLIENT_ID (Auth0 client ID)
# - VITE_AUTH0_AUDIENCE (Auth0 API audience)
# - VITE_AUTH0_REDIRECT_URI (Callback URL for Auth0)
# - VITE_CLOUDFLARE_ACCOUNT_ID (Cloudflare account)
# - VITE_PLAID_CLIENT_ID (Plaid integration)
# - VITE_STRIPE_PUBLISHABLE_KEY (Stripe payments)
# - VITE_GEOAPIFY_API_KEY (Geolocation services)
# - VITE_SUPABASE_URL (Database URL)
# - VITE_SUPABASE_KEY (Database key)
```

#### **Environment-Specific Settings**

- **Staging**: Use `VITE_ENVIRONMENT=staging` and `VITE_CLOUDFLARE_ZONE_ID_STAGING`
- **Production**: Use `VITE_ENVIRONMENT=production` and `VITE_CLOUDFLARE_ZONE_ID_PRODUCTION`

⚠️ **Security Note**:

- The `.env` file is already in `.gitignore` and will not be committed to version control
- Never commit sensitive API keys or secrets
- Use different API keys for staging and production environments
- See `ENV_VARIABLES_GUIDE.md` for complete documentation

## 🛠️ **Development Commands**

```bash
# Development
npm run start:no-lint          # Start without linting (recommended)
npm run start                  # Start with full linting
npm run build                  # Production build
npm run test                   # Run comprehensive test suite

# Infrastructure
npm run clean-install          # Clean dependency installation
npm run emergency-install      # Emergency dependency fix
./scripts/run-comprehensive-tests.sh  # Full test suite with security scanning

# Database Operations
wrangler d1 execute eva-main-db-staging --command="SELECT * FROM users LIMIT 5"
wrangler d1 migrations create "migration_name"
wrangler d1 migrations apply eva-main-db-staging --remote

# Cloudflare Operations
wrangler hyperdrive create eva-hyperdrive --connection-string="postgresql://..."
wrangler queues create eva-processing-queue
wrangler r2 bucket cors put eva-documents-staging --cors-config="cors.json"
```

## 🚀 **Deployment Process**

### **🔄 Automated Deployment**

```bash
# Deploy staging with full infrastructure
./scripts/deploy-advanced-infrastructure.sh

# Deploy to production
./scripts/deploy-advanced-infrastructure.sh --production
```

### **📋 Infrastructure Components Deployed**

- 🔥 **DNS Firewall**: 3-layer protection (Gateway, Quad9, OpenDNS)
- 🛡️ **WAF Rules**: SQL injection, XSS protection, geo-blocking
- ⚡ **Hyperdrive**: Database query acceleration
- 📬 **Queues**: Async processing for credit applications
- 📊 **Analytics Engine**: Real-time user behavior tracking
- 🗄️ **D1 Database**: 15 tables with automated migrations
- ☁️ **R2 Buckets**: Document storage with CORS configuration
- 🔒 **Security Headers**: CSP, HSTS, X-Frame-Options
- 🌐 **DNS Records**: Automated CNAME setup
- 📱 **Pages Deployment**: Staging and production environments
- 🔍 **Health Checks**: Automated endpoint monitoring
- 📊 **Monitoring**: Real-time alerting and performance tracking

## 🧪 **Comprehensive Testing**

### **🛡️ Security Testing**

```bash
# Run full security test suite
./scripts/run-comprehensive-tests.sh

# Individual test types
npm run test:unit              # Unit tests (80% coverage requirement)
npm run test:integration       # API and database workflows
npm run test:security          # Vulnerability scanning
npm run test:performance       # Bundle analysis and load testing
npm run test:accessibility     # WCAG compliance validation
```

### **📊 Test Coverage**

- **Unit Tests**: 100+ component tests
- **Integration Tests**: Complete workflow validation
- **Security Tests**: Automated vulnerability scanning
- **Performance Tests**: Load testing and bundle optimization
- **Accessibility Tests**: WCAG 2.1 AA compliance

## 📊 **Monitoring & Analytics**

### **🔍 Real-time Monitoring**

- **Analytics Engine**: Custom events and user behavior
- **Health Checks**: Automated endpoint monitoring every 30s
- **Error Tracking**: Comprehensive logging with Sentry
- **Performance**: Real-time metrics with Datadog

### **🚨 Alert Conditions**

- Request rate > 500/minute → Challenge users
- Error rate > 5% → Immediate alerts
- Database connection failures → Automatic failover
- Security threats → Instant notification

## 🔧 **MCP (Model Context Protocol) Tools Required**

### **Business Intelligence Tools**

#### **1. Business Lookup MCP Tool**

- **Endpoint**: `mcp://business-lookup`
- **Functions**:
  - `searchBusinessEntity(legalName, dbaNames[], tradenames[], states[])`
  - `searchESecretaryOfState(businessName, allStates: boolean)`
  - `searchSECEdgar(businessName, includeFiliings: boolean)`
  - `gatherContactInformation(businessName, includeOwners: boolean)`
  - `updateCustomerRAG(customerId, businessData)`
- **Data Sources**:
  - e-secretaryofstate.com API integration
  - SEC EDGAR database
  - Web scraping for contact details
  - State-specific Secretary of State databases

#### **2. Document Processing MCP Tool**

- **Endpoint**: `mcp://document-processor`
- **Functions**:
  - `extractBusinessInfo(documentUrl)`
  - `parseFinancialStatements(documentUrl)`
  - `extractContactDetails(documentUrl)`
  - `validateBusinessLicense(documentUrl, state)`

### **Financial Analysis Tools**

#### **3. Credit Analysis MCP Tool**

- **Endpoint**: `mcp://credit-analysis`
- **Functions**:
  - `analyzeCreditWorthiness(businessId, financialData)`
  - `generateRiskScore(businessProfile)`
  - `compareIndustryBenchmarks(businessType, metrics)`
  - `predictDefaultProbability(historicalData)`

#### **4. Transaction Monitoring MCP Tool**

- **Endpoint**: `mcp://transaction-monitor`
- **Functions**:
  - `detectAnomalies(transactionData)`
  - `flagSuspiciousActivity(patterns)`
  - `generateComplianceReport(timeframe)`
  - `trackCashFlow(accountId, period)`

### **Compliance & Legal Tools**

#### **5. Compliance Verification MCP Tool**

- **Endpoint**: `mcp://compliance-verify`
- **Functions**:
  - `checkBusinessCompliance(businessId, state)`
  - `verifyLicenses(licenseNumbers[], jurisdictions[])`
  - `monitorRegulatoryChanges(industry, states[])`
  - `generateComplianceCertificate(businessId)`

#### **6. Legal Entity MCP Tool**

- **Endpoint**: `mcp://legal-entity`
- **Functions**:
  - `verifyEntityStructure(businessName, state)`
  - `checkLienStatus(businessId)`
  - `searchUCCFilings(businessName)`
  - `trackOwnershipChanges(entityId)`

### **Data Integration Tools**

#### **7. Multi-Source Aggregator MCP Tool**

- **Endpoint**: `mcp://data-aggregator`
- **Functions**:
  - `aggregateBusinessData(sources[], businessId)`
  - `reconcileConflictingData(datasets[])`
  - `maintainDataLineage(recordId)`
  - `schedulePeriodicUpdates(businessId, frequency)`

#### **8. RAG Management MCP Tool**

- **Endpoint**: `mcp://rag-manager`
- **Functions**:
  - `createCustomerRAGInstance(customerId)`
  - `updateRAGKnowledge(customerId, newData)`
  - `queryCustomerContext(customerId, query)`
  - `exportRAGSnapshot(customerId)`

### **Implementation Requirements**

1. **Authentication**: All MCP tools must support JWT-based authentication
2. **Rate Limiting**: Implement per-customer rate limits (1000 req/hour)
3. **Caching**: Use Cloudflare KV for frequently accessed data
4. **Logging**: Comprehensive audit trails for all operations
5. **Error Handling**: Graceful degradation with fallback mechanisms
6. **Data Privacy**: Customer data isolation and encryption at rest

### **Deployment Configuration**

```toml
# wrangler.toml additions for MCP tools
[[services]]
binding = "BUSINESS_LOOKUP_MCP"
service = "business-lookup-service"
environment = "production"

[[services]]
binding = "DOCUMENT_PROCESSOR_MCP"
service = "document-processor-service"
environment = "production"

[[services]]
binding = "CREDIT_ANALYSIS_MCP"
service = "credit-analysis-service"
environment = "production"

[[services]]
binding = "TRANSACTION_MONITOR_MCP"
service = "transaction-monitor-service"
environment = "production"

[[services]]
binding = "COMPLIANCE_VERIFY_MCP"
service = "compliance-verify-service"
environment = "production"

[[services]]
binding = "LEGAL_ENTITY_MCP"
service = "legal-entity-service"
environment = "production"

[[services]]
binding = "DATA_AGGREGATOR_MCP"
service = "data-aggregator-service"
environment = "production"

[[services]]
binding = "RAG_MANAGER_MCP"
service = "rag-manager-service"
environment = "production"
```

### **MCP Tool Integration Example**

```javascript
// Example: Using Business Lookup MCP Tool
const businessLookupResult = await env.BUSINESS_LOOKUP_MCP.fetch('/search', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${jwt}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    legalName: 'ABC Corporation',
    dbaNames: ['ABC Corp', 'ABC Co'],
    states: ['CA', 'NY', 'TX'],
    includePublicFilings: true,
    includeContactInfo: true,
    customerId: 'cust_123456',
  }),
});

// RAG automatically updated with results
const ragResponse = await env.RAG_MANAGER_MCP.fetch('/query', {
  method: 'POST',
  body: JSON.stringify({
    customerId: 'cust_123456',
    query: 'What is the compliance status of ABC Corporation?',
  }),
});
```

## 🔐 **Security Compliance**

### **📜 Standards & Certifications**

- **SOC 2 Type II**: Security and availability controls
- **PCI DSS**: Payment card industry compliance
- **GDPR**: European data protection regulation
- **CCPA**: California consumer privacy act

### **🛡️ Data Protection**

- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Access Control**: Role-based permissions (RBAC)
- **Audit Logging**: Comprehensive activity tracking
- **Data Retention**: Automated lifecycle management (30 days)

## 🆘 **Emergency Procedures**

### **🔄 Disaster Recovery**

```bash
# Database failover (15-minute RTO)
./scripts/emergency-failover.sh

# Rollback deployment
wrangler pages deployment list
wrangler pages deployment activate [deployment-id]

# Security lockdown
./scripts/security-lockdown.sh
```

### **🛠️ Common Issues**

- **Build Failures**: Run `npm run emergency-install`
- **Node Version**: Use `nvm use 20.11.0`
- **Dependencies**: Check `requirements.tsx` for exact versions
- **Authentication**: Run `wrangler login` to re-authenticate

## 📈 **Performance Metrics**

### **⚡ Current Benchmarks**

- **Load Time**: <2.5s (95th percentile)
- **First Contentful Paint**: <1.2s
- **Database Query Speed**: <50ms (with Hyperdrive)
- **CDN Cache Hit Rate**: >95%
- **Security Threat Detection**: <1s response time

### **🚀 Optimization Features**

- **CDN**: Global edge caching with Cloudflare
- **Compression**: Brotli + Gzip (6x compression)
- **Minification**: HTML, CSS, JS optimization
- **Code Splitting**: Dynamic imports for faster loading
- **Database Acceleration**: Hyperdrive connection pooling

## 📞 **Support & Documentation**

### **📞 Contact Information**

- **Phone**: 702-576-2013 (24/7 Twilio integration)
- **Email**: support@evafi.ai
- **Emergency**: Critical infrastructure issues

### **📚 Documentation**

- **Security Guide**: `docs/SECURITY_INFRASTRUCTURE.md`
- **Infrastructure**: `docs/CLOUDFLARE_INFRASTRUCTURE.md`
- **API Documentation**: https://docs.evafi.ai
- **Setup Guide**: `SETUP_GUIDE.md`

---

## 📄 **License**

Copyright © 2024 EVA Financial AI. All rights reserved.

**Enterprise License** - This software is proprietary and confidential. Unauthorized copying, distribution, or modification is strictly prohibited.

---

_Last Updated: June 6, 2025_  
_Version: 2.5.0_  
_Infrastructure: Cloudflare Enterprise + Supabase + Triple Security_  
_Security Status: Triple-Redundant Firewall Active_

## 🏗️ **SYSTEM ARCHITECTURE OVERVIEW**

```mermaid
graph TB
    %% Client Layer
    subgraph "Client Layer"
        UI[React Frontend<br/>TailwindCSS UI]
        PWA[Progressive Web App<br/>Service Workers]
        Auth[Auth0 Integration<br/>JWT Tokens]
    end

    %% CDN & Edge Layer
    subgraph "Cloudflare Edge Network"
        CF[Cloudflare CDN<br/>200+ Global Locations]
        WAF[Web Application Firewall<br/>SQL Injection Protection]
        DNS[DNS Firewall<br/>8.8.8.8 & 1.1.1.1]
        LB[Load Balancer<br/>5 Geographic Regions]
    end

    %% API Gateway Layer
    subgraph "API Gateway (Workers)"
        GW[EVA API Gateway<br/>v2.5.0]
        RL[Rate Limiter<br/>1K/10K/100K per hour]
        CACHE[Intelligent Cache<br/>KV Storage]
        TRANS[Data Transformers<br/>11 Transformers]
    end

    %% Backend Services
    subgraph "Backend API Services"
        FIN[Financial Data API<br/>Account Aggregation]
        CREDIT[Credit Applications<br/>Loan Processing]
        USER[User Management<br/>Profile & Settings]
        ANALYTICS[Analytics Engine<br/>Business Intelligence]
        DOCS[Document Processing<br/>OCR & Analysis]
    end

    %% Third-Party Integrations
    subgraph "Third-Party Services"
        PLAID[Plaid API<br/>Bank Connections]
        YODLEE[Yodlee API<br/>Financial Aggregation]
        EXPERIAN[Experian API<br/>Credit Bureau]
        EQUIFAX[Equifax API<br/>Credit Reports]
        OPENAI[OpenAI API<br/>AI Analysis]
        BANKING[Open Banking<br/>PSD2 Compliance]
    end

    %% Stream Services (Admin Only)
    subgraph "Stream Services (Admin Only)"
        STREAM[Cloudflare Stream<br/>Video Processing]
        UPLOAD[Video Upload<br/>Secure Processing]
        CDN_STREAM[Global Video CDN<br/>Adaptive Bitrate]
    end

    %% Data Layer
    subgraph "Data Storage"
        D1[Cloudflare D1<br/>Primary Database]
        KV[KV Namespaces<br/>Cache & Sessions]
        R2[R2 Object Storage<br/>Documents & Assets]
        SUPABASE[Supabase<br/>Backup Database]
    end

    %% Security Layer
    subgraph "Security Infrastructure"
        TRIPLE[Triple-Redundant Firewall<br/>Enterprise Security]
        ENCRYPT[AES-256 Encryption<br/>End-to-End Security]
        COMPLIANCE[Compliance Engine<br/>PCI-DSS, GDPR, FCRA]
    end

    %% AI/ML Layer
    subgraph "AI/ML Processing"
        EVA[EVA AI Engine<br/>Nemotron 70B Model]
        VECTOR[Vector Databases<br/>Pinecone & Chroma]
        ML[ML Workflows<br/>LangChain Integration]
    end

    %% Flow Connections
    UI --> CF
    PWA --> CF
    Auth --> CF

    CF --> DNS
    CF --> WAF
    CF --> LB

    LB --> GW
    GW --> RL
    GW --> CACHE
    GW --> TRANS

    GW --> FIN
    GW --> CREDIT
    GW --> USER
    GW --> ANALYTICS
    GW --> DOCS

    GW --> PLAID
    GW --> YODLEE
    GW --> EXPERIAN
    GW --> EQUIFAX
    GW --> OPENAI
    GW --> BANKING

    GW -.->|Admin Only| STREAM
    STREAM --> UPLOAD
    STREAM --> CDN_STREAM

    FIN --> D1
    CREDIT --> D1
    USER --> D1
    ANALYTICS --> D1
    DOCS --> R2

    CACHE --> KV
    RL --> KV

    TRIPLE --> WAF
    ENCRYPT --> COMPLIANCE

    OPENAI --> EVA
    EVA --> VECTOR
    EVA --> ML

    D1 -.-> SUPABASE
```

## 🔄 **DATA FLOW ARCHITECTURE**

```mermaid
sequenceDiagram
    participant C as Client (React)
    participant CF as Cloudflare Edge
    participant GW as API Gateway
    participant RL as Rate Limiter
    participant CACHE as Cache Layer
    participant API as Backend APIs
    participant DB as Database
    participant TP as Third-Party APIs
    participant STREAM as Stream (Admin)

    C->>CF: HTTPS Request
    CF->>CF: DNS Resolution (8.8.8.8, 1.1.1.1)
    CF->>CF: WAF Security Check
    CF->>GW: Route to API Gateway

    GW->>RL: Check Rate Limits
    RL-->>GW: Rate Limit Status

    GW->>CACHE: Check Cache
    CACHE-->>GW: Cache Hit/Miss

    alt Cache Miss
        GW->>API: Forward Request
        API->>DB: Query Database
        DB-->>API: Return Data
        API-->>GW: API Response
        GW->>CACHE: Store in Cache
    end

    GW->>TP: Third-Party Request
    TP-->>GW: Third-Party Response

    alt Admin User
        GW->>STREAM: Stream Request
        STREAM-->>GW: Stream Response
    end

    GW-->>CF: Transformed Response
    CF-->>C: Final Response
```

## 🛡️ **SECURITY ARCHITECTURE**

```mermaid
graph TB
    subgraph "Security Layers"
        L1[Layer 1: DNS Firewall<br/>8.8.8.8 & 1.1.1.1]
        L2[Layer 2: Cloudflare WAF<br/>SQL Injection Protection]
        L3[Layer 3: Triple-Redundant Firewall<br/>Enterprise Security]
        L4[Layer 4: API Authentication<br/>JWT & API Keys]
        L5[Layer 5: Data Encryption<br/>AES-256 End-to-End]
    end

    subgraph "Access Control"
        PUBLIC[Public Access<br/>Financial Data, Users]
        PREMIUM[Premium Access<br/>Analytics, Credit]
        ADMIN[Admin Access<br/>Stream, Documents]
    end

    L1 --> L2
    L2 --> L3
    L3 --> L4
    L4 --> L5

    L5 --> PUBLIC
    L5 --> PREMIUM
    L5 --> ADMIN
```

## 📊 **LOAD BALANCING ARCHITECTURE**

```mermaid
graph TB
    subgraph "Geographic Distribution"
        WNAM[Western North America<br/>US West, CA, MX]
        ENAM[Eastern North America<br/>US East, CA East]
        WEU[Western Europe<br/>UK, FR, DE, NL, IE]
        EEU[Eastern Europe<br/>PL, CZ, HU, RO]
        APAC[Asia Pacific<br/>JP, SG, AU, KR, IN]
    end

    subgraph "Load Balancer Pool"
        LB[EVA API Load Balancer<br/>Geographic Steering]
        POOL[eva-api-pool-simple<br/>Health Monitoring]
        HEALTH[Health Checks<br/>Every 30 seconds]
    end

    subgraph "Origins"
        PRIMARY[Primary Origin<br/>eva-api-gateway-simple]
        BACKUP[Backup Origins<br/>Auto-Failover]
    end

    WNAM --> LB
    ENAM --> LB
    WEU --> LB
    EEU --> LB
    APAC --> LB

    LB --> POOL
    POOL --> HEALTH
    HEALTH --> PRIMARY
    HEALTH --> BACKUP
```

## 📺 **STREAM ARCHITECTURE (ADMIN ONLY)**

```mermaid
graph TB
    subgraph "Admin Authentication"
        ADMIN_AUTH[Admin User Check<br/>Role-Based Access]
        ADMIN_TOKEN[Admin JWT Token<br/>Elevated Permissions]
    end

    subgraph "Stream Processing"
        UPLOAD[Video Upload<br/>Secure Direct Upload]
        PROCESS[Video Processing<br/>Transcoding & Optimization]
        CDN[Global Video CDN<br/>Adaptive Bitrate Streaming]
    end

    subgraph "Stream Management"
        LIBRARY[Video Library<br/>Admin Dashboard]
        ANALYTICS[Stream Analytics<br/>Engagement Metrics]
        CONTROLS[Admin Controls<br/>Video Management]
    end

    ADMIN_AUTH --> ADMIN_TOKEN
    ADMIN_TOKEN --> UPLOAD
    UPLOAD --> PROCESS
    PROCESS --> CDN
    CDN --> LIBRARY
    LIBRARY --> ANALYTICS
    ANALYTICS --> CONTROLS
```

## 🏗️ **INDIVIDUAL FEATURE ARCHITECTURES**

### **🔐 Authentication Flow**

```mermaid
sequenceDiagram
    participant U as User
    participant UI as React UI
    participant AUTH as Auth0
    participant GW as API Gateway
    participant KV as KV Storage

    U->>UI: Login Request
    UI->>AUTH: Authenticate
    AUTH->>AUTH: Validate Credentials
    AUTH-->>UI: JWT Token
    UI->>GW: API Request + JWT
    GW->>KV: Validate Token
    KV-->>GW: Token Valid
    GW-->>UI: Authorized Response
```

### **💳 Financial Data Flow**

```mermaid
graph LR
    UI[React UI] --> GW[API Gateway]
    GW --> PLAID[Plaid API]
    GW --> YODLEE[Yodlee API]
    PLAID --> TRANSFORM[Data Transformer]
    YODLEE --> TRANSFORM
    TRANSFORM --> CACHE[Cache Layer]
    TRANSFORM --> DB[Database]
    CACHE --> UI
```

### **📊 Analytics Pipeline**

```mermaid
graph TB
    DATA[Raw Data] --> COLLECT[Data Collection]
    COLLECT --> PROCESS[Data Processing]
    PROCESS --> AGGREGATE[Data Aggregation]
    AGGREGATE --> ANONYMIZE[Anonymization]
    ANONYMIZE --> CACHE[Cache Results]
    CACHE --> DASHBOARD[Analytics Dashboard]
```

### **🎥 Stream Processing (Admin Only)**

```mermaid
graph TB
    ADMIN[Admin User] --> AUTH[Role Check]
    AUTH --> UPLOAD[Video Upload]
    UPLOAD --> CLOUDFLARE[Cloudflare Stream]
    CLOUDFLARE --> TRANSCODE[Video Transcoding]
    TRANSCODE --> CDN[Global CDN]
    CDN --> PLAYER[Video Player]
    PLAYER --> ANALYTICS[View Analytics]
```

## 🚀 **DEPLOYMENT ARCHITECTURE**

```mermaid
graph TB
    subgraph "Development"
        LOCAL[Local Development<br/>npm run dev]
        STAGING[Staging Environment<br/>demo.evafi.ai]
    end

    subgraph "Production"
        PROD[Production Environment<br/>app.evafi.ai]
        API_PROD[API Gateway<br/>api.evafi.ai]
    end

    subgraph "Infrastructure"
        CLOUDFLARE[Cloudflare Workers<br/>Serverless Compute]
        CDN[Cloudflare CDN<br/>Global Distribution]
        STORAGE[Cloudflare Storage<br/>D1, KV, R2]
    end

    LOCAL --> STAGING
    STAGING --> PROD
    PROD --> API_PROD
    API_PROD --> CLOUDFLARE
    CLOUDFLARE --> CDN
    CLOUDFLARE --> STORAGE
```

## 📋 **TECHNOLOGY STACK**

### **Frontend**

- **React.js** - Component-based UI framework
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **Zustand** - State management
- **React Query** - Server state management

### **Backend**

- **Cloudflare Workers** - Serverless compute
- **Go** - Backend API development
- **Python** - AI/ML processing

### **Infrastructure**

- **Cloudflare Enterprise** - CDN, security, edge compute
- **Load Balancing** - 5 geographic regions
- **DNS Firewall** - 8.8.8.8 & 1.1.1.1
- **Stream Processing** - Admin-only video capabilities

### **Security**

- **Triple-Redundant Firewall** - Enterprise security
- **AES-256 Encryption** - End-to-end security
- **Compliance** - PCI-DSS, GDPR, FCRA, PSD2

### **AI/ML**

- **EVA AI** - Nemotron 70B model
- **Vector Databases** - Pinecone & Chroma
- **LangChain** - LLM application framework

## 🎯 **KEY FEATURES**

✅ **Enterprise Security Infrastructure** - Triple-redundant protection  
✅ **API Gateway** - Centralized service routing with load balancing  
✅ **Third-Party Integrations** - Financial data providers & credit bureaus  
✅ **Stream Processing** - Admin-only video capabilities  
✅ **Real-Time Analytics** - Business intelligence dashboard  
✅ **Multi-Region Deployment** - Global performance optimization  
✅ **Intelligent Caching** - Performance-optimized data delivery  
✅ **Compliance Ready** - Financial industry standards

---

# EVA AI Frontend Demo

**Advanced Financial Services Platform with AI-Powered Credit Analysis, Document Management, and Compliance Automation**

[![Build Status](https://github.com/Eva-Financial-Ai/eva-mvp-fe/actions/workflows/deploy.yml/badge.svg)](https://github.com/Eva-Financial-Ai/eva-mvp-fe/actions)
[![SOC 2 Type 2 Compliant](https://img.shields.io/badge/SOC%202%20Type%202-Compliant-green.svg)](./COMPLIANCE_AUTOMATION.md)
[![Accessibility](https://img.shields.io/badge/WCAG%202.1-AA-blue.svg)](./docs/ACCESSIBILITY.md)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](./LICENSE)

## 🏦 **Live Application**

- **Production**: [https://f72c6945.evafi-ai-fe-demo.pages.dev](https://f72c6945.evafi-ai-fe-demo.pages.dev)
- **Build Status**: ✅ SUCCESS (91.7% TypeScript error reduction achieved)
- **Deployment**: Cloudflare Pages with automated CI/CD

---

## 📊 **System Architecture & Component Flow Diagrams**

### 🏗️ **Overall System Architecture**

```mermaid
graph TB
    subgraph "User Access Layer"
        U1[Borrower Portal] --> AUTH[Auth0 Authentication]
        U2[Business Owner Portal] --> AUTH
        U3[Lender Dashboard] --> AUTH
        U4[Admin Console] --> AUTH
        U5[Compliance Officer] --> AUTH
    end

    subgraph "Authentication & Authorization"
        AUTH --> RBAC[Role-Based Access Control]
        RBAC --> SESSION[Session Management]
        SESSION --> MFA[Multi-Factor Authentication]
    end

    subgraph "Frontend Application Layer"
        RBAC --> ROUTER[React Router]
        ROUTER --> LAYOUT[Layout System]
        LAYOUT --> COMPONENTS[Component Library]

        COMPONENTS --> CREDIT[Credit Analysis]
        COMPONENTS --> DOCS[Document Management]
        COMPONENTS --> EVA_AI[EVA AI Assistant]
        COMPONENTS --> RISK[Risk Assessment]
        COMPONENTS --> FILELOCK[Filelock Drive]
        COMPONENTS --> CRM[Customer Retention]
        COMPONENTS --> BUSINESS[Business Lookup]
    end

    subgraph "State Management"
        COMPONENTS --> ZUSTAND[Zustand Store]
        ZUSTAND --> CONTEXT[React Context]
        CONTEXT --> QUERY[React Query Cache]
    end

    subgraph "API Integration Layer"
        QUERY --> API_CLIENT[API Client]
        API_CLIENT --> AUTH_API[Authentication API]
        API_CLIENT --> CREDIT_API[Credit Bureau APIs]
        API_CLIENT --> BUSINESS_API[Business Data APIs]
        API_CLIENT --> STORAGE_API[Cloud Storage APIs]
        API_CLIENT --> AI_API[AI/ML Services]
    end

    subgraph "External Services"
        AUTH_API --> AUTH0[Auth0 Service]
        CREDIT_API --> EXPERIAN[Experian API]
        CREDIT_API --> EQUIFAX[Equifax API]
        BUSINESS_API --> SOS[Secretary of State APIs]
        STORAGE_API --> GDRIVE[Google Drive]
        STORAGE_API --> ONEDRIVE[OneDrive]
        STORAGE_API --> DROPBOX[Dropbox]
        AI_API --> OPENAI[OpenAI GPT]
        AI_API --> ANTHROPIC[Anthropic Claude]
    end

    subgraph "Compliance & Security"
        API_CLIENT --> SOC2[SOC 2 Type 2 Monitoring]
        SOC2 --> AUDIT[Audit Trail System]
        AUDIT --> ENCRYPTION[Data Encryption]
        ENCRYPTION --> BACKUP[Secure Backup]
    end

    subgraph "Infrastructure"
        BACKUP --> CLOUDFLARE[Cloudflare Pages]
        CLOUDFLARE --> CDN[Global CDN]
        CDN --> MONITORING[Performance Monitoring]
    end
```

### 🔄 **User Journey & Access Flow**

```mermaid
sequenceDiagram
    participant User as User
    participant Auth as Auth0
    participant App as EVA Frontend
    participant API as Backend APIs
    participant External as External Services

    User->>Auth: 1. Access Application
    Auth->>Auth: 2. Multi-Factor Authentication
    Auth->>App: 3. Return JWT Token + User Profile
    App->>App: 4. Role-Based Route Protection

    alt Borrower Journey
        App->>API: 5a. Load Credit Profile
        API->>External: 6a. Fetch Credit Data
        External-->>API: 7a. Credit Report Response
        API-->>App: 8a. Formatted Credit Data
        App->>User: 9a. Display Credit Dashboard
    end

    alt Business Owner Journey
        App->>API: 5b. Load Business Profile
        API->>External: 6b. Business Lookup APIs
        External-->>API: 7b. Business Registration Data
        API-->>App: 8b. Business Information
        App->>User: 9b. Display Business Dashboard
    end

    alt Lender Journey
        App->>API: 5c. Load Portfolio Data
        API->>External: 6c. Risk Assessment APIs
        External-->>API: 7c. Risk Metrics
        API-->>App: 8c. Portfolio Analytics
        App->>User: 9c. Display Lender Dashboard
    end

    User->>App: 10. Interact with Features
    App->>API: 11. Execute Business Logic
    API->>External: 12. Process External Data
    External-->>API: 13. Return Results
    API-->>App: 14. Return Response
    App->>User: 15. Update UI
```

### 🤖 **EVA AI Assistant Integration Flow**

```mermaid
graph LR
    subgraph "User Interaction"
        UI[User Input] --> CHAT[Chat Interface]
        CHAT --> VOICE[Voice Input Optional]
    end

    subgraph "EVA AI Core"
        VOICE --> NLP[Natural Language Processing]
        NLP --> INTENT[Intent Recognition]
        INTENT --> CONTEXT[Context Analysis]
        CONTEXT --> AGENT[AI Agent Routing]
    end

    subgraph "Specialized AI Agents"
        AGENT --> CREDIT_AGENT[Credit Analysis Agent]
        AGENT --> RISK_AGENT[Risk Assessment Agent]
        AGENT --> DOC_AGENT[Document Processing Agent]
        AGENT --> BUSINESS_AGENT[Business Lookup Agent]
        AGENT --> COMPLIANCE_AGENT[Compliance Agent]
    end

    subgraph "Data Integration"
        CREDIT_AGENT --> CREDIT_DATA[Credit Bureau Data]
        RISK_AGENT --> RISK_DATA[Risk Models]
        DOC_AGENT --> OCR[Document OCR]
        BUSINESS_AGENT --> BUSINESS_DATA[Business Registry Data]
        COMPLIANCE_AGENT --> AUDIT_DATA[Audit Logs]
    end

    subgraph "Response Generation"
        CREDIT_DATA --> AI_RESPONSE[AI Response Generator]
        RISK_DATA --> AI_RESPONSE
        OCR --> AI_RESPONSE
        BUSINESS_DATA --> AI_RESPONSE
        AUDIT_DATA --> AI_RESPONSE

        AI_RESPONSE --> FORMATTED[Format Response]
        FORMATTED --> RECOMMENDATIONS[Generate Recommendations]
        RECOMMENDATIONS --> UI_UPDATE[Update User Interface]
    end
```

### 📄 **Document Management & Filelock Drive Flow**

```mermaid
graph TB
    subgraph "Document Upload Sources"
        LOCAL[Local File Upload] --> UPLOAD_HANDLER[Upload Handler]
        GDRIVE[Google Drive] --> UPLOAD_HANDLER
        ONEDRIVE[OneDrive] --> UPLOAD_HANDLER
        DROPBOX[Dropbox] --> UPLOAD_HANDLER
        SCAN[Document Scanner] --> UPLOAD_HANDLER
    end

    subgraph "Document Processing Pipeline"
        UPLOAD_HANDLER --> VALIDATE[File Validation]
        VALIDATE --> VIRUS_SCAN[Virus Scanning]
        VIRUS_SCAN --> OCR_PROCESS[OCR Processing]
        OCR_PROCESS --> AI_ANALYSIS[AI Document Analysis]
        AI_ANALYSIS --> CLASSIFY[Document Classification]
    end

    subgraph "Filelock Immutable Storage"
        CLASSIFY --> ENCRYPT[End-to-End Encryption]
        ENCRYPT --> HASH[Document Hashing]
        HASH --> BLOCKCHAIN[Blockchain Recording]
        BLOCKCHAIN --> IPFS[IPFS Storage]
        IPFS --> LEDGER[Immutable Ledger]
    end

    subgraph "Document Retrieval"
        LEDGER --> SEARCH[Document Search]
        SEARCH --> DECRYPT[Decryption]
        DECRYPT --> PREVIEW[Document Preview]
        PREVIEW --> DOWNLOAD[Secure Download]
        DOWNLOAD --> AUDIT_LOG[Audit Logging]
    end

    subgraph "Compliance & Audit"
        AUDIT_LOG --> SOC2_AUDIT[SOC 2 Audit Trail]
        SOC2_AUDIT --> RETENTION[Data Retention Policy]
        RETENTION --> DISPOSAL[Secure Disposal]
    end
```

### 💳 **Credit Analysis & Risk Assessment Flow**

```mermaid
flowchart TD
    START[Credit Analysis Request] --> AUTH_CHECK{User Authorized?}
    AUTH_CHECK -->|No| ACCESS_DENIED[Access Denied]
    AUTH_CHECK -->|Yes| GATHER_DATA[Gather Customer Data]

    GATHER_DATA --> CREDIT_PULL[Pull Credit Reports]
    CREDIT_PULL --> EXPERIAN_API[Experian API]
    CREDIT_PULL --> EQUIFAX_API[Equifax API]
    CREDIT_PULL --> TRANSUNION_API[TransUnion API]

    EXPERIAN_API --> CREDIT_MERGE[Merge Credit Data]
    EQUIFAX_API --> CREDIT_MERGE
    TRANSUNION_API --> CREDIT_MERGE

    CREDIT_MERGE --> FINANCIAL_DATA[Gather Financial Data]
    FINANCIAL_DATA --> BANK_STATEMENTS[Bank Statement Analysis]
    FINANCIAL_DATA --> TAX_RETURNS[Tax Return Analysis]
    FINANCIAL_DATA --> BUSINESS_FINANCIALS[Business Financial Analysis]

    BANK_STATEMENTS --> AI_ANALYSIS[AI Financial Analysis]
    TAX_RETURNS --> AI_ANALYSIS
    BUSINESS_FINANCIALS --> AI_ANALYSIS

    AI_ANALYSIS --> RISK_SCORING[Risk Score Calculation]
    RISK_SCORING --> DEBT_TO_INCOME[Debt-to-Income Ratio]
    RISK_SCORING --> CASH_FLOW[Cash Flow Analysis]
    RISK_SCORING --> CREDIT_UTILIZATION[Credit Utilization]

    DEBT_TO_INCOME --> COMPOSITE_SCORE[Composite Risk Score]
    CASH_FLOW --> COMPOSITE_SCORE
    CREDIT_UTILIZATION --> COMPOSITE_SCORE

    COMPOSITE_SCORE --> RECOMMENDATION[Generate Recommendation]
    RECOMMENDATION --> APPROVE[Approve]
    RECOMMENDATION --> CONDITIONAL[Conditional Approval]
    RECOMMENDATION --> DECLINE[Decline]

    APPROVE --> TERMS[Generate Loan Terms]
    CONDITIONAL --> REQUIREMENTS[Additional Requirements]
    DECLINE --> ADVERSE_ACTION[Adverse Action Notice]

    TERMS --> COMPLIANCE_CHECK[Compliance Validation]
    REQUIREMENTS --> COMPLIANCE_CHECK
    ADVERSE_ACTION --> COMPLIANCE_CHECK

    COMPLIANCE_CHECK --> AUDIT_TRAIL[Audit Trail Recording]
    AUDIT_TRAIL --> NOTIFICATION[User Notification]
    NOTIFICATION --> END[Process Complete]
```

### 🏢 **Business Lookup & KYB Integration**

```mermaid
graph LR
    subgraph "Business Search Input"
        SEARCH_INPUT[Business Name/EIN Input] --> VALIDATION[Input Validation]
        VALIDATION --> SEARCH_PARAMS[Search Parameters]
    end

    subgraph "Data Source Integration"
        SEARCH_PARAMS --> SOS_APIs[Secretary of State APIs]
        SEARCH_PARAMS --> FEDERAL_APIs[Federal Business Registries]
        SEARCH_PARAMS --> COMMERCIAL_APIs[Commercial Data Providers]

        SOS_APIs --> STATE_DATA[State Registration Data]
        FEDERAL_APIs --> FEDERAL_DATA[Federal Registration Data]
        COMMERCIAL_APIs --> COMMERCIAL_DATA[Commercial Information]
    end

    subgraph "Data Processing"
        STATE_DATA --> DATA_MERGE[Data Merging Engine]
        FEDERAL_DATA --> DATA_MERGE
        COMMERCIAL_DATA --> DATA_MERGE

        DATA_MERGE --> DEDUPLICATION[Deduplication]
        DEDUPLICATION --> VERIFICATION[Data Verification]
        VERIFICATION --> ENRICHMENT[Data Enrichment]
    end

    subgraph "KYB Compliance"
        ENRICHMENT --> SANCTIONS_CHECK[Sanctions Screening]
        SANCTIONS_CHECK --> OFAC_CHECK[OFAC Verification]
        OFAC_CHECK --> PEP_CHECK[PEP Screening]
        PEP_CHECK --> AML_SCREENING[AML Screening]
    end

    subgraph "Business Profile"
        AML_SCREENING --> BUSINESS_PROFILE[Complete Business Profile]
        BUSINESS_PROFILE --> OWNERSHIP_STRUCTURE[Ownership Structure]
        BUSINESS_PROFILE --> FINANCIAL_HISTORY[Financial History]
        BUSINESS_PROFILE --> COMPLIANCE_STATUS[Compliance Status]
    end

    subgraph "Output & Storage"
        COMPLIANCE_STATUS --> PROFILE_STORAGE[Secure Profile Storage]
        PROFILE_STORAGE --> AUDIT_LOGGING[Audit Logging]
        AUDIT_LOGGING --> USER_DISPLAY[User Dashboard Display]
    end
```

### 🔐 **Security & Compliance Architecture**

```mermaid
graph TB
    subgraph "Authentication Layer"
        LOGIN[User Login] --> MFA[Multi-Factor Auth]
        MFA --> JWT[JWT Token Generation]
        JWT --> RBAC[Role-Based Access Control]
    end

    subgraph "Authorization Matrix"
        RBAC --> BORROWER_ROLE[Borrower Permissions]
        RBAC --> LENDER_ROLE[Lender Permissions]
        RBAC --> ADMIN_ROLE[Admin Permissions]
        RBAC --> COMPLIANCE_ROLE[Compliance Permissions]

        BORROWER_ROLE --> BORROWER_ROUTES[Borrower Routes]
        LENDER_ROLE --> LENDER_ROUTES[Lender Routes]
        ADMIN_ROLE --> ADMIN_ROUTES[Admin Routes]
        COMPLIANCE_ROLE --> COMPLIANCE_ROUTES[Compliance Routes]
    end

    subgraph "Data Protection"
        BORROWER_ROUTES --> ENCRYPTION[Data Encryption at Rest]
        LENDER_ROUTES --> ENCRYPTION
        ADMIN_ROUTES --> ENCRYPTION
        COMPLIANCE_ROUTES --> ENCRYPTION

        ENCRYPTION --> TLS[TLS Encryption in Transit]
        TLS --> DLP[Data Loss Prevention]
        DLP --> MASKING[Data Masking]
    end

    subgraph "SOC 2 Type 2 Controls"
        MASKING --> ACCESS_LOGGING[Access Logging]
        ACCESS_LOGGING --> CHANGE_MONITORING[Change Monitoring]
        CHANGE_MONITORING --> INCIDENT_RESPONSE[Incident Response]
        INCIDENT_RESPONSE --> VULNERABILITY_SCAN[Vulnerability Scanning]
    end

    subgraph "Compliance Monitoring"
        VULNERABILITY_SCAN --> CONTINUOUS_MONITORING[Continuous Monitoring]
        CONTINUOUS_MONITORING --> AUDIT_TRAIL[Comprehensive Audit Trail]
        AUDIT_TRAIL --> COMPLIANCE_REPORTING[Compliance Reporting]
        COMPLIANCE_REPORTING --> REGULATORY_SUBMISSION[Regulatory Submissions]
    end
```

### 📱 **Customer Retention Platform Flow**

```mermaid
sequenceDiagram
    participant Customer as Customer
    participant CRM as CRM Platform
    participant AI as AI Engine
    participant Analytics as Analytics
    participant Communication as Communication

    Customer->>CRM: Interaction/Behavior Data
    CRM->>Analytics: Analyze Customer Journey
    Analytics->>AI: Predict Churn Risk
    AI->>AI: Calculate Retention Score
    AI->>CRM: Return Risk Assessment

    alt High Churn Risk
        CRM->>Communication: Trigger Retention Campaign
        Communication->>Customer: Personalized Outreach
        Customer->>CRM: Response/Engagement
        CRM->>Analytics: Update Customer Score
    end

    alt Medium Risk
        CRM->>Communication: Educational Content
        Communication->>Customer: Value-Added Information
    end

    alt Low Risk
        CRM->>Communication: Regular Check-in
        Communication->>Customer: Satisfaction Survey
    end

    Customer->>CRM: Ongoing Interactions
    CRM->>Analytics: Continuous Learning
    Analytics->>AI: Model Improvement
```

---

## 🎯 **Key Features Overview**

### 🏦 **Financial Services Core**

- **Advanced Credit Analysis** with AI-powered risk assessment
- **Real-time Credit Monitoring** with bureau integrations
- **Automated Underwriting** with compliance validation
- **Portfolio Management** with performance analytics
- **Regulatory Compliance** (SOC 2 Type 2, GAAP, KYC/KYB, AML)

### 🤖 **AI-Powered Intelligence**

- **EVA AI Assistant** with financial expertise
- **Document Intelligence** with OCR and classification
- **Predictive Analytics** for risk and retention
- **Natural Language Processing** for customer interactions
- **Machine Learning Models** for continuous improvement

### 📄 **Document Management**

- **Filelock Drive** with blockchain immutability
- **Cloud Storage Integration** (Google Drive, OneDrive, Dropbox)
- **Smart Document Classification** with AI tagging
- **Version Control** with audit trails
- **Secure Sharing** with access controls

### 🔍 **Business Intelligence**

- **Comprehensive Business Lookup** with KYB verification
- **Real-time Data Integration** from multiple sources
- **Financial Performance Analytics** with trend analysis
- **Risk Assessment Dashboards** with visual insights
- **Compliance Monitoring** with automated alerts

---

## 🚀 **Quick Start**

### Prerequisites

- Node.js 18.x or 20.x (check with `node --version`)
- npm or yarn package manager

### Development Setup (Auth Disabled)

```bash
# Clone the repository
git clone <repository-url>
cd evafi-ai-fe-demo-dev-3-testing-to-craco

# Install dependencies
npm install --legacy-peer-deps

# Start development server (Auth0 DISABLED for development)
npm run start
# or
npm run dev
```

**🔒 Authentication is DISABLED during development** - you can access all features without logging in.

## 🔐 Authentication Configuration

### Development Mode (Current Setup)

- **Auth0 is DISABLED** by default
- **Demo mode is ENABLED** - full access without authentication
- **All features accessible** for development and testing
- **No login required** - authentication is bypassed

### Production/Staging Mode (After Development)

When ready to deploy to staging/production:

1. **Update Environment Variables:**

   ```bash
   # Remove demo mode flags
   REACT_APP_DEMO_MODE=false
   REACT_APP_BYPASS_AUTH=false
   NODE_ENV=production
   ```

2. **Configure Auth0 Settings:**

   ```bash
   REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com
   REACT_APP_AUTH0_CLIENT_ID=your-client-id
   REACT_APP_AUTH0_AUDIENCE=https://your-api-audience
   ```

3. **Enable Feature Flags:**

   ```typescript
   // src/config/featureFlags.ts
   export const featureFlags: FeatureFlags = {
     auth0: {
       enabled: true, // Enable Auth0
       showLoginButton: true,
       showUserMenu: true,
     },
   };
   ```

4. **Production Build:**
   ```bash
   npm run build:production
   npm run deploy:production
   ```

## 📊 Features

### Core Financial Services

- **Loan Application Processing** - Complete application lifecycle
- **Document Management** - Secure document upload and processing
- **Customer Relationship Management** - Comprehensive CRM dashboard
- **Business Lookup** - Automated business verification
- **Workflow Automation** - Streamlined financial processes
- **Compliance Monitoring** - Regulatory compliance tracking

### Dashboard Visualizations

- **Performance Analytics** - Real-time metrics with Recharts
- **Service Utilization** - Monitor all platform services
- **Financial Reports** - Revenue, profit, and financial health
- **Document Processing** - Pipeline status and volumes
- **Customer Engagement** - Multi-channel analytics
- **System Health** - Uptime monitoring and performance

## 🛠 Available Scripts

### Development (Auth Disabled)

```bash
npm run start          # Start with auth disabled
npm run dev            # Alternative dev command
npm run start:no-lint  # Start without linting (faster)
```

### Testing

```bash
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
```

### Production

```bash
npm run build:production  # Production build with auth enabled
npm run build:staging     # Staging build
npm run deploy:staging    # Deploy to staging
npm run deploy:production # Deploy to production
```

## 🏗 Project Structure

```
src/
├── components/           # React components
│   ├── customerRetention/  # CRP Dashboard (Visual Analytics)
│   ├── Auth/               # Authentication components
│   ├── common/             # Shared UI components
│   └── layout/             # Layout components
├── config/               # Configuration files
│   ├── auth0.ts           # Auth0 configuration
│   ├── featureFlags.ts    # Feature toggle configuration
│   └── environment.ts     # Environment settings
├── services/             # API services and business logic
├── hooks/                # Custom React hooks
├── contexts/             # React context providers
└── utils/                # Utility functions
```

## 🎯 Key Configuration Files

### Authentication Control

- `src/config/featureFlags.ts` - Enable/disable Auth0 features
- `src/components/Auth/ProtectedRoute.tsx` - Route protection logic
- `src/App.tsx` - Main app with auth configuration

### Development vs Production

| Environment | Auth0 Status | Demo Mode   | Access Level    |
| ----------- | ------------ | ----------- | --------------- |
| Development | **DISABLED** | **ENABLED** | **Full Access** |
| Staging     | **ENABLED**  | DISABLED    | Restricted      |
| Production  | **ENABLED**  | DISABLED    | Restricted      |

## 🔧 Environment Variables

### Development (Current)

```bash
NODE_ENV=development
REACT_APP_DEMO_MODE=true      # Bypasses authentication
REACT_APP_BYPASS_AUTH=true    # Additional auth bypass
```

### Production (When Ready)

```bash
NODE_ENV=production
REACT_APP_DEMO_MODE=false
REACT_APP_BYPASS_AUTH=false
REACT_APP_AUTH0_DOMAIN=your-domain
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=your-audience
```

## 📈 Dashboard Features

The Customer Retention Platform includes comprehensive visualizations:

- **6 Interactive Tabs** showcasing platform analytics
- **Recharts Integration** for beautiful data visualization
- **Real-time Metrics** with mock data for development
- **Service Monitoring** across all platform components
- **Financial Analytics** with revenue and profit tracking
- **System Health** monitoring with SLA targets

## 🚀 Deployment Workflow

### Development Phase (Current)

1. ✅ Auth0 is disabled
2. ✅ Full access for development
3. ✅ All features available for testing
4. ✅ No authentication barriers

### Pre-Production Checklist

- [ ] Enable Auth0 in `featureFlags.ts`
- [ ] Configure Auth0 tenant and application
- [ ] Set production environment variables
- [ ] Test authentication flow
- [ ] Update callback URLs in Auth0 dashboard
- [ ] Configure user roles and permissions

### Production Deployment

- [ ] Run `npm run build:production`
- [ ] Deploy with Auth0 enabled
- [ ] Verify authentication is working
- [ ] Monitor system performance

## 🔒 Security Notes

- **Development**: Authentication is bypassed for development efficiency
- **Production**: Full Auth0 authentication with role-based access control
- **Environment**: Sensitive credentials should be in environment variables
- **Compliance**: Follow SOC2 and financial regulations in production

## 🆘 Troubleshooting

### Authentication Issues

```bash
# If you see authentication prompts during development:
1. Verify REACT_APP_DEMO_MODE=true in environment
2. Check that NODE_ENV=development
3. Restart development server: npm run start
```

### Build Issues

```bash
# Clean install if there are dependency conflicts:
npm run emergency-install

# For Node version issues:
nvm use 20.11.0  # or 18.x
```

## 📞 Support

For development questions or issues:

1. Check this README for configuration guidance
2. Verify environment variables are set correctly
3. Ensure Auth0 is disabled for development
4. Check the troubleshooting section above

---

**Current Status**: 🟢 **Development Mode Active** - Auth0 authentication is disabled for development efficiency.
