// Storage configuration for FileLock Drive
export const STORAGE_CONFIG = {
  // Cloudflare R2 Configuration
  cloudflare: {
    accountId: process.env.REACT_APP_CLOUDFLARE_ACCOUNT_ID || 'eace6f3c56b5735ae4a9ef385d6ee914',
    bucketName: process.env.REACT_APP_R2_BUCKET_NAME || 'eva-fin-b-test-r2-frontend-services',
    apiUrl: process.env.REACT_APP_CLOUDFLARE_API_URL || 'https://api.cloudflare.com/client/v4',
    workerUrl: process.env.REACT_APP_WORKER_URL || 'https://api.eva-platform.eace6f3c56b5735ae4a9ef385d6ee914.workers.dev',
    publicUrl: process.env.REACT_APP_R2_PUBLIC_URL || 'https://pub-eace6f3c56b5735ae4a9ef385d6ee914.r2.dev',
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedFileTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
  },

  // Supabase Configuration
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key',
    bucketName: 'filelock-documents',
    maxFileSize: 50 * 1024 * 1024, // 50MB
  },

  // File categories for finance industry
  categories: {
    loan: {
      name: 'Loan Documents',
      requiredDocs: [
        'Loan Application',
        'Credit Authorization',
        'Loan Agreement',
        'Promissory Note',
        'Security Agreement',
        'UCC Filing',
        'Closing Disclosure'
      ],
      icon: '📋',
      color: 'blue'
    },
    financial: {
      name: 'Financial Statements',
      requiredDocs: [
        'Balance Sheet',
        'Income Statement',
        'Cash Flow Statement',
        'Profit & Loss Statement',
        'Bank Statements',
        'Accounts Receivable Aging',
        'Accounts Payable Aging'
      ],
      icon: '📊',
      color: 'green'
    },
    tax: {
      name: 'Tax Documents',
      requiredDocs: [
        'Business Tax Returns',
        'Personal Tax Returns',
        'W2/1099 Forms',
        'Schedule K-1',
        'Tax Transcripts',
        'Sales Tax Returns'
      ],
      icon: '📑',
      color: 'purple'
    },
    legal: {
      name: 'Legal Documents',
      requiredDocs: [
        'Articles of Incorporation',
        'Operating Agreement',
        'Bylaws',
        'Business Licenses',
        'Professional Licenses',
        'Contracts',
        'Leases'
      ],
      icon: '⚖️',
      color: 'red'
    },
    compliance: {
      name: 'Compliance Documents',
      requiredDocs: [
        'KYC Documentation',
        'AML Verification',
        'Identity Verification',
        'Proof of Address',
        'Insurance Policies',
        'Certifications',
        'Regulatory Filings'
      ],
      icon: '✓',
      color: 'yellow'
    },
    collateral: {
      name: 'Collateral Documents',
      requiredDocs: [
        'Property Deeds',
        'Vehicle Titles',
        'Equipment Lists',
        'Inventory Reports',
        'Appraisals',
        'Insurance Documentation',
        'Lien Searches'
      ],
      icon: '🏢',
      color: 'indigo'
    }
  },

  // Role-based permissions
  rolePermissions: {
    lender: {
      canUpload: true,
      canDelete: true,
      canApprove: true,
      canReject: true,
      canShare: true,
      canViewAll: true,
      canEditMetadata: true,
      canExport: true,
      maxUploadSize: 100 * 1024 * 1024 // 100MB
    },
    broker: {
      canUpload: true,
      canDelete: false,
      canApprove: false,
      canReject: false,
      canShare: true,
      canViewAll: false,
      canEditMetadata: true,
      canExport: true,
      maxUploadSize: 50 * 1024 * 1024 // 50MB
    },
    borrower: {
      canUpload: true,
      canDelete: false,
      canApprove: false,
      canReject: false,
      canShare: false,
      canViewAll: false,
      canEditMetadata: false,
      canExport: true,
      maxUploadSize: 25 * 1024 * 1024 // 25MB
    },
    vendor: {
      canUpload: true,
      canDelete: false,
      canApprove: false,
      canReject: false,
      canShare: false,
      canViewAll: false,
      canEditMetadata: false,
      canExport: false,
      maxUploadSize: 10 * 1024 * 1024 // 10MB
    }
  },

  // Auto-tagging rules
  autoTagRules: [
    { pattern: /loan|application|credit/i, tags: ['loan', 'application'] },
    { pattern: /financial|statement|balance|income/i, tags: ['financial', 'statements'] },
    { pattern: /tax|return|1099|w2/i, tags: ['tax', 'returns'] },
    { pattern: /legal|agreement|contract/i, tags: ['legal', 'contracts'] },
    { pattern: /kyc|aml|compliance|verification/i, tags: ['compliance', 'verification'] },
    { pattern: /collateral|property|equipment/i, tags: ['collateral', 'assets'] },
    { pattern: /insurance|policy/i, tags: ['insurance', 'coverage'] },
    { pattern: /confidential|sensitive/i, tags: ['confidential'] }
  ],

  // Sync settings
  sync: {
    enableRealtime: true,
    syncInterval: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 5000, // 5 seconds
    offlineQueueSize: 50,
    conflictResolution: 'latest-wins' // or 'manual'
  },

  // Security settings
  security: {
    enableEncryption: true,
    enableWatermark: true,
    enableAuditLog: true,
    passwordProtection: true,
    twoFactorRequired: ['lender', 'broker'],
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 5
  },

  // UI customization
  ui: {
    itemsPerPage: 20,
    enableDragDrop: true,
    enableBulkOperations: true,
    enableVersioning: true,
    enableComments: true,
    enableSharing: true,
    defaultView: 'grid', // 'grid' or 'list'
    theme: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444'
    }
  }
};

// Helper function to get role permissions
export const getRolePermissions = (role: string) => {
  return STORAGE_CONFIG.rolePermissions[role as keyof typeof STORAGE_CONFIG.rolePermissions] || 
         STORAGE_CONFIG.rolePermissions.borrower;
};

// Helper function to check file type validity
export const isValidFileType = (file: File): boolean => {
  return STORAGE_CONFIG.cloudflare.allowedFileTypes.includes(file.type);
};

// Helper function to check file size
export const isValidFileSize = (file: File, role: string): boolean => {
  const permissions = getRolePermissions(role);
  return file.size <= permissions.maxUploadSize;
};

// Helper function to auto-tag files
export const autoTagFile = (fileName: string): string[] => {
  const tags: string[] = [];
  
  for (const rule of STORAGE_CONFIG.autoTagRules) {
    if (rule.pattern.test(fileName)) {
      tags.push(...rule.tags);
    }
  }
  
  return [...new Set(tags)]; // Remove duplicates
};

export default STORAGE_CONFIG;