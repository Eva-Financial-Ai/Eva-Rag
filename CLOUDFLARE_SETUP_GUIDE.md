# EVA Platform - Cloudflare Deployment Setup Guide

## 🚀 Overview

This guide will help you deploy the EVA Platform to Cloudflare using Workers, Pages, and R2 Storage.

### Account Information
- **Account ID**: `eace6f3c56b5735ae4a9ef385d6ee914`
- **Zone ID**: `913680b4428f2f4d1c078dd841cd8cdb`
- **R2 Bucket**: `eva-fin-b-test-r2-frontend-services`

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Cloudflare Account** with access to the provided Account ID
4. **Wrangler CLI** (will be installed automatically by the script)

## 🛠 Quick Setup (Automated)

Run the automated deployment script:

```bash
chmod +x deploy-cloudflare.sh
./deploy-cloudflare.sh
```

This script will:
- Install Wrangler CLI if needed
- Authenticate with Cloudflare
- Create R2 bucket and KV namespaces
- Build the application
- Deploy to Cloudflare Pages
- Configure environment variables

## 🔧 Manual Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

### 3. Create R2 Bucket

```bash
wrangler r2 bucket create eva-fin-b-test-r2-frontend-services --account-id eace6f3c56b5735ae4a9ef385d6ee914
```

### 4. Create KV Namespaces

```bash
# Session storage
wrangler kv:namespace create "SESSION_STORE" --account-id eace6f3c56b5735ae4a9ef385d6ee914

# Configuration storage
wrangler kv:namespace create "CONFIG_STORE" --account-id eace6f3c56b5735ae4a9ef385d6ee914
```

### 5. Build the Application

```bash
npm run build
```

### 6. Deploy to Cloudflare Pages

```bash
# Create Pages project
wrangler pages project create eva-platform --account-id eace6f3c56b5735ae4a9ef385d6ee914

# Deploy built files
wrangler pages deploy build --project-name eva-platform --account-id eace6f3c56b5735ae4a9ef385d6ee914
```

### 7. Configure Environment Variables

Set these environment variables in your Cloudflare Pages project:

```bash
wrangler pages secret put REACT_APP_CLOUDFLARE_ACCOUNT_ID --project-name eva-platform
# Value: eace6f3c56b5735ae4a9ef385d6ee914

wrangler pages secret put REACT_APP_CLOUDFLARE_ZONE_ID --project-name eva-platform
# Value: 913680b4428f2f4d1c078dd841cd8cdb

wrangler pages secret put REACT_APP_R2_BUCKET --project-name eva-platform
# Value: eva-fin-b-test-r2-frontend-services

wrangler pages secret put REACT_APP_R2_ENDPOINT --project-name eva-platform
# Value: https://eace6f3c56b5735ae4a9ef385d6ee914.r2.cloudflarestorage.com

wrangler pages secret put REACT_APP_R2_S3_API_URL --project-name eva-platform
# Value: https://eace6f3c56b5735ae4a9ef385d6ee914.r2.cloudflarestorage.com/eva-fin-b-test-r2-frontend-services

wrangler pages secret put REACT_APP_R2_CATALOG_URL --project-name eva-platform
# Value: https://catalog.cloudflarestorage.com/eace6f3c56b5735ae4a9ef385d6ee914/eva-fin-b-test-r2-frontend-services

wrangler pages secret put REACT_APP_WORKERS_URL --project-name eva-platform
# Value: https://eva-platform.eace6f3c56b5735ae4a9ef385d6ee914.workers.dev

wrangler pages secret put REACT_APP_CDN_URL --project-name eva-platform
# Value: https://cdn.eva-platform.eace6f3c56b5735ae4a9ef385d6ee914.workers.dev

wrangler pages secret put REACT_APP_API_URL --project-name eva-platform
# Value: https://api.eva-platform.eace6f3c56b5735ae4a9ef385d6ee914.workers.dev/api

wrangler pages secret put REACT_APP_WEBSOCKET_URL --project-name eva-platform
# Value: wss://api.eva-platform.eace6f3c56b5735ae4a9ef385d6ee914.workers.dev/ws

wrangler pages secret put REACT_APP_ENVIRONMENT --project-name eva-platform
# Value: production
```

## 🌐 Workers Deployment (Optional)

If you have Worker scripts:

```bash
wrangler deploy --account-id eace6f3c56b5735ae4a9ef385d6ee914
```

## 📁 File Structure

```
project-root/
├── cloudflare.config.js       # Cloudflare configuration
├── wrangler.toml              # Wrangler configuration
├── deploy-cloudflare.sh       # Deployment script
├── build/                     # Built application files
└── src/
    └── worker.js              # Worker script (if using Workers)
```

## 🔗 URLs After Deployment

- **Frontend**: `https://eva-platform.pages.dev`
- **R2 Storage**: `https://eace6f3c56b5735ae4a9ef385d6ee914.r2.cloudflarestorage.com`
- **Data Catalog**: `https://catalog.cloudflarestorage.com/eace6f3c56b5735ae4a9ef385d6ee914/eva-fin-b-test-r2-frontend-services`
- **Workers**: `https://eva-platform.eace6f3c56b5735ae4a9ef385d6ee914.workers.dev`

## 🎛 Cloudflare Dashboard

Access your resources in the Cloudflare Dashboard:

- **Main Dashboard**: `https://dash.cloudflare.com/eace6f3c56b5735ae4a9ef385d6ee914`
- **Pages**: `https://dash.cloudflare.com/eace6f3c56b5735ae4a9ef385d6ee914/pages`
- **R2 Storage**: `https://dash.cloudflare.com/eace6f3c56b5735ae4a9ef385d6ee914/r2`
- **Workers**: `https://dash.cloudflare.com/eace6f3c56b5735ae4a9ef385d6ee914/workers`

## 🔧 Configuration Files

### `cloudflare.config.js`
Contains all Cloudflare-specific configuration including account IDs, endpoints, and environment variables.

### `wrangler.toml`
Configuration for Wrangler CLI with Workers settings, R2 bindings, and KV namespaces.

### `deploy-cloudflare.sh`
Automated deployment script that handles the entire setup process.

## 🛡 Security Configuration

The setup includes:
- Content Security Policy (CSP) headers
- Security headers (X-Frame-Options, etc.)
- Encrypted connections (HTTPS/WSS)
- Secure R2 bucket access

## 📝 Next Steps

1. **Custom Domain**: Configure your custom domain in Cloudflare Pages
2. **SSL/TLS**: Set up SSL/TLS settings in the Cloudflare dashboard
3. **Analytics**: Configure Cloudflare Analytics for monitoring
4. **Monitoring**: Set up alerts and monitoring
5. **Backup**: Configure R2 bucket backup policies

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Error**
   ```bash
   wrangler login
   ```

2. **Bucket Already Exists**
   - This is normal, the bucket may already be created

3. **KV Namespace Errors**
   - Check if namespaces already exist in the dashboard

4. **Build Errors**
   ```bash
   npm install
   npm run build
   ```

### Logs and Debugging

- Check Cloudflare Pages logs in the dashboard
- Use `wrangler tail` for Worker logs
- Monitor R2 access logs

## 📞 Support

For deployment issues:
1. Check the Cloudflare Dashboard for error messages
2. Review the deployment logs
3. Verify all environment variables are set correctly
4. Ensure the account has proper permissions

## 🔄 Updates and Redeployment

To update the application:

```bash
# Build new version
npm run build

# Deploy to Pages
wrangler pages deploy build --project-name eva-platform --account-id eace6f3c56b5735ae4a9ef385d6ee914
```

## 📊 Monitoring and Analytics

- Use Cloudflare Analytics for traffic monitoring
- Set up R2 usage alerts
- Monitor Worker execution metrics
- Configure error tracking and alerts

---

**✅ Setup Complete!** Your EVA Platform should now be running on Cloudflare infrastructure. 