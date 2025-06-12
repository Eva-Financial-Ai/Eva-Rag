# Environment Setup Guide

## Business Lookup & Verification System + Enhanced EVA Features

### 🚀 Quick Setup Checklist

- [ ] Cloudflare Account (Workers AI + R2 Storage)
- [ ] Brave Search API Key
- [ ] Supabase Database
- [ ] Vector Database (for EVA RAG)
- [ ] Microsoft OneDrive API
- [ ] Google Drive API
- [ ] Filelock Drive Account
- [ ] Environment Variables Configured
- [ ] Database Schema Deployed

### 📋 Required Environment Variables

Create a `.env.local` file in your project root with the following:

```bash
# Business Lookup System - Cloudflare Workers AI
REACT_APP_CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
REACT_APP_CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
REACT_APP_CLOUDFLARE_WORKERS_ENDPOINT=https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/ai/run

# Business Lookup System - Brave Search
REACT_APP_BRAVE_SEARCH_API_KEY=your-brave-search-api-key
REACT_APP_BRAVE_SEARCH_ENDPOINT=https://api.search.brave.com/res/v1/web/search

# Business Lookup System - Cloudflare R2 Storage
REACT_APP_CLOUDFLARE_R2_ACCOUNT_ID=your-r2-account-id
REACT_APP_CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key
REACT_APP_CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-key
REACT_APP_CLOUDFLARE_R2_BUCKET_NAME=eva-documents
REACT_APP_CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# Database Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# Vector Database (for EVA RAG)
REACT_APP_VECTOR_DB_ENDPOINT=https://your-vector-db.com/api
REACT_APP_VECTOR_DB_API_KEY=your-vector-db-api-key

# Microsoft OneDrive Integration
REACT_APP_MICROSOFT_CLIENT_ID=your-microsoft-app-client-id
REACT_APP_MICROSOFT_REDIRECT_URI=http://localhost:3000/auth/microsoft/callback

# Google Drive Integration
REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id
REACT_APP_GOOGLE_API_KEY=your-google-api-key

# Filelock Drive (Secure Financial Storage)
REACT_APP_FILELOCK_API_KEY=your-filelock-api-key
REACT_APP_FILELOCK_ENDPOINT=https://api.filelock.com/v1
REACT_APP_FILELOCK_ORG_ID=your-organization-id

# Feature Flags
REACT_APP_ENABLE_BUSINESS_LOOKUP=true
REACT_APP_ENABLE_STATE_MONITORING=true
REACT_APP_ENABLE_COMPLIANCE_CHECKING=true
REACT_APP_ENABLE_SPEECH_FEATURES=true
REACT_APP_ENABLE_CLOUD_STORAGE=true
REACT_APP_ENABLE_WORKFLOW_AUTOMATION=true
REACT_APP_ENABLE_CONVERSATION_INTELLIGENCE=true

# Development/Debug Flags
REACT_APP_DEBUG_BUSINESS_LOOKUP=false
REACT_APP_DEBUG_SPEECH_SERVICE=false
REACT_APP_DEBUG_WORKFLOW_AUTOMATION=false
```

### 🔧 Service Setup Instructions

#### 1. Cloudflare Workers AI Setup

1. Create a Cloudflare account
2. Navigate to Workers & Pages
3. Create a new worker
4. Get your Account ID and API Token
5. Enable Workers AI in your account

#### 2. Brave Search API Setup

1. Visit https://api.search.brave.com/
2. Sign up for an API key
3. Choose the appropriate plan for your usage

#### 3. Microsoft OneDrive API Setup

1. Go to Azure Portal (https://portal.azure.com)
2. Navigate to "App registrations"
3. Create a new registration
4. Add Microsoft Graph permissions:
   - `Files.ReadWrite`
   - `Files.ReadWrite.All`
5. Get your Client ID
6. Add redirect URI: `http://localhost:3000/auth/microsoft/callback`

#### 4. Google Drive API Setup

1. Go to Google Cloud Console (https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Drive API
4. Create credentials (OAuth 2.0)
5. Add authorized JavaScript origins: `http://localhost:3000`
6. Add authorized redirect URIs: `http://localhost:3000/auth/google/callback`

#### 5. Filelock Drive Setup

1. Sign up at https://filelock.com
2. Create an organization account
3. Generate API key from dashboard
4. Note your Organization ID

#### 6. Supabase Database Setup

```sql
-- Create tables for enhanced EVA features

-- Conversation Intelligence
CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Automation Logs
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  action_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  result JSONB,
  executed_by UUID,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Document Storage Tracking
CREATE TABLE document_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  file_name TEXT NOT NULL,
  file_size INTEGER,
  document_type TEXT NOT NULL,
  storage_provider TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  download_url TEXT,
  is_encrypted BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Speech Service Usage
CREATE TABLE speech_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  session_type TEXT NOT NULL CHECK (session_type IN ('recognition', 'synthesis')),
  duration_seconds INTEGER,
  words_processed INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cloud Storage Providers
CREATE TABLE cloud_storage_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('microsoft', 'google', 'filelock')),
  is_connected BOOLEAN DEFAULT FALSE,
  connected_at TIMESTAMP WITH TIME ZONE,
  last_sync TIMESTAMP WITH TIME ZONE,
  quota_used BIGINT DEFAULT 0,
  quota_total BIGINT,
  settings JSONB
);

-- Financial Ratios Cache
CREATE TABLE financial_ratios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  ratio_type TEXT NOT NULL,
  value DECIMAL(10,4),
  calculation_date DATE,
  source_document_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit and Background Check Results
CREATE TABLE credit_background_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  check_type TEXT NOT NULL CHECK (check_type IN ('credit', 'background', 'combined')),
  bureau_source TEXT,
  score INTEGER,
  grade TEXT,
  results JSONB NOT NULL,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);
```

### 🛠️ Development Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server with enhanced features
npm run start

# Start without linting (for faster development)
npm run start:no-lint

# Test specific features
npm run test:business-lookup
npm run test:speech-service
npm run test:workflow-automation

# Debug specific services
npm run debug:business-lookup
npm run debug:speech-service

# Emergency cleanup if something breaks
npm run emergency-install

# Build for production
npm run build
```

### 🔐 Security Considerations

#### For Financial Applications:

1. **API Keys**: Store all API keys in environment variables, never commit to code
2. **File Encryption**: Filelock Drive automatically encrypts financial documents
3. **Access Tokens**: Cloud storage tokens are stored in memory only
4. **Speech Data**: Voice recordings are processed locally when possible
5. **Workflow Approvals**: High-risk workflows require explicit approval

#### Network Security:

```bash
# Add to your .env.local for production
REACT_APP_ENFORCE_HTTPS=true
REACT_APP_CSP_ENABLED=true
REACT_APP_CORS_ORIGINS=https://yourdomain.com
```

### 🧪 Testing the Setup

#### 1. Test Business Lookup

```javascript
// In browser console
import { businessLookupService } from './src/services/BusinessLookupService';
businessLookupService.searchBusiness('Test Company', ['CA', 'NY']);
```

#### 2. Test Speech Services

```javascript
import { speechService } from './src/services/SpeechService';

// Test speech recognition
speechService.startListening({
  onResult: result => console.log('Transcript:', result.transcript),
});

// Test text-to-speech
speechService.speak('Hello, this is EVA speaking');
```

#### 3. Test Cloud Storage

```javascript
import { cloudStorageService } from './src/services/CloudStorageService';

// Check connected providers
console.log(cloudStorageService.getConnectedProviders());

// Test connection (after setting up OAuth)
await cloudStorageService.connectGoogle();
await cloudStorageService.connectMicrosoft();
await cloudStorageService.connectFilelock();
```

#### 4. Test Workflow Automation

```javascript
import { workflowAutomationService } from './src/services/WorkflowAutomationService';
import { customer } from './your-test-data';

// Test DSCR calculation
const result = await workflowAutomationService.executeWorkflow(
  {
    action: 'CALCULATE_DSCR',
    // ... other action properties
  },
  customer,
  {
    financialData: {
      /* test data */
    },
  },
);
```

### 🚨 Troubleshooting

#### Common Issues:

1. **PostCSS Configuration Error**

   ```bash
   # If you see "Unexpected token 'export'" error
   # Make sure postcss.config.js uses module.exports, not export default
   ```

2. **Speech Recognition Not Working**

   - Chrome/Edge: Requires HTTPS in production
   - Firefox: Limited support, use Chrome for development
   - Safari: Requires explicit user interaction to start

3. **Cloud Storage Authentication**

   ```bash
   # Clear browser storage if OAuth fails
   localStorage.clear();
   sessionStorage.clear();
   ```

4. **Workflow Execution Timeout**

   ```bash
   # Increase timeout in development
   REACT_APP_WORKFLOW_TIMEOUT=30000
   ```

5. **File Upload Issues**
   - Check file size limits (default 10MB)
   - Verify MIME types are allowed
   - Ensure storage provider is connected

### 📞 Support

If you encounter issues:

1. Check the browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Test individual services in isolation
4. Check network connectivity for external APIs
5. Review the debug logs with appropriate debug flags enabled

### 🔄 Updates

This setup supports hot-reloading and real-time updates. When you modify:

- **Conversation Intelligence**: New suggestions appear immediately
- **Workflow Automation**: Results update in real-time
- **Speech Services**: Changes apply to next session
- **Cloud Storage**: Connection status updates automatically
