import { debugLog } from '../utils/auditLogger';

// EVA AI Interface Test Script
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
window.testEVAAI = testEVAAI;