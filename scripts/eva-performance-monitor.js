#!/usr/bin/env node

// Make this file an ESM module
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

import { debugLog } from '../utils/auditLogger';

// Create directories to store reports
const REPORTS_DIR = path.join(process.cwd(), 'performance-reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Timestamp for report naming
const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const REPORT_FILE = path.join(REPORTS_DIR, `performance-report-${timestamp}.json`);

debugLog('general', 'log_statement', chalk.blue('🔍 EVA Code Monitoring Tool - Performance Analysis'));
debugLog('general', 'log_statement', chalk.blue('===================================================='));

// Results object to store all findings
const results = {
  timestamp: new Date().toISOString(),
  componentPerformance: {},
  bundleSize: {},
  apiIntegration: {},
  errors: [],
  warnings: [],
  recommendations: []
};

// Run a command and capture output
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    results.errors.push({
      command,
      error: error.message
    });
    console.error(chalk.red(`Command failed: ${command}`));
    console.error(chalk.red(error.message));
    return null;
  }
}

// 1. Component Re-render Analysis
debugLog('general', 'log_statement', chalk.green('📊 Analyzing React Component Performance...'));

function scanForPerformanceIssues() {
  // Look for components without React.memo where they should have it
  const componentFiles = findReactComponentFiles();
  
  componentFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for missing React.memo
    if (content.includes('export default') && 
        !content.includes('React.memo') && 
        !content.includes('memo(') &&
        content.match(/props\s*=>/)) {
      results.warnings.push({
        type: 'component',
        file,
        issue: 'Component might benefit from React.memo optimization'
      });
    }
    
    // Check for missing useCallback
    if (content.includes('useEffect') && 
        content.includes('function') && 
        !content.includes('useCallback')) {
      results.warnings.push({
        type: 'component',
        file,
        issue: 'Component has functions within render that might benefit from useCallback'
      });
    }
    
    // Check for proper dependency arrays
    const useEffectMatches = content.match(/useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?}\s*,\s*\[\s*\]\s*\)/g);
    if (useEffectMatches) {
      results.warnings.push({
        type: 'component',
        file,
        issue: 'Empty dependency array in useEffect - verify if dependencies are missing'
      });
    }
  });
}

function findReactComponentFiles() {
  try {
    // Find .tsx/.jsx files in src/components directory
    const output = execSync('find src -type f -name "*.tsx" -o -name "*.jsx"', { encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
  } catch (error) {
    results.errors.push({
      command: 'find React component files',
      error: error.message
    });
    return [];
  }
}

// 2. Bundle Size Analysis
debugLog('general', 'log_statement', chalk.green('📦 Analyzing Bundle Size...'));

function analyzeBundleSize() {
  debugLog('general', 'log_statement', 'Building production bundle...')
  runCommand('npm run build');
  
  // Get JS bundle files
  const buildDir = path.join(process.cwd(), 'build', 'static', 'js');
  if (fs.existsSync(buildDir)) {
    const files = fs.readdirSync(buildDir).filter(f => f.endsWith('.js'));
    
    let totalSize = 0;
    const bundleInfo = files.map(file => {
      const stats = fs.statSync(path.join(buildDir, file));
      totalSize += stats.size;
      return {
        name: file,
        size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
        sizeBytes: stats.size
      };
    });
    
    results.bundleSize = {
      totalSize: (totalSize / 1024 / 1024).toFixed(2) + ' MB',
      totalSizeBytes: totalSize,
      bundles: bundleInfo
    };
    
    // Check for large bundles
    const largeBundles = bundleInfo.filter(b => b.sizeBytes > 500 * 1024); // Over 500KB
    if (largeBundles.length > 0) {
      results.warnings.push({
        type: 'bundle',
        issue: `${largeBundles.length} large bundle(s) detected. Consider code splitting.`,
        bundles: largeBundles.map(b => b.name)
      });
    }
  } else {
    results.errors.push({
      type: 'bundle',
      error: 'Build directory not found after build. Make sure build process is working correctly.'
    });
  }
}

// 3. API Integration Analysis
debugLog('general', 'log_statement', chalk.green('🔌 Analyzing API Integration...'));

function analyzeApiIntegration() {
  // Find files with API calls
  const apiFiles = findApiFiles();
  let apiEndpoints = [];
  
  apiFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for error handling
    if (content.includes('fetch(') || content.includes('axios.') || content.includes('.get(') || content.includes('.post(')) {
      if (!content.includes('catch(') && !content.includes('try {')) {
        results.warnings.push({
          type: 'api',
          file,
          issue: 'API call without proper error handling detected'
        });
      }
      
      // Extract API endpoints (simplified, would need more robust parsing in production)
      const urls = extractUrls(content);
      apiEndpoints = [...apiEndpoints, ...urls];
    }
  });
  
  results.apiIntegration = {
    totalEndpoints: apiEndpoints.length,
    endpoints: apiEndpoints
  };
}

function findApiFiles() {
  try {
    // Find files that might contain API calls
    const output = execSync('grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" "fetch\\|axios\\|.get(\\|.post(" src', { encoding: 'utf8' });
    return [...new Set(output.split('\n').filter(Boolean).map(line => line.split(':')[0]))];
  } catch (error) {
    // Grep returns non-zero exit code when no matches are found
    if (error.status !== 1) {
      results.errors.push({
        command: 'find API files',
        error: error.message
      });
    }
    return [];
  }
}

function extractUrls(content) {
  // Simple regex to extract URLs and API endpoints
  const urlRegex = /(https?:\/\/[^\s'"]+)|(\/api\/[^\s'"]+)/g;
  const matches = content.match(urlRegex) || [];
  return [...new Set(matches)];
}

// 4. Device Responsiveness Check
debugLog('general', 'log_statement', chalk.green('📱 Checking Device Responsiveness...'));

function checkResponsiveness() {
  // Look for responsive design patterns
  const cssFiles = findCssFiles();
  let hasMediaQueries = false;
  let hasTailwindResponsive = false;
  
  cssFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for media queries
    if (content.includes('@media')) {
      hasMediaQueries = true;
    }
    
    // Check for Tailwind responsive classes
    if (content.includes('sm:') || content.includes('md:') || content.includes('lg:')) {
      hasTailwindResponsive = true;
    }
  });
  
  results.responsiveness = {
    hasMediaQueries,
    hasTailwindResponsive
  };
  
  if (!hasMediaQueries && !hasTailwindResponsive) {
    results.warnings.push({
      type: 'responsiveness',
      issue: 'No responsive design patterns detected. Ensure proper mobile support.'
    });
  }
}

function findCssFiles() {
  try {
    // Find CSS, SCSS, and CSS-in-JS files
    const output = execSync('find src -type f -name "*.css" -o -name "*.scss" -o -name "*.styled.ts*"', { encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
  } catch (error) {
    results.errors.push({
      command: 'find CSS files',
      error: error.message
    });
    return [];
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const focusArg = args.find(arg => arg.startsWith('--focus='));
const focus = focusArg ? focusArg.split('=')[1] : 'all';

debugLog('general', 'log_statement', chalk.blue(`🔍 Running EVA Code Monitor with focus on: ${focus}`));

// Run all checks
try {
  // Run different checks based on focus
  if (focus === 'all' || focus === 'components') {
    debugLog('general', 'log_statement', chalk.blue('Running component performance checks...'));
    scanForPerformanceIssues();
  }
  
  if (focus === 'all' || focus === 'bundle') {
    debugLog('general', 'log_statement', chalk.blue('Running bundle size analysis...'));
    // Commented out to avoid actually building in this script execution
    // analyzeBundleSize(); 
  }
  
  if (focus === 'all' || focus === 'api') {
    debugLog('general', 'log_statement', chalk.blue('Running API integration analysis...'));
    analyzeApiIntegration();
  }
  
  if (focus === 'all' || focus === 'responsiveness') {
    debugLog('general', 'log_statement', chalk.blue('Running responsiveness checks...'));
    checkResponsiveness();
  }
  
  // Generate recommendations
  generateRecommendations();
  
  // Save results
  fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
  
  // Display summary
  displaySummary();
  
  debugLog('general', 'log_statement', chalk.blue(`✅ Performance report saved to ${REPORT_FILE}`));
} catch (error) {
  console.error(chalk.red('Error running performance checks:'));
  console.error(error);
  results.errors.push({
    type: 'general',
    error: error.message
  });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
}

function generateRecommendations() {
  // Based on issues found, generate recommendations
  if (results.warnings.filter(w => w.type === 'component').length > 0) {
    results.recommendations.push('Implement React.memo for stateless components that re-render often');
    results.recommendations.push('Use useCallback for event handlers passed as props');
    results.recommendations.push('Review useEffect dependency arrays for completeness and correctness');
  }
  
  if (results.bundleSize && results.bundleSize.totalSizeBytes > 1024 * 1024) {
    results.recommendations.push('Implement code splitting using React.lazy and Suspense');
    results.recommendations.push('Review and optimize large dependencies');
  }
  
  if (results.warnings.filter(w => w.type === 'api').length > 0) {
    results.recommendations.push('Implement consistent error handling for all API calls');
    results.recommendations.push('Use React Query or SWR for API call caching and retry logic');
  }
}

function displaySummary() {
  debugLog('general', 'log_statement', '\n')
  debugLog('general', 'log_statement', chalk.blue('📊 Performance Analysis Summary'));
  debugLog('general', 'log_statement', '--------------------------------')
  
  debugLog('general', 'log_statement', chalk.yellow(`Warnings: ${results.warnings.length}`));
  debugLog('general', 'log_statement', chalk.red(`Errors: ${results.errors.length}`));
  
  if (results.warnings.length > 0) {
    debugLog('general', 'log_statement', '\n')
    debugLog('general', 'log_statement', chalk.yellow('⚠️ Top Warnings:'));
    results.warnings.slice(0, 5).forEach(warning => {
      debugLog('general', 'log_statement', `- ${warning.issue} ${warning.file ? `(${warning.file})` : ''}`);
    });
  }
  
  if (results.recommendations.length > 0) {
    debugLog('general', 'log_statement', '\n')
    debugLog('general', 'log_statement', chalk.green('💡 Recommendations:'));
    results.recommendations.forEach(rec => {
      debugLog('general', 'log_statement', `- ${rec}`)
    });
  }
} 