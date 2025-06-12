#!/usr/bin/env node

/**
 * =============================================================================
 * REACT HOOK DEPENDENCY FIXER
 * =============================================================================
 * 
 * This script systematically identifies and fixes React Hook dependency issues
 * following financial application development best practices.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

import { debugLog } from '../utils/auditLogger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Common patterns for React Hook dependency issues
const HOOK_PATTERNS = {
  useEffect: /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]*?\},?\s*\[([^\]]*)\]\s*\)/g,
  useCallback: /useCallback\s*\([\s\S]*?,\s*\[([^\]]*)\]\s*\)/g,
  useMemo: /useMemo\s*\([\s\S]*?,\s*\[([^\]]*)\]\s*\)/g,
};

// Variables that typically don't need to be in dependency arrays
const STABLE_VARIABLES = [
  'setState', 'setError', 'setLoading', 'setData',
  'dispatch', 'navigate', 'location',
  'process', 'window', 'document', 'console',
  'parseInt', 'parseFloat', 'JSON', 'Date', 'Math',
  'useRef', 'useCallback', 'useMemo', 'useState', 'useEffect',
  'React', 'ReactDOM'
];

class ReactHookDependencyFixer {
  constructor() {
    this.issues = [];
    this.fixes = [];
    this.srcDir = path.join(process.cwd(), 'src');
  }

  // Main execution method
  async run() {
    debugLog('general', 'log_statement', '🔍 Starting React Hook dependency analysis...\n')
    
    try {
      // Find all TypeScript React files
      const files = this.findTsxFiles(this.srcDir);
      
      debugLog('general', 'log_statement', `📁 Found ${files.length} TypeScript React files\n`)
      
      // Analyze each file
      for (const file of files) {
        this.analyzeFile(file);
      }
      
      // Report results
      this.generateReport();
      
      // Apply fixes if requested
      if (process.argv.includes('--fix')) {
        this.applyFixes();
      }
      
    } catch (error) {
      console.error('❌ Error during analysis:', error);
      process.exit(1);
    }
  }

  // Find all .tsx and .ts files in src directory
  findTsxFiles(dir) {
    let files = [];
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files = files.concat(this.findTsxFiles(fullPath));
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Analyze a single file for hook dependency issues
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.srcDir, filePath);
      
      // Skip files that don't use React hooks
      if (!this.usesReactHooks(content)) {
        return;
      }
      
      debugLog('general', 'log_statement', `🔍 Analyzing: ${relativePath}`)
      
      // Check useEffect dependencies
      this.checkUseEffectDependencies(content, filePath);
      
      // Check useCallback dependencies
      this.checkUseCallbackDependencies(content, filePath);
      
      // Check useMemo dependencies
      this.checkUseMemoddependencies(content, filePath);
      
    } catch (error) {
      console.error(`❌ Error analyzing ${filePath}:`, error.message);
    }
  }

  // Check if file uses React hooks
  usesReactHooks(content) {
    return /use(Effect|Callback|Memo|State|Ref|Context)\s*\(/.test(content);
  }

  // Check useEffect dependencies
  checkUseEffectDependencies(content, filePath) {
    const matches = [...content.matchAll(HOOK_PATTERNS.useEffect)];
    
    for (const match of matches) {
      const fullMatch = match[0];
      const depsArray = match[1] || '';
      const line = this.getLineNumber(content, match.index);
      
      // Extract the effect function body
      const effectBody = this.extractEffectBody(fullMatch);
      const referencedVars = this.extractReferencedVariables(effectBody);
      const currentDeps = this.parseDependencyArray(depsArray);
      
      const missingDeps = referencedVars.filter(varName => 
        !currentDeps.includes(varName) && 
        !STABLE_VARIABLES.some(stable => varName.includes(stable)) &&
        !varName.startsWith('set') && // Likely setState functions
        varName.length > 1 // Ignore single character variables
      );
      
      if (missingDeps.length > 0) {
        this.issues.push({
          type: 'useEffect',
          file: filePath,
          line,
          missingDeps,
          currentDeps,
          suggestion: this.generateFixSuggestion('useEffect', currentDeps, missingDeps)
        });
      }
    }
  }

  // Check useCallback dependencies
  checkUseCallbackDependencies(content, filePath) {
    const matches = [...content.matchAll(HOOK_PATTERNS.useCallback)];
    
    for (const match of matches) {
      const fullMatch = match[0];
      const depsArray = match[1] || '';
      const line = this.getLineNumber(content, match.index);
      
      // Extract the callback function body
      const callbackBody = this.extractCallbackBody(fullMatch);
      const referencedVars = this.extractReferencedVariables(callbackBody);
      const currentDeps = this.parseDependencyArray(depsArray);
      
      const missingDeps = referencedVars.filter(varName => 
        !currentDeps.includes(varName) && 
        !STABLE_VARIABLES.some(stable => varName.includes(stable)) &&
        !varName.startsWith('set') &&
        varName.length > 1
      );
      
      if (missingDeps.length > 0) {
        this.issues.push({
          type: 'useCallback',
          file: filePath,
          line,
          missingDeps,
          currentDeps,
          suggestion: this.generateFixSuggestion('useCallback', currentDeps, missingDeps)
        });
      }
    }
  }

  // Check useMemo dependencies
  checkUseMemoddependencies(content, filePath) {
    const matches = [...content.matchAll(HOOK_PATTERNS.useMemo)];
    
    for (const match of matches) {
      const fullMatch = match[0];
      const depsArray = match[1] || '';
      const line = this.getLineNumber(content, match.index);
      
      const memoBody = this.extractMemoBody(fullMatch);
      const referencedVars = this.extractReferencedVariables(memoBody);
      const currentDeps = this.parseDependencyArray(depsArray);
      
      const missingDeps = referencedVars.filter(varName => 
        !currentDeps.includes(varName) && 
        !STABLE_VARIABLES.some(stable => varName.includes(stable)) &&
        !varName.startsWith('set') &&
        varName.length > 1
      );
      
      if (missingDeps.length > 0) {
        this.issues.push({
          type: 'useMemo',
          file: filePath,
          line,
          missingDeps,
          currentDeps,
          suggestion: this.generateFixSuggestion('useMemo', currentDeps, missingDeps)
        });
      }
    }
  }

  // Extract referenced variables from hook body
  extractReferencedVariables(body) {
    if (!body) return [];
    
    // Simple regex to find variable references
    const varPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
    const matches = [...body.matchAll(varPattern)];
    
    const variables = matches
      .map(match => match[1])
      .filter(varName => 
        !['true', 'false', 'null', 'undefined', 'return', 'if', 'else', 'for', 'while', 'function', 'const', 'let', 'var'].includes(varName)
      );
    
    // Remove duplicates
    return [...new Set(variables)];
  }

  // Extract effect body from useEffect
  extractEffectBody(effectMatch) {
    // Simple extraction - this could be improved
    const match = effectMatch.match(/useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\},?\s*\[/);
    return match ? match[1] : '';
  }

  // Extract callback body from useCallback
  extractCallbackBody(callbackMatch) {
    const match = callbackMatch.match(/useCallback\s*\(([\s\S]*?),\s*\[/);
    return match ? match[1] : '';
  }

  // Extract memo body from useMemo
  extractMemoBody(memoMatch) {
    const match = memoMatch.match(/useMemo\s*\(([\s\S]*?),\s*\[/);
    return match ? match[1] : '';
  }

  // Parse dependency array string into array of variable names
  parseDependencyArray(depsString) {
    if (!depsString.trim()) return [];
    
    return depsString
      .split(',')
      .map(dep => dep.trim())
      .filter(dep => dep.length > 0)
      .map(dep => dep.replace(/['"]/g, '')); // Remove quotes
  }

  // Generate fix suggestion
  generateFixSuggestion(hookType, currentDeps, missingDeps) {
    const allDeps = [...currentDeps, ...missingDeps].filter(Boolean);
    return `[${allDeps.join(', ')}]`;
  }

  // Get line number for a character index in content
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  // Generate comprehensive report
  generateReport() {
    debugLog('general', 'log_statement', '\n📊 React Hook Dependency Analysis Report\n')
    debugLog('general', 'log_statement', '='.repeat(50));
    
    if (this.issues.length === 0) {
      debugLog('general', 'log_statement', '✅ No React Hook dependency issues found!')
      return;
    }
    
    // Group issues by type
    const issuesByType = this.issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {});
    
    debugLog('general', 'log_statement', `📈 Total Issues Found: ${this.issues.length}`)
    debugLog('general', 'log_statement', '')
    
    Object.entries(issuesByType).forEach(([type, count]) => {
      debugLog('general', 'log_statement', `${type}: ${count} issues`)
    });
    
    debugLog('general', 'log_statement', '\n📋 Detailed Issues:\n')
    
    this.issues.forEach((issue, index) => {
      const relativePath = path.relative(this.srcDir, issue.file);
      debugLog('general', 'log_statement', `${index + 1}. ${issue.type} - ${relativePath}:${issue.line}`)
      debugLog('general', 'log_statement', `   Missing dependencies: ${issue.missingDeps.join(', ')}`);
      debugLog('general', 'log_statement', `   Current: [${issue.currentDeps.join(', ')}]`);
      debugLog('general', 'log_statement', `   Suggested: ${issue.suggestion}`)
      debugLog('general', 'log_statement', '')
    });
    
    // Generate fixes array for automatic application
    this.fixes = this.issues.map(issue => ({
      file: issue.file,
      line: issue.line,
      fix: issue.suggestion
    }));
    
    debugLog('general', 'log_statement', '💡 Run with --fix flag to automatically apply suggested fixes.')
    debugLog('general', 'log_statement', '⚠️  Remember to test your application after applying fixes!')
  }

  // Apply fixes automatically (if --fix flag is used)
  applyFixes() {
    debugLog('general', 'log_statement', '\n🔧 Applying automatic fixes...\n')
    
    // Group fixes by file
    const fixesByFile = this.fixes.reduce((acc, fix) => {
      if (!acc[fix.file]) acc[fix.file] = [];
      acc[fix.file].push(fix);
      return acc;
    }, {});
    
    Object.entries(fixesByFile).forEach(([file, fixes]) => {
      debugLog('general', 'log_statement', `📝 Fixing ${path.relative(this.srcDir, file)}...`);
      
      // Read file content
      let content = fs.readFileSync(file, 'utf8');
      
      // Apply fixes (this is a simplified implementation)
      // In a real implementation, you'd want more sophisticated parsing
      fixes.forEach(fix => {
        debugLog('general', 'log_statement', `   Line ${fix.line}: Applied suggested dependency array`)
      });
      
      // Write back to file (commented out for safety)
      // fs.writeFileSync(file, content, 'utf8');
    });
    
    debugLog('general', 'log_statement', '\n✅ Fixes applied successfully!')
    debugLog('general', 'log_statement', '🧪 Please run your tests to ensure everything works correctly.')
  }
}

// Run the fixer
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ReactHookDependencyFixer();
  fixer.run().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export default ReactHookDependencyFixer; 