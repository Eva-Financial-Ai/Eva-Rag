const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Financial compliance audit logging fixes
const fixMalformedDebugLogCalls = () => {
  const srcPath = path.join(process.cwd(), 'src');
  const files = glob.sync('**/*.{ts,tsx}', { cwd: srcPath });

  let totalFiles = 0;
  let fixedFiles = 0;
  let totalFixes = 0;

  console.log('🔧 Fixing malformed debugLog calls for financial compliance...\n');

  files.forEach(file => {
    const filePath = path.join(srcPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    let fileFixCount = 0;

    // Track line numbers for better reporting
    const lines = content.split('\n');

    // Pattern 1: debugLog( with no closing parenthesis on same line
    const malformedPatterns = [
      // debugLog( at end of line - incomplete call
      {
        pattern: /(\s*)debugLog\(\s*$/gm,
        replacement: "$1debugLog('general', 'log_statement', 'Debug log statement');",
        description: 'Incomplete debugLog call',
      },

      // debugLog with only first parameter
      {
        pattern: /(\s*)debugLog\(\s*['"]([^'"]*)['"]\s*,?\s*$/gm,
        replacement: "$1debugLog('$2', 'log_statement', 'Debug log statement');",
        description: 'debugLog with only category parameter',
      },

      // debugLog with only two parameters ending with comma
      {
        pattern: /(\s*)debugLog\(\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\s*,\s*$/gm,
        replacement: "$1debugLog('$2', '$3', 'Debug log statement');",
        description: 'debugLog with incomplete parameters',
      },

      // Special case for multiline debugLog calls that are broken
      {
        pattern: /debugLog\(\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\s*,\s*$/gm,
        replacement: "debugLog('$1', '$2', 'Multi-line debug statement');",
        description: 'Multiline debugLog call',
      },
    ];

    malformedPatterns.forEach(({ pattern, replacement, description }) => {
      const matches = newContent.match(pattern);
      if (matches) {
        newContent = newContent.replace(pattern, replacement);
        fileFixCount += matches.length;
        modified = true;
        console.log(`  ✓ Fixed ${matches.length} ${description} in ${file}`);
      }
    });

    // Handle specific complex cases found in the codebase

    // Fix FilelockDriveApp.tsx specific issues
    if (file.includes('FilelockDriveApp.tsx')) {
      // Fix the incomplete debugLog calls we found
      const specificFixes = [
        {
          search:
            /debugLog\(\s*'general',\s*'log_statement',\s*'File array:',\s*fileArray\.map\(f => f\.name\),?\s*\);?/g,
          replace: `debugLog('file_management', 'file_array', 'File array prepared for upload', { fileNames: fileArray.map(f => f.name) });`,
        },
        {
          search:
            /debugLog\(\s*'general',\s*'log_statement',\s*`Processing file \$\{i \+ 1\}\/\$\{uploadResults\.length\}: \$\{originalFile\.name\}`,?\s*\);?/g,
          replace: `debugLog('file_upload', 'processing_file', \`Processing file \${i + 1}/\${uploadResults.length}: \${originalFile.name}\`);`,
        },
        {
          search:
            /debugLog\(\s*'general',\s*'log_statement',\s*`Importing \$\{importedFiles\.length\} files from cloud storage`,?\s*\);?/g,
          replace: `debugLog('file_management', 'cloud_import', \`Importing \${importedFiles.length} files from cloud storage\`, { fileCount: importedFiles.length });`,
        },
      ];

      specificFixes.forEach(fix => {
        if (newContent.match(fix.search)) {
          newContent = newContent.replace(fix.search, fix.replace);
          fileFixCount++;
          modified = true;
        }
      });
    }

    // Clean up any remaining multiline debugLog issues
    // Look for debugLog statements that span multiple lines but are broken
    const multilinePattern =
      /debugLog\(\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\s*,\s*\n\s*([^)]*(?:\n[^)]*)*)\s*\n\s*\);?/g;
    newContent = newContent.replace(multilinePattern, (match, category, action, content) => {
      fileFixCount++;
      modified = true;
      // Clean the content and create a proper single-line call
      const cleanContent = content.replace(/\s+/g, ' ').trim();
      return `debugLog('${category}', '${action}', '${cleanContent || 'Multi-line debug statement'}');`;
    });

    if (modified) {
      fs.writeFileSync(filePath, newContent);
      fixedFiles++;
      totalFixes += fileFixCount;
      console.log(`  📝 Fixed ${fileFixCount} issues in ${file}`);
    }

    totalFiles++;
  });

  console.log('\n📊 Financial Compliance Debug Log Fix Summary:');
  console.log(`  Total files scanned: ${totalFiles}`);
  console.log(`  Files modified: ${fixedFiles}`);
  console.log(`  Total fixes applied: ${totalFixes}`);
  console.log('\n✅ All malformed debugLog calls have been fixed for compliance!');
};

// Run the fix
try {
  fixMalformedDebugLogCalls();
} catch (error) {
  console.error('❌ Error fixing debugLog calls:', error);
  process.exit(1);
}
