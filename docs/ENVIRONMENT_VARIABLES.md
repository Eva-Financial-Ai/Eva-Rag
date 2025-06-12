# Environment Variables Configuration

This document outlines all the environment variables required for the EVA Platform to function properly, including the new R2 and PubSub integrations.

## Required Environment Variables

### Auth0 Configuration
```bash
REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=https://your-api-audience
```

### Cloudflare Configuration (R2, PubSub, Workers)
```bash
# Account Information
REACT_APP_CLOUDFLARE_ACCOUNT_ID=eace6f3c56b5735ae4a9ef385d6ee914
REACT_APP_CLOUDFLARE_ZONE_ID=79cbd8176057c91e2e2329ffd8b386a5
REACT_APP_CLOUDFLARE_API_TOKEN=69OOAUOLgUYP3Tb-wrfv4T85gtb5MteMTeWWHE_d
REACT_APP_CLOUDFLARE_API_URL=https://api.cloudflare.com/client/v4

# R2 Storage Configuration
REACT_APP_R2_BUCKET=eva-fin-b-test-r2-frontend-services
REACT_APP_R2_ENDPOINT=https://eace6f3c56b5735ae4a9ef385d6ee914.r2.cloudflarestorage.com
REACT_APP_R2_S3_API_URL=https://eace6f3c56b5735ae4a9ef385d6ee914.r2.cloudflarestorage.com/eva-fin-b-test-r2-frontend-services
REACT_APP_R2_CATALOG_URL=https://catalog.cloudflarestorage.com/eace6f3c56b5735ae4a9ef385d6ee914/eva-fin-b-test-r2-frontend-services

# Workers and API URLs
REACT_APP_WORKERS_URL=https://eva-platform.eace6f3c56b5735ae4a9ef385d6ee914.workers.dev
REACT_APP_CDN_URL=https://cdn.eva-platform.eace6f3c56b5735ae4a9ef385d6ee914.workers.dev
REACT_APP_API_URL=https://api.eva-platform.eace6f3c56b5735ae4a9ef385d6ee914.workers.dev/api
REACT_APP_WEBSOCKET_URL=wss://api.eva-platform.eace6f3c56b5735ae4a9ef385d6ee914.workers.dev/ws
```

### Application Environment
```bash
REACT_APP_ENVIRONMENT=development  # or 'production', 'staging'
NODE_ENV=development
```

### Feature Flags
```bash
REACT_APP_ENABLE_R2_SYNC=true         # Enable R2 document sync
REACT_APP_ENABLE_PUBSUB=true         # Enable PubSub real-time updates
REACT_APP_ENABLE_BROWSER_CACHE=true  # Enable browser caching
REACT_APP_ENABLE_AUTO_RAG=true       # Enable Auto RAG processing
```

### Optional Variables

#### Analytics
```bash
REACT_APP_GA_TRACKING_ID=           # Google Analytics ID
REACT_APP_SENTRY_DSN=               # Sentry error tracking DSN
```

#### Demo Mode
```bash
REACT_APP_DEMO_MODE=false           # Enable demo mode
REACT_APP_MOCK_API_DELAY=0          # Mock API delay in milliseconds
```

#### Version
```bash
REACT_APP_VERSION=$npm_package_version  # Application version
```

## Setting Up Environment Variables

1. **Local Development**:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Cloudflare Pages Deployment**:
   ```bash
   # Add secrets using Wrangler
   wrangler pages secret put REACT_APP_CLOUDFLARE_API_TOKEN --project-name eva-platform
   ```

3. **Production Deployment**:
   - Use Cloudflare Pages environment variables UI
   - Or use Wrangler CLI for bulk updates

## R2 and PubSub Integration

The application now includes full R2 integration with PubSub for real-time synchronization between:
- Credit Applications
- FileLock Document Management
- Audit Logging (ShieldVault)

### Key Features:
1. **Automatic Document Sync**: Documents uploaded in credit applications automatically sync to FileLock
2. **Real-time Updates**: PubSub WebSocket connection provides instant updates across components
3. **Browser Caching**: Intelligent caching reduces API calls and improves performance
4. **Auto RAG Processing**: Documents are automatically processed for AI search and retrieval

### WebSocket Connection
The WebSocket URL (`REACT_APP_WEBSOCKET_URL`) is used for:
- Real-time document sync notifications
- Application state updates
- Collaborative features

## TypeScript Compatibility

The application supports TypeScript versions from 5.2 to latest through:
- `tsconfig.json` with `ignoreDeprecations: "5.0"`
- Type compatibility declarations in `src/types/typescript-compat.d.ts`
- Flexible type definitions that work across versions

## Troubleshooting

### Common Issues:

1. **R2 Upload Failures**:
   - Check `REACT_APP_CLOUDFLARE_API_TOKEN` is valid
   - Verify bucket permissions
   - Check browser console for CORS errors

2. **PubSub Connection Issues**:
   - Verify WebSocket URL is correct
   - Check firewall/proxy settings
   - Look for connection errors in browser console

3. **TypeScript Version Errors**:
   - Ensure `tsconfig.json` includes `ignoreDeprecations`
   - Check that compatibility types are imported
   - Try clearing TypeScript cache: `rm -rf node_modules/.cache`

## Security Notes

- **Never commit** `.env` files with real credentials
- Use environment-specific configurations
- Rotate API tokens regularly
- Use read-only tokens where possible
- Enable CORS restrictions on production 