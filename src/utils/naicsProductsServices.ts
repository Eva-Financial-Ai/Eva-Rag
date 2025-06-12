// NAICS-based Products and Services Suggestions
// This maps NAICS codes to typical products and services offered by businesses in each industry

export interface ProductServiceSuggestion {
  name: string;
  description: string;
  category: 'product' | 'service';
  priceType: 'fixed' | 'variable' | 'quote';
  tags: string[];
}

export interface NAICSProductService {
  naicsCode: string;
  industryName: string;
  suggestions: ProductServiceSuggestion[];
}

export const naicsProductsServices: Record<string, NAICSProductService> = {
  // Agriculture, Forestry, Fishing and Hunting
  '111': {
    naicsCode: '111',
    industryName: 'Crop Production',
    suggestions: [
      {
        name: 'Organic Produce',
        description: 'Fresh organic vegetables and fruits grown without pesticides',
        category: 'product',
        priceType: 'variable',
        tags: ['organic', 'fresh', 'produce'],
      },
      {
        name: 'Crop Consulting Services',
        description: 'Agricultural consulting for optimal crop yield and soil management',
        category: 'service',
        priceType: 'quote',
        tags: ['consulting', 'agriculture', 'farming'],
      },
      {
        name: 'Seasonal Harvest',
        description: 'Bulk seasonal crops for wholesale distribution',
        category: 'product',
        priceType: 'variable',
        tags: ['wholesale', 'seasonal', 'bulk'],
      },
    ],
  },
  '112': {
    naicsCode: '112',
    industryName: 'Animal Production and Aquaculture',
    suggestions: [
      {
        name: 'Livestock Feed',
        description: 'Premium quality animal feed and nutrition supplements',
        category: 'product',
        priceType: 'fixed',
        tags: ['feed', 'nutrition', 'livestock'],
      },
      {
        name: 'Veterinary Services',
        description: 'On-site veterinary care and health management for livestock',
        category: 'service',
        priceType: 'quote',
        tags: ['veterinary', 'healthcare', 'livestock'],
      },
    ],
  },

  // Construction
  '236': {
    naicsCode: '236',
    industryName: 'Construction of Buildings',
    suggestions: [
      {
        name: 'Commercial Building Construction',
        description: 'Full-service commercial building construction and project management',
        category: 'service',
        priceType: 'quote',
        tags: ['construction', 'commercial', 'building'],
      },
      {
        name: 'Residential Development',
        description: 'Custom home building and residential development services',
        category: 'service',
        priceType: 'quote',
        tags: ['residential', 'homes', 'development'],
      },
      {
        name: 'Green Building Consulting',
        description: 'LEED certification and sustainable building design services',
        category: 'service',
        priceType: 'fixed',
        tags: ['sustainable', 'LEED', 'green building'],
      },
    ],
  },
  '238': {
    naicsCode: '238',
    industryName: 'Specialty Trade Contractors',
    suggestions: [
      {
        name: 'Electrical Installation',
        description: 'Commercial and residential electrical installation services',
        category: 'service',
        priceType: 'quote',
        tags: ['electrical', 'installation', 'wiring'],
      },
      {
        name: 'HVAC Services',
        description: 'Heating, ventilation, and air conditioning installation and maintenance',
        category: 'service',
        priceType: 'variable',
        tags: ['HVAC', 'heating', 'cooling'],
      },
      {
        name: 'Plumbing Solutions',
        description: 'Complete plumbing installation and repair services',
        category: 'service',
        priceType: 'quote',
        tags: ['plumbing', 'pipes', 'water systems'],
      },
    ],
  },

  // Manufacturing
  '311': {
    naicsCode: '311',
    industryName: 'Food Manufacturing',
    suggestions: [
      {
        name: 'Private Label Food Products',
        description: 'Custom food product manufacturing for private labels',
        category: 'product',
        priceType: 'quote',
        tags: ['private label', 'food', 'manufacturing'],
      },
      {
        name: 'Food Safety Consulting',
        description: 'HACCP and food safety compliance consulting services',
        category: 'service',
        priceType: 'fixed',
        tags: ['food safety', 'HACCP', 'compliance'],
      },
      {
        name: 'Packaged Food Products',
        description: 'Ready-to-eat packaged food items for retail distribution',
        category: 'product',
        priceType: 'variable',
        tags: ['packaged', 'retail', 'ready-to-eat'],
      },
    ],
  },
  '333': {
    naicsCode: '333',
    industryName: 'Machinery Manufacturing',
    suggestions: [
      {
        name: 'Industrial Equipment',
        description: 'Custom industrial machinery and equipment manufacturing',
        category: 'product',
        priceType: 'quote',
        tags: ['industrial', 'machinery', 'equipment'],
      },
      {
        name: 'Equipment Maintenance Services',
        description: 'Preventive maintenance and repair services for industrial machinery',
        category: 'service',
        priceType: 'variable',
        tags: ['maintenance', 'repair', 'service contracts'],
      },
      {
        name: 'Automation Solutions',
        description: 'Industrial automation systems and integration services',
        category: 'service',
        priceType: 'quote',
        tags: ['automation', 'systems', 'integration'],
      },
    ],
  },
  '334': {
    naicsCode: '334',
    industryName: 'Computer and Electronic Product Manufacturing',
    suggestions: [
      {
        name: 'Electronic Components',
        description: 'Custom electronic components and circuit board manufacturing',
        category: 'product',
        priceType: 'quote',
        tags: ['electronics', 'components', 'PCB'],
      },
      {
        name: 'IoT Device Development',
        description: 'Internet of Things device design and manufacturing services',
        category: 'service',
        priceType: 'quote',
        tags: ['IoT', 'development', 'smart devices'],
      },
    ],
  },

  // Retail Trade
  '441': {
    naicsCode: '441',
    industryName: 'Motor Vehicle and Parts Dealers',
    suggestions: [
      {
        name: 'New Vehicle Sales',
        description: 'New cars, trucks, and SUVs from multiple manufacturers',
        category: 'product',
        priceType: 'fixed',
        tags: ['vehicles', 'new cars', 'automotive'],
      },
      {
        name: 'Vehicle Financing',
        description: 'Auto loan and lease financing services',
        category: 'service',
        priceType: 'variable',
        tags: ['financing', 'loans', 'leasing'],
      },
      {
        name: 'Extended Warranties',
        description: 'Extended warranty and service protection plans',
        category: 'service',
        priceType: 'fixed',
        tags: ['warranty', 'protection', 'service plans'],
      },
    ],
  },
  '445': {
    naicsCode: '445',
    industryName: 'Food and Beverage Stores',
    suggestions: [
      {
        name: 'Grocery Products',
        description: 'Full range of grocery items including fresh produce and packaged goods',
        category: 'product',
        priceType: 'variable',
        tags: ['grocery', 'food', 'beverages'],
      },
      {
        name: 'Online Grocery Delivery',
        description: 'Same-day grocery delivery service',
        category: 'service',
        priceType: 'fixed',
        tags: ['delivery', 'online', 'convenience'],
      },
      {
        name: 'Catering Services',
        description: 'Corporate and event catering services',
        category: 'service',
        priceType: 'quote',
        tags: ['catering', 'events', 'corporate'],
      },
    ],
  },

  // Transportation and Warehousing
  '484': {
    naicsCode: '484',
    industryName: 'Truck Transportation',
    suggestions: [
      {
        name: 'Freight Transportation',
        description: 'Long-haul and regional freight transportation services',
        category: 'service',
        priceType: 'quote',
        tags: ['freight', 'trucking', 'logistics'],
      },
      {
        name: 'Last-Mile Delivery',
        description: 'Local delivery services for e-commerce and retail',
        category: 'service',
        priceType: 'variable',
        tags: ['delivery', 'last-mile', 'local'],
      },
      {
        name: 'Refrigerated Transport',
        description: 'Temperature-controlled transportation for perishable goods',
        category: 'service',
        priceType: 'quote',
        tags: ['refrigerated', 'cold chain', 'perishable'],
      },
    ],
  },
  '493': {
    naicsCode: '493',
    industryName: 'Warehousing and Storage',
    suggestions: [
      {
        name: 'Warehouse Storage',
        description: 'Secure warehouse storage space rental',
        category: 'service',
        priceType: 'variable',
        tags: ['storage', 'warehouse', 'space rental'],
      },
      {
        name: 'Fulfillment Services',
        description: 'E-commerce order fulfillment and distribution',
        category: 'service',
        priceType: 'variable',
        tags: ['fulfillment', 'e-commerce', 'distribution'],
      },
    ],
  },

  // Information
  '511': {
    naicsCode: '511',
    industryName: 'Publishing Industries',
    suggestions: [
      {
        name: 'Digital Publishing Platform',
        description: 'Online content publishing and distribution services',
        category: 'service',
        priceType: 'variable',
        tags: ['digital', 'publishing', 'content'],
      },
      {
        name: 'Content Creation Services',
        description: 'Professional content writing and editing services',
        category: 'service',
        priceType: 'quote',
        tags: ['content', 'writing', 'editing'],
      },
    ],
  },
  '518': {
    naicsCode: '518',
    industryName: 'Data Processing, Hosting, and Related Services',
    suggestions: [
      {
        name: 'Cloud Hosting Services',
        description: 'Scalable cloud infrastructure and hosting solutions',
        category: 'service',
        priceType: 'variable',
        tags: ['cloud', 'hosting', 'infrastructure'],
      },
      {
        name: 'Data Analytics Platform',
        description: 'Business intelligence and data analytics services',
        category: 'service',
        priceType: 'fixed',
        tags: ['analytics', 'data', 'business intelligence'],
      },
      {
        name: 'Backup and Disaster Recovery',
        description: 'Automated backup and disaster recovery solutions',
        category: 'service',
        priceType: 'fixed',
        tags: ['backup', 'disaster recovery', 'security'],
      },
    ],
  },

  // Finance and Insurance
  '522': {
    naicsCode: '522',
    industryName: 'Credit Intermediation and Related Activities',
    suggestions: [
      {
        name: 'Business Loans',
        description: 'Commercial lending and business financing solutions',
        category: 'service',
        priceType: 'variable',
        tags: ['loans', 'financing', 'business credit'],
      },
      {
        name: 'Equipment Financing',
        description: 'Equipment purchase and lease financing',
        category: 'service',
        priceType: 'quote',
        tags: ['equipment', 'leasing', 'asset finance'],
      },
      {
        name: 'Credit Analysis Services',
        description: 'Credit risk assessment and underwriting services',
        category: 'service',
        priceType: 'fixed',
        tags: ['credit analysis', 'risk assessment', 'underwriting'],
      },
    ],
  },
  '524': {
    naicsCode: '524',
    industryName: 'Insurance Carriers and Related Activities',
    suggestions: [
      {
        name: 'Business Insurance',
        description: 'Comprehensive business insurance packages',
        category: 'service',
        priceType: 'quote',
        tags: ['insurance', 'business', 'coverage'],
      },
      {
        name: 'Risk Management Consulting',
        description: 'Enterprise risk management and insurance consulting',
        category: 'service',
        priceType: 'fixed',
        tags: ['risk management', 'consulting', 'insurance'],
      },
    ],
  },

  // Real Estate
  '531': {
    naicsCode: '531',
    industryName: 'Real Estate',
    suggestions: [
      {
        name: 'Commercial Property Leasing',
        description: 'Office and retail space leasing services',
        category: 'service',
        priceType: 'variable',
        tags: ['leasing', 'commercial', 'real estate'],
      },
      {
        name: 'Property Management',
        description: 'Full-service property management for commercial properties',
        category: 'service',
        priceType: 'variable',
        tags: ['property management', 'maintenance', 'commercial'],
      },
      {
        name: 'Real Estate Investment Consulting',
        description: 'Investment analysis and real estate portfolio management',
        category: 'service',
        priceType: 'quote',
        tags: ['investment', 'consulting', 'portfolio'],
      },
    ],
  },

  // Professional Services
  '541': {
    naicsCode: '541',
    industryName: 'Professional, Scientific, and Technical Services',
    suggestions: [
      {
        name: 'Business Consulting',
        description: 'Strategic business consulting and advisory services',
        category: 'service',
        priceType: 'quote',
        tags: ['consulting', 'strategy', 'advisory'],
      },
      {
        name: 'Legal Services',
        description: 'Corporate legal services and contract management',
        category: 'service',
        priceType: 'variable',
        tags: ['legal', 'contracts', 'compliance'],
      },
      {
        name: 'Accounting Services',
        description: 'Financial accounting and tax preparation services',
        category: 'service',
        priceType: 'fixed',
        tags: ['accounting', 'tax', 'financial'],
      },
      {
        name: 'IT Consulting',
        description: 'Technology consulting and system integration services',
        category: 'service',
        priceType: 'quote',
        tags: ['IT', 'technology', 'consulting'],
      },
    ],
  },

  // Healthcare
  '621': {
    naicsCode: '621',
    industryName: 'Ambulatory Health Care Services',
    suggestions: [
      {
        name: 'Telemedicine Services',
        description: 'Remote healthcare consultation and monitoring',
        category: 'service',
        priceType: 'fixed',
        tags: ['telemedicine', 'healthcare', 'remote'],
      },
      {
        name: 'Health Screening Programs',
        description: 'Corporate wellness and health screening services',
        category: 'service',
        priceType: 'quote',
        tags: ['wellness', 'screening', 'corporate health'],
      },
      {
        name: 'Medical Equipment Rental',
        description: 'Durable medical equipment rental and leasing',
        category: 'service',
        priceType: 'variable',
        tags: ['medical equipment', 'rental', 'DME'],
      },
    ],
  },

  // Food Services
  '722': {
    naicsCode: '722',
    industryName: 'Food Services and Drinking Places',
    suggestions: [
      {
        name: 'Restaurant Meals',
        description: 'Dine-in and takeout restaurant services',
        category: 'service',
        priceType: 'variable',
        tags: ['restaurant', 'dining', 'food service'],
      },
      {
        name: 'Corporate Catering',
        description: 'Business meeting and event catering services',
        category: 'service',
        priceType: 'quote',
        tags: ['catering', 'corporate', 'events'],
      },
      {
        name: 'Meal Subscription Service',
        description: 'Weekly meal prep and delivery subscriptions',
        category: 'service',
        priceType: 'fixed',
        tags: ['meal prep', 'subscription', 'delivery'],
      },
    ],
  },
};

// Helper function to get suggestions by NAICS code
export function getProductServiceSuggestions(naicsCode: string): ProductServiceSuggestion[] {
  const data = naicsProductsServices[naicsCode];
  return data ? data.suggestions : [];
}

// Helper function to get all suggestions for multiple NAICS codes
export function getMultipleNAICSSuggestions(naicsCodes: string[]): ProductServiceSuggestion[] {
  const suggestions: ProductServiceSuggestion[] = [];
  const addedNames = new Set<string>();

  naicsCodes.forEach(code => {
    const codeSuggestions = getProductServiceSuggestions(code);
    codeSuggestions.forEach(suggestion => {
      if (!addedNames.has(suggestion.name)) {
        suggestions.push(suggestion);
        addedNames.add(suggestion.name);
      }
    });
  });

  return suggestions;
}

// Helper function to search suggestions by keyword
export function searchProductServiceSuggestions(keyword: string): ProductServiceSuggestion[] {
  const results: ProductServiceSuggestion[] = [];
  const addedNames = new Set<string>();
  const searchTerm = keyword.toLowerCase();

  Object.values(naicsProductsServices).forEach(data => {
    data.suggestions.forEach(suggestion => {
      const matchesName = suggestion.name.toLowerCase().includes(searchTerm);
      const matchesDescription = suggestion.description.toLowerCase().includes(searchTerm);
      const matchesTags = suggestion.tags.some(tag => tag.toLowerCase().includes(searchTerm));

      if ((matchesName || matchesDescription || matchesTags) && !addedNames.has(suggestion.name)) {
        results.push(suggestion);
        addedNames.add(suggestion.name);
      }
    });
  });

  return results;
}