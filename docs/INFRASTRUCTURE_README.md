# 🚀 EVA AI Infrastructure - Complete Setup Guide

# ================================================

**Enterprise-Grade Security Infrastructure with Triple-Redundant Protection**

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

## 📋 **Environment Configuration**

### **🔐 Cloudflare Credentials**

```bash
# Cloudflare Configuration (Account: eace6f3c56b5735ae4a9ef385d6ee914)
CLOUDFLARE_ACCOUNT_ID=eace6f3c56b5735ae4a9ef385d6ee914
CLOUDFLARE_ZONE_ID_STAGING=79cbd8176057c91e2e2329ffd8b386a5
CLOUDFLARE_ZONE_ID_PRODUCTION=913680b4428f2f4d1c078dd841cd8cdb
CLOUDFLARE_API_TOKEN=qCC_PYqqlXW6ufNP_SuGW8CrhPoKB9BfFZEPuOiT
CLOUDFLARE_EMAIL=support@evafi.ai
CLOUDFLARE_IMAGES_API=QG4Ku8w8UNM29vIZV1VoMeHEAOi9U7UF
```

### **📞 Support Configuration**

```bash
# Twilio Integration
SUPPORT_PHONE_TWILIO=7025762013
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
```

### **🗄️ Database Configuration**

```bash
# Supabase (Primary Database)
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Advanced Services
HYPERDRIVE_ID=your-hyperdrive-id
QUEUE_NAME=eva-processing-queue
ANALYTICS_DATASET=eva-analytics
```

⚠️ **Security Note**: Change API tokens before production release

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

- **JWT Authentication**: Secure token-based access control
- **Row-Level Security**: Supabase RLS policies
- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Audit Logging**: Comprehensive activity tracking

## 🗄️ **Database Redundancy Architecture**

### **Primary Database: Supabase (PostgreSQL)**

```sql
-- Real-time subscriptions enabled
CREATE PUBLICATION eva_realtime FOR ALL TABLES;

-- Tables: users, credit_applications, transactions,
--         chat_sessions, storage_locks, digital_assets
--         audit_logs, payment_methods, feature_flags
```

### **Backup Database: Cloudflare D1**

- **Automatic Synchronization**: Real-time replication from Supabase
- **Disaster Recovery**: 15-minute RTO, 1-hour RPO
- **15 Tables**: Complete schema replication with indexes

## ☁️ **Real-time Content Distribution**

### **R2 Storage Systems**

- **eva-documents**: Secure document storage with AES-256 encryption
- **eva-static-assets**: CDN-optimized static file hosting
- **eva-backups**: Automated daily backups with 30-day retention

### **KV Stores for High-Performance Caching**

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
};
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

---

_Last Updated: June 6, 2025_  
_Infrastructure: Cloudflare Enterprise + Supabase + Triple Security_  
_Security Status: Triple-Redundant Firewall Active_
