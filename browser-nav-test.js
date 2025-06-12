import { debugLog } from '../utils/auditLogger';

// Simple Navigation Test - Run in Browser Console

const testNavigation = () => {
  debugLog('general', 'log_statement', 'Testing navigation items...')

  // Find all navigation links
  const navLinks = document.querySelectorAll('a[href], button[onclick]');
  debugLog('general', 'log_statement', 'Found ' + navLinks.length + ' navigation items')

  // Test specific routes
  const routes = [
    '/dashboard',
    '/ai-assistant',
    '/auto-originations',
    '/transaction-summary',
    '/customer-retention',
    '/documents',
    '/shield-vault',
    '/forms',
    '/risk-assessment',
    '/deal-structuring',
    '/asset-press',
    '/commercial-market',
    '/portfolio-wallet',
    '/demo-mode',
    '/team-management'
  ];

  routes.forEach(route => {
    try {
      const testUrl = new URL(route, window.location.origin);
      debugLog('general', 'log_statement', '✅ ' + route + ' - Valid URL')
    } catch (error) {
      debugLog('general', 'log_statement', '❌ ' + route + ' - Invalid URL')
    }
  });

  return routes;
};

const clickNavItem = (text) => {
  const items = document.querySelectorAll('a, button');
  for (let item of items) {
    if (item.textContent && item.textContent.toLowerCase().includes(text.toLowerCase())) {
      debugLog('general', 'log_statement', 'Clicking: ' + item.textContent.trim());
      item.click();
      return true;
    }
  }
  debugLog('general', 'log_statement', 'Not found: ' + text)
  return false;
};

// Auto-run
debugLog('general', 'log_statement', 'Navigation test loaded!')
debugLog('general', 'log_statement', 'Run: testNavigation()');
debugLog('general', 'log_statement', 'Or: clickNavItem("dashboard")');
testNavigation();