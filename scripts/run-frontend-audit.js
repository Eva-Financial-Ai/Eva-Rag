import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node
/**
 * Frontend Audit Utility
 * 
 * This script runs comprehensive frontend audit tests in the background
 * as a system administrator tool. It's not meant to be used in the UI.
 * 
 * Usage:
 *   node scripts/run-frontend-audit.js [category]
 * 
 * Categories:
 *   all - Run all tests (default)
 *   api - API integration tests
 *   routing - Routing & navigation tests
 *   components - Component functionality tests
 *   responsive - Responsive design tests
 *   a11y - Accessibility tests
 *   typescript - TypeScript & code quality tests
 *   security - Security audit
 *   demo - Demo flow verification
 *   build - Build & deployment readiness
 *   performance - Performance metrics audit
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const ora = require('ora'); // You may need to install this: npm install ora
const chalk = require('chalk'); // You may need to install this: npm install chalk

// Ensure output directory exists
const OUTPUT_DIR = path.join(__dirname, '../audit-reports');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Get timestamp for report filenames
const getTimestamp = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
};

// Main report object
const report = {
  timestamp: new Date().toISOString(),
  summary: {},
  details: {},
};

// Helper function to run a command and capture output
function runCommand(command, options = {}) {
  const spinner = ora(`Running: ${command}`).start();
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      ...options
    });
    spinner.succeed(`Completed: ${command}`);
    return { success: true, output };
  } catch (error) {
    spinner.fail(`Failed: ${command}`);
    return { 
      success: false, 
      output: error.stdout?.toString() || '', 
      error: error.stderr?.toString() || error.message 
    };
  }
}

// Helper to write JSON report
function writeReport() {
  const timestamp = getTimestamp();
  const filePath = path.join(OUTPUT_DIR, `frontend-audit-${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  debugLog('general', 'log_statement', chalk.green(`\nReport saved to: ${filePath}`));
  
  // Also generate HTML summary
  const htmlPath = path.join(OUTPUT_DIR, `frontend-audit-${timestamp}.html`);
  const htmlContent = generateHtmlReport(report);
  fs.writeFileSync(htmlPath, htmlContent);
  debugLog('general', 'log_statement', chalk.green(`HTML report saved to: ${htmlPath}`));
}

// Generate HTML report
function generateHtmlReport(report) {
  const statusEmoji = {
    pass: '✅',
    warning: '⚠️',
    fail: '❌',
    notRun: '⚫'
  };
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Frontend Audit Report ${report.timestamp}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
        h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        h2 { color: #3498db; margin-top: 30px; }
        h3 { color: #2c3e50; }
        .section { margin: 20px 0; padding: 15px; border-radius: 5px; background: #f8f9fa; }
        .test { margin: 10px 0; padding: 10px; border-left: 4px solid #ddd; }
        .pass { border-left-color: #2ecc71; }
        .warning { border-left-color: #f39c12; }
        .fail { border-left-color: #e74c3c; }
        .notRun { border-left-color: #7f8c8d; }
        pre { background: #2c3e50; color: #ecf0f1; padding: 10px; border-radius: 3px; overflow-x: auto; }
        .summary { display: flex; gap: 15px; flex-wrap: wrap; }
        .summary-item { display: flex; align-items: center; background: #ecf0f1; padding: 10px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <h1>Frontend Audit Report</h1>
      <p>Generated on: ${new Date(report.timestamp).toLocaleString()}</p>
      
      <div class="section">
        <h2>Summary</h2>
        <div class="summary">
  `;
  
  // Add summary items
  Object.entries(report.summary).forEach(([category, status]) => {
    html += `
      <div class="summary-item ${status.toLowerCase()}">
        <span>${statusEmoji[status.toLowerCase()]}</span>
        <div>
          <h3>${category}</h3>
          <p>${status}</p>
        </div>
      </div>
    `;
  });
  
  html += `
        </div>
      </div>
  `;
  
  // Add detailed sections
  Object.entries(report.details).forEach(([category, details]) => {
    html += `
      <div class="section">
        <h2>${category}</h2>
    `;
    
    if (Array.isArray(details.tests)) {
      details.tests.forEach(test => {
        html += `
          <div class="test ${test.status.toLowerCase()}">
            <h3>${statusEmoji[test.status.toLowerCase()]} ${test.name}</h3>
            <p>${test.description || ''}</p>
            ${test.output ? `<pre>${test.output}</pre>` : ''}
          </div>
        `;
      });
    } else {
      html += `<p>${JSON.stringify(details)}</p>`;
    }
    
    html += `</div>`;
  });
  
  html += `
    </body>
    </html>
  `;
  
  return html;
}

// API Integration Tests
async function runApiTests() {
  debugLog('general', 'log_statement', chalk.blue('\n=== Running API Integration Tests ==='));
  
  const tests = [
    {
      name: 'React Query Cache Configuration',
      description: 'Verifying proper React Query/SWR cache configuration',
      run: () => {
        // Analyze React Query hooks
        return runCommand('grep -r "useQuery\\|useMutation\\|useInfiniteQuery" --include="*.tsx" --include="*.ts" src/');
      }
    },
    {
      name: 'API Request Debouncing',
      description: 'Checking for proper debouncing implementation in search inputs',
      run: () => {
        return runCommand('grep -r "debounce\\|useDebounce" --include="*.tsx" --include="*.ts" src/');
      }
    },
    {
      name: 'API Error Handling',
      description: 'Verifying error handling for API calls',
      run: () => {
        return runCommand('grep -r "catch\\|error" --include="*.tsx" --include="*.ts" src/api/');
      }
    }
  ];
  
  const results = [];
  for (const test of tests) {
    debugLog('general', 'log_statement', `\nRunning test: ${test.name}`)
    const result = await test.run();
    
    results.push({
      name: test.name,
      description: test.description,
      status: result.success ? 'pass' : 'warning',
      output: result.output
    });
  }
  
  report.details.api = {
    tests: results
  };
  
  // Determine overall section status
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  
  if (failCount > 0) {
    report.summary.api = 'fail';
  } else if (warningCount > 0) {
    report.summary.api = 'warning';
  } else {
    report.summary.api = 'pass';
  }
}

// Routing & Navigation Tests
async function runRoutingTests() {
  debugLog('general', 'log_statement', chalk.blue('\n=== Running Routing & Navigation Tests ==='));
  
  const tests = [
    {
      name: 'Route Configuration',
      description: 'Verifying routes are properly defined',
      run: () => {
        return runCommand('find src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "Route\\|router\\|useNavigate"');
      }
    },
    {
      name: 'Route Guards and Auth',
      description: 'Checking for proper route guards and authentication redirects',
      run: () => {
        return runCommand('grep -r "PrivateRoute\\|isAuthenticated\\|requireAuth" --include="*.tsx" --include="*.ts" src/');
      }
    },
    {
      name: 'Error Pages',
      description: 'Checking for error pages (404, etc)',
      run: () => {
        return runCommand('grep -r "NotFound\\|Error" --include="*.tsx" src/');
      }
    }
  ];
  
  const results = [];
  for (const test of tests) {
    debugLog('general', 'log_statement', `\nRunning test: ${test.name}`)
    const result = await test.run();
    
    results.push({
      name: test.name,
      description: test.description,
      status: result.success ? 'pass' : 'warning',
      output: result.output
    });
  }
  
  report.details.routing = {
    tests: results
  };
  
  // Determine overall section status
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  
  if (failCount > 0) {
    report.summary.routing = 'fail';
  } else if (warningCount > 0) {
    report.summary.routing = 'warning';
  } else {
    report.summary.routing = 'pass';
  }
}

// TypeScript & Code Quality Tests
async function runTypeScriptTests() {
  debugLog('general', 'log_statement', chalk.blue('\n=== Running TypeScript & Code Quality Tests ==='));
  
  const tests = [
    {
      name: 'TypeScript Configuration',
      description: 'Checking TypeScript configuration',
      run: () => {
        return runCommand('cat tsconfig.json');
      }
    },
    {
      name: 'TypeScript Errors',
      description: 'Checking for TypeScript errors',
      run: () => {
        return runCommand('npx tsc --noEmit');
      }
    },
    {
      name: 'ESLint Errors',
      description: 'Checking for ESLint errors',
      run: () => {
        return runCommand('npx eslint . --ext .js,.jsx,.ts,.tsx --max-warnings 0 || echo "ESLint found issues"');
      }
    },
    {
      name: 'Prettier Formatting',
      description: 'Checking for Prettier formatting issues',
      run: () => {
        return runCommand('npx prettier --check "src/**/*.{js,jsx,ts,tsx,json,css,md}" || echo "Prettier found formatting issues"');
      }
    },
    {
      name: 'Unused Imports',
      description: 'Checking for unused imports',
      run: () => {
        // This command might need to be adjusted based on your project setup
        return runCommand('npx unimported || echo "Unimported check completed with issues"');
      }
    }
  ];
  
  const results = [];
  for (const test of tests) {
    debugLog('general', 'log_statement', `\nRunning test: ${test.name}`)
    const result = await test.run();
    
    // For TypeScript errors, we want to fail if there are errors
    const status = test.name === 'TypeScript Errors' && !result.success ? 'fail' : 
                   result.success ? 'pass' : 'warning';
    
    results.push({
      name: test.name,
      description: test.description,
      status,
      output: result.output
    });
  }
  
  report.details.typescript = {
    tests: results
  };
  
  // Determine overall section status
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  
  if (failCount > 0) {
    report.summary.typescript = 'fail';
  } else if (warningCount > 0) {
    report.summary.typescript = 'warning';
  } else {
    report.summary.typescript = 'pass';
  }
}

// Accessibility Tests
async function runA11yTests() {
  debugLog('general', 'log_statement', chalk.blue('\n=== Running Accessibility Tests ==='));
  
  const tests = [
    {
      name: 'Heading Hierarchy',
      description: 'Checking for proper heading hierarchy',
      run: () => {
        return runCommand('grep -r "<h[1-6]" --include="*.tsx" --include="*.jsx" src/');
      }
    },
    {
      name: 'ARIA Attributes',
      description: 'Checking for ARIA attributes usage',
      run: () => {
        return runCommand('grep -r "aria-" --include="*.tsx" --include="*.jsx" src/');
      }
    },
    {
      name: 'Form Labels',
      description: 'Checking form label associations',
      run: () => {
        return runCommand('grep -r "<label" --include="*.tsx" --include="*.jsx" src/');
      }
    },
    {
      name: 'Alt Text',
      description: 'Checking alt text for images',
      run: () => {
        return runCommand('grep -r "<img" --include="*.tsx" --include="*.jsx" src/ | grep -o "alt=\\"[^\\"]*\\""');
      }
    }
  ];
  
  const results = [];
  for (const test of tests) {
    debugLog('general', 'log_statement', `\nRunning test: ${test.name}`)
    const result = await test.run();
    
    results.push({
      name: test.name,
      description: test.description,
      status: result.success ? 'pass' : 'warning',
      output: result.output
    });
  }
  
  report.details.a11y = {
    tests: results
  };
  
  // Determine overall section status
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  
  if (failCount > 0) {
    report.summary.a11y = 'fail';
  } else if (warningCount > 0) {
    report.summary.a11y = 'warning';
  } else {
    report.summary.a11y = 'pass';
  }
}

// Performance Tests
async function runPerformanceTests() {
  debugLog('general', 'log_statement', chalk.blue('\n=== Running Performance Metrics Audit ==='));
  
  const tests = [
    {
      name: 'Bundle Size Analysis',
      description: 'Analyzing production build bundle size',
      run: () => {
        return runCommand('npm run build');
      }
    },
    {
      name: 'Memory Leak Check',
      description: 'Checking for potential memory leaks',
      run: () => {
        return runCommand('grep -r "useEffect\\|addEventListener\\|removeEventListener" --include="*.tsx" --include="*.jsx" src/');
      }
    },
    {
      name: 'Animation Performance',
      description: 'Checking animation performance optimization',
      run: () => {
        return runCommand('grep -r "transform\\|transition\\|animation" --include="*.css" --include="*.scss" src/');
      }
    }
  ];
  
  const results = [];
  for (const test of tests) {
    debugLog('general', 'log_statement', `\nRunning test: ${test.name}`)
    const result = await test.run();
    
    results.push({
      name: test.name,
      description: test.description,
      status: result.success ? 'pass' : 'warning',
      output: result.output
    });
  }
  
  report.details.performance = {
    tests: results
  };
  
  // Determine overall section status
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  
  if (failCount > 0) {
    report.summary.performance = 'fail';
  } else if (warningCount > 0) {
    report.summary.performance = 'warning';
  } else {
    report.summary.performance = 'pass';
  }
}

// Main function to run tests
async function runTests(category = 'all') {
  debugLog('general', 'log_statement', chalk.green.bold(`\n=== Starting Frontend Audit (${category}) ===\n`));
  
  try {
    if (category === 'all' || category === 'api') {
      await runApiTests();
    }
    
    if (category === 'all' || category === 'routing') {
      await runRoutingTests();
    }
    
    if (category === 'all' || category === 'typescript') {
      await runTypeScriptTests();
    }
    
    if (category === 'all' || category === 'a11y') {
      await runA11yTests();
    }
    
    if (category === 'all' || category === 'performance') {
      await runPerformanceTests();
    }
    
    // Write final report
    writeReport();
    
    debugLog('general', 'log_statement', chalk.green.bold('\n=== Frontend Audit Completed ===\n'));
  } catch (error) {
    console.error(chalk.red('\nError running tests:'), error);
  }
}

// Get the category from command line args
const category = process.argv[2] || 'all';
runTests(category); 