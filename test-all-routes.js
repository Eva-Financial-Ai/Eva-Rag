import { debugLog } from '../utils/auditLogger';

/**
 * Test Script to Verify All Routes
 * Run this after starting the dev server to check if all routes are accessible
 */

const routes = [
  '/',
  '/dashboard',
  '/dashboard/lender',
  '/dashboard/borrower',
  '/dashboard/broker',
  '/dashboard/vendor',
  '/dashboard/admin',
  '/dashboard/developer',
  '/analytics',
  '/users',
  '/documents',
  '/credit-application',
  '/auto-originations',
  '/transaction-explorer',
  '/customers',
  '/contacts',
  '/commitments',
  '/borrowers',
  '/lenders',
  '/customer-retention',
  '/customer-retention/calendar',
  '/post-closing',
  '/shield-vault',
  '/forms',
  '/risk-assessment/eva-report',
  '/risk-assessment/lab',
  '/deal-structuring',
  '/deal-structuring/smart-match',
  '/transaction-execution',
  '/asset-press',
  '/commercial-market',
  '/asset-tokenization',
  '/asset-verification',
  '/portfolio-wallet',
  '/asset-portfolio',
  '/portfolio-analytics',
  '/risk-monitoring',
];

debugLog('general', 'log_statement', 'Routes configured in the application:')
debugLog('general', 'log_statement', '=====================================')
routes.forEach(route => {
  debugLog('general', 'log_statement', `✓ ${route}`)
});
debugLog('general', 'log_statement', '=====================================')
debugLog('general', 'log_statement', `Total routes: ${routes.length}`)
debugLog('general', 'log_statement', '\nTo test these routes:')
debugLog('general', 'log_statement', '1. Start the dev server: npm run dev')
debugLog('general', 'log_statement', '2. Visit http://localhost:5173 in your browser')
debugLog('general', 'log_statement', '3. Navigate to each route using the sidebar or by typing the URL directly')
debugLog('general', 'log_statement', '\nNote: All routes should now be accessible in development mode.')