#!/usr/bin/env node

/**
 * Quick Syntax Error Fixer
 * Fixes common syntax errors introduced by automated transformations
 */

const fs = require('fs');
const path = require('path');

// Files with known syntax errors
const FILES_TO_FIX = [
  'src/components/AIChatAdvisor.tsx',
  'src/components/CreditAnalysisChatInterface.tsx',
  'src/components/IntelligentDataOrchestrator.tsx',
  'src/components/communications/ChatWidget.tsx',
  'src/components/communications/VideoConferencing.tsx',
  'src/components/credit/AutoOriginationsDashboard.tsx',
  'src/utils/clientSideSecurity.ts',
];

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function fixSyntaxErrors(content) {
  let fixed = content;
  let fixCount = 0;

  // Fix malformed destructuring parameters like (_{ _children, _...props })
  const malformedDestructurePattern = /\(_\{\s*_([^,}]+),?\s*_\.\.\.([^}]+)\s*\}\)/g;
  fixed = fixed.replace(malformedDestructurePattern, (match, firstParam, restParam) => {
    fixCount++;
    return `({ ${firstParam}, ...${restParam} })`;
  });

  // Fix malformed arrow function parameters like (_param) =>
  const malformedParamPattern = /\(_([^)]+)\)\s*=>/g;
  fixed = fixed.replace(malformedParamPattern, (match, param) => {
    fixCount++;
    return `(${param}) =>`;
  });

  // Fix malformed function calls with extra underscores
  const malformedCallPattern = /_([a-zA-Z][a-zA-Z0-9]*)\(/g;
  fixed = fixed.replace(malformedCallPattern, (match, funcName) => {
    // Only fix if it's clearly a function call, not a variable
    if (funcName.includes('Log') || funcName.includes('Error') || funcName.includes('Process')) {
      fixCount++;
      return `${funcName}(`;
    }
    return match;
  });

  // Fix malformed variable names with leading underscores that shouldn't have them
  const malformedVarPattern = /const\s+_([a-zA-Z][a-zA-Z0-9]*)\s*=/g;
  fixed = fixed.replace(malformedVarPattern, (match, varName) => {
    // Only fix if it's not intentionally prefixed
    if (!varName.startsWith('_')) {
      fixCount++;
      return `const ${varName} =`;
    }
    return match;
  });

  return { fixed, fixCount };
}

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`, 'error');
    return;
  }

  const originalContent = fs.readFileSync(filePath, 'utf8');
  const { fixed, fixCount } = fixSyntaxErrors(originalContent);

  if (fixCount > 0) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    log(`Fixed ${fixCount} syntax errors in ${filePath}`, 'success');
  } else {
    log(`No syntax errors found in ${filePath}`, 'info');
  }
}

function main() {
  log('🔧 Starting Syntax Error Fixer');

  FILES_TO_FIX.forEach(filePath => {
    try {
      processFile(filePath);
    } catch (error) {
      log(`Error processing ${filePath}: ${error.message}`, 'error');
    }
  });

  log('✅ Syntax error fixing completed');
}

if (require.main === module) {
  main();
}

module.exports = { fixSyntaxErrors, processFile };
