import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

debugLog('general', 'log_statement', '🔍 EVA Platform Dashboard & Role Selector Audit')
debugLog('general', 'log_statement', '==============================================\n')

// Files to audit
const filesToAudit = [
  'src/pages/RoleBasedDashboard.tsx',
  'src/hooks/useUserPermissions.ts',
  'src/components/layout/EnhancedTopNavigation.tsx',
];

const issues = [];
const warnings = [];
const successes = [];

// Audit functions
function auditFile(filePath) {
  debugLog('general', 'log_statement', `\n📄 Auditing: ${filePath}`)
  debugLog('general', 'log_statement', '-'.repeat(50));

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for string literal role comparisons
    const stringLiteralMatches = content.match(/case\s+['"][\w-]+['"]\s*:/g);
    if (stringLiteralMatches) {
      issues.push({
        file: filePath,
        issue: 'String literal role cases found',
        details: stringLiteralMatches.join(', '),
        line: 'Multiple locations',
      });
    }

    // Check for proper UserRole enum usage
    const userRoleEnumMatches = content.match(/UserRole\.\w+/g);
    if (userRoleEnumMatches) {
      successes.push({
        file: filePath,
        success: `Found ${userRoleEnumMatches.length} UserRole enum usages`,
      });
    }

    // Check for role change event listeners
    if (filePath.includes('RoleBasedDashboard')) {
      if (content.includes('addEventListener') && content.includes('userRoleChange')) {
        successes.push({
          file: filePath,
          success: 'Role change event listener found',
        });
      } else {
        warnings.push({
          file: filePath,
          warning: 'No role change event listener found',
        });
      }

      // Check for proper reload mechanism
      if (content.includes('window.location.reload()')) {
        successes.push({
          file: filePath,
          success: 'Page reload mechanism found for role changes',
        });
      }

      // Check for dashboard title updates
      if (content.includes('setDashboardTitle') || content.includes('dashboardTitle')) {
        successes.push({
          file: filePath,
          success: 'Dynamic dashboard title implementation found',
        });
      }
    }

    // Check for localStorage usage
    if (content.includes("localStorage.getItem('userRole')")) {
      successes.push({
        file: filePath,
        success: 'localStorage role retrieval found',
      });
    }

    if (content.includes("localStorage.setItem('userRole'")) {
      successes.push({
        file: filePath,
        success: 'localStorage role setting found',
      });
    }

    // Check for proper TypeScript types
    if (content.includes('UserRole') && !content.includes('any')) {
      successes.push({
        file: filePath,
        success: 'Proper TypeScript typing detected',
      });
    }

    // Check for console.log statements (for debugging)
    const consoleLogMatches = content.match(/console\.log\(/g);
    if (consoleLogMatches && consoleLogMatches.length > 5) {
      warnings.push({
        file: filePath,
        warning: `Found ${consoleLogMatches.length} console.log statements (consider removing for production)`,
      });
    }
  } catch (error) {
    issues.push({
      file: filePath,
      issue: 'Failed to read file',
      details: error.message,
    });
  }
}

// Run audit
debugLog('general', 'log_statement', '🚀 Starting audit...\n')

filesToAudit.forEach(file => {
  auditFile(file);
});

// Check specific role implementations
debugLog('general', 'log_statement', '\n\n📊 Role Implementation Check')
debugLog('general', 'log_statement', '-'.repeat(50));

const dashboardPath = 'src/pages/RoleBasedDashboard.tsx';
if (fs.existsSync(dashboardPath)) {
  const content = fs.readFileSync(dashboardPath, 'utf8');

  const borrowerRoles = [
    'BORROWER_OWNER',
    'BORROWER_CFO',
    'BORROWER_CONTROLLER',
    'BORROWER_ACCOUNTING',
    'BORROWER_OPERATIONS',
    'BORROWER_ADMIN',
  ];

  debugLog('general', 'log_statement', '\nBorrower Role Coverage:')
  borrowerRoles.forEach(role => {
    const hasMetrics = content.includes(`case UserRole.${role}:`);
    const hasTitle = content.includes(role) && content.includes('title =');
    debugLog('general', 'log_statement', 
      `  ${role}: ${hasMetrics ? '✅ Metrics' : '❌ No metrics'} | ${hasTitle ? '✅ Title' : '❌ No title'}`
    )
  });
}

// Generate report
debugLog('general', 'log_statement', '\n\n📋 AUDIT REPORT')
debugLog('general', 'log_statement', '================\n')

debugLog('general', 'log_statement', `✅ Successes (${successes.length}):`);
successes.forEach(s => {
  debugLog('general', 'log_statement', `   - ${s.file}: ${s.success}`)
});

debugLog('general', 'log_statement', `\n⚠️  Warnings (${warnings.length}):`);
if (warnings.length === 0) {
  debugLog('general', 'log_statement', '   None found!')
} else {
  warnings.forEach(w => {
    debugLog('general', 'log_statement', `   - ${w.file}: ${w.warning}`)
  });
}

debugLog('general', 'log_statement', `\n❌ Issues (${issues.length}):`);
if (issues.length === 0) {
  debugLog('general', 'log_statement', '   None found!')
} else {
  issues.forEach(i => {
    debugLog('general', 'log_statement', `   - ${i.file}: ${i.issue}`)
    if (i.details) debugLog('general', 'log_statement', `     Details: ${i.details}`)
  });
}

// Recommendations
debugLog('general', 'log_statement', '\n\n💡 RECOMMENDATIONS')
debugLog('general', 'log_statement', '==================\n')

debugLog('general', 'log_statement', '1. Role Change Handling:')
debugLog('general', 'log_statement', '   - Ensure window.location.reload() is called on role change');
debugLog('general', 'log_statement', '   - Listen for both "userRoleChange" and "storage" events')
debugLog('general', 'log_statement', '   - Clear any cached data when role changes\n')

debugLog('general', 'log_statement', '2. Dashboard Metrics:')
debugLog('general', 'log_statement', '   - Each role should have unique metrics in getMetrics()');
debugLog('general', 'log_statement', '   - Use UserRole enum for all case statements')
debugLog('general', 'log_statement', '   - Provide fallback metrics for unknown roles\n')

debugLog('general', 'log_statement', '3. Testing Steps:')
debugLog('general', 'log_statement', '   a. Open browser console (F12)');
debugLog('general', 'log_statement', '   b. Check localStorage.getItem("userRole")');
debugLog('general', 'log_statement', '   c. Change role and verify localStorage updates')
debugLog('general', 'log_statement', '   d. Verify page reloads after role change')
debugLog('general', 'log_statement', '   e. Check dashboard title and metrics update\n')

debugLog('general', 'log_statement', '4. Debug Commands:')
debugLog('general', 'log_statement', '   - localStorage.getItem("userRole") // Check current role');
debugLog('general', 'log_statement', '   - localStorage.setItem("userRole", "borrower-owner") // Set role manually');
debugLog('general', 'log_statement', '   - window.location.reload() // Force reload\n');

// Check for common issues
debugLog('general', 'log_statement', '\n🔍 COMMON ISSUES CHECK')
debugLog('general', 'log_statement', '======================\n')

const commonIssues = [
  {
    check: 'Role persistence',
    test: 'localStorage is used for role storage',
    solution: 'Ensure role is saved to localStorage on change',
  },
  {
    check: 'Event propagation',
    test: 'Custom events are dispatched on role change',
    solution: 'Dispatch "userRoleChange" event after setting role',
  },
  {
    check: 'Component re-render',
    test: 'Dashboard reloads or re-renders on role change',
    solution: 'Use window.location.reload() or force component update',
  },
  {
    check: 'Enum consistency',
    test: 'All role cases use UserRole enum',
    solution: 'Replace string literals with UserRole.ROLE_NAME',
  },
];

commonIssues.forEach((issue, index) => {
  debugLog('general', 'log_statement', `${index + 1}. ${issue.check}`)
  debugLog('general', 'log_statement', `   Test: ${issue.test}`)
  debugLog('general', 'log_statement', `   Solution: ${issue.solution}\n`)
});

debugLog('general', 'log_statement', '\n✨ Audit complete!')
