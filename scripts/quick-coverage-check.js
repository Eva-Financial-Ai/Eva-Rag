#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Quick Coverage Analysis\n');

// Count source files
const countFiles = (dir, extensions) => {
  let count = 0;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory() && !file.name.includes('__tests__') && !file.name.includes('node_modules')) {
      count += countFiles(fullPath, extensions);
    } else if (file.isFile() && extensions.some(ext => file.name.endsWith(ext))) {
      count++;
    }
  }
  
  return count;
};

// Count test files
const countTestFiles = (dir) => {
  let count = 0;
  try {
    const result = execSync(`find ${dir} -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.test.js" | wc -l`, { encoding: 'utf-8' });
    count = parseInt(result.trim());
  } catch (e) {
    console.error('Error counting test files:', e.message);
  }
  return count;
};

const srcDir = path.join(process.cwd(), 'src');
const testDir = path.join(process.cwd(), 'test');

// Count source files
const tsFiles = countFiles(srcDir, ['.ts', '.tsx']);
const jsFiles = countFiles(srcDir, ['.js', '.jsx']);
const totalSourceFiles = tsFiles + jsFiles;

// Count test files
const testFiles = countTestFiles('.');
const srcTestFiles = countTestFiles('src');
const rootTestFiles = countTestFiles('test');

console.log('📊 File Statistics:');
console.log(`Source files (TS/TSX): ${tsFiles}`);
console.log(`Source files (JS/JSX): ${jsFiles}`);
console.log(`Total source files: ${totalSourceFiles}`);
console.log(`Test files in src/: ${srcTestFiles}`);
console.log(`Test files in test/: ${rootTestFiles}`);
console.log(`Total test files: ${testFiles}`);
console.log(`\nRatio: ${(testFiles / totalSourceFiles * 100).toFixed(1)}% of source files have tests\n`);

// Run quick test to see passing/failing
console.log('🧪 Running quick test check...');
try {
  const result = execSync('npm run test:run -- --reporter=json', { encoding: 'utf-8', stdio: 'pipe' });
  const lines = result.split('\n');
  const jsonLine = lines.find(line => line.includes('"numTotalTests"'));
  
  if (jsonLine) {
    try {
      const stats = JSON.parse(jsonLine);
      console.log(`\nTest Results:`);
      console.log(`✅ Passed: ${stats.numPassedTests}`);
      console.log(`❌ Failed: ${stats.numFailedTests}`);
      console.log(`⏭️  Skipped: ${stats.numPendingTests}`);
      console.log(`📁 Test Suites: ${stats.numTotalTestSuites}`);
    } catch (e) {
      console.log('Could not parse test results');
    }
  }
} catch (e) {
  console.log('Tests encountered errors - this is expected with the current setup');
}

// Estimate coverage
const estimatedCoverage = (testFiles / totalSourceFiles) * 100 * 0.3; // Rough estimate
console.log(`\n📈 Estimated Coverage: ~${estimatedCoverage.toFixed(1)}%`);
console.log(`📍 Target Coverage: 80%`);
console.log(`📊 Gap: ~${(80 - estimatedCoverage).toFixed(1)}%`);

// Prioritized files to test
console.log('\n🎯 Priority Areas for Testing:');
const priorityDirs = [
  'src/utils',
  'src/hooks',
  'src/services',
  'src/api',
  'src/components/common',
  'src/components/credit',
];

priorityDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    const sourceCount = countFiles(dirPath, ['.ts', '.tsx', '.js', '.jsx']);
    const testCount = countTestFiles(dir);
    const coverage = sourceCount > 0 ? (testCount / sourceCount * 100).toFixed(0) : 0;
    console.log(`${dir}: ${testCount}/${sourceCount} files (${coverage}% coverage)`);
  }
});

console.log('\n✅ Quick analysis complete!');
console.log('\nNext steps:');
console.log('1. Fix failing tests in src/utils/__tests__/financialCalculations.test.ts');
console.log('2. Install missing dependencies (@faker-js/faker, jest-axe, msw)');
console.log('3. Create tests for high-priority untested files');
console.log('4. Run full coverage report: npm run test:coverage');