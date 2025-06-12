#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Navigation components to remove
const OLD_NAVIGATION_COMPONENTS = [
  'TopNavigation',
  'TopNavbar',
  'Navbar',
  'MainNavigation',
  'SideNavigation',
  'BlockchainNavigation',
  'CreditApplicationNav',
  'PageHeader',
  'GlobalHeader',
];

// Files to exclude from migration
const EXCLUDE_FILES = [
  'UniversalNavigation.tsx',
  'App.tsx',
  '*.test.tsx',
  '*.test.ts',
  '*.spec.tsx',
  '*.spec.ts',
];

// Function to remove import statements
function removeNavigationImports(content) {
  const importRegex = new RegExp(
    `import\\s+(?:{[^}]*}|\\w+)\\s+from\\s+['"].*(?:${OLD_NAVIGATION_COMPONENTS.join('|')})['"];?`,
    'gm'
  );

  return content.replace(importRegex, '');
}

// Function to remove navigation component usage
function removeNavigationComponents(content) {
  OLD_NAVIGATION_COMPONENTS.forEach(component => {
    // Remove self-closing tags
    const selfClosingRegex = new RegExp(`<${component}[^>]*\\/?>`, 'g');
    content = content.replace(selfClosingRegex, '');

    // Remove opening and closing tags with content
    const fullTagRegex = new RegExp(`<${component}[^>]*>.*?<\\/${component}>`, 'gs');
    content = content.replace(fullTagRegex, '');
  });

  return content;
}

// Function to clean up empty lines
function cleanupEmptyLines(content) {
  // Replace multiple empty lines with single empty line
  return content.replace(/\n\s*\n\s*\n/g, '\n\n');
}

// Function to process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Remove navigation imports
    content = removeNavigationImports(content);

    // Remove navigation component usage
    content = removeNavigationComponents(content);

    // Clean up empty lines
    content = cleanupEmptyLines(content);

    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main migration function
function migrateToUniversalNavigation() {
  console.log('🚀 Starting migration to UniversalNavigation...\n');

  // Find all TypeScript/React files
  const files = glob.sync('src/**/*.{tsx,ts}', {
    ignore: EXCLUDE_FILES.map(pattern => `src/**/${pattern}`),
  });

  console.log(`Found ${files.length} files to process\n`);

  let updatedCount = 0;
  let errorCount = 0;

  files.forEach(file => {
    if (processFile(file)) {
      updatedCount++;
    } else {
      errorCount++;
    }
  });

  console.log('\n📊 Migration Summary:');
  console.log(`   Total files processed: ${files.length}`);
  console.log(`   Files updated: ${updatedCount}`);
  console.log(`   Files with errors: ${errorCount}`);
  console.log(`   Files unchanged: ${files.length - updatedCount - errorCount}`);

  // Generate report
  generateMigrationReport(files, updatedCount);
}

// Function to generate migration report
function generateMigrationReport(files, updatedCount) {
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: files.length,
    updatedFiles: updatedCount,
    oldComponents: OLD_NAVIGATION_COMPONENTS,
    processedFiles: files,
  };

  fs.writeFileSync('navigation-migration-report.json', JSON.stringify(report, null, 2), 'utf8');

  console.log('\n📄 Migration report saved to: navigation-migration-report.json');
}

// Function to list files that will be deleted
function listFilesToDelete() {
  const filesToDelete = [];

  OLD_NAVIGATION_COMPONENTS.forEach(component => {
    const componentFiles = glob.sync(`src/components/layout/${component}.{tsx,ts}`);
    filesToDelete.push(...componentFiles);
  });

  // Also include test files for old navigation components
  const testFiles = glob.sync('src/components/layout/__tests__/*Navigation*.{tsx,ts}');
  filesToDelete.push(...testFiles);

  console.log('\n🗑️  Files to be deleted after migration:');
  filesToDelete.forEach(file => {
    console.log(`   - ${file}`);
  });

  // Save list to file
  fs.writeFileSync('navigation-files-to-delete.txt', filesToDelete.join('\n'), 'utf8');

  console.log(`\n📄 List saved to: navigation-files-to-delete.txt`);

  return filesToDelete;
}

// Run migration
if (require.main === module) {
  console.log('🔍 Analyzing navigation components...\n');

  // Run the migration
  migrateToUniversalNavigation();

  // List files to delete
  listFilesToDelete();

  console.log('\n✨ Migration complete!');
  console.log('\n⚠️  Next steps:');
  console.log('   1. Review the changes in your git diff');
  console.log('   2. Test the application thoroughly');
  console.log(
    '   3. Delete old navigation component files listed in navigation-files-to-delete.txt'
  );
  console.log('   4. Update any navigation-related tests');
}

module.exports = {
  migrateToUniversalNavigation,
  listFilesToDelete,
};
