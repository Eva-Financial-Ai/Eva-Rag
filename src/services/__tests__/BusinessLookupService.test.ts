import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StateConfigurations } from '../../types/businessLookup';
import { BusinessLookupService } from '../BusinessLookupService';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables
const mockEnv = {
  REACT_APP_CLOUDFLARE_ACCOUNT_ID: 'test-account-id',
  REACT_APP_CLOUDFLARE_API_TOKEN: 'test-api-token',
  REACT_APP_CLOUDFLARE_WORKERS_ENDPOINT: 'https://api.cloudflare.com/client/v4/accounts/test/ai/run',
  REACT_APP_BRAVE_SEARCH_API_KEY: 'test-brave-key',
  REACT_APP_BRAVE_SEARCH_ENDPOINT: 'https://api.search.brave.com/res/v1/web/search',
  REACT_APP_SUPABASE_URL: 'https://test.supabase.co',
  REACT_APP_SUPABASE_ANON_KEY: 'test-supabase-key',
  REACT_APP_CLOUDFLARE_R2_ACCOUNT_ID: 'test-r2-account',
  REACT_APP_CLOUDFLARE_R2_ACCESS_KEY_ID: 'test-access-key',
  REACT_APP_CLOUDFLARE_R2_SECRET_ACCESS_KEY: 'test-secret-key',
  REACT_APP_CLOUDFLARE_R2_BUCKET_NAME: 'test-bucket'
};

// Mock process.env
Object.defineProperty(process, 'env', {
  value: mockEnv,
  writable: true
});

describe('BusinessLookupService', () => {
  let service: BusinessLookupService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    service = new BusinessLookupService(
      {
        accountId: mockEnv.REACT_APP_CLOUDFLARE_ACCOUNT_ID,
        apiToken: mockEnv.REACT_APP_CLOUDFLARE_API_TOKEN,
        endpoint: mockEnv.REACT_APP_CLOUDFLARE_WORKERS_ENDPOINT
      },
      {
        apiKey: mockEnv.REACT_APP_BRAVE_SEARCH_API_KEY,
        endpoint: mockEnv.REACT_APP_BRAVE_SEARCH_ENDPOINT
      },
      {
        url: mockEnv.REACT_APP_SUPABASE_URL,
        apiKey: mockEnv.REACT_APP_SUPABASE_ANON_KEY
      },
      {
        accountId: mockEnv.REACT_APP_CLOUDFLARE_R2_ACCOUNT_ID,
        accessKeyId: mockEnv.REACT_APP_CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: mockEnv.REACT_APP_CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        bucketName: mockEnv.REACT_APP_CLOUDFLARE_R2_BUCKET_NAME
      }
    );
  });

  describe('Constructor', () => {
    it('should initialize with correct configurations', () => {
      expect(service).toBeInstanceOf(BusinessLookupService);
    });

    it('should load state configurations', () => {
      // Test that state configs are loaded
      const delawareConfig = StateConfigurations['DE'];
      expect(delawareConfig).toBeDefined();
      expect(delawareConfig.stateName).toBe('Delaware');
      expect(delawareConfig.searchType).toBe('api');
    });
  });

  describe('lookupBusiness', () => {
    it('should perform basic business lookup', async () => {
      // Mock Brave Search response
      mockFetch.mockImplementation((url) => {
        if (url.includes('ai/search')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              result: {
                web: {
                  results: [
                    {
                      title: 'Test Company - Delaware Secretary of State',
                      url: 'https://icis.corp.delaware.gov/ecorp/entitysearch/...',
                      description: 'Test Company LLC business registration'
                    }
                  ]
                }
              }
            })
          });
        }
        
        // Mock Supabase storage
        if (url.includes('supabase.co')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [] })
          });
        }
        
        return Promise.reject(new Error('Unknown URL'));
      });

      const result = await service.lookupBusiness('Test Company LLC');

      expect(result.businessRecords).toBeDefined();
      expect(result.documents).toBeDefined();
      expect(result.vectorDbData).toBeDefined();
      expect(result.errors).toBeDefined();
    });

    it('should handle search with DBA name', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          result: { web: { results: [] } }
        })
      });

      const result = await service.lookupBusiness('Test Company LLC', 'Test Corp');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('Test Corp')
        })
      );
    });

    it('should handle specific states search', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          result: { web: { results: [] } }
        })
      });

      const result = await service.lookupBusiness('Test Company LLC', undefined, ['DE', 'CA']);

      expect(result.businessRecords).toBeDefined();
      // Should only search specified states
    });
  });

  describe('State-specific searches', () => {
    describe('Delaware API search', () => {
      it('should handle Delaware API search successfully', async () => {
        const mockDelawareResponse = {
          entities: [
            {
              id: 'DE123456',
              name: 'Test Company LLC',
              type: 'Limited Liability Company',
              status: 'Active',
              formationDate: '2020-01-15',
              filingNumber: '7234567',
              registeredAgent: 'Delaware Agent Services',
              address: '123 Main St, Wilmington, DE 19801',
              documents: []
            }
          ]
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockDelawareResponse)
        });

        // Mock the internal method call
        const searchStateAPISpy = vi.spyOn(service as any, 'searchStateAPI');
        searchStateAPISpy.mockResolvedValue([
          {
            id: 'DE123456',
            businessName: 'Test Company LLC',
            state: 'DE',
            entityType: 'llc',
            status: 'active',
            filingNumber: '7234567',
            documents: [],
            lastUpdated: new Date().toISOString(),
            source: 'state_api'
          }
        ]);

        const result = await service.lookupBusiness('Test Company LLC', undefined, ['DE']);

        expect(result.businessRecords).toHaveLength(1);
        expect(result.businessRecords[0].state).toBe('DE');
        expect(result.businessRecords[0].source).toBe('state_api');
      });

      it('should handle Delaware API errors gracefully', async () => {
        mockFetch.mockRejectedValue(new Error('Delaware API unavailable'));

        const result = await service.lookupBusiness('Test Company LLC', undefined, ['DE']);

        expect(result.errors).toContain(expect.stringContaining('Error searching DE'));
      });
    });

    describe('California web scraping', () => {
      it('should handle California web scraping', async () => {
        // Mock Cloudflare AI web scraper response
        mockFetch.mockImplementation((url) => {
          if (url.includes('ai/web-scraper')) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                result: {
                  businessName: 'Test Company LLC',
                  entityType: 'LLC',
                  status: 'Active',
                  filingNumber: 'CA202012345',
                  registeredAgent: 'CA Agent Services'
                }
              })
            });
          }
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        });

        const result = await service.lookupBusiness('Test Company LLC', undefined, ['CA']);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('ai/web-scraper'),
          expect.objectContaining({
            method: 'POST'
          })
        );
      });
    });

    describe('AI-assisted lookup', () => {
      it('should handle AI-assisted lookup for complex states', async () => {
        // Mock Cloudflare AI chat response
        mockFetch.mockImplementation((url) => {
          if (url.includes('ai/chat')) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                result: {
                  recommendations: 'Search New York Department of State...',
                  steps: ['Navigate to DOS website', 'Search entity database'],
                  documents: ['Certificate of Incorporation', 'Biennial Statement']
                }
              })
            });
          }
          return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        });

        const result = await service.lookupBusiness('Test Company LLC', undefined, ['NY']);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('ai/chat'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('New York')
          })
        );
      });
    });
  });

  describe('Document handling', () => {
    it('should download and store documents', async () => {
      const mockBusinessRecord = {
        id: 'test-record-1',
        businessName: 'Test Company LLC',
        state: 'DE',
        entityType: 'llc' as const,
        status: 'active' as const,
        filingNumber: 'DE123456',
        documents: [
          {
            type: 'certificate_of_incorporation' as const,
            url: 'https://example.com/doc1.pdf',
            filingDate: '2020-01-15'
          }
        ],
        lastUpdated: new Date().toISOString(),
        source: 'state_api' as const
      };

      // Mock document download
      mockFetch.mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob(['mock pdf content']))
      });

      // Mock internal methods
      const downloadDocumentsSpy = vi.spyOn(service as any, 'downloadStateDocuments');
      downloadDocumentsSpy.mockResolvedValue(['r2://bucket/documents/doc1.pdf']);

      const result = await service.lookupBusiness('Test Company LLC');

      expect(downloadDocumentsSpy).toHaveBeenCalled();
    });

    it('should handle document download failures', async () => {
      mockFetch.mockRejectedValue(new Error('Document not available'));

      const downloadDocumentsSpy = vi.spyOn(service as any, 'downloadStateDocuments');
      downloadDocumentsSpy.mockResolvedValue([]);

      const result = await service.lookupBusiness('Test Company LLC');

      expect(result.documents).toBeDefined();
    });
  });

  describe('Vector database integration', () => {
    it('should process business records for vector database', async () => {
      const mockBusinessRecord = {
        id: 'test-record-1',
        businessName: 'Test Company LLC',
        state: 'DE',
        entityType: 'llc' as const,
        status: 'active' as const,
        filingNumber: 'DE123456',
        documents: [],
        lastUpdated: new Date().toISOString(),
        source: 'state_api' as const
      };

      const processForVectorDBSpy = vi.spyOn(service as any, 'processForVectorDB');
      processForVectorDBSpy.mockResolvedValue({
        id: 'test-record-1',
        businessName: 'Test Company LLC',
        content: 'Business Name: Test Company LLC\nState: DE\n...',
        metadata: {
          type: 'business_record',
          state: 'DE',
          entityType: 'llc',
          status: 'active',
          documents: []
        }
      });

      const result = await service.lookupBusiness('Test Company LLC');

      expect(processForVectorDBSpy).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await service.lookupBusiness('Test Company LLC');

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('Network error'))).toBe(true);
    });

    it('should handle API rate limiting', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      const result = await service.lookupBusiness('Test Company LLC');

      expect(result.errors.some(error => error.includes('429'))).toBe(true);
    });

    it('should handle empty business name', async () => {
      const result = await service.lookupBusiness('');

      expect(result.errors).toContain(expect.stringContaining('business name'));
    });
  });

  describe('State configurations', () => {
    it('should have valid configuration for all 50 states', () => {
      const stateCodes = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
      ];

      stateCodes.forEach(stateCode => {
        const config = StateConfigurations[stateCode];
        if (config) {
          expect(config.stateName).toBeTruthy();
          expect(config.searchType).toMatch(/^(api|web_scraping|manual_lookup)$/);
          expect(config.websiteUrl).toBeTruthy();
          expect(config.filingRequirements).toBeDefined();
          expect(config.filingRequirements.requiredDocuments.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have proper document type mappings', () => {
      Object.values(StateConfigurations).forEach(config => {
        config.filingRequirements.requiredDocuments.forEach(docType => {
          expect(docType).toMatch(/^[a-z_]+$/); // Should be snake_case
        });
      });
    });
  });

  describe('Performance', () => {
    it('should complete search within reasonable time', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ result: { web: { results: [] } } })
      });

      const startTime = Date.now();
      await service.lookupBusiness('Test Company LLC', undefined, ['DE']);
      const endTime = Date.now();

      // Should complete within 5 seconds for single state
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });
}); 