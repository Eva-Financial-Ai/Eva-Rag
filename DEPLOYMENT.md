# EVA AI Frontend Deployment Guide

This guide provides comprehensive instructions for deploying the EVA AI Frontend application across different environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Automated Deployment (CI/CD)](#automated-deployment-cicd)
- [Manual Deployment](#manual-deployment)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Troubleshooting](#monitoring--troubleshooting)
- [Rollback Procedures](#rollback-procedures)

## Prerequisites

### Required Tools

```bash
# Node.js (version 18.x or 20.x)
node --version

# npm (version 8.x or higher)
npm --version

# Git
git --version

# GitHub CLI (for branch protection setup)
gh --version

# Cloudflare Wrangler (for manual deployments)
npm install -g wrangler
```

### Required Accounts & Access

- **GitHub**: Repository access with push permissions
- **Cloudflare**: Account with Pages access
- **Auth0**: Tenant configuration access
- **Monitoring**: Access to error tracking and analytics

## Environment Setup

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/Eva-Financial-Ai/eva-mvp-fe.git
cd eva-mvp-fe

# Install dependencies
npm install --legacy-peer-deps

# Verify setup
npm run build
```

### 2. Environment Variables

Create environment-specific `.env` files:

#### `.env.local` (Development)

```env
# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=dev-eva.auth0.com
REACT_APP_AUTH0_CLIENT_ID=dev_client_id
REACT_APP_AUTH0_AUDIENCE=https://dev-api.eva-financial.ai

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development

# Feature Flags
REACT_APP_ENABLE_BLOCKCHAIN=true
REACT_APP_ENABLE_AI_FEATURES=true
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_DEBUG_MODE=true

# Development Tools
REACT_APP_MOCK_API=true
REACT_APP_SHOW_DEV_TOOLS=true
```

#### `.env.staging` (Staging)

```env
# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=staging-eva.auth0.com
REACT_APP_AUTH0_CLIENT_ID=staging_client_id
REACT_APP_AUTH0_AUDIENCE=https://staging-api.eva-financial.ai

# API Configuration
REACT_APP_API_BASE_URL=https://staging-api.eva-financial.ai
REACT_APP_ENVIRONMENT=staging

# Feature Flags
REACT_APP_ENABLE_BLOCKCHAIN=true
REACT_APP_ENABLE_AI_FEATURES=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_DEBUG_MODE=false

# Monitoring
REACT_APP_SENTRY_DSN=https://your-staging-sentry-dsn
REACT_APP_ANALYTICS_ID=staging-analytics-id
```

#### `.env.production` (Production)

```env
# Auth0 Configuration
REACT_APP_AUTH0_DOMAIN=eva-financial.auth0.com
REACT_APP_AUTH0_CLIENT_ID=prod_client_id
REACT_APP_AUTH0_AUDIENCE=https://api.eva-financial.ai

# API Configuration
REACT_APP_API_BASE_URL=https://api.eva-financial.ai
REACT_APP_ENVIRONMENT=production

# Feature Flags
REACT_APP_ENABLE_BLOCKCHAIN=true
REACT_APP_ENABLE_AI_FEATURES=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_DEBUG_MODE=false

# Monitoring
REACT_APP_SENTRY_DSN=https://your-production-sentry-dsn
REACT_APP_ANALYTICS_ID=production-analytics-id

# Security
REACT_APP_CSP_REPORT_URI=https://eva-financial.report-uri.com/r/d/csp/enforce
```

## Automated Deployment (CI/CD)

### GitHub Actions Setup

The repository includes automated CI/CD pipelines that handle deployments:

#### 1. Configure GitHub Secrets

Navigate to your repository settings and add these secrets:

```bash
# Cloudflare
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id

# Security Scanning
SNYK_TOKEN=your_snyk_token

# Notifications (Optional)
SLACK_WEBHOOK_URL=your_slack_webhook
DISCORD_WEBHOOK_URL=your_discord_webhook
```

#### 2. Branch Protection Setup

Run the branch protection script:

```bash
# Authenticate with GitHub CLI
gh auth login

# Set up branch protection
./scripts/setup-branch-protection.sh
```

#### 3. Deployment Workflow

##### Staging Deployment

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes and commit
git add .
git commit -m "feat: your feature description"

# 3. Push to staging
git checkout staging
git merge feature/your-feature
git push origin staging

# 4. Automatic deployment triggers
# - GitHub Actions runs tests
# - Builds application
# - Deploys to staging environment
# - Runs security scans
```

##### Production Deployment

```bash
# 1. Create pull request from staging to main
gh pr create --base main --head staging --title "Release: v1.x.x" --body "Production release"

# 2. Review and approve PR
# - CI checks must pass
# - Code review required
# - All conversations resolved

# 3. Merge to main
gh pr merge --merge

# 4. Automatic production deployment
# - Builds production version
# - Deploys to production environment
# - Sends deployment notifications
```

### Monitoring Deployments

#### GitHub Actions Dashboard

- View deployment status: `https://github.com/Eva-Financial-Ai/eva-mvp-fe/actions`
- Monitor build logs and errors
- Track deployment history

#### Cloudflare Pages Dashboard

- Access: `https://dash.cloudflare.com/pages`
- Monitor deployment status
- View build logs and analytics
- Configure custom domains

## Manual Deployment

### Cloudflare Pages (Recommended)

#### Initial Setup

```bash
# Install Wrangler CLI
npm install -g wrangler

# Authenticate with Cloudflare
wrangler login

# Create Pages project
wrangler pages project create eva-ai-frontend
```

#### Deploy to Staging

```bash
# Build application
npm run build

# Deploy to staging
wrangler pages deploy build \
  --project-name eva-ai-frontend \
  --branch staging \
  --env staging
```

#### Deploy to Production

```bash
# Build production version
NODE_ENV=production npm run build

# Deploy to production
wrangler pages deploy build \
  --project-name eva-ai-frontend \
  --branch main \
  --env production
```

### Alternative Platforms

#### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=build
```

#### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
npm run build
vercel --prod
```

#### AWS S3 + CloudFront

```bash
# Build application
npm run build

# Sync to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## Environment Configuration

### Staging Environment

#### Purpose

- Feature testing and validation
- Integration testing with backend services
- User acceptance testing (UAT)
- Performance testing

#### Configuration

- **URL**: `https://staging.eva-financial.ai`
- **Database**: Staging/sandbox data
- **Auth**: Staging Auth0 tenant
- **APIs**: Staging backend services
- **Monitoring**: Enhanced logging and debugging

#### Access

- Development team
- QA team
- Product stakeholders
- Selected beta users

### Production Environment

#### Purpose

- Live customer-facing application
- Production data and transactions
- Full security and compliance measures
- Performance optimization

#### Configuration

- **URL**: `https://app.eva-financial.ai`
- **Database**: Production data (encrypted)
- **Auth**: Production Auth0 tenant
- **APIs**: Production backend services
- **Monitoring**: Error tracking and performance monitoring

#### Access

- End users (customers, brokers, lenders)
- Support team (limited access)
- Operations team (monitoring only)

## Monitoring & Troubleshooting

### Health Checks

#### Application Health

```bash
# Check application status
curl -f https://app.eva-financial.ai/health

# Check API connectivity
curl -f https://api.eva-financial.ai/health

# Check authentication
curl -f https://eva-financial.auth0.com/.well-known/openid_configuration
```

#### Performance Monitoring

- **Core Web Vitals**: Monitor LCP, FID, CLS
- **Bundle Size**: Track JavaScript bundle size
- **Load Times**: Monitor page load performance
- **Error Rates**: Track JavaScript errors and API failures

### Common Issues & Solutions

#### Build Failures

```bash
# Clear cache and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Check TypeScript errors
npm run type-check

# Run tests
npm run test:run
```

#### Deployment Failures

```bash
# Check GitHub Actions logs
gh run list --limit 5
gh run view [run-id]

# Check Cloudflare deployment logs
wrangler pages deployment list --project-name eva-ai-frontend

# Verify environment variables
wrangler pages secret list --project-name eva-ai-frontend
```

#### Runtime Errors

```bash
# Check browser console for errors
# Review Sentry error reports
# Check API connectivity
# Verify authentication configuration
```

### Logging & Debugging

#### Development

```bash
# Enable debug mode
REACT_APP_DEBUG_MODE=true npm start

# View detailed logs
npm start -- --verbose

# Run with source maps
npm run build:debug
```

#### Production

- **Error Tracking**: Sentry integration for error monitoring
- **Analytics**: Google Analytics or similar for user behavior
- **Performance**: Web Vitals monitoring
- **Uptime**: External monitoring services

## Rollback Procedures

### Automated Rollback

#### GitHub Actions

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback to specific commit
git reset --hard [commit-hash]
git push --force-with-lease origin main
```

#### Cloudflare Pages

```bash
# List recent deployments
wrangler pages deployment list --project-name eva-ai-frontend

# Rollback to specific deployment
wrangler pages deployment rollback [deployment-id] \
  --project-name eva-ai-frontend
```

### Manual Rollback

#### Emergency Rollback

```bash
# 1. Identify last known good deployment
wrangler pages deployment list --project-name eva-ai-frontend

# 2. Rollback immediately
wrangler pages deployment rollback [good-deployment-id] \
  --project-name eva-ai-frontend

# 3. Notify team
echo "Emergency rollback completed. Investigating issue..."

# 4. Create incident report
# Document the issue, impact, and resolution steps
```

### Post-Rollback Actions

1. **Verify Application**: Ensure the application is working correctly
2. **Monitor Metrics**: Watch for any ongoing issues
3. **Investigate Root Cause**: Analyze what caused the need for rollback
4. **Update Documentation**: Document lessons learned
5. **Plan Fix**: Develop and test a proper fix for the next deployment

## Security Considerations

### Deployment Security

- **Environment Variables**: Never commit secrets to repository
- **Access Control**: Limit deployment permissions to authorized personnel
- **Audit Logs**: Monitor all deployment activities
- **Vulnerability Scanning**: Automated security scans in CI/CD pipeline

### Runtime Security

- **Content Security Policy**: Implement strict CSP headers
- **HTTPS Only**: Enforce HTTPS for all communications
- **Authentication**: Secure Auth0 integration
- **Data Encryption**: Encrypt sensitive data in transit and at rest

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run build:analyze

# Optimize images
npm run optimize:images

# Check for unused dependencies
npm run audit:dependencies
```

### Runtime Optimization

- **Code Splitting**: Lazy load routes and components
- **Caching**: Implement aggressive caching strategies
- **CDN**: Use Cloudflare CDN for global distribution
- **Compression**: Enable gzip/brotli compression

## Support & Escalation

### Deployment Issues

1. **Level 1**: Development team
2. **Level 2**: DevOps/Infrastructure team
3. **Level 3**: Senior engineering leadership

### Emergency Contacts

- **On-call Engineer**: [Contact information]
- **DevOps Lead**: [Contact information]
- **Engineering Manager**: [Contact information]

### Communication Channels

- **Slack**: #eva-deployments
- **Email**: deployments@eva-financial.ai
- **Incident Management**: [Your incident management system]

---

**Last Updated**: [Current Date]
**Version**: 1.0.0
**Maintained by**: EVA Financial AI DevOps Team
