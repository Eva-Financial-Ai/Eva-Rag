export type DocumentType = 
  | 'certificate_of_incorporation'
  | 'articles_of_incorporation'
  | 'certificate_of_formation'
  | 'articles_of_organization'
  | 'annual_report'
  | 'biennial_report'
  | 'biennial_statement'
  | 'periodic_report'
  | 'annual_registration'
  | 'statement_of_information'
  | 'registered_agent_info'
  | 'amendments'
  | 'mergers'
  | 'dissolutions'
  | 'certificates_of_status'
  | 'certificates_of_authority'
  | 'franchise_tax_records'
  | 'assumed_name_certificate'
  | 'dba_filing'
  | 'trade_name_registration'
  | 'business_license'
  | 'operating_agreement'
  | 'bylaws'
  | 'shareholder_agreements'
  | 'partnership_agreement'
  | 'stock_certificates'
  | 'board_resolutions';

export type EntityType = 
  | 'corporation'
  | 'llc'
  | 'partnership'
  | 'limited_partnership'
  | 'limited_liability_partnership'
  | 'professional_corporation'
  | 'professional_llc'
  | 'nonprofit_corporation'
  | 'cooperative'
  | 'sole_proprietorship'
  | 'unincorporated_association'
  | 'statutory_trust'
  | 'series_llc'
  | 'public_benefit_corporation'
  | 'benefit_corporation';

export type BusinessStatus = 
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'dissolved'
  | 'merged'
  | 'converted'
  | 'withdrawn'
  | 'expired'
  | 'revoked'
  | 'cancelled'
  | 'pending'
  | 'administratively_dissolved'
  | 'forfeited'
  | 'delinquent';

export type SearchType = 'api' | 'web_scraping' | 'manual_lookup';

export interface BusinessRecord {
  id: string;
  businessName: string;
  dbaName?: string;
  state: string;
  entityType: EntityType;
  status: BusinessStatus;
  formationDate?: string;
  registeredAgent?: RegisteredAgent;
  address?: BusinessAddress;
  filingNumber: string;
  documents: DocumentReference[];
  lastUpdated: string;
  source: 'state_api' | 'web_scraping' | 'manual_entry' | 'brave_search';
  additionalInfo?: {
    officers?: Officer[];
    directors?: Director[];
    managers?: Manager[];
    members?: Member[];
    principalAddress?: BusinessAddress;
    mailingAddress?: BusinessAddress;
    naicsCode?: string;
    sicCode?: string;
    federalTaxId?: string;
    stateTaxId?: string;
    phoneNumber?: string;
    emailAddress?: string;
    website?: string;
    businessPurpose?: string;
    authorizedShares?: number;
    issuedShares?: number;
    parValue?: number;
    franchiseTaxStatus?: string;
    goodStanding?: boolean;
    publicationRequired?: boolean;
    publicationCompleted?: boolean;
  };
}

export interface RegisteredAgent {
  name: string;
  type: 'individual' | 'entity';
  address: BusinessAddress;
  phone?: string;
  email?: string;
}

export interface BusinessAddress {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface Officer {
  name: string;
  title: string;
  address?: BusinessAddress;
  appointmentDate?: string;
}

export interface Director {
  name: string;
  address?: BusinessAddress;
  appointmentDate?: string;
}

export interface Manager {
  name: string;
  address?: BusinessAddress;
  appointmentDate?: string;
}

export interface Member {
  name: string;
  address?: BusinessAddress;
  ownershipPercentage?: number;
  membershipDate?: string;
}

export interface DocumentReference {
  type: DocumentType;
  url?: string;
  filingDate?: string;
  effectiveDate?: string;
  description?: string;
  pages?: number;
  size?: number;
  r2Path?: string;
  supabaseId?: string;
}

export interface StateFilingRequirements {
  requiredDocuments: DocumentType[];
  optionalDocuments: DocumentType[];
  fees: {
    [key: string]: number;
  };
  requirements: string[];
  annualFilings?: {
    type: DocumentType;
    dueDate: string;
    fee: number;
  }[];
  specialRequirements?: {
    publicationRequired?: boolean;
    residencyRequirements?: string[];
    minimumCapitalRequirements?: number;
    specialLicenseRequired?: boolean;
  };
}

export interface StateBusinessRegistryConfig {
  stateName: string;
  searchType: SearchType;
  websiteUrl: string;
  apiEndpoint?: string;
  apiHeaders?: Record<string, string>;
  filingRequirements: StateFilingRequirements;
  searchSelectors?: {
    nameInput?: string;
    searchButton?: string;
    resultsTable?: string;
    entityLink?: string;
    documentLinks?: string[];
  };
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  specialInstructions?: string[];
}

export interface StateRegistryMapping {
  [stateCode: string]: StateBusinessRegistryConfig;
}

// Complete state configurations based on https://www.e-secretaryofstate.com/
export const StateConfigurations: StateRegistryMapping = {
  'AL': {
    stateName: 'Alabama',
    searchType: 'web_scraping',
    websiteUrl: 'http://arc-sos.state.al.us/CGI/CORPNAME.MBR/INPUT',
    filingRequirements: {
      requiredDocuments: ['certificate_of_incorporation', 'annual_report'],
      optionalDocuments: ['amendments', 'mergers'],
      fees: {
        incorporation: 40,
        annualReport: 10
      },
      requirements: [
        'Must file annual report by April 1st',
        'Must maintain registered office in Alabama'
      ]
    }
  },
  'AK': {
    stateName: 'Alaska',
    searchType: 'web_scraping',
    websiteUrl: 'https://www.commerce.alaska.gov/cbp/main/search/entities',
    filingRequirements: {
      requiredDocuments: ['articles_of_incorporation', 'biennial_report'],
      optionalDocuments: ['amendments', 'certificates_of_status'],
      fees: {
        incorporation: 250,
        biennialReport: 100
      },
      requirements: [
        'Must file biennial report by January 2nd of odd years',
        'Must have Alaska registered agent'
      ]
    }
  },
  'AZ': {
    stateName: 'Arizona',
    searchType: 'web_scraping',
    websiteUrl: 'https://ecorp.azcc.gov/EntitySearch/Index',
    filingRequirements: {
      requiredDocuments: ['articles_of_incorporation', 'annual_report'],
      optionalDocuments: ['amendments', 'certificates_of_authority'],
      fees: {
        incorporation: 60,
        annualReport: 45
      },
      requirements: [
        'Must file annual report by anniversary date',
        'Known place of business required'
      ]
    }
  },
  'AR': {
    stateName: 'Arkansas',
    searchType: 'web_scraping',
    websiteUrl: 'https://www.ark.org/corp-search/index.php',
    filingRequirements: {
      requiredDocuments: ['articles_of_incorporation', 'annual_report'],
      optionalDocuments: ['amendments', 'mergers'],
      fees: {
        incorporation: 50,
        annualReport: 150
      },
      requirements: [
        'Must file annual report by May 1st',
        'Must have Arkansas registered agent'
      ]
    }
  },
  'CA': {
    stateName: 'California',
    searchType: 'web_scraping',
    websiteUrl: 'https://bizfileonline.sos.ca.gov/search/business',
    filingRequirements: {
      requiredDocuments: ['articles_of_incorporation', 'statement_of_information'],
      optionalDocuments: ['amendments', 'certificates_of_status'],
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
  },
  'CO': {
    stateName: 'Colorado',
    searchType: 'web_scraping',
    websiteUrl: 'http://www.sos.state.co.us/biz/BusinessEntityCriteriaExt.do',
    filingRequirements: {
      requiredDocuments: ['articles_of_incorporation', 'periodic_report'],
      optionalDocuments: ['amendments', 'dissolutions'],
      fees: {
        incorporation: 50,
        periodicReport: 10
      },
      requirements: [
        'Must file periodic report annually',
        'Must have Colorado registered agent'
      ]
    }
  },
  'CT': {
    stateName: 'Connecticut',
    searchType: 'web_scraping',
    websiteUrl: 'https://service.ct.gov/business/s/onlinebusinesssearch',
    filingRequirements: {
      requiredDocuments: ['certificate_of_incorporation', 'annual_report'],
      optionalDocuments: ['amendments', 'mergers'],
      fees: {
        incorporation: 120,
        annualReport: 75
      },
      requirements: [
        'Must file annual report by March 31st',
        'Must maintain Connecticut registered agent'
      ]
    }
  },
  'DE': {
    stateName: 'Delaware',
    searchType: 'api',
    websiteUrl: 'https://icis.corp.delaware.gov',
    apiEndpoint: 'https://corp.delaware.gov/api/entities/search',
    filingRequirements: {
      requiredDocuments: ['certificate_of_incorporation', 'annual_report'],
      optionalDocuments: ['amendments', 'mergers', 'dissolutions'],
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
  },
  'FL': {
    stateName: 'Florida',
    searchType: 'web_scraping',
    websiteUrl: 'http://search.sunbiz.org/Inquiry/CorporationSearch/ByName',
    filingRequirements: {
      requiredDocuments: ['articles_of_incorporation', 'annual_report'],
      optionalDocuments: ['amendments', 'mergers'],
      fees: {
        incorporation: 35,
        annualReport: 61.25
      },
      requirements: [
        'Must file annual report by May 1st',
        'Must have Florida registered agent'
      ]
    }
  },
  'GA': {
    stateName: 'Georgia',
    searchType: 'web_scraping',
    websiteUrl: 'https://ecorp.sos.ga.gov/BusinessSearch',
    filingRequirements: {
      requiredDocuments: ['articles_of_incorporation', 'annual_registration'],
      optionalDocuments: ['amendments', 'certificates_of_authority'],
      fees: {
        incorporation: 100,
        annualRegistration: 50
      },
      requirements: [
        'Must file annual registration by April 1st',
        'Must maintain Georgia registered office'
      ]
    }
  }
  // ... Continue for all 50 states
};

export interface VectorDBEntry {
  id: string;
  customerId?: string;
  businessName: string;
  content: string;
  embedding?: number[];
  metadata: {
    type: 'business_record';
    state: string;
    entityType: EntityType;
    status: BusinessStatus;
    documents: string[];
    extractionDate: string;
    confidence: number;
  };
}

export interface BusinessLookupResult {
  success: boolean;
  businessRecords: BusinessRecord[];
  documents: DocumentReference[];
  vectorDbEntries: VectorDBEntry[];
  errors: string[];
  searchMetadata: {
    searchTerms: string[];
    statesSearched: string[];
    totalResults: number;
    searchDuration: number;
    braveSearchResults: number;
    stateApiResults: number;
    webScrapingResults: number;
    manualLookupResults: number;
  };
}

export interface R2Document {
  key: string;
  bucket: string;
  url: string;
  size: number;
  contentType: string;
  uploadDate: string;
  metadata: {
    businessId: string;
    state: string;
    documentType: DocumentType;
    filingNumber: string;
    originalUrl?: string;
  };
}

export interface SupabaseBusinessRecord extends Omit<BusinessRecord, 'id'> {
  id?: string;
  created_at?: string;
  updated_at?: string;
  search_vector?: string; // For full-text search
  r2_documents?: R2Document[];
}

export interface CustomerBusinessProfile {
  customerId: string;
  businessRecords: BusinessRecord[];
  documentCount: number;
  lastLookupDate: string;
  autoUpdateEnabled: boolean;
  monitoringStates: string[];
  alertsEnabled: boolean;
  complianceStatus: {
    [state: string]: {
      inGoodStanding: boolean;
      filingsCurrent: boolean;
      upcomingDeadlines: string[];
      overdueFees: number;
    };
  };
} 