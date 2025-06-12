import { debugLog } from '../utils/auditLogger';

// Navigation Audit Test Script
// This script tests every navigation item and sub-item for selectability and functionality

const navigationAudit = {
  // Track test results
  results: {
    passed: [],
    failed: [],
    warnings: [],
  },

  // Main navigation items from SideNavigation.tsx
  navigationItems: [
    {
      name: 'Dashboard',
      path: '/dashboard',
      hasChildren: false,
      testId: 'nav-dashboard',
    },
    {
      name: 'Eva AI Assistant',
      path: '/ai-assistant',
      hasChildren: false,
      testId: 'nav-ai-assistant',
      badge: 'New',
    },
    {
      name: 'Credit Application',
      path: '/credit-application',
      hasChildren: true,
      testId: 'nav-credit-application',
      children: [
        {
          name: 'Auto Originations',
          path: '/auto-originations',
          testId: 'nav-auto-originations',
        },
        {
          name: 'Transaction Summary',
          path: '/transaction-summary',
          testId: 'nav-transaction-summary',
          badge: 'New',
        },
        {
          name: 'New Origination',
          path: '#new-origination',
          testId: 'nav-new-origination',
          isModal: true,
        },
      ],
    },
    {
      name: 'Customer Retention',
      path: '/customer-retention',
      hasChildren: true,
      testId: 'nav-customer-retention',
      badge: 'New',
      children: [
        {
          name: 'Customers',
          path: '/customer-retention/customers',
          testId: 'nav-customers',
          hasChildren: true,
          children: [
            {
              name: 'Businesses',
              path: '/customer-retention/customers?type=businesses',
              testId: 'nav-businesses',
            },
            {
              name: 'Business Owners',
              path: '/customer-retention/customers?type=business-owners',
              testId: 'nav-business-owners',
            },
            {
              name: 'Asset Sellers',
              path: '/customer-retention/customers?type=asset-sellers',
              testId: 'nav-asset-sellers',
            },
            {
              name: 'Brokers & Originators',
              path: '/customer-retention/customers?type=brokers-originators',
              testId: 'nav-brokers-originators',
            },
            {
              name: 'Service Providers',
              path: '/customer-retention/customers?type=service-providers',
              testId: 'nav-service-providers',
            },
          ],
        },
        {
          name: 'Contacts',
          path: '/customer-retention/contacts',
          testId: 'nav-contacts',
        },
        {
          name: 'Commitments',
          path: '/customer-retention/commitments',
          testId: 'nav-commitments',
        },
        {
          name: 'Calendar Integration',
          path: '/calendar-integration',
          testId: 'nav-calendar',
        },
        {
          name: 'Post Closing Customers',
          path: '/post-closing',
          testId: 'nav-post-closing',
          badge: 'New',
        },
      ],
    },
    {
      name: 'Filelock Drive',
      path: '/documents',
      hasChildren: true,
      testId: 'nav-filelock-drive',
      children: [
        {
          name: 'Document Management',
          path: '/documents',
          testId: 'nav-document-management',
        },
        {
          name: 'Shield Vault',
          path: '/shield-vault',
          testId: 'nav-shield-vault',
        },
        {
          name: 'Safe Forms',
          path: '/forms',
          testId: 'nav-safe-forms',
        },
      ],
    },
    {
      name: 'Risk Map Navigator',
      path: '/risk-assessment',
      hasChildren: true,
      testId: 'nav-risk-map',
      children: [
        {
          name: 'EVA Risk Report & Score',
          path: '/risk-assessment/eva-report',
          testId: 'nav-eva-risk-report',
        },
        {
          name: 'RiskLab',
          path: '/risk-assessment/lab',
          testId: 'nav-risklab',
        },
      ],
    },
    {
      name: 'Deal Structuring',
      path: '/deal-structuring',
      hasChildren: true,
      testId: 'nav-deal-structuring',
      children: [
        {
          name: 'Structure Editor',
          path: '/deal-structuring',
          testId: 'nav-structure-editor',
        },
        {
          name: 'Smart Match',
          path: '/deal-structuring/smart-match',
          testId: 'nav-smart-match',
          badge: 'New',
        },
        {
          name: 'Transaction Execution',
          path: '/transaction-execution',
          testId: 'nav-transaction-execution',
          badge: 'New',
        },
      ],
    },
    {
      name: 'Asset Press',
      path: '/asset-press',
      hasChildren: true,
      testId: 'nav-asset-press',
      badge: 'Beta',
      children: [
        {
          name: 'Asset Press',
          path: '/asset-press',
          testId: 'nav-asset-press-main',
        },
        {
          name: 'Asset Marketplace',
          path: '/commercial-market',
          testId: 'nav-asset-marketplace',
        },
      ],
    },
    {
      name: 'Portfolio Navigator',
      path: '/portfolio-wallet',
      hasChildren: true,
      testId: 'nav-portfolio-navigator',
      badge: 'Beta',
      children: [
        {
          name: 'Portfolio Wallet',
          path: '/portfolio-wallet',
          testId: 'nav-portfolio-wallet',
        },
        {
          name: 'Asset Portfolio',
          path: '/asset-portfolio',
          testId: 'nav-asset-portfolio',
        },
      ],
    },
    {
      name: 'Demo Mode',
      path: '/demo-mode',
      hasChildren: false,
      testId: 'nav-demo-mode',
      badge: 'Development',
      conditional: true, // Only shows in development
    },
    {
      name: 'Team Management',
      path: '/team-management',
      hasChildren: false,
      testId: 'nav-team-management',
      badge: 'Auth0',
      conditional: true, // Feature flag dependent
    },
  ],

  // Test if an element is clickable and visible
  testElementClickability: function (selector, itemName) {
    try {
      const element = document.querySelector(selector);

      if (!element) {
        this.results.failed.push({
          item: itemName,
          issue: 'Element not found',
          selector: selector,
        });
        return false;
      }

      // Check if element is visible
      const style = window.getComputedStyle(element);
      const isVisible =
        style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';

      if (!isVisible) {
        this.results.failed.push({
          item: itemName,
          issue: 'Element not visible',
          selector: selector,
        });
        return false;
      }

      // Check if element is clickable
      const isClickable =
        element.tagName === 'BUTTON' ||
        element.tagName === 'A' ||
        element.onclick !== null ||
        element.getAttribute('role') === 'button';

      if (!isClickable) {
        this.results.warnings.push({
          item: itemName,
          issue: 'Element may not be clickable',
          selector: selector,
        });
      }

      // Check for proper accessibility attributes
      const hasAriaLabel =
        element.getAttribute('aria-label') ||
        element.getAttribute('title') ||
        element.textContent.trim();

      if (!hasAriaLabel) {
        this.results.warnings.push({
          item: itemName,
          issue: 'Missing accessibility label',
          selector: selector,
        });
      }

      this.results.passed.push({
        item: itemName,
        selector: selector,
        status: 'Found and appears functional',
      });

      return true;
    } catch (error) {
      this.results.failed.push({
        item: itemName,
        issue: `Error testing element: ${error.message}`,
        selector: selector,
      });
      return false;
    }
  },

  // Test navigation item expansion
  testItemExpansion: function (item) {
    if (!item.hasChildren) return true;

    // Look for expansion toggle button
    const toggleSelectors = [
      `[data-testid="${item.testId}-toggle"]`,
      `button:has-text("${item.name}")`,
      `[aria-expanded]`,
      `.nav-item:contains("${item.name}") button`,
    ];

    let found = false;
    for (const selector of toggleSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          found = true;
          break;
        }
      } catch (e) {
        // Selector might not be supported, continue
      }
    }

    if (!found) {
      this.results.warnings.push({
        item: item.name,
        issue: 'Expansion toggle not found for parent item',
        selector: 'Various selectors tried',
      });
    }

    return found;
  },

  // Test all navigation items recursively
  testNavigationItems: function (items, level = 0) {
    const indent = '  '.repeat(level);
    debugLog('general', 'log_statement', `${indent}Testing ${items.length} items at level ${level}`)

    items.forEach(item => {
      debugLog('general', 'log_statement', `${indent}Testing: ${item.name}`)

      // Skip conditional items that might not be visible
      if (item.conditional) {
        debugLog('general', 'log_statement', `${indent}  Skipping conditional item: ${item.name}`)
        return;
      }

      // Test main item clickability
      const selectors = [
        `[data-testid="${item.testId}"]`,
        `a[href="${item.path}"]`,
        `button[onclick*="${item.path}"]`,
        `[aria-label*="${item.name}"]`,
        `.nav-item:contains("${item.name}")`,
        `li:contains("${item.name}") a`,
        `li:contains("${item.name}") button`,
      ];

      let itemFound = false;
      for (const selector of selectors) {
        if (this.testElementClickability(selector, item.name)) {
          itemFound = true;
          break;
        }
      }

      if (!itemFound) {
        debugLog('general', 'log_statement', `${indent}  ❌ Item not found: ${item.name}`)
      } else {
        debugLog('general', 'log_statement', `${indent}  ✅ Item found: ${item.name}`)
      }

      // Test expansion functionality for parent items
      if (item.hasChildren) {
        this.testItemExpansion(item);

        // Recursively test children
        if (item.children && item.children.length > 0) {
          this.testNavigationItems(item.children, level + 1);
        }
      }
    });
  },

  // Test sidebar functionality
  testSidebarFunctionality: function () {
    debugLog('general', 'log_statement', 'Testing sidebar functionality...')

    // Test sidebar toggle
    const toggleSelectors = [
      '[aria-label*="Toggle sidebar"]',
      '[aria-label*="Expand sidebar"]',
      '[aria-label*="Collapse sidebar"]',
      'button[onclick*="sidebar"]',
      '.sidebar-toggle',
    ];

    let toggleFound = false;
    for (const selector of toggleSelectors) {
      if (this.testElementClickability(selector, 'Sidebar Toggle')) {
        toggleFound = true;
        break;
      }
    }

    if (!toggleFound) {
      this.results.warnings.push({
        item: 'Sidebar Toggle',
        issue: 'Sidebar toggle button not found',
        selector: 'Various selectors tried',
      });
    }

    // Test sidebar visibility states
    const sidebar =
      document.querySelector('nav') ||
      document.querySelector('.sidebar') ||
      document.querySelector('[role="navigation"]');

    if (sidebar) {
      this.results.passed.push({
        item: 'Sidebar Container',
        selector: 'nav/sidebar element',
        status: 'Found',
      });
    } else {
      this.results.failed.push({
        item: 'Sidebar Container',
        issue: 'Sidebar container not found',
        selector: 'nav, .sidebar, [role="navigation"]',
      });
    }
  },

  // Test responsive behavior
  testResponsiveBehavior: function () {
    debugLog('general', 'log_statement', 'Testing responsive behavior...')

    // Test mobile menu functionality
    const mobileSelectors = [
      '[aria-label*="Toggle menu"]',
      '.mobile-menu-button',
      'button[class*="mobile"]',
      'button[class*="hamburger"]',
    ];

    let mobileMenuFound = false;
    for (const selector of mobileSelectors) {
      if (this.testElementClickability(selector, 'Mobile Menu Toggle')) {
        mobileMenuFound = true;
        break;
      }
    }

    if (!mobileMenuFound) {
      this.results.warnings.push({
        item: 'Mobile Menu',
        issue: 'Mobile menu toggle not found',
        selector: 'Various mobile selectors tried',
      });
    }
  },

  // Generate detailed report
  generateReport: function () {
    debugLog('general', 'log_statement', '\n=== NAVIGATION AUDIT REPORT ===\n')

    debugLog('general', 'log_statement', `✅ PASSED: ${this.results.passed.length} items`)
    debugLog('general', 'log_statement', `❌ FAILED: ${this.results.failed.length} items`)
    debugLog('general', 'log_statement', `⚠️  WARNINGS: ${this.results.warnings.length} items`)

    if (this.results.failed.length > 0) {
      debugLog('general', 'log_statement', '\n--- FAILED ITEMS ---')
      this.results.failed.forEach(item => {
        debugLog('general', 'log_statement', `❌ ${item.item}: ${item.issue}`)
        debugLog('general', 'log_statement', `   Selector: ${item.selector}`)
      });
    }

    if (this.results.warnings.length > 0) {
      debugLog('general', 'log_statement', '\n--- WARNINGS ---')
      this.results.warnings.forEach(item => {
        debugLog('general', 'log_statement', `⚠️  ${item.item}: ${item.issue}`)
        debugLog('general', 'log_statement', `   Selector: ${item.selector}`)
      });
    }

    if (this.results.passed.length > 0) {
      debugLog('general', 'log_statement', '\n--- PASSED ITEMS ---')
      this.results.passed.forEach(item => {
        debugLog('general', 'log_statement', `✅ ${item.item}: ${item.status}`)
      });
    }

    // Summary and recommendations
    debugLog('general', 'log_statement', '\n=== SUMMARY ===')
    const totalItems = this.results.passed.length + this.results.failed.length;
    const successRate =
      totalItems > 0 ? ((this.results.passed.length / totalItems) * 100).toFixed(1) : 0;

    debugLog('general', 'log_statement', `Success Rate: ${successRate}%`)
    debugLog('general', 'log_statement', `Total Items Tested: ${totalItems}`)

    if (this.results.failed.length > 0) {
      debugLog('general', 'log_statement', '\n🔧 RECOMMENDED FIXES:')
      debugLog('general', 'log_statement', '1. Ensure all navigation items have proper onClick handlers or href attributes')
      debugLog('general', 'log_statement', '2. Add data-testid attributes for better testing')
      debugLog('general', 'log_statement', '3. Verify all navigation paths are valid and routed correctly')
      debugLog('general', 'log_statement', 
        '4. Check that conditional items (Demo Mode, Team Management) are properly configured'
      );
    }

    if (this.results.warnings.length > 0) {
      debugLog('general', 'log_statement', '\n💡 IMPROVEMENTS:')
      debugLog('general', 'log_statement', '1. Add aria-labels for better accessibility')
      debugLog('general', 'log_statement', '2. Ensure mobile navigation is properly implemented')
      debugLog('general', 'log_statement', '3. Test expansion/collapse functionality for parent items')
    }

    return {
      passed: this.results.passed.length,
      failed: this.results.failed.length,
      warnings: this.results.warnings.length,
      successRate: successRate,
    };
  },

  // Run complete audit
  runAudit: function () {
    debugLog('general', 'log_statement', '🔍 Starting Navigation Audit...\n')

    // Reset results
    this.results = { passed: [], failed: [], warnings: [] };

    // Run tests
    this.testSidebarFunctionality();
    this.testResponsiveBehavior();
    this.testNavigationItems(this.navigationItems);

    // Generate report
    return this.generateReport();
  },
};

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  debugLog('general', 'log_statement', 'Navigation Audit Script Loaded. Run navigationAudit.runAudit() to start testing.');

  // Provide easy access
  window.navigationAudit = navigationAudit;

  // Auto-run after a short delay to ensure page is loaded
  setTimeout(() => {
    debugLog('general', 'log_statement', 'Auto-running navigation audit...')
    navigationAudit.runAudit();
  }, 2000);
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = navigationAudit;
}
