import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node
/**
 * Component Testing Utility
 * 
 * This script tests individual React components for functionality, performance,
 * accessibility, and code quality.
 * 
 * Usage:
 *   node scripts/component-tester.js [component-path]
 * 
 * Example:
 *   node scripts/component-tester.js src/components/common/Button
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ora = require('ora'); // You may need to install this: npm install ora
const chalk = require('chalk'); // You may need to install this: npm install chalk

// Get component path from command line arguments
const componentPath = process.argv[2];
if (!componentPath) {
  console.error(chalk.red('Please provide a component path'));
  debugLog('general', 'log_statement', chalk.yellow('Example: node scripts/component-tester.js src/components/common/Button'));
  process.exit(1);
}

// Ensure the component exists
if (!fs.existsSync(componentPath)) {
  console.error(chalk.red(`Component path not found: ${componentPath}`));
  process.exit(1);
}

// Create output directory for reports
const OUTPUT_DIR = path.join(__dirname, '../component-test-reports');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Get component name
const componentName = path.basename(componentPath);

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

// Main report object
const report = {
  componentName,
  timestamp: new Date().toISOString(),
  results: {}
};

// Test TypeScript types
async function testTypes() {
  debugLog('general', 'log_statement', chalk.blue('\n=== Testing TypeScript Types ==='));
  const result = runCommand(`npx tsc --noEmit ${componentPath}/**/*.tsx`);
  
  report.results.types = {
    success: result.success,
    output: result.output,
    error: result.error
  };
  
  return result.success;
}

// Test component props
async function testProps() {
  debugLog('general', 'log_statement', chalk.blue('\n=== Analyzing Component Props ==='));
  
  // Find props interface or type definition
  const result = runCommand(`grep -r "interface.*Props\\|type.*Props" --include="*.tsx" --include="*.ts" ${componentPath}`);
  
  report.results.props = {
    success: result.success,
    props: result.output,
  };
  
  return result.success;
}

// Test component imports and dependencies
async function testDependencies() {
  debugLog('general', 'log_statement', chalk.blue('\n=== Analyzing Dependencies ==='));
  
  // Find imports
  const result = runCommand(`grep -r "import " --include="*.tsx" --include="*.ts" ${componentPath}`);
  
  report.results.dependencies = {
    success: result.success,
    imports: result.output,
  };
  
  return result.success;
}

// Test component rendering
async function testRendering() {
  debugLog('general', 'log_statement', chalk.blue('\n=== Analyzing Component Rendering ==='));
  
  // Find return statement or JSX
  const result = runCommand(`grep -r "return (" --include="*.tsx" ${componentPath}`);
  
  report.results.rendering = {
    success: result.success,
    renderMethod: result.output,
  };
  
  return result.success;
}

// Test hooks usage
async function testHooks() {
  debugLog('general', 'log_statement', chalk.blue('\n=== Analyzing React Hooks Usage ==='));
  
  // Find hooks
  const result = runCommand(`grep -r "use[A-Z]" --include="*.tsx" --include="*.ts" ${componentPath}`);
  
  report.results.hooks = {
    success: result.success,
    hooks: result.output,
  };
  
  return result.success;
}

// Test event handlers
async function testEventHandlers() {
  debugLog('general', 'log_statement', chalk.blue('\n=== Analyzing Event Handlers ==='));
  
  // Find event handlers
  const result = runCommand(`grep -r "onClick\\|onChange\\|onSubmit\\|onBlur\\|onFocus" --include="*.tsx" ${componentPath}`);
  
  report.results.eventHandlers = {
    success: result.success,
    handlers: result.output,
  };
  
  return result.success;
}

// Test accessibility
async function testAccessibility() {
  debugLog('general', 'log_statement', chalk.blue('\n=== Analyzing Accessibility ==='));
  
  // Find accessibility attributes
  const result = runCommand(`grep -r "aria-\\|role=\\|alt=\\|tabIndex" --include="*.tsx" ${componentPath}`);
  
  report.results.accessibility = {
    success: result.success,
    a11yAttributes: result.output,
  };
  
  return result.success;
}

// Generate a report
function generateReport() {
  const reportPath = path.join(OUTPUT_DIR, `${componentName}-report.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  debugLog('general', 'log_statement', chalk.green(`\nReport saved to: ${reportPath}`));
  
  // Generate HTML report
  const htmlPath = path.join(OUTPUT_DIR, `${componentName}-report.html`);
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${componentName} Component Test Report</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
        h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        h2 { color: #3498db; margin-top: 30px; }
        .section { margin: 20px 0; padding: 15px; border-radius: 5px; background: #f8f9fa; }
        .success { color: #2ecc71; }
        .failure { color: #e74c3c; }
        pre { background: #2c3e50; color: #ecf0f1; padding: 10px; border-radius: 3px; overflow-x: auto; }
        .summary { display: flex; flex-wrap: wrap; gap: 15px; }
        .summary-item { padding: 10px; border-radius: 5px; border: 1px solid #ddd; flex: 1 0 200px; }
      </style>
    </head>
    <body>
      <h1>${componentName} Component Test Report</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      
      <div class="summary">
        <div class="summary-item">
          <h3>TypeScript</h3>
          <p class="${report.results.types?.success ? 'success' : 'failure'}">
            ${report.results.types?.success ? '✅ Success' : '❌ Issues Found'}
          </p>
        </div>
        <div class="summary-item">
          <h3>Props</h3>
          <p class="${report.results.props?.success ? 'success' : 'failure'}">
            ${report.results.props?.success ? '✅ Defined' : '❓ Not Found'}
          </p>
        </div>
        <div class="summary-item">
          <h3>Hooks</h3>
          <p class="${report.results.hooks?.success ? 'success' : 'failure'}">
            ${report.results.hooks?.success ? '✅ Found' : '❓ Not Found'}
          </p>
        </div>
        <div class="summary-item">
          <h3>Event Handlers</h3>
          <p class="${report.results.eventHandlers?.success ? 'success' : 'failure'}">
            ${report.results.eventHandlers?.success ? '✅ Found' : '❓ Not Found'}
          </p>
        </div>
        <div class="summary-item">
          <h3>Accessibility</h3>
          <p class="${report.results.accessibility?.success ? 'success' : 'failure'}">
            ${report.results.accessibility?.success ? '✅ Found' : '❓ Not Found'}
          </p>
        </div>
      </div>
      
      <div class="section">
        <h2>TypeScript Types</h2>
        ${report.results.types?.error ? `<pre>${report.results.types.error}</pre>` : '<p>No type errors found.</p>'}
      </div>
      
      <div class="section">
        <h2>Component Props</h2>
        ${report.results.props?.props ? `<pre>${report.results.props.props}</pre>` : '<p>No props interface found.</p>'}
      </div>
      
      <div class="section">
        <h2>Dependencies</h2>
        ${report.results.dependencies?.imports ? `<pre>${report.results.dependencies.imports}</pre>` : '<p>No imports found.</p>'}
      </div>
      
      <div class="section">
        <h2>Rendering</h2>
        ${report.results.rendering?.renderMethod ? `<pre>${report.results.rendering.renderMethod}</pre>` : '<p>No render method found.</p>'}
      </div>
      
      <div class="section">
        <h2>React Hooks</h2>
        ${report.results.hooks?.hooks ? `<pre>${report.results.hooks.hooks}</pre>` : '<p>No hooks found.</p>'}
      </div>
      
      <div class="section">
        <h2>Event Handlers</h2>
        ${report.results.eventHandlers?.handlers ? `<pre>${report.results.eventHandlers.handlers}</pre>` : '<p>No event handlers found.</p>'}
      </div>
      
      <div class="section">
        <h2>Accessibility</h2>
        ${report.results.accessibility?.a11yAttributes ? `<pre>${report.results.accessibility.a11yAttributes}</pre>` : '<p>No accessibility attributes found.</p>'}
      </div>
    </body>
    </html>
  `;
  fs.writeFileSync(htmlPath, htmlContent);
  debugLog('general', 'log_statement', chalk.green(`HTML report saved to: ${htmlPath}`));
  
  // Open the HTML report if on macOS
  if (process.platform === 'darwin') {
    execSync(`open ${htmlPath}`);
  }
}

// Main function
async function testComponent() {
  debugLog('general', 'log_statement', chalk.green.bold(`\n=== Testing Component: ${componentName} ===\n`));
  
  try {
    await testTypes();
    await testProps();
    await testDependencies();
    await testRendering();
    await testHooks();
    await testEventHandlers();
    await testAccessibility();
    
    generateReport();
    
    debugLog('general', 'log_statement', chalk.green.bold('\n=== Component Testing Completed ===\n'));
  } catch (error) {
    console.error(chalk.red('\nError testing component:'), error);
  }
}

// Start testing
testComponent(); 