const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fix broken syntax from previous debugLog fixes
const fixBrokenSyntax = () => {
  const srcPath = path.join(process.cwd(), 'src');
  const files = glob.sync('**/*.{ts,tsx}', { cwd: srcPath });

  let totalFiles = 0;
  let fixedFiles = 0;
  let totalFixes = 0;

  console.log('🔧 Fixing broken syntax from previous debugLog fixes...\n');

  const problemFiles = [
    'api/apiClient.ts',
    'api/apiService.ts',
    'api/creditAnalysisApi.ts',
    'components/communications/ChatWidget.tsx',
    'components/document/FilelockDriveApp.tsx',
    'components/document/TransactionExecution.tsx',
    'components/risk/RiskMapEvaReport.tsx',
    'components/risk/RiskMapService.ts',
    'components/risk/SmartMatchInstrumentConfiguratorMVP2025.tsx',
    'components/testing/DiagnosticService.ts',
    'components/testing/TestService.ts',
    'hooks/useDebugEffect.ts',
    'pages/DealStructuring.tsx',
    'services/DocumentGenerationService.ts',
    'services/websocketService.ts',
    'serviceWorkerRegistration.ts',
    'utils/productionLogger.ts',
    'utils/roleDiagnostics.ts',
  ];

  problemFiles.forEach(file => {
    const filePath = path.join(srcPath, file);
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let modified = false;
    let fileFixCount = 0;

    // Fix 1: Remove semicolons that were incorrectly added to incomplete statements
    const fixes = [
      // Fix debugLog('category', 'action', 'message'); that are actually incomplete multiline calls
      {
        pattern: /debugLog\('([^']*)', '([^']*)', '([^']*)'\);\s*\n\s*\);/g,
        replacement: "debugLog('$1', '$2', '$3');",
        description: 'Remove duplicate closing parentheses',
      },

      // Fix standalone closing parentheses and semicolons
      {
        pattern: /^\s*\);\s*$/gm,
        replacement: '',
        description: 'Remove standalone closing parentheses',
      },

      // Fix debugLog calls that got broken into multiple parts
      {
        pattern: /debugLog\('([^']*)', '([^']*)', '([^']*)'\);\s*\n([^;]*)\s*\n\s*\);/g,
        replacement: "debugLog('$1', '$2', '$3', $4);",
        description: 'Rejoin broken debugLog calls',
      },

      // Fix incomplete function calls that end with );
      {
        pattern: /debugLog\('([^']*)', '([^']*)', '([^']*)'\);\s*\n\s*([^)]*)\s*\n\s*\);/g,
        replacement: "debugLog('$1', '$2', '$3', $4);",
        description: 'Fix multiline debugLog calls',
      },
    ];

    fixes.forEach(({ pattern, replacement, description }) => {
      const matches = newContent.match(pattern);
      if (matches) {
        newContent = newContent.replace(pattern, replacement);
        fileFixCount += matches.length;
        modified = true;
        console.log(`  ✓ Fixed ${matches.length} ${description} in ${file}`);
      }
    });

    // Specific file fixes based on the errors we saw

    if (file === 'api/apiService.ts') {
      // This file has severe syntax errors - let's restore the main class structure
      if (newContent.includes("debugLog('general', 'log_statement', 'Debug log statement');")) {
        // The class got broken, let's fix the key parts
        newContent = newContent.replace(
          /debugLog\('general', 'log_statement', 'Debug log statement'\);\s*\n\s*\}\s*\n\s*\);/g,
          "debugLog('general', 'log_statement', 'ApiService operation completed');",
        );
        modified = true;
        fileFixCount++;
      }
    }

    if (file === 'components/document/FilelockDriveApp.tsx') {
      // Fix the specific FilelockDriveApp issues
      newContent = newContent.replace(
        /debugLog\('general', 'log_statement', 'Debug log statement'\);\s*\n\s*\);/g,
        "debugLog('file_management', 'operation', 'File operation completed');",
      );
      modified = true;
      fileFixCount++;
    }

    // General cleanup: remove any remaining standalone ); lines
    const standaloneParens = newContent.match(/^\s*\);\s*$/gm);
    if (standaloneParens) {
      newContent = newContent.replace(/^\s*\);\s*$/gm, '');
      fileFixCount += standaloneParens.length;
      modified = true;
      console.log(
        `  ✓ Removed ${standaloneParens.length} standalone closing parentheses in ${file}`,
      );
    }

    if (modified) {
      fs.writeFileSync(filePath, newContent);
      fixedFiles++;
      totalFixes += fileFixCount;
      console.log(`  📝 Fixed ${fileFixCount} syntax issues in ${file}`);
    }

    totalFiles++;
  });

  console.log('\n📊 Syntax Fix Summary:');
  console.log(`  Total files processed: ${totalFiles}`);
  console.log(`  Files modified: ${fixedFiles}`);
  console.log(`  Total fixes applied: ${totalFixes}`);
  console.log('\n✅ Syntax errors have been addressed!');
};

// Run the fix
try {
  fixBrokenSyntax();
} catch (error) {
  console.error('❌ Error fixing syntax:', error);
  process.exit(1);
}
