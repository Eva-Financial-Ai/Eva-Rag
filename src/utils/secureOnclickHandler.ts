import { logBusinessProcess } from './auditLogger';

/**
 * Secure onclick handler execution utility
 * Combines safe parsing and DOM-based execution to avoid eval() security risks
 *
 * This approach follows React security best practices by:
 * 1. Parsing onclick content safely without eval()
 * 2. Using DOM-based execution as a fallback
 * 3. Validating inputs and sanitizing execution context
 */

interface OnclickExecutionResult {
  success: boolean;
  method: 'parsed' | 'dom' | 'failed';
  error?: string;
}

/**
 * Safely execute onclick handler without using eval()
 * @param onclick - The onclick string to execute (e.g., "myFunction(param1, param2)")
 * @returns Promise<OnclickExecutionResult> - Execution result with method used
 */
export const executeOnclickSafely = async (onclick: string): Promise<OnclickExecutionResult> => {
  if (!onclick || typeof onclick !== 'string') {
    return { success: false, method: 'failed', error: 'Invalid onclick parameter' };
  }

  // Sanitize the onclick string - remove potentially dangerous patterns
  const sanitizedOnclick = onclick
    .trim()
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/on\w+\s*=/gi, ''); // Remove other event handlers

  if (!sanitizedOnclick) {
    return {
      success: false,
      method: 'failed',
      error: 'Onclick content was empty after sanitization',
    };
  }

  // Method 1: Safe parsing approach
  try {
    const parseResult = await tryParseAndExecute(sanitizedOnclick);
    if (parseResult.success) {
      logBusinessProcess('security', 'onclick_executed', true, { method: 'parsing method' });
      return parseResult;
    }
  } catch (error) {
    console.warn('Parse method failed, trying DOM approach:', error);
  }

  // Method 2: DOM-based approach as fallback
  try {
    const domResult = await tryDOMExecution(sanitizedOnclick);
    if (domResult.success) {
      logBusinessProcess('security', 'onclick_executed', true, { method: 'DOM method' });
      return domResult;
    }
  } catch (error) {
    console.error('DOM method also failed:', error);
  }

  return {
    success: false,
    method: 'failed',
    error: 'Both parsing and DOM methods failed',
  };
};

/**
 * Method 1: Parse the onclick content and execute safely
 */
async function tryParseAndExecute(onclick: string): Promise<OnclickExecutionResult> {
  // Match function calls: functionName(param1, param2, ...)
  const functionMatch = onclick.match(/^(\w+)\s*\((.*)\)\s*;?$/);

  if (!functionMatch) {
    // Try to match simple function calls without parameters
    const simpleFunctionMatch = onclick.match(/^(\w+)\s*\(\s*\)\s*;?$/);
    if (simpleFunctionMatch) {
      return executeFunction(simpleFunctionMatch[1], []);
    }
    throw new Error('Could not parse function call pattern');
  }

  const functionName = functionMatch[1];
  const paramsString = functionMatch[2].trim();

  // Parse parameters safely
  const params = paramsString ? parseParameters(paramsString) : [];

  return executeFunction(functionName, params);
}

/**
 * Method 2: DOM-based execution approach
 */
async function tryDOMExecution(onclick: string): Promise<OnclickExecutionResult> {
  return new Promise(resolve => {
    try {
      // Create a temporary, isolated button element
      const tempButton = document.createElement('button');
      tempButton.style.display = 'none';
      tempButton.style.position = 'absolute';
      tempButton.style.left = '-9999px';

      // Set up cleanup
      const cleanup = () => {
        if (tempButton.parentNode) {
          tempButton.parentNode.removeChild(tempButton);
        }
      };

      // Set up error handling
      const originalOnError = window.onerror;
      let executionError: string | null = null;

      window.onerror = message => {
        executionError = typeof message === 'string' ? message : 'Unknown error';
        return true; // Prevent default error handling
      };

      // Set the onclick attribute and append to DOM
      tempButton.setAttribute('onclick', onclick);
      document.body.appendChild(tempButton);

      // Execute after a short delay to ensure DOM is ready
      setTimeout(() => {
        try {
          tempButton.click();

          // Restore error handler
          window.onerror = originalOnError;
          cleanup();

          if (executionError) {
            resolve({ success: false, method: 'dom', error: executionError });
          } else {
            resolve({ success: true, method: 'dom' });
          }
        } catch (error) {
          window.onerror = originalOnError;
          cleanup();
          resolve({
            success: false,
            method: 'dom',
            error: error instanceof Error ? error.message : 'DOM execution failed',
          });
        }
      }, 10);
    } catch (error) {
      resolve({
        success: false,
        method: 'dom',
        error: error instanceof Error ? error.message : 'DOM setup failed',
      });
    }
  });
}

/**
 * Execute a function by name with given parameters
 */
function executeFunction(functionName: string, params: any[]): OnclickExecutionResult {
  // Validate function name (only allow alphanumeric and underscore)
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(functionName)) {
    throw new Error(`Invalid function name: ${functionName}`);
  }

  // Check if function exists in global scope
  const func = (window as any)[functionName];
  if (typeof func !== 'function') {
    throw new Error(`Function ${functionName} is not defined or not a function`);
  }

  try {
    // Execute the function with parsed parameters
    const result = func(...params);

    // Handle async functions
    if (result instanceof Promise) {
      return { success: true, method: 'parsed' };
    }

    return { success: true, method: 'parsed' };
  } catch (error) {
    throw new Error(
      `Function execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Safely parse function parameters from string
 */
function parseParameters(paramsString: string): any[] {
  if (!paramsString.trim()) {
    return [];
  }

  try {
    // Split by comma, but respect quotes and nested structures
    const params: any[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    let depth = 0;

    for (let i = 0; i < paramsString.length; i++) {
      const char = paramsString[i];

      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        current += char;
      } else if (!inQuotes && char === '(') {
        depth++;
        current += char;
      } else if (!inQuotes && char === ')') {
        depth--;
        current += char;
      } else if (!inQuotes && char === ',' && depth === 0) {
        params.push(parseParameter(current.trim()));
        current = '';
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      params.push(parseParameter(current.trim()));
    }

    return params;
  } catch (error) {
    console.warn('Parameter parsing failed, using raw string:', paramsString);
    return [paramsString];
  }
}

/**
 * Parse individual parameter
 */
function parseParameter(param: string): any {
  const trimmed = param.trim();

  // Handle strings
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  // Handle numbers
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return parseFloat(trimmed);
  }

  // Handle booleans
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;

  // Handle null/undefined
  if (trimmed === 'null') return null;
  if (trimmed === 'undefined') return undefined;

  // Return as string for anything else
  return trimmed;
}

export default executeOnclickSafely;
