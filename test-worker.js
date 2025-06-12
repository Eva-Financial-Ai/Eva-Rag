import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node

const http = require('http');

async function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 54135,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  debugLog('general', 'log_statement', 'Testing Worker endpoints...\n')

  try {
    // Test health endpoint
    debugLog('general', 'log_statement', '1. Testing /api/health')
    const health = await testEndpoint('/api/health');
    debugLog('general', 'log_statement', `   Status: ${health.status}`)
    debugLog('general', 'log_statement', `   Body: ${health.body}\n`)

    // Test upload endpoint with GET (should return 404 or method not allowed)
    debugLog('general', 'log_statement', '2. Testing /api/documents/upload (GET)');
    const uploadGet = await testEndpoint('/api/documents/upload');
    debugLog('general', 'log_statement', `   Status: ${uploadGet.status}`)
    debugLog('general', 'log_statement', `   Body: ${uploadGet.body}\n`)

    // Test root path
    debugLog('general', 'log_statement', '3. Testing / (root)');
    const root = await testEndpoint('/');
    debugLog('general', 'log_statement', `   Status: ${root.status}`)
    debugLog('general', 'log_statement', `   Body: ${root.body}\n`)

    // Test non-existent path
    debugLog('general', 'log_statement', '4. Testing /nonexistent')
    const nonexistent = await testEndpoint('/nonexistent');
    debugLog('general', 'log_statement', `   Status: ${nonexistent.status}`)
    debugLog('general', 'log_statement', `   Body: ${nonexistent.body}\n`)

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

runTests(); 