import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node

// EVA Platform Navigation Implementation Audit
// This script audits the navigation implementation to ensure all updates are properly wired

const fs = require('fs');
const path = require('path');

debugLog('general', 'log_statement', '🔍 EVA Platform Navigation Implementation Audit')
debugLog('general', 'log_statement', '='.repeat(50));

const auditResults = {
  sideNavigation: { found: false, issues: [] },
  loadableRouter: { found: false, issues: [] },
  newSections: {
    productsServices: { defined: false, routed: false, issues: [] },
    smartMatching: { defined: false, routed: false, issues: [] },
    termRequestDetails: { defined: false, routed: false, issues: [] },
  },
  compilationIssues: [],
};

// Check SideNavigation.tsx
debugLog('general', 'log_statement', '\n📋 Auditing SideNavigation.tsx...')
const sideNavPath = 'src/components/layout/SideNavigation.tsx';
if (fs.existsSync(sideNavPath)) {
  auditResults.sideNavigation.found = true;
  const sideNavContent = fs.readFileSync(sideNavPath, 'utf8');

  // Check for Products & Services
  if (sideNavContent.includes("name: 'Products & Services'")) {
    auditResults.newSections.productsServices.defined = true;
    debugLog('general', 'log_statement', '  ✅ Products & Services section found')
  } else {
    auditResults.newSections.productsServices.issues.push(
      'Products & Services section not found in navigation'
    );
    debugLog('general', 'log_statement', '  ❌ Products & Services section NOT found')
  }

  // Check for Smart Matching
  if (sideNavContent.includes("name: 'Smart Matching'")) {
    auditResults.newSections.smartMatching.defined = true;
    debugLog('general', 'log_statement', '  ✅ Smart Matching section found')
  } else {
    auditResults.newSections.smartMatching.issues.push(
      'Smart Matching section not found in navigation'
    );
    debugLog('general', 'log_statement', '  ❌ Smart Matching section NOT found')
  }

  // Check for Term Request Details
  if (sideNavContent.includes("name: 'Term Request Details'")) {
    auditResults.newSections.termRequestDetails.defined = true;
    debugLog('general', 'log_statement', '  ✅ Term Request Details found in Credit Application submenu')
  } else {
    auditResults.newSections.termRequestDetails.issues.push(
      'Term Request Details not found in Credit Application submenu'
    );
    debugLog('general', 'log_statement', '  ❌ Term Request Details NOT found')
  }

  // Check for proper structure
  const navigationItemsMatch = sideNavContent.match(/const navigationItems = \[(.*?)\];/s);
  if (navigationItemsMatch) {
    debugLog('general', 'log_statement', '  ✅ navigationItems array found')
  } else {
    auditResults.sideNavigation.issues.push('navigationItems array structure issue');
    debugLog('general', 'log_statement', '  ⚠️  navigationItems array structure may have issues')
  }

  // Check for filteredNavigationItems usage
  if (sideNavContent.includes('filteredNavigationItems.map')) {
    debugLog('general', 'log_statement', '  ✅ filteredNavigationItems properly used')
  } else {
    auditResults.sideNavigation.issues.push('filteredNavigationItems not properly used');
    debugLog('general', 'log_statement', '  ❌ filteredNavigationItems not properly used')
  }
} else {
  auditResults.sideNavigation.issues.push('SideNavigation.tsx file not found');
  debugLog('general', 'log_statement', '  ❌ SideNavigation.tsx file not found')
}

// Check LoadableRouter.tsx
debugLog('general', 'log_statement', '\n🛣️  Auditing LoadableRouter.tsx...')
const routerPath = 'src/components/routing/LoadableRouter.tsx';
if (fs.existsSync(routerPath)) {
  auditResults.loadableRouter.found = true;
  const routerContent = fs.readFileSync(routerPath, 'utf8');

  // Check for Products & Services routes
  if (routerContent.includes('/products-services')) {
    auditResults.newSections.productsServices.routed = true;
    debugLog('general', 'log_statement', '  ✅ Products & Services routes found')
  } else {
    auditResults.newSections.productsServices.issues.push('Products & Services routes not found');
    debugLog('general', 'log_statement', '  ❌ Products & Services routes NOT found')
  }

  // Check for Smart Matching routes
  if (routerContent.includes('/smart-matching')) {
    auditResults.newSections.smartMatching.routed = true;
    debugLog('general', 'log_statement', '  ✅ Smart Matching routes found')
  } else {
    auditResults.newSections.smartMatching.issues.push('Smart Matching routes not found');
    debugLog('general', 'log_statement', '  ❌ Smart Matching routes NOT found')
  }

  // Check for Term Request Details routes
  if (routerContent.includes('/term-request-details')) {
    auditResults.newSections.termRequestDetails.routed = true;
    debugLog('general', 'log_statement', '  ✅ Term Request Details routes found')
  } else {
    auditResults.newSections.termRequestDetails.issues.push(
      'Term Request Details routes not found'
    );
    debugLog('general', 'log_statement', '  ❌ Term Request Details routes NOT found')
  }
} else {
  auditResults.loadableRouter.issues.push('LoadableRouter.tsx file not found');
  debugLog('general', 'log_statement', '  ❌ LoadableRouter.tsx file not found')
}

// Check for compilation issues
debugLog('general', 'log_statement', '\n🔧 Checking for potential compilation issues...')

// Check package.json
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  debugLog('general', 'log_statement', '  ✅ package.json found')
  debugLog('general', 'log_statement', `  📦 React version: ${packageJson.dependencies?.react || 'not found'}`)
  debugLog('general', 'log_statement', 
    `  📦 TypeScript: ${packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript || 'not found'}`
  )
} else {
  auditResults.compilationIssues.push('package.json not found');
  debugLog('general', 'log_statement', '  ❌ package.json not found')
}

// Check tsconfig.json
if (fs.existsSync('tsconfig.json')) {
  debugLog('general', 'log_statement', '  ✅ tsconfig.json found')
} else {
  auditResults.compilationIssues.push('tsconfig.json not found');
  debugLog('general', 'log_statement', '  ❌ tsconfig.json not found')
}

// Generate audit summary
debugLog('general', 'log_statement', '\n📊 AUDIT SUMMARY')
debugLog('general', 'log_statement', '='.repeat(50));

debugLog('general', 'log_statement', '\n🎯 Navigation Sections Status:')
Object.entries(auditResults.newSections).forEach(([section, status]) => {
  const sectionName = section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  debugLog('general', 'log_statement', `  ${sectionName}:`)
  debugLog('general', 'log_statement', `    Defined in navigation: ${status.defined ? '✅' : '❌'}`)
  debugLog('general', 'log_statement', `    Routes configured: ${status.routed ? '✅' : '❌'}`)
  if (status.issues.length > 0) {
    debugLog('general', 'log_statement', `    Issues: ${status.issues.join(', ')}`);
  }
});

debugLog('general', 'log_statement', '\n🔧 Core Files Status:')
debugLog('general', 'log_statement', `  SideNavigation.tsx: ${auditResults.sideNavigation.found ? '✅' : '❌'}`)
debugLog('general', 'log_statement', `  LoadableRouter.tsx: ${auditResults.loadableRouter.found ? '✅' : '❌'}`)

const totalIssues = [
  ...auditResults.sideNavigation.issues,
  ...auditResults.loadableRouter.issues,
  ...auditResults.compilationIssues,
  ...Object.values(auditResults.newSections).flatMap(section => section.issues),
];

if (totalIssues.length === 0) {
  debugLog('general', 'log_statement', '\n🎉 ALL CHECKS PASSED! Navigation should be working correctly.')
  debugLog('general', 'log_statement', "\nIf you're still not seeing updates in the UI:")
  debugLog('general', 'log_statement', '  1. Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)');
  debugLog('general', 'log_statement', '  2. Check browser console for JavaScript errors')
  debugLog('general', 'log_statement', '  3. Verify the server is running on http://localhost:3000')
  debugLog('general', 'log_statement', '  4. Run the debug-navigation.js script in browser console')
} else {
  debugLog('general', 'log_statement', `\n⚠️  FOUND ${totalIssues.length} ISSUES:`)
  totalIssues.forEach((issue, index) => {
    debugLog('general', 'log_statement', `  ${index + 1}. ${issue}`)
  });
}

debugLog('general', 'log_statement', '\n🛠️  Next Steps:')
debugLog('general', 'log_statement', '  1. Start the server: npm start')
debugLog('general', 'log_statement', '  2. Open http://localhost:3000 in browser')
debugLog('general', 'log_statement', '  3. Open browser developer tools console')
debugLog('general', 'log_statement', '  4. Run the debug script: copy/paste debug-navigation.js content')
debugLog('general', 'log_statement', '  5. Check console output for any JavaScript errors')

// Create a simple HTML test page
const testPageContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EVA Platform Navigation Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>EVA Platform Navigation Test</h1>
    <p>This page helps verify that navigation updates are properly implemented.</p>

    <div class="status success">
        <h3>✅ Expected Navigation Items</h3>
        <ul>
            <li><strong>Products & Services</strong> - New section with 4 subsections</li>
            <li><strong>Smart Matching</strong> - AI-powered section with 4 subsections</li>
            <li><strong>Term Request Details</strong> - 6th item in Credit Application submenu</li>
        </ul>
    </div>

    <div class="status warning">
        <h3>🧪 Testing Instructions</h3>
        <ol>
            <li>Open EVA Platform in another tab: <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></li>
            <li>Look for the new navigation items listed above</li>
            <li>Click on "Credit Application" to expand and verify "Term Request Details" is the 6th item</li>
            <li>Click on "Products & Services" and "Smart Matching" to verify they expand</li>
            <li>If items are missing, check browser console for errors</li>
        </ol>
    </div>

    <div class="status error">
        <h3>🐛 Troubleshooting</h3>
        <p>If navigation items are not visible:</p>
        <ul>
            <li>Clear browser cache (Hard Refresh: Cmd+Shift+R / Ctrl+Shift+R)</li>
            <li>Check browser console for JavaScript errors</li>
            <li>Verify server is running and no compilation errors</li>
            <li>Run debug script in browser console (see debug-navigation.js)</li>
        </ul>
    </div>

    <script>
        // Auto-refresh if navigation not detected
        setTimeout(() => {
            if (window.opener && !window.opener.closed) {
                debugLog('general', 'log_statement', 'Testing navigation in main window...')
                // You can add cross-window communication here if needed
            }
        }, 2000);
    </script>
</body>
</html>`;

fs.writeFileSync('navigation-test.html', testPageContent);
debugLog('general', 'log_statement', '\n📄 Created navigation-test.html for easy testing')

debugLog('general', 'log_statement', '\n' + '='.repeat(50));
debugLog('general', 'log_statement', '🔍 Audit Complete')
