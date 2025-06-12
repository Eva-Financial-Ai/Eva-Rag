import { debugLog } from '../utils/auditLogger';

/**
 * EVA Coder Foundation - Basic Monitoring System
 * This is the foundation for the automated development assistant
 * Target: Full automation by September 2025
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EVACoderFoundation {
  constructor() {
    this.startTime = new Date();
    this.logFile = path.join(__dirname, 'eva-coder-log.json');
    this.progressFile = path.join(__dirname, 'progress-tracking.json');
    this.patterns = new Map();
    this.fixes = new Map();

    this.initializeLogging();
  }

  initializeLogging() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.log('EVA Coder Foundation initialized', 'info');
  }

  log(message, level = 'info', data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      sessionId: this.startTime.getTime(),
    };

    debugLog('general', 'log_statement', `[EVA-CODER ${level.toUpperCase()}] ${message}`);

    // Append to log file
    try {
      const existingLogs = this.readLogFile();
      existingLogs.push(logEntry);
      fs.writeFileSync(this.logFile, JSON.stringify(existingLogs, null, 2));
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  readLogFile() {
    try {
      if (fs.existsSync(this.logFile)) {
        return JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not read log file, starting fresh');
    }
    return [];
  }

  // Monitor test results
  async monitorTests() {
    this.log('Starting test monitoring', 'info');

    try {
      const testResult = execSync('npm test -- --coverage --watchAll=false --json', {
        encoding: 'utf8',
        timeout: 60000,
      });

      const results = JSON.parse(testResult);
      const summary = {
        numTotalTests: results.numTotalTests,
        numPassedTests: results.numPassedTests,
        numFailedTests: results.numFailedTests,
        numPendingTests: results.numPendingTests,
        coveragePercent: this.extractCoveragePercent(results),
        timestamp: new Date().toISOString(),
      };

      this.log('Test monitoring complete', 'info', summary);
      this.updateProgress('tests', summary);

      return summary;
    } catch (error) {
      this.log('Test monitoring failed', 'error', { error: error.message });
      return null;
    }
  }

  extractCoveragePercent(results) {
    try {
      if (results.coverageMap) {
        // Calculate average coverage across all metrics
        const coverage = results.coverageMap;
        let totalPercent = 0;
        let count = 0;

        Object.values(coverage).forEach(file => {
          if (file.s) {
            // statements
            const statements = Object.values(file.s);
            const covered = statements.filter(s => s > 0).length;
            totalPercent += (covered / statements.length) * 100;
            count++;
          }
        });

        return count > 0 ? Math.round(totalPercent / count) : 0;
      }
    } catch (error) {
      this.log('Could not extract coverage', 'warn', { error: error.message });
    }
    return 0;
  }

  // Monitor TypeScript compilation
  async monitorTypeScript() {
    this.log('Checking TypeScript compilation', 'info');

    try {
      execSync('npx tsc --noEmit', { encoding: 'utf8' });
      this.log('TypeScript compilation successful', 'info');
      this.updateProgress('typescript', { status: 'success', errors: 0 });
      return { success: true, errors: [] };
    } catch (error) {
      const errors = this.parseTypeScriptErrors(error.stdout || error.message);
      this.log('TypeScript compilation failed', 'error', { errorCount: errors.length });
      this.updateProgress('typescript', { status: 'failed', errors: errors.length });
      return { success: false, errors };
    }
  }

  parseTypeScriptErrors(output) {
    const lines = output.split('\n');
    const errors = [];

    lines.forEach(line => {
      if (line.includes('error TS')) {
        const match = line.match(/(.+\.tsx?)\((\d+),(\d+)\): error (TS\d+): (.+)/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            code: match[4],
            message: match[5],
          });
        }
      }
    });

    return errors;
  }

  // Monitor ESLint issues
  async monitorLinting() {
    this.log('Checking ESLint issues', 'info');

    try {
      const result = execSync('npx eslint src --format json', { encoding: 'utf8' });
      const lintResults = JSON.parse(result);

      let totalErrors = 0;
      let totalWarnings = 0;

      lintResults.forEach(file => {
        totalErrors += file.errorCount;
        totalWarnings += file.warningCount;
      });

      const summary = { errors: totalErrors, warnings: totalWarnings };
      this.log('Linting check complete', 'info', summary);
      this.updateProgress('linting', summary);

      return summary;
    } catch (error) {
      this.log('Linting check failed', 'error', { error: error.message });
      return { errors: -1, warnings: -1 };
    }
  }

  // Update progress tracking
  updateProgress(category, data) {
    try {
      let progress = {};
      if (fs.existsSync(this.progressFile)) {
        progress = JSON.parse(fs.readFileSync(this.progressFile, 'utf8'));
      }

      progress[category] = {
        ...data,
        lastUpdated: new Date().toISOString(),
      };

      fs.writeFileSync(this.progressFile, JSON.stringify(progress, null, 2));
    } catch (error) {
      this.log('Failed to update progress', 'error', { error: error.message });
    }
  }

  // Generate daily report
  async generateDailyReport() {
    this.log('Generating daily report', 'info');

    const testResults = await this.monitorTests();
    const tsResults = await this.monitorTypeScript();
    const lintResults = await this.monitorLinting();

    const report = {
      date: new Date().toISOString().split('T')[0],
      summary: {
        tests: testResults,
        typescript: tsResults,
        linting: lintResults,
      },
      recommendations: this.generateRecommendations(testResults, tsResults, lintResults),
      nextSteps: this.getNextSteps(),
    };

    const reportFile = path.join(__dirname, `daily-report-${report.date}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    this.log('Daily report generated', 'info', { file: reportFile });
    return report;
  }

  generateRecommendations(tests, typescript, linting) {
    const recommendations = [];

    if (tests && tests.numFailedTests > 0) {
      recommendations.push({
        priority: 'high',
        category: 'tests',
        message: `${tests.numFailedTests} tests are failing. Focus on fixing these first.`,
        action: 'Run npm test to see detailed failures',
      });
    }

    if (!typescript.success) {
      recommendations.push({
        priority: 'critical',
        category: 'typescript',
        message: `${typescript.errors.length} TypeScript errors prevent compilation.`,
        action: 'Fix TypeScript errors before proceeding',
      });
    }

    if (linting.errors > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'linting',
        message: `${linting.errors} ESLint errors found.`,
        action: 'Run npm run lint:fix to auto-fix some issues',
      });
    }

    if (tests && tests.coveragePercent < 80) {
      recommendations.push({
        priority: 'medium',
        category: 'coverage',
        message: `Test coverage is ${tests.coveragePercent}%. Target is 80%.`,
        action: 'Add tests for uncovered code paths',
      });
    }

    return recommendations;
  }

  getNextSteps() {
    return [
      'Complete Phase 1.1: Fix TypeScript syntax errors',
      'Complete Phase 1.2: Fix Jest parsing errors',
      'Complete Phase 2.1: Global test setup enhancement',
      'Complete Phase 2.2: Component test mocks',
      'Continue systematic debugging plan',
    ];
  }

  // Pattern learning (foundation for future AI)
  recordPattern(errorType, errorMessage, fixApplied, success) {
    const patternKey = `${errorType}:${errorMessage}`;

    if (!this.patterns.has(patternKey)) {
      this.patterns.set(patternKey, {
        errorType,
        errorMessage,
        fixes: [],
        successRate: 0,
        totalAttempts: 0,
      });
    }

    const pattern = this.patterns.get(patternKey);
    pattern.fixes.push({ fix: fixApplied, success, timestamp: new Date().toISOString() });
    pattern.totalAttempts++;

    const successfulFixes = pattern.fixes.filter(f => f.success).length;
    pattern.successRate = (successfulFixes / pattern.totalAttempts) * 100;

    this.log('Pattern recorded', 'debug', { patternKey, successRate: pattern.successRate });
  }

  // Get health status
  getHealthStatus() {
    try {
      const progress = JSON.parse(fs.readFileSync(this.progressFile, 'utf8'));

      const health = {
        overall: 'unknown',
        tests: progress.tests?.numFailedTests === 0 ? 'good' : 'needs-attention',
        typescript: progress.typescript?.status === 'success' ? 'good' : 'critical',
        linting: progress.linting?.errors === 0 ? 'good' : 'needs-attention',
        lastCheck: new Date().toISOString(),
      };

      // Determine overall health
      if (health.typescript === 'critical') {
        health.overall = 'critical';
      } else if (health.tests === 'needs-attention' || health.linting === 'needs-attention') {
        health.overall = 'needs-attention';
      } else {
        health.overall = 'good';
      }

      return health;
    } catch (error) {
      return { overall: 'unknown', error: error.message };
    }
  }
}

// CLI interface
if (require.main === module) {
  const eva = new EVACoderFoundation();

  const command = process.argv[2];

  switch (command) {
    case 'monitor':
      eva.generateDailyReport().then(report => {
        debugLog('general', 'log_statement', '\n=== EVA CODER DAILY REPORT ===')
        debugLog('general', 'log_statement', `Date: ${report.date}`)
        debugLog('general', 'log_statement', 
          `Tests: ${report.summary.tests?.numPassedTests || 0} passed, ${report.summary.tests?.numFailedTests || 0} failed`
        )
        debugLog('general', 'log_statement', `TypeScript: ${report.summary.typescript?.success ? 'OK' : 'ERRORS'}`)
        debugLog('general', 'log_statement', 
          `Linting: ${report.summary.linting?.errors || 0} errors, ${report.summary.linting?.warnings || 0} warnings`
        )

        if (report.recommendations.length > 0) {
          debugLog('general', 'log_statement', '\n=== RECOMMENDATIONS ===')
          report.recommendations.forEach(rec => {
            debugLog('general', 'log_statement', `[${rec.priority.toUpperCase()}] ${rec.message}`);
            debugLog('general', 'log_statement', `  Action: ${rec.action}`)
          });
        }

        debugLog('general', 'log_statement', '\n=== NEXT STEPS ===')
        report.nextSteps.forEach((step, i) => {
          debugLog('general', 'log_statement', `${i + 1}. ${step}`)
        });
      });
      break;

    case 'health':
      const health = eva.getHealthStatus();
      debugLog('general', 'log_statement', '\n=== SYSTEM HEALTH ===')
      debugLog('general', 'log_statement', `Overall: ${health.overall.toUpperCase()}`);
      debugLog('general', 'log_statement', `Tests: ${health.tests}`)
      debugLog('general', 'log_statement', `TypeScript: ${health.typescript}`)
      debugLog('general', 'log_statement', `Linting: ${health.linting}`)
      break;

    case 'tests':
      eva.monitorTests();
      break;

    case 'typescript':
      eva.monitorTypeScript();
      break;

    case 'lint':
      eva.monitorLinting();
      break;

    default:
      debugLog('general', 'log_statement', 'EVA Coder Foundation - Basic Monitoring System')
      debugLog('general', 'log_statement', 'Usage:')
      debugLog('general', 'log_statement', '  node eva-coder-foundation.js monitor   - Generate daily report')
      debugLog('general', 'log_statement', '  node eva-coder-foundation.js health    - Check system health')
      debugLog('general', 'log_statement', '  node eva-coder-foundation.js tests     - Monitor test results')
      debugLog('general', 'log_statement', '  node eva-coder-foundation.js typescript - Check TypeScript')
      debugLog('general', 'log_statement', '  node eva-coder-foundation.js lint      - Check linting')
  }
}

module.exports = EVACoderFoundation;
