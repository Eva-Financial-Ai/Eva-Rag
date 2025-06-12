import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

debugLog('general', 'log_statement', '🚀 Running Pre-Deployment Checks...\n')

const checks = {
  passed: [],
  failed: [],
  warnings: [],
};

// Helper function to run commands
function runCommand(command, description, critical = true) {
  debugLog('general', 'log_statement', `📋 ${description}...`)
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    checks.passed.push({ description, output: output.trim() });
    debugLog('general', 'log_statement', '✅ Passed\n')
    return true;
  } catch (error) {
    if (critical) {
      checks.failed.push({ description, error: error.message });
      debugLog('general', 'log_statement', '❌ Failed\n')
    } else {
      checks.warnings.push({ description, error: error.message });
      debugLog('general', 'log_statement', '⚠️  Warning\n')
    }
    return false;
  }
}

// 1. Check Node version
debugLog('general', 'log_statement', '1️⃣  Environment Checks\n')
runCommand('node --version', 'Node.js version check');

// 2. Install dependencies
debugLog('general', 'log_statement', '2️⃣  Dependency Checks\n')
runCommand('npm ls --depth=0', 'Check for missing dependencies', false);

// 3. TypeScript compilation
debugLog('general', 'log_statement', '3️⃣  TypeScript Compilation\n')
runCommand('npx tsc --noEmit', 'TypeScript type checking');

// 4. ESLint
debugLog('general', 'log_statement', '4️⃣  Code Quality Checks\n')
runCommand('npm run lint', 'ESLint code quality check');

// 5. Run tests
debugLog('general', 'log_statement', '5️⃣  Test Suite\n')
runCommand('npm test -- --coverage --watchAll=false', 'Unit tests with coverage');

// 6. Check test coverage
debugLog('general', 'log_statement', '6️⃣  Test Coverage Analysis\n')
const coverageFile = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
if (fs.existsSync(coverageFile)) {
  const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
  const metrics = coverage.total;

  debugLog('general', 'log_statement', '📊 Coverage Report:')
  debugLog('general', 'log_statement', `   Lines: ${metrics.lines.pct}%`)
  debugLog('general', 'log_statement', `   Statements: ${metrics.statements.pct}%`)
  debugLog('general', 'log_statement', `   Functions: ${metrics.functions.pct}%`)
  debugLog('general', 'log_statement', `   Branches: ${metrics.branches.pct}%\n`)

  // Check if coverage meets minimum requirements
  const minCoverage = 70;
  if (metrics.lines.pct < minCoverage) {
    checks.warnings.push({
      description: 'Test coverage',
      error: `Line coverage ${metrics.lines.pct}% is below ${minCoverage}%`,
    });
  } else {
    checks.passed.push({
      description: 'Test coverage',
      output: `All metrics above ${minCoverage}%`,
    });
  }
}

// 7. Build check
debugLog('general', 'log_statement', '7️⃣  Production Build\n')
runCommand('npm run build', 'Production build');

// 8. Bundle size check
debugLog('general', 'log_statement', '8️⃣  Bundle Size Analysis\n')
const buildDir = path.join(__dirname, '..', 'build', 'static', 'js');
if (fs.existsSync(buildDir)) {
  const files = fs.readdirSync(buildDir);
  const mainBundle = files.find(f => f.startsWith('main.') && f.endsWith('.js'));

  if (mainBundle) {
    const stats = fs.statSync(path.join(buildDir, mainBundle));
    const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
    debugLog('general', 'log_statement', `   Main bundle size: ${sizeInMB} MB`)

    const maxSize = 5; // 5MB max
    if (parseFloat(sizeInMB) > maxSize) {
      checks.warnings.push({
        description: 'Bundle size',
        error: `Main bundle ${sizeInMB}MB exceeds ${maxSize}MB limit`,
      });
    } else {
      checks.passed.push({
        description: 'Bundle size',
        output: `${sizeInMB}MB is within limits`,
      });
    }
  }
}

// 9. Security audit
debugLog('general', 'log_statement', '9️⃣  Security Audit\n')
runCommand('npm audit --production', 'Security vulnerability check', false);

// 10. Check for console.logs in production code
debugLog('general', 'log_statement', '🔟 Production Code Checks\n')
const srcDir = path.join(__dirname, '..', 'src');
const consoleLogCheck = execSync(
  `grep -r "console\\.log" ${srcDir} --include="*.tsx" --include="*.ts" | wc -l`,
  { encoding: 'utf8' }
).trim();

if (parseInt(consoleLogCheck) > 0) {
  checks.warnings.push({
    description: 'Console.log statements',
    error: `Found ${consoleLogCheck} console.log statements in source code`,
  });
  debugLog('general', 'log_statement', `⚠️  Found ${consoleLogCheck} console.log statements\n`)
} else {
  checks.passed.push({
    description: 'Console.log check',
    output: 'No console.log statements found',
  });
  debugLog('general', 'log_statement', '✅ No console.log statements found\n')
}

// 11. Check environment variables
debugLog('general', 'log_statement', '1️⃣1️⃣ Environment Configuration\n')
const requiredEnvVars = [
  'REACT_APP_API_URL',
  'REACT_APP_AUTH0_DOMAIN',
  'REACT_APP_AUTH0_CLIENT_ID',
  'REACT_APP_PLAID_PUBLIC_KEY',
];

const envFile = path.join(__dirname, '..', '.env.production');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const missingVars = requiredEnvVars.filter(v => !envContent.includes(v));

  if (missingVars.length > 0) {
    checks.failed.push({
      description: 'Environment variables',
      error: `Missing required variables: ${missingVars.join(', ')}`,
    });
    debugLog('general', 'log_statement', '❌ Missing environment variables\n')
  } else {
    checks.passed.push({
      description: 'Environment variables',
      output: 'All required variables present',
    });
    debugLog('general', 'log_statement', '✅ All environment variables configured\n')
  }
} else {
  checks.warnings.push({
    description: 'Environment file',
    error: '.env.production file not found',
  });
  debugLog('general', 'log_statement', '⚠️  .env.production file not found\n')
}

// 12. Check for TODO comments
debugLog('general', 'log_statement', '1️⃣2️⃣ TODO Comments Check\n')
const todoCheck = execSync(
  `grep -r "TODO\\|FIXME\\|HACK" ${srcDir} --include="*.tsx" --include="*.ts" | wc -l`,
  { encoding: 'utf8' }
).trim();

if (parseInt(todoCheck) > 0) {
  checks.warnings.push({
    description: 'TODO/FIXME comments',
    error: `Found ${todoCheck} TODO/FIXME/HACK comments`,
  });
  debugLog('general', 'log_statement', `⚠️  Found ${todoCheck} TODO/FIXME/HACK comments\n`)
} else {
  debugLog('general', 'log_statement', '✅ No TODO/FIXME/HACK comments found\n')
}

// Summary Report
debugLog('general', 'log_statement', '\n' + '='.repeat(60));
debugLog('general', 'log_statement', '📊 PRE-DEPLOYMENT CHECK SUMMARY')
debugLog('general', 'log_statement', '='.repeat(60) + '\n');

debugLog('general', 'log_statement', `✅ Passed: ${checks.passed.length}`)
debugLog('general', 'log_statement', `❌ Failed: ${checks.failed.length}`)
debugLog('general', 'log_statement', `⚠️  Warnings: ${checks.warnings.length}\n`)

if (checks.failed.length > 0) {
  debugLog('general', 'log_statement', '❌ FAILED CHECKS:')
  checks.failed.forEach(check => {
    debugLog('general', 'log_statement', `   - ${check.description}: ${check.error}`)
  });
  debugLog('general', 'log_statement', '')
}

if (checks.warnings.length > 0) {
  debugLog('general', 'log_statement', '⚠️  WARNINGS:')
  checks.warnings.forEach(check => {
    debugLog('general', 'log_statement', `   - ${check.description}: ${check.error}`)
  });
  debugLog('general', 'log_statement', '')
}

// Generate report file
const reportPath = path.join(__dirname, '..', 'pre-deployment-report.json');
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    passed: checks.passed.length,
    failed: checks.failed.length,
    warnings: checks.warnings.length,
  },
  details: checks,
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
debugLog('general', 'log_statement', `📄 Detailed report saved to: ${reportPath}\n`)

// Exit with appropriate code
if (checks.failed.length > 0) {
  debugLog('general', 'log_statement', '❌ DEPLOYMENT BLOCKED: Fix failed checks before deploying\n')
  process.exit(1);
} else if (checks.warnings.length > 0) {
  debugLog('general', 'log_statement', '⚠️  DEPLOYMENT ALLOWED: But please review warnings\n')
  process.exit(0);
} else {
  debugLog('general', 'log_statement', '✅ ALL CHECKS PASSED: Ready for deployment!\n')
  process.exit(0);
}
