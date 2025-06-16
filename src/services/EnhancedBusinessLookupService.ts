import { BusinessRecord, EntityType, RegisteredAgent } from '../types/businessLookup';
import { BusinessLookupService } from './BusinessLookupService';

export interface EnhancedBusinessRecord extends BusinessRecord {
  // Additional fields for enhanced lookup
  website?: string;
  phoneNumbers?: PhoneNumber[];
  owners?: OwnerInfo[];
  filingLocation?: FilingLocation;
  publicCompanyInfo?: PublicCompanyInfo;
  aggregatedScore?: number;
  dataCompleteness?: number;
}

export interface PhoneNumber {
  number: string;
  type: 'main' | 'support' | 'sales' | 'fax' | 'other';
  verified: boolean;
  source: string;
}

export interface OwnerInfo {
  fullName: string;
  title?: string;
  ownershipPercentage?: number;
  contactInfo?: {
    email?: string;
    phone?: string;
    linkedIn?: string;
    address?: string;
  };
  verificationStatus?: 'verified' | 'unverified' | 'pending';
}

export interface FilingLocation {
  dbaFilings?: Array<{
    county: string;
    state: string;
    filingDate: string;
    dbaName: string;
    filingNumber?: string;
  }>;
  stateFilings?: Array<{
    state: string;
    secretaryOfState: string;
    filingType: string;
    filingDate: string;
    status: string;
  }>;
}

export interface PublicCompanyInfo {
  isPublic: boolean;
  ticker?: string;
  cik?: string;
  exchange?: string;
  marketCap?: number;
  secFilings?: Array<{
    type: string;
    date: string;
    url: string;
    description: string;
  }>;
}

export interface SECFilingData {
  companyName: string;
  cik: string;
  filings: Array<{
    formType: string;
    filingDate: string;
    url: string;
  }>;
}

export interface ContactInformation {
  website?: string;
  phoneNumbers?: PhoneNumber[];
  emails?: string[];
  socialMedia?: Record<string, string>;
  owners?: OwnerInfo[];
}

export interface BusinessLookupParams {
  businessLegalName: string;
  doingBusinessAs?: string[];
  tradenames?: string[];
  searchAllStates?: boolean;
  specificStates?: string[];
  includePublicFilings?: boolean;
  includeContactInfo?: boolean;
  customerId?: string;
}

export interface AggregatedBusinessData {
  primaryBusinessInfo: {
    legalName: string;
    dbas: string[];
    tradenames: string[];
    primaryState: string;
    incorporationDate: string;
    entityType: string;
  };
  registrations: Array<{
    state: string;
    status: string;
    filingNumber: string;
    filingDate: string;
    registrationType: string;
  }>;
  contactInformation: {
    websites: string[];
    phoneNumbers: PhoneNumber[];
    emails: string[];
    socialMedia: Record<string, string>;
  };
  ownership: OwnerInfo[];
  filingLocations: FilingLocation;
  publicCompanyInfo?: SECFilingData;
}

export type DBAFiling = {
  county: string;
  state: string;
  filingDate: string;
  dbaName: string;
  filingNumber?: string;
};

export type StateFiling = {
  state: string;
  secretaryOfState: string;
  filingType: string;
  filingDate: string;
  status: string;
};

interface EnhancedLookupConfig {
  eSecretaryOfStateApiKey?: string;
  secEdgarApiKey?: string;
  webSearchApiKey?: string;
}

export class EnhancedBusinessLookupService {
  private businessLookupService: BusinessLookupService;
  private config: EnhancedLookupConfig;

  constructor(businessLookupService: BusinessLookupService, config: EnhancedLookupConfig) {
    this.businessLookupService = businessLookupService;
    this.config = config;
  }

  async performEnhancedLookup(params: {
    businessLegalName: string;
    doingBusinessAs?: string[];
    tradenames?: string[];
    baseResults?: BusinessRecord[];
    searchAllStates?: boolean;
    specificStates?: string[];
  }): Promise<{ records: EnhancedBusinessRecord[]; errors: string[] }> {
    const enhancedRecords: EnhancedBusinessRecord[] = [];
    const errors: string[] = [];

    try {
      // Step 1: Search e-Secretary of State for all 50 states
      const eSecretaryResults = await this.searchESecretaryOfState(
        params.businessLegalName,
        params.doingBusinessAs,
        params.searchAllStates !== false,
      );

      // Step 2: Enhance each record with additional data
      for (const baseRecord of eSecretaryResults) {
        const enhanced = await this.enhanceBusinessRecord(baseRecord, params);
        enhancedRecords.push(enhanced);
      }

      // Step 3: De-duplicate and merge records
      const mergedRecords = this.mergeAndDeduplicateRecords(enhancedRecords);

      return { records: mergedRecords, errors };
    } catch (error) {
      errors.push(
        `Enhanced lookup error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return { records: enhancedRecords, errors };
    }
  }

  private async searchESecretaryOfState(
    businessName: string,
    dbas?: string[],
    searchAllStates: boolean = true,
  ): Promise<BusinessRecord[]> {
    const records: BusinessRecord[] = [];
    const searchNames = [businessName, ...(dbas || [])];

    // API endpoint for e-Secretary of State
    const baseUrl = process.env.REACT_APP_API_URL || "https://www.e-secretaryofstate.com/api/v1";

    for (const searchName of searchNames) {
      try {
        // Search across all states
        const response = await fetch(`${baseUrl}/business-search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.eSecretaryOfStateApiKey}`,
          },
          body: JSON.stringify({
            businessName: searchName,
            searchAllStates,
            includeInactive: true,
            includeDBAs: true,
          }),
        });

        if (response.ok) {
          const data = await response.json() as { results?: any[] };

          // Convert e-Secretary format to our format
          for (const result of data.results || []) {
            const registeredAgent: RegisteredAgent | undefined = result.registeredAgent
              ? {
                  name: result.registeredAgent.name,
                  address: result.registeredAgent.address,
                  type: 'entity', // Assuming e-secretary only returns entity agents
                }
              : undefined;

            const record: BusinessRecord = {
              id: `${result.state}-${result.filingNumber}-${Date.now()}`,
              businessName: result.businessName,
              dbaName: result.dbaName,
              entityType: this.mapEntityType(result.entityType),
              filingNumber: result.filingNumber,
              status: this.mapStatus(result.status),
              state: result.state,
              formationDate: result.formationDate
                ? new Date(result.formationDate).toISOString()
                : undefined,
              registeredAgent: registeredAgent,
              documents: [],
              lastUpdated: new Date().toISOString(),
              source: 'state_api',
            };

            records.push(record);
          }
        }
      } catch (error) {
        console.error(`Error searching e-Secretary for ${searchName}:`, error);
      }
    }

    return records;
  }

  async searchSECEdgar(businessName: string): Promise<PublicCompanyInfo | undefined> {
    try {
      const secBaseUrl = process.env.REACT_APP_SEC_API_URL || "https://data.sec.gov/api/xbrl/companyfacts";

      // First, search for company by name to get CIK
      const searchResponse = await fetch(
        `https://www.sec.gov/cgi-bin/browse-edgar?company=${encodeURIComponent(businessName)}&output=json`,
        {
          headers: {
            'User-Agent': 'EVA Finance AI (contact@evafinance.ai)',
          },
        },
      );

      if (!searchResponse.ok) {
        return undefined;
      }

      const searchData = await searchResponse.json() as { results?: any[] };

      if (!searchData.results || searchData.results.length === 0) {
        return undefined;
      }

      const company = searchData.results[0];
      const cik = company.cik.padStart(10, '0');

      // Get recent filings
      const filingsResponse = await fetch(`https://data.sec.gov/submissions/CIK${cik}.json`, {
        headers: {
          'User-Agent': 'EVA Finance AI (contact@evafinance.ai)',
        },
      });

      if (!filingsResponse.ok) {
        return undefined;
      }

      const filingsData = await filingsResponse.json() as { tickers?: string[]; exchanges?: string[]; filings?: any };

      return {
        isPublic: true,
        ticker: filingsData.tickers?.[0],
        cik: cik,
        exchange: filingsData.exchanges?.[0],
        secFilings:
          filingsData.filings?.recent?.form?.slice(0, 10).map((form: string, index: number) => ({
            type: form,
            date: filingsData.filings.recent.filingDate[index],
            url: `https://www.sec.gov/Archives/edgar/data/${cik.replace(/^0+/, '')}/${filingsData.filings.recent.accessionNumber[index].replace(/-/g, '')}/${filingsData.filings.recent.primaryDocument[index]}`,
            description: filingsData.filings.recent.primaryDocDescription[index],
          })) || [],
      };
    } catch (error) {
      console.error('SEC EDGAR search error:', error);
      return undefined;
    }
  }

  /*
  async gatherContactInformation(
    businessName: string,
    records: BusinessRecord[]
  ): Promise<{
    website?: string;
    phoneNumbers?: PhoneNumber[];
    emails?: string[];
    socialMedia?: Record<string, string>;
  }> {
    const query = `contact information for ${businessName}`;
    const results = await this.webSearchService.searchBrave(query);

    if (!results || !results.web || !results.web.results || results.web.results.length === 0) {
      return { website: undefined, phoneNumbers: [], emails: [], socialMedia: {} };
    }

    const snippets = results.web.results.map(r => r.snippet).join(' ');

    const websiteMatch = snippets.match(/(?:website|site):\s*(https?:\/\/[^\s]+)/i);
    const website = websiteMatch ? websiteMatch[1] : undefined;

    const phoneMatches = [...snippets.matchAll(/\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g)];
    const phoneNumbers: PhoneNumber[] = phoneMatches.map(m => ({
      number: `(${m[1]}) ${m[2]}-${m[3]}`,
      type: 'other',
      verified: false,
      source: 'web-search',
    }));

    const emailMatches = [...snippets.matchAll(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g)];
    const emails = emailMatches.map(m => m[0]);

    return { website, phoneNumbers, emails, socialMedia: {} };
  }


  private async searchForOwners(
    businessName: string,
    records: BusinessRecord[]
  ): Promise<OwnerInfo[]> {
    const query = `who are the owners or executives of ${businessName}`;
    const searchResults = await this.webSearchService.searchBrave(query);
    const owners: OwnerInfo[] = [];

    if (!searchResults || !searchResults.web || !searchResults.web.results || searchResults.web.results.length === 0) {
        return owners;
    }
    
    const snippets = searchResults.web.results.map(r => r.snippet).join(' ');

    const nameMatches = [...snippets.matchAll(/(?:CEO|President|Founder|Owner|Director|Chairman|CFO|CTO|COO)(?:\s+(?:and|&)\s+)?(?:is|:)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g)];
    for (const match of nameMatches) {
      const contactQuery = `contact information for ${match[1]} at ${businessName}`;
      const contactResults = await this.webSearchService.searchBrave(contactQuery);
      let ownerInfo: OwnerInfo = { fullName: match[1], verificationStatus: 'unverified' };

      if (contactResults && contactResults.web && contactResults.web.results && contactResults.web.results.length > 0) {
        const contactSnippets = contactResults.web.results.map(r => r.snippet).join(' ');
        const linkedInMatch = contactSnippets.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/);
        const emailMatch = contactSnippets.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        
        ownerInfo = {
          ...ownerInfo,
          contactInfo: {
            linkedIn: linkedInMatch ? `https://linkedin.com/in/${linkedInMatch[1]}` : undefined,
            email: emailMatch ? emailMatch[0] : undefined,
          }
        };
      }
      owners.push(ownerInfo);
    }

    return owners;
  }
  */

  private async enhanceBusinessRecord(
    baseRecord: BusinessRecord,
    _params: Record<string, unknown>,
  ): Promise<EnhancedBusinessRecord> {
    const enhanced: EnhancedBusinessRecord = { ...baseRecord };

    // Add filing location information
    enhanced.filingLocation = {
      stateFilings: [
        {
          state: baseRecord.state,
          secretaryOfState: `${baseRecord.state} Secretary of State`,
          filingType: baseRecord.entityType,
          filingDate: baseRecord.formationDate || 'Unknown',
          status: baseRecord.status,
        },
      ],
    };

    // If it's a DBA, add county filing information
    if (baseRecord.dbaName) {
      enhanced.filingLocation.dbaFilings = [
        {
          county: 'Various', // Would need county-level search
          state: baseRecord.state,
          filingDate: baseRecord.formationDate || 'Unknown',
          dbaName: baseRecord.dbaName,
        },
      ];
    }

    // Calculate data completeness score
    let completeness = 0;
    const fields = [
      'businessName',
      'entityType',
      'filingNumber',
      'status',
      'state',
      'formationDate',
      'registeredAgent',
      'principalAddress',
      'website',
      'phoneNumbers',
      'owners',
    ];

    fields.forEach(field => {
      if (enhanced[field as keyof EnhancedBusinessRecord]) {
        completeness += 100 / fields.length;
      }
    });

    enhanced.dataCompleteness = Math.round(completeness);

    return enhanced;
  }

  private mergeAndDeduplicateRecords(records: EnhancedBusinessRecord[]): EnhancedBusinessRecord[] {
    const merged = new Map<string, EnhancedBusinessRecord>();

    for (const record of records) {
      const key = `${record.businessName}-${record.state}-${record.entityType}`;

      if (merged.has(key)) {
        // Merge data from duplicate records
        const existing = merged.get(key)!;

        // Merge arrays
        if (record.documents && existing.documents) {
          existing.documents = [...existing.documents, ...record.documents];
        }
        if (record.phoneNumbers && existing.phoneNumbers) {
          existing.phoneNumbers = [...existing.phoneNumbers, ...record.phoneNumbers];
        }
        if (record.owners && existing.owners) {
          existing.owners = [...existing.owners, ...record.owners];
        }

        // Take non-empty values
        existing.website = existing.website || record.website;
        existing.dataCompleteness = Math.max(
          existing.dataCompleteness || 0,
          record.dataCompleteness || 0,
        );
      } else {
        merged.set(key, record);
      }
    }

    return Array.from(merged.values());
  }

  private mapEntityType(type: string): EntityType {
    const upperType = type.toUpperCase();
    const typeMap: Record<string, EntityType> = {
      CORPORATION: 'corporation',
      LLC: 'llc',
      'LIMITED LIABILITY COMPANY': 'llc',
      PARTNERSHIP: 'partnership',
      'SOLE PROPRIETORSHIP': 'sole_proprietorship',
      'LIMITED PARTNERSHIP': 'limited_partnership',
      'LIMITED LIABILITY PARTNERSHIP': 'limited_liability_partnership',
      NONPROFIT: 'nonprofit_corporation',
      COOPERATIVE: 'cooperative',
      'BENEFIT CORPORATION': 'benefit_corporation',
      'PROFESSIONAL CORPORATION': 'professional_corporation',
      'SERIES LLC': 'series_llc',
      'PROFESSIONAL LLC': 'professional_llc',
      'STATUTORY TRUST': 'statutory_trust',
      'BUSINESS TRUST': 'statutory_trust',
      'GENERAL PARTNERSHIP': 'partnership',
    };
    return typeMap[upperType] || 'corporation';
  }

  private mapStatus(status: string): BusinessRecord['status'] {
    const upperStatus = status.toUpperCase();
    const statusMap: Record<string, BusinessRecord['status']> = {
      ACTIVE: 'active',
      'GOOD STANDING': 'active',
      'IN GOOD STANDING': 'active',
      INACTIVE: 'inactive',
      SUSPENDED: 'suspended',
      DISSOLVED: 'dissolved',
      REVOKED: 'revoked',
      WITHDRAWN: 'withdrawn',
      MERGED: 'merged',
      CONVERTED: 'converted',
      'ADMINISTRATIVELY DISSOLVED': 'administratively_dissolved',
      PENDING: 'pending',
      EXPIRED: 'expired',
      FORFEITED: 'forfeited',
      CANCELLED: 'cancelled',
      DELINQUENT: 'delinquent',
    };
    return statusMap[upperStatus] || 'inactive';
  }

  async aggregateBusinessData(params: {
    basicResults: BusinessRecord[];
    enhancedResults: { records: EnhancedBusinessRecord[]; errors: string[] };
    secData?: SECFilingData;
    contactInfo?: ContactInformation;
    params: BusinessLookupParams;
  }): Promise<AggregatedBusinessData> {
    const { enhancedResults, secData, contactInfo } = params;

    return {
      primaryBusinessInfo: {
        legalName: params.params.businessLegalName,
        dbas: params.params.doingBusinessAs || [],
        tradenames: params.params.tradenames || [],
        primaryState: enhancedResults.records[0]?.state || 'Unknown',
        incorporationDate: enhancedResults.records[0]?.formationDate || 'Unknown',
        entityType: enhancedResults.records[0]?.entityType || 'Unknown',
      },
      registrations: enhancedResults.records.map((r: EnhancedBusinessRecord) => ({
        state: r.state,
        status: r.status,
        filingNumber: r.filingNumber,
        filingDate: r.formationDate,
        registrationType: 'domestic', // Would need logic to determine foreign vs domestic
      })),
      contactInformation: {
        websites: contactInfo?.website ? [contactInfo.website] : [],
        phoneNumbers: contactInfo?.phoneNumbers || [],
        emails: contactInfo?.emails || [],
        socialMedia: contactInfo?.socialMedia || {},
      },
      ownership: contactInfo?.owners || [],
      filingLocations: this.aggregateFilingLocations(enhancedResults.records),
      publicCompanyInfo: secData,
    };
  }

  private aggregateFilingLocations(records: EnhancedBusinessRecord[]): FilingLocation {
    const dbaFilings: DBAFiling[] = [];
    const stateFilings: StateFiling[] = [];

    for (const record of records) {
      if (record.filingLocation?.dbaFilings) {
        dbaFilings.push(...record.filingLocation.dbaFilings);
      }
      if (record.filingLocation?.stateFilings) {
        stateFilings.push(...record.filingLocation.stateFilings);
      }
    }

    return { dbaFilings, stateFilings };
  }
}

export {};
