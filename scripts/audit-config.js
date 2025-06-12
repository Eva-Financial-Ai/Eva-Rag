/**
 * Frontend Audit Configuration
 * 
 * This file contains the configuration for the frontend audit tool.
 * Adjust the settings to match your project's requirements.
 */

module.exports = {
  // Directories to analyze
  directories: {
    components: 'src/components',
    api: 'src/api',
    utils: 'src/utils',
    pages: 'src/pages',
    hooks: 'src/hooks',
    contexts: 'src/contexts',
  },
  
  // Testing thresholds
  thresholds: {
    performance: {
      lcp: 2500, // ms
      fid: 100, // ms
      cls: 0.1,
      fcp: 1800, // ms
      tti: 3800, // ms
    },
    accessibility: {
      minimumScore: 90, // %
    },
    bundle: {
      maxInitialSize: 500 * 1024, // 500KB
    },
    code: {
      maxDuplication: 3, // %
      maxComplexity: 20,
    },
  },
  
  // Test server configuration
  server: {
    port: 3001,
    host: 'localhost',
    protocol: 'http',
  },
  
  // Report configuration
  reports: {
    outputDir: 'audit-reports',
    format: ['json', 'html'],
  },
  
  // List of critical components to test
  criticalComponents: [
    'TopNavbar',
    'SmartMatching',
    'RiskAssessment',
    'PaymentCalculator',
    'DealStructuring',
    'CreditApplicationForm',
    'ConversationInterface',
  ],
  
  // Demo flows to verify
  demoFlows: [
    {
      name: 'Borrower Application Flow',
      steps: [
        'Registration',
        'Profile Setup',
        'Application Submission',
        'Document Upload',
        'Status Tracking',
      ]
    },
    {
      name: 'Lender Review Flow',
      steps: [
        'Registration',
        'Application Review',
        'Risk Assessment',
        'Decision Making',
        'Portfolio Management',
      ]
    },
    {
      name: 'Broker Flow',
      steps: [
        'Registration',
        'Deal Creation',
        'Smart Match',
        'Lender Matching',
        'Commission Processing',
      ]
    },
    {
      name: 'Vendor Flow',
      steps: [
        'Registration',
        'Client Management',
        'Deal Creation',
        'Commission Tracking',
      ]
    },
  ],
  
  // Browsers to test
  browsers: [
    {
      name: 'Chrome',
      versions: ['latest', 'latest-1'],
    },
    {
      name: 'Firefox',
      versions: ['latest', 'latest-1'],
    },
    {
      name: 'Safari',
      versions: ['latest'],
    },
    {
      name: 'Edge',
      versions: ['latest'],
    },
  ],
  
  // Screen sizes to test
  screenSizes: [
    {
      name: 'Mobile',
      width: 375,
      height: 667,
    },
    {
      name: 'Tablet',
      width: 768,
      height: 1024,
    },
    {
      name: 'Desktop',
      width: 1440,
      height: 900,
    },
  ],
}; 