import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node

// Simple Navigation Test Script
const fs = require('fs');
const path = require('path');

debugLog('general', 'log_statement', '🔍 SIMPLE NAVIGATION TEST')
debugLog('general', 'log_statement', '=========================\n')

// Check if key components exist
const checkComponents = () => {
  debugLog('general', 'log_statement', '1️⃣ CHECKING KEY COMPONENTS')
  debugLog('general', 'log_statement', '==========================')

  const components = [
    'src/pages/Dashboard.tsx',
    'src/pages/RoleBasedDashboard.tsx',
    'src/pages/AIAssistantPage.tsx',
    'src/pages/AutoOriginationsPage.tsx',
    'src/pages/TransactionSummary.tsx',
    'src/pages/Documents.tsx',
    'src/pages/ShieldVault.tsx',
    'src/pages/FormsList.tsx',
    'src/pages/RiskAssessment.tsx',
    'src/pages/DealStructuring.tsx',
    'src/pages/EnhancedAssetPress.tsx',
    'src/pages/CommercialMarket.tsx',
    'src/pages/PortfolioWalletPage.tsx',
    'src/pages/DemoMode.tsx',
    'src/pages/TeamManagement.tsx',
    'src/pages/CustomerRetention.tsx',
    'src/pages/CalendarIntegration.tsx',
    'src/components/credit/AutoOriginationsDashboard.tsx',
  ];

  let found = 0;
  let missing = [];

  components.forEach(comp => {
    if (fs.existsSync(comp)) {
      debugLog('general', 'log_statement', '✅ ' + path.basename(comp) + ' - EXISTS');
      found++;
    } else {
      debugLog('general', 'log_statement', '❌ ' + path.basename(comp) + ' - MISSING');
      missing.push(comp);
    }
  });

  debugLog('general', 'log_statement', '\n📊 Components: ' + found + '/' + components.length + ' found')
  return { found, missing, total: components.length };
};

// Check router configuration
const checkRouter = () => {
  debugLog('general', 'log_statement', '\n2️⃣ CHECKING ROUTER CONFIGURATION')
  debugLog('general', 'log_statement', '=================================')

  const routerPath = 'src/components/routing/LoadableRouter.tsx';

  if (!fs.existsSync(routerPath)) {
    debugLog('general', 'log_statement', '❌ Router file not found')
    return { found: 0, total: 1 };
  }

  const content = fs.readFileSync(routerPath, 'utf8');

  const routes = [
    '/dashboard',
    '/ai-assistant',
    '/auto-originations',
    '/transaction-summary',
    '/documents',
    '/shield-vault',
    '/risk-assessment',
    '/deal-structuring',
    '/asset-press',
    '/commercial-market',
    '/portfolio-wallet',
    '/demo-mode',
    '/team-management',
    '/customer-retention',
  ];

  let found = 0;
  let missing = [];

  routes.forEach(route => {
    if (content.includes('path="' + route + '"')) {
      debugLog('general', 'log_statement', '✅ ' + route + ' - Route configured')
      found++;
    } else {
      debugLog('general', 'log_statement', '❌ ' + route + ' - Route missing')
      missing.push(route);
    }
  });

  debugLog('general', 'log_statement', '\n📊 Routes: ' + found + '/' + routes.length + ' found')
  return { found, missing, total: routes.length };
};

// Check navigation handlers
const checkNavigation = () => {
  debugLog('general', 'log_statement', '\n3️⃣ CHECKING NAVIGATION HANDLERS')
  debugLog('general', 'log_statement', '================================')

  const navPath = 'src/components/layout/SideNavigation.tsx';

  if (!fs.existsSync(navPath)) {
    debugLog('general', 'log_statement', '❌ Navigation file not found')
    return { found: 0, total: 1 };
  }

  const content = fs.readFileSync(navPath, 'utf8');

  const handlers = [
    "safeNavigate('/dashboard')",
    "safeNavigate('/ai-assistant')",
    "safeNavigate('/auto-originations')",
    "safeNavigate('/transaction-summary')",
    "safeNavigate('/documents')",
    "safeNavigate('/shield-vault')",
    "safeNavigate('/risk-assessment')",
    "safeNavigate('/deal-structuring')",
    "safeNavigate('/asset-press')",
    "safeNavigate('/commercial-market')",
    "safeNavigate('/portfolio-wallet')",
    "safeNavigate('/demo-mode')",
    "safeNavigate('/team-management')",
    "safeNavigate('/customer-retention')",
  ];

  let found = 0;
  let missing = [];

  handlers.forEach(handler => {
    if (content.includes(handler)) {
      debugLog('general', 'log_statement', '✅ ' + handler + ' - Handler found')
      found++;
    } else {
      debugLog('general', 'log_statement', '❌ ' + handler + ' - Handler missing')
      missing.push(handler);
    }
  });

  debugLog('general', 'log_statement', '\n📊 Handlers: ' + found + '/' + handlers.length + ' found')
  return { found, missing, total: handlers.length };
};

// Create browser test
const createBrowserTest = () => {
  debugLog('general', 'log_statement', '\n4️⃣ CREATING BROWSER TEST')
  debugLog('general', 'log_statement', '=========================')

  const testScript = `// Simple Navigation Test - Run in Browser Console

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
testNavigation();`;

  try {
    fs.writeFileSync('browser-nav-test.js', testScript, 'utf8');
    debugLog('general', 'log_statement', '✅ Created browser test: browser-nav-test.js')
  } catch (error) {
    debugLog('general', 'log_statement', '❌ Error creating browser test: ' + error.message)
  }
};

// Main execution
const runTest = () => {
  const componentResults = checkComponents();
  const routerResults = checkRouter();
  const navResults = checkNavigation();

  createBrowserTest();

  debugLog('general', 'log_statement', '\n📊 OVERALL SUMMARY')
  debugLog('general', 'log_statement', '==================')
  debugLog('general', 'log_statement', 'Components: ' + componentResults.found + '/' + componentResults.total)
  debugLog('general', 'log_statement', 'Routes: ' + routerResults.found + '/' + routerResults.total)
  debugLog('general', 'log_statement', 'Handlers: ' + navResults.found + '/' + navResults.total)

  const totalFound = componentResults.found + routerResults.found + navResults.found;
  const totalPossible = componentResults.total + routerResults.total + navResults.total;
  const score = Math.round((totalFound / totalPossible) * 100);

  debugLog('general', 'log_statement', '\n🎯 OVERALL SCORE: ' + score + '%')

  if (score >= 90) {
    debugLog('general', 'log_statement', '🎉 EXCELLENT - Navigation should work!')
  } else if (score >= 75) {
    debugLog('general', 'log_statement', '✅ GOOD - Most navigation should work')
  } else if (score >= 50) {
    debugLog('general', 'log_statement', '⚠️  FAIR - Some issues need fixing')
  } else {
    debugLog('general', 'log_statement', '🚨 POOR - Major issues need fixing')
  }

  debugLog('general', 'log_statement', '\n🚀 NEXT STEPS:')
  debugLog('general', 'log_statement', '1. Open browser to: http://localhost:3000')
  debugLog('general', 'log_statement', '2. Open browser console (F12)');
  debugLog('general', 'log_statement', '3. Copy/paste browser-nav-test.js content')
  debugLog('general', 'log_statement', '4. Run: testNavigation()');
  debugLog('general', 'log_statement', '5. Test clicking navigation items')

  if (componentResults.missing.length > 0) {
    debugLog('general', 'log_statement', '\n🔧 MISSING COMPONENTS:')
    componentResults.missing.forEach(comp => {
      debugLog('general', 'log_statement', '   - ' + comp)
    });
  }

  if (routerResults.missing && routerResults.missing.length > 0) {
    debugLog('general', 'log_statement', '\n🛣️  MISSING ROUTES:')
    routerResults.missing.forEach(route => {
      debugLog('general', 'log_statement', '   - ' + route)
    });
  }

  if (navResults.missing && navResults.missing.length > 0) {
    debugLog('general', 'log_statement', '\n🖱️  MISSING HANDLERS:')
    navResults.missing.forEach(handler => {
      debugLog('general', 'log_statement', '   - ' + handler)
    });
  }

  return score;
};

// Run the test
runTest();
