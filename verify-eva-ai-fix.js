import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node

// Quick verification script for EVA AI fixes
const fs = require('fs');

debugLog('general', 'log_statement', '🔍 EVA AI Fix Verification\n')

// Check 1: Verify App.tsx doesn't have duplicate rendering
const appContent = fs.readFileSync('src/App.tsx', 'utf8');
const hasDuplicateRendering = appContent.includes(
  "location.pathname === '/ai-assistant' && <AIAssistantPage />"
);

debugLog('general', 'log_statement', 
  `1. Duplicate rendering removed: ${hasDuplicateRendering ? '❌ STILL EXISTS' : '✅ FIXED'}`
)

// Check 2: Verify route exists
const routerContent = fs.readFileSync('src/components/routing/LoadableRouter.tsx', 'utf8');
const hasRoute =
  routerContent.includes('path="/ai-assistant"') && routerContent.includes('<AIAssistantPage />');

debugLog('general', 'log_statement', `2. Route configuration: ${hasRoute ? '✅ WORKING' : '❌ MISSING'}`)

// Check 3: Verify navigation exists
const navContent = fs.readFileSync('src/components/layout/SideNavigation.tsx', 'utf8');
const hasNavigation =
  navContent.includes("href: '/ai-assistant'") &&
  navContent.includes("safeNavigate('/ai-assistant')");

debugLog('general', 'log_statement', `3. Navigation configuration: ${hasNavigation ? '✅ WORKING' : '❌ MISSING'}`)

// Check 4: Verify all components exist
const components = [
  'src/pages/AIAssistantPage.tsx',
  'src/components/EVAAssistantWithCustomAgents.tsx',
  'src/components/EVAAssistantManager.tsx',
  'src/components/EVAAssistantChat.tsx',
  'src/components/CreateCustomAIAgent.tsx',
];

let allComponentsExist = true;
components.forEach(component => {
  const exists = fs.existsSync(component);
  if (!exists) allComponentsExist = false;
});

debugLog('general', 'log_statement', `4. All components exist: ${allComponentsExist ? '✅ VERIFIED' : '❌ MISSING'}`)

// Summary
const allFixed = !hasDuplicateRendering && hasRoute && hasNavigation && allComponentsExist;

debugLog('general', 'log_statement', '\n📊 SUMMARY')
debugLog('general', 'log_statement', '==========')
debugLog('general', 'log_statement', `Overall Status: ${allFixed ? '🎉 ALL FIXES SUCCESSFUL' : '⚠️  SOME ISSUES REMAIN'}`)

if (allFixed) {
  debugLog('general', 'log_statement', '\n✅ EVA AI Interface should be working!')
  debugLog('general', 'log_statement', '\n🚀 Test it now:')
  debugLog('general', 'log_statement', '1. Go to your browser')
  debugLog('general', 'log_statement', '2. Click "Eva AI Assistant" in the left sidebar')
  debugLog('general', 'log_statement', '3. Or navigate directly to: http://localhost:3000/ai-assistant')
  debugLog('general', 'log_statement', '4. Look for the EVA widget button (🧠 icon)');
} else {
  debugLog('general', 'log_statement', '\n❌ Some issues need attention. Check the failed items above.')
}

debugLog('general', 'log_statement', '\n📝 For detailed testing, run eva-ai-test.js in your browser console.')
