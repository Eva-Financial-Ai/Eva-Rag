# 🚀 EVA Platform - Comprehensive Payment & Sales Analytics Setup Guide

## 📋 Overview

This guide provides a complete setup for the EVA Platform's advanced sales tracking system, payment processing with Stripe and Plaid, Cloudflare infrastructure integration, and production-ready deployment.

**What's New in This Release:**

- ✅ Complete sales performance tracking for all 13+ products
- ✅ Stripe payment processing with webhooks
- ✅ Plaid bank account integration for ACH payments
- ✅ Real-time sales analytics dashboard
- ✅ Cloudflare CDN, security, and load balancing
- ✅ Redis removal and performance optimization
- ✅ Production-ready server setup scripts

---

## 🎯 Quick Start

### 1. Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (test and production keys)
- Plaid account (development and production)
- Cloudflare account (optional but recommended)

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Install dependencies
npm install

# Setup database
npm run db:setup

# Build the application
npm run build
```

### 3. Payment System Setup

```bash
# Setup Stripe products (test mode first)
node scripts/setup-stripe-products.js --test-mode

# Test payment integration
bash scripts/test-payment-integration.sh

# Setup production server (Linux only)
bash scripts/setup-production-server.sh
```

---

## 💳 Payment Integration Features

### Stripe Integration

- **One-time payments**: Risk scores, verifications, smart match tools
- **Subscriptions**: Platform access, communication tools
- **Percentage-based**: Commission on closed deals (5% default)
- **Webhooks**: Real-time payment tracking
- **Security**: PCI compliance, fraud detection

### Plaid Integration

- **Bank connections**: Secure account linking
- **ACH payments**: Direct bank transfers
- **Account verification**: Micro-deposit validation
- **Real-time balances**: Available funds checking
- **Multiple banks**: Support for 11,000+ institutions

### Sales Analytics

- **Revenue tracking**: Real-time metrics across all products
- **Customer analytics**: Spending patterns and preferences
- **Product performance**: Top performers and trends
- **Commission calculations**: Automated percentage-based pricing
- **Export capabilities**: CSV, PDF reporting

---

## 📊 Product Pricing Structure

| Category            | Product              | Price      | Type       |
| ------------------- | -------------------- | ---------- | ---------- |
| **Risk Assessment** | General Application  | $300.00    | One-time   |
|                     | Equipment & Vehicles | $335.00    | One-time   |
|                     | Real Estate          | $335.00    | One-time   |
| **Smart Match**     | Broker Tool          | $45.00     | One-time   |
|                     | Lender Tool          | $35.00     | One-time   |
|                     | Closed Commission    | 5% of loan | Percentage |
| **Verifications**   | KYC Person           | $7.50      | One-time   |
|                     | KYB Business         | $20.00     | One-time   |
|                     | KYP Property         | $20.00     | One-time   |
|                     | KYD Funding          | $117.50    | One-time   |
| **Platform**        | Monthly Subscription | $100.00    | Monthly    |
|                     | CC Bar Local         | $60.00     | Monthly    |
| **Security**        | Shield Vault Locking | $30.00     | One-time   |
| **Assets**          | Tokenization         | $150.00    | One-time   |

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   External APIs │
│   (React/Next)  │    │   (Node.js)      │    │                 │
│                 │    │                  │    │ • Stripe        │
│ • Payment Forms │ ── │ • Payment Logic  │ ── │ • Plaid         │
│ • Bank Connect  │    │ • Webhooks       │    │ • Cloudflare    │
│ • Sales Dash    │    │ • Analytics      │    │ • Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                       ┌──────────────────┐
                       │   Infrastructure │
                       │                  │
                       │ • PostgreSQL     │
                       │ • Nginx          │
                       │ • PM2            │
                       │ • SSL/HTTPS      │
                       └──────────────────┘
```

---

## 🔧 Configuration

### Environment Variables

Create `.env.production` with:

```bash
# Database
DATABASE_URL=postgresql://eva_user:password@localhost:5432/eva_platform

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_SECRET_KEY=sk_live_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Plaid Configuration
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_production_secret
PLAID_ENV=production

# Security
JWT_SECRET=your_secure_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key_here

# API URLs
NEXT_PUBLIC_API_URL=https://api.eva-platform.com
NEXT_PUBLIC_APP_URL=https://eva-platform.com

# Cloudflare
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ZONE_ID=your_zone_id
```

### Stripe Product IDs

After running the setup script, add these to your environment:

```bash
STRIPE_PRICE_RISK_SCORE_GENERAL=price_1234567890abcdef
STRIPE_PRICE_SMART_MATCH_BROKER=price_abcdef1234567890
STRIPE_PRICE_PLATFORM_SUBSCRIPTION=price_xyz789abc123def
# ... (additional price IDs from setup script output)
```

---

## 🚀 Deployment

### Development Environment

```bash
# Start development server
npm run dev

# Run tests
npm test

# Test payment integration
bash scripts/test-payment-integration.sh http://localhost:3000
```

### Production Deployment

```bash
# Run production setup script (Linux/Ubuntu)
bash scripts/setup-production-server.sh

# Or manual deployment:
# 1. Build application
npm run build

# 2. Start with PM2
pm2 start ecosystem.config.js --env production

# 3. Setup Nginx reverse proxy
# 4. Configure SSL with Let's Encrypt
# 5. Setup monitoring and backups
```

### Cloudflare Setup

Follow the detailed guide in `CLOUDFLARE-SETUP-GUIDE.md`:

```bash
# 1. Configure DNS
# 2. Setup CDN caching
# 3. Configure WAF rules
# 4. Enable load balancing
# 5. Setup Zero Trust access
```

---

## 📈 Sales Analytics Dashboard

### Key Metrics Tracked

- **Revenue Metrics**: Daily, weekly, monthly totals
- **Transaction Volume**: Number of completed payments
- **Product Performance**: Best-selling products and categories
- **Customer Analytics**: Spending patterns and retention
- **Commission Tracking**: Percentage-based earnings
- **Geographic Data**: Sales by region (if enabled)

### Dashboard Features

- **Real-time Updates**: Live metrics every 30 seconds
- **Interactive Charts**: Revenue trends and product breakdown
- **Filtering Options**: By date range, product, customer type
- **Export Functions**: CSV, PDF reports
- **Alerts**: Low performance or failed payment notifications

### API Endpoints

```typescript
// Get dashboard data
GET /api/sales/dashboard

// Get detailed metrics
GET /api/sales/metrics?period=today|week|month

// Get customer analytics
GET /api/sales/customers

// Record transaction
POST /api/sales/transactions

// Get product performance
GET /api/sales/products/performance
```

---

## 🧪 Testing

### Automated Testing

```bash
# Run all tests
npm test

# Run payment integration tests
bash scripts/test-payment-integration.sh

# Run specific test suites
npm run test:stripe
npm run test:plaid
npm run test:analytics
```

### Manual Testing

1. **Stripe Payments**:

   - Use test card numbers: `4242424242424242`
   - Test different product types
   - Verify webhook processing

2. **Plaid Bank Connections**:

   - Use sandbox credentials: `user_good` / `pass_good`
   - Test account verification flow
   - Test ACH payment processing

3. **Sales Analytics**:
   - Verify metrics calculations
   - Test real-time updates
   - Validate export functions

---

## 🔒 Security & Compliance

### Security Features

- **PCI DSS Compliance**: Stripe handles sensitive card data
- **Bank-level Security**: Plaid for financial data
- **Data Encryption**: All PII encrypted at rest
- **HTTPS Only**: SSL/TLS for all communications
- **Rate Limiting**: API protection against abuse
- **Audit Trails**: Complete transaction logging

### Compliance Requirements

- **GDPR**: User data protection and right to deletion
- **CCPA**: California consumer privacy compliance
- **SOC 2**: Service organization controls
- **PCI DSS**: Payment card industry standards

---

## 📚 Documentation

### Core Documentation

- [`PRICING-MODEL-GUIDELINES.md`](./PRICING-MODEL-GUIDELINES.md) - Complete pricing setup
- [`docs/STRIPE-INTEGRATION.md`](./docs/STRIPE-INTEGRATION.md) - Stripe implementation
- [`docs/PLAID-PAYMENT-SETUP.md`](./docs/PLAID-PAYMENT-SETUP.md) - Plaid integration
- [`CLOUDFLARE-SETUP-GUIDE.md`](./CLOUDFLARE-SETUP-GUIDE.md) - Infrastructure setup

### API Documentation

- [`docs/API_REFERENCE.md`](./docs/API_REFERENCE.md) - Complete API reference
- [`docs/SECURITY_GUIDE.md`](./docs/SECURITY_GUIDE.md) - Security implementation
- [`docs/DEVELOPER_GUIDE.md`](./docs/DEVELOPER_GUIDE.md) - Development guidelines

### Setup Scripts

- [`scripts/setup-production-server.sh`](./scripts/setup-production-server.sh) - Production deployment
- [`scripts/setup-stripe-products.js`](./scripts/setup-stripe-products.js) - Stripe product creation
- [`scripts/test-payment-integration.sh`](./scripts/test-payment-integration.sh) - Integration testing

---

## 🛠️ Troubleshooting

### Common Issues

1. **Stripe Webhook Failures**:

   ```bash
   # Check webhook endpoint
   curl -X POST http://localhost:3000/api/webhooks/stripe

   # Verify signature validation
   # Check Stripe dashboard for delivery attempts
   ```

2. **Plaid Connection Issues**:

   ```bash
   # Test link token creation
   curl -X POST http://localhost:3000/api/banking/create-link-token \
     -H "Content-Type: application/json" \
     -d '{"userId": "test_user"}'
   ```

3. **Database Connection Problems**:

   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql

   # Test database connection
   psql eva_platform -c "SELECT 1;"
   ```

4. **Build Failures**:

   ```bash
   # Clear Next.js cache
   rm -rf .next

   # Reinstall dependencies
   npm ci

   # Check for TypeScript errors
   npm run type-check
   ```

### Performance Optimization

1. **Database Optimization**:

   - Index frequently queried fields
   - Use connection pooling
   - Optimize query patterns

2. **API Performance**:

   - Enable compression (gzip)
   - Implement request caching
   - Use CDN for static assets

3. **Frontend Optimization**:
   - Code splitting for large components
   - Image optimization and lazy loading
   - Bundle size monitoring

---

## 📞 Support & Resources

### Getting Help

- **Technical Issues**: Create GitHub issue
- **Payment Problems**: Check Stripe/Plaid dashboards
- **Security Concerns**: Email security team
- **Documentation**: Check `/docs` directory

### External Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Plaid Documentation](https://plaid.com/docs)
- [Cloudflare Docs](https://developers.cloudflare.com)
- [Next.js Documentation](https://nextjs.org/docs)

### Community

- **Slack**: #eva-platform-dev
- **Wiki**: Internal documentation
- **Training**: Quarterly dev sessions
- **Code Reviews**: Required for financial features

---

## 🗺️ Roadmap

### Upcoming Features

- **Multi-currency Support**: EUR, GBP, CAD
- **Advanced Analytics**: ML-powered insights
- **Mobile App**: React Native implementation
- **API Marketplace**: Third-party integrations
- **White-label Solutions**: Custom branding

### Performance Goals

- **API Response Time**: < 200ms average
- **Payment Success Rate**: > 99.5%
- **Uptime**: 99.95% SLA
- **Security**: Zero critical vulnerabilities

---

## 📄 License & Legal

- **Software License**: MIT (see LICENSE file)
- **Terms of Service**: Standard financial services
- **Privacy Policy**: GDPR/CCPA compliant
- **Security Policy**: Responsible disclosure

---

## ✅ Deployment Checklist

### Pre-deployment

- [ ] Environment variables configured
- [ ] Stripe products created
- [ ] Plaid integration tested
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Cloudflare configured
- [ ] Monitoring setup
- [ ] Backup procedures tested

### Post-deployment

- [ ] Health checks passing
- [ ] Payment flows tested
- [ ] Analytics data flowing
- [ ] Performance metrics normal
- [ ] Security scans clean
- [ ] Team training completed

---

_Last Updated: December 28, 2024_
_Version: 2.0.0 - Comprehensive Payment Integration_

🎉 **Ready for Production!** Your EVA Platform now includes enterprise-grade payment processing, real-time sales analytics, and production-ready infrastructure.
