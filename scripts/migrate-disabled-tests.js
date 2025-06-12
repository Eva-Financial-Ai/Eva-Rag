import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const disabledTestsDir = path.join(process.cwd(), 'tests-disabled');
const targetTestsDir = path.join(process.cwd(), 'src', '__tests__');

// Priority mapping for test files
const testPriorities = {
  // High priority - Core functionality
  'Button.test.tsx': 'high',
  'Input.test.tsx': 'high',
  'RoleBasedDashboard.test.tsx': 'high',
  'NavigationIntegration.test.tsx': 'high',
  'CustomerRetentionFlow.test.tsx': 'high',
  
  // Medium priority - Feature tests
  'EVAAssistantChat.test.tsx': 'medium',
  'CloudflareR2ConfigModal.test.tsx': 'medium',
  'DocumentAutoRequestEngine.test.ts': 'medium',
  'RAGUploadModal.test.tsx': 'medium',
  
  // Low priority - Nice to have
  'ResponsiveTestingPanel.test.tsx': 'low',
  'SwaggerUI.test.tsx': 'low',
  'CalendarIntegration.test.tsx': 'low',
};

async function auditDisabledTests() {
  if (!fs.existsSync(disabledTestsDir)) {
    debugLog('general', 'log_statement', '❌ No disabled tests directory found')
    return [];
  }

  const files = await fs.promises.readdir(disabledTestsDir);
  const testFiles = [];
  
  for (const file of files) {
    if (file.endsWith('.test.tsx') || file.endsWith('.test.ts')) {
      const filePath = path.join(disabledTestsDir, file);
      const priority = testPriorities[file] || 'medium';
      
      testFiles.push({
        name: file,
        path: filePath,
        priority,
        status: 'disabled',
      });
    }
  }
  
  // Sort by priority
  return testFiles.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

async function migrateTestFile(testFile) {
  try {
    const content = await fs.promises.readFile(testFile.path, 'utf-8');
    
    // Update imports from Jest to Vitest
    let updatedContent = content
      // Update test imports
      .replace(/from ['"]@testing-library\/jest-dom['"]/g, `from '@testing-library/jest-dom'`)
      .replace(/import \{ jest \} from ['"]@jest\/globals['"]/g, `import { vi } from 'vitest'`)
      .replace(/\bjest\./g, 'vi.')
      .replace(/\bjest\(/g, 'vi(')
      // Fix common testing patterns
      .replace(/beforeAll\(\(\) => \{/g, 'beforeAll(() => {')
      .replace(/afterAll\(\(\) => \{/g, 'afterAll(() => {')
      .replace(/beforeEach\(\(\) => \{/g, 'beforeEach(() => {')
      .replace(/afterEach\(\(\) => \{/g, 'afterEach(() => {');
    
    // Determine target directory based on test type
    const componentMatch = testFile.name.match(/(.+)\.test\.tsx?$/);
    if (componentMatch) {
      const componentName = componentMatch[1];
      
      // Try to find the component file
      const possiblePaths = [
        `src/components/${componentName}.tsx`,
        `src/components/common/${componentName}.tsx`,
        `src/pages/${componentName}.tsx`,
        `src/utils/${componentName}.ts`,
      ];
      
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          const dir = path.dirname(possiblePath);
          const testDir = path.join(dir, '__tests__');
          
          // Create test directory if it doesn't exist
          if (!fs.existsSync(testDir)) {
            await fs.promises.mkdir(testDir, { recursive: true });
          }
          
          // Write migrated test file
          const targetPath = path.join(testDir, testFile.name);
          await fs.promises.writeFile(targetPath, updatedContent);
          
          debugLog('general', 'log_statement', `✅ Migrated ${testFile.name} to ${targetPath}`)
          return true;
        }
      }
    }
    
    // Fallback: place in general tests directory
    if (!fs.existsSync(targetTestsDir)) {
      await fs.promises.mkdir(targetTestsDir, { recursive: true });
    }
    
    const targetPath = path.join(targetTestsDir, testFile.name);
    await fs.promises.writeFile(targetPath, updatedContent);
    
    debugLog('general', 'log_statement', `✅ Migrated ${testFile.name} to ${targetPath}`)
    return true;
  } catch (error) {
    console.error(`❌ Failed to migrate ${testFile.name}:`, error.message);
    return false;
  }
}

async function generateMigrationReport(testFiles) {
  const migratedCount = testFiles.filter(f => f.status === 'migrated').length;
  const failedCount = testFiles.filter(f => f.status === 'failed').length;
  
  const report = {
    total: testFiles.length,
    byPriority: {
      high: testFiles.filter(f => f.priority === 'high').length,
      medium: testFiles.filter(f => f.priority === 'medium').length,
      low: testFiles.filter(f => f.priority === 'low').length,
    },
    migrated: migratedCount,
    failed: failedCount,
    timestamp: new Date().toISOString(),
  };
  
  const reportPath = path.join(process.cwd(), 'test-migration-report.json');
  await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  debugLog('general', 'log_statement', '\n📊 Migration Report:')
  debugLog('general', 'log_statement', `Total tests: ${report.total}`)
  debugLog('general', 'log_statement', `High priority: ${report.byPriority.high}`)
  debugLog('general', 'log_statement', `Medium priority: ${report.byPriority.medium}`)
  debugLog('general', 'log_statement', `Low priority: ${report.byPriority.low}`)
  debugLog('general', 'log_statement', `Successfully migrated: ${report.migrated}`)
  debugLog('general', 'log_statement', `Failed: ${report.failed}`)
}

async function main() {
  debugLog('general', 'log_statement', '🔍 Auditing disabled tests...\n')
  
  const testFiles = await auditDisabledTests();
  
  if (testFiles.length === 0) {
    debugLog('general', 'log_statement', 'No disabled tests found to migrate.')
    return;
  }
  
  debugLog('general', 'log_statement', `Found ${testFiles.length} disabled test files\n`)
  
  // Process high priority tests first
  const highPriorityTests = testFiles.filter(f => f.priority === 'high');
  debugLog('general', 'log_statement', `\n🚀 Migrating ${highPriorityTests.length} high priority tests...\n`)
  
  for (const testFile of highPriorityTests) {
    const success = await migrateTestFile(testFile);
    testFile.status = success ? 'migrated' : 'failed';
  }
  
  await generateMigrationReport(testFiles);
}

main().catch(console.error);