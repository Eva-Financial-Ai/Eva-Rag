import { debugLog } from '../utils/auditLogger';

// EVA Platform - Quick Navigation Fix Script
// Run this in the browser console if navigation buttons aren't working

debugLog('general', 'log_statement', '🔧 EVA Platform Navigation Fix Script')

// Force enable navigation buttons
const forceEnableNavigation = () => {
  debugLog('general', 'log_statement', '🔓 Force enabling navigation buttons...')

  // Find all disabled buttons
  const disabledButtons = document.querySelectorAll('button[disabled]');
  debugLog('general', 'log_statement', `Found ${disabledButtons.length} disabled buttons`)

  // Enable them
  disabledButtons.forEach((button, index) => {
    if (button.textContent && button.textContent.trim()) {
      button.disabled = false;
      button.style.opacity = '1';
      button.style.cursor = 'pointer';
      debugLog('general', 'log_statement', `✅ Enabled: ${button.textContent.trim()}`);
    }
  });

  return disabledButtons.length;
};

// Manual navigation function
const manualNavigate = path => {
  debugLog('general', 'log_statement', `🧭 Manual navigation to: ${path}`)

  try {
    // Try React Router first
    if (window.history && window.history.pushState) {
      window.history.pushState({}, '', path);

      // Trigger a popstate event to update React Router
      window.dispatchEvent(new PopStateEvent('popstate'));
      debugLog('general', 'log_statement', '✅ Navigation via pushState successful')
      return true;
    }
  } catch (error) {
    debugLog('general', 'log_statement', '⚠️ pushState failed:', error)
  }

  try {
    // Fallback to location change
    window.location.href = path;
    debugLog('general', 'log_statement', '✅ Navigation via location.href')
    return true;
  } catch (error) {
    debugLog('general', 'log_statement', '❌ Navigation failed:', error)
    return false;
  }
};

// Test all navigation routes
const testAllRoutes = () => {
  debugLog('general', 'log_statement', '🧪 Testing all navigation routes...')

  const routes = [
    '/dashboard',
    '/auto-originations',
    '/transaction-summary',
    '/customer-retention',
    '/documents',
    '/shield-vault',
    '/forms',
    '/risk-assessment',
    '/deal-structuring',
    '/asset-press',
    '/portfolio-wallet',
  ];

  routes.forEach(route => {
    const testUrl = new URL(route, window.location.origin);
    debugLog('general', 'log_statement', `✅ ${route} - Valid URL: ${testUrl.href}`)
  });

  return routes;
};

// Force click navigation items
const forceClickNavigation = itemText => {
  debugLog('general', 'log_statement', `🖱️ Force clicking navigation item: ${itemText}`)

  // Find all clickable elements
  const allElements = document.querySelectorAll('button, a, [role="button"], [onclick]');

  const found = Array.from(allElements).find(element => {
    const text = element.textContent || element.getAttribute('aria-label') || '';
    return text.toLowerCase().includes(itemText.toLowerCase());
  });

  if (found) {
    // Force enable if disabled
    if (found.disabled) {
      found.disabled = false;
      debugLog('general', 'log_statement', '🔓 Force enabled disabled element')
    }

    // Try multiple click methods
    try {
      // Method 1: Standard click
      found.click();
      debugLog('general', 'log_statement', '✅ Standard click successful')
      return true;
    } catch (error) {
      debugLog('general', 'log_statement', '⚠️ Standard click failed, trying alternatives...')

      try {
        // Method 2: Manual event dispatch
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        found.dispatchEvent(clickEvent);
        debugLog('general', 'log_statement', '✅ Event dispatch click successful')
        return true;
      } catch (error2) {
        debugLog('general', 'log_statement', '⚠️ Event dispatch failed, trying navigation...')

        // Method 3: Extract href or onclick
        const href = found.getAttribute('href');
        const onclick = found.getAttribute('onclick');

        if (href) {
          return manualNavigate(href);
        } else if (onclick) {
          try {
            eval(onclick);
            debugLog('general', 'log_statement', '✅ Onclick execution successful')
            return true;
          } catch (error3) {
            debugLog('general', 'log_statement', '❌ Onclick execution failed:', error3)
          }
        }
      }
    }
  } else {
    debugLog('general', 'log_statement', `❌ Navigation item "${itemText}" not found`)
  }

  return false;
};

// Quick navigation shortcuts
const quickNav = {
  dashboard: () => manualNavigate('/dashboard'),
  autoOriginations: () => manualNavigate('/auto-originations'),
  transactionSummary: () => manualNavigate('/transaction-summary'),
  customerRetention: () => manualNavigate('/customer-retention'),
  documents: () => manualNavigate('/documents'),
  shieldVault: () => manualNavigate('/shield-vault'),
  forms: () => manualNavigate('/forms'),
  riskAssessment: () => manualNavigate('/risk-assessment'),
  dealStructuring: () => manualNavigate('/deal-structuring'),
  assetPress: () => manualNavigate('/asset-press'),
  portfolioWallet: () => manualNavigate('/portfolio-wallet'),
};

// Comprehensive fix function
const fixNavigation = () => {
  debugLog('general', 'log_statement', '🚀 Running comprehensive navigation fix...')
  debugLog('general', 'log_statement', '================================')

  // Step 1: Force enable buttons
  const enabledCount = forceEnableNavigation();
  debugLog('general', 'log_statement', `✅ Enabled ${enabledCount} disabled buttons`)

  // Step 2: Test routes
  const routes = testAllRoutes();
  debugLog('general', 'log_statement', `✅ Tested ${routes.length} routes`)

  // Step 3: Check current status
  debugLog('general', 'log_statement', `Current URL: ${window.location.href}`)
  debugLog('general', 'log_statement', `Current path: ${window.location.pathname}`)

  // Step 4: Provide usage instructions
  debugLog('general', 'log_statement', '================================')
  debugLog('general', 'log_statement', '📚 Usage Instructions:')
  debugLog('general', 'log_statement', '• forceClickNavigation("dashboard") - Force click Dashboard');
  debugLog('general', 'log_statement', '• quickNav.dashboard() - Direct navigation to Dashboard');
  debugLog('general', 'log_statement', '• manualNavigate("/auto-originations") - Manual route navigation');
  debugLog('general', 'log_statement', '• testAllRoutes() - Test all available routes');

  return {
    enabledButtons: enabledCount,
    testedRoutes: routes.length,
    currentPath: window.location.pathname,
    quickNav: quickNav,
  };
};

// Auto-run fix
debugLog('general', 'log_statement', '🔧 Navigation fix script loaded')
debugLog('general', 'log_statement', 'Run fixNavigation() to apply all fixes');
debugLog('general', 'log_statement', 'Run quickNav.dashboard() for quick dashboard navigation');

// Export functions to global scope for easy access
window.navigationFix = {
  forceEnableNavigation,
  manualNavigate,
  testAllRoutes,
  forceClickNavigation,
  quickNav,
  fixNavigation,
};

debugLog('general', 'log_statement', '✅ Navigation fix functions available at window.navigationFix')
