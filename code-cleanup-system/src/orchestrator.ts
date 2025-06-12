import { DuplicateDetector } from './analysis/duplicate-detector';
import { TestFramework } from './testing/test-framework';
import { SafeRemover } from './removal/safe-remover';
import { PerformanceMonitor } from './monitoring/performance-monitor';
import { ReportGenerator } from './reporting/report-generator';
import * as fs from 'fs';
import * as path from 'path';

import { debugLog } from '../utils/auditLogger';

export class CleanupOrchestrator {
  private duplicateDetector: DuplicateDetector;
  private testFramework: TestFramework;
  private safeRemover: SafeRemover;
  private performanceMonitor: PerformanceMonitor;
  private reportGenerator: ReportGenerator;

  constructor(private projectRoot: string) {
    this.duplicateDetector = new DuplicateDetector(projectRoot);
    this.testFramework = new TestFramework(projectRoot);
    this.safeRemover = new SafeRemover(projectRoot);
    this.performanceMonitor = new PerformanceMonitor(projectRoot);
    this.reportGenerator = new ReportGenerator(projectRoot);
  }

  /**
   * Run the complete cleanup process
   */
  async runCleanup(
    options: {
      dryRun?: boolean;
      maxRisk?: 'low' | 'medium' | 'high';
      targetTypes?: Array<'duplicate' | 'dead-code' | 'unused-import' | 'unused-component'>;
      interactive?: boolean;
    } = {}
  ): Promise<void> {
    debugLog('general', 'log_statement', '🚀 Starting Automated Code Cleanup System')
    debugLog('general', 'log_statement', '=====================================\n')

    try {
      // Phase 1: Setup
      debugLog('general', 'log_statement', '📋 Phase 1: Setup and Validation')
      await this.setupPhase();

      // Phase 2: Analysis
      debugLog('general', 'log_statement', '\n🔍 Phase 2: Code Analysis')
      const analysisResults = await this.analysisPhase();

      // Phase 3: Test Preparation
      debugLog('general', 'log_statement', '\n🧪 Phase 3: Test Preparation')
      await this.testPreparationPhase();

      // Phase 4: Performance Baseline
      debugLog('general', 'log_statement', '\n📊 Phase 4: Performance Baseline')
      const baselineMetrics = await this.performanceBaselinePhase();

      // Phase 5: Safe Removal
      if (!options.dryRun) {
        debugLog('general', 'log_statement', '\n🔧 Phase 5: Safe Code Removal')
        const removalResults = await this.removalPhase(analysisResults, options);

        // Phase 6: Validation
        debugLog('general', 'log_statement', '\n✅ Phase 6: Post-Removal Validation')
        await this.validationPhase(baselineMetrics);

        // Phase 7: Reporting
        debugLog('general', 'log_statement', '\n📈 Phase 7: Final Report Generation')
        await this.reportingPhase(analysisResults, removalResults, baselineMetrics);
      } else {
        debugLog('general', 'log_statement', '\n📈 Dry Run Report')
        await this.generateDryRunReport(analysisResults);
      }

      debugLog('general', 'log_statement', '\n✨ Cleanup process completed successfully!')
    } catch (error) {
      console.error('\n❌ Cleanup process failed:', error);
      throw error;
    }
  }

  /**
   * Setup phase - ensure environment is ready
   */
  private async setupPhase(): Promise<void> {
    // Check Git status
    const gitStatus = this.checkGitStatus();
    if (!gitStatus.clean) {
      throw new Error('Git working directory is not clean. Please commit or stash changes.');
    }

    // Ensure on main/master branch
    if (!['main', 'master'].includes(gitStatus.branch)) {
      console.warn(`⚠️ Not on main branch (current: ${gitStatus.branch})`);
    }

    // Check Node modules
    if (!fs.existsSync(path.join(this.projectRoot, 'node_modules'))) {
      debugLog('general', 'log_statement', '📦 Installing dependencies...')
      await this.runCommand('npm install');
    }

    // Create necessary directories
    const dirs = ['.cleanup-backups', 'cleanup-reports', 'coverage'];

    for (const dir of dirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }

    debugLog('general', 'log_statement', '✅ Setup complete')
  }

  /**
   * Analysis phase - find all issues
   */
  private async analysisPhase(): Promise<any> {
    const results = await this.duplicateDetector.analyze();

    debugLog('general', 'log_statement', `\n📊 Analysis Results:`)
    debugLog('general', 'log_statement', `  - Duplicate code blocks: ${results.duplicates.length}`)
    debugLog('general', 'log_statement', `  - Dead code instances: ${results.deadCode.length}`)
    debugLog('general', 'log_statement', `  - Redundant imports: ${results.redundantImports.size}`)
    debugLog('general', 'log_statement', `  - Unused components: ${results.unusedComponents.length}`)
    debugLog('general', 'log_statement', `  - Potential savings: ${results.metrics.estimatedSavings.lines} lines`)

    return results;
  }

  /**
   * Test preparation phase
   */
  private async testPreparationPhase(): Promise<void> {
    await this.testFramework.setupTests();

    const testResult = await this.testFramework.runTests();
    if (!testResult.passed) {
      throw new Error('Tests are failing. Fix tests before proceeding with cleanup.');
    }

    debugLog('general', 'log_statement', `✅ Tests passing with ${testResult.coverage.lines}% coverage`)
  }

  /**
   * Performance baseline phase
   */
  private async performanceBaselinePhase(): Promise<any> {
    const metrics = await this.performanceMonitor.measure();
    this.performanceMonitor.setBaseline(metrics);

    debugLog('general', 'log_statement', '✅ Performance baseline captured')
    return metrics;
  }

  /**
   * Removal phase
   */
  private async removalPhase(analysisResults: any, options: any): Promise<any> {
    // Convert analysis results to removal candidates
    const candidates = this.convertToRemovalCandidates(analysisResults, options);

    debugLog('general', 'log_statement', `\n🎯 Found ${candidates.length} removal candidates`)

    if (options.interactive) {
      // Interactive mode - let user choose what to remove
      const selected = await this.interactiveSelection(candidates);
      return await this.safeRemover.executeRemoval(selected);
    } else {
      // Automatic mode - remove based on risk threshold
      return await this.safeRemover.executeRemoval(candidates);
    }
  }

  /**
   * Validation phase
   */
  private async validationPhase(_baselineMetrics: any): Promise<void> {
    const currentMetrics = await this.performanceMonitor.measure();
    const comparison = this.performanceMonitor.compareWithBaseline(currentMetrics);

    if (!comparison.improved) {
      console.warn('⚠️ Performance regression detected!');
      debugLog('general', 'log_statement', comparison.summary)
    } else {
      debugLog('general', 'log_statement', '✅ Performance improved or maintained')
      debugLog('general', 'log_statement', comparison.summary)
    }
  }

  /**
   * Reporting phase
   */
  private async reportingPhase(
    analysisResults: any,
    removalResults: any,
    baselineMetrics: any
  ): Promise<void> {
    const report = await this.reportGenerator.generateFullReport({
      analysis: analysisResults,
      removals: removalResults,
      baseline: baselineMetrics,
      current: await this.performanceMonitor.measure(),
    });

    const reportPath = path.join(
      this.projectRoot,
      'cleanup-reports',
      `cleanup-report-${new Date().toISOString().split('T')[0]}.html`
    );

    fs.writeFileSync(reportPath, report);
    debugLog('general', 'log_statement', `📄 Report saved to: ${reportPath}`)
  }

  /**
   * Helper methods
   */
  private checkGitStatus(): { clean: boolean; branch: string } {
    try {
      const { execSync } = require('child_process');
      const status = execSync('git status --porcelain', { encoding: 'utf-8' });
      const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();

      return {
        clean: status.trim() === '',
        branch,
      };
    } catch {
      return { clean: false, branch: 'unknown' };
    }
  }

  private async runCommand(command: string): Promise<void> {
    const { execSync } = require('child_process');
    execSync(command, { cwd: this.projectRoot, stdio: 'inherit' });
  }

  private convertToRemovalCandidates(analysisResults: any, options: any): any[] {
    const candidates: any[] = [];

    // Convert duplicates
    if (!options.targetTypes || options.targetTypes.includes('duplicate')) {
      for (const dup of analysisResults.duplicates) {
        if (this.matchesRiskThreshold(dup.risk, options.maxRisk)) {
          candidates.push({
            id: `dup-${dup.hash}`,
            files: dup.blocks.map((b: any) => b.file),
            lines: dup.blocks.map((b: any) => [b.startLine, b.endLine]),
            type: 'duplicate',
            risk: dup.risk,
            estimatedSavings: dup.potentialSavings,
          });
        }
      }
    }

    // Add other types...

    return candidates;
  }

  private matchesRiskThreshold(
    risk: 'low' | 'medium' | 'high',
    maxRisk?: 'low' | 'medium' | 'high'
  ): boolean {
    if (!maxRisk) return true;

    const riskLevels = { low: 1, medium: 2, high: 3 };
    return riskLevels[risk] <= riskLevels[maxRisk];
  }

  private async interactiveSelection(candidates: any[]): Promise<any[]> {
    // In a real implementation, this would show an interactive CLI menu
    // For now, return all candidates
    return candidates;
  }

  private async generateDryRunReport(analysisResults: any): Promise<void> {
    debugLog('general', 'log_statement', '\n📋 Dry Run Report')
    debugLog('general', 'log_statement', '================')
    debugLog('general', 'log_statement', '\nWhat would be removed:')

    for (const dup of analysisResults.duplicates) {
      debugLog('general', 'log_statement', `\n- ${dup.blocks.length} duplicate blocks (${dup.similarity}% similar)`);
      debugLog('general', 'log_statement', `  Risk: ${dup.risk}`)
      debugLog('general', 'log_statement', `  Savings: ${dup.potentialSavings.lines} lines`)
      debugLog('general', 'log_statement', `  Files affected:`)
      for (const block of dup.blocks) {
        debugLog('general', 'log_statement', `    - ${block.file}:${block.startLine}-${block.endLine}`)
      }
    }
  }
}
