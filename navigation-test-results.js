import { debugLog } from '../utils/auditLogger';

// Navigation Test Results
// Run this in the browser console after starting the app

const testNavigation = async () => {
  debugLog('general', 'log_statement', '🔍 Testing Navigation Routes...')

  const routes = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Auto Originations', path: '/auto-originations' },
    { name: 'Transaction Summary', path: '/transaction-summary' },
    { name: 'Customer Retention', path: '/customer-retention' },
    { name: 'Customer Retention Customers', path: '/customer-retention/customers' },
    { name: 'Customer Retention Contacts', path: '/customer-retention/contacts' },
    { name: 'Customer Retention Commitments', path: '/customer-retention/commitments' },
    { name: 'Calendar Integration', path: '/calendar-integration' },
    { name: 'Post Closing', path: '/post-closing' },
    { name: 'Documents', path: '/documents' },
    { name: 'Shield Vault', path: '/shield-vault' },
    { name: 'Forms', path: '/forms' },
    { name: 'Risk Assessment', path: '/risk-assessment' },
    { name: 'Risk Assessment EVA Report', path: '/risk-assessment/eva-report' },
    { name: 'Risk Assessment Lab', path: '/risk-assessment/lab' },
    { name: 'Deal Structuring', path: '/deal-structuring' },
    { name: 'Smart Match', path: '/deal-structuring/smart-match' },
    { name: 'Transaction Execution', path: '/transaction-execution' },
    { name: 'Asset Press', path: '/asset-press' },
    { name: 'Commercial Market', path: '/commercial-market' },
    { name: 'Portfolio Wallet', path: '/portfolio-wallet' },
    { name: 'Asset Portfolio', path: '/asset-portfolio' }
  ];

  const results = [];

  for (const route of routes) {
    try {
      // Test if route exists by checking if it would redirect
      const testUrl = window.location.origin + route.path;
      const response = await fetch(testUrl, { method: 'HEAD' });

      results.push({
        name: route.name,
        path: route.path,
        status: response.ok ? '✅ OK' : '⚠️ Warning',
        code: response.status
      });
    } catch (error) {
      results.push({
        name: route.name,
        path: route.path,
        status: '❌ Error',
        error: error.message
      });
    }
  }

  console.table(results);
  return results;
};

// Auto-run test
testNavigation();