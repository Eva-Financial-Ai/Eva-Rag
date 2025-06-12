# 🏗️ EVA AI Platform - Cloudflare Infrastructure Documentation

## 📋 Table of Contents

- [Overview](#overview)
- [Infrastructure Components](#infrastructure-components)
- [Feature-Specific Configurations](#feature-specific-configurations)
- [Deployment Procedures](#deployment-procedures)
- [Security Implementation](#security-implementation)
- [Custom Domain Setup](#custom-domain-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring & Analytics](#monitoring--analytics)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)
- [Development Workflow](#development-workflow)

## 🎯 Overview

The EVA AI Platform is deployed on Cloudflare's global edge network, utilizing multiple Cloudflare services for enterprise-grade performance, security, and scalability.

### 🌐 Live Deployments

- **Staging**: https://4cf2bcb9.eva-ai-frontend.pages.dev
- **Branch Deployment**: https://dev-3-testing-to-craco.eva-ai-frontend.pages.dev
- **Custom Domain (Staging)**: demo.evafi.ai (to be configured)
- **Production Domain**: app.evafi.ai (future deployment)

## 🏗️ Infrastructure Components

### 1. **Cloudflare Pages** - Frontend Hosting

```bash
Project: eva-ai-frontend
Build Command: npm run build
Build Output: build/
Node Version: 18.x/20.x
```

**Key Features:**

- Global CDN deployment
- Automatic HTTPS
- Preview deployments
- Environment variables
- Edge-side includes

### 2. **KV Namespaces** - Key-Value Storage

#### EVA_CACHE (ID: e28fe91a1b844808a5b3109592b890a7)

```javascript
// Usage in application
const cached = await env.EVA_CACHE.get('user_preferences');
await env.EVA_CACHE.put('user_preferences', JSON.stringify(data), {
  expirationTtl: 3600, // 1 hour
});
```

**Storage Use Cases:**

- User preferences and settings
- Chat conversation caching
- API response caching
- Feature flags
- Session tokens

#### USER_SESSIONS (ID: 3c32a3731dcf444fa788804d20587d43)

```javascript
// Session management
const session = await env.USER_SESSIONS.get(`session_${userId}`);
await env.USER_SESSIONS.put(`session_${userId}`, sessionData, {
  expirationTtl: 86400, // 24 hours
});
```

**Storage Use Cases:**

- User authentication sessions
- Login state management
- Multi-factor authentication tokens
- Remember me functionality

#### ANALYTICS_DATA (ID: 47d169b21b9742db8e3040e7c127964e)

```javascript
// Analytics tracking
await env.ANALYTICS_DATA.put(`event_${timestamp}`, eventData);
const metrics = await env.ANALYTICS_DATA.list({ prefix: 'event_' });
```

**Storage Use Cases:**

- User interaction analytics
- Performance metrics
- Error tracking
- Feature usage statistics

### 3. **R2 Buckets** - Object Storage

#### eva-documents-staging

```javascript
// Document upload and retrieval
const file = await env.DOCUMENT_STORAGE.put(fileName, fileData, {
  httpMetadata: {
    contentType: mimeType,
    cacheControl: 'public, max-age=31536000',
  },
  customMetadata: {
    userId: user.id,
    uploadDate: new Date().toISOString(),
    documentType: 'credit_application',
  },
});
```

**Storage Use Cases:**

- Credit application documents
- KYC/KYB verification files
- Financial statements
- Identity verification documents
- Bank statements
- Tax documents

#### eva-static-assets-staging

```javascript
// Static asset management
const asset = await env.STATIC_ASSETS.get('logos/eva-logo.png');
const imageOptimized = await env.STATIC_ASSETS.put('optimized/image.webp', imageData);
```

**Storage Use Cases:**

- Application logos and branding
- User profile images
- Financial institution logos
- Document templates
- Email templates

#### eva-backups-staging

```javascript
// Automated backup storage
const backup = {
  timestamp: Date.now(),
  type: 'database_backup',
  data: databaseSnapshot,
};
await env.BACKUP_STORAGE.put(`backup_${backup.timestamp}.json`, JSON.stringify(backup));
```

**Storage Use Cases:**

- Database backups
- Configuration backups
- User data backups
- System state snapshots

### 4. **D1 Database** - Serverless SQL

#### eva-main-db-staging (ID: 966ef956-6579-485a-9ac9-53179931324b)

```sql
-- User Management Schema
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  auth0_id TEXT UNIQUE,
  profile_data TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Credit Applications Schema
CREATE TABLE credit_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  application_data TEXT, -- JSON
  status TEXT DEFAULT 'pending',
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  decision TEXT,
  decision_reason TEXT
);

-- Transaction Processing Schema
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  type TEXT NOT NULL, -- 'credit_check', 'application_fee', 'loan_disbursement'
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- EVA Chat Interface Schema
CREATE TABLE chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  session_data TEXT, -- JSON with conversation history
  ai_model TEXT DEFAULT 'nemotron-70b',
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active' -- 'active', 'archived', 'deleted'
);

-- Storage Lock Management Schema
CREATE TABLE storage_locks (
  id TEXT PRIMARY KEY,
  resource_type TEXT NOT NULL, -- 'document', 'application', 'transaction'
  resource_id TEXT NOT NULL,
  locked_by TEXT NOT NULL, -- user_id or system process
  locked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  lock_reason TEXT
);

-- Asset Management Schema
CREATE TABLE digital_assets (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  asset_type TEXT NOT NULL, -- 'document', 'image', 'template'
  file_path TEXT NOT NULL, -- R2 bucket path
  file_size INTEGER,
  mime_type TEXT,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active'
);
```

**Database Usage Examples:**

```javascript
// Credit application processing
const result = await env.EVA_DB.prepare(
  `
  INSERT INTO credit_applications (id, user_id, application_data, status)
  VALUES (?, ?, ?, ?)
`
)
  .bind(applicationId, userId, JSON.stringify(applicationData), 'submitted')
  .run();

// Transaction execution
const transaction = await env.EVA_DB.prepare(
  `
  UPDATE transactions SET status = ?, completed_at = CURRENT_TIMESTAMP
  WHERE id = ? AND status = 'pending'
`
)
  .bind('completed', transactionId)
  .run();

// Storage lock implementation
const lock = await env.EVA_DB.prepare(
  `
  INSERT INTO storage_locks (id, resource_type, resource_id, locked_by, expires_at)
  VALUES (?, ?, ?, ?, datetime('now', '+10 minutes'))
`
)
  .bind(lockId, 'document', documentId, userId)
  .run();
```

## 🎨 Feature-Specific Configurations

### 1. **Credit Application System**

#### Document Upload Flow

```javascript
// 1. Generate secure upload URL
const uploadUrl = await generateSignedUploadUrl(fileName, userId);

// 2. Store document metadata
await env.EVA_DB.prepare(
  `
  INSERT INTO digital_assets (id, user_id, asset_type, file_path, metadata)
  VALUES (?, ?, 'document', ?, ?)
`
)
  .bind(
    assetId,
    userId,
    filePath,
    JSON.stringify({
      originalName: fileName,
      uploadedFor: 'credit_application',
      applicationId: applicationId,
    })
  )
  .run();

// 3. Update application status
await env.EVA_DB.prepare(
  `
  UPDATE credit_applications SET status = 'documents_uploaded'
  WHERE id = ?
`
)
  .bind(applicationId)
  .run();
```

#### Credit Decision Engine

```javascript
// AI-powered credit analysis
const creditAnalysis = await callNemotronAPI({
  prompt: `Analyze credit application: ${applicationData}`,
  model: 'nemotron-70b',
  temperature: 0.1,
});

// Store decision
await env.EVA_DB.prepare(
  `
  UPDATE credit_applications 
  SET status = ?, decision = ?, decision_reason = ?, processed_at = CURRENT_TIMESTAMP
  WHERE id = ?
`
)
  .bind('processed', creditAnalysis.decision, creditAnalysis.reason, applicationId)
  .run();
```

### 2. **Transaction Execution System**

#### Stripe Integration

```javascript
// Payment processing with Stripe
const paymentIntent = await stripe.paymentIntents.create({
  amount: transactionAmount * 100, // Convert to cents
  currency: 'usd',
  metadata: {
    userId: userId,
    transactionType: 'application_fee',
    applicationId: applicationId,
  },
});

// Store transaction record
await env.EVA_DB.prepare(
  `
  INSERT INTO transactions (id, user_id, type, amount, stripe_payment_intent_id)
  VALUES (?, ?, ?, ?, ?)
`
)
  .bind(transactionId, userId, 'application_fee', transactionAmount, paymentIntent.id)
  .run();
```

#### Plaid Bank Verification

```javascript
// Bank account verification
const plaidLinkToken = await plaidClient.linkTokenCreate({
  user: { client_user_id: userId },
  client_name: 'EVA Financial AI',
  products: ['auth', 'transactions'],
  country_codes: ['US'],
});

// Store verification result
await env.ANALYTICS_DATA.put(
  `plaid_verification_${userId}`,
  JSON.stringify({
    status: 'verified',
    accountId: plaidAccountId,
    timestamp: Date.now(),
  })
);
```

### 3. **EVA Chat Interface**

#### AI Conversation Management

```javascript
// Chat session initialization
const chatSession = {
  id: sessionId,
  userId: userId,
  messages: [],
  aiModel: 'nemotron-70b',
  context: {
    userProfile: await getUserProfile(userId),
    recentTransactions: await getRecentTransactions(userId),
  },
};

await env.EVA_DB.prepare(
  `
  INSERT INTO chat_sessions (id, user_id, session_data, ai_model)
  VALUES (?, ?, ?, ?)
`
)
  .bind(sessionId, userId, JSON.stringify(chatSession), 'nemotron-70b')
  .run();

// Message processing
const aiResponse = await processWithNemotron({
  userMessage: message,
  context: chatSession.context,
  conversationHistory: chatSession.messages,
});

// Update conversation
chatSession.messages.push({ role: 'user', content: message });
chatSession.messages.push({ role: 'assistant', content: aiResponse });

await env.EVA_DB.prepare(
  `
  UPDATE chat_sessions SET session_data = ?, last_activity = CURRENT_TIMESTAMP
  WHERE id = ?
`
)
  .bind(JSON.stringify(chatSession), sessionId)
  .run();
```

### 4. **Storage Lock System**

#### Distributed Locking

```javascript
// Acquire lock before critical operations
async function acquireLock(resourceType, resourceId, userId, duration = 300000) {
  const lockId = `lock_${resourceType}_${resourceId}`;
  const expiresAt = new Date(Date.now() + duration);

  try {
    await env.EVA_DB.prepare(
      `
      INSERT INTO storage_locks (id, resource_type, resource_id, locked_by, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `
    )
      .bind(lockId, resourceType, resourceId, userId, expiresAt.toISOString())
      .run();

    return lockId;
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Resource is currently locked by another process');
    }
    throw error;
  }
}

// Release lock after operation
async function releaseLock(lockId) {
  await env.EVA_DB.prepare(
    `
    DELETE FROM storage_locks WHERE id = ?
  `
  )
    .bind(lockId)
    .run();
}
```

### 5. **Asset Press System**

#### Media Processing and Optimization

```javascript
// Image processing for financial documents
async function processDocumentImage(imageData, userId) {
  // Compress and optimize
  const optimizedImage = await compressImage(imageData, {
    quality: 85,
    format: 'webp',
  });

  // Store original in R2
  const originalPath = `documents/${userId}/original/${Date.now()}.pdf`;
  await env.DOCUMENT_STORAGE.put(originalPath, imageData);

  // Store optimized version
  const optimizedPath = `documents/${userId}/optimized/${Date.now()}.webp`;
  await env.STATIC_ASSETS.put(optimizedPath, optimizedImage);

  // Record in database
  await env.EVA_DB.prepare(
    `
    INSERT INTO digital_assets (id, user_id, asset_type, file_path, metadata)
    VALUES (?, ?, 'document', ?, ?)
  `
  )
    .bind(
      generateId(),
      userId,
      originalPath,
      JSON.stringify({
        originalPath,
        optimizedPath,
        processed: true,
        processingDate: new Date().toISOString(),
      })
    )
    .run();
}
```

## 🔐 Security Implementation

### 1. **Content Security Policy (CSP)**

```javascript
// Current CSP Header
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' *.auth0.com *.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: *.cloudflare.com;
  connect-src 'self' *.evafi.ai *.auth0.com *.stripe.com *.plaid.com;
  font-src 'self' fonts.gstatic.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`;
```

### 2. **Auth0 Integration**

```javascript
// Auth0 configuration
const auth0Config = {
  domain: 'evafi.us.auth0.com',
  clientId: process.env.AUTH0_CLIENT_ID, // Stored as Cloudflare secret
  audience: 'https://api.evafi.ai',
  scope: 'openid profile email',
};

// JWT validation
async function validateJWT(token) {
  const decoded = jwt.verify(token, process.env.AUTH0_PUBLIC_KEY);
  return decoded;
}
```

### 3. **Data Encryption**

```javascript
// Sensitive data encryption before storage
async function encryptSensitiveData(data, userId) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(process.env.ENCRYPTION_KEY),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(JSON.stringify(data))
  );

  return {
    encryptedData: Array.from(new Uint8Array(encrypted)),
    iv: Array.from(iv),
  };
}
```

## 🚀 Deployment Procedures

### 1. **Environment Setup**

#### Development Environment

```bash
# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run start:no-lint
```

#### Staging Deployment

```bash
# Build application
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy build --project-name eva-ai-frontend

# Configure custom domain (manual step in dashboard)
# demo.evafi.ai -> eva-ai-frontend project
```

#### Production Deployment

```bash
# Build for production
NODE_ENV=production npm run build

# Deploy to production
wrangler pages deploy build --project-name eva-ai-frontend-production

# Configure custom domain
# app.evafi.ai -> eva-ai-frontend-production project
```

### 2. **Database Migrations**

```bash
# Apply database schema
wrangler d1 execute eva-main-db-staging --file=./migrations/001_initial_schema.sql

# Backup before migrations
wrangler d1 export eva-main-db-staging --output=backup_$(date +%Y%m%d).sql
```

### 3. **Environment Variables Configuration**

#### Required Secrets

```bash
# Auth0 Configuration
wrangler pages secret put AUTH0_CLIENT_ID --project-name eva-ai-frontend
wrangler pages secret put AUTH0_CLIENT_SECRET --project-name eva-ai-frontend
wrangler pages secret put AUTH0_DOMAIN --project-name eva-ai-frontend

# Stripe Configuration
wrangler pages secret put STRIPE_PUBLISHABLE_KEY --project-name eva-ai-frontend
wrangler pages secret put STRIPE_SECRET_KEY --project-name eva-ai-frontend
wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name eva-ai-frontend

# Plaid Configuration
wrangler pages secret put PLAID_CLIENT_ID --project-name eva-ai-frontend
wrangler pages secret put PLAID_SECRET --project-name eva-ai-frontend
wrangler pages secret put PLAID_ENV --project-name eva-ai-frontend

# AI/ML Configuration
wrangler pages secret put NEMOTRON_API_KEY --project-name eva-ai-frontend
wrangler pages secret put PINECONE_API_KEY --project-name eva-ai-frontend
wrangler pages secret put CHROMA_DB_URL --project-name eva-ai-frontend

# Encryption Keys
wrangler pages secret put ENCRYPTION_KEY --project-name eva-ai-frontend
wrangler pages secret put JWT_SECRET --project-name eva-ai-frontend
```

## 🌐 Custom Domain Setup

### 1. **Configure demo.evafi.ai (Staging)**

#### DNS Configuration

```bash
# Add CNAME record in Cloudflare DNS
# Name: demo
# Type: CNAME
# Content: eva-ai-frontend.pages.dev
# TTL: Auto
```

#### Manual Steps (Cloudflare Dashboard)

1. Go to Cloudflare Pages > eva-ai-frontend > Custom domains
2. Add custom domain: `demo.evafi.ai`
3. Verify DNS configuration
4. Wait for SSL certificate provisioning

### 2. **Configure app.evafi.ai (Production)**

```bash
# Create production project
wrangler pages project create eva-ai-frontend-production

# Deploy to production
wrangler pages deploy build --project-name eva-ai-frontend-production

# Configure custom domain in dashboard
# Name: app
# Type: CNAME
# Content: eva-ai-frontend-production.pages.dev
```

## 🔒 SSL/TLS Configuration

### 1. **Automatic SSL Certificate**

- Cloudflare Pages automatically provisions SSL certificates
- Supports both Let's Encrypt and Cloudflare certificates
- Auto-renewal enabled

### 2. **Custom SSL Certificate (Optional)**

```bash
# Upload custom certificate
wrangler cert upload --cert certificate.pem --key private-key.pem --name eva-custom-cert

# Apply to domain
# Manual configuration in Cloudflare Dashboard
```

### 3. **SSL Settings**

```javascript
// Enforce HTTPS redirect
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};
```

## 📊 Monitoring & Analytics

### 1. **Cloudflare Analytics**

- Built-in web analytics
- Real-time traffic monitoring
- Performance metrics
- Security event tracking

### 2. **Custom Analytics Implementation**

```javascript
// Track user interactions
async function trackEvent(eventType, eventData, userId) {
  const analyticsEvent = {
    timestamp: Date.now(),
    type: eventType,
    data: eventData,
    userId: userId,
    sessionId: getSessionId(),
    userAgent: request.headers.get('user-agent'),
    ipAddress: request.headers.get('cf-connecting-ip'),
  };

  await env.ANALYTICS_DATA.put(
    `event_${analyticsEvent.timestamp}_${userId}`,
    JSON.stringify(analyticsEvent)
  );
}

// Usage examples
await trackEvent('credit_application_started', { applicationId }, userId);
await trackEvent('document_uploaded', { documentType: 'bank_statement' }, userId);
await trackEvent('chat_session_initiated', { aiModel: 'nemotron-70b' }, userId);
```

### 3. **Error Tracking and Logging**

```javascript
// Centralized error handling
async function logError(error, context, userId) {
  const errorLog = {
    timestamp: Date.now(),
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    context: context,
    userId: userId,
    environment: process.env.ENVIRONMENT,
  };

  // Store in KV for immediate access
  await env.ANALYTICS_DATA.put(
    `error_${errorLog.timestamp}`,
    JSON.stringify(errorLog),
    { expirationTtl: 2592000 } // 30 days
  );

  // Also store in R2 for long-term analysis
  await env.BACKUP_STORAGE.put(
    `errors/${new Date().toISOString().split('T')[0]}/${errorLog.timestamp}.json`,
    JSON.stringify(errorLog)
  );
}
```

## ⚡ Performance Optimization

### 1. **CDN and Caching Configuration**

```javascript
// Cache strategy for different content types
const cacheHeaders = {
  // Static assets (images, CSS, JS)
  static_assets: 'public, max-age=31536000, immutable',

  // API responses
  api_responses: 'public, max-age=300, s-maxage=600',

  // User-specific content
  user_content: 'private, max-age=0, no-cache',

  // Document previews
  document_previews: 'private, max-age=3600',
};

// Implement cache strategy
function setCacheHeaders(response, contentType) {
  const cacheControl = cacheHeaders[contentType] || 'no-cache';
  response.headers.set('Cache-Control', cacheControl);
  return response;
}
```

### 2. **Image Optimization**

```javascript
// Cloudflare Image Resizing
function getOptimizedImageUrl(imageUrl, width, height, format = 'webp') {
  return `/cdn-cgi/image/width=${width},height=${height},format=${format}/${imageUrl}`;
}

// Usage for user profile images
const profileImageUrl = getOptimizedImageUrl(user.profileImage, 150, 150, 'webp');
```

### 3. **Database Query Optimization**

```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_credit_applications_user_id ON credit_applications(user_id);
CREATE INDEX idx_credit_applications_status ON credit_applications(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_storage_locks_resource ON storage_locks(resource_type, resource_id);
```

### 4. **Bundle Optimization**

```javascript
// Webpack configuration for optimal bundling
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
};
```

## 🛠️ Development Workflow

### 1. **Local Development Setup**

```bash
# Prerequisites
node --version  # Should be 18.x or 20.x
npm --version   # Latest stable

# Clone and setup
git clone <repository-url>
cd evafi-ai-fe-demo
npm install --legacy-peer-deps

# Environment setup
cp .env.example .env.local
# Edit .env.local with development credentials

# Start development server
npm run start:no-lint
```

### 2. **Testing Strategy**

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance
```

### 3. **CI/CD Pipeline**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main, staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci --legacy-peer-deps

      - name: Run tests
        run: npm run test

      - name: Build application
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: eva-ai-frontend
          directory: build
```

## 🔧 Troubleshooting

### 1. **Common Issues and Solutions**

#### Build Failures

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Check Node version
nvm use 20.11.0

# Clean build
npm run clean-install
npm run build
```

#### Deployment Issues

```bash
# Check Wrangler authentication
wrangler auth list

# Verify project configuration
wrangler pages project list

# Check resource bindings
wrangler kv namespace list
wrangler r2 bucket list
wrangler d1 list
```

#### Runtime Errors

```javascript
// Error boundary for React components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logError(error, errorInfo, this.props.userId);
  }

  render() {
    if (this.state.hasError) {
      return <FallbackUI />;
    }
    return this.props.children;
  }
}
```

### 2. **Performance Issues**

```javascript
// Monitor and optimize slow queries
async function queryWithMetrics(query, params) {
  const startTime = Date.now();
  const result = await env.EVA_DB.prepare(query)
    .bind(...params)
    .all();
  const duration = Date.now() - startTime;

  if (duration > 1000) {
    // Log slow queries
    await logSlowQuery(query, params, duration);
  }

  return result;
}
```

### 3. **Security Incidents**

```javascript
// Incident response workflow
async function handleSecurityIncident(incident) {
  // 1. Log incident
  await logError(incident, 'SECURITY_INCIDENT', 'system');

  // 2. Alert administrators
  await sendSecurityAlert(incident);

  // 3. Temporary lockdown if needed
  if (incident.severity === 'HIGH') {
    await enableMaintenanceMode();
  }

  // 4. Generate incident report
  await generateIncidentReport(incident);
}
```

## 📚 Additional Resources

### 1. **Cloudflare Documentation**

- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Workers KV](https://developers.cloudflare.com/kv/)
- [R2 Storage](https://developers.cloudflare.com/r2/)
- [D1 Database](https://developers.cloudflare.com/d1/)

### 2. **EVA AI Platform Specific**

- [Auth0 Integration Guide](https://auth0.com/docs)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Plaid API Documentation](https://plaid.com/docs/)
- [NVIDIA Nemotron Documentation](https://docs.nvidia.com/)

### 3. **Security Best Practices**

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PCI DSS Compliance](https://www.pcisecuritystandards.org/)
- [SOC 2 Type II](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html)

---

## 🔄 Continuous Improvement

This documentation is a living document that should be updated as the infrastructure evolves. Regular reviews should be conducted to ensure accuracy and completeness.

**Last Updated**: June 5, 2025  
**Version**: 1.0.0  
**Maintainer**: EVA AI Development Team
