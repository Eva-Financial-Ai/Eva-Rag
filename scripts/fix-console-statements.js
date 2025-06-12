#!/usr/bin/env node

/**
 * =============================================================================
 * CONSOLE STATEMENT FIXER FOR FINANCIAL APPLICATIONS
 * =============================================================================
 *
 * This script systematically replaces console.log statements with proper
 * audit logging that meets financial compliance requirements.
 */

const fs = require('fs');
const path = require('path');

// Console replacement mappings for different contexts
const REPLACEMENTS = {
  // Business process logging
  "console.log('Loading files for customer:'":
    "logBusinessProcess('file_management', 'load_customer_files', true, { customerId:",
  "console.log('Retrieving customer business records for:'":
    "logBusinessProcess('business_lookup', 'retrieve_records', true, { ragId:",
  "console.log('Storing customer RAG data:'":
    "logBusinessProcess('business_lookup', 'store_rag_data', true, { ragId:",
  "console.log('Updated customer business records collection for:'":
    "logBusinessProcess('business_lookup', 'update_records', true, { customerId:",

  // File operations
  "console.log('Edit file:'":
    "logBusinessProcess('file_management', 'edit_file', true, { fileName:",
  "console.log('Sign file:'":
    "logBusinessProcess('file_management', 'sign_file', true, { fileName:",
  "console.log('Share file:'":
    "logBusinessProcess('file_management', 'share_file', true, { fileName:",
  "console.log('Submission data sent to FileLock API:'":
    "logBusinessProcess('file_management', 'submit_package', true, { submissionData:",

  // Process status logging
  "console.log('Processing results for EVA...')":
    "logBusinessProcess('eva_integration', 'process_results', true)",
  "console.log('Analysis complete')":
    "logBusinessProcess('eva_integration', 'analysis_complete', true)",
  "console.log('✅ Updated localStorage')":
    "logBusinessProcess('role_management', 'update_local_storage', true)",
  "console.log('✅ Dispatched userRoleChange event')":
    "logBusinessProcess('role_management', 'dispatch_event', true)",
  "console.log('⏳ Waiting 1 second before reload...')":
    "logBusinessProcess('role_management', 'prepare_reload', true)",
  "console.log('🔄 Reloading page...')":
    "logBusinessProcess('role_management', 'reload_page', true)",

  // Success operations
  "console.log('✅ Onclick executed via":
    "logBusinessProcess('security', 'onclick_executed', true, { method:",
  "console.log('Files imported successfully!')":
    "logBusinessProcess('file_management', 'import_success', true)",
  "console.log('File upload completed successfully')":
    "logBusinessProcess('file_management', 'upload_complete', true)",
  "console.log('Upload process finished')":
    "logBusinessProcess('file_management', 'upload_finished', true)",

  // Development/debugging logs
  "console.log('Starting file upload with'": "debugLog('file_upload', 'start_upload', { fileCount:",
  "console.log('File array:'": "debugLog('file_upload', 'file_array', { files:",
  "console.log('Using transaction ID:'":
    "debugLog('file_upload', 'transaction_id', { transactionId:",
  "console.log('Backend upload results:'": "debugLog('file_upload', 'backend_results', { results:",
  "console.log('Backend upload failed, using mock mode:'":
    "debugLog('file_upload', 'fallback_to_mock', { error:",
  "console.log('Mock upload results:'": "debugLog('file_upload', 'mock_results', { results:",
  "console.log('Processing file'": "debugLog('file_upload', 'processing_file', { progress:",
  "console.log('Adding new file to state:'": "debugLog('file_upload', 'add_file', { file:",
  "console.log('Updating file processing status for:'":
    "debugLog('file_upload', 'update_status', { documentId:",
  "console.log('Download file:'": "debugLog('file_management', 'download_file', { fileName:",

  // Document request operations
  "console.log('Document request submitted:'":
    "logBusinessProcess('document_request', 'submit_request', true, { requestData:",

  // Import operations
  "console.log('Importing'":
    "logBusinessProcess('file_management', 'import_cloud_files', true, { count:",

  // Role diagnostics
  "console.log('Old role:'": "debugLog('role_diagnostics', 'old_role', { role:",
  "console.log('New role:'": "debugLog('role_diagnostics', 'new_role', { role:",

  // File operations with specific context
  "console.log('Reverting file'":
    "logBusinessProcess('file_management', 'revert_version', true, { fileId:",
};

// Import statements that need to be added
const REQUIRED_IMPORTS = {
  logBusinessProcess:
    "import { logBusinessProcess, debugLog, logError } from '../utils/auditLogger';",
  debugLog: "import { logBusinessProcess, debugLog, logError } from '../utils/auditLogger';",
  logError: "import { logBusinessProcess, debugLog, logError } from '../utils/auditLogger';",
};

// Files to process
const TARGET_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const IGNORE_PATTERNS = [
  'node_modules',
  'build',
  'dist',
  '.git',
  'coverage',
  'public',
  'scripts/fix-console-statements.js', // Don't process this file
];

function shouldIgnoreFile(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!shouldIgnoreFile(filePath)) {
        getFiles(filePath, fileList);
      }
    } else if (TARGET_EXTENSIONS.includes(path.extname(file)) && !shouldIgnoreFile(filePath)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function fixConsoleStatements(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let needsImport = false;

  // Track which imports are needed
  const importsNeeded = new Set();

  // Replace console.log statements
  for (const [pattern, replacement] of Object.entries(REPLACEMENTS)) {
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    if (content.includes(pattern)) {
      content = content.replace(regex, replacement);
      modified = true;

      // Determine which imports are needed
      if (replacement.includes('logBusinessProcess')) {
        importsNeeded.add('logBusinessProcess');
      }
      if (replacement.includes('debugLog')) {
        importsNeeded.add('debugLog');
      }
      if (replacement.includes('logError')) {
        importsNeeded.add('logError');
      }
    }
  }

  // Add import statement if needed and not already present
  if (importsNeeded.size > 0 && !content.includes("from '../utils/auditLogger'")) {
    const importFunctions = Array.from(importsNeeded).join(', ');
    const importStatement = `import { ${importFunctions} } from '../utils/auditLogger';\n`;

    // Find the last import statement and add after it
    const importRegex = /^import\s+.*?from\s+['"].*?['"];?\s*$/gm;
    const imports = content.match(importRegex) || [];

    if (imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertIndex = lastImportIndex + lastImport.length;
      content = content.slice(0, insertIndex) + '\n' + importStatement + content.slice(insertIndex);
      modified = true;
    } else {
      // No existing imports, add at the top
      content = importStatement + '\n' + content;
      modified = true;
    }
  }

  // Handle remaining console.log statements with generic debug logging
  const remainingConsoleLogs = content.match(/console\.log\([^)]*\);?/g);
  if (remainingConsoleLogs) {
    for (const consoleStatement of remainingConsoleLogs) {
      // Extract the content inside console.log()
      const match = consoleStatement.match(/console\.log\(([^)]*)\)/);
      if (match) {
        const logContent = match[1];
        const replacement = `debugLog('general', 'log_statement', ${logContent})`;
        content = content.replace(consoleStatement, replacement);
        modified = true;

        // Add debugLog import if not already present
        if (!content.includes("from '../utils/auditLogger'")) {
          const importStatement = `import { debugLog } from '../utils/auditLogger';\n`;
          const importRegex = /^import\s+.*?from\s+['"].*?['"];?\s*$/gm;
          const imports = content.match(importRegex) || [];

          if (imports.length > 0) {
            const lastImport = imports[imports.length - 1];
            const lastImportIndex = content.lastIndexOf(lastImport);
            const insertIndex = lastImportIndex + lastImport.length;
            content =
              content.slice(0, insertIndex) + '\n' + importStatement + content.slice(insertIndex);
          } else {
            content = importStatement + '\n' + content;
          }
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed console statements in: ${filePath}`);
    return true;
  }

  return false;
}

function main() {
  console.log('🧹 Starting console statement cleanup for financial compliance...\n');

  const projectRoot = path.resolve(__dirname, '..');
  const allFiles = getFiles(projectRoot);

  let totalFiles = 0;
  let modifiedFiles = 0;

  console.log(`📄 Found ${allFiles.length} files to process...\n`);

  for (const filePath of allFiles) {
    totalFiles++;

    try {
      if (fixConsoleStatements(filePath)) {
        modifiedFiles++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 SUMMARY:`);
  console.log(`   Files processed: ${totalFiles}`);
  console.log(`   Files modified: ${modifiedFiles}`);
  console.log(`   Files unchanged: ${totalFiles - modifiedFiles}`);
  console.log('\n✅ Console statement cleanup completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Review the changes');
  console.log('   2. Test the application');
  console.log('   3. Run ESLint to verify compliance');
  console.log('   4. Commit the changes');
}

if (require.main === module) {
  main();
}
