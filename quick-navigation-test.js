import { debugLog } from '../utils/auditLogger';

// Quick Navigation Test Script
// Run this in the browser console to quickly test navigation functionality

const quickNavTest = {
  results: [],

  // Test a single navigation item
  testNavItem: function (selector, name, expectedPath) {
    try {
      const element = document.querySelector(selector);

      if (!element) {
        this.results.push({ name, status: '❌', issue: 'Element not found', selector });
        return false;
      }

      // Check if element is visible and clickable
      const rect = element.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0;
      const isClickable =
        element.tagName === 'BUTTON' || element.tagName === 'A' || element.onclick;

      if (!isVisible) {
        this.results.push({ name, status: '⚠️', issue: 'Element not visible', selector });
        return false;
      }

      if (!isClickable) {
        this.results.push({ name, status: '⚠️', issue: 'Element may not be clickable', selector });
        return false;
      }

      this.results.push({ name, status: '✅', issue: 'Working correctly', selector });
      return true;
    } catch (error) {
      this.results.push({ name, status: '❌', issue: error.message, selector });
      return false;
    }
  },

  // Test all main navigation items
  testMainNavigation: function () {
    debugLog('general', 'log_statement', '🔍 Testing main navigation items...')

    const mainItems = [
      { name: 'Dashboard', selector: 'a[href="/dashboard"], button[onclick*="dashboard"]' },
      {
        name: 'Eva AI Assistant',
        selector: 'a[href="/ai-assistant"], button[onclick*="ai-assistant"]',
      },
      {
        name: 'Credit Application',
        selector: 'button:contains("Credit Application"), a:contains("Credit Application")',
      },
      {
        name: 'Customer Retention',
        selector: 'button:contains("Customer Retention"), a:contains("Customer Retention")',
      },
      {
        name: 'Filelock Drive',
        selector: 'button:contains("Filelock Drive"), a:contains("Filelock Drive")',
      },
      {
        name: 'Risk Map Navigator',
        selector: 'button:contains("Risk Map Navigator"), a:contains("Risk Map Navigator")',
      },
      {
        name: 'Deal Structuring',
        selector: 'button:contains("Deal Structuring"), a:contains("Deal Structuring")',
      },
      {
        name: 'Asset Press',
        selector: 'button:contains("Asset Press"), a:contains("Asset Press")',
      },
      {
        name: 'Portfolio Navigator',
        selector: 'button:contains("Portfolio Navigator"), a:contains("Portfolio Navigator")',
      },
    ];

    mainItems.forEach(item => {
      // Try multiple selector strategies
      const selectors = [
        item.selector,
        `[aria-label*="${item.name}"]`,
        `[title*="${item.name}"]`,
        `li:contains("${item.name}") a`,
        `li:contains("${item.name}") button`,
      ];

      let found = false;
      for (const selector of selectors) {
        try {
          if (document.querySelector(selector)) {
            this.testNavItem(selector, item.name);
            found = true;
            break;
          }
        } catch (e) {
          // Selector might not be supported, continue
        }
      }

      if (!found) {
        this.results.push({
          name: item.name,
          status: '❌',
          issue: 'Element not found with any selector',
          selector: 'Multiple tried',
        });
      }
    });
  },

  // Test sidebar functionality
  testSidebarFunctionality: function () {
    debugLog('general', 'log_statement', '🔍 Testing sidebar functionality...')

    // Test sidebar toggle
    const toggleSelectors = [
      '[aria-label*="Toggle sidebar"]',
      '[aria-label*="Expand sidebar"]',
      '[aria-label*="Collapse sidebar"]',
      'button[onclick*="sidebar"]',
      '.sidebar-toggle',
      'button[data-testid="sidebar-toggle"]',
    ];

    let toggleFound = false;
    for (const selector of toggleSelectors) {
      if (this.testNavItem(selector, 'Sidebar Toggle')) {
        toggleFound = true;
        break;
      }
    }

    if (!toggleFound) {
      this.results.push({
        name: 'Sidebar Toggle',
        status: '⚠️',
        issue: 'Toggle button not found',
        selector: 'Various tried',
      });
    }

    // Test sidebar container
    const sidebar =
      document.querySelector('nav') ||
      document.querySelector('.sidebar') ||
      document.querySelector('[role="navigation"]');

    if (sidebar) {
      this.results.push({
        name: 'Sidebar Container',
        status: '✅',
        issue: 'Found and visible',
        selector: sidebar.tagName.toLowerCase(),
      });
    } else {
      this.results.push({
        name: 'Sidebar Container',
        status: '❌',
        issue: 'Sidebar container not found',
        selector: 'nav, .sidebar, [role="navigation"]',
      });
    }
  },

  // Test expandable menus
  testExpandableMenus: function () {
    debugLog('general', 'log_statement', '🔍 Testing expandable menus...')

    const expandableItems = [
      'Credit Application',
      'Customer Retention',
      'Filelock Drive',
      'Risk Map Navigator',
      'Deal Structuring',
      'Asset Press',
      'Portfolio Navigator',
    ];

    expandableItems.forEach(itemName => {
      // Look for expansion indicators
      const selectors = [
        `button:contains("${itemName}") svg`,
        `li:contains("${itemName}") [aria-expanded]`,
        `li:contains("${itemName}") button svg`,
        `[data-testid*="${itemName.toLowerCase().replace(/\s+/g, '-')}"] svg`,
      ];

      let hasExpansionIndicator = false;
      for (const selector of selectors) {
        try {
          if (document.querySelector(selector)) {
            hasExpansionIndicator = true;
            break;
          }
        } catch (e) {
          // Continue
        }
      }

      if (hasExpansionIndicator) {
        this.results.push({
          name: `${itemName} (Expandable)`,
          status: '✅',
          issue: 'Has expansion indicator',
          selector: 'Found',
        });
      } else {
        this.results.push({
          name: `${itemName} (Expandable)`,
          status: '⚠️',
          issue: 'No expansion indicator found',
          selector: 'Various tried',
        });
      }
    });
  },

  // Test badges
  testBadges: function () {
    debugLog('general', 'log_statement', '🔍 Testing navigation badges...')

    const badgeItems = [
      { name: 'Eva AI Assistant', badge: 'New' },
      { name: 'Transaction Summary', badge: 'New' },
      { name: 'Customer Retention', badge: 'New' },
      { name: 'Smart Match', badge: 'New' },
      { name: 'Transaction Execution', badge: 'New' },
      { name: 'Post Closing Customers', badge: 'New' },
      { name: 'Asset Press', badge: 'Beta' },
      { name: 'Portfolio Navigator', badge: 'Beta' },
      { name: 'Demo Mode', badge: 'Development' },
      { name: 'Team Management', badge: 'Auth0' },
    ];

    badgeItems.forEach(item => {
      const badgeSelectors = [
        `li:contains("${item.name}") span:contains("${item.badge}")`,
        `[aria-label*="${item.name}"] span:contains("${item.badge}")`,
        `button:contains("${item.name}") span:contains("${item.badge}")`,
        `a:contains("${item.name}") span:contains("${item.badge}")`,
      ];

      let badgeFound = false;
      for (const selector of badgeSelectors) {
        try {
          if (document.querySelector(selector)) {
            badgeFound = true;
            break;
          }
        } catch (e) {
          // Continue
        }
      }

      if (badgeFound) {
        this.results.push({
          name: `${item.name} Badge`,
          status: '✅',
          issue: `"${item.badge}" badge found`,
          selector: 'Found',
        });
      } else {
        this.results.push({
          name: `${item.name} Badge`,
          status: '⚠️',
          issue: `"${item.badge}" badge not found`,
          selector: 'Various tried',
        });
      }
    });
  },

  // Test responsive behavior
  testResponsive: function () {
    debugLog('general', 'log_statement', '🔍 Testing responsive behavior...')

    const currentWidth = window.innerWidth;
    const isMobile = currentWidth < 768;
    const isTablet = currentWidth >= 768 && currentWidth < 1024;
    const isDesktop = currentWidth >= 1024;

    this.results.push({
      name: 'Screen Size Detection',
      status: '✅',
      issue: `${currentWidth}px - ${isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}`,
      selector: 'window.innerWidth',
    });

    // Test mobile menu if on mobile
    if (isMobile) {
      const mobileMenuSelectors = [
        '[aria-label*="Toggle menu"]',
        '.mobile-menu-button',
        'button[class*="mobile"]',
      ];

      let mobileMenuFound = false;
      for (const selector of mobileMenuSelectors) {
        if (this.testNavItem(selector, 'Mobile Menu Toggle')) {
          mobileMenuFound = true;
          break;
        }
      }

      if (!mobileMenuFound) {
        this.results.push({
          name: 'Mobile Menu',
          status: '⚠️',
          issue: 'Mobile menu toggle not found',
          selector: 'Various tried',
        });
      }
    }
  },

  // Generate report
  generateReport: function () {
    debugLog('general', 'log_statement', '\n=== QUICK NAVIGATION TEST REPORT ===\n')

    const passed = this.results.filter(r => r.status === '✅').length;
    const warnings = this.results.filter(r => r.status === '⚠️').length;
    const failed = this.results.filter(r => r.status === '❌').length;

    debugLog('general', 'log_statement', `✅ PASSED: ${passed}`)
    debugLog('general', 'log_statement', `⚠️ WARNINGS: ${warnings}`)
    debugLog('general', 'log_statement', `❌ FAILED: ${failed}`)
    debugLog('general', 'log_statement', `📊 TOTAL TESTED: ${this.results.length}`)

    const successRate =
      this.results.length > 0 ? ((passed / this.results.length) * 100).toFixed(1) : 0;
    debugLog('general', 'log_statement', `📈 SUCCESS RATE: ${successRate}%`)

    // Group results by status
    const groupedResults = {
      '✅ PASSED': this.results.filter(r => r.status === '✅'),
      '⚠️ WARNINGS': this.results.filter(r => r.status === '⚠️'),
      '❌ FAILED': this.results.filter(r => r.status === '❌'),
    };

    Object.entries(groupedResults).forEach(([status, items]) => {
      if (items.length > 0) {
        debugLog('general', 'log_statement', `\n--- ${status} ---`)
        items.forEach(item => {
          debugLog('general', 'log_statement', `${item.status} ${item.name}: ${item.issue}`)
        });
      }
    });

    // Recommendations
    if (failed > 0 || warnings > 0) {
      debugLog('general', 'log_statement', '\n🔧 RECOMMENDATIONS:')
      if (failed > 0) {
        debugLog('general', 'log_statement', '• Fix critical navigation issues immediately')
        debugLog('general', 'log_statement', '• Verify all navigation paths are correctly configured')
      }
      if (warnings > 0) {
        debugLog('general', 'log_statement', '• Review warning items for potential improvements')
        debugLog('general', 'log_statement', '• Consider adding missing accessibility attributes')
      }
    }

    return {
      passed,
      warnings,
      failed,
      total: this.results.length,
      successRate: parseFloat(successRate),
      details: this.results,
    };
  },

  // Run all tests
  runQuickTest: function () {
    debugLog('general', 'log_statement', '🚀 Starting Quick Navigation Test...\n')

    // Reset results
    this.results = [];

    // Run all test categories
    this.testSidebarFunctionality();
    this.testMainNavigation();
    this.testExpandableMenus();
    this.testBadges();
    this.testResponsive();

    // Generate and return report
    return this.generateReport();
  },

  // Test specific navigation item by clicking it
  testClickNavigation: function (itemName) {
    debugLog('general', 'log_statement', `🖱️ Testing click navigation for: ${itemName}`)

    const selectors = [
      `button:contains("${itemName}")`,
      `a:contains("${itemName}")`,
      `[aria-label*="${itemName}"]`,
      `[data-testid*="${itemName.toLowerCase().replace(/\s+/g, '-')}"]`,
    ];

    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          const currentUrl = window.location.href;
          debugLog('general', 'log_statement', `Found element: ${selector}`)
          debugLog('general', 'log_statement', `Current URL: ${currentUrl}`)

          // Simulate click
          element.click();

          // Check if URL changed after a short delay
          setTimeout(() => {
            const newUrl = window.location.href;
            if (newUrl !== currentUrl) {
              debugLog('general', 'log_statement', `✅ Navigation successful: ${newUrl}`)
            } else {
              debugLog('general', 'log_statement', `⚠️ URL didn't change - might be modal or same page`)
            }
          }, 100);

          return true;
        }
      } catch (e) {
        // Continue with next selector
      }
    }

    debugLog('general', 'log_statement', `❌ Could not find clickable element for: ${itemName}`)
    return false;
  },
};

// Helper function to simulate :contains selector (not natively supported)
if (typeof document !== 'undefined') {
  // Override querySelector to support :contains
  const originalQuerySelector = document.querySelector;
  document.querySelector = function (selector) {
    if (selector.includes(':contains(')) {
      const match = selector.match(/(.+):contains\("([^"]+)"\)(.*)$/);
      if (match) {
        const [, beforeContains, text, afterContains] = match;
        const elements = document.querySelectorAll(beforeContains + afterContains);
        for (const element of elements) {
          if (element.textContent.includes(text)) {
            return element;
          }
        }
        return null;
      }
    }
    return originalQuerySelector.call(this, selector);
  };
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  debugLog('general', 'log_statement', 'Quick Navigation Test Script Loaded!')
  debugLog('general', 'log_statement', 'Run quickNavTest.runQuickTest() to start testing');
  debugLog('general', 'log_statement', 'Run quickNavTest.testClickNavigation("Item Name") to test specific item');

  // Make available globally
  window.quickNavTest = quickNavTest;

  // Auto-run after a short delay
  setTimeout(() => {
    debugLog('general', 'log_statement', 'Auto-running quick navigation test...')
    quickNavTest.runQuickTest();
  }, 1000);
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = quickNavTest;
}
