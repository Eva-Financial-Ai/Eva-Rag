const fs = require('fs');
const path = require('path');

// Fix only the specific malformed debugLog calls causing compilation errors
const fixSpecificDebugLogIssues = () => {
  console.log('🔧 Fixing specific malformed debugLog calls causing TypeScript errors...\n');

  const fixes = [
    // Fix FilelockDriveApp.tsx specific issues
    {
      file: 'src/components/document/FilelockDriveApp.tsx',
      fixes: [
        {
          search:
            /debugLog\(\s*'general',\s*'log_statement',\s*'File array:',\s*fileArray\.map\(f\s*=>\s*f\.name\),?\s*\);?/g,
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
      ],
    },

    // Fix RiskMapEvaReport.tsx multiline issues
    {
      file: 'src/components/risk/RiskMapEvaReport.tsx',
      fixes: [
        {
          search: /debugLog\(\s*'general',\s*'log_statement',\s*$/m,
          replace: `debugLog('risk_assessment', 'loading', 'Risk data loading initiated');`,
        },
      ],
    },

    // Fix DealStructuring.tsx multiline issues
    {
      file: 'src/pages/DealStructuring.tsx',
      fixes: [
        {
          search: /debugLog\(\s*'general',\s*'log_statement',\s*$/m,
          replace: `debugLog('deal_structuring', 'processing', 'Deal structuring operation started');`,
        },
      ],
    },

    // Fix ChatWidget.tsx
    {
      file: 'src/components/communications/ChatWidget.tsx',
      fixes: [
        {
          search: /debugLog\(\s*$/m,
          replace: `debugLog('communication', 'chat_widget', 'Chat widget operation');`,
        },
      ],
    },

    // Fix SmartMatchInstrumentConfiguratorMVP2025.tsx
    {
      file: 'src/components/risk/SmartMatchInstrumentConfiguratorMVP2025.tsx',
      fixes: [
        {
          search: /debugLog\(\s*'general',\s*'log_statement',\s*$/m,
          replace: `debugLog('smart_match', 'configurator', 'Configuration saved successfully');`,
        },
      ],
    },

    // Fix TransactionExecution.tsx
    {
      file: 'src/components/document/TransactionExecution.tsx',
      fixes: [
        {
          search: /debugLog\(\s*'general',\s*'log_statement',\s*$/m,
          replace: `debugLog('transaction', 'execution', 'Transaction execution started');`,
        },
      ],
    },
  ];

  let totalFixes = 0;
  let filesModified = 0;

  fixes.forEach(({ file, fixes: fileFixes }) => {
    const filePath = path.join(process.cwd(), file);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixCount = 0;

    fileFixes.forEach(({ search, replace }) => {
      const matches = content.match(search);
      if (matches) {
        content = content.replace(search, replace);
        fileFixCount += matches.length;
        modified = true;
        console.log(`  ✓ Fixed ${matches.length} malformed debugLog calls in ${file}`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      filesModified++;
      totalFixes += fileFixCount;
      console.log(`  📝 Applied ${fileFixCount} fixes to ${file}`);
    }
  });

  console.log('\n📊 Specific DebugLog Fix Summary:');
  console.log(`  Files modified: ${filesModified}`);
  console.log(`  Total fixes applied: ${totalFixes}`);
  console.log('\n✅ Specific malformed debugLog calls have been fixed!');
};

// Run the fix
try {
  fixSpecificDebugLogIssues();
} catch (error) {
  console.error('❌ Error fixing specific debugLog issues:', error);
  process.exit(1);
}
