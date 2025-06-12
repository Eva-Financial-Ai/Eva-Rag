import { debugLog } from '../utils/auditLogger';

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Configuration
const PORT = process.env.PROXY_PORT || 8080;

const services = {
  eva: {
    target: 'http://localhost:3006',
    changeOrigin: true,
    description: 'Eva Platform Frontend',
  },
  app2: {
    target: 'http://localhost:3000',
    changeOrigin: true,
    pathRewrite: { '^/app2': '' },
    description: 'Second React Application',
  },
  api: {
    target: 'http://localhost:5000',
    changeOrigin: true,
    description: 'Backend API',
  },
  auth: {
    target: 'http://localhost:8000',
    changeOrigin: true,
    description: 'Authentication Service',
  },
};

// Middleware for logging
app.use((req, res, next) => {
  debugLog('general', 'log_statement', `[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: Object.keys(services).reduce((acc, key) => {
      acc[key] = services[key].description;
      return acc;
    }, {}),
  });
});

// Set up proxy routes
app.use('/app2', createProxyMiddleware(services.app2));
app.use('/api', createProxyMiddleware(services.api));
app.use('/auth', createProxyMiddleware(services.auth));

// Default route - Eva Platform
app.use('/', createProxyMiddleware(services.eva));

// Start server
app.listen(PORT, () => {
  debugLog('general', 'log_statement', `🚀 Proxy server running on http://localhost:${PORT}`)
  debugLog('general', 'log_statement', '\nConfigured routes:')
  debugLog('general', 'log_statement', '  / -> Eva Platform (port 3006)');
  debugLog('general', 'log_statement', '  /app2 -> Second App (port 3000)');
  debugLog('general', 'log_statement', '  /api -> Backend API (port 5000)');
  debugLog('general', 'log_statement', '  /auth -> Auth Service (port 8000)');
  debugLog('general', 'log_statement', '  /health -> Health check endpoint')
});
