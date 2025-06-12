#!/bin/bash
echo "🌐 Applying API Integration Fixes..."

# Update API client with proper error handling
cat > src/api/apiClientEnhanced.ts << 'APICLIENT'
import { auth0ApiClient } from './auth0ApiClient';
import { auditTrailService } from '../services/auditTrailService';

// Enhanced API client with audit trail and error handling
export const apiClient = {
  ...auth0ApiClient,

  // Override request method to add audit trail
  request: async (config: any) => {
    const startTime = Date.now();

    try {
      // Log API request
      auditTrailService.logAPIIntegration({
        endpoint: config.url,
        method: config.method,
        timestamp: new Date().toISOString(),
      });

      const response = await auth0ApiClient.request(config);

      // Log successful response
      auditTrailService.logAPIIntegration({
        endpoint: config.url,
        method: config.method,
        status: response.status,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error: any) {
      // Log error
      auditTrailService.logAPIIntegration({
        endpoint: config.url,
        method: config.method,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  },
};
APICLIENT

echo "✅ API integration fixes applied"
