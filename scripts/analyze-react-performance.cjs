#!/usr/bin/env node

/**
 * EVA React Performance Analyzer
 * This tool analyzes React component performance and generates recommendations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const REPORTS_DIR = path.join(process.cwd(), 'performance-reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Timestamp for report naming
const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const REPORT_FILE = path.join(REPORTS_DIR, `react-performance-${timestamp}.json`);

console.log('🔍 EVA React Performance Analyzer');
console.log('=================================');

// Results object
const results = {
  timestamp: new Date().toISOString(),
  components: [],
  recommendations: [],
  warnings: []
};

// Find React component files
function findReactComponents() {
  try {
    console.log('Finding React components...');
    const output = execSync('find src -type f -name "*.tsx" -o -name "*.jsx" | grep -v "__tests__"', { encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding React components:', error.message);
    return [];
  }
}

// Analyze a React component file
function analyzeComponent(filePath) {
  console.log(`Analyzing ${filePath}...`);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Extract component name from filename
    const componentName = fileName.replace(/\.(jsx|tsx)$/, '');
    
    // Basic component info
    const component = {
      name: componentName,
      path: filePath,
      issues: []
    };
    
    // Check for performance issues
    
    // 1. Check if component uses React.memo
    if (content.includes('export default') && 
        !content.includes('React.memo') && 
        !content.includes('memo(') &&
        content.match(/props\s*=>/)) {
      component.issues.push({
        type: 'memo',
        description: 'Component might benefit from React.memo optimization',
        severity: 'medium'
      });
    }
    
    // 2. Check for missing useCallback
    if (content.includes('useEffect') && 
        content.includes('function') && 
        !content.includes('useCallback')) {
      component.issues.push({
        type: 'callback',
        description: 'Component has functions that might benefit from useCallback',
        severity: 'medium'
      });
    }
    
    // 3. Check for proper dependency arrays
    const emptyDependencyArrays = content.match(/useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?}\s*,\s*\[\s*\]\s*\)/g);
    if (emptyDependencyArrays) {
      component.issues.push({
        type: 'dependencies',
        description: 'Component has useEffect with empty dependency array - verify if dependencies are missing',
        severity: 'medium'
      });
    }
    
    // 4. Check for inline object creation in render
    const jsxObjectCreation = content.match(/<[A-Z][A-Za-z]*\s+[^>]*?{\s*\{/g);
    if (jsxObjectCreation) {
      component.issues.push({
        type: 'inline-objects',
        description: 'Component creates objects inline in JSX which may cause unnecessary re-renders',
        severity: 'medium'
      });
    }
    
    // 5. Check component size (large components might need splitting)
    const lineCount = content.split('\n').length;
    if (lineCount > 300) {
      component.issues.push({
        type: 'size',
        description: `Component is large (${lineCount} lines) and might benefit from splitting into smaller components`,
        severity: 'medium'
      });
    }
    
    return component;
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

// Generate recommendations based on issues
function generateRecommendations() {
  const issueTypes = {};
  
  // Count issues by type
  results.components.forEach(component => {
    component.issues.forEach(issue => {
      if (!issueTypes[issue.type]) {
        issueTypes[issue.type] = 0;
      }
      issueTypes[issue.type]++;
    });
  });
  
  // Generate recommendations
  if (issueTypes.memo && issueTypes.memo > 3) {
    results.recommendations.push(
      'Use React.memo for functional components to prevent unnecessary re-renders'
    );
  }
  
  if (issueTypes.callback && issueTypes.callback > 3) {
    results.recommendations.push(
      'Use useCallback for event handlers and functions passed as props'
    );
  }
  
  if (issueTypes.dependencies && issueTypes.dependencies > 3) {
    results.recommendations.push(
      'Review useEffect dependency arrays to ensure all dependencies are included'
    );
  }
  
  if (issueTypes['inline-objects'] && issueTypes['inline-objects'] > 3) {
    results.recommendations.push(
      'Move object creation outside JSX or memoize objects with useMemo'
    );
  }
  
  if (issueTypes.size && issueTypes.size > 2) {
    results.recommendations.push(
      'Consider breaking large components into smaller, more focused components'
    );
  }
}

// Display summary
function displaySummary() {
  console.log('\n📊 Analysis Summary');
  console.log('------------------');
  
  // Count components with issues
  const componentsWithIssues = results.components.filter(c => c.issues.length > 0);
  
  console.log(`Total components analyzed: ${results.components.length}`);
  console.log(`Components with issues: ${componentsWithIssues.length}`);
  
  // Show top components with most issues
  if (componentsWithIssues.length > 0) {
    console.log('\n🔥 Top Components to Optimize:');
    
    componentsWithIssues
      .sort((a, b) => b.issues.length - a.issues.length)
      .slice(0, 5)
      .forEach(component => {
        console.log(`- ${component.name} (${component.issues.length} issues)`);
        component.issues.forEach(issue => {
          console.log(`  • ${issue.description}`);
        });
      });
  }
  
  // Show recommendations
  if (results.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    results.recommendations.forEach(rec => {
      console.log(`- ${rec}`);
    });
  }
}

// Main execution
try {
  // Find all React components
  const componentFiles = findReactComponents();
  console.log(`Found ${componentFiles.length} React components`);
  
  // Analyze each component
  for (const file of componentFiles) {
    const component = analyzeComponent(file);
    if (component) {
      results.components.push(component);
    }
  }
  
  // Generate recommendations
  generateRecommendations();
  
  // Save results to file
  fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
  
  // Display summary
  displaySummary();
  
  console.log(`\n✅ Full analysis report saved to ${REPORT_FILE}`);
} catch (error) {
  console.error('Error running analysis:', error);
} 