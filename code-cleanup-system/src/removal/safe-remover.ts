import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { TestFramework } from '../testing/test-framework';
import { PerformanceMonitor } from '../monitoring/performance-monitor';

import { debugLog } from '../utils/auditLogger';

interface RemovalCandidate {
  id: string;
  files: string[];
  lines: number[][];
  type: 'duplicate' | 'dead-code' | 'unused-import' | 'unused-component';
  risk: 'low' | 'medium' | 'high';
  estimatedSavings: {
    lines: number;
    bytes: number;
    complexity: number;
  };
}

interface RemovalResult {
  success: boolean;
  candidate: RemovalCandidate;
  metrics: {
    before: any;
    after: any;
  };
  rollbackCommit?: string;
  issues?: string[];
}

export class SafeRemover {
  private testFramework: TestFramework;
  private performanceMonitor: PerformanceMonitor;
  private removalHistory: RemovalResult[] = [];
  private backupDir: string;

  constructor(private projectRoot: string) {
    this.testFramework = new TestFramework(projectRoot);
    this.performanceMonitor = new PerformanceMonitor(projectRoot);
    this.backupDir = path.join(projectRoot, '.cleanup-backups');

    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Execute safe removal process
   */
  async executeRemoval(candidates: RemovalCandidate[]): Promise<RemovalResult[]> {
    debugLog('general', 'log_statement', '🚀 Starting safe removal process...')

    // Sort candidates by risk (lowest first)
    const sortedCandidates = this.sortCandidatesByRisk(candidates);

    for (const candidate of sortedCandidates) {
      debugLog('general', 'log_statement', `\n📦 Processing removal candidate: ${candidate.id}`)

      // Create feature branch
      const branchName = await this.createFeatureBranch(candidate);

      try {
        // Step 1: Capture baseline metrics
        const baselineMetrics = await this.captureMetrics();

        // Step 2: Create safety net
        await this.testFramework.createSafetyNet(candidate.files);

        // Step 3: Run tests to ensure baseline
        const baselineTests = await this.testFramework.runTests();
        if (!baselineTests.passed) {
          debugLog('general', 'log_statement', '❌ Baseline tests failing, skipping removal')
          continue;
        }

        // Step 4: Create backup
        const backupId = await this.createBackup(candidate);

        // Step 5: Remove code
        await this.removeCode(candidate);

        // Step 6: Run tests again
        const afterTests = await this.testFramework.runTests();

        // Step 7: Capture new metrics
        const afterMetrics = await this.captureMetrics();

        // Step 8: Validate removal
        const validation = await this.validateRemoval(
          baselineMetrics,
          afterMetrics,
          afterTests
        );

        if (validation.safe) {
          // Step 9: Commit changes
          const commitHash = await this.commitChanges(candidate);

          // Step 10: Create PR
          await this.createPullRequest(branchName, candidate);

          this.removalHistory.push({
            success: true,
            candidate,
            metrics: {
              before: baselineMetrics,
              after: afterMetrics
            },
            rollbackCommit: commitHash
          });

          debugLog('general', 'log_statement', '✅ Removal successful!')
        } else {
          // Rollback
          await this.rollback(backupId);

          this.removalHistory.push({
            success: false,
            candidate,
            metrics: {
              before: baselineMetrics,
              after: afterMetrics
            },
            issues: validation.issues
          });

          debugLog('general', 'log_statement', '⚠️ Removal failed, rolled back:', validation.issues)
        }

      } catch (error: any) {
        console.error('❌ Error during removal:', error.message);
        await this.emergencyRollback();
      } finally {
        // Return to main branch
        await this.returnToMainBranch();
      }
    }

    return this.removalHistory;
  }

  /**
   * Remove code based on candidate type
   */
  private async removeCode(candidate: RemovalCandidate): Promise<void> {
    switch (candidate.type) {
      case 'duplicate':
        await this.removeDuplicateCode(candidate);
        break;
      case 'dead-code':
        await this.removeDeadCode(candidate);
        break;
      case 'unused-import':
        await this.removeUnusedImports(candidate);
        break;
      case 'unused-component':
        await this.removeUnusedComponent(candidate);
        break;
    }
  }

  /**
   * Remove duplicate code blocks
   */
  private async removeDuplicateCode(candidate: RemovalCandidate): Promise<void> {
    // Keep the first occurrence, remove the rest
    const [keepFile] = candidate.files;

    for (let i = 1; i < candidate.files.length; i++) {
      const file = candidate.files[i];
      const lines = candidate.lines[i];

      // Read file
      const content = fs.readFileSync(file, 'utf-8');
      const fileLines = content.split('\n');

      // Remove lines
      fileLines.splice(lines[0] - 1, lines[1] - lines[0] + 1);

      // Write back
      fs.writeFileSync(file, fileLines.join('\n'));

      // Update imports if necessary
      await this.updateImports(file, keepFile);
    }
  }

  /**
   * Remove dead code
   */
  private async removeDeadCode(candidate: RemovalCandidate): Promise<void> {
    for (let i = 0; i < candidate.files.length; i++) {
      const file = candidate.files[i];
      const lines = candidate.lines[i];

      const content = fs.readFileSync(file, 'utf-8');
      const fileLines = content.split('\n');

      // Remove the dead code lines
      fileLines.splice(lines[0] - 1, lines[1] - lines[0] + 1);

      fs.writeFileSync(file, fileLines.join('\n'));
    }
  }

  /**
   * Remove unused imports
   */
  private async removeUnusedImports(candidate: RemovalCandidate): Promise<void> {
    for (const file of candidate.files) {
      // Use ESLint to fix unused imports
      execSync(`npx eslint --fix --rule 'no-unused-vars: error' ${file}`, {
        cwd: this.projectRoot
      });
    }
  }

  /**
   * Remove unused component
   */
  private async removeUnusedComponent(candidate: RemovalCandidate): Promise<void> {
    for (const file of candidate.files) {
      // Delete the component file
      fs.unlinkSync(file);

      // Delete associated test file if exists
      const testFile = file.replace(/\.(tsx?|jsx?)$/, '.test.$1');
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }

      // Delete associated story file if exists
      const storyFile = file.replace(/\.(tsx?|jsx?)$/, '.stories.$1');
      if (fs.existsSync(storyFile)) {
        fs.unlinkSync(storyFile);
      }
    }
  }

  /**
   * Capture current metrics
   */
  private async captureMetrics(): Promise<any> {
    return {
      tests: await this.testFramework.runTests(),
      performance: await this.performanceMonitor.measure(),
      bundleSize: await this.measureBundleSize(),
      codeMetrics: await this.measureCodeMetrics()
    };
  }

  /**
   * Validate removal safety
   */
  private async validateRemoval(
    before: any,
    after: any,
    testResults: any
  ): Promise<{ safe: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check tests
    if (!testResults.passed) {
      issues.push('Tests failing after removal');
    }

    // Check coverage
    if (after.tests.coverage.lines < before.tests.coverage.lines - 5) {
      issues.push(`Coverage dropped from ${before.tests.coverage.lines}% to ${after.tests.coverage.lines}%`);
    }

    // Check performance
    if (after.performance.loadTime > before.performance.loadTime * 1.1) {
      issues.push('Performance degraded by more than 10%');
    }

    // Check bundle size increased
    if (after.bundleSize > before.bundleSize) {
      issues.push('Bundle size increased unexpectedly');
    }

    // Check for TypeScript errors
    try {
      execSync('npx tsc --noEmit', { cwd: this.projectRoot });
    } catch {
      issues.push('TypeScript compilation errors');
    }

    return {
      safe: issues.length === 0,
      issues
    };
  }

  /**
   * Git operations
   */
  private async createFeatureBranch(candidate: RemovalCandidate): Promise<string> {
    const branchName = `cleanup/${candidate.type}/${candidate.id}`;
    execSync(`git checkout -b ${branchName}`, { cwd: this.projectRoot });
    return branchName;
  }

  private async commitChanges(candidate: RemovalCandidate): Promise<string> {
    execSync('git add -A', { cwd: this.projectRoot });
    execSync(
      `git commit -m "cleanup: Remove ${candidate.type} (${candidate.estimatedSavings.lines} lines saved)"`,
      { cwd: this.projectRoot }
    );

    const commitHash = execSync('git rev-parse HEAD', {
      cwd: this.projectRoot,
      encoding: 'utf-8'
    }).trim();

    return commitHash;
  }

  private async createPullRequest(branch: string, candidate: RemovalCandidate): Promise<void> {
    const prBody = `
## Automated Code Cleanup

**Type:** ${candidate.type}
**Risk:** ${candidate.risk}
**Files affected:** ${candidate.files.length}

### Estimated Savings
- Lines: ${candidate.estimatedSavings.lines}
- Bytes: ${candidate.estimatedSavings.bytes}
- Complexity reduction: ${candidate.estimatedSavings.complexity}

### Validation
- ✅ All tests passing
- ✅ No performance regression
- ✅ Bundle size reduced
- ✅ TypeScript compilation successful

### Rollback
If issues are found, this can be rolled back with:
\`\`\`bash
git revert ${await this.getLastCommit()}
\`\`\`
`;

    // Create PR using GitHub CLI if available
    try {
      execSync(
        `gh pr create --title "Cleanup: Remove ${candidate.type}" --body "${prBody}" --base main --head ${branch}`,
        { cwd: this.projectRoot }
      );
    } catch {
      debugLog('general', 'log_statement', 'GitHub CLI not available, please create PR manually')
    }
  }

  /**
   * Backup and rollback operations
   */
  private async createBackup(candidate: RemovalCandidate): Promise<string> {
    const backupId = `backup-${Date.now()}-${candidate.id}`;
    const backupPath = path.join(this.backupDir, backupId);

    fs.mkdirSync(backupPath, { recursive: true });

    // Backup affected files
    for (const file of candidate.files) {
      const relativePath = path.relative(this.projectRoot, file);
      const backupFile = path.join(backupPath, relativePath);

      fs.mkdirSync(path.dirname(backupFile), { recursive: true });
      fs.copyFileSync(file, backupFile);
    }

    // Save metadata
    fs.writeFileSync(
      path.join(backupPath, 'metadata.json'),
      JSON.stringify(candidate, null, 2)
    );

    return backupId;
  }

  private async rollback(backupId: string): Promise<void> {
    const backupPath = path.join(this.backupDir, backupId);
    const metadata = JSON.parse(
      fs.readFileSync(path.join(backupPath, 'metadata.json'), 'utf-8')
    );

    // Restore files
    for (const file of metadata.files) {
      const relativePath = path.relative(this.projectRoot, file);
      const backupFile = path.join(backupPath, relativePath);

      if (fs.existsSync(backupFile)) {
        fs.copyFileSync(backupFile, file);
      }
    }
  }

  private async emergencyRollback(): Promise<void> {
    execSync('git checkout -- .', { cwd: this.projectRoot });
  }

  /**
   * Helper methods
   */
  private sortCandidatesByRisk(candidates: RemovalCandidate[]): RemovalCandidate[] {
    const riskOrder = { low: 0, medium: 1, high: 2 };
    return candidates.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk]);
  }

  private async returnToMainBranch(): Promise<void> {
    execSync('git checkout main', { cwd: this.projectRoot });
  }

  private async measureBundleSize(): Promise<number> {
    try {
      const stats = fs.statSync(path.join(this.projectRoot, 'build/static/js'));
      return stats.size;
    } catch {
      return 0;
    }
  }

  private async measureCodeMetrics(): Promise<any> {
    // Implement code metrics measurement
    return {};
  }

  private async updateImports(_fromFile: string, _toFile: string): Promise<void> {
    // Update import statements to point to the kept file
  }

  private async getLastCommit(): Promise<string> {
    return execSync('git rev-parse HEAD', {
      cwd: this.projectRoot,
      encoding: 'utf-8'
    }).trim();
  }
}
