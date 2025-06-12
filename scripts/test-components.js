const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const COMPONENT_DIRS = [
  path.join(ROOT_DIR, 'src/components'),
  path.join(ROOT_DIR, 'src/pages')
];
const EXCLUDE_DIRS = [
  '__tests__', 
  'node_modules', 
  'coverage',
  'dist'
];
const EXCLUDE_FILES = [
  'index.ts', 
  'index.tsx', 
  'types.ts', 
  'types.tsx',
  '*.test.tsx',
  '*.spec.tsx'
];

debugLog('general', 'log_statement', 'Starting component test runner...')
debugLog('general', 'log_statement', `Root directory: ${ROOT_DIR}`)
debugLog('general', 'log_statement', `Scanning directories: ${COMPONENT_DIRS.map(dir => path.relative(ROOT_DIR, dir)).join(', ')}`);

// Launch the component tester
try {
  debugLog('general', 'log_statement', 'Creating test environment...')
  
  // Create a temporary test file
  const testFile = path.join(ROOT_DIR, 'src/test-runner.tsx');
  
  fs.writeFileSync(testFile, `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ComponentTesterApp } from './components/testing/ComponentTesterApp';

import { debugLog } from '../utils/auditLogger';

const containerElement = document.getElementById('root');
if (!containerElement) throw new Error('Failed to find the root element');
const root = createRoot(containerElement);

root.render(
  <React.StrictMode>
    <ComponentTesterApp
      componentDirs={[
        './src/components',
        './src/pages'
      ]}
      options={{
        excludeDirs: ${JSON.stringify(EXCLUDE_DIRS)},
        excludeFiles: ${JSON.stringify(EXCLUDE_FILES)},
        recursive: true
      }}
      onComplete={(results) => {
        debugLog('general', 'log_statement', 'Component testing complete!')
        debugLog('general', 'log_statement', JSON.stringify(results, null, 2));
        
        // Count results by status
        const counts = results.reduce((acc, result) => {
          acc[result.status] = (acc[result.status] || 0) + 1;
          return acc;
        }, {});
        
        debugLog('general', 'log_statement', \`Summary: \${results.length} components tested\`)
        debugLog('general', 'log_statement', \`Success: \${counts.success || 0}\`)
        debugLog('general', 'log_statement', \`Warnings: \${counts.warning || 0}\`)
        debugLog('general', 'log_statement', \`Errors: \${counts.error || 0}\`)
        
        // Save results to file
        try {
          const fs = require('fs');
          fs.writeFileSync(
            './component-test-results.json', 
            JSON.stringify(results, null, 2)
          );
          debugLog('general', 'log_statement', 'Results saved to component-test-results.json')
        } catch (e) {
          console.error('Failed to save results:', e);
        }
      }}
    />
  </React.StrictMode>
);
  `);

  debugLog('general', 'log_statement', 'Executing test runner...')
  execSync('npx craco start --test-components', { 
    cwd: ROOT_DIR,
    stdio: 'inherit'
  });
  
  debugLog('general', 'log_statement', 'Component testing complete!')
} catch (error) {
  console.error('Error running component tests:', error);
  process.exit(1);
} 