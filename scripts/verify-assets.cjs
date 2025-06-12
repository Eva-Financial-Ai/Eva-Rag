#!/usr/bin/env node

/**
 * Asset Verification Script
 * 
 * Verifies that all static assets are properly accessible in both 
 * CRA and Vite environments during the migration.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bold}${colors.cyan}${msg}${colors.reset}`),
};

// Asset configuration based on your project structure
const ASSET_CONFIG = {
  publicAssets: {
    logos: [
      'eva-favicon.png',
      'eva-logo.png', 
      'cyborgtransparent.png',
      'logo.png',
    ],
    icons: [
      'icons/admin-icon.svg',
      'icons/advisor-icon.svg',
      'icons/brain-icon.svg',
      'icons/favicon.svg',
      'icons/logo192.svg',
      'icons/logo512.svg',
      'icons/security-icon.svg',
      'icons/document-icon.svg',
      'icons/clock.svg',
      'icons/dollar.svg',
      'icons/checkmark.svg',
    ],
    manifest: 'manifest.json',
    fonts: [
      'fonts/bodoni-72-smallcaps/',
    ],
  },
  manifestAssets: [
    'eva-favicon.svg',
    'icons/logo192.svg', 
    'icons/logo512.svg',
    'screenshots/dashboard.png',
    'screenshots/credit-application.png',
  ],
  serviceWorkerAssets: [
    'icons/logo192.svg',
    'icons/favicon.svg',
  ],
};

/**
 * Check if a file or directory exists
 */
function checkFileExists(filePath, basePath = 'public') {
  const fullPath = path.join(process.cwd(), basePath, filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      log.success(`Directory exists: ${filePath}`);
    } else {
      const size = (stats.size / 1024).toFixed(2);
      log.success(`File exists: ${filePath} (${size} KB)`);
    }
  } else {
    log.error(`Missing: ${filePath}`);
  }
  
  return exists;
}

/**
 * Verify public directory assets
 */
function verifyPublicAssets() {
  log.title('\n🔍 Verifying Public Directory Assets');
  
  let totalAssets = 0;
  let foundAssets = 0;
  
  // Check logos
  log.info('\nLogos:');
  ASSET_CONFIG.publicAssets.logos.forEach(logo => {
    totalAssets++;
    if (checkFileExists(logo)) foundAssets++;
  });
  
  // Check icons
  log.info('\nIcons:');
  ASSET_CONFIG.publicAssets.icons.forEach(icon => {
    totalAssets++;
    if (checkFileExists(icon)) foundAssets++;
  });
  
  // Check manifest
  log.info('\nManifest:');
  totalAssets++;
  if (checkFileExists(ASSET_CONFIG.publicAssets.manifest)) foundAssets++;
  
  // Check fonts
  log.info('\nFonts:');
  ASSET_CONFIG.publicAssets.fonts.forEach(font => {
    totalAssets++;
    if (checkFileExists(font)) foundAssets++;
  });
  
  const percentage = ((foundAssets / totalAssets) * 100).toFixed(1);
  log.info(`\n📊 Found ${foundAssets}/${totalAssets} assets (${percentage}%)`);
  
  return { totalAssets, foundAssets };
}

/**
 * Verify manifest.json content
 */
function verifyManifest() {
  log.title('\n🔍 Verifying PWA Manifest');
  
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    log.error('manifest.json not found');
    return false;
  }
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Check required fields
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    let valid = true;
    
    requiredFields.forEach(field => {
      if (manifest[field]) {
        log.success(`Manifest has ${field}`);
      } else {
        log.error(`Manifest missing ${field}`);
        valid = false;
      }
    });
    
    // Check icon assets
    if (manifest.icons && Array.isArray(manifest.icons)) {
      log.info(`\nManifest Icons (${manifest.icons.length}):`);
      manifest.icons.forEach((icon, index) => {
        const iconPath = icon.src.startsWith('/') ? icon.src.slice(1) : icon.src;
        if (checkFileExists(iconPath)) {
          log.success(`  Icon ${index + 1}: ${icon.src} (${icon.sizes})`);
        } else {
          log.error(`  Icon ${index + 1}: ${icon.src} - FILE MISSING`);
          valid = false;
        }
      });
    }
    
    return valid;
  } catch (error) {
    log.error(`Failed to parse manifest.json: ${error.message}`);
    return false;
  }
}

/**
 * Verify asset utility imports
 */
function verifyAssetUtility() {
  log.title('\n🔍 Verifying Asset Utility');
  
  const utilityPath = path.join(process.cwd(), 'src', 'utils', 'assetUtils.ts');
  
  if (!fs.existsSync(utilityPath)) {
    log.error('assetUtils.ts not found');
    return false;
  }
  
  try {
    const utilityContent = fs.readFileSync(utilityPath, 'utf8');
    
    // Check for key functions
    const requiredFunctions = [
      'getAssetUrl',
      'getPublicUrl',
      'getDynamicAssetUrl',
      'getIconUrl',
      'getLogoUrl',
      'useAsset',
    ];
    
    let valid = true;
    requiredFunctions.forEach(func => {
      if (utilityContent.includes(`export const ${func}`) || utilityContent.includes(`${func}:`)) {
        log.success(`Asset utility has ${func}`);
      } else {
        log.error(`Asset utility missing ${func}`);
        valid = false;
      }
    });
    
    return valid;
  } catch (error) {
    log.error(`Failed to read assetUtils.ts: ${error.message}`);
    return false;
  }
}

/**
 * Test TypeScript compilation
 */
function testTypeScriptCompilation() {
  log.title('\n🔍 Testing TypeScript Compilation');
  
  try {
    // Try to compile TypeScript without emitting files
    execSync('npx tsc --noEmit --skipLibCheck', { 
      stdio: 'pipe',
      cwd: process.cwd(),
    });
    log.success('TypeScript compilation successful');
    return true;
  } catch (error) {
    log.error('TypeScript compilation failed');
    log.info('Run `npx tsc --noEmit` for detailed errors');
    return false;
  }
}

/**
 * Test build systems
 */
function testBuildSystems() {
  log.title('\n🔍 Testing Build Systems');
  
  const results = {
    cra: false,
    vite: false,
  };
  
  // Test CRA build (if available)
  try {
    log.info('Testing CRA build...');
    execSync('npm run build 2>/dev/null', { 
      stdio: 'pipe',
      cwd: process.cwd(),
      timeout: 60000, // 1 minute timeout
    });
    log.success('CRA build successful');
    results.cra = true;
  } catch (error) {
    log.warning('CRA build not available or failed');
  }
  
  // Test Vite build
  try {
    log.info('Testing Vite build...');
    execSync('npm run build:vite 2>/dev/null', { 
      stdio: 'pipe',
      cwd: process.cwd(),
      timeout: 60000, // 1 minute timeout
    });
    log.success('Vite build successful');
    results.vite = true;
  } catch (error) {
    log.warning('Vite build not available or failed');
  }
  
  return results;
}

/**
 * Verify build outputs
 */
function verifyBuildOutput() {
  log.title('\n🔍 Verifying Build Output');
  
  const buildDir = path.join(process.cwd(), 'build');
  
  if (!fs.existsSync(buildDir)) {
    log.error('Build directory not found');
    return false;
  }
  
  // Check for required build files
  const requiredFiles = [
    'index.html',
    'static',
    'manifest.json',
  ];
  
  let valid = true;
  requiredFiles.forEach(file => {
    const filePath = path.join(buildDir, file);
    if (fs.existsSync(filePath)) {
      log.success(`Build contains: ${file}`);
    } else {
      log.error(`Build missing: ${file}`);
      valid = false;
    }
  });
  
  // Check if static assets are copied
  ASSET_CONFIG.publicAssets.logos.forEach(logo => {
    const assetPath = path.join(buildDir, logo);
    if (fs.existsSync(assetPath)) {
      log.success(`Build contains asset: ${logo}`);
    } else {
      log.warning(`Build missing asset: ${logo}`);
    }
  });
  
  return valid;
}

/**
 * Generate asset report
 */
function generateReport(results) {
  log.title('\n📊 Asset Verification Report');
  
  const { publicAssets, manifest, utility, typescript, builds, buildOutput } = results;
  
  console.log(`
${colors.bold}Public Assets:${colors.reset} ${publicAssets.foundAssets}/${publicAssets.totalAssets} found
${colors.bold}Manifest Valid:${colors.reset} ${manifest ? '✅' : '❌'}
${colors.bold}Asset Utility:${colors.reset} ${utility ? '✅' : '❌'}
${colors.bold}TypeScript:${colors.reset} ${typescript ? '✅' : '❌'}
${colors.bold}CRA Build:${colors.reset} ${builds.cra ? '✅' : '⚠️'}
${colors.bold}Vite Build:${colors.reset} ${builds.vite ? '✅' : '❌'}
${colors.bold}Build Output:${colors.reset} ${buildOutput ? '✅' : '❌'}
  `);
  
  const score = [
    publicAssets.foundAssets === publicAssets.totalAssets,
    manifest,
    utility,
    typescript,
    builds.vite, // Vite is required
    buildOutput,
  ].filter(Boolean).length;
  
  const maxScore = 6;
  const percentage = ((score / maxScore) * 100).toFixed(1);
  
  if (percentage >= 90) {
    log.success(`🎉 Asset migration score: ${score}/${maxScore} (${percentage}%) - Excellent!`);
  } else if (percentage >= 75) {
    log.warning(`⚠️  Asset migration score: ${score}/${maxScore} (${percentage}%) - Good, but needs improvement`);
  } else {
    log.error(`❌ Asset migration score: ${score}/${maxScore} (${percentage}%) - Issues need to be addressed`);
  }
  
  // Recommendations
  if (!builds.vite) {
    log.warning('\n💡 Recommendation: Set up Vite build system');
  }
  if (publicAssets.foundAssets < publicAssets.totalAssets) {
    log.warning('\n💡 Recommendation: Add missing public assets');
  }
  if (!utility) {
    log.warning('\n💡 Recommendation: Implement asset utility functions');
  }
}

/**
 * Main verification function
 */
async function main() {
  console.log(`${colors.bold}${colors.cyan}🔍 EVA AI Asset Verification${colors.reset}\n`);
  
  const results = {
    publicAssets: verifyPublicAssets(),
    manifest: verifyManifest(),
    utility: verifyAssetUtility(),
    typescript: testTypeScriptCompilation(),
    builds: testBuildSystems(),
    buildOutput: verifyBuildOutput(),
  };
  
  generateReport(results);
  
  // Exit with error code if critical issues found
  const critical = results.utility && results.typescript && results.builds.vite;
  process.exit(critical ? 0 : 1);
}

// Run verification
if (require.main === module) {
  main().catch(error => {
    log.error(`Verification failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  verifyPublicAssets,
  verifyManifest,
  verifyAssetUtility,
  testBuildSystems,
}; 