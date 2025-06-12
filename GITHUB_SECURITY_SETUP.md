# 🔐 GitHub Security Setup - EVA Platform

## 🚨 CRITICAL SECURITY CONFIGURATION

This document provides step-by-step instructions to secure your GitHub repository for the EVA Platform financial application. **Following these steps is mandatory for production deployment.**

---

## 📋 Table of Contents

1. [Repository Security Settings](#repository-security-settings)
2. [Branch Protection Rules](#branch-protection-rules)
3. [Secret Scanning Configuration](#secret-scanning-configuration)
4. [Environment Variables Setup](#environment-variables-setup)
5. [Team Access & Permissions](#team-access--permissions)
6. [Security Policies](#security-policies)
7. [Monitoring & Alerts](#monitoring--alerts)

---

## 🏛️ Repository Security Settings

### Step 1: Enable GitHub Security Features

Navigate to **Settings > Security & analysis** and enable:

#### ✅ Required Security Features

- **Dependency graph** - ✅ Enable
- **Dependabot alerts** - ✅ Enable
- **Dependabot security updates** - ✅ Enable
- **Secret scanning** - ✅ Enable
- **Push protection** - ✅ Enable (Critical!)
- **Code scanning** - ✅ Enable with CodeQL

#### ⚙️ Configuration Commands

```bash
# Enable security features via GitHub CLI
gh repo edit --enable-security-and-analysis
gh repo edit --enable-vulnerability-alerts
gh repo edit --enable-security-fixes
```

### Step 2: Repository Visibility & Access

#### 🔒 Repository Settings

- **Visibility**: Private (Required for financial data)
- **Features to DISABLE**:
  - ❌ Wikis (can expose sensitive info)
  - ❌ Issues (if using external tracker)
  - ❌ Discussions (unless properly moderated)

---

## 🛡️ Branch Protection Rules

### Main Branch Protection

Navigate to **Settings > Branches** and add protection rule for `main`:

#### ✅ Required Settings

```yaml
Branch Protection Rules for 'main':
  Protect matching branches: ✅

  Restrict pushes that create files:
    Require a pull request before merging: ✅
    Require approvals: ✅ (minimum 2 reviewers)
    Dismiss stale reviews: ✅
    Require review from code owners: ✅
    Restrict reviews to team members: ✅

  Require status checks:
    Require branches to be up to date: ✅
    Status checks:
      - security-scan / secret-detection ✅
      - security-scan / financial-data-scan ✅
      - security-scan / environment-security ✅
      - ci / build ✅
      - ci / test ✅

  Require conversation resolution: ✅
  Require signed commits: ✅ (Recommended)
  Require linear history: ✅

  Restrictions:
    Restrict pushes to specific people/teams: ✅
    Allow force pushes: ❌
    Allow deletions: ❌
```

### Development Branch Protection

For `develop` branch:

```yaml
Branch Protection Rules for 'develop':
  Require a pull request before merging: ✅
  Require approvals: ✅ (minimum 1 reviewer)
  Require status checks: ✅
    - security-scan / secret-detection ✅
    - ci / build ✅
  Require conversation resolution: ✅
  Allow force pushes: ❌
```

---

## 🔍 Secret Scanning Configuration

### Step 1: Enable GitHub Secret Scanning

In **Settings > Security & analysis**:

#### ✅ Secret Scanning Setup

- **Secret scanning**: Enable
- **Push protection**: Enable (Blocks commits with secrets)
- **Validity checks**: Enable
- **Non-provider patterns**: Enable

### Step 2: Custom Secret Patterns

Add custom patterns in **Settings > Security > Secret scanning**:

#### 🔐 Financial Application Patterns

```regex
# Auth0 Secrets
auth0.*client.*secret.*[a-zA-Z0-9]{32,}

# Plaid Keys
plaid.*key.*[a-zA-Z0-9]{32,}

# Stripe Live Keys
sk_""live_[a-zA-Z0-9]{99}
pk_""live_[a-zA-Z0-9]{99}

# Custom API Keys
eva.*api.*key.*[a-zA-Z0-9]{32,}

# Database URLs with credentials
(postgres|mysql|mongodb)://[^:]+:[^@]+@[^/]+

# Private Keys
-----BEGIN (RSA |DSA |EC )?PRIVATE KEY-----

# Generic 32+ character secrets
(secret|key|token|password).*[=:]\s*[\"']?[a-zA-Z0-9]{32,}
```

### Step 3: Bypass List

Never add these to the bypass list:

- ❌ Production API keys
- ❌ Database credentials
- ❌ Authentication tokens
- ❌ Encryption keys
- ❌ Customer data

---

## 🔑 Environment Variables Setup

### Repository Secrets

Navigate to **Settings > Secrets and variables > Actions**:

#### 🏭 Production Secrets

```bash
# Authentication
PROD_AUTH0_DOMAIN
PROD_AUTH0_CLIENT_ID
PROD_AUTH0_CLIENT_SECRET

# Financial Services
PROD_PLAID_CLIENT_ID
PROD_PLAID_SECRET
PROD_STRIPE_SECRET_KEY
PROD_STRIPE_WEBHOOK_SECRET

# Infrastructure
PROD_DATABASE_URL
PROD_REDIS_URL
PROD_ENCRYPTION_KEY

# Monitoring
PROD_SENTRY_DSN
PROD_DATADOG_API_KEY
```

#### 🧪 Staging Secrets

```bash
STAGING_AUTH0_DOMAIN
STAGING_AUTH0_CLIENT_ID
# ... (staging equivalents)
```

### Environment Protection Rules

In **Settings > Environments**:

#### 🏭 Production Environment

```yaml
Environment name: production
Protection rules:
  Required reviewers: ✅ (2 reviewers minimum)
  Wait timer: ✅ (30 minutes)
  Deployment branches: main only
  Environment secrets: ✅ (production secrets)
```

#### 🧪 Staging Environment

```yaml
Environment name: staging
Protection rules:
  Required reviewers: ✅ (1 reviewer)
  Deployment branches: develop, staging
  Environment secrets: ✅ (staging secrets)
```

---

## 👥 Team Access & Permissions

### Repository Roles

#### 🔐 Security Team

- **Role**: Admin
- **Permissions**: Full access, security settings
- **Members**: Security lead, CTO, Lead DevOps

#### 👨‍💻 Core Developers

- **Role**: Maintain
- **Permissions**: Push to develop, create PRs to main
- **Members**: Senior developers, team leads

#### 🧑‍🔬 Developers

- **Role**: Write
- **Permissions**: Create branches, submit PRs
- **Members**: All other developers

#### 👀 External Reviewers

- **Role**: Read
- **Permissions**: View code, cannot download
- **Members**: External auditors, consultants

### Team Configuration

```bash
# Create teams via GitHub CLI
gh api orgs/:org/teams -f name="eva-security-team" -f privacy="closed"
gh api orgs/:org/teams -f name="eva-core-developers" -f privacy="closed"
gh api orgs/:org/teams -f name="eva-developers" -f privacy="closed"
```

---

## 📋 Security Policies

### Step 1: SECURITY.md

Create `.github/SECURITY.md`:

```markdown
# Security Policy

## Reporting Security Vulnerabilities

🚨 **DO NOT** create public issues for security vulnerabilities.

### Contact Information

- **Security Email**: security@evaplatform.com
- **GPG Key**: [Link to public key]
- **Response Time**: 24 hours for acknowledgment

### Scope

- API vulnerabilities
- Authentication bypasses
- Data exposure issues
- Financial calculation errors
- Customer data access issues

### Out of Scope

- Social engineering
- Physical attacks
- DoS attacks on demo environments

### Bug Bounty

We operate a private bug bounty program. Contact us for details.
```

### Step 2: Code Owners

Create `.github/CODEOWNERS`:

```bash
# Global ownership
* @eva-security-team

# Security-sensitive files
/.github/workflows/ @eva-security-team @eva-devops-team
/src/utils/security/ @eva-security-team
/src/utils/clientSideSecurity.ts @eva-security-team
/src/config/ @eva-security-team @eva-core-developers

# Financial calculation files
/src/services/financial/ @eva-security-team @eva-finance-team
/src/utils/calculations/ @eva-security-team @eva-finance-team

# Environment files
.env* @eva-security-team
*.env @eva-security-team

# Authentication
/src/auth/ @eva-security-team @eva-auth-team
/src/services/auth/ @eva-security-team @eva-auth-team

# API integrations
/src/services/*Service.ts @eva-security-team @eva-api-team
```

### Step 3: Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## 🔐 Security Checklist

Before submitting this PR, confirm:

### Code Security

- [ ] No secrets or API keys in code
- [ ] No hardcoded customer data
- [ ] Sensitive data is properly masked
- [ ] Console.log statements reviewed
- [ ] No authentication bypasses

### Financial Data

- [ ] Financial calculations reviewed
- [ ] PII handling complies with regulations
- [ ] Audit logging implemented where required
- [ ] Data encryption used for sensitive fields

### Testing

- [ ] Security tests added/updated
- [ ] Edge cases tested
- [ ] Error handling tested
- [ ] Performance impact assessed

### Documentation

- [ ] Security implications documented
- [ ] API changes documented
- [ ] Breaking changes noted

### Review Requirements

- [ ] Security team review (if touching sensitive code)
- [ ] Finance team review (if affecting calculations)
- [ ] At least 2 approvals for production changes

## 📝 Description

<!-- Describe what this PR does -->

## 🧪 Testing

<!-- Describe how this was tested -->

## 📸 Screenshots

<!-- Add screenshots if applicable -->

## 🔗 Related Issues

<!-- Link to related issues -->
```

---

## 🚨 Monitoring & Alerts

### GitHub Notifications

Configure in **Settings > Notifications**:

#### ✅ Required Alerts

- **Security alerts**: Immediate email + Slack
- **Dependabot alerts**: Daily digest
- **Failed deployments**: Immediate notification
- **Push protection triggers**: Immediate alert

### Security Monitoring Setup

#### 🔔 Slack Integration

```bash
# Webhook URL for security alerts
SLACK_SECURITY_WEBHOOK=https://hooks.slack.com/services/...

# Channels
- #eva-security-alerts (immediate alerts)
- #eva-security-digest (daily summaries)
- #eva-dev-notifications (development alerts)
```

#### 📧 Email Alerts

```yaml
Security Team Email List:
  - security@evaplatform.com
  - cto@evaplatform.com
  - devops-lead@evaplatform.com

Alert Triggers:
  - Secret exposed in commit
  - Security vulnerability in dependency
  - Failed security scan
  - Unauthorized deployment attempt
  - Production branch force-push attempt
```

---

## 🎯 Quick Setup Script

Run this script to configure basic security settings:

```bash
#!/bin/bash
# GitHub Security Quick Setup for EVA Platform

echo "🔐 Setting up GitHub repository security..."

# Enable security features
gh repo edit --enable-security-and-analysis
gh repo edit --enable-vulnerability-alerts
gh repo edit --enable-security-fixes

# Create required files
mkdir -p .github
echo "Creating security files..."

# Add branch protection rules
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["security-scan"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true}' \
  --field restrictions=null

echo "✅ Basic security setup complete!"
echo "⚠️  Please complete manual setup steps for full security"
```

---

## ⚡ Emergency Response

### If Secrets Are Exposed

#### Immediate Actions (within 30 minutes)

1. **Revoke exposed credentials immediately**
2. **Force-push commit history rewrite** (if caught early)
3. **Notify security team via emergency contact**
4. **Generate new credentials**
5. **Update production deployments**

#### Communication Template

```
🚨 SECURITY INCIDENT REPORT

Incident: Credential exposure in repository
Time: [UTC timestamp]
Severity: [Critical/High/Medium/Low]
Affected Systems: [List systems]
Exposed Data: [Type of credentials]

Immediate Actions Taken:
1. [Action 1]
2. [Action 2]

Status: [In Progress/Resolved]
Next Update: [Time]
```

---

## ✅ Verification Checklist

After setup, verify:

### Repository Security

- [ ] Secret scanning enabled and working
- [ ] Push protection blocking test secrets
- [ ] Branch protection rules active
- [ ] Required reviews enforced
- [ ] Status checks passing

### Access Control

- [ ] Team permissions configured
- [ ] CODEOWNERS file active
- [ ] Admin access limited
- [ ] External access controlled

### Monitoring

- [ ] Security alerts configured
- [ ] Notification channels working
- [ ] Incident response plan documented
- [ ] Emergency contacts updated

### Compliance

- [ ] Audit logging enabled
- [ ] Data retention policies set
- [ ] Regulatory requirements met
- [ ] Security policies published

---

## 📞 Support & Contact

### Security Team

- **Email**: security@evaplatform.com
- **Emergency**: [Emergency contact number]
- **Slack**: #eva-security-team

### Documentation

- [Internal Security Wiki](link)
- [Incident Response Playbook](link)
- [Compliance Documentation](link)

---

**⚠️ Remember: Security is everyone's responsibility. When in doubt, ask the security team!**
