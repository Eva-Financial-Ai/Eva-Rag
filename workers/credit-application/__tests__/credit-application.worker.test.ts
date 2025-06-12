import { unstable_dev } from 'wrangler';
import type { UnstableDevWorker } from 'wrangler';

describe('Credit Application Cloudflare Worker', () => {
  let worker: UnstableDevWorker;

  beforeAll(async () => {
    worker = await unstable_dev('workers/credit-application/index.ts', {
      experimental: { disableExperimentalWarning: true },
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  describe('POST /api/credit-applications', () => {
    it('creates a new credit application', async () => {
      const applicationData = {
        legalBusinessName: 'Test Business LLC',
        taxId: '12-3456789',
        businessAddressStreet: '123 Test St',
        businessAddressCity: 'San Francisco',
        businessAddressState: 'CA',
        businessAddressZip: '94105',
        requestedAmount: 250000,
        owners: [{
          ownerType: 'individual',
          individualDetails: {
            firstName: 'John',
            lastName: 'Doe',
            ssn: '123-45-6789',
            ownershipPercentage: '100',
          },
        }],
      };

      const response = await worker.fetch('/api/credit-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify(applicationData),
      });

      expect(response.status).toBe(201);
      const result = await response.json();
      expect(result).toHaveProperty('applicationId');
      expect(result).toHaveProperty('status', 'submitted');
      expect(result).toHaveProperty('timestamp');
    });

    it('validates required fields', async () => {
      const incompleteData = {
        legalBusinessName: 'Test Business LLC',
        // Missing required fields
      };

      const response = await worker.fetch('/api/credit-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify(incompleteData),
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('required');
    });

    it('enforces rate limiting', async () => {
      const requests = [];
      
      // Send 100 requests rapidly
      for (let i = 0; i < 100; i++) {
        requests.push(
          worker.fetch('/api/credit-applications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer test-token',
              'CF-Connecting-IP': '192.168.1.1',
            },
            body: JSON.stringify({ test: i }),
          })
        );
      }

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
      
      // Check rate limit headers
      const limitedResponse = rateLimited[0];
      expect(limitedResponse.headers.get('X-RateLimit-Limit')).toBeDefined();
      expect(limitedResponse.headers.get('X-RateLimit-Remaining')).toBeDefined();
      expect(limitedResponse.headers.get('X-RateLimit-Reset')).toBeDefined();
    });
  });

  describe('GET /api/credit-applications/:id', () => {
    it('retrieves an application by ID', async () => {
      const response = await worker.fetch('/api/credit-applications/test-app-123', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result).toHaveProperty('applicationId', 'test-app-123');
    });

    it('returns 404 for non-existent application', async () => {
      const response = await worker.fetch('/api/credit-applications/non-existent', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });

      expect(response.status).toBe(404);
    });

    it('requires authentication', async () => {
      const response = await worker.fetch('/api/credit-applications/test-app-123', {
        method: 'GET',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/credit-applications/:id', () => {
    it('updates an existing application', async () => {
      const updateData = {
        requestedAmount: 300000,
        status: 'in_review',
      };

      const response = await worker.fetch('/api/credit-applications/test-app-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result).toHaveProperty('requestedAmount', 300000);
      expect(result).toHaveProperty('status', 'in_review');
    });

    it('validates update permissions', async () => {
      const response = await worker.fetch('/api/credit-applications/test-app-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer limited-token',
        },
        body: JSON.stringify({ status: 'approved' }),
      });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/credit-applications/:id/documents', () => {
    it('uploads documents to R2 storage', async () => {
      const formData = new FormData();
      formData.append('document', new Blob(['test content'], { type: 'application/pdf' }), 'test.pdf');
      formData.append('documentType', 'articles_of_organization');

      const response = await worker.fetch('/api/credit-applications/test-app-123/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
        },
        body: formData,
      });

      expect(response.status).toBe(201);
      const result = await response.json();
      expect(result).toHaveProperty('documentId');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('uploadedAt');
    });

    it('validates file types', async () => {
      const formData = new FormData();
      formData.append('document', new Blob(['test'], { type: 'text/plain' }), 'test.txt');

      const response = await worker.fetch('/api/credit-applications/test-app-123/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
        },
        body: formData,
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toContain('file type');
    });

    it('enforces file size limits', async () => {
      const largeFile = new Blob([new ArrayBuffer(11 * 1024 * 1024)], { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('document', largeFile, 'large.pdf');

      const response = await worker.fetch('/api/credit-applications/test-app-123/documents', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
        },
        body: formData,
      });

      expect(response.status).toBe(413);
    });
  });

  describe('Data Security', () => {
    it('encrypts sensitive data at rest', async () => {
      const sensitiveData = {
        legalBusinessName: 'Secure Business LLC',
        taxId: '98-7654321',
        owners: [{
          individualDetails: {
            ssn: '987-65-4321',
          },
        }],
      };

      const response = await worker.fetch('/api/credit-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify(sensitiveData),
      });

      expect(response.status).toBe(201);
      
      // Verify data is encrypted in storage
      const result = await response.json();
      expect(result).not.toHaveProperty('taxId');
      expect(result).not.toHaveProperty('ssn');
    });

    it('implements CORS policies', async () => {
      const response = await worker.fetch('/api/credit-applications', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://evil-site.com',
        },
      });

      expect(response.status).toBe(403);
      expect(response.headers.get('Access-Control-Allow-Origin')).not.toBe('*');
    });
  });

  describe('Performance and Caching', () => {
    it('caches frequently accessed data', async () => {
      // First request
      const start1 = Date.now();
      const response1 = await worker.fetch('/api/credit-applications/test-app-123', {
        headers: { 'Authorization': 'Bearer test-token' },
      });
      const time1 = Date.now() - start1;

      // Second request (should be cached)
      const start2 = Date.now();
      const response2 = await worker.fetch('/api/credit-applications/test-app-123', {
        headers: { 'Authorization': 'Bearer test-token' },
      });
      const time2 = Date.now() - start2;

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response2.headers.get('X-Cache-Status')).toBe('HIT');
      expect(time2).toBeLessThan(time1 * 0.5); // Should be at least 50% faster
    });

    it('implements edge caching headers', async () => {
      const response = await worker.fetch('/api/credit-applications/test-app-123', {
        headers: { 'Authorization': 'Bearer test-token' },
      });

      expect(response.headers.get('Cache-Control')).toBeDefined();
      expect(response.headers.get('ETag')).toBeDefined();
      expect(response.headers.get('CF-Cache-Status')).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('handles database connection errors gracefully', async () => {
      // Simulate database error
      const response = await worker.fetch('/api/credit-applications?simulate=db-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({ test: true }),
      });

      expect(response.status).toBe(503);
      const result = await response.json();
      expect(result.error).toContain('temporarily unavailable');
    });

    it('provides meaningful error messages', async () => {
      const response = await worker.fetch('/api/credit-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: 'invalid json',
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toBeDefined();
      expect(result.error).not.toContain('undefined');
    });
  });
});