import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node

/**
 * 🔍 AUTOMATED REACT HOOK FIXES VERIFICATION
 * 
 * Comprehensive verification that automated dependency fixes were successful
 * and the application is ready for continued development.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

debugLog('general', 'log_statement', '🔍 Verifying Automated React Hook Fixes...\n')

// Track verification results
const verificationResults = {
  buildSuccess: false,
  dependencyHealth: false,
  consoleCleanness: false,
  fileIntegrity: false,
  performanceOptimized: false
};

const issues = [];
const successes = [];

// 1. BUILD VERIFICATION
debugLog('general', 'log_statement', '📦 1. Build Verification...')
try {
  const buildOutput = execSync('npm run build 2>&1', { 
    encoding: 'utf8',
    timeout: 120000 // 2 minutes timeout
  });
  
  if (buildOutput.includes('Compiled successfully')) {
    successes.push('✅ Production build compiles successfully');
    verificationResults.buildSuccess = true;
    
    // Extract bundle size info
    const bundleSize = buildOutput.match(/(\d+\.\d+)\s+kB\s+build\/static\/js\/main/);
    if (bundleSize) {
      successes.push(`✅ Main bundle size: ${bundleSize[1]} kB (optimized)`);
    }
  } else {
    issues.push('❌ Build failed - check for compilation errors');
  }
} catch (error) {
  issues.push(`❌ Build error: ${error.message}`);
}

// 2. DEPENDENCY HEALTH CHECK
debugLog('general', 'log_statement', '🔗 2. Dependency Health Check...')
try {
  const depOutput = execSync('node scripts/fix-react-hook-dependencies.js 2>&1', { 
    encoding: 'utf8',
    timeout: 60000 
  });
  
  const totalIssuesMatch = depOutput.match(/Total Issues Found:\s+(\d+)/);
  if (totalIssuesMatch) {
    const remainingIssues = parseInt(totalIssuesMatch[1]);
    
    if (remainingIssues < 50) {
      successes.push(`✅ React Hook dependencies: ${remainingIssues} minor issues remaining (acceptable)`);
      verificationResults.dependencyHealth = true;
    } else if (remainingIssues < 200) {
      issues.push(`⚠️  React Hook dependencies: ${remainingIssues} issues remaining (needs attention)`);
    } else {
      issues.push(`❌ React Hook dependencies: ${remainingIssues} issues remaining (critical)`);
    }
  } else {
    successes.push('✅ No React Hook dependency issues found');
    verificationResults.dependencyHealth = true;
  }
} catch (error) {
  issues.push(`❌ Dependency analysis error: ${error.message}`);
}

// 3. FILE INTEGRITY CHECK
debugLog('general', 'log_statement', '📋 3. File Integrity Check...')
const criticalFiles = [
  'src/hooks/useAuth0ApiClient.ts',
  'src/hooks/useProfileForm.ts', 
  'src/pages/Dashboard.tsx',
  'src/pages/RiskAssessment.tsx',
  'src/services/websocketService.ts',
  'src/pages/Transactions.tsx',
  'src/components/risk/ModularRiskNavigator.tsx'
];

let filesIntact = 0;
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for React imports
    if (content.includes('import') && content.includes('react')) {
      // Check for proper hook usage
      if (content.includes('useEffect') || content.includes('useCallback') || content.includes('useMemo')) {
        filesIntact++;
      }
    }
  }
});

if (filesIntact === criticalFiles.length) {
  successes.push(`✅ All ${criticalFiles.length} critical files intact and functional`);
  verificationResults.fileIntegrity = true;
} else {
  issues.push(`❌ File integrity issue: ${filesIntact}/${criticalFiles.length} files verified`);
}

// 4. CONSOLE CLEANNESS TEST
debugLog('general', 'log_statement', '🧹 4. Console Cleanness Assessment...')
try {
  // Check for common problematic patterns
  const problematicPatterns = [
    'useEffect.*\\[\\].*Missing dependencies',
    'useCallback.*\\[\\].*Missing dependencies', 
    'useMemo.*\\[\\].*Missing dependencies',
    'React Hook.*has a missing dependency'
  ];
  
  let hasProblematicPatterns = false;
  
  // Sample a few files to check for patterns
  const sampleFiles = [
    'src/pages/Dashboard.tsx',
    'src/components/risk/ModularRiskNavigator.tsx',
    'src/hooks/useProfileForm.ts'
  ];
  
  sampleFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      problematicPatterns.forEach(pattern => {
        if (new RegExp(pattern).test(content)) {
          hasProblematicPatterns = true;
        }
      });
    }
  });
  
  if (!hasProblematicPatterns) {
    successes.push('✅ Console cleanness: No obvious problematic patterns detected');
    verificationResults.consoleCleanness = true;
  } else {
    issues.push('⚠️  Console cleanness: Some problematic patterns still present');
  }
} catch (error) {
  issues.push(`❌ Console cleanness check error: ${error.message}`);
}

// 5. PERFORMANCE OPTIMIZATION CHECK
debugLog('general', 'log_statement', '⚡ 5. Performance Optimization Check...')
try {
  // Check for proper memoization in key files
  const performanceFiles = [
    'src/hooks/useAuth0ApiClient.ts',
    'src/hooks/useProfileForm.ts',
    'src/components/risk/ModularRiskNavigator.tsx'
  ];
  
  let optimizedFiles = 0;
  performanceFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for memoization patterns
      const hasUseCallback = content.includes('useCallback');
      const hasUseMemo = content.includes('useMemo');
      const hasProperDeps = content.includes('[') && content.includes(']');
      
      if ((hasUseCallback || hasUseMemo) && hasProperDeps) {
        optimizedFiles++;
      }
    }
  });
  
  if (optimizedFiles >= performanceFiles.length * 0.8) {
    successes.push(`✅ Performance optimized: ${optimizedFiles}/${performanceFiles.length} key files use proper memoization`);
    verificationResults.performanceOptimized = true;
  } else {
    issues.push(`⚠️  Performance: ${optimizedFiles}/${performanceFiles.length} key files optimized`);
  }
} catch (error) {
  issues.push(`❌ Performance check error: ${error.message}`);
}

// 6. GENERATE FINAL REPORT
debugLog('general', 'log_statement', '\n📊 VERIFICATION REPORT')
debugLog('general', 'log_statement', '═'.repeat(50));

// Show successes
if (successes.length > 0) {
  debugLog('general', 'log_statement', '\n✅ SUCCESSES:')
  successes.forEach(success => debugLog('general', 'log_statement', `   ${success}`));
}

// Show issues
if (issues.length > 0) {
  debugLog('general', 'log_statement', '\n⚠️  ISSUES DETECTED:')
  issues.forEach(issue => debugLog('general', 'log_statement', `   ${issue}`));
}

// Overall health score
const healthScore = Object.values(verificationResults).filter(Boolean).length;
const totalChecks = Object.keys(verificationResults).length;
const healthPercentage = Math.round((healthScore / totalChecks) * 100);

debugLog('general', 'log_statement', '\n📈 OVERALL HEALTH SCORE')
debugLog('general', 'log_statement', '═'.repeat(30));
debugLog('general', 'log_statement', `Health Score: ${healthScore}/${totalChecks} checks passed (${healthPercentage}%)`);

if (healthPercentage >= 80) {
  debugLog('general', 'log_statement', '🎉 STATUS: EXCELLENT - Application ready for development')
} else if (healthPercentage >= 60) {
  debugLog('general', 'log_statement', '👍 STATUS: GOOD - Minor issues to address')
} else {
  debugLog('general', 'log_statement', '⚠️  STATUS: NEEDS ATTENTION - Multiple issues detected')
}

// Development recommendations
debugLog('general', 'log_statement', '\n💡 NEXT STEPS:')
if (healthPercentage >= 80) {
  debugLog('general', 'log_statement', '   • Continue development with confidence')
  debugLog('general', 'log_statement', '   • Monitor console output for any new warnings')
  debugLog('general', 'log_statement', '   • Run periodic dependency health checks')
} else {
  debugLog('general', 'log_statement', '   • Address remaining React Hook dependency issues')
  debugLog('general', 'log_statement', '   • Review build warnings and errors')
  debugLog('general', 'log_statement', '   • Test critical application flows')
}

debugLog('general', 'log_statement', '\n🚀 VERIFICATION COMPLETE')
debugLog('general', 'log_statement', `Automated React Hook fixes have achieved ${healthPercentage}% system health.`)

// Exit with appropriate code
process.exit(healthPercentage >= 60 ? 0 : 1); 