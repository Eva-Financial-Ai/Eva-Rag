import { performance } from 'perf_hooks';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { debugLog } from '../utils/auditLogger';

interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  bundleSize: {
    total: number;
    js: number;
    css: number;
    assets: number;
  };
  buildTime: number;
  testExecutionTime: number;
  codeMetrics: {
    totalFiles: number;
    totalLines: number;
    avgComplexity: number;
    duplicatePercentage: number;
  };
}

export class PerformanceMonitor {
  private baselineMetrics: PerformanceMetrics | null = null;
  private metricsHistory: PerformanceMetrics[] = [];

  constructor(private projectRoot: string) {}

  /**
   * Measure all performance metrics
   */
  async measure(): Promise<PerformanceMetrics> {
    debugLog('general', 'log_statement', '📊 Measuring performance metrics...')

    const metrics: PerformanceMetrics = {
      loadTime: 0,
      memoryUsage: await this.measureMemoryUsage(),
      bundleSize: await this.measureBundleSize(),
      buildTime: await this.measureBuildTime(),
      testExecutionTime: await this.measureTestExecutionTime(),
      codeMetrics: await this.measureCodeMetrics(),
    };

    this.metricsHistory.push(metrics);
    return metrics;
  }

  /**
   * Set baseline metrics for comparison
   */
  setBaseline(metrics: PerformanceMetrics): void {
    this.baselineMetrics = metrics;
  }

  /**
   * Compare current metrics with baseline
   */
  compareWithBaseline(current: PerformanceMetrics): {
    improved: boolean;
    changes: Record<string, number>;
    summary: string;
  } {
    if (!this.baselineMetrics) {
      return {
        improved: true,
        changes: {},
        summary: 'No baseline to compare',
      };
    }

    const changes: Record<string, number> = {
      memoryUsage: this.calculatePercentageChange(
        this.baselineMetrics.memoryUsage.heapUsed,
        current.memoryUsage.heapUsed
      ),
      bundleSize: this.calculatePercentageChange(
        this.baselineMetrics.bundleSize.total,
        current.bundleSize.total
      ),
      buildTime: this.calculatePercentageChange(this.baselineMetrics.buildTime, current.buildTime),
      testTime: this.calculatePercentageChange(
        this.baselineMetrics.testExecutionTime,
        current.testExecutionTime
      ),
    };

    const improved = changes.memoryUsage <= 0 && changes.bundleSize <= 0;

    const summary = this.generateSummary(changes);

    return { improved, changes, summary };
  }

  /**
   * Measure memory usage
   */
  private async measureMemoryUsage(): Promise<PerformanceMetrics['memoryUsage']> {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
    };
  }

  /**
   * Measure bundle size
   */
  private async measureBundleSize(): Promise<PerformanceMetrics['bundleSize']> {
    try {
      const buildDir = path.join(this.projectRoot, 'build');
      const stats = {
        total: 0,
        js: 0,
        css: 0,
        assets: 0,
      };

      // Check if build directory exists
      if (!fs.existsSync(buildDir)) {
        debugLog('general', 'log_statement', 'Build directory not found, skipping bundle size measurement')
        return stats;
      }

      // Analyze build directory
      const analyzeDir = (dir: string) => {
        const files = fs.readdirSync(dir);

        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            analyzeDir(fullPath);
          } else {
            stats.total += stat.size;

            if (file.endsWith('.js')) {
              stats.js += stat.size;
            } else if (file.endsWith('.css')) {
              stats.css += stat.size;
            } else {
              stats.assets += stat.size;
            }
          }
        }
      };

      analyzeDir(buildDir);
      return stats;
    } catch (error) {
      console.warn('Failed to measure bundle size:', error);
      return { total: 0, js: 0, css: 0, assets: 0 };
    }
  }

  /**
   * Measure build time
   */
  private async measureBuildTime(): Promise<number> {
    try {
      debugLog('general', 'log_statement', 'Measuring build time (this may take a while)...');
      const start = performance.now();
      execSync('npm run build', {
        cwd: this.projectRoot,
        stdio: 'pipe',
      });
      return performance.now() - start;
    } catch (error) {
      console.warn('Failed to measure build time:', error);
      return 0;
    }
  }

  /**
   * Measure test execution time
   */
  private async measureTestExecutionTime(): Promise<number> {
    try {
      const start = performance.now();
      execSync('npm test -- --watchAll=false', {
        cwd: this.projectRoot,
        stdio: 'pipe',
      });
      return performance.now() - start;
    } catch (error) {
      console.warn('Failed to measure test execution time:', error);
      return 0;
    }
  }

  /**
   * Measure code metrics
   */
  private async measureCodeMetrics(): Promise<PerformanceMetrics['codeMetrics']> {
    try {
      // Count files and lines
      const jsFiles = execSync(
        'find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | wc -l',
        { cwd: this.projectRoot, encoding: 'utf-8' }
      );

      const totalLines = execSync(
        'find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs wc -l | tail -1',
        { cwd: this.projectRoot, encoding: 'utf-8' }
      );

      return {
        totalFiles: parseInt(jsFiles.trim()),
        totalLines: parseInt(totalLines.trim().split(' ')[0]),
        avgComplexity: 5, // Default value
        duplicatePercentage: 0, // Will be calculated by duplicate detector
      };
    } catch (error) {
      console.warn('Failed to measure code metrics:', error);
      return {
        totalFiles: 0,
        totalLines: 0,
        avgComplexity: 0,
        duplicatePercentage: 0,
      };
    }
  }

  /**
   * Calculate percentage change
   */
  private calculatePercentageChange(baseline: number, current: number): number {
    if (baseline === 0) return 0;
    return ((current - baseline) / baseline) * 100;
  }

  /**
   * Generate summary of changes
   */
  private generateSummary(changes: Record<string, number>): string {
    const improvements: string[] = [];
    const regressions: string[] = [];

    for (const [metric, change] of Object.entries(changes)) {
      if (change < -5) {
        improvements.push(`${metric}: ${Math.abs(change).toFixed(1)}% improvement`);
      } else if (change > 5) {
        regressions.push(`${metric}: ${change.toFixed(1)}% regression`);
      }
    }

    if (improvements.length === 0 && regressions.length === 0) {
      return 'No significant changes detected';
    }

    let summary = '';
    if (improvements.length > 0) {
      summary += `✅ Improvements: ${improvements.join(', ')}`;
    }
    if (regressions.length > 0) {
      summary += `\n⚠️ Regressions: ${regressions.join(', ')}`;
    }

    return summary;
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    if (this.metricsHistory.length === 0) {
      return 'No metrics collected yet';
    }

    const latest = this.metricsHistory[this.metricsHistory.length - 1];
    const comparison = this.baselineMetrics ? this.compareWithBaseline(latest) : null;

    const report = `
# Performance Report

## Current Metrics
- Memory Usage: ${(latest.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB
- Bundle Size: ${(latest.bundleSize.total / 1024 / 1024).toFixed(2)}MB
  - JS: ${(latest.bundleSize.js / 1024 / 1024).toFixed(2)}MB
  - CSS: ${(latest.bundleSize.css / 1024 / 1024).toFixed(2)}MB
- Build Time: ${(latest.buildTime / 1000).toFixed(2)}s
- Test Execution: ${(latest.testExecutionTime / 1000).toFixed(2)}s

## Code Metrics
- Total Files: ${latest.codeMetrics.totalFiles}
- Total Lines: ${latest.codeMetrics.totalLines}
- Average Complexity: ${latest.codeMetrics.avgComplexity.toFixed(2)}

${
  comparison
    ? `
## Comparison with Baseline
${comparison.summary}
`
    : ''
}
`;

    return report;
  }
}
