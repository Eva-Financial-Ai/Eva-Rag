import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node

/**
 * Cloudflare Infrastructure Verification Script
 * Verifies that all infrastructure components are properly configured for production
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration from wrangler.toml
const CLOUDFLARE_CONFIG = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
  
  // KV Namespaces
  kvNamespaces: {
    userSessions: {
      production: '3c32a3731dcf444fa788804d20587d43',
      preview: 'f346967a345844229ad76d33228b5131'
    },
    cacheStore: {
      production: '0a9f3271b866407caa2010ec29ae9e33',
      preview: 'de7ea6d54b53486789fcca22161bf79d'
    },
    featureFlags: {
      production: 'a76aae2afefc43399a7649ee63af37f5',
      preview: '1efa04c511a746aaad1b3fcd19a85143'
    }
  },
  
  // D1 Databases
  d1Databases: {
    production: 'f9ec770c-102c-4c59-8a03-0f824dafdbe3',
    staging: 'b4bafb16-67af-4d7c-813f-aa160690eea4'
  },
  
  // R2 Buckets
  r2Buckets: [
    'eva-credit-applications',
    'eva-kyc-profiles'
  ]
};

async function makeCloudflareRequest(endpoint, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4${endpoint}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.success) {
            resolve(parsed.result);
          } else {
            reject(new Error(`API Error: ${parsed.errors?.[0]?.message || 'Unknown error'}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function verifyKVNamespaces() {
  debugLog('general', 'log_statement', '🔍 Verifying KV Namespaces...')
  
  try {
    const namespaces = await makeCloudflareRequest(`/accounts/${CLOUDFLARE_CONFIG.accountId}/storage/kv/namespaces`);
    
    const expectedNamespaces = [
      { id: CLOUDFLARE_CONFIG.kvNamespaces.userSessions.production, name: 'USER_SESSIONS_PROD' },
      { id: CLOUDFLARE_CONFIG.kvNamespaces.userSessions.preview, name: 'USER_SESSIONS_PREVIEW' },
      { id: CLOUDFLARE_CONFIG.kvNamespaces.cacheStore.production, name: 'CACHE_STORE_PROD' },
      { id: CLOUDFLARE_CONFIG.kvNamespaces.cacheStore.preview, name: 'CACHE_STORE_PREVIEW' },
      { id: CLOUDFLARE_CONFIG.kvNamespaces.featureFlags.production, name: 'FEATURE_FLAGS_PROD' },
      { id: CLOUDFLARE_CONFIG.kvNamespaces.featureFlags.preview, name: 'FEATURE_FLAGS_PREVIEW' }
    ];

    for (const expected of expectedNamespaces) {
      const found = namespaces.find(ns => ns.id === expected.id);
      if (found) {
        debugLog('general', 'log_statement', `  ✅ KV Namespace: ${expected.name} (${expected.id})`);
      } else {
        debugLog('general', 'log_statement', `  ❌ Missing KV Namespace: ${expected.name} (${expected.id})`);
      }
    }
    
  } catch (error) {
    debugLog('general', 'log_statement', `  ❌ Failed to verify KV Namespaces: ${error.message}`)
  }
}

async function verifyD1Databases() {
  debugLog('general', 'log_statement', '🔍 Verifying D1 Databases...')
  
  try {
    const databases = await makeCloudflareRequest(`/accounts/${CLOUDFLARE_CONFIG.accountId}/d1/database`);
    
    const expectedDatabases = [
      { id: CLOUDFLARE_CONFIG.d1Databases.production, name: 'eva-platform-db-production' },
      { id: CLOUDFLARE_CONFIG.d1Databases.staging, name: 'eva-platform-db-staging' }
    ];

    for (const expected of expectedDatabases) {
      const found = databases.find(db => db.uuid === expected.id);
      if (found) {
        debugLog('general', 'log_statement', `  ✅ D1 Database: ${expected.name} (${expected.id})`);
      } else {
        debugLog('general', 'log_statement', `  ❌ Missing D1 Database: ${expected.name} (${expected.id})`);
      }
    }
    
  } catch (error) {
    debugLog('general', 'log_statement', `  ❌ Failed to verify D1 Databases: ${error.message}`)
  }
}

async function verifyR2Buckets() {
  debugLog('general', 'log_statement', '🔍 Verifying R2 Buckets...')
  
  try {
    const buckets = await makeCloudflareRequest(`/accounts/${CLOUDFLARE_CONFIG.accountId}/r2/buckets`);
    
    for (const expectedBucket of CLOUDFLARE_CONFIG.r2Buckets) {
      const found = buckets.find(bucket => bucket.name === expectedBucket);
      if (found) {
        debugLog('general', 'log_statement', `  ✅ R2 Bucket: ${expectedBucket}`)
      } else {
        debugLog('general', 'log_statement', `  ❌ Missing R2 Bucket: ${expectedBucket}`)
      }
    }
    
  } catch (error) {
    debugLog('general', 'log_statement', `  ❌ Failed to verify R2 Buckets: ${error.message}`)
  }
}

async function verifyPagesProject() {
  debugLog('general', 'log_statement', '🔍 Verifying Pages Project...')
  
  try {
    const projects = await makeCloudflareRequest(`/accounts/${CLOUDFLARE_CONFIG.accountId}/pages/projects`);
    const evaProject = projects.find(project => project.name === 'eva-ai-frontend');
    
    if (evaProject) {
      debugLog('general', 'log_statement', `  ✅ Pages Project: eva-ai-frontend`)
      debugLog('general', 'log_statement', `  📍 Production URL: https://${evaProject.subdomain}.pages.dev`)
      debugLog('general', 'log_statement', `  🔄 Build Status: ${evaProject.latest_deployment?.environment || 'Unknown'}`)
    } else {
      debugLog('general', 'log_statement', `  ❌ Missing Pages Project: eva-ai-frontend`)
    }
    
  } catch (error) {
    debugLog('general', 'log_statement', `  ❌ Failed to verify Pages Project: ${error.message}`)
  }
}

async function verifyWranglerConfig() {
  debugLog('general', 'log_statement', '🔍 Verifying Wrangler Configuration...')
  
  const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');
  
  if (fs.existsSync(wranglerPath)) {
    debugLog('general', 'log_statement', '  ✅ wrangler.toml exists')
    
    const config = fs.readFileSync(wranglerPath, 'utf8');
    
    // Check for required sections
    const requiredSections = [
      'name = "eva-ai-frontend"',
      'pages_build_output_dir = "build"',
      '[env.production]',
      '[env.preview]',
      'binding = "USER_SESSIONS"',
      'binding = "CACHE_STORE"',
      'binding = "DB"'
    ];
    
    for (const section of requiredSections) {
      if (config.includes(section)) {
        debugLog('general', 'log_statement', `  ✅ Config contains: ${section}`)
      } else {
        debugLog('general', 'log_statement', `  ❌ Missing config: ${section}`)
      }
    }
  } else {
    debugLog('general', 'log_statement', '  ❌ wrangler.toml not found')
  }
}

async function verifyBuildOutput() {
  debugLog('general', 'log_statement', '🔍 Verifying Build Output...')
  
  const buildPath = path.join(__dirname, '..', 'build');
  
  if (fs.existsSync(buildPath)) {
    debugLog('general', 'log_statement', '  ✅ Build directory exists')
    
    const requiredFiles = [
      'index.html',
      'static/js',
      'static/css',
      'manifest.json'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(buildPath, file);
      if (fs.existsSync(filePath)) {
        debugLog('general', 'log_statement', `  ✅ Build contains: ${file}`)
      } else {
        debugLog('general', 'log_statement', `  ❌ Missing build file: ${file}`)
      }
    }
    
    // Check build size
    const stats = fs.statSync(buildPath);
    debugLog('general', 'log_statement', `  📊 Build directory created: ${stats.mtime.toISOString()}`);
    
  } else {
    debugLog('general', 'log_statement', '  ❌ Build directory not found - run "npm run build" first')
  }
}

async function main() {
  debugLog('general', 'log_statement', '🚀 EVA Financial Platform - Cloudflare Infrastructure Verification\n')
  
  // Check environment variables
  if (!CLOUDFLARE_CONFIG.accountId || !CLOUDFLARE_CONFIG.apiToken) {
    debugLog('general', 'log_statement', '❌ Missing required environment variables:')
    debugLog('general', 'log_statement', '   - CLOUDFLARE_ACCOUNT_ID')
    debugLog('general', 'log_statement', '   - CLOUDFLARE_API_TOKEN')
    debugLog('general', 'log_statement', '\nPlease set these variables and try again.\n')
    return;
  }
  
  // Run all verifications
  await verifyWranglerConfig();
  debugLog('general', 'log_statement', '')
  
  await verifyBuildOutput();
  debugLog('general', 'log_statement', '')
  
  await verifyKVNamespaces();
  debugLog('general', 'log_statement', '')
  
  await verifyD1Databases();
  debugLog('general', 'log_statement', '')
  
  await verifyR2Buckets();
  debugLog('general', 'log_statement', '')
  
  await verifyPagesProject();
  debugLog('general', 'log_statement', '')
  
  debugLog('general', 'log_statement', '✨ Verification complete!\n')
  debugLog('general', 'log_statement', '🌍 Your application is available at: https://eca2e55b.eva-ai-frontend.pages.dev')
  debugLog('general', 'log_statement', '🔧 Manage infrastructure at: https://dash.cloudflare.com/')
}

// Run the verification
main().catch(console.error); 