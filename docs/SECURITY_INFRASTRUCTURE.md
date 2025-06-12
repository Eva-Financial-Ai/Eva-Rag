# EVA AI Security Infrastructure

# ================================

## Overview

This document outlines the comprehensive security infrastructure for EVA AI, featuring triple-redundant firewalls, DNS security, database replication, and real-time content distribution.

## Security Architecture

### 1. DNS Firewall Configuration

```yaml
# DNS Security Layers
Primary DNS Firewall: Cloudflare Gateway
Secondary DNS Firewall: Quad9 (9.9.9.9)
Tertiary DNS Firewall: OpenDNS (208.67.222.222)

# DNS Filtering Rules
- Block malicious domains
- Filter phishing attempts
- Block cryptocurrency mining
- Restrict adult content
- Monitor DNS queries for anomalies
```

### 2. Triple Firewall Architecture

#### Layer 1: Cloudflare WAF (Web Application Firewall)

```javascript
// Cloudflare WAF Rules
const wafRules = {
  // Rate limiting
  rateLimiting: {
    requests: 100,
    period: 60, // seconds
    action: 'challenge',
  },

  // Geographic restrictions
  geoBlocking: {
    allowedCountries: ['US', 'CA', 'GB', 'AU'],
    blockedCountries: ['CN', 'RU', 'KP'],
  },

  // Bot protection
  botProtection: {
    level: 'high',
    challengePassedUsers: true,
    jsChallenge: true,
  },

  // Custom rules
  customRules: [
    {
      name: 'Block SQL Injection',
      expression:
        '(http.request.uri.query contains "union select") or (http.request.uri.query contains "drop table")',
      action: 'block',
    },
    {
      name: 'Block XSS Attempts',
      expression:
        '(http.request.uri.query contains "<script>") or (http.request.body contains "<script>")',
      action: 'block',
    },
  ],
};
```

#### Layer 2: Application-Level Firewall

```go
// Go Backend Firewall Middleware
package middleware

import (
    "net/http"
    "strings"
    "time"
    "github.com/gin-gonic/gin"
)

type SecurityMiddleware struct {
    rateLimiter map[string][]time.Time
    blockedIPs  map[string]time.Time
}

func (s *SecurityMiddleware) FirewallMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        clientIP := c.ClientIP()

        // Check if IP is blocked
        if blockTime, exists := s.blockedIPs[clientIP]; exists {
            if time.Since(blockTime) < 24*time.Hour {
                c.JSON(http.StatusForbidden, gin.H{"error": "IP blocked"})
                c.Abort()
                return
            }
            delete(s.blockedIPs, clientIP)
        }

        // Rate limiting
        if s.isRateLimited(clientIP) {
            s.blockedIPs[clientIP] = time.Now()
            c.JSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded"})
            c.Abort()
            return
        }

        // Security headers
        c.Header("X-Frame-Options", "DENY")
        c.Header("X-Content-Type-Options", "nosniff")
        c.Header("X-XSS-Protection", "1; mode=block")
        c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

        c.Next()
    }
}
```

#### Layer 3: Infrastructure Firewall (Supabase + Cloudflare)

```sql
-- Supabase Row Level Security (RLS)
CREATE POLICY "Users can only access their own data" ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Credit applications restricted" ON credit_applications
    FOR ALL USING (auth.uid() = user_id);

-- IP Whitelist for admin operations
CREATE TABLE ip_whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Database Architecture

### 1. Primary Database: Supabase (PostgreSQL)

```sql
-- Real-time subscriptions
CREATE PUBLICATION eva_realtime FOR ALL TABLES;

-- Replication configuration
ALTER SYSTEM SET wal_level = 'replica';
ALTER SYSTEM SET max_wal_senders = 10;
ALTER SYSTEM SET max_replication_slots = 10;
```

### 2. Backup Database: Cloudflare D1

```javascript
// D1 Sync Service
class DatabaseSync {
  async syncToD1(table, data) {
    const stmt = this.d1.prepare(`
            INSERT OR REPLACE INTO ${table} 
            VALUES (${Object.keys(data)
              .map(() => '?')
              .join(',')})
        `);

    return await stmt.bind(...Object.values(data)).run();
  }

  async syncFromSupabase() {
    const tables = ['users', 'credit_applications', 'transactions'];

    for (const table of tables) {
      const { data } = await this.supabase.from(table).select('*').gte('updated_at', this.lastSync);

      for (const record of data) {
        await this.syncToD1(table, record);
      }
    }
  }
}
```

### 3. Real-time Content Distribution

#### R2 Configuration for Static Assets

```javascript
// R2 Bucket Configuration
const r2Config = {
  buckets: {
    'eva-static-assets': {
      cors: {
        allowedOrigins: ['https://evafi.ai', 'https://demo.evafi.ai'],
        allowedMethods: ['GET', 'HEAD'],
        maxAge: 3600,
      },
      lifecycle: {
        rules: [
          {
            id: 'delete-old-versions',
            status: 'Enabled',
            expiration: { days: 30 },
          },
        ],
      },
    },
    'eva-user-documents': {
      encryption: 'AES256',
      versioning: true,
      backup: {
        destination: 'eva-backups',
        frequency: 'daily',
      },
    },
  },
};
```

#### KV for Recently Used Information

```javascript
// KV Store for Real-time Data
class RealtimeCache {
  constructor(kv) {
    this.kv = kv;
  }

  async cacheUserActivity(userId, activity) {
    const key = `user:${userId}:recent`;
    const existing = (await this.kv.get(key, 'json')) || [];

    existing.unshift({
      ...activity,
      timestamp: Date.now(),
    });

    // Keep only last 100 activities
    const recent = existing.slice(0, 100);

    await this.kv.put(key, JSON.stringify(recent), {
      expirationTtl: 86400, // 24 hours
    });
  }

  async getRecentActivity(userId) {
    const key = `user:${userId}:recent`;
    return (await this.kv.get(key, 'json')) || [];
  }
}
```

## Cloudflare Advanced Services

### 1. Hyperdrive Configuration

```toml
# wrangler.toml - Hyperdrive setup
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "your-hyperdrive-id"
database_id = "your-database-id"
```

```javascript
// Hyperdrive usage for database acceleration
export default {
  async fetch(request, env) {
    const db = env.HYPERDRIVE;

    // Accelerated database queries
    const result = await db
      .prepare(
        `
            SELECT * FROM users WHERE id = ?
        `
      )
      .bind(userId)
      .first();

    return Response.json(result);
  },
};
```

### 2. Queues for Async Processing

```javascript
// Queue configuration
export default {
  async queue(batch, env) {
    for (const message of batch.messages) {
      switch (message.body.type) {
        case 'credit_application':
          await processCreditApplication(message.body.data);
          break;
        case 'document_processing':
          await processDocument(message.body.data);
          break;
        case 'notification':
          await sendNotification(message.body.data);
          break;
      }
    }
  },
};

// Queue producer
async function queueCreditApplication(applicationData) {
  await env.QUEUE.send({
    type: 'credit_application',
    data: applicationData,
    timestamp: Date.now(),
  });
}
```

### 3. Analytics Engine

```javascript
// Analytics data points
const analyticsEvents = {
  userLogin: userId => ({
    event: 'user_login',
    userId,
    timestamp: Date.now(),
    metadata: {
      userAgent: request.headers.get('User-Agent'),
      ip: request.headers.get('CF-Connecting-IP'),
    },
  }),

  creditApplicationSubmitted: (userId, applicationId) => ({
    event: 'credit_application_submitted',
    userId,
    applicationId,
    timestamp: Date.now(),
  }),

  transactionExecuted: (userId, transactionId, amount) => ({
    event: 'transaction_executed',
    userId,
    transactionId,
    amount,
    timestamp: Date.now(),
  }),
};

// Analytics writer
async function writeAnalytics(event) {
  await env.ANALYTICS.writeDataPoint({
    blobs: [event.event, event.userId, JSON.stringify(event.metadata || {})],
    doubles: [event.amount || 0],
    indexes: [event.timestamp],
  });
}
```

### 4. Pipelines for Data Processing

```yaml
# Pipeline configuration
pipelines:
  - name: user-data-pipeline
    source: supabase
    destination: d1
    transforms:
      - anonymize_pii
      - validate_schema
      - enrich_metadata

  - name: analytics-pipeline
    source: analytics_engine
    destination: r2
    schedule: '0 */6 * * *' # Every 6 hours
    transforms:
      - aggregate_metrics
      - generate_reports
```

## Disaster Recovery Plan

### 1. Database Failover

```javascript
class DisasterRecovery {
  constructor() {
    this.primaryDB = 'supabase';
    this.backupDB = 'd1';
    this.healthCheckInterval = 30000; // 30 seconds
  }

  async healthCheck() {
    try {
      await this.supabase.from('health_check').select('*').limit(1);
      return true;
    } catch (error) {
      console.error('Primary DB health check failed:', error);
      return false;
    }
  }

  async failover() {
    console.log('Initiating failover to D1...');
    this.primaryDB = 'd1';

    // Update DNS to point to backup infrastructure
    await this.updateDNSRecords();

    // Notify administrators
    await this.sendFailoverAlert();
  }
}
```

### 2. Automated Backup System

```javascript
// Automated backup service
class BackupService {
  async performBackup() {
    const timestamp = new Date().toISOString();

    // Backup Supabase to R2
    const supabaseBackup = await this.exportSupabaseData();
    await env.R2_BACKUPS.put(`supabase-backup-${timestamp}.sql`, supabaseBackup);

    // Backup D1 to R2
    const d1Backup = await this.exportD1Data();
    await env.R2_BACKUPS.put(`d1-backup-${timestamp}.sql`, d1Backup);

    // Backup KV stores
    const kvBackup = await this.exportKVData();
    await env.R2_BACKUPS.put(`kv-backup-${timestamp}.json`, JSON.stringify(kvBackup));
  }
}
```

## Security Monitoring

### 1. Real-time Threat Detection

```javascript
// Security monitoring service
class SecurityMonitor {
  async detectThreats(request) {
    const threats = [];

    // Check for suspicious patterns
    if (this.isSQLInjection(request.url)) {
      threats.push('SQL_INJECTION');
    }

    if (this.isXSSAttempt(request.body)) {
      threats.push('XSS_ATTEMPT');
    }

    if (this.isBruteForce(request.headers.get('CF-Connecting-IP'))) {
      threats.push('BRUTE_FORCE');
    }

    if (threats.length > 0) {
      await this.alertSecurity(threats, request);
    }

    return threats;
  }
}
```

### 2. Compliance and Auditing

```sql
-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Compliance reporting
CREATE VIEW compliance_report AS
SELECT
    DATE_TRUNC('day', timestamp) as date,
    action,
    COUNT(*) as count,
    COUNT(DISTINCT user_id) as unique_users
FROM audit_logs
GROUP BY DATE_TRUNC('day', timestamp), action;
```

## Performance Optimization

### 1. CDN Configuration

```javascript
// Cloudflare CDN rules
const cdnRules = {
  caching: {
    static: {
      extensions: ['.js', '.css', '.png', '.jpg', '.svg'],
      ttl: 31536000, // 1 year
    },
    api: {
      paths: ['/api/public/*'],
      ttl: 300, // 5 minutes
    },
  },

  compression: {
    brotli: true,
    gzip: true,
    minify: {
      html: true,
      css: true,
      js: true,
    },
  },
};
```

### 2. Load Balancing

```yaml
# Load balancer configuration
load_balancer:
  algorithm: round_robin
  health_checks:
    interval: 30s
    timeout: 10s
    healthy_threshold: 2
    unhealthy_threshold: 3

  origins:
    - name: primary
      address: primary.evafi.ai
      weight: 70
    - name: secondary
      address: secondary.evafi.ai
      weight: 30
```

This comprehensive security infrastructure provides:

- Triple-redundant firewall protection
- Real-time database synchronization
- Automated disaster recovery
- Advanced threat detection
- Performance optimization
- Compliance monitoring
- Scalable content distribution
