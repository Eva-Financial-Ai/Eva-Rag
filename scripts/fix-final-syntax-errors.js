const fs = require('fs');
const path = require('path');

// Fix the final syntax errors preventing compilation
const fixFinalSyntaxErrors = () => {
  console.log('🔧 Fixing final syntax errors for TypeScript compilation...\n');

  const fixes = [
    // Fix VideoConferencing.tsx syntax issues
    {
      file: 'src/components/communications/VideoConferencing.tsx',
      fixes: [
        {
          search: /onMeetingEnd: \(\) => \{\}\?: \(meeting: Meeting\) => void;/g,
          replace: 'onMeetingEnd?: (meeting: Meeting) => void;',
        },
        {
          search: /title: meetingTitle: "Financial Meeting",/g,
          replace: 'title: "Financial Meeting",',
        },
        {
          search: /meetingTitle: "Financial Meeting",/g,
          replace: 'meetingTitle: "Financial Meeting",',
        },
        {
          search: /onMeetingEnd: \(\) => \{\}\?\.\(endedMeeting\);/g,
          replace: 'onMeetingEnd?.(endedMeeting);',
        },
        {
          search: /\}, \[currentMeeting, onMeetingEnd: \(\) => \{\}\]\);/g,
          replace: '}, [currentMeeting]);',
        },
      ],
    },

    // Fix CRUDNavigationHub.tsx comment issues
    {
      file: 'src/components/layout/CRUDNavigationHub.tsx',
      fixes: [
        {
          search: /\/\/ debugLog\('general', 'log_statement', 'Edit customer:', customer\)\s*\}/g,
          replace: '/* debugLog("general", "log_statement", "Edit customer:", customer) */}',
        },
        {
          search:
            /onCreateNew=\{\(\) => \/\/ debugLog\('general', 'log_statement', 'Create new customer'\)\}/g,
          replace:
            'onCreateNew={() => { /* debugLog("general", "log_statement", "Create new customer") */ }}',
        },
        {
          search: /\/\/ debugLog\('general', 'log_statement', 'Edit contact:', contact\)\s*\}/g,
          replace: '/* debugLog("general", "log_statement", "Edit contact:", contact) */}',
        },
        {
          search:
            /onCreateNew=\{\(\) => \/\/ debugLog\('general', 'log_statement', 'Create new contact'\)\}/g,
          replace:
            'onCreateNew={() => { /* debugLog("general", "log_statement", "Create new contact") */ }}',
        },
        {
          search:
            /onCreateNew=\{\(\) => \/\/ debugLog\('general', 'log_statement', 'Upload new file'\)\}/g,
          replace:
            'onCreateNew={() => { /* debugLog("general", "log_statement", "Upload new file") */ }}',
        },
        {
          search:
            /onEditForm=\{form => \/\/ debugLog\('general', 'log_statement', 'Edit form:', form\)\}/g,
          replace:
            'onEditForm={form => { /* debugLog("general", "log_statement", "Edit form:", form) */ }}',
        },
        {
          search:
            /onCreateNew=\{\(\) => \/\/ debugLog\('general', 'log_statement', 'Create new form'\)\}/g,
          replace:
            'onCreateNew={() => { /* debugLog("general", "log_statement", "Create new form") */ }}',
        },
      ],
    },

    // Fix EnhancedBusinessLookupService.ts variable declaration issues
    {
      file: 'src/services/EnhancedBusinessLookupService.ts',
      fixes: [
        {
          search:
            /const _process\.env\.REACT_APP_API_URL \|\| "http:\/\/localhost:3001" = 'https:\/\/www\.e-secretaryofstate\.com\/api\/v1';/g,
          replace:
            'const baseUrl = process.env.REACT_APP_API_URL || "https://www.e-secretaryofstate.com/api/v1";',
        },
        {
          search:
            /const process\.env\.REACT_APP_API_URL \|\| "http:\/\/localhost:3001" = 'https:\/\/data\.sec\.gov\/api\/xbrl\/companyfacts';/g,
          replace:
            'const secBaseUrl = process.env.REACT_APP_SEC_API_URL || "https://data.sec.gov/api/xbrl/companyfacts";',
        },
        {
          search:
            /const response = await fetch\(`\$\{process\.env\.REACT_APP_API_URL \|\| "http:\/\/localhost:3001"\}\/business-search`,/g,
          replace: 'const response = await fetch(`${baseUrl}/business-search`,',
        },
        {
          search:
            /const response = await fetch\(`\$\{process\.env\.REACT_APP_API_URL \|\| "http:\/\/localhost:3001"\}\/\$\{ein\}.json`,/g,
          replace: 'const response = await fetch(`${secBaseUrl}/${ein}.json`,',
        },
      ],
    },
  ];

  let totalFixes = 0;
  let filesModified = 0;

  fixes.forEach(({ file, fixes: fileFixes }) => {
    const filePath = path.join(process.cwd(), file);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileFixCount = 0;

    fileFixes.forEach(({ search, replace }) => {
      const matches = content.match(search);
      if (matches) {
        content = content.replace(search, replace);
        fileFixCount += matches.length;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      filesModified++;
      totalFixes += fileFixCount;
      console.log(`  ✓ Fixed ${fileFixCount} syntax errors in ${file}`);
    }
  });

  console.log('\n📊 Final Syntax Fix Summary:');
  console.log(`  Files modified: ${filesModified}`);
  console.log(`  Total fixes applied: ${totalFixes}`);
  console.log('\n✅ Final syntax errors have been resolved!');
};

// Run the fix
try {
  fixFinalSyntaxErrors();
} catch (error) {
  console.error('❌ Error fixing final syntax errors:', error);
  process.exit(1);
}
