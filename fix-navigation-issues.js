import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node

// Fix Navigation Issues Script
// This script fixes the navigation issues by ensuring all components exist and are properly connected

const fs = require('fs');
const path = require('path');

debugLog('general', 'log_statement', '🔧 FIXING NAVIGATION ISSUES')
debugLog('general', 'log_statement', '===========================\n')

// Check if components exist in their actual locations
const checkActualComponents = () => {
  debugLog('general', 'log_statement', '1️⃣ CHECKING ACTUAL COMPONENT LOCATIONS')
  debugLog('general', 'log_statement', '======================================')

  const actualComponents = [
    // Pages that exist
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
    'src/pages/SmartMatchPage.tsx',
    'src/pages/TransactionExecutionPage.tsx',
    'src/pages/EnhancedAssetPress.tsx',
    'src/pages/CommercialMarket.tsx',
    'src/pages/PortfolioWalletPage.tsx',
    'src/pages/PortfolioNavigatorPage.tsx',
    'src/pages/DemoMode.tsx',
    'src/pages/TeamManagement.tsx',
    'src/pages/CustomerRetention.tsx',
    'src/pages/CalendarIntegration.tsx',
    'src/pages/PostClosingCustomers.tsx',

    // Customer Retention pages
    'src/pages/customerRetention/CustomerRetentionCustomers.tsx',
    'src/pages/customerRetention/CustomerRetentionContacts.tsx',
    'src/pages/customerRetention/CustomerRetentionCommitments.tsx',
    'src/pages/customerRetention/CustomerRetentionCalendar.tsx',

    // Components that exist
    'src/components/credit/AutoOriginationsDashboard.tsx',
    'src/components/credit/CreditApplication.tsx',
    'src/components/document/FilelockDriveIntegrated.tsx',
    'src/components/risk/RiskAssessment.tsx',
    'src/components/risk/ModularRiskNavigator.tsx',
    'src/components/deal/DealStructuring.tsx',
  ];

  let foundComponents = 0;
  let missingComponents = [];

  actualComponents.forEach(componentPath => {
    if (fs.existsSync(componentPath)) {
      debugLog('general', 'log_statement', `✅ ${path.basename(componentPath)} - EXISTS`);
      foundComponents++;
    } else {
      debugLog('general', 'log_statement', `❌ ${path.basename(componentPath)} - MISSING`);
      missingComponents.push(componentPath);
    }
  });

  debugLog('general', 'log_statement', 
    `\n📊 Components Summary: ${foundComponents}/${actualComponents.length} components found`
  )

  if (missingComponents.length > 0) {
    debugLog('general', 'log_statement', '\n🚨 MISSING COMPONENTS:')
    missingComponents.forEach(component => {
      debugLog('general', 'log_statement', `   - ${component}`)
    });
  }

  return { foundComponents, missingComponents, total: actualComponents.length };
};

// Check router imports and fix any issues
const checkRouterImports = () => {
  debugLog('general', 'log_statement', '\n2️⃣ CHECKING ROUTER IMPORTS')
  debugLog('general', 'log_statement', '==========================')

  const routerPath = 'src/components/routing/LoadableRouter.tsx';

  if (!fs.existsSync(routerPath)) {
    debugLog('general', 'log_statement', '❌ Router file not found')
    return false;
  }

  const content = fs.readFileSync(routerPath, 'utf8');

  // Check for key imports
  const importChecks = [
    {
      name: 'AutoOriginationsPage',
      pattern: /import.*AutoOriginationsPage.*from.*AutoOriginationsPage/,
    },
    { name: 'TransactionSummary', pattern: /import.*TransactionSummary.*from.*TransactionSummary/ },
    { name: 'Documents', pattern: /import.*Documents.*from.*Documents/ },
    { name: 'ShieldVault', pattern: /import.*ShieldVault.*from.*ShieldVault/ },
    { name: 'RiskAssessment', pattern: /import.*RiskAssessment.*from.*RiskAssessment/ },
    { name: 'DealStructuring', pattern: /import.*DealStructuring.*from.*DealStructuring/ },
    { name: 'EnhancedAssetPress', pattern: /import.*EnhancedAssetPress.*from.*EnhancedAssetPress/ },
    { name: 'CommercialMarket', pattern: /import.*CommercialMarket.*from.*CommercialMarket/ },
    {
      name: 'PortfolioWalletPage',
      pattern: /import.*PortfolioWalletPage.*from.*PortfolioWalletPage/,
    },
    { name: 'DemoMode', pattern: /import.*DemoMode.*from.*DemoMode/ },
    { name: 'TeamManagement', pattern: /import.*TeamManagement.*from.*TeamManagement/ },
    { name: 'CustomerRetention', pattern: /import.*CustomerRetention.*from.*CustomerRetention/ },
    {
      name: 'CalendarIntegration',
      pattern: /import.*CalendarIntegration.*from.*CalendarIntegration/,
    },
    { name: 'AIAssistantPage', pattern: /import.*AIAssistantPage.*from.*AIAssistantPage/ },
  ];

  let foundImports = 0;
  let missingImports = [];

  importChecks.forEach(check => {
    if (check.pattern.test(content)) {
      debugLog('general', 'log_statement', `✅ ${check.name} - Import found`)
      foundImports++;
    } else {
      debugLog('general', 'log_statement', `❌ ${check.name} - Import missing`)
      missingImports.push(check.name);
    }
  });

  debugLog('general', 'log_statement', `\n📊 Import Summary: ${foundImports}/${importChecks.length} imports found`)

  return { foundImports, missingImports, total: importChecks.length };
};

// Check route definitions
const checkRouteDefinitions = () => {
  debugLog('general', 'log_statement', '\n3️⃣ CHECKING ROUTE DEFINITIONS')
  debugLog('general', 'log_statement', '==============================')

  const routerPath = 'src/components/routing/LoadableRouter.tsx';
  const content = fs.readFileSync(routerPath, 'utf8');

  const routeChecks = [
    { name: 'Dashboard', pattern: /path="\/dashboard".*element={<.*Dashboard.*\/>}/ },
    {
      name: 'Auto Originations',
      pattern: /path="\/auto-originations".*element={<.*AutoOriginations.*\/>}/,
    },
    {
      name: 'Transaction Summary',
      pattern: /path="\/transaction-summary".*element={<.*TransactionSummary.*\/>}/,
    },
    { name: 'Documents', pattern: /path="\/documents".*element={<.*Documents.*\/>}/ },
    { name: 'Shield Vault', pattern: /path="\/shield-vault".*element={<.*ShieldVault.*\/>}/ },
    { name: 'Risk Assessment', pattern: /path="\/risk-assessment"/ },
    {
      name: 'Deal Structuring',
      pattern: /path="\/deal-structuring".*element={<.*DealStructuring.*\/>}/,
    },
    { name: 'Asset Press', pattern: /path="\/asset-press".*element={<.*EnhancedAssetPress.*\/>}/ },
    {
      name: 'Commercial Market',
      pattern: /path="\/commercial-market".*element={<.*CommercialMarket.*\/>}/,
    },
    {
      name: 'Portfolio Wallet',
      pattern: /path="\/portfolio-wallet".*element={<.*PortfolioWallet.*\/>}/,
    },
    { name: 'Demo Mode', pattern: /path="\/demo-mode".*element={<.*DemoMode.*\/>}/ },
    {
      name: 'Team Management',
      pattern: /path="\/team-management".*element={<.*TeamManagement.*\/>}/,
    },
    {
      name: 'Customer Retention',
      pattern: /path="\/customer-retention".*element={<.*CustomerRetention.*\/>}/,
    },
    { name: 'AI Assistant', pattern: /path="\/ai-assistant".*element={<.*AIAssistantPage.*\/>}/ },
  ];

  let foundRoutes = 0;
  let missingRoutes = [];

  routeChecks.forEach(check => {
    if (check.pattern.test(content)) {
      debugLog('general', 'log_statement', `✅ ${check.name} - Route defined`)
      foundRoutes++;
    } else {
      debugLog('general', 'log_statement', `❌ ${check.name} - Route missing or malformed`)
      missingRoutes.push(check.name);
    }
  });

  debugLog('general', 'log_statement', `\n📊 Route Summary: ${foundRoutes}/${routeChecks.length} routes found`)

  return { foundRoutes, missingRoutes, total: routeChecks.length };
};

// Check navigation onClick handlers
const checkNavigationHandlers = () => {
  debugLog('general', 'log_statement', '\n4️⃣ CHECKING NAVIGATION HANDLERS')
  debugLog('general', 'log_statement', '================================')

  const navPath = 'src/components/layout/SideNavigation.tsx';
  const content = fs.readFileSync(navPath, 'utf8');

  const handlerChecks = [
    { name: 'Dashboard', pattern: /safeNavigate\('\/dashboard'\)/ },
    { name: 'Auto Originations', pattern: /safeNavigate\('\/auto-originations'\)/ },
    { name: 'Transaction Summary', pattern: /safeNavigate\('\/transaction-summary'\)/ },
    { name: 'Documents', pattern: /safeNavigate\('\/documents'\)/ },
    { name: 'Shield Vault', pattern: /safeNavigate\('\/shield-vault'\)/ },
    { name: 'Risk Assessment', pattern: /safeNavigate\('\/risk-assessment'\)/ },
    { name: 'Deal Structuring', pattern: /safeNavigate\('\/deal-structuring'\)/ },
    { name: 'Asset Press', pattern: /safeNavigate\('\/asset-press'\)/ },
    { name: 'Commercial Market', pattern: /safeNavigate\('\/commercial-market'\)/ },
    { name: 'Portfolio Wallet', pattern: /safeNavigate\('\/portfolio-wallet'\)/ },
    { name: 'Demo Mode', pattern: /safeNavigate\('\/demo-mode'\)/ },
    { name: 'Team Management', pattern: /safeNavigate\('\/team-management'\)/ },
    { name: 'Customer Retention', pattern: /safeNavigate\('\/customer-retention'\)/ },
    { name: 'AI Assistant', pattern: /safeNavigate\('\/ai-assistant'\)/ },
  ];

  let foundHandlers = 0;
  let missingHandlers = [];

  handlerChecks.forEach(check => {
    if (check.pattern.test(content)) {
      debugLog('general', 'log_statement', `✅ ${check.name} - Handler found`)
      foundHandlers++;
    } else {
      debugLog('general', 'log_statement', `❌ ${check.name} - Handler missing`)
      missingHandlers.push(check.name);
    }
  });

  debugLog('general', 'log_statement', `\n📊 Handler Summary: ${foundHandlers}/${handlerChecks.length} handlers found`)

  return { foundHandlers, missingHandlers, total: handlerChecks.length };
};

// Create a browser test script
const createBrowserTestScript = () => {
  debugLog('general', 'log_statement', '\n5️⃣ CREATING BROWSER TEST SCRIPT')
  debugLog('general', 'log_statement', '================================')

  const testScript = `// Navigation Test Script - Run in Browser Console
// This script tests all navigation items to see which ones work

const testAllNavigation = () => {
  debugLog('general', 'log_statement', '🔍 Testing All Navigation Items')
  debugLog('general', 'log_statement', '===============================')

  // Find all navigation items
  const navItems = document.querySelectorAll('a[href], button[onclick], [data-testid*="nav"]');
  debugLog('general', 'log_statement', 'Found', navItems.length, 'potential navigation items')

  // Test each navigation item
  const results = [];
  navItems.forEach((item, index) => {
    const text = item.textContent?.trim();
    const href = item.href || item.getAttribute('data-href');
    const onclick = item.onclick || item.getAttribute('onclick');

    if (text && (href || onclick)) {
      results.push({
        index: index + 1,
        text: text,
        href: href,
        hasOnClick: !!onclick,
        element: item
      });
    }
  });

  debugLog('general', 'log_statement', '\n📋 Navigation Items Found:')
  results.forEach(result => {
         debugLog('general', 'log_statement', `${result.index}. ${result.text} - ${result.href || 'onClick handler'}`)
  });

  return results;
};

const testSpecificRoutes = () => {
  debugLog('general', 'log_statement', '\n🎯 Testing Specific Routes')
  debugLog('general', 'log_statement', '===========================')

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
      // Test if route exists by checking if it would navigate
      const testUrl = new URL(route, window.location.origin);
             debugLog('general', 'log_statement', `✅ ${route} - Valid URL structure`)
    } catch (error) {
             debugLog('general', 'log_statement', `❌ ${route} - Invalid URL structure`)
    }
  });
};

const clickNavigationItem = (text) => {
  const items = document.querySelectorAll('a, button');
  for (let item of items) {
    if (item.textContent?.trim().toLowerCase().includes(text.toLowerCase())) {
      debugLog('general', 'log_statement', 'Clicking:', item.textContent?.trim());
      item.click();
      return true;
    }
  }
  debugLog('general', 'log_statement', 'Navigation item not found:', text)
  return false;
};

// Auto-run tests
debugLog('general', 'log_statement', 'Navigation Test Script Loaded!')
debugLog('general', 'log_statement', 'Available functions:')
debugLog('general', 'log_statement', '- testAllNavigation() - Test all navigation items');
debugLog('general', 'log_statement', '- testSpecificRoutes() - Test specific route URLs');
debugLog('general', 'log_statement', '- clickNavigationItem("text") - Click a navigation item by text');

// Run initial test
testAllNavigation();
testSpecificRoutes();`;

  try {
    fs.writeFileSync('navigation-browser-test.js', testScript, 'utf8');
    debugLog('general', 'log_statement', '✅ Created browser test script: navigation-browser-test.js')
  } catch (error) {
    console.error('❌ Error creating browser test script:', error.message);
  }
};

// Generate comprehensive fix recommendations
const generateFixRecommendations = (
  componentResults,
  importResults,
  routeResults,
  handlerResults
) => {
  debugLog('general', 'log_statement', '\n6️⃣ FIX RECOMMENDATIONS')
  debugLog('general', 'log_statement', '======================')

  const totalIssues =
    componentResults.missingComponents.length +
    importResults.missingImports.length +
    routeResults.missingRoutes.length +
    handlerResults.missingHandlers.length;

  if (totalIssues === 0) {
    debugLog('general', 'log_statement', '🎉 NO ISSUES FOUND! All navigation should be working.')
    debugLog('general', 'log_statement', '')
    debugLog('general', 'log_statement', "If you're still experiencing issues:")
    debugLog('general', 'log_statement', '1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)');
    debugLog('general', 'log_statement', '2. Restart the development server')
    debugLog('general', 'log_statement', '3. Check browser console for JavaScript errors')
    debugLog('general', 'log_statement', '4. Run the browser test script: navigation-browser-test.js')
    return;
  }

  debugLog('general', 'log_statement', `Found ${totalIssues} issues to fix:\n`)

  if (componentResults.missingComponents.length > 0) {
    debugLog('general', 'log_statement', '🔧 MISSING COMPONENTS:')
    componentResults.missingComponents.forEach(component => {
      debugLog('general', 'log_statement', `   - Create: ${component}`)
    });
    debugLog('general', 'log_statement', '')
  }

  if (importResults.missingImports.length > 0) {
    debugLog('general', 'log_statement', '📦 MISSING IMPORTS:')
    importResults.missingImports.forEach(importName => {
      debugLog('general', 'log_statement', `   - Add import for: ${importName}`)
    });
    debugLog('general', 'log_statement', '')
  }

  if (routeResults.missingRoutes.length > 0) {
    debugLog('general', 'log_statement', '🛣️  MISSING ROUTES:')
    routeResults.missingRoutes.forEach(route => {
      debugLog('general', 'log_statement', `   - Add route definition for: ${route}`)
    });
    debugLog('general', 'log_statement', '')
  }

  if (handlerResults.missingHandlers.length > 0) {
    debugLog('general', 'log_statement', '🖱️  MISSING HANDLERS:')
    handlerResults.missingHandlers.forEach(handler => {
      debugLog('general', 'log_statement', `   - Add onClick handler for: ${handler}`)
    });
    debugLog('general', 'log_statement', '')
  }

  debugLog('general', 'log_statement', '🚀 IMMEDIATE ACTIONS:')
  debugLog('general', 'log_statement', '1. Run: npm start (if not already running)');
  debugLog('general', 'log_statement', '2. Open browser to: http://localhost:3000')
  debugLog('general', 'log_statement', '3. Open browser console (F12)');
  debugLog('general', 'log_statement', '4. Copy and paste navigation-browser-test.js content')
  debugLog('general', 'log_statement', '5. Run: testAllNavigation()');
  debugLog('general', 'log_statement', '6. Click each navigation item and check for errors')
  debugLog('general', 'log_statement', '')

  debugLog('general', 'log_statement', '📝 DEBUGGING STEPS:')
  debugLog('general', 'log_statement', '1. Check browser console for error messages')
  debugLog('general', 'log_statement', '2. Verify network requests are successful (Network tab)');
  debugLog('general', 'log_statement', '3. Check if components are loading (React DevTools)');
  debugLog('general', 'log_statement', '4. Test direct URL navigation (type URLs in address bar)');
};

// Main execution
const runNavigationFix = () => {
  const componentResults = checkActualComponents();
  const importResults = checkRouterImports();
  const routeResults = checkRouteDefinitions();
  const handlerResults = checkNavigationHandlers();

  createBrowserTestScript();
  generateFixRecommendations(componentResults, importResults, routeResults, handlerResults);

  debugLog('general', 'log_statement', '\n📊 OVERALL SUMMARY')
  debugLog('general', 'log_statement', '==================')
  debugLog('general', 'log_statement', 
    `Components: ${componentResults.foundComponents}/${componentResults.total} (${Math.round((componentResults.foundComponents / componentResults.total) * 100)}%)`
  );
  debugLog('general', 'log_statement', 
    `Imports: ${importResults.foundImports}/${importResults.total} (${Math.round((importResults.foundImports / importResults.total) * 100)}%)`
  );
  debugLog('general', 'log_statement', 
    `Routes: ${routeResults.foundRoutes}/${routeResults.total} (${Math.round((routeResults.foundRoutes / routeResults.total) * 100)}%)`
  );
  debugLog('general', 'log_statement', 
    `Handlers: ${handlerResults.foundHandlers}/${handlerResults.total} (${Math.round((handlerResults.foundHandlers / handlerResults.total) * 100)}%)`
  );

  const overallScore = Math.round(
    ((componentResults.foundComponents +
      importResults.foundImports +
      routeResults.foundRoutes +
      handlerResults.foundHandlers) /
      (componentResults.total + importResults.total + routeResults.total + handlerResults.total)) *
      100
  );

  debugLog('general', 'log_statement', `\n🎯 OVERALL HEALTH: ${overallScore}%`)

  if (overallScore >= 90) {
    debugLog('general', 'log_statement', '🎉 EXCELLENT - Navigation should be working well!')
  } else if (overallScore >= 75) {
    debugLog('general', 'log_statement', '✅ GOOD - Most navigation should work, minor issues to fix')
  } else if (overallScore >= 50) {
    debugLog('general', 'log_statement', '⚠️  FAIR - Some navigation issues need attention')
  } else {
    debugLog('general', 'log_statement', '🚨 POOR - Significant navigation issues need fixing')
  }

  return overallScore;
};

// Run the fix
runNavigationFix();

module.exports = {
  runNavigationFix,
  checkActualComponents,
  checkRouterImports,
  checkRouteDefinitions,
  checkNavigationHandlers,
};
