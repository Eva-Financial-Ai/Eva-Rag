import React from 'react';
import { createRoot } from 'react-dom/client';
import { ComponentTesterApp } from './components/testing/ComponentTesterApp';

import { debugLog } from './utils/auditLogger';

const containerElement = document.getElementById('root');
if (!containerElement) throw new Error('Failed to find the root element');
const root = createRoot(containerElement);

root.render(
  <React.StrictMode>
    <ComponentTesterApp
      componentDirs={['./src/components', './src/pages']}
      options={{
        excludeDirs: ['__tests__', 'node_modules', 'coverage', 'dist'],
        excludeFiles: [
          'index.ts',
          'index.tsx',
          'types.ts',
          'types.tsx',
          '*.test.tsx',
          '*.spec.tsx',
        ],
        recursive: true,
      }}
      onComplete={results => {
        debugLog('general', 'log_statement', 'Component testing complete!');
        debugLog('general', 'log_statement', JSON.stringify(results, null, 2));

        // Count results by status with proper typing
        interface StatusCounts {
          success?: number;
          warning?: number;
          error?: number;
          [key: string]: number | undefined;
        }

        const counts = results.reduce<StatusCounts>((acc, result) => {
          acc[result.status] = (acc[result.status] || 0) + 1;
          return acc;
        }, {});

        debugLog('general', 'log_statement', `Summary: ${results.length} components tested`);
        debugLog('general', 'log_statement', `Success: ${counts.success || 0}`);
        debugLog('general', 'log_statement', `Warnings: ${counts.warning || 0}`);
        debugLog('general', 'log_statement', `Errors: ${counts.error || 0}`);

        // Save results to file
        try {
          const fs = require('fs');
          fs.writeFileSync('./component-test-results.json', JSON.stringify(results, null, 2));
          debugLog('general', 'log_statement', 'Results saved to component-test-results.json');
        } catch (e) {
          console.error('Failed to save results:', e);
        }
      }}
    />
  </React.StrictMode>,
);
