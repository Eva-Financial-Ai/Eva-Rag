import { StateBusinessRegistryConfig, BusinessRecord, DocumentType, StateFilingRequirements } from '../types/businessLookup';
import { debugLog, logError, logBusinessProcess, logSecurityEvent } from '../utils/auditLogger';

// Re-export BusinessRecord
export type { BusinessRecord } from '../types/businessLookup';


interface CloudflareWorkerAIConfig {
  accountId: string;
  apiToken: string;
  endpoint: string;
}

interface BraveSearchConfig {
  apiKey: string;
  endpoint: string;
}

interface SupabaseConfig {
  url: string;
  apiKey: string;
}

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export class BusinessLookupService {
  private cloudflareConfig: CloudflareWorkerAIConfig;
  private braveConfig: BraveSearchConfig;
  private supabaseConfig: SupabaseConfig;
  private r2Config: R2Config;
  private stateConfigs: Map<string, StateBusinessRegistryConfig>;

  constructor(
    cloudflareConfig: CloudflareWorkerAIConfig,
    braveConfig: BraveSearchConfig,
    supabaseConfig: SupabaseConfig,
    r2Config: R2Config
  ) {
    this.cloudflareConfig = cloudflareConfig;
    this.braveConfig = braveConfig;
    this.supabaseConfig = supabaseConfig;
    this.r2Config = r2Config;
    this.stateConfigs = this.initializeStateConfigs();
  }

  /**
   * Comprehensive business lookup across all 50 states
   */
  async lookupBusiness(
    businessName: string,
    dbaName?: string,
    states?: string[]
  ): Promise<{
    businessRecords: BusinessRecord[];
    documents: string[];
    vectorDbData: Record<string, unknown>[];
    errors: string[];
  }> {
    const searchStates = states || this.getAllStatesCodes();
    const results: BusinessRecord[] = [];
    const documents: string[] = [];
    const vectorDbData: Record<string, unknown>[] = [];
    const errors: string[] = [];

    // Phase 1: Use Brave Search to find initial business information
    const braveResults = await this.searchWithBrave(businessName, dbaName);
    
    // Phase 2: Search each state's registry system
    for (const stateCode of searchStates) {
      try {
        const stateConfig = this.stateConfigs.get(stateCode);
        if (!stateConfig) {
          errors.push(`No configuration found for state: ${stateCode}`);
          continue;
        }

        const stateResults = await this.searchStateRegistry(
          stateCode,
          businessName,
          dbaName,
          stateConfig
        );

        if (stateResults.length > 0) {
          results.push(...stateResults);

          // Phase 3: Download documents for each match
          for (const record of stateResults) {
            const recordDocs = await this.downloadStateDocuments(
              stateCode,
              record,
              stateConfig
            );
            documents.push(...recordDocs);

            // Phase 4: Process for vector database
            const vectorData = await this.processForVectorDB(record, recordDocs);
            vectorDbData.push(vectorData);
          }
        }
      } catch (error) {
        errors.push(`Error searching ${stateCode}: ${error.message}`);
      }
    }

    // Phase 5: Store documents in R2 and metadata in Supabase
    await this.storeResults(results, documents, vectorDbData);

    return {
      businessRecords: results,
      documents,
      vectorDbData,
      errors
    };
  }

  /**
   * Search using Brave Search API through Cloudflare Workers AI
   */
  private async searchWithBrave(
    businessName: string,
    dbaName?: string
  ): Promise<any[]> {
    const searchQueries = [
      `"${businessName}" business registration state`,
      `"${businessName}" articles of incorporation`,
      `"${businessName}" secretary of state filing`
    ];

    if (dbaName) {
      searchQueries.push(`"${dbaName}" DBA business registration`);
    }

    const results: Record<string, unknown>[] = [];

    for (const query of searchQueries) {
      try {
        const response = await fetch(`${this.cloudflareConfig.endpoint}/ai/search`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: '@cf/brave/web-search',
            messages: [{
              role: 'user',
              content: query
            }],
            search_params: {
              count: 10,
              safesearch: 'moderate',
              country: 'US'
            }
          })
        });

        const data = await response.json() as { result?: any; entities?: any[] };
        results.push(...(data.result?.web?.results || []));
      } catch (error) {
        console.error(`Brave search error for query "${query}":`, error);
      }
    }

    return results;
  }

  /**
   * Search individual state registry systems
   */
  private async searchStateRegistry(
    stateCode: string,
    businessName: string,
    dbaName: string | undefined,
    config: StateBusinessRegistryConfig
  ): Promise<BusinessRecord[]> {
    const results: BusinessRecord[] = [];

    try {
      switch (config.searchType) {
        case 'api':
          return await this.searchStateAPI(stateCode, businessName, dbaName, config);
        
        case 'web_scraping':
          return await this.searchStateWebsite(stateCode, businessName, dbaName, config);
        
        case 'manual_lookup':
          // For states without automated systems, use AI to help navigate
          return await this.aiAssistedLookup(stateCode, businessName, dbaName, config);
        
        default:
          throw new Error(`Unknown search type: ${config.searchType}`);
      }
    } catch (error) {
      logError('system_error', `Error searching ${stateCode}:`, error);
      return [];
    }
  }

  /**
   * API-based state searches (Delaware, Nevada, etc.)
   */
  private async searchStateAPI(
    stateCode: string,
    businessName: string,
    dbaName: string | undefined,
    config: StateBusinessRegistryConfig
  ): Promise<BusinessRecord[]> {
    const searchTerms = [businessName];
    if (dbaName) searchTerms.push(dbaName);

    const results: BusinessRecord[] = [];

    for (const term of searchTerms) {
      try {
        const response = await fetch(config.apiEndpoint!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...config.apiHeaders
          },
          body: JSON.stringify({
            searchTerm: term,
            searchType: 'entity_name',
            includeInactive: true
          })
        });

        const data = await response.json() as { result?: any; entities?: any[] };
        
        if (data.entities) {
          for (const entity of data.entities) {
            results.push({
              id: entity.id || `${stateCode}-${Date.now()}`,
              businessName: entity.name,
              dbaName: entity.tradeName,
              state: stateCode,
              entityType: entity.type,
              status: entity.status,
              formationDate: entity.formationDate,
              registeredAgent: entity.registeredAgent,
              address: entity.address,
              filingNumber: entity.filingNumber,
              documents: entity.documents || [],
              lastUpdated: new Date().toISOString(),
              source: 'state_api'
            });
          }
        }
      } catch (error) {
        logError('system_error', `API search error for ${stateCode}:`, error);
      }
    }

    return results;
  }

  /**
   * Web scraping for states with searchable websites
   */
  private async searchStateWebsite(
    stateCode: string,
    businessName: string,
    dbaName: string | undefined,
    config: StateBusinessRegistryConfig
  ): Promise<BusinessRecord[]> {
    // Use Cloudflare Workers AI to navigate and scrape state websites
    const response = await fetch(`${this.cloudflareConfig.endpoint}/ai/web-scraper`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: '@cf/web-scraper/business-registry',
        url: config.websiteUrl,
        instructions: `
          Search for business "${businessName}" ${dbaName ? `or DBA "${dbaName}"` : ''}.
          Navigate to the business entity search page.
          Extract all relevant business information including:
          - Legal business name
          - DBA names
          - Entity type
          - Status (active/inactive)
          - Formation date
          - Registered agent
          - Business address
          - Filing number
          - Available documents for download
        `,
        state_requirements: config.filingRequirements
      })
    });

    const data = await response.json() as { result?: any };
    return this.parseWebScrapingResults(stateCode, data.result);
  }

  /**
   * AI-assisted lookup for complex state systems
   */
  private async aiAssistedLookup(
    stateCode: string,
    businessName: string,
    dbaName: string | undefined,
    config: StateBusinessRegistryConfig
  ): Promise<BusinessRecord[]> {
    const prompt = `
      You are a business research specialist with expertise in ${config.stateName} business laws.
      
      Business to research: "${businessName}" ${dbaName ? `(DBA: "${dbaName}")` : ''}
      State: ${config.stateName}
      
      Based on ${config.stateName} business law, please:
      1. Identify the correct government office/department to search
      2. Determine what types of filings this business should have
      3. List the required documents that should be public record
      4. Provide step-by-step instructions for manual lookup
      5. Identify any special requirements or procedures for ${config.stateName}
      
      State-specific requirements: ${JSON.stringify(config.filingRequirements)}
    `;

    const response = await fetch(`${this.cloudflareConfig.endpoint}/ai/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: '@cf/meta/llama-3.2-90b-vision-instruct',
        messages: [{
          role: 'system',
          content: 'You are an expert in business law and public records research across all 50 US states.'
        }, {
          role: 'user',
          content: prompt
        }]
      })
    });

    const data = await response.json() as { result?: any };
    
    // Convert AI recommendations into actionable lookup steps
    return await this.executeAIRecommendations(stateCode, businessName, dbaName, data.result);
  }

  /**
   * Download documents from state registries
   */
  private async downloadStateDocuments(
    stateCode: string,
    record: BusinessRecord,
    config: StateBusinessRegistryConfig
  ): Promise<string[]> {
    const documentUrls: string[] = [];

    try {
      for (const docType of config.filingRequirements.requiredDocuments) {
        const docUrl = await this.findDocumentUrl(stateCode, record, docType, config);
        if (docUrl) {
          const savedPath = await this.downloadAndStoreDocument(
            docUrl,
            stateCode,
            record.filingNumber,
            docType
          );
          documentUrls.push(savedPath);
        }
      }
    } catch (error) {
      logError('system_error', `Error downloading documents for ${stateCode}:`, error);
    }

    return documentUrls;
  }

  /**
   * Store documents in R2 and metadata in Supabase
   */
  private async storeResults(
    records: BusinessRecord[],
    documents: string[],
    vectorData: Record<string, unknown>[]
  ): Promise<void> {
    // Store in Supabase
    try {
      const response = await fetch(`${this.supabaseConfig.url}/rest/v1/business_records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseConfig.apiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(records)
      });

      if (!response.ok) {
        throw new Error(`Supabase storage failed: ${response.statusText}`);
      }
    } catch (error) {
      logError('system_error', 'Error storing records in Supabase:', error);
    }

    // Store vector data for EVA RAG
    for (const vectorItem of vectorData) {
      await this.storeInVectorDB(vectorItem);
    }
  }

  /**
   * Process business data for vector database
   */
  private async processForVectorDB(
    record: BusinessRecord,
    documents: string[]
  ): Promise<any> {
    const documentContents = await Promise.all(
      documents.map(doc => this.extractDocumentText(doc))
    );

    return {
      id: record.id,
      businessName: record.businessName,
      content: [
        `Business Name: ${record.businessName}`,
        `State: ${record.state}`,
        `Entity Type: ${record.entityType}`,
        `Status: ${record.status}`,
        `Formation Date: ${record.formationDate}`,
        `Registered Agent: ${record.registeredAgent}`,
        `Address: ${record.address}`,
        ...documentContents
      ].join('\n'),
      metadata: {
        type: 'business_record',
        state: record.state,
        entityType: record.entityType,
        status: record.status,
        documents: documents
      },
      customerId: null // Will be set when associated with customer
    };
  }

  /**
   * Initialize state-specific configurations
   */
  private initializeStateConfigs(): Map<string, StateBusinessRegistryConfig> {
    const configs = new Map<string, StateBusinessRegistryConfig>();

    // Based on https://www.e-secretaryofstate.com/ data
    
    // Delaware - API available
    configs.set('DE', {
      stateName: 'Delaware',
      searchType: 'api',
      websiteUrl: 'https://icis.corp.delaware.gov',
      apiEndpoint: 'https://corp.delaware.gov/api/entities/search',
      apiHeaders: {
        'User-Agent': 'BusinessLookupTool/1.0'
      },
      filingRequirements: {
        requiredDocuments: [
          'certificate_of_incorporation',
          'annual_report',
          'registered_agent_info'
        ],
        optionalDocuments: [
          'amendments',
          'mergers',
          'dissolutions'
        ],
        fees: {
          incorporation: 89,
          annualReport: 350,
          expeditedService: 1000
        },
        requirements: [
          'Must have Delaware registered agent',
          'Annual franchise tax required',
          'Must file annual report by March 1st'
        ]
      }
    });

    // California - Web scraping
    configs.set('CA', {
      stateName: 'California',
      searchType: 'web_scraping',
      websiteUrl: 'https://bizfileonline.sos.ca.gov',
      filingRequirements: {
        requiredDocuments: [
          'articles_of_incorporation',
          'statement_of_information',
          'registered_agent_info'
        ],
        optionalDocuments: [
          'amendments',
          'certificates_of_status'
        ],
        fees: {
          incorporation: 100,
          statementOfInformation: 25,
          expeditedService: 350
        },
        requirements: [
          'Must file Statement of Information within 90 days',
          'Biennial Statement of Information required',
          'Must maintain California address for service'
        ]
      }
    });

    // New York - Manual lookup required
    configs.set('NY', {
      stateName: 'New York',
      searchType: 'manual_lookup',
      websiteUrl: 'https://appext20.dos.ny.gov/corp_public/CORPSEARCH.ENTITY_SEARCH_ENTRY',
      filingRequirements: {
        requiredDocuments: [
          'certificate_of_incorporation',
          'biennial_statement',
          'registered_agent_info'
        ],
        optionalDocuments: [
          'amendments',
          'certificates_of_authority'
        ],
        fees: {
          incorporation: 125,
          biennialStatement: 9,
          expeditedService: 25
        },
        requirements: [
          'Must file biennial statement',
          'Publication requirement for LLCs',
          'Must maintain New York registered office'
        ]
      }
    });

    // Add configurations for all 50 states based on e-secretaryofstate.com data
    // This would be a comprehensive mapping of all state requirements

    return configs;
  }

  private getAllStatesCodes(): string[] {
    return [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];
  }

  // Additional helper methods...
  private async parseWebScrapingResults(stateCode: string, data: Record<string, unknown>): Promise<BusinessRecord[]> {
    // Implementation for parsing scraped data
    return [];
  }

  private async executeAIRecommendations(
    stateCode: string,
    businessName: string,
    dbaName: string | undefined,
    recommendations: any
  ): Promise<BusinessRecord[]> {
    // Implementation for executing AI recommendations
    return [];
  }

  private async findDocumentUrl(
    stateCode: string,
    record: BusinessRecord,
    docType: DocumentType,
    config: StateBusinessRegistryConfig
  ): Promise<string | null> {
    // Implementation for finding document URLs
    return null;
  }

  private async downloadAndStoreDocument(
    url: string,
    stateCode: string,
    filingNumber: string,
    docType: DocumentType
  ): Promise<string> {
    // Implementation for downloading and storing documents in R2
    return '';
  }

  private async extractDocumentText(documentPath: string): Promise<string> {
    // Implementation for extracting text from documents
    return '';
  }

  private async storeInVectorDB(vectorData: Record<string, unknown>): Promise<void> {
    // Implementation for storing in vector database
  }
} 