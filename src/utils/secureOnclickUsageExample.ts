/**
 * Usage examples for the secure onclick handler utility
 * Shows how to replace dangerous eval() calls with safe alternatives
 */

import React from 'react';
import { executeOnclickSafely } from './secureOnclickHandler';

import { debugLog } from './auditLogger';

// ❌ DANGEROUS: Using eval() - NEVER DO THIS
// eval(onclick); // This is vulnerable to XSS attacks

// ✅ SAFE: Using the secure onclick handler
export const handleOnclickSafely = async (onclick: string) => {
  const result = await executeOnclickSafely(onclick);

  if (result.success) {
    debugLog('general', 'log_statement', `✅ Successfully executed onclick via ${result.method} method`)
    return true;
  } else {
    console.error(`❌ Failed to execute onclick: ${result.error}`);
    return false;
  }
};

// Example usage in React components:
export const ExampleComponent: React.FC = () => {
  const handleButtonClick = async (onclickString: string) => {
    // Instead of: eval(onclickString) ❌
    const success = await handleOnclickSafely(onclickString); // ✅

    if (!success) {
      console.warn('Onclick handler failed to execute safely');
    }
  };

  return React.createElement('div', {}, [
    React.createElement(
      'button',
      {
        key: 'nav-button',
        onClick: () => handleButtonClick("navigateToPage('home')"),
      },
      'Safe Navigation'
    ),
    React.createElement(
      'button',
      {
        key: 'modal-button',
        onClick: () => handleButtonClick("showModal('confirmation', true)"),
      },
      'Safe Modal'
    ),
  ]);
};

// Example usage scenarios:

// Scenario 1: Simple function calls
// executeOnclickSafely("refreshPage()")
// → Safely executes window.refreshPage()

// Scenario 2: Function calls with parameters
// executeOnclickSafely("navigateTo('dashboard', true)")
// → Safely executes window.navigateTo('dashboard', true)

// Scenario 3: Complex parameters
// executeOnclickSafely("updateSettings({theme: 'dark', lang: 'en'})")
// → Safely parses and executes the function call

// Scenario 4: Fallback to DOM method
// executeOnclickSafely("someComplexFunction()")
// → If parsing fails, tries DOM-based execution

export default handleOnclickSafely;
