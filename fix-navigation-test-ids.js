import { debugLog } from '../utils/auditLogger';

#!/usr/bin/env node

// Script to add test IDs to navigation items for better testing
// This script will update the SideNavigation.tsx file to include data-testid attributes

const fs = require('fs');
const path = require('path');

const navigationFile = path.join(__dirname, 'src/components/layout/SideNavigation.tsx');

// Test ID mapping for navigation items
const testIdMappings = {
  Dashboard: 'nav-dashboard',
  'Eva AI Assistant': 'nav-ai-assistant',
  'Credit Application': 'nav-credit-application',
  'Auto Originations': 'nav-auto-originations',
  'Transaction Summary': 'nav-transaction-summary',
  'New Origination': 'nav-new-origination',
  'Customer Retention': 'nav-customer-retention',
  Customers: 'nav-customers',
  Businesses: 'nav-businesses',
  'Business Owners': 'nav-business-owners',
  'Asset Sellers': 'nav-asset-sellers',
  'Brokers & Originators': 'nav-brokers-originators',
  'Service Providers': 'nav-service-providers',
  Contacts: 'nav-contacts',
  Commitments: 'nav-commitments',
  'Calendar Integration': 'nav-calendar',
  'Post Closing Customers': 'nav-post-closing',
  'Filelock Drive': 'nav-filelock-drive',
  'Document Management': 'nav-document-management',
  'Shield Vault': 'nav-shield-vault',
  'Safe Forms': 'nav-safe-forms',
  'Risk Map Navigator': 'nav-risk-map',
  'EVA Risk Report & Score': 'nav-eva-risk-report',
  RiskLab: 'nav-risklab',
  'Deal Structuring': 'nav-deal-structuring',
  'Structure Editor': 'nav-structure-editor',
  'Smart Match': 'nav-smart-match',
  'Transaction Execution': 'nav-transaction-execution',
  'Asset Press': 'nav-asset-press',
  'Asset Marketplace': 'nav-asset-marketplace',
  'Portfolio Navigator': 'nav-portfolio-navigator',
  'Portfolio Wallet': 'nav-portfolio-wallet',
  'Asset Portfolio': 'nav-asset-portfolio',
  'Demo Mode': 'nav-demo-mode',
  'Team Management': 'nav-team-management',
};

function addTestIds() {
  try {
    // Read the current file
    let content = fs.readFileSync(navigationFile, 'utf8');

    debugLog('general', 'log_statement', '🔍 Adding test IDs to navigation items...')

    // Add test ID generation function
    const testIdFunction = `
  // Generate test ID for navigation items
  const getTestId = (itemName: string): string => {
    const testIdMap: Record<string, string> = {
      'Dashboard': 'nav-dashboard',
      'Eva AI Assistant': 'nav-ai-assistant',
      'Credit Application': 'nav-credit-application',
      'Auto Originations': 'nav-auto-originations',
      'Transaction Summary': 'nav-transaction-summary',
      'New Origination': 'nav-new-origination',
      'Customer Retention': 'nav-customer-retention',
      'Customers': 'nav-customers',
      'Businesses': 'nav-businesses',
      'Business Owners': 'nav-business-owners',
      'Asset Sellers': 'nav-asset-sellers',
      'Brokers & Originators': 'nav-brokers-originators',
      'Service Providers': 'nav-service-providers',
      'Contacts': 'nav-contacts',
      'Commitments': 'nav-commitments',
      'Calendar Integration': 'nav-calendar',
      'Post Closing Customers': 'nav-post-closing',
      'Filelock Drive': 'nav-filelock-drive',
      'Document Management': 'nav-document-management',
      'Shield Vault': 'nav-shield-vault',
      'Safe Forms': 'nav-safe-forms',
      'Risk Map Navigator': 'nav-risk-map',
      'EVA Risk Report & Score': 'nav-eva-risk-report',
      'RiskLab': 'nav-risklab',
      'Deal Structuring': 'nav-deal-structuring',
      'Structure Editor': 'nav-structure-editor',
      'Smart Match': 'nav-smart-match',
      'Transaction Execution': 'nav-transaction-execution',
      'Asset Press': 'nav-asset-press',
      'Asset Marketplace': 'nav-asset-marketplace',
      'Portfolio Navigator': 'nav-portfolio-navigator',
      'Portfolio Wallet': 'nav-portfolio-wallet',
      'Asset Portfolio': 'nav-asset-portfolio',
      'Demo Mode': 'nav-demo-mode',
      'Team Management': 'nav-team-management'
    };

    return testIdMap[itemName] || \`nav-\${itemName.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '')}\`;
  };
`;

    // Insert the function after the component declaration
    const componentDeclaration = 'const SideNavigation: React.FC<SideNavigationProps> = ({';
    const insertionPoint = content.indexOf(componentDeclaration);

    if (insertionPoint !== -1) {
      const afterDeclaration = content.indexOf('}) => {', insertionPoint) + '}) => {'.length;
      content =
        content.slice(0, afterDeclaration) + testIdFunction + content.slice(afterDeclaration);
    }

    // Add data-testid to button elements in renderNavItem function
    const buttonPattern = /<button\s+className={styleClasses}/g;
    content = content.replace(buttonPattern, match => {
      return `<button
          data-testid={getTestId(itemName)}
          className={styleClasses}`;
    });

    // Add data-testid to Link elements in renderNavItem function
    const linkPattern = /<Link\s+to={itemPath}\s+className={styleClasses}/g;
    content = content.replace(linkPattern, match => {
      return `<Link
          to={itemPath}
          data-testid={getTestId(itemName)}
          className={styleClasses}`;
    });

    // Add data-testid to submenu buttons
    const submenuButtonPattern =
      /<button\s+onClick={e => {\s+e\.preventDefault\(\);\s+console\.log\(`Toggle clicked: \${itemName}`\);\s+toggleFn\(\);\s+}}\s+className={`w-full \${styleClasses} flex items-center justify-between`}/g;
    content = content.replace(submenuButtonPattern, match => {
      return `<button
        data-testid={\`\${getTestId(itemName)}-toggle\`}
        onClick={e => {
          e.preventDefault();
          debugLog('general', 'log_statement', \`Toggle clicked: \${itemName}\`)
          toggleFn();
        }}
        className={\`w-full \${styleClasses} flex items-center justify-between\`}`;
    });

    // Add data-testid to sidebar toggle button
    const sidebarTogglePattern =
      /<button\s+onClick={toggleSidebar}\s+className={`\${isMobile \? 'absolute right-4 top-4 z-50' : 'absolute -right-4 top-12'} bg-white border border-gray-200 rounded-full p-2 shadow-md z-10 hover:shadow-lg transition-all`}/g;
    content = content.replace(sidebarTogglePattern, match => {
      return `<button
      data-testid="sidebar-toggle"
      onClick={toggleSidebar}
      className={\`\${isMobile ? 'absolute right-4 top-4 z-50' : 'absolute -right-4 top-12'} bg-white border border-gray-200 rounded-full p-2 shadow-md z-10 hover:shadow-lg transition-all\`}`;
    });

    // Write the updated content back to the file
    fs.writeFileSync(navigationFile, content, 'utf8');

    debugLog('general', 'log_statement', '✅ Successfully added test IDs to navigation items')
    debugLog('general', 'log_statement', '📝 Updated file:', navigationFile)

    // Generate summary
    const testIdCount = Object.keys(testIdMappings).length;
    debugLog('general', 'log_statement', `🎯 Added ${testIdCount} test ID mappings`)

    debugLog('general', 'log_statement', '\n📋 Test IDs added:')
    Object.entries(testIdMappings).forEach(([name, testId]) => {
      debugLog('general', 'log_statement', `   ${name} → ${testId}`)
    });

    debugLog('general', 'log_statement', '\n🧪 Usage in tests:')
    debugLog('general', 'log_statement', '   const dashboardLink = screen.getByTestId("nav-dashboard")');
    debugLog('general', 'log_statement', '   const creditAppToggle = screen.getByTestId("nav-credit-application-toggle")');
    debugLog('general', 'log_statement', '   const sidebarToggle = screen.getByTestId("sidebar-toggle")');
  } catch (error) {
    console.error('❌ Error adding test IDs:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  addTestIds();
}

module.exports = { addTestIds, testIdMappings };
