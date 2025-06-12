import { environment, getBraveSearchHeaders } from '../config/environment';

// Types for Brave Search API responses
export interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  extra_snippets?: string[];
  age?: string;
  language?: string;
  profile?: {
    name: string;
    url: string;
  };
}

export interface BraveWebSearchResponse {
  query: {
    original: string;
    show_strict_warning: boolean;
    altered?: string;
  };
  mixed: {
    type: string;
    main: BraveSearchResult[];
    top: BraveSearchResult[];
    side: BraveSearchResult[];
  };
  web: {
    type: string;
    results: BraveSearchResult[];
    family_friendly: boolean;
  };
  news?: {
    type: string;
    results: Array<{
      title: string;
      url: string;
      description: string;
      age: string;
      meta_url: {
        scheme: string;
        netloc: string;
        hostname: string;
        favicon: string;
        path: string;
      };
    }>;
  };
  infobox?: {
    type: string;
    position: number;
    label: string;
    category: string;
    long_desc: string;
    thumbnail: {
      src: string;
      original: string;
      logo: boolean;
    };
    attributes: Array<{
      label: string;
      value: string;
    }>;
  };
}

export interface SearchOptions {
  count?: number; // Number of results (1-20, default: 10)
  offset?: number; // Pagination offset
  safesearch?: 'strict' | 'moderate' | 'off'; // Default: moderate
  search_lang?: string; // Language code (e.g., 'en')
  country?: string; // Country code (e.g., 'US')
  units?: 'metric' | 'imperial'; // Default: metric
  result_filter?: 'web' | 'news' | 'images' | 'videos'; // Filter results
  freshness?: 'pd' | 'pw' | 'pm' | 'py'; // Past day/week/month/year
  text_decorations?: boolean; // Include text decorations
  spellcheck?: boolean; // Enable spellcheck
  usePublicApi?: boolean; // Use public API key vs private
}

export interface FinancialSearchQuery {
  customerName?: string;
  businessName?: string;
  ein?: string;
  address?: string;
  query: string;
  context: 'credit_check' | 'business_verification' | 'news_research' | 'compliance_check';
}

export class WebSearchService {
  private readonly baseUrl = 'https://api.search.brave.com/res/v1';
  private readonly publicBaseUrl = 'https://api.search.brave.com/res/v1';

  constructor() {
    // Validate API keys are configured
    if (!environment.braveSearch.apiKey && !environment.braveSearch.publicApiKey) {
      console.warn('Brave Search API keys not configured');
    }
  }

  /**
   * Perform a general web search using Brave Search API
   */
  async search(query: string, options: SearchOptions = {}): Promise<BraveWebSearchResponse> {
    try {
      const {
        count = 10,
        offset = 0,
        safesearch = 'moderate',
        search_lang = 'en',
        country = 'US',
        units = 'metric',
        result_filter,
        freshness,
        text_decorations = true,
        spellcheck = true,
        usePublicApi = false,
      } = options;

      const baseUrl = usePublicApi ? this.publicBaseUrl : this.baseUrl;
      const headers = getBraveSearchHeaders(usePublicApi);

      const params = new URLSearchParams({
        q: query,
        count: count.toString(),
        offset: offset.toString(),
        safesearch,
        search_lang,
        country,
        units,
        text_decorations: text_decorations.toString(),
        spellcheck: spellcheck.toString(),
      });

      if (result_filter) params.append('result_filter', result_filter);
      if (freshness) params.append('freshness', freshness);

      const response = await fetch(`${baseUrl}/web/search?${params}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Web search failed:', error);
      throw new Error(
        `Web search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Search for financial/business information
   */
  async searchFinancialInfo(searchQuery: FinancialSearchQuery): Promise<BraveWebSearchResponse> {
    const { customerName, businessName, ein, address, query, context } = searchQuery;

    // Build enhanced search query based on context
    let enhancedQuery = query;

    if (context === 'business_verification' && businessName) {
      enhancedQuery = `"${businessName}" business verification`;
      if (ein) enhancedQuery += ` EIN ${ein}`;
      if (address) enhancedQuery += ` "${address}"`;
    } else if (context === 'credit_check' && (customerName || businessName)) {
      const entityName = businessName || customerName;
      enhancedQuery = `"${entityName}" credit rating financial information`;
    } else if (context === 'news_research') {
      const entityName = businessName || customerName;
      enhancedQuery = `"${entityName}" news financial business`;
    } else if (context === 'compliance_check') {
      const entityName = businessName || customerName;
      enhancedQuery = `"${entityName}" regulatory compliance violations sanctions`;
    }

    // Use appropriate search options for financial research
    const searchOptions: SearchOptions = {
      count: 15,
      safesearch: 'off', // Financial research may need access to all content
      freshness: context === 'news_research' ? 'pm' : undefined, // Recent news for news research
      text_decorations: true,
      spellcheck: true,
    };

    return await this.search(enhancedQuery, searchOptions);
  }

  /**
   * Search for recent news about a business or individual
   */
  async searchNews(entity: string, daysBack = 30): Promise<BraveWebSearchResponse> {
    const newsQuery = `"${entity}" news`;

    const freshness = daysBack <= 1 ? 'pd' : daysBack <= 7 ? 'pw' : daysBack <= 30 ? 'pm' : 'py';

    return await this.search(newsQuery, {
      count: 20,
      result_filter: 'news',
      freshness,
      safesearch: 'off',
    });
  }

  /**
   * Search for business verification information
   */
  async verifyBusiness(
    businessName: string,
    ein?: string,
    address?: string,
  ): Promise<{
    searchResults: BraveWebSearchResponse;
    verificationScore: number;
    verificationFactors: string[];
  }> {
    const searchResults = await this.searchFinancialInfo({
      businessName,
      ein,
      address,
      query: `${businessName} business verification`,
      context: 'business_verification',
    });

    // Calculate verification score based on search results
    let verificationScore = 0;
    const verificationFactors: string[] = [];

    const results = searchResults.web?.results || [];

    // Check for official business registrations
    const officialSources = results.filter(
      result =>
        result.url.includes('gov') ||
        result.url.includes('sos.') ||
        result.url.includes('business.') ||
        result.url.includes('corporation'),
    );

    if (officialSources.length > 0) {
      verificationScore += 30;
      verificationFactors.push('Official government records found');
    }

    // Check for business directory listings
    const businessDirectories = results.filter(
      result =>
        result.url.includes('bbb.org') ||
        result.url.includes('yellowpages') ||
        result.url.includes('yelp') ||
        result.url.includes('google.com/maps'),
    );

    if (businessDirectories.length > 0) {
      verificationScore += 20;
      verificationFactors.push('Business directory listings found');
    }

    // Check for news mentions
    const newsResults = results.filter(
      result => result.url.includes('news') || result.description?.toLowerCase().includes('news'),
    );

    if (newsResults.length > 0) {
      verificationScore += 15;
      verificationFactors.push('News coverage found');
    }

    // Check for social media presence
    const socialMedia = results.filter(
      result =>
        result.url.includes('facebook') ||
        result.url.includes('linkedin') ||
        result.url.includes('twitter') ||
        result.url.includes('instagram'),
    );

    if (socialMedia.length > 0) {
      verificationScore += 10;
      verificationFactors.push('Social media presence found');
    }

    // Check for multiple web references
    if (results.length >= 10) {
      verificationScore += 15;
      verificationFactors.push('Multiple web references found');
    } else if (results.length >= 5) {
      verificationScore += 10;
      verificationFactors.push('Several web references found');
    }

    // Check for EIN verification if provided
    if (ein && results.some(result => result.description?.includes(ein))) {
      verificationScore += 10;
      verificationFactors.push('EIN number verified in search results');
    }

    return {
      searchResults,
      verificationScore: Math.min(verificationScore, 100),
      verificationFactors,
    };
  }

  /**
   * Search for compliance and regulatory information
   */
  async checkCompliance(
    entity: string,
    type: 'business' | 'individual' = 'business',
  ): Promise<{
    searchResults: BraveWebSearchResponse;
    riskFactors: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const complianceQuery =
      type === 'business'
        ? `"${entity}" regulatory violations sanctions fines penalties`
        : `"${entity}" criminal background sanctions violations`;

    const searchResults = await this.search(complianceQuery, {
      count: 20,
      safesearch: 'off',
      freshness: 'py', // Past year for recent compliance issues
    });

    const results = searchResults.web?.results || [];
    const riskFactors: string[] = [];
    let riskScore = 0;

    // Check for regulatory violations
    const regulatoryKeywords = [
      'violation',
      'fine',
      'penalty',
      'sanction',
      'enforcement',
      'cease and desist',
    ];
    const regulatoryResults = results.filter(result =>
      regulatoryKeywords.some(
        keyword =>
          result.title.toLowerCase().includes(keyword) ||
          result.description?.toLowerCase().includes(keyword),
      ),
    );

    if (regulatoryResults.length > 0) {
      riskScore += regulatoryResults.length * 10;
      riskFactors.push(`${regulatoryResults.length} regulatory-related results found`);
    }

    // Check for legal issues
    const legalKeywords = ['lawsuit', 'litigation', 'court', 'legal action', 'bankruptcy'];
    const legalResults = results.filter(result =>
      legalKeywords.some(
        keyword =>
          result.title.toLowerCase().includes(keyword) ||
          result.description?.toLowerCase().includes(keyword),
      ),
    );

    if (legalResults.length > 0) {
      riskScore += legalResults.length * 8;
      riskFactors.push(`${legalResults.length} legal-related results found`);
    }

    // Check for news coverage of negative events
    const negativeKeywords = ['scandal', 'fraud', 'investigation', 'arrest', 'indictment'];
    const negativeResults = results.filter(result =>
      negativeKeywords.some(
        keyword =>
          result.title.toLowerCase().includes(keyword) ||
          result.description?.toLowerCase().includes(keyword),
      ),
    );

    if (negativeResults.length > 0) {
      riskScore += negativeResults.length * 15;
      riskFactors.push(`${negativeResults.length} negative news results found`);
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore >= 50) {
      riskLevel = 'high';
    } else if (riskScore >= 20) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    if (riskFactors.length === 0) {
      riskFactors.push('No significant risk factors found in search results');
    }

    return {
      searchResults,
      riskFactors,
      riskLevel,
    };
  }

  /**
   * Extract structured information from search results
   */
  extractBusinessInfo(searchResults: BraveWebSearchResponse): {
    businessName?: string;
    address?: string;
    phone?: string;
    website?: string;
    industry?: string;
    description?: string;
  } {
    const results = searchResults.web?.results || [];
    const info: any = {};

    // Extract information from infobox if available
    if (searchResults.infobox) {
      info.businessName = searchResults.infobox.label;
      info.description = searchResults.infobox.long_desc;

      searchResults.infobox.attributes?.forEach(attr => {
        if (attr.label.toLowerCase().includes('address')) {
          info.address = attr.value;
        } else if (attr.label.toLowerCase().includes('phone')) {
          info.phone = attr.value;
        } else if (attr.label.toLowerCase().includes('website')) {
          info.website = attr.value;
        } else if (attr.label.toLowerCase().includes('industry')) {
          info.industry = attr.value;
        }
      });
    }

    // Extract from top results
    if (results.length > 0) {
      const topResult = results[0];
      if (!info.website && topResult.url) {
        info.website = topResult.url;
      }
      if (!info.description && topResult.description) {
        info.description = topResult.description;
      }
    }

    return info;
  }

  /**
   * Get API usage status and remaining quota
   */
  async getApiStatus(usePublicApi = false): Promise<{
    status: 'active' | 'limited' | 'exceeded';
    remaining?: number;
    resetTime?: Date;
  }> {
    try {
      const headers = getBraveSearchHeaders(usePublicApi);
      const baseUrl = usePublicApi ? this.publicBaseUrl : this.baseUrl;

      // Make a minimal search to check API status
      const response = await fetch(`${baseUrl}/web/search?q=test&count=1`, {
        method: 'GET',
        headers,
      });

      const remaining = response.headers.get('X-RateLimit-Remaining');
      const resetTime = response.headers.get('X-RateLimit-Reset');

      if (response.status === 429) {
        return {
          status: 'exceeded',
          remaining: 0,
          resetTime: resetTime ? new Date(parseInt(resetTime) * 1000) : undefined,
        };
      } else if (response.ok) {
        return {
          status: 'active',
          remaining: remaining ? parseInt(remaining) : undefined,
          resetTime: resetTime ? new Date(parseInt(resetTime) * 1000) : undefined,
        };
      } else {
        return {
          status: 'limited',
          remaining: remaining ? parseInt(remaining) : undefined,
        };
      }
    } catch (error) {
      console.error('API status check failed:', error);
      return { status: 'limited' };
    }
  }
}

// Singleton instance
export const webSearchService = new WebSearchService();
export default webSearchService;
