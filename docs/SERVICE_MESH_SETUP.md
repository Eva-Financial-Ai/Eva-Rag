# EVA Finance Service Mesh Setup Guide

## Overview

This guide provides step-by-step instructions for setting up and deploying the EVA Finance service mesh infrastructure using Cloudflare Workers.

## Prerequisites

- Cloudflare account with Workers enabled
- Wrangler CLI installed (`npm install -g wrangler`)
- Node.js 18.x or 20.x
- Access to Cloudflare KV, R2, and other required services

## Architecture Overview

The EVA Finance service mesh provides:
- Zero-trust security with JWT authentication
- Circuit breakers for external service protection
- Intelligent retry policies with exponential backoff
- Rate limiting and DDoS protection
- Comprehensive monitoring and observability

## Setup Instructions

### 1. Environment Configuration

Create the required KV namespaces:

```bash
# Create KV namespaces
wrangler kv:namespace create "CIRCUIT_BREAKER_KV"
wrangler kv:namespace create "RATE_LIMIT_KV"
wrangler kv:namespace create "METRICS_KV"
wrangler kv:namespace create "HEALTH_KV"
```

### 2. Set Required Secrets

```bash
# Set JWT secret (generate a strong 32+ character secret)
wrangler secret put JWT_SECRET

# Set external service URLs
wrangler secret put CREDIT_BUREAU_URL
wrangler secret put BANKING_API_URL
wrangler secret put DOC_PROCESSOR_URL
```

### 3. Deploy Service Mesh Components

#### Deploy the Main Service Mesh Worker

```bash
# Navigate to service mesh directory
cd workers/service-mesh

# Deploy the service mesh worker
wrangler deploy service-mesh-worker.ts --name eva-service-mesh
```

#### Deploy Health Check Worker

```bash
# Deploy health check worker
wrangler deploy infrastructure/cloudflare/load-balancing/health-check-worker.ts \
  --name eva-health-check \
  --triggers "*/1 * * * *"  # Run every minute
```

### 4. Configure Load Balancer

1. Log into Cloudflare Dashboard
2. Navigate to Load Balancing
3. Create a new load balancer with the configuration from `config/cloudflare-load-balancer.json`
4. Set up health check endpoints for each service

### 5. Configure Rate Limiting Rules

Apply rate limiting rules to your Cloudflare zone:

```bash
# Using Cloudflare API
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/rate_limits" \
  -H "X-Auth-Email: {email}" \
  -H "X-Auth-Key: {api_key}" \
  -H "Content-Type: application/json" \
  --data '{
    "match": {
      "request": {
        "url": "api.evafi.ai/*"
      }
    },
    "threshold": 100,
    "period": 60,
    "action": {
      "mode": "challenge"
    }
  }'
```

## Service Configuration

### Circuit Breaker Configuration

Configure circuit breakers for each external service:

```typescript
// Credit Bureau Service
{
  failureThreshold: 3,      // Open after 3 failures
  resetTimeout: 60000,      // Try again after 60 seconds
  halfOpenRequests: 3,      // Test with 3 requests
  timeout: 10000           // 10 second timeout
}

// Banking API Service
{
  failureThreshold: 5,      // More tolerant for banking APIs
  resetTimeout: 30000,      // Faster recovery
  halfOpenRequests: 3,
  timeout: 15000           // 15 second timeout
}
```

### Retry Policy Configuration

Different retry policies for different operation types:

```typescript
// Financial Transactions (Conservative)
{
  maxRetries: 2,
  initialDelay: 2000,
  maxDelay: 10000,
  backoffMultiplier: 2
}

// Read Operations (Aggressive)
{
  maxRetries: 5,
  initialDelay: 500,
  maxDelay: 5000,
  backoffMultiplier: 1.5
}
```

### Rate Limiting Configuration

User-tier based rate limits:

- **Anonymous**: 5 requests/minute, 50 requests/hour
- **Authenticated**: 30 requests/minute, 500 requests/hour
- **Premium**: 100 requests/minute, 2000 requests/hour

## Testing the Service Mesh

### 1. Test Health Check Endpoint

```bash
curl https://eva-service-mesh.workers.dev/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "eva-api-gateway",
  "timestamp": "2024-01-15T10:30:00Z",
  "upstreams": {
    "credit-bureau": {
      "status": "healthy",
      "statusCode": 200
    },
    "banking": {
      "status": "healthy",
      "statusCode": 200
    }
  }
}
```

### 2. Test Circuit Breaker

```bash
# Simulate failures to trigger circuit breaker
for i in {1..5}; do
  curl -X POST https://eva-service-mesh.workers.dev/api/credit-bureau/fail-test
done

# Check circuit breaker state
curl https://eva-service-mesh.workers.dev/health
```

### 3. Test Rate Limiting

```bash
# Send rapid requests to trigger rate limit
for i in {1..10}; do
  curl https://eva-service-mesh.workers.dev/api/test
done
```

## Monitoring and Observability

### Access Metrics

```bash
# Get service metrics
curl https://eva-service-mesh.workers.dev/metrics
```

### Prometheus Integration

Configure Prometheus to scrape metrics:

```yaml
scrape_configs:
  - job_name: 'eva-service-mesh'
    scrape_interval: 30s
    static_configs:
      - targets: ['eva-service-mesh.workers.dev']
```

### Grafana Dashboards

Import the provided Grafana dashboard configuration from `monitoring/grafana/dashboards/eva-service-mesh-dashboard.json`

## Security Considerations

### JWT Token Generation

Generate service-to-service JWT tokens:

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  {
    serviceId: 'eva-frontend',
    permissions: ['credit:read', 'documents:write'],
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  },
  process.env.JWT_SECRET,
  { algorithm: 'HS256' }
);
```

### mTLS Configuration (Optional)

For enhanced security, enable mTLS:

1. Generate service certificates
2. Upload to Cloudflare
3. Enable mTLS in service configuration:

```typescript
auth: {
  requireMTLS: true,
  allowedCertificates: ['cert-fingerprint-1', 'cert-fingerprint-2']
}
```

## Troubleshooting

### Common Issues

#### Circuit Breaker Stuck Open

```bash
# Reset circuit breaker state
wrangler kv:key delete --namespace-id=CIRCUIT_BREAKER_KV "circuit-breaker:service-name"
```

#### Rate Limit Issues

```bash
# Check rate limit status
wrangler kv:key get --namespace-id=RATE_LIMIT_KV "ratelimit:user:authenticated:user-id"
```

#### Authentication Failures

1. Verify JWT_SECRET is set correctly
2. Check token expiration
3. Ensure service is in allowedServices list

### Debug Mode

Enable debug logging:

```typescript
const DEBUG = true; // Set in worker environment variables
```

## Performance Optimization

### Caching Strategy

- Cache successful responses for 60 seconds
- Use stale-while-revalidate for non-critical data
- Implement cache warming for frequently accessed data

### Connection Pooling

The service mesh automatically manages connection pooling for external services.

## Maintenance

### Regular Tasks

1. **Weekly**: Review circuit breaker triggers and adjust thresholds
2. **Monthly**: Analyze rate limit patterns and adjust limits
3. **Quarterly**: Security audit of JWT tokens and permissions

### Updating Configuration

```bash
# Update worker with new configuration
wrangler deploy service-mesh-worker.ts --name eva-service-mesh

# Update secrets
wrangler secret put JWT_SECRET
```

## Rollback Procedures

If issues occur after deployment:

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback [deployment-id]
```

## Support

For issues or questions:
1. Check worker logs: `wrangler tail eva-service-mesh`
2. Review metrics dashboard
3. Contact platform team

---

**Last Updated**: January 2025  
**Version**: 1.0.0