import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node

// Comprehensive Navigation Test Script
// This script tests all navigation items to identify which ones are not working

const fs = require('fs');
const path = require('path');

debugLog('general', 'log_statement', '🔍 COMPREHENSIVE NAVIGATION TEST')
debugLog('general', 'log_statement', '================================\n')

// Define all navigation routes that should exist
const navigationRoutes = [
  // Main routes
  { name: 'Dashboard', path: '/dashboard', component: 'RoleBasedDashboard' },
  { name: 'EVA AI Assistant', path: '/ai-assistant', component: 'AIAssistantPage' },

  // Credit Application routes
  { name: 'Credit Application', path: '/credit-application', component: 'CreditApplication' },
  { name: 'Auto Originations', path: '/auto-originations', component: 'AutoOriginationsDashboard' },
  { name: 'Transaction Summary', path: '/transaction-summary', component: 'TransactionSummary' },

  // Customer Retention routes
  {
    name: 'Customer Retention',
    path: '/customer-retention',
    component: 'CustomerRetentionDashboard',
  },
  {
    name: 'Customer Retention Customers',
    path: '/customer-retention/customers',
    component: 'CustomerRetentionCustomers',
  },
  {
    name: 'Customer Retention Contacts',
    path: '/customer-retention/contacts',
    component: 'CustomerRetentionContacts',
  },
  {
    name: 'Customer Retention Commitments',
    path: '/customer-retention/commitments',
    component: 'CustomerRetentionCommitments',
  },
  { name: 'Calendar Integration', path: '/calendar-integration', component: 'CalendarIntegration' },
  { name: 'Post Closing', path: '/post-closing', component: 'PostClosingCustomers' },

  // Filelock Drive routes
  { name: 'Documents', path: '/documents', component: 'DocumentCenter' },
  { name: 'Shield Vault', path: '/shield-vault', component: 'ShieldVault' },
  { name: 'Safe Forms', path: '/forms', component: 'SafeForms' },

  // Risk Map Navigator routes
  { name: 'Risk Assessment', path: '/risk-assessment', component: 'RiskAssessment' },
  { name: 'EVA Risk Report', path: '/risk-assessment/eva-report', component: 'EVARiskReport' },
  { name: 'RiskLab', path: '/risk-assessment/lab', component: 'RiskLab' },

  // Deal Structuring routes
  { name: 'Deal Structuring', path: '/deal-structuring', component: 'DealStructuring' },
  { name: 'Smart Match', path: '/deal-structuring/smart-match', component: 'SmartMatch' },
  {
    name: 'Transaction Execution',
    path: '/transaction-execution',
    component: 'TransactionExecution',
  },

  // Asset Press routes
  { name: 'Asset Press', path: '/asset-press', component: 'AssetPress' },
  { name: 'Commercial Market', path: '/commercial-market', component: 'CommercialMarket' },

  // Portfolio Navigator routes
  { name: 'Portfolio Wallet', path: '/portfolio-wallet', component: 'PortfolioWallet' },
  { name: 'Asset Portfolio', path: '/asset-portfolio', component: 'AssetPortfolio' },

  // Other routes
  { name: 'Demo Mode', path: '/demo-mode', component: 'DemoMode' },
  { name: 'Team Management', path: '/team-management', component: 'TeamManagement' },
];

// Check if router configuration exists
const checkRouterConfig = () => {
  debugLog('general', 'log_statement', '1️⃣ CHECKING ROUTER CONFIGURATION')
  debugLog('general', 'log_statement', '================================')

  const routerPath = 'src/components/routing/LoadableRouter.tsx';

  if (!fs.existsSync(routerPath)) {
    debugLog('general', 'log_statement', '❌ Router file not found:', routerPath)
    return false;
  }

  const routerContent = fs.readFileSync(routerPath, 'utf8');
  let foundRoutes = 0;
  let missingRoutes = [];

  navigationRoutes.forEach(route => {
    if (routerContent.includes(`path="${route.path}"`)) {
      debugLog('general', 'log_statement', `✅ ${route.name} - Route configured`)
      foundRoutes++;
    } else {
      debugLog('general', 'log_statement', `❌ ${route.name} - Route MISSING`)
      missingRoutes.push(route);
    }
  });

  debugLog('general', 'log_statement', `\n📊 Router Summary: ${foundRoutes}/${navigationRoutes.length} routes found`)

  if (missingRoutes.length > 0) {
    debugLog('general', 'log_statement', '\n🚨 MISSING ROUTES:')
    missingRoutes.forEach(route => {
      debugLog('general', 'log_statement', `   - ${route.name} (${route.path})`);
    });
  }

  return missingRoutes.length === 0;
};

// Check if components exist
const checkComponents = () => {
  debugLog('general', 'log_statement', '\n2️⃣ CHECKING COMPONENT FILES')
  debugLog('general', 'log_statement', '===========================')

  const componentPaths = [
    // Pages
    'src/pages/RoleBasedDashboard.tsx',
    'src/pages/AIAssistantPage.tsx',
    'src/pages/customerRetention/CustomerRetentionDashboard.tsx',
    'src/pages/customerRetention/CustomerRetentionCustomers.tsx',
    'src/pages/customerRetention/CustomerRetentionContacts.tsx',
    'src/pages/customerRetention/CustomerRetentionCommitments.tsx',
    'src/pages/shield-vault/ShieldVault.tsx',
    'src/pages/safe-forms/SafeForms.tsx',
    'src/pages/risk-assessment/eva-report/EVARiskReport.tsx',

    // Components
    'src/components/credit/CreditApplication.tsx',
    'src/components/dashboard/AutoOriginationsDashboard.tsx',
    'src/components/transactions/TransactionSummary.tsx',
    'src/components/document/DocumentCenter.tsx',
    'src/components/risk/RiskAssessment.tsx',
    'src/components/risk/RiskLab.tsx',
    'src/components/deal/DealStructuring.tsx',
    'src/components/deal/SmartMatch.tsx',
    'src/components/deal/TransactionExecution.tsx',
    'src/components/asset/AssetPress.tsx',
    'src/components/asset/CommercialMarket.tsx',
    'src/components/portfolio/PortfolioWallet.tsx',
    'src/components/portfolio/AssetPortfolio.tsx',
    'src/components/demo/DemoMode.tsx',
    'src/components/team/TeamManagement.tsx',
    'src/components/customerRetention/CalendarIntegration.tsx',
    'src/components/customerRetention/PostClosingCustomers.tsx',
  ];

  let foundComponents = 0;
  let missingComponents = [];

  componentPaths.forEach(componentPath => {
    if (fs.existsSync(componentPath)) {
      debugLog('general', 'log_statement', `✅ ${path.basename(componentPath)} - EXISTS`);
      foundComponents++;
    } else {
      debugLog('general', 'log_statement', `❌ ${path.basename(componentPath)} - MISSING`);
      missingComponents.push(componentPath);
    }
  });

  debugLog('general', 'log_statement', 
    `\n📊 Components Summary: ${foundComponents}/${componentPaths.length} components found`
  )

  if (missingComponents.length > 0) {
    debugLog('general', 'log_statement', '\n🚨 MISSING COMPONENTS:')
    missingComponents.forEach(component => {
      debugLog('general', 'log_statement', `   - ${component}`)
    });
  }

  return missingComponents.length === 0;
};

// Check navigation configuration
const checkNavigationConfig = () => {
  debugLog('general', 'log_statement', '\n3️⃣ CHECKING NAVIGATION CONFIGURATION')
  debugLog('general', 'log_statement', '====================================')

  const navPath = 'src/components/layout/SideNavigation.tsx';

  if (!fs.existsSync(navPath)) {
    debugLog('general', 'log_statement', '❌ Navigation file not found:', navPath)
    return false;
  }

  const navContent = fs.readFileSync(navPath, 'utf8');
  let foundNavItems = 0;
  let missingNavItems = [];

  navigationRoutes.forEach(route => {
    if (
      navContent.includes(`href: '${route.path}'`) ||
      navContent.includes(`href='${route.path}'`)
    ) {
      debugLog('general', 'log_statement', `✅ ${route.name} - Navigation configured`)
      foundNavItems++;
    } else {
      debugLog('general', 'log_statement', `❌ ${route.name} - Navigation MISSING`)
      missingNavItems.push(route);
    }
  });

  debugLog('general', 'log_statement', 
    `\n📊 Navigation Summary: ${foundNavItems}/${navigationRoutes.length} nav items found`
  )

  if (missingNavItems.length > 0) {
    debugLog('general', 'log_statement', '\n🚨 MISSING NAVIGATION ITEMS:')
    missingNavItems.forEach(item => {
      debugLog('general', 'log_statement', `   - ${item.name} (${item.path})`);
    });
  }

  return missingNavItems.length === 0;
};

// Check for import errors in key files
const checkImportErrors = () => {
  debugLog('general', 'log_statement', '\n4️⃣ CHECKING FOR IMPORT ERRORS')
  debugLog('general', 'log_statement', '=============================')

  const filesToCheck = [
    'src/components/routing/LoadableRouter.tsx',
    'src/components/dashboard/AutoOriginationsDashboard.tsx',
    'src/pages/AIAssistantPage.tsx',
  ];

  let hasErrors = false;

  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for common import issues
      const imports = content.match(/import.*from.*['"][^'"]+['"]/g) || [];
      let fileHasIssues = false;

      imports.forEach(importLine => {
        // Check for relative imports that might be broken
        if (importLine.includes('../') && importLine.includes('components')) {
          debugLog('general', 'log_statement', `⚠️  ${filePath}: Potential import issue - ${importLine}`)
          fileHasIssues = true;
          hasErrors = true;
        }
      });

      if (!fileHasIssues) {
        debugLog('general', 'log_statement', `✅ ${filePath}: No obvious import issues`)
      }
    } else {
      debugLog('general', 'log_statement', `❌ ${filePath}: File not found`)
      hasErrors = true;
    }
  });

  return !hasErrors;
};

// Generate fix recommendations
const generateFixRecommendations = () => {
  debugLog('general', 'log_statement', '\n5️⃣ FIX RECOMMENDATIONS')
  debugLog('general', 'log_statement', '======================')

  debugLog('general', 'log_statement', 'Based on the analysis above, here are the recommended fixes:')
  debugLog('general', 'log_statement', '')

  debugLog('general', 'log_statement', '🔧 IMMEDIATE FIXES NEEDED:')
  debugLog('general', 'log_statement', '1. Check AutoOriginationsDashboard import path')
  debugLog('general', 'log_statement', '2. Verify all component files exist')
  debugLog('general', 'log_statement', '3. Ensure router configuration is complete')
  debugLog('general', 'log_statement', '4. Check navigation onClick handlers')
  debugLog('general', 'log_statement', '')

  debugLog('general', 'log_statement', '🚀 TESTING STEPS:')
  debugLog('general', 'log_statement', '1. Run: npm start')
  debugLog('general', 'log_statement', '2. Open browser console')
  debugLog('general', 'log_statement', '3. Click each navigation item')
  debugLog('general', 'log_statement', '4. Check for console errors')
  debugLog('general', 'log_statement', '5. Verify page loads correctly')
  debugLog('general', 'log_statement', '')

  debugLog('general', 'log_statement', '📝 BROWSER CONSOLE TEST:')
  debugLog('general', 'log_statement', 'Run this in browser console to test navigation:')
  debugLog('general', 'log_statement', '')
  debugLog('general', 'log_statement', '// Test all navigation items')
  debugLog('general', 'log_statement', 'const testNavigation = () => {');
  debugLog('general', 'log_statement', 
    '  const navItems = document.querySelectorAll("[data-testid*=nav], .nav-item, a[href^=\\"/\\"]")'
  );
  debugLog('general', 'log_statement', '  console.log("Found", navItems.length, "navigation items")');
  debugLog('general', 'log_statement', '  navItems.forEach((item, index) => {');
  debugLog('general', 'log_statement', 
    '    console.log(`${index + 1}. ${item.textContent?.trim()} - ${item.href || item.getAttribute("data-href")}`);'
  );
  debugLog('general', 'log_statement', '  })');
  debugLog('general', 'log_statement', '};')
  debugLog('general', 'log_statement', 'testNavigation()');
};

// Main execution
const runComprehensiveTest = () => {
  const routerOk = checkRouterConfig();
  const componentsOk = checkComponents();
  const navigationOk = checkNavigationConfig();
  const importsOk = checkImportErrors();

  generateFixRecommendations();

  debugLog('general', 'log_statement', '\n📊 OVERALL SUMMARY')
  debugLog('general', 'log_statement', '==================')
  debugLog('general', 'log_statement', `Router Configuration: ${routerOk ? '✅ GOOD' : '❌ ISSUES'}`)
  debugLog('general', 'log_statement', `Component Files: ${componentsOk ? '✅ GOOD' : '❌ ISSUES'}`)
  debugLog('general', 'log_statement', `Navigation Config: ${navigationOk ? '✅ GOOD' : '❌ ISSUES'}`)
  debugLog('general', 'log_statement', `Import Statements: ${importsOk ? '✅ GOOD' : '❌ ISSUES'}`)

  const allGood = routerOk && componentsOk && navigationOk && importsOk;

  debugLog('general', 'log_statement', `\n🎯 OVERALL STATUS: ${allGood ? '🎉 ALL GOOD' : '⚠️  NEEDS ATTENTION'}`)

  if (!allGood) {
    debugLog('general', 'log_statement', '\n🔥 PRIORITY FIXES:')
    if (!routerOk) debugLog('general', 'log_statement', '1. Fix router configuration')
    if (!componentsOk) debugLog('general', 'log_statement', '2. Create missing components')
    if (!navigationOk) debugLog('general', 'log_statement', '3. Fix navigation configuration')
    if (!importsOk) debugLog('general', 'log_statement', '4. Fix import statements')
  }

  return allGood;
};

// Run the test
runComprehensiveTest();

module.exports = {
  runComprehensiveTest,
  checkRouterConfig,
  checkComponents,
  checkNavigationConfig,
  checkImportErrors,
};
