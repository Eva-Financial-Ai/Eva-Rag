#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Bundle size thresholds (in KB)
const BUNDLE_SIZE_LIMITS = {
  main: 250, // Main bundle should be under 250KB
  css: 35, // CSS should be under 35KB
  total: 1500, // Total bundle size should be under 1.5MB
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatSize(bytes) {
  const kb = bytes / 1024;
  return `${kb.toFixed(2)} KB`;
}

function getBundleStats() {
  const buildDir = path.join(process.cwd(), 'build', 'static');
  const stats = {
    js: [],
    css: [],
    total: 0,
  };

  try {
    // Get JS files
    const jsDir = path.join(buildDir, 'js');
    if (fs.existsSync(jsDir)) {
      const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));

      for (const file of jsFiles) {
        const filePath = path.join(jsDir, file);
        const size = fs.statSync(filePath).size;
        stats.js.push({ name: file, size, sizeKB: size / 1024 });
        stats.total += size;
      }
    }

    // Get CSS files
    const cssDir = path.join(buildDir, 'css');
    if (fs.existsSync(cssDir)) {
      const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));

      for (const file of cssFiles) {
        const filePath = path.join(cssDir, file);
        const size = fs.statSync(filePath).size;
        stats.css.push({ name: file, size, sizeKB: size / 1024 });
        stats.total += size;
      }
    }

    // Sort by size (largest first)
    stats.js.sort((a, b) => b.size - a.size);
    stats.css.sort((a, b) => b.size - a.size);

    return stats;
  } catch (error) {
    log(`Error reading bundle stats: ${error.message}`, 'red');
    process.exit(1);
  }
}

function checkBundleSizes(stats) {
  let hasErrors = false;
  const warnings = [];
  const errors = [];

  // Check main JS bundle (largest JS file)
  if (stats.js.length > 0) {
    const mainBundle = stats.js[0];
    if (mainBundle.sizeKB > BUNDLE_SIZE_LIMITS.main) {
      errors.push(
        `Main bundle (${mainBundle.name}) is ${formatSize(mainBundle.size)} (limit: ${BUNDLE_SIZE_LIMITS.main} KB)`
      );
      hasErrors = true;
    } else if (mainBundle.sizeKB > BUNDLE_SIZE_LIMITS.main * 0.9) {
      warnings.push(
        `Main bundle (${mainBundle.name}) is ${formatSize(mainBundle.size)} (approaching limit: ${BUNDLE_SIZE_LIMITS.main} KB)`
      );
    }
  }

  // Check CSS bundle (largest CSS file)
  if (stats.css.length > 0) {
    const mainCSS = stats.css[0];
    if (mainCSS.sizeKB > BUNDLE_SIZE_LIMITS.css) {
      errors.push(
        `Main CSS (${mainCSS.name}) is ${formatSize(mainCSS.size)} (limit: ${BUNDLE_SIZE_LIMITS.css} KB)`
      );
      hasErrors = true;
    } else if (mainCSS.sizeKB > BUNDLE_SIZE_LIMITS.css * 0.9) {
      warnings.push(
        `Main CSS (${mainCSS.name}) is ${formatSize(mainCSS.size)} (approaching limit: ${BUNDLE_SIZE_LIMITS.css} KB)`
      );
    }
  }

  // Check total bundle size
  const totalKB = stats.total / 1024;
  if (totalKB > BUNDLE_SIZE_LIMITS.total) {
    errors.push(
      `Total bundle size is ${formatSize(stats.total)} (limit: ${BUNDLE_SIZE_LIMITS.total} KB)`
    );
    hasErrors = true;
  } else if (totalKB > BUNDLE_SIZE_LIMITS.total * 0.9) {
    warnings.push(
      `Total bundle size is ${formatSize(stats.total)} (approaching limit: ${BUNDLE_SIZE_LIMITS.total} KB)`
    );
  }

  return { hasErrors, warnings, errors };
}

function saveBundleHistory(stats) {
  const historyFile = path.join(process.cwd(), 'bundle-size-history.json');
  const timestamp = new Date().toISOString();

  let history = [];
  if (fs.existsSync(historyFile)) {
    try {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    } catch (error) {
      log(`Warning: Could not read bundle history: ${error.message}`, 'yellow');
    }
  }

  const entry = {
    timestamp,
    totalSize: stats.total,
    totalSizeKB: stats.total / 1024,
    mainJS: stats.js[0] ? stats.js[0].sizeKB : 0,
    mainCSS: stats.css[0] ? stats.css[0].sizeKB : 0,
    jsFiles: stats.js.length,
    cssFiles: stats.css.length,
  };

  history.push(entry);

  // Keep only last 50 entries
  if (history.length > 50) {
    history = history.slice(-50);
  }

  try {
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    log(`Bundle size history saved to ${historyFile}`, 'blue');
  } catch (error) {
    log(`Warning: Could not save bundle history: ${error.message}`, 'yellow');
  }
}

function generateReport(stats) {
  const reportFile = path.join(process.cwd(), 'bundle-size-report.md');
  const timestamp = new Date().toISOString();

  let report = `# Bundle Size Report\n\n`;
  report += `Generated: ${timestamp}\n\n`;

  report += `## Summary\n\n`;
  report += `- **Total Bundle Size**: ${formatSize(stats.total)}\n`;
  report += `- **JavaScript Files**: ${stats.js.length}\n`;
  report += `- **CSS Files**: ${stats.css.length}\n\n`;

  report += `## JavaScript Files\n\n`;
  report += `| File | Size | Status |\n`;
  report += `|------|------|--------|\n`;

  for (const file of stats.js) {
    const status =
      file.name.includes('main') && file.sizeKB > BUNDLE_SIZE_LIMITS.main
        ? '⚠️ Over limit'
        : '✅ OK';
    report += `| ${file.name} | ${formatSize(file.size)} | ${status} |\n`;
  }

  report += `\n## CSS Files\n\n`;
  report += `| File | Size | Status |\n`;
  report += `|------|------|--------|\n`;

  for (const file of stats.css) {
    const status =
      file.name.includes('main') && file.sizeKB > BUNDLE_SIZE_LIMITS.css
        ? '⚠️ Over limit'
        : '✅ OK';
    report += `| ${file.name} | ${formatSize(file.size)} | ${status} |\n`;
  }

  report += `\n## Bundle Size Limits\n\n`;
  report += `- Main JS Bundle: ${BUNDLE_SIZE_LIMITS.main} KB\n`;
  report += `- Main CSS Bundle: ${BUNDLE_SIZE_LIMITS.css} KB\n`;
  report += `- Total Bundle: ${BUNDLE_SIZE_LIMITS.total} KB\n`;

  try {
    fs.writeFileSync(reportFile, report);
    log(`Bundle size report saved to ${reportFile}`, 'blue');
  } catch (error) {
    log(`Warning: Could not save bundle report: ${error.message}`, 'yellow');
  }
}

function main() {
  const isCI = process.argv.includes('--ci');

  log('📊 Bundle Size Analysis', 'bold');
  log('========================', 'blue');

  // Get bundle statistics
  const stats = getBundleStats();

  if (stats.js.length === 0 && stats.css.length === 0) {
    log('❌ No bundle files found. Make sure to run "npm run build" first.', 'red');
    process.exit(1);
  }

  // Display current bundle sizes
  log('\n📦 Current Bundle Sizes:', 'bold');

  if (stats.js.length > 0) {
    log('\nJavaScript Files:', 'blue');
    for (const file of stats.js.slice(0, 5)) {
      // Show top 5
      log(`  ${file.name}: ${formatSize(file.size)}`);
    }
    if (stats.js.length > 5) {
      log(`  ... and ${stats.js.length - 5} more files`);
    }
  }

  if (stats.css.length > 0) {
    log('\nCSS Files:', 'blue');
    for (const file of stats.css) {
      log(`  ${file.name}: ${formatSize(file.size)}`);
    }
  }

  log(`\nTotal Bundle Size: ${formatSize(stats.total)}`, 'bold');

  // Check against limits
  const { hasErrors, warnings, errors } = checkBundleSizes(stats);

  if (warnings.length > 0) {
    log('\n⚠️  Warnings:', 'yellow');
    for (const warning of warnings) {
      log(`  ${warning}`, 'yellow');
    }
  }

  if (errors.length > 0) {
    log('\n❌ Errors:', 'red');
    for (const error of errors) {
      log(`  ${error}`, 'red');
    }
  }

  if (!hasErrors && warnings.length === 0) {
    log('\n✅ All bundle sizes are within limits!', 'green');
  }

  // Save history and generate report
  if (!isCI) {
    saveBundleHistory(stats);
    generateReport(stats);
  }

  // Exit with error code if limits exceeded
  if (hasErrors && isCI) {
    log('\n💥 Bundle size limits exceeded! Please optimize your bundle.', 'red');
    process.exit(1);
  }

  log('\n🎉 Bundle size analysis complete!', 'green');
}

if (require.main === module) {
  main();
}

module.exports = { getBundleStats, checkBundleSizes, formatSize };
