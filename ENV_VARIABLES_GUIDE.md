# EVA PLATFORM - ENVIRONMENT VARIABLES DOCUMENTATION
## Environment Variables Setup Guide

### Overview
This guide provides systematic setup for all environment configurations.

### Required Production Variables
- REACT_APP_AUTH0_DOMAIN - Your Auth0 tenant domain
- REACT_APP_AUTH0_CLIENT_ID - Auth0 application client ID
- REACT_APP_PLAID_PUBLIC_KEY - Plaid public key (production)
- REACT_APP_STRIPE_PUBLISHABLE_KEY - Stripe publishable key (live)
- REACT_APP_GEOAPIFY_API_KEY - Geoapify API key
- REACT_APP_SENTRY_DSN - Sentry DSN for error monitoring
- REACT_APP_ENCRYPTION_KEY - Encryption key for sensitive data

# Environment Variables Configuration Guide

This guide outlines all the environment variables required for the EVA AI Platform across different environments.

## 🌐 **Cloudflare Configuration (Account: eace6f3c56b5735ae4a9ef385d6ee914)**
```bash
# Cloudflare Account Configuration
CLOUDFLARE_ACCOUNT_ID=eace6f3c56b5735ae4a9ef385d6ee914
CLOUDFLARE_EMAIL=support@evafi.ai

# Staging Environment (evafin.ai)
CLOUDFLARE_ZONE_ID=79cbd8176057c91e2e2329ffd8b386a5
CLOUDFLARE_API_TOKEN=qCC_PYqqlXW6ufNP_SuGW8CrhPoKB9BfFZEPuOiT

# Production Environment Zone ID
CLOUDFLARE_ZONE_ID_PRODUCTION=913680b4428f2f4d1c078dd841cd8cdb

# Note: API token works for both staging and production
# Remember to update API keys before production release

# Cloudflare Pages
CLOUDFLARE_PROJECT_NAME=eva-ai-frontend
CLOUDFLARE_PAGES_URL=https://evafin.ai

# Cloudflare Workers
CLOUDFLARE_WORKER_DOMAIN=api.evafin.ai
CLOUDFLARE_WORKER_SUBDOMAIN=api

# Support Phone Number (Twilio)
TWILIO_PHONE_NUMBER=7025762013
```

## 🔐 **Authentication & Authorization**
```bash
# Auth0 Configuration (Name: Evafi)
REACT_APP_AUTH0_DOMAIN=evafi.us.auth0.com
REACT_APP_AUTH0_CLIENT_ID=<MISSING_VALUE_REQUIRED>
REACT_APP_AUTH0_AUDIENCE=https://your-api-audience

# Application Login URL
AUTH0_LOGIN_URL=https://demo.evafi.ai

# Auth0 Management API (Backend)
AUTH0_DOMAIN=evafi.us.auth0.com
AUTH0_CLIENT_ID=your-auth0-management-client-id
AUTH0_CLIENT_SECRET=your-auth0-management-client-secret
AUTH0_AUDIENCE=https://evafi.us.auth0.com/api/v2/
```

## 🏦 **Financial Services Integration**
```bash
# Plaid Configuration
PLAID_CLIENT_ID=6418eb26d9bca8001387b1db
REACT_APP_PLAID_PUBLIC_KEY=01e63d043e2c90c762140ca37e619c
PLAID_SECRET_KEY=your-plaid-secret-key
PLAID_ENVIRONMENT=sandbox  # or 'development', 'production'

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
```

## 🗺️ **Location & Mapping Services**
```bash
# Geoapify Configuration
REACT_APP_GEOAPIFY_API_KEY=Up7uUfU#NuZP0GA2fcDF

# Alternative mapping services (if needed)
REACT_APP_MAPBOX_ACCESS_TOKEN=your-mapbox-token
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 🤖 **AI & ML Services**
```bash
# NVIDIA Nemotron 70B (EVA Model)
NVIDIA_API_KEY=your-nvidia-api-key
NVIDIA_MODEL_ENDPOINT=https://api.nvidia.com/v1/nemotron-70b
EVA_MODEL_VERSION=v1.2.0

# LangChain Configuration
LANGCHAIN_API_KEY=your-langchain-api-key
LANGCHAIN_PROJECT=eva-ai-platform

# Vector Databases
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=eva-embeddings

CHROMA_DB_HOST=localhost
CHROMA_DB_PORT=8000
CHROMA_DB_API_KEY=your-chroma-api-key
```

## 🗄️ **Database Configuration**
```bash
# PostgreSQL (Primary Database)
DATABASE_URL=postgresql://username:password@localhost:5432/eva_ai_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=eva_ai_db
POSTGRES_USER=eva_user
POSTGRES_PASSWORD=your-secure-password

# Redis (Caching)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# ClickHouse (Analytics)
CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=8123
CLICKHOUSE_DATABASE=eva_analytics
CLICKHOUSE_USER=eva_user
CLICKHOUSE_PASSWORD=your-clickhouse-password
```

## 📊 **Monitoring & Analytics**
```bash
# Sentry Error Tracking
REACT_APP_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=eva-ai-frontend

# Performance Monitoring
REACT_APP_ANALYTICS_ENDPOINT=https://analytics.evafin.ai/collect
NEW_RELIC_LICENSE_KEY=your-new-relic-license-key
NEW_RELIC_APP_NAME=EVA-AI-Platform
```

## 🔒 **Security & Encryption**
```bash
# Encryption Keys
REACT_APP_ENCRYPTION_KEY=your-32-character-encryption-key
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret-key

# API Security
API_RATE_LIMIT_MAX=100
API_RATE_LIMIT_WINDOW=900000  # 15 minutes in ms
CORS_ORIGINS=https://evafin.ai,https://app.evafin.ai
```

## 🌍 **Environment-Specific Configuration**
```bash
# General Configuration
NODE_ENV=development|staging|production
REACT_APP_API_URL=https://api.evafin.ai
REACT_APP_ENVIRONMENT=staging
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_DEBUGGING=false
REACT_APP_ENABLE_MOCK_DATA=false
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
```

## 🚀 **Deployment Configuration**
```bash
# Docker Configuration
DOCKER_REGISTRY=registry.evafin.ai
DOCKER_IMAGE_TAG=latest

# Kubernetes Configuration
KUBE_NAMESPACE=eva-ai-staging
KUBE_CONFIG_PATH=/path/to/kubeconfig

# CI/CD Pipeline
GITHUB_TOKEN=your-github-token
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
```

## 📝 **Required Permissions & Access Levels**

### **Cloudflare Permissions:**
- **Account**: Read/Write access to account `eace6f3c56b5735ae4a9ef385d6ee914`
- **Zone**: DNS read/write for `evafin.ai`
- **Pages**: Deploy and manage Cloudflare Pages
- **Workers**: Deploy and manage Cloudflare Workers
- **Access**: Configure Zero Trust security policies

### **Auth0 Permissions:**
- **Applications**: Create and manage applications
- **APIs**: Configure API audiences and scopes
- **Users**: Read user profiles and metadata
- **Roles**: Assign and manage user roles

### **Financial Services Permissions:**
- **Plaid**: Link accounts, read transactions, identity verification
- **Stripe**: Process payments, manage subscriptions, handle webhooks

### **AI/ML Permissions:**
- **NVIDIA**: Access to Nemotron 70B model APIs
- **Pinecone**: Vector database read/write operations
- **Chroma**: Local vector database management

### **Database Permissions:**
- **PostgreSQL**: Full CRUD operations on production data
- **Redis**: Cache read/write operations
- **ClickHouse**: Analytics data ingestion and querying

## 🔧 **Setup Instructions**

### 1. **Copy Environment Template**
```bash
cp .env.example .env.local
```

### 2. **Configure Cloudflare**
```bash
# Install Wrangler CLI
npm install -g wrangler

# Authenticate with Cloudflare
wrangler auth login

# Set account ID
wrangler whoami
```

### 3. **Validate Configuration**
```bash
# Check environment variables
npm run env:check

# Test API connections
npm run test:api

# Validate security settings
npm run security:audit
```

## ⚠️ **Security Best Practices**

1. **Never commit `.env` files to version control**
2. **Use different keys for each environment**
3. **Rotate secrets regularly (every 90 days)**
4. **Use environment-specific service accounts**
5. **Enable audit logging for all services**
6. **Implement proper secret management (HashiCorp Vault, AWS Secrets Manager)**

## 🆘 **Troubleshooting**

### Common Issues:
- **CORS Errors**: Check `CORS_ORIGINS` configuration
- **Auth0 Login Issues**: Verify domain and client ID
- **API Connection Failures**: Check network and firewall settings
- **Database Connection Issues**: Verify credentials and network access

### Support Contacts:
- **Technical Lead**: [technical-lead@evafin.ai]
- **DevOps Team**: [devops@evafin.ai]
- **Security Team**: [security@evafin.ai]
