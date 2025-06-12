#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface CoverageReport {
  total: {
    lines: { pct: number };
    statements: { pct: number };
    functions: { pct: number };
    branches: { pct: number };
  };
  files: Record<string, {
    lines: { pct: number };
    statements: { pct: number };
    functions: { pct: number };
    branches: { pct: number };
  }>;
}

interface UncoveredFile {
  path: string;
  coverage: {
    lines: number;
    statements: number;
    functions: number;
    branches: number;
  };
  priority: 'high' | 'medium' | 'low';
}

// Priority mapping based on file importance
const filePriority = (filePath: string): 'high' | 'medium' | 'low' => {
  if (filePath.includes('/utils/financial') || 
      filePath.includes('/api/') ||
      filePath.includes('/hooks/useAuth') ||
      filePath.includes('/services/')) {
    return 'high';
  }
  
  if (filePath.includes('/components/') ||
      filePath.includes('/pages/')) {
    return 'medium';
  }
  
  return 'low';
};

async function analyzeCoverage() {
  console.log('🔍 Analyzing test coverage...\n');

  try {
    // Run coverage report
    execSync('npm run test:coverage -- --reporter=json', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to generate coverage report');
    process.exit(1);
  }

  // Read coverage report
  const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-final.json');
  const coverage: CoverageReport = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));

  // Current coverage summary
  console.log('📊 Current Coverage Summary:');
  console.log(`Lines:      ${coverage.total.lines.pct}%`);
  console.log(`Statements: ${coverage.total.statements.pct}%`);
  console.log(`Functions:  ${coverage.total.functions.pct}%`);
  console.log(`Branches:   ${coverage.total.branches.pct}%`);
  console.log();

  // Calculate gap to 80%
  const targetCoverage = 80;
  const currentAverage = (
    coverage.total.lines.pct +
    coverage.total.statements.pct +
    coverage.total.functions.pct +
    coverage.total.branches.pct
  ) / 4;

  console.log(`📈 Coverage Gap: ${(targetCoverage - currentAverage).toFixed(2)}%\n`);

  // Find uncovered files
  const uncoveredFiles: UncoveredFile[] = [];

  for (const [filePath, fileCoverage] of Object.entries(coverage.files)) {
    const avgCoverage = (
      fileCoverage.lines.pct +
      fileCoverage.statements.pct +
      fileCoverage.functions.pct +
      fileCoverage.branches.pct
    ) / 4;

    if (avgCoverage < targetCoverage) {
      uncoveredFiles.push({
        path: filePath,
        coverage: {
          lines: fileCoverage.lines.pct,
          statements: fileCoverage.statements.pct,
          functions: fileCoverage.functions.pct,
          branches: fileCoverage.branches.pct,
        },
        priority: filePriority(filePath),
      });
    }
  }

  // Sort by priority and coverage
  uncoveredFiles.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    const avgA = (a.coverage.lines + a.coverage.statements + a.coverage.functions + a.coverage.branches) / 4;
    const avgB = (b.coverage.lines + b.coverage.statements + b.coverage.functions + b.coverage.branches) / 4;
    
    return avgA - avgB;
  });

  // Generate action plan
  console.log('🎯 Files Requiring Tests (Prioritized):\n');

  const highPriorityFiles = uncoveredFiles.filter(f => f.priority === 'high');
  const mediumPriorityFiles = uncoveredFiles.filter(f => f.priority === 'medium');
  const lowPriorityFiles = uncoveredFiles.filter(f => f.priority === 'low');

  if (highPriorityFiles.length > 0) {
    console.log('🔴 HIGH PRIORITY:');
    highPriorityFiles.slice(0, 10).forEach(file => {
      const avg = (file.coverage.lines + file.coverage.statements + file.coverage.functions + file.coverage.branches) / 4;
      console.log(`  ${path.relative(process.cwd(), file.path)} - ${avg.toFixed(1)}% coverage`);
    });
    console.log();
  }

  if (mediumPriorityFiles.length > 0) {
    console.log('🟡 MEDIUM PRIORITY:');
    mediumPriorityFiles.slice(0, 10).forEach(file => {
      const avg = (file.coverage.lines + file.coverage.statements + file.coverage.functions + file.coverage.branches) / 4;
      console.log(`  ${path.relative(process.cwd(), file.path)} - ${avg.toFixed(1)}% coverage`);
    });
    console.log();
  }

  if (lowPriorityFiles.length > 0) {
    console.log('🟢 LOW PRIORITY:');
    console.log(`  ${lowPriorityFiles.length} files with low priority\n`);
  }

  // Generate test templates for high priority files
  console.log('📝 Generating test templates for high priority files...\n');

  for (const file of highPriorityFiles.slice(0, 5)) {
    await generateTestTemplate(file.path);
  }

  // Coverage improvement estimation
  const filesNeedingTests = uncoveredFiles.length;
  const estimatedTestsPerFile = 5;
  const totalTestsNeeded = filesNeedingTests * estimatedTestsPerFile;
  const estimatedHoursPerTest = 0.5;
  const totalHours = totalTestsNeeded * estimatedHoursPerTest;

  console.log('⏱️  Effort Estimation:');
  console.log(`Files needing tests: ${filesNeedingTests}`);
  console.log(`Estimated tests needed: ${totalTestsNeeded}`);
  console.log(`Estimated hours: ${totalHours}`);
  console.log(`Estimated days (8h/day): ${(totalHours / 8).toFixed(1)}`);
  console.log();

  // Generate detailed report
  const report = {
    timestamp: new Date().toISOString(),
    current: coverage.total,
    target: {
      lines: { pct: targetCoverage },
      statements: { pct: targetCoverage },
      functions: { pct: targetCoverage },
      branches: { pct: targetCoverage },
    },
    gap: targetCoverage - currentAverage,
    uncoveredFiles: uncoveredFiles.length,
    priorityBreakdown: {
      high: highPriorityFiles.length,
      medium: mediumPriorityFiles.length,
      low: lowPriorityFiles.length,
    },
    estimation: {
      filesNeedingTests,
      totalTestsNeeded,
      totalHours,
      days: totalHours / 8,
    },
    actionPlan: uncoveredFiles.slice(0, 20).map(file => ({
      file: path.relative(process.cwd(), file.path),
      priority: file.priority,
      currentCoverage: file.coverage,
    })),
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'coverage-analysis-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('✅ Coverage analysis complete!');
  console.log('📄 Detailed report saved to: coverage-analysis-report.json');
}

async function generateTestTemplate(filePath: string) {
  const fileName = path.basename(filePath);
  const testFileName = fileName.replace(/\.(ts|tsx)$/, '.test.$1');
  const dirName = path.dirname(filePath);
  const testDir = path.join(dirName, '__tests__');
  const testPath = path.join(testDir, testFileName);

  // Skip if test already exists
  if (fs.existsSync(testPath)) {
    return;
  }

  // Create test directory if needed
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Read source file to understand structure
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const isComponent = filePath.includes('/components/') || sourceCode.includes('React');
  
  let template: string;
  
  if (isComponent) {
    template = `import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ${fileName.replace(/\.(tsx?|jsx?)$/, '')} } from '../${fileName}';

describe('${fileName.replace(/\.(tsx?|jsx?)$/, '')}', () => {
  it('renders without crashing', () => {
    render(<${fileName.replace(/\.(tsx?|jsx?)$/, '')} />);
    // Add assertions
  });

  // TODO: Add more tests based on component functionality
});`;
  } else {
    template = `import { describe, it, expect, vi } from 'vitest';
import { /* functions to test */ } from '../${fileName}';

describe('${fileName.replace(/\.(tsx?|jsx?)$/, '')}', () => {
  it('should have tests', () => {
    // TODO: Add tests
    expect(true).toBe(true);
  });
});`;
  }

  fs.writeFileSync(testPath, template);
  console.log(`  Created: ${path.relative(process.cwd(), testPath)}`);
}

// Run the analysis
analyzeCoverage().catch(console.error);