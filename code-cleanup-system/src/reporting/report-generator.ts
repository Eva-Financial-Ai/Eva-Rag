export class ReportGenerator {
  constructor(_projectRoot: string) {}

  /**
   * Generate a comprehensive HTML report
   */
  async generateFullReport(data: {
    analysis: any;
    removals: any;
    baseline: any;
    current: any;
  }): Promise<string> {
    const { analysis, removals, baseline, current } = data;

    const successfulRemovals = removals?.filter((r: any) => r.success) || [];

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Cleanup Report - ${new Date().toLocaleDateString()}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .card h3 {
            margin-top: 0;
            color: #667eea;
        }
        .metric {
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }
        .improvement {
            color: #10b981;
        }
        .regression {
            color: #ef4444;
        }
        .section {
            background: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #667eea;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.875em;
            font-weight: 500;
        }
        .badge-success {
            background: #d1fae5;
            color: #065f46;
        }
        .badge-error {
            background: #fee2e2;
            color: #991b1b;
        }
        .badge-warning {
            background: #fef3c7;
            color: #92400e;
        }
        .badge-info {
            background: #dbeafe;
            color: #1e40af;
        }
        .code-block {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 0.875em;
            overflow-x: auto;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
            transition: width 0.3s ease;
        }
        .chart-container {
            margin: 20px 0;
            height: 300px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧹 Code Cleanup Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="card">
            <h3>📊 Total Savings</h3>
            <div class="metric improvement">
                ${this.calculateTotalSavings(removals)} lines
            </div>
            <p>Code removed successfully</p>
        </div>

        <div class="card">
            <h3>📦 Bundle Size</h3>
            <div class="metric ${this.getChangeClass(baseline.bundleSize.total, current.bundleSize.total)}">
                ${this.formatBytes(current.bundleSize.total)}
            </div>
            <p>${this.formatPercentageChange(baseline.bundleSize.total, current.bundleSize.total)} from baseline</p>
        </div>

        <div class="card">
            <h3>⚡ Performance</h3>
            <div class="metric ${this.getChangeClass(baseline.loadTime, current.loadTime)}">
                ${current.loadTime.toFixed(0)}ms
            </div>
            <p>Load time ${this.formatPercentageChange(baseline.loadTime, current.loadTime)}</p>
        </div>

        <div class="card">
            <h3>✅ Success Rate</h3>
            <div class="metric">
                ${this.calculateSuccessRate(removals)}%
            </div>
            <p>${successfulRemovals.length} of ${removals?.length || 0} removals</p>
        </div>
    </div>

    <div class="section">
        <h2>🔍 Analysis Summary</h2>
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Count</th>
                    <th>Potential Savings</th>
                    <th>Risk Level</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Duplicate Code</td>
                    <td>${analysis.duplicates.length}</td>
                    <td>${this.sumSavings(analysis.duplicates, 'lines')} lines</td>
                    <td><span class="badge badge-warning">Mixed</span></td>
                </tr>
                <tr>
                    <td>Dead Code</td>
                    <td>${analysis.deadCode.length}</td>
                    <td>${analysis.deadCode.length * 50} lines (est.)</td>
                    <td><span class="badge badge-info">Low-Medium</span></td>
                </tr>
                <tr>
                    <td>Unused Imports</td>
                    <td>${analysis.redundantImports.size}</td>
                    <td>${analysis.redundantImports.size * 2} lines</td>
                    <td><span class="badge badge-success">Low</span></td>
                </tr>
                <tr>
                    <td>Unused Components</td>
                    <td>${analysis.unusedComponents.length}</td>
                    <td>${analysis.unusedComponents.length * 100} lines (est.)</td>
                    <td><span class="badge badge-warning">Medium</span></td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>🔧 Removal Results</h2>
        ${this.generateRemovalResults(removals)}
    </div>

    <div class="section">
        <h2>📈 Performance Metrics</h2>
        ${this.generatePerformanceComparison(baseline, current)}
    </div>

    <div class="section">
        <h2>🎯 Recommendations</h2>
        ${this.generateRecommendations(analysis, removals)}
    </div>

    <div class="section">
        <h2>📋 Next Steps</h2>
        <ol>
            <li>Review the pull requests created for each removal</li>
            <li>Run additional manual testing on critical paths</li>
            <li>Monitor production metrics after deployment</li>
            <li>Schedule regular cleanup runs (monthly recommended)</li>
            <li>Update coding standards to prevent future duplicates</li>
        </ol>
    </div>

    <script>
        // Add interactive features if needed
        document.querySelectorAll('.progress-fill').forEach(el => {
            const width = el.getAttribute('data-width');
            setTimeout(() => {
                el.style.width = width + '%';
            }, 100);
        });
    </script>
</body>
</html>
    `;

    return html;
  }

  /**
   * Helper methods for report generation
   */
  private calculateTotalSavings(removals: any[]): number {
    if (!removals) return 0;
    return removals
      .filter(r => r.success)
      .reduce((sum, r) => sum + (r.candidate.estimatedSavings.lines || 0), 0);
  }

  private calculateSuccessRate(removals: any[]): number {
    if (!removals || removals.length === 0) return 0;
    const successful = removals.filter(r => r.success).length;
    return Math.round((successful / removals.length) * 100);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private formatPercentageChange(baseline: number, current: number): string {
    if (baseline === 0) return 'N/A';
    const change = ((current - baseline) / baseline) * 100;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }

  private getChangeClass(baseline: number, current: number): string {
    if (current < baseline) return 'improvement';
    if (current > baseline) return 'regression';
    return '';
  }

  private sumSavings(items: any[], field: string): number {
    return items.reduce((sum, item) => sum + (item.potentialSavings?.[field] || 0), 0);
  }

  private generateRemovalResults(removals: any[]): string {
    if (!removals || removals.length === 0) {
      return '<p>No removals were performed.</p>';
    }

    const successful = removals.filter(r => r.success);
    const failed = removals.filter(r => !r.success);

    let html = '<h3>✅ Successful Removals</h3>';
    if (successful.length > 0) {
      html +=
        '<table><thead><tr><th>Type</th><th>Files</th><th>Lines Saved</th><th>Risk</th></tr></thead><tbody>';
      for (const removal of successful) {
        html += `
          <tr>
            <td>${removal.candidate.type}</td>
            <td>${removal.candidate.files.length}</td>
            <td>${removal.candidate.estimatedSavings.lines}</td>
            <td><span class="badge badge-${this.getRiskBadgeClass(removal.candidate.risk)}">${removal.candidate.risk}</span></td>
          </tr>
        `;
      }
      html += '</tbody></table>';
    } else {
      html += '<p>No successful removals.</p>';
    }

    if (failed.length > 0) {
      html += '<h3>❌ Failed Removals</h3>';
      html += '<table><thead><tr><th>Type</th><th>Reason</th><th>Risk</th></tr></thead><tbody>';
      for (const removal of failed) {
        html += `
          <tr>
            <td>${removal.candidate.type}</td>
            <td>${removal.issues?.join(', ') || 'Unknown'}</td>
            <td><span class="badge badge-${this.getRiskBadgeClass(removal.candidate.risk)}">${removal.candidate.risk}</span></td>
          </tr>
        `;
      }
      html += '</tbody></table>';
    }

    return html;
  }

  private getRiskBadgeClass(risk: string): string {
    switch (risk) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'info';
    }
  }

  private generatePerformanceComparison(baseline: any, current: any): string {
    const metrics = [
      { name: 'Load Time', baseline: baseline.loadTime, current: current.loadTime, unit: 'ms' },
      {
        name: 'Bundle Size',
        baseline: baseline.bundleSize.total,
        current: current.bundleSize.total,
        unit: 'bytes',
        format: 'bytes',
      },
      {
        name: 'Memory Usage',
        baseline: baseline.memoryUsage.heapUsed,
        current: current.memoryUsage.heapUsed,
        unit: 'bytes',
        format: 'bytes',
      },
      { name: 'Build Time', baseline: baseline.buildTime, current: current.buildTime, unit: 'ms' },
      {
        name: 'Test Execution',
        baseline: baseline.testExecutionTime,
        current: current.testExecutionTime,
        unit: 'ms',
      },
    ];

    let html =
      '<table><thead><tr><th>Metric</th><th>Baseline</th><th>Current</th><th>Change</th></tr></thead><tbody>';

    for (const metric of metrics) {
      const change = this.formatPercentageChange(metric.baseline, metric.current);
      const changeClass = this.getChangeClass(metric.baseline, metric.current);

      html += `
        <tr>
          <td>${metric.name}</td>
          <td>${metric.format === 'bytes' ? this.formatBytes(metric.baseline) : `${metric.baseline.toFixed(0)}${metric.unit}`}</td>
          <td>${metric.format === 'bytes' ? this.formatBytes(metric.current) : `${metric.current.toFixed(0)}${metric.unit}`}</td>
          <td class="${changeClass}">${change}</td>
        </tr>
      `;
    }

    html += '</tbody></table>';
    return html;
  }

  private generateRecommendations(analysis: any, removals: any): string {
    const recommendations: string[] = [];

    // Based on analysis results
    if (analysis.duplicates.length > 10) {
      recommendations.push(
        'Consider implementing a pre-commit hook to detect duplicate code before it enters the codebase.'
      );
    }

    if (analysis.unusedComponents.length > 5) {
      recommendations.push(
        'Review component architecture and consider consolidating similar components.'
      );
    }

    if (analysis.redundantImports.size > 20) {
      recommendations.push('Enable ESLint rule for unused imports and configure auto-fix on save.');
    }

    // Based on removal results
    const failureRate = removals
      ? (removals.filter((r: any) => !r.success).length / removals.length) * 100
      : 0;
    if (failureRate > 20) {
      recommendations.push(
        'High failure rate detected. Consider improving test coverage before next cleanup run.'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Codebase is in good shape! Continue with regular maintenance.');
    }

    return '<ul>' + recommendations.map(r => `<li>${r}</li>`).join('') + '</ul>';
  }
}
