#!/usr/bin/env node

// Script to fix EVA AI interface issues
// This script addresses navigation and widget access problems

const fs = require('fs');
const path = require('path');

const fixes = {
  // Fix 1: Remove duplicate AI Assistant rendering in App.tsx
  fixDuplicateAIAssistantRendering: () => {
    const appPath = 'src/App.tsx';

    try {
      let content = fs.readFileSync(appPath, 'utf8');

      // Remove the duplicate rendering of AIAssistantPage in App.tsx
      const duplicateRenderingPattern =
        /\s*{\/\* Render the new AIAssistantPage globally \*\/}\s*{\/\* This page now handles its own visibility and state \*\/}\s*{location\.pathname === '\/ai-assistant' && <AIAssistantPage \/>}/g;

      if (content.includes("location.pathname === '/ai-assistant' && <AIAssistantPage />")) {
        content = content.replace(duplicateRenderingPattern, '');

        // Also remove any standalone duplicate line
        content = content.replace(
          /\s*{location\.pathname === '\/ai-assistant' && <AIAssistantPage \/>}/g,
          ''
        );

        fs.writeFileSync(appPath, content, 'utf8');
        debugLog('general', 'log_statement', '✅ Fixed duplicate AI Assistant rendering in App.tsx')
      } else {
        debugLog('general', 'log_statement', 'ℹ️  No duplicate AI Assistant rendering found in App.tsx')
      }
    } catch (error) {
      console.error('❌ Error fixing App.tsx:', error.message);
    }
  },

  // Fix 2: Ensure EVA Assistant components exist and are properly imported
  checkEVAComponents: () => {
    const componentsToCheck = [
      'src/components/EVAAssistantWithCustomAgents.tsx',
      'src/components/EVAAssistantManager.tsx',
      'src/components/EVAAssistantChat.tsx',
      'src/components/CreateCustomAIAgent.tsx',
      'src/pages/AIAssistantPage.tsx',
    ];

    debugLog('general', 'log_statement', '\n🔍 Checking EVA AI components...')

    let allComponentsExist = true;
    componentsToCheck.forEach(componentPath => {
      if (fs.existsSync(componentPath)) {
        debugLog('general', 'log_statement', `✅ ${componentPath} - EXISTS`)
      } else {
        debugLog('general', 'log_statement', `❌ ${componentPath} - MISSING`)
        allComponentsExist = false;
      }
    });

    return allComponentsExist;
  },

  // Fix 3: Create missing CreateCustomAIAgent component if it doesn't exist
  createMissingComponents: () => {
    const createCustomAIAgentPath = 'src/components/CreateCustomAIAgent.tsx';

    if (!fs.existsSync(createCustomAIAgentPath)) {
      const createCustomAIAgentContent = `import React, { useState } from 'react';
import { CustomAgentConfig } from './EVAAssistantWithCustomAgents';

import { debugLog } from '../utils/auditLogger';

interface CreateCustomAIAgentProps {
  isOpen: boolean;
  onSave: (agent: CustomAgentConfig) => void;
  onCancel: () => void;
}

const CreateCustomAIAgent: React.FC<CreateCustomAIAgentProps> = ({
  isOpen,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    icon: '🤖',
    formats: ['text'],
    tone: 'professional',
    length: 'medium',
    dataOptions: ['general'],
    priorityFeatures: '',
    performanceGoals: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAgent: CustomAgentConfig = {
      id: \`custom-\${Date.now()}\`,
      name: formData.name,
      fullName: formData.fullName,
      icon: formData.icon,
      formats: formData.formats,
      tone: formData.tone,
      length: formData.length,
      dataOptions: formData.dataOptions,
      priorityFeatures: formData.priorityFeatures,
      performanceGoals: formData.performanceGoals,
    };

    onSave(newAgent);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Custom AI Agent</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agent Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter agent name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full agent name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter emoji or icon"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            <textarea
              value={formData.priorityFeatures}
              onChange={(e) => setFormData({ ...formData, priorityFeatures: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what this agent specializes in"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomAIAgent;`;

      try {
        fs.writeFileSync(createCustomAIAgentPath, createCustomAIAgentContent, 'utf8');
        debugLog('general', 'log_statement', '✅ Created missing CreateCustomAIAgent component')
      } catch (error) {
        console.error('❌ Error creating CreateCustomAIAgent component:', error.message);
      }
    } else {
      debugLog('general', 'log_statement', 'ℹ️  CreateCustomAIAgent component already exists')
    }
  },

  // Fix 4: Verify navigation configuration
  verifyNavigationConfig: () => {
    const sideNavPath = 'src/components/layout/SideNavigation.tsx';

    try {
      const content = fs.readFileSync(sideNavPath, 'utf8');

      if (
        content.includes("href: '/ai-assistant'") &&
        content.includes("safeNavigate('/ai-assistant')")
      ) {
        debugLog('general', 'log_statement', '✅ EVA AI Assistant navigation is properly configured')
        return true;
      } else {
        debugLog('general', 'log_statement', '❌ EVA AI Assistant navigation configuration is missing')
        return false;
      }
    } catch (error) {
      console.error('❌ Error checking navigation config:', error.message);
      return false;
    }
  },

  // Fix 5: Verify route configuration
  verifyRouteConfig: () => {
    const routerPath = 'src/components/routing/LoadableRouter.tsx';

    try {
      const content = fs.readFileSync(routerPath, 'utf8');

      if (content.includes('path="/ai-assistant"') && content.includes('<AIAssistantPage />')) {
        debugLog('general', 'log_statement', '✅ EVA AI Assistant route is properly configured')
        return true;
      } else {
        debugLog('general', 'log_statement', '❌ EVA AI Assistant route configuration is missing')
        return false;
      }
    } catch (error) {
      console.error('❌ Error checking route config:', error.message);
      return false;
    }
  },

  // Fix 6: Create a test script for EVA AI interface
  createTestScript: () => {
    const testContent = `// EVA AI Interface Test Script
// Run this in the browser console to test EVA AI functionality

const testEVAAI = {
  // Test navigation to AI Assistant
  testNavigation: () => {
    debugLog('general', 'log_statement', '🔍 Testing EVA AI navigation...')

    // Test direct navigation
    try {
      window.location.href = '/ai-assistant';
      debugLog('general', 'log_statement', '✅ Navigation to /ai-assistant successful')
    } catch (error) {
      console.error('❌ Navigation failed:', error);
    }
  },

  // Test if EVA components are loaded
  testComponentsLoaded: () => {
    debugLog('general', 'log_statement', '🔍 Testing if EVA components are loaded...')

    // Check if EVA Assistant elements exist
    const evaElements = [
      '[data-testid="eva-assistant-with-custom-agents"]',
      '.eva-assistant-manager',
      'button[title*="EVA Assistant"]'
    ];

    let foundElements = 0;
    evaElements.forEach(selector => {
      const element = document.querySelector(selector);
             if (element) {
         debugLog('general', 'log_statement', '✅ Found element: ' + selector)
         foundElements++;
       } else {
         debugLog('general', 'log_statement', '❌ Missing element: ' + selector)
       }
     });

     debugLog('general', 'log_statement', '📊 Found ' + foundElements + '/' + evaElements.length + ' EVA elements')
    return foundElements;
  },

  // Test EVA widget functionality
  testWidget: () => {
    debugLog('general', 'log_statement', '🔍 Testing EVA widget functionality...')

    // Look for EVA widget button
    const widgetButton = document.querySelector('button[title*="EVA Assistant"]');
    if (widgetButton) {
      debugLog('general', 'log_statement', '✅ EVA widget button found')

      // Test click functionality
      try {
        widgetButton.click();
        debugLog('general', 'log_statement', '✅ EVA widget click successful')
      } catch (error) {
        console.error('❌ EVA widget click failed:', error);
      }
    } else {
      debugLog('general', 'log_statement', '❌ EVA widget button not found')
    }
  },

  // Run all tests
  runAllTests: () => {
    debugLog('general', 'log_statement', '🚀 Running all EVA AI tests...')

    this.testNavigation();
    setTimeout(() => {
      this.testComponentsLoaded();
      this.testWidget();
    }, 2000);
  }
};

// Auto-run tests
debugLog('general', 'log_statement', 'EVA AI Test Script Loaded!')
debugLog('general', 'log_statement', 'Run testEVAAI.runAllTests() to test all functionality');

// Make available globally
window.testEVAAI = testEVAAI;`;

    try {
      fs.writeFileSync('eva-ai-test.js', testContent, 'utf8');
      debugLog('general', 'log_statement', '✅ Created EVA AI test script: eva-ai-test.js')
    } catch (error) {
      console.error('❌ Error creating test script:', error.message);
    }
  },

  // Fix 7: Check for any import errors in EVA components
  checkImportErrors: () => {
    const filesToCheck = [
      'src/pages/AIAssistantPage.tsx',
      'src/components/EVAAssistantWithCustomAgents.tsx',
      'src/components/EVAAssistantManager.tsx',
    ];

    debugLog('general', 'log_statement', '\n🔍 Checking for import errors in EVA components...')

    filesToCheck.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');

          // Check for common import issues
          const imports = content.match(/import.*from.*['"][^'"]+['"]/g) || [];
          let hasIssues = false;

          imports.forEach(importLine => {
            // Check for relative imports that might be broken
            if (importLine.includes('../') && importLine.includes('components')) {
              debugLog('general', 'log_statement', `⚠️  ${filePath}: Potential import issue - ${importLine}`)
              hasIssues = true;
            }
          });

          if (!hasIssues) {
            debugLog('general', 'log_statement', `✅ ${filePath}: No obvious import issues`)
          }
        } catch (error) {
          console.error(`❌ Error reading ${filePath}:`, error.message);
        }
      }
    });
  },
};

// Main execution
debugLog('general', 'log_statement', '🔧 Starting EVA AI Interface Fixes...\n')

// Run all fixes
fixes.fixDuplicateAIAssistantRendering();
const allComponentsExist = fixes.checkEVAComponents();
fixes.createMissingComponents();
const navConfigOk = fixes.verifyNavigationConfig();
const routeConfigOk = fixes.verifyRouteConfig();
fixes.checkImportErrors();
fixes.createTestScript();

debugLog('general', 'log_statement', '\n✅ EVA AI Interface fixes completed!')

// Summary
debugLog('general', 'log_statement', '\n📋 Summary:')
debugLog('general', 'log_statement', `- Components exist: ${allComponentsExist ? '✅' : '❌'}`)
debugLog('general', 'log_statement', `- Navigation config: ${navConfigOk ? '✅' : '❌'}`)
debugLog('general', 'log_statement', `- Route config: ${routeConfigOk ? '✅' : '❌'}`)

if (allComponentsExist && navConfigOk && routeConfigOk) {
  debugLog('general', 'log_statement', '\n🎉 EVA AI Interface should now be working!')
  debugLog('general', 'log_statement', '\n🚀 Next steps:')
  debugLog('general', 'log_statement', '1. Restart your development server if needed')
  debugLog('general', 'log_statement', '2. Navigate to /ai-assistant in your browser')
  debugLog('general', 'log_statement', '3. Look for the EVA widget button (🧠 icon)');
  debugLog('general', 'log_statement', '4. Run eva-ai-test.js in browser console for testing')
} else {
  debugLog('general', 'log_statement', '\n⚠️  Some issues remain. Please check the errors above.')
}

module.exports = fixes;
